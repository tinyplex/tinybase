<script lang="ts">
  import type {Store} from 'tinybase';
  import {Provider} from 'tinybase/ui-svelte';
  import {Inspector} from 'tinybase/ui-svelte-inspector';

  let {store}: {readonly store: Store} = $props();
</script>

<Provider {store}>
  {#snippet children()}
    <Inspector open={true} />
  {/snippet}
</Provider>
