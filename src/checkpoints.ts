import {
  CellOrUndefined,
  ChangedCell,
  ChangedValue,
  Store,
  ValueOrUndefined,
} from './types/store.d';
import {
  CheckpointCallback,
  CheckpointIds,
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
  CheckpointsListenerStats,
  createCheckpoints as createCheckpointsDecl,
} from './types/checkpoints';
import {DEBUG, ifNotUndefined, isUndefined, size} from './common/other';
import {Id, IdOrNull, Ids} from './types/common.d';
import {
  IdMap,
  IdMap2,
  IdMap3,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from './common/map';
import {
  arrayClear,
  arrayForEach,
  arrayHas,
  arrayIsEmpty,
  arrayPop,
  arrayPush,
  arrayShift,
  arrayUnshift,
} from './common/array';
import {collForEach, collHas, collIsEmpty, collSize2} from './common/coll';
import {setOrDelCell, setOrDelValue} from './common/cell';
import {EMPTY_STRING} from './common/strings';
import {IdSet2} from './common/set';
import {getCreateFunction} from './common/definable';
import {getListenerFunctions} from './common/listeners';
import {objFreeze} from './common/obj';

type CellsDelta = IdMap3<ChangedCell>;
type ValuesDelta = IdMap<ChangedValue>;

export const createCheckpoints = getCreateFunction(
  (store: Store): Checkpoints => {
    let backwardIdsSize = 100;
    let currentId: Id | undefined;
    let cellsDelta: CellsDelta = mapNew();
    let valuesDelta: ValuesDelta = mapNew();
    let listening = 1;
    let nextCheckpointId: number;
    let checkpointsChanged: 0 | 1;
    const checkpointIdsListeners: IdSet2 = mapNew();
    const checkpointListeners: IdSet2 = mapNew();
    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => checkpoints,
    );
    const deltas: IdMap<[CellsDelta, ValuesDelta]> = mapNew();
    const labels: IdMap<string> = mapNew();
    const backwardIds: Ids = [];
    const forwardIds: Ids = [];

    const updateStore = (oldOrNew: 0 | 1, checkpointId: Id) => {
      listening = 0;
      store.transaction(() => {
        const [cellsDelta, valuesDelta] = mapGet(deltas, checkpointId) as [
          CellsDelta,
          ValuesDelta,
        ];
        collForEach(cellsDelta, (table, tableId) =>
          collForEach(table, (row, rowId) =>
            collForEach(row, (oldNew, cellId) =>
              setOrDelCell(
                store,
                tableId,
                rowId,
                cellId,
                oldNew[oldOrNew] as CellOrUndefined,
              ),
            ),
          ),
        );
        collForEach(valuesDelta, (oldNew, valueId) =>
          setOrDelValue(store, valueId, oldNew[oldOrNew] as ValueOrUndefined),
        );
      });
      listening = 1;
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

    const trimBackwardsIds = (): void =>
      clearCheckpointIds(backwardIds, size(backwardIds) - backwardIdsSize);

    const storeChanged = () =>
      ifNotUndefined(currentId, () => {
        arrayPush(backwardIds, currentId as Id);
        trimBackwardsIds();
        clearCheckpointIds(forwardIds);
        currentId = undefined;
        checkpointsChanged = 1;
      });

    const storeUnchanged = () => {
      currentId = arrayPop(backwardIds);
      checkpointsChanged = 1;
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
      if (!arrayIsEmpty(backwardIds)) {
        arrayUnshift(forwardIds, addCheckpointImpl());
        updateStore(0, currentId as Id);
        currentId = arrayPop(backwardIds);
        checkpointsChanged = 1;
      }
    };

    const goForwardImpl = () => {
      if (!arrayIsEmpty(forwardIds)) {
        arrayPush(backwardIds, currentId as Id);
        currentId = arrayShift(forwardIds);
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

    const clearForward = (): Checkpoints => {
      if (!arrayIsEmpty(forwardIds)) {
        clearCheckpointIds(forwardIds);
        callListeners(checkpointIdsListeners);
      }
      return checkpoints;
    };

    const destroy = (): void => {
      store.delListener(cellListenerId);
      store.delListener(valueListenerId);
    };

    const getListenerStats = (): CheckpointsListenerStats =>
      DEBUG
        ? {
            checkpointIds: collSize2(checkpointIdsListeners),
            checkpoint: collSize2(checkpointListeners),
          }
        : {};

    const _registerListeners = () => {
      cellListenerId = store.addCellListener(
        null,
        null,
        null,
        (_store, tableId, rowId, cellId, newCell, oldCell) => {
          if (listening) {
            storeChanged();
            const table = mapEnsure<Id, IdMap2<ChangedCell>>(
              cellsDelta,
              tableId,
              mapNew,
            );
            const row = mapEnsure<Id, IdMap<ChangedCell>>(table, rowId, mapNew);
            const oldNew = mapEnsure<Id, ChangedCell>(row, cellId, () => [
              oldCell,
              undefined,
            ]);
            oldNew[1] = newCell;
            if (
              oldNew[0] === newCell &&
              collIsEmpty(mapSet(row, cellId)) &&
              collIsEmpty(mapSet(table, rowId)) &&
              collIsEmpty(mapSet(cellsDelta, tableId))
            ) {
              storeUnchanged();
            }
            callListenersIfChanged();
          }
        },
      );

      valueListenerId = store.addValueListener(
        null,
        (_store, valueId, newValue, oldValue) => {
          if (listening) {
            storeChanged();
            const oldNew = mapEnsure<Id, ChangedValue>(
              valuesDelta,
              valueId,
              () => [oldValue, undefined],
            );
            oldNew[1] = newValue;
            if (
              oldNew[0] === newValue &&
              collIsEmpty(mapSet(valuesDelta, valueId))
            ) {
              storeUnchanged();
            }
            callListenersIfChanged();
          }
        },
      );
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
