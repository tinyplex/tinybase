<script lang="ts">
  import {RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {
    tableId,
    rowId,
    store,
    cellPrefix = '',
  }: {
    tableId: Id;
    rowId: Id;
    store?: Store | Id;
    cellPrefix?: string;
  } = $props();
</script>

{rowId}:<RowView {tableId} {rowId} {store}>
  {#snippet cell(cellId)}
    {cellId}{cellPrefix}<CellView {tableId} {rowId} {cellId} {store} />
  {/snippet}
</RowView>
