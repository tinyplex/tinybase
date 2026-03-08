<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Queries} from '../@types/queries/index.d.ts';
  import {useResultCell} from './hooks.svelte.ts';

  type Props = {
    queryId: Id;
    rowId: Id;
    cellId: Id;
    queries?: Queries | Id;
    debugIds?: boolean;
  };

  let {queryId, rowId, cellId, queries, debugIds}: Props = $props();
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
