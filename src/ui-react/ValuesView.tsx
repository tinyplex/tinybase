import type {
  ValuesProps,
  ValuesView as ValuesViewDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {wrap} from './common/wrap.tsx';
import {useValueIds} from './hooks.ts';
import {ValueView} from './ValueView.tsx';

export const ValuesView: typeof ValuesViewDecl = ({
  store,
  valueComponent: Value = ValueView,
  getValueComponentProps,
  separator,
  debugIds,
}: ValuesProps): any =>
  wrap(
    arrayMap(useValueIds(store), (valueId) => (
      <Value
        key={valueId}
        {...getProps(getValueComponentProps, valueId)}
        valueId={valueId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
  );
