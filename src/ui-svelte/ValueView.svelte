<script lang="ts">
  import type {ValueViewProps} from '../@types/ui-svelte/index.d.ts';
  import {getValue} from './functions.svelte.ts';

  let {valueId, store, debugIds}: ValueViewProps = $props();
  const value = getValue(
    () => valueId,
    () => store,
  );
  const display = $derived('' + (value.current ?? ''));
  const output = $derived(debugIds ? `${valueId}:{${display}}` : display);
</script>

{output}
