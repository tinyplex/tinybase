<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Queries} from '../@types/queries/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useResultCellIds} from './hooks.svelte.ts';
  import ResultCellView from './ResultCellView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    queryId: Id;
    rowId: Id;
    queries?: Queries | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    cell?: Snippet<[cellId: Id]>;
  };

  let {queryId, rowId, queries, separator, debugIds, cell}: Props = $props();
  const cellIds = useResultCellIds(
    () => queryId,
    () => rowId,
    () => queries,
  );
</script>

<ItemsView
  ids={cellIds.current}
  {separator}
  {debugIds}
  id={rowId}
  custom={cell}
>
  {#snippet children(cellId)}
    <ResultCellView {queryId} {rowId} {cellId} {queries} {debugIds} />
  {/snippet}
</ItemsView>
