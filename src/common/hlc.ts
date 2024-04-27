import {DEBUG, isUndefined, mathMax} from './other';
import {decode, encode} from './codec';
import {Id} from '../types/common';
import {getHash} from './hash';

type HlcParts = [
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
];
type Hlc = string;
// Sortable 16 digit radix-64 string representing 96 bits:
// - 42 bits (7 chars) for time in milliseconds (~139 years)
// - 24 bits (4 chars) for counter (~16 million)
// - 30 bits (5 chars) for hash of unique client id (~1 billion)

const SHIFT36 = 2 ** 36;
const SHIFT30 = 2 ** 30;
const SHIFT24 = 2 ** 24;
const SHIFT18 = 2 ** 18;
const SHIFT12 = 2 ** 12;
const SHIFT6 = 2 ** 6;

const encodeHlc = (
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
): Hlc =>
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
  encode(clientHash30 / SHIFT24) +
  encode(clientHash30 / SHIFT18) +
  encode(clientHash30 / SHIFT12) +
  encode(clientHash30 / SHIFT6) +
  encode(clientHash30);

const decodeHlc = (hlc16: Hlc): HlcParts => [
  decode(hlc16, 0) * SHIFT36 +
    decode(hlc16, 1) * SHIFT30 +
    decode(hlc16, 2) * SHIFT24 +
    decode(hlc16, 3) * SHIFT18 +
    decode(hlc16, 4) * SHIFT12 +
    decode(hlc16, 5) * SHIFT6 +
    decode(hlc16, 6),
  decode(hlc16, 7) * SHIFT18 +
    decode(hlc16, 8) * SHIFT12 +
    decode(hlc16, 9) * SHIFT6 +
    decode(hlc16, 10),
  decode(hlc16, 11) * SHIFT24 +
    decode(hlc16, 12) * SHIFT18 +
    decode(hlc16, 13) * SHIFT12 +
    decode(hlc16, 14) * SHIFT6 +
    decode(hlc16, 15),
];

export const getHlcFunctions = (
  uniqueId: Id,
): [getHlc: () => Hlc, seenHlc: (remoteHlc: Hlc) => void] => {
  let logicalTime = 0;
  let lastCounter = -1;
  const uniqueIdHash = getHash(uniqueId);

  const getHlc = (): Hlc => {
    seenHlc();
    return encodeHlc(logicalTime, ++lastCounter, uniqueIdHash);
  };

  const seenHlc = (hlc?: Hlc): void => {
    const previousLogicalTime = logicalTime;
    const [remoteLogicalTime, remoteCounter] =
      isUndefined(hlc) || hlc == '' ? [0, 0] : decodeHlc(hlc);
    logicalTime = mathMax(
      previousLogicalTime,
      remoteLogicalTime,
      (DEBUG ? (globalThis as any).HLC_TIME : null) ?? Date.now(),
    );
    lastCounter =
      logicalTime == previousLogicalTime
        ? logicalTime == remoteLogicalTime
          ? mathMax(lastCounter, remoteCounter)
          : lastCounter
        : logicalTime == remoteLogicalTime
          ? remoteCounter
          : -1;
  };

  return [getHlc, seenHlc];
};
