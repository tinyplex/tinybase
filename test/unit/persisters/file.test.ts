import {createStore} from 'tinybase';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {beforeEach, expect, test, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  rename: vi.fn(),
  unlink: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({default: mocks, ...mocks}));

beforeEach(() => vi.resetAllMocks());

test('replaces persisted files atomically', async () => {
  const persister = createFilePersister(
    createStore().setValue('species', 'dog'),
    '/data/pets.json',
  );
  await persister.save();

  const tempFilePath = mocks.writeFile.mock.calls[0][0];
  expect(tempFilePath).toMatch(/^\/data\/pets\.json\..+\.tmp$/);
  expect(mocks.rename).toHaveBeenCalledWith(
    tempFilePath,
    '/data/pets.json',
  );
  expect(mocks.unlink).toHaveBeenCalledWith(tempFilePath);
});

test('cleans up a failed temporary file write', async () => {
  const error = new Error('write failed');
  const ignoredError = vi.fn();
  mocks.writeFile.mockRejectedValue(error);
  const persister = createFilePersister(
    createStore().setValue('species', 'dog'),
    '/data/pets.json',
    ignoredError,
  );
  await persister.save();

  const tempFilePath = mocks.writeFile.mock.calls[0][0];
  expect(mocks.writeFile).not.toHaveBeenCalledWith(
    '/data/pets.json',
    expect.anything(),
    expect.anything(),
  );
  expect(mocks.rename).not.toHaveBeenCalled();
  expect(mocks.unlink).toHaveBeenCalledWith(tempFilePath);
  expect(ignoredError).toHaveBeenCalledWith(error);
});
