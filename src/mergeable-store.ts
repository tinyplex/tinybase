import {CellOrUndefined, Changes, Store, ValueOrUndefined} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {
  Hash,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  Time,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {
  HashStamp,
  cloneHashStampToStamp,
  hashStampMapToStampObj,
  hashStampNew,
  hashStampNewMap,
  hashStampToStamp,
  mergeLeafStampsIntoHashStamps,
  mergeStampIntoHashStamp,
  mergeStampsIntoHashStamps,
  stampNew,
  stampNewObj,
} from './mergeable-store/stamps';
import {IdMap, mapEnsure, mapGet, mapSet} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objToArray} from './common/obj';
import {ifNotUndefined, isUndefined, slice} from './common/other';
import {Id} from './types/common';
import {createStore} from './store';
import {getHlcFunctions} from './mergeable-store/hlc';
import {hash} from './mergeable-store/hash';

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

type TableStamp = HashStamp<IdMap<RowStamp>>;
type RowStamp = HashStamp<IdMap<HashStamp<CellOrUndefined>>>;
type ContentStamp = HashStamp<
  [
    tablesStamp: HashStamp<IdMap<TableStamp>>,
    valuesStamp: HashStamp<IdMap<HashStamp<ValueOrUndefined>>>,
  ]
>;

const newContentHashStamp = (time = EMPTY_STRING): ContentStamp =>
  hashStampNew(time, [hashStampNewMap(time), hashStampNewMap(time)]);

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  let contentStamp = newContentHashStamp();
  let transactionTime: Time | undefined;
  let finishTransactionMergeableChanges: MergeableChanges | undefined;
  const [getHlc, seenHlc] = getHlcFunctions(id);
  const store = createStore();

  const disableListening = (actions: () => void) => {
    const wasListening = listening;
    listening = 0;
    actions();
    listening = wasListening;
  };

  const preFinishTransaction = () => {
    if (listening) {
      finishTransactionMergeableChanges = getTransactionMergeableChanges();
      const [
        time,
        [[tablesTime, changedTableStamps], [valuesTime, changedValueStamps]],
      ] = finishTransactionMergeableChanges;
      const cellsTouched = !objIsEmpty(changedTableStamps);
      const valuesTouched = !objIsEmpty(changedValueStamps);

      const [, , [tablesStamp, valuesStamp]] = contentStamp;
      if (cellsTouched) {
        const [oldTablesHash, oldTablesTime] = tablesStamp;
        let tablesHash =
          hash(tablesTime) ^
          (oldTablesTime ? oldTablesHash ^ hash(oldTablesTime) : 0);
        objToArray(
          changedTableStamps,
          ([tableTime, changedRowStamps], tableId) => {
            let tableHash = hash(tableTime);
            const tableStamp = mapEnsure<Id, TableStamp>(
              tablesStamp[2],
              tableId,
              hashStampNewMap,
              ([oldTableHash, oldTableTime]) => {
                tableHash ^= oldTableHash ^ hash(oldTableTime);
                tablesHash ^= hash(tableId + ':' + oldTableHash);
              },
            );
            objToArray(
              changedRowStamps,
              ([rowTime, changedCellStamps], rowId) => {
                let rowHash = hash(rowTime);
                const rowStamp = mapEnsure<Id, RowStamp>(
                  tableStamp[2],
                  rowId,
                  hashStampNewMap,
                  ([oldRowHash, oldRowTime]) => {
                    rowHash ^= oldRowHash ^ hash(oldRowTime);
                    tableHash ^= hash(rowId + ':' + oldRowHash);
                  },
                );
                objToArray(
                  changedCellStamps,
                  ([cellTime, changedCell], cellId) => {
                    ifNotUndefined(
                      mapGet(rowStamp[2], cellId),
                      ([oldCellHash]) =>
                        (rowHash ^= hash(cellId + ':' + oldCellHash)),
                    );
                    const cellStamp = hashStampNew(cellTime, changedCell);
                    mapSet(rowStamp[2], cellId, cellStamp);
                    rowHash ^= hash(cellId + ':' + cellStamp[0]);
                  },
                );
                rowStamp[0] = rowHash >>> 0;
                rowStamp[1] = rowTime;
                tableHash ^= hash(rowId + ':' + rowStamp[0]);
              },
            );
            tableStamp[0] = tableHash >>> 0;
            tableStamp[1] = tableTime;
            tablesHash ^= hash(tableId + ':' + tableStamp[0]);
          },
        );
        tablesStamp[0] = tablesHash >>> 0;
        tablesStamp[1] = tablesTime;
      }
      if (valuesTouched) {
        const [oldValuesHash, oldValuesTime] = valuesStamp;
        let valuesHash =
          hash(valuesTime) ^
          (oldValuesTime ? oldValuesHash ^ hash(oldValuesTime) : 0);
        objToArray(changedValueStamps, ([valueTime, changedValue], valueId) => {
          ifNotUndefined(
            mapGet(valuesStamp[2], valueId),
            ([oldValueHash]) =>
              (valuesHash ^= hash(valueId + ':' + oldValueHash)),
          );
          const valueStamp = hashStampNew(valueTime, changedValue);
          mapSet(valuesStamp[2], valueId, valueStamp);
          valuesHash ^= hash(valueId + ':' + valueStamp[0]);
        });
        valuesStamp[0] = valuesHash >>> 0;
        valuesStamp[1] = valuesTime;
      }
      if (cellsTouched || valuesTouched) {
        contentStamp[0] = (tablesStamp[0] ^ valuesStamp[0]) >>> 0;
        contentStamp[1] = time;
      }
    }
  };

  const postFinishTransaction = () =>
    (transactionTime = finishTransactionMergeableChanges = undefined);

  const getMergeableContent = (): MergeableContent =>
    hashStampToStamp(contentStamp, ([tablesStamp, valuesStamp]) => [
      hashStampMapToStampObj(tablesStamp, (rowsStamp) =>
        hashStampMapToStampObj(rowsStamp, (cellsStamp) =>
          hashStampMapToStampObj(cellsStamp, cloneHashStampToStamp),
        ),
      ),
      hashStampMapToStampObj(valuesStamp, cloneHashStampToStamp),
    ]);

  const setMergeableContent = (mergeableContent: MergeableContent) => {
    disableListening(() =>
      store.transaction(() => {
        store.delTables().delValues();
        contentStamp = newContentHashStamp();
      }),
    );
    applyMergeableChanges(mergeableContent);
    return mergeableStore;
  };

  const getTransactionMergeableChanges = (): MergeableChanges => {
    if (isUndefined(finishTransactionMergeableChanges)) {
      const [, , changedCells, , changedValues] = store.getTransactionLog();
      const time =
        !objIsEmpty(changedCells) || !objIsEmpty(changedValues)
          ? transactionTime ?? (transactionTime = getHlc())
          : EMPTY_STRING;
      const mergeableChanges: MergeableChanges = stampNew(time, [
        stampNewObj(objIsEmpty(changedCells) ? EMPTY_STRING : time),
        stampNewObj(objIsEmpty(changedValues) ? EMPTY_STRING : time),
      ]);
      const [[, tableStamps], [, valuesStamp]] = mergeableChanges[1];

      objToArray(changedCells, (changedTable, tableId) => {
        const [, rowStamps] = (tableStamps[tableId] = stampNewObj(time));
        objToArray(changedTable, (changedRow, rowId) => {
          const [, cellStamps] = (rowStamps[rowId] = stampNewObj(time));
          objToArray(
            changedRow,
            ([, newCell], cellId) =>
              (cellStamps[cellId] = stampNew(time, newCell)),
          );
        });
      });
      objToArray(
        changedValues,
        ([, newValue], valueId) =>
          (valuesStamp[valueId] = stampNew(time, newValue)),
      );

      return mergeableChanges;
    }
    return finishTransactionMergeableChanges;
  };

  const applyMergeableChanges = (
    newContentStamp: MergeableChanges,
  ): MergeableStore => {
    const changes: Changes = [{}, {}];
    seenHlc(newContentStamp[0]);
    mergeStampIntoHashStamp(
      newContentStamp,
      contentStamp,
      changes,
      (
        [newTablesStamp, newValuesStamp],
        [tablesStamp, valuesStamp],
        [tablesChanges, valuesChanges],
      ) => {
        mergeStampIntoHashStamp(
          newTablesStamp,
          tablesStamp,
          tablesChanges,
          (newTableStamps, tableStamps, tableChanges) =>
            mergeStampsIntoHashStamps(
              newTableStamps,
              tableStamps,
              tableChanges,
              (newRowStamps, rowStamps, rowChanges) =>
                mergeStampsIntoHashStamps(
                  newRowStamps,
                  rowStamps,
                  rowChanges,
                  mergeLeafStampsIntoHashStamps,
                ),
            ),
        );
        mergeStampIntoHashStamp(
          newValuesStamp,
          valuesStamp,
          valuesChanges,
          mergeLeafStampsIntoHashStamps,
        );
      },
    );
    disableListening(() => store.applyChanges(changes));
    return mergeableStore as MergeableStore;
  };

  const merge = (mergeableStore2: MergeableStore) => {
    const mergeableContent = mergeableStore.getMergeableContent();
    const mergeableContent2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableContent);
    return applyMergeableChanges(mergeableContent2);
  };

  const getContentHash = (): Hash => contentStamp[0];

  const getTablesHash = (): Hash => contentStamp[2][0][0];

  const getTableHash = (tableId: Id): Hash =>
    mapGet(contentStamp[2][0][2], tableId)?.[0] ?? 0;

  const getRowHash = (tableId: Id, rowId: Id): Hash =>
    mapGet(mapGet(contentStamp[2][0][2], tableId)?.[2], rowId)?.[0] ?? 0;

  const getCellHash = (tableId: Id, rowId: Id, cellId: Id): Hash =>
    mapGet(
      mapGet(mapGet(contentStamp[2][0][2], tableId)?.[2], rowId)?.[2],
      cellId,
    )?.[0] ?? 0;

  const getValuesHash = (): Hash => contentStamp[2][1][0];

  const getValueHash = (valueId: Id): Hash =>
    mapGet(contentStamp[2][1][2], valueId)?.[0] ?? 0;

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
