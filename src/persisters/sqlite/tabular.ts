import {Cmd, Schema, getCommandFunctions} from './commands';
import {DpcTabular, Persister, PersisterListener} from '../../types/persisters';
import {Store, Tables, Values} from '../../types/store';
import {arrayFilter, arrayMap} from '../../common/array';
import {isUndefined, promiseAll} from '../../common/other';
import {objIsEmpty, objMap, objNew} from '../../common/obj';
import {SINGLE_ROW_ID} from './common';
import {createCustomPersister} from '../../persisters';
import {getConfigFunctions} from './tabular-config';
import {mapKeys} from '../../common/map';

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

  const [getSchema, loadSingleRow, saveSingleRow, loadTable, saveTable] =
    getCommandFunctions(cmd);

  const getSaveTablesActions = (tables: Tables) =>
    tablesSave
      ? objMap(tables, (table, tableId) => {
          const [getTableName, rowIdColumnName, deleteColumns] =
            getTablesSaveConfig(tableId);
          const tableName = getTableName(tableId);
          return tableName !== false
            ? async () =>
                await saveTable(
                  tableName,
                  rowIdColumnName,
                  deleteColumns,
                  table,
                )
            : null;
        })
      : [];

  const getSaveValuesAction = (values: Values) =>
    valuesSave
      ? async () =>
          await saveSingleRow(
            valuesTableName,
            valuesRowIdColumnName,
            SINGLE_ROW_ID,
            values,
          )
      : null;

  const loadTables = async (schema: Schema): Promise<Tables> =>
    tablesLoad
      ? objNew(
          arrayFilter(
            await promiseAll(
              arrayMap(mapKeys(schema), async (tableName) => {
                if (tableName != valuesTableName) {
                  const [getTableId, rowIdColumnName] =
                    getTablesLoadConfig(tableName);
                  const tableId = getTableId(tableName);
                  return tableId
                    ? [tableId, await loadTable(tableName, rowIdColumnName)]
                    : null;
                }
              }),
            ),
            (pair) => pair && pair[1],
          ),
        )
      : {};

  const loadValues = async (): Promise<Values | null> =>
    valuesLoad
      ? await loadSingleRow(valuesTableName, valuesRowIdColumnName)
      : {};

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    const schema = await getSchema();
    const tables = await loadTables(schema);
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
      getSchema,
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
