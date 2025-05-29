import type {Hlc, Id} from '../@types/common/index.d.ts';
import type {
  CellStamp,
  Hash,
  Stamp,
  ValueStamp,
} from '../@types/mergeable-store/index.d.ts';
import {getHash} from './hash.ts';
import {IdMap, mapNew, mapToObj} from './map.ts';
import {IdObj, objNew} from './obj.ts';
import {isArray, isFiniteNumber, isString, size} from './other.ts';
import {EMPTY_STRING, NUMBER, getTypeOf} from './strings.ts';

export type StampMap<Thing> = Stamp<IdMap<Thing>, true>;

export type TablesStampMap = StampMap<TableStampMap>;
export type TableStampMap = StampMap<RowStampMap>;
export type RowStampMap = StampMap<CellStamp<true>>;
export type ValuesStampMap = StampMap<ValueStamp<true>>;

export const stampClone = <Value>([value, hlc]: Stamp<
  Value,
  boolean
>): Stamp<Value> => stampNew(value, hlc);

const stampCloneWithHash = <Value>([value, hlc, hash]: Stamp<
  Value,
  true
>): Stamp<Value, true> => [value, hlc, hash];

export const stampNew = <Value>(
  value: Value,
  hlc: Hlc | undefined,
): Stamp<Value> => (hlc ? [value, hlc] : [value]);

export const stampNewWithHash = <Value>(
  value: Value,
  hlc: Hlc,
  hash: Hash,
): Stamp<Value, true> => [value, hlc, hash];

export const getStampHash = (stamp: Stamp<unknown, true>): Hash => stamp[2];

export const replaceHlcHash = (oldHlc: Hlc, newHlc: Hlc) =>
  newHlc > oldHlc ? (oldHlc ? getHash(oldHlc) : 0) ^ getHash(newHlc) : 0;

export const getLatestHlc = (
  hlc1: Hlc | undefined,
  hlc2: Hlc | undefined,
): Hlc =>
  /*! istanbul ignore next */
  ((hlc1 ?? '') > (hlc2 ?? '') ? hlc1 : hlc2) ?? '';

export const stampUpdate = (
  stamp: Stamp<unknown, true>,
  hlc: Hlc,
  hash: Hash,
) => {
  if (hlc > stamp[1]) {
    stamp[1] = hlc;
  }
  stamp[2] = hash >>> 0;
};

export const stampNewObj = <Thing>(hlc = EMPTY_STRING): Stamp<IdObj<Thing>> =>
  stampNew(objNew<Thing>(), hlc);

export const stampNewMap = <Thing>(hlc = EMPTY_STRING): StampMap<Thing> => [
  mapNew<Id, Thing>(),
  hlc,
  0,
];

export const stampMapToObjWithHash = <From, To = From>(
  [map, hlc, hash]: Stamp<IdMap<From>, true>,
  mapper: (mapValue: From) => To = stampCloneWithHash as any,
): Stamp<IdObj<To>, true> => [mapToObj(map, mapper), hlc, hash];

export const stampMapToObjWithoutHash = <From, To = From>(
  [map, hlc]: Stamp<IdMap<From>, boolean>,
  mapper: (mapValue: From) => To = stampClone as any,
): Stamp<IdObj<To>> => stampNew(mapToObj(map, mapper), hlc);

export const stampValidate = (
  stamp: Stamp<any, true>,
  validateThing: (thing: any) => boolean,
) =>
  isArray(stamp) &&
  size(stamp) == 3 &&
  isString(stamp[1]) &&
  getTypeOf(stamp[2]) == NUMBER &&
  isFiniteNumber(stamp[2]) &&
  validateThing(stamp[0]);
