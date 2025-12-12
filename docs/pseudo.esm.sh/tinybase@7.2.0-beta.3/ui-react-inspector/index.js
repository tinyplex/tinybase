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
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? otherwise?.() : then(value);
var GLOBAL = globalThis;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isString = (thing) => getTypeOf(thing) == STRING;
var isFunction = (thing) => getTypeOf(thing) == FUNCTION;
var isArray = (thing) => Array.isArray(thing);
var size = (arrayOrString) => arrayOrString.length;
var getUndefined = () => void 0;
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual = (value1, value2) => isArray(value1) && isArray(value2) ? arrayIsEqual(value1, value2) : value1 === value2;
var arrayMap = (array, cb) => array.map(cb);
var arrayFilter = (array, cb) => array.filter(cb);
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objEntries = object.entries;
var isObject = (obj) => !isNullish(obj) && ifNotNullish(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isNullish(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds = object.keys;
var objGet = (obj, id2) => ifNotUndefined(obj, (obj2) => obj2[id2]);
var objSize = (obj) => size(objIds(obj));
var objIsEqual = (obj1, obj2, isEqual3 = (value1, value2) => value1 === value2) => {
  const entries1 = objEntries(obj1);
  return size(entries1) === objSize(obj2) && arrayEvery(
    entries1,
    ([index, value1]) => isObject(value1) ? isObject(obj2[index]) ? objIsEqual(obj2[index], value1) : false : isEqual3(value1, obj2[index])
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
var OFFSET_STORE = 0;
var OFFSET_METRICS = 1;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES = 4;
var OFFSET_CHECKPOINTS = 5;
var EMPTY_ARRAY = [];
var DEFAULTS = [
  {},
  [],
  [EMPTY_ARRAY, void 0, EMPTY_ARRAY],
  {},
  void 0,
  void 0,
  false,
  0
];
var IS_EQUALS = [
  objIsEqual,
  arrayIsEqual,
  ([backwardIds1, currentId1, forwardIds1], [backwardIds2, currentId2, forwardIds2]) => currentId1 === currentId2 && arrayIsEqual(backwardIds1, backwardIds2) && arrayIsEqual(forwardIds1, forwardIds2),
  (paramValues1, paramValues2) => objIsEqual(paramValues1, paramValues2, arrayOrValueEqual),
  arrayOrValueEqual
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
      const nextResult = thing?.[(returnType == 6 ? _HAS : GET) + listenable]?.(
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
      (returnType == 6 ? HAS : EMPTY_STRING) + listenable,
      ...args,
      listener
    ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  return useSyncExternalStore(subscribe, getResult, getResult);
};
var useSetCallback = (storeOrQueries, settable, get, getDeps = EMPTY_ARRAY, then = getUndefined, thenDeps = EMPTY_ARRAY, methodPrefix, ...args) => useCallback(
  (parameter) => ifNotUndefined(
    storeOrQueries,
    (obj) => ifNotUndefined(
      get(parameter, obj),
      (thing) => then(
        obj[methodPrefix + settable](
          ...argsOrGetArgs(args, obj, parameter),
          thing
        ),
        thing
      )
    )
  ),
  /* eslint-disable react-hooks/exhaustive-deps */
  [
    storeOrQueries,
    settable,
    ...getDeps,
    ...thenDeps,
    methodPrefix,
    ...nonFunctionDeps(args)
  ]
  /* eslint-enable react-hooks/exhaustive-deps */
);
var useStoreSetCallback = (storeOrStoreId, settable, get, getDeps, then, thenDeps, ...args) => useSetCallback(
  useStoreOrStoreById(storeOrStoreId),
  settable,
  get,
  getDeps,
  then,
  thenDeps,
  SET,
  ...args
);
var argsOrGetArgs = (args, store, parameter) => arrayMap(args, (arg) => isFunction(arg) ? arg(parameter, store) : arg);
var nonFunctionDeps = (args) => arrayFilter(args, (arg) => !isFunction(arg));
var useCreateStore = (create, createDeps = EMPTY_ARRAY) => useMemo(create, createDeps);
var useStoreIds = () => useThingIds(OFFSET_STORE);
var useStore = (id2) => useThing(id2, OFFSET_STORE);
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
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
var useHasCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(CELL, useStoreOrStoreById(storeOrStoreId), 6, [
  tableId,
  rowId,
  cellId
]);
var useCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  5,
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
  5,
  [valueId]
);
var useSetCellCallback = (tableId, rowId, cellId, getCell, getCellDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
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
var useSetValueCallback = (valueId, getValue, getValueDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  VALUE,
  getValue,
  getValueDeps,
  then,
  thenDeps,
  valueId
);
var useMetricsIds = () => useThingIds(OFFSET_METRICS);
var useMetrics = (id2) => useThing(id2, OFFSET_METRICS);
var useMetricsOrMetricsById = (metricsOrMetricsId) => useThingOrThingById(metricsOrMetricsId, OFFSET_METRICS);
var useMetricIds = (metricsOrMetricsId) => useListenable(
  METRIC + IDS,
  useMetricsOrMetricsById(metricsOrMetricsId),
  1
);
var useMetric = (metricId, metricsOrMetricsId) => useListenable(
  METRIC,
  useMetricsOrMetricsById(metricsOrMetricsId),
  5,
  [metricId]
);
var useIndexesIds = () => useThingIds(OFFSET_INDEXES);
var useIndexes = (id2) => useThing(id2, OFFSET_INDEXES);
var useIndexesOrIndexesById = (indexesOrIndexesId) => useThingOrThingById(indexesOrIndexesId, OFFSET_INDEXES);
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
var useRelationshipsIds = () => useThingIds(OFFSET_RELATIONSHIPS);
var useRelationships = (id2) => useThing(id2, OFFSET_RELATIONSHIPS);
var useRelationshipsOrRelationshipsById = (relationshipsOrRelationshipsId) => useThingOrThingById(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var useRelationshipIds = (relationshipsOrRelationshipsId) => useListenable(
  RELATIONSHIP + IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  1
);
var useQueriesIds = () => useThingIds(OFFSET_QUERIES);
var useQueries = (id2) => useThing(id2, OFFSET_QUERIES);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);
var useQueryIds = (queriesOrQueriesId) => useListenable(
  QUERY + IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1
);
var useResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => useListenable(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  5,
  [queryId, rowId, cellId]
);
var useCheckpointsOrCheckpointsById = (checkpointsOrCheckpointsId) => useThingOrThingById(checkpointsOrCheckpointsId, OFFSET_CHECKPOINTS);
var useCheckpointIds = (checkpointsOrCheckpointsId) => useListenable(
  CHECKPOINT + IDS,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  2
);
var useCheckpoint = (checkpointId, checkpointsOrCheckpointsId) => useListenable(
  CHECKPOINT,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  5,
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
var wrap = (children, separator, encloseWithId, id2) => {
  const separated = isUndefined(separator) || !isArray(children) ? children : arrayMap(children, (child, c) => c > 0 ? [separator, child] : child);
  return encloseWithId ? [id2, ":{", separated, "}"] : separated;
};
var CheckpointView = ({ checkpoints, checkpointId, debugIds }) => wrap(
  useCheckpoint(checkpointId, checkpoints) ?? EMPTY_STRING,
  void 0,
  debugIds,
  checkpointId
);
var ResultCellView = ({ queryId, rowId, cellId, queries, debugIds }) => wrap(
  EMPTY_STRING + (useResultCell(queryId, rowId, cellId, queries) ?? EMPTY_STRING),
  void 0,
  debugIds,
  cellId
);
var CellView = ({ tableId, rowId, cellId, store, debugIds }) => wrap(
  EMPTY_STRING + (useCell(tableId, rowId, cellId, store) ?? EMPTY_STRING),
  void 0,
  debugIds,
  cellId
);
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
var BackwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[0]
);
var CurrentCheckpointView = getUseCheckpointView(
  (checkpointIds) => isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]]
);
var ForwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[2]
);
var ValueView = ({ valueId, store, debugIds }) => wrap(
  EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING),
  void 0,
  debugIds,
  valueId
);

// dist/ui-react-inspector/index.js
var getTypeOf2 = (thing) => typeof thing;
var TINYBASE2 = "tinybase";
var EMPTY_STRING2 = "";
var DOT = ".";
var STRING2 = getTypeOf2(EMPTY_STRING2);
var BOOLEAN = getTypeOf2(true);
var NUMBER = getTypeOf2(0);
var FUNCTION2 = getTypeOf2(getTypeOf2);
var TYPE = "type";
var DEFAULT = "default";
var ALLOW_NULL = "allowNull";
var NULL = "null";
var LISTENER2 = "Listener";
var RESULT2 = "Result";
var GET2 = "get";
var SET2 = "set";
var ADD2 = "add";
var DEL = "del";
var HAS2 = "Has";
var _HAS2 = "has";
var IDS2 = "Ids";
var TABLE2 = "Table";
var TABLES2 = TABLE2 + "s";
var TABLE_IDS2 = TABLE2 + IDS2;
var ROW2 = "Row";
var ROW_COUNT2 = ROW2 + "Count";
var ROW_IDS2 = ROW2 + IDS2;
var SORTED_ROW_IDS2 = "Sorted" + ROW2 + IDS2;
var CELL2 = "Cell";
var CELL_IDS2 = CELL2 + IDS2;
var VALUE2 = "Value";
var VALUES2 = VALUE2 + "s";
var VALUE_IDS2 = VALUE2 + IDS2;
var SLICE2 = "Slice";
var REMOTE_ROW_ID2 = "Remote" + ROW2 + "Id";
var CURRENT_TARGET = "currentTarget";
var _VALUE = "value";
var EXTRA = "extra";
var UNDEFINED = "\uFFFC";
var id = (key) => EMPTY_STRING2 + key;
var strSplit = (str, separator = EMPTY_STRING2, limit) => str.split(separator, limit);
var getIfNotFunction2 = (predicate) => (value, then, otherwise) => predicate(value) ? otherwise?.() : then(value);
var GLOBAL2 = globalThis;
var WINDOW = GLOBAL2.window;
var math = Math;
var mathMin = math.min;
var mathFloor = math.floor;
var isFiniteNumber = isFinite;
var isInstanceOf = (thing, cls) => thing instanceof cls;
var isNullish2 = (thing) => thing == null;
var isUndefined2 = (thing) => thing === void 0;
var isNull = (thing) => thing === null;
var isTrue = (thing) => thing === true;
var isFalse = (thing) => thing === false;
var ifNotNullish2 = getIfNotFunction2(isNullish2);
var ifNotUndefined2 = getIfNotFunction2(isUndefined2);
var isTypeStringOrBoolean = (type) => type == STRING2 || type == BOOLEAN;
var isString2 = (thing) => getTypeOf2(thing) == STRING2;
var isFunction2 = (thing) => getTypeOf2(thing) == FUNCTION2;
var isArray2 = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size2 = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var getUndefined2 = () => void 0;
var errorNew = (message) => {
  throw new Error(message);
};
var tryCatch = async (action, then1, then2) => {
  try {
    return await action();
  } catch (error) {
    then1?.(error);
  }
};
var arrayHas = (array, value) => array.includes(value);
var arrayEvery2 = (array, cb) => array.every(cb);
var arrayIsEqual2 = (array1, array2) => size2(array1) === size2(array2) && arrayEvery2(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual2 = (value1, value2) => isArray2(value1) && isArray2(value2) ? arrayIsEqual2(value1, value2) : value1 === value2;
var arraySort = (array, sorter) => array.sort(sorter);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING2) => array.join(sep);
var arrayMap2 = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size2(array) == 0;
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayFilter2 = (array, cb) => array.filter(cb);
var arrayClear = (array, to) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var object2 = Object;
var getPrototypeOf2 = (obj) => object2.getPrototypeOf(obj);
var objFrozen = object2.isFrozen;
var objEntries2 = object2.entries;
var isObject2 = (obj) => !isNullish2(obj) && ifNotNullish2(
  getPrototypeOf2(obj),
  (objPrototype) => objPrototype == object2.prototype || isNullish2(getPrototypeOf2(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds2 = object2.keys;
var objFreeze = object2.freeze;
var objNew = (entries = []) => object2.fromEntries(entries);
var objGet2 = (obj, id2) => ifNotUndefined2(obj, (obj2) => obj2[id2]);
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
var objIsEqual2 = (obj1, obj2, isEqual3 = (value1, value2) => value1 === value2) => {
  const entries1 = objEntries2(obj1);
  return size2(entries1) === objSize2(obj2) && arrayEvery2(
    entries1,
    ([index, value1]) => isObject2(value1) ? isObject2(obj2[index]) ? objIsEqual2(obj2[index], value1) : false : isEqual3(value1, obj2[index])
  );
};
var objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
  if (isNullish2(obj) || !isObject2(obj) || !emptyIsValid && objIsEmpty(obj) || objFrozen(obj)) {
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
var jsonStringWithUndefined = (obj) => jsonString(obj, (_key, value) => isUndefined2(value) ? UNDEFINED : value);
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
  const deep = (node, p) => p == size2(path) ? arrayPush(leaves, node) : isNull(path[p]) ? collForEach(node, (node2) => deep(node2, p + 1)) : arrayForEach([path[p], null], (id2) => deep(mapGet(node, id2), p + 1));
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
        } else if (isNull(path[index])) {
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
        await tryCatch(action, onIgnoredError);
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
        await tryCatch(
          async () => {
            const content = await getPersisted();
            if (isArray2(content)) {
              setContentOrChanges(content);
            } else if (initialContent) {
              setDefaultContent(initialContent);
            } else {
              errorNew(`Content is not an array: ${content}`);
            }
          },
          () => {
            if (initialContent) {
              setDefaultContent(initialContent);
            }
          }
        );
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
    await tryCatch(
      async () => autoLoadHandle = await addPersisterListener(
        async (content, changes) => {
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
        }
      ),
      onIgnoredError
    );
    return persister;
  };
  const stopAutoLoad = async () => {
    if (autoLoadHandle) {
      await tryCatch(
        () => delPersisterListener(autoLoadHandle),
        onIgnoredError
      );
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
        await tryCatch(() => setPersisted(getContent, changes), onIgnoredError);
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
  const stopAutoSave = async () => {
    if (autoSaveListenerId) {
      store.delListener(autoSaveListenerId);
      autoSaveListenerId = void 0;
    }
    return persister;
  };
  const isAutoSaving = () => !isUndefined2(autoSaveListenerId);
  const startAutoPersisting = async (initialContent, startSaveFirst = false) => {
    const [call1, call2] = startSaveFirst ? [startAutoSave, startAutoLoad] : [startAutoLoad, startAutoSave];
    await call1(initialContent);
    await call2(initialContent);
    return persister;
  };
  const stopAutoPersisting = async (stopSaveFirst = false) => {
    const [call1, call2] = stopSaveFirst ? [stopAutoSave, stopAutoLoad] : [stopAutoLoad, stopAutoSave];
    await call1();
    await call2();
    return persister;
  };
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
    return stopAutoPersisting();
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
    startAutoPersisting,
    stopAutoPersisting,
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
        tryCatch(
          () => listener(jsonParseWithUndefined(event.newValue)),
          listener
        );
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
  if (isNull(cellOrValue)) {
    return NULL;
  }
  const type = getTypeOf2(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var setOrDelCell = (store, tableId, rowId, cellId, cell) => isUndefined2(cell) ? store.delCell(tableId, rowId, cellId, true) : store.setCell(tableId, rowId, cellId, cell);
var setOrDelValue = (store, valueId, value) => isUndefined2(value) ? store.delValue(valueId) : store.setValue(valueId, value);
var getTypeCase = (type, stringCase, numberCase, booleanCase) => type == STRING2 ? stringCase : type == NUMBER ? numberCase : type == BOOLEAN ? booleanCase : null;
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
    if (!objValidate(
      schema,
      (_child, id2) => arrayHas([TYPE, DEFAULT, ALLOW_NULL], id2)
    )) {
      return false;
    }
    const type = schema[TYPE];
    if (!isTypeStringOrBoolean(type) && type != NUMBER) {
      return false;
    }
    const defaultValue = schema[DEFAULT];
    if (isNull(defaultValue) && !schema[ALLOW_NULL]) {
      return false;
    }
    if (!isNull(defaultValue) && getCellOrValueType(defaultValue) != type) {
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
    (cellSchema) => isNull(cell) ? cellSchema[ALLOW_NULL] ? cell : cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT]) : getCellOrValueType(cell) == cellSchema[TYPE] ? cell : cellInvalid(
      tableId,
      rowId,
      cellId,
      cell,
      cellSchema[DEFAULT]
    ),
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
    (valueSchema) => isNull(value) ? valueSchema[ALLOW_NULL] ? value : valueInvalid(valueId, value, valueSchema[DEFAULT]) : getCellOrValueType(value) == valueSchema[TYPE] ? value : valueInvalid(valueId, value, valueSchema[DEFAULT]),
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
      count != -addedOrRemoved ? count + addedOrRemoved : void 0
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
  const addSortedRowIdsListenerImpl = (tableId, cellId, otherArgs, listener, mutator) => {
    let sortedRowIds = getSortedRowIds(tableId, cellId, ...otherArgs);
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds(tableId, cellId, ...otherArgs);
        if (!arrayIsEqual2(newSortedRowIds, sortedRowIds)) {
          sortedRowIds = newSortedRowIds;
          listener(store, tableId, cellId, ...otherArgs, sortedRowIds);
        }
      },
      sortedRowIdsListeners[mutator ? 1 : 0],
      [tableId, cellId],
      [getTableIds]
    );
  };
  const getContent = () => [getTables(), getValues()];
  const getTables = () => mapToObj3(tablesMap);
  const getTableIds = () => mapKeys(tablesMap);
  const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)));
  const getTableCellIds = (tableId) => mapKeys(mapGet(tableCellIds, id(tableId)));
  const getRowCount = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
  const getRowIds = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
  const getSortedRowIds = (tableIdOrArgs, cellId, descending, offset = 0, limit) => isObject2(tableIdOrArgs) ? getSortedRowIds(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending,
    tableIdOrArgs.offset,
    tableIdOrArgs.limit
  ) : arrayMap2(
    slice(
      arraySort(
        mapMap(mapGet(tablesMap, id(tableIdOrArgs)), (row, rowId) => [
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
    tryCatch(() => setOrDelTables(jsonParse(tablesJson)));
    return store;
  };
  const setValuesJson = (valuesJson) => {
    tryCatch(() => setOrDelValues(jsonParse(valuesJson)));
    return store;
  };
  const setJson = (tablesAndValuesJson) => fluentTransaction(
    () => tryCatch(
      () => {
        const [tables, values] = jsonParse(tablesAndValuesJson);
        setOrDelTables(tables);
        setOrDelValues(values);
      },
      () => setTablesJson(tablesAndValuesJson)
    )
  );
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
  const addSortedRowIdsListener = (tableIdOrArgs, cellIdOrListener, descendingOrMutator, offset, limit, listener, mutator) => isObject2(tableIdOrArgs) ? addSortedRowIdsListenerImpl(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    [
      tableIdOrArgs.descending ?? false,
      tableIdOrArgs.offset ?? 0,
      tableIdOrArgs.limit
    ],
    cellIdOrListener,
    descendingOrMutator
  ) : addSortedRowIdsListenerImpl(
    tableIdOrArgs,
    cellIdOrListener,
    [descendingOrMutator, offset, limit],
    listener,
    mutator
  );
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
var TINYBASE_CONTEXT2 = TINYBASE2 + "_uirc";
var Context2 = GLOBAL2[TINYBASE_CONTEXT2] ? (
  /* istanbul ignore next */
  GLOBAL2[TINYBASE_CONTEXT2]
) : GLOBAL2[TINYBASE_CONTEXT2] = createContext2([]);
var useThing2 = (id2, offset) => {
  const contextValue = useContext2(Context2);
  return isUndefined2(id2) ? contextValue[offset * 2] : isString2(id2) ? objGet2(contextValue[offset * 2 + 1], id2) : id2;
};
var useThingOrThingById2 = (thingOrThingId, offset) => {
  const thing = useThing2(thingOrThingId, offset);
  return isUndefined2(thingOrThingId) || isString2(thingOrThingId) ? thing : thingOrThingId;
};
var OFFSET_STORE2 = 0;
var OFFSET_INDEXES2 = 2;
var OFFSET_RELATIONSHIPS2 = 3;
var OFFSET_QUERIES2 = 4;
var EMPTY_ARRAY2 = [];
var DEFAULTS2 = [
  {},
  [],
  [EMPTY_ARRAY2, void 0, EMPTY_ARRAY2],
  {},
  void 0,
  void 0,
  false,
  0
];
var IS_EQUALS2 = [
  objIsEqual2,
  arrayIsEqual2,
  ([backwardIds1, currentId1, forwardIds1], [backwardIds2, currentId2, forwardIds2]) => currentId1 === currentId2 && arrayIsEqual2(backwardIds1, backwardIds2) && arrayIsEqual2(forwardIds1, forwardIds2),
  (paramValues1, paramValues2) => objIsEqual2(paramValues1, paramValues2, arrayOrValueEqual2),
  arrayOrValueEqual2
];
var isEqual2 = (thing1, thing2) => thing1 === thing2;
var addAndDelListener2 = (thing, listenable, ...args) => {
  const listenerId = thing?.[ADD2 + listenable + LISTENER2]?.(...args);
  return () => thing?.delListener?.(listenerId);
};
var useListenable2 = (listenable, thing, returnType, args = EMPTY_ARRAY2) => {
  const lastResult = useRef2(DEFAULTS2[returnType]);
  const getResult = useCallback2(
    () => {
      const nextResult = thing?.[(returnType == 6 ? _HAS2 : GET2) + listenable]?.(
        ...args
      ) ?? DEFAULTS2[returnType];
      return !(IS_EQUALS2[returnType] ?? isEqual2)(nextResult, lastResult.current) ? lastResult.current = nextResult : lastResult.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  const subscribe = useCallback2(
    (listener) => addAndDelListener2(
      thing,
      (returnType == 6 ? HAS2 : EMPTY_STRING2) + listenable,
      ...args,
      listener
    ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  return useSyncExternalStore2(subscribe, getResult, getResult);
};
var useSetCallback2 = (storeOrQueries, settable, get, getDeps = EMPTY_ARRAY2, then = getUndefined2, thenDeps = EMPTY_ARRAY2, methodPrefix, ...args) => useCallback2(
  (parameter) => ifNotUndefined2(
    storeOrQueries,
    (obj) => ifNotUndefined2(
      get(parameter, obj),
      (thing) => then(
        obj[methodPrefix + settable](
          ...argsOrGetArgs2(args, obj, parameter),
          thing
        ),
        thing
      )
    )
  ),
  /* eslint-disable react-hooks/exhaustive-deps */
  [
    storeOrQueries,
    settable,
    ...getDeps,
    ...thenDeps,
    methodPrefix,
    ...nonFunctionDeps2(args)
  ]
  /* eslint-enable react-hooks/exhaustive-deps */
);
var useStoreSetCallback2 = (storeOrStoreId, settable, get, getDeps, then, thenDeps, ...args) => useSetCallback2(
  useStoreOrStoreById2(storeOrStoreId),
  settable,
  get,
  getDeps,
  then,
  thenDeps,
  SET2,
  ...args
);
var argsOrGetArgs2 = (args, store, parameter) => arrayMap2(args, (arg) => isFunction2(arg) ? arg(parameter, store) : arg);
var nonFunctionDeps2 = (args) => arrayFilter2(args, (arg) => !isFunction2(arg));
var useDel = (storeOrStoreId, deletable, then = getUndefined2, thenDeps = EMPTY_ARRAY2, ...args) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  return useCallback2(
    (parameter) => then(store?.[DEL + deletable](...argsOrGetArgs2(args, store, parameter))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, deletable, ...thenDeps, ...nonFunctionDeps2(args)]
  );
};
var useSortedRowIdsImpl = (tableId, cellId, descending, offset, limit, storeOrStoreId) => useListenable2(
  SORTED_ROW_IDS2,
  useStoreOrStoreById2(storeOrStoreId),
  1,
  [tableId, cellId, descending, offset, limit]
);
var useStoreOrStoreById2 = (storeOrStoreId) => useThingOrThingById2(storeOrStoreId, OFFSET_STORE2);
var useHasTables = (storeOrStoreId) => useListenable2(
  TABLES2,
  useStoreOrStoreById2(storeOrStoreId),
  6,
  []
);
var useTableCellIds2 = (tableId, storeOrStoreId) => useListenable2(
  TABLE2 + CELL_IDS2,
  useStoreOrStoreById2(storeOrStoreId),
  1,
  [tableId]
);
var useRowCount = (tableId, storeOrStoreId) => useListenable2(
  ROW_COUNT2,
  useStoreOrStoreById2(storeOrStoreId),
  7,
  [tableId]
);
var useRowIds = (tableId, storeOrStoreId) => useListenable2(ROW_IDS2, useStoreOrStoreById2(storeOrStoreId), 1, [
  tableId
]);
var useSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending, offset, limit, storeOrStoreId) => useSortedRowIdsImpl(
  ...isObject2(tableIdOrArgs) ? [
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending ?? false,
    tableIdOrArgs.offset ?? 0,
    tableIdOrArgs.limit,
    cellIdOrStoreOrStoreId
  ] : [
    tableIdOrArgs,
    cellIdOrStoreOrStoreId,
    descending,
    offset,
    limit,
    storeOrStoreId
  ]
);
var useCell2 = (tableId, rowId, cellId, storeOrStoreId) => useListenable2(
  CELL2,
  useStoreOrStoreById2(storeOrStoreId),
  5,
  [tableId, rowId, cellId]
);
var useHasValues = (storeOrStoreId) => useListenable2(
  VALUES2,
  useStoreOrStoreById2(storeOrStoreId),
  6,
  []
);
var useValueIds2 = (storeOrStoreId) => useListenable2(
  VALUE_IDS2,
  useStoreOrStoreById2(storeOrStoreId),
  1
  /* Array */
);
var useValue2 = (valueId, storeOrStoreId) => useListenable2(
  VALUE2,
  useStoreOrStoreById2(storeOrStoreId),
  5,
  [valueId]
);
var useSetTableCallback = (tableId, getTable, getTableDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback2(
  storeOrStoreId,
  TABLE2,
  getTable,
  getTableDeps,
  then,
  thenDeps,
  tableId
);
var useSetRowCallback = (tableId, rowId, getRow, getRowDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback2(
  storeOrStoreId,
  ROW2,
  getRow,
  getRowDeps,
  then,
  thenDeps,
  tableId,
  rowId
);
var useSetCellCallback2 = (tableId, rowId, cellId, getCell, getCellDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback2(
  storeOrStoreId,
  CELL2,
  getCell,
  getCellDeps,
  then,
  thenDeps,
  tableId,
  rowId,
  cellId
);
var useSetValueCallback2 = (valueId, getValue, getValueDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback2(
  storeOrStoreId,
  VALUE2,
  getValue,
  getValueDeps,
  then,
  thenDeps,
  valueId
);
var useDelTablesCallback = (storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, TABLES2, then, thenDeps);
var useDelTableCallback = (tableId, storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, TABLE2, then, thenDeps, tableId);
var useDelRowCallback = (tableId, rowId, storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, ROW2, then, thenDeps, tableId, rowId);
var useDelCellCallback = (tableId, rowId, cellId, forceDel, storeOrStoreId, then, thenDeps) => useDel(
  storeOrStoreId,
  CELL2,
  then,
  thenDeps,
  tableId,
  rowId,
  cellId,
  forceDel
);
var useDelValuesCallback = (storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, VALUES2, then, thenDeps);
var useDelValueCallback = (valueId, storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, VALUE2, then, thenDeps, valueId);
var useIndexesOrIndexesById2 = (indexesOrIndexesId) => useThingOrThingById2(indexesOrIndexesId, OFFSET_INDEXES2);
var useSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => useListenable2(
  SLICE2 + ROW_IDS2,
  useIndexesOrIndexesById2(indexesOrIndexesId),
  1,
  [indexId, sliceId]
);
var useRelationshipsOrRelationshipsById2 = (relationshipsOrRelationshipsId) => useThingOrThingById2(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS2);
var useRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => useListenable2(
  REMOTE_ROW_ID2,
  useRelationshipsOrRelationshipsById2(relationshipsOrRelationshipsId),
  5,
  [relationshipId, localRowId]
);
var useQueriesOrQueriesById2 = (queriesOrQueriesId) => useThingOrThingById2(queriesOrQueriesId, OFFSET_QUERIES2);
var useResultTableCellIds = (queryId, queriesOrQueriesId) => useListenable2(
  RESULT2 + TABLE2 + CELL_IDS2,
  useQueriesOrQueriesById2(queriesOrQueriesId),
  1,
  [queryId]
);
var useResultRowCount = (queryId, queriesOrQueriesId) => useListenable2(
  RESULT2 + ROW_COUNT2,
  useQueriesOrQueriesById2(queriesOrQueriesId),
  7,
  [queryId]
);
var useResultSortedRowIds = (queryId, cellId, descending, offset = 0, limit, queriesOrQueriesId) => useListenable2(
  RESULT2 + SORTED_ROW_IDS2,
  useQueriesOrQueriesById2(queriesOrQueriesId),
  1,
  [queryId, cellId, descending, offset, limit]
);
var useStoreCellComponentProps = (store, tableId) => useMemo2(() => ({ store, tableId }), [store, tableId]);
var useQueriesCellComponentProps = (queries, queryId) => useMemo2(() => ({ queries, queryId }), [queries, queryId]);
var useCallbackOrUndefined = (callback, deps, test2) => {
  const returnCallback = useCallback2(callback, deps);
  return test2 ? returnCallback : void 0;
};
var useParams = (...args) => useMemo2(
  () => args,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  args
);
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
var UP_ARROW = "\u2191";
var DOWN_ARROW = "\u2193";
var EDITABLE = "editable";
var extraRowCells = (extraRowCells2 = [], extraRowCellProps, after = 0) => arrayMap2(
  extraRowCells2,
  ({ component: Component }, index) => /* @__PURE__ */ jsx2(
    "td",
    {
      className: EXTRA,
      children: /* @__PURE__ */ jsx2(Component, { ...extraRowCellProps })
    },
    extraKey(index, after)
  )
);
var extraKey = (index, after) => (after ? ">" : "<") + index;
var extraHeaders = (extraCells = [], after = 0) => arrayMap2(
  extraCells,
  ({ label }, index) => /* @__PURE__ */ jsx2(
    "th",
    { className: EXTRA, children: label },
    extraKey(index, after)
  )
);
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
var HtmlTable = ({
  className,
  headerRow,
  idColumn,
  params: [
    cells,
    cellComponentProps,
    rowIds,
    extraCellsBefore,
    extraCellsAfter,
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
          extraHeaders(extraCellsBefore),
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
          ),
          extraHeaders(extraCellsAfter, 1)
        ]
      })
    }),
    /* @__PURE__ */ jsx2("tbody", {
      children: arrayMap2(rowIds, (rowId) => {
        const rowProps = { ...cellComponentProps, rowId };
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            children: [
              extraRowCells(extraCellsBefore, rowProps),
              isFalse(idColumn) ? null : /* @__PURE__ */ jsx2("th", { title: rowId, children: rowId }),
              objToArray(
                cells,
                ({ component: CellView2, getComponentProps }, cellId) => /* @__PURE__ */ jsx2(
                  "td",
                  {
                    children: /* @__PURE__ */ jsx2(CellView2, {
                      ...getProps2(getComponentProps, rowId, cellId),
                      ...rowProps,
                      cellId
                    })
                  },
                  cellId
                )
              ),
              extraRowCells(extraCellsAfter, rowProps, 1)
            ]
          },
          rowId
        );
      })
    })
  ]
});
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
  const widget = getTypeCase(
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
  );
  return /* @__PURE__ */ jsxs("div", {
    className,
    children: [
      showType && widget ? /* @__PURE__ */ jsx2("button", {
        title: thingType,
        className: thingType,
        onClick: handleTypeChange,
        children: thingType
      }) : null,
      widget
    ]
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
  thing: useCell2(tableId, rowId, cellId, store),
  onThingChange: useSetCellCallback2(
    tableId,
    rowId,
    cellId,
    (cell) => cell,
    [],
    store
  ),
  className: className ?? EDITABLE + CELL2,
  showType,
  hasSchema: useStoreOrStoreById2(store)?.hasTablesSchema
});
var EditableValueView = ({ valueId, store, className, showType }) => /* @__PURE__ */ jsx2(EditableThing, {
  thing: useValue2(valueId, store),
  onThingChange: useSetValueCallback2(valueId, (value) => value, [], store),
  className: className ?? EDITABLE + VALUE2,
  showType,
  hasSchema: useStoreOrStoreById2(store)?.hasValuesSchema
});
var useDottedCellIds = (tableId, store) => arrayMap2(useTableCellIds2(tableId, store), (cellId) => tableId + DOT + cellId);
var RelationshipInHtmlRow = ({
  localRowId,
  params: [
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store,
    extraCellsBefore,
    extraCellsAfter
  ]
}) => {
  const remoteRowId = useRemoteRowId(relationshipId, localRowId, relationships);
  const rowProps = {
    tableId: localTableId ?? "",
    rowId: localRowId,
    store
  };
  return /* @__PURE__ */ jsxs("tr", {
    children: [
      extraRowCells(extraCellsBefore, rowProps),
      isFalse(idColumn) ? null : /* @__PURE__ */ jsxs(Fragment, {
        children: [
          /* @__PURE__ */ jsx2("th", {
            title: localRowId,
            children: localRowId
          }),
          /* @__PURE__ */ jsx2("th", {
            title: remoteRowId,
            children: remoteRowId
          })
        ]
      }),
      objToArray(
        cells,
        ({ component: CellView2, getComponentProps }, compoundCellId) => {
          const [tableId, cellId] = strSplit(compoundCellId, DOT, 2);
          const rowId = tableId === localTableId ? localRowId : tableId === remoteTableId ? remoteRowId : void 0;
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
      ),
      extraRowCells(extraCellsAfter, rowProps, 1)
    ]
  });
};
var RelationshipInHtmlTable = ({
  relationshipId,
  relationships,
  editable,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  className,
  headerRow,
  idColumn = true
}) => {
  const [resolvedRelationships, store, localTableId, remoteTableId] = getRelationshipsStoreTableIds(
    useRelationshipsOrRelationshipsById2(relationships),
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
    store,
    extraCellsBefore,
    extraCellsAfter
  );
  return /* @__PURE__ */ jsxs("table", {
    className,
    children: [
      isFalse(headerRow) ? null : /* @__PURE__ */ jsx2("thead", {
        children: /* @__PURE__ */ jsxs("tr", {
          children: [
            extraHeaders(extraCellsBefore),
            isFalse(idColumn) ? null : /* @__PURE__ */ jsxs(Fragment, {
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
            ),
            extraHeaders(extraCellsAfter, 1)
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
var LEFT_ARROW = "\u2190";
var RIGHT_ARROW = "\u2192";
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
  const PaginatorComponent = isTrue(paginator) ? SortedTablePaginator : paginator;
  return [
    [currentCellId, currentDescending, currentOffset],
    handleSort,
    useMemo2(
      () => isFalse(paginator) ? null : /* @__PURE__ */ jsx2(PaginatorComponent, {
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
  extraCellsBefore,
  extraCellsAfter,
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
      extraCellsBefore,
      extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent
    )
  });
};
var SliceInHtmlTable = ({
  indexId,
  sliceId,
  indexes,
  editable,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}) => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById2(indexes),
    indexId
  );
  return /* @__PURE__ */ jsx2(HtmlTable, {
    ...props,
    params: useParams(
      useCells(
        useTableCellIds2(tableId, store),
        customCells,
        editable ? EditableCellView : CellView
      ),
      useStoreCellComponentProps(store, tableId),
      useSliceRowIds(indexId, sliceId, resolvedIndexes),
      extraCellsBefore,
      extraCellsAfter
    )
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
  extraCellsBefore,
  extraCellsAfter,
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
        useTableCellIds2(tableId, store),
        customCells,
        editable ? EditableCellView : CellView
      ),
      useStoreCellComponentProps(store, tableId),
      useSortedRowIds(tableId, ...sortAndOffset, limit, store),
      extraCellsBefore,
      extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent
    )
  });
};
var extraValueCells = (extraValueCells2 = [], extraValueCellProps, after = 0) => arrayMap2(
  extraValueCells2,
  ({ component: Component }, index) => /* @__PURE__ */ jsx2(
    "td",
    {
      className: EXTRA,
      children: /* @__PURE__ */ jsx2(Component, { ...extraValueCellProps })
    },
    extraKey(index, after)
  )
);
var ValuesInHtmlTable = ({
  store,
  editable = false,
  valueComponent: Value = editable ? EditableValueView : ValueView,
  getValueComponentProps,
  extraCellsBefore,
  extraCellsAfter,
  className,
  headerRow,
  idColumn
}) => /* @__PURE__ */ jsxs("table", {
  className,
  children: [
    headerRow === false ? null : /* @__PURE__ */ jsx2("thead", {
      children: /* @__PURE__ */ jsxs("tr", {
        children: [
          extraHeaders(extraCellsBefore),
          idColumn === false ? null : /* @__PURE__ */ jsx2("th", { children: "Id" }),
          /* @__PURE__ */ jsx2("th", { children: VALUE2 }),
          extraHeaders(extraCellsAfter, 1)
        ]
      })
    }),
    /* @__PURE__ */ jsx2("tbody", {
      children: arrayMap2(useValueIds2(store), (valueId) => {
        const valueProps = { valueId, store };
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            children: [
              extraValueCells(extraCellsBefore, valueProps),
              isFalse(idColumn) ? null : /* @__PURE__ */ jsx2("th", {
                title: valueId,
                children: valueId
              }),
              /* @__PURE__ */ jsx2("td", {
                children: /* @__PURE__ */ jsx2(Value, {
                  ...getProps2(getValueComponentProps, valueId),
                  ...valueProps
                })
              }),
              extraValueCells(extraCellsAfter, valueProps, 1)
            ]
          },
          valueId
        );
      })
    })
  ]
});
var Details = ({ uniqueId, title, editable, handleEditable, children, s }) => {
  const open2 = !!useCell(STATE_TABLE, uniqueId, OPEN_CELL, s);
  const handleToggle = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    OPEN_CELL,
    (event) => event[CURRENT_TARGET].open,
    [],
    s
  );
  return /* @__PURE__ */ jsxs("details", {
    open: open2,
    onToggle: handleToggle,
    children: [
      /* @__PURE__ */ jsxs("summary", {
        children: [
          /* @__PURE__ */ jsx2("span", { children: title }),
          handleEditable ? /* @__PURE__ */ jsx2("img", {
            onClick: handleEditable,
            className: editable ? "done" : "edit",
            title: editable ? "Done editing" : "Edit"
          }) : null
        ]
      }),
      /* @__PURE__ */ jsx2("div", { children })
    ]
  });
};
var IndexView = ({ indexes, indexesId, indexId, s }) => /* @__PURE__ */ jsx2(Details, {
  uniqueId: getUniqueId("i", indexesId, indexId),
  title: "Index: " + indexId,
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
    title: "Slice: " + sliceId,
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
    title: "Indexes: " + (indexesId ?? DEFAULT),
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
    /* @__PURE__ */ jsx2("th", { title: metricId, children: metricId }),
    /* @__PURE__ */ jsx2("td", { children: metrics?.getTableId(metricId) }),
    /* @__PURE__ */ jsx2("td", { children: useMetric(metricId, metrics) })
  ]
});
var MetricsView = ({ metricsId, s }) => {
  const metrics = useMetrics(metricsId);
  const metricIds = useMetricIds(metrics);
  return isUndefined2(metrics) ? null : /* @__PURE__ */ jsx2(Details, {
    uniqueId: getUniqueId("m", metricsId),
    title: "Metrics: " + (metricsId ?? DEFAULT),
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
    title: "Query: " + queryId,
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
    title: "Queries: " + (queriesId ?? DEFAULT),
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
    title: "Relationship: " + relationshipId,
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
    title: "Relationships: " + (relationshipsId ?? DEFAULT),
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
var getNewIdFromSuggestedId = (suggestedId, has) => {
  let newId;
  let suffix = 0;
  while (has(
    newId = suggestedId + (suffix > 0 ? " (copy" + (suffix > 1 ? " " + suffix : "") + ")" : "")
  )) {
    suffix++;
  }
  return newId;
};
var ConfirmableActions = ({ actions, ...props }) => {
  const [confirming, setConfirming] = useState2();
  const handleDone = useCallback2(() => setConfirming(void 0), []);
  useEffect2(() => {
    if (!isUndefined2(confirming)) {
      const handleKeyDown = (e) => {
        if (!isUndefined2(confirming) && e.key === "Escape") {
          e.preventDefault();
          handleDone();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [confirming, handleDone]);
  if (!isUndefined2(confirming)) {
    const [, , Component] = actions[confirming];
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [
        /* @__PURE__ */ jsx2(Component, { onDone: handleDone, ...props }),
        /* @__PURE__ */ jsx2("img", {
          onClick: handleDone,
          title: "Cancel",
          className: "cancel"
        })
      ]
    });
  } else {
    return actions.map(
      ([icon, title], index) => /* @__PURE__ */ jsx2(
        "img",
        {
          title,
          className: icon,
          onClick: () => setConfirming(index)
        },
        index
      )
    );
  }
};
var NewId = ({ onDone, suggestedId, has, set, prompt = "New Id" }) => {
  const [newId, setNewId] = useState2(suggestedId);
  const [newIdOk, setNewIdOk] = useState2(true);
  const [previousSuggestedId, setPreviousSuggestedNewId] = useState2(suggestedId);
  const handleNewIdChange = (e) => {
    setNewId(e.target.value);
    setNewIdOk(!has(e.target.value));
  };
  const handleClick = useCallback2(() => {
    if (has(newId)) {
      setNewIdOk(false);
    } else {
      set(newId);
      onDone();
    }
  }, [onDone, setNewIdOk, has, set, newId]);
  const handleKeyDown = useCallback2(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );
  if (suggestedId != previousSuggestedId) {
    setNewId(suggestedId);
    setPreviousSuggestedNewId(suggestedId);
  }
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      prompt + ": ",
      /* @__PURE__ */ jsx2("input", {
        type: "text",
        value: newId,
        onChange: handleNewIdChange,
        onKeyDown: handleKeyDown,
        autoFocus: true
      }),
      " ",
      /* @__PURE__ */ jsx2("img", {
        onClick: handleClick,
        title: newIdOk ? "Confirm" : "Id already exists",
        className: newIdOk ? "ok" : "okDis"
      })
    ]
  });
};
var Delete = ({ onClick, prompt = "Delete" }) => {
  const handleKeyDown = useCallback2(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );
  useEffect2(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      prompt,
      "? ",
      /* @__PURE__ */ jsx2("img", { onClick, title: "Confirm", className: "ok" })
    ]
  });
};
var Actions = ({ left, right }) => /* @__PURE__ */ jsxs("div", {
  className: "actions",
  children: [
    /* @__PURE__ */ jsx2("div", { children: left }),
    /* @__PURE__ */ jsx2("div", { children: right })
  ]
});
var useHasTableCallback = (storeOrStoreId) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  return useCallback2((tableId) => store?.hasTable(tableId) ?? false, [store]);
};
var AddTable = ({ onDone, store }) => {
  const has = useHasTableCallback(store);
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId("table", has),
    has,
    set: useSetTableCallback(
      (newId) => newId,
      () => ({ row: { cell: "" } }),
      [],
      store
    ),
    prompt: "Add table"
  });
};
var DeleteTables = ({ onDone, store }) => /* @__PURE__ */ jsx2(Delete, {
  onClick: useDelTablesCallback(store, onDone),
  prompt: "Delete all tables"
});
var TablesActions = ({ store }) => /* @__PURE__ */ jsx2(Actions, {
  left: /* @__PURE__ */ jsx2(ConfirmableActions, {
    actions: [["add", "Add table", AddTable]],
    store
  }),
  right: useHasTables(store) ? /* @__PURE__ */ jsx2(ConfirmableActions, {
    actions: [["delete", "Delete all tables", DeleteTables]],
    store
  }) : null
});
var AddRow = ({ onDone, tableId, store }) => {
  const has = useHasRowCallback(store, tableId);
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId("row", has),
    has,
    set: useSetRowCallback(
      tableId,
      (newId) => newId,
      (_, store2) => objNew(
        arrayMap2(store2.getTableCellIds(tableId), (cellId) => [cellId, ""])
      )
    ),
    prompt: "Add row"
  });
};
var CloneTable = ({ onDone, tableId, store: storeOrStoreId }) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  const has = useHasTableCallback(store);
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId(tableId, has),
    has,
    set: useSetTableCallback(
      (tableId2) => tableId2,
      (_, store2) => store2.getTable(tableId)
    ),
    prompt: "Clone table to"
  });
};
var DeleteTable = ({ onDone, tableId, store }) => /* @__PURE__ */ jsx2(Delete, {
  onClick: useDelTableCallback(tableId, store, onDone),
  prompt: "Delete table"
});
var TableActions1 = ({ tableId, store }) => /* @__PURE__ */ jsx2(ConfirmableActions, {
  actions: [["add", "Add row", AddRow]],
  store,
  tableId
});
var TableActions2 = ({ tableId, store }) => /* @__PURE__ */ jsx2(ConfirmableActions, {
  actions: [
    ["clone", "Clone table", CloneTable],
    ["delete", "Delete table", DeleteTable]
  ],
  store,
  tableId
});
var useHasRowCallback = (storeOrStoreId, tableId) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  return useCallback2(
    (rowId) => store?.hasRow(tableId, rowId) ?? false,
    [store, tableId]
  );
};
var AddCell = ({ onDone, tableId, rowId, store: storeOrStoreId }) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  const has = useCallback2(
    (cellId) => store.hasCell(tableId, rowId, cellId),
    [store, tableId, rowId]
  );
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId("cell", has),
    has,
    set: useSetCellCallback2(
      tableId,
      rowId,
      (newId) => newId,
      () => "",
      [],
      store
    ),
    prompt: "Add cell"
  });
};
var CloneRow = ({ onDone, tableId, rowId, store: storeOrStoreId }) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  const has = useHasRowCallback(store, tableId);
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId(rowId, has),
    has,
    set: useSetRowCallback(
      tableId,
      (newId) => newId,
      (_, store2) => store2.getRow(tableId, rowId),
      [rowId]
    ),
    prompt: "Clone row to"
  });
};
var DeleteRow = ({ onDone, tableId, rowId, store }) => /* @__PURE__ */ jsx2(Delete, {
  onClick: useDelRowCallback(tableId, rowId, store, onDone),
  prompt: "Delete row"
});
var RowActions = ({ tableId, rowId, store }) => /* @__PURE__ */ jsx2(ConfirmableActions, {
  actions: [
    ["add", "Add cell", AddCell],
    ["clone", "Clone row", CloneRow],
    ["delete", "Delete row", DeleteRow]
  ],
  store,
  tableId,
  rowId
});
var CellDelete = ({ onDone, tableId, rowId, cellId, store }) => /* @__PURE__ */ jsx2(Delete, {
  onClick: useDelCellCallback(tableId, rowId, cellId, true, store, onDone),
  prompt: "Delete cell"
});
var CellActions = ({ tableId, rowId, cellId, store }) => /* @__PURE__ */ jsx2(ConfirmableActions, {
  actions: [["delete", "Delete cell", CellDelete]],
  store,
  tableId,
  rowId,
  cellId
});
var rowActions = [{ label: "", component: RowActions }];
var EditableCellViewWithActions = (props) => /* @__PURE__ */ jsxs(Fragment, {
  children: [
    /* @__PURE__ */ jsx2(EditableCellView, { ...props }),
    useHasCell(props.tableId, props.rowId, props.cellId, props.store) && /* @__PURE__ */ jsx2(CellActions, { ...props })
  ]
});
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
  const CellComponent = editable ? EditableCellViewWithActions : CellView;
  return /* @__PURE__ */ jsxs(Details, {
    uniqueId,
    title: TABLE2 + ": " + tableId,
    editable,
    handleEditable,
    s,
    children: [
      /* @__PURE__ */ jsx2(SortedTableInHtmlTable, {
        tableId,
        store,
        cellId,
        descending,
        offset,
        limit: 10,
        paginator: true,
        sortOnClick: true,
        onChange: handleChange,
        editable,
        extraCellsAfter: editable ? rowActions : [],
        customCells: objNew(
          arrayMap2(useTableCellIds(tableId, store), (cellId2) => [
            cellId2,
            { label: cellId2, component: CellComponent }
          ])
        )
      }),
      editable ? /* @__PURE__ */ jsxs("div", {
        className: "actions",
        children: [
          /* @__PURE__ */ jsx2("div", {
            children: /* @__PURE__ */ jsx2(TableActions1, { tableId, store })
          }),
          /* @__PURE__ */ jsx2("div", {
            children: /* @__PURE__ */ jsx2(TableActions2, { tableId, store })
          })
        ]
      }) : null
    ]
  });
};
var TablesView = ({ store, storeId, s }) => {
  const uniqueId = getUniqueId("ts", storeId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  const tableIds = useTableIds(store);
  return /* @__PURE__ */ jsxs(Details, {
    uniqueId,
    title: TABLES2,
    editable,
    handleEditable,
    s,
    children: [
      arrayIsEmpty(tableIds) ? /* @__PURE__ */ jsx2("caption", { children: "No tables." }) : sortedIdsMap(
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
      ),
      editable ? /* @__PURE__ */ jsx2(TablesActions, { store }) : null
    ]
  });
};
var useHasValueCallback = (storeOrStoreId) => {
  const store = useStoreOrStoreById2(storeOrStoreId);
  return useCallback2((valueId) => store?.hasValue(valueId) ?? false, [store]);
};
var AddValue = ({ onDone, store }) => {
  const has = useHasValueCallback(store);
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId("value", has),
    has,
    set: useSetValueCallback2(
      (newId) => newId,
      () => "",
      [],
      store
    ),
    prompt: "Add value"
  });
};
var DeleteValues = ({ onDone, store }) => /* @__PURE__ */ jsx2(Delete, {
  onClick: useDelValuesCallback(store, onDone),
  prompt: "Delete all values"
});
var ValuesActions = ({ store }) => /* @__PURE__ */ jsx2(Actions, {
  left: /* @__PURE__ */ jsx2(ConfirmableActions, {
    actions: [["add", "Add value", AddValue]],
    store
  }),
  right: useHasValues(store) ? /* @__PURE__ */ jsx2(ConfirmableActions, {
    actions: [["delete", "Delete all values", DeleteValues]],
    store
  }) : null
});
var CloneValue = ({ onDone, valueId, store }) => {
  const has = useHasValueCallback(store);
  return /* @__PURE__ */ jsx2(NewId, {
    onDone,
    suggestedId: getNewIdFromSuggestedId(valueId, has),
    has,
    set: useSetValueCallback2(
      (newId) => newId,
      (_, store2) => store2.getValue(valueId) ?? "",
      [valueId],
      store
    ),
    prompt: "Clone value to"
  });
};
var DeleteValue = ({ onDone, valueId, store }) => /* @__PURE__ */ jsx2(Delete, {
  onClick: useDelValueCallback(valueId, store, onDone),
  prompt: "Delete value"
});
var ValueActions = ({ valueId, store }) => /* @__PURE__ */ jsx2(ConfirmableActions, {
  actions: [
    ["clone", "Clone value", CloneValue],
    ["delete", "Delete value", DeleteValue]
  ],
  store,
  valueId
});
var valueActions = [{ label: "", component: ValueActions }];
var ValuesView = ({ store, storeId, s }) => {
  const uniqueId = getUniqueId("v", storeId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return /* @__PURE__ */ jsxs(Details, {
    uniqueId,
    title: VALUES2,
    editable,
    handleEditable,
    s,
    children: [
      arrayIsEmpty(useValueIds(store)) ? /* @__PURE__ */ jsx2("caption", { children: "No values." }) : /* @__PURE__ */ jsx2(ValuesInHtmlTable, {
        store,
        editable,
        extraCellsAfter: editable ? valueActions : []
      }),
      editable ? /* @__PURE__ */ jsx2(ValuesActions, { store }) : null
    ]
  });
};
var StoreView = ({ storeId, s }) => {
  const store = useStore(storeId);
  return isUndefined2(store) ? null : /* @__PURE__ */ jsxs(Details, {
    uniqueId: getUniqueId("s", storeId),
    title: (store.isMergeable() ? "Mergeable" : "") + "Store: " + (storeId ?? DEFAULT),
    s,
    children: [
      /* @__PURE__ */ jsx2(ValuesView, { storeId, store, s }),
      /* @__PURE__ */ jsx2(TablesView, { storeId, store, s })
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
  const handleClick = () => open("https://tinybase.org", "_blank");
  const handleClose = useSetValueCallback(OPEN_VALUE, () => false, [], s);
  const handleDock = useSetValueCallback(
    POSITION_VALUE,
    (event) => Number(event[CURRENT_TARGET].dataset.id),
    [],
    s
  );
  return /* @__PURE__ */ jsxs("header", {
    children: [
      /* @__PURE__ */ jsx2("img", {
        className: "flat",
        title: TITLE,
        onClick: handleClick
      }),
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
      /* @__PURE__ */ jsx2("img", {
        className: "flat",
        onClick: handleClose,
        title: "Close"
      })
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
var PRE_CSS = 'url("';
var POST_CSS = '")';
var getCssSvg = (path, color = "white") => ({
  content: PRE_CSS + `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960' fill='${color}'><path d='${path}' /></svg>` + POST_CSS
});
var VERTICAL_THIN = "v560h120v-560h-120Z";
var VERTICAL_THICK = "v560h360v-560h-360Z";
var HORIZONTAL_THIN = "v120h560v-120h-560Z";
var HORIZONTAL_THICK = "v360h560v-360h-560Z";
var LOGO_SVG = { content: PRE_CSS + img + POST_CSS };
var POSITIONS_SVG = arrayMap2(
  [
    `M200-760${VERTICAL_THIN} M400-760${VERTICAL_THICK}`,
    `M200-760${HORIZONTAL_THIN} M200-560${HORIZONTAL_THICK}`,
    `M200-760${HORIZONTAL_THICK} M200-320${HORIZONTAL_THIN}`,
    `M200-760${VERTICAL_THICK} M640-760${VERTICAL_THIN}`
  ],
  (path) => getCssSvg(
    "M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z" + path
  )
);
arrayPush(
  POSITIONS_SVG,
  getCssSvg(
    "M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"
  )
);
var CLOSE_SVG = getCssSvg(
  "m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"
);
var EDIT_SVG = getCssSvg(
  "M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
);
var DONE_SVG = getCssSvg(
  "m622-453-56-56 82-82-57-57-82 82-56-56 195-195q12-12 26.5-17.5T705-840q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L622-453ZM200-200h57l195-195-28-29-29-28-195 195v57ZM792-56 509-338 290-120H120v-169l219-219L56-792l57-57 736 736-57 57Zm-32-648-56-56 56 56Zm-169 56 57 57-57-57ZM424-424l-29-28 57 57-28-29Z"
);
var ADD_SVG = getCssSvg(
  "M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
);
var CLONE_SVG = getCssSvg(
  "M520-400h80v-120h120v-80H600v-120h-80v120H400v80h120v120ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"
);
var DELETE_SVG = getCssSvg(
  "M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
);
var OK_SVG = getCssSvg(
  "m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
  "rgb(127,255,127)"
);
var OK_SVG_DISABLED = getCssSvg(
  "m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z",
  "rgb(255,255,127)"
);
var CANCEL_SVG = getCssSvg(
  "m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
  "rgb(255,127,127)"
);
var DOWN_SVG = getCssSvg(
  "M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"
);
var RIGHT_SVG = getCssSvg(
  "M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"
);
var SCROLLBAR = "*::-webkit-scrollbar";
var BACKGROUND = "background";
var WIDTH = "width";
var MAX_WIDTH = "max-" + WIDTH;
var MIN_WIDTH = "min-" + WIDTH;
var HEIGHT = "height";
var BORDER = "border";
var BORDER_RADIUS = BORDER + "-radius";
var PADDING = "padding";
var MARGIN = "margin";
var MARGIN_RIGHT = MARGIN + "-right";
var TOP = "top";
var BOTTOM = "bottom";
var LEFT = "left";
var RIGHT = "right";
var COLOR = "color";
var POSITION = "position";
var BOX_SHADOW = "box-shadow";
var FONT_SIZE = "font-size";
var DISPLAY = "display";
var OVERFLOW = "overflow";
var CURSOR = "cursor";
var VERTICAL_ALIGN = "vertical-align";
var TEXT_ALIGN = "text-align";
var JUSTIFY_CONTENT = "justify-content";
var FIXED = "fixed";
var REVERT = "revert";
var UNSET = "unset";
var NONE = "none";
var FLEX = "flex";
var POINTER = "pointer";
var AUTO = "auto";
var HIDDEN = "hidden";
var NOWRAP = "nowrap";
var oklch = (lPercent, remainder = "% 0.01 " + cssVar("hue")) => `oklch(${lPercent}${remainder})`;
var cssVar = (name) => `var(--${name})`;
var rem = (...rems) => `${rems.join("rem ")}rem`;
var px = (...pxs) => `${pxs.join("px ")}px`;
var vw = (vw2 = 100) => `${vw2}vw`;
var vh = (vh2 = 100) => `${vh2}vh`;
var APP_STYLESHEET = arrayJoin(
  objToArray(
    {
      "": {
        all: "initial",
        [FONT_SIZE]: rem(0.75),
        [POSITION]: FIXED,
        "font-family": "inter,sans-serif",
        "z-index": 999999,
        "--bg": oklch(20),
        "--bg2": oklch(15),
        "--bg3": oklch(25),
        "--bg4": oklch(30),
        "--fg": oklch(85),
        "--fg2": oklch(60),
        ["--" + BORDER]: px(1) + " solid " + cssVar("bg4"),
        ["--" + BOX_SHADOW]: px(0, 1, 2, 0) + " #0007"
      },
      "*": { all: REVERT },
      "*::before": { all: REVERT },
      "*::after": { all: REVERT },
      [SCROLLBAR]: { [WIDTH]: rem(0.5), [HEIGHT]: rem(0.5) },
      [SCROLLBAR + "-thumb"]: { [BACKGROUND]: cssVar("bg4") },
      [SCROLLBAR + "-thumb:hover"]: { [BACKGROUND]: cssVar("bg4") },
      [SCROLLBAR + "-corner"]: { [BACKGROUND]: NONE },
      [SCROLLBAR + "-track"]: { [BACKGROUND]: NONE },
      img: {
        [WIDTH]: rem(0.8),
        [HEIGHT]: rem(0.8),
        [VERTICAL_ALIGN]: "text-" + BOTTOM,
        [CURSOR]: POINTER,
        [MARGIN]: px(-2.5, 2, -2.5, 0),
        [PADDING]: px(2),
        [BORDER]: cssVar(BORDER),
        [BACKGROUND]: cssVar("bg3"),
        [BOX_SHADOW]: cssVar(BOX_SHADOW),
        [BORDER_RADIUS]: rem(0.25)
      },
      "img.flat": { [BORDER]: NONE, [BACKGROUND]: NONE, [BOX_SHADOW]: NONE },
      // Nub
      ">img": {
        [PADDING]: rem(0.25),
        [BOTTOM]: 0,
        [RIGHT]: 0,
        [POSITION]: FIXED,
        [HEIGHT]: UNSET,
        [MARGIN]: 0,
        ...LOGO_SVG
      },
      ...objNew(
        arrayMap2(
          [
            { [BOTTOM]: 0, [LEFT]: 0 },
            { [TOP]: 0, [RIGHT]: 0 }
          ],
          (css, p) => [`>img[data-position='${p}']`, css]
        )
      ),
      // Panel
      main: {
        [DISPLAY]: FLEX,
        [COLOR]: cssVar("fg"),
        [BACKGROUND]: cssVar("bg"),
        [OVERFLOW]: HIDDEN,
        [POSITION]: FIXED,
        [BOX_SHADOW]: cssVar(BOX_SHADOW),
        "flex-direction": "column"
      },
      ...objNew(
        arrayMap2(
          [
            {
              [BOTTOM]: 0,
              [LEFT]: 0,
              [WIDTH]: vw(35),
              [HEIGHT]: vh(),
              [BORDER + "-" + RIGHT]: cssVar(BORDER)
            },
            {
              [TOP]: 0,
              [RIGHT]: 0,
              [WIDTH]: vw(),
              [HEIGHT]: vh(30),
              [BORDER + "-" + BOTTOM]: cssVar(BORDER)
            },
            {
              [BOTTOM]: 0,
              [LEFT]: 0,
              [WIDTH]: vw(),
              [HEIGHT]: vh(30),
              [BORDER + "-" + TOP]: cssVar(BORDER)
            },
            {
              [TOP]: 0,
              [RIGHT]: 0,
              [WIDTH]: vw(35),
              [HEIGHT]: vh(),
              [BORDER + "-" + LEFT]: cssVar(BORDER)
            },
            { [TOP]: 0, [RIGHT]: 0, [WIDTH]: vw(), [HEIGHT]: vh() }
          ],
          (css, p) => [`main[data-position='${p}']`, css]
        )
      ),
      // Header
      header: {
        [DISPLAY]: FLEX,
        [PADDING]: rem(0.5),
        [BOX_SHADOW]: cssVar(BOX_SHADOW),
        [BACKGROUND]: oklch(30, "% 0.008 var(--hue) / .5"),
        [WIDTH]: "calc(100% - .5rem)",
        [POSITION]: "absolute",
        [BORDER + "-" + BOTTOM]: cssVar(BORDER),
        "align-items": "center",
        "backdrop-filter": "blur(4px)"
      },
      "header>img:nth-of-type(1)": {
        [HEIGHT]: rem(1),
        [WIDTH]: rem(1),
        ...LOGO_SVG
      },
      "header>img:nth-of-type(6)": CLOSE_SVG,
      ...objNew(
        arrayMap2(POSITIONS_SVG, (SVG, p) => [
          `header>img[data-id='${p}']`,
          SVG
        ])
      ),
      "header>span": {
        [OVERFLOW]: HIDDEN,
        [FLEX]: 1,
        "font-weight": 800,
        "white-space": NOWRAP,
        "text-overflow": "ellipsis"
      },
      // Body
      article: { [OVERFLOW]: AUTO, [FLEX]: 1, [PADDING + "-" + TOP]: rem(2) },
      details: {
        [MARGIN]: rem(0.5),
        [BORDER]: cssVar(BORDER),
        [BORDER_RADIUS]: rem(0.25)
      },
      summary: {
        [BACKGROUND]: cssVar("bg3"),
        [MARGIN]: px(-1),
        [BORDER]: cssVar(BORDER),
        [PADDING]: rem(0.25, 0.125),
        [DISPLAY]: FLEX,
        [BORDER_RADIUS]: rem(0.25),
        "user-select": NONE,
        [JUSTIFY_CONTENT]: "space-between",
        "align-items": "center"
      },
      "summary>span::before": {
        [DISPLAY]: "inline-block",
        [VERTICAL_ALIGN]: "sub",
        [MARGIN]: px(2),
        [WIDTH]: rem(1),
        [HEIGHT]: rem(1),
        ...RIGHT_SVG
      },
      "details[open]>summary": {
        "border-bottom-left-radius": 0,
        "border-bottom-right-radius": 0,
        [MARGIN + "-" + BOTTOM]: 0
      },
      "details[open]>summary>span::before": DOWN_SVG,
      "details>summary img": { [DISPLAY]: NONE },
      "details[open]>summary img": {
        [DISPLAY]: UNSET,
        [MARGIN + "-" + LEFT]: rem(0.25)
      },
      "details>div": { [OVERFLOW]: AUTO },
      caption: {
        [COLOR]: cssVar("fg2"),
        [PADDING]: rem(0.25, 0.5),
        [TEXT_ALIGN]: LEFT,
        "white-space": NOWRAP
      },
      "caption button": {
        [WIDTH]: rem(1.5),
        [BORDER]: NONE,
        [BACKGROUND]: NONE,
        [COLOR]: cssVar("fg"),
        [PADDING]: 0,
        [CURSOR]: POINTER
      },
      "caption button[disabled]": { [COLOR]: cssVar("fg2") },
      ".actions": {
        [PADDING]: rem(0.75, 0.5),
        [MARGIN]: 0,
        [DISPLAY]: FLEX,
        [BORDER + "-" + TOP]: cssVar(BORDER),
        [JUSTIFY_CONTENT]: "space-between"
      },
      // tables
      table: {
        [MIN_WIDTH]: "100%",
        "border-collapse": "collapse",
        "table-layout": FIXED
      },
      thead: { [BACKGROUND]: cssVar("bg") },
      [`th,#${UNIQUE_ID} td`]: {
        [OVERFLOW]: HIDDEN,
        [PADDING]: rem(0.25, 0.5),
        [MAX_WIDTH]: rem(20),
        [BORDER]: cssVar(BORDER),
        "text-overflow": "ellipsis",
        "white-space": NOWRAP,
        "border-width": px(1, 0, 0),
        [TEXT_ALIGN]: LEFT
      },
      "th:first-child": {
        [WIDTH]: rem(3),
        [MIN_WIDTH]: rem(3),
        [MAX_WIDTH]: rem(3)
      },
      "th.sorted": { [BACKGROUND]: cssVar("bg3") },
      "td.extra": { [TEXT_ALIGN]: RIGHT },
      "tbody button": {
        [BACKGROUND]: NONE,
        [BORDER]: NONE,
        [FONT_SIZE]: 0,
        [WIDTH]: rem(0.8),
        [HEIGHT]: rem(0.8),
        [COLOR]: cssVar("fg2"),
        [MARGIN]: rem(0, 0.25, 0, -0.25),
        "line-height": rem(0.8)
      },
      "tbody button:first-letter": { [FONT_SIZE]: rem(0.8) },
      input: {
        [BACKGROUND]: cssVar("bg2"),
        [COLOR]: UNSET,
        [PADDING]: px(4),
        [BORDER]: 0,
        [MARGIN]: px(-4, 0),
        [FONT_SIZE]: UNSET,
        [MAX_WIDTH]: rem(6)
      },
      "input:focus": { "outline-width": 0 },
      'input[type="number"]': { [WIDTH]: rem(3) },
      'input[type="checkbox"]': { [VERTICAL_ALIGN]: px(-2) },
      ".editableCell": { [DISPLAY]: "inline-block", [MARGIN_RIGHT]: px(2) },
      "button.next": { [MARGIN_RIGHT]: rem(0.5) },
      "img.edit": EDIT_SVG,
      "img.done": DONE_SVG,
      "img.add": ADD_SVG,
      "img.clone": CLONE_SVG,
      "img.delete": DELETE_SVG,
      "img.ok": OK_SVG,
      "img.okDis": OK_SVG_DISABLED,
      "img.cancel": CANCEL_SVG,
      "span.warn": { [MARGIN]: rem(2, 0.25), [COLOR]: "#d81b60" }
    },
    (style, selector) => `#${UNIQUE_ID} ${selector}{${arrayJoin(
      objToArray(style, (value, property) => `${property}:${value};`)
    )}}`
  )
);
var Inspector = ({ position = "right", open: open2 = false, hue = 270 }) => {
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
          open: !!open2
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
      /* @__PURE__ */ jsxs("style", {
        children: [`#${UNIQUE_ID}{--hue:${hue}}`, APP_STYLESHEET]
      })
    ]
  });
};
export {
  Inspector
};
