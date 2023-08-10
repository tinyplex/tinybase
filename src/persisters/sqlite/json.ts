import {Cmd, getCommandFunctions} from './commands';
import {DEFAULT_ROW_ID_COLUMN_NAME, SINGLE_ROW_ID} from './common';
import {Persister, PersisterListener} from '../../types/persisters';
import {Store, Tables, Values} from '../../types/store';
import {jsonParse, jsonString} from '../../common/json';
import {DefaultedJsonConfig} from './config';
import {createCustomPersister} from '../../persisters';

const STORE_COLUMN = 'store';

export const createJsonSqlitePersister = <ListeningHandle>(
  store: Store,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  [storeTableName]: DefaultedJsonConfig,
  managedTableNames: string[],
): Persister => {
  const [refreshSchema, loadTable, saveTable] = getCommandFunctions(
    cmd,
    managedTableNames,
  );

  const getPersisted = async (): Promise<[Tables, Values]> => {
    await refreshSchema();
    return jsonParse(
      (await loadTable(storeTableName, DEFAULT_ROW_ID_COLUMN_NAME))[
        SINGLE_ROW_ID
      ]?.[STORE_COLUMN] as string,
    );
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> =>
    persister.schedule(refreshSchema, async () => {
      await saveTable(
        storeTableName,
        DEFAULT_ROW_ID_COLUMN_NAME,
        {
          [SINGLE_ROW_ID]: {[STORE_COLUMN]: jsonString(getContent())},
        },
        true,
        true,
      );
    });

  const persister: any = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );

  return persister;
};
