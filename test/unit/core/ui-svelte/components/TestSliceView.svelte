<script lang="ts">
  import {SliceView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Indexes} from 'tinybase/indexes';

  let {
    indexes,
    indexId,
    sliceId,
    cellPrefix = '',
  }: {
    indexes?: Indexes | Id;
    indexId: Id;
    sliceId: Id;
    cellPrefix?: string;
  } = $props();

  const _tableId = $derived(
    indexes instanceof Object
      ? (indexes as Indexes).getTableId(indexId)
      : undefined,
  );
  const _store = $derived(
    indexes instanceof Object ? (indexes as Indexes).getStore() : undefined,
  );
</script>

{sliceId}:<SliceView {indexId} {sliceId} {indexes}>
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
</SliceView>
