/**
 * The persister-cr-sqlite-wasm module of the TinyBase project lets you save and
 * load Store data to and from a local CR-SQLite database (in an appropriate
 * environment).
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-cr-sqlite-wasm
 */
/// persister-cr-sqlite-wasm
/**
 * The createCrSqliteWasmPersister function creates a Persister object that can
 * persist the Store to a local CR-SQLite database (in an appropriate
 * environment).
 *
 * As well as providing a reference to the Store to persist, you must provide
 * a `db` parameter which identifies the database instance.
 * @param store The Store to persist.
 * @param db The database instance that was returned from `crSqlite3.open(...)`.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a local
 * CR-SQLite database.
 *
 * ```js yolo
 * const crSqlite3 = await initWasm();
 * const db = crSqlite3.open();
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createCrSqliteWasmPersister(store, db);
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
/// createCrSqliteWasmPersister
