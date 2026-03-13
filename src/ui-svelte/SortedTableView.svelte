<script lang="ts">
  import type {SortedTableViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useSortedRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    tableId,
    cellId,
    descending,
    offset,
    limit,
    store,
    customCellIds,
    separator,
    debugIds,
    row,
  }: SortedTableViewProps = $props();

  const rowIds = useSortedRowIds(
    () => tableId,
    () => cellId,
    () => descending ?? false,
    () => offset ?? 0,
    () => limit,
    () => store,
  );
</script>

<Wrap ids={rowIds.current} {separator} {debugIds} id={tableId} custom={row}>
  {#snippet children(rowId)}
    <RowView {tableId} {rowId} {store} {customCellIds} {debugIds} />
  {/snippet}
</Wrap>
