/**
 * The persister-libsql module of the TinyBase project lets you save and load
 * Store data to and from a local LibSQL database (in an appropriate
 * environment).
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-libsql
 * @since v4.7.0
 */
/// persister-libsql
/**
 * The LibSqlPersister interface represents a Persister that lets you save and
 * load Store data to and from a local LibSQL database.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getClient method for accessing a reference to the database client the
 * Store is being persisted to.
 *
 * You should use the createLibSqlPersister function to create a LibSqlPersister
 * object.
 * @since v4.7.0
 */
/// LibSqlPersister
{
  /**
   * The getClient method returns a reference to the database client the Store
   * is being persisted to.
   * @returns A reference to the database client.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database client back out again.
   *
   * ```js yolo
   * import {createClient} from '@libsql/client';
   * import {createLibSqlPersister} from 'tinybase/persisters/persister-libsql';
   * import {createStore} from 'tinybase';
   *
   * const client = createClient({url: 'file:my.db'});
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createLibSqlPersister(store, client, 'my_tinybase');
   *
   * console.log(persister.getClient() == client);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.7.0
   */
  /// LibSqlPersister.getClient
}
/**
 * The createLibSqlPersister function creates a LibSqlPersister object that can
 * persist a Store to a local LibSQL database.
 *
 * A LibSqlPersister only supports regular Store objects, and cannot be used to
 * persist the metadata of a MergeableStore.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `client` parameter which identifies the database client.
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
 * @param store The Store to persist.
 * @param client The database client that was returned from `createClient(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new LibSqlPersister object.
 * @example
 * This example creates a LibSqlPersister object and persists the Store to a
 * local SQLite database as a JSON serialization into the `my_tinybase` table.
 * It makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js yolo
 * import {createClient} from '@libsql/client';
 * import {createLibSqlPersister} from 'tinybase/persisters/persister-libsql';
 * import {createStore} from 'tinybase';
 *
 * const client = createClient({url: 'file:my.db'});
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createLibSqlPersister(store, client, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log((await client.execute('SELECT * FROM my_tinybase;')).rows);
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await client.execute(
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
 * This example creates a LibSqlPersister object and persists the Store to a
 * local SQLite database with tabular mapping.
 *
 * ```js yolo
 * import {createClient} from '@libsql/client';
 * import {createLibSqlPersister} from 'tinybase/persisters/persister-libsql';
 * import {createStore} from 'tinybase';
 *
 * const client = createClient({url: 'file:my.db'});
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createLibSqlPersister(store, client, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log((await client.execute('SELECT * FROM pets;')).rows);
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * await client.execute(
 *   `INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v4.7.0
 */
/// createLibSqlPersister
