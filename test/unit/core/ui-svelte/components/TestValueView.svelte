<script lang="ts">
  import {ValueView} from 'tinybase/ui-svelte';
  import type {Id, Store} from 'tinybase';

  let {
    valueId,
    store,
    valuePrefix = '',
  }: {
    valueId: Id;
    store?: Store | Id;
    valuePrefix?: string;
  } = $props();
</script>

{valueId}{valuePrefix}<ValueView {valueId} {store} />
