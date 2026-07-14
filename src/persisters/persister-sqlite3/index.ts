import {Database} from 'sqlite3';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  Sqlite3Persister,
  createSqlite3Persister as createSqlite3PersisterDecl,
} from '../../@types/persisters/persister-sqlite3/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {addEmitterListener, noop, promiseNew} from '../../common/other.ts';
import {CHANGE} from '../../common/strings.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

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
    (listener: DatabaseChangeListener): (() => void) =>
      addEmitterListener(db, CHANGE, (_: any, _2: any, tableName: string) =>
        listener(tableName),
      ),
    (removeListener: () => void): void => removeListener(),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    db,
  ) as Sqlite3Persister) as typeof createSqlite3PersisterDecl;
