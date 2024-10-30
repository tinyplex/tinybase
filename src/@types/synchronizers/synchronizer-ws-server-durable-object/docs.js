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

/**
 * The getWsServerDurableObjectFetch function returns a fetch handler for a
 * CloudFlare worker to route requests to a WsServerDurableObject for the given
 * namespace.
 * @category Creation
 * @since v5.4.0
 */
/// getWsServerDurableObjectFetch
