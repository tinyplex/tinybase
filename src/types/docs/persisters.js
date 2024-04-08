/* eslint-disable max-len */
/**
 * The persisters module of the TinyBase project provides a simple framework for
 * saving and loading Store data, to and from different destinations, or
 * underlying storage types.
 *
 * Several entry points are provided (in separately installed modules), each of
 * which returns a new Persister object that can load and save a Store. Between
 * them, these allow you to store your TinyBase data locally, remotely, to
 * SQLite databases, and across synchronization boundaries with CRDT frameworks.
 *
 * |Module|Function|Storage|
 * |-|-|-|
 * |persister-browser|createSessionPersister|Browser session storage|
 * |persister-browser|createLocalPersister|Browser local storage|
 * |persister-indexed-db|createIndexedDbPersister|Browser IndexedDB|
 * |persister-remote|createRemotePersister|Remote server|
 * |persister-file|createFilePersister|Local file (where possible)|
 * |persister-partykit-client|createPartyKitPersister|PartyKit with the persister-partykit-server module|
 * |persister-sqlite3|createSqlite3Persister|SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)|
 * |persister-sqlite-wasm|createSqliteWasmPersister|SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)|
 * |persister-cr-sqlite-wasm|createCrSqliteWasmPersister|SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)|
 * |persister-expo-sqlite|createExpoSqlitePersister|SQLite in React Native, via [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite)|
 * |persister-expo-sqlite-next|createExpoSqliteNextPersister|SQLite in React Native, via [expo-sqlite/next](https://github.com/expo/expo/tree/main/packages/expo-sqlite/next)|
 * |persister-electric-sql|createElectricSqlPersister|Electric SQL, via [electric-sql](https://github.com/electric-sql/electric)|
 * |persister-libsql|createLibSqlPersister|LibSQL for Turso, via [libsql-client](https://github.com/tursodatabase/libsql-client-ts)|
 * |persister-powersync|createPowerSyncPersister|PowerSync, via [powersync-sdk](https://github.com/powersync-ja/powersync-js)|
 * |persister-yjs|createYjsPersister|Yjs CRDTs, via [yjs](https://github.com/yjs/yjs)|
 * |persister-automerge|createSqliteWasmPersister|Automerge CRDTs, via [automerge-repo](https://github.com/automerge/automerge-repo)|
 *
 * Since persistence requirements can be different for every app, the
 * createCustomPersister function in this module can also be used to easily
 * create a fully customized way to save and load Store data.
 * @see Persisting Data guide
 * @see Database Persistence guide
 * @see Synchronizing Data guide
 * @see Countries demo
 * @see Todo App demos
 * @see Drawing demo
 * @packageDocumentation
 * @module persisters
 */
/// persisters
/**
 * The PersisterStats type describes the number of times a Persister object has
 * loaded or saved data.
 *
 * A PersisterStats object is returned from the getStats method, and is only
 * populated in a debug build.
 * @category Development
 */
/// PersisterStats
{
  /**
   * The number of times data has been loaded.
   */
  /// PersisterStats.loads
  /**
   * The number of times data has been saved.
   */
  /// PersisterStats.saves
}
/**
 * A PersisterListener is a callback that lets a Persister inform the Store that
 * a change has happened to the underlying data.
 *
 * If the listener has the `getChanges` parameter, it will be used to make an
 * incremental change to the Store. If not, but the `getContent` function _is_
 * available, that will be used to make a wholesale change to the Store. If
 * neither are present, the content will be loaded from the Persister's load
 * method.
 * @param getContent An optional function that, if provided, returns an array of
 * Store content and can be used to immediately wholesale update the Store.
 * @param getChanges An optional function that, if provided, returns a Changes
 * object and can be used to immediately incrementally update the Store.
 * @category Creation
 * @since v4.0.0
 */
/// PersisterListener
/**
 * The DatabasePersisterConfig type describes the configuration of a
 * database-oriented Persister, such as those for SQLite.
 *
 * There are two modes for persisting a Store with a database:
 *
 * - A JSON serialization of the whole Store, which is stored in a single row of
 *   a table (normally called `tinybase`) within the database. This is
 *   configured by providing a DpcJson object.
 * - A tabular mapping of Table Ids to database table names (and vice-versa).
 *   Values are stored in a separate special table (normally called
 *   `tinybase_values`). This is configured by providing a DpcTabular object.
 *
 * Please see the DpcJson and DpcTabular type documentation for more detail on
 * each. If not specified otherwise, JSON serialization will be used for
 * persistence.
 *
 * Changes made to the database (outside of this Persister) are picked up
 * immediately if they are made via the same connection or library that it is
 * using. If the database is being changed by another client, the Persister
 * needs to poll for changes. Hence both configuration types also contain an
 * `autoLoadIntervalSeconds` property which indicates how often it should do
 * that. This defaults to 1 second.
 *
 * Note that all the nested types within this type have a 'Dpc' prefix, short
 * for 'DatabasePersisterConfig'.
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will load
 * and save a JSON serialization from and to a table called `my_tinybase`,
 * polling the database every 2 seconds. See DpcJson for more details on these
 * settings.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'json',
 *   storeTableName: 'my_tinybase',
 *   autoLoadIntervalSeconds: 2,
 * };
 * ```
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will load
 * and save tabular data from and to tables specified in the `load` and `save`
 * mappings. See DpcTabular for more details on these settings.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'tabular',
 *   tables: {
 *     load: {petsInDb: 'pets', speciesInDb: 'species'},
 *     save: {pets: 'petsInDb', species: 'speciesInDb'},
 *   },
 * };
 * ```
 * @category Configuration
 * @since v4.0.0
 */
/// DatabasePersisterConfig
{
  /**
   * How often the Persister should poll the database for any changes made to it
   * by other clients, defaulting to 1 second.
   */
  /// DatabasePersisterConfig.autoLoadIntervalSeconds
}
/**
 * The DpcJson type describes the configuration of a database-oriented Persister
 * operating in serialized JSON mode.
 *
 * The only setting is the `storeTableName` property, which indicates the name
 * of a table in the database which will be used to serialize the Store content
 * into. It defaults to `tinybase`.
 *
 * That table in the database will be given two columns: a primary key column
 * called `_id`, and one called `store`. The Persister will place a single row
 * in this table with `_` in the `_id` column, and the JSON serialization in the
 * `store` column, something like:
 *
 * ```
 * > SELECT * FROM tinybase;
 * +-----+-----------------------------------------------------+
 * | _id | store                                               |
 * +-----+-----------------------------------------------------+
 * | _   | [{"pets":{"fido":{"species":"dog"}}},{"open":true}] |
 * +-----+-----------------------------------------------------+
 * ```
 *
 * The 'Dpc' prefix indicates that this type is used within the
 * DatabasePersisterConfig type.
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will load
 * and save a JSON serialization from and to a table called `tinybase_json`.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'json',
 *   storeTableName: 'tinybase_json',
 * };
 * ```
 * @category Configuration
 * @since v4.0.0
 */
/// DpcJson
{
  /**
   * The mode to be used for persisting the Store to the database, in this case
   * JSON serialization. See the DpcTabular type for the alternative tabular
   * mapping mode.
   */
  /// DpcJson.mode
  /**
   * An optional string which indicates the name of a table in the database
   * which will be used to serialize the Store content into. It defaults to
   * `tinybase`.
   */
  /// DpcJson.storeTableName
}
/**
 * The DpcTabular type describes the configuration of a database-oriented
 * Persister that is operating in tabular mapping mode.
 *
 * It is important to note that both the tabular mapping in ('save') and out
 * ('load') of an underlying database are disabled by default. This is to ensure
 * that if you pass in an existing populated database you don't run the
 * immediate risk of corrupting or losing all your data.
 *
 * This configuration therefore takes a `tables` property object (with child
 * `load` and `save` property objects) and a `values` property object. These
 * indicate how you want to load and save Tables and Values respectively. At
 * least one of these two properties are required for the Persister to do
 * anything!
 *
 * Note that if you are planning to both load from and save to a database, it is
 * important to make sure that the load and save table mappings are symmetrical.
 * For example:
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'tabular',
 *   tables: {
 *     load: {petsInDb: 'pets', speciesInDb: 'species'},
 *     save: {pets: 'petsInDb', species: 'speciesInDb'},
 *   },
 * };
 * ```
 *
 * See the documentation for the DpcTabularLoad, DpcTabularSave, and
 * DpcTabularValues types for more details on how to configure the tabular
 * mapping mode.
 *
 * The 'Dpc' prefix indicates that this type is used within the
 * DatabasePersisterConfig type.
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will load
 * and save Tables data from and to tables specified in the `load` and `save`
 * mappings, and Values data from and to a table called `my_tinybase_values`.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'tabular',
 *   tables: {
 *     load: {petsInDb: 'pets', speciesInDb: 'species'},
 *     save: {pets: 'petsInDb', species: 'speciesInDb'},
 *   },
 *   values: {
 *     load: true,
 *     save: true,
 *     tableName: 'my_tinybase_values',
 *   },
 * };
 * ```
 * @category Configuration
 * @since v4.0.0
 */
/// DpcTabular
{
  /**
   * The mode to be used for persisting the Store to the database, in this case
   * tabular mapping. See the DpcJson type for the alternative JSON
   * serialization mode.
   */
  /// DpcTabular.mode
  /**
   * The settings for how the Store Tables are mapped to and from the database.
   */
  /// DpcTabular.tables
  {
    /**
     * The settings for how the database tables are mapped into the Store Tables
     * when loading.
     */
    /// DpcTabular.tables.load
    /**
     * The settings for how the Store Tables are mapped out to the database
     * tables when saving.
     */
    /// DpcTabular.tables.save
  }
  /**
   * The settings for how the Store Values are mapped to and from the database.
   */
  /// DpcTabular.values
}
/**
 * The DpcTabularLoad type describes the configuration for loading Tables in a
 * database-oriented Persister that is operating in tabular mode.
 *
 * It is an object where each key is a name of a database table, and the value
 * is a child configuration object for how that table should be loaded into the
 * Store. The properties of the child configuration object are:
 *
 * ||Type|Description|
 * |-|-|-|
 * |`tableId`|Id|The Id of the Store Table into which data from this database table should be loaded.|
 * |`rowIdColumnName?`|string|The optional name of the column in the database table that will be used as the Row Ids in the Store Table, defaulting to '_id'.|
 *
 * As a shortcut, if you do not need to specify a custom `rowIdColumnName`, you
 * can simply provide the Id of the Store Table instead of the whole object.
 *
 * The 'Dpc' prefix indicates that this type is used within the
 * DatabasePersisterConfig type.
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will load
 * the data of two database tables (called 'petsInDb' and 'speciesInDb') into
 * two Store Tables (called 'pets' and 'species'). One has a column for the Row
 * Id called 'id' and the other defaults it to '_id'.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'tabular',
 *   tables: {
 *     load: {
 *       petsInDb: {tableId: 'pets', rowIdColumnName: 'id'},
 *       speciesInDb: 'species',
 *     },
 *   },
 * };
 * ```
 *
 * Imagine database tables that look like this:
 *
 * ```
 * > SELECT * FROM petsInDb;
 * +-------+---------+-------+
 * | id    | species | color |
 * +-------+---------+-------+
 * | fido  | dog     | brown |
 * | felix | cat     | black |
 * +-------+---------+-------+
 *
 * > SELECT * FROM speciesInDb;
 * +------+-------+
 * | _id  | price |
 * +------+-------+
 * | dog  | 5     |
 * | cat  | 4     |
 * +------+-------+
 * ```
 *
 * With the configuration above, this will load into a Store with Tables that
 * look like this:
 *
 * ```json
 * {
 *   "pets": {
 *     "fido": {"species": "dog", "color": "brown"},
 *     "felix": {"species": "cat", "color": "black"},
 *   },
 *   "species": {
 *     "dog": {"price": 5},
 *     "cat": {"price": 4},
 *   },
 * }
 * ```
 * @category Configuration
 * @since v4.0.0
 */
/// DpcTabularLoad
{
  {
    {
      {
        /**
         * The Id of the Store Table into which data from this database table
         * should be loaded.
         */
        /// DpcTabularLoad.tableId
        /**
         * The optional name of the column in the database table that will be
         * used as the Row Ids in the Store Table, defaulting to '_id'.
         */
        /// DpcTabularLoad.rowIdColumnName
      }
    }
  }
}
/**
 * The DpcTabularSave type describes the configuration for saving Tables in a
 * database-oriented Persister that is operating in tabular mode.
 *
 * It is an object where each key is an Id of a Store Table, and the value is a
 * child configuration object for how that Table should be saved out to the
 * database. The properties of the child configuration object are:
 *
 * ||Type|Description|
 * |-|-|-|
 * |`tableName`|string|The name of the database table out to which the Store Table should be saved.|
 * |`rowIdColumnName?`|string|The optional name of the column in the database table that will be used to save the Row Ids from the Store Table, defaulting to '_id'.|
 * |`deleteEmptyColumns?`|boolean|Whether columns in the database table will be removed if they are empty in the Store Table, defaulting to false.|
 * |`deleteEmptyTable?`|boolean|Whether tables in the database will be removed if the Store Table is empty, defaulting to false.|
 *
 * As a shortcut, if you do not need to specify a custom `rowIdColumnName`, or
 * enable the `deleteEmptyColumns` or `deleteEmptyTable` settings, you can
 * simply provide the name of the database table instead of the whole object.
 *
 * `deleteEmptyColumns` and `deleteEmptyTable` only have a guaranteed effect
 * when an explicit call is made to the Persister's save method. Columns and
 * tables will not necessarily be removed when the Persister is incrementally
 * 'autoSaving', due to performance reasons. If you want to be sure that your
 * database table matches a TinyBase Table without any extraneous columns,
 * simply call the save method at an idle moment.
 *
 * The 'Dpc' prefix indicates that this type is used within the
 * DatabasePersisterConfig type.
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will save
 * the data of two Store Tables (called 'pets' and 'species') into two database
 * tables (called 'petsInDb' and 'speciesInDb'). One has a column for the Row
 * Id called 'id' and will delete columns and the whole table if empty, the
 * other defaults to '_id' and will not delete columns or the whole table if
 * empty.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'tabular',
 *   tables: {
 *     save: {
 *       pets: {
 *         tableName: 'petsInDb',
 *         deleteEmptyColumns: true,
 *         deleteEmptyTable: true,
 *       },
 *       species: 'speciesInDb',
 *     },
 *   },
 * };
 * ```
 *
 * Imagine a Store with Tables that look like this:
 *
 * ```json
 * {
 *   "pets": {
 *     "fido": {"species": "dog", "color": "brown"},
 *     "felix": {"species": "cat", "color": "black"},
 *   },
 *   "species": {
 *     "dog": {"price": 5},
 *     "cat": {"price": 4},
 *   },
 * }
 * ```
 *
 * With the configuration above, this will save out to a database with tables
 * that look like this:
 *
 * ```
 * > SELECT * FROM petsInDb;
 * +-------+---------+-------+
 * | id    | species | color |
 * +-------+---------+-------+
 * | fido  | dog     | brown |
 * | felix | cat     | black |
 * +-------+---------+-------+
 *
 * > SELECT * FROM speciesInDb;
 * +------+-------+
 * | _id  | price |
 * +------+-------+
 * | dog  | 5     |
 * | cat  | 4     |
 * +------+-------+
 * ```
 * @category Configuration
 * @since v4.0.0
 */
/// DpcTabularSave
{
  {
    {
      {
        /**
         * The name of the database table out to which the Store Table should be
         * saved.
         */
        /// DpcTabularSave.tableName
        /**
         * The optional name of the column in the database table that will be
         * used to save the Row Ids from the Store Table, defaulting to '_id'.
         */
        /// DpcTabularSave.rowIdColumnName
        /**
         * Whether columns in the database table will be removed if they are
         * empty in the Store Table, defaulting to false.
         */
        /// DpcTabularSave.deleteEmptyColumns
        /**
         * Whether tables in the database will be removed if the Store Table
         * is empty, defaulting to false.
         */
        /// DpcTabularSave.deleteEmptyTable
      }
    }
  }
}
/**
 * The DpcTabularValues type describes the configuration for handling Values in
 * a database-oriented Persister that is operating in tabular mode.
 *
 * Note that both loading and saving of Values from and to the database are
 * disabled by default.
 *
 * The 'Dpc' prefix indicates that this type is used within the
 * DatabasePersisterConfig type.
 * @example
 * When applied to a database Persister, this DatabasePersisterConfig will load
 * and save the data of a Store's Values into a database
 * table called 'my_tinybase_values'.
 *
 * ```js
 * const databasePersisterConfig: DatabasePersisterConfig = {
 *   mode: 'tabular',
 *   values: {
 *     load: true,
 *     save: true,
 *     tableName: 'my_tinybase_values',
 *   },
 * };
 * ```
 * @category Configuration
 * @since v4.0.0
 */
/// DpcTabularValues
{
  /**
   * Whether Store Values will be loaded from a database table.
   */
  /// DpcTabularValues.load
  /**
   * Whether Store Values will be saved to a database table.
   */
  /// DpcTabularValues.save
  /**
   * The optional name of the database table from and to which the Store Table
   * should be loaded or saved, defaulting to `tinybase_values`.
   */
  /// DpcTabularValues.tableName
}
/**
 * A Persister object lets you save and load Store data to and from different
 * locations, or underlying storage types.
 *
 * This is useful for preserving Store data between browser sessions or reloads,
 * saving or loading browser state to or from a server, or saving Store data to
 * disk in a environment with filesystem access.
 *
 * Creating a Persister depends on the choice of underlying storage where the
 * data is to be stored. Options include the createSessionPersister function,
 * the createLocalPersister function, the createRemotePersister function, and
 * the createFilePersister function. The createCustomPersister function can also
 * be used to easily create a fully customized way to save and load Store data.
 *
 * A Persister lets you explicit save or load data, with the save method and the
 * load method respectively. These methods are both asynchronous (since the
 * underlying data storage may also be) and return promises. As a result you
 * should use the `await` keyword to call them in a way that guarantees
 * subsequent execution order.
 *
 * When you don't want to deal with explicit persistence operations, a Persister
 * object also provides automatic saving and loading. Automatic saving listens
 * for changes to the Store and persists the data immediately. Automatic loading
 * listens (or polls) for changes to the persisted data and reflects those
 * changes in the Store.
 *
 * You can start automatic saving or loading with the startAutoSave method and
 * startAutoLoad method. Both are asynchronous since they will do an immediate
 * save and load before starting to listen for subsequent changes. You can stop
 * the behavior with the stopAutoSave method and stopAutoLoad method (which are
 * synchronous).
 *
 * You may often want to have both automatic saving and loading of a Store so
 * that changes are constantly synchronized (allowing basic state preservation
 * between browser tabs, for example). The framework has some basic provisions
 * to prevent race conditions - for example it will not attempt to save data if
 * it is currently loading it and vice-versa - and will sequentially schedule
 * methods that could cause race conditions.
 *
 * That said, be aware that you should always comprehensively test your
 * persistence strategy to understand the opportunity for data loss (in the case
 * of trying to save data to a server under poor network conditions, for
 * example).
 *
 * To help debug such issues, since v4.0.4, the create methods for all Persister
 * objects take an optional `onIgnoredError` argument. This is a handler for the
 * errors that the Persister would otherwise ignore when trying to save or load
 * data (such as when handling corrupted stored data). It's recommended you use
 * this for debugging persistence issues, but only in a development environment.
 * Database-based Persister objects also take an optional `onSqlCommand`
 * argument for logging commands and queries made to the underlying database.
 * @example
 * This example creates a Store, persists it to the browser's session storage as
 * a JSON string, changes the persisted data, updates the Store from it, and
 * finally destroys the Persister again.
 *
 * ```js
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createSessionPersister(store, 'pets');
 *
 * await persister.save();
 * console.log(sessionStorage.getItem('pets'));
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * sessionStorage.setItem('pets', '[{"pets":{"toto":{"species":"dog"}}},{}]');
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {toto: {species: 'dog'}}}
 *
 * persister.destroy();
 * sessionStorage.clear();
 * ```
 * @example
 * This example creates a Store, and automatically saves and loads it to the
 * browser's session storage as a JSON string. Changes to the Store data, or the
 * persisted data (implicitly firing a StorageEvent), are reflected accordingly.
 *
 * ```js
 * const store = createStore();
 * const persister = createSessionPersister(store, 'pets');
 *
 * await persister.startAutoLoad({pets: {fido: {species: 'dog'}}});
 * await persister.startAutoSave();
 *
 * store.setTables({pets: {felix: {species: 'cat'}}});
 * // ...
 * console.log(sessionStorage.getItem('pets'));
 * // -> '[{"pets":{"felix":{"species":"cat"}}},{}]'
 *
 * // In another browser tab:
 * sessionStorage.setItem('pets', '[{"pets":{"toto":{"species":"dog"}}},{}]');
 * // -> StorageEvent('storage', {storageArea: sessionStorage, key: 'pets'})
 *
 * // ...
 * console.log(store.getTables());
 * // -> {pets: {toto: {species: 'dog'}}}
 *
 * persister.destroy();
 * sessionStorage.clear();
 * ```
 * @category Persister
 */
/// Persister
{
  /**
   * The load method gets persisted data from storage, and loads it into the
   * Store with which the Persister is associated, once.
   *
   * The optional parameters allow you to specify what the initial content for
   * the Store will be if there is nothing currently persisted or if the load
   * fails (for example when the Persister is remote and the environment is
   * offline). This allows you to fallback or instantiate a Store whether it's
   * loading from previously persisted storage or being run for the first time.
   *
   * This method is asynchronous because the persisted data may be on a remote
   * machine or a filesystem. Even for those storage types that are synchronous
   * (like browser storage) it is still recommended that you `await` calls to
   * this method or handle the return type natively as a Promise.
   * @param initialTables An optional Tables object used when the underlying
   * storage has not previously been populated.
   * @param initialValues An optional Values object used when the underlying
   * storage has not previously been populated, since v3.0.
   * @returns A Promise containing a reference to the Persister object.
   * @example
   * This example creates an empty Store, and loads data into it from the
   * browser's session storage, which for the purposes of this example has been
   * previously populated.
   *
   * ```js
   * sessionStorage.setItem('pets', '[{"pets":{"fido":{"species":"dog"}}},{}]');
   *
   * const store = createStore();
   * const persister = createSessionPersister(store, 'pets');
   *
   * await persister.load();
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * sessionStorage.clear();
   * ```
   * @example
   * This example creates an empty Store, and loads data into it from the
   * browser's session storage, which is at first empty, so the optional
   * parameter is used. The second time the load method is called, data has
   * previously been persisted and instead, that is loaded.
   *
   * ```js
   * const store = createStore();
   * const persister = createSessionPersister(store, 'pets');
   *
   * await persister.load({pets: {fido: {species: 'dog'}}});
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * sessionStorage.setItem('pets', '[{"pets":{"toto":{"species":"dog"}}},{}]');
   * await persister.load({pets: {fido: {species: 'dog'}}});
   * console.log(store.getTables());
   * // -> {pets: {toto: {species: 'dog'}}}
   *
   * sessionStorage.clear();
   * ```
   * @category Load
   */
  /// Persister.load
  /**
   * The startAutoLoad method gets persisted data from storage, and loads it
   * into the Store with which the Persister is associated, once, and then
   * continuously.
   *
   * The optional parameters allow you to specify what the initial content for
   * the Store will be if there is nothing currently persisted or if the load
   * fails (for example when the Persister is remote and the environment is
   * offline). This allows you to fallback or instantiate a Store whether it's
   * loading from previously persisted storage or being run for the first time.
   *
   * This method first runs a single call to the load method to ensure the data
   * is in sync with the persisted storage. It then continues to watch for
   * changes to the underlying data (either through events or polling, depending
   * on the storage type), automatically loading the data into the Store.
   *
   * This method is asynchronous because it starts by making a single call to
   * the asynchronous load method. Even for those storage types that are
   * synchronous (like browser storage) it is still recommended that you `await`
   * calls to this method or handle the return type natively as a Promise.
   * @param initialTables An optional Tables object used when the underlying
   * storage has not previously been populated.
   * @param initialValues An optional Values object used when the underlying
   * storage has not previously been populated, since v3.0.
   * @returns A Promise containing a reference to the Persister object.
   * @example
   * This example creates an empty Store, and loads data into it from the
   * browser's session storage, which at first is empty (so the `initialTables`
   * parameter is used). Subsequent changes to the underlying storage are then
   * reflected in the Store (in this case through detection of StorageEvents
   * from session storage changes made in another browser tab).
   *
   * ```js
   * const store = createStore();
   * const persister = createSessionPersister(store, 'pets');
   *
   * await persister.startAutoLoad({pets: {fido: {species: 'dog'}}});
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * // In another browser tab:
   * sessionStorage.setItem('pets', '[{"pets":{"toto":{"species":"dog"}}},{}]');
   * // -> StorageEvent('storage', {storageArea: sessionStorage, key: 'pets'})
   *
   * // ...
   * console.log(store.getTables());
   * // -> {pets: {toto: {species: 'dog'}}}
   *
   * persister.destroy();
   * sessionStorage.clear();
   * ```
   * @category Load
   */
  /// Persister.startAutoLoad
  /**
   * The stopAutoLoad method stops the automatic loading of data from storage
   * previously started with the startAutoLoad method.
   *
   * If the Persister is not currently set to automatically load, this method
   * has no effect.
   * @returns A reference to the Persister object.
   * @example
   * This example creates an empty Store, and starts automatically loading data
   * into it from the browser's session storage. Once the automatic loading is
   * stopped, subsequent changes are not reflected in the Store.
   *
   * ```js
   * const store = createStore();
   * const persister = createSessionPersister(store, 'pets');
   * await persister.startAutoLoad();
   *
   * // In another browser tab:
   * sessionStorage.setItem('pets', '[{"pets":{"toto":{"species":"dog"}}},{}]');
   * // -> StorageEvent('storage', {storageArea: sessionStorage, key: 'pets'})
   * // ...
   * console.log(store.getTables());
   * // -> {pets: {toto: {species: 'dog'}}}
   *
   * persister.stopAutoLoad();
   *
   * // In another browser tab:
   * sessionStorage.setItem(
   *   'pets',
   *   '[{"pets":{"felix":{"species":"cat"}}},{}]',
   * );
   * // -> StorageEvent('storage', {storageArea: sessionStorage, key: 'pets'})
   * // ...
   * console.log(store.getTables());
   * // -> {pets: {toto: {species: 'dog'}}}
   * // Storage change has not been automatically loaded.
   *
   * persister.destroy();
   * sessionStorage.clear();
   * ```
   * @category Load
   */
  /// Persister.stopAutoLoad
  /**
   * The isAutoLoading method lets you find out if the Persister is currently
   * automatically loading its content.
   * @returns A boolean indicating whether the Persister is currently
   * autoLoading.
   * @example
   * This example creates a Persister and queries whether it is autoLoading.
   *
   * ```js
   * const persister = createSessionPersister(createStore(), 'pets');
   *
   * console.log(persister.isAutoLoading());
   * // -> false
   *
   * await persister.startAutoLoad();
   * console.log(persister.isAutoLoading());
   * // -> true
   *
   * await persister.stopAutoLoad();
   * console.log(persister.isAutoLoading());
   * // -> false
   * ```
   * @category Load
   * @since v5.0.0
   */
  /// Persister.isAutoLoading
  /**
   * The save method takes data from the Store with which the Persister is
   * associated and persists it into storage, once.
   *
   * This method is asynchronous because the persisted data may be on a remote
   * machine or a filesystem. Even for those storage types that are synchronous
   * (like browser storage) it is still recommended that you `await` calls to
   * this method or handle the return type natively as a Promise.
   * @returns A Promise containing a reference to the Persister object.
   * @example
   * This example creates a Store with some data, and saves into the browser's
   * session storage.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSessionPersister(store, 'pets');
   *
   * await persister.save();
   * console.log(sessionStorage.getItem('pets'));
   * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
   *
   * persister.destroy();
   * sessionStorage.clear();
   * ```
   * @category Save
   */
  /// Persister.save
  /**
   * The save method takes data from the Store with which the Persister is
   * associated and persists it into storage, once, and then continuously.
   *
   * This method first runs a single call to the save method to ensure the data
   * is in sync with the persisted storage. It then continues to watch for
   * changes to the Store, automatically saving the data to storage.
   *
   * This method is asynchronous because it starts by making a single call to
   * the asynchronous save method. Even for those storage types that are
   * synchronous (like browser storage) it is still recommended that you `await`
   * calls to this method or handle the return type natively as a Promise.
   * @returns A Promise containing a reference to the Persister object.
   * @example
   * This example creates a Store with some data, and saves into the browser's
   * session storage. Subsequent changes to the Store are then automatically
   * saved to the underlying storage.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSessionPersister(store, 'pets');
   *
   * await persister.startAutoSave();
   * console.log(sessionStorage.getItem('pets'));
   * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
   *
   * store.setTables({pets: {toto: {species: 'dog'}}});
   * // ...
   * console.log(sessionStorage.getItem('pets'));
   * // -> '[{"pets":{"toto":{"species":"dog"}}},{}]'
   *
   * sessionStorage.clear();
   * ```
   * @category Save
   */
  /// Persister.startAutoSave
  /**
   * The stopAutoSave method stops the automatic save of data to storage
   * previously started with the startAutoSave method.
   *
   * If the Persister is not currently set to automatically save, this method
   * has no effect.
   * @returns A reference to the Persister object.
   * @example
   * This example creates a Store with some data, and saves into the browser's
   * session storage. Subsequent changes to the Store are then automatically
   * saved to the underlying storage. Once the automatic saving is
   * stopped, subsequent changes are not reflected.
   *
   * ```js
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createSessionPersister(store, 'pets');
   * await persister.startAutoSave();
   *
   * store.setTables({pets: {toto: {species: 'dog'}}});
   * // ...
   * console.log(sessionStorage.getItem('pets'));
   * // -> '[{"pets":{"toto":{"species":"dog"}}},{}]'
   *
   * persister.stopAutoSave();
   *
   * store.setTables({pets: {felix: {species: 'cat'}}});
   * // ...
   * console.log(sessionStorage.getItem('pets'));
   * // -> '[{"pets":{"toto":{"species":"dog"}}},{}]'
   * // Store change has not been automatically saved.
   *
   * sessionStorage.clear();
   * ```
   * @category Save
   */
  /// Persister.stopAutoSave
  /**
   * The isAutoSaving method lets you find out if the Persister is currently
   * automatically saving its content.
   * @returns A boolean indicating whether the Persister is currently
   * autoSaving.
   * @example
   * This example creates a Persister and queries whether it is autoSaving.
   *
   * ```js
   * const persister = createSessionPersister(createStore(), 'pets');
   *
   * console.log(persister.isAutoSaving());
   * // -> false
   *
   * await persister.startAutoSave();
   * console.log(persister.isAutoSaving());
   * // -> true
   *
   * await persister.stopAutoSave();
   * console.log(persister.isAutoSaving());
   * // -> false
   * ```
   * @category Save
   * @since v5.0.0
   */
  /// Persister.isAutoSaving
  /**
   * The schedule method allows you to queue up a series of asynchronous actions
   * that must run in sequence during persistence.
   *
   * For example, a database Persister may need to ensure that multiple
   * asynchronous tasks to check and update the database schema are completed
   * before data is written to it. Therefore it's most likely you will be using
   * this method inside your `setPersisted` implementation.
   *
   * Call this method to add a single asynchronous action, or a sequence of them
   * in one call. This will also start to run the first task in the queue (which
   * once complete will then run the next, and so on), and so this method itself
   * is also asynchronous and returns a promise of the Persister.
   * @returns A reference to the Persister object.
   * @example
   * This example creates a custom Persister object against a newly-created
   * Store and then sequences two tasks in order to update its data on a
   * hypothetical remote system.
   *
   * ```js yolo
   * const store = createStore();
   * const persister = createCustomPersister(
   *   store,
   *   async () => {
   *     // getPersisted
   *     return await getDataFromRemoteSystem();
   *   },
   *   async (getContent) => {
   *     // setPersisted
   *     await persister.schedule(
   *       async () => await checkRemoteSystemIsReady(),
   *       async () => await sendDataToRemoteSystem(getContent()),
   *     );
   *   },
   *   (listener) => setInterval(listener, 1000),
   *   (interval) => clearInterval(interval),
   * );
   * ```
   * @category Lifecycle
   * @since v4.0.0
   */
  /// Persister.schedule
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Persister object.
   * @returns A reference to the Store.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets its reference in order to update its data.
   *
   * ```js
   * const persister = createSessionPersister(createStore(), 'pets');
   * await persister.startAutoSave();
   *
   * persister.getStore().setTables({pets: {fido: {species: 'dog'}}});
   * // ...
   * console.log(sessionStorage.getItem('pets'));
   * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
   *
   * sessionStorage.clear();
   * ```
   * @category Getter
   */
  /// Persister.getStore
  /**
   * The destroy method should be called when this Persister object is no longer
   * used.
   *
   * This guarantees that all of the listeners that the object registered with
   * the underlying Store and storage are removed and it can be correctly
   * garbage collected. It is equivalent to running the stopAutoLoad method and
   * the stopAutoSave method in succession.
   * @example
   * This example creates a Store, associates a Persister object with it (that
   * registers a TablesListener with the underlying Store), and then destroys it
   * again, removing the listener.
   *
   * ```js
   * const store = createStore();
   * const persister = createSessionPersister(store, 'pets');
   * await persister.startAutoSave();
   *
   * console.log(store.getListenerStats().transaction);
   * // -> 1
   *
   * persister.destroy();
   *
   * console.log(store.getListenerStats().transaction);
   * // -> 0
   * ```
   * @category Lifecycle
   */
  /// Persister.destroy
  /**
   * The getStats method provides a set of statistics about the Persister, and
   * is used for debugging purposes.
   *
   * The PersisterStats object contains a count of the number of times the
   * Persister has loaded and saved data.
   *
   * The statistics are only populated in a debug build: production builds
   * return an empty object. The method is intended to be used during
   * development to ensure your persistence layer is acting as expected, for
   * example.
   * @returns A PersisterStats object containing Persister load and save
   * statistics.
   * @example
   * This example gets the load and save statistics of a Persister object.
   * Remember that the startAutoLoad method invokes an explicit load when it
   * starts, and the startAutoSave method invokes an explicit save when it
   * starts - so those numbers are included in addition to the loads and saves
   * invoked by changes to the Store and to the underlying storage.
   *
   * ```js
   * const store = createStore();
   * const persister = createSessionPersister(store, 'pets');
   *
   * await persister.startAutoLoad({pets: {fido: {species: 'dog'}}});
   * await persister.startAutoSave();
   *
   * store.setTables({pets: {felix: {species: 'cat'}}});
   * // ...
   *
   * sessionStorage.setItem('pets', '[{"pets":{"toto":{"species":"dog"}}},{}]');
   * // -> StorageEvent('storage', {storageArea: sessionStorage, key: 'pets'})
   * // ...
   *
   * console.log(persister.getStats());
   * // -> {loads: 2, saves: 2}
   *
   * persister.destroy();
   * sessionStorage.clear();
   * ```
   * @category Development
   */
  /// Persister.getStats
}
/**
 * The createCustomPersister function creates a Persister object that you can
 * configure to persist the Store in any way you wish.
 *
 * As well as providing a reference to the Store to persist, you must provide
 * functions that handle how to fetch, write, and listen to, the persistence
 * layer.
 *
 * The other creation functions (such as the createSessionPersister function and
 * createFilePersister function, for example) all use this function under the
 * covers. See those implementations for ideas on how to implement your own
 * Persister types.
 *
 * This API changed in v4.0. Any custom persisters created on previous versions
 * should be upgraded. Most notably, the `setPersisted` function parameter is
 * provided with a `getContent` function to get the content from the Store
 * itself, rather than being passed pre-serialized JSON. It also receives
 * information about the changes made during a transaction. The `getPersisted`
 * function must return the content (or nothing) rather than JSON.
 * `startListeningToPersisted` has been renamed `addPersisterListener`, and
 * `stopListeningToPersisted` has been renamed `delPersisterListener`.
 * @param store The Store to persist.
 * @param getPersisted An asynchronous function which will fetch content from
 * the persistence layer (or `undefined` if not present).
 * @param setPersisted An asynchronous function which will send content to the
 * persistence layer. Since v4.0, it receives functions for getting the Store
 * content and information about the changes made during a transaction.
 * @param addPersisterListener A function that will register a `listener`
 * listener on underlying changes to the persistence layer. You can return a
 * listening handle that will be provided again when `delPersisterListener` is
 * called.
 * @param delPersisterListener A function that will unregister the listener from
 * the underlying changes to the persistence layer. It receives whatever was
 * returned from your `addPersisterListener` implementation.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @param supportsMergeableStore An optional boolean to indicate that this
 * Persister will be able to handle MergeableStore persistence as well as
 * regular Store persistence, since v5.0.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a custom Persister object and persists the Store to a
 * local string called `storeJson` and which would automatically load by polling
 * for changes every second.
 *
 * ```js
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * let storeJson;
 *
 * const persister = createCustomPersister(
 *   store,
 *   async () => {
 *     // getPersisted
 *     return JSON.parse(storeJson);
 *   },
 *   async (getContent) => {
 *     // setPersisted
 *     storeJson = JSON.stringify(getContent());
 *   },
 *   (listener) => setInterval(listener, 1000),
 *   (interval) => clearInterval(interval),
 * );
 *
 * await persister.save();
 * console.log(storeJson);
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * storeJson = '[{"pets":{"fido":{"species":"dog","color":"brown"}}},{}]';
 * await persister.load();
 *
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog', color: 'brown'}}}
 *
 * persister.destroy();
 * ```
 * @category Creation
 */
/// createCustomPersister
