import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../../types/persisters';
import {Cmd} from './commands';
import {Store} from '../../types/store';
import {collValues} from '../../common/coll';
import {createJsonSqlitePersister} from './json';
import {createTabularSqlitePersister} from './tabular';
import {getConfigStructures} from './config';

export type UpdateListener = (tableName: string) => void;
type DataVersionPragma = [{data_version: number}];
type SchemaVersionPragma = [{schema_version: number}];

const PRAGMA = 'pragma ';
const DATA_VERSION = 'data_version';
const SCHEMA_VERSION = 'schema_version';

export const createSqlitePersister = <UpdateListeningHandle>(
  store: Store,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  cmd: Cmd,
  addUpdateListener: (listener: UpdateListener) => UpdateListeningHandle,
  delUpdateListener: (listeningHandle: UpdateListeningHandle) => void,
): Persister => {
  let dataVersion: number | null;
  let schemaVersion: number | null;

  const [
    isJson,
    autoLoadIntervalSeconds,
    defaultedConfig,
    managedTableNamesSet,
  ] = getConfigStructures(configOrStoreTableName);

  const addPersisterListener = (
    listener: PersisterListener,
  ): [NodeJS.Timeout, UpdateListeningHandle] => [
    setInterval(async () => {
      try {
        const newDataVersion = (
          (await cmd(PRAGMA + DATA_VERSION)) as DataVersionPragma
        )[0][DATA_VERSION];
        const newSchemaVersion = (
          (await cmd(PRAGMA + SCHEMA_VERSION)) as SchemaVersionPragma
        )[0][SCHEMA_VERSION];
        if (
          newDataVersion != (dataVersion ??= newDataVersion) ||
          newSchemaVersion != (schemaVersion ??= newSchemaVersion)
        ) {
          listener();
          dataVersion = newDataVersion;
          schemaVersion = newSchemaVersion;
        }
      } catch {}
    }, (autoLoadIntervalSeconds as number) * 1000),
    addUpdateListener((tableName: string) =>
      managedTableNamesSet.has(tableName) ? listener() : 0,
    ),
  ];

  const delPersisterListener = ([interval, listeningHandle]: [
    NodeJS.Timeout,
    UpdateListeningHandle,
  ]): void => {
    clearInterval(interval);
    dataVersion = schemaVersion = null;
    delUpdateListener(listeningHandle);
  };

  return (isJson ? createJsonSqlitePersister : createTabularSqlitePersister)(
    store,
    cmd,
    addPersisterListener,
    delPersisterListener,
    defaultedConfig as any,
    collValues(managedTableNamesSet),
  );
};
