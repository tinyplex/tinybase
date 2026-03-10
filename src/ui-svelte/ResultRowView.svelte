<script lang="ts">
  import type {ResultRowViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useResultCellIds} from './hooks.svelte.ts';
  import ResultCellView from './ResultCellView.svelte';
  import Wrap from './common/Wrap.svelte';

  let {queryId, rowId, queries, separator, debugIds, cell}: ResultRowViewProps =
    $props();
  const cellIds = useResultCellIds(
    () => queryId,
    () => rowId,
    () => queries,
  );
</script>

<Wrap
  ids={cellIds.current}
  {separator}
  {debugIds}
  id={rowId}
  custom={cell}
>
  {#snippet children(cellId)}
    <ResultCellView {queryId} {rowId} {cellId} {queries} {debugIds} />
  {/snippet}
</Wrap>
