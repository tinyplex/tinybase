/**
 * The persister-browser module of the TinyBase project lets you save and load
 * Store data to and from browser storage, including the origin private file
 * system (OPFS).
 *
 * Three entry points are provided, each of which returns a new Persister object
 * that can load and save a Store:
 *
 * - The createSessionPersister function returns a Persister that uses the
 *   browser's session storage.
 * - The createLocalPersister function returns a Persister that uses the
 *   browser's local storage.
 * - The createOpfsPersister function returns a Persister that uses a file in
 *   an origin private file system (OPFS).
 * @see Persistence guides
 * @packageDocumentation
 * @module persister-browser
 * @since v1.0.0
 */
/// persister-browser
/**
 * The SessionPersister interface represents a Persister that lets you save and
 * load Store data to and from the browser's session storage.
 *
 * You should use the createSessionPersister function to create a
 * SessionPersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getStorageName method for accessing the unique key of the storage
 * location the Store is being persisted to.
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
   * import {createStore} from 'tinybase';
   * import {createSessionPersister} from 'tinybase/persisters/persister-browser';
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSessionPersister(store, 'pets');
   *
   * console.log(persister.getStorageName());
   * // -> 'pets'
   *
   * await persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// SessionPersister.getStorageName
}
/**
 * The LocalPersister interface represents a Persister that lets you save and
 * load Store data to and from the browser's local storage.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getStorageName method for accessing the unique key of the storage
 * location the Store is being persisted to.
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
   * import {createStore} from 'tinybase';
   * import {createLocalPersister} from 'tinybase/persisters/persister-browser';
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createLocalPersister(store, 'pets');
   *
   * console.log(persister.getStorageName());
   * // -> 'pets'
   *
   * await persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// LocalPersister.getStorageName
}
/**
 * The OpfsPersister interface represents a Persister that lets you save and
 * load Store data to and from a file in an origin private file system (OPFS).
 *
 * You should use the createOpfsPersister function to create an OpfsPersister
 * object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getHandle method for accessing the file the Store is being
 * persisted to.
 * @category Persister
 * @since v6.7.0
 */
/// OpfsPersister
{
  /**
   * The getHandle method returns the handle of the file the Store is being
   * persisted to.
   * @returns The handle of the file.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the file handle back out again.
   *
   * ```js
   * import {createStore} from 'tinybase';
   * import {createOpfsPersister} from 'tinybase/persisters/persister-browser';
   *
   * const opfs = await navigator.storage.getDirectory();
   * const handle = await opfs.getFileHandle('tinybase.json', {create: true});
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createOpfsPersister(store, handle);
   *
   * console.log(persister.getHandle().name);
   * // -> 'tinybase.json'
   *
   * await persister.destroy();
   * ```
   * @category Getter
   * @since v6.7.0
   */
  /// OpfsPersister.getHandle
}
/**
 * The createSessionPersister function creates a SessionPersister object that
 * can persist the Store to the browser's session storage.
 *
 * A SessionPersister supports both regular Store and MergeableStore objects.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `storageName` parameter which is unique to your application. This is the key
 * that the browser uses to identify the storage location.
 * @param store The Store or MergeableStore to persist.
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
 * import {createStore} from 'tinybase';
 * import {createSessionPersister} from 'tinybase/persisters/persister-browser';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSessionPersister(store, 'pets');
 *
 * await persister.save();
 * console.log(sessionStorage.getItem('pets'));
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * await persister.destroy();
 * sessionStorage.clear();
 * ```
 * @category Creation
 * @essential Persisting stores
 * @since v1.0.0
 */
/// createSessionPersister
/**
 * The createLocalPersister function creates a LocalPersister object that can
 * persist the Store to the browser's local storage.
 *
 * A LocalPersister supports both regular Store and MergeableStore objects.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `storageName` parameter which is unique to your application. This is the key
 * that the browser uses to identify the storage location.
 * @param store The Store or MergeableStore to persist.
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
 * import {createStore} from 'tinybase';
 * import {createLocalPersister} from 'tinybase/persisters/persister-browser';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createLocalPersister(store, 'pets');
 *
 * await persister.save();
 * console.log(localStorage.getItem('pets'));
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * await persister.destroy();
 * localStorage.clear();
 * ```
 * @category Creation
 * @essential Persisting stores
 * @since v1.0.0
 */
/// createLocalPersister
/**
 * The createOpfsPersister function creates an OpfsPersister object that can
 * persist the Store to a file in an origin private file system (OPFS).
 *
 * An OpfsPersister supports both regular Store and MergeableStore objects.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `handle` parameter which identifies an existing OPFS file to persist it to.
 * @param store The Store or MergeableStore to persist.
 * @param handle The handle of an existing OPFS file to persist the Store to.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new OpfsPersister object.
 * @example
 * This example creates an OpfsPersister object and persists the Store to a
 * local file.
 *
 * ```js
 * import {createStore} from 'tinybase';
 * import {createOpfsPersister} from 'tinybase/persisters/persister-browser';
 *
 * const opfs = await navigator.storage.getDirectory();
 * const handle = await opfs.getFileHandle('tinybase.json', {create: true});
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createOpfsPersister(store, handle);
 *
 * await persister.save();
 * // Store JSON will be saved to the file.
 *
 * await persister.load();
 * // Store JSON will be loaded from the file.
 *
 * await persister.destroy();
 * ```
 * @category Creation
 * @since v6.7.0
 */
/// createOpfsPersister
