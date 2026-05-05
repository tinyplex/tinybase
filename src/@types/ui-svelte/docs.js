/**
 * The ui-svelte module of the TinyBase project provides reactive functions,
 * listener functions, and components to make it easy to create reactive Svelte
 * 5 apps with Store objects.
 *
 * The reactive functions in this module provide access to the data and
 * structures exposed by other modules in the project. They return reactive
 * objects with a `current` property. Those functions register listeners such
 * that components using them re-render when data changes.
 *
 * The components in this module provide a further abstraction over those
 * reactive functions, and use Svelte snippet props to customize rendering in an
 * idiomatic way.
 *
 * Functions like the getStore function and getMetrics function return TinyBase
 * objects directly from Provider context. Functions like the getCell function,
 * the getRow function, the getTable function, the getValue function, and the
 * hasCell function return reactive objects whose `current` property reflects
 * underlying TinyBase data.
 *
 * Function parameters accept either plain values or reactive getter functions
 * (as per the MaybeGetter type), so passing `() => tableId` from a `let`-bound
 * Svelte prop makes the function re-execute whenever the prop changes.
 * @see Building UIs With Svelte guide
 * @see Hello World (Svelte) demo
 * @see Countries (Svelte) demo
 * @packageDocumentation
 * @module ui-svelte
 * @since v8.1.0
 */
/// ui-svelte
/**
 * The MaybeGetter type represents a value that can be provided either as a
 * plain value or as a reactive getter function.
 *
 * When a getter function is provided to a reactive function, its internal
 * `$effect` will re-run whenever the getter's reactive dependencies change.
 * This is the mechanism that makes Svelte 5 props reactive in these functions.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.MaybeGetter
/**
 * The StoreOrStoreId type is used when you need to refer to a Store in a
 * ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the Store.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Store objects into a context that can be used throughout the app. In
 * this case you will want to refer to a Store by its Id in that context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.StoreOrStoreId
/**
 * The MetricsOrMetricsId type is used when you need to refer to a Metrics
 * object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the Metrics
 * object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Metrics objects into a context that can be used throughout the app.
 * In this case you will want to refer to a Metrics object by its Id in that
 * context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Metrics object or its
 * Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.MetricsOrMetricsId
/**
 * The IndexesOrIndexesId type is used when you need to refer to an Indexes
 * object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the Indexes
 * object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Indexes objects into a context that can be used throughout the app.
 * In this case you will want to refer to an Indexes object by its Id in that
 * context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Indexes object or its
 * Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.IndexesOrIndexesId
/**
 * The RelationshipsOrRelationshipsId type is used when you need to refer to a
 * Relationships object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the
 * Relationships object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Relationships objects into a context that can be used throughout the
 * app. In this case you will want to refer to a Relationships object by its Id
 * in that context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Relationships object
 * or its Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.RelationshipsOrRelationshipsId
/**
 * The QueriesOrQueriesId type is used when you need to refer to a Queries
 * object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the Queries
 * object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Queries objects into a context that can be used throughout the app.
 * In this case you will want to refer to a Queries object by its Id in that
 * context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Queries object or its
 * Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.QueriesOrQueriesId
/**
 * The CheckpointsOrCheckpointsId type is used when you need to refer to a
 * Checkpoints object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the
 * Checkpoints object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Checkpoints objects into a context that can be used throughout the
 * app. In this case you will want to refer to a Checkpoints object by its Id in
 * that context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Checkpoints object or
 * its Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.CheckpointsOrCheckpointsId
/**
 * The PersisterOrPersisterId type is used when you need to refer to a Persister
 * object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the
 * Persister object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Persister objects into a context that can be used throughout the
 * app. In this case you will want to refer to a Persister object by its Id in
 * that context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Persister or its Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.PersisterOrPersisterId
/**
 * The SynchronizerOrSynchronizerId type is used when you need to refer to a
 * Synchronizer object in a ui-svelte function or component.
 *
 * In some simple cases you will already have a direct reference to the
 * Synchronizer object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Synchronizer objects into a context that can be used throughout the
 * app. In this case you will want to refer to a Synchronizer object by its Id
 * in that context.
 *
 * Many functions and components in this ui-svelte module take this type as a
 * parameter or a prop, allowing you to pass in either the Synchronizer or its
 * Id.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.SynchronizerOrSynchronizerId
/**
 * ProviderProps props are used with the Provider component, so that Store,
 * Metrics, Indexes, Relationships, Queries, Checkpoints, Persisters, and
 * Synchronizers can be passed into the context of a Svelte 5 application and
 * used throughout.
 *
 * One of each type of object can be provided as a default within the context.
 * Additionally, multiple of each type of object can be provided in an Id-keyed
 * map to the `___ById` props.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ProviderProps
{
  /**
   * A default single Store object that will be available within the Provider
   * context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.store
  /**
   * An object containing multiple Store objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.storesById
  /**
   * A default single Metrics object that will be available within the Provider
   * context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.metrics
  /**
   * An object containing multiple Metrics objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.metricsById
  /**
   * A default single Indexes object that will be available within the Provider
   * context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.indexes
  /**
   * An object containing multiple Indexes objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.indexesById
  /**
   * A default single Relationships object that will be available within the
   * Provider context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.relationships
  /**
   * An object containing multiple Relationships objects that will be available
   * within the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.relationshipsById
  /**
   * A default single Queries object that will be available within the Provider
   * context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.queries
  /**
   * An object containing multiple Queries objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.queriesById
  /**
   * A default single Checkpoints object that will be available within the
   * Provider context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.checkpoints
  /**
   * An object containing multiple Checkpoints objects that will be available
   * within the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.checkpointsById
  /**
   * A default single Persister object that will be available within the
   * Provider context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.persister
  /**
   * An object containing multiple Persister objects that will be available
   * within the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.persistersById
  /**
   * A default single Synchronizer object that will be available within the
   * Provider context.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.synchronizer
  /**
   * An object containing multiple Synchronizer objects that will be available
   * within the Provider context by their Id.
   * @category Prop
   * @since v8.1.0
   */
  /// ui-svelte.ProviderProps.synchronizersById
}
/**
 * CellViewProps props are used for components that refer to a single Cell in a
 * Row, such as the CellView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.CellViewProps
{
  /**
   * The Id of the Table in the Store.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CellViewProps.tableId
  /**
   * The Id of the Row in the Table.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CellViewProps.rowId
  /**
   * The Id of the Cell in the Row to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CellViewProps.cellId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CellViewProps.store
  /**
   * Whether the component should also render the Id of the Cell to assist with
   * debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CellViewProps.debugIds
}
/**
 * ValueViewProps props are used for components that refer to a single Value in
 * a Store, such as the ValueView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ValueViewProps
{
  /**
   * The Id of the Value in the Store to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValueViewProps.valueId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValueViewProps.store
  /**
   * Whether the component should also render the Id of the Value to assist with
   * debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValueViewProps.debugIds
}
/**
 * MetricViewProps props are used for components that refer to a single Metric
 * in a Metrics object, such as the MetricView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.MetricViewProps
{
  /**
   * The Id of the Metric in the Metrics object to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.MetricViewProps.metricId
  /**
   * The Metrics object to be accessed: omit for the default context Metrics
   * object, provide an Id for a named context Metrics object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.MetricViewProps.metrics
  /**
   * Whether the component should also render the Id of the Metric to assist
   * with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.MetricViewProps.debugIds
}
/**
 * CheckpointViewProps props are used for components that refer to a single
 * checkpoint in a Checkpoints object, such as the CheckpointView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.CheckpointViewProps
{
  /**
   * The Id of the checkpoint in the Checkpoints object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CheckpointViewProps.checkpointId
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CheckpointViewProps.checkpoints
  /**
   * Whether the component should also render the Id of the checkpoint to assist
   * with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CheckpointViewProps.debugIds
}
/**
 * RowViewProps props are used for components that refer to a single Row in a
 * Table, such as the RowView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.RowViewProps
{
  /**
   * The Id of the Table in the Store.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.tableId
  /**
   * The Id of the Row in the Table to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.rowId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.store
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Row's Cells in a given order.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.customCellIds
  /**
   * A component or string to separate each rendered Cell.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.separator
  /**
   * Whether the component should also render the Id of the Row, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.debugIds
  /**
   * A snippet for rendering each Cell in the Row, to override the default
   * CellView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RowViewProps.cell
}
/**
 * TableViewProps props are used for components that refer to a single Table in
 * a Store, such as the TableView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.TableViewProps
{
  /**
   * The Id of the Table in the Store to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TableViewProps.tableId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TableViewProps.store
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Table's Cells in a given order for each Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TableViewProps.customCellIds
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TableViewProps.separator
  /**
   * Whether the component should also render the Id of the Table, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TableViewProps.debugIds
  /**
   * A snippet for rendering each Row in the Table, to override the default
   * RowView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TableViewProps.row
}
/**
 * SortedTableViewProps props are used for components that refer to a single
 * sorted Table in a Store, such as the SortedTableView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.SortedTableViewProps
{
  /**
   * The Id of the Table in the Store to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.tableId
  /**
   * The Id of the Cell whose values are used for sorting. If omitted, the view
   * will sort the Row Id itself.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.cellId
  /**
   * Whether the sorting should be in descending order.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.descending
  /**
   * The number of Row Ids to skip for pagination purposes.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.offset
  /**
   * The maximum number of Row Ids to return.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.limit
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.store
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * sorted Table's Cells in a given order.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.customCellIds
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.separator
  /**
   * Whether the component should also render the Id of the Table, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.debugIds
  /**
   * A snippet for rendering each Row in the sorted Table, to override the
   * default RowView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SortedTableViewProps.row
}
/**
 * TablesViewProps props are used for components that refer to all the Tables in
 * a Store, such as the TablesView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.TablesViewProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TablesViewProps.store
  /**
   * A component or string to separate each rendered Table.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TablesViewProps.separator
  /**
   * Whether the component should also render the Ids of each Table, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TablesViewProps.debugIds
  /**
   * A snippet for rendering each Table in the Store, to override the default
   * TableView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.TablesViewProps.table
}
/**
 * ValuesViewProps props are used for components that refer to all the Values in
 * a Store, such as the ValuesView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ValuesViewProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValuesViewProps.store
  /**
   * A component or string to separate each rendered Value.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValuesViewProps.separator
  /**
   * Whether the component should also render the Ids of each Value to assist
   * with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValuesViewProps.debugIds
  /**
   * A snippet for rendering each Value in the Store, to override the default
   * ValueView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValuesViewProps.value
}
/**
 * IndexViewProps props are used for components that refer to a single Index in
 * an Indexes object, such as the IndexView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.IndexViewProps
{
  /**
   * The Id of the Index in the Indexes object to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.IndexViewProps.indexId
  /**
   * The Indexes object to be accessed: omit for the default context Indexes
   * object, provide an Id for a named context Indexes object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.IndexViewProps.indexes
  /**
   * A component or string to separate each rendered Slice.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.IndexViewProps.separator
  /**
   * Whether the component should also render the Id of the Index, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.IndexViewProps.debugIds
  /**
   * A snippet for rendering each Slice in the Index.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.IndexViewProps.slice
}
/**
 * SliceViewProps props are used for components that refer to a single Slice in
 * an Index object, such as the SliceView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.SliceViewProps
{
  /**
   * The Id of the Index in the Indexes object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SliceViewProps.indexId
  /**
   * The Id of the Slice in the Index to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SliceViewProps.sliceId
  /**
   * The Indexes object to be accessed: omit for the default context Indexes
   * object, provide an Id for a named context Indexes object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SliceViewProps.indexes
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SliceViewProps.separator
  /**
   * Whether the component should also render the Id of the Slice, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SliceViewProps.debugIds
  /**
   * A snippet for rendering each Row in the Slice, to override the default
   * RowView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.SliceViewProps.row
}
/**
 * RemoteRowViewProps props are used for components that refer to a single
 * Relationship in a Relationships object, and where you want to render a remote
 * Row based on a local Row, such as in the RemoteRowView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.RemoteRowViewProps
{
  /**
   * The Id of the Relationship in the Relationships object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RemoteRowViewProps.relationshipId
  /**
   * The Id of the local Row for which to render the remote Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RemoteRowViewProps.localRowId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RemoteRowViewProps.relationships
  /**
   * Whether the component should also render the Id of the Row in the
   * Relationship, and its descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RemoteRowViewProps.debugIds
  /**
   * A snippet for rendering each (remote, local, or linked) Row in the
   * Relationship.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.RemoteRowViewProps.row
}
/**
 * LocalRowsViewProps props are used for components that refer to a single
 * Relationship in a Relationships object, and where you want to render local
 * Rows based on a remote Row, such as the LocalRowsView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.LocalRowsViewProps
{
  /**
   * The Id of the Relationship in the Relationships object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LocalRowsViewProps.relationshipId
  /**
   * The Id of the remote Row for which to render the local Rows.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LocalRowsViewProps.remoteRowId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LocalRowsViewProps.relationships
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LocalRowsViewProps.separator
  /**
   * Whether the component should also render the Id of the Row in the
   * Relationship, and its descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LocalRowsViewProps.debugIds
  /**
   * A snippet for rendering each (remote, local, or linked) Row in the
   * Relationship.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LocalRowsViewProps.row
}
/**
 * LinkedRowsViewProps props are used for components that refer to a single
 * Relationship in a Relationships object, and where you want to render a linked
 * list of Rows starting from a first Row, such as the LinkedRowsView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.LinkedRowsViewProps
{
  /**
   * The Id of the Relationship in the Relationships object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LinkedRowsViewProps.relationshipId
  /**
   * The Id of the first Row in the linked list Relationship.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LinkedRowsViewProps.firstRowId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LinkedRowsViewProps.relationships
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LinkedRowsViewProps.separator
  /**
   * Whether the component should also render the Id of the Row in the
   * Relationship, and its descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LinkedRowsViewProps.debugIds
  /**
   * A snippet for rendering each (remote, local, or linked) Row in the
   * Relationship.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.LinkedRowsViewProps.row
}
/**
 * ResultCellViewProps props are used for components that refer to a single Cell
 * in a Row of a query ResultTable, such as the ResultCellView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultCellViewProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultCellViewProps.queryId
  /**
   * The Id of the Row in the ResultTable.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultCellViewProps.rowId
  /**
   * The Id of the Cell in the Row to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultCellViewProps.cellId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultCellViewProps.queries
  /**
   * Whether the component should also render the Id of the Cell to assist with
   * debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultCellViewProps.debugIds
}
/**
 * ResultRowViewProps props are used for components that refer to a single Row
 * in a query ResultTable, such as the ResultRowView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultRowViewProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultRowViewProps.queryId
  /**
   * The Id of the Row in the ResultTable to be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultRowViewProps.rowId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultRowViewProps.queries
  /**
   * A component or string to separate each rendered Cell.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultRowViewProps.separator
  /**
   * Whether the component should also render the Id of the Row, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultRowViewProps.debugIds
  /**
   * A snippet for rendering each Cell in the Row, to override the default
   * ResultCellView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultRowViewProps.cell
}
/**
 * ResultTableViewProps props are used for components that refer to a single
 * query ResultTable, such as the ResultTableView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultTableViewProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultTableViewProps.queryId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultTableViewProps.queries
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultTableViewProps.separator
  /**
   * Whether the component should also render the Id of the query, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultTableViewProps.debugIds
  /**
   * A snippet for rendering each Row in the Table, to override the default
   * ResultRowView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultTableViewProps.row
}
/**
 * ResultSortedTableViewProps props are used for components that refer to a
 * single sorted query ResultTable, such as the ResultSortedTableView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultSortedTableViewProps
{
  /**
   * The Id of the query in the Queries object for which the sorted ResultTable
   * will be rendered.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.queryId
  /**
   * The Id of the Cell whose values are used for sorting. If omitted, the view
   * will sort the Row Id itself.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.cellId
  /**
   * Whether the sorting should be in descending order.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.descending
  /**
   * The number of Row Ids to skip for pagination purposes.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.offset
  /**
   * The maximum number of Row Ids to return.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.limit
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.queries
  /**
   * A component or string to separate each rendered Row.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.separator
  /**
   * Whether the component should also render the Id of the query, and its
   * descendent objects, to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.debugIds
  /**
   * A snippet for rendering each Row in the Table, to override the default
   * ResultRowView component.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ResultSortedTableViewProps.row
}
/**
 * BackwardCheckpointsViewProps props are used for components that refer to a
 * list of previous checkpoints in a Checkpoints object, such as the
 * BackwardCheckpointsView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.BackwardCheckpointsViewProps
{
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.BackwardCheckpointsViewProps.checkpoints
  /**
   * A component or string to separate each rendered checkpoint.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.BackwardCheckpointsViewProps.separator
  /**
   * Whether the component should also render the Ids of the checkpoints to
   * assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.BackwardCheckpointsViewProps.debugIds
  /**
   * A snippet for rendering each checkpoint in the Checkpoints object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.BackwardCheckpointsViewProps.checkpoint
}
/**
 * ForwardCheckpointsViewProps props are used for components that refer to a
 * list of future checkpoints in a Checkpoints object, such as the
 * ForwardCheckpointsView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ForwardCheckpointsViewProps
{
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ForwardCheckpointsViewProps.checkpoints
  /**
   * A component or string to separate each rendered checkpoint.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ForwardCheckpointsViewProps.separator
  /**
   * Whether the component should also render the Ids of the checkpoints to
   * assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ForwardCheckpointsViewProps.debugIds
  /**
   * A snippet for rendering each checkpoint in the Checkpoints object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ForwardCheckpointsViewProps.checkpoint
}
/**
 * CurrentCheckpointViewProps props are used for components that refer to the
 * current checkpoint in a Checkpoints object, such as the CurrentCheckpointView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.CurrentCheckpointViewProps
{
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CurrentCheckpointViewProps.checkpoints
  /**
   * Whether the component should also render the Id of the current checkpoint
   * to assist with debugging.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CurrentCheckpointViewProps.debugIds
  /**
   * A snippet for rendering the current checkpoint in the Checkpoints object.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.CurrentCheckpointViewProps.checkpoint
}
/**
 * The Provider component wraps part of an application to make TinyBase objects
 * available throughout its component subtree via Svelte context.
 *
 * Store objects, Metrics, Indexes, Relationships, Queries, Checkpoints,
 * Persisters, and Synchronizers can all be provided both as single defaults and
 * as named instances in a `*ById` map.
 *
 * Provider components can be nested and their contexts are merged, so outer
 * defaults and named instances remain visible unless a nearer Provider replaces
 * them.
 * @param props The props for this component.
 * @example
 * This example creates a Provider context with a default Store.
 *
 * ```ts
 * // In a .svelte file:
 * // <Provider store={createStore()}>
 * //   <App />
 * // </Provider>
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.Provider
/**
 * The BackwardCheckpointsView component renders the list of checkpoint Ids that
 * represent backward checkpoints in a Checkpoints object, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the backward checkpoint Ids.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {BackwardCheckpointsView} from 'tinybase/ui-svelte';
 *
 *   export let checkpoints;
 * </script>
 *
 * <BackwardCheckpointsView {checkpoints}>
 *   {#snippet checkpoint(checkpointId)}{checkpointId}{/snippet}
 * </BackwardCheckpointsView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> ''
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.BackwardCheckpointsView
/**
 * The CellView component renders the value of a single Cell in a given Row in a
 * given Table, and registers a listener so that any changes to that result will
 * cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Cell, or nothing if not present.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {CellView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * <CellView tableId="pets" rowId="fido" cellId="species" {store} />
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.CellView
/**
 * The CheckpointView component renders the label of a checkpoint in a
 * Checkpoints object, and registers a listener so that any changes to that
 * result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the checkpoint label.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {CheckpointView} from 'tinybase/ui-svelte';
 *
 *   export let checkpoints;
 * </script>
 *
 * <CheckpointView checkpointId="0" {checkpoints} />
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> ''
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.CheckpointView
/**
 * The CurrentCheckpointView component renders the current checkpoint in a
 * Checkpoints object, and registers a listener so that any changes to that
 * result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the current checkpoint.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {CurrentCheckpointView} from 'tinybase/ui-svelte';
 *
 *   export let checkpoints;
 * </script>
 *
 * <CurrentCheckpointView {checkpoints}>
 *   {#snippet checkpoint(checkpointId)}{checkpointId}{/snippet}
 * </CurrentCheckpointView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.CurrentCheckpointView
/**
 * The ForwardCheckpointsView component renders the list of checkpoint Ids that
 * represent forward checkpoints in a Checkpoints object, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the forward checkpoint Ids.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ForwardCheckpointsView} from 'tinybase/ui-svelte';
 *
 *   export let checkpoints;
 * </script>
 *
 * <ForwardCheckpointsView {checkpoints}>
 *   {#snippet checkpoint(checkpointId)}{checkpointId}{/snippet}
 * </ForwardCheckpointsView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> ''
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ForwardCheckpointsView
/**
 * The IndexView component renders the slices in a named Index, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the slices.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {IndexView} from 'tinybase/ui-svelte';
 *
 *   export let indexes;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <IndexView indexId="bySpecies" {indexes} {separator}>
 *   {#snippet slice(sliceId)}{sliceId}{/snippet}
 * </IndexView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> 'dog cat'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.IndexView
/**
 * The LinkedRowsView component renders the Rows in a linked list Relationship,
 * and registers a listener so that any changes to that result will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the linked Row Ids.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {LinkedRowsView} from 'tinybase/ui-svelte';
 *
 *   export let relationships;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <LinkedRowsView
 *   relationshipId="nextPet"
 *   firstRowId="fido"
 *   {relationships}
 *   {separator}
 * >
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </LinkedRowsView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'nextPet',
 *   'pets',
 *   'pets',
 *   'next',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'fido felix'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.LinkedRowsView
/**
 * The LocalRowsView component renders the local Row Ids for a given remote Row
 * in a Relationship, and registers a listener so that any changes to that
 * result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the local Row Ids.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {LocalRowsView} from 'tinybase/ui-svelte';
 *
 *   export let relationships;
 * </script>
 *
 * <LocalRowsView relationshipId="petSpecies" remoteRowId="dog" {relationships}>
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </LocalRowsView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'fido'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.LocalRowsView
/**
 * The MetricView component renders the value of a named Metric in a Metrics
 * object, and registers a listener so that any changes to that result will
 * cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Metric value.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {MetricView} from 'tinybase/ui-svelte';
 *
 *   export let metrics;
 * </script>
 *
 * <MetricView metricId="petCount" {metrics} />
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'petCount',
 *   'pets',
 *   'count',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * console.log(app.textContent);
 * // -> '2'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.MetricView
/**
 * The RemoteRowView component renders the remote Row Id for a given local Row
 * in a Relationship, and registers a listener so that any changes to that
 * result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the remote Row.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {RemoteRowView} from 'tinybase/ui-svelte';
 *
 *   export let relationships;
 * </script>
 *
 * <RemoteRowView relationshipId="petSpecies" localRowId="fido" {relationships}>
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </RemoteRowView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.RemoteRowView
/**
 * The ResultCellView component renders the value of a single Cell in a given
 * Result Row in a given Result Table of a Queries object, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the result Cell.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ResultCellView} from 'tinybase/ui-svelte';
 *
 *   export let queries;
 * </script>
 *
 * <ResultCellView queryId="petColors" rowId="fido" cellId="color" {queries} />
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'brown'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ResultCellView
/**
 * The ResultRowView component renders the contents of a single Result Row in a
 * given Result Table, and registers a listener so that any changes to that
 * result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the result Row.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ResultRowView} from 'tinybase/ui-svelte';
 *
 *   export let queries;
 * </script>
 *
 * <ResultRowView queryId="petColors" rowId="fido" {queries}>
 *   {#snippet cell(cellId)}{cellId}{/snippet}
 * </ResultRowView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'color'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ResultRowView
/**
 * The ResultSortedTableView component renders the contents of a single sorted
 * Result Table in a Queries object, and registers a listener so that any
 * changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the sorted result Table.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ResultSortedTableView} from 'tinybase/ui-svelte';
 *
 *   export let queries;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <ResultSortedTableView
 *   queryId="petColors"
 *   cellId="color"
 *   {queries}
 *   {separator}
 * >
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </ResultSortedTableView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'felix fido'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ResultSortedTableView
/**
 * The ResultTableView component renders the contents of a single Result Table
 * in a Queries object, and registers a listener so that any changes to that
 * result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the result Table.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ResultTableView} from 'tinybase/ui-svelte';
 *
 *   export let queries;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <ResultTableView queryId="petColors" {queries} {separator}>
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </ResultTableView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'fido felix'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ResultTableView
/**
 * The RowView component renders the contents of a single Row in a given Table,
 * and registers a listener so that any changes to that result will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the Row, or nothing if not present.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {RowView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * <RowView tableId="pets" rowId="fido" {store} customCellIds={['species']} />
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.RowView
/**
 * The SliceView component renders the Row Ids in a named Slice in an Index, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the Rows in the Slice.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {SliceView} from 'tinybase/ui-svelte';
 *
 *   export let indexes;
 * </script>
 *
 * <SliceView indexId="bySpecies" sliceId="dog" {indexes}>
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </SliceView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> 'fido'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.SliceView
/**
 * The SortedTableView component renders the contents of a single Table in a
 * sorted order, and registers a listener so that any changes to that result
 * will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the sorted Table.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {SortedTableView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <SortedTableView tableId="pets" cellId="sold" {store} {separator}>
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </SortedTableView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'fido felix'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.SortedTableView
/**
 * The TableView component renders the contents of a single Table, and registers
 * a listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Table.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {TableView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <TableView tableId="pets" {store} {separator}>
 *   {#snippet row(rowId)}{rowId}{/snippet}
 * </TableView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'fido felix'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.TableView
/**
 * The TablesView component renders the contents of all Tables in a Store, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of all Tables.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {TablesView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <TablesView {store} {separator}>
 *   {#snippet table(tableId)}{tableId}{/snippet}
 * </TablesView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'pets species'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.TablesView
/**
 * The ValueView component renders the value of a single Value in a Store, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the Value, or nothing if not present.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ValueView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * <ValueView valueId="open" {store} />
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ValueView
/**
 * The ValuesView component renders all Values in a Store, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of all Values.
 * @example
 * This example creates TinyBase objects outside the component and renders
 * the Svelte component with them.
 *
 * ```svelte file=App.svelte
 * <script>
 *   import {ValuesView} from 'tinybase/ui-svelte';
 *
 *   export let store;
 * </script>
 *
 * {#snippet separator()}{' '}{/snippet}
 * <ValuesView {store} {separator}>
 *   {#snippet value(valueId)}{valueId}{/snippet}
 * </ValuesView>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'open employees'
 * ```
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ValuesView
/**
 * The hasTables function returns a reactive object indicating whether any
 * Tables exist in the Store, and registers a listener so that any changes to
 * that result will update `current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasTables} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasTables(store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasTables
/**
 * The getTables function returns a reactive object reflecting the Tables in the
 * Store, and registers a listener so that any changes to those Tables will
 * update `current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` Tables property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getTables} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getTables(store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // ->
 * `
 * {
 *   "pets":{
 *     "fido":{
 *       "species":"dog",
 *       "color":"brown",
 *       "sold":false,
 *       "next":"felix"
 *     },
 *     "felix":{
 *       "species":"cat",
 *       "color":"black",
 *       "sold":true
 *     }
 *   },
 *   "species":{
 *     "dog":{
 *       "price":5
 *     },
 *     "cat":{
 *       "price":4
 *     }
 *   }
 * }
 * `;
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getTables
/**
 * The getTableIds function returns a reactive object reflecting the Ids of the
 * Tables in a Store, and registers a listener so that any changes to those Ids
 * will update `current`.
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getTableIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getTableIds(store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["pets","species"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getTableIds
/**
 * The hasTable function returns a reactive object indicating whether a Table
 * exists in the Store, and registers a listener so that any changes to that
 * result will update `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasTable} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasTable('pets', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasTable
/**
 * The getTable function returns a reactive object reflecting a Table in a
 * Store, and registers a listener so that any changes to that Table will update
 * `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Table property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getTable} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getTable('pets', store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // ->
 * `
 * {
 *   "fido":{
 *     "species":"dog",
 *     "color":"brown",
 *     "sold":false,
 *     "next":"felix"
 *   },
 *   "felix":{
 *     "species":"cat",
 *     "color":"black",
 *     "sold":true
 *   }
 * }
 * `;
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getTable
/**
 * The getTableCellIds function returns a reactive object reflecting the Ids of
 * all Cells used across a Table, and registers a listener so that any changes
 * to those Ids will update `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getTableCellIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getTableCellIds('pets', store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["species","color","sold","next"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getTableCellIds
/**
 * The hasTableCell function returns a reactive object indicating whether a
 * particular Cell is used anywhere in a Table, and registers a listener so that
 * any changes to that result will update `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasTableCell} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasTableCell('pets', 'species', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasTableCell
/**
 * The getRowCount function returns a reactive object reflecting the number of
 * Rows in a Table, and registers a listener so that any changes will update
 * `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` number property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRowCount} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getRowCount('pets', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '2'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRowCount
/**
 * The getRowIds function returns a reactive object reflecting the Ids of the
 * Rows in a Table, and registers a listener so that any changes will update
 * `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRowIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getRowIds('pets', store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["fido","felix"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRowIds
/**
 * The getSortedRowIds function returns a reactive object reflecting the sorted
 * Row Ids in a Table, and registers a listener so that any changes will update
 * `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param cellId The Id of the Cell to sort by (or a getter returning it).
 * @param descending Whether to sort descending (or a getter returning it).
 * @param offset The starting Row offset (or a getter returning it).
 * @param limit The maximum number of Rows to return (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSortedRowIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getSortedRowIds('pets', 'sold', false, 0, undefined, store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["fido","felix"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSortedRowIds
/**
 * The hasRow function returns a reactive object indicating whether a Row exists
 * in a Table, and registers a listener so that any changes to that result will
 * update `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasRow} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasRow('pets', 'fido', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasRow
/**
 * The getRow function returns a reactive object reflecting a Row in a Table,
 * and registers a listener so that any changes to that Row will update
 * `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Row property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRow} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getRow('pets', 'fido', store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '{"species":"dog","color":"brown","sold":false,"next":"felix"}'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRow
/**
 * The getCellIds function returns a reactive object reflecting the Ids of the
 * Cells in a Row, and registers a listener so that any changes will update
 * `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCellIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getCellIds('pets', 'fido', store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["species","color","sold","next"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCellIds
/**
 * The hasCell function returns a reactive object indicating whether a Cell
 * exists in a Row in a Table, and registers a listener so that any changes to
 * that result will update `current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasCell} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasCell('pets', 'fido', 'species', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasCell
/**
 * The getCell function returns a reactive object reflecting the value of a Cell
 * in a Row in a Table, and registers a listener so that any changes to that
 * Cell will update `current`.
 *
 * Since Cells are mutable leaf values in a Store, the returned object's
 * `current` property can also be assigned to write back to the Store.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with gettable and settable `current`.
 * @example
 * This example uses the getCell function to display a Cell value reactively.
 *
 * ```ts
 * // In a .svelte file:
 * // const store = createStore().setCell('pets', 'cat', 'name', 'Fido');
 * // const name = getCell('pets', 'cat', 'name', store);
 * // $: console.log(name.current); // 'Fido'
 * ```
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCell} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getCell('pets', 'fido', 'species', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCell
/**
 * The hasValues function returns a reactive object indicating whether any
 * Values exist in the Store, and registers a listener so that any changes to
 * that result will update `current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasValues} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasValues(store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasValues
/**
 * The getValues function returns a reactive object reflecting the Values in the
 * Store, and registers a listener so that any changes will update `current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` Values property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getValues} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getValues(store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '{"open":true,"employees":3}'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getValues
/**
 * The getValueIds function returns a reactive object reflecting the Ids of the
 * Values in a Store, and registers a listener so that any changes will update
 * `current`.
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getValueIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getValueIds(store);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["open","employees"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getValueIds
/**
 * The hasValue function returns a reactive object indicating whether a Value
 * exists in the Store, and registers a listener so that any changes to that
 * result will update `current`.
 * @param valueId The Id of the Value (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {hasValue} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = hasValue('open', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasValue
/**
 * The getValue function returns a reactive object reflecting the value of a
 * Value in a Store, and registers a listener so that any changes to that Value
 * will update `current`.
 *
 * Since Values are mutable leaf values in a Store, the returned object's
 * `current` property can also be assigned to write back to the Store.
 * @param valueId The Id of the Value (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with gettable and settable `current`.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getValue} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   const result = getValue('open', store);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'true'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getValue
/**
 * The getStore function returns the default Store from the current Provider
 * context (or a named Store if an Id is provided).
 * @param id An optional Id of a named Store in the Provider context.
 * @returns The Store, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getStore} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getStore()?.getCell('pets', 'fido', 'species')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {store} = $props();
 * </script>
 *
 * <Provider {store}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getStore
/**
 * The resolveStore function is used to get a reference to a Store object from a
 * Provider context, or have it passed directly.
 * @param storeOrStoreId The Store, its Id, or a getter returning either.
 * @returns A getter function returning the Store, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveStore, getStoreIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolveStore('petStore')()?.getCell('pets', 'fido', 'species')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {store} = $props();
 * </script>
 *
 * <Provider storesById={{petStore: store}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveStore
/**
 * The getStoreIds function returns a reactive object with the Ids of all Stores
 * registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getStoreIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getStoreIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {store} = $props();
 * </script>
 *
 * <Provider storesById={{petStore: store}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * console.log(app.textContent);
 * // -> '["petStore"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getStoreIds
/**
 * The getMetrics function returns the default Metrics object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Metrics object in the Provider context.
 * @returns The Metrics object, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getMetrics} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getMetrics()?.getMetric('petCount')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {metrics} = $props();
 * </script>
 *
 * <Provider {metrics}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'petCount',
 *   'pets',
 *   'count',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * console.log(app.textContent);
 * // -> '1'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getMetrics
/**
 * The resolveMetrics function is used to get a reference to a Metrics object
 * from a Provider context, or have it passed directly.
 * @param metricsOrMetricsId The Metrics object, its Id, or a getter returning
 * either.
 * @returns A getter function returning the Metrics object, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveMetrics, getMetricsIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolveMetrics('petMetrics')()?.getMetric('petCount')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {metrics} = $props();
 * </script>
 *
 * <Provider metricsById={{petMetrics: metrics}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'petCount',
 *   'pets',
 *   'count',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * console.log(app.textContent);
 * // -> '1'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveMetrics
/**
 * The getMetricsIds function returns a reactive object with the Ids of all
 * Metrics objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getMetricsIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getMetricsIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {metrics} = $props();
 * </script>
 *
 * <Provider metricsById={{petMetrics: metrics}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'petCount',
 *   'pets',
 *   'count',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * console.log(app.textContent);
 * // -> '["petMetrics"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getMetricsIds
/**
 * The getMetricIds function returns a reactive object reflecting the Ids of the
 * Metrics in a Metrics object, and registers a listener so that any changes
 * will update `current`.
 * @param metricsOrMetricsId The Metrics object to use, or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getMetricIds} from 'tinybase/ui-svelte';
 *
 *   let {metrics} = $props();
 *
 *   const result = getMetricIds(metrics);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'speciesPrice',
 *   'species',
 *   'sum',
 *   'price',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * console.log(app.textContent);
 * // -> '["speciesPrice"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getMetricIds
/**
 * The getMetric function returns a reactive object reflecting the value of a
 * named Metric in a Metrics object, and registers a listener so that any
 * changes to that Metric will update `current`.
 * @param metricId The Id of the Metric (or a getter returning it).
 * @param metricsOrMetricsId The Metrics object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` number | undefined property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getMetric} from 'tinybase/ui-svelte';
 *
 *   let {metrics} = $props();
 *
 *   const result = getMetric('speciesPrice', metrics);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'speciesPrice',
 *   'species',
 *   'sum',
 *   'price',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * console.log(app.textContent);
 * // -> '9'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getMetric
/**
 * The getIndexes function returns the default Indexes object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Indexes object in the Provider context.
 * @returns The Indexes object, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getIndexes} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getIndexes()?.getSliceRowIds('bySpecies', 'dog')?.join(',')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {indexes} = $props();
 * </script>
 *
 * <Provider {indexes}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> 'fido'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getIndexes
/**
 * The resolveIndexes function is used to get a reference to an Indexes object
 * from a Provider context, or have it passed directly.
 * @param indexesOrIndexesId The Indexes object, its Id, or a getter returning
 * either.
 * @returns A getter function returning the Indexes object, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveIndexes, getIndexesIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolveIndexes('petIndexes')()
 *   ?.getSliceRowIds('bySpecies', 'dog')
 *   ?.join(',')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {indexes} = $props();
 * </script>
 *
 * <Provider indexesById={{petIndexes: indexes}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> 'fido'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveIndexes
/**
 * The getIndexStoreTableId function returns the Store and table Id for a given
 * Indexes object and index Id.
 * @param indexesOrId The Indexes object, its Id, or a getter returning either.
 * @param indexId The Id of the index, or a getter returning it.
 * @returns An object with `store` and `tableId` getter properties.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getIndexStoreTableId} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *
 *   const result = getIndexStoreTableId(indexes, 'bySpecies');
 * </script>
 *
 * {result.tableId}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> 'pets'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getIndexStoreTableId
/**
 * The getIndexesIds function returns a reactive object with the Ids of all
 * Indexes objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getIndexesIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getIndexesIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {indexes} = $props();
 * </script>
 *
 * <Provider indexesById={{petIndexes: indexes}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> '["petIndexes"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getIndexesIds
/**
 * The getIndexIds function returns a reactive object reflecting the Ids of the
 * Indexes in an Indexes object, and registers a listener so that any changes
 * will update `current`.
 * @param indexesOrIndexesId The Indexes object to use, or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getIndexIds} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *
 *   const result = getIndexIds(indexes);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> '["bySpecies"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getIndexIds
/**
 * The getSliceIds function returns a reactive object reflecting the Ids of the
 * Slices in an Index, and registers a listener so that any changes will update
 * `current`.
 * @param indexId The Id of the Index (or a getter returning it).
 * @param indexesOrIndexesId The Indexes object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSliceIds} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *
 *   const result = getSliceIds('bySpecies', indexes);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> '["dog","cat"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSliceIds
/**
 * The getSliceRowIds function returns a reactive object reflecting the Ids of
 * the Rows in a Slice, and registers a listener so that any changes will update
 * `current`.
 * @param indexId The Id of the Index (or a getter returning it).
 * @param sliceId The Id of the Slice (or a getter returning it).
 * @param indexesOrIndexesId The Indexes object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSliceRowIds} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *
 *   const result = getSliceRowIds('bySpecies', 'dog', indexes);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * console.log(app.textContent);
 * // -> '["fido"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSliceRowIds
/**
 * The getQueries function returns the default Queries object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Queries object in the Provider context.
 * @returns The Queries object, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getQueries} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getQueries()?.getResultCell('petSpecies', 'fido', 'species')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {queries} = $props();
 * </script>
 *
 * <Provider {queries}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const queries = createQueries(store).setQueryDefinition(
 *   'petSpecies',
 *   'pets',
 *   ({select}) => select('species'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getQueries
/**
 * The resolveQueries function is used to get a reference to a Queries object
 * from a Provider context, or have it passed directly.
 * @param queriesOrQueriesId The Queries object, its Id, or a getter returning
 * either.
 * @returns A getter function returning the Queries object, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveQueries, getQueriesIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolveQueries('petQueries')()?.getResultCell(
 *   'petSpecies',
 *   'fido',
 *   'species',
 * )}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {queries} = $props();
 * </script>
 *
 * <Provider queriesById={{petQueries: queries}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const queries = createQueries(store).setQueryDefinition(
 *   'petSpecies',
 *   'pets',
 *   ({select}) => select('species'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveQueries
/**
 * The getQueriesIds function returns a reactive object with the Ids of all
 * Queries objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getQueriesIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getQueriesIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {queries} = $props();
 * </script>
 *
 * <Provider queriesById={{petQueries: queries}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const queries = createQueries(store).setQueryDefinition(
 *   'petSpecies',
 *   'pets',
 *   ({select}) => select('species'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '["petQueries"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getQueriesIds
/**
 * The getQueryIds function returns a reactive object reflecting the Ids of the
 * Queries in a Queries object, and registers a listener so that any changes
 * will update `current`.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getQueryIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getQueryIds(queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '["petColors"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getQueryIds
/**
 * The getResultTable function returns a reactive object reflecting a result
 * Table in a Queries object, and registers a listener so that any changes to
 * that result will update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Table property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultTable} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultTable('petColors', queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '{"fido":{"color":"brown"},"felix":{"color":"black"}}'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultTable
/**
 * The getResultTableCellIds function returns a reactive object reflecting the
 * Ids of all Cells used across a result Table, and registers a listener so that
 * any changes will update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultTableCellIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultTableCellIds('petColors', queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '["color"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultTableCellIds
/**
 * The getResultRowCount function returns a reactive object reflecting the
 * number of Rows in a result Table, and registers a listener so that any
 * changes will update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` number property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultRowCount} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultRowCount('petColors', queries);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '2'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultRowCount
/**
 * The getResultRowIds function returns a reactive object reflecting the Ids of
 * the Rows in a result Table, and registers a listener so that any changes will
 * update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultRowIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultRowIds('petColors', queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '["fido","felix"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultRowIds
/**
 * The getResultSortedRowIds function returns a reactive object reflecting the
 * sorted Row Ids in a result Table, and registers a listener so that any
 * changes will update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param cellId The Id of the Cell to sort by (or a getter returning it).
 * @param descending Whether to sort descending (or a getter returning it).
 * @param offset The starting Row offset (or a getter returning it).
 * @param limit The maximum number of Rows (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultSortedRowIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultSortedRowIds(
 * 'petColors', 'color', false, 0, undefined, queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '["felix","fido"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultSortedRowIds
/**
 * The getResultRow function returns a reactive object reflecting a result Row
 * in a result Table, and registers a listener so that any changes will update
 * `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Row property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultRow} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultRow('petColors', 'fido', queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '{"color":"brown"}'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultRow
/**
 * The getResultCellIds function returns a reactive object reflecting the Ids of
 * the Cells in a result Row, and registers a listener so that any changes will
 * update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultCellIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultCellIds('petColors', 'fido', queries);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> '["color"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultCellIds
/**
 * The getResultCell function returns a reactive object reflecting the value of
 * a Cell in a result Row, and registers a listener so that any changes will
 * update `current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or its
 * Id.
 * @returns A reactive object with a `current` Cell | undefined property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getResultCell} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   const result = getResultCell('petColors', 'fido', 'color', queries);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * console.log(app.textContent);
 * // -> 'brown'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getResultCell
/**
 * The getRelationships function returns the default Relationships object from
 * the current Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Relationships object in the Provider
 * context.
 * @returns The Relationships object, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRelationships} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getRelationships()?.getRemoteRowId('petSpecies', 'fido')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {relationships} = $props();
 * </script>
 *
 * <Provider {relationships}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRelationships
/**
 * The resolveRelationships function is used to get a reference to a
 * Relationships object from a Provider context, or have it passed directly.
 * @param relationshipsOrRelationshipsId The Relationships object, its Id, or a
 * getter returning either.
 * @returns A getter function returning the Relationships object, or
 * `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveRelationships, getRelationshipsIds}
 * from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolveRelationships('petRelationships')()
 * ?.getRemoteRowId('petSpecies', 'fido')}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {relationships} = $props();
 * </script>
 *
 * <Provider relationshipsById={{petRelationships: relationships}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveRelationships
/**
 * The getRelationshipsStoreTableIds function returns the Store, local table Id,
 * and remote table Id for a given Relationships object and relationship Id.
 * @param relationshipsOrId The Relationships object, its Id, or a getter
 * returning either.
 * @param relationshipId The Id of the relationship, or a getter returning it.
 * @returns An object with `store`, `localTableId`, and `remoteTableId` getter
 * properties.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRelationshipsStoreTableIds} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *
 *   const result = getRelationshipsStoreTableIds(relationships, 'petSpecies');
 * </script>
 *
 * {result.localTableId + ':' + result.remoteTableId}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'pets:species'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRelationshipsStoreTableIds
/**
 * The getRelationshipsIds function returns a reactive object with the Ids of
 * all Relationships objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRelationshipsIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getRelationshipsIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {relationships} = $props();
 * </script>
 *
 * <Provider relationshipsById={{petRelationships: relationships}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> '["petRelationships"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRelationshipsIds
/**
 * The getRelationshipIds function returns a reactive object reflecting the Ids
 * of the Relationships in a Relationships object, and registers a listener so
 * that any changes will update `current`.
 * @param relationshipsOrRelationshipsId The Relationships object to use, or its
 * Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRelationshipIds} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *
 *   const result = getRelationshipIds(relationships);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> '["petSpecies","nextPet"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRelationshipIds
/**
 * The getRemoteRowId function returns a reactive object reflecting the remote
 * Row Id for a given local Row in a Relationship, and registers a listener so
 * that any changes will update `current`.
 * @param relationshipId The Id of the Relationship (or a getter returning it).
 * @param localRowId The Id of the local Row (or a getter returning it).
 * @param relationshipsOrRelationshipsId The Relationships object to use (plain
 * or getter), or its Id.
 * @returns A reactive object with a `current` Id | undefined property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRemoteRowId} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *
 *   const result = getRemoteRowId('petSpecies', 'fido', relationships);
 * </script>
 *
 * {result.current}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> 'dog'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRemoteRowId
/**
 * The getLocalRowIds function returns a reactive object reflecting the local
 * Row Ids for a given remote Row in a Relationship, and registers a listener so
 * that any changes will update `current`.
 * @param relationshipId The Id of the Relationship (or a getter returning it).
 * @param remoteRowId The Id of the remote Row (or a getter returning it).
 * @param relationshipsOrRelationshipsId The Relationships object to use (plain
 * or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getLocalRowIds} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *
 *   const result = getLocalRowIds('petSpecies', 'dog', relationships);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> '["fido"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getLocalRowIds
/**
 * The getLinkedRowIds function returns a reactive object reflecting the linked
 * Row Ids in a Relationship, and registers a listener so that any changes will
 * update `current`.
 * @param relationshipId The Id of the Relationship (or a getter returning it).
 * @param firstRowId The Id of the first Row (or a getter returning it).
 * @param relationshipsOrRelationshipsId The Relationships object to use (plain
 * or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getLinkedRowIds} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *
 *   const result = getLinkedRowIds('nextPet', 'fido', relationships);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * console.log(app.textContent);
 * // -> '["fido","felix"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getLinkedRowIds
/**
 * The getCheckpoints function returns the default Checkpoints object from the
 * current Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Checkpoints object in the Provider
 * context.
 * @returns The Checkpoints object, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCheckpoints} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getCheckpoints()?.getCheckpointIds())}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {checkpoints} = $props();
 * </script>
 *
 * <Provider {checkpoints}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> '[[],"0",[]]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCheckpoints
/**
 * The resolveCheckpoints function is used to get a reference to a Checkpoints
 * object from a Provider context, or have it passed directly.
 * @param checkpointsOrCheckpointsId The Checkpoints object, its Id, or a getter
 * returning either.
 * @returns A getter function returning the Checkpoints object, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveCheckpoints, getCheckpointsIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(resolveCheckpoints('petCheckpoints')()?.getCheckpointIds())}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {checkpoints} = $props();
 * </script>
 *
 * <Provider checkpointsById={{petCheckpoints: checkpoints}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> '[[],"0",[]]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveCheckpoints
/**
 * The getCheckpointsIds function returns a reactive object with the Ids of all
 * Checkpoints objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCheckpointsIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getCheckpointsIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {checkpoints} = $props();
 * </script>
 *
 * <Provider checkpointsById={{petCheckpoints: checkpoints}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> '["petCheckpoints"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCheckpointsIds
/**
 * The getCheckpointIds function returns a reactive object reflecting the
 * CheckpointIds (backward, current, forward) in a Checkpoints object, and
 * registers a listener so that any changes will update `current`.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use (plain or
 * getter), or its Id.
 * @returns A reactive object with a `current` CheckpointIds property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCheckpointIds} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *
 *   const result = getCheckpointIds(checkpoints);
 * </script>
 *
 * {JSON.stringify(result.current)}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> '[[],"0",[]]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCheckpointIds
/**
 * The getCheckpoint function returns a reactive object reflecting the label of
 * a checkpoint, and registers a listener so that any changes will update
 * `current`.
 * @param checkpointId The Id of the checkpoint (or a getter returning it).
 * @param checkpointsOrCheckpointsId The Checkpoints object to use (plain or
 * getter), or its Id.
 * @returns A reactive object with a `current` string | undefined property.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCheckpoint} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *
 *   const result = getCheckpoint('0', checkpoints);
 * </script>
 *
 * {result.current ?? ''}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> ''
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCheckpoint
/**
 * The createGoBackwardCallback function returns a callback function that, when
 * called, moves the Checkpoints object backward to the previous checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @returns A callback function.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {createGoBackwardCallback} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *
 *   const goBackward = createGoBackwardCallback(checkpoints);
 *   goBackward();
 * </script>
 *
 * {'done'}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> 'done'
 * ```
 * @category Callback
 * @since v8.1.0
 */
/// ui-svelte.createGoBackwardCallback
/**
 * The createGoForwardCallback function returns a callback function that, when
 * called, moves the Checkpoints object forward to the next checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @returns A callback function.
 * @example
 * This example passes a TinyBase object into a Svelte component and reads
 * the reactive object's `current` property.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {createGoForwardCallback} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *
 *   const goForward = createGoForwardCallback(checkpoints);
 *   goForward();
 * </script>
 *
 * {'done'}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * console.log(app.textContent);
 * // -> 'done'
 * ```
 * @category Callback
 * @since v8.1.0
 */
/// ui-svelte.createGoForwardCallback
/**
 * The getPersister function returns the default Persister from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Persister in the Provider context.
 * @returns The Persister, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getPersister} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getPersister()?.getStatus()}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {persister} = $props();
 * </script>
 *
 * <Provider {persister}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import {createCustomPersister} from 'tinybase/persisters';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const persister = createCustomPersister(
 *   store,
 *   async () => undefined,
 *   async () => {},
 *   () => undefined,
 *   () => {},
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {persister}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getPersister
/**
 * The resolvePersister function is used to get a reference to a Persister
 * object from a Provider context, or have it passed directly.
 * @param persisterOrPersisterId The Persister object, its Id, or a getter
 * returning either.
 * @returns A getter function returning the Persister object, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolvePersister, getPersisterIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolvePersister('petPersister')()?.getStatus()}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {persister} = $props();
 * </script>
 *
 * <Provider persistersById={{petPersister: persister}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import {createCustomPersister} from 'tinybase/persisters';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const persister = createCustomPersister(
 *   store,
 *   async () => undefined,
 *   async () => {},
 *   () => undefined,
 *   () => {},
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {persister}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolvePersister
/**
 * The getPersisterIds function returns a reactive object with the Ids of all
 * Persisters registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getPersisterIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getPersisterIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {persister} = $props();
 * </script>
 *
 * <Provider persistersById={{petPersister: persister}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import {createCustomPersister} from 'tinybase/persisters';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const persister = createCustomPersister(
 *   store,
 *   async () => undefined,
 *   async () => {},
 *   () => undefined,
 *   () => {},
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {persister}}));
 * console.log(app.textContent);
 * // -> '["petPersister"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getPersisterIds
/**
 * The getPersisterStatus function returns a reactive object reflecting the
 * status of a Persister, and registers a listener so that any changes will
 * update `current`.
 * @param persisterOrPersisterId The Persister to use, or its Id.
 * @returns A reactive object with a `current` Status property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getPersisterStatus} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getPersisterStatus().current}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {persister} = $props();
 * </script>
 *
 * <Provider {persister}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import {createCustomPersister} from 'tinybase/persisters';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const persister = createCustomPersister(
 *   store,
 *   async () => undefined,
 *   async () => {},
 *   () => undefined,
 *   () => {},
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {persister}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getPersisterStatus
/**
 * The getSynchronizer function returns the default Synchronizer from the
 * current Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Synchronizer in the Provider context.
 * @returns The Synchronizer, or `undefined` if not found.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSynchronizer} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getSynchronizer()?.getStatus()}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {synchronizer} = $props();
 * </script>
 *
 * <Provider {synchronizer}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import App from './App.svelte';
 *
 * const synchronizer = createLocalSynchronizer(createMergeableStore());
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {synchronizer}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSynchronizer
/**
 * The resolveSynchronizer function is used to get a reference to a Synchronizer
 * object from a Provider context, or have it passed directly.
 * @param synchronizerOrSynchronizerId The Synchronizer object, its Id, or a
 * getter returning either.
 * @returns A getter function returning the Synchronizer object, or `undefined`.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {resolveSynchronizer, getSynchronizerIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {resolveSynchronizer('petSynchronizer')()?.getStatus()}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {synchronizer} = $props();
 * </script>
 *
 * <Provider synchronizersById={{petSynchronizer: synchronizer}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import App from './App.svelte';
 *
 * const synchronizer = createLocalSynchronizer(createMergeableStore());
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {synchronizer}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveSynchronizer
/**
 * The getSynchronizerIds function returns a reactive object with the Ids of all
 * Synchronizers registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSynchronizerIds} from 'tinybase/ui-svelte';
 * </script>
 *
 * {JSON.stringify(getSynchronizerIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {synchronizer} = $props();
 * </script>
 *
 * <Provider synchronizersById={{petSynchronizer: synchronizer}}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import App from './App.svelte';
 *
 * const synchronizer = createLocalSynchronizer(createMergeableStore());
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {synchronizer}}));
 * console.log(app.textContent);
 * // -> '["petSynchronizer"]'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSynchronizerIds
/**
 * The getSynchronizerStatus function returns a reactive object reflecting the
 * status of a Synchronizer, and registers a listener so that any changes will
 * update `current`.
 * @param synchronizerOrSynchronizerId The Synchronizer to use, or its Id.
 * @returns A reactive object with a `current` Status property.
 * @example
 * This example reads a TinyBase object from Svelte context inside a child
 * component.
 *
 * ```svelte file=Child.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSynchronizerStatus} from 'tinybase/ui-svelte';
 * </script>
 *
 * {getSynchronizerStatus().current}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Child from './Child.svelte';
 *
 *   let {synchronizer} = $props();
 * </script>
 *
 * <Provider {synchronizer}>
 *   <Child />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import App from './App.svelte';
 *
 * const synchronizer = createLocalSynchronizer(createMergeableStore());
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {synchronizer}}));
 * console.log(app.textContent);
 * // -> '0'
 * ```
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSynchronizerStatus
/**
 * The onHasTables function registers a listener that is called whenever any
 * Tables are added to or removed from the Store. The listener is tied to the
 * component's `$effect` lifecycle and is removed when the component unmounts.
 * @param listener The function to call when table presence changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasTables} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasTables(() => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.delTables();
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasTables
/**
 * The onTables function registers a listener that is called whenever tabular
 * data in the Store changes.
 * @param listener The function to call when Tables change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onTables} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onTables(() => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'felix', 'color', 'white');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onTables
/**
 * The onTableIds function registers a listener that is called whenever the set
 * of Table Ids in the Store changes.
 * @param listener The function to call when Table Ids change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onTableIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onTableIds(() => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setTable('owners', {alice: {name: 'Alice'}});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onTableIds
/**
 * The onHasTable function registers a listener that is called whenever a
 * specified Table is added to or removed from the Store.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param listener The function to call when the Table changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasTable} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasTable('pets', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.delTable('pets');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasTable
/**
 * The onTable function registers a listener that is called whenever data in a
 * specified Table changes.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param listener The function to call when the Table changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onTable} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onTable('pets', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'color', 'white');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onTable
/**
 * The onTableCellIds function registers a listener that is called whenever the
 * Cell Ids used across a Table change.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param listener The function to call when Cell Ids change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onTableCellIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onTableCellIds('pets', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'age', 4);
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onTableCellIds
/**
 * The onHasTableCell function registers a listener that is called whenever a
 * specified Cell Id is added to or removed from across a Table.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param cellId The Id of the Cell to listen to, or `null` to listen to any
 * Cell Id.
 * @param listener The function to call when the Cell Id changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasTableCell} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasTableCell('pets', 'age', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'age', 4);
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasTableCell
/**
 * The onRowCount function registers a listener that is called whenever the
 * count of Rows in a Table changes.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param listener The function to call when the Row count changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onRowCount} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onRowCount('pets', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {species: 'dog'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onRowCount
/**
 * The onRowIds function registers a listener that is called whenever the Row
 * Ids in a Table change.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param listener The function to call when Row Ids change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onRowIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onRowIds('pets', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {species: 'dog'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onRowIds
/**
 * The onSortedRowIds function registers a listener that is called whenever the
 * sorted Row Ids in a Table change.
 * @param tableId The Id of the Table to listen to.
 * @param cellId The Id of the Cell to sort by, or `undefined` for default
 * order.
 * @param descending Whether to sort descending.
 * @param offset The index of the first Row to include.
 * @param limit The maximum number of Rows to include, or `undefined` for all.
 * @param listener The function to call when sorted Row Ids change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onSortedRowIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onSortedRowIds('pets', 'species', false, 0, undefined, () =>
 *  (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {species: 'wolf'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onSortedRowIds
/**
 * The onHasRow function registers a listener that is called whenever a
 * specified Row is added to or removed from a Table.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param rowId The Id of the Row to listen to, or `null` to listen to any Row.
 * @param listener The function to call when the Row changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasRow} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasRow('pets', 'fido', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.delRow('pets', 'fido');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasRow
/**
 * The onRow function registers a listener that is called whenever data in a
 * specified Row changes.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param rowId The Id of the Row to listen to, or `null` to listen to any Row.
 * @param listener The function to call when the Row changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onRow} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onRow('pets', 'fido', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'color', 'white');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onRow
/**
 * The onCellIds function registers a listener that is called whenever the Cell
 * Ids in a Row change.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param rowId The Id of the Row to listen to, or `null` to listen to any Row.
 * @param listener The function to call when Cell Ids change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onCellIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onCellIds('pets', 'fido', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'age', 4);
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onCellIds
/**
 * The onHasCell function registers a listener that is called whenever a
 * specified Cell is added to or removed from a Row.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param rowId The Id of the Row to listen to, or `null` to listen to any Row.
 * @param cellId The Id of the Cell to listen to, or `null` to listen to any
 * Cell.
 * @param listener The function to call when the Cell changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasCell} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasCell('pets', 'fido', 'species', () => (seen = 'changed'),
 * false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.delCell('pets', 'fido', 'species');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasCell
/**
 * The onCell function registers a listener that is called whenever the value of
 * a specified Cell changes.
 * @param tableId The Id of the Table to listen to, or `null` to listen to any
 * Table.
 * @param rowId The Id of the Row to listen to, or `null` to listen to any Row.
 * @param cellId The Id of the Cell to listen to, or `null` to listen to any
 * Cell.
 * @param listener The function to call when the Cell changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onCell} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onCell('pets', 'fido', 'species', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onCell
/**
 * The onHasValues function registers a listener that is called whenever any
 * Values are added to or removed from the Store.
 * @param listener The function to call when value presence changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasValues} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasValues(() => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.delValues();
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasValues
/**
 * The onValues function registers a listener that is called whenever any Values
 * in the Store change.
 * @param listener The function to call when Values change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onValues} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onValues(() => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setValue('open', false);
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onValues
/**
 * The onValueIds function registers a listener that is called whenever the
 * Value Ids in the Store change.
 * @param listener The function to call when Value Ids change.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onValueIds} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onValueIds(() => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setValue('rating', 5);
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onValueIds
/**
 * The onHasValue function registers a listener that is called whenever a
 * specified Value is added to or removed from the Store.
 * @param valueId The Id of the Value to listen to, or `null` to listen to any
 * Value.
 * @param listener The function to call when the Value changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onHasValue} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onHasValue('open', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.delValue('open');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onHasValue
/**
 * The onValue function registers a listener that is called whenever the value
 * of a specified Value changes.
 * @param valueId The Id of the Value to listen to, or `null` to listen to any
 * Value.
 * @param listener The function to call when the Value changes.
 * @param mutator An optional boolean indicating the listener mutates Store
 * data.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onValue} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onValue('open', () => (seen = 'changed'), false, store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setValue('open', false);
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onValue
/**
 * The onStartTransaction function registers a listener that is called at the
 * start of every Store transaction.
 * @param listener The function to call at transaction start.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onStartTransaction} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onStartTransaction(() => (seen = 'changed'), store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onStartTransaction
/**
 * The onWillFinishTransaction function registers a listener called just before
 * a Store transaction completes.
 * @param listener The function to call before transaction end.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onWillFinishTransaction} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onWillFinishTransaction(() => (seen = 'changed'), store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onWillFinishTransaction
/**
 * The onDidFinishTransaction function registers a listener called just after a
 * Store transaction completes.
 * @param listener The function to call after transaction end.
 * @param storeOrStoreId The Store to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onDidFinishTransaction} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *   let seen = $state('');
 *
 *   onDidFinishTransaction(() => (seen = 'changed'), store);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onDidFinishTransaction
/**
 * The onMetric function registers a listener that is called whenever a
 * specified Metric value changes.
 * @param metricId The Id of the Metric to listen to, or `null` to listen to any
 * Metric.
 * @param listener The function to call when the Metric changes.
 * @param metricsOrMetricsId The Metrics object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onMetric} from 'tinybase/ui-svelte';
 *
 *   let {metrics} = $props();
 *   let seen = $state('');
 *
 *   onMetric('petCount', () => (seen = 'changed'), metrics);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'petCount',
 *   'pets',
 *   'count',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {species: 'dog'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onMetric
/**
 * The onSliceIds function registers a listener that is called whenever the
 * Slice Ids in an Index change.
 * @param indexId The Id of the Index to listen to, or `null` to listen to any
 * Index.
 * @param listener The function to call when Slice Ids change.
 * @param indexesOrIndexesId The Indexes object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onSliceIds} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *   let seen = $state('');
 *
 *   onSliceIds('bySpecies', () => (seen = 'changed'), indexes);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * flushSync(() => {
 *   store.setCell('pets', 'rex', 'species', 'lizard');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onSliceIds
/**
 * The onSliceRowIds function registers a listener that is called whenever the
 * Row Ids in a Slice change.
 * @param indexId The Id of the Index to listen to, or `null` to listen to any
 * Index.
 * @param sliceId The Id of the Slice to listen to, or `null` to listen to any
 * Slice.
 * @param listener The function to call when Slice Row Ids change.
 * @param indexesOrIndexesId The Indexes object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onSliceRowIds} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *   let seen = $state('');
 *
 *   onSliceRowIds('bySpecies', 'dog', () => (seen = 'changed'), indexes);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * flushSync(() => {
 *   store.setCell('pets', 'felix', 'species', 'dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onSliceRowIds
/**
 * The onRemoteRowId function registers a listener that is called whenever the
 * remote Row Id for a local Row changes.
 * @param relationshipId The Id of the Relationship, or `null` to listen to any
 * Relationship.
 * @param localRowId The Id of the local Row, or `null` to listen to any local
 * Row.
 * @param listener The function to call when the remote Row Id changes.
 * @param relationshipsOrRelationshipsId The Relationships object to use, or its
 * Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onRemoteRowId} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *   let seen = $state('');
 *
 *   onRemoteRowId('petSpecies', 'fido',
 *  () => (seen = 'changed'), relationships);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'cat');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onRemoteRowId
/**
 * The onLocalRowIds function registers a listener that is called whenever the
 * local Row Ids for a remote Row change.
 * @param relationshipId The Id of the Relationship, or `null` to listen to any
 * Relationship.
 * @param remoteRowId The Id of the remote Row, or `null` to listen to any
 * remote Row.
 * @param listener The function to call when local Row Ids change.
 * @param relationshipsOrRelationshipsId The Relationships object to use, or its
 * Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onLocalRowIds} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *   let seen = $state('');
 *
 *   onLocalRowIds('petSpecies', 'dog',
 *  () => (seen = 'changed'), relationships);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * flushSync(() => {
 *   store.setCell('pets', 'felix', 'species', 'dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onLocalRowIds
/**
 * The onLinkedRowIds function registers a listener that is called whenever the
 * linked Row Ids for a first Row change.
 * @param relationshipId The Id of the Relationship.
 * @param firstRowId The Id of the first Row.
 * @param listener The function to call when linked Row Ids change.
 * @param relationshipsOrRelationshipsId The Relationships object to use, or its
 * Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onLinkedRowIds} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *   let seen = $state('');
 *
 *   onLinkedRowIds('nextPet', 'fido', () => (seen = 'changed'), relationships);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const relationships = createRelationships(store)
 *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
 *   .setRelationshipDefinition('nextPet', 'pets', 'pets', 'next');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'next', 'rex');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onLinkedRowIds
/**
 * The onResultTable function registers a listener that is called whenever the
 * result Table of a query changes.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param listener The function to call when the result Table changes.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultTable} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultTable('petColors', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {color: 'gray'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultTable
/**
 * The onResultTableCellIds function registers a listener that is called
 * whenever the Cell Ids across a result Table change.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param listener The function to call when Cell Ids change.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultTableCellIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultTableCellIds('petColors', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   queries.setQueryDefinition('petColors', 'pets', ({select}) => {
 *     select('color');
 *     select('species');
 *   });
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultTableCellIds
/**
 * The onResultRowCount function registers a listener that is called whenever
 * the count of result Rows changes.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param listener The function to call when the count changes.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultRowCount} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultRowCount('petColors', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {color: 'gray'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultRowCount
/**
 * The onResultRowIds function registers a listener that is called whenever the
 * result Row Ids of a query change.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param listener The function to call when result Row Ids change.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultRowIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultRowIds('petColors', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {color: 'gray'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultRowIds
/**
 * The onResultSortedRowIds function registers a listener that is called
 * whenever the sorted result Row Ids change.
 * @param queryId The Id of the query to listen to.
 * @param cellId The Id of the Cell to sort by, or `undefined` for default
 * order.
 * @param descending Whether to sort descending.
 * @param offset The index of the first Row to include.
 * @param limit The maximum number of Rows to include, or `undefined` for all.
 * @param listener The function to call when sorted Row Ids change.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultSortedRowIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultSortedRowIds('petColors', 'color', false, 0,
 * undefined, () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   store.setRow('pets', 'cujo', {color: 'gray'});
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultSortedRowIds
/**
 * The onResultRow function registers a listener that is called whenever a
 * result Row changes.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param rowId The Id of the result Row to listen to, or `null` to listen to
 * any result Row.
 * @param listener The function to call when the result Row changes.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultRow} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultRow('petColors', 'fido', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'color', 'white');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultRow
/**
 * The onResultCellIds function registers a listener that is called whenever the
 * Cell Ids in a result Row change.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param rowId The Id of the result Row to listen to, or `null` to listen to
 * any result Row.
 * @param listener The function to call when Cell Ids change.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultCellIds} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultCellIds('petColors', 'fido', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   queries.setQueryDefinition('petColors', 'pets', ({select}) => {
 *     select('color');
 *     select('species');
 *   });
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultCellIds
/**
 * The onResultCell function registers a listener that is called whenever the
 * value of a result Cell changes.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param rowId The Id of the result Row to listen to, or `null` to listen to
 * any result Row.
 * @param cellId The Id of the result Cell to listen to, or `null` to listen to
 * any result Cell.
 * @param listener The function to call when the result Cell changes.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onResultCell} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onResultCell('petColors', 'fido', 'color',
 *  () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'color', 'white');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onResultCell
/**
 * The onParamValues function registers a listener that is called whenever the
 * parameter values for a query change.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param listener The function to call when parameter values change.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onParamValues} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onParamValues('petColors', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   queries.setParamValue('petColors', 'species', 'dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onParamValues
/**
 * The onParamValue function registers a listener that is called whenever a
 * specific parameter value for a query changes.
 * @param queryId The Id of the query to listen to, or `null` to listen to any
 * query.
 * @param paramId The Id of the parameter to listen to, or `null` to listen to
 * any parameter.
 * @param listener The function to call when the parameter value changes.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onParamValue} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *   let seen = $state('');
 *
 *   onParamValue('petColors', 'species', () => (seen = 'changed'), queries);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync(() => {
 *   queries.setParamValue('petColors', 'species', 'dog');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onParamValue
/**
 * The onCheckpointIds function registers a listener that is called whenever the
 * Checkpoint Ids change.
 * @param listener The function to call when Checkpoint Ids change.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onCheckpointIds} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *   let seen = $state('');
 *
 *   onCheckpointIds(() => (seen = 'changed'), checkpoints);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 *   checkpoints.addCheckpoint('saved');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onCheckpointIds
/**
 * The onCheckpoint function registers a listener that is called whenever the
 * label of a specified Checkpoint changes.
 * @param checkpointId The Id of the Checkpoint to listen to, or `null` to
 * listen to any Checkpoint.
 * @param listener The function to call when the Checkpoint label changes.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onCheckpoint} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *   let seen = $state('');
 *
 *   onCheckpoint(null, () => (seen = 'changed'), checkpoints);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * flushSync(() => {
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 *   checkpoints.addCheckpoint('saved');
 * });
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onCheckpoint
/**
 * The onPersisterStatus function registers a listener that is called whenever
 * the status of a Persister changes.
 * @param listener The function to call when the status changes.
 * @param persisterOrPersisterId The Persister to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onPersisterStatus} from 'tinybase/ui-svelte';
 *
 *   let {persister} = $props();
 *   let seen = $state('');
 *
 *   onPersisterStatus(() => (seen = 'changed'), persister);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import {createCustomPersister} from 'tinybase/persisters';
 * import App from './App.svelte';
 *
 * const store = createStore()
 *   .setTables({
 *     pets: {
 *       fido: {species: 'dog', color: 'brown', sold: false, next: 'felix'},
 *       felix: {species: 'cat', color: 'black', sold: true},
 *     },
 *     species: {dog: {price: 5}, cat: {price: 4}},
 *   })
 *   .setValues({open: true, employees: 3});
 * const persister = createCustomPersister(
 *   store,
 *   async () => undefined,
 *   async () => {},
 *   () => undefined,
 *   () => {},
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {persister}}));
 * await persister.save();
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onPersisterStatus
/**
 * The onSynchronizerStatus function registers a listener that is called
 * whenever the status of a Synchronizer changes.
 * @param listener The function to call when the status changes.
 * @param synchronizerOrSynchronizerId The Synchronizer to use, or its Id.
 * @example
 * This example registers a Svelte listener and responds to a TinyBase change.
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {onSynchronizerStatus} from 'tinybase/ui-svelte';
 *
 *   let {synchronizer} = $props();
 *   let seen = $state('');
 *
 *   onSynchronizerStatus(() => (seen = 'changed'), synchronizer);
 * </script>
 *
 * {seen}
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import App from './App.svelte';
 *
 * const store = createMergeableStore();
 * const synchronizer = createLocalSynchronizer(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {synchronizer}}));
 * await synchronizer.save();
 * flushSync();
 * console.log(app.textContent);
 * // -> 'changed'
 * ```
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onSynchronizerStatus
/**
 * The provideStore function registers a Store with a given Id into the current
 * Provider context, making it available to all descendant components.
 *
 * The provideStore function must be called inside a Svelte component's
 * `<script>` block that is a descendant of a Provider component.
 * @param storeId The Id to register the Store under.
 * @param store The Store to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideStore} from 'tinybase/ui-svelte';
 *
 *   let {store} = $props();
 *
 *   provideStore('registered', store);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getStoreIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getStoreIds();
 * </script>
 *
 * {JSON.stringify(getStoreIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {store} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {store} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {store}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideStore
/**
 * The provideMetrics function registers a Metrics object with a given Id into
 * the current Provider context.
 * @param metricsId The Id to register the Metrics object under.
 * @param metrics The Metrics object to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideMetrics} from 'tinybase/ui-svelte';
 *
 *   let {metrics} = $props();
 *
 *   provideMetrics('registered', metrics);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getMetricsIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getMetricsIds();
 * </script>
 *
 * {JSON.stringify(getMetricsIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {metrics} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {metrics} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMetrics, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const metrics = createMetrics(store).setMetricDefinition(
 *   'petCount',
 *   'pets',
 *   'count',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {metrics}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideMetrics
/**
 * The provideIndexes function registers an Indexes object with a given Id into
 * the current Provider context.
 * @param indexesId The Id to register the Indexes object under.
 * @param indexes The Indexes object to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideIndexes} from 'tinybase/ui-svelte';
 *
 *   let {indexes} = $props();
 *
 *   provideIndexes('registered', indexes);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getIndexesIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getIndexesIds();
 * </script>
 *
 * {JSON.stringify(getIndexesIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {indexes} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {indexes} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createIndexes, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const indexes = createIndexes(store).setIndexDefinition(
 *   'bySpecies',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {indexes}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideIndexes
/**
 * The provideRelationships function registers a Relationships object with a
 * given Id into the current Provider context.
 * @param relationshipsId The Id to register the Relationships object under.
 * @param relationships The Relationships object to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideRelationships} from 'tinybase/ui-svelte';
 *
 *   let {relationships} = $props();
 *
 *   provideRelationships('registered', relationships);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getRelationshipsIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getRelationshipsIds();
 * </script>
 *
 * {JSON.stringify(getRelationshipsIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {relationships} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {relationships} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createRelationships, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'pets',
 *   'species',
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {relationships}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideRelationships
/**
 * The provideQueries function registers a Queries object with a given Id into
 * the current Provider context.
 * @param queriesId The Id to register the Queries object under.
 * @param queries The Queries object to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideQueries} from 'tinybase/ui-svelte';
 *
 *   let {queries} = $props();
 *
 *   provideQueries('registered', queries);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getQueriesIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getQueriesIds();
 * </script>
 *
 * {JSON.stringify(getQueriesIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {queries} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {queries} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createQueries, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const queries = createQueries(store).setQueryDefinition(
 *   'petSpecies',
 *   'pets',
 *   ({select}) => select('species'),
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {queries}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideQueries
/**
 * The provideCheckpoints function registers a Checkpoints object with a given
 * Id into the current Provider context.
 * @param checkpointsId The Id to register the Checkpoints object under.
 * @param checkpoints The Checkpoints object to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideCheckpoints} from 'tinybase/ui-svelte';
 *
 *   let {checkpoints} = $props();
 *
 *   provideCheckpoints('registered', checkpoints);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getCheckpointsIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getCheckpointsIds();
 * </script>
 *
 * {JSON.stringify(getCheckpointsIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {checkpoints} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {checkpoints} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const checkpoints = createCheckpoints(store);
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {checkpoints}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideCheckpoints
/**
 * The providePersister function registers a Persister with a given Id into the
 * current Provider context.
 * @param persisterId The Id to register the Persister under.
 * @param persister The Persister to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {providePersister} from 'tinybase/ui-svelte';
 *
 *   let {persister} = $props();
 *
 *   providePersister('registered', persister);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getPersisterIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getPersisterIds();
 * </script>
 *
 * {JSON.stringify(getPersisterIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {persister} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {persister} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createStore} from 'tinybase';
 * import {createCustomPersister} from 'tinybase/persisters';
 * import App from './App.svelte';
 *
 * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 * const persister = createCustomPersister(
 *   store,
 *   async () => undefined,
 *   async () => {},
 *   () => undefined,
 *   () => {},
 * );
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {persister}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.providePersister
/**
 * The provideSynchronizer function registers a Synchronizer with a given Id
 * into the current Provider context.
 * @param synchronizerId The Id to register the Synchronizer under.
 * @param synchronizer The Synchronizer to register.
 * @example
 * This example registers a TinyBase object dynamically in a Provider context.
 *
 * ```svelte file=Registrar.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {provideSynchronizer} from 'tinybase/ui-svelte';
 *
 *   let {synchronizer} = $props();
 *
 *   provideSynchronizer('registered', synchronizer);
 * </script>
 * ```
 *
 * ```svelte file=Reader.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {getSynchronizerIds} from 'tinybase/ui-svelte';
 *
 *   const ids = getSynchronizerIds();
 * </script>
 *
 * {JSON.stringify(getSynchronizerIds().current)}
 * ```
 *
 * ```svelte file=App.svelte
 * <svelte:options runes={true} />
 *
 * <script>
 *   import {Provider} from 'tinybase/ui-svelte';
 *   import Reader from './Reader.svelte';
 *   import Registrar from './Registrar.svelte';
 *
 *   let {synchronizer} = $props();
 * </script>
 *
 * <Provider>
 *   <Registrar {synchronizer} />
 *   <Reader />
 * </Provider>
 * ```
 *
 * ```ts
 * import {flushSync, mount} from 'svelte';
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import App from './App.svelte';
 *
 * const synchronizer = createLocalSynchronizer(createMergeableStore());
 * const app = document.body.appendChild(document.createElement('div'));
 * flushSync(() => mount(App, {target: app, props: {synchronizer}}));
 * flushSync();
 * console.log(app.textContent);
 * // -> ' ["registered"]'
 * ```
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideSynchronizer
