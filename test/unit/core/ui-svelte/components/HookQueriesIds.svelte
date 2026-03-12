<script lang="ts">
  import {useQueriesIds} from 'tinybase/ui-svelte';

  const ids = useQueriesIds();
</script>

{JSON.stringify(ids.current)}
