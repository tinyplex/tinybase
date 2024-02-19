import {Changes, Store} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {IdObj, objFreeze, objToArray} from './common/obj';
import {
  MergeableCell,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  MergeableValue,
  Stamped,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {
  mapStamped,
  mapStampedMapToObj,
  mergeEachStampedNode,
  mergeStampedLeaves,
  mergeStampedNode,
  newStamped,
  newStampedMap,
} from './mergeable-store/stamps';
import {Id} from './types/common';
import {createStore} from './store';
import {getHlcFunctions} from './mergeable-store/hlc';
import {pairClone} from './common/pairs';
import {slice} from './common/other';

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

type MergeableRowMap = Stamped<IdMap<MergeableCell>>;
type MergeableTableMap = Stamped<IdMap<MergeableRowMap>>;
type MergeableTablesMap = Stamped<IdMap<MergeableTableMap>>;
type MergeableValuesMap = Stamped<IdMap<MergeableValue>>;
type MergeableContentMap = Stamped<
  [mergeableTables: MergeableTablesMap, mergeableValues: MergeableValuesMap]
>;

const newContentStampedMap = (): MergeableContentMap => [
  EMPTY_STRING,
  [newStampedMap(), newStampedMap()],
];

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let stampedContentMap = newContentStampedMap();
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
      const [cellsTouched, valuesTouched, changedCells, , changedValues] =
        store.getTransactionLog();
      const [tablesStamped, valuesStamped] = stampedContentMap[1];

      stampedContentMap[0] = stamp;
      if (cellsTouched) {
        tablesStamped[0] = stamp;
        objToArray(changedCells, (changedTable, tableId) => {
          const tableStamped = mapEnsure(tablesStamped[1], tableId, newStamped);
          const rowsStamped = (tableStamped[1] ??= mapNew());
          tableStamped[0] = stamp;
          objToArray(changedTable, (changedRow, rowId) => {
            const rowStamped = mapEnsure(rowsStamped, rowId, newStamped);
            const cellsStamped = (rowStamped[1] ??= mapNew());
            rowStamped[0] = stamp;
            objToArray(changedRow, ([, newCell], cellId) =>
              mapSet(cellsStamped, cellId, [stamp, newCell]),
            );
          });
        });
      }
      if (valuesTouched) {
        valuesStamped[0] = stamp;
        objToArray(changedValues, ([, newValue], valueId) => {
          mapSet(valuesStamped[1], valueId, [stamp, newValue]);
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
    mapStamped(stampedContentMap, ([tablesStamp, valuesStamp]) => [
      mapStampedMapToObj(tablesStamp, (rowsStamp) =>
        mapStampedMapToObj(rowsStamp, (cellsStamp) =>
          mapStampedMapToObj(cellsStamp, pairClone),
        ),
      ),
      mapStampedMapToObj(valuesStamp, pairClone),
    ]);

  const setMergeableContent = (mergeableContent: MergeableContent) => {
    disableListening(() =>
      store.transaction(() => {
        store.delTables().delValues();
        stampedContentMap = newContentStampedMap();
      }),
    );
    applyMergeableChanges(mergeableContent);
    return mergeableStore;
  };

  const applyMergeableChanges = (
    newStampedContent: MergeableChanges,
  ): MergeableStore => {
    const changes: Changes = [{}, {}];
    seenHlc(newStampedContent[0]);
    mergeStampedNode(
      newStampedContent,
      stampedContentMap,
      changes,
      (
        [newStampedTables, newStampedValues],
        [stampedTablesMap, stampedValuesMap],
        [tablesChanges, valuesChanges],
      ) => {
        mergeStampedNode(
          newStampedTables,
          stampedTablesMap,
          tablesChanges,
          (newStampedTablez, stampedTableMap, tablesChanges) => {
            mergeEachStampedNode(
              newStampedTablez,
              stampedTableMap,
              tablesChanges,
              (rowStamps, stampedRowMap, tableId) =>
                mergeEachStampedNode(
                  rowStamps!,
                  stampedRowMap,
                  tablesChanges[tableId]!,
                  (cellStamps, cellStampsMap, rowId) =>
                    mergeStampedLeaves(
                      cellStamps!,
                      cellStampsMap,
                      tablesChanges[tableId]![rowId]!,
                    ),
                ),
            );
            return stampedTableMap;
          },
        );
        mergeStampedNode(
          newStampedValues,
          stampedValuesMap,
          valuesChanges,
          mergeStampedLeaves,
        );
        return stampedContentMap;
      },
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
