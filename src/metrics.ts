import {AVG, EMPTY_STRING, MAX, MIN, SUM} from './common/strings';
import {
  Aggregate,
  AggregateAdd,
  AggregateRemove,
  AggregateReplace,
  MetricListener,
  Metrics,
  MetricsListenerStats,
  createMetrics as createMetricsDecl,
} from './metrics.d';
import {
  DEBUG,
  getUndefined,
  isFiniteNumber,
  isFunction,
  isUndefined,
  mathMax,
  mathMin,
} from './common/other';
import {GetCell, Store} from './store.d';
import {Id, IdOrNull} from './common.d';
import {IdMap, mapGet, mapNew} from './common/map';
import {
  collForEach,
  collIsEmpty,
  collSize,
  collSize2,
  collValues,
} from './common/coll';
import {
  getCreateFunction,
  getDefinableFunctions,
  getRowCellFunction,
} from './common/definable';
import {IdSet2} from './common/set';
import {arraySum} from './common/array';
import {getListenerFunctions} from './common/listeners';
import {objFreeze} from './common/obj';

type Aggregators = [
  Aggregate,
  AggregateAdd?,
  AggregateRemove?,
  AggregateReplace?,
];

const aggregators: IdMap<Aggregators> = mapNew([
  [
    AVG,
    [
      (numbers: number[], length: number): number => arraySum(numbers) / length,
      (metric: number, add: number, length: number): number =>
        metric + (add - metric) / (length + 1),
      (metric: number, remove: number, length: number): number =>
        metric + (metric - remove) / (length - 1),
      (metric: number, add: number, remove: number, length: number): number =>
        metric + (add - remove) / length,
    ],
  ],
  [
    MAX,
    [
      (numbers: number[]): number => mathMax(...numbers),
      (metric: number, add: number): number => mathMax(add, metric),
      (metric: number, remove: number): number | undefined =>
        remove == metric ? undefined : metric,
      (metric: number, add: number, remove: number): number | undefined =>
        remove == metric ? undefined : mathMax(add, metric),
    ],
  ],
  [
    MIN,
    [
      (numbers: number[]): number => mathMin(...numbers),
      (metric: number, add: number): number => mathMin(add, metric),
      (metric: number, remove: number): number | undefined =>
        remove == metric ? undefined : metric,
      (metric: number, add: number, remove: number): number | undefined =>
        remove == metric ? undefined : mathMin(add, metric),
    ],
  ],
  [
    SUM,
    [
      (numbers: number[]): number => arraySum(numbers),
      (metric: number, add: number): number => metric + add,
      (metric: number, remove: number): number => metric - remove,
      (metric: number, add: number, remove: number): number =>
        metric - remove + add,
    ],
  ],
]);

export const createMetrics: typeof createMetricsDecl = getCreateFunction(
  (store: Store): Metrics => {
    const metricListeners: IdSet2 = mapNew();
    const [
      getStore,
      getMetricIds,
      forEachMetric,
      hasMetric,
      getTableId,
      getMetric,
      setMetric,
      setDefinition,
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
      aggregate?: 'sum' | 'avg' | 'min' | 'max' | Aggregate,
      getNumber?: Id | ((getCell: GetCell, rowId: Id) => number),
      aggregateAdd?: AggregateAdd,
      aggregateRemove?: AggregateRemove,
      aggregateReplace?: AggregateReplace,
    ): Metrics => {
      const metricAggregators: Aggregators = isFunction(aggregate)
        ? [aggregate, aggregateAdd, aggregateRemove, aggregateReplace]
        : mapGet(aggregators, aggregate as Id) ??
          (mapGet(aggregators, SUM) as Aggregators);

      setDefinition(
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
          let newMetric = getMetric(metricId);
          let length = collSize(numbers);
          const [aggregate, aggregateAdd, aggregateRemove, aggregateReplace] =
            metricAggregators;
          force = force || isUndefined(newMetric);

          collForEach(changedNumbers, ([oldNumber, newNumber]) => {
            if (!force) {
              newMetric = isUndefined(oldNumber)
                ? aggregateAdd?.(
                    newMetric as number,
                    newNumber as number,
                    length++,
                  )
                : isUndefined(newNumber)
                ? aggregateRemove?.(newMetric as number, oldNumber, length--)
                : aggregateReplace?.(
                    newMetric as number,
                    newNumber,
                    oldNumber,
                    length,
                  );
            }
            force = force || isUndefined(newMetric);
          });

          change();

          if (collIsEmpty(numbers)) {
            newMetric = undefined;
          } else if (force) {
            newMetric = aggregate(
              collValues(numbers) as number[],
              collSize(numbers),
            );
          }

          if (!isFiniteNumber(newMetric)) {
            newMetric = undefined;
          }

          const oldMetric = getMetric(metricId);
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

    const metrics: Metrics = {
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

    return objFreeze(metrics);
  },
);
