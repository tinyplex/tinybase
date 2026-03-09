<script lang="ts">
  import {RemoteRowView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Relationships} from 'tinybase/relationships';

  let {
    relationships,
    relationshipId,
    localRowId,
    cellPrefix = '',
  }: {
    relationships?: Relationships | Id;
    relationshipId: Id;
    localRowId: Id;
    cellPrefix?: string;
  } = $props();

  const _tableId = $derived(
    relationships instanceof Object
      ? (relationships as Relationships).getRemoteTableId(relationshipId)
      : undefined,
  );
  const _store = $derived(
    relationships instanceof Object
      ? (relationships as Relationships).getStore()
      : undefined,
  );
</script>

{localRowId}:<RemoteRowView {relationshipId} {localRowId} {relationships}>
  {#snippet row(rowId)}
    {rowId}:{#if _tableId && _store}<RowView
        tableId={_tableId}
        {rowId}
        store={_store}
      >
        {#snippet cell(cellId)}
          {cellId}{cellPrefix}<CellView
            tableId={_tableId}
            {rowId}
            {cellId}
            store={_store}
          />
        {/snippet}
      </RowView>{/if}
  {/snippet}
</RemoteRowView>
