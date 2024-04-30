import {
  Sqlite3Persister,
  createSqlite3Persister as createSqlite3PersisterDecl,
} from '../types/persisters/persister-sqlite3';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {Database} from 'sqlite3';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {promiseNew} from '../common/other';

const CHANGE = 'change';

type Observer = (_: any, _2: any, tableName: string) => void;

export const createSqlite3Persister = ((
  store: Store,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Sqlite3Persister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await promiseNew((resolve, reject) =>
        db.all(sql, args, (error, rows: IdObj<any>[]) =>
          error ? reject(error) : resolve(rows),
        ),
      ),
    (listener: UpdateListener): Observer => {
      const observer = (_: any, _2: any, tableName: string) =>
        listener(tableName);
      db.on(CHANGE, observer);
      return observer;
    },
    (observer: Observer): any => db.off(CHANGE, observer),
    onSqlCommand,
    onIgnoredError,
    3,
    db,
  ) as Sqlite3Persister) as typeof createSqlite3PersisterDecl;
