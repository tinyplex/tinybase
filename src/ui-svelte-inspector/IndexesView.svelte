<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import {DEFAULT} from '../common/strings.ts';
  import {getUniqueId, sortedIdsMap} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {arrayIsEmpty} from '../common/array.ts';
  import {isUndefined} from '../common/other.ts';
  import {getIndexIds, getIndexes} from '../ui-svelte/functions.svelte.ts';
  import Details from './Details.svelte';
  import IndexView from './IndexView.svelte';

  type Props = {indexesId?: Id} & StoreProp;

  let {indexesId, s}: Props = $props();
  const indexes = $derived(getIndexes(indexesId));
  const indexIds = getIndexIds(() => indexes);
  const sortedIndexIds = $derived(sortedIdsMap(indexIds.current, (indexId) => indexId));
  const title = $derived('Indexes: ' + (indexesId ?? DEFAULT));
</script>

{#if !isUndefined(indexes)}
  <Details uniqueId={getUniqueId('i', indexesId)} {title} {s}>
    {#snippet children()}
      {#if arrayIsEmpty(indexIds.current)}
        No indexes defined
      {:else}
        {#each sortedIndexIds as indexId (indexId)}
          <IndexView {indexes} {indexesId} {indexId} {s} />
        {/each}
      {/if}
    {/snippet}
  </Details>
{/if}
