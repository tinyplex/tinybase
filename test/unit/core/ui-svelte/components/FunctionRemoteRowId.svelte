<script lang="ts">
  import {getRemoteRowId} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Relationships} from 'tinybase/relationships';

  let {
    relationships,
    relationshipId,
    localRowId,
  }: {
    relationships: Relationships;
    relationshipId: Id;
    localRowId: Id;
  } = $props();
  const v = getRemoteRowId(
    () => relationshipId,
    () => localRowId,
    () => relationships,
  );
</script>

{JSON.stringify(v.current)}
