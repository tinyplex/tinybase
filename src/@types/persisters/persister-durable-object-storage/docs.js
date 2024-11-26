/**
 * The persister-durable-object-storage module of the TinyBase project lets you
 * save and load Store data to and from Cloudflare Durable Object storage (in an
 * appropriate environment).
 * @see Persistence guides
 * @packageDocumentation
 * @module persister-durable-object-storage
 * @since v5.4.0
 */
/// persister-durable-object-storage
/**
 * The DurableObjectStoragePersister interface represents a Persister that lets
 * you save and load Store data to and from Cloudflare Durable Object storage.
 *
 * You should use the createDurableObjectStoragePersister function to create a
 * DurableObjectStoragePersister object, most likely within the createPersister
 * method of a WsServerDurableObject.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getStorage method for accessing a reference to the storage that the
 * Store is being persisted to.
 * @category Persister
 * @since v5.4.0
 */
/// DurableObjectStoragePersister
{
  /**
   * The getStorage method returns a reference to the storage that the Store is
   * being persisted to.
   * @returns The reference to the storage.
   * @example
   * This example creates a Persister object against a newly-created Store
   * (within the createPersister method of a WsServerDurableObject instance) and
   * then gets the storage reference back out again.
   *
   * ```js yolo
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   * import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage';
   * import {createMergeableStore} from 'tinybase';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   createPersister() {
   *     const store = createMergeableStore();
   *     const persister = createDurableObjectStoragePersister(
   *       store,
   *       this.ctx.storage,
   *     );
   *     console.log(persister.getStorage() == this.ctx.storage);
   *     // -> true
   *
   *     return persister;
   *   }
   * }
   * ```
   * @category Getter
   * @since v5.4.0
   */
  /// DurableObjectStoragePersister.getStorage
}
/**
 * The createDurableObjectStoragePersister function creates a
 * DurableObjectStoragePersister object that can persist the Store to and from
 * Cloudflare Durable Object storage.
 *
 * You will mostly use this within the createPersister method of a
 * WsServerDurableObject.
 *
 * A DurableObjectStoragePersister only supports MergeableStore objects, and
 * cannot be used to persist a regular Store.
 *
 * Durable Objects have limitations on the data that can be stored in each key
 * of their key-value structure. The DurableObjectStoragePersister uses one key
 * per TinyBase Value, one key per Cell, one key per Row, and one key per Table.
 * Mostly this is CRDT metadata, but the main caution is to ensure that each
 * individual TinyBase Cell and Value data does not exceed the (128 KiB) limit.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a `storage` parameter which identifies the Durable Object storage to
 * persist it to.
 * @param store The MergeableStore to persist.
 * @param storage The Durable Object storage to persist the Store to.
 * @param storagePrefix An optional prefix to use on the keys in storage, which
 * is useful if you want to ensure the Persister will not affect unrelated
 * Durable Object storage. Defaults to an empty string.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new DurableObjectStoragePersister object.
 * @example
 * This example creates a Persister object against a newly-created
 * MergeableStore (within the createPersister method of a WsServerDurableObject
 * instance) and then gets the storage reference back out again.
 *
 * ```js yolo
 * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 * import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage';
 * import {createMergeableStore} from 'tinybase';
 *
 * export class MyDurableObject extends WsServerDurableObject {
 *   createPersister() {
 *     const store = createMergeableStore();
 *     const persister = createDurableObjectStoragePersister(
 *       store,
 *       this.ctx.storage,
 *     );
 *     return persister;
 *   }
 * }
 * ```
 * @category Creation
 * @since v5.4.0
 */
/// createDurableObjectStoragePersister
