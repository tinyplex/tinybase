/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {Id} from '../../@types/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {isArray, isUndefined} from '../../common/other.ts';

export const wrap = (
  children: JSXElement,
  separator?: JSXElement | string,
  encloseWithId?: boolean,
  id?: Id,
): JSXElement => {
  const separated =
    isUndefined(separator) || !isArray(children)
      ? children
      : arrayMap(children, (child, c) => (c > 0 ? [separator, child] : child));
  return encloseWithId ? [id, ':{', separated, '}'] : separated;
};
