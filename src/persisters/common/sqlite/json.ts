import {Cmd, getCommandFunctions} from './commands.ts';
import type {
  Persistables,
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
} from '../../../@types/persisters/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../../common/json.ts';
import {DefaultedJsonConfig} from './config.ts';
import {SINGLE_ROW_ID} from './common.ts';
import {createCustomPersister} from '../../index.ts';

export const createJsonSqlitePersister = <
  ListeningHandle,
  Persistable extends Persistables = Persistables.StoreOnly,
>(
  store: PersistedStore<Persistable>,
  cmd: Cmd,
  addPersisterListener: (
    listener: PersisterListener<Persistable>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError: ((error: any) => void) | undefined,
  persistable: Persistable,
  [storeTableName, storeIdColumnName, storeColumnName]: DefaultedJsonConfig,
  managedTableNames: string[],
  db: any,
  getThing: string,
  useOnConflict?: boolean,
): Persister<Persistable> => {
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(cmd, managedTableNames, onIgnoredError, useOnConflict);

  const getPersisted = async (): Promise<PersistedContent<Persistable>> =>
    await transaction(async () => {
      await refreshSchema();
      return jsonParseWithUndefined(
        ((await loadTable(storeTableName, storeIdColumnName))[SINGLE_ROW_ID]?.[
          storeColumnName
        ] as string) ?? 'null',
      );
    });

  const setPersisted = async (
    getContent: () => PersistedContent<Persistable>,
  ): Promise<void> =>
    await transaction(async () => {
      await refreshSchema();
      await saveTable(
        storeTableName,
        storeIdColumnName,
        {
          [SINGLE_ROW_ID]: {
            [storeColumnName]: jsonStringWithUndefined(getContent() ?? null),
          },
        },
        true,
        true,
      );
    });

  const persister: any = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persistable,
    {[getThing]: () => db},
    db,
  );

  return persister;
};
