/**
 * The mergeable-store module contains the types, interfaces, and functions to
 * work with MergeableStore objects, which provide merge and synchronization
 * functionality.
 *
 * The main entry point to this module is the createMergeableStore function,
 * which returns a new MergeableStore, a subtype of Store that can be merged
 * with another with deterministic results.
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
 * The MergeableStore type
 * @category Mergeable
 * @since v5.0.0
 */
/// MergeableStore
{
  /**
   * The getMergeableContent method
   * @category Getter
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableContent
  /**
   * The getMergeableContentAsChanges method
   * @category Getter
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableContentAsChanges
  /**
   * The getMergeableContentHashes method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableContentHashes
  /**
   * The getMergeableTableHashes method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableTableHashes
  /**
   * The getMergeableTableDiff method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableTableDiff
  /**
   * The getMergeableRowHashes method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableRowHashes
  /**
   * The getMergeableRowDiff method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableRowDiff
  /**
   * The getMergeableCellHashes method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableCellHashes
  /**
   * The getMergeableCellDiff method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableCellDiff
  /**
   * The getMergeableValueHashes method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableValueHashes
  /**
   * The getMergeableValueDiff method
   * @category Syncing
   * @since v5.0.0
   */
  /// MergeableStore.getMergeableValueDiff
  /**
   * The setMergeableContent method
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.setMergeableContent
  /**
   * The setDefaultContent method
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.setDefaultContent
  /**
   * The getTransactionMergeableChanges method
   * @category Getter
   * @since v5.0.0
   */
  /// MergeableStore.getTransactionMergeableChanges
  /**
   * The applyMergeableChanges method
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.applyMergeableChanges
  /**
   * The merge method
   * @category Setter
   * @since v5.0.0
   */
  /// MergeableStore.merge
}
/**
 * The createMergeableStore function
 * @category Creation
 * @since v5.0.0
 */
/// createMergeableStore
