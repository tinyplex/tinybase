<script lang="ts">
  import {createRelationshipIds} from 'tinybase/ui-svelte';
  import type {Relationships} from 'tinybase';

  let {relationships}: {relationships: Relationships} = $props();
  const v = createRelationshipIds(() => relationships);
</script>

{JSON.stringify(v.current)}
