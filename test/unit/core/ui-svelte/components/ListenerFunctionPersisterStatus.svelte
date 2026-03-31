<script lang="ts">
  import {onPersisterStatus} from 'tinybase/ui-svelte';
  import type {AnyPersister} from 'tinybase/persisters';

  let {
    persister,
    listener,
  }: {persister: AnyPersister; listener: (...args: any[]) => void} = $props();
  onPersisterStatus(
    (...args) => listener(...args),
    () => persister,
  );
</script>
