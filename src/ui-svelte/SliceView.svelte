<script lang="ts">
  import type {SliceViewProps} from '../@types/ui-svelte/index.d.ts';
  import {isUndefined} from '../common/other.ts';
  import {getIndexStoreTableId, getSliceRowIds} from './functions.svelte.ts';
  import RowView from './RowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {indexId, sliceId, indexes, separator, debugIds, row}: SliceViewProps =
    $props();

  const {store, tableId} = getIndexStoreTableId(
    () => indexes,
    () => indexId,
  );
  const rowIds = getSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
</script>

<Wrap ids={rowIds.current} {separator} {debugIds} id={sliceId} custom={row}>
  {#snippet children(rowId)}
    {#if !isUndefined(tableId)}
      <RowView {tableId} {rowId} {store} {debugIds} />
    {/if}
  {/snippet}
</Wrap>
