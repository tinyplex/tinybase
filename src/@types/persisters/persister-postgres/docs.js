/**
 * The persister-postgres module of the TinyBase project lets you save and load
 * Store data to and from a PostgreSQL database (in an appropriate environment).
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-postgres
 * @since 5.2.0
 */
/// persister-postgres
/**
 * The PostgresPersister interface represents a Persister that lets you save and
 * load Store data to and from a local PostgreSQL database.
 *
 * You should use the createPostgresPersister function to create a
 * PostgresPersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getSql method for accessing a reference to the database connection the
 * Store is being persisted to.
 * @category Persister
 * @since 5.2.0
 */
/// PostgresPersister
{
  /**
   * The getSql method returns a reference to the database connection the Store
   * is being persisted to.
   * @returns A reference to the database connection.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database connection back out again.
   *
   * ```js
   * import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
   * import {createStore} from 'tinybase';
   * import postgres from 'postgres';
   *
   * const sql = postgres('postgres://localhost:5432/tinybase');
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = await createPostgresPersister(store, sql, 'my_tinybase');
   *
   * console.log(persister.getSql() == sql);
   * // -> true
   *
   * persister.destroy();
   * await sql.end();
   * ```
   * @category Getter
   * @since 5.2.0
   */
  /// PostgresPersister.getSql
}
/**
 * The createPostgresPersister function creates a PostgresPersister object that
 * can persist the Store to a local PostgreSQL database.
 *
 * A PostgresPersister supports regular Store objects, and can also be used to
 * persist the metadata of a MergeableStore when using the JSON serialization
 * mode, as described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `sql` parameter which identifies the database connection.
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
 * This method is asynchronous because it will await the creation of dedicated
 * new connections to the database. You will need to `await` a call to this
 * function or handle the return type natively as a Promise.
 * @param store The Store or MergeableStore to persist.
 * @param sql The database connection that was returned from `postgres(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new PostgresPersister object.
 * @example
 * This example creates a PostgresPersister object and persists the Store to a
 * local PostgreSQL database as a JSON serialization into the `my_tinybase`
 * table. It makes a change to the database directly and then reloads it back
 * into the Store.
 *
 * ```js
 * import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
 * import {createStore} from 'tinybase';
 * import postgres from 'postgres';
 *
 * const sql = postgres('postgres://localhost:5432/tinybase');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = await createPostgresPersister(store, sql, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(await sql`SELECT * FROM my_tinybase;`);
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * const json = '[{"pets":{"felix":{"species":"cat"}}},{}]';
 * await sql`UPDATE my_tinybase SET store = ${json} WHERE _id = '_';`;
 *
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * await sql.end();
 * ```
 * @example
 * This example creates a PostgresPersister object and persists the Store to a
 * local PostgreSQL database with tabular mapping.
 *
 * ```js
 * import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';
 * import {createStore} from 'tinybase';
 * import postgres from 'postgres';
 *
 * const sql = postgres('postgres://localhost:5432/tinybase');
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = await createPostgresPersister(store, sql, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log(await sql`SELECT * FROM pets;`);
 * // -> [{_id: 'fido', species: '"dog"'}]
 * // Note that Cells and Values are JSON-encoded in PostgreSQL databases.
 *
 * await sql`INSERT INTO pets (_id, species) VALUES ('felix', '"cat"')`;
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * await sql`DROP TABLE IF EXISTS pets`;
 * await sql.end();
 * ```
 * @category Creation
 * @since 5.2.0
 */
/// createPostgresPersister
