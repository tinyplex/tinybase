<script lang="ts">
  import {Provider} from 'tinybase/ui-svelte';
  import type {Metrics} from 'tinybase/metrics';
  import type {Id} from 'tinybase';
  import ContextMetricsChild from './ContextMetricsChild.svelte';

  let {
    metrics,
    metricsById,
    metricsId,
  }: {
    metrics?: Metrics;
    metricsById?: Record<Id, Metrics>;
    metricsId?: Id;
  } = $props();
</script>

<Provider {metrics} {metricsById}>
  <ContextMetricsChild {metricsId} />
</Provider>
