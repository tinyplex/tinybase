/** @jsx createElement */

import {arrayIsEmpty, arrayJoin, arrayMap} from '../common/array';
import {useIndexIds, useIndexes, useSliceIds} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import {Id} from '../types/common';
import {IndexProps} from '../types/ui-react';
import {StoreProp} from './types';
import {createElement} from '../ui-react/common';
import {getUniqueId} from './common';
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
    {arrayJoin(useSliceIds(indexId, indexes), ', ')}
  </Details>
);

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
        : arrayMap(indexIds, (indexId) => (
            <IndexView
              indexes={indexes}
              indexesId={indexesId}
              indexId={indexId}
              s={s}
            />
          ))}
    </Details>
  );
};
