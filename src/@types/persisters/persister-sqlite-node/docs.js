/**
 * The persister-sqlite-node module of the TinyBase project lets you save and
 * load Store data to and from a local SQLite database, via the synchronous
 * [`node:sqlite`](https://nodejs.org/api/sqlite.html) module built into
 * Node.js.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-sqlite-node
 * @since 9.7.0
 */
/// persister-sqlite-node
/**
 * The SqliteNodePersister interface represents a Persister that lets you save
 * and load Store data to and from a local SQLite database.
 *
 * You should use the createSqliteNodePersister function to create a
 * SqliteNodePersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getDb method for accessing a reference to the database the Store is
 * being persisted to.
 * @category Persister
 * @since 9.7.0
 */
/// SqliteNodePersister
{
  /**
   * The getDb method returns a reference to the database the Store is being
   * persisted to.
   * @returns A reference to the database.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database back out again.
   *
   * ```js
   * import {DatabaseSync} from 'node:sqlite';
   * import {createStore} from 'tinybase';
   * import {createSqliteNodePersister} from 'tinybase/persisters/persister-sqlite-node';
   *
   * const db = new DatabaseSync(':memory:');
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSqliteNodePersister(store, db, 'my_tinybase');
   *
   * console.log(persister.getDb() == db);
   * // -> true
   *
   * await persister.destroy();
   * db.close();
   * ```
   * @category Getter
   * @since 9.7.0
   */
  /// SqliteNodePersister.getDb
}
/**
 * The createSqliteNodePersister function creates a SqliteNodePersister object
 * that can persist a Store to a local SQLite database.
 *
 * A SqliteNodePersister supports regular Store objects, and can also be used to
 * persist the metadata of a MergeableStore when using the JSON serialization
 * mode, as described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `db` parameter which is the database returned from `new DatabaseSync(...)`.
 *
 * Since the `node:sqlite` module is built into Node.js, this is the only
 * SQLite-based Persister that requires no additional dependency at all. Note
 * that the module is only available in newer versions of Node.js, and that it
 * is still marked as experimental, so its API may change.
 *
 * A database Persister uses one of two modes: either a JSON serialization of
 * the whole Store stored in a single row of a table (the default), or a tabular
 * mapping of Table Ids to database table names and vice-versa).
 *
 * The third argument is a DatabasePersisterConfig object that configures which
 * of those modes to use, and settings for each. If the third argument is simply
 * a string, it is used as the `storeTableName` property of the JSON
 * serialization.
 *
 * See the documentation for the DpcJson and DpcTabular types for more
 * information on how both of those modes can be configured.
 *
 * Note that `node:sqlite` does not signal when the database changes, so if you
 * enable automatic loading with the startAutoLoad method, it polls the database
 * for changes. The Sqlite3Persister, which uses the asynchronous `sqlite3`
 * module, is notified of changes as they happen, and may suit you better if
 * that matters.
 * @param store The Store or MergeableStore to persist.
 * @param db The database that was returned from `new DatabaseSync(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new SqliteNodePersister object.
 * @example
 * This example creates a SqliteNodePersister object and persists the Store to a
 * local SQLite database as a JSON serialization into the `my_tinybase` table.
 * It makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js
 * import {DatabaseSync} from 'node:sqlite';
 * import {createStore} from 'tinybase';
 * import {createSqliteNodePersister} from 'tinybase/persisters/persister-sqlite-node';
 *
 * const db = new DatabaseSync(':memory:');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteNodePersister(store, db, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(db.prepare('SELECT * FROM my_tinybase;').all());
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * db.prepare('UPDATE my_tinybase SET store = ? WHERE _id = ?;').run(
 *   '[{"pets":{"felix":{"species":"cat"}}},{}]',
 *   '_',
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * db.close();
 * ```
 * @example
 * This example creates a SqliteNodePersister object and persists the Store to a
 * local SQLite database with tabular mapping.
 *
 * ```js
 * import {DatabaseSync} from 'node:sqlite';
 * import {createStore} from 'tinybase';
 * import {createSqliteNodePersister} from 'tinybase/persisters/persister-sqlite-node';
 *
 * const db = new DatabaseSync(':memory:');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteNodePersister(store, db, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log(db.prepare('SELECT * FROM pets;').all());
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * db.prepare(
 *   `INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`,
 * ).run();
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * db.close();
 * ```
 * @category Creation
 * @since 9.7.0
 */
/// createSqliteNodePersister
