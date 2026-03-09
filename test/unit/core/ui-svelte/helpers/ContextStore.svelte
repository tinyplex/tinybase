<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';
  import type {Id} from 'tinybase';
  import ContextStoreChild from './ContextStoreChild.svelte';

  let {
    store,
    storesById,
    storeId,
    mode = 'tables',
  }: {
    store?: Store;
    storesById?: Record<Id, Store>;
    storeId?: Id;
    mode?: string;
  } = $props();
</script>

<Provider {store} {storesById}>
  <ContextStoreChild {storeId} {mode} />
</Provider>
