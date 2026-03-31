<script lang="ts">
  import {onLocalRowIds} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase';

  let {
    relationships,
    relationshipId,
    remoteRowId,
    listener,
  }: {
    relationships: Relationships;
    relationshipId: string;
    remoteRowId: string;
    listener: (...args: any[]) => void;
  } = $props();
  onLocalRowIds(
    () => relationshipId,
    () => remoteRowId,
    (...args) => listener(...args),
    () => relationships,
  );
</script>
