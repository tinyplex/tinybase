<script lang="ts">
  import type {ResultCellViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useResultCell} from './hooks.svelte.ts';

  let {queryId, rowId, cellId, queries, debugIds}: ResultCellViewProps =
    $props();
  const cell = useResultCell(
    () => queryId,
    () => rowId,
    () => cellId,
    () => queries,
  );
  const display = $derived('' + (cell.current ?? ''));
  const output = $derived(debugIds ? `${cellId}:{${display}}` : display);
</script>

{output}
