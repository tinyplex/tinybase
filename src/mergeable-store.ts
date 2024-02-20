import {CellOrUndefined, Changes, Store, ValueOrUndefined} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {IdObj, objFreeze, objToArray} from './common/obj';
import {
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Stamp,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {
  cloneStamp,
  mapStamp,
  mapStampMapToObj,
  mergeLeafStamps,
  mergeStamp,
  mergeStamps,
  stampNew,
  stampNewMap,
} from './mergeable-store/stamps';
import {Id} from './types/common';
import {createStore} from './store';
import {getHlcFunctions} from './mergeable-store/hlc';
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

type ContentStamp = Stamp<
  [
    mergeableTables: Stamp<
      IdMap<Stamp<IdMap<Stamp<IdMap<Stamp<CellOrUndefined>>>>>>
    >,
    mergeableValues: Stamp<IdMap<Stamp<ValueOrUndefined>>>,
  ]
>;

const newContentStamp = (): ContentStamp => [
  EMPTY_STRING,
  [stampNewMap(), stampNewMap()],
];

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let contentStamp = newContentStamp();
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
      const [tablesStamp, valuesStamp] = contentStamp[1];

      contentStamp[0] = stamp;
      if (cellsTouched) {
        tablesStamp[0] = stamp;
        objToArray(changedCells, (changedTable, tableId) => {
          const tableStamp = mapEnsure(tablesStamp[1], tableId, stampNew);
          const rowsStamp = (tableStamp[1] ??= mapNew());
          tableStamp[0] = stamp;
          objToArray(changedTable, (changedRow, rowId) => {
            const rowStamp = mapEnsure(rowsStamp, rowId, stampNew);
            const cellsStamp = (rowStamp[1] ??= mapNew());
            rowStamp[0] = stamp;
            objToArray(changedRow, ([, newCell], cellId) =>
              mapSet(cellsStamp, cellId, [stamp, newCell]),
            );
          });
        });
      }
      if (valuesTouched) {
        valuesStamp[0] = stamp;
        objToArray(changedValues, ([, newValue], valueId) => {
          mapSet(valuesStamp[1], valueId, [stamp, newValue]);
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

  const getMergeableContent = (): MergeableContent =>
    mapStamp(contentStamp, ([tablesStamp, valuesStamp]) => [
      mapStampMapToObj(tablesStamp, (rowsStamp) =>
        mapStampMapToObj(rowsStamp, (cellsStamp) =>
          mapStampMapToObj(cellsStamp, cloneStamp),
        ),
      ),
      mapStampMapToObj(valuesStamp, cloneStamp),
    ]);

  const setMergeableContent = (mergeableContent: MergeableContent) => {
    disableListening(() =>
      store.transaction(() => {
        store.delTables().delValues();
        contentStamp = newContentStamp();
      }),
    );
    applyMergeableChanges(mergeableContent);
    return mergeableStore;
  };

  const applyMergeableChanges = (
    newContentStamp: MergeableChanges,
  ): MergeableStore => {
    const changes: Changes = [{}, {}];
    seenHlc(newContentStamp[0]);
    mergeStamp(
      newContentStamp,
      contentStamp,
      changes,
      (
        [newTablesStamp, newValuesStamp],
        [tablesStamp, valuesStamp],
        [tablesChanges, valuesChanges],
      ) => {
        mergeStamp(
          newTablesStamp,
          tablesStamp,
          tablesChanges,
          (newTableStamps, tableStamps, tableChanges) =>
            mergeStamps(
              newTableStamps,
              tableStamps,
              tableChanges,
              (newRowStamps, rowStamps, rowChanges) =>
                mergeStamps(
                  newRowStamps,
                  rowStamps,
                  rowChanges,
                  mergeLeafStamps,
                ),
            ),
        );
        mergeStamp(newValuesStamp, valuesStamp, valuesChanges, mergeLeafStamps);
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
