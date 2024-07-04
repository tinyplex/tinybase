/**
 * The indexes module of the TinyBase project provides the ability to create and
 * track indexes of the data in Store objects.
 *
 * The main entry point to this module is the createIndexes function, which
 * returns a new Indexes object. From there, you can create new Index
 * definitions, access the contents of those Indexes directly, and register
 * listeners for when they change.
 * @packageDocumentation
 * @module indexes
 * @since v1.0.0
 */
/// indexes
/**
 * The Index type represents the concept of a map of Slice objects, keyed by Id.
 *
 * The Ids in a Slice represent Row objects from a Table that all have a derived
 * string value in common, as described by the setIndexDefinition method. Those
 * values are used as the key for each Slice in the overall Index object.
 *
 * Note that the Index type is not actually used in the API, and you instead
 * enumerate and access its structure with the getSliceIds method and
 * getSliceRowIds method.
 * @category Concept
 * @since v1.0.0
 */
/// Index
/**
 * The Slice type represents the concept of a set of Row objects that comprise
 * part of an Index.
 *
 * The Ids in a Slice represent Row objects from a Table that all have a derived
 * string value in common, as described by the setIndexDefinition method.
 *
 * Note that the Slice type is not actually used in the API, and you instead get
 * Row Ids directly with the getSliceRowIds method.
 * @category Concept
 * @since v1.0.0
 */
/// Slice
/**
 * The IndexCallback type describes a function that takes an Index's Id and a
 * callback to loop over each Slice within it.
 *
 * A IndexCallback is provided when using the forEachIndex method, so that you
 * can do something based on every Index in the Indexes object. See that method
 * for specific examples.
 * @param indexId The Id of the Index that the callback can operate on.
 * @param forEachRow A function that will let you iterate over the Slice objects
 * in this Index.
 * @category Callback
 * @since v1.0.0
 */
/// IndexCallback
/**
 * The SliceCallback type describes a function that takes a Slice's Id and a
 * callback to loop over each Row within it.
 *
 * A SliceCallback is provided when using the forEachSlice method, so that you
 * can do something based on every Slice in an Index. See that method for
 * specific examples.
 * @param sliceId The Id of the Slice that the callback can operate on.
 * @param forEachRow A function that will let you iterate over the Row objects
 * in this Slice.
 * @category Callback
 * @since v1.0.0
 */
/// SliceCallback
/**
 * The IndexIdsListener type describes a function that is used to listen to
 * Index definitions being added or removed.
 *
 * A IndexIdsListener is provided when using the addIndexIdsListener method.
 * See that method for specific examples.
 *
 * When called, an IndexIdsListener is given a reference to the Indexes object.
 * @param indexes A reference to the Indexes object that changed.
 * @category Listener
 * @since v1.0.0
 */
/// IndexIdsListener
/**
 * The SliceIdsListener type describes a function that is used to listen to
 * changes to the Slice Ids in an Index.
 *
 * A SliceIdsListener is provided when using the addSliceIdsListener method. See
 * that method for specific examples.
 *
 * When called, a SliceIdsListener is given a reference to the Indexes object,
 * and the Id of the Index that changed.
 * @param indexes A reference to the Indexes object that changed.
 * @param indexId The Id of the Index that changed.
 * @category Listener
 * @since v1.0.0
 */
/// SliceIdsListener
/**
 * The SliceRowIdsListener type describes a function that is used to listen to
 * changes to the Row Ids in a Slice.
 *
 * A SliceRowIdsListener is provided when using the addSliceRowIdsListener
 * method. See that method for specific examples.
 *
 * When called, a SliceRowIdsListener is given a reference to the Indexes
 * object, the Id of the Index that changed, and the Id of the Slice whose Row
 * Ids changed.
 * @param indexes A reference to the Indexes object that changed.
 * @param indexId The Id of the Index that changed.
 * @param sliceId The Id of the Slice that changed.
 * @category Listener
 * @since v1.0.0
 */
/// SliceRowIdsListener
/**
 * The IndexesListenerStats type describes the number of listeners registered
 * with the Indexes object, and can be used for debugging purposes.
 *
 * A IndexesListenerStats object is returned from the getListenerStats method.
 * @category Development
 * @since v1.0.0
 */
/// IndexesListenerStats
{
  /**
   * The number of SlideIdsListener functions registered with the Indexes
   * object.
   * @category Stat
   * @since v1.0.0
   */
  /// IndexesListenerStats.sliceIds
  /**
   * The number of SliceRowIdsListener functions registered with the Indexes
   * object.
   * @category Stat
   * @since v1.0.0
   */
  /// IndexesListenerStats.sliceRowIds
}
/**
 * An Indexes object lets you look up all the Row objects in a Table that have a
 * certain Cell value.
 *
 * This is useful for creating filtered views of a Table, or simple search
 * functionality.
 *
 * Create an Indexes object easily with the createIndexes function. From there,
 * you can add new Index definitions (with the setIndexDefinition method), query
 * their contents (with the getSliceIds method and getSliceRowIds method), and
 * add listeners for when they change (with the addSliceIdsListener method and
 * addSliceRowIdsListener method).
 *
 * This module defaults to indexing Row objects by one of their Cell values.
 * However, far more complex indexes can be configured with a custom function.
 * @example
 * This example shows a very simple lifecycle of an Indexes object: from
 * creation, to adding a definition, getting its contents, and then registering
 * and removing a listener for it.
 *
 * ```js
 * import {createIndexes, createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 *
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition(
 *   'bySpecies', // indexId
 *   'pets', //      tableId to index
 *   'species', //   cellId to index
 * );
 *
 * console.log(indexes.getSliceIds('bySpecies'));
 * // -> ['dog', 'cat']
 * console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
 * // -> ['fido', 'cujo']
 *
 * const listenerId = indexes.addSliceIdsListener('bySpecies', () => {
 *   console.log(indexes.getSliceIds('bySpecies'));
 * });
 * store.setRow('pets', 'lowly', {species: 'worm'});
 * // -> ['dog', 'cat', 'worm']
 *
 * indexes.delListener(listenerId);
 * indexes.destroy();
 * ```
 * @see Using Indexes guides
 * @see Rolling Dice demos
 * @see Country demo
 * @see Todo App demos
 * @see Word Frequencies demo
 * @category Indexes
 * @since v1.0.0
 */
/// Indexes
{
  /**
   * The setIndexDefinition method lets you set the definition of an Index.
   *
   * Every Index definition is identified by a unique Id, and if you re-use an
   * existing Id with this method, the previous definition is overwritten.
   *
   * An Index is a keyed map of Slice objects, each of which is a list of Row
   * Ids from a given Table. Therefore the definition must specify the Table (by
   * its Id) to be indexed.
   *
   * The Ids in a Slice represent Row objects from a Table that all have a
   * derived string value in common, as described by this method. Those values
   * are used as the key for each Slice in the overall Index object.
   *
   * Without the third `getSliceIdOrIds` parameter, the Index will simply have a
   * single Slice, keyed by an empty string. But more often you will specify a
   * Cell value containing the Slice Id that the Row should belong to.
   * Alternatively, a custom function can be provided that produces your own
   * Slice Id from the local Row as a whole. Since v2.1, the custom function can
   * return an array of Slice Ids, each of which the Row will then belong to.
   *
   * The fourth `getSortKey` parameter specifies a Cell Id to get a value (or a
   * function that processes a whole Row to get a value) that is used to sort
   * the Row Ids within each Slice in the Index.
   *
   * The fifth parameter, `sliceIdSorter`, lets you specify a way to sort the
   * Slice Ids when you access the Index, which may be useful if you are trying
   * to create an alphabetic Index of Row entries. If not specified, the order
   * of the Slice Ids will match the order of Row insertion.
   *
   * The final parameter, `rowIdSorter`, lets you specify a way to sort the Row
   * Ids within each Slice, based on the `getSortKey` parameter. This may be
   * useful if you are trying to keep Rows in a determined order relative to
   * each other in the Index. If omitted, the Row Ids are sorted alphabetically,
   * based on the `getSortKey` parameter.
   *
   * The two 'sorter' parameters, `sliceIdSorter` and `rowIdSorter`, are
   * functions that take two values and return a positive or negative number for
   * when they are in the wrong or right order, respectively. This is exactly
   * the same as the 'compareFunction' that is used in the standard JavaScript
   * array `sort` method, with the addition that `rowIdSorter` also takes the
   * Slice Id parameter, in case you want to sort Row Ids differently in each
   * Slice. You can use the convenient defaultSorter function to default this to
   * be alphanumeric.
   * @param indexId The Id of the Index to define.
   * @param tableId The Id of the Table the Index will be generated from.
   * @param getSliceIdOrIds Either the Id of the Cell containing, or a function
   * that produces, the Id that is used to indicate which Slice in the Index the
   * Row Id should be in. Defaults to a function that returns `''` (meaning that
   * if this `getSliceIdOrIds` parameter is omitted, the Index will simply
   * contain a single Slice containing all the Row Ids in the Table). Since
   * v2.1, this can return an array of Slice Ids, each of which the Row will
   * then belong to.
   * @param getSortKey Either the Id of the Cell containing, or a function that
   * produces, the value that is used to sort the Row Ids in each Slice.
   * @param sliceIdSorter A function that takes two Slice Id values and returns
   * a positive or negative number to indicate how they should be sorted.
   * @param rowIdSorter A function that takes two Row Id values (and a slice Id)
   * and returns a positive or negative number to indicate how they should be
   * sorted.
   * @returns A reference to the Indexes object.
   * @example
   * This example creates a Store, creates an Indexes object, and defines a
   * simple Index based on the values in the `species` Cell.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * console.log(indexes.getSliceIds('bySpecies'));
   * // -> ['dog', 'cat']
   * console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
   * // -> ['fido', 'cujo']
   * ```
   * @example
   * This example creates a Store, creates an Indexes object, and defines an
   * Index based on the first letter of the pets' names.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('byFirst', 'pets', (_, rowId) => rowId[0]);
   *
   * console.log(indexes.getSliceIds('byFirst'));
   * // -> ['f', 'c']
   * console.log(indexes.getSliceRowIds('byFirst', 'f'));
   * // -> ['fido', 'felix']
   * ```
   * @example
   * This example creates a Store, creates an Indexes object, and defines an
   * Index based on each of the letters present in the pets' names.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   rex: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('containsLetter', 'pets', (_, rowId) =>
   *   rowId.split(''),
   * );
   *
   * console.log(indexes.getSliceIds('containsLetter'));
   * // -> ['f', 'i', 'd', 'o', 'e', 'l', 'x', 'r']
   * console.log(indexes.getSliceRowIds('containsLetter', 'i'));
   * // -> ['fido', 'felix']
   * console.log(indexes.getSliceRowIds('containsLetter', 'x'));
   * // -> ['felix', 'rex']
   * ```
   * @example
   * This example creates a Store, creates an Indexes object, and defines an
   * Index based on the first letter of the pets' names. The Slice Ids (and Row
   * Ids within them) are alphabetically sorted.
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
   *   (_, rowId) => rowId[0], // each Row's sliceId
   *   (_, rowId) => rowId, //    each Row's sort key
   *   defaultSorter, //          sort Slice Ids
   *   defaultSorter, //          sort Row Ids
   * );
   *
   * console.log(indexes.getSliceIds('byFirst'));
   * // -> ['c', 'f']
   * console.log(indexes.getSliceRowIds('byFirst', 'f'));
   * // -> ['felix', 'fido']
   * ```
   * @category Configuration
   * @since v1.0.0
   */
  /// Indexes.setIndexDefinition
  /**
   * The delIndexDefinition method removes an existing Index definition.
   * @param indexId The Id of the Index to remove.
   * @returns A reference to the Indexes object.
   * @example
   * This example creates a Store, creates an Indexes object, defines a simple
   * Index, and then removes it.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   * console.log(indexes.getIndexIds());
   * // -> ['bySpecies']
   *
   * indexes.delIndexDefinition('bySpecies');
   * console.log(indexes.getIndexIds());
   * // -> []
   * ```
   * @category Configuration
   * @since v1.0.0
   */
  /// Indexes.delIndexDefinition
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Indexes object.
   * @returns A reference to the Store.
   * @example
   * This example creates an Indexes object against a newly-created Store and
   * then gets its reference in order to update its data.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const indexes = createIndexes(createStore());
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   * indexes.getStore().setCell('pets', 'fido', 'species', 'dog');
   * console.log(indexes.getSliceIds('bySpecies'));
   * // -> ['dog']
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.getStore
  /**
   * The getIndexIds method returns an array of the Index Ids registered with
   * this Indexes object.
   * @returns An array of Ids.
   * @example
   * This example creates an Indexes object with two definitions, and then gets
   * the Ids of the definitions.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const indexes = createIndexes(createStore())
   *   .setIndexDefinition('bySpecies', 'pets', 'species')
   *   .setIndexDefinition('byColor', 'pets', 'color');
   *
   * console.log(indexes.getIndexIds());
   * // -> ['bySpecies', 'byColor']
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.getIndexIds
  /**
   * The forEachIndex method takes a function that it will then call for each
   * Index in a specified Indexes object.
   *
   * This method is useful for iterating over the structure of the Indexes
   * object in a functional style. The `indexCallback` parameter is a
   * IndexCallback function that will be called with the Id of each Index, and
   * with a function that can then be used to iterate over each Slice of the
   * Index, should you wish.
   * @param indexCallback The function that should be called for every Index.
   * @example
   * This example iterates over each Index in an Indexes object, and lists each
   * Slice Id within them.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   * const indexes = createIndexes(store)
   *   .setIndexDefinition('bySpecies', 'pets', 'species')
   *   .setIndexDefinition('byColor', 'pets', 'color');
   *
   * indexes.forEachIndex((indexId, forEachSlice) => {
   *   console.log(indexId);
   *   forEachSlice((sliceId) => console.log(`- ${sliceId}`));
   * });
   * // -> 'bySpecies'
   * // -> '- dog'
   * // -> '- cat'
   * // -> 'byColor'
   * // -> '- brown'
   * // -> '- black'
   * ```
   * @category Iterator
   * @since v1.0.0
   */
  /// Indexes.forEachIndex
  /**
   * The forEachSlice method takes a function that it will then call for each
   * Slice in a specified Index.
   *
   * This method is useful for iterating over the Slice structure of the Index
   * in a functional style. The `rowCallback` parameter is a RowCallback
   * function that will be called with the Id and value of each Row in the
   * Slice.
   * @param indexId The Id of the Index to iterate over.
   * @param sliceCallback The function that should be called for every Slice.
   * @example
   * This example iterates over each Row in a Slice, and lists its Id.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * indexes.forEachSlice('bySpecies', (sliceId, forEachRow) => {
   *   console.log(sliceId);
   *   forEachRow((rowId) => console.log(`- ${rowId}`));
   * });
   * // -> 'dog'
   * // -> '- fido'
   * // -> '- cujo'
   * // -> 'cat'
   * // -> '- felix'
   * ```
   * @category Iterator
   * @since v1.0.0
   */
  /// Indexes.forEachSlice
  /**
   * The hasIndex method returns a boolean indicating whether a given Index
   * exists in the Indexes object.
   * @param indexId The Id of a possible Index in the Indexes object.
   * @returns Whether an Index with that Id exists.
   * @example
   * This example shows two simple Index existence checks.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const indexes = createIndexes(createStore());
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   * console.log(indexes.hasIndex('bySpecies'));
   * // -> true
   * console.log(indexes.hasIndex('byColor'));
   * // -> false
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.hasIndex
  /**
   * The hasSlice method returns a boolean indicating whether a given Slice
   * exists in the Indexes object.
   * @param indexId The Id of a possible Index in the Indexes object.
   * @param sliceId The Id of a possible Slice in the Index.
   * @returns Whether a Slice with that Id exists.
   * @example
   * This example shows two simple Index existence checks.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   * console.log(indexes.hasSlice('bySpecies', 'dog'));
   * // -> true
   * console.log(indexes.hasSlice('bySpecies', 'worm'));
   * // -> false
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.hasSlice
  /**
   * The getTableId method returns the Id of the underlying Table that is
   * backing an Index.
   *
   * If the Index Id is invalid, the method returns `undefined`.
   * @param indexId The Id of an Index.
   * @returns The Id of the Table backing the Index, or `undefined`.
   * @example
   * This example creates an Indexes object, a single Index definition, and then
   * queries it (and a non-existent definition) to get the underlying Table Id.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const indexes = createIndexes(createStore());
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * console.log(indexes.getTableId('bySpecies'));
   * // -> 'pets'
   * console.log(indexes.getTableId('byColor'));
   * // -> undefined
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.getTableId
  /**
   * The getSliceIds method gets the list of Slice Ids in an Index.
   *
   * If the identified Index does not exist (or if the definition references a
   * Table that does not exist) then an empty array is returned.
   * @param indexId The Id of the Index.
   * @returns The Slice Ids in the Index, or an empty array.
   * @example
   * This example creates a Store, creates an Indexes object, and defines a
   * simple Index. It then uses getSliceIds to see the available Slice Ids in
   * the Index (and also the Slice Ids in an Index that has not been defined).
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * console.log(indexes.getSliceIds('bySpecies'));
   * // -> ['dog', 'cat']
   * console.log(indexes.getSliceIds('byColor'));
   * // -> []
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.getSliceIds
  /**
   * The getSliceRowIds method gets the list of Row Ids in a given Slice, within
   * a given Index.
   *
   * If the identified Index or Slice do not exist (or if the definition
   * references a Table that does not exist) then an empty array is returned.
   * @param indexId The Id of the Index.
   * @param sliceId The Id of the Slice in the Index.
   * @returns The Row Ids in the Slice, or an empty array.
   * @example
   * This example creates a Store, creates an Indexes object, and defines a
   * simple Index. It then uses getSliceRowIds to see the Row Ids in the Slice
   * (and also the Row Ids in Slices that do not exist).
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
   * // -> ['fido', 'cujo']
   * console.log(indexes.getSliceRowIds('bySpecies', 'worm'));
   * // -> []
   * console.log(indexes.getSliceRowIds('byColor', 'brown'));
   * // -> []
   * ```
   * @category Getter
   * @since v1.0.0
   */
  /// Indexes.getSliceRowIds
  /**
   * The addIndexIdsListener method registers a listener function with the
   * Indexes object that will be called whenever an Index definition is added or
   * removed.
   *
   * The provided listener is an IndexIdsListener function, and will be called
   * with a reference to the Indexes object.
   * @param listener The function that will be called whenever an Index
   * definition is added or removed.
   * @example
   * This example creates a Store, an Indexes object, and then registers a
   * listener that responds to the addition and the removal of an Index
   * definition.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * const listenerId = indexes.addIndexIdsListener((indexes) => {
   *   console.log(indexes.getIndexIds());
   * });
   *
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   * // -> ['bySpecies']
   * indexes.delIndexDefinition('bySpecies');
   * // -> []
   *
   * indexes.delListener(listenerId);
   * ```
   * @category Listener
   * @since v4.1.0
   */
  /// Indexes.addIndexIdsListener
  /**
   * The addSliceIdsListener method registers a listener function with the
   * Indexes object that will be called whenever the Slice Ids in an Index
   * change.
   *
   * You can either listen to a single Index (by specifying the Index Id as the
   * method's first parameter), or changes to any Index (by providing a `null`
   * wildcard).
   *
   * The provided listener is a SliceIdsListener function, and will be called
   * with a reference to the Indexes object, and the Id of the Index that
   * changed.
   * @param indexId The Id of the Index to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the Slice Ids in
   * the Index change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, an Indexes object, and then registers a
   * listener that responds to any changes to a specific Index.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * const listenerId = indexes.addSliceIdsListener('bySpecies', (indexes) => {
   *   console.log('Slice Ids for bySpecies index changed');
   *   console.log(indexes.getSliceIds('bySpecies'));
   * });
   *
   * store.setRow('pets', 'lowly', {species: 'worm'});
   * // -> 'Slice Ids for bySpecies index changed'
   * // -> ['dog', 'cat', 'worm']
   *
   * indexes.delListener(listenerId);
   * ```
   * @example
   * This example creates a Store, an Indexes object, and then registers a
   * listener that responds to any changes to any Index.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'brown'},
   * });
   *
   * const indexes = createIndexes(store)
   *   .setIndexDefinition('bySpecies', 'pets', 'species')
   *   .setIndexDefinition('byColor', 'pets', 'color');
   *
   * const listenerId = indexes.addSliceIdsListener(
   *   null,
   *   (indexes, indexId) => {
   *     console.log(`Slice Ids for ${indexId} index changed`);
   *     console.log(indexes.getSliceIds(indexId));
   *   },
   * );
   *
   * store.setRow('pets', 'lowly', {species: 'worm', color: 'pink'});
   * // -> 'Slice Ids for bySpecies index changed'
   * // -> ['dog', 'cat', 'worm']
   * // -> 'Slice Ids for byColor index changed'
   * // -> ['brown', 'black', 'pink']
   *
   * indexes.delListener(listenerId);
   * ```
   * @category Listener
   * @since v1.0.0
   */
  /// Indexes.addSliceIdsListener
  /**
   * The addSliceRowIdsListener method registers a listener function with the
   * Indexes object that will be called whenever the Row Ids in a Slice change.
   *
   * You can either listen to a single Slice (by specifying the Index Id and
   * Slice Id as the method's first two parameters), or changes to any Slice (by
   * providing `null` wildcards).
   *
   * Both, either, or neither of the `indexId` and `sliceId` parameters can be
   * wildcarded with `null`. You can listen to a specific Slice in a specific
   * Index, any Slice in a specific Index, a specific Slice in any Index, or any
   * Slice in any Index.
   *
   * The provided listener is a SliceRowIdsListener function, and will be called
   * with a reference to the Indexes object, the Id of the Index, and the Id of
   * the Slice that changed.
   * @param indexId The Id of the Index to listen to, or `null` as a wildcard.
   * @param sliceId The Id of the Slice to listen to, or `null` as a wildcard.
   * @param listener The function that will be called whenever the Row Ids in
   * the Slice change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, an Indexes object, and then registers a
   * listener that responds to any changes to a specific Slice.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * const listenerId = indexes.addSliceRowIdsListener(
   *   'bySpecies',
   *   'dog',
   *   (indexes) => {
   *     console.log('Row Ids for dog slice in bySpecies index changed');
   *     console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
   *   },
   * );
   *
   * store.setRow('pets', 'toto', {species: 'dog'});
   * // -> 'Row Ids for dog slice in bySpecies index changed'
   * // -> ['fido', 'cujo', 'toto']
   *
   * indexes.delListener(listenerId);
   * ```
   * @example
   * This example creates a Store, an Indexes object, and then registers a
   * listener that responds to any changes to any Slice.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', color: 'brown'},
   *   felix: {species: 'cat', color: 'black'},
   *   cujo: {species: 'dog', color: 'black'},
   * });
   *
   * const indexes = createIndexes(store)
   *   .setIndexDefinition('bySpecies', 'pets', 'species')
   *   .setIndexDefinition('byColor', 'pets', 'color');
   *
   * const listenerId = indexes.addSliceRowIdsListener(
   *   null,
   *   null,
   *   (indexes, indexId, sliceId) => {
   *     console.log(
   *       `Row Ids for ${sliceId} slice in ${indexId} index changed`,
   *     );
   *     console.log(indexes.getSliceRowIds(indexId, sliceId));
   *   },
   * );
   *
   * store.setRow('pets', 'toto', {species: 'dog', color: 'brown'});
   * // -> 'Row Ids for dog slice in bySpecies index changed'
   * // -> ['fido', 'cujo', 'toto']
   * // -> 'Row Ids for brown slice in byColor index changed'
   * // -> ['fido', 'toto']
   *
   * indexes.delListener(listenerId);
   * ```
   * @category Listener
   * @since v1.0.0
   */
  /// Indexes.addSliceRowIdsListener
  /**
   * The delListener method removes a listener that was previously added to the
   * Indexes object.
   *
   * Use the Id returned by whichever method was used to add the listener. Note
   * that the Indexes object may re-use this Id for future listeners added to
   * it.
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the Indexes object.
   * @example
   * This example creates a Store, an Indexes object, registers a listener, and
   * then removes it.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   *
   * const listenerId = indexes.addSliceIdsListener('bySpecies', () => {
   *   console.log('Slice Ids for bySpecies index changed');
   * });
   *
   * store.setRow('pets', 'lowly', {species: 'worm'});
   * // -> 'Slice Ids for bySpecies index changed'
   *
   * indexes.delListener(listenerId);
   *
   * store.setRow('pets', 'toto', {species: 'dog'});
   * // -> undefined
   * // The listener is not called.
   * ```
   * @category Listener
   * @since v1.0.0
   */
  /// Indexes.delListener
  /**
   * The destroy method should be called when this Indexes object is no longer
   * used.
   *
   * This guarantees that all of the listeners that the object registered with
   * the underlying Store are removed and it can be correctly garbage collected.
   * @example
   * This example creates a Store, adds an Indexes object with a
   * definition (that registers a RowListener with the underlying Store),
   * and then destroys it again, removing the listener.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog'},
   *   felix: {species: 'cat'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const indexes = createIndexes(store);
   * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
   * console.log(store.getListenerStats().row);
   * // -> 1
   *
   * indexes.destroy();
   *
   * console.log(store.getListenerStats().row);
   * // -> 0
   * ```
   * @category Lifecycle
   * @since v1.0.0
   */
  /// Indexes.destroy
  /**
   * The getListenerStats method provides a set of statistics about the
   * listeners registered with the Indexes object, and is used for debugging
   * purposes.
   *
   * The IndexesListenerStats object contains a breakdown of the different types
   * of listener.
   *
   * The method is intended to be used during development to ensure your
   * application is not leaking listener registrations, for example.
   * @returns A IndexesListenerStats object containing Indexes listener
   * statistics.
   * @example
   * This example gets the listener statistics of an Indexes object.
   *
   * ```js
   * import {createIndexes, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const indexes = createIndexes(store);
   * indexes.addSliceIdsListener(null, () => {
   *   console.log('Slice Ids changed');
   * });
   * indexes.addSliceRowIdsListener(null, null, () => {
   *   console.log('Slice Row Ids changed');
   * });
   *
   * console.log(indexes.getListenerStats());
   * // -> {sliceIds: 1, sliceRowIds: 1}
   * ```
   * @category Development
   * @since v1.0.0
   */
  /// Indexes.getListenerStats
}
/**
 * The createIndexes function creates an Indexes object, and is the main entry
 * point into the indexes module.
 *
 * A given Store can only have one Indexes object associated with it. If you
 * call this function twice on the same Store, your second call will return a
 * reference to the Indexes object created by the first.
 * @param store The Store for which to register Index definitions.
 * @returns A reference to the new Indexes object.
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
 * This example creates an Indexes object, and calls the method a second time
 * for the same Store to return the same object.
 *
 * ```js
 * import {createIndexes, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const indexes1 = createIndexes(store);
 * const indexes2 = createIndexes(store);
 * console.log(indexes1 === indexes2);
 * // -> true
 * ```
 * @category Creation
 * @since v1.0.0
 */
/// createIndexes
