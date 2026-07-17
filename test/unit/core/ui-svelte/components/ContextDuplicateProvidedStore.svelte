<script lang="ts">
  import {untrack} from 'svelte';
  import type {Store} from 'tinybase';
  import {provideStore} from 'tinybase/ui-svelte';

  let {store}: {store: Store} = $props();

  provideStore('store1', untrack(() => store));
</script>
