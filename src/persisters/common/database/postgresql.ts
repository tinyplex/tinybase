import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {arrayJoin, arrayMap} from '../../../common/array.ts';
import {collHas, collValues} from '../../../common/coll.ts';
import {getHash} from '../../../common/hash.ts';
import {
  jsonParse,
  jsonString,
  jsonStringWithUndefined,
} from '../../../common/json.ts';
import {mapGet} from '../../../common/map.ts';
import {ifNotUndefined, promiseAll} from '../../../common/other.ts';
import {
  EMPTY_STRING,
  TINYBASE,
  TRUE,
  strMatch,
  strReplace,
} from '../../../common/strings.ts';
import {
  CREATE,
  CREATE_TABLE,
  DELETE,
  FUNCTION,
  INSERT,
  OR_REPLACE,
  SELECT,
  TABLE_NAME_PLACEHOLDER,
  UPDATE,
  WHERE,
  escapeId,
  escapeIds,
  getPlaceholders,
  getWrappedCommand,
} from './common.ts';
import {DefaultedTabularConfig, getConfigStructures} from './config.ts';
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
  delChangeListener: (listenerHandle: ListenerHandle) => Promise<void>,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
): Persister<Persist> => {
  type Handles = [listenerHandle: ListenerHandle, functionNames: string[]];

  const executeCommand = getWrappedCommand(rawExecuteCommand, onSqlCommand);

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );
  const configHash =
    EMPTY_STRING + getHash(jsonStringWithUndefined(defaultedConfig));
  const channel = TINYBASE + '_' + configHash;

  const createFunction = async (
    name: string,
    body: string,
    returnPrefix = '',
    declarations = '',
  ): Promise<string> => {
    const escapedFunctionName = escapeIds(TINYBASE, name, configHash);
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
    escapedTriggerName: string,
    body: string,
    escapedFunctionName: string,
  ): Promise<string> => {
    await executeCommand(
      CREATE +
        prefix +
        'TRIGGER' +
        escapedTriggerName +
        body +
        'EXECUTE ' +
        FUNCTION +
        escapedFunctionName +
        `()`,
    );
    return escapedTriggerName;
  };

  const notify = (message: string) =>
    `PERFORM pg_notify('${channel}',${message});`;

  const when = (tableName: string, newOrOldOrBoth: 0 | 1 | 2): string =>
    isJson
      ? TRUE
      : newOrOldOrBoth === 2
        ? when(tableName, 0) + ' OR ' + when(tableName, 1)
        : strReplace(
            mapGet(
              (defaultedConfig as DefaultedTabularConfig)[0],
              tableName,
            )?.[2] ?? TRUE,
            TABLE_NAME_PLACEHOLDER,
            newOrOldOrBoth == 0 ? 'NEW' : 'OLD',
          );

  const addDataChangedTriggers = (
    tableName: string,
    dataChangedFunction: string,
  ) =>
    promiseAll(
      arrayMap([INSERT, DELETE, UPDATE], (action, newOrOldOrBoth) =>
        createTrigger(
          OR_REPLACE,
          escapeIds(TINYBASE, DATA_CHANGED, configHash, tableName, action),
          `AFTER ${action} ON${escapeId(tableName)}FOR EACH ROW WHEN(${when(
            tableName,
            newOrOldOrBoth as 0 | 1 | 2,
          )})`,
          dataChangedFunction,
        ),
      ),
    );

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<Handles> => {
    const tableCreatedFunctionName = await createFunction(
      TABLE_CREATED,
      // eslint-disable-next-line max-len
      `FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()${WHERE} command_tag='${CREATE_TABLE}' LOOP ${notify(`'c:'||SPLIT_PART(row.object_identity,'.',2)`)}END LOOP;`,
      'event_',
      'DECLARE row record;',
    );

    await createTrigger(
      'EVENT ',
      escapeIds(TINYBASE, TABLE_CREATED, configHash),
      `ON ddl_command_end WHEN TAG IN('${CREATE_TABLE}')`,
      tableCreatedFunctionName,
    );

    const dataChangedFunctionName = await createFunction(
      DATA_CHANGED,
      notify(`'d:'||TG_TABLE_NAME`) + `RETURN NULL;`,
    );

    await promiseAll(
      arrayMap(collValues(managedTableNamesSet), async (tableName) => {
        await executeCommand(
          CREATE_TABLE +
            ` IF NOT EXISTS${escapeId(tableName)}("_id"text PRIMARY KEY)`,
        );
        return await addDataChangedTriggers(tableName, dataChangedFunctionName);
      }),
    );

    const listenerHandle = await addChangeListener(
      channel,
      (prefixAndTableName) =>
        ifNotUndefined(
          strMatch(prefixAndTableName, EVENT_REGEX),
          async ([, eventType, tableName]) => {
            if (collHas(managedTableNamesSet, tableName)) {
              if (eventType == 'c:') {
                await addDataChangedTriggers(
                  tableName,
                  dataChangedFunctionName,
                );
              }
              listener();
            }
          },
        ),
    );

    return [
      listenerHandle,
      [tableCreatedFunctionName, dataChangedFunctionName],
    ];
  };

  const delPersisterListener = async ([
    listenerHandle,
    functionNames,
  ]: Handles) => {
    delChangeListener(listenerHandle);
    await executeCommand(
      `DROP FUNCTION IF EXISTS${arrayJoin(functionNames, ',')}CASCADE`,
    );
  };

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
        SELECT +
          // eslint-disable-next-line max-len
          ` table_name tn,column_name cn FROM information_schema.columns ${WHERE} table_schema='public'AND table_name IN(${getPlaceholders(managedTableNames)})`,
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
