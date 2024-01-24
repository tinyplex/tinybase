import {
  Cell,
  GetTransactionChanges,
  Store,
  TransactionChanges,
  Value,
} from './types/store';
import {EMPTY_STRING, strEndsWith, strStartsWith} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet, mapToObj} from './common/map';
import {
  IdObj,
  objForEach,
  objFreeze,
  objIsEmpty,
  objToArray,
} from './common/obj';
import {
  MergeableContent,
  MergeableStore,
  Timestamp,
  Timestamped,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {isUndefined, slice} from './common/other';
import {Id} from './types/common';
import {createStore} from './store';
import {getHlcFunctions} from './common/hlc';
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

type AllMergeableContent = Timestamped<
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

const newTimestamped = (): Timestamped<null> => [EMPTY_STRING, null];

const newTimestampedMap = <Thing>(): Timestamped<IdMap<Thing>> => [
  EMPTY_STRING,
  mapNew<Id, Thing>(),
];

const mapTimestampedMapToObj = <MapValue, ObjValue = MapValue>(
  timestampedMap: Timestamped<IdMap<MapValue> | null>,
  mapper: (mapValue: MapValue) => ObjValue = (mapValue: MapValue) =>
    mapValue as any as ObjValue,
): Timestamped<IdObj<ObjValue> | null> =>
  mapTimestamped(timestampedMap, (map, timestamp) => [
    timestamp,
    isUndefined(map) ? null : mapToObj(map, mapper),
  ]);

const mapTimestamped = <TimestampedValue, ToValue>(
  [timestamp, value]: Timestamped<TimestampedValue>,
  mapper: (value: TimestampedValue, timestamp: Timestamp) => ToValue,
): ToValue => mapper(value, timestamp);

const mergeTimestamped = <NewThing, CurrentThing>(
  [newTimestamp, newThing]: Timestamped<NewThing>,
  currentTimestampedThing: Timestamped<CurrentThing>,
  getNextCurrentThing: (
    newThing: NewThing,
    currentThing: CurrentThing,
  ) => CurrentThing,
) => {
  if (newTimestamp > currentTimestampedThing[0]) {
    currentTimestampedThing[0] = newTimestamp;
    currentTimestampedThing[1] = getNextCurrentThing(
      newThing,
      currentTimestampedThing[1],
    );
  }
  return currentTimestampedThing;
};

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  const [getHlc, _seenHlc] = getHlcFunctions(id);
  const store = createStore();
  const allMergeableContent: AllMergeableContent = [
    EMPTY_STRING,
    [newTimestampedMap(), newTimestampedMap()],
  ];

  const postTransactionListener = (
    _: Store,
    getTransactionChanges: GetTransactionChanges,
  ) => {
    if (listening) {
      const timestamp = getHlc();
      const [tablesChanges, valuesChanges] = getTransactionChanges();
      const [mergeableTables, mergeableValues] = allMergeableContent[1];

      allMergeableContent[0] = timestamp;
      if (!objIsEmpty(tablesChanges)) {
        mergeableTables[0] = timestamp;
        objToArray(tablesChanges, (tableChanges, tableId) => {
          const mergeableTable = mapEnsure(
            mergeableTables[1],
            tableId,
            newTimestamped,
          );
          mergeableTable[0] = timestamp;
          if (isUndefined(tableChanges)) {
            mergeableTable[1] = null;
          } else {
            const mergeableTableMap = (mergeableTable[1] ??= mapNew());
            objToArray(tableChanges, (rowChanges, rowId) => {
              const mergeableRow = mapEnsure(
                mergeableTableMap,
                rowId,
                newTimestamped,
              );
              mergeableRow[0] = timestamp;
              if (isUndefined(rowChanges)) {
                mergeableRow[1] = null;
              } else {
                const mergeableRowMap = (mergeableRow[1] ??= mapNew());
                objToArray(rowChanges, (cellChanges, cellId) =>
                  mapSet(mergeableRowMap, cellId, [timestamp, cellChanges]),
                );
              }
            });
          }
        });
      }
      if (!objIsEmpty(valuesChanges)) {
        mergeableValues[0] = timestamp;
        objToArray(valuesChanges, (valueChanges, valueId) => {
          mapSet(mergeableValues[1], valueId, [timestamp, valueChanges]);
        });
      }
    }
  };

  const merge = () => mergeableStore;

  const getMergeableContent = () =>
    mapTimestamped(
      allMergeableContent,
      ([mergeableTables, mergeableValues], timestamp) => [
        timestamp,
        [
          mapTimestampedMapToObj(mergeableTables, (mergeableTable) =>
            mapTimestampedMapToObj(mergeableTable, (mergeableRow) =>
              mapTimestampedMapToObj(mergeableRow, pairClone),
            ),
          ),
          mapTimestampedMapToObj(mergeableValues, pairClone),
        ],
      ],
    );

  const applyMergeableContent = (mergeableContent: MergeableContent) => {
    const changes: TransactionChanges = [{}, {}];
    mergeTimestamped(
      mergeableContent,
      allMergeableContent,
      ([tablesStamp, valuesStamp], [allTablesStamp, allValuesStamp]) =>
        [
          mergeTimestamped(
            tablesStamp,
            allTablesStamp,
            (tableStamps, allTableStamps) => {
              objForEach(tableStamps, (tableStamp, tableId) =>
                mergeTimestamped(
                  tableStamp,
                  mapEnsure(allTableStamps, tableId, newTimestampedMap),
                  (rowStamps, allRowStamps) => {
                    if (isUndefined(rowStamps)) {
                      return (changes[0][tableId] = null);
                    } else {
                      allRowStamps ??= mapNew();
                      changes[0][tableId] = {};
                      objForEach(rowStamps, (rowStamp, rowId) =>
                        mergeTimestamped(
                          rowStamp,
                          mapEnsure(allRowStamps!, rowId, newTimestampedMap),
                          (cellStamps, allCellStamps) => {
                            if (isUndefined(cellStamps)) {
                              return (changes[0][tableId]![rowId] = null);
                            } else {
                              allCellStamps ??= mapNew();
                              changes[0][tableId]![rowId] = {};
                              objForEach(cellStamps, (cellStamp, cellId) =>
                                mergeTimestamped(
                                  cellStamp,
                                  mapEnsure(
                                    allCellStamps!,
                                    cellId,
                                    newTimestamped,
                                  ),
                                  (cell) =>
                                    (changes[0][tableId]![rowId]![cellId] =
                                      cell),
                                ),
                              );
                              return allCellStamps;
                            }
                          },
                        ),
                      );
                      return allRowStamps;
                    }
                  },
                ),
              );
              return allTableStamps;
            },
          ),
          mergeTimestamped(
            valuesStamp,
            allValuesStamp,
            (valueStamps, allValueStamps) => {
              objForEach(valueStamps, (valueStamp, valueId) =>
                mergeTimestamped(
                  valueStamp,
                  mapEnsure(allValueStamps, valueId, newTimestamped),
                  (value) => (changes[1][valueId] = value),
                ),
              );
              return allValueStamps;
            },
          ),
        ] as AllMergeableContent[1],
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
