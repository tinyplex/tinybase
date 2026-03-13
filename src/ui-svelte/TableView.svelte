<script lang="ts">
  import type {TableViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    tableId,
    store,
    customCellIds,
    separator,
    debugIds,
    row,
  }: TableViewProps = $props();

  const rowIds = useRowIds(
    () => tableId,
    () => store,
  );
</script>

<Wrap ids={rowIds.current} {separator} {debugIds} id={tableId} custom={row}>
  {#snippet children(rowId)}
    <RowView {tableId} {rowId} {store} {customCellIds} {debugIds} />
  {/snippet}
</Wrap>
