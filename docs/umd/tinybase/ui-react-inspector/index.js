(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('react'), require('../ui-react/index.js'))
    : typeof define === 'function' && define.amd
      ? define(['exports', 'react', '../ui-react'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory(
          (global.TinyBaseUiReactInspector = {}),
          global.React,
          global.TinyBaseUiReact,
        ));
})(this, function (exports, React, uiReact) {
  'use strict';

  const getTypeOf = (thing) => typeof thing;
  const EMPTY_STRING = '';
  const STRING = getTypeOf(EMPTY_STRING);
  const BOOLEAN = getTypeOf(true);
  const NUMBER = getTypeOf(0);
  const FUNCTION = getTypeOf(getTypeOf);
  const TYPE = 'type';
  const DEFAULT = 'default';
  const LISTENER = 'Listener';
  const ADD = 'add';
  const HAS = 'Has';
  const IDS = 'Ids';
  const TABLE = 'Table';
  const TABLES = TABLE + 's';
  const TABLE_IDS = TABLE + IDS;
  const ROW = 'Row';
  const ROW_COUNT = ROW + 'Count';
  const ROW_IDS = ROW + IDS;
  const CELL = 'Cell';
  const CELL_IDS = CELL + IDS;
  const VALUE = 'Value';
  const VALUES = VALUE + 's';
  const VALUE_IDS = VALUE + IDS;
  const CURRENT_TARGET = 'currentTarget';
  const _VALUE = 'value';
  const UNDEFINED = '\uFFFC';
  const id = (key) => EMPTY_STRING + key;
  const strSplit = (str, separator = EMPTY_STRING, limit) =>
    str.split(separator, limit);

  const GLOBAL = globalThis;
  const WINDOW = GLOBAL.window;
  const math = Math;
  const mathMin = math.min;
  const mathFloor = math.floor;
  const isFiniteNumber = isFinite;
  const isInstanceOf = (thing, cls) => thing instanceof cls;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isTypeStringOrBoolean = (type) => type == STRING || type == BOOLEAN;
  const isString = (thing) => getTypeOf(thing) == STRING;
  const isFunction = (thing) => getTypeOf(thing) == FUNCTION;
  const isArray = (thing) => Array.isArray(thing);
  const slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
  const size = (arrayOrString) => arrayOrString.length;
  const test = (regex, subject) => regex.test(subject);
  const errorNew = (message) => {
    throw new Error(message);
  };

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

  const arrayHas = (array, value) => array.includes(value);
  const arrayEvery = (array, cb) => array.every(cb);
  const arrayIsEqual = (array1, array2) =>
    size(array1) === size(array2) &&
    arrayEvery(array1, (value1, index) => array2[index] === value1);
  const arraySort = (array, sorter) => array.sort(sorter);
  const arrayForEach = (array, cb) => array.forEach(cb);
  const arrayJoin = (array, sep = EMPTY_STRING) => array.join(sep);
  const arrayMap = (array, cb) => array.map(cb);
  const arrayIsEmpty = (array) => size(array) == 0;
  const arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
  const arrayClear = (array, to) => array.splice(0, to);
  const arrayPush = (array, ...values) => array.push(...values);
  const arrayShift = (array) => array.shift();

  const object = Object;
  const getPrototypeOf = (obj) => object.getPrototypeOf(obj);
  const objEntries = object.entries;
  const objFrozen = object.isFrozen;
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
  const objFreeze = object.freeze;
  const objNew = (entries = []) => object.fromEntries(entries);
  const objHas = (obj, id) => id in obj;
  const objDel = (obj, id) => {
    delete obj[id];
    return obj;
  };
  const objForEach = (obj, cb) =>
    arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));
  const objToArray = (obj, cb) =>
    arrayMap(objEntries(obj), ([id, value]) => cb(value, id));
  const objMap = (obj, cb) =>
    objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));
  const objSize = (obj) => size(objIds(obj));
  const objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
  const objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
    if (
      isUndefined(obj) ||
      !isObject(obj) ||
      (!emptyIsValid && objIsEmpty(obj)) ||
      objFrozen(obj)
    ) {
      onInvalidObj?.();
      return false;
    }
    objForEach(obj, (child, id) => {
      if (!validateChild(child, id)) {
        objDel(obj, id);
      }
    });
    return emptyIsValid ? true : !objIsEmpty(obj);
  };

  const jsonString = JSON.stringify;
  const jsonParse = JSON.parse;
  const jsonStringWithMap = (obj) =>
    jsonString(obj, (_key, value) =>
      isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
    );
  const jsonStringWithUndefined = (obj) =>
    jsonString(obj, (_key, value) => (value === void 0 ? UNDEFINED : value));
  const jsonParseWithUndefined = (str) =>
    jsonParse(str, (_key, value) => (value === UNDEFINED ? void 0 : value));

  const UNIQUE_ID = 'tinybaseInspector';
  const TITLE = 'TinyBase Inspector';
  const POSITIONS = ['left', 'top', 'bottom', 'right', 'full'];
  const STATE_TABLE = 'state';
  const SORT_CELL = 'sort';
  const OPEN_CELL = 'open';
  const POSITION_VALUE = 'position';
  const OPEN_VALUE = OPEN_CELL;
  const EDITABLE_CELL = 'editable';
  const getUniqueId = (...args) => jsonStringWithMap(args);
  const sortedIdsMap = (ids, callback) =>
    arrayMap(arraySort([...ids]), callback);
  const useEditable = (uniqueId, s) => [
    !!uiReact.useCell(STATE_TABLE, uniqueId, EDITABLE_CELL, s),
    useCallback(
      (event) => {
        s.setCell(
          STATE_TABLE,
          uniqueId,
          EDITABLE_CELL,
          (editable) => !editable,
        );
        event.preventDefault();
      },
      [s, uniqueId],
    ),
  ];

  var img =
    "data:image/svg+xml,%3csvg viewBox='0 0 680 680' xmlns='http://www.w3.org/2000/svg' style='width:680px%3bheight:680px'%3e %3cpath stroke='white' stroke-width='80' fill='none' d='M340 617a84 241 90 11.01 0zM131 475a94 254 70 10428-124 114 286 70 01-428 124zm0-140a94 254 70 10428-124 114 286 70 01-428 124zm-12-127a94 254 70 00306 38 90 260 90 01-306-38zm221 3a74 241 90 11.01 0z' /%3e %3cpath fill='%23d81b60' d='M131 475a94 254 70 10428-124 114 286 70 01-428 124zm0-140a94 254 70 10428-124 114 286 70 01-428 124z' /%3e %3cpath d='M249 619a94 240 90 00308-128 114 289 70 01-308 128zM119 208a94 254 70 00306 38 90 260 90 01-306-38zm221 3a74 241 90 11.01 0z' /%3e%3c/svg%3e";

  const PENCIL = 'M20 80l5-15l40-40l10 10l-40 40l-15 5m5-15l10 10';
  const PRE_CSS = 'content:url("';
  const POST_CSS = '")';
  const PRE =
    PRE_CSS +
    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' stroke-width='4' stroke='white' fill='none'>`;
  const POST = `</svg>` + POST_CSS;
  const LOGO_SVG = PRE_CSS + img + POST_CSS;
  const POSITIONS_SVG = arrayMap(
    [
      [20, 20, 20, 60],
      [20, 20, 60, 20],
      [20, 60, 60, 20],
      [60, 20, 20, 60],
      [30, 30, 40, 40],
    ],
    ([x, y, w, h]) =>
      PRE +
      `<rect x='20' y='20' width='60' height='60' fill='grey'/><rect x='${x}' y='${y}' width='${w}' height='${h}' fill='white'/>` +
      POST,
  );
  const CLOSE_SVG = PRE + `<path d='M20 20l60 60M20 80l60-60' />` + POST;
  const EDIT_SVG = PRE + `<path d='${PENCIL}' />` + POST;
  const DONE_SVG = PRE + `<path d='${PENCIL}M20 20l60 60' />` + POST;

  const SCROLLBAR = '*::-webkit-scrollbar';
  const APP_STYLESHEET = arrayJoin(
    objToArray(
      {
        '': 'all:initial;font-family:sans-serif;font-size:0.75rem;position:fixed;z-index:999999',
        '*': 'all:revert',
        '*::before': 'all:revert',
        '*::after': 'all:revert',
        [SCROLLBAR]: 'width:0.5rem;height:0.5rem;',
        [SCROLLBAR + '-track']: 'background:#111',
        [SCROLLBAR + '-thumb']: 'background:#999;border:1px solid #111',
        [SCROLLBAR + '-thumb:hover']: 'background:#fff',
        [SCROLLBAR + '-corner']: 'background:#111',
        img: 'width:1rem;height:1rem;background:#111;border:0;vertical-align:text-bottom',
        // Nub
        '>img': 'padding:0.25rem;bottom:0;right:0;position:fixed;' + LOGO_SVG,
        ...objNew(
          arrayMap(['bottom:0;left:0', 'top:0;right:0'], (css, p) => [
            `>img[data-position='${p}']`,
            css,
          ]),
        ),
        // Panel
        main: 'display:flex;flex-direction:column;background:#111d;color:#fff;position:fixed;',
        ...objNew(
          arrayMap(
            [
              'bottom:0;left:0;width:35vw;height:100vh',
              'top:0;right:0;width:100vw;height:30vh',
              'bottom:0;left:0;width:100vw;height:30vh',
              'top:0;right:0;width:35vw;height:100vh',
              'top:0;right:0;width:100vw;height:100vh',
            ],
            (css, p) => [`main[data-position='${p}']`, css],
          ),
        ),
        // Header
        header:
          'display:flex;padding:0.25rem;background:#000;align-items:center',
        'header>img:nth-of-type(1)': LOGO_SVG,
        'header>img:nth-of-type(6)': CLOSE_SVG,
        ...objNew(
          arrayMap(POSITIONS_SVG, (SVG, p) => [
            `header>img[data-id='${p}']`,
            SVG,
          ]),
        ),
        'header>span':
          'flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin-left:0.25rem',
        // Body
        article: 'padding:0.25rem 0.25rem 0.25rem 0.5rem;overflow:auto;flex:1',
        details: 'margin-left:0.75rem;width:fit-content;',
        'details img': 'display:none',
        'details[open]>summary img':
          'display:unset;background:none;margin-left:0.25rem',
        'details[open]>summary img.edit': EDIT_SVG,
        'details[open]>summary img.done': DONE_SVG,
        summary:
          'margin-left:-0.75rem;line-height:1.25rem;user-select:none;width:fit-content',
        // tables
        table:
          'border-collapse:collapse;table-layout:fixed;margin-bottom:0.5rem',
        'table input':
          'background:#111;color:unset;padding:0 0.25rem;border:0;font-size:unset;vertical-align:top;margin:0',
        'table input[type="number"]': 'width:4rem',
        'table tbody button':
          'font-size:0;background:#fff;border-radius:50%;margin:0 0.125rem 0 0;width:0.85rem;color:#111',
        'table button:first-letter': 'font-size:0.75rem',
        thead: 'background:#222',
        'th:nth-of-type(1)': 'min-width:2rem;',
        'th.sorted': 'background:#000',
        'table caption':
          'text-align:left;white-space:nowrap;line-height:1.25rem',
        button: 'width:1.5rem;border:none;background:none;color:#fff;padding:0',
        'button[disabled]': 'color:#777',
        'button.next': 'margin-right:0.5rem',
        [`th,#${UNIQUE_ID} td`]:
          'overflow:hidden;text-overflow:ellipsis;padding:0.25rem 0.5rem;max-width:12rem;white-space:nowrap;border-width:1px 0;border-style:solid;border-color:#777;text-align:left',
        'span.warn': 'margin:0.25rem;color:#d81b60',
      },
      (style, selector) => (style ? `#${UNIQUE_ID} ${selector}{${style}}` : ''),
    ),
  );

  const Nub = ({s}) => {
    const position = uiReact.useValue(POSITION_VALUE, s) ?? 1;
    const handleOpen = uiReact.useSetValueCallback(
      OPEN_VALUE,
      () => true,
      [],
      s,
    );
    return uiReact.useValue(OPEN_VALUE, s)
      ? null
      : /* @__PURE__ */ createElement('img', {
          onClick: handleOpen,
          title: TITLE,
          'data-position': position,
        });
  };

  const Details = ({
    uniqueId,
    summary,
    editable,
    handleEditable,
    children,
    s,
  }) => {
    const open = !!uiReact.useCell(STATE_TABLE, uniqueId, OPEN_CELL, s);
    const handleToggle = uiReact.useSetCellCallback(
      STATE_TABLE,
      uniqueId,
      OPEN_CELL,
      (event) => event[CURRENT_TARGET].open,
      [],
      s,
    );
    return /* @__PURE__ */ createElement(
      'details',
      {open, onToggle: handleToggle},
      /* @__PURE__ */ createElement(
        'summary',
        null,
        summary,
        handleEditable
          ? /* @__PURE__ */ createElement('img', {
              onClick: handleEditable,
              className: editable ? 'done' : 'edit',
            })
          : null,
      ),
      children,
    );
  };

  const getCellOrValueType = (cellOrValue) => {
    const type = getTypeOf(cellOrValue);
    return isTypeStringOrBoolean(type) ||
      (type == NUMBER && isFiniteNumber(cellOrValue))
      ? type
      : void 0;
  };
  const setOrDelCell = (store, tableId, rowId, cellId, cell) =>
    isUndefined(cell)
      ? store.delCell(tableId, rowId, cellId, true)
      : store.setCell(tableId, rowId, cellId, cell);
  const setOrDelValue = (store, valueId, value) =>
    isUndefined(value)
      ? store.delValue(valueId)
      : store.setValue(valueId, value);
  const getTypeCase = (type, stringCase, numberCase, booleanCase) =>
    type == STRING ? stringCase : type == NUMBER ? numberCase : booleanCase;

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

  const IndexView = ({indexes, indexesId, indexId, s}) =>
    /* @__PURE__ */ createElement(
      Details,
      {
        uniqueId: getUniqueId('i', indexesId, indexId),
        summary: 'Index: ' + indexId,
        s,
      },
      arrayMap(uiReact.useSliceIds(indexId, indexes), (sliceId) =>
        /* @__PURE__ */ createElement(SliceView, {
          indexes,
          indexesId,
          indexId,
          sliceId,
          s,
          key: sliceId,
        }),
      ),
    );
  const SliceView = ({indexes, indexesId, indexId, sliceId, s}) => {
    const uniqueId = getUniqueId('i', indexesId, indexId, sliceId);
    const [editable, handleEditable] = useEditable(uniqueId, s);
    return /* @__PURE__ */ createElement(
      Details,
      {
        uniqueId,
        summary: 'Slice: ' + sliceId,
        editable,
        handleEditable,
        s,
      },
      /* @__PURE__ */ createElement(SliceInHtmlTable, {
        sliceId,
        indexId,
        indexes,
        editable,
      }),
    );
  };
  const IndexesView = ({indexesId, s}) => {
    const indexes = uiReact.useIndexes(indexesId);
    const indexIds = uiReact.useIndexIds(indexes);
    return isUndefined(indexes)
      ? null
      : /* @__PURE__ */ createElement(
          Details,
          {
            uniqueId: getUniqueId('i', indexesId),
            summary: 'Indexes: ' + (indexesId ?? DEFAULT),
            s,
          },
          arrayIsEmpty(indexIds)
            ? 'No indexes defined'
            : sortedIdsMap(indexIds, (indexId) =>
                /* @__PURE__ */ createElement(IndexView, {
                  indexes,
                  indexesId,
                  indexId,
                  s,
                  key: indexId,
                }),
              ),
        );
  };

  const MetricRow = ({metrics, metricId}) =>
    /* @__PURE__ */ createElement(
      'tr',
      null,
      /* @__PURE__ */ createElement('th', null, metricId),
      /* @__PURE__ */ createElement('td', null, metrics?.getTableId(metricId)),
      /* @__PURE__ */ createElement(
        'td',
        null,
        uiReact.useMetric(metricId, metrics),
      ),
    );
  const MetricsView = ({metricsId, s}) => {
    const metrics = uiReact.useMetrics(metricsId);
    const metricIds = uiReact.useMetricIds(metrics);
    return isUndefined(metrics)
      ? null
      : /* @__PURE__ */ createElement(
          Details,
          {
            uniqueId: getUniqueId('m', metricsId),
            summary: 'Metrics: ' + (metricsId ?? DEFAULT),
            s,
          },
          arrayIsEmpty(metricIds)
            ? 'No metrics defined'
            : /* @__PURE__ */ createElement(
                'table',
                null,
                /* @__PURE__ */ createElement(
                  'thead',
                  null,
                  /* @__PURE__ */ createElement('th', null, 'Metric Id'),
                  /* @__PURE__ */ createElement('th', null, 'Table Id'),
                  /* @__PURE__ */ createElement('th', null, 'Metric'),
                ),
                /* @__PURE__ */ createElement(
                  'tbody',
                  null,
                  arrayMap(metricIds, (metricId) =>
                    /* @__PURE__ */ createElement(MetricRow, {
                      metrics,
                      metricId,
                      key: metricId,
                    }),
                  ),
                ),
              ),
        );
  };

  const QueryView = ({queries, queriesId, queryId, s}) => {
    const uniqueId = getUniqueId('q', queriesId, queryId);
    const [cellId, descending, offset] = jsonParse(
      uiReact.useCell(STATE_TABLE, uniqueId, SORT_CELL, s) ?? '[]',
    );
    const handleChange = uiReact.useSetCellCallback(
      STATE_TABLE,
      uniqueId,
      SORT_CELL,
      jsonStringWithMap,
      [],
      s,
    );
    return /* @__PURE__ */ createElement(
      Details,
      {uniqueId, summary: 'Query: ' + queryId, s},
      /* @__PURE__ */ createElement(ResultSortedTableInHtmlTable, {
        queryId,
        queries,
        cellId,
        descending,
        offset,
        limit: 10,
        paginator: true,
        sortOnClick: true,
        onChange: handleChange,
      }),
    );
  };
  const QueriesView = ({queriesId, s}) => {
    const queries = uiReact.useQueries(queriesId);
    const queryIds = uiReact.useQueryIds(queries);
    return isUndefined(queries)
      ? null
      : /* @__PURE__ */ createElement(
          Details,
          {
            uniqueId: getUniqueId('q', queriesId),
            summary: 'Queries: ' + (queriesId ?? DEFAULT),
            s,
          },
          arrayIsEmpty(queryIds)
            ? 'No queries defined'
            : sortedIdsMap(queryIds, (queryId) =>
                /* @__PURE__ */ createElement(QueryView, {
                  queries,
                  queriesId,
                  queryId,
                  s,
                  key: queryId,
                }),
              ),
        );
  };

  const RelationshipView = ({
    relationships,
    relationshipsId,
    relationshipId,
    s,
  }) => {
    const uniqueId = getUniqueId('r', relationshipsId, relationshipId);
    const [editable, handleEditable] = useEditable(uniqueId, s);
    return /* @__PURE__ */ createElement(
      Details,
      {
        uniqueId,
        summary: 'Relationship: ' + relationshipId,
        editable,
        handleEditable,
        s,
      },
      /* @__PURE__ */ createElement(RelationshipInHtmlTable, {
        relationshipId,
        relationships,
        editable,
      }),
    );
  };
  const RelationshipsView = ({relationshipsId, s}) => {
    const relationships = uiReact.useRelationships(relationshipsId);
    const relationshipIds = uiReact.useRelationshipIds(relationships);
    return isUndefined(relationships)
      ? null
      : /* @__PURE__ */ createElement(
          Details,
          {
            uniqueId: getUniqueId('r', relationshipsId),
            summary: 'Relationships: ' + (relationshipsId ?? DEFAULT),
            s,
          },
          arrayIsEmpty(relationshipIds)
            ? 'No relationships defined'
            : sortedIdsMap(relationshipIds, (relationshipId) =>
                /* @__PURE__ */ createElement(RelationshipView, {
                  relationships,
                  relationshipsId,
                  relationshipId,
                  s,
                  key: relationshipId,
                }),
              ),
        );
  };

  const TableView = ({tableId, store, storeId, s}) => {
    const uniqueId = getUniqueId('t', storeId, tableId);
    const [cellId, descending, offset] = jsonParse(
      uiReact.useCell(STATE_TABLE, uniqueId, SORT_CELL, s) ?? '[]',
    );
    const handleChange = uiReact.useSetCellCallback(
      STATE_TABLE,
      uniqueId,
      SORT_CELL,
      jsonStringWithMap,
      [],
      s,
    );
    const [editable, handleEditable] = useEditable(uniqueId, s);
    return /* @__PURE__ */ createElement(
      Details,
      {
        uniqueId,
        summary: TABLE + ': ' + tableId,
        editable,
        handleEditable,
        s,
      },
      /* @__PURE__ */ createElement(SortedTableInHtmlTable, {
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
      }),
    );
  };
  const ValuesView = ({store, storeId, s}) => {
    const uniqueId = getUniqueId('v', storeId);
    const [editable, handleEditable] = useEditable(uniqueId, s);
    return arrayIsEmpty(uiReact.useValueIds(store))
      ? null
      : /* @__PURE__ */ createElement(
          Details,
          {
            uniqueId,
            summary: VALUES,
            editable,
            handleEditable,
            s,
          },
          /* @__PURE__ */ createElement(ValuesInHtmlTable, {store, editable}),
        );
  };
  const StoreView = ({storeId, s}) => {
    const store = uiReact.useStore(storeId);
    const tableIds = uiReact.useTableIds(store);
    return isUndefined(store)
      ? null
      : /* @__PURE__ */ createElement(
          Details,
          {
            uniqueId: getUniqueId('s', storeId),
            summary:
              (store.isMergeable() ? 'Mergeable' : '') +
              'Store: ' +
              (storeId ?? DEFAULT),
            s,
          },
          /* @__PURE__ */ createElement(ValuesView, {storeId, store, s}),
          sortedIdsMap(tableIds, (tableId) =>
            /* @__PURE__ */ createElement(TableView, {
              store,
              storeId,
              tableId,
              s,
              key: tableId,
            }),
          ),
        );
  };

  const Body = ({s}) => {
    const articleRef = useRef(null);
    const idleCallbackRef = useRef(0);
    const [scrolled, setScrolled] = useState(false);
    const {scrollLeft, scrollTop} = uiReact.useValues(s);
    useLayoutEffect(() => {
      const article = articleRef.current;
      if (article && !scrolled) {
        const observer = new MutationObserver(() => {
          if (
            article.scrollWidth >=
              mathFloor(scrollLeft) + article.clientWidth &&
            article.scrollHeight >= mathFloor(scrollTop) + article.clientHeight
          ) {
            article.scrollTo(scrollLeft, scrollTop);
          }
        });
        observer.observe(article, {childList: true, subtree: true});
        return () => observer.disconnect();
      }
    }, [scrolled, scrollLeft, scrollTop]);
    const handleScroll = useCallback(
      (event) => {
        const {scrollLeft: scrollLeft2, scrollTop: scrollTop2} =
          event[CURRENT_TARGET];
        cancelIdleCallback(idleCallbackRef.current);
        idleCallbackRef.current = requestIdleCallback(() => {
          setScrolled(true);
          s.setPartialValues({scrollLeft: scrollLeft2, scrollTop: scrollTop2});
        });
      },
      [s],
    );
    const store = uiReact.useStore();
    const storeIds = uiReact.useStoreIds();
    const metrics = uiReact.useMetrics();
    const metricsIds = uiReact.useMetricsIds();
    const indexes = uiReact.useIndexes();
    const indexesIds = uiReact.useIndexesIds();
    const relationships = uiReact.useRelationships();
    const relationshipsIds = uiReact.useRelationshipsIds();
    const queries = uiReact.useQueries();
    const queriesIds = uiReact.useQueriesIds();
    return isUndefined(store) &&
      arrayIsEmpty(storeIds) &&
      isUndefined(metrics) &&
      arrayIsEmpty(metricsIds) &&
      isUndefined(indexes) &&
      arrayIsEmpty(indexesIds) &&
      isUndefined(relationships) &&
      arrayIsEmpty(relationshipsIds) &&
      isUndefined(queries) &&
      arrayIsEmpty(queriesIds)
      ? /* @__PURE__ */ createElement(
          'span',
          {className: 'warn'},
          'There are no Stores or other objects to inspect. Make sure you placed the Inspector inside a Provider component.',
        )
      : /* @__PURE__ */ createElement(
          'article',
          {ref: articleRef, onScroll: handleScroll},
          /* @__PURE__ */ createElement(StoreView, {s}),
          arrayMap(storeIds, (storeId) =>
            /* @__PURE__ */ createElement(StoreView, {
              storeId,
              s,
              key: storeId,
            }),
          ),
          /* @__PURE__ */ createElement(MetricsView, {s}),
          arrayMap(metricsIds, (metricsId) =>
            /* @__PURE__ */ createElement(MetricsView, {
              metricsId,
              s,
              key: metricsId,
            }),
          ),
          /* @__PURE__ */ createElement(IndexesView, {s}),
          arrayMap(indexesIds, (indexesId) =>
            /* @__PURE__ */ createElement(IndexesView, {
              indexesId,
              s,
              key: indexesId,
            }),
          ),
          /* @__PURE__ */ createElement(RelationshipsView, {s}),
          arrayMap(relationshipsIds, (relationshipsId) =>
            /* @__PURE__ */ createElement(RelationshipsView, {
              relationshipsId,
              s,
              key: relationshipsId,
            }),
          ),
          /* @__PURE__ */ createElement(QueriesView, {s}),
          arrayMap(queriesIds, (queriesId) =>
            /* @__PURE__ */ createElement(QueriesView, {
              queriesId,
              s,
              key: queriesId,
            }),
          ),
        );
  };

  class ErrorBoundary extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {e: 0};
    }
    static getDerivedStateFromError() {
      return {e: 1};
    }
    // eslint-disable-next-line react/no-arrow-function-lifecycle
    componentDidCatch = (error, info) =>
      // eslint-disable-next-line no-console
      console.error(error, info.componentStack);
    render() {
      return this.state.e
        ? /* @__PURE__ */ createElement(
            'span',
            {className: 'warn'},
            'Inspector error: please see console for details.',
          )
        : // eslint-disable-next-line react/prop-types
          this.props.children;
    }
  }

  const Header = ({s}) => {
    const position = uiReact.useValue(POSITION_VALUE, s) ?? 1;
    const handleClose = uiReact.useSetValueCallback(
      OPEN_VALUE,
      () => false,
      [],
      s,
    );
    const handleDock = uiReact.useSetValueCallback(
      POSITION_VALUE,
      (event) => Number(event[CURRENT_TARGET].dataset.id),
      [],
      s,
    );
    return /* @__PURE__ */ createElement(
      'header',
      null,
      /* @__PURE__ */ createElement('img', {title: TITLE}),
      /* @__PURE__ */ createElement('span', null, TITLE),
      arrayMap(POSITIONS, (name, p) =>
        p == position
          ? null
          : /* @__PURE__ */ createElement('img', {
              onClick: handleDock,
              'data-id': p,
              title: 'Dock to ' + name,
              key: p,
            }),
      ),
      /* @__PURE__ */ createElement('img', {
        onClick: handleClose,
        title: 'Close',
      }),
    );
  };

  const Panel = ({s}) => {
    const position = uiReact.useValue(POSITION_VALUE, s) ?? 1;
    return uiReact.useValue(OPEN_VALUE, s)
      ? /* @__PURE__ */ createElement(
          'main',
          {'data-position': position},
          /* @__PURE__ */ createElement(Header, {s}),
          /* @__PURE__ */ createElement(
            ErrorBoundary,
            null,
            /* @__PURE__ */ createElement(Body, {s}),
          ),
        )
      : null;
  };

  const collSizeN = (collSizer) => (coll) =>
    arrayReduce(
      collValues(coll),
      (total, coll2) => total + collSizer(coll2),
      0,
    );
  const collSize = (coll) => coll?.size ?? 0;
  const collSize2 = collSizeN(collSize);
  const collSize3 = collSizeN(collSize2);
  const collSize4 = collSizeN(collSize3);
  const collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
  const collIsEmpty = (coll) => isUndefined(coll) || collSize(coll) == 0;
  const collValues = (coll) => [...(coll?.values() ?? [])];
  const collClear = (coll) => coll.clear();
  const collForEach = (coll, cb) => coll?.forEach(cb);
  const collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);

  const mapNew = (entries) => new Map(entries);
  const mapKeys = (map) => [...(map?.keys() ?? [])];
  const mapGet = (map, key) => map?.get(key);
  const mapForEach = (map, cb) =>
    collForEach(map, (value, key) => cb(key, value));
  const mapMap = (coll, cb) =>
    arrayMap([...(coll?.entries() ?? [])], ([key, value]) => cb(value, key));
  const mapSet = (map, key, value) =>
    isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
  const mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
    if (!collHas(map, key)) {
      mapSet(map, key, getDefaultValue());
    } else {
      hadExistingValue?.(mapGet(map, key));
    }
    return mapGet(map, key);
  };
  const mapMatch = (map, obj, set, del = mapSet) => {
    objMap(obj, (value, id) => set(map, id, value));
    mapForEach(map, (id) => (objHas(obj, id) ? 0 : del(map, id)));
    return map;
  };
  const mapToObj = (map, valueMapper, excludeMapValue, excludeObjValue) => {
    const obj = {};
    collForEach(map, (mapValue, id) => {
      if (!excludeMapValue?.(mapValue, id)) {
        const objValue = valueMapper ? valueMapper(mapValue, id) : mapValue;
        if (!excludeObjValue?.(objValue)) {
          obj[id] = objValue;
        }
      }
    });
    return obj;
  };
  const mapToObj2 = (map, valueMapper, excludeMapValue) =>
    mapToObj(
      map,
      (childMap) => mapToObj(childMap, valueMapper, excludeMapValue),
      collIsEmpty,
      objIsEmpty,
    );
  const mapToObj3 = (map, valueMapper, excludeMapValue) =>
    mapToObj(
      map,
      (childMap) => mapToObj2(childMap, valueMapper, excludeMapValue),
      collIsEmpty,
      objIsEmpty,
    );
  const mapClone = (map, mapValue) => {
    const map2 = mapNew();
    collForEach(map, (value, key) => map2.set(key, mapValue?.(value) ?? value));
    return map2;
  };
  const mapClone2 = (map) => mapClone(map, mapClone);
  const mapClone3 = (map) => mapClone(map, mapClone2);
  const visitTree = (node, path, ensureLeaf, pruneLeaf, p = 0) =>
    ifNotUndefined(
      (ensureLeaf ? mapEnsure : mapGet)(
        node,
        path[p],
        p > size(path) - 2 ? ensureLeaf : mapNew,
      ),
      (nodeOrLeaf) => {
        if (p > size(path) - 2) {
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
      },
    );

  const setNew = (entryOrEntries) =>
    new Set(
      isArray(entryOrEntries) || isUndefined(entryOrEntries)
        ? entryOrEntries
        : [entryOrEntries],
    );
  const setAdd = (set, value) => set?.add(value);

  const INTEGER = /^\d+$/;
  const getPoolFunctions = () => {
    const pool = [];
    let nextId = 0;
    return [
      (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING + nextId++,
      (id) => {
        if (test(INTEGER, id) && size(pool) < 1e3) {
          arrayPush(pool, id);
        }
      },
    ];
  };

  const getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING]) => {
    const leaves = [];
    const deep = (node, p) =>
      p == size(path)
        ? arrayPush(leaves, node)
        : path[p] === null
          ? collForEach(node, (node2) => deep(node2, p + 1))
          : arrayForEach([path[p], null], (id) =>
              deep(mapGet(node, id), p + 1),
            );
    deep(deepIdSet, 0);
    return leaves;
  };
  const getListenerFunctions = (getThing) => {
    let thing;
    const [getId, releaseId] = getPoolFunctions();
    const allListeners = mapNew();
    const addListener = (
      listener,
      idSetNode,
      path,
      pathGetters = [],
      extraArgsGetter = () => [],
    ) => {
      thing ??= getThing();
      const id = getId(1);
      mapSet(allListeners, id, [
        listener,
        idSetNode,
        path,
        pathGetters,
        extraArgsGetter,
      ]);
      setAdd(visitTree(idSetNode, path ?? [EMPTY_STRING], setNew), id);
      return id;
    };
    const callListeners = (idSetNode, ids, ...extraArgs) =>
      arrayForEach(getWildcardedLeaves(idSetNode, ids), (set) =>
        collForEach(set, (id) =>
          mapGet(allListeners, id)[0](thing, ...(ids ?? []), ...extraArgs),
        ),
      );
    const delListener = (id) =>
      ifNotUndefined(mapGet(allListeners, id), ([, idSetNode, idOrNulls]) => {
        visitTree(idSetNode, idOrNulls ?? [EMPTY_STRING], void 0, (idSet) => {
          collDel(idSet, id);
          return collIsEmpty(idSet) ? 1 : 0;
        });
        mapSet(allListeners, id);
        releaseId(id);
        return idOrNulls;
      });
    const callListener = (id) =>
      ifNotUndefined(
        mapGet(allListeners, id),
        ([listener, , path = [], pathGetters, extraArgsGetter]) => {
          const callWithIds = (...ids) => {
            const index = size(ids);
            if (index == size(path)) {
              listener(thing, ...ids, ...extraArgsGetter(ids));
            } else if (isUndefined(path[index])) {
              arrayForEach(pathGetters[index]?.(...ids) ?? [], (id2) =>
                callWithIds(...ids, id2),
              );
            } else {
              callWithIds(...ids, path[index]);
            }
          };
          callWithIds();
        },
      );
    return [addListener, callListeners, delListener, callListener];
  };

  const scheduleRunning = mapNew();
  const scheduleActions = mapNew();
  const getStoreFunctions = (
    persist = 1 /* StoreOnly */,
    store,
    isSynchronizer,
  ) =>
    persist != 1 /* StoreOnly */ && store.isMergeable()
      ? [
          1,
          store.getMergeableContent,
          () => store.getTransactionMergeableChanges(!isSynchronizer),
          ([[changedTables], [changedValues]]) =>
            !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
          store.setDefaultContent,
        ]
      : persist != 2 /* MergeableStoreOnly */
        ? [
            0,
            store.getContent,
            store.getTransactionChanges,
            ([changedTables, changedValues]) =>
              !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
            store.setContent,
          ]
        : errorNew('Store type not supported by this Persister');
  const createCustomPersister = (
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persist,
    extra = {},
    isSynchronizer = 0,
    scheduleId = [],
  ) => {
    let status = 0; /* Idle */
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
      setDefaultContent,
    ] = getStoreFunctions(persist, store, isSynchronizer);
    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => persister,
    );
    const setStatus = (newStatus) => {
      if (newStatus != status) {
        status = newStatus;
        callListeners(statusListeners, void 0, status);
      }
    };
    const run = async () => {
      /* istanbul ignore else */
      if (!mapGet(scheduleRunning, scheduleId)) {
        mapSet(scheduleRunning, scheduleId, 1);
        while (
          !isUndefined(
            (action = arrayShift(mapGet(scheduleActions, scheduleId))),
          )
        ) {
          try {
            await action();
          } catch (error) {}
        }
        mapSet(scheduleRunning, scheduleId, 0);
      }
    };
    const setContentOrChanges = (contentOrChanges) => {
      (isMergeableStore && isArray(contentOrChanges?.[0])
        ? contentOrChanges?.[2] === 1
          ? store.applyMergeableChanges
          : store.setMergeableContent
        : contentOrChanges?.[2] === 1
          ? store.applyChanges
          : store.setContent)(contentOrChanges);
    };
    const load = async (initialContent) => {
      /* istanbul ignore else */
      if (status != 2 /* Saving */) {
        setStatus(1 /* Loading */);
        loads++;
        await schedule(async () => {
          try {
            const content = await getPersisted();
            if (isArray(content)) {
              setContentOrChanges(content);
            } else if (initialContent) {
              setDefaultContent(initialContent);
            } else {
              errorNew(`Content is not an array: ${content}`);
            }
          } catch (error) {
            if (initialContent) {
              setDefaultContent(initialContent);
            }
          }
          setStatus(0 /* Idle */);
        });
      }
      return persister;
    };
    const startAutoLoad = async (initialContent) => {
      stopAutoLoad();
      await load(initialContent);
      try {
        autoLoadHandle = await addPersisterListener(
          async (content, changes) => {
            if (changes || content) {
              /* istanbul ignore else */
              if (status != 2 /* Saving */) {
                setStatus(1 /* Loading */);
                loads++;
                setContentOrChanges(changes ?? content);
                setStatus(0 /* Idle */);
              }
            } else {
              await load();
            }
          },
        );
      } catch (error) {}
      return persister;
    };
    const stopAutoLoad = () => {
      if (autoLoadHandle) {
        delPersisterListener(autoLoadHandle);
        autoLoadHandle = void 0;
      }
      return persister;
    };
    const isAutoLoading = () => !isUndefined(autoLoadHandle);
    const save = async (changes) => {
      /* istanbul ignore else */
      if (status != 1 /* Loading */) {
        setStatus(2 /* Saving */);
        saves++;
        await schedule(async () => {
          try {
            await setPersisted(getContent, changes);
          } catch (error) {}
          setStatus(0 /* Idle */);
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
    const stopAutoSave = () => {
      if (autoSaveListenerId) {
        store.delListener(autoSaveListenerId);
        autoSaveListenerId = void 0;
      }
      return persister;
    };
    const isAutoSaving = () => !isUndefined(autoSaveListenerId);
    const getStatus = () => status;
    const addStatusListener = (listener) =>
      addListener(listener, statusListeners);
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
      return stopAutoLoad().stopAutoSave();
    };
    const getStats = () => ({loads, saves});
    const persister = {
      load,
      startAutoLoad,
      stopAutoLoad,
      isAutoLoading,
      save,
      startAutoSave,
      stopAutoSave,
      isAutoSaving,
      getStatus,
      addStatusListener,
      delListener,
      schedule,
      getStore,
      destroy,
      getStats,
      ...extra,
    };
    return objFreeze(persister);
  };

  const STORAGE = 'storage';
  const createStoragePersister = (
    store,
    storageName,
    storage,
    onIgnoredError,
  ) => {
    const getPersisted = async () =>
      jsonParseWithUndefined(storage.getItem(storageName));
    const setPersisted = async (getContent) =>
      storage.setItem(storageName, jsonStringWithUndefined(getContent()));
    const addPersisterListener = (listener) => {
      const storageListener = (event) => {
        if (event.storageArea === storage && event.key === storageName) {
          try {
            listener(jsonParse(event.newValue));
          } catch {
            listener();
          }
        }
      };
      WINDOW.addEventListener(STORAGE, storageListener);
      return storageListener;
    };
    const delPersisterListener = (storageListener) =>
      WINDOW.removeEventListener(STORAGE, storageListener);
    return createCustomPersister(
      store,
      getPersisted,
      setPersisted,
      addPersisterListener,
      delPersisterListener,
      onIgnoredError,
      3,
      // StoreOrMergeableStore,
      {getStorageName: () => storageName},
    );
  };
  const createSessionPersister = (store, storageName, onIgnoredError) =>
    createStoragePersister(store, storageName, sessionStorage, onIgnoredError);

  const pairNew = (value) => [value, value];
  const pairCollSize2 = (pair, func = collSize2) =>
    func(pair[0]) + func(pair[1]);
  const pairNewMap = () => [mapNew(), mapNew()];
  const pairClone = (array) => [...array];
  const pairIsEqual = ([entry1, entry2]) => entry1 === entry2;

  const defaultSorter = (sortKey1, sortKey2) =>
    (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;

  const idsChanged = (changedIds, id2, addedOrRemoved) =>
    mapSet(
      changedIds,
      id2,
      mapGet(changedIds, id2) == -addedOrRemoved ? void 0 : addedOrRemoved,
    );
  const createStore = () => {
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
    const [addListener, callListeners, delListenerImpl, callListenerImpl] =
      getListenerFunctions(() => store);
    const validateTablesSchema = (tableSchema) =>
      objValidate(tableSchema, (tableSchema2) =>
        objValidate(tableSchema2, validateCellOrValueSchema),
      );
    const validateValuesSchema = (valuesSchema) =>
      objValidate(valuesSchema, validateCellOrValueSchema);
    const validateCellOrValueSchema = (schema) => {
      if (
        !objValidate(schema, (_child, id2) => arrayHas([TYPE, DEFAULT], id2))
      ) {
        return false;
      }
      const type = schema[TYPE];
      if (!isTypeStringOrBoolean(type) && type != NUMBER) {
        return false;
      }
      if (getCellOrValueType(schema[DEFAULT]) != type) {
        objDel(schema, DEFAULT);
      }
      return true;
    };
    const validateContent = isArray;
    const validateTables = (tables) =>
      objValidate(tables, validateTable, cellInvalid);
    const validateTable = (table, tableId) =>
      (!hasTablesSchema ||
        collHas(tablesSchemaMap, tableId) ||
        /* istanbul ignore next */
        cellInvalid(tableId)) &&
      objValidate(
        table,
        (row, rowId) => validateRow(tableId, rowId, row),
        () => cellInvalid(tableId),
      );
    const validateRow = (tableId, rowId, row, skipDefaults) =>
      objValidate(
        skipDefaults ? row : addDefaultsToRow(row, tableId, rowId),
        (cell, cellId) =>
          ifNotUndefined(
            getValidatedCell(tableId, rowId, cellId, cell),
            (validCell) => {
              row[cellId] = validCell;
              return true;
            },
            () => false,
          ),
        () => cellInvalid(tableId, rowId),
      );
    const getValidatedCell = (tableId, rowId, cellId, cell) =>
      hasTablesSchema
        ? ifNotUndefined(
            mapGet(mapGet(tablesSchemaMap, tableId), cellId),
            (cellSchema) =>
              getCellOrValueType(cell) != cellSchema[TYPE]
                ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT])
                : cell,
            () => cellInvalid(tableId, rowId, cellId, cell),
          )
        : isUndefined(getCellOrValueType(cell))
          ? cellInvalid(tableId, rowId, cellId, cell)
          : cell;
    const validateValues = (values, skipDefaults) =>
      objValidate(
        skipDefaults ? values : addDefaultsToValues(values),
        (value, valueId) =>
          ifNotUndefined(
            getValidatedValue(valueId, value),
            (validValue) => {
              values[valueId] = validValue;
              return true;
            },
            () => false,
          ),
        () => valueInvalid(),
      );
    const getValidatedValue = (valueId, value) =>
      hasValuesSchema
        ? ifNotUndefined(
            mapGet(valuesSchemaMap, valueId),
            (valueSchema) =>
              getCellOrValueType(value) != valueSchema[TYPE]
                ? valueInvalid(valueId, value, valueSchema[DEFAULT])
                : value,
            () => valueInvalid(valueId, value),
          )
        : isUndefined(getCellOrValueType(value))
          ? valueInvalid(valueId, value)
          : value;
    const addDefaultsToRow = (row, tableId, rowId) => {
      ifNotUndefined(
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
        },
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
    const setValidTablesSchema = (tablesSchema) =>
      mapMatch(
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
              ifNotUndefined(
                cellSchema[DEFAULT],
                (def) => mapSet(rowDefaulted, cellId, def),
                () => setAdd(rowNonDefaulted, cellId),
              );
            },
          );
          mapSet(tablesSchemaRowCache, tableId, [
            rowDefaulted,
            rowNonDefaulted,
          ]);
        },
        (_tablesSchema, tableId) => {
          mapSet(tablesSchemaMap, tableId);
          mapSet(tablesSchemaRowCache, tableId);
        },
      );
    const setValidValuesSchema = (valuesSchema) =>
      mapMatch(
        valuesSchemaMap,
        valuesSchema,
        (_valuesSchema, valueId, valueSchema) => {
          mapSet(valuesSchemaMap, valueId, valueSchema);
          ifNotUndefined(
            valueSchema[DEFAULT],
            (def) => mapSet(valuesDefaulted, valueId, def),
            () => setAdd(valuesNonDefaulted, valueId),
          );
        },
        (_valuesSchema, valueId) => {
          mapSet(valuesSchemaMap, valueId);
          mapSet(valuesDefaulted, valueId);
          collDel(valuesNonDefaulted, valueId);
        },
      );
    const setOrDelTables = (tables) =>
      objIsEmpty(tables) ? delTables() : setTables(tables);
    const setValidContent = ([tables, values]) => {
      (objIsEmpty(tables) ? delTables : setTables)(tables);
      (objIsEmpty(values) ? delValues : setValues)(values);
    };
    const setValidTables = (tables) =>
      mapMatch(
        tablesMap,
        tables,
        (_tables, tableId, table) => setValidTable(tableId, table),
        (_tables, tableId) => delValidTable(tableId),
      );
    const setValidTable = (tableId, table) =>
      mapMatch(
        mapEnsure(tablesMap, tableId, () => {
          tableIdsChanged(tableId, 1);
          mapSet(tablePoolFunctions, tableId, getPoolFunctions());
          mapSet(tableCellIds, tableId, mapNew());
          return mapNew();
        }),
        table,
        (tableMap, rowId, row) => setValidRow(tableId, tableMap, rowId, row),
        (tableMap, rowId) => delValidRow(tableId, tableMap, rowId),
      );
    const setValidRow = (tableId, tableMap, rowId, row, forceDel) =>
      mapMatch(
        mapEnsure(tableMap, rowId, () => {
          rowIdsChanged(tableId, rowId, 1);
          return mapNew();
        }),
        row,
        (rowMap, cellId, cell) =>
          setValidCell(tableId, rowId, rowMap, cellId, cell),
        (rowMap, cellId) =>
          delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel),
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
    const setCellIntoDefaultRow = (
      tableId,
      tableMap,
      rowId,
      cellId,
      validCell,
    ) =>
      ifNotUndefined(
        mapGet(tableMap, rowId),
        (rowMap) => setValidCell(tableId, rowId, rowMap, cellId, validCell),
        () =>
          setValidRow(
            tableId,
            tableMap,
            rowId,
            addDefaultsToRow({[cellId]: validCell}, tableId, rowId),
          ),
      );
    const setOrDelValues = (values) =>
      objIsEmpty(values) ? delValues() : setValues(values);
    const setValidValues = (values) =>
      mapMatch(
        valuesMap,
        values,
        (_valuesMap, valueId, value) => setValidValue(valueId, value),
        (_valuesMap, valueId) => delValidValue(valueId),
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
    const getOrCreateTable = (tableId) =>
      mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});
    const delValidTable = (tableId) => setValidTable(tableId, {});
    const delValidRow = (tableId, tableMap, rowId) => {
      const [, releaseId] = mapGet(tablePoolFunctions, tableId);
      releaseId(rowId);
      setValidRow(tableId, tableMap, rowId, {}, true);
    };
    const delValidCell = (tableId, table, rowId, row, cellId, forceDel) => {
      const defaultCell = mapGet(
        mapGet(tablesSchemaRowCache, tableId)?.[0],
        cellId,
      );
      if (!isUndefined(defaultCell) && !forceDel) {
        return setValidCell(tableId, rowId, row, cellId, defaultCell);
      }
      const delCell2 = (cellId2) => {
        cellChanged(tableId, rowId, cellId2, mapGet(row, cellId2));
        cellIdsChanged(tableId, rowId, cellId2, -1);
        mapSet(row, cellId2);
      };
      if (isUndefined(defaultCell)) {
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
      if (!isUndefined(defaultValue)) {
        return setValidValue(valueId, defaultValue);
      }
      valueChanged(valueId, mapGet(valuesMap, valueId));
      valueIdsChanged(valueId, -1);
      mapSet(valuesMap, valueId);
    };
    const tableIdsChanged = (tableId, addedOrRemoved) =>
      idsChanged(changedTableIds, tableId, addedOrRemoved);
    const rowIdsChanged = (tableId, rowId, addedOrRemoved) =>
      idsChanged(
        mapEnsure(changedRowIds, tableId, mapNew),
        rowId,
        addedOrRemoved,
      ) &&
      mapSet(
        changedRowCount,
        tableId,
        mapEnsure(changedRowCount, tableId, () => 0) + addedOrRemoved,
      );
    const cellIdsChanged = (tableId, rowId, cellId, addedOrRemoved) => {
      const cellIds = mapGet(tableCellIds, tableId);
      const count = mapGet(cellIds, cellId) ?? 0;
      if (
        (count == 0 && addedOrRemoved == 1) ||
        (count == 1 && addedOrRemoved == -1)
      ) {
        idsChanged(
          mapEnsure(changedTableCellIds, tableId, mapNew),
          cellId,
          addedOrRemoved,
        );
      }
      mapSet(
        cellIds,
        cellId,
        count != -addedOrRemoved ? count + addedOrRemoved : null,
      );
      idsChanged(
        mapEnsure(mapEnsure(changedCellIds, tableId, mapNew), rowId, mapNew),
        cellId,
        addedOrRemoved,
      );
    };
    const cellChanged = (tableId, rowId, cellId, oldCell, newCell) => {
      mapEnsure(
        mapEnsure(mapEnsure(changedCells, tableId, mapNew), rowId, mapNew),
        cellId,
        () => [oldCell, 0],
      )[1] = newCell;
      internalListeners[3]?.(tableId, rowId, cellId, newCell);
    };
    const valueIdsChanged = (valueId, addedOrRemoved) =>
      idsChanged(changedValueIds, valueId, addedOrRemoved);
    const valueChanged = (valueId, oldValue, newValue) => {
      mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
      internalListeners[4]?.(valueId, newValue);
    };
    const cellInvalid = (
      tableId,
      rowId,
      cellId,
      invalidCell,
      defaultedCell,
    ) => {
      arrayPush(
        mapEnsure(
          mapEnsure(mapEnsure(invalidCells, tableId, mapNew), rowId, mapNew),
          cellId,
          () => [],
        ),
        invalidCell,
      );
      return defaultedCell;
    };
    const valueInvalid = (valueId, invalidValue, defaultedValue) => {
      arrayPush(
        mapEnsure(invalidValues, valueId, () => []),
        invalidValue,
      );
      return defaultedValue;
    };
    const getCellChange = (tableId, rowId, cellId) =>
      ifNotUndefined(
        mapGet(mapGet(mapGet(changedCells, tableId), rowId), cellId),
        ([oldCell, newCell]) => [true, oldCell, newCell],
        () => [false, ...pairNew(getCell(tableId, rowId, cellId))],
      );
    const getValueChange = (valueId) =>
      ifNotUndefined(
        mapGet(changedValues, valueId),
        ([oldValue, newValue]) => [true, oldValue, newValue],
        () => [false, ...pairNew(getValue(valueId))],
      );
    const callInvalidCellListeners = (mutator) =>
      !collIsEmpty(invalidCells) && !collIsEmpty(invalidCellListeners[mutator])
        ? collForEach(
            mutator ? mapClone3(invalidCells) : invalidCells,
            (rows, tableId) =>
              collForEach(rows, (cells, rowId) =>
                collForEach(cells, (invalidCell, cellId) =>
                  callListeners(
                    invalidCellListeners[mutator],
                    [tableId, rowId, cellId],
                    invalidCell,
                  ),
                ),
              ),
          )
        : 0;
    const callInvalidValueListeners = (mutator) =>
      !collIsEmpty(invalidValues) &&
      !collIsEmpty(invalidValueListeners[mutator])
        ? collForEach(
            mutator ? mapClone(invalidValues) : invalidValues,
            (invalidValue, valueId) =>
              callListeners(
                invalidValueListeners[mutator],
                [valueId],
                invalidValue,
              ),
          )
        : 0;
    const callIdsAndHasListenersIfChanged = (
      changedIds,
      idListeners,
      hasListeners,
      ids,
    ) => {
      if (!collIsEmpty(changedIds)) {
        callListeners(idListeners, ids, () => mapToObj(changedIds));
        mapForEach(changedIds, (changedId, changed) =>
          callListeners(
            hasListeners,
            [...(ids ?? []), changedId],
            changed == 1,
          ),
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
        sortedRowIdsListeners[mutator],
      );
      const emptyIdAndHasListeners =
        collIsEmpty(cellIdsListeners[mutator]) &&
        collIsEmpty(hasCellListeners[mutator]) &&
        collIsEmpty(rowIdsListeners[mutator]) &&
        collIsEmpty(hasRowListeners[mutator]) &&
        collIsEmpty(tableCellIdsListeners[mutator]) &&
        collIsEmpty(hasTableCellListeners[mutator]) &&
        collIsEmpty(rowCountListeners[mutator]) &&
        emptySortedRowIdListeners &&
        collIsEmpty(tableIdsListeners[mutator]) &&
        collIsEmpty(hasTableListeners[mutator]);
      const emptyOtherListeners =
        collIsEmpty(cellListeners[mutator]) &&
        collIsEmpty(rowListeners[mutator]) &&
        collIsEmpty(tableListeners[mutator]) &&
        collIsEmpty(tablesListeners[mutator]);
      if (!emptyIdAndHasListeners || !emptyOtherListeners) {
        const changes = mutator
          ? [
              mapClone(changedTableIds),
              mapClone2(changedTableCellIds),
              mapClone(changedRowCount),
              mapClone2(changedRowIds),
              mapClone3(changedCellIds),
              mapClone3(changedCells),
            ]
          : [
              changedTableIds,
              changedTableCellIds,
              changedRowCount,
              changedRowIds,
              changedCellIds,
              changedCells,
            ];
        if (!emptyIdAndHasListeners) {
          callIdsAndHasListenersIfChanged(
            changes[0],
            tableIdsListeners[mutator],
            hasTableListeners[mutator],
          );
          collForEach(changes[1], (changedIds, tableId) =>
            callIdsAndHasListenersIfChanged(
              changedIds,
              tableCellIdsListeners[mutator],
              hasTableCellListeners[mutator],
              [tableId],
            ),
          );
          collForEach(changes[2], (changedCount, tableId) => {
            if (changedCount != 0) {
              callListeners(
                rowCountListeners[mutator],
                [tableId],
                getRowCount(tableId),
              );
            }
          });
          const calledSortableTableIds = setNew();
          collForEach(changes[3], (changedIds, tableId) => {
            if (
              callIdsAndHasListenersIfChanged(
                changedIds,
                rowIdsListeners[mutator],
                hasRowListeners[mutator],
                [tableId],
              ) &&
              !emptySortedRowIdListeners
            ) {
              callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
              setAdd(calledSortableTableIds, tableId);
            }
          });
          if (!emptySortedRowIdListeners) {
            collForEach(changes[5], (rows, tableId) => {
              if (!collHas(calledSortableTableIds, tableId)) {
                const sortableCellIds = setNew();
                collForEach(rows, (cells) =>
                  collForEach(cells, ([oldCell, newCell], cellId) =>
                    newCell !== oldCell
                      ? setAdd(sortableCellIds, cellId)
                      : collDel(cells, cellId),
                  ),
                );
                collForEach(sortableCellIds, (cellId) =>
                  callListeners(sortedRowIdsListeners[mutator], [
                    tableId,
                    cellId,
                  ]),
                );
              }
            });
          }
          collForEach(changes[4], (rowCellIds, tableId) =>
            collForEach(rowCellIds, (changedIds, rowId) =>
              callIdsAndHasListenersIfChanged(
                changedIds,
                cellIdsListeners[mutator],
                hasCellListeners[mutator],
                [tableId, rowId],
              ),
            ),
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
                    getCellChange,
                  );
                  tablesChanged = tableChanged = rowChanged = 1;
                }
              });
              if (rowChanged) {
                callListeners(
                  rowListeners[mutator],
                  [tableId, rowId],
                  getCellChange,
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
      const emptyIdAndHasListeners =
        collIsEmpty(valueIdsListeners[mutator]) &&
        collIsEmpty(hasValueListeners[mutator]);
      const emptyOtherListeners =
        collIsEmpty(valueListeners[mutator]) &&
        collIsEmpty(valuesListeners[mutator]);
      if (!emptyIdAndHasListeners || !emptyOtherListeners) {
        const changes = mutator
          ? [mapClone(changedValueIds), mapClone(changedValues)]
          : [changedValueIds, changedValues];
        if (!emptyIdAndHasListeners) {
          callIdsAndHasListenersIfChanged(
            changes[0],
            valueIdsListeners[mutator],
            hasValueListeners[mutator],
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
                getValueChange,
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
      transaction(() => actions(...arrayMap(args, id)));
      return store;
    };
    const getContent = () => [getTables(), getValues()];
    const getTables = () => mapToObj3(tablesMap);
    const getTableIds = () => mapKeys(tablesMap);
    const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)));
    const getTableCellIds = (tableId) =>
      mapKeys(mapGet(tableCellIds, id(tableId)));
    const getRowCount = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
    const getRowIds = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
    const getSortedRowIds = (tableId, cellId, descending, offset = 0, limit) =>
      arrayMap(
        slice(
          arraySort(
            mapMap(mapGet(tablesMap, id(tableId)), (row, rowId) => [
              isUndefined(cellId) ? rowId : mapGet(row, id(cellId)),
              rowId,
            ]),
            ([cell1], [cell2]) =>
              defaultSorter(cell1, cell2) * (descending ? -1 : 1),
          ),
          offset,
          isUndefined(limit) ? limit : offset + limit,
        ),
        ([, rowId]) => rowId,
      );
    const getRow = (tableId, rowId) =>
      mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
    const getCellIds = (tableId, rowId) =>
      mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
    const getCell = (tableId, rowId, cellId) =>
      mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
    const getValues = () => mapToObj(valuesMap);
    const getValueIds = () => mapKeys(valuesMap);
    const getValue = (valueId) => mapGet(valuesMap, id(valueId));
    const hasTables = () => !collIsEmpty(tablesMap);
    const hasTable = (tableId) => collHas(tablesMap, id(tableId));
    const hasTableCell = (tableId, cellId) =>
      collHas(mapGet(tableCellIds, id(tableId)), id(cellId));
    const hasRow = (tableId, rowId) =>
      collHas(mapGet(tablesMap, id(tableId)), id(rowId));
    const hasCell = (tableId, rowId, cellId) =>
      collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
    const hasValues = () => !collIsEmpty(valuesMap);
    const hasValue = (valueId) => collHas(valuesMap, id(valueId));
    const getTablesJson = () => jsonStringWithMap(tablesMap);
    const getValuesJson = () => jsonStringWithMap(valuesMap);
    const getJson = () => jsonStringWithMap([tablesMap, valuesMap]);
    const getTablesSchemaJson = () => jsonStringWithMap(tablesSchemaMap);
    const getValuesSchemaJson = () => jsonStringWithMap(valuesSchemaMap);
    const getSchemaJson = () =>
      jsonStringWithMap([tablesSchemaMap, valuesSchemaMap]);
    const setContent = (content) =>
      fluentTransaction(() => {
        const content2 = isFunction(content) ? content() : content;
        if (validateContent(content2)) {
          setValidContent(content2);
        }
      });
    const setTables = (tables) =>
      fluentTransaction(() =>
        validateTables(tables) ? setValidTables(tables) : 0,
      );
    const setTable = (tableId, table) =>
      fluentTransaction(
        (tableId2) =>
          validateTable(table, tableId2) ? setValidTable(tableId2, table) : 0,
        tableId,
      );
    const setRow = (tableId, rowId, row) =>
      fluentTransaction(
        (tableId2, rowId2) =>
          validateRow(tableId2, rowId2, row)
            ? setValidRow(tableId2, getOrCreateTable(tableId2), rowId2, row)
            : 0,
        tableId,
        rowId,
      );
    const addRow = (tableId, row, reuseRowIds = true) =>
      transaction(() => {
        let rowId = void 0;
        if (validateRow(tableId, rowId, row)) {
          tableId = id(tableId);
          setValidRow(
            tableId,
            getOrCreateTable(tableId),
            (rowId = getNewRowId(tableId, reuseRowIds ? 1 : 0)),
            row,
          );
        }
        return rowId;
      });
    const setPartialRow = (tableId, rowId, partialRow) =>
      fluentTransaction(
        (tableId2, rowId2) => {
          if (validateRow(tableId2, rowId2, partialRow, 1)) {
            const table = getOrCreateTable(tableId2);
            objMap(partialRow, (cell, cellId) =>
              setCellIntoDefaultRow(tableId2, table, rowId2, cellId, cell),
            );
          }
        },
        tableId,
        rowId,
      );
    const setCell = (tableId, rowId, cellId, cell) =>
      fluentTransaction(
        (tableId2, rowId2, cellId2) =>
          ifNotUndefined(
            getValidatedCell(
              tableId2,
              rowId2,
              cellId2,
              isFunction(cell)
                ? cell(getCell(tableId2, rowId2, cellId2))
                : cell,
            ),
            (validCell) =>
              setCellIntoDefaultRow(
                tableId2,
                getOrCreateTable(tableId2),
                rowId2,
                cellId2,
                validCell,
              ),
          ),
        tableId,
        rowId,
        cellId,
      );
    const setValues = (values) =>
      fluentTransaction(() =>
        validateValues(values) ? setValidValues(values) : 0,
      );
    const setPartialValues = (partialValues) =>
      fluentTransaction(() =>
        validateValues(partialValues, 1)
          ? objMap(partialValues, (value, valueId) =>
              setValidValue(valueId, value),
            )
          : 0,
      );
    const setValue = (valueId, value) =>
      fluentTransaction(
        (valueId2) =>
          ifNotUndefined(
            getValidatedValue(
              valueId2,
              isFunction(value) ? value(getValue(valueId2)) : value,
            ),
            (validValue) => setValidValue(valueId2, validValue),
          ),
        valueId,
      );
    const applyChanges = (changes) =>
      fluentTransaction(() => {
        objMap(changes[0], (table, tableId) =>
          isUndefined(table)
            ? delTable(tableId)
            : objMap(table, (row, rowId) =>
                isUndefined(row)
                  ? delRow(tableId, rowId)
                  : objMap(row, (cell, cellId) =>
                      setOrDelCell(store, tableId, rowId, cellId, cell),
                    ),
              ),
        );
        objMap(changes[1], (value, valueId) =>
          setOrDelValue(store, valueId, value),
        );
      });
    const setTablesJson = (tablesJson) => {
      try {
        setOrDelTables(jsonParse(tablesJson));
      } catch {}
      return store;
    };
    const setValuesJson = (valuesJson) => {
      try {
        setOrDelValues(jsonParse(valuesJson));
      } catch {}
      return store;
    };
    const setJson = (tablesAndValuesJson) =>
      fluentTransaction(() => {
        try {
          const [tables, values] = jsonParse(tablesAndValuesJson);
          setOrDelTables(tables);
          setOrDelValues(values);
        } catch {
          setTablesJson(tablesAndValuesJson);
        }
      });
    const setTablesSchema = (tablesSchema) =>
      fluentTransaction(() => {
        if ((hasTablesSchema = validateTablesSchema(tablesSchema))) {
          setValidTablesSchema(tablesSchema);
          if (!collIsEmpty(tablesMap)) {
            const tables = getTables();
            delTables();
            setTables(tables);
          }
        }
      });
    const setValuesSchema = (valuesSchema) =>
      fluentTransaction(() => {
        if ((hasValuesSchema = validateValuesSchema(valuesSchema))) {
          const values = getValues();
          delValuesSchema();
          delValues();
          hasValuesSchema = true;
          setValidValuesSchema(valuesSchema);
          setValues(values);
        }
      });
    const setSchema = (tablesSchema, valuesSchema) =>
      fluentTransaction(() => {
        setTablesSchema(tablesSchema);
        setValuesSchema(valuesSchema);
      });
    const delTables = () => fluentTransaction(() => setValidTables({}));
    const delTable = (tableId) =>
      fluentTransaction(
        (tableId2) =>
          collHas(tablesMap, tableId2) ? delValidTable(tableId2) : 0,
        tableId,
      );
    const delRow = (tableId, rowId) =>
      fluentTransaction(
        (tableId2, rowId2) =>
          ifNotUndefined(mapGet(tablesMap, tableId2), (tableMap) =>
            collHas(tableMap, rowId2)
              ? delValidRow(tableId2, tableMap, rowId2)
              : 0,
          ),
        tableId,
        rowId,
      );
    const delCell = (tableId, rowId, cellId, forceDel) =>
      fluentTransaction(
        (tableId2, rowId2, cellId2) =>
          ifNotUndefined(mapGet(tablesMap, tableId2), (tableMap) =>
            ifNotUndefined(mapGet(tableMap, rowId2), (rowMap) =>
              collHas(rowMap, cellId2)
                ? delValidCell(
                    tableId2,
                    tableMap,
                    rowId2,
                    rowMap,
                    cellId2,
                    forceDel,
                  )
                : 0,
            ),
          ),
        tableId,
        rowId,
        cellId,
      );
    const delValues = () => fluentTransaction(() => setValidValues({}));
    const delValue = (valueId) =>
      fluentTransaction(
        (valueId2) =>
          collHas(valuesMap, valueId2) ? delValidValue(valueId2) : 0,
        valueId,
      );
    const delTablesSchema = () =>
      fluentTransaction(() => {
        setValidTablesSchema({});
        hasTablesSchema = false;
      });
    const delValuesSchema = () =>
      fluentTransaction(() => {
        setValidValuesSchema({});
        hasValuesSchema = false;
      });
    const delSchema = () =>
      fluentTransaction(() => {
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
        (table, tableId) =>
          mapGet(changedTableIds, tableId) === -1
            ? void 0
            : mapToObj(
                table,
                (row, rowId) =>
                  mapGet(mapGet(changedRowIds, tableId), rowId) === -1
                    ? void 0
                    : mapToObj(
                        row,
                        ([, newCell]) => newCell,
                        (changedCell) => pairIsEqual(changedCell),
                      ),
                collIsEmpty,
                objIsEmpty,
              ),
        collIsEmpty,
        objIsEmpty,
      ),
      mapToObj(
        changedValues,
        ([, newValue]) => newValue,
        (changedValue) => pairIsEqual(changedValue),
      ),
      1,
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
      mapToObj(changedValueIds),
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
            collForEach(changedCells, (table, tableId) =>
              collForEach(table, (row, rowId) =>
                collForEach(row, ([oldCell], cellId) =>
                  setOrDelCell(store, tableId, rowId, cellId, oldCell),
                ),
              ),
            );
            collClear(changedCells);
            collForEach(changedValues, ([oldValue], valueId) =>
              setOrDelValue(store, valueId, oldValue),
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
              invalidValues,
            ],
            collClear,
          );
        }
      }
      return store;
    };
    const forEachTable = (tableCallback) =>
      collForEach(tablesMap, (tableMap, tableId) =>
        tableCallback(tableId, (rowCallback) =>
          collForEach(tableMap, (rowMap, rowId) =>
            rowCallback(rowId, (cellCallback) =>
              mapForEach(rowMap, cellCallback),
            ),
          ),
        ),
      );
    const forEachTableCell = (tableId, tableCellCallback) =>
      mapForEach(mapGet(tableCellIds, id(tableId)), tableCellCallback);
    const forEachRow = (tableId, rowCallback) =>
      collForEach(mapGet(tablesMap, id(tableId)), (rowMap, rowId) =>
        rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback)),
      );
    const forEachCell = (tableId, rowId, cellCallback) =>
      mapForEach(
        mapGet(mapGet(tablesMap, id(tableId)), id(rowId)),
        cellCallback,
      );
    const forEachValue = (valueCallback) =>
      mapForEach(valuesMap, valueCallback);
    const addSortedRowIdsListener = (
      tableId,
      cellId,
      descending,
      offset,
      limit,
      listener,
      mutator,
    ) => {
      let sortedRowIds = getSortedRowIds(
        tableId,
        cellId,
        descending,
        offset,
        limit,
      );
      return addListener(
        () => {
          const newSortedRowIds = getSortedRowIds(
            tableId,
            cellId,
            descending,
            offset,
            limit,
          );
          if (!arrayIsEqual(newSortedRowIds, sortedRowIds)) {
            sortedRowIds = newSortedRowIds;
            listener(
              store,
              tableId,
              cellId,
              descending,
              offset,
              limit,
              sortedRowIds,
            );
          }
        },
        sortedRowIdsListeners[mutator ? 1 : 0],
        [tableId, cellId],
        [getTableIds],
      );
    };
    const addStartTransactionListener = (listener) =>
      addListener(listener, startTransactionListeners);
    const addWillFinishTransactionListener = (listener) =>
      addListener(listener, finishTransactionListeners[0]);
    const addDidFinishTransactionListener = (listener) =>
      addListener(listener, finishTransactionListeners[1]);
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
      transaction:
        collSize2(startTransactionListeners) +
        pairCollSize2(finishTransactionListeners),
    });
    const setInternalListeners = (
      preStartTransaction,
      preFinishTransaction,
      postFinishTransaction,
      cellChanged2,
      valueChanged2,
    ) =>
      (internalListeners = [
        preStartTransaction,
        preFinishTransaction,
        postFinishTransaction,
        cellChanged2,
        valueChanged2,
      ]);
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
      setInternalListeners,
    };
    objMap(
      {
        [HAS + TABLES]: [0, hasTablesListeners, [], () => [hasTables()]],
        [TABLES]: [0, tablesListeners],
        [TABLE_IDS]: [0, tableIdsListeners],
        [HAS + TABLE]: [
          1,
          hasTableListeners,
          [getTableIds],
          (ids) => [hasTable(...ids)],
        ],
        [TABLE]: [1, tableListeners, [getTableIds]],
        [TABLE + CELL_IDS]: [1, tableCellIdsListeners, [getTableIds]],
        [HAS + TABLE + CELL]: [
          2,
          hasTableCellListeners,
          [getTableIds, getTableCellIds],
          (ids) => [hasTableCell(...ids)],
        ],
        [ROW_COUNT]: [1, rowCountListeners, [getTableIds]],
        [ROW_IDS]: [1, rowIdsListeners, [getTableIds]],
        [HAS + ROW]: [
          2,
          hasRowListeners,
          [getTableIds, getRowIds],
          (ids) => [hasRow(...ids)],
        ],
        [ROW]: [2, rowListeners, [getTableIds, getRowIds]],
        [CELL_IDS]: [2, cellIdsListeners, [getTableIds, getRowIds]],
        [HAS + CELL]: [
          3,
          hasCellListeners,
          [getTableIds, getRowIds, getCellIds],
          (ids) => [hasCell(...ids)],
        ],
        [CELL]: [
          3,
          cellListeners,
          [getTableIds, getRowIds, getCellIds],
          (ids) => pairNew(getCell(...ids)),
        ],
        InvalidCell: [3, invalidCellListeners],
        [HAS + VALUES]: [0, hasValuesListeners, [], () => [hasValues()]],
        [VALUES]: [0, valuesListeners],
        [VALUE_IDS]: [0, valueIdsListeners],
        [HAS + VALUE]: [
          1,
          hasValueListeners,
          [getValueIds],
          (ids) => [hasValue(...ids)],
        ],
        [VALUE]: [
          1,
          valueListeners,
          [getValueIds],
          (ids) => pairNew(getValue(ids[0])),
        ],
        InvalidValue: [1, invalidValueListeners],
      },
      (
        [argumentCount, idSetNode, pathGetters, extraArgsGetter],
        listenable,
      ) => {
        store[ADD + listenable + LISTENER] = (...args) =>
          addListener(
            args[argumentCount],
            idSetNode[args[argumentCount + 1] ? 1 : 0],
            argumentCount > 0 ? slice(args, 0, argumentCount) : void 0,
            pathGetters,
            extraArgsGetter,
          );
      },
    );
    return objFreeze(store);
  };

  const Inspector = ({position = 'right', open = false}) => {
    const s = uiReact.useCreateStore(createStore);
    const index = POSITIONS.indexOf(position);
    uiReact.useCreatePersister(
      s,
      (s2) => createSessionPersister(s2, UNIQUE_ID),
      void 0,
      async (persister) => {
        await persister.load([
          {},
          {
            position: index == -1 ? 1 : index,
            open: !!open,
          },
        ]);
        await persister.startAutoSave();
      },
    );
    return /* @__PURE__ */ createElement(
      Fragment,
      null,
      /* @__PURE__ */ createElement(
        'aside',
        {id: UNIQUE_ID},
        /* @__PURE__ */ createElement(Nub, {s}),
        /* @__PURE__ */ createElement(Panel, {s}),
      ),
      /* @__PURE__ */ createElement('style', null, APP_STYLESHEET),
    );
  };

  exports.Inspector = Inspector;
});
