import type {SQLiteDBConnection} from '@capacitor-community/sqlite';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {
  CapacitorSqlitePersister,
  createCapacitorSqlitePersister as createCapacitorSqlitePersisterDecl,
} from '../../@types/persisters/persister-capacitor-sqlite/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {noop, test} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

const RETURNS_ROWS = /^\s*(SELECT|PRAGMA)/i;

export const createCapacitorSqlitePersister = ((
  store: Store | MergeableStore,
  db: SQLiteDBConnection,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CapacitorSqlitePersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> => {
      if (test(RETURNS_ROWS, sql)) {
        return (await db.query(sql, params)).values ?? [];
      }
      await db.run(sql, params, false);
      return [];
    },
    (): (() => void) => noop,
    (unsubscribeFunction: () => void): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    db,
  ) as CapacitorSqlitePersister) as typeof createCapacitorSqlitePersisterDecl;
