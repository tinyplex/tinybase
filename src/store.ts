import {
  Cell,
  CellCallback,
  CellChange,
  CellIdsListener,
  CellListener,
  CellOrUndefined,
  CellSchema,
  ChangedCells,
  GetCellChange,
  InvalidCellListener,
  InvalidCells,
  MapCell,
  Row,
  RowCallback,
  RowIdsListener,
  RowListener,
  Schema,
  Store,
  StoreListenerStats,
  Table,
  TableCallback,
  TableIdsListener,
  TableListener,
  Tables,
  TablesListener,
  TransactionListener,
  createStore as createStoreDecl,
} from './store.d';
import {
  DEBUG,
  ifNotUndefined,
  isFiniteNumber,
  isFunction,
  isTypeStringOrBoolean,
  isUndefined,
  jsonParse,
  jsonString,
} from './common/other';
import {DEFAULT, EMPTY_OBJECT, NUMBER, TYPE, getTypeOf} from './common/strings';
import {Id, IdOrNull, Ids, Json} from './common.d';
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
  mapNew,
  mapNewPair,
  mapSet,
  mapToObj,
} from './common/map';
import {
  IdObj,
  IdObj2,
  isObject,
  objDel,
  objForEach,
  objFreeze,
  objFrozen,
  objHas,
  objIds,
  objIsEmpty,
} from './common/obj';
import {IdSet, IdSet2, IdSet3, IdSet4, setAdd, setNew} from './common/set';
import {
  arrayFilter,
  arrayForEach,
  arrayHas,
  arrayPair,
  arrayPush,
} from './common/array';
import {
  collClear,
  collForEach,
  collHas,
  collIsEmpty,
  collPairSize,
  collSize2,
  collSize3,
  collSize4,
} from './common/coll';
import {getListenerFunctions} from './common/listeners';

type SchemaMap = IdMap2<CellSchema>;
type RowMap = IdMap<Cell>;
type TableMap = IdMap<RowMap>;
type TablesMap = IdMap<TableMap>;
type IdAdded = 1 | -1;

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

const getCellType = (cell: CellOrUndefined): string | undefined => {
  const type = getTypeOf(cell);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cell as any))
    ? type
    : undefined;
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
  objForEach(obj, (child, id) => {
    if (!validateChild(child, id)) {
      objDel(obj, id);
    }
  });
  return !objIsEmpty(obj);
};

const idsChanged = (
  ids: IdMap<IdAdded>,
  id: Id,
  added: IdAdded,
): IdMap<IdAdded> | undefined =>
  mapSet(ids, id, mapGet(ids, id) == -added ? undefined : added);

export const createStore: typeof createStoreDecl = (): Store => {
  let hasSchema: boolean;
  let cellsTouched: boolean;
  let nextRowId = 0;
  let transactions = 0;
  const changedTableIds: IdMap<IdAdded> = mapNew();
  const changedRowIds: IdMap2<IdAdded> = mapNew();
  const changedCellIds: IdMap3<IdAdded> = mapNew();
  const changedCells: IdMap3<[CellOrUndefined, CellOrUndefined]> = mapNew();
  const invalidCells: IdMap3<any[]> = mapNew();
  const schemaMap: SchemaMap = mapNew();
  const schemaRowCache: IdMap<[RowMap, IdSet]> = mapNew();
  const tablesMap: TablesMap = mapNew();
  const tablesListeners: [IdSet, IdSet] = mapNewPair(setNew);
  const tableIdsListeners: [IdSet, IdSet] = mapNewPair(setNew);
  const tableListeners: [IdSet2, IdSet2] = mapNewPair();
  const rowIdsListeners: [IdSet2, IdSet2] = mapNewPair();
  const rowListeners: [IdSet3, IdSet3] = mapNewPair();
  const cellIdsListeners: [IdSet3, IdSet3] = mapNewPair();
  const cellListeners: [IdSet4, IdSet4] = mapNewPair();
  const invalidCellListeners: [IdSet4, IdSet4] = mapNewPair();
  const finishTransactionListeners: [IdSet, IdSet] = mapNewPair(setNew);

  const [addListener, callListeners, delListenerImpl, callListenerImpl] =
    getListenerFunctions(() => store);

  const validateSchema = (schema: Schema | undefined): boolean =>
    validate(schema, (tableSchema) =>
      validate(tableSchema, (cellSchema) => {
        if (
          !validate(cellSchema, (_child, id: Id) =>
            arrayHas([TYPE, DEFAULT], id),
          )
        ) {
          return false;
        }
        const type = cellSchema[TYPE];
        if (!isTypeStringOrBoolean(type) && type != NUMBER) {
          return false;
        }
        if (getCellType(cellSchema[DEFAULT]) != type) {
          objDel(cellSchema, DEFAULT);
        }
        return true;
      }),
    );

  const validateTables = (tables: Tables): boolean =>
    validate(tables, validateTable, cellInvalid);

  const validateTable = (table: Table, tableId: Id): boolean =>
    (!hasSchema ||
      collHas(schemaMap, tableId) ||
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
    hasSchema
      ? ifNotUndefined(
          mapGet(mapGet(schemaMap, tableId), cellId),
          (cellSchema) =>
            getCellType(cell) != cellSchema[TYPE]
              ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT])
              : cell,
          () => cellInvalid(tableId, rowId, cellId, cell),
        )
      : isUndefined(getCellType(cell))
      ? cellInvalid(tableId, rowId, cellId, cell)
      : cell;

  const addDefaultsToRow = (row: Row, tableId: Id, rowId?: Id): Row => {
    ifNotUndefined(
      mapGet(schemaRowCache, tableId),
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

  const setValidSchema = (schema: Schema): SchemaMap =>
    transformMap(
      schemaMap,
      schema,
      (_schema, tableId, tableSchema) => {
        const rowDefaulted = mapNew();
        const rowNonDefaulted = setNew();
        transformMap(
          mapEnsure<Id, IdMap<CellSchema>>(schemaMap, tableId, mapNew),
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
        mapSet(schemaRowCache, tableId, [rowDefaulted, rowNonDefaulted]);
      },
      (_schema, tableId) => {
        mapSet(schemaMap, tableId);
        mapSet(schemaRowCache, tableId);
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
    newRow: Row,
    forceDel?: boolean,
  ): RowMap =>
    transformMap(
      mapEnsure(tableMap, rowId, () => {
        rowIdsChanged(tableId, rowId, 1);
        return mapNew();
      }),
      newRow,
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
    newCell: Cell,
  ): void => {
    if (!collHas(rowMap, cellId)) {
      cellIdsChanged(tableId, rowId, cellId, 1);
    }
    const oldCell = mapGet(rowMap, cellId);
    if (newCell !== oldCell) {
      cellChanged(tableId, rowId, cellId, oldCell, newCell);
      mapSet(rowMap, cellId, newCell);
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

  const getNewRowId = (tableMap: TableMap | undefined): Id => {
    const rowId = '' + nextRowId++;
    if (!collHas(tableMap, rowId)) {
      return rowId;
    }
    return getNewRowId(tableMap);
  };

  const getOrCreateTable = (tableId: Id) =>
    mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});

  const delValidTable = (tableId: Id): TableMap => setValidTable(tableId, {});

  const delValidRow = (tableId: Id, tableMap: TableMap, rowId: Id): RowMap =>
    setValidRow(tableId, tableMap, rowId, {}, true);

  const delValidCell = (
    tableId: Id,
    table: TableMap,
    rowId: Id,
    row: RowMap,
    cellId: Id,
    forceDel?: boolean,
  ): void => {
    const defaultCell = mapGet(mapGet(schemaRowCache, tableId)?.[0], cellId);
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
      }
    }
  };

  const tableIdsChanged = (
    tableId: Id,
    added: IdAdded,
  ): IdMap<IdAdded> | undefined => idsChanged(changedTableIds, tableId, added);

  const rowIdsChanged = (
    tableId: Id,
    rowId: Id,
    added: IdAdded,
  ): IdMap<IdAdded> | undefined =>
    idsChanged(
      mapEnsure<Id, IdMap<IdAdded>>(changedRowIds, tableId, mapNew),
      rowId,
      added,
    );

  const cellIdsChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    added: IdAdded,
  ): IdMap<IdAdded> | undefined =>
    idsChanged(
      mapEnsure<Id, IdMap<IdAdded>>(
        mapEnsure<Id, IdMap2<IdAdded>>(changedCellIds, tableId, mapNew),
        rowId,
        mapNew,
      ),
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

  const getCellChange: GetCellChange = (tableId: Id, rowId: Id, cellId: Id) =>
    ifNotUndefined(
      mapGet(mapGet(mapGet(changedCells, tableId), rowId), cellId),
      ([oldCell, newCell]) => [true, oldCell, newCell],
      () =>
        [false, ...arrayPair(getCell(tableId, rowId, cellId))] as CellChange,
    ) as CellChange;

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

  const callListenersForChanges = (mutator: 0 | 1) => {
    const emptyIdListeners =
      collIsEmpty(cellIdsListeners[mutator]) &&
      collIsEmpty(rowIdsListeners[mutator]) &&
      collIsEmpty(tableIdsListeners[mutator]);
    const emptyOtherListeners =
      collIsEmpty(cellListeners[mutator]) &&
      collIsEmpty(rowListeners[mutator]) &&
      collIsEmpty(tableListeners[mutator]) &&
      collIsEmpty(tablesListeners[mutator]);
    if (!(emptyIdListeners && emptyOtherListeners)) {
      const changes: [
        IdMap<IdAdded>,
        IdMap2<IdAdded>,
        IdMap3<IdAdded>,
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
          collForEach(rowCellIds, (changedIds, rowId) => {
            if (!collIsEmpty(changedIds)) {
              callListeners(cellIdsListeners[mutator], [tableId, rowId]);
            }
          }),
        );
        collForEach(changes[1], (changedIds, tableId) => {
          if (!collIsEmpty(changedIds)) {
            callListeners(rowIdsListeners[mutator], [tableId]);
          }
        });
        if (!collIsEmpty(changes[0])) {
          callListeners(tableIdsListeners[mutator]);
        }
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
          callListeners(tablesListeners[mutator], [], getCellChange);
        }
      }
    }
  };

  const fluentTransaction = (actions?: () => unknown): Store => {
    transaction(actions);
    return store;
  };

  // --

  const getTables = (): Tables =>
    mapToObj<TableMap, Table>(tablesMap, (table) =>
      mapToObj<RowMap, Row>(table, mapToObj),
    );

  const getTableIds = (): Ids => mapKeys(tablesMap);

  const getTable = (tableId: Id): Table =>
    mapToObj<RowMap, Row>(mapGet(tablesMap, tableId), mapToObj);

  const getRowIds = (tableId: Id): Ids => mapKeys(mapGet(tablesMap, tableId));

  const getRow = (tableId: Id, rowId: Id): Row =>
    mapToObj(mapGet(mapGet(tablesMap, tableId), rowId));

  const getCellIds = (tableId: Id, rowId: Id): Ids =>
    mapKeys(mapGet(mapGet(tablesMap, tableId), rowId));

  const getCell = (tableId: Id, rowId: Id, cellId: Id): CellOrUndefined =>
    mapGet(mapGet(mapGet(tablesMap, tableId), rowId), cellId);

  const hasTables = (): boolean => !collIsEmpty(tablesMap);

  const hasTable = (tableId: Id): boolean => collHas(tablesMap, tableId);

  const hasRow = (tableId: Id, rowId: Id): boolean =>
    collHas(mapGet(tablesMap, tableId), rowId);

  const hasCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
    collHas(mapGet(mapGet(tablesMap, tableId), rowId), cellId);

  const getJson = (): Json => jsonString(tablesMap);

  const getSchemaJson = (): Json => jsonString(schemaMap);

  const setTables = (tables: Tables): Store =>
    fluentTransaction(() =>
      validateTables(tables) ? setValidTables(tables) : 0,
    );

  const setTable = (tableId: Id, table: Table): Store =>
    fluentTransaction(() =>
      validateTable(table, tableId) ? setValidTable(tableId, table) : 0,
    );

  const setRow = (tableId: Id, rowId: Id, row: Row): Store =>
    fluentTransaction(() =>
      validateRow(tableId, rowId, row)
        ? setValidRow(tableId, getOrCreateTable(tableId), rowId, row)
        : 0,
    );

  const addRow = (tableId: Id, row: Row): Id | undefined =>
    transaction(() => {
      let rowId: Id | undefined = undefined;
      if (validateRow(tableId, rowId, row)) {
        setValidRow(
          tableId,
          getOrCreateTable(tableId),
          (rowId = getNewRowId(mapGet(tablesMap, tableId))),
          row,
        );
      }
      return rowId;
    });

  const setPartialRow = (tableId: Id, rowId: Id, partialRow: Row): Store =>
    fluentTransaction(() => {
      if (validateRow(tableId, rowId, partialRow, 1)) {
        const table = getOrCreateTable(tableId);
        objForEach(partialRow, (cell, cellId) =>
          setCellIntoDefaultRow(tableId, table, rowId, cellId, cell),
        );
      }
    });

  const setCell = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: Cell | MapCell,
  ): Store =>
    fluentTransaction(() =>
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
    );

  const setJson = (json: Json): Store => {
    try {
      json === EMPTY_OBJECT ? delTables() : setTables(jsonParse(json));
    } catch {}
    return store;
  };

  const setSchema = (schema: Schema): Store =>
    fluentTransaction(() => {
      if ((hasSchema = validateSchema(schema))) {
        setValidSchema(schema);
        if (!collIsEmpty(tablesMap)) {
          const tables = getTables();
          delTables();
          setTables(tables);
        }
      }
    });

  const delTables = (): Store => fluentTransaction(() => setValidTables({}));

  const delTable = (tableId: Id): Store =>
    fluentTransaction(() =>
      collHas(tablesMap, tableId) ? delValidTable(tableId) : 0,
    );

  const delRow = (tableId: Id, rowId: Id): Store =>
    fluentTransaction(() =>
      ifNotUndefined(mapGet(tablesMap, tableId), (tableMap) =>
        collHas(tableMap, rowId) ? delValidRow(tableId, tableMap, rowId) : 0,
      ),
    );

  const delCell = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    forceDel?: boolean,
  ): Store =>
    fluentTransaction(() =>
      ifNotUndefined(mapGet(tablesMap, tableId), (tableMap) =>
        ifNotUndefined(mapGet(tableMap, rowId), (rowMap) =>
          collHas(rowMap, cellId)
            ? delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel)
            : 0,
        ),
      ),
    );

  const delSchema = (): Store =>
    fluentTransaction(() => {
      setValidSchema({});
      hasSchema = false;
    });

  const transaction = <Return>(
    actions?: () => Return,
    doRollback?: (
      changedCells: ChangedCells,
      invalidCells: InvalidCells,
    ) => boolean,
  ): Return => {
    if (transactions == -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore only occurs internally
      return;
    }
    startTransaction();
    const result = actions?.();
    finishTransaction(doRollback);
    return result as Return;
  };

  const startTransaction = (): Store => {
    transactions++;
    return store;
  };

  const finishTransaction = (
    doRollback?: (
      changedCells: ChangedCells,
      invalidCells: InvalidCells,
    ) => boolean,
  ): Store => {
    if (transactions > 0) {
      transactions--;

      if (transactions == 0) {
        cellsTouched = !collIsEmpty(changedCells);
        transactions = 1;
        callInvalidCellListeners(1);
        if (cellsTouched) {
          callListenersForChanges(1);
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
          )
        ) {
          transactions = 1;
          collForEach(changedCells, (table, tableId) =>
            collForEach(table, (row, rowId) =>
              collForEach(row, ([oldCell], cellId) =>
                isUndefined(oldCell)
                  ? delCell(tableId, rowId, cellId, true)
                  : setCell(tableId, rowId, cellId, oldCell),
              ),
            ),
          );
          transactions = -1;
          cellsTouched = false;
        }

        callListeners(finishTransactionListeners[0], [], cellsTouched);
        callInvalidCellListeners(0);
        if (cellsTouched) {
          callListenersForChanges(0);
        }
        callListeners(finishTransactionListeners[1], [], cellsTouched);

        transactions = 0;
        arrayForEach(
          [
            changedCells,
            invalidCells,
            changedTableIds,
            changedRowIds,
            changedCellIds,
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
    collForEach(mapGet(tablesMap, tableId), (rowMap, rowId) =>
      rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback)),
    );

  const forEachCell = (
    tableId: Id,
    rowId: Id,
    cellCallback: CellCallback,
  ): void =>
    mapForEach(mapGet(mapGet(tablesMap, tableId), rowId), cellCallback);

  const addTablesListener = (listener: TablesListener, mutator?: boolean): Id =>
    addListener(listener, tablesListeners[mutator ? 1 : 0]);

  const addTableIdsListener = (
    listener: TableIdsListener,
    mutator?: boolean,
  ): Id => addListener(listener, tableIdsListeners[mutator ? 1 : 0]);

  const addTableListener = (
    tableId: IdOrNull,
    listener: TableListener,
    mutator?: boolean,
  ): Id => addListener(listener, tableListeners[mutator ? 1 : 0], [tableId]);

  const addRowIdsListener = (
    tableId: Id,
    listener: RowIdsListener,
    mutator?: boolean,
  ): Id => addListener(listener, rowIdsListeners[mutator ? 1 : 0], [tableId]);

  const addRowListener = (
    tableId: IdOrNull,
    rowId: IdOrNull,
    listener: RowListener,
    mutator?: boolean,
  ): Id =>
    addListener(listener, rowListeners[mutator ? 1 : 0], [tableId, rowId]);

  const addCellIdsListener = (
    tableId: IdOrNull,
    rowId: IdOrNull,
    listener: CellIdsListener,
    mutator?: boolean,
  ): Id =>
    addListener(listener, cellIdsListeners[mutator ? 1 : 0], [tableId, rowId]);

  const addCellListener = (
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: CellListener,
    mutator?: boolean,
  ): Id =>
    addListener(listener, cellListeners[mutator ? 1 : 0], [
      tableId,
      rowId,
      cellId,
    ]);

  const addInvalidCellListener = (
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: InvalidCellListener,
    mutator?: boolean,
  ): Id =>
    addListener(listener, invalidCellListeners[mutator ? 1 : 0], [
      tableId,
      rowId,
      cellId,
    ]);

  const addWillFinishTransactionListener = (
    listener: TransactionListener,
  ): Id => addListener(listener, finishTransactionListeners[0]);

  const addDidFinishTransactionListener = (listener: TransactionListener): Id =>
    addListener(listener, finishTransactionListeners[1]);

  const callListener = (listenerId: Id) => {
    callListenerImpl(listenerId, [getTableIds, getRowIds, getCellIds], (ids) =>
      isUndefined(ids[2]) ? [] : arrayPair(getCell(...(ids as [Id, Id, Id]))),
    );
    return store;
  };

  const delListener = (listenerId: Id): Store => {
    delListenerImpl(listenerId);
    return store;
  };

  const getListenerStats = (): StoreListenerStats =>
    DEBUG
      ? {
          tables: collPairSize(tablesListeners),
          tableIds: collPairSize(tableIdsListeners),
          table: collPairSize(tableListeners, collSize2),
          rowIds: collPairSize(rowIdsListeners, collSize2),
          row: collPairSize(rowListeners, collSize3),
          cellIds: collPairSize(cellIdsListeners, collSize3),
          cell: collPairSize(cellListeners, collSize4),
          invalidCell: collPairSize(invalidCellListeners, collSize4),
          transaction: collPairSize(finishTransactionListeners),
        }
      : {};

  const store: Store = {
    getTables,
    getTableIds,
    getTable,
    getRowIds,
    getRow,
    getCellIds,
    getCell,

    hasTables,
    hasTable,
    hasRow,
    hasCell,

    getJson,
    getSchemaJson,

    setTables,
    setTable,
    setRow,
    addRow,
    setPartialRow,
    setCell,

    setJson,
    setSchema,

    delTables,
    delTable,
    delRow,
    delCell,
    delSchema,

    transaction,
    startTransaction,
    finishTransaction,

    forEachTable,
    forEachRow,
    forEachCell,

    addTablesListener,
    addTableIdsListener,
    addTableListener,
    addRowIdsListener,
    addRowListener,
    addCellIdsListener,
    addCellListener,
    addInvalidCellListener,
    addWillFinishTransactionListener,
    addDidFinishTransactionListener,

    callListener,
    delListener,

    getListenerStats,
  };

  return objFreeze(store);
};
