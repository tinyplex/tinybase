<script lang="ts">
  import {createPersisterStatus} from 'tinybase/ui-svelte';
  import type {AnyPersister} from 'tinybase/persisters';

  let {persister}: {persister: AnyPersister} = $props();
  const status = createPersisterStatus(() => persister);
</script>

{status.current}
