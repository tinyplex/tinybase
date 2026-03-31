<script lang="ts">
  import {onLinkedRowIds} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase';

  let {
    relationships,
    relationshipId,
    firstRowId,
    listener,
  }: {
    relationships: Relationships;
    relationshipId: string;
    firstRowId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onLinkedRowIds(
    () => relationshipId,
    () => firstRowId,
    (...args) => listener(...args),
    () => relationships,
  );
</script>
