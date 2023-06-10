import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {Store} from '../types/store';
import {createSqlitePersister} from './sqlite';
import {createSqliteWasmPersister as createSqliteWasmPersisterDecl} from '../types/persisters/persister-sqlite-wasm';

export const createSqliteWasmPersister = ((
  store: Store,
  sqlite3: any,
  db: any,
  storeTableOrConfig?: string | DatabasePersisterConfig,
): Persister =>
  createSqlitePersister(
    store,
    storeTableOrConfig,
    async (sql: string, args: any[] = []): Promise<void> =>
      db.exec(sql, {bind: args}),
    async (sql: string): Promise<any[][]> =>
      db.exec(sql, {returnValue: 'resultRows'}),
    (listener: PersisterListener): void =>
      sqlite3.capi.sqlite3_update_hook(db, () => listener(), 0),
    (): void => sqlite3.capi.sqlite3_update_hook(db, () => 0, 0),
  )) as typeof createSqliteWasmPersisterDecl;
