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
 * A DurableObjectSqlStoragePersister only supports MergeableStore objects, and
 * cannot be used to persist a regular Store.
 *
 * The DurableObjectSqlStoragePersister uses SQL tables to store TinyBase data,
 * creating structured tables for tables and values with proper CRDT metadata
 * including timestamps and hashes for merging operations.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a `sqlStorage` parameter which identifies the Durable Object SQLite storage to
 * persist it to.
 * @param store The MergeableStore to persist.
 * @param sqlStorage The Durable Object SQL storage to persist the Store to.
 * @param storagePrefix An optional prefix to use on the table names in SQL storage, which
 * is useful if you want to ensure the Persister will not affect unrelated
 * SQL tables. Defaults to an empty string.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new DurableObjectSqlStoragePersister object.
 * @example
 * This example creates a Persister object against a newly-created
 * MergeableStore (within the createPersister method of a WsServerDurableObject
 * instance) and then gets the SQL storage reference back out again.
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
 * @category Creation
 * @since v6.2.0
 */
/// createDurableObjectSqlStoragePersister
