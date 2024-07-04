/**
 * The persister-remote module of the TinyBase project lets you save and load
 * Store data to and from a remote server.
 * @see Persistence guides
 * @packageDocumentation
 * @module persister-remote
 * @since v1.0.0
 */
/// persister-remote
/**
 * The RemotePersister interface represents a Persister that lets you save and
 * load Store data to and from a remote server.
 *
 * You should use the createRemotePersister function to create a RemotePersister
 * object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getUrls method for accessing the URLs the Store is being persisted to.
 * @category Persister
 * @since v4.3.14
 */
/// RemotePersister
{
  /**
   * The getUrls method returns the URLs the Store is being persisted to.
   * @returns The load and save URLs as a two-item array.
   * @example
   * This example creates a RemotePersister object against a newly-created Store
   * and then gets the URLs back out again.
   *
   * ```js
   * import {createRemotePersister} from 'tinybase/persisters/persister-remote';
   * import {createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   * const persister = createRemotePersister(
   *   store,
   *   'https://example.com/load',
   *   'https://example.com/save',
   *   5,
   * );
   *
   * console.log(persister.getUrls());
   * // -> ['https://example.com/load', 'https://example.com/save']
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v4.3.14
   */
  /// RemotePersister.getUrls
}
/**
 * The createRemotePersister function creates a RemotePersister object that can
 * persist the Store to a remote server.
 *
 * A RemotePersister only supports regular Store objects, and cannot be used to
 * persist the metadata of a MergeableStore.
 *
 * As well as providing a reference to the Store to persist, you must provide
 * `loadUrl` and `saveUrl` parameters. These identify the endpoints of the
 * server that support the `GET` method (to fetch the Store JSON to load) and
 * the `POST` method (to send the Store JSON to save) respectively.
 *
 * For when you choose to enable automatic loading for the Persister (with the
 * startAutoLoad method), it will poll the loadUrl for changes, using the `ETag`
 * HTTP header to identify if things have changed. The `autoLoadIntervalSeconds`
 * method is used to indicate how often to do this.
 *
 * If you are implementing the server portion of this functionality yourself,
 * remember to ensure that the `ETag` header changes every time the server's
 * Store content does - otherwise changes will not be detected by the client.
 * @param store The Store to persist.
 * @param loadUrl The endpoint that supports a `GET` method to load JSON.
 * @param saveUrl The endpoint that supports a `POST` method to save JSON.
 * @param autoLoadIntervalSeconds How often to poll the `loadUrl` when
 * automatically loading changes from the server, defaulting to 5.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new RemotePersister object.
 * @example
 * This example creates a RemotePersister object and persists the Store to a
 * remote server.
 *
 * ```js yolo
 * import {createRemotePersister} from 'tinybase/persisters/persister-remote';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createRemotePersister(
 *   store,
 *   'https://example.com/load',
 *   'https://example.com/save',
 *   5,
 * );
 *
 * await persister.save();
 * // Store JSON will be sent to server in a POST request.
 *
 * await persister.load();
 * // Store JSON will be fetched from server with a GET request.
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v1.0.0
 */
/// createRemotePersister
