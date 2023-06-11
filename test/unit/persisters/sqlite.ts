import {DatabasePersisterConfig, Persister, Store} from 'tinybase/debug';
import initWasm, {DB} from '@vlcn.io/crsqlite-wasm';
import {mkdirSync, unlinkSync} from 'fs';
import sqlite3, {Database} from 'sqlite3';
import {createCrSqliteWasmPersister} from 'tinybase/debug/persisters/persister-cr-sqlite-wasm';
import {createSqlite3Persister} from 'tinybase/debug/persisters/persister-sqlite3';
import {createSqliteWasmPersister} from 'tinybase/debug/persisters/persister-sqlite-wasm';
import {dirname} from 'path';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {suppressWarnings} from '../common/other';

export type SqliteWasmDb = [sqlite3: any, db: any];
export type Dump = [
  name: string,
  sql: string,
  rows: {[column: string]: any}[],
][];

type SqliteVariant<Database> = [
  getOpenDatabase: () => Promise<Database>,
  getPersister: (
    store: Store,
    db: Database,
    storeTableOrConfig?: string | DatabasePersisterConfig,
  ) => Persister,
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (db: Database) => Promise<void>,
];

const DATABASE_FILE = 'tmp/test.sqlite3';

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const VARIANTS: {[name: string]: SqliteVariant<any>} = {
  sqlite3: [
    async (): Promise<Database> => {
      try {
        mkdirSync(dirname(DATABASE_FILE), {recursive: true});
        unlinkSync(DATABASE_FILE);
      } catch {}
      return new sqlite3.Database(DATABASE_FILE);
    },
    (
      store: Store,
      db: Database,
      storeTableOrConfig?: string | DatabasePersisterConfig,
    ) => createSqlite3Persister(store, db, storeTableOrConfig),
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
        const db = new sqlite3.oo1.DB(DATABASE_FILE, 'c');
        return [sqlite3, db];
      }),
    (
      store: Store,
      [sqlite3, db]: SqliteWasmDb,
      storeTableOrConfig?: string | DatabasePersisterConfig,
    ) => createSqliteWasmPersister(store, sqlite3, db, storeTableOrConfig),
    async ([_, db]: SqliteWasmDb, sql: string, args: any[] = []) =>
      db.exec(sql, {bind: args, rowMode: 'object', returnValue: 'resultRows'}),
    async ([_, db]: SqliteWasmDb) => await db.close(),
  ],
  crSqliteWasm: [
    async (): Promise<DB> =>
      await suppressWarnings(async () => await (await initWasm()).open()),
    (
      store: Store,
      db: DB,
      storeTableOrConfig?: string | DatabasePersisterConfig,
    ) => createCrSqliteWasmPersister(store, db, storeTableOrConfig),
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
