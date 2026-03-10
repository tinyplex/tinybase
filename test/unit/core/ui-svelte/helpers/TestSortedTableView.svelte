<script lang="ts">
  import {SortedTableView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {
    tableId,
    cellId,
    descending = true,
    store,
    cellPrefix = '',
  }: {
    tableId: Id;
    cellId?: Id;
    descending?: boolean;
    store?: Store | Id;
    cellPrefix?: string;
  } = $props();
</script>

{tableId},{cellId}:<SortedTableView {tableId} {cellId} {descending} {store}>
  {#snippet row(rowId)}
    {rowId}:<RowView {tableId} {rowId} {store}>
      {#snippet cell(cellId)}
        {cellId}{cellPrefix}<CellView {tableId} {rowId} {cellId} {store} />
      {/snippet}
    </RowView>
  {/snippet}
</SortedTableView>
