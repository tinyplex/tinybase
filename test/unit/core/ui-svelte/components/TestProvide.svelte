<script lang="ts">
  import {Provider, provideStore} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {store}: {store: Store} = $props();
</script>

<Provider>
  <Inner {store} />
</Provider>

{#snippet Inner({store}: {store: Store})}
  {provideStore('s1', store) ?? 'provided'}
{/snippet}
