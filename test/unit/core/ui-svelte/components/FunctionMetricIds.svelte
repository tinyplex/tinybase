<script lang="ts">
  import {createMetricIds} from 'tinybase/ui-svelte';
  import type {Metrics} from 'tinybase';

  let {metrics}: {metrics: Metrics} = $props();
  const v = createMetricIds(() => metrics);
</script>

{JSON.stringify(v.current)}
