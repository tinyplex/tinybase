import {Id, Ids} from '../common.d';
import {arrayLength, arrayPop, arrayPush} from './array';
import {EMPTY_STRING} from './strings';

export const getPoolFunctions = (): [() => Id, (id: Id) => void] => {
  const pool: Ids = [];
  let nextId = 0;
  return [
    (): Id => arrayPop(pool) ?? EMPTY_STRING + nextId++,
    (id: Id): void => {
      if (arrayLength(pool) < 1e3) {
        arrayPush(pool, id);
      }
    },
  ];
};
