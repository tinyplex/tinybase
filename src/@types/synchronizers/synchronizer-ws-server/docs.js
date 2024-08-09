/**
 * The synchronizer-ws-server module of the TinyBase project lets you create
 * a server that facilitates synchronization between clients.
 * @see Synchronization guide
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module synchronizer-ws-server
 * @since v5.0.0
 */
/// synchronizer-ws-server
/**
 * The PathIdsListener type describes a function that is used to listen to
 * changes of active paths that a WsServer is handling.
 *
 * A WsServer listens to any path, allowing an app to have the concept of
 * distinct 'rooms' that only certain clients are participating in. As soon as a
 * single client connects to a new path, this listener will be called with the
 * Id of the new path and an `addedOrRemoved` value of `1`.
 *
 * When the final client disconnects from a path, it will be called again with
 * the Id of the deactivated path and an `addedOrRemoved` value of `-1`.
 *
 * A PathIdsListener is provided when using the addPathIdsListener method. See
 * that method for specific examples.
 * @param wsServer A reference to the WsServer.
 * @param pathId The Id of the path being added or removed.
 * @param addedOrRemoved Whether the path was added (`1`) or removed (`-1`).
 * @category Listener
 * @since v5.0.3
 */
/// PathIdsListener
/**
 * The ClientIdsListener type describes a function that is used to listen to
 * clients joining and leaving the active paths that a WsServer is handling.
 *
 * A WsServer listens to any path, allowing an app to have the concept of
 * distinct 'rooms' that only certain clients are participating in. As soon as a
 * new client connects to a path, this listener will be called with the Id of
 * the path, the Id of the new client, and an `addedOrRemoved` value of `1`.
 *
 * When the client disconnects from a path, it will be called again with the Id
 * of the path, the Id of the leaving client, and an `addedOrRemoved` value of
 * `-1`.
 *
 * A ClientIdsListener is provided when using the addClientIdsListener method.
 * See that method for specific examples.
 * @param wsServer A reference to the WsServer.
 * @param pathId The path that the client joined or left.
 * @param clientId The Id of the client being added or removed.
 * @param addedOrRemoved Whether the client was added (`1`) or removed (`-1`).
 * @category Listener
 * @since v5.0.3
 */
/// ClientIdsListener
/**
 * The WsServerStats type describes the number of paths and clients that are
 * active on the WsServer.
 *
 * A WsServerStats object is returned from the getStats method.
 * @category Development
 * @since v5.0.0
 */
/// WsServerStats
{
  /**
   * The number of paths currently being served by the WsServer.
   * @category Stat
   * @since v5.0.0
   */
  /// WsServerStats.paths
  /**
   * The number of clients currently being served by the WsServer.
   * @category Stat
   * @since v5.0.0
   */
  /// WsServerStats.clients
}
/**
 * The WsServer interface represents an object that facilitates synchronization
 * between clients that are using WsSynchronizer instances.
 *
 * You should use the createWsServer function to create a WsServer object.
 * @category Server
 * @since v5.0.0
 */
/// WsServer
{
  /**
   * The getWebSocketServer method returns a reference to the WebSocketServer
   * being used for this WsServer.
   * @returns The WebSocketServer reference.
   * @example
   * This example creates a WsServer and then gets the WebSocketServer
   * reference back out again.
   *
   * ```js
   * import {WebSocketServer} from 'ws';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   *
   * const webSocketServer = new WebSocketServer({port: 8047});
   * const server = createWsServer(webSocketServer);
   *
   * console.log(server.getWebSocketServer() == webSocketServer);
   * // -> true
   *
   * server.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsServer.getWebSocketServer
  /**
   * The getPathIds method returns the active paths that the WsServer is
   * handling.
   *
   * These will be all the paths that have at least one active client connected
   * to them.
   * @returns An array of the paths that have clients connected to them.
   * @example
   * This example creates a WsServer, sets some clients up to connect
   * to it, and then enumerates the paths being used.
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   * console.log(server.getPathIds());
   * // -> []
   *
   * const synchronizer1 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * const synchronizer2 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * const synchronizer3 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomB'),
   * );
   *
   * console.log(server.getPathIds());
   * // -> ['roomA', 'roomB']
   *
   * synchronizer3.destroy();
   * // ...
   * console.log(server.getPathIds());
   * // -> ['roomA']
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * server.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsServer.getPathIds
  /**
   * The getClientIds method method returns the active clients that the WsServer
   * is handling for a given path.
   * @returns An array of the clients connected to the given path.
   * @example
   * This example creates a WsServer, sets some clients up to connect
   * to it, and then gets the number of clients on the given paths. (The client
   * Ids themselves are unique, based on the `sec-websocket-key` header.)
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   *
   * const synchronizer1 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * const synchronizer2 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * const synchronizer3 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomB'),
   * );
   *
   * console.log(server.getClientIds('roomA').length);
   * // -> 2
   * console.log(server.getClientIds('roomB').length);
   * // -> 1
   *
   * synchronizer3.destroy();
   * // ...
   * console.log(server.getClientIds('roomB').length);
   * // -> 0
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * server.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsServer.getClientIds
  /**
   * The addPathIdsListener method registers a listener function with the
   * WsServer that will be called whenever there is a change in the active paths
   * that a WsServer is handling.
   *
   * The provided listener is a PathIdsListener function, and will be called
   * with a reference to the WsServer and a callback you can use to get
   * information about the change.
   * @param listener The function that will be called whenever the path Ids
   * handled by the WsServer change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a WsServer, and listens to changes to the active paths
   * when clients connect to and disconnect from it.
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   * const listenerId = server.addPathIdsListener(
   *   (server, pathId, addedOrRemoved) => {
   *     console.log(pathId + (addedOrRemoved == 1 ? ' added' : ' removed'));
   *     console.log(server.getPathIds());
   *   },
   * );
   *
   * const synchronizer1 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * // -> 'roomA added'
   * // -> ['roomA']
   *
   * const synchronizer2 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomB'),
   * );
   * // -> 'roomB added'
   * // -> ['roomA', 'roomB']
   *
   * synchronizer1.destroy();
   * // ...
   * // -> 'roomA removed'
   * // -> ['roomB']
   *
   * synchronizer2.destroy();
   * // ...
   * // -> 'roomB removed'
   * // -> []
   *
   * server.delListener(listenerId);
   * server.destroy();
   * ```
   * @category Listener
   * @since v5.0.0
   */
  /// WsServer.addPathIdsListener
  /**
   * The addClientIdsListener method registers a listener function with the
   * WsServer that will be called whenever there is a change in the clients
   * connected to a path that a WsServer is handling.
   *
   * The provided listener is a ClientIdsListener function, and will be called
   * with a reference to the WsServer, the Id of the path that the client joined
   * or left, and a callback you can use to get information about the change.
   *
   * You can either listen to a single path (by specifying its Id as the
   * method's first parameter) or changes to any path (by providing a `null`
   * wildcard).
   * @param pathId The path to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the client Ids on
   * a path handled by the WsServer change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a WsServer, and listens to changes to the clients
   * connecting to and disconnecting from a specific path.
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   * const listenerId = server.addClientIdsListener(
   *   'roomA',
   *   (server, pathId) => {
   *     console.log(
   *       `${server.getClientIds(pathId).length} client(s) in roomA`,
   *     );
   *   },
   * );
   *
   * const synchronizer1 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * // -> '1 client(s) in roomA'
   *
   * const synchronizer2 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomB'),
   * );
   * // The listener is not called.
   *
   * synchronizer1.destroy();
   * // ...
   * // -> '0 client(s) in roomA'
   *
   * synchronizer2.destroy();
   *
   * server.delListener(listenerId);
   * server.destroy();
   * ```
   * @example
   * This example creates a WsServer, and listens to changes to the clients
   * connecting to and disconnecting from any path.
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   * const listenerId = server.addClientIdsListener(null, (server, pathId) => {
   *   console.log(
   *     `${server.getClientIds(pathId).length} client(s) in ${pathId}`,
   *   );
   * });
   *
   * const synchronizer1 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * // -> '1 client(s) in roomA'
   *
   * const synchronizer2 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomB'),
   * );
   * // -> '1 client(s) in roomB'
   *
   * synchronizer1.destroy();
   * // ...
   * // -> '0 client(s) in roomA'
   *
   * synchronizer2.destroy();
   * // ...
   * // -> '0 client(s) in roomB'
   *
   * server.delListener(listenerId);
   * server.destroy();
   * ```
   * @category Listener
   * @since v5.0.0
   */
  /// WsServer.addClientIdsListener
  /**
   * The delListener method removes a listener that was previously added to the
   * WsServer.
   *
   * Use the Id returned by whichever method was used to add the listener. Note
   * that the WsServer may re-use this Id for future listeners added to it.
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the WsServer.
   * @example
   * This example registers a listener to a WsServer and then removes it.
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   * const listenerId = server.addPathIdsListener(() => {
   *   console.log('Paths changed');
   * });
   *
   * const synchronizer = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047/roomA'),
   * );
   * // -> 'Paths changed'
   *
   * server.delListener(listenerId);
   *
   * synchronizer.destroy();
   * // -> undefined
   * // The listener is not called.
   *
   * server.destroy();
   * ```
   * @category Listener
   * @since v5.0.0
   */
  /// WsServer.delListener
  /**
   * The getStats method provides a set of statistics about the WsServer, and is
   * used for debugging purposes.
   *
   * The WsServerStats object contains the number of paths and clients that are
   * active on the WsServer and is intended to be used during development.
   * @returns A WsServerStats object containing statistics.
   * @example
   * This example creates a WsServer that facilitates some synchronization,
   * demonstrating the statistics of the paths and clients handled as a result.
   *
   * ```js
   * import {WebSocket, WebSocketServer} from 'ws';
   * import {createMergeableStore} from 'tinybase';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   *
   * const server = createWsServer(new WebSocketServer({port: 8047}));
   *
   * const synchronizer1 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047'),
   * );
   * const synchronizer2 = await createWsSynchronizer(
   *   createMergeableStore(),
   *   new WebSocket('ws://localhost:8047'),
   * );
   *
   * console.log(server.getStats());
   * // -> {paths: 1, clients: 2}
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * server.destroy();
   * ```
   * @category Development
   * @since v5.0.0
   */
  /// WsServer.getStats
  /**
   * The destroy method provides a way to clean up the server at the end of its
   * use.
   *
   * This closes the underlying WebSocketServer that was provided when the
   * WsServer was created.
   * @example
   * This example creates a WsServer and then destroys it again, closing the
   * underlying WebSocketServer.
   *
   * ```js
   * import {WebSocketServer} from 'ws';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   *
   * const webSocketServer = new WebSocketServer({port: 8047});
   * webSocketServer.on('close', () => {
   *   console.log('WebSocketServer closed');
   * });
   * const server = createWsServer(webSocketServer);
   *
   * server.destroy();
   * // ...
   * // -> 'WebSocketServer closed'
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsServer.destroy
}
/**
 * The createWsServer function creates a WsServer that facilitates
 * synchronization between clients that are using WsSynchronizer instances.
 *
 * This should be run in a server environment, and you must pass in a configured
 * WebSocketServer object in order to create it.
 *
 * If you want your server to persist data itself, you can use the optional
 * second parameter of this function, which allows you to create a Persister for
 * a new path - whenever a new path is accessed by a client. This Persister will
 * only exist when there are active clients on that particular path. The
 * creation callback can be asynchronous.
 *
 * You are responsible for creating a MergeableStore to pass to this Persister,
 * but starting and stopping its automatic saving and loading is taken care of
 * by the WsServer. As a result, the server MergeableStore will be kept in sync
 * with the clients on that path, and in turn with whatever persistence layer
 * you have configured. See the example below.
 *
 * It is not safe to add or manipulate data in the MergeableStore during the
 * `createPersisterForPath` function, since changes will probably be overwritten
 * when the Persister starts. If you wish to modify data - or upgrade a schema,
 * for example - you can have that function instead return an array containing
 * the Persister _and_ a callback that takes the MergeableStore. That callback
 * will get called after the Persister has started, and is an appropriate place
 * to manipulate data in a way that will be transmitted to clients. Again, see
 * the example below.
 * @param webSocketServer A WebSocketServer object from your server environment.
 * @param createPersisterForPath An optional function that will create a
 * Persister to synchronize with the clients on a given path (or a two-item
 * array of Persister and callback that lets you handle data after persistence
 * has started).
 * @returns A reference to the new WsServer object.
 * @example
 * This example creates a WsServer that synchronizes two clients on a shared
 * path.
 *
 * ```js
 * import {WebSocketServer} from 'ws';
 * import {createMergeableStore} from 'tinybase';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 *
 * // Server
 * const server = createWsServer(new WebSocketServer({port: 8047}));
 *
 * // Client 1
 * const clientStore1 = createMergeableStore();
 * clientStore1.setCell('pets', 'fido', 'species', 'dog');
 * const synchronizer1 = await createWsSynchronizer(
 *   clientStore1,
 *   new WebSocket('ws://localhost:8047/petShop'),
 * );
 * await synchronizer1.startSync();
 * // ...
 *
 * // Client 2
 * const clientStore2 = createMergeableStore();
 * clientStore2.setCell('pets', 'felix', 'species', 'cat');
 * const synchronizer2 = await createWsSynchronizer(
 *   clientStore2,
 *   new WebSocket('ws://localhost:8047/petShop'),
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
 * synchronizer1.destroy();
 * synchronizer2.destroy();
 * server.destroy();
 * ```
 * @example
 * This longer example creates a WsServer that persists a MergeableStore to file
 * that is synchronized with two clients on a shared path. Later, when a third
 * client connects, it picks up the data the previous two were using.
 *
 * ```js
 * import {WebSocketServer} from 'ws';
 * import {createFilePersister} from 'tinybase/persisters/persister-file';
 * import {createMergeableStore} from 'tinybase';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {rmSync} from 'fs';
 *
 * // Server
 * const server = createWsServer(
 *   new WebSocketServer({port: 8047}),
 *   (pathId) =>
 *     createFilePersister(
 *       createMergeableStore(),
 *       pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
 *     ),
 * );
 *
 * // Client 1
 * const clientStore1 = createMergeableStore();
 * clientStore1.setCell('pets', 'fido', 'species', 'dog');
 * const synchronizer1 = await createWsSynchronizer(
 *   clientStore1,
 *   new WebSocket('ws://localhost:8047/petShop'),
 * );
 * await synchronizer1.startSync();
 * // ...
 *
 * // Client 2
 * const clientStore2 = createMergeableStore();
 * clientStore2.setCell('pets', 'felix', 'species', 'cat');
 * const synchronizer2 = await createWsSynchronizer(
 *   clientStore2,
 *   new WebSocket('ws://localhost:8047/petShop'),
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
 * synchronizer1.destroy();
 * synchronizer2.destroy();
 *
 * // ...
 * // Client 3 connects later
 * const clientStore3 = createMergeableStore();
 * const synchronizer3 = await createWsSynchronizer(
 *   clientStore3,
 *   new WebSocket('ws://localhost:8047/petShop'),
 * );
 * await synchronizer3.startSync();
 * // ...
 *
 * console.log(clientStore3.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * synchronizer3.destroy();
 * server.destroy();
 *
 * // Remove file for the purposes of this demo.
 * rmSync('petShop.json');
 * ```
 * @example
 * This example creates a WsServer that persists a MergeableStore to file that
 * is synchronized with two clients on a shared path, but also which updates its
 * data once synchronization has started.
 *
 * ```js
 * import {WebSocketServer} from 'ws';
 * import {createFilePersister} from 'tinybase/persisters/persister-file';
 * import {createMergeableStore} from 'tinybase';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {rmSync} from 'fs';
 *
 * // Server
 * const server = createWsServer(
 *   new WebSocketServer({port: 8047}),
 *   (pathId) => [
 *     createFilePersister(
 *       createMergeableStore(),
 *       pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
 *     ),
 *     (store) => store.setValue('pathId', pathId),
 *   ],
 * );
 *
 * const clientStore = createMergeableStore();
 * clientStore.setCell('pets', 'fido', 'species', 'dog');
 * const synchronizer = await createWsSynchronizer(
 *   clientStore,
 *   new WebSocket('ws://localhost:8047/petShop'),
 * );
 * await synchronizer.startSync();
 * // ...
 *
 * console.log(clientStore.getContent());
 * // -> [{pets: {fido: {species: 'dog'}}}, {"pathId": "petShop"}]
 *
 * synchronizer.destroy();
 * server.destroy();
 *
 * // Remove file for the purposes of this demo.
 * rmSync('petShop.json');
 * ```
 * @example
 * This example creates a WsServer with a custom listener that displays
 * information about the address of the client that connects to it.
 *
 * ```js
 * import {WebSocket, WebSocketServer} from 'ws';
 * import {createMergeableStore} from 'tinybase';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 *
 * // On the server:
 * const webSocketServer = new WebSocketServer({port: 8047});
 * webSocketServer.on('connection', (_, request) => {
 *   console.log('Client address: ' + request.socket.remoteAddress);
 * });
 * const server = createWsServer(webSocketServer);
 *
 * // On a client:
 * const synchronizer = await createWsSynchronizer(
 *   createMergeableStore(),
 *   new WebSocket('ws://localhost:8047'),
 * );
 * // -> 'Client address: ::1'
 *
 * synchronizer.destroy();
 * server.destroy();
 * ```
 * @category Creation
 * @since v5.0.0
 */
/// createWsServer
