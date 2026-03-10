<script lang="ts">
  import type {ValueViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useValue} from './hooks.svelte.ts';

  let {valueId, store, debugIds}: ValueViewProps = $props();
  const value = useValue(
    () => valueId,
    () => store,
  );
  const display = $derived('' + (value.current ?? ''));
  const output = $derived(debugIds ? `${valueId}:{${display}}` : display);
</script>

{output}
