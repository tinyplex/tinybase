import type {Id, Ids} from '../../../@types/common/index.d.ts';
import type {
  DatabaseExecuteCommand,
  DpcTabularCondition,
} from '../../../@types/persisters/index.d.ts';
import type {
  CellOrUndefined,
  Row,
  Table,
  ValueOrUndefined,
} from '../../../@types/store/index.d.ts';
import {
  arrayFilter,
  arrayJoin,
  arrayMap,
  arrayPush,
} from '../../../common/array.ts';
import {collClear, collDel, collHas, collValues} from '../../../common/coll.ts';
import {tryCatch} from '../../../common/error.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../../common/map.ts';
import {
  objDel,
  objIds,
  objIsEmpty,
  objMap,
  objNew,
  objToArray,
} from '../../../common/obj.ts';
import {isEmpty, isUndefined, promiseAll} from '../../../common/other.ts';
import {IdSet2, setAdd, setNew} from '../../../common/set.ts';
import {COMMA, TRUE} from '../../../common/strings.ts';
import {
  ALTER_TABLE,
  CREATE_TABLE,
  DELETE_FROM,
  INSERT,
  QuerySchema,
  SELECT_STAR_FROM,
  TABLE,
  UPDATE,
  escapeColumnNames,
  escapeId,
  getPlaceholders,
  getWhereCondition,
  type Upsert,
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
    condition?: DpcTabularCondition,
    contentSubIds?: Ids,
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
    partial?: boolean,
    condition?: DpcTabularCondition,
    contentSubIds?: Ids,
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
    condition?: DpcTabularCondition,
    contentSubIds?: Ids,
  ): Promise<Table> => {
    const contentSubIdSet = isUndefined(contentSubIds)
      ? undefined
      : setNew(contentSubIds);
    const includeContentSubId = (contentSubId: Id): boolean =>
      isUndefined(contentSubIdSet) || collHas(contentSubIdSet, contentSubId);
    return canSelect(tableName, rowIdColumnName)
      ? objNew(
          arrayFilter(
            arrayMap(
              await databaseExecuteCommand(
                SELECT_STAR_FROM +
                  escapeId(tableName) +
                  getWhereCondition(tableName, condition),
              ),
              (row): [Id | undefined, Row] => {
                const rowId = row[rowIdColumnName];
                const rowContent = decode
                  ? objMap(objDel(row, rowIdColumnName), decode)
                  : objDel(row, rowIdColumnName);
                return [
                  rowId,
                  isUndefined(contentSubIdSet)
                    ? rowContent
                    : objNew(
                        arrayFilter(
                          objToArray(
                            rowContent,
                            (cellOrValue, contentSubId) =>
                              [contentSubId, cellOrValue] as [Id, any],
                          ),
                          ([contentSubId]) => includeContentSubId(contentSubId),
                        ),
                      ),
                ];
              },
            ),
            (entry): entry is [Id, Row] =>
              !isUndefined(entry[0]) && !objIsEmpty(entry[1]),
          ),
        )
      : {};
  };

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
    condition: DpcTabularCondition = TRUE,
    contentSubIds?: Ids,
  ): Promise<void> => {
    const contentSubIdSet = isUndefined(contentSubIds)
      ? undefined
      : setNew(contentSubIds);
    const includeContentSubId = (contentSubId: Id): boolean =>
      isUndefined(contentSubIdSet) || collHas(contentSubIdSet, contentSubId);
    const settingColumnNameSet = setNew<string>();
    objMap(content ?? {}, (contentRow) =>
      arrayMap(
        arrayFilter(objIds(contentRow ?? {}), includeContentSubId),
        (cellOrValueId) => setAdd(settingColumnNameSet, cellOrValueId),
      ),
    );
    const settingColumnNames = collValues(settingColumnNameSet);

    // Delete the table
    if (
      isUndefined(contentSubIdSet) &&
      !partial &&
      deleteEmptyTable &&
      condition == TRUE &&
      isEmpty(settingColumnNames) &&
      collHas(schemaMap, tableName)
    ) {
      await databaseExecuteCommand('DROP ' + TABLE + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    const currentColumnNames = mapGet(schemaMap, tableName);
    const unaccountedColumnNames = setNew(
      arrayFilter(
        collValues(currentColumnNames),
        (columnName) =>
          columnName == rowIdColumnName || includeContentSubId(columnName),
      ),
    );
    if (!isEmpty(settingColumnNames)) {
      if (!collHas(schemaMap, tableName)) {
        // Create the table
        await databaseExecuteCommand(
          CREATE_TABLE +
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
        if (isUndefined(contentSubIdSet)) {
          await databaseExecuteCommand(
            DELETE_FROM +
              escapeId(tableName) +
              getWhereCondition(tableName, condition),
          );
        }
      } else {
        await promiseAll(
          objToArray(content, async (row, rowId) => {
            if (isUndefined(row)) {
              // Delete row (partial)
              await databaseExecuteCommand(
                DELETE_FROM +
                  escapeId(tableName) +
                  getWhereCondition(tableName, condition) +
                  `AND(${escapeId(rowIdColumnName)}=$1)`,
                [rowId],
              );
            } else if (!isEmpty(settingColumnNames)) {
              // Upsert row (partial)
              const changingColumnNames = arrayFilter(
                objIds(row),
                includeContentSubId,
              );
              if (!isEmpty(changingColumnNames)) {
                await upsert(
                  databaseExecuteCommand,
                  tableName,
                  rowIdColumnName,
                  changingColumnNames,
                  {
                    [rowId]: arrayMap(changingColumnNames, (cellId) =>
                      encode ? encode(row[cellId]) : row[cellId],
                    ),
                  },
                  currentColumnNames,
                );
              }
            }
          }),
        );
      }
    } else {
      if (!isEmpty(settingColumnNames)) {
        const changingColumnNames = arrayFilter(
          collValues(mapGet(schemaMap, tableName)),
          (changingColumnName) =>
            changingColumnName != rowIdColumnName &&
            includeContentSubId(changingColumnName),
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
          currentColumnNames,
        );
        // Delete rows
        await databaseExecuteCommand(
          DELETE_FROM +
            escapeId(tableName) +
            getWhereCondition(tableName, condition) +
            // eslint-disable-next-line max-len
            `AND${escapeId(rowIdColumnName)}NOT IN(${getPlaceholders(deleteRowIds)})`,
          deleteRowIds,
        );
      } else if (
        isUndefined(contentSubIdSet) &&
        collHas(schemaMap, tableName)
      ) {
        // Delete all rows
        await databaseExecuteCommand(
          DELETE_FROM +
            escapeId(tableName) +
            getWhereCondition(tableName, condition),
        );
      }
    }
  };

  const transaction = async <Return>(
    actions: () => Promise<Return>,
  ): Promise<Return> => {
    let result;
    await databaseExecuteCommand('BEGIN');
    await tryCatch(async () => (result = await actions()), onIgnoredError);
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
    INSERT +
      ' INTO' +
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
      `)DO ${UPDATE} SET` +
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
