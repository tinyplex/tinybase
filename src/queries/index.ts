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
  isUndefined,
  size,
  slice,
} from '../common/other.ts';
import {IdSet, setAdd, setNew} from '../common/set.ts';
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
  alias: Id | undefined,
  on: ((getCell: GetCell, rowId: Id) => Id) | undefined,
  nextTableIds: Ids,
  remoteIdPairs: IdMap<[Id, Id]>,
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

export const createQueries = getCreateFunction((store: Store): Queries => {
  const createStore = (store as ProtectedStore)._[0];
  const preStore = createStore();
  const paramStore = createStore();
  const resultStore = createStore();
  const preStoreListenerIds: Map<Id, Map<Store, IdSet>> = mapNew();

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
    addStoreListeners,
    delStoreListeners,
  ] = getDefinableFunctions<[Build, Id], undefined>(
    store,
    () => [] as any,
    getUndefined,
    addListener,
    callListeners,
  );

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
    arrayForEach([resultStore, preStore], (store) => store.delTable(queryId));
  };

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

  const setQueryDefinition = (
    queryId: Id,
    tableId: Id,
    build: Build,
    paramValues: ParamValues = {},
  ): Queries => {
    paramStore.delListener(getQueryArgs(queryId)?.[1] as Id);
    setDefinition(queryId, tableId);
    setQueryArgs(queryId, [
      build,
      paramStore.addRowListener(PARAMS_TABLE, queryId, () =>
        resultStore.transaction(() => setQueryDefinitionImpl(queryId)),
      ),
    ]);
    setOrDelParamValues(queryId, paramValues);
    setQueryDefinitionImpl(queryId);
    return queries;
  };

  const setQueryDefinitionImpl = (queryId: Id): Queries =>
    ifNotUndefined(getQueryArgs(queryId), ([build]) => {
      const tableId = getTableId(queryId);
      const paramValues = getParamValues(queryId);

      resetPreStores(queryId);

      const selectEntries: [Id, SelectClause][] = [];
      const joinEntries: [Id | undefined, JoinClause][] = [
        [undefined, [tableId, undefined, undefined, [], mapNew()]],
      ];
      const wheres: WhereClause[] = [];
      const groupEntries: [Id, GroupClause][] = [];
      const havings: HavingClause[] = [];

      const param = (paramId: Id) => objGet(paramValues, paramId);

      const select = (
        arg1: Id | ((getTableCell: GetTableCell, rowId: Id) => CellOrUndefined),
        arg2?: Id,
      ) => {
        const selectEntry: [Id, SelectClause] = isFunction(arg1)
          ? [size(selectEntries) + EMPTY_STRING, arg1]
          : [
              isUndefined(arg2) ? arg1 : arg2,
              (getTableCell) => getTableCell(arg1, arg2 as Id),
            ];
        arrayPush(selectEntries, selectEntry);
        return {as: (selectedCellId: Id) => (selectEntry[0] = selectedCellId)};
      };

      const join = (
        joinedTableId: Id,
        arg1: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
        arg2?: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
      ) => {
        const fromIntermediateJoinedTableId =
          isUndefined(arg2) || isFunction(arg1) ? undefined : arg1;
        const onArg = isUndefined(fromIntermediateJoinedTableId) ? arg1 : arg2;
        const joinEntry: [Id, JoinClause] = [
          joinedTableId,
          [
            joinedTableId,
            fromIntermediateJoinedTableId,
            isFunction(onArg) ? onArg : (getCell) => getCell(onArg as Id),
            [],
            mapNew(),
          ] as JoinClause,
        ];
        arrayPush(joinEntries, joinEntry);
        return {as: (joinedTableId: Id) => (joinEntry[0] = joinedTableId)};
      };

      const where = (
        arg1: Id | ((getTableCell: GetTableCell) => boolean),
        arg2?: Id | Cell,
        arg3?: Cell,
      ) =>
        arrayPush(
          wheres,
          isFunction(arg1)
            ? arg1
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
        return queries;
      }
      const joins: Map<Id | undefined, JoinClause> = mapNew(joinEntries);
      mapForEach(joins, (asTableId, [, fromAsTableId]) =>
        ifNotUndefined(mapGet(joins, fromAsTableId), ({3: toAsTableIds}) =>
          isUndefined(asTableId) ? 0 : arrayPush(toAsTableIds, asTableId),
        ),
      );
      const groups: IdMap<GroupClause> = mapNew(groupEntries);

      let selectJoinWhereStore = preStore;

      // GROUP & HAVING

      if (collIsEmpty(groups) && arrayIsEmpty(havings)) {
        selectJoinWhereStore = resultStore;
      } else {
        synchronizeTransactions(queryId, selectJoinWhereStore, resultStore);

        const groupedSelectedCellIds: IdMap<Set<[Id, Aggregators]>> = mapNew();
        mapForEach(groups, (groupedCellId, [selectedCellId, aggregators]) =>
          setAdd(mapEnsure(groupedSelectedCellIds, selectedCellId, setNew), [
            groupedCellId,
            aggregators,
          ]),
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
                const [changed, , newCell] = (getCellChange as GetCellChange)(
                  queryId,
                  selectedRowId,
                  selectedCellId,
                );
                if (changedLeaf || changed) {
                  mapSet(changedGroupedSelectedCells, selectedCellId, [
                    newCell,
                  ]);
                }
              });

              if (changedLeaf) {
                writeGroupRow(
                  visitTree(tree, oldPath, undefined, ([, selectedRowIds]) => {
                    collDel(selectedRowIds, selectedRowId);
                    return collIsEmpty(selectedRowIds) as any;
                  }),
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

      synchronizeTransactions(queryId, store, selectJoinWhereStore);

      const writeSelectRow = (rootRowId: Id) => {
        const getTableCell = (arg1: Id, arg2?: Id) =>
          store.getCell(
            ...((isUndefined(arg2)
              ? [tableId, rootRowId, arg1]
              : arg1 === tableId
                ? [tableId, rootRowId, arg2]
                : [
                    mapGet(joins, arg1)?.[0] as Id,
                    mapGet(mapGet(joins, arg1)?.[4], rootRowId)?.[0],
                    arg2,
                  ]) as [Id, Id, Id]),
          );
        selectJoinWhereStore.transaction(() =>
          arrayEvery(wheres, (where) => where(getTableCell))
            ? mapForEach(selects, (asCellId, tableCellGetter) =>
                (selectJoinWhereStore as ProtectedStore)._[5](
                  queryId,
                  rootRowId,
                  asCellId,
                  tableCellGetter(getTableCell, rootRowId),
                ),
              )
            : selectJoinWhereStore.delRow(queryId, rootRowId),
        );
      };

      const listenToTable = (
        rootRowId: Id,
        tableId: Id,
        rowId: Id,
        joinedTableIds: Ids,
      ) => {
        const getCell = (cellId: Id) => store.getCell(tableId, rowId, cellId);
        arrayForEach(joinedTableIds, (remoteAsTableId) => {
          const [realJoinedTableId, , on, nextJoinedTableIds, remoteIdPairs] =
            mapGet(joins, remoteAsTableId) as JoinClause;
          const remoteRowId = on?.(getCell as any, rootRowId);
          const [previousRemoteRowId, previousRemoteListenerId] =
            mapGet(remoteIdPairs, rootRowId) ?? [];
          if (remoteRowId != previousRemoteRowId) {
            if (!isUndefined(previousRemoteListenerId)) {
              delStoreListeners(queryId, previousRemoteListenerId);
            }
            mapSet(
              remoteIdPairs,
              rootRowId,
              isUndefined(remoteRowId)
                ? undefined
                : [
                    remoteRowId,
                    ...addStoreListeners(
                      queryId,
                      1,
                      store.addRowListener(realJoinedTableId, remoteRowId, () =>
                        listenToTable(
                          rootRowId,
                          realJoinedTableId,
                          remoteRowId,
                          nextJoinedTableIds,
                        ),
                      ),
                    ),
                  ],
            );
          }
        });
        writeSelectRow(rootRowId);
      };

      const {3: joinedTableIds} = mapGet(joins, undefined) as JoinClause;
      selectJoinWhereStore.transaction(() =>
        addStoreListeners(
          queryId,
          1,
          store.addRowListener(
            tableId,
            null,
            (_store: Store, _tableId: Id, rootRowId: Id) => {
              if (store.hasRow(tableId, rootRowId)) {
                listenToTable(rootRowId, tableId, rootRowId, joinedTableIds);
              } else {
                selectJoinWhereStore.delRow(queryId, rootRowId);
                collForEach(joins, ({4: idsByRootRowId}) =>
                  ifNotUndefined(
                    mapGet(idsByRootRowId, rootRowId),
                    ([, listenerId]) => {
                      delStoreListeners(queryId, listenerId);
                      mapSet(idsByRootRowId, rootRowId);
                    },
                  ),
                );
              }
            },
          ),
        ),
      );

      return queries;
    }) as Queries;

  const delQueryDefinition = (queryId: Id): Queries => {
    paramStore.delListener(getQueryArgs(queryId)?.[1] as Id);
    paramStore.delRow(PARAMS_TABLE, queryId);
    resetPreStores(queryId);
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
    if (listenerId[0] == PARAM_LISTENER_PREFIX) {
      paramStore.delListener(slice(listenerId, 1));
    } else {
      delListenerImpl(listenerId);
    }
    return queries;
  };

  const getListenerStats = (): QueriesListenerStats => {
    const {
      tables: _1,
      tableIds: _2,
      transaction: _3,
      ...stats
    } = resultStore.getListenerStats();
    return {
      ...stats,
      paramValues: paramStore.getListenerStats().row - size(getQueryIds()),
      paramValue: paramStore.getListenerStats().cell,
    };
  };

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

    addQueryIdsListener,
    addParamValuesListener,
    addParamValueListener,
    delListener,

    destroy,
    getListenerStats,
  };

  objMap(
    {
      [TABLE]: [1, 1],
      [TABLE + CELL_IDS]: [0, 1],
      [ROW_COUNT]: [0, 1],
      [ROW_IDS]: [0, 1],
      [SORTED_ROW_IDS]: [0, 5],
      [ROW]: [1, 2],
      [CELL_IDS]: [0, 2],
      [CELL]: [1, 3],
    },
    ([hasAndForEach, argumentCount], gettable) => {
      arrayForEach(
        hasAndForEach ? [GET, 'has', 'forEach'] : [GET],
        (prefix) =>
          (queries[prefix + RESULT + gettable] = (...args: any[]) =>
            (resultStore as any)[prefix + gettable](...args)),
      );
      queries[ADD + RESULT + gettable + LISTENER] = (...args: any[]): Id =>
        (resultStore as any)[ADD + gettable + LISTENER](
          ...slice(args, 0, argumentCount),
          (_store: Store, ...listenerArgs: any[]) =>
            (args[argumentCount] as any)(queries, ...listenerArgs),
          true,
        );
    },
  );

  return objFreeze(queries as Queries);
}) as typeof createQueriesDecl;
