<script lang="ts">
  import {useResultRowCount} from 'tinybase/ui-svelte';
  import type {Queries} from 'tinybase';
  import type {Id} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = useResultRowCount(
    () => queryId,
    () => queries,
  );
</script>

{v.current}
