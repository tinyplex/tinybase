<script lang="ts">
  import {CellView} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {
    tableId,
    rowId,
    cellId,
    store,
    cellPrefix = '',
  }: {
    tableId: Id;
    rowId: Id;
    cellId: Id;
    store?: Store | Id;
    cellPrefix?: string;
  } = $props();
</script>

{cellId}{cellPrefix}<CellView {tableId} {rowId} {cellId} {store} />
