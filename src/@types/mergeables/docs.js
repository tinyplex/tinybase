/**
 * The mergeables module contains the types, interfaces, and functions to work
 * with mergeable entities which provide merge and synchronization functionality
 * - such as Mergeable objects.
 *
 * Please be aware that a lot of the types and methods exposed by this module
 * are used internally within TinyBase itself (in particular the Synchronizer
 * framework). They're documented here, but mostly for interest, and it is
 * generally assumed that they won't be called directly by applications.
 *
 * As an application developer, it's more likely that you will continue to use
 * the main Store methods for reading, writing, and listening to data, and rely
 * on Synchronizer instances to keep the data in step with other places.
 * @packageDocumentation
 * @module mergeables
 * @since v7.0.0
 */
/// mergeables

/**
 * The GetNow type is used to represent a function that returns the current time
 * in milliseconds.
 *
 * This is used internally within the mergeable-store module, but is used for
 * the createMergeableStoreStore function's second optional argument, for
 * example, to allow applications to override the clock used to generate
 * timestamps.
 * @category Stamps
 * @since v7.0.0
 */
/// GetNow

/**
 * The Hash type is used within the mergeable-store module to quickly compare
 * the content of two objects.
 *
 * This is simply an alias for a JavaScript `number`.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// Hash
/**
 * The Time type is used within the mergeable-store module to store the value of
 * a hybrid logical clock (HLC).
 *
 * It is simply an alias for a JavaScript `string`, but it comprises three HLC
 * parts: a logical timestamp, a sequence counter, and a client Id. It is
 * designed to be string-sortable and unique across all of the systems involved
 * in synchronizing a Mergeable.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// Time
/**
 * The Stamp type is used as metadata to decide how to merge two different
 * Mergeable objects together.
 *
 * It describes a combination of a value (or object), a Time, and optionally a
 * Hash, all in an array.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// Stamp
/**
 * The ContentHashes type is used to quickly compare the content of two
 * Mergeable objects.
 *
 * It is simply an array of two Hash types, one for the Mergeable's Tables and
 * one for its Values.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v7.0.0
 */
/// ContentHashes
/**
 * The TablesStamp type is used as metadata to decide how to merge two different
 * sets of Tables together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// TablesStamp
/**
 * The TableHashes type is used to quickly compare the content of two sets of
 * Table objects.
 *
 * It is simply an object of Hash types, one for each Table Id in the Mergeable.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v7.0.0
 */
/// TableHashes
/**
 * The TableStamp type is used as metadata to decide how to merge two different
 * Table objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// TableStamp
/**
 * The RowHashes type is used to quickly compare the content of two sets of Row
 * objects.
 *
 * It is simply a nested object of Hash types, one for each Row Id, for each
 * TableId, in the Mergeable.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v7.0.0
 */
/// RowHashes
/**
 * The RowStamp type is used as metadata to decide how to merge two different
 * Row objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// RowStamp
/**
 * The CellHashes type is used to quickly compare the content of two sets of
 * Cell objects.
 *
 * It is simply a nested object of Hash types, one for each Cell Id, for each
 * Row Id, for each TableId, in the Mergeable.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v7.0.0
 */
/// CellHashes
/**
 * The CellStamp type is used as metadata to decide how to merge two different
 * Cell objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// CellStamp
/**
 * The ValuesStamp type is used as metadata to decide how to merge two different
 * sets of Values together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// ValuesStamp
/**
 * The ValueHashes type is used to quickly compare the content of two sets of
 * Value objects.
 *
 * It is simply an object of Hash types, one for each Value Id in the Mergeable.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v7.0.0
 */
/// ValueHashes
/**
 * The ValueStamp type is used as metadata to decide how to merge two different
 * Value objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v7.0.0
 */
/// ValueStamp
/**
 * The Mergeable type represents a Store that carries with it sufficient
 * metadata to be able to be merged with another Mergeable with deterministic
 * results.
 *
 * This is the key data type used when you need TinyBase data to be cleanly
 * synchronized or merged with data elsewhere on the system, or on another
 * system. It acts as a Conflict-Free Replicated Data Type (CRDT) which allows
 * deterministic disambiguation of how changes to different instances should be
 * merged.
 *
 * Please be aware that a lot of the methods exposed by this interface are used
 * internally within TinyBase itself (in particular the Synchronizer framework).
 * They're documented here, but mostly for interest, and it is generally assumed
 * that they won't be called directly by applications.
 *
 * As an application developer, it's more likely that you will continue to use
 * the main Store methods for reading, writing, and listening to data, and rely
 * on Synchronizer instances to keep the data in step with other places.
 *
 * One possible exceptions is the merge method, which can be used to simply
 * merge two co-located Mergeable instances together.
 * @example
 * This example shows very simple usage of the Mergeable: whereby two are
 * created, updated with different data, and then merged with one another.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 *
 * const localStore1 = createMergeableStore();
 * const localStore2 = createMergeableStore();
 *
 * localStore1.setCell('pets', 'fido', 'color', 'brown');
 * localStore2.setCell('pets', 'felix', 'color', 'black');
 *
 * localStore1.merge(localStore2);
 *
 * console.log(localStore1.getContent());
 * // -> [{pets: {felix: {color: 'black'}, fido: {color: 'brown'}}}, {}]
 *
 * console.log(localStore2.getContent());
 * // -> [{pets: {felix: {color: 'black'}, fido: {color: 'brown'}}}, {}]
 *```
 * @category Mergeable
 * @since v7.0.0
 */
/// Mergeable
{
  /**
   * The setDefaultContent method sets initial content of a Mergeable.
   *
   * This differs from the setMergeableContent method in that all of the
   * metadata is initialized with a empty HLC timestamp - meaning that any
   * changes applied to it will 'win', yet ensuring that at least default,
   * initial data exists.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   *
   * This method can also take a function that returns the content.
   * @param content An array containing the tabular and keyed-value data to be
   * set, or a function that returns the array.
   * @returns A reference to the Mergeable.
   * @example
   * This example creates a new MergeableStore with default data, and
   * demonstrates that it is overwritten with another MergeableStore's data on
   * merge, even if the other MergeableStore was provisioned earlier.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setValues({employees: 3});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setDefaultContent([{}, {employees: 4}]);
   * console.log(store2.getMergeableContent());
   * // -> [[{}, "", 0], [{"employees": [4, "", 2414055963]}, "", 3035768673]]
   *
   * store2.merge(store1);
   * console.log(store2.getContent());
   * // -> [{}, {employees: 3}]
   * ```
   * @category Setter
   * @since v7.0.0
   */
  /// Mergeable.setDefaultContent
  /**
   * The getMergeableContentHashes method returns hashes for the full content of
   * a Mergeable.
   *
   * If two Mergeable instances have different hashes, that indicates that the
   * mergeable Tables or Values within them are different and should be
   * synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A ContentHashes array for the hashes of the full content of the
   * Mergeable.
   * @example
   * This example creates a Mergeable, sets some data, and then accesses
   * the content hashes.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !reset
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * console.log(store.getMergeableContentHashes());
   * // -> [784336119, 0]
   *
   * store.setValue('open', true);
   * console.log(store.getMergeableContentHashes());
   * // -> [784336119, 2829789038]
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableContentHashes
  /**
   * The getMergeableTableHashes method returns hashes for the Table objects in
   * a Mergeable.
   *
   * If two Table Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A TableHashes object with the hashes of each Table in the
   * Mergeable.
   * @example
   * This example creates a Mergeable, sets some data, and then accesses
   * the Table hashes.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !reset
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * console.log(store.getMergeableTableHashes());
   * // -> {pets: 518810247}
   *
   * store.setCell('species', 'dog', 'price', 5);
   * console.log(store.getMergeableTableHashes());
   * // -> {pets: 518810247, species: 2324343240}
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableTableHashes
  /**
   * The getMergeableTableDiff method returns information about new and
   * differing Table objects of a Mergeable relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableHashes The TableHashes of another Mergeable.
   * @returns A pair of objects describing the new and differing Table objects
   * of this Mergeable relative to the other.
   * @example
   * This example creates two Mergeables, sets some differing data, and
   * then identifies the differences in the Table objects of one versus the
   * other. Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setTables({pets: {fido: {color: 'brown'}}});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setTables({
   *   pets: {fido: {species: 'dog'}},
   *   species: {dog: {price: 5}},
   * });
   *
   * console.log(
   *   store2.getMergeableTableDiff(store1.getMergeableTableHashes()),
   * );
   * // ->
   * [
   *   [{species: [{dog: [{price: [5, 'Nn1JUF----0CnH-J']}]}]}],
   *   {pets: 1212600658},
   * ];
   *
   * store1.merge(store2);
   *
   * console.log(
   *   store2.getMergeableTableDiff(store1.getMergeableTableHashes()),
   * );
   * // -> [[{}], {}]
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableTableDiff
  /**
   * The getMergeableRowHashes method returns hashes for Row objects in a
   * Mergeable.
   *
   * If two Row Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableHashes The TableHashes from the other Mergeable so that
   * the differences can be efficiently identified.
   * @returns A RowHashes object with the hashes of each Row in the relevant
   * Table objects of the Mergeable.
   * @example
   * This example creates a Mergeable, sets some data, and then accesses
   * the Row hashes for the differing Table Ids.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setTables({pets: {fido: {color: 'brown'}, felix: {color: 'tan'}}});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setTables({pets: {fido: {color: 'black'}, felix: {color: 'tan'}}});
   *
   * console.log(
   *   store1.getMergeableRowHashes(
   *     store2.getMergeableTableDiff(store1.getMergeableTableHashes())[1],
   *   ),
   * );
   * // -> {pets: {felix: 1683761402, fido: 851131566}}
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableRowHashes
  /**
   * The getMergeableRowDiff method returns information about new and differing
   * Row objects of a Mergeable relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableRowHashes The RowHashes of another Mergeable.
   * @returns A pair of objects describing the new and differing Row objects of
   * this Mergeable relative to the other.
   * @example
   * This example creates two Mergeables, sets some differing data, and
   * then identifies the differences in the Row objects of one versus the other.
   * Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setTables({pets: {fido: {color: 'brown'}}});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setTables({pets: {fido: {color: 'black'}, felix: {color: 'tan'}}});
   *
   * console.log(
   *   store2.getMergeableRowDiff(
   *     store1.getMergeableRowHashes(
   *       store2.getMergeableTableDiff(store1.getMergeableTableHashes())[1],
   *     ),
   *   ),
   * );
   * // ->
   * [
   *   [{pets: [{felix: [{color: ['tan', 'Nn1JUF----0CnH-J']}]}]}],
   *   {pets: {fido: 1038491054}},
   * ];
   *
   * store1.merge(store2);
   *
   * console.log(
   *   store2.getMergeableRowDiff(
   *     store1.getMergeableRowHashes(
   *       store2.getMergeableTableDiff(store1.getMergeableTableHashes())[1],
   *     ),
   *   ),
   * );
   * // -> [[{}], {}]
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableRowDiff
  /**
   * The getMergeableCellHashes method returns hashes for Cell objects in a
   * Mergeable.
   *
   * If two Cell Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableRowHashes The RowHashes from the other Mergeable so that
   * the differences can be efficiently identified.
   * @returns A CellHashes object with the hashes of each Cell in the relevant
   * Row objects of the Mergeable.
   * @example
   * This example creates a Mergeable, sets some data, and then accesses
   * the Cell hashes for the differing Table Ids.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setTables({pets: {fido: {color: 'brown', species: 'dog'}}});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setTables({pets: {fido: {color: 'black', species: 'dog'}}});
   *
   * console.log(
   *   store1.getMergeableCellHashes(
   *     store2.getMergeableRowDiff(
   *       store1.getMergeableRowHashes(
   *         store2.getMergeableTableDiff(store1.getMergeableTableHashes())[1],
   *       ),
   *     )[1],
   *   ),
   * );
   * // -> {pets: {fido: {color: 923684530, species: 227729753}}}
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableCellHashes
  /**
   * The getMergeableCellDiff method returns information about new and differing
   * Cell objects of a Mergeable relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableRowCellHashes The CellHashes of another Mergeable.
   * @returns The new and differing Cell objects of this Mergeable relative to
   * the other.
   * @example
   * This example creates two Mergeables, sets some differing data, and
   * then identifies the differences in the Cell objects of one versus the
   * other. Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setTables({pets: {fido: {color: 'brown'}}});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setTables({pets: {fido: {color: 'black', species: 'dog'}}});
   *
   * console.log(
   *   store2.getMergeableCellDiff(
   *     store1.getMergeableCellHashes(
   *       store2.getMergeableRowDiff(
   *         store1.getMergeableRowHashes(
   *           store2.getMergeableTableDiff(
   *             store1.getMergeableTableHashes(),
   *           )[1],
   *         ),
   *       )[1],
   *     ),
   *   ),
   * );
   * // ->
   * [
   *   {
   *     pets: [
   *       {
   *         fido: [
   *           {
   *             color: ['black', 'Nn1JUF-----CnH-J'],
   *             species: ['dog', 'Nn1JUF----0CnH-J'],
   *           },
   *         ],
   *       },
   *     ],
   *   },
   * ];
   *
   * store1.merge(store2);
   *
   * console.log(
   *   store2.getMergeableCellDiff(
   *     store1.getMergeableCellHashes(
   *       store2.getMergeableRowDiff(
   *         store1.getMergeableRowHashes(
   *           store2.getMergeableTableDiff(
   *             store1.getMergeableTableHashes(),
   *           )[1],
   *         ),
   *       )[1],
   *     ),
   *   ),
   * );
   * // -> [{}]
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableCellDiff
  /**
   * The getMergeableValueHashes method returns hashes for the Value objects in
   * a Mergeable.
   *
   * If two Value Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A ValueHashes object with the hashes of each Value in the
   * Mergeable.
   * @example
   * This example creates a Mergeable, sets some data, and then accesses
   * the Value hashes.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !reset
   *
   * store.setValue('employees', 3);
   * console.log(store.getMergeableValueHashes());
   * // -> {employees: 1940815977}
   *
   * store.setValue('open', true);
   * console.log(store.getMergeableValueHashes());
   * // -> {employees: 1940815977, open: 3860530645}
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableValueHashes
  /**
   * The getMergeableValueDiff method returns information about new and
   * differing Value objects of a Mergeable relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherValueHashes The ValueHashes of another Mergeable.
   * @returns The new and differing Value objects of this Mergeable relative to
   * the other.
   * @example
   * This example creates two Mergeables, sets some differing data, and
   * then identifies the differences in the Value objects of one versus the
   * other. Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !reset
   * store1.setValues({employees: 3});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setValues({employees: 4, open: true});
   *
   * console.log(
   *   store2.getMergeableValueDiff(store1.getMergeableValueHashes()),
   * );
   * // ->
   * [
   *   {
   *     employees: [4, 'Nn1JUF-----CnH-J'],
   *     open: [true, 'Nn1JUF----0CnH-J'],
   *   },
   * ];
   *
   * store1.merge(store2);
   *
   * console.log(
   *   store2.getMergeableValueDiff(store1.getMergeableValueHashes()),
   * );
   * // -> [{}]
   * ```
   * @category Syncing
   * @since v7.0.0
   */
  /// Mergeable.getMergeableValueDiff
}
