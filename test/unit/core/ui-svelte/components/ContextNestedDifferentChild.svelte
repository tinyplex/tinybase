<script lang="ts">
  import type {Store} from 'tinybase';
  import {getStore, getStoreIds} from 'tinybase/ui-svelte';
  import * as UiSvelte from 'tinybase/ui-svelte/with-schemas';
  import type {NoSchemas} from 'tinybase/with-schemas';

  const {getStore: getStore2} = UiSvelte as UiSvelte.WithSchemas<NoSchemas>;

  let {store1, store2}: {store1: Store; store2: any} = $props();

  const storeIds = getStoreIds();
  const storeA = getStore('a');
  const storeA2 = getStore2('a');
  const storeB = getStore('b');
  const storeB2 = getStore2('b');
</script>

{JSON.stringify(storeIds.current)}{storeA === store1 ? 1 : 0}{storeA2 === store2
  ? 1
  : 0}{storeB === store1 ? 1 : 0}{storeB2 === store2 ? 1 : 0}
