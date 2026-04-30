/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {MetricProps} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useMetric} from './primitives.ts';

export const MetricView = (props: MetricProps): JSXElement => {
  const metric = useMetric(
    () => props.metricId,
    () => props.metrics,
  );
  // eslint-disable-next-line solid/reactivity
  return (() =>
    wrap(
      getValue(metric) ?? EMPTY_STRING,
      undefined,
      props.debugIds,
      props.metricId,
    )) as unknown as JSXElement;
};
