<script lang="ts">
  import type {Id} from '../@types/common/index.d.ts';
  import {DEFAULT} from '../common/strings.ts';
  import {getUniqueId} from '../common/inspector/common.ts';
  import type {StoreProp} from '../common/inspector/types.ts';
  import {arrayIsEmpty} from '../common/array.ts';
  import {isUndefined} from '../common/other.ts';
  import {getMetricIds, getMetrics} from '../ui-svelte/functions.svelte.ts';
  import MetricView from '../ui-svelte/MetricView.svelte';
  import Details from './Details.svelte';

  type Props = {metricsId?: Id} & StoreProp;

  let {metricsId, s}: Props = $props();
  const metrics = $derived(getMetrics(metricsId));
  const metricIds = getMetricIds(() => metrics);
  const title = $derived('Metrics: ' + (metricsId ?? DEFAULT));
</script>

{#if !isUndefined(metrics)}
  <Details uniqueId={getUniqueId('m', metricsId)} {title} {s}>
    {#snippet children()}
      {#if arrayIsEmpty(metricIds.current)}
        No metrics defined
      {:else}
        <table>
          <thead>
            <tr>
              <th>Metric Id</th>
              <th>Table Id</th>
              <th>Metric</th>
            </tr>
          </thead>
          <tbody>
            {#each metricIds.current as metricId (metricId)}
              <tr>
                <th title={metricId}>{metricId}</th>
                <td>{metrics?.getTableId(metricId)}</td>
                <td><MetricView {metricId} {metrics} /></td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {/snippet}
  </Details>
{/if}
