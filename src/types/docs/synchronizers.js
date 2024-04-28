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
 * @category Synchronization
 */
/// MessageType
/**
 * The Receive type
 * @category Synchronization
 */
/// Receive
/**
 * The Send type
 * @category Synchronization
 */
/// Send
/**
 * The SynchronizerStats type
 * @category Development
 */
/// SynchronizerStats
/**
 * The Synchronizer interface is a minor extension to the Persister interface.
 *
 * It provides extra convenience methods for starting and stopping the
 * synchronization.
 *
 * You should use the createCustomSynchronizer function to create a Synchronizer
 * object.
 * @category Synchronizer
 * @since v5.0.0
 */
/// Synchronizer
{
  /**
   * The startSync method
   * @category Synchronization
   */
  /// Synchronizer.startSync
  /**
   * The stopSync method
   * @category Synchronization
   */
  /// Synchronizer.stopSync
  /**
   * The getSynchronizerStats method
   * @category Synchronization
   */
  /// Synchronizer.getSynchronizerStats
}
/**
 * The createCustomSynchronizer function creates a Synchronizer object that can
 * persist one MergeableStore to another.
 *
 * As well as providing a reference to the MergeableStore to synchronize, you
 * must provide parameters which identify how to send and receive changes to and
 * from this MergeableStore and its peers.
 * @param store The MergeableStore to synchronize.
 * @param send A Send function for sending a message.
 * @param onReceive A callback to register a Receive function for receiving a
 * message.
 * @param destroy A function called when destroying the Persister which can be
 * used to clean up underlying resources.
 * @param requestTimeoutSeconds An number of seconds before a request sent from
 * this Persister to another peer times out.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to save or load data. This is
 * suitable for debugging synchronization issues in a development environment.
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
