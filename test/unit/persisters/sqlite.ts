import 'fake-indexeddb/auto';
import {Client, createClient} from '@libsql/client';
import type {DatabasePersisterConfig, Persister, Store} from 'tinybase/debug';
import {ElectricDatabase, electrify} from 'electric-sql/wa-sqlite';
import type {
  QueryResult,
  SQLWatchOptions,
  WatchOnChangeEvent,
} from '@journeyapps/powersync-sdk-common';
import initWasm, {DB} from '@vlcn.io/crsqlite-wasm';
import sqlite3, {Database} from 'sqlite3';
import {DbSchema} from 'electric-sql/client/model';
import type {ElectricClient} from 'electric-sql/client/model';
import {createCrSqliteWasmPersister} from 'tinybase/debug/persisters/persister-cr-sqlite-wasm';
import {createElectricSqlPersister} from 'tinybase/debug/persisters/persister-electric-sql';
import {createLibSqlPersister} from 'tinybase/debug/persisters/persister-libsql';
import {createPowerSyncPersister} from 'tinybase/debug/persisters/persister-powersync';
import {createSqlite3Persister} from 'tinybase/debug/persisters/persister-sqlite3';
import {createSqliteWasmPersister} from 'tinybase/debug/persisters/persister-sqlite-wasm';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {suppressWarnings} from '../common/other';

export type SqliteWasmDb = [sqlite3: any, db: any];

const electricSchema = new DbSchema({}, [], []);
type Electric = ElectricClient<typeof electricSchema>;

type AbstractPowerSyncDatabase = {
  execute(sql: string, args: any[]): Promise<QueryResult>;
  close(): Promise<void>;
  onChange(options: SQLWatchOptions): AsyncIterable<WatchOnChangeEvent>;
};

type Dump = {[name: string]: [sql: string, rows: {[column: string]: any}[]]};

type SqliteVariant<Database> = [
  getOpenDatabase: () => Promise<Database>,
  getLocationMethod: [string, (database: Database) => unknown],
  getPersister: (
    store: Store,
    db: Database,
    storeTableOrConfig?: string | DatabasePersisterConfig,
    onSqlCommand?: (sql: string, args?: any[]) => void,
    onIgnoredError?: (error: any) => void,
  ) => Persister,
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (db: Database) => Promise<void>,
  autoLoadPause?: number,
  autoLoadIntervalSeconds?: number,
];

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

const getPowerSyncDatabase = (
  dbFilename: string,
): AbstractPowerSyncDatabase => {
  const db = new sqlite3.Database(dbFilename);
  return {
    execute: (sql, args) =>
      new Promise((resolve, reject) => {
        return db.all(sql, args, (error, rows: {[id: string]: any}[]) =>
          error
            ? reject(error)
            : resolve({
                rows: {
                  _array: rows.map((row: {[id: string]: any}) => ({
                    ...row,
                  })),
                  length: rows.length,
                  item: () => null,
                },
                rowsAffected: 0,
              }),
        );
      }),
    close: () =>
      new Promise((resolve) => {
        db.close();
        resolve();
      }),
    onChange: ({signal} = {}) => ({
      async *[Symbol.asyncIterator]() {
        signal?.addEventListener('abort', () =>
          db.removeAllListeners('change'),
        );
        while (!signal?.aborted) {
          const nextChange = await new Promise<WatchOnChangeEvent>(
            (resolve) => {
              const observer = (_: any, _2: any, tableName: string) => {
                db.removeAllListeners('change');
                resolve({changedTables: [tableName]});
              };
              db.addListener('change', observer);
            },
          );
          yield nextChange;
        }
      },
    }),
  };
};

export const VARIANTS: {[name: string]: SqliteVariant<any>} = {
  libSql: [
    async (): Promise<Client> => createClient({url: 'file::memory:'}),
    ['getClient', (client: Client) => client],
    (
      store: Store,
      client: Client,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createLibSqlPersister as any)(
        store,
        client,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async (
      client: Client,
      sql: string,
      args: any[] = [],
    ): Promise<{[id: string]: any}[]> =>
      (await client.execute({sql, args})).rows,
    async (client: Client) => client.close(),
  ],
  electricSql: [
    async (): Promise<Electric> =>
      await suppressWarnings(
        async () =>
          await electrify(
            await ElectricDatabase.init(':memory:'),
            electricSchema,
          ),
      ),
    ['getElectricClient', (electricClient: Electric) => electricClient],
    (
      store: Store,
      electric: Electric,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createElectricSqlPersister as any)(
        store,
        electric,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async (electricClient: Electric, sql: string, args: any[] = []) =>
      await electricClient.db.raw({sql, args}),
    async (electricClient: Electric) => await electricClient.close(),
    200,
    0.2,
  ],
  powerSync: [
    async (): Promise<AbstractPowerSyncDatabase> =>
      getPowerSyncDatabase(':memory:'),
    ['getPowerSync', (powerSync: AbstractPowerSyncDatabase) => powerSync],
    (
      store: Store,
      db: AbstractPowerSyncDatabase,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createPowerSyncPersister as any)(
        store,
        db,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
        true,
      ),
    (ps: AbstractPowerSyncDatabase, sql: string, args: any[] = []) =>
      ps.execute(sql, args).then((result) => result.rows?._array ?? []),
    (ps: AbstractPowerSyncDatabase) => ps.close(),
  ],
  sqlite3: [
    async (): Promise<Database> => new sqlite3.Database(':memory:'),
    ['getDb', (database: Database) => database],
    (
      store: Store,
      db: Database,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createSqlite3Persister as any)(
        store,
        db,
        storeTableOrConfig,
        onSqlCommand,
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
    ['getDb', (sqliteWasmDb: SqliteWasmDb) => sqliteWasmDb[1]],
    (
      store: Store,
      [sqlite3, db]: SqliteWasmDb,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createSqliteWasmPersister as any)(
        store,
        sqlite3,
        db,
        storeTableOrConfig,
        onSqlCommand,
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
    ['getDb', (database: DB) => database],
    (
      store: Store,
      db: DB,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createCrSqliteWasmPersister as any)(
        store,
        db,
        storeTableOrConfig,
        onSqlCommand,
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
              `WHERE type = 'table'` +
              ' AND name NOT LIKE ? ' +
              ' AND name NOT LIKE ?',
            ['%sql%', '%electric%'],
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
