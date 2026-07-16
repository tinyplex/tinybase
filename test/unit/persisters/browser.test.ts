import {createStore} from 'tinybase';
import {createOpfsPersister} from 'tinybase/persisters/persister-browser';
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
