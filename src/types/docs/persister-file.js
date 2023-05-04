/**
 * The persister-file module of the TinyBase project lets you save and load
 * Store data to and from a local file system (in an appropriate environment).
 *
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-file
 */
/// persister-file
/**
 * The createFilePersister function creates a Persister object that can persist
 * the Store to a local file (in an appropriate environment).
 *
 * As well as providing a reference to the Store to persist, you must provide
 * `filePath` parameter which identifies the file to persist it to.
 *
 * @param store The Store to persist.
 * @param filePath The location of the local file to persist the Store to.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a local
 * file.
 *
 * ```js yolo
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
 */
/// createFilePersister
