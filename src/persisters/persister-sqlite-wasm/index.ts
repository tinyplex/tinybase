import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  SqliteWasmPersister,
  createSqliteWasmPersister as createSqliteWasmPersisterDecl,
} from '../../@types/persisters/persister-sqlite-wasm/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

export const createSqliteWasmPersister = ((
  store: Store | MergeableStore,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteWasmPersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      db
        .exec(sql, {bind: params, rowMode: 'object', returnValue: 'resultRows'})
        .map((row: IdObj<any>) => ({...row})),
    (listener: DatabaseChangeListener): void =>
      sqlite3.capi.sqlite3_update_hook(
        db,
        (_: any, _2: any, _3: any, tableName: string) => listener(tableName),
        0,
      ),
    (): void => sqlite3.capi.sqlite3_update_hook(db, () => 0, 0),
    onSqlCommand,
    onIgnoredError,
    () => 0,
    3, // StoreOrMergeableStore,
    db,
  ) as SqliteWasmPersister) as typeof createSqliteWasmPersisterDecl;
