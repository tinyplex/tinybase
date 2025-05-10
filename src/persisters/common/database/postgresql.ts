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
import {TINYBASE, TRUE, strMatch} from '../../../common/strings.ts';
import {
  CREATE,
  CREATE_TABLE,
  FUNCTION,
  OR_REPLACE,
  SELECT,
  TABLE_NAME_PLACEHOLDER,
  WHERE,
  escapeId,
  escapeIds,
  getPlaceholders,
  getWrappedCommand,
} from './common.ts';
import {getConfigStructures} from './config.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';

const TABLE_CREATED = 'c';
const DATA_CHANGED = 'd';
const EVENT_REGEX = /^([cd]:)(.+)/;

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
  const persisterId = getUniqueId(5).replace(/-/g, '_').toLowerCase();
  const persisterChannel = TINYBASE + '_' + persisterId;

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );

  const createFunction = async (
    name: string,
    body: string,
    returnPrefix = '',
    declarations = '',
  ) => {
    const escapedFunctionName = escapeIds(TINYBASE, name, persisterId);
    await executeCommand(
      CREATE +
        OR_REPLACE +
        FUNCTION +
        escapedFunctionName +
        `()RETURNS ${returnPrefix}trigger ` +
        `AS $$ ${declarations}BEGIN ${body}END;$$ LANGUAGE plpgsql;`,
    );
    return escapedFunctionName;
  };

  const createTrigger = async (
    prefix: string,
    escapedName: string,
    body: string,
    escapedFunctionName: string,
  ) =>
    await executeCommand(
      CREATE +
        prefix +
        'TRIGGER' +
        escapedName +
        body +
        'EXECUTE ' +
        FUNCTION +
        escapedFunctionName +
        `()`,
    );

  const notifySql = (message: string) =>
    `PERFORM pg_notify('${persisterChannel}',${message});`;

  const getWhenCondition = (
    tableName: string,
    newOrOldOrBoth: 0 | 1 | 2,
  ): string => {
    const tablesLoadConfig = defaultedConfig[0];
    if (!tablesLoadConfig || typeof tablesLoadConfig === 'string') {
      return TRUE;
    }

    const [, , condition] = tablesLoadConfig.get(tableName) ?? [];
    if (!condition) {
      return TRUE;
    }

    if (newOrOldOrBoth === 2) {
      return (
        getWhenCondition(tableName, 0) + ' OR ' + getWhenCondition(tableName, 1)
      );
    }
    return condition.replace(
      TABLE_NAME_PLACEHOLDER,
      newOrOldOrBoth == 0 ? 'NEW' : 'OLD',
    );
  };

  const addDataChangedTriggers = async (
    tableName: string,
    dataChangedFunction: string,
  ) =>
    await promiseAll(
      arrayMap(
        ['INSERT', 'DELETE', 'UPDATE'],
        async (operation, newOrOldOrBoth) =>
          await createTrigger(
            OR_REPLACE,
            escapeIds(
              TINYBASE,
              DATA_CHANGED,
              persisterId,
              tableName,
              operation,
            ),
            // eslint-disable-next-line max-len
            `AFTER ${operation} ON${escapeId(tableName)}FOR EACH ROW WHEN(${getWhenCondition(
              tableName,
              newOrOldOrBoth as 0 | 1 | 2,
            )})`,
            dataChangedFunction,
          ),
      ),
    );

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<ListenerHandle> => {
    const tableCreatedFunction = await createFunction(
      TABLE_CREATED,
      // eslint-disable-next-line max-len
      `FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()${WHERE} command_tag='${CREATE_TABLE}' LOOP ${notifySql(`'c:'||SPLIT_PART(row.object_identity,'.',2)`)}END LOOP;`,
      'event_',
      'DECLARE row record;',
    );
    try {
      await createTrigger(
        'EVENT ',
        escapeIds(TINYBASE, TABLE_CREATED, persisterId),
        `ON ddl_command_end WHEN TAG IN('${CREATE_TABLE}')`,
        tableCreatedFunction,
      );
    } catch {}

    const dataChangedFunction = await createFunction(
      DATA_CHANGED,
      notifySql(`'d:'||TG_TABLE_NAME`) + `RETURN NULL;`,
    );
    await promiseAll(
      arrayMap(collValues(managedTableNamesSet), async (tableName) => {
        await executeCommand(
          CREATE_TABLE +
            ` IF NOT EXISTS ${escapeId(tableName)}("_id"text PRIMARY KEY)`,
        );
        await addDataChangedTriggers(tableName, dataChangedFunction);
      }),
    );

    return await addChangeListener(
      persisterChannel,
      async (prefixAndTableName) =>
        await ifNotUndefined(
          strMatch(prefixAndTableName, EVENT_REGEX),
          async ([, eventType, tableName]) => {
            if (collHas(managedTableNamesSet, tableName)) {
              if (eventType == 'c:') {
                await addDataChangedTriggers(tableName, dataChangedFunction);
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
