import type {GetNow, Hlc, Id} from '../@types/common/index.d.ts';
import type {
  CellHashes,
  ContentHashes,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  RowHashes,
  RowStamp,
  Stamp,
  TableHashes,
  TableStamp,
  TablesStamp,
  ValueHashes,
  ValuesStamp,
  createMergeableStore as createMergeableStoreDecl,
} from '../@types/mergeable-store/index.d.ts';
import type {
  CellOrUndefined,
  Changes,
  Content,
  Store,
  ValueOrUndefined,
} from '../@types/store/index.d.ts';
import {isCellOrValueOrUndefined} from '../common/cell.ts';
import {collClear, collForEach} from '../common/coll.ts';
import {
  addOrRemoveHash,
  getValueHash,
  getValueInValuesHash,
} from '../common/hash.ts';
import {getHlcFunctions} from '../common/hlc.ts';
import {
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapToObj,
} from '../common/map.ts';
import {
  IdObj,
  objEnsure,
  objForEach,
  objFreeze,
  objHas,
  objMap,
  objNew,
  objValidate,
} from '../common/obj.ts';
import {ifNotUndefined, isArray, noop, size, slice} from '../common/other.ts';
import {IdSet, IdSet3, setAdd, setNew} from '../common/set.ts';
import {
  RowStampMap,
  StampMap,
  TableStampMap,
  TablesStampMap,
  ValuesStampMap,
  getLatestHlc,
  getStampHash,
  replaceHlcHash,
  stampClone,
  stampMapToObjWithHash,
  stampMapToObjWithoutHash,
  stampNew,
  stampNewMap,
  stampNewObj,
  stampNewWithHash,
  stampUpdate,
  stampValidate,
} from '../common/stamps.ts';
import {
  ADD,
  DEL,
  EMPTY_STRING,
  LISTENER,
  SET,
  TRANSACTION,
  strEndsWith,
  strStartsWith,
} from '../common/strings.ts';
import {createStore} from '../store/index.ts';

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
                    stampValidate(cellStamp, isCellOrValueOrUndefined),
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
      (value) => stampValidate(value, isCellOrValueOrUndefined),
      undefined,
      1,
    ),
  );

export const createMergeableStore = ((
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore => {
  let listeningToRawStoreChanges = 1;
  let contentStampMap = newContentStampMap();
  let defaultingContent: 0 | 1 = 0;
  let mutated: 0 | 1 = 0;
  const touchedCells: IdSet3 = mapNew();
  const touchedValues: IdSet = setNew();
  const [getNextHlc, seenHlc] = getHlcFunctions(uniqueId, getNow);
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

  const mergeContentOrChanges = (
    contentOrChanges: MergeableChanges | MergeableContent,
    isContent: 0 | 1 = 0,
  ): Changes => {
    const tablesChanges = {};
    const valuesChanges = {};
    const [
      [tablesObj, incomingTablesHlc = EMPTY_STRING, incomingTablesHash = 0],
      values,
    ] = contentOrChanges as typeof isContent extends 1
      ? MergeableContent
      : MergeableChanges;
    const [tablesStampMap, valuesStampMap] = contentStampMap;
    const [tableStampMaps, oldTablesHlc, oldTablesHash] = tablesStampMap;

    let tablesHash = isContent ? incomingTablesHash : oldTablesHash;
    let tablesHlc = incomingTablesHlc;
    objForEach(
      tablesObj,
      (
        [rowsObj, incomingTableHlc = EMPTY_STRING, incomingTableHash = 0],
        tableId,
      ) => {
        const tableStampMap = mapEnsure<Id, TableStampMap>(
          tableStampMaps,
          tableId,
          stampNewMap,
        );
        const [rowStampMaps, oldTableHlc, oldTableHash] = tableStampMap;
        let tableHash = isContent ? incomingTableHash : oldTableHash;
        let tableHlc = incomingTableHlc;
        objForEach(rowsObj, (row, rowId) => {
          const [rowHlc, oldRowHash, rowHash] = mergeCellsOrValues(
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
            isContent,
          );

          tableHash ^= isContent
            ? 0
            : addOrRemoveHash(
                oldRowHash ? getValueInValuesHash(rowId, oldRowHash) : 0,
                getValueInValuesHash(rowId, rowHash),
              );
          tableHlc = getLatestHlc(tableHlc, rowHlc);
        });

        tableHash ^= isContent
          ? 0
          : replaceHlcHash(oldTableHlc, incomingTableHlc);
        stampUpdate(tableStampMap, incomingTableHlc, tableHash);

        tablesHash ^= isContent
          ? 0
          : addOrRemoveHash(
              oldTableHash ? getValueInValuesHash(tableId, oldTableHash) : 0,
              getValueInValuesHash(tableId, tableStampMap[2]),
            );
        tablesHlc = getLatestHlc(tablesHlc, tableHlc);
      },
    );

    tablesHash ^= isContent
      ? 0
      : replaceHlcHash(oldTablesHlc, incomingTablesHlc);
    stampUpdate(tablesStampMap, incomingTablesHlc, tablesHash);

    const [valuesHlc] = mergeCellsOrValues(
      values,
      valuesStampMap,
      valuesChanges,
      isContent,
    );

    seenHlc(getLatestHlc(tablesHlc, valuesHlc));
    return [tablesChanges, valuesChanges, 1];
  };

  const mergeCellsOrValues = <Thing extends CellOrUndefined | ValueOrUndefined>(
    things: typeof isContent extends 1
      ? Stamp<IdObj<Stamp<Thing, true>>, true>
      : Stamp<IdObj<Stamp<Thing>>>,
    thingsStampMap: StampMap<Stamp<Thing, true>>,
    thingsChanges: {[thingId: Id]: Thing},
    isContent: 0 | 1,
  ): [thingsHlc: Hlc, oldThingsHash: number, newThingsHash: number] => {
    const [
      thingsObj,
      incomingThingsHlc = EMPTY_STRING,
      incomingThingsHash = 0,
    ] = things;
    const [thingStampMaps, oldThingsHlc, oldThingsHash] = thingsStampMap;

    let thingsHlc = incomingThingsHlc;
    let thingsHash = isContent ? incomingThingsHash : oldThingsHash;

    objForEach(
      thingsObj,
      ([thing, thingHlc = EMPTY_STRING, incomingThingHash = 0], thingId) => {
        const thingStampMap = mapEnsure<Id, Stamp<Thing, true>>(
          thingStampMaps,
          thingId,
          () => [undefined as any, EMPTY_STRING, 0],
        );
        const [, oldThingHlc, oldThingHash] = thingStampMap;

        if (!oldThingHlc || thingHlc > oldThingHlc) {
          stampUpdate(
            thingStampMap,
            thingHlc,
            isContent ? incomingThingHash : getValueHash(thing, thingHlc),
          );
          thingStampMap[0] = thing;
          thingsChanges[thingId] = thing;
          thingsHash ^= isContent
            ? 0
            : addOrRemoveHash(
                getValueInValuesHash(thingId, oldThingHash),
                getValueInValuesHash(thingId, thingStampMap[2]),
              );
          thingsHlc = getLatestHlc(thingsHlc, thingHlc);
        }
      },
    );

    thingsHash ^= isContent
      ? 0
      : replaceHlcHash(oldThingsHlc, incomingThingsHlc);
    stampUpdate(thingsStampMap, incomingThingsHlc, thingsHash);

    return [thingsHlc, oldThingsHash, thingsStampMap[2]];
  };

  const preStartTransaction = noop;

  const preFinishTransaction = noop;

  const postFinishTransaction = () => {
    collClear(touchedCells);
    collClear(touchedValues);
  };

  const cellChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    newCell: CellOrUndefined,
    mutating: 0 | 1,
  ) => {
    setAdd(
      mapEnsure(
        mapEnsure(touchedCells, tableId, mapNew<Id, IdSet>),
        rowId,
        setNew<Id>,
      ),
      cellId,
    );
    if (listeningToRawStoreChanges || mutating) {
      if (mutating) {
        mutated = 1;
      }
      mergeContentOrChanges([
        [
          {
            [tableId]: [
              {
                [rowId]: [
                  {
                    [cellId]: [
                      newCell,
                      defaultingContent ? EMPTY_STRING : getNextHlc(),
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

  const valueChanged = (
    valueId: Id,
    newValue: ValueOrUndefined,
    mutating: 0 | 1,
  ) => {
    setAdd(touchedValues, valueId);
    if (listeningToRawStoreChanges || mutating) {
      if (mutating) {
        mutated = 1;
      }
      mergeContentOrChanges([
        [{}],
        [
          {
            [valueId]: [
              newValue,
              defaultingContent ? EMPTY_STRING : getNextHlc(),
            ],
          },
        ],
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

  const getMergeableContentHashes = (): ContentHashes => [
    contentStampMap[0][2],
    contentStampMap[1][2],
  ];

  const getMergeableTableHashes = (): TableHashes =>
    mapToObj(contentStampMap[0][0], getStampHash);

  const getMergeableTableDiff = (
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes] => {
    const newTables: TablesStamp = stampNewObj(contentStampMap[0][1]);
    const differingTableHashes: TableHashes = {};
    mapForEach(
      contentStampMap[0][0],
      (tableId, [tableStampMap, tableHlc, hash]) =>
        objHas(otherTableHashes, tableId)
          ? hash != otherTableHashes[tableId]
            ? (differingTableHashes[tableId] = hash)
            : 0
          : (newTables[0][tableId] = stampMapToObjWithoutHash(
              [tableStampMap, tableHlc],
              (rowStampMap) => stampMapToObjWithoutHash(rowStampMap),
            )),
    );
    return [newTables, differingTableHashes];
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
  ): [newRows: TablesStamp, differingRowHashes: RowHashes] => {
    const newRows: TablesStamp = stampNewObj(contentStampMap[0][1]);
    const differingRowHashes: RowHashes = {};
    objForEach(otherTableRowHashes, (otherRowHashes, tableId) =>
      mapForEach(
        mapGet(contentStampMap[0][0], tableId)?.[0],
        (rowId, [rowStampMap, rowHlc, hash]) =>
          objHas(otherRowHashes, rowId)
            ? hash !== otherRowHashes[rowId]
              ? (objEnsure(differingRowHashes, tableId, objNew)[rowId] = hash)
              : 0
            : (objEnsure(newRows[0], tableId, stampNewObj)[0][rowId] =
                stampMapToObjWithoutHash([rowStampMap, rowHlc])),
      ),
    );
    return [newRows, differingRowHashes];
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
    const [[tableStampMaps, tablesHlc]] = contentStampMap;
    const tablesObj: TablesStamp[0] = {};
    objForEach(otherTableRowCellHashes, (otherRowCellHashes, tableId) =>
      objForEach(otherRowCellHashes, (otherCellHashes, rowId) =>
        ifNotUndefined(
          mapGet(tableStampMaps, tableId),
          ([rowStampMaps, tableHlc]) =>
            ifNotUndefined(
              mapGet(rowStampMaps, rowId),
              ([cellStampMaps, rowHlc]) =>
                mapForEach(cellStampMaps, (cellId, [cell, cellHlc, hash]) =>
                  hash !== otherCellHashes[cellId]
                    ? (objEnsure(
                        objEnsure(tablesObj, tableId, () =>
                          stampNewObj(tableHlc),
                        )[0],
                        rowId,
                        () => stampNewObj(rowHlc),
                      )[0][cellId] = [cell, cellHlc])
                    : 0,
                ),
            ),
        ),
      ),
    );
    return stampNew(tablesObj, tablesHlc);
  };

  const getMergeableValueHashes = (): ValueHashes =>
    mapToObj(contentStampMap[1][0], getStampHash);

  const getMergeableValueDiff = (
    otherValueHashes: ValueHashes,
  ): ValuesStamp => {
    const [, [valueStampMaps, valuesHlc]] = contentStampMap;
    const values = mapToObj(
      valueStampMaps,
      stampClone,
      ([, , hash], valueId) => hash == otherValueHashes?.[valueId],
    );
    return stampNew(values, valuesHlc);
  };

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore =>
    disableListeningToRawStoreChanges(() =>
      validateMergeableContent(mergeableContent)
        ? store.transaction(() => {
            store.delTables().delValues();
            contentStampMap = newContentStampMap();
            // Use _applyChanges to bypass middleware (trusted source)
            (store as any)._applyChanges(
              mergeContentOrChanges(mergeableContent, 1),
            );
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
      [tableStampMaps, tablesHlc, tablesHash],
      [valueStampMaps, valuesHlc, valuesHash],
    ] = contentStampMap;

    const newStamp = withHashes ? stampNewWithHash : stampNew;

    const tablesObj: TablesStamp<typeof withHashes>[0] = {};
    collForEach(touchedCells, (touchedTable, tableId) =>
      ifNotUndefined(
        mapGet(tableStampMaps, tableId),
        ([rowStampMaps, tableHlc, tableHash]) => {
          const tableObj: TableStamp<typeof withHashes>[0] = {};
          collForEach(touchedTable, (touchedRow, rowId) =>
            ifNotUndefined(
              mapGet(rowStampMaps, rowId),
              ([cellStampMaps, rowHlc, rowHash]) => {
                const rowObj: RowStamp<typeof withHashes>[0] = {};
                collForEach(touchedRow, (cellId) => {
                  ifNotUndefined(
                    mapGet(cellStampMaps, cellId),
                    ([cell, time, hash]) =>
                      (rowObj[cellId] = newStamp(cell, time, hash)),
                  );
                });
                tableObj[rowId] = newStamp(rowObj, rowHlc, rowHash);
              },
            ),
          );
          tablesObj[tableId] = newStamp(tableObj, tableHlc, tableHash);
        },
      ),
    );

    const valuesObj: ValuesStamp<typeof withHashes>[0] = {};
    collForEach(touchedValues, (valueId) =>
      ifNotUndefined(
        mapGet(valueStampMaps, valueId),
        ([value, time, hash]) =>
          (valuesObj[valueId] = newStamp(value, time, hash)),
      ),
    );

    return [
      newStamp(tablesObj, tablesHlc, tablesHash),
      newStamp(valuesObj, valuesHlc, valuesHash),
      1,
    ];
  };

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges | MergeableContent,
  ): MergeableStore => {
    const validatedChanges = (store as any).middleware.applyToMergeableChanges(
      mergeableChanges,
      getNextHlc,
    );
    if (validatedChanges === null) {
      return mergeableStore as MergeableStore;
    }
    // Use _applyChanges to bypass base Store's middleware (already validated)
    return disableListeningToRawStoreChanges(() =>
      (store as any)._applyChanges(mergeContentOrChanges(validatedChanges)),
    );
  };

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableChanges = getMergeableContent();
    const mergeableChanges2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableChanges);
    return applyMergeableChanges(mergeableChanges2);
  };

  const hadMutated = (): 0 | 1 => {
    const result = mutated;
    mutated = 0;
    return result;
  };

  const mergeableStore: IdObj<any> = {
    getMergeableContent,

    getMergeableContentHashes,
    getMergeableTableHashes,
    getMergeableTableDiff,
    getMergeableRowHashes,
    getMergeableRowDiff,
    getMergeableCellHashes,
    getMergeableCellDiff,
    getMergeableValueHashes,
    getMergeableValueDiff,
    setMergeableContent,
    setDefaultContent,
    getTransactionMergeableChanges,
    applyMergeableChanges,
    merge,

    // only used internally by other modules
    hadMutated,
  };

  (store as any).setInternalListeners(
    preStartTransaction,
    preFinishTransaction,
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
        name == 'call' + LISTENER ||
        name == 'use'
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
