<script lang="ts">
  import {useLocalRowIdsListener} from 'tinybase/ui-svelte';
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
  useLocalRowIdsListener(
    () => relationshipId,
    () => remoteRowId,
    (...args) => listener(...args),
    () => relationships,
  );
</script>
