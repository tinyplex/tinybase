<script lang="ts">
  import {createSynchronizerIds} from 'tinybase/ui-svelte';

  const ids = createSynchronizerIds();
</script>

{JSON.stringify(ids.current)}
