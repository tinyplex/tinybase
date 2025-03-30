/// persister-electric-sql
import type {ElectricClient} from 'electric-sql/client/model';
import type {
  OptionalSchemas,
  Store,
} from '../../../store/with-schemas/index.d.ts';
import type {
  DatabasePersisterConfig,
  Persister,
} from '../../with-schemas/index.d.ts';

/// ElectricSqlPersister
export interface ElectricSqlPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// ElectricSqlPersister.getElectricClient
  getElectricClient(): ElectricClient<any>;
}

/// createElectricSqlPersister
export function createElectricSqlPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  electricClient: ElectricClient<any>,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ElectricSqlPersister<Schemas>;
