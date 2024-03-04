import {isUndefined, mathMax} from '../common/other';
import {Id} from '../types/common';
import {arrayForEach} from '../common/array';
import {strCharCodeAt} from '../common/strings';

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

const MASK6 = 63;
const SHIFT36 = 2 ** 36;
const SHIFT30 = 2 ** 30;
const SHIFT24 = 2 ** 24;
const SHIFT18 = 2 ** 18;
const SHIFT12 = 2 ** 12;
const SHIFT6 = 2 ** 6;

const textEncoder = new globalThis.TextEncoder();

const toB64 = (num: number): string => String.fromCharCode(48 + (num & MASK6));

const fromB64 = (str: string, pos: number): number =>
  strCharCodeAt(str, pos) - 48;

// fnv1a
const hash = (value: string) => {
  let hash = 0x811c9dc5;
  arrayForEach(textEncoder.encode(value), (char) => {
    hash ^= char;
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });
  return hash >>> 0;
};

const encodeHlc = (
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
): Hlc =>
  toB64(logicalTime42 / SHIFT36) +
  toB64(logicalTime42 / SHIFT30) +
  toB64(logicalTime42 / SHIFT24) +
  toB64(logicalTime42 / SHIFT18) +
  toB64(logicalTime42 / SHIFT12) +
  toB64(logicalTime42 / SHIFT6) +
  toB64(logicalTime42) +
  toB64(counter24 / SHIFT18) +
  toB64(counter24 / SHIFT12) +
  toB64(counter24 / SHIFT6) +
  toB64(counter24) +
  toB64(clientHash30 / SHIFT24) +
  toB64(clientHash30 / SHIFT18) +
  toB64(clientHash30 / SHIFT12) +
  toB64(clientHash30 / SHIFT6) +
  toB64(clientHash30);

const decodeHlc = (hlc16: Hlc): HlcParts => [
  fromB64(hlc16, 0) * SHIFT36 +
    fromB64(hlc16, 1) * SHIFT30 +
    fromB64(hlc16, 2) * SHIFT24 +
    fromB64(hlc16, 3) * SHIFT18 +
    fromB64(hlc16, 4) * SHIFT12 +
    fromB64(hlc16, 5) * SHIFT6 +
    fromB64(hlc16, 6),
  fromB64(hlc16, 7) * SHIFT18 +
    fromB64(hlc16, 8) * SHIFT12 +
    fromB64(hlc16, 9) * SHIFT6 +
    fromB64(hlc16, 10),
  fromB64(hlc16, 11) * SHIFT24 +
    fromB64(hlc16, 12) * SHIFT18 +
    fromB64(hlc16, 13) * SHIFT12 +
    fromB64(hlc16, 14) * SHIFT6 +
    fromB64(hlc16, 15),
];

export const getHlcFunctions = (
  uniqueId: Id,
): [() => Hlc, (remoteHlc: Hlc) => void] => {
  let logicalTime = 0;
  let lastCounter = -1;
  const uniqueIdHash = hash(uniqueId);

  const getHlc = (): Hlc => {
    seenHlc();
    return encodeHlc(logicalTime, ++lastCounter, uniqueIdHash);
  };

  const seenHlc = (hlc?: Hlc): void => {
    const previousLogicalTime = logicalTime;
    const [remoteLogicalTime, remoteCounter] = isUndefined(hlc)
      ? [0, 0]
      : decodeHlc(hlc);

    logicalTime = mathMax(previousLogicalTime, remoteLogicalTime, Date.now());
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
