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
  rowIdColumn: string,
): [
  ensureTable: (table: string) => Promise<void>,
  getSingleRow: (table: string) => Promise<IdObj<any>>,
  setRow: (table: string, rowId: Id, row: Row | Values) => Promise<void>,
] => {
  const ensureTable = async (table: string): Promise<void> => {
    await cmd(
      `CREATE TABLE IF NOT EXISTS${escapeId(table)}(${escapeId(rowIdColumn)} ` +
        `PRIMARY KEY ON CONFLICT REPLACE);`,
    );
  };

  const ensureColumns = async (table: string, row: Row): Promise<void> => {
    const columns = setNew(
      arrayMap(
        await cmd(`SELECT name FROM pragma_table_info(?) WHERE name != ?`, [
          table,
          rowIdColumn,
        ]),
        (row) => row['name'],
      ),
    );
    await promiseAll(
      objMap(row, async (_, cellId) =>
        collHas(columns, cellId)
          ? 0
          : await cmd(`ALTER TABLE${escapeId(table)}ADD${escapeId(cellId)}`),
      ),
    );
  };

  const getSingleRow = async (table: string): Promise<IdObj<any>> => {
    await ensureTable(table);
    const rows = await cmd(
      `SELECT*FROM${escapeId(table)}WHERE ${escapeId(rowIdColumn)}=?`,
      [SINGLE_ROW_ID],
    );
    return arrayIsEmpty(rows) || !objHas(rows[0], rowIdColumn)
      ? {}
      : objDel(rows[0], rowIdColumn);
  };

  const setRow = async (
    table: string,
    rowId: Id,
    row: Row | Values,
  ): Promise<void> => {
    const columns = arrayMap(
      objIds(row),
      (cellId) => `,${escapeId(cellId)}`,
    ).join(EMPTY_STRING);
    const values = objValues(row);
    await ensureColumns(table, row);
    await cmd(
      `INSERT INTO${escapeId(table)}(${escapeId(
        rowIdColumn,
      )}${columns})VALUES(?${',?'.repeat(arrayLength(values))})`,
      [rowId, ...values],
    );
  };

  return [ensureTable, getSingleRow, setRow];
};
