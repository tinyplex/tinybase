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
 * The LocalSynchronizer interface.
 * @category Synchronizer
 * @since v5.0.0
 */
/// LocalSynchronizer
/**
 * The createLocalSynchronizer function.
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
/// createLocalSynchronizer
