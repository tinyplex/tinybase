import {createStore} from 'tinybase';
import {
  createLocalPersister,
  createOpfsPersister,
} from 'tinybase/persisters/persister-browser';
import {expect, test, vi} from 'vitest';

test('closes successful OPFS writes', async () => {
  const writable = {
    abort: vi.fn(),
    close: vi.fn(),
    write: vi.fn(),
  };
  const persister = createOpfsPersister(
    createStore().setValue('species', 'dog'),
    {createWritable: async () => writable} as any,
  );
  await persister.save();

  expect(writable.close).toHaveBeenCalledOnce();
  expect(writable.abort).not.toHaveBeenCalled();
});

test('aborts failed OPFS writes', async () => {
  const error = new Error('write failed');
  const ignoredError = vi.fn();
  const writable = {
    abort: vi.fn(),
    close: vi.fn(),
    write: vi.fn().mockRejectedValue(error),
  };
  const persister = createOpfsPersister(
    createStore().setValue('species', 'dog'),
    {createWritable: async () => writable} as any,
    ignoredError,
  );
  await persister.save();

  expect(writable.abort).toHaveBeenCalledOnce();
  expect(writable.close).not.toHaveBeenCalled();
  expect(ignoredError).toHaveBeenCalledWith(error);
});

test('reports malformed storage events', async () => {
  const storageName = 'malformed-storage-event';
  const ignoredError = vi.fn();
  const store = createStore().setValue('species', 'dog');
  const persister = createLocalPersister(store, storageName, ignoredError);

  await persister.startAutoLoad();
  ignoredError.mockClear();
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: storageName,
      newValue: '{',
      storageArea: localStorage,
    }),
  );
  await Promise.resolve();

  expect(ignoredError).toHaveBeenCalledOnce();
  expect(ignoredError.mock.calls[0][0]).toBeInstanceOf(SyntaxError);
  expect(store.getValues()).toEqual({species: 'dog'});

  await persister.destroy();
});

test('contains storage ignored-error handler failures', async () => {
  const storageName = 'throwing-storage-error-handler';
  let fail = false;
  const ignoredError = vi.fn(() => {
    if (fail) {
      throw new Error('ignored-error handler failed');
    }
  });
  const persister = createLocalPersister(
    createStore(),
    storageName,
    ignoredError,
  );

  await persister.startAutoLoad();
  ignoredError.mockClear();
  fail = true;
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: storageName,
      newValue: '{',
      storageArea: localStorage,
    }),
  );
  await Promise.resolve();

  expect(ignoredError).toHaveBeenCalledOnce();
  await persister.destroy();
});
