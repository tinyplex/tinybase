/// persister-electric-sql

import type {DatabasePersisterConfig, Persister} from '../';
import type {ElectricClient} from 'electric-sql/client/model';
import type {Store} from '../../store';

/// ElectricSqlPersister
export interface ElectricSqlPersister extends Persister {
  /// ElectricSqlPersister.getElectricClient
  getElectricClient(): ElectricClient<any>;
}

/// createElectricSqlPersister
export function createElectricSqlPersister(
  store: Store,
  electricClient: ElectricClient<any>,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ElectricSqlPersister;
