<script lang="ts">
  import {getPersisterIds} from 'tinybase/ui-svelte';

  const ids = getPersisterIds();
</script>

{JSON.stringify(ids.current)}
