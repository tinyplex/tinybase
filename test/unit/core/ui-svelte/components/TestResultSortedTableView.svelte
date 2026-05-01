<script lang="ts">
  import {
    ResultSortedTableView,
    ResultRowView,
    ResultCellView,
  } from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    cellId,
    descending = true,
    cellPrefix = '',
  }: {
    queries?: Queries | Id;
    queryId: Id;
    cellId?: Id;
    descending?: boolean;
    cellPrefix?: string;
  } = $props();
</script>

{queryId},{cellId}:<ResultSortedTableView
  {queryId}
  {cellId}
  {descending}
  {queries}
>
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
</ResultSortedTableView>
