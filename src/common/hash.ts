import {GLOBAL} from './other.ts';
import {arrayForEach} from './array.ts';

const textEncoder = new GLOBAL.TextEncoder();

// fnv1a
export const getHash = (value: string): number => {
  let hash = 0x811c9dc5;
  arrayForEach(textEncoder.encode(value), (char) => {
    hash ^= char;
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });
  return hash >>> 0;
};
