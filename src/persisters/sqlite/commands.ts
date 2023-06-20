import {COMMA, EMPTY_STRING, strRepeat} from '../../common/strings';
import {
  IdMap2,
  mapEnsure,
  mapGet,
  mapKeys,
  mapMatch,
  mapNew,
  mapSet,
} from '../../common/map';
import {
  IdObj,
  IdObj2,
  objDel,
  objIds,
  objIsEmpty,
  objMap,
  objNew,
} from '../../common/obj';
import {Row, Table, Values} from '../../types/store';
import {SINGLE_ROW_ID, escapeId} from './common';
import {
  arrayFilter,
  arrayIsEmpty,
  arrayJoin,
  arrayLength,
  arrayMap,
  arrayPush,
} from '../../common/array';
import {collHas, collValues} from '../../common/coll';
import {isUndefined, promiseAll} from '../../common/other';
import {setAdd, setNew} from '../../common/set';
import {Id} from '../../types/common';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;
export type Schema = IdMap2<string>;

const SELECT_STAR_FROM = 'SELECT*FROM';
const FROM_PRAGMA_TABLE = 'FROM pragma_table_';
const WHERE = 'WHERE';
const WHERE_MAIN_TABLE =
  WHERE + ` schema='main'AND type='table'AND name!='sqlite_schema'`;

export const getCommandFunctions = (
  cmd: Cmd,
): [
  getSchema: () => Promise<Schema>,
  loadSingleRow: (
    tableName: string,
    rowIdColumnName: string,
  ) => Promise<IdObj<any> | null>,
  saveSingleRow: (
    table: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ) => Promise<void>,
  loadTable: (
    tableName: string,
    rowIdColumnName: string,
  ) => Promise<IdObj2<any> | null>,
  saveTable: (
    tableName: string,
    rowIdColumnName: string,
    table: Table,
  ) => Promise<void>,
] => {
  const schemaMap: Schema = mapNew();

  const ensureTable = async (
    tableName: string,
    rowIdColumnName: string,
    columnNames: string[],
  ): Promise<void> => {
    if (!collHas(schemaMap, tableName)) {
      await cmd(
        `CREATE TABLE${escapeId(tableName)}(${escapeId(rowIdColumnName)} ` +
          `PRIMARY KEY ON CONFLICT REPLACE${arrayJoin(
            arrayMap(columnNames, (cellId) => COMMA + escapeId(cellId)),
          )});`,
      );
      mapSet(
        schemaMap,
        tableName,
        mapNew([
          [rowIdColumnName, EMPTY_STRING],
          ...arrayMap(
            columnNames,
            (cellId) => [cellId, EMPTY_STRING] as [string, string],
          ),
        ]),
      );
    } else {
      const tableSchemaMap = mapGet(schemaMap, tableName);
      const columns = setNew(mapKeys(tableSchemaMap));
      await promiseAll(
        arrayMap(columnNames, async (cellId) => {
          if (!collHas(columns, cellId) && cellId != rowIdColumnName) {
            await cmd(
              `ALTER TABLE${escapeId(tableName)}ADD${escapeId(cellId)}`,
            );
            mapSet(tableSchemaMap, cellId, EMPTY_STRING);
          }
        }),
      );
    }
  };

  const canSelect = (tableName: string, rowIdColumnName: string): boolean =>
    !isUndefined(mapGet(mapGet(schemaMap, tableName), rowIdColumnName));

  const getSchema = async (): Promise<Schema> =>
    mapMatch(
      schemaMap,
      objNew(
        await promiseAll(
          arrayMap(
            await cmd(
              'SELECT name ' + FROM_PRAGMA_TABLE + 'list ' + WHERE_MAIN_TABLE,
            ),
            async ({name: tableName}) => [
              tableName,
              objNew(
                arrayMap(
                  await cmd(
                    'SELECT name,type ' + FROM_PRAGMA_TABLE + 'info(?)',
                    [tableName],
                  ),
                  ({name: columnName, type}) => [columnName, type],
                ),
              ),
            ],
          ),
        ),
      ) as IdObj2<string>,
      (_, tableName, tableSchema) =>
        mapSet(
          schemaMap,
          tableName,
          mapMatch(
            mapEnsure(schemaMap, tableName, mapNew<Id, string>),
            tableSchema,
            (tableSchemaMap, columnName, value) => {
              if (value != mapGet(tableSchemaMap, columnName)) {
                mapSet(tableSchemaMap, columnName, value);
              }
            },
            (tableSchema, columnName) => mapSet(tableSchema, columnName),
          ),
        ),
      (_, name) => mapSet(schemaMap, name),
    );

  const loadSingleRow = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<IdObj<any> | null> => {
    const rows = canSelect(tableName, rowIdColumnName)
      ? await cmd(
          SELECT_STAR_FROM +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            '=?',
          [SINGLE_ROW_ID],
        )
      : [];
    return arrayIsEmpty(rows) ? null : objDel(rows[0], rowIdColumnName);
  };

  const saveSingleRow = async (
    tableName: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ): Promise<void> =>
    await saveTable(tableName, rowIdColumnName, {[rowId]: row});

  const loadTable = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<IdObj2<any> | null> =>
    canSelect(tableName, rowIdColumnName)
      ? objNew(
          arrayFilter(
            arrayMap(
              await cmd(SELECT_STAR_FROM + escapeId(tableName)),
              (row) => [row[rowIdColumnName], objDel(row, rowIdColumnName)],
            ),
            ([rowId, row]) => !isUndefined(rowId) && !objIsEmpty(row),
          ),
        )
      : null;

  const saveTable = async (
    tableName: string,
    rowIdColumnName: string,
    table: Table,
  ): Promise<void> => {
    const cellIds = setNew<string>();
    objMap(table, (row) =>
      arrayMap(objIds(row), (cellId) => setAdd(cellIds, cellId)),
    );
    const columnNames = collValues(cellIds);
    await ensureTable(tableName, rowIdColumnName, columnNames);

    const slots: string[] = [];
    const args: any[] = [];
    objMap(table, (row, rowId) => {
      arrayPush(slots, `(?${strRepeat(',?', arrayLength(columnNames))})`);
      arrayPush(args, rowId, ...arrayMap(columnNames, (cellId) => row[cellId]));
    });

    await cmd(
      'INSERT INTO' +
        escapeId(tableName) +
        '(' +
        escapeId(rowIdColumnName) +
        arrayJoin(
          arrayMap(columnNames, (columnName) => COMMA + escapeId(columnName)),
        ) +
        ')VALUES' +
        arrayJoin(slots, COMMA),
      args,
    );
  };

  return [getSchema, loadSingleRow, saveSingleRow, loadTable, saveTable];
};
