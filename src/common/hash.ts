import type {
  addOrRemoveHash as addOrRemoveHashDecl,
  getCellHash as getCellHashDecl,
  getCellInRowHash as getCellHashInRowDecl,
  getHash as getHashDecl,
  getRowHash as getRowHashDecl,
  getRowInTableHash as getRowHashInTableDecl,
  getTableHash as getTableHashDecl,
  getTableInTablesHash as getTableHashInTablesDecl,
  getTablesHash as getTablesHashDecl,
  getValueHash as getValueHashDecl,
  getValueInValuesHash as getValueHashInValuesDecl,
  getValuesHash as getValuesHashDecl,
} from '../@types/common/index.d.ts';
import type {Hash, Hlc, Id, ValueOrUndefined} from '../@types/index.d.ts';
import {arrayForEach, arrayReduce} from './array.ts';
import {jsonStringWithUndefined} from './json.ts';
import {objEntries} from './obj.ts';
import {GLOBAL} from './other.ts';

const textEncoder = /* @__PURE__ */ new GLOBAL.TextEncoder();

// fnv1a
export const getHash: typeof getHashDecl = (string: string): Hash => {
  let hash = 0x811c9dc5;
  arrayForEach(textEncoder.encode(string), (char) => {
    hash ^= char;
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });
  return hash >>> 0;
};

export const addOrRemoveHash: typeof addOrRemoveHashDecl = (
  hash1: Hash,
  hash2: Hash,
): Hash => (hash1 ^ hash2) >>> 0;

export const getValuesHash: typeof getValuesHashDecl = (
  valueHashes: {[valueId: Id]: Hash},
  valuesHlc: Hlc,
): Hash =>
  arrayReduce(
    objEntries(valueHashes),
    (valuesHash, [valueId, valueHash]) =>
      addOrRemoveHash(valuesHash, getValueInValuesHash(valueId, valueHash)),
    getHash(valuesHlc),
  );

export const getValueInValuesHash: typeof getValueHashInValuesDecl = (
  valueId: Id,
  valueHash: Hash,
): Hash => getHash(valueId + ':' + valueHash);

export const getValueHash: typeof getValueHashDecl = (
  value: ValueOrUndefined,
  valueHlc: Hlc,
): Hash => getHash(jsonStringWithUndefined(value) + ':' + valueHlc);

export const getCellHash: typeof getCellHashDecl = getValueHash;

export const getCellInRowHash: typeof getCellHashInRowDecl =
  getValueInValuesHash;

export const getRowHash: typeof getRowHashDecl = getValuesHash;

export const getRowInTableHash: typeof getRowHashInTableDecl =
  getValueInValuesHash;

export const getTableHash: typeof getTableHashDecl = getValuesHash;

export const getTableInTablesHash: typeof getTableHashInTablesDecl =
  getValueInValuesHash;

export const getTablesHash: typeof getTablesHashDecl = getTableHash;
