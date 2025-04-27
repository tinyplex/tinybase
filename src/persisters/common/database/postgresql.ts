import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {arrayMap} from '../../../common/array.ts';
import {collHas, collValues} from '../../../common/coll.ts';
import {getUniqueId} from '../../../common/index.ts';
import {jsonParse, jsonString} from '../../../common/json.ts';
import {ifNotUndefined, promiseAll} from '../../../common/other.ts';
import {TINYBASE, strMatch} from '../../../common/strings.ts';
import {
  SELECT,
  TABLE_NAME_PLACEHOLDER,
  WHERE,
  escapeId,
  getPlaceholders,
  getWrappedCommand,
} from './common.ts';
import {getConfigStructures} from './config.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';

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
  const persisterId = getUniqueId(5);

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );

  const getWhenCondition = (tableName: string, newOrOld: 'NEW' | 'OLD') => {
    const tablesLoadConfig = defaultedConfig[0];
    if(!tablesLoadConfig || typeof tablesLoadConfig === 'string') return 'true';

    const [,,condition] = tablesLoadConfig.get(tableName) ?? [];
    if(!condition) return 'true';

    return condition.replace(TABLE_NAME_PLACEHOLDER, newOrOld);
  };

  const addDataTriggers = async (tableName: string) => {
    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE TRIGGER ${escapeId(CHANGE_DATA_TRIGGER + '_insert_' + persisterId + '_' + tableName)} AFTER INSERT ON ${escapeId(tableName)} FOR EACH ROW WHEN (${getWhenCondition(tableName, 'NEW')}) EXECUTE FUNCTION ${escapeId(CHANGE_DATA_TRIGGER + '_' + persisterId)}()`,
    );
    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE TRIGGER ${escapeId(CHANGE_DATA_TRIGGER + '_update_' + persisterId + '_' + tableName)} AFTER UPDATE ON ${escapeId(tableName)} FOR EACH ROW WHEN ((${getWhenCondition(tableName, 'NEW')}) OR (${getWhenCondition(tableName, 'OLD')})) EXECUTE FUNCTION ${escapeId(CHANGE_DATA_TRIGGER + '_' + persisterId)}()`,
    );
    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE TRIGGER ${escapeId(CHANGE_DATA_TRIGGER + '_delete_' + persisterId + '_' + tableName)} AFTER DELETE ON ${escapeId(tableName)} FOR EACH ROW WHEN (${getWhenCondition(tableName, 'OLD')}) EXECUTE FUNCTION ${escapeId(CHANGE_DATA_TRIGGER + '_' + persisterId)}()`,
    );
  };

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<ListenerHandle> => {
    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE FUNCTION ${escapeId(CREATE_TABLE_TRIGGER + '_' + persisterId)}()RETURNS event_trigger AS $t2$ DECLARE row record; BEGIN FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()WHERE command_tag='CREATE TABLE' LOOP PERFORM pg_notify('${EVENT_CHANNEL + '_' + persisterId}','c:'||SPLIT_PART(row.object_identity,'.',2));END LOOP;END;$t2$ LANGUAGE plpgsql;`,
    );

    try {
      await executeCommand(
        // eslint-disable-next-line max-len
        `CREATE EVENT TRIGGER ${escapeId(CREATE_TABLE_TRIGGER + '_' + persisterId)} ON ddl_command_end WHEN TAG IN('CREATE TABLE')EXECUTE FUNCTION ${escapeId(CREATE_TABLE_TRIGGER + '_' + persisterId)}();`,
      );
    } catch {}

    await executeCommand(
      // eslint-disable-next-line max-len
      `CREATE OR REPLACE FUNCTION ${escapeId(CHANGE_DATA_TRIGGER + '_' + persisterId)}()RETURNS trigger AS $t1$ BEGIN PERFORM pg_notify('${EVENT_CHANNEL + '_' + persisterId}','d:'||TG_TABLE_NAME);RETURN NULL;END;$t1$ LANGUAGE plpgsql;`,
    );
    await promiseAll(
      arrayMap(collValues(managedTableNamesSet), async (tableName) => {
        await executeCommand(
          // eslint-disable-next-line max-len
          `CREATE TABLE IF NOT EXISTS ${escapeId(tableName)}("_id"text PRIMARY KEY)`,
        );
        await addDataTriggers(tableName);
      }),
    );

    return await addChangeListener(
      EVENT_CHANNEL + '_' + persisterId,
      async (prefixAndTableName) =>
        await ifNotUndefined(
          strMatch(prefixAndTableName, EVENT_REGEX),
          async ([, eventType, tableName]) => {
            if (collHas(managedTableNamesSet, tableName)) {
              if (eventType == 'c:') {
                await addDataTriggers(tableName);
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
    undefined,
    (cellOrValue) => jsonString(cellOrValue),
    (field) => jsonParse(field as string),
  );
};
