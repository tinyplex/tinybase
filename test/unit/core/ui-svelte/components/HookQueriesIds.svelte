<script lang="ts">
  import {createQueriesIds} from 'tinybase/ui-svelte';

  const ids = createQueriesIds();
</script>

{JSON.stringify(ids.current)}
