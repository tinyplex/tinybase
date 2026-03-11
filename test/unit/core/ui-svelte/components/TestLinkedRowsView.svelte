<script lang="ts">
  import {LinkedRowsView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Relationships} from 'tinybase/relationships';

  let {
    relationships,
    relationshipId,
    firstRowId,
    cellPrefix = '',
  }: {
    relationships?: Relationships | Id;
    relationshipId: Id;
    firstRowId: Id;
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

{firstRowId}:<LinkedRowsView {relationshipId} {firstRowId} {relationships}>
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
</LinkedRowsView>
