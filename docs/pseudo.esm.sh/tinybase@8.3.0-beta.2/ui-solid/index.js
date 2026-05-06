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
} from "https://esm.sh/solid-js@^1.9.12";
import h from "https://esm.sh/solid-js@^1.9.12/h";
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
var getArg = (value) => value;
var arrayNew = (size2, cb) => arrayMap(new Array(size2).fill(0), (_, index) => cb(index));
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual = (value1, value2) => isArray(value1) && isArray(value2) ? arrayIsEqual(value1, value2) : value1 === value2;
var arrayMap = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size(array) == 0;
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
var objIsEqual = (obj1, obj2, isEqual2 = (value1, value2) => value1 === value2) => {
  const entries1 = objEntries(obj1);
  return size(entries1) === objSize(obj2) && arrayEvery(
    entries1,
    ([index, value1]) => isObject(value1) ? (
      /* istanbul ignore next */
      isObject(obj2[index]) ? objIsEqual(obj2[index], value1, isEqual2) : false
    ) : isEqual2(value1, obj2[index])
  );
};
var getValue = (value) => isFunction(value) ? value() : value;
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
var useThings = (offset) => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT$1;
  return () => ({ ...contextValue()[offset * 2 + 1] });
};
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return () => {
    const resolvedThingOrThingId = getValue(thingOrThingId);
    return isUndefined(resolvedThingOrThingId) || isString(resolvedThingOrThingId) ? thing() : resolvedThingOrThingId;
  };
};
var useProvideThing = (thingId, thing, offset) => {
  const contextValue = useContext(Context)?.value ?? EMPTY_CONTEXT$1;
  createRenderEffect(() => {
    const { 16: addExtraThingById, 17: delExtraThingById } = untrack(contextValue);
    addExtraThingById?.(offset, thingId, thing);
    onCleanup(() => delExtraThingById?.(offset, thingId));
  });
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
var EMPTY_CONTEXT = () => [];
var Provider = (props) => {
  const parentValue = useContext(Context)?.value ?? EMPTY_CONTEXT;
  const [extraThingsById, setExtraThingsById] = createSignal(
    arrayNew(8, () => ({}))
  );
  const addExtraThingById = (thingOffset, id, thing) => {
    setExtraThingsById(
      (extraThingsById2) => objGet(extraThingsById2[thingOffset], id) == thing ? extraThingsById2 : arrayWith(extraThingsById2, thingOffset, {
        ...extraThingsById2[thingOffset],
        [id]: thing
      })
    );
  };
  const delExtraThingById = (thingOffset, id) => {
    setExtraThingsById(
      (extraThingsById2) => !objHas(extraThingsById2[thingOffset], id) ? extraThingsById2 : arrayWith(
        extraThingsById2,
        thingOffset,
        objDel(extraThingsById2[thingOffset], id)
      )
    );
  };
  const contextValue = createMemo(() => [
    ...mergeParentThings(
      OFFSET_STORE,
      parentValue(),
      props.store,
      props.storesById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_METRICS,
      parentValue(),
      props.metrics,
      props.metricsById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_INDEXES,
      parentValue(),
      props.indexes,
      props.indexesById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_RELATIONSHIPS,
      parentValue(),
      props.relationships,
      props.relationshipsById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_QUERIES,
      parentValue(),
      props.queries,
      props.queriesById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_CHECKPOINTS,
      parentValue(),
      props.checkpoints,
      props.checkpointsById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_PERSISTER,
      parentValue(),
      props.persister,
      props.persistersById,
      extraThingsById()
    ),
    ...mergeParentThings(
      OFFSET_SYNCHRONIZER,
      parentValue(),
      props.synchronizer,
      props.synchronizersById,
      extraThingsById()
    ),
    addExtraThingById,
    delExtraThingById
  ]);
  return /* @__PURE__ */ h(
    Context.Provider,
    { value: { value: contextValue } },
    () => props.children
  );
};
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
var useCreate = (store, create) => {
  const [thing, setThing] = createSignal();
  createEffect(() => {
    const resolvedStore = getThing(store);
    const newThing = resolvedStore ? create(resolvedStore) : void 0;
    setThing(() => newThing);
    onCleanup(() => newThing?.destroy?.());
  });
  return thing;
};
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
var useListener = (listenable, thing, listener, preListenerArgGetters = EMPTY_LISTENER_ARG_GETTERS, ...postListenerArgGetters) => createRenderEffect(() => {
  const cleanup = addAndDelListener(
    getThing(thing),
    listenable,
    ...arrayMap(preListenerArgGetters, getThing),
    listener,
    ...arrayMap(postListenerArgGetters, getThing)
  );
  onCleanup(cleanup);
});
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
var useQueriesSetCallback = (queriesOrQueriesId, settable, get, then, ...args) => useSetCallback(
  useQueriesOrQueriesById(queriesOrQueriesId),
  settable,
  get,
  then,
  EMPTY_STRING,
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
var useCheckpointAction = (checkpointsOrCheckpointsId, action, arg) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  return () => getThing(checkpoints)?.[action](arg);
};
var useSortedRowIdsImpl = (tableId, cellId, descending, offset, limit, storeOrStoreId) => useListenable(
  SORTED_ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId, cellId, descending, offset, limit]
);
var useSortedRowIdsListenerImpl = (tableId, cellId, descending, offset, limit, listener, mutator, storeOrStoreId) => useListener(
  SORTED_ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, cellId, descending, offset, limit],
  mutator
);
var useCreateStore = (create) => {
  const store = createMemo(create);
  return store;
};
var useStoreIds = () => useThingIds(OFFSET_STORE);
var useStore = (id) => useThing(id, OFFSET_STORE);
var useStores = () => useThings(OFFSET_STORE);
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
var useProvideStore = (storeId, store) => useProvideThing(storeId, store, OFFSET_STORE);
var useCreateMergeableStore = (create) => {
  const mergeableStore = createMemo(create);
  return mergeableStore;
};
var useHasTables = (storeOrStoreId) => useListenable(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  6,
  []
);
var useTables = (storeOrStoreId) => useListenable(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  0
  /* Object */
);
var useTablesState = (storeOrStoreId) => [
  useTables(storeOrStoreId),
  useSetTablesCallback(getArg, storeOrStoreId)
];
var useTableIds = (storeOrStoreId) => useListenable(
  TABLE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1
  /* Array */
);
var useHasTable = (tableId, storeOrStoreId) => useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 6, [
  tableId
]);
var useTable = (tableId, storeOrStoreId) => useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 0, [
  tableId
]);
var useTableState = (tableId, storeOrStoreId) => [
  useTable(tableId, storeOrStoreId),
  useSetTableCallback(tableId, getArg, storeOrStoreId)
];
var useTableCellIds = (tableId, storeOrStoreId) => useListenable(
  TABLE + CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId]
);
var useHasTableCell = (tableId, cellId, storeOrStoreId) => useListenable(
  TABLE + CELL,
  useStoreOrStoreById(storeOrStoreId),
  6,
  [tableId, cellId]
);
var useRowCount = (tableId, storeOrStoreId) => useListenable(
  ROW_COUNT,
  useStoreOrStoreById(storeOrStoreId),
  7,
  [tableId]
);
var useRowIds = (tableId, storeOrStoreId) => useListenable(ROW_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
  tableId
]);
var useSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending, offset, limit, storeOrStoreId) => isObject(tableIdOrArgs) ? useSortedRowIdsImpl(
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
var useHasRow = (tableId, rowId, storeOrStoreId) => useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 6, [
  tableId,
  rowId
]);
var useRow = (tableId, rowId, storeOrStoreId) => useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 0, [
  tableId,
  rowId
]);
var useRowState = (tableId, rowId, storeOrStoreId) => [
  useRow(tableId, rowId, storeOrStoreId),
  useSetRowCallback(tableId, rowId, getArg, storeOrStoreId)
];
var useCellIds = (tableId, rowId, storeOrStoreId) => useListenable(CELL_IDS, useStoreOrStoreById(storeOrStoreId), 1, [
  tableId,
  rowId
]);
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
var useCellState = (tableId, rowId, cellId, storeOrStoreId) => [
  useCell(tableId, rowId, cellId, storeOrStoreId),
  useSetCellCallback(tableId, rowId, cellId, getArg, storeOrStoreId)
];
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
var useValuesState = (storeOrStoreId) => [
  useValues(storeOrStoreId),
  useSetValuesCallback(getArg, storeOrStoreId)
];
var useValueIds = (storeOrStoreId) => useListenable(
  VALUE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1
  /* Array */
);
var useHasValue = (valueId, storeOrStoreId) => useListenable(VALUE, useStoreOrStoreById(storeOrStoreId), 6, [
  valueId
]);
var useValue = (valueId, storeOrStoreId) => useListenable(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  5,
  [valueId]
);
var useValueState = (valueId, storeOrStoreId) => [
  useValue(valueId, storeOrStoreId),
  useSetValueCallback(valueId, getArg, storeOrStoreId)
];
var useSetTablesCallback = (getTables, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, TABLES, getTables, then);
var useSetTableCallback = (tableId, getTable, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, TABLE, getTable, then, tableId);
var useSetRowCallback = (tableId, rowId, getRow, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, ROW, getRow, then, tableId, rowId);
var useAddRowCallback = (tableId, getRow, storeOrStoreId, then = getUndefined, reuseRowIds = true) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (parameter) => ifNotUndefined(
    getThing(store),
    (resolvedStore) => ifNotUndefined(
      getRow(parameter, resolvedStore),
      (row) => then(
        resolvedStore.addRow(
          isFunction(tableId) ? tableId(parameter, resolvedStore) : tableId,
          row,
          reuseRowIds
        ),
        resolvedStore,
        row
      )
    )
  );
};
var useSetPartialRowCallback = (tableId, rowId, getPartialRow, storeOrStoreId, then) => useStoreSetCallback(
  storeOrStoreId,
  PARTIAL + ROW,
  getPartialRow,
  then,
  tableId,
  rowId
);
var useSetCellCallback = (tableId, rowId, cellId, getCell, storeOrStoreId, then) => useStoreSetCallback(
  storeOrStoreId,
  CELL,
  getCell,
  then,
  tableId,
  rowId,
  cellId
);
var useSetValuesCallback = (getValues, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, VALUES, getValues, then);
var useSetPartialValuesCallback = (getPartialValues, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, PARTIAL + VALUES, getPartialValues, then);
var useSetValueCallback = (valueId, getValue2, storeOrStoreId, then) => useStoreSetCallback(storeOrStoreId, VALUE, getValue2, then, valueId);
var useDelTablesCallback = (storeOrStoreId, then) => useDel(storeOrStoreId, TABLES, then);
var useDelTableCallback = (tableId, storeOrStoreId, then) => useDel(storeOrStoreId, TABLE, then, tableId);
var useDelRowCallback = (tableId, rowId, storeOrStoreId, then) => useDel(storeOrStoreId, ROW, then, tableId, rowId);
var useDelCellCallback = (tableId, rowId, cellId, forceDel, storeOrStoreId, then) => useDel(storeOrStoreId, CELL, then, tableId, rowId, cellId, forceDel);
var useDelValuesCallback = (storeOrStoreId, then) => useDel(storeOrStoreId, VALUES, then);
var useDelValueCallback = (valueId, storeOrStoreId, then) => useDel(storeOrStoreId, VALUE, then, valueId);
var useHasTablesListener = (listener, mutator, storeOrStoreId) => useListener(
  HAS + TABLES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [],
  mutator
);
var useTablesListener = (listener, mutator, storeOrStoreId) => useListener(
  TABLES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  EMPTY_LISTENER_ARG_GETTERS,
  mutator
);
var useTableIdsListener = (listener, mutator, storeOrStoreId) => useListener(
  TABLE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  EMPTY_LISTENER_ARG_GETTERS,
  mutator
);
var useHasTableListener = (tableId, listener, mutator, storeOrStoreId) => useListener(
  HAS + TABLE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId],
  mutator
);
var useTableListener = (tableId, listener, mutator, storeOrStoreId) => useListener(
  TABLE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId],
  mutator
);
var useTableCellIdsListener = (tableId, listener, mutator, storeOrStoreId) => useListener(
  TABLE + CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId],
  mutator
);
var useHasTableCellListener = (tableId, cellId, listener, mutator, storeOrStoreId) => useListener(
  HAS + TABLE + CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, cellId],
  mutator
);
var useRowCountListener = (tableId, listener, mutator, storeOrStoreId) => useListener(
  ROW_COUNT,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId],
  mutator
);
var useRowIdsListener = (tableId, listener, mutator, storeOrStoreId) => useListener(
  ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId],
  mutator
);
var useSortedRowIdsListener = (tableIdOrArgs, cellIdOrListener, descendingOrMutator, offsetOrStoreOrStoreId, limit, listener, mutator, storeOrStoreId) => isObject(tableIdOrArgs) ? useSortedRowIdsListenerImpl(
  tableIdOrArgs.tableId,
  tableIdOrArgs.cellId,
  tableIdOrArgs.descending ?? false,
  tableIdOrArgs.offset ?? 0,
  tableIdOrArgs.limit,
  cellIdOrListener,
  descendingOrMutator,
  offsetOrStoreOrStoreId
) : useSortedRowIdsListenerImpl(
  tableIdOrArgs,
  cellIdOrListener,
  descendingOrMutator ?? false,
  offsetOrStoreOrStoreId ?? 0,
  limit,
  listener,
  mutator,
  storeOrStoreId
);
var useHasRowListener = (tableId, rowId, listener, mutator, storeOrStoreId) => useListener(
  HAS + ROW,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, rowId],
  mutator
);
var useRowListener = (tableId, rowId, listener, mutator, storeOrStoreId) => useListener(
  ROW,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, rowId],
  mutator
);
var useCellIdsListener = (tableId, rowId, listener, mutator, storeOrStoreId) => useListener(
  CELL_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, rowId],
  mutator
);
var useHasCellListener = (tableId, rowId, cellId, listener, mutator, storeOrStoreId) => useListener(
  HAS + CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, rowId, cellId],
  mutator
);
var useCellListener = (tableId, rowId, cellId, listener, mutator, storeOrStoreId) => useListener(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [tableId, rowId, cellId],
  mutator
);
var useHasValuesListener = (listener, mutator, storeOrStoreId) => useListener(
  HAS + VALUES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [],
  mutator
);
var useValuesListener = (listener, mutator, storeOrStoreId) => useListener(
  VALUES,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  EMPTY_LISTENER_ARG_GETTERS,
  mutator
);
var useValueIdsListener = (listener, mutator, storeOrStoreId) => useListener(
  VALUE_IDS,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  EMPTY_LISTENER_ARG_GETTERS,
  mutator
);
var useHasValueListener = (valueId, listener, mutator, storeOrStoreId) => useListener(
  HAS + VALUE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [valueId],
  mutator
);
var useValueListener = (valueId, listener, mutator, storeOrStoreId) => useListener(
  VALUE,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  [valueId],
  mutator
);
var useStartTransactionListener = (listener, storeOrStoreId) => useListener(
  "Start" + TRANSACTION,
  useStoreOrStoreById(storeOrStoreId),
  listener
);
var useWillFinishTransactionListener = (listener, storeOrStoreId) => useListener(
  "Will" + FINISH + TRANSACTION,
  useStoreOrStoreById(storeOrStoreId),
  listener
);
var useDidFinishTransactionListener = (listener, storeOrStoreId) => useListener(
  "Did" + FINISH + TRANSACTION,
  useStoreOrStoreById(storeOrStoreId),
  listener
);
var useCreateMetrics = (store, create) => useCreate(store, create);
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
  5,
  [metricId]
);
var useMetricListener = (metricId, listener, metricsOrMetricsId) => useListener(METRIC, useMetricsOrMetricsById(metricsOrMetricsId), listener, [
  metricId
]);
var useCreateIndexes = (store, create) => useCreate(store, create);
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
var useSliceIdsListener = (indexId, listener, indexesOrIndexesId) => useListener(
  SLICE + IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  listener,
  [indexId]
);
var useSliceRowIdsListener = (indexId, sliceId, listener, indexesOrIndexesId) => useListener(
  SLICE + ROW_IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  listener,
  [indexId, sliceId]
);
var useCreateRelationships = (store, create) => useCreate(store, create);
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
  5,
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
var useRemoteRowIdListener = (relationshipId, localRowId, listener, relationshipsOrRelationshipsId) => useListener(
  REMOTE_ROW_ID,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  listener,
  [relationshipId, localRowId]
);
var useLocalRowIdsListener = (relationshipId, remoteRowId, listener, relationshipsOrRelationshipsId) => useListener(
  LOCAL + ROW_IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  listener,
  [relationshipId, remoteRowId]
);
var useLinkedRowIdsListener = (relationshipId, firstRowId, listener, relationshipsOrRelationshipsId) => useListener(
  LINKED + ROW_IDS,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  listener,
  [relationshipId, firstRowId]
);
var useCreateQueries = (store, create) => useCreate(store, create);
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
  7,
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
  5,
  [queryId, rowId, cellId]
);
var useResultTableListener = (queryId, listener, queriesOrQueriesId) => useListener(
  RESULT + TABLE,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId]
);
var useResultTableCellIdsListener = (queryId, listener, queriesOrQueriesId) => useListener(
  RESULT + TABLE + CELL_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId]
);
var useResultRowCountListener = (queryId, listener, queriesOrQueriesId) => useListener(
  RESULT + ROW_COUNT,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId]
);
var useResultRowIdsListener = (queryId, listener, queriesOrQueriesId) => useListener(
  RESULT + ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId]
);
var useResultSortedRowIdsListener = (queryId, cellId, descending, offset, limit, listener, queriesOrQueriesId) => useListener(
  RESULT + SORTED_ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId, cellId, descending, offset, limit]
);
var useResultRowListener = (queryId, rowId, listener, queriesOrQueriesId) => useListener(
  RESULT + ROW,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId, rowId]
);
var useResultCellIdsListener = (queryId, rowId, listener, queriesOrQueriesId) => useListener(
  RESULT + CELL_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId, rowId]
);
var useResultCellListener = (queryId, rowId, cellId, listener, queriesOrQueriesId) => useListener(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId, rowId, cellId]
);
var useParamValues = (queryId, queriesOrQueriesId) => useListenable(
  "ParamValues",
  useQueriesOrQueriesById(queriesOrQueriesId),
  3,
  [queryId]
);
var useParamValuesState = (queryId, queriesOrQueriesId) => [
  useParamValues(queryId, queriesOrQueriesId),
  useSetParamValuesCallback(queryId, getArg, queriesOrQueriesId)
];
var useParamValue = (queryId, paramId, queriesOrQueriesId) => useListenable(
  "ParamValue",
  useQueriesOrQueriesById(queriesOrQueriesId),
  4,
  [queryId, paramId]
);
var useParamValueState = (queryId, paramId, queriesOrQueriesId) => [
  useParamValue(queryId, paramId, queriesOrQueriesId),
  useSetParamValueCallback(queryId, paramId, getArg, queriesOrQueriesId)
];
var useParamValuesListener = (queryId, listener, queriesOrQueriesId) => useListener(
  "ParamValues",
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId]
);
var useParamValueListener = (queryId, paramId, listener, queriesOrQueriesId) => useListener(
  "ParamValue",
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  [queryId, paramId]
);
var useSetParamValueCallback = (queryId, paramId, getParamValue, queriesOrQueriesId, then) => useQueriesSetCallback(
  queriesOrQueriesId,
  "setParamValue",
  getParamValue,
  then,
  queryId,
  paramId
);
var useSetParamValuesCallback = (queryId, getParamValues, queriesOrQueriesId, then) => useQueriesSetCallback(
  queriesOrQueriesId,
  "setParamValues",
  getParamValues,
  then,
  queryId
);
var useCreateCheckpoints = (store, create) => useCreate(store, create);
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
  5,
  [checkpointId]
);
var useSetCheckpointCallback = (getCheckpoint = getUndefined, checkpointsOrCheckpointsId, then = getUndefined) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  return (parameter) => ifNotUndefined(getThing(checkpoints), (resolvedCheckpoints) => {
    const label = getCheckpoint(parameter);
    then(
      resolvedCheckpoints.addCheckpoint(label),
      resolvedCheckpoints,
      label
    );
  });
};
var useGoBackwardCallback = (checkpointsOrCheckpointsId) => useCheckpointAction(checkpointsOrCheckpointsId, "goBackward");
var useGoForwardCallback = (checkpointsOrCheckpointsId) => useCheckpointAction(checkpointsOrCheckpointsId, "goForward");
var useGoToCallback = (getCheckpointId, checkpointsOrCheckpointsId, then = getUndefined) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  return (parameter) => ifNotUndefined(
    getThing(checkpoints),
    (resolvedCheckpoints) => ifNotUndefined(
      getCheckpointId(parameter),
      (checkpointId) => then(resolvedCheckpoints.goTo(checkpointId), checkpointId)
    )
  );
};
var useUndoInformation = (checkpointsOrCheckpointsId) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  const [backwardIds, currentId] = getThing(useCheckpointIds(checkpoints));
  return [
    !arrayIsEmpty(backwardIds),
    useGoBackwardCallback(checkpoints),
    currentId,
    ifNotUndefined(
      currentId,
      (id) => getThing(checkpoints)?.getCheckpoint(id)
    ) ?? EMPTY_STRING
  ];
};
var useRedoInformation = (checkpointsOrCheckpointsId) => {
  const checkpoints = useCheckpointsOrCheckpointsById(
    checkpointsOrCheckpointsId
  );
  const [, , [forwardId]] = getThing(useCheckpointIds(checkpoints));
  return [
    !isUndefined(forwardId),
    useGoForwardCallback(checkpoints),
    forwardId,
    ifNotUndefined(
      forwardId,
      (id) => getThing(checkpoints)?.getCheckpoint(id)
    ) ?? EMPTY_STRING
  ];
};
var useCheckpointIdsListener = (listener, checkpointsOrCheckpointsId) => useListener(
  CHECKPOINT + IDS,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  listener
);
var useCheckpointListener = (checkpointId, listener, checkpointsOrCheckpointsId) => useListener(
  CHECKPOINT,
  useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
  listener,
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
var usePersisterIds = () => useThingIds(OFFSET_PERSISTER);
var usePersister = (id) => useThing(id, OFFSET_PERSISTER);
var usePersisterOrPersisterById = (persisterOrPersisterId) => useThingOrThingById(persisterOrPersisterId, OFFSET_PERSISTER);
var useProvidePersister = (persisterId, persister) => useProvideThing(persisterId, persister, OFFSET_PERSISTER);
var usePersisterStatus = (persisterOrPersisterId) => useListenable(
  STATUS,
  usePersisterOrPersisterById(persisterOrPersisterId),
  7,
  []
);
var usePersisterStatusListener = (listener, persisterOrPersisterId) => useListener(
  STATUS,
  usePersisterOrPersisterById(persisterOrPersisterId),
  listener,
  []
);
var useCreateSynchronizer = (store, create, destroy) => {
  const [synchronizer, setSynchronizer] = createSignal();
  createEffect(() => {
    let current = true;
    let createdSynchronizer;
    const destroySynchronizer = (synchronizer2) => {
      synchronizer2.destroy();
      destroy?.(synchronizer2);
    };
    (async () => {
      const resolvedStore = getThing(store);
      createdSynchronizer = resolvedStore ? await create(resolvedStore) : void 0;
      if (!current) {
        if (createdSynchronizer) {
          destroySynchronizer(createdSynchronizer);
        }
        return;
      }
      setSynchronizer(() => createdSynchronizer);
    })();
    onCleanup(() => {
      current = false;
      setSynchronizer(() => void 0);
      if (createdSynchronizer) {
        destroySynchronizer(createdSynchronizer);
      }
    });
  });
  return synchronizer;
};
var useSynchronizerIds = () => useThingIds(OFFSET_SYNCHRONIZER);
var useSynchronizer = (id) => useThing(id, OFFSET_SYNCHRONIZER);
var useSynchronizerOrSynchronizerById = (synchronizerOrSynchronizerId) => useThingOrThingById(synchronizerOrSynchronizerId, OFFSET_SYNCHRONIZER);
var useProvideSynchronizer = (persisterId, persister) => useProvideThing(persisterId, persister, OFFSET_SYNCHRONIZER);
var useSynchronizerStatus = (synchronizerOrSynchronizerId) => useListenable(
  STATUS,
  useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
  7,
  []
);
var useSynchronizerStatusListener = (listener, synchronizerOrSynchronizerId) => useListener(
  STATUS,
  useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
  listener,
  []
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
  return () => wrap(
    getValue(checkpoint) ?? EMPTY_STRING,
    void 0,
    props.debugIds,
    props.checkpointId
  );
};
var ResultCellView = (props) => {
  const resultCell = useResultCell(
    () => props.queryId,
    () => props.rowId,
    () => props.cellId,
    () => props.queries
  );
  return () => wrap(
    EMPTY_STRING + (getValue(resultCell) ?? EMPTY_STRING),
    void 0,
    props.debugIds,
    props.cellId
  );
};
var ResultRowView = (props) => {
  const resultCellIds = useResultCellIds(
    () => props.queryId,
    () => props.rowId,
    () => props.queries
  );
  return () => {
    const ResultCell = props.resultCellComponent ?? ResultCellView;
    return wrap(
      arrayMap(
        getValue(resultCellIds),
        (cellId) => /* @__PURE__ */ h(ResultCell, {
          ...getProps(props.getResultCellComponentProps, cellId),
          queryId: props.queryId,
          rowId: props.rowId,
          cellId,
          queries: props.queries,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      props.rowId
    );
  };
};
var CellView = (props) => {
  const cell = useCell(
    () => props.tableId,
    () => props.rowId,
    () => props.cellId,
    () => props.store
  );
  return () => wrap(
    EMPTY_STRING + (getValue(cell) ?? EMPTY_STRING),
    void 0,
    props.debugIds,
    props.cellId
  );
};
var useCustomOrDefaultCellIds = (customCellIds, tableId, rowId, store) => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return () => getValue(customCellIds) ?? getValue(defaultCellIds);
};
var RowView = (props) => {
  const cellIds = useCustomOrDefaultCellIds(
    () => props.customCellIds,
    () => props.tableId,
    () => props.rowId,
    () => props.store
  );
  return () => {
    const Cell = props.cellComponent ?? CellView;
    return wrap(
      arrayMap(
        getValue(cellIds),
        (cellId) => /* @__PURE__ */ h(Cell, {
          ...getProps(props.getCellComponentProps, cellId),
          tableId: props.tableId,
          rowId: props.rowId,
          cellId,
          store: props.store,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      props.rowId
    );
  };
};
var tableView = (props, rowIds) => {
  return () => {
    const Row = props.rowComponent ?? RowView;
    return wrap(
      arrayMap(
        getValue(rowIds),
        (rowId) => /* @__PURE__ */ h(Row, {
          ...getProps(props.getRowComponentProps, rowId),
          tableId: props.tableId,
          rowId,
          customCellIds: props.customCellIds,
          store: props.store,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      props.tableId
    );
  };
};
var resultTableView = (props, rowIds) => {
  return () => {
    const ResultRow = props.resultRowComponent ?? ResultRowView;
    return wrap(
      arrayMap(
        getValue(rowIds),
        (rowId) => /* @__PURE__ */ h(ResultRow, {
          ...getProps(props.getResultRowComponentProps, rowId),
          queryId: props.queryId,
          rowId,
          queries: props.queries,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      props.queryId
    );
  };
};
var useComponentPerRow = (props, getRowIdsHook, rowId) => {
  const resolvedRelationships = useRelationshipsOrRelationshipsById(
    () => props.relationships
  );
  const rowIds = getRowIdsHook(
    () => props.relationshipId,
    rowId,
    resolvedRelationships
  );
  return () => {
    const Row = props.rowComponent ?? RowView;
    const [_relationship, store, localTableId] = getRelationshipsStoreTableIds(
      getValue(resolvedRelationships),
      props.relationshipId
    );
    return wrap(
      arrayMap(
        getValue(rowIds),
        (localRowId) => /* @__PURE__ */ h(Row, {
          ...getProps(props.getRowComponentProps, localRowId),
          tableId: localTableId,
          rowId: localRowId,
          store,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      getValue(rowId)
    );
  };
};
var getUseCheckpointView = (getCheckpoints) => (props) => {
  const resolvedCheckpoints = useCheckpointsOrCheckpointsById(
    () => props.checkpoints
  );
  const checkpointIds = useCheckpointIds(resolvedCheckpoints);
  return () => {
    const Checkpoint = props.checkpointComponent ?? CheckpointView;
    return wrap(
      arrayMap(
        getCheckpoints(getValue(checkpointIds)),
        (checkpointId) => /* @__PURE__ */ h(Checkpoint, {
          ...getProps(props.getCheckpointComponentProps, checkpointId),
          checkpoints: getValue(resolvedCheckpoints),
          checkpointId,
          debugIds: props.debugIds
        })
      ),
      props.separator
    );
  };
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
var SliceView = (props) => {
  const resolvedIndexes = useIndexesOrIndexesById(() => props.indexes);
  const rowIds = useSliceRowIds(
    () => props.indexId,
    () => props.sliceId,
    resolvedIndexes
  );
  return () => {
    const Row = props.rowComponent ?? RowView;
    const [_indexesValue, store, tableId] = getIndexStoreTableId(
      getValue(resolvedIndexes),
      props.indexId
    );
    return wrap(
      arrayMap(
        getValue(rowIds),
        (rowId) => /* @__PURE__ */ h(Row, {
          ...getProps(props.getRowComponentProps, rowId),
          tableId,
          rowId,
          store,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      props.sliceId
    );
  };
};
var IndexView = (props) => {
  const sliceIds = useSliceIds(
    () => props.indexId,
    () => props.indexes
  );
  return () => {
    const Slice = props.sliceComponent ?? SliceView;
    return wrap(
      arrayMap(
        getValue(sliceIds),
        (sliceId) => /* @__PURE__ */ h(Slice, {
          ...getProps(props.getSliceComponentProps, sliceId),
          indexId: props.indexId,
          sliceId,
          indexes: props.indexes,
          debugIds: props.debugIds
        })
      ),
      props.separator,
      props.debugIds,
      props.indexId
    );
  };
};
var LinkedRowsView = (props) => useComponentPerRow(props, useLinkedRowIds, () => props.firstRowId);
var LocalRowsView = (props) => useComponentPerRow(props, useLocalRowIds, () => props.remoteRowId);
var MetricView = (props) => {
  const metric = useMetric(
    () => props.metricId,
    () => props.metrics
  );
  return () => wrap(
    getValue(metric) ?? EMPTY_STRING,
    void 0,
    props.debugIds,
    props.metricId
  );
};
var RemoteRowView = (props) => {
  const resolvedRelationships = useRelationshipsOrRelationshipsById(
    () => props.relationships
  );
  const rowId = useRemoteRowId(
    () => props.relationshipId,
    () => props.localRowId,
    resolvedRelationships
  );
  return () => {
    const Row = props.rowComponent ?? RowView;
    const [_relationshipsValue, store, , remoteTableId] = getRelationshipsStoreTableIds(
      getValue(resolvedRelationships),
      props.relationshipId
    );
    const remoteRowId = getValue(rowId);
    return wrap(
      isUndefined(remoteTableId) || isUndefined(remoteRowId) ? null : /* @__PURE__ */ h(Row, {
        ...getProps(props.getRowComponentProps, remoteRowId),
        tableId: remoteTableId,
        rowId: remoteRowId,
        store,
        debugIds: props.debugIds
      }),
      void 0,
      props.debugIds,
      props.localRowId
    );
  };
};
var ResultSortedTableView = (props) => resultTableView(
  props,
  useResultSortedRowIds(
    () => props.queryId,
    () => props.cellId,
    () => props.descending,
    () => props.offset,
    () => props.limit,
    () => props.queries
  )
);
var ResultTableView = (props) => resultTableView(
  props,
  useResultRowIds(
    () => props.queryId,
    () => props.queries
  )
);
var SortedTableView = (props) => tableView(
  props,
  useSortedRowIds(
    () => props.tableId,
    () => props.cellId,
    () => props.descending,
    () => props.offset,
    () => props.limit,
    () => props.store
  )
);
var TableView = (props) => tableView(
  props,
  useRowIds(
    () => props.tableId,
    () => props.store
  )
);
var TablesView = (props) => {
  const tableIds = useTableIds(() => props.store);
  return () => {
    const Table = props.tableComponent ?? TableView;
    return wrap(
      arrayMap(
        getValue(tableIds),
        (tableId) => /* @__PURE__ */ h(Table, {
          ...getProps(props.getTableComponentProps, tableId),
          tableId,
          store: props.store,
          debugIds: props.debugIds
        })
      ),
      props.separator
    );
  };
};
var ValueView = (props) => {
  const value = useValue(
    () => props.valueId,
    () => props.store
  );
  return () => wrap(
    EMPTY_STRING + (getValue(value) ?? EMPTY_STRING),
    void 0,
    props.debugIds,
    props.valueId
  );
};
var ValuesView = (props) => {
  const valueIds = useValueIds(() => props.store);
  return () => {
    const Value = props.valueComponent ?? ValueView;
    return wrap(
      arrayMap(
        getValue(valueIds),
        (valueId) => /* @__PURE__ */ h(Value, {
          ...getProps(props.getValueComponentProps, valueId),
          valueId,
          store: props.store,
          debugIds: props.debugIds
        })
      ),
      props.separator
    );
  };
};
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
  useCellState,
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
  useParamValue,
  useParamValueListener,
  useParamValueState,
  useParamValues,
  useParamValuesListener,
  useParamValuesState,
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
  useRowState,
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
  useTableState,
  useTables,
  useTablesListener,
  useTablesState,
  useUndoInformation,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValueState,
  useValues,
  useValuesListener,
  useValuesState,
  useWillFinishTransactionListener
};
