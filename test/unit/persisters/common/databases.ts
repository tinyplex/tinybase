import 'jest-fetch-mock';
import 'fake-indexeddb/auto';
import * as SQLite from '@journeyapps/wa-sqlite';
import {Client, createClient} from '@libsql/client';
import type {DatabasePersisterConfig, Persister} from 'tinybase/persisters';
import {ElectricDatabase, electrify} from 'electric-sql/wa-sqlite';
import type {
  QueryResult,
  SQLWatchOptions,
  WatchOnChangeEvent,
} from '@powersync/common';
import type {ReservedSql, Sql} from 'postgres';
import {type Store, getUniqueId} from 'tinybase';
import initWasm, {DB} from '@vlcn.io/crsqlite-wasm';
import {pause, suppressWarnings} from '../../common/other.ts';
import sqlite3, {Database} from 'sqlite3';
import {DbSchema} from 'electric-sql/client/model';
import type {ElectricClient} from 'electric-sql/client/model';
import {Mutex} from 'async-mutex';
import {PGlite} from '@electric-sql/pglite';
import SQLiteESMFactory from '@journeyapps/wa-sqlite/dist/wa-sqlite.mjs';
import {createCrSqliteWasmPersister} from 'tinybase/persisters/persister-cr-sqlite-wasm';
import {createElectricSqlPersister} from 'tinybase/persisters/persister-electric-sql';
import {createLibSqlPersister} from 'tinybase/persisters/persister-libsql';
import {createPglitePersister} from 'tinybase/persisters/persister-pglite';
import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
import {createPowerSyncPersister} from 'tinybase/persisters/persister-powersync';
import {createSqlite3Persister} from 'tinybase/persisters/persister-sqlite3';
import {createSqliteWasmPersister} from 'tinybase/persisters/persister-sqlite-wasm';
import postgres from 'postgres';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import tmp from 'tmp';

tmp.setGracefulCleanup();
const statementMutex = new Mutex();

export type Variants = {[name: string]: DatabaseVariant<any>};
export type SqliteWasmDb = [sqlite3: any, db: any];
export type SqlClientsAndName = [Sql, ReservedSql, string];

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
  isPostgres?: boolean,
  supportsMultipleConnections?: boolean,
  skipSqlChecks?: boolean,
];

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

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
    sqlite3.str_new(db);
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
        signal?.addEventListener('abort', () => 0);
        while (!signal?.aborted) {
          const nextChange = await new Promise<WatchOnChangeEvent>(
            (resolve) => {
              const observer = (_: any, tableName: string) => {
                resolve({changedTables: [tableName]});
              };
              sqlite3.register_table_onchange_hook(db, observer);
            },
          );
          yield nextChange;
        }
      },
    }),
  };
};

export const SQLITE_MERGEABLE_VARIANTS: Variants = {
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
    async ([_, db]: SqliteWasmDb) => await db.close(),
  ],
};

export const SQLITE_NON_MERGEABLE_VARIANTS: Variants = {
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
    undefined,
    undefined,
    undefined,
    true,
  ],
  crSqliteWasm: [
    async (): Promise<DB> =>
      await suppressWarnings(async () => await (await initWasm()).open()),
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
    async (db: DB, sql: string, args: any[] = []) => await db.execO(sql, args),
    async (db: DB) => await db.close(),
  ],
};

export const POSTGRESQL_VARIANTS: Variants = {
  postgres: [
    async (
      sqlClientsAndName?: SqlClientsAndName,
    ): Promise<SqlClientsAndName> => {
      const existingName = sqlClientsAndName?.[2];
      const name = existingName ?? 'tinybase_' + getUniqueId();
      if (!existingName) {
        const adminSql = postgres('postgres://localhost:5432/');
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
    async (
      store: Store,
      [sql]: SqlClientsAndName,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      await (createPostgresPersister as any)(
        store,
        sql,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async ([, cmdSql]: SqlClientsAndName, sqlStr: string, args: any[] = []) =>
      await cmdSql.unsafe(sqlStr, args),
    async ([sql, cmdSql, name]: SqlClientsAndName) => {
      cmdSql.release();
      await sql.end({timeout: 0.1});

      const adminSql = postgres('postgres://localhost:5432/', {
        connection: {client_min_messages: 'warning'},
      });
      await adminSql`DROP DATABASE IF EXISTS ${adminSql(name)} WITH (FORCE)`;
      await adminSql.end({timeout: 0.1});
    },
    20,
    undefined,
    true,
    true,
  ],
  pglite: [
    async (): Promise<PGlite> => {
      return await suppressWarnings(async () => await PGlite.create());
    },
    ['getPglite', (pglite: PGlite) => pglite],
    async (
      store: Store,
      pglite: PGlite,
      storeTableOrConfig?: string | DatabasePersisterConfig,
      onSqlCommand?: (sql: string, args?: any[]) => void,
      onIgnoredError?: (error: any) => void,
    ) =>
      await (createPglitePersister as any)(
        store,
        pglite,
        storeTableOrConfig,
        onSqlCommand,
        onIgnoredError,
      ),
    async (pglite: PGlite, sqlStr: string, args: any[] = []) =>
      (await pglite.query(sqlStr, args)).rows as any,
    async (pglite: PGlite) => {
      await pause(10);
      await pglite.close();
    },
    undefined,
    undefined,
    true,
  ],
};

export const SQLITE_VARIANTS: Variants = {
  ...SQLITE_MERGEABLE_VARIANTS,
  ...SQLITE_NON_MERGEABLE_VARIANTS,
};

export const MERGEABLE_VARIANTS: Variants = {
  ...SQLITE_MERGEABLE_VARIANTS,
  ...POSTGRESQL_VARIANTS,
};

export const ALL_VARIANTS: Variants = {
  ...SQLITE_VARIANTS,
  ...POSTGRESQL_VARIANTS,
};

export const ADHOC_VARIANT: Variants = {
  adhoc: SQLITE_NON_MERGEABLE_VARIANTS.powerSync,
};

export const getDatabaseFunctions = <Database>(
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
  isPostgres = false,
  jsonValues = false,
): [
  (db: Database) => Promise<DumpOut>,
  (db: Database, dump: DumpIn) => Promise<void>,
] => {
  const getDatabase = async (db: Database): Promise<DumpOut> => {
    const dump: DumpOut = {};
    (
      await cmd(
        db,
        isPostgres
          ? 'SELECT table_name tn, column_name cn, data_type ty ' +
              'FROM information_schema.columns ' +
              `WHERE table_schema='public' ` +
              'AND table_name NOT LIKE $1 ' +
              'AND table_name NOT LIKE $2'
          : 'SELECT t.name tn, c.name cn, LOWER(c.type) ty ' +
              'FROM pragma_table_list() t, ' +
              'pragma_table_info(t.name) c ' +
              `WHERE t.schema='main' AND t.type = 'table' ` +
              'AND t.name NOT LIKE $1 ' +
              'AND t.name NOT LIKE $2',
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
    await cmd(db, 'BEGIN');
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
                  .map((_, index) => '$' + (index + 1))
                  .join(',') +
                ')',
              Object.values(row),
            );
          }),
        );
      }),
    );
    await cmd(db, 'END');
  };

  return [getDatabase, setDatabase];
};
