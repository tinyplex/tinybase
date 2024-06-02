/**
 * The relationships module of the TinyBase project provides the ability to
 * create and track relationships between the data in Store objects.
 *
 * The main entry point to this module is the createRelationships function,
 * which returns a new Relationships object. From there, you can create new
 * Relationship definitions, access the associations within those Relationships
 * directly, and register listeners for when they change.
 * @packageDocumentation
 * @module relationships
 */
/// relationships
/**
 * The Relationship type represents the concept of a map that connects one Row
 * object to another, often in another Table.
 *
 * The Relationship has a one-to-many nature. One local Row Id is linked to one
 * remote Row Id (in the remote Table), as described by the
 * setRelationshipDefinition method - and one remote Row Id may map back to
 * multiple local Row Ids (in the local Table).
 *
 * A Relationship where the local Table is the same as the remote Table can be
 * used to model a 'linked list', where Row A references Row B, Row B references
 * Row C, and so on.
 *
 * Note that the Relationship type is not actually used in the API, and you
 * instead enumerate and access its structure with the getRemoteRowId method,
 * the getLocalRowIds method, and the getLinkedRowIds method.
 * @category Concept
 */
/// Relationship
/**
 * The RelationshipCallback type describes a function that takes a
 * Relationship's Id and a callback to loop over each local Row within it.
 *
 * A RelationshipCallback is provided when using the forEachRelationship method,
 * so that you can do something based on every Relationship in the Relationships
 * object. See that method for specific examples.
 * @param relationshipId The Id of the Relationship that the callback can
 * operate on.
 * @param forEachRow A function that will let you iterate over the local Row
 * objects in this Relationship.
 * @category Callback
 */
/// RelationshipCallback
/**
 * The RelationshipIdsListener type describes a function that is used to listen
 * to Relationship definitions being added or removed.
 *
 * A RelationshipIdsListener is provided when using the
 * addRelationshipIdsListener method. See that method for specific examples.
 *
 * When called, a RelationshipIdsListener is given a reference to the
 * Relationships object.
 * @param relationships A reference to the Relationships object that changed.
 * @category Listener
 */
/// RelationshipIdsListener
/**
 * The RemoteRowIdListener type describes a function that is used to listen to
 * changes to the remote Row Id end of a Relationship.
 *
 * A RemoteRowIdListener is provided when using the addRemoteRowIdListener
 * method. See that method for specific examples.
 *
 * When called, a RemoteRowIdListener is given a reference to the Relationships
 * object, the Id of the Relationship that changed, and the Id of the local Row
 * whose remote Row Id changed.
 * @param relationships A reference to the Relationships object that changed.
 * @param relationshipId The Id of the Relationship that changed.
 * @param localRowId The Id of the local Row whose remote Row Id changed.
 * @category Listener
 */
/// RemoteRowIdListener
/**
 * The LocalRowIdsListener type describes a function that is used to listen to
 * changes to the local Row Id ends of a Relationship.
 *
 * A LocalRowIdsListener is provided when using the addLocalRowIdsListener
 * method. See that method for specific examples.
 *
 * When called, a LocalRowIdsListener is given a reference to the Relationships
 * object, the Id of the Relationship that changed, and the Id of the remote Row
 * whose local Row Ids changed.
 * @param relationships A reference to the Relationships object that changed.
 * @param relationshipId The Id of the Relationship that changed.
 * @param remoteRowId The Id of the remote Row whose local Row Ids changed.
 * @category Listener
 */
/// LocalRowIdsListener
/**
 * The LinkedRowIdsListener type describes a function that is used to listen to
 * changes to the local Row Id ends of a Relationship.
 *
 * A LinkedRowIdsListener is provided when using the addLinkedRowIdsListener
 * method. See that method for specific examples.
 *
 * When called, a LinkedRowIdsListener is given a reference to the Relationships
 * object, the Id of the Relationship that changed, and the Id of the first Row
 * of the the linked list whose members changed.
 * @param relationships A reference to the Relationships object that changed.
 * @param relationshipId The Id of the Relationship that changed.
 * @param firstRowId The Id of the first Row of the the linked list whose
 * members changed.
 * @category Listener
 */
/// LinkedRowIdsListener
/**
 * The RelationshipsListenerStats type describes the number of listeners
 * registered with the Relationships object, and can be used for debugging
 * purposes.
 *
 * A RelationshipsListenerStats object is returned from the getListenerStats
 * method, and is only populated in a debug build.
 * @category Development
 */
/// RelationshipsListenerStats
{
  /**
   * The number of RemoteRowIdListener functions registered with the
   * Relationships object.
   */
  /// RelationshipsListenerStats.remoteRowId
  /**
   * The number of LocalRowIdsListener functions registered with the
   * Relationships object.
   */
  /// RelationshipsListenerStats.localRowIds
  /**
   * The number of LinkedRowId functions registered with the Relationships
   * object.
   */
  /// RelationshipsListenerStats.linkedRowIds
}
/**
 * A Relationships object lets you associate a Row in a one Table with the Id of
 * a Row in another Table.
 *
 * This is useful for creating parent-child relationships between the data in
 * different Table objects, but it can also be used to model a linked list of
 * Row objects in the same Table.
 *
 * Create a Relationships object easily with the createRelationships function.
 * From there, you can add new Relationship definitions (with the
 * setRelationshipDefinition method), query their contents (with the
 * getRemoteRowId method, the getLocalRowIds method, and the getLinkedRowIds
 * method), and add listeners for when they change (with the
 * addRemoteRowIdListener method, the addLocalRowIdsListener method, and the
 * addLinkedRowIdsListener method).
 *
 * This module defaults to creating relationships between Row objects by using
 * one of their Cell values. However, far more complex relationships can be
 * configured with a custom function.
 * @example
 * This example shows a very simple lifecycle of a Relationships object: from
 * creation, to adding definitions (both local/remote table and linked list),
 * getting their contents, and then registering and removing listeners for them.
 *
 * ```js
 * import {createRelationships, createStore} from 'tinybase';
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', next: 'felix'},
 *     felix: {species: 'cat', next: 'cujo'},
 *     cujo: {species: 'dog'},
 *   })
 *   .setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *   });
 *
 * const relationships = createRelationships(store);
 *
 * // A local/remote table relationship:
 * relationships.setRelationshipDefinition(
 *   'petSpecies', //  relationshipId
 *   'pets', //        localTableId to link from
 *   'species', //     remoteTableId to link to
 *   'species', //     cellId containing remote key
 * );
 * console.log(relationships.getRemoteRowId('petSpecies', 'fido'));
 * // -> 'dog'
 * console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
 * // -> ['fido', 'cujo']
 *
 * // A linked list relationship:
 * relationships.setRelationshipDefinition(
 *   'petSequence', // relationshipId
 *   'pets', //        localTableId to link from
 *   'pets', //        the same remoteTableId to link within
 *   'next', //        cellId containing link key
 * );
 * console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
 * // -> ['fido', 'felix', 'cujo']
 *
 * const listenerId1 = relationships.addLocalRowIdsListener(
 *   'petSpecies',
 *   'dog',
 *   () => {
 *     console.log('petSpecies relationship (to dog) changed');
 *     console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
 *   },
 * );
 * const listenerId2 = relationships.addLinkedRowIdsListener(
 *   'petSequence',
 *   'fido',
 *   () => {
 *     console.log('petSequence linked list (from fido) changed');
 *     console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
 *   },
 * );
 *
 * store.setRow('pets', 'toto', {species: 'dog'});
 * // -> 'petSpecies relationship (to dog) changed'
 * // -> ['fido', 'cujo', 'toto']
 *
 * store.setCell('pets', 'cujo', 'next', 'toto');
 * // -> 'petSequence linked list (from fido) changed'
 * // -> ['fido', 'felix', 'cujo', 'toto']
 *
 * relationships.delListener(listenerId1);
 * relationships.delListener(listenerId2);
 * relationships.destroy();
 * ```
 * @see Relationships And Checkpoints guides
 * @see Drawing demo
 * @category Relationships
 */
/// Relationships
{
  /**
   * The setRelationshipDefinition method lets you set the definition of a
   * Relationship.
   *
   * Every Relationship definition is identified by a unique Id, and if you
   * re-use an existing Id with this method, the previous definition is
   * overwritten.
   *
   * An Relationship is based on connections between Row objects, often in two
   * different Table objects. Therefore the definition requires the
   * `localTableId` parameter to specify the 'local' Table to create the
   * Relationship from, and the `remoteTableId` parameter to specify the
   * 'remote' Table to create Relationship to.
   *
   * A linked list Relationship is one that has the same Table specified as both
   * local Table Id and remote Table Id, allowing you to create a sequence of
   * Row objects within that one Table.
   *
   * A local Row is related to a remote Row by specifying which of its (local)
   * Cell values contains the (remote) Row Id, using the `getRemoteRowId`
   * parameter. Alternatively, a custom function can be provided that produces
   * your own remote Row Id from the local Row as a whole.
   * @param relationshipId The Id of the Relationship to define.
   * @param localTableId The Id of the local Table for the Relationship.
   * @param remoteTableId The Id of the remote Table for the Relationship (or
   * the same as the `localTableId` in the case of a linked list).
   * @param getRemoteRowId Either the Id of the Cell containing, or a function
   * that produces, the Id that is used to indicate which Row in the remote
   * Table a local Row is related to.
   * @returns A reference to the Relationships object.
   * @example
   * This example creates a Store, creates a Relationships object, and defines
   * a simple Relationship based on the values in the `species` Cell of the
   * `pets` Table that relates a Row to another in the `species` Table.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies', // relationshipId
   *   'pets', //       localTableId to link from
   *   'species', //    remoteTableId to link to
   *   'species', //    cellId containing remote key
   * );
   *
   * console.log(relationships.getRemoteRowId('petSpecies', 'fido'));
   * // -> 'dog'
   * console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
   * // -> ['fido', 'cujo']
   * ```
   * @example
   * This example creates a Store, creates a Relationships object, and defines
   * a linked list Relationship based on the values in the `next` Cell of the
   * `pets` Table that relates a Row to another in the same Table.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', next: 'felix'},
   *   felix: {species: 'cat', next: 'cujo'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSequence', // relationshipId
   *   'pets', //        localTableId to link from
   *   'pets', //        the same remoteTableId to link within
   *   'next', //        cellId containing link key
   * );
   *
   * console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
   * // -> ['fido', 'felix', 'cujo']
   * ```
   * @category Configuration
   */
  /// Relationships.setRelationshipDefinition
  /**
   * The delRelationshipDefinition method removes an existing Relationship
   * definition.
   * @param relationshipId The Id of the Relationship to remove.
   * @returns A reference to the Relationships object.
   * @example
   * This example creates a Store, creates a Relationships object, defines a
   * simple Relationship, and then removes it.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   * console.log(relationships.getRelationshipIds());
   * // -> ['petSpecies']
   *
   * relationships.delRelationshipDefinition('petSpecies');
   * console.log(relationships.getRelationshipIds());
   * // -> []
   * ```
   * @category Configuration
   */
  /// Relationships.delRelationshipDefinition
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Relationships object.
   * @returns A reference to the Store.
   * @example
   * This example creates a Relationships object against a newly-created Store
   * and then gets its reference in order to update its data.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const relationships = createRelationships(createStore());
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   * relationships.getStore().setCell('pets', 'fido', 'species', 'dog');
   * console.log(relationships.getRemoteRowId('petSpecies', 'fido'));
   * // -> 'dog'
   * ```
   * @category Getter
   */
  /// Relationships.getStore
  /**
   * The getRelationshipIds method returns an array of the Relationship Ids
   * registered with this Relationships object.
   * @returns An array of Ids.
   * @example
   * This example creates a Relationships object with two definitions, and then
   * gets the Ids of the definitions.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const relationships = createRelationships(createStore())
   *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
   *   .setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');
   * console.log(relationships.getRelationshipIds());
   * // -> ['petSpecies', 'petSequence']
   * ```
   * @category Getter
   */
  /// Relationships.getRelationshipIds
  /**
   * The forEachRelationship method takes a function that it will then call for
   * each Relationship in a specified Relationships object.
   *
   * This method is useful for iterating over the structure of the Relationships
   * object in a functional style. The `relationshipCallback` parameter is a
   * RelationshipCallback function that will be called with the Id of each
   * Relationship, and with a function that can then be used to iterate over
   * each local Row involved in the Relationship.
   * @param relationshipCallback The function that should be called for every
   * Relationship.
   * @example
   * This example iterates over each Relationship in a Relationships object, and
   * lists each Row Id within them.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', next: 'felix'},
   *   felix: {species: 'cat', next: 'cujo'},
   *   cujo: {species: 'dog'},
   * });
   * const relationships = createRelationships(store)
   *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
   *   .setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');
   *
   * relationships.forEachRelationship((relationshipId, forEachRow) => {
   *   console.log(relationshipId);
   *   forEachRow((rowId) => console.log(`- ${rowId}`));
   * });
   * // -> 'petSpecies'
   * // -> '- fido'
   * // -> '- felix'
   * // -> '- cujo'
   * // -> 'petSequence'
   * // -> '- fido'
   * // -> '- felix'
   * // -> '- cujo'
   * ```
   * @category Iterator
   */
  /// Relationships.forEachRelationship
  /**
   * The hasRelationship method returns a boolean indicating whether a given
   * Relationship exists in the Relationships object.
   * @param relationshipId The Id of a possible Relationship in the
   * Relationships object.
   * @returns Whether a Relationship with that Id exists.
   * @example
   * This example shows two simple Relationship existence checks.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const relationships = createRelationships(
   *   createStore(),
   * ).setRelationshipDefinition('petSpecies', 'pets', 'species', 'species');
   * console.log(relationships.hasRelationship('petSpecies'));
   * // -> true
   * console.log(relationships.hasRelationship('petColor'));
   * // -> false
   * ```
   * @category Getter
   */
  /// Relationships.hasRelationship
  /**
   * The getLocalTableId method returns the Id of the underlying local Table
   * that is used in the Relationship.
   *
   * If the Relationship Id is invalid, the method returns `undefined`.
   * @param relationshipId The Id of a Relationship.
   * @returns The Id of the local Table backing the Relationship, or
   * `undefined`.
   * @example
   * This example creates a Relationship object, a single Relationship
   * definition, and then queries it (and a non-existent definition) to get the
   * underlying local Table Id.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const relationships = createRelationships(createStore());
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * console.log(relationships.getLocalTableId('petSpecies'));
   * // -> 'pets'
   * console.log(relationships.getLocalTableId('petColor'));
   * // -> undefined
   * ```
   * @category Getter
   */
  /// Relationships.getLocalTableId
  /**
   * The getRemoteTableId method returns the Id of the underlying remote Table
   * that is used in the Relationship.
   *
   * If the Relationship Id is invalid, the method returns `undefined`.
   * @param relationshipId The Id of a Relationship.
   * @returns The Id of the remote Table backing the Relationship, or
   * `undefined`.
   * @example
   * This example creates a Relationship object, a single Relationship
   * definition, and then queries it (and a non-existent definition) to get the
   * underlying remote Table Id.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const relationships = createRelationships(createStore());
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * console.log(relationships.getRemoteTableId('petSpecies'));
   * // -> 'species'
   * console.log(relationships.getRemoteTableId('petColor'));
   * // -> undefined
   * ```
   * @category Getter
   */
  /// Relationships.getRemoteTableId
  /**
   * The getRemoteRowId method gets the remote Row Id for a given local Row in a
   * Relationship.
   *
   * If the identified Relationship or Row does not exist (or if the definition
   * references a Table that does not exist) then `undefined` is returned.
   * @param relationshipId The Id of the Relationship.
   * @param localRowId The Id of the local Row in the Relationship.
   * @returns The remote Row Id in the Relationship, or `undefined`.
   * @example
   * This example creates a Store, creates a Relationships object, and defines
   * a simple Relationship. It then uses getRemoteRowId to see the remote Row Id
   * in the Relationship (and also the remote Row Ids for a local Row that does
   * not exist, and for a Relationship that has not been defined).
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * console.log(relationships.getRemoteRowId('petSpecies', 'fido'));
   * // -> 'dog'
   * console.log(relationships.getRemoteRowId('petSpecies', 'toto'));
   * // -> undefined
   * console.log(relationships.getRemoteRowId('petColor', 'fido'));
   * // -> undefined
   * ```
   * @category Getter
   */
  /// Relationships.getRemoteRowId
  /**
   * The getLocalRowIds method gets the local Row Ids for a given remote Row in
   * a Relationship.
   *
   * If the identified Relationship or Row does not exist (or if the definition
   * references a Table that does not exist) then an empty array is returned.
   * @param relationshipId The Id of the Relationship.
   * @param remoteRowId The Id of the remote Row in the Relationship.
   * @returns The local Row Ids in the Relationship, or an empty array.
   * @example
   * This example creates a Store, creates a Relationships object, and defines
   * a simple Relationship. It then uses getLocalRowIds to see the local Row Ids
   * in the Relationship (and also the local Row Ids for a remote Row that does
   * not exist, and for a Relationship that has not been defined).
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
   * // -> ['fido', 'cujo']
   * console.log(relationships.getLocalRowIds('petSpecies', 'worm'));
   * // -> []
   * console.log(relationships.getLocalRowIds('petColor', 'brown'));
   * // -> []
   * ```
   * @category Getter
   */
  /// Relationships.getLocalRowIds
  /**
   * The getLinkedRowIds method gets the linked Row Ids for a given Row in a
   * linked list Relationship.
   *
   * A linked list Relationship is one that has the same Table specified as both
   * local Table Id and remote Table Id, allowing you to create a sequence of
   * Row objects within that one Table.
   *
   * If the identified Relationship or Row does not exist (or if the definition
   * references a Table that does not exist) then an array containing just the
   * first Row Id is returned.
   * @param relationshipId The Id of the Relationship.
   * @param firstRowId The Id of the first Row in the linked list Relationship.
   * @returns The linked Row Ids in the Relationship.
   * @example
   * This example creates a Store, creates a Relationships object, and defines
   * a simple linked list Relationship. It then uses getLinkedRowIds to see the
   * linked Row Ids in the Relationship (and also the linked Row Ids for a Row
   * that does not exist, and for a Relationship that has not been defined).
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', next: 'felix'},
   *   felix: {species: 'cat', next: 'cujo'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSequence',
   *   'pets',
   *   'pets',
   *   'next',
   * );
   *
   * console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
   * // -> ['fido', 'felix', 'cujo']
   * console.log(relationships.getLinkedRowIds('petSequence', 'felix'));
   * // -> ['felix', 'cujo']
   * console.log(relationships.getLinkedRowIds('petSequence', 'toto'));
   * // -> ['toto']
   * console.log(relationships.getLinkedRowIds('petFriendships', 'fido'));
   * // -> ['fido']
   * ```
   * @category Getter
   */
  /// Relationships.getLinkedRowIds
  /**
   * The addRelationshipIdsListener method registers a listener function with
   * the Relationships object that will be called whenever a Relationship
   * definition is added or removed.
   *
   * The provided listener is a RelationshipIdsListener function, and will be
   * called with a reference to the Relationships object.
   * @param listener The function that will be called whenever a Relationship
   * definition is added or removed.
   * @example
   * This example creates a Store, a Relationships object, and then registers a
   * listener that responds to the addition and the removal of a Relationship
   * definition.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * const listenerId = relationships.addRelationshipIdsListener(
   *   (relationships) => {
   *     console.log(relationships.getRelationshipIds());
   *   },
   * );
   *
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   * // -> ['petSpecies']
   * relationships.delRelationshipDefinition('petSpecies');
   * // -> []
   *
   * relationships.delListener(listenerId);
   * ```
   * @category Listener
   * @since v4.1.0
   */
  /// Relationships.addRelationshipIdsListener
  /**
   * The addRemoteRowIdListener method registers a listener function with the
   * Relationships object that will be called whenever a remote Row Id in a
   * Relationship changes.
   *
   * You can either listen to a single local Row (by specifying the Relationship
   * Id and local Row Id as the method's first two parameters), or changes to
   * any local Row (by providing a `null` wildcards).
   *
   * Both, either, or neither of the `relationshipId` and `localRowId`
   * parameters can be wildcarded with `null`. You can listen to a specific
   * local Row in a specific Relationship, any local Row in a specific
   * Relationship, a specific local Row in any Relationship, or any local Row in
   * any Relationship.
   *
   * The provided listener is a RemoteRowIdListener function, and will be called
   * with a reference to the Relationships object, the Id of the Relationship,
   * and the Id of the local Row that had its remote Row change.
   * @param relationshipId The Id of the Relationship to listen to, or `null` as
   * a wildcard.
   * @param localRowId The Id of the local Row to listen to, or `null` as a
   * wildcard.
   * @param listener The function that will be called whenever the remote Row Id
   * changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, a Relationships object, and then registers a
   * listener that responds to any changes to a specific local Row's remote Row.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * const listenerId = relationships.addRemoteRowIdListener(
   *   'petSpecies',
   *   'cujo',
   *   (relationships) => {
   *     console.log('petSpecies relationship (from cujo) changed');
   *     console.log(relationships.getRemoteRowId('petSpecies', 'cujo'));
   *   },
   * );
   *
   * store.setCell('pets', 'cujo', 'species', 'wolf');
   * // -> 'petSpecies relationship (from cujo) changed'
   * // -> 'wolf'
   *
   * relationships.delListener(listenerId);
   * ```
   * @example
   * This example creates a Store, a Relationships object, and then registers a
   * listener that responds to any changes to any local Row's remote Row. It
   * also illustrates how you can use the getStore method and the getRemoteRowId
   * method to resolve the remote Row as a whole.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog', color: 'brown'},
   *     felix: {species: 'cat', color: 'black'},
   *     cujo: {species: 'dog', color: 'brown'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   })
   *   .setTable('color', {
   *     brown: {discount: 0.1},
   *     black: {discount: 0},
   *     grey: {discount: 0.2},
   *   });
   *
   * const relationships = createRelationships(store)
   *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
   *   .setRelationshipDefinition('petColor', 'pets', 'color', 'color');
   *
   * const listenerId = relationships.addRemoteRowIdListener(
   *   null,
   *   null,
   *   (relationships, relationshipId, localRowId) => {
   *     console.log(
   *       `${relationshipId} relationship (from ${localRowId}) changed`,
   *     );
   *     console.log(relationships.getRemoteRowId(relationshipId, localRowId));
   *     console.log(
   *       relationships
   *         .getStore()
   *         .getRow(
   *           relationships.getRemoteTableId(relationshipId),
   *           relationships.getRemoteRowId(relationshipId, localRowId),
   *         ),
   *     );
   *   },
   * );
   *
   * store.setRow('pets', 'cujo', {species: 'wolf', color: 'grey'});
   * // -> 'petSpecies relationship (from cujo) changed'
   * // -> 'wolf'
   * // -> {price: 10}
   * // -> 'petColor relationship (from cujo) changed'
   * // -> 'grey'
   * // -> {discount: 0.2}
   *
   * relationships.delListener(listenerId);
   * ```
   * @category Listener
   */
  /// Relationships.addRemoteRowIdListener
  /**
   * The addLocalRowIdsListener method registers a listener function with the
   * Relationships object that will be called whenever the local Row Ids in
   * a Relationship change.
   *
   * You can either listen to a single local Row (by specifying the Relationship
   * Id and local Row Id as the method's first two parameters), or changes to
   * any local Row (by providing a `null` wildcards).
   *
   * Both, either, or neither of the `relationshipId` and `remoteRowId`
   * parameters can be wildcarded with `null`. You can listen to a specific
   * remote Row in a specific Relationship, any remote Row in a specific
   * Relationship, a specific remote Row in any Relationship, or any remote Row
   * in any Relationship.
   *
   * The provided listener is a LocalRowIdsListener function, and will be called
   * with a reference to the Relationships object, the Id of the Relationship,
   * and the Id of the remote Row that had its local Row objects change.
   * @param relationshipId The Id of the Relationship to listen to, or `null` as
   * a wildcard.
   * @param remoteRowId The Id of the remote Row to listen to, or `null` as a
   * wildcard.
   * @param listener The function that will be called whenever the local Row Ids
   * change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, a Relationships object, and then registers a
   * listener that responds to any changes to a specific remote Row's local Row
   * objects.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * const listenerId = relationships.addLocalRowIdsListener(
   *   'petSpecies',
   *   'dog',
   *   (relationships) => {
   *     console.log('petSpecies relationship (to dog) changed');
   *     console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
   *   },
   * );
   *
   * store.setRow('pets', 'toto', {species: 'dog'});
   * // -> 'petSpecies relationship (to dog) changed'
   * // -> ['fido', 'cujo', 'toto']
   *
   * relationships.delListener(listenerId);
   * ```
   * @example
   * This example creates a Store, a Relationships object, and then registers a
   * listener that responds to any changes to any remote Row's local Row
   * objects.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog', color: 'brown'},
   *     felix: {species: 'cat', color: 'black'},
   *     cujo: {species: 'dog', color: 'brown'},
   *     toto: {species: 'dog', color: 'grey'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   })
   *   .setTable('color', {
   *     brown: {discount: 0.1},
   *     black: {discount: 0},
   *     grey: {discount: 0.2},
   *   });
   *
   * const relationships = createRelationships(store)
   *   .setRelationshipDefinition('petSpecies', 'pets', 'species', 'species')
   *   .setRelationshipDefinition('petColor', 'pets', 'color', 'color');
   *
   * const listenerId = relationships.addLocalRowIdsListener(
   *   null,
   *   null,
   *   (relationships, relationshipId, remoteRowId) => {
   *     console.log(
   *       `${relationshipId} relationship (to ${remoteRowId}) changed`,
   *     );
   *     console.log(relationships.getLocalRowIds(relationshipId, remoteRowId));
   *   },
   * );
   *
   * store.setRow('pets', 'cujo', {species: 'wolf', color: 'grey'});
   * // -> 'petSpecies relationship (to dog) changed'
   * // -> ['fido', 'toto']
   * // -> 'petSpecies relationship (to wolf) changed'
   * // -> ['cujo']
   * // -> 'petColor relationship (to brown) changed'
   * // -> ['fido']
   * // -> 'petColor relationship (to grey) changed'
   * // -> ['toto', 'cujo']
   *
   * relationships.delListener(listenerId);
   * ```
   * @category Listener
   */
  /// Relationships.addLocalRowIdsListener
  /**
   * The addLinkedRowIdsListener method registers a listener function with the
   * Relationships object that will be called whenever the linked Row Ids in a
   * linked list Relationship change.
   *
   * A linked list Relationship is one that has the same Table specified as both
   * local Table Id and remote Table Id, allowing you to create a sequence of
   * Row objects within that one Table.
   *
   * You listen to changes to a linked list starting from a single first Row by
   * specifying the Relationship Id and local Row Id as the method's first two
   * parameters.
   *
   * Unlike other listener registration methods, you cannot provide `null`
   * wildcards for the first two parameters of the addLinkedRowIdsListener
   * method. This prevents the prohibitive expense of tracking all the possible
   * linked lists (and partial linked lists within them) in a Store.
   *
   * The provided listener is a LinkedRowIdsListener function, and will be
   * called with a reference to the Relationships object, the Id of the
   * Relationship, and the Id of the first Row that had its linked list change.
   * @param relationshipId The Id of the Relationship to listen to.
   * @param firstRowId The Id of the first Row of the linked list to listen to.
   * @param listener The function that will be called whenever the linked Row
   * Ids change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, a Relationships object, and then registers a
   * listener that responds to any changes to a specific first Row's linked Row
   * objects.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore().setTable('pets', {
   *   fido: {species: 'dog', next: 'felix'},
   *   felix: {species: 'cat', next: 'cujo'},
   *   cujo: {species: 'dog'},
   * });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSequence',
   *   'pets',
   *   'pets',
   *   'next',
   * );
   *
   * const listenerId = relationships.addLinkedRowIdsListener(
   *   'petSequence',
   *   'fido',
   *   (relationships) => {
   *     console.log('petSequence linked list (from fido) changed');
   *     console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
   *   },
   * );
   *
   * store.setRow('pets', 'toto', {species: 'dog'});
   * store.setCell('pets', 'cujo', 'next', 'toto');
   * // -> 'petSequence linked list (from fido) changed'
   * // -> ['fido', 'felix', 'cujo', 'toto']
   *
   * relationships.delListener(listenerId);
   * ```
   * @category Listener
   */
  /// Relationships.addLinkedRowIdsListener
  /**
   * The delListener method removes a listener that was previously added to the
   * Relationships object.
   *
   * Use the Id returned by whichever method was used to add the listener. Note
   * that the Relationships object may re-use this Id for future listeners added
   * to it.
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the Relationships object.
   * @example
   * This example creates a Store, a Relationships object, registers a listener,
   * and then removes it.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   *
   * const listenerId = relationships.addLocalRowIdsListener(
   *   'petSpecies',
   *   'dog',
   *   () => {
   *     console.log('petSpecies relationship (to dog) changed');
   *   },
   * );
   *
   * store.setRow('pets', 'toto', {species: 'dog'});
   * // -> 'petSpecies relationship (to dog) changed'
   *
   * relationships.delListener(listenerId);
   *
   * store.setRow('pets', 'toto', {species: 'dog'});
   * // -> undefined
   * // The listener is not called.
   * ```
   * @category Listener
   */
  /// Relationships.delListener
  /**
   * The destroy method should be called when this Relationships object is no
   * longer used.
   *
   * This guarantees that all of the listeners that the object registered with
   * the underlying Store are removed and it can be correctly garbage collected.
   * @example
   * This example creates a Store, adds a Relationships object with a
   * definition (that registers a RowListener with the underlying Store),
   * and then destroys it again, removing the listener.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog'},
   *     felix: {species: 'cat'},
   *     cujo: {species: 'dog'},
   *   })
   *   .setTable('species', {
   *     wolf: {price: 10},
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   *
   * const relationships = createRelationships(store);
   * relationships.setRelationshipDefinition(
   *   'petSpecies',
   *   'pets',
   *   'species',
   *   'species',
   * );
   * console.log(store.getListenerStats().row);
   * // -> 1
   *
   * relationships.destroy();
   *
   * console.log(store.getListenerStats().row);
   * // -> 0
   * ```
   * @category Lifecycle
   */
  /// Relationships.destroy
  /**
   * The getListenerStats method provides a set of statistics about the
   * listeners registered with the Relationships object, and is used for
   * debugging purposes.
   *
   * The RelationshipsListenerStats object contains a breakdown of the different
   * types of listener.
   *
   * The statistics are only populated in a debug build: production builds
   * return an empty object. The method is intended to be used during
   * development to ensure your application is not leaking listener
   * registrations, for example.
   * @returns A RelationshipsListenerStats object containing Relationships
   * listener statistics.
   * @example
   * This example gets the listener statistics of a Relationships object.
   *
   * ```js
   * import {createRelationships, createStore} from 'tinybase';
   * const store = createStore();
   * const relationships = createRelationships(store);
   * relationships.addRemoteRowIdListener(null, null, () => {
   *   console.log('Remote Row Id changed');
   * });
   * relationships.addLocalRowIdsListener(null, null, () => {
   *   console.log('Local Row Id changed');
   * });
   *
   * const listenerStats = relationships.getListenerStats();
   * console.log(listenerStats.remoteRowId);
   * // -> 1
   * console.log(listenerStats.localRowIds);
   * // -> 1
   * ```
   * @category Development
   */
  /// Relationships.getListenerStats
}
/**
 * The createRelationships function creates a Relationships object, and is the
 * main entry point into the relationships module.
 *
 * A given Store can only have one Relationships object associated with it. If
 * you call this function twice on the same Store, your second call will return
 * a reference to the Relationships object created by the first.
 * @param store The Store for which to register Relationships.
 * @returns A reference to the new Relationships object.
 * @example
 * This example creates a Relationships object.
 *
 * ```js
 * import {createRelationships, createStore} from 'tinybase';
 * const store = createStore();
 * const relationships = createRelationships(store);
 * console.log(relationships.getRelationshipIds());
 * // -> []
 * ```
 * @example
 * This example creates a Relationships object, and calls the method a second
 * time for the same Store to return the same object.
 *
 * ```js
 * import {createRelationships, createStore} from 'tinybase';
 * const store = createStore();
 * const relationships1 = createRelationships(store);
 * const relationships2 = createRelationships(store);
 * console.log(relationships1 === relationships2);
 * // -> true
 * ```
 * @category Creation
 */
/// createRelationships
