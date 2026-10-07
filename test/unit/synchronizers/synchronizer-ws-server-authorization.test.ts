import {EventEmitter, once} from 'events';
import type {IncomingMessage} from 'http';
import type {Id, MergeableStore} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import {createCustomPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import type {
  ClientAccess,
  WsServer,
  WsServerOptions,
} from 'tinybase/synchronizers/synchronizer-ws-server';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {WebSocket} from 'ws';
import {getTimeFunctions} from '../common/mergeable.ts';
import {
  createTestWebSocketServer,
  getTestWebSocketUrl,
} from '../common/websocket.ts';

const [reset, getNow, pause] = getTimeFunctions();

const getRole = (request: IncomingMessage) =>
  new URL(request.url!, 'http://localhost').searchParams.get('role');

const ROLES: {[role: string]: ClientAccess} = {
  staff: {context: {role: 'staff'}},
  customer: {context: {role: 'customer'}},
  viewer: {readOnly: true},
};

const authorizeByRole = (_pathId: Id, request: IncomingMessage) =>
  ROLES[getRole(request) ?? ''];

let cleanups: (() => Promise<unknown> | unknown)[];

beforeEach(() => {
  reset();
  cleanups = [];
});

afterEach(async () => {
  for (const cleanup of cleanups.reverse()) {
    await cleanup();
  }
});

const createServer = async (
  options: WsServerOptions<any>,
): Promise<[WsServer, number]> => {
  const [webSocketServer, port] = await createTestWebSocketServer();
  const wsServer = createWsServer(webSocketServer, options);
  cleanups.push(() => wsServer.destroy());
  return [wsServer, port];
};

const openClient = async (
  port: number,
  path: string,
  store: MergeableStore = createMergeableStore(undefined, getNow),
  onReceive?: (...args: any[]) => void,
): Promise<[MergeableStore, Synchronizer]> => {
  const synchronizer = await createWsSynchronizer(
    store,
    new WebSocket(getTestWebSocketUrl(port, path)),
    1,
    undefined,
    onReceive,
  );
  cleanups.push(() => synchronizer.destroy());
  await synchronizer.startSync();
  return [store, synchronizer];
};

const getClose = async (webSocket: WebSocket): Promise<[number, string]> => {
  const [code, reason] = await once(webSocket, 'close');
  return [code, reason.toString()];
};

describe('options', () => {
  test('the options form behaves like the positional form', async () => {
    const serverStore = createMergeableStore('server', getNow);
    const [, port] = await createServer({
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
    });
    const [store1] = await openClient(port, '/shop');
    const [store2] = await openClient(port, '/shop');
    store1.setCell('pets', 'fido', 'species', 'dog');
    await pause();
    expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
    expect(serverStore.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  });

  test('an undefined options object is the default form', async () => {
    const [webSocketServer, port] = await createTestWebSocketServer();
    const wsServer = createWsServer(webSocketServer, undefined);
    cleanups.push(() => wsServer.destroy());
    const [store1] = await openClient(port, '/shop');
    const [store2] = await openClient(port, '/shop');
    store1.setCell('pets', 'fido', 'species', 'dog');
    await pause();
    expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  });
});

describe('authorize', () => {
  test('refused clients are closed with a policy violation', async () => {
    const errors: string[] = [];
    const authorize = vi.fn(authorizeByRole);
    const [wsServer, port] = await createServer({
      authorize,
      onIgnoredError: (error) => errors.push(error.message),
    });
    const webSocket = new WebSocket(getTestWebSocketUrl(port, '/shop'));
    expect(await getClose(webSocket)).toEqual([1008, 'tinybase:17:shop']);
    expect(errors).toEqual(['tinybase:17:shop']);
    expect(authorize).toHaveBeenCalledWith('shop', expect.anything());
    expect(wsServer.getPathIds()).toEqual([]);
  });

  test('clients are refused if authorize throws', async () => {
    const errors: string[] = [];
    const [, port] = await createServer({
      authorize: () => {
        throw new Error('broken');
      },
      onIgnoredError: (error) => errors.push(error.message),
    });
    const webSocket = new WebSocket(getTestWebSocketUrl(port, '/shop'));
    expect((await getClose(webSocket))[0]).toEqual(1008);
    expect(errors).toEqual(['broken', 'tinybase:17:shop']);
  });

  test('messages are held while authorize resolves', async () => {
    const [wsServer, port] = await createServer({
      authorize: async (pathId, request) => {
        await pause(100);
        return authorizeByRole(pathId, request);
      },
    });
    const store1 = createMergeableStore('s1', getNow);
    store1.setCell('pets', 'fido', 'species', 'dog');
    await openClient(port, '/shop?role=staff', store1);
    const [store2] = await openClient(port, '/shop?role=staff');
    await pause(200);
    expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
    expect(wsServer.getClientIds('shop')).toHaveLength(2);
  });

  test('clients that close while authorize resolves never join', async () => {
    const [wsServer, port] = await createServer({
      authorize: async (pathId, request) => {
        await pause(100);
        return authorizeByRole(pathId, request);
      },
    });
    const webSocket = new WebSocket(
      getTestWebSocketUrl(port, '/shop?role=staff'),
    );
    await once(webSocket, 'open');
    webSocket.send('\n[null,1,""]');
    webSocket.close();
    await pause(200);
    expect(wsServer.getPathIds()).toEqual([]);
  });

  test('too many held messages close the client', async () => {
    const errors: string[] = [];
    const [, port] = await createServer({
      authorize: async (pathId, request) => {
        await pause(200);
        return authorizeByRole(pathId, request);
      },
      onIgnoredError: (error) => errors.push(error.message),
    });
    const webSocket = new WebSocket(
      getTestWebSocketUrl(port, '/shop?role=staff'),
    );
    await once(webSocket, 'open');
    for (let message = 0; message < 1001; message++) {
      webSocket.send('\n[null,1,""]');
    }
    expect((await getClose(webSocket))[0]).toEqual(1013);
    expect(errors).toEqual(['tinybase:15:server']);
  });

  test('read-only clients can read but not write', async () => {
    const [, port] = await createServer({authorize: authorizeByRole});
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'species', 'dog');
    staffStore.setValue('open', true);
    const [viewerStore] = await openClient(port, '/shop?role=viewer');
    await pause();
    expect(viewerStore.getContent()).toEqual([
      {pets: {fido: {species: 'dog'}}},
      {open: true},
    ]);

    viewerStore.setCell('pets', 'fido', 'species', 'cat');
    viewerStore.setCell('pets', 'felix', 'species', 'cat');
    viewerStore.delValue('open');
    await pause();
    expect(staffStore.getContent()).toEqual([
      {pets: {fido: {species: 'dog'}}},
      {open: true},
    ]);
    expect(viewerStore.getContent()).toEqual([
      {pets: {fido: {species: 'dog'}}},
      {open: true},
    ]);
  });

  test('read-only clients with older data cause no corrections', async () => {
    const [, port] = await createServer({authorize: authorizeByRole});
    const viewerStore = createMergeableStore('viewer', getNow);
    viewerStore.setCell('pets', 'fido', 'species', 'dog');
    await pause();
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'species', 'cat');
    await pause();

    const staffReceives: any[] = [];
    const [, staffSynchronizer] = await openClient(
      port,
      '/shop?role=staff',
      createMergeableStore('staff2', getNow),
      (...args) => staffReceives.push(args),
    );
    await pause();
    staffReceives.length = 0;
    await openClient(port, '/shop?role=viewer', viewerStore);
    await pause();

    expect(viewerStore.getTables()).toEqual({pets: {fido: {species: 'cat'}}});
    expect(staffReceives.filter(([, , message]) => message == 3)).toEqual([]);
    await staffSynchronizer.destroy();
  });
});

describe('canWriteCell and canWriteValue', () => {
  const canWriteCell = vi.fn(
    (
      _pathId: Id,
      tableId: Id,
      _rowId: Id,
      _cellId: Id,
      cell: any,
      context: any,
    ) =>
      context?.role == 'staff' ||
      (tableId == 'orders' && cell !== undefined) ||
      tableId == 'baskets',
  );
  const canWriteValue = vi.fn(
    (_pathId: Id, valueId: Id, _value: any, context: any) =>
      context?.role == 'staff' || valueId == 'lastVisit',
  );

  beforeEach(() => {
    canWriteCell.mockClear();
    canWriteValue.mockClear();
  });

  test('only permitted cells and values are merged and relayed', async () => {
    const [, port] = await createServer({
      authorize: authorizeByRole,
      canWriteCell,
      canWriteValue,
    });
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'price', 5).setValue('open', true);
    const [customerStore] = await openClient(port, '/shop?role=customer');
    await pause();

    customerStore.transaction(() =>
      customerStore
        .setCell('pets', 'fido', 'price', 1)
        .setCell('orders', 'order1', 'pet', 'fido')
        .setCell('baskets', 'basket1', 'items', ['fido'])
        .setValue('open', false)
        .setValue('lastVisit', 'today'),
    );
    await pause();

    const expected = [
      {
        pets: {fido: {price: 5}},
        orders: {order1: {pet: 'fido'}},
        baskets: {basket1: {items: ['fido']}},
      },
      {open: true, lastVisit: 'today'},
    ];
    expect(staffStore.getContent()).toEqual(expected);
    expect(customerStore.getContent()).toEqual(expected);
    expect(canWriteCell).toHaveBeenCalledWith(
      'shop',
      'baskets',
      'basket1',
      'items',
      ['fido'],
      {role: 'customer'},
    );
    expect(canWriteValue).toHaveBeenCalledWith('shop', 'open', false, {
      role: 'customer',
    });
  });

  test('rejected deletions are restored', async () => {
    const [, port] = await createServer({
      authorize: authorizeByRole,
      canWriteCell,
    });
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('orders', 'order1', 'pet', 'fido');
    const [customerStore] = await openClient(port, '/shop?role=customer');
    await pause();

    customerStore.delRow('orders', 'order1');
    await pause();
    expect(staffStore.getTables()).toEqual({orders: {order1: {pet: 'fido'}}});
    expect(customerStore.getTables()).toEqual({
      orders: {order1: {pet: 'fido'}},
    });
    expect(canWriteCell).toHaveBeenCalledWith(
      'shop',
      'orders',
      'order1',
      'pet',
      undefined,
      {role: 'customer'},
    );
  });

  test('rejected cells the server lacks are deleted again', async () => {
    const [, port] = await createServer({
      authorize: authorizeByRole,
      canWriteCell,
    });
    const [staffStore] = await openClient(port, '/shop?role=staff');
    const [customerStore] = await openClient(port, '/shop?role=customer');
    await pause();

    customerStore.setCell('pets', 'felix', 'species', 'cat');
    await pause();
    expect(staffStore.getTables()).toEqual({});
    expect(customerStore.getTables()).toEqual({});
  });

  test('offline changes are filtered when a client reconnects', async () => {
    const [, port] = await createServer({
      authorize: authorizeByRole,
      canWriteCell,
    });
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'price', 5);
    await pause();

    const customerStore = createMergeableStore('customer', getNow);
    customerStore.merge(
      createMergeableStore('seed', getNow).setMergeableContent(
        staffStore.getMergeableContent(),
      ),
    );
    customerStore
      .setCell('pets', 'fido', 'price', 1)
      .setCell('orders', 'order1', 'pet', 'fido');
    await openClient(port, '/shop?role=customer', customerStore);
    await pause();

    const expected = {
      pets: {fido: {price: 5}},
      orders: {order1: {pet: 'fido'}},
    };
    expect(staffStore.getTables()).toEqual(expected);
    expect(customerStore.getTables()).toEqual(expected);
  });
});

describe('refused writes', () => {
  const canWriteCell = (
    _pathId: Id,
    tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _cell: unknown,
    context: any,
  ) => context?.role == 'staff' || tableId == 'orders';

  const createObservedServer = async () => {
    const serverStore = createMergeableStore('server', getNow);
    const [, port] = await createServer({
      authorize: authorizeByRole,
      canWriteCell,
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
    });
    return [serverStore, port] as const;
  };

  // A store whose clock runs ahead, so that its stamps are later than those
  // that the other stores go on to make.
  const createAheadStore = () =>
    createMergeableStore('ahead', () => getNow() + 10_000);

  const isChanges = ([, , message, body]: any[]) =>
    message == 3 &&
    (Object.keys(body[0][0]).length > 0 || Object.keys(body[1][0]).length > 0);

  test('change nothing on the server or for other clients', async () => {
    const [serverStore, port] = await createObservedServer();
    const staffReceives: any[] = [];
    const [staffStore] = await openClient(
      port,
      '/shop?role=staff',
      undefined,
      (...args) => staffReceives.push(args),
    );
    staffStore.setCell('pets', 'fido', 'price', 5);
    const [customerStore] = await openClient(port, '/shop?role=customer');
    const [viewerStore] = await openClient(port, '/shop?role=viewer');
    await pause();
    const serverBefore = serverStore.getMergeableContent();
    const staffBefore = staffStore.getMergeableContent();
    staffReceives.length = 0;

    customerStore.setCell('pets', 'fido', 'price', 1);
    customerStore.setCell('pets', 'felix', 'price', 2);
    viewerStore.delRow('pets', 'fido');
    viewerStore.setValue('open', true);
    await pause();

    expect(serverStore.getMergeableContent()).toEqual(serverBefore);
    expect(staffStore.getMergeableContent()).toEqual(staffBefore);
    expect(staffReceives.filter(isChanges)).toEqual([]);
    expect(customerStore.getContent()).toEqual(serverStore.getContent());
    expect(viewerStore.getContent()).toEqual(serverStore.getContent());
    expect(serverStore.getContent()).toEqual([{pets: {fido: {price: 5}}}, {}]);
  });

  test('do not undo a permitted write made at the same time', async () => {
    const [serverStore, port] = await createObservedServer();
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'price', 5);
    const customerStore = createAheadStore();
    await openClient(port, '/shop?role=customer', customerStore);
    await pause();

    // The refused write has the later stamp of the two.
    customerStore.setCell('pets', 'fido', 'price', 1);
    staffStore.setCell('pets', 'fido', 'price', 6);
    await pause();
    expect(serverStore.getTables()).toEqual({pets: {fido: {price: 6}}});
    expect(staffStore.getTables()).toEqual({pets: {fido: {price: 6}}});
    expect(customerStore.getTables()).toEqual({pets: {fido: {price: 6}}});
  });

  test('do not leave the client behind afterwards', async () => {
    const [serverStore, port] = await createObservedServer();
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'price', 5);
    const customerStore = createAheadStore();
    await openClient(port, '/shop?role=customer', customerStore);
    await pause();

    customerStore.setCell('pets', 'fido', 'price', 1);
    await pause();
    expect(customerStore.getTables()).toEqual({pets: {fido: {price: 5}}});

    // These stamps are earlier than the one the customer now holds.
    staffStore.setCell('pets', 'fido', 'price', 6);
    await pause();
    expect(serverStore.getTables()).toEqual({pets: {fido: {price: 6}}});
    expect(customerStore.getTables()).toEqual({pets: {fido: {price: 6}}});

    serverStore.setCell('pets', 'fido', 'price', 7);
    await pause();
    expect(staffStore.getTables()).toEqual({pets: {fido: {price: 7}}});
    expect(customerStore.getTables()).toEqual({pets: {fido: {price: 7}}});

    staffStore.delCell('pets', 'fido', 'price');
    await pause();
    expect(customerStore.getTables()).toEqual({});
  });

  test('are undone again when the client next synchronizes', async () => {
    const [serverStore, port] = await createObservedServer();
    const [staffStore] = await openClient(port, '/shop?role=staff');
    staffStore.setCell('pets', 'fido', 'price', 5);
    const customerStore = createAheadStore();
    const [, customerSynchronizer] = await openClient(
      port,
      '/shop?role=customer',
      customerStore,
    );
    await pause();
    customerStore.setCell('pets', 'fido', 'price', 1);
    await pause();
    await customerSynchronizer.destroy();

    staffStore.setCell('pets', 'fido', 'price', 6);
    await pause();
    const customerReceives: any[] = [];
    await openClient(port, '/shop?role=customer', customerStore, (...args) =>
      customerReceives.push(args),
    );
    await pause();
    expect(customerStore.getTables()).toEqual({pets: {fido: {price: 6}}});
    expect(serverStore.getTables()).toEqual({pets: {fido: {price: 6}}});
    expect(customerReceives.filter(isChanges)).toHaveLength(1);
  });

  test('leave nothing behind for what the server never had', async () => {
    const [serverStore, port] = await createObservedServer();
    await openClient(port, '/shop?role=staff');
    const viewerStore = createMergeableStore('viewer', getNow);
    viewerStore.setCell('pets', 'felix', 'species', 'cat');
    const [, viewerSynchronizer] = await openClient(
      port,
      '/shop?role=viewer',
      viewerStore,
    );
    viewerStore.setValue('open', true);
    await pause();
    expect(viewerStore.getContent()).toEqual([{}, {}]);
    expect(serverStore.getMergeableContent()).toEqual(
      createMergeableStore('server', getNow).getMergeableContent(),
    );

    await viewerSynchronizer.destroy();
    const viewerReceives: any[] = [];
    await openClient(port, '/shop?role=viewer', viewerStore, (...args) =>
      viewerReceives.push(args),
    );
    await pause();
    expect(viewerReceives.filter(isChanges)).toEqual([]);
    expect(viewerStore.getContent()).toEqual([{}, {}]);
  });

  test('can be made in great numbers', async () => {
    const [serverStore, port] = await createObservedServer();
    const [staffStore] = await openClient(port, '/shop?role=staff');
    const viewerStore = createAheadStore();
    await openClient(port, '/shop?role=viewer', viewerStore);
    staffStore.transaction(() => {
      for (let pet = 0; pet < 1_100; pet++) {
        staffStore.setCell('pets', 'pet' + pet, 'price', 5);
      }
    });
    await pause(200);

    viewerStore.transaction(() => {
      for (let pet = 0; pet < 1_100; pet++) {
        viewerStore.setCell('pets', 'pet' + pet, 'price', 1);
      }
    });
    await pause(200);
    expect(viewerStore.getContent()).toEqual(serverStore.getContent());

    // The newest of those stamps are still remembered.
    staffStore.setCell('pets', 'pet1099', 'price', 6);
    await pause();
    expect(viewerStore.getCell('pets', 'pet1099', 'price')).toEqual(6);
    expect(viewerStore.getContent()).toEqual(serverStore.getContent());
  });
});

describe('hub', () => {
  test('clients do not answer or reach each other directly', async () => {
    const [wsServer, port] = await createServer({authorize: authorizeByRole});
    const openRawClient = async (): Promise<[WebSocket, string[]]> => {
      const received: string[] = [];
      const webSocket = new WebSocket(
        getTestWebSocketUrl(port, '/shop?role=staff'),
      );
      webSocket.on('message', (data) => received.push(data.toString()));
      cleanups.push(() => webSocket.close());
      await once(webSocket, 'open');
      return [webSocket, received];
    };
    const [webSocket1, received1] = await openRawClient();
    const [, received2] = await openRawClient();
    // The path's MergeableStore waits for its own opening request to time out,
    // since these raw clients do not answer it.
    await pause(1100);
    received1.length = 0;
    received2.length = 0;

    webSocket1.send('\n["r1",1,""]');
    await pause();
    expect(received1).toEqual(['S\n["r1",0,[0,0]]']);
    expect(received2).toEqual([]);

    wsServer
      .getClientIds('shop')
      .forEach((clientId) => webSocket1.send(clientId + '\n["r2",1,""]'));
    await pause();
    expect(received1).toHaveLength(1);
    expect(received2).toEqual([]);
  });

  test('changes a server pulls from a client reach the others', async () => {
    const [, port] = await createServer({authorize: authorizeByRole});
    const [staffStore] = await openClient(port, '/shop?role=staff');
    const offlineStore = createMergeableStore('offline', getNow);
    offlineStore.setCell('pets', 'fido', 'species', 'dog');
    await openClient(port, '/shop?role=staff', offlineStore);
    await pause();
    expect(staffStore.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  });
});

describe('multiple channels', () => {
  const openChannel = async (
    webSocket: WebSocket,
    channelId: Id,
    store: MergeableStore = createMergeableStore(undefined, getNow),
  ) => {
    const synchronizer = await createWsSynchronizer(
      store,
      webSocket,
      channelId,
    );
    cleanups.push(() => synchronizer.destroy());
    await synchronizer.startSync();
    return store;
  };

  test('each channel is authorized separately', async () => {
    const authorize = vi.fn(async (pathId: Id, request: IncomingMessage) =>
      pathId == 'project/secret' ? undefined : authorizeByRole(pathId, request),
    );
    const [, port] = await createServer({authorize});
    const url = getTestWebSocketUrl(port, '/project?role=staff');
    const webSocket1 = new WebSocket(url, 'tinybase');
    const webSocket2 = new WebSocket(url, 'tinybase');
    const store1 = await openChannel(webSocket1, 'files');
    const store2 = await openChannel(webSocket2, 'files');
    store1.setCell('files', 'readme', 'size', 1);
    await pause();
    expect(store2.getTables()).toEqual({files: {readme: {size: 1}}});
    expect(authorize.mock.calls.map(([pathId]) => pathId)).toEqual([
      'project/files',
      'project/files',
    ]);

    const closed = getClose(webSocket2);
    await createWsSynchronizer(
      createMergeableStore(),
      webSocket2,
      'secret',
    ).catch(() => 0);
    expect((await closed)[0]).toEqual(1008);
  });

  test('a channel closed while authorizing never joins', async () => {
    const [wsServer, port] = await createServer({
      authorize: async (pathId, request) => {
        await pause(100);
        return authorizeByRole(pathId, request);
      },
    });
    const webSocket = new WebSocket(
      getTestWebSocketUrl(port, '/project?role=staff'),
      'tinybase',
    );
    const synchronizer = await createWsSynchronizer(
      createMergeableStore(),
      webSocket,
      'files',
    );
    await synchronizer.destroy();
    await pause(200);
    expect(wsServer.getPathIds()).toEqual([]);
  });
});

describe('client ids', () => {
  const MODES: [string, WsServerOptions<any>][] = [
    ['relaying', {}],
    ['authorizing', {authorize: () => ({})}],
    [
      'slowly authorizing',
      {
        authorize: async () => {
          await pause(20);
          return {};
        },
      },
    ],
  ];

  const createFabricatedServer = (options: WsServerOptions<any>) => {
    const webSocketServer = new EventEmitter() as any;
    webSocketServer.close = (callback: () => void) => callback();
    const wsServer = createWsServer(webSocketServer, options);
    cleanups.push(() => wsServer.destroy());
    const connect = (clientId: string, pathId = 'shop', protocol = '') => {
      const client = new EventEmitter() as any;
      Object.assign(client, {
        OPEN: 1,
        CLOSED: 3,
        readyState: 1,
        bufferedAmount: 0,
        protocol,
        closed: undefined,
        send: () => 0,
        close: (code?: number, reason?: string) => {
          client.closed ??= [code, reason];
          client.readyState = 3;
          client.emit('close');
        },
      });
      webSocketServer.emit('connection', client, {
        headers: {'sec-websocket-key': clientId},
        url: '/' + pathId,
      });
      return client;
    };
    return [wsServer, connect] as const;
  };

  test.each(MODES)('%s: unusable client ids are refused', async (_, mode) => {
    const [wsServer, connect] = createFabricatedServer(mode);
    const clients = ['S', 'M', '', 'a\nb'].map((clientId) => connect(clientId));
    await pause();
    clients.forEach((client) =>
      expect(client.closed).toEqual([1008, 'tinybase:17:shop']),
    );
    expect(wsServer.getPathIds()).toEqual([]);
  });

  test.each(MODES)(
    '%s: a client id already in use on a path is refused',
    async (_, mode) => {
      const [wsServer, connect] = createFabricatedServer(mode);
      const first = connect('same');
      const second = connect('same');
      const elsewhere = connect('same', 'office');
      await pause();
      expect(first.closed).toBeUndefined();
      expect(elsewhere.closed).toBeUndefined();
      expect(second.closed).toEqual([1008, 'tinybase:17:shop']);
      expect(wsServer.getClientIds('shop')).toEqual(['same']);
      expect(wsServer.getClientIds('office')).toEqual(['same']);

      first.close();
      await pause();
      const third = connect('same');
      await pause();
      expect(third.closed).toBeUndefined();
      expect(wsServer.getClientIds('shop')).toEqual(['same']);
    },
  );

  test.each(MODES)(
    '%s: a channel cannot be joined twice under one client id',
    async (_, mode) => {
      const [wsServer, connect] = createFabricatedServer(mode);
      const subscribe = (client: any) => {
        client.emit('message', 'S\n["hello",-1,[0,1]]');
        client.emit('message', 'S\n["subscribe",-1,[1,"desk"]]');
      };
      const first = connect('same', 'office', 'tinybase');
      subscribe(first);
      const second = connect('same', 'office', 'tinybase');
      subscribe(second);
      await pause();
      expect(first.closed).toBeUndefined();
      expect(second.closed).toEqual([1008, 'tinybase:17:office/desk']);
      expect(wsServer.getClientIds('office/desk')).toEqual(['same']);
    },
  );
});
