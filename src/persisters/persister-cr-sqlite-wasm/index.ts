import type {
  CrSqliteWasmPersister,
  createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl,
} from '../../@types/persisters/persister-cr-sqlite-wasm/index.d.ts';
import {
  UpdateListener,
  createSqlitePersister,
} from '../common/sqlite/create.ts';
import {DB} from '@vlcn.io/crsqlite-wasm';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {Persistables} from '../index.ts';
import type {Store} from '../../@types/store/index.d.ts';

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): CrSqliteWasmPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await db.execO(sql, args),
    (listener: UpdateListener): (() => void) =>
      db.onUpdate((_, _2, tableName) => listener(tableName)),
    (removeListener: () => void): void => removeListener(),
    onSqlCommand,
    onIgnoredError,
    Persistables.StoreOnly,
    db,
  ) as CrSqliteWasmPersister) as typeof createCrSqliteWasmPersisterDecl;
