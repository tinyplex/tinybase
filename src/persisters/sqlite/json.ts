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
  onIgnoredError: ((error: any) => void) | undefined,
  [storeTableName]: DefaultedJsonConfig,
  managedTableNames: string[],
  scheduleId: any,
): Persister => {
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(cmd, managedTableNames, onIgnoredError);

  const getPersisted = async (): Promise<[Tables, Values]> =>
    await transaction(async () => {
      await refreshSchema();
      return jsonParse(
        ((await loadTable(storeTableName, DEFAULT_ROW_ID_COLUMN_NAME))[
          SINGLE_ROW_ID
        ]?.[STORE_COLUMN] as string) ?? 'null',
      );
    });

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> =>
    await transaction(async () => {
      await refreshSchema();
      await saveTable(
        storeTableName,
        DEFAULT_ROW_ID_COLUMN_NAME,
        {
          [SINGLE_ROW_ID]: {[STORE_COLUMN]: jsonString(getContent() ?? null)},
        },
        true,
        true,
      );
    });

  const persister: any = (createCustomPersister as any)(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    scheduleId,
  );

  return persister;
};
