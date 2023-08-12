import {DatabasePersisterConfig, Persister, Store} from 'tinybase/debug';
import initWasm, {DB} from '@vlcn.io/crsqlite-wasm';
import sqlite3, {Database} from 'sqlite3';
import {createCrSqliteWasmPersister} from 'tinybase/debug/persisters/persister-cr-sqlite-wasm';
import {createSqlite3Persister} from 'tinybase/debug/persisters/persister-sqlite3';
import {createSqliteWasmPersister} from 'tinybase/debug/persisters/persister-sqlite-wasm';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {suppressWarnings} from '../common/other';

export type SqliteWasmDb = [sqlite3: any, db: any];

type Dump = {[name: string]: [sql: string, rows: {[column: string]: any}[]]};

type SqliteVariant<Database> = [
  getOpenDatabase: () => Promise<Database>,
  getPersister: (
    store: Store,
    db: Database,
    storeTableOrConfig?: string | DatabasePersisterConfig,
    logSql?: (sql: string, args?: any[]) => void,
    onIgnoredError?: (error: any) => void,
  ) => Persister,
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (db: Database) => Promise<void>,
];

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const VARIANTS: {[name: string]: SqliteVariant<any>} = {
  sqlite3: [
    async (): Promise<Database> => new sqlite3.Database(':memory:'),
    (
      store: Store,
      db: Database,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      logSql?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createSqlite3Persister as any)(
        store,
        db,
        storeTableOrConfig,
        logSql,
        onIgnoredError,
      ),
    (
      db: Database,
      sql: string,
      args: any[] = [],
    ): Promise<{[id: string]: any}[]> =>
      new Promise((resolve, reject) =>
        db.all(sql, args, (error, rows: {[id: string]: any}[]) =>
          error
            ? reject(error)
            : resolve(rows.map((row: {[id: string]: any}) => ({...row}))),
        ),
      ),
    async (db: Database) => db.close(),
  ],
  sqliteWasm: [
    async (): Promise<SqliteWasmDb> =>
      await suppressWarnings(async () => {
        const sqlite3 = await sqlite3InitModule();
        const db = new sqlite3.oo1.DB(':memory:', 'c');
        return [sqlite3, db];
      }),
    (
      store: Store,
      [sqlite3, db]: SqliteWasmDb,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      logSql?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createSqliteWasmPersister as any)(
        store,
        sqlite3,
        db,
        storeTableOrConfig,
        logSql,
        onIgnoredError,
      ),
    async ([_, db]: SqliteWasmDb, sql: string, args: any[] = []) =>
      db
        .exec(sql, {bind: args, rowMode: 'object', returnValue: 'resultRows'})
        .map((row: {[id: string]: any}) => ({...row})),
    async ([_, db]: SqliteWasmDb) => await db.close(),
  ],
  crSqliteWasm: [
    async (): Promise<DB> =>
      await suppressWarnings(async () => await (await initWasm()).open()),
    (
      store: Store,
      db: DB,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      logSql?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createCrSqliteWasmPersister as any)(
        store,
        db,
        storeTableOrConfig,
        logSql,
        onIgnoredError,
      ),
    async (db: DB, sql: string, args: any[] = []) => await db.execO(sql, args),
    async (db: DB) => await db.close(),
  ],
};

export const getDatabaseFunctions = <Database>(
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
): [
  (db: Database) => Promise<Dump>,
  (db: Database, dump: Dump) => Promise<void>,
] => {
  const getDatabase = async (db: Database): Promise<Dump> =>
    Object.fromEntries(
      await Promise.all(
        (
          await cmd(
            db,
            'SELECT sql, name FROM sqlite_schema ' +
              `WHERE type = 'table' AND name NOT LIKE ?`,
            ['%crsql%'],
          )
        ).map(async ({sql, name}: any) => [
          name,
          [sql, await cmd(db, 'SELECT * FROM ' + escapeId(name))],
        ]),
      ),
    );

  const setDatabase = async (db: Database, dump: Dump) => {
    await cmd(db, 'BEGIN TRANSACTION');
    await Promise.all(
      Object.entries(dump).map(async ([name, [sql, rows]]) => {
        await cmd(db, sql);
        await Promise.all(
          rows.map(
            async (row) =>
              await cmd(
                db,
                'INSERT INTO ' +
                  escapeId(name) +
                  '(' +
                  Object.keys(row)
                    .map((cellId) => escapeId(cellId))
                    .join(',') +
                  ') VALUES (' +
                  Object.keys(row)
                    .map(() => '?')
                    .join(',') +
                  ')',
                Object.values(row),
              ),
          ),
        );
      }),
    );
    await cmd(db, 'END TRANSACTION');
  };

  return [getDatabase, setDatabase];
};
