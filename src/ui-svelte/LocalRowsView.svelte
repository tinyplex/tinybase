<script lang="ts">
  import {getContext} from 'svelte';
  import type {LocalRowsViewProps} from '../@types/ui-svelte/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import {isString} from '../common/other.ts';
  import {objGet} from '../common/obj.ts';
  import type {ContextValue} from './context.ts';
  import {TINYBASE_CONTEXT_KEY} from './context.ts';
  import {useLocalRowIds} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {
    relationshipId,
    remoteRowId,
    relationships,
    separator,
    debugIds,
    row,
  }: LocalRowsViewProps = $props();

  // Capture context at init to resolve Relationships → store/tableId
  const _ctx: ContextValue = (getContext(TINYBASE_CONTEXT_KEY) ??
    []) as ContextValue;
  const _resolvedRelationships = $derived(
    (isString(relationships)
      ? objGet(_ctx[7] as any, relationships)
      : (relationships ?? _ctx[6])) as Relationships | undefined,
  );
  const _store = $derived(_resolvedRelationships?.getStore());
  const _tableId = $derived(
    _resolvedRelationships?.getLocalTableId(relationshipId),
  );

  const rowIds = useLocalRowIds(
    () => relationshipId,
    () => remoteRowId,
    () => relationships,
  );
</script>

<ItemsView
  ids={rowIds.current}
  {separator}
  {debugIds}
  id={remoteRowId}
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
