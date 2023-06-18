import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../../types/persisters';
import {Cmd} from './commands';
import {Store} from '../../types/store';
import {createJsonSqlitePersister} from './json';
import {createTabularSqlitePersister} from './tabular';
import {isString} from '../../common/other';
import {objMerge} from '../../common/obj';

type DataVersionPragma = [{data_version: number}];
type SchemaVersionPragma = [{schema_version: number}];

const JSON = 'json';
const AUTO_LOAD_INTERVAL_SECONDS = 'autoLoadIntervalSeconds';
const DEFAULT_CONFIG: DatabasePersisterConfig = {
  mode: JSON,
  [AUTO_LOAD_INTERVAL_SECONDS]: 1,
};
const PRAGMA = 'pragma ';
const DATA_VERSION = 'data_version';
const SCHEMA_VERSION = 'schema_version';

export const createSqlitePersister = <ListeningHandle>(
  store: Store,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  cmd: Cmd,
  addPersisterLocalListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterLocalListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  const config: DatabasePersisterConfig = objMerge(
    DEFAULT_CONFIG,
    isString(configOrStoreTableName)
      ? {storeTableName: configOrStoreTableName}
      : configOrStoreTableName ?? {},
  );

  let dataVersion: number | null;
  let schemaVersion: number | null;

  const addPersisterListener = (
    listener: PersisterListener,
  ): [NodeJS.Timeout, ListeningHandle] => [
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
    }, (config[AUTO_LOAD_INTERVAL_SECONDS] as number) * 1000),
    addPersisterLocalListener(listener),
  ];

  const delPersisterListener = ([interval, listeningHandle]: [
    NodeJS.Timeout,
    ListeningHandle,
  ]): void => {
    clearInterval(interval);
    dataVersion = schemaVersion = null;
    delPersisterLocalListener(listeningHandle);
  };

  return (
    config.mode == JSON
      ? createJsonSqlitePersister
      : createTabularSqlitePersister
  )(store, cmd, addPersisterListener, delPersisterListener, config as any);
};
