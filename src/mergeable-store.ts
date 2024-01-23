import {Cell, GetTransactionChanges, Store, Value} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet, mapToObj} from './common/map';
import {IdObj, objFreeze, objIsEmpty, objMap} from './common/obj';
import {
  MergeableStore,
  Timestamp,
  Timestamped,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {isUndefined, slice} from './common/other';
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

type MergeableContentMaps = Timestamped<
  [
    Timestamped<
      IdMap<
        Timestamped<IdMap<
          Timestamped<IdMap<Timestamped<Cell | null>> | null>
        > | null>
      >
    >,
    Timestamped<IdMap<Timestamped<Value | null>>>,
  ]
>;

const newTimestampedMap = (): Timestamped<null> => [EMPTY_STRING, null];

const timestampedMapToObj = <MapValue, ObjValue = MapValue>(
  timestampedMap: Timestamped<IdMap<MapValue> | null>,
  mapper: (mapValue: MapValue) => ObjValue = (mapValue: MapValue) =>
    mapValue as any as ObjValue,
): Timestamped<IdObj<ObjValue> | null> =>
  timestampMap(timestampedMap, (map) =>
    isUndefined(map) ? null : mapToObj(map, mapper),
  );

const timestampMap = <FromValue, ToValue>(
  [timestamp, value]: Timestamped<FromValue>,
  mapper: (value: FromValue) => ToValue,
): Timestamped<ToValue> => [timestamp, mapper(value)];

const timestampClone = <Value>([
  timestamp,
  value,
]: Timestamped<Value>): Timestamped<Value> => [timestamp, value];

export const createMergeableStore = ((): MergeableStore => {
  let counter = 0;
  const getTimestamp = (): Timestamp => '' + counter++;
  const store = createStore();

  const timestamp = getTimestamp();
  const mergeableContent: MergeableContentMaps = [
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

  const getMergeableContent = () =>
    timestampMap(mergeableContent, ([mergeableTables, mergeableValues]) => [
      timestampedMapToObj(mergeableTables, (mergeableTable) =>
        timestampedMapToObj(mergeableTable, (mergeableRow) =>
          timestampedMapToObj(mergeableRow, timestampClone),
        ),
      ),
      timestampedMapToObj(mergeableValues, timestampClone),
    ]);

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
