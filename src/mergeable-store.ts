import {
  CellHashes,
  ContentHashes,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  RowHashes,
  RowIdsDiff,
  RowStamp,
  Stamp,
  TableHashes,
  TableIdsDiff,
  TableStamp,
  TablesStamp,
  Time,
  ValuesHashes,
  ValuesStamp,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {CellOrUndefined, Changes, Store, ValueOrUndefined} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {Id, Ids} from './types/common';
import {
  IdObj,
  objEnsure,
  objForEach,
  objFreeze,
  objIsEmpty,
  objMap,
  objNew,
  objToArray,
  objValidate,
} from './common/obj';
import {
  RowStampMap,
  StampMap,
  TableStampMap,
  TablesStampMap,
  ValuesStampMap,
  getStampHash,
  hashIdAndHash,
  stampClone,
  stampMapToObjWithHash,
  stampNewMap,
  stampNewObj,
  stampUpdate,
  stampValidate,
} from './mergeable-store/stamps';
import {arrayMap, arrayPush} from './common/array';
import {
  ifNotUndefined,
  isArray,
  isUndefined,
  size,
  slice,
} from './common/other';
import {mapEnsure, mapForEach, mapGet, mapToObj} from './common/map';
import {createStore} from './store';
import {getHash} from './mergeable-store/hash';
import {getHlcFunctions} from './mergeable-store/hlc';
import {isCellOrValueOrNull} from './common/cell';
import {jsonString} from './common/json';

const LISTENER_ARGS: IdObj<number> = {
  HasTable: 1,
  Table: 1,
  TableCellIds: 1,
  HasTableCell: 2,
  RowCount: 1,
  RowIds: 1,
  SortedRowIds: 5,
  HasRow: 2,
  Row: 2,
  CellIds: 2,
  HasCell: 3,
  Cell: 3,
  HasValue: 1,
  Value: 1,
  InvalidCell: 3,
  InvalidValue: 1,
};

type ContentStampMap = Stamp<
  [tablesStampMap: TablesStampMap, valuesStampMap: ValuesStampMap],
  true
>;

const newContentStampMap = (time = EMPTY_STRING): ContentStampMap => [
  time,
  [stampNewMap(time), stampNewMap(time)],
  0,
];

const validateMergeableContent = (
  mergeableContent: MergeableContent,
): boolean =>
  stampValidate(
    mergeableContent,
    (content) =>
      isArray(content) &&
      size(content) == 2 &&
      stampValidate(content[0], (tableStamps) =>
        objValidate(
          tableStamps,
          (tableStamp) =>
            stampValidate(tableStamp, (rowStamps) =>
              objValidate(
                rowStamps,
                (rowStamp) =>
                  stampValidate(rowStamp, (cellStamps) =>
                    objValidate(
                      cellStamps,
                      (cellStamp) =>
                        stampValidate(cellStamp, isCellOrValueOrNull),
                      undefined,
                      1,
                    ),
                  ),
                undefined,
                1,
              ),
            ),
          undefined,
          1,
        ),
      ) &&
      stampValidate(content[1], (values) =>
        objValidate(
          values,
          (value) => stampValidate(value, isCellOrValueOrNull),
          undefined,
          1,
        ),
      ),
  );

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let contentStampMap = newContentStampMap();
  let transactionTime: Time | undefined;
  let transactionMergeableChanges: MergeableChanges | undefined;
  const [getHlc, seenHlc] = getHlcFunctions(id);
  const store = createStore();

  const disableListening = (actions: () => void): MergeableStore => {
    const wasListening = listening;
    listening = 0;
    actions();
    listening = wasListening;
    return mergeableStore as MergeableStore;
  };

  const mergeContentOrChanges = (
    contentOrChanges: MergeableChanges | MergeableContent,
    hasHashes: 0 | 1 = 0,
  ): Changes => {
    const tablesChanges = {};
    const valuesChanges = {};
    const [
      contentOrChangesTime,
      [[tablesTime, tablesObj, incomingTablesHash], values],
      incomingContentOrChangesHash,
    ] = contentOrChanges as MergeableContent;
    const [, [tablesStampMap, valuesStampMap]] = contentStampMap;
    const [oldTablesTime, tableStampMaps, oldTablesHash] = tablesStampMap;

    if (tablesTime) {
      let tablesHash = hasHashes
        ? incomingTablesHash
        : oldTablesHash ^
          (tablesTime > oldTablesTime
            ? (oldTablesTime ? getHash(oldTablesTime) : 0) ^ getHash(tablesTime)
            : 0);

      objForEach(
        tablesObj,
        ([tableTime, rowsObj, incomingTableHash], tableId) => {
          const tableStampMap = mapEnsure<Id, TableStampMap>(
            tableStampMaps,
            tableId,
            stampNewMap,
          );
          const [oldTableTime, rowStampMaps, oldTableHash] = tableStampMap;
          let tableHash = hasHashes
            ? incomingTableHash
            : oldTableHash ^
              (tableTime > oldTableTime
                ? (oldTableTime ? getHash(oldTableTime) : 0) ^
                  getHash(tableTime)
                : 0);

          objForEach(rowsObj, (row, rowId) => {
            const [oldRowHash, rowHash] = mergeCellsOrValues(
              row,
              mapEnsure<Id, RowStampMap>(rowStampMaps, rowId, stampNewMap),
              objEnsure<IdObj<CellOrUndefined>>(
                objEnsure<IdObj<IdObj<CellOrUndefined>>>(
                  tablesChanges,
                  tableId,
                  objNew,
                ),
                rowId,
                objNew,
              ),
              hasHashes,
            );
            tableHash ^= hasHashes
              ? 0
              : (oldRowHash ? hashIdAndHash(rowId, oldRowHash) : 0) ^
                hashIdAndHash(rowId, rowHash);
          });
          stampUpdate(tableStampMap, tableHash, tableTime);
          tablesHash ^= hasHashes
            ? 0
            : (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
              hashIdAndHash(tableId, tableStampMap[2]);
        },
      );
      stampUpdate(tablesStampMap, tablesHash, tablesTime);
    }

    mergeCellsOrValues(values, valuesStampMap, valuesChanges, hasHashes);

    stampUpdate(
      contentStampMap,
      hasHashes
        ? incomingContentOrChangesHash
        : tablesStampMap[2] ^ valuesStampMap[2],
      contentOrChangesTime,
    );
    return [tablesChanges, valuesChanges, 1];
  };

  const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
    things: Stamp<IdObj<Stamp<Thing, true>>, true>,
    thingsStampMap: StampMap<Stamp<Thing, true>>,
    thingsChanges: {[thingId: Id]: Thing},
    hasHashes: 0 | 1,
  ): [oldThingsHash: number, newThingsHash: number] => {
    const [thingsTime, thingsObj, incomingThingsHash] = things;
    const [oldThingsTime, thingStampMaps, oldThingsHash] = thingsStampMap;
    if (thingsTime) {
      let thingsHash = hasHashes
        ? incomingThingsHash
        : oldThingsHash ^
          (thingsTime > oldThingsTime
            ? (oldThingsTime ? getHash(oldThingsTime) : 0) ^ getHash(thingsTime)
            : 0);

      objForEach(
        thingsObj,
        ([thingTime, thing, incomingThingHash], thingId) => {
          const thingStampMap = mapEnsure<Id, Stamp<Thing, true>>(
            thingStampMaps,
            thingId,
            () => [EMPTY_STRING, undefined as any, 0],
          );
          const [oldThingTime, , oldThingHash] = thingStampMap;

          if (thingTime > oldThingTime) {
            stampUpdate(
              thingStampMap,
              hasHashes
                ? incomingThingHash
                : getHash(jsonString(thing ?? null) + ':' + thingTime),
              thingTime,
            );
            thingStampMap[1] = thing;
            thingsChanges[thingId] = thing;
            thingsHash ^= hasHashes
              ? 0
              : hashIdAndHash(thingId, oldThingHash) ^
                hashIdAndHash(thingId, thingStampMap[2]);
          }
        },
      );

      stampUpdate(thingsStampMap, thingsHash, thingsTime);
    }
    return [oldThingsHash, thingsStampMap[2]];
  };

  const preFinishTransaction = () => {
    if (listening) {
      transactionMergeableChanges = getTransactionMergeableChanges();
      mergeContentOrChanges(transactionMergeableChanges);
    }
  };

  const postFinishTransaction = () =>
    (transactionTime = transactionMergeableChanges = undefined);

  // ---

  const getId = () => id;

  const getMergeableContent = (): MergeableContent => [
    contentStampMap[0],
    [
      stampMapToObjWithHash(contentStampMap[1][0], (tableStampMap) =>
        stampMapToObjWithHash(tableStampMap, (rowStampMap) =>
          stampMapToObjWithHash(rowStampMap),
        ),
      ),
      stampMapToObjWithHash(contentStampMap[1][1]),
    ],
    contentStampMap[2],
  ];

  const getMergeableContentHashes = (): ContentHashes => [
    contentStampMap[0],
    [contentStampMap[1][0][2], contentStampMap[1][1][2]],
  ];

  const getMergeableTableHashes = (): TableHashes =>
    mapToObj(contentStampMap[1][0][1], getStampHash);

  const getMergeableTableIdsDiff = (relativeTo: TableHashes): TableIdsDiff => {
    const tableIds: Ids = [];
    mapForEach(contentStampMap[1][0][1], (tableId, [, , hash]) => {
      if (hash !== relativeTo?.[tableId]) {
        arrayPush(tableIds, tableId);
      }
    });
    return tableIds;
  };

  const getMergeableRowHashes = (tablesDelta: TableIdsDiff): RowHashes =>
    objNew(
      arrayMap(tablesDelta, (tableId) => [
        tableId,
        mapToObj(mapGet(contentStampMap[1][0][1], tableId)?.[1], getStampHash),
      ]),
    );

  const getMergeableRowIdsDiff = (relativeTo: RowHashes): RowIdsDiff =>
    objMap(relativeTo, (rowHashes, tableId) => {
      const rowIds: Ids = [];
      mapForEach(
        mapGet(contentStampMap[1][0][1], tableId)?.[1],
        (rowId, [, , hash]) => {
          if (hash !== rowHashes?.[rowId]) {
            arrayPush(rowIds, rowId);
          }
        },
      );
      return rowIds;
    });

  const getMergeableCellHashes = (tableDelta: RowIdsDiff): CellHashes =>
    objMap(tableDelta, (rowIds, tableId) =>
      objNew(
        arrayMap(rowIds, (rowId) => [
          rowId,
          mapToObj(
            mapGet(mapGet(contentStampMap[1][0][1], tableId)?.[1], rowId)?.[1],
            getStampHash,
          ),
        ]),
      ),
    );

  const getMergeableTablesChanges = (relativeTo: CellHashes): TablesStamp => {
    const [, [[tablesTime, tableStampMaps]]] = contentStampMap;
    const tables: TablesStamp[1] = {};
    objForEach(relativeTo, (rowCellHashes, tableId) =>
      ifNotUndefined(
        mapGet(tableStampMaps, tableId),
        ([tableTime, rowStampMaps]) => {
          const table: TableStamp[1] = {};
          objForEach(rowCellHashes, (cellHashes, rowId) =>
            ifNotUndefined(
              mapGet(rowStampMaps, rowId),
              ([rowTime, cellStampMaps]) => {
                const row: RowStamp[1] = mapToObj(
                  cellStampMaps,
                  stampClone,
                  ([, , hash], cellId) => hash == cellHashes?.[cellId],
                );
                if (!objIsEmpty(row)) {
                  table[rowId] = [rowTime, row];
                }
              },
            ),
          );
          if (!objIsEmpty(table)) {
            tables[tableId] = [tableTime, table];
          }
        },
      ),
    );
    return [tablesTime, tables];
  };

  const getMergeableValuesHashes = (): ValuesHashes =>
    mapToObj(contentStampMap[1][1][1], getStampHash);

  const getMergeableValuesChanges = (relativeTo: ValuesHashes): ValuesStamp => [
    contentStampMap[1][1][0],
    mapToObj(
      contentStampMap[1][1][1],
      stampClone,
      ([, , hash], valueId) => hash == relativeTo?.[valueId],
    ),
  ];

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore =>
    disableListening(() =>
      validateMergeableContent(mergeableContent)
        ? store.transaction(() => {
            store.delTables().delValues();
            contentStampMap = newContentStampMap();
            seenHlc(mergeableContent[0]);
            store.applyChanges(mergeContentOrChanges(mergeableContent, 1));
          })
        : 0,
    );

  const getTransactionMergeableChanges = (): MergeableChanges => {
    if (isUndefined(transactionMergeableChanges)) {
      const [, , changedCells, , changedValues] = store.getTransactionLog();
      const time =
        !objIsEmpty(changedCells) || !objIsEmpty(changedValues)
          ? transactionTime ?? (transactionTime = getHlc())
          : EMPTY_STRING;
      const mergeableChanges: MergeableChanges = [
        time,
        [
          stampNewObj(objIsEmpty(changedCells) ? EMPTY_STRING : time),
          stampNewObj(objIsEmpty(changedValues) ? EMPTY_STRING : time),
          1,
        ],
      ];
      const [[, tablesObj], [, valuesObj]] = mergeableChanges[1];

      objToArray(changedCells, (changedTable, tableId) => {
        const [, rowsObj] = (tablesObj[tableId] = stampNewObj(time));
        objToArray(changedTable, (changedRow, rowId) => {
          const [, cellsObj] = (rowsObj[rowId] = stampNewObj(time));
          objToArray(
            changedRow,
            ([, newCell], cellId) => (cellsObj[cellId] = [time, newCell]),
          );
        });
      });
      objToArray(
        changedValues,
        ([, newValue], valueId) => (valuesObj[valueId] = [time, newValue]),
      );

      return mergeableChanges;
    }
    return transactionMergeableChanges;
  };

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore =>
    disableListening(() => {
      seenHlc(mergeableChanges[0]);
      store.applyChanges(mergeContentOrChanges(mergeableChanges));
    });

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableChanges = getMergeableContent();
    const mergeableChanges2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableChanges);
    return applyMergeableChanges(mergeableChanges2);
  };

  const mergeableStore: IdObj<any> = {
    getId,
    getMergeableContent,

    getMergeableContentHashes,
    getMergeableTableHashes,
    getMergeableTableIdsDiff,
    getMergeableRowHashes,
    getMergeableRowIdsDiff,
    getMergeableCellHashes,
    getMergeableTablesChanges,
    getMergeableValuesHashes,
    getMergeableValuesChanges,
    setMergeableContent,
    getTransactionMergeableChanges,
    applyMergeableChanges,
    merge,
  };

  (store as any).setInternalListeners(
    preFinishTransaction,
    postFinishTransaction,
  );

  objToArray(
    store as IdObj<any>,
    (method, name) =>
      (mergeableStore[name] =
        // fluent methods
        strStartsWith(name, 'set') ||
        strStartsWith(name, 'del') ||
        strStartsWith(name, 'apply') ||
        strEndsWith(name, 'Transaction') ||
        name == 'callListener'
          ? (...args: any[]) => {
              method(...args);
              return mergeableStore;
            }
          : strStartsWith(name, 'add') && strEndsWith(name, 'Listener')
            ? (...args: any[]) => {
                const listenerArg = LISTENER_ARGS[slice(name, 3, -8)] ?? 0;
                const listener = args[listenerArg];
                args[listenerArg] = (_store: Store, ...args: any[]) =>
                  listener(mergeableStore, ...args);
                return method(...args);
              }
            : method),
  );
  return objFreeze(mergeableStore) as MergeableStore;
}) as typeof createMergeableStoreDecl;
