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
  hashIdAndHash,
  hashStampMapToStampObj,
  hashStampNew,
  hashStampNewMap,
  hashStampToStamp,
  mergeLeafStampsIntoHashStamps,
  mergeStampIntoHashStamp,
  mergeStampsIntoHashStamps,
  stampNew,
  stampNewObj,
  updateHashStamp,
} from './mergeable-store/stamps';
import {IdMap, mapEnsure, mapGet, mapSet} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objToArray} from './common/obj';
import {ifNotUndefined, isUndefined, slice} from './common/other';
import {Id} from './types/common';
import {createStore} from './store';
import {getHash} from './mergeable-store/hash';
import {getHlcFunctions} from './mergeable-store/hlc';

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
        const [oldTablesHash, oldTablesTime, tableStamps] = tablesStamp;
        let tablesHash =
          getHash(tablesTime) ^
          (oldTablesTime ? oldTablesHash ^ getHash(oldTablesTime) : 0);
        objToArray(
          changedTableStamps,
          ([tableTime, changedRowStamps], tableId) => {
            let tableHash = getHash(tableTime);
            const tableStamp = mapEnsure<Id, TableStamp>(
              tableStamps,
              tableId,
              hashStampNewMap,
              ([oldTableHash, oldTableTime]) => {
                tableHash ^= oldTableHash ^ getHash(oldTableTime);
                tablesHash ^= hashIdAndHash(tableId, oldTableHash);
              },
            );
            objToArray(
              changedRowStamps,
              ([rowTime, changedCellStamps], rowId) => {
                let rowHash = getHash(rowTime);
                const rowStamp = mapEnsure<Id, RowStamp>(
                  tableStamp[2],
                  rowId,
                  hashStampNewMap,
                  ([oldRowHash, oldRowTime]) => {
                    rowHash ^= oldRowHash ^ getHash(oldRowTime);
                    tableHash ^= hashIdAndHash(rowId, oldRowHash);
                  },
                );
                objToArray(
                  changedCellStamps,
                  ([cellTime, changedCell], cellId) => {
                    ifNotUndefined(
                      mapGet(rowStamp[2], cellId),
                      ([oldCellHash]) =>
                        (rowHash ^= hashIdAndHash(cellId, oldCellHash)),
                    );
                    const cellStamp = hashStampNew(cellTime, changedCell);
                    mapSet(rowStamp[2], cellId, cellStamp);
                    rowHash ^= hashIdAndHash(cellId, cellStamp[0]);
                  },
                );
                updateHashStamp(rowStamp, rowHash, rowTime);
                tableHash ^= hashIdAndHash(rowId, rowStamp[0]);
              },
            );
            updateHashStamp(tableStamp, tableHash, tableTime);
            tablesHash ^= hashIdAndHash(tableId, tableStamp[0]);
          },
        );
        updateHashStamp(tablesStamp, tablesHash, tablesTime);
      }
      if (valuesTouched) {
        const [oldValuesHash, oldValuesTime, valueStamps] = valuesStamp;
        let valuesHash =
          getHash(valuesTime) ^
          (oldValuesTime ? oldValuesHash ^ getHash(oldValuesTime) : 0);
        objToArray(changedValueStamps, ([valueTime, changedValue], valueId) => {
          ifNotUndefined(
            mapGet(valueStamps, valueId),
            ([oldValueHash]) =>
              (valuesHash ^= hashIdAndHash(valueId, oldValueHash)),
          );
          const valueStamp = hashStampNew(valueTime, changedValue);
          mapSet(valueStamps, valueId, valueStamp);
          valuesHash ^= hashIdAndHash(valueId, valueStamp[0]);
        });
        updateHashStamp(valuesStamp, valuesHash, valuesTime);
      }
      if (cellsTouched || valuesTouched) {
        updateHashStamp(contentStamp, tablesStamp[0] ^ valuesStamp[0], time);
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
