<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {useCell} from './hooks.svelte.ts';

  type Props = {
    tableId: Id;
    rowId: Id;
    cellId: Id;
    store?: Store | Id;
    debugIds?: boolean;
  };

  let {tableId, rowId, cellId, store, debugIds}: Props = $props();
  const cell = useCell(
    () => tableId,
    () => rowId,
    () => cellId,
    () => store,
  );
  const display = $derived('' + (cell.current ?? ''));
  const output = $derived(debugIds ? `${cellId}:{${display}}` : display);
</script>

{output}
