/** @jsx createElement */

import {SORT_CELL, STATE_TABLE, getUniqueId, sortedIdsMap} from './common.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {
  useCell,
  useQueries,
  useQueryIds,
  useSetCellCallback,
} from '../ui-react/index.ts';
import {DEFAULT} from '../common/strings.ts';
import {Details} from './Details.tsx';
import type {Id} from '../@types/common/index.d.ts';
import type {Queries} from '../@types/queries/index.d.ts';
import {ResultSortedTableInHtmlTable} from '../ui-react-dom/index.tsx';
import type {StoreProp} from './types.ts';
import {arrayIsEmpty} from '../common/array.ts';
import {createElement} from '../common/react.ts';
import {isUndefined} from '../common/other.ts';

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
  const uniqueId = getUniqueId('q', queriesId, queryId);
  const [cellId, descending, offset] = jsonParse(
    (useCell(STATE_TABLE, uniqueId, SORT_CELL, s) as string) ?? '[]',
  );
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    [],
    s,
  );
  return (
    <Details uniqueId={uniqueId} summary={'Query: ' + queryId} s={s}>
      <ResultSortedTableInHtmlTable
        queryId={queryId}
        queries={queries}
        cellId={cellId}
        descending={descending}
        offset={offset}
        limit={10}
        paginator={true}
        sortOnClick={true}
        onChange={handleChange}
      />
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
              key={queryId}
            />
          ))}
    </Details>
  );
};
