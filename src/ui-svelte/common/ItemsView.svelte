<script lang="ts">
  import type {Id, Ids} from '../../@types/common/index.d.ts';
  import type {Snippet} from 'svelte';

  type Props = {
    ids: Ids;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    id?: Id;
    custom?: Snippet<[id: Id]>;
    children: Snippet<[id: Id]>;
  };

  const {ids, separator, debugIds, id, custom, children}: Props = $props();
</script>

{#if debugIds && id !== undefined}{id}:{'{'}
{/if}{#each ids as itemId, i}{#if i > 0 && separator}{@render separator()}{/if}{#if custom}{@render custom(
      itemId,
    )}{:else}{@render children(
      itemId,
    )}{/if}{/each}{#if debugIds && id !== undefined}{'}'}{/if}
