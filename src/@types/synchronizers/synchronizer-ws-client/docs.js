/**
 * The synchronizer-ws module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances via WebSockets
 * facilitated by a server.
 * @see Synchronizing Data guide
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
 * It is a minor extension to the Synchronizer interface and simply provides an
 * extra getWebSocket method for accessing a reference to the WebSocket being
 * used.
 *
 * You should use the createWsSynchronizer function to create a WsSynchronizer
 * object.
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
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
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
   * synchronizer.destroy();
   * server.destroy();
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
 * As well as providing a reference to the MergeableStore to persist, you can
 * provide a configured WebSocket to send synchronization messages over.
 *
 * This method is asynchronous because it will await the websocket's connection
 * to the server. You will need to `await` a call to this function or handle the
 * return type natively as a Promise.
 * @param store The MergeableStore to synchronize.
 * @param webSocket The WebSocket to send synchronization messages over.
 * @param requestTimeoutSeconds An optional time in seconds that the
 * Synchronizer will wait for responses to request messages, defaulting to 1.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to synchronize data. This is
 * suitable for debugging synchronization issues in a development environment.
 * @returns A reference to the new WsSynchronizer object.
 * @example
 * This example creates two WsSynchronizer objects to synchronize one
 * MergeableStore to another via a server.
 *
 * ```js
 * import {WebSocketServer, WebSocket} from 'ws';
 * import {createMergeableStore} from 'tinybase';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 *
 * const server = createWsServer(new WebSocketServer({port: 8047}));
 *
 * const store1 = createMergeableStore();
 * const store2 = createMergeableStore();
 *
 * const synchronizer1 = await createWsSynchronizer(
 *   store1,
 *   new WebSocket('ws://localhost:8047'),
 * );
 * const synchronizer2 = await createWsSynchronizer(
 *   store2,
 *   new WebSocket('ws://localhost:8047'),
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
 * synchronizer1.destroy();
 * synchronizer2.destroy();
 * server.destroy();
 * ```
 * @category Creation
 * @since v5.0.0
 */
/// createWsSynchronizer
