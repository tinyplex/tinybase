import {mapGet, mapNew} from './map';
import {EMPTY_STRING} from './strings';
import {arrayMap} from './array';

const MASK6 = 63;
const ENCODE =
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.split(
    EMPTY_STRING,
  );
const DECODE = mapNew(arrayMap(ENCODE, (char, index) => [char, index])) as any;

export const encode = (num: number): string => ENCODE[num & MASK6];

export const decode = (str: string, pos: number): number =>
  mapGet(DECODE, str[pos]) ?? 0;