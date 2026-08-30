import type {DatabaseSync} from 'node:sqlite';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {
  SqliteNodePersister,
  createSqliteNodePersister as createSqliteNodePersisterDecl,
} from '../../@types/persisters/persister-sqlite-node/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

export const createSqliteNodePersister = ((
  store: Store | MergeableStore,
  db: DatabaseSync,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteNodePersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      db.prepare(sql).all(...params) as IdObj<any>[],
    (): UnsubscribeFunction => noop,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    db,
  ) as SqliteNodePersister) as typeof createSqliteNodePersisterDecl;
