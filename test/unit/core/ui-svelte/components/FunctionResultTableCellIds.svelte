<script lang="ts">
  import {getResultTableCellIds} from 'tinybase/ui-svelte';
  import type {Id, Queries} from 'tinybase';

  let {queries, queryId}: {queries: Queries; queryId: Id} = $props();
  const v = getResultTableCellIds(
    () => queryId,
    () => queries,
  );
</script>

{JSON.stringify(v.current)}
