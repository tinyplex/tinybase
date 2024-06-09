/// queries

import type {
  Cell,
  CellOrUndefined,
  GetCell,
  GetIdChanges,
  Store,
} from '../store/index.d.ts';
import type {Id, IdOrNull, Ids} from '../common/index.d.ts';

/// ResultTable
export type ResultTable = {[rowId: Id]: ResultRow};

/// ResultRow
export type ResultRow = {[cellId: Id]: ResultCell};

/// ResultCell
export type ResultCell = string | number | boolean;

/// ResultCellOrUndefined
export type ResultCellOrUndefined = ResultCell | undefined;

/// Aggregate
export type Aggregate = (cells: Cell[], length: number) => ResultCell;

/// AggregateAdd
export type AggregateAdd = (
  current: Cell,
  add: Cell,
  length: number,
) => ResultCellOrUndefined;

/// AggregateRemove
export type AggregateRemove = (
  current: Cell,
  remove: Cell,
  length: number,
) => ResultCellOrUndefined;

/// AggregateReplace
export type AggregateReplace = (
  current: Cell,
  add: Cell,
  remove: Cell,
  length: number,
) => ResultCellOrUndefined;

/// QueryCallback
export type QueryCallback = (queryId: Id) => void;

/// ResultTableCallback
export type ResultTableCallback = (
  tableId: Id,
  forEachRow: (rowCallback: ResultRowCallback) => void,
) => void;

/// ResultRowCallback
export type ResultRowCallback = (
  rowId: Id,
  forEachCell: (cellCallback: ResultCellCallback) => void,
) => void;

/// ResultCellCallback
export type ResultCellCallback = (cellId: Id, cell: ResultCell) => void;

/// QueryIdsListener
export type QueryIdsListener = (queries: Queries) => void;

/// ResultTableListener
export type ResultTableListener = (
  queries: Queries,
  tableId: Id,
  getCellChange: GetResultCellChange,
) => void;

/// ResultTableCellIdsListener
export type ResultTableCellIdsListener = (
  queries: Queries,
  tableId: Id,
  getIdChanges: GetIdChanges | undefined,
) => void;

/// ResultRowCountListener
export type ResultRowCountListener = (
  queries: Queries,
  tableId: Id,
  count: number,
) => void;

/// ResultRowIdsListener
export type ResultRowIdsListener = (
  queries: Queries,
  tableId: Id,
  getIdChanges: GetIdChanges | undefined,
) => void;

/// ResultSortedRowIdsListener
export type ResultSortedRowIdsListener = (
  queries: Queries,
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  sortedRowIds: Ids,
) => void;

/// ResultRowListener
export type ResultRowListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
  getCellChange: GetResultCellChange,
) => void;

/// ResultCellIdsListener
export type ResultCellIdsListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
  getIdChanges: GetIdChanges | undefined,
) => void;

/// ResultCellListener
export type ResultCellListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  newCell: ResultCell,
  oldCell: ResultCell,
  getCellChange: GetResultCellChange,
) => void;

/// GetResultCellChange
export type GetResultCellChange = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
) => ResultCellChange;

/// ResultCellChange
export type ResultCellChange = [
  changed: boolean,
  oldCell: ResultCellOrUndefined,
  newCell: ResultCellOrUndefined,
];

/// QueriesListenerStats
export type QueriesListenerStats = {
  /// QueriesListenerStats.table
  table?: number;
  /// QueriesListenerStats.tableCellIds
  tableCellIds?: number;
  /// QueriesListenerStats.rowCount
  rowCount?: number;
  /// QueriesListenerStats.rowIds
  rowIds?: number;
  /// QueriesListenerStats.sortedRowIds
  sortedRowIds?: number;
  /// QueriesListenerStats.row
  row?: number;
  /// QueriesListenerStats.cellIds
  cellIds?: number;
  /// QueriesListenerStats.cell
  cell?: number;
};

/// GetTableCell
export type GetTableCell = {
  /// GetTableCell.1
  (cellId: Id): CellOrUndefined;
  /// GetTableCell.2
  (joinedTableId: Id, joinedCellId: Id): CellOrUndefined;
};

/// Select
export type Select = {
  /// Select.1
  (cellId: Id): SelectedAs;
  /// Select.2
  (joinedTableId: Id, joinedCellId: Id): SelectedAs;
  /// Select.3
  (
    getCell: (getTableCell: GetTableCell, rowId: Id) => ResultCellOrUndefined,
  ): SelectedAs;
};

/// SelectedAs
export type SelectedAs = {
  /// SelectedAs.as
  as: (selectedCellId: Id) => void;
};

/// Join
export type Join = {
  /// Join.1
  (joinedTableId: Id, on: Id): JoinedAs;
  /// Join.2
  (
    joinedTableId: Id,
    on: (getCell: GetCell, rowId: Id) => Id | undefined,
  ): JoinedAs;
  /// Join.3
  (joinedTableId: Id, fromIntermediateJoinedTableId: Id, on: Id): JoinedAs;
  /// Join.4
  (
    joinedTableId: Id,
    fromIntermediateJoinedTableId: Id,
    on: (
      getIntermediateJoinedCell: GetCell,
      intermediateJoinedRowId: Id,
    ) => Id | undefined,
  ): JoinedAs;
};

/// JoinedAs
export type JoinedAs = {
  /// JoinedAs.as
  as: (joinedTableId: Id) => void;
};

/// Where
export type Where = {
  /// Where.1
  (cellId: Id, equals: Cell): void;
  /// Where.2
  (joinedTableId: Id, joinedCellId: Id, equals: Cell): void;
  /// Where.3
  (condition: (getTableCell: GetTableCell) => boolean): void;
};

/// Group
export type Group = (
  selectedCellId: Id,
  aggregate: 'count' | 'sum' | 'avg' | 'min' | 'max' | Aggregate,
  aggregateAdd?: AggregateAdd,
  aggregateRemove?: AggregateRemove,
  aggregateReplace?: AggregateReplace,
) => GroupedAs;

/// GroupedAs
export type GroupedAs = {
  /// GroupedAs.as
  as: (groupedCellId: Id) => void;
};

/// Having
export type Having = {
  /// Having.1
  (selectedOrGroupedCellId: Id, equals: Cell): void;
  /// Having.2
  (condition: (getSelectedOrGroupedCell: GetCell) => boolean): void;
};

/// Queries
export interface Queries {
  //
  /// Queries.setQueryDefinition
  setQueryDefinition(
    queryId: Id,
    tableId: Id,
    query: (keywords: {
      select: Select;
      join: Join;
      where: Where;
      group: Group;
      having: Having;
    }) => void,
  ): Queries;

  /// Queries.delQueryDefinition
  delQueryDefinition(queryId: Id): Queries;

  /// Queries.getStore
  getStore(): Store;

  /// Queries.getQueryIds
  getQueryIds(): Ids;

  /// Queries.forEachQuery
  forEachQuery(queryCallback: QueryCallback): void;

  /// Queries.hasQuery
  hasQuery(queryId: Id): boolean;

  /// Queries.getTableId
  getTableId(queryId: Id): Id | undefined;

  /// Queries.getResultTable
  getResultTable(queryId: Id): ResultTable;

  /// Queries.getResultTableCellIds
  getResultTableCellIds(queryId: Id): Ids;

  /// Queries.getResultRowCount
  getResultRowCount(queryId: Id): number;

  /// Queries.getResultRowIds
  getResultRowIds(queryId: Id): Ids;

  /// Queries.getResultSortedRowIds
  getResultSortedRowIds(
    queryId: Id,
    cellId?: Id,
    descending?: boolean,
    offset?: number,
    limit?: number,
  ): Ids;

  /// Queries.getResultRow
  getResultRow(queryId: Id, rowId: Id): ResultRow;

  /// Queries.getResultCellIds
  getResultCellIds(queryId: Id, rowId: Id): Ids;

  /// Queries.getResultCell
  getResultCell(queryId: Id, rowId: Id, cellId: Id): ResultCellOrUndefined;

  /// Queries.hasResultTable
  hasResultTable(queryId: Id): boolean;

  /// Queries.hasResultRow
  hasResultRow(queryId: Id, rowId: Id): boolean;

  /// Queries.hasResultCell
  hasResultCell(queryId: Id, rowId: Id, cellId: Id): boolean;

  /// Queries.forEachResultTable
  forEachResultTable(tableCallback: ResultTableCallback): void;

  /// Queries.forEachResultRow
  forEachResultRow(queryId: Id, rowCallback: ResultRowCallback): void;

  /// Queries.forEachResultCell
  forEachResultCell(
    queryId: Id,
    rowId: Id,
    cellCallback: ResultCellCallback,
  ): void;

  /// Queries.addQueryIdsListener
  addQueryIdsListener(listener: QueryIdsListener): Id;

  /// Queries.addResultTableListener
  addResultTableListener(queryId: IdOrNull, listener: ResultTableListener): Id;

  /// Queries.addResultTableCellIdsListener
  addResultTableCellIdsListener(
    queryId: IdOrNull,
    listener: ResultTableCellIdsListener,
  ): Id;

  /// Queries.addResultRowCountListener
  addResultRowCountListener(
    queryId: IdOrNull,
    listener: ResultRowCountListener,
  ): Id;

  /// Queries.addResultRowIdsListener
  addResultRowIdsListener(
    queryId: IdOrNull,
    listener: ResultRowIdsListener,
  ): Id;

  /// Queries.addResultSortedRowIdsListener
  addResultSortedRowIdsListener(
    queryId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: ResultSortedRowIdsListener,
  ): Id;

  /// Queries.addResultRowListener
  addResultRowListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultRowListener,
  ): Id;

  /// Queries.addResultCellIdsListener
  addResultCellIdsListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultCellIdsListener,
  ): Id;

  /// Queries.addResultCellListener
  addResultCellListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: ResultCellListener,
  ): Id;

  /// Queries.delListener
  delListener(listenerId: Id): Queries;

  /// Queries.destroy
  destroy(): void;

  /// Queries.getListenerStats
  getListenerStats(): QueriesListenerStats;
  //
}

/// createQueries
export function createQueries(store: Store): Queries;
