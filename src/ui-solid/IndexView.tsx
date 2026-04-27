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

export const IndexView = (props: IndexProps): any => {
  const sliceIds = useSliceIds(
    (() => props.indexId) as any,
    (() => props.indexes) as any,
  ) as any;
  return () => {
    const Slice = props.sliceComponent ?? SliceView;
    return wrap(
      arrayMap(getValue(sliceIds) as Id[], (sliceId: Id) => (
        <Slice
          {...getProps(props.getSliceComponentProps, sliceId)}
          indexId={props.indexId}
          sliceId={sliceId}
          indexes={props.indexes}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      props.indexId,
    );
  };
};
