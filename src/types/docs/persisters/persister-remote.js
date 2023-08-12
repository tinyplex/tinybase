/**
 * The persister-remote module of the TinyBase project lets you save and load
 * Store data to and from a remote server.
 * @see Persisting Data guide
 * @packageDocumentation
 * @module persister-remote
 */
/// persister-remote
/**
 * The createRemotePersister function creates a Persister object that can
 * persist the Store to a remote server.
 *
 * As well as providing a reference to the Store to persist, you must provide
 * `loadUrl` and `saveUrl` parameters. These identify the endpoints of the
 * server that support the `GET` method (to fetch the Store JSON to load) and
 * the `POST` method (to send the Store JSON to save) respectively.
 *
 * For when you choose to enable automatic loading for the Persister (with the
 * startAutoLoad method), it will poll the loadUrl for changes. The
 * `autoLoadIntervalSeconds` method is used to indicate how often to do this.
 * @param store The Store to persist.
 * @param loadUrl The endpoint that supports a `GET` method to load JSON.
 * @param saveUrl The endpoint that supports a `POST` method to save JSON.
 * @param autoLoadIntervalSeconds How often to poll the `loadUrl` when
 * automatically loading changes from the server.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment, since v4.0.4.
 * @returns A reference to the new Persister object.
 * @example
 * This example creates a Persister object and persists the Store to a remote
 * server.
 *
 * ```js yolo
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
 */
/// createRemotePersister
