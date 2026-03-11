<script lang="ts">
  import {MetricView} from 'tinybase/ui-svelte';
  import type {Id} from 'tinybase';
  import type {Metrics} from 'tinybase/metrics';

  let {
    metrics,
    metricId,
  }: {
    metrics?: Metrics | Id;
    metricId: Id;
  } = $props();
</script>

{metricId}:<MetricView {metrics} {metricId} />
