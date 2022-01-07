import {Cell, GetCell, Store} from '../store.d';
import {Id, Ids, SortKey} from '../common.d';
import {IdMap, mapForEach, mapGet, mapKeys, mapNew, mapSet} from './map';
import {IdSet2, setNew} from './set';
import {collClear, collForEach, collHas} from './coll';
import {ifNotUndefined, isString, isUndefined} from './other';
import {EMPTY_STRING} from './strings';
import {Indexes} from '../indexes.d';
import {Metrics} from '../metrics.d';
import {arrayForEach} from './array';

type DeepMap1<Value> = IdMap<IdMap<Value>>;

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
): [
  () => Store,
  () => Ids,
  (id: Id) => Id,
  (id: Id) => Thing | undefined,
  (id: Id, thing?: Thing) => boolean | Map<string, Thing>,
  (
    id: Id,
    tableId: Id,
    onChanged: OnChangedDecl<RowValue>,
    getRowValue: (getCell: GetCell, rowId: Id) => RowValue,
    getSortKey?: (getCell: GetCell, rowId: Id) => SortKey,
  ) => void,
  (id: Id) => void,
  () => void,
] => {
  const hasRow = store.hasRow;
  const tableIds: IdMap<Id> = mapNew();
  const things: IdMap<Thing> = mapNew();
  const allRowValues: DeepMap1<RowValue> = mapNew();
  const allSortKeys: DeepMap1<SortKey> = mapNew();
  const storeListenerIds: IdSet2 = mapNew();

  const getStore = (): Store => store;

  const getThingIds = (): Ids => mapKeys(tableIds);

  const getTableId = (id: Id): Id => mapGet(tableIds, id) as Id;

  const getThing = (id: Id): Thing | undefined => mapGet(things, id);

  const setThing = (id: Id, thing: Thing | undefined): IdMap<Thing> =>
    mapSet(things, id, thing) as IdMap<Thing>;

  const removeStoreListeners = (id: Id) =>
    ifNotUndefined(mapGet(storeListenerIds, id), (listenerIds) => {
      collForEach(listenerIds, store.delListener);
      mapSet(storeListenerIds, id);
    });

  const setDefinition = (
    id: Id,
    tableId: Id,
    onChanged: OnChangedDecl<RowValue>,
    getRowValue: (getCell: GetCell, rowId: Id) => RowValue,
    getSortKey?: (getCell: GetCell, rowId: Id) => SortKey,
  ): void => {
    const changedRowValues: IdMap<
      [RowValue | undefined, RowValue | undefined]
    > = mapNew();
    const changedSortKeys: IdMap<SortKey> = mapNew();

    mapSet(tableIds, id, tableId);

    if (!collHas(things, id)) {
      mapSet(things, id, getDefaultThing());
      mapSet(allRowValues, id, mapNew());
      mapSet(allSortKeys, id, mapNew());
    }
    const rowValues = mapGet(allRowValues, id);
    const sortKeys = mapGet(allSortKeys, id);

    const processRow = (rowId: Id) => {
      const getCell = (cellId: Id): Cell | undefined =>
        store.getCell(tableId, rowId, cellId);
      const oldRowValue = mapGet(rowValues, rowId);
      const newRowValue = hasRow(tableId, rowId)
        ? validateRowValue(getRowValue(getCell, rowId))
        : undefined;
      if (oldRowValue != newRowValue) {
        mapSet(changedRowValues, rowId, [oldRowValue, newRowValue]);
      }

      if (!isUndefined(getSortKey)) {
        const oldSortKey = mapGet(sortKeys, rowId);
        const newSortKey = hasRow(tableId, rowId)
          ? getSortKey(getCell, rowId)
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

    removeStoreListeners(id);
    mapSet(
      storeListenerIds,
      id,
      setNew([
        store.addRowListener(tableId, null, (_store, _tableId, rowId) =>
          processRow(rowId),
        ),
        store.addTableListener(tableId, () => processTable()),
      ]),
    );
  };

  const delDefinition = (id: Id): void => {
    mapSet(tableIds, id);
    mapSet(things, id);
    mapSet(allRowValues, id);
    mapSet(allSortKeys, id);
    removeStoreListeners(id);
  };

  const destroy = (): void => mapForEach(storeListenerIds, delDefinition);

  return [
    getStore,
    getThingIds,
    getTableId,
    getThing,
    setThing,
    setDefinition,
    delDefinition,
    destroy,
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

export const getCreateFunction = <Things extends Metrics | Indexes>(
  getFunction: (store: Store) => Things,
): ((store: Store) => Things) => {
  const getFunctionsByStore: WeakMap<Store, Things> = new WeakMap();
  return (store: Store): Things => {
    if (!getFunctionsByStore.has(store)) {
      getFunctionsByStore.set(store, getFunction(store));
    }
    return getFunctionsByStore.get(store) as Things;
  };
};
