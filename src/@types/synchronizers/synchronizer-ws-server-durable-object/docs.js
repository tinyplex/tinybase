/**
 * The synchronizer-ws-server-durable-object module of the TinyBase project lets
 * you create a server that facilitates synchronization between clients, running
 * on CloudFlare DurableObjects with the PartyServer API.
 * @see Synchronization guide
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module synchronizer-ws-server-durable-object
 * @since v5.4.0
 */
/// synchronizer-ws-server-durable-object

/**
 * A WsServerDurableObject is the server component (running on CloudFlare
 * DurableObjects with the PartyServer API) for synchronization between clients
 * that are using WsSynchronizer instances.
 * @category Creation
 * @since v5.4.0
 */
/// WsServerDurableObject
{
  /**
   * The getClientIds method is used to access a list of all the connected
   * clients on a given path.
   * @category Getters
   * @since v5.4.0
   */
  /// WsServerDurableObject.getClientIds
  /**
   * The onPathId method is called when the first client connects to, or the
   * last client disconnects from, the server with a given path Id.
   * @category Events
   * @since v5.4.0
   */
  /// WsServerDurableObject.onPathId
  /**
   * The onClientId method is called when a client connects to, or disconnects
   * from, the server.
   * @category Events
   * @since v5.4.0
   */
  /// WsServerDurableObject.onClientId
}

/**
 * The getWsServerDurableObjectFetch function returns a fetch handler for a
 * CloudFlare worker to route requests to a WsServerDurableObject for the given
 * namespace.
 * @category Creation
 * @since v5.4.0
 */
/// getWsServerDurableObjectFetch
