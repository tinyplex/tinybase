import {Sql} from 'postgres';
import {
  CellStamp,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
} from '../@types/mergeable-store/index.js';
import {getHlcFunctions} from '../common/hlc.ts';

export type Config<TableIds extends string> = {
  sql: Sql;
  tables: Record<TableIds, TableConfig>;
  outboxTable?: {
    // to synchronize data we want to use outbox pattern
    // this is the table that will be used to store the data that needs to be synchronized
    // it's a table with a table (string), timestamp, data (jsonb|null) and scope (string) column which is basically just a condition
    // it's populated by trigger which persister registers when initiated
    // persister will store last db timestamp during load in store values so it can always continue from there
    schema?: string; // defaults to public
    tableName: string;
    metaTableName: string;
  };
  // kv store for persister metadata, is used for things like sync timestamps, can be used for continuing sync from where other instance left off
  // it's separate from store so it's not synced to other instances
  metaStore?: {
    get(key: string): any;
    set(key: string, value: any): void;
  };
  logger?: Pick<typeof console, (typeof LOG_LEVELS)[number]>;
  openTelemetry?: unknown; // ...tbd
  // ...tbd
};

type TableConfig = {
  postgres: {
    schema?: string; // defaults to public
    tableName: string;
    condition?: string; // defaults to TRUE
    idColumnName?: string; // defaults to id
    timestampColumnName?: string; // defaults to updated_at
  };
  // ... possibly things like autoLoadInterval and others, but not sure if these are needed
};

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
const NOOP = () => {};

export function createLogger(
  logger: Config<any>['logger'] = console,
  level: (typeof LOG_LEVELS)[number] = 'error',
  prefix: string = '[PgPersister] ',
): NonNullable<Config<any>['logger']> {
  const logLevelIndex = LOG_LEVELS.indexOf(level);
  if (logLevelIndex === -1) throw new Error(`Invalid log level: ${level}`);

  const prefixLog = (logFn: (typeof logger)[(typeof LOG_LEVELS)[number]]) => {
    return (...args: any[]) => logFn(prefix, ...args);
  };

  return {
    debug: logLevelIndex <= 0 ? prefixLog(logger.debug) : NOOP,
    info: logLevelIndex <= 1 ? prefixLog(logger.info) : NOOP,
    warn: logLevelIndex <= 2 ? prefixLog(logger.warn) : NOOP,
    error: logLevelIndex <= 3 ? prefixLog(logger.error) : NOOP,
  };
}

/**
CREATE TABLE IF NOT EXISTS outbox (
  id SERIAL PRIMARY KEY,
  rowId UUID NOT NULL,
  tableName VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  payload JSONB NOT NULL,
  persisterId VARCHAR(12) NOT NULL
);
 */

type OutboxRow = {
  id: number;
  rowId: string;
  persisterId: string;
  tableName: string;
  timestamp: string;
  payload: object;
};

export class PgPersister<TableIds extends string> {
  private readonly config: Config<TableIds>;
  private readonly store: MergeableStore;
  private readonly id: string;
  private readonly metaStore: {
    get(key: string): any;
    set(key: string, value: any): void;
  };
  private autoLoadListener: {unlisten: () => Promise<void>} | undefined;
  private autoSaveListener: string | undefined;
  private autoLoadLastLogicalTime: number = 0;
  private hlcCounters = new Map<number, number>();
  private hlcIdHash: string;
  private encodeHlc: (
    logicalTime: number,
    counter: number,
    clientId?: string,
  ) => string;
  private decodeHlc: (
    hlc: string,
  ) => [logicalTime: number, counter: number, clientId: string];

  private readonly tablesStatus: Record<
    TableIds,
    {
      load: Date | null | Promise<void>;
      save: Date | null | Promise<void>;
      timestampListenerId?: string;
    }
  >;

  constructor(store: MergeableStore, config: Config<TableIds>) {
    this.store = store;
    this.config = config;
    this.metaStore = config.metaStore ?? new Map();
    this.id = this.metaStore.get('id') ?? crypto.randomUUID().split('-').at(-1); // last part of uuid is unique enough for our use case, we don't expect to have that many persisters on same table
    this.metaStore.set('id', this.id);

    const [, , encodeHlc, decodeHlc, , , getClientId] = getHlcFunctions(
      this.id,
    );
    this.encodeHlc = encodeHlc;
    this.decodeHlc = decodeHlc;
    this.hlcIdHash = getClientId();

    this.tablesStatus = Object.keys(config.tables).reduce(
      (acc, tableId) => {
        acc[tableId as TableIds] = {load: null, save: null};
        return acc;
      },
      {} as typeof this.tablesStatus,
    );
  }

  private get sql() {
    return this.config.sql;
  }

  private get logger() {
    return this.config.logger ?? console;
  }

  private get tableIds() {
    return Object.keys(this.config.tables) as TableIds[];
  }

  private ensureSyncAllowed() {
    if (!this.config.outboxTable) {
      throw new Error('Sync is not allowed, syncOutboxTable is not configured');
    }
    return true;
  }

  // do load and return promise when everything is done
  // if since is passed in it'll do 2 sql queries, 1) select * where timestamp > date, 2) `SELECT FROM (values $1) LEFT JOIN table on id=id where table.id = null` to find ids that were deleted since the date
  async load(): Promise<void> {
    this.logger.info('Loading tables');
    const startTimestamp = await this.getDatabaseTimestamp();
    for (const tableId of this.tableIds) {
      this.tablesStatus[tableId].load = this.loadTable(tableId).then(() => {
        this.tablesStatus[tableId].load = startTimestamp;
      });
    }

    await Promise.all(
      this.tableIds.map((tableId) => this.tablesStatus[tableId].load),
    );
    this.metaStore.set('lastLoadTimestamp', startTimestamp);
  }

  // this currently works as pg is source of truth and it fully overwrites store, with now stamps
  // which may be good for initial load but not for merging
  protected async loadTable(tableId: TableIds): Promise<void> {
    this.logger.info('Loading table', tableId);
    const {schema, tableName, condition, idColumnName, timestampColumnName} =
      this.config.tables[tableId].postgres;
    const sql = this.sql;

    const table = sql(`${schema ?? 'public'}.${tableName}`);
    const where = condition
      ? sql.unsafe(
          `WHERE ${condition.replaceAll('$tableName', `"${schema ?? 'public'}"."${tableName}"`)}`,
        )
      : sql``;

    this.logger.debug('Resetting table', tableId);
    // todo remove this, it's too dangerous as it triggers delete of all rows
    this.store.setTable(tableId, {});

    // todo we should do some logging here when the query is executed
    await sql`SELECT * FROM ${table} ${where}`.forEach((row) => {
      const rowId: string = row[idColumnName ?? 'id'];
      const timestamp: string =
        row[timestampColumnName ?? 'updated_at'] ?? new Date().toISOString();
      const time = this.getHlc(new Date(timestamp).getTime());
      const cells = Object.entries(row).reduce(
        (acc, [cellId, value]) => {
          acc[cellId] = [value, time, 0];
          return acc;
        },
        {} as {[cellId: string]: CellStamp<true>},
      );
      const content: MergeableContent = [
        [{[tableId]: [{[rowId]: [cells, time, 0]}, time, 0]}, time, 0],
        [{}, time, 0],
      ];
      this.store.applyMergeableChanges(content);
    });

    this.logger.debug('Finished loading table', tableId);
  }

  // wait for load of specific table to finish
  waitForTable(tableId: TableIds): Promise<void> {
    const status = this.tablesStatus[tableId];
    this.logger.debug(`Waiting for table ${tableId} to load`, status);

    if (status.load === null) {
      throw new Error(`Table ${tableId} is not loading`);
    }

    if (status.load instanceof Promise) {
      return status.load;
    }

    return Promise.resolve();
  }

  // do insert on conflict update + delete where id not in
  async save(): Promise<void> {
    this.logger.info('Saving tables');
    for (const tableId of this.tableIds) {
      this.tablesStatus[tableId].save = this.saveTable(tableId);
    }

    await Promise.all(
      this.tableIds.map((tableId) => this.tablesStatus[tableId].save),
    );
  }

  protected async saveTable(tableId: TableIds): Promise<void> {
    this.logger.info(`Saving table`, tableId);
    const {schema, tableName, condition, idColumnName} =
      this.config.tables[tableId].postgres;
    const sql = this.sql;

    const table = sql`${sql(schema ?? 'public')}.${sql(tableName)}`;
    const filterCondition = condition
      ? sql.unsafe(condition.replace('$tableName', tableName))
      : sql`TRUE`;
    const idColumn = sql(idColumnName ?? 'id');

    const startTimestamp = new Date();
    const data = Object.values(this.store.getTable(tableId));

    await sql.begin(async (sql) => {
      const columnNames = Object.keys(data[0] ?? {});

      const upsertsQuery = data.length
        ? sql`
            INSERT INTO ${table} ${sql(data, ...columnNames)}
            ON CONFLICT (${idColumn}) 
            DO UPDATE SET ${columnNames.map((column, i, arr) => sql`${sql(column)}=EXCLUDED.${sql(column)}${i < arr.length - 1 ? sql`,` : sql``}`)}
        `
        : null;

      const knownIds = data
        .map((row) => row[idColumnName ?? 'id'])
        .filter((id) => id !== undefined);

      const deletesQuery = sql`
        DELETE FROM ${table} 
        WHERE 
            ${filterCondition} AND 
            ${knownIds.length ? sql`${idColumn} NOT IN ${sql(knownIds)}` : sql`TRUE`}
        `;

      await Promise.all([upsertsQuery, deletesQuery]);
    });

    this.tablesStatus[tableId].save = startTimestamp;
    this.logger.debug('Finished saving table', tableId);
  }

  private async getDatabaseTimestamp() {
    const [row] = await this.sql`SELECT NOW() as ts`;
    return new Date(row?.ts);
  }

  private getHlc(timestamp: number): string {
    const counter = (this.hlcCounters.get(timestamp) ?? -1) + 1;
    this.hlcCounters.set(timestamp, counter);
    return this.encodeHlc(timestamp, counter, this.id);
  }

  // add triggers and listen to them
  async startAutoLoad() {
    this.logger.info('Starting auto load');
    this.ensureSyncAllowed();
    const sql = this.sql;
    const {schema, tableName} = this.config.outboxTable!;

    const outboxTable = sql(`${schema ?? 'public'}.${tableName}`);
    const triggerName = sql(`${tableName}_notify_trigger`);
    const functionName = sql(
      `${schema ?? 'public'}.${tableName}_notify_function`,
    );
    const channelName = `${schema}_${tableName}_notify`;

    // create outbox trigger if it doesn't exist
    // or replace it if it does, we're doing replace instead of ignore to update if there was some previous deploy
    await sql`
        CREATE OR REPLACE FUNCTION ${functionName}()
        RETURNS trigger AS $$
        BEGIN 
            NOTIFY ${sql(channelName)};
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `;
    await sql`
        CREATE OR REPLACE TRIGGER ${triggerName}
        AFTER INSERT ON ${outboxTable}
        EXECUTE FUNCTION ${functionName}();
    `;

    // start listening on the channel
    this.autoLoadListener = await sql.listen(channelName, () =>
      sql.begin(async (sql) => {
        const outboxCursor: number = this.metaStore.get('outboxCursor') ?? 0;
        this.logger.debug('AutoLoading', this.id, outboxCursor);

        // we are using notify + select to get changes because that gives us at-least-once delivery
        // if we'd send payload through notify we may miss some changes when persister is hibernated

        await sql`
          SELECT * FROM ${outboxTable} 
          WHERE persister_id = ${this.id} AND id > ${outboxCursor}
          ORDER BY id ASC
        `.forEach((row) => {
          // check if this row was already applied in parallel, if so skip it
          if (this.metaStore.get('outboxCursor') >= row.id) return;

          this.metaStore.set('outboxCursor', row.id);
          try {
            this.applyAutoLoadedRow(row as OutboxRow);
          } catch (e) {
            this.logger.error('Error applying auto loaded row', e);
          }
        });
      }),
    );
  }

  private applyAutoLoadedRow(change: OutboxRow) {
    const tableId = Object.entries(this.config.tables).find(
      ([_, tableConfig]) =>
        (tableConfig as TableConfig).postgres.tableName === change.tableName,
    )?.[0] as TableIds;
    if (!tableId) {
      this.logger.error('Table not found', change.tableName);
      return;
    }
    const rowId: string = change.rowId;

    // in autoload we know that records in outbox are ordered, so they never can go back in time
    this.autoLoadLastLogicalTime = Math.max(
      this.autoLoadLastLogicalTime,
      new Date(change.timestamp).getTime(),
    );
    const time = this.getHlc(this.autoLoadLastLogicalTime);

    this.logger.debug('apply auto load', this.autoLoadLastLogicalTime, change);
    const cells = Object.entries(change.payload).reduce(
      (acc, [cellId, value]) => {
        acc[cellId] = [value, time];
        return acc;
      },
      {} as {[cellId: string]: CellStamp},
    );
    const changes: MergeableChanges = [
      [{[tableId]: [{[rowId]: [cells, time]}, time]}, time],
      [{}, time],
      1,
    ];
    this.logger.debug('AutoLoaded', changes);
    this.store.applyMergeableChanges(changes);
  }

  private async updateLastSeenLogicalTimestamp(timestamp: Date) {
    if (!this.config.outboxTable) return;

    const sql = this.sql;
    const {schema, metaTableName} = this.config.outboxTable;
    const outboxMetaTable = sql(`${schema ?? 'public'}.${metaTableName}`);

    try {
      await sql`
      INSERT INTO ${outboxMetaTable} ("persister_id", "last_logical_timestamp") 
      SELECT ${this.id}, MAX("last_logical_timestamp")
      FROM (
        (SELECT "last_logical_timestamp" FROM ${outboxMetaTable} WHERE "persister_id" = ${this.id} LIMIT 1)
        UNION 
        (SELECT ${timestamp.toISOString()})
        ) meta 
        ON CONFLICT ("persister_id") DO UPDATE SET "last_logical_timestamp" = EXCLUDED."last_logical_timestamp"`;
    } catch (error) {
      this.logger.error('Error updating last seen logical timestamp', error);
    }
  }

  // when there are multiple updates before the transaction is committed
  startAutoSave(): this {
    this.logger.info('Starting auto save');
    this.ensureSyncAllowed();
    if (this.autoSaveListener) {
      this.logger.warn('Auto save is already running');
      return this;
    }

    const sql = this.sql;

    this.autoSaveListener = this.store.addDidFinishTransactionListener(
      async (store) => {
        const [, , changedCells, , , , , changedRowIds, , ,] =
          store.getTransactionLog();

        const [tableChanges, valueChanges, isChanges] =
          store.getTransactionMergeableChanges();

        const isFromOutside = Object.values(tableChanges[0]).some(
          ([rows, hlc]) =>
            this.decodeHlc(hlc)[2] !== this.hlcIdHash ||
            Object.values(rows).some(
              ([cells, hlc]) =>
                this.decodeHlc(hlc)[2] !== this.hlcIdHash ||
                Object.values(cells).some(
                  ([, hlc]) => this.decodeHlc(hlc)[2] !== this.hlcIdHash,
                ),
            ),
        );
        if (!isFromOutside) {
          this.logger.debug(
            'AutoSave transaction originates from autoLoad, skipping',
          );
          return;
        }

        const transactionHlc = this.decodeHlc(tableChanges[1]);
        const promises: Promise<unknown>[] = [
          this.updateLastSeenLogicalTimestamp(new Date(transactionHlc[0])),
        ];

        for (const [tableId, config] of Object.entries(this.config.tables)) {
          const {schema, tableName, idColumnName, condition} = (
            config as TableConfig
          ).postgres;
          const table = sql(`${schema ?? 'public'}.${tableName}`);
          const idColumn = sql(idColumnName ?? 'id');

          const rowIdsChanges = changedRowIds[tableId] ?? {};
          const rowsChanges = changedCells[tableId] ?? {};

          // Delete rows
          const idsToDelete = Object.entries(rowIdsChanges)
            .filter(([rowId, op]) => op === -1)
            .map(([rowId]) => rowId);

          if (idsToDelete.length) {
            this.logger.debug('AutoSaving delete', tableId, idsToDelete);
            promises.push(
              sql`DELETE FROM ${table} 
            WHERE 
            ${idColumn} IN ${sql(idsToDelete)} 
            ${condition ? sql`AND ${sql.unsafe(condition.replace('$tableName', tableName))}` : sql``}`,
            );
          }

          // Insert rows
          const idsToInsert = Object.entries(rowIdsChanges)
            .filter(([rowId, op]) => op === 1)
            .map(([rowId]) => rowId);

          const data = idsToInsert
            .map((rowId) => {
              const changes = rowsChanges[rowId];
              if (!changes) {
                this.logger.error(
                  "transaction log reported new row, but it's new values were not found",
                  tableId,
                  rowId,
                );
                return null;
              }

              const cells = Object.fromEntries(
                Object.entries(changes).map(([cellId, [, after]]) => [
                  cellId,
                  after ?? null,
                ]),
              );
              return {...cells, [idColumnName ?? 'id']: rowId};
              // todo automatically update updated_at column from row hlc
            })
            .filter(Boolean);

          if (data.length) {
            const columnNames = Object.keys(data[0] ?? {});

            this.logger.debug('AutoSaving insert', tableId, data);
            promises.push(
              sql`
                INSERT INTO ${table} ${sql(data, ...columnNames)} 
                ON CONFLICT DO NOTHING`,
            );
          }

          // updates
          // we keep insert/updates seperate instead of upserts because we're getting only partial data from transaction log
          for (const [rowId, cellsChanges] of Object.entries(rowsChanges)) {
            if (idsToDelete.includes(rowId) || idsToInsert.includes(rowId)) {
              continue;
            }

            const cells = Object.fromEntries(
              Object.entries(cellsChanges).map(([cellId, [, after]]) => [
                cellId,
                after ?? null,
              ]),
            );

            this.logger.debug('AutoSaving update', tableId, rowId, cells);
            promises.push(
              sql`
                UPDATE ${table} 
                SET ${sql(cells)} 
                WHERE 
                  ${idColumn} = ${rowId}
                  ${condition ? sql`AND ${sql.unsafe(condition.replace('$tableName', tableName))}` : sql``}
              `,
            );
          }

          // todo we should rollback changes of failed promises
          const results = await Promise.allSettled(promises);
          results
            .filter((result) => result.status === 'rejected')
            .forEach(({reason}) =>
              this.logger.error('AutoSave failed', reason),
            );
        }
      },
    );

    return this;
  }

  async stopAutoLoad() {
    this.logger.info('Stopping auto load');
    if (this.autoLoadListener) {
      await this.autoLoadListener.unlisten();
      this.autoLoadListener = undefined;
    }

    // don't remove triggers because they are reused between various persisters
  }

  stopAutoSave(): this {
    this.logger.info('Stopping auto save');
    if (this.autoSaveListener) {
      this.store.delListener(this.autoSaveListener);
      this.autoSaveListener = undefined;
    } else {
      this.logger.warn('Auto save is not running before attempt to stop it');
    }
    return this;
  }

  // add a trigger on all tables to insert into outbox table
  async startOutbox() {
    this.logger.info('Starting outbox');
    this.ensureSyncAllowed();

    await Promise.all(
      this.tableIds.map((tableId) => this.startOutboxOnTable(tableId)),
    );
  }

  async stopOutbox() {
    this.logger.info('Stopping outbox');
    await Promise.all(
      this.tableIds.map((tableId) => this.stopOutboxOnTable(tableId)),
    );
  }

  private async startOutboxOnTable(tableId: TableIds) {
    const sql = this.sql;
    const outbox = this.config.outboxTable!;
    const {schema, tableName, condition, timestampColumnName} =
      this.config.tables[tableId].postgres;

    const table = `"${schema ?? 'public'}"."${tableName}"`;
    const timestampColumn = `${timestampColumnName ?? 'updated_at'}`;
    const outboxTable = `"${outbox.schema ?? 'public'}"."${outbox.tableName}"`;
    const outboxMetaTable = `"${outbox.schema ?? 'public'}"."${outbox.metaTableName}"`;
    // trigger and function names must contain persister id so we can safely clean them up even if there are multiple persisters on same table
    const triggerName = `"${tableName}_${this.id}_trigger"`;
    const functionName = `"${schema ?? 'public'}"."${tableName}_${this.id}_function"`;

    this.logger.debug('Creating outbox function & trigger');
    // this is marked as unsafe because I haven't figured out how to make the unsafe condition work within safe query
    await sql.unsafe(`
        CREATE OR REPLACE FUNCTION ${functionName}()
        RETURNS TRIGGER AS $$
        DECLARE
          logical_time timestamp;
          payload jsonb;
        BEGIN
            IF (${condition ? condition.replace('$tableName', 'NEW') : 'TRUE'}) OR (${condition ? condition.replace('$tableName', 'OLD') : 'TRUE'}) THEN
                SELECT COALESCE((to_jsonb(NEW)->>'${timestampColumn}')::timestamp, MAX("last_logical_timestamp"))
                INTO logical_time
                FROM (
                  (SELECT "last_logical_timestamp" FROM ${outboxMetaTable} WHERE persister_id = '${this.id}' LIMIT 1)
                UNION 
                  (SELECT NOW())
                ) meta;
            
                SELECT jsonb_object_agg(COALESCE(o.key, n.key), n.value)
                INTO payload
                FROM 
                  jsonb_each(to_jsonb(OLD)) o
                FULL OUTER JOIN 
                  jsonb_each(to_jsonb(NEW)) n
                ON n.key = o.key
                WHERE 
                  n.value::text IS DISTINCT FROM o.value::text;

                IF payload IS NOT NULL THEN
                  INSERT INTO ${outboxTable} (row_id, table_name, timestamp, payload, persister_id)
                  VALUES (COALESCE(OLD.id, NEW.id), '${tableName}', logical_time, payload, '${this.id}');
                END IF;
                
            END IF;

            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE TRIGGER ${triggerName}
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION ${functionName}();
    `);

    this.logger.debug('Outbox function & trigger created');
  }

  private async stopOutboxOnTable(tableId: TableIds) {
    const sql = this.sql;
    const {schema, tableName} = this.config.tables[tableId].postgres;
    const table = sql`${sql(schema ?? 'public')}.${sql(tableName)}`;
    const triggerName = sql`${sql(schema ?? 'public')}.${tableName}_${this.id}_trigger`;
    const functionName = sql`${sql(schema ?? 'public')}.${tableName}_${this.id}_function`;

    await sql`
        DROP TRIGGER IF EXISTS ${triggerName} ON ${table};
        DROP FUNCTION IF EXISTS ${functionName}();
      `;
  }

  // method to stop all auto load and save and outbox
  // it should not be called before hibernation or if there is intent to continue sync later
  // basically it should be called only when tinybase store is destroyed
  async cleanup() {
    await Promise.all([
      this.stopOutbox(),
      this.stopAutoLoad(),
      this.stopAutoSave(),
    ]);
  }
}
