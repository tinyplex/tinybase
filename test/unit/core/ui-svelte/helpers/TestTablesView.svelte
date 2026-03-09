<script lang="ts">
  import {TablesView, TableView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';
  import type {Id} from 'tinybase';

  let {
    store,
    cellPrefix = '',
  }: {
    store?: Store | Id;
    cellPrefix?: string;
  } = $props();
</script>

<TablesView {store}>
  {#snippet table(tableId)}
    {tableId}:<TableView {tableId} {store}>
      {#snippet row(rowId)}
        {rowId}:<RowView {tableId} {rowId} {store}>
          {#snippet cell(cellId)}
            {cellId}{cellPrefix}<CellView {tableId} {rowId} {cellId} {store} />
          {/snippet}
        </RowView>
      {/snippet}
    </TableView>
  {/snippet}
</TablesView>
