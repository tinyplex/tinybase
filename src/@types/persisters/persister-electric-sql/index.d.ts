/// persister-electric-sql

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {ElectricClient} from 'electric-sql/client/model';
import type {Store} from '../../store/index.d.ts';

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
