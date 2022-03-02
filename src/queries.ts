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
import {getCreateFunction, getDefinableFunctions} from './common/definable';
import {getUndefined} from './common/other';
import {objFreeze} from './common/obj';

type StoreWithCreateMethod = Store & {createStore: () => Store};

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
    ] = getDefinableFunctions<true, undefined>(store, () => true, getUndefined);
    const resultStore = (store as StoreWithCreateMethod).createStore();

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

      const select = (
        _arg1:
          | Id
          | ((getTableCell: GetTableCell, rowId: Id) => CellOrUndefined),
        _arg2?: Id,
      ) => ({as: (_selectedCellId: Id) => null});

      const join = (
        _joinedTableId: Id,
        _arg1: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
        _arg2?: Id | ((getCell: GetCell, rowId: Id) => Id | undefined),
      ) => ({as: (_joinedTableId: Id) => null});

      const where = (
        _arg1: Id | ((getTableCell: GetTableCell) => boolean),
        _arg2?: Id | Cell,
        _arg3?: Cell,
      ) => null;

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
      return queries;
    };

    const delQueryDefinition = (queryId: Id): Queries => {
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
