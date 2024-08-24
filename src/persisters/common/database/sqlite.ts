import {
  Cmd,
  DATA_VERSION,
  FROM,
  PRAGMA,
  PRAGMA_TABLE,
  SCHEMA_VERSION,
  SELECT,
  WHERE,
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
import {startInterval, stopInterval} from '../../../common/other.ts';
import {IdObj} from '../../../common/obj.ts';
import {collValues} from '../../../common/coll.ts';
import {createJsonPersister} from './json.ts';
import {createTabularPersister} from './tabular.ts';
import {getConfigStructures} from './config.ts';

export type UpdateListener = (tableName: string) => void;

export const createSqlitePersister = <
  UpdateListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  rawCmd: Cmd,
  addUpdateListener: (listener: UpdateListener) => UpdateListeningHandle,
  delUpdateListener: (listeningHandle: UpdateListeningHandle) => void,
  onSqlCommand: ((sql: string, args?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
  orReplace?: 0 | 1,
): Persister<Persist> => {
  let dataVersion: number | null;
  let schemaVersion: number | null;
  let totalChanges: number | null;

  const cmd = getWrappedCommand(rawCmd, onSqlCommand);

  const [
    isJson,
    autoLoadIntervalSeconds,
    defaultedConfig,
    managedTableNamesSet,
  ] = getConfigStructures(configOrStoreTableName);

  const addPersisterListener = (
    listener: PersisterListener<Persist>,
  ): (() => void) => {
    let interval: NodeJS.Timeout;

    const startPolling = () =>
      (interval = startInterval(async () => {
        try {
          const [{d, s, c}] = (await cmd(
            // eslint-disable-next-line max-len
            `${SELECT} ${DATA_VERSION} d,${SCHEMA_VERSION} s,TOTAL_CHANGES() c FROM ${PRAGMA}${DATA_VERSION} JOIN ${PRAGMA}${SCHEMA_VERSION}`,
          )) as [IdObj<number>];
          if (d != dataVersion || s != schemaVersion || c != totalChanges) {
            if (dataVersion != null) {
              listener();
            }
            dataVersion = d;
            schemaVersion = s;
            totalChanges = c;
          }
        } catch {}
      }, autoLoadIntervalSeconds as number));

    const stopPolling = () => {
      dataVersion = schemaVersion = totalChanges = null;
      stopInterval(interval);
    };

    const listeningHandle = addUpdateListener((tableName: string) => {
      if (managedTableNamesSet.has(tableName)) {
        stopPolling();
        listener();
        startPolling();
      }
    });

    startPolling();
    return () => {
      stopPolling();
      delUpdateListener(listeningHandle);
    };
  };

  const delPersisterListener = (
    stopPollingAndDelUpdateListener: () => void,
  ): void => stopPollingAndDelUpdateListener();

  return (isJson ? createJsonPersister : createTabularPersister)(
    store,
    cmd,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    () => 0,
    persist,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
    async (cmd: Cmd, managedTableNames: string[]): Promise<any[]> =>
      await cmd(
        // eslint-disable-next-line max-len
        `${SELECT} t.name tn,c.name cn ${FROM}${PRAGMA_TABLE}list()t,${PRAGMA_TABLE}info(t.name)c ${WHERE} t.schema='main'AND t.type IN('table','view')AND t.name IN(${getPlaceholders(managedTableNames)})ORDER BY t.name,c.name`,
        managedTableNames,
      ),
    thing,
    getThing,
    0,
    0,
    orReplace,
  );
};
