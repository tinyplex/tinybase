/**
 * The persister-sync module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances.
 * @see Synchronizing Data guide
 * @packageDocumentation
 * @module persister-sync
 * @since v5.0.0
 */
/// persister-sync
/**
 * The MessageType type
 *
 */
/// MessageType
/**
 * The Receive type
 *
 */
/// Receive
/**
 * The Send type
 *
 */
/// Send
/**
 * The ClientStats type
 *
 */
/// ClientStats
/**
 * The Client interface
 *
 */
/// Client
/**
 * The LocalClient interface
 *
 */
/// LocalClient
/**
 * The WsClient interface
 *
 */
/// WsClient
/**
 * The WsServer interface
 */
/// WsServer
/**
 * The Synchronizer interface is a minor extension to the Persister interface.
 *
 * It provides extra convenience methods for starting and stopping the
 * synchronization.
 *
 * You should use the createCustomSynchronizer function to create a Synchronizer
 * object.
 * @category Persister
 * @since v5.0.0
 */
/// Synchronizer
{
  /**
   * The getClient method returns the reference of the Client that the
   * MergeableStore is being persisted via.
   * @returns The reference of the other MergeableStore.
   * @example
   * This example creates a Persister object against a newly-created
   * MergeableStore and then gets the reference to the Client back out
   * again.
   *
   * ```js
   * const client = createLocalClient();
   *
   * const store1 = createMergeableStore('store1').setTables({
   *   pets: {fido: {species: 'dog'}},
   * });
   * const persister = createCustomSynchronizer(store1, client);
   *
   * console.log(persister.getClient() == client);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// Synchronizer.getClient
  /**
   * The startSync method
   */
  /// Synchronizer.startSync
  /**
   * The stopSync method
   */
  /// Synchronizer.stopSync
}
/**
 * The createCustomSynchronizer function creates a Synchronizer object that can
 * persist one MergeableStore to another.
 *
 * As well as providing a reference to the MergeableStore to synchronize, you
 * must provide a `client` parameter which identifies the Client that is used to
 * transmit changes to and from this MergeableStore and its peers.
 * @param store The MergeableStore to synchronize.
 * @param client The reference of the Client.
 * @param requestTimeoutSeconds An optional number of seconds before a request
 * to the Client times out, defaulting to 5.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new Synchronizer object.
 * @example
 * This example creates a Synchronizer object and synchronizes one
 * MergeableStore to another.
 *
 * ```js
 * const store1 = createMergeableStore('store1').setTables({
 *   pets: {fido: {species: 'dog'}},
 * });
 * const persister1 = createCustomSynchronizer(store1, createLocalClient());
 *
 * const store2 = createMergeableStore('store2');
 * const persister2 = createCustomSynchronizer(store2, createLocalClient());
 * await persister2.startSync();
 *
 * await persister1.save();
 * // ...
 * // Store2 will be synced with Store1.
 *
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 *
 * await persister1.load();
 * // Store1 will be synced with Store2.
 *
 * persister1.destroy();
 * persister2.destroy();
 * ```
 * @category Creation
 */
/// createCustomSynchronizer
/**
 * The createLocalClient function
 */
/// createLocalClient
/**
 * The createWsClient function
 */
/// createWsClient
/**
 * The createWsSimpleServer function
 */
/// createWsSimpleServer
