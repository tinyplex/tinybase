/**
 * The persister-pg module of the TinyBase project lets you save and load Store
 * data to and from a PostgreSQL database, via the `pg` module (in an
 * appropriate environment).
 *
 * Since the `pg` module is the de facto standard PostgreSQL driver for Node.js,
 * this module also works with the many hosted PostgreSQL services that provide
 * a `pg`-compatible driver, such as Neon.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-pg
 * @since 9.6.0
 */
/// persister-pg
/**
 * The PgPersister interface represents a Persister that lets you save and load
 * Store data to and from a PostgreSQL database, via the `pg` module.
 *
 * You should use the createPgPersister function to create a PgPersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getPg method for accessing a reference to the database connection the
 * Store is being persisted to.
 * @category Persister
 * @since 9.6.0
 */
/// PgPersister
{
  /**
   * The getPg method returns a reference to the database connection the Store
   * is being persisted to.
   * @returns A reference to the `pg` Pool or Client.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database connection back out again.
   *
   * ```js
   * import {Pool} from 'pg';
   * import {createStore} from 'tinybase';
   * import {createPgPersister} from 'tinybase/persisters/persister-pg';
   *
   * const pool = new Pool({
   *   connectionString: 'postgres://localhost:5432/tinybase',
   * });
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = await createPgPersister(store, pool, 'my_tinybase');
   *
   * console.log(persister.getPg() == pool);
   * // -> true
   *
   * await persister.destroy();
   * await pool.end();
   * ```
   * @category Getter
   * @since 9.6.0
   */
  /// PgPersister.getPg
}
/**
 * The createPgPersister function creates a PgPersister object that can persist
 * the Store to a PostgreSQL database via the `pg` module.
 *
 * A PgPersister supports regular Store objects, and can also be used to persist
 * the metadata of a MergeableStore when using the JSON serialization mode, as
 * described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `pg` parameter which is either a Pool or a Client. If you provide a Pool, one
 * connection is checked out for the lifetime of the Persister (and a second
 * while automatic loading is enabled), since the Persister needs to issue
 * transactions on a stable connection. Make sure your pool is large enough to
 * accommodate that.
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
 *
 * This method is asynchronous because it will await the creation of a dedicated
 * new connection to the database. You will need to `await` a call to this
 * function or handle the return type natively as a Promise.
 * @param store The Store or MergeableStore to persist.
 * @param pg The `pg` Pool or Client that identifies the database connection.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new PgPersister object.
 * @example
 * This example creates a PgPersister object and persists the Store to a local
 * PostgreSQL database as a JSON serialization into the `my_tinybase` table. It
 * makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js
 * import {Pool} from 'pg';
 * import {createStore} from 'tinybase';
 * import {createPgPersister} from 'tinybase/persisters/persister-pg';
 *
 * const pool = new Pool({
 *   connectionString: 'postgres://localhost:5432/tinybase',
 * });
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = await createPgPersister(store, pool, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log((await pool.query('SELECT * FROM my_tinybase;')).rows);
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * const json = '[{"pets":{"felix":{"species":"cat"}}},{}]';
 * await pool.query('UPDATE my_tinybase SET store = $1 WHERE _id = $2;', [
 *   json,
 *   '_',
 * ]);
 *
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * await pool.end();
 * ```
 * @example
 * This example creates a PgPersister object and persists the Store to a local
 * PostgreSQL database with tabular mapping.
 *
 * ```js
 * import {Pool} from 'pg';
 * import {createStore} from 'tinybase';
 * import {createPgPersister} from 'tinybase/persisters/persister-pg';
 *
 * const pool = new Pool({
 *   connectionString: 'postgres://localhost:5432/tinybase',
 * });
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = await createPgPersister(store, pool, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log((await pool.query('SELECT * FROM pets;')).rows);
 * // -> [{_id: 'fido', species: '"dog"'}]
 * // Note that Cells and Values are JSON-encoded in PostgreSQL databases.
 *
 * await pool.query(
 *   `INSERT INTO pets (_id, species) VALUES ('felix', '"cat"')`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * await pool.query('DROP TABLE IF EXISTS pets');
 * await pool.end();
 * ```
 * @category Creation
 * @since 9.6.0
 */
/// createPgPersister
