/**
 * The persister-sqlite-wasm module of the TinyBase project lets you save and
 * load Store data to and from a local SQLite database (in an appropriate
 * environment).
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
 * A database Persister uses one of two modes: either a JSON serialization of
 * the whole Store stored in a single row of a table (the default), or a tabular
 * mapping of Table Ids to database table names and vice-versa).
 *
 * The fourth argument is a DatabasePersisterConfig object that configures which
 * of those modes to use, and settings for each. If the fourth argument is
 * simply a string, it is used as the `storeTableName` property of the JSON
 * serialization.
 *
 * See the documentation for the DpcJson and DpcTabular types for more
 * information on how both of those modes can be configured.
 * @param store The Store to persist.
 * @param sqlite3 The WASM module that was returned from `sqlite3InitModule`.
 * @param db The database instance that was returned from `new
 * sqlite3.oo1.DB(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a local
 * SQLite database as a JSON serialization into the `my_tinybase` table. It
 * makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js
 * const sqlite3 = await sqlite3InitModule();
 * const db = new sqlite3.oo1.DB(':memory:', 'c');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteWasmPersister(
 *   store,
 *   sqlite3,
 *   db,
 *   'my_tinybase',
 * );
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(db.exec('SELECT * FROM my_tinybase;', {rowMode: 'object'}));
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * db.exec(
 *   'UPDATE my_tinybase SET store = ' +
 *     `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @example
 * This example creates a Persister object and persists the Store to a local
 * SQLite database with tabular mapping.
 *
 * ```js
 * const sqlite3 = await sqlite3InitModule();
 * const db = new sqlite3.oo1.DB(':memory:', 'c');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteWasmPersister(store, sqlite3, db, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log(db.exec('SELECT * FROM pets;', {rowMode: 'object'}));
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * db.exec(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`);
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @category Creation
 */
/// createSqliteWasmPersister
