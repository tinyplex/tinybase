// dist/ui-react-inspector/index.js
import React2 from "react";
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";

// dist/ui-react/index.js
import React from "react";
import { jsx } from "react/jsx-runtime";
var getTypeOf = (thing) => typeof thing;
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var STRING = getTypeOf(EMPTY_STRING);
var FUNCTION = getTypeOf(getTypeOf);
var LISTENER = "Listener";
var RESULT = "Result";
var GET = "get";
var SET = "set";
var ADD = "add";
var HAS = "Has";
var _HAS = "has";
var IDS = "Ids";
var TABLE = "Table";
var TABLES = TABLE + "s";
var TABLE_IDS = TABLE + IDS;
var ROW = "Row";
var ROW_COUNT = ROW + "Count";
var ROW_IDS = ROW + IDS;
var SORTED_ROW_IDS = "Sorted" + ROW + IDS;
var CELL = "Cell";
var CELL_IDS = CELL + IDS;
var VALUE = "Value";
var VALUES = VALUE + "s";
var VALUE_IDS = VALUE + IDS;
var METRIC = "Metric";
var INDEX = "Index";
var SLICE = "Slice";
var RELATIONSHIP = "Relationship";
var REMOTE_ROW_ID = "Remote" + ROW + "Id";
var QUERY = "Query";
var CHECKPOINT = "Checkpoint";
var GLOBAL = globalThis;
var isUndefined = (thing) => thing == void 0;
var ifNotUndefined = (value, then, otherwise) => isUndefined(value) ? otherwise?.() : then(value);
var isString = (thing) => getTypeOf(thing) == STRING;
var isFunction = (thing) => getTypeOf(thing) == FUNCTION;
var isArray = (thing) => Array.isArray(thing);
var size = (arrayOrString) => arrayOrString.length;
var getUndefined = () => void 0;
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayMap = (array, cb) => array.map(cb);
var arrayFilter = (array, cb) => array.filter(cb);
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objEntries = object.entries;
var isObject = (obj) => !isUndefined(obj) && ifNotUndefined(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isUndefined(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds = object.keys;
var objGet = (obj, id2) => ifNotUndefined(obj, (obj2) => obj2[id2]);
var objSize = (obj) => size(objIds(obj));
var objIsEqual = (obj1, obj2) => {
  const entries1 = objEntries(obj1);
  return size(entries1) === objSize(obj2) && arrayEvery(
    entries1,
    ([index, value1]) => isObject(value1) ? isObject(obj2[index]) ? objIsEqual(obj2[index], value1) : false : obj2[index] === value1
  );
};
var {
  PureComponent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} = React;
var getProps = (getProps22, ...ids) => isUndefined(getProps22) ? {} : getProps22(...ids);
var Offsets = /* @__PURE__ */ ((Offsets2) => {
  Offsets2[Offsets2["Store"] = 0] = "Store";
  Offsets2[Offsets2["Metrics"] = 1] = "Metrics";
  Offsets2[Offsets2["Indexes"] = 2] = "Indexes";
  Offsets2[Offsets2["Relationships"] = 3] = "Relationships";
  Offsets2[Offsets2["Queries"] = 4] = "Queries";
  Offsets2[Offsets2["Checkpoints"] = 5] = "Checkpoints";
  Offsets2[Offsets2["Persister"] = 6] = "Persister";
  Offsets2[Offsets2["Synchronizer"] = 7] = "Synchronizer";
  return Offsets2;
})(Offsets || {});
var TINYBASE_CONTEXT = TINYBASE + "_uirc";
var Context = GLOBAL[TINYBASE_CONTEXT] ? (
  /* istanbul ignore next */
  GLOBAL[TINYBASE_CONTEXT]
) : GLOBAL[TINYBASE_CONTEXT] = createContext([]);
var useThing = (id2, offset) => {
  const contextValue = useContext(Context);
  return isUndefined(id2) ? contextValue[offset * 2] : isString(id2) ? objGet(contextValue[offset * 2 + 1], id2) : id2;
};
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId) ? thing : thingOrThingId;
};
var useThingIds = (offset) => objIds(useContext(Context)[offset * 2 + 1] ?? {});
var EMPTY_ARRAY = [];
var DEFAULTS = [{}, [], [EMPTY_ARRAY, void 0, EMPTY_ARRAY], void 0, false, 0];
var IS_EQUALS = [
  objIsEqual,
  arrayIsEqual,
  ([backwardIds1, currentId1, forwardIds1], [backwardIds2, currentId2, forwardIds2]) => currentId1 === currentId2 && arrayIsEqual(backwardIds1, backwardIds2) && arrayIsEqual(forwardIds1, forwardIds2)
];
var isEqual = (thing1, thing2) => thing1 === thing2;
var addAndDelListener = (thing, listenable, ...args) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener?.(listenerId);
};
var useListenable = (listenable, thing, returnType, args = EMPTY_ARRAY) => {
  const lastResult = useRef(DEFAULTS[returnType]);
  const getResult = useCallback(
    () => {
      const nextResult = thing?.[(returnType == 4 ? _HAS : GET) + listenable]?.(
        ...args
      ) ?? DEFAULTS[returnType];
      return !(IS_EQUALS[returnType] ?? isEqual)(nextResult, lastResult.current) ? lastResult.current = nextResult : lastResult.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  const subscribe = useCallback(
    (listener) => addAndDelListener(
      thing,
      (returnType == 4 ? HAS : EMPTY_STRING) + listenable,
      ...args,
      listener
    ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  return useSyncExternalStore(subscribe, getResult, getResult);
};
var useSetCallback = (storeOrStoreId, settable, get, getDeps = EMPTY_ARRAY, then = getUndefined, thenDeps = EMPTY_ARRAY, ...args) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (parameter) => ifNotUndefined(
      store,
      (store2) => ifNotUndefined(
        get(parameter, store2),
        (thing) => then(
          store2[SET + settable](
            ...argsOrGetArgs(args, store2, parameter),
            thing
          ),
          thing
        )
      )
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, settable, ...getDeps, ...thenDeps, ...nonFunctionDeps(args)]
  );
};
var argsOrGetArgs = (args, store, parameter) => arrayMap(args, (arg) => isFunction(arg) ? arg(parameter, store) : arg);
var nonFunctionDeps = (args) => arrayFilter(args, (arg) => !isFunction(arg));
var useCreateStore = (create, createDeps = EMPTY_ARRAY) => useMemo(create, createDeps);
var useStoreIds = () => useThingIds(Offsets.Store);
var useStore = (id2) => useThing(id2, Offsets.Store);
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, Offsets.Store);
var useTableIds = (storeOrStoreId) => useListenable(
  TABLE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1
  /* Array */
);
var useTableCellIds = (tableId, storeOrStoreId) => useListenable(
  TABLE + CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId]
);
var useRowCount = (tableId, storeOrStoreId) => useListenable(
  ROW_COUNT,
  useStoreOrStoreById(storeOrStoreId),
  5,
  [tableId]
);
var useRowIds = (tableId, storeOrStoreId) => useListenable(ROW_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
  tableId
]);
var useSortedRowIds = (tableId, cellId, descending, offset = 0, limit, storeOrStoreId) => useListenable(
  SORTED_ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId, cellId, descending, offset, limit]
);
var useCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  3,
  [tableId, rowId, cellId]
);
var useValues = (storeOrStoreId) => useListenable(
  VALUES,
  useStoreOrStoreById(storeOrStoreId),
  0
  /* Object */
);
var useValueIds = (storeOrStoreId) => useListenable(
  VALUE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1
  /* Array */
);
var useValue = (valueId, storeOrStoreId) => useListenable(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  3,
  [valueId]
);
var useSetCellCallback = (tableId, rowId, cellId, getCell, getCellDeps, storeOrStoreId, then, thenDeps) => useSetCallback(
  storeOrStoreId,
  CELL,
  getCell,
  getCellDeps,
  then,
  thenDeps,
  tableId,
  rowId,
  cellId
);
var useSetValueCallback = (valueId, getValue, getValueDeps, storeOrStoreId, then, thenDeps) => useSetCallback(
  storeOrStoreId,
  VALUE,
  getValue,
  getValueDeps,
  then,
  thenDeps,
  valueId
);
var useMetricsIds = () => useThingIds(Offsets.Metrics);
var useMetrics = (id2) => useThing(id2, Offsets.Metrics);
var useMetricsOrMetricsById = (metricsOrMetricsId) => useThingOrThingById(metricsOrMetricsId, Offsets.Metrics);
var useMetricIds = (metricsOrMetricsId) => useListenable(
  METRIC + IDS,
  useMetricsOrMetricsById(metricsOrMetricsId),
  1
);
var useMetric = (metricId, metricsOrMetricsId) => useListenable(
  METRIC,
  useMetricsOrMetricsById(metricsOrMetricsId),
  3,
  [metricId]
);
var useIndexesIds = () => useThingIds(Offsets.Indexes);
var useIndexes = (id2) => useThing(id2, Offsets.Indexes);
var useIndexesOrIndexesById = (indexesOrIndexesId) => useThingOrThingById(indexesOrIndexesId, Offsets.Indexes);
var useSliceIds = (indexId, indexesOrIndexesId) => useListenable(
  SLICE + IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  1,
  [indexId]
);
var useIndexIds = (indexesOrIndexesId) => useListenable(
  INDEX + IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  1
);
var useSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => useListenable(
  SLICE + ROW_IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  1,
  [indexId, sliceId]
);
var useRelationshipsIds = () => useThingIds(Offsets.Relationships);
var useRelationships = (id2) => useThing(id2, Offsets.Relationships);
var useRelationshipsOrRelationshipsById = (relationshipsOrRelationshipsId) => useThingOrThingById(relationshipsOrRelationshipsId, Offsets.Relationships);
var useRelationshipIds = (relationshipsOrRelationshipsId) => useListenable(
  RELATIONSHIP + IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  1
);
var useRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => useListenable(
  REMOTE_ROW_ID,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  3,
  [relationshipId, localRowId]
);
var useQueriesIds = () => useThingIds(Offsets.Queries);
var useQueries = (id2) => useThing(id2, Offsets.Queries);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(queriesOrQueriesId, Offsets.Queries);
var useQueryIds = (queriesOrQueriesId) => useListenable(
  QUERY + IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1
);
var useResultTableCellIds = (queryId, queriesOrQueriesId) => useListenable(
  RESULT + TABLE + CELL_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1,
  [queryId]
);
var useResultRowCount = (queryId, queriesOrQueriesId) => useListenable(
  RESULT + ROW_COUNT,
  useQueriesOrQueriesById(queriesOrQueriesId),
  5,
  [queryId]
);
var useResultSortedRowIds = (queryId, cellId, descending, offset = 0, limit, queriesOrQueriesId) => useListenable(
  RESULT + SORTED_ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1,
  [queryId, cellId, descending, offset, limit]
);
var useResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => useListenable(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  3,
  [queryId, rowId, cellId]
);
var useCheckpointsOrCheckpointsById = (checkpointsOrCheckpointsId) => useThingOrThingById(checkpointsOrCheckpointsId, Offsets.Checkpoints);
var useCheckpointIds = (checkpointsOrCheckpointsId) => useListenable(
  CHECKPOINT + IDS,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  2
);
var useCheckpoint = (checkpointId, checkpointsOrCheckpointsId) => useListenable(
  CHECKPOINT,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  3,
  [checkpointId]
);
var useCreatePersister = (store, create, createDeps = EMPTY_ARRAY, then, thenDeps = EMPTY_ARRAY, destroy, destroyDeps = EMPTY_ARRAY) => {
  const [, rerender] = useState();
  const [persister, setPersister] = useState();
  useEffect(
    () => {
      (async () => {
        const persister2 = store ? await create(store) : void 0;
        setPersister(persister2);
        if (persister2 && then) {
          (async () => {
            await then(persister2);
            rerender([]);
          })();
        }
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps, ...thenDeps]
  );
  useEffect(
    () => () => {
      if (persister) {
        persister.destroy();
        destroy?.(persister);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persister, ...destroyDeps]
  );
  return persister;
};
var getUseCheckpointView = (getCheckpoints) => ({
  checkpoints,
  checkpointComponent: Checkpoint = CheckpointView,
  getCheckpointComponentProps,
  separator,
  debugIds
}) => {
  const resolvedCheckpoints = useCheckpointsOrCheckpointsById(checkpoints);
  return wrap(
    arrayMap(
      getCheckpoints(useCheckpointIds(resolvedCheckpoints)),
      (checkpointId) => /* @__PURE__ */ jsx(
        Checkpoint,
        {
          ...getProps(getCheckpointComponentProps, checkpointId),
          checkpoints: resolvedCheckpoints,
          checkpointId,
          debugIds
        },
        checkpointId
      )
    ),
    separator
  );
};
var wrap = (children, separator, encloseWithId, id2) => {
  const separated = isUndefined(separator) || !isArray(children) ? children : arrayMap(children, (child, c) => c > 0 ? [separator, child] : child);
  return encloseWithId ? [id2, ":{", separated, "}"] : separated;
};
var CellView = ({ tableId, rowId, cellId, store, debugIds }) => wrap(
  EMPTY_STRING + (useCell(tableId, rowId, cellId, store) ?? EMPTY_STRING),
  void 0,
  debugIds,
  cellId
);
var ValueView = ({ valueId, store, debugIds }) => wrap(
  EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING),
  void 0,
  debugIds,
  valueId
);
var ResultCellView = ({ queryId, rowId, cellId, queries, debugIds }) => wrap(
  EMPTY_STRING + (useResultCell(queryId, rowId, cellId, queries) ?? EMPTY_STRING),
  void 0,
  debugIds,
  cellId
);
var CheckpointView = ({ checkpoints, checkpointId, debugIds }) => wrap(
  useCheckpoint(checkpointId, checkpoints) ?? EMPTY_STRING,
  void 0,
  debugIds,
  checkpointId
);
var BackwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[0]
);
var CurrentCheckpointView = getUseCheckpointView(
  (checkpointIds) => isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]]
);
var ForwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[2]
);

// dist/ui-react-inspector/index.js
var getTypeOf2 = (thing) => typeof thing;
var EMPTY_STRING2 = "";
var STRING2 = getTypeOf2(EMPTY_STRING2);
var BOOLEAN = getTypeOf2(true);
var NUMBER = getTypeOf2(0);
var FUNCTION2 = getTypeOf2(getTypeOf2);
var TYPE = "type";
var DEFAULT = "default";
var LISTENER2 = "Listener";
var ADD2 = "add";
var HAS2 = "Has";
var IDS2 = "Ids";
var TABLE2 = "Table";
var TABLES2 = TABLE2 + "s";
var TABLE_IDS2 = TABLE2 + IDS2;
var ROW2 = "Row";
var ROW_COUNT2 = ROW2 + "Count";
var ROW_IDS2 = ROW2 + IDS2;
var CELL2 = "Cell";
var CELL_IDS2 = CELL2 + IDS2;
var VALUE2 = "Value";
var VALUES2 = VALUE2 + "s";
var VALUE_IDS2 = VALUE2 + IDS2;
var CURRENT_TARGET = "currentTarget";
var _VALUE = "value";
var UNDEFINED = "\uFFFC";
var id = (key) => EMPTY_STRING2 + key;
var strSplit = (str, separator = EMPTY_STRING2, limit) => str.split(separator, limit);
var GLOBAL2 = globalThis;
var WINDOW = GLOBAL2.window;
var math = Math;
var mathMin = math.min;
var mathFloor = math.floor;
var isFiniteNumber = isFinite;
var isInstanceOf = (thing, cls) => thing instanceof cls;
var isUndefined2 = (thing) => thing == void 0;
var ifNotUndefined2 = (value, then, otherwise) => isUndefined2(value) ? otherwise?.() : then(value);
var isTypeStringOrBoolean = (type) => type == STRING2 || type == BOOLEAN;
var isString2 = (thing) => getTypeOf2(thing) == STRING2;
var isFunction2 = (thing) => getTypeOf2(thing) == FUNCTION2;
var isArray2 = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size2 = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var errorNew = (message) => {
  throw new Error(message);
};
var arrayHas = (array, value) => array.includes(value);
var arrayEvery2 = (array, cb) => array.every(cb);
var arrayIsEqual2 = (array1, array2) => size2(array1) === size2(array2) && arrayEvery2(array1, (value1, index) => array2[index] === value1);
var arraySort = (array, sorter) => array.sort(sorter);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING2) => array.join(sep);
var arrayMap2 = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size2(array) == 0;
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayClear = (array, to) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var object2 = Object;
var getPrototypeOf2 = (obj) => object2.getPrototypeOf(obj);
var objEntries2 = object2.entries;
var objFrozen = object2.isFrozen;
var isObject2 = (obj) => !isUndefined2(obj) && ifNotUndefined2(
  getPrototypeOf2(obj),
  (objPrototype) => objPrototype == object2.prototype || isUndefined2(getPrototypeOf2(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds2 = object2.keys;
var objFreeze = object2.freeze;
var objNew = (entries = []) => object2.fromEntries(entries);
var objHas = (obj, id2) => id2 in obj;
var objDel = (obj, id2) => {
  delete obj[id2];
  return obj;
};
var objForEach = (obj, cb) => arrayForEach(objEntries2(obj), ([id2, value]) => cb(value, id2));
var objToArray = (obj, cb) => arrayMap2(objEntries2(obj), ([id2, value]) => cb(value, id2));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id2) => [id2, cb(value, id2)]));
var objSize2 = (obj) => size2(objIds2(obj));
var objIsEmpty = (obj) => isObject2(obj) && objSize2(obj) == 0;
var objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
  if (isUndefined2(obj) || !isObject2(obj) || !emptyIsValid && objIsEmpty(obj) || objFrozen(obj)) {
    onInvalidObj?.();
    return false;
  }
  objForEach(obj, (child, id2) => {
    if (!validateChild(child, id2)) {
      objDel(obj, id2);
    }
  });
  return emptyIsValid ? true : !objIsEmpty(obj);
};
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
var jsonStringWithMap = (obj) => jsonString(
  obj,
  (_key, value) => isInstanceOf(value, Map) ? object2.fromEntries([...value]) : value
);
var jsonStringWithUndefined = (obj) => jsonString(obj, (_key, value) => value === void 0 ? UNDEFINED : value);
var jsonParseWithUndefined = (str) => jsonParse(str, (_key, value) => value === UNDEFINED ? void 0 : value);
var collSizeN = (collSizer) => (coll) => arrayReduce(collValues(coll), (total, coll2) => total + collSizer(coll2), 0);
var collSize = (coll) => coll?.size ?? 0;
var collSize2 = collSizeN(collSize);
var collSize3 = collSizeN(collSize2);
var collSize4 = collSizeN(collSize3);
var collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
var collIsEmpty = (coll) => isUndefined2(coll) || collSize(coll) == 0;
var collValues = (coll) => [...coll?.values() ?? []];
var collClear = (coll) => coll.clear();
var collForEach = (coll, cb) => coll?.forEach(cb);
var collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);
var mapNew = (entries) => new Map(entries);
var mapKeys = (map) => [...map?.keys() ?? []];
var mapGet = (map, key) => map?.get(key);
var mapForEach = (map, cb) => collForEach(map, (value, key) => cb(key, value));
var mapMap = (coll, cb) => arrayMap2([...coll?.entries() ?? []], ([key, value]) => cb(value, key));
var mapSet = (map, key, value) => isUndefined2(value) ? (collDel(map, key), map) : map?.set(key, value);
var mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map, key)) {
    mapSet(map, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map, key));
  }
  return mapGet(map, key);
};
var mapMatch = (map, obj, set, del = mapSet) => {
  objMap(obj, (value, id2) => set(map, id2, value));
  mapForEach(map, (id2) => objHas(obj, id2) ? 0 : del(map, id2));
  return map;
};
var mapToObj = (map, valueMapper, excludeMapValue, excludeObjValue) => {
  const obj = {};
  collForEach(map, (mapValue, id2) => {
    if (!excludeMapValue?.(mapValue, id2)) {
      const objValue = valueMapper ? valueMapper(mapValue, id2) : mapValue;
      if (!excludeObjValue?.(objValue)) {
        obj[id2] = objValue;
      }
    }
  });
  return obj;
};
var mapToObj2 = (map, valueMapper, excludeMapValue) => mapToObj(
  map,
  (childMap) => mapToObj(childMap, valueMapper, excludeMapValue),
  collIsEmpty,
  objIsEmpty
);
var mapToObj3 = (map, valueMapper, excludeMapValue) => mapToObj(
  map,
  (childMap) => mapToObj2(childMap, valueMapper, excludeMapValue),
  collIsEmpty,
  objIsEmpty
);
var mapClone = (map, mapValue) => {
  const map2 = mapNew();
  collForEach(map, (value, key) => map2.set(key, mapValue?.(value) ?? value));
  return map2;
};
var mapClone2 = (map) => mapClone(map, mapClone);
var mapClone3 = (map) => mapClone(map, mapClone2);
var visitTree = (node, path, ensureLeaf, pruneLeaf, p = 0) => ifNotUndefined2(
  (ensureLeaf ? mapEnsure : mapGet)(
    node,
    path[p],
    p > size2(path) - 2 ? ensureLeaf : mapNew
  ),
  (nodeOrLeaf) => {
    if (p > size2(path) - 2) {
      if (pruneLeaf?.(nodeOrLeaf)) {
        mapSet(node, path[p]);
      }
      return nodeOrLeaf;
    }
    const leaf = visitTree(nodeOrLeaf, path, ensureLeaf, pruneLeaf, p + 1);
    if (collIsEmpty(nodeOrLeaf)) {
      mapSet(node, path[p]);
    }
    return leaf;
  }
);
var INTEGER = /^\d+$/;
var getPoolFunctions = () => {
  const pool = [];
  let nextId = 0;
  return [
    (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING2 + nextId++,
    (id2) => {
      if (test(INTEGER, id2) && size2(pool) < 1e3) {
        arrayPush(pool, id2);
      }
    }
  ];
};
var setNew = (entryOrEntries) => new Set(
  isArray2(entryOrEntries) || isUndefined2(entryOrEntries) ? entryOrEntries : [entryOrEntries]
);
var setAdd = (set, value) => set?.add(value);
var getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING2]) => {
  const leaves = [];
  const deep = (node, p) => p == size2(path) ? arrayPush(leaves, node) : path[p] === null ? collForEach(node, (node2) => deep(node2, p + 1)) : arrayForEach([path[p], null], (id2) => deep(mapGet(node, id2), p + 1));
  deep(deepIdSet, 0);
  return leaves;
};
var getListenerFunctions = (getThing) => {
  let thing;
  const [getId, releaseId] = getPoolFunctions();
  const allListeners = mapNew();
  const addListener = (listener, idSetNode, path, pathGetters = [], extraArgsGetter = () => []) => {
    thing ??= getThing();
    const id2 = getId(1);
    mapSet(allListeners, id2, [
      listener,
      idSetNode,
      path,
      pathGetters,
      extraArgsGetter
    ]);
    setAdd(visitTree(idSetNode, path ?? [EMPTY_STRING2], setNew), id2);
    return id2;
  };
  const callListeners = (idSetNode, ids, ...extraArgs) => arrayForEach(
    getWildcardedLeaves(idSetNode, ids),
    (set) => collForEach(
      set,
      (id2) => mapGet(allListeners, id2)[0](thing, ...ids ?? [], ...extraArgs)
    )
  );
  const delListener = (id2) => ifNotUndefined2(mapGet(allListeners, id2), ([, idSetNode, idOrNulls]) => {
    visitTree(idSetNode, idOrNulls ?? [EMPTY_STRING2], void 0, (idSet) => {
      collDel(idSet, id2);
      return collIsEmpty(idSet) ? 1 : 0;
    });
    mapSet(allListeners, id2);
    releaseId(id2);
    return idOrNulls;
  });
  const callListener = (id2) => ifNotUndefined2(
    mapGet(allListeners, id2),
    ([listener, , path = [], pathGetters, extraArgsGetter]) => {
      const callWithIds = (...ids) => {
        const index = size2(ids);
        if (index == size2(path)) {
          listener(thing, ...ids, ...extraArgsGetter(ids));
        } else if (isUndefined2(path[index])) {
          arrayForEach(
            pathGetters[index]?.(...ids) ?? [],
            (id22) => callWithIds(...ids, id22)
          );
        } else {
          callWithIds(...ids, path[index]);
        }
      };
      callWithIds();
    }
  );
  return [addListener, callListeners, delListener, callListener];
};
var scheduleRunning = mapNew();
var scheduleActions = mapNew();
var getStoreFunctions = (persist = 1, store, isSynchronizer) => persist != 1 && store.isMergeable() ? [
  1,
  store.getMergeableContent,
  () => store.getTransactionMergeableChanges(!isSynchronizer),
  ([[changedTables], [changedValues]]) => !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
  store.setDefaultContent
] : persist != 2 ? [
  0,
  store.getContent,
  store.getTransactionChanges,
  ([changedTables, changedValues]) => !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
  store.setContent
] : errorNew("Store type not supported by this Persister");
var createCustomPersister = (store, getPersisted, setPersisted, addPersisterListener, delPersisterListener, onIgnoredError, persist, extra = {}, isSynchronizer = 0, scheduleId = []) => {
  let status = 0;
  let loads = 0;
  let saves = 0;
  let action;
  let autoLoadHandle;
  let autoSaveListenerId;
  mapEnsure(scheduleRunning, scheduleId, () => 0);
  mapEnsure(scheduleActions, scheduleId, () => []);
  const statusListeners = mapNew();
  const [
    isMergeableStore,
    getContent,
    getChanges,
    hasChanges,
    setDefaultContent
  ] = getStoreFunctions(persist, store, isSynchronizer);
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => persister
  );
  const setStatus = (newStatus) => {
    if (newStatus != status) {
      status = newStatus;
      callListeners(statusListeners, void 0, status);
    }
  };
  const run = async () => {
    if (!mapGet(scheduleRunning, scheduleId)) {
      mapSet(scheduleRunning, scheduleId, 1);
      while (!isUndefined2(action = arrayShift(mapGet(scheduleActions, scheduleId)))) {
        try {
          await action();
        } catch (error) {
        }
      }
      mapSet(scheduleRunning, scheduleId, 0);
    }
  };
  const setContentOrChanges = (contentOrChanges) => {
    (isMergeableStore && isArray2(contentOrChanges?.[0]) ? contentOrChanges?.[2] === 1 ? store.applyMergeableChanges : store.setMergeableContent : contentOrChanges?.[2] === 1 ? store.applyChanges : store.setContent)(contentOrChanges);
  };
  const load = async (initialContent) => {
    if (status != 2) {
      setStatus(
        1
        /* Loading */
      );
      loads++;
      await schedule(async () => {
        try {
          const content = await getPersisted();
          if (isArray2(content)) {
            setContentOrChanges(content);
          } else if (initialContent) {
            setDefaultContent(initialContent);
          } else {
            errorNew(`Content is not an array: ${content}`);
          }
        } catch (error) {
          if (initialContent) {
            setDefaultContent(initialContent);
          }
        }
        setStatus(
          0
          /* Idle */
        );
      });
    }
    return persister;
  };
  const startAutoLoad = async (initialContent) => {
    stopAutoLoad();
    await load(initialContent);
    try {
      autoLoadHandle = await addPersisterListener(async (content, changes) => {
        if (changes || content) {
          if (status != 2) {
            setStatus(
              1
              /* Loading */
            );
            loads++;
            setContentOrChanges(changes ?? content);
            setStatus(
              0
              /* Idle */
            );
          }
        } else {
          await load();
        }
      });
    } catch (error) {
    }
    return persister;
  };
  const stopAutoLoad = () => {
    if (autoLoadHandle) {
      delPersisterListener(autoLoadHandle);
      autoLoadHandle = void 0;
    }
    return persister;
  };
  const isAutoLoading = () => !isUndefined2(autoLoadHandle);
  const save = async (changes) => {
    if (status != 1) {
      setStatus(
        2
        /* Saving */
      );
      saves++;
      await schedule(async () => {
        try {
          await setPersisted(getContent, changes);
        } catch (error) {
        }
        setStatus(
          0
          /* Idle */
        );
      });
    }
    return persister;
  };
  const startAutoSave = async () => {
    stopAutoSave();
    await save();
    autoSaveListenerId = store.addDidFinishTransactionListener(() => {
      const changes = getChanges();
      if (hasChanges(changes)) {
        save(changes);
      }
    });
    return persister;
  };
  const stopAutoSave = () => {
    if (autoSaveListenerId) {
      store.delListener(autoSaveListenerId);
      autoSaveListenerId = void 0;
    }
    return persister;
  };
  const isAutoSaving = () => !isUndefined2(autoSaveListenerId);
  const getStatus = () => status;
  const addStatusListener = (listener) => addListener(listener, statusListeners);
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return store;
  };
  const schedule = async (...actions) => {
    arrayPush(mapGet(scheduleActions, scheduleId), ...actions);
    await run();
    return persister;
  };
  const getStore = () => store;
  const destroy = () => {
    arrayClear(mapGet(scheduleActions, scheduleId));
    return stopAutoLoad().stopAutoSave();
  };
  const getStats = () => ({ loads, saves });
  const persister = {
    load,
    startAutoLoad,
    stopAutoLoad,
    isAutoLoading,
    save,
    startAutoSave,
    stopAutoSave,
    isAutoSaving,
    getStatus,
    addStatusListener,
    delListener,
    schedule,
    getStore,
    destroy,
    getStats,
    ...extra
  };
  return objFreeze(persister);
};
var STORAGE = "storage";
var createStoragePersister = (store, storageName, storage, onIgnoredError) => {
  const getPersisted = async () => jsonParseWithUndefined(storage.getItem(storageName));
  const setPersisted = async (getContent) => storage.setItem(storageName, jsonStringWithUndefined(getContent()));
  const addPersisterListener = (listener) => {
    const storageListener = (event) => {
      if (event.storageArea === storage && event.key === storageName) {
        try {
          listener(jsonParse(event.newValue));
        } catch {
          listener();
        }
      }
    };
    WINDOW.addEventListener(STORAGE, storageListener);
    return storageListener;
  };
  const delPersisterListener = (storageListener) => WINDOW.removeEventListener(STORAGE, storageListener);
  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    3,
    // StoreOrMergeableStore,
    { getStorageName: () => storageName }
  );
};
var createSessionPersister = (store, storageName, onIgnoredError) => createStoragePersister(store, storageName, sessionStorage, onIgnoredError);
var getCellOrValueType = (cellOrValue) => {
  const type = getTypeOf2(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var setOrDelCell = (store, tableId, rowId, cellId, cell) => isUndefined2(cell) ? store.delCell(tableId, rowId, cellId, true) : store.setCell(tableId, rowId, cellId, cell);
var setOrDelValue = (store, valueId, value) => isUndefined2(value) ? store.delValue(valueId) : store.setValue(valueId, value);
var getTypeCase = (type, stringCase, numberCase, booleanCase) => type == STRING2 ? stringCase : type == NUMBER ? numberCase : booleanCase;
var defaultSorter = (sortKey1, sortKey2) => (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;
var pairNew = (value) => [value, value];
var pairCollSize2 = (pair, func = collSize2) => func(pair[0]) + func(pair[1]);
var pairNewMap = () => [mapNew(), mapNew()];
var pairClone = (array) => [...array];
var pairIsEqual = ([entry1, entry2]) => entry1 === entry2;
var idsChanged = (changedIds, id2, addedOrRemoved) => mapSet(
  changedIds,
  id2,
  mapGet(changedIds, id2) == -addedOrRemoved ? void 0 : addedOrRemoved
);
var createStore = () => {
  let hasTablesSchema;
  let hasValuesSchema;
  let hadTables = false;
  let hadValues = false;
  let transactions = 0;
  let internalListeners = [];
  const changedTableIds = mapNew();
  const changedTableCellIds = mapNew();
  const changedRowCount = mapNew();
  const changedRowIds = mapNew();
  const changedCellIds = mapNew();
  const changedCells = mapNew();
  const changedValueIds = mapNew();
  const changedValues = mapNew();
  const invalidCells = mapNew();
  const invalidValues = mapNew();
  const tablesSchemaMap = mapNew();
  const tablesSchemaRowCache = mapNew();
  const valuesSchemaMap = mapNew();
  const valuesDefaulted = mapNew();
  const valuesNonDefaulted = setNew();
  const tablePoolFunctions = mapNew();
  const tableCellIds = mapNew();
  const tablesMap = mapNew();
  const valuesMap = mapNew();
  const hasTablesListeners = pairNewMap();
  const tablesListeners = pairNewMap();
  const tableIdsListeners = pairNewMap();
  const hasTableListeners = pairNewMap();
  const tableListeners = pairNewMap();
  const tableCellIdsListeners = pairNewMap();
  const hasTableCellListeners = pairNewMap();
  const rowCountListeners = pairNewMap();
  const rowIdsListeners = pairNewMap();
  const sortedRowIdsListeners = pairNewMap();
  const hasRowListeners = pairNewMap();
  const rowListeners = pairNewMap();
  const cellIdsListeners = pairNewMap();
  const hasCellListeners = pairNewMap();
  const cellListeners = pairNewMap();
  const invalidCellListeners = pairNewMap();
  const invalidValueListeners = pairNewMap();
  const hasValuesListeners = pairNewMap();
  const valuesListeners = pairNewMap();
  const valueIdsListeners = pairNewMap();
  const hasValueListeners = pairNewMap();
  const valueListeners = pairNewMap();
  const startTransactionListeners = mapNew();
  const finishTransactionListeners = pairNewMap();
  const [addListener, callListeners, delListenerImpl, callListenerImpl] = getListenerFunctions(() => store);
  const validateTablesSchema = (tableSchema) => objValidate(
    tableSchema,
    (tableSchema2) => objValidate(tableSchema2, validateCellOrValueSchema)
  );
  const validateValuesSchema = (valuesSchema) => objValidate(valuesSchema, validateCellOrValueSchema);
  const validateCellOrValueSchema = (schema) => {
    if (!objValidate(schema, (_child, id2) => arrayHas([TYPE, DEFAULT], id2))) {
      return false;
    }
    const type = schema[TYPE];
    if (!isTypeStringOrBoolean(type) && type != NUMBER) {
      return false;
    }
    if (getCellOrValueType(schema[DEFAULT]) != type) {
      objDel(schema, DEFAULT);
    }
    return true;
  };
  const validateContent = isArray2;
  const validateTables = (tables) => objValidate(tables, validateTable, cellInvalid);
  const validateTable = (table, tableId) => (!hasTablesSchema || collHas(tablesSchemaMap, tableId) || /* istanbul ignore next */
  cellInvalid(tableId)) && objValidate(
    table,
    (row, rowId) => validateRow(tableId, rowId, row),
    () => cellInvalid(tableId)
  );
  const validateRow = (tableId, rowId, row, skipDefaults) => objValidate(
    skipDefaults ? row : addDefaultsToRow(row, tableId, rowId),
    (cell, cellId) => ifNotUndefined2(
      getValidatedCell(tableId, rowId, cellId, cell),
      (validCell) => {
        row[cellId] = validCell;
        return true;
      },
      () => false
    ),
    () => cellInvalid(tableId, rowId)
  );
  const getValidatedCell = (tableId, rowId, cellId, cell) => hasTablesSchema ? ifNotUndefined2(
    mapGet(mapGet(tablesSchemaMap, tableId), cellId),
    (cellSchema) => getCellOrValueType(cell) != cellSchema[TYPE] ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT]) : cell,
    () => cellInvalid(tableId, rowId, cellId, cell)
  ) : isUndefined2(getCellOrValueType(cell)) ? cellInvalid(tableId, rowId, cellId, cell) : cell;
  const validateValues = (values, skipDefaults) => objValidate(
    skipDefaults ? values : addDefaultsToValues(values),
    (value, valueId) => ifNotUndefined2(
      getValidatedValue(valueId, value),
      (validValue) => {
        values[valueId] = validValue;
        return true;
      },
      () => false
    ),
    () => valueInvalid()
  );
  const getValidatedValue = (valueId, value) => hasValuesSchema ? ifNotUndefined2(
    mapGet(valuesSchemaMap, valueId),
    (valueSchema) => getCellOrValueType(value) != valueSchema[TYPE] ? valueInvalid(valueId, value, valueSchema[DEFAULT]) : value,
    () => valueInvalid(valueId, value)
  ) : isUndefined2(getCellOrValueType(value)) ? valueInvalid(valueId, value) : value;
  const addDefaultsToRow = (row, tableId, rowId) => {
    ifNotUndefined2(
      mapGet(tablesSchemaRowCache, tableId),
      ([rowDefaulted, rowNonDefaulted]) => {
        collForEach(rowDefaulted, (cell, cellId) => {
          if (!objHas(row, cellId)) {
            row[cellId] = cell;
          }
        });
        collForEach(rowNonDefaulted, (cellId) => {
          if (!objHas(row, cellId)) {
            cellInvalid(tableId, rowId, cellId);
          }
        });
      }
    );
    return row;
  };
  const addDefaultsToValues = (values) => {
    if (hasValuesSchema) {
      collForEach(valuesDefaulted, (value, valueId) => {
        if (!objHas(values, valueId)) {
          values[valueId] = value;
        }
      });
      collForEach(valuesNonDefaulted, (valueId) => {
        if (!objHas(values, valueId)) {
          valueInvalid(valueId);
        }
      });
    }
    return values;
  };
  const setValidTablesSchema = (tablesSchema) => mapMatch(
    tablesSchemaMap,
    tablesSchema,
    (_tablesSchema, tableId, tableSchema) => {
      const rowDefaulted = mapNew();
      const rowNonDefaulted = setNew();
      mapMatch(
        mapEnsure(tablesSchemaMap, tableId, mapNew),
        tableSchema,
        (tableSchemaMap, cellId, cellSchema) => {
          mapSet(tableSchemaMap, cellId, cellSchema);
          ifNotUndefined2(
            cellSchema[DEFAULT],
            (def) => mapSet(rowDefaulted, cellId, def),
            () => setAdd(rowNonDefaulted, cellId)
          );
        }
      );
      mapSet(tablesSchemaRowCache, tableId, [rowDefaulted, rowNonDefaulted]);
    },
    (_tablesSchema, tableId) => {
      mapSet(tablesSchemaMap, tableId);
      mapSet(tablesSchemaRowCache, tableId);
    }
  );
  const setValidValuesSchema = (valuesSchema) => mapMatch(
    valuesSchemaMap,
    valuesSchema,
    (_valuesSchema, valueId, valueSchema) => {
      mapSet(valuesSchemaMap, valueId, valueSchema);
      ifNotUndefined2(
        valueSchema[DEFAULT],
        (def) => mapSet(valuesDefaulted, valueId, def),
        () => setAdd(valuesNonDefaulted, valueId)
      );
    },
    (_valuesSchema, valueId) => {
      mapSet(valuesSchemaMap, valueId);
      mapSet(valuesDefaulted, valueId);
      collDel(valuesNonDefaulted, valueId);
    }
  );
  const setOrDelTables = (tables) => objIsEmpty(tables) ? delTables() : setTables(tables);
  const setValidContent = ([tables, values]) => {
    (objIsEmpty(tables) ? delTables : setTables)(tables);
    (objIsEmpty(values) ? delValues : setValues)(values);
  };
  const setValidTables = (tables) => mapMatch(
    tablesMap,
    tables,
    (_tables, tableId, table) => setValidTable(tableId, table),
    (_tables, tableId) => delValidTable(tableId)
  );
  const setValidTable = (tableId, table) => mapMatch(
    mapEnsure(tablesMap, tableId, () => {
      tableIdsChanged(tableId, 1);
      mapSet(tablePoolFunctions, tableId, getPoolFunctions());
      mapSet(tableCellIds, tableId, mapNew());
      return mapNew();
    }),
    table,
    (tableMap, rowId, row) => setValidRow(tableId, tableMap, rowId, row),
    (tableMap, rowId) => delValidRow(tableId, tableMap, rowId)
  );
  const setValidRow = (tableId, tableMap, rowId, row, forceDel) => mapMatch(
    mapEnsure(tableMap, rowId, () => {
      rowIdsChanged(tableId, rowId, 1);
      return mapNew();
    }),
    row,
    (rowMap, cellId, cell) => setValidCell(tableId, rowId, rowMap, cellId, cell),
    (rowMap, cellId) => delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel)
  );
  const setValidCell = (tableId, rowId, rowMap, cellId, cell) => {
    if (!collHas(rowMap, cellId)) {
      cellIdsChanged(tableId, rowId, cellId, 1);
    }
    const oldCell = mapGet(rowMap, cellId);
    if (cell !== oldCell) {
      cellChanged(tableId, rowId, cellId, oldCell, cell);
      mapSet(rowMap, cellId, cell);
    }
  };
  const setCellIntoDefaultRow = (tableId, tableMap, rowId, cellId, validCell) => ifNotUndefined2(
    mapGet(tableMap, rowId),
    (rowMap) => setValidCell(tableId, rowId, rowMap, cellId, validCell),
    () => setValidRow(
      tableId,
      tableMap,
      rowId,
      addDefaultsToRow({ [cellId]: validCell }, tableId, rowId)
    )
  );
  const setOrDelValues = (values) => objIsEmpty(values) ? delValues() : setValues(values);
  const setValidValues = (values) => mapMatch(
    valuesMap,
    values,
    (_valuesMap, valueId, value) => setValidValue(valueId, value),
    (_valuesMap, valueId) => delValidValue(valueId)
  );
  const setValidValue = (valueId, value) => {
    if (!collHas(valuesMap, valueId)) {
      valueIdsChanged(valueId, 1);
    }
    const oldValue = mapGet(valuesMap, valueId);
    if (value !== oldValue) {
      valueChanged(valueId, oldValue, value);
      mapSet(valuesMap, valueId, value);
    }
  };
  const getNewRowId = (tableId, reuse) => {
    const [getId] = mapGet(tablePoolFunctions, tableId);
    let rowId;
    do {
      rowId = getId(reuse);
    } while (collHas(mapGet(tablesMap, tableId), rowId));
    return rowId;
  };
  const getOrCreateTable = (tableId) => mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});
  const delValidTable = (tableId) => setValidTable(tableId, {});
  const delValidRow = (tableId, tableMap, rowId) => {
    const [, releaseId] = mapGet(tablePoolFunctions, tableId);
    releaseId(rowId);
    setValidRow(tableId, tableMap, rowId, {}, true);
  };
  const delValidCell = (tableId, table, rowId, row, cellId, forceDel) => {
    const defaultCell = mapGet(
      mapGet(tablesSchemaRowCache, tableId)?.[0],
      cellId
    );
    if (!isUndefined2(defaultCell) && !forceDel) {
      return setValidCell(tableId, rowId, row, cellId, defaultCell);
    }
    const delCell2 = (cellId2) => {
      cellChanged(tableId, rowId, cellId2, mapGet(row, cellId2));
      cellIdsChanged(tableId, rowId, cellId2, -1);
      mapSet(row, cellId2);
    };
    if (isUndefined2(defaultCell)) {
      delCell2(cellId);
    } else {
      mapForEach(row, delCell2);
    }
    if (collIsEmpty(row)) {
      rowIdsChanged(tableId, rowId, -1);
      if (collIsEmpty(mapSet(table, rowId))) {
        tableIdsChanged(tableId, -1);
        mapSet(tablesMap, tableId);
        mapSet(tablePoolFunctions, tableId);
        mapSet(tableCellIds, tableId);
      }
    }
  };
  const delValidValue = (valueId) => {
    const defaultValue = mapGet(valuesDefaulted, valueId);
    if (!isUndefined2(defaultValue)) {
      return setValidValue(valueId, defaultValue);
    }
    valueChanged(valueId, mapGet(valuesMap, valueId));
    valueIdsChanged(valueId, -1);
    mapSet(valuesMap, valueId);
  };
  const tableIdsChanged = (tableId, addedOrRemoved) => idsChanged(changedTableIds, tableId, addedOrRemoved);
  const rowIdsChanged = (tableId, rowId, addedOrRemoved) => idsChanged(
    mapEnsure(changedRowIds, tableId, mapNew),
    rowId,
    addedOrRemoved
  ) && mapSet(
    changedRowCount,
    tableId,
    mapEnsure(changedRowCount, tableId, () => 0) + addedOrRemoved
  );
  const cellIdsChanged = (tableId, rowId, cellId, addedOrRemoved) => {
    const cellIds = mapGet(tableCellIds, tableId);
    const count = mapGet(cellIds, cellId) ?? 0;
    if (count == 0 && addedOrRemoved == 1 || count == 1 && addedOrRemoved == -1) {
      idsChanged(
        mapEnsure(changedTableCellIds, tableId, mapNew),
        cellId,
        addedOrRemoved
      );
    }
    mapSet(
      cellIds,
      cellId,
      count != -addedOrRemoved ? count + addedOrRemoved : null
    );
    idsChanged(
      mapEnsure(mapEnsure(changedCellIds, tableId, mapNew), rowId, mapNew),
      cellId,
      addedOrRemoved
    );
  };
  const cellChanged = (tableId, rowId, cellId, oldCell, newCell) => {
    mapEnsure(
      mapEnsure(mapEnsure(changedCells, tableId, mapNew), rowId, mapNew),
      cellId,
      () => [oldCell, 0]
    )[1] = newCell;
    internalListeners[3]?.(tableId, rowId, cellId, newCell);
  };
  const valueIdsChanged = (valueId, addedOrRemoved) => idsChanged(changedValueIds, valueId, addedOrRemoved);
  const valueChanged = (valueId, oldValue, newValue) => {
    mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
    internalListeners[4]?.(valueId, newValue);
  };
  const cellInvalid = (tableId, rowId, cellId, invalidCell, defaultedCell) => {
    arrayPush(
      mapEnsure(
        mapEnsure(mapEnsure(invalidCells, tableId, mapNew), rowId, mapNew),
        cellId,
        () => []
      ),
      invalidCell
    );
    return defaultedCell;
  };
  const valueInvalid = (valueId, invalidValue, defaultedValue) => {
    arrayPush(
      mapEnsure(invalidValues, valueId, () => []),
      invalidValue
    );
    return defaultedValue;
  };
  const getCellChange = (tableId, rowId, cellId) => ifNotUndefined2(
    mapGet(mapGet(mapGet(changedCells, tableId), rowId), cellId),
    ([oldCell, newCell]) => [true, oldCell, newCell],
    () => [false, ...pairNew(getCell(tableId, rowId, cellId))]
  );
  const getValueChange = (valueId) => ifNotUndefined2(
    mapGet(changedValues, valueId),
    ([oldValue, newValue]) => [true, oldValue, newValue],
    () => [false, ...pairNew(getValue(valueId))]
  );
  const callInvalidCellListeners = (mutator) => !collIsEmpty(invalidCells) && !collIsEmpty(invalidCellListeners[mutator]) ? collForEach(
    mutator ? mapClone3(invalidCells) : invalidCells,
    (rows, tableId) => collForEach(
      rows,
      (cells, rowId) => collForEach(
        cells,
        (invalidCell, cellId) => callListeners(
          invalidCellListeners[mutator],
          [tableId, rowId, cellId],
          invalidCell
        )
      )
    )
  ) : 0;
  const callInvalidValueListeners = (mutator) => !collIsEmpty(invalidValues) && !collIsEmpty(invalidValueListeners[mutator]) ? collForEach(
    mutator ? mapClone(invalidValues) : invalidValues,
    (invalidValue, valueId) => callListeners(
      invalidValueListeners[mutator],
      [valueId],
      invalidValue
    )
  ) : 0;
  const callIdsAndHasListenersIfChanged = (changedIds, idListeners, hasListeners, ids) => {
    if (!collIsEmpty(changedIds)) {
      callListeners(idListeners, ids, () => mapToObj(changedIds));
      mapForEach(
        changedIds,
        (changedId, changed) => callListeners(hasListeners, [...ids ?? [], changedId], changed == 1)
      );
      return 1;
    }
  };
  const callTabularListenersForChanges = (mutator) => {
    const hasTablesNow = hasTables();
    if (hasTablesNow != hadTables) {
      callListeners(hasTablesListeners[mutator], void 0, hasTablesNow);
    }
    const emptySortedRowIdListeners = collIsEmpty(
      sortedRowIdsListeners[mutator]
    );
    const emptyIdAndHasListeners = collIsEmpty(cellIdsListeners[mutator]) && collIsEmpty(hasCellListeners[mutator]) && collIsEmpty(rowIdsListeners[mutator]) && collIsEmpty(hasRowListeners[mutator]) && collIsEmpty(tableCellIdsListeners[mutator]) && collIsEmpty(hasTableCellListeners[mutator]) && collIsEmpty(rowCountListeners[mutator]) && emptySortedRowIdListeners && collIsEmpty(tableIdsListeners[mutator]) && collIsEmpty(hasTableListeners[mutator]);
    const emptyOtherListeners = collIsEmpty(cellListeners[mutator]) && collIsEmpty(rowListeners[mutator]) && collIsEmpty(tableListeners[mutator]) && collIsEmpty(tablesListeners[mutator]);
    if (!emptyIdAndHasListeners || !emptyOtherListeners) {
      const changes = mutator ? [
        mapClone(changedTableIds),
        mapClone2(changedTableCellIds),
        mapClone(changedRowCount),
        mapClone2(changedRowIds),
        mapClone3(changedCellIds),
        mapClone3(changedCells)
      ] : [
        changedTableIds,
        changedTableCellIds,
        changedRowCount,
        changedRowIds,
        changedCellIds,
        changedCells
      ];
      if (!emptyIdAndHasListeners) {
        callIdsAndHasListenersIfChanged(
          changes[0],
          tableIdsListeners[mutator],
          hasTableListeners[mutator]
        );
        collForEach(
          changes[1],
          (changedIds, tableId) => callIdsAndHasListenersIfChanged(
            changedIds,
            tableCellIdsListeners[mutator],
            hasTableCellListeners[mutator],
            [tableId]
          )
        );
        collForEach(changes[2], (changedCount, tableId) => {
          if (changedCount != 0) {
            callListeners(
              rowCountListeners[mutator],
              [tableId],
              getRowCount(tableId)
            );
          }
        });
        const calledSortableTableIds = setNew();
        collForEach(changes[3], (changedIds, tableId) => {
          if (callIdsAndHasListenersIfChanged(
            changedIds,
            rowIdsListeners[mutator],
            hasRowListeners[mutator],
            [tableId]
          ) && !emptySortedRowIdListeners) {
            callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
            setAdd(calledSortableTableIds, tableId);
          }
        });
        if (!emptySortedRowIdListeners) {
          collForEach(changes[5], (rows, tableId) => {
            if (!collHas(calledSortableTableIds, tableId)) {
              const sortableCellIds = setNew();
              collForEach(
                rows,
                (cells) => collForEach(
                  cells,
                  ([oldCell, newCell], cellId) => newCell !== oldCell ? setAdd(sortableCellIds, cellId) : collDel(cells, cellId)
                )
              );
              collForEach(
                sortableCellIds,
                (cellId) => callListeners(sortedRowIdsListeners[mutator], [
                  tableId,
                  cellId
                ])
              );
            }
          });
        }
        collForEach(
          changes[4],
          (rowCellIds, tableId) => collForEach(
            rowCellIds,
            (changedIds, rowId) => callIdsAndHasListenersIfChanged(
              changedIds,
              cellIdsListeners[mutator],
              hasCellListeners[mutator],
              [tableId, rowId]
            )
          )
        );
      }
      if (!emptyOtherListeners) {
        let tablesChanged;
        collForEach(changes[5], (rows, tableId) => {
          let tableChanged;
          collForEach(rows, (cells, rowId) => {
            let rowChanged;
            collForEach(cells, ([oldCell, newCell], cellId) => {
              if (newCell !== oldCell) {
                callListeners(
                  cellListeners[mutator],
                  [tableId, rowId, cellId],
                  newCell,
                  oldCell,
                  getCellChange
                );
                tablesChanged = tableChanged = rowChanged = 1;
              }
            });
            if (rowChanged) {
              callListeners(
                rowListeners[mutator],
                [tableId, rowId],
                getCellChange
              );
            }
          });
          if (tableChanged) {
            callListeners(tableListeners[mutator], [tableId], getCellChange);
          }
        });
        if (tablesChanged) {
          callListeners(tablesListeners[mutator], void 0, getCellChange);
        }
      }
    }
  };
  const callValuesListenersForChanges = (mutator) => {
    const hasValuesNow = hasValues();
    if (hasValuesNow != hadValues) {
      callListeners(hasValuesListeners[mutator], void 0, hasValuesNow);
    }
    const emptyIdAndHasListeners = collIsEmpty(valueIdsListeners[mutator]) && collIsEmpty(hasValueListeners[mutator]);
    const emptyOtherListeners = collIsEmpty(valueListeners[mutator]) && collIsEmpty(valuesListeners[mutator]);
    if (!emptyIdAndHasListeners || !emptyOtherListeners) {
      const changes = mutator ? [mapClone(changedValueIds), mapClone(changedValues)] : [changedValueIds, changedValues];
      if (!emptyIdAndHasListeners) {
        callIdsAndHasListenersIfChanged(
          changes[0],
          valueIdsListeners[mutator],
          hasValueListeners[mutator]
        );
      }
      if (!emptyOtherListeners) {
        let valuesChanged;
        collForEach(changes[1], ([oldValue, newValue], valueId) => {
          if (newValue !== oldValue) {
            callListeners(
              valueListeners[mutator],
              [valueId],
              newValue,
              oldValue,
              getValueChange
            );
            valuesChanged = 1;
          }
        });
        if (valuesChanged) {
          callListeners(valuesListeners[mutator], void 0, getValueChange);
        }
      }
    }
  };
  const fluentTransaction = (actions, ...args) => {
    transaction(() => actions(...arrayMap2(args, id)));
    return store;
  };
  const getContent = () => [getTables(), getValues()];
  const getTables = () => mapToObj3(tablesMap);
  const getTableIds = () => mapKeys(tablesMap);
  const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)));
  const getTableCellIds = (tableId) => mapKeys(mapGet(tableCellIds, id(tableId)));
  const getRowCount = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
  const getRowIds = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
  const getSortedRowIds = (tableId, cellId, descending, offset = 0, limit) => arrayMap2(
    slice(
      arraySort(
        mapMap(mapGet(tablesMap, id(tableId)), (row, rowId) => [
          isUndefined2(cellId) ? rowId : mapGet(row, id(cellId)),
          rowId
        ]),
        ([cell1], [cell2]) => defaultSorter(cell1, cell2) * (descending ? -1 : 1)
      ),
      offset,
      isUndefined2(limit) ? limit : offset + limit
    ),
    ([, rowId]) => rowId
  );
  const getRow = (tableId, rowId) => mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCellIds = (tableId, rowId) => mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCell = (tableId, rowId, cellId) => mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
  const getValues = () => mapToObj(valuesMap);
  const getValueIds = () => mapKeys(valuesMap);
  const getValue = (valueId) => mapGet(valuesMap, id(valueId));
  const hasTables = () => !collIsEmpty(tablesMap);
  const hasTable = (tableId) => collHas(tablesMap, id(tableId));
  const hasTableCell = (tableId, cellId) => collHas(mapGet(tableCellIds, id(tableId)), id(cellId));
  const hasRow = (tableId, rowId) => collHas(mapGet(tablesMap, id(tableId)), id(rowId));
  const hasCell = (tableId, rowId, cellId) => collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
  const hasValues = () => !collIsEmpty(valuesMap);
  const hasValue = (valueId) => collHas(valuesMap, id(valueId));
  const getTablesJson = () => jsonStringWithMap(tablesMap);
  const getValuesJson = () => jsonStringWithMap(valuesMap);
  const getJson = () => jsonStringWithMap([tablesMap, valuesMap]);
  const getTablesSchemaJson = () => jsonStringWithMap(tablesSchemaMap);
  const getValuesSchemaJson = () => jsonStringWithMap(valuesSchemaMap);
  const getSchemaJson = () => jsonStringWithMap([tablesSchemaMap, valuesSchemaMap]);
  const setContent = (content) => fluentTransaction(() => {
    const content2 = isFunction2(content) ? content() : content;
    if (validateContent(content2)) {
      setValidContent(content2);
    }
  });
  const setTables = (tables) => fluentTransaction(
    () => validateTables(tables) ? setValidTables(tables) : 0
  );
  const setTable = (tableId, table) => fluentTransaction(
    (tableId2) => validateTable(table, tableId2) ? setValidTable(tableId2, table) : 0,
    tableId
  );
  const setRow = (tableId, rowId, row) => fluentTransaction(
    (tableId2, rowId2) => validateRow(tableId2, rowId2, row) ? setValidRow(tableId2, getOrCreateTable(tableId2), rowId2, row) : 0,
    tableId,
    rowId
  );
  const addRow = (tableId, row, reuseRowIds = true) => transaction(() => {
    let rowId = void 0;
    if (validateRow(tableId, rowId, row)) {
      tableId = id(tableId);
      setValidRow(
        tableId,
        getOrCreateTable(tableId),
        rowId = getNewRowId(tableId, reuseRowIds ? 1 : 0),
        row
      );
    }
    return rowId;
  });
  const setPartialRow = (tableId, rowId, partialRow) => fluentTransaction(
    (tableId2, rowId2) => {
      if (validateRow(tableId2, rowId2, partialRow, 1)) {
        const table = getOrCreateTable(tableId2);
        objMap(
          partialRow,
          (cell, cellId) => setCellIntoDefaultRow(tableId2, table, rowId2, cellId, cell)
        );
      }
    },
    tableId,
    rowId
  );
  const setCell = (tableId, rowId, cellId, cell) => fluentTransaction(
    (tableId2, rowId2, cellId2) => ifNotUndefined2(
      getValidatedCell(
        tableId2,
        rowId2,
        cellId2,
        isFunction2(cell) ? cell(getCell(tableId2, rowId2, cellId2)) : cell
      ),
      (validCell) => setCellIntoDefaultRow(
        tableId2,
        getOrCreateTable(tableId2),
        rowId2,
        cellId2,
        validCell
      )
    ),
    tableId,
    rowId,
    cellId
  );
  const setValues = (values) => fluentTransaction(
    () => validateValues(values) ? setValidValues(values) : 0
  );
  const setPartialValues = (partialValues) => fluentTransaction(
    () => validateValues(partialValues, 1) ? objMap(
      partialValues,
      (value, valueId) => setValidValue(valueId, value)
    ) : 0
  );
  const setValue = (valueId, value) => fluentTransaction(
    (valueId2) => ifNotUndefined2(
      getValidatedValue(
        valueId2,
        isFunction2(value) ? value(getValue(valueId2)) : value
      ),
      (validValue) => setValidValue(valueId2, validValue)
    ),
    valueId
  );
  const applyChanges = (changes) => fluentTransaction(() => {
    objMap(
      changes[0],
      (table, tableId) => isUndefined2(table) ? delTable(tableId) : objMap(
        table,
        (row, rowId) => isUndefined2(row) ? delRow(tableId, rowId) : objMap(
          row,
          (cell, cellId) => setOrDelCell(store, tableId, rowId, cellId, cell)
        )
      )
    );
    objMap(
      changes[1],
      (value, valueId) => setOrDelValue(store, valueId, value)
    );
  });
  const setTablesJson = (tablesJson) => {
    try {
      setOrDelTables(jsonParse(tablesJson));
    } catch {
    }
    return store;
  };
  const setValuesJson = (valuesJson) => {
    try {
      setOrDelValues(jsonParse(valuesJson));
    } catch {
    }
    return store;
  };
  const setJson = (tablesAndValuesJson) => fluentTransaction(() => {
    try {
      const [tables, values] = jsonParse(tablesAndValuesJson);
      setOrDelTables(tables);
      setOrDelValues(values);
    } catch {
      setTablesJson(tablesAndValuesJson);
    }
  });
  const setTablesSchema = (tablesSchema) => fluentTransaction(() => {
    if (hasTablesSchema = validateTablesSchema(tablesSchema)) {
      setValidTablesSchema(tablesSchema);
      if (!collIsEmpty(tablesMap)) {
        const tables = getTables();
        delTables();
        setTables(tables);
      }
    }
  });
  const setValuesSchema = (valuesSchema) => fluentTransaction(() => {
    if (hasValuesSchema = validateValuesSchema(valuesSchema)) {
      const values = getValues();
      delValuesSchema();
      delValues();
      hasValuesSchema = true;
      setValidValuesSchema(valuesSchema);
      setValues(values);
    }
  });
  const setSchema = (tablesSchema, valuesSchema) => fluentTransaction(() => {
    setTablesSchema(tablesSchema);
    setValuesSchema(valuesSchema);
  });
  const delTables = () => fluentTransaction(() => setValidTables({}));
  const delTable = (tableId) => fluentTransaction(
    (tableId2) => collHas(tablesMap, tableId2) ? delValidTable(tableId2) : 0,
    tableId
  );
  const delRow = (tableId, rowId) => fluentTransaction(
    (tableId2, rowId2) => ifNotUndefined2(
      mapGet(tablesMap, tableId2),
      (tableMap) => collHas(tableMap, rowId2) ? delValidRow(tableId2, tableMap, rowId2) : 0
    ),
    tableId,
    rowId
  );
  const delCell = (tableId, rowId, cellId, forceDel) => fluentTransaction(
    (tableId2, rowId2, cellId2) => ifNotUndefined2(
      mapGet(tablesMap, tableId2),
      (tableMap) => ifNotUndefined2(
        mapGet(tableMap, rowId2),
        (rowMap) => collHas(rowMap, cellId2) ? delValidCell(
          tableId2,
          tableMap,
          rowId2,
          rowMap,
          cellId2,
          forceDel
        ) : 0
      )
    ),
    tableId,
    rowId,
    cellId
  );
  const delValues = () => fluentTransaction(() => setValidValues({}));
  const delValue = (valueId) => fluentTransaction(
    (valueId2) => collHas(valuesMap, valueId2) ? delValidValue(valueId2) : 0,
    valueId
  );
  const delTablesSchema = () => fluentTransaction(() => {
    setValidTablesSchema({});
    hasTablesSchema = false;
  });
  const delValuesSchema = () => fluentTransaction(() => {
    setValidValuesSchema({});
    hasValuesSchema = false;
  });
  const delSchema = () => fluentTransaction(() => {
    delTablesSchema();
    delValuesSchema();
  });
  const transaction = (actions, doRollback) => {
    if (transactions != -1) {
      startTransaction();
      const result = actions();
      finishTransaction(doRollback);
      return result;
    }
  };
  const startTransaction = () => {
    if (transactions != -1) {
      transactions++;
    }
    if (transactions == 1) {
      internalListeners[0]?.();
      callListeners(startTransactionListeners);
    }
    return store;
  };
  const getTransactionChanges = () => [
    mapToObj(
      changedCells,
      (table, tableId) => mapGet(changedTableIds, tableId) === -1 ? void 0 : mapToObj(
        table,
        (row, rowId) => mapGet(mapGet(changedRowIds, tableId), rowId) === -1 ? void 0 : mapToObj(
          row,
          ([, newCell]) => newCell,
          (changedCell) => pairIsEqual(changedCell)
        ),
        collIsEmpty,
        objIsEmpty
      ),
      collIsEmpty,
      objIsEmpty
    ),
    mapToObj(
      changedValues,
      ([, newValue]) => newValue,
      (changedValue) => pairIsEqual(changedValue)
    ),
    1
  ];
  const getTransactionLog = () => [
    !collIsEmpty(changedCells),
    !collIsEmpty(changedValues),
    mapToObj3(changedCells, pairClone, pairIsEqual),
    mapToObj3(invalidCells),
    mapToObj(changedValues, pairClone, pairIsEqual),
    mapToObj(invalidValues),
    mapToObj(changedTableIds),
    mapToObj2(changedRowIds),
    mapToObj3(changedCellIds),
    mapToObj(changedValueIds)
  ];
  const finishTransaction = (doRollback) => {
    if (transactions > 0) {
      transactions--;
      if (transactions == 0) {
        transactions = 1;
        callInvalidCellListeners(1);
        if (!collIsEmpty(changedCells)) {
          callTabularListenersForChanges(1);
        }
        callInvalidValueListeners(1);
        if (!collIsEmpty(changedValues)) {
          callValuesListenersForChanges(1);
        }
        if (doRollback?.(store)) {
          collForEach(
            changedCells,
            (table, tableId) => collForEach(
              table,
              (row, rowId) => collForEach(
                row,
                ([oldCell], cellId) => setOrDelCell(store, tableId, rowId, cellId, oldCell)
              )
            )
          );
          collClear(changedCells);
          collForEach(
            changedValues,
            ([oldValue], valueId) => setOrDelValue(store, valueId, oldValue)
          );
          collClear(changedValues);
        }
        callListeners(finishTransactionListeners[0], void 0);
        transactions = -1;
        callInvalidCellListeners(0);
        if (!collIsEmpty(changedCells)) {
          callTabularListenersForChanges(0);
        }
        callInvalidValueListeners(0);
        if (!collIsEmpty(changedValues)) {
          callValuesListenersForChanges(0);
        }
        internalListeners[1]?.();
        callListeners(finishTransactionListeners[1], void 0);
        internalListeners[2]?.();
        transactions = 0;
        hadTables = hasTables();
        hadValues = hasValues();
        arrayForEach(
          [
            changedTableIds,
            changedTableCellIds,
            changedRowCount,
            changedRowIds,
            changedCellIds,
            changedCells,
            invalidCells,
            changedValueIds,
            changedValues,
            invalidValues
          ],
          collClear
        );
      }
    }
    return store;
  };
  const forEachTable = (tableCallback) => collForEach(
    tablesMap,
    (tableMap, tableId) => tableCallback(
      tableId,
      (rowCallback) => collForEach(
        tableMap,
        (rowMap, rowId) => rowCallback(
          rowId,
          (cellCallback) => mapForEach(rowMap, cellCallback)
        )
      )
    )
  );
  const forEachTableCell = (tableId, tableCellCallback) => mapForEach(mapGet(tableCellIds, id(tableId)), tableCellCallback);
  const forEachRow = (tableId, rowCallback) => collForEach(
    mapGet(tablesMap, id(tableId)),
    (rowMap, rowId) => rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback))
  );
  const forEachCell = (tableId, rowId, cellCallback) => mapForEach(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), cellCallback);
  const forEachValue = (valueCallback) => mapForEach(valuesMap, valueCallback);
  const addSortedRowIdsListener = (tableId, cellId, descending, offset, limit, listener, mutator) => {
    let sortedRowIds = getSortedRowIds(
      tableId,
      cellId,
      descending,
      offset,
      limit
    );
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds(
          tableId,
          cellId,
          descending,
          offset,
          limit
        );
        if (!arrayIsEqual2(newSortedRowIds, sortedRowIds)) {
          sortedRowIds = newSortedRowIds;
          listener(
            store,
            tableId,
            cellId,
            descending,
            offset,
            limit,
            sortedRowIds
          );
        }
      },
      sortedRowIdsListeners[mutator ? 1 : 0],
      [tableId, cellId],
      [getTableIds]
    );
  };
  const addStartTransactionListener = (listener) => addListener(listener, startTransactionListeners);
  const addWillFinishTransactionListener = (listener) => addListener(listener, finishTransactionListeners[0]);
  const addDidFinishTransactionListener = (listener) => addListener(listener, finishTransactionListeners[1]);
  const callListener = (listenerId) => {
    callListenerImpl(listenerId);
    return store;
  };
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return store;
  };
  const getListenerStats = () => ({
    hasTables: pairCollSize2(hasTablesListeners),
    tables: pairCollSize2(tablesListeners),
    tableIds: pairCollSize2(tableIdsListeners),
    hasTable: pairCollSize2(hasTableListeners),
    table: pairCollSize2(tableListeners),
    tableCellIds: pairCollSize2(tableCellIdsListeners),
    hasTableCell: pairCollSize2(hasTableCellListeners, collSize3),
    rowCount: pairCollSize2(rowCountListeners),
    rowIds: pairCollSize2(rowIdsListeners),
    sortedRowIds: pairCollSize2(sortedRowIdsListeners),
    hasRow: pairCollSize2(hasRowListeners, collSize3),
    row: pairCollSize2(rowListeners, collSize3),
    cellIds: pairCollSize2(cellIdsListeners, collSize3),
    hasCell: pairCollSize2(hasCellListeners, collSize4),
    cell: pairCollSize2(cellListeners, collSize4),
    invalidCell: pairCollSize2(invalidCellListeners, collSize4),
    hasValues: pairCollSize2(hasValuesListeners),
    values: pairCollSize2(valuesListeners),
    valueIds: pairCollSize2(valueIdsListeners),
    hasValue: pairCollSize2(hasValueListeners),
    value: pairCollSize2(valueListeners),
    invalidValue: pairCollSize2(invalidValueListeners),
    transaction: collSize2(startTransactionListeners) + pairCollSize2(finishTransactionListeners)
  });
  const setInternalListeners = (preStartTransaction, preFinishTransaction, postFinishTransaction, cellChanged2, valueChanged2) => internalListeners = [
    preStartTransaction,
    preFinishTransaction,
    postFinishTransaction,
    cellChanged2,
    valueChanged2
  ];
  const store = {
    getContent,
    getTables,
    getTableIds,
    getTable,
    getTableCellIds,
    getRowCount,
    getRowIds,
    getSortedRowIds,
    getRow,
    getCellIds,
    getCell,
    getValues,
    getValueIds,
    getValue,
    hasTables,
    hasTable,
    hasTableCell,
    hasRow,
    hasCell,
    hasValues,
    hasValue,
    getTablesJson,
    getValuesJson,
    getJson,
    getTablesSchemaJson,
    getValuesSchemaJson,
    getSchemaJson,
    hasTablesSchema: () => hasTablesSchema,
    hasValuesSchema: () => hasValuesSchema,
    setContent,
    setTables,
    setTable,
    setRow,
    addRow,
    setPartialRow,
    setCell,
    setValues,
    setPartialValues,
    setValue,
    applyChanges,
    setTablesJson,
    setValuesJson,
    setJson,
    setTablesSchema,
    setValuesSchema,
    setSchema,
    delTables,
    delTable,
    delRow,
    delCell,
    delValues,
    delValue,
    delTablesSchema,
    delValuesSchema,
    delSchema,
    transaction,
    startTransaction,
    getTransactionChanges,
    getTransactionLog,
    finishTransaction,
    forEachTable,
    forEachTableCell,
    forEachRow,
    forEachCell,
    forEachValue,
    addSortedRowIdsListener,
    addStartTransactionListener,
    addWillFinishTransactionListener,
    addDidFinishTransactionListener,
    callListener,
    delListener,
    getListenerStats,
    isMergeable: () => false,
    // only used internally by other modules
    createStore,
    addListener,
    callListeners,
    setInternalListeners
  };
  objMap(
    {
      [HAS2 + TABLES2]: [0, hasTablesListeners, [], () => [hasTables()]],
      [TABLES2]: [0, tablesListeners],
      [TABLE_IDS2]: [0, tableIdsListeners],
      [HAS2 + TABLE2]: [
        1,
        hasTableListeners,
        [getTableIds],
        (ids) => [hasTable(...ids)]
      ],
      [TABLE2]: [1, tableListeners, [getTableIds]],
      [TABLE2 + CELL_IDS2]: [1, tableCellIdsListeners, [getTableIds]],
      [HAS2 + TABLE2 + CELL2]: [
        2,
        hasTableCellListeners,
        [getTableIds, getTableCellIds],
        (ids) => [hasTableCell(...ids)]
      ],
      [ROW_COUNT2]: [1, rowCountListeners, [getTableIds]],
      [ROW_IDS2]: [1, rowIdsListeners, [getTableIds]],
      [HAS2 + ROW2]: [
        2,
        hasRowListeners,
        [getTableIds, getRowIds],
        (ids) => [hasRow(...ids)]
      ],
      [ROW2]: [2, rowListeners, [getTableIds, getRowIds]],
      [CELL_IDS2]: [2, cellIdsListeners, [getTableIds, getRowIds]],
      [HAS2 + CELL2]: [
        3,
        hasCellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids) => [hasCell(...ids)]
      ],
      [CELL2]: [
        3,
        cellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids) => pairNew(getCell(...ids))
      ],
      InvalidCell: [3, invalidCellListeners],
      [HAS2 + VALUES2]: [0, hasValuesListeners, [], () => [hasValues()]],
      [VALUES2]: [0, valuesListeners],
      [VALUE_IDS2]: [0, valueIdsListeners],
      [HAS2 + VALUE2]: [
        1,
        hasValueListeners,
        [getValueIds],
        (ids) => [hasValue(...ids)]
      ],
      [VALUE2]: [
        1,
        valueListeners,
        [getValueIds],
        (ids) => pairNew(getValue(ids[0]))
      ],
      InvalidValue: [1, invalidValueListeners]
    },
    ([argumentCount, idSetNode, pathGetters, extraArgsGetter], listenable) => {
      store[ADD2 + listenable + LISTENER2] = (...args) => addListener(
        args[argumentCount],
        idSetNode[args[argumentCount + 1] ? 1 : 0],
        argumentCount > 0 ? slice(args, 0, argumentCount) : void 0,
        pathGetters,
        extraArgsGetter
      );
    }
  );
  return objFreeze(store);
};
var {
  PureComponent: PureComponent2,
  createContext: createContext2,
  useCallback: useCallback2,
  useContext: useContext2,
  useEffect: useEffect2,
  useLayoutEffect: useLayoutEffect2,
  useMemo: useMemo2,
  useRef: useRef2,
  useState: useState2,
  useSyncExternalStore: useSyncExternalStore2
} = React2;
var getProps2 = (getProps22, ...ids) => isUndefined2(getProps22) ? {} : getProps22(...ids);
var getRelationshipsStoreTableIds = (relationships, relationshipId) => [
  relationships,
  relationships?.getStore(),
  relationships?.getLocalTableId(relationshipId),
  relationships?.getRemoteTableId(relationshipId)
];
var getIndexStoreTableId = (indexes, indexId) => [
  indexes,
  indexes?.getStore(),
  indexes?.getTableId(indexId)
];
var UNIQUE_ID = "tinybaseInspector";
var TITLE = "TinyBase Inspector";
var POSITIONS = ["left", "top", "bottom", "right", "full"];
var STATE_TABLE = "state";
var SORT_CELL = "sort";
var OPEN_CELL = "open";
var POSITION_VALUE = "position";
var OPEN_VALUE = OPEN_CELL;
var EDITABLE_CELL = "editable";
var getUniqueId = (...args) => jsonStringWithMap(args);
var sortedIdsMap = (ids, callback) => arrayMap2(arraySort([...ids]), callback);
var useEditable = (uniqueId, s) => [
  !!useCell(STATE_TABLE, uniqueId, EDITABLE_CELL, s),
  useCallback2(
    (event) => {
      s.setCell(STATE_TABLE, uniqueId, EDITABLE_CELL, (editable) => !editable);
      event.preventDefault();
    },
    [s, uniqueId]
  )
];
var Nub = ({ s }) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;
  const handleOpen = useSetValueCallback(OPEN_VALUE, () => true, [], s);
  return useValue(OPEN_VALUE, s) ? null : /* @__PURE__ */ jsx2("img", {
    onClick: handleOpen,
    title: TITLE,
    "data-position": position
  });
};
var DOT = ".";
var EDITABLE = "editable";
var LEFT_ARROW = "\u2190";
var UP_ARROW = "\u2191";
var RIGHT_ARROW = "\u2192";
var DOWN_ARROW = "\u2193";
var useDottedCellIds = (tableId, store) => arrayMap2(useTableCellIds(tableId, store), (cellId) => tableId + DOT + cellId);
var useCallbackOrUndefined = (callback, deps, test2) => {
  const returnCallback = useCallback2(callback, deps);
  return test2 ? returnCallback : void 0;
};
var useParams = (...args) => useMemo2(
  () => args,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  args
);
var useStoreCellComponentProps = (store, tableId) => useMemo2(() => ({ store, tableId }), [store, tableId]);
var useQueriesCellComponentProps = (queries, queryId) => useMemo2(() => ({ queries, queryId }), [queries, queryId]);
var useSortingAndPagination = (cellId, descending = false, sortOnClick, offset = 0, limit, total, paginator, onChange) => {
  const [[currentCellId, currentDescending, currentOffset], setState] = useState2([cellId, descending, offset]);
  const setStateAndChange = useCallback2(
    (sortAndOffset) => {
      setState(sortAndOffset);
      onChange?.(sortAndOffset);
    },
    [onChange]
  );
  const handleSort = useCallbackOrUndefined(
    (cellId2) => setStateAndChange([
      cellId2,
      cellId2 == currentCellId ? !currentDescending : false,
      currentOffset
    ]),
    [setStateAndChange, currentCellId, currentDescending, currentOffset],
    sortOnClick
  );
  const handleChangeOffset = useCallback2(
    (offset2) => setStateAndChange([currentCellId, currentDescending, offset2]),
    [setStateAndChange, currentCellId, currentDescending]
  );
  const PaginatorComponent = paginator === true ? SortedTablePaginator : paginator;
  return [
    [currentCellId, currentDescending, currentOffset],
    handleSort,
    useMemo2(
      () => paginator === false ? null : /* @__PURE__ */ jsx2(PaginatorComponent, {
        offset: currentOffset,
        limit,
        total,
        onChange: handleChangeOffset
      }),
      [
        paginator,
        PaginatorComponent,
        currentOffset,
        limit,
        total,
        handleChangeOffset
      ]
    )
  ];
};
var useCells = (defaultCellIds, customCells, defaultCellComponent) => useMemo2(() => {
  const cellIds = customCells ?? defaultCellIds;
  return objMap(
    isArray2(cellIds) ? objNew(arrayMap2(cellIds, (cellId) => [cellId, cellId])) : cellIds,
    (labelOrCustomCell, cellId) => ({
      ...{ label: cellId, component: defaultCellComponent },
      ...isString2(labelOrCustomCell) ? { label: labelOrCustomCell } : labelOrCustomCell
    })
  );
}, [customCells, defaultCellComponent, defaultCellIds]);
var HtmlTable = ({
  className,
  headerRow,
  idColumn,
  params: [
    cells,
    cellComponentProps,
    rowIds,
    sortAndOffset,
    handleSort,
    paginatorComponent
  ]
}) => /* @__PURE__ */ jsxs("table", {
  className,
  children: [
    paginatorComponent ? /* @__PURE__ */ jsx2("caption", { children: paginatorComponent }) : null,
    headerRow === false ? null : /* @__PURE__ */ jsx2("thead", {
      children: /* @__PURE__ */ jsxs("tr", {
        children: [
          idColumn === false ? null : /* @__PURE__ */ jsx2(HtmlHeaderCell, {
            sort: sortAndOffset ?? [],
            label: "Id",
            onClick: handleSort
          }),
          objToArray(
            cells,
            ({ label }, cellId) => /* @__PURE__ */ jsx2(
              HtmlHeaderCell,
              {
                cellId,
                label,
                sort: sortAndOffset ?? [],
                onClick: handleSort
              },
              cellId
            )
          )
        ]
      })
    }),
    /* @__PURE__ */ jsx2("tbody", {
      children: arrayMap2(
        rowIds,
        (rowId) => /* @__PURE__ */ jsxs(
          "tr",
          {
            children: [
              idColumn === false ? null : /* @__PURE__ */ jsx2("th", { children: rowId }),
              objToArray(
                cells,
                ({ component: CellView2, getComponentProps }, cellId) => /* @__PURE__ */ jsx2(
                  "td",
                  {
                    children: /* @__PURE__ */ jsx2(CellView2, {
                      ...getProps2(getComponentProps, rowId, cellId),
                      ...cellComponentProps,
                      rowId,
                      cellId
                    })
                  },
                  cellId
                )
              )
            ]
          },
          rowId
        )
      )
    })
  ]
});
var HtmlHeaderCell = ({
  cellId,
  sort: [sortCellId, sortDescending],
  label = cellId ?? EMPTY_STRING2,
  onClick
}) => /* @__PURE__ */ jsxs("th", {
  onClick: useCallbackOrUndefined(
    () => onClick?.(cellId),
    [onClick, cellId],
    onClick
  ),
  className: isUndefined2(sortDescending) || sortCellId != cellId ? void 0 : `sorted ${sortDescending ? "de" : "a"}scending`,
  children: [
    isUndefined2(sortDescending) || sortCellId != cellId ? null : (sortDescending ? DOWN_ARROW : UP_ARROW) + " ",
    label
  ]
});
var RelationshipInHtmlRow = ({
  localRowId,
  params: [
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store
  ]
}) => {
  const remoteRowId = useRemoteRowId(relationshipId, localRowId, relationships);
  return /* @__PURE__ */ jsxs("tr", {
    children: [
      idColumn === false ? null : /* @__PURE__ */ jsxs(Fragment, {
        children: [
          /* @__PURE__ */ jsx2("th", { children: localRowId }),
          /* @__PURE__ */ jsx2("th", { children: remoteRowId })
        ]
      }),
      objToArray(
        cells,
        ({ component: CellView2, getComponentProps }, compoundCellId) => {
          const [tableId, cellId] = strSplit(compoundCellId, DOT, 2);
          const rowId = tableId === localTableId ? localRowId : tableId === remoteTableId ? remoteRowId : null;
          return isUndefined2(rowId) ? null : /* @__PURE__ */ jsx2(
            "td",
            {
              children: /* @__PURE__ */ jsx2(CellView2, {
                ...getProps2(getComponentProps, rowId, cellId),
                store,
                tableId,
                rowId,
                cellId
              })
            },
            compoundCellId
          );
        }
      )
    ]
  });
};
var EditableThing = ({
  thing,
  onThingChange,
  className,
  hasSchema,
  showType = true
}) => {
  const [thingType, setThingType] = useState2();
  const [currentThing, setCurrentThing] = useState2();
  const [stringThing, setStringThing] = useState2();
  const [numberThing, setNumberThing] = useState2();
  const [booleanThing, setBooleanThing] = useState2();
  if (currentThing !== thing) {
    setThingType(getCellOrValueType(thing));
    setCurrentThing(thing);
    setStringThing(String(thing));
    setNumberThing(Number(thing) || 0);
    setBooleanThing(Boolean(thing));
  }
  const handleThingChange = useCallback2(
    (thing2, setTypedThing) => {
      setTypedThing(thing2);
      setCurrentThing(thing2);
      onThingChange(thing2);
    },
    [onThingChange]
  );
  const handleTypeChange = useCallback2(() => {
    if (!hasSchema?.()) {
      const nextType = getTypeCase(thingType, NUMBER, BOOLEAN, STRING2);
      const thing2 = getTypeCase(
        nextType,
        stringThing,
        numberThing,
        booleanThing
      );
      setThingType(nextType);
      setCurrentThing(thing2);
      onThingChange(thing2);
    }
  }, [
    hasSchema,
    onThingChange,
    stringThing,
    numberThing,
    booleanThing,
    thingType
  ]);
  return /* @__PURE__ */ jsxs("div", {
    className,
    children: [
      showType ? /* @__PURE__ */ jsx2("button", {
        className: thingType,
        onClick: handleTypeChange,
        children: thingType
      }) : null,
      getTypeCase(
        thingType,
        /* @__PURE__ */ jsx2(
          "input",
          {
            value: stringThing,
            onChange: useCallback2(
              (event) => handleThingChange(
                String(event[CURRENT_TARGET][_VALUE]),
                setStringThing
              ),
              [handleThingChange]
            )
          },
          thingType
        ),
        /* @__PURE__ */ jsx2(
          "input",
          {
            type: "number",
            value: numberThing,
            onChange: useCallback2(
              (event) => handleThingChange(
                Number(event[CURRENT_TARGET][_VALUE] || 0),
                setNumberThing
              ),
              [handleThingChange]
            )
          },
          thingType
        ),
        /* @__PURE__ */ jsx2(
          "input",
          {
            type: "checkbox",
            checked: booleanThing,
            onChange: useCallback2(
              (event) => handleThingChange(
                Boolean(event[CURRENT_TARGET].checked),
                setBooleanThing
              ),
              [handleThingChange]
            )
          },
          thingType
        )
      )
    ]
  });
};
var SortedTableInHtmlTable = ({
  tableId,
  cellId,
  descending,
  offset,
  limit,
  store,
  editable,
  sortOnClick,
  paginator = false,
  onChange,
  customCells,
  ...props
}) => {
  const [sortAndOffset, handleSort, paginatorComponent] = useSortingAndPagination(
    cellId,
    descending,
    sortOnClick,
    offset,
    limit,
    useRowCount(tableId, store),
    paginator,
    onChange
  );
  return /* @__PURE__ */ jsx2(HtmlTable, {
    ...props,
    params: useParams(
      useCells(
        useTableCellIds(tableId, store),
        customCells,
        editable ? EditableCellView : CellView
      ),
      useStoreCellComponentProps(store, tableId),
      useSortedRowIds(tableId, ...sortAndOffset, limit, store),
      sortAndOffset,
      handleSort,
      paginatorComponent
    )
  });
};
var ValuesInHtmlTable = ({
  store,
  editable = false,
  valueComponent: Value = editable ? EditableValueView : ValueView,
  getValueComponentProps,
  className,
  headerRow,
  idColumn
}) => /* @__PURE__ */ jsxs("table", {
  className,
  children: [
    headerRow === false ? null : /* @__PURE__ */ jsx2("thead", {
      children: /* @__PURE__ */ jsxs("tr", {
        children: [
          idColumn === false ? null : /* @__PURE__ */ jsx2("th", { children: "Id" }),
          /* @__PURE__ */ jsx2("th", { children: VALUE2 })
        ]
      })
    }),
    /* @__PURE__ */ jsx2("tbody", {
      children: arrayMap2(
        useValueIds(store),
        (valueId) => /* @__PURE__ */ jsxs(
          "tr",
          {
            children: [
              idColumn === false ? null : /* @__PURE__ */ jsx2("th", { children: valueId }),
              /* @__PURE__ */ jsx2("td", {
                children: /* @__PURE__ */ jsx2(Value, {
                  ...getProps2(getValueComponentProps, valueId),
                  valueId,
                  store
                })
              })
            ]
          },
          valueId
        )
      )
    })
  ]
});
var SliceInHtmlTable = ({
  indexId,
  sliceId,
  indexes,
  editable,
  customCells,
  ...props
}) => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById(indexes),
    indexId
  );
  return /* @__PURE__ */ jsx2(HtmlTable, {
    ...props,
    params: useParams(
      useCells(
        useTableCellIds(tableId, store),
        customCells,
        editable ? EditableCellView : CellView
      ),
      useStoreCellComponentProps(store, tableId),
      useSliceRowIds(indexId, sliceId, resolvedIndexes)
    )
  });
};
var RelationshipInHtmlTable = ({
  relationshipId,
  relationships,
  editable,
  customCells,
  className,
  headerRow,
  idColumn = true
}) => {
  const [resolvedRelationships, store, localTableId, remoteTableId] = getRelationshipsStoreTableIds(
    useRelationshipsOrRelationshipsById(relationships),
    relationshipId
  );
  const cells = useCells(
    [
      ...useDottedCellIds(localTableId, store),
      ...useDottedCellIds(remoteTableId, store)
    ],
    customCells,
    editable ? EditableCellView : CellView
  );
  const params = useParams(
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    resolvedRelationships,
    store
  );
  return /* @__PURE__ */ jsxs("table", {
    className,
    children: [
      headerRow === false ? null : /* @__PURE__ */ jsx2("thead", {
        children: /* @__PURE__ */ jsxs("tr", {
          children: [
            idColumn === false ? null : /* @__PURE__ */ jsxs(Fragment, {
              children: [
                /* @__PURE__ */ jsxs("th", {
                  children: [localTableId, ".Id"]
                }),
                /* @__PURE__ */ jsxs("th", {
                  children: [remoteTableId, ".Id"]
                })
              ]
            }),
            objToArray(
              cells,
              ({ label }, cellId) => /* @__PURE__ */ jsx2("th", { children: label }, cellId)
            )
          ]
        })
      }),
      /* @__PURE__ */ jsx2("tbody", {
        children: arrayMap2(
          useRowIds(localTableId, store),
          (localRowId) => /* @__PURE__ */ jsx2(
            RelationshipInHtmlRow,
            {
              localRowId,
              params
            },
            localRowId
          )
        )
      })
    ]
  });
};
var ResultSortedTableInHtmlTable = ({
  queryId,
  cellId,
  descending,
  offset,
  limit,
  queries,
  sortOnClick,
  paginator = false,
  customCells,
  onChange,
  ...props
}) => {
  const [sortAndOffset, handleSort, paginatorComponent] = useSortingAndPagination(
    cellId,
    descending,
    sortOnClick,
    offset,
    limit,
    useResultRowCount(queryId, queries),
    paginator,
    onChange
  );
  return /* @__PURE__ */ jsx2(HtmlTable, {
    ...props,
    params: useParams(
      useCells(
        useResultTableCellIds(queryId, queries),
        customCells,
        ResultCellView
      ),
      useQueriesCellComponentProps(queries, queryId),
      useResultSortedRowIds(queryId, ...sortAndOffset, limit, queries),
      sortAndOffset,
      handleSort,
      paginatorComponent
    )
  });
};
var EditableCellView = ({
  tableId,
  rowId,
  cellId,
  store,
  className,
  showType
}) => /* @__PURE__ */ jsx2(EditableThing, {
  thing: useCell(tableId, rowId, cellId, store),
  onThingChange: useSetCellCallback(
    tableId,
    rowId,
    cellId,
    (cell) => cell,
    [],
    store
  ),
  className: className ?? EDITABLE + CELL2,
  showType,
  hasSchema: useStoreOrStoreById(store)?.hasTablesSchema
});
var EditableValueView = ({ valueId, store, className, showType }) => /* @__PURE__ */ jsx2(EditableThing, {
  thing: useValue(valueId, store),
  onThingChange: useSetValueCallback(valueId, (value) => value, [], store),
  className: className ?? EDITABLE + VALUE2,
  showType,
  hasSchema: useStoreOrStoreById(store)?.hasValuesSchema
});
var SortedTablePaginator = ({
  onChange,
  total,
  offset = 0,
  limit = total,
  singular = "row",
  plural = singular + "s"
}) => {
  if (offset > total || offset < 0) {
    offset = 0;
    onChange(0);
  }
  const handlePrevClick = useCallbackOrUndefined(
    () => onChange(offset - limit),
    [onChange, offset, limit],
    offset > 0
  );
  const handleNextClick = useCallbackOrUndefined(
    () => onChange(offset + limit),
    [onChange, offset, limit],
    offset + limit < total
  );
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      total > limit && /* @__PURE__ */ jsxs(Fragment, {
        children: [
          /* @__PURE__ */ jsx2("button", {
            className: "previous",
            disabled: offset == 0,
            onClick: handlePrevClick,
            children: LEFT_ARROW
          }),
          /* @__PURE__ */ jsx2("button", {
            className: "next",
            disabled: offset + limit >= total,
            onClick: handleNextClick,
            children: RIGHT_ARROW
          }),
          offset + 1,
          " to ",
          mathMin(total, offset + limit),
          " of "
        ]
      }),
      total,
      " ",
      total != 1 ? plural : singular
    ]
  });
};
var Details = ({
  uniqueId,
  summary,
  editable,
  handleEditable,
  children,
  s
}) => {
  const open = !!useCell(STATE_TABLE, uniqueId, OPEN_CELL, s);
  const handleToggle = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    OPEN_CELL,
    (event) => event[CURRENT_TARGET].open,
    [],
    s
  );
  return /* @__PURE__ */ jsxs("details", {
    open,
    onToggle: handleToggle,
    children: [
      /* @__PURE__ */ jsxs("summary", {
        children: [
          summary,
          handleEditable ? /* @__PURE__ */ jsx2("img", {
            onClick: handleEditable,
            className: editable ? "done" : "edit"
          }) : null
        ]
      }),
      children
    ]
  });
};
var IndexView = ({ indexes, indexesId, indexId, s }) => /* @__PURE__ */ jsx2(Details, {
  uniqueId: getUniqueId("i", indexesId, indexId),
  summary: "Index: " + indexId,
  s,
  children: arrayMap2(
    useSliceIds(indexId, indexes),
    (sliceId) => /* @__PURE__ */ jsx2(
      SliceView,
      {
        indexes,
        indexesId,
        indexId,
        sliceId,
        s
      },
      sliceId
    )
  )
});
var SliceView = ({ indexes, indexesId, indexId, sliceId, s }) => {
  const uniqueId = getUniqueId("i", indexesId, indexId, sliceId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return /* @__PURE__ */ jsx2(Details, {
    uniqueId,
    summary: "Slice: " + sliceId,
    editable,
    handleEditable,
    s,
    children: /* @__PURE__ */ jsx2(SliceInHtmlTable, {
      sliceId,
      indexId,
      indexes,
      editable
    })
  });
};
var IndexesView = ({ indexesId, s }) => {
  const indexes = useIndexes(indexesId);
  const indexIds = useIndexIds(indexes);
  return isUndefined2(indexes) ? null : /* @__PURE__ */ jsx2(Details, {
    uniqueId: getUniqueId("i", indexesId),
    summary: "Indexes: " + (indexesId ?? DEFAULT),
    s,
    children: arrayIsEmpty(indexIds) ? "No indexes defined" : sortedIdsMap(
      indexIds,
      (indexId) => /* @__PURE__ */ jsx2(
        IndexView,
        {
          indexes,
          indexesId,
          indexId,
          s
        },
        indexId
      )
    )
  });
};
var MetricRow = ({ metrics, metricId }) => /* @__PURE__ */ jsxs("tr", {
  children: [
    /* @__PURE__ */ jsx2("th", { children: metricId }),
    /* @__PURE__ */ jsx2("td", { children: metrics?.getTableId(metricId) }),
    /* @__PURE__ */ jsx2("td", { children: useMetric(metricId, metrics) })
  ]
});
var MetricsView = ({ metricsId, s }) => {
  const metrics = useMetrics(metricsId);
  const metricIds = useMetricIds(metrics);
  return isUndefined2(metrics) ? null : /* @__PURE__ */ jsx2(Details, {
    uniqueId: getUniqueId("m", metricsId),
    summary: "Metrics: " + (metricsId ?? DEFAULT),
    s,
    children: arrayIsEmpty(metricIds) ? "No metrics defined" : /* @__PURE__ */ jsxs("table", {
      children: [
        /* @__PURE__ */ jsxs("thead", {
          children: [
            /* @__PURE__ */ jsx2("th", { children: "Metric Id" }),
            /* @__PURE__ */ jsx2("th", { children: "Table Id" }),
            /* @__PURE__ */ jsx2("th", { children: "Metric" })
          ]
        }),
        /* @__PURE__ */ jsx2("tbody", {
          children: arrayMap2(
            metricIds,
            (metricId) => /* @__PURE__ */ jsx2(
              MetricRow,
              { metrics, metricId },
              metricId
            )
          )
        })
      ]
    })
  });
};
var QueryView = ({ queries, queriesId, queryId, s }) => {
  const uniqueId = getUniqueId("q", queriesId, queryId);
  const [cellId, descending, offset] = jsonParse(
    useCell(STATE_TABLE, uniqueId, SORT_CELL, s) ?? "[]"
  );
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    [],
    s
  );
  return /* @__PURE__ */ jsx2(Details, {
    uniqueId,
    summary: "Query: " + queryId,
    s,
    children: /* @__PURE__ */ jsx2(ResultSortedTableInHtmlTable, {
      queryId,
      queries,
      cellId,
      descending,
      offset,
      limit: 10,
      paginator: true,
      sortOnClick: true,
      onChange: handleChange
    })
  });
};
var QueriesView = ({ queriesId, s }) => {
  const queries = useQueries(queriesId);
  const queryIds = useQueryIds(queries);
  return isUndefined2(queries) ? null : /* @__PURE__ */ jsx2(Details, {
    uniqueId: getUniqueId("q", queriesId),
    summary: "Queries: " + (queriesId ?? DEFAULT),
    s,
    children: arrayIsEmpty(queryIds) ? "No queries defined" : sortedIdsMap(
      queryIds,
      (queryId) => /* @__PURE__ */ jsx2(
        QueryView,
        {
          queries,
          queriesId,
          queryId,
          s
        },
        queryId
      )
    )
  });
};
var RelationshipView = ({
  relationships,
  relationshipsId,
  relationshipId,
  s
}) => {
  const uniqueId = getUniqueId("r", relationshipsId, relationshipId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return /* @__PURE__ */ jsx2(Details, {
    uniqueId,
    summary: "Relationship: " + relationshipId,
    editable,
    handleEditable,
    s,
    children: /* @__PURE__ */ jsx2(RelationshipInHtmlTable, {
      relationshipId,
      relationships,
      editable
    })
  });
};
var RelationshipsView = ({ relationshipsId, s }) => {
  const relationships = useRelationships(relationshipsId);
  const relationshipIds = useRelationshipIds(relationships);
  return isUndefined2(relationships) ? null : /* @__PURE__ */ jsx2(Details, {
    uniqueId: getUniqueId("r", relationshipsId),
    summary: "Relationships: " + (relationshipsId ?? DEFAULT),
    s,
    children: arrayIsEmpty(relationshipIds) ? "No relationships defined" : sortedIdsMap(
      relationshipIds,
      (relationshipId) => /* @__PURE__ */ jsx2(
        RelationshipView,
        {
          relationships,
          relationshipsId,
          relationshipId,
          s
        },
        relationshipId
      )
    )
  });
};
var TableView = ({ tableId, store, storeId, s }) => {
  const uniqueId = getUniqueId("t", storeId, tableId);
  const [cellId, descending, offset] = jsonParse(
    useCell(STATE_TABLE, uniqueId, SORT_CELL, s) ?? "[]"
  );
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    [],
    s
  );
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return /* @__PURE__ */ jsx2(Details, {
    uniqueId,
    summary: TABLE2 + ": " + tableId,
    editable,
    handleEditable,
    s,
    children: /* @__PURE__ */ jsx2(SortedTableInHtmlTable, {
      tableId,
      store,
      cellId,
      descending,
      offset,
      limit: 10,
      paginator: true,
      sortOnClick: true,
      onChange: handleChange,
      editable
    })
  });
};
var ValuesView = ({ store, storeId, s }) => {
  const uniqueId = getUniqueId("v", storeId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return arrayIsEmpty(useValueIds(store)) ? null : /* @__PURE__ */ jsx2(Details, {
    uniqueId,
    summary: VALUES2,
    editable,
    handleEditable,
    s,
    children: /* @__PURE__ */ jsx2(ValuesInHtmlTable, { store, editable })
  });
};
var StoreView = ({ storeId, s }) => {
  const store = useStore(storeId);
  const tableIds = useTableIds(store);
  return isUndefined2(store) ? null : /* @__PURE__ */ jsxs(Details, {
    uniqueId: getUniqueId("s", storeId),
    summary: (store.isMergeable() ? "Mergeable" : "") + "Store: " + (storeId ?? DEFAULT),
    s,
    children: [
      /* @__PURE__ */ jsx2(ValuesView, { storeId, store, s }),
      sortedIdsMap(
        tableIds,
        (tableId) => /* @__PURE__ */ jsx2(
          TableView,
          {
            store,
            storeId,
            tableId,
            s
          },
          tableId
        )
      )
    ]
  });
};
var Body = ({ s }) => {
  const articleRef = useRef2(null);
  const idleCallbackRef = useRef2(0);
  const [scrolled, setScrolled] = useState2(false);
  const { scrollLeft, scrollTop } = useValues(s);
  useLayoutEffect2(() => {
    const article = articleRef.current;
    if (article && !scrolled) {
      const observer = new MutationObserver(() => {
        if (article.scrollWidth >= mathFloor(scrollLeft) + article.clientWidth && article.scrollHeight >= mathFloor(scrollTop) + article.clientHeight) {
          article.scrollTo(scrollLeft, scrollTop);
        }
      });
      observer.observe(article, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [scrolled, scrollLeft, scrollTop]);
  const handleScroll = useCallback2(
    (event) => {
      const { scrollLeft: scrollLeft2, scrollTop: scrollTop2 } = event[CURRENT_TARGET];
      cancelIdleCallback(idleCallbackRef.current);
      idleCallbackRef.current = requestIdleCallback(() => {
        setScrolled(true);
        s.setPartialValues({ scrollLeft: scrollLeft2, scrollTop: scrollTop2 });
      });
    },
    [s]
  );
  const store = useStore();
  const storeIds = useStoreIds();
  const metrics = useMetrics();
  const metricsIds = useMetricsIds();
  const indexes = useIndexes();
  const indexesIds = useIndexesIds();
  const relationships = useRelationships();
  const relationshipsIds = useRelationshipsIds();
  const queries = useQueries();
  const queriesIds = useQueriesIds();
  return isUndefined2(store) && arrayIsEmpty(storeIds) && isUndefined2(metrics) && arrayIsEmpty(metricsIds) && isUndefined2(indexes) && arrayIsEmpty(indexesIds) && isUndefined2(relationships) && arrayIsEmpty(relationshipsIds) && isUndefined2(queries) && arrayIsEmpty(queriesIds) ? /* @__PURE__ */ jsx2("span", {
    className: "warn",
    children: "There are no Stores or other objects to inspect. Make sure you placed the Inspector inside a Provider component."
  }) : /* @__PURE__ */ jsxs("article", {
    ref: articleRef,
    onScroll: handleScroll,
    children: [
      /* @__PURE__ */ jsx2(StoreView, { s }),
      arrayMap2(
        storeIds,
        (storeId) => /* @__PURE__ */ jsx2(StoreView, { storeId, s }, storeId)
      ),
      /* @__PURE__ */ jsx2(MetricsView, { s }),
      arrayMap2(
        metricsIds,
        (metricsId) => /* @__PURE__ */ jsx2(MetricsView, { metricsId, s }, metricsId)
      ),
      /* @__PURE__ */ jsx2(IndexesView, { s }),
      arrayMap2(
        indexesIds,
        (indexesId) => /* @__PURE__ */ jsx2(IndexesView, { indexesId, s }, indexesId)
      ),
      /* @__PURE__ */ jsx2(RelationshipsView, { s }),
      arrayMap2(
        relationshipsIds,
        (relationshipsId) => /* @__PURE__ */ jsx2(
          RelationshipsView,
          {
            relationshipsId,
            s
          },
          relationshipsId
        )
      ),
      /* @__PURE__ */ jsx2(QueriesView, { s }),
      arrayMap2(
        queriesIds,
        (queriesId) => /* @__PURE__ */ jsx2(QueriesView, { queriesId, s }, queriesId)
      )
    ]
  });
};
var ErrorBoundary = class extends PureComponent2 {
  constructor(props) {
    super(props);
    this.state = { e: 0 };
  }
  static getDerivedStateFromError() {
    return { e: 1 };
  }
  // eslint-disable-next-line react/no-arrow-function-lifecycle
  componentDidCatch = (error, info) => (
    // eslint-disable-next-line no-console
    console.error(error, info.componentStack)
  );
  render() {
    return this.state.e ? /* @__PURE__ */ jsx2("span", {
      className: "warn",
      children: "Inspector error: please see console for details."
    }) : this.props.children;
  }
};
var Header = ({ s }) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;
  const handleClose = useSetValueCallback(OPEN_VALUE, () => false, [], s);
  const handleDock = useSetValueCallback(
    POSITION_VALUE,
    (event) => Number(event[CURRENT_TARGET].dataset.id),
    [],
    s
  );
  return /* @__PURE__ */ jsxs("header", {
    children: [
      /* @__PURE__ */ jsx2("img", { title: TITLE }),
      /* @__PURE__ */ jsx2("span", { children: TITLE }),
      arrayMap2(
        POSITIONS,
        (name, p) => p == position ? null : /* @__PURE__ */ jsx2(
          "img",
          {
            onClick: handleDock,
            "data-id": p,
            title: "Dock to " + name
          },
          p
        )
      ),
      /* @__PURE__ */ jsx2("img", { onClick: handleClose, title: "Close" })
    ]
  });
};
var Panel = ({ s }) => {
  const position = useValue(POSITION_VALUE, s) ?? 1;
  return useValue(OPEN_VALUE, s) ? /* @__PURE__ */ jsxs("main", {
    "data-position": position,
    children: [
      /* @__PURE__ */ jsx2(Header, { s }),
      /* @__PURE__ */ jsx2(ErrorBoundary, {
        children: /* @__PURE__ */ jsx2(Body, { s })
      })
    ]
  }) : null;
};
var img = "data:image/svg+xml,%3csvg viewBox='0 0 680 680' xmlns='http://www.w3.org/2000/svg' style='width:680px%3bheight:680px'%3e %3cpath stroke='white' stroke-width='80' fill='none' d='M340 617a84 241 90 11.01 0zM131 475a94 254 70 10428-124 114 286 70 01-428 124zm0-140a94 254 70 10428-124 114 286 70 01-428 124zm-12-127a94 254 70 00306 38 90 260 90 01-306-38zm221 3a74 241 90 11.01 0z' /%3e %3cpath fill='%23d81b60' d='M131 475a94 254 70 10428-124 114 286 70 01-428 124zm0-140a94 254 70 10428-124 114 286 70 01-428 124z' /%3e %3cpath d='M249 619a94 240 90 00308-128 114 289 70 01-308 128zM119 208a94 254 70 00306 38 90 260 90 01-306-38zm221 3a74 241 90 11.01 0z' /%3e%3c/svg%3e";
var PENCIL = "M20 80l5-15l40-40l10 10l-40 40l-15 5m5-15l10 10";
var PRE_CSS = 'content:url("';
var POST_CSS = '")';
var PRE = PRE_CSS + `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' stroke-width='4' stroke='white' fill='none'>`;
var POST = `</svg>` + POST_CSS;
var LOGO_SVG = PRE_CSS + img + POST_CSS;
var POSITIONS_SVG = arrayMap2(
  [
    [20, 20, 20, 60],
    [20, 20, 60, 20],
    [20, 60, 60, 20],
    [60, 20, 20, 60],
    [30, 30, 40, 40]
  ],
  ([x, y, w, h]) => PRE + `<rect x='20' y='20' width='60' height='60' fill='grey'/><rect x='${x}' y='${y}' width='${w}' height='${h}' fill='white'/>` + POST
);
var CLOSE_SVG = PRE + `<path d='M20 20l60 60M20 80l60-60' />` + POST;
var EDIT_SVG = PRE + `<path d='${PENCIL}' />` + POST;
var DONE_SVG = PRE + `<path d='${PENCIL}M20 20l60 60' />` + POST;
var SCROLLBAR = "*::-webkit-scrollbar";
var APP_STYLESHEET = arrayJoin(
  objToArray(
    {
      "": "all:initial;font-family:sans-serif;font-size:0.75rem;position:fixed;z-index:999999",
      "*": "all:revert",
      "*::before": "all:revert",
      "*::after": "all:revert",
      [SCROLLBAR]: "width:0.5rem;height:0.5rem;",
      [SCROLLBAR + "-track"]: "background:#111",
      [SCROLLBAR + "-thumb"]: "background:#999;border:1px solid #111",
      [SCROLLBAR + "-thumb:hover"]: "background:#fff",
      [SCROLLBAR + "-corner"]: "background:#111",
      img: "width:1rem;height:1rem;background:#111;border:0;vertical-align:text-bottom",
      // Nub
      ">img": "padding:0.25rem;bottom:0;right:0;position:fixed;" + LOGO_SVG,
      ...objNew(
        arrayMap2(["bottom:0;left:0", "top:0;right:0"], (css, p) => [
          `>img[data-position='${p}']`,
          css
        ])
      ),
      // Panel
      main: "display:flex;flex-direction:column;background:#111d;color:#fff;position:fixed;",
      ...objNew(
        arrayMap2(
          [
            "bottom:0;left:0;width:35vw;height:100vh",
            "top:0;right:0;width:100vw;height:30vh",
            "bottom:0;left:0;width:100vw;height:30vh",
            "top:0;right:0;width:35vw;height:100vh",
            "top:0;right:0;width:100vw;height:100vh"
          ],
          (css, p) => [`main[data-position='${p}']`, css]
        )
      ),
      // Header
      header: "display:flex;padding:0.25rem;background:#000;align-items:center",
      "header>img:nth-of-type(1)": LOGO_SVG,
      "header>img:nth-of-type(6)": CLOSE_SVG,
      ...objNew(
        arrayMap2(POSITIONS_SVG, (SVG, p) => [
          `header>img[data-id='${p}']`,
          SVG
        ])
      ),
      "header>span": "flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin-left:0.25rem",
      // Body
      article: "padding:0.25rem 0.25rem 0.25rem 0.5rem;overflow:auto;flex:1",
      details: "margin-left:0.75rem;width:fit-content;",
      "details img": "display:none",
      "details[open]>summary img": "display:unset;background:none;margin-left:0.25rem",
      "details[open]>summary img.edit": EDIT_SVG,
      "details[open]>summary img.done": DONE_SVG,
      summary: "margin-left:-0.75rem;line-height:1.25rem;user-select:none;width:fit-content",
      // tables
      table: "border-collapse:collapse;table-layout:fixed;margin-bottom:0.5rem",
      "table input": "background:#111;color:unset;padding:0 0.25rem;border:0;font-size:unset;vertical-align:top;margin:0",
      'table input[type="number"]': "width:4rem",
      "table tbody button": "font-size:0;background:#fff;border-radius:50%;margin:0 0.125rem 0 0;width:0.85rem;color:#111",
      "table button:first-letter": "font-size:0.75rem",
      thead: "background:#222",
      "th:nth-of-type(1)": "min-width:2rem;",
      "th.sorted": "background:#000",
      "table caption": "text-align:left;white-space:nowrap;line-height:1.25rem",
      button: "width:1.5rem;border:none;background:none;color:#fff;padding:0",
      "button[disabled]": "color:#777",
      "button.next": "margin-right:0.5rem",
      [`th,#${UNIQUE_ID} td`]: "overflow:hidden;text-overflow:ellipsis;padding:0.25rem 0.5rem;max-width:12rem;white-space:nowrap;border-width:1px 0;border-style:solid;border-color:#777;text-align:left",
      "span.warn": "margin:0.25rem;color:#d81b60"
    },
    (style, selector) => style ? `#${UNIQUE_ID} ${selector}{${style}}` : ""
  )
);
var Inspector = ({ position = "right", open = false }) => {
  const s = useCreateStore(createStore);
  const index = POSITIONS.indexOf(position);
  useCreatePersister(
    s,
    (s2) => createSessionPersister(s2, UNIQUE_ID),
    void 0,
    async (persister) => {
      await persister.load([
        {},
        {
          position: index == -1 ? 1 : index,
          open: !!open
        }
      ]);
      await persister.startAutoSave();
    }
  );
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsxs("aside", {
        id: UNIQUE_ID,
        children: [
          /* @__PURE__ */ jsx2(Nub, { s }),
          /* @__PURE__ */ jsx2(Panel, { s })
        ]
      }),
      /* @__PURE__ */ jsx2("style", { children: APP_STYLESHEET })
    ]
  });
};
export {
  Inspector
};
