import type {
  DatabaseChangeListener,
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {collValues} from '../../../common/coll.ts';
import {ERROR_STORE_TYPE, errorThrow, tryCatch} from '../../../common/error.ts';
import {IdObj} from '../../../common/obj.ts';
import {
  isFalse,
  isNullish,
  isTrue,
  startInterval,
  stopInterval,
} from '../../../common/other.ts';
import {EMPTY_STRING} from '../../../common/strings.ts';
import {DatabaseTransaction} from './commands.ts';
import {
  DATA_VERSION,
  PRAGMA,
  PRAGMA_TABLE,
  SCHEMA_VERSION,
  SELECT,
  Upsert,
  WHERE,
  getPlaceholders,
  getWrappedCommand,
} from './common.ts';
import {getConfigStructures} from './config.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';

export const createCustomSqlitePersister = <
  ListenerHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  rawExecuteCommand: DatabaseExecuteCommand,
  addChangeListener: (listener: DatabaseChangeListener) => ListenerHandle,
  delChangeListener: (listenerHandle: ListenerHandle) => void,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
  upsert?: Upsert,
  executeTransaction?: DatabaseTransaction,
): Persister<Persist> => {
  let dataVersion: number | null;
  let schemaVersion: number | null;
  let totalChanges: number | null;

  const executeCommand = getWrappedCommand(rawExecuteCommand, onSqlCommand);

  const [
    isJson,
    autoLoadIntervalSeconds,
    defaultedConfig,
    managedTableNamesSet,
  ] = getConfigStructures(configOrStoreTableName);
  if (!isJson && store.isMergeable()) {
    errorThrow(ERROR_STORE_TYPE);
  }

  const addPersisterListener = (
    listener: PersisterListener<Persist>,
  ): Promise<() => void> => {
    let interval: number | NodeJS.Timeout;

    const checkForChanges = async (notify = true) => {
      const [{d, s, c}] = (await executeCommand(
        SELECT +
          // eslint-disable-next-line max-len
          ` ${DATA_VERSION} d,${SCHEMA_VERSION} s,TOTAL_CHANGES() c FROM ${PRAGMA}${DATA_VERSION} JOIN ${PRAGMA}${SCHEMA_VERSION}`,
      )) as [IdObj<number>];
      if (d != dataVersion || s != schemaVersion || c != totalChanges) {
        if (notify && !isNullish(dataVersion)) {
          listener();
        }
        dataVersion = d;
        schemaVersion = s;
        totalChanges = c;
      }
    };

    const startPolling = () =>
      (interval = startInterval(
        () => tryCatch(checkForChanges),
        autoLoadIntervalSeconds as number,
      ));

    const stopPolling = () => {
      dataVersion = schemaVersion = totalChanges = null;
      stopInterval(interval);
    };

    const listeningHandle = addChangeListener((tableName: string) => {
      if (managedTableNamesSet.has(tableName)) {
        stopPolling();
        listener();
        startPolling();
      }
    });

    return checkForChanges(false).then(() => {
      startPolling();
      return () => {
        stopPolling();
        delChangeListener(listeningHandle);
      };
    });
  };

  const delPersisterListener = (
    stopPollingAndDelUpdateListener: () => void,
  ): void => stopPollingAndDelUpdateListener();

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
          ` t.name tn,c.name cn,c.pk OR EXISTS(${SELECT} 1 FROM ${PRAGMA}index_list(t.name)i,${PRAGMA}index_info(i.name)ii ${WHERE} i."unique"=1 AND ii.name=c.name AND(${SELECT} count(*) FROM ${PRAGMA}index_info(i.name))=1)uq FROM ${PRAGMA_TABLE}list()t,${PRAGMA_TABLE}info(t.name)c ${WHERE} t.schema='main'AND t.type IN('table','view')AND t.name IN(${getPlaceholders(managedTableNames)})ORDER BY t.name,c.name`,
        managedTableNames,
      ),
    thing,
    getThing,
    EMPTY_STRING,
    upsert,
    (cellOrValue: any) =>
      isTrue(cellOrValue) ? 1 : isFalse(cellOrValue) ? 0 : cellOrValue,
    undefined,
    executeTransaction,
  );
};
