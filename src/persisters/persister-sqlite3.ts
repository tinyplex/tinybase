import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {Database} from 'sqlite3';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {createSqlite3Persister as createSqlite3PersisterDecl} from '../types/persisters/persister-sqlite3';
import {createSqlitePersister} from './sqlite/create';
import {promiseNew} from '../common/other';

const CHANGE = 'change';

export const createSqlite3Persister = ((
  store: Store,
  db: Database,
  configOrStoreTableName?: string | DatabasePersisterConfig,
): Persister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      promiseNew((resolve, reject) =>
        db.all(sql, args, (error, rows: IdObj<any>[]) =>
          error
            ? reject(error)
            : resolve(rows.map((row: IdObj<any>) => ({...row}))),
        ),
      ),
    (listener: PersisterListener): (() => void) => {
      const observer = () => listener();
      db.on(CHANGE, observer);
      return observer;
    },
    (observer: () => void): any => db.off(CHANGE, observer),
  )) as typeof createSqlite3PersisterDecl;
