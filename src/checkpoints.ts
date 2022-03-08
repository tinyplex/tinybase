import {Cell, CellOrUndefined, Store} from './store.d';
import {
  CheckpointCallback,
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
  CheckpointsListenerStats,
  createCheckpoints as createCheckpointsDecl,
} from './checkpoints.d';
import {DEBUG, ifNotUndefined, isUndefined} from './common/other';
import {Id, IdOrNull, Ids} from './common.d';
import {
  IdMap,
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from './common/map';
import {IdSet, IdSet2, setNew} from './common/set';
import {
  arrayClear,
  arrayForEach,
  arrayHas,
  arrayIsEmpty,
  arrayLength,
  arrayPop,
  arrayPush,
} from './common/array';
import {
  collForEach,
  collHas,
  collIsEmpty,
  collSize,
  collSize2,
} from './common/coll';
import {getCreateFunction} from './common/definable';
import {getListenerFunctions} from './common/listeners';
import {objFreeze} from './common/obj';

type OldNew = [Cell | undefined, Cell | undefined];
type Delta = IdMap2<IdMap<OldNew>>;

export const createCheckpoints: typeof createCheckpointsDecl =
  getCreateFunction((store: Store): Checkpoints => {
    let backwardIdsSize = 100;
    let currentId: Id | undefined;
    let delta: Delta = mapNew();
    let listening = 1;
    let nextCheckpointId: number;
    let checkpointsChanged: 0 | 1;
    const checkpointIdsListeners: IdSet = setNew();
    const checkpointListeners: IdSet2 = mapNew();
    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => checkpoints,
    );
    const deltas: IdMap<Delta> = mapNew();
    const labels: IdMap<string> = mapNew();
    const backwardIds: Ids = [];
    const forwardIds: Ids = [];

    const updateStore = (oldOrNew: 0 | 1, checkpointId: Id) => {
      listening = 0;
      store.transaction(() =>
        collForEach(mapGet(deltas, checkpointId), (table, tableId) =>
          collForEach(table, (row, rowId) =>
            collForEach(row, (oldNew, cellId) =>
              isUndefined(oldNew[oldOrNew])
                ? store.delCell(tableId, rowId, cellId, true)
                : store.setCell(
                    tableId,
                    rowId,
                    cellId,
                    oldNew[oldOrNew] as Cell,
                  ),
            ),
          ),
        ),
      );
      listening = 1;
    };

    const clearCheckpointId = (checkpointId: Id): void => {
      mapSet(deltas, checkpointId);
      mapSet(labels, checkpointId);
      callListeners(checkpointListeners, [checkpointId]);
    };

    const clearCheckpointIds = (checkpointIds: Ids, to?: number): void =>
      arrayForEach(
        arrayClear(checkpointIds, to ?? arrayLength(checkpointIds)),
        clearCheckpointId,
      );

    const trimBackwardsIds = (): void =>
      clearCheckpointIds(
        backwardIds,
        arrayLength(backwardIds) - backwardIdsSize,
      );

    const listenerId = store.addCellListener(
      null,
      null,
      null,
      (_store, tableId, rowId, cellId, newCell, oldCell) => {
        if (listening) {
          ifNotUndefined(currentId, () => {
            arrayPush(backwardIds, currentId as Id);
            trimBackwardsIds();
            clearCheckpointIds(forwardIds);
            currentId = undefined;
            checkpointsChanged = 1;
          });
          const table = mapEnsure<
            Id,
            IdMap2<[CellOrUndefined, CellOrUndefined]>
          >(delta, tableId, mapNew);
          const row = mapEnsure<Id, IdMap<[CellOrUndefined, CellOrUndefined]>>(
            table,
            rowId,
            mapNew,
          );
          const oldNew = mapEnsure<Id, [CellOrUndefined, CellOrUndefined]>(
            row,
            cellId,
            () => [oldCell, undefined],
          );
          oldNew[1] = newCell;
          if (oldNew[0] === newCell) {
            if (collIsEmpty(mapSet(row, cellId))) {
              if (collIsEmpty(mapSet(table, rowId))) {
                if (collIsEmpty(mapSet(delta, tableId))) {
                  currentId = arrayPop(backwardIds);
                  checkpointsChanged = 1;
                }
              }
            }
          }
          callListenersIfChanged();
        }
      },
    );

    const addCheckpointImpl = (label = ''): Id => {
      if (isUndefined(currentId)) {
        currentId = '' + nextCheckpointId++;
        mapSet(deltas, currentId, delta);
        setCheckpoint(currentId, label);
        delta = mapNew();
        checkpointsChanged = 1;
      }
      return currentId as Id;
    };

    const goBackwardImpl = () => {
      if (!arrayIsEmpty(backwardIds)) {
        forwardIds.unshift(addCheckpointImpl());
        updateStore(0, currentId as Id);
        currentId = arrayPop(backwardIds);
        checkpointsChanged = 1;
      }
    };

    const goForwardImpl = () => {
      if (!arrayIsEmpty(forwardIds)) {
        arrayPush(backwardIds, currentId as Id);
        currentId = forwardIds.shift();
        updateStore(1, currentId as Id);
        checkpointsChanged = 1;
      }
    };

    const callListenersIfChanged = (): void => {
      if (checkpointsChanged) {
        callListeners(checkpointIdsListeners);
        checkpointsChanged = 0;
      }
    };

    const setSize = (size: number): Checkpoints => {
      backwardIdsSize = size;
      trimBackwardsIds();
      return checkpoints;
    };

    const addCheckpoint = (label?: string) => {
      const id = addCheckpointImpl(label);
      callListenersIfChanged();
      return id;
    };

    const setCheckpoint = (checkpointId: Id, label: string) => {
      if (
        hasCheckpoint(checkpointId) &&
        mapGet(labels, checkpointId) !== label
      ) {
        mapSet(labels, checkpointId, label);
        callListeners(checkpointListeners, [checkpointId]);
      }
      return checkpoints;
    };

    const getStore = (): Store => store;

    const getCheckpointIds = (): CheckpointIds => [
      [...backwardIds],
      currentId,
      [...forwardIds],
    ];

    const forEachCheckpoint = (checkpointCallback: CheckpointCallback) =>
      mapForEach(labels, checkpointCallback);

    const hasCheckpoint = (checkpointId: Id) => collHas(deltas, checkpointId);

    const getCheckpoint = (checkpointId: Id): string | undefined =>
      mapGet(labels, checkpointId);

    const goBackward = (): Checkpoints => {
      goBackwardImpl();
      callListenersIfChanged();
      return checkpoints;
    };

    const goForward = (): Checkpoints => {
      goForwardImpl();
      callListenersIfChanged();
      return checkpoints;
    };

    const goTo = (checkpointId: Id): Checkpoints => {
      const action = arrayHas(backwardIds, checkpointId)
        ? goBackwardImpl
        : arrayHas(forwardIds, checkpointId)
        ? goForwardImpl
        : null;
      while (!isUndefined(action) && checkpointId != currentId) {
        action();
      }
      callListenersIfChanged();
      return checkpoints;
    };

    const addCheckpointIdsListener = (listener: CheckpointIdsListener): Id =>
      addListener(listener, checkpointIdsListeners);

    const addCheckpointListener = (
      checkpointId: IdOrNull,
      listener: CheckpointListener,
    ): Id => addListener(listener, checkpointListeners, [checkpointId]);

    const delListener = (listenerId: Id): Checkpoints => {
      delListenerImpl(listenerId);
      return checkpoints;
    };

    const clear = (): Checkpoints => {
      clearCheckpointIds(backwardIds);
      clearCheckpointIds(forwardIds);
      if (!isUndefined(currentId)) {
        clearCheckpointId(currentId);
      }
      currentId = undefined;
      nextCheckpointId = 0;
      addCheckpoint();
      return checkpoints;
    };

    const destroy = (): void => {
      store.delListener(listenerId);
    };

    const getListenerStats = (): CheckpointsListenerStats =>
      DEBUG
        ? {
            checkpointIds: collSize(checkpointIdsListeners),
            checkpoint: collSize2(checkpointListeners),
          }
        : {};

    const checkpoints: Checkpoints = {
      setSize,
      addCheckpoint,
      setCheckpoint,

      getStore,
      getCheckpointIds,
      forEachCheckpoint,
      hasCheckpoint,
      getCheckpoint,

      goBackward,
      goForward,
      goTo,

      addCheckpointIdsListener,
      addCheckpointListener,
      delListener,

      clear,
      destroy,
      getListenerStats,
    };

    return objFreeze(checkpoints.clear());
  });
