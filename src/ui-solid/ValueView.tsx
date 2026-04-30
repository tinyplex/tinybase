/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {ValueProps} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useValue} from './primitives.ts';

export const ValueView = (props: ValueProps): JSXElement => {
  const value = useValue(
    () => props.valueId,
    () => props.store,
  );
  // eslint-disable-next-line solid/reactivity
  return (() =>
    wrap(
      EMPTY_STRING + (getValue(value) ?? EMPTY_STRING),
      undefined,
      props.debugIds,
      props.valueId,
    )) as unknown as JSXElement;
};
