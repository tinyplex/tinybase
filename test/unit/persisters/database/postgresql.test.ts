import {createMergeableStore, createStore} from 'tinybase';
import {createCustomPostgreSqlPersister, Persists} from 'tinybase/persisters';
import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
import {expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';

test('shares PostgreSQL listener resources until the last owner stops', async () => {
  const executeCommand = vi.fn(
    async (_sql: string, _params?: any[]): Promise<any[]> => [],
  );
  let nextHandle = 0;
  const addChangeListener = vi.fn(async () => ++nextHandle);
  let unblockSecondDelete = () => {};
  const secondDelete = new Promise<void>(
    (resolve) => (unblockSecondDelete = resolve),
  );
  const delChangeListener = vi.fn(async (handle: number) => {
    if (handle == 2) {
      await secondDelete;
    }
  });
  const thing = {};
  const createPersister = () =>
    createCustomPostgreSqlPersister(
      createStore(),
      undefined,
      executeCommand,
      addChangeListener,
      delChangeListener,
      undefined,
      undefined,
      () => {},
      Persists.StoreOnly,
      thing,
    );
  const persister1 = createPersister();
  const persister2 = createPersister();

  await Promise.all([persister1.startAutoLoad(), persister2.startAutoLoad()]);

  const getCommands = (prefix: string) =>
    executeCommand.mock.calls
      .map(([sql]) => sql)
      .filter((sql) => sql.startsWith(prefix));
  expect(getCommands('CREATE OR REPLACE FUNCTION')).toHaveLength(2);
  expect(addChangeListener).toHaveBeenCalledTimes(2);

  await persister1.stopAutoLoad();
  expect(delChangeListener).toHaveBeenCalledWith(1);
  expect(getCommands('DROP FUNCTION')).toHaveLength(0);

  const stopping = persister2.stopAutoLoad();
  await pause(0);
  expect(delChangeListener).toHaveBeenCalledWith(2);
  expect(getCommands('DROP FUNCTION')).toHaveLength(0);

  unblockSecondDelete();
  await stopping;
  expect(getCommands('DROP FUNCTION')).toHaveLength(1);

  await persister1.destroy();
  await persister2.destroy();
});

test('releases reserved PostgreSQL connection on validation failure', async () => {
  const release = vi.fn();
  const sql = {
    reserve: vi.fn(async () => ({
      release,
      unsafe: vi.fn(async () => []),
    })),
  } as any;

  await expect(
    (createPostgresPersister as any)(createMergeableStore(), sql, {
      mode: 'tabular',
    }),
  ).rejects.toThrow('tinybase:0');
  expect(release).toHaveBeenCalledOnce();
});
