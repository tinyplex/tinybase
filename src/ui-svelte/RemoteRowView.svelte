<script lang="ts">
  import type {RemoteRowViewProps} from '../@types/ui-svelte/index.d.ts';
  import {isUndefined} from '../common/other.ts';
  import {
    useRemoteRowId,
    useRelationshipsStoreTableIds,
  } from './hooks.svelte.ts';
  import RowView from './RowView.svelte';

  let {
    relationshipId,
    localRowId,
    relationships,
    debugIds,
    row,
  }: RemoteRowViewProps = $props();

  const {store, remoteTableId} = useRelationshipsStoreTableIds(
    () => relationships,
    () => relationshipId,
  );
  const remoteRowId = useRemoteRowId(
    () => relationshipId,
    () => localRowId,
    () => relationships,
  );
</script>

{#if debugIds}{localRowId}:{'{'}
{/if}{#if !isUndefined(remoteRowId.current)}{#if row}{@render row(
      remoteRowId.current,
    )}{:else if remoteTableId}<RowView
      tableId={remoteTableId}
      rowId={remoteRowId.current}
      {store}
      {debugIds}
    />{/if}{/if}{#if debugIds}{'}'}{/if}
