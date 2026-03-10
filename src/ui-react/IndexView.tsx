import type {
  IndexProps,
  IndexView as IndexViewDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {Wrap} from './common/Wrap.tsx';
import {useSliceIds} from './hooks.ts';
import {SliceView} from './SliceView.tsx';

export const IndexView: typeof IndexViewDecl = ({
  indexId,
  indexes,
  sliceComponent: Slice = SliceView,
  getSliceComponentProps,
  separator,
  debugIds,
}: IndexProps): any => (
  <Wrap separator={separator} debugIds={debugIds} id={indexId}>
    {arrayMap(useSliceIds(indexId, indexes), (sliceId) => (
      <Slice
        key={sliceId}
        {...getProps(getSliceComponentProps, sliceId)}
        indexId={indexId}
        sliceId={sliceId}
        indexes={indexes}
        debugIds={debugIds}
      />
    ))}
  </Wrap>
);
