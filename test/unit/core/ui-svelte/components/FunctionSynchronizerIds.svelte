<script lang="ts">
  import {getSynchronizerIds} from 'tinybase/ui-svelte';

  const ids = getSynchronizerIds();
</script>

{JSON.stringify(ids.current)}
