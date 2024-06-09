/// metrics

import type {GetCell, Store} from '../store/index.d.ts';
import type {Id, IdOrNull, Ids} from '../common/index.d.ts';

/// Metric
export type Metric = number;

/// MetricCallback
export type MetricCallback = (metricId: Id, metric?: Metric) => void;

/// MetricAggregate
export type MetricAggregate = (numbers: number[], length: number) => Metric;

/// MetricAggregateAdd
export type MetricAggregateAdd = (
  metric: Metric,
  add: number,
  length: number,
) => Metric | undefined;

/// MetricAggregateRemove
export type MetricAggregateRemove = (
  metric: Metric,
  remove: number,
  length: number,
) => Metric | undefined;

/// MetricAggregateReplace
export type MetricAggregateReplace = (
  metric: Metric,
  add: number,
  remove: number,
  length: number,
) => Metric | undefined;

/// MetricIdsListener
export type MetricIdsListener = (metrics: Metrics) => void;

/// MetricListener
export type MetricListener = (
  metrics: Metrics,
  metricId: Id,
  newMetric: Metric | undefined,
  oldMetric: Metric | undefined,
) => void;

/// MetricsListenerStats
export type MetricsListenerStats = {
  /// MetricsListenerStats.metric
  metric?: number;
};

/// Metrics
export interface Metrics {
  //
  /// Metrics.setMetricDefinition
  setMetricDefinition(
    metricId: Id,
    tableId: Id,
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | MetricAggregate,
    getNumber?: Id | ((getCell: GetCell, rowId: Id) => number),
    aggregateAdd?: MetricAggregateAdd,
    aggregateRemove?: MetricAggregateRemove,
    aggregateReplace?: MetricAggregateReplace,
  ): Metrics;

  /// Metrics.delMetricDefinition
  delMetricDefinition(metricId: Id): Metrics;

  /// Metrics.getStore
  getStore(): Store;

  /// Metrics.getMetricIds
  getMetricIds(): Ids;

  /// Metrics.forEachMetric
  forEachMetric(metricCallback: MetricCallback): void;

  /// Metrics.hasMetric
  hasMetric(metricId: Id): boolean;

  /// Metrics.getTableId
  getTableId(metricId: Id): Id | undefined;

  /// Metrics.getMetric
  getMetric(metricId: Id): Metric | undefined;

  /// Metrics.addMetricIdsListener
  addMetricIdsListener(listener: MetricIdsListener): Id;

  /// Metrics.addMetricListener
  addMetricListener(metricId: IdOrNull, listener: MetricListener): Id;

  /// Metrics.delListener
  delListener(listenerId: Id): Metrics;

  /// Metrics.destroy
  destroy(): void;

  /// Metrics.getListenerStats
  getListenerStats(): MetricsListenerStats;
  //
}

/// createMetrics
export function createMetrics(store: Store): Metrics;
