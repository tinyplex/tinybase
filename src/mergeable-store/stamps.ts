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

export const hashStampToStamp = <From, To = From>(
  [time, value]: HashStamp<From>,
  mapper: (value: From, time: Time) => To,
): Stamp<To> => [time, mapper(value, time)];

export const hashStampMapToStampObj = <From, To = From>(
  hashStampMap: HashStamp<IdMap<From>>,
  mapper: (mapValue: From) => To,
): Stamp<IdObj<To>> =>
  hashStampToStamp(hashStampMap, (map) => mapToObj(map, mapper));
