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

{getStore('s1') ? 'Store ' : ''}{getMetrics('m1') ? 'Metrics ' : ''}{getIndexes(
  'i1',
)
  ? 'Indexes '
  : ''}{getRelationships('r1') ? 'Relationships ' : ''}{getQueries('q1')
  ? 'Queries '
  : ''}{getCheckpoints('c1') ? 'Checkpoints ' : ''}{getPersister('p1')
  ? 'Persister '
  : ''}{getSynchronizer('syn1') ? 'Synchronizer' : ''}
