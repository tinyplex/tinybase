<script lang="ts">
  import {usePersisterStatus} from 'tinybase/ui-svelte';
  import type {AnyPersister} from 'tinybase/persisters';

  let {persister}: {persister: AnyPersister} = $props();
  const status = usePersisterStatus(() => persister);
</script>

{status.current}
