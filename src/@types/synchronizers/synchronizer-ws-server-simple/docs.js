/**
 * The synchronizer-ws-server-simple module of the TinyBase project lets you
 * create a server that facilitates synchronization between clients, without the
 * complications of listeners, persistence, or statistics.
 *
 * This makes it more suitable to be used as a reference implementation for
 * other server environments.
 * @see Synchronization guide
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module synchronizer-ws-server-simple
 * @since v5.4.0
 */
/// synchronizer-ws-server-simple

/**
 * The WsServerSimple interface represents an object that facilitates
 * synchronization between clients that are using WsSynchronizer instances.
 *
 * The core functionality is equivalent to the WsServer interface, but without
 * the complications of listeners, persistence, or statistics.
 *
 * You should use the createWsServerSimple function to create a WsServerSimple
 * object.
 * @category Server
 * @since v5.4.0
 */
/// WsServerSimple
{
  /**
   * The getWebSocketServer method returns a reference to the WebSocketServer
   * being used for this WsServerSimple.
   * @returns The WebSocketServer reference.
   * @example
   * This example creates a WsServerSimple and then gets the WebSocketServer
   * reference back out again.
   *
   * ```js
   * import {createWsServerSimple} from 'tinybase/synchronizers/synchronizer-ws-server-simple';
   * import {WebSocketServer} from 'ws';
   *
   * const webSocketServer = new WebSocketServer({port: 8053});
   * const server = createWsServerSimple(webSocketServer);
   *
   * console.log(server.getWebSocketServer() == webSocketServer);
   * // -> true
   *
   * await server.destroy();
   * ```
   * @category Getter
   * @since v5.4.0
   */
  /// WsServerSimple.getWebSocketServer
  /**
   * The destroy method provides a way to clean up the server at the end of its
   * use.
   *
   * This closes the underlying WebSocketServer that was provided when the
   * WsServerSimple was created. This method is asynchronous.
   * @example
   * This example creates a WsServerSimple and then destroys it again, closing
   * the underlying WebSocketServer.
   *
   * ```js
   * import {createWsServerSimple} from 'tinybase/synchronizers/synchronizer-ws-server-simple';
   * import {WebSocketServer} from 'ws';
   *
   * const webSocketServer = new WebSocketServer({port: 8053});
   * webSocketServer.on('close', () => {
   *   console.log('WebSocketServer closed');
   * });
   * const server = createWsServerSimple(webSocketServer);
   *
   * await server.destroy();
   * // ...
   * // -> 'WebSocketServer closed'
   * ```
   * @category Getter
   * @since v5.4.0
   */
  /// WsServerSimple.destroy
}
/**
 * The createWsServerSimple function creates a WsServerSimple that facilitates
 * synchronization between clients that are using WsSynchronizer instances.
 *
 * This should be run in a server environment, and you must pass in a configured
 * WebSocketServer object in order to create it.
 *
 * The core functionality is equivalent to the WsServer interface, but without
 * the complications of listeners, persistence, or statistics. This makes it
 * more suitable to be used as a reference implementation for other server
 * environments.
 * @param webSocketServer A WebSocketServer object from your server environment.
 * @returns A reference to the new WsServerSimple object.
 * @example
 * This example creates a WsServerSimple that synchronizes two clients on a
 * shared path.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServerSimple} from 'tinybase/synchronizers/synchronizer-ws-server-simple';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * // Server
 * const server = createWsServerSimple(new WebSocketServer({port: 8053}));
 *
 * // Client 1
 * const clientStore1 = createMergeableStore();
 * clientStore1.setCell('pets', 'fido', 'species', 'dog');
 * const synchronizer1 = await createWsSynchronizer(
 *   clientStore1,
 *   new WebSocket('ws://localhost:8053/petShop'),
 * );
 * await synchronizer1.startSync();
 * // ...
 *
 * // Client 2
 * const clientStore2 = createMergeableStore();
 * clientStore2.setCell('pets', 'felix', 'species', 'cat');
 * const synchronizer2 = await createWsSynchronizer(
 *   clientStore2,
 *   new WebSocket('ws://localhost:8053/petShop'),
 * );
 * await synchronizer2.startSync();
 * // ...
 *
 * console.log(clientStore1.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * console.log(clientStore2.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await synchronizer1.destroy();
 * await synchronizer2.destroy();
 * await server.destroy();
 * ```
 * @category Creation
 * @since v5.4.0
 */
/// createWsServerSimple
