/**
 * The persister-sqlite3 module of the TinyBase project lets you save and load
 * Store data to and from a local SQLite database (in an appropriate
 * environment).
 *
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-sqlite3
 */
/// persister-sqlite3
/**
 * The createSqlite3Persister function creates a Persister object that can
 * persist the Store to a local SQLite database (in an appropriate environment).
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `db` parameter which identifies the database instance.
 *
 * @param store The Store to persist.
 * @param db The database instance that was returned from `new
 * sqlite3.Database(...)`.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a local
 * SQLite database.
 *
 * ```js yolo
 * const db = new sqlite3.Database('/db.sqlite3');
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqlite3Persister(store, db);
 *
 * await persister.save();
 * // Store JSON will be saved to the database.
 *
 * await persister.load();
 * // Store JSON will be loaded from the database.
 *
 * persister.destroy();
 * ```
 * @category Creation
 */
/// createSqlite3Persister
