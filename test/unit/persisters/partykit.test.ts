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
import {afterEach, describe, expect, test} from 'vitest';
import {pause} from '../common/other.ts';

type StorageValue = string | number | boolean;
type MessageListener = (event: MessageEvent) => void;

type MockStorage = {
  get: <Value>(key: string) => Promise<Value | undefined>;
  list: <Value>() => Promise<Map<string, Value>>;
  put: (entries: {[key: string]: StorageValue}) => Promise<void>;
  delete: (keys: string[]) => Promise<void>;
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
  return {
    get: async <Value>(key: string): Promise<Value | undefined> =>
      map.get(key) as Value | undefined,
    list: async <Value>(): Promise<Map<string, Value>> =>
      map as unknown as Map<string, Value>,
    put: async (entries: {[key: string]: StorageValue}): Promise<void> => {
      Object.entries(entries).forEach(([key, value]) => map.set(key, value));
    },
    delete: async (keys: string[]): Promise<void> => {
      keys.forEach((key) => map.delete(key));
    },
  };
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
): [Store, PartyKitPersister] => {
  const store = createStore();
  return [
    store,
    createPartyKitPersister(store, environment.createSocket(), {
      storeProtocol: 'http',
      ...config,
    }),
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
