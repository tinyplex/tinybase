<script lang="ts">
  import {useResultRowCount} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = useResultRowCount(
    () => queryId,
    () => queries,
  );
</script>

{v.current}
