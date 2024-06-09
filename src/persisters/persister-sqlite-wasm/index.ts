import type {
  SqliteWasmPersister,
  createSqliteWasmPersister as createSqliteWasmPersisterDecl,
} from '../../@types/persisters/persister-sqlite-wasm/index.d.ts';
import {
  UpdateListener,
  createSqlitePersister,
} from '../common/sqlite/create.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';

export const createSqliteWasmPersister = ((
  store: Store | MergeableStore,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): SqliteWasmPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      db
        .exec(sql, {bind: args, rowMode: 'object', returnValue: 'resultRows'})
        .map((row: IdObj<any>) => ({...row})),
    (listener: UpdateListener): void =>
      sqlite3.capi.sqlite3_update_hook(
        db,
        (_: any, _2: any, _3: any, tableName: string) => listener(tableName),
        0,
      ),
    (): void => sqlite3.capi.sqlite3_update_hook(db, () => 0, 0),
    onSqlCommand,
    onIgnoredError,
    3,
    db,
  ) as SqliteWasmPersister) as typeof createSqliteWasmPersisterDecl;
