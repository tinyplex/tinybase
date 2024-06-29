/**
 * The synchronizer-local module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances on the same
 * local machine.
 * @see Synchronizing Data guide
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
 * Having no specialized methods, it is a synonym for the Synchronizer
 * interface. This is also something of a showcase Synchronizer, rather than
 * something you would use in a production environment. If you _do_ need to
 * synchronize two in-memory MergeableStore instances, you may prefer to use the
 * merge function on either one of them instead of going to the effort of
 * setting up this Synchronizer.
 *
 * You should use the createLocalSynchronizer function to create a
 * LocalSynchronizer object.
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
 * As well as providing a reference to the MergeableStore to persist, you can
 * provide a handler for any otherwise ignored synchronization errors.
 * @param store The MergeableStore to synchronize.
 * @param onIgnoredError An optional handler for the errors that the
 * Synchronizer would otherwise ignore when trying to synchronize data. This is
 * suitable for debugging synchronization issues in a development environment.
 * @returns A reference to the new LocalSynchronizer object.
 * @example
 * This example creates a LocalSynchronizer object and synchronizes one
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
/// createLocalSynchronizer
