import {Cmd, getCommandFunctions} from './commands';
import {DEFAULT_ROW_ID_COLUMN_NAME, SINGLE_ROW_ID} from './common';
import {GetTransactionChanges, Store, Tables, Values} from '../../types/store';
import {Persister, PersisterListener} from '../../types/persisters';
import {isUndefined, promiseAll} from '../../common/other';
import {objIsEmpty, objNew} from '../../common/obj';
import {DefaultedTabularConfig} from './config';
import {arrayFilter} from '../../common/array';
import {createCustomPersister} from '../../persisters';
import {mapMap} from '../../common/map';

export const createTabularSqlitePersister = <ListeningHandle>(
  store: Store,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  [
    tablesLoadConfig,
    tablesSaveConfig,
    [valuesLoad, valuesSave, valuesTableName],
  ]: DefaultedTabularConfig,
  managedTableNames: string[],
): Persister => {
  const [
    refreshSchema,
    loadSingleRowTable,
    saveSingleRowTable,
    loadTable,
    ,
    saveTable,
  ] = getCommandFunctions(cmd, managedTableNames);

  const saveTables = async (tables: Tables) =>
    await promiseAll(
      mapMap(
        tablesSaveConfig,
        async (
          [tableName, rowIdColumnName, deleteEmptyColumns, deleteEmptyTable],
          tableId,
        ) =>
          await saveTable(
            tableName,
            rowIdColumnName,
            tables[tableId],
            deleteEmptyColumns,
            deleteEmptyTable,
          ),
      ),
    );

  const saveValues = async (values: Values) =>
    valuesSave
      ? await saveSingleRowTable(
          valuesTableName,
          DEFAULT_ROW_ID_COLUMN_NAME,
          SINGLE_ROW_ID,
          values,
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
      ? await loadSingleRowTable(valuesTableName, DEFAULT_ROW_ID_COLUMN_NAME)
      : {};

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    await refreshSchema();
    const tables = await loadTables();
    const values = await loadValues();
    return !objIsEmpty(tables) || !isUndefined(values)
      ? [tables as Tables, values as Values]
      : undefined;
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
    _getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
    await refreshSchema();
    const [tables, values] = getContent();
    await saveTables(tables);
    await saveValues(values);
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
