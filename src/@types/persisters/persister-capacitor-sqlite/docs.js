/**
 * The persister-capacitor-sqlite module of the TinyBase project lets you save
 * and load Store data to and from a SQLite database in a Capacitor app, via the
 * `@capacitor-community/sqlite` plugin.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-capacitor-sqlite
 * @since 9.6.0
 */
/// persister-capacitor-sqlite
/**
 * The CapacitorSqlitePersister interface represents a Persister that lets you
 * save and load Store data to and from a SQLite database in a Capacitor app.
 *
 * You should use the createCapacitorSqlitePersister function to create a
 * CapacitorSqlitePersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getDb method for accessing a reference to the database connection the
 * Store is being persisted to.
 * @category Persister
 * @since 9.6.0
 */
/// CapacitorSqlitePersister
{
  /**
   * The getDb method returns a reference to the database connection the Store
   * is being persisted to.
   * @returns A reference to the database connection.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database connection back out again.
   *
   * ```js ignore
   * import {
   *   CapacitorSQLite,
   *   SQLiteConnection,
   * } from '@capacitor-community/sqlite';
   * import {createStore} from 'tinybase';
   * import {createCapacitorSqlitePersister} from 'tinybase/persisters/persister-capacitor-sqlite';
   *
   * const sqlite = new SQLiteConnection(CapacitorSQLite);
   * const db = await sqlite.createConnection(
   *   'my.db',
   *   false,
   *   'no-encryption',
   *   1,
   *   false,
   * );
   * await db.open();
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createCapacitorSqlitePersister(store, db, 'my_tinybase');
   *
   * console.log(persister.getDb() == db);
   * // -> true
   *
   * await persister.destroy();
   * ```
   * @category Getter
   * @since 9.6.0
   */
  /// CapacitorSqlitePersister.getDb
}
/**
 * The createCapacitorSqlitePersister function creates a
 * CapacitorSqlitePersister object that can persist a Store to a SQLite database
 * in a Capacitor app.
 *
 * A CapacitorSqlitePersister supports regular Store objects, and can also be
 * used to persist the metadata of a MergeableStore when using the JSON
 * serialization mode, as described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `db` parameter which is an open SQLiteDBConnection, as returned from the
 * plugin's `createConnection` method.
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
 * The plugin does not signal when the database changes underneath the
 * Persister, so if you enable automatic loading with the startAutoLoad method,
 * it polls the database for changes in the same way that the LibSqlPersister
 * does.
 *
 * Note: TinyBase's tests for this module run against a mocked plugin rather
 * than a real device, since `@capacitor-community/sqlite` needs a native iOS or
 * Android runtime (or its `jeep-sqlite` web component) that a Node test suite
 * cannot provide. The SQL behavior itself is covered by the other SQLite
 * Persisters, which share all of it, but the binding to the plugin is only
 * verified against those mocks. Please report anything that behaves differently
 * on a real device.
 * @param store The Store or MergeableStore to persist.
 * @param db The database connection that was returned from
 * `createConnection(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new CapacitorSqlitePersister object.
 * @example
 * This example creates a CapacitorSqlitePersister object and persists the Store
 * to a SQLite database as a JSON serialization into the `my_tinybase` table. It
 * makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js ignore
 * import {
 *   CapacitorSQLite,
 *   SQLiteConnection,
 * } from '@capacitor-community/sqlite';
 * import {createStore} from 'tinybase';
 * import {createCapacitorSqlitePersister} from 'tinybase/persisters/persister-capacitor-sqlite';
 *
 * const sqlite = new SQLiteConnection(CapacitorSQLite);
 * const db = await sqlite.createConnection(
 *   'my.db',
 *   false,
 *   'no-encryption',
 *   1,
 *   false,
 * );
 * await db.open();
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createCapacitorSqlitePersister(store, db, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log((await db.query('SELECT * FROM my_tinybase;')).values);
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await db.run(
 *   'UPDATE my_tinybase SET store = ? WHERE _id = ?;',
 *   ['[{"pets":{"felix":{"species":"cat"}}},{}]', '_'],
 *   false,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * ```
 * @category Creation
 * @since 9.6.0
 */
/// createCapacitorSqlitePersister
