/**
 * The persister-react-native-sqlite module of the TinyBase project lets you
 * save and load Store data to and from a SQLite database using the
 * [`react-native-sqlite-storage`](https://github.com/andpor/react-native-sqlite-storage) module (in an appropriate React Native
 * environment).
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-react-native-sqlite
 * @since v6.4.0
 */
/// persister-react-native-sqlite
/**
 * The ReactNativeSqlitePersister interface represents a Persister that lets you
 * save and load Store data to and from a `react-native-sqlite-storage`
 * database.
 *
 * You should use the createReactNativeSqlitePersister function to create an
 * ReactNativeSqlitePersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getDb method for accessing a reference to the database instance the
 * Store is being persisted to.
 * @category Persister
 * @since v6.4.0
 */
/// ReactNativeSqlitePersister

/**
 * The getDb method returns a reference to the database instance the Store is
 * being persisted to.
 * @returns A reference to the database instance.
 * @example
 * This example creates a Persister object against a newly-created Store and
 * then gets the database instance back out again.
 *
 * ```js yolo
 * import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
 * import {createStore} from 'tinybase';
 * import {createReactNativeSqlitePersister} from 'tinybase/persisters/persister-react-native-sqlite';
 *
 * enablePromise(true);
 * const db = await openDatabase({name: 'my.db', location: 'default'});
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createReactNativeSqlitePersister(
 *   store,
 *   db,
 *   'my_tinybase',
 * );
 * console.log(persister.getDb() == db);
 * // -> true
 *
 * await persister.destroy();
 * ```
 * @category Getter
 * @since v6.4.0
 */
/// ReactNativeSqlitePersister.getDb

/**
 * The createReactNativeSqlitePersister function creates an
 * ReactNativeSqlitePersister object that can persist the Store to a local
 * `react-native-sqlite-storage` database.
 *
 * An ReactNativeSqlitePersister supports regular Store objects, and can also be
 * used to persist the metadata of a MergeableStore when using the JSON
 * serialization mode, as described below.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `db` parameter which identifies the database instance.
 *
 * **Important note:** the `react-native-sqlite-storage` module must have had
 * promises enabled before the database instance is passed in. Use
 * `SQLite.enablePromise(true)` before initializing the Persister.
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
 * @param store The Store or MergeableStore to persist.
 * @param db The database instance that was returned from
 * `await SQLite.openDatabase(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new ReactNativeSqlitePersister object.
 * @example
 * This example creates a ReactNativeSqlitePersister object and persists the
 * Store to a local SQLite database as a JSON serialization into the
 * `my_tinybase` table. It makes a change to the database directly and then
 * reloads it back into the Store.
 *
 * ```js yolo
 * import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
 * import {createStore} from 'tinybase';
 * import {createReactNativeSqlitePersister} from 'tinybase/persisters/persister-react-native-sqlite';
 *
 * enablePromise(true);
 * const db = await openDatabase({name: 'my.db', location: 'default'});
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createReactNativeSqlitePersister(
 *   store,
 *   db,
 *   'my_tinybase',
 * );
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log(
 *   (await db.executeSql('SELECT * FROM my_tinybase;'))[0].rows.raw(),
 * );
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await db.executeSql(
 *   'UPDATE my_tinybase SET store = ' +
 *     `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * ```
 * @example
 * This example creates a ReactNativeSqlitePersister object and persists the
 * Store to a local SQLite database with tabular mapping.
 *
 * ```js yolo
 * import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
 * import {createStore} from 'tinybase';
 * import {createReactNativeSqlitePersister} from 'tinybase/persisters/persister-react-native-sqlite';
 *
 * enablePromise(true);
 * const db = await openDatabase({name: 'my.db', location: 'default'});
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createReactNativeSqlitePersister(store, db, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log((await db.executeSql('SELECT * FROM pets;'))[0].rows.raw());
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * await db.executeSql(
 *   `INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await persister.destroy();
 * ```
 * @category Creation
 * @since v6.4.0
 */
/// createReactNativeSqlitePersister
