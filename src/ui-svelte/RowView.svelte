<script lang="ts">
  import type {RowViewProps} from '../@types/ui-svelte/index.d.ts';
  import {createCellIds} from './functions.svelte.ts';
  import CellView from './CellView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    tableId,
    rowId,
    store,
    customCellIds,
    separator,
    debugIds,
    cell,
  }: RowViewProps = $props();

  const defaultCellIds = createCellIds(
    () => tableId,
    () => rowId,
    () => store,
  );
  const activeCellIds = $derived(customCellIds ?? defaultCellIds.current);
</script>

<Wrap ids={activeCellIds} {separator} {debugIds} id={rowId} custom={cell}>
  {#snippet children(cellId)}
    <CellView {tableId} {rowId} {cellId} {store} {debugIds} />
  {/snippet}
</Wrap>
