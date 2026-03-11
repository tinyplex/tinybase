<script lang="ts">
  import {useRemoteRowIdListener} from 'tinybase/ui-svelte';
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
  useRemoteRowIdListener(
    () => relationshipId,
    () => localRowId,
    (...args) => listener(...args),
    () => relationships,
  );
</script>
