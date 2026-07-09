// dist/ui-svelte-inspector/index.js
import { getContext, onDestroy, onMount } from "https://esm.sh/svelte@^5.56.4";
import * as $ from "https://esm.sh/svelte@^5.56.4/internal/client";
import "https://esm.sh/svelte@^5.56.4/internal/disclose-version";
import { createSubscriber } from "https://esm.sh/svelte@^5.56.4/reactivity";
var getTypeOf = (thing) => typeof thing;
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var DOT = ".";
var STRING = getTypeOf(EMPTY_STRING);
var BOOLEAN = getTypeOf(true);
var NUMBER = getTypeOf(0);
var FUNCTION = getTypeOf(getTypeOf);
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
var METRIC = "Metric";
var INDEX = "Index";
var SLICE = "Slice";
var RELATIONSHIP = "Relationship";
var REMOTE_ROW_ID = "Remote" + ROW + "Id";
var QUERY = "Query";
var EXTRA = "extra";
var REQUIRED = "required";
var UNDEFINED = "\uFFFC";
var JSON_PREFIX = "\uFFFD";
var id = (key) => EMPTY_STRING + key;
var math = Math;
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL = globalThis;
var WINDOW = GLOBAL.window;
var number = Number;
var string = String;
var boolean = Boolean;
var mathMin = math.min;
var mathFloor = math.floor;
var isFiniteNumber = isFinite;
var isInstanceOf = (thing, cls) => thing instanceof cls;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var hasWindow = () => !isUndefined(GLOBAL.window);
var isNull = (thing) => thing === null;
var isTrue = (thing) => thing === true;
var isFalse = (thing) => thing === false;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isTypeStringOrBoolean = (type) => type == STRING || type == BOOLEAN;
var isString = (thing) => getTypeOf(thing) == STRING;
var isFunction = (thing) => getTypeOf(thing) == FUNCTION;
var isArray = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var noop2 = () => {
};
var structuredClone = GLOBAL.structuredClone;
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
var arrayIndexOf = (array, value) => array.indexOf(value);
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index2) => array2[index2] === value1);
var arraySort = (array, sorter) => array.sort(sorter);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING) => array.join(sep);
var arrayMap = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size(array) == 0;
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayClear = (array, to) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objFrozen = object.isFrozen;
var objEntries = object.entries;
var isObject = (obj) => !isNullish(obj) && ifNotNullish(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isNullish(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds = object.keys;
var objFreeze = object.freeze;
var objNew = (entries = []) => object.fromEntries(entries);
var objGet = (obj, id2) => ifNotUndefined(obj, (obj2) => obj2[id2]);
var objHas = (obj, id2) => id2 in obj;
var objDel = (obj, id2) => {
  delete obj[id2];
  return obj;
};
var objForEach = (obj, cb) => arrayForEach(objEntries(obj), ([id2, value]) => cb(value, id2));
var objToArray = (obj, cb) => arrayMap(objEntries(obj), ([id2, value]) => cb(value, id2));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id2) => [id2, cb(value, id2)]));
var objSize = (obj) => size(objIds(obj));
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
  (_key, value) => isInstanceOf(value, Map) ? object.fromEntries([...value]) : value
);
var jsonStringWithUndefined = (obj) => jsonString(obj, (_key, value) => isUndefined(value) ? UNDEFINED : value);
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
  const index2 = arrayIndexOf(POSITIONS, position);
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
var Z_INDEX = "z-index";
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
        [Z_INDEX]: 999999,
        "font-family": "inter,sans-serif",
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
        [Z_INDEX]: 1,
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
var collIsEmpty = (coll) => isUndefined(coll) || collSize(coll) == 0;
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
var mapSet = (map2, key, value) => isUndefined(value) ? (collDel(map2, key), map2) : map2?.set(key, value);
var mapEnsure = (map2, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map2, key)) {
    mapSet(map2, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map2, key));
  }
  return mapGet(map2, key);
};
var mapMatch = (map2, obj, set2, del = mapSet) => {
  objMap(obj, (value, id2) => set2(map2, id2, value));
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
var visitTree = (node, path, ensureLeaf, pruneLeaf, p = 0) => ifNotUndefined(
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
    (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING + nextId++,
    (id2) => {
      if (test(INTEGER, id2) && size(pool) < 1e3) {
        arrayPush(pool, id2);
      }
    }
  ];
};
var setNew = (entryOrEntries) => new Set(
  isArray(entryOrEntries) || isUndefined(entryOrEntries) ? entryOrEntries : [entryOrEntries]
);
var setAdd = (set2, value) => set2?.add(value);
var getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING]) => {
  const leaves = [];
  const deep = (node, p) => p == size(path) ? arrayPush(leaves, node) : isNull(path[p]) ? collForEach(node, (node2) => deep(node2, p + 1)) : arrayForEach([path[p], null], (id2) => deep(mapGet(node, id2), p + 1));
  deep(deepIdSet, 0);
  return leaves;
};
var getListenerFunctions = (getThing2) => {
  let thing;
  const [getId, releaseId] = getPoolFunctions();
  const allListeners = mapNew();
  const addListener = (listener, idSetNode, path, pathGetters = [], extraArgsGetter = () => []) => {
    thing ??= getThing2();
    const id2 = getId(1);
    mapSet(allListeners, id2, [
      listener,
      idSetNode,
      path,
      pathGetters,
      extraArgsGetter
    ]);
    setAdd(visitTree(idSetNode, path ?? [EMPTY_STRING], setNew), id2);
    return id2;
  };
  const callListeners = (idSetNode, ids, ...extraArgs) => arrayForEach(
    getWildcardedLeaves(idSetNode, ids),
    (set2) => collForEach(
      set2,
      (id2) => mapGet(allListeners, id2)[0](thing, ...ids ?? [], ...extraArgs)
    )
  );
  const delListener = (id2) => ifNotUndefined(mapGet(allListeners, id2), ([, idSetNode, idOrNulls]) => {
    visitTree(idSetNode, idOrNulls ?? [EMPTY_STRING], void 0, (idSet) => {
      collDel(idSet, id2);
      return collIsEmpty(idSet) ? 1 : 0;
    });
    mapSet(allListeners, id2);
    releaseId(id2);
    return idOrNulls;
  });
  const callListener = (id2) => ifNotUndefined(
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
      while (!isUndefined(action = arrayShift(mapGet(scheduleActions, scheduleId)))) {
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
            } else if (isUndefined(content) && initialContent) {
              setDefaultContent(initialContent);
            } else if (!isUndefined(content)) {
              errorNew(`Content is not an array: ${content}`);
            }
          },
          (error) => {
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
  const isAutoLoading = () => !isUndefined(autoLoadHandle);
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
  const isAutoSaving = () => !isUndefined(autoSaveListenerId);
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
  const type = getTypeOf(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var isJsonType = (type) => type == OBJECT || type == ARRAY;
var encodeIfJson = (value) => isObject(value) || isArray(value) ? JSON_PREFIX + jsonString(value) : value;
var isEncodedJson = (value) => isString(value) && value[0] == JSON_PREFIX;
var decodeIfJson = (raw, _id, encoded) => !encoded && isEncodedJson(raw) ? jsonParse(slice(raw, 1)) : raw;
var getTypeCase = (type, stringCase, numberCase, booleanCase, objectCase, arrayCase) => type == STRING ? stringCase : type == NUMBER ? numberCase : type == BOOLEAN ? booleanCase : type == OBJECT ? objectCase : type == ARRAY ? arrayCase : null;
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
  const defaultedCells = mapNew();
  const changedValueIds = mapNew();
  const changedValues = mapNew();
  const defaultedValues = setNew();
  const invalidCells = mapNew();
  const invalidValues = mapNew();
  const tablesSchemaMap = mapNew();
  const tablesSchemaRowCache = mapNew();
  const valuesSchemaMap = mapNew();
  const valuesDefaulted = mapNew();
  const valuesNonDefaulted = setNew();
  const valuesRequiredNonDefaulted = setNew();
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
  const ifTransformed = (snapshot, getResult, then, isEqual = Object.is) => ifNotUndefined(
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
      (_child, id2) => arrayHas([TYPE, DEFAULT, ALLOW_NULL, REQUIRED], id2)
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
  const validateRow = (tableId, rowId, row, skipDefaults) => {
    const rowWithDefaults = skipDefaults ? row : addDefaultsToRow(row, tableId, rowId);
    return objValidate(
      rowWithDefaults,
      (cell, cellId) => ifNotUndefined(
        getValidatedCell(tableId, rowId, cellId, cell),
        (validCell) => {
          row[cellId] = validCell;
          return true;
        },
        () => false
      ),
      () => cellInvalid(tableId, rowId)
    ) && (skipDefaults ? true : arrayEvery(
      collValues(mapGet(tablesSchemaRowCache, tableId)?.[2]),
      (cellId) => objHas(rowWithDefaults, cellId)
    ));
  };
  const getValidatedCell = (tableId, rowId, cellId, cell) => hasTablesSchema ? ifNotUndefined(
    mapGet(mapGet(tablesSchemaMap, tableId), cellId),
    (cellSchema) => isNull(cell) ? cellSchema[ALLOW_NULL] ? cell : cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT]) : getCellOrValueType(cell) === cellSchema[TYPE] ? encodeIfJson(cell) : isJsonType(cellSchema[TYPE]) && isEncodedJson(cell) ? cell : cellInvalid(
      tableId,
      rowId,
      cellId,
      cell,
      cellSchema[DEFAULT]
    ),
    () => cellInvalid(tableId, rowId, cellId, cell)
  ) : isUndefined(getCellOrValueType(cell)) ? cellInvalid(tableId, rowId, cellId, cell) : encodeIfJson(cell);
  const validateValues = (values, skipDefaults) => {
    const valuesWithDefaults = skipDefaults ? values : addDefaultsToValues(values);
    return objValidate(
      valuesWithDefaults,
      (value, valueId) => ifNotUndefined(
        getValidatedValue(valueId, value),
        (validValue) => {
          values[valueId] = validValue;
          return true;
        },
        () => false
      ),
      () => valueInvalid()
    ) && (skipDefaults ? true : arrayEvery(
      collValues(valuesRequiredNonDefaulted),
      (valueId) => objHas(valuesWithDefaults, valueId)
    ));
  };
  const getValidatedValue = (valueId, value) => hasValuesSchema ? ifNotUndefined(
    mapGet(valuesSchemaMap, valueId),
    (valueSchema) => isNull(value) ? valueSchema[ALLOW_NULL] ? value : valueInvalid(valueId, value, valueSchema[DEFAULT]) : getCellOrValueType(value) === valueSchema[TYPE] ? encodeIfJson(value) : isJsonType(valueSchema[TYPE]) && isEncodedJson(value) ? value : valueInvalid(valueId, value, valueSchema[DEFAULT]),
    () => valueInvalid(valueId, value)
  ) : isUndefined(getCellOrValueType(value)) ? valueInvalid(valueId, value) : encodeIfJson(value);
  const addDefaultsToRow = (row, tableId, rowId) => {
    ifNotUndefined(
      mapGet(tablesSchemaRowCache, tableId),
      ([rowDefaulted, rowNonDefaulted]) => {
        collForEach(rowDefaulted, (cell, cellId) => {
          if (!objHas(row, cellId)) {
            row[cellId] = cell;
            ifNotUndefined(
              rowId,
              (rowId2) => setAdd(
                mapEnsure(
                  mapEnsure(defaultedCells, tableId, mapNew),
                  rowId2,
                  setNew
                ),
                cellId
              )
            );
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
          setAdd(defaultedValues, valueId);
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
      const rowRequiredNonDefaulted = setNew();
      mapMatch(
        mapEnsure(tablesSchemaMap, tableId, mapNew),
        tableSchema,
        (tableSchemaMap, cellId, cellSchema) => {
          mapSet(tableSchemaMap, cellId, cellSchema);
          ifNotUndefined(
            cellSchema[DEFAULT],
            (defaultCell) => {
              mapSet(rowDefaulted, cellId, defaultCell);
            },
            () => {
              setAdd(rowNonDefaulted, cellId);
              if (cellSchema[REQUIRED] === true) {
                setAdd(rowRequiredNonDefaulted, cellId);
              }
            }
          );
        }
      );
      mapSet(tablesSchemaRowCache, tableId, [
        rowDefaulted,
        rowNonDefaulted,
        rowRequiredNonDefaulted
      ]);
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
      ifNotUndefined(
        valueSchema[DEFAULT],
        (defaultValue) => {
          mapSet(valuesDefaulted, valueId, defaultValue);
          collDel(valuesNonDefaulted, valueId);
          collDel(valuesRequiredNonDefaulted, valueId);
        },
        () => {
          mapSet(valuesDefaulted, valueId);
          setAdd(valuesNonDefaulted, valueId);
          if (valueSchema[REQUIRED] === true) {
            setAdd(valuesRequiredNonDefaulted, valueId);
          } else {
            collDel(valuesRequiredNonDefaulted, valueId);
          }
        }
      );
    },
    (_valuesSchema, valueId) => {
      mapSet(valuesSchemaMap, valueId);
      mapSet(valuesDefaulted, valueId);
      collDel(valuesNonDefaulted, valueId);
      collDel(valuesRequiredNonDefaulted, valueId);
    }
  );
  const setOrDelTables = (tables) => objIsEmpty(tables) ? delTables() : setTables(tables);
  const setOrDelCell = (tableId, rowId, cellId, cell, skipMiddleware, skipRowMiddleware) => isUndefined(cell) ? delCell(tableId, rowId, cellId, true, skipMiddleware) : setCell(
    tableId,
    rowId,
    cellId,
    cell,
    skipMiddleware,
    skipRowMiddleware
  );
  const setOrDelValues = (values) => objIsEmpty(values) ? delValues() : setValues(values);
  const setOrDelValue = (valueId, value, skipMiddleware) => isUndefined(value) ? delValue(valueId, skipMiddleware) : setValue(valueId, value, skipMiddleware);
  const setValidContent = (content) => ifTransformed(
    content,
    () => ifNotUndefined(
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
    () => forceDel ? tables : ifNotUndefined(
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
    () => forceDel ? table : ifNotUndefined(
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
    () => forceDel ? row : ifNotUndefined(
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
      (rowMap, cellId, cell) => ifNotUndefined(
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
    () => ifNotUndefined(
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
  const setCellIntoNewRow = (tableId, tableMap, rowId, cellId, validCell, skipMiddleware) => ifNotUndefined(
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
    () => forceDel ? values : ifNotUndefined(
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
    () => ifNotUndefined(
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
    if (!isUndefined(defaultCell) && !forceDel) {
      return setValidCell(tableId, rowId, row, cellId, defaultCell);
    }
    if (skipMiddleware || (whileMutating(() => middleware[10]?.(tableId, rowId, cellId)) ?? true)) {
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
    }
  };
  const delValidValue = (valueId, skipMiddleware) => {
    const defaultValue = mapGet(valuesDefaulted, valueId);
    if (!isUndefined(defaultValue)) {
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
    const defaulted = collHas(mapGet(mapGet(defaultedCells, tableId), rowId), cellId) && isUndefined(oldCell) ? 1 : 0;
    mapEnsure(
      mapEnsure(mapEnsure(changedCells, tableId, mapNew), rowId, mapNew),
      cellId,
      () => [oldCell, 0]
    )[1] = newCell;
    internalListeners[3]?.(
      tableId,
      rowId,
      cellId,
      newCell,
      mutating,
      defaulted
    );
    collDel(mapGet(mapGet(defaultedCells, tableId), rowId), cellId);
  };
  const valueIdsChanged = (valueId, addedOrRemoved) => idsChanged(changedValueIds, valueId, addedOrRemoved);
  const valueChanged = (valueId, oldValue, newValue) => {
    const defaulted = collHas(defaultedValues, valueId) && isUndefined(oldValue) ? 1 : 0;
    mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
    internalListeners[4]?.(valueId, newValue, mutating, defaulted);
    collDel(defaultedValues, valueId);
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
  const getCellChange = (tableId, rowId, cellId) => ifNotUndefined(
    mapGet(mapGet(mapGet(changedCells, tableId), rowId), cellId),
    ([oldCell, newCell]) => [
      true,
      decodeIfJson(oldCell),
      decodeIfJson(newCell)
    ],
    () => [false, ...pairNew(getCell2(tableId, rowId, cellId))]
  );
  const getValueChange = (valueId) => ifNotUndefined(
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
    const [descending, offset, limit, sorter] = otherArgs;
    let sortedRowIds = getSortedRowIds2(
      tableId,
      cellId,
      descending,
      offset,
      limit,
      sorter
    );
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds2(
          tableId,
          cellId,
          descending,
          offset,
          limit,
          sorter
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
            sortedRowIds
          );
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
          ([, newCell]) => decodeIfJson(newCell, EMPTY_STRING, encoded),
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
      ([, newValue]) => decodeIfJson(newValue, EMPTY_STRING, encoded),
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
  const getSortedRowIds2 = (tableIdOrArgs, cellId, descending, offset = 0, limit, sorter = defaultSorter) => isObject(tableIdOrArgs) ? getSortedRowIds2(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending,
    tableIdOrArgs.offset,
    tableIdOrArgs.limit,
    tableIdOrArgs.sorter
  ) : arrayMap(
    slice(
      arraySort(
        mapMap(mapGet(tablesMap, id(tableIdOrArgs)), (row, rowId) => [
          isUndefined(cellId) ? rowId : decodeIfJson(mapGet(row, id(cellId))),
          rowId
        ]),
        ([cell1], [cell2]) => sorter(cell1, cell2) * (descending ? -1 : 1)
      ),
      offset,
      isUndefined(limit) ? limit : offset + limit
    ),
    ([, rowId]) => rowId
  );
  const getRow = (tableId, rowId) => mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), decodeIfJson);
  const getCellIds2 = (tableId, rowId) => mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCell2 = (tableId, rowId, cellId) => decodeIfJson(
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
    const content2 = isFunction(content) ? content() : content;
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
    (tableId2, rowId2, cellId2) => ifNotUndefined(
      getValidatedCell(
        tableId2,
        rowId2,
        cellId2,
        isFunction(cell) ? cell(getCell2(tableId2, rowId2, cellId2)) : cell
      ),
      (validCell) => {
        const tableMap = getOrCreateTable(tableId2);
        ifNotUndefined(
          skipMiddleware || skipRowMiddleware || !middleware[14]?.() ? void 0 : middleware[3],
          (willSetRow) => {
            const existingRowMap = mapGet(tableMap, rowId2);
            const prospectiveRow = {
              ...existingRowMap ? mapToObj(existingRowMap) : {},
              [cellId2]: validCell
            };
            ifNotUndefined(
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
    (valueId2) => ifNotUndefined(
      getValidatedValue(
        valueId2,
        isFunction(value) ? value(getValue2(valueId2)) : value
      ),
      (validValue) => setValidValue(valueId2, validValue, skipMiddleware)
    ),
    valueId
  );
  const applyChanges = (changes) => fluentTransaction(
    () => ifTransformed(
      changes,
      () => ifNotUndefined(
        middleware[13],
        (willApplyChanges) => whileMutating(() => willApplyChanges(structuredClone(changes))),
        () => changes
      ),
      (changes2) => {
        objMap(
          changes2[0],
          (table, tableId) => isUndefined(table) ? delTable(tableId) : objMap(
            table,
            (row, rowId) => isUndefined(row) ? delRow(tableId, rowId) : objMap(
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
    (tableId2, rowId2) => ifNotUndefined(
      mapGet(tablesMap, tableId2),
      (tableMap) => collHas(tableMap, rowId2) ? delValidRow(tableId2, tableMap, rowId2) : 0
    ),
    tableId,
    rowId
  );
  const delCell = (tableId, rowId, cellId, forceDel, skipMiddleware) => fluentTransaction(
    (tableId2, rowId2, cellId2) => ifNotUndefined(
      mapGet(tablesMap, tableId2),
      (tableMap) => ifNotUndefined(
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
            defaultedCells,
            invalidCells,
            changedValueIds,
            changedValues,
            defaultedValues,
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
      tableIdOrArgs.limit,
      tableIdOrArgs.sorter
    ],
    cellIdOrListener,
    descendingOrMutator
  ) : addSortedRowIdsListenerImpl(
    tableIdOrArgs,
    cellIdOrListener,
    [descendingOrMutator, offset, limit, void 0],
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
    getCell: getCell2,
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
      [HAS + TABLES]: [0, hasTablesListeners, [], () => [hasTables()]],
      [TABLES]: [0, tablesListeners],
      [TABLE_IDS]: [0, tableIdsListeners],
      [HAS + TABLE]: [
        1,
        hasTableListeners,
        [getTableIds2],
        (ids) => [hasTable(...ids)]
      ],
      [TABLE]: [1, tableListeners, [getTableIds2]],
      [TABLE + CELL_IDS]: [1, tableCellIdsListeners, [getTableIds2]],
      [HAS + TABLE + CELL]: [
        2,
        hasTableCellListeners,
        [getTableIds2, getTableCellIds2],
        (ids) => [hasTableCell(...ids)]
      ],
      [ROW_COUNT]: [1, rowCountListeners, [getTableIds2]],
      [ROW_IDS]: [1, rowIdsListeners, [getTableIds2]],
      [HAS + ROW]: [
        2,
        hasRowListeners,
        [getTableIds2, getRowIds2],
        (ids) => [hasRow(...ids)]
      ],
      [ROW]: [2, rowListeners, [getTableIds2, getRowIds2]],
      [CELL_IDS]: [2, cellIdsListeners, [getTableIds2, getRowIds2]],
      [HAS + CELL]: [
        3,
        hasCellListeners,
        [getTableIds2, getRowIds2, getCellIds2],
        (ids) => [hasCell2(...ids)]
      ],
      [CELL]: [
        3,
        cellListeners,
        [getTableIds2, getRowIds2, getCellIds2],
        (ids) => pairNew(getCell2(...ids))
      ],
      InvalidCell: [3, invalidCellListeners],
      [HAS + VALUES]: [0, hasValuesListeners, [], () => [hasValues()]],
      [VALUES]: [0, valuesListeners],
      [VALUE_IDS]: [0, valueIdsListeners],
      [HAS + VALUE]: [
        1,
        hasValueListeners,
        [getValueIds2],
        (ids) => [hasValue(...ids)]
      ],
      [VALUE]: [
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
var OFFSET_STORE = 0;
var OFFSET_METRICS = 1;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES = 4;
var maybeGet$1 = (thing) => isFunction(thing) ? thing() : thing;
var getContextValue = () => getContext(TINYBASE_CONTEXT_KEY) ?? [];
var getThing = (contextValue, thingOrThingId, offset) => isUndefined(thingOrThingId) ? contextValue[offset * 2] : isString(thingOrThingId) ? objGet(contextValue[offset * 2 + 1], thingOrThingId) : thingOrThingId;
var getProvidedThing = (thingOrThingId, offset) => getThing(getContextValue(), thingOrThingId, offset);
var resolveProvidedThing = (thingOrThingId, offset) => {
  const contextValue = getContextValue();
  return () => getThing(contextValue, maybeGet$1(thingOrThingId), offset);
};
var getThingIds = (contextValue, offset) => objIds(contextValue[offset * 2 + 1] ?? EMPTY_OBJ);
var resolveStore = (storeOrStoreId) => resolveProvidedThing(storeOrStoreId, OFFSET_STORE);
var resolveMetrics = (metricsOrMetricsId) => resolveProvidedThing(metricsOrMetricsId, OFFSET_METRICS);
var resolveIndexes = (indexesOrIndexesId) => resolveProvidedThing(indexesOrIndexesId, OFFSET_INDEXES);
var resolveRelationships = (relationshipsOrRelationshipsId) => resolveProvidedThing(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var resolveQueries = (queriesOrQueriesId) => resolveProvidedThing(queriesOrQueriesId, OFFSET_QUERIES);
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
var getTableIds = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), TABLE_IDS, EMPTY_ARR);
var getTableCellIds = (tableId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  TABLE + CELL_IDS,
  EMPTY_ARR,
  () => [maybeGet$1(tableId)]
);
var getRowCount = (tableId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), ROW_COUNT, 0, () => [
  maybeGet$1(tableId)
]);
var getRowIds = (tableId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), ROW_IDS, EMPTY_ARR, () => [
  maybeGet$1(tableId)
]);
var getSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending = false, offset = 0, limit, sorter, storeOrStoreId) => isObject(tableIdOrArgs) ? createListenable(
  resolveStore(cellIdOrStoreOrStoreId),
  SORTED_ROW_IDS,
  EMPTY_ARR,
  () => [tableIdOrArgs]
) : createListenable(
  resolveStore(storeOrStoreId),
  SORTED_ROW_IDS,
  EMPTY_ARR,
  () => isUndefined(sorter) ? [
    maybeGet$1(tableIdOrArgs),
    maybeGet$1(cellIdOrStoreOrStoreId),
    maybeGet$1(descending),
    maybeGet$1(offset),
    maybeGet$1(limit)
  ] : [
    {
      tableId: maybeGet$1(tableIdOrArgs),
      cellId: maybeGet$1(cellIdOrStoreOrStoreId),
      descending: maybeGet$1(descending) ?? false,
      offset: maybeGet$1(offset) ?? 0,
      limit: maybeGet$1(limit),
      sorter
    }
  ]
);
var getCellIds = (tableId, rowId, storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), CELL_IDS, EMPTY_ARR, () => [
  maybeGet$1(tableId),
  maybeGet$1(rowId)
]);
var hasCell = (tableId, rowId, cellId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  CELL,
  false,
  () => [maybeGet$1(tableId), maybeGet$1(rowId), maybeGet$1(cellId)],
  1
);
var getCell = (tableId, rowId, cellId, storeOrStoreId) => {
  const getStore2 = resolveStore(storeOrStoreId);
  let subscribe = $.state($.proxy(noop2));
  if (hasWindow()) {
    $.user_effect(() => {
      const store = getStore2();
      const tableIdValue = maybeGet$1(tableId);
      const rowIdValue = maybeGet$1(rowId);
      const cellIdValue = maybeGet$1(cellId);
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
    () => $.get(subscribe)()
  );
};
var getValues = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), VALUES, EMPTY_OBJ);
var getValueIds = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), VALUE_IDS, EMPTY_ARR);
var getValue = (valueId, storeOrStoreId) => {
  const getStore2 = resolveStore(storeOrStoreId);
  let subscribe = $.state($.proxy(noop2));
  if (hasWindow()) {
    $.user_effect(() => {
      const store = getStore2();
      const valueIdValue = maybeGet$1(valueId);
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
    () => getStore2()?.getValue(maybeGet$1(valueId)),
    (nextValue) => getStore2()?.setValue(maybeGet$1(valueId), nextValue),
    () => $.get(subscribe)()
  );
};
var getStore = (id2) => getProvidedThing(id2, OFFSET_STORE);
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
var getMetrics = (id2) => getProvidedThing(id2, OFFSET_METRICS);
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
  maybeGet$1(metricId)
]);
var getIndexes = (id2) => getProvidedThing(id2, OFFSET_INDEXES);
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
  () => [maybeGet$1(indexId)]
);
var getSliceRowIds = (indexId, sliceId, indexesOrIndexesId) => createListenable(
  resolveIndexes(indexesOrIndexesId),
  SLICE + ROW_IDS,
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
var getResultTableCellIds = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + TABLE + CELL_IDS,
  EMPTY_ARR,
  () => [maybeGet$1(queryId)]
);
var getResultRowCount = (queryId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + ROW_COUNT,
  0,
  () => [maybeGet$1(queryId)]
);
var getResultSortedRowIds = (queryId, cellId, descending = false, offset = 0, limit, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + SORTED_ROW_IDS,
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
  RESULT + CELL,
  void 0,
  () => [maybeGet$1(queryId), maybeGet$1(rowId), maybeGet$1(cellId)]
);
var getRelationships = (id2) => getProvidedThing(id2, OFFSET_RELATIONSHIPS);
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
var root$m = $.from_html(`<img tabindex="0" alt=""/>`);
function Nub($$anchor, $$props) {
  $.push($$props, true);
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
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var img2 = root$m();
      $.template_effect(() => {
        $.set_attribute(img2, "title", TITLE);
        $.set_attribute(img2, "data-position", position.current ?? 1);
      });
      $.delegated("click", img2, handleOpen);
      $.delegated("keydown", img2, handleKeyDown);
      $.append($$anchor2, img2);
    };
    $.if(node, ($$render) => {
      if (!open2.current) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
$.delegate(["click", "keydown"]);
var requestInspectorIdleCallback = (callback) => globalThis.requestIdleCallback?.(callback) ?? setTimeout(
  () => callback({
    didTimeout: false,
    timeRemaining: () => 0
  }),
  0
);
var cancelInspectorIdleCallback = (id2) => globalThis.cancelIdleCallback?.(id2) ?? clearTimeout(id2);
var root$l = $.from_html(`<img tabindex="0" alt=""/>`);
var root_1$c = $.from_html(
  `<details><summary><span> </span> <!></summary> <div><!></div></details>`
);
function Details($$anchor, $$props) {
  $.push($$props, true);
  let editable = $.prop($$props, "editable", 3, false);
  const open2 = getCell(
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
  var details = root_1$c();
  var summary = $.child(details);
  var span = $.child(summary);
  var text2 = $.child(span, true);
  $.reset(span);
  var node = $.sibling(span, 2);
  {
    var consequent = ($$anchor2) => {
      var img2 = root$l();
      $.template_effect(() => {
        $.set_class(img2, 1, $.clsx(editable() ? "done" : "edit"));
        $.set_attribute(img2, "title", editable() ? "Done editing" : "Edit");
      });
      $.delegated("click", img2, function(...$$args) {
        $$props.handleEditable?.apply(this, $$args);
      });
      $.delegated("keydown", img2, handleKeyDown);
      $.append($$anchor2, img2);
    };
    $.if(node, ($$render) => {
      if ($$props.handleEditable) $$render(consequent);
    });
  }
  $.reset(summary);
  var div = $.sibling(summary, 2);
  var node_1 = $.child(div);
  $.snippet(node_1, () => $$props.children);
  $.reset(div);
  $.reset(details);
  $.template_effect(() => {
    details.open = !!open2.current;
    $.set_text(text2, $$props.title);
  });
  $.event("toggle", details, handleToggle);
  $.append($$anchor, details);
  $.pop();
}
$.delegate(["click", "keydown"]);
var root$k = $.from_html(`<button> </button>`);
var root_1$b = $.from_html(`<input/>`);
var root_2$4 = $.from_html(`<input type="number"/>`);
var root_3$3 = $.from_html(`<input type="checkbox"/>`);
var root_4$2 = $.from_html(`<div><!><!></div>`);
function EditableThing($$anchor, $$props) {
  $.push($$props, true);
  let showType = $.prop($$props, "showType", 3, true);
  const EMPTY_STRING2 = "";
  const INVALID = "invalid";
  let thingType = $.state(void 0);
  let currentThingKey = $.state(void 0);
  let stringThing = $.state(void 0);
  let numberThing = $.state(void 0);
  let booleanThing = $.state(void 0);
  let objectThing = $.state("{}");
  let arrayThing = $.state("[]");
  let objectClassName = $.state(EMPTY_STRING2);
  let arrayClassName = $.state(EMPTY_STRING2);
  const getThingKey = (thing) => `${getCellOrValueType(thing)}:${(isObject(thing) || isArray(thing) ? jsonString : string)(thing)}`;
  $.user_effect(() => {
    const thingKey = getThingKey($$props.thing);
    if ($.get(currentThingKey) !== thingKey) {
      $.set(thingType, getCellOrValueType($$props.thing), true);
      $.set(currentThingKey, thingKey, true);
      if (isObject($$props.thing)) {
        $.set(objectThing, jsonString($$props.thing), true);
      } else if (isArray($$props.thing)) {
        $.set(arrayThing, jsonString($$props.thing), true);
      } else {
        $.set(stringThing, string($$props.thing), true);
        $.set(numberThing, number($$props.thing) || 0, true);
        $.set(booleanThing, boolean($$props.thing), true);
      }
    }
  });
  const handleThingChange = (nextThing, setTypedThing) => {
    setTypedThing(nextThing);
    $.set(currentThingKey, getThingKey(nextThing), true);
    $$props.onThingChange(nextThing);
  };
  const handleJsonThingChange = (value, setTypedThing, isThing, setTypedClassName) => {
    setTypedThing(value);
    try {
      const object2 = jsonParse(value);
      if (isThing(object2)) {
        $.set(currentThingKey, getThingKey(object2), true);
        $$props.onThingChange(object2);
        setTypedClassName(EMPTY_STRING2);
      }
    } catch {
      setTypedClassName(INVALID);
    }
  };
  const handleTypeChange = () => {
    if (!$$props.hasSchema?.()) {
      const nextType = getTypeCase(
        $.get(thingType),
        NUMBER,
        BOOLEAN,
        OBJECT,
        ARRAY,
        STRING
      );
      const nextThing = getTypeCase(
        nextType,
        $.get(stringThing),
        $.get(numberThing),
        $.get(booleanThing),
        tryReturn(() => jsonParse($.get(objectThing)), {}),
        tryReturn(() => jsonParse($.get(arrayThing)), [])
      );
      $.set(thingType, nextType, true);
      $.set(currentThingKey, getThingKey(nextThing), true);
      $$props.onThingChange(nextThing);
    }
  };
  const hasWidget = $.derived(
    () => getTypeCase($.get(thingType), 1, 1, 1, 1, 1) == 1
  );
  var div = root_4$2();
  var node = $.child(div);
  {
    var consequent = ($$anchor2) => {
      var button = root$k();
      var text2 = $.child(button, true);
      $.reset(button);
      $.template_effect(() => {
        $.set_attribute(button, "title", $.get(thingType));
        $.set_class(button, 1, $.clsx($.get(thingType)));
        $.set_text(text2, $.get(thingType));
      });
      $.delegated("click", button, handleTypeChange);
      $.append($$anchor2, button);
    };
    $.if(node, ($$render) => {
      if (showType() && $.get(hasWidget)) $$render(consequent);
    });
  }
  var node_1 = $.sibling(node);
  {
    var consequent_1 = ($$anchor2) => {
      var input = root_1$b();
      $.remove_input_defaults(input);
      $.template_effect(() => $.set_value(input, $.get(stringThing)));
      $.delegated(
        "input",
        input,
        (event2) => handleThingChange(
          string(event2.currentTarget.value),
          (value) => $.set(stringThing, value, true)
        )
      );
      $.append($$anchor2, input);
    };
    var consequent_2 = ($$anchor2) => {
      var input_1 = root_2$4();
      $.remove_input_defaults(input_1);
      $.template_effect(() => $.set_value(input_1, $.get(numberThing)));
      $.delegated(
        "input",
        input_1,
        (event2) => handleThingChange(
          number(event2.currentTarget.value || 0),
          (value) => $.set(numberThing, value, true)
        )
      );
      $.append($$anchor2, input_1);
    };
    var consequent_3 = ($$anchor2) => {
      var input_2 = root_3$3();
      $.remove_input_defaults(input_2);
      $.template_effect(() => $.set_checked(input_2, $.get(booleanThing)));
      $.delegated(
        "change",
        input_2,
        (event2) => handleThingChange(
          boolean(event2.currentTarget.checked),
          (value) => $.set(booleanThing, value, true)
        )
      );
      $.append($$anchor2, input_2);
    };
    var consequent_4 = ($$anchor2) => {
      var input_3 = root_1$b();
      $.remove_input_defaults(input_3);
      $.template_effect(() => {
        $.set_value(input_3, $.get(objectThing));
        $.set_class(input_3, 1, $.clsx($.get(objectClassName)));
      });
      $.delegated(
        "input",
        input_3,
        (event2) => handleJsonThingChange(
          event2.currentTarget.value,
          (value) => $.set(objectThing, value, true),
          isObject,
          (value) => $.set(objectClassName, value, true)
        )
      );
      $.append($$anchor2, input_3);
    };
    var consequent_5 = ($$anchor2) => {
      var input_4 = root_1$b();
      $.remove_input_defaults(input_4);
      $.template_effect(() => {
        $.set_value(input_4, $.get(arrayThing));
        $.set_class(input_4, 1, $.clsx($.get(arrayClassName)));
      });
      $.delegated(
        "input",
        input_4,
        (event2) => handleJsonThingChange(
          event2.currentTarget.value,
          (value) => $.set(arrayThing, value, true),
          isArray,
          (value) => $.set(arrayClassName, value, true)
        )
      );
      $.append($$anchor2, input_4);
    };
    $.if(node_1, ($$render) => {
      if ($.get(thingType) == STRING) $$render(consequent_1);
      else if ($.get(thingType) == NUMBER) $$render(consequent_2, 1);
      else if ($.get(thingType) == BOOLEAN) $$render(consequent_3, 2);
      else if ($.get(thingType) == OBJECT) $$render(consequent_4, 3);
      else if ($.get(thingType) == ARRAY) $$render(consequent_5, 4);
    });
  }
  $.reset(div);
  $.template_effect(() => $.set_class(div, 1, $.clsx($$props.className)));
  $.append($$anchor, div);
  $.pop();
}
$.delegate(["click", "input", "change"]);
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
    ...isString(labelOrCustomCell) ? { label: labelOrCustomCell } : labelOrCustomCell
  }));
};
var getExtraHeaders = (extraCells = [], after = 0) => arrayMap(extraCells, ({ label }, index2) => ({
  className: EXTRA,
  key: extraKey(index2, after),
  label
}));
function EditableCellView($$anchor, $$props) {
  $.push($$props, true);
  const cell = getCell(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.store
  );
  const resolvedStore = resolveStore(() => $$props.store);
  {
    let $0 = $.derived(() => $$props.className ?? EDITABLE + CELL);
    EditableThing($$anchor, {
      get thing() {
        return cell.current;
      },
      onThingChange: (thing) => cell.current = thing,
      get className() {
        return $.get($0);
      },
      get showType() {
        return $$props.showType;
      },
      hasSchema: () => resolvedStore()?.hasTablesSchema() ?? false
    });
  }
  $.pop();
}
function EditableValueView($$anchor, $$props) {
  $.push($$props, true);
  const value = getValue(
    () => $$props.valueId,
    () => $$props.store
  );
  const resolvedStore = resolveStore(() => $$props.store);
  {
    let $0 = $.derived(() => $$props.className ?? EDITABLE + VALUE);
    EditableThing($$anchor, {
      get thing() {
        return value.current;
      },
      onThingChange: (thing) => value.current = thing,
      get className() {
        return $.get($0);
      },
      get showType() {
        return $$props.showType;
      },
      hasSchema: () => resolvedStore()?.hasValuesSchema() ?? false
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
var root$j = $.from_html(`<td><!></td>`);
var root_1$a = $.from_html(`<th> </th> <th> </th>`, 1);
var root_2$3 = $.from_html(`<tr><!><!><!><!></tr>`);
function RelationshipInHtmlRow($$anchor, $$props) {
  $.push($$props, true);
  let extraCellsBefore = $.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $.prop($$props, "extraCellsAfter", 19, () => []);
  const remoteRowId = getRemoteRowId(
    () => $$props.relationshipId,
    () => $$props.localRowId,
    () => $$props.relationships
  );
  const cellEntries = $.derived(() => objEntries($$props.cells));
  const rowProps = $.derived(() => ({
    tableId: $$props.localTableId ?? "",
    rowId: $$props.localRowId,
    store: $$props.store
  }));
  var tr = root_2$3();
  var node = $.child(tr);
  $.each(
    node,
    19,
    extraCellsBefore,
    (extraCell, index2) => extraKey(index2, 0),
    ($$anchor2, extraCell) => {
      const ExtraCell = $.derived(() => $.get(extraCell).component);
      var td = root$j();
      var node_1 = $.child(td);
      $.component(
        node_1,
        () => $.get(ExtraCell),
        ($$anchor3, ExtraCell_1) => {
          ExtraCell_1(
            $$anchor3,
            $.spread_props(() => $.get(rowProps))
          );
        }
      );
      $.reset(td);
      $.template_effect(() => $.set_class(td, 1, $.clsx(EXTRA)));
      $.append($$anchor2, td);
    }
  );
  var node_2 = $.sibling(node);
  {
    var consequent = ($$anchor2) => {
      var fragment = root_1$a();
      var th = $.first_child(fragment);
      var text2 = $.child(th, true);
      $.reset(th);
      var th_1 = $.sibling(th, 2);
      var text_1 = $.child(th_1, true);
      $.reset(th_1);
      $.template_effect(() => {
        $.set_attribute(th, "title", $$props.localRowId);
        $.set_text(text2, $$props.localRowId);
        $.set_attribute(th_1, "title", remoteRowId.current);
        $.set_text(text_1, remoteRowId.current);
      });
      $.append($$anchor2, fragment);
    };
    var d = $.derived(() => !isFalse($$props.idColumn));
    $.if(node_2, ($$render) => {
      if ($.get(d)) $$render(consequent);
    });
  }
  var node_3 = $.sibling(node_2);
  $.each(
    node_3,
    17,
    () => $.get(cellEntries),
    (entry) => entry[0],
    ($$anchor2, entry) => {
      const compoundCellId = $.derived(() => $.get(entry)[0]);
      const cell = $.derived(() => $.get(entry)[1]);
      const CellComponent = $.derived(() => $.get(cell).component);
      const computed_const = $.derived(() => {
        const [tableId, cellId] = $.get(compoundCellId).split(".", 2);
        return { tableId, cellId };
      });
      const rowId = $.derived(
        () => $.get(computed_const).tableId === $$props.localTableId ? $$props.localRowId : $.get(computed_const).tableId === $$props.remoteTableId ? remoteRowId.current : void 0
      );
      var fragment_1 = $.comment();
      var node_4 = $.first_child(fragment_1);
      {
        var consequent_1 = ($$anchor3) => {
          var td_1 = root$j();
          var node_5 = $.child(td_1);
          {
            let $0 = $.derived(
              () => getProps(
                $.get(cell).getComponentProps,
                $.get(rowId),
                $.get(computed_const).cellId
              )
            );
            $.component(
              node_5,
              () => $.get(CellComponent),
              ($$anchor4, CellComponent_1) => {
                CellComponent_1(
                  $$anchor4,
                  $.spread_props(() => $.get($0), {
                    get store() {
                      return $$props.store;
                    },
                    get tableId() {
                      return $.get(computed_const).tableId;
                    },
                    get rowId() {
                      return $.get(rowId);
                    },
                    get cellId() {
                      return $.get(computed_const).cellId;
                    }
                  })
                );
              }
            );
          }
          $.reset(td_1);
          $.append($$anchor3, td_1);
        };
        var d_1 = $.derived(() => !isUndefined($.get(rowId)));
        $.if(node_4, ($$render) => {
          if ($.get(d_1)) $$render(consequent_1);
        });
      }
      $.append($$anchor2, fragment_1);
    }
  );
  var node_6 = $.sibling(node_3);
  $.each(
    node_6,
    19,
    extraCellsAfter,
    (extraCell, index2) => extraKey(index2, 1),
    ($$anchor2, extraCell) => {
      const ExtraCell = $.derived(() => $.get(extraCell).component);
      var td_2 = root$j();
      var node_7 = $.child(td_2);
      $.component(
        node_7,
        () => $.get(ExtraCell),
        ($$anchor3, ExtraCell_2) => {
          ExtraCell_2(
            $$anchor3,
            $.spread_props(() => $.get(rowProps))
          );
        }
      );
      $.reset(td_2);
      $.template_effect(() => $.set_class(td_2, 1, $.clsx(EXTRA)));
      $.append($$anchor2, td_2);
    }
  );
  $.reset(tr);
  $.append($$anchor, tr);
  $.pop();
}
var root$i = $.from_html(`<th> </th>`);
var root_1$9 = $.from_html(`<th> </th> <th> </th>`, 1);
var root_2$2 = $.from_html(`<thead><tr><!><!><!><!></tr></thead>`);
var root_3$2 = $.from_html(`<table><!><tbody></tbody></table>`);
function RelationshipInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let extraCellsBefore = $.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $.prop($$props, "extraCellsAfter", 19, () => []), idColumn = $.prop($$props, "idColumn", 3, true);
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
  const defaultCellComponent = $.derived(
    () => $$props.editable ? EditableCellView : CellView
  );
  const cells = $.derived(
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
      $.get(defaultCellComponent)
    )
  );
  const cellEntries = $.derived(() => objEntries($.get(cells)));
  const extraHeadersBefore = $.derived(
    () => getExtraHeaders(extraCellsBefore())
  );
  const extraHeadersAfter = $.derived(
    () => getExtraHeaders(extraCellsAfter(), 1)
  );
  var table = root_3$2();
  var node = $.child(table);
  {
    var consequent_1 = ($$anchor2) => {
      var thead = root_2$2();
      var tr = $.child(thead);
      var node_1 = $.child(tr);
      $.each(
        node_1,
        17,
        () => $.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root$i();
          var text2 = $.child(th, true);
          $.reset(th);
          $.template_effect(() => {
            $.set_class(th, 1, $.clsx($.get(extraHeader).className));
            $.set_text(text2, $.get(extraHeader).label);
          });
          $.append($$anchor3, th);
        }
      );
      var node_2 = $.sibling(node_1);
      {
        var consequent = ($$anchor3) => {
          var fragment = root_1$9();
          var th_1 = $.first_child(fragment);
          var text_1 = $.child(th_1);
          $.reset(th_1);
          var th_2 = $.sibling(th_1, 2);
          var text_2 = $.child(th_2);
          $.reset(th_2);
          $.template_effect(() => {
            $.set_text(text_1, `${relationship.localTableId ?? ""}.Id`);
            $.set_text(text_2, `${relationship.remoteTableId ?? ""}.Id`);
          });
          $.append($$anchor3, fragment);
        };
        var d = $.derived(() => !isFalse(idColumn()));
        $.if(node_2, ($$render) => {
          if ($.get(d)) $$render(consequent);
        });
      }
      var node_3 = $.sibling(node_2);
      $.each(
        node_3,
        17,
        () => $.get(cellEntries),
        (entry) => entry[0],
        ($$anchor3, entry) => {
          var th_3 = root$i();
          var text_3 = $.child(th_3, true);
          $.reset(th_3);
          $.template_effect(() => $.set_text(text_3, $.get(entry)[1].label));
          $.append($$anchor3, th_3);
        }
      );
      var node_4 = $.sibling(node_3);
      $.each(
        node_4,
        17,
        () => $.get(extraHeadersAfter),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th_4 = root$i();
          var text_4 = $.child(th_4, true);
          $.reset(th_4);
          $.template_effect(() => {
            $.set_class(th_4, 1, $.clsx($.get(extraHeader).className));
            $.set_text(text_4, $.get(extraHeader).label);
          });
          $.append($$anchor3, th_4);
        }
      );
      $.reset(tr);
      $.reset(thead);
      $.append($$anchor2, thead);
    };
    $.if(node, ($$render) => {
      if ($$props.headerRow !== false) $$render(consequent_1);
    });
  }
  var tbody = $.sibling(node);
  $.each(
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
          return $.get(cells);
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
  $.reset(tbody);
  $.reset(table);
  $.template_effect(() => $.set_class(table, 1, $.clsx($$props.className)));
  $.append($$anchor, table);
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
var root$h = $.from_html(`<caption><!></caption>`);
var root_1$8 = $.from_html(`<th> </th>`);
var root_2$1 = $.from_html(`<th><!> Id</th>`);
var root_3$1 = $.from_html(`<th><!> </th>`);
var root_4$1 = $.from_html(`<thead><tr><!><!><!><!></tr></thead>`);
var root_5$1 = $.from_html(`<td><!></td>`);
var root_6 = $.from_html(`<tr><!><!><!><!></tr>`);
var root_7 = $.from_html(`<table><!><!><tbody></tbody></table>`);
function HtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let extraCellsBefore = $.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $.prop($$props, "extraCellsAfter", 19, () => []);
  const cellEntries = $.derived(() => objEntries($$props.cells));
  const extraHeadersBefore = $.derived(
    () => getExtraHeaders(extraCellsBefore())
  );
  const extraHeadersAfter = $.derived(
    () => getExtraHeaders(extraCellsAfter(), 1)
  );
  const PaginatorComponent = $.derived(() => $$props.paginator?.component);
  const paginatorProps = $.derived(() => $$props.paginator?.props);
  var table = root_7();
  var node = $.child(table);
  {
    var consequent = ($$anchor2) => {
      var caption = root$h();
      var node_1 = $.child(caption);
      $.component(
        node_1,
        () => $.get(PaginatorComponent),
        ($$anchor3, PaginatorComponent_1) => {
          PaginatorComponent_1(
            $$anchor3,
            $.spread_props(() => $.get(paginatorProps))
          );
        }
      );
      $.reset(caption);
      $.append($$anchor2, caption);
    };
    $.if(node, ($$render) => {
      if ($.get(PaginatorComponent) && $.get(paginatorProps))
        $$render(consequent);
    });
  }
  var node_2 = $.sibling(node);
  {
    var consequent_4 = ($$anchor2) => {
      var thead = root_4$1();
      var tr = $.child(thead);
      var node_3 = $.child(tr);
      $.each(
        node_3,
        17,
        () => $.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_1$8();
          var text2 = $.child(th, true);
          $.reset(th);
          $.template_effect(() => {
            $.set_class(th, 1, $.clsx($.get(extraHeader).className));
            $.set_text(text2, $.get(extraHeader).label);
          });
          $.append($$anchor3, th);
        }
      );
      var node_4 = $.sibling(node_3);
      {
        var consequent_2 = ($$anchor3) => {
          var th_1 = root_2$1();
          var node_5 = $.child(th_1);
          {
            var consequent_1 = ($$anchor4) => {
              var text_1 = $.text();
              $.template_effect(
                () => $.set_text(
                  text_1,
                  ($$props.sortAndOffset[1] ? DOWN_ARROW : UP_ARROW) + " "
                )
              );
              $.append($$anchor4, text_1);
            };
            var d = $.derived(
              () => !isUndefined($$props.sortAndOffset) && $$props.sortAndOffset[0] == null
            );
            $.if(node_5, ($$render) => {
              if ($.get(d)) $$render(consequent_1);
            });
          }
          $.next();
          $.reset(th_1);
          $.template_effect(
            ($0) => $.set_class(th_1, 1, $0),
            [
              () => $.clsx(
                isUndefined($$props.sortAndOffset) || $$props.sortAndOffset[0] != null ? void 0 : `sorted ${$$props.sortAndOffset[1] ? "de" : "a"}scending`
              )
            ]
          );
          $.delegated("click", th_1, () => $$props.handleSort?.(void 0));
          $.append($$anchor3, th_1);
        };
        $.if(node_4, ($$render) => {
          if ($$props.idColumn !== false) $$render(consequent_2);
        });
      }
      var node_6 = $.sibling(node_4);
      $.each(
        node_6,
        17,
        () => $.get(cellEntries),
        (entry) => entry[0],
        ($$anchor3, entry) => {
          const cellId = $.derived(() => $.get(entry)[0]);
          const cell = $.derived(() => $.get(entry)[1]);
          var th_2 = root_3$1();
          var node_7 = $.child(th_2);
          {
            var consequent_3 = ($$anchor4) => {
              var text_2 = $.text();
              $.template_effect(
                () => $.set_text(
                  text_2,
                  ($$props.sortAndOffset[1] ? DOWN_ARROW : UP_ARROW) + " "
                )
              );
              $.append($$anchor4, text_2);
            };
            var d_1 = $.derived(
              () => !isUndefined($$props.sortAndOffset) && $$props.sortAndOffset[0] == $.get(cellId)
            );
            $.if(node_7, ($$render) => {
              if ($.get(d_1)) $$render(consequent_3);
            });
          }
          var text_3 = $.sibling(node_7);
          $.reset(th_2);
          $.template_effect(
            ($0) => {
              $.set_class(th_2, 1, $0);
              $.set_text(text_3, ` ${$.get(cell).label ?? ""}`);
            },
            [
              () => $.clsx(
                isUndefined($$props.sortAndOffset) || $$props.sortAndOffset[0] != $.get(cellId) ? void 0 : `sorted ${$$props.sortAndOffset[1] ? "de" : "a"}scending`
              )
            ]
          );
          $.delegated("click", th_2, () => $$props.handleSort?.($.get(cellId)));
          $.append($$anchor3, th_2);
        }
      );
      var node_8 = $.sibling(node_6);
      $.each(
        node_8,
        17,
        () => $.get(extraHeadersAfter),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th_3 = root_1$8();
          var text_4 = $.child(th_3, true);
          $.reset(th_3);
          $.template_effect(() => {
            $.set_class(th_3, 1, $.clsx($.get(extraHeader).className));
            $.set_text(text_4, $.get(extraHeader).label);
          });
          $.append($$anchor3, th_3);
        }
      );
      $.reset(tr);
      $.reset(thead);
      $.append($$anchor2, thead);
    };
    $.if(node_2, ($$render) => {
      if ($$props.headerRow !== false) $$render(consequent_4);
    });
  }
  var tbody = $.sibling(node_2);
  $.each(
    tbody,
    20,
    () => $$props.rowIds.current,
    (rowId) => rowId,
    ($$anchor2, rowId) => {
      const rowProps = $.derived(() => ({
        ...$$props.cellComponentProps,
        rowId
      }));
      var tr_1 = root_6();
      var node_9 = $.child(tr_1);
      $.each(
        node_9,
        19,
        extraCellsBefore,
        (extraCell, index2) => extraKey(index2, 0),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td = root_5$1();
          var node_10 = $.child(td);
          $.component(
            node_10,
            () => $.get(ExtraCell),
            ($$anchor4, ExtraCell_1) => {
              ExtraCell_1(
                $$anchor4,
                $.spread_props(() => $.get(rowProps))
              );
            }
          );
          $.reset(td);
          $.template_effect(() => $.set_class(td, 1, $.clsx(EXTRA)));
          $.append($$anchor3, td);
        }
      );
      var node_11 = $.sibling(node_9);
      {
        var consequent_5 = ($$anchor3) => {
          var th_4 = root_1$8();
          var text_5 = $.child(th_4, true);
          $.reset(th_4);
          $.template_effect(() => {
            $.set_attribute(th_4, "title", rowId);
            $.set_text(text_5, rowId);
          });
          $.append($$anchor3, th_4);
        };
        var d_2 = $.derived(() => !isFalse($$props.idColumn));
        $.if(node_11, ($$render) => {
          if ($.get(d_2)) $$render(consequent_5);
        });
      }
      var node_12 = $.sibling(node_11);
      $.each(
        node_12,
        17,
        () => $.get(cellEntries),
        (entry) => entry[0],
        ($$anchor3, entry) => {
          const cellId = $.derived(() => $.get(entry)[0]);
          const cell = $.derived(() => $.get(entry)[1]);
          const CellComponent = $.derived(() => $.get(cell).component);
          var td_1 = root_5$1();
          var node_13 = $.child(td_1);
          {
            let $0 = $.derived(
              () => getProps($.get(cell).getComponentProps, rowId, $.get(cellId))
            );
            $.component(
              node_13,
              () => $.get(CellComponent),
              ($$anchor4, CellComponent_1) => {
                CellComponent_1(
                  $$anchor4,
                  $.spread_props(
                    () => $.get($0),
                    () => $.get(rowProps),
                    {
                      get cellId() {
                        return $.get(cellId);
                      }
                    }
                  )
                );
              }
            );
          }
          $.reset(td_1);
          $.append($$anchor3, td_1);
        }
      );
      var node_14 = $.sibling(node_12);
      $.each(
        node_14,
        19,
        extraCellsAfter,
        (extraCell, index2) => extraKey(index2, 1),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td_2 = root_5$1();
          var node_15 = $.child(td_2);
          $.component(
            node_15,
            () => $.get(ExtraCell),
            ($$anchor4, ExtraCell_2) => {
              ExtraCell_2(
                $$anchor4,
                $.spread_props(() => $.get(rowProps))
              );
            }
          );
          $.reset(td_2);
          $.template_effect(() => $.set_class(td_2, 1, $.clsx(EXTRA)));
          $.append($$anchor3, td_2);
        }
      );
      $.reset(tr_1);
      $.append($$anchor2, tr_1);
    }
  );
  $.reset(tbody);
  $.reset(table);
  $.template_effect(() => $.set_class(table, 1, $.clsx($$props.className)));
  $.append($$anchor, table);
  $.pop();
}
$.delegate(["click"]);
var rest_excludes$3 = /* @__PURE__ */ new Set(["$$slots", "$$events", "$$legacy"]);
var root$g = $.from_html(
  `<button class="previous"></button><button class="next"></button> `,
  1
);
var root_1$7 = $.from_html(`<!> `, 1);
function SortedTablePaginator($$anchor, $$props) {
  $.push($$props, true);
  $.rest_props($$props, rest_excludes$3);
  const offset = $.derived(
    () => $$props.offset == null || $$props.offset > $$props.total || $$props.offset < 0 ? 0 : $$props.offset
  );
  const limit = $.derived(() => $$props.limit ?? $$props.total);
  const singular = $.derived(() => $$props.singular ?? "row");
  const plural = $.derived(() => $$props.plural ?? $.get(singular) + "s");
  const rangeLabel = $.derived(
    () => `${$.get(offset) + 1} to ${mathMin($$props.total, $.get(offset) + $.get(limit))} of `
  );
  const totalLabel = $.derived(
    () => `${$$props.total} ${$$props.total != 1 ? $.get(plural) : $.get(singular)}`
  );
  $.user_effect(() => {
    if (($$props.offset ?? 0) > $$props.total || ($$props.offset ?? 0) < 0) {
      $$props.onChange(0);
    }
  });
  var fragment = root_1$7();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var fragment_1 = root$g();
      var button = $.first_child(fragment_1);
      button.textContent = "\u2190";
      var button_1 = $.sibling(button);
      button_1.textContent = "\u2192";
      var text2 = $.sibling(button_1, 1, true);
      $.template_effect(() => {
        button.disabled = $.get(offset) == 0;
        button_1.disabled = $.get(offset) + $.get(limit) >= $$props.total;
        $.set_text(text2, $.get(rangeLabel));
      });
      $.delegated(
        "click",
        button,
        () => $$props.onChange($.get(offset) - $.get(limit))
      );
      $.delegated(
        "click",
        button_1,
        () => $$props.onChange($.get(offset) + $.get(limit))
      );
      $.append($$anchor2, fragment_1);
    };
    $.if(node, ($$render) => {
      if ($$props.total > $.get(limit)) $$render(consequent);
    });
  }
  var text_1 = $.sibling(node, 1, true);
  $.template_effect(() => $.set_text(text_1, $.get(totalLabel)));
  $.append($$anchor, fragment);
  $.pop();
}
$.delegate(["click"]);
var createSortingAndPagination = (getCellId, getDescending, getSortOnClick, getOffset, getLimit, getTotal, getPaginator, getOnChange) => {
  let currentCellId = $.state($.proxy(getCellId()));
  let currentDescending = $.state($.proxy(getDescending() ?? false));
  let currentOffset = $.state($.proxy(getOffset() ?? 0));
  const setState = (sortAndOffset) => {
    $.set(currentCellId, sortAndOffset[0], true);
    $.set(currentDescending, sortAndOffset[1], true);
    $.set(currentOffset, sortAndOffset[2], true);
    getOnChange()?.(sortAndOffset);
  };
  const handleSort = getSortOnClick() ? (nextCellId) => setState([
    nextCellId,
    nextCellId == $.get(currentCellId) ? !$.get(currentDescending) : false,
    $.get(currentOffset)
  ]) : void 0;
  const handleChangeOffset = (nextOffset) => setState([$.get(currentCellId), $.get(currentDescending), nextOffset]);
  const paginator = getPaginator();
  const PaginatorComponent = isTrue(paginator) ? SortedTablePaginator : paginator;
  return {
    get sortAndOffset() {
      return [
        $.get(currentCellId),
        $.get(currentDescending),
        $.get(currentOffset)
      ];
    },
    get handleSort() {
      return handleSort;
    },
    get paginator() {
      return isFalse(paginator) ? void 0 : {
        component: PaginatorComponent,
        props: {
          offset: $.get(currentOffset),
          limit: getLimit(),
          total: getTotal(),
          onChange: handleChangeOffset
        }
      };
    }
  };
};
var rest_excludes$2 = /* @__PURE__ */ new Set([
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
function ResultSortedTableInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let paginator = $.prop($$props, "paginator", 3, false), props = $.rest_props($$props, rest_excludes$2);
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
  const cells = $.derived(
    () => getCells(defaultCellIds.current, $$props.customCells, ResultCellView)
  );
  const cellComponentProps = $.derived(() => ({
    queries: $$props.queries,
    queryId: $$props.queryId
  }));
  HtmlTable(
    $$anchor,
    $.spread_props(() => props, {
      get cells() {
        return $.get(cells);
      },
      get cellComponentProps() {
        return $.get(cellComponentProps);
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
  $.pop();
}
var rest_excludes$1 = /* @__PURE__ */ new Set([
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
function SliceInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let props = $.rest_props($$props, rest_excludes$1);
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
  const defaultCellComponent = $.derived(
    () => $$props.editable ? EditableCellView : CellView
  );
  const cells = $.derived(
    () => getCells(
      defaultCellIds.current,
      $$props.customCells,
      $.get(defaultCellComponent)
    )
  );
  const cellComponentProps = $.derived(() => ({
    store: index2.store,
    tableId: index2.tableId
  }));
  HtmlTable(
    $$anchor,
    $.spread_props(() => props, {
      get cells() {
        return $.get(cells);
      },
      get cellComponentProps() {
        return $.get(cellComponentProps);
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
  $.pop();
}
var rest_excludes = /* @__PURE__ */ new Set([
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
function SortedTableInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let paginator = $.prop($$props, "paginator", 3, false), props = $.rest_props($$props, rest_excludes);
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
    void 0,
    () => $$props.store
  );
  const defaultCellComponent = $.derived(
    () => $$props.editable ? EditableCellView : CellView
  );
  const cells = $.derived(
    () => getCells(
      defaultCellIds.current,
      $$props.customCells,
      $.get(defaultCellComponent)
    )
  );
  const cellComponentProps = $.derived(() => ({
    store: $$props.store,
    tableId: $$props.tableId
  }));
  HtmlTable(
    $$anchor,
    $.spread_props(() => props, {
      get cells() {
        return $.get(cells);
      },
      get cellComponentProps() {
        return $.get(cellComponentProps);
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
var root$f = $.from_html(`<th> </th>`);
var root_1$6 = $.from_html(`<th>Id</th>`);
var root_2 = $.from_html(`<thead><tr><!><!><th> </th><!></tr></thead>`);
var root_3 = $.from_html(`<td><!></td>`);
var root_4 = $.from_html(`<tr><!><!><td><!></td><!></tr>`);
var root_5 = $.from_html(`<table><!><tbody></tbody></table>`);
function ValuesInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let editable = $.prop($$props, "editable", 3, false), extraCellsBefore = $.prop($$props, "extraCellsBefore", 19, () => []), extraCellsAfter = $.prop($$props, "extraCellsAfter", 19, () => []);
  const valueIds = getValueIds(() => $$props.store);
  const ValueComponent = $.derived(
    () => $$props.valueComponent ?? (editable() ? EditableValueView : ValueView)
  );
  const extraHeadersBefore = $.derived(
    () => getExtraHeaders(extraCellsBefore())
  );
  const extraHeadersAfter = $.derived(
    () => getExtraHeaders(extraCellsAfter(), 1)
  );
  var table = root_5();
  var node = $.child(table);
  {
    var consequent_1 = ($$anchor2) => {
      var thead = root_2();
      var tr = $.child(thead);
      var node_1 = $.child(tr);
      $.each(
        node_1,
        17,
        () => $.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root$f();
          var text2 = $.child(th, true);
          $.reset(th);
          $.template_effect(() => {
            $.set_class(th, 1, $.clsx($.get(extraHeader).className));
            $.set_text(text2, $.get(extraHeader).label);
          });
          $.append($$anchor3, th);
        }
      );
      var node_2 = $.sibling(node_1);
      {
        var consequent = ($$anchor3) => {
          var th_1 = root_1$6();
          $.append($$anchor3, th_1);
        };
        $.if(node_2, ($$render) => {
          if ($$props.idColumn !== false) $$render(consequent);
        });
      }
      var th_2 = $.sibling(node_2);
      var text_1 = $.child(th_2, true);
      $.reset(th_2);
      var node_3 = $.sibling(th_2);
      $.each(
        node_3,
        17,
        () => $.get(extraHeadersAfter),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th_3 = root$f();
          var text_2 = $.child(th_3, true);
          $.reset(th_3);
          $.template_effect(() => {
            $.set_class(th_3, 1, $.clsx($.get(extraHeader).className));
            $.set_text(text_2, $.get(extraHeader).label);
          });
          $.append($$anchor3, th_3);
        }
      );
      $.reset(tr);
      $.reset(thead);
      $.template_effect(() => $.set_text(text_1, VALUE));
      $.append($$anchor2, thead);
    };
    $.if(node, ($$render) => {
      if ($$props.headerRow !== false) $$render(consequent_1);
    });
  }
  var tbody = $.sibling(node);
  $.each(
    tbody,
    20,
    () => valueIds.current,
    (valueId) => valueId,
    ($$anchor2, valueId) => {
      const valueProps = $.derived(() => ({ valueId, store: $$props.store }));
      var tr_1 = root_4();
      var node_4 = $.child(tr_1);
      $.each(
        node_4,
        19,
        extraCellsBefore,
        (extraCell, index2) => extraKey(index2, 0),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td = root_3();
          var node_5 = $.child(td);
          $.component(
            node_5,
            () => $.get(ExtraCell),
            ($$anchor4, ExtraCell_1) => {
              ExtraCell_1(
                $$anchor4,
                $.spread_props(() => $.get(valueProps))
              );
            }
          );
          $.reset(td);
          $.template_effect(() => $.set_class(td, 1, $.clsx(EXTRA)));
          $.append($$anchor3, td);
        }
      );
      var node_6 = $.sibling(node_4);
      {
        var consequent_2 = ($$anchor3) => {
          var th_4 = root$f();
          var text_3 = $.child(th_4, true);
          $.reset(th_4);
          $.template_effect(() => {
            $.set_attribute(th_4, "title", valueId);
            $.set_text(text_3, valueId);
          });
          $.append($$anchor3, th_4);
        };
        var d = $.derived(() => !isFalse($$props.idColumn));
        $.if(node_6, ($$render) => {
          if ($.get(d)) $$render(consequent_2);
        });
      }
      var td_1 = $.sibling(node_6);
      var node_7 = $.child(td_1);
      {
        let $0 = $.derived(
          () => getProps($$props.getValueComponentProps, valueId)
        );
        $.component(
          node_7,
          () => $.get(ValueComponent),
          ($$anchor3, ValueComponent_1) => {
            ValueComponent_1(
              $$anchor3,
              $.spread_props(
                () => $.get($0),
                () => $.get(valueProps)
              )
            );
          }
        );
      }
      $.reset(td_1);
      var node_8 = $.sibling(td_1);
      $.each(
        node_8,
        19,
        extraCellsAfter,
        (extraCell, index2) => extraKey(index2, 1),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td_2 = root_3();
          var node_9 = $.child(td_2);
          $.component(
            node_9,
            () => $.get(ExtraCell),
            ($$anchor4, ExtraCell_2) => {
              ExtraCell_2(
                $$anchor4,
                $.spread_props(() => $.get(valueProps))
              );
            }
          );
          $.reset(td_2);
          $.template_effect(() => $.set_class(td_2, 1, $.clsx(EXTRA)));
          $.append($$anchor3, td_2);
        }
      );
      $.reset(tr_1);
      $.append($$anchor2, tr_1);
    }
  );
  $.reset(tbody);
  $.reset(table);
  $.template_effect(() => $.set_class(table, 1, $.clsx($$props.className)));
  $.append($$anchor, table);
  $.pop();
}
var maybeGet = (value) => isFunction(value) ? value() : value;
var getEditable = (uniqueId, s) => {
  const editable = getCell(
    () => STATE_TABLE,
    () => maybeGet(uniqueId),
    () => EDITABLE_CELL,
    () => maybeGet(s)
  );
  const handleEditable = (event2) => {
    editable.current = !editable.current;
    event2?.preventDefault();
  };
  return [editable, handleEditable];
};
function SliceView($$anchor, $$props) {
  $.push($$props, true);
  const uniqueId = $.derived(
    () => getUniqueId("i", $$props.indexesId, $$props.indexId, $$props.sliceId)
  );
  const title = $.derived(() => "Slice: " + $$props.sliceId);
  const [editable, handleEditable] = getEditable(
    () => $.get(uniqueId),
    () => $$props.s
  );
  Details($$anchor, {
    get uniqueId() {
      return $.get(uniqueId);
    },
    get title() {
      return $.get(title);
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
  $.pop();
}
function IndexView($$anchor, $$props) {
  $.push($$props, true);
  const sliceIds = getSliceIds(
    () => $$props.indexId,
    () => $$props.indexes
  );
  const title = $.derived(() => "Index: " + $$props.indexId);
  {
    let $0 = $.derived(
      () => getUniqueId("i", $$props.indexesId, $$props.indexId)
    );
    Details($$anchor, {
      get uniqueId() {
        return $.get($0);
      },
      get title() {
        return $.get(title);
      },
      get s() {
        return $$props.s;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = $.comment();
        var node = $.first_child(fragment_1);
        $.each(
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
        $.append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    });
  }
  $.pop();
}
function IndexesView($$anchor, $$props) {
  $.push($$props, true);
  const indexes = $.derived(() => getIndexes($$props.indexesId));
  const indexIds = getIndexIds(() => $.get(indexes));
  const sortedIndexIds = $.derived(
    () => sortedIdsMap(indexIds.current, (indexId) => indexId)
  );
  const title = $.derived(() => "Indexes: " + ($$props.indexesId ?? DEFAULT));
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $.derived(() => getUniqueId("i", $$props.indexesId));
        Details($$anchor2, {
          get uniqueId() {
            return $.get($0);
          },
          get title() {
            return $.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $.comment();
            var node_1 = $.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text2 = $.text("No indexes defined");
                $.append($$anchor4, text2);
              };
              var d = $.derived(() => arrayIsEmpty(indexIds.current));
              var alternate = ($$anchor4) => {
                var fragment_3 = $.comment();
                var node_2 = $.first_child(fragment_3);
                $.each(
                  node_2,
                  16,
                  () => $.get(sortedIndexIds),
                  (indexId) => indexId,
                  ($$anchor5, indexId) => {
                    IndexView($$anchor5, {
                      get indexes() {
                        return $.get(indexes);
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
                $.append($$anchor4, fragment_3);
              };
              $.if(node_1, ($$render) => {
                if ($.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $.derived(() => !isUndefined($.get(indexes)));
    $.if(node, ($$render) => {
      if ($.get(d_1)) $$render(consequent_1);
    });
  }
  $.append($$anchor, fragment);
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
var root$e = $.from_html(`<tr><th> </th><td> </td><td><!></td></tr>`);
var root_1$5 = $.from_html(
  `<table><thead><tr><th>Metric Id</th><th>Table Id</th><th>Metric</th></tr></thead><tbody></tbody></table>`
);
function MetricsView($$anchor, $$props) {
  $.push($$props, true);
  const metrics = $.derived(() => getMetrics($$props.metricsId));
  const metricIds = getMetricIds(() => $.get(metrics));
  const title = $.derived(() => "Metrics: " + ($$props.metricsId ?? DEFAULT));
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $.derived(() => getUniqueId("m", $$props.metricsId));
        Details($$anchor2, {
          get uniqueId() {
            return $.get($0);
          },
          get title() {
            return $.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $.comment();
            var node_1 = $.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text2 = $.text("No metrics defined");
                $.append($$anchor4, text2);
              };
              var d = $.derived(() => arrayIsEmpty(metricIds.current));
              var alternate = ($$anchor4) => {
                var table = root_1$5();
                var tbody = $.sibling($.child(table));
                $.each(
                  tbody,
                  20,
                  () => metricIds.current,
                  (metricId) => metricId,
                  ($$anchor5, metricId) => {
                    var tr = root$e();
                    var th = $.child(tr);
                    var text_1 = $.child(th, true);
                    $.reset(th);
                    var td = $.sibling(th);
                    var text_2 = $.child(td, true);
                    $.reset(td);
                    var td_1 = $.sibling(td);
                    var node_2 = $.child(td_1);
                    MetricView(node_2, {
                      get metricId() {
                        return metricId;
                      },
                      get metrics() {
                        return $.get(metrics);
                      }
                    });
                    $.reset(td_1);
                    $.reset(tr);
                    $.template_effect(
                      ($02) => {
                        $.set_attribute(th, "title", metricId);
                        $.set_text(text_1, metricId);
                        $.set_text(text_2, $02);
                      },
                      [() => $.get(metrics)?.getTableId(metricId)]
                    );
                    $.append($$anchor5, tr);
                  }
                );
                $.reset(tbody);
                $.reset(table);
                $.append($$anchor4, table);
              };
              $.if(node_1, ($$render) => {
                if ($.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $.derived(() => !isUndefined($.get(metrics)));
    $.if(node, ($$render) => {
      if ($.get(d_1)) $$render(consequent_1);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function QueryView($$anchor, $$props) {
  $.push($$props, true);
  const uniqueId = $.derived(
    () => getUniqueId("q", $$props.queriesId, $$props.queryId)
  );
  const sort = getCell(
    () => STATE_TABLE,
    () => $.get(uniqueId),
    () => SORT_CELL,
    () => $$props.s
  );
  const sortAndOffset = $.derived(() => jsonParse(sort.current ?? "[]"));
  const title = $.derived(() => "Query: " + $$props.queryId);
  const handleChange = (sortAndOffset2) => {
    sort.current = jsonStringWithMap(sortAndOffset2);
  };
  Details($$anchor, {
    get uniqueId() {
      return $.get(uniqueId);
    },
    get title() {
      return $.get(title);
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
          return $.get(sortAndOffset)[0];
        },
        get descending() {
          return $.get(sortAndOffset)[1];
        },
        get offset() {
          return $.get(sortAndOffset)[2];
        },
        limit: 10,
        paginator: true,
        sortOnClick: true,
        onChange: handleChange
      });
    },
    $$slots: { default: true }
  });
  $.pop();
}
function QueriesView($$anchor, $$props) {
  $.push($$props, true);
  const queries = $.derived(() => getQueries($$props.queriesId));
  const queryIds = getQueryIds(() => $.get(queries));
  const sortedQueryIds = $.derived(
    () => sortedIdsMap(queryIds.current, (queryId) => queryId)
  );
  const title = $.derived(() => "Queries: " + ($$props.queriesId ?? DEFAULT));
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $.derived(() => getUniqueId("q", $$props.queriesId));
        Details($$anchor2, {
          get uniqueId() {
            return $.get($0);
          },
          get title() {
            return $.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $.comment();
            var node_1 = $.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text2 = $.text("No queries defined");
                $.append($$anchor4, text2);
              };
              var d = $.derived(() => arrayIsEmpty(queryIds.current));
              var alternate = ($$anchor4) => {
                var fragment_3 = $.comment();
                var node_2 = $.first_child(fragment_3);
                $.each(
                  node_2,
                  16,
                  () => $.get(sortedQueryIds),
                  (queryId) => queryId,
                  ($$anchor5, queryId) => {
                    QueryView($$anchor5, {
                      get queries() {
                        return $.get(queries);
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
                $.append($$anchor4, fragment_3);
              };
              $.if(node_1, ($$render) => {
                if ($.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $.derived(() => !isUndefined($.get(queries)));
    $.if(node, ($$render) => {
      if ($.get(d_1)) $$render(consequent_1);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
function RelationshipView($$anchor, $$props) {
  $.push($$props, true);
  const uniqueId = $.derived(
    () => getUniqueId("r", $$props.relationshipsId, $$props.relationshipId)
  );
  const title = $.derived(() => "Relationship: " + $$props.relationshipId);
  const [editable, handleEditable] = getEditable(
    () => $.get(uniqueId),
    () => $$props.s
  );
  Details($$anchor, {
    get uniqueId() {
      return $.get(uniqueId);
    },
    get title() {
      return $.get(title);
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
  $.pop();
}
function RelationshipsView($$anchor, $$props) {
  $.push($$props, true);
  const relationships = $.derived(
    () => getRelationships($$props.relationshipsId)
  );
  const relationshipIds = getRelationshipIds(() => $.get(relationships));
  const sortedRelationshipIds = $.derived(
    () => sortedIdsMap(relationshipIds.current, (relationshipId) => relationshipId)
  );
  const title = $.derived(
    () => "Relationships: " + ($$props.relationshipsId ?? DEFAULT)
  );
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = $.derived(() => getUniqueId("r", $$props.relationshipsId));
        Details($$anchor2, {
          get uniqueId() {
            return $.get($0);
          },
          get title() {
            return $.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = $.comment();
            var node_1 = $.first_child(fragment_2);
            {
              var consequent = ($$anchor4) => {
                var text2 = $.text("No relationships defined");
                $.append($$anchor4, text2);
              };
              var d = $.derived(() => arrayIsEmpty(relationshipIds.current));
              var alternate = ($$anchor4) => {
                var fragment_3 = $.comment();
                var node_2 = $.first_child(fragment_3);
                $.each(
                  node_2,
                  16,
                  () => $.get(sortedRelationshipIds),
                  (relationshipId) => relationshipId,
                  ($$anchor5, relationshipId) => {
                    RelationshipView($$anchor5, {
                      get relationships() {
                        return $.get(relationships);
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
                $.append($$anchor4, fragment_3);
              };
              $.if(node_1, ($$render) => {
                if ($.get(d)) $$render(consequent);
                else $$render(alternate, -1);
              });
            }
            $.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d_1 = $.derived(() => !isUndefined($.get(relationships)));
    $.if(node, ($$render) => {
      if ($.get(d_1)) $$render(consequent_1);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root$d = $.from_html(
  `<div class="actions"><div><!></div> <div><!></div></div>`
);
function Actions($$anchor, $$props) {
  var div = root$d();
  var div_1 = $.child(div);
  var node = $.child(div_1);
  $.snippet(node, () => $$props.left ?? $.noop);
  $.reset(div_1);
  var div_2 = $.sibling(div_1, 2);
  var node_1 = $.child(div_2);
  $.snippet(node_1, () => $$props.right ?? $.noop);
  $.reset(div_2);
  $.reset(div);
  $.append($$anchor, div);
}
var root$c = $.from_html(` <img title="Confirm" class="ok" alt=""/>`, 1);
function Delete($$anchor, $$props) {
  $.push($$props, true);
  let prompt = $.prop($$props, "prompt", 3, "Delete");
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
  $.user_effect(() => {
    if (hasWindow()) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  });
  $.next();
  var fragment = root$c();
  var text2 = $.first_child(fragment);
  var img2 = $.sibling(text2);
  $.template_effect(() => $.set_text(text2, `${prompt() ?? ""}?  `));
  $.delegated("click", img2, handleClick);
  $.append($$anchor, fragment);
  $.pop();
}
$.delegate(["click"]);
var root$b = $.from_html(` <input type="text"/>  <img alt=""/>`, 1);
function NewId($$anchor, $$props) {
  $.push($$props, true);
  let prompt = $.prop($$props, "prompt", 3, "New Id");
  let input = $.state(void 0);
  const currentSuggestedId = $.derived(() => $$props.suggestedId);
  let newId = $.state("");
  let newIdOk = $.state(true);
  let previousSuggestedId = $.state(void 0);
  $.user_effect(() => {
    if ($.get(input)) {
      $.get(input).focus();
    }
  });
  $.user_effect(() => {
    if ($.get(currentSuggestedId) != $.get(previousSuggestedId)) {
      $.set(newId, $.get(currentSuggestedId), true);
      $.set(newIdOk, true);
      $.set(previousSuggestedId, $.get(currentSuggestedId), true);
    }
  });
  const handleNewIdChange = (event2) => {
    $.set(newId, event2.currentTarget.value, true);
    $.set(newIdOk, !$$props.has($.get(newId)));
  };
  const handleClick = () => {
    if ($$props.has($.get(newId))) {
      $.set(newIdOk, false);
    } else {
      $$props.set($.get(newId));
      $$props.onDone();
    }
  };
  const handleKeyDown = (event2) => {
    if (event2.key == "Enter") {
      event2.preventDefault();
      handleClick();
    }
  };
  $.next();
  var fragment = root$b();
  var text2 = $.first_child(fragment);
  var input_1 = $.sibling(text2);
  $.remove_input_defaults(input_1);
  $.bind_this(
    input_1,
    ($$value) => $.set(input, $$value),
    () => $.get(input)
  );
  var img2 = $.sibling(input_1, 2);
  $.template_effect(() => {
    $.set_text(text2, `${prompt() + ": "} `);
    $.set_value(input_1, $.get(newId));
    $.set_attribute(
      img2,
      "title",
      $.get(newIdOk) ? "Confirm" : "Id already exists"
    );
    $.set_class(img2, 1, $.clsx($.get(newIdOk) ? "ok" : "okDis"));
  });
  $.delegated("input", input_1, handleNewIdChange);
  $.delegated("keydown", input_1, handleKeyDown);
  $.delegated("click", img2, handleClick);
  $.append($$anchor, fragment);
  $.pop();
}
$.delegate(["input", "keydown", "click"]);
var isNewIdAction = (action) => "set" in action;
var root$a = $.from_html(`<!>  <img title="Cancel" class="cancel" alt=""/>`, 1);
var root_1$4 = $.from_html(`<img alt=""/>`);
function ConfirmableActions($$anchor, $$props) {
  $.push($$props, true);
  let confirming = $.state(void 0);
  const handleDone = () => {
    $.set(confirming, void 0);
  };
  const handleKeyDown = (event2) => {
    if (!isUndefined($.get(confirming)) && event2.key == "Escape") {
      event2.preventDefault();
      handleDone();
    }
  };
  $.user_effect(() => {
    if (!isUndefined($.get(confirming)) && hasWindow()) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  });
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      const action = $.derived(() => $$props.actions[$.get(confirming)]);
      var fragment_1 = root$a();
      var node_1 = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          NewId($$anchor3, {
            onDone: handleDone,
            get suggestedId() {
              return $.get(action).suggestedId;
            },
            get has() {
              return $.get(action).has;
            },
            get set() {
              return $.get(action).set;
            },
            get prompt() {
              return $.get(action).prompt;
            }
          });
        };
        var d = $.derived(() => isNewIdAction($.get(action)));
        var alternate = ($$anchor3) => {
          Delete($$anchor3, {
            onDone: handleDone,
            get onClick() {
              return $.get(action).onClick;
            },
            get prompt() {
              return $.get(action).prompt;
            }
          });
        };
        $.if(node_1, ($$render) => {
          if ($.get(d)) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      var img2 = $.sibling(node_1, 2);
      $.delegated("click", img2, handleDone);
      $.append($$anchor2, fragment_1);
    };
    var d_1 = $.derived(() => !isUndefined($.get(confirming)));
    var alternate_1 = ($$anchor2) => {
      var fragment_4 = $.comment();
      var node_2 = $.first_child(fragment_4);
      $.each(
        node_2,
        17,
        () => $$props.actions,
        $.index,
        ($$anchor3, action, index2) => {
          var img_1 = root_1$4();
          $.template_effect(() => {
            $.set_attribute(img_1, "title", $.get(action).title);
            $.set_class(img_1, 1, $.clsx($.get(action).icon));
          });
          $.delegated("click", img_1, () => $.set(confirming, index2, true));
          $.append($$anchor3, img_1);
        }
      );
      $.append($$anchor2, fragment_4);
    };
    $.if(node, ($$render) => {
      if ($.get(d_1)) $$render(consequent_1);
      else $$render(alternate_1, -1);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
$.delegate(["click"]);
function TablesActions($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
  const tableIds = getTableIds(() => $$props.store);
  const has = (tableId) => getStore2()?.hasTable(tableId) ?? false;
  const addActions = $.derived(() => [
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
  const rightActions = $.derived(
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
          return $.get(addActions);
        }
      });
    };
    const right = ($$anchor2) => {
      var fragment_2 = $.comment();
      var node = $.first_child(fragment_2);
      {
        var consequent = ($$anchor3) => {
          ConfirmableActions($$anchor3, {
            get actions() {
              return $.get(rightActions);
            }
          });
        };
        $.if(node, ($$render) => {
          if ($.get(rightActions).length > 0) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment_2);
    };
    Actions($$anchor, { left, right });
  }
  $.pop();
}
$.from_html(`<!><!>`, 1);
$.from_html(`<!><!><!>`, 1);
$.from_html(`<!><!><!>`, 1);
function RowActions($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
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
  const actions = $.derived(() => [
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
      return $.get(actions);
    }
  });
  $.pop();
}
function TableActions1($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
  const rowIds = getRowIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const has = (rowId) => getStore2()?.hasRow($$props.tableId, rowId) ?? false;
  const actions = $.derived(() => [
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
      return $.get(actions);
    }
  });
  $.pop();
}
function TableActions2($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
  const tableIds = getTableIds(() => $$props.store);
  const has = (nextTableId) => getStore2()?.hasTable(nextTableId) ?? false;
  const actions = $.derived(() => [
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
      return $.get(actions);
    }
  });
  $.pop();
}
function CellActions($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
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
  $.pop();
}
var root$9 = $.from_html(`<!> <!>`, 1);
function EditableCellViewWithActions($$anchor, $$props) {
  $.push($$props, true);
  const cellExists = hasCell(
    () => $$props.tableId,
    () => $$props.rowId,
    () => $$props.cellId,
    () => $$props.store
  );
  var fragment = root$9();
  var node = $.first_child(fragment);
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
  var node_1 = $.sibling(node, 2);
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
    $.if(node_1, ($$render) => {
      if (cellExists.current) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root$8 = $.from_html(`<!> <!>`, 1);
function TableView($$anchor, $$props) {
  $.push($$props, true);
  const uniqueId = $.derived(
    () => getUniqueId("t", $$props.storeId, $$props.tableId)
  );
  const tableCellIds = getTableCellIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const sort = getCell(
    () => STATE_TABLE,
    () => $.get(uniqueId),
    () => SORT_CELL,
    () => $$props.s
  );
  const [editable, handleEditable] = getEditable(
    () => $.get(uniqueId),
    () => $$props.s
  );
  const sortAndOffset = $.derived(() => jsonParse(sort.current ?? "[]"));
  const title = $.derived(() => "Table: " + $$props.tableId);
  const CellComponent = $.derived(
    () => editable.current ? EditableCellViewWithActions : CellView
  );
  const customCells = $.derived(
    () => objNew(
      arrayMap(tableCellIds.current, (cellId) => [
        cellId,
        { label: cellId, component: $.get(CellComponent) }
      ])
    )
  );
  const rowActions = [{ label: "", component: RowActions }];
  const handleChange = (sortAndOffset2) => {
    sort.current = jsonStringWithMap(sortAndOffset2);
  };
  Details($$anchor, {
    get uniqueId() {
      return $.get(uniqueId);
    },
    get title() {
      return $.get(title);
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
      var fragment_1 = root$8();
      var node = $.first_child(fragment_1);
      {
        let $0 = $.derived(() => editable.current ? rowActions : []);
        SortedTableInHtmlTable(node, {
          get tableId() {
            return $$props.tableId;
          },
          get store() {
            return $$props.store;
          },
          get cellId() {
            return $.get(sortAndOffset)[0];
          },
          get descending() {
            return $.get(sortAndOffset)[1];
          },
          get offset() {
            return $.get(sortAndOffset)[2];
          },
          limit: 10,
          paginator: true,
          sortOnClick: true,
          onChange: handleChange,
          get editable() {
            return editable.current;
          },
          get extraCellsAfter() {
            return $.get($0);
          },
          get customCells() {
            return $.get(customCells);
          }
        });
      }
      var node_1 = $.sibling(node, 2);
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
        $.if(node_1, ($$render) => {
          if (editable.current) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  $.pop();
}
var root$7 = $.from_html(`<p>No tables.</p>`);
var root_1$3 = $.from_html(`<!> <!>`, 1);
function TablesView($$anchor, $$props) {
  $.push($$props, true);
  const uniqueId = $.derived(() => getUniqueId("ts", $$props.storeId));
  const tableIds = getTableIds(() => $$props.store);
  const [editable, handleEditable] = getEditable(
    () => $.get(uniqueId),
    () => $$props.s
  );
  const sortedTableIds = $.derived(
    () => sortedIdsMap(tableIds.current, (tableId) => tableId)
  );
  Details($$anchor, {
    get uniqueId() {
      return $.get(uniqueId);
    },
    get title() {
      return TABLES;
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
      var node = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          var p = root$7();
          $.append($$anchor3, p);
        };
        var d = $.derived(() => arrayIsEmpty(tableIds.current));
        var alternate = ($$anchor3) => {
          var fragment_2 = $.comment();
          var node_1 = $.first_child(fragment_2);
          $.each(
            node_1,
            16,
            () => $.get(sortedTableIds),
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
          $.append($$anchor3, fragment_2);
        };
        $.if(node, ($$render) => {
          if ($.get(d)) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      var node_2 = $.sibling(node, 2);
      {
        var consequent_1 = ($$anchor3) => {
          TablesActions($$anchor3, {
            get store() {
              return $$props.store;
            }
          });
        };
        $.if(node_2, ($$render) => {
          if (editable.current) $$render(consequent_1);
        });
      }
      $.append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  $.pop();
}
function ValueActions($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
  const valueIds = getValueIds(() => $$props.store);
  const has = (nextValueId) => getStore2()?.hasValue(nextValueId) ?? false;
  const actions = $.derived(() => [
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
      return $.get(actions);
    }
  });
  $.pop();
}
function ValuesActions($$anchor, $$props) {
  $.push($$props, true);
  const getStore2 = resolveStore(() => $$props.store);
  const valueIds = getValueIds(() => $$props.store);
  const has = (valueId) => getStore2()?.hasValue(valueId) ?? false;
  const addActions = $.derived(() => [
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
  const rightActions = $.derived(
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
          return $.get(addActions);
        }
      });
    };
    const right = ($$anchor2) => {
      var fragment_2 = $.comment();
      var node = $.first_child(fragment_2);
      {
        var consequent = ($$anchor3) => {
          ConfirmableActions($$anchor3, {
            get actions() {
              return $.get(rightActions);
            }
          });
        };
        $.if(node, ($$render) => {
          if ($.get(rightActions).length > 0) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment_2);
    };
    Actions($$anchor, { left, right });
  }
  $.pop();
}
var root$6 = $.from_html(`<p>No values.</p>`);
var root_1$2 = $.from_html(`<!> <!>`, 1);
function ValuesView($$anchor, $$props) {
  $.push($$props, true);
  const uniqueId = $.derived(() => getUniqueId("v", $$props.storeId));
  const valueIds = getValueIds(() => $$props.store);
  const [editable, handleEditable] = getEditable(
    () => $.get(uniqueId),
    () => $$props.s
  );
  const valueActions = [{ label: "", component: ValueActions }];
  Details($$anchor, {
    get uniqueId() {
      return $.get(uniqueId);
    },
    get title() {
      return VALUES;
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
      var fragment_1 = root_1$2();
      var node = $.first_child(fragment_1);
      {
        var consequent = ($$anchor3) => {
          var p = root$6();
          $.append($$anchor3, p);
        };
        var d = $.derived(() => arrayIsEmpty(valueIds.current));
        var alternate = ($$anchor3) => {
          {
            let $0 = $.derived(() => editable.current ? valueActions : []);
            ValuesInHtmlTable($$anchor3, {
              get store() {
                return $$props.store;
              },
              get editable() {
                return editable.current;
              },
              get extraCellsAfter() {
                return $.get($0);
              }
            });
          }
        };
        $.if(node, ($$render) => {
          if ($.get(d)) $$render(consequent);
          else $$render(alternate, -1);
        });
      }
      var node_1 = $.sibling(node, 2);
      {
        var consequent_1 = ($$anchor3) => {
          ValuesActions($$anchor3, {
            get store() {
              return $$props.store;
            }
          });
        };
        $.if(node_1, ($$render) => {
          if (editable.current) $$render(consequent_1);
        });
      }
      $.append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  $.pop();
}
var root$5 = $.from_html(`<!> <!>`, 1);
function StoreView($$anchor, $$props) {
  $.push($$props, true);
  const store = $.derived(() => getStore($$props.storeId));
  const title = $.derived(
    () => ($.get(store)?.isMergeable() ? "Mergeable" : "") + "Store: " + ($$props.storeId ?? DEFAULT)
  );
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      {
        let $0 = $.derived(() => getUniqueId("s", $$props.storeId));
        Details($$anchor2, {
          get uniqueId() {
            return $.get($0);
          },
          get title() {
            return $.get(title);
          },
          get s() {
            return $$props.s;
          },
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = root$5();
            var node_1 = $.first_child(fragment_2);
            ValuesView(node_1, {
              get store() {
                return $.get(store);
              },
              get storeId() {
                return $$props.storeId;
              },
              get s() {
                return $$props.s;
              }
            });
            var node_2 = $.sibling(node_1, 2);
            TablesView(node_2, {
              get store() {
                return $.get(store);
              },
              get storeId() {
                return $$props.storeId;
              },
              get s() {
                return $$props.s;
              }
            });
            $.append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    var d = $.derived(() => !isUndefined($.get(store)));
    $.if(node, ($$render) => {
      if ($.get(d)) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root$4 = $.from_html(`<span class="warn"> </span>`);
var root_1$1 = $.from_html(
  `<article><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></article>`
);
function Body($$anchor, $$props) {
  $.push($$props, true);
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
  let article = $.state(void 0);
  let scrolled = $.state(false);
  let idleCallback = 0;
  $.user_effect(() => {
    const articleElement = $.get(article);
    const { scrollLeft = 0, scrollTop = 0 } = values.current;
    if (articleElement && !$.get(scrolled)) {
      const observer = new MutationObserver(() => {
        if (articleElement.scrollWidth >= mathFloor(number(scrollLeft)) + articleElement.clientWidth && articleElement.scrollHeight >= mathFloor(number(scrollTop)) + articleElement.clientHeight) {
          articleElement.scrollTo(number(scrollLeft), number(scrollTop));
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
      $.set(scrolled, true);
      $$props.s.setPartialValues({ scrollLeft, scrollTop });
    });
  };
  const noProvidedObjects = $.derived(
    () => isUndefined(store) && arrayIsEmpty(storeIds.current) && isUndefined(metrics) && arrayIsEmpty(metricsIds.current) && isUndefined(indexes) && arrayIsEmpty(indexesIds.current) && isUndefined(relationships) && arrayIsEmpty(relationshipsIds.current) && isUndefined(queries) && arrayIsEmpty(queriesIds.current)
  );
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var span = root$4();
      var text2 = $.child(span, true);
      $.reset(span);
      $.template_effect(() => $.set_text(text2, NO_PROVIDED_OBJECTS_MESSAGE));
      $.append($$anchor2, span);
    };
    var alternate = ($$anchor2) => {
      var article_1 = root_1$1();
      var node_1 = $.child(article_1);
      StoreView(node_1, {
        get s() {
          return $$props.s;
        }
      });
      var node_2 = $.sibling(node_1, 2);
      $.each(
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
      var node_3 = $.sibling(node_2, 2);
      MetricsView(node_3, {
        get s() {
          return $$props.s;
        }
      });
      var node_4 = $.sibling(node_3, 2);
      $.each(
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
      var node_5 = $.sibling(node_4, 2);
      IndexesView(node_5, {
        get s() {
          return $$props.s;
        }
      });
      var node_6 = $.sibling(node_5, 2);
      $.each(
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
      var node_7 = $.sibling(node_6, 2);
      RelationshipsView(node_7, {
        get s() {
          return $$props.s;
        }
      });
      var node_8 = $.sibling(node_7, 2);
      $.each(
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
      var node_9 = $.sibling(node_8, 2);
      QueriesView(node_9, {
        get s() {
          return $$props.s;
        }
      });
      var node_10 = $.sibling(node_9, 2);
      $.each(
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
      $.reset(article_1);
      $.bind_this(
        article_1,
        ($$value) => $.set(article, $$value),
        () => $.get(article)
      );
      $.event("scroll", article_1, handleScroll);
      $.append($$anchor2, article_1);
    };
    $.if(node, ($$render) => {
      if ($.get(noProvidedObjects)) $$render(consequent);
      else $$render(alternate, -1);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root$3 = $.from_html(`<span class="warn"> </span>`);
function ErrorBoundary($$anchor, $$props) {
  const handleError = (error) => console.error(error);
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    const failed = ($$anchor2, _error = $.noop, _reset = $.noop) => {
      var span = root$3();
      var text2 = $.child(span, true);
      $.reset(span);
      $.template_effect(() => $.set_text(text2, INSPECTOR_ERROR_MESSAGE));
      $.append($$anchor2, span);
    };
    $.boundary(node, { onerror: handleError, failed }, ($$anchor2) => {
      var fragment_1 = $.comment();
      var node_1 = $.first_child(fragment_1);
      $.snippet(node_1, () => $$props.children);
      $.append($$anchor2, fragment_1);
    });
  }
  $.append($$anchor, fragment);
}
var root$2 = $.from_html(`<img tabindex="0" alt=""/>`);
var root_1 = $.from_html(
  `<header><img class="flat" tabindex="0" alt=""/> <span> </span> <!>  <img class="flat" title="Close" tabindex="0" alt=""/></header>`
);
function Header($$anchor, $$props) {
  $.push($$props, true);
  const position = getValue(
    () => POSITION_VALUE,
    () => $$props.s
  );
  const handleClick = () => open("https://tinybase.org", "_blank");
  const handleClose = () => $$props.s.setValue(OPEN_VALUE, false);
  const handleDock = (event2) => $$props.s.setValue(POSITION_VALUE, number(event2.currentTarget.dataset.id));
  const onKeyDown = (event2, handle) => {
    if (event2.key == "Enter" || event2.key == " ") {
      event2.preventDefault();
      handle();
    }
  };
  var header = root_1();
  var img2 = $.child(header);
  var span = $.sibling(img2, 2);
  var text2 = $.child(span, true);
  $.reset(span);
  var node = $.sibling(span, 2);
  $.each(
    node,
    17,
    () => POSITIONS,
    $.index,
    ($$anchor2, name, p) => {
      var fragment = $.comment();
      var node_1 = $.first_child(fragment);
      {
        var consequent = ($$anchor3) => {
          var img_1 = root$2();
          $.set_attribute(img_1, "data-id", p);
          $.template_effect(
            () => $.set_attribute(img_1, "title", "Dock to " + $.get(name))
          );
          $.delegated("click", img_1, handleDock);
          $.delegated(
            "keydown",
            img_1,
            (event2) => onKeyDown(event2, () => $$props.s.setValue(POSITION_VALUE, p))
          );
          $.append($$anchor3, img_1);
        };
        $.if(node_1, ($$render) => {
          if (p != (position.current ?? 1)) $$render(consequent);
        });
      }
      $.append($$anchor2, fragment);
    }
  );
  var img_2 = $.sibling(node, 2);
  $.reset(header);
  $.template_effect(() => {
    $.set_attribute(img2, "title", TITLE);
    $.set_text(text2, TITLE);
  });
  $.delegated("click", img2, handleClick);
  $.delegated("keydown", img2, (event2) => onKeyDown(event2, handleClick));
  $.delegated("click", img_2, handleClose);
  $.delegated("keydown", img_2, (event2) => onKeyDown(event2, handleClose));
  $.append($$anchor, header);
  $.pop();
}
$.delegate(["click", "keydown"]);
var root$1 = $.from_html(`<main><!> <!></main>`);
function Panel($$anchor, $$props) {
  $.push($$props, true);
  const position = getValue(
    () => POSITION_VALUE,
    () => $$props.s
  );
  const open2 = getValue(
    () => OPEN_VALUE,
    () => $$props.s
  );
  var fragment = $.comment();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var main = root$1();
      var node_1 = $.child(main);
      Header(node_1, {
        get s() {
          return $$props.s;
        }
      });
      var node_2 = $.sibling(node_1, 2);
      ErrorBoundary(node_2, {
        children: ($$anchor3, $$slotProps) => {
          Body($$anchor3, {
            get s() {
              return $$props.s;
            }
          });
        }
      });
      $.reset(main);
      $.template_effect(
        () => $.set_attribute(main, "data-position", position.current ?? 1)
      );
      $.append($$anchor2, main);
    };
    $.if(node, ($$render) => {
      if (open2.current) $$render(consequent);
    });
  }
  $.append($$anchor, fragment);
  $.pop();
}
var root = $.from_html(`<aside><!> <!></aside>`);
function Inspector($$anchor, $$props) {
  $.push($$props, true);
  let position = $.prop($$props, "position", 3, "right"), open2 = $.prop($$props, "open", 3, false), hue = $.prop($$props, "hue", 3, 270);
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
  var aside = root();
  $.head("17us0pj", ($$anchor2) => {
    var fragment = $.comment();
    var node = $.first_child(fragment);
    $.html(node, () => `<style>${APP_STYLESHEET}</style>`);
    $.append($$anchor2, fragment);
  });
  var node_1 = $.child(aside);
  Nub(node_1, {
    get s() {
      return s;
    }
  });
  var node_2 = $.sibling(node_1, 2);
  Panel(node_2, {
    get s() {
      return s;
    }
  });
  $.reset(aside);
  $.template_effect(() => {
    $.set_attribute(aside, "id", UNIQUE_ID);
    $.set_style(aside, `--hue:${hue()}`);
  });
  $.append($$anchor, aside);
  $.pop();
}
export {
  Inspector
};
