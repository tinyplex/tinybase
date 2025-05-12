/**
 * The synchronizer-local module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances on the same
 * local machine.
 * @see Synchronization guide
 * @packageDocumentation
 * @module synchronizer-local
 * @since v5.0.0
 */
/// synchronizer-local
/**
 * The LocalSynchronizer interface represents a Synchronizer that lets you
 * synchronize MergeableStore data to and from other MergeableStore instances on
 * the same local machine.
 *
 * You should use the createLocalSynchronizer function to create a
 * LocalSynchronizer object.
 *
 * Having no specialized methods, it is a synonym for the Synchronizer
 * interface. This is also something of a showcase Synchronizer, rather than
 * something you would use in a production environment. If you _do_ need to
 * synchronize two in-memory MergeableStore instances, you may prefer to use the
 * merge function on either one of them instead of going to the effort of
 * setting up this Synchronizer.
 * @category Synchronizer
 * @since v5.0.0
 */
/// LocalSynchronizer
/**
 * The createLocalSynchronizer function creates a LocalSynchronizer object that
 * can synchronize MergeableStore data to and from other MergeableStore
 * instances on the same local machine.
 *
 * This is something of a showcase Synchronizer, rather than something you would
 * use in a production environment. If you _do_ need to synchronize two
 * in-memory MergeableStore instances, you may prefer to use the merge function
 * on either one of them instead of going to the effort of setting up this
 * Synchronizer.
 *
 * As well as providing a reference to the MergeableStore to persist, a final
 * set of optional handlers can be provided to help debug sends, receives, and
 * errors respectively.
 * @param store The MergeableStore to synchronize.
 * @param onSend An optional handler for the messages that this Synchronizer
 * sends. This is suitable for debugging synchronization issues in a development
 * environment, since v5.1.
 * @param onReceive An optional handler for the messages that this Synchronizer
 * receives. This is suitable for debugging synchronization issues in a
 * development environment, since v5.1.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to synchronize data. This is
 * suitable for debugging synchronization issues in a development environment.
 * @returns A reference to the new LocalSynchronizer object.
 * @example
 * This example creates two LocalSynchronizer objects to synchronize one
 * MergeableStore to another.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
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
 * store2.setTables({pets: {felix: {species: 'cat'}}});
 *
 * // ...
 * console.log(store1.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * await synchronizer1.destroy();
 * await synchronizer2.destroy();
 * ```
 * @category Creation
 * @since v5.0.0
 */
/// createLocalSynchronizer
