<script lang="ts">
  import {usePersisterIds} from 'tinybase/ui-svelte';

  const ids = usePersisterIds();
</script>

{JSON.stringify(ids.current)}
