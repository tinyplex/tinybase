import {Cmd, getCommandFunctions} from './commands';
import {Persister, PersisterListener} from '../../types/persisters';
import {Store, Tables, Values} from '../../types/store';
import {jsonParse, jsonString} from '../../common/other';
import {SINGLE_ROW_ID} from './common';
import {createCustomPersister} from '../../persisters';

const STORE_COLUMN = 'store';

export const createSerializedSqlitePersister = <ListeningHandle>(
  store: Store,
  storeTable: string,
  cmd: Cmd,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  const [ensureTable, getSingleRow, setRow] = getCommandFunctions(cmd, '_id');

  const getPersisted = async (): Promise<[Tables, Values]> =>
    jsonParse(((await getSingleRow(storeTable)) ?? {})[STORE_COLUMN]);

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> =>
    persister.schedule(
      async () => await ensureTable(storeTable),
      async () =>
        await setRow(storeTable, SINGLE_ROW_ID, {
          [STORE_COLUMN]: jsonString(getContent()),
        }),
    );

  const persister: any = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );

  return persister;
};
