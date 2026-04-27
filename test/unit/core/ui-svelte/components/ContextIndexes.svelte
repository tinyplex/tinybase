<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Indexes} from 'tinybase/indexes';
  import type {Id} from 'tinybase';
  import ContextIndexesChild from './ContextIndexesChild.svelte';

  let {
    indexes,
    indexesById,
    indexesId,
  }: {
    indexes?: Indexes;
    indexesById?: Record<Id, Indexes>;
    indexesId?: Id;
  } = $props();
</script>

<Provider {indexes} {indexesById}>
  <ContextIndexesChild {indexesId} />
</Provider>
