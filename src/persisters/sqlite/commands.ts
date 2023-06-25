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
import {collDel, collHas, collValues} from '../../common/coll';
import {isUndefined, promiseAll} from '../../common/other';
import {setAdd, setNew} from '../../common/set';
import {Id} from '../../types/common';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;
type Schema = IdMap2<string>;

const SELECT_STAR_FROM = 'SELECT*FROM';
const FROM_PRAGMA_TABLE = 'FROM pragma_table_';
const WHERE = 'WHERE';
const WHERE_MAIN_TABLE =
  WHERE + ` schema='main'AND type='table'AND name!='sqlite_schema'`;

export const getCommandFunctions = (
  cmd: Cmd,
): [
  refreshSchema: () => Promise<Schema>,
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
  loadTable: (tableName: string, rowIdColumnName: string) => Promise<Table>,
  saveTable: (
    tableName: string,
    rowIdColumnName: string,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    table: Table,
  ) => Promise<void>,
] => {
  const schemaMap: Schema = mapNew();

  const canSelect = (tableName: string, rowIdColumnName: string): boolean =>
    !isUndefined(mapGet(mapGet(schemaMap, tableName), rowIdColumnName));

  const refreshSchema = async (): Promise<Schema> =>
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
    await saveTable(tableName, rowIdColumnName, true, true, {[rowId]: row});

  const loadTable = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<Table> =>
    canSelect(tableName, rowIdColumnName)
      ? objNew(
          arrayFilter(
            arrayMap(
              await cmd(SELECT_STAR_FROM + escapeId(tableName)),
              (row) => [
                row[rowIdColumnName],
                objDel({...row}, rowIdColumnName),
              ],
            ),
            ([rowId, row]) => !isUndefined(rowId) && !objIsEmpty(row),
          ),
        )
      : {};

  const saveTable = async (
    tableName: string,
    rowIdColumnName: string,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    table: Table,
  ): Promise<void> => {
    const cellIds = setNew<string>();
    objMap(table ?? {}, (row) =>
      arrayMap(objIds(row), (cellId) => setAdd(cellIds, cellId)),
    );
    const columnNames = collValues(cellIds);

    if (
      arrayIsEmpty(columnNames) &&
      collHas(schemaMap, tableName) &&
      deleteEmptyTable
    ) {
      await cmd('DROP TABLE' + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    if (!arrayIsEmpty(columnNames) && !collHas(schemaMap, tableName)) {
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
            (columnName) => [columnName, EMPTY_STRING] as [string, string],
          ),
        ]),
      );
    } else {
      const tableSchemaMap = mapGet(schemaMap, tableName);
      const columnNamesAccountedFor = setNew(mapKeys(tableSchemaMap));
      await promiseAll([
        ...arrayMap(columnNames, async (columnName) => {
          if (!collDel(columnNamesAccountedFor, columnName)) {
            await cmd(
              `ALTER TABLE${escapeId(tableName)}ADD${escapeId(columnName)}`,
            );
            mapSet(tableSchemaMap, columnName, EMPTY_STRING);
          }
        }),
        ...(deleteEmptyColumns
          ? arrayMap(
              collValues(columnNamesAccountedFor),
              async (columnName) => {
                if (columnName != rowIdColumnName) {
                  await cmd(
                    `ALTER TABLE${escapeId(tableName)}DROP${escapeId(
                      columnName,
                    )}`,
                  );
                  mapSet(tableSchemaMap, columnName);
                }
              },
            )
          : []),
      ]);
    }

    if (!arrayIsEmpty(columnNames)) {
      const insertSlots: string[] = [];
      const insertBinds: any[] = [];
      const deleteRowIds: string[] = [];
      const allColumnNames = arrayFilter(
        mapKeys(mapGet(schemaMap, tableName)),
        (columnName) => columnName != rowIdColumnName,
      );
      objMap(table, (row, rowId) => {
        arrayPush(
          insertSlots,
          `(?${strRepeat(',?', arrayLength(allColumnNames))})`,
        );
        arrayPush(
          insertBinds,
          rowId,
          ...arrayMap(allColumnNames, (cellId) => row[cellId]),
        );
        arrayPush(deleteRowIds, rowId);
      });
      await cmd(
        'INSERT INTO' +
          escapeId(tableName) +
          '(' +
          escapeId(rowIdColumnName) +
          arrayJoin(
            arrayMap(
              allColumnNames,
              (columnName) => COMMA + escapeId(columnName),
            ),
          ) +
          ')VALUES' +
          arrayJoin(insertSlots, COMMA) +
          'ON CONFLICT(' +
          escapeId(rowIdColumnName) +
          ')DO UPDATE SET' +
          arrayJoin(
            arrayMap(
              allColumnNames,
              (columnName) =>
                escapeId(columnName) + '=excluded.' + escapeId(columnName),
            ),
            COMMA,
          ),
        insertBinds,
      );
      await cmd(
        'DELETE FROM' +
          escapeId(tableName) +
          WHERE +
          escapeId(rowIdColumnName) +
          'NOT IN(' +
          arrayJoin(
            arrayMap(deleteRowIds, () => '?'),
            COMMA,
          ) +
          ')',
        deleteRowIds,
      );
    } else {
      await cmd('DELETE FROM' + escapeId(tableName));
    }
  };

  return [refreshSchema, loadSingleRow, saveSingleRow, loadTable, saveTable];
};
