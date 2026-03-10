<script lang="ts">
  import {getContext} from 'svelte';
  import type {RemoteRowViewProps} from '../@types/ui-svelte/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import {isString, isUndefined} from '../common/other.ts';
  import {objGet} from '../common/obj.ts';
  import type {ContextValue} from './context.ts';
  import {TINYBASE_CONTEXT_KEY} from './context.ts';
  import {useRemoteRowId} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';

  let {
    relationshipId,
    localRowId,
    relationships,
    debugIds,
    row,
  }: RemoteRowViewProps = $props();

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
    _resolvedRelationships?.getRemoteTableId(relationshipId),
  );

  const remoteRowId = useRemoteRowId(
    () => relationshipId,
    () => localRowId,
    () => relationships,
  );
</script>

{#if debugIds}{localRowId}:{'{'}
{/if}{#if !isUndefined(remoteRowId.current)}{#if row}{@render row(
      remoteRowId.current,
    )}{:else if _tableId}<RowView
      tableId={_tableId}
      rowId={remoteRowId.current}
      store={_store}
      {debugIds}
    />{/if}{/if}{#if debugIds}{'}'}{/if}
