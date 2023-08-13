/** @jsx createElement */

import {getUniqueId, sortedIdsMap} from './common';
import {useQueries, useQueryIds} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import {Id} from '../types/common';
import {Queries} from '../types/queries';
import {ResultSortedTableInHtmlTable} from '../ui-react/dom';
import {StoreProp} from './types';
import {arrayIsEmpty} from '../common/array';
import {createElement} from '../ui-react/common';
import {isUndefined} from '../common/other';

const QueryView = ({
  queries,
  queriesId,
  queryId,
  s,
}: {
  readonly queries?: Queries | undefined;
  readonly queriesId?: Id;
  readonly queryId: Id;
} & StoreProp) => {
  return (
    <Details
      uniqueId={getUniqueId('q', queriesId, queryId)}
      summary={'Query: ' + queryId}
      s={s}
    >
      <ResultSortedTableInHtmlTable queryId={queryId} queries={queries} />
    </Details>
  );
};

export const QueriesView = ({
  queriesId,
  s,
}: {readonly queriesId?: Id} & StoreProp) => {
  const queries = useQueries(queriesId);
  const queryIds = useQueryIds(queries);
  return isUndefined(queries) ? null : (
    <Details
      uniqueId={getUniqueId('q', queriesId)}
      summary={'Queries: ' + (queriesId ?? DEFAULT)}
      s={s}
    >
      {arrayIsEmpty(queryIds)
        ? 'No queries defined'
        : sortedIdsMap(queryIds, (queryId) => (
            <QueryView
              queries={queries}
              queriesId={queriesId}
              queryId={queryId}
              s={s}
            />
          ))}
    </Details>
  );
};
