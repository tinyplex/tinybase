/// queries

import {
  Cell,
  CellOrUndefined,
  GetCell,
  NoTablesSchema,
  OptionalSchemas,
  OptionalTablesSchema,
  Store,
} from './store.d';
import {CellIdFromSchema, TableIdFromSchema} from './internal/store.d';
import {GetResultCell, JoinedCellIdOrId} from './internal/queries.d';
import {Id, IdOrNull, Ids} from './common.d';
import {GetIdChanges} from '../store.d';

/// ResultTable
export type ResultTable = {[rowId: Id]: ResultRow};

/// ResultRow
export type ResultRow = {[cellId: Id]: ResultCell};

/// ResultCell
export type ResultCell = string | number | boolean;

/// ResultCellOrUndefined
export type ResultCellOrUndefined = ResultCell | undefined;

/// Aggregate
export type Aggregate = (cells: ResultCell[], length: number) => ResultCell;

/// AggregateAdd
export type AggregateAdd = (
  current: ResultCell,
  add: ResultCell,
  length: number,
) => ResultCellOrUndefined;

/// AggregateRemove
export type AggregateRemove = (
  current: ResultCell,
  remove: ResultCell,
  length: number,
) => ResultCellOrUndefined;

/// AggregateReplace
export type AggregateReplace = (
  current: ResultCell,
  add: ResultCell,
  remove: ResultCell,
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
export type QueryIdsListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
) => void;

/// ResultTableListener
export type ResultTableListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  getCellChange: GetResultCellChange,
) => void;

/// ResultTableCellIdsListener
export type ResultTableCellIdsListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  getIdChanges: GetIdChanges | undefined,
) => void;

/// ResultRowCountListener
export type ResultRowCountListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  count: number,
) => void;

/// ResultRowIdsListener
export type ResultRowIdsListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  getIdChanges: GetIdChanges | undefined,
) => void;

/// ResultSortedRowIdsListener
export type ResultSortedRowIdsListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
  sortedRowIds: Ids,
) => void;

/// ResultRowListener
export type ResultRowListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  rowId: Id,
  getCellChange: GetResultCellChange,
) => void;

/// ResultCellIdsListener
export type ResultCellIdsListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
  tableId: Id,
  rowId: Id,
  getIdChanges: GetIdChanges | undefined,
) => void;

/// ResultCellListener
export type ResultCellListener<Schemas extends OptionalSchemas> = (
  queries: Queries<Schemas>,
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
export type GetTableCell<
  Schema extends OptionalTablesSchema,
  RootTableId extends TableIdFromSchema<Schema>,
> = {
  /// GetTableCell.1
  <RootCellId extends CellIdFromSchema<Schema, RootTableId>>(
    cellId: RootCellId,
  ): CellOrUndefined<Schema, RootTableId, RootCellId>;
  /// GetTableCell.2
  <
    JoinedTableId extends TableIdFromSchema<Schema> | Id,
    JoinedCellId extends JoinedCellIdOrId<
      Schema,
      JoinedTableId
    > = JoinedCellIdOrId<Schema, JoinedTableId>,
  >(
    joinedTableId: JoinedTableId,
    joinedCellId: JoinedCellId,
  ):
    | (JoinedTableId extends TableIdFromSchema<Schema>
        ? Cell<Schema, JoinedTableId, JoinedCellId>
        : Cell<any, any, any>)
    | undefined;
};

/// Select
export type Select<
  Schema extends OptionalTablesSchema,
  RootTableId extends TableIdFromSchema<Schema>,
> = {
  /// Select.1
  <RootCellId extends CellIdFromSchema<Schema, RootTableId>>(
    cellId: RootCellId,
  ): SelectedAs;
  /// Select.2
  <JoinedTableId extends TableIdFromSchema<Schema> | Id>(
    joinedTableId: JoinedTableId,
    joinedCellId: JoinedCellIdOrId<Schema, JoinedTableId>,
  ): SelectedAs;
  /// Select.3
  (
    getCell: (
      getTableCell: GetTableCell<Schema, RootTableId>,
      rowId: Id,
    ) => ResultCellOrUndefined,
  ): SelectedAs;
};

/// SelectedAs
export type SelectedAs = {
  /// SelectedAs.as
  as: (selectedCellId: Id) => void;
};

/// Join
export type Join<
  Schema extends OptionalTablesSchema,
  RootTableId extends TableIdFromSchema<Schema>,
> = {
  /// Join.1
  (
    joinedTableId: TableIdFromSchema<Schema>,
    on: CellIdFromSchema<Schema, RootTableId>,
  ): JoinedAs;
  /// Join.2
  (
    joinedTableId: TableIdFromSchema<Schema>,
    on: (getCell: GetCell<Schema, RootTableId>, rowId: Id) => Id | undefined,
  ): JoinedAs;
  /// Join.3
  <
    IntermediateJoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
    IntermediateJoinedCellId extends JoinedCellIdOrId<
      Schema,
      IntermediateJoinedTableId
    > = JoinedCellIdOrId<Schema, IntermediateJoinedTableId>,
  >(
    joinedTableId: TableIdFromSchema<Schema>,
    fromIntermediateJoinedTableId: IntermediateJoinedTableId,
    on: IntermediateJoinedCellId,
  ): JoinedAs;
  /// Join.4
  <
    IntermediateJoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
  >(
    joinedTableId: TableIdFromSchema<Schema>,
    fromIntermediateJoinedTableId: IntermediateJoinedTableId,
    on: (
      // prettier-ignore
      getIntermediateJoinedCell: 
        IntermediateJoinedTableId extends TableIdFromSchema<Schema>
          ? GetCell<Schema, IntermediateJoinedTableId>
          : GetCell<NoTablesSchema, Id>,
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
export type Where<
  Schema extends OptionalTablesSchema,
  RootTableId extends TableIdFromSchema<Schema>,
> = {
  /// Where.1
  <RootCellId extends CellIdFromSchema<Schema, RootTableId>>(
    cellId: RootCellId,
    equals: Cell<Schema, RootTableId, RootCellId>,
  ): void;
  /// Where.2
  <
    JoinedTableId extends TableIdFromSchema<Schema> | Id,
    JoinedCellId extends JoinedCellIdOrId<
      Schema,
      JoinedTableId
    > = JoinedCellIdOrId<Schema, JoinedTableId>,
    JoinedCell extends Cell<Schema, JoinedTableId, JoinedCellId> = Cell<
      Schema,
      JoinedTableId,
      JoinedCellId
    >,
  >(
    joinedTableId: JoinedTableId,
    joinedCellId: JoinedCellId,
    equals: JoinedCell,
  ): void;
  /// Where.3
  (
    condition: (getTableCell: GetTableCell<Schema, RootTableId>) => boolean,
  ): void;
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
  (selectedOrGroupedCellId: Id, equals: ResultCell): void;
  /// Having.2
  (condition: (getSelectedOrGroupedCell: GetResultCell) => boolean): void;
};

/// Queries
export interface Queries<in out Schemas extends OptionalSchemas> {
  /// Queries.setQueryDefinition
  setQueryDefinition<RootTableId extends TableIdFromSchema<Schemas[0]>>(
    queryId: Id,
    tableId: RootTableId,
    query: (keywords: {
      select: Select<Schemas[0], RootTableId>;
      join: Join<Schemas[0], RootTableId>;
      where: Where<Schemas[0], RootTableId>;
      group: Group;
      having: Having;
    }) => void,
  ): Queries<Schemas>;

  /// Queries.delQueryDefinition
  delQueryDefinition(queryId: Id): Queries<Schemas>;

  /// Queries.getStore
  getStore(): Store<Schemas>;

  /// Queries.getQueryIds
  getQueryIds(): Ids;

  /// Queries.forEachQuery
  forEachQuery(queryCallback: QueryCallback): void;

  /// Queries.hasQuery
  hasQuery(queryId: Id): boolean;

  /// Queries.getTableId
  getTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    queryId: Id,
  ): TableId | undefined;

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
  addQueryIdsListener(listener: QueryIdsListener<Schemas>): Id;

  /// Queries.addResultTableListener
  addResultTableListener(
    queryId: IdOrNull,
    listener: ResultTableListener<Schemas>,
  ): Id;

  /// Queries.addResultTableCellIdsListener
  addResultTableCellIdsListener(
    queryId: IdOrNull,
    listener: ResultTableCellIdsListener<Schemas>,
  ): Id;

  /// Queries.addResultRowCountListener
  addResultRowCountListener(
    queryId: IdOrNull,
    listener: ResultRowCountListener<Schemas>,
  ): Id;

  /// Queries.addResultRowIdsListener
  addResultRowIdsListener(
    queryId: IdOrNull,
    listener: ResultRowIdsListener<Schemas>,
  ): Id;

  /// Queries.addResultSortedRowIdsListener
  addResultSortedRowIdsListener(
    queryId: Id,
    cellId: Id | undefined,
    descending: boolean,
    offset: number,
    limit: number | undefined,
    listener: ResultSortedRowIdsListener<Schemas>,
  ): Id;

  /// Queries.addResultRowListener
  addResultRowListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultRowListener<Schemas>,
  ): Id;

  /// Queries.addResultCellIdsListener
  addResultCellIdsListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultCellIdsListener<Schemas>,
  ): Id;

  /// Queries.addResultCellListener
  addResultCellListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: ResultCellListener<Schemas>,
  ): Id;

  /// Queries.delListener
  delListener(listenerId: Id): Queries<Schemas>;

  /// Queries.destroy
  destroy(): void;

  /// Queries.getListenerStats
  getListenerStats(): QueriesListenerStats;
}

/// createQueries
export function createQueries<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Queries<Schemas>;
