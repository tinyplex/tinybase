export const arrayHas = <Value>(array: Value[], value: Value): boolean =>
  array.includes(value);

export const arrayForEach = <Value>(
  array: Value[],
  cb: (value: Value, index: number) => void,
): void => array.forEach(cb);

export const arrayLength = (array: unknown[]): number => array.length;

export const arrayIsEmpty = (array: unknown[]): boolean =>
  arrayLength(array) == 0;

export const arrayReduce = <Value, Result>(
  array: Value[],
  cb: (previous: Result, current: Value) => Result,
  initial: Result,
): Result => array.reduce(cb, initial);

export const arrayFilter = <Value>(
  array: Value[],
  cb: (value: Value) => boolean,
): Value[] => array.filter(cb);

export const arrayFromSecond = <Value>(ids: Value[]): Value[] => ids.slice(1);
