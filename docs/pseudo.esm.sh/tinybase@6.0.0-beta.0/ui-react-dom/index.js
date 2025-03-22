// dist/ui-react-dom/index.js
import { jsx as jsx2, jsxs, Fragment } from "react/jsx-runtime";

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
var SLICE = "Slice";
var REMOTE_ROW_ID = "Remote" + ROW + "Id";
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
var objGet = (obj, id) => ifNotUndefined(obj, (obj2) => obj2[id]);
var objHas = (obj, id) => id in obj;
var objSize = (obj) => size(objIds(obj));
var objIsEqual = (obj1, obj2) => {
  const entries1 = objEntries(obj1);
  return size(entries1) === objSize(obj2) && arrayEvery(
    entries1,
    ([index, value1]) => isObject(value1) ? isObject(obj2[index]) ? objIsEqual(obj2[index], value1) : false : obj2[index] === value1
  );
};
var objEnsure = (obj, id, getDefaultValue) => {
  if (!objHas(obj, id)) {
    obj[id] = getDefaultValue();
  }
  return obj[id];
};
var Context = objEnsure(GLOBAL, TINYBASE + "_uirc", () => createContext([]));
var useThing = (id, offset) => {
  const contextValue = useContext(Context);
  return isUndefined(id) ? contextValue[offset * 2] : isString(id) ? objGet(contextValue[offset * 2 + 1], id) : id;
};
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId) ? thing : thingOrThingId;
};
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(
  storeOrStoreId,
  0
  /* Store */
);
var useIndexesOrIndexesById = (indexesOrIndexesId) => useThingOrThingById(
  indexesOrIndexesId,
  2
  /* Indexes */
);
var useRelationshipsOrRelationshipsById = (relationshipsOrRelationshipsId) => useThingOrThingById(
  relationshipsOrRelationshipsId,
  3
  /* Relationships */
);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(
  queriesOrQueriesId,
  4
  /* Queries */
);
var useCheckpointsOrCheckpointsById = (checkpointsOrCheckpointsId) => useThingOrThingById(
  checkpointsOrCheckpointsId,
  5
  /* Checkpoints */
);
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
var useSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => useListenable(
  SLICE + ROW_IDS,
  useIndexesOrIndexesById(indexesOrIndexesId),
  1,
  [indexId, sliceId]
);
var useRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => useListenable(
  REMOTE_ROW_ID,
  useRelationshipsOrRelationshipsById(relationshipsOrRelationshipsId),
  3,
  [relationshipId, localRowId]
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
var useResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => useListenable(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  3,
  [queryId, rowId, cellId]
);
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
var wrap = (children, separator, encloseWithId, id) => {
  const separated = isUndefined(separator) || !isArray(children) ? children : arrayMap(children, (child, c) => c > 0 ? [separator, child] : child);
  return encloseWithId ? [id, ":{", separated, "}"] : separated;
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

// dist/ui-react-dom/index.js
import React2 from "react";
var getTypeOf2 = (thing) => typeof thing;
var EMPTY_STRING2 = "";
var STRING2 = getTypeOf2(EMPTY_STRING2);
var BOOLEAN = getTypeOf2(true);
var NUMBER = getTypeOf2(0);
var CELL2 = "Cell";
var VALUE2 = "Value";
var CURRENT_TARGET = "currentTarget";
var _VALUE = "value";
var strSplit = (str, separator = EMPTY_STRING2, limit) => str.split(separator, limit);
var math = Math;
var mathMin = math.min;
var isFiniteNumber = isFinite;
var isUndefined2 = (thing) => thing == void 0;
var isTypeStringOrBoolean = (type) => type == STRING2 || type == BOOLEAN;
var isString2 = (thing) => getTypeOf2(thing) == STRING2;
var isArray2 = (thing) => Array.isArray(thing);
var getCellOrValueType = (cellOrValue) => {
  const type = getTypeOf2(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var getTypeCase = (type, stringCase, numberCase, booleanCase) => type == STRING2 ? stringCase : type == NUMBER ? numberCase : booleanCase;
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
var arrayMap2 = (array, cb) => array.map(cb);
var object2 = Object;
var objEntries2 = object2.entries;
var objNew = (entries = []) => object2.fromEntries(entries);
var objToArray = (obj, cb) => arrayMap2(objEntries2(obj), ([id, value]) => cb(value, id));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));
var DOT = ".";
var EDITABLE = "editable";
var LEFT_ARROW = "\u2190";
var UP_ARROW = "\u2191";
var RIGHT_ARROW = "\u2192";
var DOWN_ARROW = "\u2193";
var useDottedCellIds = (tableId, store) => arrayMap2(useTableCellIds(tableId, store), (cellId) => tableId + DOT + cellId);
var useCallbackOrUndefined = (callback, deps, test) => {
  const returnCallback = useCallback2(callback, deps);
  return test ? returnCallback : void 0;
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
var TableInHtmlTable = ({ tableId, store, editable, customCells, ...props }) => /* @__PURE__ */ jsx2(HtmlTable, {
  ...props,
  params: useParams(
    useCells(
      useTableCellIds(tableId, store),
      customCells,
      editable ? EditableCellView : CellView
    ),
    useStoreCellComponentProps(store, tableId),
    useRowIds(tableId, store)
  )
});
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
var ResultTableInHtmlTable = ({ queryId, queries, customCells, ...props }) => /* @__PURE__ */ jsx2(HtmlTable, {
  ...props,
  params: useParams(
    useCells(
      useResultTableCellIds(queryId, queries),
      customCells,
      ResultCellView
    ),
    useQueriesCellComponentProps(queries, queryId),
    useResultRowIds(queryId, queries)
  )
});
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
export {
  EditableCellView,
  EditableValueView,
  RelationshipInHtmlTable,
  ResultSortedTableInHtmlTable,
  ResultTableInHtmlTable,
  SliceInHtmlTable,
  SortedTableInHtmlTable,
  SortedTablePaginator,
  TableInHtmlTable,
  ValuesInHtmlTable
};
