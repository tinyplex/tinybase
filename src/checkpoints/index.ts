import type {
  CheckpointCallback,
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
  CheckpointsListenerStats,
  createCheckpoints as createCheckpointsDecl,
} from '../@types/checkpoints/index.d.ts';
import type {Id, IdOrNull, Ids} from '../@types/common/index.d.ts';
import type {
  CellOrUndefined,
  ChangedCell,
  ChangedValue,
  Store,
  ValueOrUndefined,
} from '../@types/store/index.d.ts';
import {
  arrayClear,
  arrayForEach,
  arrayHas,
  arrayIsEqual,
  arrayPop,
  arrayPush,
  arrayShift,
  arrayUnshift,
} from '../common/array.ts';

import {encodeIfJson} from '../common/cell.ts';
import {
  collClear,
  collForEach,
  collHas,
  collIsEmpty,
  collSize2,
} from '../common/coll.ts';
import {getCreateFunction} from '../common/definable.ts';
import {tryFinally} from '../common/error.ts';
import {getListenerFunctions} from '../common/listeners.ts';
import {
  IdMap,
  IdMap2,
  IdMap3,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from '../common/map.ts';
import {objFreeze} from '../common/obj.ts';
import {ifNotUndefined, isEmpty, isUndefined, size} from '../common/other.ts';
import {IdSet2} from '../common/set.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {ProtectedStore} from '../index.ts';

type CellsDelta = IdMap3<ChangedCell>;
type ValuesDelta = IdMap<ChangedValue>;

const cellOrValueIsEqual = (
  value1: CellOrUndefined | ValueOrUndefined,
  value2: CellOrUndefined | ValueOrUndefined,
): boolean =>
  value1 === value2 ||
  (!isUndefined(value1) &&
    !isUndefined(value2) &&
    encodeIfJson(value1) === encodeIfJson(value2));

export const createCheckpoints = getCreateFunction(
  (store: Store): Checkpoints => {
    let backwardIdsSize = 100;
    let currentId: Id | undefined;
    let cellsDelta: CellsDelta = mapNew();
    let valuesDelta: ValuesDelta = mapNew();
    let listening = 1;
    let listeningToStore = 0;
    let nextCheckpointId: number;
    let checkpointsChanged: 0 | 1;
    let idsBeforeStoreChanges: CheckpointIds | undefined;
    let storeChangingInTransaction = false;
    const checkpointIdsListeners: IdSet2 = mapNew();
    const checkpointListeners: IdSet2 = mapNew();
    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => checkpoints,
    );
    const deltas: IdMap<[CellsDelta, ValuesDelta]> = mapNew();
    // What going backward or forward has set, during a transaction that has
    // yet to tell the Store's listeners about it.
    const visitedCells: IdMap3<[CellOrUndefined]> = mapNew();
    const visitedValues: IdMap<[ValueOrUndefined]> = mapNew();
    const labels: IdMap<string> = mapNew();
    const backwardIds: Ids = [];
    const forwardIds: Ids = [];

    const updateStore = (oldOrNew: 0 | 1, checkpointId: Id) => {
      listening = 0;
      tryFinally(
        () =>
          store.transaction(() => {
            const [cellsDelta, valuesDelta] = mapGet(deltas, checkpointId) as [
              CellsDelta,
              ValuesDelta,
            ];
            collForEach(cellsDelta, (table, tableId) =>
              collForEach(table, (row, rowId) =>
                collForEach(row, (oldNew, cellId) => {
                  const cell = oldNew[oldOrNew] as CellOrUndefined;
                  mapSet(
                    mapEnsure(
                      mapEnsure<Id, IdMap2<[CellOrUndefined]>>(
                        visitedCells,
                        tableId,
                        mapNew,
                      ),
                      rowId,
                      mapNew,
                    ),
                    cellId,
                    [cell],
                  );
                  (store as ProtectedStore)._[5](
                    tableId,
                    rowId,
                    cellId,
                    cell,
                    true,
                  );
                }),
              ),
            );
            collForEach(valuesDelta, (oldNew, valueId) => {
              const value = oldNew[oldOrNew] as ValueOrUndefined;
              mapSet(visitedValues, valueId, [value]);
              (store as ProtectedStore)._[6](valueId, value, true);
            });
            (store as ProtectedStore)._[11](() => {
              collClear(visitedCells);
              collClear(visitedValues);
            });
          }),
        () => (listening = 1),
      );
    };

    const clearCheckpointId = (checkpointId: Id): void => {
      mapSet(deltas, checkpointId);
      mapSet(labels, checkpointId);
      callListeners(checkpointListeners, [checkpointId]);
    };

    const clearCheckpointIds = (checkpointIds: Ids, to?: number): void =>
      arrayForEach(
        arrayClear(checkpointIds, to ?? size(checkpointIds)),
        clearCheckpointId,
      );

    const trimBackwardsIds = (): void => {
      if (size(backwardIds) > backwardIdsSize) {
        clearCheckpointIds(backwardIds, size(backwardIds) - backwardIdsSize);
        checkpointsChanged = 1;
      }
    };

    const storeChanged = () =>
      ifNotUndefined(currentId, (checkpointId) => {
        arrayPush(backwardIds, checkpointId);
        currentId = undefined;
        checkpointsChanged = 1;
        trimBackwardsIds();
        clearCheckpointIds(forwardIds);
      });

    const storeUnchanged = () => {
      if (!isEmpty(backwardIds)) {
        currentId = arrayPop(backwardIds);
        checkpointsChanged = 1;
      }
    };

    let cellListenerId: string;
    let valueListenerId: string;

    const addCheckpointImpl = (label = EMPTY_STRING): Id => {
      if (isUndefined(currentId)) {
        currentId = EMPTY_STRING + nextCheckpointId++;
        mapSet(deltas, currentId, [cellsDelta, valuesDelta]);
        setCheckpoint(currentId, label);
        cellsDelta = mapNew();
        valuesDelta = mapNew();
        checkpointsChanged = 1;
      }
      return currentId as Id;
    };

    const goBackwardImpl = () => {
      if (!isEmpty(backwardIds)) {
        const checkpointId = addCheckpointImpl();
        arrayUnshift(forwardIds, checkpointId);
        currentId = arrayPop(backwardIds);
        checkpointsChanged = 1;
        updateStore(0, checkpointId);
      }
    };

    const goForwardImpl = () => {
      if (!isEmpty(forwardIds)) {
        arrayPush(backwardIds, currentId as Id);
        currentId = arrayShift(forwardIds);
        checkpointsChanged = 1;
        updateStore(1, currentId as Id);
      }
    };

    const callListenersIfChanged = (): void => {
      if (checkpointsChanged) {
        callListeners(checkpointIdsListeners);
        checkpointsChanged = 0;
      }
    };

    // The Store's changes in a transaction are heard one at a time, and may
    // move the checkpoint Ids and then put them back, so their listeners are
    // only told once the transaction has finished, and only if they moved.
    const storeChanging = (): void => {
      if (isUndefined(idsBeforeStoreChanges)) {
        idsBeforeStoreChanges = getCheckpointIds();
        storeChangingInTransaction = (store as ProtectedStore)._[11](
          storeChangesFinished,
        );
      }
    };

    const storeChangeHeard = (): void =>
      storeChangingInTransaction ? undefined : storeChangesFinished();

    const storeChangesFinished = (): void => {
      const [backwardIdsBefore, currentIdBefore, forwardIdsBefore] =
        idsBeforeStoreChanges as CheckpointIds;
      idsBeforeStoreChanges = undefined;
      if (
        arrayIsEqual(backwardIdsBefore, backwardIds) &&
        currentIdBefore === currentId &&
        arrayIsEqual(forwardIdsBefore, forwardIds)
      ) {
        checkpointsChanged = 0;
      }
      callListenersIfChanged();
    };

    const setSize = (size: number): Checkpoints => {
      backwardIdsSize = size;
      trimBackwardsIds();
      callListenersIfChanged();
      return checkpoints;
    };

    const addCheckpoint = (label?: string) => {
      const id = addCheckpointImpl(label);
      callListenersIfChanged();
      return id;
    };

    const setCheckpoint = (checkpointId: Id, label = EMPTY_STRING) => {
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
          : undefined;
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

    const clearForward = (): Checkpoints => {
      if (!isEmpty(forwardIds)) {
        clearCheckpointIds(forwardIds);
        callListeners(checkpointIdsListeners);
      }
      return checkpoints;
    };

    const destroy = (): void => {
      if (listeningToStore) {
        listeningToStore = 0;
        store.delListener(cellListenerId);
        store.delListener(valueListenerId);
      }
    };

    const getListenerStats = (): CheckpointsListenerStats => ({
      checkpointIds: collSize2(checkpointIdsListeners),
      checkpoint: collSize2(checkpointListeners),
    });

    const _registerListeners = () => {
      if (!listeningToStore) {
        listeningToStore = 1;
        cellListenerId = store.addCellListener(
          null,
          null,
          null,
          (_store, tableId, rowId, cellId, newCell, oldCell) => {
            const visited = mapGet(
              mapGet(mapGet(visitedCells, tableId), rowId),
              cellId,
            );
            if (
              listening &&
              !(visited && cellOrValueIsEqual(visited[0], newCell))
            ) {
              storeChanging();
              storeChanged();
              const table = mapEnsure<Id, IdMap2<ChangedCell>>(
                cellsDelta,
                tableId,
                mapNew,
              );
              const row = mapEnsure<Id, IdMap<ChangedCell>>(
                table,
                rowId,
                mapNew,
              );
              const oldNew = mapEnsure<Id, ChangedCell>(row, cellId, () => [
                visited ? visited[0] : oldCell,
                undefined,
              ]);
              oldNew[1] = newCell;
              if (
                cellOrValueIsEqual(oldNew[0], newCell) &&
                collIsEmpty(mapSet(row, cellId)) &&
                collIsEmpty(mapSet(table, rowId)) &&
                collIsEmpty(mapSet(cellsDelta, tableId)) &&
                collIsEmpty(valuesDelta)
              ) {
                storeUnchanged();
              }
              storeChangeHeard();
            }
          },
        );

        valueListenerId = store.addValueListener(
          null,
          (_store, valueId, newValue, oldValue) => {
            const visited = mapGet(visitedValues, valueId);
            if (
              listening &&
              !(visited && cellOrValueIsEqual(visited[0], newValue))
            ) {
              storeChanging();
              storeChanged();
              const oldNew = mapEnsure<Id, ChangedValue>(
                valuesDelta,
                valueId,
                () => [visited ? visited[0] : oldValue, undefined],
              );
              oldNew[1] = newValue;
              if (
                cellOrValueIsEqual(oldNew[0], newValue) &&
                collIsEmpty(mapSet(valuesDelta, valueId)) &&
                collIsEmpty(cellsDelta)
              ) {
                storeUnchanged();
              }
              storeChangeHeard();
            }
          },
        );
      }
    };

    const checkpoints = {
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
      clearForward,
      destroy,
      getListenerStats,

      _registerListeners,
    };

    return objFreeze(checkpoints.clear());
  },
  (checkpoints: any) => checkpoints._registerListeners(),
) as typeof createCheckpointsDecl;
