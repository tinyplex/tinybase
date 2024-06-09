import {Coll, collSize2} from './coll.ts';
import {IdMap, mapNew} from './map.ts';

export type Pair<Value> = [Value, Value];

export const pairNew = <Value>(value: Value): Pair<Value> => [value, value];

export const pairCollSize2 = (
  pair: Pair<Coll<unknown>>,
  func: any = collSize2,
): number => func(pair[0]) + func(pair[1]);

export const pairNewMap = <Value>(): Pair<IdMap<Value>> => [mapNew(), mapNew()];

export const pairClone = <Value>(array: Pair<Value>): Pair<Value> => [...array];

export const pairIsEqual = <Value>([entry1, entry2]: Pair<Value>): boolean =>
  entry1 === entry2;
