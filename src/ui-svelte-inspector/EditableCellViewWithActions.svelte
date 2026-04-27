<script lang="ts">
  import type {CellViewProps} from '../@types/ui-svelte/index.d.ts';
  import {hasCell} from '../ui-svelte/functions.svelte.ts';
  import {EditableCellView} from '../ui-svelte-dom/index.ts';
  import CellActions from './actions/CellActions.svelte';

  let {tableId, rowId, cellId, store}: CellViewProps = $props();

  const cellExists = hasCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
</script>

<EditableCellView {tableId} {rowId} {cellId} {store} />
{#if cellExists.current}
  <CellActions {tableId} {rowId} {cellId} {store} />
{/if}
