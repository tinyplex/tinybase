import {Cmd, Schema, getCommandFunctions} from './commands';
import {DpcTabular, Persister, PersisterListener} from '../../types/persisters';
import {Store, Table, Tables, Values} from '../../types/store';
import {arrayFilter, arrayMap} from '../../common/array';
import {objIsEmpty, objMap, objNew} from '../../common/obj';
import {Id} from '../../types/common';
import {SINGLE_ROW_ID} from './common';
import {createCustomPersister} from '../../persisters';
import {getConfigFunctions} from './tabular-config';
import {mapKeys} from '../../common/map';
import {promiseAll} from '../../common/other';

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

  const [getSchema, loadSingleRow, saveSingleRow, loadTable] =
    getCommandFunctions(cmd);

  const scheduleSaveTables = (tables: Tables) =>
    tablesSave ? objMap(tables, scheduleSaveTable) : 0;

  const scheduleSaveTable = (table: Table, tableId: Id) => {
    const [getTableName, rowIdColumnName] = getTablesSaveConfig(tableId);
    const tableName = getTableName(tableId);
    if (tableName !== false) {
      persister.schedule(
        getSchema,
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
          getSchema,
          async () =>
            await saveSingleRow(
              valuesTableName,
              valuesRowIdColumnName,
              SINGLE_ROW_ID,
              values,
            ),
        )
      : 0;

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

  const loadValues = async (): Promise<Values> =>
    valuesLoad
      ? await loadSingleRow(valuesTableName, valuesRowIdColumnName)
      : {};

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    const schema = await getSchema();
    const tables = await loadTables(schema);
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
