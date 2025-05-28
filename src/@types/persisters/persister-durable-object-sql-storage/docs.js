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
 * The DurableObjectSqlStoragePersister uses SQL tables to store TinyBase data,
 * creating structured tables for tables and values with proper CRDT metadata
 * including timestamps and hashes for merging operations.
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
 * As well as providing a reference to the Store or MergeableStore to persist, you must
 * provide a `sqlStorage` parameter which identifies the Durable Object SQLite storage to
 * persist it to.
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
