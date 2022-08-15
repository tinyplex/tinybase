import {Coll, collSize2} from './coll';
import {IdMap, mapNew} from './map';

export type Pair<Value> = [Value, Value];

export const pairNew = <Value>(value: Value): Pair<Value> => [value, value];

export const pairCollSize2 = (
  pair: Pair<Coll<unknown>>,
  func: any = collSize2,
): number => func(pair[0]) + func(pair[1]);

export const pairNewMap = <Value>(): Pair<IdMap<Value>> => [mapNew(), mapNew()];
