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
   * The applyMergeableChanges method applies a set of mergeable changes to the
   * Mergeable.
   *
   * The method is generally intended to be used internally within TinyBase
   * itself and the return type is assumed to be opaque to applications that use
   * it.
   * @param mergeableChanges The MergeableChanges to apply to the Mergeable.
   * @returns A reference to the Mergeable.
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
   * @since v7.0.0
   */
  /// Mergeable.applyMergeableChanges
}
