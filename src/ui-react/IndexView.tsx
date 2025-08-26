import type {
  IndexProps,
  IndexView as IndexViewDecl,
} from '../@types/ui-react/index.js';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {wrap} from './common.tsx';
import {useSliceIds} from './hooks.ts';
import {SliceView} from './SliceView.tsx';

export const IndexView: typeof IndexViewDecl = ({
  indexId,
  indexes,
  sliceComponent: Slice = SliceView,
  getSliceComponentProps,
  separator,
  debugIds,
}: IndexProps): any =>
  wrap(
    arrayMap(useSliceIds(indexId, indexes), (sliceId) => (
      <Slice
        key={sliceId}
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
