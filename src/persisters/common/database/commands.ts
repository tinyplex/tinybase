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
import {getHash} from '../../../common/hash.ts';
import {jsonString} from '../../../common/json.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../../common/map.ts';
import {
  objDel,
  objIds,
  objIsEmpty,
  objMap,
  objNew,
  objSet,
  objToArray,
} from '../../../common/obj.ts';
import {isEmpty, isUndefined, promiseAll} from '../../../common/other.ts';
import {IdSet2, setAdd, setNew} from '../../../common/set.ts';
import {COMMA, TINYBASE, TRUE} from '../../../common/strings.ts';
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
export type DatabaseTransaction = <Return>(
  actions: (executeCommand: DatabaseExecuteCommand) => Promise<Return>,
) => Promise<Return>;

export const getCommandFunctions = (
  databaseExecuteCommand: DatabaseExecuteCommand,
  managedTableNames: string[],
  querySchema: QuerySchema,
  columnType: string,
  upsert: Upsert = defaultUpsert,
  encode?: (cellOrValue: any) => string | number,
  decode?: (field: string | number) => any,
  executeTransaction?: DatabaseTransaction,
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
  const uniqueSchemaMap: Schema = mapNew();
  let executeCommand = databaseExecuteCommand;

  const canSelect = (tableName: string, rowIdColumnName: string): boolean =>
    collHas(mapGet(schemaMap, tableName), rowIdColumnName);

  const refreshSchema = async (): Promise<void> => {
    collClear(schemaMap);
    collClear(uniqueSchemaMap);
    arrayMap(
      await querySchema(executeCommand, managedTableNames),
      ({tn, cn, uq}) => {
        setAdd(mapEnsure(schemaMap, tn, setNew<Id>), cn);
        if (uq) {
          setAdd(mapEnsure(uniqueSchemaMap, tn, setNew<Id>), cn);
        }
      },
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
              await executeCommand(
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
      await executeCommand('DROP ' + TABLE + escapeId(tableName));
      mapSet(schemaMap, tableName);
      mapSet(uniqueSchemaMap, tableName);
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
        await executeCommand(
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
        mapSet(uniqueSchemaMap, tableName, setNew([rowIdColumnName]));
      } else {
        // Add columns
        await promiseAll(
          arrayMap(
            [rowIdColumnName, ...settingColumnNames],
            async (settingColumnName) => {
              if (!collDel(unaccountedColumnNames, settingColumnName)) {
                await executeCommand(
                  ALTER_TABLE +
                    escapeId(tableName) +
                    'ADD' +
                    escapeId(settingColumnName) +
                    columnType,
                );
                setAdd(currentColumnNames, settingColumnName);
              }
            },
          ),
        );
        if (
          upsert == defaultUpsert &&
          !collHas(mapGet(uniqueSchemaMap, tableName), rowIdColumnName)
        ) {
          const indexName =
            TINYBASE +
            '_pk_' +
            getHash(jsonString([tableName, rowIdColumnName]));
          await executeCommand(
            'CREATE UNIQUE INDEX IF NOT EXISTS' +
              escapeId(indexName) +
              'ON' +
              escapeId(tableName) +
              `(${escapeId(rowIdColumnName)})`,
          );
          setAdd(
            mapEnsure(uniqueSchemaMap, tableName, setNew<Id>),
            rowIdColumnName,
          );
        }
      }
    }
    // Remove columns
    await promiseAll([
      ...(!partial && deleteEmptyColumns
        ? arrayMap(
            collValues(unaccountedColumnNames),
            async (unaccountedColumnName) => {
              if (unaccountedColumnName != rowIdColumnName) {
                await executeCommand(
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
          await executeCommand(
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
              await executeCommand(
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
                  executeCommand,
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
        const rows = objNew<any[]>();
        const deleteRowIds: string[] = [];
        objMap(content ?? {}, (row, rowId) => {
          objSet(
            rows,
            rowId,
            arrayMap(changingColumnNames, (cellId) =>
              encode ? encode(row?.[cellId]) : row?.[cellId],
            ),
          );
          arrayPush(deleteRowIds, rowId);
        });
        // Upsert row
        await upsert(
          executeCommand,
          tableName,
          rowIdColumnName,
          changingColumnNames,
          rows,
          currentColumnNames,
        );
        // Delete rows
        await executeCommand(
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
        await executeCommand(
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
    if (executeTransaction) {
      return await executeTransaction(async (transactionExecuteCommand) => {
        const executeCommandWas = executeCommand;
        executeCommand = transactionExecuteCommand;
        try {
          return await actions();
        } finally {
          executeCommand = executeCommandWas;
        }
      });
    }
    await databaseExecuteCommand('BEGIN');
    try {
      const result = await actions();
      await databaseExecuteCommand('END');
      return result;
    } catch (error) {
      await tryCatch(() => databaseExecuteCommand('ROLLBACK'));
      throw error;
    }
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
