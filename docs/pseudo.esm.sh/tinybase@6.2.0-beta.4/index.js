// dist/index.js
var getTypeOf = (thing) => typeof thing;
var EMPTY_STRING = "";
var STRING = getTypeOf(EMPTY_STRING);
var BOOLEAN = getTypeOf(true);
var NUMBER = getTypeOf(0);
var FUNCTION = getTypeOf(getTypeOf);
var TYPE = "type";
var DEFAULT = "default";
var SUM = "sum";
var AVG = "avg";
var MIN = "min";
var MAX = "max";
var LISTENER = "Listener";
var RESULT = "Result";
var GET = "get";
var SET = "set";
var ADD = "add";
var DEL = "del";
var HAS = "Has";
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
var id = (key) => EMPTY_STRING + key;
var strStartsWith = (str, prefix) => str.startsWith(prefix);
var strEndsWith = (str, suffix) => str.endsWith(suffix);
var strSplit = (str, separator = EMPTY_STRING, limit) => str.split(separator, limit);
var GLOBAL = globalThis;
var math = Math;
var mathMax = math.max;
var mathMin = math.min;
var mathFloor = math.floor;
var isFiniteNumber = isFinite;
var isInstanceOf = (thing, cls) => thing instanceof cls;
var isUndefined = (thing) => thing == void 0;
var ifNotUndefined = (value, then, otherwise) => isUndefined(value) ? otherwise?.() : then(value);
var isTypeStringOrBoolean = (type) => type == STRING || type == BOOLEAN;
var isString = (thing) => getTypeOf(thing) == STRING;
var isFunction = (thing) => getTypeOf(thing) == FUNCTION;
var isArray = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var getUndefined = () => void 0;
var noop = () => {
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
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayIsSorted = (array, sorter) => arrayEvery(
  array,
  (value, index) => index == 0 || sorter(array[index - 1], value) <= 0
);
var arraySort = (array, sorter) => array.sort(sorter);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayMap = (array, cb) => array.map(cb);
var arraySum = (array) => arrayReduce(array, (i, j) => i + j, 0);
var arrayIsEmpty = (array) => size(array) == 0;
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayClear = (array, to) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayPop = (array) => array.pop();
var arrayUnshift = (array, ...values) => array.unshift(...values);
var arrayShift = (array) => array.shift();
var getCellOrValueType = (cellOrValue) => {
  const type = getTypeOf(cellOrValue);
  return isTypeStringOrBoolean(type) || type == NUMBER && isFiniteNumber(cellOrValue) ? type : void 0;
};
var isCellOrValueOrNullOrUndefined = (cellOrValue) => isUndefined(cellOrValue) || !isUndefined(getCellOrValueType(cellOrValue));
var setOrDelCell = (store, tableId, rowId, cellId, cell) => isUndefined(cell) ? store.delCell(tableId, rowId, cellId, true) : store.setCell(tableId, rowId, cellId, cell);
var setOrDelValue = (store, valueId, value) => isUndefined(value) ? store.delValue(valueId) : store.setValue(valueId, value);
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
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objFrozen = object.isFrozen;
var objEntries = object.entries;
var isObject = (obj) => !isUndefined(obj) && ifNotUndefined(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isUndefined(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds = object.keys;
var objFreeze = object.freeze;
var objNew = (entries = []) => object.fromEntries(entries);
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
var objEnsure = (obj, id2, getDefaultValue) => {
  if (!objHas(obj, id2)) {
    obj[id2] = getDefaultValue();
  }
  return obj[id2];
};
var objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
  if (isUndefined(obj) || !isObject(obj) || !emptyIsValid && objIsEmpty(obj) || objFrozen(obj)) {
    onInvalidObj?.();
    return false;
  }
  objForEach(obj, (child, id2) => {
    if (!validateChild(child, id2)) {
      objDel(obj, id2);
    }
  });
  return emptyIsValid ? true : !objIsEmpty(obj);
};
var mapNew = (entries) => new Map(entries);
var mapKeys = (map) => [...map?.keys() ?? []];
var mapGet = (map, key) => map?.get(key);
var mapForEach = (map, cb) => collForEach(map, (value, key) => cb(key, value));
var mapMap = (coll, cb) => arrayMap([...coll?.entries() ?? []], ([key, value]) => cb(value, key));
var mapSet = (map, key, value) => isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
var mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map, key)) {
    mapSet(map, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map, key));
  }
  return mapGet(map, key);
};
var mapMatch = (map, obj, set, del = mapSet) => {
  objMap(obj, (value, id2) => set(map, id2, value));
  mapForEach(map, (id2) => objHas(obj, id2) ? 0 : del(map, id2));
  return map;
};
var mapToObj = (map, valueMapper, excludeMapValue, excludeObjValue) => {
  const obj = {};
  collForEach(map, (mapValue, id2) => {
    if (!excludeMapValue?.(mapValue, id2)) {
      const objValue = valueMapper ? valueMapper(mapValue, id2) : mapValue;
      if (!excludeObjValue?.(objValue)) {
        obj[id2] = objValue;
      }
    }
  });
  return obj;
};
var mapToObj2 = (map, valueMapper, excludeMapValue) => mapToObj(
  map,
  (childMap) => mapToObj(childMap, valueMapper, excludeMapValue),
  collIsEmpty,
  objIsEmpty
);
var mapToObj3 = (map, valueMapper, excludeMapValue) => mapToObj(
  map,
  (childMap) => mapToObj2(childMap, valueMapper, excludeMapValue),
  collIsEmpty,
  objIsEmpty
);
var mapClone = (map, mapValue) => {
  const map2 = mapNew();
  collForEach(map, (value, key) => map2.set(key, mapValue?.(value) ?? value));
  return map2;
};
var mapClone2 = (map) => mapClone(map, mapClone);
var mapClone3 = (map) => mapClone(map, mapClone2);
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
var setNew = (entryOrEntries) => new Set(
  isArray(entryOrEntries) || isUndefined(entryOrEntries) ? entryOrEntries : [entryOrEntries]
);
var setAdd = (set, value) => set?.add(value);
var getDefinableFunctions = (store, getDefaultThing, validateRowValue, addListener, callListeners) => {
  const hasRow = store.hasRow;
  const tableIds = mapNew();
  const things = mapNew();
  const thingIdListeners = mapNew();
  const allRowValues = mapNew();
  const allSortKeys = mapNew();
  const storeListenerIds = mapNew();
  const getStore = () => store;
  const getThingIds = () => mapKeys(tableIds);
  const forEachThing = (cb) => mapForEach(things, cb);
  const hasThing = (id2) => collHas(things, id2);
  const getTableId = (id2) => mapGet(tableIds, id2);
  const getThing = (id2) => mapGet(things, id2);
  const setThing = (id2, thing) => mapSet(things, id2, thing);
  const addStoreListeners = (id2, andCall, ...listenerIds) => {
    const set = mapEnsure(storeListenerIds, id2, setNew);
    arrayForEach(
      listenerIds,
      (listenerId) => setAdd(set, listenerId) && andCall && store.callListener(listenerId)
    );
    return listenerIds;
  };
  const delStoreListeners = (id2, ...listenerIds) => ifNotUndefined(mapGet(storeListenerIds, id2), (allListenerIds) => {
    arrayForEach(
      arrayIsEmpty(listenerIds) ? collValues(allListenerIds) : listenerIds,
      (listenerId) => {
        store.delListener(listenerId);
        collDel(allListenerIds, listenerId);
      }
    );
    if (collIsEmpty(allListenerIds)) {
      mapSet(storeListenerIds, id2);
    }
  });
  const setDefinition = (id2, tableId) => {
    mapSet(tableIds, id2, tableId);
    if (!collHas(things, id2)) {
      mapSet(things, id2, getDefaultThing());
      mapSet(allRowValues, id2, mapNew());
      mapSet(allSortKeys, id2, mapNew());
      callListeners(thingIdListeners);
    }
  };
  const setDefinitionAndListen = (id2, tableId, onChanged, getRowValue, getSortKey) => {
    setDefinition(id2, tableId);
    const changedRowValues = mapNew();
    const changedSortKeys = mapNew();
    const rowValues = mapGet(allRowValues, id2);
    const sortKeys = mapGet(allSortKeys, id2);
    const processRow = (rowId) => {
      const getCell = (cellId) => store.getCell(tableId, rowId, cellId);
      const oldRowValue = mapGet(rowValues, rowId);
      const newRowValue = hasRow(tableId, rowId) ? validateRowValue(getRowValue(getCell, rowId)) : void 0;
      if (!(oldRowValue === newRowValue || isArray(oldRowValue) && isArray(newRowValue) && arrayIsEqual(oldRowValue, newRowValue))) {
        mapSet(changedRowValues, rowId, [oldRowValue, newRowValue]);
      }
      if (!isUndefined(getSortKey)) {
        const oldSortKey = mapGet(sortKeys, rowId);
        const newSortKey = hasRow(tableId, rowId) ? getSortKey(getCell, rowId) : void 0;
        if (oldSortKey != newSortKey) {
          mapSet(changedSortKeys, rowId, newSortKey);
        }
      }
    };
    const processTable = (force) => {
      onChanged(
        () => {
          collForEach(
            changedRowValues,
            ([, newRowValue], rowId) => mapSet(rowValues, rowId, newRowValue)
          );
          collForEach(
            changedSortKeys,
            (newSortKey, rowId) => mapSet(sortKeys, rowId, newSortKey)
          );
        },
        changedRowValues,
        changedSortKeys,
        rowValues,
        sortKeys,
        force
      );
      collClear(changedRowValues);
      collClear(changedSortKeys);
    };
    mapForEach(rowValues, processRow);
    if (store.hasTable(tableId)) {
      arrayForEach(store.getRowIds(tableId), (rowId) => {
        if (!collHas(rowValues, rowId)) {
          processRow(rowId);
        }
      });
    }
    processTable(true);
    delStoreListeners(id2);
    addStoreListeners(
      id2,
      0,
      store.addRowListener(
        tableId,
        null,
        (_store, _tableId, rowId) => processRow(rowId)
      ),
      store.addTableListener(tableId, () => processTable())
    );
  };
  const delDefinition = (id2) => {
    mapSet(tableIds, id2);
    mapSet(things, id2);
    mapSet(allRowValues, id2);
    mapSet(allSortKeys, id2);
    delStoreListeners(id2);
    callListeners(thingIdListeners);
  };
  const addThingIdsListener = (listener) => addListener(listener, thingIdListeners);
  const destroy = () => mapForEach(storeListenerIds, delDefinition);
  return [
    getStore,
    getThingIds,
    forEachThing,
    hasThing,
    getTableId,
    getThing,
    setThing,
    setDefinition,
    setDefinitionAndListen,
    delDefinition,
    addThingIdsListener,
    destroy,
    addStoreListeners,
    delStoreListeners
  ];
};
var getRowCellFunction = (getRowCell, defaultCellValue) => isString(getRowCell) ? (getCell) => getCell(getRowCell) : getRowCell ?? (() => defaultCellValue ?? EMPTY_STRING);
var getCreateFunction = (getFunction, initFunction) => {
  const thingsByStore = /* @__PURE__ */ new WeakMap();
  return (store) => {
    if (!thingsByStore.has(store)) {
      thingsByStore.set(store, getFunction(store));
    }
    const thing = thingsByStore.get(store);
    initFunction?.(thing);
    return thing;
  };
};
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
var getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING]) => {
  const leaves = [];
  const deep = (node, p) => p == size(path) ? arrayPush(leaves, node) : path[p] === null ? collForEach(node, (node2) => deep(node2, p + 1)) : arrayForEach([path[p], null], (id2) => deep(mapGet(node, id2), p + 1));
  deep(deepIdSet, 0);
  return leaves;
};
var getListenerFunctions = (getThing) => {
  let thing;
  const [getId, releaseId] = getPoolFunctions();
  const allListeners = mapNew();
  const addListener = (listener, idSetNode, path, pathGetters = [], extraArgsGetter = () => []) => {
    thing ??= getThing();
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
    (set) => collForEach(
      set,
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
        const index = size(ids);
        if (index == size(path)) {
          listener(thing, ...ids, ...extraArgsGetter(ids));
        } else if (isUndefined(path[index])) {
          arrayForEach(
            pathGetters[index]?.(...ids) ?? [],
            (id22) => callWithIds(...ids, id22)
          );
        } else {
          callWithIds(...ids, path[index]);
        }
      };
      callWithIds();
    }
  );
  return [addListener, callListeners, delListener, callListener];
};
var createCheckpoints = getCreateFunction(
  (store) => {
    let backwardIdsSize = 100;
    let currentId;
    let cellsDelta = mapNew();
    let valuesDelta = mapNew();
    let listening = 1;
    let nextCheckpointId;
    let checkpointsChanged;
    const checkpointIdsListeners = mapNew();
    const checkpointListeners = mapNew();
    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => checkpoints
    );
    const deltas = mapNew();
    const labels = mapNew();
    const backwardIds = [];
    const forwardIds = [];
    const updateStore = (oldOrNew, checkpointId) => {
      listening = 0;
      store.transaction(() => {
        const [cellsDelta2, valuesDelta2] = mapGet(deltas, checkpointId);
        collForEach(
          cellsDelta2,
          (table, tableId) => collForEach(
            table,
            (row, rowId) => collForEach(
              row,
              (oldNew, cellId) => setOrDelCell(store, tableId, rowId, cellId, oldNew[oldOrNew])
            )
          )
        );
        collForEach(
          valuesDelta2,
          (oldNew, valueId) => setOrDelValue(store, valueId, oldNew[oldOrNew])
        );
      });
      listening = 1;
    };
    const clearCheckpointId = (checkpointId) => {
      mapSet(deltas, checkpointId);
      mapSet(labels, checkpointId);
      callListeners(checkpointListeners, [checkpointId]);
    };
    const clearCheckpointIds = (checkpointIds, to) => arrayForEach(
      arrayClear(checkpointIds, to ?? size(checkpointIds)),
      clearCheckpointId
    );
    const trimBackwardsIds = () => clearCheckpointIds(backwardIds, size(backwardIds) - backwardIdsSize);
    const storeChanged = () => ifNotUndefined(currentId, () => {
      arrayPush(backwardIds, currentId);
      trimBackwardsIds();
      clearCheckpointIds(forwardIds);
      currentId = void 0;
      checkpointsChanged = 1;
    });
    const storeUnchanged = () => {
      currentId = arrayPop(backwardIds);
      checkpointsChanged = 1;
    };
    let cellListenerId;
    let valueListenerId;
    const addCheckpointImpl = (label = EMPTY_STRING) => {
      if (isUndefined(currentId)) {
        currentId = EMPTY_STRING + nextCheckpointId++;
        mapSet(deltas, currentId, [cellsDelta, valuesDelta]);
        setCheckpoint(currentId, label);
        cellsDelta = mapNew();
        valuesDelta = mapNew();
        checkpointsChanged = 1;
      }
      return currentId;
    };
    const goBackwardImpl = () => {
      if (!arrayIsEmpty(backwardIds)) {
        arrayUnshift(forwardIds, addCheckpointImpl());
        updateStore(0, currentId);
        currentId = arrayPop(backwardIds);
        checkpointsChanged = 1;
      }
    };
    const goForwardImpl = () => {
      if (!arrayIsEmpty(forwardIds)) {
        arrayPush(backwardIds, currentId);
        currentId = arrayShift(forwardIds);
        updateStore(1, currentId);
        checkpointsChanged = 1;
      }
    };
    const callListenersIfChanged = () => {
      if (checkpointsChanged) {
        callListeners(checkpointIdsListeners);
        checkpointsChanged = 0;
      }
    };
    const setSize = (size2) => {
      backwardIdsSize = size2;
      trimBackwardsIds();
      return checkpoints;
    };
    const addCheckpoint = (label) => {
      const id2 = addCheckpointImpl(label);
      callListenersIfChanged();
      return id2;
    };
    const setCheckpoint = (checkpointId, label) => {
      if (hasCheckpoint(checkpointId) && mapGet(labels, checkpointId) !== label) {
        mapSet(labels, checkpointId, label);
        callListeners(checkpointListeners, [checkpointId]);
      }
      return checkpoints;
    };
    const getStore = () => store;
    const getCheckpointIds = () => [
      [...backwardIds],
      currentId,
      [...forwardIds]
    ];
    const forEachCheckpoint = (checkpointCallback) => mapForEach(labels, checkpointCallback);
    const hasCheckpoint = (checkpointId) => collHas(deltas, checkpointId);
    const getCheckpoint = (checkpointId) => mapGet(labels, checkpointId);
    const goBackward = () => {
      goBackwardImpl();
      callListenersIfChanged();
      return checkpoints;
    };
    const goForward = () => {
      goForwardImpl();
      callListenersIfChanged();
      return checkpoints;
    };
    const goTo = (checkpointId) => {
      const action = arrayHas(backwardIds, checkpointId) ? goBackwardImpl : arrayHas(forwardIds, checkpointId) ? goForwardImpl : null;
      while (!isUndefined(action) && checkpointId != currentId) {
        action();
      }
      callListenersIfChanged();
      return checkpoints;
    };
    const addCheckpointIdsListener = (listener) => addListener(listener, checkpointIdsListeners);
    const addCheckpointListener = (checkpointId, listener) => addListener(listener, checkpointListeners, [checkpointId]);
    const delListener = (listenerId) => {
      delListenerImpl(listenerId);
      return checkpoints;
    };
    const clear = () => {
      clearCheckpointIds(backwardIds);
      clearCheckpointIds(forwardIds);
      if (!isUndefined(currentId)) {
        clearCheckpointId(currentId);
      }
      currentId = void 0;
      nextCheckpointId = 0;
      addCheckpoint();
      return checkpoints;
    };
    const clearForward = () => {
      if (!arrayIsEmpty(forwardIds)) {
        clearCheckpointIds(forwardIds);
        callListeners(checkpointIdsListeners);
      }
      return checkpoints;
    };
    const destroy = () => {
      store.delListener(cellListenerId);
      store.delListener(valueListenerId);
    };
    const getListenerStats = () => ({
      checkpointIds: collSize2(checkpointIdsListeners),
      checkpoint: collSize2(checkpointListeners)
    });
    const _registerListeners = () => {
      cellListenerId = store.addCellListener(
        null,
        null,
        null,
        (_store, tableId, rowId, cellId, newCell, oldCell) => {
          if (listening) {
            storeChanged();
            const table = mapEnsure(cellsDelta, tableId, mapNew);
            const row = mapEnsure(table, rowId, mapNew);
            const oldNew = mapEnsure(row, cellId, () => [oldCell, void 0]);
            oldNew[1] = newCell;
            if (oldNew[0] === newCell && collIsEmpty(mapSet(row, cellId)) && collIsEmpty(mapSet(table, rowId)) && collIsEmpty(mapSet(cellsDelta, tableId))) {
              storeUnchanged();
            }
            callListenersIfChanged();
          }
        }
      );
      valueListenerId = store.addValueListener(
        null,
        (_store, valueId, newValue, oldValue) => {
          if (listening) {
            storeChanged();
            const oldNew = mapEnsure(valuesDelta, valueId, () => [
              oldValue,
              void 0
            ]);
            oldNew[1] = newValue;
            if (oldNew[0] === newValue && collIsEmpty(mapSet(valuesDelta, valueId))) {
              storeUnchanged();
            }
            callListenersIfChanged();
          }
        }
      );
    };
    const checkpoints = {
      setSize,
      addCheckpoint,
      setCheckpoint,
      getStore,
      getCheckpointIds,
      forEachCheckpoint,
      hasCheckpoint,
      getCheckpoint,
      goBackward,
      goForward,
      goTo,
      addCheckpointIdsListener,
      addCheckpointListener,
      delListener,
      clear,
      clearForward,
      destroy,
      getListenerStats,
      _registerListeners
    };
    return objFreeze(checkpoints.clear());
  },
  (checkpoints) => checkpoints._registerListeners()
);
var MASK6 = 63;
var ENCODE = /* @__PURE__ */ strSplit(
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
);
var DECODE = /* @__PURE__ */ mapNew(
  /* @__PURE__ */ arrayMap(ENCODE, (char, index) => [char, index])
);
var encode = (num) => ENCODE[num & MASK6];
var decode = (str, pos) => mapGet(DECODE, str[pos]) ?? 0;
var getRandomValues = GLOBAL.crypto ? (array) => GLOBAL.crypto.getRandomValues(array) : (
  /* istanbul ignore next */
  (array) => arrayMap(array, () => mathFloor(math.random() * 256))
);
var getUniqueId = (length = 16) => arrayReduce(
  getRandomValues(new Uint8Array(length)),
  (uniqueId, number) => uniqueId + encode(number),
  ""
);
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
var jsonStringWithMap = (obj) => jsonString(
  obj,
  (_key, value) => isInstanceOf(value, Map) ? object.fromEntries([...value]) : value
);
var textEncoder = /* @__PURE__ */ new GLOBAL.TextEncoder();
var getHash = (string) => {
  let hash = 2166136261;
  arrayForEach(textEncoder.encode(string), (char) => {
    hash ^= char;
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });
  return hash >>> 0;
};
var addOrRemoveHash = (hash1, hash2) => (hash1 ^ hash2) >>> 0;
var getValuesHash = (valueHashes) => arrayReduce(
  objEntries(valueHashes),
  (valuesHash, [valueId, valueHash]) => addOrRemoveHash(
    valuesHash,
    getValueInValuesHash(valueId, valueHash) ^ getValueInValuesHash(valueId, 0)
    // legacy v5; remove in v7
  ),
  0
  // legacy v5; valuesHlc in v7?
);
var getValueInValuesHash = (valueId, valueHash) => getHash(valueId + ":" + valueHash);
var getValueHash = (value, valueHlc) => getHash(jsonStringWithMap(value ?? null) + ":" + valueHlc);
var getCellHash = getValueHash;
var getCellInRowHash = getValueInValuesHash;
var getRowHash = getValuesHash;
var getRowInTableHash = getValueInValuesHash;
var getTableHash = (rowHashes) => (
  // alias to getValuesHash in v7
  arrayReduce(
    objEntries(rowHashes),
    (valuesHash, [rowId, rowHash]) => addOrRemoveHash(valuesHash, getValueInValuesHash(rowId, rowHash)),
    0
    // legacy v5; rowHlc in v7?
  )
);
var getTableInTablesHash = getValueInValuesHash;
var getTablesHash = getTableHash;
var SHIFT36 = 2 ** 36;
var SHIFT30 = 2 ** 30;
var SHIFT24 = 2 ** 24;
var SHIFT18 = 2 ** 18;
var SHIFT12 = 2 ** 12;
var SHIFT6 = 2 ** 6;
var getClientIdFromUniqueId = (uniqueId) => {
  const clientHash30 = getHash(uniqueId);
  return encode(clientHash30 / SHIFT24) + encode(clientHash30 / SHIFT18) + encode(clientHash30 / SHIFT12) + encode(clientHash30 / SHIFT6) + encode(clientHash30);
};
var getHlcFunctions = (uniqueId, getNow = Date.now) => {
  let lastLogicalTime = 0;
  let lastCounter = -1;
  const thisClientId = ifNotUndefined(
    uniqueId,
    getClientIdFromUniqueId,
    () => getUniqueId(5)
  );
  const getNextHlc = () => {
    seenHlc();
    return encodeHlc(lastLogicalTime, ++lastCounter);
  };
  const seenHlc = (hlc) => {
    const previousLogicalTime = lastLogicalTime;
    const [remoteLogicalTime, remoteCounter] = isUndefined(hlc) || hlc == "" ? [0, 0] : decodeHlc(hlc);
    lastLogicalTime = mathMax(previousLogicalTime, remoteLogicalTime, getNow());
    lastCounter = lastLogicalTime == previousLogicalTime ? lastLogicalTime == remoteLogicalTime ? mathMax(lastCounter, remoteCounter) : lastCounter : lastLogicalTime == remoteLogicalTime ? remoteCounter : -1;
  };
  const encodeHlc = (logicalTime42, counter24, clientId) => encode(logicalTime42 / SHIFT36) + encode(logicalTime42 / SHIFT30) + encode(logicalTime42 / SHIFT24) + encode(logicalTime42 / SHIFT18) + encode(logicalTime42 / SHIFT12) + encode(logicalTime42 / SHIFT6) + encode(logicalTime42) + encode(counter24 / SHIFT18) + encode(counter24 / SHIFT12) + encode(counter24 / SHIFT6) + encode(counter24) + (isUndefined(clientId) ? thisClientId : getClientIdFromUniqueId(clientId));
  const decodeHlc = (hlc16) => [
    decode(hlc16, 0) * SHIFT36 + decode(hlc16, 1) * SHIFT30 + decode(hlc16, 2) * SHIFT24 + decode(hlc16, 3) * SHIFT18 + decode(hlc16, 4) * SHIFT12 + decode(hlc16, 5) * SHIFT6 + decode(hlc16, 6),
    decode(hlc16, 7) * SHIFT18 + decode(hlc16, 8) * SHIFT12 + decode(hlc16, 9) * SHIFT6 + decode(hlc16, 10),
    hlc16.slice(11)
  ];
  const getLastLogicalTime = () => lastLogicalTime;
  const getLastCounter = () => lastCounter;
  const getClientId = () => thisClientId;
  return [
    getNextHlc,
    seenHlc,
    encodeHlc,
    decodeHlc,
    getLastLogicalTime,
    getLastCounter,
    getClientId
  ];
};
var defaultSorter = (sortKey1, sortKey2) => (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;
var createIndexes = getCreateFunction((store) => {
  const sliceIdsListeners = mapNew();
  const sliceRowIdsListeners = mapNew();
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => indexes
  );
  const [
    getStore,
    getIndexIds,
    forEachIndexImpl,
    hasIndex,
    getTableId,
    getIndex,
    setIndex,
    ,
    setDefinitionAndListen,
    delDefinition,
    addIndexIdsListener,
    destroy
  ] = getDefinableFunctions(
    store,
    mapNew,
    (value) => isUndefined(value) ? EMPTY_STRING : isArray(value) ? arrayMap(value, id) : id(value),
    addListener,
    callListeners
  );
  const hasSlice = (indexId, sliceId) => collHas(getIndex(indexId), sliceId);
  const setIndexDefinition = (indexId, tableId, getSliceIdOrIds, getSortKey, sliceIdSorter, rowIdSorter = defaultSorter) => {
    const sliceIdArraySorter = isUndefined(sliceIdSorter) ? void 0 : ([id1], [id2]) => sliceIdSorter(id1, id2);
    setDefinitionAndListen(
      indexId,
      tableId,
      (change, changedSliceIds, changedSortKeys, sliceIdOrIdsByRowId, sortKeys, force) => {
        let sliceIdsChanged = 0;
        const changedSlices = setNew();
        const unsortedSlices = setNew();
        const index = getIndex(indexId);
        collForEach(
          changedSliceIds,
          ([oldSliceIdOrIds, newSliceIdOrIds], rowId) => {
            const oldSliceIds = setNew(oldSliceIdOrIds);
            const newSliceIds = setNew(newSliceIdOrIds);
            collForEach(
              oldSliceIds,
              (oldSliceId) => collDel(newSliceIds, oldSliceId) ? collDel(oldSliceIds, oldSliceId) : 0
            );
            collForEach(oldSliceIds, (oldSliceId) => {
              setAdd(changedSlices, oldSliceId);
              ifNotUndefined(mapGet(index, oldSliceId), (oldSlice) => {
                collDel(oldSlice, rowId);
                if (collIsEmpty(oldSlice)) {
                  mapSet(index, oldSliceId);
                  sliceIdsChanged = 1;
                }
              });
            });
            collForEach(newSliceIds, (newSliceId) => {
              setAdd(changedSlices, newSliceId);
              if (!collHas(index, newSliceId)) {
                mapSet(index, newSliceId, setNew());
                sliceIdsChanged = 1;
              }
              setAdd(mapGet(index, newSliceId), rowId);
              if (!isUndefined(getSortKey)) {
                setAdd(unsortedSlices, newSliceId);
              }
            });
          }
        );
        change();
        if (!collIsEmpty(sortKeys)) {
          if (force) {
            mapForEach(index, (sliceId) => setAdd(unsortedSlices, sliceId));
          } else {
            mapForEach(
              changedSortKeys,
              (rowId) => ifNotUndefined(
                mapGet(sliceIdOrIdsByRowId, rowId),
                (sliceIdOrIds) => arrayForEach(
                  isArray(sliceIdOrIds) ? sliceIdOrIds : [sliceIdOrIds],
                  (sliceId) => setAdd(unsortedSlices, sliceId)
                )
              )
            );
          }
          collForEach(unsortedSlices, (sliceId) => {
            const rowIdArraySorter = (rowId1, rowId2) => rowIdSorter(
              mapGet(sortKeys, rowId1),
              mapGet(sortKeys, rowId2),
              sliceId
            );
            const sliceArray = [...mapGet(index, sliceId)];
            if (!arrayIsSorted(sliceArray, rowIdArraySorter)) {
              mapSet(
                index,
                sliceId,
                setNew(arraySort(sliceArray, rowIdArraySorter))
              );
              setAdd(changedSlices, sliceId);
            }
          });
        }
        if (sliceIdsChanged || force) {
          if (!isUndefined(sliceIdArraySorter)) {
            const indexArray = [...index];
            if (!arrayIsSorted(indexArray, sliceIdArraySorter)) {
              setIndex(
                indexId,
                mapNew(arraySort(indexArray, sliceIdArraySorter))
              );
              sliceIdsChanged = 1;
            }
          }
        }
        if (sliceIdsChanged) {
          callListeners(sliceIdsListeners, [indexId]);
        }
        collForEach(
          changedSlices,
          (sliceId) => callListeners(sliceRowIdsListeners, [indexId, sliceId])
        );
      },
      getRowCellFunction(getSliceIdOrIds),
      ifNotUndefined(getSortKey, getRowCellFunction)
    );
    return indexes;
  };
  const forEachIndex = (indexCallback) => forEachIndexImpl(
    (indexId, slices) => indexCallback(
      indexId,
      (sliceCallback) => forEachSliceImpl(indexId, sliceCallback, slices)
    )
  );
  const forEachSlice = (indexId, sliceCallback) => forEachSliceImpl(indexId, sliceCallback, getIndex(indexId));
  const forEachSliceImpl = (indexId, sliceCallback, slices) => {
    const tableId = getTableId(indexId);
    collForEach(
      slices,
      (rowIds, sliceId) => sliceCallback(
        sliceId,
        (rowCallback) => collForEach(
          rowIds,
          (rowId) => rowCallback(
            rowId,
            (cellCallback) => store.forEachCell(tableId, rowId, cellCallback)
          )
        )
      )
    );
  };
  const delIndexDefinition = (indexId) => {
    delDefinition(indexId);
    return indexes;
  };
  const getSliceIds = (indexId) => mapKeys(getIndex(indexId));
  const getSliceRowIds = (indexId, sliceId) => collValues(mapGet(getIndex(indexId), sliceId));
  const addSliceIdsListener = (indexId, listener) => addListener(listener, sliceIdsListeners, [indexId]);
  const addSliceRowIdsListener = (indexId, sliceId, listener) => addListener(listener, sliceRowIdsListeners, [indexId, sliceId]);
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return indexes;
  };
  const getListenerStats = () => ({
    sliceIds: collSize2(sliceIdsListeners),
    sliceRowIds: collSize3(sliceRowIdsListeners)
  });
  const indexes = {
    setIndexDefinition,
    delIndexDefinition,
    getStore,
    getIndexIds,
    forEachIndex,
    forEachSlice,
    hasIndex,
    hasSlice,
    getTableId,
    getSliceIds,
    getSliceRowIds,
    addIndexIdsListener,
    addSliceIdsListener,
    addSliceRowIdsListener,
    delListener,
    destroy,
    getListenerStats
  };
  return objFreeze(indexes);
});
var stampClone = ([value, hlc]) => stampNew(value, hlc);
var stampCloneWithHash = ([value, hlc, hash]) => [value, hlc, hash];
var stampNew = (value, hlc) => hlc ? [value, hlc] : [value];
var stampNewWithHash = (value, hlc, hash) => [value, hlc, hash];
var getStampHash = (stamp) => stamp[2];
var replaceHlcHash = (oldHlc, newHlc) => newHlc > oldHlc ? (oldHlc ? getHash(oldHlc) : 0) ^ getHash(newHlc) : 0;
var getLatestHlc = (hlc1, hlc2) => (
  /* istanbul ignore next */
  ((hlc1 ?? "") > (hlc2 ?? "") ? hlc1 : hlc2) ?? ""
);
var stampUpdate = (stamp, hlc, hash) => {
  if (hlc > stamp[1]) {
    stamp[1] = hlc;
  }
  stamp[2] = hash >>> 0;
};
var stampNewObj = (hlc = EMPTY_STRING) => stampNew(objNew(), hlc);
var stampNewMap = (hlc = EMPTY_STRING) => [mapNew(), hlc, 0];
var stampMapToObjWithHash = ([map, hlc, hash], mapper = stampCloneWithHash) => [mapToObj(map, mapper), hlc, hash];
var stampMapToObjWithoutHash = ([map, hlc], mapper = stampClone) => stampNew(mapToObj(map, mapper), hlc);
var stampValidate = (stamp, validateThing) => isArray(stamp) && size(stamp) == 3 && isString(stamp[1]) && getTypeOf(stamp[2]) == NUMBER && isFiniteNumber(stamp[2]) && validateThing(stamp[0]);
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
var createStore = () => {
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
  const [addListener, callListeners, delListenerImpl, callListenerImpl] = getListenerFunctions(() => store);
  const validateTablesSchema = (tableSchema) => objValidate(
    tableSchema,
    (tableSchema2) => objValidate(tableSchema2, validateCellOrValueSchema)
  );
  const validateValuesSchema = (valuesSchema) => objValidate(valuesSchema, validateCellOrValueSchema);
  const validateCellOrValueSchema = (schema) => {
    if (!objValidate(schema, (_child, id2) => arrayHas([TYPE, DEFAULT], id2))) {
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
  const validateTables = (tables) => objValidate(tables, validateTable, cellInvalid);
  const validateTable = (table, tableId) => (!hasTablesSchema || collHas(tablesSchemaMap, tableId) || /* istanbul ignore next */
  cellInvalid(tableId)) && objValidate(
    table,
    (row, rowId) => validateRow(tableId, rowId, row),
    () => cellInvalid(tableId)
  );
  const validateRow = (tableId, rowId, row, skipDefaults) => objValidate(
    skipDefaults ? row : addDefaultsToRow(row, tableId, rowId),
    (cell, cellId) => ifNotUndefined(
      getValidatedCell(tableId, rowId, cellId, cell),
      (validCell) => {
        row[cellId] = validCell;
        return true;
      },
      () => false
    ),
    () => cellInvalid(tableId, rowId)
  );
  const getValidatedCell = (tableId, rowId, cellId, cell) => hasTablesSchema ? ifNotUndefined(
    mapGet(mapGet(tablesSchemaMap, tableId), cellId),
    (cellSchema) => getCellOrValueType(cell) != cellSchema[TYPE] ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT]) : cell,
    () => cellInvalid(tableId, rowId, cellId, cell)
  ) : isUndefined(getCellOrValueType(cell)) ? cellInvalid(tableId, rowId, cellId, cell) : cell;
  const validateValues = (values, skipDefaults) => objValidate(
    skipDefaults ? values : addDefaultsToValues(values),
    (value, valueId) => ifNotUndefined(
      getValidatedValue(valueId, value),
      (validValue) => {
        values[valueId] = validValue;
        return true;
      },
      () => false
    ),
    () => valueInvalid()
  );
  const getValidatedValue = (valueId, value) => hasValuesSchema ? ifNotUndefined(
    mapGet(valuesSchemaMap, valueId),
    (valueSchema) => getCellOrValueType(value) != valueSchema[TYPE] ? valueInvalid(valueId, value, valueSchema[DEFAULT]) : value,
    () => valueInvalid(valueId, value)
  ) : isUndefined(getCellOrValueType(value)) ? valueInvalid(valueId, value) : value;
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
          ifNotUndefined(
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
      ifNotUndefined(
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
  const setValidContent = ([tables, values]) => {
    (objIsEmpty(tables) ? delTables : setTables)(tables);
    (objIsEmpty(values) ? delValues : setValues)(values);
  };
  const setValidTables = (tables) => mapMatch(
    tablesMap,
    tables,
    (_tables, tableId, table) => setValidTable(tableId, table),
    (_tables, tableId) => delValidTable(tableId)
  );
  const setValidTable = (tableId, table) => mapMatch(
    mapEnsure(tablesMap, tableId, () => {
      tableIdsChanged(tableId, 1);
      mapSet(tablePoolFunctions, tableId, getPoolFunctions());
      mapSet(tableCellIds, tableId, mapNew());
      return mapNew();
    }),
    table,
    (tableMap, rowId, row) => setValidRow(tableId, tableMap, rowId, row),
    (tableMap, rowId) => delValidRow(tableId, tableMap, rowId)
  );
  const setValidRow = (tableId, tableMap, rowId, row, forceDel) => mapMatch(
    mapEnsure(tableMap, rowId, () => {
      rowIdsChanged(tableId, rowId, 1);
      return mapNew();
    }),
    row,
    (rowMap, cellId, cell) => setValidCell(tableId, rowId, rowMap, cellId, cell),
    (rowMap, cellId) => delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel)
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
  const setCellIntoDefaultRow = (tableId, tableMap, rowId, cellId, validCell) => ifNotUndefined(
    mapGet(tableMap, rowId),
    (rowMap) => setValidCell(tableId, rowId, rowMap, cellId, validCell),
    () => setValidRow(
      tableId,
      tableMap,
      rowId,
      addDefaultsToRow({ [cellId]: validCell }, tableId, rowId)
    )
  );
  const setOrDelValues = (values) => objIsEmpty(values) ? delValues() : setValues(values);
  const setValidValues = (values) => mapMatch(
    valuesMap,
    values,
    (_valuesMap, valueId, value) => setValidValue(valueId, value),
    (_valuesMap, valueId) => delValidValue(valueId)
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
  const getOrCreateTable = (tableId) => mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});
  const delValidTable = (tableId) => setValidTable(tableId, {});
  const delValidRow = (tableId, tableMap, rowId) => {
    const [, releaseId] = mapGet(tablePoolFunctions, tableId);
    releaseId(rowId);
    setValidRow(tableId, tableMap, rowId, {}, true);
  };
  const delValidCell = (tableId, table, rowId, row, cellId, forceDel) => {
    const defaultCell = mapGet(
      mapGet(tablesSchemaRowCache, tableId)?.[0],
      cellId
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
      count != -addedOrRemoved ? count + addedOrRemoved : null
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
    internalListeners[3]?.(tableId, rowId, cellId, newCell);
  };
  const valueIdsChanged = (valueId, addedOrRemoved) => idsChanged(changedValueIds, valueId, addedOrRemoved);
  const valueChanged = (valueId, oldValue, newValue) => {
    mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
    internalListeners[4]?.(valueId, newValue);
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
    ([oldCell, newCell]) => [true, oldCell, newCell],
    () => [false, ...pairNew(getCell(tableId, rowId, cellId))]
  );
  const getValueChange = (valueId) => ifNotUndefined(
    mapGet(changedValues, valueId),
    ([oldValue, newValue]) => [true, oldValue, newValue],
    () => [false, ...pairNew(getValue(valueId))]
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
  const callTabularListenersForChanges = (mutator) => {
    const hasTablesNow = hasTables();
    if (hasTablesNow != hadTables) {
      callListeners(hasTablesListeners[mutator], void 0, hasTablesNow);
    }
    const emptySortedRowIdListeners = collIsEmpty(
      sortedRowIdsListeners[mutator]
    );
    const emptyIdAndHasListeners = collIsEmpty(cellIdsListeners[mutator]) && collIsEmpty(hasCellListeners[mutator]) && collIsEmpty(rowIdsListeners[mutator]) && collIsEmpty(hasRowListeners[mutator]) && collIsEmpty(tableCellIdsListeners[mutator]) && collIsEmpty(hasTableCellListeners[mutator]) && collIsEmpty(rowCountListeners[mutator]) && emptySortedRowIdListeners && collIsEmpty(tableIdsListeners[mutator]) && collIsEmpty(hasTableListeners[mutator]);
    const emptyOtherListeners = collIsEmpty(cellListeners[mutator]) && collIsEmpty(rowListeners[mutator]) && collIsEmpty(tableListeners[mutator]) && collIsEmpty(tablesListeners[mutator]);
    if (!emptyIdAndHasListeners || !emptyOtherListeners) {
      const changes = mutator ? [
        mapClone(changedTableIds),
        mapClone2(changedTableCellIds),
        mapClone(changedRowCount),
        mapClone2(changedRowIds),
        mapClone3(changedCellIds),
        mapClone3(changedCells)
      ] : [
        changedTableIds,
        changedTableCellIds,
        changedRowCount,
        changedRowIds,
        changedCellIds,
        changedCells
      ];
      if (!emptyIdAndHasListeners) {
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
              getRowCount(tableId)
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
          ) && !emptySortedRowIdListeners) {
            callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
            setAdd(calledSortableTableIds, tableId);
          }
        });
        if (!emptySortedRowIdListeners) {
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
    const hasValuesNow = hasValues();
    if (hasValuesNow != hadValues) {
      callListeners(hasValuesListeners[mutator], void 0, hasValuesNow);
    }
    const emptyIdAndHasListeners = collIsEmpty(valueIdsListeners[mutator]) && collIsEmpty(hasValueListeners[mutator]);
    const emptyOtherListeners = collIsEmpty(valueListeners[mutator]) && collIsEmpty(valuesListeners[mutator]);
    if (!emptyIdAndHasListeners || !emptyOtherListeners) {
      const changes = mutator ? [mapClone(changedValueIds), mapClone(changedValues)] : [changedValueIds, changedValues];
      if (!emptyIdAndHasListeners) {
        callIdsAndHasListenersIfChanged(
          changes[0],
          valueIdsListeners[mutator],
          hasValueListeners[mutator]
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
    let sortedRowIds = getSortedRowIds(tableId, cellId, ...otherArgs);
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds(tableId, cellId, ...otherArgs);
        if (!arrayIsEqual(newSortedRowIds, sortedRowIds)) {
          sortedRowIds = newSortedRowIds;
          listener(store, tableId, cellId, ...otherArgs, sortedRowIds);
        }
      },
      sortedRowIdsListeners[mutator ? 1 : 0],
      [tableId, cellId],
      [getTableIds]
    );
  };
  const getContent = () => [getTables(), getValues()];
  const getTables = () => mapToObj3(tablesMap);
  const getTableIds = () => mapKeys(tablesMap);
  const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)));
  const getTableCellIds = (tableId) => mapKeys(mapGet(tableCellIds, id(tableId)));
  const getRowCount = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
  const getRowIds = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
  const getSortedRowIds = (tableIdOrArgs, cellId, descending, offset = 0, limit) => isObject(tableIdOrArgs) ? getSortedRowIds(
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending,
    tableIdOrArgs.offset,
    tableIdOrArgs.limit
  ) : arrayMap(
    slice(
      arraySort(
        mapMap(mapGet(tablesMap, id(tableIdOrArgs)), (row, rowId) => [
          isUndefined(cellId) ? rowId : mapGet(row, id(cellId)),
          rowId
        ]),
        ([cell1], [cell2]) => defaultSorter(cell1, cell2) * (descending ? -1 : 1)
      ),
      offset,
      isUndefined(limit) ? limit : offset + limit
    ),
    ([, rowId]) => rowId
  );
  const getRow = (tableId, rowId) => mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCellIds = (tableId, rowId) => mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
  const getCell = (tableId, rowId, cellId) => mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
  const getValues = () => mapToObj(valuesMap);
  const getValueIds = () => mapKeys(valuesMap);
  const getValue = (valueId) => mapGet(valuesMap, id(valueId));
  const hasTables = () => !collIsEmpty(tablesMap);
  const hasTable = (tableId) => collHas(tablesMap, id(tableId));
  const hasTableCell = (tableId, cellId) => collHas(mapGet(tableCellIds, id(tableId)), id(cellId));
  const hasRow = (tableId, rowId) => collHas(mapGet(tablesMap, id(tableId)), id(rowId));
  const hasCell = (tableId, rowId, cellId) => collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
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
          (cell, cellId) => setCellIntoDefaultRow(tableId2, table, rowId2, cellId, cell)
        );
      }
    },
    tableId,
    rowId
  );
  const setCell = (tableId, rowId, cellId, cell) => fluentTransaction(
    (tableId2, rowId2, cellId2) => ifNotUndefined(
      getValidatedCell(
        tableId2,
        rowId2,
        cellId2,
        isFunction(cell) ? cell(getCell(tableId2, rowId2, cellId2)) : cell
      ),
      (validCell) => setCellIntoDefaultRow(
        tableId2,
        getOrCreateTable(tableId2),
        rowId2,
        cellId2,
        validCell
      )
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
  const setValue = (valueId, value) => fluentTransaction(
    (valueId2) => ifNotUndefined(
      getValidatedValue(
        valueId2,
        isFunction(value) ? value(getValue(valueId2)) : value
      ),
      (validValue) => setValidValue(valueId2, validValue)
    ),
    valueId
  );
  const applyChanges = (changes) => fluentTransaction(() => {
    objMap(
      changes[0],
      (table, tableId) => isUndefined(table) ? delTable(tableId) : objMap(
        table,
        (row, rowId) => isUndefined(row) ? delRow(tableId, rowId) : objMap(
          row,
          (cell, cellId) => setOrDelCell(store, tableId, rowId, cellId, cell)
        )
      )
    );
    objMap(
      changes[1],
      (value, valueId) => setOrDelValue(store, valueId, value)
    );
  });
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
      const values = getValues();
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
  const delTables = () => fluentTransaction(() => setValidTables({}));
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
  const delCell = (tableId, rowId, cellId, forceDel) => fluentTransaction(
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
          forceDel
        ) : 0
      )
    ),
    tableId,
    rowId,
    cellId
  );
  const delValues = () => fluentTransaction(() => setValidValues({}));
  const delValue = (valueId) => fluentTransaction(
    (valueId2) => collHas(valuesMap, valueId2) ? delValidValue(valueId2) : 0,
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
  const getTransactionChanges = () => [
    mapToObj(
      changedCells,
      (table, tableId) => mapGet(changedTableIds, tableId) === -1 ? void 0 : mapToObj(
        table,
        (row, rowId) => mapGet(mapGet(changedRowIds, tableId), rowId) === -1 ? void 0 : mapToObj(
          row,
          ([, newCell]) => newCell,
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
      ([, newValue]) => newValue,
      (changedValue) => pairIsEqual(changedValue)
    ),
    1
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
    mapToObj(changedValueIds)
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
          collForEach(
            changedCells,
            (table, tableId) => collForEach(
              table,
              (row, rowId) => collForEach(
                row,
                ([oldCell], cellId) => setOrDelCell(store, tableId, rowId, cellId, oldCell)
              )
            )
          );
          collClear(changedCells);
          collForEach(
            changedValues,
            ([oldValue], valueId) => setOrDelValue(store, valueId, oldValue)
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
          (cellCallback) => mapForEach(rowMap, cellCallback)
        )
      )
    )
  );
  const forEachTableCell = (tableId, tableCellCallback) => mapForEach(mapGet(tableCellIds, id(tableId)), tableCellCallback);
  const forEachRow = (tableId, rowCallback) => collForEach(
    mapGet(tablesMap, id(tableId)),
    (rowMap, rowId) => rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback))
  );
  const forEachCell = (tableId, rowId, cellCallback) => mapForEach(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), cellCallback);
  const forEachValue = (valueCallback) => mapForEach(valuesMap, valueCallback);
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
    setInternalListeners
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
        (ids) => [hasTable(...ids)]
      ],
      [TABLE]: [1, tableListeners, [getTableIds]],
      [TABLE + CELL_IDS]: [1, tableCellIdsListeners, [getTableIds]],
      [HAS + TABLE + CELL]: [
        2,
        hasTableCellListeners,
        [getTableIds, getTableCellIds],
        (ids) => [hasTableCell(...ids)]
      ],
      [ROW_COUNT]: [1, rowCountListeners, [getTableIds]],
      [ROW_IDS]: [1, rowIdsListeners, [getTableIds]],
      [HAS + ROW]: [
        2,
        hasRowListeners,
        [getTableIds, getRowIds],
        (ids) => [hasRow(...ids)]
      ],
      [ROW]: [2, rowListeners, [getTableIds, getRowIds]],
      [CELL_IDS]: [2, cellIdsListeners, [getTableIds, getRowIds]],
      [HAS + CELL]: [
        3,
        hasCellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids) => [hasCell(...ids)]
      ],
      [CELL]: [
        3,
        cellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids) => pairNew(getCell(...ids))
      ],
      InvalidCell: [3, invalidCellListeners],
      [HAS + VALUES]: [0, hasValuesListeners, [], () => [hasValues()]],
      [VALUES]: [0, valuesListeners],
      [VALUE_IDS]: [0, valueIdsListeners],
      [HAS + VALUE]: [
        1,
        hasValueListeners,
        [getValueIds],
        (ids) => [hasValue(...ids)]
      ],
      [VALUE]: [
        1,
        valueListeners,
        [getValueIds],
        (ids) => pairNew(getValue(ids[0]))
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
var LISTENER_ARGS = {
  HasTable: 1,
  Table: 1,
  TableCellIds: 1,
  HasTableCell: 2,
  RowCount: 1,
  RowIds: 1,
  SortedRowIds: 5,
  HasRow: 2,
  Row: 2,
  CellIds: 2,
  HasCell: 3,
  Cell: 3,
  HasValue: 1,
  Value: 1,
  InvalidCell: 3,
  InvalidValue: 1
};
var newContentStampMap = (time = EMPTY_STRING) => [
  stampNewMap(time),
  stampNewMap(time)
];
var validateMergeableContent = (mergeableContent) => isArray(mergeableContent) && size(mergeableContent) == 2 && stampValidate(
  mergeableContent[0],
  (tableStamps) => objValidate(
    tableStamps,
    (tableStamp) => stampValidate(
      tableStamp,
      (rowStamps) => objValidate(
        rowStamps,
        (rowStamp) => stampValidate(
          rowStamp,
          (cellStamps) => objValidate(
            cellStamps,
            (cellStamp) => stampValidate(cellStamp, isCellOrValueOrNullOrUndefined),
            void 0,
            1
          )
        ),
        void 0,
        1
      )
    ),
    void 0,
    1
  )
) && stampValidate(
  mergeableContent[1],
  (values) => objValidate(
    values,
    (value) => stampValidate(value, isCellOrValueOrNullOrUndefined),
    void 0,
    1
  )
);
var createMergeableStore = (uniqueId, getNow) => {
  let listeningToRawStoreChanges = 1;
  let contentStampMap = newContentStampMap();
  let defaultingContent = 0;
  const touchedCells = mapNew();
  const touchedValues = setNew();
  const [getNextHlc, seenHlc] = getHlcFunctions(uniqueId, getNow);
  const store = createStore();
  const disableListeningToRawStoreChanges = (actions) => {
    const wasListening = listeningToRawStoreChanges;
    listeningToRawStoreChanges = 0;
    actions();
    listeningToRawStoreChanges = wasListening;
    return mergeableStore;
  };
  const mergeContentOrChanges = (contentOrChanges, isContent = 0) => {
    const tablesChanges = {};
    const valuesChanges = {};
    const [
      [tablesObj, incomingTablesHlc = EMPTY_STRING, incomingTablesHash = 0],
      values
    ] = contentOrChanges;
    const [tablesStampMap, valuesStampMap] = contentStampMap;
    const [tableStampMaps, oldTablesHlc, oldTablesHash] = tablesStampMap;
    let tablesHash = isContent ? incomingTablesHash : oldTablesHash;
    let tablesHlc = incomingTablesHlc;
    objForEach(
      tablesObj,
      ([rowsObj, incomingTableHlc = EMPTY_STRING, incomingTableHash = 0], tableId) => {
        const tableStampMap = mapEnsure(tableStampMaps, tableId, stampNewMap);
        const [rowStampMaps, oldTableHlc, oldTableHash] = tableStampMap;
        let tableHash = isContent ? incomingTableHash : oldTableHash;
        let tableHlc = incomingTableHlc;
        objForEach(rowsObj, (row, rowId) => {
          const [rowHlc, oldRowHash, rowHash] = mergeCellsOrValues(
            row,
            mapEnsure(rowStampMaps, rowId, stampNewMap),
            objEnsure(objEnsure(tablesChanges, tableId, objNew), rowId, objNew),
            isContent
          );
          tableHash ^= isContent ? 0 : addOrRemoveHash(
            oldRowHash ? getValueInValuesHash(rowId, oldRowHash) : 0,
            getValueInValuesHash(rowId, rowHash)
          );
          tableHlc = getLatestHlc(tableHlc, rowHlc);
        });
        tableHash ^= isContent ? 0 : replaceHlcHash(oldTableHlc, incomingTableHlc);
        stampUpdate(tableStampMap, incomingTableHlc, tableHash);
        tablesHash ^= isContent ? 0 : addOrRemoveHash(
          oldTableHash ? getValueInValuesHash(tableId, oldTableHash) : 0,
          getValueInValuesHash(tableId, tableStampMap[2])
        );
        tablesHlc = getLatestHlc(tablesHlc, tableHlc);
      }
    );
    tablesHash ^= isContent ? 0 : replaceHlcHash(oldTablesHlc, incomingTablesHlc);
    stampUpdate(tablesStampMap, incomingTablesHlc, tablesHash);
    const [valuesHlc] = mergeCellsOrValues(
      values,
      valuesStampMap,
      valuesChanges,
      isContent
    );
    seenHlc(getLatestHlc(tablesHlc, valuesHlc));
    return [tablesChanges, valuesChanges, 1];
  };
  const mergeCellsOrValues = (things, thingsStampMap, thingsChanges, isContent) => {
    const [
      thingsObj,
      incomingThingsHlc = EMPTY_STRING,
      incomingThingsHash = 0
    ] = things;
    const [thingStampMaps, oldThingsHlc, oldThingsHash] = thingsStampMap;
    let thingsHlc = incomingThingsHlc;
    let thingsHash = isContent ? incomingThingsHash : oldThingsHash;
    objForEach(
      thingsObj,
      ([thing, thingHlc = EMPTY_STRING, incomingThingHash = 0], thingId) => {
        const thingStampMap = mapEnsure(thingStampMaps, thingId, () => [
          void 0,
          EMPTY_STRING,
          0
        ]);
        const [, oldThingHlc, oldThingHash] = thingStampMap;
        if (!oldThingHlc || thingHlc > oldThingHlc) {
          stampUpdate(
            thingStampMap,
            thingHlc,
            isContent ? incomingThingHash : getValueHash(thing, thingHlc)
          );
          thingStampMap[0] = thing;
          thingsChanges[thingId] = thing;
          thingsHash ^= isContent ? 0 : addOrRemoveHash(
            getValueInValuesHash(thingId, oldThingHash),
            getValueInValuesHash(thingId, thingStampMap[2])
          );
          thingsHlc = getLatestHlc(thingsHlc, thingHlc);
        }
      }
    );
    thingsHash ^= isContent ? 0 : replaceHlcHash(oldThingsHlc, incomingThingsHlc);
    stampUpdate(thingsStampMap, incomingThingsHlc, thingsHash);
    return [thingsHlc, oldThingsHash, thingsStampMap[2]];
  };
  const preStartTransaction = noop;
  const preFinishTransaction = noop;
  const postFinishTransaction = () => {
    collClear(touchedCells);
    collClear(touchedValues);
  };
  const cellChanged = (tableId, rowId, cellId, newCell) => {
    setAdd(
      mapEnsure(mapEnsure(touchedCells, tableId, mapNew), rowId, setNew),
      cellId
    );
    if (listeningToRawStoreChanges) {
      mergeContentOrChanges([
        [
          {
            [tableId]: [
              {
                [rowId]: [
                  {
                    [cellId]: [
                      newCell,
                      defaultingContent ? EMPTY_STRING : getNextHlc()
                    ]
                  }
                ]
              }
            ]
          }
        ],
        [{}],
        1
      ]);
    }
  };
  const valueChanged = (valueId, newValue) => {
    setAdd(touchedValues, valueId);
    if (listeningToRawStoreChanges) {
      mergeContentOrChanges([
        [{}],
        [
          {
            [valueId]: [
              newValue,
              defaultingContent ? EMPTY_STRING : getNextHlc()
            ]
          }
        ],
        1
      ]);
    }
  };
  const getMergeableContent = () => [
    stampMapToObjWithHash(
      contentStampMap[0],
      (tableStampMap) => stampMapToObjWithHash(
        tableStampMap,
        (rowStampMap) => stampMapToObjWithHash(rowStampMap)
      )
    ),
    stampMapToObjWithHash(contentStampMap[1])
  ];
  const getMergeableContentHashes = () => [
    contentStampMap[0][2],
    contentStampMap[1][2]
  ];
  const getMergeableTableHashes = () => mapToObj(contentStampMap[0][0], getStampHash);
  const getMergeableTableDiff = (otherTableHashes) => {
    const newTables = stampNewObj(contentStampMap[0][1]);
    const differingTableHashes = {};
    mapForEach(
      contentStampMap[0][0],
      (tableId, [tableStampMap, tableHlc, hash]) => objHas(otherTableHashes, tableId) ? hash != otherTableHashes[tableId] ? differingTableHashes[tableId] = hash : 0 : newTables[0][tableId] = stampMapToObjWithoutHash(
        [tableStampMap, tableHlc],
        (rowStampMap) => stampMapToObjWithoutHash(rowStampMap)
      )
    );
    return [newTables, differingTableHashes];
  };
  const getMergeableRowHashes = (otherTableHashes) => {
    const rowHashes = {};
    objForEach(
      otherTableHashes,
      (otherTableHash, tableId) => ifNotUndefined(
        mapGet(contentStampMap[0][0], tableId),
        ([rowStampMaps, , tableHash]) => tableHash != otherTableHash ? mapForEach(
          rowStampMaps,
          (rowId, [, , rowHash]) => objEnsure(rowHashes, tableId, objNew)[rowId] = rowHash
        ) : 0
      )
    );
    return rowHashes;
  };
  const getMergeableRowDiff = (otherTableRowHashes) => {
    const newRows = stampNewObj(contentStampMap[0][1]);
    const differingRowHashes = {};
    objForEach(
      otherTableRowHashes,
      (otherRowHashes, tableId) => mapForEach(
        mapGet(contentStampMap[0][0], tableId)?.[0],
        (rowId, [rowStampMap, rowHlc, hash]) => objHas(otherRowHashes, rowId) ? hash !== otherRowHashes[rowId] ? objEnsure(differingRowHashes, tableId, objNew)[rowId] = hash : 0 : objEnsure(newRows[0], tableId, stampNewObj)[0][rowId] = stampMapToObjWithoutHash([rowStampMap, rowHlc])
      )
    );
    return [newRows, differingRowHashes];
  };
  const getMergeableCellHashes = (otherTableRowHashes) => {
    const cellHashes = {};
    objForEach(
      otherTableRowHashes,
      (otherRowHashes, tableId) => ifNotUndefined(
        mapGet(contentStampMap[0][0], tableId),
        ([rowStampMaps]) => objForEach(
          otherRowHashes,
          (otherRowHash, rowId) => ifNotUndefined(
            mapGet(rowStampMaps, rowId),
            ([cellStampMaps, , rowHash]) => rowHash !== otherRowHash ? mapForEach(
              cellStampMaps,
              (cellId, [, , cellHash]) => objEnsure(
                objEnsure(cellHashes, tableId, objNew),
                rowId,
                objNew
              )[cellId] = cellHash
            ) : 0
          )
        )
      )
    );
    return cellHashes;
  };
  const getMergeableCellDiff = (otherTableRowCellHashes) => {
    const [[tableStampMaps, tablesHlc]] = contentStampMap;
    const tablesObj = {};
    objForEach(
      otherTableRowCellHashes,
      (otherRowCellHashes, tableId) => objForEach(
        otherRowCellHashes,
        (otherCellHashes, rowId) => ifNotUndefined(
          mapGet(tableStampMaps, tableId),
          ([rowStampMaps, tableHlc]) => ifNotUndefined(
            mapGet(rowStampMaps, rowId),
            ([cellStampMaps, rowHlc]) => mapForEach(
              cellStampMaps,
              (cellId, [cell, cellHlc, hash]) => hash !== otherCellHashes[cellId] ? objEnsure(
                objEnsure(
                  tablesObj,
                  tableId,
                  () => stampNewObj(tableHlc)
                )[0],
                rowId,
                () => stampNewObj(rowHlc)
              )[0][cellId] = [cell, cellHlc] : 0
            )
          )
        )
      )
    );
    return stampNew(tablesObj, tablesHlc);
  };
  const getMergeableValueHashes = () => mapToObj(contentStampMap[1][0], getStampHash);
  const getMergeableValueDiff = (otherValueHashes) => {
    const [, [valueStampMaps, valuesHlc]] = contentStampMap;
    const values = mapToObj(
      valueStampMaps,
      stampClone,
      ([, , hash], valueId) => hash == otherValueHashes?.[valueId]
    );
    return stampNew(values, valuesHlc);
  };
  const setMergeableContent = (mergeableContent) => disableListeningToRawStoreChanges(
    () => validateMergeableContent(mergeableContent) ? store.transaction(() => {
      store.delTables().delValues();
      contentStampMap = newContentStampMap();
      store.applyChanges(mergeContentOrChanges(mergeableContent, 1));
    }) : 0
  );
  const setDefaultContent = (content) => {
    store.transaction(() => {
      defaultingContent = 1;
      store.setContent(content);
      defaultingContent = 0;
    });
    return mergeableStore;
  };
  const getTransactionMergeableChanges = (withHashes = false) => {
    const [
      [tableStampMaps, tablesHlc, tablesHash],
      [valueStampMaps, valuesHlc, valuesHash]
    ] = contentStampMap;
    const newStamp = withHashes ? stampNewWithHash : stampNew;
    const tablesObj = {};
    collForEach(
      touchedCells,
      (touchedTable, tableId) => ifNotUndefined(
        mapGet(tableStampMaps, tableId),
        ([rowStampMaps, tableHlc, tableHash]) => {
          const tableObj = {};
          collForEach(
            touchedTable,
            (touchedRow, rowId) => ifNotUndefined(
              mapGet(rowStampMaps, rowId),
              ([cellStampMaps, rowHlc, rowHash]) => {
                const rowObj = {};
                collForEach(touchedRow, (cellId) => {
                  ifNotUndefined(
                    mapGet(cellStampMaps, cellId),
                    ([cell, time, hash]) => rowObj[cellId] = newStamp(cell, time, hash)
                  );
                });
                tableObj[rowId] = newStamp(rowObj, rowHlc, rowHash);
              }
            )
          );
          tablesObj[tableId] = newStamp(tableObj, tableHlc, tableHash);
        }
      )
    );
    const valuesObj = {};
    collForEach(
      touchedValues,
      (valueId) => ifNotUndefined(
        mapGet(valueStampMaps, valueId),
        ([value, time, hash]) => valuesObj[valueId] = newStamp(value, time, hash)
      )
    );
    return [
      newStamp(tablesObj, tablesHlc, tablesHash),
      newStamp(valuesObj, valuesHlc, valuesHash),
      1
    ];
  };
  const applyMergeableChanges = (mergeableChanges) => disableListeningToRawStoreChanges(
    () => store.applyChanges(mergeContentOrChanges(mergeableChanges))
  );
  const merge = (mergeableStore2) => {
    const mergeableChanges = getMergeableContent();
    const mergeableChanges2 = mergeableStore2.getMergeableContent();
    mergeableStore2.applyMergeableChanges(mergeableChanges);
    return applyMergeableChanges(mergeableChanges2);
  };
  const mergeableStore = {
    getMergeableContent,
    getMergeableContentHashes,
    getMergeableTableHashes,
    getMergeableTableDiff,
    getMergeableRowHashes,
    getMergeableRowDiff,
    getMergeableCellHashes,
    getMergeableCellDiff,
    getMergeableValueHashes,
    getMergeableValueDiff,
    setMergeableContent,
    setDefaultContent,
    getTransactionMergeableChanges,
    applyMergeableChanges,
    merge
  };
  store.setInternalListeners(
    preStartTransaction,
    preFinishTransaction,
    postFinishTransaction,
    cellChanged,
    valueChanged
  );
  objMap(
    store,
    (method, name) => mergeableStore[name] = // fluent methods
    strStartsWith(name, SET) || strStartsWith(name, DEL) || strStartsWith(name, "apply") || strEndsWith(name, TRANSACTION) || name == "call" + LISTENER ? (...args) => {
      method(...args);
      return mergeableStore;
    } : strStartsWith(name, ADD) && strEndsWith(name, LISTENER) ? (...args) => {
      const listenerArg = LISTENER_ARGS[slice(name, 3, -8)] ?? 0;
      const listener = args[listenerArg];
      args[listenerArg] = (_store, ...args2) => listener(mergeableStore, ...args2);
      return method(...args);
    } : name == "isMergeable" ? () => true : method
  );
  return objFreeze(mergeableStore);
};
var numericAggregators = /* @__PURE__ */ mapNew([
  [
    AVG,
    [
      (numbers, length) => arraySum(numbers) / length,
      (metric, add, length) => metric + (add - metric) / (length + 1),
      (metric, remove, length) => metric + (metric - remove) / (length - 1),
      (metric, add, remove, length) => metric + (add - remove) / length
    ]
  ],
  [
    MAX,
    [
      (numbers) => mathMax(...numbers),
      (metric, add) => mathMax(add, metric),
      (metric, remove) => remove == metric ? void 0 : metric,
      (metric, add, remove) => remove == metric ? void 0 : mathMax(add, metric)
    ]
  ],
  [
    MIN,
    [
      (numbers) => mathMin(...numbers),
      (metric, add) => mathMin(add, metric),
      (metric, remove) => remove == metric ? void 0 : metric,
      (metric, add, remove) => remove == metric ? void 0 : mathMin(add, metric)
    ]
  ],
  [
    SUM,
    [
      (numbers) => arraySum(numbers),
      (metric, add) => metric + add,
      (metric, remove) => metric - remove,
      (metric, add, remove) => metric - remove + add
    ]
  ]
]);
var getAggregateValue = (aggregateValue, oldLength, newValues, changedValues, aggregators, force = false) => {
  if (collIsEmpty(newValues)) {
    return void 0;
  }
  const [aggregate, aggregateAdd, aggregateRemove, aggregateReplace] = aggregators;
  force ||= isUndefined(aggregateValue);
  collForEach(changedValues, ([oldValue, newValue]) => {
    if (!force) {
      aggregateValue = isUndefined(oldValue) ? aggregateAdd?.(aggregateValue, newValue, oldLength++) : isUndefined(newValue) ? aggregateRemove?.(aggregateValue, oldValue, oldLength--) : aggregateReplace?.(aggregateValue, newValue, oldValue, oldLength);
      force ||= isUndefined(aggregateValue);
    }
  });
  return force ? aggregate(collValues(newValues), collSize(newValues)) : aggregateValue;
};
var createMetrics = getCreateFunction((store) => {
  const metricListeners = mapNew();
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => metrics
  );
  const [
    getStore,
    getMetricIds,
    forEachMetric,
    hasMetric,
    getTableId,
    getMetric,
    setMetric,
    ,
    setDefinitionAndListen,
    delDefinition,
    addMetricIdsListener,
    destroy
  ] = getDefinableFunctions(
    store,
    getUndefined,
    (value) => isNaN(value) || isUndefined(value) || value === true || value === false || value === EMPTY_STRING ? void 0 : value * 1,
    addListener,
    callListeners
  );
  const setMetricDefinition = (metricId, tableId, aggregate, getNumber, aggregateAdd, aggregateRemove, aggregateReplace) => {
    const aggregators = isFunction(aggregate) ? [aggregate, aggregateAdd, aggregateRemove, aggregateReplace] : mapGet(numericAggregators, aggregate) ?? mapGet(numericAggregators, SUM);
    setDefinitionAndListen(
      metricId,
      tableId,
      (change, changedNumbers, _changedSortKeys, numbers, _sortKeys, force) => {
        const oldMetric = getMetric(metricId);
        const oldLength = collSize(numbers);
        force ||= isUndefined(oldMetric);
        change();
        let newMetric = getAggregateValue(
          oldMetric,
          oldLength,
          numbers,
          changedNumbers,
          aggregators,
          force
        );
        if (!isFiniteNumber(newMetric)) {
          newMetric = void 0;
        }
        if (newMetric != oldMetric) {
          setMetric(metricId, newMetric);
          callListeners(metricListeners, [metricId], newMetric, oldMetric);
        }
      },
      getRowCellFunction(getNumber, 1)
    );
    return metrics;
  };
  const delMetricDefinition = (metricId) => {
    delDefinition(metricId);
    return metrics;
  };
  const addMetricListener = (metricId, listener) => addListener(listener, metricListeners, [metricId]);
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return metrics;
  };
  const getListenerStats = () => ({
    metric: collSize2(metricListeners)
  });
  const metrics = {
    setMetricDefinition,
    delMetricDefinition,
    getStore,
    getMetricIds,
    forEachMetric,
    hasMetric,
    getTableId,
    getMetric,
    addMetricIdsListener,
    addMetricListener,
    delListener,
    destroy,
    getListenerStats
  };
  return objFreeze(metrics);
});
var createQueries = getCreateFunction((store) => {
  const createStore2 = store.createStore;
  const preStore = createStore2();
  const resultStore = createStore2();
  const preStoreListenerIds = mapNew();
  const {
    addListener,
    callListeners,
    delListener: delListenerImpl
  } = resultStore;
  const [
    getStore,
    getQueryIds,
    forEachQuery,
    hasQuery,
    getTableId,
    ,
    ,
    setDefinition,
    ,
    delDefinition,
    addQueryIdsListenerImpl,
    destroy,
    addStoreListeners,
    delStoreListeners
  ] = getDefinableFunctions(
    store,
    () => true,
    getUndefined,
    addListener,
    callListeners
  );
  const addPreStoreListener = (preStore2, queryId, ...listenerIds) => arrayForEach(
    listenerIds,
    (listenerId) => setAdd(
      mapEnsure(
        mapEnsure(preStoreListenerIds, queryId, mapNew),
        preStore2,
        setNew
      ),
      listenerId
    )
  );
  const resetPreStores = (queryId) => {
    ifNotUndefined(
      mapGet(preStoreListenerIds, queryId),
      (queryPreStoreListenerIds) => {
        mapForEach(
          queryPreStoreListenerIds,
          (preStore2, listenerIds) => collForEach(
            listenerIds,
            (listenerId) => preStore2.delListener(listenerId)
          )
        );
        collClear(queryPreStoreListenerIds);
      }
    );
    arrayForEach([resultStore, preStore], (store2) => store2.delTable(queryId));
  };
  const synchronizeTransactions = (queryId, fromStore, toStore) => addPreStoreListener(
    fromStore,
    queryId,
    fromStore.addStartTransactionListener(toStore.startTransaction),
    fromStore.addDidFinishTransactionListener(
      () => toStore.finishTransaction()
    )
  );
  const setQueryDefinition = (queryId, tableId, build) => {
    setDefinition(queryId, tableId);
    resetPreStores(queryId);
    const selectEntries = [];
    const joinEntries = [[null, [tableId, null, null, [], mapNew()]]];
    const wheres = [];
    const groupEntries = [];
    const havings = [];
    const select = (arg1, arg2) => {
      const selectEntry = isFunction(arg1) ? [size(selectEntries) + EMPTY_STRING, arg1] : [
        isUndefined(arg2) ? arg1 : arg2,
        (getTableCell) => getTableCell(arg1, arg2)
      ];
      arrayPush(selectEntries, selectEntry);
      return { as: (selectedCellId) => selectEntry[0] = selectedCellId };
    };
    const join = (joinedTableId, arg1, arg2) => {
      const fromIntermediateJoinedTableId = isUndefined(arg2) || isFunction(arg1) ? null : arg1;
      const onArg = isUndefined(fromIntermediateJoinedTableId) ? arg1 : arg2;
      const joinEntry = [
        joinedTableId,
        [
          joinedTableId,
          fromIntermediateJoinedTableId,
          isFunction(onArg) ? onArg : (getCell) => getCell(onArg),
          [],
          mapNew()
        ]
      ];
      arrayPush(joinEntries, joinEntry);
      return { as: (joinedTableId2) => joinEntry[0] = joinedTableId2 };
    };
    const where = (arg1, arg2, arg3) => arrayPush(
      wheres,
      isFunction(arg1) ? arg1 : isUndefined(arg3) ? (getTableCell) => getTableCell(arg1) === arg2 : (getTableCell) => getTableCell(arg1, arg2) === arg3
    );
    const group = (selectedCellId, aggregate, aggregateAdd, aggregateRemove, aggregateReplace) => {
      const groupEntry = [
        selectedCellId,
        [
          selectedCellId,
          isFunction(aggregate) ? [aggregate, aggregateAdd, aggregateRemove, aggregateReplace] : mapGet(numericAggregators, aggregate) ?? [
            (_cells, length) => length
          ]
        ]
      ];
      arrayPush(groupEntries, groupEntry);
      return { as: (groupedCellId) => groupEntry[0] = groupedCellId };
    };
    const having = (arg1, arg2) => arrayPush(
      havings,
      isFunction(arg1) ? arg1 : (getSelectedOrGroupedCell) => getSelectedOrGroupedCell(arg1) === arg2
    );
    build({ select, join, where, group, having });
    const selects = mapNew(selectEntries);
    if (collIsEmpty(selects)) {
      return queries;
    }
    const joins = mapNew(joinEntries);
    mapForEach(
      joins,
      (asTableId, [, fromAsTableId]) => ifNotUndefined(
        mapGet(joins, fromAsTableId),
        ({ 3: toAsTableIds }) => isUndefined(asTableId) ? 0 : arrayPush(toAsTableIds, asTableId)
      )
    );
    const groups = mapNew(groupEntries);
    let selectJoinWhereStore = preStore;
    if (collIsEmpty(groups) && arrayIsEmpty(havings)) {
      selectJoinWhereStore = resultStore;
    } else {
      synchronizeTransactions(queryId, selectJoinWhereStore, resultStore);
      const groupedSelectedCellIds = mapNew();
      mapForEach(
        groups,
        (groupedCellId, [selectedCellId, aggregators]) => setAdd(mapEnsure(groupedSelectedCellIds, selectedCellId, setNew), [
          groupedCellId,
          aggregators
        ])
      );
      const groupBySelectedCellIds = setNew();
      mapForEach(
        selects,
        (selectedCellId) => collHas(groupedSelectedCellIds, selectedCellId) ? 0 : setAdd(groupBySelectedCellIds, selectedCellId)
      );
      const tree = mapNew();
      const writeGroupRow = (leaf, changedGroupedSelectedCells, selectedRowId, forceRemove) => ifNotUndefined(
        leaf,
        ([selectedCells, selectedRowIds, groupRowId, groupRow]) => {
          mapForEach(
            changedGroupedSelectedCells,
            (selectedCellId, [newCell]) => {
              const selectedCell = mapEnsure(
                selectedCells,
                selectedCellId,
                mapNew
              );
              const oldLeafCell = mapGet(selectedCell, selectedRowId);
              const newLeafCell = forceRemove ? void 0 : newCell;
              if (oldLeafCell !== newLeafCell) {
                const oldNewSet = setNew([[oldLeafCell, newLeafCell]]);
                const oldLength = collSize(selectedCell);
                mapSet(selectedCell, selectedRowId, newLeafCell);
                collForEach(
                  mapGet(groupedSelectedCellIds, selectedCellId),
                  ([groupedCellId, aggregators]) => {
                    const aggregateValue = getAggregateValue(
                      groupRow[groupedCellId],
                      oldLength,
                      selectedCell,
                      oldNewSet,
                      aggregators
                    );
                    groupRow[groupedCellId] = isUndefined(
                      getCellOrValueType(aggregateValue)
                    ) ? null : aggregateValue;
                  }
                );
              }
            }
          );
          if (collIsEmpty(selectedRowIds) || !arrayEvery(
            havings,
            (having2) => having2((cellId) => groupRow[cellId])
          )) {
            resultStore.delRow(queryId, groupRowId);
          } else if (isUndefined(groupRowId)) {
            leaf[2] = resultStore.addRow(queryId, groupRow);
          } else {
            resultStore.setRow(queryId, groupRowId, groupRow);
          }
        }
      );
      addPreStoreListener(
        selectJoinWhereStore,
        queryId,
        selectJoinWhereStore.addRowListener(
          queryId,
          null,
          (_store, _tableId, selectedRowId, getCellChange) => {
            const oldPath = [];
            const newPath = [];
            const changedGroupedSelectedCells = mapNew();
            const rowExists = selectJoinWhereStore.hasRow(
              queryId,
              selectedRowId
            );
            let changedLeaf = !rowExists;
            collForEach(groupBySelectedCellIds, (selectedCellId) => {
              const [changed, oldCell, newCell] = getCellChange(
                queryId,
                selectedRowId,
                selectedCellId
              );
              arrayPush(oldPath, oldCell);
              arrayPush(newPath, newCell);
              changedLeaf ||= changed;
            });
            mapForEach(groupedSelectedCellIds, (selectedCellId) => {
              const [changed, , newCell] = getCellChange(
                queryId,
                selectedRowId,
                selectedCellId
              );
              if (changedLeaf || changed) {
                mapSet(changedGroupedSelectedCells, selectedCellId, [newCell]);
              }
            });
            if (changedLeaf) {
              writeGroupRow(
                visitTree(tree, oldPath, void 0, ([, selectedRowIds]) => {
                  collDel(selectedRowIds, selectedRowId);
                  return collIsEmpty(selectedRowIds);
                }),
                changedGroupedSelectedCells,
                selectedRowId,
                1
              );
            }
            if (rowExists) {
              writeGroupRow(
                visitTree(
                  tree,
                  newPath,
                  () => {
                    const groupRow = {};
                    collForEach(
                      groupBySelectedCellIds,
                      (selectedCellId) => groupRow[selectedCellId] = selectJoinWhereStore.getCell(
                        queryId,
                        selectedRowId,
                        selectedCellId
                      )
                    );
                    return [mapNew(), setNew(), void 0, groupRow];
                  },
                  ([, selectedRowIds]) => {
                    setAdd(selectedRowIds, selectedRowId);
                  }
                ),
                changedGroupedSelectedCells,
                selectedRowId
              );
            }
          }
        )
      );
    }
    synchronizeTransactions(queryId, store, selectJoinWhereStore);
    const writeSelectRow = (rootRowId) => {
      const getTableCell = (arg1, arg2) => store.getCell(
        ...isUndefined(arg2) ? [tableId, rootRowId, arg1] : arg1 === tableId ? [tableId, rootRowId, arg2] : [
          mapGet(joins, arg1)?.[0],
          mapGet(mapGet(joins, arg1)?.[4], rootRowId)?.[0],
          arg2
        ]
      );
      selectJoinWhereStore.transaction(
        () => arrayEvery(wheres, (where2) => where2(getTableCell)) ? mapForEach(
          selects,
          (asCellId, tableCellGetter) => setOrDelCell(
            selectJoinWhereStore,
            queryId,
            rootRowId,
            asCellId,
            tableCellGetter(getTableCell, rootRowId)
          )
        ) : selectJoinWhereStore.delRow(queryId, rootRowId)
      );
    };
    const listenToTable = (rootRowId, tableId2, rowId, joinedTableIds2) => {
      const getCell = (cellId) => store.getCell(tableId2, rowId, cellId);
      arrayForEach(joinedTableIds2, (remoteAsTableId) => {
        const [realJoinedTableId, , on, nextJoinedTableIds, remoteIdPair] = mapGet(joins, remoteAsTableId);
        const remoteRowId = on?.(getCell, rootRowId);
        const [previousRemoteRowId, previousRemoteListenerId] = mapGet(remoteIdPair, rootRowId) ?? [];
        if (remoteRowId != previousRemoteRowId) {
          if (!isUndefined(previousRemoteListenerId)) {
            delStoreListeners(queryId, previousRemoteListenerId);
          }
          mapSet(
            remoteIdPair,
            rootRowId,
            isUndefined(remoteRowId) ? null : [
              remoteRowId,
              ...addStoreListeners(
                queryId,
                1,
                store.addRowListener(
                  realJoinedTableId,
                  remoteRowId,
                  () => listenToTable(
                    rootRowId,
                    realJoinedTableId,
                    remoteRowId,
                    nextJoinedTableIds
                  )
                )
              )
            ]
          );
        }
      });
      writeSelectRow(rootRowId);
    };
    const { 3: joinedTableIds } = mapGet(joins, null);
    selectJoinWhereStore.transaction(
      () => addStoreListeners(
        queryId,
        1,
        store.addRowListener(tableId, null, (_store, _tableId, rootRowId) => {
          if (store.hasRow(tableId, rootRowId)) {
            listenToTable(rootRowId, tableId, rootRowId, joinedTableIds);
          } else {
            selectJoinWhereStore.delRow(queryId, rootRowId);
            collForEach(
              joins,
              ({ 4: idsByRootRowId }) => ifNotUndefined(
                mapGet(idsByRootRowId, rootRowId),
                ([, listenerId]) => {
                  delStoreListeners(queryId, listenerId);
                  mapSet(idsByRootRowId, rootRowId);
                }
              )
            );
          }
        })
      )
    );
    return queries;
  };
  const delQueryDefinition = (queryId) => {
    resetPreStores(queryId);
    delDefinition(queryId);
    return queries;
  };
  const addQueryIdsListener = (listener) => addQueryIdsListenerImpl(() => listener(queries));
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return queries;
  };
  const getListenerStats = () => {
    const {
      tables: _1,
      tableIds: _2,
      transaction: _3,
      ...stats
    } = resultStore.getListenerStats();
    return stats;
  };
  const queries = {
    setQueryDefinition,
    delQueryDefinition,
    getStore,
    getQueryIds,
    forEachQuery,
    hasQuery,
    getTableId,
    addQueryIdsListener,
    delListener,
    destroy,
    getListenerStats
  };
  objMap(
    {
      [TABLE]: [1, 1],
      [TABLE + CELL_IDS]: [0, 1],
      [ROW_COUNT]: [0, 1],
      [ROW_IDS]: [0, 1],
      [SORTED_ROW_IDS]: [0, 5],
      [ROW]: [1, 2],
      [CELL_IDS]: [0, 2],
      [CELL]: [1, 3]
    },
    ([hasAndForEach, argumentCount], gettable) => {
      arrayForEach(
        hasAndForEach ? [GET, "has", "forEach"] : [GET],
        (prefix) => queries[prefix + RESULT + gettable] = (...args) => resultStore[prefix + gettable](...args)
      );
      queries[ADD + RESULT + gettable + LISTENER] = (...args) => resultStore[ADD + gettable + LISTENER](
        ...slice(args, 0, argumentCount),
        (_store, ...listenerArgs) => args[argumentCount](queries, ...listenerArgs),
        true
      );
    }
  );
  return objFreeze(queries);
});
var createRelationships = getCreateFunction((store) => {
  const remoteTableIds = mapNew();
  const remoteRowIdListeners = mapNew();
  const localRowIdsListeners = mapNew();
  const linkedRowIdsListeners = mapNew();
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => relationships
  );
  const [
    getStore,
    getRelationshipIds,
    forEachRelationshipImpl,
    hasRelationship,
    getLocalTableId,
    getRelationship,
    ,
    ,
    setDefinitionAndListen,
    delDefinition,
    addRelationshipIdsListener,
    destroy
  ] = getDefinableFunctions(
    store,
    () => [mapNew(), mapNew(), mapNew(), mapNew()],
    (value) => isUndefined(value) ? void 0 : value + EMPTY_STRING,
    addListener,
    callListeners
  );
  const getLinkedRowIdsCache = (relationshipId, firstRowId, skipCache) => ifNotUndefined(
    getRelationship(relationshipId),
    ([remoteRows, , linkedRowsCache]) => {
      if (!collHas(linkedRowsCache, firstRowId)) {
        const linkedRows = setNew();
        if (getLocalTableId(relationshipId) != getRemoteTableId(relationshipId)) {
          setAdd(linkedRows, firstRowId);
        } else {
          let rowId = firstRowId;
          while (!isUndefined(rowId) && !collHas(linkedRows, rowId)) {
            setAdd(linkedRows, rowId);
            rowId = mapGet(remoteRows, rowId);
          }
        }
        if (skipCache) {
          return linkedRows;
        }
        mapSet(linkedRowsCache, firstRowId, linkedRows);
      }
      return mapGet(linkedRowsCache, firstRowId);
    }
  );
  const delLinkedRowIdsCache = (relationshipId, firstRowId) => ifNotUndefined(
    getRelationship(relationshipId),
    ([, , linkedRowsCache]) => mapSet(linkedRowsCache, firstRowId)
  );
  const setRelationshipDefinition = (relationshipId, localTableId, remoteTableId, getRemoteRowId2) => {
    mapSet(remoteTableIds, relationshipId, remoteTableId);
    setDefinitionAndListen(
      relationshipId,
      localTableId,
      (change, changedRemoteRowIds) => {
        const changedLocalRows = setNew();
        const changedRemoteRows = setNew();
        const changedLinkedRows = setNew();
        const [localRows, remoteRows] = getRelationship(relationshipId);
        collForEach(
          changedRemoteRowIds,
          ([oldRemoteRowId, newRemoteRowId], localRowId) => {
            if (!isUndefined(oldRemoteRowId)) {
              setAdd(changedRemoteRows, oldRemoteRowId);
              ifNotUndefined(
                mapGet(remoteRows, oldRemoteRowId),
                (oldRemoteRow) => {
                  collDel(oldRemoteRow, localRowId);
                  if (collIsEmpty(oldRemoteRow)) {
                    mapSet(remoteRows, oldRemoteRowId);
                  }
                }
              );
            }
            if (!isUndefined(newRemoteRowId)) {
              setAdd(changedRemoteRows, newRemoteRowId);
              if (!collHas(remoteRows, newRemoteRowId)) {
                mapSet(remoteRows, newRemoteRowId, setNew());
              }
              setAdd(mapGet(remoteRows, newRemoteRowId), localRowId);
            }
            setAdd(changedLocalRows, localRowId);
            mapSet(localRows, localRowId, newRemoteRowId);
            mapForEach(
              mapGet(linkedRowIdsListeners, relationshipId),
              (firstRowId) => {
                if (collHas(
                  getLinkedRowIdsCache(relationshipId, firstRowId),
                  localRowId
                )) {
                  setAdd(changedLinkedRows, firstRowId);
                }
              }
            );
          }
        );
        change();
        collForEach(
          changedLocalRows,
          (localRowId) => callListeners(remoteRowIdListeners, [relationshipId, localRowId])
        );
        collForEach(
          changedRemoteRows,
          (remoteRowId) => callListeners(localRowIdsListeners, [relationshipId, remoteRowId])
        );
        collForEach(changedLinkedRows, (firstRowId) => {
          delLinkedRowIdsCache(relationshipId, firstRowId);
          callListeners(linkedRowIdsListeners, [relationshipId, firstRowId]);
        });
      },
      getRowCellFunction(getRemoteRowId2)
    );
    return relationships;
  };
  const forEachRelationship = (relationshipCallback) => forEachRelationshipImpl(
    (relationshipId) => relationshipCallback(
      relationshipId,
      (rowCallback) => store.forEachRow(getLocalTableId(relationshipId), rowCallback)
    )
  );
  const delRelationshipDefinition = (relationshipId) => {
    mapSet(remoteTableIds, relationshipId);
    delDefinition(relationshipId);
    return relationships;
  };
  const getRemoteTableId = (relationshipId) => mapGet(remoteTableIds, relationshipId);
  const getRemoteRowId = (relationshipId, localRowId) => mapGet(getRelationship(relationshipId)?.[0], localRowId);
  const getLocalRowIds = (relationshipId, remoteRowId) => collValues(mapGet(getRelationship(relationshipId)?.[1], remoteRowId));
  const getLinkedRowIds = (relationshipId, firstRowId) => isUndefined(getRelationship(relationshipId)) ? [firstRowId] : collValues(getLinkedRowIdsCache(relationshipId, firstRowId, true));
  const addRemoteRowIdListener = (relationshipId, localRowId, listener) => addListener(listener, remoteRowIdListeners, [relationshipId, localRowId]);
  const addLocalRowIdsListener = (relationshipId, remoteRowId, listener) => addListener(listener, localRowIdsListeners, [relationshipId, remoteRowId]);
  const addLinkedRowIdsListener = (relationshipId, firstRowId, listener) => {
    getLinkedRowIdsCache(relationshipId, firstRowId);
    return addListener(listener, linkedRowIdsListeners, [
      relationshipId,
      firstRowId
    ]);
  };
  const delListener = (listenerId) => {
    delLinkedRowIdsCache(...delListenerImpl(listenerId) ?? []);
    return relationships;
  };
  const getListenerStats = () => ({
    remoteRowId: collSize3(remoteRowIdListeners),
    localRowIds: collSize3(localRowIdsListeners),
    linkedRowIds: collSize3(linkedRowIdsListeners)
  });
  const relationships = {
    setRelationshipDefinition,
    delRelationshipDefinition,
    getStore,
    getRelationshipIds,
    forEachRelationship,
    hasRelationship,
    getLocalTableId,
    getRemoteTableId,
    getRemoteRowId,
    getLocalRowIds,
    getLinkedRowIds,
    addRelationshipIdsListener,
    addRemoteRowIdListener,
    addLocalRowIdsListener,
    addLinkedRowIdsListener,
    delListener,
    destroy,
    getListenerStats
  };
  return objFreeze(relationships);
});
export {
  addOrRemoveHash,
  createCheckpoints,
  createIndexes,
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
  defaultSorter,
  getCellHash,
  getCellInRowHash,
  getHash,
  getHlcFunctions,
  getRowHash,
  getRowInTableHash,
  getTableHash,
  getTableInTablesHash,
  getTablesHash,
  getUniqueId,
  getValueHash,
  getValueInValuesHash,
  getValuesHash
};
