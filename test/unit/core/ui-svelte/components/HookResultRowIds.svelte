<script lang="ts">
  import {createResultRowIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = createResultRowIds(
    () => queryId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
