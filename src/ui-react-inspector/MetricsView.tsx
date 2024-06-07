/** @jsx createElement */

import {arrayIsEmpty, arrayMap} from '../common/array';
import {useMetric, useMetricIds, useMetrics} from '../ui-react';
import {DEFAULT} from '../common/strings';
import {Details} from './Details';
import type {Id} from '../@types/common';
import type {MetricProps} from '../@types/ui-react';
import type {Metrics} from '../@types/metrics';
import type {StoreProp} from './types';
import {createElement} from '../common/react';
import {getUniqueId} from './common';
import {isUndefined} from '../common/other';

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
