// dist/synchronizers/synchronizer-ws-client/index.js
var EMPTY_STRING = "";
var DOT = ".";
var UTF8 = "utf8";
var OPEN = "open";
var MESSAGE = "message";
var ERROR = "error";
var UNDEFINED = "\uFFFC";
var strSplit = (str, separator = EMPTY_STRING, limit) => str.split(separator, limit);
var promise = Promise;
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? otherwise?.() : then(value);
var GLOBAL = globalThis;
var THOUSAND = 1e3;
var startTimeout = (callback, sec = 0) => setTimeout(callback, sec * THOUSAND);
var math = Math;
var mathFloor = math.floor;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var isNull = (thing) => thing === null;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isArray = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var promiseNew = (resolver) => new promise(resolver);
var errorNew = (message) => {
  throw new Error(message);
};
var tryCatch = async (action, then1, then2) => {
  try {
    return await action();
  } catch (error) {
    then1?.(error);
  }
};
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayMap = (array, cb) => array.map(cb);
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayClear = (array, to) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
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
var objFreeze = object.freeze;
var objNew = (entries = []) => object.fromEntries(entries);
var objHas = (obj, id) => id in obj;
var objForEach = (obj, cb) => arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));
var objToArray = (obj, cb) => arrayMap(objEntries(obj), ([id, value]) => cb(value, id));
var objMap = (obj, cb) => objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));
var objSize = (obj) => size(objIds(obj));
var objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
var objEnsure = (obj, id, getDefaultValue) => {
  if (!objHas(obj, id)) {
    obj[id] = getDefaultValue();
  }
  return obj[id];
};
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
var jsonStringWithUndefined = (obj) => jsonString(obj, (_key, value) => isUndefined(value) ? UNDEFINED : value);
var jsonParseWithUndefined = (str) => (
  // JSON.parse reviver removes properties with undefined values
  replaceUndefinedString(jsonParse(str))
);
var replaceUndefinedString = (obj) => obj === UNDEFINED ? void 0 : isArray(obj) ? arrayMap(obj, replaceUndefinedString) : isObject(obj) ? objMap(obj, replaceUndefinedString) : obj;
var MESSAGE_SEPARATOR = "\n";
var ifPayloadValid = (payload, then) => {
  const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
  if (splitAt !== -1) {
    then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
  }
};
var receivePayload = (payload, receive) => ifPayloadValid(
  payload,
  (fromClientId, remainder) => receive(fromClientId, ...jsonParseWithUndefined(remainder))
);
var createPayload = (toClientId, ...args) => createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));
var createRawPayload = (clientId, remainder) => clientId + MESSAGE_SEPARATOR + remainder;
var collSize = (coll) => coll?.size ?? 0;
var collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
var collIsEmpty = (coll) => isUndefined(coll) || collSize(coll) == 0;
var collForEach = (coll, cb) => coll?.forEach(cb);
var collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);
var map = Map;
var mapNew = (entries) => new map(entries);
var mapGet = (map2, key) => map2?.get(key);
var mapSet = (map2, key, value) => isUndefined(value) ? (collDel(map2, key), map2) : map2?.set(key, value);
var mapEnsure = (map2, key, getDefaultValue, hadExistingValue) => {
  if (!collHas(map2, key)) {
    mapSet(map2, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map2, key));
  }
  return mapGet(map2, key);
};
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
var MASK6 = 63;
var ENCODE = /* @__PURE__ */ strSplit(
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
);
var encode = (num) => ENCODE[num & MASK6];
var getRandomValues = GLOBAL.crypto ? (array) => GLOBAL.crypto.getRandomValues(array) : (
  /* istanbul ignore next */
  (array) => arrayMap(array, () => mathFloor(math.random() * 256))
);
var getUniqueId = (length = 16) => arrayReduce(
  getRandomValues(new Uint8Array(length)),
  (uniqueId, number) => uniqueId + encode(number),
  EMPTY_STRING
);
var stampNew = (value, hlc) => hlc ? [value, hlc] : [value];
var getLatestHlc = (hlc1, hlc2) => (
  /* istanbul ignore next */
  ((hlc1 ?? "") > (hlc2 ?? "") ? hlc1 : hlc2) ?? ""
);
var stampNewObj = (hlc = EMPTY_STRING) => stampNew(objNew(), hlc);
var INTEGER = /^\d+$/;
var getPoolFunctions = () => {
  const pool = [];
  let nextId = 0;
  return [
    (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING + nextId++,
    (id) => {
      if (test(INTEGER, id) && size(pool) < 1e3) {
        arrayPush(pool, id);
      }
    }
  ];
};
var setNew = (entryOrEntries) => new Set(
  isArray(entryOrEntries) || isUndefined(entryOrEntries) ? entryOrEntries : [entryOrEntries]
);
var setAdd = (set, value) => set?.add(value);
var getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING]) => {
  const leaves = [];
  const deep = (node, p) => p == size(path) ? arrayPush(leaves, node) : isNull(path[p]) ? collForEach(node, (node2) => deep(node2, p + 1)) : arrayForEach([path[p], null], (id) => deep(mapGet(node, id), p + 1));
  deep(deepIdSet, 0);
  return leaves;
};
var getListenerFunctions = (getThing) => {
  let thing;
  const [getId, releaseId] = getPoolFunctions();
  const allListeners = mapNew();
  const addListener = (listener, idSetNode, path, pathGetters = [], extraArgsGetter = () => []) => {
    thing ??= getThing();
    const id = getId(1);
    mapSet(allListeners, id, [
      listener,
      idSetNode,
      path,
      pathGetters,
      extraArgsGetter
    ]);
    setAdd(visitTree(idSetNode, path ?? [EMPTY_STRING], setNew), id);
    return id;
  };
  const callListeners = (idSetNode, ids, ...extraArgs) => arrayForEach(
    getWildcardedLeaves(idSetNode, ids),
    (set) => collForEach(
      set,
      (id) => mapGet(allListeners, id)[0](thing, ...ids ?? [], ...extraArgs)
    )
  );
  const delListener = (id) => ifNotUndefined(mapGet(allListeners, id), ([, idSetNode, idOrNulls]) => {
    visitTree(idSetNode, idOrNulls ?? [EMPTY_STRING], void 0, (idSet) => {
      collDel(idSet, id);
      return collIsEmpty(idSet) ? 1 : 0;
    });
    mapSet(allListeners, id);
    releaseId(id);
    return idOrNulls;
  });
  const callListener = (id) => ifNotUndefined(
    mapGet(allListeners, id),
    ([listener, , path = [], pathGetters, extraArgsGetter]) => {
      const callWithIds = (...ids) => {
        const index = size(ids);
        if (index == size(path)) {
          listener(thing, ...ids, ...extraArgsGetter(ids));
        } else if (isNull(path[index])) {
          arrayForEach(
            pathGetters[index]?.(...ids) ?? [],
            (id2) => callWithIds(...ids, id2)
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
var scheduleRunning = mapNew();
var scheduleActions = mapNew();
var getStoreFunctions = (persist = 1, store, isSynchronizer) => persist != 1 && store.isMergeable() ? [
  1,
  store.getMergeableContent,
  () => store.getTransactionMergeableChanges(!isSynchronizer),
  ([[changedTables], [changedValues]]) => !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
  store.setDefaultContent
] : persist != 2 ? [
  0,
  store.getContent,
  store.getTransactionChanges,
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
    if (isAutoSaving() && store.hadMutated?.()) {
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
  const getStore = () => store;
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
    getStore,
    destroy,
    getStats,
    ...extra
  };
  return objFreeze(persister);
};
var createCustomSynchronizer = (store, send, registerReceive, extraDestroy, requestTimeoutSeconds, onSend, onReceive, onIgnoredError, extra = {}) => {
  let syncing = 0;
  let persisterListener;
  let sends = 0;
  let receives = 0;
  const pendingRequests = mapNew();
  const getTransactionId = () => getUniqueId(11);
  const sendImpl = (toClientId, requestId, message, body) => {
    sends++;
    onSend?.(toClientId, requestId, message, body);
    send(toClientId, requestId, message, body);
  };
  const request = async (toClientId, message, body, transactionId) => promiseNew((resolve, reject) => {
    const requestId = transactionId + DOT + getUniqueId(4);
    const timeout = startTimeout(() => {
      collDel(pendingRequests, requestId);
      reject(
        `No response from ${toClientId ?? "anyone"} to ${requestId}, ` + message
      );
    }, requestTimeoutSeconds);
    mapSet(pendingRequests, requestId, [
      toClientId,
      (response, fromClientId) => {
        clearTimeout(timeout);
        collDel(pendingRequests, requestId);
        resolve([response, fromClientId, transactionId]);
      }
    ]);
    sendImpl(toClientId, requestId, message, body);
  });
  const mergeTablesStamps = (tablesStamp, [tableStamps2, tablesTime2]) => {
    objForEach(tableStamps2, ([rowStamps2, tableTime2], tableId) => {
      const tableStamp = objEnsure(tablesStamp[0], tableId, stampNewObj);
      objForEach(rowStamps2, ([cellStamps2, rowTime2], rowId) => {
        const rowStamp = objEnsure(tableStamp[0], rowId, stampNewObj);
        objForEach(
          cellStamps2,
          ([cell2, cellTime2], cellId) => rowStamp[0][cellId] = stampNew(cell2, cellTime2)
        );
        rowStamp[1] = getLatestHlc(rowStamp[1], rowTime2);
      });
      tableStamp[1] = getLatestHlc(tableStamp[1], tableTime2);
    });
    tablesStamp[1] = getLatestHlc(tablesStamp[1], tablesTime2);
  };
  const getChangesFromOtherStore = (otherClientId = null, otherContentHashes, transactionId = getTransactionId()) => tryCatch(async () => {
    if (isUndefined(otherContentHashes)) {
      [otherContentHashes, otherClientId, transactionId] = await request(
        null,
        1,
        EMPTY_STRING,
        transactionId
      );
    }
    const [otherTablesHash, otherValuesHash] = otherContentHashes;
    const [tablesHash, valuesHash] = store.getMergeableContentHashes();
    let tablesChanges = stampNewObj();
    if (tablesHash != otherTablesHash) {
      const [newTables, differentTableHashes] = (await request(
        otherClientId,
        4,
        store.getMergeableTableHashes(),
        transactionId
      ))[0];
      tablesChanges = newTables;
      if (!objIsEmpty(differentTableHashes)) {
        const [newRows, differentRowHashes] = (await request(
          otherClientId,
          5,
          store.getMergeableRowHashes(differentTableHashes),
          transactionId
        ))[0];
        mergeTablesStamps(tablesChanges, newRows);
        if (!objIsEmpty(differentRowHashes)) {
          const newCells = (await request(
            otherClientId,
            6,
            store.getMergeableCellHashes(differentRowHashes),
            transactionId
          ))[0];
          mergeTablesStamps(tablesChanges, newCells);
        }
      }
    }
    return [
      tablesChanges,
      valuesHash == otherValuesHash ? stampNewObj() : (await request(
        otherClientId,
        7,
        store.getMergeableValueHashes(),
        transactionId
      ))[0],
      1
    ];
  }, onIgnoredError);
  const getPersisted = async () => {
    const changes = await getChangesFromOtherStore();
    return changes && (!objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0])) ? changes : void 0;
  };
  const setPersisted = async (_getContent, changes) => changes ? sendImpl(null, getTransactionId(), 3, changes) : sendImpl(
    null,
    getTransactionId(),
    2,
    store.getMergeableContentHashes()
  );
  const addPersisterListener = (listener) => persisterListener = listener;
  const delPersisterListener = () => persisterListener = void 0;
  const startSync = async (initialContent) => {
    syncing = 1;
    return await persister.startAutoPersisting(initialContent);
  };
  const stopSync = async () => {
    syncing = 0;
    await persister.stopAutoPersisting();
    return persister;
  };
  const destroy = async () => {
    await persister.stopSync();
    extraDestroy();
    return persister;
  };
  const getSynchronizerStats = () => ({ sends, receives });
  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    2,
    // MergeableStoreOnly
    { startSync, stopSync, destroy, getSynchronizerStats, ...extra },
    1
  );
  registerReceive((fromClientId, transactionOrRequestId, message, body) => {
    const isAutoLoading = syncing || persister.isAutoLoading();
    receives++;
    onReceive?.(fromClientId, transactionOrRequestId, message, body);
    if (message == 0) {
      ifNotUndefined(
        mapGet(pendingRequests, transactionOrRequestId),
        ([toClientId, handleResponse]) => isNull(toClientId) || toClientId == fromClientId ? handleResponse(body, fromClientId) : (
          /* istanbul ignore next */
          0
        )
      );
    } else if (message == 2 && isAutoLoading) {
      getChangesFromOtherStore(
        fromClientId,
        body,
        transactionOrRequestId ?? void 0
      ).then((changes) => {
        persisterListener?.(void 0, changes);
      }).catch(onIgnoredError);
    } else if (message == 3 && isAutoLoading) {
      persisterListener?.(void 0, body);
    } else {
      ifNotUndefined(
        message == 1 && (syncing || persister.isAutoSaving()) ? store.getMergeableContentHashes() : message == 4 ? store.getMergeableTableDiff(body) : message == 5 ? store.getMergeableRowDiff(body) : message == 6 ? store.getMergeableCellDiff(body) : message == 7 ? store.getMergeableValueDiff(body) : void 0,
        (response) => {
          sendImpl(
            fromClientId,
            transactionOrRequestId,
            0,
            response
          );
        }
      );
    }
  });
  return persister;
};
var createWsSynchronizer = async (store, webSocket, requestTimeoutSeconds = 1, onSend, onReceive, onIgnoredError) => {
  const addEventListener = (event, handler) => {
    webSocket.addEventListener(event, handler);
    return () => webSocket.removeEventListener(event, handler);
  };
  const registerReceive = (receive) => addEventListener(
    MESSAGE,
    ({ data }) => receivePayload(data.toString(UTF8), receive)
  );
  const send = (toClientId, ...args) => webSocket.send(createPayload(toClientId, ...args));
  const destroy = () => {
    webSocket.close();
  };
  const synchronizer = createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    requestTimeoutSeconds,
    onSend,
    onReceive,
    onIgnoredError,
    { getWebSocket: () => webSocket }
  );
  return promiseNew((resolve) => {
    if (webSocket.readyState != webSocket.OPEN) {
      const onAttempt = (error) => {
        if (error) {
          onIgnoredError?.(error);
        }
        removeOpenListener();
        removeErrorListener();
        resolve(synchronizer);
      };
      const removeOpenListener = addEventListener(OPEN, () => onAttempt());
      const removeErrorListener = addEventListener(ERROR, onAttempt);
    } else {
      resolve(synchronizer);
    }
  });
};
export {
  createWsSynchronizer
};
