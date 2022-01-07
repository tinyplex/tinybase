import {
  CellIdsListener,
  CellListener,
  RowIdsListener,
  RowListener,
  Store,
  TableIdsListener,
  TableListener,
  TablesListener,
} from '../store.d';
import {Id, IdOrNull, Ids} from '../common.d';
import {IdMap, mapEnsure, mapGet, mapNew, mapSet} from './map';
import {IdSet, setAdd, setNew} from './set';
import {Indexes, SliceIdsListener, SliceRowIdsListener} from '../indexes.d';

import {MetricListener, Metrics} from '../metrics.d';
import {
  arrayForEach,
  arrayFromSecond,
  arrayIsEmpty,
  arrayLength,
} from './array';
import {collDel, collForEach} from './coll';
import {ifNotUndefined, isUndefined} from './other';

type IdOrBoolean = Id | boolean;
type DeepIdSet = Map<IdOrNull, DeepIdSet> | IdSet;

type Listener =
  | TablesListener
  | TableIdsListener
  | TableListener
  | RowIdsListener
  | RowListener
  | CellIdsListener
  | CellListener
  | MetricListener
  | SliceIdsListener
  | SliceRowIdsListener;

const addDeepSet = (deepSet: DeepIdSet, value: Id, ids: IdOrNull[]): IdSet =>
  (arrayLength(ids) < 2
    ? setAdd(
        arrayIsEmpty(ids)
          ? (deepSet as IdSet)
          : mapEnsure(deepSet as Map<IdOrNull, IdSet>, ids[0], setNew()),
        value,
      )
    : addDeepSet(
        mapEnsure(deepSet as Map<IdOrNull, DeepIdSet>, ids[0] as Id, mapNew()),
        value,
        arrayFromSecond(ids),
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
              ...arrayFromSecond(ids),
            ),
          ),
    );
  return deep;
};

export const getListenerFunctions = (
  getThing: () => Store | Metrics | Indexes,
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
  let thing: Store | Metrics | Indexes;
  let nextId = 0;
  const listenerPool: Ids = [];
  const allListeners: IdMap<[Listener, DeepIdSet, Ids]> = mapNew();

  const addListener = (
    listener: Listener,
    deepSet: DeepIdSet,
    idOrNulls: IdOrNull[] = [],
  ): Id => {
    thing ??= getThing();
    const id = listenerPool.pop() ?? '' + nextId++;
    mapSet(allListeners, id, [listener, deepSet, idOrNulls]);
    addDeepSet(deepSet, id, idOrNulls);
    return id;
  };

  const callListeners = (
    deepSet: DeepIdSet,
    ids: Ids = [],
    ...extraArgs: any[]
  ): void =>
    forDeepSet(collForEach)(
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
        forDeepSet(collDel)(deepSet, id, ...idOrNulls);
        mapSet(allListeners, id);
        if (arrayLength(listenerPool) < 1e3) {
          listenerPool.push(id);
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
