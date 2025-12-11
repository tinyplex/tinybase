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
var TRANSACTION = "Transaction";
var PARTIAL = "Partial";
var FINISH = "Finish";
var STATUS = "Status";
var METRIC = "Metric";
var INDEX = "Index";
var SLICE = "Slice";
var RELATIONSHIP = "Relationship";
var REMOTE_ROW_ID = "Remote" + ROW + "Id";
var LOCAL = "Local";
var LINKED = "Linked";
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
var arrayNew = (size2, cb) => arrayMap(new Array(size2).fill(0), (_, index) => cb(index));
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayMap = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size(array) == 0;
var arrayFilter = (array, cb) => array.filter(cb);
var arrayWith = (array, index, value) => array.with(index, value);
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
var objHas = (obj, id) => id in obj;
var objDel = (obj, id) => {
  delete obj[id];
  return obj;
};
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
var getProps = (getProps2, ...ids) => isUndefined(getProps2) ? {} : getProps2(...ids);
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
var TINYBASE_CONTEXT = TINYBASE + "_uirc";
var Context = GLOBAL[TINYBASE_CONTEXT] ? (
  /* istanbul ignore next */
  GLOBAL[TINYBASE_CONTEXT]
) : GLOBAL[TINYBASE_CONTEXT] = createContext([]);
var useThing = (id, offset) => {
  const contextValue = useContext(Context);
  return isUndefined(id) ? contextValue[offset * 2] : isString(id) ? objGet(contextValue[offset * 2 + 1], id) : id;
};
var useThings = (offset) => ({ ...useContext(Context)[offset * 2 + 1] });
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId) ? thing : thingOrThingId;
};
var useProvideThing = (thingId, thing, offset) => {
  const { 16: addExtraThingById, 17: delExtraThingById } = useContext(Context);
  useEffect(() => {
    addExtraThingById?.(offset, thingId, thing);
    return () => delExtraThingById?.(offset, thingId);
  }, [addExtraThingById, thingId, thing, offset, delExtraThingById]);
};
var useThingIds = (offset) => objIds(useContext(Context)[offset * 2 + 1] ?? {});
var OFFSET_STORE = 0;
var OFFSET_METRICS = 1;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES = 4;
var OFFSET_CHECKPOINTS = 5;
var OFFSET_PERSISTER = 6;
var OFFSET_SYNCHRONIZER = 7;
var mergeParentThings = (offset, parentValue, defaultThing, thingsById, extraThingsById) => [
  defaultThing ?? parentValue[offset * 2],
  {
    ...parentValue[offset * 2 + 1],
    ...thingsById,
    ...extraThingsById[offset]
  }
];
var Provider = ({
  store,
  storesById,
  metrics,
  metricsById,
  indexes,
  indexesById,
  relationships,
  relationshipsById,
  queries,
  queriesById,
  checkpoints,
  checkpointsById,
  persister,
  persistersById,
  synchronizer,
  synchronizersById,
  children
}) => {
  const parentValue = useContext(Context);
  const [extraThingsById, setExtraThingsById] = useState(
    () => arrayNew(8, () => ({}))
  );
  const addExtraThingById = useCallback(
    (thingOffset, id, thing) => setExtraThingsById(
      (extraThingsById2) => objGet(extraThingsById2[thingOffset], id) == thing ? extraThingsById2 : arrayWith(extraThingsById2, thingOffset, {
        ...extraThingsById2[thingOffset],
        [id]: thing
      })
    ),
    []
  );
  const delExtraThingById = useCallback(
    (thingOffset, id) => setExtraThingsById(
      (extraThingsById2) => !objHas(extraThingsById2[thingOffset], id) ? extraThingsById2 : arrayWith(
        extraThingsById2,
        thingOffset,
        objDel(extraThingsById2[thingOffset], id)
      )
    ),
    []
  );
  return /* @__PURE__ */ jsx(Context.Provider, {
    value: useMemo(
      () => [
        ...mergeParentThings(
          OFFSET_STORE,
          parentValue,
          store,
          storesById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_METRICS,
          parentValue,
          metrics,
          metricsById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_INDEXES,
          parentValue,
          indexes,
          indexesById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_RELATIONSHIPS,
          parentValue,
          relationships,
          relationshipsById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_QUERIES,
          parentValue,
          queries,
          queriesById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_CHECKPOINTS,
          parentValue,
          checkpoints,
          checkpointsById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_PERSISTER,
          parentValue,
          persister,
          persistersById,
          extraThingsById
        ),
        ...mergeParentThings(
          OFFSET_SYNCHRONIZER,
          parentValue,
          synchronizer,
          synchronizersById,
          extraThingsById
        ),
        addExtraThingById,
        delExtraThingById
      ],
      [
        extraThingsById,
        store,
        storesById,
        metrics,
        metricsById,
        indexes,
        indexesById,
        relationships,
        relationshipsById,
        queries,
        queriesById,
        checkpoints,
        checkpointsById,
        persister,
        persistersById,
        synchronizer,
        synchronizersById,
        parentValue,
        addExtraThingById,
        delExtraThingById
      ]
    ),
    children
  });
};
var EMPTY_ARRAY = [];
var DEFAULTS = [{}, [], [EMPTY_ARRAY, void 0, EMPTY_ARRAY], void 0, false, 0];
var IS_EQUALS = [
  objIsEqual,
  arrayIsEqual,
  ([backwardIds1, currentId1, forwardIds1], [backwardIds2, currentId2, forwardIds2]) => currentId1 === currentId2 && arrayIsEqual(backwardIds1, backwardIds2) && arrayIsEqual(forwardIds1, forwardIds2)
];
var isEqual = (thing1, thing2) => thing1 === thing2;
var useCreate = (store, create, createDeps = EMPTY_ARRAY) => {
  const [, rerender] = useState();
  const [thing, setThing] = useState();
  useEffect(
    () => {
      const newThing = store ? create(store) : void 0;
      setThing(newThing);
      rerender([]);
      return newThing?.destroy;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps]
  );
  return thing;
};
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
var useListener = (listenable, thing, listener, listenerDeps = EMPTY_ARRAY, preArgs = EMPTY_ARRAY, ...postArgs) => useLayoutEffect(
  () => addAndDelListener(thing, listenable, ...preArgs, listener, ...postArgs),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [thing, listenable, ...preArgs, ...listenerDeps, ...postArgs]
);
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
var useQueriesSetCallback = (queriesOrQueriesId, settable, get, getDeps, then, thenDeps, ...args) => useSetCallback(
  useQueriesOrQueriesById(queriesOrQueriesId),
  settable,
  get,
  getDeps,
  then,
  thenDeps,
  EMPTY_STRING,
  ...args
);
var argsOrGetArgs = (args, store, parameter) => arrayMap(args, (arg) => isFunction(arg) ? arg(parameter, store) : arg);
var nonFunctionDeps = (args) => arrayFilter(args, (arg) => !isFunction(arg));
var useDel = (storeOrStoreId, deletable, then = getUndefined, thenDeps = EMPTY_ARRAY, ...args) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (parameter) => then(store?.[DEL + deletable](...argsOrGetArgs(args, store, parameter))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, deletable, ...thenDeps, ...nonFunctionDeps(args)]
  );
};
var useCheckpointAction = (checkpointsOrCheckpointsId, action, arg) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  return useCallback(
    () => checkpoints?.[action](arg),
    [checkpoints, action, arg]
  );
};
var useSortedRowIdsImpl = (tableId, cellId, descending, offset, limit, storeOrStoreId) => useListenable(
  SORTED_ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId, cellId, descending, offset, limit]
);
var useSortedRowIdsListenerImpl = (tableId, cellId, descending, offset, limit, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  SORTED_ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, cellId, descending, offset, limit],
  mutator
);
var useCreateStore = (create, createDeps = EMPTY_ARRAY) => useMemo(create, createDeps);
var useStoreIds = () => useThingIds(OFFSET_STORE);
var useStore = (id) => useThing(id, OFFSET_STORE);
var useStores = () => useThings(OFFSET_STORE);
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
var useProvideStore = (storeId, store) => useProvideThing(storeId, store, OFFSET_STORE);
var useCreateMergeableStore = (create, createDeps = EMPTY_ARRAY) => useMemo(create, createDeps);
var useHasTables = (storeOrStoreId) => useListenable(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  4,
  []
);
var useTables = (storeOrStoreId) => useListenable(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  0
  /* Object */
);
var useTableIds = (storeOrStoreId) => useListenable(
  TABLE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1
  /* Array */
);
var useHasTable = (tableId, storeOrStoreId) => useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 4, [
  tableId
]);
var useTable = (tableId, storeOrStoreId) => useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 0, [
  tableId
]);
var useTableCellIds = (tableId, storeOrStoreId) => useListenable(
  TABLE + CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId]
);
var useHasTableCell = (tableId, cellId, storeOrStoreId) => useListenable(
  TABLE + CELL,
  useStoreOrStoreById(storeOrStoreId),
  4,
  [tableId, cellId]
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
var useSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending, offset, limit, storeOrStoreId) => useSortedRowIdsImpl(
  ...isObject(tableIdOrArgs) ? [
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
var useHasRow = (tableId, rowId, storeOrStoreId) => useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 4, [
  tableId,
  rowId
]);
var useRow = (tableId, rowId, storeOrStoreId) => useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 0, [
  tableId,
  rowId
]);
var useCellIds = (tableId, rowId, storeOrStoreId) => useListenable(CELL_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
  tableId,
  rowId
]);
var useHasCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(CELL, useStoreOrStoreById(storeOrStoreId), 4, [
  tableId,
  rowId,
  cellId
]);
var useCell = (tableId, rowId, cellId, storeOrStoreId) => useListenable(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  3,
  [tableId, rowId, cellId]
);
var useHasValues = (storeOrStoreId) => useListenable(
  VALUES,
  useStoreOrStoreById(storeOrStoreId),
  4,
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
var useHasValue = (valueId, storeOrStoreId) => useListenable(VALUE, useStoreOrStoreById(storeOrStoreId), 4, [
  valueId
]);
var useValue = (valueId, storeOrStoreId) => useListenable(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  3,
  [valueId]
);
var useSetTablesCallback = (getTables, getTablesDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  TABLES,
  getTables,
  getTablesDeps,
  then,
  thenDeps
);
var useSetTableCallback = (tableId, getTable, getTableDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  TABLE,
  getTable,
  getTableDeps,
  then,
  thenDeps,
  tableId
);
var useSetRowCallback = (tableId, rowId, getRow, getRowDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  ROW,
  getRow,
  getRowDeps,
  then,
  thenDeps,
  tableId,
  rowId
);
var useAddRowCallback = (tableId, getRow, getRowDeps = EMPTY_ARRAY, storeOrStoreId, then = getUndefined, thenDeps = EMPTY_ARRAY, reuseRowIds = true) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (parameter) => ifNotUndefined(
      store,
      (store2) => ifNotUndefined(
        getRow(parameter, store2),
        (row) => then(
          store2.addRow(
            isFunction(tableId) ? tableId(parameter, store2) : tableId,
            row,
            reuseRowIds
          ),
          store2,
          row
        )
      )
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, tableId, ...getRowDeps, ...thenDeps, reuseRowIds]
  );
};
var useSetPartialRowCallback = (tableId, rowId, getPartialRow, getPartialRowDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  PARTIAL + ROW,
  getPartialRow,
  getPartialRowDeps,
  then,
  thenDeps,
  tableId,
  rowId
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
var useSetValuesCallback = (getValues, getValuesDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  VALUES,
  getValues,
  getValuesDeps,
  then,
  thenDeps
);
var useSetPartialValuesCallback = (getPartialValues, getPartialValuesDeps, storeOrStoreId, then, thenDeps) => useStoreSetCallback(
  storeOrStoreId,
  PARTIAL + VALUES,
  getPartialValues,
  getPartialValuesDeps,
  then,
  thenDeps
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
var useDelTablesCallback = (storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, TABLES, then, thenDeps);
var useDelTableCallback = (tableId, storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, TABLE, then, thenDeps, tableId);
var useDelRowCallback = (tableId, rowId, storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, ROW, then, thenDeps, tableId, rowId);
var useDelCellCallback = (tableId, rowId, cellId, forceDel, storeOrStoreId, then, thenDeps) => useDel(
  storeOrStoreId,
  CELL,
  then,
  thenDeps,
  tableId,
  rowId,
  cellId,
  forceDel
);
var useDelValuesCallback = (storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, VALUES, then, thenDeps);
var useDelValueCallback = (valueId, storeOrStoreId, then, thenDeps) => useDel(storeOrStoreId, VALUE, then, thenDeps, valueId);
var useHasTablesListener = (listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + TABLES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [],
  mutator
);
var useTablesListener = (listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  EMPTY_ARRAY,
  mutator
);
var useTableIdsListener = (listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  TABLE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  EMPTY_ARRAY,
  mutator
);
var useHasTableListener = (tableId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + TABLE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId],
  mutator
);
var useTableListener = (tableId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  TABLE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId],
  mutator
);
var useTableCellIdsListener = (tableId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  TABLE + CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId],
  mutator
);
var useHasTableCellListener = (tableId, cellId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + TABLE + CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, cellId],
  mutator
);
var useRowCountListener = (tableId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  ROW_COUNT,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId],
  mutator
);
var useRowIdsListener = (tableId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId],
  mutator
);
var useSortedRowIdsListener = (tableIdOrArgs, cellIdOrListener, descendingOrListenerDeps, offsetOrMutator, limitOrStoreOrStoreId, listener, listenerDeps, mutator, storeOrStoreId) => useSortedRowIdsListenerImpl(
  ...isObject(tableIdOrArgs) ? [
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending ?? false,
    tableIdOrArgs.offset ?? 0,
    tableIdOrArgs.limit,
    cellIdOrListener,
    descendingOrListenerDeps,
    offsetOrMutator,
    limitOrStoreOrStoreId
  ] : [
    tableIdOrArgs,
    cellIdOrListener,
    descendingOrListenerDeps,
    offsetOrMutator,
    limitOrStoreOrStoreId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId
  ]
);
var useHasRowListener = (tableId, rowId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + ROW,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, rowId],
  mutator
);
var useRowListener = (tableId, rowId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  ROW,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, rowId],
  mutator
);
var useCellIdsListener = (tableId, rowId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, rowId],
  mutator
);
var useHasCellListener = (tableId, rowId, cellId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, rowId, cellId],
  mutator
);
var useCellListener = (tableId, rowId, cellId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, rowId, cellId],
  mutator
);
var useHasValuesListener = (listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + VALUES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [],
  mutator
);
var useValuesListener = (listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  VALUES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  EMPTY_ARRAY,
  mutator
);
var useValueIdsListener = (listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  VALUE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  EMPTY_ARRAY,
  mutator
);
var useHasValueListener = (valueId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  HAS + VALUE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [valueId],
  mutator
);
var useValueListener = (valueId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [valueId],
  mutator
);
var useStartTransactionListener = (listener, listenerDeps, storeOrStoreId) => useListener(
  "Start" + TRANSACTION,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps
);
var useWillFinishTransactionListener = (listener, listenerDeps, storeOrStoreId) => useListener(
  "Will" + FINISH + TRANSACTION,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps
);
var useDidFinishTransactionListener = (listener, listenerDeps, storeOrStoreId) => useListener(
  "Did" + FINISH + TRANSACTION,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps
);
var useCreateMetrics = (store, create, createDeps) => useCreate(store, create, createDeps);
var useMetricsIds = () => useThingIds(OFFSET_METRICS);
var useMetrics = (id) => useThing(id, OFFSET_METRICS);
var useMetricsOrMetricsById = (metricsOrMetricsId) => useThingOrThingById(metricsOrMetricsId, OFFSET_METRICS);
var useProvideMetrics = (metricsId, metrics) => useProvideThing(metricsId, metrics, OFFSET_METRICS);
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
var useMetricListener = (metricId, listener, listenerDeps, metricsOrMetricsId) => useListener(
  METRIC,
  useMetricsOrMetricsById(metricsOrMetricsId),
  listener,
  listenerDeps,
  [metricId]
);
var useCreateIndexes = (store, create, createDeps) => useCreate(store, create, createDeps);
var useIndexesIds = () => useThingIds(OFFSET_INDEXES);
var useIndexes = (id) => useThing(id, OFFSET_INDEXES);
var useIndexesOrIndexesById = (indexesOrIndexesId) => useThingOrThingById(indexesOrIndexesId, OFFSET_INDEXES);
var useProvideIndexes = (indexesId, indexes) => useProvideThing(indexesId, indexes, OFFSET_INDEXES);
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
var useSliceIdsListener = (indexId, listener, listenerDeps, indexesOrIndexesId) => useListener(
  SLICE + IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  listener,
  listenerDeps,
  [indexId]
);
var useSliceRowIdsListener = (indexId, sliceId, listener, listenerDeps, indexesOrIndexesId) => useListener(
  SLICE + ROW_IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  listener,
  listenerDeps,
  [indexId, sliceId]
);
var useCreateRelationships = (store, create, createDeps) => useCreate(store, create, createDeps);
var useRelationshipsIds = () => useThingIds(OFFSET_RELATIONSHIPS);
var useRelationships = (id) => useThing(id, OFFSET_RELATIONSHIPS);
var useRelationshipsOrRelationshipsById = (relationshipsOrRelationshipsId) => useThingOrThingById(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var useProvideRelationships = (relationshipsId, relationships) => useProvideThing(relationshipsId, relationships, OFFSET_RELATIONSHIPS);
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
var useLocalRowIds = (relationshipId, remoteRowId, relationshipsOrRelationshipsId) => useListenable(
  LOCAL + ROW_IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  1,
  [relationshipId, remoteRowId]
);
var useLinkedRowIds = (relationshipId, firstRowId, relationshipsOrRelationshipsId) => useListenable(
  LINKED + ROW_IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  1,
  [relationshipId, firstRowId]
);
var useRemoteRowIdListener = (relationshipId, localRowId, listener, listenerDeps, relationshipsOrRelationshipsId) => useListener(
  REMOTE_ROW_ID,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  listener,
  listenerDeps,
  [relationshipId, localRowId]
);
var useLocalRowIdsListener = (relationshipId, remoteRowId, listener, listenerDeps, relationshipsOrRelationshipsId) => useListener(
  LOCAL + ROW_IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  listener,
  listenerDeps,
  [relationshipId, remoteRowId]
);
var useLinkedRowIdsListener = (relationshipId, firstRowId, listener, listenerDeps, relationshipsOrRelationshipsId) => useListener(
  LINKED + ROW_IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  listener,
  listenerDeps,
  [relationshipId, firstRowId]
);
var useCreateQueries = (store, create, createDeps) => useCreate(store, create, createDeps);
var useQueriesIds = () => useThingIds(OFFSET_QUERIES);
var useQueries = (id) => useThing(id, OFFSET_QUERIES);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);
var useProvideQueries = (queriesId, queries) => useProvideThing(queriesId, queries, OFFSET_QUERIES);
var useQueryIds = (queriesOrQueriesId) => useListenable(
  QUERY + IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1
);
var useResultTable = (queryId, queriesOrQueriesId) => useListenable(
  RESULT + TABLE,
  useQueriesOrQueriesById(queriesOrQueriesId),
  0,
  [queryId]
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
var useResultRowIds = (queryId, queriesOrQueriesId) => useListenable(
  RESULT + ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1,
  [queryId]
);
var useResultSortedRowIds = (queryId, cellId, descending, offset = 0, limit, queriesOrQueriesId) => useListenable(
  RESULT + SORTED_ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1,
  [queryId, cellId, descending, offset, limit]
);
var useResultRow = (queryId, rowId, queriesOrQueriesId) => useListenable(
  RESULT + ROW,
  useQueriesOrQueriesById(queriesOrQueriesId),
  0,
  [queryId, rowId]
);
var useResultCellIds = (queryId, rowId, queriesOrQueriesId) => useListenable(
  RESULT + CELL_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1,
  [queryId, rowId]
);
var useResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => useListenable(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  3,
  [queryId, rowId, cellId]
);
var useResultTableListener = (queryId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + TABLE,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId]
);
var useResultTableCellIdsListener = (queryId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + TABLE + CELL_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId]
);
var useResultRowCountListener = (queryId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + ROW_COUNT,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId]
);
var useResultRowIdsListener = (queryId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId]
);
var useResultSortedRowIdsListener = (queryId, cellId, descending, offset, limit, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + SORTED_ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId, cellId, descending, offset, limit]
);
var useResultRowListener = (queryId, rowId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + ROW,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId, rowId]
);
var useResultCellIdsListener = (queryId, rowId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + CELL_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId, rowId]
);
var useResultCellListener = (queryId, rowId, cellId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId, rowId, cellId]
);
var useSetParamValueCallback = (queryId, paramId, getParamValue, getParamValueDeps, queriesOrQueriesId, then, thenDeps) => useQueriesSetCallback(
  queriesOrQueriesId,
  "setParamValue",
  getParamValue,
  getParamValueDeps,
  then,
  thenDeps,
  queryId,
  paramId
);
var useSetParamValuesCallback = (queryId, getParamValues, getParamValuesDeps, queriesOrQueriesId, then, thenDeps) => useQueriesSetCallback(
  queriesOrQueriesId,
  "setParamValues",
  getParamValues,
  getParamValuesDeps,
  then,
  thenDeps,
  queryId
);
var useCreateCheckpoints = (store, create, createDeps) => useCreate(store, create, createDeps);
var useCheckpointsIds = () => useThingIds(OFFSET_CHECKPOINTS);
var useCheckpoints = (id) => useThing(id, OFFSET_CHECKPOINTS);
var useCheckpointsOrCheckpointsById = (checkpointsOrCheckpointsId) => useThingOrThingById(checkpointsOrCheckpointsId, OFFSET_CHECKPOINTS);
var useProvideCheckpoints = (checkpointsId, checkpoints) => useProvideThing(checkpointsId, checkpoints, OFFSET_CHECKPOINTS);
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
var useSetCheckpointCallback = (getCheckpoint = getUndefined, getCheckpointDeps = EMPTY_ARRAY, checkpointsOrCheckpointsId, then = getUndefined, thenDeps = EMPTY_ARRAY) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  return useCallback(
    (parameter) => ifNotUndefined(checkpoints, (checkpoints2) => {
      const label = getCheckpoint(parameter);
      then(checkpoints2.addCheckpoint(label), checkpoints2, label);
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoints, ...getCheckpointDeps, ...thenDeps]
  );
};
var useGoBackwardCallback = (checkpointsOrCheckpointsId) => useCheckpointAction(checkpointsOrCheckpointsId, "goBackward");
var useGoForwardCallback = (checkpointsOrCheckpointsId) => useCheckpointAction(checkpointsOrCheckpointsId, "goForward");
var useGoToCallback = (getCheckpointId, getCheckpointIdDeps = EMPTY_ARRAY, checkpointsOrCheckpointsId, then = getUndefined, thenDeps = EMPTY_ARRAY) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  return useCallback(
    (parameter) => ifNotUndefined(
      checkpoints,
      (checkpoints2) => ifNotUndefined(
        getCheckpointId(parameter),
        (checkpointId) => then(checkpoints2.goTo(checkpointId), checkpointId)
      )
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoints, ...getCheckpointIdDeps, ...thenDeps]
  );
};
var useUndoInformation = (checkpointsOrCheckpointsId) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  const [backwardIds, currentId] = useCheckpointIds(checkpoints);
  return [
    !arrayIsEmpty(backwardIds),
    useGoBackwardCallback(checkpoints),
    currentId,
    ifNotUndefined(currentId, (id) => checkpoints?.getCheckpoint(id)) ?? EMPTY_STRING
  ];
};
var useRedoInformation = (checkpointsOrCheckpointsId) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  const [, , [forwardId]] = useCheckpointIds(checkpoints);
  return [
    !isUndefined(forwardId),
    useGoForwardCallback(checkpoints),
    forwardId,
    ifNotUndefined(forwardId, (id) => checkpoints?.getCheckpoint(id)) ?? EMPTY_STRING
  ];
};
var useCheckpointIdsListener = (listener, listenerDeps, checkpointsOrCheckpointsId) => useListener(
  CHECKPOINT + IDS,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  listener,
  listenerDeps
);
var useCheckpointListener = (checkpointId, listener, listenerDeps, checkpointsOrCheckpointsId) => useListener(
  CHECKPOINT,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  listener,
  listenerDeps,
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
var usePersisterIds = () => useThingIds(OFFSET_PERSISTER);
var usePersister = (id) => useThing(id, OFFSET_PERSISTER);
var usePersisterOrPersisterById = (persisterOrPersisterId) => useThingOrThingById(persisterOrPersisterId, OFFSET_PERSISTER);
var useProvidePersister = (persisterId, persister) => useProvideThing(persisterId, persister, OFFSET_PERSISTER);
var usePersisterStatus = (persisterOrPersisterId) => useListenable(
  STATUS,
  usePersisterOrPersisterById(persisterOrPersisterId),
  5,
  []
);
var usePersisterStatusListener = (listener, listenerDeps, persisterOrPersisterId) => useListener(
  STATUS,
  usePersisterOrPersisterById(persisterOrPersisterId),
  listener,
  listenerDeps,
  []
);
var useCreateSynchronizer = (store, create, createDeps = EMPTY_ARRAY, destroy, destroyDeps = EMPTY_ARRAY) => {
  const [synchronizer, setSynchronizer] = useState();
  useEffect(
    () => {
      (async () => {
        const synchronizer2 = store ? await create(store) : void 0;
        setSynchronizer(synchronizer2);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, ...createDeps]
  );
  useEffect(
    () => () => {
      if (synchronizer) {
        synchronizer.destroy();
        destroy?.(synchronizer);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [synchronizer, ...destroyDeps]
  );
  return synchronizer;
};
var useSynchronizerIds = () => useThingIds(OFFSET_SYNCHRONIZER);
var useSynchronizer = (id) => useThing(id, OFFSET_SYNCHRONIZER);
var useSynchronizerOrSynchronizerById = (synchronizerOrSynchronizerId) => useThingOrThingById(synchronizerOrSynchronizerId, OFFSET_SYNCHRONIZER);
var useProvideSynchronizer = (persisterId, persister) => useProvideThing(persisterId, persister, OFFSET_SYNCHRONIZER);
var useSynchronizerStatus = (synchronizerOrSynchronizerId) => useListenable(
  STATUS,
  useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
  5,
  []
);
var useSynchronizerStatusListener = (listener, listenerDeps, synchronizerOrSynchronizerId) => useListener(
  STATUS,
  useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
  listener,
  listenerDeps,
  []
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
var ResultRowView = ({
  queryId,
  rowId,
  queries,
  resultCellComponent: ResultCell = ResultCellView,
  getResultCellComponentProps,
  separator,
  debugIds
}) => wrap(
  arrayMap(
    useResultCellIds(queryId, rowId, queries),
    (cellId) => /* @__PURE__ */ jsx(
      ResultCell,
      {
        ...getProps(getResultCellComponentProps, cellId),
        queryId,
        rowId,
        cellId,
        queries,
        debugIds
      },
      cellId
    )
  ),
  separator,
  debugIds,
  rowId
);
var CellView = ({ tableId, rowId, cellId, store, debugIds }) => wrap(
  EMPTY_STRING + (useCell(tableId, rowId, cellId, store) ?? EMPTY_STRING),
  void 0,
  debugIds,
  cellId
);
var useCustomOrDefaultCellIds = (customCellIds, tableId, rowId, store) => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return customCellIds ?? defaultCellIds;
};
var RowView = ({
  tableId,
  rowId,
  store,
  cellComponent: Cell = CellView,
  getCellComponentProps,
  customCellIds,
  separator,
  debugIds
}) => wrap(
  arrayMap(
    useCustomOrDefaultCellIds(customCellIds, tableId, rowId, store),
    (cellId) => /* @__PURE__ */ jsx(
      Cell,
      {
        ...getProps(getCellComponentProps, cellId),
        tableId,
        rowId,
        cellId,
        store,
        debugIds
      },
      cellId
    )
  ),
  separator,
  debugIds,
  rowId
);
var tableView = ({
  tableId,
  store,
  rowComponent: Row = RowView,
  getRowComponentProps,
  customCellIds,
  separator,
  debugIds
}, rowIds) => wrap(
  arrayMap(
    rowIds,
    (rowId) => /* @__PURE__ */ jsx(
      Row,
      {
        ...getProps(getRowComponentProps, rowId),
        tableId,
        rowId,
        customCellIds,
        store,
        debugIds
      },
      rowId
    )
  ),
  separator,
  debugIds,
  tableId
);
var resultTableView = ({
  queryId,
  queries,
  resultRowComponent: ResultRow = ResultRowView,
  getResultRowComponentProps,
  separator,
  debugIds
}, rowIds) => wrap(
  arrayMap(
    rowIds,
    (rowId) => /* @__PURE__ */ jsx(
      ResultRow,
      {
        ...getProps(getResultRowComponentProps, rowId),
        queryId,
        rowId,
        queries,
        debugIds
      },
      rowId
    )
  ),
  separator,
  debugIds,
  queryId
);
var useComponentPerRow = ({
  relationshipId,
  relationships,
  rowComponent: Row = RowView,
  getRowComponentProps,
  separator,
  debugIds
}, getRowIdsHook, rowId) => {
  const [resolvedRelationships, store, localTableId] = getRelationshipsStoreTableIds(
    useRelationshipsOrRelationshipsById(relationships),
    relationshipId
  );
  const rowIds = getRowIdsHook(relationshipId, rowId, resolvedRelationships);
  return wrap(
    arrayMap(
      rowIds,
      (rowId2) => /* @__PURE__ */ jsx(
        Row,
        {
          ...getProps(getRowComponentProps, rowId2),
          tableId: localTableId,
          rowId: rowId2,
          store,
          debugIds
        },
        rowId2
      )
    ),
    separator,
    debugIds,
    rowId
  );
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
var BackwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[0]
);
var CurrentCheckpointView = getUseCheckpointView(
  (checkpointIds) => isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]]
);
var ForwardCheckpointsView = getUseCheckpointView(
  (checkpointIds) => checkpointIds[2]
);
var SliceView = ({
  indexId,
  sliceId,
  indexes,
  rowComponent: Row = RowView,
  getRowComponentProps,
  separator,
  debugIds
}) => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById(indexes),
    indexId
  );
  const rowIds = useSliceRowIds(indexId, sliceId, resolvedIndexes);
  return wrap(
    arrayMap(
      rowIds,
      (rowId) => /* @__PURE__ */ jsx(
        Row,
        {
          ...getProps(getRowComponentProps, rowId),
          tableId,
          rowId,
          store,
          debugIds
        },
        rowId
      )
    ),
    separator,
    debugIds,
    sliceId
  );
};
var IndexView = ({
  indexId,
  indexes,
  sliceComponent: Slice = SliceView,
  getSliceComponentProps,
  separator,
  debugIds
}) => wrap(
  arrayMap(
    useSliceIds(indexId, indexes),
    (sliceId) => /* @__PURE__ */ jsx(
      Slice,
      {
        ...getProps(getSliceComponentProps, sliceId),
        indexId,
        sliceId,
        indexes,
        debugIds
      },
      sliceId
    )
  ),
  separator,
  debugIds,
  indexId
);
var LinkedRowsView = (props) => useComponentPerRow(props, useLinkedRowIds, props.firstRowId);
var LocalRowsView = (props) => useComponentPerRow(props, useLocalRowIds, props.remoteRowId);
var MetricView = ({ metricId, metrics, debugIds }) => wrap(
  useMetric(metricId, metrics) ?? EMPTY_STRING,
  void 0,
  debugIds,
  metricId
);
var RemoteRowView = ({
  relationshipId,
  localRowId,
  relationships,
  rowComponent: Row = RowView,
  getRowComponentProps,
  debugIds
}) => {
  const [resolvedRelationships, store, , remoteTableId] = getRelationshipsStoreTableIds(
    useRelationshipsOrRelationshipsById(relationships),
    relationshipId
  );
  const rowId = useRemoteRowId(
    relationshipId,
    localRowId,
    resolvedRelationships
  );
  return wrap(
    isUndefined(remoteTableId) || isUndefined(rowId) ? null : /* @__PURE__ */ jsx(
      Row,
      {
        ...getProps(getRowComponentProps, rowId),
        tableId: remoteTableId,
        rowId,
        store,
        debugIds
      },
      rowId
    ),
    void 0,
    debugIds,
    localRowId
  );
};
var ResultSortedTableView = ({ cellId, descending, offset, limit, ...props }) => resultTableView(
  props,
  useResultSortedRowIds(
    props.queryId,
    cellId,
    descending,
    offset,
    limit,
    props.queries
  )
);
var ResultTableView = (props) => resultTableView(props, useResultRowIds(props.queryId, props.queries));
var SortedTableView = ({ cellId, descending, offset, limit, ...props }) => tableView(
  props,
  useSortedRowIds(
    props.tableId,
    cellId,
    descending,
    offset,
    limit,
    props.store
  )
);
var TableView = (props) => tableView(props, useRowIds(props.tableId, props.store));
var TablesView = ({
  store,
  tableComponent: Table = TableView,
  getTableComponentProps,
  separator,
  debugIds
}) => wrap(
  arrayMap(
    useTableIds(store),
    (tableId) => /* @__PURE__ */ jsx(
      Table,
      {
        ...getProps(getTableComponentProps, tableId),
        tableId,
        store,
        debugIds
      },
      tableId
    )
  ),
  separator
);
var ValueView = ({ valueId, store, debugIds }) => wrap(
  EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING),
  void 0,
  debugIds,
  valueId
);
var ValuesView = ({
  store,
  valueComponent: Value = ValueView,
  getValueComponentProps,
  separator,
  debugIds
}) => wrap(
  arrayMap(
    useValueIds(store),
    (valueId) => /* @__PURE__ */ jsx(
      Value,
      {
        ...getProps(getValueComponentProps, valueId),
        valueId,
        store,
        debugIds
      },
      valueId
    )
  ),
  separator
);
export {
  BackwardCheckpointsView,
  CellView,
  CheckpointView,
  CurrentCheckpointView,
  ForwardCheckpointsView,
  IndexView,
  LinkedRowsView,
  LocalRowsView,
  MetricView,
  OFFSET_CHECKPOINTS,
  OFFSET_INDEXES,
  OFFSET_METRICS,
  OFFSET_PERSISTER,
  OFFSET_QUERIES,
  OFFSET_RELATIONSHIPS,
  OFFSET_STORE,
  OFFSET_SYNCHRONIZER,
  Provider,
  RemoteRowView,
  ResultCellView,
  ResultRowView,
  ResultSortedTableView,
  ResultTableView,
  RowView,
  SliceView,
  SortedTableView,
  TableView,
  TablesView,
  ValueView,
  ValuesView,
  useAddRowCallback,
  useCell,
  useCellIds,
  useCellIdsListener,
  useCellListener,
  useCheckpoint,
  useCheckpointIds,
  useCheckpointIdsListener,
  useCheckpointListener,
  useCheckpoints,
  useCheckpointsIds,
  useCheckpointsOrCheckpointsById,
  useCreateCheckpoints,
  useCreateIndexes,
  useCreateMergeableStore,
  useCreateMetrics,
  useCreatePersister,
  useCreateQueries,
  useCreateRelationships,
  useCreateStore,
  useCreateSynchronizer,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useDelValueCallback,
  useDelValuesCallback,
  useDidFinishTransactionListener,
  useGoBackwardCallback,
  useGoForwardCallback,
  useGoToCallback,
  useHasCell,
  useHasCellListener,
  useHasRow,
  useHasRowListener,
  useHasTable,
  useHasTableCell,
  useHasTableCellListener,
  useHasTableListener,
  useHasTables,
  useHasTablesListener,
  useHasValue,
  useHasValueListener,
  useHasValues,
  useHasValuesListener,
  useIndexIds,
  useIndexes,
  useIndexesIds,
  useIndexesOrIndexesById,
  useLinkedRowIds,
  useLinkedRowIdsListener,
  useLocalRowIds,
  useLocalRowIdsListener,
  useMetric,
  useMetricIds,
  useMetricListener,
  useMetrics,
  useMetricsIds,
  useMetricsOrMetricsById,
  usePersister,
  usePersisterIds,
  usePersisterOrPersisterById,
  usePersisterStatus,
  usePersisterStatusListener,
  useProvideCheckpoints,
  useProvideIndexes,
  useProvideMetrics,
  useProvidePersister,
  useProvideQueries,
  useProvideRelationships,
  useProvideStore,
  useProvideSynchronizer,
  useQueries,
  useQueriesIds,
  useQueriesOrQueriesById,
  useQueryIds,
  useRedoInformation,
  useRelationshipIds,
  useRelationships,
  useRelationshipsIds,
  useRelationshipsOrRelationshipsById,
  useRemoteRowId,
  useRemoteRowIdListener,
  useResultCell,
  useResultCellIds,
  useResultCellIdsListener,
  useResultCellListener,
  useResultRow,
  useResultRowCount,
  useResultRowCountListener,
  useResultRowIds,
  useResultRowIdsListener,
  useResultRowListener,
  useResultSortedRowIds,
  useResultSortedRowIdsListener,
  useResultTable,
  useResultTableCellIds,
  useResultTableCellIdsListener,
  useResultTableListener,
  useRow,
  useRowCount,
  useRowCountListener,
  useRowIds,
  useRowIdsListener,
  useRowListener,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetParamValueCallback,
  useSetParamValuesCallback,
  useSetPartialRowCallback,
  useSetPartialValuesCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetTablesCallback,
  useSetValueCallback,
  useSetValuesCallback,
  useSliceIds,
  useSliceIdsListener,
  useSliceRowIds,
  useSliceRowIdsListener,
  useSortedRowIds,
  useSortedRowIdsListener,
  useSortedRowIdsListenerImpl,
  useStartTransactionListener,
  useStore,
  useStoreIds,
  useStoreOrStoreById,
  useStores,
  useSynchronizer,
  useSynchronizerIds,
  useSynchronizerOrSynchronizerById,
  useSynchronizerStatus,
  useSynchronizerStatusListener,
  useTable,
  useTableCellIds,
  useTableCellIdsListener,
  useTableIds,
  useTableIdsListener,
  useTableListener,
  useTables,
  useTablesListener,
  useUndoInformation,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValues,
  useValuesListener,
  useWillFinishTransactionListener
};
