<script lang="ts">
  import type {TablesViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useTableIds} from './hooks.svelte.ts';
  import TableView from './TableView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {store, separator, debugIds, table}: TablesViewProps = $props();
  const tableIds = useTableIds(() => store);
</script>

<ItemsView ids={tableIds.current} {separator} {debugIds} custom={table}>
  {#snippet children(tableId)}
    <TableView {tableId} {store} {debugIds} />
  {/snippet}
</ItemsView>
