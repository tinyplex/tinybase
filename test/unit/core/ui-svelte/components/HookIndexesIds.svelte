<script lang="ts">
  import {useIndexesIds} from 'tinybase/ui-svelte';

  const ids = useIndexesIds();
</script>

{JSON.stringify(ids.current)}
