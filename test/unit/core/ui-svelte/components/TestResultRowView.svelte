<script lang="ts">
  import {ResultRowView, ResultCellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    rowId,
    cellPrefix = '',
  }: {
    queries?: Queries | Id;
    queryId: Id;
    rowId: Id;
    cellPrefix?: string;
  } = $props();
</script>

{rowId}:<ResultRowView {queryId} {rowId} {queries}>
  {#snippet cell(cellId)}
    {cellId}{cellPrefix}<ResultCellView {queryId} {rowId} {cellId} {queries} />
  {/snippet}
</ResultRowView>
