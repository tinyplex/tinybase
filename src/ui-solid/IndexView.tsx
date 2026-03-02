/* @jsxImportSource solid-js */
import type {
  IndexProps,
} from '../@types/ui-solid/index.d.ts';
import type {Id} from '../@types/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps, getValue} from '../common/solid.ts';
import {wrap} from './common/wrap.tsx';
import {useSliceIds} from './hooks.ts';
import {SliceView} from './SliceView.tsx';

export const IndexView = ({
  indexId,
  indexes,
  sliceComponent: Slice = SliceView,
  getSliceComponentProps,
  separator,
  debugIds,
}: IndexProps): any => {
  const sliceIds = useSliceIds(indexId, indexes) as any;
  return () =>
    wrap(
      arrayMap(getValue(sliceIds) as Id[], (sliceId: Id) => (
        <Slice
          {...getProps(getSliceComponentProps, sliceId)}
          indexId={indexId}
          sliceId={sliceId}
          indexes={indexes}
          debugIds={debugIds}
        />
      )),
      separator,
      debugIds,
      indexId,
    );
};
