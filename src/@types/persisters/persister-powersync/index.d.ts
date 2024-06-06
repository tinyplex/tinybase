/// persister-powersync

import type {DatabasePersisterConfig, Persister} from '../';
import type {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import type {Store} from '../../store';

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
