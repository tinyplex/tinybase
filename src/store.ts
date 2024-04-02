import {
  ADD,
  CELL,
  CELL_IDS,
  DEFAULT,
  HAS,
  LISTENER,
  NUMBER,
  ROW,
  ROW_COUNT,
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
  ChangedCell,
  ChangedValue,
  Changes,
  Content,
  DoRollback,
  GetCellChange,
  GetValueChange,
  IdAddedOrRemoved,
  MapCell,
  Row,
  RowCallback,
  SortedRowIdsListener,
  Store,
  StoreListenerStats,
  Table,
  TableCallback,
  TableCellCallback,
  Tables,
  TablesSchema,
  TransactionListener,
  TransactionLog,
  Value,
  ValueCallback,
  ValueChange,
  ValueOrUndefined,
  ValueSchema,
  Values,
  ValuesSchema,
  createStore as createStoreDecl,
} from './types/store.d';
import {
  DEBUG,
  ifNotUndefined,
  isFunction,
  isTypeStringOrBoolean,
  isUndefined,
  slice,
} from './common/other';
import {
  ExtraArgsGetter,
  IdSetNode,
  PathGetters,
  getListenerFunctions,
} from './common/listeners';
import {Id, Ids, Json} from './types/common.d';
import {
  IdMap,
  IdMap2,
  IdMap3,
  mapClone,
  mapClone2,
  mapClone3,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapMap,
  mapMatch,
  mapNew,
  mapSet,
  mapToObj,
  mapToObj2,
  mapToObj3,
} from './common/map';
import {IdSet, IdSet2, IdSet3, IdSet4, setAdd, setNew} from './common/set';
import {
  Pair,
  pairClone,
  pairCollSize2,
  pairIsEqual,
  pairNew,
  pairNewMap,
} from './common/pairs';
import {PoolFunctions, getPoolFunctions} from './common/pool';
import {
  arrayForEach,
  arrayHas,
  arrayIsEqual,
  arrayMap,
  arrayPush,
  arraySort,
} from './common/array';
import {
  collClear,
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collSize,
  collSize2,
  collSize3,
  collSize4,
} from './common/coll';
import {getCellOrValueType, setOrDelCell, setOrDelValue} from './common/cell';
import {jsonParse, jsonString} from './common/json';
import {
  objDel,
  objFreeze,
  objHas,
  objIsEmpty,
  objToArray,
  objValidate,
} from './common/obj';
import {defaultSorter} from './common';

type TablesSchemaMap = IdMap2<CellSchema>;
type ValuesSchemaMap = IdMap<ValueSchema>;
type RowMap = IdMap<Cell>;
type TableMap = IdMap<RowMap>;
type TablesMap = IdMap<TableMap>;
type ValuesMap = IdMap<Value>;
type ChangedIdsMap = IdMap<IdAddedOrRemoved>;
type ChangedIdsMap2 = IdMap2<IdAddedOrRemoved>;
type ChangedIdsMap3 = IdMap3<IdAddedOrRemoved>;

const idsChanged = (
  changedIds: ChangedIdsMap,
  id: Id,
  addedOrRemoved: IdAddedOrRemoved,
): ChangedIdsMap =>
  mapSet(
    changedIds,
    id,
    mapGet(changedIds, id) == -addedOrRemoved ? undefined : addedOrRemoved,
  ) as ChangedIdsMap;

export const createStore: typeof createStoreDecl = (): Store => {
  let hasTablesSchema: boolean;
  let hasValuesSchema: boolean;
  let hadTables = false;
  let hadValues = false;
  let transactions = 0;
  let internalListeners: [
    preFinishTransaction?: TransactionListener,
    postFinishTransaction?: TransactionListener,
  ] = [];
  const changedTableIds: ChangedIdsMap = mapNew();
  const changedTableCellIds: ChangedIdsMap2 = mapNew();
  const changedRowCount: IdMap<number> = mapNew();
  const changedRowIds: ChangedIdsMap2 = mapNew();
  const changedCellIds: ChangedIdsMap3 = mapNew();
  const changedCells: IdMap3<ChangedCell> = mapNew();
  const changedValueIds: ChangedIdsMap = mapNew();
  const changedValues: IdMap<ChangedValue> = mapNew();
  const invalidCells: IdMap3<any[]> = mapNew();
  const invalidValues: IdMap<any[]> = mapNew();
  const tablesSchemaMap: TablesSchemaMap = mapNew();
  const tablesSchemaRowCache: IdMap<[RowMap, IdSet]> = mapNew();
  const valuesSchemaMap: ValuesSchemaMap = mapNew();
  const valuesDefaulted: ValuesMap = mapNew();
  const valuesNonDefaulted: IdSet = setNew();
  const tablePoolFunctions: IdMap<PoolFunctions> = mapNew();
  const tableCellIds: IdMap<IdMap<number>> = mapNew();
  const tablesMap: TablesMap = mapNew();
  const valuesMap: ValuesMap = mapNew();
  const hasTablesListeners: Pair<IdSet2> = pairNewMap();
  const tablesListeners: Pair<IdSet2> = pairNewMap();
  const tableIdsListeners: Pair<IdSet2> = pairNewMap();
  const hasTableListeners: Pair<IdSet2> = pairNewMap();
  const tableListeners: Pair<IdSet2> = pairNewMap();
  const tableCellIdsListeners: Pair<IdSet2> = pairNewMap();
  const hasTableCellListeners: Pair<IdSet3> = pairNewMap();
  const rowCountListeners: Pair<IdSet2> = pairNewMap();
  const rowIdsListeners: Pair<IdSet2> = pairNewMap();
  const sortedRowIdsListeners: Pair<IdSet3> = pairNewMap();
  const hasRowListeners: Pair<IdSet3> = pairNewMap();
  const rowListeners: Pair<IdSet3> = pairNewMap();
  const cellIdsListeners: Pair<IdSet3> = pairNewMap();
  const hasCellListeners: Pair<IdSet4> = pairNewMap();
  const cellListeners: Pair<IdSet4> = pairNewMap();
  const invalidCellListeners: Pair<IdSet4> = pairNewMap();
  const invalidValueListeners: Pair<IdSet2> = pairNewMap();
  const hasValuesListeners: Pair<IdSet2> = pairNewMap();
  const valuesListeners: Pair<IdSet2> = pairNewMap();
  const valueIdsListeners: Pair<IdSet2> = pairNewMap();
  const hasValueListeners: Pair<IdSet2> = pairNewMap();
  const valueListeners: Pair<IdSet2> = pairNewMap();
  const startTransactionListeners: IdSet2 = mapNew();
  const finishTransactionListeners: Pair<IdSet2> = pairNewMap();

  const [addListener, callListeners, delListenerImpl, callListenerImpl] =
    getListenerFunctions(() => store);

  const validateTablesSchema = (
    tableSchema: TablesSchema | undefined,
  ): boolean =>
    objValidate(tableSchema, (tableSchema) =>
      objValidate(tableSchema, validateCellOrValueSchema),
    );

  const validateValuesSchema = (
    valuesSchema: ValuesSchema | undefined,
  ): boolean => objValidate(valuesSchema, validateCellOrValueSchema);

  const validateCellOrValueSchema = (schema: CellSchema | ValueSchema) => {
    if (
      !objValidate(schema, (_child, id: Id) => arrayHas([TYPE, DEFAULT], id))
    ) {
      return false;
    }
    const type = schema[TYPE];
    if (!isTypeStringOrBoolean(type) && type != NUMBER) {
      return false;
    }
    if (getCellOrValueType(schema[DEFAULT]) != type) {
      objDel(schema as any, DEFAULT);
    }
    return true;
  };

  const validateTables = (tables: Tables): boolean =>
    objValidate(tables, validateTable, cellInvalid);

  const validateTable = (table: Table, tableId: Id): boolean =>
    (!hasTablesSchema ||
      collHas(tablesSchemaMap, tableId) ||
      (cellInvalid(tableId) as boolean)) &&
    objValidate(
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
    objValidate(
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
            getCellOrValueType(cell) != cellSchema[TYPE]
              ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT])
              : cell,
          () => cellInvalid(tableId, rowId, cellId, cell),
        )
      : isUndefined(getCellOrValueType(cell))
        ? cellInvalid(tableId, rowId, cellId, cell)
        : cell;

  const validateValues = (values: Values, skipDefaults?: 1): boolean =>
    objValidate(
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
            getCellOrValueType(value) != valueSchema[TYPE]
              ? valueInvalid(valueId, value, valueSchema[DEFAULT])
              : value,
          () => valueInvalid(valueId, value),
        )
      : isUndefined(getCellOrValueType(value))
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
    mapMatch(
      tablesSchemaMap,
      tablesSchema,
      (_tablesSchema, tableId, tableSchema) => {
        const rowDefaulted = mapNew();
        const rowNonDefaulted = setNew();
        mapMatch(
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
    mapMatch(
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

  const setOrDelTables = (tables: Tables) =>
    objIsEmpty(tables) ? delTables() : setTables(tables);

  const setValidTables = (tables: Tables): TablesMap =>
    mapMatch(
      tablesMap,
      tables,
      (_tables, tableId, table) => setValidTable(tableId, table),
      (_tables, tableId) => delValidTable(tableId),
    );

  const setValidTable = (tableId: Id, table: Table): TableMap =>
    mapMatch(
      mapEnsure(tablesMap, tableId, () => {
        tableIdsChanged(tableId, 1);
        mapSet(tablePoolFunctions, tableId, getPoolFunctions());
        mapSet(tableCellIds, tableId, mapNew());
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
    mapMatch(
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

  const setOrDelValues = (values: Values) =>
    objIsEmpty(values) ? delValues() : setValues(values);

  const setValidValues = (values: Values): RowMap =>
    mapMatch(
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

  const getNewRowId = (tableId: Id, reuse: 0 | 1): Id => {
    const [getId] = mapGet(tablePoolFunctions, tableId) as PoolFunctions;
    const rowId = getId(reuse);
    if (!collHas(mapGet(tablesMap, tableId), rowId)) {
      return rowId;
    }
    return getNewRowId(tableId, reuse);
  };

  const getOrCreateTable = (tableId: Id) =>
    mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});

  const delValidTable = (tableId: Id): TableMap => setValidTable(tableId, {});

  const delValidRow = (tableId: Id, tableMap: TableMap, rowId: Id): void => {
    const [, releaseId] = mapGet(tablePoolFunctions, tableId) as PoolFunctions;
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
        mapSet(tableCellIds, tableId);
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

  const tableIdsChanged = (
    tableId: Id,
    addedOrRemoved: IdAddedOrRemoved,
  ): ChangedIdsMap => idsChanged(changedTableIds, tableId, addedOrRemoved);

  const rowIdsChanged = (
    tableId: Id,
    rowId: Id,
    addedOrRemoved: IdAddedOrRemoved,
  ): IdMap<number> | undefined =>
    idsChanged(
      mapEnsure(changedRowIds, tableId, mapNew) as ChangedIdsMap,
      rowId,
      addedOrRemoved,
    ) &&
    mapSet(
      changedRowCount,
      tableId,
      mapEnsure(changedRowCount, tableId, () => 0) + addedOrRemoved,
    );

  const cellIdsChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    addedOrRemoved: IdAddedOrRemoved,
  ): void => {
    const cellIds = mapGet(tableCellIds, tableId);
    const count = mapGet(cellIds, cellId) ?? 0;
    if (
      (count == 0 && addedOrRemoved == 1) ||
      (count == 1 && addedOrRemoved == -1)
    ) {
      idsChanged(
        mapEnsure(changedTableCellIds, tableId, mapNew) as ChangedIdsMap,
        cellId,
        addedOrRemoved,
      );
    }
    mapSet(
      cellIds,
      cellId,
      count != -addedOrRemoved ? count + addedOrRemoved : null,
    );

    idsChanged(
      mapEnsure(
        mapEnsure(changedCellIds, tableId, mapNew) as ChangedIdsMap2,
        rowId,
        mapNew,
      ) as ChangedIdsMap,
      cellId,
      addedOrRemoved,
    );
  };

  const cellChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    oldCell?: CellOrUndefined,
    newCell?: CellOrUndefined,
  ): CellOrUndefined =>
    (mapEnsure<Id, ChangedCell>(
      mapEnsure<Id, IdMap<ChangedCell>>(
        mapEnsure<Id, IdMap2<ChangedCell>>(changedCells, tableId, mapNew),
        rowId,
        mapNew,
      ),
      cellId,
      () => [oldCell, 0],
    )[1] = newCell);

  const valueIdsChanged = (
    valueId: Id,
    addedOrRemoved: IdAddedOrRemoved,
  ): ChangedIdsMap => idsChanged(changedValueIds, valueId, addedOrRemoved);

  const valueChanged = (
    valueId: Id,
    oldValue?: ValueOrUndefined,
    newValue?: ValueOrUndefined,
  ): ValueOrUndefined =>
    (mapEnsure<Id, ChangedValue>(changedValues, valueId, () => [
      oldValue,
      0,
    ])[1] = newValue);

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
          mutator ? mapClone3(invalidCells) : invalidCells,
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

  const callIdsAndHasListenersIfChanged = (
    changedIds: ChangedIdsMap,
    idListeners: IdSetNode,
    hasListeners: IdSetNode,
    ids?: Ids,
  ): 1 | void => {
    if (!collIsEmpty(changedIds)) {
      callListeners(idListeners, ids, () => mapToObj(changedIds));
      mapForEach(changedIds, (changedId, changed) =>
        callListeners(hasListeners, [...(ids ?? []), changedId], changed == 1),
      );
      return 1;
    }
  };

  const callTabularListenersForChanges = (mutator: 0 | 1) => {
    const hasTablesNow = hasTables();
    if (hasTablesNow != hadTables) {
      callListeners(hasTablesListeners[mutator], undefined, hasTablesNow);
    }

    const emptySortedRowIdListeners = collIsEmpty(
      sortedRowIdsListeners[mutator],
    );
    const emptyIdAndHasListeners =
      collIsEmpty(cellIdsListeners[mutator]) &&
      collIsEmpty(hasCellListeners[mutator]) &&
      collIsEmpty(rowIdsListeners[mutator]) &&
      collIsEmpty(hasRowListeners[mutator]) &&
      collIsEmpty(tableCellIdsListeners[mutator]) &&
      collIsEmpty(hasTableCellListeners[mutator]) &&
      collIsEmpty(rowCountListeners[mutator]) &&
      emptySortedRowIdListeners &&
      collIsEmpty(tableIdsListeners[mutator]) &&
      collIsEmpty(hasTableListeners[mutator]);
    const emptyOtherListeners =
      collIsEmpty(cellListeners[mutator]) &&
      collIsEmpty(rowListeners[mutator]) &&
      collIsEmpty(tableListeners[mutator]) &&
      collIsEmpty(tablesListeners[mutator]);
    if (!emptyIdAndHasListeners || !emptyOtherListeners) {
      const changes: [
        ChangedIdsMap,
        ChangedIdsMap2,
        IdMap<number>,
        ChangedIdsMap2,
        ChangedIdsMap3,
        IdMap3<ChangedCell>,
      ] = mutator
        ? [
            mapClone(changedTableIds),
            mapClone2(changedTableCellIds),
            mapClone(changedRowCount),
            mapClone2(changedRowIds),
            mapClone3(changedCellIds),
            mapClone3(changedCells),
          ]
        : [
            changedTableIds,
            changedTableCellIds,
            changedRowCount,
            changedRowIds,
            changedCellIds,
            changedCells,
          ];

      if (!emptyIdAndHasListeners) {
        callIdsAndHasListenersIfChanged(
          changes[0],
          tableIdsListeners[mutator],
          hasTableListeners[mutator],
        );

        collForEach(changes[1], (changedIds, tableId) =>
          callIdsAndHasListenersIfChanged(
            changedIds,
            tableCellIdsListeners[mutator],
            hasTableCellListeners[mutator],
            [tableId],
          ),
        );

        collForEach(changes[2], (changedCount, tableId) => {
          if (changedCount != 0) {
            callListeners(
              rowCountListeners[mutator],
              [tableId],
              getRowCount(tableId),
            );
          }
        });

        const calledSortableTableIds: IdSet = setNew();
        collForEach(changes[3], (changedIds, tableId) => {
          if (
            callIdsAndHasListenersIfChanged(
              changedIds,
              rowIdsListeners[mutator],
              hasRowListeners[mutator],
              [tableId],
            ) &&
            !emptySortedRowIdListeners
          ) {
            callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
            setAdd(calledSortableTableIds, tableId);
          }
        });

        if (!emptySortedRowIdListeners) {
          collForEach(changes[5], (rows, tableId) => {
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

        collForEach(changes[4], (rowCellIds, tableId) =>
          collForEach(rowCellIds, (changedIds, rowId) =>
            callIdsAndHasListenersIfChanged(
              changedIds,
              cellIdsListeners[mutator],
              hasCellListeners[mutator],
              [tableId, rowId],
            ),
          ),
        );
      }

      if (!emptyOtherListeners) {
        let tablesChanged;
        collForEach(changes[5], (rows, tableId) => {
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

  const callValuesListenersForChanges = (mutator: 0 | 1) => {
    const hasValuesNow = hasValues();
    if (hasValuesNow != hadValues) {
      callListeners(hasValuesListeners[mutator], undefined, hasValuesNow);
    }

    const emptyIdAndHasListeners =
      collIsEmpty(valueIdsListeners[mutator]) &&
      collIsEmpty(hasValueListeners[mutator]);
    const emptyOtherListeners =
      collIsEmpty(valueListeners[mutator]) &&
      collIsEmpty(valuesListeners[mutator]);
    if (!emptyIdAndHasListeners || !emptyOtherListeners) {
      const changes: [ChangedIdsMap, IdMap<ChangedCell>] = mutator
        ? [mapClone(changedValueIds), mapClone(changedValues)]
        : [changedValueIds, changedValues];

      if (!emptyIdAndHasListeners) {
        callIdsAndHasListenersIfChanged(
          changes[0],
          valueIdsListeners[mutator],
          hasValueListeners[mutator],
        );
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

  const getContent = (): Content => [getTables(), getValues()];

  const getTables = (): Tables => mapToObj3(tablesMap);

  const getTableIds = (): Ids => mapKeys(tablesMap);

  const getTable = (tableId: Id): Table =>
    mapToObj2(mapGet(tablesMap, id(tableId)));

  const getTableCellIds = (tableId: Id): Ids =>
    mapKeys(mapGet(tableCellIds, id(tableId)));

  const getRowCount = (tableId: Id): number =>
    collSize(mapGet(tablesMap, id(tableId)));

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
      slice(
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

  const hasTableCell = (tableId: Id, cellId: Id): boolean =>
    collHas(mapGet(tableCellIds, id(tableId)), id(cellId));

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

  const getSchemaJson = (): Json =>
    jsonString([tablesSchemaMap, valuesSchemaMap]);

  const setContent = ([tables, values]: Content): Store =>
    fluentTransaction(() => {
      (objIsEmpty(tables) ? delTables : setTables)(tables);
      (objIsEmpty(values) ? delValues : setValues)(values);
    });

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

  const addRow = (tableId: Id, row: Row, reuseRowIds = true): Id | undefined =>
    transaction(() => {
      let rowId: Id | undefined = undefined;
      if (validateRow(tableId, rowId, row)) {
        tableId = id(tableId);
        setValidRow(
          tableId,
          getOrCreateTable(tableId),
          (rowId = getNewRowId(tableId, reuseRowIds ? 1 : 0)),
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
          objToArray(partialRow, (cell, cellId) =>
            setCellIntoDefaultRow(tableId, table, rowId, cellId, cell as Cell),
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
        ? objToArray(partialValues, (value, valueId) =>
            setValidValue(valueId, value as Value),
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

  const applyChanges = (changes: Changes): Store =>
    fluentTransaction(() => {
      objToArray(changes[0], (table, tableId) =>
        isUndefined(table)
          ? delTable(tableId)
          : objToArray(table, (row, rowId) =>
              isUndefined(row)
                ? delRow(tableId, rowId)
                : objToArray(row, (cell, cellId) =>
                    setOrDelCell(
                      store,
                      tableId,
                      rowId,
                      cellId,
                      cell as CellOrUndefined,
                    ),
                  ),
            ),
      );
      objToArray(changes[1], (value, valueId) =>
        setOrDelValue(store, valueId, value as ValueOrUndefined),
      );
    });

  const setTablesJson = (tablesJson: Json): Store => {
    try {
      setOrDelTables(jsonParse(tablesJson));
    } catch {}
    return store;
  };

  const setValuesJson = (valuesJson: Json): Store => {
    try {
      setOrDelValues(jsonParse(valuesJson));
    } catch {}
    return store;
  };

  const setJson = (tablesAndValuesJson: Json): Store =>
    fluentTransaction(() => {
      try {
        const [tables, values] = jsonParse(tablesAndValuesJson);
        setOrDelTables(tables);
        setOrDelValues(values);
      } catch {
        setTablesJson(tablesAndValuesJson);
      }
    });

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

  const setSchema = (
    tablesSchema: TablesSchema,
    valuesSchema?: ValuesSchema,
  ): Store =>
    fluentTransaction(() => {
      setTablesSchema(tablesSchema);
      setValuesSchema(valuesSchema as ValuesSchema);
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

  const delSchema = (): Store =>
    fluentTransaction(() => {
      delTablesSchema();
      delValuesSchema();
    });

  const transaction = <Return>(
    actions: () => Return,
    doRollback?: DoRollback,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore void return only occurs internally
  ): Return => {
    if (transactions != -1) {
      startTransaction();
      const result = actions();
      finishTransaction(doRollback);
      return result as Return;
    }
  };

  const startTransaction = (): Store => {
    if (transactions != -1) {
      transactions++;
    }
    if (transactions == 1) {
      callListeners(startTransactionListeners, undefined);
    }
    return store;
  };

  const getTransactionChanges = (): Changes => [
    mapToObj(
      changedCells,
      (table, tableId) =>
        mapGet(changedTableIds, tableId) === -1
          ? undefined
          : mapToObj(
              table,
              (row, rowId) =>
                mapGet(mapGet(changedRowIds, tableId), rowId) === -1
                  ? undefined
                  : mapToObj(
                      row,
                      ([, newCell]) => newCell,
                      (changedCell) => pairIsEqual(changedCell),
                    ),
              collIsEmpty,
              objIsEmpty,
            ),
      collIsEmpty,
      objIsEmpty,
    ),
    mapToObj(
      changedValues,
      ([, newValue]) => newValue,
      (changedValue) => pairIsEqual(changedValue),
    ),
    1,
  ];

  const getTransactionLog = (): TransactionLog => [
    !collIsEmpty(changedCells),
    !collIsEmpty(changedValues),
    mapToObj3(changedCells, pairClone, pairIsEqual),
    mapToObj3(invalidCells),
    mapToObj(changedValues, pairClone, pairIsEqual),
    mapToObj(invalidValues),
    mapToObj(changedTableIds),
    mapToObj2(changedRowIds),
    mapToObj3(changedCellIds),
    mapToObj(changedValueIds),
  ];

  const finishTransaction = (doRollback?: DoRollback): Store => {
    if (transactions > 0) {
      transactions--;

      if (transactions == 0) {
        transactions = 1;
        callInvalidCellListeners(1);
        if (!collIsEmpty(changedCells)) {
          callTabularListenersForChanges(1);
        }
        callInvalidValueListeners(1);
        if (!collIsEmpty(changedValues)) {
          callValuesListenersForChanges(1);
        }

        if (doRollback?.(store)) {
          collForEach(changedCells, (table, tableId) =>
            collForEach(table, (row, rowId) =>
              collForEach(row, ([oldCell], cellId) =>
                setOrDelCell(store, tableId, rowId, cellId, oldCell),
              ),
            ),
          );
          collClear(changedCells);
          collForEach(changedValues, ([oldValue], valueId) =>
            setOrDelValue(store, valueId, oldValue),
          );
          collClear(changedValues);
        }

        callListeners(finishTransactionListeners[0], undefined);

        transactions = -1;
        callInvalidCellListeners(0);
        if (!collIsEmpty(changedCells)) {
          callTabularListenersForChanges(0);
        }
        callInvalidValueListeners(0);
        if (!collIsEmpty(changedValues)) {
          callValuesListenersForChanges(0);
        }
        internalListeners[0]?.(store);
        callListeners(finishTransactionListeners[1], undefined);
        internalListeners[1]?.(store);

        transactions = 0;
        hadTables = hasTables();
        hadValues = hasValues();
        arrayForEach(
          [
            changedTableIds,
            changedTableCellIds,
            changedRowCount,
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

  const forEachTableCell = (
    tableId: Id,
    tableCellCallback: TableCellCallback,
  ): void => mapForEach(mapGet(tableCellIds, id(tableId)), tableCellCallback);

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

  const addStartTransactionListener = (listener: TransactionListener): Id =>
    addListener(listener, startTransactionListeners);

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
          hasTables: pairCollSize2(hasTablesListeners),
          tables: pairCollSize2(tablesListeners),
          tableIds: pairCollSize2(tableIdsListeners),
          hasTable: pairCollSize2(hasTableListeners),
          table: pairCollSize2(tableListeners),
          tableCellIds: pairCollSize2(tableCellIdsListeners),
          hasTableCell: pairCollSize2(hasTableCellListeners, collSize3),
          rowCount: pairCollSize2(rowCountListeners),
          rowIds: pairCollSize2(rowIdsListeners),
          sortedRowIds: pairCollSize2(sortedRowIdsListeners),
          hasRow: pairCollSize2(hasRowListeners, collSize3),
          row: pairCollSize2(rowListeners, collSize3),
          cellIds: pairCollSize2(cellIdsListeners, collSize3),
          hasCell: pairCollSize2(hasCellListeners, collSize4),
          cell: pairCollSize2(cellListeners, collSize4),
          invalidCell: pairCollSize2(invalidCellListeners, collSize4),
          hasValues: pairCollSize2(hasValuesListeners),
          values: pairCollSize2(valuesListeners),
          valueIds: pairCollSize2(valueIdsListeners),
          hasValue: pairCollSize2(hasValueListeners),
          value: pairCollSize2(valueListeners),
          invalidValue: pairCollSize2(invalidValueListeners),
          transaction:
            collSize2(startTransactionListeners) +
            pairCollSize2(finishTransactionListeners),
        }
      : {};

  const setInternalListeners = (
    preFinishTransaction: TransactionListener,
    postFinishTransaction: TransactionListener,
  ) => (internalListeners = [preFinishTransaction, postFinishTransaction]);

  const store: any = {
    getContent,

    getTables,
    getTableIds,
    getTable,
    getTableCellIds,
    getRowCount,
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
    hasTableCell,
    hasRow,
    hasCell,
    hasValues,
    hasValue,

    getTablesJson,
    getValuesJson,
    getJson,
    getTablesSchemaJson,
    getValuesSchemaJson,
    getSchemaJson,
    hasTablesSchema: () => hasTablesSchema,
    hasValuesSchema: () => hasValuesSchema,

    setContent,
    setTables,
    setTable,
    setRow,
    addRow,
    setPartialRow,
    setCell,
    setValues,
    setPartialValues,
    setValue,
    applyChanges,

    setTablesJson,
    setValuesJson,
    setJson,
    setTablesSchema,
    setValuesSchema,
    setSchema,

    delTables,
    delTable,
    delRow,
    delCell,
    delValues,
    delValue,
    delTablesSchema,
    delValuesSchema,
    delSchema,

    transaction,
    startTransaction,
    getTransactionChanges,
    getTransactionLog,
    finishTransaction,

    forEachTable,
    forEachTableCell,
    forEachRow,
    forEachCell,
    forEachValue,

    addSortedRowIdsListener,
    addStartTransactionListener,
    addWillFinishTransactionListener,
    addDidFinishTransactionListener,

    callListener,
    delListener,

    getListenerStats,

    // only used internally by other modules
    createStore,
    addListener,
    callListeners,
    setInternalListeners,
  };

  // and now for some gentle meta-programming
  objToArray(
    {
      [HAS + TABLES]: [0, hasTablesListeners, [], () => [hasTables()]],
      [TABLES]: [0, tablesListeners],
      [TABLE_IDS]: [0, tableIdsListeners],
      [HAS + TABLE]: [
        1,
        hasTableListeners,
        [getTableIds],
        (ids: Ids) => [hasTable(...(ids as [Id]))],
      ],
      [TABLE]: [1, tableListeners, [getTableIds]],
      [TABLE + CELL_IDS]: [1, tableCellIdsListeners, [getTableIds]],
      [HAS + TABLE + CELL]: [
        2,
        hasTableCellListeners,
        [getTableIds, getTableCellIds],
        (ids: Ids) => [hasTableCell(...(ids as [Id, Id]))],
      ],
      [ROW_COUNT]: [1, rowCountListeners, [getTableIds]],
      [ROW_IDS]: [1, rowIdsListeners, [getTableIds]],
      [HAS + ROW]: [
        2,
        hasRowListeners,
        [getTableIds, getRowIds],
        (ids: Ids) => [hasRow(...(ids as [Id, Id]))],
      ],
      [ROW]: [2, rowListeners, [getTableIds, getRowIds]],
      [CELL_IDS]: [2, cellIdsListeners, [getTableIds, getRowIds]],
      [HAS + CELL]: [
        3,
        hasCellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids: Ids) => [hasCell(...(ids as [Id, Id, Id]))],
      ],
      [CELL]: [
        3,
        cellListeners,
        [getTableIds, getRowIds, getCellIds],
        (ids: Ids) => pairNew(getCell(...(ids as [Id, Id, Id]))),
      ],
      InvalidCell: [3, invalidCellListeners],
      [HAS + VALUES]: [0, hasValuesListeners, [], () => [hasValues()]],
      [VALUES]: [0, valuesListeners],
      [VALUE_IDS]: [0, valueIdsListeners],
      [HAS + VALUE]: [
        1,
        hasValueListeners,
        [getValueIds],
        (ids: Ids) => [hasValue(...(ids as [Id]))],
      ],
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
          argumentCount > 0 ? slice(args, 0, argumentCount) : undefined,
          pathGetters,
          extraArgsGetter,
        );
    },
  );

  return objFreeze(store as Store);
};
