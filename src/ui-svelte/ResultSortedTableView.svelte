<script lang="ts">
  import type {ResultSortedTableViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useResultSortedRowIds} from './hooks.svelte.ts';
  import ResultRowView from './ResultRowView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {
    queryId,
    cellId,
    descending,
    offset,
    limit,
    queries,
    separator,
    debugIds,
    row,
  }: ResultSortedTableViewProps = $props();

  const rowIds = useResultSortedRowIds(
    () => queryId,
    () => cellId,
    () => descending ?? false,
    () => offset ?? 0,
    () => limit,
    () => queries,
  );
</script>

<Wrap
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={queryId}
  custom={row}
>
  {#snippet children(rowId)}
    <ResultRowView {queryId} {rowId} {queries} {debugIds} />
  {/snippet}
</Wrap>
