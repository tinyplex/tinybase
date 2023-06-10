import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {Store, Tables, Values} from '../types/store';
import {arrayLength, arraySlice} from '../common/array';
import {isString, jsonParse, jsonString} from '../common/other';
import {TINYBASE} from '../common/strings';
import {createCustomPersister} from '../persisters';

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

  const {storeTable = TINYBASE, rowIdColumn = '_id'} = config;

  const ensureTable = async (): Promise<void> =>
    await run(
      `CREATE TABLE IF NOT EXISTS"${storeTable}"(${rowIdColumn} ` +
        `PRIMARY KEY ON CONFLICT REPLACE,${STORE_COL});`,
    );

  const getSingleRow = async (table: string) =>
    arraySlice(
      (
        await get(`SELECT*FROM"${table}"WHERE ${rowIdColumn}=?`, [
          SINGLE_ROW_ID,
        ])
      )[0],
      1,
    );

  const setSingleRow = async (table: string, values: any[]) => {
    await ensureTable();
    await run(
      `INSERT INTO"${table}"VALUES(?${',?'.repeat(arrayLength(values))})`,
      [SINGLE_ROW_ID, ...values],
    );
  };

  const getPersisted = async (): Promise<[Tables, Values]> => {
    await ensureTable();
    return jsonParse((await getSingleRow(storeTable))[0]);
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await ensureTable();
      await setSingleRow(storeTable, [jsonString(getContent())]);
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
