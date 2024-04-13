/**
 * The persister-browser module of the TinyBase project lets you save and load
 * Store data to and from browser storage.
 *
 * Two entry points are provided, each of which returns a new Persister object
 * that can load and save a Store:
 *
 * - The createSessionPersister function returns a Persister that uses the
 *   browser's session storage.
 * - The createLocalPersister function returns a Persister that uses the
 *   browser's local storage.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-browser
 */
/// persister-browser
/**
 * The SessionPersister interface is a minor extension to the Persister
 * interface.
 *
 * It simply provides an extra getStorageName method for accessing the unique
 * key of the storage location the Store is being persisted to.
 *
 * You should use the createSessionPersister function to create a
 * SessionPersister object.
 * @category Persister
 * @since v4.3.14
 */
/// SessionPersister
{
  /**
   * The getStorageName method returns the unique key of the storage location
   * the Store is being persisted to.
   * @returns The unique key of the storage location.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the unique key of the storage location back out again.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSessionPersister(store, 'pets');
   *
   * console.log(persister.getStorageName());
   * // -> 'pets'
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// SessionPersister.getStorageName
}
/**
 * The LocalPersister interface is a minor extension to the Persister interface.
 *
 * It simply provides an extra getStorageName method for accessing the unique
 * key of the storage location the Store is being persisted to.
 *
 * You should use the createLocalPersister function to create a LocalPersister
 * object.
 * @category Persister
 * @since v4.3.14
 */
/// LocalPersister
{
  /**
   * The getStorageName method returns the unique key of the storage location
   * the Store is being persisted to.
   * @returns The unique key of the storage location.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the unique key of the storage location back out again.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createLocalPersister(store, 'pets');
   *
   * console.log(persister.getStorageName());
   * // -> 'pets'
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// LocalPersister.getStorageName
}
/**
 * The createSessionPersister function creates a Persister object that can
 * persist the Store to the browser's session storage.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `storageName` parameter which is unique to your application. This is the key
 * that the browser uses to identify the storage location.
 * @param store The Store to persist.
 * @param storageName The unique key to identify the storage location.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new SessionPersister object.
 * @example
 * This example creates a SessionPersister object and persists the Store to the
 * browser's session storage.
 *
 * ```js
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSessionPersister(store, 'pets');
 *
 * await persister.save();
 * console.log(sessionStorage.getItem('pets'));
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * persister.destroy();
 * sessionStorage.clear();
 * ```
 * @category Creation
 */
/// createSessionPersister
/**
 * The createLocalPersister function creates a Persister object that can persist
 * the Store to the browser's local storage.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `storageName` parameter which is unique to your application. This is the key
 * that the browser uses to identify the storage location.
 * @param store The Store to persist.
 * @param storageName The unique key to identify the storage location.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new LocalPersister object.
 * @example
 * This example creates a LocalPersister object and persists the Store to the
 * browser's local storage.
 *
 * ```js
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createLocalPersister(store, 'pets');
 *
 * await persister.save();
 * console.log(localStorage.getItem('pets'));
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * persister.destroy();
 * localStorage.clear();
 * ```
 * @category Creation
 */
/// createLocalPersister
