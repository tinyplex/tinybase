/// queries

import {
  Cell,
  CellIdFromSchema,
  GetCell,
  GetCellAlias,
  NoSchemas,
  NoTablesSchema,
  OptionalSchemas,
  OptionalTablesSchema,
  Store,
  TableIdFromSchema,
} from './store.d';
import {Id, IdOrNull, Ids} from './common.d';

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

/// ResultTableListener
export type ResultTableListener = (
  queries: Queries,
  tableId: Id,
  getCellChange: GetCellResultChange,
) => void;

/// ResultRowIdsListener
export type ResultRowIdsListener = (queries: Queries, tableId: Id) => void;

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
  getCellChange: GetCellResultChange,
) => void;

/// ResultCellIdsListener
export type ResultCellIdsListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
) => void;

/// ResultCellListener
export type ResultCellListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  newCell: ResultCell,
  oldCell: ResultCell,
  getCellChange: GetCellResultChange,
) => void;

/// GetCellResultChange
export type GetCellResultChange = (
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
  /// QueriesListenerStats.rowIds
  rowIds?: number;
  /// QueriesListenerStats.row
  row?: number;
  /// QueriesListenerStats.cellIds
  cellIds?: number;
  /// QueriesListenerStats.cell
  cell?: number;
};

/// GetTableCell
export type GetTableCell<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  RootTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = {
  /// GetTableCell.1
  <
    RootCellId extends CellIdFromSchema<Schema, RootTableId> = CellIdFromSchema<
      Schema,
      RootTableId
    >,
    CellOrUndefined = Cell<Schema, RootTableId, RootCellId> | undefined,
  >(
    cellId: RootCellId,
  ): CellOrUndefined;
  /// GetTableCell.2
  <
    JoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
    JoinedCellId extends JoinedCellIdOrId<
      Schema,
      JoinedTableId
    > = JoinedCellIdOrId<Schema, JoinedTableId>,
    CellOrUndefined extends
      | (JoinedTableId extends TableIdFromSchema<Schema>
          ? Cell<Schema, JoinedTableId, JoinedCellId>
          : Cell)
      | undefined =
      | (JoinedTableId extends TableIdFromSchema<Schema>
          ? Cell<Schema, JoinedTableId, JoinedCellId>
          : Cell)
      | undefined,
  >(
    joinedTableId: JoinedTableId,
    joinedCellId: JoinedCellId,
  ): CellOrUndefined;
};

/// Select
export type Select<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  RootTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = {
  /// Select.1
  <
    RootCellId extends CellIdFromSchema<Schema, RootTableId> = CellIdFromSchema<
      Schema,
      RootTableId
    >,
  >(
    cellId: RootCellId,
  ): SelectedAs;
  /// Select.2
  <
    JoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
    JoinedCellId extends JoinedCellIdOrId<
      Schema,
      JoinedTableId
    > = JoinedCellIdOrId<Schema, JoinedTableId>,
  >(
    joinedTableId: JoinedTableId,
    joinedCellId: JoinedCellId,
  ): SelectedAs;
  /// Select.3
  <
    GetTableCell extends GetTableCellAlias<
      Schema,
      RootTableId
    > = GetTableCellAlias<Schema, RootTableId>,
  >(
    getCell: (getTableCell: GetTableCell, rowId: Id) => ResultCellOrUndefined,
  ): SelectedAs;
};

/// SelectedAs
export type SelectedAs = {
  /// SelectedAs.as
  as: (selectedCellId: Id) => void;
};

/// Join
export type Join<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  RootTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = {
  /// Join.1
  <
    JoinedTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
    RootCellId extends CellIdFromSchema<Schema, RootTableId> = CellIdFromSchema<
      Schema,
      RootTableId
    >,
  >(
    joinedTableId: JoinedTableId,
    on: RootCellId,
  ): JoinedAs;
  /// Join.2
  <JoinedTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>>(
    joinedTableId: JoinedTableId,
    on: (getCell: GetCell<Schema, RootTableId>, rowId: Id) => Id | undefined,
  ): JoinedAs;
  /// Join.3
  <
    JoinedTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
    IntermediateJoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
    IntermediateJoinedCellId extends JoinedCellIdOrId<
      Schema,
      IntermediateJoinedTableId
    > = JoinedCellIdOrId<Schema, IntermediateJoinedTableId>,
  >(
    joinedTableId: JoinedTableId,
    fromIntermediateJoinedTableId: IntermediateJoinedTableId,
    on: IntermediateJoinedCellId,
  ): JoinedAs;
  /// Join.4
  <
    JoinedTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
    IntermediateJoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
    GetCell = IntermediateJoinedTableId extends TableIdFromSchema<Schema>
      ? GetCellAlias<Schema, IntermediateJoinedTableId>
      : GetCellAlias,
  >(
    joinedTableId: JoinedTableId,
    fromIntermediateJoinedTableId: IntermediateJoinedTableId,
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
export type Where<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  RootTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = {
  /// Where.1
  <
    RootCellId extends CellIdFromSchema<Schema, RootTableId> = CellIdFromSchema<
      Schema,
      RootTableId
    >,
    RootCell extends Cell<Schema, RootTableId, RootCellId> = Cell<
      Schema,
      RootTableId,
      RootCellId
    >,
  >(
    cellId: RootCellId,
    equals: RootCell,
  ): void;
  /// Where.2
  <
    JoinedTableId extends TableIdFromSchema<Schema> | Id =
      | TableIdFromSchema<Schema>
      | Id,
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
  <
    GetTableCell extends GetTableCellAlias<
      Schema,
      RootTableId
    > = GetTableCellAlias<Schema, RootTableId>,
  >(
    condition: (getTableCell: GetTableCell) => boolean,
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
  (selectedOrGroupedCellId: Id, equals: Cell): void;
  /// Having.2
  (condition: (getSelectedOrGroupedCell: GetCell) => boolean): void;
};

/// Queries
export interface Queries<Schemas extends OptionalSchemas = NoSchemas> {
  /// Queries.setQueryDefinition
  setQueryDefinition<
    RootTableId extends TableIdFromSchema<Schemas[0]>,
    Schema extends OptionalTablesSchema = Schemas[0],
  >(
    queryId: Id,
    tableId: RootTableId,
    query: (keywords: {
      select: Select<Schema, RootTableId>;
      join: Join<Schema, RootTableId>;
      where: Where<Schema, RootTableId>;
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

  /// Queries.addResultTableListener
  addResultTableListener(queryId: IdOrNull, listener: ResultTableListener): Id;

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

export type GetTableCellAlias<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  RootTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = GetTableCell<Schema, RootTableId>;

export type JoinedCellIdOrId<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  JoinedTableId extends TableIdFromSchema<Schema> | Id =
    | TableIdFromSchema<Schema>
    | Id,
> = JoinedTableId extends TableIdFromSchema<Schema>
  ? CellIdFromSchema<Schema, JoinedTableId>
  : Id;
