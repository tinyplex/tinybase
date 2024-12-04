(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('react'))
    : typeof define === 'function' && define.amd
      ? define(['exports', 'react'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyBaseUiReact = {}), global.React));
})(this, function (exports, React) {
  'use strict';

  const getTypeOf = (thing) => typeof thing;
  const TINYBASE = 'tinybase';
  const EMPTY_STRING = '';
  const STRING = getTypeOf(EMPTY_STRING);
  const FUNCTION = getTypeOf(getTypeOf);
  const LISTENER = 'Listener';
  const RESULT = 'Result';
  const GET = 'get';
  const SET = 'set';
  const ADD = 'add';
  const DEL = 'del';
  const HAS = 'Has';
  const _HAS = 'has';
  const IDS = 'Ids';
  const TABLE = 'Table';
  const TABLES = TABLE + 's';
  const TABLE_IDS = TABLE + IDS;
  const ROW = 'Row';
  const ROW_COUNT = ROW + 'Count';
  const ROW_IDS = ROW + IDS;
  const SORTED_ROW_IDS = 'Sorted' + ROW + IDS;
  const CELL = 'Cell';
  const CELL_IDS = CELL + IDS;
  const VALUE = 'Value';
  const VALUES = VALUE + 's';
  const VALUE_IDS = VALUE + IDS;
  const TRANSACTION = 'Transaction';
  const PARTIAL = 'Partial';
  const FINISH = 'Finish';
  const STATUS = 'Status';
  const METRIC = 'Metric';
  const INDEX = 'Index';
  const SLICE = 'Slice';
  const RELATIONSHIP = 'Relationship';
  const REMOTE_ROW_ID = 'Remote' + ROW + 'Id';
  const LOCAL = 'Local';
  const LINKED = 'Linked';
  const QUERY = 'Query';
  const CHECKPOINT = 'Checkpoint';

  const GLOBAL = globalThis;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isString = (thing) => getTypeOf(thing) == STRING;
  const isFunction = (thing) => getTypeOf(thing) == FUNCTION;
  const isArray = (thing) => Array.isArray(thing);
  const size = (arrayOrString) => arrayOrString.length;
  const getUndefined = () => void 0;

  const arrayNew = (size2, cb) =>
    arrayMap(new Array(size2).fill(0), (_, index) => cb(index));
  const arrayEvery = (array, cb) => array.every(cb);
  const arrayIsEqual = (array1, array2) =>
    size(array1) === size(array2) &&
    arrayEvery(array1, (value1, index) => array2[index] === value1);
  const arrayMap = (array, cb) => array.map(cb);
  const arrayIsEmpty = (array) => size(array) == 0;
  const arrayFilter = (array, cb) => array.filter(cb);
  const arrayWith = (array, index, value) => array.with(index, value);

  const {
    PureComponent,
    Fragment,
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
  } = React;
  const getProps = (getProps2, ...ids) =>
    isUndefined(getProps2) ? {} : getProps2(...ids);
  const getRelationshipsStoreTableIds = (relationships, relationshipId) => [
    relationships,
    relationships?.getStore(),
    relationships?.getLocalTableId(relationshipId),
    relationships?.getRemoteTableId(relationshipId),
  ];
  const getIndexStoreTableId = (indexes, indexId) => [
    indexes,
    indexes?.getStore(),
    indexes?.getTableId(indexId),
  ];

  const object = Object;
  const getPrototypeOf = (obj) => object.getPrototypeOf(obj);
  const objEntries = object.entries;
  const isObject = (obj) =>
    !isUndefined(obj) &&
    ifNotUndefined(
      getPrototypeOf(obj),
      (objPrototype) =>
        objPrototype == object.prototype ||
        isUndefined(getPrototypeOf(objPrototype)),

      /* istanbul ignore next */
      () => true,
    );
  const objIds = object.keys;
  const objGet = (obj, id) => ifNotUndefined(obj, (obj2) => obj2[id]);
  const objHas = (obj, id) => id in obj;
  const objDel = (obj, id) => {
    delete obj[id];
    return obj;
  };
  const objSize = (obj) => size(objIds(obj));
  const objIsEqual = (obj1, obj2) => {
    const entries1 = objEntries(obj1);
    return (
      size(entries1) === objSize(obj2) &&
      arrayEvery(entries1, ([index, value1]) =>
        isObject(value1)
          ? isObject(obj2[index])
            ? objIsEqual(obj2[index], value1)
            : false
          : obj2[index] === value1,
      )
    );
  };
  const objEnsure = (obj, id, getDefaultValue) => {
    if (!objHas(obj, id)) {
      obj[id] = getDefaultValue();
    }
    return obj[id];
  };

  const Context = objEnsure(GLOBAL, TINYBASE + '_uirc', () =>
    createContext([]),
  );
  const useThing = (id, offset) => {
    const contextValue = useContext(Context);
    return isUndefined(id)
      ? contextValue[offset * 2]
      : isString(id)
        ? objGet(contextValue[offset * 2 + 1] ?? {}, id)
        : id;
  };
  const useThings = (offset) => ({...useContext(Context)[offset * 2 + 1]});
  const useThingOrThingById = (thingOrThingId, offset) => {
    const thing = useThing(thingOrThingId, offset);
    return isUndefined(thingOrThingId) || isString(thingOrThingId)
      ? thing
      : thingOrThingId;
  };
  const useProvideThing = (thingId, thing, offset) => {
    const {16: addExtraThingById, 17: delExtraThingById} = useContext(Context);
    useEffect(() => {
      addExtraThingById?.(offset, thingId, thing);
      return () => delExtraThingById?.(offset, thingId);
    }, [addExtraThingById, thingId, thing, offset, delExtraThingById]);
  };
  const useThingIds = (offset) =>
    objIds(useContext(Context)[offset * 2 + 1] ?? {});
  const useStoreIds = () => useThingIds(0 /* Store */);
  const useStore = (id) => useThing(id, 0 /* Store */);
  const useStores = () => useThings(0 /* Store */);
  const useStoreOrStoreById = (storeOrStoreId) =>
    useThingOrThingById(storeOrStoreId, 0 /* Store */);
  const useProvideStore = (storeId, store) =>
    useProvideThing(storeId, store, 0 /* Store */);
  const useMetricsIds = () => useThingIds(1 /* Metrics */);
  const useMetrics = (id) => useThing(id, 1 /* Metrics */);
  const useMetricsOrMetricsById = (metricsOrMetricsId) =>
    useThingOrThingById(metricsOrMetricsId, 1 /* Metrics */);
  const useProvideMetrics = (metricsId, metrics) =>
    useProvideThing(metricsId, metrics, 1 /* Metrics */);
  const useIndexesIds = () => useThingIds(2 /* Indexes */);
  const useIndexes = (id) => useThing(id, 2 /* Indexes */);
  const useIndexesOrIndexesById = (indexesOrIndexesId) =>
    useThingOrThingById(indexesOrIndexesId, 2 /* Indexes */);
  const useProvideIndexes = (indexesId, indexes) =>
    useProvideThing(indexesId, indexes, 2 /* Indexes */);
  const useRelationshipsIds = () => useThingIds(3 /* Relationships */);
  const useRelationships = (id) => useThing(id, 3 /* Relationships */);
  const useRelationshipsOrRelationshipsById = (
    relationshipsOrRelationshipsId,
  ) =>
    useThingOrThingById(relationshipsOrRelationshipsId, 3 /* Relationships */);
  const useProvideRelationships = (relationshipsId, relationships) =>
    useProvideThing(relationshipsId, relationships, 3 /* Relationships */);
  const useQueriesIds = () => useThingIds(4 /* Queries */);
  const useQueries = (id) => useThing(id, 4 /* Queries */);
  const useQueriesOrQueriesById = (queriesOrQueriesId) =>
    useThingOrThingById(queriesOrQueriesId, 4 /* Queries */);
  const useProvideQueries = (queriesId, queries) =>
    useProvideThing(queriesId, queries, 4 /* Queries */);
  const useCheckpointsIds = () => useThingIds(5 /* Checkpoints */);
  const useCheckpoints = (id) => useThing(id, 5 /* Checkpoints */);
  const useCheckpointsOrCheckpointsById = (checkpointsOrCheckpointsId) =>
    useThingOrThingById(checkpointsOrCheckpointsId, 5 /* Checkpoints */);
  const useProvideCheckpoints = (checkpointsId, checkpoints) =>
    useProvideThing(checkpointsId, checkpoints, 5 /* Checkpoints */);
  const usePersisterIds = () => useThingIds(6 /* Persister */);
  const usePersister = (id) => useThing(id, 6 /* Persister */);
  const usePersisterOrPersisterById = (persisterOrPersisterId) =>
    useThingOrThingById(persisterOrPersisterId, 6 /* Persister */);
  const useProvidePersister = (persisterId, persister) =>
    useProvideThing(persisterId, persister, 6 /* Persister */);
  const useSynchronizerIds = () => useThingIds(7 /* Synchronizer */);
  const useSynchronizer = (id) => useThing(id, 7 /* Synchronizer */);
  const useSynchronizerOrSynchronizerById = (synchronizerOrSynchronizerId) =>
    useThingOrThingById(synchronizerOrSynchronizerId, 7 /* Synchronizer */);
  const useProvideSynchronizer = (persisterId, persister) =>
    useProvideThing(persisterId, persister, 7 /* Synchronizer */);

  const EMPTY_ARRAY = [];
  const DEFAULTS = [
    {},
    [],
    [EMPTY_ARRAY, void 0, EMPTY_ARRAY],
    void 0,
    false,
    0,
  ];
  const IS_EQUALS = [
    objIsEqual,
    arrayIsEqual,
    (
      [backwardIds1, currentId1, forwardIds1],
      [backwardIds2, currentId2, forwardIds2],
    ) =>
      currentId1 === currentId2 &&
      arrayIsEqual(backwardIds1, backwardIds2) &&
      arrayIsEqual(forwardIds1, forwardIds2),
  ];
  const isEqual = (thing1, thing2) => thing1 === thing2;
  const useCreate = (store, create, createDeps = EMPTY_ARRAY) => {
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
      [store, ...createDeps],
    );
    return thing;
  };
  const addAndDelListener = (thing, listenable, ...args) => {
    const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
    return () => thing?.delListener(listenerId);
  };
  const useListenable = (listenable, thing, returnType, args = EMPTY_ARRAY) => {
    const lastResult = useRef(DEFAULTS[returnType]);
    const getResult = useCallback(
      () => {
        const nextResult =
          thing?.[(returnType == 4 /* Boolean */ ? _HAS : GET) + listenable]?.(
            ...args,
          ) ?? DEFAULTS[returnType];
        return !(IS_EQUALS[returnType] ?? isEqual)(
          nextResult,
          lastResult.current,
        )
          ? (lastResult.current = nextResult)
          : lastResult.current;
      },
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      [thing, returnType, listenable, ...args],
    );
    const subscribe = useCallback(
      (listener) =>
        addAndDelListener(
          thing,
          (returnType == 4 /* Boolean */ ? HAS : EMPTY_STRING) + listenable,
          ...args,
          listener,
        ),
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      [thing, returnType, listenable, ...args],
    );
    return useSyncExternalStore(subscribe, getResult, getResult);
  };
  const useListener = (
    listenable,
    thing,
    listener,
    listenerDeps = EMPTY_ARRAY,
    preArgs = EMPTY_ARRAY,
    ...postArgs
  ) =>
    useLayoutEffect(
      () =>
        addAndDelListener(thing, listenable, ...preArgs, listener, ...postArgs),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [thing, listenable, ...preArgs, ...listenerDeps, ...postArgs],
    );
  const useSetCallback = (
    storeOrStoreId,
    settable,
    get,
    getDeps = EMPTY_ARRAY,
    then = getUndefined,
    thenDeps = EMPTY_ARRAY,
    ...args
  ) => {
    const store = useStoreOrStoreById(storeOrStoreId);
    return useCallback(
      (parameter) =>
        ifNotUndefined(store, (store2) =>
          ifNotUndefined(get(parameter, store2), (thing) =>
            then(
              store2[SET + settable](
                ...argsOrGetArgs(args, store2, parameter),
                thing,
              ),
              thing,
            ),
          ),
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store, settable, ...getDeps, ...thenDeps, ...nonFunctionDeps(args)],
    );
  };
  const argsOrGetArgs = (args, store, parameter) =>
    arrayMap(args, (arg) => (isFunction(arg) ? arg(parameter, store) : arg));
  const nonFunctionDeps = (args) =>
    arrayFilter(args, (arg) => !isFunction(arg));
  const useDel = (
    storeOrStoreId,
    deletable,
    then = getUndefined,
    thenDeps = EMPTY_ARRAY,
    ...args
  ) => {
    const store = useStoreOrStoreById(storeOrStoreId);
    return useCallback(
      (parameter) =>
        then(
          store?.[DEL + deletable](...argsOrGetArgs(args, store, parameter)),
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store, deletable, ...thenDeps, ...nonFunctionDeps(args)],
    );
  };
  const useCheckpointAction = (checkpointsOrCheckpointsId, action, arg) => {
    const checkpoints = useCheckpointsOrCheckpointsById(
      checkpointsOrCheckpointsId,
    );
    return useCallback(
      () => checkpoints?.[action](arg),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [checkpoints, action, arg],
    );
  };
  const useCreateStore = (create, createDeps = EMPTY_ARRAY) =>
    useMemo(create, createDeps);
  const useCreateMergeableStore = (create, createDeps = EMPTY_ARRAY) =>
    useMemo(create, createDeps);
  const useHasTables = (storeOrStoreId) =>
    useListenable(
      TABLES,
      useStoreOrStoreById(storeOrStoreId),
      4 /* Boolean */,
      [],
    );
  const useTables = (storeOrStoreId) =>
    useListenable(TABLES, useStoreOrStoreById(storeOrStoreId), 0 /* Object */);
  const useTableIds = (storeOrStoreId) =>
    useListenable(
      TABLE_IDS,
      useStoreOrStoreById(storeOrStoreId),
      1 /* Array */,
    );
  const useHasTable = (tableId, storeOrStoreId) =>
    useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 4 /* Boolean */, [
      tableId,
    ]);
  const useTable = (tableId, storeOrStoreId) =>
    useListenable(TABLE, useStoreOrStoreById(storeOrStoreId), 0 /* Object */, [
      tableId,
    ]);
  const useTableCellIds = (tableId, storeOrStoreId) =>
    useListenable(
      TABLE + CELL_IDS,
      useStoreOrStoreById(storeOrStoreId),
      1 /* Array */,
      [tableId],
    );
  const useHasTableCell = (tableId, cellId, storeOrStoreId) =>
    useListenable(
      TABLE + CELL,
      useStoreOrStoreById(storeOrStoreId),
      4 /* Boolean */,
      [tableId, cellId],
    );
  const useRowCount = (tableId, storeOrStoreId) =>
    useListenable(
      ROW_COUNT,
      useStoreOrStoreById(storeOrStoreId),
      5 /* Number */,
      [tableId],
    );
  const useRowIds = (tableId, storeOrStoreId) =>
    useListenable(ROW_IDS, useStoreOrStoreById(storeOrStoreId), 1 /* Array */, [
      tableId,
    ]);
  const useSortedRowIds = (
    tableId,
    cellId,
    descending,
    offset = 0,
    limit,
    storeOrStoreId,
  ) =>
    useListenable(
      SORTED_ROW_IDS,
      useStoreOrStoreById(storeOrStoreId),
      1 /* Array */,
      [tableId, cellId, descending, offset, limit],
    );
  const useHasRow = (tableId, rowId, storeOrStoreId) =>
    useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 4 /* Boolean */, [
      tableId,
      rowId,
    ]);
  const useRow = (tableId, rowId, storeOrStoreId) =>
    useListenable(ROW, useStoreOrStoreById(storeOrStoreId), 0 /* Object */, [
      tableId,
      rowId,
    ]);
  const useCellIds = (tableId, rowId, storeOrStoreId) =>
    useListenable(
      CELL_IDS,
      useStoreOrStoreById(storeOrStoreId),
      1 /* Array */,
      [tableId, rowId],
    );
  const useHasCell = (tableId, rowId, cellId, storeOrStoreId) =>
    useListenable(CELL, useStoreOrStoreById(storeOrStoreId), 4 /* Boolean */, [
      tableId,
      rowId,
      cellId,
    ]);
  const useCell = (tableId, rowId, cellId, storeOrStoreId) =>
    useListenable(
      CELL,
      useStoreOrStoreById(storeOrStoreId),
      3 /* CellOrValue */,
      [tableId, rowId, cellId],
    );
  const useHasValues = (storeOrStoreId) =>
    useListenable(
      VALUES,
      useStoreOrStoreById(storeOrStoreId),
      4 /* Boolean */,
      [],
    );
  const useValues = (storeOrStoreId) =>
    useListenable(VALUES, useStoreOrStoreById(storeOrStoreId), 0 /* Object */);
  const useValueIds = (storeOrStoreId) =>
    useListenable(
      VALUE_IDS,
      useStoreOrStoreById(storeOrStoreId),
      1 /* Array */,
    );
  const useHasValue = (valueId, storeOrStoreId) =>
    useListenable(VALUE, useStoreOrStoreById(storeOrStoreId), 4 /* Boolean */, [
      valueId,
    ]);
  const useValue = (valueId, storeOrStoreId) =>
    useListenable(
      VALUE,
      useStoreOrStoreById(storeOrStoreId),
      3 /* CellOrValue */,
      [valueId],
    );
  const useSetTablesCallback = (
    getTables,
    getTablesDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      TABLES,
      getTables,
      getTablesDeps,
      then,
      thenDeps,
    );
  const useSetTableCallback = (
    tableId,
    getTable,
    getTableDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      TABLE,
      getTable,
      getTableDeps,
      then,
      thenDeps,
      tableId,
    );
  const useSetRowCallback = (
    tableId,
    rowId,
    getRow,
    getRowDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      ROW,
      getRow,
      getRowDeps,
      then,
      thenDeps,
      tableId,
      rowId,
    );
  const useAddRowCallback = (
    tableId,
    getRow,
    getRowDeps = EMPTY_ARRAY,
    storeOrStoreId,
    then = getUndefined,
    thenDeps = EMPTY_ARRAY,
    reuseRowIds = true,
  ) => {
    const store = useStoreOrStoreById(storeOrStoreId);
    return useCallback(
      (parameter) =>
        ifNotUndefined(store, (store2) =>
          ifNotUndefined(getRow(parameter, store2), (row) =>
            then(
              store2.addRow(
                isFunction(tableId) ? tableId(parameter, store2) : tableId,
                row,
                reuseRowIds,
              ),
              store2,
              row,
            ),
          ),
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store, tableId, ...getRowDeps, ...thenDeps, reuseRowIds],
    );
  };
  const useSetPartialRowCallback = (
    tableId,
    rowId,
    getPartialRow,
    getPartialRowDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      PARTIAL + ROW,
      getPartialRow,
      getPartialRowDeps,
      then,
      thenDeps,
      tableId,
      rowId,
    );
  const useSetCellCallback = (
    tableId,
    rowId,
    cellId,
    getCell,
    getCellDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      CELL,
      getCell,
      getCellDeps,
      then,
      thenDeps,
      tableId,
      rowId,
      cellId,
    );
  const useSetValuesCallback = (
    getValues,
    getValuesDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      VALUES,
      getValues,
      getValuesDeps,
      then,
      thenDeps,
    );
  const useSetPartialValuesCallback = (
    getPartialValues,
    getPartialValuesDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      PARTIAL + VALUES,
      getPartialValues,
      getPartialValuesDeps,
      then,
      thenDeps,
    );
  const useSetValueCallback = (
    valueId,
    getValue,
    getValueDeps,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useSetCallback(
      storeOrStoreId,
      VALUE,
      getValue,
      getValueDeps,
      then,
      thenDeps,
      valueId,
    );
  const useDelTablesCallback = (storeOrStoreId, then, thenDeps) =>
    useDel(storeOrStoreId, TABLES, then, thenDeps);
  const useDelTableCallback = (tableId, storeOrStoreId, then, thenDeps) =>
    useDel(storeOrStoreId, TABLE, then, thenDeps, tableId);
  const useDelRowCallback = (tableId, rowId, storeOrStoreId, then, thenDeps) =>
    useDel(storeOrStoreId, ROW, then, thenDeps, tableId, rowId);
  const useDelCellCallback = (
    tableId,
    rowId,
    cellId,
    forceDel,
    storeOrStoreId,
    then,
    thenDeps,
  ) =>
    useDel(
      storeOrStoreId,
      CELL,
      then,
      thenDeps,
      tableId,
      rowId,
      cellId,
      forceDel,
    );
  const useDelValuesCallback = (storeOrStoreId, then, thenDeps) =>
    useDel(storeOrStoreId, VALUES, then, thenDeps);
  const useDelValueCallback = (valueId, storeOrStoreId, then, thenDeps) =>
    useDel(storeOrStoreId, VALUE, then, thenDeps, valueId);
  const useHasTablesListener = (
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + TABLES,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [],
      mutator,
    );
  const useTablesListener = (listener, listenerDeps, mutator, storeOrStoreId) =>
    useListener(
      TABLES,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      EMPTY_ARRAY,
      mutator,
    );
  const useTableIdsListener = (
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      TABLE_IDS,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      EMPTY_ARRAY,
      mutator,
    );
  const useHasTableListener = (
    tableId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + TABLE,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId],
      mutator,
    );
  const useTableListener = (
    tableId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      TABLE,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId],
      mutator,
    );
  const useTableCellIdsListener = (
    tableId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      TABLE + CELL_IDS,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId],
      mutator,
    );
  const useHasTableCellListener = (
    tableId,
    cellId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + TABLE + CELL,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, cellId],
      mutator,
    );
  const useRowCountListener = (
    tableId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      ROW_COUNT,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId],
      mutator,
    );
  const useRowIdsListener = (
    tableId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      ROW_IDS,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId],
      mutator,
    );
  const useSortedRowIdsListener = (
    tableId,
    cellId,
    descending,
    offset,
    limit,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      SORTED_ROW_IDS,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, cellId, descending, offset, limit],
      mutator,
    );
  const useHasRowListener = (
    tableId,
    rowId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + ROW,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, rowId],
      mutator,
    );
  const useRowListener = (
    tableId,
    rowId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      ROW,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, rowId],
      mutator,
    );
  const useCellIdsListener = (
    tableId,
    rowId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      CELL_IDS,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, rowId],
      mutator,
    );
  const useHasCellListener = (
    tableId,
    rowId,
    cellId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + CELL,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, rowId, cellId],
      mutator,
    );
  const useCellListener = (
    tableId,
    rowId,
    cellId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      CELL,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [tableId, rowId, cellId],
      mutator,
    );
  const useHasValuesListener = (
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + VALUES,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [],
      mutator,
    );
  const useValuesListener = (listener, listenerDeps, mutator, storeOrStoreId) =>
    useListener(
      VALUES,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      EMPTY_ARRAY,
      mutator,
    );
  const useValueIdsListener = (
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      VALUE_IDS,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      EMPTY_ARRAY,
      mutator,
    );
  const useHasValueListener = (
    valueId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      HAS + VALUE,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [valueId],
      mutator,
    );
  const useValueListener = (
    valueId,
    listener,
    listenerDeps,
    mutator,
    storeOrStoreId,
  ) =>
    useListener(
      VALUE,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
      [valueId],
      mutator,
    );
  const useStartTransactionListener = (
    listener,
    listenerDeps,
    storeOrStoreId,
  ) =>
    useListener(
      'Start' + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );
  const useWillFinishTransactionListener = (
    listener,
    listenerDeps,
    storeOrStoreId,
  ) =>
    useListener(
      'Will' + FINISH + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );
  const useDidFinishTransactionListener = (
    listener,
    listenerDeps,
    storeOrStoreId,
  ) =>
    useListener(
      'Did' + FINISH + TRANSACTION,
      useStoreOrStoreById(storeOrStoreId),
      listener,
      listenerDeps,
    );
  const useCreateMetrics = (store, create, createDeps) =>
    useCreate(store, create, createDeps);
  const useMetricIds = (metricsOrMetricsId) =>
    useListenable(
      METRIC + IDS,
      useMetricsOrMetricsById(metricsOrMetricsId),
      1 /* Array */,
    );
  const useMetric = (metricId, metricsOrMetricsId) =>
    useListenable(
      METRIC,
      useMetricsOrMetricsById(metricsOrMetricsId),
      3 /* CellOrValue */,
      [metricId],
    );
  const useMetricListener = (
    metricId,
    listener,
    listenerDeps,
    metricsOrMetricsId,
  ) =>
    useListener(
      METRIC,
      useMetricsOrMetricsById(metricsOrMetricsId),
      listener,
      listenerDeps,
      [metricId],
    );
  const useCreateIndexes = (store, create, createDeps) =>
    useCreate(store, create, createDeps);
  const useSliceIds = (indexId, indexesOrIndexesId) =>
    useListenable(
      SLICE + IDS,
      useIndexesOrIndexesById(indexesOrIndexesId),
      1 /* Array */,
      [indexId],
    );
  const useIndexIds = (indexesOrIndexesId) =>
    useListenable(
      INDEX + IDS,
      useIndexesOrIndexesById(indexesOrIndexesId),
      1 /* Array */,
    );
  const useSliceRowIds = (indexId, sliceId, indexesOrIndexesId) =>
    useListenable(
      SLICE + ROW_IDS,
      useIndexesOrIndexesById(indexesOrIndexesId),
      1 /* Array */,
      [indexId, sliceId],
    );
  const useSliceIdsListener = (
    indexId,
    listener,
    listenerDeps,
    indexesOrIndexesId,
  ) =>
    useListener(
      SLICE + IDS,
      useIndexesOrIndexesById(indexesOrIndexesId),
      listener,
      listenerDeps,
      [indexId],
    );
  const useSliceRowIdsListener = (
    indexId,
    sliceId,
    listener,
    listenerDeps,
    indexesOrIndexesId,
  ) =>
    useListener(
      SLICE + ROW_IDS,
      useIndexesOrIndexesById(indexesOrIndexesId),
      listener,
      listenerDeps,
      [indexId, sliceId],
    );
  const useCreateRelationships = (store, create, createDeps) =>
    useCreate(store, create, createDeps);
  const useRelationshipIds = (relationshipsOrRelationshipsId) =>
    useListenable(
      RELATIONSHIP + IDS,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      1 /* Array */,
    );
  const useRemoteRowId = (
    relationshipId,
    localRowId,
    relationshipsOrRelationshipsId,
  ) =>
    useListenable(
      REMOTE_ROW_ID,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      3 /* CellOrValue */,
      [relationshipId, localRowId],
    );
  const useLocalRowIds = (
    relationshipId,
    remoteRowId,
    relationshipsOrRelationshipsId,
  ) =>
    useListenable(
      LOCAL + ROW_IDS,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      1 /* Array */,
      [relationshipId, remoteRowId],
    );
  const useLinkedRowIds = (
    relationshipId,
    firstRowId,
    relationshipsOrRelationshipsId,
  ) =>
    useListenable(
      LINKED + ROW_IDS,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      1 /* Array */,
      [relationshipId, firstRowId],
    );
  const useRemoteRowIdListener = (
    relationshipId,
    localRowId,
    listener,
    listenerDeps,
    relationshipsOrRelationshipsId,
  ) =>
    useListener(
      REMOTE_ROW_ID,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      listener,
      listenerDeps,
      [relationshipId, localRowId],
    );
  const useLocalRowIdsListener = (
    relationshipId,
    remoteRowId,
    listener,
    listenerDeps,
    relationshipsOrRelationshipsId,
  ) =>
    useListener(
      LOCAL + ROW_IDS,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      listener,
      listenerDeps,
      [relationshipId, remoteRowId],
    );
  const useLinkedRowIdsListener = (
    relationshipId,
    firstRowId,
    listener,
    listenerDeps,
    relationshipsOrRelationshipsId,
  ) =>
    useListener(
      LINKED + ROW_IDS,
      useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
      listener,
      listenerDeps,
      [relationshipId, firstRowId],
    );
  const useCreateQueries = (store, create, createDeps) =>
    useCreate(store, create, createDeps);
  const useQueryIds = (queriesOrQueriesId) =>
    useListenable(
      QUERY + IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      1 /* Array */,
    );
  const useResultTable = (queryId, queriesOrQueriesId) =>
    useListenable(
      RESULT + TABLE,
      useQueriesOrQueriesById(queriesOrQueriesId),
      0 /* Object */,
      [queryId],
    );
  const useResultTableCellIds = (queryId, queriesOrQueriesId) =>
    useListenable(
      RESULT + TABLE + CELL_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      1 /* Array */,
      [queryId],
    );
  const useResultRowCount = (queryId, queriesOrQueriesId) =>
    useListenable(
      RESULT + ROW_COUNT,
      useQueriesOrQueriesById(queriesOrQueriesId),
      5 /* Number */,
      [queryId],
    );
  const useResultRowIds = (queryId, queriesOrQueriesId) =>
    useListenable(
      RESULT + ROW_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      1 /* Array */,
      [queryId],
    );
  const useResultSortedRowIds = (
    queryId,
    cellId,
    descending,
    offset = 0,
    limit,
    queriesOrQueriesId,
  ) =>
    useListenable(
      RESULT + SORTED_ROW_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      1 /* Array */,
      [queryId, cellId, descending, offset, limit],
    );
  const useResultRow = (queryId, rowId, queriesOrQueriesId) =>
    useListenable(
      RESULT + ROW,
      useQueriesOrQueriesById(queriesOrQueriesId),
      0 /* Object */,
      [queryId, rowId],
    );
  const useResultCellIds = (queryId, rowId, queriesOrQueriesId) =>
    useListenable(
      RESULT + CELL_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      1 /* Array */,
      [queryId, rowId],
    );
  const useResultCell = (queryId, rowId, cellId, queriesOrQueriesId) =>
    useListenable(
      RESULT + CELL,
      useQueriesOrQueriesById(queriesOrQueriesId),
      3 /* CellOrValue */,
      [queryId, rowId, cellId],
    );
  const useResultTableListener = (
    queryId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + TABLE,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId],
    );
  const useResultTableCellIdsListener = (
    queryId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + TABLE + CELL_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId],
    );
  const useResultRowCountListener = (
    queryId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + ROW_COUNT,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId],
    );
  const useResultRowIdsListener = (
    queryId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + ROW_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId],
    );
  const useResultSortedRowIdsListener = (
    queryId,
    cellId,
    descending,
    offset,
    limit,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + SORTED_ROW_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId, cellId, descending, offset, limit],
    );
  const useResultRowListener = (
    queryId,
    rowId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + ROW,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId, rowId],
    );
  const useResultCellIdsListener = (
    queryId,
    rowId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + CELL_IDS,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId, rowId],
    );
  const useResultCellListener = (
    queryId,
    rowId,
    cellId,
    listener,
    listenerDeps,
    queriesOrQueriesId,
  ) =>
    useListener(
      RESULT + CELL,
      useQueriesOrQueriesById(queriesOrQueriesId),
      listener,
      listenerDeps,
      [queryId, rowId, cellId],
    );
  const useCreateCheckpoints = (store, create, createDeps) =>
    useCreate(store, create, createDeps);
  const useCheckpointIds = (checkpointsOrCheckpointsId) =>
    useListenable(
      CHECKPOINT + IDS,
      useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
      2 /* Checkpoints */,
    );
  const useCheckpoint = (checkpointId, checkpointsOrCheckpointsId) =>
    useListenable(
      CHECKPOINT,
      useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
      3 /* CellOrValue */,
      [checkpointId],
    );
  const useSetCheckpointCallback = (
    getCheckpoint = getUndefined,
    getCheckpointDeps = EMPTY_ARRAY,
    checkpointsOrCheckpointsId,
    then = getUndefined,
    thenDeps = EMPTY_ARRAY,
  ) => {
    const checkpoints = useCheckpointsOrCheckpointsById(
      checkpointsOrCheckpointsId,
    );
    return useCallback(
      (parameter) =>
        ifNotUndefined(checkpoints, (checkpoints2) => {
          const label = getCheckpoint(parameter);
          then(checkpoints2.addCheckpoint(label), checkpoints2, label);
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [checkpoints, ...getCheckpointDeps, ...thenDeps],
    );
  };
  const useGoBackwardCallback = (checkpointsOrCheckpointsId) =>
    useCheckpointAction(checkpointsOrCheckpointsId, 'goBackward');
  const useGoForwardCallback = (checkpointsOrCheckpointsId) =>
    useCheckpointAction(checkpointsOrCheckpointsId, 'goForward');
  const useGoToCallback = (
    getCheckpointId,
    getCheckpointIdDeps = EMPTY_ARRAY,
    checkpointsOrCheckpointsId,
    then = getUndefined,
    thenDeps = EMPTY_ARRAY,
  ) => {
    const checkpoints = useCheckpointsOrCheckpointsById(
      checkpointsOrCheckpointsId,
    );
    return useCallback(
      (parameter) =>
        ifNotUndefined(checkpoints, (checkpoints2) =>
          ifNotUndefined(getCheckpointId(parameter), (checkpointId) =>
            then(checkpoints2.goTo(checkpointId), checkpointId),
          ),
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [checkpoints, ...getCheckpointIdDeps, ...thenDeps],
    );
  };
  const useUndoInformation = (checkpointsOrCheckpointsId) => {
    const checkpoints = useCheckpointsOrCheckpointsById(
      checkpointsOrCheckpointsId,
    );
    const [backwardIds, currentId] = useCheckpointIds(checkpoints);
    return [
      !arrayIsEmpty(backwardIds),
      useGoBackwardCallback(checkpoints),
      currentId,
      ifNotUndefined(currentId, (id) => checkpoints?.getCheckpoint(id)) ??
        EMPTY_STRING,
    ];
  };
  const useRedoInformation = (checkpointsOrCheckpointsId) => {
    const checkpoints = useCheckpointsOrCheckpointsById(
      checkpointsOrCheckpointsId,
    );
    const [, , [forwardId]] = useCheckpointIds(checkpoints);
    return [
      !isUndefined(forwardId),
      useGoForwardCallback(checkpoints),
      forwardId,
      ifNotUndefined(forwardId, (id) => checkpoints?.getCheckpoint(id)) ??
        EMPTY_STRING,
    ];
  };
  const useCheckpointIdsListener = (
    listener,
    listenerDeps,
    checkpointsOrCheckpointsId,
  ) =>
    useListener(
      CHECKPOINT + IDS,
      useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
      listener,
      listenerDeps,
    );
  const useCheckpointListener = (
    checkpointId,
    listener,
    listenerDeps,
    checkpointsOrCheckpointsId,
  ) =>
    useListener(
      CHECKPOINT,
      useCheckpointsOrCheckpointsById(checkpointsOrCheckpointsId),
      listener,
      listenerDeps,
      [checkpointId],
    );
  const useCreatePersister = (
    store,
    create,
    createDeps = EMPTY_ARRAY,
    then,
    thenDeps = EMPTY_ARRAY,
    destroy,
    destroyDeps = EMPTY_ARRAY,
  ) => {
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
      [store, ...createDeps, ...thenDeps],
    );
    useEffect(
      () => () => {
        if (persister) {
          persister.destroy();
          destroy?.(persister);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [persister, ...destroyDeps],
    );
    return persister;
  };
  const usePersisterStatus = (persisterOrPersisterId) =>
    useListenable(
      STATUS,
      usePersisterOrPersisterById(persisterOrPersisterId),
      5 /* Number */,
      [],
    );
  const usePersisterStatusListener = (
    listener,
    listenerDeps,
    persisterOrPersisterId,
  ) =>
    useListener(
      STATUS,
      usePersisterOrPersisterById(persisterOrPersisterId),
      listener,
      listenerDeps,
      [],
    );
  const useCreateSynchronizer = (
    store,
    create,
    createDeps = EMPTY_ARRAY,
    destroy,
    destroyDeps = EMPTY_ARRAY,
  ) => {
    const [synchronizer, setSynchronizer] = useState();
    useEffect(
      () => {
        (async () => {
          const synchronizer2 = store ? await create(store) : void 0;
          setSynchronizer(synchronizer2);
        })();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store, ...createDeps],
    );
    useEffect(
      () => () => {
        if (synchronizer) {
          synchronizer.destroy();
          destroy?.(synchronizer);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [synchronizer, ...destroyDeps],
    );
    return synchronizer;
  };
  const useSynchronizerStatus = (synchronizerOrSynchronizerId) =>
    useListenable(
      STATUS,
      useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
      5 /* Number */,
      [],
    );
  const useSynchronizerStatusListener = (
    listener,
    listenerDeps,
    synchronizerOrSynchronizerId,
  ) =>
    useListener(
      STATUS,
      useSynchronizerOrSynchronizerById(synchronizerOrSynchronizerId),
      listener,
      listenerDeps,
      [],
    );

  const mergeParentThings = (
    offset,
    parentValue,
    defaultThing,
    thingsById,
    extraThingsById,
  ) => [
    defaultThing ?? parentValue[offset * 2],
    {
      ...parentValue[offset * 2 + 1],
      ...thingsById,
      ...extraThingsById[offset],
    },
  ];
  const tableView = (
    {
      tableId,
      store,
      rowComponent: Row = RowView,
      getRowComponentProps,
      customCellIds,
      separator,
      debugIds,
    },
    rowIds,
  ) =>
    wrap(
      arrayMap(rowIds, (rowId) =>
        /* @__PURE__ */ createElement(Row, {
          ...getProps(getRowComponentProps, rowId),
          key: rowId,
          tableId,
          rowId,
          customCellIds,
          store,
          debugIds,
        }),
      ),
      separator,
      debugIds,
      tableId,
    );
  const resultTableView = (
    {
      queryId,
      queries,
      resultRowComponent: ResultRow = ResultRowView,
      getResultRowComponentProps,
      separator,
      debugIds,
    },
    rowIds,
  ) =>
    wrap(
      arrayMap(rowIds, (rowId) =>
        /* @__PURE__ */ createElement(ResultRow, {
          ...getProps(getResultRowComponentProps, rowId),
          key: rowId,
          queryId,
          rowId,
          queries,
          debugIds,
        }),
      ),
      separator,
      debugIds,
      queryId,
    );
  const useComponentPerRow = (
    {
      relationshipId,
      relationships,
      rowComponent: Row = RowView,
      getRowComponentProps,
      separator,
      debugIds,
    },
    getRowIdsHook,
    rowId,
  ) => {
    const [resolvedRelationships, store, localTableId] =
      getRelationshipsStoreTableIds(
        useRelationshipsOrRelationshipsById(relationships),
        relationshipId,
      );
    const rowIds = getRowIdsHook(relationshipId, rowId, resolvedRelationships);
    return wrap(
      arrayMap(rowIds, (rowId2) =>
        /* @__PURE__ */ createElement(Row, {
          ...getProps(getRowComponentProps, rowId2),
          key: rowId2,
          tableId: localTableId,
          rowId: rowId2,
          store,
          debugIds,
        }),
      ),
      separator,
      debugIds,
      rowId,
    );
  };
  const getUseCheckpointView =
    (getCheckpoints) =>
    ({
      checkpoints,
      checkpointComponent: Checkpoint = CheckpointView,
      getCheckpointComponentProps,
      separator,
      debugIds,
    }) => {
      const resolvedCheckpoints = useCheckpointsOrCheckpointsById(checkpoints);
      return wrap(
        arrayMap(
          getCheckpoints(useCheckpointIds(resolvedCheckpoints)),
          (checkpointId) =>
            /* @__PURE__ */ createElement(Checkpoint, {
              ...getProps(getCheckpointComponentProps, checkpointId),
              key: checkpointId,
              checkpoints: resolvedCheckpoints,
              checkpointId,
              debugIds,
            }),
        ),
        separator,
      );
    };
  const Provider = ({
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
    children,
  }) => {
    const parentValue = useContext(Context);
    const [extraThingsById, setExtraThingsById] = useState(() =>
      arrayNew(8, () => ({})),
    );
    const addExtraThingById = useCallback(
      (thingOffset, id, thing) =>
        setExtraThingsById((extraThingsById2) =>
          objGet(extraThingsById2[thingOffset], id) == thing
            ? extraThingsById2
            : arrayWith(extraThingsById2, thingOffset, {
                ...extraThingsById2[thingOffset],
                [id]: thing,
              }),
        ),
      [],
    );
    const delExtraThingById = useCallback(
      (thingOffset, id) =>
        setExtraThingsById((extraThingsById2) =>
          !objHas(extraThingsById2[thingOffset], id)
            ? extraThingsById2
            : arrayWith(
                extraThingsById2,
                thingOffset,
                objDel(extraThingsById2[thingOffset], id),
              ),
        ),
      [],
    );
    return /* @__PURE__ */ createElement(
      Context.Provider,
      {
        value: useMemo(
          () => [
            ...mergeParentThings(
              0 /* Store */,
              parentValue,
              store,
              storesById,
              extraThingsById,
            ),
            ...mergeParentThings(
              1 /* Metrics */,
              parentValue,
              metrics,
              metricsById,
              extraThingsById,
            ),
            ...mergeParentThings(
              2 /* Indexes */,
              parentValue,
              indexes,
              indexesById,
              extraThingsById,
            ),
            ...mergeParentThings(
              3 /* Relationships */,
              parentValue,
              relationships,
              relationshipsById,
              extraThingsById,
            ),
            ...mergeParentThings(
              4 /* Queries */,
              parentValue,
              queries,
              queriesById,
              extraThingsById,
            ),
            ...mergeParentThings(
              5 /* Checkpoints */,
              parentValue,
              checkpoints,
              checkpointsById,
              extraThingsById,
            ),
            ...mergeParentThings(
              6 /* Persister */,
              parentValue,
              persister,
              persistersById,
              extraThingsById,
            ),
            ...mergeParentThings(
              7 /* Synchronizer */,
              parentValue,
              synchronizer,
              synchronizersById,
              extraThingsById,
            ),
            addExtraThingById,
            delExtraThingById,
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
            delExtraThingById,
          ],
        ),
      },
      children,
    );
  };
  const wrap = (children, separator, encloseWithId, id) => {
    const separated =
      isUndefined(separator) || !isArray(children)
        ? children
        : arrayMap(children, (child, c) =>
            c > 0 ? [separator, child] : child,
          );
    return encloseWithId ? [id, ':{', separated, '}'] : separated;
  };
  const useCustomOrDefaultCellIds = (customCellIds, tableId, rowId, store) => {
    const defaultCellIds = useCellIds(tableId, rowId, store);
    return customCellIds ?? defaultCellIds;
  };
  const CellView = ({tableId, rowId, cellId, store, debugIds}) =>
    wrap(
      EMPTY_STRING + (useCell(tableId, rowId, cellId, store) ?? EMPTY_STRING),
      void 0,
      debugIds,
      cellId,
    );
  const RowView = ({
    tableId,
    rowId,
    store,
    cellComponent: Cell = CellView,
    getCellComponentProps,
    customCellIds,
    separator,
    debugIds,
  }) =>
    wrap(
      arrayMap(
        useCustomOrDefaultCellIds(customCellIds, tableId, rowId, store),
        (cellId) =>
          /* @__PURE__ */ createElement(Cell, {
            ...getProps(getCellComponentProps, cellId),
            key: cellId,
            tableId,
            rowId,
            cellId,
            store,
            debugIds,
          }),
      ),
      separator,
      debugIds,
      rowId,
    );
  const TableView = (props) =>
    tableView(props, useRowIds(props.tableId, props.store));
  const SortedTableView = ({cellId, descending, offset, limit, ...props}) =>
    tableView(
      props,
      useSortedRowIds(
        props.tableId,
        cellId,
        descending,
        offset,
        limit,
        props.store,
      ),
    );
  const TablesView = ({
    store,
    tableComponent: Table = TableView,
    getTableComponentProps,
    separator,
    debugIds,
  }) =>
    wrap(
      arrayMap(useTableIds(store), (tableId) =>
        /* @__PURE__ */ createElement(Table, {
          ...getProps(getTableComponentProps, tableId),
          key: tableId,
          tableId,
          store,
          debugIds,
        }),
      ),
      separator,
    );
  const ValueView = ({valueId, store, debugIds}) =>
    wrap(
      EMPTY_STRING + (useValue(valueId, store) ?? EMPTY_STRING),
      void 0,
      debugIds,
      valueId,
    );
  const ValuesView = ({
    store,
    valueComponent: Value = ValueView,
    getValueComponentProps,
    separator,
    debugIds,
  }) =>
    wrap(
      arrayMap(useValueIds(store), (valueId) =>
        /* @__PURE__ */ createElement(Value, {
          ...getProps(getValueComponentProps, valueId),
          key: valueId,
          valueId,
          store,
          debugIds,
        }),
      ),
      separator,
    );
  const MetricView = ({metricId, metrics, debugIds}) =>
    wrap(
      useMetric(metricId, metrics) ?? EMPTY_STRING,
      void 0,
      debugIds,
      metricId,
    );
  const SliceView = ({
    indexId,
    sliceId,
    indexes,
    rowComponent: Row = RowView,
    getRowComponentProps,
    separator,
    debugIds,
  }) => {
    const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
      useIndexesOrIndexesById(indexes),
      indexId,
    );
    const rowIds = useSliceRowIds(indexId, sliceId, resolvedIndexes);
    return wrap(
      arrayMap(rowIds, (rowId) =>
        /* @__PURE__ */ createElement(Row, {
          ...getProps(getRowComponentProps, rowId),
          key: rowId,
          tableId,
          rowId,
          store,
          debugIds,
        }),
      ),
      separator,
      debugIds,
      sliceId,
    );
  };
  const IndexView = ({
    indexId,
    indexes,
    sliceComponent: Slice = SliceView,
    getSliceComponentProps,
    separator,
    debugIds,
  }) =>
    wrap(
      arrayMap(useSliceIds(indexId, indexes), (sliceId) =>
        /* @__PURE__ */ createElement(Slice, {
          ...getProps(getSliceComponentProps, sliceId),
          key: sliceId,
          indexId,
          sliceId,
          indexes,
          debugIds,
        }),
      ),
      separator,
      debugIds,
      indexId,
    );
  const RemoteRowView = ({
    relationshipId,
    localRowId,
    relationships,
    rowComponent: Row = RowView,
    getRowComponentProps,
    debugIds,
  }) => {
    const [resolvedRelationships, store, , remoteTableId] =
      getRelationshipsStoreTableIds(
        useRelationshipsOrRelationshipsById(relationships),
        relationshipId,
      );
    const rowId = useRemoteRowId(
      relationshipId,
      localRowId,
      resolvedRelationships,
    );
    return wrap(
      isUndefined(remoteTableId) || isUndefined(rowId)
        ? null
        : /* @__PURE__ */ createElement(Row, {
            ...getProps(getRowComponentProps, rowId),
            key: rowId,
            tableId: remoteTableId,
            rowId,
            store,
            debugIds,
          }),
      void 0,
      debugIds,
      localRowId,
    );
  };
  const LocalRowsView = (props) =>
    useComponentPerRow(props, useLocalRowIds, props.remoteRowId);
  const LinkedRowsView = (props) =>
    useComponentPerRow(props, useLinkedRowIds, props.firstRowId);
  const ResultCellView = ({queryId, rowId, cellId, queries, debugIds}) =>
    wrap(
      EMPTY_STRING +
        (useResultCell(queryId, rowId, cellId, queries) ?? EMPTY_STRING),
      void 0,
      debugIds,
      cellId,
    );
  const ResultRowView = ({
    queryId,
    rowId,
    queries,
    resultCellComponent: ResultCell = ResultCellView,
    getResultCellComponentProps,
    separator,
    debugIds,
  }) =>
    wrap(
      arrayMap(useResultCellIds(queryId, rowId, queries), (cellId) =>
        /* @__PURE__ */ createElement(ResultCell, {
          ...getProps(getResultCellComponentProps, cellId),
          key: cellId,
          queryId,
          rowId,
          cellId,
          queries,
          debugIds,
        }),
      ),
      separator,
      debugIds,
      rowId,
    );
  const ResultTableView = (props) =>
    resultTableView(props, useResultRowIds(props.queryId, props.queries));
  const ResultSortedTableView = ({
    cellId,
    descending,
    offset,
    limit,
    ...props
  }) =>
    resultTableView(
      props,
      useResultSortedRowIds(
        props.queryId,
        cellId,
        descending,
        offset,
        limit,
        props.queries,
      ),
    );
  const CheckpointView = ({checkpoints, checkpointId, debugIds}) =>
    wrap(
      useCheckpoint(checkpointId, checkpoints) ?? EMPTY_STRING,
      void 0,
      debugIds,
      checkpointId,
    );
  const BackwardCheckpointsView = getUseCheckpointView(
    (checkpointIds) => checkpointIds[0],
  );
  const CurrentCheckpointView = getUseCheckpointView((checkpointIds) =>
    isUndefined(checkpointIds[1]) ? [] : [checkpointIds[1]],
  );
  const ForwardCheckpointsView = getUseCheckpointView(
    (checkpointIds) => checkpointIds[2],
  );

  exports.BackwardCheckpointsView = BackwardCheckpointsView;
  exports.CellView = CellView;
  exports.CheckpointView = CheckpointView;
  exports.CurrentCheckpointView = CurrentCheckpointView;
  exports.ForwardCheckpointsView = ForwardCheckpointsView;
  exports.IndexView = IndexView;
  exports.LinkedRowsView = LinkedRowsView;
  exports.LocalRowsView = LocalRowsView;
  exports.MetricView = MetricView;
  exports.Provider = Provider;
  exports.RemoteRowView = RemoteRowView;
  exports.ResultCellView = ResultCellView;
  exports.ResultRowView = ResultRowView;
  exports.ResultSortedTableView = ResultSortedTableView;
  exports.ResultTableView = ResultTableView;
  exports.RowView = RowView;
  exports.SliceView = SliceView;
  exports.SortedTableView = SortedTableView;
  exports.TableView = TableView;
  exports.TablesView = TablesView;
  exports.ValueView = ValueView;
  exports.ValuesView = ValuesView;
  exports.useAddRowCallback = useAddRowCallback;
  exports.useCell = useCell;
  exports.useCellIds = useCellIds;
  exports.useCellIdsListener = useCellIdsListener;
  exports.useCellListener = useCellListener;
  exports.useCheckpoint = useCheckpoint;
  exports.useCheckpointIds = useCheckpointIds;
  exports.useCheckpointIdsListener = useCheckpointIdsListener;
  exports.useCheckpointListener = useCheckpointListener;
  exports.useCheckpoints = useCheckpoints;
  exports.useCheckpointsIds = useCheckpointsIds;
  exports.useCheckpointsOrCheckpointsById = useCheckpointsOrCheckpointsById;
  exports.useCreateCheckpoints = useCreateCheckpoints;
  exports.useCreateIndexes = useCreateIndexes;
  exports.useCreateMergeableStore = useCreateMergeableStore;
  exports.useCreateMetrics = useCreateMetrics;
  exports.useCreatePersister = useCreatePersister;
  exports.useCreateQueries = useCreateQueries;
  exports.useCreateRelationships = useCreateRelationships;
  exports.useCreateStore = useCreateStore;
  exports.useCreateSynchronizer = useCreateSynchronizer;
  exports.useDelCellCallback = useDelCellCallback;
  exports.useDelRowCallback = useDelRowCallback;
  exports.useDelTableCallback = useDelTableCallback;
  exports.useDelTablesCallback = useDelTablesCallback;
  exports.useDelValueCallback = useDelValueCallback;
  exports.useDelValuesCallback = useDelValuesCallback;
  exports.useDidFinishTransactionListener = useDidFinishTransactionListener;
  exports.useGoBackwardCallback = useGoBackwardCallback;
  exports.useGoForwardCallback = useGoForwardCallback;
  exports.useGoToCallback = useGoToCallback;
  exports.useHasCell = useHasCell;
  exports.useHasCellListener = useHasCellListener;
  exports.useHasRow = useHasRow;
  exports.useHasRowListener = useHasRowListener;
  exports.useHasTable = useHasTable;
  exports.useHasTableCell = useHasTableCell;
  exports.useHasTableCellListener = useHasTableCellListener;
  exports.useHasTableListener = useHasTableListener;
  exports.useHasTables = useHasTables;
  exports.useHasTablesListener = useHasTablesListener;
  exports.useHasValue = useHasValue;
  exports.useHasValueListener = useHasValueListener;
  exports.useHasValues = useHasValues;
  exports.useHasValuesListener = useHasValuesListener;
  exports.useIndexIds = useIndexIds;
  exports.useIndexes = useIndexes;
  exports.useIndexesIds = useIndexesIds;
  exports.useIndexesOrIndexesById = useIndexesOrIndexesById;
  exports.useLinkedRowIds = useLinkedRowIds;
  exports.useLinkedRowIdsListener = useLinkedRowIdsListener;
  exports.useLocalRowIds = useLocalRowIds;
  exports.useLocalRowIdsListener = useLocalRowIdsListener;
  exports.useMetric = useMetric;
  exports.useMetricIds = useMetricIds;
  exports.useMetricListener = useMetricListener;
  exports.useMetrics = useMetrics;
  exports.useMetricsIds = useMetricsIds;
  exports.useMetricsOrMetricsById = useMetricsOrMetricsById;
  exports.usePersister = usePersister;
  exports.usePersisterIds = usePersisterIds;
  exports.usePersisterOrPersisterById = usePersisterOrPersisterById;
  exports.usePersisterStatus = usePersisterStatus;
  exports.usePersisterStatusListener = usePersisterStatusListener;
  exports.useProvideCheckpoints = useProvideCheckpoints;
  exports.useProvideIndexes = useProvideIndexes;
  exports.useProvideMetrics = useProvideMetrics;
  exports.useProvidePersister = useProvidePersister;
  exports.useProvideQueries = useProvideQueries;
  exports.useProvideRelationships = useProvideRelationships;
  exports.useProvideStore = useProvideStore;
  exports.useProvideSynchronizer = useProvideSynchronizer;
  exports.useQueries = useQueries;
  exports.useQueriesIds = useQueriesIds;
  exports.useQueriesOrQueriesById = useQueriesOrQueriesById;
  exports.useQueryIds = useQueryIds;
  exports.useRedoInformation = useRedoInformation;
  exports.useRelationshipIds = useRelationshipIds;
  exports.useRelationships = useRelationships;
  exports.useRelationshipsIds = useRelationshipsIds;
  exports.useRelationshipsOrRelationshipsById =
    useRelationshipsOrRelationshipsById;
  exports.useRemoteRowId = useRemoteRowId;
  exports.useRemoteRowIdListener = useRemoteRowIdListener;
  exports.useResultCell = useResultCell;
  exports.useResultCellIds = useResultCellIds;
  exports.useResultCellIdsListener = useResultCellIdsListener;
  exports.useResultCellListener = useResultCellListener;
  exports.useResultRow = useResultRow;
  exports.useResultRowCount = useResultRowCount;
  exports.useResultRowCountListener = useResultRowCountListener;
  exports.useResultRowIds = useResultRowIds;
  exports.useResultRowIdsListener = useResultRowIdsListener;
  exports.useResultRowListener = useResultRowListener;
  exports.useResultSortedRowIds = useResultSortedRowIds;
  exports.useResultSortedRowIdsListener = useResultSortedRowIdsListener;
  exports.useResultTable = useResultTable;
  exports.useResultTableCellIds = useResultTableCellIds;
  exports.useResultTableCellIdsListener = useResultTableCellIdsListener;
  exports.useResultTableListener = useResultTableListener;
  exports.useRow = useRow;
  exports.useRowCount = useRowCount;
  exports.useRowCountListener = useRowCountListener;
  exports.useRowIds = useRowIds;
  exports.useRowIdsListener = useRowIdsListener;
  exports.useRowListener = useRowListener;
  exports.useSetCellCallback = useSetCellCallback;
  exports.useSetCheckpointCallback = useSetCheckpointCallback;
  exports.useSetPartialRowCallback = useSetPartialRowCallback;
  exports.useSetPartialValuesCallback = useSetPartialValuesCallback;
  exports.useSetRowCallback = useSetRowCallback;
  exports.useSetTableCallback = useSetTableCallback;
  exports.useSetTablesCallback = useSetTablesCallback;
  exports.useSetValueCallback = useSetValueCallback;
  exports.useSetValuesCallback = useSetValuesCallback;
  exports.useSliceIds = useSliceIds;
  exports.useSliceIdsListener = useSliceIdsListener;
  exports.useSliceRowIds = useSliceRowIds;
  exports.useSliceRowIdsListener = useSliceRowIdsListener;
  exports.useSortedRowIds = useSortedRowIds;
  exports.useSortedRowIdsListener = useSortedRowIdsListener;
  exports.useStartTransactionListener = useStartTransactionListener;
  exports.useStore = useStore;
  exports.useStoreIds = useStoreIds;
  exports.useStoreOrStoreById = useStoreOrStoreById;
  exports.useStores = useStores;
  exports.useSynchronizer = useSynchronizer;
  exports.useSynchronizerIds = useSynchronizerIds;
  exports.useSynchronizerOrSynchronizerById = useSynchronizerOrSynchronizerById;
  exports.useSynchronizerStatus = useSynchronizerStatus;
  exports.useSynchronizerStatusListener = useSynchronizerStatusListener;
  exports.useTable = useTable;
  exports.useTableCellIds = useTableCellIds;
  exports.useTableCellIdsListener = useTableCellIdsListener;
  exports.useTableIds = useTableIds;
  exports.useTableIdsListener = useTableIdsListener;
  exports.useTableListener = useTableListener;
  exports.useTables = useTables;
  exports.useTablesListener = useTablesListener;
  exports.useUndoInformation = useUndoInformation;
  exports.useValue = useValue;
  exports.useValueIds = useValueIds;
  exports.useValueIdsListener = useValueIdsListener;
  exports.useValueListener = useValueListener;
  exports.useValues = useValues;
  exports.useValuesListener = useValuesListener;
  exports.useWillFinishTransactionListener = useWillFinishTransactionListener;
});
