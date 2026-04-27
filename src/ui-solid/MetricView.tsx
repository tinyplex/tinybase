/* @jsxImportSource solid-js */
import type {
  MetricProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useMetric} from './hooks.ts';

export const MetricView = (props: MetricProps): any => {
  const metric = useMetric(
    (() => props.metricId) as any,
    (() => props.metrics) as any,
  ) as any;
  return () =>
    wrap(
      (getValue(metric) as any) ?? EMPTY_STRING,
      undefined,
      props.debugIds,
      props.metricId,
    );
};
