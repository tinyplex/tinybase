<script lang="ts">
  import {useMetricsIds} from 'tinybase/ui-svelte';

  const ids = useMetricsIds();
</script>

{JSON.stringify(ids.current)}
