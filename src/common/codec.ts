import type {Id} from '../@types/index.d.ts';
import {arrayMap, arrayReduce} from './array.ts';
import {mapGet, mapNew} from './map.ts';
import {GLOBAL, math, mathFloor} from './other.ts';
import {strSplit} from './strings.ts';

const MASK6 = 63;
const ENCODE = /* @__PURE__ */ strSplit(
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
);
const DECODE = /* @__PURE__ */ mapNew(
  /* @__PURE__ */ arrayMap(ENCODE, (char, index) => [char, index]),
) as any;

export const encode = (num: number): string => ENCODE[num & MASK6];

export const decode = (str: string, pos: number): number =>
  mapGet(DECODE, str[pos]) ?? 0;

// Fallback is not cryptographically secure but tolerable for ReactNative UUIDs.
export const getRandomValues = GLOBAL.crypto
  ? (array: Uint8Array): Uint8Array => GLOBAL.crypto.getRandomValues(array)
  : /*! istanbul ignore next */
    (array: Uint8Array): Uint8Array =>
      arrayMap(array as any, () => mathFloor(math.random() * 256)) as any;

export const getUniqueId = (length = 16): Id =>
  arrayReduce<number, Id>(
    getRandomValues(new Uint8Array(length)) as any,
    (uniqueId, number) => uniqueId + encode(number),
    '',
  );
