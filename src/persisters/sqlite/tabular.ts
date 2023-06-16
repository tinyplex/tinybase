import {Cmd, getCommandFunctions} from './commands';
import {DpcTabular, Persister, PersisterListener} from '../../types/persisters';
import {SINGLE_ROW_ID, escapeId} from './common';
import {Store, Table, Tables, Values} from '../../types/store';
import {arrayFilter, arrayMap} from '../../common/array';
import {isUndefined, promiseAll} from '../../common/other';
import {objDel, objIsEmpty, objMap, objNew} from '../../common/obj';
import {Id} from '../../types/common';
import {createCustomPersister} from '../../persisters';
import {getConfigFunctions} from './tabular-config';

export const createTabularSqlitePersister = <ListeningHandle>(
  store: Store,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  config: DpcTabular,
): Persister => {
  const [
    tablesLoad,
    getTablesLoadConfig,
    tablesSave,
    getTablesSaveConfig,
    [valuesLoad, valuesSave, valuesTableName, valuesRowIdColumnName],
  ] = getConfigFunctions(config);

  const [ensureTable, loadSingleRow, saveSingleRow] = getCommandFunctions(cmd);

  const scheduleSaveTables = (tables: Tables) =>
    tablesSave ? objMap(tables, scheduleSaveTable) : 0;

  const scheduleSaveTable = (table: Table, tableId: Id) => {
    const [getTableName, rowIdColumnName] = getTablesSaveConfig(tableId);
    const tableName = getTableName(tableId);
    if (tableName !== false) {
      persister.schedule(
        async () => await ensureTable(tableName, rowIdColumnName),
        ...objMap(
          table,
          (row, rowId) => async () =>
            await saveSingleRow(tableName, rowIdColumnName, rowId, row),
        ),
      );
    }
  };

  const scheduleSaveValues = (values: Values) =>
    valuesSave
      ? persister.schedule(
          async () => await ensureTable(valuesTableName, valuesRowIdColumnName),
          async () =>
            await saveSingleRow(
              valuesTableName,
              valuesRowIdColumnName,
              SINGLE_ROW_ID,
              values,
            ),
        )
      : 0;

  const loadTables = async (): Promise<Tables> =>
    tablesLoad
      ? objNew(
          arrayFilter(
            await promiseAll(
              arrayMap(
                await loadTableNames(),
                async (tableName) => await loadTable(tableName),
              ),
            ),
            ([id, table]) => id !== false && !objIsEmpty(table),
          ),
        )
      : {};

  const loadTableNames = async (): Promise<string[]> =>
    arrayMap(
      (await cmd(
        `SELECT name FROM sqlite_schema WHERE type='table'AND name!=?`,
        [valuesTableName],
      )) as {name: string}[],
      ({name}) => name,
    );

  const loadTable = async (tableName: string): Promise<[Id | false, Table]> => {
    const [getTableId, rowIdColumnName] = getTablesLoadConfig(tableName);
    const tableId = getTableId(tableName);
    return [
      tableId,
      tableId === false
        ? {}
        : objNew(
            arrayFilter(
              arrayMap(
                await cmd(`SELECT * FROM${escapeId(tableName)}`),
                (row) => [row[rowIdColumnName], objDel(row, rowIdColumnName)],
              ),
              ([rowId, row]) => !isUndefined(rowId) && !objIsEmpty(row),
            ),
          ),
    ];
  };

  const loadValues = async (): Promise<Values> =>
    valuesLoad
      ? await loadSingleRow(valuesTableName, valuesRowIdColumnName)
      : {};

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    const tables = await loadTables();
    const values = await loadValues();
    return !objIsEmpty(tables) || !objIsEmpty(values)
      ? [tables as Tables, values as Values]
      : undefined;
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    const [tables, values] = getContent();
    scheduleSaveTables(tables);
    scheduleSaveValues(values);
  };

  const persister: any = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );

  return persister;
};
