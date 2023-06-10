import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {Store} from '../types/store';
import {createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl} from '../types/persisters/persister-cr-sqlite-wasm';
import {createSqlitePersister} from './sqlite';

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
  storeTableOrConfig?: string | DatabasePersisterConfig,
): Persister =>
  createSqlitePersister(
    store,
    storeTableOrConfig,
    async (sql: string, args: any[] = []): Promise<void> => db.exec(sql, args),
    async (sql: string): Promise<any[][]> => await db.execA(sql),
    (listener: PersisterListener): (() => void) =>
      db.onUpdate(() => listener()),
    (removeListener: () => void): void => removeListener(),
  )) as typeof createCrSqliteWasmPersisterDecl;
