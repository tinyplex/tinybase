/* eslint-disable max-len */
import type {
  MergeableStore,
  RowStamp,
  TablesStamp,
  TableStamp,
  ValuesStamp,
} from '../../@types/mergeable-store/index.d.ts';
import type {
  DpcJson,
  PersistedChanges,
  PersistedContent,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {
  createDurableObjectSqlStoragePersister as createDurableObjectSqlStoragePersisterDecl,
  DpcFragmented,
  DurableObjectSqlStoragePersister,
} from '../../@types/persisters/persister-durable-object-sql-storage/index.d.ts';
import {arrayForEach, arrayPush} from '../../common/array.ts';
import {collHas} from '../../common/coll.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {
  IdObj,
  isObject,
  objEnsure,
  objForEach,
  objNew,
  objSet,
} from '../../common/obj.ts';
import {isNull, noop, number, string} from '../../common/other.ts';
import {setAdd, setNew} from '../../common/set.ts';
import {stampNewWithHash, stampUpdate} from '../../common/stamps.ts';
import {EMPTY_STRING, T} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

export type DurableObjectSqlDatabasePersisterConfig = DpcJson | DpcFragmented;

const getSqlRows = (
  sqlStorage: SqlStorage,
  sql: string,
  ...params: any[]
): IdObj<any>[] => sqlStorage.exec(sql, ...params).toArray();

export const createDurableObjectSqlStoragePersister = (
  store: MergeableStore,
  sqlStorage: SqlStorage,
  configOrStoreTableName?: DurableObjectSqlDatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister => {
  if (
    typeof configOrStoreTableName === 'object' &&
    configOrStoreTableName.mode === 'fragmented'
  ) {
    return createDurableObjectFragmentedSqlStoragePersister(
      store,
      sqlStorage,
      (configOrStoreTableName as DpcFragmented)?.storagePrefix ?? EMPTY_STRING,
      onIgnoredError,
    );
  }
  return createCustomSqlitePersister(
    store,
    configOrStoreTableName as DpcJson,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> => {
      if (!['BEGIN', 'END'].includes(sql)) {
        //in sql replace $1, $2, $3, etc. with a question mark
        sql = sql.replace(/\$\d+/g, '?');
        return getSqlRows(sqlStorage, sql, ...params);
      }
      return [];
    },
    (): UnsubscribeFunction => noop,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    2, // MergeableStoreOnly,
    sqlStorage,
    'getSqlStorage',
  ) as DurableObjectSqlStoragePersister;
};

const stampNewObjectWithHash = <Thing>() =>
  stampNewWithHash(objNew<Thing>(), EMPTY_STRING, 0);

const createDurableObjectFragmentedSqlStoragePersister = ((
  store: MergeableStore,
  sqlStorage: SqlStorage,
  storagePrefix: string = EMPTY_STRING,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister => {
  const tablePrefix = storagePrefix.replace(/[^a-zA-Z0-9_]/g, '_');
  const tablesTable = `${tablePrefix}tinybase_tables`;
  const valuesTable = `${tablePrefix}tinybase_values`;
  const insertTableSql = `INSERT INTO ${tablesTable} (type, table_id, row_id, cell_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const insertValueSql = `INSERT INTO ${valuesTable} (value_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?)`;
  const getRowKey = (tableId: string, rowId: string) =>
    jsonStringWithUndefined([tableId, rowId]);

  // Initialize the SQL tables
  const initializeTables = () => {
    sqlStorage.exec(`
      CREATE TABLE IF NOT EXISTS ${tablesTable} (
        type TEXT NOT NULL,
        table_id TEXT,
        row_id TEXT,
        cell_id TEXT,
        value_data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        hash INTEGER NOT NULL,
        PRIMARY KEY (type, table_id, row_id, cell_id)
      );
      
      CREATE TABLE IF NOT EXISTS ${valuesTable} (
        value_id TEXT,
        value_data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        hash INTEGER NOT NULL
      );
    `);
  };

  initializeTables();

  const getCondition = (params: any[], column: string, value: any): string =>
    isNull(value)
      ? `${column} IS NULL`
      : (arrayPush(params, value), `${column} = ?`);

  const delTablesRow = (
    tableId: string | null,
    rowId: string | null,
    cellId: string | null,
  ) => {
    const params = [T];
    sqlStorage.exec(
      `DELETE FROM ${tablesTable} WHERE type = ? AND ` +
        getCondition(params, 'table_id', tableId) +
        ` AND ` +
        getCondition(params, 'row_id', rowId) +
        ` AND ` +
        getCondition(params, 'cell_id', cellId),
      ...params,
    );
  };

  const setTablesRow = (
    tableId: string | null,
    rowId: string | null,
    cellId: string | null,
    valueData: string,
    timestamp: string,
    hash: number,
  ) => {
    delTablesRow(tableId, rowId, cellId);
    sqlStorage.exec(
      insertTableSql,
      T,
      tableId,
      rowId,
      cellId,
      valueData,
      timestamp,
      hash,
    );
  };

  const delCellRows = (tableId: string, rowId: string) =>
    sqlStorage.exec(
      `DELETE FROM ${tablesTable} WHERE type = ? AND table_id = ? AND row_id = ? AND cell_id IS NOT NULL`,
      T,
      tableId,
      rowId,
    );

  const delValuesRow = (valueId: string | null) => {
    const params: any[] = [];
    sqlStorage.exec(
      `DELETE FROM ${valuesTable} WHERE ` +
        getCondition(params, 'value_id', valueId),
      ...params,
    );
  };

  const setValuesRow = (
    valueId: string | null,
    valueData: string,
    timestamp: string,
    hash: number,
  ) => {
    delValuesRow(valueId);
    sqlStorage.exec(insertValueSql, valueId, valueData, timestamp, hash);
  };

  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.MergeableStoreOnly>
  > => {
    const tables: TablesStamp<true> = stampNewObjectWithHash();
    const values: ValuesStamp<true> = stampNewObjectWithHash();
    const rowDataKeys = setNew<string>();

    // Load tables data
    const tablesRows = getSqlRows(sqlStorage, `SELECT * FROM ${tablesTable}`);
    arrayForEach(tablesRows, (row) => {
      const table_id = row.table_id ? string(row.table_id) : null;
      const row_id = row.row_id ? string(row.row_id) : null;
      const cell_id = row.cell_id ? string(row.cell_id) : null;
      const value_data = string(row.value_data);
      const timestamp = string(row.timestamp);
      const hash = number(row.hash);
      const [zeroOrCells] = jsonParseWithUndefined(value_data);

      if (table_id && row_id && !cell_id && isObject(zeroOrCells)) {
        const table = objEnsure(
          tables[0],
          table_id,
          stampNewObjectWithHash,
        ) as TableStamp<true>;
        objSet(table[0], row_id, [
          zeroOrCells as RowStamp<true>[0],
          timestamp,
          hash,
        ]);
        setAdd(rowDataKeys, getRowKey(table_id, row_id));
      }
    });

    arrayForEach(tablesRows, (row) => {
      const type = string(row.type);
      const table_id = row.table_id ? string(row.table_id) : null;
      const row_id = row.row_id ? string(row.row_id) : null;
      const cell_id = row.cell_id ? string(row.cell_id) : null;
      const value_data = string(row.value_data);
      const timestamp = string(row.timestamp);
      const hash = number(row.hash);

      const [zeroOrCellOrValue] = jsonParseWithUndefined(value_data);

      if (type === T) {
        if (table_id && row_id && cell_id) {
          // Cell level
          if (!collHas(rowDataKeys, getRowKey(table_id, row_id))) {
            const table = objEnsure(
              tables[0],
              table_id,
              stampNewObjectWithHash,
            ) as TableStamp<true>;
            const tableRow = objEnsure(
              table[0],
              row_id,
              stampNewObjectWithHash,
            ) as RowStamp<true>;
            objSet(tableRow[0], cell_id, [zeroOrCellOrValue, timestamp, hash]);
          }
        } else if (table_id && row_id) {
          // Row level
          if (!isObject(zeroOrCellOrValue)) {
            const table = objEnsure(
              tables[0],
              table_id,
              stampNewObjectWithHash,
            ) as TableStamp<true>;
            const tableRow = objEnsure(
              table[0],
              row_id,
              stampNewObjectWithHash,
            ) as RowStamp<true>;
            stampUpdate(tableRow, timestamp, hash);
          }
        } else if (table_id) {
          // Table level
          const table = objEnsure(
            tables[0],
            table_id,
            stampNewObjectWithHash,
          ) as TableStamp<true>;
          stampUpdate(table, timestamp, hash);
        } else {
          // Tables level
          stampUpdate(tables, timestamp, hash);
        }
      }
    });

    // Load values data
    arrayForEach(
      getSqlRows(sqlStorage, `SELECT * FROM ${valuesTable}`),
      (row) => {
        const value_id = row.value_id ? string(row.value_id) : null;
        const value_data = string(row.value_data);
        const timestamp = string(row.timestamp);
        const hash = number(row.hash);

        const [zeroOrCellOrValue] = jsonParseWithUndefined(value_data);

        if (value_id) {
          objSet(values[0], value_id, [zeroOrCellOrValue, timestamp, hash]);
        } else {
          stampUpdate(values, timestamp, hash);
        }
      },
    );

    return [tables, values];
  };

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.MergeableStoreOnly>,
    [
      [tablesObj, tablesTime, tablesHash],
      [valuesObj, valuesTime, valuesHash],
    ]: PersistedChanges<
      PersistsType.MergeableStoreOnly,
      true
    > = getContent() as any,
  ): Promise<void> => {
    const [fullTablesObj] = getContent()[0];
    // Store the root tables metadata (timestamp and hash)
    setTablesRow(
      null,
      null,
      null,
      jsonStringWithUndefined([0]),
      tablesTime,
      tablesHash,
    );

    // Process each table in the store
    objForEach(tablesObj, ([tableObj, tableTime, tableHash], tableId) => {
      // Store table-level metadata
      setTablesRow(
        tableId,
        null,
        null,
        jsonStringWithUndefined([0]),
        tableTime,
        tableHash,
      );

      // Process each row within the table
      objForEach(tableObj, ([rowObj, rowTime, rowHash], rowId) => {
        const fullRowObj = fullTablesObj[tableId]?.[0]?.[rowId]?.[0] ?? rowObj;
        delCellRows(tableId, rowId);
        setTablesRow(
          tableId,
          rowId,
          null,
          jsonStringWithUndefined([fullRowObj]),
          rowTime,
          rowHash,
        );
      });
    });

    // Store the root values metadata (timestamp and hash)
    setValuesRow(null, jsonStringWithUndefined([0]), valuesTime, valuesHash);

    // Process each value in the store
    objForEach(valuesObj, (valueStamp, valueId) => {
      setValuesRow(
        valueId,
        jsonStringWithUndefined([valueStamp[0]]),
        valueStamp[1],
        valueStamp[2],
      );
    });
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    noop,
    noop,
    onIgnoredError,
    2, // MergeableStoreOnly,
    {getSqlStorage: () => sqlStorage},
  ) as DurableObjectSqlStoragePersister;
}) as typeof createDurableObjectSqlStoragePersisterDecl;
