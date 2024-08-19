import {Cmd, SELECT, WHERE, getPlaceholders} from './common.ts';
import type {
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {collValues} from '../../../common/coll.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';
import {getConfigStructures} from './config.ts';

export type UpdateListener = (tableName: string) => void;
export const createPostgreSqlPersister = <
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

  return (isJson ? createJsonPersister : createTabularPersister)(
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
    async (cmd: Cmd, managedTableNames: string[]): Promise<any[]> =>
      await cmd(
        // eslint-disable-next-line max-len
        `${SELECT} table_name tn,column_name cn FROM information_schema.columns ${WHERE} table_schema='public'AND table_name IN(${getPlaceholders(managedTableNames)})`,
        managedTableNames,
      ),
    thing,
    getThing,
  );
};
