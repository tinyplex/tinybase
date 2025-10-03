/**
 * The persister-opfs module of the TinyBase project lets you save and load
 * Store data to and from an origin private file system (OPFS) in an appropriate
 * environment such as a modern browser.
 * @see Persistence guides
 * @packageDocumentation
 * @module persister-opfs
 * @since v6.7.0
 */
/// persister-opfs
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
   * import {createOpfsPersister} from 'tinybase/persisters/persister-opfs';
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
 * ```js yolo
 * import {createStore} from 'tinybase';
 * import {createOpfsPersister} from 'tinybase/persisters/persister-file';
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
