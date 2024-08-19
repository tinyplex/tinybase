import type {ListenMeta, Sql} from 'postgres';
import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import {TINYBASE, strMatch} from '../../common/strings.ts';
import {
  UpdateListener,
  createPostgresqlPersister,
} from '../common/database/postgresql.ts';
import {collHas, collValues} from '../../common/coll.ts';
import {ifNotUndefined, promiseAll} from '../../common/other.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {arrayMap} from '../../common/array.ts';

const EVENT_CHANNEL = TINYBASE;
const EVENT_REGEX = /^([cd]:)(.+)/;

const CHANGE_DATA_TRIGGER = TINYBASE + '_data';
const CREATE_TABLE_TRIGGER = TINYBASE + '_table';

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
    await sql`CREATE OR REPLACE TRIGGER ${sql(CHANGE_DATA_TRIGGER + '_' + tableName)} AFTER INSERT OR UPDATE OR DELETE ON ${sql(tableName)} EXECUTE FUNCTION ${sql(CHANGE_DATA_TRIGGER)}()`;
  };

  return createPostgresqlPersister(
    store,
    configOrStoreTableName,
    cmdSql?.unsafe,
    async (
      listener: UpdateListener,
      managedTableNamesSet: Set<string>,
    ): Promise<ListenMeta> => {
      // eslint-disable-next-line max-len
      await sql`CREATE OR REPLACE FUNCTION ${sql(CREATE_TABLE_TRIGGER)}()RETURNS event_trigger AS $t2$ DECLARE row record; BEGIN FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()WHERE command_tag='CREATE TABLE' LOOP PERFORM pg_notify('${sql.unsafe(EVENT_CHANNEL)}','c:'+SPLIT_PART(row.object_identity,'.',2));END LOOP;END;$t2$ LANGUAGE plpgsql;`;

      // eslint-disable-next-line max-len
      await sql`CREATE EVENT TRIGGER ${sql(CREATE_TABLE_TRIGGER)} ON ddl_command_end WHEN TAG IN('CREATE TABLE')EXECUTE FUNCTION ${sql(CREATE_TABLE_TRIGGER)}();`.catch(
        onIgnoredError,
      );

      // eslint-disable-next-line max-len
      await sql`CREATE OR REPLACE FUNCTION ${sql(CHANGE_DATA_TRIGGER)}()RETURNS trigger AS $t1$ BEGIN PERFORM pg_notify('${sql.unsafe(EVENT_CHANNEL)}','d:'+TG_TABLE_NAME);RETURN NULL;END;$t1$ LANGUAGE plpgsql;`;
      await promiseAll(
        arrayMap(collValues(managedTableNamesSet), async (tableName) => {
          // eslint-disable-next-line max-len
          await sql`CREATE TABLE IF NOT EXISTS ${sql(tableName)}("_id"text PRIMARY KEY)`;
          await addDataTrigger(tableName);
        }),
      );

      return await sql.listen(
        EVENT_CHANNEL,
        async (prefixAndTableName) =>
          await ifNotUndefined(
            strMatch(prefixAndTableName, EVENT_REGEX),
            async ([, eventType, tableName]) => {
              if (
                eventType == 'c:' &&
                collHas(managedTableNamesSet, tableName)
              ) {
                await addDataTrigger(tableName);
              }
              listener?.(tableName);
            },
          ),
      );
    },
    (eventListener: ListenMeta) =>
      eventListener.unlisten().catch(onIgnoredError),
    onSqlCommand,
    onIgnoredError,
    () => cmdSql?.release?.(),
    3, // StoreOrMergeableStore,
    sql,

    'getSql',
  ) as PostgresPersister;
}) as typeof createPostgresPersisterDecl;
