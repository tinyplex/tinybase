/// persister-powersync

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import type {Store} from '../../store/index.d.ts';

/// PowerSyncPersister
export interface PowerSyncPersister extends Persister {
  /// PowerSyncPersister.getPowerSync
  getPowerSync(): AbstractPowerSyncDatabase;
}

/// createPowerSyncPersister
export function createPowerSyncPersister(
  store: Store,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister;
