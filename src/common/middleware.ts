import type {Hlc, Id} from '../@types/common/index.d.ts';
import type {
  MergeableChanges,
  MergeableContent,
  RowStamp,
} from '../@types/mergeable-store/index.d.ts';
import type {Changes, Row} from '../@types/store/index.d.ts';
import {arrayReduce} from './array.ts';
import {mapGet, mapNew, mapSet} from './map.ts';
import {IdObj, objForEach, objIsEmpty} from './obj.ts';

// HLC generator function type (optional, only needed for MergeableStore)
type GetNextHlc = () => Hlc;

// Row-level middleware for a specific table
export type RowMiddleware = (rowId: Id | undefined, cells: Row) => Row | null;

// Row-level middleware for all tables (catch-all)
export type AllTablesRowMiddleware = (
  tableId: Id,
  rowId: Id | undefined,
  cells: Row,
) => Row | null;

// Union type for any row middleware handler
export type MiddlewareHandler = RowMiddleware | AllTablesRowMiddleware;

// Extract cells from a RowStamp - just the values, no stamps
const extractCells = (rowStamp: RowStamp<boolean>): Row => {
  const cells: Row = {};
  objForEach(rowStamp[0], ([value], cellId) =>
    value !== undefined ? (cells[cellId] = value) : 0,
  );
  return cells;
};

// Rebuild rowStamp with transformed cells, preserving HLCs or generating new
const rebuildRowStamp = (
  rowStamp: RowStamp<boolean>,
  cells: Row,
  getNextHlc: GetNextHlc,
): RowStamp<boolean> => {
  const newCellsStamp: IdObj<unknown> = {};
  objForEach(cells, (value, cellId) => {
    const orig = rowStamp[0][cellId];
    newCellsStamp[cellId] = orig
      ? [value, orig[1], orig[2]]
      : [value, getNextHlc()];
  });
  return [newCellsStamp, rowStamp[1], rowStamp[2]] as RowStamp<boolean>;
};

// Run handlers through a chain, short-circuiting on null
const runHandlers = <T>(
  initial: T,
  handlers: ((arg: T) => T | null)[],
): T | null =>
  arrayReduce(
    handlers,
    (current, handler) => (current === null ? null : handler(current)),
    initial as T | null,
  );

// Run row-level handlers for a single row
const runRowHandlers = (
  tableMiddlewares: Map<Id, RowMiddleware[]>,
  catchAllMiddlewares: AllTablesRowMiddleware[],
  tableId: Id,
  rowId: Id | undefined,
  cells: Row,
): Row | null => {
  const tableHandlers = mapGet(tableMiddlewares, tableId) || [];
  const result = runHandlers(
    cells,
    tableHandlers.map((h) => (c: Row) => h(rowId, c)),
  );
  return result === null
    ? null
    : runHandlers(
        result,
        catchAllMiddlewares.map((h) => (c: Row) => h(tableId, rowId, c)),
      );
};

// Apply row-level middleware to MergeableChanges (with stamps)
const applyToMergeableChanges = (
  tableMiddlewares: Map<Id, RowMiddleware[]>,
  catchAllMiddlewares: AllTablesRowMiddleware[],
  changes: MergeableChanges | MergeableContent,
  getNextHlc: GetNextHlc,
): MergeableChanges | MergeableContent | null => {
  const [tablesStamp, valuesStamp] = changes;
  const tables = tablesStamp[0] as IdObj<unknown>;

  if (!tables || objIsEmpty(tables)) return changes;

  const filteredTables: IdObj<unknown> = {};

  objForEach(tables, (tableStamp: unknown, tableId) => {
    const [rows] = tableStamp as [IdObj<RowStamp<boolean>>, unknown, unknown];
    const tableHandlers = mapGet(tableMiddlewares, tableId) || [];
    const hasHandlers =
      tableHandlers.length > 0 || catchAllMiddlewares.length > 0;

    if (!hasHandlers) {
      filteredTables[tableId] = tableStamp;
      return;
    }

    const filteredRows: IdObj<unknown> = {};

    objForEach(rows, (rowStamp, rowId) => {
      const cells = runRowHandlers(
        tableMiddlewares,
        catchAllMiddlewares,
        tableId,
        rowId,
        extractCells(rowStamp),
      );

      if (cells !== null) {
        filteredRows[rowId] = rebuildRowStamp(rowStamp, cells, getNextHlc);
      }
    });

    if (!objIsEmpty(filteredRows)) {
      filteredTables[tableId] = [
        filteredRows,
        (tableStamp as [unknown, unknown, unknown])[1],
        (tableStamp as [unknown, unknown, unknown])[2],
      ];
    }
  });

  const newTablesStamp = [
    objIsEmpty(filteredTables) ? {} : filteredTables,
    tablesStamp[1],
    tablesStamp[2],
  ];

  return (
    changes.length === 3
      ? [newTablesStamp, valuesStamp, 1]
      : [newTablesStamp, valuesStamp]
  ) as MergeableChanges | MergeableContent;
};

// Apply row-level middleware to Changes (plain objects, no stamps)
const applyToChanges = (
  tableMiddlewares: Map<Id, RowMiddleware[]>,
  catchAllMiddlewares: AllTablesRowMiddleware[],
  changes: Changes,
): Changes | null => {
  const [tables, values] = changes;

  if (!tables || objIsEmpty(tables)) return changes;

  const filteredTables: {
    [tableId: Id]:
      | {[rowId: Id]: {[cellId: Id]: unknown} | undefined}
      | undefined;
  } = {};
  let anyRowsKept = false;

  objForEach(tables, (table, tableId) => {
    if (table === undefined) {
      // Table deletion - pass through
      filteredTables[tableId] = undefined;
      anyRowsKept = true;
      return;
    }

    const tableHandlers = mapGet(tableMiddlewares, tableId) || [];
    const hasHandlers =
      tableHandlers.length > 0 || catchAllMiddlewares.length > 0;

    if (!hasHandlers) {
      filteredTables[tableId] = table;
      anyRowsKept = true;
      return;
    }

    const filteredRows: {[rowId: Id]: {[cellId: Id]: unknown} | undefined} = {};
    let tableHasRows = false;

    objForEach(table, (row, rowId) => {
      if (row === undefined) {
        // Row deletion - pass through
        filteredRows[rowId] = undefined;
        tableHasRows = true;
        return;
      }

      const cells = runRowHandlers(
        tableMiddlewares,
        catchAllMiddlewares,
        tableId,
        rowId,
        row as Row,
      );

      if (cells !== null) {
        filteredRows[rowId] = cells;
        tableHasRows = true;
      }
    });

    if (tableHasRows) {
      filteredTables[tableId] = filteredRows;
      anyRowsKept = true;
    }
  });

  if (!anyRowsKept && objIsEmpty(values)) {
    return null;
  }

  return [filteredTables, values, 1] as Changes;
};

// Factory function that creates a middleware instance
export const createMiddleware = () => {
  const tableMiddlewares: Map<Id, RowMiddleware[]> = mapNew();
  const catchAllMiddlewares: AllTablesRowMiddleware[] = [];

  return {
    register: (tableId: Id, handler: MiddlewareHandler): void => {
      if (tableId === '*') {
        catchAllMiddlewares.push(handler as AllTablesRowMiddleware);
      } else {
        const handlers = mapGet(tableMiddlewares, tableId) || [];
        handlers.push(handler as RowMiddleware);
        mapSet(tableMiddlewares, tableId, handlers);
      }
    },

    // Apply middleware to a single row (setRow, setCell, setPartialRow, addRow)
    applyToRow: (tableId: Id, rowId: Id | undefined, cells: Row): Row | null =>
      runRowHandlers(
        tableMiddlewares,
        catchAllMiddlewares,
        tableId,
        rowId,
        cells,
      ),

    // Apply middleware to Changes (for applyChanges)
    applyToChanges: (changes: Changes): Changes | null =>
      applyToChanges(tableMiddlewares, catchAllMiddlewares, changes),

    // Apply middleware to MergeableChanges (for applyMergeableChanges)
    applyToMergeableChanges: (
      mergeableChanges: MergeableChanges | MergeableContent,
      getNextHlc: GetNextHlc,
    ): MergeableChanges | MergeableContent | null =>
      applyToMergeableChanges(
        tableMiddlewares,
        catchAllMiddlewares,
        mergeableChanges,
        getNextHlc,
      ),
  };
};
