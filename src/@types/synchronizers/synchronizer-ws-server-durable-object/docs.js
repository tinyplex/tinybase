/**
 * The synchronizer-ws-server-durable-object module of the TinyBase project lets
 * you create a server that facilitates synchronization between clients, running
 * as a Cloudflare Durable Object.
 * @see Cloudflare Durable Objects guide
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
 *
 * The WsServerDurableObject is an overridden implementation of the
 * DurableObject class, so you can have access to its members as well as the
 * TinyBase-specific methods. If you are using the storage for other data, you
 * may want to configure a `prefix` parameter to ensure you don't accidentally
 * collide with TinyBase data.
 *
 * Always remember to call the `super` implementations of the methods that
 * TinyBase uses (the constructor, `fetch`, `webSocketMessage`, and
 * `webSocketClose`) if you further override them.
 * @category Creation
 * @since v5.4.0
 */
/// WsServerDurableObject
{
  /**
   * The constructor is used to create the Durable Object that will synchronize
   * the TinyBase clients.
   *
   * For basic TinyBase synchronization and persistence, you don't need to
   * override this method, but if you do, ensure you call the `super`
   * constructor
   * with the two parameters.
   * @param ctx The DurableObjectState context.
   * @param env The DurableObjectState environment.
   * @returns A new instance of the WsServerDurableObject.
   * @category Creation
   * @since v5.4.0
   */
  /// WsServerDurableObject.constructor
  /**
   * The createPersister method is used to return a persister for the Durable
   * Object to preserve Store data when clients are not connected.
   *
   * In other words, override this method to enable persistence of the Store
   * data that the Durable Object is synchronizing between clients.
   *
   * This should almost certainly return a DurableObjectStoragePersister,
   * created with the createDurableObjectStoragePersister function. This will
   * ensure that the Store is serialized to the Durable Object KV-based storage.
   *
   * Returning `undefined` from this method will disable persistence.
   * @example
   * This example enables Durable Object persistence by creating a Persister
   * object within the createPersister method of a WsServerDurableObject.
   *
   * ```js yolo
   * import {createMergeableStore} from 'tinybase';
   * import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage';
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
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
   * @returns A new instance of a DurableObjectStoragePersister (or a promise to
   * resolve one) that will be used to persist data to the Durable Object.
   * Return `undefined` if that functionality is not required.
   * @category Creation
   * @since v5.4.0
   */
  /// WsServerDurableObject.createPersister
  /**
   * The getPathId method is used to get the Id of the path that is being
   * served.
   *
   * This is useful for when you want to know which path the current Durable
   * Object is serving - for the purposes of logging, for example.
   * @returns The Id of the path being served by the Durable Object.
   * @example
   * This example logs the path being served by the Durable Object every time a
   * synchronization method is handled.
   *
   * ```js yolo
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   onMessage() {
   *     console.info('Message received on path: ', this.getPathId());
   *   }
   * }
   * ```
   * @category Getter
   * @since v5.4.0
   */
  /// WsServerDurableObject.getPathId
  /**
   * The getClientIds method is used to access a list of all the connected
   * clients on the path.
   *
   * Note that if you call this method from within the onClientId method as a
   * client is getting removed, it will still be returned in the list of client
   * Ids.
   * @returns The Ids of the clients being served by the Durable Object.
   * @example
   * This example logs the list of clients being served by the Durable Object
   * every time a synchronization method is handled.
   *
   * ```js yolo
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   onMessage() {
   *     console.info('Clients on path: ', this.getClientIds());
   *   }
   * }
   * ```
   * @category Getter
   * @since v5.4.0
   */
  /// WsServerDurableObject.getClientIds
  /**
   * The onPathId method is called when the first client connects to, or the
   * last client disconnects from, the server with a given path Id.
   *
   * This method is called with the path Id and an IdAddedOrRemoved flag
   * indicating whether it this is being triggered by the first client joining
   * (`1`) or the last client leaving (`-1`).
   * @param pathId The Id of the path being served by the Durable Object.
   * @param addedOrRemoved Whether the path had the first joiner, or the last
   * leaver.
   * @example
   * This example logs the Id of the path being served by the Durable Object
   * when the first client joins (the path Id is 'added'), and when the last
   * client leaves (the path Id is 'removed').
   *
   * ```js yolo
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   onPathId(pathId, addedOrRemoved) {
   *     console.info(
   *       (addedOrRemoved == 1 ? 'Added' : 'Removed') + ` path ${pathId}`,
   *     );
   *   }
   * }
   * ```
   * @category Event
   * @since v5.4.0
   */
  /// WsServerDurableObject.onPathId
  /**
   * The onClientId method is called when a client connects to, or disconnects
   * from, the server.
   *
   * This method is called with the path Id, the client Id, and an
   * IdAddedOrRemoved flag indicating whether it this is being triggered by
   * the client joining (`1`) or the client leaving (`-1`).
   *
   * Note that if you call the getClientIds method from within this method as a
   * client is getting removed, it will still be returned in the list of client
   * Ids.
   * @param pathId The Id of the path being served by the Durable Object.
   * @param clientId The Id of the client joining or leaving.
   * @param addedOrRemoved Whether the client is joining or leaving.
   * @example
   * This example logs every client that joins (the client Id is 'added') or
   * leaves (the client Id is 'removed') on the path being served by the Durable
   * Object.
   *
   * ```js yolo
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   onClientId(pathId, clientId, addedOrRemoved) {
   *     console.info(
   *       (addedOrRemoved == 1 ? 'Added' : 'Removed') +
   *         ` client ${clientId} on path ${pathId}`,
   *     );
   *   }
   * }
   * ```
   * @category Event
   * @since v5.4.0
   */
  /// WsServerDurableObject.onClientId
  /**
   * The onMessage method is called when a message is handled by the server.
   *
   * This is useful if you want to debug the synchronization process, though be
   * aware that this method is called very frequently. It is called with the Id
   * of the client the message came _from_, the Id of the client the message
   * is to be forwarded _to_, and the remainder of the message itself.
   *
   * Since this method is called often, it should be performant. The path Id is
   * not passed as an argument, since it has a small cost to provide by default.
   * You can use the getPathId method yourself if that information is needed.
   * @param fromClientId The Id of the client that send the message.
   * @param toClientId The Id of the client to receive the message (or empty for
   * a broadcast).
   * @param remainder The remainder of the body of the message.
   * @example
   * This example logs every message routed by the Durable Object between
   * clients.
   *
   * ```js yolo
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   onMessage(fromClientId, toClientId, remainder) {
   *     console.info(
   *       `Message from '${fromClientId}' to '${toClientId}': ${remainder}`,
   *     );
   *   }
   * }
   * ```
   * @category Event
   * @since v5.4.0
   */
  /// WsServerDurableObject.onMessage
}

/**
 * The getWsServerDurableObjectFetch function returns a convenient handler for a
 * Cloudflare worker to route requests to the fetch handler of a
 * WsServerDurableObject for the given namespace.
 *
 * The implementation of the function that this returns requires the request to
 * be a WebSocket 'Upgrade' request, and for the client to have provided a
 * `sec-websocket-key` header that the server can use as a unique key for the
 * client.
 *
 * It then takes the path of the HTTP request and routes the upgrade request to
 * a Durable Object (in the given namespace) for that path. From then on, the
 * Durable Object handles all the WebSocket communication.
 *
 * Note that you'll need to have a Wrangler configuration that connects your
 * Durable Object class to the namespace. In other words, you'll have something
 * like this in your `wrangler.toml` file.
 *
 * ```toml
 * [[durable_objects.bindings]]
 * name = "MyDurableObjects"
 * class_name = "MyDurableObject"
 * ```
 *
 * Note that it is not required to use this handler to route TinyBase client
 * requests in your Cloudflare app. If you have your own custom routing logic,
 * path scheme, or authentication, for example, you can easily implement that in
 * the worker's fetch method yourself. See the [Durable Objects
 * documentation](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/#invoking-the-fetch-handler)
 * for examples.
 *
 * You can also pass a newly created request to the Durable Object's `fetch`
 * method. For example, you can overwrite the 'path' that the Durable Object
 * thinks it is serving, perhaps to inject a unique authenticated user Id that
 * wasn't actually provided by the client WebSocket.
 * @param namespace A string for the namespace of the Durable Objects that you
 * want this worker to route requests to.
 * @returns A fetch handler that routes WebSocket upgrade requests to a Durable
 * Object.
 * @example
 * This example sets up default routing of the WebSocket upgrade request to a
 * Durable Object in the `MyDurableObjects` namespace. This would require the
 * `wrangler.toml` configuration shown above.
 *
 * ```js yolo
 * import {
 *   WsServerDurableObject,
 *   getWsServerDurableObjectFetch,
 * } from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
 *
 * export class MyDurableObject extends WsServerDurableObject {}
 *
 * export default {fetch: getWsServerDurableObjectFetch('MyDurableObjects')};
 * ```
 * @category Creation
 * @since v5.4.0
 */
/// getWsServerDurableObjectFetch
