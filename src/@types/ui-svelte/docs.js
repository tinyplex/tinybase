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
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
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
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
   * @category Props
   * @since v8.1.0
   */
  /// ui-svelte.ValueViewProps.store
  /**
   * Whether the component should also render the Id of the Value to assist
   * with debugging.
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
   * Whether the component should also render the Id of the checkpoint to
   * assist with debugging.
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
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
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
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
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
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
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
 * TablesViewProps props are used for components that refer to all the Tables
 * in a Store, such as the TablesView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.TablesViewProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
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
 * ValuesViewProps props are used for components that refer to all the Values
 * in a Store, such as the ValuesView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ValuesViewProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an
   * Id for a named context Store, or provide an explicit reference.
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
 * Relationship in a Relationships object, and where you want to render a
 * remote Row based on a local Row, such as in the RemoteRowView component.
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
 * Relationship in a Relationships object, and where you want to render a
 * linked list of Rows starting from a first Row, such as the LinkedRowsView
 * component.
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
 * ResultCellViewProps props are used for components that refer to a single
 * Cell in a Row of a query ResultTable, such as the ResultCellView component.
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
 * single sorted query ResultTable, such as the ResultSortedTableView
 * component.
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
 * current checkpoint in a Checkpoints object, such as the
 * CurrentCheckpointView component.
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
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ForwardCheckpointsView
/**
 * The IndexView component renders the slices in a named Index, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the slices.
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
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.SortedTableView
/**
 * The TableView component renders the contents of a single Table, and registers
 * a listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Table.
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
 * @category Component
 * @since v8.1.0
 */
/// ui-svelte.ValueView
/**
 * The ValuesView component renders all Values in a Store, and registers a
 * listener so that any changes to that result will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of all Values.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.hasValues
/**
 * The getValues function returns a reactive object reflecting the Values in the
 * Store, and registers a listener so that any changes will update `current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` Values property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getValue
/**
 * The getStore function returns the default Store from the current Provider
 * context (or a named Store if an Id is provided).
 * @param id An optional Id of a named Store in the Provider context.
 * @returns The Store, or `undefined` if not found.
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getStore
/**
 * The resolveStore function is used to get a reference to a Store object from a
 * Provider context, or have it passed directly.
 * @param storeOrStoreId The Store, its Id, or a getter returning either.
 * @returns A getter function returning the Store, or `undefined`.
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveStore
/**
 * The getStoreIds function returns a reactive object with the Ids of all Stores
 * registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getStoreIds
/**
 * The getMetrics function returns the default Metrics object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Metrics object in the Provider context.
 * @returns The Metrics object, or `undefined` if not found.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveMetrics
/**
 * The getMetricsIds function returns a reactive object with the Ids of all
 * Metrics objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getMetric
/**
 * The getIndexes function returns the default Indexes object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Indexes object in the Provider context.
 * @returns The Indexes object, or `undefined` if not found.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getIndexStoreTableId
/**
 * The getIndexesIds function returns a reactive object with the Ids of all
 * Indexes objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getSliceRowIds
/**
 * The getQueries function returns the default Queries object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Queries object in the Provider context.
 * @returns The Queries object, or `undefined` if not found.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveQueries
/**
 * The getQueriesIds function returns a reactive object with the Ids of all
 * Queries objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getRelationshipsStoreTableIds
/**
 * The getRelationshipsIds function returns a reactive object with the Ids of
 * all Relationships objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveCheckpoints
/**
 * The getCheckpointsIds function returns a reactive object with the Ids of all
 * Checkpoints objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getCheckpoint
/**
 * The createGoBackwardCallback function returns a callback function that, when
 * called, moves the Checkpoints object backward to the previous checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @returns A callback function.
 * @category Callback
 * @since v8.1.0
 */
/// ui-svelte.createGoBackwardCallback
/**
 * The createGoForwardCallback function returns a callback function that, when
 * called, moves the Checkpoints object forward to the next checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @returns A callback function.
 * @category Callback
 * @since v8.1.0
 */
/// ui-svelte.createGoForwardCallback
/**
 * The getPersister function returns the default Persister from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Persister in the Provider context.
 * @returns The Persister, or `undefined` if not found.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolvePersister
/**
 * The getPersisterIds function returns a reactive object with the Ids of all
 * Persisters registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.getPersisterStatus
/**
 * The getSynchronizer function returns the default Synchronizer from the
 * current Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Synchronizer in the Provider context.
 * @returns The Synchronizer, or `undefined` if not found.
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
 * @category Getter
 * @since v8.1.0
 */
/// ui-svelte.resolveSynchronizer
/**
 * The getSynchronizerIds function returns a reactive object with the Ids of all
 * Synchronizers registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
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
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onValue
/**
 * The onStartTransaction function registers a listener that is called at the
 * start of every Store transaction.
 * @param listener The function to call at transaction start.
 * @param storeOrStoreId The Store to use, or its Id.
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onStartTransaction
/**
 * The onWillFinishTransaction function registers a listener called just before
 * a Store transaction completes.
 * @param listener The function to call before transaction end.
 * @param storeOrStoreId The Store to use, or its Id.
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onWillFinishTransaction
/**
 * The onDidFinishTransaction function registers a listener called just after a
 * Store transaction completes.
 * @param listener The function to call after transaction end.
 * @param storeOrStoreId The Store to use, or its Id.
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
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onParamValue
/**
 * The onCheckpointIds function registers a listener that is called whenever the
 * Checkpoint Ids change.
 * @param listener The function to call when Checkpoint Ids change.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
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
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onCheckpoint
/**
 * The onPersisterStatus function registers a listener that is called whenever
 * the status of a Persister changes.
 * @param listener The function to call when the status changes.
 * @param persisterOrPersisterId The Persister to use, or its Id.
 * @category Listener
 * @since v8.1.0
 */
/// ui-svelte.onPersisterStatus
/**
 * The onSynchronizerStatus function registers a listener that is called
 * whenever the status of a Synchronizer changes.
 * @param listener The function to call when the status changes.
 * @param synchronizerOrSynchronizerId The Synchronizer to use, or its Id.
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
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideStore
/**
 * The provideMetrics function registers a Metrics object with a given Id into
 * the current Provider context.
 * @param metricsId The Id to register the Metrics object under.
 * @param metrics The Metrics object to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideMetrics
/**
 * The provideIndexes function registers an Indexes object with a given Id into
 * the current Provider context.
 * @param indexesId The Id to register the Indexes object under.
 * @param indexes The Indexes object to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideIndexes
/**
 * The provideRelationships function registers a Relationships object with a
 * given Id into the current Provider context.
 * @param relationshipsId The Id to register the Relationships object under.
 * @param relationships The Relationships object to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideRelationships
/**
 * The provideQueries function registers a Queries object with a given Id into
 * the current Provider context.
 * @param queriesId The Id to register the Queries object under.
 * @param queries The Queries object to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideQueries
/**
 * The provideCheckpoints function registers a Checkpoints object with a given
 * Id into the current Provider context.
 * @param checkpointsId The Id to register the Checkpoints object under.
 * @param checkpoints The Checkpoints object to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideCheckpoints
/**
 * The providePersister function registers a Persister with a given Id into the
 * current Provider context.
 * @param persisterId The Id to register the Persister under.
 * @param persister The Persister to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.providePersister
/**
 * The provideSynchronizer function registers a Synchronizer with a given Id
 * into the current Provider context.
 * @param synchronizerId The Id to register the Synchronizer under.
 * @param synchronizer The Synchronizer to register.
 * @category Provider
 * @since v8.1.0
 */
/// ui-svelte.provideSynchronizer
