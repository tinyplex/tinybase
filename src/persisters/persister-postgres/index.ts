import type {ListenMeta, Sql} from 'postgres';
import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import {
  UpdateListener,
  createPostgresqlPersister,
} from '../common/database/postgresql.ts';
import {arrayForEach, arrayMap} from '../../common/array.ts';
import {collHas, collValues} from '../../common/coll.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {TINYBASE} from '../../common/strings.ts';
import {promiseAll} from '../../common/other.ts';

const DATA_TRIGGER = TINYBASE + '_data';
const TABLE_TRIGGER = TINYBASE + '_table';

export const createPostgresPersister = (async (
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister> => {
  const cmdSql = await sql.reserve?.();

  const addDataTrigger = async (tableName: string) => {
    // eslint-disable-next-line max-len
    await sql`CREATE OR REPLACE TRIGGER ${sql(DATA_TRIGGER + '_' + tableName)} AFTER INSERT OR UPDATE OR DELETE ON ${sql(tableName)} EXECUTE FUNCTION ${sql(DATA_TRIGGER)}()`;
  };

  return createPostgresqlPersister(
    store,
    configOrStoreTableName,
    cmdSql?.unsafe,
    async (
      listener: UpdateListener,
      managedTableNamesSet: Set<string>,
    ): Promise<[ListenMeta, ListenMeta]> => {
      // eslint-disable-next-line max-len
      await sql`CREATE OR REPLACE FUNCTION ${sql(TABLE_TRIGGER)}()RETURNS event_trigger AS $t2$ DECLARE row record; BEGIN FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()WHERE command_tag='CREATE TABLE' LOOP PERFORM pg_notify('${sql.unsafe(TABLE_TRIGGER)}',SPLIT_PART(row.object_identity,'.',2));END LOOP;END;$t2$ LANGUAGE plpgsql;`;
      try {
        // eslint-disable-next-line max-len
        await sql`CREATE EVENT TRIGGER ${sql(TABLE_TRIGGER)} ON ddl_command_end WHEN TAG IN('CREATE TABLE')EXECUTE FUNCTION ${sql(TABLE_TRIGGER)}();`;
      } catch {}

      // eslint-disable-next-line max-len
      await sql`CREATE OR REPLACE FUNCTION ${sql(DATA_TRIGGER)}()RETURNS trigger AS $t1$ BEGIN PERFORM pg_notify('${sql.unsafe(DATA_TRIGGER)}',TG_TABLE_NAME);RETURN NULL;END;$t1$ LANGUAGE plpgsql;`;
      await promiseAll(
        arrayMap(collValues(managedTableNamesSet), async (tableName) => {
          // eslint-disable-next-line max-len
          await sql`CREATE TABLE IF NOT EXISTS ${sql(tableName)}("_id"text PRIMARY KEY)`;
          await addDataTrigger(tableName);
        }),
      );

      return [
        await sql.listen(TABLE_TRIGGER, async (tableName) => {
          if (collHas(managedTableNamesSet, tableName)) {
            await addDataTrigger(tableName);
            listener?.(tableName);
          }
        }),
        await sql.listen(DATA_TRIGGER, listener),
      ];
    },
    (listeners: [ListenMeta, ListenMeta]) =>
      arrayForEach(listeners, (listener) => listener.unlisten().catch(() => 0)),
    onSqlCommand,
    onIgnoredError,
    () => cmdSql?.release?.(),
    3, // StoreOrMergeableStore,
    sql,

    'getSql',
  ) as PostgresPersister;
}) as typeof createPostgresPersisterDecl;
