import {CellOrUndefined, Changes, Store, ValueOrUndefined} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {
  Hash,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  RowStamp,
  Stamp,
  TableStamp,
  TablesStamp,
  Time,
  ValuesStamp,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {
  IdObj,
  objEnsure,
  objForEach,
  objFreeze,
  objIsEmpty,
  objNew,
  objToArray,
} from './common/obj';
import {
  RowStampMap,
  StampMap,
  TableStampMap,
  TablesStampMap,
  ValuesStampMap,
  hashIdAndHash,
  hashStampMap,
  hashStampMapToObj,
  hashStampNewMap,
  hashStampNewThing,
  stampClone,
  stampNew,
  stampNewObj,
  updateStamp,
} from './mergeable-store/stamps';
import {isUndefined, slice} from './common/other';
import {mapEnsure, mapGet, mapToObj} from './common/map';
import {Id} from './types/common';
import {createStore} from './store';
import {getHash} from './mergeable-store/hash';
import {getHlcFunctions} from './mergeable-store/hlc';
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
  [hashStampNewMap(time), hashStampNewMap(time)],
  0,
];

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let contentStampMap = newContentStampMap();
  let transactionTime: Time | undefined;
  let transactionMergeableChanges: MergeableChanges | undefined;
  const [getHlc, seenHlc] = getHlcFunctions(id);
  const store = createStore();

  const disableListening = (actions: () => void) => {
    const wasListening = listening;
    listening = 0;
    actions();
    listening = wasListening;
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
            hashStampNewMap,
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
              mapEnsure<Id, RowStampMap>(rowStampMaps, rowId, hashStampNewMap),
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
          updateStamp(tableStampMap, tableHash, tableTime);
          tablesHash ^= hasHashes
            ? 0
            : (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
              hashIdAndHash(tableId, tableStampMap[2]);
        },
      );
      updateStamp(tablesStampMap, tablesHash, tablesTime);
    }

    mergeCellsOrValues(values, valuesStampMap, valuesChanges, hasHashes);

    updateStamp(
      contentStampMap,
      hasHashes
        ? incomingContentOrChangesHash
        : tablesStampMap[2] ^ valuesStampMap[2],
      contentOrChangesTime,
    );
    return [tablesChanges, valuesChanges];
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
            hashStampNewThing,
          );
          const [oldThingTime, , oldThingHash] = thingStampMap;

          if (thingTime > oldThingTime) {
            updateStamp(
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

      updateStamp(thingsStampMap, thingsHash, thingsTime);
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

  const getMergeableContent = (): MergeableContent =>
    hashStampMap(contentStampMap, 0, ([tablesStampMap, valuesStampMap]) => [
      hashStampMapToObj(tablesStampMap, 0, (tableStampMap) =>
        hashStampMapToObj(tableStampMap, 0, (rowStampMap) =>
          hashStampMapToObj(rowStampMap, 0),
        ),
      ),
      hashStampMapToObj(valuesStampMap, 0),
    ]) as MergeableContent;

  const getMergeableContentDelta = (
    relativeTo: MergeableContent,
  ): MergeableChanges =>
    contentStampMap[2] == relativeTo[2]
      ? stampNew(EMPTY_STRING, [stampNewObj(), stampNewObj()])
      : (hashStampMap(
          contentStampMap,
          1,
          ([tablesStampMap, valuesStampMap]) => [
            getMergeableTablesDelta(tablesStampMap, relativeTo[1][0]),
            getMergeableValuesDelta(valuesStampMap, relativeTo[1][1]),
          ],
        ) as MergeableChanges);

  const getMergeableTablesDelta = (
    tablesStampMap: TablesStampMap,
    relativeTo: TablesStamp<true>,
  ): TablesStamp =>
    tablesStampMap[2] == relativeTo[2]
      ? stampNewObj()
      : [
          tablesStampMap[0],
          mapToObj(
            tablesStampMap[1],
            (tableStampMap, tableId) =>
              getMergeableTableDelta(tableStampMap, relativeTo?.[1]?.[tableId]),
            (tableStampMap, tableId) =>
              tableStampMap[2] === relativeTo?.[1]?.[tableId]?.[2],
          ),
        ];

  const getMergeableTableDelta = (
    tableStampMap: TableStampMap,
    relativeTo: TableStamp<true>,
  ): TableStamp => [
    tableStampMap[0],
    mapToObj(
      tableStampMap[1],
      (rowStampMap, rowId) =>
        getMergeableRowDelta(rowStampMap, relativeTo?.[1]?.[rowId]),
      (rowStampMap, rowId) => rowStampMap[2] === relativeTo?.[1]?.[rowId]?.[2],
    ),
  ];

  const getMergeableRowDelta = (
    rowStampMap: RowStampMap,
    relativeTo: RowStamp<true>,
  ): RowStamp => [
    rowStampMap[0],
    mapToObj(
      rowStampMap[1],
      stampClone,
      (cellStampMap, cellId) =>
        cellStampMap[2] === relativeTo?.[1]?.[cellId]?.[2],
    ),
  ];

  const getMergeableValuesDelta = (
    valuesStampMap: ValuesStampMap,
    relativeTo: ValuesStamp<true>,
  ): ValuesStamp =>
    valuesStampMap[2] == relativeTo?.[2]
      ? stampNewObj()
      : [
          valuesStampMap[0],
          mapToObj(
            valuesStampMap[1],
            stampClone,
            (valueStampMap, valueId) =>
              valueStampMap[2] === relativeTo?.[1]?.[valueId]?.[2],
          ),
        ];

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore => {
    disableListening(() =>
      store.transaction(() => {
        store.delTables().delValues();
        contentStampMap = newContentStampMap();
      }),
    );
    seenHlc(mergeableContent[0]);
    disableListening(() =>
      store.applyChanges(mergeContentOrChanges(mergeableContent, 1)),
    );
    return mergeableStore as MergeableStore;
  };

  const getTransactionMergeableChanges = (): MergeableChanges => {
    if (isUndefined(transactionMergeableChanges)) {
      const [, , changedCells, , changedValues] = store.getTransactionLog();
      const time =
        !objIsEmpty(changedCells) || !objIsEmpty(changedValues)
          ? transactionTime ?? (transactionTime = getHlc())
          : EMPTY_STRING;
      const mergeableChanges: MergeableChanges = stampNew(time, [
        stampNewObj(objIsEmpty(changedCells) ? EMPTY_STRING : time),
        stampNewObj(objIsEmpty(changedValues) ? EMPTY_STRING : time),
      ]);
      const [[, tablesObj], [, valuesObj]] = mergeableChanges[1];

      objToArray(changedCells, (changedTable, tableId) => {
        const [, rowsObj] = (tablesObj[tableId] = stampNewObj(time));
        objToArray(changedTable, (changedRow, rowId) => {
          const [, cellsObj] = (rowsObj[rowId] = stampNewObj(time));
          objToArray(
            changedRow,
            ([, newCell], cellId) =>
              (cellsObj[cellId] = stampNew(time, newCell)),
          );
        });
      });
      objToArray(
        changedValues,
        ([, newValue], valueId) =>
          (valuesObj[valueId] = stampNew(time, newValue)),
      );

      return mergeableChanges;
    }
    return transactionMergeableChanges;
  };

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore => {
    seenHlc(mergeableChanges[0]);
    disableListening(() =>
      store.applyChanges(mergeContentOrChanges(mergeableChanges)),
    );
    return mergeableStore as MergeableStore;
  };

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableChanges = getMergeableContent();
    const mergeableChanges2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableChanges);
    return applyMergeableChanges(mergeableChanges2);
  };

  const getContentHash = (): Hash => contentStampMap[2];

  const getTablesHash = (): Hash => contentStampMap[1][0][2];

  const getTableHash = (tableId: Id): Hash =>
    mapGet(contentStampMap[1][0][1], tableId)?.[2] ?? 0;

  const getRowHash = (tableId: Id, rowId: Id): Hash =>
    mapGet(mapGet(contentStampMap[1][0][1], tableId)?.[1], rowId)?.[2] ?? 0;

  const getCellHash = (tableId: Id, rowId: Id, cellId: Id): Hash =>
    mapGet(
      mapGet(mapGet(contentStampMap[1][0][1], tableId)?.[1], rowId)?.[1],
      cellId,
    )?.[2] ?? 0;

  const getValuesHash = (): Hash => contentStampMap[1][1][2];

  const getValueHash = (valueId: Id): Hash =>
    mapGet(contentStampMap[1][1][1], valueId)?.[2] ?? 0;

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    getMergeableContentDelta,
    setMergeableContent,
    getTransactionMergeableChanges,
    applyMergeableChanges,
    merge,
    getContentHash,
    getTablesHash,
    getTableHash,
    getRowHash,
    getCellHash,
    getValuesHash,
    getValueHash,
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
