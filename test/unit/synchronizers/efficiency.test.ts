import type {MergeableStore, Tables} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import {createCustomPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {Message} from 'tinybase/synchronizers';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {beforeEach, describe, expect, test} from 'vitest';
import {WebSocket} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';
import {pause} from '../common/other.ts';
import {createTestWebSocketServer} from '../common/websocket.ts';

// These tests count the messages and bytes that cross the WebSocket server in
// common synchronization scenarios, and hold each scenario to a budget. The
// budgets are set a little above what was last measured, since the order in
// which two peers pull from each other can vary slightly from run to run. When
// the protocol gets cheaper, lower them; they are the record of its cost.

type Traffic = {[direction: string]: {[message: string]: number}};

const BUDGETS: {[scenario: string]: [messages: number, bytes: number]} = {
  'relay: joining a room of 1 client(s) with 1,000 rows': [13, 81_900],
  'relay: joining a room of 5 client(s) with 1,000 rows': [24, 82_700],
  'relay: joining a room of 20 client(s) with 1,000 rows': [84, 86_300],
  'relay: reconnecting after 1 change(s) to 10,000 rows': [21, 8_300],
  'relay: reconnecting after 100 change(s) to 10,000 rows': [21, 170_700],
  'relay: a burst of 100 writes in a room of 5 clients': [502, 53_100],
  'hub: joining a room of 1 client(s) with 1,000 rows': [13, 81_900],
  'hub: joining a room of 5 client(s) with 1,000 rows': [8, 81_700],
  'hub: joining a room of 20 client(s) with 1,000 rows': [8, 81_700],
  'hub: reconnecting after 1 change(s) to 10,000 rows': [21, 8_300],
  'hub: reconnecting after 100 change(s) to 10,000 rows': [21, 170_700],
  'hub: a burst of 100 writes in a room of 5 clients': [502, 43_800],
};

const expectWithinBudget = (traffic: Traffic) => {
  const scenario = expect.getState().currentTestName!.replace(' > ', ': ');
  const [messages, bytes] = Object.values(traffic).reduce(
    ([messages, bytes], {bytes: directionBytes, ...counts}) => [
      messages + Object.values(counts).reduce((sum, count) => sum + count, 0),
      bytes + directionBytes,
    ],
    [0, 0],
  );
  if (process.env.MEASURE) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify([scenario, messages, bytes]));
  }
  const [maxMessages, maxBytes] = BUDGETS[scenario];
  expect(messages).toBeLessThanOrEqual(maxMessages);
  expect(bytes).toBeLessThanOrEqual(maxBytes);
};

const [reset, getNow] = getTimeFunctions();

const MESSAGE_NAMES: {[message: number]: string} = {
  [Message.Response]: 'Response',
  [Message.GetContentHashes]: 'GetContentHashes',
  [Message.ContentHashes]: 'ContentHashes',
  [Message.ContentDiff]: 'ContentDiff',
  [Message.GetTableDiff]: 'GetTableDiff',
  [Message.GetRowDiff]: 'GetRowDiff',
  [Message.GetCellDiff]: 'GetCellDiff',
  [Message.GetValueDiff]: 'GetValueDiff',
};

const QUIET_MS = 150;
const SETTLE_TIMEOUT_MS = 20_000;

const createMemoryPersister = (store: MergeableStore) =>
  createCustomPersister(
    store,
    async () => undefined,
    async () => {},
    () => 0,
    () => {},
    undefined,
    2,
  );

const getRows = (count: number, offset = 0): Tables[string] =>
  Object.fromEntries(
    Array.from({length: count}, (_, row) => [
      'pet' + (row + offset),
      {species: 'dog', legs: 4},
    ]),
  );

const recordPayload = (
  traffic: Traffic,
  direction: 'in' | 'out',
  payload: string,
) => {
  const counts = (traffic[direction] ??= {});
  let name = 'Fragment';
  try {
    const message = JSON.parse(payload.slice(payload.indexOf('\n') + 1));
    name = MESSAGE_NAMES[message[1]] ?? 'Other';
  } catch {}
  counts[name] = (counts[name] ?? 0) + 1;
  counts.bytes = (counts.bytes ?? 0) + Buffer.byteLength(payload);
};

// A relay server lets clients answer each other; a hub server - one that
// authorizes its clients - makes its own MergeableStore their only peer.
const MODES = ['relay', 'hub'] as const;
type Mode = (typeof MODES)[number];

const createRoom = async (mode: Mode, serverRows: number) => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  let traffic: Traffic = {};
  let lastTraffic = 0;

  webSocketServer.on('connection', (client) => {
    client.on('message', (data) => {
      lastTraffic = Date.now();
      recordPayload(traffic, 'in', data.toString());
    });
    const send = client.send.bind(client);
    client.send = ((payload: string, ...args: any[]) => {
      lastTraffic = Date.now();
      recordPayload(traffic, 'out', payload);
      return (send as any)(payload, ...args);
    }) as any;
  });

  const serverStore = createMergeableStore('server', getNow);
  serverStore.setTable('pets', getRows(serverRows));
  // The pause stands in for loading the path's data, and makes sure that a
  // joining client has started synchronizing before the server's store asks
  // it for its content hashes, which it otherwise races.
  const createPersisterForPath = async () => {
    await pause(100);
    return createMemoryPersister(serverStore);
  };
  const wsServer = createWsServer(webSocketServer, {
    createPersisterForPath,
    authorize: mode == 'hub' ? () => ({}) : undefined,
  });

  const synchronizers: Synchronizer[] = [];

  const addClient = async (
    store: MergeableStore = createMergeableStore(
      'client' + synchronizers.length,
      getNow,
    ),
  ): Promise<[MergeableStore, Synchronizer]> => {
    const synchronizer = await createWsSynchronizer(
      store,
      new WebSocket(`ws://localhost:${port}/room`),
      5,
    );
    synchronizers.push(synchronizer);
    await synchronizer.startSync();
    return [store, synchronizer];
  };

  const settle = async () => {
    const start = Date.now();
    lastTraffic = Date.now();
    while (Date.now() - lastTraffic < QUIET_MS) {
      if (Date.now() - start > SETTLE_TIMEOUT_MS) {
        throw new Error('Synchronization did not settle');
      }
      await pause(25);
    }
  };

  const measure = async (action: () => Promise<unknown> | unknown) => {
    await settle();
    traffic = {};
    await action();
    await settle();
    return traffic;
  };

  const destroy = async () => {
    for (const synchronizer of synchronizers) {
      await synchronizer.destroy();
    }
    await wsServer.destroy();
  };

  return {serverStore, addClient, measure, destroy};
};

beforeEach(() => {
  reset();
});

describe.each(MODES)('%s', (mode) => {
  test.each([1, 5, 20])(
    'joining a room of %i client(s) with 1,000 rows',
    async (roomSize) => {
      const room = await createRoom(mode, 1_000);
      for (let client = 1; client < roomSize; client++) {
        await room.addClient();
      }

      let joiner: MergeableStore | undefined;
      const traffic = await room.measure(async () => {
        [joiner] = await room.addClient();
      });

      expect(joiner!.getTables()).toEqual(room.serverStore.getTables());
      expectWithinBudget(traffic);
      await room.destroy();
    },
  );

  test.each([1, 100])(
    'reconnecting after %i change(s) to 10,000 rows',
    async (changes) => {
      const room = await createRoom(mode, 10_000);
      const [store, synchronizer] = await room.addClient();
      await room.measure(() => 0);
      await synchronizer.destroy();

      room.serverStore.transaction(() => {
        for (let change = 0; change < changes; change++) {
          room.serverStore.setCell('pets', 'pet' + change * 97, 'legs', 3);
        }
      });

      const traffic = await room.measure(() => room.addClient(store));

      expect(store.getTables()).toEqual(room.serverStore.getTables());
      expectWithinBudget(traffic);
      await room.destroy();
    },
  );

  test('a burst of 100 writes in a room of 5 clients', async () => {
    const room = await createRoom(mode, 100);
    const [writer] = await room.addClient();
    const stores = [writer];
    for (let client = 1; client < 5; client++) {
      stores.push((await room.addClient())[0]);
    }

    const traffic = await room.measure(() => {
      for (let write = 0; write < 100; write++) {
        writer.setCell('pets', 'pet' + write, 'legs', 3);
      }
    });

    stores.forEach((store) =>
      expect(store.getTables()).toEqual(room.serverStore.getTables()),
    );
    expectWithinBudget(traffic);
    await room.destroy();
  });
});

test.each(MODES)(
  '%s: a first client is served without waiting for a timeout',
  async (mode) => {
    const [webSocketServer, port] = await createTestWebSocketServer();
    const serverStore = createMergeableStore('server', getNow);
    serverStore.setTable('pets', getRows(10));
    const createPersisterForPath = () => createMemoryPersister(serverStore);
    const wsServer = createWsServer(webSocketServer, {
      createPersisterForPath,
      authorize: mode == 'hub' ? () => ({}) : undefined,
    });
    const store = createMergeableStore('client', getNow);
    const synchronizer = await createWsSynchronizer(
      store,
      new WebSocket(`ws://localhost:${port}/room`),
      5,
    );

    const start = Date.now();
    await synchronizer.startSync();
    expect(Date.now() - start).toBeLessThan(500);
    expect(store.getTables()).toEqual(serverStore.getTables());

    await synchronizer.destroy();
    await wsServer.destroy();
  },
);
