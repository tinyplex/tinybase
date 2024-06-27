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
 * The Receive type describes a function that knows how to handle the arrival of
 * a message as part of the synchronization protocol.
 *
 * When a message arrives (most likely from another system), the function will
 * be called with parameters that indicate where the message came from, and its
 * meaning and content.
 * @param fromClientId The Id of the other client (in other words, the other
 * system) that sent the message.
 * @param requestId The optional Id of the message, which should be returned in
 * the response (if requested) to constitute a matched request/response
 * transaction.
 * @param message A number that indicates the type of the message, according to
 * the Message enum.
 * @param body A message-specific payload.
 * @category Synchronization
 * @since v5.0.0
 */
/// Receive
/**
 * The Send type describes a function that knows how to dispatch a message as
 * part of the synchronization protocol.
 * @param toClientId The optional Id of the other client (in other words, the
 * other system) to which the message should be sent. If omitted, this is to be
 * a broadcast.
 * @param requestId The optional Id of the message, which should be awaited in
 * the response (if requested) to constitute a matched request/response
 * transaction.
 * @param message A number that indicates the type of the message, according to
 * the Message enum.
 * @param body A message-specific payload.
 * @category Synchronization
 * @since v5.0.0
 */
/// Send
/**
 * The SynchronizerStats type describes the number of times a Synchronizer
 * object has sent or received data.
 *
 * A SynchronizerStats object is returned from the getSynchronizerStats method.
 * @category Development
 * @since v5.0.0
 */
/// SynchronizerStats
{
  /**
   * The number of times messages have been sent.
   */
  /// SynchronizerStats.sends
  /**
   * The number of times messages has been received.
   */
  /// SynchronizerStats.receives
}
/**
 * The Synchronizer object lets you synchronize MergeableStore data with another
 * TinyBase client or system.
 *
 * This is useful for sharing data between users, or between devices of a single
 * user. This is especially valuable when there is the possibility that there
 * has been a lack of immediate connectivity between clients and the
 * synchronization requires some negotiation to orchestrate merging the
 * MergeableStore objects together.
 *
 * Creating a Synchronizer depends on the choice of underlying medium over which
 * the synchronization will take place. Options include the createWsSynchronizer
 * function (for a Synchronizer that will sync over web-sockets), and the
 * createLocalSynchronizer function (for a Synchronizer that will sync two
 * MergeableStore objects in memory on one system). The createCustomSynchronizer
 * function can also be used to easily create a fully customized way to send and
 * receive the messages of the synchronization protocol.
 *
 * Note that, as an interface, it is an extension to the Persister interface,
 * since they share underlying implementations. Think of a Synchronizer as
 * 'persisting' your MergeableStore to another client (and vice-versa). For
 * example, it provides extra convenience methods for starting and stopping the
 * synchronization.
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
 * @category Creation
 * @since v5.0.0
 */
/// createCustomSynchronizer
