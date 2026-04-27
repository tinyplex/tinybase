<script lang="ts">
  import type {MetricViewProps} from '../@types/ui-svelte/index.d.ts';
  import {getMetric} from './functions.svelte.ts';

  let {metricId, metrics, debugIds}: MetricViewProps = $props();
  const metric = getMetric(
    () => metricId,
    () => metrics,
  );
  const display = $derived('' + (metric.current ?? ''));
  const output = $derived(debugIds ? `${metricId}:{${display}}` : display);
</script>

{output}
