/**
 * The persister-sync module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-sync
 */
/// persister-sync
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
 * The Bus type
 *
 */
/// Bus
/**
 * The SyncPersister interface is a minor extension to the Persister interface.
 *
 * It simply provides an extra getBus method for accessing the reference the Bus
 * that the MergeableStore is being persisted via.
 * @category Persister
 * @since v5.0.0
 */
/// SyncPersister
{
  /**
   * The getBus method returns the reference of the Bus that the MergeableStore
   * is being persisted via.
   * @returns The reference of the other MergeableStore.
   * @example
   * This example creates a Persister object against a newly-created
   * MergeableStore and then gets the reference to the Bus back out
   * again.
   *
   * ```js
   * const bus = createLocalBus();
   *
   * const store1 = createMergeableStore('store1').setTables({
   *   pets: {fido: {species: 'dog'}},
   * });
   * const persister = createSyncPersister(store1, bus);
   *
   * console.log(persister.getBus() == bus);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// SyncPersister.getBus
}
/**
 * The createSyncPersister function creates a Persister object that can persist
 * one MergeableStore to another.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a `bus` parameter which identifies the Bus that is used to transmit
 * changes to and from this MergeableStore and its peers. persist it to.
 * @param store The MergeableStore to persist.
 * @param bus The reference of the Bus.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new SyncPersister object.
 * @example
 * This example creates a SyncPersister object and persists one MergeableStore
 * to another.
 *
 * ```js
 * const bus = createLocalBus();
 *
 * const store1 = createMergeableStore('store1').setTables({
 *   pets: {fido: {species: 'dog'}},
 * });
 * const persister1 = createSyncPersister(store1, bus);
 *
 * const store2 = createMergeableStore('store2');
 * const persister2 = createSyncPersister(store2, bus);
 * await persister2.startAutoLoad();
 * await persister2.startAutoSave();
 *
 * await persister1.save();
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
/// createSyncPersister
/**
 * The createLocalBus function
 */
/// createLocalBus
