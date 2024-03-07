import {Hash, Stamp, Time} from '../types/mergeable-store';
import {IdMap, mapNew, mapToObj} from '../common/map';
import {IdObj, objNew} from '../common/obj';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';
import {getHash} from './hash';

export type HashStamp<Thing> = [hash: Hash, time: Time, thing: Thing];

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
  hashStamp[0] = hash >>> 0;
  if (time > hashStamp[1]) {
    hashStamp[1] = time;
  }
};

export const stampNewObj = <Thing>(time: Time): Stamp<IdObj<Thing>> =>
  stampNew(time, objNew<Thing>());

export const hashStampNewMap = <Thing>(
  time = EMPTY_STRING,
): HashStamp<IdMap<Thing>> => [0, time, mapNew<Id, Thing>()];

export const cloneHashStampToStamp = <Value>([
  ,
  time,
  value,
]: HashStamp<Value>): Stamp<Value> => [time, value];

export const hashStampToStamp = <From, To = From>(
  [, time, value]: HashStamp<From>,
  mapper: (value: From, time: Time) => To,
): Stamp<To> => [time, mapper(value, time)];

export const hashStampMapToStampObj = <From, To = From>(
  hashStampMap: HashStamp<IdMap<From>>,
  mapper: (mapValue: From) => To,
): Stamp<IdObj<To>> =>
  hashStampToStamp(hashStampMap, (map) => mapToObj(map, mapper));
