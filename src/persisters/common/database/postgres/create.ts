import type {
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../../@types/persisters/index.d.ts';
import {Cmd} from '../common.ts';
import {collValues} from '../../../../common/coll.ts';
import {createJsonPgPersister} from './json.ts';
import {createTabularPgPersister} from './tabular.ts';
import {getConfigStructures} from '../config.ts';
import {querySchema} from './schema.ts';

export type UpdateListener = (tableName: string) => void;

export const createPgPersister = <
  UpdateListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  cmd: Cmd,
  addUpdateListener: (
    listener: UpdateListener,
    managedTableNamesSet: Set<string>,
  ) => Promise<UpdateListeningHandle>,
  delUpdateListener: (updateListeningHandle: UpdateListeningHandle) => void,
  onSqlCommand: ((sql: string, args?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
): Persister<Persist> => {
  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<UpdateListeningHandle> =>
    await addUpdateListener(
      (tableName: string) =>
        managedTableNamesSet.has(tableName) ? listener() : 0,
      managedTableNamesSet,
    );

  const delPersisterListener = delUpdateListener;

  return (isJson ? createJsonPgPersister : createTabularPgPersister)(
    store,
    onSqlCommand
      ? async (sql, args) => {
          onSqlCommand(sql, args);
          return await cmd(sql, args);
        }
      : cmd,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    destroy,
    persist,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
    querySchema,
    thing,
    getThing,
  );
};
