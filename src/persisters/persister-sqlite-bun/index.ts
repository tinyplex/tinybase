import {Database} from 'bun:sqlite';
import type {MergeableStore} from '../../@types/mergeables/mergeable-store/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {
  SqliteBunPersister,
  createSqliteBunPersister as createSqliteBunPersisterDecl,
} from '../../@types/persisters/persister-sqlite-bun/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

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
    (): UnsubscribeFunction => noop,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    db,
  ) as SqliteBunPersister) as typeof createSqliteBunPersisterDecl;
