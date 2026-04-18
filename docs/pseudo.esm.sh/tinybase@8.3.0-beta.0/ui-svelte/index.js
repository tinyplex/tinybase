// dist/ui-svelte/index.js
import { getContext, setContext, untrack } from "https://esm.sh/svelte@^5.55.4";
import * as $ from "https://esm.sh/svelte@^5.55.4/internal/client";
import "https://esm.sh/svelte@^5.55.4/internal/disclose-version";
import { createSubscriber } from "https://esm.sh/svelte@^5.55.4/reactivity";
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
var TRANSACTION = "Transaction";
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
var isUndefined = (thing) => thing === void 0;
var hasWindow = () => !isUndefined(GLOBAL.window);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isString = (thing) => getTypeOf(thing) == STRING;
var isFunction = (thing) => getTypeOf(thing) == FUNCTION;
var noop2 = () => {
};
var object = Object;
var objIds = object.keys;
var objGet = (obj, id) => ifNotUndefined(obj, (obj2) => obj2[id]);
var TINYBASE_CONTEXT_KEY = TINYBASE + "_uisc";
var ReactiveHandle = class {
  #get;
  #sub;
  constructor(getCurrent, subscribe) {
    this.#get = getCurrent;
    this.#sub = subscribe;
  }
  get current() {
    this.#sub();
    return this.#get();
  }
};
var WritableHandle = class extends ReactiveHandle {
  #set;
  constructor(getCurrent, setCurrent, subscribe) {
    super(getCurrent, subscribe);
    this.#set = setCurrent;
  }
  get current() {
    return super.current;
  }
  set current(value) {
    this.#set(value);
  }
};
var EMPTY_ARR = [];
var EMPTY_OBJ = {};
var DEFAULT_CHECKPOINT_IDS = [EMPTY_ARR, void 0, EMPTY_ARR];
var OFFSET_STORE = 0;
var OFFSET_METRICS = 1;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES = 4;
var OFFSET_CHECKPOINTS = 5;
var OFFSET_PERSISTER = 6;
var OFFSET_SYNCHRONIZER = 7;
var maybeGet = (thing) => isFunction(thing) ? thing() : thing;
var getContextValue = () => getContext(TINYBASE_CONTEXT_KEY) ?? [];
var getThing = (contextValue, thingOrThingId, offset) => isUndefined(thingOrThingId) ? contextValue[offset * 2] : isString(thingOrThingId) ? objGet(contextValue[offset * 2 + 1], thingOrThingId) : thingOrThingId;
var getProvidedThing = (thingOrThingId, offset) => getThing(getContextValue(), thingOrThingId, offset);
var resolveProvidedThing = (thingOrThingId, offset) => {
  const contextValue = getContextValue();
  return () => getThing(contextValue, maybeGet(thingOrThingId), offset);
};
var getThingIds = (contextValue, offset) => objIds(contextValue[offset * 2 + 1] ?? EMPTY_OBJ);
var resolveStore = (storeOrStoreId) => resolveProvidedThing(storeOrStoreId, OFFSET_STORE);
var resolveMetrics = (metricsOrMetricsId) => resolveProvidedThing(metricsOrMetricsId, OFFSET_METRICS);
var resolveIndexes = (indexesOrIndexesId) => resolveProvidedThing(indexesOrIndexesId, OFFSET_INDEXES);
var resolveRelationships = (relationshipsOrRelationshipsId) => resolveProvidedThing(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var resolveQueries = (queriesOrQueriesId) => resolveProvidedThing(queriesOrQueriesId, OFFSET_QUERIES);
var resolveCheckpoints = (checkpointsOrCheckpointsId) => resolveProvidedThing(checkpointsOrCheckpointsId, OFFSET_CHECKPOINTS);
var resolvePersister = (persisterOrPersisterId) => resolveProvidedThing(persisterOrPersisterId, OFFSET_PERSISTER);
var resolveSynchronizer = (synchronizerOrSynchronizerId) => resolveProvidedThing(synchronizerOrSynchronizerId, OFFSET_SYNCHRONIZER);
var createListenable = (getThing2, listenable, defaultValue, getArgs = () => EMPTY_ARR, isHas) => {
  const getListenableMethod = (isHas ? _HAS : GET) + listenable;
  const addListenableMethod = ADD + (isHas ? HAS : "") + listenable + LISTENER;
  let subscribe = $.state($.proxy(noop2));
  if (hasWindow()) {
    $.user_effect(() => {
      const thing = getThing2();
      const args = getArgs();
      $.set(
        subscribe,
        createSubscriber((update) => {
          const listenerId = thing?.[addListenableMethod]?.(...args, update);
          return () => thing?.delListener?.(listenerId);
        }),
        true
      );
    });
  }
  return new ReactiveHandle(
    () => getThing2()?.[getListenableMethod]?.(...getArgs()) ?? defaultValue,
    () => $.get(subscribe)()
  );
};
var addListenerEffect = (getThing2, listenable, listener, getPreArgs = () => EMPTY_ARR, mutator) => {
  if (hasWindow()) {
    $.user_effect(() => {
      const thing = getThing2();
      const preArgs = getPreArgs();
      const listenerId = thing?.[ADD + listenable + LISTENER]?.(
        ...preArgs,
        listener,
        ...mutator !== void 0 ? [mutator] : EMPTY_ARR
      );
      return () => thing?.delListener?.(listenerId);
    });
  }
};
var hasTables = (storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  TABLES,
  false,
  () => EMPTY_ARR,
  1
);
var getTables = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), TABLES, EMPTY_OBJ);
var getTableIds = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), TABLE_IDS, EMPTY_ARR);
var hasTable = (tableId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  TABLE,
  false,
  () => [maybeGet(tableId)],
  1
);
var getTable = (tableId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), TABLE, EMPTY_OBJ, () => [
  maybeGet(tableId)
]);
var getTableCellIds = (tableId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  TABLE + CELL_IDS,
  EMPTY_ARR,
  () => [maybeGet(tableId)]
);
var hasTableCell = (tableId, cellId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  TABLE + CELL,
  false,
  () => [maybeGet(tableId), maybeGet(cellId)],
  1
);
var getRowCount = (tableId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), ROW_COUNT, 0, () => [
  maybeGet(tableId)
]);
var getRowIds = (tableId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), ROW_IDS, EMPTY_ARR, () => [
  maybeGet(tableId)
]);
var getSortedRowIds = (tableId, cellId, descending = false, offset = 0, limit, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  SORTED_ROW_IDS,
  EMPTY_ARR,
  () => [
    maybeGet(tableId),
    maybeGet(cellId),
    maybeGet(descending),
    maybeGet(offset),
    maybeGet(limit)
  ]
);
var hasRow = (tableId, rowId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  ROW,
  false,
  () => [maybeGet(tableId), maybeGet(rowId)],
  1
);
var getRow = (tableId, rowId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), ROW, EMPTY_OBJ, () => [
  maybeGet(tableId),
  maybeGet(rowId)
]);
var getCellIds = (tableId, rowId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), CELL_IDS, EMPTY_ARR, () => [
  maybeGet(tableId),
  maybeGet(rowId)
]);
var hasCell = (tableId, rowId, cellId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  CELL,
  false,
  () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
  1
);
var getCell = (tableId, rowId, cellId, storeOrStoreId) => {
  const getStore2 = resolveStore(storeOrStoreId);
  let subscribe = $.state($.proxy(noop2));
  if (hasWindow()) {
    $.user_effect(() => {
      const store = getStore2();
      const tableIdValue = maybeGet(tableId);
      const rowIdValue = maybeGet(rowId);
      const cellIdValue = maybeGet(cellId);
      $.set(
        subscribe,
        createSubscriber((update) => {
          const listenerId = store?.addCellListener(
            tableIdValue,
            rowIdValue,
            cellIdValue,
            update
          );
          return () => store?.delListener?.(listenerId);
        }),
        true
      );
    });
  }
  return new WritableHandle(
    () => getStore2()?.getCell(
      maybeGet(tableId),
      maybeGet(rowId),
      maybeGet(cellId)
    ),
    (nextCell) => getStore2()?.setCell(
      maybeGet(tableId),
      maybeGet(rowId),
      maybeGet(cellId),
      nextCell
    ),
    () => $.get(subscribe)()
  );
};
var hasValues = (storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  VALUES,
  false,
  () => EMPTY_ARR,
  1
);
var getValues = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), VALUES, EMPTY_OBJ);
var getValueIds = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), VALUE_IDS, EMPTY_ARR);
var hasValue = (valueId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  VALUE,
  false,
  () => [maybeGet(valueId)],
  1
);
var getValue = (valueId, storeOrStoreId) => {
  const getStore2 = resolveStore(storeOrStoreId);
  let subscribe = $.state($.proxy(noop2));
  if (hasWindow()) {
    $.user_effect(() => {
      const store = getStore2();
      const valueIdValue = maybeGet(valueId);
      $.set(
        subscribe,
        createSubscriber((update) => {
          const listenerId = store?.addValueListener(valueIdValue, update);
          return () => store?.delListener?.(listenerId);
        }),
        true
      );
    });
  }
  return new WritableHandle(
    () => getStore2()?.getValue(maybeGet(valueId)),
    (nextValue) => getStore2()?.setValue(maybeGet(valueId), nextValue),
    () => $.get(subscribe)()
  );
};
var getStore = (id) => getProvidedThing(id, OFFSET_STORE);
var getStoreIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_STORE)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_STORE), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getMetrics = (id) => getProvidedThing(id, OFFSET_METRICS);
var getMetricsIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_METRICS)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_METRICS), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getMetricIds = (metricsOrMetricsId) => createListenable(resolveMetrics(metricsOrMetricsId), METRIC + IDS, EMPTY_ARR);
var getMetric = (metricId, metricsOrMetricsId) => createListenable(resolveMetrics(metricsOrMetricsId), METRIC, void 0, () => [
  maybeGet(metricId)
]);
var getIndexes = (id) => getProvidedThing(id, OFFSET_INDEXES);
var getIndexesIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_INDEXES)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_INDEXES), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getIndexIds = (indexesOrIndexesId) => createListenable(resolveIndexes(indexesOrIndexesId), INDEX + IDS, EMPTY_ARR);
var getSliceIds = (indexId, indexesOrIndexesId) => createListenable(
  resolveIndexes(indexesOrIndexesId),
  SLICE + IDS,
  EMPTY_ARR,
  () => [maybeGet(indexId)]
);
var getSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => createListenable(
  resolveIndexes(indexesOrIndexesId),
  SLICE + ROW_IDS,
  EMPTY_ARR,
  () => [maybeGet(indexId), maybeGet(sliceId)]
);
var getIndexStoreTableId = (indexesOrId, indexId) => {
  const getIndexes2 = resolveIndexes(indexesOrId);
  return {
    get store() {
      return getIndexes2()?.getStore();
    },
    get tableId() {
      return getIndexes2()?.getTableId(maybeGet(indexId));
    }
  };
};
var getQueries = (id) => getProvidedThing(id, OFFSET_QUERIES);
var getQueriesIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_QUERIES)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_QUERIES), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getQueryIds = (queriesOrQueriesId) => createListenable(resolveQueries(queriesOrQueriesId), QUERY + IDS, EMPTY_ARR);
var getResultTable = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + TABLE,
  EMPTY_OBJ,
  () => [maybeGet(queryId)]
);
var getResultTableCellIds = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + TABLE + CELL_IDS,
  EMPTY_ARR,
  () => [maybeGet(queryId)]
);
var getResultRowCount = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW_COUNT,
  0,
  () => [maybeGet(queryId)]
);
var getResultRowIds = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW_IDS,
  EMPTY_ARR,
  () => [maybeGet(queryId)]
);
var getResultSortedRowIds = (queryId, cellId, descending = false, offset = 0, limit, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + SORTED_ROW_IDS,
  EMPTY_ARR,
  () => [
    maybeGet(queryId),
    maybeGet(cellId),
    maybeGet(descending),
    maybeGet(offset),
    maybeGet(limit)
  ]
);
var getResultRow = (queryId, rowId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW,
  EMPTY_OBJ,
  () => [maybeGet(queryId), maybeGet(rowId)]
);
var getResultCellIds = (queryId, rowId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + CELL_IDS,
  EMPTY_ARR,
  () => [maybeGet(queryId), maybeGet(rowId)]
);
var getResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + CELL,
  void 0,
  () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)]
);
var getRelationships = (id) => getProvidedThing(id, OFFSET_RELATIONSHIPS);
var getRelationshipsIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_RELATIONSHIPS)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_RELATIONSHIPS), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getRelationshipIds = (relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  RELATIONSHIP + IDS,
  EMPTY_ARR
);
var getRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  REMOTE_ROW_ID,
  void 0,
  () => [maybeGet(relationshipId), maybeGet(localRowId)]
);
var getLocalRowIds = (relationshipId, remoteRowId, relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  LOCAL + ROW_IDS,
  EMPTY_ARR,
  () => [maybeGet(relationshipId), maybeGet(remoteRowId)]
);
var getLinkedRowIds = (relationshipId, firstRowId, relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  LINKED + ROW_IDS,
  EMPTY_ARR,
  () => [maybeGet(relationshipId), maybeGet(firstRowId)]
);
var getRelationshipsStoreTableIds = (relationshipsOrId, relationshipId) => {
  const getRelationships2 = resolveRelationships(relationshipsOrId);
  return {
    get store() {
      return getRelationships2()?.getStore();
    },
    get localTableId() {
      return getRelationships2()?.getLocalTableId(maybeGet(relationshipId));
    },
    get remoteTableId() {
      return getRelationships2()?.getRemoteTableId(maybeGet(relationshipId));
    }
  };
};
var getCheckpoints = (id) => getProvidedThing(id, OFFSET_CHECKPOINTS);
var getCheckpointsIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_CHECKPOINTS)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_CHECKPOINTS), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getCheckpointIds = (checkpointsOrCheckpointsId) => createListenable(
  resolveCheckpoints(checkpointsOrCheckpointsId),
  CHECKPOINT + IDS,
  DEFAULT_CHECKPOINT_IDS
);
var getCheckpoint = (checkpointId, checkpointsOrCheckpointsId) => createListenable(
  resolveCheckpoints(checkpointsOrCheckpointsId),
  CHECKPOINT,
  void 0,
  () => [maybeGet(checkpointId)]
);
var createGoBackwardCallback = (checkpointsOrCheckpointsId) => {
  const getCheckpoints2 = resolveCheckpoints(checkpointsOrCheckpointsId);
  return () => getCheckpoints2()?.goBackward();
};
var createGoForwardCallback = (checkpointsOrCheckpointsId) => {
  const getCheckpoints2 = resolveCheckpoints(checkpointsOrCheckpointsId);
  return () => getCheckpoints2()?.goForward();
};
var getPersister = (id) => getProvidedThing(id, OFFSET_PERSISTER);
var getPersisterIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_PERSISTER)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_PERSISTER), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getPersisterStatus = (persisterOrPersisterId) => createListenable(resolvePersister(persisterOrPersisterId), STATUS, 0);
var getSynchronizer = (id) => getProvidedThing(id, OFFSET_SYNCHRONIZER);
var getSynchronizerIds = () => {
  const contextValue = getContextValue();
  let ids = $.state($.proxy(getThingIds(contextValue, OFFSET_SYNCHRONIZER)));
  if (hasWindow()) {
    $.user_effect(() => {
      $.set(ids, getThingIds(contextValue, OFFSET_SYNCHRONIZER), true);
    });
  }
  return {
    get current() {
      return $.get(ids);
    }
  };
};
var getSynchronizerStatus = (synchronizerOrSynchronizerId) => createListenable(
  resolveSynchronizer(synchronizerOrSynchronizerId),
  STATUS,
  0
);
var onHasTables = (listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + TABLES,
  listener,
  () => EMPTY_ARR,
  mutator
);
var onTables = (listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  TABLES,
  listener,
  () => EMPTY_ARR,
  mutator
);
var onTableIds = (listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  TABLE_IDS,
  listener,
  () => EMPTY_ARR,
  mutator
);
var onHasTable = (tableId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + TABLE,
  listener,
  () => [maybeGet(tableId)],
  mutator
);
var onTable = (tableId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  TABLE,
  listener,
  () => [maybeGet(tableId)],
  mutator
);
var onTableCellIds = (tableId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  TABLE + CELL_IDS,
  listener,
  () => [maybeGet(tableId)],
  mutator
);
var onHasTableCell = (tableId, cellId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + TABLE + CELL,
  listener,
  () => [maybeGet(tableId), maybeGet(cellId)],
  mutator
);
var onRowCount = (tableId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  ROW_COUNT,
  listener,
  () => [maybeGet(tableId)],
  mutator
);
var onRowIds = (tableId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  ROW_IDS,
  listener,
  () => [maybeGet(tableId)],
  mutator
);
var onSortedRowIds = (tableId, cellId, descending, offset, limit, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  SORTED_ROW_IDS,
  listener,
  () => [
    maybeGet(tableId),
    maybeGet(cellId),
    maybeGet(descending),
    maybeGet(offset),
    maybeGet(limit)
  ],
  mutator
);
var onHasRow = (tableId, rowId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + ROW,
  listener,
  () => [maybeGet(tableId), maybeGet(rowId)],
  mutator
);
var onRow = (tableId, rowId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  ROW,
  listener,
  () => [maybeGet(tableId), maybeGet(rowId)],
  mutator
);
var onCellIds = (tableId, rowId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  CELL_IDS,
  listener,
  () => [maybeGet(tableId), maybeGet(rowId)],
  mutator
);
var onHasCell = (tableId, rowId, cellId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + CELL,
  listener,
  () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
  mutator
);
var onCell = (tableId, rowId, cellId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  CELL,
  listener,
  () => [maybeGet(tableId), maybeGet(rowId), maybeGet(cellId)],
  mutator
);
var onHasValues = (listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + VALUES,
  listener,
  () => EMPTY_ARR,
  mutator
);
var onValues = (listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  VALUES,
  listener,
  () => EMPTY_ARR,
  mutator
);
var onValueIds = (listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  VALUE_IDS,
  listener,
  () => EMPTY_ARR,
  mutator
);
var onHasValue = (valueId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  HAS + VALUE,
  listener,
  () => [maybeGet(valueId)],
  mutator
);
var onValue = (valueId, listener, mutator, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  VALUE,
  listener,
  () => [maybeGet(valueId)],
  mutator
);
var onStartTransaction = (listener, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  "Start" + TRANSACTION,
  listener
);
var onWillFinishTransaction = (listener, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  "Will" + FINISH + TRANSACTION,
  listener
);
var onDidFinishTransaction = (listener, storeOrStoreId) => addListenerEffect(
  resolveStore(storeOrStoreId),
  "Did" + FINISH + TRANSACTION,
  listener
);
var onMetric = (metricId, listener, metricsOrMetricsId) => addListenerEffect(
  resolveMetrics(metricsOrMetricsId),
  METRIC,
  listener,
  () => [maybeGet(metricId)]
);
var onSliceIds = (indexId, listener, indexesOrIndexesId) => addListenerEffect(
  resolveIndexes(indexesOrIndexesId),
  SLICE + IDS,
  listener,
  () => [maybeGet(indexId)]
);
var onSliceRowIds = (indexId, sliceId, listener, indexesOrIndexesId) => addListenerEffect(
  resolveIndexes(indexesOrIndexesId),
  SLICE + ROW_IDS,
  listener,
  () => [maybeGet(indexId), maybeGet(sliceId)]
);
var onRemoteRowId = (relationshipId, localRowId, listener, relationshipsOrRelationshipsId) => addListenerEffect(
  resolveRelationships(relationshipsOrRelationshipsId),
  REMOTE_ROW_ID,
  listener,
  () => [maybeGet(relationshipId), maybeGet(localRowId)]
);
var onLocalRowIds = (relationshipId, remoteRowId, listener, relationshipsOrRelationshipsId) => addListenerEffect(
  resolveRelationships(relationshipsOrRelationshipsId),
  LOCAL + ROW_IDS,
  listener,
  () => [maybeGet(relationshipId), maybeGet(remoteRowId)]
);
var onLinkedRowIds = (relationshipId, firstRowId, listener, relationshipsOrRelationshipsId) => addListenerEffect(
  resolveRelationships(relationshipsOrRelationshipsId),
  LINKED + ROW_IDS,
  listener,
  () => [maybeGet(relationshipId), maybeGet(firstRowId)]
);
var onResultTable = (queryId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + TABLE,
  listener,
  () => [maybeGet(queryId)]
);
var onResultTableCellIds = (queryId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + TABLE + CELL_IDS,
  listener,
  () => [maybeGet(queryId)]
);
var onResultRowCount = (queryId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW_COUNT,
  listener,
  () => [maybeGet(queryId)]
);
var onResultRowIds = (queryId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW_IDS,
  listener,
  () => [maybeGet(queryId)]
);
var onResultSortedRowIds = (queryId, cellId, descending, offset, limit, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + SORTED_ROW_IDS,
  listener,
  () => [
    maybeGet(queryId),
    maybeGet(cellId),
    maybeGet(descending),
    maybeGet(offset),
    maybeGet(limit)
  ]
);
var onResultRow = (queryId, rowId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW,
  listener,
  () => [maybeGet(queryId), maybeGet(rowId)]
);
var onResultCellIds = (queryId, rowId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + CELL_IDS,
  listener,
  () => [maybeGet(queryId), maybeGet(rowId)]
);
var onResultCell = (queryId, rowId, cellId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  RESULT + CELL,
  listener,
  () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)]
);
var onParamValues = (queryId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  "ParamValues",
  listener,
  () => [maybeGet(queryId)]
);
var onParamValue = (queryId, paramId, listener, queriesOrQueriesId) => addListenerEffect(
  resolveQueries(queriesOrQueriesId),
  "ParamValue",
  listener,
  () => [maybeGet(queryId), maybeGet(paramId)]
);
var onCheckpointIds = (listener, checkpointsOrCheckpointsId) => addListenerEffect(
  resolveCheckpoints(checkpointsOrCheckpointsId),
  CHECKPOINT + IDS,
  listener
);
var onCheckpoint = (checkpointId, listener, checkpointsOrCheckpointsId) => addListenerEffect(
  resolveCheckpoints(checkpointsOrCheckpointsId),
  CHECKPOINT,
  listener,
  () => [maybeGet(checkpointId)]
);
var onPersisterStatus = (listener, persisterOrPersisterId) => addListenerEffect(resolvePersister(persisterOrPersisterId), STATUS, listener);
var onSynchronizerStatus = (listener, synchronizerOrSynchronizerId) => addListenerEffect(
  resolveSynchronizer(synchronizerOrSynchronizerId),
  STATUS,
  listener
);
var provideThing = (thingId, thing, offset) => {
  const contextValue = getContextValue();
  if (hasWindow()) {
    $.user_effect(() => {
      contextValue[16]?.(offset, thingId, thing);
      return () => contextValue[17]?.(offset, thingId);
    });
  }
};
var provideStore = (storeId, store) => provideThing(storeId, store, OFFSET_STORE);
var provideMetrics = (metricsId, metrics) => provideThing(metricsId, metrics, OFFSET_METRICS);
var provideIndexes = (indexesId, indexes) => provideThing(indexesId, indexes, OFFSET_INDEXES);
var provideRelationships = (relationshipsId, relationships) => provideThing(relationshipsId, relationships, OFFSET_RELATIONSHIPS);
var provideQueries = (queriesId, queries) => provideThing(queriesId, queries, OFFSET_QUERIES);
var provideCheckpoints = (checkpointsId, checkpoints) => provideThing(checkpointsId, checkpoints, OFFSET_CHECKPOINTS);
var providePersister = (persisterId, persister) => provideThing(persisterId, persister, OFFSET_PERSISTER);
var provideSynchronizer = (synchronizerId, synchronizer) => provideThing(synchronizerId, synchronizer, OFFSET_SYNCHRONIZER);
function CheckpointView($$anchor, $$props) {
  $.push($$props, true);
  const checkpoint = getCheckpoint(
    () => $$props.checkpointId,
    () => $$props.checkpoints
  );
  const display = $.derived(() => "" + (checkpoint.current ?? ""));
  const output = $.derived(
    () => $$props.debugIds ? `${$$props.checkpointId}:{${$.get(display)}}` : $.get(display)
  );
  $.next();
  var text2 = $.text();
  $.template_effect(() => $.set_text(text2, $.get(output)));
  $.append($$anchor, text2);
  $.pop();
}
var root_2 = $.from_html(`<!><!>`, 1);
var root$1 = $.from_html(`<!><!><!>`, 1);
function Wrap($$anchor, $$props) {
  $.push($$props, true);
  var fragment = root$1();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var text2 = $.text();
      $.template_effect(() => $.set_text(text2, `${$$props.id ?? ""}:{`));
      $.append($$anchor2, text2);
    };
    var d = $.derived(() => $$props.debugIds && !isUndefined($$props.id));
    $.if(node, ($$render) => {
      if ($.get(d)) $$render(consequent);
    });
  }
  var node_1 = $.sibling(node);
  $.each(
    node_1,
    18,
    () => $$props.ids,
    (itemId) => itemId,
    ($$anchor2, itemId, i) => {
      var fragment_2 = root_2();
      var node_2 = $.first_child(fragment_2);
      {
        var consequent_1 = ($$anchor3) => {
          var fragment_3 = $.comment();
          var node_3 = $.first_child(fragment_3);
          $.snippet(node_3, () => $$props.separator);
          $.append($$anchor3, fragment_3);
        };
        $.if(node_2, ($$render) => {
          if ($.get(i) > 0 && $$props.separator) $$render(consequent_1);
        });
      }
      var node_4 = $.sibling(node_2);
      {
        var consequent_2 = ($$anchor3) => {
          var fragment_4 = $.comment();
          var node_5 = $.first_child(fragment_4);
          $.snippet(
            node_5,
            () => $$props.custom,
            () => itemId
          );
          $.append($$anchor3, fragment_4);
        };
        var alternate = ($$anchor3) => {
          var fragment_5 = $.comment();
          var node_6 = $.first_child(fragment_5);
          $.snippet(
            node_6,
            () => $$props.children,
            () => itemId
          );
          $.append($$anchor3, fragment_5);
        };
        $.if(node_4, ($$render) => {
          if ($$props.custom) $$render(consequent_2);
          else $$render(alternate, -1);
        });
      }
      $.append($$anchor2, fragment_2);
    }
  );
  var node_7 = $.sibling(node_1);
  {
    var consequent_3 = ($$anchor2) => {
      var text_1 = $.text();
      text_1.nodeValue = "}";
      $.append($$anchor2, text_1);
    };
    var d_1 = $.derived(() => $$props.debugIds && !isUndefined($$props.id));
    $.if(node_7, ($$render) => {
      if ($.get(d_1)) $$render(consequent_3);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function BackwardCheckpointsView($$anchor, $$props) {
  $.push($$props, true);
  const checkpointIds = getCheckpointIds(() => $$props.checkpoints);
  const ids = $.derived(() => checkpointIds.current[0]);
  {
    const children = ($$anchor2, checkpointId = $.noop) => {
      CheckpointView($$anchor2, {
        get checkpointId() {
          return checkpointId();
        },
        get checkpoints() {
          return $$props.checkpoints;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return $.get(ids);
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get custom() {
        return $$props.checkpoint;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function CellView($$anchor, $$props) {
  $.push($$props, true);
  const cell = getCell(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.store
  );
  const display = $.derived(() => "" + (cell.current ?? ""));
  const output = $.derived(
    () => $$props.debugIds ? `${$$props.cellId}:{${$.get(display)}}` : $.get(display)
  );
  $.next();
  var text2 = $.text();
  $.template_effect(() => $.set_text(text2, $.get(output)));
  $.append($$anchor, text2);
  $.pop();
}
function CurrentCheckpointView($$anchor, $$props) {
  $.push($$props, true);
  const checkpointIds = getCheckpointIds(() => $$props.checkpoints);
  const currentId = $.derived(() => checkpointIds.current[1]);
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment_1 = $.comment();
      var node_1 = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          var fragment_2 = $.comment();
          var node_2 = $.first_child(fragment_2);
          $.snippet(
            node_2,
            () => $$props.checkpoint,
            () => $.get(currentId)
          );
          $.append($$anchor3, fragment_2);
        };
        var alternate = ($$anchor3) => {
          CheckpointView($$anchor3, {
            get checkpointId() {
              return $.get(currentId);
            },
            get checkpoints() {
              return $$props.checkpoints;
            },
            get debugIds() {
              return $$props.debugIds;
            }
          });
        };
        $.if(node_1, ($$render) => {
          if ($$props.checkpoint) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      $.append($$anchor2, fragment_1);
    };
    var d = $.derived(() => !isUndefined($.get(currentId)));
    $.if(node, ($$render) => {
      if ($.get(d)) $$render(consequent_1);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function ForwardCheckpointsView($$anchor, $$props) {
  $.push($$props, true);
  const checkpointIds = getCheckpointIds(() => $$props.checkpoints);
  const ids = $.derived(() => checkpointIds.current[2]);
  {
    const children = ($$anchor2, checkpointId = $.noop) => {
      CheckpointView($$anchor2, {
        get checkpointId() {
          return checkpointId();
        },
        get checkpoints() {
          return $$props.checkpoints;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return $.get(ids);
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get custom() {
        return $$props.checkpoint;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function RowView($$anchor, $$props) {
  $.push($$props, true);
  const defaultCellIds = getCellIds(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.store
  );
  const activeCellIds = $.derived(
    () => $$props.customCellIds ?? defaultCellIds.current
  );
  {
    const children = ($$anchor2, cellId = $.noop) => {
      CellView($$anchor2, {
        get tableId() {
          return $$props.tableId;
        },
        get rowId() {
          return $$props.rowId;
        },
        get cellId() {
          return cellId();
        },
        get store() {
          return $$props.store;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return $.get(activeCellIds);
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.rowId;
      },
      get custom() {
        return $$props.cell;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function SliceView($$anchor, $$props) {
  $.push($$props, true);
  const { store, tableId } = getIndexStoreTableId(
    () => $$props.indexes,
    () => $$props.indexId
  );
  const rowIds = getSliceRowIds(
    () => $$props.indexId,
    () => $$props.sliceId,
    () => $$props.indexes
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      var fragment_1 = $.comment();
      var node = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          RowView($$anchor3, {
            get tableId() {
              return tableId;
            },
            get rowId() {
              return rowId();
            },
            get store() {
              return store;
            },
            get debugIds() {
              return $$props.debugIds;
            }
          });
        };
        $.if(node, ($$render) => {
          if (tableId) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment_1);
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.sliceId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function IndexView($$anchor, $$props) {
  $.push($$props, true);
  const sliceIds = getSliceIds(
    () => $$props.indexId,
    () => $$props.indexes
  );
  {
    const children = ($$anchor2, sliceId = $.noop) => {
      SliceView($$anchor2, {
        get indexId() {
          return $$props.indexId;
        },
        get sliceId() {
          return sliceId();
        },
        get indexes() {
          return $$props.indexes;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return sliceIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.indexId;
      },
      get custom() {
        return $$props.slice;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function LinkedRowsView($$anchor, $$props) {
  $.push($$props, true);
  const { store, localTableId } = getRelationshipsStoreTableIds(
    () => $$props.relationships,
    () => $$props.relationshipId
  );
  const rowIds = getLinkedRowIds(
    () => $$props.relationshipId,
    () => $$props.firstRowId,
    () => $$props.relationships
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      var fragment_1 = $.comment();
      var node = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          RowView($$anchor3, {
            get tableId() {
              return localTableId;
            },
            get rowId() {
              return rowId();
            },
            get store() {
              return store;
            },
            get debugIds() {
              return $$props.debugIds;
            }
          });
        };
        $.if(node, ($$render) => {
          if (localTableId) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment_1);
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.firstRowId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function LocalRowsView($$anchor, $$props) {
  $.push($$props, true);
  const { store, localTableId } = getRelationshipsStoreTableIds(
    () => $$props.relationships,
    () => $$props.relationshipId
  );
  const rowIds = getLocalRowIds(
    () => $$props.relationshipId,
    () => $$props.remoteRowId,
    () => $$props.relationships
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      var fragment_1 = $.comment();
      var node = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          RowView($$anchor3, {
            get tableId() {
              return localTableId;
            },
            get rowId() {
              return rowId();
            },
            get store() {
              return store;
            },
            get debugIds() {
              return $$props.debugIds;
            }
          });
        };
        $.if(node, ($$render) => {
          if (localTableId) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment_1);
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.remoteRowId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function MetricView($$anchor, $$props) {
  $.push($$props, true);
  const metric = getMetric(
    () => $$props.metricId,
    () => $$props.metrics
  );
  const display = $.derived(() => "" + (metric.current ?? ""));
  const output = $.derived(
    () => $$props.debugIds ? `${$$props.metricId}:{${$.get(display)}}` : $.get(display)
  );
  $.next();
  var text2 = $.text();
  $.template_effect(() => $.set_text(text2, $.get(output)));
  $.append($$anchor, text2);
  $.pop();
}
function Provider($$anchor, $$props) {
  $.push($$props, true);
  const parentCtx = getContext(TINYBASE_CONTEXT_KEY) ?? [];
  let extras = $.proxy(Array.from({ length: 8 }, () => ({})));
  const addThing = (offset, id, thing) => {
    extras[offset] = { ...untrack(() => extras[offset]), [id]: thing };
  };
  const delThing = (offset, id) => {
    const { [id]: _, ...rest } = untrack(() => extras[offset]);
    extras[offset] = rest;
  };
  const ctx = {
    get [0]() {
      return $$props.store ?? parentCtx[0];
    },
    get [1]() {
      return { ...parentCtx[1] ?? {}, ...$$props.storesById, ...extras[0] };
    },
    get [2]() {
      return $$props.metrics ?? parentCtx[2];
    },
    get [3]() {
      return { ...parentCtx[3] ?? {}, ...$$props.metricsById, ...extras[1] };
    },
    get [4]() {
      return $$props.indexes ?? parentCtx[4];
    },
    get [5]() {
      return { ...parentCtx[5] ?? {}, ...$$props.indexesById, ...extras[2] };
    },
    get [6]() {
      return $$props.relationships ?? parentCtx[6];
    },
    get [7]() {
      return {
        ...parentCtx[7] ?? {},
        ...$$props.relationshipsById,
        ...extras[3]
      };
    },
    get [8]() {
      return $$props.queries ?? parentCtx[8];
    },
    get [9]() {
      return { ...parentCtx[9] ?? {}, ...$$props.queriesById, ...extras[4] };
    },
    get [10]() {
      return $$props.checkpoints ?? parentCtx[10];
    },
    get [11]() {
      return {
        ...parentCtx[11] ?? {},
        ...$$props.checkpointsById,
        ...extras[5]
      };
    },
    get [12]() {
      return $$props.persister ?? parentCtx[12];
    },
    get [13]() {
      return {
        ...parentCtx[13] ?? {},
        ...$$props.persistersById,
        ...extras[6]
      };
    },
    get [14]() {
      return $$props.synchronizer ?? parentCtx[14];
    },
    get [15]() {
      return {
        ...parentCtx[15] ?? {},
        ...$$props.synchronizersById,
        ...extras[7]
      };
    },
    get [16]() {
      return addThing;
    },
    get [17]() {
      return delThing;
    }
  };
  setContext(TINYBASE_CONTEXT_KEY, ctx);
  var fragment = $.comment();
  var node = $.first_child(fragment);
  $.snippet(node, () => $$props.children);
  $.append($$anchor, fragment);
  $.pop();
}
var root = $.from_html(`<!><!><!>`, 1);
function RemoteRowView($$anchor, $$props) {
  $.push($$props, true);
  const { store, remoteTableId } = getRelationshipsStoreTableIds(
    () => $$props.relationships,
    () => $$props.relationshipId
  );
  const remoteRowId = getRemoteRowId(
    () => $$props.relationshipId,
    () => $$props.localRowId,
    () => $$props.relationships
  );
  var fragment = root();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var text2 = $.text();
      $.template_effect(
        () => $.set_text(text2, `${$$props.localRowId ?? ""}:{`)
      );
      $.append($$anchor2, text2);
    };
    $.if(node, ($$render) => {
      if ($$props.debugIds) $$render(consequent);
    });
  }
  var node_1 = $.sibling(node);
  {
    var consequent_3 = ($$anchor2) => {
      var fragment_2 = $.comment();
      var node_2 = $.first_child(fragment_2);
      {
        var consequent_1 = ($$anchor3) => {
          var fragment_3 = $.comment();
          var node_3 = $.first_child(fragment_3);
          $.snippet(
            node_3,
            () => $$props.row,
            () => remoteRowId.current
          );
          $.append($$anchor3, fragment_3);
        };
        var consequent_2 = ($$anchor3) => {
          RowView($$anchor3, {
            get tableId() {
              return remoteTableId;
            },
            get rowId() {
              return remoteRowId.current;
            },
            get store() {
              return store;
            },
            get debugIds() {
              return $$props.debugIds;
            }
          });
        };
        $.if(node_2, ($$render) => {
          if ($$props.row) $$render(consequent_1);
          else if (remoteTableId) $$render(consequent_2, 1);
        });
      }
      $.append($$anchor2, fragment_2);
    };
    var d = $.derived(() => !isUndefined(remoteRowId.current));
    $.if(node_1, ($$render) => {
      if ($.get(d)) $$render(consequent_3);
    });
  }
  var node_4 = $.sibling(node_1);
  {
    var consequent_4 = ($$anchor2) => {
      var text_1 = $.text();
      text_1.nodeValue = "}";
      $.append($$anchor2, text_1);
    };
    $.if(node_4, ($$render) => {
      if ($$props.debugIds) $$render(consequent_4);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function ResultCellView($$anchor, $$props) {
  $.push($$props, true);
  const cell = getResultCell(
    () => $$props.queryId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.queries
  );
  const display = $.derived(() => "" + (cell.current ?? ""));
  const output = $.derived(
    () => $$props.debugIds ? `${$$props.cellId}:{${$.get(display)}}` : $.get(display)
  );
  $.next();
  var text2 = $.text();
  $.template_effect(() => $.set_text(text2, $.get(output)));
  $.append($$anchor, text2);
  $.pop();
}
function ResultRowView($$anchor, $$props) {
  $.push($$props, true);
  const cellIds = getResultCellIds(
    () => $$props.queryId,
    () => $$props.rowId,
    () => $$props.queries
  );
  {
    const children = ($$anchor2, cellId = $.noop) => {
      ResultCellView($$anchor2, {
        get queryId() {
          return $$props.queryId;
        },
        get rowId() {
          return $$props.rowId;
        },
        get cellId() {
          return cellId();
        },
        get queries() {
          return $$props.queries;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return cellIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.rowId;
      },
      get custom() {
        return $$props.cell;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function ResultSortedTableView($$anchor, $$props) {
  $.push($$props, true);
  const rowIds = getResultSortedRowIds(
    () => $$props.queryId,
    () => $$props.cellId,
    () => $$props.descending ?? false,
    () => $$props.offset ?? 0,
    () => $$props.limit,
    () => $$props.queries
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      ResultRowView($$anchor2, {
        get queryId() {
          return $$props.queryId;
        },
        get rowId() {
          return rowId();
        },
        get queries() {
          return $$props.queries;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.queryId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function ResultTableView($$anchor, $$props) {
  $.push($$props, true);
  const rowIds = getResultRowIds(
    () => $$props.queryId,
    () => $$props.queries
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      ResultRowView($$anchor2, {
        get queryId() {
          return $$props.queryId;
        },
        get rowId() {
          return rowId();
        },
        get queries() {
          return $$props.queries;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.queryId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function SortedTableView($$anchor, $$props) {
  $.push($$props, true);
  const rowIds = getSortedRowIds(
    () => $$props.tableId,
    () => $$props.cellId,
    () => $$props.descending ?? false,
    () => $$props.offset ?? 0,
    () => $$props.limit,
    () => $$props.store
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      RowView($$anchor2, {
        get tableId() {
          return $$props.tableId;
        },
        get rowId() {
          return rowId();
        },
        get store() {
          return $$props.store;
        },
        get customCellIds() {
          return $$props.customCellIds;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.tableId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function TableView($$anchor, $$props) {
  $.push($$props, true);
  const rowIds = getRowIds(
    () => $$props.tableId,
    () => $$props.store
  );
  {
    const children = ($$anchor2, rowId = $.noop) => {
      RowView($$anchor2, {
        get tableId() {
          return $$props.tableId;
        },
        get rowId() {
          return rowId();
        },
        get store() {
          return $$props.store;
        },
        get customCellIds() {
          return $$props.customCellIds;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return rowIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get id() {
        return $$props.tableId;
      },
      get custom() {
        return $$props.row;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function TablesView($$anchor, $$props) {
  $.push($$props, true);
  const tableIds = getTableIds(() => $$props.store);
  {
    const children = ($$anchor2, tableId = $.noop) => {
      TableView($$anchor2, {
        get tableId() {
          return tableId();
        },
        get store() {
          return $$props.store;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return tableIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get custom() {
        return $$props.table;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
function ValueView($$anchor, $$props) {
  $.push($$props, true);
  const value = getValue(
    () => $$props.valueId,
    () => $$props.store
  );
  const display = $.derived(() => "" + (value.current ?? ""));
  const output = $.derived(
    () => $$props.debugIds ? `${$$props.valueId}:{${$.get(display)}}` : $.get(display)
  );
  $.next();
  var text2 = $.text();
  $.template_effect(() => $.set_text(text2, $.get(output)));
  $.append($$anchor, text2);
  $.pop();
}
function ValuesView($$anchor, $$props) {
  $.push($$props, true);
  const valueIds = getValueIds(() => $$props.store);
  {
    const children = ($$anchor2, valueId = $.noop) => {
      ValueView($$anchor2, {
        get valueId() {
          return valueId();
        },
        get store() {
          return $$props.store;
        },
        get debugIds() {
          return $$props.debugIds;
        }
      });
    };
    Wrap($$anchor, {
      get ids() {
        return valueIds.current;
      },
      get separator() {
        return $$props.separator;
      },
      get debugIds() {
        return $$props.debugIds;
      },
      get custom() {
        return $$props.value;
      },
      children,
      $$slots: { default: true }
    });
  }
  $.pop();
}
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
  createGoBackwardCallback,
  createGoForwardCallback,
  getCell,
  getCellIds,
  getCheckpoint,
  getCheckpointIds,
  getCheckpoints,
  getCheckpointsIds,
  getIndexIds,
  getIndexStoreTableId,
  getIndexes,
  getIndexesIds,
  getLinkedRowIds,
  getLocalRowIds,
  getMetric,
  getMetricIds,
  getMetrics,
  getMetricsIds,
  getPersister,
  getPersisterIds,
  getPersisterStatus,
  getQueries,
  getQueriesIds,
  getQueryIds,
  getRelationshipIds,
  getRelationships,
  getRelationshipsIds,
  getRelationshipsStoreTableIds,
  getRemoteRowId,
  getResultCell,
  getResultCellIds,
  getResultRow,
  getResultRowCount,
  getResultRowIds,
  getResultSortedRowIds,
  getResultTable,
  getResultTableCellIds,
  getRow,
  getRowCount,
  getRowIds,
  getSliceIds,
  getSliceRowIds,
  getSortedRowIds,
  getStore,
  getStoreIds,
  getSynchronizer,
  getSynchronizerIds,
  getSynchronizerStatus,
  getTable,
  getTableCellIds,
  getTableIds,
  getTables,
  getValue,
  getValueIds,
  getValues,
  hasCell,
  hasRow,
  hasTable,
  hasTableCell,
  hasTables,
  hasValue,
  hasValues,
  onCell,
  onCellIds,
  onCheckpoint,
  onCheckpointIds,
  onDidFinishTransaction,
  onHasCell,
  onHasRow,
  onHasTable,
  onHasTableCell,
  onHasTables,
  onHasValue,
  onHasValues,
  onLinkedRowIds,
  onLocalRowIds,
  onMetric,
  onParamValue,
  onParamValues,
  onPersisterStatus,
  onRemoteRowId,
  onResultCell,
  onResultCellIds,
  onResultRow,
  onResultRowCount,
  onResultRowIds,
  onResultSortedRowIds,
  onResultTable,
  onResultTableCellIds,
  onRow,
  onRowCount,
  onRowIds,
  onSliceIds,
  onSliceRowIds,
  onSortedRowIds,
  onStartTransaction,
  onSynchronizerStatus,
  onTable,
  onTableCellIds,
  onTableIds,
  onTables,
  onValue,
  onValueIds,
  onValues,
  onWillFinishTransaction,
  provideCheckpoints,
  provideIndexes,
  provideMetrics,
  providePersister,
  provideQueries,
  provideRelationships,
  provideStore,
  provideSynchronizer,
  resolveCheckpoints,
  resolveIndexes,
  resolveMetrics,
  resolvePersister,
  resolveQueries,
  resolveRelationships,
  resolveStore,
  resolveSynchronizer
};
