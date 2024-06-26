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
 * The Message enum is used to indicate the type of the message being passed
 * between Synchronizer instances.
 *
 * These message comprise the basic synchronization protocol for merging
 * MergeableStore instances across multiple systems.
 *
 * The enum is generally intended to be used internally within TinyBase itself
 * and opaque to applications that use synchronization.
 * @category Synchronization
 * @since v5.0.0
 */
/// Message
{
  /**
   * A message that is a response to a previous request.
   */
  /// Message.Response
  /**
   * A message that is a request to get ContentHashes from another
   * MergeableStore.
   */
  /// Message.GetContentHashes
  /**
   * A message that contains ContentHashes.
   */
  /// Message.ContentHashes
  /**
   * A message that contains a ContentDiff.
   */
  /// Message.ContentDiff
  /**
   * A message that is a request to get a TableDiff from another MergeableStore.
   */
  /// Message.GetTableDiff
  /**
   * A message that is a request to get a RowDiff from another MergeableStore.
   */
  /// Message.GetRowDiff
  /**
   * A message that is a request to get a CellDiff from another MergeableStore.
   */
  /// Message.GetCellDiff
  /**
   * A message that is a request to get a ValueDiff from another MergeableStore.
   */
  /// Message.GetValueDiff
}
/**
 * The Receive type.
 * @category Synchronization
 * @since v5.0.0
 */
/// Receive
/**
 * The Send type.
 * @category Synchronization
 * @since v5.0.0
 */
/// Send
/**
 * The SynchronizerStats type.
 * @category Development
 * @since v5.0.0
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
   * The startSync method.
   * @category Synchronization
   */
  /// Synchronizer.startSync
  /**
   * The stopSync method.
   * @category Synchronization
   */
  /// Synchronizer.stopSync
  /**
   * The getSynchronizerStats method.
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
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import {createMergeableStore} from 'tinybase';
 *
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
 * @since v5.0.0
 */
/// createCustomSynchronizer
