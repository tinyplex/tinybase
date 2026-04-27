<script lang="ts">
  import {IndexView, SliceView, RowView, CellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Indexes} from 'tinybase/indexes';

  let {
    indexes,
    indexId,
    cellPrefix = '',
  }: {
    indexes?: Indexes | Id;
    indexId: Id;
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

{indexId}:<IndexView {indexId} {indexes}>
  {#snippet slice(sliceId)}
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
  {/snippet}
</IndexView>
