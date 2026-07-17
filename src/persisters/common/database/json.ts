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
import {DatabaseTransaction, getCommandFunctions} from './commands.ts';
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
  _encode?: (cellOrValue: any) => string | number,
  _decode?: (field: string | number) => any,
  executeTransaction?: DatabaseTransaction,
): Persister<Persist> => {
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(
      executeCommand,
      managedTableNames,
      querySchema,
      columnType,
      upsert,
      undefined,
      undefined,
      executeTransaction,
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

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persist,
    {[getThing]: () => thing, destroy: extraDestroy},
    0,
    thing,
  );
};
