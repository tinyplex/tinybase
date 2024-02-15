import {
  arrayFilter,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
  arrayPush,
} from '../../common/array';
import {collDel, collHas, collValues} from '../../common/coll';
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
  objNew,
  objToArray,
  objValues,
} from '../../common/obj';
import {isUndefined, promiseAll, size, slice} from '../../common/other';
import {setAdd, setNew} from '../../common/set';
import {COMMA, EMPTY_STRING, strRepeat} from '../../common/strings';
import {Id} from '../../types/common';
import {Cell, Table, ValueOrUndefined} from '../../types/store';
import {escapeId, SELECT} from './common';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;
type Schema = IdMap2<string>;

const TABLE = 'TABLE';
const ALTER_TABLE = 'ALTER ' + TABLE;
const DELETE_FROM = 'DELETE FROM';
const SELECT_STAR_FROM = SELECT + '*FROM';
const FROM_PRAGMA_TABLE = 'FROM pragma_table_';
const WHERE = 'WHERE';

export const getCommandFunctions = (
  cmd: Cmd,
  managedTableNames: string[],
  onIgnoredError: ((error: any) => void) | undefined,
  useOnConflict?: boolean,
): [
  refreshSchema: () => Promise<Schema>,
  loadTable: (tableName: string, rowIdColumnName: string) => Promise<Table>,
  saveTable: (
    tableName: string,
    rowIdColumnName: string,
    content: {
      [contentId: Id]: {
        [contentSubId: Id]: Cell | null | ValueOrUndefined;
      } | null;
    } | null,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial?: boolean,
  ) => Promise<void>,
  transaction: <Return>(actions: () => Promise<Return>) => Promise<Return>,
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
                `WHERE schema='main'AND(type='table'OR type='view')` +
                'AND name IN(' +
                getPlaceholders(managedTableNames) +
                `)ORDER BY name`,
              managedTableNames,
            ),
            async ({name: tableName}) => [
              tableName,
              objNew(
                arrayMap(
                  await cmd(
                    SELECT + ' name,type ' + FROM_PRAGMA_TABLE + 'info(?)',
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
    content: {
      [contentId: Id]: {
        [contentSubId: Id]: Cell | null | ValueOrUndefined;
      } | null;
    } | null,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial = false,
  ): Promise<void> => {
    const tableCellOrValueIds = setNew<string>();
    objToArray(content ?? {}, (contentRow) =>
      arrayMap(objIds(contentRow ?? {}), (cellOrValueId) =>
        setAdd(tableCellOrValueIds, cellOrValueId),
      ),
    );
    const tableColumnNames = collValues(tableCellOrValueIds);

    // Delete the table
    if (
      !partial &&
      deleteEmptyTable &&
      arrayIsEmpty(tableColumnNames) &&
      collHas(schemaMap, tableName)
    ) {
      await cmd('DROP ' + TABLE + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    // Create the table or alter or drop columns
    if (!arrayIsEmpty(tableColumnNames) && !collHas(schemaMap, tableName)) {
      await cmd(
        `CREATE ` +
          TABLE +
          escapeId(tableName) +
          '(' +
          escapeId(rowIdColumnName) +
          ` PRIMARY KEY ON CONFLICT REPLACE${arrayJoin(
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
              ALTER_TABLE + escapeId(tableName) + 'ADD' + escapeId(columnName),
            );
            mapSet(tableSchemaMap, columnName, EMPTY_STRING);
          }
        }),
        ...(!partial && deleteEmptyColumns
          ? arrayMap(
              collValues(columnNamesAccountedFor),
              async (columnName) => {
                if (columnName != rowIdColumnName) {
                  await cmd(
                    ALTER_TABLE +
                      escapeId(tableName) +
                      'DROP' +
                      escapeId(columnName),
                  );
                  mapSet(tableSchemaMap, columnName);
                }
              },
            )
          : []),
      ]);
    }

    // Insert or update or delete data
    if (partial) {
      if (isUndefined(content)) {
        await cmd(DELETE_FROM + escapeId(tableName) + WHERE + ' 1');
      } else {
        await promiseAll(
          objToArray(content, async (row, rowId) => {
            if (isUndefined(row)) {
              await cmd(
                DELETE_FROM +
                  escapeId(tableName) +
                  WHERE +
                  escapeId(rowIdColumnName) +
                  '=?',
                [rowId],
              );
            } else if (!arrayIsEmpty(tableColumnNames)) {
              await upsert(
                cmd,
                tableName,
                rowIdColumnName,
                objIds(row),
                [rowId, ...objValues(row)],
                useOnConflict,
              );
            }
          }),
        );
      }
    } else {
      if (!arrayIsEmpty(tableColumnNames)) {
        const changingColumnNames = arrayFilter(
          mapKeys(mapGet(schemaMap, tableName)),
          (columnName) => columnName != rowIdColumnName,
        );
        const args: any[] = [];
        const deleteRowIds: string[] = [];
        objToArray(content ?? {}, (row, rowId) => {
          arrayPush(
            args,
            rowId,
            ...arrayMap(changingColumnNames, (cellId) => row?.[cellId]),
          );
          arrayPush(deleteRowIds, rowId);
        });
        await upsert(
          cmd,
          tableName,
          rowIdColumnName,
          changingColumnNames,
          args,
          useOnConflict,
        );
        await cmd(
          DELETE_FROM +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            'NOT IN(' +
            getPlaceholders(deleteRowIds) +
            ')',
          deleteRowIds,
        );
      } else if (collHas(schemaMap, tableName)) {
        await cmd(DELETE_FROM + escapeId(tableName) + WHERE + ' 1');
      }
    }
  };

  const transaction = async <Return>(
    actions: () => Promise<Return>,
  ): Promise<Return> => {
    let result;
    await cmd('BEGIN');
    try {
      result = await actions();
    } catch (error) {
      onIgnoredError?.(error);
    }
    await cmd('END');
    return result as Return;
  };

  return [refreshSchema, loadTable, saveTable, transaction];
};

const upsert = async (
  cmd: Cmd,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  args: any[],
  useOnConflict = true,
) =>
  await cmd(
    'INSERT ' +
      (useOnConflict ? EMPTY_STRING : 'OR REPLACE ') +
      'INTO' +
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
      slice(
        strRepeat(
          `,(?${strRepeat(',?', size(changingColumnNames))})`,
          size(args) / (size(changingColumnNames) + 1),
        ),
        1,
      ) +
      (useOnConflict
        ? 'ON CONFLICT(' +
          escapeId(rowIdColumnName) +
          ')DO UPDATE SET' +
          arrayJoin(
            arrayMap(
              changingColumnNames,
              (columnName) =>
                escapeId(columnName) + '=excluded.' + escapeId(columnName),
            ),
            COMMA,
          )
        : EMPTY_STRING),
    arrayMap(args, (arg) => arg ?? null),
  );

const getPlaceholders = (array: any[]) =>
  arrayJoin(
    arrayMap(array, () => '?'),
    COMMA,
  );
