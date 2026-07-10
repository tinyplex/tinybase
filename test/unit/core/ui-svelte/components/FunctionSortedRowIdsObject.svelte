<script lang="ts">
  import {getSortedRowIds, onSortedRowIds} from 'tinybase/ui-svelte';
  import type {Store} from 'tinybase';

  let {
    store,
    listener,
  }: {
    store: Store;
    listener: (...args: any[]) => void;
  } = $props();
  const numericSorter = (sortKey1: any, sortKey2: any) =>
    Number(sortKey1) - Number(sortKey2);
  const args = {tableId: 't1', sorter: numericSorter};
  const rowIds = getSortedRowIds(args, () => store);
  const positionalRowIds = getSortedRowIds(
    't1',
    undefined,
    () => undefined,
    () => undefined,
    undefined,
    numericSorter,
    () => store,
  );
  onSortedRowIds(
    args,
    (...args) => listener(...args),
    false,
    () => store,
  );
</script>

{JSON.stringify([rowIds.current, positionalRowIds.current])}
