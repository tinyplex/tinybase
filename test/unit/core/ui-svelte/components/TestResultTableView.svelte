<script lang="ts">
  import {
    ResultTableView,
    ResultRowView,
    ResultCellView,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    cellPrefix = '',
  }: {
    queries?: Queries | Id;
    queryId: Id;
    cellPrefix?: string;
  } = $props();
</script>

{queryId}:<ResultTableView {queryId} {queries}>
  {#snippet row(rowId)}
    {rowId}:<ResultRowView {queryId} {rowId} {queries}>
      {#snippet cell(cellId)}
        {cellId}{cellPrefix}<ResultCellView
          {queryId}
          {rowId}
          {cellId}
          {queries}
        />
      {/snippet}
    </ResultRowView>
  {/snippet}
</ResultTableView>
