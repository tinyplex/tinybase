/// persister-powersync
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  Persister,
} from '../../with-schemas/index.d.ts';
import type {AbstractPowerSyncDatabase} from '@powersync/common';

/// PowerSyncPersister
export interface PowerSyncPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// PowerSyncPersister.getPowerSync
  getPowerSync(): AbstractPowerSyncDatabase;
}

/// createPowerSyncPersister
export function createPowerSyncPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  powerSync: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister<Schemas>;
