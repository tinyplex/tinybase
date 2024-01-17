import {AddListener, CallListeners} from './listeners';
import {Cell, GetCell, Store} from '../types/store.d';
import {Id, Ids, SortKey} from '../types/common.d';
import {
  IdMap,
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from './map';
import {IdSet2, setAdd, setNew} from './set';
import {arrayForEach, arrayIsEmpty, arrayIsEqual} from './array';
import {
  collClear,
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collValues,
} from './coll';
import {ifNotUndefined, isArray, isString, isUndefined} from './other';
import {Checkpoints} from '../types/checkpoints';
import {EMPTY_STRING} from './strings';
import {Indexes} from '../types/indexes.d';
import {Metrics} from '../types/metrics.d';
import {Queries} from '../types/queries.d';
import {Relationships} from '../types/relationships.d';
import {Tools} from '../types/tools.d';

type OnChangedDecl<RowValue> = (
  change: () => void,
  changedRowValues: IdMap<[RowValue | undefined, RowValue | undefined]>,
  changedSortKeys: IdMap<SortKey>,
  rowValues: IdMap<RowValue>,
  sortKeys?: IdMap<SortKey>,
  force?: boolean,
) => void;

export const getDefinableFunctions = <Thing, RowValue>(
  store: Store,
  getDefaultThing: () => Thing,
  validateRowValue: (value: any) => RowValue,
  addListener: AddListener,
  callListeners: CallListeners,
): [
  getStore: () => Store,
  getThingIds: () => Ids,
  forEachThing: (cb: (id: Id, value: Thing) => void) => void,
  hasThing: (id: Id) => boolean,
  getTableId: (id: Id) => Id,
  getThing: (id: Id) => Thing | undefined,
  setThing: (id: Id, thing?: Thing) => boolean | Map<string, Thing>,
  setDefinition: (id: Id, tableId: Id) => void,
  setDefinitionAndListen: (
    id: Id,
    tableId: Id,
    onChanged: OnChangedDecl<RowValue>,
    getRowValue: (getCell: GetCell, rowId: Id) => RowValue,
    getSortKey?: (getCell: GetCell, rowId: Id) => SortKey,
  ) => void,
  delDefinition: (id: Id) => void,
  addThingIdsListener: (listener: () => void) => void,
  destroy: () => void,
  addStoreListeners: (id: Id, andCall: 0 | 1, ...listenerIds: Ids) => Ids,
  delStoreListeners: (id: Id, ...listenerIds: Ids) => void,
] => {
  const hasRow = store.hasRow;
  const tableIds: IdMap<Id> = mapNew();
  const things: IdMap<Thing> = mapNew();
  const thingIdListeners: IdSet2 = mapNew();
  const allRowValues: IdMap2<RowValue> = mapNew();
  const allSortKeys: IdMap2<SortKey> = mapNew();
  const storeListenerIds: IdSet2 = mapNew();

  const getStore = (): Store => store;

  const getThingIds = (): Ids => mapKeys(tableIds);

  const forEachThing = (cb: (id: Id, value: Thing) => void): void =>
    mapForEach(things, cb);

  const hasThing = (id: Id): boolean => collHas(things, id);

  const getTableId = (id: Id): Id => mapGet(tableIds, id) as Id;

  const getThing = (id: Id): Thing | undefined => mapGet(things, id);

  const setThing = (id: Id, thing: Thing | undefined): IdMap<Thing> =>
    mapSet(things, id, thing) as IdMap<Thing>;

  const addStoreListeners = (
    id: Id,
    andCall: 0 | 1,
    ...listenerIds: Ids
  ): Ids => {
    const set = mapEnsure(storeListenerIds, id, setNew);
    arrayForEach(
      listenerIds,
      (listenerId) =>
        setAdd(set, listenerId) && andCall && store.callListener(listenerId),
    );
    return listenerIds;
  };

  const delStoreListeners = (id: Id, ...listenerIds: Ids): void =>
    ifNotUndefined(mapGet(storeListenerIds, id), (allListenerIds) => {
      arrayForEach(
        arrayIsEmpty(listenerIds) ? collValues(allListenerIds) : listenerIds,
        (listenerId: Id) => {
          store.delListener(listenerId);
          collDel(allListenerIds, listenerId);
        },
      );
      if (collIsEmpty(allListenerIds)) {
        mapSet(storeListenerIds, id);
      }
    });

  const setDefinition = (id: Id, tableId: Id): void => {
    mapSet(tableIds, id, tableId);
    if (!collHas(things, id)) {
      mapSet(things, id, getDefaultThing());
      mapSet(allRowValues, id, mapNew());
      mapSet(allSortKeys, id, mapNew());
      callListeners(thingIdListeners);
    }
  };

  const setDefinitionAndListen = (
    id: Id,
    tableId: Id,
    onChanged: OnChangedDecl<RowValue>,
    getRowValue: (getCell: GetCell, rowId: Id) => RowValue,
    getSortKey?: (getCell: GetCell, rowId: Id) => SortKey,
  ): void => {
    setDefinition(id, tableId);
    const changedRowValues: IdMap<
      [RowValue | undefined, RowValue | undefined]
    > = mapNew();
    const changedSortKeys: IdMap<SortKey> = mapNew();
    const rowValues = mapGet(allRowValues, id);
    const sortKeys = mapGet(allSortKeys, id);

    const processRow = (rowId: Id) => {
      const getCell = (cellId: Id): Cell | undefined =>
        store.getCell(tableId, rowId, cellId);
      const oldRowValue = mapGet(rowValues, rowId);
      const newRowValue = hasRow(tableId, rowId)
        ? validateRowValue(getRowValue(getCell as any, rowId))
        : undefined;
      if (
        !(
          oldRowValue === newRowValue ||
          (isArray(oldRowValue) &&
            isArray(newRowValue) &&
            arrayIsEqual(oldRowValue, newRowValue))
        )
      ) {
        mapSet(changedRowValues, rowId, [oldRowValue, newRowValue]);
      }

      if (!isUndefined(getSortKey)) {
        const oldSortKey = mapGet(sortKeys, rowId);
        const newSortKey = hasRow(tableId, rowId)
          ? getSortKey(getCell as any, rowId)
          : undefined;
        if (oldSortKey != newSortKey) {
          mapSet(changedSortKeys, rowId, newSortKey);
        }
      }
    };

    const processTable = (force?: boolean) => {
      onChanged(
        () => {
          collForEach(changedRowValues, ([, newRowValue], rowId) =>
            mapSet(rowValues, rowId, newRowValue),
          );
          collForEach(changedSortKeys, (newSortKey, rowId) =>
            mapSet(sortKeys, rowId, newSortKey),
          );
        },
        changedRowValues,
        changedSortKeys,
        rowValues as IdMap<RowValue>,
        sortKeys,
        force,
      );
      collClear(changedRowValues);
      collClear(changedSortKeys);
    };

    mapForEach(rowValues, processRow);
    if (store.hasTable(tableId)) {
      arrayForEach(store.getRowIds(tableId), (rowId) => {
        if (!collHas(rowValues, rowId)) {
          processRow(rowId);
        }
      });
    }
    processTable(true);

    delStoreListeners(id);
    addStoreListeners(
      id,
      0,
      store.addRowListener(tableId, null, (_store, _tableId, rowId) =>
        processRow(rowId),
      ),
      store.addTableListener(tableId, () => processTable()),
    );
  };

  const delDefinition = (id: Id): void => {
    mapSet(tableIds, id);
    mapSet(things, id);
    mapSet(allRowValues, id);
    mapSet(allSortKeys, id);
    delStoreListeners(id);
    callListeners(thingIdListeners);
  };

  const addThingIdsListener = (listener: () => void) =>
    addListener(listener, thingIdListeners);

  const destroy = (): void => mapForEach(storeListenerIds, delDefinition);

  return [
    getStore,
    getThingIds,
    forEachThing,
    hasThing,
    getTableId,
    getThing,
    setThing,
    setDefinition,
    setDefinitionAndListen,
    delDefinition,
    addThingIdsListener,
    destroy,
    addStoreListeners,
    delStoreListeners,
  ];
};

export const getRowCellFunction = <RowValue>(
  getRowCell: Id | ((getCell: GetCell, rowId: Id) => RowValue) | undefined,
  defaultCellValue?: RowValue,
): ((getCell: GetCell, rowId: Id) => RowValue) =>
  isString(getRowCell)
    ? (getCell: GetCell): RowValue => getCell(getRowCell) as any as RowValue
    : getRowCell ??
      ((): RowValue => defaultCellValue ?? (EMPTY_STRING as any as RowValue));

export const getCreateFunction = <
  Thing extends
    | Metrics
    | Indexes
    | Relationships
    | Checkpoints
    | Queries
    | Tools,
>(
  getFunction: (store: Store) => Thing,
  initFunction?: (thing: Thing) => void,
): ((store: Store) => Thing) => {
  const thingsByStore: WeakMap<Store, Thing> = new WeakMap();
  return (store: Store): Thing => {
    if (!thingsByStore.has(store)) {
      thingsByStore.set(store, getFunction(store));
    }
    const thing = thingsByStore.get(store) as Thing;
    initFunction?.(thing);
    return thing;
  };
};
