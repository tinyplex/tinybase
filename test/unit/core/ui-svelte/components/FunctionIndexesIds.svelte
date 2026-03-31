<script lang="ts">
  import {createIndexesIds} from 'tinybase/ui-svelte';

  const ids = createIndexesIds();
</script>

{JSON.stringify(ids.current)}
