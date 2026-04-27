/* @jsxImportSource solid-js */
import type {
  ValueProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useValue} from './hooks.ts';

export const ValueView = (props: ValueProps): any => {
  const value = useValue(
    (() => props.valueId) as any,
    (() => props.store) as any,
  ) as any;
  return () =>
    wrap(
      EMPTY_STRING + ((getValue(value) as any) ?? EMPTY_STRING),
      undefined,
      props.debugIds,
      props.valueId,
    );
};
