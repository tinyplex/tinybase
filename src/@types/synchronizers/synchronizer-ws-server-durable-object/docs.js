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
 * @essential Synchronizing stores
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
   * ```js ignore
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
   * ```js ignore
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
   * ```js ignore
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
   * The getFragmentSize method is used to specify a target maximum UTF-8 byte
   * size for each WebSocket message fragment sent by the Durable Object.
   * Unicode code points are never split and can exceed this size. TinyBase
   * sends at most 1,000 fragments for one payload, increasing the target when
   * needed.
   *
   * Return a number to split larger synchronization payloads into fragments
   * that are reassembled by the receiving WsSynchronizer. Return `undefined`
   * to send each payload as a single WebSocket message.
   * @returns The target maximum fragment size, or `undefined` to disable
   * fragmentation.
   * @example
   * This example limits outbound Durable Object synchronization message
   * fragments to 32KB.
   *
   * ```js ignore
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   getFragmentSize() {
   *     return 32 * 1024;
   *   }
   * }
   * ```
   * @category Getter
   * @since v9.0.0
   */
  /// WsServerDurableObject.getFragmentSize
  /**
   * The getRequestTimeoutSeconds method is used to specify how long the Durable
   * Object will wait for synchronization responses and incomplete fragments.
   *
   * Return a number of seconds to use as the timeout. The default is `1`.
   * @returns The number of seconds to wait before timing out.
   * @example
   * This example waits up to 10 seconds for synchronization responses and
   * incomplete fragments.
   *
   * ```js ignore
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   getRequestTimeoutSeconds() {
   *     return 10;
   *   }
   * }
   * ```
   * @category Getter
   * @since v9.0.0
   */
  /// WsServerDurableObject.getRequestTimeoutSeconds
  /**
   * The onIgnoredError method is called when the Durable Object receives an
   * invalid synchronization protocol message. The sending client is
   * disconnected after this method is called. The default implementation does
   * nothing.
   * @param error The error that was encountered.
   * @example
   * This example logs ignored Durable Object synchronization errors.
   *
   * ```js ignore
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   onIgnoredError(error) {
   *     console.error(error);
   *   }
   * }
   * ```
   * @category Event
   * @since v9.3.0
   */
  /// WsServerDurableObject.onIgnoredError
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
   * ```js ignore
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
   * ```js ignore
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
   * ```js ignore
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
  /**
   * The authorize method is used to decide whether a client may join the path
   * that the Durable Object serves, and if so, how.
   *
   * It is called with the Id of the path and the WebSocket upgrade request,
   * from which you can read a token (from the URL query string, for example)
   * or a cookie. Return a ClientAccess object to let the client join, or
   * `undefined` to refuse it, in which case the upgrade request receives a
   * `403` response. It can be asynchronous. If it throws, the client is
   * refused.
   *
   * The ClientAccess object is kept with the client's WebSocket, so it
   * survives the Durable Object hibernating, and its serialized form should be
   * no larger than Cloudflare's 2,048-byte attachment limit.
   *
   * Overriding this method, or either of the canWriteCell and canWriteValue
   * methods, makes the Durable Object's MergeableStore the only peer that its
   * clients synchronize with, so that everything they read and write passes
   * through it. If you do not also override the createPersister method, the
   * Durable Object uses an in-memory MergeableStore, which does not survive
   * the Durable Object being evicted.
   *
   * Since this makes the `fetch` method asynchronous, remember to await the
   * `super` implementation if you further override that too.
   * @param pathId The Id of the path the client wishes to join.
   * @param request The WebSocket upgrade request.
   * @returns A ClientAccess object, or `undefined` to refuse the client, or a
   * Promise of either.
   * @example
   * This example lets staff write to the Durable Object's path, lets customers
   * only read it, and refuses anyone else.
   *
   * ```js ignore
   * import {createMergeableStore} from 'tinybase';
   * import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   createPersister() {
   *     return createDurableObjectSqlStoragePersister(
   *       createMergeableStore(),
   *       this.ctx.storage.sql,
   *     );
   *   }
   *
   *   authorize(pathId, request) {
   *     const token = new URL(request.url).searchParams.get('token');
   *     return token == 'staff'
   *       ? {}
   *       : token == 'customer'
   *         ? {readOnly: true}
   *         : undefined;
   *   }
   * }
   * ```
   * @category Authorization
   * @since v10.1.0
   */
  /// WsServerDurableObject.authorize
  /**
   * The canWriteCell method is used to decide whether a client may write a
   * given Cell.
   *
   * It is called for each Cell in the changes that a writable client sends,
   * including deletions, where the `cell` parameter is `undefined`. It must be
   * synchronous. Cells for which it returns `false` are neither merged into the
   * Durable Object's MergeableStore nor relayed to other clients, and a client
   * that wrote a newer version is brought back into line with the server.
   * @param pathId The Id of the path.
   * @param tableId The Id of the Table.
   * @param rowId The Id of the Row.
   * @param cellId The Id of the Cell.
   * @param cell The new value of the Cell, or `undefined` if it is being
   * deleted.
   * @param context The context from the client's ClientAccess.
   * @returns Whether the client may write the Cell.
   * @example
   * This example lets staff write anything, but lets customers write only to
   * the `orders` Table.
   *
   * ```js ignore
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   authorize(pathId, request) {
   *     return {
   *       context: {role: new URL(request.url).searchParams.get('role')},
   *     };
   *   }
   *
   *   canWriteCell(pathId, tableId, rowId, cellId, cell, {role}) {
   *     return role == 'staff' || tableId == 'orders';
   *   }
   * }
   * ```
   * @category Authorization
   * @since v10.1.0
   */
  /// WsServerDurableObject.canWriteCell
  /**
   * The canWriteValue method is used to decide whether a client may write a
   * given Value.
   *
   * It is called for each Value in the changes that a writable client sends,
   * including deletions, where the `value` parameter is `undefined`. It must be
   * synchronous. Values for which it returns `false` are neither merged into
   * the Durable Object's MergeableStore nor relayed to other clients, and a
   * client that wrote a newer version is brought back into line with the
   * server.
   * @param pathId The Id of the path.
   * @param valueId The Id of the Value.
   * @param value The new Value, or `undefined` if it is being deleted.
   * @param context The context from the client's ClientAccess.
   * @returns Whether the client may write the Value.
   * @example
   * This example lets only staff change the shop's opening hours.
   *
   * ```js ignore
   * import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
   *
   * export class MyDurableObject extends WsServerDurableObject {
   *   authorize(pathId, request) {
   *     return {
   *       context: {role: new URL(request.url).searchParams.get('role')},
   *     };
   *   }
   *
   *   canWriteValue(pathId, valueId, value, {role}) {
   *     return role == 'staff' || valueId != 'openingHours';
   *   }
   * }
   * ```
   * @category Authorization
   * @since v10.1.0
   */
  /// WsServerDurableObject.canWriteValue
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
 * ```js ignore
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
