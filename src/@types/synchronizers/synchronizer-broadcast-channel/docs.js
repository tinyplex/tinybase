/**
 * The synchronizer-broadcast-channel module of the TinyBase project lets you
 * synchronize MergeableStore data to and from other MergeableStore instances
 * via a browser's BroadcastChannel API.
 * @see Synchronization guide
 * @packageDocumentation
 * @module synchronizer-broadcast-channel
 * @since v5.0.0
 */
/// synchronizer-broadcast-channel
/**
 * The BroadcastChannelSynchronizer interface represents a Synchronizer that
 * lets you synchronize MergeableStore data to and from other MergeableStore
 * instances via a browser's BroadcastChannel API.
 *
 * You should use the createBroadcastChannelSynchronizer function to create a
 * BroadcastChannelSynchronizer object.
 *
 * It is a minor extension to the Synchronizer interface and simply provides an
 * extra getChannelName method for accessing the name of the channel being used.
 * @category Synchronizer
 * @since v5.0.0
 */
/// BroadcastChannelSynchronizer
{
  /**
   * The getChannelName method returns the name of the channel being used for
   * synchronization.
   * @returns The channel name.
   * @example
   * This example creates a BroadcastChannelSynchronizer object for a
   * newly-created MergeableStore and then gets the channel name back out again.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   * import {createBroadcastChannelSynchronizer} from 'tinybase/synchronizers/synchronizer-broadcast-channel';
   *
   * const store = createMergeableStore();
   * const synchronizer = await createBroadcastChannelSynchronizer(
   *   store,
   *   'channelA',
   * );
   *
   * console.log(synchronizer.getChannelName());
   * // -> 'channelA'
   *
   * synchronizer.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// BroadcastChannelSynchronizer.getChannelName
}
/**
 * The createBroadcastChannelSynchronizer function creates a
 * BroadcastChannelSynchronizer object that can synchronize MergeableStore data
 * to and from other MergeableStore instances via a browser's BroadcastChannel
 * API.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a channel name, used by all the browser tabs, workers, or contexts
 * that need to synchronize together.
 * @param store The MergeableStore to synchronize.
 * @param channelName The name of the channel to use.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to synchronize data. This is
 * suitable for debugging synchronization issues in a development environment.
 * @returns A reference to the new BroadcastChannelSynchronizer object.
 * @example
 * This example creates two BroadcastChannelSynchronizer objects to synchronize
 * one MergeableStore to another.
 *
 * ```js
 * import {createBroadcastChannelSynchronizer} from 'tinybase/synchronizers/synchronizer-broadcast-channel';
 * import {createMergeableStore} from 'tinybase';
 *
 * const store1 = createMergeableStore();
 * const store2 = createMergeableStore();
 *
 * const synchronizer1 = createBroadcastChannelSynchronizer(store1, 'channelA');
 * const synchronizer2 = createBroadcastChannelSynchronizer(store2, 'channelA');
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
/// createBroadcastChannelSynchronizer
