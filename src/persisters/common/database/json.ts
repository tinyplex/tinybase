import type {
  DatabaseExecuteCommand,
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../../common/json.ts';
import {createCustomPersister} from '../create.ts';
import {getCommandFunctions} from './commands.ts';
import {QuerySchema, SINGLE_ROW_ID, Upsert} from './common.ts';
import type {DefaultedJsonConfig} from './config.ts';

export const createJsonPersister = <
  ListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  executeCommand: DatabaseExecuteCommand,
  addPersisterListener: (
    listener: PersisterListener<Persist>,
  ) => ListeningHandle | Promise<ListeningHandle>,
  delPersisterListener: (
    listeningHandle: ListeningHandle,
  ) => void | Promise<void>,
  onIgnoredError: ((error: any) => void) | undefined,
  extraDestroy: () => void,
  persist: Persist,
  [storeTableName, storeIdColumnName, storeColumnName]: DefaultedJsonConfig,
  managedTableNames: string[],
  querySchema: QuerySchema,
  thing: any,
  getThing: string,
  columnType: string,
  upsert?: Upsert,
): Persister<Persist> => {
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(
      executeCommand,
      managedTableNames,
      querySchema,
      onIgnoredError,
      columnType,
      upsert,
    );

  const getPersisted = (): Promise<PersistedContent<Persist>> =>
    transaction(async () => {
      await refreshSchema();
      return jsonParseWithUndefined(
        ((await loadTable(storeTableName, storeIdColumnName))[SINGLE_ROW_ID]?.[
          storeColumnName
        ] as string) ?? 'null',
      );
    });

  const setPersisted = (
    getContent: () => PersistedContent<Persist>,
  ): Promise<void> =>
    transaction(async () => {
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

  const destroy = async () => {
    await persister.stopAutoPersisting();
    extraDestroy();
    return persister;
  };

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persist,
    {[getThing]: () => thing, destroy},
    0,
    thing,
  );

  return persister;
};
