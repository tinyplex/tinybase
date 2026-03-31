<script lang="ts">
  import {getMetricIds} from 'tinybase/ui-svelte';
  import type {Metrics} from 'tinybase';

  let {metrics}: {metrics: Metrics} = $props();
  const v = getMetricIds(() => metrics);
</script>

{JSON.stringify(v.current)}
