<script lang="ts">
  import {useLinkedRowIds} from 'tinybase/ui-svelte';
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
  const v = useLinkedRowIds(
    () => relationshipId,
    () => firstRowId,
    () => relationships,
  );
</script>

{JSON.stringify(v.current)}
