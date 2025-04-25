import type {Id} from '../../../@types/common/index.d.ts';
import type {DatabaseExecuteCommand} from '../../../@types/persisters/index.d.ts';
import type {
  CellOrUndefined,
  Table,
  ValueOrUndefined,
} from '../../../@types/store/index.d.ts';
import {
  arrayFilter,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
  arrayPush,
} from '../../../common/array.ts';
import {collClear, collDel, collHas, collValues} from '../../../common/coll.ts';
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
import {isUndefined, promiseAll} from '../../../common/other.ts';
import {IdSet2, setAdd, setNew} from '../../../common/set.ts';
import {COMMA} from '../../../common/strings.ts';
import {
  ALTER_TABLE,
  DELETE_FROM,
  QuerySchema,
  SELECT_STAR_FROM,
  TABLE,
  Upsert,
  WHERE,
  escapeColumnNames,
  escapeId,
  getPlaceholders,
  getWhereCondition,
} from './common.ts';

export type Schema = IdSet2;

export const getCommandFunctions = (
  databaseExecuteCommand: DatabaseExecuteCommand,
  managedTableNames: string[],
  querySchema: QuerySchema,
  onIgnoredError: ((error: any) => void) | undefined,
  columnType: string,
  upsert: Upsert = defaultUpsert,
  encode?: (cellOrValue: any) => string | number,
  decode?: (field: string | number) => any,
): [
  refreshSchema: () => Promise<void>,
  loadTable: (
    tableName: string,
    rowIdColumnName: string,
    whereCondition?: string | null,
  ) => Promise<Table>,
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
    whereCondition: string | null,
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
    whereCondition: string | null = null,
  ): Promise<Table> =>
    canSelect(tableName, rowIdColumnName)
      ? objNew(
          arrayFilter(
            arrayMap(
              await databaseExecuteCommand(
                SELECT_STAR_FROM +
                  escapeId(tableName) +
                  WHERE +
                  getWhereCondition(whereCondition),
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
    whereCondition: string | null = null,
    partial = false,
  ): Promise<void> => {
    const settingColumnNameSet = setNew<string>();
    objMap(content ?? {}, (contentRow) =>
      arrayMap(objIds(contentRow ?? {}), (cellOrValueId) =>
        setAdd(settingColumnNameSet, cellOrValueId),
      ),
    );
    const settingColumnNames = collValues(settingColumnNameSet);

    // Delete the table
    if (
      !partial &&
      deleteEmptyTable &&
      !whereCondition &&
      arrayIsEmpty(settingColumnNames) &&
      collHas(schemaMap, tableName)
    ) {
      await databaseExecuteCommand('DROP ' + TABLE + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    const currentColumnNames = mapGet(schemaMap, tableName);
    const unaccountedColumnNames = setNew(collValues(currentColumnNames));
    if (!arrayIsEmpty(settingColumnNames)) {
      if (!collHas(schemaMap, tableName)) {
        // Create the table
        await databaseExecuteCommand(
          'CREATE ' +
            TABLE +
            escapeId(tableName) +
            `(${escapeId(rowIdColumnName)}${columnType} PRIMARY KEY${arrayJoin(
              arrayMap(
                settingColumnNames,
                (settingColumnName) =>
                  COMMA + escapeId(settingColumnName) + columnType,
              ),
            )});`,
        );
        mapSet(
          schemaMap,
          tableName,
          setNew([rowIdColumnName, ...settingColumnNames]),
        );
      } else {
        // Add columns
        await promiseAll(
          arrayMap(
            [rowIdColumnName, ...settingColumnNames],
            async (settingColumnName, index) => {
              if (!collDel(unaccountedColumnNames, settingColumnName)) {
                await databaseExecuteCommand(
                  ALTER_TABLE +
                    escapeId(tableName) +
                    'ADD' +
                    escapeId(settingColumnName) +
                    columnType,
                );
                if (index == 0) {
                  await databaseExecuteCommand(
                    'CREATE UNIQUE INDEX pk ON ' +
                      escapeId(tableName) +
                      `(${escapeId(rowIdColumnName)})`,
                  );
                }
                setAdd(currentColumnNames, settingColumnName);
              }
            },
          ),
        );
      }
    }
    // Remove columns
    await promiseAll([
      ...(!partial && deleteEmptyColumns
        ? arrayMap(
            collValues(unaccountedColumnNames),
            async (unaccountedColumnName) => {
              if (unaccountedColumnName != rowIdColumnName) {
                await databaseExecuteCommand(
                  ALTER_TABLE +
                    escapeId(tableName) +
                    'DROP' +
                    escapeId(unaccountedColumnName),
                );
                collDel(currentColumnNames, unaccountedColumnName);
              }
            },
          )
        : []),
    ]);

    if (partial) {
      if (isUndefined(content)) {
        // Delete all rows (partial)
        await databaseExecuteCommand(
          DELETE_FROM +
            escapeId(tableName) +
            WHERE +
            getWhereCondition(whereCondition),
        );
      } else {
        await promiseAll(
          objToArray(content, async (row, rowId) => {
            if (isUndefined(row)) {
              // Delete row (partial)
              await databaseExecuteCommand(
                DELETE_FROM +
                  escapeId(tableName) +
                  WHERE +
                  escapeId(rowIdColumnName) +
                  '=$1',
                [rowId],
              );
            } else if (!arrayIsEmpty(settingColumnNames)) {
              // Upsert row (partial)
              await upsert(
                databaseExecuteCommand,
                tableName,
                rowIdColumnName,
                objIds(row),
                {
                  [rowId]: encode
                    ? arrayMap(objValues(row), encode)
                    : objValues(row),
                },
                currentColumnNames,
              );
            }
          }),
        );
      }
    } else {
      if (!arrayIsEmpty(settingColumnNames)) {
        const changingColumnNames = arrayFilter(
          collValues(mapGet(schemaMap, tableName)),
          (changingColumnName) => changingColumnName != rowIdColumnName,
        );
        const rows: {[id: string]: any[]} = {};
        const deleteRowIds: string[] = [];
        objMap(content ?? {}, (row, rowId) => {
          rows[rowId] = arrayMap(changingColumnNames, (cellId) =>
            encode ? encode(row?.[cellId]) : row?.[cellId],
          );
          arrayPush(deleteRowIds, rowId);
        });
        // Upsert row
        await upsert(
          databaseExecuteCommand,
          tableName,
          rowIdColumnName,
          changingColumnNames,
          rows,
        );
        // Delete rows
        await databaseExecuteCommand(
          DELETE_FROM +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            `NOT IN(${getPlaceholders(deleteRowIds)}) ` +
            `AND${getWhereCondition(whereCondition)}`,
          deleteRowIds,
        );
      } else if (collHas(schemaMap, tableName)) {
        // Delete all rows
        await databaseExecuteCommand(
          DELETE_FROM +
            escapeId(tableName) +
            WHERE +
            getWhereCondition(whereCondition),
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

const defaultUpsert: Upsert = async (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
) => {
  const offset = [1];
  await executeCommand(
    'INSERT INTO' +
      escapeId(tableName) +
      '(' +
      escapeColumnNames(rowIdColumnName, ...changingColumnNames) +
      ')VALUES' +
      arrayJoin(
        objToArray(
          rows,
          (row: any[]) =>
            '($' + offset[0]++ + ',' + getPlaceholders(row, offset) + ')',
        ),
        COMMA,
      ) +
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
    objToArray(rows, (row: any[], id: string) => [
      id,
      ...arrayMap(row, (value) => value ?? null),
    ]).flat(),
  );
};
