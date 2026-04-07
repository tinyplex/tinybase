<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {getSliceIds} from '../ui-svelte/functions.svelte.ts';
  import Details from './Details.svelte';
  import SliceView from './SliceView.svelte';

  type Props = {indexes: Indexes; indexesId?: Id; indexId: Id} & StoreProp;

  let {indexes, indexesId, indexId, s}: Props = $props();
  const sliceIds = getSliceIds(
    () => indexId,
    () => indexes,
  );
  const title = $derived('Index: ' + indexId);
</script>

<Details uniqueId={getUniqueId('i', indexesId, indexId)} {title} {s}>
  {#snippet children()}
    {#each sliceIds.current as sliceId (sliceId)}
      <SliceView {indexes} {indexesId} {indexId} {sliceId} {s} />
    {/each}
  {/snippet}
</Details>
