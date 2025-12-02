/**
 * The persister-durable-object-sql-storage module of the TinyBase project lets
 * you save and load Store data to and from Cloudflare Durable Object SQLite
 * storage (in an appropriate environment).
 *
 * Cloudflare's SQLite storage backend for Durable Objects offers significantly
 * better pricing compared to the key-value storage backend. The SQLite storage
 * backend is Cloudflare's recommended storage option for new Durable Object
 * namespaces.
 *
 * **Important:** Before using this persister, you must configure your Durable
 * Object class to use SQLite storage by adding a migration to your
 * `wrangler.toml` or `wrangler.json` configuration file. Use
 * `new_sqlite_classes` in your migration configuration to enable SQLite storage
 * for your Durable Object class.
 *
 * See [Cloudflare's
 * documentation](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)
 * for more details.
 * @see Cloudflare Durable Objects guide
 * @see Persistence guides
 * @packageDocumentation
 * @module persister-durable-object-sql-storage
 * @since v6.3.0
 */
/// persister-durable-object-sql-storage

/**
 * The DpcFragmented type represents the configuration for fragmented
 * persistence mode in a DurableObjectSqlStoragePersister.
 *
 * This mode stores each table, row, cell, and value as separate database rows,
 * avoiding Cloudflare's 2MB row limit that can be hit with large stores in JSON
 * mode. While this creates more database writes, it provides better scalability
 * for larger datasets.
 * @example
 * This example shows how to configure a DurableObjectSqlStoragePersister to use
 * fragmented mode with a custom storage prefix.
 *
 * ```js yolo
 * import {createMergeableStore} from 'tinybase';
 * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * const config = {
 *   mode: 'fragmented',
 *   storagePrefix: 'my_app_',
 * };
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectSqlStoragePersister(
 *       store,
 *       this.ctx.storage.sql,
 *       config,
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @category Configuration
 * @since v6.3.0
 */
/// DpcFragmented
{
  /**
   * The mode property must be set to 'fragmented' to enable fragmented
   * persistence mode.
   * @category Configuration
   * @since v6.3.0
   */
  /// DpcFragmented.mode
  /**
   * The storagePrefix property lets you specify an optional prefix for the
   * database table names used in fragmented mode.
   *
   * This is useful when you have multiple stores or applications sharing the
   * same Durable Object SQL storage and want to avoid table name conflicts.
   *
   * The prefix will be sanitized to only include alphanumeric characters and
   * underscores. For example, a prefix of 'my-app!' becomes 'my_app_'.
   * @example
   * This example shows a configuration using the storagePrefix setting. With a
   * `storagePrefix` of 'user_data_', it creates `user_data_tinybase_tables` and
   * `user_data_tinybase_values` tables.
   * ```json
   * {
   *   mode: 'fragmented',
   *   storagePrefix: 'user_data_',
   * };
   * ```
   * @category Configuration
   * @since v6.3.0
   */
  /// DpcFragmented.storagePrefix
}

/**
 * The DurableObjectSqlDatabasePersisterConfig type represents the union of all
 * possible configuration types for a DurableObjectSqlStoragePersister.
 *
 * This allows the persister to support multiple persistence modes.
 * - JSON mode (via DpcJson): Stores the entire Store as JSON in a single row.
 * - Fragmented mode (via DpcFragmented): Stores each piece of data as separate
 *   rows.
 * @example
 * These examples show some different configuration options.
 * ```json
 * // JSON mode (default)
 * {
 *   mode: 'json',
 *   storeTableName: 'my_store',
 * };
 *
 * // Fragmented mode
 * {
 *   mode: 'fragmented',
 *   storagePrefix: 'app_',
 * };
 * ```
 * @category Configuration
 * @since v6.3.0
 */
/// DurableObjectSqlDatabasePersisterConfig

/**
 * The DurableObjectSqlStoragePersister interface represents a Persister that
 * lets you save and load Store data to and from Cloudflare Durable Object SQL
 * storage.
 *
 * You should use the createDurableObjectSqlStoragePersister function to create
 * a DurableObjectSqlStoragePersister object, most likely within the
 * createPersister method of a WsServerDurableObject.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getSqlStorage method for accessing a reference to the SQL storage that
 * the Store is being persisted to.
 * @category Persister
 * @since v6.3.0
 */
/// DurableObjectSqlStoragePersister
{
  /**
   * The getSqlStorage method returns a reference to the SQL storage that the
   * Store is being persisted to.
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
   * @since v6.3.0
   */
  /// DurableObjectSqlStoragePersister.getSqlStorage
}
/**
 * The createDurableObjectSqlStoragePersister function creates a
 * DurableObjectSqlStoragePersister object that can persist the Store to and
 * from Cloudflare Durable Object SQLite storage.
 *
 * You will mostly use this within the createPersister method of a
 * WsServerDurableObject.
 *
 * This persister uses Cloudflare's SQLite storage backend, which provides
 * better pricing and performance compared to the legacy Key-value storage
 * backend.
 *
 * **Important Prerequisites:** Before using this persister, you must configure
 * your Durable Object class to use SQLite storage by adding a migration to your
 * Wrangler configuration file. In your `wrangler.toml`, add the following.
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
 * For more details on Durable Object migrations, see the [Cloudflare
 * documentation](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/).
 *
 * A database Persister uses one of two modes: either a JSON serialization of
 * the whole Store stored in a single row of a table (the default), a fragmented
 * mode that stores each piece of data separately to avoid Cloudflare's 2MB row
 * limit.
 *
 * - **JSON Mode (Default)**: Stores the entire Store as JSON in a single
 *   database row. This is efficient for smaller stores but may hit Cloudflare's
 *   2MB row limit for very large stores and uses fewer database writes.
 *
 * - **Fragmented Mode**: Stores each table, row, cell, and value as separate
 *   database rows. Use this mode if you're concerned about hitting Cloudflare's
 *   2MB row limit with large stores in JSON mode. This mode creates more
 *   database writes but avoids row size limitations.
 *
 * The third argument is a DatabasePersisterConfig object that configures which
 * of those modes to use, and settings for each. If the third argument is simply
 * a string, it is used as the `storeTableName` property of the JSON
 * serialization. If it is the string 'fragmented', it enables fragmented mode.
 *
 * See the documentation for the DpcJson, DpcFragmented, and DpcTabular types
 * for more information on how all of those modes can be configured.
 *
 * Note: When using tabular mode, SQL NULL values are loaded as TinyBase null
 * values, making tables dense (every Row has every Cell). See the Database
 * Persistence guide for details.
 *
 * As well as providing a reference to the Store or MergeableStore to persist,
 * you must provide a `sqlStorage` parameter which identifies the Durable Object
 * SQLite storage to persist it to.
 * @param store The Store or MergeableStore to persist.
 * @param sqlStorage The Durable Object SQL storage to persist the Store to.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new DurableObjectSqlStoragePersister object.
 * @example
 * This example creates a DurableObjectSqlStoragePersister object and persists
 * the Store to Durable Object SQLite storage as a JSON serialization into the
 * default `tinybase` table. It uses this within the createPersister method of a
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
 * This example creates a DurableObjectSqlStoragePersister object using
 * fragmented mode to avoid Cloudflare's 2MB row limit for large stores.
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
 *       {mode: 'fragmented'},
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @example
 * This example creates a DurableObjectSqlStoragePersister object using
 * fragmented mode with a custom storage prefix.
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
 *       {mode: 'fragmented', storagePrefix: 'my_app_'},
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @category Creation
 * @essential Persisting stores
 * @since v6.3.0
 */
/// createDurableObjectSqlStoragePersister
