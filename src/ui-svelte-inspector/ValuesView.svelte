<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {arrayIsEmpty} from '../common/array.ts';
  import {VALUES} from '../common/strings.ts';
  import {getValueIds} from '../ui-svelte/functions.svelte.ts';
  import {ValuesInHtmlTable} from '../ui-svelte-dom/index.ts';
  import Details from './Details.svelte';

  type Props = {store: Store; storeId?: Id} & StoreProp;

  let {store, storeId, s}: Props = $props();
  const valueIds = getValueIds(() => store);
</script>

<Details uniqueId={getUniqueId('v', storeId)} title={VALUES} {s}>
  {#snippet children()}
    {#if arrayIsEmpty(valueIds.current)}
      <p>No values.</p>
    {:else}
      <ValuesInHtmlTable {store} />
    {/if}
  {/snippet}
</Details>
