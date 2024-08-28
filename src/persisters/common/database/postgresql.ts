import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {
  SELECT,
  WHERE,
  escapeId,
  getPlaceholders,
  getWrappedCommand,
} from './common.ts';
import {TINYBASE, strMatch} from '../../../common/strings.ts';
import {collHas, collValues} from '../../../common/coll.ts';
import {ifNotUndefined, promiseAll} from '../../../common/other.ts';
import {jsonParse, jsonString} from '../../../common/json.ts';
import {arrayMap} from '../../../common/array.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';
import {getConfigStructures} from './config.ts';

const EVENT_CHANNEL = TINYBASE;
const EVENT_REGEX = /^([cd]:)(.+)/;

const CHANGE_DATA_TRIGGER = TINYBASE + '_data';
const CREATE_TABLE_TRIGGER = TINYBASE + '_table';

export const createCustomPostgreSqlPersister = <
  ListenerHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  rawExecuteCommand: DatabaseExecuteCommand,
  addChangeListener: (
    channel: string,
    listener: DatabaseChangeListener,
  ) => Promise<ListenerHandle>,
  delChangeListener: (listenerHandle: ListenerHandle) => void,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
): Persister<Persist> => {
  const executeCommand = getWrappedCommand(rawExecuteCommand, onSqlCommand);

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );

  const addDataTrigger = async (tableName: string) => {
    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE TRIGGER ${escapeId(CHANGE_DATA_TRIGGER + '_' + tableName)} AFTER INSERT OR UPDATE OR DELETE ON ${escapeId(tableName)} EXECUTE FUNCTION ${CHANGE_DATA_TRIGGER}()`,
    );
  };

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<ListenerHandle> => {
    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE FUNCTION ${CREATE_TABLE_TRIGGER}()RETURNS event_trigger AS $t2$ DECLARE row record; BEGIN FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()WHERE command_tag='CREATE TABLE' LOOP PERFORM pg_notify('${EVENT_CHANNEL}','c:'||SPLIT_PART(row.object_identity,'.',2));END LOOP;END;$t2$ LANGUAGE plpgsql;`,
    );

    try {
      await executeCommand(
        // eslint-disable-next-line max-len
        `CREATE EVENT TRIGGER ${CREATE_TABLE_TRIGGER} ON ddl_command_end WHEN TAG IN('CREATE TABLE')EXECUTE FUNCTION ${CREATE_TABLE_TRIGGER}();`,
      );
    } catch {}

    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE FUNCTION ${CHANGE_DATA_TRIGGER}()RETURNS trigger AS $t1$ BEGIN PERFORM pg_notify('${EVENT_CHANNEL}','d:'||TG_TABLE_NAME);RETURN NULL;END;$t1$ LANGUAGE plpgsql;`,
    );
    await promiseAll(
      arrayMap(collValues(managedTableNamesSet), async (tableName) => {
        await executeCommand(
          // eslint-disable-next-line max-len
          `CREATE TABLE IF NOT EXISTS ${escapeId(tableName)}("_id"text PRIMARY KEY)`,
        );
        await addDataTrigger(tableName);
      }),
    );

    return await addChangeListener(
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

  const delPersisterListener = delChangeListener;

  return (isJson ? createJsonPersister : createTabularPersister)(
    store,
    executeCommand,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    destroy,
    persist,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
    async (
      executeCommand: DatabaseExecuteCommand,
      managedTableNames: string[],
    ): Promise<any[]> =>
      await executeCommand(
        // eslint-disable-next-line max-len
        `${SELECT} table_name tn,column_name cn FROM information_schema.columns ${WHERE} table_schema='public'AND table_name IN(${getPlaceholders(managedTableNames)})`,
        managedTableNames,
      ),
    thing,
    getThing,
    'text',
    0,
    (cellOrValue) => jsonString(cellOrValue),
    (field) => jsonParse(field as string),
  );
};
