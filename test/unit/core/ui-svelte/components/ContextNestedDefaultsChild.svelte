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

{getStore() ? 'Store ' : ''}{getMetrics() ? 'Metrics ' : ''}{getIndexes()
  ? 'Indexes '
  : ''}{getRelationships() ? 'Relationships ' : ''}{getQueries()
  ? 'Queries '
  : ''}{getCheckpoints() ? 'Checkpoints ' : ''}{getPersister()
  ? 'Persister '
  : ''}{getSynchronizer() ? 'Synchronizer' : ''}
