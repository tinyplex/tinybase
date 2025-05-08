import {Database} from 'bun:sqlite';
import type {MergeableStore} from '../../@types/mergeable-store/index.js';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.js';
import type {
  SqliteBunPersister,
  createSqliteBunPersister as createSqliteBunPersisterDecl,
} from '../../@types/persisters/persister-sqlite-bun/index.d.ts';
import type {Store} from '../../@types/store/index.js';
import {IdObj} from '../../common/obj.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => 0;

export const createSqliteBunPersister = ((
  store: Store | MergeableStore,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteBunPersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      db.query<IdObj<any>, any[]>(sql).all(...params),
    (): UnsubscribeFunction => () => 0,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    3, // StoreOrMergeableStore,
    db,
  ) as SqliteBunPersister) as typeof createSqliteBunPersisterDecl;
