<script lang="ts">
  import {useSynchronizerIds} from 'tinybase/ui-svelte';

  const ids = useSynchronizerIds();
</script>

{JSON.stringify(ids.current)}
