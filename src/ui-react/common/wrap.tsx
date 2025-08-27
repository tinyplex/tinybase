import type {Id} from '../../@types/index.js';
import {arrayMap} from '../../common/array.ts';
import {isArray, isUndefined} from '../../common/other.ts';

export const wrap = (
  children: any,
  separator?: any,
  encloseWithId?: boolean,
  id?: Id,
) => {
  const separated =
    isUndefined(separator) || !isArray(children)
      ? children
      : arrayMap(children, (child, c) => (c > 0 ? [separator, child] : child));
  return encloseWithId ? [id, ':{', separated, '}'] : separated;
};
