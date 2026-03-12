<script lang="ts">
  import {useRelationshipsIds} from 'tinybase/ui-svelte';

  const ids = useRelationshipsIds();
</script>

{JSON.stringify(ids.current)}
