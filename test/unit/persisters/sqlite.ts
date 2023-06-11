import {Persister, Store} from 'tinybase/debug';
import initWasm, {DB} from '@vlcn.io/crsqlite-wasm';
import sqlite3, {Database} from 'sqlite3';
import {createCrSqliteWasmPersister} from 'tinybase/debug/persisters/persister-cr-sqlite-wasm';
import {createSqlite3Persister} from 'tinybase/debug/persisters/persister-sqlite3';
import {createSqliteWasmPersister} from 'tinybase/debug/persisters/persister-sqlite-wasm';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {suppressWarnings} from '../common/other';

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export type SqliteWasmDb = [sqlite3: any, db: any];
export type Dump = [
  name: string,
  sql: string,
  rows: {[column: string]: any}[],
][];

type SqliteVariant<Database> = [
  getDatabase: () => Promise<Database>,
  getPersister: (store: Store, location: Database) => Persister,
  cmd: (
    location: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (location: Database) => Promise<void>,
];

export const variants: {[name: string]: SqliteVariant<any>} = {
  sqlite3: [
    async (): Promise<Database> => new sqlite3.Database(':memory:'),
    (store: Store, db: Database) => createSqlite3Persister(store, db),
    (
      db: Database,
      sql: string,
      args: any[] = [],
    ): Promise<{[id: string]: any}[]> =>
      new Promise((resolve, reject) =>
        db.all(sql, args, (error, rows: {[id: string]: any}[]) =>
          error ? reject(error) : resolve(rows),
        ),
      ),
    async (db: Database) => db.close(),
  ],
  sqliteWasm: [
    async (): Promise<SqliteWasmDb> =>
      await suppressWarnings(async () => {
        const sqlite3 = await sqlite3InitModule();
        const db = new sqlite3.oo1.DB('/db.sqlite3', 'c');
        return [sqlite3, db];
      }),
    (store: Store, [sqlite3, db]: SqliteWasmDb) =>
      createSqliteWasmPersister(store, sqlite3, db),
    async ([_, db]: SqliteWasmDb, sql: string, args: any[] = []) =>
      db.exec(sql, {bind: args, rowMode: 'object', returnValue: 'resultRows'}),
    async ([_, db]: SqliteWasmDb) => await db.close(),
  ],
  crSqliteWasm: [
    async (): Promise<DB> =>
      await suppressWarnings(async () => await (await initWasm()).open()),
    (store: Store, db: DB) => createCrSqliteWasmPersister(store, db),
    async (db: DB, sql: string, args: any[] = []) => await db.execO(sql, args),
    async (db: DB) => await db.close(),
  ],
};

export const sqlite3Cmd = variants.sqlite3[2];

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
    await Promise.all(
      (
        await cmd(
          db,
          `SELECT sql, name FROM sqlite_schema WHERE type = 'table'`,
        )
      ).map(async ({sql, name}: any) => [
        name,
        sql,
        await cmd(db, 'SELECT * FROM ' + escapeId(name)),
      ]),
    );

  const setDatabase = async (db: Database, dump: Dump) => {
    await cmd(db, 'BEGIN TRANSACTION');
    await Promise.all(
      dump.map(async ([name, sql, rows]) => {
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
