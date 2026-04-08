// dist/ui-svelte-inspector/index.js
import { getContext as getContext2, onDestroy, onMount } from "https://esm.sh/svelte@^5.55.1";
import * as $2 from "https://esm.sh/svelte@^5.55.1/internal/client";
import "https://esm.sh/svelte@^5.55.1/internal/disclose-version";
import { createSubscriber as createSubscriber2 } from "https://esm.sh/svelte@^5.55.1/reactivity";

// dist/ui-svelte/index.js
import { getContext, setContext, untrack } from "https://esm.sh/svelte@^5.55.1";
import * as $ from "https://esm.sh/svelte@^5.55.1/internal/client";
import "https://esm.sh/svelte@^5.55.1/internal/disclose-version";
import { createSubscriber } from "https://esm.sh/svelte@^5.55.1/reactivity";
var getTypeOf = (thing) => typeof thing;
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var STRING = getTypeOf(EMPTY_STRING);
var FUNCTION = getTypeOf(getTypeOf);
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
var objGet = (obj, id2) => ifNotUndefined(obj, (obj2) => obj2[id2]);
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
var OFFSET_STORE = 0;
var maybeGet = (thing) => isFunction(thing) ? thing() : thing;
var getContextValue = () => getContext(TINYBASE_CONTEXT_KEY) ?? [];
var getThing = (contextValue, thingOrThingId, offset) => isUndefined(thingOrThingId) ? contextValue[offset * 2] : isString(thingOrThingId) ? objGet(contextValue[offset * 2 + 1], thingOrThingId) : thingOrThingId;
var resolveProvidedThing = (thingOrThingId, offset) => {
  const contextValue = getContextValue();
  return () => getThing(contextValue, maybeGet(thingOrThingId), offset);
};
var resolveStore = (storeOrStoreId) => resolveProvidedThing(storeOrStoreId, OFFSET_STORE);
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
var root_2 = $.from_html(`<!><!>`, 1);
var root$1 = $.from_html(`<!><!><!>`, 1);
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
  var text3 = $.text();
  $.template_effect(() => $.set_text(text3, $.get(output)));
  $.append($$anchor, text3);
  $.pop();
}
var root = $.from_html(`<!><!><!>`, 1);

// dist/ui-svelte-inspector/index.js
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
var LISTENER = "Listener";
var RESULT = "Result";
var GET = "get";
var ADD = "add";
var HAS = "Has";
var _HAS = "has";
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
var METRIC = "Metric";
var INDEX = "Index";
var SLICE = "Slice";
var RELATIONSHIP = "Relationship";
var REMOTE_ROW_ID2 = "Remote" + ROW2 + "Id";
var QUERY = "Query";
var EXTRA = "extra";
var UNDEFINED = "\uFFFC";
var JSON_PREFIX = "\uFFFD";
var id = (key) => EMPTY_STRING2 + key;
var getIfNotFunction2 = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL2 = globalThis;
var WINDOW = GLOBAL2.window;
var math = Math;
var mathMin = math.min;
var mathFloor = math.floor;
var isFiniteNumber = isFinite;
var isInstanceOf = (thing, cls) => thing instanceof cls;
var isNullish = (thing) => thing == null;
var isUndefined2 = (thing) => thing === void 0;
var hasWindow2 = () => !isUndefined2(GLOBAL2.window);
var isNull = (thing) => thing === null;
var isTrue = (thing) => thing === true;
var isFalse = (thing) => thing === false;
var ifNotNullish = getIfNotFunction2(isNullish);
var ifNotUndefined2 = getIfNotFunction2(isUndefined2);
var isTypeStringOrBoolean = (type) => type == STRING2 || type == BOOLEAN;
var isString2 = (thing) => getTypeOf2(thing) == STRING2;
var isFunction2 = (thing) => getTypeOf2(thing) == FUNCTION2;
var isArray = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var noop4 = () => {
};
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
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index2) => array2[index2] === value1);
var arraySort = (array, sorter) => array.sort(sorter);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING2) => array.join(sep);
var arrayMap = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size(array) == 0;
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayClear = (array, to) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var object2 = Object;
var getPrototypeOf = (obj) => object2.getPrototypeOf(obj);
var objFrozen = object2.isFrozen;
var objEntries = object2.entries;
var isObject = (obj) => !isNullish(obj) && ifNotNullish(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object2.prototype || isNullish(getPrototypeOf(objPrototype)),
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
var objForEach = (obj, cb) => arrayForEach(objEntries(obj), ([id2, value]) => cb(value, id2));
var objToArray = (obj, cb) => arrayMap(objEntries(obj), ([id2, value]) => cb(value, id2));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id2) => [id2, cb(value, id2)]));
var objSize = (obj) => size(objIds2(obj));
var objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
var objIsEqual = (obj1, obj2, isEqual = (value1, value2) => value1 === value2) => {
  const entries1 = objEntries(obj1);
  return size(entries1) === objSize(obj2) && arrayEvery(
    entries1,
    ([index2, value1]) => isObject(value1) ? (
      /* istanbul ignore next */
      isObject(obj2[index2]) ? objIsEqual(obj2[index2], value1, isEqual) : false
    ) : isEqual(value1, obj2[index2])
  );
};
var objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
  if (isNullish(obj) || !isObject(obj) || !emptyIsValid && objIsEmpty(obj) || objFrozen(obj)) {
    onInvalidObj?.();
    return false;
  }
  objForEach(obj, (child2, id2) => {
    if (!validateChild(child2, id2)) {
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
var replaceUndefinedString = (obj) => obj === UNDEFINED ? void 0 : isArray(obj) ? arrayMap(obj, replaceUndefinedString) : isObject(obj) ? objMap(obj, replaceUndefinedString) : obj;
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
  const index2 = POSITIONS.indexOf(position);
  return index2 == -1 ? 1 : index2;
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
var sortedIdsMap = (ids, callback) => arrayMap(arraySort([...ids]), callback);
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
var POSITIONS_SVG = arrayMap(
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
        "font-family": "inter,sans-serif",
        "z-index": 999999,
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
        arrayMap(
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
        arrayMap(
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
        arrayMap(POSITIONS_SVG, (SVG, p) => [
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
var mapMap = (coll, cb) => arrayMap([...coll?.entries() ?? []], ([key, value]) => cb(value, key));
var mapSet = (map2, key, value) => isUndefined2(value) ? (collDel(map2, key), map2) : map2?.set(key, value);
var mapEnsure = (map2, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map2, key)) {
    mapSet(map2, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map2, key));
  }
  return mapGet(map2, key);
};
var mapMatch = (map2, obj, set3, del = mapSet) => {
  objMap(obj, (value, id2) => set3(map2, id2, value));
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
    p > size(path) - 2 ? ensureLeaf : mapNew
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
  }
);
var INTEGER = /^\d+$/;
var getPoolFunctions = () => {
  const pool = [];
  let nextId = 0;
  return [
    (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING2 + nextId++,
    (id2) => {
      if (test(INTEGER, id2) && size(pool) < 1e3) {
        arrayPush(pool, id2);
      }
    }
  ];
};
var setNew = (entryOrEntries) => new Set(
  isArray(entryOrEntries) || isUndefined2(entryOrEntries) ? entryOrEntries : [entryOrEntries]
);
var setAdd = (set3, value) => set3?.add(value);
var getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING2]) => {
  const leaves = [];
  const deep = (node, p) => p == size(path) ? arrayPush(leaves, node) : isNull(path[p]) ? collForEach(node, (node2) => deep(node2, p + 1)) : arrayForEach([path[p], null], (id2) => deep(mapGet(node, id2), p + 1));
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
    (set3) => collForEach(
      set3,
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
        const index2 = size(ids);
        if (index2 == size(path)) {
          listener(thing, ...ids, ...extraArgsGetter(ids));
        } else if (isNull(path[index2])) {
          arrayForEach(
            pathGetters[index2]?.(...ids) ?? [],
            (id22) => callWithIds(...ids, id22)
          );
        } else {
          callWithIds(...ids, path[index2]);
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
    (isMergeableStore && isArray(contentOrChanges?.[0]) ? contentOrChanges?.[2] === 1 ? store.applyMergeableChanges : store.setMergeableContent : contentOrChanges?.[2] === 1 ? store.applyChanges : store.setContent)(contentOrChanges);
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
            if (isArray(content)) {
              setContentOrChanges(content);
            } else if (initialContent) {
              setDefaultContent(initialContent);
            } else {
              errorNew(`Content is not an array: ${content}`);
            }
          },
          () => {
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
  const getStore2 = () => store;
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
    getStore: getStore2,
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
    const storageListener = (event2) => {
      if (event2.storageArea === storage && event2.key === storageName) {
        tryCatch(
          () => listener(jsonParseWithUndefined(event2.newValue)),
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
  if (isArray(cellOrValue)) {
    return ARRAY;
  }
  if (isObject(cellOrValue)) {
    return OBJECT;
  }
  const type = getTypeOf2(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var isJsonType = (type) => type == OBJECT || type == ARRAY;
var encodeIfJson = (value) => isObject(value) || isArray(value) ? JSON_PREFIX + jsonString(value) : value;
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
var contentOrChangesIsEqual = ([tables1, values1], [tables2, values2]) => objIsEqual(tables1, tables2) && objIsEqual(values1, values2);
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
  const [addListener, callListeners, delListenerImpl, callListenerImpl] = getListenerFunctions(() => store);
  const whileMutating = (action) => {
    const wasMutating = mutating;
    mutating = 1;
    const result = action();
    mutating = wasMutating;
    return result;
  };
  const ifTransformed = (snapshot, getResult, then, isEqual = Object.is) => ifNotUndefined2(
    getResult(),
    (result) => snapshot === result || isEqual(snapshot, result) ? then(result) : whileMutating(() => then(result))
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
  const validateContent = isArray;
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
    objIsEqual
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
    objIsEqual
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
    objIsEqual
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
    objIsEqual
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
    mapEnsure(
      mapEnsure(mapEnsure(changedCells, tableId, mapNew), rowId, mapNew),
      cellId,
      () => [oldCell, 0]
    )[1] = newCell;
    internalListeners[3]?.(tableId, rowId, cellId, newCell, mutating);
  };
  const valueIdsChanged = (valueId, addedOrRemoved) => idsChanged(changedValueIds, valueId, addedOrRemoved);
  const valueChanged = (valueId, oldValue, newValue) => {
    mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
    internalListeners[4]?.(valueId, newValue, mutating);
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
    () => [false, ...pairNew(getCell3(tableId, rowId, cellId))]
  );
  const getValueChange = (valueId) => ifNotUndefined2(
    mapGet(changedValues, valueId),
    ([oldValue, newValue]) => [
      true,
      decodeIfJson(oldValue),
      decodeIfJson(newValue)
    ],
    () => [false, ...pairNew(getValue2(valueId))]
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
              getRowCount2(tableId)
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
    transaction(() => actions(...arrayMap(args, id)));
    return store;
  };
  const addSortedRowIdsListenerImpl = (tableId, cellId, otherArgs, listener, mutator) => {
    let sortedRowIds = getSortedRowIds2(tableId, cellId, ...otherArgs);
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds2(tableId, cellId, ...otherArgs);
        if (!arrayIsEqual(newSortedRowIds, sortedRowIds)) {
          sortedRowIds = newSortedRowIds;
          listener(store, tableId, cellId, ...otherArgs, sortedRowIds);
        }
      },
      sortedRowIdsListeners[mutator ? 1 : 0],
      [tableId, cellId],
      [getTableIds2]
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
  const getContent = () => [getTables(), getValues2()];
  const getEncodedContent = () => [mapToObj3(tablesMap), mapToObj(valuesMap)];
  const getTables = () => mapToObj3(tablesMap, decodeIfJson);
  const getTableIds2 = () => mapKeys(tablesMap);
  const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)), decodeIfJson);
  const getTableCellIds2 = (tableId) => mapKeys(mapGet(tableCellIds, id(tableId)));
  const getRowCount2 = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
  const getRowIds2 = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
  const getSortedRowIds2 = (tableIdOrArgs, cellId, descending, offset = 0, limit) => isObject(tableIdOrArgs) ? getSortedRowIds2(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending,
    tableIdOrArgs.offset,
    tableIdOrArgs.limit
  ) : arrayMap(
    slice(
      arraySort(
        mapMap(mapGet(tablesMap, id(tableIdOrArgs)), (row, rowId) => [
          isUndefined2(cellId) ? rowId : mapGet(row, id(cellId)),
          rowId
        ]),
        ([cell1], [cell2]) => defaultSorter(cell1, cell2) * (descending ? -1 : 1)
      ),
      offset,
      isUndefined2(limit) ? limit : offset + limit
    ),
    ([, rowId]) => rowId
  );
  const getRow = (tableId, rowId) => mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), decodeIfJson);
  const getCellIds2 = (tableId, rowId) => mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCell3 = (tableId, rowId, cellId) => decodeIfJson(
    mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId))
  );
  const getValues2 = () => mapToObj(valuesMap, decodeIfJson);
  const getValueIds2 = () => mapKeys(valuesMap);
  const getValue2 = (valueId) => decodeIfJson(mapGet(valuesMap, id(valueId)));
  const hasTables = () => !collIsEmpty(tablesMap);
  const hasTable = (tableId) => collHas(tablesMap, id(tableId));
  const hasTableCell = (tableId, cellId) => collHas(mapGet(tableCellIds, id(tableId)), id(cellId));
  const hasRow = (tableId, rowId) => collHas(mapGet(tablesMap, id(tableId)), id(rowId));
  const hasCell2 = (tableId, rowId, cellId) => collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
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
        isFunction2(cell) ? cell(getCell3(tableId2, rowId2, cellId2)) : cell
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
        isFunction2(value) ? value(getValue2(valueId2)) : value
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
      const values = getValues2();
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
            invalidCells,
            changedValueIds,
            changedValues,
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
  const addSortedRowIdsListener = (tableIdOrArgs, cellIdOrListener, descendingOrMutator, offset, limit, listener, mutator) => isObject(tableIdOrArgs) ? addSortedRowIdsListenerImpl(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    [
      tableIdOrArgs.descending ?? false,
      tableIdOrArgs.offset ?? 0,
      tableIdOrArgs.limit
    ],
    cellIdOrListener,
    descendingOrMutator
  ) : addSortedRowIdsListenerImpl(
    tableIdOrArgs,
    cellIdOrListener,
    [descendingOrMutator, offset, limit],
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
    getTableIds: getTableIds2,
    getTable,
    getTableCellIds: getTableCellIds2,
    getRowCount: getRowCount2,
    getRowIds: getRowIds2,
    getSortedRowIds: getSortedRowIds2,
    getRow,
    getCellIds: getCellIds2,
    getCell: getCell3,
    getValues: getValues2,
    getValueIds: getValueIds2,
    getValue: getValue2,
    hasTables,
    hasTable,
    hasTableCell,
    hasRow,
    hasCell: hasCell2,
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
      [HAS + TABLES2]: [0, hasTablesListeners, [], () => [hasTables()]],
      [TABLES2]: [0, tablesListeners],
      [TABLE_IDS2]: [0, tableIdsListeners],
      [HAS + TABLE2]: [
        1,
        hasTableListeners,
        [getTableIds2],
        (ids) => [hasTable(...ids)]
      ],
      [TABLE2]: [1, tableListeners, [getTableIds2]],
      [TABLE2 + CELL_IDS2]: [1, tableCellIdsListeners, [getTableIds2]],
      [HAS + TABLE2 + CELL2]: [
        2,
        hasTableCellListeners,
        [getTableIds2, getTableCellIds2],
        (ids) => [hasTableCell(...ids)]
      ],
      [ROW_COUNT2]: [1, rowCountListeners, [getTableIds2]],
      [ROW_IDS2]: [1, rowIdsListeners, [getTableIds2]],
      [HAS + ROW2]: [
        2,
        hasRowListeners,
        [getTableIds2, getRowIds2],
        (ids) => [hasRow(...ids)]
      ],
      [ROW2]: [2, rowListeners, [getTableIds2, getRowIds2]],
      [CELL_IDS2]: [2, cellIdsListeners, [getTableIds2, getRowIds2]],
      [HAS + CELL2]: [
        3,
        hasCellListeners,
        [getTableIds2, getRowIds2, getCellIds2],
        (ids) => [hasCell2(...ids)]
      ],
      [CELL2]: [
        3,
        cellListeners,
        [getTableIds2, getRowIds2, getCellIds2],
        (ids) => pairNew(getCell3(...ids))
      ],
      InvalidCell: [3, invalidCellListeners],
      [HAS + VALUES2]: [0, hasValuesListeners, [], () => [hasValues()]],
      [VALUES2]: [0, valuesListeners],
      [VALUE_IDS2]: [0, valueIdsListeners],
      [HAS + VALUE2]: [
        1,
        hasValueListeners,
        [getValueIds2],
        (ids) => [hasValue(...ids)]
      ],
      [VALUE2]: [
        1,
        valueListeners,
        [getValueIds2],
        (ids) => pairNew(getValue2(ids[0]))
      ],
      InvalidValue: [1, invalidValueListeners]
    },
    ([argumentCount, idSetNode, pathGetters, extraArgsGetter], listenable) => {
      store[ADD + listenable + LISTENER] = (...args) => addListener(
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
var TINYBASE_CONTEXT_KEY2 = TINYBASE2 + "_uisc";
var ReactiveHandle2 = class {
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
var WritableHandle2 = class extends ReactiveHandle2 {
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
var OFFSET_STORE2 = 0;
var OFFSET_METRICS = 1;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES = 4;
var maybeGet$1 = (thing) => isFunction2(thing) ? thing() : thing;
var getContextValue2 = () => getContext2(TINYBASE_CONTEXT_KEY2) ?? [];
var getThing2 = (contextValue, thingOrThingId, offset) => isUndefined2(thingOrThingId) ? contextValue[offset * 2] : isString2(thingOrThingId) ? objGet2(contextValue[offset * 2 + 1], thingOrThingId) : thingOrThingId;
var getProvidedThing = (thingOrThingId, offset) => getThing2(getContextValue2(), thingOrThingId, offset);
var resolveProvidedThing2 = (thingOrThingId, offset) => {
  const contextValue = getContextValue2();
  return () => getThing2(contextValue, maybeGet$1(thingOrThingId), offset);
};
var getThingIds = (contextValue, offset) => objIds2(contextValue[offset * 2 + 1] ?? EMPTY_OBJ);
var resolveStore2 = (storeOrStoreId) => resolveProvidedThing2(storeOrStoreId, OFFSET_STORE2);
var resolveMetrics = (metricsOrMetricsId) => resolveProvidedThing2(metricsOrMetricsId, OFFSET_METRICS);
var resolveIndexes = (indexesOrIndexesId) => resolveProvidedThing2(indexesOrIndexesId, OFFSET_INDEXES);
var resolveRelationships = (relationshipsOrRelationshipsId) => resolveProvidedThing2(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var resolveQueries = (queriesOrQueriesId) => resolveProvidedThing2(queriesOrQueriesId, OFFSET_QUERIES);
var createListenable = (getThing22, listenable, defaultValue, getArgs = () => EMPTY_ARR, isHas) => {
  const getListenableMethod = (isHas ? _HAS : GET) + listenable;
  const addListenableMethod = ADD + (isHas ? HAS : "") + listenable + LISTENER;
  let subscribe = $2.state($2.proxy(noop4));
  if (hasWindow2()) {
    $2.user_effect(() => {
      const thing = getThing22();
      const args = getArgs();
      $2.set(
        subscribe,
        createSubscriber2((update) => {
          const listenerId = thing?.[addListenableMethod]?.(...args, update);
          return () => thing?.delListener?.(listenerId);
        }),
        true
      );
    });
  }
  return new ReactiveHandle2(
    () => getThing22()?.[getListenableMethod]?.(...getArgs()) ?? defaultValue,
    () => $2.get(subscribe)()
  );
};
var getTableIds = (storeOrStoreId) => createListenable(resolveStore2(storeOrStoreId), TABLE_IDS2, EMPTY_ARR);
var getTableCellIds = (tableId, storeOrStoreId) => createListenable(
  resolveStore2(storeOrStoreId),
  TABLE2 + CELL_IDS2,
  EMPTY_ARR,
  () => [maybeGet$1(tableId)]
);
var getRowCount = (tableId, storeOrStoreId) => createListenable(resolveStore2(storeOrStoreId), ROW_COUNT2, 0, () => [
  maybeGet$1(tableId)
]);
var getRowIds = (tableId, storeOrStoreId) => createListenable(resolveStore2(storeOrStoreId), ROW_IDS2, EMPTY_ARR, () => [
  maybeGet$1(tableId)
]);
var getSortedRowIds = (tableId, cellId, descending = false, offset = 0, limit, storeOrStoreId) => createListenable(
  resolveStore2(storeOrStoreId),
  SORTED_ROW_IDS2,
  EMPTY_ARR,
  () => [
    maybeGet$1(tableId),
    maybeGet$1(cellId),
    maybeGet$1(descending),
    maybeGet$1(offset),
    maybeGet$1(limit)
  ]
);
var getCellIds = (tableId, rowId, storeOrStoreId) => createListenable(resolveStore2(storeOrStoreId), CELL_IDS2, EMPTY_ARR, () => [
  maybeGet$1(tableId),
  maybeGet$1(rowId)
]);
var hasCell = (tableId, rowId, cellId, storeOrStoreId) => createListenable(
  resolveStore2(storeOrStoreId),
  CELL2,
  false,
  () => [maybeGet$1(tableId), maybeGet$1(rowId), maybeGet$1(cellId)],
  1
);
var getCell2 = (tableId, rowId, cellId, storeOrStoreId) => {
  const getStore2 = resolveStore2(storeOrStoreId);
  let subscribe = $2.state($2.proxy(noop4));
  if (hasWindow2()) {
    $2.user_effect(() => {
      const store = getStore2();
      const tableIdValue = maybeGet$1(tableId);
      const rowIdValue = maybeGet$1(rowId);
      const cellIdValue = maybeGet$1(cellId);
      $2.set(
        subscribe,
        createSubscriber2((update) => {
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
  return new WritableHandle2(
    () => getStore2()?.getCell(
      maybeGet$1(tableId),
      maybeGet$1(rowId),
      maybeGet$1(cellId)
    ),
    (nextCell) => getStore2()?.setCell(
      maybeGet$1(tableId),
      maybeGet$1(rowId),
      maybeGet$1(cellId),
      nextCell
    ),
    () => $2.get(subscribe)()
  );
};
var getValues = (storeOrStoreId) => createListenable(resolveStore2(storeOrStoreId), VALUES2, EMPTY_OBJ);
var getValueIds = (storeOrStoreId) => createListenable(resolveStore2(storeOrStoreId), VALUE_IDS2, EMPTY_ARR);
var getValue = (valueId, storeOrStoreId) => {
  const getStore2 = resolveStore2(storeOrStoreId);
  let subscribe = $2.state($2.proxy(noop4));
  if (hasWindow2()) {
    $2.user_effect(() => {
      const store = getStore2();
      const valueIdValue = maybeGet$1(valueId);
      $2.set(
        subscribe,
        createSubscriber2((update) => {
          const listenerId = store?.addValueListener(valueIdValue, update);
          return () => store?.delListener?.(listenerId);
        }),
        true
      );
    });
  }
  return new WritableHandle2(
    () => getStore2()?.getValue(maybeGet$1(valueId)),
    (nextValue) => getStore2()?.setValue(maybeGet$1(valueId), nextValue),
    () => $2.get(subscribe)()
  );
};
var getStore = (id2) => getProvidedThing(id2, OFFSET_STORE2);
var getStoreIds = () => {
  const contextValue = getContextValue2();
  let ids = $2.state($2.proxy(getThingIds(contextValue, OFFSET_STORE2)));
  if (hasWindow2()) {
    $2.user_effect(() => {
      $2.set(ids, getThingIds(contextValue, OFFSET_STORE2), true);
    });
  }
  return {
    get current() {
      return $2.get(ids);
    }
  };
};
var getMetrics = (id2) => getProvidedThing(id2, OFFSET_METRICS);
var getMetricsIds = () => {
  const contextValue = getContextValue2();
  let ids = $2.state($2.proxy(getThingIds(contextValue, OFFSET_METRICS)));
  if (hasWindow2()) {
    $2.user_effect(() => {
      $2.set(ids, getThingIds(contextValue, OFFSET_METRICS), true);
    });
  }
  return {
    get current() {
      return $2.get(ids);
    }
  };
};
var getMetricIds = (metricsOrMetricsId) => createListenable(resolveMetrics(metricsOrMetricsId), METRIC + IDS2, EMPTY_ARR);
var getMetric = (metricId, metricsOrMetricsId) => createListenable(resolveMetrics(metricsOrMetricsId), METRIC, void 0, () => [
  maybeGet$1(metricId)
]);
var getIndexes = (id2) => getProvidedThing(id2, OFFSET_INDEXES);
var getIndexesIds = () => {
  const contextValue = getContextValue2();
  let ids = $2.state($2.proxy(getThingIds(contextValue, OFFSET_INDEXES)));
  if (hasWindow2()) {
    $2.user_effect(() => {
      $2.set(ids, getThingIds(contextValue, OFFSET_INDEXES), true);
    });
  }
  return {
    get current() {
      return $2.get(ids);
    }
  };
};
var getIndexIds = (indexesOrIndexesId) => createListenable(resolveIndexes(indexesOrIndexesId), INDEX + IDS2, EMPTY_ARR);
var getSliceIds = (indexId, indexesOrIndexesId) => createListenable(
  resolveIndexes(indexesOrIndexesId),
  SLICE + IDS2,
  EMPTY_ARR,
  () => [maybeGet$1(indexId)]
);
var getSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => createListenable(
  resolveIndexes(indexesOrIndexesId),
  SLICE + ROW_IDS2,
  EMPTY_ARR,
  () => [maybeGet$1(indexId), maybeGet$1(sliceId)]
);
var getIndexStoreTableId = (indexesOrId, indexId) => {
  const getIndexes2 = resolveIndexes(indexesOrId);
  return {
    get store() {
      return getIndexes2()?.getStore();
    },
    get tableId() {
      return getIndexes2()?.getTableId(maybeGet$1(indexId));
    }
  };
};
var getQueries = (id2) => getProvidedThing(id2, OFFSET_QUERIES);
var getQueriesIds = () => {
  const contextValue = getContextValue2();
  let ids = $2.state($2.proxy(getThingIds(contextValue, OFFSET_QUERIES)));
  if (hasWindow2()) {
    $2.user_effect(() => {
      $2.set(ids, getThingIds(contextValue, OFFSET_QUERIES), true);
    });
  }
  return {
    get current() {
      return $2.get(ids);
    }
  };
};
var getQueryIds = (queriesOrQueriesId) => createListenable(resolveQueries(queriesOrQueriesId), QUERY + IDS2, EMPTY_ARR);
var getResultTableCellIds = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + TABLE2 + CELL_IDS2,
  EMPTY_ARR,
  () => [maybeGet$1(queryId)]
);
var getResultRowCount = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW_COUNT2,
  0,
  () => [maybeGet$1(queryId)]
);
var getResultSortedRowIds = (queryId, cellId, descending = false, offset = 0, limit, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + SORTED_ROW_IDS2,
  EMPTY_ARR,
  () => [
    maybeGet$1(queryId),
    maybeGet$1(cellId),
    maybeGet$1(descending),
    maybeGet$1(offset),
    maybeGet$1(limit)
  ]
);
var getResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + CELL2,
  void 0,
  () => [maybeGet$1(queryId), maybeGet$1(rowId), maybeGet$1(cellId)]
);
var getRelationships = (id2) => getProvidedThing(id2, OFFSET_RELATIONSHIPS);
var getRelationshipsIds = () => {
  const contextValue = getContextValue2();
  let ids = $2.state($2.proxy(getThingIds(contextValue, OFFSET_RELATIONSHIPS)));
  if (hasWindow2()) {
    $2.user_effect(() => {
      $2.set(ids, getThingIds(contextValue, OFFSET_RELATIONSHIPS), true);
    });
  }
  return {
    get current() {
      return $2.get(ids);
    }
  };
};
var getRelationshipIds = (relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  RELATIONSHIP + IDS2,
  EMPTY_ARR
);
var getRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  REMOTE_ROW_ID2,
  void 0,
  () => [maybeGet$1(relationshipId), maybeGet$1(localRowId)]
);
var getRelationshipsStoreTableIds = (relationshipsOrId, relationshipId) => {
  const getRelationships2 = resolveRelationships(relationshipsOrId);
  return {
    get store() {
      return getRelationships2()?.getStore();
    },
    get localTableId() {
      return getRelationships2()?.getLocalTableId(maybeGet$1(relationshipId));
    },
    get remoteTableId() {
      return getRelationships2()?.getRemoteTableId(maybeGet$1(relationshipId));
    }
  };
};
var root_1$e = $2.from_html(`<img tabindex="0" alt=""/>`);
function Nub($$anchor, $$props) {
  $2.push($$props, true);
  const position = getValue(
    () => POSITION_VALUE,
    () => $$props.s
  );
  const open2 = getValue(
    () => OPEN_VALUE,
    () => $$props.s
  );
  const handleOpen = () => $$props.s.setValue(OPEN_VALUE, true);
  const handleKeyDown = (event2) => {
    if (event2.key == "Enter" || event2.key == " ") {
      event2.preventDefault();
      handleOpen();
    }
  };
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var img2 = root_1$e();
      $2.template_effect(() => {
        $2.set_attribute(img2, "title", TITLE);
        $2.set_attribute(img2, "data-position", position.current ?? 1);
      });
      $2.delegated("click", img2, handleOpen);
      $2.delegated("keydown", img2, handleKeyDown);
      $2.append($$anchor2, img2);
    };
    $2.if(node, ($$render) => {
      if (!open2.current) $$render(consequent);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
$2.delegate(["click", "keydown"]);
var requestInspectorIdleCallback = (callback) => globalThis.requestIdleCallback?.(callback) ?? setTimeout(
  () => callback({
    didTimeout: false,
    timeRemaining: () => 0
  }),
  0
);
var cancelInspectorIdleCallback = (id2) => globalThis.cancelIdleCallback?.(id2) ?? clearTimeout(id2);
var root_1$d = $2.from_html(`<img tabindex="0" alt=""/>`);
var root$c = $2.from_html(
  `<details><summary><span> </span> <!></summary> <div><!></div></details>`
);
function Details($$anchor, $$props) {
  $2.push($$props, true);
  let editable = $2.prop($$props, "editable", 3, false);
  const open2 = getCell2(
    () => STATE_TABLE,
    () => $$props.uniqueId,
    () => OPEN_CELL,
    () => $$props.s
  );
  const handleToggle = (event2) => {
    open2.current = event2.currentTarget.open;
  };
  const handleKeyDown = (event2) => {
    if (event2.key == "Enter" || event2.key == " ") {
      event2.preventDefault();
      $$props.handleEditable?.(event2);
    }
  };
  var details = root$c();
  var summary = $2.child(details);
  var span = $2.child(summary);
  var text3 = $2.child(span, true);
  $2.reset(span);
  var node = $2.sibling(span, 2);
  {
    var consequent = ($$anchor2) => {
      var img2 = root_1$d();
      $2.template_effect(() => {
        $2.set_class(img2, 1, $2.clsx(editable() ? "done" : "edit"));
        $2.set_attribute(img2, "title", editable() ? "Done editing" : "Edit");
      });
      $2.delegated("click", img2, function(...$$args) {
        $$props.handleEditable?.apply(this, $$args);
      });
      $2.delegated("keydown", img2, handleKeyDown);
      $2.append($$anchor2, img2);
    };
    $2.if(node, ($$render) => {
      if ($$props.handleEditable) $$render(consequent);
    });
  }
  $2.reset(summary);
  var div = $2.sibling(summary, 2);
  var node_1 = $2.child(div);
  $2.snippet(node_1, () => $$props.children);
  $2.reset(div);
  $2.reset(details);
  $2.template_effect(() => {
    details.open = !!open2.current;
    $2.set_text(text3, $$props.title);
  });
  $2.event("toggle", details, handleToggle);
  $2.append($$anchor, details);
  $2.pop();
}
$2.delegate(["click", "keydown"]);
var root_1$c = $2.from_html(`<button> </button>`);
var root_2$9 = $2.from_html(`<input/>`);
var root_3$3 = $2.from_html(`<input type="number"/>`);
var root_4$5 = $2.from_html(`<input type="checkbox"/>`);
var root_5$5 = $2.from_html(`<input/>`);
var root_6$2 = $2.from_html(`<input/>`);
var root$b = $2.from_html(`<div><!> <!></div>`);
function EditableThing($$anchor, $$props) {
  $2.push($$props, true);
  let showType = $2.prop($$props, "showType", 3, true);
  const EMPTY_STRING3 = "";
  const INVALID = "invalid";
  let thingType = $2.state(void 0);
  let currentThingKey = $2.state(void 0);
  let stringThing = $2.state(void 0);
  let numberThing = $2.state(void 0);
  let booleanThing = $2.state(void 0);
  let objectThing = $2.state("{}");
  let arrayThing = $2.state("[]");
  let objectClassName = $2.state(EMPTY_STRING3);
  let arrayClassName = $2.state(EMPTY_STRING3);
  const getThingKey = (thing) => `${getCellOrValueType(thing)}:${isObject(thing) || isArray(thing) ? jsonString(thing) : String(thing)}`;
  $2.user_effect(() => {
    const thingKey = getThingKey($$props.thing);
    if ($2.get(currentThingKey) !== thingKey) {
      $2.set(thingType, getCellOrValueType($$props.thing), true);
      $2.set(currentThingKey, thingKey, true);
      if (isObject($$props.thing)) {
        $2.set(objectThing, jsonString($$props.thing), true);
      } else if (isArray($$props.thing)) {
        $2.set(arrayThing, jsonString($$props.thing), true);
      } else {
        $2.set(stringThing, String($$props.thing), true);
        $2.set(numberThing, Number($$props.thing) || 0, true);
        $2.set(booleanThing, Boolean($$props.thing), true);
      }
    }
  });
  const handleThingChange = (nextThing, setTypedThing) => {
    setTypedThing(nextThing);
    $2.set(currentThingKey, getThingKey(nextThing), true);
    $$props.onThingChange(nextThing);
  };
  const handleJsonThingChange = (value, setTypedThing, isThing, setTypedClassName) => {
    setTypedThing(value);
    try {
      const object3 = jsonParse(value);
      if (isThing(object3)) {
        $2.set(currentThingKey, getThingKey(object3), true);
        $$props.onThingChange(object3);
        setTypedClassName(EMPTY_STRING3);
      }
    } catch {
      setTypedClassName(INVALID);
    }
  };
  const handleTypeChange = () => {
    if (!$$props.hasSchema?.()) {
      const nextType = getTypeCase(
        $2.get(thingType),
        NUMBER,
        BOOLEAN,
        OBJECT,
        ARRAY,
        STRING2
      );
      const nextThing = getTypeCase(
        nextType,
        $2.get(stringThing),
        $2.get(numberThing),
        $2.get(booleanThing),
        tryReturn(() => jsonParse($2.get(objectThing)), {}),
        tryReturn(() => jsonParse($2.get(arrayThing)), [])
      );
      $2.set(thingType, nextType, true);
      $2.set(currentThingKey, getThingKey(nextThing), true);
      $$props.onThingChange(nextThing);
    }
  };
  const hasWidget = $2.derived(
    () => getTypeCase($2.get(thingType), 1, 1, 1, 1, 1) == 1
  );
  var div = root$b();
  var node = $2.child(div);
  {
    var consequent = ($$anchor2) => {
      var button = root_1$c();
      var text3 = $2.child(button, true);
      $2.reset(button);
      $2.template_effect(() => {
        $2.set_attribute(button, "title", $2.get(thingType));
        $2.set_class(button, 1, $2.clsx($2.get(thingType)));
        $2.set_text(text3, $2.get(thingType));
      });
      $2.delegated("click", button, handleTypeChange);
      $2.append($$anchor2, button);
    };
    $2.if(node, ($$render) => {
      if (showType() && $2.get(hasWidget)) $$render(consequent);
    });
  }
  var node_1 = $2.sibling(node, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var input = root_2$9();
      $2.remove_input_defaults(input);
      $2.template_effect(() => $2.set_value(input, $2.get(stringThing)));
      $2.delegated(
        "input",
        input,
        (event2) => handleThingChange(
          String(event2.currentTarget.value),
          (value) => $2.set(stringThing, value, true)
        )
      );
      $2.append($$anchor2, input);
    };
    var consequent_2 = ($$anchor2) => {
      var input_1 = root_3$3();
      $2.remove_input_defaults(input_1);
      $2.template_effect(() => $2.set_value(input_1, $2.get(numberThing)));
      $2.delegated(
        "input",
        input_1,
        (event2) => handleThingChange(
          Number(event2.currentTarget.value || 0),
          (value) => $2.set(numberThing, value, true)
        )
      );
      $2.append($$anchor2, input_1);
    };
    var consequent_3 = ($$anchor2) => {
      var input_2 = root_4$5();
      $2.remove_input_defaults(input_2);
      $2.template_effect(() => $2.set_checked(input_2, $2.get(booleanThing)));
      $2.delegated(
        "change",
        input_2,
        (event2) => handleThingChange(
          Boolean(event2.currentTarget.checked),
          (value) => $2.set(booleanThing, value, true)
        )
      );
      $2.append($$anchor2, input_2);
    };
    var consequent_4 = ($$anchor2) => {
      var input_3 = root_5$5();
      $2.remove_input_defaults(input_3);
      $2.template_effect(() => {
        $2.set_value(input_3, $2.get(objectThing));
        $2.set_class(input_3, 1, $2.clsx($2.get(objectClassName)));
      });
      $2.delegated(
        "input",
        input_3,
        (event2) => handleJsonThingChange(
          event2.currentTarget.value,
          (value) => $2.set(objectThing, value, true),
          isObject,
          (value) => $2.set(objectClassName, value, true)
        )
      );
      $2.append($$anchor2, input_3);
    };
    var consequent_5 = ($$anchor2) => {
      var input_4 = root_6$2();
      $2.remove_input_defaults(input_4);
      $2.template_effect(() => {
        $2.set_value(input_4, $2.get(arrayThing));
        $2.set_class(input_4, 1, $2.clsx($2.get(arrayClassName)));
      });
      $2.delegated(
        "input",
        input_4,
        (event2) => handleJsonThingChange(
          event2.currentTarget.value,
          (value) => $2.set(arrayThing, value, true),
          isArray,
          (value) => $2.set(arrayClassName, value, true)
        )
      );
      $2.append($$anchor2, input_4);
    };
    $2.if(node_1, ($$render) => {
      if ($2.get(thingType) == STRING2) $$render(consequent_1);
      else if ($2.get(thingType) == NUMBER) $$render(consequent_2, 1);
      else if ($2.get(thingType) == BOOLEAN) $$render(consequent_3, 2);
      else if ($2.get(thingType) == OBJECT) $$render(consequent_4, 3);
      else if ($2.get(thingType) == ARRAY) $$render(consequent_5, 4);
    });
  }
  $2.reset(div);
  $2.template_effect(() => $2.set_class(div, 1, $2.clsx($$props.className)));
  $2.append($$anchor, div);
  $2.pop();
}
$2.delegate(["click", "input", "change"]);
var UP_ARROW = "\u2191";
var DOWN_ARROW = "\u2193";
var EDITABLE = "editable";
var extraKey = (index2, after) => (after ? ">" : "<") + index2;
var getProps = (getComponentProps, ...ids) => getComponentProps == null ? {} : getComponentProps(...ids);
var getCells = (defaultCellIds, customCells, defaultCellComponent) => {
  const cellIds = customCells ?? defaultCellIds;
  const source = isArray(cellIds) ? objNew(arrayMap(cellIds, (cellId) => [cellId, cellId])) : cellIds;
  return objMap(source, (labelOrCustomCell, cellId) => ({
    ...{ label: cellId, component: defaultCellComponent },
    ...isString2(labelOrCustomCell) ? { label: labelOrCustomCell } : labelOrCustomCell
  }));
};
var getExtraHeaders = (extraCells = [], after = 0) => arrayMap(extraCells, ({ label }, index2) => ({
  className: EXTRA,
  key: extraKey(index2, after),
  label
}));
function EditableCellView($$anchor, $$props) {
  $2.push($$props, true);
  const cell = getCell2(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.store
  );
  const resolvedStore = resolveStore2(() => $$props.store);
  {
    let $0 = $2.derived(() => $$props.className ?? EDITABLE + CELL2);
    EditableThing($$anchor, {
      get thing() {
        return cell.current;
      },
      onThingChange: (thing) => cell.current = thing,
      get className() {
        return $2.get($0);
      },
      get showType() {
        return $$props.showType;
      },
      hasSchema: () => resolvedStore()?.hasTablesSchema() ?? false
    });
  }
  $2.pop();
}
function EditableValueView($$anchor, $$props) {
  $2.push($$props, true);
  const value = getValue(
    () => $$props.valueId,
    () => $$props.store
  );
  const resolvedStore = resolveStore2(() => $$props.store);
  {
    let $0 = $2.derived(() => $$props.className ?? EDITABLE + VALUE2);
    EditableThing($$anchor, {
      get thing() {
        return value.current;
      },
      onThingChange: (thing) => value.current = thing,
      get className() {
        return $2.get($0);
      },
      get showType() {
        return $$props.showType;
      },
      hasSchema: () => resolvedStore()?.hasValuesSchema() ?? false
    });
  }
  $2.pop();
}
function CellView2($$anchor, $$props) {
  $2.push($$props, true);
  const cell = getCell2(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.store
  );
  const display = $2.derived(() => "" + (cell.current ?? ""));
  const output = $2.derived(
    () => $$props.debugIds ? `${$$props.cellId}:{${$2.get(display)}}` : $2.get(display)
  );
  $2.next();
  var text3 = $2.text();
  $2.template_effect(() => $2.set_text(text3, $2.get(output)));
  $2.append($$anchor, text3);
  $2.pop();
}
var root_1$b = $2.from_html(`<td><!></td>`);
var root_2$8 = $2.from_html(`<th> </th> <th> </th>`, 1);
var root_4$4 = $2.from_html(`<td><!></td>`);
var root_5$4 = $2.from_html(`<td><!></td>`);
var root$a = $2.from_html(`<tr><!><!><!><!></tr>`);
function RelationshipInHtmlRow($$anchor, $$props) {
  $2.push($$props, true);
  let extraCellsBefore = $2.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $2.prop($$props, "extraCellsAfter", 19, () => []);
  const remoteRowId = getRemoteRowId(
    () => $$props.relationshipId,
    () => $$props.localRowId,
    () => $$props.relationships
  );
  const cellEntries = $2.derived(() => objEntries($$props.cells));
  const rowProps = $2.derived(() => ({
    tableId: $$props.localTableId ?? "",
    rowId: $$props.localRowId,
    store: $$props.store
  }));
  var tr = root$a();
  var node = $2.child(tr);
  $2.each(
    node,
    19,
    extraCellsBefore,
    (extraCell, index2) => extraKey(index2, 0),
    ($$anchor2, extraCell) => {
      const ExtraCell = $2.derived(() => $2.get(extraCell).component);
      var td = root_1$b();
      var node_1 = $2.child(td);
      $2.component(
        node_1,
        () => $2.get(ExtraCell),
        ($$anchor3, ExtraCell_1) => {
          ExtraCell_1(
            $$anchor3,
            $2.spread_props(() => $2.get(rowProps))
          );
        }
      );
      $2.reset(td);
      $2.template_effect(() => $2.set_class(td, 1, $2.clsx(EXTRA)));
      $2.append($$anchor2, td);
    }
  );
  var node_2 = $2.sibling(node);
  {
    var consequent = ($$anchor2) => {
      var fragment = root_2$8();
      var th = $2.first_child(fragment);
      var text3 = $2.child(th, true);
      $2.reset(th);
      var th_1 = $2.sibling(th, 2);
      var text_1 = $2.child(th_1, true);
      $2.reset(th_1);
      $2.template_effect(() => {
        $2.set_attribute(th, "title", $$props.localRowId);
        $2.set_text(text3, $$props.localRowId);
        $2.set_attribute(th_1, "title", remoteRowId.current);
        $2.set_text(text_1, remoteRowId.current);
      });
      $2.append($$anchor2, fragment);
    };
    var d = $2.derived(() => !isFalse($$props.idColumn));
    $2.if(node_2, ($$render) => {
      if ($2.get(d)) $$render(consequent);
    });
  }
  var node_3 = $2.sibling(node_2);
  $2.each(
    node_3,
    17,
    () => $2.get(cellEntries),
    (entry) => entry[0],
    ($$anchor2, entry) => {
      const compoundCellId = $2.derived(() => $2.get(entry)[0]);
      const cell = $2.derived(() => $2.get(entry)[1]);
      const CellComponent = $2.derived(() => $2.get(cell).component);
      const computed_const = $2.derived(() => {
        const [tableId, cellId] = $2.get(compoundCellId).split(".", 2);
        return { tableId, cellId };
      });
      const rowId = $2.derived(
        () => $2.get(computed_const).tableId === $$props.localTableId ? $$props.localRowId : $2.get(computed_const).tableId === $$props.remoteTableId ? remoteRowId.current : void 0
      );
      var fragment_1 = $2.comment();
      var node_4 = $2.first_child(fragment_1);
      {
        var consequent_1 = ($$anchor3) => {
          var td_1 = root_4$4();
          var node_5 = $2.child(td_1);
          {
            let $0 = $2.derived(
              () => getProps(
                $2.get(cell).getComponentProps,
                $2.get(rowId),
                $2.get(computed_const).cellId
              )
            );
            $2.component(
              node_5,
              () => $2.get(CellComponent),
              ($$anchor4, CellComponent_1) => {
                CellComponent_1(
                  $$anchor4,
                  $2.spread_props(() => $2.get($0), {
                    get store() {
                      return $$props.store;
                    },
                    get tableId() {
                      return $2.get(computed_const).tableId;
                    },
                    get rowId() {
                      return $2.get(rowId);
                    },
                    get cellId() {
                      return $2.get(computed_const).cellId;
                    }
                  })
                );
              }
            );
          }
          $2.reset(td_1);
          $2.append($$anchor3, td_1);
        };
        var d_1 = $2.derived(() => !isUndefined2($2.get(rowId)));
        $2.if(node_4, ($$render) => {
          if ($2.get(d_1)) $$render(consequent_1);
        });
      }
      $2.append($$anchor2, fragment_1);
    }
  );
  var node_6 = $2.sibling(node_3);
  $2.each(
    node_6,
    19,
    extraCellsAfter,
    (extraCell, index2) => extraKey(index2, 1),
    ($$anchor2, extraCell) => {
      const ExtraCell = $2.derived(() => $2.get(extraCell).component);
      var td_2 = root_5$4();
      var node_7 = $2.child(td_2);
      $2.component(
        node_7,
        () => $2.get(ExtraCell),
        ($$anchor3, ExtraCell_2) => {
          ExtraCell_2(
            $$anchor3,
            $2.spread_props(() => $2.get(rowProps))
          );
        }
      );
      $2.reset(td_2);
      $2.template_effect(() => $2.set_class(td_2, 1, $2.clsx(EXTRA)));
      $2.append($$anchor2, td_2);
    }
  );
  $2.reset(tr);
  $2.append($$anchor, tr);
  $2.pop();
}
var root_2$7 = $2.from_html(`<th> </th>`);
var root_3$2 = $2.from_html(`<th> </th> <th> </th>`, 1);
var root_4$3 = $2.from_html(`<th> </th>`);
var root_5$3 = $2.from_html(`<th> </th>`);
var root_1$a = $2.from_html(`<thead><tr><!><!><!><!></tr></thead>`);
var root$9 = $2.from_html(`<table><!><tbody></tbody></table>`);
function RelationshipInHtmlTable($$anchor, $$props) {
  $2.push($$props, true);
  let extraCellsBefore = $2.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $2.prop($$props, "extraCellsAfter", 19, () => []), idColumn = $2.prop($$props, "idColumn", 3, true);
  const relationship = getRelationshipsStoreTableIds(
    () => $$props.relationships,
    () => $$props.relationshipId
  );
  const localCellIds = getTableCellIds(
    () => relationship.localTableId,
    () => relationship.store
  );
  const remoteCellIds = getTableCellIds(
    () => relationship.remoteTableId,
    () => relationship.store
  );
  const localRowIds = getRowIds(
    () => relationship.localTableId,
    () => relationship.store
  );
  const defaultCellComponent = $2.derived(
    () => $$props.editable ? EditableCellView : CellView2
  );
  const cells = $2.derived(
    () => getCells(
      [
        ...arrayMap(
          localCellIds.current,
          (cellId) => relationship.localTableId + DOT + cellId
        ),
        ...arrayMap(
          remoteCellIds.current,
          (cellId) => relationship.remoteTableId + DOT + cellId
        )
      ],
      $$props.customCells,
      $2.get(defaultCellComponent)
    )
  );
  const cellEntries = $2.derived(() => objEntries($2.get(cells)));
  const extraHeadersBefore = $2.derived(
    () => getExtraHeaders(extraCellsBefore())
  );
  const extraHeadersAfter = $2.derived(
    () => getExtraHeaders(extraCellsAfter(), 1)
  );
  var table = root$9();
  var node = $2.child(table);
  {
    var consequent_1 = ($$anchor2) => {
      var thead = root_1$a();
      var tr = $2.child(thead);
      var node_1 = $2.child(tr);
      $2.each(
        node_1,
        17,
        () => $2.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_2$7();
          var text3 = $2.child(th, true);
          $2.reset(th);
          $2.template_effect(() => {
            $2.set_class(th, 1, $2.clsx($2.get(extraHeader).className));
            $2.set_text(text3, $2.get(extraHeader).label);
          });
          $2.append($$anchor3, th);
        }
      );
      var node_2 = $2.sibling(node_1);
      {
        var consequent = ($$anchor3) => {
          var fragment = root_3$2();
          var th_1 = $2.first_child(fragment);
          var text_1 = $2.child(th_1);
          $2.reset(th_1);
          var th_2 = $2.sibling(th_1, 2);
          var text_2 = $2.child(th_2);
          $2.reset(th_2);
          $2.template_effect(() => {
            $2.set_text(text_1, `${relationship.localTableId ?? ""}.Id`);
            $2.set_text(text_2, `${relationship.remoteTableId ?? ""}.Id`);
          });
          $2.append($$anchor3, fragment);
        };
        var d = $2.derived(() => !isFalse(idColumn()));
        $2.if(node_2, ($$render) => {
          if ($2.get(d)) $$render(consequent);
        });
      }
      var node_3 = $2.sibling(node_2);
      $2.each(
        node_3,
        17,
        () => $2.get(cellEntries),
        (entry) => entry[0],
        ($$anchor3, entry) => {
          var th_3 = root_4$3();
          var text_3 = $2.child(th_3, true);
          $2.reset(th_3);
          $2.template_effect(() => $2.set_text(text_3, $2.get(entry)[1].label));
          $2.append($$anchor3, th_3);
        }
      );
      var node_4 = $2.sibling(node_3);
      $2.each(
        node_4,
        17,
        () => $2.get(extraHeadersAfter),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th_4 = root_5$3();
          var text_4 = $2.child(th_4, true);
          $2.reset(th_4);
          $2.template_effect(() => {
            $2.set_class(th_4, 1, $2.clsx($2.get(extraHeader).className));
            $2.set_text(text_4, $2.get(extraHeader).label);
          });
          $2.append($$anchor3, th_4);
        }
      );
      $2.reset(tr);
      $2.reset(thead);
      $2.append($$anchor2, thead);
    };
    $2.if(node, ($$render) => {
      if ($$props.headerRow !== false) $$render(consequent_1);
    });
  }
  var tbody = $2.sibling(node);
  $2.each(
    tbody,
    20,
    () => localRowIds.current,
    (localRowId) => localRowId,
    ($$anchor2, localRowId) => {
      RelationshipInHtmlRow($$anchor2, {
        get localRowId() {
          return localRowId;
        },
        get idColumn() {
          return idColumn();
        },
        get cells() {
          return $2.get(cells);
        },
        get localTableId() {
          return relationship.localTableId;
        },
        get remoteTableId() {
          return relationship.remoteTableId;
        },
        get relationshipId() {
          return $$props.relationshipId;
        },
        get relationships() {
          return $$props.relationships;
        },
        get store() {
          return relationship.store;
        },
        get extraCellsBefore() {
          return extraCellsBefore();
        },
        get extraCellsAfter() {
          return extraCellsAfter();
        }
      });
    }
  );
  $2.reset(tbody);
  $2.reset(table);
  $2.template_effect(() => $2.set_class(table, 1, $2.clsx($$props.className)));
  $2.append($$anchor, table);
  $2.pop();
}
function ResultCellView($$anchor, $$props) {
  $2.push($$props, true);
  const cell = getResultCell(
    () => $$props.queryId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.queries
  );
  const display = $2.derived(() => "" + (cell.current ?? ""));
  const output = $2.derived(
    () => $$props.debugIds ? `${$$props.cellId}:{${$2.get(display)}}` : $2.get(display)
  );
  $2.next();
  var text3 = $2.text();
  $2.template_effect(() => $2.set_text(text3, $2.get(output)));
  $2.append($$anchor, text3);
  $2.pop();
}
var root_1$9 = $2.from_html(`<caption><!></caption>`);
var root_3$1 = $2.from_html(`<th> </th>`);
var root_4$2 = $2.from_html(`<th><!> Id</th>`);
var root_6$1 = $2.from_html(`<th><!> </th>`);
var root_8$1 = $2.from_html(`<th> </th>`);
var root_2$6 = $2.from_html(`<thead><tr><!><!><!><!></tr></thead>`);
var root_10 = $2.from_html(`<td><!></td>`);
var root_11 = $2.from_html(`<th> </th>`);
var root_12 = $2.from_html(`<td><!></td>`);
var root_13 = $2.from_html(`<td><!></td>`);
var root_9 = $2.from_html(`<tr><!><!><!><!></tr>`);
var root$8 = $2.from_html(`<table><!><!><tbody></tbody></table>`);
function HtmlTable($$anchor, $$props) {
  $2.push($$props, true);
  let extraCellsBefore = $2.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $2.prop($$props, "extraCellsAfter", 19, () => []);
  const cellEntries = $2.derived(() => objEntries($$props.cells));
  const extraHeadersBefore = $2.derived(
    () => getExtraHeaders(extraCellsBefore())
  );
  const extraHeadersAfter = $2.derived(
    () => getExtraHeaders(extraCellsAfter(), 1)
  );
  const PaginatorComponent = $2.derived(() => $$props.paginator?.component);
  const paginatorProps = $2.derived(() => $$props.paginator?.props);
  var table = root$8();
  var node = $2.child(table);
  {
    var consequent = ($$anchor2) => {
      var caption = root_1$9();
      var node_1 = $2.child(caption);
      $2.component(
        node_1,
        () => $2.get(PaginatorComponent),
        ($$anchor3, PaginatorComponent_1) => {
          PaginatorComponent_1(
            $$anchor3,
            $2.spread_props(() => $2.get(paginatorProps))
          );
        }
      );
      $2.reset(caption);
      $2.append($$anchor2, caption);
    };
    $2.if(node, ($$render) => {
      if ($2.get(PaginatorComponent) && $2.get(paginatorProps))
        $$render(consequent);
    });
  }
  var node_2 = $2.sibling(node);
  {
    var consequent_4 = ($$anchor2) => {
      var thead = root_2$6();
      var tr = $2.child(thead);
      var node_3 = $2.child(tr);
      $2.each(
        node_3,
        17,
        () => $2.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_3$1();
          var text3 = $2.child(th, true);
          $2.reset(th);
          $2.template_effect(() => {
            $2.set_class(th, 1, $2.clsx($2.get(extraHeader).className));
            $2.set_text(text3, $2.get(extraHeader).label);
          });
          $2.append($$anchor3, th);
        }
      );
      var node_4 = $2.sibling(node_3);
      {
        var consequent_2 = ($$anchor3) => {
          var th_1 = root_4$2();
          var node_5 = $2.child(th_1);
          {
            var consequent_1 = ($$anchor4) => {
              var text_1 = $2.text();
              $2.template_effect(
                () => $2.set_text(
                  text_1,
                  ($$props.sortAndOffset[1] ? DOWN_ARROW : UP_ARROW) + " "
                )
              );
              $2.append($$anchor4, text_1);
            };
            var d = $2.derived(
              () => !isUndefined2($$props.sortAndOffset) && $$props.sortAndOffset[0] == null
            );
            $2.if(node_5, ($$render) => {
              if ($2.get(d)) $$render(consequent_1);
            });
          }
          $2.next();
          $2.reset(th_1);
          $2.template_effect(
            ($0) => $2.set_class(th_1, 1, $0),
            [
              () => $2.clsx(
                isUndefined2($$props.sortAndOffset) || $$props.sortAndOffset[0] != null ? void 0 : `sorted ${$$props.sortAndOffset[1] ? "de" : "a"}scending`
              )
            ]
          );
          $2.delegated("click", th_1, () => $$props.handleSort?.(void 0));
          $2.append($$anchor3, th_1);
        };
        $2.if(node_4, ($$render) => {
          if ($$props.idColumn !== false) $$render(consequent_2);
        });
      }
      var node_6 = $2.sibling(node_4);
      $2.each(
        node_6,
        17,
        () => $2.get(cellEntries),
        (entry) => entry[0],
        ($$anchor3, entry) => {
          const cellId = $2.derived(() => $2.get(entry)[0]);
          const cell = $2.derived(() => $2.get(entry)[1]);
          var th_2 = root_6$1();
          var node_7 = $2.child(th_2);
          {
            var consequent_3 = ($$anchor4) => {
              var text_2 = $2.text();
              $2.template_effect(
                () => $2.set_text(
                  text_2,
                  ($$props.sortAndOffset[1] ? DOWN_ARROW : UP_ARROW) + " "
                )
              );
              $2.append($$anchor4, text_2);
            };
            var d_1 = $2.derived(
              () => !isUndefined2($$props.sortAndOffset) && $$props.sortAndOffset[0] == $2.get(cellId)
            );
            $2.if(node_7, ($$render) => {
              if ($2.get(d_1)) $$render(consequent_3);
            });
          }
          var text_3 = $2.sibling(node_7);
          $2.reset(th_2);
          $2.template_effect(
            ($0) => {
              $2.set_class(th_2, 1, $0);
              $2.set_text(text_3, ` ${$2.get(cell).label ?? ""}`);
            },
            [
              () => $2.clsx(
                isUndefined2($$props.sortAndOffset) || $$props.sortAndOffset[0] != $2.get(cellId) ? void 0 : `sorted ${$$props.sortAndOffset[1] ? "de" : "a"}scending`
              )
            ]
          );
          $2.delegated("click", th_2, () => $$props.handleSort?.($2.get(cellId)));
          $2.append($$anchor3, th_2);
        }
      );
      var node_8 = $2.sibling(node_6);
      $2.each(
        node_8,
        17,
        () => $2.get(extraHeadersAfter),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th_3 = root_8$1();
          var text_4 = $2.child(th_3, true);
          $2.reset(th_3);
          $2.template_effect(() => {
            $2.set_class(th_3, 1, $2.clsx($2.get(extraHeader).className));
            $2.set_text(text_4, $2.get(extraHeader).label);
          });
          $2.append($$anchor3, th_3);
        }
      );
      $2.reset(tr);
      $2.reset(thead);
      $2.append($$anchor2, thead);
    };
    $2.if(node_2, ($$render) => {
      if ($$props.headerRow !== false) $$render(consequent_4);
    });
  }
  var tbody = $2.sibling(node_2);
  $2.each(
    tbody,
    20,
    () => $$props.rowIds.current,
    (rowId) => rowId,
    ($$anchor2, rowId) => {
      const rowProps = $2.derived(() => ({
        ...$$props.cellComponentProps,
        rowId
      }));
      var tr_1 = root_9();
      var node_9 = $2.child(tr_1);
      $2.each(
        node_9,
        19,
        extraCellsBefore,
        (extraCell, index2) => extraKey(index2, 0),
        ($$anchor3, extraCell) => {
          const ExtraCell = $2.derived(() => $2.get(extraCell).component);
          var td = root_10();
          var node_10 = $2.child(td);
          $2.component(
            node_10,
            () => $2.get(ExtraCell),
            ($$anchor4, ExtraCell_1) => {
              ExtraCell_1(
                $$anchor4,
                $2.spread_props(() => $2.get(rowProps))
              );
            }
          );
          $2.reset(td);
          $2.template_effect(() => $2.set_class(td, 1, $2.clsx(EXTRA)));
          $2.append($$anchor3, td);
        }
      );
      var node_11 = $2.sibling(node_9);
      {
        var consequent_5 = ($$anchor3) => {
          var th_4 = root_11();
          var text_5 = $2.child(th_4, true);
          $2.reset(th_4);
          $2.template_effect(() => {
            $2.set_attribute(th_4, "title", rowId);
            $2.set_text(text_5, rowId);
          });
          $2.append($$anchor3, th_4);
        };
        var d_2 = $2.derived(() => !isFalse($$props.idColumn));
        $2.if(node_11, ($$render) => {
          if ($2.get(d_2)) $$render(consequent_5);
        });
      }
      var node_12 = $2.sibling(node_11);
      $2.each(
        node_12,
        17,
        () => $2.get(cellEntries),
        (entry) => entry[0],
        ($$anchor3, entry) => {
          const cellId = $2.derived(() => $2.get(entry)[0]);
          const cell = $2.derived(() => $2.get(entry)[1]);
          const CellComponent = $2.derived(() => $2.get(cell).component);
          var td_1 = root_12();
          var node_13 = $2.child(td_1);
          {
            let $0 = $2.derived(
              () => getProps($2.get(cell).getComponentProps, rowId, $2.get(cellId))
            );
            $2.component(
              node_13,
              () => $2.get(CellComponent),
              ($$anchor4, CellComponent_1) => {
                CellComponent_1(
                  $$anchor4,
                  $2.spread_props(
                    () => $2.get($0),
                    () => $2.get(rowProps),
                    {
                      get cellId() {
                        return $2.get(cellId);
                      }
                    }
                  )
                );
              }
            );
          }
          $2.reset(td_1);
          $2.append($$anchor3, td_1);
        }
      );
      var node_14 = $2.sibling(node_12);
      $2.each(
        node_14,
        19,
        extraCellsAfter,
        (extraCell, index2) => extraKey(index2, 1),
        ($$anchor3, extraCell) => {
          const ExtraCell = $2.derived(() => $2.get(extraCell).component);
          var td_2 = root_13();
          var node_15 = $2.child(td_2);
          $2.component(
            node_15,
            () => $2.get(ExtraCell),
            ($$anchor4, ExtraCell_2) => {
              ExtraCell_2(
                $$anchor4,
                $2.spread_props(() => $2.get(rowProps))
              );
            }
          );
          $2.reset(td_2);
          $2.template_effect(() => $2.set_class(td_2, 1, $2.clsx(EXTRA)));
          $2.append($$anchor3, td_2);
        }
      );
      $2.reset(tr_1);
      $2.append($$anchor2, tr_1);
    }
  );
  $2.reset(tbody);
  $2.reset(table);
  $2.template_effect(() => $2.set_class(table, 1, $2.clsx($$props.className)));
  $2.append($$anchor, table);
  $2.pop();
}
$2.delegate(["click"]);
var root_1$8 = $2.from_html(
  `<button class="previous"></button> <button class="next"></button> `,
  1
);
var root$7 = $2.from_html(`<!> `, 1);
function SortedTablePaginator($$anchor, $$props) {
  $2.push($$props, true);
  $2.rest_props($$props, ["$$slots", "$$events", "$$legacy"]);
  const offset = $2.derived(
    () => $$props.offset == null || $$props.offset > $$props.total || $$props.offset < 0 ? 0 : $$props.offset
  );
  const limit = $2.derived(() => $$props.limit ?? $$props.total);
  const singular = $2.derived(() => $$props.singular ?? "row");
  const plural = $2.derived(() => $$props.plural ?? $2.get(singular) + "s");
  $2.user_effect(() => {
    if (($$props.offset ?? 0) > $$props.total || ($$props.offset ?? 0) < 0) {
      $$props.onChange(0);
    }
  });
  var fragment = root$7();
  var node = $2.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var fragment_1 = root_1$8();
      var button = $2.first_child(fragment_1);
      button.textContent = "\u2190";
      var button_1 = $2.sibling(button, 2);
      button_1.textContent = "\u2192";
      var text3 = $2.sibling(button_1);
      $2.template_effect(
        ($0) => {
          button.disabled = $2.get(offset) == 0;
          button_1.disabled = $2.get(offset) + $2.get(limit) >= $$props.total;
          $2.set_text(text3, `${$2.get(offset) + 1} to ${$0 ?? ""} of`);
        },
        [() => mathMin($$props.total, $2.get(offset) + $2.get(limit))]
      );
      $2.delegated(
        "click",
        button,
        () => $$props.onChange($2.get(offset) - $2.get(limit))
      );
      $2.delegated(
        "click",
        button_1,
        () => $$props.onChange($2.get(offset) + $2.get(limit))
      );
      $2.append($$anchor2, fragment_1);
    };
    $2.if(node, ($$render) => {
      if ($$props.total > $2.get(limit)) $$render(consequent);
    });
  }
  var text_1 = $2.sibling(node);
  $2.template_effect(
    () => $2.set_text(
      text_1,
      ` ${$$props.total ?? ""}
${($$props.total != 1 ? $2.get(plural) : $2.get(singular)) ?? ""}`
    )
  );
  $2.append($$anchor, fragment);
  $2.pop();
}
$2.delegate(["click"]);
var createSortingAndPagination = (getCellId, getDescending, getSortOnClick, getOffset, getLimit, getTotal, getPaginator, getOnChange) => {
  let currentCellId = $2.state($2.proxy(getCellId()));
  let currentDescending = $2.state($2.proxy(getDescending() ?? false));
  let currentOffset = $2.state($2.proxy(getOffset() ?? 0));
  const setState = (sortAndOffset) => {
    $2.set(currentCellId, sortAndOffset[0], true);
    $2.set(currentDescending, sortAndOffset[1], true);
    $2.set(currentOffset, sortAndOffset[2], true);
    getOnChange()?.(sortAndOffset);
  };
  const handleSort = getSortOnClick() ? (nextCellId) => setState([
    nextCellId,
    nextCellId == $2.get(currentCellId) ? !$2.get(currentDescending) : false,
    $2.get(currentOffset)
  ]) : void 0;
  const handleChangeOffset = (nextOffset) => setState([$2.get(currentCellId), $2.get(currentDescending), nextOffset]);
  const paginator = getPaginator();
  const PaginatorComponent = isTrue(paginator) ? SortedTablePaginator : paginator;
  return {
    get sortAndOffset() {
      return [
        $2.get(currentCellId),
        $2.get(currentDescending),
        $2.get(currentOffset)
      ];
    },
    get handleSort() {
      return handleSort;
    },
    get paginator() {
      return isFalse(paginator) ? void 0 : {
        component: PaginatorComponent,
        props: {
          offset: $2.get(currentOffset),
          limit: getLimit(),
          total: getTotal(),
          onChange: handleChangeOffset
        }
      };
    }
  };
};
function ResultSortedTableInHtmlTable($$anchor, $$props) {
  $2.push($$props, true);
  let paginator = $2.prop($$props, "paginator", 3, false), props = $2.rest_props($$props, [
    "$$slots",
    "$$events",
    "$$legacy",
    "queryId",
    "cellId",
    "descending",
    "offset",
    "limit",
    "queries",
    "sortOnClick",
    "paginator",
    "customCells",
    "extraCellsBefore",
    "extraCellsAfter",
    "onChange"
  ]);
  const defaultCellIds = getResultTableCellIds(
    () => $$props.queryId,
    () => $$props.queries
  );
  const rowCount = getResultRowCount(
    () => $$props.queryId,
    () => $$props.queries
  );
  const sorting = createSortingAndPagination(
    () => $$props.cellId,
    () => $$props.descending,
    () => $$props.sortOnClick,
    () => $$props.offset,
    () => $$props.limit,
    () => rowCount.current,
    () => paginator(),
    () => $$props.onChange
  );
  const rowIds = getResultSortedRowIds(
    () => $$props.queryId,
    () => sorting.sortAndOffset[0],
    () => sorting.sortAndOffset[1],
    () => sorting.sortAndOffset[2],
    () => $$props.limit,
    () => $$props.queries
  );
  const cells = $2.derived(
    () => getCells(defaultCellIds.current, $$props.customCells, ResultCellView)
  );
  const cellComponentProps = $2.derived(() => ({
    queries: $$props.queries,
    queryId: $$props.queryId
  }));
  HtmlTable(
    $$anchor,
    $2.spread_props(() => props, {
      get cells() {
        return $2.get(cells);
      },
      get cellComponentProps() {
        return $2.get(cellComponentProps);
      },
      get rowIds() {
        return rowIds;
      },
      get extraCellsBefore() {
        return $$props.extraCellsBefore;
      },
      get extraCellsAfter() {
        return $$props.extraCellsAfter;
      },
      get sortAndOffset() {
        return sorting.sortAndOffset;
      },
      get handleSort() {
        return sorting.handleSort;
      },
      get paginator() {
        return sorting.paginator;
      }
    })
  );
  $2.pop();
}
function SliceInHtmlTable($$anchor, $$props) {
  $2.push($$props, true);
  let props = $2.rest_props($$props, [
    "$$slots",
    "$$events",
    "$$legacy",
    "indexId",
    "sliceId",
    "indexes",
    "editable",
    "customCells",
    "extraCellsBefore",
    "extraCellsAfter"
  ]);
  const index2 = getIndexStoreTableId(
    () => $$props.indexes,
    () => $$props.indexId
  );
  const defaultCellIds = getTableCellIds(
    () => index2.tableId,
    () => index2.store
  );
  const rowIds = getSliceRowIds(
    () => $$props.indexId,
    () => $$props.sliceId,
    () => $$props.indexes
  );
  const defaultCellComponent = $2.derived(
    () => $$props.editable ? EditableCellView : CellView2
  );
  const cells = $2.derived(
    () => getCells(
      defaultCellIds.current,
      $$props.customCells,
      $2.get(defaultCellComponent)
    )
  );
  const cellComponentProps = $2.derived(() => ({
    store: index2.store,
    tableId: index2.tableId
  }));
  HtmlTable(
    $$anchor,
    $2.spread_props(() => props, {
      get cells() {
        return $2.get(cells);
      },
      get cellComponentProps() {
        return $2.get(cellComponentProps);
      },
      get rowIds() {
        return rowIds;
      },
      get extraCellsBefore() {
        return $$props.extraCellsBefore;
      },
      get extraCellsAfter() {
        return $$props.extraCellsAfter;
      }
    })
  );
  $2.pop();
}
function SortedTableInHtmlTable($$anchor, $$props) {
  $2.push($$props, true);
  let paginator = $2.prop($$props, "paginator", 3, false), props = $2.rest_props($$props, [
    "$$slots",
    "$$events",
    "$$legacy",
    "tableId",
    "cellId",
    "descending",
    "offset",
    "limit",
    "store",
    "editable",
    "sortOnClick",
    "paginator",
    "onChange",
    "customCells",
    "extraCellsBefore",
    "extraCellsAfter"
  ]);
  const defaultCellIds = getTableCellIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const rowCount = getRowCount(
    () => $$props.tableId,
    () => $$props.store
  );
  const sorting = createSortingAndPagination(
    () => $$props.cellId,
    () => $$props.descending,
    () => $$props.sortOnClick,
    () => $$props.offset,
    () => $$props.limit,
    () => rowCount.current,
    () => paginator(),
    () => $$props.onChange
  );
  const rowIds = getSortedRowIds(
    () => $$props.tableId,
    () => sorting.sortAndOffset[0],
    () => sorting.sortAndOffset[1],
    () => sorting.sortAndOffset[2],
    () => $$props.limit,
    () => $$props.store
  );
  const defaultCellComponent = $2.derived(
    () => $$props.editable ? EditableCellView : CellView2
  );
  const cells = $2.derived(
    () => getCells(
      defaultCellIds.current,
      $$props.customCells,
      $2.get(defaultCellComponent)
    )
  );
  const cellComponentProps = $2.derived(() => ({
    store: $$props.store,
    tableId: $$props.tableId
  }));
  HtmlTable(
    $$anchor,
    $2.spread_props(() => props, {
      get cells() {
        return $2.get(cells);
      },
      get cellComponentProps() {
        return $2.get(cellComponentProps);
      },
      get rowIds() {
        return rowIds;
      },
      get extraCellsBefore() {
        return $$props.extraCellsBefore;
      },
      get extraCellsAfter() {
        return $$props.extraCellsAfter;
      },
      get sortAndOffset() {
        return sorting.sortAndOffset;
      },
      get handleSort() {
        return sorting.handleSort;
      },
      get paginator() {
        return sorting.paginator;
      }
    })
  );
  $2.pop();
}
function ValueView($$anchor, $$props) {
  $2.push($$props, true);
  const value = getValue(
    () => $$props.valueId,
    () => $$props.store
  );
  const display = $2.derived(() => "" + (value.current ?? ""));
  const output = $2.derived(
    () => $$props.debugIds ? `${$$props.valueId}:{${$2.get(display)}}` : $2.get(display)
  );
  $2.next();
  var text3 = $2.text();
  $2.template_effect(() => $2.set_text(text3, $2.get(output)));
  $2.append($$anchor, text3);
  $2.pop();
}
var root_2$5 = $2.from_html(`<th> </th>`);
var root_3 = $2.from_html(`<th>Id</th>`);
var root_4$1 = $2.from_html(`<th> </th>`);
var root_1$7 = $2.from_html(`<thead><tr><!><!><th> </th><!></tr></thead>`);
var root_6 = $2.from_html(`<td><!></td>`);
var root_7 = $2.from_html(`<th> </th>`);
var root_8 = $2.from_html(`<td><!></td>`);
var root_5$2 = $2.from_html(`<tr><!><!><td><!></td><!></tr>`);
var root$6 = $2.from_html(`<table><!><tbody></tbody></table>`);
function ValuesInHtmlTable($$anchor, $$props) {
  $2.push($$props, true);
  let editable = $2.prop($$props, "editable", 3, false), extraCellsBefore = $2.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $2.prop($$props, "extraCellsAfter", 19, () => []);
  const valueIds = getValueIds(() => $$props.store);
  const ValueComponent = $2.derived(
    () => $$props.valueComponent ?? (editable() ? EditableValueView : ValueView)
  );
  const extraHeadersBefore = $2.derived(
    () => getExtraHeaders(extraCellsBefore())
  );
  const extraHeadersAfter = $2.derived(
    () => getExtraHeaders(extraCellsAfter(), 1)
  );
  var table = root$6();
  var node = $2.child(table);
  {
    var consequent_1 = ($$anchor2) => {
      var thead = root_1$7();
      var tr = $2.child(thead);
      var node_1 = $2.child(tr);
      $2.each(
        node_1,
        17,
        () => $2.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_2$5();
          var text3 = $2.child(th, true);
          $2.reset(th);
          $2.template_effect(() => {
            $2.set_class(th, 1, $2.clsx($2.get(extraHeader).className));
            $2.set_text(text3, $2.get(extraHeader).label);
          });
          $2.append($$anchor3, th);
        }
      );
      var node_2 = $2.sibling(node_1);
      {
        var consequent = ($$anchor3) => {
          var th_1 = root_3();
          $2.append($$anchor3, th_1);
        };
        $2.if(node_2, ($$render) => {
          if ($$props.idColumn !== false) $$render(consequent);
        });
      }
      var th_2 = $2.sibling(node_2);
      var text_1 = $2.child(th_2, true);
      $2.reset(th_2);
      var node_3 = $2.sibling(th_2);
      $2.each(
        node_3,
        17,
        () => $2.get(extraHeadersAfter),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th_3 = root_4$1();
          var text_2 = $2.child(th_3, true);
          $2.reset(th_3);
          $2.template_effect(() => {
            $2.set_class(th_3, 1, $2.clsx($2.get(extraHeader).className));
            $2.set_text(text_2, $2.get(extraHeader).label);
          });
          $2.append($$anchor3, th_3);
        }
      );
      $2.reset(tr);
      $2.reset(thead);
      $2.template_effect(() => $2.set_text(text_1, VALUE2));
      $2.append($$anchor2, thead);
    };
    $2.if(node, ($$render) => {
      if ($$props.headerRow !== false) $$render(consequent_1);
    });
  }
  var tbody = $2.sibling(node);
  $2.each(
    tbody,
    20,
    () => valueIds.current,
    (valueId) => valueId,
    ($$anchor2, valueId) => {
      const valueProps = $2.derived(() => ({ valueId, store: $$props.store }));
      var tr_1 = root_5$2();
      var node_4 = $2.child(tr_1);
      $2.each(
        node_4,
        19,
        extraCellsBefore,
        (extraCell, index2) => extraKey(index2, 0),
        ($$anchor3, extraCell) => {
          const ExtraCell = $2.derived(() => $2.get(extraCell).component);
          var td = root_6();
          var node_5 = $2.child(td);
          $2.component(
            node_5,
            () => $2.get(ExtraCell),
            ($$anchor4, ExtraCell_1) => {
              ExtraCell_1(
                $$anchor4,
                $2.spread_props(() => $2.get(valueProps))
              );
            }
          );
          $2.reset(td);
          $2.template_effect(() => $2.set_class(td, 1, $2.clsx(EXTRA)));
          $2.append($$anchor3, td);
        }
      );
      var node_6 = $2.sibling(node_4);
      {
        var consequent_2 = ($$anchor3) => {
          var th_4 = root_7();
          var text_3 = $2.child(th_4, true);
          $2.reset(th_4);
          $2.template_effect(() => {
            $2.set_attribute(th_4, "title", valueId);
            $2.set_text(text_3, valueId);
          });
          $2.append($$anchor3, th_4);
        };
        var d = $2.derived(() => !isFalse($$props.idColumn));
        $2.if(node_6, ($$render) => {
          if ($2.get(d)) $$render(consequent_2);
        });
      }
      var td_1 = $2.sibling(node_6);
      var node_7 = $2.child(td_1);
      {
        let $0 = $2.derived(
          () => getProps($$props.getValueComponentProps, valueId)
        );
        $2.component(
          node_7,
          () => $2.get(ValueComponent),
          ($$anchor3, ValueComponent_1) => {
            ValueComponent_1(
              $$anchor3,
              $2.spread_props(
                () => $2.get($0),
                () => $2.get(valueProps)
              )
            );
          }
        );
      }
      $2.reset(td_1);
      var node_8 = $2.sibling(td_1);
      $2.each(
        node_8,
        19,
        extraCellsAfter,
        (extraCell, index2) => extraKey(index2, 1),
        ($$anchor3, extraCell) => {
          const ExtraCell = $2.derived(() => $2.get(extraCell).component);
          var td_2 = root_8();
          var node_9 = $2.child(td_2);
          $2.component(
            node_9,
            () => $2.get(ExtraCell),
            ($$anchor4, ExtraCell_2) => {
              ExtraCell_2(
                $$anchor4,
                $2.spread_props(() => $2.get(valueProps))
              );
            }
          );
          $2.reset(td_2);
          $2.template_effect(() => $2.set_class(td_2, 1, $2.clsx(EXTRA)));
          $2.append($$anchor3, td_2);
        }
      );
      $2.reset(tr_1);
      $2.append($$anchor2, tr_1);
    }
  );
  $2.reset(tbody);
  $2.reset(table);
  $2.template_effect(() => $2.set_class(table, 1, $2.clsx($$props.className)));
  $2.append($$anchor, table);
  $2.pop();
}
var maybeGet2 = (value) => isFunction2(value) ? value() : value;
var getEditable = (uniqueId, s) => {
  const editable = getCell2(
    () => STATE_TABLE,
    () => maybeGet2(uniqueId),
    () => EDITABLE_CELL,
    () => maybeGet2(s)
  );
  const handleEditable = (event2) => {
    editable.current = !editable.current;
    event2?.preventDefault();
  };
  return [editable, handleEditable];
};
function SliceView($$anchor, $$props) {
  $2.push($$props, true);
  const uniqueId = $2.derived(
    () => getUniqueId("i", $$props.indexesId, $$props.indexId, $$props.sliceId)
  );
  const title = $2.derived(() => "Slice: " + $$props.sliceId);
  const [editable, handleEditable] = getEditable(
    () => $2.get(uniqueId),
    () => $$props.s
  );
  Details($$anchor, {
    get uniqueId() {
      return $2.get(uniqueId);
    },
    get title() {
      return $2.get(title);
    },
    get editable() {
      return editable.current;
    },
    get handleEditable() {
      return handleEditable;
    },
    get s() {
      return $$props.s;
    },
    children: ($$anchor2, $$slotProps) => {
      SliceInHtmlTable($$anchor2, {
        get indexId() {
          return $$props.indexId;
        },
        get sliceId() {
          return $$props.sliceId;
        },
        get indexes() {
          return $$props.indexes;
        },
        get editable() {
          return editable.current;
        }
      });
    },
    $$slots: { default: true }
  });
  $2.pop();
}
function IndexView($$anchor, $$props) {
  $2.push($$props, true);
  const sliceIds = getSliceIds(
    () => $$props.indexId,
    () => $$props.indexes
  );
  const title = $2.derived(() => "Index: " + $$props.indexId);
  {
    let $0 = $2.derived(
      () => getUniqueId("i", $$props.indexesId, $$props.indexId)
    );
    Details($$anchor, {
      get uniqueId() {
        return $2.get($0);
      },
      get title() {
        return $2.get(title);
      },
      get s() {
        return $$props.s;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = $2.comment();
        var node = $2.first_child(fragment_1);
        $2.each(
          node,
          16,
          () => sliceIds.current,
          (sliceId) => sliceId,
          ($$anchor3, sliceId) => {
            SliceView($$anchor3, {
              get indexes() {
                return $$props.indexes;
              },
              get indexesId() {
                return $$props.indexesId;
              },
              get indexId() {
                return $$props.indexId;
              },
              get sliceId() {
                return sliceId;
              },
              get s() {
                return $$props.s;
              }
            });
          }
        );
        $2.append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    });
  }
  $2.pop();
}
function IndexesView($$anchor, $$props) {
  $2.push($$props, true);
  const indexes = $2.derived(() => getIndexes($$props.indexesId));
  const indexIds = getIndexIds(() => $2.get(indexes));
  const sortedIndexIds = $2.derived(
    () => sortedIdsMap(indexIds.current, (indexId) => indexId)
  );
  const title = $2.derived(() => "Indexes: " + ($$props.indexesId ?? DEFAULT));
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $2.derived(() => getUniqueId("i", $$props.indexesId));
        Details($$anchor2, {
          get uniqueId() {
            return $2.get($0);
          },
          get title() {
            return $2.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $2.comment();
            var node_1 = $2.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text3 = $2.text("No indexes defined");
                $2.append($$anchor4, text3);
              };
              var d = $2.derived(() => arrayIsEmpty(indexIds.current));
              var alternate = ($$anchor4) => {
                var fragment_3 = $2.comment();
                var node_2 = $2.first_child(fragment_3);
                $2.each(
                  node_2,
                  16,
                  () => $2.get(sortedIndexIds),
                  (indexId) => indexId,
                  ($$anchor5, indexId) => {
                    IndexView($$anchor5, {
                      get indexes() {
                        return $2.get(indexes);
                      },
                      get indexesId() {
                        return $$props.indexesId;
                      },
                      get indexId() {
                        return indexId;
                      },
                      get s() {
                        return $$props.s;
                      }
                    });
                  }
                );
                $2.append($$anchor4, fragment_3);
              };
              $2.if(node_1, ($$render) => {
                if ($2.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $2.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $2.derived(() => !isUndefined2($2.get(indexes)));
    $2.if(node, ($$render) => {
      if ($2.get(d_1)) $$render(consequent_1);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
function MetricView($$anchor, $$props) {
  $2.push($$props, true);
  const metric = getMetric(
    () => $$props.metricId,
    () => $$props.metrics
  );
  const display = $2.derived(() => "" + (metric.current ?? ""));
  const output = $2.derived(
    () => $$props.debugIds ? `${$$props.metricId}:{${$2.get(display)}}` : $2.get(display)
  );
  $2.next();
  var text3 = $2.text();
  $2.template_effect(() => $2.set_text(text3, $2.get(output)));
  $2.append($$anchor, text3);
  $2.pop();
}
var root_5$1 = $2.from_html(`<tr><th> </th><td> </td><td><!></td></tr>`);
var root_4 = $2.from_html(
  `<table><thead><tr><th>Metric Id</th><th>Table Id</th><th>Metric</th></tr></thead><tbody></tbody></table>`
);
function MetricsView($$anchor, $$props) {
  $2.push($$props, true);
  const metrics = $2.derived(() => getMetrics($$props.metricsId));
  const metricIds = getMetricIds(() => $2.get(metrics));
  const title = $2.derived(() => "Metrics: " + ($$props.metricsId ?? DEFAULT));
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $2.derived(() => getUniqueId("m", $$props.metricsId));
        Details($$anchor2, {
          get uniqueId() {
            return $2.get($0);
          },
          get title() {
            return $2.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $2.comment();
            var node_1 = $2.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text3 = $2.text("No metrics defined");
                $2.append($$anchor4, text3);
              };
              var d = $2.derived(() => arrayIsEmpty(metricIds.current));
              var alternate = ($$anchor4) => {
                var table = root_4();
                var tbody = $2.sibling($2.child(table));
                $2.each(
                  tbody,
                  20,
                  () => metricIds.current,
                  (metricId) => metricId,
                  ($$anchor5, metricId) => {
                    var tr = root_5$1();
                    var th = $2.child(tr);
                    var text_1 = $2.child(th, true);
                    $2.reset(th);
                    var td = $2.sibling(th);
                    var text_2 = $2.child(td, true);
                    $2.reset(td);
                    var td_1 = $2.sibling(td);
                    var node_2 = $2.child(td_1);
                    MetricView(node_2, {
                      get metricId() {
                        return metricId;
                      },
                      get metrics() {
                        return $2.get(metrics);
                      }
                    });
                    $2.reset(td_1);
                    $2.reset(tr);
                    $2.template_effect(
                      ($02) => {
                        $2.set_attribute(th, "title", metricId);
                        $2.set_text(text_1, metricId);
                        $2.set_text(text_2, $02);
                      },
                      [() => $2.get(metrics)?.getTableId(metricId)]
                    );
                    $2.append($$anchor5, tr);
                  }
                );
                $2.reset(tbody);
                $2.reset(table);
                $2.append($$anchor4, table);
              };
              $2.if(node_1, ($$render) => {
                if ($2.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $2.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $2.derived(() => !isUndefined2($2.get(metrics)));
    $2.if(node, ($$render) => {
      if ($2.get(d_1)) $$render(consequent_1);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
function QueryView($$anchor, $$props) {
  $2.push($$props, true);
  const uniqueId = $2.derived(
    () => getUniqueId("q", $$props.queriesId, $$props.queryId)
  );
  const sort = getCell2(
    () => STATE_TABLE,
    () => $2.get(uniqueId),
    () => SORT_CELL,
    () => $$props.s
  );
  const sortAndOffset = $2.derived(() => jsonParse(sort.current ?? "[]"));
  const title = $2.derived(() => "Query: " + $$props.queryId);
  const handleChange = (sortAndOffset2) => {
    sort.current = jsonStringWithMap(sortAndOffset2);
  };
  Details($$anchor, {
    get uniqueId() {
      return $2.get(uniqueId);
    },
    get title() {
      return $2.get(title);
    },
    get s() {
      return $$props.s;
    },
    children: ($$anchor2, $$slotProps) => {
      ResultSortedTableInHtmlTable($$anchor2, {
        get queryId() {
          return $$props.queryId;
        },
        get queries() {
          return $$props.queries;
        },
        get cellId() {
          return $2.get(sortAndOffset)[0];
        },
        get descending() {
          return $2.get(sortAndOffset)[1];
        },
        get offset() {
          return $2.get(sortAndOffset)[2];
        },
        limit: 10,
        paginator: true,
        sortOnClick: true,
        onChange: handleChange
      });
    },
    $$slots: { default: true }
  });
  $2.pop();
}
function QueriesView($$anchor, $$props) {
  $2.push($$props, true);
  const queries = $2.derived(() => getQueries($$props.queriesId));
  const queryIds = getQueryIds(() => $2.get(queries));
  const sortedQueryIds = $2.derived(
    () => sortedIdsMap(queryIds.current, (queryId) => queryId)
  );
  const title = $2.derived(() => "Queries: " + ($$props.queriesId ?? DEFAULT));
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $2.derived(() => getUniqueId("q", $$props.queriesId));
        Details($$anchor2, {
          get uniqueId() {
            return $2.get($0);
          },
          get title() {
            return $2.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $2.comment();
            var node_1 = $2.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text3 = $2.text("No queries defined");
                $2.append($$anchor4, text3);
              };
              var d = $2.derived(() => arrayIsEmpty(queryIds.current));
              var alternate = ($$anchor4) => {
                var fragment_3 = $2.comment();
                var node_2 = $2.first_child(fragment_3);
                $2.each(
                  node_2,
                  16,
                  () => $2.get(sortedQueryIds),
                  (queryId) => queryId,
                  ($$anchor5, queryId) => {
                    QueryView($$anchor5, {
                      get queries() {
                        return $2.get(queries);
                      },
                      get queriesId() {
                        return $$props.queriesId;
                      },
                      get queryId() {
                        return queryId;
                      },
                      get s() {
                        return $$props.s;
                      }
                    });
                  }
                );
                $2.append($$anchor4, fragment_3);
              };
              $2.if(node_1, ($$render) => {
                if ($2.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $2.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $2.derived(() => !isUndefined2($2.get(queries)));
    $2.if(node, ($$render) => {
      if ($2.get(d_1)) $$render(consequent_1);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
function RelationshipView($$anchor, $$props) {
  $2.push($$props, true);
  const uniqueId = $2.derived(
    () => getUniqueId("r", $$props.relationshipsId, $$props.relationshipId)
  );
  const title = $2.derived(() => "Relationship: " + $$props.relationshipId);
  const [editable, handleEditable] = getEditable(
    () => $2.get(uniqueId),
    () => $$props.s
  );
  Details($$anchor, {
    get uniqueId() {
      return $2.get(uniqueId);
    },
    get title() {
      return $2.get(title);
    },
    get editable() {
      return editable.current;
    },
    get handleEditable() {
      return handleEditable;
    },
    get s() {
      return $$props.s;
    },
    children: ($$anchor2, $$slotProps) => {
      RelationshipInHtmlTable($$anchor2, {
        get relationshipId() {
          return $$props.relationshipId;
        },
        get relationships() {
          return $$props.relationships;
        },
        get editable() {
          return editable.current;
        }
      });
    },
    $$slots: { default: true }
  });
  $2.pop();
}
function RelationshipsView($$anchor, $$props) {
  $2.push($$props, true);
  const relationships = $2.derived(
    () => getRelationships($$props.relationshipsId)
  );
  const relationshipIds = getRelationshipIds(() => $2.get(relationships));
  const sortedRelationshipIds = $2.derived(
    () => sortedIdsMap(relationshipIds.current, (relationshipId) => relationshipId)
  );
  const title = $2.derived(
    () => "Relationships: " + ($$props.relationshipsId ?? DEFAULT)
  );
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $2.derived(() => getUniqueId("r", $$props.relationshipsId));
        Details($$anchor2, {
          get uniqueId() {
            return $2.get($0);
          },
          get title() {
            return $2.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $2.comment();
            var node_1 = $2.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text3 = $2.text("No relationships defined");
                $2.append($$anchor4, text3);
              };
              var d = $2.derived(() => arrayIsEmpty(relationshipIds.current));
              var alternate = ($$anchor4) => {
                var fragment_3 = $2.comment();
                var node_2 = $2.first_child(fragment_3);
                $2.each(
                  node_2,
                  16,
                  () => $2.get(sortedRelationshipIds),
                  (relationshipId) => relationshipId,
                  ($$anchor5, relationshipId) => {
                    RelationshipView($$anchor5, {
                      get relationships() {
                        return $2.get(relationships);
                      },
                      get relationshipsId() {
                        return $$props.relationshipsId;
                      },
                      get relationshipId() {
                        return relationshipId;
                      },
                      get s() {
                        return $$props.s;
                      }
                    });
                  }
                );
                $2.append($$anchor4, fragment_3);
              };
              $2.if(node_1, ($$render) => {
                if ($2.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $2.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $2.derived(() => !isUndefined2($2.get(relationships)));
    $2.if(node, ($$render) => {
      if ($2.get(d_1)) $$render(consequent_1);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
var root$5 = $2.from_html(
  `<div class="actions"><div><!></div> <div><!></div></div>`
);
function Actions($$anchor, $$props) {
  var div = root$5();
  var div_1 = $2.child(div);
  var node = $2.child(div_1);
  $2.snippet(node, () => $$props.left ?? $2.noop);
  $2.reset(div_1);
  var div_2 = $2.sibling(div_1, 2);
  var node_1 = $2.child(div_2);
  $2.snippet(node_1, () => $$props.right ?? $2.noop);
  $2.reset(div_2);
  $2.reset(div);
  $2.append($$anchor, div);
}
var root$4 = $2.from_html(` <img title="Confirm" class="ok" alt=""/>`, 1);
function Delete($$anchor, $$props) {
  $2.push($$props, true);
  let prompt = $2.prop($$props, "prompt", 3, "Delete");
  const handleClick = () => {
    $$props.onClick();
    $$props.onDone();
  };
  const handleKeyDown = (event2) => {
    if (event2.key == "Enter") {
      event2.preventDefault();
      handleClick();
    }
  };
  $2.user_effect(() => {
    if (hasWindow2()) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  });
  $2.next();
  var fragment = root$4();
  var text3 = $2.first_child(fragment);
  var img2 = $2.sibling(text3);
  $2.template_effect(() => $2.set_text(text3, `${prompt() ?? ""}?  `));
  $2.delegated("click", img2, handleClick);
  $2.append($$anchor, fragment);
  $2.pop();
}
$2.delegate(["click"]);
var root$3 = $2.from_html(` <input type="text"/>  <img alt=""/>`, 1);
function NewId($$anchor, $$props) {
  $2.push($$props, true);
  let prompt = $2.prop($$props, "prompt", 3, "New Id");
  let input = $2.state(void 0);
  const currentSuggestedId = $2.derived(() => $$props.suggestedId);
  let newId = $2.state("");
  let newIdOk = $2.state(true);
  let previousSuggestedId = $2.state(void 0);
  $2.user_effect(() => {
    if ($2.get(input)) {
      $2.get(input).focus();
    }
  });
  $2.user_effect(() => {
    if ($2.get(currentSuggestedId) != $2.get(previousSuggestedId)) {
      $2.set(newId, $2.get(currentSuggestedId), true);
      $2.set(newIdOk, true);
      $2.set(previousSuggestedId, $2.get(currentSuggestedId), true);
    }
  });
  const handleNewIdChange = (event2) => {
    $2.set(newId, event2.currentTarget.value, true);
    $2.set(newIdOk, !$$props.has($2.get(newId)));
  };
  const handleClick = () => {
    if ($$props.has($2.get(newId))) {
      $2.set(newIdOk, false);
    } else {
      $$props.set($2.get(newId));
      $$props.onDone();
    }
  };
  const handleKeyDown = (event2) => {
    if (event2.key == "Enter") {
      event2.preventDefault();
      handleClick();
    }
  };
  $2.next();
  var fragment = root$3();
  var text3 = $2.first_child(fragment);
  var input_1 = $2.sibling(text3);
  $2.remove_input_defaults(input_1);
  $2.bind_this(
    input_1,
    ($$value) => $2.set(input, $$value),
    () => $2.get(input)
  );
  var img2 = $2.sibling(input_1, 2);
  $2.template_effect(() => {
    $2.set_text(text3, `${prompt() + ": "} `);
    $2.set_value(input_1, $2.get(newId));
    $2.set_attribute(
      img2,
      "title",
      $2.get(newIdOk) ? "Confirm" : "Id already exists"
    );
    $2.set_class(img2, 1, $2.clsx($2.get(newIdOk) ? "ok" : "okDis"));
  });
  $2.delegated("input", input_1, handleNewIdChange);
  $2.delegated("keydown", input_1, handleKeyDown);
  $2.delegated("click", img2, handleClick);
  $2.append($$anchor, fragment);
  $2.pop();
}
$2.delegate(["input", "keydown", "click"]);
var isNewIdAction = (action) => "set" in action;
var root_1$6 = $2.from_html(
  `<!>  <img title="Cancel" class="cancel" alt=""/>`,
  1
);
var root_5 = $2.from_html(`<img alt=""/>`);
function ConfirmableActions($$anchor, $$props) {
  $2.push($$props, true);
  let confirming = $2.state(void 0);
  const handleDone = () => {
    $2.set(confirming, void 0);
  };
  const handleKeyDown = (event2) => {
    if (!isUndefined2($2.get(confirming)) && event2.key == "Escape") {
      event2.preventDefault();
      handleDone();
    }
  };
  $2.user_effect(() => {
    if (!isUndefined2($2.get(confirming)) && hasWindow2()) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  });
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      const action = $2.derived(() => $$props.actions[$2.get(confirming)]);
      var fragment_1 = root_1$6();
      var node_1 = $2.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          NewId($$anchor3, {
            onDone: handleDone,
            get suggestedId() {
              return $2.get(action).suggestedId;
            },
            get has() {
              return $2.get(action).has;
            },
            get set() {
              return $2.get(action).set;
            },
            get prompt() {
              return $2.get(action).prompt;
            }
          });
        };
        var d = $2.derived(() => isNewIdAction($2.get(action)));
        var alternate = ($$anchor3) => {
          Delete($$anchor3, {
            onDone: handleDone,
            get onClick() {
              return $2.get(action).onClick;
            },
            get prompt() {
              return $2.get(action).prompt;
            }
          });
        };
        $2.if(node_1, ($$render) => {
          if ($2.get(d)) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      var img2 = $2.sibling(node_1, 2);
      $2.delegated("click", img2, handleDone);
      $2.append($$anchor2, fragment_1);
    };
    var d_1 = $2.derived(() => !isUndefined2($2.get(confirming)));
    var alternate_1 = ($$anchor2) => {
      var fragment_4 = $2.comment();
      var node_2 = $2.first_child(fragment_4);
      $2.each(
        node_2,
        17,
        () => $$props.actions,
        $2.index,
        ($$anchor3, action, index2) => {
          var img_1 = root_5();
          $2.template_effect(() => {
            $2.set_attribute(img_1, "title", $2.get(action).title);
            $2.set_class(img_1, 1, $2.clsx($2.get(action).icon));
          });
          $2.delegated("click", img_1, () => $2.set(confirming, index2, true));
          $2.append($$anchor3, img_1);
        }
      );
      $2.append($$anchor2, fragment_4);
    };
    $2.if(node, ($$render) => {
      if ($2.get(d_1)) $$render(consequent_1);
      else $$render(alternate_1, -1);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
$2.delegate(["click"]);
function TablesActions($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const tableIds = getTableIds(() => $$props.store);
  const has = (tableId) => getStore2()?.hasTable(tableId) ?? false;
  const addActions = $2.derived(() => [
    {
      icon: "add",
      title: "Add table",
      prompt: "Add table",
      suggestedId: getNewIdFromSuggestedId(
        "table",
        (tableId) => arrayHas(tableIds.current, tableId)
      ),
      has,
      set: (newId) => getStore2()?.setTable(newId, { row: { cell: "" } })
    }
  ]);
  const rightActions = $2.derived(
    () => tableIds.current.length > 0 ? [
      {
        icon: "delete",
        title: "Delete all tables",
        prompt: "Delete all tables",
        onClick: () => getStore2()?.delTables()
      }
    ] : []
  );
  {
    const left = ($$anchor2) => {
      ConfirmableActions($$anchor2, {
        get actions() {
          return $2.get(addActions);
        }
      });
    };
    const right = ($$anchor2) => {
      var fragment_2 = $2.comment();
      var node = $2.first_child(fragment_2);
      {
        var consequent = ($$anchor3) => {
          ConfirmableActions($$anchor3, {
            get actions() {
              return $2.get(rightActions);
            }
          });
        };
        $2.if(node, ($$render) => {
          if ($2.get(rightActions).length > 0) $$render(consequent);
        });
      }
      $2.append($$anchor2, fragment_2);
    };
    Actions($$anchor, { left, right });
  }
  $2.pop();
}
function RowActions($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const cellIds = getCellIds(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.store
  );
  const rowIds = getRowIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const hasCell2 = (cellId) => getStore2()?.hasCell($$props.tableId, $$props.rowId, cellId) ?? false;
  const hasRow = (nextRowId) => getStore2()?.hasRow($$props.tableId, nextRowId) ?? false;
  const actions = $2.derived(() => [
    {
      icon: "add",
      title: "Add cell",
      prompt: "Add cell",
      suggestedId: getNewIdFromSuggestedId(
        "cell",
        (cellId) => arrayHas(cellIds.current, cellId)
      ),
      has: hasCell2,
      set: (newId) => getStore2()?.setCell($$props.tableId, $$props.rowId, newId, "")
    },
    {
      icon: "clone",
      title: "Clone row",
      prompt: "Clone row to",
      suggestedId: getNewIdFromSuggestedId(
        $$props.rowId,
        (nextRowId) => arrayHas(rowIds.current, nextRowId)
      ),
      has: hasRow,
      set: (newId) => getStore2()?.setRow(
        $$props.tableId,
        newId,
        getStore2()?.getRow($$props.tableId, $$props.rowId)
      )
    },
    {
      icon: "delete",
      title: "Delete row",
      prompt: "Delete row",
      onClick: () => getStore2()?.delRow($$props.tableId, $$props.rowId)
    }
  ]);
  ConfirmableActions($$anchor, {
    get actions() {
      return $2.get(actions);
    }
  });
  $2.pop();
}
function TableActions1($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const rowIds = getRowIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const has = (rowId) => getStore2()?.hasRow($$props.tableId, rowId) ?? false;
  const actions = $2.derived(() => [
    {
      icon: "add",
      title: "Add row",
      prompt: "Add row",
      suggestedId: getNewIdFromSuggestedId(
        "row",
        (rowId) => arrayHas(rowIds.current, rowId)
      ),
      has,
      set: (newId) => getStore2()?.setRow(
        $$props.tableId,
        newId,
        objNew(
          arrayMap(
            getStore2()?.getTableCellIds($$props.tableId) ?? [],
            (cellId) => [cellId, ""]
          )
        )
      )
    }
  ]);
  ConfirmableActions($$anchor, {
    get actions() {
      return $2.get(actions);
    }
  });
  $2.pop();
}
function TableActions2($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const tableIds = getTableIds(() => $$props.store);
  const has = (nextTableId) => getStore2()?.hasTable(nextTableId) ?? false;
  const actions = $2.derived(() => [
    {
      icon: "clone",
      title: "Clone table",
      prompt: "Clone table to",
      suggestedId: getNewIdFromSuggestedId(
        $$props.tableId,
        (nextTableId) => arrayHas(tableIds.current, nextTableId)
      ),
      has,
      set: (newId) => getStore2()?.setTable(newId, getStore2()?.getTable($$props.tableId))
    },
    {
      icon: "delete",
      title: "Delete table",
      prompt: "Delete table",
      onClick: () => getStore2()?.delTable($$props.tableId)
    }
  ]);
  ConfirmableActions($$anchor, {
    get actions() {
      return $2.get(actions);
    }
  });
  $2.pop();
}
function CellActions($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const actions = [
    {
      icon: "delete",
      title: "Delete cell",
      prompt: "Delete cell",
      onClick: () => getStore2()?.delCell(
        $$props.tableId,
        $$props.rowId,
        $$props.cellId,
        true
      )
    }
  ];
  ConfirmableActions($$anchor, {
    get actions() {
      return actions;
    }
  });
  $2.pop();
}
var root$2 = $2.from_html(`<!> <!>`, 1);
function EditableCellViewWithActions($$anchor, $$props) {
  $2.push($$props, true);
  const cellExists = hasCell(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.store
  );
  var fragment = root$2();
  var node = $2.first_child(fragment);
  EditableCellView(node, {
    get tableId() {
      return $$props.tableId;
    },
    get rowId() {
      return $$props.rowId;
    },
    get cellId() {
      return $$props.cellId;
    },
    get store() {
      return $$props.store;
    }
  });
  var node_1 = $2.sibling(node, 2);
  {
    var consequent = ($$anchor2) => {
      CellActions($$anchor2, {
        get tableId() {
          return $$props.tableId;
        },
        get rowId() {
          return $$props.rowId;
        },
        get cellId() {
          return $$props.cellId;
        },
        get store() {
          return $$props.store;
        }
      });
    };
    $2.if(node_1, ($$render) => {
      if (cellExists.current) $$render(consequent);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
var root_1$5 = $2.from_html(`<!> <!>`, 1);
function TableView($$anchor, $$props) {
  $2.push($$props, true);
  const uniqueId = $2.derived(
    () => getUniqueId("t", $$props.storeId, $$props.tableId)
  );
  const tableCellIds = getTableCellIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const sort = getCell2(
    () => STATE_TABLE,
    () => $2.get(uniqueId),
    () => SORT_CELL,
    () => $$props.s
  );
  const [editable, handleEditable] = getEditable(
    () => $2.get(uniqueId),
    () => $$props.s
  );
  const sortAndOffset = $2.derived(() => jsonParse(sort.current ?? "[]"));
  const title = $2.derived(() => "Table: " + $$props.tableId);
  const CellComponent = $2.derived(
    () => editable.current ? EditableCellViewWithActions : CellView
  );
  const customCells = $2.derived(
    () => objNew(
      arrayMap(tableCellIds.current, (cellId) => [
        cellId,
        { label: cellId, component: $2.get(CellComponent) }
      ])
    )
  );
  const rowActions = [{ label: "", component: RowActions }];
  const handleChange = (sortAndOffset2) => {
    sort.current = jsonStringWithMap(sortAndOffset2);
  };
  Details($$anchor, {
    get uniqueId() {
      return $2.get(uniqueId);
    },
    get title() {
      return $2.get(title);
    },
    get editable() {
      return editable.current;
    },
    get handleEditable() {
      return handleEditable;
    },
    get s() {
      return $$props.s;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$5();
      var node = $2.first_child(fragment_1);
      {
        let $0 = $2.derived(() => editable.current ? rowActions : []);
        SortedTableInHtmlTable(node, {
          get tableId() {
            return $$props.tableId;
          },
          get store() {
            return $$props.store;
          },
          get cellId() {
            return $2.get(sortAndOffset)[0];
          },
          get descending() {
            return $2.get(sortAndOffset)[1];
          },
          get offset() {
            return $2.get(sortAndOffset)[2];
          },
          limit: 10,
          paginator: true,
          sortOnClick: true,
          onChange: handleChange,
          get editable() {
            return editable.current;
          },
          get extraCellsAfter() {
            return $2.get($0);
          },
          get customCells() {
            return $2.get(customCells);
          }
        });
      }
      var node_1 = $2.sibling(node, 2);
      {
        var consequent = ($$anchor3) => {
          {
            const left = ($$anchor4) => {
              TableActions1($$anchor4, {
                get tableId() {
                  return $$props.tableId;
                },
                get store() {
                  return $$props.store;
                }
              });
            };
            const right = ($$anchor4) => {
              TableActions2($$anchor4, {
                get tableId() {
                  return $$props.tableId;
                },
                get store() {
                  return $$props.store;
                }
              });
            };
            Actions($$anchor3, { left, right });
          }
        };
        $2.if(node_1, ($$render) => {
          if (editable.current) $$render(consequent);
        });
      }
      $2.append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  $2.pop();
}
var root_2$4 = $2.from_html(`<p>No tables.</p>`);
var root_1$4 = $2.from_html(`<!> <!>`, 1);
function TablesView($$anchor, $$props) {
  $2.push($$props, true);
  const uniqueId = $2.derived(() => getUniqueId("ts", $$props.storeId));
  const tableIds = getTableIds(() => $$props.store);
  const [editable, handleEditable] = getEditable(
    () => $2.get(uniqueId),
    () => $$props.s
  );
  const sortedTableIds = $2.derived(
    () => sortedIdsMap(tableIds.current, (tableId) => tableId)
  );
  Details($$anchor, {
    get uniqueId() {
      return $2.get(uniqueId);
    },
    get title() {
      return TABLES2;
    },
    get editable() {
      return editable.current;
    },
    get handleEditable() {
      return handleEditable;
    },
    get s() {
      return $$props.s;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$4();
      var node = $2.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          var p = root_2$4();
          $2.append($$anchor3, p);
        };
        var d = $2.derived(() => arrayIsEmpty(tableIds.current));
        var alternate = ($$anchor3) => {
          var fragment_2 = $2.comment();
          var node_1 = $2.first_child(fragment_2);
          $2.each(
            node_1,
            16,
            () => $2.get(sortedTableIds),
            (tableId) => tableId,
            ($$anchor4, tableId) => {
              TableView($$anchor4, {
                get store() {
                  return $$props.store;
                },
                get storeId() {
                  return $$props.storeId;
                },
                get tableId() {
                  return tableId;
                },
                get s() {
                  return $$props.s;
                }
              });
            }
          );
          $2.append($$anchor3, fragment_2);
        };
        $2.if(node, ($$render) => {
          if ($2.get(d)) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      var node_2 = $2.sibling(node, 2);
      {
        var consequent_1 = ($$anchor3) => {
          TablesActions($$anchor3, {
            get store() {
              return $$props.store;
            }
          });
        };
        $2.if(node_2, ($$render) => {
          if (editable.current) $$render(consequent_1);
        });
      }
      $2.append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  $2.pop();
}
function ValueActions($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const valueIds = getValueIds(() => $$props.store);
  const has = (nextValueId) => getStore2()?.hasValue(nextValueId) ?? false;
  const actions = $2.derived(() => [
    {
      icon: "clone",
      title: "Clone value",
      prompt: "Clone value to",
      suggestedId: getNewIdFromSuggestedId(
        $$props.valueId,
        (nextValueId) => arrayHas(valueIds.current, nextValueId)
      ),
      has,
      set: (newId) => getStore2()?.setValue(
        newId,
        getStore2()?.getValue($$props.valueId) ?? ""
      )
    },
    {
      icon: "delete",
      title: "Delete value",
      prompt: "Delete value",
      onClick: () => getStore2()?.delValue($$props.valueId)
    }
  ]);
  ConfirmableActions($$anchor, {
    get actions() {
      return $2.get(actions);
    }
  });
  $2.pop();
}
function ValuesActions($$anchor, $$props) {
  $2.push($$props, true);
  const getStore2 = resolveStore2(() => $$props.store);
  const valueIds = getValueIds(() => $$props.store);
  const has = (valueId) => getStore2()?.hasValue(valueId) ?? false;
  const addActions = $2.derived(() => [
    {
      icon: "add",
      title: "Add value",
      prompt: "Add value",
      suggestedId: getNewIdFromSuggestedId(
        "value",
        (valueId) => arrayHas(valueIds.current, valueId)
      ),
      has,
      set: (newId) => getStore2()?.setValue(newId, "")
    }
  ]);
  const rightActions = $2.derived(
    () => valueIds.current.length > 0 ? [
      {
        icon: "delete",
        title: "Delete all values",
        prompt: "Delete all values",
        onClick: () => getStore2()?.delValues()
      }
    ] : []
  );
  {
    const left = ($$anchor2) => {
      ConfirmableActions($$anchor2, {
        get actions() {
          return $2.get(addActions);
        }
      });
    };
    const right = ($$anchor2) => {
      var fragment_2 = $2.comment();
      var node = $2.first_child(fragment_2);
      {
        var consequent = ($$anchor3) => {
          ConfirmableActions($$anchor3, {
            get actions() {
              return $2.get(rightActions);
            }
          });
        };
        $2.if(node, ($$render) => {
          if ($2.get(rightActions).length > 0) $$render(consequent);
        });
      }
      $2.append($$anchor2, fragment_2);
    };
    Actions($$anchor, { left, right });
  }
  $2.pop();
}
var root_2$3 = $2.from_html(`<p>No values.</p>`);
var root_1$3 = $2.from_html(`<!> <!>`, 1);
function ValuesView($$anchor, $$props) {
  $2.push($$props, true);
  const uniqueId = $2.derived(() => getUniqueId("v", $$props.storeId));
  const valueIds = getValueIds(() => $$props.store);
  const [editable, handleEditable] = getEditable(
    () => $2.get(uniqueId),
    () => $$props.s
  );
  const valueActions = [{ label: "", component: ValueActions }];
  Details($$anchor, {
    get uniqueId() {
      return $2.get(uniqueId);
    },
    get title() {
      return VALUES2;
    },
    get editable() {
      return editable.current;
    },
    get handleEditable() {
      return handleEditable;
    },
    get s() {
      return $$props.s;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$3();
      var node = $2.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          var p = root_2$3();
          $2.append($$anchor3, p);
        };
        var d = $2.derived(() => arrayIsEmpty(valueIds.current));
        var alternate = ($$anchor3) => {
          {
            let $0 = $2.derived(() => editable.current ? valueActions : []);
            ValuesInHtmlTable($$anchor3, {
              get store() {
                return $$props.store;
              },
              get editable() {
                return editable.current;
              },
              get extraCellsAfter() {
                return $2.get($0);
              }
            });
          }
        };
        $2.if(node, ($$render) => {
          if ($2.get(d)) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      var node_1 = $2.sibling(node, 2);
      {
        var consequent_1 = ($$anchor3) => {
          ValuesActions($$anchor3, {
            get store() {
              return $$props.store;
            }
          });
        };
        $2.if(node_1, ($$render) => {
          if (editable.current) $$render(consequent_1);
        });
      }
      $2.append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  $2.pop();
}
var root_2$2 = $2.from_html(`<!> <!>`, 1);
function StoreView($$anchor, $$props) {
  $2.push($$props, true);
  const store = $2.derived(() => getStore($$props.storeId));
  const title = $2.derived(
    () => ($2.get(store)?.isMergeable() ? "Mergeable" : "") + "Store: " + ($$props.storeId ?? DEFAULT)
  );
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      {
        let $0 = $2.derived(() => getUniqueId("s", $$props.storeId));
        Details($$anchor2, {
          get uniqueId() {
            return $2.get($0);
          },
          get title() {
            return $2.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = root_2$2();
            var node_1 = $2.first_child(fragment_2);
            ValuesView(node_1, {
              get store() {
                return $2.get(store);
              },
              get storeId() {
                return $$props.storeId;
              },
              get s() {
                return $$props.s;
              }
            });
            var node_2 = $2.sibling(node_1, 2);
            TablesView(node_2, {
              get store() {
                return $2.get(store);
              },
              get storeId() {
                return $$props.storeId;
              },
              get s() {
                return $$props.s;
              }
            });
            $2.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d = $2.derived(() => !isUndefined2($2.get(store)));
    $2.if(node, ($$render) => {
      if ($2.get(d)) $$render(consequent);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
var root_1$2 = $2.from_html(`<span class="warn"> </span>`);
var root_2$1 = $2.from_html(
  `<article><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></article>`
);
function Body($$anchor, $$props) {
  $2.push($$props, true);
  const store = getStore();
  const storeIds = getStoreIds();
  const metrics = getMetrics();
  const metricsIds = getMetricsIds();
  const indexes = getIndexes();
  const indexesIds = getIndexesIds();
  const relationships = getRelationships();
  const relationshipsIds = getRelationshipsIds();
  const queries = getQueries();
  const queriesIds = getQueriesIds();
  const values = getValues(() => $$props.s);
  let article = $2.state(void 0);
  let scrolled = $2.state(false);
  let idleCallback = 0;
  $2.user_effect(() => {
    const articleElement = $2.get(article);
    const { scrollLeft = 0, scrollTop = 0 } = values.current;
    if (articleElement && !$2.get(scrolled)) {
      const observer = new MutationObserver(() => {
        if (articleElement.scrollWidth >= mathFloor(Number(scrollLeft)) + articleElement.clientWidth && articleElement.scrollHeight >= mathFloor(Number(scrollTop)) + articleElement.clientHeight) {
          articleElement.scrollTo(Number(scrollLeft), Number(scrollTop));
        }
      });
      observer.observe(articleElement, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  });
  onDestroy(() => cancelInspectorIdleCallback(idleCallback));
  const handleScroll = (event2) => {
    const { scrollLeft, scrollTop } = event2.currentTarget;
    cancelInspectorIdleCallback(idleCallback);
    idleCallback = requestInspectorIdleCallback(() => {
      $2.set(scrolled, true);
      $$props.s.setPartialValues({ scrollLeft, scrollTop });
    });
  };
  const noProvidedObjects = $2.derived(
    () => isUndefined2(store) && arrayIsEmpty(storeIds.current) && isUndefined2(metrics) && arrayIsEmpty(metricsIds.current) && isUndefined2(indexes) && arrayIsEmpty(indexesIds.current) && isUndefined2(relationships) && arrayIsEmpty(relationshipsIds.current) && isUndefined2(queries) && arrayIsEmpty(queriesIds.current)
  );
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var span = root_1$2();
      var text3 = $2.child(span, true);
      $2.reset(span);
      $2.template_effect(() => $2.set_text(text3, NO_PROVIDED_OBJECTS_MESSAGE));
      $2.append($$anchor2, span);
    };
    var alternate = ($$anchor2) => {
      var article_1 = root_2$1();
      var node_1 = $2.child(article_1);
      StoreView(node_1, {
        get s() {
          return $$props.s;
        }
      });
      var node_2 = $2.sibling(node_1, 2);
      $2.each(
        node_2,
        16,
        () => storeIds.current,
        (storeId) => storeId,
        ($$anchor3, storeId) => {
          StoreView($$anchor3, {
            get storeId() {
              return storeId;
            },
            get s() {
              return $$props.s;
            }
          });
        }
      );
      var node_3 = $2.sibling(node_2, 2);
      MetricsView(node_3, {
        get s() {
          return $$props.s;
        }
      });
      var node_4 = $2.sibling(node_3, 2);
      $2.each(
        node_4,
        16,
        () => metricsIds.current,
        (metricsId) => metricsId,
        ($$anchor3, metricsId) => {
          MetricsView($$anchor3, {
            get metricsId() {
              return metricsId;
            },
            get s() {
              return $$props.s;
            }
          });
        }
      );
      var node_5 = $2.sibling(node_4, 2);
      IndexesView(node_5, {
        get s() {
          return $$props.s;
        }
      });
      var node_6 = $2.sibling(node_5, 2);
      $2.each(
        node_6,
        16,
        () => indexesIds.current,
        (indexesId) => indexesId,
        ($$anchor3, indexesId) => {
          IndexesView($$anchor3, {
            get indexesId() {
              return indexesId;
            },
            get s() {
              return $$props.s;
            }
          });
        }
      );
      var node_7 = $2.sibling(node_6, 2);
      RelationshipsView(node_7, {
        get s() {
          return $$props.s;
        }
      });
      var node_8 = $2.sibling(node_7, 2);
      $2.each(
        node_8,
        16,
        () => relationshipsIds.current,
        (relationshipsId) => relationshipsId,
        ($$anchor3, relationshipsId) => {
          RelationshipsView($$anchor3, {
            get relationshipsId() {
              return relationshipsId;
            },
            get s() {
              return $$props.s;
            }
          });
        }
      );
      var node_9 = $2.sibling(node_8, 2);
      QueriesView(node_9, {
        get s() {
          return $$props.s;
        }
      });
      var node_10 = $2.sibling(node_9, 2);
      $2.each(
        node_10,
        16,
        () => queriesIds.current,
        (queriesId) => queriesId,
        ($$anchor3, queriesId) => {
          QueriesView($$anchor3, {
            get queriesId() {
              return queriesId;
            },
            get s() {
              return $$props.s;
            }
          });
        }
      );
      $2.reset(article_1);
      $2.bind_this(
        article_1,
        ($$value) => $2.set(article, $$value),
        () => $2.get(article)
      );
      $2.event("scroll", article_1, handleScroll);
      $2.append($$anchor2, article_1);
    };
    $2.if(node, ($$render) => {
      if ($2.get(noProvidedObjects)) $$render(consequent);
      else $$render(alternate, -1);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
var root_1$1 = $2.from_html(`<span class="warn"> </span>`);
function ErrorBoundary($$anchor, $$props) {
  const handleError = (error) => console.error(error);
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    const failed = ($$anchor2, _error = $2.noop, _reset = $2.noop) => {
      var span = root_1$1();
      var text3 = $2.child(span, true);
      $2.reset(span);
      $2.template_effect(() => $2.set_text(text3, INSPECTOR_ERROR_MESSAGE));
      $2.append($$anchor2, span);
    };
    $2.boundary(node, { onerror: handleError, failed }, ($$anchor2) => {
      var fragment_1 = $2.comment();
      var node_1 = $2.first_child(fragment_1);
      $2.snippet(node_1, () => $$props.children);
      $2.append($$anchor2, fragment_1);
    });
  }
  $2.append($$anchor, fragment);
}
var root_22 = $2.from_html(`<img tabindex="0" alt=""/>`);
var root$12 = $2.from_html(
  `<header><img class="flat" tabindex="0" alt=""/> <span> </span> <!>  <img class="flat" title="Close" tabindex="0" alt=""/></header>`
);
function Header($$anchor, $$props) {
  $2.push($$props, true);
  const position = getValue(
    () => POSITION_VALUE,
    () => $$props.s
  );
  const handleClick = () => open("https://tinybase.org", "_blank");
  const handleClose = () => $$props.s.setValue(OPEN_VALUE, false);
  const handleDock = (event2) => $$props.s.setValue(POSITION_VALUE, Number(event2.currentTarget.dataset.id));
  const onKeyDown = (event2, handle) => {
    if (event2.key == "Enter" || event2.key == " ") {
      event2.preventDefault();
      handle();
    }
  };
  var header = root$12();
  var img2 = $2.child(header);
  var span = $2.sibling(img2, 2);
  var text3 = $2.child(span, true);
  $2.reset(span);
  var node = $2.sibling(span, 2);
  $2.each(
    node,
    17,
    () => POSITIONS,
    $2.index,
    ($$anchor2, name, p) => {
      var fragment = $2.comment();
      var node_1 = $2.first_child(fragment);
      {
        var consequent = ($$anchor3) => {
          var img_1 = root_22();
          $2.set_attribute(img_1, "data-id", p);
          $2.template_effect(
            () => $2.set_attribute(img_1, "title", "Dock to " + $2.get(name))
          );
          $2.delegated("click", img_1, handleDock);
          $2.delegated(
            "keydown",
            img_1,
            (event2) => onKeyDown(event2, () => $$props.s.setValue(POSITION_VALUE, p))
          );
          $2.append($$anchor3, img_1);
        };
        $2.if(node_1, ($$render) => {
          if (p != (position.current ?? 1)) $$render(consequent);
        });
      }
      $2.append($$anchor2, fragment);
    }
  );
  var img_2 = $2.sibling(node, 2);
  $2.reset(header);
  $2.template_effect(() => {
    $2.set_attribute(img2, "title", TITLE);
    $2.set_text(text3, TITLE);
  });
  $2.delegated("click", img2, handleClick);
  $2.delegated("keydown", img2, (event2) => onKeyDown(event2, handleClick));
  $2.delegated("click", img_2, handleClose);
  $2.delegated("keydown", img_2, (event2) => onKeyDown(event2, handleClose));
  $2.append($$anchor, header);
  $2.pop();
}
$2.delegate(["click", "keydown"]);
var root_1 = $2.from_html(`<main><!> <!></main>`);
function Panel($$anchor, $$props) {
  $2.push($$props, true);
  const position = getValue(
    () => POSITION_VALUE,
    () => $$props.s
  );
  const open2 = getValue(
    () => OPEN_VALUE,
    () => $$props.s
  );
  var fragment = $2.comment();
  var node = $2.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var main = root_1();
      var node_1 = $2.child(main);
      Header(node_1, {
        get s() {
          return $$props.s;
        }
      });
      var node_2 = $2.sibling(node_1, 2);
      ErrorBoundary(node_2, {
        children: ($$anchor3, $$slotProps) => {
          Body($$anchor3, {
            get s() {
              return $$props.s;
            }
          });
        }
      });
      $2.reset(main);
      $2.template_effect(
        () => $2.set_attribute(main, "data-position", position.current ?? 1)
      );
      $2.append($$anchor2, main);
    };
    $2.if(node, ($$render) => {
      if (open2.current) $$render(consequent);
    });
  }
  $2.append($$anchor, fragment);
  $2.pop();
}
var root2 = $2.from_html(`<aside><!> <!></aside>`);
function Inspector($$anchor, $$props) {
  $2.push($$props, true);
  let position = $2.prop($$props, "position", 3, "right"), open2 = $2.prop($$props, "open", 3, false), hue = $2.prop($$props, "hue", 3, 270);
  const s = createStore();
  onMount(() => {
    let mounted = true;
    let persister;
    void (async () => {
      persister = createSessionPersister(s, UNIQUE_ID);
      await persister.load([
        {},
        { position: getInitialPosition(position()), open: !!open2() }
      ]);
      if (!mounted) {
        await persister.destroy();
        return;
      }
      await persister.startAutoSave();
    })();
    return () => {
      mounted = false;
      void persister?.destroy();
    };
  });
  var aside = root2();
  $2.head("17us0pj", ($$anchor2) => {
    var fragment = $2.comment();
    var node = $2.first_child(fragment);
    $2.html(node, () => `<style>${APP_STYLESHEET}</style>`);
    $2.append($$anchor2, fragment);
  });
  var node_1 = $2.child(aside);
  Nub(node_1, {
    get s() {
      return s;
    }
  });
  var node_2 = $2.sibling(node_1, 2);
  Panel(node_2, {
    get s() {
      return s;
    }
  });
  $2.reset(aside);
  $2.template_effect(() => {
    $2.set_attribute(aside, "id", UNIQUE_ID);
    $2.set_style(aside, `--hue:${hue()}`);
  });
  $2.append($$anchor, aside);
  $2.pop();
}
export {
  Inspector
};
