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
import {arrayForEach, arrayJoin, arrayMap} from '../../common/array.ts';
import {tryCatch} from '../../common/error.ts';
import {IdObj, objToArray} from '../../common/obj.ts';
import {isEmpty, noop, size} from '../../common/other.ts';
import {COMMA} from '../../common/strings.ts';
import {
  INSERT,
  UPDATE,
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
      tryCatch(async () => {
        for await (const update of onChange) {
          if (tableListener) {
            arrayForEach(update.changedTables, tableListener);
          }
        }
      }, onIgnoredError);
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
    powerSyncUpdateThenInsert,
  ) as PowerSyncPersister;
}) as typeof createPowerSyncPersisterDecl;

// PowerSync records INSERT/REPLACE statements as PUTs and UPDATE statements as
// PATCHes. Update first so existing rows avoid replacement writes in the upload
// queue, then insert only when RETURNING shows that no row existed.
const powerSyncUpdateThenInsert: Upsert = async (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
) => {
  const assignments = arrayJoin(
    arrayMap(
      changingColumnNames,
      (columnName, index) => escapeId(columnName) + '=$' + (index + 1),
    ),
    COMMA,
  );
  for (const [id, row] of objToArray(rows, (row, id): [string, any[]] => [
    id,
    row,
  ])) {
    const rowParams = arrayMap(row, (value) => value ?? null);
    if (
      isEmpty(
        await executeCommand(
          UPDATE +
            escapeId(tableName) +
            ' SET' +
            assignments +
            ' ' +
            WHERE +
            escapeId(rowIdColumnName) +
            '=$' +
            (size(row) + 1) +
            ' RETURNING' +
            escapeId(rowIdColumnName),
          [...rowParams, id],
        ),
      )
    ) {
      const offset = [1];
      await executeCommand(
        INSERT +
          ' INTO' +
          escapeId(tableName) +
          '(' +
          escapeColumnNames(rowIdColumnName, ...changingColumnNames) +
          ')VALUES(' +
          getPlaceholders([id, ...row], offset) +
          ')',
        [id, ...rowParams],
      );
    }
  }
};
