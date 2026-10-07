import type {Id, MergeableStore} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import type {ClientAccess} from 'tinybase/synchronizers/synchronizer-ws-server';
import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';
import {getTimeFunctions} from '../common/mergeable.ts';

const [reset, getNow, pause] = getTimeFunctions();

// The Durable Object's side of a WebSocket, which delivers what it sends to the
// client's side once the two are linked.
class MockServerSocket {
  peer?: MockClientSocket;
  queue: string[] = [];
  attachment: any;

  send(payload: string) {
    if (this.peer) {
      this.peer.receive(payload);
    } else {
      this.queue.push(payload);
    }
  }

  serializeAttachment(attachment: any) {
    this.attachment = structuredClone(attachment);
  }

  deserializeAttachment() {
    return this.attachment;
  }

  close() {}
}

// The client's side of a WebSocket, as used by a WsSynchronizer.
class MockClientSocket {
  OPEN = 1;
  CLOSED = 3;
  readyState = this.OPEN;
  bufferedAmount = 0;
  readonly #listeners: {[event: string]: ((event: any) => void)[]} = {};

  constructor(
    private durableObject: WsServerDurableObject,
    private server: MockServerSocket,
    private removeSocket: () => void,
  ) {}

  addEventListener(event: string, listener: (event: any) => void) {
    (this.#listeners[event] ??= []).push(listener);
  }

  removeEventListener(event: string, listener: (event: any) => void) {
    this.#listeners[event] = (this.#listeners[event] ?? []).filter(
      (other) => other != listener,
    );
  }

  send(payload: string) {
    this.durableObject.webSocketMessage!(this.server as any, payload);
  }

  receive(payload: string) {
    (this.#listeners.message ?? []).forEach((listener) =>
      listener({data: payload}),
    );
  }

  close() {
    if (this.readyState != this.CLOSED) {
      this.readyState = this.CLOSED;
      this.durableObject.webSocketClose!(this.server as any, 1000, '', true);
      this.removeSocket();
      (this.#listeners.close ?? []).forEach((listener) => listener({}));
    }
  }
}

const createState = () => {
  const sockets: [MockServerSocket, Id[]][] = [];
  return {
    sockets,
    acceptWebSocket: (socket: MockServerSocket, tags: Id[]) =>
      sockets.push([socket, tags]),
    getWebSockets: (tag?: Id) =>
      sockets
        .filter(([, tags]) => tag == null || tags.includes(tag))
        .map(([socket]) => socket),
    getTags: (socket: MockServerSocket) =>
      sockets.find(([other]) => other == socket)?.[1] ?? [],
    blockConcurrencyWhile: async (action: () => Promise<void>) =>
      await action(),
  };
};

let nextKey = 0;
let cleanups: (() => Promise<unknown> | unknown)[];
const originalResponse = globalThis.Response;

beforeEach(() => {
  reset();
  cleanups = [];
  (globalThis as any).Response = class {
    status: number;
    body: any;
    constructor(body: any, {status}: {status: number}) {
      this.body = body;
      this.status = status;
    }
  };
  (globalThis as any).WebSocketPair = class {
    constructor() {
      return {0: {}, 1: new MockServerSocket()};
    }
  };
});

afterEach(async () => {
  for (const cleanup of cleanups.reverse()) {
    await cleanup();
  }
  globalThis.Response = originalResponse;
  delete (globalThis as any).WebSocketPair;
});

const createDurableObject = async <DurableObject extends WsServerDurableObject>(
  DurableObjectClass: new (ctx: any, env: any) => DurableObject,
  state = createState(),
): Promise<[DurableObject, ReturnType<typeof createState>]> => {
  const durableObject = new DurableObjectClass(state, {});
  await pause();
  return [durableObject, state];
};

const connect = async (
  durableObject: WsServerDurableObject,
  state: ReturnType<typeof createState>,
  url: string,
  key: string | null = 'key' + nextKey++,
  upgrade: string | null = 'websocket',
): Promise<[status: number, socket?: MockClientSocket]> => {
  const request = {
    url,
    headers: {
      get: (name: string) =>
        name == 'upgrade' ? upgrade : name == 'sec-websocket-key' ? key : null,
    },
  };
  const response = await durableObject.fetch!(request as any);
  if (response.status != 101) {
    return [response.status];
  }
  const [server] = state.sockets.at(-1)!;
  const client = new MockClientSocket(durableObject, server, () =>
    state.sockets.splice(
      state.sockets.findIndex(([other]) => other == server),
      1,
    ),
  );
  server.peer = client;
  cleanups.push(() => client.close());
  return [101, client];
};

const openClient = async (
  durableObject: WsServerDurableObject,
  state: ReturnType<typeof createState>,
  url: string,
  store: MergeableStore = createMergeableStore(undefined, getNow),
): Promise<[MergeableStore, Synchronizer]> => {
  const [, socket] = await connect(durableObject, state, url);
  const synchronizer = await createWsSynchronizer(store, socket as any, 1);
  cleanups.push(() => synchronizer.destroy());
  const server = state.sockets.find(([other]) => other.peer == socket)![0];
  server.queue.forEach((payload) => socket!.receive(payload));
  await synchronizer.startSync();
  await pause();
  return [store, synchronizer];
};

const getRole = (request: {url: string}) =>
  new URL(request.url).searchParams.get('role');

const ROLES: {[role: string]: ClientAccess} = {
  staff: {context: {role: 'staff'}},
  customer: {context: {role: 'customer'}},
  viewer: {readOnly: true},
};

class RelayDurableObject extends WsServerDurableObject {}

class HubDurableObject extends WsServerDurableObject {
  errors: string[] = [];

  onIgnoredError(error: any) {
    this.errors.push(error.message);
  }

  authorize(_pathId: Id, request: any) {
    if (getRole(request) == 'broken') {
      throw new Error('broken');
    }
    return ROLES[getRole(request) ?? ''];
  }

  canWriteCell(
    _pathId: Id,
    tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _cell: any,
    context: any,
  ) {
    return context?.role == 'staff' || tableId == 'orders';
  }

  canWriteValue(_pathId: Id, valueId: Id, _value: any, context: any) {
    return context?.role == 'staff' || valueId == 'lastVisit';
  }
}

class AsyncHubDurableObject extends WsServerDurableObject {
  async authorize(_pathId: Id, request: any) {
    await pause(10);
    return ROLES[getRole(request) ?? ''];
  }
}

const URL_BASE = 'https://example.com/shop';

test('relays between clients without authorization', async () => {
  const [durableObject, state] = await createDurableObject(RelayDurableObject);
  const [store1] = await openClient(durableObject, state, URL_BASE);
  const [store2] = await openClient(durableObject, state, URL_BASE);
  store1.setCell('pets', 'fido', 'species', 'dog');
  await pause();
  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  expect(durableObject.getClientIds()).toEqual(['key0', 'key1']);
});

describe('authorize', () => {
  test('refused clients receive a 403', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    expect(await connect(durableObject, state, URL_BASE)).toEqual([403]);
    expect(
      await connect(durableObject, state, URL_BASE + '?role=broken'),
    ).toEqual([403]);
    expect(durableObject.errors).toEqual([
      'tinybase:17:shop',
      'broken',
      'tinybase:17:shop',
    ]);
    expect(state.sockets).toEqual([]);
  });

  test('asynchronous authorization', async () => {
    const [durableObject, state] = await createDurableObject(
      AsyncHubDurableObject,
    );
    const [store1] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    const [store2] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    store1.setCell('pets', 'fido', 'species', 'dog');
    await pause();
    expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  });

  test('read-only clients can read but not write', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    const [staffStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    staffStore.setCell('pets', 'fido', 'species', 'dog');
    const [viewerStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=viewer',
    );
    expect(viewerStore.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

    viewerStore.setCell('pets', 'fido', 'species', 'cat');
    await pause();
    expect(staffStore.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
    expect(viewerStore.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  });
});

describe('canWriteCell and canWriteValue', () => {
  test('only permitted cells and values are merged and relayed', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    const [staffStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    staffStore.setCell('pets', 'fido', 'price', 5).setValue('open', true);
    const [customerStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=customer',
    );

    customerStore.transaction(() =>
      customerStore
        .setCell('pets', 'fido', 'price', 1)
        .setCell('orders', 'order1', 'pet', 'fido')
        .setValue('open', false)
        .setValue('lastVisit', 'today'),
    );
    await pause();

    const expected = [
      {pets: {fido: {price: 5}}, orders: {order1: {pet: 'fido'}}},
      {open: true, lastVisit: 'today'},
    ];
    expect(staffStore.getContent()).toEqual(expected);
    expect(customerStore.getContent()).toEqual(expected);
  });

  test('access survives hibernation', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    const [staffStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    staffStore.setCell('pets', 'fido', 'price', 5);
    const [customerStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=customer',
    );

    // A new instance wakes with the same hibernated WebSockets, and its
    // in-memory MergeableStore fetches the data back from a client.
    const wokenDurableObject = new HubDurableObject(state as any, {});
    state.sockets.forEach(([server]) => {
      (server.peer as any).durableObject = wokenDurableObject;
    });
    await pause();

    customerStore.setCell('pets', 'fido', 'price', 1);
    await pause();
    expect(customerStore.getTables()).toEqual({pets: {fido: {price: 5}}});
    expect(staffStore.getTables()).toEqual({pets: {fido: {price: 5}}});
  });
});

test('clients cannot reach each other directly', async () => {
  const [durableObject, state] = await createDurableObject(HubDurableObject);
  const [store1] = await openClient(
    durableObject,
    state,
    URL_BASE + '?role=staff',
  );
  const received: string[] = [];
  const [, socket] = await connect(
    durableObject,
    state,
    URL_BASE + '?role=staff',
  );
  socket!.addEventListener('message', ({data}) => received.push(data));
  await pause();
  received.length = 0;
  state.sockets[1][0].peer!.send('key0\n["r1",1,""]');
  await pause();
  expect(received).toEqual([]);
  expect(store1.getTables()).toEqual({});
});

describe('client ids', () => {
  test.each([RelayDurableObject, HubDurableObject])(
    'unusable client ids are refused',
    async (DurableObjectClass) => {
      const [durableObject, state] =
        await createDurableObject(DurableObjectClass);
      const url = URL_BASE + '?role=staff';
      for (const key of ['S', 'M', '', 'a\nb']) {
        expect(await connect(durableObject, state, url, key)).toEqual([403]);
      }
      expect(state.sockets).toEqual([]);
    },
  );

  test.each([RelayDurableObject, HubDurableObject])(
    'a client id already in use is refused',
    async (DurableObjectClass) => {
      const [durableObject, state] =
        await createDurableObject(DurableObjectClass);
      const url = URL_BASE + '?role=staff';
      expect((await connect(durableObject, state, url, 'same'))[0]).toBe(101);
      expect(await connect(durableObject, state, url, 'same')).toEqual([403]);
      expect(durableObject.getClientIds()).toEqual(['same']);

      state.sockets[0][0].peer!.close();
      expect((await connect(durableObject, state, url, 'same'))[0]).toBe(101);
    },
  );

  test('requests that are not WebSocket upgrades are turned away', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    const url = URL_BASE + '?role=staff';
    expect(await connect(durableObject, state, url, 'key', null)).toEqual([
      426,
    ]);
    expect(await connect(durableObject, state, url, null)).toEqual([426]);
    expect(state.sockets).toEqual([]);
  });

  test('a client is never taken for the server, whatever its id', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    const [staffStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );

    // Even were a read-only client somehow to hold the server's own id, what
    // it sends is filtered like anything else from a client.
    const impostor = new MockServerSocket();
    impostor.serializeAttachment({readOnly: true});
    state.acceptWebSocket(impostor, ['S', 'shop']);
    durableObject.webSocketMessage!(
      impostor as any,
      '\n["~impostor000",3,[[{}],[{"open":[true,"' + 'Nn1JUF-----7JQY8"]}],1]]',
    );
    await pause();
    expect(staffStore.getValues()).toEqual({});
  });

  test('a client without recorded access can write nothing', async () => {
    const [durableObject, state] = await createDurableObject(HubDurableObject);
    const [staffStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    const [otherStore] = await openClient(
      durableObject,
      state,
      URL_BASE + '?role=staff',
    );
    state.sockets[1][0].attachment = undefined;

    otherStore.setValue('open', true);
    await pause();
    expect(staffStore.getValues()).toEqual({});
  });
});
