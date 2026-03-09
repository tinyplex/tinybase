<script lang="ts">
  import {useRemoteRowId} from 'tinybase/ui-svelte';
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
  const v = useRemoteRowId(
    () => relationshipId,
    () => localRowId,
    () => relationships,
  );
</script>

{JSON.stringify(v.current)}
