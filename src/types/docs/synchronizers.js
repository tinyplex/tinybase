/**
 * The persister-sync module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances.
 * @see Synchronizing Data guide
 * @packageDocumentation
 * @module synchronizers
 * @since v5.0.0
 */
/// synchronizers
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
 * The SynchronizerStats type
 *
 */
/// SynchronizerStats
/**
 * The Client interface
 *
 */
/// Client
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
   * The startSync method
   */
  /// Synchronizer.startSync
  /**
   * The stopSync method
   */
  /// Synchronizer.stopSync
  /**
   * The getSynchronizerStats method
   */
  /// Synchronizer.getSynchronizerStats
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
 * const synchronizer1 = createLocalSynchronizer(store1);
 *
 * const store2 = createMergeableStore('store2');
 * const synchronizer2 = createLocalSynchronizer(store2);
 * await synchronizer2.startSync();
 *
 * await synchronizer1.save();
 * // ...
 * // Store2 will be synced with Store1.
 *
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 *
 * await synchronizer1.load();
 * // Store1 will be synced with Store2.
 *
 * synchronizer1.destroy();
 * synchronizer2.destroy();
 * ```
 * @category Creation
 */
/// createCustomSynchronizer
