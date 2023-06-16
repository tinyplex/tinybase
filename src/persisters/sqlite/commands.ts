import {
  IdObj,
  objDel,
  objHas,
  objIds,
  objMap,
  objValues,
} from '../../common/obj';
import {Row, Values} from '../../types/store';
import {SINGLE_ROW_ID, escapeId} from './common';
import {arrayIsEmpty, arrayLength, arrayMap} from '../../common/array';
import {EMPTY_STRING} from '../../common/strings';
import {Id} from '../../types/common';
import {collHas} from '../../common/coll';
import {promiseAll} from '../../common/other';
import {setNew} from '../../common/set';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;

export const getCommandFunctions = (
  cmd: Cmd,
): [
  ensureTable: (tableName: string, rowIdColumnName: string) => Promise<void>,
  loadSingleRow: (
    tableName: string,
    rowIdColumnName: string,
  ) => Promise<IdObj<any>>,
  saveSingleRow: (
    table: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ) => Promise<void>,
] => {
  const ensureTable = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<void> => {
    await cmd(
      `CREATE TABLE IF NOT EXISTS${escapeId(tableName)}(${escapeId(
        rowIdColumnName,
      )} ` + `PRIMARY KEY ON CONFLICT REPLACE);`,
    );
  };

  const ensureColumns = async (
    tableName: string,
    rowIdColumnName: string,
    row: Row,
  ): Promise<void> => {
    const columns = setNew(
      arrayMap(
        await cmd(`SELECT name FROM pragma_table_info(?) WHERE name != ?`, [
          tableName,
          rowIdColumnName,
        ]),
        (row) => row['name'],
      ),
    );
    await promiseAll(
      objMap(row, async (_, cellId) =>
        collHas(columns, cellId)
          ? 0
          : await cmd(
              `ALTER TABLE${escapeId(tableName)}ADD${escapeId(cellId)}`,
            ),
      ),
    );
  };

  const loadSingleRow = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<IdObj<any>> => {
    await ensureTable(tableName, rowIdColumnName);
    const rows = await cmd(
      `SELECT*FROM${escapeId(tableName)}WHERE ${escapeId(rowIdColumnName)}=?`,
      [SINGLE_ROW_ID],
    );
    return arrayIsEmpty(rows) || !objHas(rows[0], rowIdColumnName)
      ? {}
      : objDel(rows[0], rowIdColumnName);
  };

  const saveSingleRow = async (
    tableName: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ): Promise<void> => {
    const columns = arrayMap(
      objIds(row),
      (cellId) => `,${escapeId(cellId)}`,
    ).join(EMPTY_STRING);
    const values = objValues(row);
    await ensureColumns(tableName, rowIdColumnName, row);
    await cmd(
      `INSERT INTO${escapeId(tableName)}(${escapeId(
        rowIdColumnName,
      )}${columns})VALUES(?${',?'.repeat(arrayLength(values))})`,
      [rowId, ...values],
    );
  };

  return [ensureTable, loadSingleRow, saveSingleRow];
};
