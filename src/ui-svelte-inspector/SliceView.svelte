<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {SliceInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';

  type Props = {
    indexes: Indexes;
    indexesId?: Id;
    indexId: Id;
    sliceId: Id;
  } & StoreProp;

  let {indexes, indexesId, indexId, sliceId, s}: Props = $props();
  const title = $derived('Slice: ' + sliceId);
</script>

<Details uniqueId={getUniqueId('i', indexesId, indexId, sliceId)} {title} {s}>
  {#snippet children()}
    <SliceInHtmlTable {indexId} {sliceId} {indexes} />
  {/snippet}
</Details>
