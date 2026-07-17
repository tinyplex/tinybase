<script lang="ts">
  import {getContext} from 'svelte';

  const delThing = getContext<unknown[]>('tinybase_uisc')[17] as
    ((offset: number, id: string, owner: object) => void) | undefined;

  delThing?.(0, 'missing', {});
</script>
