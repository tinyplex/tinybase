<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase/relationships';
  import type {Id} from 'tinybase';
  import ContextRelationshipsChild from './ContextRelationshipsChild.svelte';

  let {
    relationships,
    relationshipsById,
    relationshipsId,
  }: {
    relationships?: Relationships;
    relationshipsById?: Record<Id, Relationships>;
    relationshipsId?: Id;
  } = $props();
</script>

<Provider {relationships} {relationshipsById}>
  <ContextRelationshipsChild {relationshipsId} />
</Provider>
