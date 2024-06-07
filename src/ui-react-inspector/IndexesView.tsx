/** @jsx createElement */

import type {IndexProps, SliceProps} from '../@types/ui-react';
import {arrayIsEmpty, arrayMap} from '../common/array';
import {getUniqueId, sortedIdsMap, useEditable} from './common';
import {useIndexIds, useIndexes, useSliceIds} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import type {Id} from '../@types/common';
import {SliceInHtmlTable} from '../ui-react-dom';
import type {StoreProp} from './types';
import {createElement} from '../common/react';
import {isUndefined} from '../common/other';

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
