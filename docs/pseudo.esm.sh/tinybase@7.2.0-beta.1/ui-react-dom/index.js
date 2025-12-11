// dist/ui-react-dom/index.js
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
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? otherwise?.() : then(value);
var GLOBAL = globalThis;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isString = (thing) => getTypeOf(thing) == STRING;
var isArray = (thing) => Array.isArray(thing);
var size = (arrayOrString) => arrayOrString.length;
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
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
var TINYBASE_CONTEXT = TINYBASE + "_uirc";
var Context = GLOBAL[TINYBASE_CONTEXT] ? (
  /* istanbul ignore next */
  GLOBAL[TINYBASE_CONTEXT]
) : GLOBAL[TINYBASE_CONTEXT] = createContext([]);
var useThing = (id, offset) => {
  const contextValue = useContext(Context);
  return isUndefined(id) ? contextValue[offset * 2] : isString(id) ? objGet(contextValue[offset * 2 + 1], id) : id;
};
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId) ? thing : thingOrThingId;
};
var OFFSET_STORE = 0;
var OFFSET_QUERIES = 4;
var OFFSET_CHECKPOINTS = 5;
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
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
var useCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  3,
  [tableId, rowId, cellId]
);
var useValue = (valueId, storeOrStoreId) => useListenable(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  3,
  [valueId]
);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);
var useResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => useListenable(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  3,
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
  3,
  [checkpointId]
);
var wrap = (children, separator, encloseWithId, id) => {
  const separated = isUndefined(separator) || !isArray(children) ? children : arrayMap(children, (child, c) => c > 0 ? [separator, child] : child);
  return encloseWithId ? [id, ":{", separated, "}"] : separated;
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

// dist/ui-react-dom/index.js
var getTypeOf2 = (thing) => typeof thing;
var TINYBASE2 = "tinybase";
var EMPTY_STRING2 = "";
var DOT = ".";
var STRING2 = getTypeOf2(EMPTY_STRING2);
var BOOLEAN = getTypeOf2(true);
var NUMBER = getTypeOf2(0);
var FUNCTION2 = getTypeOf2(getTypeOf2);
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
var getIfNotFunction2 = (predicate) => (value, then, otherwise) => predicate(value) ? otherwise?.() : then(value);
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
var isFunction = (thing) => getTypeOf2(thing) == FUNCTION2;
var isArray2 = (thing) => Array.isArray(thing);
var size2 = (arrayOrString) => arrayOrString.length;
var getUndefined = () => void 0;
var arrayEvery2 = (array, cb) => array.every(cb);
var arrayIsEqual2 = (array1, array2) => size2(array1) === size2(array2) && arrayEvery2(array1, (value1, index) => array2[index] === value1);
var arrayMap2 = (array, cb) => array.map(cb);
var arrayFilter = (array, cb) => array.filter(cb);
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
var objIsEqual2 = (obj1, obj2) => {
  const entries1 = objEntries2(obj1);
  return size2(entries1) === objSize2(obj2) && arrayEvery2(
    entries1,
    ([index, value1]) => isObject2(value1) ? isObject2(obj2[index]) ? objIsEqual2(obj2[index], value1) : false : obj2[index] === value1
  );
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
var TINYBASE_CONTEXT2 = TINYBASE2 + "_uirc";
var Context2 = GLOBAL2[TINYBASE_CONTEXT2] ? (
  /* istanbul ignore next */
  GLOBAL2[TINYBASE_CONTEXT2]
) : GLOBAL2[TINYBASE_CONTEXT2] = createContext2([]);
var useThing2 = (id, offset) => {
  const contextValue = useContext2(Context2);
  return isUndefined2(id) ? contextValue[offset * 2] : isString2(id) ? objGet2(contextValue[offset * 2 + 1], id) : id;
};
var useThingOrThingById2 = (thingOrThingId, offset) => {
  const thing = useThing2(thingOrThingId, offset);
  return isUndefined2(thingOrThingId) || isString2(thingOrThingId) ? thing : thingOrThingId;
};
var OFFSET_STORE2 = 0;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES2 = 4;
var EMPTY_ARRAY2 = [];
var DEFAULTS2 = [{}, [], [EMPTY_ARRAY2, void 0, EMPTY_ARRAY2], void 0, false, 0];
var IS_EQUALS2 = [
  objIsEqual2,
  arrayIsEqual2,
  ([backwardIds1, currentId1, forwardIds1], [backwardIds2, currentId2, forwardIds2]) => currentId1 === currentId2 && arrayIsEqual2(backwardIds1, backwardIds2) && arrayIsEqual2(forwardIds1, forwardIds2)
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
      const nextResult = thing?.[(returnType == 4 ? _HAS2 : GET2) + listenable]?.(
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
      (returnType == 4 ? HAS2 : EMPTY_STRING2) + listenable,
      ...args,
      listener
    ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  return useSyncExternalStore2(subscribe, getResult, getResult);
};
var useSetCallback = (storeOrQueries, settable, get, getDeps = EMPTY_ARRAY2, then = getUndefined, thenDeps = EMPTY_ARRAY2, methodPrefix = EMPTY_STRING2, ...args) => useCallback2(
  (parameter) => ifNotUndefined2(
    storeOrQueries,
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
var useStoreSetCallback = (storeOrStoreId, settable, get, getDeps = EMPTY_ARRAY2, then = getUndefined, thenDeps = EMPTY_ARRAY2, ...args) => useSetCallback(
  useStoreOrStoreById2(storeOrStoreId),
  settable,
  get,
  getDeps,
  then,
  thenDeps,
  SET,
  ...args
);
var argsOrGetArgs = (args, store, parameter) => arrayMap2(args, (arg) => isFunction(arg) ? arg(parameter, store) : arg);
var nonFunctionDeps = (args) => arrayFilter(args, (arg) => !isFunction(arg));
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
  5,
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
  3,
  [tableId, rowId, cellId]
);
var useValueIds = (storeOrStoreId) => useListenable2(
  VALUE_IDS2,
  useStoreOrStoreById2(storeOrStoreId),
  1
  /* Array */
);
var useValue2 = (valueId, storeOrStoreId) => useListenable2(
  VALUE2,
  useStoreOrStoreById2(storeOrStoreId),
  3,
  [valueId]
);
var useSetCellCallback = (tableId, rowId, cellId, getCell, getCellDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
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
var useSetValueCallback = (valueId, getValue, getValueDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  VALUE2,
  getValue,
  getValueDeps,
  then,
  thenDeps,
  valueId
);
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
  3,
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
  5,
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
var getCellOrValueType = (cellOrValue) => {
  if (isNull(cellOrValue)) {
    return NULL;
  }
  const type = getTypeOf2(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var getTypeCase = (type, stringCase, numberCase, booleanCase) => type == STRING2 ? stringCase : type == NUMBER ? numberCase : type == BOOLEAN ? booleanCase : null;
var useStoreCellComponentProps = (store, tableId) => useMemo2(() => ({ store, tableId }), [store, tableId]);
var useQueriesCellComponentProps = (queries, queryId) => useMemo2(() => ({ queries, queryId }), [queries, queryId]);
var useCallbackOrUndefined = (callback, deps, test) => {
  const returnCallback = useCallback2(callback, deps);
  return test ? returnCallback : void 0;
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
  hasSchema: useStoreOrStoreById2(store)?.hasTablesSchema
});
var EditableValueView = ({ valueId, store, className, showType }) => /* @__PURE__ */ jsx2(EditableThing, {
  thing: useValue2(valueId, store),
  onThingChange: useSetValueCallback(valueId, (value) => value, [], store),
  className: className ?? EDITABLE + VALUE2,
  showType,
  hasSchema: useStoreOrStoreById2(store)?.hasValuesSchema
});
var useDottedCellIds = (tableId, store) => arrayMap2(useTableCellIds(tableId, store), (cellId) => tableId + DOT + cellId);
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
var ResultTableInHtmlTable = ({
  queryId,
  queries,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}) => /* @__PURE__ */ jsx2(HtmlTable, {
  ...props,
  params: useParams(
    useCells(
      useResultTableCellIds(queryId, queries),
      customCells,
      ResultCellView
    ),
    useQueriesCellComponentProps(queries, queryId),
    useResultRowIds(queryId, queries),
    extraCellsBefore,
    extraCellsAfter
  )
});
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
        useTableCellIds(tableId, store),
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
var TableInHtmlTable = ({
  tableId,
  store,
  editable,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}) => /* @__PURE__ */ jsx2(HtmlTable, {
  ...props,
  params: useParams(
    useCells(
      useTableCellIds(tableId, store),
      customCells,
      editable ? EditableCellView : CellView
    ),
    useStoreCellComponentProps(store, tableId),
    useRowIds(tableId, store),
    extraCellsBefore,
    extraCellsAfter
  )
});
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
      children: arrayMap2(useValueIds(store), (valueId) => {
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
