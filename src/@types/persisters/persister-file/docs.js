/**
 * The persister-file module of the TinyBase project lets you save and load
 * Store data to and from a local file system (in an appropriate environment).
 * @see Persistence guides
 * @packageDocumentation
 * @module persister-file
 * @since v1.0.0
 */
/// persister-file
/**
 * The FilePersister interface represents a Persister that lets you save and
 * load Store data to and from a local file system.
 *
 * You should use the createFilePersister function to create a FilePersister
 * object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getFilePath method for accessing the location of the local file the
 * Store is being persisted to.
 * @category Persister
 * @since v4.3.14
 */
/// FilePersister
{
  /**
   * The getFilePath method returns the location of the local file the Store is
   * being persisted to.
   * @returns The location of the local file.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the file location back out again.
   *
   * ```js
   * import {createFilePersister} from 'tinybase/persisters/persister-file';
   * import {createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createFilePersister(store, '/app/persisted.json');
   *
   * console.log(persister.getFilePath());
   * // -> '/app/persisted.json'
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// FilePersister.getFilePath
}
/**
 * The createFilePersister function creates a FilePersister object that can
 * persist the Store to a local file.
 *
 * A FilePersister supports both regular Store and MergeableStore objects.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `filePath` parameter which identifies the file to persist it to.
 * @param store The Store or MergeableStore to persist.
 * @param filePath The location of the local file to persist the Store to.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new FilePersister object.
 * @example
 * This example creates a FilePersister object and persists the Store to a local
 * file.
 *
 * ```js yolo
 * import {createFilePersister} from 'tinybase/persisters/persister-file';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createFilePersister(store, '/app/persisted.json');
 *
 * await persister.save();
 * // Store JSON will be saved to the file.
 *
 * await persister.load();
 * // Store JSON will be loaded from the file.
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v1.0.0
 */
/// createFilePersister
