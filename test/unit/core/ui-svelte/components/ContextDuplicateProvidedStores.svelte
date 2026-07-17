<script lang="ts">
  import type {Store} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import ContextDuplicateProvidedStore from './ContextDuplicateProvidedStore.svelte';
  import ContextStoreChild from './ContextStoreChild.svelte';
  import ContextUnknownProviderCleanup from './ContextUnknownProviderCleanup.svelte';

  let {
    show1,
    show2,
    store1,
    store2,
    cleanupUnknown = false,
  }: {
    show1: boolean;
    show2: boolean;
    store1: Store;
    store2: Store;
    cleanupUnknown?: boolean;
  } = $props();
</script>

<Provider>
  {#if cleanupUnknown}<ContextUnknownProviderCleanup />{/if}
  {#if show1}<ContextDuplicateProvidedStore store={store1} />{/if}
  {#if show2}<ContextDuplicateProvidedStore store={store2} />{/if}
  <ContextStoreChild storeId="store1" mode="cell" />
</Provider>
