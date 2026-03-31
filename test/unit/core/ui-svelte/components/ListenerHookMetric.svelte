<script lang="ts">
  import {onMetric} from 'tinybase/ui-svelte';
  import type {Metrics} from 'tinybase';

  let {
    metrics,
    metricId,
    listener,
  }: {metrics: Metrics; metricId: string; listener: (...args: any[]) => void} =
    $props();
  onMetric(
    () => metricId,
    (...args) => listener(...args),
    () => metrics,
  );
</script>
