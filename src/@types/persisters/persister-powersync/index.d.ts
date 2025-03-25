/// persister-powersync
import type {Store} from '../../store/index.d.ts';
import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {AbstractPowerSyncDatabase} from '@powersync/common';

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
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister;
