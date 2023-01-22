import {
  ADD,
  CELL,
  CELL_IDS,
  DEFAULT,
  EMPTY_OBJECT,
  LISTENER,
  NUMBER,
  ROW,
  ROW_IDS,
  TABLE,
  TABLES,
  TABLE_IDS,
  TYPE,
  VALUE,
  VALUES,
  VALUE_IDS,
  id,
} from './common/strings';
import {
  Cell,
  CellCallback,
  CellChange,
  CellOrUndefined,
  CellSchema,
  DoRollback,
  GetCellChange,
  GetValueChange,
  MapCell,
  Row,
  RowCallback,
  SortedRowIdsListener,
  Store,
  StoreListenerStats,
  Table,
  TableCallback,
  Tables,
  TablesSchema,
  TransactionListener,
  Value,
  ValueCallback,
  ValueChange,
  ValueOrUndefined,
  ValueSchema,
  Values,
  ValuesSchema,
  createStore as createStoreDecl,
} from './store.d';
import {
  DEBUG,
  ifNotUndefined,
  isFunction,
  isTypeStringOrBoolean,
  isUndefined,
  jsonParse,
  jsonString,
} from './common/other';
import {
  ExtraArgsGetter,
  IdSetNode,
  PathGetters,
  getListenerFunctions,
} from './common/listeners';
import {Id, Ids, Json} from './common.d';
import {
  IdMap,
  IdMap2,
  IdMap3,
  mapClone,
  mapClone2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapMap,
  mapNew,
  mapSet,
  mapToObj,
} from './common/map';
import {
  IdObj,
  IdObj2,
  isObject,
  objDel,
  objFreeze,
  objFrozen,
  objHas,
  objIds,
  objIsEmpty,
  objMap,
} from './common/obj';
import {IdSet, IdSet2, IdSet3, IdSet4, setAdd, setNew} from './common/set';
import {Pair, pairCollSize2, pairNew, pairNewMap} from './common/pairs';
import {
  arrayFilter,
  arrayForEach,
  arrayHas,
  arrayIsEqual,
  arrayMap,
  arrayPush,
  arraySlice,
  arraySort,
} from './common/array';
import {
  collClear,
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collSize3,
  collSize4,
} from './common/coll';
import {getCellType, setOrDelCell, setOrDelValue} from './common/cell';
import {defaultSorter} from './common';
import {getPoolFunctions} from './common/pool';

type TablesSchemaMap = IdMap2<CellSchema>;
type ValuesSchemaMap = IdMap<ValueSchema>;
type RowMap = IdMap<Cell>;
type TableMap = IdMap<RowMap>;
type TablesMap = IdMap<TableMap>;
type ValuesMap = IdMap<Value>;
type IdAdded = 1 | -1;
type ChangedIdsMap = IdMap<IdAdded>;
type ChangedIdsMap2 = IdMap2<IdAdded>;
type ChangedIdsMap3 = IdMap3<IdAdded>;

const transformMap = <MapValue, ObjectValue>(
  map: IdMap<MapValue>,
  toBeLikeObject: IdObj<ObjectValue>,
  setId: (map: IdMap<MapValue>, id: Id, cell: any) => void,
  delId: (map: IdMap<MapValue>, id: Id) => void = mapSet,
): IdMap<MapValue> => {
  const idsToDelete = arrayFilter(
    mapKeys(map),
    (id) => !objHas(toBeLikeObject, id),
  );
  arrayForEach(objIds(toBeLikeObject), (id) =>
    setId(map, id, toBeLikeObject[id]),
  );
  arrayForEach(idsToDelete, (id) => delId(map, id));
  return map;
};

const validate = (
  obj: IdObj<any> | undefined,
  validateChild: (child: any, id: Id) => boolean,
  onInvalidObj?: () => void,
): boolean => {
  if (isUndefined(obj) || !isObject(obj) || objIsEmpty(obj) || objFrozen(obj)) {
    onInvalidObj?.();
    return false;
  }
  objMap(obj, (child, id) => {
    if (!validateChild(child, id)) {
      objDel(obj, id);
    }
  });
  return !objIsEmpty(obj);
};

const idsChanged = (
  changedIds: ChangedIdsMap,
  id: Id,
  added: IdAdded,
): ChangedIdsMap =>
  mapSet(
    changedIds,
    id,
    mapGet(changedIds, id) == -added ? undefined : added,
  ) as ChangedIdsMap;

export const createStore: typeof createStoreDecl = (): Store => {
  let hasTablesSchema: boolean;
  let hasValuesSchema: boolean;
  let cellsTouched: boolean;
  let valuesTouched: boolean;
  let transactions = 0;
  const changedTableIds: ChangedIdsMap = mapNew();
  const changedRowIds: ChangedIdsMap2 = mapNew();
  const changedCellIds: ChangedIdsMap3 = mapNew();
  const changedCells: IdMap3<[CellOrUndefined, CellOrUndefined]> = mapNew();
  const changedValueIds: ChangedIdsMap = mapNew();
  const changedValues: IdMap<[CellOrUndefined, CellOrUndefined]> = mapNew();
  const invalidCells: IdMap3<any[]> = mapNew();
  const invalidValues: IdMap<any[]> = mapNew();
  const tablesSchemaMap: TablesSchemaMap = mapNew();
  const tablesSchemaRowCache: IdMap<[RowMap, IdSet]> = mapNew();
  const valuesSchemaMap: ValuesSchemaMap = mapNew();
  const valuesDefaulted: ValuesMap = mapNew();
  const valuesNonDefaulted: IdSet = setNew();
  const tablePoolFunctions: IdMap<[() => Id, (id: Id) => void]> = mapNew();
  const tablesMap: TablesMap = mapNew();
  const valuesMap: ValuesMap = mapNew();
  const tablesListeners: Pair<IdSet2> = pairNewMap();
  const tableIdsListeners: Pair<IdSet2> = pairNewMap();
  const tableListeners: Pair<IdSet2> = pairNewMap();
  const rowIdsListeners: Pair<IdSet2> = pairNewMap();
  const sortedRowIdsListeners: Pair<IdSet3> = pairNewMap();
  const rowListeners: Pair<IdSet3> = pairNewMap();
  const cellIdsListeners: Pair<IdSet3> = pairNewMap();
  const cellListeners: Pair<IdSet4> = pairNewMap();
  const invalidCellListeners: Pair<IdSet4> = pairNewMap();
  const invalidValueListeners: Pair<IdSet2> = pairNewMap();
  const valuesListeners: Pair<IdSet2> = pairNewMap();
  const valueIdsListeners: Pair<IdSet2> = pairNewMap();
  const valueListeners: Pair<IdSet2> = pairNewMap();
  const finishTransactionListeners: Pair<IdSet2> = pairNewMap();

  const [addListener, callListeners, delListenerImpl, callListenerImpl] =
    getListenerFunctions(() => store);

  const validateTablesSchema = (
    tableSchema: TablesSchema | undefined,
  ): boolean =>
    validate(tableSchema, (tableSchema) =>
      validate(tableSchema, validateCellOrValueSchema),
    );

  const validateValuesSchema = (
    valuesSchema: ValuesSchema | undefined,
  ): boolean => validate(valuesSchema, validateCellOrValueSchema);

  const validateCellOrValueSchema = (schema: CellSchema | ValueSchema) => {
    if (!validate(schema, (_child, id: Id) => arrayHas([TYPE, DEFAULT], id))) {
      return false;
    }
    const type = schema[TYPE];
    if (!isTypeStringOrBoolean(type) && type != NUMBER) {
      return false;
    }
    if (getCellType(schema[DEFAULT]) != type) {
      objDel(schema, DEFAULT);
    }
    return true;
  };

  const validateTables = (tables: Tables): boolean =>
    validate(tables, validateTable, cellInvalid);

  const validateTable = (table: Table, tableId: Id): boolean =>
    (!hasTablesSchema ||
      collHas(tablesSchemaMap, tableId) ||
      (cellInvalid(tableId) as boolean)) &&
    validate(
      table,
      (row: Row, rowId: Id): boolean => validateRow(tableId, rowId, row),
      () => cellInvalid(tableId),
    );

  const validateRow = (
    tableId: Id,
    rowId: Id | undefined,
    row: Row,
    skipDefaults?: 1,
  ): boolean =>
    validate(
      skipDefaults ? row : addDefaultsToRow(row, tableId, rowId),
      (cell: Cell, cellId: Id): boolean =>
        ifNotUndefined(
          getValidatedCell(tableId, rowId, cellId, cell),
          (validCell) => {
            row[cellId] = validCell;
            return true;
          },
          () => false,
        ) as boolean,
      () => cellInvalid(tableId, rowId),
    );

  const getValidatedCell = (
    tableId: Id,
    rowId: Id | undefined,
    cellId: Id,
    cell: Cell,
  ): CellOrUndefined =>
    hasTablesSchema
      ? ifNotUndefined(
          mapGet(mapGet(tablesSchemaMap, tableId), cellId),
          (cellSchema) =>
            getCellType(cell) != cellSchema[TYPE]
              ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT])
              : cell,
          () => cellInvalid(tableId, rowId, cellId, cell),
        )
      : isUndefined(getCellType(cell))
      ? cellInvalid(tableId, rowId, cellId, cell)
      : cell;

  const validateValues = (values: Values, skipDefaults?: 1): boolean =>
    validate(
      skipDefaults ? values : addDefaultsToValues(values),
      (value: Value, valueId: Id): boolean =>
        ifNotUndefined(
          getValidatedValue(valueId, value),
          (validValue) => {
            values[valueId] = validValue;
            return true;
          },
          () => false,
        ) as boolean,
      () => valueInvalid(),
    );

  const getValidatedValue = (valueId: Id, value: Value): ValueOrUndefined =>
    hasValuesSchema
      ? ifNotUndefined(
          mapGet(valuesSchemaMap, valueId),
          (valueSchema) =>
            getCellType(value) != valueSchema[TYPE]
              ? valueInvalid(valueId, value, valueSchema[DEFAULT])
              : value,
          () => valueInvalid(valueId, value),
        )
      : isUndefined(getCellType(value))
      ? valueInvalid(valueId, value)
      : value;

  const addDefaultsToRow = (row: Row, tableId: Id, rowId?: Id): Row => {
    ifNotUndefined(
      mapGet(tablesSchemaRowCache, tableId),
      ([rowDefaulted, rowNonDefaulted]) => {
        collForEach(rowDefaulted, (cell, cellId) => {
          if (!objHas(row, cellId)) {
            row[cellId] = cell;
          }
        });
        collForEach(rowNonDefaulted, (cellId) => {
          if (!objHas(row, cellId)) {
            cellInvalid(tableId, rowId, cellId);
          }
        });
      },
    );
    return row;
  };

  const addDefaultsToValues = (values: Values): Values => {
    if (hasValuesSchema) {
      collForEach(valuesDefaulted, (value, valueId) => {
        if (!objHas(values, valueId)) {
          values[valueId] = value;
        }
      });
      collForEach(valuesNonDefaulted, (valueId) => {
        if (!objHas(values, valueId)) {
          valueInvalid(valueId);
        }
      });
    }
    return values;
  };

  const setValidTablesSchema = (tablesSchema: TablesSchema): TablesSchemaMap =>
    transformMap(
      tablesSchemaMap,
      tablesSchema,
      (_tablesSchema, tableId, tableSchema) => {
        const rowDefaulted = mapNew();
        const rowNonDefaulted = setNew();
        transformMap(
          mapEnsure<Id, IdMap<CellSchema>>(tablesSchemaMap, tableId, mapNew),
          tableSchema,
          (tableSchemaMap, cellId, cellSchema) => {
            mapSet(tableSchemaMap, cellId, cellSchema);
            ifNotUndefined(
              cellSchema[DEFAULT],
              (def) => mapSet(rowDefaulted, cellId, def),
              () => setAdd(rowNonDefaulted, cellId) as any,
            );
          },
        );
        mapSet(tablesSchemaRowCache, tableId, [rowDefaulted, rowNonDefaulted]);
      },
      (_tablesSchema, tableId) => {
        mapSet(tablesSchemaMap, tableId);
        mapSet(tablesSchemaRowCache, tableId);
      },
    );

  const setValidValuesSchema = (valuesSchema: ValuesSchema): ValuesSchemaMap =>
    transformMap(
      valuesSchemaMap,
      valuesSchema,
      (_valuesSchema, valueId, valueSchema) => {
        mapSet(valuesSchemaMap, valueId, valueSchema);
        ifNotUndefined(
          valueSchema[DEFAULT],
          (def) => mapSet(valuesDefaulted, valueId, def),
          () => setAdd(valuesNonDefaulted, valueId) as any,
        );
      },
      (_valuesSchema, valueId) => {
        mapSet(valuesSchemaMap, valueId);
        mapSet(valuesDefaulted, valueId);
        collDel(valuesNonDefaulted, valueId);
      },
    );

  const setValidTables = (tables: Tables): TablesMap =>
    transformMap(
      tablesMap,
      tables,
      (_tables, tableId, table) => setValidTable(tableId, table),
      (_tables, tableId) => delValidTable(tableId),
    );

  const setValidTable = (tableId: Id, table: Table): TableMap =>
    transformMap(
      mapEnsure(tablesMap, tableId, () => {
        tableIdsChanged(tableId, 1);
        return mapNew();
      }),
      table,
      (tableMap, rowId, row) => setValidRow(tableId, tableMap, rowId, row),
      (tableMap, rowId) => delValidRow(tableId, tableMap, rowId),
    );

  const setValidRow = (
    tableId: Id,
    tableMap: TableMap,
    rowId: Id,
    row: Row,
    forceDel?: boolean,
  ): RowMap =>
    transformMap(
      mapEnsure(tableMap, rowId, () => {
        rowIdsChanged(tableId, rowId, 1);
        return mapNew();
      }),
      row,
      (rowMap, cellId, cell) =>
        setValidCell(tableId, rowId, rowMap, cellId, cell),
      (rowMap, cellId) =>
        delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel),
    );

  const setValidCell = (
    tableId: Id,
    rowId: Id,
    rowMap: RowMap,
    cellId: Id,
    cell: Cell,
  ): void => {
    if (!collHas(rowMap, cellId)) {
      cellIdsChanged(tableId, rowId, cellId, 1);
    }
    const oldCell = mapGet(rowMap, cellId);
    if (cell !== oldCell) {
      cellChanged(tableId, rowId, cellId, oldCell, cell);
      mapSet(rowMap, cellId, cell);
    }
  };

  const setCellIntoDefaultRow = (
    tableId: Id,
    tableMap: TableMap,
    rowId: Id,
    cellId: Id,
    validCell: Cell,
  ): void =>
    ifNotUndefined(
      mapGet(tableMap, rowId),
      (rowMap): any => setValidCell(tableId, rowId, rowMap, cellId, validCell),
      () =>
        setValidRow(
          tableId,
          tableMap,
          rowId,
          addDefaultsToRow({[cellId]: validCell}, tableId, rowId),
        ),
    );

  const setValidValues = (values: Values): RowMap =>
    transformMap(
      valuesMap,
      values,
      (_valuesMap, valueId, value) => setValidValue(valueId, value),
      (_valuesMap, valueId) => delValidValue(valueId),
    );

  const setValidValue = (valueId: Id, value: Value): void => {
    if (!collHas(valuesMap, valueId)) {
      valueIdsChanged(valueId, 1);
    }
    const oldValue = mapGet(valuesMap, valueId);
    if (value !== oldValue) {
      valueChanged(valueId, oldValue, value);
      mapSet(valuesMap, valueId, value);
    }
  };

  const getNewRowId = (tableId: Id): Id => {
    const [getId] = mapEnsure(tablePoolFunctions, tableId, getPoolFunctions);
    const rowId = getId();
    if (!collHas(mapGet(tablesMap, tableId), rowId)) {
      return rowId;
    }
    return getNewRowId(tableId);
  };

  const getOrCreateTable = (tableId: Id) =>
    mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});

  const delValidTable = (tableId: Id): TableMap => setValidTable(tableId, {});

  const delValidRow = (tableId: Id, tableMap: TableMap, rowId: Id): void => {
    const [, releaseId] = mapEnsure(
      tablePoolFunctions,
      tableId,
      getPoolFunctions,
    );
    releaseId(rowId);
    setValidRow(tableId, tableMap, rowId, {}, true);
  };

  const delValidCell = (
    tableId: Id,
    table: TableMap,
    rowId: Id,
    row: RowMap,
    cellId: Id,
    forceDel?: boolean,
  ): void => {
    const defaultCell = mapGet(
      mapGet(tablesSchemaRowCache, tableId)?.[0],
      cellId,
    );
    if (!isUndefined(defaultCell) && !forceDel) {
      return setValidCell(tableId, rowId, row, cellId, defaultCell);
    }
    const delCell = (cellId: Id) => {
      cellChanged(tableId, rowId, cellId, mapGet(row, cellId));
      cellIdsChanged(tableId, rowId, cellId, -1);
      mapSet(row, cellId);
    };
    isUndefined(defaultCell) ? delCell(cellId) : mapForEach(row, delCell);
    if (collIsEmpty(row)) {
      rowIdsChanged(tableId, rowId, -1);
      if (collIsEmpty(mapSet(table, rowId))) {
        tableIdsChanged(tableId, -1);
        mapSet(tablesMap, tableId);
        mapSet(tablePoolFunctions, tableId);
      }
    }
  };

  const delValidValue = (valueId: Id): void => {
    const defaultValue = mapGet(valuesDefaulted, valueId);
    if (!isUndefined(defaultValue)) {
      return setValidValue(valueId, defaultValue);
    }
    valueChanged(valueId, mapGet(valuesMap, valueId));
    valueIdsChanged(valueId, -1);
    mapSet(valuesMap, valueId);
  };

  const tableIdsChanged = (tableId: Id, added: IdAdded): ChangedIdsMap =>
    idsChanged(changedTableIds, tableId, added);

  const rowIdsChanged = (
    tableId: Id,
    rowId: Id,
    added: IdAdded,
  ): ChangedIdsMap =>
    idsChanged(
      mapEnsure(changedRowIds, tableId, mapNew) as ChangedIdsMap,
      rowId,
      added,
    );

  const cellIdsChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    added: IdAdded,
  ): ChangedIdsMap =>
    idsChanged(
      mapEnsure(
        mapEnsure(changedCellIds, tableId, mapNew) as ChangedIdsMap2,
        rowId,
        mapNew,
      ) as ChangedIdsMap,
      cellId,
      added,
    );

  const cellChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    oldCell: CellOrUndefined,
    newCell?: CellOrUndefined,
  ): CellOrUndefined =>
    (mapEnsure<Id, [CellOrUndefined, CellOrUndefined]>(
      mapEnsure<Id, IdMap<[CellOrUndefined, CellOrUndefined]>>(
        mapEnsure<Id, IdMap2<[CellOrUndefined, CellOrUndefined]>>(
          changedCells,
          tableId,
          mapNew,
        ),
        rowId,
        mapNew,
      ),
      cellId,
      () => [oldCell, 0],
    )[1] = newCell);

  const valueIdsChanged = (valueId: Id, added: IdAdded): ChangedIdsMap =>
    idsChanged(changedValueIds, valueId, added);

  const valueChanged = (
    valueId: Id,
    oldValue: ValueOrUndefined,
    newValue?: ValueOrUndefined,
  ): ValueOrUndefined =>
    (mapEnsure<Id, [ValueOrUndefined, ValueOrUndefined]>(
      changedValues,
      valueId,
      () => [oldValue, 0],
    )[1] = newValue);

  const cellInvalid = (
    tableId?: Id,
    rowId?: Id,
    cellId?: Id,
    invalidCell?: any,
    defaultedCell?: Cell,
  ): CellOrUndefined => {
    arrayPush(
      mapEnsure<Id | undefined, any[]>(
        mapEnsure<Id | undefined, IdMap<any[]>>(
          mapEnsure<Id | undefined, IdMap2<any[]>>(
            invalidCells,
            tableId,
            mapNew,
          ),
          rowId,
          mapNew,
        ),
        cellId,
        () => [],
      ),
      invalidCell,
    );
    return defaultedCell;
  };

  const valueInvalid = (
    valueId?: Id,
    invalidValue?: any,
    defaultedValue?: Value,
  ): ValueOrUndefined => {
    arrayPush(
      mapEnsure<Id | undefined, any[]>(invalidValues, valueId, () => []),
      invalidValue,
    );
    return defaultedValue;
  };

  const getCellChange: GetCellChange = (tableId: Id, rowId: Id, cellId: Id) =>
    ifNotUndefined(
      mapGet(mapGet(mapGet(changedCells, tableId), rowId), cellId),
      ([oldCell, newCell]) => [true, oldCell, newCell],
      () => [false, ...pairNew(getCell(tableId, rowId, cellId))] as CellChange,
    ) as CellChange;

  const getValueChange: GetValueChange = (valueId: Id) =>
    ifNotUndefined(
      mapGet(changedValues, valueId),
      ([oldValue, newValue]) => [true, oldValue, newValue],
      () => [false, ...pairNew(getValue(valueId))] as ValueChange,
    ) as ValueChange;

  const callInvalidCellListeners = (mutator: 0 | 1) =>
    !collIsEmpty(invalidCells) && !collIsEmpty(invalidCellListeners[mutator])
      ? collForEach(
          mutator ? mapClone(invalidCells, mapClone2) : invalidCells,
          (rows, tableId) =>
            collForEach(rows, (cells, rowId) =>
              collForEach(cells, (invalidCell, cellId) =>
                callListeners(
                  invalidCellListeners[mutator],
                  [tableId, rowId, cellId],
                  invalidCell,
                ),
              ),
            ),
        )
      : 0;

  const callInvalidValueListeners = (mutator: 0 | 1) =>
    !collIsEmpty(invalidValues) && !collIsEmpty(invalidValueListeners[mutator])
      ? collForEach(
          mutator ? mapClone(invalidValues) : invalidValues,
          (invalidValue, valueId) =>
            callListeners(
              invalidValueListeners[mutator],
              [valueId],
              invalidValue,
            ),
        )
      : 0;

  const callIdsListenersIfChanged = (
    listeners: IdSetNode,
    changedIds: ChangedIdsMap,
    ids?: Ids,
  ): 1 | void => {
    if (!collIsEmpty(changedIds)) {
      callListeners(listeners, ids);
      return 1;
    }
  };

  const callTabularListenersForChanges = (mutator: 0 | 1) => {
    const emptySortedRowIdListeners = collIsEmpty(
      sortedRowIdsListeners[mutator],
    );
    const emptyIdListeners =
      collIsEmpty(cellIdsListeners[mutator]) &&
      collIsEmpty(rowIdsListeners[mutator]) &&
      emptySortedRowIdListeners &&
      collIsEmpty(tableIdsListeners[mutator]);
    const emptyOtherListeners =
      collIsEmpty(cellListeners[mutator]) &&
      collIsEmpty(rowListeners[mutator]) &&
      collIsEmpty(tableListeners[mutator]) &&
      collIsEmpty(tablesListeners[mutator]);
    if (!emptyIdListeners || !emptyOtherListeners) {
      const changes: [
        ChangedIdsMap,
        ChangedIdsMap2,
        ChangedIdsMap3,
        IdMap3<[CellOrUndefined, CellOrUndefined]>,
      ] = mutator
        ? [
            mapClone(changedTableIds),
            mapClone2(changedRowIds),
            mapClone(changedCellIds, mapClone2),
            mapClone(changedCells, mapClone2),
          ]
        : [changedTableIds, changedRowIds, changedCellIds, changedCells];

      if (!emptyIdListeners) {
        collForEach(changes[2], (rowCellIds, tableId) =>
          collForEach(rowCellIds, (changedIds, rowId) =>
            callIdsListenersIfChanged(cellIdsListeners[mutator], changedIds, [
              tableId,
              rowId,
            ]),
          ),
        );

        const calledSortableTableIds: IdSet = setNew();
        collForEach(changes[1], (changedIds, tableId) => {
          if (
            callIdsListenersIfChanged(rowIdsListeners[mutator], changedIds, [
              tableId,
            ]) &&
            !emptySortedRowIdListeners
          ) {
            callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
            setAdd(calledSortableTableIds, tableId);
          }
        });

        if (!emptySortedRowIdListeners) {
          collForEach(changes[3], (rows, tableId) => {
            if (!collHas(calledSortableTableIds, tableId)) {
              const sortableCellIds: IdSet = setNew();
              collForEach(rows, (cells) =>
                collForEach(cells, ([oldCell, newCell], cellId) =>
                  newCell !== oldCell
                    ? setAdd(sortableCellIds, cellId)
                    : collDel(cells, cellId),
                ),
              );
              collForEach(sortableCellIds, (cellId) =>
                callListeners(sortedRowIdsListeners[mutator], [
                  tableId,
                  cellId,
                ]),
              );
            }
          });
        }

        callIdsListenersIfChanged(tableIdsListeners[mutator], changes[0]);
      }

      if (!emptyOtherListeners) {
        let tablesChanged;
        collForEach(changes[3], (rows, tableId) => {
          let tableChanged;
          collForEach(rows, (cells, rowId) => {
            let rowChanged;
            collForEach(cells, ([oldCell, newCell], cellId) => {
              if (newCell !== oldCell) {
                callListeners(
                  cellListeners[mutator],
                  [tableId, rowId, cellId],
                  newCell,
                  oldCell,
                  getCellChange,
                );
                tablesChanged = tableChanged = rowChanged = 1;
              }
            });
            if (rowChanged) {
              callListeners(
                rowListeners[mutator],
                [tableId, rowId],
                getCellChange,
              );
            }
          });
          if (tableChanged) {
            callListeners(tableListeners[mutator], [tableId], getCellChange);
          }
        });
        if (tablesChanged) {
          callListeners(tablesListeners[mutator], undefined, getCellChange);
        }
      }
    }
  };

  const callKeyedValuesListenersForChanges = (mutator: 0 | 1) => {
    const emptyIdListeners = collIsEmpty(valueIdsListeners[mutator]);
    const emptyOtherListeners =
      collIsEmpty(valueListeners[mutator]) &&
      collIsEmpty(valuesListeners[mutator]);
    if (!emptyIdListeners || !emptyOtherListeners) {
      const changes: [
        ChangedIdsMap,
        IdMap<[CellOrUndefined, CellOrUndefined]>,
      ] = mutator
        ? [mapClone(changedValueIds), mapClone(changedValues)]
        : [changedValueIds, changedValues];

      if (!emptyIdListeners) {
        callIdsListenersIfChanged(valueIdsListeners[mutator], changes[0]);
      }

      if (!emptyOtherListeners) {
        let valuesChanged;
        collForEach(changes[1], ([oldValue, newValue], valueId) => {
          if (newValue !== oldValue) {
            callListeners(
              valueListeners[mutator],
              [valueId],
              newValue,
              oldValue,
              getValueChange,
            );
            valuesChanged = 1;
          }
        });
        if (valuesChanged) {
          callListeners(valuesListeners[mutator], undefined, getValueChange);
        }
      }
    }
  };

  const fluentTransaction = (
    actions: (...idArgs: Id[]) => unknown,
    ...args: unknown[]
  ): Store => {
    transaction(() => actions(...arrayMap(args, id)));
    return store;
  };

  // --

  const getTables = (): Tables =>
    mapToObj<TableMap, Table>(tablesMap, (table) =>
      mapToObj<RowMap, Row>(table, mapToObj),
    );

  const getTableIds = (): Ids => mapKeys(tablesMap);

  const getTable = (tableId: Id): Table =>
    mapToObj<RowMap, Row>(mapGet(tablesMap, id(tableId)), mapToObj);

  const getRowIds = (tableId: Id): Ids =>
    mapKeys(mapGet(tablesMap, id(tableId)));

  const getSortedRowIds = (
    tableId: Id,
    cellId?: Id,
    descending?: boolean,
    offset = 0,
    limit?: number,
  ): Ids =>
    arrayMap(
      arraySlice(
        arraySort(
          mapMap<Id, RowMap, [Cell, Id]>(
            mapGet(tablesMap, id(tableId)),
            (row, rowId) => [
              isUndefined(cellId) ? rowId : (mapGet(row, id(cellId)) as Cell),
              rowId,
            ],
          ),
          ([cell1], [cell2]) =>
            defaultSorter(cell1, cell2) * (descending ? -1 : 1),
        ),
        offset,
        isUndefined(limit) ? limit : offset + limit,
      ),
      ([, rowId]) => rowId,
    );

  const getRow = (tableId: Id, rowId: Id): Row =>
    mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));

  const getCellIds = (tableId: Id, rowId: Id): Ids =>
    mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));

  const getCell = (tableId: Id, rowId: Id, cellId: Id): CellOrUndefined =>
    mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));

  const getValues = (): Values => mapToObj(valuesMap);

  const getValueIds = (): Ids => mapKeys(valuesMap);

  const getValue = (valueId: Id): ValueOrUndefined =>
    mapGet(valuesMap, id(valueId));

  const hasTables = (): boolean => !collIsEmpty(tablesMap);

  const hasTable = (tableId: Id): boolean => collHas(tablesMap, id(tableId));

  const hasRow = (tableId: Id, rowId: Id): boolean =>
    collHas(mapGet(tablesMap, id(tableId)), id(rowId));

  const hasCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
    collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));

  const hasValues = (): boolean => !collIsEmpty(valuesMap);

  const hasValue = (valueId: Id): boolean => collHas(valuesMap, id(valueId));

  const getTablesJson = (): Json => jsonString(tablesMap);

  const getValuesJson = (): Json => jsonString(valuesMap);

  const getJson = (): Json => jsonString([tablesMap, valuesMap]);

  const getTablesSchemaJson = (): Json => jsonString(tablesSchemaMap);

  const getValuesSchemaJson = (): Json => jsonString(valuesSchemaMap);

  const setTables = (tables: Tables): Store =>
    fluentTransaction(() =>
      validateTables(tables) ? setValidTables(tables) : 0,
    );

  const setTable = (tableId: Id, table: Table): Store =>
    fluentTransaction(
      (tableId) =>
        validateTable(table, tableId) ? setValidTable(tableId, table) : 0,
      tableId,
    );

  const setRow = (tableId: Id, rowId: Id, row: Row): Store =>
    fluentTransaction(
      (tableId, rowId) =>
        validateRow(tableId, rowId, row)
          ? setValidRow(tableId, getOrCreateTable(tableId), rowId, row)
          : 0,
      tableId,
      rowId,
    );

  const addRow = (tableId: Id, row: Row): Id | undefined =>
    transaction(() => {
      let rowId: Id | undefined = undefined;
      if (validateRow(tableId, rowId, row)) {
        tableId = id(tableId);
        setValidRow(
          tableId,
          getOrCreateTable(tableId),
          (rowId = getNewRowId(tableId)),
          row,
        );
      }
      return rowId;
    });

  const setPartialRow = (tableId: Id, rowId: Id, partialRow: Row): Store =>
    fluentTransaction(
      (tableId, rowId) => {
        if (validateRow(tableId, rowId, partialRow, 1)) {
          const table = getOrCreateTable(tableId);
          objMap(partialRow, (cell, cellId) =>
            setCellIntoDefaultRow(tableId, table, rowId, cellId, cell),
          );
        }
      },
      tableId,
      rowId,
    );

  const setCell = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: Cell | MapCell,
  ): Store =>
    fluentTransaction(
      (tableId, rowId, cellId) =>
        ifNotUndefined(
          getValidatedCell(
            tableId,
            rowId,
            cellId,
            isFunction(cell) ? cell(getCell(tableId, rowId, cellId)) : cell,
          ),
          (validCell) =>
            setCellIntoDefaultRow(
              tableId,
              getOrCreateTable(tableId),
              rowId,
              cellId,
              validCell,
            ),
        ),
      tableId,
      rowId,
      cellId,
    );

  const setValues = (values: Values): Store =>
    fluentTransaction(() =>
      validateValues(values) ? setValidValues(values) : 0,
    );

  const setPartialValues = (partialValues: Values): Store =>
    fluentTransaction(() =>
      validateValues(partialValues, 1)
        ? objMap(partialValues, (value, valueId) =>
            setValidValue(valueId, value),
          )
        : 0,
    );

  const setValue = (valueId: Id, value: Value): Store =>
    fluentTransaction(
      (valueId) =>
        ifNotUndefined(
          getValidatedValue(
            valueId,
            isFunction(value) ? value(getValue(valueId)) : value,
          ),
          (validValue) => setValidValue(valueId, validValue),
        ),
      valueId,
    );

  const setTablesJson = (tablesJson: Json): Store => {
    try {
      tablesJson === EMPTY_OBJECT
        ? delTables()
        : setTables(jsonParse(tablesJson));
    } catch {}
    return store;
  };

  const setValuesJson = (valuesJson: Json): Store => {
    try {
      valuesJson === EMPTY_OBJECT
        ? delValues()
        : setValues(jsonParse(valuesJson));
    } catch {}
    return store;
  };

  const setTablesSchema = (tablesSchema: TablesSchema): Store =>
    fluentTransaction(() => {
      if ((hasTablesSchema = validateTablesSchema(tablesSchema))) {
        setValidTablesSchema(tablesSchema);
        if (!collIsEmpty(tablesMap)) {
          const tables = getTables();
          delTables();
          setTables(tables);
        }
      }
    });

  const setValuesSchema = (valuesSchema: ValuesSchema): Store =>
    fluentTransaction(() => {
      if ((hasValuesSchema = validateValuesSchema(valuesSchema))) {
        const values = getValues();
        delValuesSchema();
        delValues();
        hasValuesSchema = true;
        setValidValuesSchema(valuesSchema);
        setValues(values);
      }
    });

  const delTables = (): Store => fluentTransaction(() => setValidTables({}));

  const delTable = (tableId: Id): Store =>
    fluentTransaction(
      (tableId) => (collHas(tablesMap, tableId) ? delValidTable(tableId) : 0),
      tableId,
    );

  const delRow = (tableId: Id, rowId: Id): Store =>
    fluentTransaction(
      (tableId, rowId) =>
        ifNotUndefined(mapGet(tablesMap, tableId), (tableMap) =>
          collHas(tableMap, rowId) ? delValidRow(tableId, tableMap, rowId) : 0,
        ),
      tableId,
      rowId,
    );

  const delCell = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    forceDel?: boolean,
  ): Store =>
    fluentTransaction(
      (tableId, rowId, cellId) =>
        ifNotUndefined(mapGet(tablesMap, tableId), (tableMap) =>
          ifNotUndefined(mapGet(tableMap, rowId), (rowMap) =>
            collHas(rowMap, cellId)
              ? delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel)
              : 0,
          ),
        ),
      tableId,
      rowId,
      cellId,
    );

  const delValues = (): Store => fluentTransaction(() => setValidValues({}));

  const delValue = (valueId: Id): Store =>
    fluentTransaction(
      (valueId) => (collHas(valuesMap, valueId) ? delValidValue(valueId) : 0),
      valueId,
    );

  const delTablesSchema = (): Store =>
    fluentTransaction(() => {
      setValidTablesSchema({});
      hasTablesSchema = false;
    });

  const delValuesSchema = (): Store =>
    fluentTransaction(() => {
      setValidValuesSchema({});
      hasValuesSchema = false;
    });

  const transaction = <Return>(
    actions: () => Return,
    doRollback?: DoRollback,
  ): Return => {
    if (transactions == -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore only occurs internally
      return;
    }
    startTransaction();
    const result = actions();
    finishTransaction(doRollback);
    return result as Return;
  };

  const startTransaction = (): Store => {
    transactions++;
    return store;
  };

  const finishTransaction = (doRollback?: DoRollback): Store => {
    if (transactions > 0) {
      transactions--;

      if (transactions == 0) {
        cellsTouched = !collIsEmpty(changedCells);
        valuesTouched = !collIsEmpty(changedValues);
        transactions = 1;
        callInvalidCellListeners(1);
        if (cellsTouched) {
          callTabularListenersForChanges(1);
        }
        callInvalidValueListeners(1);
        if (valuesTouched) {
          callKeyedValuesListenersForChanges(1);
        }
        transactions = -1;

        if (
          doRollback?.(
            mapToObj(
              changedCells,
              (table) =>
                mapToObj(
                  table,
                  (row) =>
                    mapToObj(
                      row,
                      (cells) => [...cells],
                      ([oldCell, newCell]) => oldCell === newCell,
                    ),
                  objIsEmpty,
                ),
              objIsEmpty,
            ),
            mapToObj<IdMap2<any[]>, IdObj2<any[]>>(invalidCells, (map) =>
              mapToObj<IdMap<any[]>, IdObj<any[]>>(map, mapToObj),
            ),
            mapToObj(
              changedValues,
              (values) => [...values],
              ([oldValue, newValue]) => oldValue === newValue,
            ),
            mapToObj(invalidValues),
          )
        ) {
          transactions = 1;
          collForEach(changedCells, (table, tableId) =>
            collForEach(table, (row, rowId) =>
              collForEach(row, ([oldCell], cellId) =>
                setOrDelCell(store, tableId, rowId, cellId, oldCell),
              ),
            ),
          );
          collForEach(changedValues, ([oldValue], valueId) =>
            setOrDelValue(store, valueId, oldValue),
          );
          transactions = -1;
          cellsTouched = valuesTouched = false;
        }

        callListeners(
          finishTransactionListeners[0],
          undefined,
          cellsTouched,
          valuesTouched,
        );
        callInvalidCellListeners(0);
        if (cellsTouched) {
          callTabularListenersForChanges(0);
        }
        callInvalidValueListeners(0);
        if (valuesTouched) {
          callKeyedValuesListenersForChanges(0);
        }
        callListeners(
          finishTransactionListeners[1],
          undefined,
          cellsTouched,
          valuesTouched,
        );

        transactions = 0;
        arrayForEach(
          [
            changedTableIds,
            changedRowIds,
            changedCellIds,
            changedCells,
            invalidCells,
            changedValueIds,
            changedValues,
            invalidValues,
          ],
          collClear,
        );
      }
    }
    return store;
  };

  const forEachTable = (tableCallback: TableCallback): void =>
    collForEach(tablesMap, (tableMap, tableId) =>
      tableCallback(tableId, (rowCallback) =>
        collForEach(tableMap, (rowMap, rowId) =>
          rowCallback(rowId, (cellCallback) =>
            mapForEach(rowMap, cellCallback),
          ),
        ),
      ),
    );

  const forEachRow = (tableId: Id, rowCallback: RowCallback): void =>
    collForEach(mapGet(tablesMap, id(tableId)), (rowMap, rowId) =>
      rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback)),
    );

  const forEachCell = (
    tableId: Id,
    rowId: Id,
    cellCallback: CellCallback,
  ): void =>
    mapForEach(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), cellCallback);

  const forEachValue = (valueCallback: ValueCallback): void =>
    mapForEach(valuesMap, valueCallback);

  const addSortedRowIdsListener = (
    tableId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: SortedRowIdsListener,
    mutator?: boolean,
  ): Id => {
    let sortedRowIds = getSortedRowIds(
      tableId,
      cellId,
      descending,
      offset,
      limit,
    );
    return addListener(
      () => {
        const newSortedRowIds = getSortedRowIds(
          tableId,
          cellId,
          descending,
          offset,
          limit,
        );
        if (!arrayIsEqual(newSortedRowIds, sortedRowIds)) {
          sortedRowIds = newSortedRowIds;
          listener(
            store,
            tableId,
            cellId,
            descending,
            offset,
            limit,
            sortedRowIds,
          );
        }
      },
      sortedRowIdsListeners[mutator ? 1 : 0],
      [tableId, cellId],
      [getTableIds],
    );
  };

  const addWillFinishTransactionListener = (
    listener: TransactionListener,
  ): Id => addListener(listener, finishTransactionListeners[0]);

  const addDidFinishTransactionListener = (listener: TransactionListener): Id =>
    addListener(listener, finishTransactionListeners[1]);

  const callListener = (listenerId: Id) => {
    callListenerImpl(listenerId);
    return store;
  };

  const delListener = (listenerId: Id): Store => {
    delListenerImpl(listenerId);
    return store;
  };

  const getListenerStats = (): StoreListenerStats =>
    DEBUG
      ? {
          tables: pairCollSize2(tablesListeners),
          tableIds: pairCollSize2(tableIdsListeners),
          table: pairCollSize2(tableListeners),
          rowIds: pairCollSize2(rowIdsListeners),
          sortedRowIds: pairCollSize2(sortedRowIdsListeners),
          row: pairCollSize2(rowListeners, collSize3),
          cellIds: pairCollSize2(cellIdsListeners, collSize3),
          cell: pairCollSize2(cellListeners, collSize4),
          invalidCell: pairCollSize2(invalidCellListeners, collSize4),
          values: pairCollSize2(valuesListeners),
          valueIds: pairCollSize2(valueIdsListeners),
          value: pairCollSize2(valueListeners),
          invalidValue: pairCollSize2(invalidValueListeners),
          transaction: pairCollSize2(finishTransactionListeners),
        }
      : {};

  const store: any = {
    getTables,
    getTableIds,
    getTable,
    getRowIds,
    getSortedRowIds,
    getRow,
    getCellIds,
    getCell,
    getValues,
    getValueIds,
    getValue,

    hasTables,
    hasTable,
    hasRow,
    hasCell,
    hasValues,
    hasValue,

    getTablesJson,
    getValuesJson,
    getJson,
    getTablesSchemaJson,
    getValuesSchemaJson,

    setTables,
    setTable,
    setRow,
    addRow,
    setPartialRow,
    setCell,
    setValues,
    setPartialValues,
    setValue,

    setTablesJson,
    setValuesJson,
    setTablesSchema,
    setValuesSchema,

    delTables,
    delTable,
    delRow,
    delCell,
    delValues,
    delValue,
    delTablesSchema,
    delValuesSchema,

    transaction,
    startTransaction,
    finishTransaction,

    forEachTable,
    forEachRow,
    forEachCell,
    forEachValue,

    addSortedRowIdsListener,
    addWillFinishTransactionListener,
    addDidFinishTransactionListener,

    callListener,
    delListener,

    getListenerStats,

    createStore,
  };

  objMap(
    {
      [TABLES]: [0, tablesListeners],
      [TABLE_IDS]: [0, tableIdsListeners],
      [TABLE]: [1, tableListeners, [getTableIds]],
      [ROW_IDS]: [1, rowIdsListeners, [getTableIds]],
      [ROW]: [2, rowListeners, [getTableIds, getRowIds]],
      [CELL_IDS]: [2, cellIdsListeners, [getTableIds, getRowIds]],
      [CELL]: [
        3,
        cellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids: Ids) => pairNew(getCell(...(ids as [Id, Id, Id]))),
      ],
      InvalidCell: [3, invalidCellListeners],
      [VALUES]: [0, valuesListeners],
      [VALUE_IDS]: [0, valueIdsListeners],
      [VALUE]: [
        1,
        valueListeners,
        [getValueIds],
        (ids: Ids) => pairNew(getValue(ids[0])),
      ],
      InvalidValue: [1, invalidValueListeners],
    },
    (
      [argumentCount, idSetNode, pathGetters, extraArgsGetter]: [
        number,
        Pair<IdSetNode>,
        PathGetters?,
        ExtraArgsGetter?,
      ],
      listenable,
    ) => {
      store[ADD + listenable + LISTENER] = (...args: any[]): Id =>
        addListener(
          args[argumentCount] as any,
          idSetNode[args[argumentCount + 1] ? 1 : 0],
          argumentCount > 0 ? arraySlice(args, 0, argumentCount) : undefined,
          pathGetters,
          extraArgsGetter,
        );
    },
  );

  return objFreeze(store as Store);
};
