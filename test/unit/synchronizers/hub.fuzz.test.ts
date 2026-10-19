import {EventEmitter} from 'events';
import type {Id, MergeableChanges, MergeableStore} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import {createCustomPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import type {Random, Trace} from '../common/fuzz.ts';
import {check, code, expectSame, forEachSeed} from '../common/fuzz.ts';

// Seeded fuzz tests of a WsServer that authorizes its clients, and so is the
// hub that they all synchronize with. Staff may write anything, but customers
// may only write orders, and no Values at all. The clients make random changes
// over a simulated network that delays messages, delivers those of different
// connections in any order, and drops those of a connection that closes. A
// client's WebSocket reconnects in place, as a ReconnectingWebSocket does, and
// the client then loads and saves, as the guides tell it to.
//
// Once every client is online and the network is quiet, every client must have
// the server's content, and the server's content must be what a MergeableStore
// gets by merging every change that a client was allowed to make. A staff
// client, which is never refused, must also have the server's stamps.
//
//   FUZZ_RUNS=500 npx vitest run --project unit-synchronizers \
//     test/unit/synchronizers/hub.fuzz.test.ts

const RUNS = 20;
const STEPS = 60;
// A longer hunt needs longer than a test is otherwise allowed.
const TIMEOUT = 20000 + Number(process.env.FUZZ_RUNS ?? 0) * 1000;
const REQUEST_TIMEOUT_SECONDS = 0.5;
const MAX_PACKETS_IN_ROUND = 1000;
const MAX_ROUNDS_TO_SETTLE = 20;
const TICK = 50;
const QUIET_MS = REQUEST_TIMEOUT_SECONDS * 2000 + 100;
const MAX_TICKS_TO_SETTLE = 2000;
const START_TIME = Date.UTC(2026, 0, 1);

// The clocks of the clients and the server disagree, but by less than the
// five minutes beyond which a MergeableStore refuses what another has stamped.
const SERVER_CLOCK_OFFSET = 30000;
const CLIENTS: readonly (readonly [Id, 'staff' | 'customer', number])[] = [
  ['alice', 'staff', 0],
  ['bob', 'staff', 60000],
  ['carol', 'customer', -90000],
  ['dave', 'customer', 120000],
];

const TABLE_IDS = ['pets', 'orders'];
const ROW_IDS = ['fido', 'felix', 'cujo'];
const CELL_IDS = ['species', 'price', 'tags'];
const VALUE_IDS = ['open', 'employees'];
const THINGS = ['dog', 'cat', 1, 2, true, false, null, ['a', 'b'], {legs: 4}];

const canWrite = (role: string, tableId?: Id): boolean =>
  role == 'staff' || tableId == 'orders';

type Packet = [connection: number, toServer: boolean, payload: string];

type Client = {
  readonly clientId: Id;
  readonly role: string;
  readonly store: MergeableStore;
  readonly socket: ReturnType<typeof createClientSocket>;
  synchronizer?: Synchronizer;
  connection?: number;
};

// The side of a WebSocket that a client holds. Like a ReconnectingWebSocket,
// it is one object across every connection that it makes.
const createClientSocket = (send: (payload: string) => void) => {
  const listeners: {[event: string]: ((event: any) => void)[]} = {};
  const socket = {
    OPEN: 1,
    CLOSED: 3,
    readyState: 1,
    bufferedAmount: 0,
    addEventListener: (event: string, listener: (event: any) => void) =>
      (listeners[event] ??= []).push(listener),
    removeEventListener: (event: string, listener: (event: any) => void) =>
      (listeners[event] = (listeners[event] ?? []).filter(
        (otherListener) => otherListener != listener,
      )),
    send: (payload: string) => (socket.readyState == 1 ? send(payload) : 0),
    close: () => {},
    dispatch: (event: string, arg: any = {}) =>
      [...(listeners[event] ?? [])].forEach((listener) => listener(arg)),
  };
  return socket;
};

const getWrite = (random: Random): [method: string, ...args: unknown[]] => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS);
  const cellId = random.pick(CELL_IDS);
  const valueId = random.pick(VALUE_IDS);
  const getRow = () =>
    Object.fromEntries(
      random
        .shuffle(CELL_IDS)
        .slice(0, 1 + random.int(CELL_IDS.length))
        .map((cellId) => [cellId, random.pick(THINGS)]),
    );
  return random.weighted<() => [method: string, ...args: unknown[]]>([
    [8, () => ['setCell', tableId, rowId, cellId, random.pick(THINGS)]],
    [3, () => ['setRow', tableId, rowId, getRow()]],
    [2, () => ['setPartialRow', tableId, rowId, getRow()]],
    [3, () => ['delCell', tableId, rowId, cellId]],
    [2, () => ['delRow', tableId, rowId]],
    [1, () => ['delTable', tableId]],
    [3, () => ['setValue', valueId, random.pick(THINGS)]],
    [1, () => ['delValue', valueId]],
  ])();
};

// The part of a client's changes that it was allowed to make.
const getPermitted = (
  [[tables, ...tablesHlc], [values, ...valuesHlc]]: MergeableChanges,
  role: string,
): MergeableChanges =>
  [
    [
      Object.fromEntries(
        Object.entries(tables).filter(([tableId]) => canWrite(role, tableId)),
      ),
      ...tablesHlc,
    ],
    [canWrite(role) ? values : {}, ...valuesHlc],
    1,
  ] as any;

const fuzz = async (random: Random, trace: Trace): Promise<void> => {
  vi.setSystemTime(START_TIME);
  const packets: Packet[] = [];
  const serverSockets = new Map<number, EventEmitter & {readyState: number}>();
  const allChanges: [string, MergeableChanges][] = [];
  const clientErrors: string[] = [];
  const serverErrors: string[] = [];
  const working = new Map<string, Promise<unknown>>();
  let nextConnection = 0;

  const work = (label: string, promise: Promise<unknown>): void => {
    working.set(label, promise);
    void promise.finally(() => working.delete(label));
  };

  const serverStore = createMergeableStore(
    'server',
    () => Date.now() + SERVER_CLOCK_OFFSET,
  );
  const webSocketServer = new EventEmitter() as any;
  webSocketServer.close = (callback: () => void) => callback();
  const wsServer = createWsServer(webSocketServer, {
    authorize: (_pathId, request) => ({
      context: {
        role: new URL(request.url as string, 'http://h').searchParams.get('as'),
      },
    }),
    canWriteCell: (_pathId, tableId, _rowId, _cellId, _cell, context) =>
      canWrite(context?.role, tableId),
    canWriteValue: (_pathId, _valueId, _value, context) =>
      canWrite(context?.role),
    createPersisterForPath: () =>
      createCustomPersister(
        serverStore,
        async () => undefined,
        async () => {},
        () => 0,
        () => {},
        undefined,
        2,
      ),
    onIgnoredError: (error) => serverErrors.push(error.message),
    requestTimeoutSeconds: REQUEST_TIMEOUT_SECONDS,
  });

  const clients: Client[] = CLIENTS.map(([clientId, role, clockOffset]) => {
    const store = createMergeableStore(
      clientId,
      () => Date.now() + clockOffset,
    );
    store.addDidFinishTransactionListener(() =>
      allChanges.push([
        role,
        structuredClone(store.getTransactionMergeableChanges()),
      ]),
    );
    const client: Client = {
      clientId,
      role,
      store,
      socket: createClientSocket((payload) =>
        packets.push([client.connection as number, true, payload]),
      ),
    };
    return client;
  });

  // Opens a new connection to the server, with a new WebSocket key, as a
  // reconnecting WebSocket does each time.
  const connect = (client: Client): void => {
    const connection = nextConnection++;
    const serverSocket = Object.assign(new EventEmitter(), {
      OPEN: 1,
      CLOSED: 3,
      readyState: 1,
      bufferedAmount: 0,
      protocol: '',
      send: (payload: string) =>
        serverSocket.readyState == 1
          ? packets.push([connection, false, payload])
          : 0,
      close: () => disconnect(client),
    });
    serverSockets.set(connection, serverSocket);
    client.connection = connection;
    client.socket.readyState = 1;
    webSocketServer.emit('connection', serverSocket, {
      headers: {'sec-websocket-key': `${client.clientId}${connection}`},
      url: `/shop?as=${client.role}`,
    });
  };

  const disconnect = (client: Client): void => {
    const connection = client.connection;
    if (connection !== undefined) {
      client.connection = undefined;
      for (let index = packets.length - 1; index >= 0; index--) {
        if (packets[index][0] == connection) {
          packets.splice(index, 1);
        }
      }
      const serverSocket = serverSockets.get(connection);
      serverSockets.delete(connection);
      client.socket.readyState = 3;
      client.socket.dispatch('close');
      if (serverSocket) {
        serverSocket.readyState = 3;
        serverSocket.emit('close');
      }
    }
  };

  // Delivers some of the packets that are waiting. Those of one connection,
  // in one direction, arrive in the order they were sent, but connections are
  // served in any.
  const deliver = async (count: number): Promise<void> => {
    for (let delivered = 0; delivered < count && packets.length > 0;) {
      const [connection, toServer] = random.pick(packets);
      const index = packets.findIndex(
        (packet) => packet[0] == connection && packet[1] == toServer,
      );
      const [[, , payload]] = packets.splice(index, 1);
      if (toServer) {
        serverSockets.get(connection)?.emit('message', payload);
      } else {
        clients
          .find((client) => client.connection == connection)
          ?.socket.dispatch('message', {data: payload});
      }
      delivered++;
      await vi.advanceTimersByTimeAsync(1);
    }
  };

  // Lets time pass on a network that works, which delivers what is sent
  // within a tick.
  const pass = async (ms: number): Promise<void> => {
    for (let passed = 0; passed < ms; passed += TICK) {
      await deliver(MAX_PACKETS_IN_ROUND);
      await vi.advanceTimersByTimeAsync(Math.min(TICK, ms - passed));
    }
    await deliver(MAX_PACKETS_IN_ROUND);
  };

  // Lets time pass until nothing has been sent for long enough that every
  // request has been answered or has timed out.
  const settle = async (): Promise<void> => {
    for (let quiet = 0, ticks = 0; quiet < QUIET_MS; ticks++) {
      if (ticks == MAX_TICKS_TO_SETTLE) {
        throw new Error('The network never settles');
      }
      const sent = packets.length;
      await pass(TICK);
      quiet = sent == 0 && packets.length == 0 ? quiet + TICK : 0;
    }
  };

  // Waits for something that might itself be waiting for the network, or for
  // a request to time out. Time only passes here when it is made to.
  const complete = async (promise: Promise<unknown>): Promise<void> => {
    let completed = false;
    void promise.finally(() => (completed = true));
    for (let rounds = 0; !completed; rounds++) {
      if (rounds == MAX_ROUNDS_TO_SETTLE) {
        throw new Error('Never completes: ' + [...working.keys()].join(', '));
      }
      await settle();
    }
    await promise;
  };

  for (const client of clients) {
    trace(`${client.clientId} connects and starts synchronizing`);
    connect(client);
    const synchronizer = await createWsSynchronizer(
      client.store,
      client.socket as any,
      REQUEST_TIMEOUT_SECONDS,
      undefined,
      undefined,
      (error) => clientErrors.push(error.message),
    );
    client.synchronizer = synchronizer;
    client.socket.addEventListener('open', () =>
      work(
        `${client.clientId} loading and saving ${client.connection}`,
        synchronizer.load().then(() => synchronizer.save()),
      ),
    );
    work(`${client.clientId} starting`, synchronizer.startSync());
  }
  await complete(Promise.all(working.values()));

  const goOnline = (client: Client): void => {
    trace(`${client.clientId} reconnects, and loads and then saves`);
    connect(client);
    client.socket.dispatch('open');
  };

  for (let step = 0; step < STEPS; step++) {
    const client = random.pick(clients);
    await random.weighted<() => unknown>([
      [
        10,
        () => {
          const [method, ...args] = getWrite(random);
          trace(`${client.clientId}.${method}(${args.map(code).join(', ')});`);
          (client.store as any)[method](...structuredClone(args));
        },
      ],
      [
        6,
        () => {
          const count = 1 + random.int(6);
          trace(`the network delivers up to ${count} packets`);
          return deliver(count);
        },
      ],
      [
        1,
        () => {
          if (client.connection === undefined) {
            goOnline(client);
          } else {
            trace(`${client.clientId} disconnects`);
            disconnect(client);
          }
        },
      ],
      [
        1,
        () => {
          trace('the network settles');
          return settle();
        },
      ],
      [
        2,
        () => {
          const ms = random.pick([1, 10, 1000, 60000]);
          trace(`${ms}ms pass`);
          return pass(ms);
        },
      ],
    ])();
  }

  await settle();
  clients.filter((client) => client.connection === undefined).forEach(goOnline);
  await complete(Promise.all(working.values()));
  await settle();

  clients.forEach(({clientId, role, store}) => {
    expectSame(
      store.getContent(),
      serverStore.getContent(),
      `content of ${clientId} and the server`,
    );
    if (role == 'staff') {
      expectSame(
        store.getMergeableContent(),
        serverStore.getMergeableContent(),
        `stamps of ${clientId} and the server`,
      );
    }
  });

  const merged = createMergeableStore('merged', () => Date.now() + 240000);
  random
    .shuffle(allChanges)
    .forEach(([role, changes]) =>
      merged.applyMergeableChanges(getPermitted(changes, role)),
    );
  expectSame(
    serverStore.getContent(),
    merged.getContent(),
    'content of the server and of every permitted change merged',
  );

  // The only things to go wrong are requests that are never answered, and
  // connections that close.
  check(() =>
    expect(
      [...clientErrors, ...serverErrors].filter(
        (error) => !error.startsWith('tinybase:3:') && error != 'tinybase:5',
      ),
    ).toEqual([]),
  );

  await complete(
    Promise.all(clients.map(({synchronizer}) => synchronizer?.destroy())),
  );
  await wsServer.destroy();
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test(
  'clients converge on the server, which has every permitted change',
  async () => {
    await forEachSeed(RUNS, fuzz);
  },
  TIMEOUT,
);
