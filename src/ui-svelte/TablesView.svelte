<script lang="ts">
  import type {TablesViewProps} from '../@types/ui-svelte/index.d.ts';
  import {createTableIds} from './hooks.svelte.ts';
  import TableView from './TableView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {store, separator, debugIds, table}: TablesViewProps = $props();
  const tableIds = createTableIds(() => store);
</script>

<Wrap ids={tableIds.current} {separator} {debugIds} custom={table}>
  {#snippet children(tableId)}
    <TableView {tableId} {store} {debugIds} />
  {/snippet}
</Wrap>
