<script lang="ts">
  import type {LocalRowsViewProps} from '../@types/ui-svelte/index.d.ts';
  import {
    createLocalRowIds,
    getRelationshipsStoreTableIds,
  } from './functions.svelte.ts';
  import RowView from './RowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    relationshipId,
    remoteRowId,
    relationships,
    separator,
    debugIds,
    row,
  }: LocalRowsViewProps = $props();

  const {store, localTableId} = getRelationshipsStoreTableIds(
    () => relationships,
    () => relationshipId,
  );
  const rowIds = createLocalRowIds(
    () => relationshipId,
    () => remoteRowId,
    () => relationships,
  );
</script>

<Wrap ids={rowIds.current} {separator} {debugIds} id={remoteRowId} custom={row}>
  {#snippet children(rowId)}
    {#if localTableId}<RowView
        tableId={localTableId}
        {rowId}
        {store}
        {debugIds}
      />{/if}
  {/snippet}
</Wrap>
