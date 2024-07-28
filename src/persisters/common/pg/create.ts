import type {
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {Cmd} from './commands.ts';
import {collValues} from '../../../common/coll.ts';
import {createJsonPgPersister} from './json.ts';
import {createTabularPgPersister} from './tabular.ts';
import {getConfigStructures} from './config.ts';

export const createPgPersister = <
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  cmd: Cmd,
  _addUpdateListener: () => 0,
  _delUpdateListener: () => void,
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

  const addPersisterListener = (): 0 => 0;

  const delPersisterListener = (): void => {};

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
    thing,
    getThing,
  );
};
