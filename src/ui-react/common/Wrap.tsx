import type {Id} from '../../@types/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {isArray, isUndefined} from '../../common/other.ts';

type Props = {
  children: any;
  separator?: any;
  debugIds?: boolean;
  id?: Id;
};

export const Wrap = ({children, separator, debugIds, id}: Props): any => {
  const separated =
    isUndefined(separator) || !isArray(children)
      ? children
      : arrayMap(children, (child, c) => (c > 0 ? [separator, child] : child));
  return debugIds && !isUndefined(id) ? [id, ':{', separated, '}'] : separated;
};
