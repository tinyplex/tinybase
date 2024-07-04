/**
 * The persister-automerge module of the TinyBase project provides a way to save
 * and load Store data to and from an Automerge document.
 *
 * A single entry point, the createAutomergePersister function, is provided,
 * which returns a new Persister object that can bind a Store to a provided
 * Automerge document handle (and in turn, its document).
 * @see Third-Party CRDT Persistence guide
 * @packageDocumentation
 * @module persister-automerge
 * @since v4.0.0
 */
/// persister-automerge
/**
 * The AutomergePersister interface represents a Persister that lets you save
 * and load Store data to and from an Automerge document.
 *
 * You should use the createAutomergePersister function to create an
 * AutomergePersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getDocHandle method for accessing the Automerge document handler the
 * Store is being persisted to.
 * @category Persister
 * @since v4.3.14
 */
/// AutomergePersister
{
  /**
   * The getDocHandle method returns the Automerge document handler the Store is
   * being persisted to.
   * @returns The Automerge document handler.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the Automerge document handler back out again.
   *
   * ```js
   * import {Repo} from '@automerge/automerge-repo';
   * import {createAutomergePersister} from 'tinybase/persisters/persister-automerge';
   * import {createStore} from 'tinybase';
   *
   * const docHandler = new Repo({network: []}).create();
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createAutomergePersister(store, docHandler);
   *
   * console.log(persister.getDocHandle() == docHandler);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// AutomergePersister.getDocHandle
}
/**
 * The createAutomergePersister function creates an AutomergePersister object
 * that can persist the Store to an Automerge document.
 *
 * An AutomergePersister only supports regular Store objects, and cannot be used
 * to persist the metadata of a MergeableStore.
 *
 * As well as providing a reference to the Store to persist, you must provide
 * the Automerge document handler to persist it with.
 * @param store The Store to persist.
 * @param docHandle The Automerge document handler to persist the Store with.
 * @param docMapName The name of the map used inside the Automerge document to
 * sync the Store to (which otherwise will default to 'tinybase').
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new AutomergePersister object.
 * @example
 * This example creates a AutomergePersister object and persists the Store to an
 * Automerge document.
 *
 * ```js
 * import {Repo} from '@automerge/automerge-repo';
 * import {createAutomergePersister} from 'tinybase/persisters/persister-automerge';
 * import {createStore} from 'tinybase';
 *
 * const docHandler = new Repo({network: []}).create();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createAutomergePersister(store, docHandler);
 *
 * await persister.save();
 * // Store will be saved to the document.
 *
 * console.log(await docHandler.doc());
 * // -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
 *
 * persister.destroy();
 * ```
 * @example
 * This more complex example uses Automerge networking to keep two Store objects
 * (each with their own Persister objects and Automerge documents) in sync with
 * each other using a network.
 *
 * ```js
 * import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
 * import {Repo} from '@automerge/automerge-repo';
 * import {createAutomergePersister} from 'tinybase/persisters/persister-automerge';
 * import {createStore} from 'tinybase';
 *
 * // Bind the first Store to a network-enabled automerge-repo
 * const repo1 = new Repo({
 *   network: [new BroadcastChannelNetworkAdapter()],
 * });
 * const docHandler1 = repo1.create();
 * await docHandler1.doc();
 * const store1 = createStore();
 * const persister1 = createAutomergePersister(store1, docHandler1);
 * await persister1.startAutoLoad();
 * await persister1.startAutoSave();
 *
 * // Bind the second Store to a different network-enabled automerge-repo
 * const repo2 = new Repo({
 *   network: [new BroadcastChannelNetworkAdapter()],
 * });
 * const docHandler2 = repo2.find(docHandler1.documentId);
 * await docHandler2.doc();
 * const store2 = createStore();
 * const persister2 = createAutomergePersister(store2, docHandler2);
 * await persister2.startAutoLoad();
 * await persister2.startAutoSave();
 *
 * // A function that waits briefly and then for the documents to synchronize
 * // with each other, merely for the purposes of sequentiality in this example.
 * const syncDocsWait = async () => {
 *   await new Promise((resolve) => setTimeout(() => resolve(0), 100));
 *   await docHandler1.doc();
 *   await docHandler2.doc();
 * };
 *
 * // Wait for the documents to synchronize in their initial state.
 * await syncDocsWait();
 *
 * // Make a change to each of the two Stores.
 * store1.setTables({pets: {fido: {species: 'dog'}}});
 * store2.setValues({open: true});
 *
 * // Wait for the documents to synchronize in their new state.
 * await syncDocsWait();
 *
 * // Ensure the Stores are in sync.
 * console.log(store1.getContent());
 * // -> [{pets: {fido: {species: 'dog'}}}, {open: true}]
 * console.log(store2.getContent());
 * // -> [{pets: {fido: {species: 'dog'}}}, {open: true}]
 *
 * persister1.destroy();
 * persister2.destroy();
 * ```
 * @category Creation
 * @since v4.0.0
 */
/// createAutomergePersister
