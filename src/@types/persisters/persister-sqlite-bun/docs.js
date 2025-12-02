/**
 * The persister-sqlite-bun module of the TinyBase project lets you save and
 * load Store data to and from a local Bun SQLite database (in an appropriate
 * environment).
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-sqlite-bun
 * @since v6.1.0
 */
/// persister-sqlite-bun
/**
 * The SqliteBunPersister interface represents a Persister that lets you save
 * and load Store data to and from a local Bun SQLite database.
 *
 * You should use the createSqliteBunPersister function to create a
 * SqliteBunPersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getDb method for accessing a reference to the database instance the
 * Store is being persisted to.
 * @category Persister
 * @since v6.1.0
 */
/// SqliteBunPersister
{
  /**
   * The getDb method returns a reference to the database instance the Store is
   * being persisted to.
   * @returns A reference to the database instance.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database instance back out again.
   *
   * ```js bun
   * import {Database} from 'bun:sqlite';
   * import {createStore} from 'tinybase';
   * import {createSqliteBunPersister} from 'tinybase/persisters/persister-sqlite-bun';
   *
   * const db = new Database(':memory:');
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSqliteBunPersister(store, db, 'my_tinybase');
   *
   * console.log(persister.getDb() == db);
   * // -> true
   *
   * await persister.destroy();
   * ```
   * @category Getter
   * @since v6.1.0
   */
  /// SqliteBunPersister.getDb
}
/**
 * The createSqliteBunPersister function creates a SqliteBunPersister object
 * that can persist the Store to a local Bun SQLite database.
 *
 * A SqliteBunPersister supports regular Store objects, and can also be used to
 * persist the metadata of a MergeableStore when using the JSON serialization
 * mode, as described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `db` parameter which identifies the database instance.
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
 * Note: When using tabular mode, SQL NULL values are loaded as TinyBase null
 * values, making tables dense (every Row has every Cell). See the Database
 * Persistence guide for details.
 * @param store The Store or MergeableStore to persist.
 * @param db The database instance that was returned from `new Database(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new SqliteBunPersister object.
 * @example
 * This example creates a SqliteBunPersister object and persists the Store to a
 * local SQLite database as a JSON serialization into the `my_tinybase` table.
 * It makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js bun
 * import {Database} from 'bun:sqlite';
 * import {createStore} from 'tinybase';
 * import {createSqliteBunPersister} from 'tinybase/persisters/persister-sqlite-bun';
 *
 * const db = new Database(':memory:');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteBunPersister(store, db, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(db.query('SELECT * FROM my_tinybase;').all());
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * db.query(
 *   'UPDATE my_tinybase SET store = ' +
 *     `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
 * ).run();
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * ```
 * @example
 * This example creates a SqliteBunPersister object and persists the Store to a
 * local SQLite database with tabular mapping.
 *
 * ```js bun
 * import {Database} from 'bun:sqlite';
 * import {createStore} from 'tinybase';
 * import {createSqliteBunPersister} from 'tinybase/persisters/persister-sqlite-bun';
 *
 * const db = new Database(':memory:');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSqliteBunPersister(store, db, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log(db.query('SELECT * FROM pets;').all());
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * db.query(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`).run();
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * ```
 * @category Creation
 * @since v6.1.0
 */
/// createSqliteBunPersister
