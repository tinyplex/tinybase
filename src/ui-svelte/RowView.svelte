<script lang="ts">
  import type {Id, Ids} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useCellIds} from './hooks.svelte.ts';
  import CellView from './CellView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    tableId: Id;
    rowId: Id;
    store?: Store | Id;
    customCellIds?: Ids;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    cell?: Snippet<[cellId: Id]>;
  };

  let {tableId, rowId, store, customCellIds, separator, debugIds, cell}: Props =
    $props();

  const defaultCellIds = useCellIds(
    () => tableId,
    () => rowId,
    () => store,
  );
  const activeCellIds = $derived(customCellIds ?? defaultCellIds.current);
</script>

<ItemsView ids={activeCellIds} {separator} {debugIds} id={rowId} custom={cell}>
  {#snippet children(cellId)}
    <CellView {tableId} {rowId} {cellId} {store} {debugIds} />
  {/snippet}
</ItemsView>
