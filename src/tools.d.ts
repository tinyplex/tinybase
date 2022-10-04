/**
 * The tools module of the TinyBase project provides utilities for working with
 * TinyBase during development.
 *
 * This module is not intended to be directly used at runtime in a production
 * environment.
 *
 * @packageDocumentation
 * @module tools
 * @since v2.2.0
 */

import {Id} from './common.d';
import {Store} from './store.d';

/**
 * The StoreStats type describes a set of statistics about the Store, and
 * is used for debugging purposes.
 *
 * A StoreStats object is returned from the getStoreStats method.
 *
 * @category Statistics
 * @since v2.2.0
 */
export type StoreStats = {
  /**
   * The number of Table objects in the Store.
   */
  totalTables: number;
  /**
   * The number of Row objects in the Store, across all Table objects.
   */
  totalRows: number;
  /**
   * The number of Cell objects in the Store, across all Row objects, across all
   * Table objects.
   */
  totalCells: number;
  /**
   * The string length of the Store when serialized to JSON.
   */
  jsonLength: number;
  /**
   * Additional detailed statistics about the Store if the `detail` flag is
   * specified in the getStoreStats method.
   */
  detail?: StoreStatsDetail;
};

/**
 * The StoreStatsDetail type describes a more detailed set of statistics about
 * the Store, and is used for debugging purposes.
 *
 * A StoreStatsDetail object is added to the StoreStats object (returned from
 * the getStoreStats method) when the `detail` flag is specified.
 *
 * @category Statistics
 * @since v2.2.0
 */
export type StoreStatsDetail = {
  /**
   * Information about each Table in the Store.
   */
  tables: {[tableId: Id]: StoreStatsTableDetail};
};

/**
 * The StoreStatsTableDetail type describes a detailed set of statistics about a
 * single Table in the Store, and is used for debugging purposes.
 *
 * @category Statistics
 * @since v2.2.0
 */
export type StoreStatsTableDetail = {
  /**
   * The number of Row objects in the Table.
   */
  tableRows: number;
  /**
   * The number of Cell objects in the Table, across all Row objects.
   */
  tableCells: number;
  rows: {[rowId: Id]: StoreStatsRowDetail};
};

/**
 * The StoreStatsRowDetail type describes statistics about a single Row in the
 * Store, and is used for debugging purposes.
 *
 * @category Statistics
 * @since v2.2.0
 */
export type StoreStatsRowDetail = {
  /**
   * The number of Cell objects in the Row.
   */
  rowCells: number;
};

/**
 * A Tools object lets you run various utilities on, and get certain information
 * about, Store objects in development.
 *
 * @category Tools
 * @since v2.2.0
 */
export interface Tools {
  /**
   * The getStoreStats method provides a set of statistics about the Store, and
   * is used for debugging purposes.
   *
   * @param detail An optional boolean that indicates more detailed stats about
   * the inner structure of the Store should be returned.
   * @returns A StoreStats object containing statistics about the Store.
   * @example
   * This example creates a Tools object and gets basic statistics about it.
   * ```js
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog', color: 'brown'},
   *     felix: {species: 'cat', color: 'black'},
   *     cujo: {species: 'dog', color: 'black'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   * const tools = createTools(store);
   * console.log(tools.getStoreStats());
   * // -> {totalTables: 2, totalRows: 5, totalCells: 8, jsonLength: 182}
   * ```
   * @example
   * This example creates a Tools object and gets detailed statistics about it.
   * ```js
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog', color: 'brown'},
   *     felix: {species: 'cat', color: 'black'},
   *     cujo: {species: 'dog', color: 'black'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5},
   *     cat: {price: 4},
   *   });
   * const stats = createTools(store).getStoreStats(true);
   *
   * console.log(stats.totalTables);
   * // -> 2
   * console.log(stats.totalRows);
   * // -> 5
   * console.log(stats.totalCells);
   * // -> 8
   * console.log(stats.detail.tables.pets.tableRows);
   * // -> 3
   * console.log(stats.detail.tables.pets.tableCells);
   * // -> 6
   * console.log(stats.detail.tables.pets.rows);
   * // -> {fido: {rowCells: 2}, felix: {rowCells: 2}, cujo: {rowCells: 2}}
   * ```
   * @category Statistics
   * @since v2.2.0
   */
  getStoreStats(detail?: boolean): StoreStats;
}

/**
 * The createTools function creates a Tools object, and is the main entry point
 * into the tools module.
 *
 * A given Store can only have one Tools object associated with it. If you call
 * this function twice on the same Store, your second call will return a
 * reference to the Tools object created by the first.
 *
 * @param store The Store for which to register tools.
 * @returns A reference to the new Tools object.
 * @example
 * This example creates a Tools object.
 *
 * ```js
 * const store = createStore()
 *   .setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   })
 *   .setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *   });
 * const tools = createTools(store);
 * console.log(tools.getStoreStats());
 * // -> {totalTables: 2, totalRows: 5, totalCells: 8, jsonLength: 182}
 * ```
 * @example
 * This example creates a Tools object, and calls the method a second time
 * for the same Store to return the same object.
 *
 * ```js
 * const store = createStore();
 * const tools1 = createTools(store);
 * const tools2 = createTools(store);
 * console.log(tools1 === tools2);
 * // -> true
 * ```
 * @category Creation
 * @since v2.2.0
 */
export function createTools(store: Store): Tools;
