/** @jsx createElement */

import type {IndexProps, SliceProps} from '../@types/ui-react/index.d.ts';
import {arrayIsEmpty, arrayMap} from '../common/array.ts';
import {getUniqueId, sortedIdsMap, useEditable} from './common.ts';
import {useIndexIds, useIndexes, useSliceIds} from '../ui-react/index.ts';
import {DEFAULT} from '../common/strings.ts';
import {Details} from './Details.tsx';
import type {Id} from '../@types/common/index.d.ts';
import {SliceInHtmlTable} from '../ui-react-dom/index.tsx';
import type {StoreProp} from './types.ts';
import {createElement} from '../common/react.ts';
import {isUndefined} from '../common/other.ts';

const IndexView = ({
  indexes,
  indexesId,
  indexId,
  s,
}: IndexProps & {readonly indexesId?: Id} & StoreProp) => (
  <Details
    uniqueId={getUniqueId('i', indexesId, indexId)}
    summary={'Index: ' + indexId}
    s={s}
  >
    {arrayMap(useSliceIds(indexId, indexes), (sliceId) => (
      <SliceView
        indexes={indexes}
        indexesId={indexesId}
        indexId={indexId}
        sliceId={sliceId}
        s={s}
        key={sliceId}
      />
    ))}
  </Details>
);

const SliceView = ({
  indexes,
  indexesId,
  indexId,
  sliceId,
  s,
}: SliceProps & {readonly indexesId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('i', indexesId, indexId, sliceId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return (
    <Details
      uniqueId={uniqueId}
      summary={'Slice: ' + sliceId}
      editable={editable}
      handleEditable={handleEditable}
      s={s}
    >
      <SliceInHtmlTable
        sliceId={sliceId}
        indexId={indexId}
        indexes={indexes}
        editable={editable}
      />
    </Details>
  );
};

export const IndexesView = ({
  indexesId,
  s,
}: {readonly indexesId?: Id} & StoreProp) => {
  const indexes = useIndexes(indexesId);
  const indexIds = useIndexIds(indexes);
  return isUndefined(indexes) ? null : (
    <Details
      uniqueId={getUniqueId('i', indexesId)}
      summary={'Indexes: ' + (indexesId ?? DEFAULT)}
      s={s}
    >
      {arrayIsEmpty(indexIds)
        ? 'No indexes defined'
        : sortedIdsMap(indexIds, (indexId) => (
            <IndexView
              indexes={indexes}
              indexesId={indexesId}
              indexId={indexId}
              s={s}
              key={indexId}
            />
          ))}
    </Details>
  );
};
