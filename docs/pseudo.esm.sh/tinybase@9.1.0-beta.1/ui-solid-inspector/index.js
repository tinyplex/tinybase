// dist/ui-solid-inspector/index.js
import {
  createContext as createContext2,
  createEffect as createEffect2,
  createMemo as createMemo2,
  createRenderEffect as createRenderEffect2,
  createSignal as createSignal2,
  ErrorBoundary,
  onCleanup as onCleanup2,
  untrack as untrack2,
  useContext as useContext2
} from "https://esm.sh/solid-js@^1.9.14";
import {
  addEventListener,
  className,
  createComponent as createComponent2,
  effect,
  insert,
  memo as memo2,
  mergeProps as mergeProps2,
  setAttribute,
  setStyleProperty,
  template,
  use
} from "https://esm.sh/solid-js@^1.9.14/web";

// dist/ui-solid/index.js
import {
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  untrack,
  useContext
} from "https://esm.sh/solid-js@^1.9.14";
import { createComponent, memo, mergeProps } from "https://esm.sh/solid-js@^1.9.14/web";
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
var DEL = "del";
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
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
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
    ([index, value1]) => isObject(value1) ? (
      /* istanbul ignore next */
      isObject(obj2[index]) ? objIsEqual(obj2[index], value1, isEqual3) : false
    ) : isEqual3(value1, obj2[index])
  );
};
var getValue = (value) => isFunction(value) ? value() : value;
var getProps = (getProps22, ...ids) => isUndefined(getProps22) ? {} : getProps22(...ids);
var TINYBASE_CONTEXT = TINYBASE + "_uisc";
var EMPTY_CONTEXT$1 = () => [];
var EMPTY_CONTEXT_VALUE = { value: EMPTY_CONTEXT$1 };
var GLOBAL_CONTEXT = GLOBAL;
var Context = GLOBAL_CONTEXT[TINYBASE_CONTEXT] ? (
  /* istanbul ignore next */
  GLOBAL_CONTEXT[TINYBASE_CONTEXT]
) : GLOBAL_CONTEXT[TINYBASE_CONTEXT] = createContext(EMPTY_CONTEXT_VALUE);
var useThing = (id2, offset) => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT$1;
  return () => {
    const resolvedContextValue = contextValue();
    const resolvedId = getValue(id2);
    return isUndefined(resolvedId) ? resolvedContextValue[offset * 2] : isString(resolvedId) ? objGet(resolvedContextValue[offset * 2 + 1], resolvedId) : resolvedId;
  };
};
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return () => {
    const resolvedThingOrThingId = getValue(thingOrThingId);
    return isUndefined(resolvedThingOrThingId) || isString(resolvedThingOrThingId) ? thing() : resolvedThingOrThingId;
  };
};
var useThingIds = (offset) => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT$1;
  return () => objIds(contextValue()[offset * 2 + 1] ?? {});
};
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
var getThing = (thing) => isFunction(thing) ? thing() : thing;
var EMPTY_LISTENER_ARG_GETTERS = [];
var addAndDelListener = (thing, listenable, ...args) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener?.(listenerId);
};
var useListenable = (listenable, thing, returnType, listenerArgGetters = EMPTY_LISTENER_ARG_GETTERS) => {
  const [result, setResult] = createSignal(DEFAULTS[returnType]);
  const getListenerArguments = () => arrayMap(listenerArgGetters, getThing);
  const getResult = () => getThing(thing)?.[(returnType == 6 ? _HAS : GET) + listenable]?.(...getListenerArguments()) ?? DEFAULTS[returnType];
  const updateResult = () => {
    const nextResult = getResult();
    const prevResult = untrack(result);
    setResult(
      () => !(IS_EQUALS[returnType] ?? isEqual)(nextResult, prevResult) ? nextResult : prevResult
    );
  };
  createRenderEffect(() => {
    const resolvedThing = getThing(thing);
    const listenerArguments = getListenerArguments();
    updateResult();
    const cleanup = addAndDelListener(
      resolvedThing,
      (returnType == 6 ? HAS : EMPTY_STRING) + listenable,
      ...listenerArguments,
      updateResult
    );
    onCleanup(cleanup);
  });
  return result;
};
var useSetCallback = (storeOrQueries, settable, get, then = getUndefined, methodPrefix, ...args) => (parameter) => ifNotUndefined(
  getThing(storeOrQueries),
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
);
var useStoreSetCallback = (storeOrStoreId, settable, get, then, ...args) => useSetCallback(
  useStoreOrStoreById(storeOrStoreId),
  settable,
  get,
  then,
  SET,
  ...args
);
var argsOrGetArgs = (args, store, parameter) => arrayMap(
  args,
  (arg) => isFunction(arg) ? arg.length == 0 ? getThing(arg) : arg(parameter, store) : arg
);
var useDel = (storeOrStoreId, deletable, then = getUndefined, ...args) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (parameter) => {
    const resolvedStore = getThing(store);
    ifNotUndefined(
      resolvedStore,
      (store2) => then(store2[DEL + deletable](...argsOrGetArgs(args, store2, parameter)))
    );
  };
};
var useCreateStore = (create) => {
  const store = createMemo(create);
  return store;
};
var useStoreIds = () => useThingIds(OFFSET_STORE);
var useStore = (id2) => useThing(id2, OFFSET_STORE);
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
var useHasTables = (storeOrStoreId) => useListenable(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  6,
  []
);
var useTableIds = (storeOrStoreId) => useListenable(
  TABLE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1
  /* Array */
);
var useTable = (tableId, storeOrStoreId) => useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 0, [
  tableId
]);
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
var useHasValues = (storeOrStoreId) => useListenable(
  VALUES,
  useStoreOrStoreById(storeOrStoreId),
  6,
  []
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
var useSetTableCallback = (tableId, getTable, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, TABLE, getTable, then, tableId);
var useSetRowCallback = (tableId, rowId, getRow, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, ROW, getRow, then, tableId, rowId);
var useSetCellCallback = (tableId, rowId, cellId, getCell, storeOrStoreId, then) => useStoreSetCallback(
  storeOrStoreId,
  CELL,
  getCell,
  then,
  tableId,
  rowId,
  cellId
);
var useSetValueCallback = (valueId, getValue3, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, VALUE, getValue3, then, valueId);
var useDelTablesCallback = (storeOrStoreId, then) => useDel(storeOrStoreId, TABLES, then);
var useDelTableCallback = (tableId, storeOrStoreId, then) => useDel(storeOrStoreId, TABLE, then, tableId);
var useDelRowCallback = (tableId, rowId, storeOrStoreId, then) => useDel(storeOrStoreId, ROW, then, tableId, rowId);
var useDelCellCallback = (tableId, rowId, cellId, forceDel, storeOrStoreId, then) => useDel(storeOrStoreId, CELL, then, tableId, rowId, cellId, forceDel);
var useDelValuesCallback = (storeOrStoreId, then) => useDel(storeOrStoreId, VALUES, then);
var useDelValueCallback = (valueId, storeOrStoreId, then) => useDel(storeOrStoreId, VALUE, then, valueId);
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
var useCreatePersister = (store, create, then, destroy) => {
  const [persister, setPersister] = createSignal();
  createEffect(() => {
    let current = true;
    let createdPersister;
    const destroyPersister = (persister2) => {
      persister2.destroy();
      destroy?.(persister2);
    };
    (async () => {
      const resolvedStore = getThing(store);
      createdPersister = resolvedStore ? await create(resolvedStore) : void 0;
      if (!current) {
        if (createdPersister) {
          destroyPersister(createdPersister);
        }
        return;
      }
      setPersister(() => createdPersister);
      if (createdPersister && then) {
        await then(createdPersister);
      }
    })();
    onCleanup(() => {
      current = false;
      setPersister(() => void 0);
      if (createdPersister) {
        destroyPersister(createdPersister);
      }
    });
  });
  return persister;
};
var wrap = (children, separator, encloseWithId, id2) => {
  const separated = isUndefined(separator) || !isArray(children) ? children : arrayMap(children, (child, c) => c > 0 ? [separator, child] : child);
  return encloseWithId ? [id2, ":{", separated, "}"] : separated;
};
var CheckpointView = (props) => {
  const checkpoint = useCheckpoint(
    () => props.checkpointId,
    () => props.checkpoints
  );
  return memo(
    () => wrap(
      getValue(checkpoint) ?? EMPTY_STRING,
      void 0,
      props.debugIds,
      props.checkpointId
    )
  );
};
var ResultCellView = (props) => {
  const resultCell = useResultCell(
    () => props.queryId,
    () => props.rowId,
    () => props.cellId,
    () => props.queries
  );
  return memo(
    () => wrap(
      EMPTY_STRING + (getValue(resultCell) ?? EMPTY_STRING),
      void 0,
      props.debugIds,
      props.cellId
    )
  );
};
var CellView = (props) => {
  const cell = useCell(
    () => props.tableId,
    () => props.rowId,
    () => props.cellId,
    () => props.store
  );
  return memo(
    () => wrap(
      EMPTY_STRING + (getValue(cell) ?? EMPTY_STRING),
      void 0,
      props.debugIds,
      props.cellId
    )
  );
};
var getUseCheckpointView = (getCheckpoints) => (props) => {
  const resolvedCheckpoints = useCheckpointsOrCheckpointsById(
    () => props.checkpoints
  );
  const checkpointIds = useCheckpointIds(resolvedCheckpoints);
  const content = () => {
    const Checkpoint = props.checkpointComponent ?? CheckpointView;
    return wrap(
      arrayMap(
        getCheckpoints(getValue(checkpointIds)),
        (checkpointId) => createComponent(
          Checkpoint,
          mergeProps(
            () => getProps(props.getCheckpointComponentProps, checkpointId),
            {
              get checkpoints() {
                return getValue(resolvedCheckpoints);
              },
              checkpointId,
              get debugIds() {
                return props.debugIds;
              }
            }
          )
        )
      ),
      props.separator
    );
  };
  return memo(content);
};
var BackwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[0]
);
var CurrentCheckpointView = getUseCheckpointView(
  (checkpointIds) => isNullish(checkpointIds[1]) ? [] : [checkpointIds[1]]
);
var ForwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[2]
);
var ValueView = (props) => {
  const value = useValue(
    () => props.valueId,
    () => props.store
  );
  return memo(
    () => wrap(
      EMPTY_STRING + (getValue(value) ?? EMPTY_STRING),
      void 0,
      props.debugIds,
      props.valueId
    )
  );
};

// dist/ui-solid-inspector/index.js
var getTypeOf2 = (thing) => typeof thing;
var TINYBASE2 = "tinybase";
var EMPTY_STRING2 = "";
var DOT = ".";
var STRING2 = getTypeOf2(EMPTY_STRING2);
var BOOLEAN = getTypeOf2(true);
var NUMBER = getTypeOf2(0);
var FUNCTION2 = getTypeOf2(getTypeOf2);
var OBJECT = "object";
var ARRAY = "array";
var TYPE = "type";
var DEFAULT = "default";
var ALLOW_NULL = "allowNull";
var NULL = "null";
var LISTENER2 = "Listener";
var RESULT2 = "Result";
var GET2 = "get";
var SET2 = "set";
var ADD2 = "add";
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
var JSON_PREFIX = "\uFFFD";
var id = (key) => EMPTY_STRING2 + key;
var strSplit = (str, separator = EMPTY_STRING2, limit) => str.split(separator, limit);
var math = Math;
var getIfNotFunction2 = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL2 = globalThis;
var WINDOW = GLOBAL2.window;
var number = Number;
var string = String;
var boolean = Boolean;
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
var getArg = (value) => value;
var structuredClone = GLOBAL2.structuredClone;
var errorNew = (message) => {
  throw new Error(message);
};
var tryReturn = (tryF, catchReturn) => {
  try {
    return tryF();
  } catch {
    return catchReturn;
  }
};
var tryCatch = async (action, then1, then2) => {
  try {
    return await action();
  } catch (error) {
    then1?.(error);
  }
};
var arrayHas = (array, value) => array.includes(value);
var arrayIndexOf = (array, value) => array.indexOf(value);
var arrayEvery2 = (array, cb) => array.every(cb);
var arrayIsEqual2 = (array1, array2) => size2(array1) === size2(array2) && arrayEvery2(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual2 = (value1, value2) => isArray2(value1) && isArray2(value2) ? arrayIsEqual2(value1, value2) : value1 === value2;
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
    ([index, value1]) => isObject2(value1) ? (
      /* istanbul ignore next */
      isObject2(obj2[index]) ? objIsEqual2(obj2[index], value1, isEqual3) : false
    ) : isEqual3(value1, obj2[index])
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
var jsonParseWithUndefined = (str) => (
  // JSON.parse reviver removes properties with undefined values
  replaceUndefinedString(jsonParse(str))
);
var replaceUndefinedString = (obj) => obj === UNDEFINED ? void 0 : isArray2(obj) ? arrayMap2(obj, replaceUndefinedString) : isObject2(obj) ? objMap(obj, replaceUndefinedString) : obj;
var UNIQUE_ID = "tinybaseInspector";
var TITLE = "TinyBase Inspector";
var POSITIONS = ["left", "top", "bottom", "right", "full"];
var STATE_TABLE = "state";
var SORT_CELL = "sort";
var OPEN_CELL = "open";
var EDITABLE_CELL = "editable";
var POSITION_VALUE = "position";
var OPEN_VALUE = OPEN_CELL;
var NO_PROVIDED_OBJECTS_MESSAGE = "There are no Stores or other objects to inspect. Make sure you placed the Inspector inside a Provider component.";
var INSPECTOR_ERROR_MESSAGE = "Inspector error: please see console for details.";
var getInitialPosition = (position) => {
  const index = arrayIndexOf(POSITIONS, position);
  return index == -1 ? 1 : index;
};
var getUniqueId = (...args) => jsonStringWithMap(args);
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
var sortedIdsMap = (ids, callback) => arrayMap2(arraySort([...ids]), callback);
var requestInspectorIdleCallback = (callback) => globalThis.requestIdleCallback?.(callback) ?? setTimeout(
  () => callback({
    didTimeout: false,
    timeRemaining: () => 0
  }),
  0
);
var cancelInspectorIdleCallback = (id2) => globalThis.cancelIdleCallback?.(id2) ?? clearTimeout(id2);
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
var RADIUS = "radius";
var BORDER_RADIUS = BORDER + "-" + RADIUS;
var PADDING = "padding";
var MARGIN = "margin";
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
var WHITE_SPACE = "white-space";
var TEXT_OVERFLOW = "text-overflow";
var ALIGN_ITEMS = "align-items";
var BACKDROP_FILTER = "backdrop-filter";
var MARGIN_RIGHT = MARGIN + "-" + RIGHT;
var Z_INDEX = "z-index";
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
        [Z_INDEX]: 999999,
        "font-family": "inter,sans-serif",
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
        [Z_INDEX]: 1,
        [BORDER + "-" + BOTTOM]: cssVar(BORDER),
        [ALIGN_ITEMS]: "center",
        [BACKDROP_FILTER]: "blur(4px)"
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
        [WHITE_SPACE]: NOWRAP,
        [TEXT_OVERFLOW]: "ellipsis"
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
        [ALIGN_ITEMS]: "center",
        [BACKDROP_FILTER]: "blur(4px)"
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
        [BORDER + "-" + BOTTOM + "-" + LEFT + "-" + RADIUS]: 0,
        [BORDER + "-" + BOTTOM + "-" + RIGHT + "-" + RADIUS]: 0,
        [MARGIN + "-" + BOTTOM]: 0
      },
      "details[open]>summary>span::before": DOWN_SVG,
      "details>summary img": { [DISPLAY]: NONE },
      "details[open]>summary img": {
        [DISPLAY]: UNSET,
        [MARGIN + "-" + LEFT]: rem(0.25)
      },
      "details>div": { [OVERFLOW]: AUTO },
      [`caption,#${UNIQUE_ID} p`]: {
        [COLOR]: cssVar("fg2"),
        [PADDING]: rem(0.25, 0.5),
        [TEXT_ALIGN]: LEFT,
        [MARGIN]: 0,
        [WHITE_SPACE]: NOWRAP
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
        [TEXT_OVERFLOW]: "ellipsis",
        [WHITE_SPACE]: NOWRAP,
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
      "img.add": ADD_SVG,
      "img.clone": CLONE_SVG,
      "img.delete": DELETE_SVG,
      "img.done": DONE_SVG,
      "img.edit": EDIT_SVG,
      "img.ok": OK_SVG,
      "img.okDis": OK_SVG_DISABLED,
      "img.cancel": CANCEL_SVG,
      "span.warn": { [MARGIN]: rem(2, 0.25), [COLOR]: "#d81b60" }
    },
    (css, selector) => `#${UNIQUE_ID} ${selector}{${arrayJoin(
      objToArray(css, (value, property) => `${property}:${value};`)
    )}}`
  )
);
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
var map = Map;
var mapNew = (entries) => new map(entries);
var mapKeys = (map2) => [...map2?.keys() ?? []];
var mapGet = (map2, key) => map2?.get(key);
var mapForEach = (map2, cb) => collForEach(map2, (value, key) => cb(key, value));
var mapMap = (coll, cb) => arrayMap2([...coll?.entries() ?? []], ([key, value]) => cb(value, key));
var mapSet = (map2, key, value) => isUndefined2(value) ? (collDel(map2, key), map2) : map2?.set(key, value);
var mapEnsure = (map2, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map2, key)) {
    mapSet(map2, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map2, key));
  }
  return mapGet(map2, key);
};
var mapMatch = (map2, obj, set, del = mapSet) => {
  objMap(obj, (value, id2) => set(map2, id2, value));
  mapForEach(map2, (id2) => objHas(obj, id2) ? 0 : del(map2, id2));
  return map2;
};
var mapToObj = (map2, valueMapper, excludeMapValue, excludeObjValue) => {
  const obj = {};
  collForEach(map2, (mapValue, id2) => {
    if (!excludeMapValue?.(mapValue, id2)) {
      const objValue = valueMapper ? valueMapper(mapValue, id2) : mapValue;
      if (!excludeObjValue?.(objValue)) {
        obj[id2] = objValue;
      }
    }
  });
  return obj;
};
var mapToObj2 = (map2, valueMapper, excludeMapValue) => mapToObj(
  map2,
  (childMap) => mapToObj(childMap, valueMapper, excludeMapValue),
  collIsEmpty,
  objIsEmpty
);
var mapToObj3 = (map2, valueMapper, excludeMapValue) => mapToObj(
  map2,
  (childMap) => mapToObj2(childMap, valueMapper, excludeMapValue),
  collIsEmpty,
  objIsEmpty
);
var mapClone = (map2, mapValue) => {
  const map22 = mapNew();
  collForEach(map2, (value, key) => map22.set(key, mapValue?.(value) ?? value));
  return map22;
};
var mapClone2 = (map2) => mapClone(map2, mapClone);
var mapClone3 = (map2) => mapClone(map2, mapClone2);
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
var getListenerFunctions = (getThing3) => {
  let thing;
  const [getId, releaseId] = getPoolFunctions();
  const allListeners = mapNew();
  const addListener = (listener, idSetNode, path, pathGetters = [], extraArgsGetter = () => []) => {
    thing ??= getThing3();
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
  store.__[1],
  () => store.__[2](!isSynchronizer),
  ([[changedTables], [changedValues]]) => !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
  store.setDefaultContent
] : persist != 2 ? [
  0,
  store._[7],
  store._[8],
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
  const saveAfterMutated = async () => {
    if (isAutoSaving() && store.__?.[0]?.()) {
      await save();
    }
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
            } else if (isUndefined2(content) && initialContent) {
              setDefaultContent(initialContent);
            } else if (!isUndefined2(content)) {
              errorNew(`Content is not an array: ${content}`);
            }
          },
          (error) => {
            if (initialContent) {
              setDefaultContent(initialContent);
            }
          }
        );
        setStatus(
          0
          /* Idle */
        );
        await saveAfterMutated();
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
              await saveAfterMutated();
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
  if (isArray2(cellOrValue)) {
    return ARRAY;
  }
  if (isObject2(cellOrValue)) {
    return OBJECT;
  }
  const type = getTypeOf2(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var isJsonType = (type) => type == OBJECT || type == ARRAY;
var encodeIfJson = (value) => isObject2(value) || isArray2(value) ? JSON_PREFIX + jsonString(value) : value;
var isEncodedJson = (value) => isString2(value) && value[0] == JSON_PREFIX;
var decodeIfJson = (raw, _id, encoded) => !encoded && isEncodedJson(raw) ? jsonParse(slice(raw, 1)) : raw;
var getTypeCase = (type, stringCase, numberCase, booleanCase, objectCase, arrayCase) => type == STRING2 ? stringCase : type == NUMBER ? numberCase : type == BOOLEAN ? booleanCase : type == OBJECT ? objectCase : type == ARRAY ? arrayCase : null;
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
var contentOrChangesIsEqual = ([tables1, values1], [tables2, values2]) => objIsEqual2(tables1, tables2) && objIsEqual2(values1, values2);
var createStore = () => {
  let hasTablesSchema;
  let hasValuesSchema;
  let hadTables = false;
  let hadValues = false;
  let transactions = 0;
  let middleware = [];
  let internalListeners = [];
  let mutating = 0;
  const changedTableIds = mapNew();
  const changedTableCellIds = mapNew();
  const changedRowCount = mapNew();
  const changedRowIds = mapNew();
  const changedCellIds = mapNew();
  const changedCells = mapNew();
  const defaultedCells = mapNew();
  const changedValueIds = mapNew();
  const changedValues = mapNew();
  const defaultedValues = setNew();
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
  const whileMutating = (action) => {
    const wasMutating = mutating;
    mutating = 1;
    const result = action();
    mutating = wasMutating;
    return result;
  };
  const ifTransformed = (snapshot, getResult, then, isEqual3 = Object.is) => ifNotUndefined2(
    getResult(),
    (result) => snapshot === result || isEqual3(snapshot, result) ? then(result) : whileMutating(() => then(result))
  );
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
    if (!isTypeStringOrBoolean(type) && type != NUMBER && !isJsonType(type)) {
      return false;
    }
    const defaultValue = schema[DEFAULT];
    if (isNull(defaultValue) && !schema[ALLOW_NULL]) {
      return false;
    }
    if (!isNull(defaultValue)) {
      if (getCellOrValueType(defaultValue) != type) {
        objDel(schema, DEFAULT);
      } else {
        schema[DEFAULT] = encodeIfJson(defaultValue);
      }
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
    (cellSchema) => isNull(cell) ? cellSchema[ALLOW_NULL] ? cell : cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT]) : getCellOrValueType(cell) === cellSchema[TYPE] ? encodeIfJson(cell) : isJsonType(cellSchema[TYPE]) && isEncodedJson(cell) ? cell : cellInvalid(
      tableId,
      rowId,
      cellId,
      cell,
      cellSchema[DEFAULT]
    ),
    () => cellInvalid(tableId, rowId, cellId, cell)
  ) : isUndefined2(getCellOrValueType(cell)) ? cellInvalid(tableId, rowId, cellId, cell) : encodeIfJson(cell);
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
    (valueSchema) => isNull(value) ? valueSchema[ALLOW_NULL] ? value : valueInvalid(valueId, value, valueSchema[DEFAULT]) : getCellOrValueType(value) === valueSchema[TYPE] ? encodeIfJson(value) : isJsonType(valueSchema[TYPE]) && isEncodedJson(value) ? value : valueInvalid(valueId, value, valueSchema[DEFAULT]),
    () => valueInvalid(valueId, value)
  ) : isUndefined2(getCellOrValueType(value)) ? valueInvalid(valueId, value) : encodeIfJson(value);
  const addDefaultsToRow = (row, tableId, rowId) => {
    ifNotUndefined2(
      mapGet(tablesSchemaRowCache, tableId),
      ([rowDefaulted, rowNonDefaulted]) => {
        collForEach(rowDefaulted, (cell, cellId) => {
          if (!objHas(row, cellId)) {
            row[cellId] = cell;
            ifNotUndefined2(
              rowId,
              (rowId2) => setAdd(
                mapEnsure(
                  mapEnsure(defaultedCells, tableId, mapNew),
                  rowId2,
                  setNew
                ),
                cellId
              )
            );
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
          setAdd(defaultedValues, valueId);
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
  const setOrDelCell = (tableId, rowId, cellId, cell, skipMiddleware, skipRowMiddleware) => isUndefined2(cell) ? delCell(tableId, rowId, cellId, true, skipMiddleware) : setCell(
    tableId,
    rowId,
    cellId,
    cell,
    skipMiddleware,
    skipRowMiddleware
  );
  const setOrDelValues = (values) => objIsEmpty(values) ? delValues() : setValues(values);
  const setOrDelValue = (valueId, value, skipMiddleware) => isUndefined2(value) ? delValue(valueId, skipMiddleware) : setValue(valueId, value, skipMiddleware);
  const setValidContent = (content) => ifTransformed(
    content,
    () => ifNotUndefined2(
      middleware[0],
      (willSetContent) => whileMutating(() => willSetContent(structuredClone(content))),
      () => content
    ),
    ([tables, values]) => {
      (objIsEmpty(tables) ? delTables : setTables)(tables);
      (objIsEmpty(values) ? delValues : setValues)(values);
    },
    contentOrChangesIsEqual
  );
  const setValidTables = (tables, forceDel) => ifTransformed(
    tables,
    () => forceDel ? tables : ifNotUndefined2(
      middleware[1],
      (willSetTables) => whileMutating(() => willSetTables(structuredClone(tables))),
      () => tables
    ),
    (validTables) => mapMatch(
      tablesMap,
      validTables,
      (_tables, tableId, table) => setValidTable(tableId, table),
      (_tables, tableId) => delValidTable(tableId)
    ),
    objIsEqual2
  );
  const setValidTable = (tableId, table, forceDel) => ifTransformed(
    table,
    () => forceDel ? table : ifNotUndefined2(
      middleware[2],
      (willSetTable) => whileMutating(
        () => willSetTable(tableId, structuredClone(table))
      ),
      () => table
    ),
    (validTable) => mapMatch(
      mapEnsure(tablesMap, tableId, () => {
        tableIdsChanged(tableId, 1);
        mapSet(tablePoolFunctions, tableId, getPoolFunctions());
        mapSet(tableCellIds, tableId, mapNew());
        return mapNew();
      }),
      validTable,
      (tableMap, rowId, row) => setValidRow(tableId, tableMap, rowId, row),
      (tableMap, rowId) => delValidRow(tableId, tableMap, rowId)
    ),
    objIsEqual2
  );
  const setValidRow = (tableId, tableMap, rowId, row, forceDel) => ifTransformed(
    row,
    () => forceDel ? row : ifNotUndefined2(
      middleware[3],
      (willSetRow) => whileMutating(
        () => willSetRow(tableId, rowId, structuredClone(row))
      ),
      () => row
    ),
    (validRow) => mapMatch(
      mapEnsure(tableMap, rowId, () => {
        rowIdsChanged(tableId, rowId, 1);
        return mapNew();
      }),
      validRow,
      (rowMap, cellId, cell) => setValidCell(tableId, rowId, rowMap, cellId, cell),
      (rowMap, cellId) => delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel)
    ),
    objIsEqual2
  );
  const applyRowDirectly = (tableId, tableMap, rowId, row, skipMiddleware) => {
    mapMatch(
      mapEnsure(tableMap, rowId, () => {
        rowIdsChanged(tableId, rowId, 1);
        return mapNew();
      }),
      row,
      (rowMap, cellId, cell) => ifNotUndefined2(
        getValidatedCell(tableId, rowId, cellId, cell),
        (validCell) => setValidCell(
          tableId,
          rowId,
          rowMap,
          cellId,
          validCell,
          skipMiddleware
        )
      ),
      (rowMap, cellId) => delValidCell(tableId, tableMap, rowId, rowMap, cellId, true)
    );
  };
  const setValidCell = (tableId, rowId, rowMap, cellId, cell, skipMiddleware) => ifTransformed(
    cell,
    () => ifNotUndefined2(
      skipMiddleware ? void 0 : middleware[4],
      (willSetCell) => whileMutating(() => willSetCell(tableId, rowId, cellId, cell)),
      () => cell
    ),
    (cell2) => {
      if (!collHas(rowMap, cellId)) {
        cellIdsChanged(tableId, rowId, cellId, 1);
      }
      const oldCell = mapGet(rowMap, cellId);
      if (cell2 !== oldCell) {
        cellChanged(tableId, rowId, cellId, oldCell, cell2);
        mapSet(rowMap, cellId, cell2);
      }
    }
  );
  const setCellIntoNewRow = (tableId, tableMap, rowId, cellId, validCell, skipMiddleware) => ifNotUndefined2(
    mapGet(tableMap, rowId),
    (rowMap) => setValidCell(tableId, rowId, rowMap, cellId, validCell, skipMiddleware),
    () => {
      const rowMap = mapNew();
      mapSet(tableMap, rowId, rowMap);
      rowIdsChanged(tableId, rowId, 1);
      objMap(
        addDefaultsToRow({ [cellId]: validCell }, tableId, rowId),
        (cell, cellId2) => setValidCell(tableId, rowId, rowMap, cellId2, cell, skipMiddleware)
      );
    }
  );
  const setValidValues = (values, forceDel) => ifTransformed(
    values,
    () => forceDel ? values : ifNotUndefined2(
      middleware[5],
      (willSetValues) => whileMutating(() => willSetValues(structuredClone(values))),
      () => values
    ),
    (validValues) => mapMatch(
      valuesMap,
      validValues,
      (_valuesMap, valueId, value) => setValidValue(valueId, value),
      (_valuesMap, valueId) => delValidValue(valueId)
    ),
    objIsEqual2
  );
  const setValidValue = (valueId, value, skipMiddleware) => ifTransformed(
    value,
    () => ifNotUndefined2(
      skipMiddleware ? void 0 : middleware[6],
      (willSetValue) => whileMutating(() => willSetValue(valueId, value)),
      () => value
    ),
    (value2) => {
      if (!collHas(valuesMap, valueId)) {
        valueIdsChanged(valueId, 1);
      }
      const oldValue = mapGet(valuesMap, valueId);
      if (value2 !== oldValue) {
        valueChanged(valueId, oldValue, value2);
        mapSet(valuesMap, valueId, value2);
      }
    }
  );
  const getNewRowId = (tableId, reuse) => {
    const [getId] = mapGet(tablePoolFunctions, tableId);
    let rowId;
    do {
      rowId = getId(reuse);
    } while (collHas(mapGet(tablesMap, tableId), rowId));
    return rowId;
  };
  const getOrCreateTable = (tableId) => mapEnsure(tablesMap, tableId, () => {
    tableIdsChanged(tableId, 1);
    mapSet(tablePoolFunctions, tableId, getPoolFunctions());
    mapSet(tableCellIds, tableId, mapNew());
    return mapNew();
  });
  const delValidTable = (tableId) => {
    if (whileMutating(() => middleware[8]?.(tableId)) ?? true) {
      return setValidTable(tableId, {}, true);
    }
    return mapGet(tablesMap, tableId);
  };
  const delValidRow = (tableId, tableMap, rowId) => {
    if (whileMutating(() => middleware[9]?.(tableId, rowId)) ?? true) {
      const [, releaseId] = mapGet(tablePoolFunctions, tableId);
      releaseId(rowId);
      setValidRow(tableId, tableMap, rowId, {}, true);
    }
  };
  const delValidCell = (tableId, table, rowId, row, cellId, forceDel, skipMiddleware) => {
    const defaultCell = mapGet(
      mapGet(tablesSchemaRowCache, tableId)?.[0],
      cellId
    );
    if (!isUndefined2(defaultCell) && !forceDel) {
      return setValidCell(tableId, rowId, row, cellId, defaultCell);
    }
    if (skipMiddleware || (whileMutating(() => middleware[10]?.(tableId, rowId, cellId)) ?? true)) {
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
    }
  };
  const delValidValue = (valueId, skipMiddleware) => {
    const defaultValue = mapGet(valuesDefaulted, valueId);
    if (!isUndefined2(defaultValue)) {
      return setValidValue(valueId, defaultValue);
    }
    if (skipMiddleware || (whileMutating(() => middleware[12]?.(valueId)) ?? true)) {
      valueChanged(valueId, mapGet(valuesMap, valueId));
      valueIdsChanged(valueId, -1);
      mapSet(valuesMap, valueId);
    }
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
    const defaulted = collHas(mapGet(mapGet(defaultedCells, tableId), rowId), cellId) && isUndefined2(oldCell) ? 1 : 0;
    mapEnsure(
      mapEnsure(mapEnsure(changedCells, tableId, mapNew), rowId, mapNew),
      cellId,
      () => [oldCell, 0]
    )[1] = newCell;
    internalListeners[3]?.(
      tableId,
      rowId,
      cellId,
      newCell,
      mutating,
      defaulted
    );
    collDel(mapGet(mapGet(defaultedCells, tableId), rowId), cellId);
  };
  const valueIdsChanged = (valueId, addedOrRemoved) => idsChanged(changedValueIds, valueId, addedOrRemoved);
  const valueChanged = (valueId, oldValue, newValue) => {
    const defaulted = collHas(defaultedValues, valueId) && isUndefined2(oldValue) ? 1 : 0;
    mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
    internalListeners[4]?.(valueId, newValue, mutating, defaulted);
    collDel(defaultedValues, valueId);
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
    ([oldCell, newCell]) => [
      true,
      decodeIfJson(oldCell),
      decodeIfJson(newCell)
    ],
    () => [false, ...pairNew(getCell(tableId, rowId, cellId))]
  );
  const getValueChange = (valueId) => ifNotUndefined2(
    mapGet(changedValues, valueId),
    ([oldValue, newValue]) => [
      true,
      decodeIfJson(oldValue),
      decodeIfJson(newValue)
    ],
    () => [false, ...pairNew(getValue3(valueId))]
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
  const clonedChangedCells = (changedCells2) => mapClone(
    changedCells2,
    (map2) => mapClone(map2, (map22) => mapClone(map22, pairClone))
  );
  const callTabularListenersForChanges = (mutator) => {
    const hasHasTablesListeners = !collIsEmpty(hasTablesListeners[mutator]);
    const hasSortedRowIdListeners = !collIsEmpty(
      sortedRowIdsListeners[mutator]
    );
    const hasIdOrHasListeners = !(collIsEmpty(cellIdsListeners[mutator]) && collIsEmpty(hasCellListeners[mutator]) && collIsEmpty(rowIdsListeners[mutator]) && collIsEmpty(hasRowListeners[mutator]) && collIsEmpty(tableCellIdsListeners[mutator]) && collIsEmpty(hasTableCellListeners[mutator]) && collIsEmpty(rowCountListeners[mutator]) && !hasSortedRowIdListeners && collIsEmpty(tableIdsListeners[mutator]) && collIsEmpty(hasTableListeners[mutator]));
    const hasOtherListeners = !(collIsEmpty(cellListeners[mutator]) && collIsEmpty(rowListeners[mutator]) && collIsEmpty(tableListeners[mutator]) && collIsEmpty(tablesListeners[mutator]));
    if (hasHasTablesListeners || hasIdOrHasListeners || hasOtherListeners) {
      const changes = mutator ? [
        mapClone(changedTableIds),
        mapClone2(changedTableCellIds),
        mapClone(changedRowCount),
        mapClone2(changedRowIds),
        mapClone3(changedCellIds),
        clonedChangedCells(changedCells)
      ] : [
        changedTableIds,
        changedTableCellIds,
        changedRowCount,
        changedRowIds,
        changedCellIds,
        changedCells
      ];
      if (hasHasTablesListeners) {
        const hasTablesNow = hasTables();
        if (hasTablesNow != hadTables) {
          callListeners(hasTablesListeners[mutator], void 0, hasTablesNow);
        }
      }
      if (hasIdOrHasListeners) {
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
          ) && hasSortedRowIdListeners) {
            callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
            setAdd(calledSortableTableIds, tableId);
          }
        });
        if (hasSortedRowIdListeners) {
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
      if (hasOtherListeners) {
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
                  decodeIfJson(newCell),
                  decodeIfJson(oldCell),
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
    const hasHasValuesListeners = !collIsEmpty(hasValuesListeners[mutator]);
    const hasIdOrHasListeners = !collIsEmpty(valueIdsListeners[mutator]) || !collIsEmpty(hasValueListeners[mutator]);
    const hasOtherListeners = !collIsEmpty(valueListeners[mutator]) || !collIsEmpty(valuesListeners[mutator]);
    if (hasHasValuesListeners || hasIdOrHasListeners || hasOtherListeners) {
      const changes = mutator ? [mapClone(changedValueIds), mapClone(changedValues, pairClone)] : [changedValueIds, changedValues];
      if (hasHasValuesListeners) {
        const hasValuesNow = hasValues();
        if (hasValuesNow != hadValues) {
          callListeners(hasValuesListeners[mutator], void 0, hasValuesNow);
        }
      }
      if (hasIdOrHasListeners) {
        callIdsAndHasListenersIfChanged(
          changes[0],
          valueIdsListeners[mutator],
          hasValueListeners[mutator]
        );
      }
      if (hasOtherListeners) {
        let valuesChanged;
        collForEach(changes[1], ([oldValue, newValue], valueId) => {
          if (newValue !== oldValue) {
            callListeners(
              valueListeners[mutator],
              [valueId],
              decodeIfJson(newValue),
              decodeIfJson(oldValue),
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
    const [descending, offset, limit, sorter] = otherArgs;
    let sortedRowIds = getSortedRowIds(
      tableId,
      cellId,
      descending,
      offset,
      limit,
      sorter
    );
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds(
          tableId,
          cellId,
          descending,
          offset,
          limit,
          sorter
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
  const getTransactionChangesImpl = (encoded = false) => [
    mapToObj(
      changedCells,
      (table, tableId) => mapGet(changedTableIds, tableId) === -1 ? void 0 : mapToObj(
        table,
        (row, rowId) => mapGet(mapGet(changedRowIds, tableId), rowId) === -1 ? void 0 : mapToObj(
          row,
          ([, newCell]) => decodeIfJson(newCell, EMPTY_STRING2, encoded),
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
      ([, newValue]) => decodeIfJson(newValue, EMPTY_STRING2, encoded),
      (changedValue) => pairIsEqual(changedValue)
    ),
    1
  ];
  const getContent = () => [getTables(), getValues()];
  const getEncodedContent = () => [mapToObj3(tablesMap), mapToObj(valuesMap)];
  const getTables = () => mapToObj3(tablesMap, decodeIfJson);
  const getTableIds = () => mapKeys(tablesMap);
  const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)), decodeIfJson);
  const getTableCellIds = (tableId) => mapKeys(mapGet(tableCellIds, id(tableId)));
  const getRowCount = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
  const getRowIds = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
  const getSortedRowIds = (tableIdOrArgs, cellId, descending, offset = 0, limit, sorter = defaultSorter) => isObject2(tableIdOrArgs) ? getSortedRowIds(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending,
    tableIdOrArgs.offset,
    tableIdOrArgs.limit,
    tableIdOrArgs.sorter
  ) : arrayMap2(
    slice(
      arraySort(
        mapMap(mapGet(tablesMap, id(tableIdOrArgs)), (row, rowId) => [
          isUndefined2(cellId) ? rowId : decodeIfJson(mapGet(row, id(cellId))),
          rowId
        ]),
        ([cell1], [cell2]) => sorter(cell1, cell2) * (descending ? -1 : 1)
      ),
      offset,
      isUndefined2(limit) ? limit : offset + limit
    ),
    ([, rowId]) => rowId
  );
  const getRow = (tableId, rowId) => mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), decodeIfJson);
  const getCellIds = (tableId, rowId) => mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCell = (tableId, rowId, cellId) => decodeIfJson(
    mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId))
  );
  const getValues = () => mapToObj(valuesMap, decodeIfJson);
  const getValueIds = () => mapKeys(valuesMap);
  const getValue3 = (valueId) => decodeIfJson(mapGet(valuesMap, id(valueId)));
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
          (cell, cellId) => setCellIntoNewRow(tableId2, table, rowId2, cellId, cell)
        );
      }
    },
    tableId,
    rowId
  );
  const setCell = (tableId, rowId, cellId, cell, skipMiddleware, skipRowMiddleware) => fluentTransaction(
    (tableId2, rowId2, cellId2) => ifNotUndefined2(
      getValidatedCell(
        tableId2,
        rowId2,
        cellId2,
        isFunction2(cell) ? cell(getCell(tableId2, rowId2, cellId2)) : cell
      ),
      (validCell) => {
        const tableMap = getOrCreateTable(tableId2);
        ifNotUndefined2(
          skipMiddleware || skipRowMiddleware || !middleware[14]?.() ? void 0 : middleware[3],
          (willSetRow) => {
            const existingRowMap = mapGet(tableMap, rowId2);
            const prospectiveRow = {
              ...existingRowMap ? mapToObj(existingRowMap) : {},
              [cellId2]: validCell
            };
            ifNotUndefined2(
              whileMutating(
                () => willSetRow(
                  tableId2,
                  rowId2,
                  structuredClone(prospectiveRow)
                )
              ),
              (row) => applyRowDirectly(
                tableId2,
                tableMap,
                rowId2,
                row,
                skipMiddleware
              )
            );
          },
          () => setCellIntoNewRow(
            tableId2,
            tableMap,
            rowId2,
            cellId2,
            validCell,
            skipMiddleware
          )
        );
      }
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
  const setValue = (valueId, value, skipMiddleware) => fluentTransaction(
    (valueId2) => ifNotUndefined2(
      getValidatedValue(
        valueId2,
        isFunction2(value) ? value(getValue3(valueId2)) : value
      ),
      (validValue) => setValidValue(valueId2, validValue, skipMiddleware)
    ),
    valueId
  );
  const applyChanges = (changes) => fluentTransaction(
    () => ifTransformed(
      changes,
      () => ifNotUndefined2(
        middleware[13],
        (willApplyChanges) => whileMutating(() => willApplyChanges(structuredClone(changes))),
        () => changes
      ),
      (changes2) => {
        objMap(
          changes2[0],
          (table, tableId) => isUndefined2(table) ? delTable(tableId) : objMap(
            table,
            (row, rowId) => isUndefined2(row) ? delRow(tableId, rowId) : objMap(
              row,
              (cell, cellId) => setOrDelCell(
                tableId,
                rowId,
                cellId,
                cell,
                void 0,
                true
              )
            )
          )
        );
        objMap(
          changes2[1],
          (value, valueId) => setOrDelValue(valueId, value)
        );
      },
      contentOrChangesIsEqual
    )
  );
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
  const delTables = () => fluentTransaction(
    () => whileMutating(() => middleware[7]?.()) ?? true ? setValidTables({}, true) : 0
  );
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
  const delCell = (tableId, rowId, cellId, forceDel, skipMiddleware) => fluentTransaction(
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
          forceDel,
          skipMiddleware
        ) : 0
      )
    ),
    tableId,
    rowId,
    cellId
  );
  const delValues = () => fluentTransaction(
    () => whileMutating(() => middleware[11]?.()) ?? true ? setValidValues({}, true) : 0
  );
  const delValue = (valueId, skipMiddleware) => fluentTransaction(
    (valueId2) => collHas(valuesMap, valueId2) ? delValidValue(valueId2, skipMiddleware) : 0,
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
  const getTransactionChanges = () => getTransactionChangesImpl();
  const getEncodedTransactionChanges = () => getTransactionChangesImpl(true);
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
        whileMutating(() => {
          callInvalidCellListeners(1);
          if (!collIsEmpty(changedCells)) {
            callTabularListenersForChanges(1);
          }
          callInvalidValueListeners(1);
          if (!collIsEmpty(changedValues)) {
            callValuesListenersForChanges(1);
          }
        });
        if (doRollback?.(store)) {
          collForEach(
            changedCells,
            (table, tableId) => collForEach(
              table,
              (row, rowId) => collForEach(
                row,
                ([oldCell], cellId) => setOrDelCell(tableId, rowId, cellId, oldCell, true)
              )
            )
          );
          collClear(changedCells);
          collForEach(
            changedValues,
            ([oldValue], valueId) => setOrDelValue(valueId, oldValue, true)
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
            defaultedCells,
            invalidCells,
            changedValueIds,
            changedValues,
            defaultedValues,
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
          (cellCallback) => mapForEach(
            rowMap,
            (cellId, cell) => cellCallback(cellId, decodeIfJson(cell))
          )
        )
      )
    )
  );
  const forEachTableCell = (tableId, tableCellCallback) => mapForEach(mapGet(tableCellIds, id(tableId)), tableCellCallback);
  const forEachRow = (tableId, rowCallback) => collForEach(
    mapGet(tablesMap, id(tableId)),
    (rowMap, rowId) => rowCallback(
      rowId,
      (cellCallback) => mapForEach(
        rowMap,
        (cellId, cell) => cellCallback(cellId, decodeIfJson(cell))
      )
    )
  );
  const forEachCell = (tableId, rowId, cellCallback) => mapForEach(
    mapGet(mapGet(tablesMap, id(tableId)), id(rowId)),
    (cellId, cell) => cellCallback(cellId, decodeIfJson(cell))
  );
  const forEachValue = (valueCallback) => mapForEach(
    valuesMap,
    (valueId, value) => valueCallback(valueId, decodeIfJson(value))
  );
  const addSortedRowIdsListener = (tableIdOrArgs, cellIdOrListener, descendingOrMutator, offset, limit, listener, mutator) => isObject2(tableIdOrArgs) ? addSortedRowIdsListenerImpl(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    [
      tableIdOrArgs.descending ?? false,
      tableIdOrArgs.offset ?? 0,
      tableIdOrArgs.limit,
      tableIdOrArgs.sorter
    ],
    cellIdOrListener,
    descendingOrMutator
  ) : addSortedRowIdsListenerImpl(
    tableIdOrArgs,
    cellIdOrListener,
    [descendingOrMutator, offset, limit, void 0],
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
  const setMiddleware = (willSetContent, willSetTables, willSetTable, willSetRow, willSetCell, willSetValues, willSetValue, willDelTables, willDelTable, willDelRow, willDelCell, willDelValues, willDelValue, willApplyChanges, hasWillSetRowCallbacks) => middleware = [
    willSetContent,
    willSetTables,
    willSetTable,
    willSetRow,
    willSetCell,
    willSetValues,
    willSetValue,
    willDelTables,
    willDelTable,
    willDelRow,
    willDelCell,
    willDelValues,
    willDelValue,
    willApplyChanges,
    hasWillSetRowCallbacks
  ];
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
    getValue: getValue3,
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
    _: [
      createStore,
      addListener,
      callListeners,
      setInternalListeners,
      setMiddleware,
      setOrDelCell,
      setOrDelValue,
      getEncodedContent,
      getEncodedTransactionChanges
    ]
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
        (ids) => pairNew(getValue3(ids[0]))
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
var getValue2 = (value) => isFunction2(value) ? value() : value;
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
var TINYBASE_CONTEXT2 = TINYBASE2 + "_uisc";
var EMPTY_CONTEXT = () => [];
var EMPTY_CONTEXT_VALUE2 = { value: EMPTY_CONTEXT };
var GLOBAL_CONTEXT2 = GLOBAL2;
var Context2 = GLOBAL_CONTEXT2[TINYBASE_CONTEXT2] ? (
  /* istanbul ignore next */
  GLOBAL_CONTEXT2[TINYBASE_CONTEXT2]
) : GLOBAL_CONTEXT2[TINYBASE_CONTEXT2] = createContext2(EMPTY_CONTEXT_VALUE2);
var useThing2 = (id2, offset) => {
  const contextValue = useContext2(Context2)?.value ?? EMPTY_CONTEXT;
  return () => {
    const resolvedContextValue = contextValue();
    const resolvedId = getValue2(id2);
    return isUndefined2(resolvedId) ? resolvedContextValue[offset * 2] : isString2(resolvedId) ? objGet2(resolvedContextValue[offset * 2 + 1], resolvedId) : resolvedId;
  };
};
var useThingOrThingById2 = (thingOrThingId, offset) => {
  const thing = useThing2(thingOrThingId, offset);
  return () => {
    const resolvedThingOrThingId = getValue2(thingOrThingId);
    return isUndefined2(resolvedThingOrThingId) || isString2(resolvedThingOrThingId) ? thing() : resolvedThingOrThingId;
  };
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
var getThing2 = (thing) => isFunction2(thing) ? thing() : thing;
var EMPTY_LISTENER_ARG_GETTERS2 = [];
var addAndDelListener2 = (thing, listenable, ...args) => {
  const listenerId = thing?.[ADD2 + listenable + LISTENER2]?.(...args);
  return () => thing?.delListener?.(listenerId);
};
var useListenable2 = (listenable, thing, returnType, listenerArgGetters = EMPTY_LISTENER_ARG_GETTERS2) => {
  const [result, setResult] = createSignal2(DEFAULTS2[returnType]);
  const getListenerArguments = () => arrayMap2(listenerArgGetters, getThing2);
  const getResult = () => getThing2(thing)?.[(returnType == 6 ? _HAS2 : GET2) + listenable]?.(...getListenerArguments()) ?? DEFAULTS2[returnType];
  const updateResult = () => {
    const nextResult = getResult();
    const prevResult = untrack2(result);
    setResult(
      () => !(IS_EQUALS2[returnType] ?? isEqual2)(nextResult, prevResult) ? nextResult : prevResult
    );
  };
  createRenderEffect2(() => {
    const resolvedThing = getThing2(thing);
    const listenerArguments = getListenerArguments();
    updateResult();
    const cleanup = addAndDelListener2(
      resolvedThing,
      (returnType == 6 ? HAS2 : EMPTY_STRING2) + listenable,
      ...listenerArguments,
      updateResult
    );
    onCleanup2(cleanup);
  });
  return result;
};
var useSetCallback2 = (storeOrQueries, settable, get, then = getUndefined2, methodPrefix, ...args) => (parameter) => ifNotUndefined2(
  getThing2(storeOrQueries),
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
);
var useStoreSetCallback2 = (storeOrStoreId, settable, get, then, ...args) => useSetCallback2(
  useStoreOrStoreById2(storeOrStoreId),
  settable,
  get,
  then,
  SET2,
  ...args
);
var argsOrGetArgs2 = (args, store, parameter) => arrayMap2(
  args,
  (arg) => isFunction2(arg) ? arg.length == 0 ? getThing2(arg) : arg(parameter, store) : arg
);
var useSortedRowIdsImpl = (tableId, cellId, descending, offset, limit, sorter, storeOrStoreId) => useListenable2(
  SORTED_ROW_IDS2,
  useStoreOrStoreById2(storeOrStoreId),
  1,
  isUndefined2(sorter) ? [tableId, cellId, descending, offset, limit] : [
    () => ({
      tableId: getThing2(tableId),
      cellId: getThing2(cellId),
      descending: getThing2(descending) ?? false,
      offset: getThing2(offset) ?? 0,
      limit: getThing2(limit),
      sorter: getThing2(sorter)
    })
  ]
);
var useStoreOrStoreById2 = (storeOrStoreId) => useThingOrThingById2(storeOrStoreId, OFFSET_STORE2);
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
var useSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending, offset, limit, sorter, storeOrStoreId) => isObject2(tableIdOrArgs) ? useSortedRowIdsImpl(
  tableIdOrArgs.tableId,
  tableIdOrArgs.cellId,
  tableIdOrArgs.descending ?? false,
  tableIdOrArgs.offset ?? 0,
  tableIdOrArgs.limit,
  () => tableIdOrArgs.sorter,
  cellIdOrStoreOrStoreId
) : useSortedRowIdsImpl(
  tableIdOrArgs,
  cellIdOrStoreOrStoreId,
  descending,
  offset,
  limit,
  isUndefined2(sorter) ? void 0 : () => sorter,
  storeOrStoreId
);
var useCell2 = (tableId, rowId, cellId, storeOrStoreId) => useListenable2(
  CELL2,
  useStoreOrStoreById2(storeOrStoreId),
  5,
  [tableId, rowId, cellId]
);
var useCellState = (tableId, rowId, cellId, storeOrStoreId) => [
  useCell2(tableId, rowId, cellId, storeOrStoreId),
  useSetCellCallback2(tableId, rowId, cellId, getArg, storeOrStoreId)
];
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
var useValueState = (valueId, storeOrStoreId) => [
  useValue2(valueId, storeOrStoreId),
  useSetValueCallback2(valueId, getArg, storeOrStoreId)
];
var useSetCellCallback2 = (tableId, rowId, cellId, getCell, storeOrStoreId, then) => useStoreSetCallback2(
  storeOrStoreId,
  CELL2,
  getCell,
  then,
  tableId,
  rowId,
  cellId
);
var useSetValueCallback2 = (valueId, getValue3, storeOrStoreId, then) => useStoreSetCallback2(storeOrStoreId, VALUE2, getValue3, then, valueId);
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
var getStoreCellComponentProps = (store, tableId) => ({
  store,
  tableId
});
var getQueriesCellComponentProps = (queries, queryId) => ({
  queries,
  queryId
});
var getCallbackOrUndefined = (callback, test2) => test2 ? callback : void 0;
var getParams = (...args) => args;
var useCells = (defaultCellIds, customCells, defaultCellComponent) => (
  // eslint-disable-next-line solid/reactivity
  createMemo2(() => {
    const customCellIds = getValue2(customCells);
    const cellIds = getValue2(customCellIds) ?? getValue2(defaultCellIds);
    const component = defaultCellComponent();
    return objMap(
      isArray2(cellIds) ? objNew(arrayMap2(cellIds, (cellId) => [cellId, cellId])) : cellIds,
      (labelOrCustomCell, cellId) => ({
        ...{
          label: cellId,
          component
        },
        ...isString2(labelOrCustomCell) ? {
          label: labelOrCustomCell
        } : labelOrCustomCell
      })
    );
  })
);
var _tmpl$$5 = /* @__PURE__ */ template(`<td>`);
var _tmpl$2$5 = /* @__PURE__ */ template(`<th>`);
var UP_ARROW = "\u2191";
var DOWN_ARROW = "\u2193";
var EDITABLE = "editable";
var extraRowCells = (extraRowCells2 = [], extraRowCellProps) => arrayMap2(getValue2(extraRowCells2) ?? [], (extraRowCell) => {
  const Component = extraRowCell.component;
  return (() => {
    var _el$ = _tmpl$$5();
    className(_el$, EXTRA);
    insert(_el$, createComponent2(Component, extraRowCellProps));
    return _el$;
  })();
});
var extraHeaders = (extraCells = []) => arrayMap2(
  getValue2(extraCells) ?? [],
  (extraCell) => (() => {
    var _el$2 = _tmpl$2$5();
    className(_el$2, EXTRA);
    insert(_el$2, () => extraCell.label);
    return _el$2;
  })()
);
var _tmpl$$4 = /* @__PURE__ */ template(`<th>`);
var _tmpl$2$4 = /* @__PURE__ */ template(`<table><tbody>`);
var _tmpl$3$3 = /* @__PURE__ */ template(`<caption>`);
var _tmpl$4$3 = /* @__PURE__ */ template(`<thead><tr>`);
var _tmpl$5$3 = /* @__PURE__ */ template(`<tr>`);
var _tmpl$6$3 = /* @__PURE__ */ template(`<td>`);
var _tmpl$7$1 = /* @__PURE__ */ template(`<input>`);
var _tmpl$8$1 = /* @__PURE__ */ template(`<input type=number>`);
var _tmpl$9$1 = /* @__PURE__ */ template(`<input type=checkbox>`);
var _tmpl$0$1 = /* @__PURE__ */ template(`<div>`);
var _tmpl$1$1 = /* @__PURE__ */ template(`<button>`);
var HtmlHeaderCell = (props) => {
  const sortDescending = props.sort[1];
  const cellId = props.cellId;
  return (() => {
    var _el$ = _tmpl$$4();
    addEventListener(
      _el$,
      "click",
      getCallbackOrUndefined(() => props.onClick?.(cellId), props.onClick)
    );
    insert(
      _el$,
      () => isUndefined2(sortDescending) || props.sort[0] != cellId ? null : (sortDescending ? DOWN_ARROW : UP_ARROW) + " ",
      null
    );
    insert(_el$, () => props.label ?? cellId ?? EMPTY_STRING2, null);
    effect(
      () => className(
        _el$,
        isUndefined2(sortDescending) || props.sort[0] != cellId ? void 0 : `sorted ${sortDescending ? "de" : "a"}scending`
      )
    );
    return _el$;
  })();
};
var HtmlTable = (props) => {
  const content = () => {
    const [
      cells,
      cellComponentProps,
      rowIds,
      extraCellsBefore,
      extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent
    ] = props.params;
    const sort = sortAndOffset == null ? [] : getValue2(sortAndOffset);
    const paginator = getValue2(paginatorComponent);
    return (() => {
      var _el$2 = _tmpl$2$4(), _el$3 = _el$2.firstChild;
      insert(
        _el$2,
        paginator ? (() => {
          var _el$4 = _tmpl$3$3();
          insert(_el$4, paginator);
          return _el$4;
        })() : null,
        _el$3
      );
      insert(
        _el$2,
        (() => {
          var _c$ = memo2(() => props.headerRow === false);
          return () => _c$() ? null : (() => {
            var _el$5 = _tmpl$4$3(), _el$6 = _el$5.firstChild;
            insert(_el$6, () => extraHeaders(extraCellsBefore), null);
            insert(
              _el$6,
              (() => {
                var _c$2 = memo2(() => props.idColumn === false);
                return () => _c$2() ? null : HtmlHeaderCell({
                  sort,
                  label: "Id",
                  onClick: handleSort
                });
              })(),
              null
            );
            insert(
              _el$6,
              () => objToArray(
                getValue2(cells),
                ({ label }, cellId) => HtmlHeaderCell({
                  cellId,
                  label,
                  sort,
                  onClick: handleSort
                })
              ),
              null
            );
            insert(_el$6, () => extraHeaders(extraCellsAfter), null);
            return _el$5;
          })();
        })(),
        _el$3
      );
      insert(
        _el$3,
        () => arrayMap2(getValue2(rowIds), (rowId) => {
          const rowProps = {
            ...cellComponentProps,
            rowId
          };
          return (() => {
            var _el$7 = _tmpl$5$3();
            insert(
              _el$7,
              () => extraRowCells(extraCellsBefore, rowProps),
              null
            );
            insert(
              _el$7,
              (() => {
                var _c$3 = memo2(() => !!isFalse(props.idColumn));
                return () => _c$3() ? null : (() => {
                  var _el$8 = _tmpl$$4();
                  setAttribute(_el$8, "title", rowId);
                  insert(_el$8, rowId);
                  return _el$8;
                })();
              })(),
              null
            );
            insert(
              _el$7,
              () => objToArray(
                getValue2(cells),
                ({ component: CellView2, getComponentProps }, cellId) => (() => {
                  var _el$9 = _tmpl$6$3();
                  insert(
                    _el$9,
                    createComponent2(
                      CellView2,
                      mergeProps2(
                        () => getProps2(getComponentProps, rowId, cellId),
                        rowProps,
                        {
                          cellId
                        }
                      )
                    )
                  );
                  return _el$9;
                })()
              ),
              null
            );
            insert(_el$7, () => extraRowCells(extraCellsAfter, rowProps), null);
            return _el$7;
          })();
        })
      );
      effect(() => className(_el$2, props.className));
      return _el$2;
    })();
  };
  return memo2(content);
};
var EditableThing = (props) => {
  const [thingType, setThingType] = createSignal2();
  const [currentThing, setCurrentThing] = createSignal2();
  const [stringThing, setStringThing] = createSignal2();
  const [numberThing, setNumberThing] = createSignal2();
  const [booleanThing, setBooleanThing] = createSignal2();
  const [objectThing, setObjectThing] = createSignal2("{}");
  const [arrayThing, setArrayThing] = createSignal2("[]");
  const [objectClassName, setObjectClassName] = createSignal2("");
  const [arrayClassName, setArrayClassName] = createSignal2("");
  createRenderEffect2(() => {
    const thing = props.thing;
    if (untrack2(currentThing) !== thing) {
      setThingType(getCellOrValueType(thing));
      setCurrentThing(() => thing);
      if (isObject2(thing)) {
        setObjectThing(jsonString(thing));
      } else if (isArray2(thing)) {
        setArrayThing(jsonString(thing));
      } else {
        setStringThing(string(thing));
        setNumberThing(number(thing) || 0);
        setBooleanThing(boolean(thing));
      }
    }
  });
  const handleThingChange = (thing, setTypedThing) => {
    setTypedThing(thing);
    setCurrentThing(() => thing);
    props.onThingChange(thing);
  };
  const handleJsonThingChange = (value, setTypedThing, isThing, setTypedClassName) => {
    setTypedThing(value);
    try {
      const object3 = jsonParse(value);
      if (isThing(object3)) {
        setCurrentThing(() => object3);
        props.onThingChange(object3);
        setTypedClassName("");
      }
    } catch {
      setTypedClassName("invalid");
    }
  };
  const handleTypeChange = () => {
    if (!props.hasSchema?.()) {
      const nextType = getTypeCase(
        thingType(),
        NUMBER,
        BOOLEAN,
        OBJECT,
        ARRAY,
        STRING2
      );
      const thing = getTypeCase(
        nextType,
        stringThing(),
        numberThing(),
        booleanThing(),
        tryReturn(() => jsonParse(objectThing()), {}),
        tryReturn(() => jsonParse(arrayThing()), [])
      );
      setThingType(nextType);
      setCurrentThing(() => thing);
      props.onThingChange(thing);
    }
  };
  const widget = () => getTypeCase(
    thingType(),
    (() => {
      var _el$0 = _tmpl$7$1();
      _el$0.addEventListener(
        "input",
        (event) => handleThingChange(
          string(event[CURRENT_TARGET][_VALUE]),
          setStringThing
        )
      );
      effect(() => _el$0.value = stringThing());
      return _el$0;
    })(),
    (() => {
      var _el$1 = _tmpl$8$1();
      _el$1.addEventListener(
        "input",
        (event) => handleThingChange(
          number(event[CURRENT_TARGET][_VALUE] || 0),
          setNumberThing
        )
      );
      effect(() => _el$1.value = numberThing());
      return _el$1;
    })(),
    (() => {
      var _el$10 = _tmpl$9$1();
      _el$10.addEventListener(
        "input",
        (event) => handleThingChange(
          boolean(event[CURRENT_TARGET].checked),
          setBooleanThing
        )
      );
      effect(() => _el$10.checked = booleanThing());
      return _el$10;
    })(),
    (() => {
      var _el$11 = _tmpl$7$1();
      _el$11.addEventListener(
        "input",
        (event) => handleJsonThingChange(
          event[CURRENT_TARGET][_VALUE],
          setObjectThing,
          isObject2,
          setObjectClassName
        )
      );
      effect(() => className(_el$11, objectClassName()));
      effect(() => _el$11.value = objectThing());
      return _el$11;
    })(),
    (() => {
      var _el$12 = _tmpl$7$1();
      _el$12.addEventListener(
        "input",
        (event) => handleJsonThingChange(
          event[CURRENT_TARGET][_VALUE],
          setArrayThing,
          isArray2,
          setArrayClassName
        )
      );
      effect(() => className(_el$12, arrayClassName()));
      effect(() => _el$12.value = arrayThing());
      return _el$12;
    })()
  );
  const content = () => {
    const currentWidget = widget();
    return (() => {
      var _el$13 = _tmpl$0$1();
      insert(
        _el$13,
        (() => {
          var _c$4 = memo2(() => !!(props.showType !== false && currentWidget));
          return () => _c$4() ? (() => {
            var _el$14 = _tmpl$1$1();
            _el$14.addEventListener("click", handleTypeChange);
            insert(_el$14, thingType);
            effect(
              (_p$) => {
                var _v$ = thingType(), _v$2 = thingType();
                _v$ !== _p$.e && setAttribute(_el$14, "title", _p$.e = _v$);
                _v$2 !== _p$.t && className(_el$14, _p$.t = _v$2);
                return _p$;
              },
              {
                e: void 0,
                t: void 0
              }
            );
            return _el$14;
          })() : null;
        })(),
        null
      );
      insert(_el$13, currentWidget, null);
      effect(() => className(_el$13, props.class));
      return _el$13;
    })();
  };
  return memo2(content);
};
var EditableCellView = (props) => {
  const [cell, setCell] = useCellState(
    () => props.tableId,
    () => props.rowId,
    () => props.cellId,
    () => props.store
  );
  const store = useStoreOrStoreById2(() => props.store);
  return EditableThing({
    get thing() {
      return cell();
    },
    onThingChange: setCell,
    class: props.className ?? EDITABLE + CELL2,
    showType: props.showType,
    hasSchema: () => !!store()?.hasTablesSchema()
  });
};
var EditableValueView = (props) => {
  const [value, setValue] = useValueState(
    () => props.valueId,
    () => props.store
  );
  const store = useStoreOrStoreById2(() => props.store);
  return EditableThing({
    get thing() {
      return value();
    },
    onThingChange: setValue,
    class: props.className ?? EDITABLE + VALUE2,
    showType: props.showType,
    hasSchema: () => !!store()?.hasValuesSchema()
  });
};
var _tmpl$$3 = /* @__PURE__ */ template(`<tr>`);
var _tmpl$2$3 = /* @__PURE__ */ template(`<th>`);
var _tmpl$3$2 = /* @__PURE__ */ template(`<td>`);
var _tmpl$4$2 = /* @__PURE__ */ template(`<table><tbody>`);
var _tmpl$5$2 = /* @__PURE__ */ template(`<thead><tr>`);
var _tmpl$6$2 = /* @__PURE__ */ template(`<th>.Id`);
var useDottedCellIds = (tableId, store) => {
  const cellIds = useTableCellIds2(
    () => getValue2(tableId),
    () => getValue2(store)
  );
  const dottedCellIds = createMemo2(
    () => arrayMap2(cellIds(), (cellId) => getValue2(tableId) + DOT + cellId)
  );
  return dottedCellIds;
};
var RelationshipInHtmlRow = (props) => {
  const [
    idColumn,
    cells,
    localTableId,
    remoteTableId,
    relationshipId,
    relationships,
    store,
    extraCellsBefore,
    extraCellsAfter
  ] = props.params;
  const remoteRowId = useRemoteRowId(
    () => relationshipId,
    () => props.localRowId,
    () => relationships
  );
  const rowProps = {
    tableId: localTableId ?? "",
    rowId: props.localRowId,
    store
  };
  return (() => {
    var _el$ = _tmpl$$3();
    insert(_el$, () => extraRowCells(extraCellsBefore, rowProps), null);
    insert(
      _el$,
      (() => {
        var _c$ = memo2(() => !!isFalse(idColumn));
        return () => _c$() ? null : [
          (() => {
            var _el$2 = _tmpl$2$3();
            insert(_el$2, () => props.localRowId);
            effect(() => setAttribute(_el$2, "title", props.localRowId));
            return _el$2;
          })(),
          (() => {
            var _el$3 = _tmpl$2$3();
            insert(_el$3, remoteRowId);
            effect(() => setAttribute(_el$3, "title", remoteRowId()));
            return _el$3;
          })()
        ];
      })(),
      null
    );
    insert(
      _el$,
      () => objToArray(
        getValue2(cells),
        ({ component: CellView2, getComponentProps }, compoundCellId) => {
          const [tableId, cellId] = strSplit(compoundCellId, DOT, 2);
          const rowId = tableId === localTableId ? props.localRowId : tableId === remoteTableId ? remoteRowId() : void 0;
          return isUndefined2(rowId) ? null : (() => {
            var _el$4 = _tmpl$3$2();
            insert(
              _el$4,
              createComponent2(
                CellView2,
                mergeProps2(
                  () => getProps2(getComponentProps, rowId, cellId),
                  {
                    store,
                    tableId,
                    rowId,
                    cellId
                  }
                )
              )
            );
            return _el$4;
          })();
        }
      ),
      null
    );
    insert(_el$, () => extraRowCells(extraCellsAfter, rowProps), null);
    return _el$;
  })();
};
var RelationshipInHtmlTable = (props) => {
  const resolvedRelationships = useRelationshipsOrRelationshipsById2(
    () => props.relationships
  );
  const details = createMemo2(
    () => getRelationshipsStoreTableIds(
      resolvedRelationships(),
      props.relationshipId
    )
  );
  const localCellIds = useDottedCellIds(
    () => details()[2],
    () => details()[1]
  );
  const remoteCellIds = useDottedCellIds(
    () => details()[3],
    () => details()[1]
  );
  const cellIds = createMemo2(() => [...localCellIds(), ...remoteCellIds()]);
  const cells = useCells(
    cellIds,
    () => props.customCells,
    () => props.editable ? EditableCellView : CellView
  );
  const rowIds = useRowIds(
    () => details()[2],
    () => details()[1]
  );
  const content = () => {
    const [relationships, store, localTableId, remoteTableId] = details();
    const params = getParams(
      props.idColumn ?? true,
      cells,
      localTableId,
      remoteTableId,
      props.relationshipId,
      relationships,
      store,
      props.extraCellsBefore,
      props.extraCellsAfter
    );
    return (() => {
      var _el$5 = _tmpl$4$2(), _el$6 = _el$5.firstChild;
      insert(
        _el$5,
        (() => {
          var _c$2 = memo2(() => !!isFalse(props.headerRow));
          return () => _c$2() ? null : (() => {
            var _el$7 = _tmpl$5$2(), _el$8 = _el$7.firstChild;
            insert(
              _el$8,
              () => extraHeaders(props.extraCellsBefore),
              null
            );
            insert(
              _el$8,
              (() => {
                var _c$3 = memo2(() => !!isFalse(props.idColumn));
                return () => _c$3() ? null : [
                  (() => {
                    var _el$9 = _tmpl$6$2(), _el$0 = _el$9.firstChild;
                    insert(_el$9, localTableId, _el$0);
                    return _el$9;
                  })(),
                  (() => {
                    var _el$1 = _tmpl$6$2(), _el$10 = _el$1.firstChild;
                    insert(_el$1, remoteTableId, _el$10);
                    return _el$1;
                  })()
                ];
              })(),
              null
            );
            insert(
              _el$8,
              () => objToArray(
                cells(),
                (cell) => (() => {
                  var _el$11 = _tmpl$2$3();
                  insert(_el$11, () => cell.label);
                  return _el$11;
                })()
              ),
              null
            );
            insert(
              _el$8,
              () => extraHeaders(props.extraCellsAfter),
              null
            );
            return _el$7;
          })();
        })(),
        _el$6
      );
      insert(
        _el$6,
        () => arrayMap2(
          rowIds(),
          (localRowId) => RelationshipInHtmlRow({
            localRowId,
            params
          })
        )
      );
      effect(() => className(_el$5, props.className));
      return _el$5;
    })();
  };
  return memo2(content);
};
var _tmpl$$2 = /* @__PURE__ */ template(`<button class=previous>\u2190`);
var _tmpl$2$2 = /* @__PURE__ */ template(`<button class=next>\u2192`);
var useSortingAndPagination = (cellId, descending, sortOnClick, offset, limit, total, paginator, onChange) => {
  const [sortAndOffset, setSortAndOffset] = createSignal2([
    getValue2(cellId),
    !!getValue2(descending),
    getValue2(offset) ?? 0
  ]);
  createEffect2(
    () => setSortAndOffset([
      getValue2(cellId),
      !!getValue2(descending),
      getValue2(offset) ?? 0
    ])
  );
  const setStateAndChange = (sortAndOffset2) => {
    setSortAndOffset(sortAndOffset2);
    getValue2(onChange)?.(sortAndOffset2);
  };
  const handleSort = (cellId2) => {
    if (getValue2(sortOnClick)) {
      const [currentCellId, currentDescending, currentOffset] = sortAndOffset();
      setStateAndChange([
        cellId2,
        cellId2 == currentCellId ? !currentDescending : false,
        currentOffset
      ]);
    }
  };
  const handleChangeOffset = (offset2) => {
    const [currentCellId, currentDescending] = sortAndOffset();
    setStateAndChange([currentCellId, currentDescending, offset2]);
  };
  const paginatorComponent = createMemo2(() => {
    const resolvedPaginator = getValue2(paginator);
    const [_, __, currentOffset] = sortAndOffset();
    const PaginatorComponent = isTrue(resolvedPaginator) ? SortedTablePaginator : resolvedPaginator;
    return isFalse(resolvedPaginator) ? null : createComponent2(PaginatorComponent, {
      offset: currentOffset,
      get limit() {
        return getValue2(limit);
      },
      get total() {
        return getValue2(total);
      },
      onChange: handleChangeOffset
    });
  });
  return [sortAndOffset, handleSort, paginatorComponent];
};
var SortedTablePaginator = (props) => {
  const content = () => {
    let offset = props.offset ?? 0;
    const limit = props.limit ?? props.total;
    if (offset > props.total || offset < 0) {
      offset = 0;
      props.onChange(0);
    }
    const singular = props.singular ?? "row";
    const plural = props.plural ?? singular + "s";
    return [
      memo2(
        () => memo2(() => props.total > limit)() && [
          (() => {
            var _el$ = _tmpl$$2();
            addEventListener(
              _el$,
              "click",
              getCallbackOrUndefined(
                () => props.onChange(offset - limit),
                offset > 0
              )
            );
            _el$.disabled = offset == 0;
            return _el$;
          })(),
          (() => {
            var _el$2 = _tmpl$2$2();
            addEventListener(
              _el$2,
              "click",
              getCallbackOrUndefined(
                () => props.onChange(offset + limit),
                offset + limit < props.total
              )
            );
            effect(() => _el$2.disabled = offset + limit >= props.total);
            return _el$2;
          })(),
          offset + 1,
          " to ",
          memo2(() => mathMin(props.total, offset + limit)),
          " of "
        ]
      ),
      memo2(() => props.total),
      " ",
      memo2(() => props.total != 1 ? plural : singular)
    ];
  };
  return memo2(content);
};
var ResultSortedTableInHtmlTable = (props) => {
  const [sortAndOffset, handleSort, paginatorComponent] = useSortingAndPagination(
    () => props.cellId,
    () => props.descending,
    () => props.sortOnClick,
    () => props.offset,
    () => props.limit,
    useResultRowCount(
      () => props.queryId,
      () => props.queries
    ),
    () => props.paginator ?? false,
    () => props.onChange
  );
  return HtmlTable({
    ...props,
    params: getParams(
      useCells(
        useResultTableCellIds(
          () => props.queryId,
          () => props.queries
        ),
        () => props.customCells,
        () => ResultCellView
      ),
      getQueriesCellComponentProps(props.queries, props.queryId),
      useResultSortedRowIds(
        () => props.queryId,
        () => sortAndOffset()[0],
        () => sortAndOffset()[1],
        () => sortAndOffset()[2],
        () => props.limit,
        () => props.queries
      ),
      props.extraCellsBefore,
      props.extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent
    )
  });
};
var SliceInHtmlTable = (props) => {
  const resolvedIndexes = useIndexesOrIndexesById2(() => props.indexes);
  const details = createMemo2(
    () => getIndexStoreTableId(resolvedIndexes(), props.indexId)
  );
  return HtmlTable({
    ...props,
    params: getParams(
      useCells(
        useTableCellIds2(
          () => details()[2],
          () => details()[1]
        ),
        props.customCells,
        () => props.editable ? EditableCellView : CellView
      ),
      getStoreCellComponentProps(details()[1], details()[2]),
      useSliceRowIds(
        () => props.indexId,
        () => props.sliceId,
        resolvedIndexes
      ),
      props.extraCellsBefore,
      props.extraCellsAfter
    )
  });
};
var SortedTableInHtmlTable = (props) => {
  const [sortAndOffset, handleSort, paginatorComponent] = useSortingAndPagination(
    () => props.cellId,
    () => props.descending,
    () => props.sortOnClick,
    () => props.offset,
    () => props.limit,
    useRowCount(
      () => props.tableId,
      () => props.store
    ),
    () => props.paginator ?? false,
    () => props.onChange
  );
  return HtmlTable({
    ...props,
    params: getParams(
      useCells(
        useTableCellIds2(
          () => props.tableId,
          () => props.store
        ),
        () => props.customCells,
        () => props.editable === true ? EditableCellView : CellView
      ),
      getStoreCellComponentProps(props.store, props.tableId),
      useSortedRowIds(
        () => props.tableId,
        () => sortAndOffset()[0],
        () => sortAndOffset()[1],
        () => sortAndOffset()[2],
        () => props.limit,
        void 0,
        () => props.store
      ),
      props.extraCellsBefore,
      props.extraCellsAfter,
      sortAndOffset,
      handleSort,
      paginatorComponent
    )
  });
};
var _tmpl$$1 = /* @__PURE__ */ template(`<td>`);
var _tmpl$2$1 = /* @__PURE__ */ template(`<table><tbody>`);
var _tmpl$3$1 = /* @__PURE__ */ template(`<thead><tr><th>`);
var _tmpl$4$1 = /* @__PURE__ */ template(`<th>Id`);
var _tmpl$5$1 = /* @__PURE__ */ template(`<tr><td>`);
var _tmpl$6$1 = /* @__PURE__ */ template(`<th>`);
var extraValueCells = (extraValueCells2 = [], extraValueCellProps) => arrayMap2(getValue2(extraValueCells2) ?? [], (extraValueCell) => {
  const Component = extraValueCell.component;
  return (() => {
    var _el$ = _tmpl$$1();
    className(_el$, EXTRA);
    insert(_el$, createComponent2(Component, extraValueCellProps));
    return _el$;
  })();
});
var ValuesInHtmlTable = (props) => {
  const valueIds = useValueIds2(() => props.store);
  return (() => {
    var _el$2 = _tmpl$2$1(), _el$3 = _el$2.firstChild;
    insert(
      _el$2,
      (() => {
        var _c$ = memo2(() => props.headerRow === false);
        return () => _c$() ? null : (() => {
          var _el$4 = _tmpl$3$1(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild;
          insert(
            _el$5,
            () => extraHeaders(props.extraCellsBefore),
            _el$6
          );
          insert(
            _el$5,
            (() => {
              var _c$2 = memo2(() => props.idColumn === false);
              return () => _c$2() ? null : _tmpl$4$1();
            })(),
            _el$6
          );
          insert(_el$6, VALUE2);
          insert(_el$5, () => extraHeaders(props.extraCellsAfter), null);
          return _el$4;
        })();
      })(),
      _el$3
    );
    insert(
      _el$3,
      () => arrayMap2(valueIds(), (valueId) => {
        const valueProps = {
          valueId,
          store: props.store
        };
        const Value = props.valueComponent ?? (getValue2(props.editable) === true ? EditableValueView : ValueView);
        return (() => {
          var _el$8 = _tmpl$5$1(), _el$9 = _el$8.firstChild;
          insert(
            _el$8,
            () => extraValueCells(props.extraCellsBefore, valueProps),
            _el$9
          );
          insert(
            _el$8,
            (() => {
              var _c$3 = memo2(() => !!isFalse(props.idColumn));
              return () => _c$3() ? null : (() => {
                var _el$0 = _tmpl$6$1();
                setAttribute(_el$0, "title", valueId);
                insert(_el$0, valueId);
                return _el$0;
              })();
            })(),
            _el$9
          );
          insert(
            _el$9,
            createComponent2(
              Value,
              mergeProps2(
                () => getProps2(props.getValueComponentProps, valueId),
                valueProps
              )
            )
          );
          insert(
            _el$8,
            () => extraValueCells(props.extraCellsAfter, valueProps),
            null
          );
          return _el$8;
        })();
      })
    );
    effect(() => className(_el$2, props.className));
    return _el$2;
  })();
};
var _tmpl$ = /* @__PURE__ */ template(
  `<details><summary><span></span></summary><div>`
);
var _tmpl$2 = /* @__PURE__ */ template(`<img>`);
var _tmpl$3 = /* @__PURE__ */ template(`<img title=Cancel class=cancel>`);
var _tmpl$4 = /* @__PURE__ */ template(`<input type=text autofocus>`);
var _tmpl$5 = /* @__PURE__ */ template(`<img title=Confirm class=ok>`);
var _tmpl$6 = /* @__PURE__ */ template(`<div class=actions><div></div><div>`);
var _tmpl$7 = /* @__PURE__ */ template(`<p>No values.`);
var _tmpl$8 = /* @__PURE__ */ template(`<p>No tables.`);
var _tmpl$9 = /* @__PURE__ */ template(`<tr><th></th><td></td><td>`);
var _tmpl$0 = /* @__PURE__ */ template(
  `<table><thead><tr><th>Metric Id</th><th>Table Id</th><th>Metric</th></tr></thead><tbody>`
);
var _tmpl$1 = /* @__PURE__ */ template(
  `<header><img class=flat><span></span><img class=flat title=Close>`
);
var _tmpl$10 = /* @__PURE__ */ template(`<span class=warn>`);
var _tmpl$11 = /* @__PURE__ */ template(`<article>`);
var _tmpl$12 = /* @__PURE__ */ template(`<main>`);
var _tmpl$13 = /* @__PURE__ */ template(`<style>`);
var _tmpl$14 = /* @__PURE__ */ template(`<aside>`);
var useEditable = (uniqueId, s) => {
  const storedEditable = useCell(STATE_TABLE, uniqueId, EDITABLE_CELL, s);
  const [editable, setEditable] = createSignal2(false);
  createEffect2(() => setEditable(!!storedEditable()));
  return [
    editable,
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextEditable = !editable();
      setEditable(nextEditable);
      s.setCell(STATE_TABLE, uniqueId, EDITABLE_CELL, nextEditable);
    }
  ];
};
var useHasTableCallback = (storeOrStoreId) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (tableId) => store()?.hasTable(tableId) ?? false;
};
var useHasRowCallback = (storeOrStoreId, tableId) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (rowId) => store()?.hasRow(tableId, rowId) ?? false;
};
var useHasValueCallback = (storeOrStoreId) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (valueId) => store()?.hasValue(valueId) ?? false;
};
var Details = (props) => {
  const open2 = useCell(STATE_TABLE, props.uniqueId, OPEN_CELL, props.s);
  const handleToggle = (event) => props.s.setCell(
    STATE_TABLE,
    props.uniqueId,
    OPEN_CELL,
    event.currentTarget.open
  );
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling;
    _el$.addEventListener("toggle", handleToggle);
    insert(_el$3, () => props.title);
    insert(
      _el$2,
      (() => {
        var _c$ = memo2(() => !!props.handleEditable);
        return () => _c$() ? (() => {
          var _el$5 = _tmpl$2();
          addEventListener(_el$5, "click", props.handleEditable);
          effect(
            (_p$) => {
              var _v$ = props.editable?.() ? "done" : "edit", _v$2 = props.editable?.() ? "Done editing" : "Edit";
              _v$ !== _p$.e && className(_el$5, _p$.e = _v$);
              _v$2 !== _p$.t && setAttribute(_el$5, "title", _p$.t = _v$2);
              return _p$;
            },
            {
              e: void 0,
              t: void 0
            }
          );
          return _el$5;
        })() : EMPTY_STRING2;
      })(),
      null
    );
    insert(_el$4, () => props.children);
    effect(() => _el$.open = !!open2());
    return _el$;
  })();
};
var ConfirmableActions = (props) => {
  const [confirming, setConfirming] = createSignal2();
  const handleDone = () => setConfirming(void 0);
  createEffect2(() => {
    if (!isUndefined2(confirming())) {
      const handleKeyDown = (event) => {
        if (!isUndefined2(confirming()) && event.key == "Escape") {
          event.preventDefault();
          handleDone();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      onCleanup2(() => document.removeEventListener("keydown", handleKeyDown));
    }
  });
  const content = () => {
    const confirmingIndex = confirming();
    const Component = isUndefined2(confirmingIndex) ? void 0 : props.actions[confirmingIndex][2];
    return memo2(
      () => Component ? [
        memo2(
          () => Component({
            ...props,
            onDone: handleDone
          })
        ),
        (() => {
          var _el$6 = _tmpl$3();
          _el$6.addEventListener("click", handleDone);
          return _el$6;
        })()
      ] : arrayMap2(
        props.actions,
        ([icon, title], index) => (() => {
          var _el$7 = _tmpl$2();
          _el$7.addEventListener("click", () => setConfirming(index));
          setAttribute(_el$7, "title", title);
          className(_el$7, icon);
          return _el$7;
        })()
      )
    );
  };
  return memo2(content);
};
var NewId = (props) => {
  const [newId, setNewId] = createSignal2(props.suggestedId);
  const [newIdOk, setNewIdOk] = createSignal2(true);
  const [previousSuggestedId, setPreviousSuggestedNewId] = createSignal2(
    props.suggestedId
  );
  const handleNewIdChange = (event) => {
    const id2 = event.currentTarget.value;
    setNewId(id2);
    setNewIdOk(!props.has(id2));
  };
  const handleClick = () => {
    const id2 = newId();
    if (props.has(id2)) {
      setNewIdOk(false);
    } else {
      props.set(id2);
      props.onDone();
    }
  };
  const handleKeyDown = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      handleClick();
    }
  };
  createEffect2(() => {
    if (props.suggestedId != previousSuggestedId()) {
      setNewId(props.suggestedId);
      setPreviousSuggestedNewId(props.suggestedId);
    }
  });
  return [
    memo2(() => (props.prompt ?? "New Id") + ": "),
    (() => {
      var _el$8 = _tmpl$4();
      _el$8.addEventListener("keydown", handleKeyDown);
      _el$8.addEventListener("input", handleNewIdChange);
      effect(() => _el$8.value = newId());
      return _el$8;
    })(),
    " ",
    (() => {
      var _el$9 = _tmpl$2();
      _el$9.addEventListener("click", handleClick);
      effect(
        (_p$) => {
          var _v$3 = newIdOk() ? "Confirm" : "Id already exists", _v$4 = newIdOk() ? "ok" : "okDis";
          _v$3 !== _p$.e && setAttribute(_el$9, "title", _p$.e = _v$3);
          _v$4 !== _p$.t && className(_el$9, _p$.t = _v$4);
          return _p$;
        },
        {
          e: void 0,
          t: void 0
        }
      );
      return _el$9;
    })()
  ];
};
var Delete = (props) => {
  const handleKeyDown = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      props.onClick();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  onCleanup2(() => document.removeEventListener("keydown", handleKeyDown));
  return [
    memo2(() => (props.prompt ?? "Delete") + "? "),
    (() => {
      var _el$0 = _tmpl$5();
      addEventListener(_el$0, "click", props.onClick);
      return _el$0;
    })()
  ];
};
var Actions = (props) => (() => {
  var _el$1 = _tmpl$6(), _el$10 = _el$1.firstChild, _el$11 = _el$10.nextSibling;
  insert(_el$10, () => props.left);
  insert(_el$11, () => props.right);
  return _el$1;
})();
var AddTable = (props) => {
  const has = useHasTableCallback(props.store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId("table", has),
    has,
    set: useSetTableCallback(
      (newId) => newId,
      () => ({
        row: {
          cell: ""
        }
      }),
      props.store
    ),
    prompt: "Add table"
  });
};
var DeleteTables = (props) => Delete({
  onClick: useDelTablesCallback(props.store, props.onDone),
  prompt: "Delete all tables"
});
var TablesActions = (props) => Actions({
  left: ConfirmableActions({
    actions: [["add", "Add table", AddTable]],
    store: props.store
  }),
  right: useHasTables(props.store)() ? ConfirmableActions({
    actions: [["delete", "Delete all tables", DeleteTables]],
    store: props.store
  }) : EMPTY_STRING2
});
var AddRow = (props) => {
  const has = useHasRowCallback(props.store, props.tableId);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId("row", has),
    has,
    set: useSetRowCallback(
      props.tableId,
      (newId) => newId,
      (_, store) => objNew(
        arrayMap2(store.getTableCellIds(props.tableId), (cellId) => [
          cellId,
          ""
        ])
      )
    ),
    prompt: "Add row"
  });
};
var CloneTable = (props) => {
  const store = useStoreOrStoreById(props.store)();
  const has = useHasTableCallback(store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId(props.tableId, has),
    has,
    set: useSetTableCallback(
      (tableId) => tableId,
      (_, store2) => store2.getTable(props.tableId),
      store
    ),
    prompt: "Clone table to"
  });
};
var DeleteTable = (props) => Delete({
  onClick: useDelTableCallback(props.tableId, props.store, props.onDone),
  prompt: "Delete table"
});
var TableActions1 = (props) => ConfirmableActions({
  actions: [["add", "Add row", AddRow]],
  store: props.store,
  tableId: props.tableId
});
var TableActions2 = (props) => ConfirmableActions({
  actions: [
    ["clone", "Clone table", CloneTable],
    ["delete", "Delete table", DeleteTable]
  ],
  store: props.store,
  tableId: props.tableId
});
var AddCell = (props) => {
  const store = useStoreOrStoreById(props.store)();
  const has = (cellId) => store?.hasCell(props.tableId, props.rowId, cellId) ?? false;
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId("cell", has),
    has,
    set: useSetCellCallback(
      props.tableId,
      props.rowId,
      (newId) => newId,
      () => "",
      store
    ),
    prompt: "Add cell"
  });
};
var CloneRow = (props) => {
  const store = useStoreOrStoreById(props.store)();
  const has = useHasRowCallback(store, props.tableId);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId(props.rowId, has),
    has,
    set: useSetRowCallback(
      props.tableId,
      (newId) => newId,
      (_, store2) => store2.getRow(props.tableId, props.rowId),
      store
    ),
    prompt: "Clone row to"
  });
};
var DeleteRow = (props) => Delete({
  onClick: useDelRowCallback(
    props.tableId,
    props.rowId,
    props.store,
    props.onDone
  ),
  prompt: "Delete row"
});
var RowActions = (props) => ConfirmableActions({
  actions: [
    ["add", "Add cell", AddCell],
    ["clone", "Clone row", CloneRow],
    ["delete", "Delete row", DeleteRow]
  ],
  store: props.store,
  tableId: props.tableId,
  rowId: props.rowId
});
var CellDelete = (props) => Delete({
  onClick: useDelCellCallback(
    props.tableId,
    props.rowId,
    props.cellId,
    true,
    props.store,
    props.onDone
  ),
  prompt: "Delete cell"
});
var CellActions = (props) => ConfirmableActions({
  actions: [["delete", "Delete cell", CellDelete]],
  store: props.store,
  tableId: props.tableId,
  rowId: props.rowId,
  cellId: props.cellId
});
var AddValue = (props) => {
  const has = useHasValueCallback(props.store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId("value", has),
    has,
    set: useSetValueCallback(
      (newId) => newId,
      () => "",
      props.store
    ),
    prompt: "Add value"
  });
};
var DeleteValues = (props) => Delete({
  onClick: useDelValuesCallback(props.store, props.onDone),
  prompt: "Delete all values"
});
var ValuesActions = (props) => Actions({
  left: ConfirmableActions({
    actions: [["add", "Add value", AddValue]],
    store: props.store
  }),
  right: useHasValues(props.store)() ? ConfirmableActions({
    actions: [["delete", "Delete all values", DeleteValues]],
    store: props.store
  }) : EMPTY_STRING2
});
var CloneValue = (props) => {
  const has = useHasValueCallback(props.store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId(props.valueId, has),
    has,
    set: useSetValueCallback(
      (newId) => newId,
      (_, store) => store.getValue(props.valueId) ?? "",
      props.store
    ),
    prompt: "Clone value to"
  });
};
var DeleteValue = (props) => Delete({
  onClick: useDelValueCallback(props.valueId, props.store, props.onDone),
  prompt: "Delete value"
});
var ValueActions = (props) => ConfirmableActions({
  actions: [
    ["clone", "Clone value", CloneValue],
    ["delete", "Delete value", DeleteValue]
  ],
  store: props.store,
  valueId: props.valueId
});
var valueActions = [
  {
    label: "",
    component: ValueActions
  }
];
var rowActions = [
  {
    label: "",
    component: RowActions
  }
];
var EditableCellViewWithActions = (props) => [
  createComponent2(EditableCellView, props),
  memo2(
    () => memo2(
      () => !!useHasCell(props.tableId, props.rowId, props.cellId, props.store)()
    )() ? createComponent2(CellActions, props) : EMPTY_STRING2
  )
];
var ValuesView = (props) => {
  const uniqueId = getUniqueId("v", props.storeId);
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  const valueIds = useValueIds(props.store);
  return Details({
    uniqueId,
    title: VALUES2,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return [
        memo2(
          () => memo2(() => !!arrayIsEmpty(valueIds()))() ? _tmpl$7() : createComponent2(ValuesInHtmlTable, {
            get store() {
              return props.store;
            },
            get editable() {
              return editable();
            },
            extraCellsAfter: () => editable() ? valueActions : []
          })
        ),
        memo2(
          () => memo2(() => !!editable())() ? createComponent2(ValuesActions, {
            get store() {
              return props.store;
            }
          }) : EMPTY_STRING2
        )
      ];
    }
  });
};
var TableView = (props) => {
  const uniqueId = getUniqueId("t", props.storeId, props.tableId);
  const sort = useCell(STATE_TABLE, uniqueId, SORT_CELL, props.s);
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    props.s
  );
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  const cellIds = useTableCellIds(props.tableId, props.store);
  return Details({
    uniqueId,
    title: TABLE2 + ": " + props.tableId,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      const [cellId, descending, offset] = jsonParse(sort() ?? "[]");
      return [
        createComponent2(SortedTableInHtmlTable, {
          get tableId() {
            return props.tableId;
          },
          get store() {
            return props.store;
          },
          cellId,
          descending,
          offset,
          limit: 10,
          paginator: true,
          sortOnClick: true,
          onChange: handleChange,
          get editable() {
            return editable();
          },
          extraCellsAfter: () => editable() ? rowActions : [],
          customCells: () => {
            const CellComponent = editable() ? EditableCellViewWithActions : CellView;
            return objNew(
              arrayMap2(cellIds(), (cellId2) => [
                cellId2,
                {
                  label: cellId2,
                  component: CellComponent
                }
              ])
            );
          }
        }),
        memo2(
          () => memo2(() => !!editable())() ? (() => {
            var _el$13 = _tmpl$6(), _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling;
            insert(
              _el$14,
              createComponent2(TableActions1, {
                get tableId() {
                  return props.tableId;
                },
                get store() {
                  return props.store;
                }
              })
            );
            insert(
              _el$15,
              createComponent2(TableActions2, {
                get tableId() {
                  return props.tableId;
                },
                get store() {
                  return props.store;
                }
              })
            );
            return _el$13;
          })() : EMPTY_STRING2
        )
      ];
    }
  });
};
var TablesView = (props) => {
  const uniqueId = getUniqueId("ts", props.storeId);
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  const tableIds = useTableIds(props.store);
  return Details({
    uniqueId,
    title: TABLES2,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return [
        memo2(
          () => memo2(() => !!arrayIsEmpty(tableIds()))() ? _tmpl$8() : sortedIdsMap(
            tableIds(),
            (tableId) => createComponent2(TableView, {
              get store() {
                return props.store;
              },
              get storeId() {
                return props.storeId;
              },
              tableId,
              get s() {
                return props.s;
              }
            })
          )
        ),
        memo2(
          () => memo2(() => !!editable())() ? createComponent2(TablesActions, {
            get store() {
              return props.store;
            }
          }) : EMPTY_STRING2
        )
      ];
    }
  });
};
var StoreView = (props) => {
  const store = useStore(props.storeId);
  return memo2(
    () => memo2(() => !!isUndefined2(store()))() ? EMPTY_STRING2 : createComponent2(Details, {
      get uniqueId() {
        return getUniqueId("s", props.storeId);
      },
      get title() {
        return (store().isMergeable() ? "Mergeable" : "") + "Store: " + (props.storeId ?? DEFAULT);
      },
      get s() {
        return props.s;
      },
      get children() {
        return [
          createComponent2(ValuesView, {
            get storeId() {
              return props.storeId;
            },
            get store() {
              return store();
            },
            get s() {
              return props.s;
            }
          }),
          createComponent2(TablesView, {
            get storeId() {
              return props.storeId;
            },
            get store() {
              return store();
            },
            get s() {
              return props.s;
            }
          })
        ];
      }
    })
  );
};
var MetricRow = (props) => (() => {
  var _el$17 = _tmpl$9(), _el$18 = _el$17.firstChild, _el$19 = _el$18.nextSibling, _el$20 = _el$19.nextSibling;
  insert(_el$18, () => props.metricId);
  insert(_el$19, () => props.metrics?.getTableId(props.metricId));
  insert(_el$20, () => useMetric(props.metricId, props.metrics)());
  effect(() => setAttribute(_el$18, "title", props.metricId));
  return _el$17;
})();
var MetricsView = (props) => {
  const metrics = useMetrics(props.metricsId);
  const metricIds = useMetricIds(metrics);
  return memo2(
    () => memo2(() => !!isUndefined2(metrics()))() ? EMPTY_STRING2 : createComponent2(Details, {
      get uniqueId() {
        return getUniqueId("m", props.metricsId);
      },
      get title() {
        return "Metrics: " + (props.metricsId ?? DEFAULT);
      },
      get s() {
        return props.s;
      },
      get children() {
        return memo2(() => !!arrayIsEmpty(metricIds()))() ? "No metrics defined" : (() => {
          var _el$21 = _tmpl$0(), _el$22 = _el$21.firstChild, _el$23 = _el$22.nextSibling;
          insert(
            _el$23,
            () => arrayMap2(
              metricIds(),
              (metricId) => createComponent2(MetricRow, {
                get metrics() {
                  return metrics();
                },
                metricId
              })
            )
          );
          return _el$21;
        })();
      }
    })
  );
};
var SliceView = (props) => {
  const uniqueId = getUniqueId(
    "i",
    props.indexesId,
    props.indexId,
    props.sliceId
  );
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  return Details({
    uniqueId,
    title: "Slice: " + props.sliceId,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return createComponent2(SliceInHtmlTable, {
        get sliceId() {
          return props.sliceId;
        },
        get indexId() {
          return props.indexId;
        },
        get indexes() {
          return props.indexes;
        },
        get editable() {
          return editable();
        }
      });
    }
  });
};
var IndexView = (props) => createComponent2(Details, {
  get uniqueId() {
    return getUniqueId("i", props.indexesId, props.indexId);
  },
  get title() {
    return "Index: " + props.indexId;
  },
  get s() {
    return props.s;
  },
  get children() {
    return arrayMap2(
      useSliceIds(props.indexId, props.indexes)(),
      (sliceId) => createComponent2(SliceView, {
        get indexes() {
          return props.indexes;
        },
        get indexesId() {
          return props.indexesId;
        },
        get indexId() {
          return props.indexId;
        },
        sliceId,
        get s() {
          return props.s;
        }
      })
    );
  }
});
var IndexesView = (props) => {
  const indexes = useIndexes(props.indexesId);
  const indexIds = useIndexIds(indexes);
  return memo2(
    () => memo2(() => !!isUndefined2(indexes()))() ? EMPTY_STRING2 : createComponent2(Details, {
      get uniqueId() {
        return getUniqueId("i", props.indexesId);
      },
      get title() {
        return "Indexes: " + (props.indexesId ?? DEFAULT);
      },
      get s() {
        return props.s;
      },
      get children() {
        return memo2(() => !!arrayIsEmpty(indexIds()))() ? "No indexes defined" : sortedIdsMap(
          indexIds(),
          (indexId) => createComponent2(IndexView, {
            get indexes() {
              return indexes();
            },
            get indexesId() {
              return props.indexesId;
            },
            indexId,
            get s() {
              return props.s;
            }
          })
        );
      }
    })
  );
};
var QueryView = (props) => {
  const uniqueId = getUniqueId("q", props.queriesId, props.queryId);
  const sort = useCell(STATE_TABLE, uniqueId, SORT_CELL, props.s);
  const sortProps = createMemo2(() => jsonParse(sort() ?? "[]"));
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    props.s
  );
  return createComponent2(Details, {
    uniqueId,
    get title() {
      return "Query: " + props.queryId;
    },
    get s() {
      return props.s;
    },
    get children() {
      return createComponent2(ResultSortedTableInHtmlTable, {
        get queryId() {
          return props.queryId;
        },
        get queries() {
          return props.queries;
        },
        get cellId() {
          return sortProps()[0];
        },
        get descending() {
          return sortProps()[1];
        },
        get offset() {
          return sortProps()[2];
        },
        limit: 10,
        paginator: true,
        sortOnClick: true,
        onChange: handleChange
      });
    }
  });
};
var QueriesView = (props) => {
  const queries = useQueries(props.queriesId);
  const queryIds = useQueryIds(queries);
  return memo2(
    () => memo2(() => !!isUndefined2(queries()))() ? EMPTY_STRING2 : createComponent2(Details, {
      get uniqueId() {
        return getUniqueId("q", props.queriesId);
      },
      get title() {
        return "Queries: " + (props.queriesId ?? DEFAULT);
      },
      get s() {
        return props.s;
      },
      get children() {
        return memo2(() => !!arrayIsEmpty(queryIds()))() ? "No queries defined" : sortedIdsMap(
          queryIds(),
          (queryId) => createComponent2(QueryView, {
            get queries() {
              return queries();
            },
            get queriesId() {
              return props.queriesId;
            },
            queryId,
            get s() {
              return props.s;
            }
          })
        );
      }
    })
  );
};
var RelationshipView = (props) => {
  const uniqueId = getUniqueId(
    "r",
    props.relationshipsId,
    props.relationshipId
  );
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  return Details({
    uniqueId,
    title: "Relationship: " + props.relationshipId,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return createComponent2(RelationshipInHtmlTable, {
        get relationshipId() {
          return props.relationshipId;
        },
        get relationships() {
          return props.relationships;
        },
        get editable() {
          return editable();
        }
      });
    }
  });
};
var RelationshipsView = (props) => {
  const relationships = useRelationships(props.relationshipsId);
  const relationshipIds = useRelationshipIds(relationships);
  return memo2(
    () => memo2(() => !!isUndefined2(relationships()))() ? EMPTY_STRING2 : createComponent2(Details, {
      get uniqueId() {
        return getUniqueId("r", props.relationshipsId);
      },
      get title() {
        return "Relationships: " + (props.relationshipsId ?? DEFAULT);
      },
      get s() {
        return props.s;
      },
      get children() {
        return memo2(() => !!arrayIsEmpty(relationshipIds()))() ? "No relationships defined" : sortedIdsMap(
          relationshipIds(),
          (relationshipId) => createComponent2(RelationshipView, {
            get relationships() {
              return relationships();
            },
            get relationshipsId() {
              return props.relationshipsId;
            },
            relationshipId,
            get s() {
              return props.s;
            }
          })
        );
      }
    })
  );
};
var Header = (props) => {
  const position = useValue(POSITION_VALUE, props.s);
  const handleClick = () => open("https://tinybase.org", "_blank");
  const handleClose = () => props.s.setValue(OPEN_VALUE, false);
  const handleDock = (event) => props.s.setValue(POSITION_VALUE, number(event.currentTarget.dataset.id));
  return (() => {
    var _el$24 = _tmpl$1(), _el$25 = _el$24.firstChild, _el$26 = _el$25.nextSibling, _el$27 = _el$26.nextSibling;
    _el$25.addEventListener("click", handleClick);
    setAttribute(_el$25, "title", TITLE);
    insert(_el$26, TITLE);
    insert(
      _el$24,
      () => arrayMap2(
        POSITIONS,
        (name, p) => p == (position() ?? 1) ? EMPTY_STRING2 : (() => {
          var _el$28 = _tmpl$2();
          _el$28.addEventListener("click", handleDock);
          setAttribute(_el$28, "data-id", p);
          setAttribute(_el$28, "title", "Dock to " + name);
          return _el$28;
        })()
      ),
      _el$27
    );
    _el$27.addEventListener("click", handleClose);
    return _el$24;
  })();
};
var Nub = (props) => {
  const position = useValue(POSITION_VALUE, props.s);
  const open2 = useValue(OPEN_VALUE, props.s);
  const handleOpen = () => props.s.setValue(OPEN_VALUE, true);
  return memo2(
    () => memo2(() => !!open2())() ? EMPTY_STRING2 : (() => {
      var _el$29 = _tmpl$2();
      _el$29.addEventListener("click", handleOpen);
      setAttribute(_el$29, "title", TITLE);
      effect(() => setAttribute(_el$29, "data-position", position() ?? 1));
      return _el$29;
    })()
  );
};
var Body = (props) => {
  let article;
  let idleCallback = 0;
  const [scrolled, setScrolled] = createSignal2(false);
  const state = useTable(STATE_TABLE, props.s);
  const scrollValues = useValues(props.s);
  createEffect2(() => {
    const { scrollLeft, scrollTop } = scrollValues();
    if (article && !scrolled()) {
      const observer = new MutationObserver(() => {
        if (article && article.scrollWidth >= mathFloor(scrollLeft) + article.clientWidth && article.scrollHeight >= mathFloor(scrollTop) + article.clientHeight) {
          article.scrollTo(scrollLeft, scrollTop);
        }
      });
      observer.observe(article, {
        childList: true,
        subtree: true
      });
      onCleanup2(() => observer.disconnect());
    }
  });
  const handleScroll = (event) => {
    const { scrollLeft, scrollTop } = event.currentTarget;
    cancelInspectorIdleCallback(idleCallback);
    idleCallback = requestInspectorIdleCallback(() => {
      setScrolled(true);
      props.s.setPartialValues({
        scrollLeft,
        scrollTop
      });
    });
  };
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
  return memo2(
    () => memo2(
      () => !!(state() && isUndefined2(store()) && arrayIsEmpty(storeIds()) && isUndefined2(metrics()) && arrayIsEmpty(metricsIds()) && isUndefined2(indexes()) && arrayIsEmpty(indexesIds()) && isUndefined2(relationships()) && arrayIsEmpty(relationshipsIds()) && isUndefined2(queries()) && arrayIsEmpty(queriesIds()))
    )() ? (() => {
      var _el$30 = _tmpl$10();
      insert(_el$30, NO_PROVIDED_OBJECTS_MESSAGE);
      return _el$30;
    })() : (() => {
      var _el$31 = _tmpl$11();
      _el$31.addEventListener("scroll", handleScroll);
      var _ref$ = article;
      typeof _ref$ === "function" ? use(_ref$, _el$31) : article = _el$31;
      insert(
        _el$31,
        createComponent2(StoreView, {
          get s() {
            return props.s;
          }
        }),
        null
      );
      insert(
        _el$31,
        () => arrayMap2(
          storeIds(),
          (storeId) => createComponent2(StoreView, {
            storeId,
            get s() {
              return props.s;
            }
          })
        ),
        null
      );
      insert(
        _el$31,
        createComponent2(MetricsView, {
          get s() {
            return props.s;
          }
        }),
        null
      );
      insert(
        _el$31,
        () => arrayMap2(
          metricsIds(),
          (metricsId) => createComponent2(MetricsView, {
            metricsId,
            get s() {
              return props.s;
            }
          })
        ),
        null
      );
      insert(
        _el$31,
        createComponent2(IndexesView, {
          get s() {
            return props.s;
          }
        }),
        null
      );
      insert(
        _el$31,
        () => arrayMap2(
          indexesIds(),
          (indexesId) => createComponent2(IndexesView, {
            indexesId,
            get s() {
              return props.s;
            }
          })
        ),
        null
      );
      insert(
        _el$31,
        createComponent2(RelationshipsView, {
          get s() {
            return props.s;
          }
        }),
        null
      );
      insert(
        _el$31,
        () => arrayMap2(
          relationshipsIds(),
          (relationshipsId) => createComponent2(RelationshipsView, {
            relationshipsId,
            get s() {
              return props.s;
            }
          })
        ),
        null
      );
      insert(
        _el$31,
        createComponent2(QueriesView, {
          get s() {
            return props.s;
          }
        }),
        null
      );
      insert(
        _el$31,
        () => arrayMap2(
          queriesIds(),
          (queriesId) => createComponent2(QueriesView, {
            queriesId,
            get s() {
              return props.s;
            }
          })
        ),
        null
      );
      return _el$31;
    })()
  );
};
var Panel = (props) => {
  const position = useValue(POSITION_VALUE, props.s);
  const open2 = useValue(OPEN_VALUE, props.s);
  return memo2(
    () => memo2(() => !!open2())() ? (() => {
      var _el$32 = _tmpl$12();
      insert(
        _el$32,
        createComponent2(Header, {
          get s() {
            return props.s;
          }
        }),
        null
      );
      insert(
        _el$32,
        createComponent2(ErrorBoundary, {
          get fallback() {
            return (() => {
              var _el$33 = _tmpl$10();
              insert(_el$33, INSPECTOR_ERROR_MESSAGE);
              return _el$33;
            })();
          },
          get children() {
            return createComponent2(Body, {
              get s() {
                return props.s;
              }
            });
          }
        }),
        null
      );
      effect(() => setAttribute(_el$32, "data-position", position() ?? 1));
      return _el$32;
    })() : EMPTY_STRING2
  );
};
var Inspector = (props) => {
  const position = props.position ?? "right";
  const open2 = props.open ?? false;
  const values = {
    position: getInitialPosition(position),
    open: !!open2
  };
  const s = useCreateStore(createStore);
  const [ready, setReady] = createSignal2(false);
  useCreatePersister(
    s,
    (s2) => createSessionPersister(s2, UNIQUE_ID),
    async (persister) => {
      await persister.load([{}, values]);
      await persister.startAutoSave();
      setReady(true);
    },
    (persister) => persister.destroy()
  );
  return [
    memo2(
      () => memo2(() => !!ready())() ? (() => {
        var _el$35 = _tmpl$14();
        setAttribute(_el$35, "id", UNIQUE_ID);
        insert(
          _el$35,
          createComponent2(Nub, {
            get s() {
              return s();
            }
          }),
          null
        );
        insert(
          _el$35,
          createComponent2(Panel, {
            get s() {
              return s();
            }
          }),
          null
        );
        effect(
          (_$p) => setStyleProperty(_el$35, "--hue", props.hue ?? 270)
        );
        return _el$35;
      })() : EMPTY_STRING2
    ),
    (() => {
      var _el$34 = _tmpl$13();
      insert(_el$34, APP_STYLESHEET);
      return _el$34;
    })()
  ];
};
export {
  Inspector
};
