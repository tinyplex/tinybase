<script lang="ts">
  import {ResultCellView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Queries} from 'tinybase/queries';

  let {
    queries,
    queryId,
    rowId,
    cellId,
    cellPrefix = '',
  }: {
    queries?: Queries | Id;
    queryId: Id;
    rowId: Id;
    cellId: Id;
    cellPrefix?: string;
  } = $props();
</script>

{cellId}{cellPrefix}<ResultCellView {queryId} {rowId} {cellId} {queries} />
