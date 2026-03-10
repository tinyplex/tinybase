<script lang="ts">
  import {getContext} from 'svelte';
  import type {SliceViewProps} from '../@types/ui-svelte/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import {isString} from '../common/other.ts';
  import {objGet} from '../common/obj.ts';
  import type {ContextValue} from './context.ts';
  import {TINYBASE_CONTEXT_KEY} from './context.ts';
  import {useSliceRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {indexId, sliceId, indexes, separator, debugIds, row}: SliceViewProps =
    $props();

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
