/**
 * The persister-sync module of the TinyBase project lets you synchronize
 * MergeableStore data to and from another MergeableStore instance.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-sync
 */
/// persister-sync
/**
 * The SyncPersister interface is a minor extension to the Persister interface.
 *
 * It simply provides an extra getOtherStore method for accessing the reference
 * of the other MergeableStore that the MergeableStore is being persisted to.
 * @category Persister
 * @since v5.0.0
 */
/// SyncPersister
{
  /**
   * The getOtherStore method returns the reference of the other MergeableStore
   * that the MergeableStore is being persisted to.
   * @returns The reference of the other MergeableStore.
   * @example
   * This example creates a Persister object against a newly-created
   * MergeableStore and then gets the other MergeableStore back out
   * again.
   *
   * ```js
   * const store1 = createMergeableStore('store1').setTables({
   *   pets: {fido: {species: 'dog'}},
   * });
   * const store2 = createMergeableStore('store2');
   * const persister = createSyncPersister(store1, store2);
   *
   * console.log(persister.getOtherStore() == store2);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// SyncPersister.getOtherStore
}
/**
 * The createSyncPersister function creates a Persister object that can persist
 * one MergeableStore to another.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a `otherStore` parameter which identifies the other MergeableStore to
 * persist it to.
 * @param store The MergeableStore to persist.
 * @param otherStore The reference of the other MergeableStore.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new SyncPersister object.
 * @example
 * This example creates a SyncPersister object and persists one MergeableStore
 * to another.
 *
 * ```js
 * const store1 = createMergeableStore('store1').setTables({
 *   pets: {fido: {species: 'dog'}},
 * });
 * const store2 = createMergeableStore('store2');
 * const persister = createSyncPersister(store1, store2);
 *
 * await persister.save();
 * // Store2 will be synced with Store1.
 *
 * console.log(store2.getTables());
 * // -> {pets: {fido: {species: 'dog'}}}
 *
 * await persister.load();
 * // Store1 will be synced with Store2.
 *
 * persister.destroy();
 * ```
 * @category Creation
 */
/// createSyncPersister
