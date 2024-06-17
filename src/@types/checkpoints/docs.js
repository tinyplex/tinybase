/**
 * The checkpoints module of the TinyBase project provides the ability to
 * create and track checkpoints made to the data in Store objects.
 *
 * The main entry point to this module is the createCheckpoints function, which
 * returns a new Checkpoints object. From there, you can create new checkpoints,
 * go forwards or backwards to others, and register listeners for when the list
 * of checkpoints change.
 * @packageDocumentation
 * @module checkpoints
 */
/// checkpoints
/**
 * The CheckpointIds type is a representation of the list of checkpoint Ids
 * stored in a Checkpoints object.
 *
 * There are three parts to a CheckpointsIds array:
 *
 * - The 'backward' checkpoint Ids that can be rolled backward to (in other
 *   words, the checkpoints in the undo stack for this Store). They are in
 *   chronological order with the oldest checkpoint at the start of the array.
 * - The current checkpoint Id of the Store's state, or `undefined` if the
 *   current state has not been checkpointed.
 * - The 'forward' checkpoint Ids that can be rolled forward to (in other words,
 *   the checkpoints in the redo stack for this Store). They are in
 *   chronological order with the newest checkpoint at the end of the array.
 * @category Identity
 */
/// CheckpointIds
/**
 * The CheckpointCallback type describes a function that takes a Checkpoint's
 * Id.
 *
 * A CheckpointCallback is provided when using the forEachCheckpoint method,
 * so that you can do something based on every Checkpoint in the Checkpoints
 * object. See that method for specific examples.
 * @param checkpointId The Id of the Checkpoint that the callback can operate
 * on.
 * @category Callback
 */
/// CheckpointCallback
/**
 * The CheckpointIdsListener type describes a function that is used to listen to
 * changes to the checkpoint Ids in a Checkpoints object.
 *
 * A CheckpointIdsListener is provided when using the addCheckpointIdsListener
 * method. See that method for specific examples.
 *
 * When called, a CheckpointIdsListener is given a reference to the Checkpoints
 * object.
 * @param checkpoints A reference to the Checkpoints object that changed.
 * @category Listener
 */
/// CheckpointIdsListener
/**
 * The CheckpointListener type describes a function that is used to listen to
 * changes to a checkpoint's label in a Checkpoints object.
 *
 * A CheckpointListener is provided when using the addCheckpointListener method.
 * See that method for specific examples.
 *
 * When called, a CheckpointListener is given a reference to the Checkpoints
 * object, and the Id of the checkpoint whose label changed.
 * @param checkpoints A reference to the Checkpoints object that changed.
 * @param checkpointId The Id of the checkpoint that changed.
 * @category Listener
 */
/// CheckpointListener
/**
 * The CheckpointsListenerStats type describes the number of listeners
 * registered with the Checkpoints object, and can be used for debugging
 * purposes.
 *
 * A CheckpointsListenerStats object is returned from the getListenerStats
 * method, and is only populated in a debug build.
 * @category Development
 */
/// CheckpointsListenerStats
{
  /**
   * The number of CheckpointIdsListener functions registered with the
   * Checkpoints object.
   */
  /// CheckpointsListenerStats.checkpointIds
  /**
   * The number of CheckpointListener functions registered with the Checkpoints
   * object.
   */
  /// CheckpointsListenerStats.checkpoint
}
/**
 * A Checkpoints object lets you set checkpoints on a Store, and move forward
 * and backward through them to create undo and redo functionality.
 *
 * Create a Checkpoints object easily with the createCheckpoints function. From
 * there, you can set checkpoints (with the addCheckpoint method), query the
 * checkpoints available (with the getCheckpointIds method), move forward and
 * backward through them (with the goBackward method, goForward method, and goTo
 * method), and add listeners for when the list checkpoints changes (with the
 * addCheckpointIdsListener method).
 *
 * Checkpoints work for both changes to tabular data and to keyed value data.
 *
 * Every checkpoint can be given a label which can be used to describe the
 * actions that changed the Store before this checkpoint. This can be useful for
 * interfaces that let users 'Undo [last action]'.
 * @example
 * This example shows a simple lifecycle of a Checkpoints object: from creation,
 * to adding a checkpoint, getting the list of available checkpoints, and then
 * registering and removing a listener for them.
 *
 * ```js
 * import {createCheckpoints, createStore} from 'tinybase';
 *
 * const store = createStore()
 *   .setTables({pets: {fido: {sold: false}}})
 *   .setValue('open', true);
 *
 * const checkpoints = createCheckpoints(store);
 * checkpoints.setSize(200);
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], '0', []]
 *
 * store.setCell('pets', 'fido', 'sold', true);
 * checkpoints.addCheckpoint('sale');
 * console.log(checkpoints.getCheckpointIds());
 * // -> [['0'], '1', []]
 *
 * checkpoints.goBackward();
 * console.log(store.getCell('pets', 'fido', 'sold'));
 * // -> false
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], '0', ['1']]
 *
 * store.setValue('open', false);
 * checkpoints.addCheckpoint('closed');
 * console.log(checkpoints.getCheckpointIds());
 * // -> [['0'], '2', []]
 *
 * checkpoints.goBackward();
 * console.log(store.getValue('open'));
 * // -> true
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], '0', ['2']]
 *
 * const listenerId = checkpoints.addCheckpointIdsListener(() => {
 *   console.log(checkpoints.getCheckpointIds());
 * });
 * store.setCell('pets', 'fido', 'species', 'dog');
 * // -> [['0'], undefined, []]
 * checkpoints.addCheckpoint();
 * // -> [['0'], '3', []]
 * // Previous redo of checkpoints '1' and '2' are now not possible.
 *
 * checkpoints.delListener(listenerId);
 * ```
 * @see Relationships And Checkpoints guides
 * @see Todo App demos
 * @see Drawing demo
 * @category Checkpoints
 */
/// Checkpoints
{
  /**
   * The setSize method lets you specify how many checkpoints the Checkpoints
   * object will store.
   *
   * If you set more checkpoints than this size, the oldest checkpoints will be
   * pruned to make room for more recent ones.
   *
   * The default size for a newly-created Checkpoints object is 100.
   * @param size The number of checkpoints that this Checkpoints object should
   * hold.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, adds a Checkpoints object, reduces the size
   * of the Checkpoints object dramatically and then creates more than that
   * number of checkpoints to demonstrate the oldest being pruned.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {views: 0}}});
   *
   * const checkpoints = createCheckpoints(store);
   * checkpoints.setSize(2);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'views', 1);
   * checkpoints.addCheckpoint();
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * store.setCell('pets', 'fido', 'views', 2);
   * checkpoints.addCheckpoint();
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0', '1'], '2', []]
   *
   * store.setCell('pets', 'fido', 'views', 3);
   * checkpoints.addCheckpoint();
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['1', '2'], '3', []]
   * ```
   * @category Configuration
   */
  /// Checkpoints.setSize
  /**
   * The addCheckpoint method records a checkpoint of the Store into the
   * Checkpoints object that can be reverted to in the future.
   *
   * If no changes have been made to the Store since the last time a checkpoint
   * was made, this method will have no effect.
   *
   * The optional `label` parameter can be used to describe the actions that
   * changed the Store before this checkpoint. This can be useful for interfaces
   * that let users 'Undo [last action]'.
   * @param label An optional label to describe the actions leading up to this
   * checkpoint.
   * @returns The Id of the newly-created checkpoint.
   * @example
   * This example creates a Store, adds a Checkpoints object, and adds two
   * checkpoints, one with a label.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   * const checkpointId1 = checkpoints.addCheckpoint();
   * console.log(checkpointId1);
   * // -> '1'
   *
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0', '1'], '2', []]
   *
   * console.log(checkpoints.getCheckpoint('2'));
   * // -> 'sale'
   * ```
   * @category Setter
   */
  /// Checkpoints.addCheckpoint
  /**
   * The setCheckpoint method updates the label for a checkpoint in the
   * Checkpoints object after it has been created.
   *
   * The `label` parameter can be used to describe the actions that changed the
   * Store before the given checkpoint. This can be useful for interfaces that
   * let users 'Undo [last action]'.
   *
   * Generally you will provide the `label` parameter when the addCheckpoint
   * method is called. Use this setCheckpoint method only when you need to
   * change the label at a later point.
   *
   * You cannot add a label to a checkpoint that does not yet exist.
   * @param checkpointId The Id of the checkpoint to set the label for.
   * @param label A label to describe the actions leading up to this checkpoint
   * or left undefined if you want to clear the current label.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, adds a Checkpoints object, and sets two
   * checkpoints, one with a label, which are both then re-labelled.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   * checkpoints.addCheckpoint();
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   *
   * console.log(checkpoints.getCheckpoint('1'));
   * // -> ''
   * console.log(checkpoints.getCheckpoint('2'));
   * // -> 'sale'
   *
   * checkpoints.setCheckpoint('1', 'identified');
   * checkpoints.setCheckpoint('2', '');
   *
   * console.log(checkpoints.getCheckpoint('1'));
   * // -> 'identified'
   * console.log(checkpoints.getCheckpoint('2'));
   * // -> ''
   *
   * checkpoints.setCheckpoint('3', 'unknown');
   * console.log(checkpoints.getCheckpoint('3'));
   * // -> undefined
   * ```
   * @category Setter
   */
  /// Checkpoints.setCheckpoint
  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Checkpoints object.
   * @returns A reference to the Store.
   * @example
   * This example creates a Checkpoints object against a newly-created Store
   * and then gets its reference in order to update its data and set a
   * checkpoint.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const checkpoints = createCheckpoints(createStore());
   * checkpoints.getStore().setCell('pets', 'fido', 'species', 'dog');
   * checkpoints.addCheckpoint();
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   * ```
   * @category Getter
   */
  /// Checkpoints.getStore
  /**
   * The getCheckpointIds method returns an array of the checkpoint Ids being
   * managed by this Checkpoints object.
   *
   * The returned CheckpointIds array contains 'backward' checkpoint Ids, the
   * current checkpoint Id (if present), and the 'forward' checkpointIds.
   * Together, these are sufficient to understand the state of the Checkpoints
   * object and what movement is possible backward or forward through the
   * checkpoint stack.
   * @returns A CheckpointIds array, containing the checkpoint Ids managed by
   * this Checkpoints object.
   * @example
   * This example creates a Store, adds a Checkpoints object, and then gets the
   * Ids of the checkpoints as it sets them and moves around the stack.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * checkpoints.goBackward();
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', ['1']]
   *
   * checkpoints.goForward();
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   * ```
   * @category Getter
   */
  /// Checkpoints.getCheckpointIds
  /**
   * The forEachCheckpoint method takes a function that it will then call for
   * each Checkpoint in a specified Checkpoints object.
   *
   * This method is useful for iterating over the structure of the Checkpoints
   * object in a functional style. The `checkpointCallback` parameter is a
   * CheckpointCallback function that will be called with the Id of each
   * Checkpoint.
   * @param checkpointCallback The function that should be called for every
   * Checkpoint.
   * @example
   * This example iterates over each Checkpoint in a Checkpoints object.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   * const checkpoints = createCheckpoints(store);
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   *
   * checkpoints.forEachCheckpoint((checkpointId, label) => {
   *   console.log(`${checkpointId}:${label}`);
   * });
   * // -> '0:'
   * // -> '1:sale'
   * ```
   * @category Iterator
   */
  /// Checkpoints.forEachCheckpoint
  /**
   * The hasCheckpoint method returns a boolean indicating whether a given
   * Checkpoint exists in the Checkpoints object.
   * @param checkpointId The Id of a possible Checkpoint in the Checkpoints
   * object.
   * @returns Whether a Checkpoint with that Id exists.
   * @example
   * This example shows two simple Checkpoint existence checks.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.hasCheckpoint('0'));
   * // -> true
   * console.log(checkpoints.hasCheckpoint('1'));
   * // -> false
   * ```
   * @category Getter
   */
  /// Checkpoints.hasCheckpoint
  /**
   * The getCheckpoint method fetches the label for a checkpoint, if it had been
   * provided at the time of the addCheckpoint method or set subsequently with
   * the setCheckpoint method.
   *
   * If the checkpoint has had no label provided, this method will return an
   * empty string.
   * @param checkpointId The Id of the checkpoint to get the label for.
   * @returns A string label for the requested checkpoint, an empty string if it
   * was never set, or `undefined` if the checkpoint does not exist.
   * @example
   * This example creates a Store, adds a Checkpoints object, and sets a
   * checkpoint with a label, before retrieving it again.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * store.setCell('pets', 'fido', 'sold', true);
   * console.log(checkpoints.addCheckpoint('sale'));
   * // -> '1'
   *
   * console.log(checkpoints.getCheckpoint('1'));
   * // -> 'sale'
   * ```
   * @example
   * This example creates a Store, adds a Checkpoints object, and sets a
   * checkpoint without a label, setting it subsequently. A non-existent
   * checkpoint return an `undefined` label.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint();
   * console.log(checkpoints.getCheckpoint('1'));
   * // -> ''
   *
   * checkpoints.setCheckpoint('1', 'sold');
   * console.log(checkpoints.getCheckpoint('1'));
   * // -> 'sold'
   *
   * console.log(checkpoints.getCheckpoint('2'));
   * // -> undefined
   * ```
   * @category Getter
   */
  /// Checkpoints.getCheckpoint
  /**
   * The addCheckpointIdsListener method registers a listener function with the
   * Checkpoints object that will be called whenever its set of checkpoints
   * changes.
   *
   * The provided listener is a CheckpointIdsListener function, and will be
   * called with a reference to the Checkpoints object.
   * @param listener The function that will be called whenever the checkpoints
   * change.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, a Checkpoints object, and then registers a
   * listener that responds to any changes to the checkpoints.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * const listenerId = checkpoints.addCheckpointIdsListener(() => {
   *   console.log('Checkpoint Ids changed');
   *   console.log(checkpoints.getCheckpointIds());
   * });
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   * // -> 'Checkpoint Ids changed'
   * // -> [['0'], undefined, []]
   *
   * checkpoints.addCheckpoint();
   * // -> 'Checkpoint Ids changed'
   * // -> [['0'], '1', []]
   *
   * checkpoints.goBackward();
   * // -> 'Checkpoint Ids changed'
   * // -> [[], '0', ['1']]
   *
   * checkpoints.goForward();
   * // -> 'Checkpoint Ids changed'
   * // -> [['0'], '1', []]
   *
   * checkpoints.delListener(listenerId);
   * ```
   * @category Listener
   */
  /// Checkpoints.addCheckpointIdsListener
  /**
   * The addCheckpointListener method registers a listener function with the
   * Checkpoints object that will be called whenever the label of a checkpoint
   * changes.
   *
   * You can either listen to a single checkpoint label (by specifying the
   * checkpoint Id as the method's first parameter), or changes to any
   * checkpoint label (by providing a `null` wildcard).
   *
   * The provided listener is a CheckpointListener function, and will be called
   * with a reference to the Checkpoints object, and the Id of the checkpoint
   * whose label changed.
   * @param checkpointId The Id of the checkpoint to listen to, or `null` as a
   * wildcard.
   * @param listener The function that will be called whenever the checkpoint
   * label changes.
   * @returns A unique Id for the listener that can later be used to remove it.
   * @example
   * This example creates a Store, a Checkpoints object, and then registers a
   * listener that responds to any changes to a specific checkpoint label,
   * including when the checkpoint no longer exists.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * const listenerId = checkpoints.addCheckpointListener('1', () => {
   *   console.log('Checkpoint 1 label changed');
   *   console.log(checkpoints.getCheckpoint('1'));
   * });
   *
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * // -> 'Checkpoint 1 label changed'
   * // -> 'sale'
   *
   * checkpoints.setCheckpoint('1', 'sold');
   * // -> 'Checkpoint 1 label changed'
   * // -> 'sold'
   *
   * checkpoints.setCheckpoint('1', 'sold');
   * // The listener is not called when the label does not change.
   *
   * checkpoints.goTo('0');
   * store.setCell('pets', 'fido', 'sold', false);
   * // -> 'Checkpoint 1 label changed'
   * // -> undefined
   * // The checkpoint no longer exists.
   *
   * checkpoints.delListener(listenerId);
   * ```
   * @category Listener
   */
  /// Checkpoints.addCheckpointListener
  /**
   * The delListener method removes a listener that was previously added to the
   * Checkpoints object.
   *
   * Use the Id returned by the addCheckpointIdsListener method. Note that the
   * Checkpoints object may re-use this Id for future listeners added to it.
   * @param listenerId The Id of the listener to remove.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, a Checkpoints object, registers a listener,
   * and then removes it.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * const listenerId = checkpoints.addCheckpointIdsListener(() => {
   *   console.log('checkpoints changed');
   * });
   *
   * store.setCell('pets', 'fido', 'species', 'dog');
   * // -> 'checkpoints changed'
   *
   * checkpoints.addCheckpoint();
   * // -> 'checkpoints changed'
   *
   * checkpoints.delListener(listenerId);
   *
   * store.setCell('pets', 'fido', 'sold', 'true');
   * // -> undefined
   * // The listener is not called.
   * ```
   * @category Listener
   */
  /// Checkpoints.delListener
  /**
   * The goBackward method moves the state of the underlying Store back to the
   * previous checkpoint, effectively performing an 'undo' on the Store data.
   *
   * If there is no previous checkpoint to return to, this method has no effect.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, a Checkpoints object, makes a change and then
   * goes backward to the state of the Store before the change.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * checkpoints.goBackward();
   * console.log(store.getCell('pets', 'fido', 'sold'));
   * // -> false
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', ['1']]
   * ```
   * @category Movement
   */
  /// Checkpoints.goBackward
  /**
   * The goForward method moves the state of the underlying Store forwards to a
   * future checkpoint, effectively performing an 'redo' on the Store data.
   *
   * If there is no future checkpoint to return to, this method has no effect.
   *
   * Note that if you have previously used the goBackward method to undo
   * changes, the forwards 'redo' stack will only exist while you do not make
   * changes to the Store. In general the goForward method is expected to be
   * used to redo changes that were just undone.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, a Checkpoints object, makes a change and then
   * goes backward to the state of the Store before the change. It then goes
   * forward again to restore the state with the changes.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * checkpoints.goBackward();
   * console.log(store.getCell('pets', 'fido', 'sold'));
   * // -> false
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', ['1']]
   *
   * checkpoints.goForward();
   * console.log(store.getCell('pets', 'fido', 'sold'));
   * // -> true
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   * ```
   * @example
   * This example creates a Store, a Checkpoints object, makes a change and then
   * goes backward to the state of the Store before the change. It makes a new
   * change, the redo stack disappears, and then the attempt to forward again
   * has no effect.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * checkpoints.goBackward();
   * console.log(store.getCell('pets', 'fido', 'sold'));
   * // -> false
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', ['1']]
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], undefined, []]
   *
   * checkpoints.goForward();
   * console.log(store.getCell('pets', 'fido', 'sold'));
   * // -> false
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], undefined, []]
   * // The original change cannot be redone.
   * ```
   * @category Movement
   */
  /// Checkpoints.goForward
  /**
   * The goTo method moves the state of the underlying Store backwards or
   * forwards to a specified checkpoint.
   *
   * If there is no checkpoint with the Id specified, this method has no effect.
   * @param checkpointId The Id of the checkpoint to move to.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, a Checkpoints object, makes two changes and
   * then goes directly to the state of the Store before the two changes. It
   * then goes forward again one change, also using the goTo method. Finally it
   * tries to go to a checkpoint that does not exist.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * checkpoints.addCheckpoint('identification');
   * store.setCell('pets', 'fido', 'sold', true);
   * checkpoints.addCheckpoint('sale');
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0', '1'], '2', []]
   *
   * checkpoints.goTo('0');
   * console.log(store.getTables());
   * // -> {pets: {fido: {sold: false}}}
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', ['1', '2']]
   *
   * checkpoints.goTo('1');
   * console.log(store.getTables());
   * // -> {pets: {fido: {sold: false, color: 'brown'}}}
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', ['2']]
   *
   * checkpoints.goTo('3');
   * console.log(store.getTables());
   * // -> {pets: {fido: {sold: false, color: 'brown'}}}
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', ['2']]
   * ```
   * @category Movement
   */
  /// Checkpoints.goTo
  /**
   * The clear method resets this Checkpoints object to its initial state,
   * removing all the checkpoints it has been managing.
   *
   * Obviously this method should be used with caution as it destroys the
   * ability to undo or redo recent changes to the Store (though of course the
   * Store itself is not reset by this method).
   *
   * This method can be useful when a Store is being loaded via a Persister
   * asynchronously after the Checkpoints object has been attached, and you
   * don't want users to be able to undo the initial load of the data. In this
   * case you could call the clear method immediately after the initial load so
   * that that is the baseline from which all subsequent changes are tracked.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, a Checkpoints object, adds a listener, makes
   * a change and then clears the checkpoints.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * const listenerId = checkpoints.addCheckpointIdsListener(() => {
   *   console.log('checkpoints changed');
   * });
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * // -> 'checkpoints changed'
   * checkpoints.addCheckpoint();
   * // -> 'checkpoints changed'
   * store.setCell('pets', 'fido', 'sold', true);
   * // -> 'checkpoints changed'
   * checkpoints.addCheckpoint();
   * // -> 'checkpoints changed'
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {sold: true, color: 'brown'}}}
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0', '1'], '2', []]
   *
   * checkpoints.clear();
   * // -> 'checkpoints changed'
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {sold: true, color: 'brown'}}}
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * checkpoints.delListener(listenerId);
   * ```
   * @category Lifecycle
   */
  /// Checkpoints.clear
  /**
   * The clearForward method resets just the 'redo' checkpoints it has been
   * managing.
   *
   * Obviously this method should be used with caution as it destroys the
   * ability to redo recent changes to the Store (though of course the Store
   * itself is not reset by this method).
   *
   * This method can be useful when you want to prohibit a user from redoing
   * changes they have undone. The 'backward' redo stack, and current checkpoint
   * are not affected.
   * @returns A reference to the Checkpoints object.
   * @example
   * This example creates a Store, a Checkpoints object, adds a listener, makes
   * a change and then clears the forward checkpoints.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(checkpoints.getCheckpointIds());
   * // -> [[], '0', []]
   *
   * const listenerId = checkpoints.addCheckpointIdsListener(() => {
   *   console.log('checkpoints changed');
   * });
   *
   * store.setCell('pets', 'fido', 'color', 'brown');
   * // -> 'checkpoints changed'
   * checkpoints.addCheckpoint();
   * // -> 'checkpoints changed'
   * store.setCell('pets', 'fido', 'sold', true);
   * // -> 'checkpoints changed'
   * checkpoints.addCheckpoint();
   * // -> 'checkpoints changed'
   * checkpoints.goBackward();
   * // -> 'checkpoints changed'
   *
   * console.log(store.getTables());
   * // -> {pets: {fido: {color: 'brown', sold: false}}}
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', ['2']]
   *
   * checkpoints.clearForward();
   * // -> 'checkpoints changed'
   *
   * console.log(checkpoints.getCheckpointIds());
   * // -> [['0'], '1', []]
   *
   * checkpoints.delListener(listenerId);
   * ```
   * @category Lifecycle
   * @since v4.5.3
   */
  /// Checkpoints.clearForward
  /**
   * The destroy method should be called when this Checkpoints object is no
   * longer used.
   *
   * This guarantees that all of the listeners that the object registered with
   * the underlying Store are removed and it can be correctly garbage collected.
   * @example
   * This example creates a Store, adds a Checkpoints object (that registers a
   * CellListener with the underlying Store), and then destroys it again,
   * removing the listener.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore().setTables({pets: {fido: {sold: false}}});
   *
   * const checkpoints = createCheckpoints(store);
   * console.log(store.getListenerStats().cell);
   * // -> 1
   *
   * checkpoints.destroy();
   *
   * console.log(store.getListenerStats().cell);
   * // -> 0
   * ```
   * @category Lifecycle
   */
  /// Checkpoints.destroy
  /**
   * The getListenerStats method provides a set of statistics about the
   * listeners registered with the Checkpoints object, and is used for debugging
   * purposes.
   *
   * The CheckpointsListenerStats object contains a breakdown of the different
   * types of listener.
   *
   * The statistics are only populated in a debug build: production builds
   * return an empty object. The method is intended to be used during
   * development to ensure your application is not leaking listener
   * registrations, for example.
   * @returns A CheckpointsListenerStats object containing Checkpoints listener
   * statistics.
   * @example
   * This example gets the listener statistics of a Checkpoints object.
   *
   * ```js
   * import {createCheckpoints, createStore} from 'tinybase';
   *
   * const store = createStore();
   * const checkpoints = createCheckpoints(store);
   * checkpoints.addCheckpointIdsListener(() => {
   *   console.log('Checkpoint Ids changed');
   * });
   * checkpoints.addCheckpointListener(null, () => {
   *   console.log('Checkpoint label changed');
   * });
   *
   * console.log(checkpoints.getListenerStats());
   * // -> {checkpointIds: 1, checkpoint: 1}
   * ```
   * @category Development
   */
  /// Checkpoints.getListenerStats
}
/**
 * The createCheckpoints function creates a Checkpoints object, and is the main
 * entry point into the checkpoints module.
 *
 * A given Store can only have one Checkpoints object associated with it. If you
 * call this function twice on the same Store, your second call will return a
 * reference to the Checkpoints object created by the first.
 * @param store The Store for which to set Checkpoints.
 * @returns A reference to the new Checkpoints object.
 * @example
 * This example creates a Checkpoints object.
 *
 * ```js
 * import {createCheckpoints, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const checkpoints = createCheckpoints(store);
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], '0', []]
 * ```
 * @example
 * This example creates a Checkpoints object, and calls the method a second
 * time for the same Store to return the same object.
 *
 * ```js
 * import {createCheckpoints, createStore} from 'tinybase';
 *
 * const store = createStore();
 * const checkpoints1 = createCheckpoints(store);
 * const checkpoints2 = createCheckpoints(store);
 * console.log(checkpoints1 === checkpoints2);
 * // -> true
 * ```
 * @category Creation
 */
/// createCheckpoints
