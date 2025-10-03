import type {
  MetricProps,
  MetricView as MetricViewDecl,
} from '../@types/ui-react/index.d.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useMetric} from './hooks.ts';

export const MetricView: typeof MetricViewDecl = ({
  metricId,
  metrics,
  debugIds,
}: MetricProps): any =>
  wrap(
    useMetric(metricId, metrics) ?? EMPTY_STRING,
    undefined,
    debugIds,
    metricId,
  );
