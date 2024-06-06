/**
 * The persister-powersync module of the TinyBase project lets you save and load
 * Store data to and from a local SQLite database that is automatically synced
 * using the PowerSync service.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-powersync
 * @since v4.8.0
 */
/// persister-powersync
/**
 * The PowerSyncPersister interface is a minor extension to the Persister
 * interface.
 *
 * It simply provides an extra getPowerSync method for accessing a reference to
 * the PowerSync instance the Store is being persisted to.
 *
 * You should use the createPowerSyncPersister function to create a
 * PowerSyncPersister object.
 * @since v4.8.0
 */
/// PowerSyncPersister
{
  /**
   * The getPowerSync method returns a reference to the PowerSync instance the
   * Store is being persisted to.
   * @returns A reference to the PowerSync instance.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the PowerSync instance back out again.
   *
   * ```js yolo
   * import {createPowerSyncPersister} from 'tinybase/persisters/persister-powersync';
   * import {createStore} from 'tinybase';
   * import {usePowerSync} from '@journeyapps/powersync-react';
   *
   * const ps = usePowerSync();
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createPowerSyncPersister(store, ps, 'my_tinybase');
   *
   * console.log(persister.getPowerSync() == ps);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.8.0
   */
  /// PowerSyncPersister.getPowerSync
}
/**
 * The createPowerSyncPersister function creates a Persister object that can
 * persist the Store to a local SQLite database that is automatically synced
 * using the PowerSync service.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `powerSync` parameter which identifies the PowerSync instance.
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
 * @param powerSync The PowerSync instance.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment, since v4.0.4.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new PowerSyncPersister object.
 * @example
 * This example creates a PowerSyncPersister object and persists the Store to a
 * local PowerSync instance.
 * It makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js yolo
 * import {createPowerSyncPersister} from 'tinybase/persisters/persister-powersync';
 * import {createStore} from 'tinybase';
 * import {usePowerSync} from '@journeyapps/powersync-react';
 *
 * const ps = usePowerSync();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createPowerSyncPersister(store, ps, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(
 *   await new Promise((resolve) =>
 *     ps.execute('SELECT * FROM my_tinybase;', (_, rows) => resolve(rows)),
 *   ),
 * );
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await new Promise((resolve) =>
 *   ps.execute(
 *     'UPDATE my_tinybase SET store = ' +
 *       `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
 *     resolve,
 *   ),
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @example
 * This example creates a PowerSyncPersister object and persists the Store to a
 * local PowerSync instance with tabular mapping.
 *
 * ```js yolo
 * import {createPowerSyncPersister} from 'tinybase/persisters/persister-powersync';
 * import {createStore} from 'tinybase';
 * import {usePowerSync} from '@journeyapps/powersync-react';
 *
 * const ps = usePowerSync();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createPowerSyncPersister(store, ps, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log(
 *   await new Promise((resolve) =>
 *     ps.execute('SELECT * FROM pets;', (_, rows) => resolve(rows)),
 *   ),
 * );
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * await new Promise((resolve) =>
 *   ps.execute(
 *     `INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`,
 *     resolve,
 *   ),
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v4.8.0
 */
/// createPowerSyncPersister
