import {Cell, Changes, Store, Value} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objToArray} from './common/obj';
import {
  MergeableChanges,
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

const newAllContentStamp = (): AllContentStamp => [
  EMPTY_STRING,
  [newStampedMap(), newStampedMap()],
];

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let allContentStamp = newAllContentStamp();
  const [getHlc, seenHlc] = getHlcFunctions(id);
  const store = createStore();

  const disableListening = (actions: () => void) => {
    const wasListening = listening;
    listening = 0;
    actions();
    listening = wasListening;
  };

  const postTransactionListener = () => {
    if (listening) {
      const stamp = getHlc();
      const [tablesChanges, valuesChanges] = store.getTransactionChanges();
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

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableContent = mergeableStore.getMergeableContent();
    const mergeableContent2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableContent);
    return applyMergeableChanges(mergeableContent2);
  };

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

  const setMergeableContent = (mergeableContent: MergeableContent) => {
    disableListening(() =>
      store.transaction(() => {
        store.delTables().delValues();
        allContentStamp = newAllContentStamp();
      }),
    );
    applyMergeableChanges(mergeableContent);
    return mergeableStore;
  };

  const applyMergeableChanges = (
    mergeableChanges: MergeableChanges,
  ): MergeableStore => {
    const changes: Changes = [{}, {}];
    seenHlc(mergeableChanges[0]);
    mergeStamp(
      mergeableChanges,
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
    disableListening(() => store.applyChanges(changes));
    return mergeableStore as MergeableStore;
  };

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    setMergeableContent,
    applyMergeableChanges,
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
