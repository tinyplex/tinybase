<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {getUniqueId, sortedIdsMap} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {arrayIsEmpty} from '../common/array.ts';
  import {TABLES} from '../common/strings.ts';
  import {getTableIds} from '../ui-svelte/functions.svelte.ts';
  import Details from './Details.svelte';
  import TableView from './TableView.svelte';

  type Props = {store: Store; storeId?: Id} & StoreProp;

  let {store, storeId, s}: Props = $props();
  const tableIds = getTableIds(() => store);
  const sortedTableIds = $derived(sortedIdsMap(tableIds.current, (tableId) => tableId));
</script>

<Details uniqueId={getUniqueId('ts', storeId)} title={TABLES} {s}>
  {#snippet children()}
    {#if arrayIsEmpty(tableIds.current)}
      <p>No tables.</p>
    {:else}
      {#each sortedTableIds as tableId (tableId)}
        <TableView {store} {storeId} {tableId} {s} />
      {/each}
    {/if}
  {/snippet}
</Details>
