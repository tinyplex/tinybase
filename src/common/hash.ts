import type {
  CellOrUndefined,
  Hash,
  Hlc,
  Id,
  ValueOrUndefined,
} from '../@types/index.d.ts';
import {arrayForEach, arrayReduce} from './array.ts';
import {jsonStringWithUndefined} from './json.ts';
import {objEntries} from './obj.ts';
import {GLOBAL} from './other.ts';

const textEncoder = /* @__PURE__ */ new GLOBAL.TextEncoder();

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

export const addOrRemoveHash = (hash1: Hash, hash2: Hash): Hash =>
  hash1 ^ hash2;

export const getHashOfChild = (id: Id, hash: Hash): Hash =>
  getHash(id + ':' + hash);

export const getValuesHash = (children: {[id: Id]: Hash}, hlc: Hlc): Hash =>
  arrayReduce(
    objEntries(children),
    (hash, [childId, childHash]) =>
      addOrRemoveHash(hash, getHashOfChild(childId, childHash)),
    getHash(hlc),
  );

export const getValueHash = (
  cellOrValue: CellOrUndefined | ValueOrUndefined,
  hlc: Hlc,
): Hash => getHash(jsonStringWithUndefined(cellOrValue) + ':' + hlc);

export const getCellHash = getValueHash;
export const getRowHash = getValuesHash;
export const getTableHash = getValuesHash;
export const getTablesHash = getTableHash;
