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
  const UNDEFINED = '\uFFFC';

  const promise = Promise;
  const GLOBAL = globalThis;
  const math = Math;
  const mathFloor = math.floor;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isArray = (thing) => Array.isArray(thing);
  const slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
  const size = (arrayOrString) => arrayOrString.length;
  const promiseNew = (resolver) => new promise(resolver);
  const errorNew = (message) => {
    throw new Error(message);
  };

  const arrayForEach = (array, cb) => array.forEach(cb);
  const arrayMap = (array, cb) => array.map(cb);
  const arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
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

  const jsonStringWithUndefined = (obj) =>
    JSON.stringify(obj, (_key, value) =>
      value === void 0 ? UNDEFINED : value,
    );
  const jsonParseWithUndefined = (str) =>
    JSON.parse(str, (_key, value) => (value === UNDEFINED ? void 0 : value));

  const MESSAGE_SEPARATOR = '\n';

  const collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
  const collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);

  const mapNew = (entries) => new Map(entries);
  const mapGet = (map, key) => map?.get(key);
  const mapSet = (map, key, value) =>
    isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
  const mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
    if (!collHas(map, key)) {
      mapSet(map, key, getDefaultValue());
    }
    return mapGet(map, key);
  };

  const Persists = {
    StoreOnly: 1,
    MergeableStoreOnly: 2,
    StoreOrMergeableStore: 3,
  };
  const scheduleRunning = mapNew();
  const scheduleActions = mapNew();
  const getStoreFunctions = (persistable = Persists.StoreOnly, store) =>
    persistable != Persists.StoreOnly && store.isMergeable()
      ? [
          1,
          store.getMergeableContent,
          store.getTransactionMergeableChanges,
          ([[changedTables], [changedValues]]) =>
            !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
          store.setDefaultContent,
        ]
      : persistable != Persists.MergeableStoreOnly
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
    persistable,
    extra = {},
    scheduleId = [],
  ) => {
    let loadSave = 0;
    let loads = 0;
    let saves = 0;
    let action;
    let autoLoadHandle;
    let autoSaveListenerId;
    mapEnsure(scheduleRunning, scheduleId, () => 0);
    mapEnsure(scheduleActions, scheduleId, () => []);
    const [
      isMergeableStore,
      getContent,
      getChanges,
      hasChanges,
      setDefaultContent,
    ] = getStoreFunctions(persistable, store);
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
      if (loadSave != 2) {
        loadSave = 1;
        loads++;
        await schedule(async () => {
          try {
            setContentOrChanges(await getPersisted());
          } catch (error) {
            onIgnoredError?.(error);
            if (initialContent) {
              setDefaultContent(initialContent);
            }
          }
          loadSave = 0;
        });
      }
      return persister;
    };
    const startAutoLoad = async (initialContent) => {
      await stopAutoLoad().load(initialContent);
      autoLoadHandle = addPersisterListener(async (content, changes) => {
        if (changes || content) {
          /* istanbul ignore else */
          if (loadSave != 2) {
            loadSave = 1;
            loads++;
            setContentOrChanges(changes ?? content);
            loadSave = 0;
          }
        } else {
          await load();
        }
      });
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
      if (loadSave != 1) {
        loadSave = 2;
        saves++;
        await schedule(async () => {
          try {
            await setPersisted(getContent, changes);
          } catch (error) {
            /* istanbul ignore next */
            onIgnoredError?.(error);
          }
          loadSave = 0;
        });
      }
      return persister;
    };
    const startAutoSave = async () => {
      await stopAutoSave().save();
      autoSaveListenerId = store.addDidFinishTransactionListener(() => {
        const changes = getChanges();
        if (hasChanges(changes)) {
          save(changes);
        }
      });
      return persister;
    };
    const stopAutoSave = () => {
      ifNotUndefined(autoSaveListenerId, store.delListener);
      autoSaveListenerId = void 0;
      return persister;
    };
    const isAutoSaving = () => !isUndefined(autoSaveListenerId);
    const schedule = async (...actions) => {
      arrayPush(mapGet(scheduleActions, scheduleId), ...actions);
      await run();
      return persister;
    };
    const getStore = () => store;
    const destroy = () => stopAutoLoad().stopAutoSave();
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
      schedule,
      getStore,
      destroy,
      getStats,
      ...extra,
    };
    return objFreeze(persister);
  };

  new GLOBAL.TextEncoder();

  const newStamp = (value, time) => (time ? [value, time] : [value]);
  const getLatestTime = (time1, time2) =>
    ((time1 ?? '') > (time2 ?? '') ? time1 : time2) ?? '';
  const stampNewObj = (time = EMPTY_STRING) => newStamp(objNew(), time);

  const MASK6 = 63;
  const ENCODE =
    '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.split(
      EMPTY_STRING,
    );
  mapNew(arrayMap(ENCODE, (char, index) => [char, index]));
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

  const RESPONSE = 0;
  const GET_CONTENT_HASHES = 1;
  const CONTENT_HASHES = 2;
  const CONTENT_DIFF = 3;
  const GET_TABLE_DIFF = 4;
  const GET_ROW_DIFF = 5;
  const GET_CELL_DIFF = 6;
  const GET_VALUE_DIFF = 7;
  const createCustomSynchronizer = (
    store,
    send,
    onReceive,
    destroyImpl,
    requestTimeoutSeconds,
    onIgnoredError,
    extra = {},
  ) => {
    let persisterListener;
    let sends = 0;
    let receives = 0;
    const pendingRequests = mapNew();
    onReceive((fromClientId, requestId, messageType, messageBody) => {
      receives++;
      if (messageType == RESPONSE) {
        ifNotUndefined(
          mapGet(pendingRequests, requestId),
          ([toClientId, handleResponse]) =>
            isUndefined(toClientId) || toClientId == fromClientId
              ? handleResponse(messageBody, fromClientId)
              : /* istanbul ignore next */
                0,
        );
      } else if (messageType == CONTENT_HASHES && persister.isAutoLoading()) {
        getChangesFromOtherStore(fromClientId, messageBody).then((changes) => {
          persisterListener?.(void 0, changes);
        });
      } else if (messageType == CONTENT_DIFF && persister.isAutoLoading()) {
        persisterListener?.(void 0, messageBody);
      } else {
        ifNotUndefined(
          messageType == GET_CONTENT_HASHES && persister.isAutoSaving()
            ? store.getMergeableContentHashes()
            : messageType == GET_TABLE_DIFF
              ? store.getMergeableTableDiff(messageBody)
              : messageType == GET_ROW_DIFF
                ? store.getMergeableRowDiff(messageBody)
                : messageType == GET_CELL_DIFF
                  ? store.getMergeableCellDiff(messageBody)
                  : messageType == GET_VALUE_DIFF
                    ? store.getMergeableValueDiff(messageBody)
                    : void 0,
          (response) => {
            sends++;
            send(fromClientId, requestId, RESPONSE, response);
          },
        );
      }
    });
    const request = async (
      toClientId,
      messageType,
      messageBody = EMPTY_STRING,
    ) =>
      promiseNew((resolve, reject) => {
        const requestId = getUniqueId();
        const timeout = setTimeout(() => {
          collDel(pendingRequests, requestId);
          reject(
            `No response from ${toClientId ?? 'anyone'} to '${messageType}'`,
          );
        }, requestTimeoutSeconds * 1e3);
        mapSet(pendingRequests, requestId, [
          toClientId,
          (response, fromClientId) => {
            clearTimeout(timeout);
            collDel(pendingRequests, requestId);
            resolve([response, fromClientId]);
          },
        ]);
        sends++;
        send(toClientId, requestId, messageType, messageBody);
      });
    const mergeTablesStamps = (tablesStamp, [tableStamps2, tablesTime2]) => {
      objForEach(tableStamps2, ([rowStamps2, tableTime2], tableId) => {
        const tableStamp = objEnsure(tablesStamp[0], tableId, stampNewObj);
        objForEach(rowStamps2, ([cellStamps2, rowTime2], rowId) => {
          const rowStamp = objEnsure(tableStamp[0], rowId, stampNewObj);
          objForEach(
            cellStamps2,
            ([cell2, cellTime2], cellId) =>
              (rowStamp[0][cellId] = newStamp(cell2, cellTime2)),
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
    ) => {
      if (isUndefined(otherContentHashes)) {
        [otherContentHashes, otherClientId] = await request(
          otherClientId,
          GET_CONTENT_HASHES,
        );
      }
      const [otherTablesHash, otherValuesHash] = otherContentHashes;
      const [tablesHash, valuesHash] = store.getMergeableContentHashes();
      let tablesChanges = stampNewObj();
      if (tablesHash != otherTablesHash) {
        const [newTables, differentTableHashes] = (
          await request(
            otherClientId,
            GET_TABLE_DIFF,
            store.getMergeableTableHashes(),
          )
        )[0];
        tablesChanges = newTables;
        if (!objIsEmpty(differentTableHashes)) {
          const [newRows, differentRowHashes] = (
            await request(
              otherClientId,
              GET_ROW_DIFF,
              store.getMergeableRowHashes(differentTableHashes),
            )
          )[0];
          mergeTablesStamps(tablesChanges, newRows);
          if (!objIsEmpty(differentRowHashes)) {
            const newCells = (
              await request(
                otherClientId,
                GET_CELL_DIFF,
                store.getMergeableCellHashes(differentRowHashes),
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
                GET_VALUE_DIFF,
                store.getMergeableValueHashes(),
              )
            )[0],
        1,
      ];
    };
    const getPersisted = async () => {
      const changes = await getChangesFromOtherStore();
      return !objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0])
        ? changes
        : void 0;
    };
    const setPersisted = async (_getContent, changes) => {
      sends++;
      if (changes) {
        send(null, null, CONTENT_DIFF, changes);
      } else {
        send(null, null, CONTENT_HASHES, store.getMergeableContentHashes());
      }
    };
    const addPersisterListener = (listener) => (persisterListener = listener);
    const delPersisterListener = () => (persisterListener = void 0);
    const startSync = async (initialContent) =>
      await (await persister.startAutoLoad(initialContent)).startAutoSave();
    const stopSync = () => persister.stopAutoLoad().stopAutoSave();
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
      Persists.MergeableStoreOnly,
      {startSync, stopSync, destroy, getSynchronizerStats, ...extra},
    );
    return persister;
  };

  const createWsSynchronizer = async (
    store,
    webSocket,
    requestTimeoutSeconds = 1,
    onIgnoredError,
  ) => {
    let currentReceive;
    const addEventListener = (event, handler) =>
      webSocket.addEventListener(event, handler);
    const onReceive = (receive) => {
      currentReceive = receive;
    };
    const send = (toClientId, ...args) => {
      webSocket.send(
        (toClientId ?? EMPTY_STRING) +
          MESSAGE_SEPARATOR +
          jsonStringWithUndefined(args),
      );
    };
    const destroy = () => {
      webSocket.close();
    };
    const synchronizer = createCustomSynchronizer(
      store,
      send,
      onReceive,
      destroy,
      requestTimeoutSeconds,
      onIgnoredError,
      {getWebSocket: () => webSocket},
    );
    addEventListener('message', ({data}) => {
      if (!isUndefined(currentReceive)) {
        const payload = data.toString(UTF8);
        const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
        if (splitAt !== -1) {
          currentReceive(
            slice(data, 0, splitAt),
            ...jsonParseWithUndefined(slice(data, splitAt + 1)),
          );
        }
      }
    });
    return promiseNew((resolve, reject) => {
      if (webSocket.readyState != webSocket.OPEN) {
        addEventListener('error', reject);
        addEventListener('open', () => resolve(synchronizer));
      } else {
        resolve(synchronizer);
      }
    });
  };

  exports.createWsSynchronizer = createWsSynchronizer;
});
