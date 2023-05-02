/**
 * The persister-yjs module of the TinyBase project provides a way to save and
 * load Store data, to and from a Yjs document.
 *
 * A single entry point, the createYjsPersister function, is provided, which
 * returns a new Persister object that can load and save a Store.:
 *
 * @packageDocumentation
 * @module persister-yjs
 */
/// persister-yjs
/**
 * The createYjsPersister function creates a Persister object that can persist
 * the Store to a Yjs document.
 *
 * As well as providing a reference to the Store to persist, you must provide
 * the Yjs document to persist it to.
 *
 * @param store The Store to persist.
 * @param yDoc The Yjs document to persist the Store to.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a Yjs
 * document.
 *
 * ```js yolo
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createYjsPersister(store, yDoc);
 *
 * await persister.save();
 * // Store JSON will be saved to the document.
 *
 * await persister.load();
 * // Store JSON will be loaded from the document.
 *
 * persister.destroy();
 * ```
 * @category Creation
 */
/// createYjsPersister
