/**
 * The store module is the core of the TinyBase project and contains the types,
 * interfaces, and functions to work with Store objects.
 *
 * The main entry point to this module is the createStore function, which
 * returns a new Store. From there, you can set and get data, register
 * listeners, and use other modules to build an entire app around the state and
 * tabular data within.
 *
 * @packageDocumentation
 * @module store
 */

import {Id, IdOrNull, Ids, Json} from './common.d';

/**
 * The Tables type is the data structure representing all of the data in a
 * Store.
 *
 * A Tables object is used when setting all of the tables together with the
 * setTables method, and when getting them back out again with the getTables
 * method. A Tables object is a regular JavaScript object containing individual
 * Table objects, keyed by their Id.
 *
 * @example
 * ```js
 * const tables: Tables = {
 *   pets: {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat'},
 *   },
 *   species: {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *   },
 * };
 * ```
 * @category Store
 */
export type Tables = {[tableId: Id]: Table};

/**
 * The Table type is the data structure representing the data in a single table.
 *
 * A Table is used when setting a table with the setTable method, and when
 * getting it back out again with the getTable method. A Table object is a
 * regular JavaScript object containing individual Row objects, keyed by their
 * Id.
 *
 * @example
 * ```js
 * const table: Table = {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat'},
 * };
 * ```
 * @category Store
 */
export type Table = {[rowId: Id]: Row};

/**
 * The Row type is the data structure representing the data in a single row.
 *
 * A Row is used when setting a row with the setRow method, and when getting it
 * back out again with the getRow method. A Row object is a regular JavaScript
 * object containing individual Cell objects, keyed by their Id.
 *
 * @example
 * ```js
 * const row: Row = {species: 'dog', color: 'brown'};
 * ```
 * @category Store
 */
export type Row = {[cellId: Id]: Cell};

/**
 * The Cell type is the data structure representing the data in a single cell.
 *
 * A Cell is used when setting a cell with the setCell method, and when getting
 * it back out again with the getCell method. A Cell is a JavaScript string,
 * number, or boolean.
 *
 * @example
 * ```js
 * const cell: Cell = 'dog';
 * ```
 * @category Store
 */
export type Cell = string | number | boolean;

/**
 * The CellOrUndefined type is a data structure representing the data in a
 * single cell, or the value `undefined`.
 *
 * This is used when describing a Cell that is present _or_ that is not present,
 * such as when it has been deleted, or when describing a previous state where
 * the Cell value has since been added.
 *
 * @category Store
 */
export type CellOrUndefined = Cell | undefined;

/**
 * The Values type is the data structure representing all the keyed values in a
 * Store.
 *
 * A Values object is used when setting values with the setValues method, and
 * when getting them back out again with the getValues method. A Values object
 * is a regular JavaScript object containing individual Value objects, keyed by
 * their Id.
 *
 * @example
 * ```js
 * const values: Values = {open: true, employees: 4};
 * ```
 * @category Store
 */
export type Values = {[valueId: Id]: Value};

/**
 * The Value type is the data structure representing the data in a single keyed
 * value.
 *
 * A Value is used when setting a value with the setValue method, and when
 * getting it back out again with the getValue method. A Value is a JavaScript
 * string, number, or boolean.
 *
 * @example
 * ```js
 * const value: Value = 'dog';
 * ```
 * @category Store
 */
export type Value = string | number | boolean;

/**
 * The ValueOrUndefined type is a data structure representing the data in a
 * single value, or the value `undefined`.
 *
 * This is used when describing a Value that is present _or_ that is not
 * present, such as when it has been deleted, or when describing a previous
 * state where the Value has since been added.
 *
 * @category Store
 */
export type ValueOrUndefined = Value | undefined;

/**
 * The TableCallback type describes a function that takes a Table's Id and a
 * callback to loop over each Row within it.
 *
 * A TableCallback is provided when using the forEachTable method, so that you
 * can do something based on every Table in the Store. See that method for
 * specific examples.
 *
 * @param tableId The Id of the Table that the callback can operate on.
 * @param forEachRow A function that will let you iterate over the Row objects
 * in this Table.
 * @category Callback
 */
export type TableCallback = (
  tableId: Id,
  forEachRow: (rowCallback: RowCallback) => void,
) => void;

/**
 * The RowCallback type describes a function that takes a Row's Id and a
 * callback to loop over each Cell within it.
 *
 * A RowCallback is provided when using the forEachRow method, so that you can
 * do something based on every Row in a Table. See that method for specific
 * examples.
 *
 * @param rowId The Id of the Row that the callback can operate on.
 * @param forEachRow A function that will let you iterate over the Cell values
 * in this Row.
 * @category Callback
 */
export type RowCallback = (
  rowId: Id,
  forEachCell: (cellCallback: CellCallback) => void,
) => void;

/**
 * The CellCallback type describes a function that takes a Cell's Id and its
 * value.
 *
 * A CellCallback is provided when using the forEachCell method, so that you can
 * do something based on every Cell in a Row. See that method for specific
 * examples.
 *
 * @param cellId The Id of the Cell that the callback can operate on.
 * @param cell The value of the Cell.
 * @category Callback
 */
export type CellCallback = (cellId: Id, cell: Cell) => void;

/**
 * The ValueCallback type describes a function that takes a Value's Id and its
 * actual value.
 *
 * A ValueCallback is provided when using the forEachValue method, so that you
 * can do something based on every Value in a Store. See that method for
 * specific examples.
 *
 * @param valueId The Id of the Value that the callback can operate on.
 * @param value The Value itself.
 * @category Callback
 */
export type ValueCallback = (valueId: Id, value: Value) => void;

/**
 * The MapCell type describes a function that takes an existing Cell value and
 * returns another.
 *
 * A MapCell can be provided in the setCell method to map an existing value to a
 * new one, such as when incrementing a number. See that method for specific
 * examples.
 *
 * @param cell The current value of the Cell to map to a new value.
 * @category Callback
 */
export type MapCell = (cell: CellOrUndefined) => Cell;

/**
 * The MapValue type describes a function that takes an existing Value and
 * returns another.
 *
 * A MapValue can be provided in the setValue method to map an existing Value to
 * a new one, such as when incrementing a number. See that method for specific
 * examples.
 *
 * @param value The current Value to map to a new Value.
 * @category Callback
 */
export type MapValue = (value: ValueOrUndefined) => Value;

/**
 * The GetCell type describes a function that takes a Id and returns the Cell
 * value for a particular Row.
 *
 * A GetCell can be provided when setting definitions, as in the
 * setMetricDefinition method of a Metrics object, or the setIndexDefinition
 * method of an Indexes object. See those methods for specific examples.
 *
 * @param cellId The Id of the Cell to fetch the value for.
 * @category Callback
 */
export type GetCell = (cellId: Id) => CellOrUndefined;

/**
 * The DoRollback type describes a function that you can use to rollback the
 * transaction if it did not complete to your satisfaction.
 *
 * A DoRollback can be provided when calling the transaction method or the
 * finishTransaction method. See those methods for specific examples.
 *
 * It is called with `changedCells`, `invalidCells`, `changedValues`, and
 * `invalidValues` parameters, which inform you of the net changes that have
 * been made during the transaction, and any invalid attempts to do so,
 * respectively.
 *
 * @param changedCells Any Cells that were changed during the transaction.
 * @param invalidCells Any invalid attempts to change Cells.
 * @param changedValues Any Values that were changed during the transaction,
 * since v3.0.0.
 * @param invalidValues Any invalid attempts to change Values, since v3.0.0.
 * @category Callback
 */
export type DoRollback = (
  changedCells: ChangedCells,
  invalidCells: InvalidCells,
  changedValues: ChangedValues,
  invalidValues: InvalidValues,
) => boolean;

/**
 * The TransactionListener type describes a function that is used to listen to
 * the completion of a transaction for the Store.
 *
 * A TransactionListener is provided when using the
 * addWillFinishTransactionListener and addDidFinishTransactionListener methods.
 * See those methods for specific examples.
 *
 * When called, a TransactionListener is simply given a reference to the Store
 * and booleans to indicate whether Cell or Value data has been touched during
 * the transaction. The two flags are intended as a hint about whether
 * non-mutating listeners might be being called at the end of the transaction.
 *
 * Here, 'touched' means that Cell or Value data has either been changed, or
 * changed and then changed back to its original value during the transaction.
 * The exception is a transaction that has been rolled back, for which the value
 * of `cellsTouched` and `valuesTouched` in the listener will be `false` because
 * all changes have been reverted.
 *
 * @param store A reference to the Store that is completing a transaction.
 * @param cellsTouched Whether Cell values have been touched during the
 * transaction.
 * @param valuesTouched Whether Values have been touched during the
 * transaction, since v3.0.0.
 * @category Listener
 */
export type TransactionListener = (
  store: Store,
  cellsTouched: boolean,
  valuesTouched: boolean,
) => void;

/**
 * The TablesListener type describes a function that is used to listen to
 * changes to the whole Store.
 *
 * A TablesListener is provided when using the addTablesListener method. See
 * that method for specific examples.
 *
 * When called, a TablesListener is given a reference to the Store and a
 * GetCellChange function that can be used to query Cell values before and after
 * the current transaction.
 *
 * Note that if the listener was manually forced to be called (with the
 * callListener method rather than due to a real change in the Store), the
 * GetCellChange function will not be present.
 *
 * @param store A reference to the Store that changed.
 * @param getCellChange A function that returns information about any Cell's
 * changes.
 * @category Listener
 */
export type TablesListener = (
  store: Store,
  getCellChange: GetCellChange | undefined,
) => void;

/**
 * The TableIdsListener type describes a function that is used to listen to
 * changes to the Table Ids in the Store.
 *
 * A TableIdsListener is provided when using the addTableIdsListener method. See
 * that method for specific examples.
 *
 * When called, a TableIdsListener is given a reference to the Store.
 *
 * @param store A reference to the Store that changed.
 * @category Listener
 */
export type TableIdsListener = (store: Store) => void;

/**
 * The TableListener type describes a function that is used to listen to changes
 * to a Table.
 *
 * A TableListener is provided when using the addTableListener method. See that
 * method for specific examples.
 *
 * When called, a TableListener is given a reference to the Store, the Id of the
 * Table that changed, and a GetCellChange function that can be used to query
 * Cell values before and after the current transaction.
 *
 * Note that if the listener was manually forced to be called (with the
 * callListener method rather than due to a real change in the Store), the
 * GetCellChange function will not be present.
 *
 * @param store A reference to the Store that changed.
 * @param tableId The Id of the Table that changed.
 * @param getCellChange A function that returns information about any Cell's
 * changes.
 * @category Listener
 */
export type TableListener = (
  store: Store,
  tableId: Id,
  getCellChange: GetCellChange | undefined,
) => void;

/**
 * The RowIdsListener type describes a function that is used to listen to
 * changes to the Row Ids in a Table.
 *
 * A RowIdsListener is provided when using the addRowIdsListener method. See
 * that method for specific examples.
 *
 * When called, a RowIdsListener is given a reference to the Store, and the Id
 * of the Table whose Row Ids changed.
 *
 * @param store A reference to the Store that changed.
 * @param tableId The Id of the Table that changed.
 * @category Listener
 */
export type RowIdsListener = (store: Store, tableId: Id) => void;

/**
 * The SortedRowIdsListener type describes a function that is used to listen to
 * changes to sorted Row Ids in a Table.
 *
 * A SortedRowIdsListener is provided when using the addSortedRowIdsListener
 * method. See that method for specific examples.
 *
 * When called, a SortedRowIdsListener is given a reference to the Store, the Id
 * of the Table whose Row Ids sorting changed, the Cell Id being used to sort
 * them, whether descending or not, and the offset and limit of the number of
 * Ids returned, for pagination purposes. It also receives the sorted array of
 * Ids itself, so that you can use them in the listener without the additional
 * cost of an explicit call to getSortedRowIds.
 *
 * @param store A reference to the Store that changed.
 * @param tableId The Id of the Table whose sorted Row Ids changed.
 * @param cellId The Id of the Cell whose values were used for the sorting.
 * @param descending Whether the sorting was in descending order.
 * @param offset The number of Row Ids skipped.
 * @param limit The maximum number of Row Ids returned.
 * @param sortedRowIds The sorted Row Ids themselves.
 * @category Listener
 * @since v2.0.0
 */
export type SortedRowIdsListener = (
  store: Store,
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  sortedRowIds: Ids,
) => void;

/**
 * The RowListener type describes a function that is used to listen to changes
 * to a Row.
 *
 * A RowListener is provided when using the addRowListener method. See that
 * method for specific examples.
 *
 * When called, a RowListener is given a reference to the Store, the Id of the
 * Table that changed, the Id of the Row that changed, and a GetCellChange
 * function that can be used to query Cell values before and after the current
 * transaction.
 *
 * Note that if the listener was manually forced to be called (with the
 * callListener method rather than due to a real change in the Store), the
 * GetCellChange function will not be present.
 *
 * @param store A reference to the Store that changed.
 * @param tableId The Id of the Table that changed.
 * @param rowId The Id of the Row that changed.
 * @param getCellChange A function that returns information about any Cell's
 * changes.
 * @category Listener
 */
export type RowListener = (
  store: Store,
  tableId: Id,
  rowId: Id,
  getCellChange: GetCellChange | undefined,
) => void;

/**
 * The CellIdsListener type describes a function that is used to listen to
 * changes to the Cell Ids in a Row.
 *
 * A CellIdsListener is provided when using the addCellIdsListener method. See
 * that method for specific examples.
 *
 * When called, a CellIdsListener is given a reference to the Store, the Id of
 * the Table that changed, and the Id of the Row whose Cell Ids changed.
 *
 * @param store A reference to the Store that changed.
 * @param tableId The Id of the Table that changed.
 * @param rowId The Id of the Row that changed.
 * @category Listener
 */
export type CellIdsListener = (store: Store, tableId: Id, rowId: Id) => void;

/**
 * The CellListener type describes a function that is used to listen to changes
 * to a Cell.
 *
 * A CellListener is provided when using the addCellListener method. See that
 * method for specific examples.
 *
 * When called, a CellListener is given a reference to the Store, the Id of the
 * Table that changed, the Id of the Row that changed, and the Id of Cell that
 * changed. It is also given the new value of the Cell, the old value of the
 * Cell, and a GetCellChange function that can be used to query Cell values
 * before and after the current transaction.
 *
 * Note that if the listener was manually forced to be called (with the
 * callListener method rather than due to a real change in the Store), the
 * GetCellChange function will not be present and the new and old values of the
 * Cell will be the same.
 *
 * @param store A reference to the Store that changed.
 * @param tableId The Id of the Table that changed.
 * @param rowId The Id of the Row that changed.
 * @param cellId The Id of the Cell that changed.
 * @param newCell The new value of the Cell that changed.
 * @param oldCell The old value of the Cell that changed.
 * @param getCellChange A function that returns information about any Cell's
 * changes.
 * @category Listener
 */
export type CellListener = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  newCell: Cell,
  oldCell: Cell,
  getCellChange: GetCellChange | undefined,
) => void;

/**
 * The ValuesListener type describes a function that is used to listen to
 * changes to all the Values in a Store.
 *
 * A ValuesListener is provided when using the addValuesListener method. See
 * that method for specific examples.
 *
 * When called, a ValuesListener is given a reference to the Store and a
 * GetValueChange function that can be used to query Values before and after the
 * current transaction.
 *
 * Note that if the listener was manually forced to be called (with the
 * callListener method rather than due to a real change in the Store), the
 * GetValueChange function will not be present.
 *
 * @param store A reference to the Store that changed.
 * @param getValueChange A function that returns information about any Value's
 * changes.
 * @category Listener
 */
export type ValuesListener = (
  store: Store,
  getValueChange: GetValueChange | undefined,
) => void;

/**
 * The ValueIdsListener type describes a function that is used to listen to
 * changes to the Value Ids in a Store.
 *
 * A ValueIdsListener is provided when using the addValueIdsListener method. See
 * that method for specific examples.
 *
 * When called, a ValueIdsListener is given a reference to the Store.
 *
 * @param store A reference to the Store that changed.
 * @category Listener
 */
export type ValueIdsListener = (store: Store) => void;

/**
 * The ValueListener type describes a function that is used to listen to changes
 * to a Value.
 *
 * A ValueListener is provided when using the addValueListener method. See that
 * method for specific examples.
 *
 * When called, a ValueListener is given a reference to the Store and the Id of
 * Value that changed. It is also given the new value of the Value, the old
 * value of the Value, and a GetValueChange function that can be used to query
 * Values before and after the current transaction.
 *
 * Note that if the listener was manually forced to be called (with the
 * callListener method rather than due to a real change in the Store), the
 * GetValueChange function will not be present and the new and old values of the
 * Value will be the same.
 *
 * @param store A reference to the Store that changed.
 * @param valueId The Id of the Value that changed.
 * @param newValue The new value of the Value that changed.
 * @param oldValue The old value of the Value that changed.
 * @param getValueChange A function that returns information about any Value's
 * changes.
 * @category Listener
 */
export type ValueListener = (
  store: Store,
  valueId: Id,
  newValue: Value,
  oldValue: Value,
  getValueChange: GetValueChange | undefined,
) => void;

/**
 * The InvalidCellListener type describes a function that is used to listen to
 * attempts to set invalid data to a Cell.
 *
 * A InvalidCellListener is provided when using the addInvalidCellListener
 * method. See that method for specific examples.
 *
 * When called, a InvalidCellListener is given a reference to the Store, the Id
 * of the Table, the Id of the Row, and the Id of Cell that was being attempted
 * to be changed. It is also given the invalid value of the Cell, which could
 * have been of absolutely any type. Since there could have been multiple failed
 * attempts to set the Cell within a single transaction, this is an array
 * containing each attempt, chronologically.
 *
 * @param store A reference to the Store that was being changed.
 * @param tableId The Id of the Table that was being changed.
 * @param rowId The Id of the Row that was being changed.
 * @param cellId The Id of the Cell that was being changed.
 * @param invalidCells An array of the values of the Cell that were invalid.
 * @category Listener
 * @since v1.1.0
 */
export type InvalidCellListener = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  invalidCells: any[],
) => void;

/**
 * The InvalidValueListener type describes a function that is used to listen to
 * attempts to set invalid data to a Value.
 *
 * A InvalidValueListener is provided when using the addInvalidValueListener
 * method. See that method for specific examples.
 *
 * When called, a InvalidValueListener is given a reference to the Store and the
 * Id of Value that was being attempted to be changed. It is also given the
 * invalid value of the Value, which could have been of absolutely any type.
 * Since there could have been multiple failed attempts to set the Value within
 * a single transaction, this is an array containing each attempt,
 * chronologically.
 *
 * @param store A reference to the Store that was being changed.
 * @param valueId The Id of the Value that was being changed.
 * @param invalidValues An array of the Values that were invalid.
 * @category Listener
 * @since v3.0.0
 */
export type InvalidValueListener = (
  store: Store,
  valueId: Id,
  invalidValues: any[],
) => void;

/**
 * The GetCellChange type describes a function that returns information about
 * any Cell's changes during a transaction.
 *
 * A GetCellChange function is provided to every listener when called due the
 * Store changing. The listener can then fetch the previous value of a Cell
 * before the current transaction, the new value after it, and a convenience
 * flag that indicates that the value has changed.
 *
 * @param tableId The Id of the Table to inspect.
 * @param rowId The Id of the Row to inspect.
 * @param cellId The Id of the Cell to inspect.
 * @returns A CellChange array containing information about the Cell's changes.
 * @category Listener
 */
export type GetCellChange = (tableId: Id, rowId: Id, cellId: Id) => CellChange;

/**
 * The CellChange type describes a Cell's changes during a transaction.
 *
 * This is returned by the GetCellChange function that is provided to every
 * listener when called. This array contains the previous value of a Cell before
 * the current transaction, the new value after it, and a convenience flag that
 * indicates that the value has changed.
 *
 * @category Listener
 */
export type CellChange = [
  changed: boolean,
  oldCell: CellOrUndefined,
  newCell: CellOrUndefined,
];

/**
 * The GetValueChange type describes a function that returns information about
 * any Value's changes during a transaction.
 *
 * A GetValueChange function is provided to every listener when called due the
 * Store changing. The listener can then fetch the previous value of a Value
 * before the current transaction, the new value after it, and a convenience
 * flag that indicates that the value has changed.
 *
 * @param valueId The Id of the Value to inspect.
 * @returns A ValueChange array containing information about the Value's
 * changes.
 * @category Listener
 */
export type GetValueChange = (valueId: Id) => ValueChange;

/**
 * The ValueChange type describes a Value's changes during a transaction.
 *
 * This is returned by the GetValueChange function that is provided to every
 * listener when called. This array contains the previous value of a Value
 * before the current transaction, the new value after it, and a convenience
 * flag that indicates that the value has changed.
 *
 * @category Listener
 */
export type ValueChange = [
  changed: boolean,
  oldValue: ValueOrUndefined,
  newValue: ValueOrUndefined,
];

/**
 * The TablesSchema type describes the tabular structure of a Store in terms of
 * valid Table Ids and the types of Cell that can exist within them.
 *
 * A TablesSchema comprises a JavaScript object describing each Table, in turn a
 * nested JavaScript object containing information about each Cell and its
 * CellSchema. It is provided to the setTablesSchema method.
 *
 * @example
 * When applied to a Store, this TablesSchema only allows one Table called
 * `pets`, in which each Row may contain a string `species` Cell, and is
 * guaranteed to contain a boolean `sold` Cell that defaults to `false`.
 *
 *```js
 * const tableSchema: TablesSchema = {
 *   pets: {
 *     species: {type: 'string'},
 *     sold: {type: 'boolean', default: false},
 *   },
 * };
 * ```
 * @category Schema
 */
export type TablesSchema = {
  [tableId: Id]: {
    [cellId: Id]: CellSchema;
  };
};

/**
 * The CellSchema type describes what values are allowed for each Cell in a
 * Table.
 *
 * A CellSchema specifies the type of the Cell (`string`, `boolean`, or
 * `number`), and what the default value can be when an explicit value is not
 * specified.
 *
 * If a default value is provided (and its type is correct), you can be certain
 * that that Cell will always be present in a Row.
 *
 * If the default value is _not_ provided (or its type is incorrect), the Cell
 * may be missing from the Row, but when present you can be guaranteed it is of
 * the correct type.
 *
 * @example
 * When applied to a Store, this CellSchema ensures a boolean Cell is always
 * present, and defaults it to `false`.
 *
 *```js
 * const requiredBoolean: CellSchema = {type: 'boolean', default: false};
 * ```
 * @category Schema
 */
export type CellSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/**
 * The ValuesSchema type describes the keyed Values that can be set in a Store
 * and their types.
 *
 * A ValuesSchema comprises a JavaScript object describing each Value and its
 * ValueSchema. It is provided to the setValuesSchema method.
 *
 * @example
 * When applied to a Store, this ValuesSchema only allows one boolean Value
 * called `open`, that defaults to `false`.
 *
 *```js
 * const valuesSchema: ValuesSchema = {
 *   open: {type: 'boolean', default: false},
 * };
 * ```
 * @category Schema
 * @since v3.0.0
 */
export type ValuesSchema = {
  [valueId: Id]: ValueSchema;
};

/**
 * The ValueSchema type describes what values are allowed for keyed Values in a
 * Store.
 *
 * A ValueSchema specifies the type of the Value (`string`, `boolean`, or
 * `number`), and what the default value can be when an explicit value is not
 * specified.
 *
 * If a default value is provided (and its type is correct), you can be certain
 * that the Value will always be present in a Store.
 *
 * If the default value is _not_ provided (or its type is incorrect), the Value
 * may not be present in the Store, but when present you can be guaranteed it is
 * of the correct type.
 *
 * @example
 * When applied to a Store, this ValueSchema ensures a boolean Value is always
 * present, and defaults it to `false`.
 *
 *```js
 * const requiredBoolean: ValueSchema = {type: 'boolean', default: false};
 * ```
 * @category Schema
 * @since v3.0.0
 */
export type ValueSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/**
 * The ChangedCells type describes the Cell values that have been changed during
 * a transaction, primarily used so that you can indicate whether the
 * transaction should be rolled back.
 *
 * A ChangedCells object is provided to the `doRollback` callback when using the
 * transaction method and the finishTransaction method. See those methods for
 * specific examples.
 *
 * This type is a nested structure of Table, Row, and Cell objects, much like
 * the Tables object, but one which provides both the old and new Cell values in
 * a two-part array. These are describing the state of each changed Cell in
 * Store at the _start_ of the transaction, and by the _end_ of the transaction.
 *
 * Hence, an `undefined` value for the first item in the array means that the
 * Cell was added during the transaction. An `undefined` value for the second
 * item in the array means that the Cell was removed during the transaction. An
 * array with two different Cell values indicates that it was changed. The
 * two-part array will never contain two items of the same value (including two
 * `undefined` values), even if, during the transaction, a Cell was changed to a
 * different value and then changed back.
 *
 * @category Transaction
 * @since v1.2.0
 */
export type ChangedCells = {
  [tableId: Id]: {
    [rowId: Id]: {
      [cellId: Id]: [CellOrUndefined, CellOrUndefined];
    };
  };
};

/**
 * The InvalidCells type describes the invalid Cell values that have been
 * attempted during a transaction, primarily used so that you can indicate
 * whether the transaction should be rolled back.
 *
 * An InvalidCells object is provided to the `doRollback` callback when using
 * the transaction method and the finishTransaction method. See those methods
 * for specific examples.
 *
 * This type is a nested structure of Table, Row, and Cell objects, much like
 * the Tables object, but one for which Cell values are listed in array (much
 * like the InvalidCellListener type) so that multiple failed attempts to change
 * a Cell during the transaction are described.
 *
 * @category Transaction
 * @since v1.2.0
 */
export type InvalidCells = {
  [tableId: Id]: {
    [rowId: Id]: {
      [cellId: Id]: any[];
    };
  };
};

/**
 * The ChangedValues type describes the Values that have been changed during a
 * transaction, primarily used so that you can indicate whether the transaction
 * should be rolled back.
 *
 * A ChangedValues object is provided to the `doRollback` callback when using
 * the transaction method and the finishTransaction method. See those methods
 * for specific examples.
 *
 * This type is an object containing the old and new Values in two-part arrays.
 * These are describing the state of each changed Value in Store at the _start_
 * of the transaction, and by the _end_ of the transaction.
 *
 * Hence, an `undefined` value for the first item in the array means that the
 * Value was added during the transaction. An `undefined` value for the second
 * item in the array means that the Value was removed during the transaction. An
 * array with two different Values indicates that it was changed. The two-part
 * array will never contain two items of the same value (including two
 * `undefined` values), even if, during the transaction, a Value was changed to
 * a different value and then changed back.
 *
 * @category Transaction
 * @since v3.0.0
 */
export type ChangedValues = {
  [valueId: Id]: [ValueOrUndefined, ValueOrUndefined];
};
/**
 * The InvalidValues type describes the invalid Values that have been attempted
 * during a transaction, primarily used so that you can indicate whether the
 * transaction should be rolled back.
 *
 * An InvalidValues object is provided to the `doRollback` callback when using
 * the transaction method and the finishTransaction method. See those methods
 * for specific examples.
 *
 * This type is an object containing each invalid Value's attempt listed in
 * array (much like the InvalidValueListener type) so that multiple failed
 * attempts to change a Value during the transaction are described.
 *
 * @category Transaction
 * @since v3.0.0
 */
export type InvalidValues = {
  [valueId: Id]: any[];
};

/**
 * The StoreListenerStats type describes the number of listeners registered with
 * the Store, and can be used for debugging purposes.
 *
 * The StoreListenerStats object contains a breakdown of the different types of
 * listener. Totals include both mutator and non-mutator listeners. A
 * StoreListenerStats object is returned from the getListenerStats method, and
 * is only populated in a debug build.
 *
 * @category Development
 */
export type StoreListenerStats = {
  /**
   * The number of TablesListener functions registered with the Store.
   */
  tables?: number;
  /**
   * The number of TableIdsListener functions registered with the Store.
   */
  tableIds?: number;
  /**
   * The number of TableListener functions registered with the Store.
   */
  table?: number;
  /**
   * The number of RowIdsListener functions registered with the Store.
   */
  rowIds?: number;
  /**
   * The number of SortedRowIdsListener functions registered with the Store.
   */
  sortedRowIds?: number;
  /**
   * The number of RowListener functions registered with the Store.
   */
  row?: number;
  /**
   * The number of CellIdsListener functions registered with the Store.
   */
  cellIds?: number;
  /**
   * The number of CellListener functions registered with the Store.
   */
  cell?: number;
  /**
   * The number of InvalidCellListener functions registered with the Store.
   */
  invalidCell?: number;
  /**
   * The number of ValuesListener functions registered with the Store, since
   * v3.0.0.
   */
  values?: number;
  /**
   * The number of ValueIdsListener functions registered with the Store, since
   * v3.0.0.
   */
  valueIds?: number;
  /**
   * The number of ValueListener functions registered with the Store, since
   * v3.0.0.
   */
  value?: number;
  /**
   * The number of InvalidValueListener functions registered with the Store,
   * since v3.0.0.
   */
  invalidValue?: number;
  /**
   * The number of TransactionListener functions registered with the Store.
   */
  transaction?: number;
};

/**
 * A Store is the main location for keeping both tabular data and keyed values.
 *
 * Create a Store easily with the createStore function. From there, you can set
 * and get data, add listeners for when the data changes, set schemas, and so
 * on.
 *
 * A Store has two facets. It can contain keyed Values, and independently, it
 * can contain tabular Tables data. These two facets have similar APIs but can
 * be used entirely independently: you can use only tables, only keyed Values,
 * or both tables _and_ keyed Values - all in a single Store.
 *
 * # Keyed values
 *
 * The keyed value support is best thought of as a flat JavaScript object. The
 * Store contains a number of Value objects, each with a unique ID, and which is
 * a string, boolean, or number:
 *
 * ```json
 * {                  // Store
 *   "value1": "one",   // Value (string)
 *   "value2": true,    // Value (boolean)
 *   "value3": 3,       // Value (number)
 *   ...
 * }
 * ```
 *
 * In its default form, a Store has no sense of a structured schema for the
 * Values. However, you _can_ optionally specify a ValuesSchema for a Store,
 * which then usefully constrains and defaults the Values you can use.
 *
 * # Tabular data
 *
 * The tabular data exists in a simple hierarchical structure:
 *
 * - The Store contains a number of Table objects.
 * - Each Table contains a number of Row objects.
 * - Each Row contains a number of Cell objects.
 *
 * A Cell is a string, boolean, or number value.
 *
 * The members of each level of this hierarchy are identified with a unique Id
 * (which is a string). In other words you can naively think of a Store as a
 * three-level-deep JavaScript object, keyed with strings:
 *
 * ```json
 * {                     // Store
 *   "table1": {           // Table
 *     "row1": {             // Row
 *       "cell1": "one",       // Cell (string)
 *       "cell2": true,        // Cell (boolean)
 *       "cell3": 3,           // Cell (number)
 *       ...
 *     },
 *     ...
 *   },
 *   ...
 * }
 * ```
 *
 * Again, by default Store has no sense of a structured schema. As long as they
 * are unique within their own parent, the Id keys can each be any string you
 * want. However, as you _can_ optionally specify a TablesSchema for the tabular
 * data in a Store, which then usefully constrains the Table and Cell Ids (and
 * Cell values) you can use.
 *
 * # Setting and getting data
 *
 * Every part of the Store can be accessed with getter methods. When you
 * retrieve data from the Store, you are receiving a copy - rather than a
 * reference - of it. This means that manipulating the data in the Store must be
 * performed with the equivalent setter and deleter methods.
 *
 * To benefit from the reactive behavior of the Store, you can also subscribe to
 * changes on any part of it with 'listeners'. Registering a listener returns a
 * listener Id (that you can use later to remove it with the delListener
 * method), and it will then be called every time there is a change within the
 * part of the hierarchy you're listening to.
 *
 * This table shows the main ways you can set, get, and listen to, different
 * types of data in a Store:
 *
 * |Type|Get data|Set data|Delete data|Add a listener|
 * |-|-|-|-|-|
 * |Values|getValues|setValues|delValues|addValuesListener|
 * |Value Ids|getValueIds|-|-|addValueIdsListener|
 * |Value|getValue|setValue|delValue|addValueListener|
 * |Tables|getTables|setTables|delTables|addTablesListener|
 * |Table Ids|getTableIds|-|-|addTableIdsListener|
 * |Table|getTable|setTable|delTable|addTableListener|
 * |Row Ids|getRowIds|-|-|addRowIdsListener|
 * |Row Ids (sorted)|getSortedRowIds|-|-|addSortedRowIdsListener|
 * |Row|getRow|setRow|delRow|addRowListener|
 * |Cell Ids|getCellIds|-|-|addCellIdsListener|
 * |Cell|getCell|setCell|delCell|addCellListener|
 *
 * There are two extra methods to manipulate Row objects. The addRow method is
 * like the setRow method but automatically assigns it a new unique Id. And the
 * setPartialRow method lets you update multiple Cell values in a Row without
 * affecting the others. (There is a similar setPartialValues method to do the
 * same for the Values in a Store.)
 *
 * You can listen to attempts to write invalid data to a Value or Cell with the
 * addInvalidValueListener method or addInvalidCellListener method.
 *
 * The transaction method is used to wrap multiple changes to the Store so that
 * the relevant listeners only fire once.
 *
 * The setJson method and the getJson method allow you to work with a
 * JSON-encoded representation of the entire Store, which is useful for
 * persisting it.
 *
 * Finally, the callListener method provides a way for you to manually provoke a
 * listener to be called, even if the underlying data hasn't changed. This is
 * useful when you are using mutator listeners to guarantee that data conforms
 * to programmatic conditions, and those conditions change such that you need to
 * update the Store in bulk.
 *
 * Read more about setting and changing data in The Basics guides, and about
 * listeners in the Listening to Stores guide.
 *
 * # Creating a schema
 *
 * You can set a ValuesSchema and a TablesSchema with the setValuesSchema method
 * and setTablesSchema method respectively. A TablesSchema constrains the Table
 * Ids the Store can have, and the types of Cell data in each Table. Each Cell
 * requires its type to be specified, and can also take a default value for when
 * it's not specified.
 *
 * You can also get a serialization of the schemas out of the Store with
 * the getSchemaJson method, and remove the schemas altogether with
 * the delValuesSchema method and delTablesSchema method.
 *
 * Read more about schemas in the Using Schemas guide.
 *
 * # Convenience methods
 *
 * There are a few additional helper methods to make it easier to work with a
 * Store. There are methods for easily checking the existence of a Table, Row,
 * or Cell, and iterators that let you act on the children of a common parent:
 *
 * ||Checking existence|Iterator|
 * |-|-|-|
 * |Value|hasValue|forEachValue|
 * |Table|hasTable|forEachTable|
 * |Row|hasRow|forEachRow|
 * |Cell|hasCell|forEachCell|
 *
 * Finally, the getListenerStats method describes the current state of the
 * Store's listeners for debugging purposes.
 *
 * @example
 * This example shows a very simple lifecycle of a Store: from creation, to
 * adding and getting some data, and then registering and removing a listener.
 *
 * ```js
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * console.log(store.getRow('pets', 'fido'));
 * // -> {species: 'dog'}
 *
 * store.setCell('pets', 'fido', 'color', 'brown');
 * console.log(store.getCell('pets', 'fido', 'color'));
 * // -> 'brown'
 *
 * const listenerId = store.addTableListener('pets', () => {
 *   console.log('changed');
 * });
 *
 * store.setCell('pets', 'fido', 'sold', false);
 * // -> 'changed'
 *
 * store.delListener(listenerId);
 * ```
 * @see The Basics guides
 * @see Using Schemas guides
 * @see Hello World demos
 * @see Todo App demos
 * @category Store
 */
export interface Store {
  /**
   * The getTables method returns a Tables object containing the entire data of
   * the Store.
   *
   * Note that this returns a copy of, rather than a reference to the underlying
   * data, so changes made to the returned object are not made to the Store
   * itself.
   *
   * @returns A Tables object containing the entire data of the Store.
   * @example
   * This example retrieves the data in a Store.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}}}
   * ```
   * @example
   * This example retrieves the Tables of an empty Store, returning an empty
   * object.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getTables());
   * // -> {}
   * ```
   * @see
   * # Guides
   * Creating a Store
   * @see Indexes
   * @category Getter
   */
  getTables(): Tables;

  /**
   * The getTableIds method returns the Ids of every Table in the Store.
   *
   * Note that this returns a copy of, rather than a reference, to the list of
   * Ids, so changes made to the list are not made to the Store itself.
   *
   * @returns An array of the Ids of every Table in the Store.
   * @example
   * This example retrieves the Table Ids in a Store.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   * console.log(store.getTableIds());
   * // -> ['pets', 'species']
   * ```
   * @example
   * This example retrieves the Table Ids of an empty Store, returning an empty
   * array.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getTableIds());
   * // -> []
   * ```
   * @category Getter
   */
  getTableIds(): Ids;

  /**
   * The getTable method returns an object containing the entire data of a
   * single Table in the Store.
   *
   * Note that this returns a copy of, rather than a reference to the underlying
   * data, so changes made to the returned object are not made to the Store
   * itself.
   *
   * @param tableId The Id of the Table in the Store.
   * @returns An object containing the entire data of the Table.
   * @example
   * This example retrieves the data in a single Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   * console.log(store.getTable('pets'));
   * // -> {fido: {species: 'dog'}}
   * ```
   * @example
   * This example retrieves a Table that does not exist, returning an empty
   * object.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getTable('employees'));
   * // -> {}
   * ```
   * @category Getter
   */
  getTable(tableId: Id): Table;

  /**
   * The getRowIds method returns the Ids of every Row in a given Table.
   *
   * Note that this returns a copy of, rather than a reference, to the list of
   * Ids, so changes made to the list are not made to the Store itself.
   *
   * @param tableId The Id of the Table in the Store.
   * @returns An array of the Ids of every Row in the Table.
   * @example
   * This example retrieves the Row Ids in a Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * console.log(store.getRowIds('pets'));
   * // -> ['fido', 'felix']
   * ```
   * @example
   * This example retrieves the Row Ids of a Table that does not exist,
   * returning an empty array.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getRowIds('employees'));
   * // -> []
   * ```
   * @category Getter
   */
  getRowIds(tableId: Id): Ids;

  /**
   * The getSortedRowIds method returns the Ids of every Row in a given Table,
   * sorted according to the values in a specified Cell.
   *
   * The sorting of the rows is alphanumeric, and you can indicate whether it
   * should be in descending order. The `offset` and `limit` parameters are used
   * to paginate results, but default to `0` and `undefined` to return all
   * available Row Ids if not specified.
   *
   * Note that every call to this method will perform the sorting afresh - there
   * is no caching of the results - and so you are advised to memoize the
   * results yourself, especially when the Table is large. For a performant
   * approach to tracking the sorted Row Ids when they change, use the
   * addSortedRowIdsListener method.
   *
   * If the Table does not exist, an empty array is returned.
   *
   * @param tableId The Id of the Table in the Store.
   * @param cellId The Id of the Cell whose values are used for the sorting, or
   * `undefined` to by sort the Row Id itself.
   * @param descending Whether the sorting should be in descending order.
   * @param offset The number of Row Ids to skip for pagination purposes, if
   * any.
   * @param limit The maximum number of Row Ids to return, or `undefined` for
   * all.
   * @returns An array of the sorted Ids of every Row in the Table.
   * @example
   * This example retrieves sorted Row Ids in a Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets', 'species'));
   * // -> ['felix', 'fido']
   * ```
   * @example
   * This example retrieves sorted Row Ids in a Table in reverse order.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'wolf'},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets', 'species', true));
   * // -> ['cujo', 'fido', 'felix']
   * ```
   * @example
   * This example retrieves two pages of Row Ids in a Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {price: 6},
   *     felix: {price: 5},
   *     mickey: {price: 2},
   *     tom: {price: 4},
   *     carnaby: {price: 3},
   *     lowly: {price: 1},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets', 'price', false, 0, 2));
   * // -> ['lowly', 'mickey']
   * console.log(store.getSortedRowIds('pets', 'price', false, 2, 2));
   * // -> ['carnaby', 'tom']
   * ```
   * @example
   * This example retrieves Row Ids sorted by their own value, since the
   * `cellId` parameter is undefined.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'wolf'},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets'));
   * // -> ['cujo', 'felix', 'fido']
   * ```
   * @example
   * This example retrieves the sorted Row Ids of a Table that does not exist,
   * returning an empty array.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getSortedRowIds('employees'));
   * // -> []
   * ```
   * @category Getter
   * @since v2.0.0
   */
  getSortedRowIds(
    tableId: Id,
    cellId?: Id,
    descending?: boolean,
    offset?: number,
    limit?: number,
  ): Ids;

  /**
   * The getRow method returns an object containing the entire data of a single
   * Row in a given Table.
   *
   * Note that this returns a copy of, rather than a reference to the underlying
   * data, so changes made to the returned object are not made to the Store
   * itself.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @returns An object containing the entire data of the Row.
   * @example
   * This example retrieves the data in a single Row.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'dog'}
   * ```
   * @example
   * This example retrieves a Row that does not exist, returning an empty
   * object.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getRow('pets', 'felix'));
   * // -> {}
   * ```
   * @category Getter
   */
  getRow(tableId: Id, rowId: Id): Row;

  /**
   * The getCellIds method returns the Ids of every Cell in a given Row, in a
   * given Table.
   *
   * Note that this returns a copy of, rather than a reference, to the list of
   * Ids, so changes made to the list are not made to the Store itself.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @returns An array of the Ids of every Cell in the Row.
   * @example
   * This example retrieves the Cell Ids in a Row.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog', color: 'brown'},
   *   },
   * });
   * console.log(store.getCellIds('pets', 'fido'));
   * // -> ['species', 'color']
   * ```
   * @example
   * This example retrieves the Cell Ids of a Cell that does not exist,
   * returning an empty array.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getCellIds('pets', 'felix'));
   * // -> []
   * ```
   * @category Getter
   */
  getCellIds(tableId: Id, rowId: Id): Ids;

  /**
   * The getCell method returns the value of a single Cell in a given Row, in a
   * given Table.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @param cellId The Id of the Cell in the Row.
   * @returns The value of the Cell, or `undefined`.
   * @example
   * This example retrieves a single Cell.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * console.log(store.getCell('pets', 'fido', 'species'));
   * // -> 'dog'
   * ```
   * @example
   * This example retrieves a Cell that does not exist, returning `undefined`.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getCell('pets', 'fido', 'color'));
   * // -> undefined
   * ```
   * @category Getter
   */
  getCell(tableId: Id, rowId: Id, cellId: Id): CellOrUndefined;

  /**
   * The getValues method returns an object containing the entire set of keyed
   * Values in the Store.
   *
   * Note that this returns a copy of, rather than a reference to the underlying
   * data, so changes made to the returned object are not made to the Store
   * itself.
   *
   * @returns An object containing the entire data of the Values.
   * @example
   * This example retrieves the keyed Values data in a Store.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * console.log(store.getValues());
   * // -> {open: true, employees: 3}
   * ```
   * @example
   * This example retrieves a Values from a Store that has none, returning an
   * empty object.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getValues());
   * // -> {}
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getValues(): Values;

  /**
   * The getValueIds method returns the Ids of every Value in a Store.
   *
   * Note that this returns a copy of, rather than a reference, to the list of
   * Ids, so changes made to the list are not made to the Store itself.
   *
   * @returns An array of the Ids of every Value in the Store.
   * @example
   * This example retrieves the Value Ids in a Store.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * console.log(store.getValueIds());
   * // -> ['open', 'employees']
   * ```
   * @example
   * This example retrieves the Value Ids of a Store that has had none set,
   * returning an empty array.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getValueIds());
   * // -> []
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getValueIds(): Ids;

  /**
   * The getValue method returns a single keyed Value in the Store.
   *
   * @param valueId The Id of the Value in the Store.
   * @returns The Value, or `undefined`.
   * @example
   * This example retrieves a single Value.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * console.log(store.getValue('employees'));
   * // -> 3
   * ```
   * @example
   * This example retrieves a Value that does not exist, returning `undefined`.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * console.log(store.getValue('website'));
   * // -> undefined
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getValue(valueId: Id): ValueOrUndefined;

  /**
   * The hasTables method returns a boolean indicating whether any Table objects
   * exist in the Store.
   *
   * @returns Whether any Tables exist.
   * @example
   * This example shows simple existence checks.
   *
   * ```js
   * const store = createStore();
   * console.log(store.hasTables());
   * // -> false
   * store.setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.hasTables());
   * // -> true
   * ```
   * @category Getter
   */
  hasTables(): boolean;

  /**
   * The hasTable method returns a boolean indicating whether a given Table
   * exists in the Store.
   *
   * @param tableId The Id of a possible Table in the Store.
   * @returns Whether a Table with that Id exists.
   * @example
   * This example shows two simple Table existence checks.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.hasTable('pets'));
   * // -> true
   * console.log(store.hasTable('employees'));
   * // -> false
   * ```
   * @category Getter
   */
  hasTable(tableId: Id): boolean;

  /**
   * The hasRow method returns a boolean indicating whether a given Row exists
   * in the Store.
   *
   * @param tableId The Id of a possible Table in the Store.
   * @param rowId The Id of a possible Row in the Table.
   * @returns Whether a Row with that Id exists in that Table.
   * @example
   * This example shows two simple Row existence checks.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.hasRow('pets', 'fido'));
   * // -> true
   * console.log(store.hasRow('pets', 'felix'));
   * // -> false
   * ```
   * @category Getter
   */
  hasRow(tableId: Id, rowId: Id): boolean;

  /**
   * The hasCell method returns a boolean indicating whether a given Cell exists
   * in the Store.
   *
   * @param tableId The Id of a possible Table in the Store.
   * @param rowId The Id of a possible Row in the Table.
   * @param cellId The Id of a possible Cell in the Row.
   * @returns Whether a Cell with that Id exists in that Row in that Table.
   * @example
   * This example shows two simple Cell existence checks.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.hasCell('pets', 'fido', 'species'));
   * // -> true
   * console.log(store.hasCell('pets', 'fido', 'color'));
   * // -> false
   * ```
   * @category Getter
   */
  hasCell(tableId: Id, rowId: Id, cellId: Id): boolean;

  /**
   * The hasTables method returns a boolean indicating whether any Values exist
   * in the Store.
   *
   * @returns Whether any Values exist.
   * @example
   * This example shows simple existence checks.
   *
   * ```js
   * const store = createStore();
   * console.log(store.hasValues());
   * // -> false
   * store.setValues({open: true});
   * console.log(store.hasValues());
   * // -> true
   * ```
   * @category Getter
   * @since v3.0.0
   */
  hasValues(): boolean;

  /**
   * The hasValue method returns a boolean indicating whether a given Value
   * exists in the Store.
   *
   * @param valueId The Id of a possible Value in the Store.
   * @returns Whether a Value with that Id exists in the Store.
   * @example
   * This example shows two simple Value existence checks.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * console.log(store.hasValue('open'));
   * // -> true
   * console.log(store.hasValue('employees'));
   * // -> false
   * ```
   * @category Getter
   * @since v3.0.0
   */
  hasValue(valueId: Id): boolean;

  /**
   * The getTablesJson method returns a string serialization of all of the
   * Tables in the Store.
   *
   * @returns A string serialization of all of the Tables in the Store.
   * @example
   * This example serializes the contents of a Store.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * console.log(store.getTablesJson());
   * // -> '{"pets":{"fido":{"species":"dog"}}}'
   * ```
   * @example
   * This example serializes the contents of an empty Store.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getTablesJson());
   * // -> '{}'
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getTablesJson(): Json;

  /**
   * The getValuesJson method returns a string serialization of all of the
   * keyed Values in the Store.
   *
   * @returns A string serialization of all of the Values in the Store.
   * @example
   * This example serializes the keyed value contents of a Store.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * console.log(store.getValuesJson());
   * // -> '{"open":true}'
   * ```
   * @example
   * This example serializes the contents of an empty Store.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getValuesJson());
   * // -> '{}'
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getValuesJson(): Json;

  /**
   * The getJson method returns a string serialization of all the Store content:
   * both the Tables and the keyed Values.
   *
   * From v3.0.0 onwards, the serialization is of an array with two entries. The
   * first is the Tables object, the second the Values. In previous versions
   * (before the existence of the Values data structure), it was a sole object
   * of Tables.
   *
   * @returns A string serialization of the Tables and Values in the Store.
   * @example
   * This example serializes the tabular and keyed value contents of a Store.
   *
   * ```js
   * const store = createStore()
   *   .setTables({pets: {fido: {species: 'dog'}}})
   *   .setValues({open: true});
   * console.log(store.getJson());
   * // -> '[{"pets":{"fido":{"species":"dog"}}},{"open":true}]'
   * ```
   * @example
   * This example serializes the contents of an empty Store.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getJson());
   * // -> '[{},{}]'
   * ```
   * @category Getter
   */
  getJson(): Json;

  /**
   * The getTablesSchemaJson method returns a string serialization of the
   * TablesSchema of the Store.
   *
   * If no TablesSchema has been set on the Store (or if it has been removed
   * with the delTablesSchema method), then it will return the serialization of
   * an empty object, `{}`.
   *
   * @returns A string serialization of the TablesSchema of the Store.
   * @example
   * This example serializes the TablesSchema of a Store.
   *
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {
   *     species: {type: 'string'},
   *     sold: {type: 'boolean'},
   *   },
   * });
   * console.log(store.getTablesSchemaJson());
   * // -> '{"pets":{"species":{"type":"string"},"sold":{"type":"boolean"}}}'
   * ```
   * @example
   * This example serializes the TablesSchema of an empty Store.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getTablesSchemaJson());
   * // -> '{}'
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getTablesSchemaJson(): Json;

  /**
   * The getValuesSchemaJson method returns a string serialization of the
   * ValuesSchema of the Store.
   *
   * If no ValuesSchema has been set on the Store (or if it has been removed
   * with the delValuesSchema method), then it will return the serialization of
   * an empty object, `{}`.
   *
   * @returns A string serialization of the ValuesSchema of the Store.
   * @example
   * This example serializes the ValuesSchema of a Store.
   *
   * ```js
   * const store = createStore().setValuesSchema({
   *   open: {type: 'boolean', default: false},
   * });
   * console.log(store.getValuesSchemaJson());
   * // -> '{"open":{"type":"boolean","default":false}}'
   * ```
   * @example
   * This example serializes the ValuesSchema of an empty Store.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getValuesSchemaJson());
   * // -> '{}'
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getValuesSchemaJson(): Json;

  /**
   * The getSchemaJson method returns a string serialization of both the
   * TablesSchema and ValuesSchema of the Store.
   *
   * From v3.0.0 onwards, the serialization is of an array with two entries. The
   * first is the TablesSchema object, the second the ValuesSchema. In previous
   * versions (before the existence of the ValuesSchema data structure), it was
   * a sole object of TablesSchema.
   *
   * @returns A string serialization of the TablesSchema and ValuesSchema of the
   * Store.
   * @example
   * This example serializes the TablesSchema and ValuesSchema of a Store.
   *
   * ```js
   * const store = createStore()
   *   .setTablesSchema({
   *     pets: {
   *       price: {type: 'number'},
   *     },
   *   })
   *   .setValuesSchema({
   *     open: {type: 'boolean'},
   *   });
   * console.log(store.getSchemaJson());
   * // -> '[{"pets":{"price":{"type":"number"}}},{"open":{"type":"boolean"}}]'
   * ```
   * @example
   * This example serializes the TablesSchema and ValuesSchema of an empty
   * Store.
   *
   * ```js
   * const store = createStore();
   * console.log(store.getSchemaJson());
   * // -> '[{},{}]'
   * ```
   * @category Getter
   */
  getSchemaJson(): Json;

  /**
   * The setTables method takes an object and sets the entire data of the Store.
   *
   * This method will cause listeners to be called for any Table, Row, Cell, or
   * Id changes resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Tables type, or because it does not match a TablesSchema associated with
   * the Store), will be ignored silently.
   *
   * Assuming that at least some of the provided Tables object is valid, any
   * data that was already present in the Store will be completely overwritten.
   * If the object is completely invalid, no change will be made to the Store.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param tables The data of the Store to be set.
   * @example
   * This example sets the data of a Store.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}}}
   * ```
   * @example
   * This example attempts to set the data of an existing Store with partly
   * invalid, and then completely invalid, Tables objects.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * store.setTables({pets: {felix: {species: 'cat', bug: []}}});
   * console.log(store.getTables());
   * // -> {pets: {felix: {species: 'cat'}}}
   *
   * store.setTables({meaning: 42});
   * console.log(store.getTables());
   * // -> {pets: {felix: {species: 'cat'}}}
   * ```
   * @category Setter
   */
  setTables(tables: Tables): Store;

  /**
   * The setTable method takes an object and sets the entire data of a single
   * Table in the Store.
   *
   * This method will cause listeners to be called for any Table, Row, Cell, or
   * Id changes resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Table type, or because it does not match a TablesSchema associated with the
   * Store), will be ignored silently.
   *
   * Assuming that at least some of the provided Table object is valid, any data
   * that was already present in the Store for that Table will be completely
   * overwritten. If the object is completely invalid, no change will be made to
   * the Store.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param tableId The Id of the Table in the Store.
   * @param table The data of a single Table to be set.
   * @example
   * This example sets the data of a single Table.
   *
   * ```js
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   * });
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
   * ```
   * @example
   * This example attempts to set the data of an existing Store with partly
   * invalid, and then completely invalid, Table objects.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * store.setTable('pets', {felix: {species: 'cat', bug: []}});
   * console.log(store.getTables());
   * // -> {pets: {felix: {species: 'cat'}}}
   *
   * store.setTable('pets', {meaning: 42});
   * console.log(store.getTables());
   * // -> {pets: {felix: {species: 'cat'}}}
   * ```
   * @category Setter
   */
  setTable(tableId: Id, table: Table): Store;

  /**
   * The setRow method takes an object and sets the entire data of a single Row
   * in the Store.
   *
   * This method will cause listeners to be called for any Table, Row, Cell, or
   * Id changes resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Row type, or because it does not match a TablesSchema associated with the
   * Store), will be ignored silently.
   *
   * Assuming that at least some of the provided Row object is valid, any data
   * that was already present in the Store for that Row will be completely
   * overwritten. If the object is completely invalid, no change will be made to
   * the Store.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @param row The data of a single Row to be set.
   * @returns A reference to the Store.
   * @example
   * This example sets the data of a single Row.
   *
   * ```js
   * const store = createStore().setRow('pets', 'fido', {species: 'dog'});
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * ```
   * @example
   * This example attempts to set the data of an existing Store with partly
   * invalid, and then completely invalid, Row objects.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * store.setRow('pets', 'fido', {color: 'brown', bug: []});
   * console.log(store.getTables());
   * // -> {pets: {fido: {color: 'brown'}}}
   *
   * store.setRow('pets', 'fido', 42);
   * console.log(store.getTables());
   * // -> {pets: {fido: {color: 'brown'}}}
   * ```
   * @category Setter
   */
  setRow(tableId: Id, rowId: Id, row: Row): Store;

  /**
   * The addRow method takes an object and creates a new Row in the Store,
   * returning the unique Id assigned to it.
   *
   * This method will cause listeners to be called for any Table, Row, Cell, or
   * Id changes resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Row type, or because it does not match a TablesSchema associated with the
   * Store), will be ignored silently.
   *
   * Assuming that at least some of the provided Row object is valid, a new Row
   * will be created. If the object is completely invalid, no change will be
   * made to the Store and the method will return `undefined`
   *
   * You should not guarantee the form of the unique Id that is generated when a
   * Row is added to the Table. However it is likely to be a string
   * representation of an increasing integer.
   *
   * @param tableId The Id of the Table in the Store.
   * @param row The data of a single Row to be added.
   * @returns A reference to the Store.
   * @example
   * This example adds a single Row.
   *
   * ```js
   * const store = createStore();
   * console.log(store.addRow('pets', {species: 'dog'}));
   * // -> '0'
   * console.log(store.getTables());
   * // -> {pets: {'0': {species: 'dog'}}}
   * ```
   * @example
   * This example attempts to add Rows to an existing Store with partly invalid,
   * and then completely invalid, Row objects.
   *
   * ```js
   * const store = createStore().setTables({pets: {'0': {species: 'dog'}}});
   *
   * console.log(store.addRow('pets', {species: 'cat', bug: []}));
   * // -> '1'
   * console.log(store.getTables());
   * // -> {pets: {'0': {species: 'dog'}, '1': {species: 'cat'}}}
   *
   * console.log(store.addRow('pets', 42));
   * // -> undefined
   * console.log(store.getTables());
   * // -> {pets: {'0': {species: 'dog'}, '1': {species: 'cat'}}}
   * ```
   * @category Setter
   */
  addRow(tableId: Id, row: Row): Id | undefined;

  /**
   * The setPartialRow method takes an object and sets partial data of a single
   * Row in the Store, leaving other Cell values unaffected.
   *
   * This method will cause listeners to be called for any Table, Row, Cell, or
   * Id changes resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Row type, or because, when combined with the current Row data, it does not
   * match a TablesSchema associated with the Store), will be ignored silently.
   *
   * Assuming that at least some of the provided Row object is valid, it will be
   * merged with the data that was already present in the Store. If the object
   * is completely invalid, no change will be made to the Store.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @param partialRow The partial data of a single Row to be set.
   * @returns A reference to the Store.
   * @example
   * This example sets some of the data of a single Row.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * store.setPartialRow('pets', 'fido', {color: 'walnut', visits: 1});
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'walnut', visits: 1}}}
   * ```
   * @example
   * This example attempts to set some of the data of an existing Store with
   * partly invalid, and then completely invalid, Row objects.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * store.setPartialRow('pets', 'fido', {color: 'brown', bug: []});
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'brown'}}}
   *
   * store.setPartialRow('pets', 'fido', 42);
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'brown'}}}
   * ```
   * @category Setter
   */
  setPartialRow(tableId: Id, rowId: Id, partialRow: Row): Store;

  /**
   * The setCell method sets the value of a single Cell in the Store.
   *
   * This method will cause listeners to be called for any Table, Row, Cell, or
   * Id changes resulting from it.
   *
   * If the Cell value is invalid (either because of its type, or because it
   * does not match a TablesSchema associated with the Store), will be ignored
   * silently.
   *
   * As well as string, number, or boolean Cell types, this method can also take
   * a MapCell function that takes the current Cell value as a parameter and
   * maps it. This is useful if you want to efficiently increment a value
   * without fetching it first, for example.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @param cellId The Id of the Cell in the Row.
   * @param cell The value of the Cell to be set, or a MapCell function to
   * update it.
   * @returns A reference to the Store.
   * @example
   * This example sets the value of a single Cell.
   *
   * ```js
   * const store = createStore().setCell('pets', 'fido', 'species', 'dog');
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * ```
   * @example
   * This example sets the data of a single Cell by mapping the existing value.
   *
   * ```js
   * const increment = (cell) => cell + 1;
   * const store = createStore().setTables({pets: {fido: {visits: 1}}});
   *
   * store.setCell('pets', 'fido', 'visits', increment);
   * console.log(store.getCell('pets', 'fido', 'visits'));
   * // -> 2
   * ```
   * @example
   * This example attempts to set the data of an existing Store with an invalid
   * Cell value.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * store.setCell('pets', 'fido', 'bug', []);
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * ```
   * @category Setter
   */
  setCell(tableId: Id, rowId: Id, cellId: Id, cell: Cell | MapCell): Store;

  /**
   * The setValues method takes an object and sets all the Values in the Store.
   *
   * This method will cause listeners to be called for any Value or Id changes
   * resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Values type, or because it does not match a ValuesSchema associated with
   * the Store), will be ignored silently.
   *
   * Assuming that at least some of the provided Values object is valid, any
   * data that was already present in the Store for that Values will be
   * completely overwritten. If the object is completely invalid, no change will
   * be made to the Store.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param values The Values object to be set.
   * @returns A reference to the Store.
   * @example
   * This example sets the Values of a Store.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * console.log(store.getValues());
   * // -> {open: true, employees: 3}
   * ```
   * @example
   * This example attempts to set the data of an existing Store with partly
   * invalid, and then completely invalid, Values objects.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   *
   * store.setValues({employees: 3, bug: []});
   * console.log(store.getValues());
   * // -> {employees: 3}
   *
   * store.setValues(42);
   * console.log(store.getValues());
   * // -> {employees: 3}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setValues(values: Values): Store;

  /**
   * The setPartialValues method takes an object and sets its Values in the
   * Store, but leaving existing Values unaffected.
   *
   * This method will cause listeners to be called for any Values or Id changes
   * resulting from it.
   *
   * Any part of the provided object that is invalid (either according to the
   * Values type, or because, when combined with the current Values data, it
   * does not match a ValuesSchema associated with the Store), will be ignored
   * silently.
   *
   * Assuming that at least some of the provided Values object is valid, it will
   * be merged with the data that was already present in the Store. If the
   * object is completely invalid, no change will be made to the Store.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param partialValues The Values to be set.
   * @returns A reference to the Store.
   * @example
   * This example sets some of the keyed value data in a Store.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * store.setPartialValues({employees: 3});
   * console.log(store.getValues());
   * // -> {open: true, employees: 3}
   * ```
   * @example
   * This example attempts to set some of the data of an existing Store with
   * partly invalid, and then completely invalid, Values objects.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   *
   * store.setPartialValues({employees: 3, bug: []});
   * console.log(store.getValues());
   * // -> {open: true, employees: 3}
   *
   * store.setPartialValues(42);
   * console.log(store.getValues());
   * // -> {open: true, employees: 3}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setPartialValues(partialValues: Values): Store;

  /**
   * The setValue method sets a single keyed Value in the Store.
   *
   * This method will cause listeners to be called for any Value, or Id changes
   * resulting from it.
   *
   * If the Value is invalid (either because of its type, or because it does not
   * match a ValuesSchema associated with the Store), will be ignored silently.
   *
   * As well as string, number, or boolean Value types, this method can also
   * take a MapValue function that takes the current Value as a parameter and
   * maps it. This is useful if you want to efficiently increment a value
   * without fetching it first, for example.
   *
   * The method returns a reference to the Store so that subsequent operations
   * can be chained in a fluent style.
   *
   * @param valueId The Id of the Value in the Store.
   * @param value The Value to be set, or a MapValue function to update it.
   * @returns A reference to the Store.
   * @example
   * This example sets a single Value.
   *
   * ```js
   * const store = createStore().setValue('open', true);
   * console.log(store.getValues());
   * // -> {open: true}
   * ```
   * @example
   * This example sets the data of a single Value by mapping the existing Value.
   *
   * ```js
   * const increment = (value) => value + 1;
   * const store = createStore().setValues({employees: 3});
   *
   * store.setValue('employees', increment);
   * console.log(store.getValue('employees'));
   * // -> 4
   * ```
   * @example
   * This example attempts to set an invalid Value.
   *
   * ```js
   * const store = createStore().setValues({employees: 3});
   *
   * store.setValue('bug', []);
   * console.log(store.getValues());
   * // -> {employees: 3}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setValue(valueId: Id, value: Value | MapValue): Store;

  /**
   * The setTablesJson method takes a string serialization of all of the Tables
   * in the Store and attempts to update them to that.
   *
   * If the JSON cannot be parsed, this will fail silently. If it can be parsed,
   * it will then be subject to the same validation rules as the setTables
   * method (according to the Tables type, and matching any TablesSchema
   * associated with the Store).
   *
   * @param tablesJson A string serialization of all of the Tables in the Store.
   * @returns A reference to the Store.
   * @example
   * This example sets the tabular contents of a Store from a serialization.
   *
   * ```js
   * const store = createStore();
   * store.setTablesJson('{"pets": {"fido": {"species": "dog"}}}');
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * ```
   * @example
   * This example attempts to set the tabular contents of a Store from an
   * invalid serialization.
   *
   * ```js
   * const store = createStore();
   * store.setTablesJson('{"pets": {"fido": {');
   * console.log(store.getTables());
   * // -> {}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setTablesJson(tablesJson: Json): Store;

  /**
   * The setValuesJson method takes a string serialization of all of the Values
   * in the Store and attempts to update them to those values.
   *
   * If the JSON cannot be parsed, this will fail silently. If it can be parsed,
   * it will then be subject to the same validation rules as the setValues
   * method (according to the Values type, and matching any ValuesSchema
   * associated with the Store).
   *
   * @param valuesJson A string serialization of all of the Values in the Store.
   * @returns A reference to the Store.
   * @example
   * This example sets the keyed value contents of a Store from a serialization.
   *
   * ```js
   * const store = createStore();
   * store.setValuesJson('{"open": true}');
   * console.log(store.getValues());
   * // -> {open: true}
   * ```
   * @example
   * This example attempts to set the keyed value contents of a Store from an
   * invalid serialization.
   *
   * ```js
   * const store = createStore();
   * store.setValuesJson('{"open": false');
   * console.log(store.getValues());
   * // -> {}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setValuesJson(valuesJson: Json): Store;

  /**
   * The setJson method takes a string serialization of all of the Tables and
   * Values in the Store and attempts to update them to those values.
   *
   * From v3.0.0 onwards, the serialization should be of an array with two
   * entries. The first is the Tables object, the second the Values. In previous
   * versions (before the existence of the Values data structure), it was a sole
   * object of Tables. For backwards compatibility, if a serialization of a
   * single object is provided, it will be treated as the Tables type.
   *
   * If the JSON cannot be parsed, this will fail silently. If it can be parsed,
   * it will then be subject to the same validation rules as the setTables
   * method (according to the Tables type, and matching any TablesSchema
   * associated with the Store), and the setValues method (according to the
   * Values type, and matching any ValuesSchema associated with the Store).
   *
   * @param tablesAndValuesJson A string serialization of all of the Tables and
   * Values in the Store.
   * @returns A reference to the Store.
   * @example
   * This example sets the tabular and keyed value contents of a Store from a
   * serialization.
   *
   * ```js
   * const store = createStore();
   * store.setJson('[{"pets": {"fido": {"species": "dog"}}}, {"open": true}]');
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * console.log(store.getValues());
   * // -> {open: true}
   * ```
   * @example
   * This example sets the tabular contents of a Store from a
   * legacy single-object serialization (compatible with v2.x and earlier).
   *
   * ```js
   * const store = createStore();
   * store.setJson('{"pets": {"fido": {"species": "dog"}}}');
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * console.log(store.getValues());
   * // -> {}
   * ```
   * @example
   * This example attempts to set the the tabular and keyed value contents of a
   * Store from an invalid serialization.
   *
   * ```js
   * const store = createStore();
   * store.setValuesJson('[{"pets": {"fido": {"species": "do');
   * console.log(store.getTables());
   * // -> {}
   * console.log(store.getValues());
   * // -> {}
   * ```
   * @category Setter
   */
  setJson(tablesAndValuesJson: Json): Store;

  /**
   * The setTablesSchema method lets you specify the TablesSchema of the tabular
   * part of the Store.
   *
   * Note that this may result in a change to data in the Store, as defaults are
   * applied or as invalid Table, Row, or Cell objects are removed. These
   * changes will fire any listeners to that data, as expected.
   *
   * When no longer needed, you can also completely remove an existing
   * TablesSchema with the delTablesSchema method.
   *
   * @param tablesSchema The TablesSchema to be set for the Store.
   * @returns A reference to the Store.
   * @example
   * This example sets the TablesSchema of a Store after it has been created.
   *
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {
   *     species: {type: 'string'},
   *     sold: {type: 'boolean', default: false},
   *   },
   * });
   * store.addRow('pets', {species: 'dog', color: 'brown', sold: 'maybe'});
   *
   * console.log(store.getTables());
   * // -> {pets: {0: {species: 'dog', sold: false}}}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setTablesSchema(tablesSchema: TablesSchema): Store;

  /**
   * The setValuesSchema method lets you specify the ValuesSchema of the keyed
   * Values part of the Store.
   *
   * Note that this may result in a change to data in the Store, as defaults are
   * applied or as invalid Values are removed. These changes will fire any
   * listeners to that data, as expected.
   *
   * When no longer needed, you can also completely remove an existing
   * ValuesSchema with the delValuesSchema method.
   *
   * @param valuesSchema The ValuesSchema to be set for the Store.
   * @returns A reference to the Store.
   * @example
   * This example sets the ValuesSchema of a Store after it has been created.
   *
   * ```js
   * const store = createStore().setValuesSchema({
   *   open: {type: 'boolean', default: false},
   * });
   * store.setValue('open', 'maybe');
   *
   * console.log(store.getValues());
   * // -> {open: false}
   * ```
   * @category Setter
   * @since v3.0.0
   */
  setValuesSchema(valuesSchema: ValuesSchema): Store;

  /**
   * The setSchema method lets you specify the TablesSchema and ValuesSchema of
   * the Store.
   *
   * Note that this may result in a change to data in the Store, as defaults are
   * applied or as invalid Table, Row, Cell, or Value objects are removed. These
   * changes will fire any listeners to that data, as expected.
   *
   * From v3.0.0 onwards, this method takes two arguments. The first is the
   * TablesSchema object, the second the ValuesSchema. In previous versions
   * (before the existence of the ValuesSchema data structure), only the first
   * was present. For backwards compatibility the new second parameter is
   * optional.
   *
   * @param tablesSchema The TablesSchema to be set for the Store.
   * @param valuesSchema The ValuesSchema to be set for the Store.
   * @returns A reference to the Store.
   * @example
   * This example sets the TablesSchema and ValuesSchema of a Store after it has
   * been created.
   *
   * ```js
   * const store = createStore().setSchema(
   *   {
   *     pets: {
   *       species: {type: 'string'},
   *       sold: {type: 'boolean', default: false},
   *     },
   *   },
   *   {open: {type: 'boolean', default: false}},
   * );
   * store.addRow('pets', {species: 'dog', color: 'brown', sold: 'maybe'});
   * store.setValue('open', 'maybe');
   *
   * console.log(store.getTables());
   * // -> {pets: {0: {species: 'dog', sold: false}}}
   * console.log(store.getValues());
   * // -> {open: false}
   * ```
   * @example
   * This example sets just the TablesSchema of a Store after it has been
   * created.
   *
   * ```js
   * const store = createStore().setSchema({
   *   pets: {
   *     species: {type: 'string'},
   *     sold: {type: 'boolean', default: false},
   *   },
   * });
   * store.addRow('pets', {species: 'dog', color: 'brown', sold: 'maybe'});
   *
   * console.log(store.getTables());
   * // -> {pets: {0: {species: 'dog', sold: false}}}
   * ```
   * @category Setter
   */
  setSchema(tablesSchema: TablesSchema, valuesSchema?: ValuesSchema): Store;

  /**
   * The delTables method lets you remove all of the data in a Store.
   *
   * @returns A reference to the Store.
   * @example
   * This example removes the data of a Store.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * store.delTables();
   * console.log(store.getTables());
   * // -> {}
   * ```
   * @category Deleter
   */
  delTables(): Store;

  /**
   * The delTable method lets you remove a single Table from the Store.
   *
   * @param tableId The Id of the Table in the Store.
   * @returns A reference to the Store.
   * @example
   * This example removes a Table from a Store.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   * store.delTable('pets');
   *
   * console.log(store.getTables());
   * // -> {species: {dog: {price: 5}}}
   * ```
   * @category Deleter
   */
  delTable(tableId: Id): Store;

  /**
   * The delRow method lets you remove a single Row from a Table.
   *
   * If this is the last Row in its Table, then that Table will be removed.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @returns A reference to the Store.
   * @example
   * This example removes a Row from a Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}, felix: {species: 'cat'}},
   * });
   * store.delRow('pets', 'fido');
   *
   * console.log(store.getTables());
   * // -> {pets: {felix: {species: 'cat'}}}
   * ```
   * @category Deleter
   */
  delRow(tableId: Id, rowId: Id): Store;

  /**
   * The delCell method lets you remove a single Cell from a Row.
   *
   * When there is no TablesSchema applied to the Store, then if this is the
   * last Cell in its Row, then that Row will be removed. If, in turn, that is
   * the last Row in its Table, then that Table will be removed.
   *
   * If there is a TablesSchema applied to the Store and it specifies a default
   * value for this Cell, then deletion will result in it being set back to its
   * default value. To override this, use the `forceDel` parameter, as described
   * below.
   *
   * The `forceDel` parameter is an optional flag that is only relevant if a
   * TablesSchema provides a default value for this Cell. Under such
   * circumstances, deleting a Cell value will normally restore it to the
   * default value. If this flag is set to `true`, the complete removal of the
   * Cell is instead guaranteed. But since doing do so would result in an
   * invalid Row (according to the TablesSchema), in fact the whole Row is
   * deleted to retain the integrity of the Table. Therefore, this flag should
   * be used with caution.
   *
   * @param tableId The Id of the Table in the Store.
   * @param rowId The Id of the Row in the Table.
   * @param cellId The Id of the Cell in the Row.
   * @param forceDel An optional flag to indicate that the whole Row should be
   * deleted, even if a TablesSchema provides a default value for this Cell.
   * Defaults to `false`.
   * @returns A reference to the Store.
   * @example
   * This example removes a Cell from a Row without a TablesSchema.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', sold: true}},
   * });
   * store.delCell('pets', 'fido', 'sold');
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * ```
   * @example
   * This example removes a Cell from a Row with a TablesSchema that defaults
   * its value.
   *
   * ```js
   * const store = createStore()
   *   .setTables({
   *     pets: {fido: {species: 'dog', sold: true}},
   *   })
   *   .setTablesSchema({
   *     pets: {
   *       species: {type: 'string'},
   *       sold: {type: 'boolean', default: false},
   *     },
   *   });
   * store.delCell('pets', 'fido', 'sold');
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', sold: false}}}
   * ```
   * @example
   * This example removes a Cell from a Row with a TablesSchema that defaults
   * its value, but uses the `forceDel` parameter to override it.
   *
   * ```js
   * const store = createStore()
   *   .setTables({
   *     pets: {fido: {species: 'dog', sold: true}, felix: {species: 'cat'}},
   *   })
   *   .setTablesSchema({
   *     pets: {
   *       species: {type: 'string'},
   *       sold: {type: 'boolean', default: false},
   *     },
   *   });
   * store.delCell('pets', 'fido', 'sold', true);
   *
   * console.log(store.getTables());
   * // -> {pets: {felix: {species: 'cat', sold: false}}}
   * ```
   * @category Deleter
   */
  delCell(tableId: Id, rowId: Id, cellId: Id, forceDel?: boolean): Store;

  /**
   * The delValues method lets you remove all the Values from a Store.
   *
   * If there is a ValuesSchema applied to the Store and it specifies a default
   * value for any Value Id, then deletion will result in it being set back to
   * its default value.
   *
   * @returns A reference to the Store.
   * @example
   * This example removes all Values from a Store without a ValuesSchema.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * store.delValues();
   *
   * console.log(store.getValues());
   * // -> {}
   * ```
   * @example
   * This example removes all Values from a Store with a ValuesSchema that
   * defaults one of its values.
   *
   * ```js
   * const store = createStore()
   *   .setValues({open: true, employees: 3})
   *   .setValuesSchema({
   *     open: {type: 'boolean', default: false},
   *     employees: {type: 'number'},
   *   });
   * store.delValues();
   *
   * console.log(store.getValues());
   * // -> {open: false}
   * ```
   * @category Deleter
   * @since v3.0.0
   */
  delValues(): Store;

  /**
   * The delValue method lets you remove a single Value from a Store.
   *
   * If there is a ValuesSchema applied to the Store and it specifies a default
   * value for this Value Id, then deletion will result in it being set back to
   * its default value.
   *
   * @param valueId The Id of the Value in the Row.
   * @returns A reference to the Store.
   * @example
   * This example removes a Value from a Store without a ValuesSchema.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * store.delValue('employees');
   *
   * console.log(store.getValues());
   * // -> {open: true}
   * ```
   * @example
   * This example removes a Value from a Store with a ValuesSchema that defaults
   * its value.
   *
   * ```js
   * const store = createStore()
   *   .setValues({open: true, employees: 3})
   *   .setValuesSchema({
   *     open: {type: 'boolean', default: false},
   *     employees: {type: 'number'},
   *   });
   * store.delValue('open');
   *
   * console.log(store.getValues());
   * // -> {open: false, employees: 3}
   * ```
   * @category Deleter
   * @since v3.0.0
   */
  delValue(valueId: Id): Store;

  /**
   * The delTablesSchema method lets you remove the TablesSchema of the Store.
   *
   * @returns A reference to the Store.
   * @example
   * This example removes the TablesSchema of a Store.
   *
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {species: {type: 'string'}},
   * });
   * store.delTablesSchema();
   * console.log(store.getTablesSchemaJson());
   * // -> '{}'
   * ```
   * @category Deleter
   */
  delTablesSchema(): Store;

  /**
   * The delValuesSchema method lets you remove the ValuesSchema of the Store.
   *
   * @returns A reference to the Store.
   * @example
   * This example removes the ValuesSchema of a Store.
   *
   * ```js
   * const store = createStore().setValuesSchema({
   *   sold: {type: 'boolean', default: false},
   * });
   * store.delValuesSchema();
   * console.log(store.getValuesSchemaJson());
   * // -> '{}'
   * ```
   * @category Deleter
   * @since v3.0.0
   */
  delValuesSchema(): Store;

  /**
   * The transaction method takes a function that makes multiple mutations to
   * the Store, buffering all calls to the relevant listeners until it
   * completes.
   *
   * This method is useful for making bulk changes to the data in a Store, and
   * when you don't want listeners to be called as you make each change. Changes
   * are made silently during the transaction, and listeners relevant to the
   * changes you have made will instead only be called when the whole
   * transaction is complete.
   *
   * If multiple changes are made to a piece of Store data throughout the
   * transaction, a relevant listener will only be called with the final value
   * (assuming it is different to the value at the start of the transaction),
   * regardless of the changes that happened in between. For example, if a Cell
   * had a value `'a'` and then, within a transaction, it was changed to `'b'`
   * and then `'c'`, any CellListener registered for that cell would be called
   * once as if there had been a single change from `'a'` to `'c'`.
   *
   * Transactions can be nested. Relevant listeners will be called only when the
   * outermost one completes.
   *
   * The second, optional parameter, `doRollback` is a DoRollback callback that
   * you can use to rollback the transaction if it did not complete to your
   * satisfaction. It is called with `changedCells`, `invalidCells`,
   * `changedValues`, and `invalidValues` parameters, which inform you of the
   * net changes that have been made during the transaction, and any invalid
   * attempts to do so, respectively.
   *
   * @param actions The function to be executed as a transaction.
   * @param doRollback An optional callback that should return `true` if you
   * want to rollback the transaction at the end. Since v1.2.0.
   * @returns Whatever value the provided transaction function returns.
   * @example
   * This example makes changes to two Cells, first outside, and secondly
   * within, a transaction. In the second case, the Row listener is only called
   * once.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * store.addRowListener('pets', 'fido', () => console.log('Fido changed'));
   *
   * store
   *   .setCell('pets', 'fido', 'color', 'brown')
   *   .setCell('pets', 'fido', 'sold', false);
   * // -> 'Fido changed'
   * // -> 'Fido changed'
   *
   * store.transaction(() =>
   *   store
   *     .setCell('pets', 'fido', 'color', 'walnut')
   *     .setCell('pets', 'fido', 'sold', true),
   * );
   * // -> 'Fido changed'
   * ```
   * @example
   * This example makes multiple changes to one Cell. The Cell listener is
   * called once - and with the final value - only if there is a net overall
   * change.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * store.addCellListener(
   *   'pets',
   *   'fido',
   *   'color',
   *   (store, tableId, rowId, cellId, newCell) => console.log(newCell),
   * );
   *
   * store.transaction(() =>
   *   store
   *     .setCell('pets', 'fido', 'color', 'black')
   *     .setCell('pets', 'fido', 'color', 'brown')
   *     .setCell('pets', 'fido', 'color', 'walnut'),
   * );
   * // -> 'walnut'
   *
   * store.transaction(() =>
   *   store
   *     .setCell('pets', 'fido', 'color', 'black')
   *     .setCell('pets', 'fido', 'color', 'walnut'),
   * );
   * // -> undefined
   * // No net change during the transaction, so the listener is not called.
   * ```
   * @example
   * This example makes multiple changes to the Store, including some attempts
   * to update a Cell and Value with invalid values. The `doRollback` callback
   * receives information about the changes and invalid attempts, and then
   * judges that the transaction should be rolled back to its original state.
   *
   * ```js
   * const store = createStore()
   *   .setTables({pets: {fido: {species: 'dog', color: 'brown'}}})
   *   .setValues({open: true});
   *
   * store.transaction(
   *   () =>
   *     store
   *       .setCell('pets', 'fido', 'color', 'black')
   *       .setCell('pets', 'fido', 'eyes', ['left', 'right'])
   *       .setCell('pets', 'fido', 'info', {sold: null})
   *       .setValue('open', false)
   *       .setValue('employees', ['alice', 'bob']),
   *   (changedCells, invalidCells, changedValues, invalidValues) => {
   *     console.log(store.getTables());
   *     console.log(changedCells);
   *     console.log(invalidCells);
   *     console.log(changedValues);
   *     console.log(invalidValues);
   *     return invalidCells['pets'] != null;
   *   },
   * );
   * // -> {pets: {fido: {species: 'dog', color: 'black'}}}
   * // -> {pets: {fido: {color: ['brown', 'black']}}}
   * // -> {pets: {fido: {eyes: [['left', 'right']], info: [{sold: null}]}}}
   * // -> {open: [true, false]}
   * // -> {employees: [['alice', 'bob']]}
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'brown'}}}
   * console.log(store.getValues());
   * // -> {open: true}
   * ```
   * @category Transaction
   */
  transaction<Return>(actions: () => Return, doRollback?: DoRollback): Return;

  /**
   * The startTransaction method allows you to explicitly start a transaction
   * that will make multiple mutations to the Store, buffering all calls to the
   * relevant listeners until it completes when you call the finishTransaction
   * method.
   *
   * Transactions are useful for making bulk changes to the data in a Store, and
   * when you don't want listeners to be called as you make each change. Changes
   * are made silently during the transaction, and listeners relevant to the
   * changes you have made will instead only be called when the whole
   * transaction is complete.
   *
   * Generally it is preferable to use the transaction method to wrap a block of
   * code as a transaction. It simply calls both the startTransaction and
   * finishTransaction methods for you. See that method for several transaction
   * examples.
   *
   * Use this startTransaction method when you have a more 'open-ended'
   * transaction, such as one containing mutations triggered from other events
   * that are asynchronous or not occurring inline to your code. You must
   * remember to also call the finishTransaction method explicitly when it is
   * done, of course.
   *
   * @returns A reference to the Store.
   * @example
   * This example makes changes to two Cells, first outside, and secondly
   * within, a transaction that is explicitly started and finished. In the
   * second case, the Row listener is only called once.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * store.addRowListener('pets', 'fido', () => console.log('Fido changed'));
   *
   * store
   *   .setCell('pets', 'fido', 'color', 'brown')
   *   .setCell('pets', 'fido', 'sold', false);
   * // -> 'Fido changed'
   * // -> 'Fido changed'
   *
   * store
   *   .startTransaction()
   *   .setCell('pets', 'fido', 'color', 'walnut')
   *   .setCell('pets', 'fido', 'sold', true)
   *   .finishTransaction();
   * // -> 'Fido changed'
   * ```
   * @category Transaction
   * @since v1.3.0
   */
  startTransaction(): Store;

  /**
   * The finishTransaction method allows you to explicitly finish a transaction
   * that has made multiple mutations to the Store, triggering all calls to the
   * relevant listeners.
   *
   * Transactions are useful for making bulk changes to the data in a Store, and
   * when you don't want listeners to be called as you make each change. Changes
   * are made silently during the transaction, and listeners relevant to the
   * changes you have made will instead only be called when the whole
   * transaction is complete.
   *
   * Generally it is preferable to use the transaction method to wrap a block of
   * code as a transaction. It simply calls both the startTransaction and
   * finishTransaction methods for you. See that method for several transaction
   * examples.
   *
   * Use this finishTransaction method when you have a more 'open-ended'
   * transaction, such as one containing mutations triggered from other events
   * that are asynchronous or not occurring inline to your code. There must have
   * been a corresponding startTransaction method that this completes, of
   * course, otherwise this function has no effect.
   *
   * The optional parameter, `doRollback` is a DoRollback callback that
   * you can use to rollback the transaction if it did not complete to your
   * satisfaction. It is called with `changedCells`, `invalidCells`,
   * `changedValues`, and `invalidValues` parameters, which inform you of the
   * net changes that have been made during the transaction, and any invalid
   * attempts to do so, respectively.
   *
   * @param doRollback An optional callback that should return `true` if you
   * want to rollback the transaction at the end.
   * @returns A reference to the Store.
   * @example
   * This example makes changes to two Cells, first outside, and secondly
   * within, a transaction that is explicitly started and finished. In the
   * second case, the Row listener is only called once.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * store.addRowListener('pets', 'fido', () => console.log('Fido changed'));
   *
   * store
   *   .setCell('pets', 'fido', 'color', 'brown')
   *   .setCell('pets', 'fido', 'sold', false);
   * // -> 'Fido changed'
   * // -> 'Fido changed'
   *
   * store
   *   .startTransaction()
   *   .setCell('pets', 'fido', 'color', 'walnut')
   *   .setCell('pets', 'fido', 'sold', true)
   *   .finishTransaction();
   * // -> 'Fido changed'
   * ```
   * @example
   * This example makes multiple changes to the Store, including some attempts
   * to update a Cell with invalid values. The `doRollback` callback receives
   * information about the changes and invalid attempts, and then judges that
   * the transaction should be rolled back to its original state.
   *
   * ```js
   * const store = createStore()
   *   .setTables({pets: {fido: {species: 'dog', color: 'brown'}}})
   *   .setValues({open: true});
   *
   * store
   *   .startTransaction()
   *   .setCell('pets', 'fido', 'color', 'black')
   *   .setCell('pets', 'fido', 'eyes', ['left', 'right'])
   *   .setCell('pets', 'fido', 'info', {sold: null})
   *   .setValue('open', false)
   *   .setValue('employees', ['alice', 'bob'])
   *   .finishTransaction(
   *     (changedCells, invalidCells, changedValues, invalidValues) => {
   *       console.log(store.getTables());
   *       console.log(changedCells);
   *       console.log(invalidCells);
   *       console.log(changedValues);
   *       console.log(invalidValues);
   *       return invalidCells['pets'] != null;
   *     },
   *   );
   * // -> {pets: {fido: {species: 'dog', color: 'black'}}}
   * // -> {pets: {fido: {color: ['brown', 'black']}}}
   * // -> {pets: {fido: {eyes: [['left', 'right']], info: [{sold: null}]}}}
   * // -> {open: [true, false]}
   * // -> {employees: [['alice', 'bob']]}
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'brown'}}}
   * console.log(store.getValues());
   * // -> {open: true}
   * ```
   * @category Transaction
   * @since v1.3.0
   */
  finishTransaction(doRollback?: DoRollback): Store;

  /**
   * The forEachTable method takes a function that it will then call for each
   * Table in the Store.
   *
   * This method is useful for iterating over the Table structure of the Store
   * in a functional style. The `tableCallback` parameter is a TableCallback
   * function that will be called with the Id of each Table, and with a function
   * that can then be used to iterate over each Row of the Table, should you
   * wish.
   *
   * @param tableCallback The function that should be called for every Table.
   * @example
   * This example iterates over each Table in a Store, and lists each Row Id
   * within them.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   * store.forEachTable((tableId, forEachRow) => {
   *   console.log(tableId);
   *   forEachRow((rowId) => console.log(`- ${rowId}`));
   * });
   * // -> 'pets'
   * // -> '- fido'
   * // -> 'species'
   * // -> '- dog'
   * ```
   * @category Iterator
   */
  forEachTable(tableCallback: TableCallback): void;

  /**
   * The forEachRow method takes a function that it will then call for each Row
   * in a specified Table.
   *
   * This method is useful for iterating over the Row structure of the Table in
   * a functional style. The `rowCallback` parameter is a RowCallback function
   * that will be called with the Id of each Row, and with a function that can
   * then be used to iterate over each Cell of the Row, should you wish.
   *
   * @param tableId The Id of the Table to iterate over.
   * @param rowCallback The function that should be called for every Row.
   * @example
   * This example iterates over each Row in a Table, and lists each Cell Id
   * within them.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {color: 'black'},
   *   },
   * });
   * store.forEachRow('pets', (rowId, forEachCell) => {
   *   console.log(rowId);
   *   forEachCell((cellId) => console.log(`- ${cellId}`));
   * });
   * // -> 'fido'
   * // -> '- species'
   * // -> 'felix'
   * // -> '- color'
   * ```
   * @category Iterator
   */
  forEachRow(tableId: Id, rowCallback: RowCallback): void;

  /**
   * The forEachCell method takes a function that it will then call for each
   * Cell in a specified Row.
   *
   * This method is useful for iterating over the Cell structure of the Row in a
   * functional style. The `cellCallback` parameter is a CellCallback function
   * that will be called with the Id and value of each Cell.
   *
   * @param tableId The Id of the Table containing the Row to iterate over.
   * @param rowId The Id of the Row to iterate over.
   * @param cellCallback The function that should be called for every Cell.
   * @example
   * This example iterates over each Cell in a Row, and lists its value.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * store.forEachCell('pets', 'fido', (cellId, cell) => {
   *   console.log(`${cellId}: ${cell}`);
   * });
   * // -> 'species: dog'
   * // -> 'color: brown'
   * ```
   * @category Iterator
   */
  forEachCell(tableId: Id, rowId: Id, cellCallback: CellCallback): void;

  /**
   * The forEachValue method takes a function that it will then call for each
   * Value in a Store.
   *
   * This method is useful for iterating over the Value structure of the Store
   * in a functional style. The `valueCallback` parameter is a ValueCallback
   * function that will be called with the Id and value of each Value.
   *
   * @param valueCallback The function that should be called for every Value.
   * @example
   * This example iterates over each Value in a Store, and lists its value.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * store.forEachValue((valueId, value) => {
   *   console.log(`${valueId}: ${value}`);
   * });
   * // -> 'open: true'
   * // -> 'employees: 3'
   * ```
   * @category Iterator
   * @since v3.0.0
   */
  forEachValue(valueCallback: ValueCallback): void;

  /**
   * The addTablesListener method registers a listener function with the Store
   * that will be called whenever data in the Store changes.
   *
   * The provided listener is a TablesListener function, and will be called with
   * a reference to the Store and a GetCellChange function in case you need to
   * inspect any changes that occurred.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param listener The function that will be called whenever data in the Store
   * changes.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any changes to the whole
   * Store.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addTablesListener((store, getCellChange) => {
   *   console.log('Tables changed');
   *   console.log(getCellChange('pets', 'fido', 'color'));
   * });
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'Tables changed'
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to the whole
   * Store, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addTablesListener(
   *   (store) => store.setCell('meta', 'update', 'store', true),
   *   true,
   * );
   *
   * store.delCell('pets', 'fido', 'color');
   * console.log(store.getTable('meta'));
   * // -> {update: {store: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addTablesListener(listener: TablesListener, mutator?: boolean): Id;

  /**
   * The addTableIdsListener method registers a listener function with the Store
   * that will be called whenever the Table Ids in the Store change.
   *
   * The provided listener is a TableIdsListener function, and will be called
   * with a reference to the Store.
   *
   * By default, such a listener is only called when a Table is added or
   * removed. To listen to all changes in the Store, use the addTablesListener
   * method.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param listener The function that will be called whenever the Table Ids in
   * the Store change.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any change to the Table
   * Ids.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addTableIdsListener((store) => {
   *   console.log('Table Ids changed');
   *   console.log(store.getTableIds());
   * });
   *
   * store.setTable('species', {dog: {price: 5}});
   * // -> 'Table Ids changed'
   * // -> ['pets', 'species']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the Table
   * Ids, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addTableIdsListener(
   *   (store) => store.setCell('meta', 'update', 'store', true),
   *   true, // mutator
   * );
   *
   * store.setTable('species', {dog: {price: 5}});
   * console.log(store.getTable('meta'));
   * // -> {update: {store: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addTableIdsListener(listener: TableIdsListener, mutator?: boolean): Id;

  /**
   * The addTableListener method registers a listener function with the Store
   * that will be called whenever data in a Table changes.
   *
   * The provided listener is a TableListener function, and will be called with
   * a reference to the Store, the Id of the Table that changed, and a
   * GetCellChange function in case you need to inspect any changes that
   * occurred.
   *
   * You can either listen to a single Table (by specifying its Id as the
   * method's first parameter) or changes to any Table (by providing a `null`
   * wildcard).
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever data in the
   * matching Table changes.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addTableListener(
   *   'pets',
   *   (store, tableId, getCellChange) => {
   *     console.log('pets table changed');
   *     console.log(getCellChange('pets', 'fido', 'color'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'pets table changed'
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any
   * Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addTableListener(null, (store, tableId) => {
   *   console.log(`${tableId} table changed`);
   * });
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'pets table changed'
   * store.setTable('species', {dog: {price: 5}});
   * // -> 'species table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Table, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addTableListener(
   *   'pets',
   *   (store, tableId) => store.setCell('meta', 'update', tableId, true),
   *   true,
   * );
   *
   * store.delCell('pets', 'fido', 'color');
   * console.log(store.getTable('meta'));
   * // -> {update: {pets: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addTableListener(
    tableId: IdOrNull,
    listener: TableListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addRowIdsListener method registers a listener function with the Store
   * that will be called whenever the Row Ids in a Table change.
   *
   * The provided listener is a RowIdsListener function, and will be called with
   * a reference to the Store and the Id of the Table that changed.
   *
   * By default, such a listener is only called when a Row is added or removed.
   * To listen to all changes in the Table, use the addTableListener method.
   *
   * You can either listen to a single Table (by specifying its Id as the
   * method's first parameter) or changes to any Table (by providing a `null`
   * wildcard).
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the Row Ids in
   * the Table change.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any change to the Row
   * Ids of a specific Table.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addRowIdsListener('pets', (store) => {
   *   console.log('Row Ids for pets table changed');
   *   console.log(store.getRowIds('pets'));
   * });
   *
   * store.setRow('pets', 'felix', {species: 'cat'});
   * // -> 'Row Ids for pets table changed'
   * // -> ['fido', 'felix']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the Row
   * Ids of any Table.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addRowIdsListener(null, (store, tableId) => {
   *   console.log(`Row Ids for ${tableId} table changed`);
   *   console.log(store.getRowIds(tableId));
   * });
   *
   * store.setRow('pets', 'felix', {species: 'cat'});
   * // -> 'Row Ids for pets table changed'
   * // -> ['fido', 'felix']
   * store.setRow('species', 'dog', {price: 5});
   * // -> 'Row Ids for species table changed'
   * // -> ['dog']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the Row
   * Ids of a specific Table, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addRowIdsListener(
   *   'pets',
   *   (store, tableId) => store.setCell('meta', 'update', tableId, true),
   *   true, // mutator
   * );
   *
   * store.setRow('pets', 'felix', {species: 'cat'});
   * console.log(store.getTable('meta'));
   * // -> {update: {pets: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addRowIdsListener(
    tableId: IdOrNull,
    listener: RowIdsListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addSortedRowIdsListener method registers a listener function with the
   * Store that will be called whenever sorted (and optionally, paginated) Row
   * Ids in a Table change.
   *
   * The provided listener is a SortedRowIdsListener function, and will be
   * called with a reference to the Store, the Id of the Table whose Row Ids
   * sorting changed, the Cell Id being used to sort them, whether descending or
   * not, and the offset and limit of the number of Ids returned, for pagination
   * purposes. It also receives the sorted array of Ids itself, so that you can
   * use them in the listener without the additional cost of an explicit call to
   * getSortedRowIds.
   *
   * Such a listener is called when a Row is added or removed, but also when a
   * value in the specified Cell (somewhere in the Table) has changed enough to
   * change the sorting of the Row Ids.
   *
   * Unlike most other listeners, you cannot provide wildcards (due to the cost
   * of detecting changes to the sorting). You can only listen to a single
   * specified Table, sorted by a single specified Cell.
   *
   * The sorting of the rows is alphanumeric, and you can indicate whether it
   * should be in descending order. The `offset` and `limit` parameters are used
   * to paginate results, but default to `0` and `undefined` to return all
   * available Row Ids if not specified.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param tableId The Id of the Table to listen to.
   * @param cellId The Id of the Cell whose values are used for the sorting, or
   * `undefined` to by sort the Row Id itself.
   * @param descending Whether the sorting should be in descending order.
   * @param offset The number of Row Ids to skip for pagination purposes, if
   * any.
   * @param limit The maximum number of Row Ids to return, or `undefined` for
   * all.
   * @param listener The function that will be called whenever the sorted Row
   * Ids in the Table change.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any change to the sorted
   * Row Ids of a specific Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     cujo: {species: 'wolf'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets', 'species', false));
   * // -> ['felix', 'cujo']
   *
   * const listenerId = store.addSortedRowIdsListener(
   *   'pets',
   *   'species',
   *   false,
   *   0,
   *   undefined,
   *   (store, tableId, cellId, descending, offset, limit, sortedRowIds) => {
   *     console.log(`Sorted Row Ids for ${tableId} table changed`);
   *     console.log(sortedRowIds);
   *     // ^ cheaper than calling getSortedRowIds again
   *   },
   * );
   *
   * store.setRow('pets', 'fido', {species: 'dog'});
   * // -> 'Sorted Row Ids for pets table changed'
   * // -> ['felix', 'fido', 'cujo']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This 111example registers a listener that responds to any change to a
   * paginated section of the sorted Row Ids of a specific Table.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {price: 6},
   *     felix: {price: 5},
   *     mickey: {price: 2},
   *     tom: {price: 4},
   *     carnaby: {price: 3},
   *     lowly: {price: 1},
   *   },
   * });
   *
   * const listenerId = store.addSortedRowIdsListener(
   *   'pets',
   *   'price',
   *   false,
   *   0,
   *   3,
   *   (store, tableId, cellId, descending, offset, limit, sortedRowIds) => {
   *     console.log(`First three sorted Row Ids for ${tableId} table changed`);
   *     console.log(sortedRowIds);
   *     // ^ cheaper than calling getSortedRowIds again
   *   },
   * );
   * console.log(store.getSortedRowIds('pets', 'price', false, 0, 3));
   * // -> ['lowly', 'mickey', 'carnaby']
   *
   * store.setCell('pets', 'carnaby', 'price', 4.5);
   * // -> 'First three sorted Row Ids for pets table changed'
   * // -> ['lowly', 'mickey', 'tom']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the sorted
   * Row Ids of a specific Table. The Row Ids are sorted by their own value,
   * since the `cellId` parameter is explicitly undefined.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets', undefined, false));
   * // -> ['felix', 'fido']
   *
   * const listenerId = store.addSortedRowIdsListener(
   *   'pets',
   *   undefined,
   *   false,
   *   0,
   *   undefined,
   *   (store, tableId, cellId, descending, offset, limit, sortedRowIds) => {
   *     console.log(`Sorted Row Ids for ${tableId} table changed`);
   *     console.log(sortedRowIds);
   *     // ^ cheaper than calling getSortedRowIds again
   *   },
   * );
   *
   * store.setRow('pets', 'cujo', {species: 'wolf'});
   * // -> 'Sorted Row Ids for pets table changed'
   * // -> ['cujo', 'felix', 'fido']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to a change in the sorting
   * of the rows of a specific Table, even though the set of Ids themselves has
   * not changed.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * console.log(store.getSortedRowIds('pets', 'species', false));
   * // -> ['felix', 'fido']
   *
   * const listenerId = store.addSortedRowIdsListener(
   *   'pets',
   *   'species',
   *   false,
   *   0,
   *   undefined,
   *   (store, tableId, cellId, descending, offset, limit, sortedRowIds) => {
   *     console.log(`Sorted Row Ids for ${tableId} table changed`);
   *     console.log(sortedRowIds);
   *     // ^ cheaper than calling getSortedRowIds again
   *   },
   * );
   *
   * store.setCell('pets', 'felix', 'species', 'tiger');
   * // -> 'Sorted Row Ids for pets table changed'
   * // -> ['fido', 'felix']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the sorted
   * Row Ids of a specific Table, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {
   *     cujo: {species: 'wolf'},
   *     felix: {species: 'cat'},
   *   },
   * });
   * const listenerId = store.addSortedRowIdsListener(
   *   'pets',
   *   'species',
   *   false,
   *   0,
   *   undefined,
   *   (store, tableId) => store.setCell('meta', 'sorted', tableId, true),
   *   true, // mutator
   * );
   *
   * store.setRow('pets', 'fido', {species: 'dog'});
   * console.log(store.getTable('meta'));
   * // -> {sorted: {pets: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v2.0.0
   */
  addSortedRowIdsListener(
    tableId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: SortedRowIdsListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addRowListener method registers a listener function with the Store that
   * will be called whenever data in a Row changes.
   *
   * The provided listener is a RowListener function, and will be called with a
   * reference to the Store, the Id of the Table that changed, the Id of the Row
   * that changed, and a GetCellChange function in case you need to inspect any
   * changes that occurred.
   *
   * You can either listen to a single Row (by specifying the Table Id and Row
   * Id as the method's first two parameters) or changes to any Row (by
   * providing `null` wildcards).
   *
   * Both, either, or neither of the `tableId` and `rowId` parameters can be
   * wildcarded with `null`. You can listen to a specific Row in a specific
   * Table, any Row in a specific Table, a specific Row in any Table, or any Row
   * in any Table.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
   * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever data in the
   * matching Row changes.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Row.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addRowListener(
   *   'pets',
   *   'fido',
   *   (store, tableId, rowId, getCellChange) => {
   *     console.log('fido row in pets table changed');
   *     console.log(getCellChange('pets', 'fido', 'color'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'fido row in pets table changed'
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any Row.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addRowListener(
   *   null,
   *   null,
   *   (store, tableId, rowId) => {
   *     console.log(`${rowId} row in ${tableId} table changed`);
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'fido row in pets table changed'
   * store.setTable('species', {dog: {price: 5}});
   * // -> 'dog row in species table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Row, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addRowListener(
   *   'pets',
   *   'fido',
   *   (store, tableId, rowId) =>
   *     store.setCell('meta', 'update', `${tableId}_${rowId}`, true),
   *   true,
   * );
   *
   * store.delCell('pets', 'fido', 'color');
   * console.log(store.getTable('meta'));
   * // -> {update: {pets_fido: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addRowListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    listener: RowListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addCellIdsListener method registers a listener function with the Store
   * that will be called whenever the Cell Ids in a Row change.
   *
   * The provided listener is a CellIdsListener function, and will be called
   * with a reference to the Store, the Id of the Table, and the Id of the Row
   * that changed.
   *
   * By default, such a listener is only called when a Cell is added or removed.
   * To listen to all changes in the Row, use the addRowListener method.
   *
   * You can either listen to a single Row (by specifying the Table Id and Row
   * Id as the method's first two parameters) or changes to any Row (by
   * providing a `null` wildcard).
   *
   * Both, either, or neither of the `tableId` and `rowId` parameters can be
   * wildcarded with `null`. You can listen to a specific Row in a specific
   * Table, any Row in a specific Table, a specific Row in any Table, or any Row
   * in any Table.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
   * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the Cell Ids in
   * the Row change.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any change to the Cell
   * Ids of a specific Row.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addCellIdsListener('pets', 'fido', (store) => {
   *   console.log('Cell Ids for fido row in pets table changed');
   *   console.log(store.getCellIds('pets', 'fido'));
   * });
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * // -> 'Cell Ids for fido row in pets table changed'
   * // -> ['species', 'color']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the Cell
   * Ids of any Row.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addCellIdsListener(
   *   null,
   *   null,
   *   (store, tableId, rowId) => {
   *     console.log(`Cell Ids for ${rowId} row in ${tableId} table changed`);
   *     console.log(store.getCellIds(tableId, rowId));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * // -> 'Cell Ids for fido row in pets table changed'
   * // -> ['species', 'color']
   * store.setCell('species', 'dog', 'price', 5);
   * // -> 'Cell Ids for dog row in species table changed'
   * // -> ['price']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the Cell
   * Ids of a specific Row, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const listenerId = store.addCellIdsListener(
   *   'pets',
   *   'fido',
   *   (store, tableId, rowId) =>
   *     store.setCell('meta', 'update', `${tableId}_${rowId}`, true),
   *   true, // mutator
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * console.log(store.getTable('meta'));
   * // -> {update: {pets_fido: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addCellIdsListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    listener: CellIdsListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addCellListener method registers a listener function with the Store
   * that will be called whenever data in a Cell changes.
   *
   * The provided listener is a CellListener function, and will be called with a
   * reference to the Store, the Id of the Table that changed, the Id of the Row
   * that changed, the Id of the Cell that changed, the new Cell value, the old
   * Cell value, and a GetCellChange function in case you need to inspect any
   * changes that occurred.
   *
   * You can either listen to a single Cell (by specifying the Table Id, Row Id,
   * and Cell Id as the method's first three parameters) or changes to any Cell
   * (by providing `null` wildcards).
   *
   * All, some, or none of the `tableId`, `rowId`, and `cellId` parameters can
   * be wildcarded with `null`. You can listen to a specific Cell in a specific
   * Row in a specific Table, any Cell in any Row in any Table, for example - or
   * every other combination of wildcards.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
   * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
   * @param cellId The Id of the Cell to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever data in the
   * matching Cell changes.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Cell.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addCellListener(
   *   'pets',
   *   'fido',
   *   'color',
   *   (store, tableId, rowId, cellId, newCell, oldCell, getCellChange) => {
   *     console.log('color cell in fido row in pets table changed');
   *     console.log([oldCell, newCell]);
   *     console.log(getCellChange('pets', 'fido', 'color'));
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'color cell in fido row in pets table changed'
   * // -> ['brown', 'walnut']
   * // -> [true, 'brown', 'walnut']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any Cell.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addCellListener(
   *   null,
   *   null,
   *   null,
   *   (store, tableId, rowId, cellId) => {
   *     console.log(
   *       `${cellId} cell in ${rowId} row in ${tableId} table changed`,
   *     );
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'color cell in fido row in pets table changed'
   * store.setTable('species', {dog: {price: 5}});
   * // -> 'price cell in dog row in species table changed'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Cell, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addCellListener(
   *   'pets',
   *   'fido',
   *   'color',
   *   (store, tableId, rowId, cellId) =>
   *     store.setCell('meta', 'update', `${tableId}_${rowId}_${cellId}`, true),
   *   true,
   * );
   *
   * store.delCell('pets', 'fido', 'color');
   * console.log(store.getTable('meta'));
   * // -> {update: {pets_fido_color: true}}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   */
  addCellListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: CellListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addValuesListener method registers a listener function with the Store
   * that will be called whenever the Values change.
   *
   * The provided listener is a ValuesListener function, and will be called with
   * a reference to the Store and a GetValueChange function in case you need to
   * inspect any changes that occurred.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param listener The function that will be called whenever data in the
   * Values changes.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any changes to the
   * Store's Values.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * const listenerId = store.addValuesListener((store, getValueChange) => {
   *   console.log('values changed');
   *   console.log(getValueChange('employees'));
   * });
   *
   * store.setValue('employees', 4);
   * // -> 'values changed'
   * // -> [true, 3, 4]
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to the
   * Store's Values, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * const listenerId = store.addValuesListener(
   *   (store, getValueChange) => store.setValue('updated', true),
   *   true,
   * );
   *
   * store.setValue('employees', 4);
   * console.log(store.getValues());
   * // -> {open: true, employees: 4, updated: true}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v3.0.0
   */
  addValuesListener(listener: ValuesListener, mutator?: boolean): Id;

  /**
   * The addValueIdsListener method registers a listener function with the Store
   * that will be called whenever the Value Ids in a Store change.
   *
   * The provided listener is a ValueIdsListener function, and will be called
   * with a reference to the Store.
   *
   * By default, such a listener is only called when a Value is added or
   * removed. To listen to all changes in the Values, use the addValuesListener
   * method.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param listener The function that will be called whenever the Value Ids in
   * the Store change.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any change to the Value
   * Ids.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * const listenerId = store.addValueIdsListener((store) => {
   *   console.log('Value Ids changed');
   *   console.log(store.getValueIds());
   * });
   *
   * store.setValue('employees', 3);
   * // -> 'Value Ids changed'
   * // -> ['open', 'employees']
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any change to the Value
   * Ids, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * const listenerId = store.addValueIdsListener(
   *   (store) => store.setValue('updated', true),
   *   true, // mutator
   * );
   *
   * store.setValue('employees', 3);
   * console.log(store.getValues());
   * // -> {open: true, employees: 3, updated: true}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v3.0.0
   */
  addValueIdsListener(listener: ValueIdsListener, mutator?: boolean): Id;

  /**
   * The addValueListener method registers a listener function with the Store
   * that will be called whenever data in a Value changes.
   *
   * The provided listener is a ValueListener function, and will be called with
   * a reference to the Store, the Id of the Value that changed, the new Value
   * value, the old Value, and a GetValueChange function in case you need to
   * inspect any changes that occurred.
   *
   * You can either listen to a single Value (by specifying the Value Id) or
   * changes to any Value (by providing a `null` wildcard).
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * @param valueId The Id of the Value to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever data in the
   * matching Value changes.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Value.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * const listenerId = store.addValueListener(
   *   'employees',
   *   (store, valueId, newValue, oldValue, getValueChange) => {
   *     console.log('employee value changed');
   *     console.log([oldValue, newValue]);
   *     console.log(getValueChange('employees'));
   *   },
   * );
   *
   * store.setValue('employees', 4);
   * // -> 'employee value changed'
   * // -> [3, 4]
   * // -> [true, 3, 4]
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to any
   * Value.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * const listenerId = store.addValueListener(null, (store, valueId) => {
   *   console.log(`${valueId} value changed`);
   * });
   *
   * store.setValue('employees', 4);
   * // -> 'employees value changed'
   * store.setValue('open', false);
   * // -> 'open value changed'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Value, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * const listenerId = store.addValueListener(
   *   'employees',
   *   (store, valueId) => store.setValue('updated', true),
   *   true,
   * );
   *
   * store.delValue('employees');
   * console.log(store.getValues());
   * // -> {open: true, updated: true}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v3.0.0
   */
  addValueListener(
    valueId: IdOrNull,
    listener: CellListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addInvalidCellListener method registers a listener function with the
   * Store that will be called whenever invalid data was attempted to be written
   * to a Cell.
   *
   * The provided listener is an InvalidCellListener function, and will be
   * called with a reference to the Store, the Id of the Table, the Id of the
   * Row, and the Id of Cell that was being attempted to be changed. It is also
   * given the invalid value of the Cell, which could have been of absolutely
   * any type. Since there could have been multiple failed attempts to set the
   * Cell within a single transaction, this is an array containing each attempt,
   * chronologically.
   *
   * You can either listen to a single Cell (by specifying the Table Id, Row Id,
   * and Cell Id as the method's first three parameters) or invalid attempts to
   * change any Cell (by providing `null` wildcards).
   *
   * All, some, or none of the `tableId`, `rowId`, and `cellId` parameters can
   * be wildcarded with `null`. You can listen to a specific Cell in a specific
   * Row in a specific Table, any Cell in any Row in any Table, for example - or
   * every other combination of wildcards.
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * Special note should be made for how the listener will be called when a
   * TablesSchema is present. The listener will be called:
   *
   * - if a Table is being updated that is not specified in the TablesSchema
   * - if a Cell is of the wrong type specified in the TablesSchema
   * - if a Cell is omitted and is not defaulted in the TablesSchema
   * - if an empty Row is provided and there are no Cell defaults in the
   *   TablesSchema
   *
   * The listener will not be called if a Cell that is defaulted in the
   * TablesSchema is not provided, as long as all of the Cells that are _not_
   * defaulted _are_ provided.
   *
   * To help understand all of these schema-based conditions, please see the
   * TablesSchema example below.
   *
   * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
   * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
   * @param cellId The Id of the Cell to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever an attempt to
   * write invalid data to the matching Cell was made.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any invalid changes to a
   * specific Cell.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addInvalidCellListener(
   *   'pets',
   *   'fido',
   *   'color',
   *   (store, tableId, rowId, cellId, invalidCells) => {
   *     console.log('Invalid color cell in fido row in pets table');
   *     console.log(invalidCells);
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', {r: '96', g: '4B', b: '00'});
   * // -> 'Invalid color cell in fido row in pets table'
   * // -> [{r: '96', g: '4B', b: '00'}]
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any invalid changes to
   * any Cell - in a Store _without_ a TablesSchema. Note also how it then
   * responds to cases where empty or invalid Row objects, or Table objects,
   * or Tables objects are provided.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addInvalidCellListener(
   *   null,
   *   null,
   *   null,
   *   (store, tableId, rowId, cellId) => {
   *     console.log(
   *       `Invalid ${cellId} cell in ${rowId} row in ${tableId} table`,
   *     );
   *   },
   * );
   *
   * store.setCell('pets', 'fido', 'color', {r: '96', g: '4B', b: '00'});
   * // -> 'Invalid color cell in fido row in pets table'
   * store.setTable('sales', {fido: {date: new Date()}});
   * // -> 'Invalid date cell in fido row in sales table'
   *
   * store.setRow('pets', 'felix', {});
   * // -> 'Invalid undefined cell in felix row in pets table'
   *
   * store.setRow('filter', 'name', /[a-z]?/);
   * // -> 'Invalid undefined cell in name row in filter table'
   *
   * store.setRow('sales', '2021', {forecast: undefined});
   * // -> 'Invalid forecast cell in 2021 row in sales table'
   *
   * store.addRow('filter', /[0-9]?/);
   * // -> 'Invalid undefined cell in undefined row in filter table'
   *
   * store.setTable('raw', {});
   * // -> 'Invalid undefined cell in undefined row in raw table'
   *
   * store.setTable('raw', ['row1', 'row2']);
   * // -> 'Invalid undefined cell in undefined row in raw table'
   *
   * store.setTables(['table1', 'table2']);
   * // -> 'Invalid undefined cell in undefined row in undefined table'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any invalid changes to
   * any Cell - in a Store _with_ a TablesSchema. Note how it responds to cases
   * where missing parameters are provided for optional, and defaulted Cell
   * values in a Row.
   *
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {
   *     species: {type: 'string'},
   *     color: {type: 'string', default: 'unknown'},
   *   },
   * });
   *
   * const listenerId = store.addInvalidCellListener(
   *   null,
   *   null,
   *   null,
   *   (store, tableId, rowId, cellId) => {
   *     console.log(
   *       `Invalid ${cellId} cell in ${rowId} row in ${tableId} table`,
   *     );
   *   },
   * );
   *
   * store.setRow('sales', 'fido', {price: 5});
   * // -> 'Invalid price cell in fido row in sales table'
   * // The listener is called, because the sales Table is not in the schema
   *
   * store.setRow('pets', 'felix', {species: true});
   * // -> 'Invalid species cell in felix row in pets table'
   * // The listener is called, because species is invalid...
   * console.log(store.getRow('pets', 'felix'));
   * // -> {color: 'unknown'}
   * // ...even though a Row was set with the default value
   *
   * store.setRow('pets', 'fido', {color: 'brown'});
   * // -> 'Invalid species cell in fido row in pets table'
   * // The listener is called, because species is missing and not defaulted...
   * console.log(store.getRow('pets', 'fido'));
   * // -> {color: 'brown'}
   * // ...even though a Row was set
   *
   * store.setRow('pets', 'rex', {species: 'dog'});
   * console.log(store.getRow('pets', 'rex'));
   * // -> {species: 'dog', color: 'unknown'}
   * // The listener is not called, because color is defaulted
   *
   * store.delTables().setTablesSchema({
   *   pets: {
   *     species: {type: 'string'},
   *     color: {type: 'string'},
   *   },
   * });
   *
   * store.setRow('pets', 'cujo', {});
   * // -> 'Invalid species cell in cujo row in pets table'
   * // -> 'Invalid color cell in cujo row in pets table'
   * // -> 'Invalid undefined cell in cujo row in pets table'
   * // The listener is called multiple times, because neither Cell is defaulted
   * // and the Row as a whole is empty
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Cell, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addInvalidCellListener(
   *   'pets',
   *   'fido',
   *   'color',
   *   (store, tableId, rowId, cellId, invalidCells) =>
   *     store.setCell(
   *       'meta',
   *       'invalid_updates',
   *       `${tableId}_${rowId}_${cellId}`,
   *       JSON.stringify(invalidCells[0]),
   *     ),
   *   true,
   * );
   *
   * store.setCell('pets', 'fido', 'color', {r: '96', g: '4B', b: '00'});
   * console.log(store.getRow('meta', 'invalid_updates'));
   * // -> {'pets_fido_color': '{"r":"96","g":"4B","b":"00"}'}
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v1.1.0
   */
  addInvalidCellListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: InvalidCellListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addInvalidValueListener method registers a listener function with the
   * Store that will be called whenever invalid data was attempted to be written
   * to a Value.
   *
   * The provided listener is an InvalidValueListener function, and will be
   * called with a reference to the Store and the Id of Value that was being
   * attempted to be changed. It is also given the invalid value of the Value,
   * which could have been of absolutely any type. Since there could have been
   * multiple failed attempts to set the Value within a single transaction, this
   * is an array containing each attempt, chronologically.
   *
   * You can either listen to a single Value (by specifying the Value Id as the
   * method's first parameter) or invalid attempts to change any Value (by
   * providing a `null` wildcard).
   *
   * Use the optional mutator parameter to indicate that there is code in the
   * listener that will mutate Store data. If set to `false` (or omitted), such
   * mutations will be silently ignored. All relevant mutator listeners (with
   * this flag set to `true`) are called _before_ any non-mutator listeners
   * (since the latter may become relevant due to changes made in the former).
   * The changes made by mutator listeners do not fire other mutating listeners,
   * though they will fire non-mutator listeners.
   *
   * Special note should be made for how the listener will be called when a
   * ValuesSchema is present. The listener will be called:
   *
   * - if a Value is being updated that is not specified in the ValuesSchema
   * - if a Value is of the wrong type specified in the ValuesSchema
   * - if a Value is omitted when using setValues that is not defaulted in the
   *   ValuesSchema
   *
   * The listener will not be called if a Value that is defaulted in the
   * ValuesSchema is not provided, as long as all of the Values that are _not_
   * defaulted _are_ provided.
   *
   * To help understand all of these schema-based conditions, please see the
   * ValuesSchema example below.
   *
   * @param valueId The Id of the Value to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever an attempt to
   * write invalid data to the matching Value was made.
   * @param mutator An optional boolean that indicates that the listener mutates
   * Store data.
   * @returns A unique Id for the listener that can later be used to call it
   * explicitly, or to remove it.
   * @example
   * This example registers a listener that responds to any invalid changes to a
   * specific Value.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * const listenerId = store.addInvalidValueListener(
   *   'open',
   *   (store, valueId, invalidValues) => {
   *     console.log('Invalid open value');
   *     console.log(invalidValues);
   *   },
   * );
   *
   * store.setValue('open', {yes: true});
   * // -> 'Invalid open value'
   * // -> [{yes: true}]
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any invalid changes to
   * any Value - in a Store _without_ a ValuesSchema. Note also how it then
   * responds to cases where an empty Values object is provided.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * const listenerId = store.addInvalidValueListener(
   *   null,
   *   (store, valueId) => {
   *     console.log(`Invalid ${valueId} value`);
   *   },
   * );
   *
   * store.setValue('open', {yes: true});
   * // -> 'Invalid open value'
   * store.setValue('employees', ['alice', 'bob']);
   * // -> 'Invalid employees value'
   *
   * store.setValues('pets', 'felix', {});
   * // -> 'Invalid undefined value'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any invalid changes to
   * any Value - in a Store _with_ a ValuesSchema. Note how it responds to cases
   * where missing parameters are provided for optional, and defaulted Values.
   *
   * ```js
   * const store = createStore().setValuesSchema({
   *   open: {type: 'boolean', default: false},
   *   employees: {type: 'number'},
   * });
   *
   * console.log(store.getValues());
   * // -> {open: false}
   *
   * const listenerId = store.addInvalidValueListener(
   *   null,
   *   (store, valueId) => {
   *     console.log(`Invalid ${valueId} value`);
   *   },
   * );
   *
   * store.setValue('website', true);
   * // -> 'Invalid website value'
   * // The listener is called, because the website Value is not in the schema
   *
   * store.setValue('open', 'yes');
   * // -> 'Invalid open value'
   * // The listener is called, because 'open' is invalid...
   * console.log(store.getValues());
   * // -> {open: false}
   * // ...even though it is still present with the default value
   *
   * store.setValues({open: true});
   * // -> 'Invalid employees value'
   * // The listener is called because employees is missing and not defaulted...
   * console.log(store.getValues());
   * // -> {open: true}
   * // ...even though the Values were set
   *
   * store.setValues({employees: 3});
   * console.log(store.getValues());
   * // -> {open: false, employees: 3}
   * // The listener is not called, because 'open' is defaulted
   *
   * store.setValuesSchema({
   *   open: {type: 'boolean'},
   *   employees: {type: 'number'},
   * });
   *
   * store.setValues({});
   * // -> 'Invalid open value'
   * // -> 'Invalid employees value'
   * // -> 'Invalid undefined value'
   * // The listener is called multiple times, because neither Value is
   * // defaulted and the Values as a whole were empty
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener that responds to any changes to a
   * specific Value, and which also mutates the Store itself.
   *
   * ```js
   * const store = createStore().setValues({open: true});
   * const listenerId = store.addInvalidValueListener(
   *   'open',
   *   (store, valueId, invalidValues) =>
   *     store.setValue('invalid_updates', JSON.stringify(invalidValues[0])),
   *   true,
   * );
   *
   * store.setValue('open', {yes: true});
   * console.log(store.getValue('invalid_updates'));
   * // -> '{"yes":true}'
   *
   * store.delListener(listenerId);
   * ```
   * @category Listener
   * @since v3.0.0
   */
  addInvalidValueListener(
    valueId: IdOrNull,
    listener: InvalidValueListener,
    mutator?: boolean,
  ): Id;

  /**
   * The addWillFinishTransactionListener method registers a listener function
   * with the Store that will be called just before other non-mutating listeners
   * are called at the end of the transaction.
   *
   * This is useful if you need to know that a set of listeners are about to be
   * called at the end of a transaction, perhaps to batch _their_ consequences
   * together.
   *
   * The provided TransactionListener will receive a reference to the Store and
   * two booleans to indicate whether Cell or Value data has been touched during
   * the transaction. The two flags are intended as a hint about whether
   * non-mutating listeners might be being called at the end of the transaction.
   *
   * Here, 'touched' means that Cell or Value data has either been changed, or
   * changed and then changed back to its original value during the transaction.
   * The exception is a transaction that has been rolled back, for which the
   * value of `cellsTouched` and `valuesTouched` in the listener will be `false`
   * because all changes have been reverted.
   *
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that is called at the end of the
   * transaction, just before its listeners will be called. The transactions
   * shown here variously change, touch, and rollback cells, demonstrating how
   * the `cellsTouched` and `valuesTouched` parameters in the listener work.
   *
   * ```js
   * const store = createStore()
   *   .setTables({
   *     pets: {fido: {species: 'dog', color: 'brown'}},
   *   })
   *   .setValues({open: true, employees: 3});
   * const listenerId = store.addWillFinishTransactionListener(
   *   (store, cellsTouched, valuesTouched) => {
   *     console.log(`Cells/Values touched: ${cellsTouched}/${valuesTouched}`);
   *   },
   * );
   * const listenerId2 = store.addTablesListener(() =>
   *   console.log('Tables changed'),
   * );
   * const listenerId3 = store.addValuesListener(() =>
   *   console.log('Values changed'),
   * );
   *
   * store.transaction(() =>
   *   store.setCell('pets', 'fido', 'color', 'brown').setValue('employees', 3),
   * );
   * // -> 'Cells/Values touched: false/false'
   *
   * store.transaction(() => store.setCell('pets', 'fido', 'color', 'walnut'));
   * // -> 'Cells/Values touched: true/false'
   * // -> 'Tables changed'
   *
   * store.transaction(() => store.setValue('employees', 4));
   * // -> 'Cells/Values touched: false/true'
   * // -> 'Values changed'
   *
   * store.transaction(() => {
   *   store
   *     .setRow('pets', 'felix', {species: 'cat'})
   *     .delRow('pets', 'felix')
   *     .setValue('city', 'London')
   *     .delValue('city');
   * });
   * // -> 'Cells/Values touched: true/true'
   * // But no Tables or Values listeners fired since there are no net changes.
   *
   * store.transaction(
   *   () =>
   *     store
   *       .setRow('pets', 'felix', {species: 'cat'})
   *       .setValue('city', 'London'),
   *   () => true,
   * );
   * // -> 'Cells/Values touched: false/false'
   * // Transaction was rolled back.
   *
   * store.callListener(listenerId);
   * // -> 'Cells/Values touched: undefined/undefined'
   * // It is meaningless to call this listener directly.
   *
   * store
   *   .delListener(listenerId)
   *   .delListener(listenerId2)
   *   .delListener(listenerId3);
   * ```
   * @category Listener
   * @since v1.3.0
   */
  addWillFinishTransactionListener(listener: TransactionListener): Id;

  /**
   * The addDidFinishTransactionListener method registers a listener function
   * with the Store that will be called just after other non-mutating listeners
   * are called at the end of the transaction.
   *
   * This is useful if you need to know that a set of listeners have just been
   * called at the end of a transaction, perhaps to batch _their_ consequences
   * together.
   *
   * The provided TransactionListener will receive a reference to the Store and
   * two booleans to indicate whether Cell or Value data has been touched during
   * the transaction. The two flags is intended as a hint about whether
   * non-mutating listeners might have been called at the end of the
   * transaction.
   *
   * Here, 'touched' means that Cell or Value data has either been changed, or
   * changed and then changed back to its original value during the transaction.
   * The exception is a transaction that has been rolled back, for which the
   * value of `cellsTouched` and `valuesTouched` in the listener will be `false`
   * because all changes have been reverted.
   *
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example registers a listener that is called at the end of the
   * transaction, just after its listeners have been called. The transactions
   * shown here variously change, touch, and rollback cells, demonstrating how
   * the `cellsTouched` and `valuesTouched` parameters in the listener work.
   *
   * ```js
   * const store = createStore()
   *   .setTables({
   *     pets: {fido: {species: 'dog', color: 'brown'}},
   *   })
   *   .setValues({open: true, employees: 3});
   * const listenerId = store.addDidFinishTransactionListener(
   *   (store, cellsTouched, valuesTouched) => {
   *     console.log(`Cells/Values touched: ${cellsTouched}/${valuesTouched}`);
   *   },
   * );
   * const listenerId2 = store.addTablesListener(() =>
   *   console.log('Tables changed'),
   * );
   * const listenerId3 = store.addValuesListener(() =>
   *   console.log('Values changed'),
   * );
   *
   * store.transaction(() =>
   *   store.setCell('pets', 'fido', 'color', 'brown').setValue('employees', 3),
   * );
   * // -> 'Cells/Values touched: false/false'
   *
   * store.transaction(() => store.setCell('pets', 'fido', 'color', 'walnut'));
   * // -> 'Tables changed'
   * // -> 'Cells/Values touched: true/false'
   *
   * store.transaction(() => store.setValue('employees', 4));
   * // -> 'Values changed'
   * // -> 'Cells/Values touched: false/true'
   *
   * store.transaction(() => {
   *   store
   *     .setRow('pets', 'felix', {species: 'cat'})
   *     .delRow('pets', 'felix')
   *     .setValue('city', 'London')
   *     .delValue('city');
   * });
   * // -> 'Cells/Values touched: true/true'
   * // But no Tables or Values listeners fired since there are no net changes.
   *
   * store.transaction(
   *   () =>
   *     store
   *       .setRow('pets', 'felix', {species: 'cat'})
   *       .setValue('city', 'London'),
   *   () => true,
   * );
   * // -> 'Cells/Values touched: false/false'
   * // Transaction was rolled back.
   *
   * store.callListener(listenerId);
   * // -> 'Cells/Values touched: undefined/undefined'
   * // It is meaningless to call this listener directly.
   *
   * store
   *   .delListener(listenerId)
   *   .delListener(listenerId2)
   *   .delListener(listenerId3);
   * ```
   * @category Listener
   * @since v1.3.0
   */
  addDidFinishTransactionListener(listener: TransactionListener): Id;

  /**
   * The callListener method provides a way for you to manually provoke a
   * listener to be called, even if the underlying data hasn't changed.
   *
   * This is useful when you are using mutator listeners to guarantee that data
   * conforms to programmatic conditions, and those conditions change such that
   * you need to update the Store in bulk.
   *
   * @param listenerId The Id of the listener to call.
   * @returns A reference to the Store.
   * @example
   * This example registers a listener that ensures a Cell has one of list of a
   * valid values. After that list changes, the listener is called to apply the
   * condition to the existing data.
   *
   * ```js
   * const validColors = ['walnut', 'brown', 'black'];
   * const store = createStore();
   * const listenerId = store.addCellListener(
   *   'pets',
   *   null,
   *   'color',
   *   (store, tableId, rowId, cellId, color) => {
   *     if (!validColors.includes(color)) {
   *       store.setCell(tableId, rowId, cellId, validColors[0]);
   *     }
   *   },
   *   true,
   * );
   *
   * store.setRow('pets', 'fido', {species: 'dog', color: 'honey'});
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'dog', color: 'walnut'}
   *
   * validColors.shift();
   * console.log(validColors);
   * // -> ['brown', 'black']
   *
   * store.callListener(listenerId);
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'dog', color: 'brown'}
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener to Row Id changes. It is explicitly
   * called and fires for two Tables in the Store.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   *
   * const listenerId = store.addRowIdsListener(null, (store, tableId) => {
   *   console.log(`Row Ids listener called for ${tableId} table`);
   * });
   *
   * store.callListener(listenerId);
   * // -> 'Row Ids listener called for pets table'
   * // -> 'Row Ids listener called for species table'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers a listener Value changes. It is explicitly called
   * and fires for two Values in the Store.
   *
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   *
   * const listenerId = store.addValueListener(
   *   null,
   *   (store, valueId, value) => {
   *     console.log(`Value listener called for ${valueId} value, ${value}`);
   *   },
   * );
   *
   * store.callListener(listenerId);
   * // -> 'Value listener called for open value, true'
   * // -> 'Value listener called for employees value, 3'
   *
   * store.delListener(listenerId);
   * ```
   * @example
   * This example registers listeners for the end of transactions, and for
   * invalid Cells. The are explicitly called, meaninglessly. The former
   * receives empty arguments. The latter is not called at all.
   *
   * ```js
   * const store = createStore();
   *
   * const listenerId = store.addWillFinishTransactionListener(
   *   (store, cellsTouched, valuesTouched) => {
   *     console.log(`Transaction finish: ${cellsTouched}/${valuesTouched}`);
   *   },
   * );
   * store.callListener(listenerId);
   * // -> 'Transaction finish: undefined/undefined'
   * store.delListener(listenerId);
   *
   * const listenerId2 = store.addInvalidCellListener(
   *   null,
   *   null,
   *   null,
   *   (store, tableId, rowId, cellId) => {
   *     console.log('Invalid cell', tableId, rowId, cellId);
   *   },
   * );
   * store.callListener(listenerId2);
   * // -> undefined
   * store.delListener(listenerId2);
   * ```
   * @category Listener
   */
  callListener(listenerId: Id): Store;

  /**
   * The delListener method removes a listener that was previously added to the
   * Store.
   *
   * Use the Id returned by whichever method was used to add the listener. Note
   * that the Store may re-use this Id for future listeners added to it.
   *
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the Store.
   * @example
   * This example registers a listener and then removes it.
   *
   * ```js
   * const store = createStore().setTables({
   *   pets: {fido: {species: 'dog', color: 'brown'}},
   * });
   * const listenerId = store.addTablesListener(() => {
   *   console.log('Tables changed');
   * });
   *
   * store.setCell('pets', 'fido', 'color', 'walnut');
   * // -> 'Tables changed'
   *
   * store.delListener(listenerId);
   *
   * store.setCell('pets', 'fido', 'color', 'honey');
   * // -> undefined
   * // The listener is not called.
   * ```
   * @category Listener
   */
  delListener(listenerId: Id): Store;

  /**
   * The getListenerStats method provides a set of statistics about the
   * listeners registered with the Store, and is used for debugging purposes.
   *
   * The StoreListenerStats object contains a breakdown of the different types
   * of listener. Totals include both mutator and non-mutator listeners.
   *
   * The statistics are only populated in a debug build: production builds
   * return an empty object. The method is intended to be used during
   * development to ensure your application is not leaking listener
   * registrations, for example.
   *
   * @returns A StoreListenerStats object containing Store listener statistics.
   * @example
   * This example gets the listener statistics of a small and simple Store.
   *
   * ```js
   * const store = createStore();
   * store.addTablesListener(() => console.log('Tables changed'));
   * store.addRowIdsListener(() => console.log('Row Ids changed'));
   *
   * const listenerStats = store.getListenerStats();
   * console.log(listenerStats.rowIds);
   * // -> 1
   * console.log(listenerStats.tables);
   * // -> 1
   * ```
   * @category Development
   */
  getListenerStats(): StoreListenerStats;
}

/**
 * The createStore function creates a Store, and is the main entry point into
 * the store module.
 *
 * Since (or perhaps _because_) it is the most important function in the whole
 * module, it is trivially simple.
 *
 * @returns A reference to the new Store.
 * @example
 * This example creates a Store.
 *
 * ```js
 * const store = createStore();
 * console.log(store.getTables());
 * // -> {}
 * ```
 * @example
 * This example creates a Store with some initial data:
 *
 * ```js
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 * ```
 * @example
 * This example creates a Store with some initial data and a TablesSchema:
 *
 * ```js
 * const store = createStore()
 *   .setTables({pets: {fido: {species: 'dog'}}})
 *   .setTablesSchema({
 *     pets: {
 *       species: {type: 'string'},
 *       sold: {type: 'boolean', default: false},
 *     },
 *   });
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog', sold: false}}}
 * ```
 * @see The Basics guides
 * @category Creation
 */
export function createStore(): Store;
