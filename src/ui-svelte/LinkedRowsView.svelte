<script lang="ts">
  import type {LinkedRowsViewProps} from '../@types/ui-svelte/index.d.ts';
  import {
    useLinkedRowIds,
    useRelationshipsStoreTableIds,
  } from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    relationshipId,
    firstRowId,
    relationships,
    separator,
    debugIds,
    row,
  }: LinkedRowsViewProps = $props();

  const {store, localTableId} = useRelationshipsStoreTableIds(
    () => relationships,
    () => relationshipId,
  );
  const rowIds = useLinkedRowIds(
    () => relationshipId,
    () => firstRowId,
    () => relationships,
  );
</script>

<Wrap ids={rowIds.current} {separator} {debugIds} id={firstRowId} custom={row}>
  {#snippet children(rowId)}
    {#if localTableId}<RowView
        tableId={localTableId}
        {rowId}
        {store}
        {debugIds}
      />{/if}
  {/snippet}
</Wrap>
