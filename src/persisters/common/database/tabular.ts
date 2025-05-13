import type {Id} from '../../../@types/common/index.d.ts';
import type {TablesStamp} from '../../../@types/index.js';
import type {
  DatabaseExecuteCommand,
  PersistedChanges,
  PersistedContent,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import type {
  CellOrUndefined,
  Tables,
  ValueOrUndefined,
  Values,
} from '../../../@types/store/index.d.ts';
import {arrayFilter} from '../../../common/array.ts';
import {getHash} from '../../../common/hash.ts';
import {getHlcFunctions} from '../../../common/hlc.ts';
import {getUniqueId} from '../../../common/index.ts';
import {jsonStringWithMap} from '../../../common/json.ts';
import {mapMap} from '../../../common/map.ts';
import {objHas, objIsEmpty, objMap, objNew} from '../../../common/obj.ts';
import {isString, isUndefined, promiseAll} from '../../../common/other.ts';
import {getLatestTime, stampNewWithHash} from '../../../common/stamps.ts';
import {createCustomPersister} from '../create.ts';
import {getCommandFunctions} from './commands.ts';
import {
  DEFAULT_ROW_ID_COLUMN_NAME,
  QuerySchema,
  SINGLE_ROW_ID,
  Upsert,
} from './common.ts';
import type {DefaultedTabularConfig} from './config.ts';

export const createTabularPersister = <
  ListeningHandle,
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  executeCommand: DatabaseExecuteCommand,
  addPersisterListener: (
    listener: PersisterListener<Persist>,
  ) => ListeningHandle | Promise<ListeningHandle>,
  delPersisterListener: (
    listeningHandle: ListeningHandle,
  ) => void | Promise<void>,
  onIgnoredError: ((error: any) => void) | undefined,
  extraDestroy: () => void,
  persist: Persist,
  [
    tablesLoadConfig,
    tablesSaveConfig,
    [valuesLoad, valuesSave, valuesTableName, valuesTimestampColumnName],
  ]: DefaultedTabularConfig,
  managedTableNames: string[],
  querySchema: QuerySchema,
  thing: any,
  getThing: string,
  columnType: string,
  upsert?: Upsert,
  encode?: (cellOrValue: any) => string | number,
  decode?: (field: string | number) => any,
): Persister<Persist> => {
  const uniqueId = getUniqueId(5);
  const [refreshSchema, loadTable, saveTable, transaction] =
    getCommandFunctions(
      executeCommand,
      managedTableNames,
      querySchema,
      onIgnoredError,
      columnType,
      upsert,
      encode,
      decode,
    );

  const saveTables = (
    tables:
      | Tables
      | {
          [tableId: Id]:
            | {[rowId: Id]: {[cellId: Id]: CellOrUndefined} | undefined}
            | undefined;
        },
    partial?: boolean,
  ) =>
    promiseAll(
      mapMap(
        tablesSaveConfig,
        async (
          [
            tableName,
            rowIdColumnName,
            deleteEmptyColumns,
            deleteEmptyTable,
            condition,
            timestampColumnName,
          ],
          tableId,
        ) => {
          if (!partial || objHas(tables, tableId)) {
            await saveTable(
              tableName,
              rowIdColumnName,
              tables[tableId],
              deleteEmptyColumns,
              deleteEmptyTable,
              partial,
              condition,
              timestampColumnName,
            );
          }
        },
      ),
    );

  const saveValues = async (
    values: Values | {[valueId: Id]: ValueOrUndefined},
    partial?: boolean,
  ) =>
    valuesSave
      ? await saveTable(
          valuesTableName,
          DEFAULT_ROW_ID_COLUMN_NAME,
          {[SINGLE_ROW_ID]: values},
          true,
          true,
          partial,
          undefined,
          valuesTimestampColumnName,
        )
      : null;

  const loadTables = async (): Promise<Tables> =>
    objNew(
      arrayFilter(
        await promiseAll(
          mapMap(
            tablesLoadConfig,
            async ([tableId, rowIdColumnName, condition], tableName) => [
              tableId,
              await loadTable(tableName, rowIdColumnName, condition),
            ],
          ),
        ),
        (pair) => !objIsEmpty(pair[1]),
      ),
    );

  const loadMergeableTables = async (): Promise<TablesStamp<true>> => {
    let tablesTime: string | undefined = undefined;
    return stampNewWithHash(objNew(
      arrayFilter(
        await promiseAll(
          mapMap(
            tablesLoadConfig,
            async (
              [tableId, rowIdColumnName, condition, updatedAtColumnName],
              tableName,
            ) => [
              tableId,
              await loadTable(tableName, rowIdColumnName, condition).then(
                (table) => {
                  let tableTime: string | undefined = undefined;
                  return stampNewWithHash(objMap(table, (row) => {
                    const [getHlc] = getHlcFunctions(uniqueId, () => {
                        if(!updatedAtColumnName) return 0;
                        const value = row[updatedAtColumnName];
                        if(typeof value === 'number') return value;
                        if(isString(value)) return Date.parse(value);
                        return 0;
                      });

                    const rowTime = getHlc();
                    tableTime = getLatestTime(tableTime, rowTime);
                    tablesTime = getLatestTime(tablesTime, tableTime);
                    return stampNewWithHash(objMap(row, (cell) => {
                      const cellHash = getHash(
                        jsonStringWithMap(cell ?? null) + ':' + rowTime,
                      );
                      return stampNewWithHash(cell, rowTime, cellHash);
                    }), rowTime, 0); 
                  }), tableTime ?? '', 0);
                }),
            ],
          ),
        ),
        (pair) => !objIsEmpty(pair[1]),
      ),
    ), tablesTime ?? '', 0);
  };

  // current values structure in the database is one big row 
  // with columns for values. To make it mergeable, we need to 
  // convert it to a key/value structure which would then
  // enable timestamp for each row.
  const loadValues = async (): Promise<Values | null> =>
    valuesLoad
      ? (await loadTable(valuesTableName, DEFAULT_ROW_ID_COLUMN_NAME))[
          SINGLE_ROW_ID
        ]
      : {};

  const getPersisted = (): Promise<PersistedContent<Persist> | undefined> =>
    transaction(async () => {
      await refreshSchema();
      if(store.isMergeable() && persist > 1 /* > Persists.StoreOnly*/) {
        const tables = await loadMergeableTables();
        const values = await loadValues();

        if(objIsEmpty(tables) && isUndefined(values)) {
          return undefined;
        }

        return [tables, values];
      } else {
        const tables = await loadTables();
        const values = await loadValues();
        
        if(objIsEmpty(tables) && isUndefined(values)) {
          return undefined;
        }
        
        return [tables as Tables, values as Values];
      }
    }) as any;

  const setPersisted = (
    getContent: () => PersistedContent<Persist>,
    changes?: PersistedChanges<Persist, true>,
  ): Promise<void> =>
    transaction(async () => {
      await refreshSchema();
      if (!isUndefined(changes)) {
        await saveTables(changes[0] as any, true);
        await saveValues(changes[1] as any, true);
      } else {
        const [tables, values] = getContent() as any;
        await saveTables(tables);
        await saveValues(values);
      }
    });

  const destroy = async () => {
    await persister.stopAutoLoad();
    await persister.stopAutoSave();
    extraDestroy();
    return persister;
  };

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persist,
    {[getThing]: () => thing, destroy},
    0,
    thing,
  );

  return persister;
};
