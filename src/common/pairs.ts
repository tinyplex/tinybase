import {Coll, collSize} from './coll';
import {mapNew} from './map';

export type Pair<Value> = [Value, Value];
export type Pair2<Value> = Pair<Pair<Value>>;

export const pairNew = <Value>(value: Value): Pair<Value> => [value, value];

export const pairCollSize = (
  pair: Pair<Coll<unknown>>,
  func: any = collSize,
): number => func(pair[0]) + func(pair[1]);

export const pairCollIsEmpty = (pair: Pair<Coll<unknown>>): boolean =>
  pairCollSize(pair) == 0;

export const pairNewMap = <Value>(newFunction: any = mapNew): Pair<Value> => [
  newFunction() as Value,
  newFunction() as Value,
];

export const pair2CollSize = (
  pair2: Pair2<Coll<unknown>>,
  func: any = collSize,
): number => pairCollSize(pair2[0], func) + pairCollSize(pair2[1], func);

export const pair2NewMap = <Value>(newFunction: any = mapNew): Pair2<Value> =>
  pairNewMap(() => pairNewMap(newFunction));
