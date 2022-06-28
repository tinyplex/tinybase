import {
  CellIdsListener,
  CellListener,
  InvalidCellListener,
  RowIdsListener,
  RowListener,
  Store,
  TableIdsListener,
  TableListener,
  TablesListener,
  TransactionListener,
} from '../store.d';
import {
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../checkpoints.d';
import {Id, IdOrNull, Ids} from '../common.d';
import {IdMap, mapEnsure, mapGet, mapNew, mapSet} from './map';
import {IdSet, setAdd, setNew} from './set';
import {Indexes, SliceIdsListener, SliceRowIdsListener} from '../indexes.d';
import {
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../relationships.d';
import {MetricListener, Metrics} from '../metrics.d';
import {
  arrayForEach,
  arrayIsEmpty,
  arrayLength,
  arrayPop,
  arrayPush,
  arraySlice,
} from './array';
import {collDel, collForEach} from './coll';
import {ifNotUndefined, isUndefined} from './other';

export type DeepIdSet = Map<IdOrNull, DeepIdSet> | IdSet;

type IdOrBoolean = Id | boolean;
type Listener =
  | TablesListener
  | TableIdsListener
  | TableListener
  | RowIdsListener
  | RowListener
  | CellIdsListener
  | CellListener
  | InvalidCellListener
  | TransactionListener
  | MetricListener
  | SliceIdsListener
  | SliceRowIdsListener
  | RemoteRowIdListener
  | LocalRowIdsListener
  | CheckpointIdsListener
  | CheckpointListener;

const addDeepSet = (deepSet: DeepIdSet, value: Id, ids: IdOrNull[]): IdSet =>
  (arrayLength(ids) < 2
    ? setAdd(
        arrayIsEmpty(ids)
          ? (deepSet as IdSet)
          : mapEnsure(deepSet as Map<IdOrNull, IdSet>, ids[0], setNew),
        value,
      )
    : addDeepSet(
        mapEnsure(deepSet as Map<IdOrNull, DeepIdSet>, ids[0] as Id, mapNew),
        value,
        arraySlice(ids, 1),
      )) as IdSet;

const forDeepSet = (valueDo: (set: IdSet, arg: any) => void) => {
  const deep = (
    deepIdSet: DeepIdSet | undefined,
    arg: any,
    ...ids: IdOrBoolean[]
  ): void =>
    ifNotUndefined(deepIdSet, (deepIdSet) =>
      arrayIsEmpty(ids)
        ? valueDo(deepIdSet as IdSet, arg)
        : arrayForEach([ids[0], null], (id) =>
            deep(
              mapGet(deepIdSet as Map<IdOrNull, DeepIdSet>, id) as DeepIdSet,
              arg,
              ...arraySlice(ids, 1),
            ),
          ),
    );
  return deep;
};

const forDeepSetForEach = forDeepSet(collForEach);

const forDeepSetDel = forDeepSet(collDel);

export const getListenerFunctions = (
  getThing: () => Store | Metrics | Indexes | Relationships | Checkpoints,
): [
  (listener: Listener, deepSet: DeepIdSet, ids?: IdOrNull[]) => Id,
  (deepSet: DeepIdSet, ids?: Ids, ...extra: any[]) => void,
  (id: Id) => Ids,
  (
    id: Id,
    idNullGetters: ((...ids: Ids) => Ids)[],
    extraArgsGetter: (ids: Ids) => any[],
  ) => void,
] => {
  let thing: Store | Metrics | Indexes | Relationships | Checkpoints;
  let nextId = 0;
  const listenerPool: Ids = [];
  const allListeners: IdMap<[Listener, DeepIdSet, Ids]> = mapNew();

  const addListener = (
    listener: Listener,
    deepSet: DeepIdSet,
    idOrNulls: IdOrNull[] = [],
  ): Id => {
    thing ??= getThing();
    const id = arrayPop(listenerPool) ?? '' + nextId++;
    mapSet(allListeners, id, [listener, deepSet, idOrNulls]);
    addDeepSet(deepSet, id, idOrNulls);
    return id;
  };

  const callListeners = (
    deepSet: DeepIdSet,
    ids: Ids = [],
    ...extraArgs: any[]
  ): void =>
    forDeepSetForEach(
      deepSet,
      (id: Id) =>
        ifNotUndefined(mapGet(allListeners, id), ([listener]) =>
          (listener as any)(thing, ...ids, ...extraArgs),
        ),
      ...ids,
    );

  const delListener = (id: Id): Ids =>
    ifNotUndefined(
      mapGet(allListeners, id),
      ([, deepSet, idOrNulls]) => {
        forDeepSetDel(deepSet, id, ...idOrNulls);
        mapSet(allListeners, id);
        if (arrayLength(listenerPool) < 1e3) {
          arrayPush(listenerPool, id);
        }
        return idOrNulls;
      },
      () => [],
    ) as Ids;

  const callListener = (
    id: Id,
    idNullGetters: ((...ids: Ids) => Ids)[],
    extraArgsGetter: (ids: Ids) => any[],
  ): void =>
    ifNotUndefined(mapGet(allListeners, id), ([listener, , idOrNulls]) => {
      const callWithIds = (...ids: Ids): any => {
        const index = arrayLength(ids);
        index == arrayLength(idOrNulls)
          ? (listener as any)(thing, ...ids, ...extraArgsGetter(ids))
          : isUndefined(idOrNulls[index])
          ? arrayForEach(idNullGetters[index](...ids), (id) =>
              callWithIds(...ids, id),
            )
          : callWithIds(...ids, idOrNulls[index] as Id);
      };
      callWithIds();
    });

  return [addListener, callListeners, delListener, callListener];
};
