<script lang="ts">
  import type {SliceViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useIndexStoreTableId, useSliceRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {indexId, sliceId, indexes, separator, debugIds, row}: SliceViewProps =
    $props();

  const {store, tableId} = useIndexStoreTableId(
    () => indexes,
    () => indexId,
  );
  const rowIds = useSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
</script>

<Wrap ids={rowIds.current} {separator} {debugIds} id={sliceId} custom={row}>
  {#snippet children(rowId)}
    {#if tableId}<RowView {tableId} {rowId} {store} {debugIds} />{/if}
  {/snippet}
</Wrap>
