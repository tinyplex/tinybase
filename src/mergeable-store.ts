import {Cell, GetTransactionChanges, Store, Value} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objMap} from './common/obj';
import {
  MergeableStore,
  Timestamp,
  Timestamped,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {isUndefined, slice} from './common/other';
import {jsonParse, jsonString} from './common/json';
import {createStore} from './store';

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

type MergeableCell = Timestamped<Cell | null>;
type MergeableRow = Timestamped<IdMap<MergeableCell> | null>;
type MergeableTable = Timestamped<IdMap<MergeableRow> | null>;
type MergeableTables = Timestamped<IdMap<MergeableTable>>;

type MergeableValue = Timestamped<Value | null>;
type MergeableValues = Timestamped<IdMap<MergeableValue>>;

type MergeableContent = Timestamped<
  [mergeableTables: MergeableTables, mergeableValues: MergeableValues]
>;

const newTimestampedMap = (): Timestamped<null> => [EMPTY_STRING, null];

export const createMergeableStore = ((): MergeableStore => {
  let counter = 0;
  const getTimestamp = (): Timestamp => '' + counter++;
  const store = createStore();

  const timestamp = getTimestamp();
  const mergeableContent: MergeableContent = [
    timestamp,
    [
      [timestamp, mapNew()],
      [timestamp, mapNew()],
    ],
  ];

  const postTransactionListener = (
    _: Store,
    getTransactionChanges: GetTransactionChanges,
  ) => {
    const timestamp = getTimestamp();
    const [tablesChanges, valuesChanges] = getTransactionChanges();
    const [mergeableTables, mergeableValues] = mergeableContent[1];

    mergeableContent[0] = timestamp;
    if (!objIsEmpty(tablesChanges)) {
      mergeableTables[0] = timestamp;
      objMap(tablesChanges, (tableChanges, tableId) => {
        const mergeableTable = mapEnsure(
          mergeableTables[1],
          tableId,
          newTimestampedMap,
        );
        mergeableTable[0] = timestamp;
        if (isUndefined(tableChanges)) {
          mergeableTable[1] = null;
        } else {
          const mergeableTableMap = (mergeableTable[1] ??= mapNew());
          objMap(tableChanges, (rowChanges, rowId) => {
            const mergeableRow = mapEnsure(
              mergeableTableMap,
              rowId,
              newTimestampedMap,
            );
            mergeableRow[0] = timestamp;
            if (isUndefined(rowChanges)) {
              mergeableRow[1] = null;
            } else {
              const mergeableRowMap = (mergeableRow[1] ??= mapNew());
              objMap(rowChanges, (cellChanges, cellId) =>
                mapSet(mergeableRowMap, cellId, [timestamp, cellChanges]),
              );
            }
          });
        }
      });
    }
    if (!objIsEmpty(valuesChanges)) {
      mergeableValues[0] = timestamp;
      objMap(valuesChanges, (valueChanges, valueId) => {
        mapSet(mergeableValues[1], valueId, [timestamp, valueChanges]);
      });
    }
  };

  const merge = () => mergeableStore;

  const getMergeableContent = () => jsonParse(jsonString(mergeableContent));

  const mergeableStore: IdObj<any> = {
    getMergeableContent,
    merge,
  };

  (store as any).addPostTransactionListener(postTransactionListener);

  objMap(
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
