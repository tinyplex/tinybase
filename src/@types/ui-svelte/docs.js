/**
 * The ui-svelte module of the TinyBase project provides both hooks and
 * components to make it easy to create reactive Svelte 5 apps with Store
 * objects.
 *
 * The hooks in this module provide access to the data and structures exposed by
 * other modules in the project. They return reactive objects with a `current`
 * property. Hooks register listeners such that components using those hooks
 * re-render when data changes.
 *
 * Hook parameters accept either plain values or reactive getter functions
 * (`R<T> = T | (() => T)`), so passing `() => tableId` from a `let`-bound
 * Svelte prop makes the hook re-execute whenever the prop changes.
 *
 * The components in this module provide a further abstraction over those hooks
 * to ease the composition of user interfaces that use TinyBase.
 * @see Building UIs With Svelte guide
 * @packageDocumentation
 * @module ui-svelte
 * @since v8.1.0
 */
/// ui-svelte
/**
 * The R type represents a value that can be provided either as a plain value
 * or as a reactive getter function.
 *
 * When a getter function is provided to a hook, the hook's internal `$effect`
 * will re-run whenever the getter's reactive dependencies change. This is the
 * mechanism that makes Svelte 5 props reactive in hooks.
 * @category Identity
 * @since v8.1.0
 */
/// ui-svelte.R
/**
 * The ProviderProps type describes the props of the Provider component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ProviderProps
{
  /// ProviderProps.store
  /// ProviderProps.storesById
  /// ProviderProps.metrics
  /// ProviderProps.metricsById
  /// ProviderProps.indexes
  /// ProviderProps.indexesById
  /// ProviderProps.relationships
  /// ProviderProps.relationshipsById
  /// ProviderProps.queries
  /// ProviderProps.queriesById
  /// ProviderProps.checkpoints
  /// ProviderProps.checkpointsById
  /// ProviderProps.persister
  /// ProviderProps.persistersById
  /// ProviderProps.synchronizer
  /// ProviderProps.synchronizersById
  /**
   * The `children` prop of a ProviderProps object — the app subtree that will
   * have access to the provided context.
   * @category Props
   * @since v8.1.0
   */
  /// ProviderProps.children
}
/**
 * The CellViewProps type describes the props of the CellView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.CellViewProps
{
  /**
   * The `tableId` prop of a CellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CellViewProps.tableId
  /**
   * The `rowId` prop of a CellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CellViewProps.rowId
  /**
   * The `cellId` prop of a CellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CellViewProps.cellId
  /**
   * The `store` prop of a CellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CellViewProps.store
  /**
   * The `debugIds` prop of a CellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CellViewProps.debugIds
}
/**
 * The ValueViewProps type describes the props of the ValueView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ValueViewProps
{
  /**
   * The `valueId` prop of a ValueViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValueViewProps.valueId
  /**
   * The `store` prop of a ValueViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValueViewProps.store
  /**
   * The `debugIds` prop of a ValueViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValueViewProps.debugIds
}
/**
 * The MetricViewProps type describes the props of the MetricView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.MetricViewProps
{
  /**
   * The `metricId` prop of a MetricViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// MetricViewProps.metricId
  /**
   * The `metrics` prop of a MetricViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// MetricViewProps.metrics
  /**
   * The `debugIds` prop of a MetricViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// MetricViewProps.debugIds
}
/**
 * The CheckpointViewProps type describes the props of the CheckpointView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.CheckpointViewProps
{
  /**
   * The `checkpointId` prop of a CheckpointViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CheckpointViewProps.checkpointId
  /**
   * The `checkpoints` prop of a CheckpointViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CheckpointViewProps.checkpoints
  /**
   * The `debugIds` prop of a CheckpointViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CheckpointViewProps.debugIds
}
/**
 * The RowViewProps type describes the props of the RowView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.RowViewProps
{
  /**
   * The `tableId` prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.tableId
  /**
   * The `rowId` prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.rowId
  /**
   * The `store` prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.store
  /**
   * The `customCellIds` prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.customCellIds
  /**
   * The `separator` prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.separator
  /**
   * The `debugIds` prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.debugIds
  /**
   * The `cell` snippet prop of a RowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RowViewProps.cell
}
/**
 * The TableViewProps type describes the props of the TableView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.TableViewProps
{
  /**
   * The `tableId` prop of a TableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TableViewProps.tableId
  /**
   * The `store` prop of a TableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TableViewProps.store
  /**
   * The `customCellIds` prop of a TableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TableViewProps.customCellIds
  /**
   * The `separator` prop of a TableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TableViewProps.separator
  /**
   * The `debugIds` prop of a TableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TableViewProps.debugIds
  /**
   * The `row` snippet prop of a TableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TableViewProps.row
}
/**
 * The SortedTableViewProps type describes the props of the SortedTableView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.SortedTableViewProps
{
  /**
   * The `tableId` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.tableId
  /**
   * The `cellId` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.cellId
  /**
   * The `descending` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.descending
  /**
   * The `offset` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.offset
  /**
   * The `limit` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.limit
  /**
   * The `store` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.store
  /**
   * The `customCellIds` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.customCellIds
  /**
   * The `separator` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.separator
  /**
   * The `debugIds` prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.debugIds
  /**
   * The `row` snippet prop of a SortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SortedTableViewProps.row
}
/**
 * The TablesViewProps type describes the props of the TablesView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.TablesViewProps
{
  /**
   * The `store` prop of a TablesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TablesViewProps.store
  /**
   * The `separator` prop of a TablesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TablesViewProps.separator
  /**
   * The `debugIds` prop of a TablesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TablesViewProps.debugIds
  /**
   * The `table` snippet prop of a TablesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// TablesViewProps.table
}
/**
 * The ValuesViewProps type describes the props of the ValuesView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ValuesViewProps
{
  /**
   * The `store` prop of a ValuesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValuesViewProps.store
  /**
   * The `separator` prop of a ValuesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValuesViewProps.separator
  /**
   * The `debugIds` prop of a ValuesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValuesViewProps.debugIds
  /**
   * The `value` snippet prop of a ValuesViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ValuesViewProps.value
}
/**
 * The IndexViewProps type describes the props of the IndexView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.IndexViewProps
{
  /**
   * The `indexId` prop of an IndexViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// IndexViewProps.indexId
  /**
   * The `indexes` prop of an IndexViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// IndexViewProps.indexes
  /**
   * The `separator` prop of an IndexViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// IndexViewProps.separator
  /**
   * The `debugIds` prop of an IndexViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// IndexViewProps.debugIds
  /**
   * The `slice` snippet prop of an IndexViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// IndexViewProps.slice
}
/**
 * The SliceViewProps type describes the props of the SliceView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.SliceViewProps
{
  /**
   * The `indexId` prop of a SliceViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SliceViewProps.indexId
  /**
   * The `sliceId` prop of a SliceViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SliceViewProps.sliceId
  /**
   * The `indexes` prop of a SliceViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SliceViewProps.indexes
  /**
   * The `separator` prop of a SliceViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SliceViewProps.separator
  /**
   * The `debugIds` prop of a SliceViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SliceViewProps.debugIds
  /**
   * The `row` snippet prop of a SliceViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// SliceViewProps.row
}
/**
 * The RemoteRowViewProps type describes the props of the RemoteRowView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.RemoteRowViewProps
{
  /**
   * The `relationshipId` prop of a RemoteRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RemoteRowViewProps.relationshipId
  /**
   * The `localRowId` prop of a RemoteRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RemoteRowViewProps.localRowId
  /**
   * The `relationships` prop of a RemoteRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RemoteRowViewProps.relationships
  /**
   * The `debugIds` prop of a RemoteRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RemoteRowViewProps.debugIds
  /**
   * The `row` snippet prop of a RemoteRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// RemoteRowViewProps.row
}
/**
 * The LocalRowsViewProps type describes the props of the LocalRowsView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.LocalRowsViewProps
{
  /**
   * The `relationshipId` prop of a LocalRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LocalRowsViewProps.relationshipId
  /**
   * The `remoteRowId` prop of a LocalRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LocalRowsViewProps.remoteRowId
  /**
   * The `relationships` prop of a LocalRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LocalRowsViewProps.relationships
  /**
   * The `separator` prop of a LocalRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LocalRowsViewProps.separator
  /**
   * The `debugIds` prop of a LocalRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LocalRowsViewProps.debugIds
  /**
   * The `row` snippet prop of a LocalRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LocalRowsViewProps.row
}
/**
 * The LinkedRowsViewProps type describes the props of the LinkedRowsView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.LinkedRowsViewProps
{
  /**
   * The `relationshipId` prop of a LinkedRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LinkedRowsViewProps.relationshipId
  /**
   * The `firstRowId` prop of a LinkedRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LinkedRowsViewProps.firstRowId
  /**
   * The `relationships` prop of a LinkedRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LinkedRowsViewProps.relationships
  /**
   * The `separator` prop of a LinkedRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LinkedRowsViewProps.separator
  /**
   * The `debugIds` prop of a LinkedRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LinkedRowsViewProps.debugIds
  /**
   * The `row` snippet prop of a LinkedRowsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// LinkedRowsViewProps.row
}
/**
 * The ResultCellViewProps type describes the props of the ResultCellView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultCellViewProps
{
  /**
   * The `queryId` prop of a ResultCellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultCellViewProps.queryId
  /**
   * The `rowId` prop of a ResultCellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultCellViewProps.rowId
  /**
   * The `cellId` prop of a ResultCellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultCellViewProps.cellId
  /**
   * The `queries` prop of a ResultCellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultCellViewProps.queries
  /**
   * The `debugIds` prop of a ResultCellViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultCellViewProps.debugIds
}
/**
 * The ResultRowViewProps type describes the props of the ResultRowView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultRowViewProps
{
  /**
   * The `queryId` prop of a ResultRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultRowViewProps.queryId
  /**
   * The `rowId` prop of a ResultRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultRowViewProps.rowId
  /**
   * The `queries` prop of a ResultRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultRowViewProps.queries
  /**
   * The `separator` prop of a ResultRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultRowViewProps.separator
  /**
   * The `debugIds` prop of a ResultRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultRowViewProps.debugIds
  /**
   * The `cell` snippet prop of a ResultRowViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultRowViewProps.cell
}
/**
 * The ResultTableViewProps type describes the props of the ResultTableView
 * component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultTableViewProps
{
  /**
   * The `queryId` prop of a ResultTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultTableViewProps.queryId
  /**
   * The `queries` prop of a ResultTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultTableViewProps.queries
  /**
   * The `separator` prop of a ResultTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultTableViewProps.separator
  /**
   * The `debugIds` prop of a ResultTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultTableViewProps.debugIds
  /**
   * The `row` snippet prop of a ResultTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultTableViewProps.row
}
/**
 * The ResultSortedTableViewProps type describes the props of the
 * ResultSortedTableView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ResultSortedTableViewProps
{
  /**
   * The `queryId` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.queryId
  /**
   * The `cellId` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.cellId
  /**
   * The `descending` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.descending
  /**
   * The `offset` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.offset
  /**
   * The `limit` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.limit
  /**
   * The `queries` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.queries
  /**
   * The `separator` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.separator
  /**
   * The `debugIds` prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.debugIds
  /**
   * The `row` snippet prop of a ResultSortedTableViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ResultSortedTableViewProps.row
}
/**
 * The BackwardCheckpointsViewProps type describes the props of the
 * BackwardCheckpointsView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.BackwardCheckpointsViewProps
{
  /**
   * The `checkpoints` prop of a BackwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// BackwardCheckpointsViewProps.checkpoints
  /**
   * The `separator` prop of a BackwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// BackwardCheckpointsViewProps.separator
  /**
   * The `debugIds` prop of a BackwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// BackwardCheckpointsViewProps.debugIds
  /**
   * The `checkpoint` snippet prop of a BackwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// BackwardCheckpointsViewProps.checkpoint
}
/**
 * The ForwardCheckpointsViewProps type describes the props of the
 * ForwardCheckpointsView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.ForwardCheckpointsViewProps
{
  /**
   * The `checkpoints` prop of a ForwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ForwardCheckpointsViewProps.checkpoints
  /**
   * The `separator` prop of a ForwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ForwardCheckpointsViewProps.separator
  /**
   * The `debugIds` prop of a ForwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ForwardCheckpointsViewProps.debugIds
  /**
   * The `checkpoint` snippet prop of a ForwardCheckpointsViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// ForwardCheckpointsViewProps.checkpoint
}
/**
 * The CurrentCheckpointViewProps type describes the props of the
 * CurrentCheckpointView component.
 * @category Props
 * @since v8.1.0
 */
/// ui-svelte.CurrentCheckpointViewProps
{
  /**
   * The `checkpoints` prop of a CurrentCheckpointViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CurrentCheckpointViewProps.checkpoints
  /**
   * The `debugIds` prop of a CurrentCheckpointViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CurrentCheckpointViewProps.debugIds
  /**
   * The `checkpoint` snippet prop of a CurrentCheckpointViewProps object.
   * @category Props
   * @since v8.1.0
   */
  /// CurrentCheckpointViewProps.checkpoint
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
 * import {createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-svelte';
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
 * The CellView component renders the value of a single Cell in a given Row in
 * a given Table, and registers a listener so that any changes to that result
 * will cause a re-render.
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
 * The SliceView component renders the Row Ids in a named Slice in an Index,
 * and registers a listener so that any changes to that result will cause a
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
 * The TableView component renders the contents of a single Table, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
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
 * The useHasTables hook returns a reactive object indicating whether any Tables
 * exist in the Store, and registers a listener so that any changes to that
 * result will update `.current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasTables
/**
 * The useTables hook returns a reactive object reflecting the Tables in the
 * Store, and registers a listener so that any changes to those Tables will
 * update `.current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` Tables property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useTables
/**
 * The useTableIds hook returns a reactive object reflecting the Ids of the
 * Tables in a Store, and registers a listener so that any changes to those Ids
 * will update `.current`.
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useTableIds
/**
 * The useHasTable hook returns a reactive object indicating whether a Table
 * exists in the Store, and registers a listener so that any changes to that
 * result will update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasTable
/**
 * The useTable hook returns a reactive object reflecting a Table in a Store,
 * and registers a listener so that any changes to that Table will update
 * `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Table property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useTable
/**
 * The useTableCellIds hook returns a reactive object reflecting the Ids of all
 * Cells used across a Table, and registers a listener so that any changes to
 * those Ids will update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useTableCellIds
/**
 * The useHasTableCell hook returns a reactive object indicating whether a
 * particular Cell is used anywhere in a Table, and registers a listener so
 * that any changes to that result will update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasTableCell
/**
 * The useRowCount hook returns a reactive object reflecting the number of Rows
 * in a Table, and registers a listener so that any changes will update
 * `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` number property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRowCount
/**
 * The useRowIds hook returns a reactive object reflecting the Ids of the Rows
 * in a Table, and registers a listener so that any changes will update
 * `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRowIds
/**
 * The useSortedRowIds hook returns a reactive object reflecting the sorted Row
 * Ids in a Table, and registers a listener so that any changes will update
 * `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param cellId The Id of the Cell to sort by (or a getter returning it).
 * @param descending Whether to sort descending (or a getter returning it).
 * @param offset The starting Row offset (or a getter returning it).
 * @param limit The maximum number of Rows to return (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useSortedRowIds
/**
 * The useHasRow hook returns a reactive object indicating whether a Row exists
 * in a Table, and registers a listener so that any changes to that result will
 * update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasRow
/**
 * The useRow hook returns a reactive object reflecting a Row in a Table, and
 * registers a listener so that any changes to that Row will update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Row property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRow
/**
 * The useCellIds hook returns a reactive object reflecting the Ids of the
 * Cells in a Row, and registers a listener so that any changes will update
 * `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCellIds
/**
 * The useHasCell hook returns a reactive object indicating whether a Cell
 * exists in a Row in a Table, and registers a listener so that any changes to
 * that result will update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasCell
/**
 * The useCell hook returns a reactive object reflecting the value of a Cell in
 * a Row in a Table, and registers a listener so that any changes to that Cell
 * will update `.current`.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` CellOrUndefined property.
 * @example
 * This example uses the useCell hook to display a Cell value reactively.
 *
 * ```ts
 * import {createStore} from 'tinybase';
 * import {useCell} from 'tinybase/ui-svelte';
 * // In a .svelte file:
 * // const store = createStore().setCell('pets', 'cat', 'name', 'Fido');
 * // const name = useCell('pets', 'cat', 'name', store);
 * // $: console.log(name.current); // 'Fido'
 * ```
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCell
/**
 * The useCellState hook returns a reactive object reflecting the value of a
 * Cell, with a settable `current` property that writes back to the Store.
 * @param tableId The Id of the Table (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with gettable and settable `current`.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCellState
/**
 * The useHasValues hook returns a reactive object indicating whether any Values
 * exist in the Store, and registers a listener so that any changes to that
 * result will update `.current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasValues
/**
 * The useValues hook returns a reactive object reflecting the Values in the
 * Store, and registers a listener so that any changes will update `.current`.
 * @param storeOrStoreId The Store to use, or its Id in a Provider context.
 * @returns A reactive object with a `current` Values property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useValues
/**
 * The useValueIds hook returns a reactive object reflecting the Ids of the
 * Values in a Store, and registers a listener so that any changes will update
 * `.current`.
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useValueIds
/**
 * The useHasValue hook returns a reactive object indicating whether a Value
 * exists in the Store, and registers a listener so that any changes to that
 * result will update `.current`.
 * @param valueId The Id of the Value (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` boolean property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useHasValue
/**
 * The useValue hook returns a reactive object reflecting the value of a Value
 * in a Store, and registers a listener so that any changes to that Value will
 * update `.current`.
 * @param valueId The Id of the Value (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with a `current` ValueOrUndefined property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useValue
/**
 * The useValueState hook returns a reactive object reflecting the value of a
 * Value, with a settable `current` property that writes back to the Store.
 * @param valueId The Id of the Value (or a getter returning it).
 * @param storeOrStoreId The Store to use (plain value or getter), or its Id.
 * @returns A reactive object with gettable and settable `current`.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useValueState
/**
 * The useStore hook returns the default Store from the current Provider context
 * (or a named Store if an Id is provided).
 * @param id An optional Id of a named Store in the Provider context.
 * @returns The Store, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useStore
/**
 * The useStoreIds hook returns a reactive object with the Ids of all Stores
 * registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useStoreIds
/**
 * The useMetrics hook returns the default Metrics object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Metrics object in the Provider context.
 * @returns The Metrics object, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useMetrics
/**
 * The useMetricsIds hook returns a reactive object with the Ids of all Metrics
 * objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useMetricsIds
/**
 * The useMetricIds hook returns a reactive object reflecting the Ids of the
 * Metrics in a Metrics object, and registers a listener so that any changes
 * will update `.current`.
 * @param metricsOrMetricsId The Metrics object to use, or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useMetricIds
/**
 * The useMetric hook returns a reactive object reflecting the value of a named
 * Metric in a Metrics object, and registers a listener so that any changes to
 * that Metric will update `.current`.
 * @param metricId The Id of the Metric (or a getter returning it).
 * @param metricsOrMetricsId The Metrics object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` number | undefined property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useMetric
/**
 * The useIndexes hook returns the default Indexes object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Indexes object in the Provider context.
 * @returns The Indexes object, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useIndexes
/**
 * The useIndexesIds hook returns a reactive object with the Ids of all Indexes
 * objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useIndexesIds
/**
 * The useIndexIds hook returns a reactive object reflecting the Ids of the
 * Indexes in an Indexes object, and registers a listener so that any changes
 * will update `.current`.
 * @param indexesOrIndexesId The Indexes object to use, or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useIndexIds
/**
 * The useSliceIds hook returns a reactive object reflecting the Ids of the
 * Slices in an Index, and registers a listener so that any changes will update
 * `.current`.
 * @param indexId The Id of the Index (or a getter returning it).
 * @param indexesOrIndexesId The Indexes object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useSliceIds
/**
 * The useSliceRowIds hook returns a reactive object reflecting the Ids of the
 * Rows in a Slice, and registers a listener so that any changes will update
 * `.current`.
 * @param indexId The Id of the Index (or a getter returning it).
 * @param sliceId The Id of the Slice (or a getter returning it).
 * @param indexesOrIndexesId The Indexes object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useSliceRowIds
/**
 * The useQueries hook returns the default Queries object from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Queries object in the Provider context.
 * @returns The Queries object, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useQueries
/**
 * The useQueriesIds hook returns a reactive object with the Ids of all Queries
 * objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useQueriesIds
/**
 * The useQueryIds hook returns a reactive object reflecting the Ids of the
 * Queries in a Queries object, and registers a listener so that any changes
 * will update `.current`.
 * @param queriesOrQueriesId The Queries object to use, or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useQueryIds
/**
 * The useResultTable hook returns a reactive object reflecting a result Table
 * in a Queries object, and registers a listener so that any changes to that
 * result will update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Table property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultTable
/**
 * The useResultTableCellIds hook returns a reactive object reflecting the Ids
 * of all Cells used across a result Table, and registers a listener so that
 * any changes will update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultTableCellIds
/**
 * The useResultRowCount hook returns a reactive object reflecting the number of
 * Rows in a result Table, and registers a listener so that any changes will
 * update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` number property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultRowCount
/**
 * The useResultRowIds hook returns a reactive object reflecting the Ids of the
 * Rows in a result Table, and registers a listener so that any changes will
 * update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultRowIds
/**
 * The useResultSortedRowIds hook returns a reactive object reflecting the
 * sorted Row Ids in a result Table, and registers a listener so that any
 * changes will update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param cellId The Id of the Cell to sort by (or a getter returning it).
 * @param descending Whether to sort descending (or a getter returning it).
 * @param offset The starting Row offset (or a getter returning it).
 * @param limit The maximum number of Rows (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultSortedRowIds
/**
 * The useResultRow hook returns a reactive object reflecting a result Row in a
 * result Table, and registers a listener so that any changes will update
 * `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Row property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultRow
/**
 * The useResultCellIds hook returns a reactive object reflecting the Ids of the
 * Cells in a result Row, and registers a listener so that any changes will
 * update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultCellIds
/**
 * The useResultCell hook returns a reactive object reflecting the value of a
 * Cell in a result Row, and registers a listener so that any changes will
 * update `.current`.
 * @param queryId The Id of the Query (or a getter returning it).
 * @param rowId The Id of the Row (or a getter returning it).
 * @param cellId The Id of the Cell (or a getter returning it).
 * @param queriesOrQueriesId The Queries object to use (plain or getter), or
 * its Id.
 * @returns A reactive object with a `current` Cell | undefined property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useResultCell
/**
 * The useRelationships hook returns the default Relationships object from the
 * current Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Relationships object in the Provider
 * context.
 * @returns The Relationships object, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRelationships
/**
 * The useRelationshipsIds hook returns a reactive object with the Ids of all
 * Relationships objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRelationshipsIds
/**
 * The useRelationshipIds hook returns a reactive object reflecting the Ids of
 * the Relationships in a Relationships object, and registers a listener so
 * that any changes will update `.current`.
 * @param relationshipsOrRelationshipsId The Relationships object to use, or
 * its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRelationshipIds
/**
 * The useRemoteRowId hook returns a reactive object reflecting the remote Row
 * Id for a given local Row in a Relationship, and registers a listener so that
 * any changes will update `.current`.
 * @param relationshipId The Id of the Relationship (or a getter returning it).
 * @param localRowId The Id of the local Row (or a getter returning it).
 * @param relationshipsOrRelationshipsId The Relationships object to use (plain
 * or getter), or its Id.
 * @returns A reactive object with a `current` Id | undefined property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useRemoteRowId
/**
 * The useLocalRowIds hook returns a reactive object reflecting the local Row
 * Ids for a given remote Row in a Relationship, and registers a listener so
 * that any changes will update `.current`.
 * @param relationshipId The Id of the Relationship (or a getter returning it).
 * @param remoteRowId The Id of the remote Row (or a getter returning it).
 * @param relationshipsOrRelationshipsId The Relationships object to use (plain
 * or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useLocalRowIds
/**
 * The useLinkedRowIds hook returns a reactive object reflecting the linked Row
 * Ids in a Relationship, and registers a listener so that any changes will
 * update `.current`.
 * @param relationshipId The Id of the Relationship (or a getter returning it).
 * @param firstRowId The Id of the first Row (or a getter returning it).
 * @param relationshipsOrRelationshipsId The Relationships object to use (plain
 * or getter), or its Id.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useLinkedRowIds
/**
 * The useCheckpoints hook returns the default Checkpoints object from the
 * current Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Checkpoints object in the Provider
 * context.
 * @returns The Checkpoints object, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCheckpoints
/**
 * The useCheckpointsIds hook returns a reactive object with the Ids of all
 * Checkpoints objects registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCheckpointsIds
/**
 * The useCheckpointIds hook returns a reactive object reflecting the
 * CheckpointIds (backward, current, forward) in a Checkpoints object, and
 * registers a listener so that any changes will update `.current`.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use (plain or
 * getter), or its Id.
 * @returns A reactive object with a `current` CheckpointIds property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCheckpointIds
/**
 * The useCheckpoint hook returns a reactive object reflecting the label of a
 * checkpoint, and registers a listener so that any changes will update
 * `.current`.
 * @param checkpointId The Id of the checkpoint (or a getter returning it).
 * @param checkpointsOrCheckpointsId The Checkpoints object to use (plain or
 * getter), or its Id.
 * @returns A reactive object with a `current` string | undefined property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useCheckpoint
/**
 * The useGoBackwardCallback hook returns a callback function that, when called,
 * moves the Checkpoints object backward to the previous checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @returns A callback function.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useGoBackwardCallback
/**
 * The useGoForwardCallback hook returns a callback function that, when called,
 * moves the Checkpoints object forward to the next checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use, or its Id.
 * @returns A callback function.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useGoForwardCallback
/**
 * The usePersister hook returns the default Persister from the current Provider
 * context (or a named one if an Id is provided).
 * @param id An optional Id of a named Persister in the Provider context.
 * @returns The Persister, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.usePersister
/**
 * The usePersisterIds hook returns a reactive object with the Ids of all
 * Persisters registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.usePersisterIds
/**
 * The usePersisterStatus hook returns a reactive object reflecting the status
 * of a Persister, and registers a listener so that any changes will update
 * `.current`.
 * @param persisterOrPersisterId The Persister to use, or its Id.
 * @returns A reactive object with a `current` Status property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.usePersisterStatus
/**
 * The useSynchronizer hook returns the default Synchronizer from the current
 * Provider context (or a named one if an Id is provided).
 * @param id An optional Id of a named Synchronizer in the Provider context.
 * @returns The Synchronizer, or `undefined` if not found.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useSynchronizer
/**
 * The useSynchronizerIds hook returns a reactive object with the Ids of all
 * Synchronizers registered in the current Provider context.
 * @returns A reactive object with a `current` Ids property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useSynchronizerIds
/**
 * The useSynchronizerStatus hook returns a reactive object reflecting the
 * status of a Synchronizer, and registers a listener so that any changes will
 * update `.current`.
 * @param synchronizerOrSynchronizerId The Synchronizer to use, or its Id.
 * @returns A reactive object with a `current` Status property.
 * @category Hook
 * @since v8.1.0
 */
/// ui-svelte.useSynchronizerStatus
/**
 * The provideStore function registers a Store with a given Id into the current
 * Provider context, making it available to all descendant components.
 *
 * This function must be called inside a Svelte component's `<script>` block
 * that is a descendant of a Provider component.
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