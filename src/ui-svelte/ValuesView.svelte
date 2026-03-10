<script lang="ts">
  import type {ValuesViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useValueIds} from './hooks.svelte.ts';
  import ValueView from './ValueView.svelte';
  import ItemsView from './common/ItemsView.svelte';

  let {store, separator, debugIds, value}: ValuesViewProps = $props();
  const valueIds = useValueIds(() => store);
</script>

<ItemsView ids={valueIds.current} {separator} {debugIds} custom={value}>
  {#snippet children(valueId)}
    <ValueView {valueId} {store} {debugIds} />
  {/snippet}
</ItemsView>
