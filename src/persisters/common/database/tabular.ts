import type {
  CellOrUndefined,
  Tables,
  ValueOrUndefined,
  Values,
} from '../../../@types/store/index.d.ts';
import {
  DEFAULT_ROW_ID_COLUMN_NAME,
  QuerySchema,
  SINGLE_ROW_ID,
} from './common.ts';
import type {
  DatabaseExecuteCommand,
  PersistedChanges,
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {isUndefined, promiseAll} from '../../../common/other.ts';
import {objHas, objIsEmpty, objNew} from '../../../common/obj.ts';
import type {DefaultedTabularConfig} from './config.ts';
import type {Id} from '../../../@types/common/index.d.ts';
import {arrayFilter} from '../../../common/array.ts';
import {createCustomPersister} from '../create.ts';
import {getCommandFunctions} from './commands.ts';
import {mapMap} from '../../../common/map.ts';

export const createTabularPersister = <
  ListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  executeCommand: DatabaseExecuteCommand,
  addPersisterListener: (
    listener: PersisterListener<Persist>,
  ) => ListeningHandle | Promise<ListeningHandle>,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  onIgnoredError: ((error: any) => void) | undefined,
  destroyImpl: () => void,
  persist: Persist,
  [
    tablesLoadConfig,
    tablesSaveConfig,
    [valuesLoad, valuesSave, valuesTableName],
  ]: DefaultedTabularConfig,
  managedTableNames: string[],
  querySchema: QuerySchema,
  thing: any,
  getThing: string,
  columnType: string,
  orReplace?: 0 | 1,
  encode?: (cellOrValue: any) => string | number,
  decode?: (field: string | number) => any,
): Persister<Persist> => {
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(
      executeCommand,
      managedTableNames,
      querySchema,
      onIgnoredError,
      columnType,
      orReplace,
      encode,
      decode,
    );

  const saveTables = async (
    tables:
      | Tables
      | {
          [tableId: Id]:
            | {[rowId: Id]: {[cellId: Id]: CellOrUndefined} | undefined}
            | undefined;
        },
    partial?: boolean,
  ) =>
    await promiseAll(
      mapMap(
        tablesSaveConfig,
        async (
          [tableName, rowIdColumnName, deleteEmptyColumns, deleteEmptyTable],
          tableId,
        ) => {
          if (!partial || objHas(tables, tableId)) {
            await saveTable(
              tableName,
              rowIdColumnName,
              tables[tableId],
              deleteEmptyColumns,
              deleteEmptyTable,
              partial,
            );
          }
        },
      ),
    );

  const saveValues = async (
    values: Values | {[valueId: Id]: ValueOrUndefined},
    partial?: boolean,
  ) =>
    valuesSave
      ? await saveTable(
          valuesTableName,
          DEFAULT_ROW_ID_COLUMN_NAME,
          {[SINGLE_ROW_ID]: values},
          true,
          true,
          partial,
        )
      : null;

  const loadTables = async (): Promise<Tables> =>
    objNew(
      arrayFilter(
        await promiseAll(
          mapMap(
            tablesLoadConfig,
            async ([tableId, rowIdColumnName], tableName) => [
              tableId,
              await loadTable(tableName, rowIdColumnName),
            ],
          ),
        ),
        (pair) => !objIsEmpty(pair[1]),
      ),
    );

  const loadValues = async (): Promise<Values | null> =>
    valuesLoad
      ? (await loadTable(valuesTableName, DEFAULT_ROW_ID_COLUMN_NAME))[
          SINGLE_ROW_ID
        ]
      : {};

  const getPersisted = async (): Promise<
    PersistedContent<Persist> | undefined
  > =>
    (await transaction(async () => {
      await refreshSchema();
      const tables = await loadTables();
      const values = await loadValues();
      return !objIsEmpty(tables) || !isUndefined(values)
        ? [tables as Tables, values as Values]
        : undefined;
    })) as any;

  const setPersisted = async (
    getContent: () => PersistedContent<Persist>,
    changes?: PersistedChanges<Persist>,
  ): Promise<void> =>
    await transaction(async () => {
      await refreshSchema();
      if (!isUndefined(changes)) {
        await saveTables(changes[0] as any, true);
        await saveValues(changes[1] as any, true);
      } else {
        const [tables, values] = getContent() as any;
        await saveTables(tables);
        await saveValues(values);
      }
    });

  const destroy = () => {
    persister.stopAutoLoad().stopAutoSave();
    destroyImpl();
    return persister;
  };

  const persister: any = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persist,
    {[getThing]: () => thing, destroy},
    thing,
  );

  return persister;
};
