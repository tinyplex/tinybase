import type {ListenMeta, Sql} from 'postgres';
import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import {UpdateListener, createPgPersister} from '../common/pg/create.ts';
import {collForEach, collValues} from '../../common/coll.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {TINYBASE} from '../../common/strings.ts';
import {arrayMap} from '../../common/array.ts';
import {promiseAll} from '../../common/other.ts';

type TablesAndListener = [Set<string>, listener: ListenMeta];

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
    ): Promise<TablesAndListener> => {
      const listenerSql = await sql.listen(TINYBASE, (value: string) =>
        listener?.(value),
      );
      // eslint-disable-next-line max-len
      await sql`CREATE OR REPLACE FUNCTION ${sql(TINYBASE)}()RETURNS trigger AS $t$ BEGIN PERFORM pg_notify(${sql(TINYBASE)},TG_TABLE_NAME);END;$t$ LANGUAGE plpgsql;`;
      await promiseAll(
        arrayMap(collValues(managedTableNamesSet), async (tableName) => {
          // eslint-disable-next-line max-len
          await sql`CREATE OR REPLACE TRIGGER ${sql(TINYBASE + tableName)} AFTER INSERT OR UPDATE OR DELETE ON ${sql(tableName)} EXECUTE FUNCTION ${sql(TINYBASE)}()`;
          return TINYBASE + tableName;
        }),
      );
      return [managedTableNamesSet, listenerSql];
    },
    async ([managedTableNamesSet, listenerConnection]: TablesAndListener) => {
      listenerConnection.unlisten();
      collForEach(
        managedTableNamesSet,
        (tableName) => sql`DROP TRIGGER ${sql(TINYBASE + tableName)}`,
      );
    },
    onSqlCommand,
    onIgnoredError,
    cmdSql?.release,
    3, // StoreOrMergeableStore,
    sql,
    'getSql',
  ) as PostgresPersister;
}) as typeof createPostgresPersisterDecl;
