// dist/ui-svelte-dom/index.js
import { getContext } from "https://esm.sh/svelte@^5.55.5";
import * as $ from "https://esm.sh/svelte@^5.55.5/internal/client";
import "https://esm.sh/svelte@^5.55.5/internal/disclose-version";
import { createSubscriber } from "https://esm.sh/svelte@^5.55.5/reactivity";
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
var NULL = "null";
var LISTENER = "Listener";
var RESULT = "Result";
var GET = "get";
var ADD = "add";
var IDS = "Ids";
var TABLE = "Table";
var ROW = "Row";
var ROW_COUNT = ROW + "Count";
var ROW_IDS = ROW + IDS;
var SORTED_ROW_IDS = "Sorted" + ROW + IDS;
var CELL = "Cell";
var CELL_IDS = CELL + IDS;
var VALUE = "Value";
var VALUE_IDS = VALUE + IDS;
var SLICE = "Slice";
var REMOTE_ROW_ID = "Remote" + ROW + "Id";
var EXTRA = "extra";
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL = globalThis;
var math = Math;
var mathMin = math.min;
var isFiniteNumber = isFinite;
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
var noop = () => {
};
var tryReturn = (tryF, catchReturn) => {
  try {
    return tryF();
  } catch {
    return catchReturn;
  }
};
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
var objNew = (entries = []) => object.fromEntries(entries);
var objGet = (obj, id) => ifNotUndefined(obj, (obj2) => obj2[id]);
var objToArray = (obj, cb) => arrayMap(objEntries(obj), ([id, value]) => cb(value, id));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));
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
var OFFSET_STORE = 0;
var OFFSET_INDEXES = 2;
var OFFSET_RELATIONSHIPS = 3;
var OFFSET_QUERIES = 4;
var maybeGet = (thing) => isFunction(thing) ? thing() : thing;
var getContextValue = () => getContext(TINYBASE_CONTEXT_KEY) ?? [];
var getThing = (contextValue, thingOrThingId, offset) => isUndefined(thingOrThingId) ? contextValue[offset * 2] : isString(thingOrThingId) ? objGet(contextValue[offset * 2 + 1], thingOrThingId) : thingOrThingId;
var resolveProvidedThing = (thingOrThingId, offset) => {
  const contextValue = getContextValue();
  return () => getThing(contextValue, maybeGet(thingOrThingId), offset);
};
var resolveStore = (storeOrStoreId) => resolveProvidedThing(storeOrStoreId, OFFSET_STORE);
var resolveIndexes = (indexesOrIndexesId) => resolveProvidedThing(indexesOrIndexesId, OFFSET_INDEXES);
var resolveRelationships = (relationshipsOrRelationshipsId) => resolveProvidedThing(relationshipsOrRelationshipsId, OFFSET_RELATIONSHIPS);
var resolveQueries = (queriesOrQueriesId) => resolveProvidedThing(queriesOrQueriesId, OFFSET_QUERIES);
var createListenable = (getThing2, listenable, defaultValue, getArgs = () => EMPTY_ARR, isHas) => {
  const getListenableMethod = GET + listenable;
  const addListenableMethod = ADD + "" + listenable + LISTENER;
  let subscribe = $.state($.proxy(noop));
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
var getTableCellIds = (tableId, storeOrStoreId) => createListenable(
  resolveStore(storeOrStoreId),
  TABLE + CELL_IDS,
  EMPTY_ARR,
  () => [maybeGet(tableId)]
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
var getCell = (tableId, rowId, cellId, storeOrStoreId) => {
  const getStore2 = resolveStore(storeOrStoreId);
  let subscribe = $.state($.proxy(noop));
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
var getValueIds = (storeOrStoreId) => createListenable(resolveStore(storeOrStoreId), VALUE_IDS, EMPTY_ARR);
var getValue = (valueId, storeOrStoreId) => {
  const getStore2 = resolveStore(storeOrStoreId);
  let subscribe = $.state($.proxy(noop));
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
var getResultCell = (queryId, rowId, cellId, queriesOrQueriesId) => createListenable(
  resolveQueries(queriesOrQueriesId),
  RESULT + CELL,
  void 0,
  () => [maybeGet(queryId), maybeGet(rowId), maybeGet(cellId)]
);
var getRemoteRowId = (relationshipId, localRowId, relationshipsOrRelationshipsId) => createListenable(
  resolveRelationships(relationshipsOrRelationshipsId),
  REMOTE_ROW_ID,
  void 0,
  () => [maybeGet(relationshipId), maybeGet(localRowId)]
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
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
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
var getTypeCase = (type, stringCase, numberCase, booleanCase, objectCase, arrayCase) => type == STRING ? stringCase : type == NUMBER ? numberCase : type == BOOLEAN ? booleanCase : type == OBJECT ? objectCase : type == ARRAY ? arrayCase : null;
var root_1$5 = $.from_html(`<button> </button>`);
var root_2$4 = $.from_html(`<input/>`);
var root_3$3 = $.from_html(`<input type="number"/>`);
var root_4$4 = $.from_html(`<input type="checkbox"/>`);
var root_5$3 = $.from_html(`<input/>`);
var root_6$2 = $.from_html(`<input/>`);
var root$5 = $.from_html(`<div><!><!></div>`);
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
  const getThingKey = (thing) => `${getCellOrValueType(thing)}:${isObject(thing) || isArray(thing) ? jsonString(thing) : String(thing)}`;
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
        $.set(stringThing, String($$props.thing), true);
        $.set(numberThing, Number($$props.thing) || 0, true);
        $.set(booleanThing, Boolean($$props.thing), true);
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
  var div = root$5();
  var node = $.child(div);
  {
    var consequent = ($$anchor2) => {
      var button = root_1$5();
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
      var input = root_2$4();
      $.remove_input_defaults(input);
      $.template_effect(() => $.set_value(input, $.get(stringThing)));
      $.delegated(
        "input",
        input,
        (event) => handleThingChange(
          String(event.currentTarget.value),
          (value) => $.set(stringThing, value, true)
        )
      );
      $.append($$anchor2, input);
    };
    var consequent_2 = ($$anchor2) => {
      var input_1 = root_3$3();
      $.remove_input_defaults(input_1);
      $.template_effect(() => $.set_value(input_1, $.get(numberThing)));
      $.delegated(
        "input",
        input_1,
        (event) => handleThingChange(
          Number(event.currentTarget.value || 0),
          (value) => $.set(numberThing, value, true)
        )
      );
      $.append($$anchor2, input_1);
    };
    var consequent_3 = ($$anchor2) => {
      var input_2 = root_4$4();
      $.remove_input_defaults(input_2);
      $.template_effect(() => $.set_checked(input_2, $.get(booleanThing)));
      $.delegated(
        "change",
        input_2,
        (event) => handleThingChange(
          Boolean(event.currentTarget.checked),
          (value) => $.set(booleanThing, value, true)
        )
      );
      $.append($$anchor2, input_2);
    };
    var consequent_4 = ($$anchor2) => {
      var input_3 = root_5$3();
      $.remove_input_defaults(input_3);
      $.template_effect(() => {
        $.set_value(input_3, $.get(objectThing));
        $.set_class(input_3, 1, $.clsx($.get(objectClassName)));
      });
      $.delegated(
        "input",
        input_3,
        (event) => handleJsonThingChange(
          event.currentTarget.value,
          (value) => $.set(objectThing, value, true),
          isObject,
          (value) => $.set(objectClassName, value, true)
        )
      );
      $.append($$anchor2, input_3);
    };
    var consequent_5 = ($$anchor2) => {
      var input_4 = root_6$2();
      $.remove_input_defaults(input_4);
      $.template_effect(() => {
        $.set_value(input_4, $.get(arrayThing));
        $.set_class(input_4, 1, $.clsx($.get(arrayClassName)));
      });
      $.delegated(
        "input",
        input_4,
        (event) => handleJsonThingChange(
          event.currentTarget.value,
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
var extraKey = (index, after) => (after ? ">" : "<") + index;
var getProps = (getComponentProps, ...ids) => getComponentProps == null ? {} : getComponentProps(...ids);
var getCells = (defaultCellIds, customCells, defaultCellComponent) => {
  const cellIds = customCells ?? defaultCellIds;
  const source = isArray(cellIds) ? objNew(arrayMap(cellIds, (cellId) => [cellId, cellId])) : cellIds;
  return objMap(source, (labelOrCustomCell, cellId) => ({
    ...{ label: cellId, component: defaultCellComponent },
    ...isString(labelOrCustomCell) ? { label: labelOrCustomCell } : labelOrCustomCell
  }));
};
var getExtraHeaders = (extraCells = [], after = 0) => arrayMap(extraCells, ({ label }, index) => ({
  className: EXTRA,
  key: extraKey(index, after),
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
var root_1$4 = $.from_html(`<td><!></td>`);
var root_2$3 = $.from_html(`<th> </th> <th> </th>`, 1);
var root_4$3 = $.from_html(`<td><!></td>`);
var root_5$2 = $.from_html(`<td><!></td>`);
var root$4 = $.from_html(`<tr><!><!><!><!></tr>`);
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
  var tr = root$4();
  var node = $.child(tr);
  $.each(
    node,
    19,
    extraCellsBefore,
    (extraCell, index) => extraKey(index, 0),
    ($$anchor2, extraCell) => {
      const ExtraCell = $.derived(() => $.get(extraCell).component);
      var td = root_1$4();
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
      var fragment = root_2$3();
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
          var td_1 = root_4$3();
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
    (extraCell, index) => extraKey(index, 1),
    ($$anchor2, extraCell) => {
      const ExtraCell = $.derived(() => $.get(extraCell).component);
      var td_2 = root_5$2();
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
var root_2$2 = $.from_html(`<th> </th>`);
var root_3$2 = $.from_html(`<th> </th> <th> </th>`, 1);
var root_4$2 = $.from_html(`<th> </th>`);
var root_5$1 = $.from_html(`<th> </th>`);
var root_1$3 = $.from_html(`<thead><tr><!><!><!><!></tr></thead>`);
var root$3 = $.from_html(`<table><!><tbody></tbody></table>`);
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
  var table = root$3();
  var node = $.child(table);
  {
    var consequent_1 = ($$anchor2) => {
      var thead = root_1$3();
      var tr = $.child(thead);
      var node_1 = $.child(tr);
      $.each(
        node_1,
        17,
        () => $.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_2$2();
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
          var fragment = root_3$2();
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
          var th_3 = root_4$2();
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
          var th_4 = root_5$1();
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
var root_1$2 = $.from_html(`<caption><!></caption>`);
var root_3$1 = $.from_html(`<th> </th>`);
var root_4$1 = $.from_html(`<th><!> Id</th>`);
var root_6$1 = $.from_html(`<th><!> </th>`);
var root_8$1 = $.from_html(`<th> </th>`);
var root_2$1 = $.from_html(`<thead><tr><!><!><!><!></tr></thead>`);
var root_10 = $.from_html(`<td><!></td>`);
var root_11 = $.from_html(`<th> </th>`);
var root_12 = $.from_html(`<td><!></td>`);
var root_13 = $.from_html(`<td><!></td>`);
var root_9 = $.from_html(`<tr><!><!><!><!></tr>`);
var root$2 = $.from_html(`<table><!><!><tbody></tbody></table>`);
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
  var table = root$2();
  var node = $.child(table);
  {
    var consequent = ($$anchor2) => {
      var caption = root_1$2();
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
      var thead = root_2$1();
      var tr = $.child(thead);
      var node_3 = $.child(tr);
      $.each(
        node_3,
        17,
        () => $.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_3$1();
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
          var th_1 = root_4$1();
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
          var th_2 = root_6$1();
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
          var th_3 = root_8$1();
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
      var tr_1 = root_9();
      var node_9 = $.child(tr_1);
      $.each(
        node_9,
        19,
        extraCellsBefore,
        (extraCell, index) => extraKey(index, 0),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td = root_10();
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
          var th_4 = root_11();
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
          var td_1 = root_12();
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
        (extraCell, index) => extraKey(index, 1),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td_2 = root_13();
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
var root_1$1 = $.from_html(
  `<button class="previous"></button><button class="next"></button> `,
  1
);
var root$1 = $.from_html(`<!> `, 1);
function SortedTablePaginator($$anchor, $$props) {
  $.push($$props, true);
  $.rest_props($$props, ["$$slots", "$$events", "$$legacy"]);
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
  var fragment = root$1();
  var node = $.first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var fragment_1 = root_1$1();
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
function ResultSortedTableInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let paginator = $.prop($$props, "paginator", 3, false), props = $.rest_props($$props, [
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
function ResultTableInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let props = $.rest_props($$props, [
    "$$slots",
    "$$events",
    "$$legacy",
    "queryId",
    "queries",
    "customCells",
    "extraCellsBefore",
    "extraCellsAfter"
  ]);
  const defaultCellIds = getResultTableCellIds(
    () => $$props.queryId,
    () => $$props.queries
  );
  const rowIds = getResultRowIds(
    () => $$props.queryId,
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
      }
    })
  );
  $.pop();
}
function SliceInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let props = $.rest_props($$props, [
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
  const index = getIndexStoreTableId(
    () => $$props.indexes,
    () => $$props.indexId
  );
  const defaultCellIds = getTableCellIds(
    () => index.tableId,
    () => index.store
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
    store: index.store,
    tableId: index.tableId
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
function SortedTableInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let paginator = $.prop($$props, "paginator", 3, false), props = $.rest_props($$props, [
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
function TableInHtmlTable($$anchor, $$props) {
  $.push($$props, true);
  let props = $.rest_props($$props, [
    "$$slots",
    "$$events",
    "$$legacy",
    "tableId",
    "store",
    "editable",
    "customCells",
    "extraCellsBefore",
    "extraCellsAfter"
  ]);
  const defaultCellIds = getTableCellIds(
    () => $$props.tableId,
    () => $$props.store
  );
  const rowIds = getRowIds(
    () => $$props.tableId,
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
var root_2 = $.from_html(`<th> </th>`);
var root_3 = $.from_html(`<th>Id</th>`);
var root_4 = $.from_html(`<th> </th>`);
var root_1 = $.from_html(`<thead><tr><!><!><th> </th><!></tr></thead>`);
var root_6 = $.from_html(`<td><!></td>`);
var root_7 = $.from_html(`<th> </th>`);
var root_8 = $.from_html(`<td><!></td>`);
var root_5 = $.from_html(`<tr><!><!><td><!></td><!></tr>`);
var root = $.from_html(`<table><!><tbody></tbody></table>`);
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
  var table = root();
  var node = $.child(table);
  {
    var consequent_1 = ($$anchor2) => {
      var thead = root_1();
      var tr = $.child(thead);
      var node_1 = $.child(tr);
      $.each(
        node_1,
        17,
        () => $.get(extraHeadersBefore),
        (extraHeader) => extraHeader.key,
        ($$anchor3, extraHeader) => {
          var th = root_2();
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
          var th_1 = root_3();
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
          var th_3 = root_4();
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
      var tr_1 = root_5();
      var node_4 = $.child(tr_1);
      $.each(
        node_4,
        19,
        extraCellsBefore,
        (extraCell, index) => extraKey(index, 0),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td = root_6();
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
          var th_4 = root_7();
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
        (extraCell, index) => extraKey(index, 1),
        ($$anchor3, extraCell) => {
          const ExtraCell = $.derived(() => $.get(extraCell).component);
          var td_2 = root_8();
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
