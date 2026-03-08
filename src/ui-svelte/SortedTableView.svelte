<script lang="ts">
  import type {Id, Ids} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useSortedRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    tableId: Id;
    cellId?: Id;
    descending?: boolean;
    offset?: number;
    limit?: number;
    store?: Store | Id;
    customCellIds?: Ids;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    row?: Snippet<[rowId: Id]>;
  };

  let {
    tableId,
    cellId,
    descending,
    offset,
    limit,
    store,
    customCellIds,
    separator,
    debugIds,
    row,
  }: Props = $props();

  const rowIds = useSortedRowIds(
    () => tableId,
    () => cellId,
    () => descending ?? false,
    () => offset ?? 0,
    () => limit,
    () => store,
  );
</script>

<ItemsView
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={tableId}
  custom={row}
>
  {#snippet children(rowId)}
    <RowView {tableId} {rowId} {store} {customCellIds} {debugIds} />
  {/snippet}
</ItemsView>
