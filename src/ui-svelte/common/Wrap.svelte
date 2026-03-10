<script lang="ts">
  import type {Id, Ids} from '../../@types/common/index.d.ts';
  import type {Snippet} from 'svelte';
  import {isUndefined} from '../../common/other.ts';

  type Props = {
    children: Snippet<[id: Id]>;
    ids: Ids;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    id?: Id;
    custom?: Snippet<[id: Id]>;
  };

  const {children, ids, separator, debugIds, id, custom}: Props = $props();
</script>

{#if debugIds && !isUndefined(id)}{id}:{'{'}
{/if}{#each ids as itemId, i (itemId)}{#if i > 0 && separator}{@render separator()}{/if}{#if custom}{@render custom(
      itemId,
    )}{:else}{@render children(
      itemId,
    )}{/if}{/each}{#if debugIds && !isUndefined(id)}{'}'}{/if}
