<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import type {Snippet} from 'svelte';
  import {useValueIds} from './hooks.svelte.ts';
  import ValueView from './ValueView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  type Props = {
    store?: Store | Id;
    separator?: Snippet<[]>;
    debugIds?: boolean;
    value?: Snippet<[valueId: Id]>;
  };

  let {store, separator, debugIds, value}: Props = $props();
  const valueIds = useValueIds(() => store);
</script>

<ItemsView ids={valueIds.current} {separator} {debugIds} custom={value}>
  {#snippet children(valueId)}
    <ValueView {valueId} {store} {debugIds} />
  {/snippet}
</ItemsView>
