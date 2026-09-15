import {AbstractPowerSyncDatabase} from '@powersync/common';
import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../../@types/persisters/persister-powersync/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {arrayForEach} from '../../common/array.ts';
import {tryCatchIgnore} from '../../common/error.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {updateThenInsertUpsert} from '../common/database/common.ts';
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
        signal: abortController.signal,
      });
      void tryCatchIgnore(async () => {
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
    updateThenInsertUpsert,
  ) as PowerSyncPersister;
}) as typeof createPowerSyncPersisterDecl;
