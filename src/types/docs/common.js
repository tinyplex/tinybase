/**
 * The common module of the TinyBase project provides a small collection of
 * common types used across other modules.
 * @packageDocumentation
 * @module common
 */
/// common
/**
 * The Json type is a simple alias for a string, but is used to indicate that
 * the string should be considered to be a JSON serialization of an object.
 * @category General
 */
/// Json
/**
 * The Ids type is a simple alias for an array of strings, but is used to
 * indicate that the strings should be considered to be the keys of objects
 * (such as the Row Id strings used in a Table).
 * @category Identity
 */
/// Ids
/**
 * The Id type is a simple alias for a string, but is used to indicate that the
 * string should be considered to be the key of an object (such as a Row Id
 * string used in a Table).
 * @category Identity
 */
/// Id
/**
 * The Id type is a simple alias for the union of a string or `null` value,
 * where the string should be considered to be the key of an objects (such as a
 * Row Id string used in a Table), and typically `null` indicates a wildcard -
 * such as when used in the Store addRowListener method.
 * @category Identity
 */
/// IdOrNull
/**
 * The ParameterizedCallback type represents a generic function that will take
 * an optional parameter - such as the handler of a DOM event.
 * @category Callback
 */
/// ParameterizedCallback
/**
 * The Callback type represents a function that is used as a callback and which
 * does not take a parameter.
 * @category Callback
 */
/// Callback
/**
 * The SortKey type represents a value that can be used by a sort function.
 * @category Parameter
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
 */
/// defaultSorter
/**
 * The getUniqueId function
 * @category Convenience
 * @since v5.0.0
 */
/// getUniqueId
