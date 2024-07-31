import type {ListenMeta, Sql} from 'postgres';
import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import {
  UpdateListener,
  createPgPersister,
} from '../common/database/postgres/create.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {TINYBASE} from '../../common/strings.ts';
import {arrayMap} from '../../common/array.ts';
import {collValues} from '../../common/coll.ts';
import {promiseAll} from '../../common/other.ts';

const TRIGGER = TINYBASE;

export const createPostgresPersister = (async (
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<PostgresPersister> => {
  const cmdSql = await sql.reserve?.();
  return createPgPersister(
    store,
    configOrStoreTableName,
    cmdSql?.unsafe,
    async (
      listener: UpdateListener,
      managedTableNamesSet: Set<string>,
    ): Promise<ListenMeta> => {
      const listen = await sql.listen(TRIGGER, (value: string) =>
        listener?.(value),
      );
      // eslint-disable-next-line max-len
      await sql`CREATE OR REPLACE FUNCTION ${sql(TRIGGER)}()RETURNS trigger AS $t$ BEGIN PERFORM pg_notify('${sql.unsafe(TRIGGER)}',TG_TABLE_NAME);RETURN NULL;END;$t$ LANGUAGE plpgsql;`;
      await promiseAll(
        arrayMap(collValues(managedTableNamesSet), async (tableName) => {
          // eslint-disable-next-line max-len
          await sql`CREATE TABLE IF NOT EXISTS ${sql(tableName)}("_id"text PRIMARY KEY)`;
          // eslint-disable-next-line max-len
          await sql`CREATE OR REPLACE TRIGGER ${sql(TRIGGER + tableName)} AFTER INSERT OR UPDATE OR DELETE ON ${sql(tableName)} EXECUTE FUNCTION ${sql(TRIGGER)}()`;
        }),
      );
      return listen;
    },
    (listen: ListenMeta) => listen.unlisten().catch(() => 0),
    onSqlCommand,
    onIgnoredError,
    () => cmdSql?.release?.(),
    3, // StoreOrMergeableStore,
    sql,
    'getSql',
  ) as PostgresPersister;
}) as typeof createPostgresPersisterDecl;
