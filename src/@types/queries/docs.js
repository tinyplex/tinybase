/**
 * The queries module of the TinyBase project provides the ability to create and
 * track queries of the data in Store objects.
 *
 * The main entry point to using the queries module is the createQueries
 * function, which returns a new Queries object. That object in turn has methods
 * that let you create new query definitions, access their results directly, and
 * register listeners for when those results change.
 * @packageDocumentation
 * @module queries
 * @since v2.0.0
 */
/// queries
/**
 * The ResultTable type is the data structure representing the results of a
 * query.
 *
 * A ResultTable is typically accessed with the getResultTable method or
 * addResultTableListener method. It is similar to the Table type in the store
 * module, but without schema-specific typing, and is a regular JavaScript
 * object containing individual ResultRow objects, keyed by their Id.
 * @example
 * ```js
 * import type {ResultTable} from 'tinybase';
 *
 * export const resultTable: ResultTable = {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat'},
 * };
 * ```
 * @category Result
 */
/// ResultTable
/**
 * The ResultRow type is the data structure representing a single row in the
 * results of a query.
 *
 * A ResultRow is typically accessed with the getResultRow method or
 * addResultRowListener method. It is similar to the Row type in the store
 * module, but without schema-specific typing, and is a regular JavaScript
 * object containing individual ResultCell objects, keyed by their Id.
 * @example
 * ```js
 * import type {ResultRow} from 'tinybase';
 *
 * export const resultRow: ResultRow = {species: 'dog', color: 'brown'};
 * ```
 * @category Result
 */
/// ResultRow
/**
 * The ResultCell type is the data structure representing a single cell in the
 * results of a query.
 *
 * A ResultCell is typically accessed with the getResultCell method or
 * addResultCellListener method. It is similar to the Cell type in the store
 * module, but without schema-specific typing, and is a JavaScript string,
 * number, or boolean.
 * @example
 * ```js
 * import type {ResultCell} from 'tinybase';
 *
 * export const resultCell: ResultCell = 'dog';
 * ```
 * @category Result
 */
/// ResultCell
/**
 * The ResultCellOrUndefined type is the data structure representing a single
 * cell in the results of a query, or the value `undefined`.
 * @category Result
 */
/// ResultCellOrUndefined
/**
 * The Aggregate type describes a custom function that takes an array of Cell
 * values and returns an aggregate of them.
 *
 * There are a number of common predefined aggregators, such as for counting,
 * summing, and averaging values. This type is instead used for when you wish to
 * use a more complex aggregation of your own devising.
 * @param cells The array of Cell values to be aggregated.
 * @param length The length of the array of Cell values to be aggregated.
 * @returns The value of the aggregation.
 * @category Aggregators
 * @since v2.0.0
 */
/// Aggregate
/**
 * The AggregateAdd type describes a function that can be used to optimize a
 * custom Aggregate by providing a shortcut for when a single value is added to
 * the input values.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when adding a new number to a
 * series, the new sum of the series is the new value added to the previous sum.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * being added, return `undefined` and the aggregation will be completely
 * recalculated.
 *
 * Where possible, if you are providing a custom Aggregate, seek an
 * implementation of an AggregateAdd function that can reduce the complexity
 * cost of growing the input data set.
 * @param current The current value of the aggregation.
 * @param add The Cell value being added to the aggregation.
 * @param length The length of the array of Cell values in the aggregation.
 * @returns The new value of the aggregation.
 * @category Aggregators
 * @since v2.0.0
 */
/// AggregateAdd
/**
 * The AggregateRemove type describes a function that can be used to optimize a
 * custom Aggregate by providing a shortcut for when a single value is removed
 * from the input values.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when removing a number from a
 * series, the new sum of the series is the new value subtracted from the
 * previous sum.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * being removed, return `undefined` and the aggregation will be completely
 * recalculated. One example might be if you were taking the minimum of the
 * values, and the previous minimum is being removed. The whole of the rest of
 * the list will need to be re-scanned to find a new minimum.
 *
 * Where possible, if you are providing a custom Aggregate, seek an
 * implementation of an AggregateRemove function that can reduce the complexity
 * cost of shrinking the input data set.
 * @param current The current value of the aggregation.
 * @param remove The Cell value being removed from the aggregation.
 * @param length The length of the array of Cell values in the aggregation.
 * @returns The new value of the aggregation.
 * @category Aggregators
 * @since v2.0.0
 */
/// AggregateRemove
/**
 * The AggregateReplace type describes a function that can be used to optimize a
 * custom Aggregate by providing a shortcut for when a single value in the input
 * values is replaced with another.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when replacing a number in a
 * series, the new sum of the series is the previous sum, plus the new value,
 * minus the old value.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * changing, return `undefined` and the aggregation will be completely
 * recalculated.
 *
 * Where possible, if you are providing a custom Aggregate, seek an
 * implementation of an AggregateReplace function that can reduce the complexity
 * cost of changing the input data set in place.
 * @param current The current value of the aggregation.
 * @param add The Cell value being added to the aggregation.
 * @param remove The Cell value being removed from the aggregation.
 * @param length The length of the array of Cell values in the aggregation.
 * @returns The new value of the aggregation.
 * @category Aggregators
 * @since v2.0.0
 */
/// AggregateReplace
/**
 * The QueryCallback type describes a function that takes a query's Id.
 *
 * A QueryCallback is provided when using the forEachQuery method, so that you
 * can do something based on every query in the Queries object. See that method
 * for specific examples.
 * @param queryId The Id of the query that the callback can operate on.
 * @category Callback
 * @since v2.0.0
 */
/// QueryCallback
/**
 * The ResultTableCallback type describes a function that takes a ResultTable's
 * Id and a callback to loop over each ResultRow within it.
 *
 * A ResultTableCallback is provided when using the forEachResultTable method,
 * so that you can do something based on every ResultTable in the Queries
 * object. See that method for specific examples.
 * @param tableId The Id of the ResultTable that the callback can operate on.
 * @param forEachRow A function that will let you iterate over the ResultRow
 * objects in this ResultTable.
 * @category Callback
 */
/// ResultTableCallback
/**
 * The ResultRowCallback type describes a function that takes a ResultRow's Id
 * and a callback to loop over each ResultCell within it.
 *
 * A ResultRowCallback is provided when using the forEachResultRow method, so
 * that you can do something based on every ResultRow in a ResultTable. See that
 * method for specific examples.
 * @param rowId The Id of the ResultRow that the callback can operate on.
 * @param forEachRow A function that will let you iterate over the ResultCell
 * values in this ResultRow.
 * @category Callback
 */
/// ResultRowCallback
/**
 * The ResultCellCallback type describes a function that takes a ResultCell's Id
 * and its value.
 *
 * A ResultCellCallback is provided when using the forEachResultCell method, so
 * that you can do something based on every ResultCell in a ResultRow. See that
 * method for specific examples.
 * @param cellId The Id of the ResultCell that the callback can operate on.
 * @param cell The value of the ResultCell.
 * @category Callback
 */
/// ResultCellCallback
/**
 * The QueryIdsListener type describes a function that is used to listen
 * to Query definitions being added or removed.
 *
 * A QueryIdsListener is provided when using the
 * addQueryIdsListener method. See that method for specific examples.
 *
 * When called, a QueryIdsListener is given a reference to the
 * Queries object.
 * @param queries A reference to the Queries object that changed.
 * @category Listener
 */
/// QueryIdsListener
/**
 * The ResultTableListener type describes a function that is used to listen to
 * changes to a query's ResultTable.
 *
 * A ResultTableListener is provided when using the addResultTableListener
 * method. See that method for specific examples.
 *
 * When called, a ResultTableListener is given a reference to the Queries
 * object, the Id of the ResultTable that changed (which is the same as the
 * query Id), and a GetResultCellChange function that can be used to query
 * ResultCell values before and after the change.
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @param getCellChange A function that returns information about any
 * ResultCell's changes.
 * @category Listener
 * @since v2.0.0
 */
/// ResultTableListener
/**
 * The ResultTableCellIdsListener type describes a function that is used to
 * listen to changes to the Cell Ids that appear anywhere in a query's
 * ResultTable.
 *
 * A ResultTableCellIdsListener is provided when using the
 * addResultTableCellIdsListener method. See that method for specific examples.
 *
 * When called, a ResultTableCellIdsListener is given a reference to the Queries
 * object, and the Id of the ResultTable whose Cell Ids changed (which is the
 * same as the query Id).
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @category Listener
 * @since v4.1.0
 */
/// ResultTableCellIdsListener
/**
 * The ResultRowCountListener type describes a function that is used to listen
 * to changes to the number of ResultRow objects in a query's ResultTable.
 *
 * A ResultRowCountListener is provided when using the addResultRowCountListener
 * method. See that method for specific examples.
 *
 * When called, a ResultRowCountListener is given a reference to the Queries
 * object, the Id of the ResultTable whose ResultRow Ids changed (which is the
 * same as the query Id), and the count of ResultRow objects in the ResultTable.
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @param count The number of ResultRow objects in the ResultTable.
 * @category Listener
 * @since v4.1.0
 */
/// ResultRowCountListener
/**
 * The ResultRowIdsListener type describes a function that is used to listen to
 * changes to the ResultRow Ids in a query's ResultTable.
 *
 * A ResultRowIdsListener is provided when using the addResultRowIdsListener
 * method. See that method for specific examples.
 *
 * When called, a ResultRowIdsListener is given a reference to the Queries
 * object, and the Id of the ResultTable whose ResultRow Ids changed (which is
 * the same as the query Id).
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @category Listener
 * @since v2.0.0
 */
/// ResultRowIdsListener
/**
 * The ResultSortedRowIdsListener type describes a function that is used to
 * listen to changes to the sorted ResultRow Ids in a query's ResultTable.
 *
 * A ResultSortedRowIdsListener is provided when using the
 * addResultSortedRowIdsListener method. See that method for specific examples.
 *
 * When called, a ResultSortedRowIdsListener is given a reference to the Queries
 * object, the Id of the ResultTable whose ResultRow Ids changed (which is the
 * same as the query Id), the ResultCell Id being used to sort them, whether
 * descending or not, and the offset and limit of the number of Ids returned,
 * for pagination purposes. It also receives the sorted array of Ids itself, so
 * that you can use them in the listener without the additional cost of an
 * explicit call to getResultSortedRowIds.
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @param cellId The Id of the ResultCell whose values were used for the
 * sorting.
 * @param descending Whether the sorting was in descending order.
 * @param offset The number of ResultRow Ids skipped.
 * @param limit The maximum number of ResultRow Ids returned.
 * @param sortedRowIds The sorted ResultRow Ids themselves.
 * @category Listener
 * @since v2.0.0
 */
/// ResultSortedRowIdsListener
/**
 * The ResultRowListener type describes a function that is used to listen to
 * changes to a ResultRow in a query's ResultTable.
 *
 * A ResultRowListener is provided when using the addResultRowListener method.
 * See that method for specific examples.
 *
 * When called, a ResultRowListener is given a reference to the Queries object,
 * the Id of the ResultTable that changed (which is the same as the query Id),
 * the Id of the ResultRow that changed, and a GetResultCellChange function that
 * can be used to query ResultCell values before and after the change.
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @param rowId The Id of the ResultRow that changed.
 * @param getCellChange A function that returns information about any
 * ResultCell's changes.
 * @category Listener
 * @since v2.0.0
 */
/// ResultRowListener
/**
 * The ResultCellIdsListener type describes a function that is used to listen to
 * changes to the ResultCell Ids in a ResultRow in a query's ResultTable.
 *
 * A ResultCellIdsListener is provided when using the addResultCellIdsListener
 * method. See that method for specific examples.
 *
 * When called, a ResultCellIdsListener is given a reference to the Queries
 * object, the Id of the ResultTable that changed (which is the same as the
 * query Id), and the Id of the ResultRow whose ResultCell Ids changed.
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @param rowId The Id of the ResultRow that changed.
 * @category Listener
 * @since v2.0.0
 */
/// ResultCellIdsListener
/**
 * The ResultCellListener type describes a function that is used to listen to
 * changes to a ResultCell in a query's ResultTable.
 *
 * A ResultCellListener is provided when using the addResultCellListener method.
 * See that method for specific examples.
 *
 * When called, a ResultCellListener is given a reference to the Queries object,
 * the Id of the ResultTable that changed (which is the same as the query Id),
 * the Id of the ResultRow that changed, and the Id of ResultCell that changed.
 * It is also given the new value of the ResultCell, the old value of the
 * ResultCell, and a GetResultCellChange function that can be used to query
 * ResultCell values before and after the change.
 *
 * You can create new query definitions within the body of this listener, though
 * obviously be aware of the possible cascading effects of doing so.
 * @param queries A reference to the Queries object that changed.
 * @param tableId The Id of the ResultTable that changed, which is also the
 * query Id.
 * @param rowId The Id of the ResultRow that changed.
 * @param cellId The Id of the ResultCell that changed.
 * @param newCell The new value of the ResultCell that changed.
 * @param oldCell The old value of the ResultCell that changed.
 * @param getCellChange A function that returns information about any
 * ResultCell's changes.
 * @category Listener
 * @since v2.0.0
 */
/// ResultCellListener
/**
 * The GetResultCellChange type describes a function that returns information
 * about any ResultCell's changes during a transaction.
 *
 * A GetResultCellChange function is provided to every listener when called due
 * the Store changing. The listener can then fetch the previous value of a
 * ResultCell before the current transaction, the new value after it, and a
 * convenience flag that indicates that the value has changed.
 * @param tableId The Id of the ResultTable to inspect.
 * @param rowId The Id of the ResultRow to inspect.
 * @param cellId The Id of the ResultCell to inspect.
 * @returns A ResultCellChange array containing information about the
 * ResultCell's changes.
 * @category Listener
 */
/// GetResultCellChange
/**
 * The ResultCellChange type describes a ResultCell's changes during a
 * transaction.
 *
 * This is returned by the GetResultCellChange function that is provided to
 * every listener when called. This array contains the previous value of a
 * ResultCell before the current transaction, the new value after it, and a
 * convenience flag that indicates that the value has changed.
 * @category Listener
 */
/// ResultCellChange
/**
 * The QueriesListenerStats type describes the number of listeners registered
 * with the Queries object, and can be used for debugging purposes.
 *
 * A QueriesListenerStats object is returned from the getListenerStats method.
 * @category Development
 * @since v2.0.0
 */
/// QueriesListenerStats
{
  /**
   * The number of ResultTableListener functions registered with the Queries
   * object.
   */
  /// QueriesListenerStats.table
  /**
   * The number of ResultTableCellIdsListener functions registered with the
   * Queries object, since v3.3.
   */
  /// QueriesListenerStats.tableCellIds
  /**
   * The number of ResultRowCountListener functions registered with the Queries
   * object, since v4.1.
   */
  /// QueriesListenerStats.rowCount
  /**
   * The number of ResultRowIdsListener functions registered with the Queries
   * object.
   */
  /// QueriesListenerStats.rowIds
  /**
   * The number of SortedRowIdsListener functions registered with the Queries
   * object.
   */
  /// QueriesListenerStats.sortedRowIds
  /**
   * The number of ResultRowListener functions registered with the Queries
   * object.
   */
  /// QueriesListenerStats.row
  /**
   * The number of ResultCellIdsListener functions registered with the Queries
   * object.
   */
  /// QueriesListenerStats.cellIds
  /**
   * The number of ResultCellListener functions registered with the Queries
   * object.
   */
  /// QueriesListenerStats.cell
}
/**
 * The GetTableCell type describes a function that takes a Id and returns the
 * Cell value for a particular Row, optionally in a joined Table.
 *
 * A GetTableCell can be provided when setting query definitions, specifically
 * in the Select and Where clauses when you want to create or filter on
 * calculated values. See those methods for specific examples.
 * @category Callback
 * @since v2.0.0
 */
/// GetTableCell
{
  /**
   * When called with one parameter, this function will return the value of
   * the specified Cell from the query's root Table for the Row being selected
   * or filtered.
   * @param cellId The Id of the Cell to fetch the value for.
   * @returns A Cell value or `undefined`.
   */
  /// GetTableCell.1
  /**
   * When called with two parameters, this function will return the value of
   * the specified Cell from a Table that has been joined in the query, for
   * the Row being selected or filtered.
   * @param joinedTableId The Id of the Table to fetch the value from. If the
   * underlying Table was joined 'as' a different Id, that should instead be
   * used.
   * @param joinedCellId The Id of the Cell to fetch the value for.
   * @returns A Cell value or `undefined`.
   */
  /// GetTableCell.2
}
/**
 * The Select type describes a function that lets you specify a Cell or
 * calculated value for including into the query's result.
 *
 * The Select function is provided to the third `query` parameter of the
 * setQueryDefinition method. A query definition must call the Select function
 * at least once, otherwise it will be meaningless and return no data.
 * @example
 * This example shows a query that selects two Cells from the main query Table.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown', legs: 4},
 *   felix: {species: 'cat', color: 'black', legs: 4},
 *   cujo: {species: 'dog', color: 'black', legs: 4},
 * });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select}) => {
 *   select('species');
 *   select('color');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {species: 'dog', color: 'brown'}}
 * // -> {felix: {species: 'cat', color: 'black'}}
 * // -> {cujo: {species: 'dog', color: 'black'}}
 * ```
 * @example
 * This example shows a query that selects two Cells, one from a joined Table.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select('species');
 *   select('owners', 'name');
 *   // from pets
 *   join('owners', 'ownerId');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {species: 'dog', name: 'Alice'}}
 * // -> {felix: {species: 'cat', name: 'Bob'}}
 * // -> {cujo: {species: 'dog', name: 'Carol'}}
 * ```
 * @example
 * This example shows a query that calculates a value from two underlying Cells.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select(
 *     (getTableCell) =>
 *       `${getTableCell('species')} for ${getTableCell('owners', 'name')}`,
 *   ).as('description');
 *   join('owners', 'ownerId');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {description: 'dog for Alice'}}
 * // -> {felix: {description: 'cat for Bob'}}
 * // -> {cujo: {description: 'dog for Carol'}}
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// Select
{
  /**
   * Calling this function with one Id parameter will indicate that the query
   * should select the value of the specified Cell from the query's root Table.
   * @param cellId The Id of the Cell to fetch the value for.
   * @returns A SelectedAs object so that the selected Cell Id can be optionally
   * aliased.
   */
  /// Select.1
  /**
   * Calling this function with two parameters will indicate that the query
   * should select the value of the specified Cell from a Table that has been
   * joined in the query.
   * @param joinedTableId The Id of the Table to fetch the value from. If the
   * underlying Table was joined 'as' a different Id, that should instead be
   * used.
   * @param joinedCellId The Id of the Cell to fetch the value for.
   * @returns A SelectedAs object so that the selected Cell Id can be optionally
   * aliased.
   */
  /// Select.2
  /**
   * Calling this function with one callback parameter will indicate that the
   * query should select a calculated value, based on one or more Cell values in
   * the root Table or a joined Table, or on the root Table's Row Id.
   * @param getCell A callback that takes a GetTableCell function and the main
   * Table's Row Id. These can be used to programmatically create a calculated
   * value from multiple Cell values and the Row Id.
   * @returns A SelectedAs object so that the selected Cell Id can be optionally
   * aliased.
   */
  /// Select.3
}
/**
 * The SelectedAs type describes an object returned from calling a Select
 * function so that the selected Cell Id can be optionally aliased.
 *
 * If you are using a callback in the Select cause, it is highly recommended to
 * use the 'as' function, since otherwise a machine-generated column name will
 * be used.
 *
 * Note that if two Select clauses are both aliased to the same name (or if two
 * columns with the same underlying name are selected, both _without_ aliases),
 * only the latter of two will be used in the query.
 * @example
 * This example shows a query that selects two Cells, one from a joined Table.
 * Both are aliased with the 'as' function:
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select('species').as('petSpecies');
 *   select('owners', 'name').as('ownerName');
 *   // from pets
 *   join('owners', 'ownerId');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {petSpecies: 'dog', ownerName: 'Alice'}}
 * // -> {felix: {petSpecies: 'cat', ownerName: 'Bob'}}
 * // -> {cujo: {petSpecies: 'dog', ownerName: 'Carol'}}
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// SelectedAs
{
  /**
   * A function that lets you specify an alias for the Cell Id.
   */
  /// SelectedAs.as
}
/**
 * The Join type describes a function that lets you specify a Cell or calculated
 * value to join the main query Table to other Tables, by their Row Id.
 *
 * The Join function is provided to the third `query` parameter of the
 * setQueryDefinition method.
 *
 * You can join zero, one, or many Tables. You can join the same underlying
 * Table multiple times, but in that case you will need to use the 'as' function
 * to distinguish them from each other.
 *
 * By default, each join is made from the main query Table to the joined table,
 * but it is also possible to connect via an intermediate join Table to a more
 * distant join Table.
 *
 * Because a Join clause is used to identify which unique Row Id of the joined
 * Table will be joined to each Row of the root Table, queries follow the 'left
 * join' semantics you may be familiar with from SQL. This means that an
 * unfiltered query will only ever return the same number of Rows as the main
 * Table being queried, and indeed the resulting table (assuming it has not been
 * aggregated) will even preserve the root Table's original Row Ids.
 * @example
 * This example shows a query that joins a single Table by using an Id present
 * in the main query Table.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select('species');
 *   select('owners', 'name');
 *   // from pets
 *   join('owners', 'ownerId');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {species: 'dog', name: 'Alice'}}
 * // -> {felix: {species: 'cat', name: 'Bob'}}
 * // -> {cujo: {species: 'dog', name: 'Carol'}}
 * ```
 * @example
 * This example shows a query that joins the same underlying Table twice, and
 * aliases them (and the selected Cell Ids). Note the left-join semantics: Felix
 * the cat was bought, but the seller was unknown. The record still exists in
 * the ResultTable.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', buyerId: '1', sellerId: '2'},
 *     felix: {species: 'cat', buyerId: '2'},
 *     cujo: {species: 'dog', buyerId: '3', sellerId: '1'},
 *   })
 *   .setTable('humans', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select('buyers', 'name').as('buyer');
 *   select('sellers', 'name').as('seller');
 *   // from pets
 *   join('humans', 'buyerId').as('buyers');
 *   join('humans', 'sellerId').as('sellers');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {buyer: 'Alice', seller: 'Bob'}}
 * // -> {felix: {buyer: 'Bob'}}
 * // -> {cujo: {buyer: 'Carol', seller: 'Alice'}}
 * ```
 * @example
 * This example shows a query that calculates the Id of the joined Table based
 * from multiple values in the root Table rather than a single Cell.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   })
 *   .setTable('colorSpecies', {
 *     'brown-dog': {price: 6},
 *     'black-dog': {price: 5},
 *     'brown-cat': {price: 4},
 *     'black-cat': {price: 3},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select('colorSpecies', 'price');
 *   // from pets
 *   join(
 *     'colorSpecies',
 *     (getCell) => `${getCell('color')}-${getCell('species')}`,
 *   );
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {price: 6}}
 * // -> {felix: {price: 3}}
 * // -> {cujo: {price: 5}}
 * ```
 * @example
 * This example shows a query that joins two Tables, one through the
 * intermediate other.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice', state: 'CA'},
 *     '2': {name: 'Bob', state: 'CA'},
 *     '3': {name: 'Carol', state: 'WA'},
 *   })
 *   .setTable('states', {
 *     CA: {name: 'California'},
 *     WA: {name: 'Washington'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select(
 *     (getTableCell) =>
 *       `${getTableCell('species')} in ${getTableCell('states', 'name')}`,
 *   ).as('description');
 *   // from pets
 *   join('owners', 'ownerId');
 *   join('states', 'owners', 'state');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {description: 'dog in California'}}
 * // -> {felix: {description: 'cat in California'}}
 * // -> {cujo: {description: 'dog in Washington'}}
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// Join
{
  /**
   * Calling this function with two Id parameters will indicate that the join to
   * a Row in an adjacent Table is made by finding its Id in a Cell of the
   * query's root Table.
   * @param joinedTableId The Id of the Table to join to.
   * @param on The Id of the Cell in the root Table that contains the joined
   * Table's Row Id.
   * @returns A JoinedAs object so that the joined Table Id can be optionally
   * aliased.
   */
  /// Join.1
  /**
   * Calling this function with two parameters (where the second is a function)
   * will indicate that the join to a Row in an adjacent Table is made by
   * calculating its Id from the Cells and the Row Id of the query's root Table.
   * @param joinedTableId The Id of the Table to join to.
   * @param on A callback that takes a GetCell function and the root Table's Row
   * Id. These can be used to programmatically calculate the joined Table's Row
   * Id.
   * @returns A JoinedAs object so that the joined Table Id can be optionally
   * aliased.
   */
  /// Join.2
  /**
   * Calling this function with three Id parameters will indicate that the join
   * to a Row in distant Table is made by finding its Id in a Cell of an
   * intermediately joined Table.
   * @param joinedTableId The Id of the distant Table to join to.
   * @param fromIntermediateJoinedTableId The Id of an intermediate Table (which
   * should have been in turn joined to the main query table via other Join
   * clauses).
   * @param on The Id of the Cell in the intermediate Table that contains the
   * joined Table's Row Id.
   * @returns A JoinedAs object so that the joined Table Id can be optionally
   * aliased.
   */
  /// Join.3
  /**
   * Calling this function with three parameters (where the third is a function)
   * will indicate that the join to a Row in distant Table is made by
   * calculating its Id from the Cells and the Row Id of an intermediately
   * joined Table.
   * @param joinedTableId The Id of the Table to join to.
   * @param fromIntermediateJoinedTableId The Id of an intermediate Table (which
   * should have been in turn joined to the main query table via other Join
   * clauses).
   * @param on A callback that takes a GetCell function and the intermediate
   * Table's Row Id. These can be used to programmatically calculate the joined
   * Table's Row Id.
   * @returns A JoinedAs object so that the joined Table Id can be optionally
   * aliased.
   */
  /// Join.4
}
/**
 * The JoinedAs type describes an object returned from calling a Join function
 * so that the joined Table Id can be optionally aliased.
 *
 * Note that if two Join clauses are both aliased to the same name (or if you
 * create two joins to the same underlying Table, both _without_ aliases), only
 * the latter of two will be used in the query.
 *
 * For the purposes of clarity, it's recommended to use an alias that does not
 * collide with a real underlying Table (whether included in the query or not).
 * @example
 * This example shows a query that joins the same underlying Table twice, for
 * different purposes. Both joins are aliased with the 'as' function to
 * disambiguate them. Note that the selected Cells are also aliased.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', buyerId: '1', sellerId: '2'},
 *     felix: {species: 'cat', buyerId: '2'},
 *     cujo: {species: 'dog', buyerId: '3', sellerId: '1'},
 *   })
 *   .setTable('humans', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join}) => {
 *   select('buyers', 'name').as('buyer');
 *   select('sellers', 'name').as('seller');
 *   // from pets
 *   join('humans', 'buyerId').as('buyers');
 *   join('humans', 'sellerId').as('sellers');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {buyer: 'Alice', seller: 'Bob'}}
 * // -> {felix: {buyer: 'Bob'}}
 * // -> {cujo: {buyer: 'Carol', seller: 'Alice'}}
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// JoinedAs
/**
 * A function that lets you specify an alias for the joined Table Id.
 */
/// JoinedAs.as
/**
 * The Where type describes a function that lets you specify conditions to
 * filter results, based on the underlying Cells of the root or joined Tables.
 *
 * The Where function is provided to the third `query` parameter of the
 * setQueryDefinition method.
 *
 * If you do not specify a Where clause, you should expect every non-empty Row
 * of the root Table to appear in the query's results.
 *
 * A Where condition has to be true for a Row to be included in the results.
 * Each Where class is additive, as though combined with a logical 'and'. If you
 * wish to create an 'or' expression, use the single parameter version of the
 * type that allows arbitrary programmatic conditions.
 *
 * The Where keyword differs from the Having keyword in that the former
 * describes conditions that should be met by underlying Cell values (whether
 * selected or not), and the latter describes conditions based on calculated and
 * aggregated values - after Group clauses have been applied.
 * @example
 * This example shows a query that filters the results from a single Table by
 * comparing an underlying Cell from it with a value.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, where}) => {
 *   select('species');
 *   where('species', 'dog');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {species: 'dog'}}
 * // -> {cujo: {species: 'dog'}}
 * ```
 * @example
 * This example shows a query that filters the results of a query by comparing
 * an underlying Cell from a joined Table with a value. Note that the joined
 * table has also been aliased, and so its alias is used in the Where clause.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice', state: 'CA'},
 *     '2': {name: 'Bob', state: 'CA'},
 *     '3': {name: 'Carol', state: 'WA'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join, where}) => {
 *   select('species');
 *   // from pets
 *   join('owners', 'ownerId').as('petOwners');
 *   where('petOwners', 'state', 'CA');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {fido: {species: 'dog'}}
 * // -> {felix: {species: 'cat'}}
 * ```
 * @example
 * This example shows a query that filters the results of a query with a
 * condition that is calculated from underlying Cell values from the main and
 * joined Table. Note that the joined table has also been aliased, and so its
 * alias is used in the Where clause.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', ownerId: '1'},
 *     felix: {species: 'cat', ownerId: '2'},
 *     cujo: {species: 'dog', ownerId: '3'},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice', state: 'CA'},
 *     '2': {name: 'Bob', state: 'CA'},
 *     '3': {name: 'Carol', state: 'WA'},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join, where}) => {
 *   select('species');
 *   select('petOwners', 'state');
 *   // from pets
 *   join('owners', 'ownerId').as('petOwners');
 *   where(
 *     (getTableCell) =>
 *       getTableCell('pets', 'species') === 'cat' ||
 *       getTableCell('petOwners', 'state') === 'WA',
 *   );
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {felix: {species: 'cat', state: 'CA'}}
 * // -> {cujo: {species: 'dog', state: 'WA'}}
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// Where
{
  /**
   * Calling this function with two parameters is used to include only those
   * Rows for which a specified Cell in the query's root Table has a specified
   * value.
   * @param cellId The Id of the Cell in the query's root Table to test.
   * @param equals The value that the Cell has to have for the Row to be
   * included in the result.
   */
  /// Where.1
  /**
   * Calling this function with three parameters is used to include only those
   * Rows for which a specified Cell in a joined Table has a specified value.
   * @param joinedTableId The Id of the joined Table to test a value in. If the
   * underlying Table was joined 'as' a different Id, that should instead be
   * used.
   * @param joinedCellId The Id of the Cell in the joined Table to test.
   * @param equals The value that the Cell has to have for the Row to be
   * included in the result.
   */
  /// Where.2
  /**
   * Calling this function with one callback parameter is used to include only
   * those Rows which meet a calculated boolean condition, based on values in
   * the main and (optionally) joined Tables.
   * @param condition A callback that takes a GetTableCell function and that
   * should return `true` for the Row to be included in the result.
   */
  /// Where.3
}
/**
 * The Group type describes a function that lets you specify that the values of
 * a Cell in multiple ResultRows should be aggregated together.
 *
 * The Group function is provided to the third `query` parameter of the
 * setQueryDefinition method. When called, it should refer to a Cell Id (or
 * aliased Id) specified in one of the Select functions, and indicate how the
 * values should be aggregated.
 *
 * This is applied after any joins or where-based filtering.
 *
 * If you provide a Group for every Select, the result will be a single Row with
 * every Cell having been aggregated. If you provide a Group for only one, or
 * some, of the Select clauses, the _others_ will be automatically used as
 * dimensional values (analogous to the 'group by` semantics in SQL), within
 * which the aggregations of Group Cells will be performed.
 *
 * You can join the same underlying Cell multiple times, but in that case you
 * will need to use the 'as' function to distinguish them from each other.
 *
 * The second parameter can be one of five predefined aggregates - 'count',
 * 'sum', 'avg', 'min', and 'max' - or a custom function that produces your own
 * aggregation of an array of Cell values.
 *
 * The final three parameters, `aggregateAdd`, `aggregateRemove`,
 * `aggregateReplace` need only be provided when you are using your own custom
 * `aggregate` function. These give you the opportunity to reduce your custom
 * function's algorithmic complexity by providing shortcuts that can nudge an
 * aggregation result when a single value is added, removed, or replaced in the
 * input values.
 * @param selectedCellId The Id of the Cell to aggregate. If the underlying Cell
 * was selected 'as' a different Id, that should instead be used.
 * @param aggregate Either a string representing one of a set of common
 * aggregation techniques ('count', 'sum', 'avg', 'min', or 'max'), or a
 * function that aggregates Cell values from each Row to create the aggregate's
 * overall.
 * @param aggregateAdd A function that can be used to optimize a custom
 * Aggregate by providing a shortcut for when a single value is added to the
 * input values - for example, when a Row is added to the Table.
 * @param aggregateRemove A function that can be used to optimize a custom
 * Aggregate by providing a shortcut for when a single value is removed from the
 * input values - for example, when a Row is removed from the Table.
 * @param aggregateReplace A function that can be used to optimize a custom
 * Aggregate by providing a shortcut for when a single value in the input values
 * is replaced with another - for example, when a Row is updated.
 * @returns A GroupedAs object so that the grouped Cell Id can be optionally
 * aliased.
 * @example
 * This example shows a query that calculates the average of all the values in a
 * single selected Cell from a joined Table.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'dog'},
 *     lowly: {species: 'worm'},
 *   })
 *   .setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *     worm: {price: 1},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join, group}) => {
 *   select('species', 'price');
 *   // from pets
 *   join('species', 'species');
 *   group('price', 'avg').as('avgPrice');
 * });
 *
 * console.log(queries.getResultTable('query'));
 * // -> {0: {avgPrice: 3.75}}
 * // 2 dogs at 5, 1 cat at 4, 1 worm at 1: a total of 15 for 4 pets
 * ```
 * @example
 * This example shows a query that calculates the average of a two Cell values,
 * aggregated by the two other dimensional 'group by' Cells.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', owner: 'alice'},
 *     felix: {species: 'cat', owner: 'bob'},
 *     cujo: {species: 'dog', owner: 'bob'},
 *     lowly: {species: 'worm', owner: 'alice'},
 *     carnaby: {species: 'parrot', owner: 'bob'},
 *     polly: {species: 'parrot', owner: 'alice'},
 *   })
 *   .setTable('species', {
 *     dog: {price: 5, legs: 4},
 *     cat: {price: 4, legs: 4},
 *     parrot: {price: 3, legs: 2},
 *     worm: {price: 1, legs: 0},
 *   });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, join, group}) => {
 *   select('pets', 'owner'); //    group by
 *   select('species', 'price'); // grouped
 *   // from pets
 *   join('species', 'species');
 *   group(
 *     'price',
 *     (cells) => Math.min(...cells.filter((cell) => cell > 2)),
 *     (current, add) => (add > 2 ? Math.min(current, add) : current),
 *     (current, remove) => (remove == current ? undefined : current),
 *     (current, add, remove) =>
 *       remove == current
 *         ? undefined
 *         : add > 2
 *           ? Math.min(current, add)
 *           : current,
 *   ).as('lowestPriceOver2');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {0: {owner: 'alice', lowestPriceOver2: 3}}
 * // -> {1: {owner: 'bob', lowestPriceOver2: 3}}
 * // Both have a parrot at 3. Alice's worm at 1 is excluded from aggregation.
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// Group
/**
 * The GroupedAs type describes an object returned from calling a Group function
 * so that the grouped Cell Id can be optionally aliased.
 *
 * Note that if two Group clauses are both aliased to the same name (or if you
 * create two groups of the same underlying Cell, both _without_ aliases), only
 * the latter of two will be used in the query.
 * @example
 * This example shows a query that groups the same underlying Cell twice, for
 * different purposes. Both groups are aliased with the 'as' function to
 * disambiguate them.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', price: 5},
 *   felix: {species: 'cat', price: 4},
 *   cujo: {species: 'dog', price: 4},
 *   tom: {species: 'cat', price: 3},
 * });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, group}) => {
 *   select('pets', 'species');
 *   select('pets', 'price');
 *   group('price', 'min').as('minPrice');
 *   group('price', 'max').as('maxPrice');
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {0: {species: 'dog', minPrice: 4, maxPrice: 5}}
 * // -> {1: {species: 'cat', minPrice: 3, maxPrice: 4}}
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// GroupedAs
/**
 * A function that lets you specify an alias for the grouped Cell Id.
 */
/// GroupedAs.as
/**
 * The Having type describes a function that lets you specify conditions to
 * filter results, based on the grouped Cells resulting from a Group clause.
 *
 * The Having function is provided to the third `query` parameter of the
 * setQueryDefinition method.
 *
 * A Having condition has to be true for a Row to be included in the results.
 * Each Having class is additive, as though combined with a logical 'and'. If
 * you wish to create an 'or' expression, use the single parameter version of
 * the type that allows arbitrary programmatic conditions.
 *
 * The Where keyword differs from the Having keyword in that the former
 * describes conditions that should be met by underlying Cell values (whether
 * selected or not), and the latter describes conditions based on calculated and
 * aggregated values - after Group clauses have been applied.
 *
 * Whilst it is technically possible to use a Having clause even if the results
 * have not been grouped with a Group clause, you should expect it to be less
 * performant than using a Where clause, due to that being applied earlier in
 * the query process.
 * @example
 * This example shows a query that filters the results from a grouped Table by
 * comparing a Cell from it with a value.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', price: 5},
 *   felix: {species: 'cat', price: 4},
 *   cujo: {species: 'dog', price: 4},
 *   tom: {species: 'cat', price: 3},
 *   carnaby: {species: 'parrot', price: 3},
 *   polly: {species: 'parrot', price: 3},
 * });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, group, having}) => {
 *   select('pets', 'species');
 *   select('pets', 'price');
 *   group('price', 'min').as('minPrice');
 *   group('price', 'max').as('maxPrice');
 *   having('minPrice', 3);
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {0: {species: 'cat', minPrice: 3, maxPrice: 4}}
 * // -> {1: {species: 'parrot', minPrice: 3, maxPrice: 3}}
 * ```
 * @example
 * This example shows a query that filters the results from a grouped Table with
 * a condition that is calculated from Cell values.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', price: 5},
 *   felix: {species: 'cat', price: 4},
 *   cujo: {species: 'dog', price: 4},
 *   tom: {species: 'cat', price: 3},
 *   carnaby: {species: 'parrot', price: 3},
 *   polly: {species: 'parrot', price: 3},
 * });
 *
 * const queries = createQueries(store);
 * queries.setQueryDefinition('query', 'pets', ({select, group, having}) => {
 *   select('pets', 'species');
 *   select('pets', 'price');
 *   group('price', 'min').as('minPrice');
 *   group('price', 'max').as('maxPrice');
 *   having(
 *     (getSelectedOrGroupedCell) =>
 *       getSelectedOrGroupedCell('minPrice') !=
 *       getSelectedOrGroupedCell('maxPrice'),
 *   );
 * });
 *
 * queries.forEachResultRow('query', (rowId) => {
 *   console.log({[rowId]: queries.getResultRow('query', rowId)});
 * });
 * // -> {0: {species: 'dog', minPrice: 4, maxPrice: 5}}
 * // -> {1: {species: 'cat', minPrice: 3, maxPrice: 4}}
 * // Parrots are filtered out because they have zero range in price.
 * ```
 * @category Definition
 * @since v2.0.0
 */
/// Having
{
  /**
   * Calling this function with two parameters is used to include only those
   * Rows for which a specified Cell in the query's root Table has a specified
   * value.
   * @param selectedOrGroupedCellId The Id of the Cell in the query to test.
   * @param equals The value that the Cell has to have for the Row to be
   * included in the result.
   */
  /// Having.1
  /**
   * Calling this function with one callback parameter is used to include only
   * those Rows which meet a calculated boolean condition.
   * @param condition A callback that takes a GetCell function and that should
   * return `true` for the Row to be included in the result.
   */
  /// Having.2
}
/**
 * A Queries object lets you create and track queries of the data in Store
 * objects.
 *
 * This is useful for creating a reactive view of data that is stored in
 * physical tables: selecting columns, joining tables together, filtering rows,
 * aggregating data, sorting it, and so on.
 *
 * This provides a generalized query concept for Store data. If you just want to
 * create and track metrics, indexes, or relationships between rows, you may
 * prefer to use the dedicated Metrics, Indexes, and Relationships objects,
 * which have simpler APIs.
 *
 * Create a Queries object easily with the createQueries function. From there,
 * you can add new query definitions (with the setQueryDefinition method), query
 * the results (with the getResultTable method, the getResultRow method, the
 * getResultCell method, and so on), and add listeners for when they change
 * (with the addResultTableListener method, the addResultRowListener method, the
 * addResultCellListener method, and so on).
 * @example
 * This example shows a very simple lifecycle of a Queries object: from
 * creation, to adding definitions, getting their contents, and then registering
 * and removing listeners for them.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', color: 'brown', ownerId: '1'},
 *     felix: {species: 'cat', color: 'black', ownerId: '2'},
 *     cujo: {species: 'dog', color: 'black', ownerId: '3'},
 *   })
 *   .setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *     worm: {price: 1},
 *   })
 *   .setTable('owners', {
 *     '1': {name: 'Alice'},
 *     '2': {name: 'Bob'},
 *     '3': {name: 'Carol'},
 *   });
 *
 * const queries = createQueries(store);
 *
 * // A filtered table query:
 * queries.setQueryDefinition('blackPets', 'pets', ({select, where}) => {
 *   select('species');
 *   where('color', 'black');
 * });
 * console.log(queries.getResultTable('blackPets'));
 * // -> {felix: {species: 'cat'}, cujo: {species: 'dog'}}
 *
 * // A joined table query:
 * queries.setQueryDefinition('petOwners', 'pets', ({select, join}) => {
 *   select('owners', 'name').as('owner');
 *   join('owners', 'ownerId');
 * });
 * console.log(queries.getResultTable('petOwners'));
 * // -> {fido: {owner: 'Alice'}, felix: {owner: 'Bob'}, cujo: {owner: 'Carol'}}
 *
 * // A grouped query:
 * queries.setQueryDefinition(
 *   'colorPrice',
 *   'pets',
 *   ({select, join, group}) => {
 *     select('color');
 *     select('species', 'price');
 *     join('species', 'species');
 *     group('price', 'avg');
 *   },
 * );
 * console.log(queries.getResultTable('colorPrice'));
 * // -> {"1": {color: 'black', price: 4.5}, "0": {color: 'brown', price: 5}}
 * console.log(queries.getResultSortedRowIds('colorPrice', 'price', true));
 * // -> ["0", "1"]
 *
 * const listenerId = queries.addResultTableListener('colorPrice', () => {
 *   console.log('Average prices per color changed');
 *   console.log(queries.getResultTable('colorPrice'));
 *   console.log(queries.getResultSortedRowIds('colorPrice', 'price', true));
 * });
 *
 * store.setRow('pets', 'lowly', {species: 'worm', color: 'brown'});
 * // -> 'Average prices per color changed'
 * // -> {"0": {color: 'brown', price: 3}, "1": {color: 'black', price: 4.5}}
 * // -> ["1", "0"]
 *
 * queries.delListener(listenerId);
 * queries.destroy();
 * ```
 * @see Making Queries guides
 * @see Car Analysis demo
 * @see Movie Database demo
 * @category Queries
 * @since v2.0.0
 */
/// Queries
{
  /**
   * The setQueryDefinition method lets you set the definition of a query.
   *
   * Every query definition is identified by a unique Id, and if you re-use an
   * existing Id with this method, the previous definition is overwritten.
   *
   * A query provides a tabular result formed from each Row within a root Table.
   * The definition must specify this Table (by its Id) to be aggregated. Other
   * Tables can be joined to that using Join clauses.
   *
   * The third `query` parameter is a callback that you provide to define the
   * query. That callback is provided with a `keywords` object that contains the
   * functions you use to define the query, like `select`, `join`, and so on.
   * You can see how that is used in the simple example below. The following
   * five clause types are supported:
   *
   * - The Select type describes a function that lets you specify a Cell or
   *   calculated value for including into the query's result.
   * - The Join type describes a function that lets you specify a Cell or
   *   calculated value to join the main query Table to others, by Row Id.
   * - The Where type describes a function that lets you specify conditions to
   *   filter results, based on the underlying Cells of the main or joined
   *   Tables.
   * - The Group type describes a function that lets you specify that the values
   *   of a Cell in multiple ResultRows should be aggregated together.
   * - The Having type describes a function that lets you specify conditions to
   *   filter results, based on the grouped Cells resulting from a Group clause.
   *
   * Full documentation and examples are provided in the sections for each of
   * those clause types.
   *
   * Additionally, you can use the getResultSortedRowIds method and
   * addResultSortedRowIdsListener method to sort and paginate the results.
   * @param queryId The Id of the query to define.
   * @param tableId The Id of the root Table the query will be based on.
   * @param query A callback which can take a `keywords` object and which uses
     the functions it contains to define the query.
   * @returns A reference to the Queries object.
   * @example
   * This example creates a Store, creates a Queries object, and defines a
   * simple query to select just one column from the Table, for each Row where 
   * the `species` Cell matches as certain value.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   * 
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store);
   * queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *   select('color');
   *   where('species', 'dog');
   * });
   *
   * console.log(queries.getResultTable('dogColors'));
   * // -> {fido: {color: 'brown'}, cujo: {color: 'black'}}
   * ```
   * @category Configuration
   * @since v2.0.0
   */
  /// Queries.setQueryDefinition
  /**
   * The delQueryDefinition method removes an existing query definition.
   * @param queryId The Id of the query to remove.
   * @returns A reference to the Queries object.
   * @example
   * This example creates a Store, creates a Queries object, defines a simple
   * query, and then removes it.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store);
   * queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *   select('color');
   *   where('species', 'dog');
   * });
   * console.log(queries.getQueryIds());
   * // -> ['dogColors']
   *
   * queries.delQueryDefinition('dogColors');
   * console.log(queries.getQueryIds());
   * // -> []
   * ```
   * @category Configuration
   * @since v2.0.0
   */
  /// Queries.delQueryDefinition
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Queries object.
   * @returns A reference to the Store.
   * @example
   * This example creates a Queries object against a newly-created Store and
   * then gets its reference in order to update its data.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const queries = createQueries(createStore());
   * queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *   select('color');
   *   where('species', 'dog');
   * });
   * queries
   *   .getStore()
   *   .setRow('pets', 'fido', {species: 'dog', color: 'brown'});
   * console.log(queries.getResultTable('dogColors'));
   * // -> {fido: {color: 'brown'}}
   * ```
   * @category Getter
   * @since v2.0.0
   */
  /// Queries.getStore
  /**
   * The getQueryIds method returns an array of the query Ids registered with
   * this Queries object.
   * @returns An array of Ids.
   * @example
   * This example creates a Queries object with two definitions, and then gets
   * the Ids of the definitions.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const queries = createQueries(createStore())
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * console.log(queries.getQueryIds());
   * // -> ['dogColors', 'catColors']
   * ```
   * @category Getter
   * @since v2.0.0
   */
  /// Queries.getQueryIds
  /**
   * The forEachQuery method takes a function that it will then call for each
   * Query in the Queries object.
   *
   * This method is useful for iterating over all the queries in a functional
   * style. The `queryCallback` parameter is a QueryCallback function that will
   * be called with the Id of each query.
   * @param queryCallback The function that should be called for every query.
   * @example
   * This example iterates over each query in a Queries object.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const queries = createQueries(createStore())
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * queries.forEachQuery((queryId) => {
   *   console.log(queryId);
   * });
   * // -> 'dogColors'
   * // -> 'catColors'
   * ```
   * @category Iterator
   * @since v2.0.0
   */
  /// Queries.forEachQuery
  /**
   * The hasQuery method returns a boolean indicating whether a given query
   * exists in the Queries object.
   * @param queryId The Id of a possible query in the Queries object.
   * @returns Whether a query with that Id exists.
   * @example
   * This example shows two simple query existence checks.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const queries = createQueries(createStore()).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.hasQuery('dogColors'));
   * // -> true
   * console.log(queries.hasQuery('catColors'));
   * // -> false
   * ```
   * @category Getter
   * @since v2.0.0
   */
  /// Queries.hasQuery
  /**
   * The getTableId method returns the Id of the underlying Table that is
   * backing a query.
   *
   * If the query Id is invalid, the method returns `undefined`.
   * @param queryId The Id of a query.
   * @returns The Id of the Table backing the query, or `undefined`.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent definition) to get the
   * underlying Table Id.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const queries = createQueries(createStore()).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getTableId('dogColors'));
   * // -> 'pets'
   * console.log(queries.getTableId('catColors'));
   * // -> undefined
   * ```
   * @category Getter
   * @since v2.0.0
   */
  /// Queries.getTableId
  /**
   * The getResultTable method returns an object containing the entire data of
   * the ResultTable of the given query.
   *
   * This has the same behavior as a Store's getTable method. For example, if
   * the query Id is invalid, the method returns an empty object. Similarly, it
   * returns a copy of, rather than a reference to the underlying data, so
   * changes made to the returned object are not made to the query results
   * themselves.
   * @param queryId The Id of a query.
   * @returns An object containing the entire data of the ResultTable of the
   * query.
   * @returns The result of the query, structured as a ResultTable.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent definition) to get the
   * ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultTable('dogColors'));
   * // -> {fido: {color: 'brown'}, cujo: {color: 'black'}}
   *
   * console.log(queries.getResultTable('catColors'));
   * // -> {}
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.getResultTable
  /**
   * The getResultTableCellIds method returns the Ids of every ResultCell used
   * across the ResultTable of the given query.
   *
   * This has the same behavior as a Store's getTableCellIds method. For
   * example, if the query Id is invalid, the method returns an empty array.
   * Similarly, it returns a copy of, rather than a reference to the list of
   * Ids, so changes made to the list object are not made to the query results
   * themselves.
   * @param queryId The Id of a query.
   * @returns An array of the Ids of every ResultCell used across the
   * ResultTable of the query.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent definition) to get the
   * ResultCell Ids.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black', legs: 4},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     select('legs');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultTableCellIds('dogColors'));
   * // -> ['color', 'legs']
   *
   * console.log(queries.getResultTableCellIds('catColors'));
   * // -> []
   * ```
   * @category Result
   * @since v4.1.0
   */
  /// Queries.getResultTableCellIds
  /**
   * The getResultRowCount method returns the count of the ResultRow objects in
   * the ResultTable of the given query.
   *
   * This has the same behavior as a Store's getRowCount method. For example, if
   * the query Id is invalid, the method returns zero.
   * @param queryId The Id of a query.
   * @returns The number of ResultRow objects in the result of the query.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent definition) to get the
   * ResultRow count.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultRowCount('dogColors'));
   * // -> 2
   *
   * console.log(queries.getResultRowCount('catColors'));
   * // -> 0
   * ```
   * @category Result
   * @since v4.1.0
   */
  /// Queries.getResultRowCount
  /**
   * The getResultRowIds method returns the Ids of every ResultRow in the
   * ResultTable of the given query.
   *
   * This has the same behavior as a Store's getRowIds method. For example, if
   * the query Id is invalid, the method returns an empty array. Similarly, it
   * returns a copy of, rather than a reference to the list of Ids, so changes
   * made to the list object are not made to the query results themselves.
   * @param queryId The Id of a query.
   * @returns An array of the Ids of every ResultRow in the result of the query.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent definition) to get the
   * ResultRow Ids.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultRowIds('dogColors'));
   * // -> ['fido', 'cujo']
   *
   * console.log(queries.getResultRowIds('catColors'));
   * // -> []
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.getResultRowIds
  /**
   * The getResultSortedRowIds method returns the Ids of every ResultRow in the
   * ResultTable of the given query, sorted according to the values in a
   * specified ResultCell.
   *
   * This has the same behavior as a Store's getSortedRowIds method. For
   * example, if the query Id is invalid, the method returns an empty array.
   * Similarly, the sorting of the rows is alphanumeric, and you can indicate
   * whether it should be in descending order. The `offset` and `limit`
   * parameters are used to paginate results, but default to `0` and `undefined`
   * to return all available ResultRow Ids if not specified.
   *
   * Note that every call to this method will perform the sorting afresh - there
   * is no caching of the results - and so you are advised to memoize the
   * results yourself, especially when the ResultTable is large. For a
   * performant approach to tracking the sorted ResultRow Ids when they change,
   * use the addResultSortedRowIdsListener method.
   * @param queryId The Id of a query.
   * @param cellId The Id of the ResultCell whose values are used for the
   * sorting, or `undefined` to by sort the ResultRow Id itself.
   * @param descending Whether the sorting should be in descending order.
   * @param offset The number of ResultRow Ids to skip for pagination purposes,
   * if any.
   * @param limit The maximum number of ResultRow Ids to return, or `undefined`
   * for all.
   * @returns An array of the sorted Ids of every ResultRow in the result of the
   * query.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent definition) to get the
   * ResultRow Ids.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultSortedRowIds('dogColors', 'color'));
   * // -> ['cujo', 'fido']
   *
   * console.log(queries.getResultSortedRowIds('catColors', 'color'));
   * // -> []
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.getResultSortedRowIds
  /**
   * The getResultRow method returns an object containing the entire data of a
   * single ResultRow in the ResultTable of the given query.
   *
   * This has the same behavior as a Store's getRow method. For example, if the
   * query or ResultRow Id is invalid, the method returns an empty object.
   * Similarly, it returns a copy of, rather than a reference to the underlying
   * data, so changes made to the returned object are not made to the query
   * results themselves.
   * @param queryId The Id of a query.
   * @param rowId The Id of the ResultRow in the ResultTable.
   * @returns An object containing the entire data of the ResultRow in the
   * ResultTable of the query.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent ResultRow Id) to get
   * the ResultRow.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultRow('dogColors', 'fido'));
   * // -> {color: 'brown'}
   *
   * console.log(queries.getResultRow('dogColors', 'felix'));
   * // -> {}
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.getResultRow
  /**
   * The getResultCellIds method returns the Ids of every ResultCell in a given
   * ResultRow, in the ResultTable of the given query.
   *
   * This has the same behavior as a Store's getCellIds method. For example, if
   * the query Id or ResultRow Id is invalid, the method returns an empty array.
   * Similarly, it returns a copy of, rather than a reference to the list of
   * Ids, so changes made to the list object are not made to the query results
   * themselves.
   * @param queryId The Id of a query.
   * @param rowId The Id of the ResultRow in the ResultTable.
   * @returns An array of the Ids of every ResultCell in the ResultRow in the
   * result of the query.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent ResultRow Id) to get the
   * ResultCell Ids.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultCellIds('dogColors', 'fido'));
   * // -> ['color']
   *
   * console.log(queries.getResultCellIds('dogColors', 'felix'));
   * // -> []
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.getResultCellIds
  /**
   * The getResultCell method returns the value of a single ResultCell in a
   * given ResultRow, in the ResultTable of the given query.
   *
   * This has the same behavior as a Store's getCell method. For example, if the
   * query, or ResultRow, or ResultCell Id is invalid, the method returns
   * `undefined`.
   * @param queryId The Id of a query.
   * @param rowId The Id of the ResultRow in the ResultTable.
   * @param cellId The Id of the ResultCell in the ResultRow.
   * @returns The value of the ResultCell, or `undefined`.
   * @example
   * This example creates a Queries object, a single query definition, and then
   * calls this method on it (as well as a non-existent ResultCell Id) to get
   * the ResultCell.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.getResultCell('dogColors', 'fido', 'color'));
   * // -> 'brown'
   *
   * console.log(queries.getResultCell('dogColors', 'fido', 'species'));
   * // -> undefined
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.getResultCell
  /**
   * The hasResultTable method returns a boolean indicating whether a given
   * ResultTable exists.
   * @param queryId The Id of a possible query.
   * @returns Whether a ResultTable for that query Id exists.
   * @example
   * This example shows two simple ResultTable existence checks.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.hasResultTable('dogColors'));
   * // -> true
   * console.log(queries.hasResultTable('catColors'));
   * // -> false
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.hasResultTable
  /**
   * The hasResultRow method returns a boolean indicating whether a given
   * ResultRow exists.
   * @param queryId The Id of a possible query.
   * @param rowId The Id of a possible ResultRow.
   * @returns Whether a ResultRow for that Id exists.
   * @example
   * This example shows two simple ResultRow existence checks.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.hasResultRow('dogColors', 'fido'));
   * // -> true
   * console.log(queries.hasResultRow('dogColors', 'felix'));
   * // -> false
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.hasResultRow
  /**
   * The hasResultCell method returns a boolean indicating whether a given
   * ResultCell exists.
   * @param queryId The Id of a possible query.
   * @param rowId The Id of a possible ResultRow.
   * @param cellId The Id of a possible ResultCell.
   * @returns Whether a ResultCell for that Id exists.
   * @example
   * This example shows two simple ResultRow existence checks.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * console.log(queries.hasResultCell('dogColors', 'fido', 'color'));
   * // -> true
   * console.log(queries.hasResultCell('dogColors', 'fido', 'species'));
   * // -> false
   * ```
   * @category Result
   * @since v2.0.0
   */
  /// Queries.hasResultCell
  /**
   * The forEachResultTable method takes a function that it will then call for
   * each ResultTable in the Queries object.
   *
   * This method is useful for iterating over all the ResultTables of the
   * queries in a functional style. The `tableCallback` parameter is a
   * ResultTableCallback function that will be called with the Id of each
   * ResultTable, and with a function that can then be used to iterate over each
   * ResultRow of the ResultTable, should you wish.
   * @param tableCallback The function that should be called for every query's
   * ResultTable.
   * @example
   * This example iterates over each query's ResultTable in a Queries object.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * queries.forEachResultTable((queryId, forEachRow) => {
   *   console.log(queryId);
   *   forEachRow((rowId) => console.log(`- ${rowId}`));
   * });
   * // -> 'dogColors'
   * // -> '- fido'
   * // -> '- cujo'
   * // -> 'catColors'
   * // -> '- felix'
   * ```
   * @category Iterator
   * @since v2.0.0
   */
  /// Queries.forEachResultTable
  /**
   * The forEachResultRow method takes a function that it will then call for
   * each ResultRow in the ResultTable of a query.
   *
   * This method is useful for iterating over each ResultRow of the ResultTable
   * of the query in a functional style. The `rowCallback` parameter is a
   * ResultRowCallback function that will be called with the Id of each
   * ResultRow, and with a function that can then be used to iterate over each
   * ResultCell of the ResultRow, should you wish.
   * @param queryId The Id of a query.
   * @param rowCallback The function that should be called for every ResultRow
   * of the query's ResultTable.
   * @example
   * This example iterates over each ResultRow in a query's ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * queries.forEachResultRow('dogColors', (rowId, forEachCell) => {
   *   console.log(rowId);
   *   forEachCell((cellId) => console.log(`- ${cellId}`));
   * });
   * // -> 'fido'
   * // -> '- color'
   * // -> 'cujo'
   * // -> '- color'
   * ```
   * @category Iterator
   * @since v2.0.0
   */
  /// Queries.forEachResultRow
  /**
   * The forEachResultCell method takes a function that it will then call for
   * each ResultCell in the ResultRow of a query.
   *
   * This method is useful for iterating over each ResultCell of the ResultRow
   * of the query in a functional style. The `cellCallback` parameter is a
   * ResultCellCallback function that will be called with the Id and value of
   * each ResultCell.
   * @param queryId The Id of a query.
   * @param rowId The Id of a ResultRow in the query's ResultTable.
   * @param cellCallback The function that should be called for every ResultCell
   * of the query's ResultRow.
   * @example
   * This example iterates over each ResultCell in a query's ResultRow.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('species');
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * queries.forEachResultCell('dogColors', 'fido', (cellId, cell) => {
   *   console.log(`${cellId}: ${cell}`);
   * });
   * // -> 'species: dog'
   * // -> 'color: brown'
   * ```
   * @category Iterator
   * @since v2.0.0
   */
  /// Queries.forEachResultCell
  /**
   * The addQueryIdsListener method registers a listener function with the
   * Queries object that will be called whenever an Query definition is added or
   * removed.
   *
   * The provided listener is a QueryIdsListener function, and will be called
   * with a reference to the Queries object.
   * @param listener The function that will be called whenever a Query
   * definition is added or removed.
   * @example
   * This example creates a Store, a Queries object, and then registers a
   * listener that responds to the addition and the removal of a Query
   * definition.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store);
   * const listenerId = queries.addQueryIdsListener((queries) => {
   *   console.log(queries.getQueryIds());
   * });
   *
   * queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *   select('color');
   *   where('species', 'dog');
   * });
   * // -> ['dogColors']
   * queries.delQueryDefinition('dogColors');
   * // -> []
   *
   * queries.delListener(listenerId);
   * ```
   * @category Listener
   * @since v4.1.0
   */
  /// Queries.addQueryIdsListener
  /**
   * The addResultTableListener method registers a listener function with the
   * Queries object that will be called whenever data in a ResultTable changes.
   *
   * The provided listener is a ResultTableListener function, and will be called
   * with a reference to the Queries object, the Id of the ResultTable that
   * changed (which is also the query Id), and a GetResultCellChange function in
   * case you need to inspect any changes that occurred.
   *
   * You can either listen to a single ResultTable (by specifying a query Id as
   * the method's first parameter) or changes to any ResultTable (by providing a
   * `null` wildcard).
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever data in the
   * matching ResultTable changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultTableListener(
   *   'dogColors',
   *   (queries, tableId, getCellChange) => {
   *     console.log('dogColors result table changed');
   *     console.log(getCellChange('dogColors', 'fido', 'color'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'dogColors result table changed'
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any
   * ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultTableListener(
   *   null,
   *   (queries, tableId) => {
   *     console.log(`${tableId} result table changed`);
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'dogColors result table changed'
   * store.setCell('pets', 'felix', 'color', 'tortoiseshell');
   * // -> 'catColors result table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultTableListener
  /**
   * The addResultTableCellIdsListener method registers a listener function with
   * the Queries object that will be called whenever the Cell Ids that
   * appear anywhere in a ResultTable change.
   *
   * The provided listener is a ResultTableCellIdsListener function, and will be
   * called with a reference to the Queries object and the Id of the ResultTable
   * that changed (which is also the query Id).
   *
   * By default, such a listener is only called when a Cell Id is added
   * to, or removed from, the ResultTable. To listen to all changes in the
   * ResultTable, use the addResultTableListener method.
   *
   * You can either listen to a single ResultTable (by specifying a query Id as
   * the method's first parameter) or changes to any ResultTable (by providing a
   * `null` wildcard).
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the Cell
   * Ids that appear anywhere in the ResultTable change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any change to the
   * Cell Ids of a specific ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColorsAndLegs',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     select('legs');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultTableCellIdsListener(
   *   'dogColorsAndLegs',
   *   (queries) => {
   *     console.log(`Cell Ids for dogColorsAndLegs result table changed`);
   *     console.log(queries.getResultTableCellIds('dogColorsAndLegs'));
   *   },
   * );
   *
   * store.setCell('pets', 'cujo', 'legs', 4);
   * // -> 'Cell Ids for dogColorsAndLegs result table changed'
   * // -> ['color', 'legs']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the
   * ResultCell Ids of any ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black', legs: 4},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColorsAndLegs', 'pets', ({select, where}) => {
   *     select('color');
   *     select('legs');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColorsAndLegs', 'pets', ({select, where}) => {
   *     select('color');
   *     select('legs');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultTableCellIdsListener(
   *   null,
   *   (queries, tableId) => {
   *     console.log(`Cell Ids for ${tableId} result table changed`);
   *   },
   * );
   *
   * store.setCell('pets', 'cujo', 'legs', 4);
   * // -> 'Cell Ids for dogColorsAndLegs result table changed'
   * store.delCell('pets', 'felix', 'legs');
   * // -> 'Cell Ids for catColorsAndLegs result table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultTableCellIdsListener
  /**
   * The addResultRowCountListener method registers a listener function with the
   * Queries object that will be called whenever the count of ResultRow objects
   * in a ResultTable changes.
   *
   * The provided listener is a ResultRowCountListener function, and will be
   * called with a reference to the Queries object, the Id of the ResultTable
   * that changed (which is also the query Id), and the number of ResultRow
   * objects in th ResultTable.
   *
   * You can either listen to a single ResultTable (by specifying a query Id as
   * the method's first parameter) or changes to any ResultTable (by providing a
   * `null` wildcard).
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the number of
   * ResultRow objects in the ResultTable change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to a change in the number
   * of ResultRow objects in a specific ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultRowCountListener(
   *   'dogColors',
   *   (queries, tableId, count) => {
   *     console.log(
   *       'Row count for dogColors result table changed to ' + count,
   *     );
   *   },
   * );
   *
   * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'});
   * // -> 'Row count for dogColors result table changed to 3'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to a change in the number
   * of ResultRow objects any ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultRowCountListener(
   *   null,
   *   (queries, tableId, count) => {
   *     console.log(
   *       `Row count for ${tableId} result table changed to ${count}`,
   *     );
   *   },
   * );
   *
   * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'});
   * // -> 'Row count for dogColors result table changed to 3'
   * store.setRow('pets', 'tom', {species: 'cat', color: 'gray'});
   * // -> 'Row count for catColors result table changed to 2'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v4.1.0
   */
  /// Queries.addResultRowCountListener
  /**
   * The addResultRowIdsListener method registers a listener function with the
   * Queries object that will be called whenever the ResultRow Ids in a
   * ResultTable change.
   *
   * The provided listener is a ResultRowIdsListener function, and will be
   * called with a reference to the Queries object and the Id of the ResultTable
   * that changed (which is also the query Id).
   *
   * By default, such a listener is only called when a ResultRow is added to, or
   * removed from, the ResultTable. To listen to all changes in the ResultTable,
   * use the addResultTableListener method.
   *
   * You can either listen to a single ResultTable (by specifying a query Id as
   * the method's first parameter) or changes to any ResultTable (by providing a
   * `null` wildcard).
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the ResultRow Ids
   * in the ResultTable change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any change to the
   * ResultRow Ids of a specific ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultRowIdsListener(
   *   'dogColors',
   *   (queries) => {
   *     console.log(`Row Ids for dogColors result table changed`);
   *     console.log(queries.getResultRowIds('dogColors'));
   *   },
   * );
   *
   * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'});
   * // -> 'Row Ids for dogColors result table changed'
   * // -> ['fido', 'cujo', 'rex']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the
   * ResultRow Ids of any ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultRowIdsListener(
   *   null,
   *   (queries, tableId) => {
   *     console.log(`Row Ids for ${tableId} result table changed`);
   *   },
   * );
   *
   * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'});
   * // -> 'Row Ids for dogColors result table changed'
   * store.setRow('pets', 'tom', {species: 'cat', color: 'gray'});
   * // -> 'Row Ids for catColors result table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultRowIdsListener
  /**
   * The addResultSortedRowIdsListener method registers a listener function with
   * the Queries object that will be called whenever sorted (and optionally,
   * paginated) ResultRow Ids in a ResultTable change.
   *
   * The provided listener is a ResultSortedRowIdsListener function, and will be
   * called with a reference to the Queries object, the Id of the ResultTable
   * whose ResultRow Ids sorting changed (which is also the query Id), the
   * ResultCell Id being used to sort them, whether descending or not, and the
   * offset and limit of the number of Ids returned, for pagination purposes. It
   * also receives the sorted array of Ids itself, so that you can use them in
   * the listener without the additional cost of an explicit call to the
   * getResultSortedRowIds method.
   *
   * Such a listener is called when a ResultRow is added or removed, but also
   * when a value in the specified ResultCell (somewhere in the ResultTable) has
   * changed enough to change the sorting of the ResultRow Ids.
   *
   * Unlike most other listeners, you cannot provide wildcards (due to the cost
   * of detecting changes to the sorting). You can only listen to a single
   * specified ResultTable, sorted by a single specified ResultCell.
   *
   * The sorting of the rows is alphanumeric, and you can indicate whether it
   * should be in descending order. The `offset` and `limit` parameters are used
   * to paginate results, but default to `0` and `undefined` to return all
   * available ResultRow Ids if not specified.
   * @param queryId The Id of the query to listen to.
   * @param cellId The Id of the ResultCell whose values are used for the
   * sorting, or `undefined` to by sort the ResultRow Id itself.
   * @param descending Whether the sorting should be in descending order.
   * @param offset The number of ResultRow Ids to skip for pagination purposes,
   * if any.
   * @param limit The maximum number of ResultRow Ids to return, or `undefined`
   * for all.
   * @param listener The function that will be called whenever the sorted
   * ResultRow Ids in the ResultTable change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any change to the sorted
   * ResultRow Ids of a specific ResultTable.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultSortedRowIdsListener(
   *   'dogColors',
   *   'color',
   *   false,
   *   0,
   *   undefined,
   *   (queries, tableId, cellId, descending, offset, limit, sortedRowIds) => {
   *     console.log(`Sorted row Ids for dogColors result table changed`);
   *     console.log(sortedRowIds);
   *     // ^ cheaper than calling getResultSortedRowIds again
   *   },
   * );
   *
   * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'});
   * // -> 'Sorted row Ids for dogColors result table changed'
   * // -> ['cujo', 'fido', 'rex']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the sorted
   * ResultRow Ids of a specific ResultTable. The ResultRow Ids are sorted by
   * their own value, since the `cellId` parameter is explicitly undefined.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   * console.log(queries.getResultSortedRowIds('dogColors', undefined));
   * // -> ['cujo', 'fido']
   *
   * const listenerId = queries.addResultSortedRowIdsListener(
   *   'dogColors',
   *   undefined,
   *   false,
   *   0,
   *   undefined,
   *   (queries, tableId, cellId, descending, offset, limit, sortedRowIds) => {
   *     console.log(`Sorted row Ids for dogColors result table changed`);
   *     console.log(sortedRowIds);
   *     // ^ cheaper than calling getSortedRowIds again
   *   },
   * );
   *
   * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'});
   * // -> 'Sorted row Ids for dogColors result table changed'
   * // -> ['cujo', 'fido', 'rex']
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultSortedRowIdsListener
  /**
   * The addResultRowListener method registers a listener function with the
   * Queries object that will be called whenever data in a ResultRow changes.
   *
   * The provided listener is a ResultRowListener function, and will be called
   * with a reference to the Queries object, the Id of the ResultTable that
   * changed (which is also the query Id), and a GetResultCellChange function in
   * case you need to inspect any changes that occurred.
   *
   * You can either listen to a single ResultRow (by specifying a query Id and
   * ResultRow Id as the method's first two parameters) or changes to any
   * ResultRow (by providing `null` wildcards).
   *
   * Both, either, or neither of the `queryId` and `rowId` parameters can be
   * wildcarded with `null`. You can listen to a specific ResultRow in a
   * specific query, any ResultRow in a specific query, a specific ResultRow in
   * any query, or any ResultRow in any query.
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param rowId The Id of the ResultRow to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever data in the
   * matching ResultRow changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific ResultRow.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultRowListener(
   *   'dogColors',
   *   'fido',
   *   (queries, tableId, rowId, getCellChange) => {
   *     console.log('fido row in dogColors result table changed');
   *     console.log(getCellChange('dogColors', 'fido', 'color'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'fido row in dogColors result table changed'
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any
   * ResultRow.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultRowListener(
   *   null,
   *   null,
   *   (queries, tableId, rowId) => {
   *     console.log(`${rowId} row in ${tableId} result table changed`);
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'fido row in dogColors result table changed'
   * store.setCell('pets', 'felix', 'color', 'tortoiseshell');
   * // -> 'felix row in catColors result table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultRowListener
  /**
   * The addResultCellIdsListener method registers a listener function with the
   * Queries object that will be called whenever the ResultCell Ids in a
   * ResultRow change.
   *
   * The provided listener is a ResultCellIdsListener function, and will be
   * called with a reference to the Queries object, the Id of the ResultTable
   * (which is also the query Id), and the Id of the ResultRow that changed.
   *
   * Such a listener is only called when a ResultCell is added to, or removed
   * from, the ResultRow. To listen to all changes in the ResultRow, use the
   * addResultRowListener method.
   *
   * You can either listen to a single ResultRow (by specifying the query Id and
   * ResultRow Id as the method's first two parameters) or changes to any
   * ResultRow (by providing `null` wildcards).
   *
   * Both, either, or neither of the `queryId` and `rowId` parameters can be
   * wildcarded with `null`. You can listen to a specific ResultRow in a
   * specific query, any ResultRow in a specific query, a specific ResultRow in
   * any query, or any ResultRow in any query.
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param rowId The Id of the ResultRow to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the ResultCell
   * Ids in the ResultRow change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any change to the
   * ResultCell Ids of a specific ResultRow.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     select('price');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultCellIdsListener(
   *   'dogColors',
   *   'fido',
   *   (queries) => {
   *     console.log(`Cell Ids for fido row in dogColors result table changed`);
   *     console.log(queries.getResultCellIds('dogColors', 'fido'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'price', 5);
   * // -> 'Cell Ids for fido row in dogColors result table changed'
   * // -> ['color', 'price']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the
   * ResultCell Ids of any ResultRow.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     select('price');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     select('purrs');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultCellIdsListener(
   *   null,
   *   null,
   *   (queries, tableId, rowId) => {
   *     console.log(
   *       `Cell Ids for ${rowId} row in ${tableId} result table changed`,
   *     );
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'price', 5);
   * // -> 'Cell Ids for fido row in dogColors result table changed'
   * store.setCell('pets', 'felix', 'purrs', true);
   * // -> 'Cell Ids for felix row in catColors result table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultCellIdsListener
  /**
   * The addResultCellListener method registers a listener function with the
   * Queries object that will be called whenever data in a ResultCell changes.
   *
   * The provided listener is a ResultCellListener function, and will be called
   * with a reference to the Queries object, the Id of the ResultTable that
   * changed (which is also the query Id), the Id of the ResultRow that changed,
   * the Id of the ResultCell that changed, the new ResultCell value, the old
   * ResultCell value, and a GetResultCellChange function in case you need to
   * inspect any changes that occurred.
   *
   * You can either listen to a single ResultRow (by specifying a query Id,
   * ResultRow Id, and ResultCell Id as the method's first three parameters) or
   * changes to any ResultCell (by providing `null` wildcards).
   *
   * All, some, or none of the `queryId`, `rowId`, and `cellId` parameters can
   * be wildcarded with `null`. You can listen to a specific ResultCell in a
   * specific ResultRow in a specific query, any ResultCell in any ResultRow in
   * any query, for example - or every other combination of wildcards.
   * @param queryId The Id of the query to listen to, or `null` as a wildcard.
   * @param rowId The Id of the ResultRow to listen to, or `null` as a wildcard.
   * @param cellId The Id of the ResultCell to listen to, or `null` as a
   * wildcard.
   * @param listener The function that will be called whenever data in the
   * matching ResultCell changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific ResultCell.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'dogColors',
   *   'pets',
   *   ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   },
   * );
   *
   * const listenerId = queries.addResultCellListener(
   *   'dogColors',
   *   'fido',
   *   'color',
   *   (queries, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
   *     console.log(
   *       'color cell in fido row in dogColors result table changed',
   *     );
   *     console.log([oldCell, newCell]);
   *     console.log(getCellChange('dogColors', 'fido', 'color'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'color cell in fido row in dogColors result table changed'
   * // -> ['brown', 'walnut']
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any
   * ResultCell.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown', price: 5},
   *   felix: {species: 'cat', color: 'black', price: 4},
   *   cujo: {species: 'dog', color: 'black', price: 5},
   * });
   *
   * const queries = createQueries(store)
   *   .setQueryDefinition('dogColors', 'pets', ({select, where}) => {
   *     select('color');
   *     where('species', 'dog');
   *   })
   *   .setQueryDefinition('catColors', 'pets', ({select, where}) => {
   *     select('color');
   *     select('price');
   *     where('species', 'cat');
   *   });
   *
   * const listenerId = queries.addResultCellListener(
   *   null,
   *   null,
   *   null,
   *   (queries, tableId, rowId, cellId) => {
   *     console.log(
   *       `${cellId} cell in ${rowId} row in ${tableId} result table changed`,
   *     );
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'color cell in fido row in dogColors result table changed'
   * store.setCell('pets', 'felix', 'price', 3);
   * // -> 'price cell in felix row in catColors result table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.addResultCellListener
  /**
   * The delListener method removes a listener that was previously added to the
   * Queries object.
   *
   * Use the Id returned by the addMetricListener method. Note that the Queries
   * object may re-use this Id for future listeners added to it.
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the Queries object.
   * @example
   * This example creates a Store, a Queries object, registers a listener, and
   * then removes it.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const queries = createQueries(store).setQueryDefinition(
   *   'species',
   *   'pets',
   *   ({select}) => {
   *     select('species');
   *   },
   * );
   *
   * const listenerId = queries.addResultTableListener('species', () =>
   *   console.log('species result changed'),
   * );
   *
   * store.setCell('pets', 'ed', 'species', 'horse');
   * // -> 'species result changed'
   *
   * queries.delListener(listenerId);
   *
   * store.setCell('pets', 'molly', 'species', 'cow');
   * // -> undefined
   * // The listener is not called.
   * ```
   * @category Listener
   * @since v2.0.0
   */
  /// Queries.delListener
  /**
   * The destroy method should be called when this Queries object is no longer
   * used.
   *
   * This guarantees that all of the listeners that the object registered with
   * the underlying Store are removed and it can be correctly garbage collected.
   * @example
   * This example creates a Store, adds a Queries object with a definition (that
   * registers a RowListener with the underlying Store), and then destroys it
   * again, removing the listener.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const queries = createQueries(store);
   * queries.setQueryDefinition('species', 'species', ({select}) => {
   *   select('species');
   * });
   * console.log(store.getListenerStats().row);
   * // -> 1
   *
   * queries.destroy();
   *
   * console.log(store.getListenerStats().row);
   * // -> 0
   * ```
   * @category Lifecycle
   * @since v2.0.0
   */
  /// Queries.destroy
  /**
   * The getListenerStats method provides a set of statistics about the
   * listeners registered with the Queries object, and is used for debugging
   * purposes.
   *
   * The method is intended to be used during development to ensure your
   * application is not leaking listener registrations, for example.
   * @returns A QueriesListenerStats object containing Queries listener
   * statistics.
   * @example
   * This example gets the listener statistics of a Queries object.
   *
   * ```js
   * import {createQueries, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const queries = createQueries(store);
   * queries.addResultTableListener(null, () => console.log('Result changed'));
   *
   * console.log(queries.getListenerStats().table);
   * // -> 1
   * console.log(queries.getListenerStats().row);
   * // -> 0
   * ```
   * @category Development
   * @since v2.0.0
   */
  /// Queries.getListenerStats
}
/**
 * The createQueries function creates a Queries object, and is the main entry
 * point into the queries module.
 *
 * A given Store can only have one Queries object associated with it. If you
 * call this function twice on the same Store, your second call will return a
 * reference to the Queries object created by the first.
 * @param store The Store for which to register query definitions.
 * @returns A reference to the new Queries object.
 * @example
 * This example creates a Queries object.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const queries = createQueries(store);
 * console.log(queries.getQueryIds());
 * // -> []
 * ```
 * @example
 * This example creates a Queries object, and calls the method a second time
 * for the same Store to return the same object.
 *
 * ```js
 * import {createQueries, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const queries1 = createQueries(store);
 * const queries2 = createQueries(store);
 * console.log(queries1 === queries2);
 * // -> true
 * ```
 * @category Creation
 * @since v2.0.0
 */
/// createQueries
