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
