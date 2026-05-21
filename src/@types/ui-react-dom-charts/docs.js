/**
 * The ui-react-dom-charts module of the TinyBase project provides components
 * to make it easy to create web-based reactive charts with Store and Queries
 * objects.
 *
 * The components in this module use the react-dom module and so are not
 * appropriate for environments like React Native (although those in the
 * lower-level ui-react module are).
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
   * chart element.
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
 * values in TinyBase data.
 * @category Configuration
 * @since v8.5.0
 */
/// ChartBindingProps
{
  /**
   * The Id of the Cell that provides each data point's x value.
   * @category Prop
   * @since v8.5.0
   */
  /// ChartBindingProps.xCellId
  /**
   * The Id of the Cell that provides each data point's y value.
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
 * The LineChart component renders a line chart from TinyBase data.
 * @category Store components
 * @since v8.5.0
 */
/// LineChart
/**
 * The BarChart component renders a bar chart from TinyBase data.
 * @category Store components
 * @since v8.5.0
 */
/// BarChart
/**
 * The WithSchemas type provides a version of this module that is typed with
 * schemas.
 * @category Development
 * @since v8.5.0
 */
/// WithSchemas
