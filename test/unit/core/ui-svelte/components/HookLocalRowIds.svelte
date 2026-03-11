<script lang="ts">
  import {useLocalRowIds} from 'tinybase/ui-svelte';
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
  const v = useLocalRowIds(
    () => relationshipId,
    () => remoteRowId,
    () => relationships,
  );
</script>

{JSON.stringify(v.current)}
