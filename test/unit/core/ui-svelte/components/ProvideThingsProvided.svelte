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

{getStore('s1') ? 's' : ''}{getMetrics('m1') ? 'm' : ''}{getIndexes('i1')
  ? 'i'
  : ''}{getRelationships('r1') ? 'r' : ''}{getQueries('q1')
  ? 'q'
  : ''}{getCheckpoints('c1') ? 'c' : ''}{getPersister('p1')
  ? 'p'
  : ''}{getSynchronizer('syn1') ? 'z' : ''}
