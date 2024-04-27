/// persister-electric-sql

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {ElectricClient} from 'electric-sql/client/model';
import {Store} from '../store.d';

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
