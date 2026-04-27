<script lang="ts">
  import {getRelationshipsIds} from 'tinybase/ui-svelte';

  const ids = getRelationshipsIds();
</script>

{JSON.stringify(ids.current)}
