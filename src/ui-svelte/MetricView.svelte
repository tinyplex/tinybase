<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import type {Metrics} from '../@types/metrics/index.d.ts';
  import {useMetric} from './hooks.svelte.ts';

  type Props = {
    metricId: Id;
    metrics?: Metrics | Id;
    debugIds?: boolean;
  };

  let {metricId, metrics, debugIds}: Props = $props();
  const metric = useMetric(
    () => metricId,
    () => metrics,
  );
  const display = $derived('' + (metric.current ?? ''));
  const output = $derived(debugIds ? `${metricId}:{${display}}` : display);
</script>

{output}
