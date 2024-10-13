import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import {IdObj, objToArray} from '../../common/obj.ts';
import type {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../../@types/persisters/persister-powersync/index.d.ts';
import {
  Upsert,
  escapeColumnNames,
  escapeId,
  getPlaceholders,
} from '../common/database/common.ts';
import {arrayFilter, arrayJoin, arrayMap} from '../../common/array.ts';
import {AbstractPowerSyncDatabase} from '@powersync/common';
import {COMMA} from '../../common/strings.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {collHas} from '../../common/coll.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';
import {setNew} from '../../common/set.ts';

export const createPowerSyncPersister = ((
  store: Store,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister =>
  createCustomSqlitePersister(
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
          arrayMap(update.changedTables, listener);
        }
      })();
      return abortController;
    },
    (abortController: AbortController) => abortController.abort(),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    1, // StoreOnly,
    powerSync,
    'getPowerSync',
    viewUpsert,
  ) as PowerSyncPersister) as typeof createPowerSyncPersisterDecl;

const viewUpsert: Upsert = async (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
  targetColumnNames: string[],
) => {
  const offset = [1];
  const changingColumnNamesSet = setNew(changingColumnNames);
  const unchangingColumnNames = arrayFilter(
    targetColumnNames,
    (columnName) => !collHas(changingColumnNamesSet, columnName),
  );

  await executeCommand(
    'INSERT OR REPLACE INTO' +
      escapeId(tableName) +
      escapeColumnNames(rowIdColumnName, ...changingColumnNames) +
      'VALUES' +
      arrayJoin(
        objToArray(
          rows,
          (params: any[]) =>
            '($' + offset[0]++ + ',' + getPlaceholders(params, offset) + ')',
        ),
        COMMA,
      ),
    objToArray(rows, (params: any[], id: string) => [
      id,
      ...arrayMap(params, (param) => param ?? null),
    ]).flat(),
  );
};
