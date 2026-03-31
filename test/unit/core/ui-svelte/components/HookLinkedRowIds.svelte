<script lang="ts">
  import {createLinkedRowIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Relationships} from 'tinybase/relationships';

  let {
    relationships,
    relationshipId,
    firstRowId,
  }: {
    relationships: Relationships;
    relationshipId: Id;
    firstRowId: Id;
  } = $props();
  const v = createLinkedRowIds(
    () => relationshipId,
    () => firstRowId,
    () => relationships,
  );
</script>

{JSON.stringify(v.current)}
