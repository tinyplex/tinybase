<script lang="ts">
  import type {Id, Ids} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    tableId: Id;
    store?: Store | Id;
    customCellIds?: Ids;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    row?: Snippet<[rowId: Id]>;
  };

  let {tableId, store, customCellIds, separator, debugIds, row}: Props =
    $props();

  const rowIds = useRowIds(
    () => tableId,
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
