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
 * The IdOrNull type is a simple alias for the union of a string or `null`
 * value, where the string should be considered to be the key of an objects
 * (such as a Row Id string used in a Table), and typically `null` indicates a
 * wildcard - such as when used in the Store addRowListener method.
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
 * The GetNow type is used to represent a function that returns the current time
 * in milliseconds.
 *
 * This is used internally within the mergeable-store module, but is used for
 * the createMergeableStore function's second optional argument to allow
 * applications to override the clock used to generate timestamps.
 * @category Stamps
 * @since v6.2.0
 */
/// GetNow
/**
 * The Hlc type is a string that represents a Hybrid Logical Clock (HLC) value.
 *
 * HLCs are used to provide a globally unique timestamp that can be used to
 * order events across distributed systems. The Hlc type in TinyBase is a
 * sortable 16 character string that encodes a timestamp, a counter, and the
 * hash of a unique client identifier.
 *
 * - 42 bits (7 chars) for the time in milliseconds (~139 years).
 * - 24 bits (4 chars) for the counter (~16 million).
 * - 30 bits (5 chars) for the hash of unique client id (~1 billion).
 * @category Stamps
 * @since v6.2.0
 */
/// Hlc
/**
 * The Hash type is used within TinyBase (for example in the mergeable-store
 * module) to quickly compare the content of two objects.
 *
 * This is simply an alias for a JavaScript `number`.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v6.2.0
 */
/// Hash
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
/**
 * The getHlcFunctions function returns a set of utility functions for working
 * with the TinyBase Hybrid Logical Clock (HLC).
 *
 * An HLC is a sortable 16 character string that encodes a timestamp, a counter,
 * and the hash of a unique client identifier. You should provide that unique
 * client identifier as the `uniqueId` parameter to the function. Otherwise it
 * will be defaulted and the client suffix of the HLCs the `getNextHlc` function
 * generates will be non-deterministic.
 *
 * You can also provide a `getNow` function that returns the current time in
 * milliseconds, which is useful for testing purposes where fully deterministic
 * HLCs are required, rather than the current time.
 *
 * The stateful functions returned by this function are as follows.
 *
 * - `getNextHlc`: a function that returns the next HLC for this client based on
 *   the time and any other HLC values from other clients that have been seen.
 * - `seenHlc`: a function that takes an HLC and updates the internal state of
 *   the functions to ensure that the next HLC returned by `getNextHlc` is
 *   greater than the given seen HLC.
 * - `encodeHlc`: a function that takes a timestamp, a counter (and optionally a
 *   different `clientId`) and encodes the them into an HLC string.
 * - `decodeHlc`: a function that takes an HLC and returns an array containing
 *   the logical time, counter, and client Id parts.
 * - `getLastLogicalTime`: a function that returns the last logical time either
 *   generated or seen by this client.
 * - `getLastCounter`: a function that returns the last counter either generated
 *   or seen by this client.
 * - `getClientId`: a function that returns the client Id for this client;
 *   either uniquely generated or derived from the `uniqueId` parameter.
 * @param uniqueId An optional unique Id for the client.
 * @param getNow An optional function that generates millisecond timestamps,
 * defaulting to `Date.now`.
 * @returns An array of seven stateful functions as described above.
 * @category Stamps
 * @since v6.2.0
 * @example
 * This example gets the HLC functions (for a given client Id and a fixed time;
 * both for illustrative purposes), and then uses them:
 *
 * ```js
 * import {getHlcFunctions} from 'tinybase';
 *
 * const [
 *   getNextHlc,
 *   seenHlc,
 *   encodeHlc,
 *   decodeHlc,
 *   getLastLogicalTime,
 *   getLastCounter,
 *   getClientId,
 * ] = getHlcFunctions('client1', () => 73267200000); // This client is in 1972.
 *
 * // Generate an HLC based on the fixed time and the client Id.
 * console.log(getNextHlc());
 * // -> '03E3B------mmxrx'
 *
 * // Generate the next HLC. The time has not changed, so the counter does.
 * console.log(getNextHlc());
 * // -> '03E3B-----0mmxrx'
 *
 * // Another client thinks it is 1973.
 * seenHlc('0WakTk-----jmx_3');
 * // Generate the next HLC.
 *
 * // What is the state for the current client?
 * console.log(getLastLogicalTime());
 * // -> 104803200000
 * console.log(getLastCounter());
 * // -> 0
 * console.log(getClientId());
 * // -> 'mmxrx'
 *
 * // Encode an arbitrary HLC.
 * console.log(encodeHlc(73267203600, 7, 'client3'));
 * // -> '03E3BsF---6kmxfM'
 *
 * // Decode it again.
 * console.log(decodeHlc('03E3BsF---6kmxfM'));
 * // -> [73267203600, 7, 'kmxfM']
 * ```
 */
/// getHlcFunctions

/**
 * The getHash function returns a deterministic hash of a string, which can be
 * used to quickly compare the content of two entities.
 *
 * This is used internally within TinyBase (for example in the mergeable-store
 * module) to quickly compare the content of two objects, but is also useful for
 * applications that need to represent strings in a deterministic (though not
 * cryptographically safe) way.
 *
 * The hash uses the Fowler–Noll–Vo hash approach, producing a JavaScript
 * number. It is not guaranteed to be unique by any means, but small changes in
 * input generally produce large changes in output, so it should be sufficient
 * for most purposes.
 * @param string The string to hash.
 * @returns A hash of the string.
 * @example
 * This example gets the hash of two similar strings.
 * ```js
 * import {getHash} from 'tinybase';
 * console.log(getHash('Hello, world!'));
 * // -> 3985698964
 * console.log(getHash('Hello, world?'));
 * // -> 3549480870
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getHash

/**
 * The addOrRemoveHash function combines two hashes together, which, because it
 * is a simple alias for bitwise XOR, serves both as addition and removal of one
 * hash from the other.
 *
 * This is used internally within TinyBase to collate hashes of objects, such as
 * producing a hash for a Table which is composed of the hashes of its Rows.
 * @param hash1 A first hash.
 * @param hash2 A second hash to add or remove from the first.
 * @returns The resulting hash of the two hashes added to or removed from each
 * other.
 * @example
 * This example adds two hashes together.
 * ```js
 * import {addOrRemoveHash} from 'tinybase';
 *
 * const hash1 = 123456789;
 * const hash2 = 987654321;
 * console.log(addOrRemoveHash(hash1, hash2));
 * // -> 1032168868
 *
 * console.log(addOrRemoveHash(1032168868, hash1));
 * // -> 987654321
 * console.log(addOrRemoveHash(1032168868, hash2));
 * // -> 123456789
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// addOrRemoveHash

/**
 * The getTablesHash function returns a hash for the tabular part of a Store,
 * based on each Table Id and hash.
 * @param tableHashes An object containing each Table Id and its hash.
 * @returns A hash of the Tables.
 * @example
 * This example gets the hash of the tabular part of a Store.
 * ```js
 * import {getTablesHash} from 'tinybase';
 *
 * const tableHashes = {
 *   pets: 4262151841, // hash of its contents
 * };
 *
 * console.log(getTablesHash(tableHashes));
 * // -> 278115833
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getTablesHash

/**
 * The getTableInTablesHash function returns a hash for a single Table in a
 * Store, based on its Id and hash (in turn produced from its Rows).
 * @param tableId The Id of the Table.
 * @param tableHash The hash of the Table.
 * @returns A hash of the Table based on its content and Id.
 * @example
 * This example gets the hash of a Table and its Id.
 * ```js
 * import {getTableInTablesHash} from 'tinybase';
 *
 * const tableId = 'pets';
 * const tableHash = 4262151841; // hash of its contents
 *
 * console.log(getTableInTablesHash(tableId, tableHash));
 * // -> 278115833
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getTableInTablesHash

/**
 * The getTableHash function returns a hash for a single Table in a Store, based
 * on each Row Id and hash.
 * @param rowHashes An object containing each Row Id and its hash.
 * @returns A hash of the Table.
 * @example
 * This example gets the hash of a Table.
 * ```js
 * import {getTableHash} from 'tinybase';
 *
 * const rowHashes = {
 *   fido: 1810444343, // hash of its contents
 * };
 *
 * console.log(getTableHash(rowHashes));
 * // -> 4262151841
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getTableHash

/**
 * The getRowInTableHash function returns a hash for a single Row in a Table,
 * based on its Id and hash (in turn produced from its Cells).
 * @param rowId The Id of the Row.
 * @param rowHash The hash of the Row.
 * @returns A hash of the Row based on its content and Id.
 * @example
 * This example gets the hash of a Row and its Id.
 * ```js
 * import {getRowInTableHash} from 'tinybase';
 *
 * const rowId = 'fido';
 * const rowHash = 1810444343; // hash of its contents
 *
 * console.log(getRowInTableHash(rowId, rowHash));
 * // -> 4262151841
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getRowInTableHash

/**
 * The getRowHash function returns a hash for a single Row in a Table, based on
 * each Cell Id and hash.
 * @param cellHashes An object containing each Cell Id and its hash.
 * @returns A hash of the Row.
 * @example
 * This example gets the hash of a Row.
 * ```js
 * import {getRowHash} from 'tinybase';
 *
 * const cellHashes = {
 *   'species': 3002200796, // hash of 'dog' and '03E3B------mmxrx'
 * };
 *
 * console.log(getRowHash(cellHashes));
 * // -> 1810444343
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getRowHash

/**
 * The getCellInRowHash function returns a hash for a single Cell in a Row,
 * based on its Id and hash (in turn produced from its value).
 * @param cellId The Id of the Cell.
 * @param cellHash The hash of the Cell.
 * @returns A hash of the Cell based on its content and Id.
 * @example
 * This example gets the hash of a Cell and its Id.
 * ```js
 * import {getCellInRowHash} from 'tinybase';
 *
 * const cellId = 'species';
 * const cellHash = '3002200796'; // hash of 'dog' and '03E3B------mmxrx'
 *
 * console.log(getCellInRowHash(cellId, cellHash));
 * // -> 3777304796
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getCellInRowHash

/**
 * The getCellHash function returns a hash for a single Cell, based on its value
 * and the HLC of the Cell.
 * @param cell The Cell's value (or `undefined`).
 * @param cellHlc The HLC of the Cell.
 * @returns A hash of the Cell.
 * @example
 * This example gets the hash of a Cell and its HLC.
 * ```js
 * import {getCellHash} from 'tinybase';
 *
 * const cell = 'dog';
 * const cellHlc = '03E3B------mmxrx';
 *
 * console.log(getCellHash(cell, cellHlc));
 * // -> 3002200796
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getCellHash

/**
 * The getValuesHash function returns a hash for a Values object, based on each
 * Value Id and hash.
 * @param valueHashes An object containing each Value Id and its hash.
 * @returns A hash of the Values.
 * @example
 * This example gets the hash of a Values object.
 * ```js
 * import {getValuesHash} from 'tinybase';
 *
 * const valueHashes = {
 *   meaningOfLife: 312420374, // hash of 42 and '03E3B------mmxrx'
 * };
 *
 * console.log(getValuesHash(valueHashes));
 * // -> 4229195646
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getValuesHash

/**
 * The getValueInValuesHash function returns a hash for a single Value in a
 * Values object, based on its Id and hash (in turn produced from its value).
 * @param valueId The Id of the Value.
 * @param valueHash The hash of the Value.
 * @returns A hash of the Value based on its content and Id.
 * @example
 * This example gets the hash of a Value and its Id.
 * ```js
 * import {getValueInValuesHash} from 'tinybase';
 *
 * const valueId = 'meaningOfLife';
 * const valueHash = 312420374; // hash of 42 and '03E3B------mmxrx'
 *
 * console.log(getValueInValuesHash(valueId, valueHash));
 * // -> 330198963
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getValueInValuesHash

/**
 * The getValueHash function returns a hash for a single Value, based on its
 * value and the HLC of the Value.
 * @param value The Value (or `undefined`).
 * @param valueHlc The HLC of the Value.
 * @returns A hash of the Value.
 * @example
 * This example gets the hash of a Value and its HLC.
 * ```js
 * import {getValueHash} from 'tinybase';
 *
 * const value = 42;
 * const valueHlc = '03E3B------mmxrx';
 *
 * console.log(getValueHash(value, valueHlc));
 * // -> 312420374
 * ```
 * @category Hash
 * @since v6.2.0
 */
/// getValueHash
