<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Queries} from '../@types/queries/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useResultRowIds} from './hooks.svelte.ts';
  import ResultRowView from './ResultRowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    queryId: Id;
    queries?: Queries | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    row?: Snippet<[rowId: Id]>;
  };

  let {queryId, queries, separator, debugIds, row}: Props = $props();
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
