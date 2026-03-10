import type {
  MetricProps,
  MetricView as MetricViewDecl,
} from '../@types/ui-react/index.d.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {Wrap} from './common/Wrap.tsx';
import {useMetric} from './hooks.ts';

export const MetricView: typeof MetricViewDecl = ({
  metricId,
  metrics,
  debugIds,
}: MetricProps): any => (
  <Wrap debugIds={debugIds} id={metricId}>
    {useMetric(metricId, metrics) ?? EMPTY_STRING}
  </Wrap>
);
