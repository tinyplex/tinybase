import {Persister, PersisterListener} from '../types/persisters';
import {Store} from '../types/store';
import {createCustomPersister} from '../persisters';
import {createSqliteWasmPersister as createSqliteWasmPersisterDecl} from '../types/persisters/persister-sqlite-wasm';
import {getSqlitePersistedFunctions} from './common';

export const createSqliteWasmPersister = ((
  store: Store,
  sqlite3: any,
  db: any,
): Persister => {
  const [getPersisted, setPersisted] = getSqlitePersistedFunctions(
    async (sql: string, args: any[] = []): Promise<void> =>
      db.exec(sql, {bind: args}),
    async (sql: string): Promise<any[][]> =>
      db.exec(sql, {returnValue: 'resultRows'}),
  );

  const addPersisterListener = (listener: PersisterListener): void =>
    sqlite3.capi.sqlite3_update_hook(db, () => listener(), 0);

  const delPersisterListener = (): void =>
    sqlite3.capi.sqlite3_update_hook(db, () => 0, 0);

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
}) as typeof createSqliteWasmPersisterDecl;
