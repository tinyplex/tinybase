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

const defaultConfig: DatabasePersisterConfig = {serialized: true};

export const createSqlitePersister = <ListeningHandle>(
  store: Store,
  storeTableOrConfig: string | DatabasePersisterConfig | undefined,
  run: (sql: string, args?: any[]) => Promise<void>,
  get: (sql: string, args?: any[]) => Promise<any[][]>,
  addPersisterListener: (listener: PersisterListener) => ListeningHandle,
  delPersisterListener: (listeningHandle: ListeningHandle) => void,
): Persister => {
  let getPersisted;
  let setPersisted;
  let rowIdColumn = '_id';

  const config: DatabasePersisterConfig = isString(storeTableOrConfig)
    ? {...defaultConfig, storeTable: storeTableOrConfig}
    : storeTableOrConfig ?? defaultConfig;

  const {serialized} = config;

  const ensureTable = async (table: string): Promise<void> =>
    await run(
      `CREATE TABLE IF NOT EXISTS"${table}"(${rowIdColumn} ` +
        `PRIMARY KEY ON CONFLICT REPLACE,${STORE_COL});`,
    );

  const getSingleRow = async (table: string) => {
    await ensureTable(table);
    return arraySlice(
      (
        await get(`SELECT*FROM"${table}"WHERE ${rowIdColumn}=?`, [
          SINGLE_ROW_ID,
        ])
      )[0],
      1,
    );
  };

  const setSingleRow = async (table: string, values: any[]) => {
    await ensureTable(table);
    await run(
      `INSERT INTO"${table}"VALUES(?${',?'.repeat(arrayLength(values))})`,
      [SINGLE_ROW_ID, ...values],
    );
  };

  if (serialized) {
    const {storeTable = TINYBASE} = config;

    getPersisted = async (): Promise<[Tables, Values]> =>
      jsonParse((await getSingleRow(storeTable))[0]);

    setPersisted = async (getContent: () => [Tables, Values]): Promise<void> =>
      await setSingleRow(storeTable, [jsonString(getContent())]);
  } else {
    rowIdColumn = config.rowIdColumn ?? rowIdColumn;

    getPersisted = async (): Promise<[Tables, Values]> => [{}, {}];

    setPersisted = async (): Promise<void> => {
      //
    };
  }

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
  );
};
