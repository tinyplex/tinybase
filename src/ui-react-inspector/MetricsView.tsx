/** @jsx createElement */

import {arrayIsEmpty, arrayMap} from '../common/array.ts';
import {useMetric, useMetricIds, useMetrics} from '../ui-react/index.ts';
import {DEFAULT} from '../common/strings.ts';
import {Details} from './Details.tsx';
import type {Id} from '../@types/common/index.d.ts';
import type {MetricProps} from '../@types/ui-react/index.d.ts';
import type {Metrics} from '../@types/metrics/index.d.ts';
import type {StoreProp} from './types.ts';
import {createElement} from '../common/react.ts';
import {getUniqueId} from './common.ts';
import {isUndefined} from '../common/other.ts';

const MetricRow = ({metrics, metricId}: MetricProps) => (
  <tr>
    <th>{metricId}</th>
    <td>{(metrics as Metrics)?.getTableId(metricId)}</td>
    <td>{useMetric(metricId, metrics)}</td>
  </tr>
);

export const MetricsView = ({
  metricsId,
  s,
}: {readonly metricsId?: Id} & StoreProp) => {
  const metrics = useMetrics(metricsId);
  const metricIds = useMetricIds(metrics);
  return isUndefined(metrics) ? null : (
    <Details
      uniqueId={getUniqueId('m', metricsId)}
      summary={'Metrics: ' + (metricsId ?? DEFAULT)}
      s={s}
    >
      {arrayIsEmpty(metricIds) ? (
        'No metrics defined'
      ) : (
        <table>
          <thead>
            <th>Metric Id</th>
            <th>Table Id</th>
            <th>Metric</th>
          </thead>
          <tbody>
            {arrayMap(metricIds, (metricId) => (
              <MetricRow metrics={metrics} metricId={metricId} key={metricId} />
            ))}
          </tbody>
        </table>
      )}
    </Details>
  );
};
