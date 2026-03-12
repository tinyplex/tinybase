<script lang="ts">
  import {
    useStore,
    useMetrics,
    useIndexes,
    useRelationships,
    useQueries,
    useCheckpoints,
    usePersister,
    useSynchronizer,
  } from 'tinybase/ui-svelte';
</script>

{useStore() ? 's' : ''}{useMetrics() ? 'm' : ''}{useIndexes()
  ? 'i'
  : ''}{useRelationships() ? 'r' : ''}{useQueries() ? 'q' : ''}{useCheckpoints()
  ? 'c'
  : ''}{usePersister() ? 'p' : ''}{useSynchronizer() ? 'syn' : ''}
