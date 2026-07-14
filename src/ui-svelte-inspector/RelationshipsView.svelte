<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import {DEFAULT} from '../common/strings.ts';
  import {getUniqueId, sortedIdsMap} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {isEmpty, isUndefined} from '../common/other.ts';
  import {
    getRelationshipIds,
    getRelationships,
  } from '../ui-svelte/functions.svelte.ts';
  import Details from './Details.svelte';
  import RelationshipView from './RelationshipView.svelte';

  type Props = {relationshipsId?: Id} & StoreProp;

  let {relationshipsId, s}: Props = $props();
  const relationships = $derived(getRelationships(relationshipsId));
  const relationshipIds = getRelationshipIds(() => relationships);
  const sortedRelationshipIds = $derived(
    sortedIdsMap(relationshipIds.current, (relationshipId) => relationshipId),
  );
  const title = $derived('Relationships: ' + (relationshipsId ?? DEFAULT));
</script>

{#if !isUndefined(relationships)}
  <Details uniqueId={getUniqueId('r', relationshipsId)} {title} {s}>
    {#if isEmpty(relationshipIds.current)}
      No relationships defined
    {:else}
      {#each sortedRelationshipIds as relationshipId (relationshipId)}
        <RelationshipView
          {relationships}
          {relationshipsId}
          {relationshipId}
          {s}
        />
      {/each}
    {/if}
  </Details>
{/if}
