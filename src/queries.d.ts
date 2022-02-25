/**
 * The queries module of the TinyBase project provides the ability to create
 * and track queries of the data in Store objects.
 *
 * The main entry point to this module is the createQueries function, which
 * returns a new Queries object. From there, you can create new query
 * definitions, access the results of those directly, and register
 * listeners for when they change.
 *
 * @packageDocumentation
 * @module queries
 */

import {
  Cell,
  CellCallback,
  CellOrUndefined,
  GetCell,
  GetCellChange,
  Row,
  RowCallback,
  Store,
  Table,
  TableCallback,
} from './store.d';
import {Id, IdOrNull, Ids, SortKey} from './common.d';

/**
 * The Aggregate type describes a custom function that takes an array of Cell
 * values and returns an aggregate of them.
 *
 * There are a number of common predefined aggregators, such as for counting,
 * summing, and averaging values. This type is instead used for when you wish to
 * use a more complex aggregation of your own devising.
 *
 * @param cells The array of Cell values to be aggregated.
 * @param length The length of the array of Cell values to be aggregated.
 * @returns The value of the aggregation.
 * @category Aggregators
 */
export type Aggregate = (cells: Cell[], length: number) => Cell;

/**
 * The AggregateAdd type describes a function that can be used to optimize a
 * custom Aggregate by providing a shortcut for when a single value is added to
 * the input values.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when adding a new number to a
 * series, the new sum of the series is the new value added to the previous sum.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * being added, return `undefined` and the aggregation will be completely
 * recalculated.
 *
 * Where possible, if you are providing a custom Aggregate, seek an
 * implementation of an AggregateAdd function that can reduce the complexity
 * cost of growing the input data set.
 *
 * @param current The current value of the aggregation.
 * @param add The Cell value being added to the aggregation.
 * @param length The length of the array of Cell values in the aggregation.
 * @returns The new value of the aggregation.
 * @category Aggregators
 */
export type AggregateAdd = (
  current: Cell,
  add: Cell,
  length: number,
) => Cell | undefined;

/**
 * The AggregateRemove type describes a function that can be used to optimize a
 * custom Aggregate by providing a shortcut for when a single value is removed
 * from the input values.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when removing a number from a
 * series, the new sum of the series is the new value subtracted from the
 * previous sum.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * being removed, return `undefined` and the aggregation will be completely
 * recalculated. One example might be if you were taking the minimum of the
 * values, and the previous minimum is being removed. The whole of the rest of
 * the list will need to be re-scanned to find a new minimum.
 *
 * Where possible, if you are providing a custom Aggregate, seek an
 * implementation of an AggregateRemove function that can reduce the complexity
 * cost of shrinking the input data set.
 *
 * @param current The current value of the aggregation.
 * @param remove The Cell value being removed from the aggregation.
 * @param length The length of the array of Cell values in the aggregation.
 * @returns The new value of the aggregation.
 * @category Aggregators
 */
export type AggregateRemove = (
  current: Cell,
  remove: Cell,
  length: number,
) => Cell | undefined;

/**
 * The AggregateReplace type describes a function that can be used to optimize a
 * custom Aggregate by providing a shortcut for when a single value in the input
 * values is replaced with another.
 *
 * Some aggregation functions do not need to recalculate the aggregation of the
 * whole set when one value changes. For example, when replacing a number in a
 * series, the new sum of the series is the previous sum, plus the new value,
 * minus the old value.
 *
 * If it is not possible to shortcut the aggregation based on just one value
 * changing, return `undefined` and the aggregation will be completely
 * recalculated.
 *
 * Where possible, if you are providing a custom Aggregate, seek an
 * implementation of an AggregateReplace function that can reduce the complexity
 * cost of changing the input data set in place.
 *
 * @param current The current value of the aggregation.
 * @param add The Cell value being added to the aggregation.
 * @param remove The Cell value being removed from the aggregation.
 * @param length The length of the array of Cell values in the aggregation.
 * @returns The new value of the aggregation.
 * @category Aggregators
 */
export type AggregateReplace = (
  current: Cell,
  add: Cell,
  remove: Cell,
  length: number,
) => Cell | undefined;

export type QueryCallback = (queryId: Id) => void;

export type ResultTableListener = (
  queries: Queries,
  tableId: Id,
  getCellChange: GetCellChange | undefined,
) => void;

export type ResultRowIdsListener = (queries: Queries, tableId: Id) => void;

export type ResultRowListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
  getCellChange: GetCellChange | undefined,
) => void;

export type ResultCellIdsListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
) => void;

export type ResultCellListener = (
  queries: Queries,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  newCell: Cell,
  oldCell: Cell,
  getCellChange: GetCellChange | undefined,
) => void;

export type QueriesListenerStats = {
  table?: number;
  rowIds?: number;
  row?: number;
  cellIds?: number;
  cell?: number;
};

export type GetTableCell = {
  (cellId: Id): CellOrUndefined;
  (joinedTableId: Id, joinedCellId: Id): CellOrUndefined;
};

export type Select = {
  (cellId: Id): SelectedAs;
  (joinedTableId: Id, joinedCellId: Id): SelectedAs;
  (
    getCell: (getTableCell: GetTableCell, rowId: Id) => CellOrUndefined,
  ): SelectedAs;
};
export type SelectedAs = {as: (selectedCellId: Id) => void};

export type Join = {
  (joinedTableId: Id, on: Id): JoinedAs;
  (
    joinedTableId: Id,
    on: (getCell: GetCell, rowId: Id) => Id | undefined,
  ): JoinedAs;
  (joinedTableId: Id, fromIntermediateJoinedTableId: Id, on: Id): JoinedAs;
  (
    joinedTableId: Id,
    fromIntermediateJoinedTableId: Id,
    on: (
      getIntermediateJoinedCell: GetCell,
      intermediateJoinedTableRowId: Id,
    ) => Id | undefined,
  ): JoinedAs;
};
export type JoinedAs = {as: (joinedTableId: Id) => void};

export type Where = {
  (cellId: Id, equals: Cell): void;
  (joinedTableId: Id, joinedCellId: Id, equals: Cell): void;
  (condition: (getTableCell: GetTableCell) => boolean): void;
};

export type Group = (
  selectedCellId: Id,
  aggregate: 'count' | 'sum' | 'avg' | 'min' | 'max' | Aggregate,
  aggregateAdd?: AggregateAdd,
  aggregateRemove?: AggregateRemove,
  aggregateReplace?: AggregateReplace,
) => GroupedAs;
export type GroupedAs = {as: (groupedCellId: Id) => void};

export type Having = {
  (selectedOrGroupedCellId: Id, equals: Cell): void;
  (condition: (getSelectedOrGroupedCell: GetCell) => boolean): void;
};

export type Order = {
  (selectedOrGroupedCellId: Id, descending?: boolean): void;
  (
    getSortKey: (getSelectedOrGroupedCell: GetCell, rowId: Id) => SortKey,
    descending?: boolean,
  ): void;
};

export type Limit = {
  (limit: number): void;
  (offset: number, limit: number): void;
};

export interface Queries {
  setQueryDefinition(
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
  ): Queries;

  delQueryDefinition(queryId: Id): Queries;

  getStore(): Store;

  getQueryIds(): Ids;

  forEachQuery(queryCallback: QueryCallback): void;

  hasQuery(queryId: Id): boolean;

  getTableId(queryId: Id): Id | undefined;

  getResultTable(queryId: Id): Table;

  getResultRowIds(queryId: Id): Ids;

  getResultRow(queryId: Id, rowId: Id): Row;

  getResultCellIds(queryId: Id, rowId: Id): Ids;

  getResultCell(queryId: Id, rowId: Id, cellId: Id): CellOrUndefined;

  hasResultTable(queryId: Id): boolean;

  hasResultRow(queryId: Id, rowId: Id): boolean;

  hasResultCell(queryId: Id, rowId: Id, cellId: Id): boolean;

  forEachResultTable(tableCallback: TableCallback): void;

  forEachResultRow(queryId: Id, rowCallback: RowCallback): void;

  forEachResultCell(queryId: Id, rowId: Id, cellCallback: CellCallback): void;

  addResultTableListener(queryId: IdOrNull, listener: ResultTableListener): Id;

  addResultRowIdsListener(
    queryId: IdOrNull,
    listener: ResultRowIdsListener,
  ): Id;

  addResultRowListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultRowListener,
  ): Id;

  addResultCellIdsListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    listener: ResultCellIdsListener,
  ): Id;

  addResultCellListener(
    queryId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: ResultCellListener,
  ): Id;

  delListener(listenerId: Id): Queries;

  destroy(): void;

  getListenerStats(): QueriesListenerStats;
}

export function createQueries(store: Store): Queries;
