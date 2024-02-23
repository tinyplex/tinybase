import {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../types/persisters/persister-powersync';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {arrayMap} from '../common/array';
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
        try {
          const result = await powerSync.execute(sql, args);
          resolve(result.rows?._array ?? []);
        } catch (error) {
          reject(error);
        }
      }),
    (listener: UpdateListener): AbortController => {
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
    powerSync,
    'getPowerSync',
    false,
  ) as PowerSyncPersister) as typeof createPowerSyncPersisterDecl;
