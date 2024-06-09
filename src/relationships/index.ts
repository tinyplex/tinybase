import {DEBUG, ifNotUndefined, isUndefined} from '../common/other.ts';
import type {GetCell, Store} from '../@types/store/index.d.ts';
import type {Id, IdOrNull, Ids} from '../@types/common/index.d.ts';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../common/map.ts';
import {IdSet, IdSet3, setAdd, setNew} from '../common/set.ts';
import type {
  LinkedRowIdsListener,
  LocalRowIdsListener,
  RelationshipCallback,
  Relationships,
  RelationshipsListenerStats,
  RemoteRowIdListener,
  createRelationships as createRelationshipsDecl,
} from '../@types/relationships/index.d.ts';
import {
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collSize3,
  collValues,
} from '../common/coll.ts';
import {
  getCreateFunction,
  getDefinableFunctions,
  getRowCellFunction,
} from '../common/definable.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {getListenerFunctions} from '../common/listeners.ts';
import {objFreeze} from '../common/obj.ts';

type Relationship = [IdMap<Id>, IdMap<IdSet>, IdMap<IdSet>, IdMap<number>];

export const createRelationships = getCreateFunction(
  (store: Store): Relationships => {
    const remoteTableIds: IdMap<Id> = mapNew();
    const remoteRowIdListeners: IdSet3 = mapNew();
    const localRowIdsListeners: IdSet3 = mapNew();
    const linkedRowIdsListeners: IdSet3 = mapNew();

    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => relationships,
    );
    const [
      getStore,
      getRelationshipIds,
      forEachRelationshipImpl,
      hasRelationship,
      getLocalTableId,
      getRelationship,
      ,
      ,
      setDefinitionAndListen,
      delDefinition,
      addRelationshipIdsListener,
      destroy,
    ] = getDefinableFunctions<Relationship, Id | undefined>(
      store,
      () => [mapNew(), mapNew(), mapNew(), mapNew()],
      (value: any): Id | undefined =>
        isUndefined(value) ? undefined : value + EMPTY_STRING,
      addListener,
      callListeners,
    );

    const getLinkedRowIdsCache = (
      relationshipId: Id,
      firstRowId: Id,
      skipCache?: boolean,
    ): IdSet | undefined =>
      ifNotUndefined(
        getRelationship(relationshipId),
        ([remoteRows, , linkedRowsCache]) => {
          if (!collHas(linkedRowsCache, firstRowId)) {
            const linkedRows: IdSet = setNew();
            if (
              getLocalTableId(relationshipId) !=
              getRemoteTableId(relationshipId)
            ) {
              setAdd(linkedRows, firstRowId);
            } else {
              let rowId: Id | undefined = firstRowId;
              while (!isUndefined(rowId) && !collHas(linkedRows, rowId)) {
                setAdd(linkedRows, rowId);
                rowId = mapGet(remoteRows, rowId);
              }
            }
            if (skipCache) {
              return linkedRows;
            }
            mapSet(linkedRowsCache, firstRowId, linkedRows);
          }
          return mapGet(linkedRowsCache, firstRowId as Id) as IdSet;
        },
      );

    const delLinkedRowIdsCache = (relationshipId: Id, firstRowId: Id) =>
      ifNotUndefined(getRelationship(relationshipId), ([, , linkedRowsCache]) =>
        mapSet(linkedRowsCache, firstRowId),
      );

    const setRelationshipDefinition = (
      relationshipId: Id,
      localTableId: Id,
      remoteTableId: Id,
      getRemoteRowId: Id | ((getCell: GetCell, localRowId: Id) => Id),
    ): Relationships => {
      mapSet(remoteTableIds, relationshipId, remoteTableId);

      setDefinitionAndListen(
        relationshipId,
        localTableId,
        (
          change: () => void,
          changedRemoteRowIds: IdMap<[Id | undefined, Id | undefined]>,
        ) => {
          const changedLocalRows: IdSet = setNew();
          const changedRemoteRows: IdSet = setNew();
          const changedLinkedRows: IdSet = setNew();
          const [localRows, remoteRows] = getRelationship(
            relationshipId,
          ) as Relationship;

          collForEach(
            changedRemoteRowIds,
            ([oldRemoteRowId, newRemoteRowId], localRowId) => {
              if (!isUndefined(oldRemoteRowId)) {
                setAdd(changedRemoteRows, oldRemoteRowId);
                ifNotUndefined(
                  mapGet(remoteRows, oldRemoteRowId),
                  (oldRemoteRow) => {
                    collDel(oldRemoteRow, localRowId);
                    if (collIsEmpty(oldRemoteRow)) {
                      mapSet(remoteRows, oldRemoteRowId);
                    }
                  },
                );
              }
              if (!isUndefined(newRemoteRowId)) {
                setAdd(changedRemoteRows, newRemoteRowId);
                if (!collHas(remoteRows, newRemoteRowId)) {
                  mapSet(remoteRows, newRemoteRowId, setNew());
                }
                setAdd(mapGet(remoteRows, newRemoteRowId), localRowId);
              }
              setAdd(changedLocalRows, localRowId);
              mapSet(localRows, localRowId, newRemoteRowId);
              mapForEach(
                mapGet(linkedRowIdsListeners, relationshipId),
                (firstRowId) => {
                  if (
                    collHas(
                      getLinkedRowIdsCache(relationshipId, firstRowId),
                      localRowId,
                    )
                  ) {
                    setAdd(changedLinkedRows, firstRowId);
                  }
                },
              );
            },
          );

          change();

          collForEach(changedLocalRows, (localRowId) =>
            callListeners(remoteRowIdListeners, [relationshipId, localRowId]),
          );
          collForEach(changedRemoteRows, (remoteRowId) =>
            callListeners(localRowIdsListeners, [relationshipId, remoteRowId]),
          );
          collForEach(changedLinkedRows, (firstRowId) => {
            delLinkedRowIdsCache(relationshipId, firstRowId);
            callListeners(linkedRowIdsListeners, [relationshipId, firstRowId]);
          });
        },
        getRowCellFunction(getRemoteRowId),
      );
      return relationships;
    };

    const forEachRelationship = (relationshipCallback: RelationshipCallback) =>
      forEachRelationshipImpl((relationshipId) =>
        relationshipCallback(relationshipId, (rowCallback) =>
          store.forEachRow(getLocalTableId(relationshipId), rowCallback),
        ),
      );

    const delRelationshipDefinition = (relationshipId: Id): Relationships => {
      mapSet(remoteTableIds, relationshipId);
      delDefinition(relationshipId);
      return relationships;
    };

    const getRemoteTableId = (relationshipId: Id): Id =>
      mapGet(remoteTableIds, relationshipId) as Id;

    const getRemoteRowId = (
      relationshipId: Id,
      localRowId: Id,
    ): Id | undefined =>
      mapGet((getRelationship(relationshipId) as IdMap<Id>[])?.[0], localRowId);

    const getLocalRowIds = (relationshipId: Id, remoteRowId: Id): Ids =>
      collValues(
        mapGet(
          (getRelationship(relationshipId) as IdMap<IdSet>[])?.[1],
          remoteRowId,
        ),
      );

    const getLinkedRowIds = (relationshipId: Id, firstRowId: Id): Ids =>
      isUndefined(getRelationship(relationshipId))
        ? [firstRowId]
        : collValues(getLinkedRowIdsCache(relationshipId, firstRowId, true));

    const addRemoteRowIdListener = (
      relationshipId: IdOrNull,
      localRowId: IdOrNull,
      listener: RemoteRowIdListener,
    ): Id =>
      addListener(listener, remoteRowIdListeners, [relationshipId, localRowId]);

    const addLocalRowIdsListener = (
      relationshipId: IdOrNull,
      remoteRowId: IdOrNull,
      listener: LocalRowIdsListener,
    ): Id =>
      addListener(listener, localRowIdsListeners, [
        relationshipId,
        remoteRowId,
      ]);

    const addLinkedRowIdsListener = (
      relationshipId: Id,
      firstRowId: Id,
      listener: LinkedRowIdsListener,
    ): Id => {
      getLinkedRowIdsCache(relationshipId, firstRowId);
      return addListener(listener, linkedRowIdsListeners, [
        relationshipId,
        firstRowId,
      ]);
    };

    const delListener = (listenerId: Id): Relationships => {
      delLinkedRowIdsCache(
        ...((delListenerImpl(listenerId) ?? []) as [Id, Id]),
      );
      return relationships;
    };

    const getListenerStats = (): RelationshipsListenerStats =>
      DEBUG
        ? {
            remoteRowId: collSize3(remoteRowIdListeners),
            localRowIds: collSize3(localRowIdsListeners),
            linkedRowIds: collSize3(linkedRowIdsListeners),
          }
        : {};

    const relationships: any = {
      setRelationshipDefinition,
      delRelationshipDefinition,

      getStore,
      getRelationshipIds,
      forEachRelationship,
      hasRelationship,
      getLocalTableId,
      getRemoteTableId,
      getRemoteRowId,
      getLocalRowIds,
      getLinkedRowIds,

      addRelationshipIdsListener,
      addRemoteRowIdListener,
      addLocalRowIdsListener,
      addLinkedRowIdsListener,
      delListener,

      destroy,
      getListenerStats,
    };

    return objFreeze(relationships as Relationships);
  },
) as typeof createRelationshipsDecl;
