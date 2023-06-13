import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../../types/persisters';
import {Cmd} from './commands';
import {Store} from '../../types/store';
import {createNonSerializedSqlitePersister} from './non-serialized';
import {createSerializedSqlitePersister} from './serialized';
import {isString} from '../../common/other';

const DEFAULT_CONFIG: DatabasePersisterConfig = {serialized: true};

export const createSqlitePersister = <ListeningHandle>(
  store: Store,
  storeTableOrConfig: string | DatabasePersisterConfig | undefined,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  // const cmd = async (sql: string, args: any[] = []):
  // Promise<IdObj<any>[]> => {
  //   console.log(sql, args);
  //   return await cmd1(sql, args);
  // };

  const config: DatabasePersisterConfig = isString(storeTableOrConfig)
    ? {...DEFAULT_CONFIG, storeTable: storeTableOrConfig}
    : storeTableOrConfig ?? DEFAULT_CONFIG;

  const {serialized} = config;

  return serialized
    ? createSerializedSqlitePersister(
        store,
        cmd,
        addPersisterListener,
        delPersisterListener,
        config.storeTable,
      )
    : createNonSerializedSqlitePersister(
        store,
        cmd,
        addPersisterListener,
        delPersisterListener,
        config.rowIdColumn,
        config.valuesTable,
      );
};
