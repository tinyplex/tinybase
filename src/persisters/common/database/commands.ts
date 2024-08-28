import {
  ALTER_TABLE,
  DELETE_FROM,
  QuerySchema,
  SELECT_STAR_FROM,
  TABLE,
  WHERE,
  escapeId,
  getPlaceholders,
} from './common.ts';
import {COMMA, EMPTY_STRING} from '../../../common/strings.ts';
import type {
  CellOrUndefined,
  Table,
  ValueOrUndefined,
} from '../../../@types/store/index.d.ts';
import {IdSet2, setAdd, setNew} from '../../../common/set.ts';
import {
  arrayFilter,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
  arrayNew,
  arrayPush,
} from '../../../common/array.ts';
import {collClear, collDel, collHas, collValues} from '../../../common/coll.ts';
import {isUndefined, promiseAll, size} from '../../../common/other.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../../common/map.ts';
import {
  objDel,
  objIds,
  objIsEmpty,
  objMap,
  objNew,
  objToArray,
  objValues,
} from '../../../common/obj.ts';
import type {DatabaseExecuteCommand} from '../../../@types/persisters/index.d.ts';
import type {Id} from '../../../@types/common/index.d.ts';

export type Schema = IdSet2;

export const getCommandFunctions = (
  databaseExecuteCommand: DatabaseExecuteCommand,
  managedTableNames: string[],
  querySchema: QuerySchema,
  onIgnoredError: ((error: any) => void) | undefined,
  columnType: string,
  orReplace?: 0 | 1,
  encode?: (cellOrValue: any) => string | number,
  decode?: (field: string | number) => any,
): [
  refreshSchema: () => Promise<void>,
  loadTable: (tableName: string, rowIdColumnName: string) => Promise<Table>,
  saveTable: (
    tableName: string,
    rowIdColumnName: string,
    content:
      | {
          [contentId: Id]:
            | {[contentSubId: Id]: CellOrUndefined | ValueOrUndefined}
            | undefined;
        }
      | undefined,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial?: boolean,
  ) => Promise<void>,
  transaction: <Return>(actions: () => Promise<Return>) => Promise<Return>,
] => {
  const schemaMap: Schema = mapNew();

  const canSelect = (tableName: string, rowIdColumnName: string): boolean =>
    collHas(mapGet(schemaMap, tableName), rowIdColumnName);

  const refreshSchema = async (): Promise<void> => {
    collClear(schemaMap);
    arrayMap(
      await querySchema(databaseExecuteCommand, managedTableNames),
      ({tn, cn}) => setAdd(mapEnsure(schemaMap, tn, setNew<Id>), cn),
    );
  };

  const loadTable = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<Table> =>
    canSelect(tableName, rowIdColumnName)
      ? objNew(
          arrayFilter(
            arrayMap(
              await databaseExecuteCommand(
                SELECT_STAR_FROM + escapeId(tableName),
              ),
              (row) => [
                row[rowIdColumnName],
                decode
                  ? objMap(objDel(row, rowIdColumnName), decode)
                  : objDel(row, rowIdColumnName),
              ],
            ),
            ([rowId, row]) => !isUndefined(rowId) && !objIsEmpty(row),
          ),
        )
      : {};

  const saveTable = async (
    tableName: string,
    rowIdColumnName: string,
    content:
      | {
          [contentId: Id]:
            | {[contentSubId: Id]: CellOrUndefined | ValueOrUndefined}
            | undefined;
        }
      | undefined,
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
      await databaseExecuteCommand('DROP ' + TABLE + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    // Create the table or alter or drop columns
    const tableSchemaColumns = mapGet(schemaMap, tableName);
    const currentColumnNames = setNew(collValues(tableSchemaColumns));

    if (!arrayIsEmpty(tableColumnNames)) {
      if (!collHas(schemaMap, tableName)) {
        await databaseExecuteCommand(
          'CREATE ' +
            TABLE +
            escapeId(tableName) +
            `(${escapeId(rowIdColumnName)}${columnType} PRIMARY KEY${arrayJoin(
              arrayMap(
                tableColumnNames,
                (columnName) => COMMA + escapeId(columnName) + columnType,
              ),
            )});`,
        );
        mapSet(
          schemaMap,
          tableName,
          setNew([rowIdColumnName, ...tableColumnNames]),
        );
      } else {
        await promiseAll(
          arrayMap(
            [rowIdColumnName, ...tableColumnNames],
            async (columnName, index) => {
              if (!collDel(currentColumnNames, columnName)) {
                await databaseExecuteCommand(
                  ALTER_TABLE +
                    escapeId(tableName) +
                    'ADD' +
                    escapeId(columnName) +
                    columnType,
                );
                if (index == 0) {
                  await databaseExecuteCommand(
                    'CREATE UNIQUE INDEX pk ON ' +
                      escapeId(tableName) +
                      `(${escapeId(rowIdColumnName)})`,
                  );
                }
                setAdd(tableSchemaColumns, columnName);
              }
            },
          ),
        );
      }
    }
    await promiseAll([
      ...(!partial && deleteEmptyColumns
        ? arrayMap(collValues(currentColumnNames), async (columnName) => {
            if (columnName != rowIdColumnName) {
              await databaseExecuteCommand(
                ALTER_TABLE +
                  escapeId(tableName) +
                  'DROP' +
                  escapeId(columnName),
              );
              collDel(tableSchemaColumns, columnName);
            }
          })
        : []),
    ]);

    // Insert or update or delete data
    if (partial) {
      if (isUndefined(content)) {
        await databaseExecuteCommand(
          DELETE_FROM + escapeId(tableName) + WHERE + ' true',
        );
      } else {
        await promiseAll(
          objToArray(content, async (row, rowId) => {
            if (isUndefined(row)) {
              await databaseExecuteCommand(
                DELETE_FROM +
                  escapeId(tableName) +
                  WHERE +
                  escapeId(rowIdColumnName) +
                  '=$1',
                [rowId],
              );
            } else if (!arrayIsEmpty(tableColumnNames)) {
              await upsert(
                databaseExecuteCommand,
                tableName,
                rowIdColumnName,
                objIds(row),
                [
                  rowId,
                  ...(encode
                    ? arrayMap(objValues(row), encode)
                    : objValues(row)),
                ],
                orReplace,
              );
            }
          }),
        );
      }
    } else {
      if (!arrayIsEmpty(tableColumnNames)) {
        const changingColumnNames = arrayFilter(
          collValues(mapGet(schemaMap, tableName)),
          (columnName) => columnName != rowIdColumnName,
        );
        const params: any[] = [];
        const deleteRowIds: string[] = [];
        objToArray(content ?? {}, (row, rowId) => {
          arrayPush(
            params,
            rowId,
            ...arrayMap(changingColumnNames, (cellId) =>
              encode ? encode(row?.[cellId]) : row?.[cellId],
            ),
          );
          arrayPush(deleteRowIds, rowId);
        });
        await upsert(
          databaseExecuteCommand,
          tableName,
          rowIdColumnName,
          changingColumnNames,
          params,
          orReplace,
        );
        await databaseExecuteCommand(
          DELETE_FROM +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            `NOT IN(${getPlaceholders(deleteRowIds)})`,
          deleteRowIds,
        );
      } else if (collHas(schemaMap, tableName)) {
        await databaseExecuteCommand(
          DELETE_FROM + escapeId(tableName) + WHERE + ' true',
        );
      }
    }
  };

  const transaction = async <Return>(
    actions: () => Promise<Return>,
  ): Promise<Return> => {
    let result;
    await databaseExecuteCommand('BEGIN');
    try {
      result = await actions();
    } catch (error) {
      onIgnoredError?.(error);
    }
    await databaseExecuteCommand('END');
    return result as Return;
  };

  return [refreshSchema, loadTable, saveTable, transaction];
};

const upsert = async (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  params: any[],
  orReplace: 0 | 1 = 0,
) =>
  await executeCommand(
    'INSERT ' +
      (orReplace ? 'OR REPLACE ' : EMPTY_STRING) +
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
      getUpsertPlaceholders(params, size(changingColumnNames) + 1) +
      (orReplace
        ? EMPTY_STRING
        : 'ON CONFLICT(' +
          escapeId(rowIdColumnName) +
          ')DO UPDATE SET' +
          arrayJoin(
            arrayMap(
              changingColumnNames,
              (columnName) =>
                escapeId(columnName) + '=excluded.' + escapeId(columnName),
            ),
            COMMA,
          )),
    arrayMap(params, (param) => param ?? null),
  );

const getUpsertPlaceholders = (array: any[], columnCount: number) =>
  arrayJoin(
    arrayNew(
      size(array) / columnCount,
      (row) =>
        '(' +
        arrayJoin(
          arrayNew(
            columnCount,
            (column) => '$' + (row * columnCount + column + 1),
          ),
          COMMA,
        ) +
        ')',
    ),
    COMMA,
  );
