/**
 * This persister uses Cloudflare's SQLite storage backend, which offers significantly
 * better pricing compared to the Key-value storage backend. The SQLite storage backend
 * is Cloudflare's recommended storage option for new Durable Object namespaces.
 *
 * **Important:** Before using this persister, you must configure your Durable Object
 * class to use SQLite storage by adding a migration to your `wrangler.toml` or
 * `wrangler.json` configuration file. Use `new_sqlite_classes` in your migration
 * configuration to enable SQLite storage for your Durable Object class.
 *
 * @see Cloudflare Durable Objects guide
 * @see Persistence guides
 * @see {@link https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/ | Durable Objects migrations}
 * @packageDocumentation
 * @module persister-durable-object-sql-storage
 * @since v6.2.0
 */
/// persister-durable-object-sql-storage

/**
 * The DpcKeyValue type represents the configuration for key-value persistence mode
 * in a DurableObjectSqlStoragePersister.
 *
 * This mode stores each table, row, cell, and value as separate database rows,
 * avoiding Cloudflare's 2MB row limit that can be hit with large stores in JSON mode.
 * While this creates more database writes, it provides better scalability for
 * larger datasets.
 *
 * @example
 * This example shows how to configure a DurableObjectSqlStoragePersister to use
 * key-value mode with a custom storage prefix:
 *
 * ```js
 * const config = {
 *   mode: 'key-value',
 *   storagePrefix: 'my_app_'
 * };
 *
 * const persister = createDurableObjectSqlStoragePersister(
 *   store,
 *   ctx.storage.sql,
 *   config
 * );
 * ```
 *
 * @category Configuration
 * @since v6.2.0
 */
/// DpcKeyValue
{
  /**
   * The mode property must be set to 'key-value' to enable key-value persistence mode.
   * @since v6.2.0
   */
  /// DpcKeyValue.mode
  /**
   * The storagePrefix property lets you specify an optional prefix for the database
   * table names used in key-value mode.
   *
   * This is useful when you have multiple stores or applications sharing the same
   * Durable Object SQL storage and want to avoid table name conflicts.
   *
   * The prefix will be sanitized to only include alphanumeric characters and underscores.
   * For example, a prefix of 'my-app!' becomes 'my_app_'.
   *
   * @example
   * This example shows how the storagePrefix affects table names:
   *
   * ```js
   * // With storagePrefix: 'user_data_'
   * // Creates tables: user_data_tinybase_tables, user_data_tinybase_values
   *
   * const config = {
   *   mode: 'key-value',
   *   storagePrefix: 'user_data_'
   * };
   * ```
   *
   * @since v6.2.0
   */
  /// DpcKeyValue.storagePrefix
}

/**
 * The DurableObjectSqlDatabasePersisterConfig type represents the union of all
 * possible configuration types for a DurableObjectSqlStoragePersister.
 *
 * This allows the persister to support multiple persistence modes:
 * - JSON mode (via DpcJson): Stores the entire Store as JSON in a single row
 * - Key-value mode (via DpcKeyValue): Stores each piece of data as separate rows
 * - Tabular mode (via DpcTabular): Maps TinyBase tables to database tables
 *
 * @example
 * This example shows the different configuration options:
 *
 * ```js
 * // JSON mode (default)
 * const jsonConfig = {
 *   mode: 'json',
 *   storeTableName: 'my_store'
 * };
 *
 * // Key-value mode
 * const kvConfig = {
 *   mode: 'key-value',
 *   storagePrefix: 'app_'
 * };
 *
 * // Tabular mode
 * const tabularConfig = {
 *   mode: 'tabular',
 *   tables: {
 *     load: {pets: 'pets_table'},
 *     save: {pets: 'pets_table'}
 *   }
 * };
 * ```
 *
 * @category Configuration
 * @since v6.2.0
 */
/// DurableObjectSqlDatabasePersisterConfig

/**
 * The DurableObjectSqlStoragePersister interface represents a Persister that lets
 * you save and load Store data to and from Cloudflare Durable Object SQL storage.
 *
 * You should use the createDurableObjectSqlStoragePersister function to create a
 * DurableObjectSqlStoragePersister object, most likely within the createPersister
 * method of a WsServerDurableObject.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getSqlStorage method for accessing a reference to the SQL storage that the
 * Store is being persisted to.
 * @category Persister
 * @since v6.2.0
 */
/// DurableObjectSqlStoragePersister
{
  /**
   * The getSqlStorage method returns a reference to the SQL storage that the Store is
   * being persisted to.
   * @returns The reference to the SQL storage.
   * @example
   * This example creates a Persister object against a newly-created Store
   * (within the createPersister method of a WsServerDurableObject instance) and
   * then gets the SQL storage reference back out again.
   *
   * ```js yolo
   * import {createMergeableStore} from 'tinybase';
   * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   createPersister() {
   *     const store = createMergeableStore();
   *     const persister = createDurableObjectSqlStoragePersister(
   *       store,
   *       this.ctx.storage.sql,
   *     );
   *     console.log(persister.getSqlStorage() == this.ctx.storage.sql);
   *     // -> true
   *
   *     return persister;
   *   }
   * }
   * ```
   * @category Getter
   * @since v6.2.0
   */
  /// DurableObjectSqlStoragePersister.getSqlStorage
}
/**
 * The createDurableObjectSqlStoragePersister function creates a
 * DurableObjectSqlStoragePersister object that can persist the Store to and from
 * Cloudflare Durable Object SQLite storage.
 *
 * You will mostly use this within the createPersister method of a
 * WsServerDurableObject.
 *
 * This persister uses Cloudflare's SQLite storage backend, which provides better
 * pricing and performance compared to the legacy Key-value storage backend.
 *
 * **Important Prerequisites:**
 * Before using this persister, you must configure your Durable Object class to use
 * SQLite storage by adding a migration to your Wrangler configuration file. In your
 * `wrangler.toml`, add:
 *
 * ```toml
 * [[migrations]]
 * tag = "v1"
 * new_sqlite_classes = ["YourDurableObjectClass"]
 * ```
 *
 * Or in your `wrangler.json`, add:
 *
 * ```json
 * {
 *   "migrations": [
 *     {
 *       "tag": "v1",
 *       "new_sqlite_classes": ["YourDurableObjectClass"]
 *     }
 *   ]
 * }
 * ```
 *
 * For more details on Durable Object migrations, see the
 * {@link https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/ | Cloudflare documentation}.
 *
 * A DurableObjectSqlStoragePersister supports both regular Store objects and
 * MergeableStore objects. When used with a MergeableStore, it can persist the
 * complete CRDT metadata required for proper merging operations.
 *
 * A database Persister uses one of three modes: either a JSON serialization of
 * the whole Store stored in a single row of a table (the default), a key-value
 * mode that stores each piece of data separately to avoid Cloudflare's 2MB row
 * limit, or a tabular mapping of Table Ids to database table names and vice-versa).
 *
 * **JSON Mode (Default)**: Stores the entire Store as JSON in a single database
 * row. This is efficient for smaller stores but may hit Cloudflare's 2MB row
 * limit for very large stores. Uses fewer database writes.
 *
 * **Key-Value Mode**: Stores each table, row, cell, and value as separate database
 * rows. Use this mode if you're concerned about hitting Cloudflare's 2MB row
 * limit with large stores in JSON mode. This mode creates more database writes
 * but avoids row size limitations.
 *
 * **Tabular Mode**: Maps TinyBase tables directly to database tables for
 * traditional relational database usage.
 *
 * The third argument is a DatabasePersisterConfig object that configures which
 * of those modes to use, and settings for each. If the third argument is simply
 * a string, it is used as the `storeTableName` property of the JSON
 * serialization. If it is the string 'key-value', it enables key-value mode.
 *
 * See the documentation for the DpcJson, DpcKeyValue, and DpcTabular types for more
 * information on how all of those modes can be configured.
 *
 * As well as providing a reference to the Store or MergeableStore to persist, you must
 * provide a `sqlStorage` parameter which identifies the Durable Object SQLite storage to
 * persist it to.
 * @param store The Store or MergeableStore to persist.
 * @param sqlStorage The Durable Object SQL storage to persist the Store to.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization, or 'key-value' to enable key-value mode).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new DurableObjectSqlStoragePersister object.
 * @example
 * This example creates a DurableObjectSqlStoragePersister object and persists the
 * Store to Durable Object SQLite storage as a JSON serialization into the default
 * `tinybase` table. It uses this within the createPersister method of a
 * WsServerDurableObject instance.
 *
 * ```js yolo
 * import {createMergeableStore} from 'tinybase';
 * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectSqlStoragePersister(
 *       store,
 *       this.ctx.storage.sql,
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @example
 * This example creates a DurableObjectSqlStoragePersister object with a custom
 * table name and SQL command logging for debugging.
 *
 * ```js yolo
 * import {createMergeableStore} from 'tinybase';
 * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectSqlStoragePersister(
 *       store,
 *       this.ctx.storage.sql,
 *       'my_app_store',
 *       (sql, params) => console.log('SQL:', sql, params),
 *       (error) => console.error('Persistence error:', error),
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @example
 * This example creates a DurableObjectSqlStoragePersister object using key-value
 * mode to avoid Cloudflare's 2MB row limit for large stores.
 *
 * ```js yolo
 * import {createMergeableStore} from 'tinybase';
 * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectSqlStoragePersister(
 *       store,
 *       this.ctx.storage.sql,
 *       'key-value',
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @example
 * This example creates a DurableObjectSqlStoragePersister object using key-value
 * mode with a custom storage prefix.
 *
 * ```js yolo
 * import {createMergeableStore} from 'tinybase';
 * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectSqlStoragePersister(
 *       store,
 *       this.ctx.storage.sql,
 *       {mode: 'key-value', storagePrefix: 'my_app_'},
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @example
 * This example creates a DurableObjectSqlStoragePersister object with tabular
 * mapping configuration for direct table-to-table persistence.
 *
 * ```js yolo
 * import {createMergeableStore} from 'tinybase';
 * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectSqlStoragePersister(
 *       store,
 *       this.ctx.storage.sql,
 *       {
 *         mode: 'tabular',
 *         tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 *       },
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @category Creation
 * @since v6.2.0
 */
/// createDurableObjectSqlStoragePersister
