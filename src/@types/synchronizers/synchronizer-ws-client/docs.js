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
   * The getWebSocket method returns reference to the WebSocket being used for
   * synchronization.
   * @returns The WebSocket reference.
   * @example
   * This example creates a server and WsSynchronizer object for a newly-created
   * MergeableStore and then gets the WebSocket reference back out again.
   *
   * ```js
   * import {WebSocketServer, WebSocket} from 'ws';
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
 * The createWsSynchronizer function.
 * @category Creation
 */
/// createWsSynchronizer
