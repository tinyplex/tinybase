import {Hash, HashStamp, Stamp, Time} from '../types/mergeable-store';
import {IdMap, mapNew, mapToObj} from '../common/map';
import {IdObj, objNew} from '../common/obj';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';
import {getHash} from './hash';

export const stampNew = <Thing>(time: Time, thing?: Thing): Stamp<Thing> => [
  time,
  thing as Thing,
];

export const hashIdAndHash = (id: Id, hash: Hash) => getHash(id + ':' + hash);

export const updateHashStamp = (
  hashStamp: HashStamp<unknown>,
  hash: Hash,
  time: Time,
) => {
  hashStamp[2] = hash >>> 0;
  if (time > hashStamp[0]) {
    hashStamp[0] = time;
  }
};

export const stampNewObj = <Thing>(time: Time): Stamp<IdObj<Thing>> =>
  stampNew(time, objNew<Thing>());

export const hashStampNewMap = <Thing>(
  time = EMPTY_STRING,
): HashStamp<IdMap<Thing>> => [time, mapNew<Id, Thing>(), 0];

export const hashStampNewThing = <Thing>(): HashStamp<Thing> => [
  EMPTY_STRING,
  undefined as any,
  0,
];

export const cloneHashStampToStamp = <Value>([
  time,
  value,
]: HashStamp<Value>): Stamp<Value> => [time, value];

export const cloneHashStamp = <Value>([
  time,
  value,
  hash,
]: HashStamp<Value>): HashStamp<Value> => [time, value, hash];

export const hashStampToHashStamp = <
  From,
  To = From,
  AsChanges extends boolean = false,
>(
  [time, value, hash]: HashStamp<From>,
  mapper: (value: From, time: Time) => To,
  asChanges?: AsChanges,
): AsChanges extends true ? Stamp<To> : HashStamp<To> =>
  (asChanges
    ? [time, mapper(value, time)]
    : [time, mapper(value, time), hash]) as any;

export const hashStampToStamp = <From, To = From>(
  [time, value]: HashStamp<From>,
  mapper: (value: From, time: Time) => To,
): Stamp<To> => [time, mapper(value, time)];

export const hashStampMapToHashStampObj = <
  From,
  To = From,
  AsChanges extends boolean = false,
>(
  hashStampMap: HashStamp<IdMap<From>>,
  asChanges: AsChanges,
  mapper: (mapValue: From) => To = (asChanges
    ? cloneHashStampToStamp
    : cloneHashStamp) as any,
): AsChanges extends true ? Stamp<IdObj<To>> : HashStamp<IdObj<To>> =>
  hashStampToHashStamp(hashStampMap, (map) => mapToObj(map, mapper), asChanges);
