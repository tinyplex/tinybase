<script lang="ts">
  import {useMetricIds} from 'tinybase/ui-svelte';
  import type {Metrics} from 'tinybase';

  let {metrics}: {metrics: Metrics} = $props();
  const v = useMetricIds(() => metrics);
</script>

{JSON.stringify(v.current)}
