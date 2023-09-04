/**
 * The persister-indexed-db module of the TinyBase project lets you save and
 * load Store data to and from browser IndexedDB storage.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-indexed-db
 */
/// persister-indexed-db
/**
 * The createIndexedDbPersister function creates a Persister object that can
 * persist the Store to the browser's IndexedDB storage.
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
 * Note that it is not possible to reactively detect changes to a browser
 * IndexedDB. If you do choose to enable automatic loading for the Persister
 * (with the startAutoLoad method), it needs to poll the database for changes.
 * The `autoLoadIntervalSeconds` method is used to indicate how often to do
 * this.
 * @param store The Store to persist.
 * @param dbName The unique key to identify the IndexedDB to use.
 * @param autoLoadIntervalSeconds How often to poll the database when in
 * 'autoLoad' mode.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to the
 * browser's IndexedDB storage.
 *
 * ```js
 * const store =
 *   createStore()
 *     .setTables({pets: {fido: {species: 'dog'}}})
 *     .setValues({open: true});
 * const persister = createIndexedDbPersister(store, 'petStore');
 *
 * await persister.save();
 * // IndexedDB:
 * //   database petStore:
 * //     objectStore t:
 * //       object 0:
 * //         k: pets
 * //         v: {"fido":{"species":"dog"}}}
 * //     objectStore v:
 * //       object 0:
 * //         k: open
 * //         v: true
 *
 * persister.destroy();
 * ```
 * @category Creation
 */
/// createIndexedDbPersister
