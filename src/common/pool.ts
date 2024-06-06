import type {Id, Ids} from '../@types/common';
import {arrayPush, arrayShift} from './array';
import {size, test} from './other';
import {EMPTY_STRING} from './strings';

const INTEGER = /^\d+$/;

export type PoolFunctions = [(reuse: 0 | 1) => Id, (id: Id) => void];

export const getPoolFunctions = (): PoolFunctions => {
  const pool: Ids = [];
  let nextId = 0;
  return [
    (reuse: 0 | 1): Id =>
      (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING + nextId++,
    (id: Id): void => {
      if (test(INTEGER, id) && size(pool) < 1e3) {
        arrayPush(pool, id);
      }
    },
  ];
};
