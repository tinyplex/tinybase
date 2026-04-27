<script lang="ts">
  import {getQueriesIds} from 'tinybase/ui-svelte';

  const ids = getQueriesIds();
</script>

{JSON.stringify(ids.current)}
