/**
 * The metrics module of the TinyBase project provides the ability to create and
 * track metrics and aggregates of the data in Store objects.
 *
 * The main entry point to this module is the createMetrics function, which
 * returns a new Metrics object. From there, you can create new Metric
 * definitions, access the values of those Metrics directly, and register
 * listeners for when they change.
 * @packageDocumentation
 * @module metrics
 */
/// metrics
/**
 * The Metric type is simply an alias, but represents a number formed by
 * aggregating multiple other numbers together.
 * @category Metric
 */
/// Metric
/**
 * The MetricCallback type describes a function that takes a Metric's Id and a
 * callback to loop over each Row within it.
 *
 * A MetricCallback is provided when using the forEachMetric method, so that you
 * can do something based on every Metric in the Metrics object. See that method
 * for specific examples.
 * @param metricId The Id of the Metric that the callback can operate on.
 * @param metric The value of the Metric.
 * @category Callback
 */
/// MetricCallback
/**
 * The MetricAggregate type describes a custom function that takes an array of
 * numbers and returns an aggregate that is used as a Metric.
 *
 * There are a number of common predefined aggregators, such as for counting,
 * summing, and averaging values. This type is instead used for when you wish to
 * use a more complex aggregation of your own devising. See the
 * setMetricDefinition method for more examples.
 * @param numbers The array of numbers in the Metric's aggregation.
 * @param length The length of the array of numbers in the Metric's aggregation.
 * @returns The value of the Metric.
 * @category Aggregators
 */
/// MetricAggregate
/**
 * The MetricAggregateAdd type describes a function that can be used to optimize
 * a custom MetricAggregate by providing a shortcut for when a single value is
 * added to the input values.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when adding a new number to a
 * series, the new sum of the series is the new value added to the previous sum.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * being added, return `undefined` and the Metric will be completely
 * recalculated.
 *
 * Where possible, if you are providing a custom MetricAggregate, seek an
 * implementation of an MetricAggregateAdd function that can reduce the
 * complexity cost of growing the input data set. See the setMetricDefinition
 * method for more examples.
 * @param metric The current value of the Metric.
 * @param add The number being added to the Metric's aggregation.
 * @param length The length of the array of numbers in the Metric's aggregation.
 * @returns The new value of the Metric.
 * @category Aggregators
 */
/// MetricAggregateAdd
/**
 * The MetricAggregateRemove type describes a function that can be used to
 * optimize a custom MetricAggregate by providing a shortcut for when a single
 * value is removed from the input values.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when removing a number from a
 * series, the new sum of the series is the new value subtracted from the
 * previous sum.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * being removed, return `undefined` and the Metric will be completely
 * recalculated. One example might be if you were taking the minimum of the
 * values, and the previous minimum is being removed. The whole of the rest of
 * the list will need to be re-scanned to find a new minimum.
 *
 * Where possible, if you are providing a custom MetricAggregate, seek an
 * implementation of an MetricAggregateRemove function that can reduce the
 * complexity cost of shrinking the input data set. See the setMetricDefinition
 * method for more examples.
 * @param metric The current value of the Metric.
 * @param remove The number being removed from the Metric's aggregation.
 * @param length The length of the array of numbers in the Metric's aggregation.
 * @returns The new value of the Metric.
 * @category Aggregators
 */
/// MetricAggregateRemove
/**
 * The MetricAggregateReplace type describes a function that can be used to
 * optimize a custom MetricAggregate by providing a shortcut for when a single
 * value in the input values is replaced with another.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when replacing a number in a
 * series, the new sum of the series is the previous sum, plus the new value,
 * minus the old value.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * changing, return `undefined` and the Metric will be completely recalculated.
 *
 * Where possible, if you are providing a custom MetricAggregate, seek an
 * implementation of an MetricAggregateReplace function that can reduce the
 * complexity cost of changing the input data set in place. See the
 * setMetricDefinition method for more examples.
 * @param metric The current value of the Metric.
 * @param add The number being added to the Metric's aggregation.
 * @param remove The number being removed from the Metric's aggregation.
 * @param length The length of the array of numbers in the Metric's aggregation.
 * @returns The new value of the Metric.
 * @category Aggregators
 */
/// MetricAggregateReplace
/**
 * The MetricIdsListener type describes a function that is used to listen to
 * Metric definitions being added or removed.
 *
 * A MetricIdsListener is provided when using the addMetricIdsListener method.
 * See that method for specific examples.
 *
 * When called, a MetricIdsListener is given a reference to the Metrics object.
 * @param metrics A reference to the Metrics object that changed.
 * @category Listener
 */
/// MetricIdsListener
/**
 * The MetricListener type describes a function that is used to listen to
 * changes to a Metric.
 *
 * A MetricListener is provided when using the addMetricListener method. See
 * that method for specific examples.
 *
 * When called, a MetricListener is given a reference to the Metrics object, the
 * Id of the Metric that changed, and the new and old values of the Metric.
 *
 * If this is the first time that a Metric has had a value (such as when a table
 * has gained its first row), the old value will be `undefined`. If a Metric now
 * no longer has a value, the new value will be `undefined`.
 * @param metrics A reference to the Metrics object that changed.
 * @param metricId The Id of the Metric that changed.
 * @param newMetric The new value of the Metric that changed.
 * @param oldMetric The old value of the Metric that changed.
 * @category Listener
 */
/// MetricListener
/**
 * The MetricsListenerStats type describes the number of listeners registered
 * with the Metrics object, and can be used for debugging purposes.
 *
 * A MetricsListenerStats object is returned from the getListenerStats method,
 * and is only populated in a debug build.
 * @category Development
 */
/// MetricsListenerStats
{
  /**
   * The number of MetricListener functions registered with the Metrics object.
   */
  /// MetricsListenerStats.metric
}
/**
 * A Metrics object lets you define, query, and listen to, aggregations of Cell
 * values within a Table in a Store.
 *
 * This is useful for counting the number of Row objects in a Table, averaging
 * Cell values, or efficiently performing any arbitrary aggregations.
 *
 * Create a Metrics object easily with the createMetrics function. From there,
 * you can add new Metric definitions (with the setMetricDefinition method),
 * query their values (with the getMetric method), and add listeners for when
 * they change (with the addMetricListener method).
 *
 * This module provides a number of predefined and self-explanatory aggregations
 * ('sum', 'avg', 'min', and 'max'), and defaults to counting Row objects when
 * using the setMetricDefinition method. However, far more complex aggregations
 * can be configured with custom functions.
 * @example
 * This example shows a very simple lifecycle of a Metrics object: from
 * creation, to adding a definition, getting a Metric, and then registering and
 * removing a listener for it.
 *
 * ```js
 * import {createMetrics, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('species', {
 *   dog: {price: 5},
 *   cat: {price: 4},
 *   worm: {price: 1},
 * });
 *
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition(
 *   'highestPrice', // metricId
 *   'species', //      tableId to aggregate
 *   'max', //          aggregation
 *   'price', //        cellId to aggregate
 * );
 *
 * console.log(metrics.getMetric('highestPrice'));
 * // -> 5
 *
 * const listenerId = metrics.addMetricListener('highestPrice', () => {
 *   console.log(metrics.getMetric('highestPrice'));
 * });
 * store.setCell('species', 'horse', 'price', 20);
 * // -> 20
 *
 * metrics.delListener(listenerId);
 * metrics.destroy();
 * ```
 * @see Metrics And Indexes guides
 * @see Rolling Dice demos
 * @see Country demo
 * @see Todo App demos
 * @category Metrics
 */
/// Metrics
{
  /**
   * The setMetricDefinition method lets you set the definition of a Metric.
   *
   * Every Metric definition is identified by a unique Id, and if you re-use an
   * existing Id with this method, the previous definition is overwritten.
   *
   * A Metric is an aggregation of numeric values produced from each Row within
   * a single Table. Therefore the definition must specify the Table (by its Id)
   * to be aggregated.
   *
   * Without the third `aggregate` parameter, the Metric will simply be a count
   * of the number of Row objects in the Table. But often you will specify a
   * more interesting aggregate - such as the four predefined aggregates, 'sum',
   * 'avg', 'min', and 'max' - or a custom function that produces your own
   * aggregation of an array of numbers.
   *
   * The fourth `getNumber` parameter specifies which Cell in each Row contains
   * the numerical values to be used in the aggregation. Alternatively, a custom
   * function can be provided that produces your own numeric value from the
   * local Row as a whole.
   *
   * The final three parameters, `aggregateAdd`, `aggregateRemove`,
   * `aggregateReplace` need only be provided when you are using your own custom
   * `aggregate` function. These give you the opportunity to reduce your custom
   * function's algorithmic complexity by providing shortcuts that can nudge an
   * aggregation result when a single value is added, removed, or replaced in
   * the input values.
   * @param metricId The Id of the Metric to define.
   * @param tableId The Id of the Table the Metric will be calculated from.
   * @param aggregate Either a string representing one of a set of common
   * aggregation techniques ('sum', 'avg', 'min', or 'max'), or a function that
   * aggregates numeric values from each Row to create the Metric's overall
   * value. Defaults to 'sum'.
   * @param getNumber Either the Id of a Cell containing, or a function that
   * produces, the numeric value that will be aggregated in the way specified by
   * the `aggregate` parameter. Defaults to a function that returns `1` (meaning
   * that if the `aggregate` and `getNumber` parameters are both omitted, the
   * Metric will simply be a count of the Row objects in the Table).
   * @param aggregateAdd A function that can be used to optimize a custom
   * MetricAggregate by providing a shortcut for when a single value is added to
   * the input values - for example, when a Row is added to the Table.
   * @param aggregateRemove A function that can be used to optimize a custom
   * MetricAggregate by providing a shortcut for when a single value is removed
   * from the input values - for example ,when a Row is removed from the Table.
   * @param aggregateReplace A function that can be used to optimize a custom
   * MetricAggregate by providing a shortcut for when a single value in the
   * input values is replaced with another - for example, when a Row is updated.
   * @returns A reference to the Metrics object.
   * @example
   * This example creates a Store, creates a Metrics object, and defines a
   * simple Metric to count the Row objects in the Table.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('speciesCount', 'species');
   *
   * console.log(metrics.getMetric('speciesCount'));
   * // -> 3
   * ```
   * @example
   * This example creates a Store, creates a Metrics object, and defines a
   * standard Metric to get the highest value of each `price` Cell in the Row
   * objects in the Table.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
   *
   * console.log(metrics.getMetric('highestPrice'));
   * // -> 5
   * ```
   * @example
   * This example creates a Store, creates a Metrics object, and defines a
   * custom Metric to get the lowest value of each `price` Cell, greater than 2.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition(
   *   'lowestPriceOver2',
   *   'species',
   *   (numbers) => Math.min(...numbers.filter((number) => number > 2)),
   *   'price',
   * );
   *
   * console.log(metrics.getMetric('lowestPriceOver2'));
   * // -> 4
   * ```
   * @example
   * This example also creates a Store, creates a Metrics object, and defines a
   * custom Metric to get the lowest value of each `price` Cell, greater than 2.
   * However, it also reduces algorithmic complexity with two shortcut
   * functions.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition(
   *   'lowestPriceOver2',
   *   'species',
   *   (numbers) => Math.min(...numbers.filter((number) => number > 2)),
   *   'price',
   *   (metric, add) => (add > 2 ? Math.min(metric, add) : metric),
   *   (metric, remove) => (remove == metric ? undefined : metric),
   *   (metric, add, remove) =>
   *     remove == metric
   *       ? undefined
   *       : add > 2
   *         ? Math.min(metric, add)
   *         : metric,
   * );
   *
   * console.log(metrics.getMetric('lowestPriceOver2'));
   * // -> 4
   * store.setRow('species', 'fish', {price: 3});
   * console.log(metrics.getMetric('lowestPriceOver2'));
   * // -> 3
   * ```
   * @example
   * This example creates a Store, creates a Metrics object, and defines a
   * custom Metric to get the average value of a discounted price.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5, discount: 0.3},
   *   cat: {price: 4, discount: 0.2},
   *   worm: {price: 1, discount: 0.2},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition(
   *   'averageDiscountedPrice',
   *   'species',
   *   'avg',
   *   (getCell) => getCell('price') * (1 - getCell('discount')),
   * );
   *
   * console.log(metrics.getMetric('averageDiscountedPrice'));
   * // -> 2.5
   * ```
   * @category Configuration
   */
  /// Metrics.setMetricDefinition
  /**
   * The delMetricDefinition method removes an existing Metric definition.
   * @param metricId The Id of the Metric to remove.
   * @returns A reference to the Metrics object.
   * @example
   * This example creates a Store, creates a Metrics object, defines a simple
   * Metric, and then removes it.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('speciesCount', 'species');
   * console.log(metrics.getMetricIds());
   * // -> ['speciesCount']
   *
   * metrics.delMetricDefinition('speciesCount');
   * console.log(metrics.getMetricIds());
   * // -> []
   * ```
   * @category Configuration
   */
  /// Metrics.delMetricDefinition
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Metrics object.
   * @returns A reference to the Store.
   * @example
   * This example creates a Metrics object against a newly-created Store and
   * then gets its reference in order to update its data.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const metrics = createMetrics(createStore());
   * metrics.setMetricDefinition('speciesCount', 'species');
   * metrics.getStore().setCell('species', 'dog', 'price', 5);
   * console.log(metrics.getMetric('speciesCount'));
   * // -> 1
   * ```
   * @category Getter
   */
  /// Metrics.getStore
  /**
   * The getMetricIds method returns an array of the Metric Ids registered with
   * this Metrics object.
   * @returns An array of Ids.
   * @example
   * This example creates a Metrics object with two definitions, and then gets
   * the Ids of the definitions.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const metrics = createMetrics(createStore())
   *   .setMetricDefinition('speciesCount', 'species')
   *   .setMetricDefinition('petsCount', 'pets');
   *
   * console.log(metrics.getMetricIds());
   * // -> ['speciesCount', 'petsCount']
   * ```
   * @category Getter
   */
  /// Metrics.getMetricIds
  /**
   * The forEachMetric method takes a function that it will then call for each
   * Metric in the Metrics object.
   *
   * This method is useful for iterating over all the Metrics in a functional
   * style. The `metricCallback` parameter is a MetricCallback function that
   * will be called with the Id of each Metric and its value.
   * @param metricCallback The function that should be called for every Metric.
   * @example
   * This example iterates over each Metric in a Metrics object.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   * const metrics = createMetrics(store)
   *   .setMetricDefinition('highestPrice', 'species', 'max', 'price')
   *   .setMetricDefinition('lowestPrice', 'species', 'min', 'price');
   *
   * metrics.forEachMetric((metricId, metric) => {
   *   console.log([metricId, metric]);
   * });
   * // -> ['highestPrice', 5]
   * // -> ['lowestPrice', 1]
   * ```
   * @category Iterator
   */
  /// Metrics.forEachMetric
  /**
   * The hasMetric method returns a boolean indicating whether a given Metric
   * exists in the Metrics object, and has a value.
   * @param metricId The Id of a possible Metric in the Metrics object.
   * @returns Whether a Metric with that Id exists.
   * @example
   * This example shows two simple Metric existence checks.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
   *
   * console.log(metrics.hasMetric('lowestPrice'));
   * // -> false
   * console.log(metrics.hasMetric('highestPrice'));
   * // -> false
   * store.setTable('species', {dog: {price: 5}, cat: {price: 4}});
   * console.log(metrics.hasMetric('highestPrice'));
   * // -> true
   * ```
   * @category Getter
   */
  /// Metrics.hasMetric
  /**
   * The getTableId method returns the Id of the underlying Table that is
   * backing a Metric.
   *
   * If the Metric Id is invalid, the method returns `undefined`.
   * @param metricId The Id of a Metric.
   * @returns The Id of the Table backing the Metric, or `undefined`.
   * @example
   * This example creates a Metrics object, a single Metric definition, and then
   * queries it (and a non-existent definition) to get the underlying Table Id.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const metrics = createMetrics(createStore());
   * metrics.setMetricDefinition('speciesCount', 'species');
   *
   * console.log(metrics.getTableId('speciesCount'));
   * // -> 'species'
   * console.log(metrics.getTableId('petsCount'));
   * // -> undefined
   * ```
   * @category Getter
   */
  /// Metrics.getTableId
  /**
   * The getMetric method gets the current value of a Metric.
   *
   * If the identified Metric does not exist (or if the definition references a
   * Table or Cell value that does not exist) then `undefined` is returned.
   * @param metricId The Id of the Metric.
   * @returns The numeric value of the Metric, or `undefined`.
   * @example
   * This example creates a Store, creates a Metrics object, and defines a
   * simple Metric to average the price values in the Table. It then uses
   * getMetric to access its value (and also the value of a Metric that has not
   * been defined).
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
   *
   * console.log(metrics.getMetric('highestPrice'));
   * // -> 5
   * console.log(metrics.getMetric('lowestPrice'));
   * // -> undefined
   * ```
   * @category Getter
   */
  /// Metrics.getMetric
  /**
   * The addMetricIdsListener method registers a listener function with the
   * Metrics object that will be called whenever a Metric definition is added or
   * removed.
   *
   * The provided listener is a MetricIdsListener function, and will be called
   * with a reference to the Metrics object.
   * @param listener The function that will be called whenever a Metric
   * definition is added or removed.
   * @example
   * This example creates a Store, a Metrics object, and then registers a
   * listener that responds to the addition and the removal of a Metric
   * definition.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * const listenerId = metrics.addMetricIdsListener((metrics) => {
   *   console.log(metrics.getMetricIds());
   * });
   *
   * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
   * // -> ['highestPrice']
   * metrics.delMetricDefinition('highestPrice');
   * // -> []
   *
   * metrics.delListener(listenerId);
   * ```
   * @category Listener
   * @since v4.1.0
   */
  /// Metrics.addMetricIdsListener
  /**
   * The addMetricListener method registers a listener function with the Metrics
   * object that will be called whenever the value of a specified Metric
   * changes.
   *
   * You can either listen to a single Metric (by specifying the Metric Id as
   * the method's first parameter), or changes to any Metric (by providing a
   * `null` wildcard).
   *
   * The provided listener is a MetricListener function, and will be called with
   * a reference to the Metrics object, the Id of the Metric that changed, the
   * new Metric value, and the old Metric value.
   * @param metricId The Id of the Metric to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the Metric
   * changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, a Metrics object, and then registers a
   * listener that responds to any changes to a specific Metric.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
   *
   * const listenerId = metrics.addMetricListener(
   *   'highestPrice',
   *   (metrics, metricId, newMetric, oldMetric) => {
   *     console.log('highestPrice metric changed');
   *     console.log([oldMetric, newMetric]);
   *   },
   * );
   *
   * store.setCell('species', 'horse', 'price', 20);
   * // -> 'highestPrice metric changed'
   * // -> [5, 20]
   *
   * metrics.delListener(listenerId);
   * ```
   * @example
   * This example creates a Store, a Metrics object, and then registers a
   * listener that responds to any changes to any Metric.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store)
   *   .setMetricDefinition('highestPrice', 'species', 'max', 'price')
   *   .setMetricDefinition('speciesCount', 'species');
   *
   * const listenerId = metrics.addMetricListener(
   *   null,
   *   (metrics, metricId, newMetric, oldMetric) => {
   *     console.log(`${metricId} metric changed`);
   *     console.log([oldMetric, newMetric]);
   *   },
   * );
   *
   * store.setCell('species', 'horse', 'price', 20);
   * // -> 'highestPrice metric changed'
   * // -> [5, 20]
   * // -> 'speciesCount metric changed'
   * // -> [3, 4]
   *
   * metrics.delListener(listenerId);
   * ```
   * @category Listener
   */
  /// Metrics.addMetricListener
  /**
   * The delListener method removes a listener that was previously added to the
   * Metrics object.
   *
   * Use the Id returned by the addMetricListener method. Note that the Metrics
   * object may re-use this Id for future listeners added to it.
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the Metrics object.
   * @example
   * This example creates a Store, a Metrics object, registers a listener, and
   * then removes it.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
   *
   * const listenerId = metrics.addMetricListener(
   *   'highestPrice',
   *   (metrics, metricId, newMetric, oldMetric) => {
   *     console.log('highestPrice metric changed');
   *   },
   * );
   *
   * store.setCell('species', 'horse', 'price', 20);
   * // -> 'highestPrice metric changed'
   *
   * metrics.delListener(listenerId);
   *
   * store.setCell('species', 'giraffe', 'price', 50);
   * // -> undefined
   * // The listener is not called.
   * ```
   * @category Listener
   */
  /// Metrics.delListener
  /**
   * The destroy method should be called when this Metrics object is no longer
   * used.
   *
   * This guarantees that all of the listeners that the object registered with
   * the underlying Store are removed and it can be correctly garbage collected.
   * @example
   * This example creates a Store, adds a Metrics object with a definition (that
   * registers a RowListener with the underlying Store), and then destroys it
   * again, removing the listener.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('species', {
   *   dog: {price: 5},
   *   cat: {price: 4},
   *   worm: {price: 1},
   * });
   *
   * const metrics = createMetrics(store);
   * metrics.setMetricDefinition('speciesCount', 'species');
   * console.log(store.getListenerStats().row);
   * // -> 1
   *
   * metrics.destroy();
   *
   * console.log(store.getListenerStats().row);
   * // -> 0
   * ```
   * @category Lifecycle
   */
  /// Metrics.destroy
  /**
   * The getListenerStats method provides a set of statistics about the
   * listeners registered with the Metrics object, and is used for debugging
   * purposes.
   *
   * The statistics are only populated in a debug build: production builds
   * return an empty object. The method is intended to be used during
   * development to ensure your application is not leaking listener
   * registrations, for example.
   * @returns A MetricsListenerStats object containing Metrics listener
   * statistics.
   * @example
   * This example gets the listener statistics of a Metrics object.
   *
   * ```js
   * import {createMetrics, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const metrics = createMetrics(store);
   * metrics.addMetricListener(null, () => console.log('Metric changed'));
   *
   * console.log(metrics.getListenerStats());
   * // -> {metric: 1}
   * ```
   * @category Development
   */
  /// Metrics.getListenerStats
}
/**
 * The createMetrics function creates a Metrics object, and is the main entry
 * point into the metrics module.
 *
 * A given Store can only have one Metrics object associated with it. If you
 * call this function twice on the same Store, your second call will return a
 * reference to the Metrics object created by the first.
 * @param store The Store for which to register Metric definitions.
 * @returns A reference to the new Metrics object.
 * @example
 * This example creates a Metrics object.
 *
 * ```js
 * import {createMetrics, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const metrics = createMetrics(store);
 * console.log(metrics.getMetricIds());
 * // -> []
 * ```
 * @example
 * This example creates a Metrics object, and calls the method a second time
 * for the same Store to return the same object.
 *
 * ```js
 * import {createMetrics, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const metrics1 = createMetrics(store);
 * const metrics2 = createMetrics(store);
 * console.log(metrics1 === metrics2);
 * // -> true
 * ```
 * @category Creation
 */
/// createMetrics
