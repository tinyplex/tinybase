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

type AllContentStamp = Timestamped<
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

const mergeStamp = <NewThing, CurrentThing>(
  [newTimestamp, newThing]: Timestamped<NewThing>,
  currentTimestampedThing: Timestamped<CurrentThing>,
  getNextCurrentThing: (
    newThing: NewThing,
    currentThing: CurrentThing,
  ) => CurrentThing,
  ifNewer: 0 | 1 = 0,
) => {
  const isNewer = newTimestamp > currentTimestampedThing[0];
  if (!ifNewer || isNewer) {
    currentTimestampedThing[1] = getNextCurrentThing(
      newThing,
      currentTimestampedThing[1],
    );
  }
  if (isNewer) {
    currentTimestampedThing[0] = newTimestamp;
  }
  return currentTimestampedThing;
};

const mergeEachStamp = <Thing>(
  thingStamps: IdObj<Timestamped<Thing | null>>,
  allThingStamps: IdMap<Timestamped<any>> | null,
  changes: any,
  forEachThing?: (
    newThing: Thing | null,
    currentThing: any,
    thingId: Id,
  ) => Thing | null,
): any => {
  objForEach(thingStamps, (thingStamp, thingId) =>
    mergeStamp(
      thingStamp,
      mapEnsure(allThingStamps!, thingId, newTimestamped),
      (newThing, currentThing) => {
        if (!forEachThing || isUndefined(newThing)) {
          return (changes[thingId] = newThing ?? null);
        }
        currentThing ??= mapNew();
        changes[thingId] = {};
        forEachThing(newThing, currentThing, thingId);
        return currentThing;
      },
      forEachThing ? 0 : 1,
    ),
  );
  return allThingStamps;
};

export const createMergeableStore = ((id: Id): MergeableStore => {
  let listening = 1;
  const [getHlc, _seenHlc] = getHlcFunctions(id);
  const store = createStore();
  const allContentStamp: AllContentStamp = [
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
      const [allTablesStamp, allValuesStamp] = allContentStamp[1];

      allContentStamp[0] = timestamp;
      if (!objIsEmpty(tablesChanges)) {
        allTablesStamp[0] = timestamp;
        objToArray(tablesChanges, (tableChanges, tableId) => {
          const allTableStamp = mapEnsure(
            allTablesStamp[1],
            tableId,
            newTimestamped,
          );
          allTableStamp[0] = timestamp;
          if (isUndefined(tableChanges)) {
            allTableStamp[1] = null;
          } else {
            const allRowsStamp = (allTableStamp[1] ??= mapNew());
            objToArray(tableChanges, (rowChanges, rowId) => {
              const allRowStamp = mapEnsure(
                allRowsStamp,
                rowId,
                newTimestamped,
              );
              allRowStamp[0] = timestamp;
              if (isUndefined(rowChanges)) {
                allRowStamp[1] = null;
              } else {
                const allCellStamps = (allRowStamp[1] ??= mapNew());
                objToArray(rowChanges, (cellChanges, cellId) =>
                  mapSet(allCellStamps, cellId, [timestamp, cellChanges]),
                );
              }
            });
          }
        });
      }
      if (!objIsEmpty(valuesChanges)) {
        allValuesStamp[0] = timestamp;
        objToArray(valuesChanges, (valueChanges, valueId) => {
          mapSet(allValuesStamp[1], valueId, [timestamp, valueChanges]);
        });
      }
    }
  };

  const merge = () => mergeableStore;

  const getMergeableContent = () =>
    mapTimestamped(
      allContentStamp,
      ([allTablesStamp, allValuesStamp], timestamp) => [
        timestamp,
        [
          mapTimestampedMapToObj(allTablesStamp, (allRowStamp) =>
            mapTimestampedMapToObj(allRowStamp, (allCellsStamp) =>
              mapTimestampedMapToObj(allCellsStamp, pairClone),
            ),
          ),
          mapTimestampedMapToObj(allValuesStamp, pairClone),
        ],
      ],
    );

  const applyMergeableContent = (mergeableContent: MergeableContent) => {
    const changes: TransactionChanges = [{}, {}];
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
