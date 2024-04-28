/// persister-powersync

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import type {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {Store} from '../store.d';

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
