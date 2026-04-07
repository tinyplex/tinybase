<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {SliceInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';
  import {useEditable} from './editable.ts';

  type Props = {
    indexes: Indexes;
    indexesId?: Id;
    indexId: Id;
    sliceId: Id;
  } & StoreProp;

  let {indexes, indexesId, indexId, sliceId, s}: Props = $props();
  const uniqueId = $derived(getUniqueId('i', indexesId, indexId, sliceId));
  const title = $derived('Slice: ' + sliceId);
  const [editable, handleEditable] = useEditable(() => uniqueId, () => s);
</script>

<Details
  {uniqueId}
  {title}
  editable={editable.current}
  {handleEditable}
  {s}
>
  {#snippet children()}
    <SliceInHtmlTable
      {indexId}
      {sliceId}
      {indexes}
      editable={editable.current}
    />
  {/snippet}
</Details>
