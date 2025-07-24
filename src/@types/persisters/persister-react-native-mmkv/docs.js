/**
 * The persister-react-native-mmkv module of the TinyBase project lets you
 * save and load Store data to and from a MMKV storage using the
 * [`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv) module (in an appropriate React Native
 * environment).
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-react-native-mmkv
 * @since v6.4.0
 */
/// persister-react-native-mmkv
/**
 * The ReactNativeMMKVPersister interface represents a Persister that lets you
 * save and load Store data to and from a `react-native-mmkv`
 * storage.
 *
 * You should use the createReactNativeMMKVPersister function to create an
 * ReactNativeMMKVPersister object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getStorageName method for accessing the unique key of the storage
 * location the Store is being persisted to.
 * @category Persister
 * @since v6.4.0
 */
/// ReactNativeMMKVPersister

/**
 * The getStorageName method returns the unique key of the storage location
 * the Store is being persisted to.
 * @returns The unique key of the storage location.
 * @example
 * This example creates a Persister object against a newly-created Store and
 * then gets the unique key of the storage location back out again.
 *
 * ```js
 * import {MMKV} from 'react-native-mmkv';
 * import {createStore} from 'tinybase';
 * import {createReactNativeMMKVPersister} from 'tinybase/persisters/persister-react-native-mmkv';
 *
 * const storage = new MMKV();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createReactNativeMMKVPersister(
 *   store,
 *   storage,
 *   'my_tinybase',
 * );
 * console.log(persister.getStorageName() == 'my_tinybase');
 * // -> true
 *
 * await persister.destroy();
 * ```
 * @category Getter
 * @since v6.4.0
 */
/// ReactNativeMMKVPersister.getStorageName

/**
 * The createReactNativeMMKVPersister function creates an
 * ReactNativeMMKVPersister object that can persist the Store to a local
 * `react-native-mmkv` storage.
 *
 * A ReactNativeMMKVPersister supports both regular Store and MergeableStore
 * objects.
 *
 * As well as providing a reference to the Store to persist, you must provide a
 * `storage` parameter which identifies the MMKV storage instance.
 *
 * The third argument is a `storageName` string that configures which key to use
 * for the storage key.
 * @param store The Store or MergeableStore to persist.
 * @param storage The MMKV storage instance.
 * @param storageName The unique key to identify the storage location.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new ReactNativeMMKVPersister object.
 * @example
 * This example creates a ReactNativeMMKVPersister object and persists the
 * Store to a MMKV storage instance as a JSON serialization into the
 * `my_tinybase` key. It makes a change to the storage directly and then
 * reloads it back into the Store.
 *
 * ```js
 * import {MMKV} from 'react-native-mmkv';
 * import {createStore} from 'tinybase';
 * import {createReactNativeMMKVPersister} from 'tinybase/persisters/persister-react-native-mmkv';
 *
 * const storage = new MMKV();
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createReactNativeMMKVPersister(
 *   store,
 *   storage,
 *   'my_tinybase',
 * );
 *
 * await persister.save();
 * // Store will be saved to the MMKV storage.
 *
 * console.log(storage.getString('my_tinybase'));
 * // -> '[{"pets":{"fido":{"species":"dog"}}},{}]'
 *
 * await persister.destroy();
 * storage.delete('my_tinybase');
 * ```
 * @category Creation
 * @since v6.4.0
 */
/// createReactNativeMMKVPersister
