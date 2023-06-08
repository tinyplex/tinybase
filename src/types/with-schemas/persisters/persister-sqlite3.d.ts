/// persister-sqlite3

import {OptionalSchemas, Store} from '../store';
import {Database} from 'sqlite3';
import {Persister} from '../persisters';

/// createSqlite3Persister
export function createSqlite3Persister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: Database,
): Persister<Schemas>;
