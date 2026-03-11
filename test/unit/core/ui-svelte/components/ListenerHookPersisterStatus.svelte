<script lang="ts">
  import {usePersisterStatusListener} from 'tinybase/ui-svelte';
  import type {AnyPersister} from 'tinybase/persisters';

  let {
    persister,
    listener,
  }: {persister: AnyPersister; listener: (...args: any[]) => void} = $props();
  usePersisterStatusListener(
    (...args) => listener(...args),
    () => persister,
  );
</script>
