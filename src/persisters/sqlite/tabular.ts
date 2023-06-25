import {Cmd, getCommandFunctions} from './commands';
import {DEFAULT_ROW_ID_COLUMN_NAME, SINGLE_ROW_ID} from './common';
import {DpcTabular, Persister, PersisterListener} from '../../types/persisters';
import {Store, Tables, Values} from '../../types/store';
import {arrayFilter, arrayMap} from '../../common/array';
import {isUndefined, promiseAll} from '../../common/other';
import {mapKeys, mapMap} from '../../common/map';
import {objIsEmpty, objNew} from '../../common/obj';
import {collValues} from '../../common/coll';
import {createCustomPersister} from '../../persisters';
import {getDefaultedTabularConfig} from './config';
import {setNew} from '../../common/set';

export const createTabularSqlitePersister = <ListeningHandle>(
  store: Store,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  config: DpcTabular,
): Persister => {
  const [
    tablesLoadConfig,
    tablesSaveConfig,
    [valuesLoad, valuesSave, valuesTableName],
  ] = getDefaultedTabularConfig(config);

  const [refreshSchema, loadSingleRow, saveSingleRow, loadTable, saveTable] =
    getCommandFunctions(
      cmd,
      collValues(
        setNew([
          valuesTableName,
          ...mapKeys(tablesLoadConfig),
          ...arrayMap(collValues(tablesSaveConfig), ([tableName]) => tableName),
        ]),
      ),
    );

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
            deleteEmptyColumns,
            deleteEmptyTable,
            tables[tableId],
          ),
      ),
    );

  const saveValues = async (values: Values) =>
    valuesSave
      ? await saveSingleRow(
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
      ? await loadSingleRow(valuesTableName, DEFAULT_ROW_ID_COLUMN_NAME)
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
  ): Promise<void> => {
    const [tables, values] = getContent();
    await refreshSchema();
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
