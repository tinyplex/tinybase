<script lang="ts">
  import {onRemoteRowId} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase';

  let {
    relationships,
    relationshipId,
    localRowId,
    listener,
  }: {
    relationships: Relationships;
    relationshipId: string;
    localRowId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onRemoteRowId(
    () => relationshipId,
    () => localRowId,
    (...args) => listener(...args),
    () => relationships,
  );
</script>
