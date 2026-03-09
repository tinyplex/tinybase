<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';
  import ContextNestedChild from './ContextNestedChild.svelte';

  let {
    store1,
    store2,
    outerStores,
    innerStores,
  }: {
    store1: Store;
    store2: Store;
    outerStores: Record<string, Store>;
    innerStores: Record<string, Store>;
  } = $props();
</script>

<Provider storesById={outerStores}>
  <Provider storesById={innerStores}>
    <ContextNestedChild {store1} {store2} />
  </Provider>
</Provider>
