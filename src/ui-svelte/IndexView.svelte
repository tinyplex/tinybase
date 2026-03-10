<script lang="ts">
  import type {IndexViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useSliceIds} from './hooks.svelte.ts';
  import SliceView from './SliceView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {indexId, indexes, separator, debugIds, slice}: IndexViewProps = $props();
  const sliceIds = useSliceIds(
    () => indexId,
    () => indexes,
  );
</script>

<ItemsView
  ids={sliceIds.current}
  {separator}
  {debugIds}
  id={indexId}
  custom={slice}
>
  {#snippet children(sliceId)}
    <SliceView {indexId} {sliceId} {indexes} {debugIds} />
  {/snippet}
</ItemsView>
