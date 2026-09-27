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
// common synchronization scenarios. They are deterministic - every Store has a
// fixed unique Id and a mocked clock - so the snapshots record the protocol's
// cost, and a change in them is a change in that cost.

type Traffic = {[direction: string]: {[message: string]: number}};

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
  const wsServer = createWsServer(
    webSocketServer,
    mode == 'hub'
      ? {createPersisterForPath, authorize: () => ({})}
      : createPersisterForPath,
  );

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
      expect(traffic).toMatchSnapshot();
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
      expect(traffic).toMatchSnapshot();
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
    expect(traffic).toMatchSnapshot();
    await room.destroy();
  });
});
