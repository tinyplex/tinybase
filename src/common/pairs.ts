import {Coll, collSize} from './coll';
import {mapNew} from './map';

export type Pair<Value> = [Value, Value];
export type Quad<Value> = Pair<Pair<Value>>;

export const pairNew = <Value>(value: Value): Pair<Value> => [value, value];

export const pairCollSize = (
  pair: Pair<Coll<unknown>>,
  func: any = collSize,
): number => func(pair[0]) + func(pair[1]);

export const pairNewMap = <Value>(newFunction: any = mapNew): Pair<Value> => [
  newFunction() as Value,
  newFunction() as Value,
];
