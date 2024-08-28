import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  Sqlite3Persister,
  createSqlite3Persister as createSqlite3PersisterDecl,
} from '../../@types/persisters/persister-sqlite3/index.d.ts';
import {Database} from 'sqlite3';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';
import {promiseNew} from '../../common/other.ts';

const CHANGE = 'change';

type Observer = (_: any, _2: any, tableName: string) => void;

export const createSqlite3Persister = ((
  store: Store | MergeableStore,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Sqlite3Persister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      await promiseNew((resolve, reject) =>
        db.all(sql, params, (error, rows: IdObj<any>[]) =>
          error ? reject(error) : resolve(rows),
        ),
      ),
    (listener: DatabaseChangeListener): Observer => {
      const observer = (_: any, _2: any, tableName: string) =>
        listener(tableName);
      db.on(CHANGE, observer);
      return observer;
    },
    (observer: Observer): any => db.off(CHANGE, observer),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    3, // StoreOrMergeableStore,
    db,
  ) as Sqlite3Persister) as typeof createSqlite3PersisterDecl;
