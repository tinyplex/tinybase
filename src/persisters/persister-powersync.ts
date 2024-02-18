import {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../types/persisters/persister-powersync';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {arrayForEach} from '../common/array';
import {promiseNew} from '../common/other';

export const createPowerSyncPersister = ((
  store: Store,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await promiseNew(async (resolve, reject) => {
        const result = await powerSync.execute(sql, args);

        result?.rows ? resolve(result.rows._array) : reject();
      }),
    (listener: UpdateListener): AbortController => {
      const abortController = new AbortController();

      (async () => {
        for await (const update of powerSync.onChange({
          rawTableNames: true,
          signal: abortController.signal,
        })) {
          arrayForEach(update.changedTables, (tableName) =>
            listener(tableName),
          );
        }
      })();

      return abortController;
    },
    (abortController: AbortController) => abortController.abort(),
    onSqlCommand,
    onIgnoredError,
    powerSync,
    'getPowerSync',
    true,
  ) as PowerSyncPersister) as typeof createPowerSyncPersisterDecl;
