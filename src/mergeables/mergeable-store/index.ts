import type {Id} from '../../@types/common/index.d.ts';
import type {
  GetNow,
  Mergeable,
  MergeableChanges,
  MergeableContent,
  RowStamp,
  TableStamp,
  TablesStamp,
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
import {
  getMergeableFunctions,
  validateMergeableContent,
} from '../../common/mergeable.ts';
import {IdObj, objFreeze, objGet, objMap} from '../../common/obj.ts';
import {ifNotUndefined, noop, slice} from '../../common/other.ts';
import {IdSet, IdSet3, setAdd, setNew} from '../../common/set.ts';
import {
  stampNew,
  stampNewWithHash,
  stampObjCloneWithHash,
  stampObjNewWithHash,
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

const newMyContent = (
  time = EMPTY_STRING,
): [tablesStampObj: TablesStamp<true>, valuesStampObj: ValuesStamp<true>] => [
  stampObjNewWithHash(time),
  stampObjNewWithHash(time),
];

export const createMergeableStore = ((
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore => {
  let myContent = newMyContent();
  let listeningToRawStoreChanges = 1;
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
    stampObjCloneWithHash(myContent[0], (myTable) =>
      stampObjCloneWithHash(myTable, (myRow) => stampObjCloneWithHash(myRow)),
    ),
    stampObjCloneWithHash(myContent[1]),
  ];

  const setMergeableContent = (
    mergeableContent: MergeableContent,
  ): MergeableStore =>
    disableListeningToRawStoreChanges(() =>
      validateMergeableContent(mergeableContent)
        ? store.transaction(() => {
            store.delTables().delValues();
            myContent = newMyContent();
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
      [myTables, myTablesTime, myTablesHash],
      [myValues, myValuesTime, myValuesHash],
    ] = myContent;

    const newStamp = withHashes ? stampNewWithHash : stampNew;

    const tablesChanges: TablesStamp<typeof withHashes>[0] = {};
    collForEach(touchedCells, (touchedTable, tableId) =>
      ifNotUndefined(
        objGet(myTables, tableId),
        ([myTable, myTableTime, myTableHash]) => {
          const tableChanges: TableStamp<typeof withHashes>[0] = {};
          collForEach(touchedTable, (touchedRow, rowId) =>
            ifNotUndefined(
              objGet(myTable, rowId),
              ([myRow, myRowTime, myRowHash]) => {
                const rowChanges: RowStamp<typeof withHashes>[0] = {};
                collForEach(touchedRow, (cellId) => {
                  ifNotUndefined(
                    objGet(myRow, cellId),
                    ([myCell, myCellTime, myCellHash]) =>
                      (rowChanges[cellId] = newStamp(
                        myCell,
                        myCellTime,
                        myCellHash,
                      )),
                  );
                });
                tableChanges[rowId] = newStamp(
                  rowChanges,
                  myRowTime,
                  myRowHash,
                );
              },
            ),
          );
          tablesChanges[tableId] = newStamp(
            tableChanges,
            myTableTime,
            myTableHash,
          );
        },
      ),
    );

    const valuesChanges: ValuesStamp<typeof withHashes>[0] = {};
    collForEach(touchedValues, (valueId) =>
      ifNotUndefined(
        objGet(myValues, valueId),
        ([myValue, myValueTime, myValueHash]) =>
          (valuesChanges[valueId] = newStamp(
            myValue,
            myValueTime,
            myValueHash,
          )),
      ),
    );

    return [
      newStamp(tablesChanges, myTablesTime, myTablesHash),
      newStamp(valuesChanges, myValuesTime, myValuesHash),
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

  const loadMyTablesStamp = (): TablesStamp<true> => myContent[0];

  const loadMyValuesStamp = (): ValuesStamp<true> => myContent[1];

  const saveMyTablesStamp = (): void => {};

  const saveMyValuesStamp = (): void => {};

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

  // --

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    setMergeableContent,
    setDefaultContent,
    getTransactionMergeableChanges,
    merge,

    addMergeableChangesListener,
    applyMergeableChanges,

    loadMyTablesStamp,
    loadMyValuesStamp,
    saveMyTablesStamp,
    saveMyValuesStamp,
    seenHlc,
  };

  const [
    _getMergeableContentHashes,
    _getMergeableTableHashes,
    _getMergeableTableDiff,
    _getMergeableRowHashes,
    _getMergeableRowDiff,
    _getMergeableCellHashes,
    _getMergeableCellDiff,
    _getMergeableValueHashes,
    _getMergeableValueDiff,
    mergeContentOrChanges,
  ] = getMergeableFunctions(mergeableStore as Mergeable);

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
