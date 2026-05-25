import type {getUniqueId as getUniqueIdDecl} from '../@types/common/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap, arrayReduce} from './array.ts';
import {mapGet, mapNew} from './map.ts';
import {GLOBAL, mathFloor, mathRandom} from './other.ts';
import {EMPTY_STRING, strSplit} from './strings.ts';

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
  ? <Array extends Uint8Array>(array: Array): Array =>
      GLOBAL.crypto.getRandomValues(array as any) as Array
  : /*! istanbul ignore next */
    <Array extends Uint8Array>(array: Array): Array =>
      arrayMap(array as any, () => mathFloor(mathRandom() * 256)) as any;

export const getUniqueId: typeof getUniqueIdDecl = (length = 16): Id =>
  arrayReduce<number, Id>(
    getRandomValues(new Uint8Array(length)) as any,
    (uniqueId, number) => uniqueId + encode(number),
    EMPTY_STRING,
  );
