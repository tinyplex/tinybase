import {
  Cell,
  CellCallback,
  CellIdsListener,
  CellListener,
  CellSchema,
  GetCellChange,
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
  mapClone,
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
  isObject,
  objDel,
  objForEach,
  objFreeze,
  objFrozen,
  objHas,
  objIds,
  objIsEmpty,
} from './common/obj';
import {IdSet, IdSet2, IdSet3, IdSet4, setNew} from './common/set';
import {arrayFilter, arrayForEach, arrayHas} from './common/array';
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

type SchemaMap = IdMap<IdMap<CellSchema>>;
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

const getCellType = (cell: Cell | undefined): string | undefined => {
  const type = getTypeOf(cell);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cell as any))
    ? type
    : undefined;
};

const validate = (
  obj: IdObj<any> | undefined,
  validateChild: (child: any, id: Id) => boolean,
): boolean => {
  if (isUndefined(obj) || !isObject(obj) || objFrozen(obj)) {
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
  let nextRowId = 0;
  let transactions = 0;
  const changedTableIds: IdMap<IdAdded> = mapNew();
  const changedRowIds: IdMap<IdMap<IdAdded>> = mapNew();
  const changedCellIds: IdMap<IdMap<IdMap<IdAdded>>> = mapNew();
  const changedCells: IdMap<IdMap<IdMap<Cell | undefined>>> = mapNew();
  const schemaMap: SchemaMap = mapNew();
  const schemaDefaultRows: IdMap<Row> = mapNew();
  const tablesMap: TablesMap = mapNew();
  const tablesListeners: [IdSet, IdSet] = mapNewPair(setNew);
  const tableIdsListeners: [IdSet, IdSet] = mapNewPair(setNew);
  const tableListeners: [IdSet2, IdSet2] = mapNewPair();
  const rowIdsListeners: [IdSet2, IdSet2] = mapNewPair();
  const rowListeners: [IdSet3, IdSet3] = mapNewPair();
  const cellIdsListeners: [IdSet3, IdSet3] = mapNewPair();
  const cellListeners: [IdSet4, IdSet4] = mapNewPair();

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
    validate(tables, validateTable);

  const validateTable = (table: Table, tableId: Id): boolean =>
    (!hasSchema || collHas(schemaMap, tableId)) &&
    validate(table, (row: Row): boolean => validateRow(tableId, row));

  const validateRow = (tableId: Id, row: Row, skipDefaults?: 1): boolean =>
    validate(
      skipDefaults ? row : addDefaultsToRow(row, tableId),
      (cell: Cell, cellId: Id): boolean =>
        ifNotUndefined(
          getValidatedCell(tableId, cellId, cell),
          (validCell) => {
            row[cellId] = validCell;
            return true;
          },
          () => false,
        ) as boolean,
    );

  const getValidatedCell = (
    tableId: Id,
    cellId: Id,
    cell: Cell,
  ): Cell | undefined =>
    hasSchema
      ? ifNotUndefined(
          mapGet(mapGet(schemaMap, tableId), cellId),
          (cellSchema) =>
            getCellType(cell) != cellSchema[TYPE] ? cellSchema[DEFAULT] : cell,
        )
      : isUndefined(getCellType(cell))
      ? undefined
      : cell;

  const addDefaultsToRow = (row: Row, tableId: Id): Row => {
    ifNotUndefined(mapGet(schemaDefaultRows, tableId), (defaultRow) =>
      objForEach(defaultRow, (cell, cellId) => {
        if (!objHas(row, cellId)) {
          row[cellId] = cell;
        }
      }),
    );
    return row;
  };

  const setValidSchema = (schema: Schema): SchemaMap =>
    transformMap(
      schemaMap,
      schema,
      (_schema, tableId, tableSchema) => {
        const defaultRow: Row = {};
        transformMap(
          mapEnsure(schemaMap, tableId, mapNew()),
          tableSchema,
          (tableSchemaMap, cellId, cellSchema) => {
            mapSet(tableSchemaMap, cellId, cellSchema);
            ifNotUndefined(
              cellSchema[DEFAULT],
              (def) => (defaultRow[cellId] = def),
            );
          },
        );
        mapSet(schemaDefaultRows, tableId, defaultRow);
      },
      (_schema, tableId) => {
        mapSet(schemaMap, tableId);
        mapSet(schemaDefaultRows, tableId);
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
      mapEnsure(tablesMap, tableId, mapNew(), () =>
        tableIdsChanged(tableId, 1),
      ),
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
      mapEnsure(tableMap, rowId, mapNew(), () =>
        rowIdsChanged(tableId, rowId, 1),
      ),
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
      cellChanged(tableId, rowId, cellId, oldCell);
      mapSet(rowMap, cellId, newCell);
    }
  };

  const setValidRowTransaction = (tableId: Id, rowId: Id, row: Row): RowMap =>
    transaction(() =>
      setValidRow(tableId, getOrCreateTable(tableId), rowId, row),
    );

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
          addDefaultsToRow({[cellId]: validCell}, tableId),
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
    const defaultCell = mapGet(schemaDefaultRows, tableId)?.[cellId];
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
    idsChanged(mapEnsure(changedRowIds, tableId, mapNew()), rowId, added);

  const cellIdsChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    added: IdAdded,
  ): IdMap<IdAdded> | undefined =>
    idsChanged(
      mapEnsure(mapEnsure(changedCellIds, tableId, mapNew()), rowId, mapNew()),
      cellId,
      added,
    );

  const cellChanged = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    oldCell: Cell | undefined,
  ): Cell | undefined =>
    mapEnsure(
      mapEnsure(mapEnsure(changedCells, tableId, mapNew()), rowId, mapNew()),
      cellId,
      oldCell,
    );

  const getCellChange: GetCellChange = (tableId: Id, rowId: Id, cellId: Id) => {
    const changedRow = mapGet(mapGet(changedCells, tableId), rowId);
    const newCell = getCell(tableId, rowId, cellId);
    return collHas(changedRow, cellId)
      ? [true, mapGet(changedRow, cellId), newCell]
      : [false, newCell, newCell];
  };

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

    if (emptyIdListeners && emptyOtherListeners) {
      return;
    }

    const changes: [
      IdMap<IdAdded>,
      IdMap<IdMap<IdAdded>>,
      IdMap<IdMap<IdMap<IdAdded>>>,
      IdMap<IdMap<IdMap<Cell | undefined>>>,
    ] = mutator
      ? [
          mapClone(changedTableIds),
          mapClone(changedRowIds, mapClone),
          mapClone(changedCellIds, (table) => mapClone(table, mapClone)),
          mapClone(changedCells, (table) => mapClone(table, mapClone)),
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
          collForEach(cells, (oldCell, cellId) => {
            const newCell = getCell(tableId, rowId, cellId);
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
  };

  // --

  const getTables = (): Tables =>
    mapToObj(tablesMap, (tableMap) =>
      mapToObj<RowMap, Row>(tableMap, mapToObj),
    );

  const getTableIds = (): Ids => mapKeys(tablesMap);

  const getTable = (tableId: Id): Table =>
    mapToObj<RowMap, Row>(mapGet(tablesMap, tableId), mapToObj);

  const getRowIds = (tableId: Id): Ids => mapKeys(mapGet(tablesMap, tableId));

  const getRow = (tableId: Id, rowId: Id): Row =>
    mapToObj(mapGet(mapGet(tablesMap, tableId), rowId));

  const getCellIds = (tableId: Id, rowId: Id): Ids =>
    mapKeys(mapGet(mapGet(tablesMap, tableId), rowId));

  const getCell = (tableId: Id, rowId: Id, cellId: Id): Cell | undefined =>
    mapGet(mapGet(mapGet(tablesMap, tableId), rowId), cellId);

  const hasTable = (tableId: Id): boolean => collHas(tablesMap, tableId);

  const hasRow = (tableId: Id, rowId: Id): boolean =>
    collHas(mapGet(tablesMap, tableId), rowId);

  const hasCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
    collHas(mapGet(mapGet(tablesMap, tableId), rowId), cellId);

  const getJson = (): Json => jsonString(tablesMap);

  const getSchemaJson = (): Json => jsonString(schemaMap);

  const setTables = (tables: Tables): Store => {
    if (validateTables(tables)) {
      transaction(() => setValidTables(tables));
    }
    return store;
  };

  const setTable = (tableId: Id, table: Table): Store => {
    if (validateTable(table, tableId)) {
      transaction(() => setValidTable(tableId, table));
    }
    return store;
  };

  const setRow = (tableId: Id, rowId: Id, row: Row): Store => {
    if (validateRow(tableId, row)) {
      setValidRowTransaction(tableId, rowId, row);
    }
    return store;
  };

  const addRow = (tableId: Id, row: Row): Id | undefined => {
    let rowId: Id | undefined = undefined;
    if (validateRow(tableId, row)) {
      rowId = getNewRowId(mapGet(tablesMap, tableId));
      setValidRowTransaction(tableId, rowId, row);
    }
    return rowId;
  };

  const setPartialRow = (tableId: Id, rowId: Id, partialRow: Row): Store => {
    if (validateRow(tableId, partialRow, 1)) {
      transaction(() => {
        const table = getOrCreateTable(tableId);
        objForEach(partialRow, (cell, cellId) =>
          setCellIntoDefaultRow(tableId, table, rowId, cellId, cell),
        );
      });
    }
    return store;
  };

  const setCell = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: Cell | MapCell,
  ): Store => {
    ifNotUndefined(
      getValidatedCell(
        tableId,
        cellId,
        isFunction(cell) ? cell(getCell(tableId, rowId, cellId)) : cell,
      ),
      (validCell) =>
        transaction(() =>
          setCellIntoDefaultRow(
            tableId,
            getOrCreateTable(tableId),
            rowId,
            cellId,
            validCell,
          ),
        ),
    );
    return store;
  };

  const setJson = (json: Json): Store => {
    try {
      json === EMPTY_OBJECT ? delTables() : setTables(jsonParse(json));
    } catch {}
    return store;
  };

  const setSchema = (schema: Schema): Store => {
    if ((hasSchema = validateSchema(schema))) {
      setValidSchema(schema);
      if (!collIsEmpty(tablesMap)) {
        const tables = getTables();
        delTables();
        setTables(tables);
      }
    }
    return store;
  };

  const delTables = (): Store => {
    transaction(() => setValidTables({}));
    return store;
  };

  const delTable = (tableId: Id): Store => {
    if (collHas(tablesMap, tableId)) {
      transaction(() => delValidTable(tableId));
    }
    return store;
  };

  const delRow = (tableId: Id, rowId: Id): Store => {
    ifNotUndefined(mapGet(tablesMap, tableId), (tableMap) => {
      if (collHas(tableMap, rowId)) {
        transaction(() => delValidRow(tableId, tableMap, rowId));
      }
    });
    return store;
  };

  const delCell = (
    tableId: Id,
    rowId: Id,
    cellId: Id,
    forceDel?: boolean,
  ): Store => {
    ifNotUndefined(mapGet(tablesMap, tableId), (tableMap) =>
      ifNotUndefined(mapGet(tableMap, rowId), (rowMap) => {
        if (collHas(rowMap, cellId)) {
          transaction(() =>
            delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel),
          );
        }
      }),
    );
    return store;
  };

  const delSchema = (): Store => {
    setValidSchema({});
    hasSchema = false;
    return store;
  };

  const transaction = <Return>(actions: () => Return): Return => {
    if (transactions == -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore only occurs internally
      return;
    }
    transactions++;
    const result = actions();
    transactions--;

    if (transactions == 0) {
      transactions = 1;
      callListenersForChanges(1);
      transactions = -1;
      callListenersForChanges(0);
      transactions = 0;
      arrayForEach(
        [changedCells, changedTableIds, changedRowIds, changedCellIds],
        collClear,
      );
    }
    return result;
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

  const callListener = (listenerId: Id) => {
    callListenerImpl(listenerId, [getTableIds, getRowIds, getCellIds], (ids) =>
      isUndefined(ids[2])
        ? []
        : Array(2).fill(getCell(...(ids as [Id, Id, Id]))),
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

    callListener,
    delListener,

    getListenerStats,
  };

  return objFreeze(store);
};
