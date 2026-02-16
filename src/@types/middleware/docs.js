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
 * The WillSetRowCallback type describes a function that is called before a
 * Row is set in the Store.
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
 * @returns The Row to use (possibly transformed), or `undefined` to prevent
 * the write.
 * @category Callback
 * @since v8.0.0
 */
/// WillSetRowCallback
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
   * The addWillSetCellCallback method registers a WillSetCellCallback that
   * will be called before any Cell is set in the Store.
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
   * middleware.addWillSetCellCallback(
   *   (tableId, rowId, cellId, cell) =>
   *     tableId === 'pets' && typeof cell === 'string'
   *       ? cell.toUpperCase()
   *       : cell,
   * );
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   * console.log(store.getCell('pets', 'fido', 'species'));
   * // -> 'DOG'
   *
   * middleware.destroy();
   * ```
   * @example
   * This example registers a callback that prevents writes to a 'locked'
   * table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetCellCallback(
   *   (tableId, _rowId, _cellId, cell) =>
   *     tableId === 'locked' ? undefined : cell,
   * );
   *
   * store.setCell('locked', 'r1', 'c1', 'value');
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
   * The addWillSetRowCallback method registers a WillSetRowCallback that
   * will be called before any Row is set in the Store.
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
   * This example registers a callback that prevents writes to a 'locked'
   * table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetRowCallback((tableId, _rowId, row) =>
   *   tableId === 'locked' ? undefined : row,
   * );
   *
   * store.setRow('locked', 'r1', {c1: 'value'});
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
   * This example registers a callback that clamps a numeric Value.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * middleware.addWillSetValueCallback((valueId, value) =>
   *   valueId === 'score' && typeof value === 'number'
   *     ? Math.min(100, Math.max(0, value))
   *     : value,
   * );
   *
   * store.setValue('score', 150);
   * console.log(store.getValue('score'));
   * // -> 100
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillSetValueCallback
  /**
   * The addWillDelCellCallback method registers a WillDelCellCallback that
   * will be called before any Cell is deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent
   * it. Multiple callbacks can be registered and they are called sequentially.
   * If any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelCellCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting cells from the
   * 'protected' table.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setCell('protected', 'r1', 'name', 'Alice');
   *
   * middleware.addWillDelCellCallback(
   *   (tableId) => tableId !== 'protected',
   * );
   *
   * store.delCell('protected', 'r1', 'name', true);
   * console.log(store.getCell('protected', 'r1', 'name'));
   * // -> 'Alice'
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelCellCallback
  /**
   * The addWillDelValueCallback method registers a WillDelValueCallback that
   * will be called before any Value is deleted from the Store.
   *
   * The callback returns `true` to allow the deletion or `false` to prevent
   * it. Multiple callbacks can be registered and they are called sequentially.
   * If any callback returns `false`, the deletion is prevented.
   * @param callback The WillDelValueCallback to register.
   * @returns A reference to the Middleware object, for chaining.
   * @example
   * This example registers a callback that prevents deleting a specific
   * Value.
   *
   * ```js
   * import {createMiddleware, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const middleware = createMiddleware(store);
   *
   * store.setValue('theme', 'dark');
   *
   * middleware.addWillDelValueCallback(
   *   (valueId) => valueId !== 'theme',
   * );
   *
   * store.delValue('theme');
   * console.log(store.getValue('theme'));
   * // -> 'dark'
   *
   * middleware.destroy();
   * ```
   * @category Configuration
   * @since v8.0.0
   */
  /// Middleware.addWillDelValueCallback
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
