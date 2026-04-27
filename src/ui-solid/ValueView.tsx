/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {ValueProps} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {renderView, wrap} from './common/wrap.tsx';
import {useValue} from './primitives.ts';

export const ValueView = (props: ValueProps): JSXElement => {
  const value = useValue(
    () => props.valueId,
    () => props.store,
  );
  return renderView(() =>
    wrap(
      EMPTY_STRING + (getValue(value) ?? EMPTY_STRING),
      undefined,
      props.debugIds,
      props.valueId,
    ),
  );
};
