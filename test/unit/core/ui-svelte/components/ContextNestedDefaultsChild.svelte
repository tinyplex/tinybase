<script lang="ts">
  import {
    getStore,
    getMetrics,
    getIndexes,
    getRelationships,
    getQueries,
    getCheckpoints,
    getPersister,
    getSynchronizer,
  } from 'tinybase/ui-svelte';
</script>

{getStore() ? 's' : ''}{getMetrics() ? 'm' : ''}{getIndexes()
  ? 'i'
  : ''}{getRelationships() ? 'r' : ''}{getQueries() ? 'q' : ''}{getCheckpoints()
  ? 'c'
  : ''}{getPersister() ? 'p' : ''}{getSynchronizer() ? 'syn' : ''}
