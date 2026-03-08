<script lang="ts">
  import {getContext} from 'svelte';
  import type {Id} from '../@types/common/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import type {Snippet} from 'svelte';
  import {isString} from '../common/other.ts';
  import {objGet} from '../common/obj.ts';
  import type {ContextValue} from './context.ts';
  import {TINYBASE_CONTEXT_KEY} from './context.ts';
  import {useLinkedRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    relationshipId: Id;
    firstRowId: Id;
    relationships?: Relationships | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    row?: Snippet<[rowId: Id]>;
  };

  let {
    relationshipId,
    firstRowId,
    relationships,
    separator,
    debugIds,
    row,
  }: Props = $props();

  // Capture context at init to resolve Relationships → store/tableId
  const _ctx: ContextValue = (getContext(TINYBASE_CONTEXT_KEY) ??
    []) as ContextValue;
  const _resolvedRels = $derived(
    (isString(relationships)
      ? objGet(_ctx[7] as any, relationships)
      : (relationships ?? _ctx[6])) as Relationships | undefined,
  );
  const _store = $derived(_resolvedRels?.getStore());
  const _tableId = $derived(_resolvedRels?.getLocalTableId(relationshipId));

  const rowIds = useLinkedRowIds(
    () => relationshipId,
    () => firstRowId,
    () => relationships,
  );
</script>

<ItemsView
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={firstRowId}
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
