import {Cmd, getCommandFunctions} from './commands';
import {DpcJson, Persister, PersisterListener} from '../../types/persisters';
import {Store, Tables, Values} from '../../types/store';
import {jsonParse, jsonString} from '../../common/other';
import {DEFAULT_ROW_ID_COLUMN_NAME} from './tabular-config';
import {SINGLE_ROW_ID} from './common';
import {TINYBASE} from '../../common/strings';
import {createCustomPersister} from '../../persisters';

const STORE_COLUMN = 'store';

export const createJsonSqlitePersister = <ListeningHandle>(
  store: Store,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
  {storeTableName = TINYBASE}: DpcJson,
): Persister => {
  const [refreshSchema, loadSingleRow, saveSingleRow] =
    getCommandFunctions(cmd);

  const getPersisted = async (): Promise<[Tables, Values]> => {
    await refreshSchema();
    return jsonParse(
      ((await loadSingleRow(storeTableName, DEFAULT_ROW_ID_COLUMN_NAME)) ?? {})[
        STORE_COLUMN
      ],
    );
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> =>
    persister.schedule(async () => {
      await refreshSchema();
      await saveSingleRow(
        storeTableName,
        DEFAULT_ROW_ID_COLUMN_NAME,
        SINGLE_ROW_ID,
        {[STORE_COLUMN]: jsonString(getContent())},
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
