<script lang="ts">
  import {useResultRowIds} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = useResultRowIds(
    () => queryId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
