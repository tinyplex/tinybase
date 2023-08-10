import {
  Cell,
  GetTransactionChanges,
  Store,
  Tables,
  Value,
  Values,
} from '../../types/store';
import {Cmd, getCommandFunctions} from './commands';
import {DEFAULT_ROW_ID_COLUMN_NAME, SINGLE_ROW_ID} from './common';
import {Persister, PersisterListener} from '../../types/persisters';
import {isUndefined, promiseAll} from '../../common/other';
import {objIsEmpty, objNew} from '../../common/obj';
import {DefaultedTabularConfig} from './config';
import {Id} from '../../types/common';
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
  const [refreshSchema, loadTable, saveTable] = getCommandFunctions(
    cmd,
    managedTableNames,
  );

  const saveTables = async (
    tables:
      | Tables
      | {
          [tableId: Id]: {
            [rowId: Id]: {[cellId: Id]: Cell | null} | null;
          } | null;
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
          const table = tables[tableId];
          if (!partial || table !== undefined) {
            await saveTable(
              tableName,
              rowIdColumnName,
              table,
              deleteEmptyColumns,
              deleteEmptyTable,
              partial,
            );
          }
        },
      ),
    );

  const saveValues = async (
    values:
      | Values
      | {
          [valueId: Id]: Value | null;
        },
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
    getTransactionChanges?: GetTransactionChanges,
  ): Promise<void> => {
    await refreshSchema();
    if (!isUndefined(getTransactionChanges)) {
      const [tableChanges, valueChanges] = getTransactionChanges();
      await saveTables(tableChanges, true);
      await saveValues(valueChanges, true);
    } else {
      const [tables, values] = getContent();
      await saveTables(tables);
      await saveValues(values);
    }
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
