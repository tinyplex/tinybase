import type {Database} from 'better-sqlite3';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {
  BetterSqlite3Persister,
  createBetterSqlite3Persister as createBetterSqlite3PersisterDecl,
} from '../../@types/persisters/persister-better-sqlite3/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

export const createBetterSqlite3Persister = ((
  store: Store | MergeableStore,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): BetterSqlite3Persister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> => {
      const statement = db.prepare(sql);
      return statement.reader
        ? (statement.all(...params) as IdObj<any>[])
        : (statement.run(...params), []);
    },
    (): (() => void) => noop,
    (unsubscribeFunction: () => void): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    db,
  ) as BetterSqlite3Persister) as typeof createBetterSqlite3PersisterDecl;
