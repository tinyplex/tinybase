import type {Id} from '../../@types/common/index.d.ts';
import type {
  CellHashes,
  ContentHashes,
  GetNow,
  MergeableChanges,
  MergeableContent,
  RowHashes,
  RowStamp,
  TableHashes,
  TableStamp,
  TablesStamp,
  ValueHashes,
  ValuesStamp,
} from '../../@types/mergeables/index.d.ts';
import type {
  MergeableStore,
  createMergeableStore as createMergeableStoreDecl,
} from '../../@types/mergeables/mergeable-store/index.d.ts';
import type {
  CellOrUndefined,
  Content,
  Store,
  ValueOrUndefined,
} from '../../@types/store/index.d.ts';
import {collClear, collForEach} from '../../common/coll.ts';
import {getHlcFunctions} from '../../common/hlc.ts';
import {mapEnsure, mapNew} from '../../common/map.ts';
import {validateMergeableContent} from '../../common/mergeable.ts';
import {
  IdObj,
  objEnsure,
  objForEach,
  objFreeze,
  objGet,
  objHas,
  objMap,
  objNew,
} from '../../common/obj.ts';
import {ifNotUndefined, noop, slice} from '../../common/other.ts';
import {IdSet, IdSet3, setAdd, setNew} from '../../common/set.ts';
import {
  TablesStampObj,
  ValuesStampObj,
  getStampHash,
  stampMapToObjWithHash,
  stampMapToObjWithoutHash,
  stampNew,
  stampNewObj,
  stampNewObj2,
  stampNewWithHash,
} from '../../common/stamps.ts';
import {
  ADD,
  DEL,
  EMPTY_STRING,
  LISTENER,
  SET,
  TRANSACTION,
  strEndsWith,
  strStartsWith,
} from '../../common/strings.ts';
import {createStore} from '../../store/index.ts';
import {getMergeableFunctions} from '../index.ts';

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

const newContentStampObj = (
  time = EMPTY_STRING,
): [tablesStampObj: TablesStampObj, valuesStampObj: ValuesStampObj] => [
  stampNewObj2(time),
  stampNewObj2(time),
];

export const createMergeableStore = ((
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore => {
  let listeningToRawStoreChanges = 1;
  let contentStampMap = newContentStampObj();
  let defaultingContent: 0 | 1 = 0;
  const touchedCells: IdSet3 = mapNew();
  const touchedValues: IdSet = setNew();
  const [getHlc, seenHlc] = getHlcFunctions(uniqueId, getNow);
  const store = createStore();

  const disableListeningToRawStoreChanges = (
    actions: () => void,
  ): MergeableStore => {
    const wasListening = listeningToRawStoreChanges;
    listeningToRawStoreChanges = 0;
    actions();
    listeningToRawStoreChanges = wasListening;
    return mergeableStore as MergeableStore;
  };

  const postFinishTransaction = () => {
    collClear(touchedCells);
    collClear(touchedValues);
  };

  const cellChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    newCell: CellOrUndefined,
  ) => {
    setAdd(
      mapEnsure(
        mapEnsure(touchedCells, tableId, mapNew<Id, IdSet>),
        rowId,
        setNew<Id>,
      ),
      cellId,
    );
    if (listeningToRawStoreChanges) {
      mergeContentOrChanges([
        [
          {
            [tableId]: [
              {
                [rowId]: [
                  {
                    [cellId]: [
                      newCell,
                      defaultingContent ? EMPTY_STRING : getHlc(),
                    ],
                  },
                ],
              },
            ],
          },
        ],
        [{}],
        1,
      ]);
    }
  };

  const valueChanged = (valueId: Id, newValue: ValueOrUndefined) => {
    setAdd(touchedValues, valueId);
    if (listeningToRawStoreChanges) {
      mergeContentOrChanges([
        [{}],
        [{[valueId]: [newValue, defaultingContent ? EMPTY_STRING : getHlc()]}],
        1,
      ]);
    }
  };

  // ---

  const getMergeableContent = (): MergeableContent => [
    stampMapToObjWithHash(contentStampMap[0], (tableStampMap) =>
      stampMapToObjWithHash(tableStampMap, (rowStampMap) =>
        stampMapToObjWithHash(rowStampMap),
      ),
    ),
    stampMapToObjWithHash(contentStampMap[1]),
  ];

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore =>
    disableListeningToRawStoreChanges(() =>
      validateMergeableContent(mergeableContent)
        ? store.transaction(() => {
            store.delTables().delValues();
            contentStampMap = newContentStampObj();
            store.applyChanges(mergeContentOrChanges(mergeableContent, 1));
          })
        : 0,
    );

  const setDefaultContent = (
    content: Content | (() => Content),
  ): MergeableStore => {
    store.transaction(() => {
      defaultingContent = 1;
      store.setContent(content);
      defaultingContent = 0;
    });
    return mergeableStore as MergeableStore;
  };

  const getTransactionMergeableChanges = (
    withHashes = false,
  ): MergeableChanges<typeof withHashes> => {
    const [
      [tableStampMaps, tablesTime, tablesHash],
      [valueStampMaps, valuesTime, valuesHash],
    ] = contentStampMap;

    const newStamp = withHashes ? stampNewWithHash : stampNew;

    const tablesObj: TablesStamp<typeof withHashes>[0] = {};
    collForEach(touchedCells, (touchedTable, tableId) =>
      ifNotUndefined(
        objGet(tableStampMaps, tableId),
        ([rowStampMaps, tableTime, tableHash]) => {
          const tableObj: TableStamp<typeof withHashes>[0] = {};
          collForEach(touchedTable, (touchedRow, rowId) =>
            ifNotUndefined(
              objGet(rowStampMaps, rowId),
              ([cellStampMaps, rowTime, rowHash]) => {
                const rowObj: RowStamp<typeof withHashes>[0] = {};
                collForEach(touchedRow, (cellId) => {
                  ifNotUndefined(
                    objGet(cellStampMaps, cellId),
                    ([cell, time, hash]) =>
                      (rowObj[cellId] = newStamp(cell, time, hash)),
                  );
                });
                tableObj[rowId] = newStamp(rowObj, rowTime, rowHash);
              },
            ),
          );
          tablesObj[tableId] = newStamp(tableObj, tableTime, tableHash);
        },
      ),
    );

    const valuesObj: ValuesStamp<typeof withHashes>[0] = {};
    collForEach(touchedValues, (valueId) =>
      ifNotUndefined(
        objGet(valueStampMaps, valueId),
        ([value, time, hash]) =>
          (valuesObj[valueId] = newStamp(value, time, hash)),
      ),
    );

    return [
      newStamp(tablesObj, tablesTime, tablesHash),
      newStamp(valuesObj, valuesTime, valuesHash),
      1,
    ];
  };

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableChanges = getMergeableContent();
    const mergeableChanges2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableChanges as any);
    return applyMergeableChanges(mergeableChanges2 as any);
  };

  // --- Mergeable Interface

  const loadTablesStampMap = (
    _relevantTablesMask: MergeableChanges[0] | MergeableContent[0],
  ): TablesStampObj => contentStampMap[0];

  const loadValuesStampMap = (
    _relevantValuesMask: MergeableChanges[1] | MergeableContent[1],
  ): ValuesStampObj => contentStampMap[1];

  const saveTablesStampMap = (): void => {};

  const saveValuesStampMap = (): void => {};

  const addMergeableChangesListener = (
    changesListener: (changes: MergeableChanges<false>) => void,
  ): (() => void) => {
    const listenerId = store.addDidFinishTransactionListener(() =>
      changesListener(
        getTransactionMergeableChanges() as MergeableChanges<false>,
      ),
    );
    return () => store.delListener(listenerId);
  };

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges,
  ): MergeableStore =>
    disableListeningToRawStoreChanges(() =>
      store.applyChanges(mergeContentOrChanges(mergeableChanges)),
    );

  const getMergeableContentHashes = (): ContentHashes => [
    contentStampMap[0][2],
    contentStampMap[1][2],
  ];

  const getMergeableTableHashes = (): TableHashes =>
    objMap(contentStampMap[0][0], getStampHash);

  const getMergeableTableDiff = (
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes] => {
    const newTables: TablesStamp = stampNewObj(contentStampMap[0][1]);
    const differingTableHashes: TableHashes = {};
    objForEach(
      contentStampMap[0][0],
      ([tableStampMap, tableTime, hash], tableId) =>
        objHas(otherTableHashes, tableId)
          ? hash != otherTableHashes[tableId]
            ? (differingTableHashes[tableId] = hash)
            : 0
          : (newTables[0][tableId] = stampMapToObjWithoutHash(
              [tableStampMap, tableTime],
              (rowStampMap) => stampMapToObjWithoutHash(rowStampMap),
            )),
    );
    return [newTables, differingTableHashes];
  };

  const getMergeableRowHashes = (otherTableHashes: TableHashes): RowHashes => {
    const rowHashes: RowHashes = {};
    objForEach(otherTableHashes, (otherTableHash, tableId) =>
      ifNotUndefined(
        objGet(contentStampMap[0][0], tableId),
        ([rowStampMaps, , tableHash]) =>
          tableHash != otherTableHash
            ? objForEach(
                rowStampMaps,
                ([, , rowHash], rowId) =>
                  (objEnsure(rowHashes, tableId, objNew)[rowId] = rowHash),
              )
            : 0,
      ),
    );
    return rowHashes;
  };

  const getMergeableRowDiff = (
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes] => {
    const newRows: TablesStamp = stampNewObj(contentStampMap[0][1]);
    const differingRowHashes: RowHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      objForEach(
        objGet(contentStampMap[0][0], tableId)?.[0],
        ([rowStampMap, rowTime, hash], rowId) =>
          objHas(otherRowHashes, rowId)
            ? hash !== otherRowHashes[rowId]
              ? (objEnsure(differingRowHashes, tableId, objNew)[rowId] = hash)
              : 0
            : (objEnsure(newRows[0], tableId, stampNewObj)[0][rowId] =
                stampMapToObjWithoutHash([rowStampMap, rowTime])),
      ),
    );
    return [newRows, differingRowHashes];
  };

  const getMergeableCellHashes = (
    otherTableRowHashes: RowHashes,
  ): CellHashes => {
    const cellHashes: CellHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      ifNotUndefined(objGet(contentStampMap[0][0], tableId), ([rowStampMaps]) =>
        objForEach(otherRowHashes, (otherRowHash, rowId) =>
          ifNotUndefined(
            objGet(rowStampMaps, rowId),
            ([cellStampMaps, , rowHash]) =>
              rowHash !== otherRowHash
                ? objForEach(
                    cellStampMaps,
                    ([, , cellHash], cellId) =>
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
          objGet(tableStampMaps, tableId),
          ([rowStampMaps, tableTime]) =>
            ifNotUndefined(
              objGet(rowStampMaps, rowId),
              ([cellStampMaps, rowTime]) =>
                objForEach(cellStampMaps, ([cell, cellTime, hash], cellId) =>
                  hash !== otherCellHashes?.[cellId]
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
    return stampNew(tablesObj, tablesTime);
  };

  const getMergeableValueHashes = (): ValueHashes =>
    objMap(contentStampMap[1][0], getStampHash);

  const getMergeableValueDiff = (
    otherValueHashes: ValueHashes,
  ): ValuesStamp => {
    const [, [valueStampMaps, valuesTime]] = contentStampMap;
    const valuesObj: ValuesStamp[0] = {};
    objForEach(valueStampMaps, ([value, valueTime, hash], valueId) =>
      hash !== otherValueHashes?.[valueId]
        ? (valuesObj[valueId] = [value, valueTime])
        : 0,
    );
    return stampNew(valuesObj, valuesTime);
  };

  // --

  const [mergeContentOrChanges] = getMergeableFunctions(
    loadTablesStampMap,
    loadValuesStampMap,
    saveTablesStampMap,
    saveValuesStampMap,
    seenHlc,
  );

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    setMergeableContent,
    setDefaultContent,
    getTransactionMergeableChanges,
    merge,

    addMergeableChangesListener,
    applyMergeableChanges,
    getMergeableContentHashes,
    getMergeableTableHashes,
    getMergeableTableDiff,
    getMergeableRowHashes,
    getMergeableRowDiff,
    getMergeableCellHashes,
    getMergeableCellDiff,
    getMergeableValueHashes,
    getMergeableValueDiff,
  };

  (store as any).setInternalListeners(
    noop,
    noop,
    postFinishTransaction,
    cellChanged,
    valueChanged,
  );

  objMap(
    store as IdObj<any>,
    (method, name) =>
      (mergeableStore[name] =
        // fluent methods
        strStartsWith(name, SET) ||
        strStartsWith(name, DEL) ||
        strStartsWith(name, 'apply') ||
        strEndsWith(name, TRANSACTION) ||
        name == 'call' + LISTENER
          ? (...args: any[]) => {
              method(...args);
              return mergeableStore;
            }
          : strStartsWith(name, ADD) && strEndsWith(name, LISTENER)
            ? (...args: any[]) => {
                const listenerArg = LISTENER_ARGS[slice(name, 3, -8)] ?? 0;
                const listener = args[listenerArg];
                args[listenerArg] = (_store: Store, ...args: any[]) =>
                  listener(mergeableStore, ...args);
                return method(...args);
              }
            : name == 'isMergeable'
              ? () => true
              : method),
  );
  return objFreeze(mergeableStore) as MergeableStore;
}) as typeof createMergeableStoreDecl;
