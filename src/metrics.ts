import {
  DEBUG,
  getUndefined,
  isFiniteNumber,
  isFunction,
  isUndefined,
} from './common/other';
import {EMPTY_STRING, SUM} from './common/strings';
import {GetCell, Store} from './types/store.d';
import {Id, IdOrNull} from './types/common.d';
import {IdMap, mapGet, mapNew} from './common/map';
import {
  MetricAggregate,
  MetricAggregateAdd,
  MetricAggregateRemove,
  MetricAggregateReplace,
  MetricListener,
  Metrics,
  MetricsListenerStats,
  createMetrics as createMetricsDecl,
} from './types/metrics.d';
import {collSize, collSize2} from './common/coll';
import {getAggregateValue, numericAggregators} from './common/aggregators';
import {
  getCreateFunction,
  getDefinableFunctions,
  getRowCellFunction,
} from './common/definable';
import {IdSet2} from './common/set';
import {getListenerFunctions} from './common/listeners';
import {objFreeze} from './common/obj';

type Aggregators = [
  MetricAggregate,
  MetricAggregateAdd?,
  MetricAggregateRemove?,
  MetricAggregateReplace?,
];

export const createMetrics = getCreateFunction((store: Store): Metrics => {
  const metricListeners: IdSet2 = mapNew();
  const [
    getStore,
    getMetricIds,
    forEachMetric,
    hasMetric,
    getTableId,
    getMetric,
    setMetric,
    ,
    setDefinitionAndListen,
    delDefinition,
    destroy,
  ] = getDefinableFunctions<number | undefined, number | undefined>(
    store,
    getUndefined,
    (value: any): number | undefined =>
      isNaN(value) ||
      isUndefined(value) ||
      value === true ||
      value === false ||
      value === EMPTY_STRING
        ? undefined
        : (value as any) * 1,
  );
  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => metrics,
  );

  const setMetricDefinition = (
    metricId: Id,
    tableId: Id,
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | MetricAggregate,
    getNumber?: Id | ((getCell: GetCell, rowId: Id) => number),
    aggregateAdd?: MetricAggregateAdd,
    aggregateRemove?: MetricAggregateRemove,
    aggregateReplace?: MetricAggregateReplace,
  ): Metrics => {
    const aggregators: Aggregators = isFunction(aggregate)
      ? [aggregate, aggregateAdd, aggregateRemove, aggregateReplace]
      : mapGet(numericAggregators, aggregate as Id) ??
        (mapGet(numericAggregators, SUM) as Aggregators);

    setDefinitionAndListen(
      metricId,
      tableId,
      (
        change: () => void,
        changedNumbers: IdMap<[number | undefined, number | undefined]>,
        _changedSortKeys: any,
        numbers: IdMap<number | undefined>,
        _sortKeys?: any,
        force?: boolean,
      ) => {
        const oldMetric = getMetric(metricId);
        const oldLength = collSize(numbers);
        force ||= isUndefined(oldMetric);

        change();

        let newMetric = getAggregateValue(
          oldMetric,
          oldLength,
          numbers,
          changedNumbers,
          aggregators,
          force,
        );

        if (!isFiniteNumber(newMetric)) {
          newMetric = undefined;
        }

        if (newMetric != oldMetric) {
          setMetric(metricId, newMetric);
          callListeners(metricListeners, [metricId], newMetric, oldMetric);
        }
      },
      getRowCellFunction(getNumber, 1),
    );
    return metrics;
  };

  const delMetricDefinition = (metricId: Id): Metrics => {
    delDefinition(metricId);
    return metrics;
  };

  const addMetricListener = (
    metricId: IdOrNull,
    listener: MetricListener,
  ): Id => addListener(listener, metricListeners, [metricId]);

  const delListener = (listenerId: Id): Metrics => {
    delListenerImpl(listenerId);
    return metrics;
  };

  const getListenerStats = (): MetricsListenerStats =>
    DEBUG ? {metric: collSize2(metricListeners)} : {};

  const metrics: any = {
    setMetricDefinition,
    delMetricDefinition,

    getStore,
    getMetricIds,
    forEachMetric,
    hasMetric,
    getTableId,
    getMetric,

    addMetricListener,
    delListener,

    destroy,
    getListenerStats,
  };

  return objFreeze(metrics as Metrics);
}) as typeof createMetricsDecl;
