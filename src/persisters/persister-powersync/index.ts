import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../../@types/persisters/persister-powersync/index.d.ts';
import {AbstractPowerSyncDatabase} from '@powersync/common';
import {IdObj} from '../../common/obj.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

export const createPowerSyncPersister = ((
  store: Store,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
  orReplace: 0 | 1 = 1,
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
    orReplace,
  ) as PowerSyncPersister) as typeof createPowerSyncPersisterDecl;
