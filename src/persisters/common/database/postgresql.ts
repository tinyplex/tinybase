import {
  Cmd,
  SELECT,
  WHERE,
  escapeId,
  getPlaceholders,
  getWrappedCommand,
} from './common.ts';
import type {
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {TINYBASE, strMatch} from '../../../common/strings.ts';
import {collHas, collValues} from '../../../common/coll.ts';
import {ifNotUndefined, promiseAll} from '../../../common/other.ts';
import {arrayMap} from '../../../common/array.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';
import {getConfigStructures} from './config.ts';

export type NotifyListener = (tableName: string) => void;

const EVENT_CHANNEL = TINYBASE;
const EVENT_REGEX = /^([cd]:)(.+)/;

const CHANGE_DATA_TRIGGER = TINYBASE + '_data';
const CREATE_TABLE_TRIGGER = TINYBASE + '_table';

export const createPostgreSqlPersister = <
  NotifyListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  rawCmd: Cmd,
  addNotifyListener: (
    channel: string,
    listener: NotifyListener,
  ) => Promise<NotifyListeningHandle>,
  delNotifyListener: (updateListeningHandle: NotifyListeningHandle) => void,
  onSqlCommand: ((sql: string, args?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
): Persister<Persist> => {
  const cmd = getWrappedCommand(rawCmd, onSqlCommand);

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );

  const addDataTrigger = async (tableName: string) => {
    await cmd(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE TRIGGER ${escapeId(CHANGE_DATA_TRIGGER + '_' + tableName)} AFTER INSERT OR UPDATE OR DELETE ON ${escapeId(tableName)} EXECUTE FUNCTION ${CHANGE_DATA_TRIGGER}()`,
    );
  };

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<NotifyListeningHandle> => {
    await cmd(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE FUNCTION ${CREATE_TABLE_TRIGGER}()RETURNS event_trigger AS $t2$ DECLARE row record; BEGIN FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()WHERE command_tag='CREATE TABLE' LOOP PERFORM pg_notify('${EVENT_CHANNEL}','c:'||SPLIT_PART(row.object_identity,'.',2));END LOOP;END;$t2$ LANGUAGE plpgsql;`,
    );

    try {
      await cmd(
        // eslint-disable-next-line max-len
        `CREATE EVENT TRIGGER ${CREATE_TABLE_TRIGGER} ON ddl_command_end WHEN TAG IN('CREATE TABLE')EXECUTE FUNCTION ${CREATE_TABLE_TRIGGER}();`,
      );
    } catch {}

    await cmd(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE FUNCTION ${CHANGE_DATA_TRIGGER}()RETURNS trigger AS $t1$ BEGIN PERFORM pg_notify('${EVENT_CHANNEL}','d:'||TG_TABLE_NAME);RETURN NULL;END;$t1$ LANGUAGE plpgsql;`,
    );
    await promiseAll(
      arrayMap(collValues(managedTableNamesSet), async (tableName) => {
        await cmd(
          // eslint-disable-next-line max-len
          `CREATE TABLE IF NOT EXISTS ${escapeId(tableName)}("_id"text PRIMARY KEY)`,
        );
        await addDataTrigger(tableName);
      }),
    );

    return await addNotifyListener(
      EVENT_CHANNEL,
      async (prefixAndTableName) =>
        await ifNotUndefined(
          strMatch(prefixAndTableName, EVENT_REGEX),
          async ([, eventType, tableName]) => {
            if (collHas(managedTableNamesSet, tableName)) {
              if (eventType == 'c:') {
                await addDataTrigger(tableName);
              }
              listener();
            }
          },
        ),
    );
  };

  const delPersisterListener = delNotifyListener;

  return (isJson ? createJsonPersister : createTabularPersister)(
    store,
    cmd,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    destroy,
    persist,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
    async (cmd: Cmd, managedTableNames: string[]): Promise<any[]> =>
      await cmd(
        // eslint-disable-next-line max-len
        `${SELECT} table_name tn,column_name cn FROM information_schema.columns ${WHERE} table_schema='public'AND table_name IN(${getPlaceholders(managedTableNames)})`,
        managedTableNames,
      ),
    thing,
    getThing,
  );
};
