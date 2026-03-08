<script lang="ts">
  import {getContext} from 'svelte';
  import type {Id} from '../@types/common/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import type {Snippet} from 'svelte';
  import {isString} from '../common/other.ts';
  import {objGet} from '../common/obj.ts';
  import type {ContextValue} from './context.ts';
  import {TINYBASE_CONTEXT_KEY} from './context.ts';
  import {useSliceRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    indexId: Id;
    sliceId: Id;
    indexes?: Indexes | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    row?: Snippet<[rowId: Id]>;
  };

  let {indexId, sliceId, indexes, separator, debugIds, row}: Props = $props();

  // Capture context at init to resolve Indexes → store/tableId
  const _ctx: ContextValue = (getContext(TINYBASE_CONTEXT_KEY) ??
    []) as ContextValue;
  const _resolvedIndexes = $derived(
    (isString(indexes)
      ? objGet(_ctx[5] as any, indexes)
      : (indexes ?? _ctx[4])) as Indexes | undefined,
  );
  const _store = $derived(_resolvedIndexes?.getStore());
  const _tableId = $derived(_resolvedIndexes?.getTableId(indexId));

  const rowIds = useSliceRowIds(
    () => indexId,
    () => sliceId,
    () => indexes,
  );
</script>

<ItemsView
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={sliceId}
  custom={row}
>
  {#snippet children(rowId)}
    {#if _tableId}<RowView
        tableId={_tableId}
        {rowId}
        store={_store}
        {debugIds}
      />{/if}
  {/snippet}
</ItemsView>
