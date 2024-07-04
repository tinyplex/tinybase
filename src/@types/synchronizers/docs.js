/**
 * The synchronizers module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances.
 * @see Synchronization guide
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
   * @category Enum
   * @since v5.0.0
   */
  /// Message.Response
  /**
   * A message that is a request to get ContentHashes from another
   * MergeableStore.
   * @category Enum
   * @since v5.0.0
   */
  /// Message.GetContentHashes
  /**
   * A message that contains ContentHashes.
   * @category Enum
   * @since v5.0.0
   */
  /// Message.ContentHashes
  /**
   * A message that contains a ContentDiff.
   * @category Enum
   * @since v5.0.0
   */
  /// Message.ContentDiff
  /**
   * A message that is a request to get a TableDiff from another MergeableStore.
   * @category Enum
   * @since v5.0.0
   */
  /// Message.GetTableDiff
  /**
   * A message that is a request to get a RowDiff from another MergeableStore.
   * @category Enum
   * @since v5.0.0
   */
  /// Message.GetRowDiff
  /**
   * A message that is a request to get a CellDiff from another MergeableStore.
   * @category Enum
   * @since v5.0.0
   */
  /// Message.GetCellDiff
  /**
   * A message that is a request to get a ValueDiff from another MergeableStore.
   * @category Enum
   * @since v5.0.0
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
   * @category Stat
   * @since v5.0.0
   */
  /// SynchronizerStats.sends
  /**
   * The number of times messages has been received.
   * @category Stat
   * @since v5.0.0
   */
  /// SynchronizerStats.receives
}
/**
 * A Synchronizer object lets you synchronize MergeableStore data with another
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
 * 'persisting' your MergeableStore to another client (and vice-versa).
 * @example
 * This example creates two empty MergeableStore objects, creates a
 * LocalSynchronizer for each, and starts synchronizing them. A change in one
 * becomes evident in the other.
 *
 * ```js
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import {createMergeableStore} from 'tinybase';
 *
 * const store1 = createMergeableStore();
 * const store2 = createMergeableStore();
 *
 * const synchronizer1 = createLocalSynchronizer(store1);
 * const synchronizer2 = createLocalSynchronizer(store2);
 *
 * await synchronizer1.startSync();
 * await synchronizer2.startSync();
 *
 * store1.setTables({pets: {fido: {species: 'dog'}}});
 * // ...
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 *
 * store2.setRow('pets', 'felix', {species: 'cat'});
 * // ...
 * console.log(store1.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * synchronizer1.destroy();
 * synchronizer2.destroy();
 * ```
 * @category Synchronizer
 * @since v5.0.0
 */
/// Synchronizer
{
  /**
   * The startSync method is used to start the process of synchronization
   * between this instance and another matching Synchronizer.
   *
   * The underlying implementation of a Synchronizer is shared with the
   * Persister framework, and so this startSync method is equivalent to starting
   * both auto-loading (listening to sync messages from other active
   * Synchronizer instances) and auto-saving (sending sync messages to it).
   *
   * This method is asynchronous so you should you `await` calls to this method
   * or handle the return type natively as a Promise.
   * @param initialContent An optional Content object used when no content is
   * available from another other peer Synchronizer instances.
   * @returns A Promise containing a reference to the Synchronizer object.
   * @example
   * This example creates two empty MergeableStore objects, creates a
   * LocalSynchronizer for each, and starts synchronizing them. A change in one
   * becomes evident in the other.
   *
   * ```js
   * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore();
   * const store2 = createMergeableStore();
   *
   * const synchronizer1 = createLocalSynchronizer(store1);
   * const synchronizer2 = createLocalSynchronizer(store2);
   *
   * await synchronizer1.startSync();
   * await synchronizer2.startSync();
   *
   * store1.setTables({pets: {fido: {species: 'dog'}}});
   * // ...
   * console.log(store2.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * store2.setRow('pets', 'felix', {species: 'cat'});
   * // ...
   * console.log(store1.getTables());
   * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * ```
   * @example
   * This example creates two empty MergeableStore objects, creates a
   * LocalSynchronizer for each, and starts synchronizing them with default
   * content. The default content from the first Synchronizer's startSync method
   * ends up populated in both MergeableStore instances: by the time the second
   * started, the first was available to synchronize with and its default was
   * not needed.
   *
   * ```js
   * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore();
   * const store2 = createMergeableStore();
   *
   * const synchronizer1 = createLocalSynchronizer(store1);
   * const synchronizer2 = createLocalSynchronizer(store2);
   *
   * await synchronizer1.startSync([{pets: {fido: {species: 'dog'}}}, {}]);
   * await synchronizer2.startSync([{pets: {felix: {species: 'cat'}}}, {}]);
   *
   * // ...
   *
   * console.log(store1.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * console.log(store2.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * ```
   * @category Synchronization
   * @since v5.0.0
   */
  /// Synchronizer.startSync
  /**
   * The stopSync method is used to stop the process of synchronization between
   * this instance and another matching Synchronizer.
   *
   * The underlying implementation of a Synchronizer is shared with the
   * Persister framework, and so this startSync method is equivalent to stopping
   * both auto-loading (listening to sync messages from other active
   * Synchronizer instances) and auto-saving (sending sync messages to them).
   * @returns A reference to the Synchronizer object.
   * @example
   * This example creates two empty MergeableStore objects, creates a
   * LocalSynchronizer for each, and starts - then stops - synchronizing them.
   * Subsequent changes are not merged.
   *
   * ```js
   * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore();
   * const synchronizer1 = createLocalSynchronizer(store1);
   * await synchronizer1.startSync();
   *
   * const store2 = createMergeableStore();
   * const synchronizer2 = createLocalSynchronizer(store2);
   * await synchronizer2.startSync();
   *
   * store1.setTables({pets: {fido: {species: 'dog'}}});
   * // ...
   * console.log(store1.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   * console.log(store2.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * synchronizer1.stopSync();
   * synchronizer2.stopSync();
   *
   * store1.setCell('pets', 'fido', 'color', 'brown');
   * // ...
   * console.log(store1.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'brown'}}}
   * console.log(store2.getTables());
   * // -> {pets: {fido: {species: 'dog'}}}
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * ```
   * @category Synchronization
   * @since v5.0.0
   */
  /// Synchronizer.stopSync
  /**
   * The getSynchronizerStats method provides a set of statistics about the
   * Synchronizer, and is used for debugging purposes.
   *
   * The SynchronizerStats object contains a count of the number of times the
   * Persister has sent and received messages.
   *
   * The method is intended to be used during development to ensure your
   * synchronization layer is acting as expected, for example.
   * @returns A SynchronizerStats object containing Synchronizer send and
   * receive statistics.
   * @example
   * This example gets the send and receive statistics of two active
   * Synchronizer instances.
   *
   * ```js
   * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore();
   * const store2 = createMergeableStore();
   *
   * const synchronizer1 = createLocalSynchronizer(store1);
   * const synchronizer2 = createLocalSynchronizer(store2);
   *
   * await synchronizer1.startSync();
   * await synchronizer2.startSync();
   *
   * store1.setTables({pets: {fido: {species: 'dog'}}});
   * // ...
   * store2.setRow('pets', 'felix', {species: 'cat'});
   * // ...
   *
   * console.log(synchronizer1.getSynchronizerStats());
   * // -> {receives: 4, sends: 5}
   * console.log(synchronizer2.getSynchronizerStats());
   * // -> {receives: 5, sends: 4}
   *
   * synchronizer1.destroy();
   * synchronizer2.destroy();
   * ```
   * @category Synchronization
   * @since v5.0.0
   */
  /// Synchronizer.getSynchronizerStats
}
/**
 * The createCustomSynchronizer function creates a Synchronizer object that can
 * persist one MergeableStore to another.
 *
 * As well as providing a reference to the MergeableStore to synchronize, you
 * must provide parameters which identify how to send and receive changes to and
 * from this MergeableStore and its peers. This is entirely dependent upon the
 * medium of communication used.
 * @param store The MergeableStore to synchronize.
 * @param send A Send function for sending a message.
 * @param registerReceive A callback (called once when the Synchronizer is
 * created) that is passed a Receive function that you need to ensure will
 * receive messages addressed or broadcast to this client.
 * @param destroy A function called when destroying the Persister which can be
 * used to clean up underlying resources.
 * @param requestTimeoutSeconds An number of seconds before a request sent from
 * this Persister to another peer times out.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to synchronize data. This is
 * suitable for debugging synchronization issues in a development environment.
 * @returns A reference to the new Synchronizer object.
 * @example
 * This example creates a function for creating custom Synchronizer objects via
 * a very naive pair of message buses (which are first-in, first-out). Each
 * Synchronizer can write to the other's bus, and they each poll to read from
 * their own. The example then uses these Synchronizer instances to sync two
 * MergeableStore objects together
 *
 * ```js
 * import {
 *   createCustomSynchronizer,
 *   createMergeableStore,
 *   getUniqueId,
 * } from 'tinybase';
 *
 * const bus1 = [];
 * const bus2 = [];
 *
 * const createBusSynchronizer = (store, localBus, remoteBus) => {
 *   let timer;
 *   const clientId = getUniqueId();
 *   return createCustomSynchronizer(
 *     store,
 *     (toClientId, requestId, message, body) => {
 *       // send
 *       remoteBus.push([clientId, requestId, message, body]);
 *     },
 *     (receive) => {
 *       // registerReceive
 *       timer = setInterval(() => {
 *         if (localBus.length > 0) {
 *           receive(...localBus.shift());
 *         }
 *       }, 1);
 *     },
 *     () => clearInterval(timer), // destroy
 *     1,
 *   );
 * };
 *
 * const store1 = createMergeableStore();
 * const store2 = createMergeableStore();
 *
 * const synchronizer1 = createBusSynchronizer(store1, bus1, bus2);
 * const synchronizer2 = createBusSynchronizer(store2, bus2, bus1);
 *
 * await synchronizer1.startSync();
 * await synchronizer2.startSync();
 *
 * store1.setTables({pets: {fido: {species: 'dog'}}});
 * store2.setTables({pets: {felix: {species: 'cat'}}});
 *
 * // ...
 * console.log(store1.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * synchronizer1.destroy();
 * synchronizer2.destroy();
 * ```
 * @category Creation
 * @since v5.0.0
 */
/// createCustomSynchronizer
