/**
 * The middleware module of the TinyBase project provides the ability to
 * intercept and validate incoming writes to Store objects.
 *
 * The main entry point to this module is the createMiddleware function, which
 * returns a new Middleware object. From there, you can register hooks that are
 * called before data is written to the Store.
 * @packageDocumentation
 * @module middleware
 * @since v8.0.0
 */
/// middleware
/**
 * The WillSetContentCallback type describes a function that is called before
 * Content is set in the Store.
 *
 * The callback receives the Content (a [Tables, Values] tuple) that is about to
 * be set. It can return the Content (possibly transformed) to allow the write,
 * or `undefined` to prevent the Content from being set.
 *
 * Multiple WillSetContentCallback functions can be registered and they will be
 * called sequentially, the Content being updated successively. If any callback
 * returns `undefined`, the chain short-circuits and the Content will not be
 * set.
 * @param content The Content about to be set.
 * @returns The Content to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetContentCallback
/**
 * The WillSetTablesCallback type describes a function that is called before
 * Tables are set in the Store.
 *
 * The callback receives the Tables object that is about to be set. It can
 * return the Tables (possibly transformed) to allow the write, or `undefined`
 * to prevent the Tables from being set.
 *
 * Multiple WillSetTablesCallback functions can be registered and they will be
 * called sequentially, the Tables being updated successively. If any callback
 * returns `undefined`, the chain short-circuits and the Tables will not be set.
 * @param tables The Tables object about to be set.
 * @returns The Tables to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetTablesCallback
/**
 * The WillSetTableCallback type describes a function that is called before a
 * Table is set in the Store.
 *
 * The callback receives the table Id and the Table object that is about to be
 * set. It can return the Table (possibly transformed) to allow the write, or
 * `undefined` to prevent the Table from being set.
 *
 * Multiple WillSetTableCallback functions can be registered and they will be
 * called sequentially, the Table being updated successively. If any callback
 * returns `undefined`, the chain short-circuits and the Table will not be set.
 * @param tableId The Id of the Table being set.
 * @param table The Table object about to be set.
 * @returns The Table to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetTableCallback
/**
 * The WillSetRowCallback type describes a function that is called before a Row
 * is set in the Store.
 *
 * The callback receives the table Id, row Id, and the Row object that is about
 * to be set. It can return the Row (possibly transformed) to allow the write,
 * or `undefined` to prevent the Row from being set.
 *
 * Multiple WillSetRowCallback functions can be registered and they will be
 * called sequentially, the Row being updated successively. If any callback
 * returns `undefined`, the chain short-circuits and the Row will not be set.
 * @param tableId The Id of the Table being written to.
 * @param rowId The Id of the Row being set.
 * @param row The Row object about to be set.
 * @returns The Row to use (possibly transformed), or `undefined` to prevent the
 * write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetRowCallback
/**
 * The WillSetCellCallback type describes a function that is called before a
 * Cell is set in the Store.
 *
 * The callback receives the table Id, row Id, cell Id, and the Cell value that
 * is about to be set. It can return the Cell value (possibly transformed) to
 * allow the write, or `undefined` to prevent the Cell from being set.
 *
 * Multiple WillSetCellCallback functions can be registered and they will be
 * called sequentially, the Cell value being updated successively. If any
 * callback returns `undefined`, the chain short-circuits and the Cell will not
 * be set.
 * @param tableId The Id of the Table being written to.
 * @param rowId The Id of the Row being written to.
 * @param cellId The Id of the Cell being set.
 * @param cell The Cell value about to be set.
 * @returns The Cell value to use (possibly transformed), or `undefined` to
 * prevent the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetCellCallback
/**
 * The WillSetValuesCallback type describes a function that is called before
 * Values are set in the Store.
 *
 * The callback receives the Values object that is about to be set. It can
 * return the Values (possibly transformed) to allow the write, or `undefined`
 * to prevent the Values from being set.
 *
 * Multiple WillSetValuesCallback functions can be registered and they will be
 * called sequentially, the Values being updated successively. If any callback
 * returns `undefined`, the chain short-circuits and the Values will not be set.
 * @param values The Values object about to be set.
 * @returns The Values to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetValuesCallback
/**
 * The WillSetValueCallback type describes a function that is called before a
 * Value is set in the Store.
 *
 * The callback receives the value Id and the Value that is about to be set. It
 * can return the Value (possibly transformed) to allow the write, or
 * `undefined` to prevent the Value from being set.
 *
 * Multiple WillSetValueCallback functions can be registered and they will be
 * called sequentially, the Value being updated successively. If any callback
 * returns `undefined`, the chain short-circuits and the Value will not be set.
 * @param valueId The Id of the Value being set.
 * @param value The Value about to be set.
 * @returns The Value to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetValueCallback
/**
 * The WillDelTablesCallback type describes a function that is called before all
 * Tables are deleted from the Store.
 *
 * The callback takes no parameters. It returns `true` to allow the deletion, or
 * `false` to prevent it.
 *
 * Multiple WillDelTablesCallback functions can be registered and they will be
 * called sequentially. If any callback returns `false`, the chain
 * short-circuits and the Tables will not be deleted.
 * @returns `true` to allow the deletion, `false` to prevent it.
 * @category Callback
 * @since v8.0.0
 */
/// WillDelTablesCallback
/**
 * The WillDelTableCallback type describes a function that is called before a
 * Table is deleted from the Store.
 *
 * The callback receives the table Id of the Table about to be deleted. It
 * returns `true` to allow the deletion, or `false` to prevent it.
 *
 * Multiple WillDelTableCallback functions can be registered and they will be
 * called sequentially. If any callback returns `false`, the chain
 * short-circuits and the Table will not be deleted.
 * @param tableId The Id of the Table being deleted.
 * @returns `true` to allow the deletion, `false` to prevent it.
 * @category Callback
 * @since v8.0.0
 */
/// WillDelTableCallback
/**
 * The WillDelRowCallback type describes a function that is called before a Row
 * is deleted from the Store.
 *
 * The callback receives the table Id and row Id of the Row about to be deleted.
 * It returns `true` to allow the deletion, or `false` to prevent it.
 *
 * Multiple WillDelRowCallback functions can be registered and they will be
 * called sequentially. If any callback returns `false`, the chain
 * short-circuits and the Row will not be deleted.
 * @param tableId The Id of the Table containing the Row.
 * @param rowId The Id of the Row being deleted.
 * @returns `true` to allow the deletion, `false` to prevent it.
 * @category Callback
 * @since v8.0.0
 */
/// WillDelRowCallback
/**
 * The WillDelCellCallback type describes a function that is called before a
 * Cell is deleted from the Store.
 *
 * The callback receives the table Id, row Id, and cell Id of the Cell about to
 * be deleted. It returns `true` to allow the deletion, or `false` to prevent
 * it.
 *
 * Multiple WillDelCellCallback functions can be registered and they will be
 * called sequentially. If any callback returns `false`, the chain
 * short-circuits and the Cell will not be deleted.
 * @param tableId The Id of the Table containing the Cell.
 * @param rowId The Id of the Row containing the Cell.
 * @param cellId The Id of the Cell being deleted.
 * @returns `true` to allow the deletion, `false` to prevent it.
 * @category Callback
 * @since v8.0.0
 */
/// WillDelCellCallback
/**
 * The WillDelValuesCallback type describes a function that is called before all
 * Values are deleted from the Store.
 *
 * The callback takes no parameters. It returns `true` to allow the deletion, or
 * `false` to prevent it.
 *
 * Multiple WillDelValuesCallback functions can be registered and they will be
 * called sequentially. If any callback returns `false`, the chain
 * short-circuits and the Values will not be deleted.
 * @returns `true` to allow the deletion, `false` to prevent it.
 * @category Callback
 * @since v8.0.0
 */
/// WillDelValuesCallback
/**
 * The WillDelValueCallback type describes a function that is called before a
 * Value is deleted from the Store.
 *
 * The callback receives the value Id of the Value about to be deleted. It
 * returns `true` to allow the deletion, or `false` to prevent it.
 *
 * Multiple WillDelValueCallback functions can be registered and they will be
 * called sequentially. If any callback returns `false`, the chain
 * short-circuits and the Value will not be deleted.
 * @param valueId The Id of the Value being deleted.
 * @returns `true` to allow the deletion, `false` to prevent it.
 * @category Callback
 * @since v8.0.0
 */
/// WillDelValueCallback
/**
 * The WillApplyChangesCallback type describes a function that is called before
 * Changes are applied to the Store.
 *
 * The callback receives the Changes object that is about to be applied. It can
 * return the Changes (possibly transformed) to allow the write, or `undefined`
 * to prevent the Changes from being applied.
 *
 * Multiple WillApplyChangesCallback functions can be registered and they will
 * be called sequentially, the Changes being updated successively. If any
 * callback returns `undefined`, the chain short-circuits and the Changes will
 * not be applied.
 * @param changes The Changes about to be applied.
 * @returns The Changes to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillApplyChangesCallback
/**
 * The DidSetRowCallback type describes a function called after a Row is changed
 * during a transaction, and after mutator listeners have fired.
 *
 * Unlike the `willSet*` callbacks, which intercept writes as they happen,
 * `didSetRow` fires once per touched Row after all cell writes in the
 * transaction have completed. This means multiple cell changes to the same Row
 * within a single transaction result in just one `didSetRow` call, with the
 * full before-transaction and after-transaction Row states.
 *
 * The callback receives the Table Id, Row Id, the Row as it was at the start of
 * the transaction (`oldRow`), and the Row as it is now (`newRow`). It must
 * return a Row:
 *
 * - `newRow` to accept the changes.
 * - a different `Row` to replace the final state.
 * - `oldRow` to revert all changes to the Row.
 * - an empty object to delete the Row.
 *
 * Multiple DidSetRowCallback functions can be registered for the same table and
 * they will be called sequentially, each receiving the Row returned by the
 * previous callback. The chain never short-circuits: all registered callbacks
 * always run.
 *
 * Note that `addDidSetRowCallback` is table-scoped: you must specify the table
 * Id when registering. Callbacks are only invoked for rows in the specified
 * table, keeping overhead to zero for other tables.
 * @param tableId The Id of the Table containing the changed Row.
 * @param rowId The Id of the Row that was changed.
 * @param oldRow The Row as it was at the start of the transaction.
 * @param newRow The Row as it is now, after all cell writes including those
 * made by mutating listeners.
 * @returns The Row to use as the final state.
 * @category Callback
 * @since v8.0.0
 */
/// DidSetRowCallback
/**
 * A Middleware object lets you intercept and validate writes to a Store.
 *
 * This is useful for enforcing business rules, data validation, or
 * transformation logic before data is persisted in the Store.
 *
 * Create a Middleware object easily with the createMiddleware function.
 * @example
 * This example shows a very simple lifecycle of a Middleware object: from
 * creation, to getting the Store reference, and then destroying it.
 *
 * ```js
 * import {createMiddleware, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const middleware = createMiddleware(store);
 *
 * console.log(middleware.getStore() == store);
 * // -> true
 *
 * middleware.destroy();
 * ```
 * @category Middleware
 * @since v8.0.0
 */
/// Middleware
{
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Middleware object.
   * @returns A reference to the Store.
   * @example
   * This example creates a Middleware object against a newly-created Store and
   * then gets its reference in order to update its data.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const middleware = createMiddleware(createStore());
   * console.log(middleware.getStore().getTables());
   * // -> {}
   * middleware.destroy();
   * ```
   * @category Getter
   * @since v8.0.0
   */
  /// Middleware.getStore
  /**
   * The addWillSetContentCallback method registers a WillSetContentCallback
   * that will be called before Content is set in the Store.
   *
   * The callback can transform the Content or return `undefined` to prevent the
   * write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) Content from the
   * previous callback.
   * @param callback The WillSetContentCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents setting Content with
   * empty Tables in the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetContentCallback(([tables, values]) =>
   *   Object.keys(tables).length > 0 ? [tables, values] : undefined,
   * );
   *
   * store.setContent([{}, {open: true}]);
   * console.log(store.getContent());
   * // -> [{}, {}]
   *
   * store.setContent([{pets: {fido: {species: 'dog'}}}, {}]);
   * console.log(store.getContent());
   * // -> [{pets: {fido: {species: 'dog'}}}, {}]
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetContentCallback
  /**
   * The addWillSetTablesCallback method registers a WillSetTablesCallback that
   * will be called before Tables are set in the Store.
   *
   * The callback can transform the Tables or return `undefined` to prevent the
   * write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) tables from the
   * previous callback.
   * @param callback The WillSetTablesCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that upper-cases all string Cell values
   * when entire Tables are set in the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetTablesCallback((tables) =>
   *   Object.fromEntries(
   *     Object.entries(tables).map(([tableId, table]) => [
   *       tableId,
   *       Object.fromEntries(
   *         Object.entries(table).map(([rowId, row]) => [
   *           rowId,
   *           Object.fromEntries(
   *             Object.entries(row).map(([k, v]) => [
   *               k,
   *               typeof v === 'string' ? v.toUpperCase() : v,
   *             ]),
   *           ),
   *         ]),
   *       ),
   *     ]),
   *   ),
   * );
   *
   * store.setTables({pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}});
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'DOG'}, felix: {species: 'CAT'}}}
   *
   * middleware.destroy();
   * ```
   * @example
   * This example registers a callback that prevents setting any Tables that
   * include a 'banned' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetTablesCallback((tables) =>
   *   'banned' in tables ? undefined : tables,
   * );
   *
   * store.setTables({banned: {r1: {c1: 1}}, pets: {fido: {species: 'dog'}}});
   * console.log(store.getTables());
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetTablesCallback
  /**
   * The addWillSetTableCallback method registers a WillSetTableCallback that
   * will be called before any Table is set in the Store.
   *
   * The callback can transform the Table or return `undefined` to prevent the
   * write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) table from the
   * previous callback.
   * @param callback The WillSetTableCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that upper-cases string Cell values in
   * rows set to the 'pets' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetTableCallback((tableId, table) =>
   *   tableId === 'pets'
   *     ? Object.fromEntries(
   *         Object.entries(table).map(([rowId, row]) => [
   *           rowId,
   *           Object.fromEntries(
   *             Object.entries(row).map(([k, v]) => [
   *               k,
   *               typeof v === 'string' ? v.toUpperCase() : v,
   *             ]),
   *           ),
   *         ]),
   *       )
   *     : table,
   * );
   *
   * store.setTable('pets', {fido: {species: 'dog'}, felix: {species: 'cat'}});
   * console.log(store.getTable('pets'));
   * // -> {fido: {species: 'DOG'}, felix: {species: 'CAT'}}
   *
   * middleware.destroy();
   * ```
   * @example
   * This example registers a callback that prevents writes to the 'species'
   * table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetTableCallback((tableId, table) =>
   *   tableId === 'species' ? undefined : table,
   * );
   *
   * store.setTable('species', {dog: {legs: 4, sound: 'woof'}});
   * console.log(store.getTables());
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetTableCallback
  /**
   * The addWillSetRowCallback method registers a WillSetRowCallback that will
   * be called before any Row is set in the Store.
   *
   * The callback can transform the Row or return `undefined` to prevent the
   * write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) row from the
   * previous callback.
   * @param callback The WillSetRowCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that upper-cases string Cell values in
   * rows set to the 'pets' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetRowCallback((tableId, _rowId, row) =>
   *   tableId === 'pets'
   *     ? Object.fromEntries(
   *         Object.entries(row).map(([k, v]) => [
   *           k,
   *           typeof v === 'string' ? v.toUpperCase() : v,
   *         ]),
   *       )
   *     : row,
   * );
   *
   * store.setRow('pets', 'fido', {species: 'dog', legs: 4});
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'DOG', legs: 4}
   *
   * middleware.destroy();
   * ```
   * @example
   * This example registers a callback that prevents writes to the 'species'
   * table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetRowCallback((tableId, _rowId, row) =>
   *   tableId === 'species' ? undefined : row,
   * );
   *
   * store.setRow('species', 'dog', {legs: 4, sound: 'woof'});
   * console.log(store.getTables());
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetRowCallback
  /**
   * The addWillSetCellCallback method registers a WillSetCellCallback that will
   * be called before any Cell is set in the Store.
   *
   * The callback can transform the Cell value or return `undefined` to prevent
   * the write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) value from the
   * previous callback.
   * @param callback The WillSetCellCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that upper-cases string Cell values in
   * the 'pets' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetCellCallback((tableId, rowId, cellId, cell) =>
   *   tableId === 'pets' && typeof cell === 'string'
   *     ? cell.toUpperCase()
   *     : cell,
   * );
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   * console.log(store.getCell('pets', 'fido', 'species'));
   * // -> 'DOG'
   *
   * middleware.destroy();
   * ```
   * @example
   * This example registers a callback that prevents writes to the 'species'
   * table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetCellCallback((tableId, _rowId, _cellId, cell) =>
   *   tableId === 'species' ? undefined : cell,
   * );
   *
   * store.setCell('species', 'dog', 'legs', 4);
   * console.log(store.getTables());
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetCellCallback
  /**
   * The addWillSetValuesCallback method registers a WillSetValuesCallback that
   * will be called before Values are set in the Store.
   *
   * The callback can transform the Values or return `undefined` to prevent the
   * write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) values from the
   * previous callback.
   * @param callback The WillSetValuesCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that upper-cases all string Values in the
   * pet store's settings.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetValuesCallback((values) =>
   *   Object.fromEntries(
   *     Object.entries(values).map(([k, v]) => [
   *       k,
   *       typeof v === 'string' ? v.toUpperCase() : v,
   *     ]),
   *   ),
   * );
   *
   * store.setValues({storeName: 'happy pets', limit: 50});
   * console.log(store.getValues());
   * // -> {storeName: 'HAPPY PETS', limit: 50}
   *
   * middleware.destroy();
   * ```
   * @example
   * This example registers a callback that prevents setting Values when the pet
   * store is 'closed'.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetValuesCallback((values) =>
   *   'closed' in values ? undefined : values,
   * );
   *
   * store.setValues({closed: true, storeName: 'happy pets'});
   * console.log(store.getValues());
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetValuesCallback
  /**
   * The addWillSetValueCallback method registers a WillSetValueCallback that
   * will be called before any Value is set in the Store.
   *
   * The callback can transform the Value or return `undefined` to prevent the
   * write. Multiple callbacks can be registered and they are called
   * sequentially, each receiving the (possibly transformed) value from the
   * previous callback.
   * @param callback The WillSetValueCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that clamps the 'limit' Value to the
   * maximum capacity of the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetValueCallback((valueId, value) =>
   *   valueId === 'limit' && typeof value === 'number'
   *     ? Math.min(50, Math.max(0, value))
   *     : value,
   * );
   *
   * store.setValue('limit', 100);
   * console.log(store.getValue('limit'));
   * // -> 50
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetValueCallback
  /**
   * The addWillDelTablesCallback method registers a WillDelTablesCallback that
   * will be called before all Tables are deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent it.
   * Multiple callbacks can be registered and they are called sequentially. If
   * any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelTablesCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting all Tables from
   * the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setTables({pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}});
   *
   * middleware.addWillDelTablesCallback(() => false);
   *
   * store.delTables();
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelTablesCallback
  /**
   * The addWillDelTableCallback method registers a WillDelTableCallback that
   * will be called before any Table is deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent it.
   * Multiple callbacks can be registered and they are called sequentially. If
   * any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelTableCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting the 'pets' table
   * from the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setTable('pets', {fido: {species: 'dog'}, felix: {species: 'cat'}});
   *
   * middleware.addWillDelTableCallback((tableId) => tableId !== 'pets');
   *
   * store.delTable('pets');
   * console.log(store.getTable('pets'));
   * // -> {fido: {species: 'dog'}, felix: {species: 'cat'}}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelTableCallback
  /**
   * The addWillDelRowCallback method registers a WillDelRowCallback that will
   * be called before any Row is deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent it.
   * Multiple callbacks can be registered and they are called sequentially. If
   * any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelRowCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting rows from the
   * 'pets' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setRow('pets', 'fido', {species: 'dog', legs: 4});
   *
   * middleware.addWillDelRowCallback((tableId) => tableId !== 'pets');
   *
   * store.delRow('pets', 'fido');
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'dog', legs: 4}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelRowCallback
  /**
   * The addWillDelCellCallback method registers a WillDelCellCallback that will
   * be called before any Cell is deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent it.
   * Multiple callbacks can be registered and they are called sequentially. If
   * any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelCellCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting cells from the
   * 'pets' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   *
   * middleware.addWillDelCellCallback((tableId) => tableId !== 'pets');
   *
   * store.delCell('pets', 'fido', 'species', true);
   * console.log(store.getCell('pets', 'fido', 'species'));
   * // -> 'dog'
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelCellCallback
  /**
   * The addWillDelValuesCallback method registers a WillDelValuesCallback that
   * will be called before all Values are deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent it.
   * Multiple callbacks can be registered and they are called sequentially. If
   * any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelValuesCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting all Values from
   * the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setValues({storeName: 'happy pets', limit: 50});
   *
   * middleware.addWillDelValuesCallback(() => false);
   *
   * store.delValues();
   * console.log(store.getValues());
   * // -> {storeName: 'happy pets', limit: 50}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelValuesCallback
  /**
   * The addWillDelValueCallback method registers a WillDelValueCallback that
   * will be called before any Value is deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent it.
   * Multiple callbacks can be registered and they are called sequentially. If
   * any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelValueCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting the 'storeName'
   * Value from the pet store.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setValue('storeName', 'happy pets');
   *
   * middleware.addWillDelValueCallback((valueId) => valueId !== 'storeName');
   *
   * store.delValue('storeName');
   * console.log(store.getValue('storeName'));
   * // -> 'happy pets'
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelValueCallback
  /**
   * The addWillApplyChangesCallback method registers a WillApplyChangesCallback
   * that will be called before Changes are applied to the Store via the
   * applyChanges method.
   *
   * This callback receives the Changes object and can return it (to allow),
   * return a modified Changes object (to transform), or return `undefined` (to
   * reject). Multiple callbacks can be registered and they are called
   * sequentially, each receiving the output of the previous. If any callback
   * returns `undefined`, all remaining callbacks are skipped and the changes
   * are rejected.
   *
   * This fires when applyChanges is called directly, or indirectly via
   * applyMergeableChanges, setMergeableContent, or merge on a MergeableStore.
   * @param callback The WillApplyChangesCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that rejects changes containing a
   * 'secret' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillApplyChangesCallback(([changedTables, changedValues]) =>
   *   changedTables['secret'] != null
   *     ? undefined
   *     : [changedTables, changedValues, 1],
   * );
   *
   * store.applyChanges([{pets: {fido: {species: 'dog'}}}, {}, 1]);
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'dog'}
   *
   * store.applyChanges([{secret: {r1: {c1: 'v1'}}}, {}, 1]);
   * console.log(store.getTable('secret'));
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillApplyChangesCallback
  /**
   * The addDidSetRowCallback method registers a DidSetRowCallback for a
   * specific table that will be called after any Row in that table is changed
   * during a transaction, after mutator listeners have fired.
   *
   * Unlike `willSetRow`, which fires synchronously during each write, this
   * callback fires once per changed Row after all cell writes in the
   * transaction have landed. Multiple cell changes to the same Row within a
   * transaction produce a single callback with the full before/after Row
   * states.
   *
   * The callback receives `oldRow` (the Row at the start of the transaction)
   * and `newRow` (the Row after all writes). Return `newRow` to accept, a
   * different `Row` to replace, `oldRow` to revert, or an empty object to
   * delete.
   * @param tableId The Id of the Table to watch.
   * @param callback The DidSetRowCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that validates the 'pets' table,
   * reverting any row that ends up without a required 'species' cell.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addDidSetRowCallback(
   *   'pets',
   *   (_tableId, _rowId, oldRow, newRow) =>
   *     'species' in newRow ? newRow : oldRow,
   * );
   *
   * store.setRow('pets', 'fido', {species: 'dog', name: 'Fido'});
   * console.log(store.getRow('pets', 'fido'));
   * // -> {species: 'dog', name: 'Fido'}
   *
   * store.setRow('pets', 'nemo', {name: 'Nemo'});
   * console.log(store.getRow('pets', 'nemo'));
   * // -> {}
   *
   * middleware.destroy();
   * ```
   * @example
   * This example shows that multiple cell changes in one transaction result in
   * a single didSetRow callback with the full before/after row states.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * const seen = [];
   * middleware.addDidSetRowCallback(
   *   'pets',
   *   (_tableId, rowId, oldRow, newRow) => {
   *     seen.push({rowId, oldRow: {...oldRow}, newRow: {...newRow}});
   *     return newRow;
   *   },
   * );
   *
   * store.transaction(() => {
   *   store.setCell('pets', 'fido', 'name', 'Fido');
   *   store.setCell('pets', 'fido', 'species', 'dog');
   * });
   * console.log(seen.length);
   * // -> 1
   * console.log(seen[0].rowId);
   * // -> 'fido'
   * console.log(seen[0].newRow);
   * // -> {name: 'Fido', species: 'dog'}
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addDidSetRowCallback
  /**
   * The destroy method should be called when this Middleware object is no
   * longer used. It removes all hooks and listeners from the Store, and
   * unregisters the Middleware from the Store.
   * @example
   * This example creates a Middleware object against a newly-created Store and
   * then destroys it.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   * middleware.destroy();
   * ```
   * @category Lifecycle
   * @since v8.0.0
   */
  /// Middleware.destroy
}
/**
 * The createMiddleware function creates a Middleware object, and is the main
 * entry point into the middleware module.
 *
 * A given Store can only have one Middleware object associated with it. If you
 * call this function twice on the same Store, your second call will return a
 * reference to the Middleware object created by the first.
 * @param store The Store for which to register the Middleware.
 * @returns A reference to the new Middleware object.
 * @example
 * This example creates a Middleware object.
 *
 * ```js
 * import {createMiddleware, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const middleware = createMiddleware(store);
 * console.log(middleware.getStore() == store);
 * // -> true
 * middleware.destroy();
 * ```
 * @example
 * This example creates a Middleware object, and calls the method a second time
 * for the same Store to return the same object.
 *
 * ```js
 * import {createMiddleware, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const middleware = createMiddleware(store);
 * console.log(middleware === createMiddleware(store));
 * // -> true
 * middleware.destroy();
 * ```
 * @category Creation
 * @since v8.0.0
 */
/// createMiddleware
