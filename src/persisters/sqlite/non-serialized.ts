import {Cmd, getCommandFunctions} from './commands';
import {IdObj, objDel, objIsEmpty, objMap, objNew} from '../../common/obj';
import {Persister, PersisterListener} from '../../types/persisters';
import {SINGLE_ROW_ID, escapeId} from './common';
import {Store, Table, Tables, Values} from '../../types/store';
import {arrayFilter, arrayMap} from '../../common/array';
import {isUndefined, promiseAll} from '../../common/other';
import {Id} from '../../types/common';
import {createCustomPersister} from '../../persisters';

export const createNonSerializedSqlitePersister = <ListeningHandle>(
  store: Store,
  rowIdColumn: string,
  valuesTable: string,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  const [ensureTable, getSingleRow, setRow] = getCommandFunctions(
    cmd,
    rowIdColumn,
  );

  const rowArrayToObject = (rows: IdObj<any>[]): IdObj<IdObj<any>> =>
    objNew(
      arrayFilter(
        arrayMap(rows, (row) => [row[rowIdColumn], objDel(row, rowIdColumn)]),
        ([rowId, row]) => !isUndefined(rowId) && !objIsEmpty(row),
      ),
    );

  const setValues = (values: Values) => {
    persister.schedule(
      async () => await ensureTable(valuesTable),
      async () => await setRow(valuesTable, SINGLE_ROW_ID, values),
    );
  };

  const setTable = (table: Table, tableId: Id) => {
    persister.schedule(
      async () => await ensureTable(tableId),
      ...objMap(
        table,
        (row, rowId) => async () => await setRow(tableId, rowId, row),
      ),
    );
  };

  const getPersisted = async (): Promise<[Tables, Values] | undefined> => {
    const tables = objNew(
      arrayFilter(
        await promiseAll(
          arrayMap(
            (await cmd(
              `SELECT name FROM sqlite_schema WHERE type='table'AND name!=?`,
              [valuesTable],
            )) as {name: string}[],
            async ({name}: {name: string}) => [
              name as string,
              rowArrayToObject(await cmd(`SELECT * FROM${escapeId(name)}`)),
            ],
          ),
        ),
        ([_, table]) => !objIsEmpty(table),
      ),
    );
    const values = await getSingleRow(valuesTable);
    return !objIsEmpty(tables) || !objIsEmpty(values)
      ? [tables as Tables, values as Values]
      : undefined;
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    const [tables, values] = getContent();
    objMap(tables, setTable);
    setValues(values);
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
