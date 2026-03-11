<script lang="ts">
  import {useMetricListener} from 'tinybase/ui-svelte';
  import type {Metrics} from 'tinybase';

  let {
    metrics,
    metricId,
    listener,
  }: {metrics: Metrics; metricId: string; listener: (...args: any[]) => void} =
    $props();
  useMetricListener(
    () => metricId,
    (...args) => listener(...args),
    () => metrics,
  );
</script>
