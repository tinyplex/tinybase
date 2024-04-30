import {
  CrSqliteWasmPersister,
  createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl,
} from '../types/persisters/persister-cr-sqlite-wasm';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';

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
    1,
    db,
  ) as CrSqliteWasmPersister) as typeof createCrSqliteWasmPersisterDecl;
