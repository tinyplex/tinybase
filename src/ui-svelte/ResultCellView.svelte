<script lang="ts">
  import type {ResultCellViewProps} from '../@types/ui-svelte/index.d.ts';
  import {getResultCell} from './functions.svelte.ts';

  let {queryId, rowId, cellId, queries, debugIds}: ResultCellViewProps =
    $props();
  const cell = getResultCell(
    () => queryId,
    () => rowId,
    () => cellId,
    () => queries,
  );
  const display = $derived('' + (cell.current ?? ''));
  const output = $derived(debugIds ? `${cellId}:{${display}}` : display);
</script>

{output}
