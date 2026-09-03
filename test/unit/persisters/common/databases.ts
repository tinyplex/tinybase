import {PGlite} from '@electric-sql/pglite';
import * as SQLite from '@journeyapps/wa-sqlite';
import SQLiteESMFactory from '@journeyapps/wa-sqlite/dist/wa-sqlite.mjs';
import {Client, createClient} from '@libsql/client';
import type {
  QueryResult,
  SQLWatchOptions,
  WatchOnChangeEvent,
} from '@powersync/common';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import initWasm, {DB} from '@vlcn.io/crsqlite-wasm';
import {Mutex} from 'async-mutex';
import BetterSqlite3, {
  type Database as BetterSqlite3Database,
} from 'better-sqlite3';
import type {ElectricClient} from 'electric-sql/client/model';
import {DbSchema} from 'electric-sql/client/model';
import {ElectricDatabase, electrify} from 'electric-sql/wa-sqlite';
import 'fake-indexeddb/auto';
import {ConnectionPool} from 'mssql';
import {DatabaseSync} from 'node:sqlite';
import type {PoolClient} from 'pg';
import {Pool} from 'pg';
import type {ReservedSql, Sql} from 'postgres';
import postgres from 'postgres';
import sqlite3, {Database} from 'sqlite3';
import {type Content, type Store, getUniqueId} from 'tinybase';
import type {DatabasePersisterConfig, Persister} from 'tinybase/persisters';
import {createBetterSqlite3Persister} from 'tinybase/persisters/persister-better-sqlite3';
import {createCrSqliteWasmPersister} from 'tinybase/persisters/persister-cr-sqlite-wasm';
import {createElectricSqlPersister} from 'tinybase/persisters/persister-electric-sql';
import {createLibSqlPersister} from 'tinybase/persisters/persister-libsql';
import {createMsSqlPersister} from 'tinybase/persisters/persister-mssql';
import {createPgPersister} from 'tinybase/persisters/persister-pg';
import {createPglitePersister} from 'tinybase/persisters/persister-pglite';
import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
import {createPowerSyncPersister} from 'tinybase/persisters/persister-powersync';
import {createSqliteBunPersister} from 'tinybase/persisters/persister-sqlite-bun';
import {createSqliteNodePersister} from 'tinybase/persisters/persister-sqlite-node';
import {createSqliteWasmPersister} from 'tinybase/persisters/persister-sqlite-wasm';
import {createSqlite3Persister} from 'tinybase/persisters/persister-sqlite3';
import tmp from 'tmp';
import {afterAll, expect} from 'vitest';
import {
  importBunSqlite,
  isBun,
  noop,
  pause,
  suppressWarnings,
  waitFor,
} from '../../common/other.ts';

tmp.setGracefulCleanup();
const statementMutex = new Mutex();

export type Variants = {[name: string]: DatabaseVariant<any>};
export type SqliteWasmDb = [sqlite3: any, db: any];
export type SqlClientsAndName = [Sql, ReservedSql, string];
export type PgClientsAndName = [Pool, PoolClient, Mutex, string];
export type MsSqlPoolsAndName = [ConnectionPool, ConnectionPool, Mutex, string];

const PG_ADMIN_URL = 'postgres://localhost:5432/postgres';
const PG_OPTIONS = '-c client_min_messages=warning';

const pgAdmin = async (sql: string) => {
  const adminPool = new Pool({
    connectionString: PG_ADMIN_URL,
    options: PG_OPTIONS,
  });
  await adminPool.query(sql);
  await adminPool.end();
};

// SQL Server needs credentials, so unlike the trust-authenticated PostgreSQL
// above, these come from the environment rather than being hard-coded. Point
// them at a scratch instance holding nothing but test data.
const getMsSqlConfig = (database: string) => ({
  server: process.env.TINYBASE_MSSQL_SERVER ?? 'localhost',
  port: Number(process.env.TINYBASE_MSSQL_PORT ?? 1433),
  user: process.env.TINYBASE_MSSQL_USER ?? 'sa',
  password: process.env.TINYBASE_MSSQL_PASSWORD ?? '',
  database,
  pool: {max: 20},
  options: {encrypt: false, trustServerCertificate: true},
});

const msSqlAdmin = async (sql: string) => {
  const adminPool = await new ConnectionPool(
    getMsSqlConfig('master'),
  ).connect();
  await adminPool.request().query(sql);
  await adminPool.close();
};

const electricSchema = new DbSchema({}, [], []);
type Electric = ElectricClient<typeof electricSchema>;

type AbstractPowerSyncDatabase = {
  execute(sql: string, args: any[]): Promise<QueryResult>;
  close(): Promise<void>;
  onChange(options: SQLWatchOptions): AsyncIterable<WatchOnChangeEvent>;
};

type DumpRows = {[column: string]: any}[];
type DumpOut = {[table: string]: [{[column: string]: string}, rows: DumpRows]};
type DumpIn = {[table: string]: [sql: string, rows: DumpRows]};

type DatabaseVariant<Database> = [
  getOpenDatabase: (cloneFromDb?: Database) => Promise<Database>,
  getLocationMethod: [string, (database: Database) => unknown],
  getPersister: (
    store: Store,
    db: Database,
    storeTableOrConfig?: string | DatabasePersisterConfig,
    onSqlCommand?: (sql: string, args?: any[]) => void,
    onIgnoredError?: (error: any) => void,
  ) => Promise<Persister>,
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  close: (db: Database) => Promise<void>,
  autoLoadPause?: number,
  autoLoadIntervalSeconds?: number,
  dialect?: DatabaseDialect,
  supportsMultipleConnections?: boolean,
  skipSqlChecks?: boolean,
];

// Undefined means SQLite, which is the shape most of the matrix has.
export type DatabaseDialect = 'postgresql' | 'mssql';

// What INFORMATION_SCHEMA and friends report a column as.
export const getColumnType = (dialect?: DatabaseDialect) =>
  dialect == 'postgresql' ? 'text' : dialect == 'mssql' ? 'nvarchar' : '';

// What to write in a CREATE TABLE. SQL Server needs an explicit length,
// since a bare nvarchar means nvarchar(1), and its widest indexable one
// is used so that the same type works for the row Id primary key too.
export const getDdlColumnType = (dialect?: DatabaseDialect) =>
  dialect == 'mssql' ? 'nvarchar(450)' : getColumnType(dialect);

export const getPlaceholder =
  (dialect?: DatabaseDialect) =>
  (number: number): string =>
    dialect == 'postgresql'
      ? '$' + number
      : dialect == 'mssql'
        ? '@p' + number
        : '?';

// Both of the server dialects store Cells and Values JSON-encoded.
export const usesJsonValues = (dialect?: DatabaseDialect) =>
  dialect != undefined;

export const getStoreContentWaiter =
  (pauseMilliseconds: number) =>
  (store: Store, content: Content): Promise<void> =>
    waitFor(
      () => expect(store.getContent()).toEqual(content),
      pauseMilliseconds,
    );

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;
const escapeString = (str: string) => `'${str.replace(/'/g, `''`)}'`;

const getPowerSyncDatabase = async (
  dbFilename: string,
): Promise<AbstractPowerSyncDatabase> => {
  const [sqlite3, db] = await suppressWarnings(async () => {
    const Module = await SQLiteESMFactory();
    const sqlite3 = SQLite.Factory(Module);
    const db = await sqlite3.open_v2(dbFilename);
    return [sqlite3, db];
  });

  const executeSingle = async (sql: string, bindings: any[]) => {
    const results = [];

    for await (const stmt of sqlite3.statements(db, sql)) {
      let columns;
      const wrappedBindings = bindings ? [bindings] : [[]];

      for (const binding of wrappedBindings) {
        binding.forEach((b, index, arr) => {
          if (typeof b == 'boolean') {
            arr[index] = b ? 1 : 0;
          }
        });
        sqlite3.reset(stmt);
        if (bindings) {
          sqlite3.bind_collection(stmt, binding);
        }
        const rows = [];

        while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
          const row = sqlite3.row(stmt);
          rows.push(row);
        }

        columns = columns ?? sqlite3.column_names(stmt);
        if (columns.length) {
          results.push({columns, rows});
        }
      }
      if (bindings) {
        break;
      }
    }
    const rows: any[] = [];
    for (const resultRows of results) {
      for (const row of resultRows.rows) {
        const outRow: any = {};
        resultRows.columns.forEach((key, index) => (outRow[key] = row[index]));
        rows.push(outRow);
      }
    }
    const result = {
      insertId: sqlite3.last_insert_id(db),
      rowsAffected: sqlite3.changes(db),
      rows: {
        _array: rows,
        length: rows.length,
        item: (index: number) => rows[index],
      },
    };
    return result;
  };
  const _acquireExecuteLock = (callback: any) => {
    return statementMutex.runExclusive(callback);
  };
  return {
    execute: async (sql: string, bindings: any[]): Promise<any> =>
      _acquireExecuteLock(async () => executeSingle(sql, bindings)),
    close: async () => {
      await sqlite3.close(db);
    },
    onChange: ({signal} = {}) => ({
      async *[Symbol.asyncIterator]() {
        signal?.addEventListener('abort', noop);
        while (!signal?.aborted) {
          const nextChange = await new Promise<WatchOnChangeEvent>(
            (resolve) => {
              const observer = (_1: any, _2: any, tableName: string) => {
                resolve({changedTables: [tableName]});
              };
              sqlite3.update_hook(db, observer);
            },
          );
          yield nextChange;
        }
      },
    }),
  };
};

export const NODE_SQLITE_MERGEABLE_VARIANTS: Variants = {
  betterSqlite3: [
    async (
      dbAndName?: [BetterSqlite3Database, string],
    ): Promise<[BetterSqlite3Database, string]> => {
      const name = dbAndName?.[1] ?? tmp.tmpNameSync();
      return [new BetterSqlite3(name), name];
    },
    ['getDb', ([db]: [BetterSqlite3Database, string]) => db],
    (
      store: Store,
      [db]: [BetterSqlite3Database, string],
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createBetterSqlite3Persister as any)(
        store,
        db,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async (
      [db]: [BetterSqlite3Database, string],
      sql: string,
      args: any[] = [],
    ): Promise<{[id: string]: any}[]> => {
      const statement = db.prepare(sql);
      return statement.reader
        ? (statement.all(...args) as {[id: string]: any}[])
        : (statement.run(...args), []);
    },
    async ([db]: [BetterSqlite3Database, string]) => {
      db.close();
    },
    20,
    undefined,
    undefined,
    true,
  ],
  sqliteNode: [
    async (
      dbAndName?: [DatabaseSync, string],
    ): Promise<[DatabaseSync, string]> => {
      const name = dbAndName?.[1] ?? tmp.tmpNameSync();
      return [new DatabaseSync(name), name];
    },
    ['getDb', ([db]: [DatabaseSync, string]) => db],
    (
      store: Store,
      [db]: [DatabaseSync, string],
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createSqliteNodePersister as any)(
        store,
        db,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async (
      [db]: [DatabaseSync, string],
      sql: string,
      args: any[] = [],
    ): Promise<{[id: string]: any}[]> =>
      db.prepare(sql).all(...args) as {[id: string]: any}[],
    async ([db]: [DatabaseSync, string]) => {
      db.close();
    },
    20,
    undefined,
    undefined,
    true,
  ],
  sqlite3: [
    async (dbAndName?: [Database, string]): Promise<[Database, string]> => {
      const existingName = dbAndName?.[1];
      const name = existingName ?? tmp.tmpNameSync();
      return [new sqlite3.Database(name), name];
    },
    ['getDb', ([db]: [Database, string]) => db],
    (
      store: Store,
      [db]: [Database, string],
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
      [db]: [Database, string],
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
    async ([db]: [Database, string]) => db.close(),
    20,
    undefined,
    undefined,
    true,
  ],
  sqliteWasm: [
    async (): Promise<SqliteWasmDb> =>
      await suppressWarnings(async () => {
        const sqlite3 = await sqlite3InitModule();
        const db = new sqlite3.oo1.DB(':memory:', 'c');
        return [sqlite3, db];
      }),
    ['getDb', (db: SqliteWasmDb) => db[1]],
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
    ([_, db]: SqliteWasmDb) => db.close(),
  ],
};

export const NODE_SQLITE_NON_MERGEABLE_VARIANTS: Variants = {
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
    (): Promise<Electric> =>
      suppressWarnings(
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
    (electricClient: Electric, sql: string, args: any[] = []) =>
      electricClient.db.raw({sql, args}),
    (electricClient: Electric) => electricClient.close(),
  ],
  powerSync: [
    async (): Promise<AbstractPowerSyncDatabase> =>
      await getPowerSyncDatabase(':memory:'),
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
      ),
    (powerSync: AbstractPowerSyncDatabase, sql: string, args: any[] = []) =>
      powerSync.execute(sql, args).then((result) => result.rows?._array ?? []),
    (powerSync: AbstractPowerSyncDatabase) => powerSync.close(),
    undefined,
    0.01,
    undefined,
    undefined,
    true,
  ],
  crSqliteWasm: [
    (): Promise<DB> =>
      suppressWarnings(async () => await (await initWasm()).open()),
    ['getDb', (db: DB) => db],
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
    (db: DB, sql: string, args: any[] = []) => db.execO(sql, args),
    (db: DB) => db.close(),
  ],
};

let sharedPglite: Promise<PGlite> | undefined;

afterAll(async () => {
  if (sharedPglite) {
    const pglite = sharedPglite;
    sharedPglite = undefined;
    await (await pglite).close();
  }
});

export const NODE_POSTGRESQL_VARIANTS: Variants = {
  postgres: [
    async (
      sqlClientsAndName?: SqlClientsAndName,
    ): Promise<SqlClientsAndName> => {
      const existingName = sqlClientsAndName?.[2];
      const name = existingName ?? 'tinybase_' + getUniqueId();
      if (!existingName) {
        const adminSql = postgres('postgres://localhost:5432/postgres');
        await adminSql`CREATE DATABASE ${adminSql(name)}`;
        await adminSql.end({timeout: 0.1});
      }

      const sql = postgres('postgres://localhost:5432/' + name, {
        connection: {client_min_messages: 'warning'},
      });
      const cmdSql = await sql.reserve();
      return [sql, cmdSql, name];
    },
    ['getSql', ([sql]: SqlClientsAndName) => sql],
    (
      store: Store,
      [sql]: SqlClientsAndName,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createPostgresPersister as any)(
        store,
        sql,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    ([, cmdSql]: SqlClientsAndName, sqlStr: string, args: any[] = []) =>
      cmdSql.unsafe(sqlStr, args),
    async ([sql, cmdSql, name]: SqlClientsAndName) => {
      cmdSql.release();
      await sql.end({timeout: 0.1});

      const adminSql = postgres('postgres://localhost:5432/postgres', {
        connection: {client_min_messages: 'warning'},
      });
      await adminSql`DROP DATABASE IF EXISTS ${adminSql(name)} WITH (FORCE)`;
      await adminSql.end({timeout: 0.1});
    },
    20,
    undefined,
    'postgresql',
    true,
  ],
  pg: [
    async (pgClientsAndName?: PgClientsAndName): Promise<PgClientsAndName> => {
      const existingName = pgClientsAndName?.[3];
      const name = existingName ?? 'tinybase_' + getUniqueId();
      if (!existingName) {
        await pgAdmin('CREATE DATABASE ' + escapeId(name));
      }

      const pool = new Pool({
        connectionString: 'postgres://localhost:5432/' + name,
        options: PG_OPTIONS,
        max: 20,
      });
      // Dropping the database below terminates connections; without this, `pg`
      // would raise those as unhandled errors.
      pool.on('error', noop);
      pool.on('connect', (client) => client.on('error', noop));
      // Commands are issued as transactions, so need one stable connection.
      const cmdClient = await pool.connect();
      return [pool, cmdClient, new Mutex(), name];
    },
    ['getPg', ([pool]: PgClientsAndName) => pool],
    (
      store: Store,
      [pool]: PgClientsAndName,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createPgPersister as any)(
        store,
        pool,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    ([, cmdClient, cmdMutex]: PgClientsAndName, sqlStr: string, args = []) =>
      cmdMutex.runExclusive(
        async () => (await cmdClient.query(sqlStr, args)).rows,
      ),
    async ([pool, cmdClient, , name]: PgClientsAndName) => {
      cmdClient.release();
      // Tests may leave a Persister holding a client, which would make a
      // graceful end wait forever; the forced drop below closes them anyway.
      await Promise.race([pool.end().catch(noop), pause(100)]);
      await pgAdmin(`DROP DATABASE IF EXISTS ${escapeId(name)} WITH (FORCE)`);
    },
    20,
    undefined,
    'postgresql',
    true,
  ],
  pglite: [
    // A PGlite instance is a whole WASM Postgres; creating one per test can
    // breach the hook timeout under load. One is shared per test file, with a
    // schema reset giving each test an empty database.
    async (): Promise<PGlite> => {
      const pglite = await (sharedPglite ??= suppressWarnings(() =>
        PGlite.create(),
      ));
      await pglite.exec(
        'DROP SCHEMA IF EXISTS public CASCADE;CREATE SCHEMA public;',
      );
      return pglite;
    },
    ['getPglite', (pglite: PGlite) => pglite],
    (
      store: Store,
      pglite: PGlite,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createPglitePersister as any)(
        store,
        pglite,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async (pglite: PGlite, sqlStr: string, args: any[] = []) =>
      (await pglite.query(sqlStr, args)).rows as any,
    async () => {},
    undefined,
    undefined,
    'postgresql',
  ],
};

export const BUN_MERGEABLE_VARIANTS: Variants = {
  bunSqlite: [
    async () => {
      const {Database} = await importBunSqlite();
      return new Database(':memory:');
    },
    ['getDb', (db: typeof Database) => db],
    (
      store: Store,
      db: typeof Database,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      (createSqliteBunPersister as any)(
        store,
        db,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    (db: any, sql: string, args: any[] = []): Promise<{[id: string]: any}[]> =>
      db.query(sql).all(args),
    (db: any) => db.close(),
  ],
};

export const NODE_MSSQL_VARIANTS: Variants = {
  mssql: [
    async (
      msSqlPoolsAndName?: MsSqlPoolsAndName,
    ): Promise<MsSqlPoolsAndName> => {
      const existingName = msSqlPoolsAndName?.[3];
      const name = existingName ?? 'tinybase_' + getUniqueId();
      if (!existingName) {
        await msSqlAdmin('CREATE DATABASE ' + escapeId(name));
      }
      const pool = await new ConnectionPool(getMsSqlConfig(name)).connect();
      // Commands are issued as transactions, so they need one stable
      // connection rather than an arbitrary one from the pool each time.
      const cmdPool = await new ConnectionPool({
        ...getMsSqlConfig(name),
        pool: {min: 1, max: 1},
      }).connect();
      return [pool, cmdPool, new Mutex(), name];
    },
    ['getMsSql', ([pool]: MsSqlPoolsAndName) => pool],
    (store, [pool], storeTableOrConfig, onSqlCommand, onIgnoredError) =>
      (createMsSqlPersister as any)(
        store,
        pool,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    (
      [, cmdPool, cmdMutex]: MsSqlPoolsAndName,
      sqlStr: string,
      args: any[] = [],
    ) =>
      cmdMutex.runExclusive(async () => {
        const request = cmdPool.request();
        args.forEach((arg, index) => request.input('p' + (index + 1), arg));
        return (await request.query(sqlStr)).recordset ?? [];
      }),
    async ([pool, cmdPool, , name]: MsSqlPoolsAndName) => {
      await Promise.race([pool.close().catch(noop), pause(100)]);
      await Promise.race([cmdPool.close().catch(noop), pause(100)]);
      // Both handles of a two-connection test name the same database, so
      // the second close finds it already gone. Remaining connections also
      // have to be booted before the drop can proceed.
      await msSqlAdmin(
        `IF DB_ID(${escapeString(name)}) IS NOT NULL BEGIN ` +
          `ALTER DATABASE ${escapeId(name)} ` +
          'SET SINGLE_USER WITH ROLLBACK IMMEDIATE;' +
          `DROP DATABASE ${escapeId(name)};END`,
      );
    },
    20,
    undefined,
    'mssql',
    true,
  ],
};

export const NODE_SQLITE_VARIANTS: Variants = {
  ...NODE_SQLITE_MERGEABLE_VARIANTS,
  ...NODE_SQLITE_NON_MERGEABLE_VARIANTS,
};

export const NODE_MERGEABLE_VARIANTS: Variants = {
  ...NODE_SQLITE_MERGEABLE_VARIANTS,
  ...NODE_POSTGRESQL_VARIANTS,
  ...NODE_MSSQL_VARIANTS,
};

export const ALL_NODE_VARIANTS: Variants = {
  ...NODE_SQLITE_VARIANTS,
  ...NODE_POSTGRESQL_VARIANTS,
};

// The SQL Server Persister only supports JSON serialization so far, so it
// joins the JSON suites but not the tabular one.
export const ALL_NODE_JSON_VARIANTS: Variants = {
  ...ALL_NODE_VARIANTS,
  ...NODE_MSSQL_VARIANTS,
};

export const ALL_BUN_VARIANTS: Variants = {
  ...BUN_MERGEABLE_VARIANTS,
};

export const MERGEABLE_VARIANTS = isBun
  ? BUN_MERGEABLE_VARIANTS
  : NODE_MERGEABLE_VARIANTS;

export const ALL_VARIANTS = isBun ? ALL_BUN_VARIANTS : ALL_NODE_VARIANTS;

export const ALL_JSON_VARIANTS = isBun
  ? ALL_BUN_VARIANTS
  : ALL_NODE_JSON_VARIANTS;

export const ADHOC_VARIANTS: Variants = {
  adhoc: NODE_SQLITE_NON_MERGEABLE_VARIANTS.crSqliteWasm,
};

export const getDatabaseFunctions = <Database>(
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  dialect?: DatabaseDialect,
  jsonValues = false,
): [
  (db: Database) => Promise<DumpOut>,
  (db: Database, dump: DumpIn) => Promise<void>,
  (db: Database, dump: DumpOut) => Promise<void>,
] => {
  const placeholder = getPlaceholder(dialect);

  const getDatabase = async (db: Database): Promise<DumpOut> => {
    const dump: DumpOut = {};
    (
      await cmd(
        db,
        dialect == 'postgresql'
          ? 'SELECT table_name tn, column_name cn, data_type ty ' +
              'FROM information_schema.columns ' +
              `WHERE table_schema='public' ` +
              `AND table_name NOT LIKE ${placeholder(1)} ` +
              `AND table_name NOT LIKE ${placeholder(2)}`
          : dialect == 'mssql'
            ? // The rowversion column that the Persister maintains for
              // auto-loading is excluded, since it is not part of the schema
              // that TinyBase itself manages.
              'SELECT TABLE_NAME tn, COLUMN_NAME cn, DATA_TYPE ty ' +
              'FROM INFORMATION_SCHEMA.COLUMNS ' +
              `WHERE TABLE_SCHEMA=SCHEMA_NAME() AND DATA_TYPE<>'timestamp' ` +
              `AND TABLE_NAME NOT LIKE ${placeholder(1)} ` +
              `AND TABLE_NAME NOT LIKE ${placeholder(2)}`
            : 'SELECT t.name tn, c.name cn, LOWER(c.type) ty ' +
              'FROM pragma_table_list() t, ' +
              'pragma_table_info(t.name) c ' +
              `WHERE t.schema='main' AND t.type = 'table' ` +
              `AND t.name NOT LIKE ${placeholder(1)} ` +
              `AND t.name NOT LIKE ${placeholder(2)}`,
        ['%sql%', '%electric%'],
      )
    ).forEach(({tn, cn, ty}) => {
      if (!dump[tn]) {
        dump[tn] = [{}, [{}]];
      }
      dump[tn][0][cn] = ty;
    });
    await Promise.all(
      Object.keys(dump).map(async (tn) => {
        const rows = await cmd(
          db,
          'SELECT * FROM ' + escapeId(tn) + ' ORDER BY 1',
        );
        rows.forEach((row) => {
          Object.entries(row).forEach(([column, value], index) => {
            if (index == 0 || !jsonValues) {
              row[column] = value;
            } else {
              row[column] = JSON.parse(value);
            }
          });
        });
        dump[tn][1] = [...rows];
      }),
    );
    return dump;
  };

  const setDatabase = async (db: Database, dump: DumpIn) => {
    // The mssql module drives transactions through its own Transaction
    // object, so raw statements issued on pooled connections leave the
    // transaction count unbalanced. Seeding does not need to be atomic.
    const transactional = dialect != 'mssql';
    if (transactional) {
      await cmd(db, 'BEGIN');
    }
    await Promise.all(
      Object.entries(dump).map(async ([name, [sql, rows]]) => {
        await cmd(db, sql);
        await Promise.all(
          rows.map(async (row) => {
            Object.entries(row).forEach(([column, value], index) => {
              if (index == 0 || !jsonValues) {
                row[column] = value;
              } else {
                row[column] = JSON.stringify(value);
              }
            });
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
                  .map((_, index) => placeholder(index + 1))
                  .join(',') +
                ')',
              Object.values(row),
            );
          }),
        );
      }),
    );
    if (transactional) {
      await cmd(db, 'END');
    }
  };

  const expectDatabaseContent = (db: Database, dump: DumpOut): Promise<void> =>
    waitFor(async () => expect(await getDatabase(db)).toEqual(dump), 10);

  return [getDatabase, setDatabase, expectDatabaseContent];
};
