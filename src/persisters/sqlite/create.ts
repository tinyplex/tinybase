import {
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  StoreTypes,
} from '../../types/persisters';
import {startInterval, stopInterval} from '../../common/other';
import {Cmd} from './commands';
import {IdObj} from '../../common/obj';
import {collValues} from '../../common/coll';
import {createJsonSqlitePersister} from './json';
import {createTabularSqlitePersister} from './tabular';
import {getConfigStructures} from './config';

export type UpdateListener = (tableName: string) => void;

const PRAGMA = 'pragma_';
const DATA_VERSION = 'data_version';
const SCHEMA_VERSION = 'schema_version';

export const createSqlitePersister = <
  UpdateListeningHandle,
  StoreType extends StoreTypes = 1,
>(
  store: PersistedStore<StoreType>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  cmd: Cmd,
  addUpdateListener: (listener: UpdateListener) => UpdateListeningHandle,
  delUpdateListener: (listeningHandle: UpdateListeningHandle) => void,
  onSqlCommand: ((sql: string, args?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  supportedStoreType: StoreType,
  db: any,
  getThing = 'getDb',
  useOnConflict?: boolean,
): Persister<StoreType> => {
  let dataVersion: number | null;
  let schemaVersion: number | null;
  let totalChanges: number | null;

  const [
    isJson,
    autoLoadIntervalSeconds,
    defaultedConfig,
    managedTableNamesSet,
  ] = getConfigStructures(configOrStoreTableName);

  const addPersisterListener = (
    listener: PersisterListener<StoreType>,
  ): [NodeJS.Timeout, UpdateListeningHandle] => [
    startInterval(
      async () => {
        try {
          const [{d, s, c}] = (await cmd(
            `SELECT ${DATA_VERSION} d,${SCHEMA_VERSION} s,TOTAL_CHANGES() c` +
              ` FROM ${PRAGMA}${DATA_VERSION} JOIN ${PRAGMA}${SCHEMA_VERSION}`,
          )) as [IdObj<number>];
          if (
            d != (dataVersion ??= d) ||
            s != (schemaVersion ??= s) ||
            c != (totalChanges ??= c)
          ) {
            listener();
            dataVersion = d;
            schemaVersion = s;
          }
        } catch {}
      },
      autoLoadIntervalSeconds as number,
      1,
    ),
    addUpdateListener((tableName: string) =>
      managedTableNamesSet.has(tableName) ? listener() : 0,
    ),
  ];

  const delPersisterListener = ([interval, listeningHandle]: [
    NodeJS.Timeout,
    UpdateListeningHandle,
  ]): void => {
    stopInterval(interval);
    dataVersion = schemaVersion = totalChanges = null;
    delUpdateListener(listeningHandle);
  };

  return (isJson ? createJsonSqlitePersister : createTabularSqlitePersister)(
    store,
    onSqlCommand
      ? async (sql, args) => {
          onSqlCommand(sql, args);
          return await cmd(sql, args);
        }
      : cmd,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    supportedStoreType,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
    db,
    getThing,
    useOnConflict,
  );
};
