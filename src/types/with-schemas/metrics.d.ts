/// metrics

import {CellIdFromSchema, GetCellAlias, TableIdFromSchema} from './internal';
import {Id, IdOrNull, Ids} from './common.d';
import {NoSchemas, OptionalSchemas, Store} from './store.d';

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
export interface Metrics<Schemas extends OptionalSchemas = NoSchemas> {
  /// Metrics.setMetricDefinition
  setMetricDefinition<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
    GetCell = GetCellAlias<Schemas[0], TableId>,
  >(
    metricId: Id,
    tableId: TableId,
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | MetricAggregate,
    getNumber?: CellId | ((getCell: GetCell, rowId: Id) => number),
    aggregateAdd?: MetricAggregateAdd,
    aggregateRemove?: MetricAggregateRemove,
    aggregateReplace?: MetricAggregateReplace,
  ): Metrics<Schemas>;

  /// Metrics.delMetricDefinition
  delMetricDefinition(metricId: Id): Metrics<Schemas>;

  /// Metrics.getStore
  getStore(): Store<Schemas>;

  /// Metrics.getMetricIds
  getMetricIds(): Ids;

  /// Metrics.forEachMetric
  forEachMetric(metricCallback: MetricCallback): void;

  /// Metrics.hasMetric
  hasMetric(metricId: Id): boolean;

  /// Metrics.getTableId
  getTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    metricId: Id,
  ): TableId | undefined;

  /// Metrics.getMetric
  getMetric(metricId: Id): Metric | undefined;

  /// Metrics.addMetricListener
  addMetricListener(metricId: IdOrNull, listener: MetricListener): Id;

  /// Metrics.delListener
  delListener(listenerId: Id): Metrics<Schemas>;

  /// Metrics.destroy
  destroy(): void;

  /// Metrics.getListenerStats
  getListenerStats(): MetricsListenerStats;
}

/// createMetrics
export function createMetrics<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Metrics<Schemas>;
