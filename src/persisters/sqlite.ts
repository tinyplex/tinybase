import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {isString, jsonParse, jsonString} from '../common/other';
import {TINYBASE} from '../common/strings';
import {createCustomPersister} from '../persisters';

const ROW_ID_COL = '_id';
const SINGLE_ROW_ID = '_';
const STORE_COL = 'store';

export const createSqlitePersister = <ListeningHandle>(
  store: Store,
  storeTableOrConfig: string | DatabasePersisterConfig | undefined,
  run: (sql: string, args?: any[]) => Promise<void>,
  get: (sql: string, args?: any[]) => Promise<any[][]>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  const config: DatabasePersisterConfig = isString(storeTableOrConfig)
    ? {storeTable: storeTableOrConfig}
    : storeTableOrConfig ?? {};

  const {storeTable = TINYBASE} = config;

  const ensureTable = async (): Promise<void> =>
    await run(
      `CREATE TABLE IF NOT EXISTS "${storeTable}"(${ROW_ID_COL} ` +
        `PRIMARY KEY ON CONFLICT REPLACE,${STORE_COL});`,
    );

  const getPersisted = async (): Promise<[Tables, Values]> => {
    await ensureTable();
    return jsonParse(
      (
        await get(
          `SELECT ${STORE_COL} FROM "${storeTable}" WHERE ${ROW_ID_COL}=?`,
          [SINGLE_ROW_ID],
        )
      )[0][0],
    );
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await ensureTable();
      await run(
        `INSERT INTO "${storeTable}"(${ROW_ID_COL},${STORE_COL})VALUES(?, ?)`,
        [SINGLE_ROW_ID, jsonString(getContent())],
      );
    } catch {}
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};
