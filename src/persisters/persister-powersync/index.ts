import {AbstractPowerSyncDatabase} from '@powersync/common';
import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../../@types/persisters/persister-powersync/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {
  arrayFilter,
  arrayForEach,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
  arrayPush,
} from '../../common/array.ts';
import {collHas} from '../../common/coll.ts';
import {IdObj, objIds, objNew, objToArray} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {IdSet, setNew} from '../../common/set.ts';
import {COMMA} from '../../common/strings.ts';
import {
  FROM,
  INSERT,
  OR_REPLACE,
  SELECT,
  Upsert,
  WHERE,
  escapeColumnNames,
  escapeId,
  getPlaceholders,
} from '../common/database/common.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

export const createPowerSyncPersister = ((
  store: Store,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister => {
  let tableListener: DatabaseChangeListener | undefined;
  return createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      powerSync
        .execute(sql, params)
        .then((result) => result.rows?._array ?? []),
    (listener: DatabaseChangeListener): AbortController => {
      const abortController = new AbortController();
      const onChange = powerSync.onChange({
        rawTableNames: true,
        signal: abortController.signal,
      });
      (async () => {
        for await (const update of onChange) {
          if (tableListener) {
            arrayMap(update.changedTables, tableListener);
          }
        }
      })();
      tableListener = listener;
      return abortController;
    },
    (abortController: AbortController) => {
      tableListener = undefined;
      abortController.abort();
    },
    onSqlCommand,
    onIgnoredError,
    noop,
    1, // StoreOnly,
    powerSync,
    'getPowerSync',
    viewUpsert,
  ) as PowerSyncPersister;
}) as typeof createPowerSyncPersisterDecl;

const viewUpsert: Upsert = async (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
  currentColumnNames?: IdSet | undefined,
) => {
  const offset = [1];
  const changingColumnNamesSet = setNew(changingColumnNames);
  const unchangingColumnNames = currentColumnNames
    ? arrayFilter(
        [...currentColumnNames],
        (currentColumnName) =>
          currentColumnName != rowIdColumnName &&
          !collHas(changingColumnNamesSet, currentColumnName),
      )
    : [];
  if (!arrayIsEmpty(unchangingColumnNames)) {
    const ids = objIds(rows);
    const unchangingData = objNew(
      arrayMap(
        await executeCommand(
          SELECT +
            escapeColumnNames(rowIdColumnName, ...unchangingColumnNames) +
            FROM +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            'IN(' +
            getPlaceholders(ids) +
            ')',
          ids,
        ),
        (unchangingRow) => [unchangingRow[rowIdColumnName], unchangingRow],
      ),
    );
    arrayForEach(ids, (id: string) =>
      arrayPush(
        rows[id],
        ...arrayMap(
          unchangingColumnNames,
          (unchangingColumnName) =>
            unchangingData?.[id]?.[unchangingColumnName] ?? null,
        ),
      ),
    );
  }

  await executeCommand(
    INSERT +
      ' ' +
      OR_REPLACE +
      'INTO' +
      escapeId(tableName) +
      '(' +
      escapeColumnNames(
        rowIdColumnName,
        ...changingColumnNames,
        ...unchangingColumnNames,
      ) +
      ')VALUES' +
      arrayJoin(
        objToArray(
          rows,
          (row: any[]) =>
            '($' + offset[0]++ + ',' + getPlaceholders(row, offset) + ')',
        ),
        COMMA,
      ),
    objToArray(rows, (row: any[], id: string) => [
      id,
      ...arrayMap(row, (value) => value ?? null),
    ]).flat(),
  );
};
