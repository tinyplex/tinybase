/// persister-powersync

import {DatabasePersisterConfig, Persister} from '../persisters';
import type {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {Store} from '../store';

/// PowerSyncPersister
export interface PowerSyncPersister extends Persister {
  /// PowerSyncPersister.getDb
  getDb: () => AbstractPowerSyncDatabase;
}

/// createPowerSyncPersister
export function createPowerSyncPersister(
  store: Store,
  db: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister;
