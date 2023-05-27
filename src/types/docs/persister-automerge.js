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
 * @example
 * This more complex example uses Automerge updates to keep two Store objects
 * (each with their own Persister objects and Automerge documents) in sync with
 * each other. We use the `await` keyword extensively for the purpose of
 * ensuring sequentiality in this example.
 *
 * Typically, real-world synchronization would happen between two systems via a
 * Automerge network connection. Here, we synthesize that with the `syncDocs`
 * function.
 * @category Creation
 * @since v4.0
 */
/// createAutomergePersister
