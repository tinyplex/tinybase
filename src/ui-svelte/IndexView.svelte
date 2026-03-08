<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Indexes} from '../@types/indexes/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useSliceIds} from './hooks.svelte.ts';
  import SliceView from './SliceView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    indexId: Id;
    indexes?: Indexes | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    slice?: Snippet<[sliceId: Id]>;
  };

  let {indexId, indexes, separator, debugIds, slice}: Props = $props();
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
