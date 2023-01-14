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
  ValueIdsListener,
  ValueListener,
  ValuesListener,
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
import {arrayForEach, arrayLength, arrayPush} from './array';
import {collDel, collForEach, collIsEmpty} from './coll';
import {ifNotUndefined, isUndefined} from './other';
import {EMPTY_STRING} from './strings';
import {getPoolFunctions} from './pool';

export type IdSetNode = Node<IdOrNull, IdSet> | IdSet;
export type ListenerArgument = IdOrNull | boolean | number | undefined;

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
  | ValuesListener
  | ValueIdsListener
  | ValueListener
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
  const leaves: IdSet[] = [];
  const deep = (node: IdSetNode, p: number): number | void =>
    p == arrayLength(path)
      ? arrayPush(leaves, node)
      : path[p] === null
      ? collForEach(node as Node<IdOrNull, IdSet>, (node) => deep(node, p + 1))
      : arrayForEach([path[p], null], (id) =>
          deep(mapGet(node as Node<IdOrNull, IdSet>, id) as IdSetNode, p + 1),
        );
  deep(deepIdSet, 0);
  return leaves;
};

export const getListenerFunctions = (
  getThing: () => Store | Metrics | Indexes | Relationships | Checkpoints,
): [
  (listener: Listener, idSetNode: IdSetNode, ids?: ListenerArgument[]) => Id,
  (idSetNode: IdSetNode, ids?: Ids, ...extra: any[]) => void,
  (id: Id) => Ids,
  (
    id: Id,
    idNullGetters: ((...ids: Ids) => Ids)[],
    extraArgsGetter: (ids: Ids) => any[],
  ) => void,
] => {
  let thing: Store | Metrics | Indexes | Relationships | Checkpoints;

  const [getId, releaseId] = getPoolFunctions();
  const allListeners: IdMap<[Listener, IdSetNode, Ids]> = mapNew();

  const addListener = (
    listener: Listener,
    idSetNode: IdSetNode,
    path?: ListenerArgument[],
  ): Id => {
    thing ??= getThing();
    const id = getId();
    mapSet(allListeners, id, [listener, idSetNode, path]);
    setAdd(
      visitTree(
        idSetNode as Node<IdOrNull, IdSet>,
        path ?? [EMPTY_STRING],
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
        (mapGet(allListeners, id) as any)[0](
          thing,
          ...(ids ?? []),
          ...extraArgs,
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
      releaseId(id);
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
