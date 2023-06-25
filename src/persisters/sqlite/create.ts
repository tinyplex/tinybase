import {AUTO_LOAD_INTERVAL_SECONDS, JSON, getDefaultedConfig} from './config';
import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../../types/persisters';
import {Cmd} from './commands';
import {Store} from '../../types/store';
import {createJsonSqlitePersister} from './json';
import {createTabularSqlitePersister} from './tabular';

type DataVersionPragma = [{data_version: number}];
type SchemaVersionPragma = [{schema_version: number}];

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
  let dataVersion: number | null;
  let schemaVersion: number | null;

  const config = getDefaultedConfig(configOrStoreTableName);

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
