/**
 * The persister-sync module of the TinyBase project lets you synchronize
 * MergeableStore data to and from other MergeableStore instances.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-sync
 * @since v5.0.0
 */
/// persister-sync
/**
 * The MessageType type
 *
 */
/// MessageType
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
 * The Client type
 *
 */
/// Client
/**
 * The ClientStats type
 *
 */
/// ClientStats
/**
 * The SyncPersister interface is a minor extension to the Persister interface.
 *
 * It simply provides an extra getClient method for accessing the reference the
 * Client that the MergeableStore is being persisted via.
 * @category Persister
 * @since v5.0.0
 */
/// SyncPersister
{
  /**
   * The getClient method returns the reference of the Client that the
   * MergeableStore is being persisted via.
   * @returns The reference of the other MergeableStore.
   * @example
   * This example creates a Persister object against a newly-created
   * MergeableStore and then gets the reference to the Client back out
   * again.
   *
   * ```js
   * const client = createLocalClient();
   *
   * const store1 = createMergeableStore('store1').setTables({
   *   pets: {fido: {species: 'dog'}},
   * });
   * const persister = createSyncPersister(store1, client);
   *
   * console.log(persister.getClient() == client);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// SyncPersister.getClient
  /**
   * The startSync method
   */
  /// SyncPersister.startSync
  /**
   * The stopSync method
   */
  /// SyncPersister.stopSync
}
/**
 * The createSyncPersister function creates a Persister object that can persist
 * one MergeableStore to another.
 *
 * As well as providing a reference to the MergeableStore to persist, you must
 * provide a `client` parameter which identifies the Client that is used to
 * transmit changes to and from this MergeableStore and its peers. persist it
 * to.
 * @param store The MergeableStore to persist.
 * @param client The reference of the Client.
 * @param requestTimeoutSeconds An optional number of seconds before a request
 * to the Client times out, defaulting to 5.
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
 * const persister1 = createSyncPersister(store1, createLocalClient());
 *
 * const store2 = createMergeableStore('store2');
 * const persister2 = createSyncPersister(store2, createLocalClient());
 * await persister2.startSync();
 *
 * await persister1.save();
 * // ...
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
 * The createLocalClient function
 */
/// createLocalClient
