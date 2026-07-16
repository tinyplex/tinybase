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

afterEach(() => vi.restoreAllMocks());

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
