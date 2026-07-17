// dist/persisters/persister-remote/index.js
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var promise = Promise;
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var THOUSAND = 1e3;
var startInterval = (callback, sec, immediate) => {
  return setInterval(callback, sec * THOUSAND);
};
var stopInterval = (interval) => clearInterval(interval);
var isInstanceOf = (thing, cls) => thing instanceof cls;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var isNull = (thing) => thing === null;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isArray = (thing) => Array.isArray(thing);
var size = (thing) => thing.length;
var isEmpty = (thing) => size(thing) == 0;
var test = (regex, subject) => regex.test(subject);
var promiseNew = (resolver) => new promise(resolver);
var ERROR_STORE_TYPE = 0;
var ERROR_CONTENT = 1;
var errorNew = (code, details) => new Error(
  TINYBASE + ":" + code + (isUndefined(details) ? EMPTY_STRING : (
    /* istanbul ignore next */
    ":" + details
  ))
);
var errorThrow = (code, details) => {
  throw errorNew(code, details);
};
var tryReturn = (tryF, catchReturn) => {
  try {
    return tryF();
  } catch {
    return catchReturn;
  }
};
var tryCatch = async (action, onError) => {
  try {
    return await action();
  } catch (error) {
    onError?.(error);
  }
};
var tryCatchSync = (action, onError) => {
  try {
    return action();
  } catch (error) {
    onError?.(error);
  }
};
var tryFinally = (action, finallyAction) => {
  try {
    return action();
  } finally {
    finallyAction();
  }
};
var tryFinallyAsync = async (action, finallyAction) => {
  try {
    return await action();
  } finally {
    await finallyAction();
  }
};
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayMap = (array, cb) => array.map(cb);
var arrayFilter = (array, cb) => array.filter(cb);
var arrayClear = (array, to = size(array)) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var isObject = (obj) => !isNullish(obj) && ifNotNullish(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isNullish(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds = object.keys;
var objFreeze = object.freeze;
var objSet = (obj, id, value) => {
  object.defineProperty(obj, id, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
  return value;
};
var objNew = (entries = []) => {
  const obj = object.create(null);
  arrayForEach(entries, ([id, value]) => objSet(obj, id, value));
  return obj;
};
var objSize = (obj) => size(objIds(obj));
var objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
var jsonStringWithMap = (obj) => jsonString(
  obj,
  (_key, value) => isInstanceOf(value, Map) ? objNew([...value]) : value
);
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
  let value = mapGet(map2, key);
  if (collHas(map2, key)) {
    hadExistingValue?.(value);
  } else {
    mapSet(map2, key, value = getDefaultValue());
  }
  return value;
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
  const callListenersImpl = (continueAfterError, idSetNode, ids, extraArgs) => {
    let errorToThrow;
    let failed = false;
    arrayForEach(
      getWildcardedLeaves(idSetNode, ids),
      (set) => collForEach(set, (id) => {
        const callListener2 = () => mapGet(allListeners, id)[0](thing, ...ids ?? [], ...extraArgs);
        if (continueAfterError) {
          tryCatchSync(callListener2, (error) => {
            if (!failed) {
              errorToThrow = error;
            }
            failed = true;
          });
        } else {
          callListener2();
        }
      })
    );
    if (failed) {
      throw errorToThrow;
    }
  };
  const callListeners = (idSetNode, ids, ...extraArgs) => callListenersImpl(false, idSetNode, ids, extraArgs);
  const callListenersThenThrow = (idSetNode, ids, ...extraArgs) => callListenersImpl(true, idSetNode, ids, extraArgs);
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
  return [
    addListener,
    callListeners,
    delListener,
    callListener,
    callListenersThenThrow
  ];
};
var scheduleRunning = mapNew();
var scheduleActions = mapNew();
var scheduleReferences = mapNew();
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
] : errorThrow(ERROR_STORE_TYPE);
var createCustomPersister = (store, getPersisted, setPersisted, addPersisterListener, delPersisterListener, onIgnoredError, persist, extra = {}, isSynchronizer = 0, scheduleId = []) => {
  let status = 0;
  let loads = 0;
  let saves = 0;
  let autoLoadHandle;
  let autoLoadPromise;
  let autoLoadGeneration = 0;
  let pendingAutoLoads = 0;
  let pendingScheduledAutoLoads = 0;
  let autoLoadAfterSaveGeneration = 0;
  let autoSaveListenerId;
  let autoSaveGeneration = 0;
  let destroyed = 0;
  let destroying;
  let activeAction;
  const scheduleOwner = {};
  const extraDestroy = extra.destroy;
  mapEnsure(scheduleRunning, scheduleId, () => 0);
  mapEnsure(scheduleActions, scheduleId, () => []);
  mapSet(
    scheduleReferences,
    scheduleId,
    (mapGet(scheduleReferences, scheduleId) ?? 0) + 1
  );
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
      const scheduledActions = mapGet(scheduleActions, scheduleId);
      let actionIndex = 0;
      await tryFinallyAsync(
        async () => {
          while (actionIndex < size(scheduledActions)) {
            const scheduledAction = scheduledActions[actionIndex++];
            scheduledAction[2] = void 0;
            await scheduledAction[0]();
          }
        },
        () => {
          arrayClear(scheduledActions, actionIndex);
          mapSet(scheduleRunning, scheduleId, 0);
          pruneSchedule();
        }
      );
    }
  };
  const pruneSchedule = () => {
    if (!mapGet(scheduleReferences, scheduleId) && !mapGet(scheduleRunning, scheduleId) && isEmpty(mapGet(scheduleActions, scheduleId) ?? [])) {
      mapSet(scheduleRunning, scheduleId);
      mapSet(scheduleActions, scheduleId);
      mapSet(scheduleReferences, scheduleId);
    }
  };
  const setContentOrChanges = (contentOrChanges) => {
    (isMergeableStore && isArray(contentOrChanges?.[0]) ? contentOrChanges?.[2] === 1 ? store.__[4] : store.__[3] : contentOrChanges?.[2] === 1 ? store._[10] : store._[9])(contentOrChanges);
  };
  const saveAfterMutated = async () => {
    if (isAutoSaving() && store.__?.[0]?.()) {
      await save();
    }
  };
  const trackAutoLoadPromise = (newAutoLoadPromise) => tryFinallyAsync(
    () => autoLoadPromise = newAutoLoadPromise,
    () => {
      if (autoLoadPromise == newAutoLoadPromise) {
        autoLoadPromise = void 0;
      }
    }
  );
  const load = async (initialContent) => {
    if (status != 2) {
      await tryFinallyAsync(
        async () => {
          setStatus(
            1
            /* Loading */
          );
          loads++;
          await schedule(
            () => tryCatch(
              async () => {
                const content = await getPersisted();
                if (isArray(content)) {
                  setContentOrChanges(content);
                } else if (isUndefined(content) && initialContent) {
                  setDefaultContent(initialContent);
                } else if (!isUndefined(content)) {
                  errorThrow(ERROR_CONTENT, content);
                }
              },
              (error) => {
                onIgnoredError?.(error);
                if (initialContent) {
                  setDefaultContent(initialContent);
                }
              }
            )
          );
        },
        () => setStatus(
          0
          /* Idle */
        )
      );
      await saveAfterMutated();
    }
    return persister;
  };
  const runAutoLoadAfterSave = async () => {
    const generation = autoLoadAfterSaveGeneration;
    autoLoadAfterSaveGeneration = 0;
    if (generation && generation == autoLoadGeneration && !destroyed) {
      if (status == 2) {
        autoLoadAfterSaveGeneration = generation;
      } else {
        await load();
      }
    }
  };
  const startAutoLoad = async (initialContent) => {
    const generation = ++autoLoadGeneration;
    let initialLoadPending = true;
    await stopAutoLoad(true);
    if (generation == autoLoadGeneration && !destroyed) {
      const listenerPromise = tryCatch(async () => {
        const handle = await addPersisterListener(async (content, changes) => {
          if (generation == autoLoadGeneration && !destroyed) {
            if (changes || content) {
              const shouldSchedule = initialLoadPending || status == 2 || !!pendingScheduledAutoLoads;
              pendingAutoLoads++;
              if (shouldSchedule) {
                pendingScheduledAutoLoads++;
              }
              await tryFinallyAsync(
                async () => {
                  setStatus(
                    1
                    /* Loading */
                  );
                  loads++;
                  await (shouldSchedule ? schedule(() => setContentOrChanges(changes ?? content)) : tryFinally(
                    () => setContentOrChanges(changes ?? content),
                    () => setStatus(
                      0
                      /* Idle */
                    )
                  ));
                },
                () => {
                  if (shouldSchedule) {
                    pendingScheduledAutoLoads--;
                  }
                  if (!--pendingAutoLoads) {
                    setStatus(
                      0
                      /* Idle */
                    );
                  }
                }
              );
              if (!pendingAutoLoads) {
                await saveAfterMutated();
              }
            } else if (status == 2) {
              autoLoadAfterSaveGeneration = generation;
            } else {
              await load();
            }
          }
        });
        if (generation == autoLoadGeneration && !destroyed) {
          autoLoadHandle = handle;
        } else if (!isUndefined(handle)) {
          await delPersisterListener(handle);
        }
      }, onIgnoredError);
      await trackAutoLoadPromise(listenerPromise);
      if (generation == autoLoadGeneration && !destroyed) {
        await tryFinallyAsync(
          () => load(initialContent),
          () => {
            initialLoadPending = false;
          }
        );
      }
    }
    return persister;
  };
  const stopAutoLoad = async (keepGeneration = false) => {
    autoLoadAfterSaveGeneration = 0;
    if (!keepGeneration) {
      autoLoadGeneration++;
    }
    const listenerPromise = autoLoadPromise;
    const handle = autoLoadHandle;
    autoLoadHandle = void 0;
    await trackAutoLoadPromise(
      tryFinallyAsync(
        async () => {
          await listenerPromise;
        },
        async () => {
          if (!isUndefined(handle)) {
            await tryCatch(() => delPersisterListener(handle), onIgnoredError);
          }
        }
      )
    );
    return persister;
  };
  const isAutoLoading = () => !isUndefined(autoLoadHandle);
  const save = async (changes) => {
    if (status != 1) {
      await tryFinallyAsync(
        () => tryFinallyAsync(
          async () => {
            setStatus(
              2
              /* Saving */
            );
            saves++;
            await schedule(
              () => tryCatch(
                () => setPersisted(getContent, changes),
                onIgnoredError
              )
            );
          },
          () => setStatus(
            0
            /* Idle */
          )
        ),
        runAutoLoadAfterSave
      );
    }
    return persister;
  };
  const startAutoSave = async () => {
    const generation = ++autoSaveGeneration;
    await stopAutoSave(true);
    if (generation == autoSaveGeneration && !destroyed) {
      await save();
      if (generation == autoSaveGeneration && !destroyed) {
        autoSaveListenerId = store.addDidFinishTransactionListener(() => {
          if (generation == autoSaveGeneration && !destroyed) {
            const changes = getChanges();
            if (hasChanges(changes)) {
              void tryCatch(() => save(changes));
            }
          }
        });
      }
    }
    return persister;
  };
  const stopAutoSave = async (keepGeneration = false) => {
    if (!keepGeneration) {
      autoSaveGeneration++;
    }
    const listenerId = autoSaveListenerId;
    autoSaveListenerId = void 0;
    if (!isUndefined(listenerId)) {
      store.delListener(listenerId);
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
    await tryFinallyAsync(
      () => call1(),
      async () => {
        await call2();
      }
    );
    return persister;
  };
  const getStatus = () => status;
  const addStatusListener = (listener) => addListener(listener, statusListeners);
  const delListener = (listenerId) => {
    delListenerImpl(listenerId);
    return store;
  };
  const schedule = async (...actions) => {
    let failed = false;
    let firstError;
    const completion = promiseNew(
      (resolve) => !isEmpty(actions) ? arrayPush(
        mapGet(scheduleActions, scheduleId),
        ...arrayMap(actions, (action, index) => {
          const last = index == size(actions) - 1;
          return [
            async () => {
              let completeActiveAction;
              activeAction = promiseNew(
                (resolve2) => completeActiveAction = resolve2
              );
              await tryFinallyAsync(
                async () => {
                  try {
                    await tryCatch(action, onIgnoredError);
                  } catch (error) {
                    if (!failed) {
                      failed = true;
                      firstError = error;
                    }
                  }
                  if (last) {
                    resolve();
                  }
                },
                () => {
                  activeAction = void 0;
                  completeActiveAction();
                }
              );
            },
            last ? resolve : void 0,
            scheduleOwner
          ];
        })
      ) : resolve()
    );
    await run();
    await completion;
    if (failed) {
      throw firstError;
    }
    return persister;
  };
  const getStore = () => store;
  const destroy = async () => {
    if (isUndefined(destroying)) {
      destroyed = 1;
      destroying = (async () => {
        const scheduledActions = mapGet(scheduleActions, scheduleId);
        const remainingActions = arrayFilter(
          scheduledActions,
          ([, complete, owner]) => {
            if (owner == scheduleOwner) {
              complete?.();
              return false;
            }
            return true;
          }
        );
        const actionToAwait = activeAction;
        arrayClear(scheduledActions);
        arrayPush(scheduledActions, ...remainingActions);
        await tryFinallyAsync(
          () => tryFinallyAsync(
            () => tryFinallyAsync(stopAutoPersisting, () => actionToAwait),
            () => extraDestroy?.()
          ),
          () => {
            const references = (mapGet(scheduleReferences, scheduleId) ?? 1) - 1;
            mapSet(scheduleReferences, scheduleId, references || void 0);
            pruneSchedule();
          }
        );
      })();
    }
    await destroying;
    return persister;
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
    getStats,
    ...extra,
    destroy
  };
  return objFreeze(persister);
};
var getETag = (response) => response.headers.get("ETag") ?? EMPTY_STRING;
var getIfNoneMatchHeaders = (lastEtag) => lastEtag == EMPTY_STRING ? void 0 : { "If-None-Match": lastEtag };
var checkResponse = (response, allowNotModified) => {
  if (!response.ok && (!allowNotModified || response.status != 304)) {
    throw response;
  }
};
var createRemotePersister = (store, loadUrl, saveUrl, autoLoadIntervalSeconds = 5, onIgnoredError) => {
  let lastEtag = EMPTY_STRING;
  let lastContent;
  const getPersisted = async () => {
    const response = await fetch(loadUrl, {
      headers: getIfNoneMatchHeaders(lastEtag)
    });
    const notModified = response.status == 304 && !isUndefined(lastContent);
    checkResponse(response, notModified ? 1 : void 0);
    const contentText = notModified ? lastContent : await response.text();
    const content = jsonParse(contentText);
    if (!notModified) {
      lastContent = contentText;
      lastEtag = getETag(response);
    }
    return content;
  };
  const setPersisted = async (getContent) => {
    const response = await fetch(saveUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: jsonStringWithMap(getContent())
    });
    await tryFinallyAsync(
      async () => checkResponse(response),
      () => response.body?.cancel()
    );
  };
  const addPersisterListener = (listener) => {
    let active;
    let controller;
    let stopped = false;
    const poll = () => {
      if (!stopped && isUndefined(active)) {
        controller = new AbortController();
        active = tryFinallyAsync(
          () => tryCatch(
            async () => {
              const response = await fetch(loadUrl, {
                method: "HEAD",
                headers: getIfNoneMatchHeaders(lastEtag),
                signal: controller?.signal
              });
              checkResponse(response, 1);
              if (!stopped && response.status != 304 && getETag(response) != lastEtag) {
                await listener();
              }
            },
            (error) => stopped ? 0 : tryReturn(() => onIgnoredError?.(error))
          ),
          () => {
            active = void 0;
            controller = void 0;
          }
        );
      }
    };
    return [
      startInterval(poll, autoLoadIntervalSeconds),
      async () => {
        stopped = true;
        controller?.abort();
        await active;
      }
    ];
  };
  const delPersisterListener = async ([interval, stop]) => {
    const stopped = stop();
    stopInterval(interval);
    await stopped;
  };
  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    1,
    // StoreOnly,
    { getUrls: () => [loadUrl, saveUrl] }
  );
};
export {
  createRemotePersister
};
