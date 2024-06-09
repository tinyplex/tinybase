/// tools

import type {OptionalSchemas, Store} from '../../store/with-schemas/index.d.ts';
import type {Id} from '../../common/with-schemas/index.d.ts';

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
export interface Tools<in out Schemas extends OptionalSchemas> {
  /* eslint-disable max-len */
  /// getStoreStats
  getStoreStats(detail?: boolean): StoreStats;

  /* eslint-enable max-len */

  /// getStoreTablesSchema
  getStoreTablesSchema(): Schemas[0];

  /// getStoreValuesSchema
  getStoreValuesSchema(): Schemas[1];

  /// getStoreApi
  getStoreApi(storeName: string): [string, string, string, string];

  /// getPrettyStoreApi
  getPrettyStoreApi(
    storeName: string,
  ): Promise<[string, string, string, string]>;

  /// getStore
  getStore(): Store<Schemas>;
}

/* eslint-disable max-len */
/// createTools
export function createTools<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Tools<Schemas>;

/* eslint-enable max-len */
