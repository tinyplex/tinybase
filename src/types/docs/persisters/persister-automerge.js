/**
 * The persister-automerge module of the TinyBase project provides a way to save
 * and load Store data, to and from an Automerge document.
 *
 * A single entry point, the createAutomergePersister function, is provided,
 * which returns a new Persister object that can bind a Store to a provided
 * Automerge document handle (and in turn, its document).
 *
 * @see Synchronizing Data guide
 * @packageDocumentation
 * @module persister-automerge
 * @since v4.0
 */
/// persister-automerge
/**
 * The createAutomergePersister function creates a Persister object that can
 * persist the Store to an Automerge document.
 *
 * As well as providing a reference to the Store to persist, you must provide
 * the Automerge document handler to persist it with.
 *
 * @param store The Store to persist.
 * @param docHandle The Automerge document handler to persist the Store with.
 * @param docMapName The name of the map used inside the Automerge document to
 * sync the Store to (which otherwise will default to 'tinybase').
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to an
 * Automerge document.
 *
 * ```js
 * const docHandler = new AutomergeRepo.Repo({network: []}).create();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createAutomergePersister(store, docHandler);
 *
 * await persister.save();
 * // Store will be saved to the document.
 *
 * console.log(docHandler.doc);
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
 * // Bind the first Store to a network-enabled automerge-repo
 * const repo1 = new AutomergeRepo.Repo({
 *   network: [new BroadcastChannelNetworkAdapter()],
 * });
 * const docHandler1 = repo1.create();
 * await docHandler1.value();
 * const store1 = createStore();
 * const persister1 = createAutomergePersister(store1, docHandler1);
 * await persister1.startAutoLoad();
 * await persister1.startAutoSave();
 *
 * // Bind the second Store to a different network-enabled automerge-repo
 * const repo2 = new AutomergeRepo.Repo({
 *   network: [new BroadcastChannelNetworkAdapter()],
 * });
 * const docHandler2 = repo2.find(docHandler1.documentId);
 * await docHandler2.value();
 * const store2 = createStore();
 * const persister2 = createAutomergePersister(store2, docHandler2);
 * await persister2.startAutoLoad();
 * await persister2.startAutoSave();
 *
 * // A function that waits briefly and then for the documents to synchronize
 * // with each other, merely for the purposes of sequentiality in this example.
 * const syncDocsWait = async () => {
 *   await new Promise((resolve) => setTimeout(() => resolve(0), 10));
 *   await docHandler1.value();
 *   await docHandler2.value();
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
 * @since v4.0
 */
/// createAutomergePersister
