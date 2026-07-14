<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {getUniqueId, sortedIdsMap} from '../common/inspector/common.ts';
  import {TABLES} from '../common/strings.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {isEmpty} from '../common/other.ts';
  import {getTableIds} from '../ui-svelte/functions.svelte.ts';
  import TablesActions from './actions/TablesActions.svelte';
  import Details from './Details.svelte';
  import TableView from './TableView.svelte';
  import {getEditable} from './editable.ts';

  type Props = {store: Store; storeId?: Id} & StoreProp;

  let {store, storeId, s}: Props = $props();
  const uniqueId = $derived(getUniqueId('ts', storeId));
  const tableIds = getTableIds(() => store);
  const [editable, handleEditable] = getEditable(
    () => uniqueId,
    () => s,
  );
  const sortedTableIds = $derived(
    sortedIdsMap(tableIds.current, (tableId) => tableId),
  );
</script>

<Details
  {uniqueId}
  title={TABLES}
  editable={editable.current}
  {handleEditable}
  {s}
>
  {#if isEmpty(tableIds.current)}
    <p>No tables.</p>
  {:else}
    {#each sortedTableIds as tableId (tableId)}
      <TableView {store} {storeId} {tableId} {s} />
    {/each}
  {/if}
  {#if editable.current}
    <TablesActions {store} />
  {/if}
</Details>
