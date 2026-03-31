<script lang="ts">
  import {createMetricsIds} from 'tinybase/ui-svelte';

  const ids = createMetricsIds();
</script>

{JSON.stringify(ids.current)}
