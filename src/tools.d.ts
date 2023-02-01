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

import {Store, TablesSchema, ValuesSchema} from './store.d';
import {Id} from './common.d';

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
   * The number of Value objects in the Store, since v3.0.0.
   */
  totalValues: number;
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
 * @see Developer Tools guides
 * @category Tools
 * @since v2.2.0
 */
export interface Tools {
  /* eslint-disable max-len */
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
   *   })
   *   .setValues({open: true, employees: 3});
   * const tools = createTools(store);
   * console.log(tools.getStoreStats());
   * // -> {totalTables: 2, totalRows: 5, totalCells: 8, totalValues: 2, jsonLength: 212}
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
  /* eslint-enable max-len */

  /**
   * The getStoreTablesSchema method returns the TablesSchema of the Store as an
   * object.
   *
   * If the Store does not already have an explicit TablesSchema associated with
   * it, the data in the Store will be scanned to attempt to infer a new
   * TablesSchema.
   *
   * To be successful, this requires all the values of a given Cell across a
   * Table object's Row objects to have a consistent type. If a given Cell Id
   * appears in every Row, then a `default` for that Cell is specified in the
   * TablesSchema, based on the most common value found.
   *
   * @returns A TablesSchema object for the Store.
   * @example
   * This example creates a Tools object and gets the schema of a Store that
   * already has a TablesSchema.
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {
   *     species: {type: 'string'},
   *     color: {type: 'string'},
   *   },
   *   species: {
   *     price: {type: 'number'},
   *   },
   * });
   * const schema = createTools(store).getStoreTablesSchema();
   * console.log(schema.pets);
   * // -> {species: {type: 'string'}, color: {type: 'string'}}
   * ```
   * @example
   * This example creates a Tools object and infers the schema of a Store that
   * doesn't already have a TablesSchema.
   * ```js
   * const store = createStore()
   *   .setTable('pets', {
   *     fido: {species: 'dog', color: 'brown'},
   *     felix: {species: 'cat', color: 'black'},
   *     cujo: {species: 'dog', color: 'black'},
   *   })
   *   .setTable('species', {
   *     dog: {price: 5, barks: true},
   *     cat: {price: 4, purrs: true},
   *   });
   * const schema = createTools(store).getStoreTablesSchema();
   * console.log(schema.pets.species);
   * // -> {type: 'string', default: 'dog'}
   * console.log(schema.pets.color);
   * // -> {type: 'string', default: 'black'}
   * console.log(schema.species.price);
   * // -> {type: 'number', default: 5}
   * console.log(schema.species.barks);
   * // -> {type: 'boolean'}
   * console.log(schema.species.purrs);
   * // -> {type: 'boolean'}
   * ```
   * @category Modelling
   * @since v3.0.0
   */
  getStoreTablesSchema(): TablesSchema;

  /**
   * The getStoreValuesSchema method returns the ValuesSchema of the Store as an
   * object.
   *
   * If the Store does not already have an explicit ValuesSchema associated with
   * it, the data in the Store will be scanned to infer a new ValuesSchema,
   * based on the types of the Values present. Note that, unlike the inference
   * of Cell values in the TablesSchema, it is not able to determine whether a
   * Value should have a default or not.
   *
   * @returns A ValuesSchema object for the Store.
   * @example
   * This example creates a Tools object and gets the schema of a Store that
   * already has a ValuesSchema.
   * ```js
   * const store = createStore().setValuesSchema({
   *   open: {type: 'boolean', default: true},
   *   employees: {type: 'number'},
   * });
   *
   * const schema = createTools(store).getStoreValuesSchema();
   * console.log(schema);
   * // -> {open: {type: 'boolean', default: true}, employees: {type: 'number'}}
   * ```
   * @example
   * This example creates a Tools object and infers the schema of a Store that
   * doesn't already have a ValuesSchema.
   * ```js
   * const store = createStore().setValues({open: true, employees: 3});
   * const schema = createTools(store).getStoreValuesSchema();
   *
   * console.log(schema);
   * // -> {open: {type: 'boolean'}, employees: {type: 'number'}}
   * ```
   * @category Modelling
   * @since v3.0.0
   */
  getStoreValuesSchema(): ValuesSchema;

  /**
   * The getStoreApi method returns code-generated .d.ts .ts files that describe
   * the schema of a Store and React bindings (since v3.1.0) in an ORM style.
   *
   * If the Store does not already have an explicit TablesSchema or ValuesSchema
   * associated with it, the data in the Store will be scanned to attempt to
   * infer new schemas. The method returns four strings (which should be saved
   * as files) though if no schema can be inferred, the strings will be empty.
   *
   * The method takes a single argument which represents the name you want the
   * generated store object to have in code. You are expected to save the four
   * files yourself, as, respectively:
   *
   * - `[storeName].d.ts`
   * - `[storeName].ts`,
   * - `[storeName]-ui-react.d.ts`
   * - `[storeName]-ui-react.ts`,
   *
   * Also you should save these alongside each other so that the .ts files can
   * import types from the .d.ts files.
   *
   * The .d.ts and .ts files that are generated are designed to resemble the
   * main TinyBase Store and React binding files, but provide named types and
   * methods that describe the domain of the schema in the store.
   *
   * For example, from a Store that has a `pets` Table, you will get methods
   * like `getPetsTable`, types like `PetsRow`, and hooks and components that
   * are more specific versions of the underlying getTable method or the Row
   * type, and so on. For example:
   *
   * |Store type|Equivalent generated type|
   * |-|-|
   * |Table|[Table]Table|
   * |Row|[Table]Row|
   * |(Cell) Id|[Table]CellId|
   * |CellCallback|[Table]CellCallback|
   * |...|...|
   *
   * |Store method|Equivalent generated method|
   * |-|-|
   * |setTable|set[Table]Table|
   * |hasRow|has[Table]Row|
   * |getCell|get[Table][Cell]Cell|
   * |...|...|
   *
   * Equivalent to the TinyBase createStore function, a `create[StoreName]`
   * function will also be created. This acts as the main entry point to the
   * generated implementation.
   *
   * Each method is refined correctly to take, or return, the types specified by
   * the schema. For example, if the `pets` Table has a numeric `price` Cell in
   * the schema, the `getPetsPriceCell` method will be typed to return a number.
   *
   * The tables above include just a sample of the generated output. For the
   * full set of methods and types generated by this method, inspect the output
   * directly.
   *
   * @param storeName The name you want to provide to the generated Store, which
   * should also be used to save the `.d.ts` and `.ts` files.
   * @returns A set of four strings representing the contents of the `.d.ts` and
   * `.ts` files for the generated Store and React modules.
   * @example
   * This example creates a Tools object and generates code for a Store that
   * already has a TablesSchema.
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {
   *     price: {type: 'number'},
   *   },
   * });
   * const [dTs, ts, dTsUiReact, tsUiReact] =
   *   createTools(store).getStoreApi('shop');
   *
   * const dTsLines = dTs.split('\n');
   * console.log(dTsLines[3]);
   * // -> 'export type PetsTable = {[rowId: Id]: PetsRow};'
   * console.log(dTsLines[6]);
   * // -> 'export type PetsRow = {\'price\'?: number;};'
   *
   * const tsLines = ts.split('\n');
   * console.log(tsLines[41]);
   * // -> 'getPetsTable: (): PetsTable => store.getTable(PETS) as PetsTable,'
   * ```
   * @example
   * This example creates a Tools object and generates code for a Store that
   * doesn't already have a TablesSchema.
   * ```js
   * const store = createStore().setTable('pets', {
   *   fido: {price: 5},
   *   felix: {price: 4},
   * });
   * const [dTs, ts, dTsUiReact, tsUiReact] =
   *   createTools(store).getStoreApi('shop');
   *
   * const dTsLines = dTs.split('\n');
   * console.log(dTsLines[3]);
   * // -> 'export type PetsTable = {[rowId: Id]: PetsRow};'
   * console.log(dTsLines[6]);
   * // -> 'export type PetsRow = {\'price\': number;};'
   *
   * const tsLines = ts.split('\n');
   * console.log(tsLines[43]);
   * // -> 'getPetsTable: (): PetsTable => store.getTable(PETS) as PetsTable,'
   * ```
   * @category Modelling
   * @since v2.2.0
   */
  getStoreApi(storeName: string): [string, string, string, string];

  /**
   * The getPrettyStoreApi method attempts to returns a prettified
   * code-generated .d.ts and .ts files that describe the schema of a Store and
   * React bindings (since v3.1.0) in an ORM style.
   *
   * This is simply a wrapper around the getStoreApi method that attempts to
   * invoke the `prettier` module (which it hopes you have installed) to format
   * the generated code. If `prettier` is not present, the output will resemble
   * that of the underlying getStoreApi method.
   *
   * The method is asynchronous, so you should use the `await` keyword or handle
   * the results as a promise.
   *
   * The method takes a single argument which represents the name you want the
   * generated store object to have in code. You are expected to save the four
   * files yourself, as, respectively:
   *
   * - `[storeName].d.ts`
   * - `[storeName].ts`,
   * - `[storeName]-ui-react.d.ts`
   * - `[storeName]-ui-react.ts`,
   *
   * Also you should save these alongside each other so that the .ts files can
   * import types from the .d.ts files.
   *
   * See the documentation for the getStoreApi method for details of the content
   * of the generated files.
   *
   * @param storeName The name you want to provide to the generated Store, which
   * should also be used to save the `.d.ts` and `.ts` files.
   * @returns A set of four strings representing the contents of the `.d.ts` and
   * `.ts` files for the generated Store and React modules.
   * @example
   * This example creates a Tools object and generates code for a Store that
   * already has a TablesSchema.
   * ```js
   * const store = createStore().setTablesSchema({
   *   pets: {
   *     price: {type: 'number'},
   *   },
   * });
   * const tools = createTools(store);
   * const [dTs, ts, dTsUiReact, tsUiReact] =
   *   await createTools(store).getPrettyStoreApi('shop');
   *
   * const dTsLines = dTs.split('\n');
   * console.log(dTsLines[5]);
   * // -> 'export type PetsTable = {[rowId: Id]: PetsRow};'
   * console.log(dTsLines[10]);
   * // -> 'export type PetsRow = {price?: number};'
   *
   * const tsLines = ts.split('\n');
   * console.log(tsLines[72]);
   * // -> '    hasPetsTable: (): boolean => store.hasTable(PETS),'
   * ```
   * @example
   * This example creates a Tools object and generates code for a Store that
   * doesn't already have a TablesSchema.
   * ```js
   * const store = createStore().setTable('pets', {
   *   fido: {price: 5},
   *   felix: {price: 4},
   * });
   * const tools = createTools(store);
   * const [dTs, ts, dTsUiReact, tsUiReact] =
   *   await createTools(store).getPrettyStoreApi('shop');
   *
   * const dTsLines = dTs.split('\n');
   * console.log(dTsLines[5]);
   * // -> 'export type PetsTable = {[rowId: Id]: PetsRow};'
   * console.log(dTsLines[10]);
   * // -> 'export type PetsRow = {price: number};'
   *
   * const tsLines = ts.split('\n');
   * console.log(tsLines[74]);
   * // -> '    hasPetsTable: (): boolean => store.hasTable(PETS),'
   * ```
   * @category Modelling
   * @since v2.2.0
   */
  getPrettyStoreApi(
    storeName: string,
  ): Promise<[string, string, string, string]>;

  /**
   * The getStore method returns a reference to the underlying Store that is
   * backing this Tools object.
   *
   * @returns A reference to the Store.
   * @example
   * This example creates a Tools object against a newly-created Store and
   * then gets its reference in order to update its data.
   *
   * ```js
   * const tools = createTools(createStore());
   * tools.getStore().setCell('species', 'dog', 'price', 5);
   * console.log(tools.getStoreStats().totalCells);
   * // -> 1
   * ```
   * @category Getter
   * @since v3.0.0
   */
  getStore(): Store;
}

/* eslint-disable max-len */
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
 *   })
 *   .setValues({open: true, employees: 3});
 * const tools = createTools(store);
 * console.log(tools.getStoreStats());
 * // -> {totalTables: 2, totalRows: 5, totalCells: 8, totalValues: 2, jsonLength: 212}
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
/* eslint-enable max-len */
