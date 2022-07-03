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
import {IdMap, Node, mapGet, mapNew, mapSet, visitTree} from './map';
import {IdSet, setAdd, setNew} from './set';
import {Indexes, SliceIdsListener, SliceRowIdsListener} from '../indexes.d';
import {
  LocalRowIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../relationships.d';
import {MetricListener, Metrics} from '../metrics.d';
import {arrayForEach, arrayLength, arrayPop, arrayPush} from './array';
import {collDel, collForEach, collIsEmpty} from './coll';
import {ifNotUndefined, isUndefined} from './other';
import {EMPTY_STRING} from './strings';

export type IdSetNode = Node<IdOrNull, IdSet> | IdSet;

type IdOrNulls = IdOrNull[];
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

const getWildcardedLeaves = (
  deepIdSet: IdSetNode,
  path: IdOrBoolean[] = [EMPTY_STRING],
): IdSet[] => {
  const sets: IdSet[] = [];
  const deep = (set: IdSetNode, p: number): number | void =>
    p == arrayLength(path)
      ? arrayPush(sets, set)
      : arrayForEach([path[p], null], (id) =>
          deep(mapGet(set as Node<IdOrNull, IdSet>, id) as IdSetNode, p + 1),
        );
  deep(deepIdSet, 0);
  return sets;
};

export const getListenerFunctions = (
  getThing: () => Store | Metrics | Indexes | Relationships | Checkpoints,
): [
  (listener: Listener, idSetNode: IdSetNode, ids?: IdOrNulls) => Id,
  (idSetNode: IdSetNode, ids?: Ids, ...extra: any[]) => void,
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
  const allListeners: IdMap<[Listener, IdSetNode, Ids]> = mapNew();

  const addListener = (
    listener: Listener,
    idSetNode: IdSetNode,
    idOrNulls?: IdOrNulls,
  ): Id => {
    thing ??= getThing();
    const id = arrayPop(listenerPool) ?? EMPTY_STRING + nextId++;
    mapSet(allListeners, id, [listener, idSetNode, idOrNulls]);
    setAdd(
      visitTree(
        idSetNode as Node<IdOrNull, IdSet>,
        idOrNulls ?? [EMPTY_STRING],
        setNew,
      ),
      id,
    ) as IdSet;
    return id;
  };

  const callListeners = (
    idSetNode: IdSetNode,
    ids?: Ids,
    ...extraArgs: any[]
  ): void =>
    arrayForEach(getWildcardedLeaves(idSetNode, ids), (set) =>
      collForEach(set, (id: Id) =>
        ifNotUndefined(mapGet(allListeners, id), ([listener]) =>
          (listener as any)(thing, ...(ids ?? []), ...extraArgs),
        ),
      ),
    );

  const delListener = (id: Id): Ids =>
    ifNotUndefined(mapGet(allListeners, id), ([, idSetNode, idOrNulls]) => {
      visitTree(
        idSetNode as Node<IdOrNull, IdSet>,
        idOrNulls ?? [EMPTY_STRING],
        undefined,
        (idSet) => {
          collDel(idSet, id);
          return collIsEmpty(idSet) ? 1 : 0;
        },
      );
      mapSet(allListeners, id);
      if (arrayLength(listenerPool) < 1e3) {
        arrayPush(listenerPool, id);
      }
      return idOrNulls;
    }) as Ids;

  const callListener = (
    id: Id,
    idNullGetters: ((...ids: Ids) => Ids)[],
    extraArgsGetter: (ids: Ids) => any[],
  ): void =>
    ifNotUndefined(mapGet(allListeners, id), ([listener, , idOrNulls = []]) => {
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
