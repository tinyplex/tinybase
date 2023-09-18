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
 * @param storeUrlProtocol The HTTP protocol to use (in addition to the
 * websocket channel). This defaults to 'https' but you may wish to use 'http'
 * for local PartyKit development.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to the
 * browser's IndexedDB storage.
 *
 * ```js yolo
 * const store =
 *   createStore()
 *     .setTable('pets', {fido: {species: 'dog'}})
 *     .setTable('species', {dog: {price: 5}})
 *     .setValues({open: true});
 * const partySocket = new PartySocket({host: PARTYKIT_HOST, room: 'my_room'});
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
