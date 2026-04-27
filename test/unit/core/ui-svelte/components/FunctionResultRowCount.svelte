<script lang="ts">
  import {getResultRowCount} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = getResultRowCount(
    () => queryId,
    () => queries,
  );
</script>

{v.current}
