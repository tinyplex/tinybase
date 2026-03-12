<script lang="ts">
  import {useCheckpointsIds} from 'tinybase/ui-svelte';

  const ids = useCheckpointsIds();
</script>

{JSON.stringify(ids.current)}
