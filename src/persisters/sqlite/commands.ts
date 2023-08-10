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

export const getCommandFunctions = (
  cmd: Cmd,
  managedTableNames: string[],
): [
  refreshSchema: () => Promise<Schema>,
  loadSingleRowTable: (
    tableName: string,
    rowIdColumnName: string,
  ) => Promise<IdObj<any> | null>,
  saveSingleRowTable: (
    table: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ) => Promise<void>,
  loadTable: (tableName: string, rowIdColumnName: string) => Promise<Table>,
  savePartialTable: (
    tableName: string,
    rowIdColumnName: string,
    table: Table,
  ) => Promise<void>,
  saveTable: (
    tableName: string,
    rowIdColumnName: string,
    table: Table,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial?: boolean,
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
              'SELECT name ' +
                FROM_PRAGMA_TABLE +
                'list ' +
                `WHERE schema='main'AND type='table'AND name IN(` +
                getPlaceholders(managedTableNames) +
                `)`,
              managedTableNames,
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

  const loadSingleRowTable = async (
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

  const saveSingleRowTable = async (
    tableName: string,
    rowIdColumnName: string,
    rowId: Id,
    row: Row | Values,
  ): Promise<void> =>
    await saveTable(tableName, rowIdColumnName, {[rowId]: row}, true, true);

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

  const savePartialTable = async (
    tableName: string,
    rowIdColumnName: string,
    table: Table,
  ): Promise<void> =>
    await saveTable(tableName, rowIdColumnName, table, false, false, true);

  const saveTable = async (
    tableName: string,
    rowIdColumnName: string,
    table: Table,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial = false,
  ): Promise<void> => {
    const cellIds = setNew<string>();
    objMap(table ?? {}, (row) =>
      arrayMap(objIds(row), (cellId) => setAdd(cellIds, cellId)),
    );
    const tableColumnNames = collValues(cellIds);

    // Delete the table
    if (
      deleteEmptyTable &&
      arrayIsEmpty(tableColumnNames) &&
      collHas(schemaMap, tableName)
    ) {
      await cmd('DROP TABLE' + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    // Create the table or alter or drop columns
    if (!arrayIsEmpty(tableColumnNames) && !collHas(schemaMap, tableName)) {
      await cmd(
        `CREATE TABLE${escapeId(tableName)}(${escapeId(rowIdColumnName)} ` +
          `PRIMARY KEY ON CONFLICT REPLACE${arrayJoin(
            arrayMap(tableColumnNames, (cellId) => COMMA + escapeId(cellId)),
          )});`,
      );
      mapSet(
        schemaMap,
        tableName,
        mapNew([
          [rowIdColumnName, EMPTY_STRING],
          ...arrayMap(
            tableColumnNames,
            (columnName) => [columnName, EMPTY_STRING] as [string, string],
          ),
        ]),
      );
    } else {
      const tableSchemaMap = mapGet(schemaMap, tableName);
      const columnNamesAccountedFor = setNew(mapKeys(tableSchemaMap));
      await promiseAll([
        ...arrayMap(tableColumnNames, async (columnName) => {
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

    // Insert or update or delete data
    if (!arrayIsEmpty(tableColumnNames)) {
      const args: any[] = [];
      const deleteRowIds: string[] = [];
      const changingColumnNames = partial
        ? tableColumnNames
        : arrayFilter(
            mapKeys(mapGet(schemaMap, tableName)),
            (columnName) => columnName != rowIdColumnName,
          );
      objMap(table, (row, rowId) => {
        arrayPush(
          args,
          rowId,
          ...arrayMap(changingColumnNames, (cellId) => row[cellId]),
        );
        arrayPush(deleteRowIds, rowId);
      });
      await upsert(cmd, tableName, rowIdColumnName, changingColumnNames, args);
      if (!partial) {
        await cmd(
          'DELETE FROM' +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            'NOT IN(' +
            getPlaceholders(deleteRowIds) +
            ')',
          deleteRowIds,
        );
      }
    } else if (!partial && collHas(schemaMap, tableName)) {
      await cmd('DELETE FROM' + escapeId(tableName));
    }
  };

  return [
    refreshSchema,
    loadSingleRowTable,
    saveSingleRowTable,
    loadTable,
    savePartialTable,
    saveTable,
  ];
};

const upsert = async (
  cmd: Cmd,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  args: any[],
) =>
  await cmd(
    'INSERT INTO' +
      escapeId(tableName) +
      '(' +
      escapeId(rowIdColumnName) +
      arrayJoin(
        arrayMap(
          changingColumnNames,
          (columnName) => COMMA + escapeId(columnName),
        ),
      ) +
      ')VALUES' +
      strRepeat(
        `,(?${strRepeat(',?', arrayLength(changingColumnNames))})`,
        arrayLength(args) / (arrayLength(changingColumnNames) + 1),
      ).substring(1) +
      'ON CONFLICT(' +
      escapeId(rowIdColumnName) +
      ')DO UPDATE SET' +
      arrayJoin(
        arrayMap(
          changingColumnNames,
          (columnName) =>
            escapeId(columnName) + '=excluded.' + escapeId(columnName),
        ),
        COMMA,
      ),
    args,
  );

const getPlaceholders = (array: any[]) =>
  arrayJoin(
    arrayMap(array, () => '?'),
    COMMA,
  );
