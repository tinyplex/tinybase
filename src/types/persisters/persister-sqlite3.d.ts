/// persister-sqlite3

import {Database} from 'sqlite3';
import {Persister} from '../persisters';
import {Store} from '../store';

/// createSqlite3Persister
export function createSqlite3Persister(store: Store, db: Database): Persister;
