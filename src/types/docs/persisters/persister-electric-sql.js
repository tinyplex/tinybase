/**
 * The persister-electric-sql module of the TinyBase project lets you save and
 * load Store data to and from a local ElectricSQL database (in an appropriate
 * environment).
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-electric-sql
 * @since v4.6.0
 */
/// persister-electric-sql
/**
 * The ElectricSqlPersister interface is a minor extension to the Persister
 * interface.
 *
 * It simply provides an extra getElectricClient method for accessing a
 * reference to the Electric client the Store is being persisted to.
 *
 * You should use the createElectricSqlPersister function to create an
 * ElectricSqlPersister object.
 * @category Persister
 * @since v4.6.0
 */
/// ElectricSqlPersister
{
  /**
   * The getElectricClient method returns a reference to the Electric client the
   * Store is being persisted to.
   * @returns A reference to the Electric client.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the Electric client back out again.
   *
   * ```js yolo
   * import {ElectricDatabase, electrify} from 'electric-sql/wa-sqlite';
   * import {createElectricSqlPersister} from 'tinybase/persisters/persister-electric-sql';
   * import {createStore} from 'tinybase';
   * import {schema} from './generated/client';
   *
   * const electricClient = await electrify(
   *   await ElectricDatabase.init('electric.db', ''),
   *   schema,
   *   {url: import.meta.env.ELECTRIC_SERVICE},
   * );
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createElectricSqlPersister(
   *   store,
   *   electricClient,
   *   'my_tinybase',
   * );
   *
   * console.log(persister.getElectricClient() == electricClient);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.6.0
   */
  /// ElectricSqlPersister.getElectricClient
}
/**
 * The createElectricSqlPersister function creates a Persister object that can
 * persist the Store to a local ElectricSQL database (in an appropriate
 * environment).
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `electricClient` parameter which identifies the Electric client.
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
 * @param electricClient The Electric client that was returned from `await
 * electrify(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new ElectricSqlPersister object.
 * @example
 * This example creates a ElectricSqlPersister object and persists the Store to
 * a local ElectricSql database as a JSON serialization into the `my_tinybase`
 * table. It makes a change to the database directly and then reloads it back
 * into the Store.
 *
 * ```js yolo
 * import {ElectricDatabase, electrify} from 'electric-sql/wa-sqlite';
 * import {createElectricSqlPersister} from 'tinybase/persisters/persister-electric-sql';
 * import {createStore} from 'tinybase';
 * import {schema} from './generated/client';
 *
 * const electricClient = await electrify(
 *   await ElectricDatabase.init('electric.db', ''),
 *   schema,
 *   {url: import.meta.env.ELECTRIC_SERVICE},
 * );
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createElectricSqlPersister(
 *   store,
 *   electricClient,
 *   'my_tinybase',
 * );
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(
 *   await electricClient.db.raw({sql: 'SELECT * FROM my_tinybase;'}),
 * );
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await electricClient.db.raw({
 *   sql:
 *     'UPDATE my_tinybase SET store = ' +
 *     `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
 * });
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @example
 * This example creates a ElectricSqlPersister object and persists the Store to
 * a local ElectricSql database with tabular mapping.
 *
 * ```js yolo
 * import {ElectricDatabase, electrify} from 'electric-sql/wa-sqlite';
 * import {createElectricSqlPersister} from 'tinybase/persisters/persister-electric-sql';
 * import {createStore} from 'tinybase';
 * import {schema} from './generated/client';
 *
 * const electricClient = await electrify(
 *   await ElectricDatabase.init('electric.db', ''),
 *   schema,
 *   {url: import.meta.env.ELECTRIC_SERVICE},
 * );
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createElectricSqlPersister(store, electricClient, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log(await electricClient.db.raw({sql: 'SELECT * FROM pets;'}));
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * await electricClient.db.raw({
 *   sql: `INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`,
 * });
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v4.6.0
 */
/// createElectricSqlPersister
