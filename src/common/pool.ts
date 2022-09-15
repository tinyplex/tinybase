import {Id, Ids} from '../common.d';
import {arrayLength, arrayPush, arrayShift} from './array';
import {EMPTY_STRING} from './strings';

const INTEGER = /^\d+$/;

export const getPoolFunctions = (): [() => Id, (id: Id) => void] => {
  const pool: Ids = [];
  let nextId = 0;
  return [
    (): Id => arrayShift(pool) ?? EMPTY_STRING + nextId++,
    (id: Id): void => {
      if (INTEGER.test(id) && arrayLength(pool) < 1e3) {
        arrayPush(pool, id);
      }
    },
  ];
};
