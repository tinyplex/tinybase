<script lang="ts">
  import {useRelationshipIds} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase';

  let {relationships}: {relationships: Relationships} = $props();
  const v = useRelationshipIds(() => relationships);
</script>

{JSON.stringify(v.current)}
