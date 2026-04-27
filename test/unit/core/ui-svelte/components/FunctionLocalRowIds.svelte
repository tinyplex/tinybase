<script lang="ts">
  import {getLocalRowIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Relationships} from 'tinybase/relationships';

  let {
    relationships,
    relationshipId,
    remoteRowId,
  }: {
    relationships: Relationships;
    relationshipId: Id;
    remoteRowId: Id;
  } = $props();
  const v = getLocalRowIds(
    () => relationshipId,
    () => remoteRowId,
    () => relationships,
  );
</script>

{JSON.stringify(v.current)}
