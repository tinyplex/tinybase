/**
 * The ui-react-dom-charts module of the TinyBase project provides components
 * to make it easy to create web-based reactive charts with Store and Queries
 * objects.
 *
 * The components in this module use the react-dom module and so are not
 * appropriate for environments like React Native (although those in the
 * lower-level ui-react module are).
 *
 * For a full list of SVG class names that can be styled with CSS, see the
 * Using Charts guide.
 * @packageDocumentation
 * @module ui-react-dom-charts
 * @since v8.5.0
 */
/// ui-react-dom-charts
/**
 * The ChartProps type describes the props that are used to configure the
 * chart element that renders a chart.
 * @category Configuration
 * @since v8.5.0
 */
/// ChartProps
{
  /**
   * An optional string that will be used as the class attribute of the chart's
   * SVG element. This can be used as the root selector for styling chart
   * internals, as shown in the Using Charts guide.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartProps.className
}
/**
 * The ChartTableSourceProps type describes the props that bind a chart to a
 * Table in a Store.
 * @category Configuration
 * @since v8.5.0
 */
/// ChartTableSourceProps
{
  /**
   * The Id of the Table in the Store to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartTableSourceProps.tableId
  /**
   * The Store to chart, or the Id of a Store that is registered with the
   * Provider component.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartTableSourceProps.store
  /**
   * This prop is not used when binding a chart to a Table.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartTableSourceProps.queryId
  /**
   * This prop is not used when binding a chart to a Table.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartTableSourceProps.queries
}
/**
 * The ChartQuerySourceProps type describes the props that bind a chart to a
 * Query in a Queries object.
 * @category Configuration
 * @since v8.5.0
 */
/// ChartQuerySourceProps
{
  /**
   * The Id of the query in the Queries object to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartQuerySourceProps.queryId
  /**
   * The Queries object to chart, or the Id of a Queries object that is
   * registered with the Provider component.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartQuerySourceProps.queries
  /**
   * This prop is not used when binding a chart to a Query.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartQuerySourceProps.tableId
  /**
   * This prop is not used when binding a chart to a Query.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartQuerySourceProps.store
}
/**
 * The ChartBindingProps type describes the props that bind a chart to Cell
 * values in TinyBase data. An x Cell value can be a finite number, string, or
 * boolean. A y Cell value must be a finite number.
 * @category Configuration
 * @since v8.5.0
 */
/// ChartBindingProps
{
  /**
   * The Id of the Cell that provides each data point's x value. Finite numbers
   * can be used as continuous x values in line charts, while strings and
   * booleans are used as category values. Boolean category labels are rendered
   * as `true` and `false`.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.xCellId
  /**
   * The Id of the Cell that provides each data point's y value. Only finite
   * numbers are charted; rows with missing, non-numeric, or non-finite y values
   * are ignored.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.yCellId
  /**
   * The Id of the Cell used to sort the charted rows.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.sortCellId
  /**
   * Whether the charted rows should be sorted in descending order.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.descending
  /**
   * The number of sorted rows to skip before charting.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.offset
  /**
   * The maximum number of sorted rows to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.limit
}
/**
 * The ChartSeriesProps type describes the props that bind a chart series to
 * Cell values in TinyBase data. An x Cell value can be a finite number,
 * string, or boolean. A y Cell value must be a finite number.
 * @category Configuration
 * @since v8.5.0
 */
/// ChartSeriesProps
{
  /**
   * An optional string that will be added to the class attribute of the series'
   * SVG group element.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.className
  /**
   * The Id of the Cell that provides each data point's x value. Finite numbers
   * can be used as continuous x values in line series, while strings and
   * booleans are used as category values. Boolean category labels are rendered
   * as `true` and `false`.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.xCellId
  /**
   * The Id of the Cell that provides each data point's y value. Only finite
   * numbers are charted; rows with missing, non-numeric, or non-finite y values
   * are ignored.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.yCellId
  /**
   * An optional label to use for the series in axis titles and tooltips,
   * defaulting to the y Cell Id.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.label
  /**
   * The Id of the Cell used to sort the charted rows.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.sortCellId
  /**
   * Whether the charted rows should be sorted in descending order.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.descending
  /**
   * The number of sorted rows to skip before charting.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.offset
  /**
   * The maximum number of sorted rows to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartSeriesProps.limit
}
/**
 * The CartesianChart component renders a chart frame and provides TinyBase
 * data to child series components.
 * @category Store components
 * @since v8.5.0
 * @example
 * This example creates a Store and renders two LineSeries components in a
 * CartesianChart.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {CartesianChart, LineSeries} from 'tinybase/ui-react-dom-charts';
 *
 * const store = createStore().setTable('pets', {
 *   hamsters: {order: 1, sold: 12, returned: 1},
 *   rabbits: {order: 2, sold: 9, returned: 2},
 * });
 * const App = () => (
 *   <CartesianChart store={store} tableId="pets">
 *     <LineSeries
 *       className="sold"
 *       label="Sold pets"
 *       xCellId="order"
 *       yCellId="sold"
 *     />
 *     <LineSeries
 *       className="returned"
 *       label="Returned pets"
 *       xCellId="order"
 *       yCellId="returned"
 *     />
 *   </CartesianChart>
 * );
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.firstChild?.nodeName.toLowerCase());
 * // -> 'svg'
 * ```
 */
/// CartesianChart
/**
 * The LineSeries component renders a line series in a CartesianChart
 * component. If every x value in every series is a finite number, the x axis is
 * rendered as a continuous numeric scale. If any x value is a string or
 * boolean, the x axis is rendered categorically. When sortCellId is omitted,
 * rows are sorted by xCellId.
 * @category Store components
 * @since v8.5.0
 */
/// LineSeries
/**
 * The BarSeries component renders a bar series in a CartesianChart component.
 * Its x values are always rendered categorically, even when they are finite
 * numbers. Boolean category labels are rendered as `true` and `false`.
 * @category Store components
 * @since v8.5.0
 */
/// BarSeries
/**
 * The LineChart component renders a line chart from TinyBase data. If every x
 * value is a finite number, the x axis is rendered as a continuous numeric
 * scale. If any x value is a string or boolean, the x axis is rendered
 * categorically. When sortCellId is omitted, rows are sorted by xCellId.
 * @category Store components
 * @since v8.5.0
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The LineChart component then renders an SVG chart from Cells in the
 * `pets` Table.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-react';
 * import {LineChart} from 'tinybase/ui-react-dom-charts';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <LineChart
 *       tableId="pets"
 *       xCellId="order"
 *       yCellId="sold"
 *       className="sales"
 *     />
 *   </Provider>
 * );
 *
 * const store = createStore().setTable('pets', {
 *   hamsters: {order: 1, sold: 12},
 *   rabbits: {order: 2, sold: 9},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.firstChild?.nodeName.toLowerCase());
 * // -> 'svg'
 * console.log(app.firstChild?.getAttribute('class'));
 * // -> 'sales'
 * ```
 */
/// LineChart
/**
 * The BarChart component renders a bar chart from TinyBase data. Its x values
 * are always rendered categorically, even when they are finite numbers. Boolean
 * category labels are rendered as `true` and `false`.
 * @category Store components
 * @since v8.5.0
 * @example
 * This example creates a Queries object and provides it through Provider
 * context. The BarChart component then renders an SVG chart from Cells in the
 * `bySpecies` query.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createQueries, createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-react';
 * import {BarChart} from 'tinybase/ui-react-dom-charts';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <BarChart queryId="bySpecies" xCellId="species" yCellId="sold" />
 *   </Provider>
 * );
 *
 * const store = createStore().setTable('pets', {
 *   hamsters: {species: 'hamster', sold: 12},
 *   rabbits: {species: 'rabbit', sold: 9},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'bySpecies',
 *   'pets',
 *   ({select}) => {
 *     select('species');
 *     select('sold');
 *   },
 * );
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.firstChild?.nodeName.toLowerCase());
 * // -> 'svg'
 * ```
 */
/// BarChart
/**
 * The WithSchemas type provides a version of this module that is typed with
 * schemas.
 * @category Development
 * @since v8.5.0
 */
/// WithSchemas
