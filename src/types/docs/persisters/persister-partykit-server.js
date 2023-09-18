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
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module persister-partykit-server
 * @since 4.3.0
 */
/// persister-partykit-server
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
 * export default class extends TinyBasePartyServer {
 *   constructor(readonly party: Party) {
 *     super(party);
 *     // custom constructor code
 *   }
 *
 *   async onStart() {
 *     // no need to call super.onStart()
 *     console.log('Server started');
 *   }
 *
 *   async onMessage(message: string, client: Connection) {
 *     await super.onMessage(message, client);
 *     // custom onMessage code
 *   }
 *
 *   async onRequest(request: Request): Promise<Response> {
 *     // custom onRequest code, else:
 *     return await super.onRequest(request);
 *   }
 * }
 * ```
 *
 * See the [PartyKit server API
 * documentation](https://docs.partykit.io/reference/partyserver-api/) for
 * more details.
 */
/// TinyBasePartyKitServer
{
  /**
   * The onMessage method is called when the server receives a message from a
   * client.
   *
   * If you choose to implement additional functionality in this method, you
   * must remember to call the super implementation to ensure the TinyBase
   * synchronization stays supported:
   *
   * ```js
   * export default class extends TinyBasePartyServer {
   *   async onMessage(message: string, client: Connection) {
   *     await super.onMessage(message, client);
   *     // custom onMessage code
   *   }
   * }
   * ```
   *
   * See the [PartyKit server API
   * documentation](https://docs.partykit.io/reference/partyserver-api/) for
   * more details.
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
   * export default class extends TinyBasePartyServer {
   *   async onRequest(request: Request): Promise<Response> {
   *     // custom onRequest code, else:
   *     return await super.onRequest(request);
   *   }
   * }
   * ```
   *
   * See the [PartyKit server API
   * documentation](https://docs.partykit.io/reference/partyserver-api/) for
   * more details.
   */
  /// TinyBasePartyKitServer.onRequest
}
