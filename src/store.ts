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
  SortedRowIdsListener,
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
  isFunction,
  isTypeStringOrBoolean,
  isUndefined,
  jsonParse,
  jsonString,
} from './common/other';
import {
  DEFAULT,
  EMPTY_OBJECT,
  EMPTY_STRING,
  NUMBER,
  TYPE,
} from './common/strings';
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
import {IdSetNode, getListenerFunctions} from './common/listeners';
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
import {getCellType, setOrDelCell} from './common/cell';
import {defaultSorter} from './common';
import {id} from './common';

type SchemaMap = IdMap2<CellSchema>;
type RowMap = IdMap<Cell>;
type TableMap = IdMap<RowMap>;
type TablesMap = IdMap<TableMap>;
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
  objForEach(obj, (child, id) => {
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
  let hasSchema: boolean;
  let cellsTouched: boolean;
  let nextRowId = 0;
  let transactions = 0;
  const changedTableIds: ChangedIdsMap = mapNew();
  const changedRowIds: ChangedIdsMap2 = mapNew();
  const changedCellIds: ChangedIdsMap3 = mapNew();
  const changedCells: IdMap3<[CellOrUndefined, CellOrUndefined]> = mapNew();
  const invalidCells: IdMap3<any[]> = mapNew();
  const schemaMap: SchemaMap = mapNew();
  const schemaRowCache: IdMap<[RowMap, IdSet]> = mapNew();
  const tablesMap: TablesMap = mapNew();
  const tablesListeners: Pair<IdSet2> = pairNewMap();
  const tableIdsListeners: Pair<IdSet2> = pairNewMap();
  const tableListeners: Pair<IdSet2> = pairNewMap();
  const rowIdsListeners: Pair<IdSet2> = pairNewMap();
  const sortedRowIdsListeners: Pair<IdSet3> = pairNewMap();
  const rowListeners: Pair<IdSet3> = pairNewMap();
  const cellIdsListeners: Pair<IdSet3> = pairNewMap();
  const cellListeners: Pair<IdSet4> = pairNewMap();
  const invalidCellListeners: Pair<IdSet4> = pairNewMap();
  const finishTransactionListeners: Pair<IdSet2> = pairNewMap();

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
    const rowId = EMPTY_STRING + nextRowId++;
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
      () => [false, ...pairNew(getCell(tableId, rowId, cellId))] as CellChange,
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

  const callListenersForChanges = (mutator: 0 | 1) => {
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
  ): Ids => {
    const cells: [Cell, Id][] = [];
    mapForEach(mapGet(tablesMap, id(tableId)), (rowId, row) =>
      arrayPush(cells, [
        isUndefined(cellId) ? rowId : mapGet(row, id(cellId)),
        rowId,
      ]),
    );
    return arrayMap(
      arraySlice(
        arraySort(
          cells,
          ([cell1], [cell2]) =>
            defaultSorter(cell1, cell2) * (descending ? -1 : 1),
        ),
        offset,
        isUndefined(limit) ? limit : offset + limit,
      ),
      ([, rowId]) => rowId,
    );
  };

  const getRow = (tableId: Id, rowId: Id): Row =>
    mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));

  const getCellIds = (tableId: Id, rowId: Id): Ids =>
    mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));

  const getCell = (tableId: Id, rowId: Id, cellId: Id): CellOrUndefined =>
    mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));

  const hasTables = (): boolean => !collIsEmpty(tablesMap);

  const hasTable = (tableId: Id): boolean => collHas(tablesMap, id(tableId));

  const hasRow = (tableId: Id, rowId: Id): boolean =>
    collHas(mapGet(tablesMap, id(tableId)), id(rowId));

  const hasCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
    collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));

  const getJson = (): Json => jsonString(tablesMap);

  const getSchemaJson = (): Json => jsonString(schemaMap);

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
        validateRow(id(tableId), id(rowId), row)
          ? setValidRow(
              id(tableId),
              getOrCreateTable(id(tableId)),
              id(rowId),
              row,
            )
          : 0,
      tableId,
      rowId,
    );

  const addRow = (tableId: Id, row: Row, forceId?: 1): Id | undefined =>
    transaction(() => {
      tableId = id(tableId);
      const isValidRow = validateRow(tableId, undefined, row);
      const rowId =
        isValidRow || forceId
          ? getNewRowId(mapGet(tablesMap, tableId))
          : undefined;
      if (isValidRow) {
        setValidRow(tableId, getOrCreateTable(tableId), rowId as Id, row);
      }
      return rowId;
    });

  const setPartialRow = (tableId: Id, rowId: Id, partialRow: Row): Store =>
    fluentTransaction(
      (tableId, rowId) => {
        if (validateRow(tableId, rowId, partialRow, 1)) {
          const table = getOrCreateTable(tableId);
          objForEach(partialRow, (cell, cellId) =>
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
                setOrDelCell(store, tableId, rowId, cellId, oldCell),
              ),
            ),
          );
          transactions = -1;
          cellsTouched = false;
        }

        callListeners(finishTransactionListeners[0], undefined, cellsTouched);
        callInvalidCellListeners(0);
        if (cellsTouched) {
          callListenersForChanges(0);
        }
        callListeners(finishTransactionListeners[1], undefined, cellsTouched);

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
    collForEach(mapGet(tablesMap, id(tableId)), (rowMap, rowId) =>
      rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback)),
    );

  const forEachCell = (
    tableId: Id,
    rowId: Id,
    cellCallback: CellCallback,
  ): void =>
    mapForEach(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), cellCallback);

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
    tableId: IdOrNull,
    listener: RowIdsListener,
    mutator?: boolean,
  ): Id => addListener(listener, rowIdsListeners[mutator ? 1 : 0], [tableId]);

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
    );
  };

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
      isUndefined(ids[2]) ? [] : pairNew(getCell(...(ids as [Id, Id, Id]))),
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
          tables: pairCollSize2(tablesListeners),
          tableIds: pairCollSize2(tableIdsListeners),
          table: pairCollSize2(tableListeners),
          rowIds: pairCollSize2(rowIdsListeners),
          sortedRowIds: pairCollSize2(sortedRowIdsListeners),
          row: pairCollSize2(rowListeners, collSize3),
          cellIds: pairCollSize2(cellIdsListeners, collSize3),
          cell: pairCollSize2(cellListeners, collSize4),
          invalidCell: pairCollSize2(invalidCellListeners, collSize4),
          transaction: pairCollSize2(finishTransactionListeners),
        }
      : {};

  const store: Store = {
    getTables,
    getTableIds,
    getTable,
    getRowIds,
    getSortedRowIds,
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
    addSortedRowIdsListener,
    addRowListener,
    addCellIdsListener,
    addCellListener,
    addInvalidCellListener,
    addWillFinishTransactionListener,
    addDidFinishTransactionListener,

    callListener,
    delListener,

    getListenerStats,

    createStore,
  } as Store;

  return objFreeze(store);
};
