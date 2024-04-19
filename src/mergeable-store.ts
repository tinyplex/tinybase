import {
  CellHashes,
  ContentHashes,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  RowHashes,
  Stamp,
  TableHashes,
  TablesStamp,
  Time,
  ValuesHashes,
  ValuesStamp,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {
  CellOrUndefined,
  Changes,
  Content,
  Store,
  ValueOrUndefined,
} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {
  IdObj,
  objEnsure,
  objForEach,
  objFreeze,
  objHas,
  objIsEmpty,
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
  getLatestTime,
  getStampHash,
  hashIdAndHash,
  newStamp,
  replaceTimeHash,
  stampCloneWithoutHash,
  stampMapToObjWithHash,
  stampMapToObjWithoutHash,
  stampNewMap,
  stampNewObj,
  stampUpdate,
  stampValidate,
} from './mergeable-store/stamps';
import {
  ifNotUndefined,
  isArray,
  isUndefined,
  size,
  slice,
} from './common/other';
import {mapEnsure, mapForEach, mapGet, mapToObj} from './common/map';
import {Id} from './types/common';
import {createStore} from './store';
import {getHash} from './mergeable-store/hash';
import {getHlcFunctions} from './mergeable-store/hlc';
import {isCellOrValueOrNullOrUndefined} from './common/cell';
import {jsonStringWithMap} from './common/json';

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

type ContentStampMap = [
  tablesStampMap: TablesStampMap,
  valuesStampMap: ValuesStampMap,
];

const newContentStampMap = (time = EMPTY_STRING): ContentStampMap => [
  stampNewMap(time),
  stampNewMap(time),
];

const validateMergeableContent = (
  mergeableContent: MergeableContent,
): boolean =>
  isArray(mergeableContent) &&
  size(mergeableContent) == 2 &&
  stampValidate(mergeableContent[0], (tableStamps) =>
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
                    stampValidate(cellStamp, isCellOrValueOrNullOrUndefined),
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
  stampValidate(mergeableContent[1], (values) =>
    objValidate(
      values,
      (value) => stampValidate(value, isCellOrValueOrNullOrUndefined),
      undefined,
      1,
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
    isChanges: 0 | 1 = 0,
  ): Changes => {
    const tablesChanges = {};
    const valuesChanges = {};
    const [
      [tablesObj, incomingTablesTime = EMPTY_STRING, incomingTablesHash = 0],
      values,
    ] = contentOrChanges as typeof isChanges extends 1
      ? MergeableContent
      : MergeableChanges;
    const [tablesStampMap, valuesStampMap] = contentStampMap;
    const [tableStampMaps, oldTablesTime, oldTablesHash] = tablesStampMap;

    let tablesHash = isChanges ? incomingTablesHash : oldTablesHash;
    let tablesTime = incomingTablesTime;
    objForEach(
      tablesObj,
      (
        [rowsObj, incomingTableTime = EMPTY_STRING, incomingTableHash = 0],
        tableId,
      ) => {
        const tableStampMap = mapEnsure<Id, TableStampMap>(
          tableStampMaps,
          tableId,
          stampNewMap,
        );
        const [rowStampMaps, oldTableTime, oldTableHash] = tableStampMap;
        let tableHash = isChanges ? incomingTableHash : oldTableHash;
        let tableTime = incomingTableTime;
        objForEach(rowsObj, (row, rowId) => {
          const [rowTime, oldRowHash, rowHash] = mergeCellsOrValues(
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
            isChanges,
          );

          tableHash ^= isChanges
            ? 0
            : (oldRowHash ? hashIdAndHash(rowId, oldRowHash) : 0) ^
              hashIdAndHash(rowId, rowHash);
          tableTime = getLatestTime(tableTime, rowTime);
        });

        tableHash ^= isChanges
          ? 0
          : replaceTimeHash(oldTableTime, incomingTableTime);
        stampUpdate(tableStampMap, tableHash, incomingTableTime);

        tablesHash ^= isChanges
          ? 0
          : (oldTableHash ? hashIdAndHash(tableId, oldTableHash) : 0) ^
            hashIdAndHash(tableId, tableStampMap[2]);
        tablesTime = getLatestTime(tablesTime, tableTime);
      },
    );

    tablesHash ^= isChanges
      ? 0
      : replaceTimeHash(oldTablesTime, incomingTablesTime);
    stampUpdate(tablesStampMap, tablesHash, incomingTablesTime);

    const [valuesTime] = mergeCellsOrValues(
      values,
      valuesStampMap,
      valuesChanges,
      isChanges,
    );

    seenHlc(getLatestTime(tablesTime, valuesTime));
    return [tablesChanges, valuesChanges, 1];
  };

  const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
    things: typeof isChanges extends 1
      ? Stamp<IdObj<Stamp<Thing, true>>, true>
      : Stamp<IdObj<Stamp<Thing>>>,
    thingsStampMap: StampMap<Stamp<Thing, true>>,
    thingsChanges: {[thingId: Id]: Thing},
    isChanges: 0 | 1,
  ): [thingsTime: Time, oldThingsHash: number, newThingsHash: number] => {
    const [
      thingsObj,
      incomingThingsTime = EMPTY_STRING,
      incomingThingsHash = 0,
    ] = things;
    const [thingStampMaps, oldThingsTime, oldThingsHash] = thingsStampMap;

    let thingsTime = incomingThingsTime;
    let thingsHash = isChanges ? incomingThingsHash : oldThingsHash;

    objForEach(
      thingsObj,
      ([thing, thingTime, incomingThingHash = 0], thingId) => {
        const thingStampMap = mapEnsure<Id, Stamp<Thing, true>>(
          thingStampMaps,
          thingId,
          () => [undefined as any, EMPTY_STRING, 0],
        );
        const [, oldThingTime, oldThingHash] = thingStampMap;

        if (!oldThingTime || thingTime! > oldThingTime) {
          stampUpdate(
            thingStampMap,
            isChanges
              ? incomingThingHash
              : getHash(jsonStringWithMap(thing ?? null) + ':' + thingTime),
            thingTime!,
          );
          thingStampMap[0] = thing;
          thingsChanges[thingId] = thing;
          thingsHash ^= isChanges
            ? 0
            : hashIdAndHash(thingId, oldThingHash) ^
              hashIdAndHash(thingId, thingStampMap[2]);
          thingsTime = getLatestTime(thingsTime, thingTime!);
        }
      },
    );

    thingsHash ^= isChanges
      ? 0
      : replaceTimeHash(oldThingsTime, incomingThingsTime);
    stampUpdate(thingsStampMap, thingsHash, incomingThingsTime);

    return [thingsTime, oldThingsHash, thingsStampMap[2]];
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
    stampMapToObjWithHash(contentStampMap[0], (tableStampMap) =>
      stampMapToObjWithHash(tableStampMap, (rowStampMap) =>
        stampMapToObjWithHash(rowStampMap),
      ),
    ),
    stampMapToObjWithHash(contentStampMap[1]),
  ];

  const getMergeableContentHashes = (): ContentHashes => [
    contentStampMap[0][2],
    contentStampMap[1][2],
  ];

  const getMergeableTableHashes = (): TableHashes =>
    mapToObj(contentStampMap[0][0], getStampHash);

  const getMergeableTableDiff = (
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differentTableHashes: TableHashes] => {
    const newTables: TablesStamp = stampNewObj(contentStampMap[0][1]);
    const differentTableHashes: TableHashes = {};
    mapForEach(
      contentStampMap[0][0],
      (tableId, [tableStampMap, tableTime, hash]) =>
        objHas(otherTableHashes, tableId)
          ? hash != otherTableHashes[tableId]
            ? (differentTableHashes[tableId] = hash)
            : 0
          : (newTables[0][tableId] = stampMapToObjWithoutHash(
              [tableStampMap, tableTime],
              (rowStampMap) => stampMapToObjWithoutHash(rowStampMap),
            )),
    );
    return [newTables, differentTableHashes];
  };

  const getMergeableRowHashes = (otherTableHashes: TableHashes): RowHashes => {
    const rowHashes: RowHashes = {};
    objForEach(otherTableHashes, (otherTableHash, tableId) =>
      ifNotUndefined(
        mapGet(contentStampMap[0][0], tableId),
        ([rowStampMaps, , tableHash]) =>
          tableHash != otherTableHash
            ? mapForEach(
                rowStampMaps,
                (rowId, [, , rowHash]) =>
                  (objEnsure(rowHashes, tableId, objNew)[rowId] = rowHash),
              )
            : 0,
      ),
    );
    return rowHashes;
  };

  const getMergeableRowDiff = (
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differentRowHashes: RowHashes] => {
    const newRows: TablesStamp = stampNewObj(contentStampMap[0][1]);
    const differentRowHashes: RowHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      mapForEach(
        mapGet(contentStampMap[0][0], tableId)?.[0],
        (rowId, [rowStampMap, rowTime, hash]) =>
          objHas(otherRowHashes, rowId)
            ? hash !== otherRowHashes[rowId]
              ? (objEnsure(differentRowHashes, tableId, objNew)[rowId] = hash)
              : 0
            : (objEnsure(newRows[0], tableId, stampNewObj)[0][rowId] =
                stampMapToObjWithoutHash([rowStampMap, rowTime])),
      ),
    );
    return [newRows, differentRowHashes];
  };

  const getMergeableCellHashes = (
    otherTableRowHashes: RowHashes,
  ): CellHashes => {
    const cellHashes: CellHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      ifNotUndefined(mapGet(contentStampMap[0][0], tableId), ([rowStampMaps]) =>
        objForEach(otherRowHashes, (otherRowHash, rowId) =>
          ifNotUndefined(
            mapGet(rowStampMaps, rowId),
            ([cellStampMaps, , rowHash]) =>
              rowHash !== otherRowHash
                ? mapForEach(
                    cellStampMaps,
                    (cellId, [, , cellHash]) =>
                      (objEnsure(
                        objEnsure<CellHashes[Id]>(cellHashes, tableId, objNew),
                        rowId,
                        objNew,
                      )[cellId] = cellHash),
                  )
                : 0,
          ),
        ),
      ),
    );
    return cellHashes;
  };

  const getMergeableCellDiff = (
    otherTableRowCellHashes: CellHashes,
  ): TablesStamp => {
    const [[tableStampMaps, tablesTime]] = contentStampMap;
    const tablesObj: TablesStamp[0] = {};
    objForEach(otherTableRowCellHashes, (otherRowCellHashes, tableId) =>
      objForEach(otherRowCellHashes, (otherCellHashes, rowId) =>
        ifNotUndefined(
          mapGet(tableStampMaps, tableId),
          ([rowStampMaps, tableTime]) =>
            ifNotUndefined(
              mapGet(rowStampMaps, rowId),
              ([cellStampMaps, rowTime]) =>
                mapForEach(cellStampMaps, (cellId, [cell, cellTime, hash]) =>
                  hash !== otherCellHashes[cellId]
                    ? (objEnsure(
                        objEnsure(tablesObj, tableId, () =>
                          stampNewObj(tableTime),
                        )[0],
                        rowId,
                        () => stampNewObj(rowTime),
                      )[0][cellId] = [cell, cellTime])
                    : 0,
                ),
            ),
        ),
      ),
    );
    return newStamp(tablesObj, tablesTime);
  };

  const getMergeableValuesHashes = (): ValuesHashes =>
    mapToObj(contentStampMap[1][0], getStampHash);

  const getMergeableValueDiff = (relativeTo: ValuesHashes): ValuesStamp => {
    const [, [valueStampMaps, valuesTime]] = contentStampMap;
    const values = mapToObj(
      valueStampMaps,
      stampCloneWithoutHash,
      ([, , hash], valueId) => hash == relativeTo?.[valueId],
    );
    return newStamp(values, valuesTime);
  };

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore =>
    disableListening(() =>
      validateMergeableContent(mergeableContent)
        ? store.transaction(() => {
            store.delTables().delValues();
            contentStampMap = newContentStampMap();
            store.applyChanges(mergeContentOrChanges(mergeableContent, 1));
          })
        : 0,
    );

  const setDefaultContent = (content: Content): MergeableStore => {
    transactionTime = EMPTY_STRING;
    store.setContent(content);
    return mergeableStore as MergeableStore;
  };

  const getTransactionMergeableChanges = (): MergeableChanges => {
    if (isUndefined(transactionMergeableChanges)) {
      const [, , changedCells, , changedValues] = store.getTransactionLog();
      const time =
        !objIsEmpty(changedCells) || !objIsEmpty(changedValues)
          ? transactionTime ?? (transactionTime = getHlc())
          : EMPTY_STRING;
      const changes: MergeableChanges = [stampNewObj(), stampNewObj(), 1];

      const [[tablesObj], [valuesObj]] = changes;

      objToArray(changedCells, (changedTable, tableId) => {
        const [rowsObj] = (tablesObj[tableId] = stampNewObj());
        objToArray(changedTable, (changedRow, rowId) => {
          const [cellsObj] = (rowsObj[rowId] = stampNewObj());
          objToArray(
            changedRow,
            ([, newCell], cellId) => (cellsObj[cellId] = [newCell, time]),
          );
        });
      });
      objToArray(
        changedValues,
        ([, newValue], valueId) => (valuesObj[valueId] = [newValue, time]),
      );

      return changes;
    }
    return transactionMergeableChanges;
  };

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore =>
    disableListening(() =>
      store.applyChanges(mergeContentOrChanges(mergeableChanges)),
    );

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
    getMergeableTableDiff,
    getMergeableRowHashes,
    getMergeableRowDiff,
    getMergeableCellHashes,
    getMergeableCellDiff,
    getMergeableValuesHashes,
    getMergeableValueDiff,
    setMergeableContent,
    setDefaultContent,
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
