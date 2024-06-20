/**
 * The mergeable-store module contains the types, interfaces, and functions to
 * work with MergeableStore objects, which provide merge and synchronization
 * functionality.
 *
 * The main entry point to this module is the createMergeableStore function,
 * which returns a new MergeableStore, a subtype of Store that can be merged
 * with another with deterministic results.
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
 * @module mergeable-store
 * @since v5.0.0
 */
/// mergeable-store
/**
 * The Hash type is used within the mergeable-store module to quickly compare
 * the content of two objects.
 *
 * This is simply an alias for a JavaScript `number`.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// Hash
/**
 * The Time type is used within the mergeable-store module to store the value of
 * a hybrid logical clock (HLC).
 *
 * It is simply an alias for a JavaScript `string`, but it comprises three HLC
 * parts: a logical timestamp, a sequence counter, and a client Id. It is
 * designed to be string-sortable and unique across all of the systems involved
 * in synchronizing a MergeableStore.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// Time
/**
 * The Stamp type is used as metadata to decide how to merge two different
 * MergeableStore objects together.
 *
 * It describes a combination of a value (or object), a Time, and optionally a
 * Hash, all in an array.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// Stamp
/**
 * The ContentHashes type is used to quickly compare the content of two
 * MergeableStore objects.
 *
 * It is simply an array of two Hash types, one for the MergeableStore's Tables
 * and one for its Values.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v5.0.0
 */
/// ContentHashes
/**
 * The TablesStamp type is used as metadata to decide how to merge two different
 * sets of Tables together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// TablesStamp
/**
 * The TableHashes type is used to quickly compare the content of two sets of
 * Table objects.
 *
 * It is simply an object of Hash types, one for each Table Id in the
 * MergeableStore.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v5.0.0
 */
/// TableHashes
/**
 * The TableStamp type is used as metadata to decide how to merge two different
 * Table objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// TableStamp
/**
 * The RowHashes type is used to quickly compare the content of two sets of Row
 * objects.
 *
 * It is simply a nested object of Hash types, one for each Row Id, for each
 * TableId, in the MergeableStore.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v5.0.0
 */
/// RowHashes
/**
 * The RowStamp type is used as metadata to decide how to merge two different
 * Row objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// RowStamp
/**
 * The CellHashes type is used to quickly compare the content of two sets of
 * Cell objects.
 *
 * It is simply a nested object of Hash types, one for each Cell Id, for each
 * Row Id, for each TableId, in the MergeableStore.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v5.0.0
 */
/// CellHashes
/**
 * The CellStamp type is used as metadata to decide how to merge two different
 * Cell objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// CellStamp
/**
 * The ValuesStamp type is used as metadata to decide how to merge two different
 * sets of Values together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// ValuesStamp
/**
 * The ValueHashes type is used to quickly compare the content of two sets of
 * Value objects.
 *
 * It is simply an object of Hash types, one for each Value Id in the
 * MergeableStore.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Syncing
 * @since v5.0.0
 */
/// ValueHashes
/**
 * The ValueStamp type is used as metadata to decide how to merge two different
 * Value objects together.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Stamps
 * @since v5.0.0
 */
/// ValueStamp
/**
 * The MergeableContent type represents the content of a MergeableStore and the
 * metadata about that content) required to merge it with another.
 *
 * It is simply an array of two Stamp types, one for the MergeableStore's Tables
 * and one for its Values.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Mergeable
 * @since v5.0.0
 */
/// MergeableContent
/**
 * The MergeableChanges type represents changes to the content of a
 * MergeableStore and the metadata about that content) required to merge it with
 * another.
 *
 * It is simply an array of two Stamp types, one for changes to the
 * MergeableStore's Tables and one for changes to its Values. A final `1` is
 * used to distinguish it from a full MergeableContent object.
 *
 * This type is mostly utilized internally within TinyBase itself and is
 * generally assumed to be opaque to applications that use it.
 * @category Mergeable
 * @since v5.0.0
 */
/// MergeableChanges
/**
 * The MergeableStore type represents a Store that carries with it sufficient
 * metadata to be able to be merged with another MergeableStore with
 * deterministic results.
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
 * merge two co-located MergeableStore instances together.
 * @example
 * This example shows very simple usage of the MergeableStore: whereby two are
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
 * @since v5.0.0
 */
/// MergeableStore
{
  /**
   * The getMergeableContent method returns the full content of a
   * MergeableStore, together with the metadata required to make it mergeable
   * with another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A MergeableContent object for the full content of the
   * MergeableStore.
   * @example
   * This example creates a MergeableStore, sets some data, and then accesses
   * the content and metadata required to make it mergeable.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !resetHlc
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   *
   * console.log(store.getMergeableContent());
   * // ->
   * [
   *   [
   *     {
   *       pets: [
   *         {
   *           fido: [
   *             {color: ['brown', 'Nn1JUF-----FnHIC', 923684530]},
   *             '',
   *             851131566,
   *           ],
   *         },
   *         '',
   *         518810247,
   *       ],
   *     },
   *     '',
   *     784336119,
   *   ],
   *   [{}, '', 0],
   * ];
   * ```
   * @category Getter
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableContent
  /**
   * The getMergeableContentHashes method returns hashes for the full content of
   * a MergeableStore.
   *
   * If two MergeableStore instances have different hashes, that indicates that
   * the mergeable Tables or Values within them are different and should be
   * synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A ContentHashes array for the hashes of the full content of the
   * MergeableStore.
   * @example
   * This example creates a MergeableStore, sets some data, and then accesses
   * the content hashes.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableContentHashes
  /**
   * The getMergeableTableHashes method returns hashes for the Table objects in
   * a MergeableStore.
   *
   * If two Table Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A TableHashes object with the hashes of each Table in the
   * MergeableStore.
   * @example
   * This example creates a MergeableStore, sets some data, and then accesses
   * the Table hashes.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableTableHashes
  /**
   * The getMergeableTableDiff method returns information about new and
   * differing Table objects of a MergeableStore relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableHashes The TableHashes of another MergeableStore.
   * @returns A pair of objects describing the new and differing Table objects
   * of this MergeableStore relative to the other.
   * @example
   * This example creates two MergeableStores, sets some differing data, and
   * then identifies the differences in the Table objects of one versus the
   * other. Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableTableDiff
  /**
   * The getMergeableRowHashes method returns hashes for Row objects in a
   * MergeableStore.
   *
   * If two Row Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableHashes The TableHashes from the other MergeableStore so
   * that the differences can be efficiently identified.
   * @returns A RowHashes object with the hashes of each Row in the relevant
   * Table objects of the MergeableStore.
   * @example
   * This example creates a MergeableStore, sets some data, and then accesses
   * the Row hashes for the differing Table Ids.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableRowHashes
  /**
   * The getMergeableRowDiff method returns information about new and differing
   * Row objects of a MergeableStore relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableRowHashes The RowHashes of another MergeableStore.
   * @returns A pair of objects describing the new and differing Row objects of
   * this MergeableStore relative to the other.
   * @example
   * This example creates two MergeableStores, sets some differing data, and
   * then identifies the differences in the Row objects of one versus the other.
   * Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableRowDiff
  /**
   * The getMergeableCellHashes method returns hashes for Cell objects in a
   * MergeableStore.
   *
   * If two Cell Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableRowHashes The RowHashes from the other MergeableStore so
   * that the differences can be efficiently identified.
   * @returns A CellHashes object with the hashes of each Cell in the relevant
   * Row objects of the MergeableStore.
   * @example
   * This example creates a MergeableStore, sets some data, and then accesses
   * the Cell hashes for the differing Table Ids.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableCellHashes
  /**
   * The getMergeableCellDiff method returns information about new and differing
   * Cell objects of a MergeableStore relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherTableRowCellHashes The CellHashes of another MergeableStore.
   * @returns The new and differing Cell objects of this MergeableStore relative
   * to the other.
   * @example
   * This example creates two MergeableStores, sets some differing data, and
   * then identifies the differences in the Cell objects of one versus the
   * other. Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableCellDiff
  /**
   * The getMergeableValueHashes method returns hashes for the Value objects in
   * a MergeableStore.
   *
   * If two Value Ids have different hashes, that indicates that the content
   * within them is different and should be synchronized.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A ValueHashes object with the hashes of each Value in the
   * MergeableStore.
   * @example
   * This example creates a MergeableStore, sets some data, and then accesses
   * the Value hashes.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableValueHashes
  /**
   * The getMergeableValueDiff method returns information about new and
   * differing Value objects of a MergeableStore relative to another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param otherValueHashes The ValueHashes of another MergeableStore.
   * @returns The new and differing Value objects of this MergeableStore
   * relative to the other.
   * @example
   * This example creates two MergeableStores, sets some differing data, and
   * then identifies the differences in the Value objects of one versus the
   * other. Once they have been merged, the differences are empty.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
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
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableValueDiff
  /**
   * The setMergeableContent method sets the full content of a MergeableStore,
   * together with the metadata required to make it mergeable with another.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param content The full content and metadata of a MergeableStore.
   * @returns A reference to the MergeableStore.
   * @example
   * This example creates a new MergeableStore and initializes it with
   * the content and metadata from another.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
   * store1.setValues({employees: 3});
   * console.log(store1.getMergeableContent());
   * // ->
   * [
   *   [{}, '', 0],
   *   [{employees: [3, 'Nn1JUF-----FnHIC', 1940815977]}, '', 1260895905],
   * ];
   *
   * const store2 = createMergeableStore('store2');
   * store2.setMergeableContent(store1.getMergeableContent());
   * console.log(store2.getMergeableContent());
   * // ->
   * [
   *   [{}, '', 0],
   *   [{employees: [3, 'Nn1JUF-----FnHIC', 1940815977]}, '', 1260895905],
   * ];
   * ```
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.setMergeableContent
  /**
   * The setDefaultContent method sets initial content of a MergeableStore.
   *
   * This differs from the setMergeableContent method in that all of the
   * metadata is initialized with a empty HLC timestamp - meaning that any
   * changes applied to it will 'win', yet ensuring that at least default,
   * initial data exists.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param content An array containing the tabular and keyed-value data to be
   * set.
   * @returns A reference to the MergeableStore.
   * @example
   * This example creates a new MergeableStore with default data, and
   * demonstrates that it is overwritten with another MergeableStore's data on
   * merge, even if the other MergeableStore was provisioned earlier.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1'); // !resetHlc
   * store1.setValues({employees: 3});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setDefaultContent([{}, {employees: 4}]);
   * console.log(store2.getMergeableContent());
   * // -> [[{}, "", 0], [{"employees": [4, "", 2414055963]}, "", 3035768673]]
   * ```
   *
   * store2.merge(store1);
   *
   * console.log(store2.getContent());
   * // -> [{}, {employees: 3}]
   * ```
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.setDefaultContent
  /**
   * The getTransactionMergeableChanges method returns the net meaningful
   * changes that have been made to a MergeableStore during a transaction.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @returns A MergeableChanges object representing the changes.
   * @example
   * This example makes changes to the MergeableStore. At the end of the
   * transaction, detail about what changed is enumerated.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1'); // !resetHlc
   * store.setTables({pets: {fido: {species: 'dog', color: 'brown'}}});
   * store.setValues({open: true});
   *
   * store
   *   .startTransaction()
   *   .setCell('pets', 'fido', 'color', 'black')
   *   .setValue('open', false)
   *   .finishTransaction(() => {
   *     console.log(store.getTransactionMergeableChanges());
   *   });
   * // ->
   * [
   *   [{pets: [{fido: [{color: ['black', 'Nn1JUF----2FnHIC']}]}]}],
   *   [{open: [false, 'Nn1JUF----3FnHIC']}],
   *   1,
   * ];
   * ```
   * @category Transaction
   * @since v5.0.0
   */
  /// MergeableStore.getTransactionMergeableChanges
  /**
   * The applyMergeableChanges method applies a set of mergeable changes or
   * content to the MergeableStore.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param mergeableChanges The MergeableChanges or MergeableContent to apply
   * to the MergeableStore.
   * @returns A reference to the MergeableStore.
   * @example
   * This example applies a MergeableChanges object that sets a Cell and removes
   * a Value.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store = createMergeableStore('store1')
   *   .setTables({pets: {fido: {species: 'dog', color: 'brown'}}})
   *   .setValues({open: true});
   *
   * store.applyMergeableChanges([
   *   [{pets: [{fido: [{color: ['black', 'Nn1JUF----2FnHIC']}]}]}],
   *   [{open: [null, 'Nn1JUF----3FnHIC']}],
   *   1,
   * ]);
   * console.log(store.getTables());
   * // -> {pets: {fido: {species: 'dog', color: 'black'}}}
   * console.log(store.getValues());
   * // -> {}
   * ```
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.applyMergeableChanges
  /**
   * The merge method is a convenience method that applies the mergeable content
   * from two MergeableStores to each other in order to bring them to the same
   * state.
   *
   * This method is symmetrical: applying `store1` to `store2` will have exactly
   * the same effect as applying `store2` to `store1`.
   * @param mergeableStore A reference to the other MergeableStore to merge with
   * this one.
   * @returns A reference to this MergeableStore.
   * @example
   * This example merges two MergeableStore objects together. Note how the final
   * part of the timestamps on each Cell give you a clue that the data comes
   * from changes made to different MergeableStore objects.
   *
   * ```js
   * import {createMergeableStore} from 'tinybase';
   *
   * const store1 = createMergeableStore('store1');
   * store1.setTables({pets: {fido: {species: 'dog', color: 'brown'}}});
   *
   * const store2 = createMergeableStore('store2');
   * store2.setTables({pets: {felix: {species: 'cat', color: 'tan'}}});
   *
   * store1.merge(store2);
   *
   * console.log(store1.getContent());
   * // ->
   * [
   *   {
   *     pets: {
   *       felix: {color: 'tan', species: 'cat'},
   *       fido: {color: 'brown', species: 'dog'},
   *     },
   *   },
   *   {},
   * ];
   *
   * console.log(store2.getContent());
   * // ->
   * [
   *   {
   *     pets: {
   *       felix: {color: 'tan', species: 'cat'},
   *       fido: {color: 'brown', species: 'dog'},
   *     },
   *   },
   *   {},
   * ];
   * console.log(store2.getMergeableContent());
   * // ->
   * [
   *   [
   *     {
   *       pets: [
   *         {
   *           felix: [
   *             {
   *               color: ['tan', 'Nn1JUF----0CnH-J', 2576658292],
   *               species: ['cat', 'Nn1JUF-----CnH-J', 3409607562],
   *             },
   *             '',
   *             4146239216,
   *           ],
   *           fido: [
   *             {
   *               color: ['brown', 'Nn1JUF----0FnHIC', 1240535355],
   *               species: ['dog', 'Nn1JUF-----FnHIC', 290599168],
   *             },
   *             '',
   *             3989065420,
   *           ],
   *         },
   *         '',
   *         4155188296,
   *       ],
   *     },
   *     '',
   *     972931118,
   *   ],
   *   [{}, '', 0],
   * ];
   * ```
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.merge
}
/**
 * The createMergeableStore function creates a MergeableStore, and is the main
 * entry point into the mergeable-store module.
 *
 * There is one optional parameter which is a uniqueId for the MergeableStore.
 * This is used to distinguish conflicting changes made in the same millisecond
 * by two different MergeableStore objects as its hash is added to the end of
 * the HLC timestamps. Generally this can be omitted unless you have a need for
 * deterministic HLCs, such as in a testing scenario. Otherwise, TinyBase will
 * assign a unique Id to the Store at the time of creation.
 * @returns A reference to the new MergeableStore.
 * @example
 * This example creates a MergeableStore.
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 *
 * const store = createMergeableStore('store1');
 *
 * console.log(store.getContent());
 * // -> [{}, {}]
 * console.log(store.getMergeableContent());
 * // -> [[{}, '', 0], [{}, '', 0]]
 * ```
 * @example
 * This example creates a MergeableStore with some initial data:
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 *
 * const store = createMergeableStore('store1').setTables({
 *   pets: {fido: {species: 'dog'}},
 * });
 *
 * console.log(store.getContent());
 * // -> [{pets: {fido: {species: 'dog'}}}, {}]
 * console.log(store.getMergeableContent());
 * // ->
 * [
 *   [
 *     {
 *       pets: [
 *         {
 *           fido: [
 *             {species: ['dog', 'Nn1JUF-----FnHIC', 290599168]},
 *             '',
 *             2682656941,
 *           ],
 *         },
 *         '',
 *         2102515304,
 *       ],
 *     },
 *     '',
 *     3506229770,
 *   ],
 *   [{}, '', 0],
 * ];
 * ```
 * @example
 * This example creates a MergeableStore with some initial data and a
 * TablesSchema:
 *
 * ```js
 * import {createMergeableStore} from 'tinybase';
 *
 * const store = createMergeableStore('store1')
 *   .setTables({pets: {fido: {species: 'dog'}}})
 *   .setTablesSchema({
 *     pets: {
 *       species: {type: 'string'},
 *       sold: {type: 'boolean', default: false},
 *     },
 *   });
 *
 * console.log(store.getContent());
 * // -> [{pets: {fido: {sold: false, species: 'dog'}}}, {}]
 * console.log(store.getMergeableContent());
 * // ->
 * [
 *   [
 *     {
 *       pets: [
 *         {
 *           fido: [
 *             {
 *               sold: [false, 'Nn1JUF----2FnHIC', 2603026204],
 *               species: ['dog', 'Nn1JUF----1FnHIC', 2817056260],
 *             },
 *             '',
 *             2859424112,
 *           ],
 *         },
 *         '',
 *         1640515891,
 *       ],
 *     },
 *     '',
 *     2077041985,
 *   ],
 *   [{}, '', 0],
 * ];
 * ```
 * @category Creation
 * @since v5.0.0
 */
/// createMergeableStore
