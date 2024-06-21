import type {
  DatabasePersisterConfig,
  Persistables,
  PersistedStore,
  Persister,
  PersisterListener,
} from '../../../@types/persisters/index.d.ts';
import {startInterval, stopInterval} from '../../../common/other.ts';
import {Cmd} from './commands.ts';
import {IdObj} from '../../../common/obj.ts';
import {collValues} from '../../../common/coll.ts';
import {createJsonSqlitePersister} from './json.ts';
import {createTabularSqlitePersister} from './tabular.ts';
import {getConfigStructures} from './config.ts';

export type UpdateListener = (tableName: string) => void;

const PRAGMA = 'pragma_';
const DATA_VERSION = 'data_version';
const SCHEMA_VERSION = 'schema_version';

export const createSqlitePersister = <
  UpdateListeningHandle,
  Persistable extends Persistables = Persistables.StoreOnly,
>(
  store: PersistedStore<Persistable>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  cmd: Cmd,
  addUpdateListener: (listener: UpdateListener) => UpdateListeningHandle,
  delUpdateListener: (listeningHandle: UpdateListeningHandle) => void,
  onSqlCommand: ((sql: string, args?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  persistable: Persistable,
  db: any,
  getThing = 'getDb',
  useOnConflict?: boolean,
): Persister<Persistable> => {
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
    listener: PersisterListener<Persistable>,
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
    persistable,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
    db,
    getThing,
    useOnConflict,
  );
};
