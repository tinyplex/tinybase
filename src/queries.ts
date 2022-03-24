import {
  Aggregate,
  AggregateAdd,
  AggregateRemove,
  AggregateReplace,
  GetTableCell,
  Group,
  Having,
  Join,
  Limit,
  Order,
  Queries,
  QueriesListenerStats,
  ResultCellIdsListener,
  ResultCellListener,
  ResultRowIdsListener,
  ResultRowListener,
  ResultTableListener,
  Select,
  Where,
  createQueries as createQueriesDecl,
} from './queries.d';
import {
  Cell,
  CellCallback,
  CellOrUndefined,
  GetCell,
  Row,
  RowCallback,
  Store,
  Table,
  TableCallback,
} from './store.d';
import {Id, IdOrNull, Ids, SortKey} from './common.d';
import {
  IdMap,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from './common/map';
import {IdSet, setAdd, setNew} from './common/set';
import {arrayEvery, arrayForEach, arrayLength, arrayPush} from './common/array';
import {collForEach, collIsEmpty} from './common/coll';
import {getCreateFunction, getDefinableFunctions} from './common/definable';
import {
  getUndefined,
  ifNotUndefined,
  isFunction,
  isUndefined,
} from './common/other';
import {EMPTY_STRING} from './common/strings';
import {objFreeze} from './common/obj';
import {setOrDelCell} from './common/cell';

type StoreWithCreateMethod = Store & {createStore: () => Store};
type SelectClause = (getTableCell: GetTableCell, rowId: Id) => CellOrUndefined;
type JoinClause = [
  Id,
  IdOrNull,
  ((getCell: GetCell, rowId: Id) => Id) | null,
  Ids,
  IdMap<[Id, Id]>,
];
type WhereClause = (getTableCell: GetTableCell) => boolean;

export const createQueries: typeof createQueriesDecl = getCreateFunction(
  (store: Store): Queries => {
    const [
      getStore,
      getQueryIds,
      forEachQuery,
      hasQuery,
      getTableId,
      ,
      ,
      setDefinition,
      ,
      delDefinition,
      destroy,
      addStoreListeners,
      delStoreListeners,
    ] = getDefinableFunctions<true, undefined>(store, () => true, getUndefined);
    const resultStore = (store as StoreWithCreateMethod).createStore();
    const preStoreListenerIds: Map<Id, Map<Store, IdSet>> = mapNew();

    const _addPreStoreListener = (
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

    const synchronizeTransactions = (
      queryId: Id,
      fromStore: Store,
      toStore: Store,
    ) =>
      addStoreListeners(
        queryId,
        0,
        fromStore.addWillFinishTransactionListener(toStore.startTransaction),
        fromStore.addDidFinishTransactionListener(() =>
          toStore.finishTransaction(),
        ),
      );

    const setQueryDefinition = (
      queryId: Id,
      tableId: Id,
      build: (builders: {
        select: Select;
        join: Join;
        where: Where;
        group: Group;
        having: Having;
        order: Order;
        limit: Limit;
      }) => void,
    ): Queries => {
      setDefinition(queryId, tableId);
      resultStore.delTable(queryId);

      const selectEntries: [Id, SelectClause][] = [];
      const joinEntries: [IdOrNull, JoinClause][] = [
        [null, [tableId, null, null, [], mapNew()]],
      ];
      const wheres: WhereClause[] = [];

      const select = (
        arg1: Id | ((getTableCell: GetTableCell, rowId: Id) => CellOrUndefined),
        arg2?: Id,
      ) => {
        const selectEntry: [Id, SelectClause] = isFunction(arg1)
          ? [arrayLength(selectEntries) + EMPTY_STRING, arg1]
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
          isUndefined(arg2) || isFunction(arg1) ? null : arg1;
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
        _selectedCellId: Id,
        _aggregate: 'count' | 'sum' | 'avg' | 'min' | 'max' | Aggregate,
        _aggregateAdd?: AggregateAdd,
        _aggregateRemove?: AggregateRemove,
        _aggregateReplace?: AggregateReplace,
      ) => ({as: (_groupedCellId: Id) => null});

      const having = (
        _arg1: Id | ((getSelectedOrGroupedCell: GetCell) => boolean),
        _arg2?: Cell,
      ) => null;

      const order = (
        _arg1: Id | ((getSelectedOrGroupedCell: GetCell, rowId: Id) => SortKey),
        _descending?: boolean,
      ) => null;

      const limit = (_arg1: number, _arg2?: number) => null;

      build({select, join, where, group, having, order, limit});

      const selects: IdMap<SelectClause> = mapNew(selectEntries);
      if (collIsEmpty(selects)) {
        return queries;
      }
      const joins: Map<IdOrNull, JoinClause> = mapNew(joinEntries);
      mapForEach(joins, (asTableId, [, fromAsTableId]) =>
        ifNotUndefined(mapGet(joins, fromAsTableId), ({3: toAsTableIds}) =>
          isUndefined(asTableId) ? 0 : arrayPush(toAsTableIds, asTableId),
        ),
      );

      const selectJoinWhereStore = resultStore;

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
                setOrDelCell(
                  selectJoinWhereStore,
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
          const [realJoinedTableId, , on, nextJoinedTableIds, remoteIdPair] =
            mapGet(joins, remoteAsTableId) as JoinClause;
          const remoteRowId = on?.(getCell, rootRowId);
          const [previousRemoteRowId, previousRemoteListenerId] =
            mapGet(remoteIdPair, rootRowId) ?? [];
          if (remoteRowId != previousRemoteRowId) {
            if (!isUndefined(previousRemoteListenerId)) {
              delStoreListeners(queryId, previousRemoteListenerId);
            }
            mapSet(
              remoteIdPair,
              rootRowId,
              isUndefined(remoteRowId)
                ? null
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

      const {3: joinedTableIds} = mapGet(joins, null) as JoinClause;
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
    };

    const delQueryDefinition = (queryId: Id): Queries => {
      mapForEach(
        mapGet(preStoreListenerIds, queryId),
        (preStore, listenerIds) =>
          collForEach(listenerIds, (listenerId) =>
            preStore.delListener(listenerId),
          ),
      );
      delDefinition(queryId);
      return queries;
    };

    const getResultTable = (queryId: Id): Table =>
      resultStore.getTable(queryId);

    const getResultRowIds = (queryId: Id): Ids =>
      resultStore.getRowIds(queryId);

    const getResultRow = (queryId: Id, rowId: Id): Row =>
      resultStore.getRow(queryId, rowId);

    const getResultCellIds = (queryId: Id, rowId: Id): Ids =>
      resultStore.getCellIds(queryId, rowId);

    const getResultCell = (
      queryId: Id,
      rowId: Id,
      cellId: Id,
    ): CellOrUndefined => resultStore.getCell(queryId, rowId, cellId);

    const hasResultTable = (queryId: Id): boolean =>
      resultStore.hasTable(queryId);

    const hasResultRow = (queryId: Id, rowId: Id): boolean =>
      resultStore.hasRow(queryId, rowId);

    const hasResultCell = (queryId: Id, rowId: Id, cellId: Id): boolean =>
      resultStore.hasCell(queryId, rowId, cellId);

    const forEachResultTable = (tableCallback: TableCallback): void =>
      resultStore.forEachTable(tableCallback);

    const forEachResultRow = (queryId: Id, rowCallback: RowCallback): void =>
      resultStore.forEachRow(queryId, rowCallback);

    const forEachResultCell = (
      queryId: Id,
      rowId: Id,
      cellCallback: CellCallback,
    ): void => resultStore.forEachCell(queryId, rowId, cellCallback);

    const addResultTableListener = (
      queryId: IdOrNull,
      listener: ResultTableListener,
    ): Id =>
      resultStore.addTableListener(queryId, (_store, ...args) =>
        listener(queries, ...args),
      );

    const addResultRowIdsListener = (
      queryId: IdOrNull,
      listener: ResultRowIdsListener,
    ): Id =>
      resultStore.addRowIdsListener(queryId, (_store, ...args) =>
        listener(queries, ...args),
      );

    const addResultRowListener = (
      queryId: IdOrNull,
      rowId: IdOrNull,
      listener: ResultRowListener,
    ): Id =>
      resultStore.addRowListener(queryId, rowId, (_store, ...args) =>
        listener(queries, ...args),
      );

    const addResultCellIdsListener = (
      queryId: IdOrNull,
      rowId: IdOrNull,
      listener: ResultCellIdsListener,
    ): Id =>
      resultStore.addCellIdsListener(queryId, rowId, (_store, ...args) =>
        listener(queries, ...args),
      );

    const addResultCellListener = (
      queryId: IdOrNull,
      rowId: IdOrNull,
      cellId: IdOrNull,
      listener: ResultCellListener,
    ): Id =>
      resultStore.addCellListener(queryId, rowId, cellId, (_store, ...args) =>
        listener(queries, ...args),
      );

    const delListener = (listenerId: Id): Queries => {
      resultStore.delListener(listenerId);
      return queries;
    };

    const getListenerStats = (): QueriesListenerStats => {
      const {
        tables: _1,
        tableIds: _2,
        transaction: _3,
        ...stats
      } = resultStore.getListenerStats();
      return stats;
    };

    const queries: Queries = {
      setQueryDefinition,
      delQueryDefinition,

      getStore,
      getQueryIds,
      forEachQuery,
      hasQuery,
      getTableId,

      getResultTable,
      getResultRowIds,
      getResultRow,
      getResultCellIds,
      getResultCell,
      hasResultTable,
      hasResultRow,
      hasResultCell,

      forEachResultTable,
      forEachResultRow,
      forEachResultCell,

      addResultTableListener,
      addResultRowIdsListener,
      addResultRowListener,
      addResultCellIdsListener,
      addResultCellListener,

      delListener,

      destroy,
      getListenerStats,
    };

    return objFreeze(queries);
  },
);
