/**
 * The persister-partykit-server module of the TinyBase project contains the
 * server portion of the PartyKit integration.
 *
 * It contains a class which, when run in a PartyKit server environment, lets
 * you save and load Store data from a client (that is using the complementary
 * persister-partykit-client module) to durable PartyKit cloud storage.
 *
 * This enables synchronization of the same Store across multiple clients in a
 * PartyKit party room.
 *
 * Note that both the client and server parts of this Persister are currently
 * experimental as PartyKit is new and still maturing.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-partykit-server
 * @since 4.3.0
 */
/// persister-partykit-server
/**
 * The TinyBasePartyKitServerConfig type describes the configuration of a
 * PartyKit Persister on the server side.
 *
 * The defaults (if used on both the server and client) will work fine, but if
 * you are building more complex PartyKit apps and you need to configure path
 * names, for example, then this is the type to use.
 * @example
 * When set as the config in a TinyBasePartyKitServer, this
 * TinyBasePartyKitServerConfig will expect clients to load and save their JSON
 * serialization from and to an end point in the room called `/my_tinybase`.
 * Note that this would require you to also add the matching storePath setting
 * to the PartyKitPersisterConfig on the client side.
 *
 * It will also store the data in the durable storage with a prefix of
 * 'tinybase_' in case you are worried about colliding with other data stored
 * in the room.
 *
 * ```js
 * class MyServer extends TinyBasePartyKitServer {
 *   readonly config = {
 *     storePath: '/my_tinybase',
 *     storagePrefix: 'tinybase_',
 *   };
 * }
 * ```
 * @category Configuration
 * @since v4.3.9
 */
/// TinyBasePartyKitServerConfig
{
  /**
   * The path used to set and get the whole Store over HTTP(S) on the server.
   * This must match the storePath property of the PartyKitPersisterConfig used
   * on the client. Both default to '/store'.
   */
  /// TinyBasePartyKitServerConfig.storePath
  /**
   * The prefix at the beginning of the web socket messages between the client
   * and the server when synchronizing the Store. Use this to make sure they do
   * not collide with any other message syntax that your room is using. This
   * must match the messagePrefix property of the PartyKitPersisterConfig object
   * used on the client. Both default to an empty string.
   */
  /// TinyBasePartyKitServerConfig.messagePrefix
  /**
   * The prefix used before all the keys in the server's durable storage. Use
   * this in case you are worried about the Store data colliding with other data
   * stored in the room. Defaults to an empty string.
   */
  /// TinyBasePartyKitServerConfig.storagePrefix
  /**
   * An object containing the extra HTTP(S) headers returned to the client from
   * this server. This defaults to the following three headers to allow CORS:
   *
   * ```
   * Access-Control-Allow-Origin: *
   * Access-Control-Allow-Methods: *
   * Access-Control-Allow-Headers: *
   * ```
   *
   * If you set this field, it will override the default completely. So, for
   * example, if you add another header but still want the CORS defaults, you
   * will need to explicitly set the Access-Control-Allow headers above again.
   */
  /// TinyBasePartyKitServerConfig.responseHeaders
}
///
/**
 * A TinyBasePartyKitServer is the server component for persisting the Store to
 * durable PartyKit storage, enabling synchronization of the same Store across
 * multiple clients.
 *
 * This extends the PartyKit Server class, which provides a selection of methods
 * you are expected to implement. The TinyBasePartyKitServer implements only two
 * of them, the onMessage method and the onRequest method, as well as the
 * constructor.
 *
 * If you wish to use TinyBasePartyKitServer as a general PartyKit server, you
 * can implement other methods. But you must remember to call the super
 * implementations of those methods to ensure the TinyBase synchronization stays
 * supported in addition to your own custom functionality. The same applies to
 * the constructor if you choose to implement that.
 *
 * ```js
 * // This is your PartyKit server entry point.
 *
 * class MyServer extends TinyBasePartyKitServer {
 *   constructor(party) {
 *     super(party);
 *     // custom constructor code
 *   }
 *
 *   async onStart() {
 *     // no need to call super.onStart()
 *     console.log('Server started');
 *   }
 *
 *   async onMessage(message, connection) {
 *     await super.onMessage(message, connection);
 *     // custom onMessage code
 *   }
 *
 *   async onRequest(request) {
 *     // custom onRequest code, else:
 *     return await super.onRequest(request);
 *   }
 * }
 * ```
 *
 * See the [PartyKit server API
 * documentation](https://docs.partykit.io/reference/partyserver-api/) for
 * more details.
 * @category Creation
 * @since v4.3.0
 */
/// TinyBasePartyKitServer
{
  /**
   * The constructor is used to create the server.
   * @category Creation
   * @since v4.3.9
   */
  /// TinyBasePartyKitServer.constructor
  /**
   * The config property is used to optionally configure the server, using an
   * object of the TinyBasePartyKitServerConfig type.
   *
   * See the documentation for that type for more details.
   * @category Configuration
   * @since v4.3.9
   */
  /// TinyBasePartyKitServer.config
  /**
   * The onMessage method is called when the server receives a message from a
   * client.
   *
   * If you choose to implement additional functionality in this method, you
   * must remember to call the super implementation to ensure the TinyBase
   * synchronization stays supported:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   async onMessage(message, connection) {
   *     await super.onMessage(message, connection);
   *     // custom onMessage code
   *   }
   * }
   * ```
   *
   * See the [PartyKit server API
   * documentation](https://docs.partykit.io/reference/partyserver-api/) for
   * more details.
   * @category Connection
   * @since v4.3.0
   */
  /// TinyBasePartyKitServer.onMessage
  /**
   * The onRequest method is called when a HTTP request is made to the party
   * URL.
   *
   * If you choose to implement additional functionality in this method, you
   * must remember to call the super implementation to ensure the TinyBase
   * synchronization stays supported:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   async onRequest(request) {
   *     // custom onRequest code, else:
   *     return await super.onRequest(request);
   *   }
   * }
   * ```
   *
   * See the [PartyKit server API
   * documentation](https://docs.partykit.io/reference/partyserver-api/) for
   * more details.
   * @category Connection
   * @since v4.3.0
   */
  /// TinyBasePartyKitServer.onRequest
  /**
   * The canSetTable method lets you allow or disallow any changes to a Table
   * stored on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Table Id that the client is trying to change. The
   * `initialSave` parameter distinguishes between the first bulk save of the
   * Store to the PartyKit room over HTTP (`true`), and subsequent incremental
   * updates over a web sockets (`false`).
   *
   * The `requestOrConnection` parameter will either be the HTTP(S) request or
   * the web socket connection, in those two cases respectively. You can, for
   * instance, use this to distinguish between different users.
   *
   * Since v4.3.13, the final parameter is the Cell previously stored on the
   * server, if any. Use this to distinguish between the addition of a new Cell
   * (in which case it will be undefined) and the updating of an existing one.
   *
   * Return `false` from this method to disallow changes to this Table on the
   * server, or `true` to allow them (subject to subsequent canSetRow method,
   * canDelRow method, canSetCell method, and canSetCell method checks). The
   * default implementation returns `true` to allow all changes.
   * @example
   * The following implementation will strip out any attempts by the client to
   * update any 'user' tabular data after the initial save:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canSetTable(tableId, initialSave) {
   *     return initialSave || tableId != 'user';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canSetTable
  /**
   * The canDelTable method lets you allow or disallow deletions of a Table
   * stored on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Table Id that the client is trying to delete. The
   * `connection` parameter will be the web socket connection of that client.
   * You can, for instance, use this to distinguish between different users.
   *
   * Return `false` from this method to disallow this Table from being deleted
   * on the server, or `true` to allow it. The default implementation returns
   * `true` to allow deletion.
   * @example
   * The following implementation will strip out any attempts by the client to
   * delete the 'user' Table:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canDelTable(tableId) {
   *     return tableId != 'user';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canDelTable
  /**
   * The canSetRow method lets you allow or disallow any changes to a Row stored
   * on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Table Id and Row Id that the client is trying to
   * change. The `initialSave` parameter distinguishes between the first bulk
   * save of the Store to the PartyKit room over HTTP (`true`), and subsequent
   * incremental updates over a web sockets (`false`).
   *
   * The final `requestOrConnection` parameter will either be the HTTP(S)
   * request or the web socket connection, in those two cases respectively. You
   * can, for instance, use this to distinguish between different users.
   *
   * Return `false` from this method to disallow changes to this Row on the
   * server, or `true` to allow them (subject to subsequent canSetCell method
   * and canSetCell method checks). The default implementation returns `true` to
   * allow all changes.
   * @example
   * The following implementation will strip out any attempts by the client to
   * update the 'me' Row of the 'user' Table after the initial save:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canSetRow(tableId, rowId, initialSave) {
   *     return initialSave || tableId != 'user' || rowId != 'me';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canSetRow
  /**
   * The canDelRow method lets you allow or disallow deletions of a Row stored
   * on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Table Id and Row Id that the client is trying to
   * delete. The `connection` parameter will be the web socket connection of
   * that client. You can, for instance, use this to distinguish between
   * different users.
   *
   * Return `false` from this method to disallow this Row from being deleted
   * on the server, or `true` to allow it. The default implementation returns
   * `true` to allow deletion.
   * @example
   * The following implementation will strip out any attempts by the client to
   * delete the 'me' Row of the 'user' Table:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canDelRow(tableId, rowId) {
   *     return tableId != 'user' || rowId != 'me';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canDelRow
  /**
   * The canSetCell method lets you allow or disallow any changes to a Cell
   * stored on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Table Id, Row Id, and Cell Id that the client is
   * trying to change - as well as the Cell value itself. The `initialSave`
   * parameter distinguishes between the first bulk save of the Store to the
   * PartyKit room over HTTP (`true`), and subsequent incremental updates over a
   * web sockets (`false`).
   *
   * The final `requestOrConnection` parameter will either be the HTTP(S)
   * request or the web socket connection, in those two cases respectively. You
   * can, for instance, use this to distinguish between different users.
   *
   * Return `false` from this method to disallow changes to this Cell on the
   * server, or `true` to allow them. The default implementation returns `true`
   * to allow all changes.
   * @example
   * The following implementation will strip out any attempts by the client to
   * update the 'name' Cell of the 'me' Row of the 'user' Table after the
   * initial save:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canSetCell(tableId, rowId, cellId, cell, initialSave) {
   *     return (
   *       initialSave || tableId != 'user' || rowId != 'me' || cellId != 'name'
   *     );
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canSetCell
  /**
   * The canDelCell method lets you allow or disallow deletions of a Cell stored
   * on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Table Id, Row Id, and Cell Id that the client is
   * trying to delete. The `connection` parameter will be the web socket
   * connection of that client. You can, for instance, use this to distinguish
   * between different users.
   *
   * Return `false` from this method to disallow this Cell from being deleted on
   * the server, or `true` to allow it. The default implementation returns
   * `true` to allow deletion.
   * @example
   * The following implementation will strip out any attempts by the client to
   * delete the 'name' Cell of the 'me' Row of the 'user' Table:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canDelCell(tableId, rowId, cellId) {
   *     return tableId != 'user' || rowId != 'me' || cellId != 'name';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canDelCell
  /**
   * The canSetValue method lets you allow or disallow any changes to a Value
   * stored on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Value Id that the client is trying to change - as
   * well as the Value itself. The `initialSave` parameter distinguishes between
   * the first bulk save of the Store to the PartyKit room over HTTP (`true`),
   * and subsequent incremental updates over a web sockets (`false`).
   *
   * The `requestOrConnection` parameter will either be the HTTP(S) request or
   * the web socket connection, in those two cases respectively. You can, for
   * instance, use this to distinguish between different users.
   *
   * Since v4.3.13, the final parameter is the Value previously stored on the
   * server, if any. Use this to distinguish between the addition of a new Value
   * (in which case it will be undefined) and the updating of an existing one.
   *
   * Return `false` from this method to disallow changes to this Value on the
   * server, or `true` to allow them. The default implementation returns `true`
   * to allow all changes.
   * @example
   * The following implementation will strip out any attempts by the client to
   * update the 'userId' Value after the initial save:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canSetValue(valueId, value, initialSave) {
   *     return initialSave || userId != 'userId';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canSetValue
  /**
   * The canDelValue method lets you allow or disallow deletions of a Value
   * stored on the server, as sent from a client.
   *
   * This is one of the functions use to sanitize the data that is being sent
   * from a client. Perhaps you might want to make sure the server-stored data
   * adheres to a particular schema, or you might want to make certain data
   * read-only. Remember that you cannot trust the client to only send data that
   * the server considers valid or safe.
   *
   * This method is passed the Value Id that the client is trying to delete. The
   * `connection` parameter will be the web socket connection of that client.
   * You can, for instance, use this to distinguish between different users.
   *
   * Return `false` from this method to disallow this Value from being deleted
   * on the server, or `true` to allow it. The default implementation returns
   * `true` to allow deletion.
   * @example
   * The following implementation will strip out any attempts by the client to
   * delete the 'userId' Value:
   *
   * ```js
   * class MyServer extends TinyBasePartyKitServer {
   *   canDelValue(valueId) {
   *     return valueId != 'userId';
   *   }
   * }
   * ```
   * @category Sanitization
   * @since v4.3.12
   */
  /// TinyBasePartyKitServer.canDelValue
}
/**
 * The hasStoreInStorage function returns a boolean indicating whether durable
 * PartyKit storage contains a serialized Store.
 *
 * This is intended for specialist applications that require the ability to
 * inspect or load a TinyBase Store from a server's storage outside of the
 * normal context of a TinyBasePartyKitServer.
 *
 * The function is asynchronous, so you should use the `await` keyword or handle
 * the result as a promise.
 * @param storage A reference to the storage object, as would normally be
 * accessible from the `TinyBasePartyKitServer.party` object.
 * @param storagePrefix An optional prefix used before all the keys in the
 * server's durable storage, to match the equivalent property in the server's
 * TinyBasePartyKitServerConfig.
 * @returns A promised boolean indicating whether a Store is present in the
 * storage.
 * @category Storage
 * @since v4.4.1
 */
/// hasStoreInStorage
/**
 * The loadStoreFromStorage function returns the content of a Store from durable
 * PartyKit storage.
 *
 * This is intended for specialist applications that require the ability to
 * inspect or load a TinyBase Store from a server's storage outside of the
 * normal context of a TinyBasePartyKitServer.
 *
 * The function is asynchronous, so you should use the `await` keyword or handle
 * the result as a promise.
 * @param storage A reference to the storage object, as would normally be
 * accessible from the `TinyBasePartyKitServer.party` object.
 * @param storagePrefix An optional prefix used before all the keys in the
 * server's durable storage, to match the equivalent property in the server's
 * TinyBasePartyKitServerConfig.
 * @returns A promised array of a Tables object and a Values object.
 * @category Storage
 * @since v4.4.1
 */
/// loadStoreFromStorage
/**
 * The broadcastChanges function allows you to broadcast Store
 * changes to all the client connections of a TinyBasePartyKitServer.
 *
 * This is intended for specialist applications that require the ability to
 * update clients of a TinyBasePartyKitServer in their own custom ways.
 *
 * The function is asynchronous, so you should use the `await` keyword or handle
 * its completion as a promise.
 * @param server A reference to the TinyBasePartyKitServer object.
 * @param changes The Store changes to broadcast to the server's
 * clients.
 * @param without An optional array of client connection Ids to exclude from the
 * broadcast.
 * @category Connection
 * @since v4.5.1
 */
/// broadcastChanges
