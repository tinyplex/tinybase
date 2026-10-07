/**
 * The synchronizer-ws-server module of the TinyBase project lets you create a
 * server that facilitates synchronization between clients.
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
 * The client Id is connection metadata derived from the `Sec-WebSocket-Key`
 * header. It is not stable across reconnections or an authenticated user or
 * session identity, and must not be used for authorization. A connection whose
 * Id is already in use on the path is refused.
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
 * The ClientAccess type describes how a client may use a path on a WsServer,
 * as decided by the Authorize function when the client joins that path.
 *
 * A client with ClientAccess can read everything on the path. Unless it is
 * read-only, it can also write whatever the CanWriteCell and CanWriteValue
 * functions allow.
 * @category Authorization
 * @since v10.1.0
 */
/// ClientAccess
{
  /**
   * The readOnly property, when `true`, prevents the client from writing
   * anything to the path. Changes it sends are not merged into the path's
   * MergeableStore, nor relayed to other clients.
   * @category Property
   * @since v10.1.0
   */
  /// ClientAccess.readOnly
  /**
   * The context property is any information about the client that the
   * CanWriteCell and CanWriteValue functions will need, such as the Id of the
   * authenticated user.
   * @category Property
   * @since v10.1.0
   */
  /// ClientAccess.context
}
/**
 * The Authorize type describes a function that decides whether a client may
 * join a path on a WsServer, and if so, how.
 *
 * It is called with the Id of the path and the HTTP request that opened the
 * client's WebSocket, from which you can read a token (from the URL query
 * string, for example) or a cookie. It should return a ClientAccess object to
 * let the client join, or `undefined` to refuse it. It can be asynchronous, and
 * messages from the client are held until it has resolved. If it throws, the
 * client is refused.
 *
 * A refused client's WebSocket is closed with the code `1008`. For a WebSocket
 * that multiplexes several paths, it is called for each path the client
 * subscribes to, and refusing any one of them closes the whole WebSocket.
 * @param pathId The Id of the path the client wishes to join.
 * @param request The HTTP request that opened the client's WebSocket.
 * @returns A ClientAccess object, or `undefined` to refuse the client, or a
 * Promise of either.
 * @category Authorization
 * @since v10.1.0
 */
/// Authorize
/**
 * The CanWriteCell type describes a function that decides whether a client may
 * write a given Cell on a path of a WsServer.
 *
 * It is called for each Cell in the changes that a writable client sends to the
 * server, including deletions, where the `cell` parameter is `undefined`. It
 * must be synchronous. Cells for which it returns `false` are neither merged
 * into the path's MergeableStore nor relayed to other clients.
 *
 * If the rejected change was newer than the server's own version of that Cell,
 * and different from it, the server sends that client alone its own version
 * (or a deletion, if it has none), stamped just after the rejected change. The
 * client is brought back into line with the server, rather than silently
 * diverging from it, and nothing changes on the server or for any other
 * client.
 *
 * This function decides only about Cells. Unless you also provide a
 * CanWriteValue function, every writable client may write any Value. And
 * unless you provide an Authorize function, every client is admitted as
 * writable, with an undefined context.
 * @param pathId The Id of the path.
 * @param tableId The Id of the Table.
 * @param rowId The Id of the Row.
 * @param cellId The Id of the Cell.
 * @param cell The new value of the Cell, or `undefined` if it is being deleted.
 * @param context The context from the client's ClientAccess.
 * @returns Whether the client may write the Cell.
 * @category Authorization
 * @since v10.1.0
 */
/// CanWriteCell
/**
 * The CanWriteValue type describes a function that decides whether a client
 * may write a given Value on a path of a WsServer.
 *
 * It is called for each Value in the changes that a writable client sends to
 * the server, including deletions, where the `value` parameter is `undefined`.
 * It must be synchronous. Values for which it returns `false` are neither
 * merged into the path's MergeableStore nor relayed to other clients.
 *
 * If the rejected change was newer than the server's own version of that
 * Value, and different from it, the server sends that client alone its own
 * version (or a deletion, if it has none), stamped just after the rejected
 * change. The client is brought back into line with the server, rather than
 * silently diverging from it, and nothing changes on the server or for any
 * other client.
 *
 * This function decides only about Values. Unless you also provide a
 * CanWriteCell function, every writable client may write any Cell. And unless
 * you provide an Authorize function, every client is admitted as writable,
 * with an undefined context.
 * @param pathId The Id of the path.
 * @param valueId The Id of the Value.
 * @param value The new Value, or `undefined` if it is being deleted.
 * @param context The context from the client's ClientAccess.
 * @returns Whether the client may write the Value.
 * @category Authorization
 * @since v10.1.0
 */
/// CanWriteValue
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
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocketServer} from 'ws';
   *
   * const webSocketServer = new WebSocketServer({port: 8047});
   * const server = createWsServer(webSocketServer);
   *
   * console.log(server.getWebSocketServer() == webSocketServer);
   * // -> true
   *
   * await server.destroy();
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
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer3.destroy();
   * // ...
   * console.log(server.getPathIds());
   * // -> ['roomA']
   *
   * await synchronizer1.destroy();
   * await synchronizer2.destroy();
   * await server.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsServer.getPathIds
  /**
   * The getClientIds method returns the active clients that the WsServer is
   * handling for a given path. These connection-scoped Ids are derived from
   * the `Sec-WebSocket-Key` header. They are not authenticated identities and
   * must not be used for authorization.
   * @param pathId The path for which to return the list of active clients.
   * @returns An array of the clients connected to the given path.
   * @example
   * This example creates a WsServer, sets some clients up to connect
   * to it, and then gets the number of clients on the given paths. (The client
   * Ids themselves are unique, based on the `Sec-WebSocket-Key` header.)
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer3.destroy();
   * // ...
   * console.log(server.getClientIds('roomB').length);
   * // -> 0
   *
   * await synchronizer1.destroy();
   * await synchronizer2.destroy();
   * await server.destroy();
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
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer1.destroy();
   * // ...
   * // -> 'roomA removed'
   * // -> ['roomB']
   *
   * await synchronizer2.destroy();
   * // ...
   * // -> 'roomB removed'
   * // -> []
   *
   * server.delListener(listenerId);
   * await server.destroy();
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
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer1.destroy();
   * // ...
   * // -> '0 client(s) in roomA'
   *
   * await synchronizer2.destroy();
   *
   * server.delListener(listenerId);
   * await server.destroy();
   * ```
   * @example
   * This example creates a WsServer, and listens to changes to the clients
   * connecting to and disconnecting from any path.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer1.destroy();
   * // ...
   * // -> '0 client(s) in roomA'
   *
   * await synchronizer2.destroy();
   * // ...
   * // -> '0 client(s) in roomB'
   *
   * server.delListener(listenerId);
   * await server.destroy();
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
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer.destroy();
   * // -> undefined
   * // The listener is not called.
   *
   * await server.destroy();
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
   * import {createMergeableStore} from 'tinybase';
   * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocket, WebSocketServer} from 'ws';
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
   * await synchronizer1.destroy();
   * await synchronizer2.destroy();
   * await server.destroy();
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
   * WsServer was created. This method is asynchronous.
   * @example
   * This example creates a WsServer and then destroys it again, closing the
   * underlying WebSocketServer.
   *
   * ```js
   * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
   * import {WebSocketServer} from 'ws';
   *
   * const webSocketServer = new WebSocketServer({port: 8047});
   * webSocketServer.on('close', () => {
   *   console.log('WebSocketServer closed');
   * });
   * const server = createWsServer(webSocketServer);
   *
   * await server.destroy();
   * // ...
   * // -> 'WebSocketServer closed'
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// WsServer.destroy
}
/**
 * The WsServerOptions type describes the options that can be passed to the
 * createWsServer function when using its options object form.
 *
 * Setting any of the `authorize`, `canWriteCell`, or `canWriteValue` options
 * makes each path's MergeableStore the only peer that its clients synchronize
 * with. Clients no longer answer each other directly, so that everything they
 * read and write passes through the server. A path gets an in-memory
 * MergeableStore if the `createPersisterForPath` option does not provide one.
 * @category Configuration
 * @since v10.1.0
 */
/// WsServerOptions
{
  /**
   * The createPersisterForPath property is an optional function that will
   * create a Persister to synchronize with the clients on a given path (or a
   * two-item array of Persister and callback that lets you handle data after
   * persistence has started).
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.createPersisterForPath
  /**
   * The authorize property is an optional Authorize function that decides
   * whether each client may join a path, and how.
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.authorize
  /**
   * The canWriteCell property is an optional CanWriteCell function that
   * decides whether a client may write a given Cell.
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.canWriteCell
  /**
   * The canWriteValue property is an optional CanWriteValue function that
   * decides whether a client may write a given Value.
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.canWriteValue
  /**
   * The onIgnoredError property is an optional handler for the errors that the
   * server would otherwise ignore when trying to sync data. This is suitable
   * for debugging issues in a development environment.
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.onIgnoredError
  /**
   * The requestTimeoutSeconds property is an optional time in seconds that the
   * server will wait for responses to synchronization requests and incomplete
   * fragments, defaulting to `1`.
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.requestTimeoutSeconds
  /**
   * The fragmentSize property is an optional target maximum UTF-8 byte size
   * for each WebSocket message fragment sent by the server.
   * @category Option
   * @since v10.1.0
   */
  /// WsServerOptions.fragmentSize
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
 * A path is taken from the path in the client WebSocket URL. For example,
 * clients connecting to `ws://localhost:8047/petShop` will share the `petShop`
 * path. The Id of a client's MergeableStore does not select this path.
 *
 * Since v9.3, multiple WsSynchronizer instances can share one WebSocket by
 * using channel Ids. Each channel Id is appended to the WebSocket URL path and
 * treated as an ordinary server path. This means a multiplexed channel can
 * interoperate with legacy clients connected directly to that full path. A
 * channel Id can contain at most 1,024 UTF-8 bytes, and each multiplexed
 * WebSocket can have at most 100 subscribed channels. Pending setup and
 * teardown resources are also bounded. Fragment reassembly and traffic
 * buffered while paths start share limits across the physical WebSocket.
 *
 * By default, the WsServer does not authenticate or authorize URL paths or
 * channel Ids, and any client can read and write any path. For untrusted
 * clients, use the second form of this function, which takes a WsServerOptions
 * object, to provide an Authorize function and, optionally, CanWriteCell and
 * CanWriteValue functions.
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
 * @param onIgnoredError An optional handler for the errors that the server
 * would otherwise ignore when trying to sync data. This is suitable for
 * debugging issues in a development environment.
 * @param requestTimeoutSeconds An optional time in seconds that the server will
 * wait for responses to synchronization requests and incomplete fragments,
 * defaulting to `1`.
 * @param fragmentSize An optional target maximum UTF-8 byte size for each
 * WebSocket message fragment. Unicode code points are never split and can
 * exceed this size. TinyBase sends at most 1,000 fragments for one payload,
 * increasing the target when needed. When set, larger synchronization payloads
 * sent by the server are split into fragments and reassembled by the receiving
 * WsSynchronizer, since v9.0.
 * @returns A reference to the new WsServer object.
 * @example
 * This example creates a WsServer that synchronizes two clients on a shared
 * path.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
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
 * await synchronizer1.destroy();
 * await synchronizer2.destroy();
 * await server.destroy();
 * ```
 * @example
 * This longer example creates a WsServer that persists a MergeableStore to file
 * that is synchronized with two clients on a shared path. Later, when a third
 * client connects, it picks up the data the previous two were using.
 *
 * ```js
 * import {mkdirSync, rmSync} from 'fs';
 * import {createMergeableStore} from 'tinybase';
 * import {createFilePersister} from 'tinybase/persisters/persister-file';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * // Server
 * mkdirSync('./tmp', {recursive: true});
 * const server = createWsServer(
 *   new WebSocketServer({port: 8047}),
 *   (pathId) =>
 *     createFilePersister(
 *       createMergeableStore(),
 *       './tmp/' + pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
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
 * await synchronizer1.destroy();
 * await synchronizer2.destroy();
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
 * await synchronizer3.destroy();
 * await server.destroy();
 *
 * // Remove file for the purposes of this demo.
 * rmSync('./tmp/petShop.json');
 * ```
 * @example
 * This example creates a WsServer that persists a MergeableStore to file that
 * is synchronized with two clients on a shared path, but also which updates its
 * data once synchronization has started.
 *
 * ```js
 * import {mkdirSync, rmSync} from 'fs';
 * import {createMergeableStore} from 'tinybase';
 * import {createFilePersister} from 'tinybase/persisters/persister-file';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * // Server
 * mkdirSync('./tmp', {recursive: true});
 * const server = createWsServer(
 *   new WebSocketServer({port: 8047}),
 *   (pathId) => [
 *     createFilePersister(
 *       createMergeableStore(),
 *       './tmp/' + pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
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
 * await synchronizer.destroy();
 * await server.destroy();
 *
 * // Remove file for the purposes of this demo.
 * rmSync('./tmp/petShop.json');
 * ```
 * @example
 * This example creates a WsServer with a custom listener that displays
 * information about the address of the client that connects to it.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * // On the server:
 * const webSocketServer = new WebSocketServer({port: 8047});
 * webSocketServer.on('connection', (_, request) => {
 *   if (request.headers.connection == 'Upgrade') {
 *     console.log('Local client connected');
 *   }
 * });
 * const server = createWsServer(webSocketServer);
 *
 * // On a client:
 * const synchronizer = await createWsSynchronizer(
 *   createMergeableStore(),
 *   new WebSocket('ws://localhost:8047'),
 * );
 * // -> 'Local client connected'
 *
 * await synchronizer.destroy();
 * await server.destroy();
 * ```
 * @category Creation
 * @since v5.0.0
 */
/// createWsServer
/**
 * The createWsServer function creates a WsServer that facilitates
 * synchronization between clients that are using WsSynchronizer instances,
 * configured with a WsServerOptions object.
 *
 * This form of the function takes the same options as the first, plus an
 * optional Authorize function that decides whether each client may join a path
 * (and whether it is read-only), and optional CanWriteCell and CanWriteValue
 * functions that decide what a writable client may change.
 *
 * Providing any of these three functions makes each path's MergeableStore the
 * only peer that its clients synchronize with, since clients can no longer be
 * trusted to answer each other directly. The server merges what each client
 * may write, relays it to the other clients, and brings a client that tried to
 * write something it may not back into line with the server's own data. If you
 * do not provide a `createPersisterForPath` function, each path gets an
 * in-memory MergeableStore for as long as it has clients.
 *
 * Bringing a client back into line removes anything in its MergeableStore
 * that it may not write and that the server does not have. So keep data that
 * is only for that client in a separate Store, rather than in the one it
 * synchronizes.
 *
 * Clients do not need to change, except to identify themselves. Since a
 * browser cannot add headers to a WebSocket request, a common approach is to
 * put a token in the URL's query string, which is not part of the path.
 * @param webSocketServer A WebSocketServer object from your server environment.
 * @param options A WsServerOptions object.
 * @returns A reference to the new WsServer object.
 * @example
 * This example creates a WsServer that lets staff write to a path, lets
 * customers only read it, and refuses anyone else. A customer's attempt to
 * write is undone.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * const getToken = (request) =>
 *   new URL(request.url, 'http://localhost').searchParams.get('token');
 *
 * const server = createWsServer(new WebSocketServer({port: 8047}), {
 *   authorize: (pathId, request) => {
 *     const token = getToken(request);
 *     return token == 'staff'
 *       ? {}
 *       : token == 'customer'
 *         ? {readOnly: true}
 *         : undefined;
 *   },
 * });
 *
 * const staffStore = createMergeableStore();
 * staffStore.setCell('pets', 'fido', 'species', 'dog');
 * const staffSynchronizer = await createWsSynchronizer(
 *   staffStore,
 *   new WebSocket('ws://localhost:8047/petShop?token=staff'),
 * );
 * await staffSynchronizer.startSync();
 *
 * const customerStore = createMergeableStore();
 * const customerSynchronizer = await createWsSynchronizer(
 *   customerStore,
 *   new WebSocket('ws://localhost:8047/petShop?token=customer'),
 * );
 * await customerSynchronizer.startSync();
 * // ...
 *
 * console.log(customerStore.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 *
 * customerStore.setCell('pets', 'fido', 'species', 'cat');
 * // ...
 *
 * console.log(staffStore.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 * console.log(customerStore.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 *
 * const strangerWebSocket = new WebSocket('ws://localhost:8047/petShop');
 * strangerWebSocket.on('close', (code) => console.log(code));
 * // ...
 * // -> 1008
 *
 * await customerSynchronizer.destroy();
 * await staffSynchronizer.destroy();
 * await server.destroy();
 * ```
 * @example
 * This example creates a WsServer that lets staff write anything, but lets
 * customers write only to the `orders` Table.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {WebSocket, WebSocketServer} from 'ws';
 *
 * const server = createWsServer(new WebSocketServer({port: 8047}), {
 *   authorize: (pathId, request) => ({
 *     context: {
 *       role: new URL(request.url, 'http://localhost').searchParams.get(
 *         'role',
 *       ),
 *     },
 *   }),
 *   canWriteCell: (pathId, tableId, rowId, cellId, cell, {role}) =>
 *     role == 'staff' || tableId == 'orders',
 * });
 *
 * const staffStore = createMergeableStore();
 * staffStore.setCell('pets', 'fido', 'price', 5);
 * const staffSynchronizer = await createWsSynchronizer(
 *   staffStore,
 *   new WebSocket('ws://localhost:8047/petShop?role=staff'),
 * );
 * await staffSynchronizer.startSync();
 *
 * const customerStore = createMergeableStore();
 * const customerSynchronizer = await createWsSynchronizer(
 *   customerStore,
 *   new WebSocket('ws://localhost:8047/petShop?role=customer'),
 * );
 * await customerSynchronizer.startSync();
 * // ...
 *
 * customerStore.setCell('orders', 'order1', 'pet', 'fido');
 * customerStore.setCell('pets', 'fido', 'price', 1);
 * // ...
 *
 * console.log(staffStore.getTables());
 * // -> {pets: {fido: {price: 5}}, orders: {order1: {pet: 'fido'}}}
 * console.log(customerStore.getTables());
 * // -> {pets: {fido: {price: 5}}, orders: {order1: {pet: 'fido'}}}
 *
 * await customerSynchronizer.destroy();
 * await staffSynchronizer.destroy();
 * await server.destroy();
 * ```
 * @category Creation
 * @since v10.1.0
 */
/// createWsServer.2
