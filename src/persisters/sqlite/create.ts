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

const JSON = 'json';
const DEFAULT_CONFIG: DatabasePersisterConfig = {mode: JSON};

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

  return config.mode == JSON
    ? createJsonSqlitePersister(
        store,
        cmd,
        addPersisterListener,
        delPersisterListener,
        config.storeTable,
      )
    : createTabularSqlitePersister(
        store,
        cmd,
        addPersisterListener,
        delPersisterListener,
        config.rowIdColumn,
        config.valuesTable,
      );
};
