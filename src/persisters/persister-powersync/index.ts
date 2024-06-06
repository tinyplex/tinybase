import type {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../../@types/persisters/persister-powersync';
import {UpdateListener, createSqlitePersister} from '../common/sqlite/create';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import type {DatabasePersisterConfig} from '../../@types/persisters';
import {IdObj} from '../../common/obj';
import type {Store} from '../../@types/store';
import {arrayMap} from '../../common/array';

export const createPowerSyncPersister = ((
  store: Store,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
  useOnConflict: boolean = false,
): PowerSyncPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      powerSync.execute(sql, args).then((result) => result.rows?._array ?? []),
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
    1,
    powerSync,
    'getPowerSync',
    useOnConflict,
  ) as PowerSyncPersister) as typeof createPowerSyncPersisterDecl;
