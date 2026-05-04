/**
 * The ui-solid module of the TinyBase project provides primitives and
 * components for using TinyBase in Solid applications.
 *
 * The primitives in this module provide access to the data and structures
 * exposed by other modules in the project. They return Solid Accessor
 * functions and register listeners so components using those primitives update
 * when data changes.
 *
 * Unlike React hooks, the primitive signatures do not include dependency-list
 * parameters. Solid tracks reactive reads automatically, and the primitives
 * update when their Store data or accessor arguments change. Prefer passing
 * reactive values as accessor functions, such as `() => props.tableId`.
 * @see Building UIs guides
 * @see Building UIs With Metrics guide
 * @see Building UIs With Indexes guide
 * @see Building UIs With Relationships guide
 * @see Building UIs With Queries guide
 * @see Building UIs With Checkpoints guide
 * @packageDocumentation
 * @module ui-solid
 * @since v8.3.0
 */
/// ui-solid
/**
 * The MaybeAccessor type represents a value that can be provided either as a
 * plain value or as a Solid Accessor function.
 *
 * When an Accessor is provided to a primitive, its reactive reads are tracked
 * so the primitive updates when the Accessor value changes. This is the
 * idiomatic way to pass changing props, such as `() => props.tableId`.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.MaybeAccessor
/**
 * The StoreOrStoreId type is used when you need to refer to a Store in a
 * ui-solid primitive or component.
 *
 * In simple cases you can pass a Store object directly. When using the
 * Provider component, you can also pass the Id of a Store that has been placed
 * into context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.StoreOrStoreId
/**
 * The MetricsOrMetricsId type is used when you need to refer to a Metrics
 * object in a ui-solid primitive or component.
 *
 * You can pass a Metrics object directly, or pass the Id of a Metrics object
 * that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.MetricsOrMetricsId
/**
 * The IndexesOrIndexesId type is used when you need to refer to an Indexes
 * object in a ui-solid primitive or component.
 *
 * You can pass an Indexes object directly, or pass the Id of an Indexes object
 * that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.IndexesOrIndexesId
/**
 * The RelationshipsOrRelationshipsId type is used when you need to refer to a
 * Relationships object in a ui-solid primitive or component.
 *
 * You can pass a Relationships object directly, or pass the Id of a
 * Relationships object that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.RelationshipsOrRelationshipsId
/**
 * The QueriesOrQueriesId type is used when you need to refer to a Queries
 * object in a ui-solid primitive or component.
 *
 * You can pass a Queries object directly, or pass the Id of a Queries object
 * that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.QueriesOrQueriesId
/**
 * The CheckpointsOrCheckpointsId type is used when you need to refer to a
 * Checkpoints object in a ui-solid primitive or component.
 *
 * You can pass a Checkpoints object directly, or pass the Id of a Checkpoints
 * object that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.CheckpointsOrCheckpointsId
/**
 * The PersisterOrPersisterId type is used when you need to refer to a
 * Persister object in a ui-solid primitive or component.
 *
 * You can pass a Persister object directly, or pass the Id of a Persister
 * object that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.PersisterOrPersisterId
/**
 * The SynchronizerOrSynchronizerId type is used when you need to refer to a
 * Synchronizer object in a ui-solid primitive or component.
 *
 * You can pass a Synchronizer object directly, or pass the Id of a
 * Synchronizer object that has been placed into Provider context.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.SynchronizerOrSynchronizerId
/**
 * The UndoOrRedoInformation type is an array that describes whether and how a
 * Checkpoints object can move the underlying Store backward or forward.
 *
 * This type is useful when building undo and redo buttons with the
 * useUndoInformation primitive and the useRedoInformation primitive.
 * @category Identity
 * @since v8.3.0
 */
/// ui-solid.UndoOrRedoInformation
/**
 * The useCreateStore primitive creates a Store object for use in a Solid
 * application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @example
 * ```js
 * import {createRoot} from 'solid-js';
 * import {createStore} from 'tinybase';
 * import {useCreateStore} from 'tinybase/ui-solid';
 *
 * createRoot((dispose) => {
 *   const store = useCreateStore(() =>
 *     createStore().setCell('pets', 'fido', 'species', 'dog'),
 *   );
 *   console.log(store().getCell('pets', 'fido', 'species'));
 *   // -> 'dog'
 *   dispose();
 * });
 * ```
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateStore
/**
 * The useCreateMergeableStore primitive creates a Mergeable Store object for
 * use in a Solid application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateMergeableStore
/**
 * The useStoreIds primitive returns a Solid Accessor for the Ids of store
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useStoreIds
/**
 * The useStore primitive returns a Solid Accessor for the current store.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useStore
/**
 * The useStores primitive returns a Solid Accessor for the current stores.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useStores
/**
 * The useStoreOrStoreById primitive returns a Solid Accessor for a store or
 * store object, resolving either a direct object or an Id from Provider
 * context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useStoreOrStoreById
/**
 * The useProvideStore primitive places a Store object into Provider context
 * from within a Solid component.
 *
 * Components and primitives below that context can then refer to it by Id.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useProvideStore
/**
 * The useHasTables primitive returns a Solid Accessor for whether the tables
 * exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasTables
/**
 * The useTables primitive returns a Solid Accessor for the current tables.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTables
/**
 * The useTablesState primitive returns a Solid Accessor for the current tables
 * and a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTablesState
/**
 * The useTableIds primitive returns a Solid Accessor for the Ids of table
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTableIds
/**
 * The useHasTable primitive returns a Solid Accessor for whether the table
 * exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasTable
/**
 * The useTable primitive returns a Solid Accessor for the current table.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTable
/**
 * The useTableState primitive returns a Solid Accessor for the current table
 * and a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTableState
/**
 * The useTableCellIds primitive returns a Solid Accessor for the Ids of table
 * cell objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTableCellIds
/**
 * The useHasTableCell primitive returns a Solid Accessor for whether the table
 * cell exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasTableCell
/**
 * The useRowCount primitive returns a Solid Accessor for the current row
 * count.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRowCount
/**
 * The useRowIds primitive returns a Solid Accessor for the Ids of row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRowIds
/**
 * The useSortedRowIds primitive returns a Solid Accessor for the Ids of sorted
 * row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSortedRowIds
/**
 * This useSortedRowIds overload accepts its sorting options as a single object.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSortedRowIds.2
/**
 * The useHasRow primitive returns a Solid Accessor for whether the row exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasRow
/**
 * The useRow primitive returns a Solid Accessor for the current row.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRow
/**
 * The useRowState primitive returns a Solid Accessor for the current row and a
 * setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRowState
/**
 * The useCellIds primitive returns a Solid Accessor for the Ids of cell
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCellIds
/**
 * The useHasCell primitive returns a Solid Accessor for whether the cell
 * exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasCell
/**
 * The useCell primitive returns a Solid Accessor for the current cell.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @example
 * ```js
 * import {createRoot} from 'solid-js';
 * import {createStore} from 'tinybase';
 * import {useCell} from 'tinybase/ui-solid';
 *
 * createRoot((dispose) => {
 *   const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 *   const species = useCell('pets', 'fido', 'species', store);
 *   console.log(species());
 *   // -> 'dog'
 *   dispose();
 * });
 * ```
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCell
/**
 * The useCellState primitive returns a Solid Accessor for the current cell and
 * a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCellState
/**
 * The useHasValues primitive returns a Solid Accessor for whether the values
 * exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasValues
/**
 * The useValues primitive returns a Solid Accessor for the current values.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValues
/**
 * The useValuesState primitive returns a Solid Accessor for the current values
 * and a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValuesState
/**
 * The useValueIds primitive returns a Solid Accessor for the Ids of value
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValueIds
/**
 * The useHasValue primitive returns a Solid Accessor for whether the value
 * exists.
 *
 * The Accessor updates when the underlying Store data changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasValue
/**
 * The useValue primitive returns a Solid Accessor for the current value.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValue
/**
 * The useValueState primitive returns a Solid Accessor for the current value
 * and a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValueState
/**
 * The useSetTablesCallback primitive returns a stable callback that performs
 * the set tables operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetTablesCallback
/**
 * The useSetTableCallback primitive returns a stable callback that performs
 * the set table operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetTableCallback
/**
 * The useSetRowCallback primitive returns a stable callback that performs the
 * set row operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetRowCallback
/**
 * The useAddRowCallback primitive returns a stable callback that performs the
 * add row operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useAddRowCallback
/**
 * The useSetPartialRowCallback primitive returns a stable callback that
 * performs the set partial row operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetPartialRowCallback
/**
 * The useSetCellCallback primitive returns a stable callback that performs the
 * set cell operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @example
 * ```js
 * import {createRoot} from 'solid-js';
 * import {createStore} from 'tinybase';
 * import {useCell, useSetCellCallback} from 'tinybase/ui-solid';
 *
 * createRoot((dispose) => {
 *   const store = createStore().setCell('pets', 'fido', 'sold', false);
 *   const sold = useCell('pets', 'fido', 'sold', store);
 *   const sell = useSetCellCallback('pets', 'fido', 'sold', () => true, store);
 *   sell();
 *   console.log(sold());
 *   // -> true
 *   dispose();
 * });
 * ```
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetCellCallback
/**
 * The useSetValuesCallback primitive returns a stable callback that performs
 * the set values operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetValuesCallback
/**
 * The useSetPartialValuesCallback primitive returns a stable callback that
 * performs the set partial values operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetPartialValuesCallback
/**
 * The useSetValueCallback primitive returns a stable callback that performs
 * the set value operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetValueCallback
/**
 * The useDelTablesCallback primitive returns a stable callback that performs
 * the del tables operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDelTablesCallback
/**
 * The useDelTableCallback primitive returns a stable callback that performs
 * the del table operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDelTableCallback
/**
 * The useDelRowCallback primitive returns a stable callback that performs the
 * del row operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDelRowCallback
/**
 * The useDelCellCallback primitive returns a stable callback that performs the
 * del cell operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDelCellCallback
/**
 * The useDelValuesCallback primitive returns a stable callback that performs
 * the del values operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDelValuesCallback
/**
 * The useDelValueCallback primitive returns a stable callback that performs
 * the del value operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDelValueCallback
/**
 * The useHasTablesListener primitive registers a has tables listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasTablesListener
/**
 * The useTablesListener primitive registers a tables listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTablesListener
/**
 * The useTableIdsListener primitive registers a table ids listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTableIdsListener
/**
 * The useHasTableListener primitive registers a has table listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasTableListener
/**
 * The useTableListener primitive registers a table listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTableListener
/**
 * The useTableCellIdsListener primitive registers a table cell ids listener in
 * a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useTableCellIdsListener
/**
 * The useHasTableCellListener primitive registers a has table cell listener in
 * a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasTableCellListener
/**
 * The useRowCountListener primitive registers a row count listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRowCountListener
/**
 * The useRowIdsListener primitive registers a row ids listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRowIdsListener
/**
 * The useSortedRowIdsListener primitive registers a sorted row ids listener in
 * a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSortedRowIdsListener
/**
 * This useSortedRowIdsListener overload accepts its sorting options as a
 * single object.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSortedRowIdsListener.2
/**
 * The useHasRowListener primitive registers a has row listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasRowListener
/**
 * The useRowListener primitive registers a row listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRowListener
/**
 * The useCellIdsListener primitive registers a cell ids listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCellIdsListener
/**
 * The useHasCellListener primitive registers a has cell listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasCellListener
/**
 * The useCellListener primitive registers a cell listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @example
 * ```js
 * import {createRoot} from 'solid-js';
 * import {createStore} from 'tinybase';
 * import {useCellListener} from 'tinybase/ui-solid';
 *
 * createRoot((dispose) => {
 *   const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 *   useCellListener(
 *     'pets',
 *     'fido',
 *     'species',
 *     (_store, _tableId, _rowId, _cellId, newCell) => console.log(newCell),
 *     false,
 *     store,
 *   );
 *   store.setCell('pets', 'fido', 'species', 'guide dog');
 *   // -> 'guide dog'
 *   dispose();
 * });
 * ```
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCellListener
/**
 * The useHasValuesListener primitive registers a has values listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasValuesListener
/**
 * The useValuesListener primitive registers a values listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValuesListener
/**
 * The useValueIdsListener primitive registers a value ids listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValueIdsListener
/**
 * The useHasValueListener primitive registers a has value listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useHasValueListener
/**
 * The useValueListener primitive registers a value listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useValueListener
/**
 * The useStartTransactionListener primitive registers a start transaction
 * listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useStartTransactionListener
/**
 * The useWillFinishTransactionListener primitive registers a will finish
 * transaction listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useWillFinishTransactionListener
/**
 * The useDidFinishTransactionListener primitive registers a did finish
 * transaction listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useDidFinishTransactionListener
/**
 * The useCreateMetrics primitive creates a Metrics object for use in a Solid
 * application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateMetrics
/**
 * The useMetricsIds primitive returns a Solid Accessor for the Ids of metrics
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useMetricsIds
/**
 * The useMetrics primitive returns a Solid Accessor for the current metrics.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useMetrics
/**
 * The useMetricsOrMetricsById primitive returns a Solid Accessor for a metrics
 * or metrics object, resolving either a direct object or an Id from Provider
 * context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useMetricsOrMetricsById
/**
 * The useMetricIds primitive returns a Solid Accessor for the Ids of metric
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useMetricIds
/**
 * The useMetric primitive returns a Solid Accessor for the current metric.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useMetric
/**
 * The useMetricListener primitive registers a metric listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useMetricListener
/**
 * The useCreateIndexes primitive creates a Indexes object for use in a Solid
 * application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateIndexes
/**
 * The useIndexesIds primitive returns a Solid Accessor for the Ids of indexes
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useIndexesIds
/**
 * The useIndexes primitive returns a Solid Accessor for the current indexes.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useIndexes
/**
 * The useIndexesOrIndexesById primitive returns a Solid Accessor for a indexes
 * or indexes object, resolving either a direct object or an Id from Provider
 * context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useIndexesOrIndexesById
/**
 * The useIndexIds primitive returns a Solid Accessor for the Ids of index
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useIndexIds
/**
 * The useSliceIds primitive returns a Solid Accessor for the Ids of slice
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSliceIds
/**
 * The useSliceRowIds primitive returns a Solid Accessor for the Ids of slice
 * row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSliceRowIds
/**
 * The useSliceIdsListener primitive registers a slice ids listener in a Solid
 * component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSliceIdsListener
/**
 * The useSliceRowIdsListener primitive registers a slice row ids listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSliceRowIdsListener
/**
 * The useCreateRelationships primitive creates a Relationships object for use
 * in a Solid application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateRelationships
/**
 * The useRelationshipsIds primitive returns a Solid Accessor for the Ids of
 * relationships objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRelationshipsIds
/**
 * The useRelationships primitive returns a Solid Accessor for the current
 * relationships.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRelationships
/**
 * The useRelationshipsOrRelationshipsById primitive returns a Solid Accessor
 * for a relationships or relationships object, resolving either a direct
 * object or an Id from Provider context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRelationshipsOrRelationshipsById
/**
 * The useRelationshipIds primitive returns a Solid Accessor for the Ids of
 * relationship objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRelationshipIds
/**
 * The useRemoteRowId primitive returns a Solid Accessor for the current remote
 * row id.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRemoteRowId
/**
 * The useLocalRowIds primitive returns a Solid Accessor for the Ids of local
 * row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useLocalRowIds
/**
 * The useLinkedRowIds primitive returns a Solid Accessor for the Ids of linked
 * row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useLinkedRowIds
/**
 * The useRemoteRowIdListener primitive registers a remote row id listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRemoteRowIdListener
/**
 * The useLocalRowIdsListener primitive registers a local row ids listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useLocalRowIdsListener
/**
 * The useLinkedRowIdsListener primitive registers a linked row ids listener in
 * a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useLinkedRowIdsListener
/**
 * The useCreateQueries primitive creates a Queries object for use in a Solid
 * application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateQueries
/**
 * The useQueriesIds primitive returns a Solid Accessor for the Ids of queries
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useQueriesIds
/**
 * The useQueries primitive returns a Solid Accessor for the current queries.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useQueries
/**
 * The useQueriesOrQueriesById primitive returns a Solid Accessor for a queries
 * or queries object, resolving either a direct object or an Id from Provider
 * context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useQueriesOrQueriesById
/**
 * The useQueryIds primitive returns a Solid Accessor for the Ids of query
 * objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useQueryIds
/**
 * The useResultTable primitive returns a Solid Accessor for the current result
 * table.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultTable
/**
 * The useResultTableCellIds primitive returns a Solid Accessor for the Ids of
 * result table cell objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultTableCellIds
/**
 * The useResultRowCount primitive returns a Solid Accessor for the current
 * result row count.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultRowCount
/**
 * The useResultRowIds primitive returns a Solid Accessor for the Ids of result
 * row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultRowIds
/**
 * The useResultSortedRowIds primitive returns a Solid Accessor for the Ids of
 * result sorted row objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultSortedRowIds
/**
 * The useResultRow primitive returns a Solid Accessor for the current result
 * row.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultRow
/**
 * The useResultCellIds primitive returns a Solid Accessor for the Ids of
 * result cell objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultCellIds
/**
 * The useResultCell primitive returns a Solid Accessor for the current result
 * cell.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultCell
/**
 * The useResultTableListener primitive registers a result table listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultTableListener
/**
 * The useResultTableCellIdsListener primitive registers a result table cell
 * ids listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultTableCellIdsListener
/**
 * The useResultRowCountListener primitive registers a result row count
 * listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultRowCountListener
/**
 * The useResultRowIdsListener primitive registers a result row ids listener in
 * a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultRowIdsListener
/**
 * The useResultSortedRowIdsListener primitive registers a result sorted row
 * ids listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultSortedRowIdsListener
/**
 * The useResultRowListener primitive registers a result row listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultRowListener
/**
 * The useResultCellIdsListener primitive registers a result cell ids listener
 * in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultCellIdsListener
/**
 * The useResultCellListener primitive registers a result cell listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useResultCellListener
/**
 * The useParamValues primitive returns a Solid Accessor for the current param
 * values.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useParamValues
/**
 * The useParamValuesState primitive returns a Solid Accessor for the current
 * param values and a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useParamValuesState
/**
 * The useParamValue primitive returns a Solid Accessor for the current param
 * value.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useParamValue
/**
 * The useParamValueState primitive returns a Solid Accessor for the current
 * param value and a setter for updating it.
 *
 * The Accessor updates when the underlying Store data changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useParamValueState
/**
 * The useParamValuesListener primitive registers a param values listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useParamValuesListener
/**
 * The useParamValueListener primitive registers a param value listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useParamValueListener
/**
 * The useSetParamValueCallback primitive returns a stable callback that
 * performs the set param value operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetParamValueCallback
/**
 * The useSetParamValuesCallback primitive returns a stable callback that
 * performs the set param values operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetParamValuesCallback
/**
 * The useCreateCheckpoints primitive creates a Checkpoints object for use in a
 * Solid application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateCheckpoints
/**
 * The useCheckpointsIds primitive returns a Solid Accessor for the Ids of
 * checkpoints objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpointsIds
/**
 * The useCheckpoints primitive returns a Solid Accessor for the current
 * checkpoints.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpoints
/**
 * The useCheckpointsOrCheckpointsById primitive returns a Solid Accessor for a
 * checkpoints or checkpoints object, resolving either a direct object or an Id
 * from Provider context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpointsOrCheckpointsById
/**
 * The useCheckpointIds primitive returns a Solid Accessor for the Ids of
 * checkpoint objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpointIds
/**
 * The useCheckpoint primitive returns a Solid Accessor for the current
 * checkpoint.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpoint
/**
 * The useSetCheckpointCallback primitive returns a stable callback that
 * performs the set checkpoint operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSetCheckpointCallback
/**
 * The useGoBackwardCallback primitive returns a stable callback that performs
 * the go backward operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useGoBackwardCallback
/**
 * The useGoForwardCallback primitive returns a stable callback that performs
 * the go forward operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useGoForwardCallback
/**
 * The useGoToCallback primitive returns a stable callback that performs the go
 * to operation.
 *
 * Id parameters may be plain values, Solid Accessors, or functions derived
 * from the callback parameter where supported. The optional `then` callback
 * runs after the Store has been updated.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useGoToCallback
/**
 * The useUndoInformation primitive returns a Solid Accessor for the current
 * undo information.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useUndoInformation
/**
 * The useRedoInformation primitive returns a Solid Accessor for the current
 * redo information.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useRedoInformation
/**
 * The useCheckpointIdsListener primitive registers a checkpoint ids listener
 * in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpointIdsListener
/**
 * The useCheckpointListener primitive registers a checkpoint listener in a
 * Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCheckpointListener
/**
 * The useCreatePersister primitive creates a Persister object for use in a
 * Solid application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreatePersister
/**
 * The usePersisterIds primitive returns a Solid Accessor for the Ids of
 * persister objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.usePersisterIds
/**
 * The usePersister primitive returns a Solid Accessor for the current
 * persister.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.usePersister
/**
 * The usePersisterOrPersisterById primitive returns a Solid Accessor for a
 * persister or persister object, resolving either a direct object or an Id
 * from Provider context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.usePersisterOrPersisterById
/**
 * The usePersisterStatus primitive returns a Solid Accessor for the current
 * persister status.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.usePersisterStatus
/**
 * The usePersisterStatusListener primitive registers a persister status
 * listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.usePersisterStatusListener
/**
 * The useCreateSynchronizer primitive creates a Synchronizer object for use in
 * a Solid application.
 *
 * It returns a Solid Accessor. The object is created once within the current
 * reactive owner and cleaned up when that owner is disposed.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useCreateSynchronizer
/**
 * The useSynchronizerIds primitive returns a Solid Accessor for the Ids of
 * synchronizer objects.
 *
 * The Accessor updates whenever the underlying Id list changes.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSynchronizerIds
/**
 * The useSynchronizer primitive returns a Solid Accessor for the current
 * synchronizer.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSynchronizer
/**
 * The useSynchronizerOrSynchronizerById primitive returns a Solid Accessor for
 * a synchronizer or synchronizer object, resolving either a direct object or
 * an Id from Provider context.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSynchronizerOrSynchronizerById
/**
 * The useSynchronizerStatus primitive returns a Solid Accessor for the current
 * synchronizer status.
 *
 * The Accessor updates when the underlying TinyBase object changes, and Id
 * parameters may be plain values or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSynchronizerStatus
/**
 * The useSynchronizerStatusListener primitive registers a synchronizer status
 * listener in a Solid component.
 *
 * The listener is added when the primitive runs and is automatically removed
 * when the current reactive owner is disposed. Parameters may be plain values
 * or Solid Accessors.
 * @category Primitives
 * @since v8.3.0
 */
/// ui-solid.useSynchronizerStatusListener
/**
 * The ExtraProps type describes an arbitrary object of additional props that
 * can be passed to child components rendered by TinyBase view components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ExtraProps
/**
 * The TablesProps type describes the props accepted by the TablesView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TablesProps
/**
 * The TableProps type describes the props accepted by the TableView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps
/**
 * The SortedTableProps type describes the props accepted by the
 * SortedTableView Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps
/**
 * The RowProps type describes the props accepted by the RowView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps
/**
 * The CellProps type describes the props accepted by the CellView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CellProps
/**
 * The ValuesProps type describes the props accepted by the ValuesView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValuesProps
/**
 * The ValueProps type describes the props accepted by the ValueView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValueProps
/**
 * The MetricProps type describes the props accepted by the MetricView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.MetricProps
/**
 * The IndexProps type describes the props accepted by the IndexView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps
/**
 * The SliceProps type describes the props accepted by the SliceView Solid
 * component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps
/**
 * The RemoteRowProps type describes the props accepted by the RemoteRowView
 * Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps
/**
 * The LocalRowsProps type describes the props accepted by the LocalRowsView
 * Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps
/**
 * The LinkedRowsProps type describes the props accepted by the LinkedRowsView
 * Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps
/**
 * The ResultTableProps type describes the props accepted by the
 * ResultTableView Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps
/**
 * The ResultSortedTableProps type describes the props accepted by the
 * ResultSortedTableView Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps
/**
 * The ResultRowProps type describes the props accepted by the ResultRowView
 * Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps
/**
 * The ResultCellProps type describes the props accepted by the ResultCellView
 * Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultCellProps
/**
 * The CheckpointProps type describes the props accepted by the CheckpointView
 * Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CheckpointProps
/**
 * The BackwardCheckpointsProps type describes the props accepted by the
 * BackwardCheckpointsView Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsProps
/**
 * The CurrentCheckpointProps type describes the props accepted by the
 * CurrentCheckpointView Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CurrentCheckpointProps
/**
 * The ForwardCheckpointsProps type describes the props accepted by the
 * ForwardCheckpointsView Solid component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsProps
/**
 * ProviderProps props are used with the Provider component to place Store,
 * Metrics, Indexes, Relationships, Queries, Checkpoints, Persisters, and
 * Synchronizers into Solid context.
 *
 * One object of each type can be provided as a default, and additional objects
 * can be provided by Id with the `___ById` props.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps
/**
 * The ComponentReturnType type is the JSX return type used by Solid view
 * components in this module.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ComponentReturnType
/**
 * The Provider component places TinyBase objects into Solid context for its
 * children.
 *
 * Use it when several primitives or view components need access to the same
 * Store, Metrics, Indexes, Relationships, Queries, Checkpoints, Persisters, or
 * Synchronizers.
 * @example
 * ```js
 * import {createRoot} from 'solid-js';
 * import {createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-solid';
 *
 * createRoot((dispose) => {
 *   const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 *   const provider = Provider({store, children: 'content'});
 *   console.log(typeof provider);
 *   // -> 'function'
 *   dispose();
 * });
 * ```
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.Provider
/**
 * The CellView component renders the cell using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.CellView
/**
 * The RowView component renders the row using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.RowView
/**
 * The SortedTableView component renders the sorted table using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.SortedTableView
/**
 * The TableView component renders the table using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.TableView
/**
 * The TablesView component renders the tables using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @example
 * ```js
 * import {createRoot} from 'solid-js';
 * import {createStore} from 'tinybase';
 * import {TablesView} from 'tinybase/ui-solid';
 *
 * createRoot((dispose) => {
 *   const store = createStore().setCell('pets', 'fido', 'species', 'dog');
 *   const view = TablesView({store, debugIds: true});
 *   console.log(typeof view);
 *   // -> 'function'
 *   dispose();
 * });
 * ```
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.TablesView
/**
 * The ValueView component renders the value using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ValueView
/**
 * The ValuesView component renders the values using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ValuesView
/**
 * The MetricView component renders the metric using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.MetricView
/**
 * The SliceView component renders the slice using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.SliceView
/**
 * The IndexView component renders the index using ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.IndexView
/**
 * The RemoteRowView component renders the remote row using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.RemoteRowView
/**
 * The LocalRowsView component renders the local rows using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.LocalRowsView
/**
 * The LinkedRowsView component renders the linked rows using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsView
/**
 * The ResultCellView component renders the result cell using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ResultCellView
/**
 * The ResultRowView component renders the result row using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ResultRowView
/**
 * The ResultSortedTableView component renders the result sorted table using
 * ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableView
/**
 * The ResultTableView component renders the result table using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ResultTableView
/**
 * The CheckpointView component renders the checkpoint using ui-solid
 * primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.CheckpointView
/**
 * The BackwardCheckpointsView component renders the backward checkpoints using
 * ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsView
/**
 * The CurrentCheckpointView component renders the current checkpoint using
 * ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.CurrentCheckpointView
/**
 * The ForwardCheckpointsView component renders the forward checkpoints using
 * ui-solid primitives.
 *
 * It updates automatically when the underlying TinyBase data changes and can
 * be customized with component props such as child components, separators, and
 * debug Id rendering where supported.
 * @category Components
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsView
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TablesProps.store
/**
 * A Solid component used to render each Table.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TablesProps.tableComponent
/**
 * A function that returns extra props for each Table component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TablesProps.getTableComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TablesProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TablesProps.debugIds
/**
 * The Id of the Table to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.tableId
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.store
/**
 * A Solid component used to render each Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.rowComponent
/**
 * A function that returns extra props for each Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.getRowComponentProps
/**
 * An optional list of Cell Ids to control which Cells are rendered and in what
 * order.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.customCellIds
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.TableProps.debugIds
/**
 * The Id of the Table to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.tableId
/**
 * The Id of the Cell to render, observe, or sort by.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.cellId
/**
 * Whether sorted Row Ids should be returned in descending order.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.descending
/**
 * The number of sorted Row Ids to skip.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.offset
/**
 * The maximum number of sorted Row Ids to return.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.limit
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.store
/**
 * A Solid component used to render each Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.rowComponent
/**
 * A function that returns extra props for each Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.getRowComponentProps
/**
 * An optional list of Cell Ids to control which Cells are rendered and in what
 * order.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.customCellIds
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SortedTableProps.debugIds
/**
 * The Id of the Table to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.tableId
/**
 * The Id of the Row to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.rowId
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.store
/**
 * A Solid component used to render each Cell.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.cellComponent
/**
 * A function that returns extra props for each Cell component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.getCellComponentProps
/**
 * An optional list of Cell Ids to control which Cells are rendered and in what
 * order.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.customCellIds
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RowProps.debugIds
/**
 * The Id of the Table to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CellProps.tableId
/**
 * The Id of the Row to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CellProps.rowId
/**
 * The Id of the Cell to render, observe, or sort by.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CellProps.cellId
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CellProps.store
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CellProps.debugIds
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValuesProps.store
/**
 * A Solid component used to render each Value.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValuesProps.valueComponent
/**
 * A function that returns extra props for each Value component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValuesProps.getValueComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValuesProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValuesProps.debugIds
/**
 * The Id of the Value to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValueProps.valueId
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValueProps.store
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ValueProps.debugIds
/**
 * The Id of the Metric to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.MetricProps.metricId
/**
 * A Metrics object or Metrics Id to use instead of the default Metrics object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.MetricProps.metrics
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.MetricProps.debugIds
/**
 * The Id of the Index to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps.indexId
/**
 * An Indexes object or Indexes Id to use instead of the default Indexes object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps.indexes
/**
 * A Solid component used to render each Slice.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps.sliceComponent
/**
 * A function that returns extra props for each Slice component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps.getSliceComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.IndexProps.debugIds
/**
 * The Id of the Index to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.indexId
/**
 * The Id of the Slice to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.sliceId
/**
 * An Indexes object or Indexes Id to use instead of the default Indexes object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.indexes
/**
 * A Solid component used to render each Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.rowComponent
/**
 * A function that returns extra props for each Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.getRowComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.SliceProps.debugIds
/**
 * The Id of the Relationship to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps.relationshipId
/**
 * The Id of the local Row in a Relationship lookup.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps.localRowId
/**
 * A Relationships object or Relationships Id to use instead of the default
 * Relationships object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps.relationships
/**
 * A Solid component used to render each Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps.rowComponent
/**
 * A function that returns extra props for each Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps.getRowComponentProps
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.RemoteRowProps.debugIds
/**
 * The Id of the Relationship to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.relationshipId
/**
 * The Id of the remote Row in a Relationship lookup.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.remoteRowId
/**
 * A Relationships object or Relationships Id to use instead of the default
 * Relationships object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.relationships
/**
 * A Solid component used to render each Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.rowComponent
/**
 * A function that returns extra props for each Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.getRowComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LocalRowsProps.debugIds
/**
 * The Id of the Relationship to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.relationshipId
/**
 * The Id of the first Row in a linked-rows Relationship traversal.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.firstRowId
/**
 * A Relationships object or Relationships Id to use instead of the default
 * Relationships object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.relationships
/**
 * A Solid component used to render each Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.rowComponent
/**
 * A function that returns extra props for each Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.getRowComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.LinkedRowsProps.debugIds
/**
 * The Id of the Query to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps.queryId
/**
 * A Queries object or Queries Id to use instead of the default Queries object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps.queries
/**
 * A Solid component used to render each Result Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps.resultRowComponent
/**
 * A function that returns extra props for each Result Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps.getResultRowComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultTableProps.debugIds
/**
 * The Id of the Query to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.queryId
/**
 * The Id of the Cell to render, observe, or sort by.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.cellId
/**
 * Whether sorted Row Ids should be returned in descending order.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.descending
/**
 * The number of sorted Row Ids to skip.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.offset
/**
 * The maximum number of sorted Row Ids to return.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.limit
/**
 * A Queries object or Queries Id to use instead of the default Queries object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.queries
/**
 * A Solid component used to render each Result Row.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.resultRowComponent
/**
 * A function that returns extra props for each Result Row component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.getResultRowComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultSortedTableProps.debugIds
/**
 * The Id of the Query to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.queryId
/**
 * The Id of the Row to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.rowId
/**
 * A Queries object or Queries Id to use instead of the default Queries object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.queries
/**
 * A Solid component used to render each Result Cell.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.resultCellComponent
/**
 * A function that returns extra props for each Result Cell component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.getResultCellComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultRowProps.debugIds
/**
 * The Id of the Query to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultCellProps.queryId
/**
 * The Id of the Row to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultCellProps.rowId
/**
 * The Id of the Cell to render, observe, or sort by.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultCellProps.cellId
/**
 * A Queries object or Queries Id to use instead of the default Queries object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultCellProps.queries
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ResultCellProps.debugIds
/**
 * The Id of the Checkpoint to render or observe.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CheckpointProps.checkpointId
/**
 * A Checkpoints object or Checkpoints Id to use instead of the default
 * Checkpoints object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CheckpointProps.checkpoints
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CheckpointProps.debugIds
/**
 * A Checkpoints object or Checkpoints Id to use instead of the default
 * Checkpoints object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsProps.checkpoints
/**
 * A Solid component used to render each Checkpoint.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsProps.checkpointComponent
/**
 * A function that returns extra props for each Checkpoint component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsProps.getCheckpointComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.BackwardCheckpointsProps.debugIds
/**
 * A Checkpoints object or Checkpoints Id to use instead of the default
 * Checkpoints object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CurrentCheckpointProps.checkpoints
/**
 * A Solid component used to render each Checkpoint.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CurrentCheckpointProps.checkpointComponent
/**
 * A function that returns extra props for each Checkpoint component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CurrentCheckpointProps.getCheckpointComponentProps
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.CurrentCheckpointProps.debugIds
/**
 * A Checkpoints object or Checkpoints Id to use instead of the default
 * Checkpoints object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsProps.checkpoints
/**
 * A Solid component used to render each Checkpoint.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsProps.checkpointComponent
/**
 * A function that returns extra props for each Checkpoint component.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsProps.getCheckpointComponentProps
/**
 * A Solid JSX node or string to render between repeated child components.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsProps.separator
/**
 * Whether to render TinyBase Ids alongside rendered content for debugging.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ForwardCheckpointsProps.debugIds
/**
 * A Store object or Store Id to use instead of the default Store from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.store
/**
 * An Id-keyed map of Store objects to make available in Provider context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.storesById
/**
 * A Metrics object or Metrics Id to use instead of the default Metrics object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.metrics
/**
 * An Id-keyed map of Metrics objects to make available in Provider context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.metricsById
/**
 * An Indexes object or Indexes Id to use instead of the default Indexes object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.indexes
/**
 * An Id-keyed map of Indexes objects to make available in Provider context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.indexesById
/**
 * A Relationships object or Relationships Id to use instead of the default
 * Relationships object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.relationships
/**
 * An Id-keyed map of Relationships objects to make available in Provider
 * context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.relationshipsById
/**
 * A Queries object or Queries Id to use instead of the default Queries object
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.queries
/**
 * An Id-keyed map of Queries objects to make available in Provider context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.queriesById
/**
 * A Checkpoints object or Checkpoints Id to use instead of the default
 * Checkpoints object from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.checkpoints
/**
 * An Id-keyed map of Checkpoints objects to make available in Provider
 * context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.checkpointsById
/**
 * A Persister object or Persister Id to use instead of the default Persister
 * from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.persister
/**
 * An Id-keyed map of Persister objects to make available in Provider context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.persistersById
/**
 * A Synchronizer object or Synchronizer Id to use instead of the default
 * Synchronizer from context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.synchronizer
/**
 * An Id-keyed map of Synchronizer objects to make available in Provider
 * context.
 * @category Props
 * @since v8.3.0
 */
/// ui-solid.ProviderProps.synchronizersById
