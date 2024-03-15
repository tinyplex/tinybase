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
  hashIdAndHash,
  hashStampMapToHashStampObj,
  hashStampNewMap,
  hashStampNewThing,
  hashStampToHashStamp,
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

  const mergeMergeableContentOrChanges = (
    contentOrChanges: MergeableContent | MergeableChanges,
    _asContent: 0 | 1 = 0,
  ): Changes => {
    const tablesChanges = {};
    const valuesChanges = {};

    const [, [[tablesTime, tablesObj], values]] = contentOrChanges;
    const [, [tablesHsm, valuesHsm]] = contentHsm;
    const [oldTablesTime, tableHsms, oldTablesHash] = tablesHsm;

    if (tablesTime) {
      let tablesHash =
        oldTablesHash ^
        (tablesTime > oldTablesTime
          ? (oldTablesTime ? getHash(oldTablesTime) : 0) ^ getHash(tablesTime)
          : 0);

      objForEach(tablesObj, ([tableTime, rowsObj], tableId) => {
        const tableHsm = mapEnsure<Id, TableHsm>(
          tableHsms,
          tableId,
          hashStampNewMap,
        );
        const [oldTableTime, rowHsms, oldTableHash] = tableHsm;
        let tableHash =
          oldTableHash ^
          (tableTime > oldTableTime
            ? (oldTableTime ? getHash(oldTableTime) : 0) ^ getHash(tableTime)
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
          );
          tableHash ^=
            (oldRowHash ? hashIdAndHash(rowId, oldRowHash) : 0) ^
            hashIdAndHash(rowId, rowHash);
        });
        updateHashStamp(tableHsm, tableHash, tableTime);
        tablesHash ^=
          (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
          hashIdAndHash(tableId, tableHsm[2]);
      });
      updateHashStamp(tablesHsm, tablesHash, tablesTime);
    }

    mergeCellsOrValues(values, valuesHsm, valuesChanges);

    updateHashStamp(
      contentHsm,
      tablesHsm[2] ^ valuesHsm[2],
      contentOrChanges[0],
    );

    return [tablesChanges, valuesChanges];
  };

  const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
    things: Stamp<IdObj<Stamp<Thing>>>,
    thingsHsm: HashStamp<IdMap<HashStamp<Thing>>>,
    thingsChanges: {[thingId: Id]: Thing},
  ): [oldThingsHash: number, newThingsHash: number] => {
    const [thingsTime, thingsObj] = things;
    const [oldThingsTime, thingHsms, oldThingsHash] = thingsHsm;
    if (thingsTime) {
      let thingsHash =
        oldThingsHash ^
        (thingsTime > oldThingsTime
          ? (oldThingsTime ? getHash(oldThingsTime) : 0) ^ getHash(thingsTime)
          : 0);

      objForEach(thingsObj, ([thingTime, thing], thingId) => {
        const thingHsm = mapEnsure<Id, HashStamp<Thing>>(
          thingHsms,
          thingId,
          hashStampNewThing,
        );
        const [oldThingTime, , oldThingHash] = thingHsm;

        if (thingTime > oldThingTime) {
          updateHashStamp(
            thingHsm,
            getHash(jsonString(thing ?? null) + ':' + thingTime),
            thingTime,
          );
          thingHsm[1] = thing;
          thingsChanges[thingId] = thing;
          thingsHash ^=
            hashIdAndHash(thingId, oldThingHash) ^
            hashIdAndHash(thingId, thingHsm[2]);
        }
      });

      updateHashStamp(thingsHsm, thingsHash, thingsTime);
    }
    return [oldThingsHash, thingsHsm[2]];
  };

  const preFinishTransaction = () => {
    if (listening) {
      transactionMergeableChanges = getTransactionMergeableChanges();
      mergeMergeableContentOrChanges(transactionMergeableChanges);
    }
  };

  const postFinishTransaction = () =>
    (transactionTime = transactionMergeableChanges = undefined);

  const getMergeableContent = <AsChanges extends boolean = false>(
    asChanges: AsChanges = false as any,
  ) =>
    hashStampToHashStamp(
      contentHsm,
      ([tables, values]) => [
        hashStampMapToHashStampObj(tables, asChanges, (table) =>
          hashStampMapToHashStampObj(table, asChanges, (row) =>
            hashStampMapToHashStampObj(row, asChanges),
          ),
        ),
        hashStampMapToHashStampObj(values, asChanges),
      ],
      asChanges,
    ) as AsChanges extends true ? MergeableChanges : MergeableContent;

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
      store.applyChanges(mergeMergeableContentOrChanges(mergeableContent, 1)),
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
    mergeableChanges: MergeableChanges,
  ): MergeableStore => {
    seenHlc(mergeableChanges[0]);
    disableListening(() =>
      store.applyChanges(mergeMergeableContentOrChanges(mergeableChanges)),
    );
    return mergeableStore as MergeableStore;
  };

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableChanges = getMergeableContent(true);
    const mergeableChanges2 = mergeableStore2.getMergeableContent(true);
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
