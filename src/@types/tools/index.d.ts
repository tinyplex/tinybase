/// tools

import type {Store, TablesSchema, ValuesSchema} from '../store/index.d.ts';
import type {Id} from '../common/index.d.ts';

/// StoreStats
export type StoreStats = {
  /// StoreStats.totalTables
  totalTables: number;
  /// StoreStats.totalRows
  totalRows: number;
  /// StoreStats.totalCells
  totalCells: number;
  /// StoreStats.totalValues
  totalValues: number;
  /// StoreStats.jsonLength
  jsonLength: number;
  /// StoreStats.detail
  detail?: StoreStatsDetail;
};

/// StoreStatsDetail
export type StoreStatsDetail = {
  /// StoreStatsDetail.tables
  tables: {[tableId: Id]: StoreStatsTableDetail};
};

/// StoreStatsTableDetail
export type StoreStatsTableDetail = {
  /// StoreStatsTableDetail.tableRows
  tableRows: number;
  /// StoreStatsTableDetail.tableCells
  tableCells: number;
  /// StoreStatsTableDetail.rows
  rows: {[rowId: Id]: StoreStatsRowDetail};
};

/// StoreStatsRowDetail
export type StoreStatsRowDetail = {
  /// StoreStatsRowDetail.rowCells
  rowCells: number;
};

/// Tools
export interface Tools {
  //
  /* eslint-disable max-len */
  /// getStoreStats
  getStoreStats(detail?: boolean): StoreStats;

  /* eslint-enable max-len */

  /// getStoreTablesSchema
  getStoreTablesSchema(): TablesSchema;

  /// getStoreValuesSchema
  getStoreValuesSchema(): ValuesSchema;

  /// getStoreApi
  getStoreApi(storeName: string): [string, string, string, string];

  /// getPrettyStoreApi
  getPrettyStoreApi(
    storeName: string,
  ): Promise<[string, string, string, string]>;

  /// getStore
  getStore(): Store;
  //
}

/* eslint-disable max-len */
/// createTools
export function createTools(store: Store): Tools;
//

/* eslint-enable max-len */
