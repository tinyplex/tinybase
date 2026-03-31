<script lang="ts">
  import {createRelationshipsIds} from 'tinybase/ui-svelte';

  const ids = createRelationshipsIds();
</script>

{JSON.stringify(ids.current)}
