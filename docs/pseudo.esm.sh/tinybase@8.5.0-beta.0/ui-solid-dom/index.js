// dist/ui-solid-dom/index.js
import {
  createContext as createContext2,
  createEffect as createEffect2,
  createMemo as createMemo2,
  createRenderEffect as createRenderEffect2,
  createSignal as createSignal2,
  onCleanup as onCleanup2,
  untrack as untrack2,
  useContext as useContext2
} from "https://esm.sh/solid-js@^1.9.13";
import {
  addEventListener,
  className,
  createComponent as createComponent2,
  effect,
  insert,
  memo as memo2,
  mergeProps as mergeProps2,
  setAttribute,
  template
} from "https://esm.sh/solid-js@^1.9.13/web";

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
} from "https://esm.sh/solid-js@^1.9.13";
import { createComponent, memo, mergeProps } from "https://esm.sh/solid-js@^1.9.13/web";
var getTypeOf = (thing) => typeof thing;
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var STRING = getTypeOf(EMPTY_STRING);
var FUNCTION = getTypeOf(getTypeOf);
var LISTENER = "Listener";
var RESULT = "Result";
var GET = "get";
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
var REMOTE_ROW_ID = "Remote" + ROW + "Id";
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
var objGet = (obj, id) => ifNotUndefined(obj, (obj2) => obj2[id]);
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
var useThing = (id, offset) => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT$1;
  return () => {
    const resolvedContextValue = contextValue();
    const resolvedId = getValue(id);
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
var OFFSET_STORE = 0;
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
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
var useCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  5,
  [tableId, rowId, cellId]
);
var useValue = (valueId, storeOrStoreId) => useListenable(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  5,
  [valueId]
);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);
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
var wrap = (children, separator, encloseWithId, id) => {
  const separated = isUndefined(separator) || !isArray(children) ? children : arrayMap(children, (child, c) => c > 0 ? [separator, child] : child);
  return encloseWithId ? [id, ":{", separated, "}"] : separated;
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

// dist/ui-solid-dom/index.js
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
var NULL = "null";
var LISTENER2 = "Listener";
var RESULT2 = "Result";
var GET2 = "get";
var SET = "set";
var ADD2 = "add";
var HAS2 = "Has";
var _HAS2 = "has";
var IDS2 = "Ids";
var TABLE2 = "Table";
var ROW2 = "Row";
var ROW_COUNT2 = ROW2 + "Count";
var ROW_IDS2 = ROW2 + IDS2;
var SORTED_ROW_IDS2 = "Sorted" + ROW2 + IDS2;
var CELL2 = "Cell";
var CELL_IDS2 = CELL2 + IDS2;
var VALUE2 = "Value";
var VALUE_IDS2 = VALUE2 + IDS2;
var SLICE = "Slice";
var REMOTE_ROW_ID2 = "Remote" + ROW2 + "Id";
var CURRENT_TARGET = "currentTarget";
var _VALUE = "value";
var EXTRA = "extra";
var strSplit = (str, separator = EMPTY_STRING2, limit) => str.split(separator, limit);
var getIfNotFunction2 = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL2 = globalThis;
var math = Math;
var mathMin = math.min;
var isFiniteNumber = isFinite;
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
var size2 = (arrayOrString) => arrayOrString.length;
var getUndefined = () => void 0;
var getArg = (value) => value;
var tryReturn = (tryF, catchReturn) => {
  try {
    return tryF();
  } catch {
    return catchReturn;
  }
};
var arrayEvery2 = (array, cb) => array.every(cb);
var arrayIsEqual2 = (array1, array2) => size2(array1) === size2(array2) && arrayEvery2(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual2 = (value1, value2) => isArray2(value1) && isArray2(value2) ? arrayIsEqual2(value1, value2) : value1 === value2;
var arrayMap2 = (array, cb) => array.map(cb);
var object2 = Object;
var getPrototypeOf2 = (obj) => object2.getPrototypeOf(obj);
var objEntries2 = object2.entries;
var isObject2 = (obj) => !isNullish2(obj) && ifNotNullish2(
  getPrototypeOf2(obj),
  (objPrototype) => objPrototype == object2.prototype || isNullish2(getPrototypeOf2(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds2 = object2.keys;
var objNew = (entries = []) => object2.fromEntries(entries);
var objGet2 = (obj, id) => ifNotUndefined2(obj, (obj2) => obj2[id]);
var objToArray = (obj, cb) => arrayMap2(objEntries2(obj), ([id, value]) => cb(value, id));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));
var objSize2 = (obj) => size2(objIds2(obj));
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
var useThing2 = (id, offset) => {
  const contextValue = useContext2(Context2)?.value ?? EMPTY_CONTEXT;
  return () => {
    const resolvedContextValue = contextValue();
    const resolvedId = getValue2(id);
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
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
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
var useSetCallback = (storeOrQueries, settable, get, then = getUndefined, methodPrefix, ...args) => (parameter) => ifNotUndefined2(
  getThing2(storeOrQueries),
  (obj) => ifNotUndefined2(
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
  useStoreOrStoreById2(storeOrStoreId),
  settable,
  get,
  then,
  SET,
  ...args
);
var argsOrGetArgs = (args, store, parameter) => arrayMap2(
  args,
  (arg) => isFunction2(arg) ? arg.length == 0 ? getThing2(arg) : arg(parameter, store) : arg
);
var useSortedRowIdsImpl = (tableId, cellId, descending, offset, limit, storeOrStoreId) => useListenable2(
  SORTED_ROW_IDS2,
  useStoreOrStoreById2(storeOrStoreId),
  1,
  [tableId, cellId, descending, offset, limit]
);
var useStoreOrStoreById2 = (storeOrStoreId) => useThingOrThingById2(storeOrStoreId, OFFSET_STORE2);
var useTableCellIds = (tableId, storeOrStoreId) => useListenable2(
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
var useSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending, offset, limit, storeOrStoreId) => isObject2(tableIdOrArgs) ? useSortedRowIdsImpl(
  tableIdOrArgs.tableId,
  tableIdOrArgs.cellId,
  tableIdOrArgs.descending ?? false,
  tableIdOrArgs.offset ?? 0,
  tableIdOrArgs.limit,
  cellIdOrStoreOrStoreId
) : useSortedRowIdsImpl(
  tableIdOrArgs,
  cellIdOrStoreOrStoreId,
  descending,
  offset,
  limit,
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
  useSetCellCallback(tableId, rowId, cellId, getArg, storeOrStoreId)
];
var useValueIds = (storeOrStoreId) => useListenable2(
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
  useSetValueCallback(valueId, getArg, storeOrStoreId)
];
var useSetCellCallback = (tableId, rowId, cellId, getCell, storeOrStoreId, then) => useStoreSetCallback(
  storeOrStoreId,
  CELL2,
  getCell,
  then,
  tableId,
  rowId,
  cellId
);
var useSetValueCallback = (valueId, getValue3, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, VALUE2, getValue3, then, valueId);
var useIndexesOrIndexesById = (indexesOrIndexesId) => useThingOrThingById2(indexesOrIndexesId, OFFSET_INDEXES);
var useSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => useListenable2(
  SLICE + ROW_IDS2,
  useIndexesOrIndexesById(indexesOrIndexesId),
  1,
  [indexId, sliceId]
);
var useRelationshipsOrRelationshipsById = (relationshipsOrRelationshipsId) => useThingOrThingById2(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var useRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => useListenable2(
  REMOTE_ROW_ID2,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
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
var useResultRowIds = (queryId, queriesOrQueriesId) => useListenable2(
  RESULT2 + ROW_IDS2,
  useQueriesOrQueriesById2(queriesOrQueriesId),
  1,
  [queryId]
);
var useResultSortedRowIds = (queryId, cellId, descending, offset = 0, limit, queriesOrQueriesId) => useListenable2(
  RESULT2 + SORTED_ROW_IDS2,
  useQueriesOrQueriesById2(queriesOrQueriesId),
  1,
  [queryId, cellId, descending, offset, limit]
);
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
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
var getTypeCase = (type, stringCase, numberCase, booleanCase, objectCase, arrayCase) => type == STRING2 ? stringCase : type == NUMBER ? numberCase : type == BOOLEAN ? booleanCase : type == OBJECT ? objectCase : type == ARRAY ? arrayCase : null;
var getStoreCellComponentProps = (store, tableId) => ({
  store,
  tableId
});
var getQueriesCellComponentProps = (queries, queryId) => ({
  queries,
  queryId
});
var getCallbackOrUndefined = (callback, test) => test ? callback : void 0;
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
var _tmpl$$4 = /* @__PURE__ */ template(`<td>`);
var _tmpl$2$4 = /* @__PURE__ */ template(`<th>`);
var UP_ARROW = "\u2191";
var DOWN_ARROW = "\u2193";
var EDITABLE = "editable";
var extraRowCells = (extraRowCells2 = [], extraRowCellProps) => arrayMap2(getValue2(extraRowCells2) ?? [], (extraRowCell) => {
  const Component = extraRowCell.component;
  return (() => {
    var _el$ = _tmpl$$4();
    className(_el$, EXTRA);
    insert(_el$, createComponent2(Component, extraRowCellProps));
    return _el$;
  })();
});
var extraHeaders = (extraCells = []) => arrayMap2(
  getValue2(extraCells) ?? [],
  (extraCell) => (() => {
    var _el$2 = _tmpl$2$4();
    className(_el$2, EXTRA);
    insert(_el$2, () => extraCell.label);
    return _el$2;
  })()
);
var _tmpl$$3 = /* @__PURE__ */ template(`<th>`);
var _tmpl$2$3 = /* @__PURE__ */ template(`<table><tbody>`);
var _tmpl$3$2 = /* @__PURE__ */ template(`<caption>`);
var _tmpl$4$2 = /* @__PURE__ */ template(`<thead><tr>`);
var _tmpl$5$2 = /* @__PURE__ */ template(`<tr>`);
var _tmpl$6$2 = /* @__PURE__ */ template(`<td>`);
var _tmpl$7 = /* @__PURE__ */ template(`<input>`);
var _tmpl$8 = /* @__PURE__ */ template(`<input type=number>`);
var _tmpl$9 = /* @__PURE__ */ template(`<input type=checkbox>`);
var _tmpl$0 = /* @__PURE__ */ template(`<div>`);
var _tmpl$1 = /* @__PURE__ */ template(`<button>`);
var HtmlHeaderCell = (props) => {
  const sortDescending = props.sort[1];
  const cellId = props.cellId;
  return (() => {
    var _el$ = _tmpl$$3();
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
      var _el$2 = _tmpl$2$3(), _el$3 = _el$2.firstChild;
      insert(
        _el$2,
        paginator ? (() => {
          var _el$4 = _tmpl$3$2();
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
            var _el$5 = _tmpl$4$2(), _el$6 = _el$5.firstChild;
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
            var _el$7 = _tmpl$5$2();
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
                  var _el$8 = _tmpl$$3();
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
                  var _el$9 = _tmpl$6$2();
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
        setStringThing(String(thing));
        setNumberThing(Number(thing) || 0);
        setBooleanThing(Boolean(thing));
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
      var _el$0 = _tmpl$7();
      _el$0.addEventListener(
        "input",
        (event) => handleThingChange(
          String(event[CURRENT_TARGET][_VALUE]),
          setStringThing
        )
      );
      effect(() => _el$0.value = stringThing());
      return _el$0;
    })(),
    (() => {
      var _el$1 = _tmpl$8();
      _el$1.addEventListener(
        "input",
        (event) => handleThingChange(
          Number(event[CURRENT_TARGET][_VALUE] || 0),
          setNumberThing
        )
      );
      effect(() => _el$1.value = numberThing());
      return _el$1;
    })(),
    (() => {
      var _el$10 = _tmpl$9();
      _el$10.addEventListener(
        "input",
        (event) => handleThingChange(
          Boolean(event[CURRENT_TARGET].checked),
          setBooleanThing
        )
      );
      effect(() => _el$10.checked = booleanThing());
      return _el$10;
    })(),
    (() => {
      var _el$11 = _tmpl$7();
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
      var _el$12 = _tmpl$7();
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
      var _el$13 = _tmpl$0();
      insert(
        _el$13,
        (() => {
          var _c$4 = memo2(() => !!(props.showType !== false && currentWidget));
          return () => _c$4() ? (() => {
            var _el$14 = _tmpl$1();
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
var _tmpl$$2 = /* @__PURE__ */ template(`<tr>`);
var _tmpl$2$2 = /* @__PURE__ */ template(`<th>`);
var _tmpl$3$1 = /* @__PURE__ */ template(`<td>`);
var _tmpl$4$1 = /* @__PURE__ */ template(`<table><tbody>`);
var _tmpl$5$1 = /* @__PURE__ */ template(`<thead><tr>`);
var _tmpl$6$1 = /* @__PURE__ */ template(`<th>.Id`);
var useDottedCellIds = (tableId, store) => {
  const cellIds = useTableCellIds(
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
    var _el$ = _tmpl$$2();
    insert(_el$, () => extraRowCells(extraCellsBefore, rowProps), null);
    insert(
      _el$,
      (() => {
        var _c$ = memo2(() => !!isFalse(idColumn));
        return () => _c$() ? null : [
          (() => {
            var _el$2 = _tmpl$2$2();
            insert(_el$2, () => props.localRowId);
            effect(() => setAttribute(_el$2, "title", props.localRowId));
            return _el$2;
          })(),
          (() => {
            var _el$3 = _tmpl$2$2();
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
            var _el$4 = _tmpl$3$1();
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
  const resolvedRelationships = useRelationshipsOrRelationshipsById(
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
      var _el$5 = _tmpl$4$1(), _el$6 = _el$5.firstChild;
      insert(
        _el$5,
        (() => {
          var _c$2 = memo2(() => !!isFalse(props.headerRow));
          return () => _c$2() ? null : (() => {
            var _el$7 = _tmpl$5$1(), _el$8 = _el$7.firstChild;
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
                    var _el$9 = _tmpl$6$1(), _el$0 = _el$9.firstChild;
                    insert(_el$9, localTableId, _el$0);
                    return _el$9;
                  })(),
                  (() => {
                    var _el$1 = _tmpl$6$1(), _el$10 = _el$1.firstChild;
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
                  var _el$11 = _tmpl$2$2();
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
var _tmpl$$1 = /* @__PURE__ */ template(`<button class=previous>\u2190`);
var _tmpl$2$1 = /* @__PURE__ */ template(`<button class=next>\u2192`);
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
            var _el$ = _tmpl$$1();
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
            var _el$2 = _tmpl$2$1();
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
var ResultTableInHtmlTable = (props) => HtmlTable({
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
    useResultRowIds(
      () => props.queryId,
      () => props.queries
    ),
    props.extraCellsBefore,
    props.extraCellsAfter
  )
});
var SliceInHtmlTable = (props) => {
  const resolvedIndexes = useIndexesOrIndexesById(() => props.indexes);
  const details = createMemo2(
    () => getIndexStoreTableId(resolvedIndexes(), props.indexId)
  );
  return HtmlTable({
    ...props,
    params: getParams(
      useCells(
        useTableCellIds(
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
        useTableCellIds(
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
var TableInHtmlTable = (props) => HtmlTable({
  ...props,
  params: getParams(
    useCells(
      useTableCellIds(
        () => props.tableId,
        () => props.store
      ),
      () => props.customCells,
      () => props.editable ? EditableCellView : CellView
    ),
    getStoreCellComponentProps(props.store, props.tableId),
    useRowIds(
      () => props.tableId,
      () => props.store
    ),
    props.extraCellsBefore,
    props.extraCellsAfter
  )
});
var _tmpl$ = /* @__PURE__ */ template(`<td>`);
var _tmpl$2 = /* @__PURE__ */ template(`<table><tbody>`);
var _tmpl$3 = /* @__PURE__ */ template(`<thead><tr><th>`);
var _tmpl$4 = /* @__PURE__ */ template(`<th>Id`);
var _tmpl$5 = /* @__PURE__ */ template(`<tr><td>`);
var _tmpl$6 = /* @__PURE__ */ template(`<th>`);
var extraValueCells = (extraValueCells2 = [], extraValueCellProps) => arrayMap2(getValue2(extraValueCells2) ?? [], (extraValueCell) => {
  const Component = extraValueCell.component;
  return (() => {
    var _el$ = _tmpl$();
    className(_el$, EXTRA);
    insert(_el$, createComponent2(Component, extraValueCellProps));
    return _el$;
  })();
});
var ValuesInHtmlTable = (props) => {
  const valueIds = useValueIds(() => props.store);
  return (() => {
    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
    insert(
      _el$2,
      (() => {
        var _c$ = memo2(() => props.headerRow === false);
        return () => _c$() ? null : (() => {
          var _el$4 = _tmpl$3(), _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild;
          insert(
            _el$5,
            () => extraHeaders(props.extraCellsBefore),
            _el$6
          );
          insert(
            _el$5,
            (() => {
              var _c$2 = memo2(() => props.idColumn === false);
              return () => _c$2() ? null : _tmpl$4();
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
          var _el$8 = _tmpl$5(), _el$9 = _el$8.firstChild;
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
                var _el$0 = _tmpl$6();
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
export {
  EditableCellView,
  EditableValueView,
  RelationshipInHtmlRow,
  RelationshipInHtmlTable,
  ResultSortedTableInHtmlTable,
  ResultTableInHtmlTable,
  SliceInHtmlTable,
  SortedTableInHtmlTable,
  SortedTablePaginator,
  TableInHtmlTable,
  ValuesInHtmlTable,
  useSortingAndPagination
};
