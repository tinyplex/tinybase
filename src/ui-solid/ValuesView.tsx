/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {
  ValuesProps,
} from '../@types/ui-solid/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {renderView, wrap} from './common/wrap.tsx';
import {useValueIds} from './hooks.ts';
import {ValueView} from './ValueView.tsx';

export const ValuesView = (props: ValuesProps): JSXElement => {
  const valueIds = useValueIds(() => props.store);
  return renderView(() => {
    const Value = props.valueComponent ?? ValueView;
    return wrap(
      arrayMap(getValue(valueIds) as Id[], (valueId: Id) => (
        <Value
          {...getProps(props.getValueComponentProps, valueId)}
          valueId={valueId}
          store={props.store}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
    );
  });
};
