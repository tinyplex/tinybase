/**
 * The persister-sqlite-wasm module of the TinyBase project lets you save and
 * load Store data to and from a local SQLite database (in an appropriate
 * environment).
 *
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-sqlite-wasm
 */
/// persister-sqlite-wasm
/**
 * The createSqliteWasmPersister function creates a Persister object that can
 * persist the Store to a local SQLite database (in an appropriate environment).
 *
 * As well as providing a reference to the Store to persist, you must provide
 * `sqlite3` and `db` parameters which identify the WASM module and database
 * instance respectively.
 *
 * @param store The Store to persist.
 * @param sqlite3 The WASM module that was returned from `sqlite3InitModule`.
 * @param sqlite3 The database instance that was returned from `new
 * sqlite3.oo1.DB(...)`.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a local
 * SQLite database.
 *
 * ```js yolo
 * const sqlite3 = await sqlite3InitModule();
 * const db = new sqlite3.oo1.DB('/db.sqlite3', 'c');
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteWasmPersister(store, sqlite3, db);
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
/// createSqliteWasmPersister
