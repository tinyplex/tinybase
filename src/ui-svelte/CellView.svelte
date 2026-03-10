<script lang="ts">
  import type {CellViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useCell} from './hooks.svelte.ts';

  let {tableId, rowId, cellId, store, debugIds}: CellViewProps = $props();
  const cell = useCell(    () => tableId,    () => rowId,    () => cellId,    () => store,  );
  const display = $derived('' + (cell.current ?? ''));
  const output = $derived(debugIds ? `${cellId}:{${display}}` : display);
</script>

{output}
