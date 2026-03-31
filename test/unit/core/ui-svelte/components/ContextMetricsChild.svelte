<script lang="ts">
  import {MetricView, getMetric} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';

  let {metricsId}: {metricsId?: Id} = $props();

  const metric = getMetric(
    () => 'm1',
    () => metricsId,
  );
</script>

<MetricView metrics={metricsId} metricId="m1" />{metric.current}
