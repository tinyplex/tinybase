import {Cmd, getCommandFunctions} from './commands';
import {DEFAULT_ROW_ID_COLUMN_NAME, SINGLE_ROW_ID} from './common';
import {DpcTabular, Persister, PersisterListener} from '../../types/persisters';
import {Store, Tables, Values} from '../../types/store';
import {isUndefined, promiseAll} from '../../common/other';
import {objIsEmpty, objNew} from '../../common/obj';
import {arrayFilter} from '../../common/array';
import {createCustomPersister} from '../../persisters';
import {getDefaultedConfig} from './tabular-config';
import {mapMap} from '../../common/map';

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
  ] = getDefaultedConfig(config);

  const [refreshSchema, loadSingleRow, saveSingleRow, loadTable, saveTable] =
    getCommandFunctions(cmd);

  const getSaveTablesActions = (tables: Tables) =>
    mapMap(
      tablesSaveConfig,
      (
          [tableName, rowIdColumnName, deleteEmptyColumns, deleteEmptyTable],
          tableId,
        ) =>
        async () =>
          await saveTable(
            tableName,
            rowIdColumnName,
            deleteEmptyColumns,
            deleteEmptyTable,
            tables[tableId],
          ),
    );

  const getSaveValuesAction = (values: Values) =>
    valuesSave
      ? async () =>
          await saveSingleRow(
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
        (pair) => pair[1],
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
    persister.schedule(
      refreshSchema,
      ...getSaveTablesActions(tables),
      getSaveValuesAction(values),
    );
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
