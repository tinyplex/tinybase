import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {arrayJoin, arrayMap, arrayPush} from '../../../common/array.ts';
import {collHas, collIsEmpty, collValues} from '../../../common/coll.ts';
import {
  ERROR_STORE_TYPE,
  errorThrow,
  tryCatch,
  tryCatchIgnore,
  tryFinallyAsync,
} from '../../../common/error.ts';
import {getHash} from '../../../common/hash.ts';
import {
  jsonParse,
  jsonString,
  jsonStringWithUndefined,
} from '../../../common/json.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../../common/map.ts';
import {ifNotUndefined, isEmpty, promiseAll} from '../../../common/other.ts';
import {
  EMPTY_STRING,
  TINYBASE,
  TRUE,
  strMatch,
} from '../../../common/strings.ts';
import {
  CREATE,
  CREATE_TABLE,
  DELETE,
  FUNCTION,
  INSERT,
  OR_REPLACE,
  SELECT,
  UPDATE,
  WHERE,
  escapeId,
  escapeIds,
  getPlaceholders,
  getWrappedCommand,
  replaceTableName,
} from './common.ts';
import {DefaultedTabularConfig, getConfigStructures} from './config.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';

const TABLE_CREATED = 'c';
const DATA_CHANGED = 'd';
const EVENT_REGEX = /^([cd]:)(.+)/;

type ListenerResources = [
  references: number,
  ready: Promise<void> | undefined,
  functionNames: string[],
  dataChangedFunctionName?: string,
  teardown?: Promise<void>,
];

const listenerResourcesByThing = mapNew<any, Map<string, ListenerResources>>();

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
  type Handles = [listenerHandle: ListenerHandle, resources: ListenerResources];

  const executeCommand = getWrappedCommand(rawExecuteCommand, onSqlCommand);

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );
  if (!isJson && store.isMergeable()) {
    errorThrow(ERROR_STORE_TYPE);
  }
  const configHash =
    EMPTY_STRING + getHash(jsonStringWithUndefined(defaultedConfig));
  const channel = TINYBASE + '_' + configHash;
  const resourceOwner = thing ?? rawExecuteCommand;

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
        : replaceTableName(
            mapGet(
              (defaultedConfig as DefaultedTabularConfig)[0],
              tableName,
            )?.[2] ?? TRUE,
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

  const dropFunctions = async (functionNames: string[]): Promise<void> => {
    if (!isEmpty(functionNames)) {
      await executeCommand(
        `DROP FUNCTION IF EXISTS${arrayJoin(functionNames, ',')}CASCADE`,
      );
    }
  };

  const forgetListenerResources = (
    resourcesByHash: Map<string, ListenerResources>,
    resources: ListenerResources,
  ): void => {
    if (mapGet(resourcesByHash, configHash) === resources) {
      mapSet(resourcesByHash, configHash);
      if (
        collIsEmpty(resourcesByHash) &&
        mapGet(listenerResourcesByThing, resourceOwner) === resourcesByHash
      ) {
        mapSet(listenerResourcesByThing, resourceOwner);
      }
    }
  };

  const acquireListenerResources = async (): Promise<ListenerResources> => {
    const resourcesByHash = mapEnsure(
      listenerResourcesByThing,
      resourceOwner,
      () => mapNew<string, ListenerResources>(),
    );
    const existingResources = mapGet(resourcesByHash, configHash);
    if (existingResources) {
      await existingResources[1];
      if (existingResources[0]) {
        existingResources[0]++;
        return existingResources;
      }
      await tryCatch(() => existingResources[4]!);
      return await acquireListenerResources();
    }

    const functionNames: string[] = [];
    const resources: ListenerResources = [1, undefined, functionNames];
    mapSet(resourcesByHash, configHash, resources);
    resources[1] = (async () => {
      const tableCreatedFunctionName = await createFunction(
        TABLE_CREATED,
        // eslint-disable-next-line max-len
        `FOR row IN SELECT object_identity FROM pg_event_trigger_ddl_commands()${WHERE} command_tag='${CREATE_TABLE}' LOOP ${notify(`'c:'||SPLIT_PART(row.object_identity,'.',2)`)}END LOOP;`,
        'event_',
        'DECLARE row record;',
      );
      arrayPush(functionNames, tableCreatedFunctionName);

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
      arrayPush(functionNames, dataChangedFunctionName);
      resources[3] = dataChangedFunctionName;

      await promiseAll(
        arrayMap(collValues(managedTableNamesSet), async (tableName) => {
          await executeCommand(
            CREATE_TABLE +
              ` IF NOT EXISTS${escapeId(tableName)}("_id"text PRIMARY KEY)`,
          );
          return await addDataChangedTriggers(
            tableName,
            dataChangedFunctionName,
          );
        }),
      );
    })();

    try {
      await resources[1];
    } catch (error) {
      resources[0] = 0;
      resources[4] = tryFinallyAsync(
        () => dropFunctions(functionNames),
        () => forgetListenerResources(resourcesByHash, resources),
      );
      await tryCatch(() => resources[4]!);
      throw error;
    }
    return resources;
  };

  const releaseListenerResources = async (
    resources: ListenerResources,
  ): Promise<void> => {
    if (--resources[0] == 0) {
      const resourcesByHash = mapGet(listenerResourcesByThing, resourceOwner)!;
      resources[4] = tryFinallyAsync(
        () => dropFunctions(resources[2]),
        () => forgetListenerResources(resourcesByHash, resources),
      );
      await resources[4];
    }
  };

  const addPersisterListener = async (
    listener: PersisterListener<Persist>,
  ): Promise<Handles> => {
    const resources = await acquireListenerResources();
    try {
      const listenerHandle = await addChangeListener(
        channel,
        (prefixAndTableName) =>
          void tryCatchIgnore(
            () =>
              ifNotUndefined(
                strMatch(prefixAndTableName, EVENT_REGEX),
                async ([, eventType, tableName]) => {
                  if (collHas(managedTableNamesSet, tableName)) {
                    if (eventType == 'c:') {
                      await addDataChangedTriggers(tableName, resources[3]!);
                    }
                    await listener();
                  }
                },
              ),
            onIgnoredError,
          ),
      );
      return [listenerHandle, resources];
    } catch (error) {
      await tryCatchIgnore(
        () => releaseListenerResources(resources),
        onIgnoredError,
      );
      throw error;
    }
  };

  const delPersisterListener = async ([listenerHandle, resources]: Handles) => {
    await tryFinallyAsync(
      () => delChangeListener(listenerHandle),
      () => releaseListenerResources(resources),
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
          ` c.table_name tn,c.column_name cn,CASE WHEN tc.constraint_type IN('PRIMARY KEY','UNIQUE')AND(${SELECT} count(*) FROM information_schema.key_column_usage kcu2 ${WHERE} kcu2.constraint_schema=kcu.constraint_schema AND kcu2.constraint_name=kcu.constraint_name)=1 THEN 1 ELSE 0 END uq FROM information_schema.columns c LEFT JOIN information_schema.key_column_usage kcu ON kcu.table_schema=c.table_schema AND kcu.table_name=c.table_name AND kcu.column_name=c.column_name LEFT JOIN information_schema.table_constraints tc ON tc.constraint_schema=kcu.constraint_schema AND tc.constraint_name=kcu.constraint_name ${WHERE} c.table_schema='public'AND c.table_name IN(${getPlaceholders(managedTableNames)})`,
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
