<script lang="ts">
  import type {MetricViewProps} from '../@types/ui-svelte/index.d.ts';
  import {createMetric} from './hooks.svelte.ts';

  let {metricId, metrics, debugIds}: MetricViewProps = $props();
  const metric = createMetric(
    () => metricId,
    () => metrics,
  );
  const display = $derived('' + (metric.current ?? ''));
  const output = $derived(debugIds ? `${metricId}:{${display}}` : display);
</script>

{output}
