import type {Id, IdOrNull, Ids} from '../@types/common/index.d.ts';
import type {
  Aggregate,
  AggregateAdd,
  AggregateRemove,
  AggregateReplace,
  GetTableCell,
  Group,
  Having,
  Join,
  Param,
  ParamValue,
  ParamValueListener,
  ParamValues,
  ParamValuesListener,
  Queries,
  QueriesListenerStats,
  QueryIdsListener,
  ResultTableCallback,
  Select,
  Where,
  createQueries as createQueriesDecl,
} from '../@types/queries/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  ChangedCell,
  GetCell,
  GetCellChange,
  Row,
  Store,
} from '../@types/store/index.d.ts';
import {getAggregateValue, numericAggregators} from '../common/aggregators.ts';
import {
  arrayEvery,
  arrayForEach,
  arrayIsEmpty,
  arrayPush,
} from '../common/array.ts';
import {getCellOrValueType} from '../common/cell.ts';
import {
  collClear,
  collDel,
  collForEach,
  collHas,
  collIsEmpty,
  collSize,
  collValues,
} from '../common/coll.ts';
import {getCreateFunction, getDefinableFunctions} from '../common/definable.ts';
import {
  IdMap,
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
  visitTree,
} from '../common/map.ts';
import {objFreeze, objGet, objIsEmpty, objMap} from '../common/obj.ts';
import {
  getUndefined,
  ifNotUndefined,
  isFunction,
  isTrue,
  isUndefined,
  size,
  slice,
} from '../common/other.ts';
import {IdSet, IdSet2, setAdd, setNew} from '../common/set.ts';
import {
  ADD,
  CELL,
  CELL_IDS,
  EMPTY_STRING,
  GET,
  LISTENER,
  RESULT,
  ROW,
  ROW_COUNT,
  ROW_IDS,
  SORTED_ROW_IDS,
  TABLE,
} from '../common/strings.ts';
import {ProtectedStore} from '../index.ts';

const PARAMS_TABLE = '_';
const PARAM_LISTENER_PREFIX = 'p';

type Build = (builders: {
  select: Select;
  join: Join;
  where: Where;
  group: Group;
  having: Having;
  param: Param;
}) => void;

type SelectClause = (getTableCell: GetTableCell, rowId: Id) => CellOrUndefined;
type JoinClause = [
  realTableId: Id,
  fromJoinAlias: Id | undefined,
  on: ((getCell: GetCell, rowId: Id) => Id) | undefined,
  nextTableIds: Ids,
  remoteIdPairs: IdMap<[Id, Store, Id]>,
  sourceStore: Store,
];
type WhereClause = (getTableCell: GetTableCell) => boolean;
type GroupClause = [Id, Aggregators];
type HavingClause = (getSelectedOrGroupedCell: GetCell) => boolean;

type Aggregators = [
  Aggregate,
  AggregateAdd?,
  AggregateRemove?,
  AggregateReplace?,
];

type ResultListenerStat =
  | 'table'
  | 'tableCellIds'
  | 'rowCount'
  | 'rowIds'
  | 'sortedRowIds'
  | 'row'
  | 'cellIds'
  | 'cell';

type RoutedResultListener = [ResultListenerStat, IdMap<[Store, Id]>, Id?];

export const createQueries = getCreateFunction((store: Store): Queries => {
  const createStore = (store as ProtectedStore)._[0];
  const preStore = createStore();
  const paramStore = createStore();
  const resultStore = createStore();
  const resultStores: IdMap<Store> = mapNew();
  const redefiningQueryIds: IdSet = setNew();
  const routedResultListeners: Map<Id, RoutedResultListener> = mapNew();
  const routedResultListenerIds: IdSet2 = mapNew();
  const resultListenerStats: {[stat in ResultListenerStat]: number} = {
    table: 0,
    tableCellIds: 0,
    rowCount: 0,
    rowIds: 0,
    sortedRowIds: 0,
    row: 0,
    cellIds: 0,
    cell: 0,
  };
  const preStoreListenerIds: Map<Id, Map<Store, IdSet>> = mapNew();
  const sourceStoreListenerIds: Map<Id, Map<Store, IdSet>> = mapNew();

  const {
    _: [, addListener, callListeners],
    delListener: delListenerImpl,
  } = resultStore as ProtectedStore;
  const [
    getStore,
    getQueryIds,
    forEachQuery,
    hasQuery,
    getTableId,
    getQueryArgs,
    setQueryArgs,
    setDefinition,
    ,
    delDefinition,
    addQueryIdsListenerImpl,
    destroyImpl,
  ] = getDefinableFunctions<[Build, Id, 0 | 1], undefined>(
    store,
    () => [] as any,
    getUndefined,
    addListener,
    callListeners,
  );

  const getResultStore = (queryId: Id): Store =>
    mapEnsure(resultStores, queryId, createStore);

  const addPreStoreListener = (
    preStore: Store,
    queryId: Id,
    ...listenerIds: Ids
  ) =>
    arrayForEach(listenerIds, (listenerId) =>
      setAdd(
        mapEnsure(
          mapEnsure<Id, Map<Store, IdSet>>(
            preStoreListenerIds,
            queryId,
            mapNew,
          ),
          preStore,
          setNew,
        ),
        listenerId,
      ),
    );

  const resetPreStores = (queryId: Id) => {
    ifNotUndefined(
      mapGet(preStoreListenerIds, queryId),
      (queryPreStoreListenerIds) => {
        mapForEach(queryPreStoreListenerIds, (preStore, listenerIds) =>
          collForEach(listenerIds, (listenerId) =>
            preStore.delListener(listenerId),
          ),
        );
        collClear(queryPreStoreListenerIds);
      },
    );
    arrayForEach([getResultStore(queryId), preStore], (store) =>
      store.delTable(queryId),
    );
  };

  const addSourceStoreListeners = (
    sourceStore: Store,
    queryId: Id,
    andCall: 0 | 1,
    ...listenerIds: Ids
  ): Ids => {
    const listenerIdSet = mapEnsure(
      mapEnsure<Id, Map<Store, IdSet>>(sourceStoreListenerIds, queryId, mapNew),
      sourceStore,
      setNew,
    );
    arrayForEach(listenerIds, (listenerId) => {
      setAdd(listenerIdSet, listenerId);
      if (andCall) {
        sourceStore.callListener(listenerId);
      }
    });
    return listenerIds;
  };

  const delSourceStoreListeners = (
    queryId: Id,
    sourceStore: Store,
    listenerId: Id,
  ): void =>
    ifNotUndefined(
      mapGet(mapGet(sourceStoreListenerIds, queryId), sourceStore),
      (allListenerIds) => {
        sourceStore.delListener(listenerId);
        collDel(allListenerIds, listenerId);
        if (collIsEmpty(allListenerIds)) {
          mapSet(mapGet(sourceStoreListenerIds, queryId), sourceStore);
        }
      },
    );

  const resetSourceStores = (queryId: Id): void =>
    ifNotUndefined(mapGet(sourceStoreListenerIds, queryId), (queryStoreIds) => {
      mapForEach(queryStoreIds, (sourceStore, listenerIds) =>
        collForEach(listenerIds, (listenerId) =>
          sourceStore.delListener(listenerId),
        ),
      );
      collClear(queryStoreIds);
    });

  const synchronizeTransactions = (
    queryId: Id,
    fromStore: Store,
    toStore: Store,
  ) =>
    addPreStoreListener(
      fromStore,
      queryId,
      fromStore.addStartTransactionListener(toStore.startTransaction),
      fromStore.addDidFinishTransactionListener(() =>
        toStore.finishTransaction(),
      ),
    );

  const setOrDelParamValues = (queryId: Id, paramValues: ParamValues) =>
    (objIsEmpty(paramValues) ? paramStore.delRow : paramStore.setRow)(
      PARAMS_TABLE,
      queryId,
      {...paramValues},
    );

  const addRoutedResultListener = (
    stat: ResultListenerStat,
    queryId: IdOrNull,
    addStoreListener: (store: Store, queryId: Id) => Id,
  ): Id => {
    const listenerId = addListener(
      getUndefined as any,
      routedResultListenerIds,
    );
    const storeListenerIds: IdMap<[Store, Id]> = mapNew();
    const syncStoreListeners = () => {
      const queryIds = queryId == null ? getQueryIds() : [queryId];
      arrayForEach(queryIds, (queryId) =>
        collHas(storeListenerIds, queryId)
          ? 0
          : mapSet(storeListenerIds, queryId, [
              getResultStore(queryId),
              addStoreListener(getResultStore(queryId), queryId),
            ]),
      );
      mapForEach(storeListenerIds, (storeQueryId, [store, storeListenerId]) =>
        (queryId == null && hasQuery(storeQueryId)) || storeQueryId == queryId
          ? 0
          : (() => {
              store.delListener(storeListenerId);
              mapSet(storeListenerIds, storeQueryId);
            })(),
      );
    };
    syncStoreListeners();
    mapSet(routedResultListeners, listenerId, [
      stat,
      storeListenerIds,
      queryId == null
        ? (addQueryIdsListenerImpl(syncStoreListeners) as unknown as Id)
        : undefined,
    ]);
    resultListenerStats[stat]++;
    return listenerId;
  };

  const setQueryDefinition = (
    queryId: Id,
    tableIdOrAsQuery: Id | true,
    tableIdOrBuild: Id | Build,
    buildOrParamValues?: Build | ParamValues,
    paramValuesIfSourceIsQuery: ParamValues = {},
  ): Queries => {
    const [tableId, build, sourceIsQuery, paramValues] = isTrue(
      tableIdOrAsQuery,
    )
      ? [
          tableIdOrBuild as Id,
          buildOrParamValues as Build,
          1 as const,
          paramValuesIfSourceIsQuery,
        ]
      : [
          tableIdOrAsQuery,
          tableIdOrBuild as Build,
          0 as const,
          (buildOrParamValues as ParamValues | undefined) ?? {},
        ];
    ifNotUndefined(getQueryArgs(queryId), ([, listenerId]) =>
      paramStore.delListener(listenerId),
    );
    setDefinition(queryId, tableId);
    setQueryArgs(queryId, [
      build,
      paramStore.addRowListener(PARAMS_TABLE, queryId, () =>
        setQueryDefinitionImpl(queryId),
      ),
      sourceIsQuery,
    ]);
    setOrDelParamValues(queryId, paramValues);
    setQueryDefinitionImpl(queryId);
    return queries;
  };

  const setQueryDefinitionImpl = (queryId: Id): Queries =>
    getResultStore(queryId).transaction(
      () =>
        ifNotUndefined(getQueryArgs(queryId), ([build, , sourceIsQuery]) => {
          const tableId = getTableId(queryId);
          const rootStore = sourceIsQuery ? getResultStore(tableId) : store;
          const resultStore = getResultStore(queryId);
          const paramValues = getParamValues(queryId);

          setAdd(redefiningQueryIds, queryId);
          resetPreStores(queryId);
          resetSourceStores(queryId);

          const selectEntries: [Id, SelectClause][] = [];
          const joinEntries: [Id | undefined, JoinClause][] = [
            [
              undefined,
              [tableId, undefined, undefined, [], mapNew(), rootStore],
            ],
          ];
          const wheres: WhereClause[] = [];
          const groupEntries: [Id, GroupClause][] = [];
          const havings: HavingClause[] = [];

          const param = (paramId: Id) => objGet(paramValues, paramId);

          const select = (
            arg1:
              | true
              | Id
              | ((getTableCell: GetTableCell, rowId: Id) => CellOrUndefined),
            arg2?: Id,
            arg3?: Id,
          ) => {
            const joinedTableId = isTrue(arg1) ? arg2 : arg1;
            const joinedCellId = isTrue(arg1) ? arg3 : arg2;
            const selectEntry: [Id, SelectClause] = isFunction(arg1)
              ? [size(selectEntries) + EMPTY_STRING, arg1]
              : isUndefined(joinedCellId)
                ? [arg1 as Id, (getTableCell) => getTableCell(arg1 as Id)]
                : [
                    joinedCellId,
                    (getTableCell) =>
                      isTrue(arg1)
                        ? getTableCell(true, joinedTableId as Id, joinedCellId)
                        : getTableCell(joinedTableId as Id, joinedCellId),
                  ];
            arrayPush(selectEntries, selectEntry);
            return {
              as: (selectedCellId: Id) => (selectEntry[0] = selectedCellId),
            };
          };

          const join = (
            arg1: true | Id,
            arg2?: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
            arg3?: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
            arg4?: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
          ) => {
            const joinedTableId = (isTrue(arg1) ? arg2 : arg1) as Id;
            const [fromJoinAlias, onArg] = isTrue(arg1)
              ? isUndefined(arg4) || isFunction(arg3)
                ? [undefined, arg3]
                : [arg3, arg4]
              : isUndefined(arg3) || isFunction(arg2)
                ? [undefined, arg2]
                : [arg2, arg3];
            const joinEntry: [Id, JoinClause] = [
              joinedTableId,
              [
                joinedTableId,
                fromJoinAlias,
                isFunction(onArg) ? onArg : (getCell) => getCell(onArg as Id),
                [],
                mapNew(),
                isTrue(arg1) ? getResultStore(joinedTableId) : store,
              ] as JoinClause,
            ];
            arrayPush(joinEntries, joinEntry);
            return {as: (joinedTableId: Id) => (joinEntry[0] = joinedTableId)};
          };

          const where = (
            arg1: true | Id | ((getTableCell: GetTableCell) => boolean),
            arg2?: Id | Cell,
            arg3?: Id | Cell,
            arg4?: Cell,
          ) =>
            arrayPush(
              wheres,
              isFunction(arg1)
                ? arg1
                : isTrue(arg1)
                  ? (getTableCell) =>
                      getTableCell(true, arg2 as Id, arg3 as Id) === arg4
                  : isUndefined(arg3)
                    ? (getTableCell) => getTableCell(arg1) === arg2
                    : (getTableCell) => getTableCell(arg1, arg2 as Id) === arg3,
            );

          const group = (
            selectedCellId: Id,
            aggregate: 'count' | 'sum' | 'avg' | 'min' | 'max' | Aggregate,
            aggregateAdd?: AggregateAdd,
            aggregateRemove?: AggregateRemove,
            aggregateReplace?: AggregateReplace,
          ) => {
            const groupEntry: [Id, GroupClause] = [
              selectedCellId,
              [
                selectedCellId,
                isFunction(aggregate)
                  ? [aggregate, aggregateAdd, aggregateRemove, aggregateReplace]
                  : ((mapGet(
                      numericAggregators,
                      aggregate as Id,
                    ) as Aggregators) ?? [(_cells, length) => length]),
              ],
            ];
            arrayPush(groupEntries, groupEntry);
            return {as: (groupedCellId: Id) => (groupEntry[0] = groupedCellId)};
          };

          const having = (
            arg1: Id | ((getSelectedOrGroupedCell: GetCell) => boolean),
            arg2?: Cell,
          ) =>
            arrayPush(
              havings,
              isFunction(arg1)
                ? arg1
                : (getSelectedOrGroupedCell) =>
                    getSelectedOrGroupedCell(arg1) === arg2,
            );

          build({select, join, where, group, having, param});

          const selects: IdMap<SelectClause> = mapNew(selectEntries);
          if (collIsEmpty(selects)) {
            collDel(redefiningQueryIds, queryId);
            return queries;
          }
          const joins: Map<Id | undefined, JoinClause> = mapNew(joinEntries);
          mapForEach(joins, (joinAlias, [, fromJoinAlias]) =>
            ifNotUndefined(
              mapGet(joins, fromJoinAlias),
              ({3: toJoinAliases}) =>
                isUndefined(joinAlias)
                  ? 0
                  : arrayPush(toJoinAliases, joinAlias),
            ),
          );
          const groups: IdMap<GroupClause> = mapNew(groupEntries);

          let selectJoinWhereStore = preStore;

          // GROUP & HAVING

          if (collIsEmpty(groups) && arrayIsEmpty(havings)) {
            selectJoinWhereStore = resultStore;
          } else {
            synchronizeTransactions(queryId, selectJoinWhereStore, resultStore);

            const groupedSelectedCellIds: IdMap<Set<[Id, Aggregators]>> =
              mapNew();
            mapForEach(groups, (groupedCellId, [selectedCellId, aggregators]) =>
              setAdd(
                mapEnsure(groupedSelectedCellIds, selectedCellId, setNew),
                [groupedCellId, aggregators],
              ),
            );

            const groupBySelectedCellIds: IdSet = setNew();
            mapForEach(selects, (selectedCellId) =>
              collHas(groupedSelectedCellIds, selectedCellId)
                ? 0
                : setAdd(groupBySelectedCellIds, selectedCellId),
            );

            const tree = mapNew<Cell, any>();

            const writeGroupRow = (
              leaf: [IdMap2<Cell>, IdSet, Id, Row],
              changedGroupedSelectedCells: IdMap<[Cell]>,
              selectedRowId: Id,
              forceRemove?: 1,
            ) =>
              ifNotUndefined(
                leaf,
                ([selectedCells, selectedRowIds, groupRowId, groupRow]) => {
                  mapForEach(
                    changedGroupedSelectedCells,
                    (selectedCellId, [newCell]) => {
                      const selectedCell = mapEnsure(
                        selectedCells,
                        selectedCellId,
                        mapNew,
                      );
                      const oldLeafCell = mapGet(selectedCell, selectedRowId);
                      const newLeafCell = forceRemove ? undefined : newCell;
                      if (oldLeafCell !== newLeafCell) {
                        const oldNewSet = setNew([[oldLeafCell, newLeafCell]]);
                        const oldLength = collSize(selectedCell);
                        mapSet(selectedCell, selectedRowId, newLeafCell);
                        collForEach(
                          mapGet(groupedSelectedCellIds, selectedCellId),
                          ([groupedCellId, aggregators]) => {
                            const aggregateValue = getAggregateValue(
                              groupRow[groupedCellId],
                              oldLength,
                              selectedCell as IdMap<Cell>,
                              oldNewSet as Set<ChangedCell>,
                              aggregators,
                            );
                            groupRow[groupedCellId] = (
                              isUndefined(getCellOrValueType(aggregateValue))
                                ? undefined
                                : aggregateValue
                            ) as Cell;
                          },
                        );
                      }
                    },
                  );
                  if (
                    collIsEmpty(selectedRowIds) ||
                    !arrayEvery(havings, (having) =>
                      having((cellId) => groupRow[cellId] as any),
                    )
                  ) {
                    resultStore.delRow(queryId, groupRowId);
                  } else if (isUndefined(groupRowId)) {
                    leaf[2] = resultStore.addRow(queryId, groupRow) as Id;
                  } else {
                    resultStore.setRow(queryId, groupRowId, groupRow);
                  }
                },
              );

            addPreStoreListener(
              selectJoinWhereStore,
              queryId,
              selectJoinWhereStore.addRowListener(
                queryId,
                null,
                (_store, _tableId, selectedRowId, getCellChange) => {
                  const oldPath: CellOrUndefined[] = [];
                  const newPath: CellOrUndefined[] = [];
                  const changedGroupedSelectedCells: IdMap<[Cell]> = mapNew();
                  const rowExists = selectJoinWhereStore.hasRow(
                    queryId,
                    selectedRowId,
                  );
                  let changedLeaf = !rowExists;

                  collForEach(groupBySelectedCellIds, (selectedCellId) => {
                    const [changed, oldCell, newCell] = (
                      getCellChange as GetCellChange
                    )(queryId, selectedRowId, selectedCellId);
                    arrayPush(oldPath, oldCell);
                    arrayPush(newPath, newCell);
                    changedLeaf ||= changed;
                  });
                  mapForEach(groupedSelectedCellIds, (selectedCellId) => {
                    const [changed, , newCell] = (
                      getCellChange as GetCellChange
                    )(queryId, selectedRowId, selectedCellId);
                    if (changedLeaf || changed) {
                      mapSet(changedGroupedSelectedCells, selectedCellId, [
                        newCell,
                      ]);
                    }
                  });

                  if (changedLeaf) {
                    writeGroupRow(
                      visitTree(
                        tree,
                        oldPath,
                        undefined,
                        ([, selectedRowIds]) => {
                          collDel(selectedRowIds, selectedRowId);
                          return collIsEmpty(selectedRowIds) as any;
                        },
                      ),
                      changedGroupedSelectedCells,
                      selectedRowId,
                      1,
                    );
                  }

                  if (rowExists) {
                    writeGroupRow(
                      visitTree(
                        tree,
                        newPath,
                        () => {
                          const groupRow: Row = {};
                          collForEach(
                            groupBySelectedCellIds,
                            (selectedCellId) =>
                              (groupRow[selectedCellId] =
                                selectJoinWhereStore.getCell(
                                  queryId,
                                  selectedRowId,
                                  selectedCellId,
                                ) as Cell),
                          );
                          return [mapNew(), setNew(), undefined, groupRow];
                        },
                        ([, selectedRowIds]) => {
                          setAdd(selectedRowIds, selectedRowId);
                        },
                      ),
                      changedGroupedSelectedCells,
                      selectedRowId,
                    );
                  }
                },
              ),
            );
          }

          // SELECT & JOIN & WHERE

          synchronizeTransactions(queryId, rootStore, selectJoinWhereStore);

          const writeSelectRow = (rootRowId: Id) => {
            const getJoinCell = (arg1: Id | true, arg2?: Id, arg3?: Id) => {
              const joinedTableId = isTrue(arg1) ? arg2 : arg1;
              const joinedCellId = isTrue(arg1) ? arg3 : arg2;
              if (isUndefined(joinedCellId)) {
                return rootStore.getCell(tableId, rootRowId, arg1 as Id);
              }
              if (joinedTableId === tableId && !isTrue(arg1)) {
                return rootStore.getCell(tableId, rootRowId, joinedCellId);
              }
              const join = mapGet(joins, joinedTableId as Id) as JoinClause;
              return isUndefined(join)
                ? undefined
                : join[5].getCell(
                    join[0],
                    mapGet(join[4], rootRowId)?.[0] as Id,
                    joinedCellId,
                  );
            };
            selectJoinWhereStore.transaction(() =>
              arrayEvery(wheres, (where) => where(getJoinCell))
                ? mapForEach(selects, (asCellId, tableCellGetter) =>
                    (selectJoinWhereStore as ProtectedStore)._[5](
                      queryId,
                      rootRowId,
                      asCellId,
                      tableCellGetter(getJoinCell, rootRowId),
                    ),
                  )
                : selectJoinWhereStore.delRow(queryId, rootRowId),
            );
          };

          const listenToTable = (
            rootRowId: Id,
            sourceStore: Store,
            tableId: Id,
            rowId: Id,
            toJoinAliases: Ids,
          ) => {
            const getCell = (cellId: Id) =>
              sourceStore.getCell(tableId, rowId, cellId);
            arrayForEach(toJoinAliases, (joinAlias) => {
              const [
                realJoinedTableId,
                ,
                on,
                nextJoinAliases,
                remoteIdPairs,
                remoteSourceStore,
              ] = mapGet(joins, joinAlias) as JoinClause;
              const remoteRowId = on?.(getCell as any, rootRowId);
              const previousRemote = mapGet(remoteIdPairs, rootRowId);
              const previousRemoteRowId = previousRemote?.[0];
              if (remoteRowId != previousRemoteRowId) {
                ifNotUndefined(
                  previousRemote,
                  ([, previousRemoteSourceStore, previousRemoteListenerId]) =>
                    delSourceStoreListeners(
                      queryId,
                      previousRemoteSourceStore,
                      previousRemoteListenerId,
                    ),
                );
                mapSet(
                  remoteIdPairs,
                  rootRowId,
                  isUndefined(remoteRowId)
                    ? undefined
                    : [
                        remoteRowId,
                        remoteSourceStore,
                        ...addSourceStoreListeners(
                          remoteSourceStore,
                          queryId,
                          1,
                          remoteSourceStore.addRowListener(
                            realJoinedTableId,
                            remoteRowId,
                            () =>
                              listenToTable(
                                rootRowId,
                                remoteSourceStore,
                                realJoinedTableId,
                                remoteRowId,
                                nextJoinAliases,
                              ),
                          ),
                        ),
                      ],
                );
              }
            });
            writeSelectRow(rootRowId);
          };

          const {3: toJoinAliases} = mapGet(joins, undefined) as JoinClause;
          const rootRowChanged = (
            sourceStore: Store,
            _tableId: Id,
            rootRowId: Id,
          ) => {
            if (rootStore.hasRow(tableId, rootRowId)) {
              listenToTable(
                rootRowId,
                rootStore,
                tableId,
                rootRowId,
                toJoinAliases,
              );
            } else {
              selectJoinWhereStore.delRow(queryId, rootRowId);
              collForEach(joins, ({4: idsByRootRowId}) =>
                ifNotUndefined(
                  mapGet(idsByRootRowId, rootRowId),
                  ([, sourceStore, listenerId]) => {
                    delSourceStoreListeners(queryId, sourceStore, listenerId);
                    mapSet(idsByRootRowId, rootRowId);
                  },
                ),
              );
            }
          };

          selectJoinWhereStore.transaction(() => {
            arrayForEach(rootStore.getRowIds(tableId), (rootRowId) =>
              rootRowChanged(rootStore, tableId, rootRowId),
            );
            addSourceStoreListeners(
              rootStore,
              queryId,
              0,
              rootStore.addRowListener(tableId, null, rootRowChanged),
            );
          });

          collDel(redefiningQueryIds, queryId);
          return queries;
        }) as Queries,
    );

  const delQueryDefinition = (queryId: Id): Queries => {
    ifNotUndefined(getQueryArgs(queryId), ([, listenerId]) =>
      paramStore.delListener(listenerId),
    );
    paramStore.delRow(PARAMS_TABLE, queryId);
    resetPreStores(queryId);
    resetSourceStores(queryId);
    delDefinition(queryId);
    return queries;
  };

  const setParamValues = (queryId: Id, paramValues: ParamValues): Queries => {
    if (hasQuery(queryId)) {
      setOrDelParamValues(queryId, paramValues);
    }
    return queries;
  };

  const setParamValue = (
    queryId: Id,
    paramId: Id,
    value: ParamValue,
  ): Queries => {
    if (hasQuery(queryId)) {
      paramStore.setCell(PARAMS_TABLE, queryId, paramId, value);
    }
    return queries;
  };

  const getParamValues = (queryId: Id): ParamValues =>
    paramStore.getRow(PARAMS_TABLE, queryId) as ParamValues;

  const getParamValue = (queryId: Id, paramId: Id): ParamValue | undefined =>
    paramStore.getCell(PARAMS_TABLE, queryId, paramId) as
      | ParamValue
      | undefined;

  const addQueryIdsListener = (listener: QueryIdsListener) =>
    addQueryIdsListenerImpl(() => listener(queries));

  const forEachResultTable = (tableCallback: ResultTableCallback) =>
    forEachQuery((queryId) =>
      getResultStore(queryId).hasTable(queryId)
        ? tableCallback(queryId, (rowCallback) =>
            queries.forEachResultRow(queryId, rowCallback),
          )
        : 0,
    );

  const addParamValuesListener = (
    queryId: IdOrNull,
    listener: ParamValuesListener,
  ): Id =>
    PARAM_LISTENER_PREFIX +
    paramStore.addRowListener(
      PARAMS_TABLE,
      queryId,
      (_store, _tableId, queryId) =>
        listener(queries, queryId, getParamValues(queryId)),
    );

  const addParamValueListener = (
    queryId: IdOrNull,
    paramId: IdOrNull,
    listener: ParamValueListener,
  ): Id =>
    PARAM_LISTENER_PREFIX +
    paramStore.addCellListener(
      PARAMS_TABLE,
      queryId,
      paramId,
      (_store, _tableId, queryId, paramId, paramValue) =>
        listener(queries, queryId, paramId, paramValue as ParamValue),
    );

  const delListener = (listenerId: Id): Queries => {
    const routedResultListener = mapGet(routedResultListeners, listenerId);
    if (listenerId[0] == PARAM_LISTENER_PREFIX) {
      paramStore.delListener(slice(listenerId, 1));
    } else if (!isUndefined(routedResultListener)) {
      const [stat, storeListenerIds, queryIdsListenerId] = routedResultListener;
      mapForEach(storeListenerIds, (_queryId, [store, storeListenerId]) =>
        store.delListener(storeListenerId),
      );
      ifNotUndefined(queryIdsListenerId, delListenerImpl);
      mapSet(routedResultListeners, listenerId);
      delListenerImpl(listenerId);
      resultListenerStats[stat]--;
    } else {
      delListenerImpl(listenerId);
    }
    return queries;
  };

  const getListenerStats = (): QueriesListenerStats => ({
    ...resultListenerStats,
    paramValues: paramStore.getListenerStats().row - size(getQueryIds()),
    paramValue: paramStore.getListenerStats().cell,
  });

  const destroy = (): void => {
    arrayForEach(getQueryIds(), delQueryDefinition);
    destroyImpl();
  };

  const queries: any = {
    setQueryDefinition,
    delQueryDefinition,
    getParamValues,
    getParamValue,
    setParamValues,
    setParamValue,

    getStore,
    getQueryIds,
    forEachQuery,
    hasQuery,
    getTableId,
    forEachResultTable,

    addQueryIdsListener,
    addParamValuesListener,
    addParamValueListener,
    delListener,

    destroy,
    getListenerStats,
  };

  const getListenerArgs = (args: any[], argumentCount: number) =>
    argumentCount == 5
      ? [args[0], args[1] ?? undefined, args[2], args[3], args[4]]
      : slice(args, 0, argumentCount);
  const getResultListenerStat = (gettable: string): ResultListenerStat =>
    (gettable[0].toLowerCase() + slice(gettable, 1)) as ResultListenerStat;

  objMap(
    {
      [TABLE]: [2, 1],
      [TABLE + CELL_IDS]: [1, 1],
      [ROW_COUNT]: [1, 1],
      [ROW_IDS]: [1, 1],
      [SORTED_ROW_IDS]: [1, 5],
      [ROW]: [3, 2],
      [CELL_IDS]: [1, 2],
      [CELL]: [3, 3],
    } as const,
    ([prefixCount, argumentCount], gettable) => {
      arrayForEach(
        slice([GET, 'has', 'forEach'], 0, prefixCount),
        (prefix) =>
          (queries[prefix + RESULT + gettable] = (...args: any[]) =>
            (getResultStore(args[0]) as any)[prefix + gettable](...args)),
      );
      queries[ADD + RESULT + gettable + LISTENER] = (...args: any[]): Id =>
        addRoutedResultListener(
          getResultListenerStat(gettable),
          args[0],
          (store) =>
            (store as any)[ADD + gettable + LISTENER](
              ...getListenerArgs(args, argumentCount),
              (_store: Store, ...listenerArgs: any[]) =>
                args[argumentCount](queries, ...listenerArgs),
              true,
            ),
        );
    },
  );

  return objFreeze(queries as Queries);
}) as typeof createQueriesDecl;
