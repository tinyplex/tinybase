<script lang="ts">
  import type {Store} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import * as UiSvelte from 'tinybase/ui-svelte/with-schemas';
  import type {NoSchemas} from 'tinybase/with-schemas';
  import ContextNestedDifferentChild from './ContextNestedDifferentChild.svelte';

  const {Provider: Provider2} = UiSvelte as UiSvelte.WithSchemas<NoSchemas>;

  let {
    store1,
    store2,
  }: {
    store1: Store;
    store2: any;
  } = $props();
</script>

<Provider storesById={{a: store1}}>
  <Provider2 storesById={{b: store2 as any}}>
    <ContextNestedDifferentChild {store1} {store2} />
  </Provider2>
</Provider>
