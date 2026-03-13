<script lang="ts">
  import {useResultTableCellIds} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = useResultTableCellIds(
    () => queryId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
