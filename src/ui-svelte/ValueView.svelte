<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Store} from '../@types/store/index.d.ts';
  import {useValue} from './hooks.svelte.ts';

  type Props = {
    valueId: Id;
    store?: Store | Id;
    debugIds?: boolean;
  };

  let {valueId, store, debugIds}: Props = $props();
  const value = useValue(
    () => valueId,
    () => store,
  );
  const display = $derived('' + (value.current ?? ''));
  const output = $derived(debugIds ? `${valueId}:{${display}}` : display);
</script>

{output}
