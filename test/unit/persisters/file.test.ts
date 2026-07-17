import {createStore} from 'tinybase';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {beforeEach, expect, test, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  chmod: vi.fn(),
  lstat: vi.fn(),
  readFile: vi.fn(),
  readlink: vi.fn(),
  realpath: vi.fn(),
  rename: vi.fn(),
  stat: vi.fn(),
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
  expect(mocks.rename).toHaveBeenCalledWith(tempFilePath, '/data/pets.json');
  expect(mocks.unlink).toHaveBeenCalledWith(tempFilePath);
});

test('preserves the permission mode of a replaced file', async () => {
  mocks.stat.mockResolvedValue({mode: 0o100640});
  const persister = createFilePersister(
    createStore().setValue('species', 'dog'),
    '/data/pets.json',
  );
  await persister.save();

  const tempFilePath = mocks.writeFile.mock.calls[0][0];
  expect(mocks.chmod).toHaveBeenCalledWith(tempFilePath, 0o640);
  expect(mocks.rename).toHaveBeenCalledWith(tempFilePath, '/data/pets.json');
});

test('replaces a symlink target without replacing the link', async () => {
  mocks.lstat.mockResolvedValue({isSymbolicLink: () => true});
  mocks.realpath.mockResolvedValue('/data/pets.json');
  const persister = createFilePersister(
    createStore().setValue('species', 'dog'),
    '/links/pets.json',
  );
  await persister.save();

  const tempFilePath = mocks.writeFile.mock.calls[0][0];
  expect(tempFilePath).toMatch(/^\/data\/pets\.json\..+\.tmp$/);
  expect(mocks.rename).toHaveBeenCalledWith(tempFilePath, '/data/pets.json');
  expect(mocks.rename).not.toHaveBeenCalledWith(
    tempFilePath,
    '/links/pets.json',
  );
});

test('replaces the target of a dangling relative symlink', async () => {
  mocks.lstat.mockResolvedValue({isSymbolicLink: () => true});
  mocks.realpath.mockRejectedValue(new Error('target does not exist'));
  mocks.readlink.mockResolvedValue('../data/pets.json');
  const persister = createFilePersister(
    createStore().setValue('species', 'dog'),
    '/links/pets.json',
  );
  await persister.save();

  const tempFilePath = mocks.writeFile.mock.calls[0][0];
  expect(mocks.rename).toHaveBeenCalledWith(tempFilePath, '/data/pets.json');
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
