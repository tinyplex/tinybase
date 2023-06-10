import {
  DatabasePersisterConfig,
  Persister,
  PersisterListener,
} from '../types/persisters';
import {EMPTY_STRING, TINYBASE} from '../common/strings';
import {Row, Store, Tables, Values} from '../types/store';
import {arrayLength, arrayMap, arraySlice} from '../common/array';
import {isString, jsonParse, jsonString} from '../common/other';
import {objIds, objMap, objValues} from '../common/obj';
import {Id} from '../types/common';
import {collHas} from '../common/coll';
import {createCustomPersister} from '../persisters';
import {setNew} from '../common/set';

const SINGLE_ROW_ID = '_';
const STORE_COLUMN = 'store';

const defaultConfig: DatabasePersisterConfig = {serialized: true};

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

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
      `CREATE TABLE IF NOT EXISTS${escapeId(table)}(${escapeId(rowIdColumn)} ` +
        `PRIMARY KEY ON CONFLICT REPLACE);`,
    );

  const ensureColumns = async (table: string, row: Row): Promise<void> => {
    const columns = setNew(
      ...(await get(`SELECT NAME FROM pragma_table_info(?) WHERE name != ?`, [
        table,
        rowIdColumn,
      ])),
    );
    await Promise.all(
      objMap(row, async (_, cellId) =>
        collHas(columns, cellId)
          ? 0
          : await run(`ALTER TABLE${escapeId(table)}ADD${escapeId(cellId)}`),
      ),
    );
  };

  const getSingleRow = async (table: string) => {
    await ensureTable(table);
    return arraySlice(
      (
        await get(
          `SELECT*FROM${escapeId(table)}WHERE ${escapeId(rowIdColumn)}=?`,
          [SINGLE_ROW_ID],
        )
      )[0],
      1,
    );
  };

  const setRow = async (table: string, rowId: Id, row: Row | Values) => {
    const columns = arrayMap(
      objIds(row),
      (cellId) => `,${escapeId(cellId)}`,
    ).join(EMPTY_STRING);
    const values = objValues(row);
    await ensureTable(table);
    await ensureColumns(table, row);
    await run(
      `INSERT INTO${escapeId(table)}(${escapeId(
        rowIdColumn,
      )}${columns})VALUES(?${',?'.repeat(arrayLength(values))})`,
      [rowId, ...values],
    );
  };

  if (serialized) {
    const {storeTable = TINYBASE} = config;

    getPersisted = async (): Promise<[Tables, Values]> =>
      jsonParse((await getSingleRow(storeTable))[0]);

    setPersisted = async (getContent: () => [Tables, Values]): Promise<void> =>
      await setRow(storeTable, SINGLE_ROW_ID, {
        [STORE_COLUMN]: jsonString(getContent()),
      });
  } else {
    const {valuesTable = TINYBASE + '_values'} = config;
    rowIdColumn = config.rowIdColumn ?? rowIdColumn;

    getPersisted = async (): Promise<[Tables, Values]> => [{}, {}];

    setPersisted = async (
      getContent: () => [Tables, Values],
    ): Promise<void> => {
      const [tables, values] = getContent();
      await Promise.all(
        objMap(
          tables,
          async (table, tableId) =>
            await Promise.all(
              objMap(
                table,
                async (row, rowId) => await setRow(tableId, rowId, row),
              ),
            ),
        ),
      );

      await setRow(valuesTable, SINGLE_ROW_ID, values);
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
