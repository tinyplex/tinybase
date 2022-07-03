import {Coll, collSize2} from './coll';
import {IdMap, mapNew} from './map';

export type Pair<Value> = [Value, Value];
export type Pair2<Value> = Pair<Pair<Value>>;

export const pairNew = <Value>(value: Value): Pair<Value> => [value, value];

export const pairCollSize2 = (
  pair: Pair<Coll<unknown>>,
  func: any = collSize2,
): number => func(pair[0]) + func(pair[1]);

export const pairCollIsEmpty = (pair: Pair<Coll<unknown>>): boolean =>
  pairCollSize2(pair) == 0;

export const pairNewMap = <Value>(): Pair<IdMap<Value>> => [mapNew(), mapNew()];

export const pair2CollSize2 = (
  pair2: Pair2<Coll<unknown>>,
  func: any = collSize2,
): number => pairCollSize2(pair2[0], func) + pairCollSize2(pair2[1], func);

export const pair2NewMap = <Value>(): Pair2<IdMap<Value>> => [
  pairNewMap(),
  pairNewMap(),
];
