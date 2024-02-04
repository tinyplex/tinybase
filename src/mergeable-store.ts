import {
  Cell,
  GetTransactionChanges,
  Store,
  TransactionChanges,
  Value,
} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objToArray} from './common/obj';
import {
  MergeableContent,
  MergeableStore,
  Stamped,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {isUndefined, slice} from './common/other';
import {
  mapStamped,
  mapStampedMapToObj,
  mergeEachStamp,
  mergeStamp,
  newStamped,
  newStampedMap,
} from './mergeable-store/stamps';
import {Id} from './types/common';
import {createStore} from './store';
import {getHlcFunctions} from './mergeable-store/hlc';
import {pairClone} from './common/pairs';

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

type AllContentStamp = Stamped<
  [
    Stamped<
      IdMap<Stamped<IdMap<Stamped<IdMap<Stamped<Cell | null>> | null>> | null>>
    >,
    Stamped<IdMap<Stamped<Value | null>>>,
  ]
>;

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  const [getHlc, seenHlc] = getHlcFunctions(id);
  const store = createStore();
  const allContentStamp: AllContentStamp = [
    EMPTY_STRING,
    [newStampedMap(), newStampedMap()],
  ];

  const postTransactionListener = (
    _: Store,
    getTransactionChanges: GetTransactionChanges,
  ) => {
    if (listening) {
      const stamp = getHlc();
      const [tablesChanges, valuesChanges] = getTransactionChanges();
      const [allTablesStamp, allValuesStamp] = allContentStamp[1];

      allContentStamp[0] = stamp;
      if (!objIsEmpty(tablesChanges)) {
        allTablesStamp[0] = stamp;
        objToArray(tablesChanges, (tableChanges, tableId) => {
          const allTableStamp = mapEnsure(
            allTablesStamp[1],
            tableId,
            newStamped,
          );
          allTableStamp[0] = stamp;
          if (isUndefined(tableChanges)) {
            allTableStamp[1] = null;
          } else {
            const allRowsStamp = (allTableStamp[1] ??= mapNew());
            objToArray(tableChanges, (rowChanges, rowId) => {
              const allRowStamp = mapEnsure(allRowsStamp, rowId, newStamped);
              allRowStamp[0] = stamp;
              if (isUndefined(rowChanges)) {
                allRowStamp[1] = null;
              } else {
                const allCellStamps = (allRowStamp[1] ??= mapNew());
                objToArray(rowChanges, (cellChanges, cellId) =>
                  mapSet(allCellStamps, cellId, [stamp, cellChanges]),
                );
              }
            });
          }
        });
      }
      if (!objIsEmpty(valuesChanges)) {
        allValuesStamp[0] = stamp;
        objToArray(valuesChanges, (valueChanges, valueId) => {
          mapSet(allValuesStamp[1], valueId, [stamp, valueChanges]);
        });
      }
    }
  };

  const merge = () => mergeableStore;

  const getMergeableContent = () =>
    mapStamped(allContentStamp, ([allTablesStamp, allValuesStamp], stamp) => [
      stamp,
      [
        mapStampedMapToObj(allTablesStamp, (allRowStamp) =>
          mapStampedMapToObj(allRowStamp, (allCellsStamp) =>
            mapStampedMapToObj(allCellsStamp, pairClone),
          ),
        ),
        mapStampedMapToObj(allValuesStamp, pairClone),
      ],
    ]);

  const applyMergeableContent = (mergeableContent: MergeableContent) => {
    const changes: TransactionChanges = [{}, {}];
    seenHlc(mergeableContent[0]);
    mergeStamp(
      mergeableContent,
      allContentStamp,
      ([tablesStamp, valuesStamp], [allTablesStamp, allValuesStamp]) =>
        [
          mergeStamp(
            tablesStamp,
            allTablesStamp,
            (tableStamps, allTableStamps) =>
              mergeEachStamp(
                tableStamps,
                allTableStamps,
                changes[0],
                (rowStamps, allRowStamps, tableId) =>
                  mergeEachStamp(
                    rowStamps!,
                    allRowStamps,
                    changes[0][tableId]!,
                    (cellStamps, allCellStamps, rowId) =>
                      mergeEachStamp(
                        cellStamps!,
                        allCellStamps,
                        changes[0][tableId]![rowId]!,
                      ),
                  ),
              ),
          ),
          mergeStamp(
            valuesStamp,
            allValuesStamp,
            (valueStamps, allValueStamps) =>
              mergeEachStamp(valueStamps, allValueStamps, changes[1]),
          ),
        ] as AllContentStamp[1],
    );
    listening = 0;
    store.setTransactionChanges(changes);
    listening = 1;
    return mergeableStore;
  };

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    applyMergeableContent,
    merge,
  };

  (store as any).addPostTransactionListener(postTransactionListener);

  objToArray(
    store as IdObj<any>,
    (method, name) =>
      (mergeableStore[name] =
        // fluent methods
        strStartsWith(name, 'set') ||
        strStartsWith(name, 'del') ||
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
