<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import {DEFAULT} from '../common/strings.ts';
  import {getUniqueId, sortedIdsMap} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {arrayIsEmpty} from '../common/array.ts';
  import {isUndefined} from '../common/other.ts';
  import {getQueries, getQueryIds} from '../ui-svelte/functions.svelte.ts';
  import Details from './Details.svelte';
  import QueryView from './QueryView.svelte';

  type Props = {queriesId?: Id} & StoreProp;

  let {queriesId, s}: Props = $props();
  const queries = $derived(getQueries(queriesId));
  const queryIds = getQueryIds(() => queries);
  const sortedQueryIds = $derived(
    sortedIdsMap(queryIds.current, (queryId) => queryId),
  );
  const title = $derived('Queries: ' + (queriesId ?? DEFAULT));
</script>

{#if !isUndefined(queries)}
  <Details uniqueId={getUniqueId('q', queriesId)} {title} {s}>
    {#if arrayIsEmpty(queryIds.current)}
      No queries defined
    {:else}
      {#each sortedQueryIds as queryId (queryId)}
        <QueryView {queries} {queriesId} {queryId} {s} />
      {/each}
    {/if}
  </Details>
{/if}
