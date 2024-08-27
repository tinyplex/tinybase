import type {
  CrSqliteWasmPersister,
  createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl,
} from '../../@types/persisters/persister-cr-sqlite-wasm/index.d.ts';
import type {
  DatabaseChangeListener,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {IdObj} from '../../common/obj.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CrSqliteWasmPersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await db.execO(sql, args),
    (listener: DatabaseChangeListener): (() => void) =>
      db.onUpdate((_, _2, tableName) => listener(tableName)),
    (removeListener: () => void): void => removeListener(),
    onSqlCommand,
    onIgnoredError,
    1, // StoreOnly,
    db,
  ) as CrSqliteWasmPersister) as typeof createCrSqliteWasmPersisterDecl;
