import {BOOLEAN, FUNCTION, STRING, getTypeOf} from './strings.ts';

const promise = Promise;

export const GLOBAL = globalThis;
export const WINDOW = GLOBAL.window;

export const startInterval = (
  callback: () => void,
  sec: number,
  immediate?: 1,
) => {
  immediate && callback();
  return setInterval(callback, sec * 1000);
};
export const stopInterval = clearInterval;

export const math = Math;
export const mathMax = math.max;
export const mathMin = math.min;
export const mathFloor = math.floor;

export const isFiniteNumber: (num: any) => boolean = isFinite;

export const isInstanceOf = (
  thing: unknown,
  cls: MapConstructor | SetConstructor | ObjectConstructor,
): boolean => thing instanceof cls;

export const isUndefined = (thing: unknown): thing is undefined | null =>
  thing == undefined;

export const ifNotUndefined = <Value, Return>(
  value: Value | null | undefined,
  then: (value: Value) => Return,
  otherwise?: () => Return,
): Return | undefined => (isUndefined(value) ? otherwise?.() : then(value));

export const isTypeStringOrBoolean = (
  type: string,
): type is 'string' | 'boolean' => type == STRING || type == BOOLEAN;

export const isString = (thing: unknown): thing is string =>
  getTypeOf(thing) == STRING;

export const isFunction = (thing: unknown): thing is (...args: any[]) => any =>
  getTypeOf(thing) == FUNCTION;

export const isArray = (thing: unknown): thing is any[] => Array.isArray(thing);

export const slice = <ArrayOrString extends string | any[]>(
  arrayOrString: ArrayOrString,
  start: number,
  end?: number,
): ArrayOrString => arrayOrString.slice(start, end) as ArrayOrString;

export const size = (arrayOrString: string | any[]): number =>
  arrayOrString.length;

export const test = (regex: RegExp, subject: string): boolean =>
  regex.test(subject);

export const getUndefined = (): undefined => undefined;

export const promiseNew = <Value>(
  resolver: (
    resolve: (value: Value) => void,
    reject: (reason?: any) => void,
  ) => void,
): Promise<Value> => new promise(resolver);

export const promiseAll = async (promises: Promise<any>[]) =>
  promise.all(promises);

export const errorNew = (message: string) => {
  throw new Error(message);
};
