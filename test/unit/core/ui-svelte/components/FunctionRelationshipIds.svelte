<script lang="ts">
  import {getRelationshipIds} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase';

  let {relationships}: {relationships: Relationships} = $props();
  const v = getRelationshipIds(() => relationships);
</script>

{JSON.stringify(v.current)}
