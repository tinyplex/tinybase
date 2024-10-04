(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('../ui-react/index.js'), require('react'))
    : typeof define === 'function' && define.amd
      ? define(['exports', '../ui-react', 'react'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory(
          (global.TinyBaseUiReactDom = {}),
          global.TinyBaseUiReact,
          global.React,
        ));
})(this, function (exports, uiReact, React) {
  'use strict';

  const getTypeOf = (thing) => typeof thing;
  const EMPTY_STRING = '';
  const STRING = getTypeOf(EMPTY_STRING);
  const BOOLEAN = getTypeOf(true);
  const NUMBER = getTypeOf(0);
  const CELL = 'Cell';
  const VALUE = 'Value';
  const CURRENT_TARGET = 'currentTarget';
  const _VALUE = 'value';
  const strSplit = (str, separator = EMPTY_STRING, limit) =>
    str.split(separator, limit);

  const math = Math;
  const mathMin = math.min;
  const isFiniteNumber = isFinite;
  const isUndefined = (thing) => thing == void 0;
  const isTypeStringOrBoolean = (type) => type == STRING || type == BOOLEAN;
  const isString = (thing) => getTypeOf(thing) == STRING;
  const isArray = (thing) => Array.isArray(thing);

  const getCellOrValueType = (cellOrValue) => {
    const type = getTypeOf(cellOrValue);
    return isTypeStringOrBoolean(type) ||
      (type == NUMBER && isFiniteNumber(cellOrValue))
      ? type
      : void 0;
  };
  const getTypeCase = (type, stringCase, numberCase, booleanCase) =>
    type == STRING ? stringCase : type == NUMBER ? numberCase : booleanCase;

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

  const arrayMap = (array, cb) => array.map(cb);

  const object = Object;
  const objEntries = object.entries;
  const objNew = (entries = []) => object.fromEntries(entries);
  const objToArray = (obj, cb) =>
    arrayMap(objEntries(obj), ([id, value]) => cb(value, id));
  const objMap = (obj, cb) =>
    objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));

  const DOT = '.';
  const EDITABLE = 'editable';
  const LEFT_ARROW = '\u2190';
  const UP_ARROW = '\u2191';
  const RIGHT_ARROW = '\u2192';
  const DOWN_ARROW = '\u2193';
  const useDottedCellIds = (tableId, store) =>
    arrayMap(
      uiReact.useTableCellIds(tableId, store),
      (cellId) => tableId + DOT + cellId,
    );
  const useCallbackOrUndefined = (callback, deps, test) => {
    const returnCallback = useCallback(callback, deps);
    return test ? returnCallback : void 0;
  };
  const useParams = (...args) =>
    useMemo(
      () => args,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      args,
    );
  const useStoreCellComponentProps = (store, tableId) =>
    useMemo(() => ({store, tableId}), [store, tableId]);
  const useQueriesCellComponentProps = (queries, queryId) =>
    useMemo(() => ({queries, queryId}), [queries, queryId]);
  const useSortingAndPagination = (
    cellId,
    descending = false,
    sortOnClick,
    offset = 0,
    limit,
    total,
    paginator,
    onChange,
  ) => {
    const [[currentCellId, currentDescending, currentOffset], setState] =
      useState([cellId, descending, offset]);
    const setStateAndChange = useCallback(
      (sortAndOffset) => {
        setState(sortAndOffset);
        onChange?.(sortAndOffset);
      },
      [onChange],
    );
    const handleSort = useCallbackOrUndefined(
      (cellId2) =>
        setStateAndChange([
          cellId2,
          cellId2 == currentCellId ? !currentDescending : false,
          currentOffset,
        ]),
      [setStateAndChange, currentCellId, currentDescending, currentOffset],
      sortOnClick,
    );
    const handleChangeOffset = useCallback(
      (offset2) =>
        setStateAndChange([currentCellId, currentDescending, offset2]),
      [setStateAndChange, currentCellId, currentDescending],
    );
    const PaginatorComponent =
      paginator === true ? SortedTablePaginator : paginator;
    return [
      [currentCellId, currentDescending, currentOffset],
      handleSort,
      useMemo(
        () =>
          paginator === false
            ? null
            : /* @__PURE__ */ createElement(PaginatorComponent, {
                offset: currentOffset,
                limit,
                total,
                onChange: handleChangeOffset,
              }),
        [
          paginator,
          PaginatorComponent,
          currentOffset,
          limit,
          total,
          handleChangeOffset,
        ],
      ),
    ];
  };
  const useCells = (defaultCellIds, customCells, defaultCellComponent) =>
    useMemo(() => {
      const cellIds = customCells ?? defaultCellIds;
      return objMap(
        isArray(cellIds)
          ? objNew(arrayMap(cellIds, (cellId) => [cellId, cellId]))
          : cellIds,
        (labelOrCustomCell, cellId) => ({
          ...{label: cellId, component: defaultCellComponent},
          ...(isString(labelOrCustomCell)
            ? {label: labelOrCustomCell}
            : labelOrCustomCell),
        }),
      );
    }, [customCells, defaultCellComponent, defaultCellIds]);
  const HtmlTable = ({
    className,
    headerRow,
    idColumn,
    params: [
      cells,
      cellComponentProps,
      rowIds,
      sortAndOffset,
      handleSort,
      paginatorComponent,
    ],
  }) =>
    /* @__PURE__ */ createElement(
      'table',
      {className},
      paginatorComponent
        ? /* @__PURE__ */ createElement('caption', null, paginatorComponent)
        : null,
      headerRow === false
        ? null
        : /* @__PURE__ */ createElement(
            'thead',
            null,
            /* @__PURE__ */ createElement(
              'tr',
              null,
              idColumn === false
                ? null
                : /* @__PURE__ */ createElement(HtmlHeaderCell, {
                    sort: sortAndOffset ?? [],
                    label: 'Id',
                    onClick: handleSort,
                  }),
              objToArray(cells, ({label}, cellId) =>
                /* @__PURE__ */ createElement(HtmlHeaderCell, {
                  key: cellId,
                  cellId,
                  label,
                  sort: sortAndOffset ?? [],
                  onClick: handleSort,
                }),
              ),
            ),
          ),
      /* @__PURE__ */ createElement(
        'tbody',
        null,
        arrayMap(rowIds, (rowId) =>
          /* @__PURE__ */ createElement(
            'tr',
            {key: rowId},
            idColumn === false
              ? null
              : /* @__PURE__ */ createElement('th', null, rowId),
            objToArray(
              cells,
              ({component: CellView2, getComponentProps}, cellId) =>
                /* @__PURE__ */ createElement(
                  'td',
                  {key: cellId},
                  /* @__PURE__ */ createElement(CellView2, {
                    ...getProps(getComponentProps, rowId, cellId),
                    ...cellComponentProps,
                    rowId,
                    cellId,
                  }),
                ),
            ),
          ),
        ),
      ),
    );
  const HtmlHeaderCell = ({
    cellId,
    sort: [sortCellId, sortDescending],
    label = cellId ?? EMPTY_STRING,
    onClick,
  }) =>
    /* @__PURE__ */ createElement(
      'th',
      {
        onClick: useCallbackOrUndefined(
          () => onClick?.(cellId),
          [onClick, cellId],
          onClick,
        ),
        className:
          isUndefined(sortDescending) || sortCellId != cellId
            ? void 0
            : `sorted ${sortDescending ? 'de' : 'a'}scending`,
      },
      isUndefined(sortDescending) || sortCellId != cellId
        ? null
        : (sortDescending ? DOWN_ARROW : UP_ARROW) + ' ',
      label,
    );
  const RelationshipInHtmlRow = ({
    localRowId,
    params: [
      idColumn,
      cells,
      localTableId,
      remoteTableId,
      relationshipId,
      relationships,
      store,
    ],
  }) => {
    const remoteRowId = uiReact.useRemoteRowId(
      relationshipId,
      localRowId,
      relationships,
    );
    return /* @__PURE__ */ createElement(
      'tr',
      null,
      idColumn === false
        ? null
        : /* @__PURE__ */ createElement(
            Fragment,
            null,
            /* @__PURE__ */ createElement('th', null, localRowId),
            /* @__PURE__ */ createElement('th', null, remoteRowId),
          ),
      objToArray(
        cells,
        ({component: CellView2, getComponentProps}, compoundCellId) => {
          const [tableId, cellId] = strSplit(compoundCellId, DOT, 2);
          const rowId =
            tableId === localTableId
              ? localRowId
              : tableId === remoteTableId
                ? remoteRowId
                : null;
          return isUndefined(rowId)
            ? null
            : /* @__PURE__ */ createElement(
                'td',
                {key: compoundCellId},
                /* @__PURE__ */ createElement(CellView2, {
                  ...getProps(getComponentProps, rowId, cellId),
                  store,
                  tableId,
                  rowId,
                  cellId,
                }),
              );
        },
      ),
    );
  };
  const EditableThing = ({
    thing,
    onThingChange,
    className,
    hasSchema,
    showType = true,
  }) => {
    const [thingType, setThingType] = useState();
    const [currentThing, setCurrentThing] = useState();
    const [stringThing, setStringThing] = useState();
    const [numberThing, setNumberThing] = useState();
    const [booleanThing, setBooleanThing] = useState();
    if (currentThing !== thing) {
      setThingType(getCellOrValueType(thing));
      setCurrentThing(thing);
      setStringThing(String(thing));
      setNumberThing(Number(thing) || 0);
      setBooleanThing(Boolean(thing));
    }
    const handleThingChange = useCallback(
      (thing2, setTypedThing) => {
        setTypedThing(thing2);
        setCurrentThing(thing2);
        onThingChange(thing2);
      },
      [onThingChange],
    );
    const handleTypeChange = useCallback(() => {
      if (!hasSchema?.()) {
        const nextType = getTypeCase(thingType, NUMBER, BOOLEAN, STRING);
        const thing2 = getTypeCase(
          nextType,
          stringThing,
          numberThing,
          booleanThing,
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
      thingType,
    ]);
    return /* @__PURE__ */ createElement(
      'div',
      {className},
      showType
        ? /* @__PURE__ */ createElement(
            'button',
            {className: thingType, onClick: handleTypeChange},
            thingType,
          )
        : null,
      getTypeCase(
        thingType,
        /* @__PURE__ */ createElement('input', {
          key: thingType,
          value: stringThing,
          onChange: useCallback(
            (event) =>
              handleThingChange(
                String(event[CURRENT_TARGET][_VALUE]),
                setStringThing,
              ),
            [handleThingChange],
          ),
        }),
        /* @__PURE__ */ createElement('input', {
          key: thingType,
          type: 'number',
          value: numberThing,
          onChange: useCallback(
            (event) =>
              handleThingChange(
                Number(event[CURRENT_TARGET][_VALUE] || 0),
                setNumberThing,
              ),
            [handleThingChange],
          ),
        }),
        /* @__PURE__ */ createElement('input', {
          key: thingType,
          type: 'checkbox',
          checked: booleanThing,
          onChange: useCallback(
            (event) =>
              handleThingChange(
                Boolean(event[CURRENT_TARGET].checked),
                setBooleanThing,
              ),
            [handleThingChange],
          ),
        }),
      ),
    );
  };
  const TableInHtmlTable = ({
    tableId,
    store,
    editable,
    customCells,
    ...props
  }) =>
    /* @__PURE__ */ createElement(HtmlTable, {
      ...props,
      params: useParams(
        useCells(
          uiReact.useTableCellIds(tableId, store),
          customCells,
          editable ? EditableCellView : uiReact.CellView,
        ),
        useStoreCellComponentProps(store, tableId),
        uiReact.useRowIds(tableId, store),
      ),
    });
  const SortedTableInHtmlTable = ({
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
    const [sortAndOffset, handleSort, paginatorComponent] =
      useSortingAndPagination(
        cellId,
        descending,
        sortOnClick,
        offset,
        limit,
        uiReact.useRowCount(tableId, store),
        paginator,
        onChange,
      );
    return /* @__PURE__ */ createElement(HtmlTable, {
      ...props,
      params: useParams(
        useCells(
          uiReact.useTableCellIds(tableId, store),
          customCells,
          editable ? EditableCellView : uiReact.CellView,
        ),
        useStoreCellComponentProps(store, tableId),
        uiReact.useSortedRowIds(tableId, ...sortAndOffset, limit, store),
        sortAndOffset,
        handleSort,
        paginatorComponent,
      ),
    });
  };
  const ValuesInHtmlTable = ({
    store,
    editable = false,
    valueComponent: Value = editable ? EditableValueView : uiReact.ValueView,
    getValueComponentProps,
    className,
    headerRow,
    idColumn,
  }) =>
    /* @__PURE__ */ createElement(
      'table',
      {className},
      headerRow === false
        ? null
        : /* @__PURE__ */ createElement(
            'thead',
            null,
            /* @__PURE__ */ createElement(
              'tr',
              null,
              idColumn === false
                ? null
                : /* @__PURE__ */ createElement('th', null, 'Id'),
              /* @__PURE__ */ createElement('th', null, VALUE),
            ),
          ),
      /* @__PURE__ */ createElement(
        'tbody',
        null,
        arrayMap(uiReact.useValueIds(store), (valueId) =>
          /* @__PURE__ */ createElement(
            'tr',
            {key: valueId},
            idColumn === false
              ? null
              : /* @__PURE__ */ createElement('th', null, valueId),
            /* @__PURE__ */ createElement(
              'td',
              null,
              /* @__PURE__ */ createElement(Value, {
                ...getProps(getValueComponentProps, valueId),
                valueId,
                store,
              }),
            ),
          ),
        ),
      ),
    );
  const SliceInHtmlTable = ({
    indexId,
    sliceId,
    indexes,
    editable,
    customCells,
    ...props
  }) => {
    const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
      uiReact.useIndexesOrIndexesById(indexes),
      indexId,
    );
    return /* @__PURE__ */ createElement(HtmlTable, {
      ...props,
      params: useParams(
        useCells(
          uiReact.useTableCellIds(tableId, store),
          customCells,
          editable ? EditableCellView : uiReact.CellView,
        ),
        useStoreCellComponentProps(store, tableId),
        uiReact.useSliceRowIds(indexId, sliceId, resolvedIndexes),
      ),
    });
  };
  const RelationshipInHtmlTable = ({
    relationshipId,
    relationships,
    editable,
    customCells,
    className,
    headerRow,
    idColumn = true,
  }) => {
    const [resolvedRelationships, store, localTableId, remoteTableId] =
      getRelationshipsStoreTableIds(
        uiReact.useRelationshipsOrRelationshipsById(relationships),
        relationshipId,
      );
    const cells = useCells(
      [
        ...useDottedCellIds(localTableId, store),
        ...useDottedCellIds(remoteTableId, store),
      ],
      customCells,
      editable ? EditableCellView : uiReact.CellView,
    );
    const params = useParams(
      idColumn,
      cells,
      localTableId,
      remoteTableId,
      relationshipId,
      resolvedRelationships,
      store,
    );
    return /* @__PURE__ */ createElement(
      'table',
      {className},
      headerRow === false
        ? null
        : /* @__PURE__ */ createElement(
            'thead',
            null,
            /* @__PURE__ */ createElement(
              'tr',
              null,
              idColumn === false
                ? null
                : /* @__PURE__ */ createElement(
                    Fragment,
                    null,
                    /* @__PURE__ */ createElement(
                      'th',
                      null,
                      localTableId,
                      '.Id',
                    ),
                    /* @__PURE__ */ createElement(
                      'th',
                      null,
                      remoteTableId,
                      '.Id',
                    ),
                  ),
              objToArray(cells, ({label}, cellId) =>
                /* @__PURE__ */ createElement('th', {key: cellId}, label),
              ),
            ),
          ),
      /* @__PURE__ */ createElement(
        'tbody',
        null,
        arrayMap(uiReact.useRowIds(localTableId, store), (localRowId) =>
          /* @__PURE__ */ createElement(RelationshipInHtmlRow, {
            key: localRowId,
            localRowId,
            params,
          }),
        ),
      ),
    );
  };
  const ResultTableInHtmlTable = ({queryId, queries, customCells, ...props}) =>
    /* @__PURE__ */ createElement(HtmlTable, {
      ...props,
      params: useParams(
        useCells(
          uiReact.useResultTableCellIds(queryId, queries),
          customCells,
          uiReact.ResultCellView,
        ),
        useQueriesCellComponentProps(queries, queryId),
        uiReact.useResultRowIds(queryId, queries),
      ),
    });
  const ResultSortedTableInHtmlTable = ({
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
    const [sortAndOffset, handleSort, paginatorComponent] =
      useSortingAndPagination(
        cellId,
        descending,
        sortOnClick,
        offset,
        limit,
        uiReact.useResultRowCount(queryId, queries),
        paginator,
        onChange,
      );
    return /* @__PURE__ */ createElement(HtmlTable, {
      ...props,
      params: useParams(
        useCells(
          uiReact.useResultTableCellIds(queryId, queries),
          customCells,
          uiReact.ResultCellView,
        ),
        useQueriesCellComponentProps(queries, queryId),
        uiReact.useResultSortedRowIds(
          queryId,
          ...sortAndOffset,
          limit,
          queries,
        ),
        sortAndOffset,
        handleSort,
        paginatorComponent,
      ),
    });
  };
  const EditableCellView = ({
    tableId,
    rowId,
    cellId,
    store,
    className,
    showType,
  }) =>
    /* @__PURE__ */ createElement(EditableThing, {
      thing: uiReact.useCell(tableId, rowId, cellId, store),
      onThingChange: uiReact.useSetCellCallback(
        tableId,
        rowId,
        cellId,
        (cell) => cell,
        [],
        store,
      ),
      className: className ?? EDITABLE + CELL,
      showType,
      hasSchema: uiReact.useStoreOrStoreById(store)?.hasTablesSchema,
    });
  const EditableValueView = ({valueId, store, className, showType}) =>
    /* @__PURE__ */ createElement(EditableThing, {
      thing: uiReact.useValue(valueId, store),
      onThingChange: uiReact.useSetValueCallback(
        valueId,
        (value) => value,
        [],
        store,
      ),
      className: className ?? EDITABLE + VALUE,
      showType,
      hasSchema: uiReact.useStoreOrStoreById(store)?.hasValuesSchema,
    });
  const SortedTablePaginator = ({
    onChange,
    total,
    offset = 0,
    limit = total,
    singular = 'row',
    plural = singular + 's',
  }) => {
    if (offset > total || offset < 0) {
      offset = 0;
      onChange(0);
    }
    const handlePrevClick = useCallbackOrUndefined(
      () => onChange(offset - limit),
      [onChange, offset, limit],
      offset > 0,
    );
    const handleNextClick = useCallbackOrUndefined(
      () => onChange(offset + limit),
      [onChange, offset, limit],
      offset + limit < total,
    );
    return /* @__PURE__ */ createElement(
      Fragment,
      null,
      total > limit &&
        /* @__PURE__ */ createElement(
          Fragment,
          null,
          /* @__PURE__ */ createElement(
            'button',
            {
              className: 'previous',
              disabled: offset == 0,
              onClick: handlePrevClick,
            },
            LEFT_ARROW,
          ),
          /* @__PURE__ */ createElement(
            'button',
            {
              className: 'next',
              disabled: offset + limit >= total,
              onClick: handleNextClick,
            },
            RIGHT_ARROW,
          ),
          offset + 1,
          ' to ',
          mathMin(total, offset + limit),
          ' of ',
        ),
      total,
      ' ',
      total != 1 ? plural : singular,
    );
  };

  exports.EditableCellView = EditableCellView;
  exports.EditableValueView = EditableValueView;
  exports.RelationshipInHtmlTable = RelationshipInHtmlTable;
  exports.ResultSortedTableInHtmlTable = ResultSortedTableInHtmlTable;
  exports.ResultTableInHtmlTable = ResultTableInHtmlTable;
  exports.SliceInHtmlTable = SliceInHtmlTable;
  exports.SortedTableInHtmlTable = SortedTableInHtmlTable;
  exports.SortedTablePaginator = SortedTablePaginator;
  exports.TableInHtmlTable = TableInHtmlTable;
  exports.ValuesInHtmlTable = ValuesInHtmlTable;
});
