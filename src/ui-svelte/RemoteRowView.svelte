<script lang="ts">
  import {getContext} from 'svelte';
  import type {Id} from '../@types/common/index.d.ts';
  import type {Relationships} from '../@types/relationships/index.d.ts';
  import type {Snippet} from 'svelte';
  import {isString} from '../common/other.ts';
  import {objGet} from '../common/obj.ts';
  import type {ContextValue} from './context.ts';
  import {TINYBASE_CONTEXT_KEY} from './context.ts';
  import {useRemoteRowId} from './hooks.svelte.ts';
  import RowView from './RowView.svelte';

  type Props = {
    relationshipId: Id;
    localRowId: Id;
    relationships?: Relationships | Id;
    debugIds?: boolean;
    row?: Snippet<[rowId: Id]>;
  };

  let {relationshipId, localRowId, relationships, debugIds, row}: Props =
    $props();

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
{/if}{#if remoteRowId.current !== undefined}{#if row}{@render row(
      remoteRowId.current,
    )}{:else if _tableId}<RowView
      tableId={_tableId}
      rowId={remoteRowId.current}
      store={_store}
      {debugIds}
    />{/if}{/if}{#if debugIds}{'}'}{/if}
