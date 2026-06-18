/**
 * The ui-react-dom-charts module of the TinyBase project provides components to
 * make it easy to create web-based reactive charts with Store and Queries
 * objects.
 *
 * The components in this module use the react-dom module and so are not
 * appropriate for environments like React Native (although those in the
 * lower-level ui-react module are).
 *
 * For a full list of SVG class names that can be styled with CSS, see the Using
 * Charts guide.
 * @packageDocumentation
 * @module ui-react-dom-charts
 * @since v8.5.0
 */
/// ui-react-dom-charts
/**
 * The ChartProps type describes the props that are used to configure the chart
 * element that renders a chart.
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
 * The TableSourceProps type describes the props that bind a chart to a
 * Table in a Store.
 * @category Configuration
 * @since v8.5.0
 */
/// TableSourceProps
{
  /**
   * The Id of the Table in the Store to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// TableSourceProps.tableId
  /**
   * The Store to chart, or the Id of a Store that is registered with the
   * Provider component.
   * @category Prop
   * @since v8.5.0
   */
  /// TableSourceProps.store
  /**
   * This prop is not used when binding a chart to a Table.
   * @category Prop
   * @since v8.5.0
   */
  /// TableSourceProps.queryId
  /**
   * This prop is not used when binding a chart to a Table.
   * @category Prop
   * @since v8.5.0
   */
  /// TableSourceProps.queries
}
/**
 * The QuerySourceProps type describes the props that bind a chart to a
 * Query in a Queries object.
 * @category Configuration
 * @since v8.5.0
 */
/// QuerySourceProps
{
  /**
   * The Id of the query in the Queries object to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// QuerySourceProps.queryId
  /**
   * The Queries object to chart, or the Id of a Queries object that is
   * registered with the Provider component.
   * @category Prop
   * @since v8.5.0
   */
  /// QuerySourceProps.queries
  /**
   * This prop is not used when binding a chart to a Query.
   * @category Prop
   * @since v8.5.0
   */
  /// QuerySourceProps.tableId
  /**
   * This prop is not used when binding a chart to a Query.
   * @category Prop
   * @since v8.5.0
   */
  /// QuerySourceProps.store
}
/**
 * The BindingProps type describes the props that bind a LineChart
 * component or BarChart component to Cell values in TinyBase data. An x Cell
 * value can be a finite number, string, or boolean. A y Cell value must be a
 * finite number.
 * @category Configuration
 * @since v8.5.0
 */
/// BindingProps
{
  /**
   * The Id of the Cell that provides each data point's x value. Finite numbers
   * can be used as continuous linear x values in line charts, ISO date strings
   * can be used as time x values, and other strings and booleans are used as
   * category values. Boolean category labels are rendered as `true` and
   * `false`.
   * @category Prop
   * @since v8.5.0
   */
  /// BindingProps.xCellId
  /**
   * The Id of the Cell that provides each data point's y value. Only finite
   * numbers are charted; rows with missing, non-numeric, or non-finite y values
   * are ignored.
   * @category Prop
   * @since v8.5.0
   */
  /// BindingProps.yCellId
  /**
   * The Id of the Cell used to sort the charted rows.
   * @category Prop
   * @since v8.5.0
   */
  /// BindingProps.sortCellId
  /**
   * Whether the charted rows should be sorted in descending order.
   * @category Prop
   * @since v8.5.0
   */
  /// BindingProps.descending
  /**
   * The number of sorted rows to skip before charting.
   * @category Prop
   * @since v8.5.0
   */
  /// BindingProps.offset
  /**
   * The maximum number of sorted rows to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// BindingProps.limit
}
/**
 * The SeriesProps type describes the props that bind a chart series to Cell
 * values in TinyBase data. An x Cell value can be a finite number, string, or
 * boolean. A y Cell value must be a finite number.
 * @category Configuration
 * @since v8.5.0
 */
/// SeriesProps
{
  /**
   * An optional string that will be added to the class attribute of the series'
   * SVG group element.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.className
  /**
   * The Id of the Cell that provides each data point's x value. Finite numbers
   * can be used as continuous linear x values in line series, ISO date strings
   * can be used as time x values, and other strings and booleans are used as
   * category values. Boolean category labels are rendered as `true` and
   * `false`.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.xCellId
  /**
   * The Id of the Cell that provides each data point's y value. Only finite
   * numbers are charted; rows with missing, non-numeric, or non-finite y values
   * are ignored.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.yCellId
  /**
   * An optional label to use for the series in axis titles and tooltips,
   * defaulting to the y Cell Id.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.label
  /**
   * The Id of the Cell used to sort the charted rows.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.sortCellId
  /**
   * Whether the charted rows should be sorted in descending order.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.descending
  /**
   * The number of sorted rows to skip before charting.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.offset
  /**
   * The maximum number of sorted rows to chart.
   * @category Prop
   * @since v8.5.0
   */
  /// SeriesProps.limit
}
/**
 * The XAxisScale type describes how x-axis values should be interpreted: `auto`,
 * `category`, `linear`, or `time`.
 * @category Configuration
 * @since v8.5.0
 */
/// XAxisScale
/**
 * The TimestampUnit type describes the unit used by numeric timestamp values on
 * a time x axis: `millisecond` or `second`.
 * @category Configuration
 * @since v8.5.0
 */
/// TimestampUnit
/**
 * The TimeValue type describes values that can be used for explicit bounds and
 * ticks on a time x axis: numbers, ISO date strings, or Date objects.
 * @category Configuration
 * @since v8.5.0
 */
/// TimeValue
/**
 * The BaseXAxisProps type describes props shared by all x-axis configurations.
 * @category Configuration
 * @since v8.5.0
 */
/// BaseXAxisProps
{
  /// XAxisProps.className
  /// XAxisProps.title
  /// XAxisProps.tickCount
}
/**
 * The LinearXAxisProps type describes x-axis configuration for automatically
 * inferred, categorical, and linear axes.
 * @category Configuration
 * @since v8.5.0
 */
/// LinearXAxisProps
{
  /// XAxisProps.scale
  /// XAxisProps.timestampUnit
  /// XAxisProps.min
  /// XAxisProps.max
  /// XAxisProps.ticks
  /// XAxisProps.tickFormatter
}
/**
 * The TimeXAxisProps type describes x-axis configuration for time axes.
 * @category Configuration
 * @since v8.5.0
 */
/// TimeXAxisProps
{
  /// XAxisProps.scale
  /// XAxisProps.timestampUnit
  /// XAxisProps.min
  /// XAxisProps.max
  /// XAxisProps.ticks
  /// XAxisProps.tickFormatter
}
/**
 * The XAxisProps type describes the props that configure the x axis of a
 * CartesianChart component, LineChart component, or BarChart component.
 *
 * The x axis is inferred by default. Use an XAxis component child when you want
 * to override its title, scale, continuous bounds, tick values, tick count, tick
 * labels, or SVG class name.
 * @category Configuration
 * @since v8.5.0
 */
/// XAxisProps
{
  /**
   * An optional string that will be added to the class attribute of the x-axis
   * SVG group element.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.className
  /**
   * An optional title to use for the x axis, defaulting to the x Cell Id, or to
   * a combined title when multiple series use different x Cell Ids.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.title
  /**
   * An optional scale to use for the x axis.
   *
   * The default `auto` scale infers linear axes from numeric line-series x
   * values, time axes from ISO date strings, and category axes otherwise. Use
   * `time` explicitly for numeric Unix timestamp values.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.scale
  /**
   * The unit for numeric timestamp values on a time x axis.
   *
   * This prop is ignored unless the scale prop is `time`, and defaults to
   * `millisecond`.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.timestampUnit
  /**
   * An optional minimum x-axis bound for continuous numeric or time x values.
   *
   * This prop is ignored when the x axis is categorical.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.min
  /**
   * An optional maximum x-axis bound for continuous numeric or time x values.
   *
   * This prop is ignored when the x axis is categorical.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.max
  /**
   * Optional tick values to use for a continuous numeric or time x axis.
   *
   * This prop is ignored when the x axis is categorical.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.ticks
  /**
   * An optional preferred number of ticks to render on a continuous x axis.
   *
   * The actual number of ticks may vary so that labels remain readable.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.tickCount
  /**
   * An optional function for formatting x-axis tick labels.
   *
   * It receives the original tick value for category axes, the numeric tick
   * value for linear axes, or a Date object for time axes. For time axes, the
   * normalized epoch millisecond timestamp is provided as a second argument.
   * @category Prop
   * @since v8.5.0
   */
  /// XAxisProps.tickFormatter
}
/**
 * The YAxisProps type describes the props that configure the y axis of a
 * CartesianChart component.
 *
 * The y axis is inferred by default. Use a YAxis component child when you want
 * to override its title, numeric bounds, tick values, tick count, tick labels,
 * or SVG class name.
 * @category Configuration
 * @since v8.5.0
 */
/// YAxisProps
{
  /**
   * An optional string that will be added to the class attribute of the y-axis
   * SVG group element.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.className
  /**
   * An optional title to use for the y axis, defaulting to the y Cell Id, y
   * series label, or a combined title when multiple series use different y Cell
   * Ids or labels.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.title
  /**
   * An optional minimum y-axis bound.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.min
  /**
   * An optional maximum y-axis bound.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.max
  /**
   * Optional numeric tick values to use for the y axis.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.ticks
  /**
   * An optional preferred number of ticks to render on the y axis.
   *
   * The actual number of ticks may vary so that labels remain readable.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.tickCount
  /**
   * An optional function for formatting y-axis tick labels.
   *
   * It receives the numeric tick value.
   * @category Prop
   * @since v8.5.0
   */
  /// YAxisProps.tickFormatter
}
/**
 * The CartesianChart component renders a chart frame and provides TinyBase
 * source and layout context to LineSeries component and BarSeries component
 * children.
 *
 * See the Composing Charts (React) demo for this component in action:
 *
 * ![CartesianChart component example](/shots/composing-charts-react-demo.png
 * "CartesianChart component example")
 *
 * The series children declare their own xCellId and yCellId bindings. The
 * optional XAxis component and YAxis component children can be used to
 * configure axis titles, bounds, ticks, and tick formatting.
 * @category Store components
 * @since v8.5.0
 * @example
 * This example creates a Store and renders two LineSeries component children
 * in a CartesianChart component.
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
 * The XAxis component configures the x axis of a CartesianChart component,
 * LineChart component, or BarChart component.
 *
 * It is a configuration child rather than a separately rendered SVG element:
 * include zero or one XAxis component in a chart's children. If omitted, the x
 * axis is inferred from the chart's series.
 *
 * See the Axis Overrides (React) demo for this component in action:
 *
 * ![XAxis component example](/shots/axis-overrides-react-demo.png
 * "XAxis component example")
 * @category Store components
 * @since v8.5.0
 */
/// XAxis
/**
 * The YAxis component configures the y axis of a CartesianChart component.
 *
 * It is a configuration child rather than a separately rendered SVG element:
 * include zero or one YAxis component in a CartesianChart component's children.
 * If omitted, the y axis is inferred from the chart's series.
 *
 * See the Axis Overrides (React) demo for this component in action:
 *
 * ![YAxis component example](/shots/axis-overrides-react-demo.png
 * "YAxis component example")
 * @category Store components
 * @since v8.5.0
 */
/// YAxis
/**
 * The LineSeries component renders a line series in a CartesianChart component.
 * If every x value in every series is a finite number, the x axis is rendered
 * as a continuous linear scale. ISO date strings are inferred as a time scale.
 * Other strings and booleans are rendered categorically. When sortCellId is
 * omitted, rows are sorted by xCellId.
 *
 * See the Composing Charts (React) demo for this component in action:
 *
 * ![LineSeries component example](/shots/composing-charts-react-demo.png
 * "LineSeries component example")
 * @category Store components
 * @since v8.5.0
 */
/// LineSeries
/**
 * The BarSeries component renders a bar series in a CartesianChart component.
 * Its x values are rendered categorically by default, even when they are finite
 * numbers. Add an XAxis component with a `linear` or `time` scale to position
 * bars continuously. Boolean category labels are rendered as `true` and
 * `false`.
 *
 * See the Composing Charts (React) demo for this component in action:
 *
 * ![BarSeries component example](/shots/composing-charts-react-demo.png
 * "BarSeries component example")
 * @category Store components
 * @since v8.5.0
 */
/// BarSeries
/**
 * The LineChart component renders a line chart from TinyBase data. If every x
 * value is a finite number, the x axis is rendered as a continuous linear
 * scale. ISO date strings are inferred as a time scale. Other strings and
 * booleans are rendered categorically. Add XAxis component and YAxis component
 * children to override axis configuration. When sortCellId is omitted, rows are
 * sorted by xCellId.
 *
 * See the <LineChart /> (React) demo for this component in action:
 *
 * ![LineChart component example](/shots/basic-chart-react-demo.png "LineChart
 * component example")
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
 * are rendered categorically by default, even when they are finite numbers. Add
 * an XAxis component with a `linear` or `time` scale to position bars
 * continuously. Boolean category labels are rendered as `true` and `false`.
 *
 * See the Sorting And Types (React) demo for this component in action:
 *
 * ![BarChart component example](/shots/sorting-and-types-react-demo.png
 * "BarChart component example")
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
