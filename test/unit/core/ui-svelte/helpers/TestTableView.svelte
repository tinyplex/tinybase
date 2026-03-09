<script lang="ts">
  import {TableView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Store} from 'tinybase';

  let {
    tableId,
    store,
    cellPrefix = '',
  }: {
    tableId: Id;
    store?: Store | Id;
    cellPrefix?: string;
  } = $props();
</script>

{tableId}:<TableView {tableId} {store}>
  {#snippet row(rowId)}
    {rowId}:<RowView {tableId} {rowId} {store}>
      {#snippet cell(cellId)}
        {cellId}{cellPrefix}<CellView {tableId} {rowId} {cellId} {store} />
      {/snippet}
    </RowView>
  {/snippet}
</TableView>
