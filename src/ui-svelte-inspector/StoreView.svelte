<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {isUndefined} from '../common/other.ts';
  import {DEFAULT} from '../common/strings.ts';
  import {getStore} from '../ui-svelte/functions.svelte.ts';
  import Details from './Details.svelte';
  import TablesView from './TablesView.svelte';
  import ValuesView from './ValuesView.svelte';

  type Props = {storeId?: Id} & StoreProp;

  let {storeId, s}: Props = $props();
  const store = $derived(getStore(storeId));
  const title = $derived(
    (store?.isMergeable() ? 'Mergeable' : '') + 'Store: ' + (storeId ?? DEFAULT),
  );
</script>

{#if !isUndefined(store)}
  <Details uniqueId={getUniqueId('s', storeId)} {title} {s}>
    {#snippet children()}
      <ValuesView store={store} {storeId} {s} />
      <TablesView store={store} {storeId} {s} />
    {/snippet}
  </Details>
{/if}
