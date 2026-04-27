<script lang="ts">
  import {getPersisterStatus} from 'tinybase/ui-svelte';
  import type {AnyPersister} from 'tinybase/persisters';

  let {persister}: {persister: AnyPersister} = $props();
  const status = getPersisterStatus(() => persister);
</script>

{status.current}
