import {Cmd, getCommandFunctions} from './commands';
import {DEFAULT_ROW_ID_COLUMN_NAME, SINGLE_ROW_ID} from './common';
import {
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
  StoreTypes,
} from '../../types/persisters';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json';
import {DefaultedJsonConfig} from './config';
import {createCustomPersister} from '../../persisters';

const STORE_COLUMN = 'store';

export const createJsonSqlitePersister = <
  ListeningHandle,
  StoreType extends StoreTypes = 1,
>(
  store: PersistedStore<StoreType>,
  cmd: Cmd,
  addPersisterListener: (
    listener: PersisterListener<StoreType>,
  ) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError: ((error: any) => void) | undefined,
  supportedStoreType: StoreType,
  [storeTableName]: DefaultedJsonConfig,
  managedTableNames: string[],
  db: any,
  getThing: string,
  useOnConflict?: boolean,
): Persister<StoreType> => {
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(cmd, managedTableNames, onIgnoredError, useOnConflict);

  const getPersisted = async (): Promise<PersistedContent<StoreType>> =>
    await transaction(async () => {
      await refreshSchema();
      return jsonParseWithUndefined(
        ((await loadTable(storeTableName, DEFAULT_ROW_ID_COLUMN_NAME))[
          SINGLE_ROW_ID
        ]?.[STORE_COLUMN] as string) ?? 'null',
      );
    });

  const setPersisted = async (
    getContent: () => PersistedContent<StoreType>,
  ): Promise<void> =>
    await transaction(async () => {
      await refreshSchema();
      await saveTable(
        storeTableName,
        DEFAULT_ROW_ID_COLUMN_NAME,
        {
          [SINGLE_ROW_ID]: {
            [STORE_COLUMN]: jsonStringWithUndefined(getContent() ?? null),
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
    supportedStoreType,
    {[getThing]: () => db},
    db,
  );

  return persister;
};
