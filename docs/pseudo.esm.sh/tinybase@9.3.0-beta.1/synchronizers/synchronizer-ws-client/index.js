// dist/synchronizers/synchronizer-ws-client/index.js
var getTypeOf = (thing) => typeof thing;
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var DOT = ".";
var STRING = getTypeOf(EMPTY_STRING);
var BOOLEAN = getTypeOf(true);
var NUMBER = getTypeOf(0);
var OBJECT = "object";
var ARRAY = "array";
var NULL = "null";
var UTF8 = "utf8";
var OPEN = "open";
var CLOSE = "close";
var MESSAGE = "message";
var ERROR = "error";
var UNDEFINED = "\uFFFC";
var strStartsWith = (str, prefix) => str.startsWith(prefix);
var strMatch = (str, regex) => str?.match(regex);
var strSplit = (str, separator = EMPTY_STRING, limit) => str.split(separator, limit);
var promise = Promise;
var math = Math;
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL = globalThis;
var THOUSAND = 1e3;
var number = Number;
var startTimeout = (callback, sec = 0) => setTimeout(callback, sec * THOUSAND);
var stopTimeout = (timeout) => clearTimeout(timeout);
var addEventListener = (target, event, listener) => {
  target.addEventListener(event, listener);
  return () => target.removeEventListener(event, listener);
};
var mathMax = math.max;
var mathCeil = math.ceil;
var mathFloor = math.floor;
var mathRandom = math.random;
var isFiniteNumber = isFinite;
var isInteger = number.isInteger;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var isNull = (thing) => thing === null;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isTypeStringOrBoolean = (type) => type == STRING || type == BOOLEAN;
var isString = (thing) => getTypeOf(thing) == STRING;
var isNumber = (thing) => getTypeOf(thing) == NUMBER;
var isArray = (thing) => Array.isArray(thing);
var slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
var size = (thing) => thing.length;
var isEmpty = (thing) => size(thing) == 0;
var test = (regex, subject) => regex.test(subject);
var noop = () => {
};
var promiseNew = (resolver) => new promise(resolver);
var arrayIndexOf = (array, value) => array.indexOf(value);
var arrayEvery = (array, cb) => array.every(cb);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING) => array.join(sep);
var arrayMap = (array, cb) => array.map(cb);
var arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
var arrayFilter = (array, cb) => array.filter(cb);
var arrayClear = (array, to = size(array)) => array.splice(0, to);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var collSize = (coll) => coll?.size ?? 0;
var collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
var collIsEmpty = (coll) => isUndefined(coll) || collSize(coll) == 0;
var collClear = (coll) => coll.clear();
var collForEach = (coll, cb) => coll?.forEach(cb);
var collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);
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
var objHas = (obj, id) => object.hasOwn(obj, id);
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
var objForEach = (obj, cb) => arrayForEach(objIds(obj), (id) => cb(obj[id], id));
var objEvery = (obj, cb) => {
  for (const id in obj) {
    if (objHas(obj, id) && !cb(obj[id], id)) {
      return false;
    }
  }
  return true;
};
var objMap = (obj, cb) => {
  const mapped = objNew();
  objForEach(obj, (value, id) => objSet(mapped, id, cb(value, id)));
  return mapped;
};
var objSize = (obj) => size(objIds(obj));
var objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
var objEnsure = (obj, id, getDefaultValue) => {
  if (!objHas(obj, id)) {
    objSet(obj, id, getDefaultValue());
  }
  return obj[id];
};
var map = Map;
var mapNew = (entries) => new map(entries);
var weakMapNew = () => /* @__PURE__ */ new WeakMap();
var mapGet = (map2, key) => map2?.get(key);
var mapForEach = (map2, cb) => collForEach(map2, (value, key) => cb(key, value));
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
var MASK6 = 63;
var ENCODE = strSplit(
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
);
var DECODE = mapNew(arrayMap(ENCODE, (char, index) => [char, index]));
var encode = (num) => ENCODE[num & MASK6];
var decode = (str, pos) => mapGet(DECODE, str[pos]) ?? 0;
var getRandomValues = GLOBAL.crypto ? (array) => GLOBAL.crypto.getRandomValues(array) : (
  /* istanbul ignore next */
  (array) => arrayMap(array, () => mathFloor(mathRandom() * 256))
);
var getUniqueId = (length = 16) => arrayReduce(
  getRandomValues(new Uint8Array(length)),
  (uniqueId, number2) => uniqueId + encode(number2),
  EMPTY_STRING
);
var ERROR_STORE_TYPE = 0;
var ERROR_CONTENT = 1;
var ERROR_SYNC_RESPONSE = 3;
var ERROR_MULTIPLEX_RESPONSE = 4;
var ERROR_MULTIPLEX_SOCKET = 5;
var ERROR_MULTIPLEX_CHANNEL = 6;
var ERROR_MULTIPLEX_CHANNEL_DUPLICATE = 7;
var ERROR_MULTIPLEX_DESTROYED = 8;
var ERROR_MULTIPLEX_LEGACY = 9;
var ERROR_LEGACY_MULTIPLEX = 10;
var ERROR_SYNC_MESSAGE = 14;
var ERROR_SYNC_OVERFLOW = 15;
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
var setNew = (entryOrEntries) => new Set(
  isArray(entryOrEntries) || isUndefined(entryOrEntries) ? entryOrEntries : [entryOrEntries]
);
var weakSetNew = () => /* @__PURE__ */ new WeakSet();
var setAdd = (set, value) => set?.add(value);
var jsonString = JSON.stringify;
var jsonParse = JSON.parse;
var jsonStringWithUndefined = (obj) => jsonString(obj, (_key, value) => isUndefined(value) ? UNDEFINED : value);
var jsonParseWithUndefined = (str) => (
  // JSON.parse reviver removes properties with undefined values
  replaceUndefinedString(jsonParse(str))
);
var replaceUndefinedString = (obj) => obj === UNDEFINED ? void 0 : isArray(obj) ? arrayMap(obj, replaceUndefinedString) : isObject(obj) ? objMap(obj, replaceUndefinedString) : obj;
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
var isCellOrValueOrUndefined = (cellOrValue) => isUndefined(cellOrValue) || !isUndefined(getCellOrValueType(cellOrValue));
new GLOBAL.TextEncoder();
var SHIFT36 = 2 ** 36;
var SHIFT30 = 2 ** 30;
var SHIFT24 = 2 ** 24;
var SHIFT18 = 2 ** 18;
var SHIFT12 = 2 ** 12;
var SHIFT6 = 2 ** 6;
var HLC = /^[-0-9A-Z_a-z]{16}$/;
var decodeHlcTime = (hlc) => decode(hlc, 0) * SHIFT36 + decode(hlc, 1) * SHIFT30 + decode(hlc, 2) * SHIFT24 + decode(hlc, 3) * SHIFT18 + decode(hlc, 4) * SHIFT12 + decode(hlc, 5) * SHIFT6 + decode(hlc, 6);
var isHlc = (hlc, maxLogicalTime) => hlc == EMPTY_STRING || isString(hlc) && test(HLC, hlc) && decodeHlcTime(hlc) <= maxLogicalTime;
var MESSAGE_SEPARATOR = "\n";
var FRAGMENT = /^([-0-9A-Z_a-z]{16})\n(\d+)\n(\d+)\n([\s\S]*)$/;
var FRAGMENT_PAYLOAD = /^[^\n]*\n[-0-9A-Z_a-z]{16}\n\d+\n\d+\n/;
var INVALID_CHANNEL_ID_CHARACTERS = /[\n\r?#]/;
var MAX_FRAGMENT_BUFFERS = 100;
var MAX_FRAGMENT_COUNT = 1e3;
var MAX_PENDING_REQUESTS = 100;
var MAX_WEBSOCKET_BUFFER_SIZE = 16777216;
var MAX_WEBSOCKET_QUEUE_SIZE = 1e3;
var getWebSocketPayloadSize = (value) => {
  let byteSize = 0;
  for (let index = 0; index < size(value); index++) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit < 128) {
      byteSize++;
    } else if (codeUnit < 2048) {
      byteSize += 2;
    } else if (codeUnit >= 55296 && codeUnit <= 56319 && value.charCodeAt(index + 1) >= 56320 && value.charCodeAt(index + 1) <= 57343) {
      byteSize += 4;
      index++;
    } else {
      byteSize += 3;
    }
  }
  return byteSize;
};
var isWebSocketPayloadTooLarge = (payloadSize) => payloadSize > MAX_WEBSOCKET_BUFFER_SIZE;
var SERVER_CLIENT_ID = "S";
var MULTIPLE_CLIENT_ID = "M";
var MULTIPLE_MESSAGE = -1;
var MultipleControl = /* @__PURE__ */ ((MultipleControl2) => {
  MultipleControl2[MultipleControl2["Hello"] = 0] = "Hello";
  MultipleControl2[MultipleControl2["Subscribe"] = 1] = "Subscribe";
  MultipleControl2[MultipleControl2["Unsubscribe"] = 2] = "Unsubscribe";
  return MultipleControl2;
})(MultipleControl || {});
var MULTIPLE_VERSION = 1;
var createInvalidPayloadHandler = (webSocket, onIgnoredError) => {
  let valid = true;
  return (error) => {
    if (valid) {
      valid = false;
      tryFinally(
        () => onIgnoredError?.(error),
        () => webSocket.close(
          strStartsWith(error.message, TINYBASE + ":" + ERROR_SYNC_OVERFLOW) ? 1013 : 1007,
          error.message
        )
      );
    }
  };
};
var isHash = (hash) => isNumber(hash) && isFiniteNumber(hash) && isInteger(hash) && hash >= 0 && hash <= 4294967295;
var isHashTree = (tree, depth) => isObject(tree) && objEvery(
  tree,
  (child) => depth ? isHashTree(child, depth - 1) : isHash(child)
);
var isStamp = (stamp, depth) => isArray(stamp) && (size(stamp) == 1 || size(stamp) == 2 && isString(stamp[1]) && isHlc(stamp[1], Infinity)) && (depth ? isObject(stamp[0]) && objEvery(stamp[0], (child) => isStamp(child, depth - 1)) : isCellOrValueOrUndefined(stamp[0]));
var isContentHashes = (body) => isArray(body) && size(body) == 2 && isHash(body[0]) && isHash(body[1]);
var isMergeableContentOrChanges = (body) => isArray(body) && (size(body) == 2 || size(body) == 3 && body[2] === 1) && isStamp(body[0], 3) && isStamp(body[1], 1);
var isResponse = (body) => isContentHashes(body) || isStamp(body, 3) || isStamp(body, 1) || isArray(body) && size(body) == 2 && isStamp(body[0], 3) && (isHashTree(body[1], 0) || isHashTree(body[1], 1));
var isBodyValid = (message, body) => message == 0 ? isResponse(body) : message == 1 ? body === EMPTY_STRING : message == 2 ? isContentHashes(body) : message == 3 ? isMergeableContentOrChanges(body) : message == 4 ? isHashTree(body, 0) : message == 5 ? isHashTree(body, 1) : message == 6 ? isHashTree(body, 2) : message == 7 ? isHashTree(body, 0) : false;
var isProtocolMessageValid = (requestId, message, body) => (isNull(requestId) || isString(requestId)) && isNumber(message) && isFiniteNumber(message) && isInteger(message) && isBodyValid(message, body);
var decodeProtocolMessage = (remainder, multipleControl = false) => tryReturn(() => {
  const message = jsonParseWithUndefined(remainder);
  return isArray(message) && size(message) == 3 && (isProtocolMessageValid(message[0], message[1], message[2]) || multipleControl && (isNull(message[0]) || isString(message[0])) && message[1] == MULTIPLE_MESSAGE) ? message : void 0;
});
var ifPayloadValid = (payload, then) => {
  const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
  if (splitAt !== -1) {
    then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
    return true;
  }
  return false;
};
var createPayloadDecoder = (receive, fragmentTimeoutSeconds = 1, onInvalid) => {
  const buffer = mapNew();
  let bufferedSize = 0;
  let valid = true;
  const delPending = (bufferKey, pending) => {
    stopTimeout(pending[4]);
    bufferedSize -= pending[5];
    collDel(buffer, bufferKey);
  };
  const invalid = (error = errorNew(ERROR_SYNC_MESSAGE)) => {
    if (valid) {
      valid = false;
      mapForEach(buffer, (_bufferKey, pending) => stopTimeout(pending[4]));
      collClear(buffer);
      bufferedSize = 0;
      onInvalid?.(error);
    }
  };
  const receiveRemainder = (clientId, remainders, remainder) => {
    const message = decodeProtocolMessage(remainder);
    if (message) {
      receive(clientId, remainders, ...message);
    } else {
      invalid();
    }
  };
  return (payload) => {
    if (!valid) {
      return;
    }
    if (isWebSocketPayloadTooLarge(getWebSocketPayloadSize(payload))) {
      invalid(
        errorNew(
          ERROR_SYNC_OVERFLOW,
          strMatch(payload, FRAGMENT_PAYLOAD) ? "fragments" : "socket"
        )
      );
      return;
    }
    if (!ifPayloadValid(payload, (clientId, remainder) => {
      const message = decodeProtocolMessage(remainder);
      if (message) {
        receive(clientId, [remainder], ...message);
        return;
      }
      const [, messageId, indexStr, totalStr, fragment] = strMatch(remainder, FRAGMENT) ?? [];
      if (messageId) {
        const index = parseInt(indexStr);
        const total = parseInt(totalStr);
        if (total > MAX_FRAGMENT_COUNT) {
          invalid(errorNew(ERROR_SYNC_OVERFLOW, "fragments"));
          return;
        }
        if (total > 0 && index >= 0 && index < total) {
          const bufferKey = clientId + MESSAGE_SEPARATOR + messageId;
          let pending = mapGet(buffer, bufferKey);
          if (!pending) {
            if (collSize(buffer) >= MAX_FRAGMENT_BUFFERS) {
              invalid(errorNew(ERROR_SYNC_OVERFLOW, "fragments"));
              return;
            }
            pending = [
              [],
              [],
              total,
              total,
              startTimeout(() => {
                const timedOut = mapGet(buffer, bufferKey);
                if (timedOut) {
                  delPending(bufferKey, timedOut);
                }
              }, fragmentTimeoutSeconds),
              0
            ];
            mapSet(buffer, bufferKey, pending);
          }
          const [fragments, remainders] = pending;
          if (total == pending[3] && isUndefined(fragments[index])) {
            const fragmentLength = getWebSocketPayloadSize(fragment);
            if (bufferedSize + fragmentLength > MAX_WEBSOCKET_BUFFER_SIZE) {
              invalid(errorNew(ERROR_SYNC_OVERFLOW, "fragments"));
              return;
            }
            fragments[index] = fragment;
            remainders[index] = remainder;
            pending[2]--;
            pending[5] += fragmentLength;
            bufferedSize += fragmentLength;
          } else {
            invalid();
            return;
          }
          if (pending[2] == 0) {
            delPending(bufferKey, pending);
            receiveRemainder(clientId, remainders, arrayJoin(fragments));
          }
          return;
        }
      }
      invalid();
    })) {
      invalid();
    }
  };
};
var isWebSocketBackpressured = (webSocket, payloadSize) => (webSocket.bufferedAmount ?? 0) + payloadSize > MAX_WEBSOCKET_BUFFER_SIZE;
var createPayloadReceiver = (receive, fragmentTimeoutSeconds = 1, onInvalid) => createPayloadDecoder(
  (fromClientId, _remainders, requestId, message, body) => receive(fromClientId, requestId, message, body),
  fragmentTimeoutSeconds,
  onInvalid
);
var createRawPayload = (clientId, remainder) => clientId + MESSAGE_SEPARATOR + remainder;
var getFragments = (remainder, maxFragmentSize) => {
  const fragments = [];
  let fragment = EMPTY_STRING;
  let fragmentSize = 0;
  for (let index = 0; index < size(remainder); index++) {
    const codeUnit = remainder.charCodeAt(index);
    let codePoint = slice(remainder, index, index + 1);
    if (codeUnit >= 55296 && codeUnit <= 56319 && remainder.charCodeAt(index + 1) >= 56320 && remainder.charCodeAt(index + 1) <= 57343) {
      codePoint += slice(remainder, ++index, index + 1);
    }
    const codePointSize = getWebSocketPayloadSize(codePoint);
    if (fragmentSize > 0 && fragmentSize + codePointSize > maxFragmentSize) {
      arrayPush(fragments, fragment);
      fragment = EMPTY_STRING;
      fragmentSize = 0;
    }
    fragment += codePoint;
    fragmentSize += codePointSize;
  }
  arrayPush(fragments, fragment);
  return fragments;
};
var createMultiplePayload = (channelId, payload) => createRawPayload(MULTIPLE_CLIENT_ID, createRawPayload(channelId, payload));
var ifMultiplePayloadValid = (payload, then) => {
  let valid = false;
  ifPayloadValid(payload, (multipleClientId, remainder) => {
    if (multipleClientId == MULTIPLE_CLIENT_ID) {
      ifPayloadValid(remainder, (channelId, channelPayload) => {
        if (isMultipleChannelIdValid(channelId)) {
          valid = true;
          then(channelId, channelPayload);
        }
      });
    }
  });
  return valid;
};
var createMultipleControlPayload = (requestId, control, body) => createRawPayload(
  SERVER_CLIENT_ID,
  jsonStringWithUndefined([requestId, MULTIPLE_MESSAGE, [control, body]])
);
var ifMultipleControlPayloadValid = (payload, then) => {
  let valid = false;
  ifPayloadValid(payload, (serverClientId, remainder) => {
    if (serverClientId == SERVER_CLIENT_ID) {
      const [requestId, message, controlAndBody] = decodeProtocolMessage(remainder, true) ?? [];
      const control = controlAndBody?.[0];
      const body = controlAndBody?.[1];
      if (message == MULTIPLE_MESSAGE && isArray(controlAndBody) && size(controlAndBody) == 2 && (control == 0 ? isString(requestId) && body == MULTIPLE_VERSION : control == 1 ? isString(requestId) && isString(body) && isMultipleChannelIdValid(body) : control == 2 && isNull(requestId) && isString(body) && isMultipleChannelIdValid(body))) {
        valid = true;
        then(requestId, control, body);
      }
    }
  });
  return valid;
};
var isMultipleChannelIdValid = (channelId) => !isEmpty(channelId) && !INVALID_CHANNEL_ID_CHARACTERS.test(channelId) && arrayEvery(
  strSplit(channelId, "/"),
  (part) => !isEmpty(part) && part != "." && part != ".."
);
var createPayloads = (toClientId, requestId, message, body, fragmentSize) => {
  const clientId = toClientId ?? EMPTY_STRING;
  const remainder = jsonStringWithUndefined([requestId, message, body]);
  const maxFragmentSize = mathFloor(fragmentSize ?? 0);
  if (isUndefined(fragmentSize) || maxFragmentSize < 1) {
    return [createRawPayload(clientId, remainder)];
  }
  const fragments = getFragments(
    remainder,
    mathMax(
      maxFragmentSize,
      mathCeil(getWebSocketPayloadSize(remainder) / MAX_FRAGMENT_COUNT) + 3
    )
  );
  const total = size(fragments);
  if (total == 1) {
    return [createRawPayload(clientId, remainder)];
  }
  const messageId = getUniqueId();
  return arrayMap(
    fragments,
    (fragment, index) => createRawPayload(
      clientId,
      arrayJoin([messageId, index, total, fragment], MESSAGE_SEPARATOR)
    )
  );
};
var stampNew = (value, hlc) => hlc ? [value, hlc] : [value];
var getLatestHlc = (hlc1, hlc2) => (
  /* istanbul ignore next */
  ((hlc1 ?? EMPTY_STRING) > (hlc2 ?? EMPTY_STRING) ? hlc1 : hlc2) ?? EMPTY_STRING
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
mapNew();
var createCustomSynchronizer = (store, send, registerReceive, extraDestroy, requestTimeoutSeconds, onSend, onReceive, onIgnoredError, extra = {}, preDestroy = noop) => {
  let syncing = 0;
  let persisterListener;
  let sends = 0;
  let receives = 0;
  let destroyed = false;
  const pendingRequests = mapNew();
  const getTransactionId = () => getUniqueId(11);
  const rejectPendingRequests = (error) => mapForEach(pendingRequests, (requestId, [, , reject, timeout]) => {
    stopTimeout(timeout);
    collDel(pendingRequests, requestId);
    reject(error);
  });
  const sendImpl = (toClientId, requestId, message, body) => {
    sends++;
    onSend?.(toClientId, requestId, message, body);
    send(toClientId, requestId, message, body);
  };
  const request = async (toClientId, message, body, transactionId) => promiseNew((resolve, reject) => {
    if (collSize(pendingRequests) >= MAX_PENDING_REQUESTS) {
      reject(errorNew(ERROR_SYNC_OVERFLOW, "requests"));
      return;
    }
    const requestId = transactionId + DOT + getUniqueId(4);
    const timeout = startTimeout(() => {
      collDel(pendingRequests, requestId);
      reject(
        errorNew(
          ERROR_SYNC_RESPONSE,
          (toClientId ?? EMPTY_STRING) + DOT + requestId + DOT + message
        )
      );
    }, requestTimeoutSeconds);
    mapSet(pendingRequests, requestId, [
      toClientId,
      (response, fromClientId) => {
        stopTimeout(timeout);
        collDel(pendingRequests, requestId);
        resolve([response, fromClientId, transactionId]);
      },
      reject,
      timeout
    ]);
    try {
      sendImpl(toClientId, requestId, message, body);
    } catch (error) {
      stopTimeout(timeout);
      collDel(pendingRequests, requestId);
      reject(error);
    }
  });
  const mergeTablesStamps = (tablesStamp, [tableStamps2, tablesTime2]) => {
    objForEach(tableStamps2, ([rowStamps2, tableTime2], tableId) => {
      const tableStamp = objEnsure(tablesStamp[0], tableId, stampNewObj);
      objForEach(rowStamps2, ([cellStamps2, rowTime2], rowId) => {
        const rowStamp = objEnsure(tableStamp[0], rowId, stampNewObj);
        objForEach(
          cellStamps2,
          ([cell2, cellTime2], cellId) => objSet(rowStamp[0], cellId, stampNew(cell2, cellTime2))
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
    destroyed = true;
    rejectPendingRequests(errorNew(ERROR_SYNC_RESPONSE, "destroyed"));
    preDestroy();
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
    if (destroyed) {
      return;
    }
    if (!isProtocolMessageValid(transactionOrRequestId, message, body)) {
      onIgnoredError?.(errorNew(ERROR_SYNC_MESSAGE));
      return;
    }
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
  }, rejectPendingRequests);
  return persister;
};
var CONTENT_HASHES = 2;
var CONTENT_DIFF = 3;
var multipleStates = weakMapNew();
var legacyWebSockets = weakSetNew();
var createConnection = () => {
  let resolve;
  let reject;
  const promise2 = promiseNew((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  promise2.catch(() => 0);
  return [promise2, resolve, reject];
};
var createMultipleState = (webSocket) => {
  const channels = mapNew();
  const pendingControls = mapNew();
  const removeListeners = [];
  let connection = createConnection();
  let connected = false;
  let destroyed = false;
  let disconnected = false;
  let disconnect = () => {
  };
  let flushTimeout;
  let opening;
  let overflowing = false;
  let queuedCount = 0;
  let queuedSize = 0;
  const notifyChannelIgnoredError = (channel, error) => tryReturn(() => channel[
    6
    /* OnIgnoredError */
  ]?.(error));
  const notifyIgnoredError = (error) => mapForEach(
    channels,
    (_channelId, channel) => notifyChannelIgnoredError(channel, error)
  );
  const handleSendError = (channel, error) => {
    notifyChannelIgnoredError(channel, error);
    disconnect();
    tryReturn(() => webSocket.close());
  };
  const invalid = createInvalidPayloadHandler(webSocket, notifyIgnoredError);
  const addWebSocketListener = (event, handler) => arrayPush(removeListeners, addEventListener(webSocket, event, handler));
  const rejectPendingControls = (error) => mapForEach(pendingControls, (requestId, [, , reject, timeout]) => {
    stopTimeout(timeout);
    collDel(pendingControls, requestId);
    reject(error);
  });
  const failChannels = (error) => mapForEach(
    channels,
    (_channelId, channel) => tryReturn(() => channel[
      11
      /* Fail */
    ]?.(error))
  );
  const clearIncoming = (channel) => {
    arrayForEach(
      channel[
        1
        /* Incoming */
      ],
      ([, timeout]) => stopTimeout(timeout)
    );
    queuedCount -= size(channel[
      1
      /* Incoming */
    ]);
    queuedSize -= channel[
      8
      /* IncomingSize */
    ];
    arrayClear(channel[
      1
      /* Incoming */
    ]);
    channel[
      8
      /* IncomingSize */
    ] = 0;
  };
  const clearOutgoing = (channel, clearDirty = false) => {
    arrayForEach(
      channel[
        2
        /* Outgoing */
      ],
      ([, timeout]) => stopTimeout(timeout)
    );
    queuedCount -= channel[
      10
      /* OutgoingCount */
    ];
    queuedSize -= channel[
      9
      /* OutgoingSize */
    ];
    arrayClear(channel[
      2
      /* Outgoing */
    ]);
    channel[
      9
      /* OutgoingSize */
    ] = 0;
    channel[
      10
      /* OutgoingCount */
    ] = 0;
    if (clearDirty) {
      channel[
        7
        /* Dirty */
      ] = void 0;
    }
  };
  const overflow = (details) => {
    const error = errorNew(ERROR_SYNC_OVERFLOW, details);
    if (!overflowing && !destroyed) {
      overflowing = true;
      connected = false;
      notifyIgnoredError(error);
      rejectPendingControls(error);
      failChannels(error);
      mapForEach(channels, (_channelId, channel) => {
        clearIncoming(channel);
        clearOutgoing(channel, true);
        channel[
          3
          /* Subscribed */
        ] = false;
        channel[
          4
          /* Subscribing */
        ] = void 0;
      });
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = void 0;
      }
      webSocket.close(1013, error.message);
    }
    return error;
  };
  const getConnectionTimeoutSeconds = () => {
    let first = true;
    let timeoutSeconds = 1;
    mapForEach(channels, (_channelId, channel) => {
      const channelTimeoutSeconds = channel[
        5
        /* TimeoutSeconds */
      ];
      if (first || channelTimeoutSeconds < timeoutSeconds) {
        first = false;
        timeoutSeconds = channelTimeoutSeconds;
      }
    });
    return timeoutSeconds;
  };
  const sendControl = (control, body, timeoutSeconds) => {
    const requestId = getUniqueId();
    return promiseNew((resolve, reject) => {
      if (collSize(pendingControls) >= MAX_PENDING_REQUESTS) {
        reject(overflow("controls"));
        return;
      }
      const payload = createMultipleControlPayload(requestId, control, body);
      const payloadSize = getWebSocketPayloadSize(payload);
      if (isWebSocketPayloadTooLarge(payloadSize) || isWebSocketBackpressured(webSocket, payloadSize)) {
        reject(overflow("socket"));
        return;
      }
      const timeout = startTimeout(() => {
        collDel(pendingControls, requestId);
        reject(errorNew(ERROR_MULTIPLEX_RESPONSE, control));
      }, timeoutSeconds);
      mapSet(pendingControls, requestId, [control, resolve, reject, timeout]);
      try {
        webSocket.send(payload);
      } catch (error) {
        stopTimeout(timeout);
        collDel(pendingControls, requestId);
        reject(error);
      }
    });
  };
  const getPayloadsSize = (payloads) => arrayReduce(
    payloads,
    (total, payload) => total + getWebSocketPayloadSize(payload),
    0
  );
  const expireIncoming = (channel, incoming) => {
    const index = arrayIndexOf(channel[
      1
      /* Incoming */
    ], incoming);
    if (index > -1) {
      channel[
        1
        /* Incoming */
      ] = arrayFilter(
        channel[
          1
          /* Incoming */
        ],
        (_incoming, incomingIndex) => incomingIndex != index
      );
      const incomingSize = getWebSocketPayloadSize(incoming[0]);
      channel[
        8
        /* IncomingSize */
      ] -= incomingSize;
      queuedCount--;
      queuedSize -= incomingSize;
    }
  };
  const queueIncoming = (channel, payload) => {
    const payloadSize = getWebSocketPayloadSize(payload);
    if (queuedCount >= MAX_WEBSOCKET_QUEUE_SIZE || queuedSize + payloadSize > MAX_WEBSOCKET_BUFFER_SIZE) {
      overflow("client");
      return;
    }
    const incoming = [
      payload,
      startTimeout(
        () => expireIncoming(channel, incoming),
        channel[
          5
          /* TimeoutSeconds */
        ]
      )
    ];
    arrayPush(channel[
      1
      /* Incoming */
    ], incoming);
    channel[
      8
      /* IncomingSize */
    ] += payloadSize;
    queuedCount++;
    queuedSize += payloadSize;
  };
  const expireOutgoing = (channel, outgoing) => {
    const index = arrayIndexOf(channel[
      2
      /* Outgoing */
    ], outgoing);
    if (index > -1) {
      channel[
        2
        /* Outgoing */
      ] = arrayFilter(
        channel[
          2
          /* Outgoing */
        ],
        (_outgoing, outgoingIndex) => outgoingIndex != index
      );
      const remainingPayloads = slice(outgoing[0], outgoing[2]);
      const remainingSize = getPayloadsSize(remainingPayloads);
      channel[
        9
        /* OutgoingSize */
      ] -= remainingSize;
      channel[
        10
        /* OutgoingCount */
      ] -= size(remainingPayloads);
      queuedCount -= size(remainingPayloads);
      queuedSize -= remainingSize;
    }
  };
  const queueOutgoing = (channel, payloads) => {
    const payloadsSize = getPayloadsSize(payloads);
    if (queuedCount + size(payloads) > MAX_WEBSOCKET_QUEUE_SIZE || queuedSize + payloadsSize > MAX_WEBSOCKET_BUFFER_SIZE) {
      overflow("client");
      return false;
    }
    const outgoing = [
      payloads,
      startTimeout(
        () => expireOutgoing(channel, outgoing),
        channel[
          5
          /* TimeoutSeconds */
        ]
      ),
      0
    ];
    arrayPush(channel[
      2
      /* Outgoing */
    ], outgoing);
    channel[
      9
      /* OutgoingSize */
    ] += payloadsSize;
    channel[
      10
      /* OutgoingCount */
    ] += size(payloads);
    queuedCount += size(payloads);
    queuedSize += payloadsSize;
    return true;
  };
  const scheduleFlush = () => {
    flushTimeout ??= startTimeout(() => {
      flushTimeout = void 0;
      mapForEach(channels, flushOutgoing);
    }, 0.01);
  };
  const sendPayloads = (channelId, channel, payloads, coalesce) => {
    if (webSocket.readyState != webSocket.OPEN) {
      if (coalesce) {
        channel[
          7
          /* Dirty */
        ] = coalesce;
      } else {
        queueOutgoing(channel, payloads);
      }
      return false;
    }
    for (let index = 0; index < size(payloads); index++) {
      const payload = createMultiplePayload(channelId, payloads[index]);
      const payloadSize = getWebSocketPayloadSize(payload);
      if (isWebSocketPayloadTooLarge(payloadSize)) {
        overflow("client");
        return false;
      }
      if (isWebSocketBackpressured(webSocket, payloadSize)) {
        if (coalesce) {
          channel[
            7
            /* Dirty */
          ] = coalesce;
        } else if (!queueOutgoing(channel, slice(payloads, index))) {
          return false;
        }
        scheduleFlush();
        return false;
      }
      try {
        webSocket.send(payload);
      } catch (error) {
        if (coalesce) {
          channel[
            7
            /* Dirty */
          ] = coalesce;
        } else if (!queueOutgoing(channel, slice(payloads, index))) {
          return false;
        }
        handleSendError(channel, error);
        return false;
      }
    }
    return true;
  };
  const flushOutgoing = (channelId, channel) => {
    if (!connected || !channel[
      3
      /* Subscribed */
    ]) {
      return;
    }
    const outgoingQueue = channel[
      2
      /* Outgoing */
    ];
    let outgoingIndex = 0;
    while (outgoingIndex < size(outgoingQueue)) {
      const outgoing = outgoingQueue[outgoingIndex];
      const payloads = outgoing[0];
      let payloadIndex = outgoing[2];
      while (payloadIndex < size(payloads)) {
        const queuedPayload = payloads[payloadIndex];
        const payload = createMultiplePayload(channelId, queuedPayload);
        const payloadSize = getWebSocketPayloadSize(payload);
        if (isWebSocketPayloadTooLarge(payloadSize)) {
          arrayClear(outgoingQueue, outgoingIndex);
          overflow("client");
          return;
        }
        if (isWebSocketBackpressured(webSocket, payloadSize)) {
          arrayClear(outgoingQueue, outgoingIndex);
          scheduleFlush();
          return;
        }
        try {
          webSocket.send(payload);
        } catch (error) {
          handleSendError(channel, error);
          return;
        }
        payloads[payloadIndex] = EMPTY_STRING;
        outgoing[2] = ++payloadIndex;
        const sentPayloadSize = getWebSocketPayloadSize(queuedPayload);
        channel[
          9
          /* OutgoingSize */
        ] -= sentPayloadSize;
        channel[
          10
          /* OutgoingCount */
        ]--;
        queuedSize -= sentPayloadSize;
        queuedCount--;
      }
      stopTimeout(outgoing[1]);
      outgoingIndex++;
    }
    arrayClear(outgoingQueue, outgoingIndex);
    const coalesce = channel[
      7
      /* Dirty */
    ];
    if (coalesce) {
      channel[
        7
        /* Dirty */
      ] = void 0;
      sendPayloads(channelId, channel, coalesce(), coalesce);
    }
  };
  const subscribe = async (channelId, channel, timeoutSeconds) => {
    if (!channel[
      3
      /* Subscribed */
    ]) {
      let subscribing = channel[
        4
        /* Subscribing */
      ];
      if (!subscribing) {
        subscribing = (async () => {
          await connection[0];
          await sendControl(
            MultipleControl.Subscribe,
            channelId,
            timeoutSeconds
          );
          if (mapGet(channels, channelId) === channel && connected) {
            channel[
              3
              /* Subscribed */
            ] = true;
            flushOutgoing(channelId, channel);
          }
        })();
        channel[
          4
          /* Subscribing */
        ] = subscribing;
      }
      try {
        await subscribing;
      } finally {
        if (channel[
          4
          /* Subscribing */
        ] === subscribing) {
          channel[
            4
            /* Subscribing */
          ] = void 0;
        }
      }
    }
  };
  const onOpen = () => {
    if (destroyed || opening?.[0] === connection) {
      return;
    }
    disconnected = false;
    overflowing = false;
    const openingConnection = connection;
    const openingPromise = (async () => {
      try {
        await sendControl(
          MultipleControl.Hello,
          MULTIPLE_VERSION,
          getConnectionTimeoutSeconds()
        );
        if (connection === openingConnection) {
          connected = true;
          openingConnection[1]();
          mapForEach(
            channels,
            (channelId, channel) => subscribe(
              channelId,
              channel,
              channel[
                5
                /* TimeoutSeconds */
              ]
            ).catch(
              (error) => error.message == errorNew(ERROR_MULTIPLEX_SOCKET).message ? 0 : notifyChannelIgnoredError(channel, error)
            )
          );
        }
      } catch (error) {
        openingConnection[2](error);
        if (error.message != errorNew(ERROR_MULTIPLEX_SOCKET).message) {
          notifyIgnoredError(error);
        }
      }
    })();
    opening = [openingConnection, openingPromise];
    openingPromise.finally(() => {
      if (opening?.[1] === openingPromise) {
        opening = void 0;
      }
    });
  };
  disconnect = () => {
    if (!destroyed && !disconnected) {
      disconnected = true;
      const wasOverflowing = overflowing;
      overflowing = false;
      connected = false;
      const error = errorNew(ERROR_MULTIPLEX_SOCKET);
      if (!wasOverflowing) {
        notifyIgnoredError(error);
      }
      connection[2](error);
      rejectPendingControls(error);
      failChannels(error);
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = void 0;
      }
      connection = createConnection();
      mapForEach(channels, (_channelId, channel) => {
        channel[
          3
          /* Subscribed */
        ] = false;
        channel[
          4
          /* Subscribing */
        ] = void 0;
      });
    }
  };
  const onClose = disconnect;
  addWebSocketListener(MESSAGE, ({ data }) => {
    const payload = data.toString(UTF8);
    if (isWebSocketPayloadTooLarge(getWebSocketPayloadSize(payload))) {
      invalid(errorNew(ERROR_SYNC_OVERFLOW, "socket"));
      return;
    }
    const control = ifMultipleControlPayloadValid(
      payload,
      (requestId, control2, _body) => {
        const pendingControl = requestId ? mapGet(pendingControls, requestId) : void 0;
        if (pendingControl?.[0] == control2) {
          stopTimeout(pendingControl[3]);
          collDel(pendingControls, requestId);
          pendingControl[1]();
        }
      }
    );
    const channel = ifMultiplePayloadValid(
      payload,
      (channelId, channelPayload) => {
        const channel2 = mapGet(channels, channelId);
        if (channel2) {
          if (channel2[
            0
            /* Receive */
          ]) {
            channel2[
              0
              /* Receive */
            ](channelPayload);
          } else {
            queueIncoming(channel2, channelPayload);
          }
        } else {
          invalid(errorNew(ERROR_SYNC_MESSAGE));
        }
      }
    );
    if (!control && !channel) {
      invalid(errorNew(ERROR_SYNC_MESSAGE));
    }
  });
  addWebSocketListener(OPEN, onOpen);
  addWebSocketListener(CLOSE, onClose);
  addWebSocketListener(ERROR, (error) => {
    notifyIgnoredError(error);
    failChannels(errorNew(ERROR_MULTIPLEX_SOCKET));
  });
  const addChannel = async (channelId, timeoutSeconds, onIgnoredError) => {
    if (!isMultipleChannelIdValid(channelId)) {
      errorThrow(ERROR_MULTIPLEX_CHANNEL, channelId);
    }
    if (collHas(channels, channelId)) {
      errorThrow(ERROR_MULTIPLEX_CHANNEL_DUPLICATE, channelId);
    }
    const channel = [
      void 0,
      [],
      [],
      false,
      void 0,
      timeoutSeconds,
      onIgnoredError,
      void 0,
      0,
      0,
      0,
      void 0
    ];
    mapSet(channels, channelId, channel);
    if (webSocket.readyState == webSocket.OPEN) {
      onOpen();
    } else if (webSocket.readyState > webSocket.OPEN) {
      const error = errorNew(ERROR_MULTIPLEX_SOCKET);
      notifyChannelIgnoredError(channel, error);
      connection[2](error);
    }
    try {
      await subscribe(channelId, channel, timeoutSeconds);
    } catch (error) {
      delChannel(channelId);
      throw error;
    }
  };
  const registerReceive = (channelId, receive, fail) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      channel[
        0
        /* Receive */
      ] = receive;
      channel[
        11
        /* Fail */
      ] = fail;
      const incoming = channel[
        1
        /* Incoming */
      ];
      let incomingIndex = 0;
      tryFinally(
        () => {
          while (incomingIndex < size(incoming)) {
            const [payload, timeout] = incoming[incomingIndex];
            stopTimeout(timeout);
            const payloadSize = getWebSocketPayloadSize(payload);
            channel[
              8
              /* IncomingSize */
            ] -= payloadSize;
            queuedCount--;
            queuedSize -= payloadSize;
            incomingIndex++;
            receive(payload);
          }
        },
        () => arrayClear(incoming, incomingIndex)
      );
    }
  };
  const send = (channelId, payloads, coalesce) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      if (connected && webSocket.readyState == webSocket.OPEN && channel[
        3
        /* Subscribed */
      ] && !size(channel[
        2
        /* Outgoing */
      ]) && !channel[
        7
        /* Dirty */
      ]) {
        sendPayloads(channelId, channel, payloads, coalesce);
      } else if (coalesce) {
        channel[
          7
          /* Dirty */
        ] = coalesce;
      } else {
        queueOutgoing(channel, payloads);
      }
    }
  };
  const destroyIfEmpty = () => {
    if (collIsEmpty(channels) && !destroyed) {
      destroyed = true;
      const error = errorNew(ERROR_MULTIPLEX_DESTROYED);
      rejectPendingControls(error);
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = void 0;
      }
      arrayForEach(
        removeListeners,
        (removeListener) => tryReturn(removeListener)
      );
      arrayClear(removeListeners);
      multipleStates.delete(webSocket);
      if (!overflowing) {
        tryReturn(() => webSocket.close());
      }
    }
  };
  const delChannel = (channelId) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      try {
        clearIncoming(channel);
        clearOutgoing(channel, true);
        if (connected && channel[
          3
          /* Subscribed */
        ]) {
          const payload = createMultipleControlPayload(
            null,
            MultipleControl.Unsubscribe,
            channelId
          );
          const payloadSize = getWebSocketPayloadSize(payload);
          if (isWebSocketPayloadTooLarge(payloadSize) || isWebSocketBackpressured(webSocket, payloadSize)) {
            overflow("socket");
          } else {
            webSocket.send(payload);
          }
        }
      } catch (error) {
        notifyChannelIgnoredError(channel, error);
      } finally {
        collDel(channels, channelId);
        destroyIfEmpty();
      }
    }
  };
  return {
    addChannel,
    delChannel,
    destroyIfEmpty,
    invalid,
    registerReceive,
    send
  };
};
var createMultipleWsSynchronizer = async (store, webSocket, channelId, requestTimeoutSeconds, onSend, onReceive, onIgnoredError, fragmentSize) => {
  if (legacyWebSockets.has(webSocket)) {
    errorThrow(ERROR_MULTIPLEX_LEGACY);
  }
  const existingState = multipleStates.get(webSocket);
  const state = existingState ?? (() => {
    const newState = createMultipleState(webSocket);
    multipleStates.set(webSocket, newState);
    return newState;
  })();
  try {
    await state.addChannel(channelId, requestTimeoutSeconds, onIgnoredError);
  } catch (error) {
    if (!existingState) {
      state.destroyIfEmpty();
    }
    throw error;
  }
  try {
    return createCustomSynchronizer(
      store,
      (toClientId, requestId, message, body) => state.send(
        channelId,
        createPayloads(toClientId, requestId, message, body, fragmentSize),
        toClientId == null && (message == CONTENT_HASHES || message == CONTENT_DIFF) ? () => createPayloads(
          null,
          requestId,
          CONTENT_HASHES,
          store.getMergeableContentHashes(),
          fragmentSize
        ) : void 0
      ),
      (receive, fail) => state.registerReceive(
        channelId,
        createPayloadReceiver(receive, requestTimeoutSeconds, state.invalid),
        fail
      ),
      () => state.delChannel(channelId),
      requestTimeoutSeconds,
      onSend,
      onReceive,
      onIgnoredError,
      { getWebSocket: () => webSocket }
    );
  } catch (error) {
    state.delChannel(channelId);
    throw error;
  }
};
var createLegacyWsSynchronizer = async (store, webSocket, requestTimeoutSeconds = 1, onSend, onReceive, onIgnoredError, fragmentSize) => {
  if (multipleStates.has(webSocket)) {
    errorThrow(ERROR_LEGACY_MULTIPLEX);
  }
  let creating = true;
  let overflowing = false;
  let removeTransportListeners = () => {
  };
  const notifyIgnoredError = (error) => tryReturn(() => onIgnoredError?.(error));
  const overflow = () => {
    if (!overflowing) {
      overflowing = true;
      const error = errorNew(ERROR_SYNC_OVERFLOW, "socket");
      notifyIgnoredError(error);
      webSocket.close(1013, error.message);
    }
  };
  const registerReceive = (receive, fail) => {
    const invalid = createInvalidPayloadHandler(webSocket, notifyIgnoredError);
    const receivePayload = createPayloadReceiver(
      receive,
      requestTimeoutSeconds,
      invalid
    );
    let removeListeners = [];
    removeTransportListeners = () => {
      arrayForEach(
        removeListeners,
        (removeListener) => tryReturn(removeListener)
      );
      arrayClear(removeListeners);
    };
    const failTransport = () => {
      tryReturn(() => fail(errorNew(ERROR_MULTIPLEX_SOCKET)));
      removeTransportListeners();
    };
    removeListeners = [
      addEventListener(
        webSocket,
        MESSAGE,
        ({ data }) => receivePayload(data.toString(UTF8))
      ),
      addEventListener(webSocket, CLOSE, () => {
        if (!creating) {
          failTransport();
        }
      }),
      addEventListener(webSocket, ERROR, (error) => {
        if (!creating) {
          notifyIgnoredError(error);
          failTransport();
        }
      })
    ];
  };
  const send = (toClientId, ...args) => {
    arrayForEach(
      createPayloads(toClientId, ...args, fragmentSize),
      (payload) => {
        if (overflowing) {
          return;
        }
        const payloadSize = getWebSocketPayloadSize(payload);
        if (isWebSocketPayloadTooLarge(payloadSize) || isWebSocketBackpressured(webSocket, payloadSize)) {
          overflow();
        } else {
          webSocket.send(payload);
        }
      }
    );
  };
  const destroy = () => {
    removeTransportListeners();
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
  legacyWebSockets.add(webSocket);
  return promiseNew((resolve, reject) => {
    let removeAttemptListeners = () => {
    };
    const rejectCreation = (error, ignoredError = error) => {
      notifyIgnoredError(ignoredError);
      removeAttemptListeners();
      removeTransportListeners();
      legacyWebSockets.delete(webSocket);
      tryReturn(() => webSocket.close());
      reject(error);
    };
    if (webSocket.readyState != webSocket.OPEN) {
      if (webSocket.readyState > webSocket.OPEN) {
        rejectCreation(errorNew(ERROR_MULTIPLEX_SOCKET));
        return;
      }
      const removeAttemptListenersArray = [
        addEventListener(webSocket, OPEN, () => {
          creating = false;
          removeAttemptListeners();
          resolve(synchronizer);
        }),
        addEventListener(
          webSocket,
          ERROR,
          (error) => rejectCreation(errorNew(ERROR_MULTIPLEX_SOCKET), error)
        ),
        addEventListener(
          webSocket,
          CLOSE,
          () => rejectCreation(errorNew(ERROR_MULTIPLEX_SOCKET))
        )
      ];
      removeAttemptListeners = () => {
        arrayForEach(
          removeAttemptListenersArray,
          (removeListener) => tryReturn(removeListener)
        );
        arrayClear(removeAttemptListenersArray);
      };
    } else {
      creating = false;
      resolve(synchronizer);
    }
  });
};
var createWsSynchronizer = async (store, webSocket, channelIdOrRequestTimeout = 1, ...args) => isString(channelIdOrRequestTimeout) ? createMultipleWsSynchronizer(
  store,
  webSocket,
  channelIdOrRequestTimeout,
  args[0] ?? 1,
  args[1],
  args[2],
  args[3],
  args[4]
) : createLegacyWsSynchronizer(
  store,
  webSocket,
  channelIdOrRequestTimeout,
  args[0],
  args[1],
  args[2],
  args[3]
);
export {
  createWsSynchronizer
};
