import {Persister, PersisterListener} from '../types/persisters';
import {DB} from '@vlcn.io/crsqlite-wasm';
import {Store} from '../types/store';
import {createCrSqliteWasmPersister as createCrSqliteWasmPersisterDecl} from '../types/persisters/persister-cr-sqlite-wasm';
import {createCustomPersister} from '../persisters';
import {getSqlitePersistedFunctions} from './common';

export const createCrSqliteWasmPersister = ((
  store: Store,
  db: DB,
): Persister => {
  const [getPersisted, setPersisted] = getSqlitePersistedFunctions(
    async (sql: string, args: any[] = []): Promise<void> => db.exec(sql, args),
    async (sql: string): Promise<any[][]> => await db.execA(sql),
  );

  const addPersisterListener = (listener: PersisterListener): (() => void) =>
    db.onUpdate(() => listener());

  const delPersisterListener = (removeListener: () => void): void =>
    removeListener();

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
}) as typeof createCrSqliteWasmPersisterDecl;
