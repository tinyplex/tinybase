import {EMPTY_STRING} from './strings';
import {size} from './other';

export const arrayHas = <Value>(array: Value[], value: Value): boolean =>
  array.includes(value);

export const arrayEvery = <Value>(
  array: Value[],
  cb: (value: Value, index: number) => boolean | 0 | 1,
): boolean => array.every(cb);

export const arrayIsEqual = (array1: unknown[], array2: unknown[]): boolean =>
  size(array1) === size(array2) &&
  arrayEvery(array1, (value1, index) => array2[index] === value1);

export const arrayIsSorted = <Value>(
  array: Value[],
  sorter: (value1: Value, value2: Value) => number,
): boolean =>
  arrayEvery(
    array,
    (value, index) => index == 0 || sorter(array[index - 1], value) <= 0,
  );

export const arraySort = <Value>(
  array: Value[],
  sorter?: (value1: Value, value2: Value) => number,
): Value[] => array.sort(sorter);

export const arrayForEach = <Value>(
  array: {forEach: (cb: (value: Value, index: number) => void) => void},
  cb: (value: Value, index: number) => void,
): void => array.forEach(cb);

export const arrayJoin = (array: string[], sep = EMPTY_STRING) =>
  array.join(sep);

export const arrayMap = <Value, Return>(
  array: Value[],
  cb: (value: Value, index: number, array: Value[]) => Return,
): Return[] => array.map(cb);

export const arraySum = (array: number[]): number =>
  arrayReduce<number, number>(array, (i, j) => i + j, 0);

export const arrayIsEmpty = (array: unknown[]): boolean => size(array) == 0;

export const arrayReduce = <Value, Result>(
  array: {
    reduce: (
      cb: (previous: Result, current: Value) => Result,
      initial: Result,
    ) => Result;
  },
  cb: (previous: Result, current: Value) => Result,
  initial: Result,
): Result => array.reduce(cb, initial);

export const arrayFilter = <Value>(
  array: Value[],
  cb: (value: Value) => boolean,
): Value[] => array.filter(cb);

export const arrayClear = <Value>(array: Value[], to?: number): Value[] =>
  array.splice(0, to);

export const arrayPush = <Value>(array: Value[], ...values: Value[]): number =>
  array.push(...values);

export const arrayPop = <Value>(array: Value[]): Value | undefined =>
  array.pop();

export const arrayUnshift = <Value>(
  array: Value[],
  ...values: Value[]
): number => array.unshift(...values);

export const arrayShift = <Value>(array: Value[]): Value | undefined =>
  array.shift();
