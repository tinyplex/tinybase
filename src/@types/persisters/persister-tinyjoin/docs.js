/**
 * The persister-tinyjoin module of the TinyBase project lets you save and load
 * Store data to and from a TinyJoin database in a browser.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-tinyjoin
 * @since 10.0.0
 */
/// persister-tinyjoin
/**
 * The TinyJoinPersister interface represents a Persister that lets you save and
 * load Store data to and from a [TinyJoin](https://tinyjoin.org) database.
 *
 * You should use the createTinyJoinPersister function to create a
 * TinyJoinPersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getTinyJoin method for accessing a reference to the TinyJoin client the
 * Store is being persisted to.
 * @category Persister
 * @since 10.0.0
 */
/// TinyJoinPersister
{
  /**
   * The getTinyJoin method returns a reference to the TinyJoin client the Store
   * is being persisted to.
   * @returns A reference to the TinyJoin client.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the TinyJoin client back out again.
   *
   * ```js ignore
   * import {createStore} from 'tinybase';
   * import {createTinyJoinPersister} from 'tinybase/persisters/persister-tinyjoin';
   * import {create} from 'tinyjoin';
   *
   * const tinyJoin = await create();
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createTinyJoinPersister(store, tinyJoin, 'my_tinybase');
   *
   * console.log(persister.getTinyJoin() == tinyJoin);
   * // -> true
   *
   * await persister.destroy();
   * await tinyJoin.close();
   * ```
   * @category Getter
   * @since 10.0.0
   */
  /// TinyJoinPersister.getTinyJoin
}
/**
 * The createTinyJoinPersister function creates a TinyJoinPersister object that
 * can persist the Store to a [TinyJoin](https://tinyjoin.org) database in a
 * browser.
 *
 * TinyJoin is a tiny, worker-first relational database that runs entirely in
 * the browser, either in memory or - with an `opfs://` data directory - saved
 * across reloads. This Persister therefore gives you a SQL-shaped local
 * database to keep a Store in, without a server or a native dependency. Its
 * `tinyjoin/node` entry point opens an ephemeral in-memory database in a Node
 * worker thread, which makes this Persister testable outside a browser.
 *
 * A TinyJoinPersister supports regular Store objects, and can also be used to
 * persist the metadata of a MergeableStore when using the JSON serialization
 * mode, as described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `tinyJoin` parameter which identifies the TinyJoin client that was returned
 * from its own `create` function.
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
 * TinyJoin implements a deliberately bounded SQL dialect, and two of its
 * boundaries are worth knowing about. It has no `ALTER TABLE ... DROP COLUMN`,
 * so the table used for the JSON serialization should not have columns beyond
 * the two it manages, and tabular mode should be left with its default of not
 * deleting empty columns. It also has no SQL transaction
 * statements, and rejects schema changes inside its own callback transactions,
 * so each of the Persister's commands is atomic on its own rather than a save
 * being atomic as a whole.
 * @param store The Store or MergeableStore to persist.
 * @param tinyJoin The TinyJoin client that was returned from `create(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new TinyJoinPersister object.
 * @example
 * This example creates a TinyJoinPersister object and persists the Store to a
 * TinyJoin database as a JSON serialization into the `my_tinybase` table. It
 * makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js ignore
 * import {createStore} from 'tinybase';
 * import {createTinyJoinPersister} from 'tinybase/persisters/persister-tinyjoin';
 * import {create} from 'tinyjoin';
 *
 * const tinyJoin = await create();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createTinyJoinPersister(store, tinyJoin, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log((await tinyJoin.query('SELECT * FROM my_tinybase')).rows);
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await tinyJoin.query('UPDATE my_tinybase SET store = $1 WHERE _id = $2', [
 *   '[{"pets":{"felix":{"species":"cat"}}},{}]',
 *   '_',
 * ]);
 *
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * await tinyJoin.close();
 * ```
 * @example
 * This example creates a TinyJoinPersister object and persists the Store to a
 * TinyJoin database with tabular mapping.
 *
 * ```js ignore
 * import {createStore} from 'tinybase';
 * import {createTinyJoinPersister} from 'tinybase/persisters/persister-tinyjoin';
 * import {create} from 'tinyjoin';
 *
 * const tinyJoin = await create();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createTinyJoinPersister(store, tinyJoin, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log((await tinyJoin.query('SELECT * FROM pets')).rows);
 * // -> [{_id: 'fido', species: '"dog"'}]
 * // Note that Cells and Values are JSON-encoded, as they are in PostgreSQL.
 *
 * await tinyJoin.query('INSERT INTO pets (_id, species) VALUES ($1, $2)', [
 *   'felix',
 *   '"cat"',
 * ]);
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * await tinyJoin.close();
 * ```
 * @category Creation
 * @essential Persisting stores
 * @since 10.0.0
 */
/// createTinyJoinPersister
