<script lang="ts">
  import {LocalRowsView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Relationships} from 'tinybase/relationships';

  let {
    relationships,
    relationshipId,
    remoteRowId,
    cellPrefix = '',
  }: {
    relationships?: Relationships | Id;
    relationshipId: Id;
    remoteRowId: Id;
    cellPrefix?: string;
  } = $props();

  const _tableId = $derived(
    relationships instanceof Object
      ? (relationships as Relationships).getLocalTableId(relationshipId)
      : undefined,
  );
  const _store = $derived(
    relationships instanceof Object
      ? (relationships as Relationships).getStore()
      : undefined,
  );
</script>

{remoteRowId}:<LocalRowsView {relationshipId} {remoteRowId} {relationships}>
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
</LocalRowsView>
