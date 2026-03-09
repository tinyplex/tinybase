<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {AnyPersister} from 'tinybase/persisters';
  import type {Id} from 'tinybase';
  import ContextPersisterChild from './ContextPersisterChild.svelte';

  let {
    persister,
    persistersById,
    persisterId,
  }: {
    persister?: AnyPersister;
    persistersById?: Record<Id, AnyPersister>;
    persisterId?: Id;
  } = $props();
</script>

<Provider {persister} {persistersById}>
  <ContextPersisterChild {persisterId} />
</Provider>
