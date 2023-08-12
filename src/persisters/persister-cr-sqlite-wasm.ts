import {DatabasePersisterConfig, Persister} from '../types/persisters';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl} from '../types/persisters/persister-cr-sqlite-wasm';

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  logSql?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Persister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await db.execO(sql, args),
    (listener: UpdateListener): (() => void) =>
      db.onUpdate((_, _2, tableName) => listener(tableName)),
    (removeListener: () => void): void => removeListener(),
    logSql,
    onIgnoredError,
  )) as typeof createCrSqliteWasmPersisterDecl;
