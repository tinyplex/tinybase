(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyBasePersisterRemote = {})));
})(this, function (exports) {
  'use strict';

  const EMPTY_STRING = '';

  const THOUSAND = 1e3;
  const startInterval = (callback, sec, immediate) => {
    return setInterval(callback, sec * THOUSAND);
  };
  const stopInterval = clearInterval;
  const isInstanceOf = (thing, cls) => thing instanceof cls;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isArray = (thing) => Array.isArray(thing);
  const size = (arrayOrString) => arrayOrString.length;
  const test = (regex, subject) => regex.test(subject);
  const errorNew = (message) => {
    throw new Error(message);
  };

  const arrayForEach = (array, cb) => array.forEach(cb);
  const arrayClear = (array, to) => array.splice(0, to);
  const arrayPush = (array, ...values) => array.push(...values);
  const arrayShift = (array) => array.shift();

  const object = Object;
  const getPrototypeOf = (obj) => object.getPrototypeOf(obj);
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
  const objSize = (obj) => size(objIds(obj));
  const objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;

  const jsonString = JSON.stringify;
  const jsonParse = JSON.parse;
  const jsonStringWithMap = (obj) =>
    jsonString(obj, (_key, value) =>
      isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
    );

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

  const getETag = (response) => response.headers.get('ETag');
  const createRemotePersister = (
    store,
    loadUrl,
    saveUrl,
    autoLoadIntervalSeconds = 5,
    onIgnoredError,
  ) => {
    let lastEtag;
    const getPersisted = async () => {
      const response = await fetch(loadUrl);
      lastEtag = getETag(response);
      return jsonParse(await response.text());
    };
    const setPersisted = async (getContent) =>
      await fetch(saveUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: jsonStringWithMap(getContent()),
      });
    const addPersisterListener = (listener) =>
      startInterval(async () => {
        const response = await fetch(loadUrl, {method: 'HEAD'});
        const currentEtag = getETag(response);
        if (
          !isUndefined(lastEtag) &&
          !isUndefined(currentEtag) &&
          currentEtag != lastEtag
        ) {
          lastEtag = currentEtag;
          listener();
        }
      }, autoLoadIntervalSeconds);
    const delPersisterListener = (interval) => stopInterval(interval);
    return createCustomPersister(
      store,
      getPersisted,
      setPersisted,
      addPersisterListener,
      delPersisterListener,
      onIgnoredError,
      1,
      // StoreOnly,
      {getUrls: () => [loadUrl, saveUrl]},
    );
  };

  exports.createRemotePersister = createRemotePersister;
});
