<script lang="ts">
  import {
    TablesView,
    TableView,
    RowView,
    CellView,
    createTables,
    createTable,
    createRow,
    createCell,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {
    storeId,
    mode,
  }: {
    storeId?: Id;
    mode: string;
  } = $props();

  const tables = createTables(() => storeId);
  const table = createTable(
    () => 't1',
    () => storeId,
  );
  const row = createRow(
    () => 't1',
    () => 'r1',
    () => storeId,
  );
  const cell = createCell(
    () => 't1',
    () => 'r1',
    () => 'c1',
    () => storeId,
  );
</script>

{#if mode === 'tables'}
  <span><TablesView store={storeId} /></span><span
    >{JSON.stringify(tables.current)}</span
  >
{:else if mode === 'table'}
  <span><TableView tableId="t1" store={storeId} /></span><span
    >{JSON.stringify(table.current)}</span
  >
{:else if mode === 'row'}
  <span><RowView tableId="t1" rowId="r1" store={storeId} /></span><span
    >{JSON.stringify(row.current)}</span
  >
{:else if mode === 'cell'}
  <span><CellView tableId="t1" rowId="r1" cellId="c1" store={storeId} /></span
  ><span>{JSON.stringify(cell.current)}</span>
{/if}
