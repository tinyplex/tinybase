import {Stamp} from 'tinybase/debug';

const MASK6 = 63;
const SHIFT36 = 2 ** 36;
const SHIFT30 = 2 ** 30;
const SHIFT24 = 2 ** 24;
const SHIFT18 = 2 ** 18;
const SHIFT12 = 2 ** 12;
const SHIFT6 = 2 ** 6;

const toB64 = (num: number): string => String.fromCharCode(48 + (num & MASK6));

const encodeHlc = (
  logicalTime42: number,
  counter24: number,
  clientHash30: number,
): string =>
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

const STORE_ID_HASHES: {[id: string]: number} = {s1: 139573449, s2: 89240592};

export const time = (offset: number, counter: number, storeId: string = 's1') =>
  encodeHlc(START_TIME.valueOf() + offset, counter, STORE_ID_HASHES[storeId]);

export const START_TIME = new Date('2024-01-01 00:00:00 UTC');

export const stamped1 = (offset: number, counter: number, thing: any) => [
  0,
  time(offset, counter, 's1'),
  thing,
];

export const stamped2 = (offset: number, counter: number, thing: any) => [
  0,
  time(offset, counter, 's2'),
  thing,
];

export const nullStamped = <Thing>(thing: Thing): Stamp<Thing> => [
  0,
  '',
  thing,
];
