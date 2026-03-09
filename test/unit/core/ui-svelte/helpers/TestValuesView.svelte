<script lang="ts">
  import {ValuesView, ValueView} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';
  import type {Id} from 'tinybase';

  let {
    store,
    valuePrefix = '',
  }: {
    store?: Store | Id;
    valuePrefix?: string;
  } = $props();
</script>

<ValuesView {store}>
  {#snippet value(valueId)}
    {valueId}{valuePrefix}<ValueView {valueId} {store} />
  {/snippet}
</ValuesView>
