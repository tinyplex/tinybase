<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Queries} from '../@types/queries/index.d.ts';
  import {
    SORT_CELL,
    STATE_TABLE,
    getUniqueId,
  } from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {jsonParse, jsonStringWithMap} from '../common/json.ts';
  import {getCell} from '../ui-svelte/functions.svelte.ts';
  import {ResultSortedTableInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';

  type Props = {queries?: Queries; queriesId?: Id; queryId: Id} & StoreProp;

  let {queries, queriesId, queryId, s}: Props = $props();

  const uniqueId = $derived(getUniqueId('q', queriesId, queryId));
  const sort = getCell(
    () => STATE_TABLE,
    () => uniqueId,
    () => SORT_CELL,
    () => s,
  );
  const sortAndOffset = $derived(
    jsonParse((sort.current as string) ?? '[]') as [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  );
  const title = $derived('Query: ' + queryId);

  const handleChange = (
    sortAndOffset: [
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
    ],
  ) => {
    sort.current = jsonStringWithMap(sortAndOffset);
  };
</script>

<Details {uniqueId} {title} {s}>
  <ResultSortedTableInHtmlTable
    {queryId}
    {queries}
    cellId={sortAndOffset[0]}
    descending={sortAndOffset[1]}
    offset={sortAndOffset[2]}
    limit={10}
    paginator={true}
    sortOnClick={true}
    onChange={handleChange}
  />
</Details>
