import {DatabasePersisterConfig, Persister} from '../types/persisters';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {createSqliteWasmPersister as createSqliteWasmPersisterDecl} from '../types/persisters/persister-sqlite-wasm';

export const createSqliteWasmPersister = ((
  store: Store,
  sqlite3: any,
  db: any,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  logSql?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Persister =>
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
    logSql,
    onIgnoredError,
    db,
  )) as typeof createSqliteWasmPersisterDecl;
