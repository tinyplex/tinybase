import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {IdObj} from '../common/obj';
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
    async (sql: string, args: any[] = []): Promise<void> =>
      await db.exec(sql, args),
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await db.execO(sql, args),
    (listener: PersisterListener): (() => void) =>
      db.onUpdate(() => listener()),
    (removeListener: () => void): void => removeListener(),
  )) as typeof createCrSqliteWasmPersisterDecl;
