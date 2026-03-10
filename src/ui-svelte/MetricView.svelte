<script lang="ts">
  import type {MetricViewProps} from '../@types/ui-svelte/index.d.ts';
  import {useMetric} from './hooks.svelte.ts';

  let {metricId, metrics, debugIds}: MetricViewProps = $props();
  const metric = useMetric(
    () => metricId,
    () => metrics,
  );
  const display = $derived('' + (metric.current ?? ''));
  const output = $derived(debugIds ? `${metricId}:{${display}}` : display);
</script>

{output}
