/**
 * The common module of the TinyBase project provides a small collection of
 * common types used across other modules.
 * @packageDocumentation
 * @module common
 * @since v1.0.0
 */
/// common
/**
 * The Json type is a simple alias for a string, but is used to indicate that
 * the string should be considered to be a JSON serialization of an object.
 * @category General
 * @since v1.0.0
 */
/// Json
/**
 * The Ids type is a simple alias for an array of strings, but is used to
 * indicate that the strings should be considered to be the keys of objects
 * (such as the Row Id strings used in a Table).
 * @category Identity
 * @since v1.0.0
 */
/// Ids
/**
 * The Id type is a simple alias for a string, but is used to indicate that the
 * string should be considered to be the key of an object (such as a Row Id
 * string used in a Table).
 * @category Identity
 * @since v1.0.0
 */
/// Id
/**
 * The Id type is a simple alias for the union of a string or `null` value,
 * where the string should be considered to be the key of an objects (such as a
 * Row Id string used in a Table), and typically `null` indicates a wildcard -
 * such as when used in the Store addRowListener method.
 * @category Identity
 * @since v1.0.0
 */
/// IdOrNull
/**
 * The ParameterizedCallback type represents a generic function that will take
 * an optional parameter - such as the handler of a DOM event.
 * @category Callback
 * @since v1.0.0
 */
/// ParameterizedCallback
/**
 * The Callback type represents a function that is used as a callback and which
 * does not take a parameter.
 * @category Callback
 * @since v1.0.0
 */
/// Callback
/**
 * The SortKey type represents a value that can be used by a sort function.
 * @category Parameter
 * @since v1.0.0
 */
/// SortKey
/**
 * The defaultSorter function is provided as a convenience to sort keys
 * alphanumerically, and can be provided to the `sliceIdSorter` and
 * `rowIdSorter` parameters of the setIndexDefinition method in the indexes
 * module, for example.
 * @param sortKey1 The first item of the pair to compare.
 * @param sortKey2 The second item of the pair to compare.
 * @returns A number indicating how to sort the pair.
 * @example
 * This example creates an Indexes object.
 *
 * ```js
 * import {createIndexes, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const indexes = createIndexes(store);
 * console.log(indexes.getIndexIds());
 * // -> []
 * ```
 * @example
 * This example creates a Store, creates an Indexes object, and defines an
 * Index based on the first letter of the pets' names. The Slice Ids (and Row
 * Ids within them) are alphabetically sorted using the defaultSorter function.
 *
 * ```js
 * import {createIndexes, createStore, defaultSorter} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 *
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition(
 *   'byFirst', //              indexId
 *   'pets', //                 tableId
 *   (_, rowId) => rowId[0], // each Row's Slice Id
 *   (_, rowId) => rowId, //    each Row's sort key
 *   defaultSorter, //          sort Slice Ids
 *   defaultSorter, //          sort Row Ids by sort key
 * );
 *
 * console.log(indexes.getSliceIds('byFirst'));
 * // -> ['c', 'f']
 * console.log(indexes.getSliceRowIds('byFirst', 'f'));
 * // -> ['felix', 'fido']
 * ```
 * @category Convenience
 * @since v1.0.0
 */
/// defaultSorter
/**
 * The getUniqueId function returns a unique string of a given length.
 *
 * This is used internally by TinyBase for the synchronizer protocol and for
 * unique MergeableStore identifiers. But it is useful enough for it to be
 * publicly exposed for purposes such as identifying shared collaboration rooms,
 * or creating other Ids that need to be unique.
 *
 * The string may contain numbers, lower or upper case letters, or the '-' or
 * '_' characters. This makes them URL-safe, and means they can be identified
 * with a regex like `/[-_0-9A-Za-z]+/`.
 *
 * This function prefers to use the `crypto` module to generate random numbers,
 * but where that is not available (such as in React Native), a `Math.random`
 * implementation is used. Whilst that may not be cryptographically sound, it
 * should suffice for most TinyBase-related purposes.
 * @param length The desired length of the unique Id, defaulting to 16.
 * @returns A unique Id of the required length.
 * @example
 * This example creates two 8 character long Ids and compares them.
 *
 * ```js
 * import {getUniqueId} from 'tinybase';
 *
 * const id1 = getUniqueId(8);
 * const id2 = getUniqueId(8);
 *
 * console.log(id1.length);
 * // -> 8
 * console.log(id2.length);
 * // -> 8
 * console.log(id1 == id2);
 * // -> false
 * ```
 * @category Convenience
 * @since v5.0.0
 */
/// getUniqueId
