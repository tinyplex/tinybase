import {DEBUG, ifNotUndefined, isUndefined} from './common/other';
import {GetCell, Store} from './store.d';
import {Id, IdOrNull, Ids, SortKey} from './common.d';
import {IdMap, mapForEach, mapGet, mapKeys, mapNew, mapSet} from './common/map';
import {IdSet, IdSet2, IdSet3, setAdd, setNew} from './common/set';
import {
  IndexCallback,
  Indexes,
  IndexesListenerStats,
  SliceCallback,
  SliceIdsListener,
  SliceRowIdsListener,
  createIndexes as createIndexesDecl,
} from './indexes.d';
import {arrayIsSorted, arraySort} from './common/array';
import {
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collSize2,
  collSize3,
  collValues,
} from './common/coll';
import {
  getCreateFunction,
  getDefinableFunctions,
  getRowCellFunction,
} from './common/definable';
import {EMPTY_STRING} from './common/strings';
import {defaultSorter} from './common';
import {getListenerFunctions} from './common/listeners';
import {objFreeze} from './common/obj';

export const createIndexes: typeof createIndexesDecl = getCreateFunction(
  (store: Store): Indexes => {
    const sliceIdsListeners: IdSet2 = mapNew();
    const sliceRowIdsListeners: IdSet3 = mapNew();
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
      destroy,
    ] = getDefinableFunctions<IdSet2, Id>(
      store,
      mapNew,
      (value): Id => (isUndefined(value) ? EMPTY_STRING : value + EMPTY_STRING),
    );
    const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
      () => indexes,
    );

    const hasSlice = (indexId: Id, sliceId: Id): boolean =>
      collHas(getIndex(indexId), sliceId);

    const setIndexDefinition = (
      indexId: Id,
      tableId: Id,
      getSliceId?: Id | ((getCell: GetCell, rowId: Id) => Id),
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
          changedSliceIds: IdMap<[Id | undefined, Id | undefined]>,
          changedSortKeys: IdMap<SortKey>,
          sliceIds?: IdMap<Id>,
          sortKeys?: IdMap<SortKey>,
          force?: boolean,
        ) => {
          let sliceIdsChanged = 0;
          const changedSlices: IdSet = setNew();
          const unsortedSlices: IdSet = setNew();
          const index = getIndex(indexId);

          collForEach(changedSliceIds, ([oldSliceId, newSliceId], rowId) => {
            if (!isUndefined(oldSliceId)) {
              setAdd(changedSlices, oldSliceId);
              ifNotUndefined(mapGet(index, oldSliceId), (oldSlice) => {
                collDel(oldSlice, rowId);
                if (collIsEmpty(oldSlice)) {
                  mapSet(index, oldSliceId);
                  sliceIdsChanged = 1;
                }
              });
            }

            if (!isUndefined(newSliceId)) {
              setAdd(changedSlices, newSliceId);
              if (!collHas(index, newSliceId)) {
                mapSet(index, newSliceId, setNew());
                sliceIdsChanged = 1;
              }
              setAdd(mapGet(index, newSliceId), rowId);
              if (!isUndefined(getSortKey)) {
                setAdd(unsortedSlices, newSliceId);
              }
            }
          });

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
        getRowCellFunction(getSliceId),
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

    const getListenerStats = (): IndexesListenerStats =>
      DEBUG
        ? {
            sliceIds: collSize2(sliceIdsListeners),
            sliceRowIds: collSize3(sliceRowIdsListeners),
          }
        : {};

    const indexes: Indexes = {
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

      addSliceIdsListener,
      addSliceRowIdsListener,
      delListener,

      destroy,
      getListenerStats,
    };

    return objFreeze(indexes);
  },
);
