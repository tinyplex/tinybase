import {DatabasePersisterConfig, Persister} from '../types/persisters';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {Database} from 'sqlite3';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {createSqlite3Persister as createSqlite3PersisterDecl} from '../types/persisters/persister-sqlite3';
import {promiseNew} from '../common/other';

const CHANGE = 'change';

type Observer = (_: any, _2: any, tableName: string) => void;

export const createSqlite3Persister = ((
  store: Store,
  db: Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  logSql?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Persister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await promiseNew((resolve, reject) =>
        db.all(sql, args, (error, rows: IdObj<any>[]) =>
          error
            ? reject(error)
            : resolve(rows.map((row: IdObj<any>) => ({...row}))),
        ),
      ),
    (listener: UpdateListener): Observer => {
      const observer = (_: any, _2: any, tableName: string) =>
        listener(tableName);
      db.on(CHANGE, observer);
      return observer;
    },
    (observer: Observer): any => db.off(CHANGE, observer),
    logSql,
    onIgnoredError,
  )) as typeof createSqlite3PersisterDecl;
