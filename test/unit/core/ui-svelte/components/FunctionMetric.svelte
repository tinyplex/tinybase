<script lang="ts">
  import {createMetric} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Metrics} from 'tinybase/metrics';

  let {metrics, metricId}: {metrics: Metrics; metricId: Id} = $props();
  const v = createMetric(
    () => metricId,
    () => metrics,
  );
</script>

{JSON.stringify(v.current)}
