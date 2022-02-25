import {arrayReduce} from './array';
import {isUndefined} from './other';

export type Coll<Value> = Map<unknown, Value> | Set<Value>;

const collSizeN =
  <Child>(collSizer: (map: Coll<Child>) => number) =>
  (coll: Coll<Coll<Child>>): number =>
    arrayReduce(
      collValues(coll),
      (total, coll2) => total + collSizer(coll2),
      0,
    );

export const collSize = (coll: Coll<unknown>): number => coll.size;
export const collSize2 = collSizeN(collSize);
export const collSize3 = collSizeN(collSize2);
export const collSize4 = collSizeN(collSize3);
export const collPairSize = (
  pair: [Coll<unknown>, Coll<unknown>],
  func: any = collSize,
): number => func(pair[0]) + func(pair[1]);

export const collHas = (
  coll: Coll<unknown> | undefined,
  keyOrValue: unknown,
): boolean => coll?.has(keyOrValue) ?? false;

export const collIsEmpty = (coll: Coll<unknown> | undefined): boolean =>
  isUndefined(coll) || collSize(coll) == 0;

export const collValues = <Value>(coll: Coll<Value> | undefined): Value[] => [
  ...(coll?.values() ?? []),
];

export const collClear = (coll: Coll<unknown>): void => coll.clear();

export const collForEach = <Value>(
  coll: Coll<Value> | undefined,
  cb: (value: Value, key: any) => void,
): void => coll?.forEach(cb);

export const collDel = (
  coll: Coll<unknown> | undefined,
  keyOrValue: unknown,
): boolean | undefined => coll?.delete(keyOrValue);
