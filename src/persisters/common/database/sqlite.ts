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
import {IdObj} from '../../../common/obj.ts';
import {
  isNullish,
  startInterval,
  stopInterval,
  tryCatch,
} from '../../../common/other.ts';
import {EMPTY_STRING} from '../../../common/strings.ts';
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

  const addPersisterListener = (
    listener: PersisterListener<Persist>,
  ): (() => void) => {
    let interval: number;

    const startPolling = () =>
      (interval = startInterval(
        () =>
          tryCatch(async () => {
            const [{d, s, c}] = (await executeCommand(
              SELECT +
                // eslint-disable-next-line max-len
                ` ${DATA_VERSION} d,${SCHEMA_VERSION} s,TOTAL_CHANGES() c FROM ${PRAGMA}${DATA_VERSION} JOIN ${PRAGMA}${SCHEMA_VERSION}`,
            )) as [IdObj<number>];
            if (d != dataVersion || s != schemaVersion || c != totalChanges) {
              if (!isNullish(dataVersion)) {
                listener();
              }
              dataVersion = d;
              schemaVersion = s;
              totalChanges = c;
            }
          }),
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

    startPolling();
    return () => {
      stopPolling();
      delChangeListener(listeningHandle);
    };
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
          ` t.name tn,c.name cn FROM ${PRAGMA_TABLE}list()t,${PRAGMA_TABLE}info(t.name)c ${WHERE} t.schema='main'AND t.type IN('table','view')AND t.name IN(${getPlaceholders(managedTableNames)})ORDER BY t.name,c.name`,
        managedTableNames,
      ),
    thing,
    getThing,
    EMPTY_STRING,
    upsert,
    (cellOrValue: any) =>
      cellOrValue === true ? 1 : cellOrValue === false ? 0 : cellOrValue,
    undefined,
  );
};
