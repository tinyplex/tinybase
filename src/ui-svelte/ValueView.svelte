<script lang="ts">
  import type {ValueViewProps} from '../@types/ui-svelte/index.d.ts';
  import {createValue} from './hooks.svelte.ts';

  let {valueId, store, debugIds}: ValueViewProps = $props();
  const value = createValue(
    () => valueId,
    () => store,
  );
  const display = $derived('' + (value.current ?? ''));
  const output = $derived(debugIds ? `${valueId}:{${display}}` : display);
</script>

{output}
