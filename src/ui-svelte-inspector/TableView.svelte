<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {SORT_CELL, STATE_TABLE, getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {jsonParse, jsonStringWithMap} from '../common/json.ts';
  import {getCell} from '../ui-svelte/functions.svelte.ts';
  import {SortedTableInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';

  type Props = {tableId: Id; store: Store; storeId?: Id} & StoreProp;

  let {tableId, store, storeId, s}: Props = $props();

  const uniqueId = $derived(getUniqueId('t', storeId, tableId));
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
  const title = $derived('Table: ' + tableId);

  const handleChange = (
    sortAndOffset: [cellId: Id | undefined, descending: boolean, offset: number],
  ) => {
    sort.current = jsonStringWithMap(sortAndOffset);
  };
</script>

<Details {uniqueId} {title} {s}>
  {#snippet children()}
    <SortedTableInHtmlTable
      {tableId}
      {store}
      cellId={sortAndOffset[0]}
      descending={sortAndOffset[1]}
      offset={sortAndOffset[2]}
      limit={10}
      paginator={true}
      sortOnClick={true}
      onChange={handleChange}
    />
  {/snippet}
</Details>
