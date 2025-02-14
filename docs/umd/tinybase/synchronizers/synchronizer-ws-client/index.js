(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyBaseSynchronizerWsClient = {})));
})(this, function (exports) {
  'use strict';

  const EMPTY_STRING = '';
  const UTF8 = 'utf8';
  const OPEN = 'open';
  const MESSAGE = 'message';
  const ERROR = 'error';
  const UNDEFINED = '\uFFFC';
  const strSplit = (str, separator = EMPTY_STRING, limit) =>
    str.split(separator, limit);

  const promise = Promise;
  const GLOBAL = globalThis;
  const THOUSAND = 1e3;
  const startTimeout = (callback, sec = 0) =>
    setTimeout(callback, sec * THOUSAND);
  const math = Math;
  const mathFloor = math.floor;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isArray = (thing) => Array.isArray(thing);
  const slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
  const size = (arrayOrString) => arrayOrString.length;
  const test = (regex, subject) => regex.test(subject);
  const promiseNew = (resolver) => new promise(resolver);
  const errorNew = (message) => {
    throw new Error(message);
  };

  const arrayForEach = (array, cb) => array.forEach(cb);
  const arrayMap = (array, cb) => array.map(cb);
  const arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
  const arrayClear = (array, to) => array.splice(0, to);
  const arrayPush = (array, ...values) => array.push(...values);
  const arrayShift = (array) => array.shift();

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
  const objFreeze = object.freeze;
  const objNew = (entries = []) => object.fromEntries(entries);
  const objHas = (obj, id) => id in obj;
  const objForEach = (obj, cb) =>
    arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));
  const objSize = (obj) => size(objIds(obj));
  const objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
  const objEnsure = (obj, id, getDefaultValue) => {
    if (!objHas(obj, id)) {
      obj[id] = getDefaultValue();
    }
    return obj[id];
  };

  const jsonString = JSON.stringify;
  const jsonParse = JSON.parse;
  const jsonStringWithUndefined = (obj) =>
    jsonString(obj, (_key, value) => (value === void 0 ? UNDEFINED : value));
  const jsonParseWithUndefined = (str) =>
    jsonParse(str, (_key, value) => (value === UNDEFINED ? void 0 : value));

  const MESSAGE_SEPARATOR = '\n';
  const ifPayloadValid = (payload, then) => {
    const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
    if (splitAt !== -1) {
      then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
    }
  };
  const receivePayload = (payload, receive) =>
    ifPayloadValid(payload, (fromClientId, remainder) =>
      receive(fromClientId, ...jsonParseWithUndefined(remainder)),
    );
  const createPayload = (toClientId, ...args) =>
    createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));
  const createRawPayload = (clientId, remainder) =>
    clientId + MESSAGE_SEPARATOR + remainder;

  const collSize = (coll) => coll?.size ?? 0;
  const collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
  const collIsEmpty = (coll) => isUndefined(coll) || collSize(coll) == 0;
  const collForEach = (coll, cb) => coll?.forEach(cb);
  const collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);

  const mapNew = (entries) => new Map(entries);
  const mapGet = (map, key) => map?.get(key);
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

  const stampNew = (value, time) => (time ? [value, time] : [value]);
  const getLatestTime = (time1, time2) =>
    /* istanbul ignore next */
    ((time1 ?? '') > (time2 ?? '') ? time1 : time2) ?? '';
  const stampNewObj = (time = EMPTY_STRING) => stampNew(objNew(), time);

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
          } catch (error) {
            /* istanbul ignore next */
            onIgnoredError?.(error);
          }
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
            onIgnoredError?.(error);
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
      } catch (error) {
        /* istanbul ignore next */
        onIgnoredError?.(error);
      }
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
          } catch (error) {
            /* istanbul ignore next */
            onIgnoredError?.(error);
          }
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

  const MASK6 = 63;
  const ENCODE = /* @__PURE__ */ strSplit(
    '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
  );
  const encode = (num) => ENCODE[num & MASK6];

  const getRandomValues = GLOBAL.crypto
    ? (array) => GLOBAL.crypto.getRandomValues(array)
    : /* istanbul ignore next */
      (array) => arrayMap(array, () => mathFloor(math.random() * 256));
  const getUniqueId = (length = 16) =>
    arrayReduce(
      getRandomValues(new Uint8Array(length)),
      (uniqueId, number) => uniqueId + encode(number),
      '',
    );

  const createCustomSynchronizer = (
    store,
    send,
    registerReceive,
    destroyImpl,
    requestTimeoutSeconds,
    onSend,
    onReceive,
    onIgnoredError,
    extra = {},
  ) => {
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
    const request = async (toClientId, message, body, transactionId) =>
      promiseNew((resolve, reject) => {
        const requestId = transactionId + '.' + getUniqueId(4);
        const timeout = startTimeout(() => {
          collDel(pendingRequests, requestId);
          reject(
            `No response from ${toClientId ?? 'anyone'} to ${requestId}, ` +
              message,
          );
        }, requestTimeoutSeconds);
        mapSet(pendingRequests, requestId, [
          toClientId,
          (response, fromClientId) => {
            clearTimeout(timeout);
            collDel(pendingRequests, requestId);
            resolve([response, fromClientId, transactionId]);
          },
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
            ([cell2, cellTime2], cellId) =>
              (rowStamp[0][cellId] = stampNew(cell2, cellTime2)),
          );
          rowStamp[1] = getLatestTime(rowStamp[1], rowTime2);
        });
        tableStamp[1] = getLatestTime(tableStamp[1], tableTime2);
      });
      tablesStamp[1] = getLatestTime(tablesStamp[1], tablesTime2);
    };
    const getChangesFromOtherStore = async (
      otherClientId = null,
      otherContentHashes,
      transactionId = getTransactionId(),
    ) => {
      try {
        if (isUndefined(otherContentHashes)) {
          [otherContentHashes, otherClientId, transactionId] = await request(
            null,
            1 /* GetContentHashes */,
            EMPTY_STRING,
            transactionId,
          );
        }
        const [otherTablesHash, otherValuesHash] = otherContentHashes;
        const [tablesHash, valuesHash] = store.getMergeableContentHashes();
        let tablesChanges = stampNewObj();
        if (tablesHash != otherTablesHash) {
          const [newTables, differentTableHashes] = (
            await request(
              otherClientId,
              4 /* GetTableDiff */,
              store.getMergeableTableHashes(),
              transactionId,
            )
          )[0];
          tablesChanges = newTables;
          if (!objIsEmpty(differentTableHashes)) {
            const [newRows, differentRowHashes] = (
              await request(
                otherClientId,
                5 /* GetRowDiff */,
                store.getMergeableRowHashes(differentTableHashes),
                transactionId,
              )
            )[0];
            mergeTablesStamps(tablesChanges, newRows);
            if (!objIsEmpty(differentRowHashes)) {
              const newCells = (
                await request(
                  otherClientId,
                  6 /* GetCellDiff */,
                  store.getMergeableCellHashes(differentRowHashes),
                  transactionId,
                )
              )[0];
              mergeTablesStamps(tablesChanges, newCells);
            }
          }
        }
        return [
          tablesChanges,
          valuesHash == otherValuesHash
            ? stampNewObj()
            : (
                await request(
                  otherClientId,
                  7 /* GetValueDiff */,
                  store.getMergeableValueHashes(),
                  transactionId,
                )
              )[0],
          1,
        ];
      } catch (error) {
        onIgnoredError?.(error);
      }
    };
    const getPersisted = async () => {
      const changes = await getChangesFromOtherStore();
      return changes &&
        (!objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0]))
        ? changes
        : void 0;
    };
    const setPersisted = async (_getContent, changes) =>
      changes
        ? sendImpl(null, getTransactionId(), 3 /* ContentDiff */, changes)
        : sendImpl(
            null,
            getTransactionId(),
            2 /* ContentHashes */,
            store.getMergeableContentHashes(),
          );
    const addPersisterListener = (listener) => (persisterListener = listener);
    const delPersisterListener = () => (persisterListener = void 0);
    const startSync = async (initialContent) => {
      syncing = 1;
      return await (
        await persister.startAutoLoad(initialContent)
      ).startAutoSave();
    };
    const stopSync = () => {
      syncing = 0;
      return persister.stopAutoLoad().stopAutoSave();
    };
    const destroy = () => {
      destroyImpl();
      return persister.stopSync();
    };
    const getSynchronizerStats = () => ({sends, receives});
    const persister = createCustomPersister(
      store,
      getPersisted,
      setPersisted,
      addPersisterListener,
      delPersisterListener,
      onIgnoredError,
      2,
      // MergeableStoreOnly
      {startSync, stopSync, destroy, getSynchronizerStats, ...extra},
      1,
    );
    registerReceive((fromClientId, transactionOrRequestId, message, body) => {
      const isAutoLoading = syncing || persister.isAutoLoading();
      receives++;
      onReceive?.(fromClientId, transactionOrRequestId, message, body);
      if (message == 0 /* Response */) {
        ifNotUndefined(
          mapGet(pendingRequests, transactionOrRequestId),
          ([toClientId, handleResponse]) =>
            isUndefined(toClientId) || toClientId == fromClientId
              ? handleResponse(body, fromClientId)
              : /* istanbul ignore next */
                0,
        );
      } else if (message == 2 /* ContentHashes */ && isAutoLoading) {
        getChangesFromOtherStore(
          fromClientId,
          body,
          transactionOrRequestId ?? void 0,
        )
          .then((changes) => {
            persisterListener?.(void 0, changes);
          })
          .catch(onIgnoredError);
      } else if (message == 3 /* ContentDiff */ && isAutoLoading) {
        persisterListener?.(void 0, body);
      } else {
        ifNotUndefined(
          message == 1 /* GetContentHashes */ &&
            (syncing || persister.isAutoSaving())
            ? store.getMergeableContentHashes()
            : message == 4 /* GetTableDiff */
              ? store.getMergeableTableDiff(body)
              : message == 5 /* GetRowDiff */
                ? store.getMergeableRowDiff(body)
                : message == 6 /* GetCellDiff */
                  ? store.getMergeableCellDiff(body)
                  : message == 7 /* GetValueDiff */
                    ? store.getMergeableValueDiff(body)
                    : void 0,
          (response) => {
            sendImpl(
              fromClientId,
              transactionOrRequestId,
              0 /* Response */,
              response,
            );
          },
        );
      }
    });
    return persister;
  };

  const createWsSynchronizer = async (
    store,
    webSocket,
    requestTimeoutSeconds = 1,
    onSend,
    onReceive,
    onIgnoredError,
  ) => {
    const addEventListener = (event, handler) => {
      webSocket.addEventListener(event, handler);
      return () => webSocket.removeEventListener(event, handler);
    };
    const registerReceive = (receive) =>
      addEventListener(MESSAGE, ({data}) =>
        receivePayload(data.toString(UTF8), receive),
      );
    const send = (toClientId, ...args) =>
      webSocket.send(createPayload(toClientId, ...args));
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
      {getWebSocket: () => webSocket},
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

  exports.createWsSynchronizer = createWsSynchronizer;
});
