/// persister-electric-sql
import type {Store} from '../../store/index.d.ts';
import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {ElectricClient} from 'electric-sql/client/model';

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
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ElectricSqlPersister;
