<script lang="ts">
  import {getIndexesIds} from 'tinybase/ui-svelte';

  const ids = getIndexesIds();
</script>

{JSON.stringify(ids.current)}
