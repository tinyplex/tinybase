import type {PartySocket} from 'partysocket';
import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import type {
  PartyKitPersister,
  PartyKitPersisterConfig,
} from 'tinybase/persisters/persister-partykit-client';
import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';
import type {TinyBasePartyKitServerConfig} from 'tinybase/persisters/persister-partykit-server';
import {
  TinyBasePartyKitServer,
  hasStoreInStorage,
  loadStoreFromStorage,
} from 'tinybase/persisters/persister-partykit-server';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {pause} from '../common/other.ts';

type StorageValue = string | number | boolean;
type MessageListener = (event: MessageEvent) => void;

type MockStorage = {
  get: <Value>(key: string) => Promise<Value | undefined>;
  list: <Value>(options?: {prefix?: string}) => Promise<Map<string, Value>>;
  put: (entries: {[key: string]: StorageValue}) => Promise<void>;
  delete: (keys: string[]) => Promise<void>;
  transaction: <Return>(
    callback: (transaction: MockStorage) => Promise<Return>,
  ) => Promise<Return>;
  beforeTransaction?: () => void | Promise<void>;
  listPrefixes: (string | undefined)[];
  transactionLists: number;
  transactions: number;
};

type MockSocket = PartySocket & {
  receive: (message: string) => void;
};

type MockEnvironment = {
  storage: MockStorage;
  server: TinyBasePartyKitServer;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  createSocket: () => MockSocket;
};

const createMockStorage = (): MockStorage => {
  const map = new Map<string, StorageValue>();
  let inTransaction = 0;
  const storage: MockStorage = {
    get: async <Value>(key: string): Promise<Value | undefined> =>
      map.get(key) as Value | undefined,
    list: async <Value>({prefix}: {prefix?: string} = {}): Promise<
      Map<string, Value>
    > => {
      storage.listPrefixes.push(prefix);
      storage.transactionLists += inTransaction;
      return new Map(
        [...map].filter(([key]) => prefix == null || key.startsWith(prefix)),
      ) as Map<string, Value>;
    },
    put: async (entries: {[key: string]: StorageValue}): Promise<void> => {
      Object.entries(entries).forEach(([key, value]) => map.set(key, value));
    },
    delete: async (keys: string[]): Promise<void> => {
      keys.forEach((key) => map.delete(key));
    },
    transaction: async <Return>(
      callback: (transaction: MockStorage) => Promise<Return>,
    ): Promise<Return> => {
      storage.transactions++;
      await storage.beforeTransaction?.();
      inTransaction++;
      try {
        return await callback(storage);
      } finally {
        inTransaction--;
      }
    },
    listPrefixes: [],
    transactionLists: 0,
    transactions: 0,
  };
  return storage;
};

const createMockEnvironment = (
  config: TinyBasePartyKitServerConfig = {},
): MockEnvironment => {
  const storage = createMockStorage();
  const sockets = new Map<string, MockSocket>();
  const party = {
    storage,
    broadcast: async (message: string, without: string[] = []): Promise<void> =>
      sockets.forEach((socket, socketId) =>
        without.includes(socketId) ? 0 : socket.receive(message),
      ),
  };
  const server = new TinyBasePartyKitServer(party as any);
  Object.assign(server.config, config);

  const createSocket = (): MockSocket => {
    const id = 'c' + sockets.size;
    const listeners = new Set<MessageListener>();
    const socket = {
      name: 'tinybase',
      partySocketOptions: {host: 'localhost:1999', room: 'room1'},
      send: (message: string): void => {
        void server.onMessage(message, {id} as any);
      },
      addEventListener: (_type: string, listener: MessageListener): void => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: MessageListener): void => {
        listeners.delete(listener);
      },
      receive: (message: string): void => {
        listeners.forEach((listener) =>
          listener({data: message} as MessageEvent),
        );
      },
    } as unknown as MockSocket;
    sockets.set(id, socket);
    return socket;
  };

  return {
    storage,
    server,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const request =
        input instanceof Request ? input : new Request(String(input), init);
      return await server.onRequest(request as any);
    },
    createSocket,
  };
};

const createClient = (
  environment: MockEnvironment,
  config: PartyKitPersisterConfig = {},
  onIgnoredError?: (error: any) => void,
): [Store, PartyKitPersister] => {
  const store = createStore();
  return [
    store,
    createPartyKitPersister(
      store,
      environment.createSocket(),
      {
        storeProtocol: 'http',
        ...config,
      },
      onIgnoredError,
    ),
  ];
};

describe('PartyKit persister integration', () => {
  let fetchWas: typeof fetch;
  const persisters: PartyKitPersister[] = [];

  afterEach(async () => {
    await Promise.all(
      persisters.splice(0).map((persister) => persister.destroy()),
    );
    globalThis.fetch = fetchWas;
  });

  test('syncs two clients and updates durable storage', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment);
    const [store2, persister2] = createClient(environment);
    persisters.push(persister1, persister2);

    await persister1.startAutoPersisting();
    await persister2.startAutoPersisting();

    store1.setCell('pets', 'fido', 'species', 'dog');
    store1.setValue('open', true);
    await pause();

    store2.setCell('pets', 'fido', 'species', 'cat');
    store2.setCell('pets', 'fido', 'age', 5);
    store2.setValue('open', false);
    await pause();

    const expectedContent = [
      {pets: {fido: {species: 'cat', age: 5}}},
      {open: false},
    ];
    expect(store1.getContent()).toEqual(expectedContent);
    expect(store2.getContent()).toEqual(expectedContent);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual(
      expectedContent,
    );
    expect(await hasStoreInStorage(environment.storage as any)).toEqual(true);
  });

  test('broadcasts only authorized writes', async () => {
    const environment = createMockEnvironment();
    environment.server.canSetCell = async (_tableId, _rowId, cellId) =>
      cellId != 'secret';
    environment.server.canSetValue = async (valueId) => valueId != 'secret';
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment);
    const [store2, persister2] = createClient(environment);
    persisters.push(persister1, persister2);

    await persister1.startAutoPersisting();
    await persister2.startAutoPersisting();

    store1.transaction(() => {
      store1.setCell('pets', 'fido', 'species', 'dog');
      store1.setCell('pets', 'fido', 'secret', 'classified');
      store1.setValue('open', true);
      store1.setValue('secret', 'classified');
    });
    await pause();

    const expectedContent = [{pets: {fido: {species: 'dog'}}}, {open: true}];
    expect(store2.getContent()).toEqual(expectedContent);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual(
      expectedContent,
    );
  });

  test('broadcasts only authorized deletions', async () => {
    const environment = createMockEnvironment();
    environment.server.canDelTable = async (tableId) => tableId != 'keptTable';
    environment.server.canDelRow = async (_tableId, rowId) =>
      rowId != 'keptRow';
    environment.server.canDelCell = async (_tableId, _rowId, cellId) =>
      cellId != 'keptCell';
    environment.server.canDelValue = async (valueId) => valueId != 'keptValue';
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment);
    const [store2, persister2] = createClient(environment);
    persisters.push(persister1, persister2);
    store1.setContent([
      {
        keptTable: {row: {cell: 1}},
        removedTable: {row: {cell: 1}},
        pets: {
          anchor: {cell: 1},
          keptRow: {cell: 1},
          removedRow: {cell: 1},
          cells: {anchorCell: 1, keptCell: 1, removedCell: 1},
        },
      },
      {keptValue: 1, removedValue: 1},
    ]);

    await persister1.startAutoPersisting();
    await persister2.startAutoPersisting();

    environment.storage.beforeTransaction = async () => {
      environment.storage.beforeTransaction = undefined;
      await environment.storage.put({
        't"removedTable","late","cell"': 1,
      });
    };

    store1.transaction(() => {
      store1.delTable('keptTable');
      store1.delTable('removedTable');
      store1.delRow('pets', 'keptRow');
      store1.delRow('pets', 'removedRow');
      store1.delCell('pets', 'cells', 'keptCell');
      store1.delCell('pets', 'cells', 'removedCell');
      store1.delValue('keptValue');
      store1.delValue('removedValue');
    });
    await pause();

    const expectedContent = [
      {
        keptTable: {row: {cell: 1}},
        pets: {
          anchor: {cell: 1},
          keptRow: {cell: 1},
          cells: {anchorCell: 1, keptCell: 1},
        },
      },
      {keptValue: 1},
    ];
    expect(store2.getContent()).toEqual(expectedContent);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual(
      expectedContent,
    );
    expect(environment.storage.transactionLists).toBeGreaterThan(0);
  });

  test('does not initialize a store when all writes are rejected', async () => {
    const environment = createMockEnvironment();
    const ignoredErrors: any[] = [];
    environment.server.canSetCell = async () => false;
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store, persister] = createClient(environment, {}, (error) =>
      ignoredErrors.push(error),
    );
    persisters.push(persister);
    store.setCell('pets', 'fido', 'species', 'dog');

    await persister.startAutoPersisting();

    expect(await hasStoreInStorage(environment.storage as any)).toEqual(false);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual([
      {},
      {},
    ]);

    environment.server.canSetCell = async () => true;
    await persister.save();
    await persister.save();

    expect(await hasStoreInStorage(environment.storage as any)).toEqual(true);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual([
      {pets: {fido: {species: 'dog'}}},
      {},
    ]);
    expect(ignoredErrors).toEqual([]);
  });

  test('supports non-default server and client configuration', async () => {
    const environment = createMockEnvironment({
      storePath: '/my_store',
      messagePrefix: 'tb:',
      storagePrefix: 'tb_',
    });
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment, {
      storePath: '/my_store',
      messagePrefix: 'tb:',
    });
    const [store2, persister2] = createClient(environment, {
      storePath: '/my_store',
      messagePrefix: 'tb:',
    });
    persisters.push(persister1, persister2);

    await persister1.startAutoPersisting();
    await persister2.startAutoPersisting();

    store1.setCell('pets', 'fido', 'species', 'dog');
    await pause();
    store2.setCell('pets', 'fido', 'species', 'cat');
    await pause();

    expect(store1.getTables()).toEqual({pets: {fido: {species: 'cat'}}});
    expect(store2.getTables()).toEqual({pets: {fido: {species: 'cat'}}});
    expect(await hasStoreInStorage(environment.storage as any, 'tb_')).toEqual(
      true,
    );
    expect(
      await loadStoreFromStorage(environment.storage as any, 'tb_'),
    ).toEqual([{pets: {fido: {species: 'cat'}}}, {}]);
    expect(environment.storage.listPrefixes).toContain('tb_');
    expect(environment.storage.transactions).toBeGreaterThan(0);
  });

  test('rejects unsuccessful empty HTTP responses', async () => {
    const environment = createMockEnvironment();
    const ignoredErrors: any[] = [];
    const response = new Response(null, {status: 500});
    fetchWas = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    const [, persister] = createClient(environment, {}, (error) =>
      ignoredErrors.push(error),
    );
    persisters.push(persister);
    await persister.load();

    expect(ignoredErrors).toEqual([response]);
    expect(response.bodyUsed).toBe(false);
  });

  test('serializes concurrent initial saves', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;
    const contents = [
      [{pets: {fido: {species: 'dog'}}}, {}],
      [{pets: {felix: {species: 'cat'}}}, {}],
    ];

    const responses = await Promise.all(
      contents.map((content) =>
        environment.server.onRequest(
          new Request('https://example.com/store', {
            method: 'PUT',
            body: JSON.stringify(content),
          }) as any,
        ),
      ),
    );

    expect(responses.map(({status}) => status).sort()).toEqual([201, 205]);
    expect(contents).toContainEqual(
      await loadStoreFromStorage(environment.storage as any),
    );
  });

  test('rejects malformed initial content', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;

    for (const body of ['{', '{}', '[{},{} ,1]']) {
      const response = await environment.server.onRequest(
        new Request('https://example.com/store', {method: 'PUT', body}) as any,
      );
      expect(response.status).toBe(400);
    }
    expect(await hasStoreInStorage(environment.storage as any)).toBe(false);
  });

  test('ignores malformed socket and namespaced storage payloads', async () => {
    const environment = createMockEnvironment({storagePrefix: 'tb_'});
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;
    await environment.storage.put({
      'other_t"ignored","row","cell"': 1,
      tb_hasStore: 1,
      'tb_tnot-json': 1,
      'tb_t"pets","fido","species"': 'dog',
      tb_vopen: true,
    });

    expect(
      await loadStoreFromStorage(environment.storage as any, 'tb_'),
    ).toEqual([{pets: {fido: {species: 'dog'}}}, {open: true}]);
    expect(environment.storage.listPrefixes).toEqual(['tb_']);

    const socket = environment.createSocket();
    const store = createStore();
    const persister = createPartyKitPersister(store, socket, {
      storeProtocol: 'http',
    });
    persisters.push(persister);
    await persister.startAutoLoad();

    expect(() => socket.receive('s{')).not.toThrow();
    expect(() => socket.receive('s{}')).not.toThrow();
    socket.receive(
      's' + JSON.stringify([{cats: {felix: {species: 'cat'}}}, {}, 1]),
    );
    await pause();
    expect(store.getTables()).toEqual({
      pets: {fido: {species: 'dog'}},
      cats: {felix: {species: 'cat'}},
    });
  });

  test('persists additions to server storage', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment);
    persisters.push(persister1);
    await persister1.startAutoPersisting();

    store1.setCell('pets', 'fido', 'species', 'dog');
    store1.setCell('pets', 'fido', 'age', 4);
    store1.setValue('open', true);
    await pause();

    expect(store1.getContent()).toEqual([
      {pets: {fido: {species: 'dog', age: 4}}},
      {open: true},
    ]);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual([
      {pets: {fido: {species: 'dog', age: 4}}},
      {open: true},
    ]);
  });

  test('persists reserved identifiers', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store, persister] = createClient(environment);
    persisters.push(persister);
    await persister.startAutoPersisting();

    store
      .setCell('__proto__', 'constructor', 'prototype', 'safe')
      .setValue('__proto__', 'safe');
    await pause();

    const [tables, values] = await loadStoreFromStorage(
      environment.storage as any,
    );
    expect(Object.hasOwn(tables, '__proto__')).toEqual(true);
    expect(tables['__proto__']['constructor']['prototype']).toEqual('safe');
    expect(Object.hasOwn(values, '__proto__')).toEqual(true);
    expect(values['__proto__']).toEqual('safe');
  });

  test('persists updates to server storage', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment);
    persisters.push(persister1);
    await persister1.startAutoPersisting();

    store1.setCell('pets', 'fido', 'species', 'dog');
    store1.setCell('pets', 'fido', 'age', 4);
    store1.setValue('open', true);
    await pause();

    store1.setCell('pets', 'fido', 'species', 'cat');
    store1.setCell('pets', 'fido', 'age', 5);
    store1.setValue('open', false);
    await pause();

    expect(store1.getContent()).toEqual([
      {pets: {fido: {species: 'cat', age: 5}}},
      {open: false},
    ]);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual([
      {pets: {fido: {species: 'cat', age: 5}}},
      {open: false},
    ]);
  });

  test('persists deletions to server storage', async () => {
    const environment = createMockEnvironment();
    fetchWas = globalThis.fetch;
    globalThis.fetch = environment.fetch as typeof fetch;

    const [store1, persister1] = createClient(environment);
    persisters.push(persister1);
    await persister1.startAutoPersisting();

    store1.setCell('feeding-sessions', '1767445910545', 'durationInSeconds', 2);
    await pause();
    store1.delRow('feeding-sessions', '1767445910545');
    await pause();

    expect(store1.getContent()).toEqual([{}, {}]);
    expect(await loadStoreFromStorage(environment.storage as any)).toEqual([
      {},
      {},
    ]);
  });
});
