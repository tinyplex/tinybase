/**
 * The persister-indexed-db module of the TinyBase project lets you save and
 * load Store data to and from browser IndexedDB storage.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-indexed-db
 */
/// persister-indexed-db
/**
 * The IndexedDbPersister interface is a minor extension to the Persister
 * interface.
 *
 * It simply provides an extra getDbName method for accessing the unique key of
 * the IndexedDB the Store is being persisted to.
 *
 * You should use the createIndexedDbPersister function to create an
 * IndexedDbPersister object.
 * @category Persister
 * @since v4.3.14
 */
/// IndexedDbPersister
{
  /**
   * The getDbName method returns the unique key of the IndexedDB the Store is
   * being persisted to.
   * @returns The unique key of the IndexedDB.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the unique key of the IndexedDB back out again.
   *
   * ```js
   * import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
   * import {createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createIndexedDbPersister(store, 'petStore');
   *
   * console.log(persister.getDbName());
   * // -> 'petStore'
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// IndexedDbPersister.getDbName
}
/**
 * The createIndexedDbPersister function creates an IndexedDbPersister object
 * that can persist a Store to the browser's IndexedDB storage.
 *
 * An IndexedDbPersister only supports regular Store objects, and cannot be used
 * to persist the metadata of a MergeableStore.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `dbName` parameter which is unique to your application. This is the key used
 * to identify which IndexedDB to use.
 *
 * Within that database, this Persister will create two object stores: one
 * called 't', and one called 'v'. These will contain the Store's tabular and
 * key-value data respectively, using 'k' and 'v' to store the key and value of
 * each entry, as shown in the example.
 *
 * Note that it is not possible to reactively detect changes to a browser's
 * IndexedDB. If you do choose to enable automatic loading for the Persister
 * (with the startAutoLoad method), it needs to poll the database for changes.
 * The `autoLoadIntervalSeconds` method is used to indicate how often to do
 * this.
 * @param store The Store to persist.
 * @param dbName The unique key to identify the IndexedDB to use.
 * @param autoLoadIntervalSeconds How often to poll the database when in
 * 'autoLoad' mode, defaulting to 1.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new IndexedDbPersister object.
 * @example
 * This example creates a IndexedDbPersister object and persists the Store to
 * the browser's IndexedDB storage.
 *
 * ```js
 * import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}})
 *   .setTable('species', {dog: {price: 5}})
 *   .setValues({open: true});
 * const persister = createIndexedDbPersister(store, 'petStore');
 *
 * await persister.save();
 * // IndexedDB ->
 * //   database petStore:
 * //     objectStore t:
 * //       object 0:
 * //         k: "pets"
 * //         v: {fido: {species: dog}}
 * //       object 1:
 * //         k: "species"
 * //         v: {dog: {price: 5}}
 * //     objectStore v:
 * //       object 0:
 * //         k: "open"
 * //         v: true
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v4.2.0
 */
/// createIndexedDbPersister
