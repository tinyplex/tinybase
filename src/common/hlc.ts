import type {
  GetNow,
  Hlc,
  Id,
  getHlcFunctions as getHlcFunctionsDecl,
} from '../@types/common/index.d.ts';
import {decode, encode, getUniqueId} from './codec.ts';
import {getHash} from './hash.ts';
import {
  ifNotUndefined,
  isString,
  isUndefined,
  mathMax,
  slice,
  test,
} from './other.ts';
import {EMPTY_STRING} from './strings.ts';

export const HLC_MAX_FUTURE_OFFSET = 5 * 60 * 1000;

const SHIFT36 = 2 ** 36;
const SHIFT30 = 2 ** 30;
const SHIFT24 = 2 ** 24;
const SHIFT18 = 2 ** 18;
const SHIFT12 = 2 ** 12;
const SHIFT6 = 2 ** 6;
const HLC = /^[-0-9A-Z_a-z]{16}$/;

const getClientIdFromUniqueId = (uniqueId: Id): Id => {
  const clientHash30 = getHash(uniqueId);
  return (
    encode(clientHash30 / SHIFT24) +
    encode(clientHash30 / SHIFT18) +
    encode(clientHash30 / SHIFT12) +
    encode(clientHash30 / SHIFT6) +
    encode(clientHash30)
  );
};

const decodeHlcTime = (hlc: Hlc): number =>
  decode(hlc, 0) * SHIFT36 +
  decode(hlc, 1) * SHIFT30 +
  decode(hlc, 2) * SHIFT24 +
  decode(hlc, 3) * SHIFT18 +
  decode(hlc, 4) * SHIFT12 +
  decode(hlc, 5) * SHIFT6 +
  decode(hlc, 6);

export const isHlc = (hlc: unknown, maxLogicalTime: number): hlc is Hlc =>
  hlc == EMPTY_STRING ||
  (isString(hlc) && test(HLC, hlc) && decodeHlcTime(hlc) <= maxLogicalTime);

export const getHlcFunctions: typeof getHlcFunctionsDecl = (
  uniqueId?: Id,
  getNow: GetNow = Date.now,
): [
  getNextHlc: () => Hlc,
  seenHlc: (remoteHlc: Hlc) => void,
  encodeHlc: (logicalTime: number, counter: number, clientId?: Id) => Hlc,
  decodeHlc: (hlc: Hlc) => [logicalTime: number, counter: number, clientId: Id],
  getLastLogicalTime: () => number,
  getLastCounter: () => number,
  getClientId: () => Id,
] => {
  let lastLogicalTime = 0;
  let lastCounter = -1;

  const thisClientId = ifNotUndefined(uniqueId, getClientIdFromUniqueId, () =>
    getUniqueId(5),
  ) as string;

  const getNextHlc = (): Hlc => {
    seenHlc();
    if (++lastCounter == SHIFT24) {
      lastLogicalTime++;
      lastCounter = 0;
    }
    return encodeHlc(lastLogicalTime, lastCounter);
  };

  const seenHlc = (hlc?: Hlc): void => {
    const now = getNow();
    if (!isUndefined(hlc) && !isHlc(hlc, now + HLC_MAX_FUTURE_OFFSET)) {
      return;
    }
    const previousLogicalTime = lastLogicalTime;
    const [remoteLogicalTime, remoteCounter] =
      isUndefined(hlc) || hlc == EMPTY_STRING ? [0, 0] : decodeHlc(hlc);
    lastLogicalTime = mathMax(previousLogicalTime, remoteLogicalTime, now);
    lastCounter =
      lastLogicalTime == previousLogicalTime
        ? lastLogicalTime == remoteLogicalTime
          ? mathMax(lastCounter, remoteCounter)
          : lastCounter
        : lastLogicalTime == remoteLogicalTime
          ? remoteCounter
          : -1;
  };

  const encodeHlc = (logicalTime42: number, counter24: number, clientId?: Id) =>
    encode(logicalTime42 / SHIFT36) +
    encode(logicalTime42 / SHIFT30) +
    encode(logicalTime42 / SHIFT24) +
    encode(logicalTime42 / SHIFT18) +
    encode(logicalTime42 / SHIFT12) +
    encode(logicalTime42 / SHIFT6) +
    encode(logicalTime42) +
    encode(counter24 / SHIFT18) +
    encode(counter24 / SHIFT12) +
    encode(counter24 / SHIFT6) +
    encode(counter24) +
    (isUndefined(clientId) ? thisClientId : getClientIdFromUniqueId(clientId));

  const decodeHlc = (
    hlc16: Hlc,
  ): [logicalTime42: number, counter24: number, clientId: Id] => [
    decodeHlcTime(hlc16),
    decode(hlc16, 7) * SHIFT18 +
      decode(hlc16, 8) * SHIFT12 +
      decode(hlc16, 9) * SHIFT6 +
      decode(hlc16, 10),
    slice(hlc16, 11) as Id,
  ];

  const getLastLogicalTime = (): number => lastLogicalTime;

  const getLastCounter = (): number => lastCounter;

  const getClientId = (): Id => thisClientId;

  return [
    getNextHlc,
    seenHlc,
    encodeHlc,
    decodeHlc,
    getLastLogicalTime,
    getLastCounter,
    getClientId,
  ];
};
