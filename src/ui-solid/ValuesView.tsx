/* @jsxImportSource solid-js */
import type {
  ValuesProps,
} from '../@types/ui-solid/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {wrap} from './common/wrap.tsx';
import {useValueIds} from './hooks.ts';
import {ValueView} from './ValueView.tsx';

export const ValuesView = ({
  store,
  valueComponent: Value = ValueView,
  getValueComponentProps,
  separator,
  debugIds,
}: ValuesProps): any => {
  const valueIds = useValueIds(store) as any;
  return () =>
    wrap(
      arrayMap(getValue(valueIds) as Id[], (valueId: Id) => (
        <Value
          {...getProps(getValueComponentProps, valueId)}
          valueId={valueId}
          store={store}
          debugIds={debugIds}
        />
      )),
      separator,
    );
};
