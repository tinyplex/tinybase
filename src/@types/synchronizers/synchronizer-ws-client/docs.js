/**
 * The synchronizer-ws module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances via WebSockets
 * facilitated by a server.
 * @see Synchronization guide
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module synchronizer-ws-client
 * @since v5.0.0
 */
/// synchronizer-ws-client
/**
 * The WebSocketTypes type represents the valid types of WebSocket that can be
 * used with the WsSynchronizer.
 *
 * This includes the browser-native WebSocket type, as well as the WebSocket
 * type from the well-known `ws` package (such that the Synchronizer can be used
 * in a server environment).
 * @category Creation
 * @since v5.0.0
 */
/// WebSocketTypes
/**
 * The WsSynchronizer interface represents a Synchronizer that lets you
 * synchronize MergeableStore data to and from other MergeableStore instances
 * via WebSockets facilitated by a server.
 *
 * You should use the createWsSynchronizer function to create a WsSynchronizer
 * object.
 *
 * It is a minor extension to the Synchronizer interface and simply provides an
 * extra getWebSocket method for accessing a reference to the WebSocket being
 * used.
 * @category Synchronizer
 * @since v5.0.0
 */
/// WsSynchronizer
{
  /**
   * The getWebSocket method returns a reference to the WebSocket being used for
   * synchronization.
   * @returns The WebSocket reference.
   * @example
   * This example creates a server and WsSynchronizer object for a newly-created
   * MergeableStore and then gets the WebSocket reference back out again.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
   *
   * const server = createWsServer(new WebSocketServer({port: 8046}));
   *
   * const store = createMergeableStore();
   * const webSocket = new WebSocket('ws://localhost:8046');
   * const synchronizer = await createWsSynchronizer(store, webSocket);
   *
   * console.log(synchronizer.getWebSocket() == webSocket);
   * // -> true
   *
   * await synchronizer.destroy();
   * await server.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsSynchronizer.getWebSocket
}
/**
 * The createWsSynchronizer function creates a WsSynchronizer object that can
 * synchronize MergeableStore data to and from other MergeableStore instances
 * via WebSockets facilitated by a WsServer.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a configured WebSocket to send synchronization messages over. The
 * path in the WebSocket URL is used by a WsServer as the path that the client
 * joins. The MergeableStore Id does not select the server path.
 *
 * By default, the WsSynchronizer owns the WebSocket and closes it when it is
 * destroyed. You can instead share one WebSocket between multiple
 * WsSynchronizer instances by constructing it with the `tinybase` WebSocket
 * subprotocol and providing a channel Id as the third argument. Channel Ids
 * are appended to the WebSocket URL path to form the server path. In this
 * mode, destroying a WsSynchronizer unsubscribes its channel, and the
 * WebSocket is closed when the last WsSynchronizer using it is destroyed.
 *
 * Sharing a WebSocket requires a WsServer or WsServerSimple from v9.3 or
 * later. It is not supported by WsServerDurableObject.
 *
 * Instead of the raw browser implementation of WebSocket, you may prefer to use
 * the [Reconnecting
 * WebSocket](https://github.com/pladaria/reconnecting-websocket) wrapper so
 * that if a client goes offline, it can easily re-establish a connection when
 * it comes back online. Its API is compatible with this Synchronizer.
 *
 * You can indicate how long the Synchronizer will wait for responses to message
 * requests before timing out. A final set of optional handlers can be provided
 * to help debug sends, receives, and errors respectively.
 *
 * This method is asynchronous because it will await the websocket's connection
 * to the server. You will need to `await` a call to this function or handle the
 * return type natively as a Promise.
 * @param store The MergeableStore to synchronize.
 * @param webSocket The WebSocket to send synchronization messages over.
 * @param requestTimeoutSeconds An optional time in seconds that the
 * Synchronizer will wait for responses to request messages, defaulting to 1.
 * @param onSend An optional handler for the messages that this Synchronizer
 * sends. This is suitable for debugging synchronization issues in a development
 * environment, since v5.1.
 * @param onReceive An optional handler for the messages that this Synchronizer
 * receives. This is suitable for debugging synchronization issues in a
 * development environment, since v5.1.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to synchronize data. This is
 * suitable for debugging synchronization issues in a development environment.
 * @param fragmentSize An optional maximum size for each WebSocket message
 * fragment. When set, larger synchronization payloads are split into fragments
 * and reassembled by the receiving WsSynchronizer, since v9.0.
 * @returns A reference to the new WsSynchronizer object.
 * @example
 * This example creates two WsSynchronizer objects to synchronize one
 * MergeableStore to another via a server.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * const server = createWsServer(new WebSocketServer({port: 8047}));
 *
 * const store1 = createMergeableStore();
 * const store2 = createMergeableStore();
 *
 * const synchronizer1 = await createWsSynchronizer(
 *   store1,
 *   new WebSocket('ws://localhost:8047/petShop'),
 * );
 * const synchronizer2 = await createWsSynchronizer(
 *   store2,
 *   new WebSocket('ws://localhost:8047/petShop'),
 * );
 *
 * await synchronizer1.startSync();
 * await synchronizer2.startSync();
 *
 * store1.setTables({pets: {fido: {species: 'dog'}}});
 * store2.setTables({pets: {felix: {species: 'cat'}}});
 *
 * // ...
 * console.log(store1.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await synchronizer1.destroy();
 * await synchronizer2.destroy();
 * await server.destroy();
 * ```
 * @example
 * This example creates two WsSynchronizer objects for different
 * MergeableStore instances that share one WebSocket.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * const server = createWsServer(new WebSocketServer({port: 8048}));
 * const webSocket = new WebSocket('ws://localhost:8048/petShop', 'tinybase');
 * const petsSynchronizer = await createWsSynchronizer(
 *   createMergeableStore(),
 *   webSocket,
 *   'pets',
 * );
 * const employeesSynchronizer = await createWsSynchronizer(
 *   createMergeableStore(),
 *   webSocket,
 *   'employees',
 * );
 *
 * console.log(petsSynchronizer.getWebSocket() == webSocket);
 * // -> true
 * console.log(employeesSynchronizer.getWebSocket() == webSocket);
 * // -> true
 *
 * await petsSynchronizer.destroy();
 * console.log(webSocket.readyState == WebSocket.OPEN);
 * // -> true
 *
 * await employeesSynchronizer.destroy();
 * await server.destroy();
 * ```
 * @category Creation
 * @essential Synchronizing stores
 * @since v5.0.0
 */
/// createWsSynchronizer
