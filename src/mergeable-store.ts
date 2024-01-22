import {Cell, GetTransactionChanges, Store, Value} from './types/store';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objMap} from './common/obj';
import {
  MergeableStore,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {isUndefined, slice} from './common/other';
import {jsonParse, jsonString} from './common/json';
import {strEndsWith, strStartsWith} from './common/strings';
import {Id} from './types/common';
import {collClear} from './common/coll';
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

type Timestamp = string;
type Timestamped<Thing> = [timestamp: Timestamp, thing: Thing];

type MergeableCell = Timestamped<Cell | null>;
type MergeableRow = Timestamped<IdMap<MergeableCell>>;
type MergeableTable = Timestamped<IdMap<MergeableRow>>;
type MergeableTables = Timestamped<IdMap<MergeableTable>>;

type MergeableValue = Timestamped<Value | null>;
type MergeableValues = Timestamped<IdMap<MergeableValue>>;

type MergeableChanges = Timestamped<
  [mergeableTables: MergeableTables, mergeableValues: MergeableValues]
>;

export const createMergeableStore = ((): MergeableStore => {
  let counter = 0;
  const getTimestamp = (): Timestamp => '' + counter++;
  const store = createStore();

  const timestamp = getTimestamp();
  const mergeableChanges: MergeableChanges = [
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
    const newTimestampedMap = <T>(): Timestamped<IdMap<T>> => [
      timestamp,
      mapNew<Id, T>(),
    ];

    const [tablesChanges, valuesChanges] = getTransactionChanges();

    const [mergeableTablesChanges, mergeableValuesChanges] =
      mergeableChanges[1];

    mergeableChanges[0] = timestamp;
    if (!objIsEmpty(tablesChanges)) {
      mergeableTablesChanges[0] = timestamp;
      objMap(tablesChanges, (tableChanges, tableId) => {
        const mergeableTableChanges = mapEnsure(
          mergeableTablesChanges[1],
          tableId,
          newTimestampedMap<MergeableRow>,
        );
        mergeableTableChanges[0] = timestamp;
        if (isUndefined(tableChanges)) {
          collClear(mergeableTableChanges[1]);
        } else {
          objMap(tableChanges, (rowChanges, rowId) => {
            const mergeableRowChanges = mapEnsure(
              mergeableTableChanges[1],
              rowId,
              newTimestampedMap<MergeableCell>,
            );
            mergeableRowChanges[0] = timestamp;
            if (isUndefined(rowChanges)) {
              collClear(mergeableRowChanges[1]);
            } else {
              objMap(rowChanges, (cellChanges, cellId) =>
                mapSet(mergeableRowChanges[1], cellId, [
                  timestamp,
                  cellChanges,
                ]),
              );
            }
          });
        }
      });
    }
    if (!objIsEmpty(valuesChanges)) {
      mergeableValuesChanges[0] = timestamp;
      objMap(valuesChanges, (valueChanges, valueId) => {
        mapSet(mergeableValuesChanges[1], valueId, [timestamp, valueChanges]);
      });
    }
  };

  const merge = () => mergeableStore;

  const getMergeableChanges = () => jsonParse(jsonString(mergeableChanges));

  const mergeableStore: IdObj<any> = {
    getMergeableChanges,
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
