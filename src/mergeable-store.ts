import {CellOrUndefined, Changes, Store, ValueOrUndefined} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {
  Hash,
  HashStamp,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Stamp,
  Time,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {IdMap, mapEnsure, mapGet} from './common/map';
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
  cloneHashStamp,
  hashIdAndHash,
  hashStampMap,
  hashStampMapToObj,
  hashStampNewMap,
  hashStampNewThing,
  stampNew,
  stampNewObj,
  updateHashStamp,
} from './mergeable-store/stamps';
import {isUndefined, slice} from './common/other';
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

// HSM = HashStampedMap
type TableHsm = HashStamp<IdMap<RowHsm>>;
type RowHsm = HashStamp<IdMap<HashStamp<CellOrUndefined>>>;
type ContentHashStamp = HashStamp<
  [
    tablesHsm: HashStamp<IdMap<TableHsm>>,
    valuesHsm: HashStamp<IdMap<HashStamp<ValueOrUndefined>>>,
  ]
>;

const newContentHsm = (time = EMPTY_STRING): ContentHashStamp => [
  time,
  [hashStampNewMap(time), hashStampNewMap(time)],
  0,
];

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let contentHsm = newContentHsm();
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
    const [, [tablesHsm, valuesHsm]] = contentHsm;
    const [oldTablesTime, tableHsms, oldTablesHash] = tablesHsm;

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
          const tableHsm = mapEnsure<Id, TableHsm>(
            tableHsms,
            tableId,
            hashStampNewMap,
          );
          const [oldTableTime, rowHsms, oldTableHash] = tableHsm;
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
              mapEnsure<Id, RowHsm>(rowHsms, rowId, hashStampNewMap),
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
          updateHashStamp(tableHsm, tableHash, tableTime);
          tablesHash ^= hasHashes
            ? 0
            : (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
              hashIdAndHash(tableId, tableHsm[2]);
        },
      );
      updateHashStamp(tablesHsm, tablesHash, tablesTime);
    }

    mergeCellsOrValues(values, valuesHsm, valuesChanges, hasHashes);

    updateHashStamp(
      contentHsm,
      hasHashes ? incomingContentOrChangesHash : tablesHsm[2] ^ valuesHsm[2],
      contentOrChangesTime,
    );
    return [tablesChanges, valuesChanges];
  };

  const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
    things: HashStamp<IdObj<HashStamp<Thing>>>,
    thingsHsm: HashStamp<IdMap<HashStamp<Thing>>>,
    thingsChanges: {[thingId: Id]: Thing},
    hasHashes: 0 | 1,
  ): [oldThingsHash: number, newThingsHash: number] => {
    const [thingsTime, thingsObj, incomingThingsHash] = things;
    const [oldThingsTime, thingHsms, oldThingsHash] = thingsHsm;
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
          const thingHsm = mapEnsure<Id, HashStamp<Thing>>(
            thingHsms,
            thingId,
            hashStampNewThing,
          );
          const [oldThingTime, , oldThingHash] = thingHsm;

          if (thingTime > oldThingTime) {
            updateHashStamp(
              thingHsm,
              hasHashes
                ? incomingThingHash
                : getHash(jsonString(thing ?? null) + ':' + thingTime),
              thingTime,
            );
            thingHsm[1] = thing;
            thingsChanges[thingId] = thing;
            thingsHash ^= hasHashes
              ? 0
              : hashIdAndHash(thingId, oldThingHash) ^
                hashIdAndHash(thingId, thingHsm[2]);
          }
        },
      );

      updateHashStamp(thingsHsm, thingsHash, thingsTime);
    }
    return [oldThingsHash, thingsHsm[2]];
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
    hashStampMap(contentHsm, 0, ([tablesHsm, valuesHsm]) => [
      hashStampMapToObj(tablesHsm, 0, (tableHsm) =>
        hashStampMapToObj(tableHsm, 0, (rowHsm) =>
          hashStampMapToObj(rowHsm, 0),
        ),
      ),
      hashStampMapToObj(valuesHsm, 0),
    ]) as MergeableContent;

  const getMergeableContentDelta = (
    relativeTo: MergeableContent,
  ): MergeableChanges => {
    if (contentHsm[2] == relativeTo[2]) {
      return stampNew(EMPTY_STRING, [stampNewObj(), stampNewObj()]);
    }
    return hashStampMap(contentHsm, 1, ([tablesHsm, valuesHsm]) => [
      getMergeableTablesDelta(tablesHsm, relativeTo[1][0]),
      getMergeableValuesDelta(valuesHsm, relativeTo[1][1]),
    ]) as MergeableChanges;
  };

  const getMergeableTablesDelta = (
    tablesHsm: HashStamp<
      IdMap<HashStamp<IdMap<HashStamp<IdMap<HashStamp<CellOrUndefined>>>>>>
    >,
    relativeTo: HashStamp<
      IdObj<HashStamp<IdObj<HashStamp<IdObj<HashStamp<CellOrUndefined>>>>>>
    >,
  ): Stamp<IdObj<Stamp<IdObj<Stamp<IdObj<Stamp<CellOrUndefined>>>>>>> => {
    if (tablesHsm[2] == relativeTo[2]) {
      return stampNewObj();
    }
    return hashStampMapToObj(tablesHsm, 1, (tableHsm, tableId) =>
      getMergeableTableDelta(tableHsm, relativeTo[1][tableId]),
    ) as Stamp<IdObj<Stamp<IdObj<Stamp<IdObj<Stamp<CellOrUndefined>>>>>>>;
  };

  const getMergeableTableDelta = (
    tableHsm: HashStamp<IdMap<HashStamp<IdMap<HashStamp<CellOrUndefined>>>>>,
    relativeTo: HashStamp<IdObj<HashStamp<IdObj<HashStamp<CellOrUndefined>>>>>,
  ): Stamp<IdObj<Stamp<IdObj<Stamp<CellOrUndefined>>>>> => {
    if (tableHsm[2] == relativeTo?.[2]) {
      return stampNewObj();
    }
    return hashStampMapToObj(tableHsm, 1, (rowHsm, rowId) =>
      getMergeableRowDelta(rowHsm, relativeTo?.[1][rowId]),
    ) as Stamp<IdObj<Stamp<IdObj<Stamp<CellOrUndefined>>>>>;
  };

  const getMergeableRowDelta = (
    rowHsm: HashStamp<IdMap<HashStamp<CellOrUndefined>>>,
    relativeTo: HashStamp<IdObj<HashStamp<CellOrUndefined>>>,
  ): Stamp<IdObj<Stamp<CellOrUndefined>>> => {
    if (rowHsm[2] == relativeTo?.[2]) {
      return stampNewObj();
    }
    return hashStampMapToObj(rowHsm, 1, (cellHsm, cellId) =>
      getMergeableCellDelta(cellHsm, relativeTo?.[1][cellId]),
    ) as Stamp<IdObj<Stamp<CellOrUndefined>>>;
  };

  const getMergeableCellDelta = (
    cellHsm: HashStamp<CellOrUndefined>,
    relativeTo: HashStamp<CellOrUndefined>,
  ): Stamp<CellOrUndefined> => {
    if (cellHsm[2] == relativeTo?.[2]) {
      return stampNew();
    }
    return cloneHashStamp(cellHsm, '', 1) as Stamp<CellOrUndefined>;
  };

  const getMergeableValuesDelta = (
    valuesHsm: HashStamp<IdMap<HashStamp<ValueOrUndefined>>>,
    relativeTo: HashStamp<IdObj<HashStamp<ValueOrUndefined>>>,
  ): Stamp<IdObj<Stamp<ValueOrUndefined>>> => {
    if (valuesHsm[2] == relativeTo?.[2]) {
      return stampNewObj();
    }
    return hashStampMapToObj(valuesHsm, 1, (valueHsm, valueId) =>
      getMergeableValueDelta(valueHsm, relativeTo?.[1][valueId]),
    ) as Stamp<IdObj<Stamp<CellOrUndefined>>>;
  };

  const getMergeableValueDelta = (
    valueHsm: HashStamp<ValueOrUndefined>,
    relativeTo: HashStamp<ValueOrUndefined>,
  ): Stamp<ValueOrUndefined> => {
    if (valueHsm[2] == relativeTo?.[2]) {
      return stampNew();
    }
    return cloneHashStamp(valueHsm, '', 1) as Stamp<ValueOrUndefined>;
  };

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore => {
    disableListening(() =>
      store.transaction(() => {
        store.delTables().delValues();
        contentHsm = newContentHsm();
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

  const getContentHash = (): Hash => contentHsm[2];

  const getTablesHash = (): Hash => contentHsm[1][0][2];

  const getTableHash = (tableId: Id): Hash =>
    mapGet(contentHsm[1][0][1], tableId)?.[2] ?? 0;

  const getRowHash = (tableId: Id, rowId: Id): Hash =>
    mapGet(mapGet(contentHsm[1][0][1], tableId)?.[1], rowId)?.[2] ?? 0;

  const getCellHash = (tableId: Id, rowId: Id, cellId: Id): Hash =>
    mapGet(
      mapGet(mapGet(contentHsm[1][0][1], tableId)?.[1], rowId)?.[1],
      cellId,
    )?.[2] ?? 0;

  const getValuesHash = (): Hash => contentHsm[1][1][2];

  const getValueHash = (valueId: Id): Hash =>
    mapGet(contentHsm[1][1][1], valueId)?.[2] ?? 0;

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
