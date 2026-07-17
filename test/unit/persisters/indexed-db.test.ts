import 'fake-indexeddb/auto';
import {createStore} from 'tinybase';
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {afterEach, expect, test, vi} from 'vitest';
import {pause} from '../common/other.ts';

const createIndexedDbMock = () => {
  const modes: IDBTransactionMode[] = [];
  const requests: any[] = [];
  const transaction: any = {
    objectStore: () => ({
      delete: () => getRequest(),
      getAll: () => getRequest([]),
      getAllKeys: () => getRequest([]),
      put: () => getRequest(),
    }),
  };
  const db: any = {
    close: vi.fn(),
    createObjectStore: vi.fn(),
    transaction: (_names: string[], mode: IDBTransactionMode) => {
      modes.push(mode);
      return transaction;
    },
  };
  const request: any = {result: db};
  const getRequest = (result?: any) => {
    const request: any = {result};
    requests.push(request);
    queueMicrotask(() => request.onsuccess?.());
    return request;
  };
  Object.defineProperty(window, 'indexedDB', {
    configurable: true,
    value: {open: vi.fn(() => request)},
  });
  return {db, modes, request, requests, transaction};
};

type ControlledRead = {
  request: any;
  requests: any[];
  transaction: any;
};

const createControlledIndexedDbMock = () => {
  const operations: ControlledRead[] = [];
  const waiters: ((operation: ControlledRead) => void)[] = [];
  const open = vi.fn(() => {
    const requests: any[] = [];
    const transaction: any = {
      objectStore: () => ({
        getAll: () => {
          const request: any = {};
          requests.push(request);
          return request;
        },
      }),
    };
    const db: any = {
      close: vi.fn(),
      transaction: () => transaction,
    };
    const request: any = {result: db};
    const operation = {request, requests, transaction};
    const index = operations.push(operation) - 1;
    waiters[index]?.(operation);
    return request;
  });
  Object.defineProperty(window, 'indexedDB', {
    configurable: true,
    value: {open},
  });
  const getOperation = async (index: number): Promise<ControlledRead> =>
    operations[index] ??
    (await new Promise((resolve) => (waiters[index] = resolve)));
  const finish = async (
    operation: ControlledRead,
    content: [{[id: string]: any}, {[id: string]: any}],
  ): Promise<void> => {
    operation.request.onsuccess();
    content.forEach((obj, index) => {
      operation.requests[index].result = Object.entries(obj).map(([k, v]) => ({
        k,
        v,
      }));
      operation.requests[index].onsuccess();
    });
    await Promise.resolve();
    operation.transaction.oncomplete();
    await Promise.resolve();
    await Promise.resolve();
  };
  return {finish, getOperation, open};
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test('waits for IndexedDB write transactions to complete', async () => {
  const {modes, request, transaction} = createIndexedDbMock();
  const persister = createIndexedDbPersister(
    createStore().setValue('species', 'dog'),
    'pets',
  );
  let resolved = false;
  const saving = persister.save().then(() => (resolved = true));
  await pause(0);
  request.onupgradeneeded();
  request.onsuccess();
  await pause(0);

  expect(modes).toEqual(['readwrite']);
  expect(resolved).toBe(false);

  transaction.oncomplete();
  await saving;
  expect(resolved).toBe(true);
});

test('uses readonly IndexedDB transactions when loading', async () => {
  const {modes, request, transaction} = createIndexedDbMock();
  const persister = createIndexedDbPersister(createStore(), 'pets');
  const loading = persister.load();
  await pause(0);
  request.onsuccess();
  await pause(0);
  transaction.oncomplete();
  await loading;

  expect(modes).toEqual(['readonly']);
});

test('reports IndexedDB transaction aborts', async () => {
  const {request, transaction} = createIndexedDbMock();
  const ignoredError = vi.fn();
  const persister = createIndexedDbPersister(
    createStore().setValue('species', 'dog'),
    'pets',
    1,
    ignoredError,
  );
  const saving = persister.save();
  await pause(0);
  request.onupgradeneeded();
  request.onsuccess();
  await pause(0);
  transaction.onabort();
  await saving;

  expect(ignoredError.mock.calls[0][0].message).toBe('tinybase:11');
});

test('reports blocked IndexedDB opens', async () => {
  const {request} = createIndexedDbMock();
  const ignoredError = vi.fn();
  const persister = createIndexedDbPersister(
    createStore(),
    'pets',
    1,
    ignoredError,
  );
  const saving = persister.save();
  await pause(0);
  request.onblocked();
  await saving;

  expect(ignoredError.mock.calls[0][0].message).toBe('tinybase:12');
});

test.each(['stopAutoLoad', 'destroy'] as const)(
  'drains IndexedDB polling on %s',
  async (stopMethod) => {
    vi.useFakeTimers();
    const {finish, getOperation, open} = createControlledIndexedDbMock();
    const ignoredError = vi.fn();
    const store = createStore();
    const persister = createIndexedDbPersister(
      store,
      'pets',
      0.01,
      ignoredError,
    );
    const content: [{[id: string]: any}, {[id: string]: any}] = [
      {},
      {species: 'dog'},
    ];
    const starting = persister.startAutoLoad();
    await finish(await getOperation(0), content);
    await finish(await getOperation(1), content);
    await starting;

    expect(store.getValue('species')).toBe('dog');
    await vi.advanceTimersByTimeAsync(10);
    const firstPoll = await getOperation(2);
    await vi.advanceTimersByTimeAsync(100);

    expect(open).toHaveBeenCalledTimes(3);
    await finish(firstPoll, content);
    await vi.advanceTimersByTimeAsync(10);
    const failedPoll = await getOperation(3);
    failedPoll.request.onerror();
    await vi.advanceTimersByTimeAsync(10);
    expect(ignoredError.mock.calls[0][0].message).toBe('tinybase:12');
    const lastPoll = await getOperation(4);
    const loads = persister.getStats().loads;
    let stopped = false;
    const stopping = persister[stopMethod]().then(() => (stopped = true));
    await Promise.resolve();
    expect(stopped).toBe(false);

    await finish(lastPoll, [{}, {species: 'cat'}]);
    await stopping;

    expect(store.getValue('species')).toBe('dog');
    expect(persister.getStats().loads).toBe(loads);
    expect(vi.getTimerCount()).toBe(0);
  },
);

test('contains IndexedDB ignored-error handler failures', async () => {
  vi.useFakeTimers();
  const {finish, getOperation} = createControlledIndexedDbMock();
  let resolveErrorReported!: () => void;
  const errorReported = new Promise<void>(
    (resolve) => (resolveErrorReported = resolve),
  );
  const ignoredError = vi.fn(() => {
    resolveErrorReported();
    throw new Error('ignored-error handler failed');
  });
  const persister = createIndexedDbPersister(
    createStore(),
    'pets',
    0.01,
    ignoredError,
  );
  const content: [{[id: string]: any}, {[id: string]: any}] = [
    {},
    {species: 'dog'},
  ];
  const starting = persister.startAutoLoad();
  await finish(await getOperation(0), content);
  await finish(await getOperation(1), content);
  await starting;

  vi.advanceTimersByTime(10);
  const failedPoll = await getOperation(2);
  failedPoll.request.onerror();
  await errorReported;
  expect(ignoredError).toHaveBeenCalledOnce();

  await persister.destroy();
});
