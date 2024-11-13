/**
 * The synchronizer-ws-server-durable-object module of the TinyBase project lets
 * you create a server that facilitates synchronization between clients, running
 * as a Cloudflare Durable Object.
 * @see Synchronization guide
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module synchronizer-ws-server-durable-object
 * @since v5.4.0
 */
/// synchronizer-ws-server-durable-object

/**
 * A WsServerDurableObject is the server component (running as a Cloudflare
 * Durable Object) for synchronization between clients that are using
 * WsSynchronizer instances.
 * @category Creation
 * @since v5.4.0
 */
/// WsServerDurableObject
{
  /**
   * The createPersister method is used to return a persister for the
   * Durable Object to preserve Store state for when clients are not connected.
   *
   * This should almost certainly be a DurableObjectStoragePersister, created
   * with the createDurableObjectStoragePersister function.
   * @example
   * This example creates a Persister object against a newly-created
   * MergeableStore (within the createPersister method of a
   * WsServerDurableObject instance) and then gets the storage reference back
   * out again.
   *
   * ```js yolo
   * import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage';
   * import {createMergeableStore} from 'tinybase';
   *
   * // Within the createPersister method of a WsServerDurableObject instance.
   * const store = createMergeableStore().setTables();
   * const persister = createDurableObjectStoragePersister(
   *   store,
   *   this.ctx.storage,
   * );
   *
   * return persister;
   * ```
   * @category Creation
   * @since v5.4.0
   */
  /// WsServerDurableObject.createPersister
  /**
   * The getPathId method is used to get the Id of the path that is being
   * served.
   * @category Getter
   * @since v5.4.0
   */
  /// WsServerDurableObject.getPathId
  /**
   * The getClientIds method is used to access a list of all the connected
   * clients on a given path.
   *
   * Note that if you call this method from the onClientId method as a client is
   * getting removed, it will still be returned in the list of client Ids.
   * @category Getter
   * @since v5.4.0
   */
  /// WsServerDurableObject.getClientIds
  /**
   * The onPathId method is called when the first client connects to, or the
   * last client disconnects from, the server with a given path Id.
   * @category Event
   * @since v5.4.0
   */
  /// WsServerDurableObject.onPathId
  /**
   * The onClientId method is called when a client connects to, or disconnects
   * from, the server.
   * @category Event
   * @since v5.4.0
   */
  /// WsServerDurableObject.onClientId
  /**
   * The onMessage method is called when a message is handled by the server.
   *
   * Note that this method is potentially called very frequently, and should be
   * performant. A pathId is not passed as an argument, since it has a small
   * cost to provide by default. You can use the getPathId method yourself if
   * that information is needed.
   * @category Event
   * @since v5.4.0
   */
  /// WsServerDurableObject.onMessage
}

/**
 * The getWsServerDurableObjectFetch function returns a convenient fetch handler
 * for a Cloudflare worker to route requests to a WsServerDurableObject for the
 * given namespace.
 * @category Creation
 * @since v5.4.0
 */
/// getWsServerDurableObjectFetch
