<script lang="ts">
  import type {ResultTableViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useResultRowIds} from './hooks.svelte.ts';
  import ResultRowView from './ResultRowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {queryId, queries, separator, debugIds, row}: ResultTableViewProps =
    $props();
  const rowIds = useResultRowIds(
    () => queryId,
    () => queries,
  );
</script>

<ItemsView
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={queryId}
  custom={row}
>
  {#snippet children(rowId)}
    <ResultRowView {queryId} {rowId} {queries} {debugIds} />
  {/snippet}
</ItemsView>
