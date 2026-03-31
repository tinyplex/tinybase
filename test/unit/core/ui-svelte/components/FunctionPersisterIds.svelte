<script lang="ts">
  import {createPersisterIds} from 'tinybase/ui-svelte';

  const ids = createPersisterIds();
</script>

{JSON.stringify(ids.current)}
