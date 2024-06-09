import type {
  CellIdsListener,
  CellListener,
  InvalidCellListener,
  InvalidValueListener,
  RowCountListener,
  RowIdsListener,
  RowListener,
  Store,
  TableCellIdsListener,
  TableIdsListener,
  TableListener,
  TablesListener,
  TransactionListener,
  ValueIdsListener,
  ValueListener,
  ValuesListener,
} from '../@types/store/index.d.ts';
import type {
  CheckpointIdsListener,
  CheckpointListener,
  Checkpoints,
} from '../@types/checkpoints/index.d.ts';
import type {
  ClientIdsListener,
  PathIdsListener,
  WsServer,
} from '../@types/synchronizers/synchronizer-ws-server/index.d.ts';
import type {Id, IdOrNull, Ids} from '../@types/common/index.d.ts';
import {IdMap, Node, mapGet, mapNew, mapSet, visitTree} from './map.ts';
import {IdSet, setAdd, setNew} from './set.ts';
import type {
  IndexIdsListener,
  Indexes,
  SliceIdsListener,
  SliceRowIdsListener,
} from '../@types/indexes/index.d.ts';
import type {
  LocalRowIdsListener,
  RelationshipIdsListener,
  Relationships,
  RemoteRowIdListener,
} from '../@types/relationships/index.d.ts';
import type {
  MetricIdsListener,
  MetricListener,
  Metrics,
} from '../@types/metrics/index.d.ts';
import type {
  QueryIdsListener,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRowCountListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultTableCellIdsListener,
  ResultTableListener,
} from '../@types/queries/index.d.ts';
import {arrayForEach, arrayPush} from './array.ts';
import {collDel, collForEach, collIsEmpty} from './coll.ts';
import {ifNotUndefined, isUndefined, size} from './other.ts';
import {EMPTY_STRING} from './strings.ts';
import {getPoolFunctions} from './pool.ts';

export type IdSetNode = Node<IdOrNull, IdSet> | IdSet;
export type ListenerArgument = IdOrNull | boolean | number | undefined;
export type PathGetters = ((...ids: Ids) => Ids)[];
export type ExtraArgsGetter = (ids: Ids) => any[];
export type AddListener = (
  listener: Listener,
  idSetNode: IdSetNode,
  path?: ListenerArgument[],
  pathGetters?: PathGetters,
  extraArgsGetter?: ExtraArgsGetter,
) => Id;
export type CallListeners = (
  idSetNode: IdSetNode,
  ids?: Ids,
  ...extra: any[]
) => void;

type DelListener = (id: Id) => Ids;
type Listener =
  | TablesListener
  | TableIdsListener
  | TableListener
  | TableCellIdsListener
  | RowCountListener
  | RowIdsListener
  | RowListener
  | CellIdsListener
  | CellListener
  | InvalidCellListener
  | ValuesListener
  | ValueIdsListener
  | ValueListener
  | InvalidValueListener
  | TransactionListener
  | MetricIdsListener
  | MetricListener
  | IndexIdsListener
  | SliceIdsListener
  | SliceRowIdsListener
  | RelationshipIdsListener
  | RemoteRowIdListener
  | LocalRowIdsListener
  | CheckpointIdsListener
  | CheckpointListener
  | QueryIdsListener
  | ResultTableListener
  | ResultTableCellIdsListener
  | ResultRowCountListener
  | ResultRowIdsListener
  | ResultRowListener
  | ResultCellIdsListener
  | ResultCellListener
  | PathIdsListener
  | ClientIdsListener;
type IdOrBoolean = Id | boolean;

const getWildcardedLeaves = (
  deepIdSet: IdSetNode,
  path: IdOrBoolean[] = [EMPTY_STRING],
): IdSet[] => {
  const leaves: IdSet[] = [];
  const deep = (node: IdSetNode, p: number): number | void =>
    p == size(path)
      ? arrayPush(leaves, node)
      : path[p] === null
        ? collForEach(node as Node<IdOrNull, IdSet>, (node) =>
            deep(node, p + 1),
          )
        : arrayForEach([path[p], null], (id) =>
            deep(mapGet(node as Node<IdOrNull, IdSet>, id) as IdSetNode, p + 1),
          );
  deep(deepIdSet, 0);
  return leaves;
};

export const getListenerFunctions = (
  getThing: () =>
    | Store
    | Metrics
    | Indexes
    | Relationships
    | Checkpoints
    | WsServer,
): [
  addListener: AddListener,
  callListeners: CallListeners,
  delListener: DelListener,
  callListener: (id: Id) => void,
] => {
  let thing: Store | Metrics | Indexes | Relationships | Checkpoints | WsServer;

  const [getId, releaseId] = getPoolFunctions();
  const allListeners: IdMap<
    [Listener, IdSetNode, ListenerArgument[], PathGetters, ExtraArgsGetter]
  > = mapNew();

  const addListener = (
    listener: Listener,
    idSetNode: IdSetNode,
    path?: ListenerArgument[],
    pathGetters: PathGetters = [],
    extraArgsGetter: ExtraArgsGetter = () => [],
  ): Id => {
    thing ??= getThing();
    const id = getId(1);
    mapSet(allListeners, id, [
      listener,
      idSetNode,
      path,
      pathGetters,
      extraArgsGetter,
    ]);
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

  const callListener = (id: Id): void =>
    ifNotUndefined(
      mapGet(allListeners, id),
      ([listener, , path = [], pathGetters, extraArgsGetter]) => {
        const callWithIds = (...ids: Ids): any => {
          const index = size(ids);
          index == size(path)
            ? (listener as any)(thing, ...ids, ...extraArgsGetter(ids))
            : isUndefined(path[index])
              ? arrayForEach(pathGetters[index]?.(...ids) ?? [], (id) =>
                  callWithIds(...ids, id),
                )
              : callWithIds(...ids, path[index] as Id);
        };
        callWithIds();
      },
    );

  return [addListener, callListeners, delListener, callListener];
};
