import type {Id} from '../@types/common/index.d.ts';
import type {Hash, Stamp, Time} from '../@types/mergeables/index.d.ts';
import {getHash} from './hash.ts';
import {IdObj, objMap} from './obj.ts';
import {isArray, isFiniteNumber, isString, size} from './other.ts';
import {EMPTY_STRING, NUMBER, getTypeOf} from './strings.ts';

export type StampObj<Thing> = Stamp<IdObj<Thing>, true>;

export const stampEmpty = (): Stamp<undefined> => [undefined, EMPTY_STRING];

export const stampNew = <Value>(
  value: Value,
  time?: Time | undefined,
): Stamp<Value> => (time ? [value, time] : [value]);

export const stampNewWithHash = <Value>(
  value: Value,
  time: Time = EMPTY_STRING,
  hash: Hash = 0,
): Stamp<Value, true> => [value, time, hash];

export const stampClone = <Value>([value, time]: Stamp<
  Value,
  boolean
>): Stamp<Value> => stampNew(value, time);

const stampCloneWithHash = <Value>([value, time, hash]: Stamp<
  Value,
  true
>): Stamp<Value, true> => stampNewWithHash(value, time, hash);

export const stampObjNew = <Thing>(time = EMPTY_STRING): Stamp<IdObj<Thing>> =>
  stampNew({}, time);

export const stampObjNewWithHash = <Thing>(time?: Time): StampObj<Thing> =>
  stampNewWithHash({}, time);

export const stampObjClone = <From, To = From>(
  [map, time]: Stamp<IdObj<From>, boolean>,
  mapper: (mapValue: From) => To = stampClone as any,
): Stamp<IdObj<To>> => stampNew(objMap(map, mapper), time);

export const stampObjCloneWithHash = <From, To = From>(
  [map, time, hash]: Stamp<IdObj<From>, true>,
  mapper: (mapValue: From) => To = stampCloneWithHash as any,
): Stamp<IdObj<To>, true> => stampNewWithHash(objMap(map, mapper), time, hash);

export const getStampHash = (stamp: Stamp<unknown, true>): Hash => stamp[2];

export const hashIdAndHash = (id: Id, hash: Hash) => getHash(id + ':' + hash);

export const replaceTimeHash = (oldTime: Time, newTime: Time) =>
  newTime > oldTime ? (oldTime ? getHash(oldTime) : 0) ^ getHash(newTime) : 0;

export const getLatestTime = (
  time1: Time | undefined,
  time2: Time | undefined,
): Time =>
  /*! istanbul ignore next */
  ((time1 ?? '') > (time2 ?? '') ? time1 : time2) ?? '';

export const stampUpdateValueAndTime = <Value>(
  stamp: [Value, Time],
  value: Value,
  time: Time,
) => {
  stamp[0] = value;
  stamp[1] = time;
};

export const stampUpdateTimeAndHash = (
  stamp: Stamp<unknown, true>,
  time: Time,
  hash: Hash,
) => {
  if (time > stamp[1]) {
    stamp[1] = time;
  }
  stamp[2] = hash >>> 0;
};

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
