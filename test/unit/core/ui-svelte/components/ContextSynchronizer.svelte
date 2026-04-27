<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Synchronizer} from 'tinybase/synchronizers';
  import type {Id} from 'tinybase';
  import ContextSynchronizerChild from './ContextSynchronizerChild.svelte';

  let {
    synchronizer,
    synchronizersById,
    synchronizerId,
  }: {
    synchronizer?: Synchronizer;
    synchronizersById?: Record<Id, Synchronizer>;
    synchronizerId?: Id;
  } = $props();
</script>

<Provider {synchronizer} {synchronizersById}>
  <ContextSynchronizerChild {synchronizerId} />
</Provider>
