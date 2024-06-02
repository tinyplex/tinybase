/**
 * The persister-partykit-client module of the TinyBase project contains the
 * client portion of the PartyKit integration.
 *
 * It contains a Persister which, when run in a PartyKit client environment,
 * lets you save and load Store data from the client to durable PartyKit cloud
 * storage of a server (that is using the complementary
 * persister-partykit-server module).
 *
 * This enables synchronization of the same Store across multiple clients in a
 * PartyKit party room.
 *
 * Note that both the client and server parts of this Persister are currently
 * experimental as PartyKit is new and still maturing.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-partykit-client
 * @since 4.3.0
 */
/// persister-partykit-client
/**
 * The PartyKitPersister interface is a minor extension to the Persister
 * interface.
 *
 * It simply provides an extra getConnection method for accessing the
 * PartySocket the Store is being persisted to.
 *
 * You should use the createPartyKitPersister function to create a
 * PartyKitPersister object.
 * @category Persister
 * @since v4.3.14
 */
/// PartyKitPersister
{
  /**
   * The getConnection method returns the PartySocket the Store is being
   * persisted to.
   * @returns The PartySocket.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the PartySocket back out again.
   *
   * ```js yolo
   * import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';
   * import {createStore} from 'tinybase';
   *
   * const partySocket = new PartySocket({
   *   host: PARTYKIT_HOST,
   *   room: 'my_room',
   * });
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createPartyKitPersister(store, partySocket);
   *
   * console.log(persister.getConnection() == partySocket);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// PartyKitPersister.getConnection
}
/**
 * The PartyKitPersisterConfig type describes the configuration of a PartyKit
 * Persister on the client side.
 *
 * The defaults (if used on both the server and client) will work fine, but if
 * you are building more complex PartyKit apps and you need to configure path
 * names, for example, then this is the thing to use.
 * @example
 * When applied to a PartyKit Persister, this PartyKitPersisterConfig will load
 * and save a JSON serialization from and to an end point in your room called
 * `/my_tinybase`, and use HTTP (rather than the default HTTPS) as the protocol.
 *
 * Note that this would require you to also add the matching storePath setting
 * to the TinyBasePartyKitServerConfig on the server side.
 *
 * ```js
 * const partyKitPersisterConfig = {
 *   storeProtocol: 'http',
 *   storePath: '/my_tinybase',
 * };
 * ```
 * @category Configuration
 * @since v4.3.9
 */
/// PartyKitPersisterConfig
{
  /**
   * The HTTP protocol to use (in addition to the websocket channel). This
   * defaults to 'https' but you may wish to use 'http' for local PartyKit
   * development.
   */
  /// PartyKitPersisterConfig.storeProtocol
  /**
   * The path used to set and get the whole Store over HTTP(S) on the server.
   * This must match the storePath property of the TinyBasePartyKitServerConfig
   * object used on the server. Both default to '/store'.
   */
  /// PartyKitPersisterConfig.storePath
  /**
   * The prefix at the beginning of the web socket messages sent between the
   * client and the server when synchronizing the Store. Use this to make sure
   * they do not collide with any other message syntax that your room is using.
   * This must match the messagePrefix property of the
   * TinyBasePartyKitServerConfig object used on the server. Both default to an
   * empty string.
   */
  /// PartyKitPersisterConfig.messagePrefix
}
/**
 * The createPartyKitPersister function creates a Persister object that can
 * persist the Store to durable PartyKit storage, enabling synchronization of
 * the same Store across multiple clients.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `connection` parameter which is a PartyKit PartySocket that you have already
 * instantiated with details of the host and room.
 *
 * All suitably-equipped TinyBase clients connecting to that room will get to
 * share synchronized Store state.
 *
 * The server room's Store is considered the source of truth. If it is a
 * newly-created room, then calling the save method on this Persister will
 * initiate it. If, however, there is already a Store present on the server, the
 * save method will fail gracefully.
 *
 * In general, you are strongly recommended to use the auto-save and auto-load
 * functionality to stay in sync incrementally with the server, as per the
 * example below. This pattern will handle newly-created servers and
 * newly-created clients - and the synchronization involved in joining rooms,
 * leaving them, or temporarily going offline.
 *
 * See the [PartyKit client socket API
 * documentation](https://docs.partykit.io/reference/partysocket-api/) for more
 * details.
 * @param store The Store to persist.
 * @param connection The PartySocket to use for participating in the PartyKit
 * room.
 * @param configOrStoreProtocol The PartyKitPersisterConfig configuration for
 * the Persister, (or a string to specify a HTTP protocol to use, defaulting to
 * 'https').
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new PartyKitPersister object.
 * @example
 * This example creates a PartyKitPersister object and persists the Store to the
 * browser's IndexedDB storage.
 *
 * ```js yolo
 * import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}})
 *   .setTable('species', {dog: {price: 5}})
 *   .setValues({open: true});
 * const partySocket = new PartySocket({
 *   host: PARTYKIT_HOST,
 *   room: 'my_room',
 * });
 * const persister = createPartyKitPersister(store, partySocket);
 * await persister.startAutoLoad();
 * await persister.startAutoSave();
 * // Store will now be synchronized with the room.
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since 4.3.0
 */
/// createPartyKitPersister
