/// persister-electric-sql

import {DatabasePersisterConfig, Persister} from '../persisters.d';
import {OptionalSchemas, Store} from '../store.d';
import {ElectricClient} from 'electric-sql/client/model';

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
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ElectricSqlPersister<Schemas>;
