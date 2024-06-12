import {EMPTY_STRING, id} from '../common/strings.ts';
import type {GetCell, Store} from '../@types/store/index.d.ts';
import type {Id, IdOrNull, Ids, SortKey} from '../@types/common/index.d.ts';
import {
  IdMap,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from '../common/map.ts';
import {IdSet, IdSet2, IdSet3, setAdd, setNew} from '../common/set.ts';
import type {
  IndexCallback,
  Indexes,
  IndexesListenerStats,
  SliceCallback,
  SliceIdsListener,
  SliceRowIdsListener,
  createIndexes as createIndexesDecl,
} from '../@types/indexes/index.d.ts';
import {arrayIsSorted, arrayMap, arraySort} from '../common/array.ts';
import {
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collSize2,
  collSize3,
  collValues,
} from '../common/coll.ts';
import {
  getCreateFunction,
  getDefinableFunctions,
  getRowCellFunction,
} from '../common/definable.ts';
import {ifNotUndefined, isArray, isUndefined} from '../common/other.ts';
import {defaultSorter} from '../common/index.ts';
import {getListenerFunctions} from '../common/listeners.ts';
import {objFreeze} from '../common/obj.ts';

export const createIndexes = getCreateFunction((store: Store): Indexes => {
  const sliceIdsListeners: IdSet2 = mapNew();
  const sliceRowIdsListeners: IdSet3 = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => indexes,
  );
  const [
    getStore,
    getIndexIds,
    forEachIndexImpl,
    hasIndex,
    getTableId,
    getIndex,
    setIndex,
    ,
    setDefinitionAndListen,
    delDefinition,
    addIndexIdsListener,
    destroy,
  ] = getDefinableFunctions<IdSet2, Id | Ids>(
    store,
    mapNew,
    (value): Id | Ids =>
      isUndefined(value)
        ? EMPTY_STRING
        : isArray(value)
          ? arrayMap(value, id)
          : id(value),
    addListener,
    callListeners,
  );

  const hasSlice = (indexId: Id, sliceId: Id): boolean =>
    collHas(getIndex(indexId), sliceId);

  const setIndexDefinition = (
    indexId: Id,
    tableId: Id,
    getSliceIdOrIds?: Id | ((getCell: GetCell, rowId: Id) => Id | Ids),
    getSortKey?: Id | ((getCell: GetCell, rowId: Id) => SortKey),
    sliceIdSorter?: (sliceId1: Id, sliceId2: Id) => number,
    rowIdSorter: (
      sortKey1: SortKey,
      sortKey2: SortKey,
      sliceId: Id,
    ) => number = defaultSorter,
  ): Indexes => {
    const sliceIdArraySorter = isUndefined(sliceIdSorter)
      ? undefined
      : ([id1]: [Id, IdSet], [id2]: [Id, IdSet]): number =>
          (sliceIdSorter as (sliceId1: Id, sliceId2: Id) => number)(id1, id2);

    setDefinitionAndListen(
      indexId,
      tableId,
      (
        change: () => void,
        changedSliceIds: IdMap<[Id | Ids | undefined, Id | Ids | undefined]>,
        changedSortKeys: IdMap<SortKey>,
        sliceIds?: IdMap<Id | Ids>,
        sortKeys?: IdMap<SortKey>,
        force?: boolean,
      ) => {
        let sliceIdsChanged = 0;
        const changedSlices: IdSet = setNew();
        const unsortedSlices: IdSet = setNew();
        const index = getIndex(indexId);
        collForEach(
          changedSliceIds,
          ([oldSliceIdOrIds, newSliceIdOrIds], rowId) => {
            const oldSliceIds = setNew(oldSliceIdOrIds);
            const newSliceIds = setNew(newSliceIdOrIds);
            collForEach(oldSliceIds, (oldSliceId) =>
              collDel(newSliceIds, oldSliceId)
                ? collDel(oldSliceIds, oldSliceId)
                : 0,
            );

            collForEach(oldSliceIds, (oldSliceId) => {
              setAdd(changedSlices, oldSliceId);
              ifNotUndefined(mapGet(index, oldSliceId), (oldSlice) => {
                collDel(oldSlice, rowId);
                if (collIsEmpty(oldSlice)) {
                  mapSet(index, oldSliceId);
                  sliceIdsChanged = 1;
                }
              });
            });

            collForEach(newSliceIds, (newSliceId) => {
              setAdd(changedSlices, newSliceId);
              if (!collHas(index, newSliceId)) {
                mapSet(index, newSliceId, setNew());
                sliceIdsChanged = 1;
              }
              setAdd(mapGet(index, newSliceId), rowId);
              if (!isUndefined(getSortKey)) {
                setAdd(unsortedSlices, newSliceId);
              }
            });
          },
        );

        change();

        if (!collIsEmpty(sortKeys)) {
          if (force) {
            mapForEach(index, (sliceId) => setAdd(unsortedSlices, sliceId));
          } else {
            mapForEach(changedSortKeys, (rowId) =>
              ifNotUndefined(mapGet(sliceIds, rowId), (sliceId) =>
                setAdd(unsortedSlices, sliceId),
              ),
            );
          }
          collForEach(unsortedSlices, (sliceId) => {
            const rowIdArraySorter = (rowId1: Id, rowId2: Id): number =>
              (
                rowIdSorter as (
                  sortKey1: SortKey,
                  sortKey2: SortKey,
                  sliceId: Id,
                ) => number
              )(
                mapGet(sortKeys, rowId1) as SortKey,
                mapGet(sortKeys, rowId2) as SortKey,
                sliceId,
              );
            const sliceArray = [...(mapGet(index, sliceId) as IdSet)];
            if (!arrayIsSorted(sliceArray, rowIdArraySorter)) {
              mapSet(
                index,
                sliceId,
                setNew(arraySort(sliceArray, rowIdArraySorter)),
              );
              setAdd(changedSlices, sliceId);
            }
          });
        }

        if (sliceIdsChanged || force) {
          if (!isUndefined(sliceIdArraySorter)) {
            const indexArray = [...(index as IdMap<IdSet>)];
            if (!arrayIsSorted(indexArray, sliceIdArraySorter)) {
              setIndex(
                indexId,
                mapNew(arraySort(indexArray, sliceIdArraySorter)),
              );
              sliceIdsChanged = 1;
            }
          }
        }

        if (sliceIdsChanged) {
          callListeners(sliceIdsListeners, [indexId]);
        }
        collForEach(changedSlices, (sliceId) =>
          callListeners(sliceRowIdsListeners, [indexId, sliceId]),
        );
      },
      getRowCellFunction(getSliceIdOrIds),
      ifNotUndefined(getSortKey, getRowCellFunction),
    );
    return indexes;
  };

  const forEachIndex = (indexCallback: IndexCallback) =>
    forEachIndexImpl((indexId, slices) =>
      indexCallback(indexId, (sliceCallback) =>
        forEachSliceImpl(indexId, sliceCallback, slices),
      ),
    );

  const forEachSlice = (indexId: Id, sliceCallback: SliceCallback) =>
    forEachSliceImpl(indexId, sliceCallback, getIndex(indexId) as IdSet2);

  const forEachSliceImpl = (
    indexId: Id,
    sliceCallback: SliceCallback,
    slices: IdSet2,
  ) => {
    const tableId = getTableId(indexId);
    collForEach(slices, (rowIds, sliceId) =>
      sliceCallback(sliceId, (rowCallback) =>
        collForEach(rowIds, (rowId) =>
          rowCallback(rowId, (cellCallback) =>
            store.forEachCell(tableId, rowId, cellCallback),
          ),
        ),
      ),
    );
  };

  const delIndexDefinition = (indexId: Id): Indexes => {
    delDefinition(indexId);
    return indexes;
  };

  const getSliceIds = (indexId: Id): Ids => mapKeys(getIndex(indexId));

  const getSliceRowIds = (indexId: Id, sliceId: Id): Ids =>
    collValues(mapGet(getIndex(indexId), sliceId));

  const addSliceIdsListener = (
    indexId: IdOrNull,
    listener: SliceIdsListener,
  ): Id => addListener(listener, sliceIdsListeners, [indexId]);

  const addSliceRowIdsListener = (
    indexId: IdOrNull,
    sliceId: IdOrNull,
    listener: SliceRowIdsListener,
  ): Id => addListener(listener, sliceRowIdsListeners, [indexId, sliceId]);

  const delListener = (listenerId: Id): Indexes => {
    delListenerImpl(listenerId);
    return indexes;
  };

  const getListenerStats = (): IndexesListenerStats => ({
    sliceIds: collSize2(sliceIdsListeners),
    sliceRowIds: collSize3(sliceRowIdsListeners),
  });

  const indexes: any = {
    setIndexDefinition,
    delIndexDefinition,

    getStore,
    getIndexIds,
    forEachIndex,
    forEachSlice,
    hasIndex,
    hasSlice,
    getTableId,
    getSliceIds,
    getSliceRowIds,

    addIndexIdsListener,
    addSliceIdsListener,
    addSliceRowIdsListener,
    delListener,

    destroy,
    getListenerStats,
  };

  return objFreeze(indexes as Indexes);
}) as typeof createIndexesDecl;
