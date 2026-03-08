<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useTableIds} from './hooks.svelte.ts';
  import TableView from './TableView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    store?: Store | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    table?: Snippet<[tableId: Id]>;
  };

  let {store, separator, debugIds, table}: Props = $props();
  const tableIds = useTableIds(() => store);
</script>

<ItemsView ids={tableIds.current} {separator} {debugIds} custom={table}>
  {#snippet children(tableId)}
    <TableView {tableId} {store} {debugIds} />
  {/snippet}
</ItemsView>
