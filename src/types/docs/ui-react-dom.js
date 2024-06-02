/**
 * The ui-react-dom module of the TinyBase project provides components to make
 * it easy to create web-based reactive apps with Store objects.
 *
 * The components in this module use the react-dom module and so are not
 * appropriate for environments like React Native (although those in the
 * lower-level ui-react module are).
 * @see UI Components demos
 * @packageDocumentation
 * @module ui-react-dom
 * @since v4.1.0
 */
/// ui-react-dom
/**
 * The CustomCell object is used to configure custom cell rendering in an HTML
 * table.
 * @category Configuration
 * @since v4.1.0
 */
/// CustomCell
{
  /**
   * An optional string that will be used as the label at the top of the table
   * column for this Cell.
   */
  /// CustomCell.label
  /**
   * An optional custom component for rendering each Cell in the Table (to
   * override the default CellView component).
   */
  /// CustomCell.component
  /**
   * An optional function for generating extra props for each custom Cell
   * component based on Row and Cell Id.
   */
  /// CustomCell.getComponentProps
}
/**
 * The CustomResultCell object is used to configure custom cell rendering for
 * query results in an HTML table.
 * @category Configuration
 * @since v4.1.0
 */
/// CustomResultCell
{
  /**
   * An optional string that will be used as the label at the top of the table
   * column for this Cell.
   */
  /// CustomResultCell.label
  /**
   * An optional custom component for rendering each Cell in the ResultTable (to
   * override the default ResultCellView component).
   */
  /// CustomResultCell.component
  /**
   * An optional function for generating extra props for each custom Cell
   * component based on Row and Cell Id.
   */
  /// CustomResultCell.getComponentProps
}
/**
 * HtmlTableProps props are used for components that will render in an HTML
 * table, such as the TableInHtmlTable component or SortedTableInHtmlTable
 * component.
 * @category Props
 * @since v4.1.0
 */
/// HtmlTableProps
{
  /**
   * A string className to use on the root of the resulting element.
   */
  /// HtmlTableProps.className
  /**
   * Whether a header row should be rendered at the top of the table, defaulting
   * to `true`.
   */
  /// HtmlTableProps.headerRow
  /**
   * Whether an Id column should be rendered on the left of the table,
   * defaulting to `true`.
   */
  /// HtmlTableProps.idColumn
}
/**
 * TableInHtmlTableProps props are used for components that will render a Table
 * in an HTML table, such as the TableInHtmlTable component.
 * @category Props
 * @since v4.1.0
 */
/// TableInHtmlTableProps
{
  /**
   * The Id of the Table in the Store to be rendered.
   */
  /// TableInHtmlTableProps.tableId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   */
  /// TableInHtmlTableProps.store
  /**
   * Whether the Cells should be editable. This affects the default CellView
   * component (to use the EditableCellView component instead) but of course
   * will not affect custom Cell components if you have set them.
   */
  /// TableInHtmlTableProps.editable
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Table's Cells in a given order. This can also be an object with the desired
   * Cell Ids as keys, and with a value that can either be a string label to
   * show in the column header, or a CustomCell object to further configure the
   * column.
   */
  /// TableInHtmlTableProps.customCells
}
/**
 * SortedTableInHtmlTableProps props are used for components that will render a
 * sorted Table in an HTML table, such as the SortedTableInHtmlTable component.
 * @category Props
 * @since v4.1.0
 */
/// SortedTableInHtmlTableProps
{
  /**
   * The Id of the Table in the Store to be rendered.
   */
  /// SortedTableInHtmlTableProps.tableId
  /**
   * The Id of the Cell whose values are used for the sorting. If omitted, the
   * view will sort the Row Id itself.
   */
  /// SortedTableInHtmlTableProps.cellId
  /**
   * Whether the sorting should be in descending order.
   */
  /// SortedTableInHtmlTableProps.descending
  /**
   * The number of Row Ids to skip for pagination purposes.
   */
  /// SortedTableInHtmlTableProps.offset
  /**
   * The maximum number of Row Ids to return.
   */
  /// SortedTableInHtmlTableProps.limit
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   */
  /// SortedTableInHtmlTableProps.store
  /**
   * Whether the Cells should be editable. This affects the default CellView
   * component (to use the EditableCellView component instead) but of course
   * will not affect custom Cell components if you have set them.
   */
  /// SortedTableInHtmlTableProps.editable
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Table's Cells in a given order. This can also be an object with the desired
   * Cell Ids as keys, and with a value that can either be a string label to
   * show in the column header, or a CustomCell object to further configure the
   * column.
   */
  /// SortedTableInHtmlTableProps.customCells
  /**
   * Whether the table should be interactive such that clicking a header changes
   * the sorting and/or direction.
   */
  /// SortedTableInHtmlTableProps.sortOnClick
  /**
   * Either `true` to show the default SortedTablePaginator for the Table, or
   * provide your own paginator component that takes SortedTablePaginatorProps.
   */
  /// SortedTableInHtmlTableProps.paginator
  /**
   * A function that is called whenever the sorting or pagination of the Table
   * is changed by the user, invoked with the sorted Cell Id, whether descending
   * or not, and the offset of the pagination.
   */
  /// SortedTableInHtmlTableProps.onChange
}
/**
 * ValuesInHtmlTableProps props are used for components that will render Values
 * in an HTML table, such as the ValuesInHtmlTable component.
 * @category Props
 * @since v4.1.0
 */
/// ValuesInHtmlTableProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   */
  /// ValuesInHtmlTableProps.store
  /**
   * Whether the Values should be editable. This affects the default ValueView
   * component (to use the EditableValueView component instead) but of course
   * will not affect a custom valueComponent if you have set one.
   */
  /// ValuesInHtmlTableProps.editable
  /**
   * A custom component for rendering each Value in the Store (to override the
   * default ValueView component).
   */
  /// ValuesInHtmlTableProps.valueComponent
  /**
   * A function for generating extra props for each custom Value component based
   * on its Id.
   */
  /// ValuesInHtmlTableProps.getValueComponentProps
}
/**
 * SliceInHtmlTableProps props are used for components that will render an Index
 * Slice in an HTML table, such as the SliceInHtmlTable component.
 * @category Props
 * @since v4.1.0
 */
/// SliceInHtmlTableProps
{
  /**
   * The Id of the Index in the Indexes object.
   */
  /// SliceInHtmlTableProps.indexId
  /**
   * The Id of the Slice in the Index to be rendered.
   */
  /// SliceInHtmlTableProps.sliceId
  /**
   * The Indexes object to be accessed: omit for the default context Indexes
   * object, provide an Id for a named context Indexes object, or provide an
   * explicit reference.
   */
  /// SliceInHtmlTableProps.indexes
  /**
   * Whether the Cells should be editable. This affects the default CellView
   * component (to use the EditableCellView component instead) but of course
   * will not affect custom Cell components if you have set them.
   */
  /// SliceInHtmlTableProps.editable
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Slice's Cells in a given order. This can also be an object with the desired
   * Cell Ids as keys, and with a value that can either be a string label to
   * show in the column header, or a CustomCell object to further configure the
   * column.
   */
  /// SliceInHtmlTableProps.customCells
}
/**
 * RelationshipInHtmlTableProps props are used for components that will render
 * the contents of the two Tables linked by a Relationship as an HTML table,
 * such as the RelationshipInHtmlTable component.
 *
 * Note the use of dotted 'tableId.cellId' string pairs when specifying custom
 * rendering for the cells in this table, since Cells from both the
 * relationship's 'local' and 'remote' Table objects can be rendered and need to
 * be distinguished
 * @category Props
 * @since v4.1.0
 */
/// RelationshipInHtmlTableProps
{
  /**
   * The Id of the relationship in the Relationships object for which the
   * relationship Table Rows will be rendered.
   */
  /// RelationshipInHtmlTable.relationshipId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   */
  /// RelationshipInHtmlTable.relationships
  /**
   * Whether the Cells should be editable. This affects the default CellView
   * component (to use the EditableCellView component instead) but of course
   * will not affect custom Cell components if you have set them.
   */
  /// RelationshipInHtmlTable.editable
  /**
   * An optional list of dotted 'tableId.cellId' string pairs to use for
   * rendering a prescribed set of the relationship Tables' Cells in a given
   * order. This can also be an object with the desired 'tableId.cellId' string
   * pairs as keys, and with a value that can either be a string label to show
   * in the column header, or a CustomCell object to further configure the
   * column.
   */
  /// RelationshipInHtmlTable.customCells
}
/**
 * ResultTableInHtmlTableProps props are used for components that will render a
 * ResultTable in an HTML table, such as the ResultTableInHtmlTable component.
 * @category Props
 * @since v4.1.0
 */
/// ResultTableInHtmlTableProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   */
  /// ResultTableInHtmlTableProps.queryId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   */
  /// ResultTableInHtmlTableProps.queries
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * ResultTable's Cells in a given order. This can also be an object with the
   * desired Cell Ids as keys, and with a value that can either be a string
   * label to show in the column header, or a ResultCustomCell object to further
   * configure the column.
   */
  /// ResultTableInHtmlTableProps.customCells
}
/**
 * ResultSortedTableInHtmlTableProps props are used for components that will
 * render a sorted Table in an HTML table, such as the SortedTableInHtmlTable
 * component.
 * @category Props
 * @since v4.1.0
 */
/// ResultSortedTableInHtmlTableProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   */
  /// ResultSortedTableInHtmlTableProps.queryId
  /**
   * The Id of the Cell whose values are used for the sorting. If omitted, the
   * view will sort the Row Id itself.
   */
  /// ResultSortedTableInHtmlTableProps.cellId
  /**
   * Whether the sorting should be in descending order.
   */
  /// ResultSortedTableInHtmlTableProps.descending
  /**
   * The number of Row Ids to skip for pagination purposes.
   */
  /// ResultSortedTableInHtmlTableProps.offset
  /**
   * The maximum number of Row Ids to return.
   */
  /// ResultSortedTableInHtmlTableProps.limit
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   */
  /// ResultSortedTableInHtmlTableProps.queries
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * ResultTable's Cells in a given order. This can also be an object with the
   * desired Cell Ids as keys, and with a value that can either be a string
   * label to show in the column header, or a ResultCustomCell object to further
   * configure the column.
   */
  /// ResultSortedTableInHtmlTableProps.customCells
  /**
   * Whether the table should be interactive such that clicking a header changes
   * the sorting and/or direction.
   */
  /// ResultSortedTableInHtmlTableProps.sortOnClick
  /**
   * Either `true` to show the default SortedTablePaginator for the ResultTable,
   * or provide your own paginator component that takes
   * SortedTablePaginatorProps.
   */
  /// ResultSortedTableInHtmlTableProps.paginator
  /**
   * A function that is called whenever the sorting or pagination of the
   * ResultTable is changed by the user, invoked with the sorted Cell Id,
   * whether descending or not, and the offset of the pagination.
   */
  /// ResultSortedTableInHtmlTableProps.onChange
}
/**
 * SortedTablePaginatorProps props are used for components that will be used as
 * a table paginator, such as the SortedTablePaginator component.
 * @category Props
 * @since v4.1.0
 */
/// SortedTablePaginatorProps
{
  /**
   * An event that will fire when the offset is updated, called with the new
   * offset.
   */
  /// SortedTablePaginatorProps.onChange
  /**
   * The number of Row Ids to skip for pagination.
   */
  /// SortedTablePaginatorProps.offset
  /**
   * The maximum number of Row Ids being returned.
   */
  /// SortedTablePaginatorProps.limit
  /**
   * The total number of Row Ids in the paginated table.
   */
  /// SortedTablePaginatorProps.total
  /**
   * A noun to use in the pagination label for a single row, defaulting to
   * 'row'.
   */
  /// SortedTablePaginatorProps.singular
  /**
   * A noun to use in the pagination label for multiple rows, defaulting to the
   * value of the singular noun suffixed with the letter 's'.
   */
  /// SortedTablePaginatorProps.plural
}
/**
 * StoreInspectorProps props are used to configure the StoreInspector component.
 * @category Props
 * @since v4.1.0
 */
/// StoreInspectorProps
{
  /**
   * An optional string to indicate where you want the inspector to first
   * appear.
   */
  /// StoreInspectorProps.position
  /**
   * An optional boolean to indicate whether the inspector should start in the
   * opened state.
   */
  /// StoreInspectorProps.open
}
/**
 * The TableInHtmlTable component renders the contents of a single Table in a
 * Store as an HTML <table> element, and registers a listener so that any
 * changes to that result will cause a re-render.
 *
 * See the <TableInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which Table to render based on Table Id, and
 * Store (which is either the default context Store, a named context Store, or
 * by explicit reference).
 *
 * This component renders a Table by iterating over its Row objects. By default
 * the Cells are in turn rendered with the CellView component, but you can
 * override this behavior by providing a `component` for each Cell in the
 * `customCells` prop. You can pass additional props to that custom component
 * with the `getComponentProps` callback. See the CustomCell type for more
 * details.
 *
 * This component uses the useRowIds hook under the covers, which means that any
 * changes to the structure of the Table will cause a re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether the Ids
 * appear in a <th> element at the top of the table, and the start of each row.
 * @param props The props for this component.
 * @returns A rendering of the Table in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TableInHtmlTable component within it then renders the Table in
 * a <table> element with a CSS class.
 *
 * ```jsx
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {TableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <TableInHtmlTable tableId="pets" className="table" />;
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class="table">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th>species</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>fido</th>
 *       <td>dog</td>
 *     </tr>
 *     <tr>
 *       <th>felix</th>
 *       <td>cat</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TableInHtmlTable component within it then renders the Table
 * with a custom component and a custom props callback for the `species` Cell.
 * The header row at the top of the table and the Id column at the start of each
 * row is removed.
 *
 * ```jsx
 * import {CellView, Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {TableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <TableInHtmlTable
 *     tableId="pets"
 *     customCells={customCells}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 *
 * const FormattedCellView = ({tableId, rowId, cellId, bold}) => (
 *   <>
 *     {bold ? <b>{rowId}</b> : rowId}:
 *     <CellView tableId={tableId} rowId={rowId} cellId={cellId} />
 *   </>
 * );
 * const customCells = {
 *   species: {
 *     component: FormattedCellView,
 *     getComponentProps: (rowId, cellId) => ({bold: rowId == 'fido'}),
 *   },
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td><b>fido</b>:dog</td>
 *     </tr>
 *     <tr>
 *       <td>felix:cat</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// TableInHtmlTable
/**
 * The SortedTableInHtmlTable component renders the contents of a single sorted
 * Table in a Store, as an HTML <table> element, and registers a listener so
 * that any changes to that result will cause a re-render.
 *
 * See the <SortedTableInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which Table to render based on Table Id, and
 * Store (which is either the default context Store, a named context Store, or
 * by explicit reference). It also takes a Cell Id to sort by and a boolean to
 * indicate that the sorting should be in descending order. The `offset` and
 * `limit` props are used to paginate results, but default to `0` and
 * `undefined` to return all available Row Ids if not specified.
 *
 * This component renders a ResultTable by iterating over its Row objects, in
 * the order dictated by the sort parameters. By default the Cells are in turn
 * rendered with the CellView component, but you can override this behavior by
 * providing a `component` for each Cell in the `customCells` prop. You can pass
 * additional props to that custom component with the `getComponentProps`
 * callback. See the CustomCell type for more details.
 *
 * This component uses the useSortedRowIds hook under the covers, which means
 * that any changes to the structure or sorting of the Table will cause a
 * re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether the Ids
 * appear in a <th> element at the top of the table, and the start of each row.
 *
 * The `sortOnClick` prop makes the table's sorting interactive such that the
 * user can click on a column heading to sort by that column. The style classes
 * `sorted` and `ascending` (or `descending`) are added so that you can provide
 * hints to the user how the sorting is being applied.
 *
 * Provide a paginator component for the Table with the `paginator` prop. Set to
 * `true` to use the default SortedTablePaginator, or provide your own component
 * that accepts SortedTablePaginatorProps.
 *
 * Finally, the `onChange` prop lets you listen to a user's changes to the
 * Table's sorting or pagination.
 * @param props The props for this component.
 * @returns A rendering of the Table in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableInHtmlTable component within it then renders the
 * Table in a <table> element with a CSS class.
 *
 * ```jsx
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {SortedTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <SortedTableInHtmlTable
 *     tableId="pets"
 *     cellId="species"
 *     className="table"
 *   />
 * );
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *   },
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class="table">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th class="sorted ascending">↑ species</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>felix</th>
 *       <td>cat</td>
 *     </tr>
 *     <tr>
 *       <th>fido</th>
 *       <td>dog</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableInHtmlTable component within it then renders the
 * Table with a custom component and a custom props callback for the `species`
 * Cell. The header row at the top of the table and the Id column at the start
 * of each row is removed.
 *
 * ```jsx
 * import {CellView, Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {SortedTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const Pane = () => (
 *   <SortedTableInHtmlTable
 *     tableId="pets"
 *     cellId="species"
 *     customCells={customCells}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 *
 * const FormattedCellView = ({tableId, rowId, cellId, bold}) => (
 *   <>
 *     {bold ? <b>{rowId}</b> : rowId}:
 *     <CellView tableId={tableId} rowId={rowId} cellId={cellId} />
 *   </>
 * );
 * const customCells = {
 *   species: {
 *     component: FormattedCellView,
 *     getComponentProps: (rowId, cellId) => ({bold: rowId == 'fido'}),
 *   },
 * };
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *   },
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>felix:cat</td>
 *     </tr>
 *     <tr>
 *       <td><b>fido</b>:dog</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// SortedTableInHtmlTable
/**
 * The ValuesInHtmlTable component renders the keyed value contents of a Store
 * as an HTML <table> element, and registers a listener so that any changes to
 * that result will cause a re-render.
 *
 * See the <ValuesInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which Row to render based on Table Id, Row Id,
 * and Store (which is either the default context Store, a named context Store,
 * or an explicit reference).
 *
 * This component renders a Store by iterating over its Value objects. By
 * default the Values are in turn rendered with the ValueView component, but you
 * can override this behavior by providing a `valueComponent` prop, a custom
 * component of your own that will render a Value based on ValueProps. You can
 * also pass additional props to your custom component with the
 * `getValueComponentProps` callback prop.
 *
 * This component uses the useValueIds hook under the covers, which means that
 * any changes to the structure of the Values in the Store will cause a
 * re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether labels
 * and Ids appear in a <th> element at the top of the table, and the start of
 * each row.
 * @param props The props for this component.
 * @returns A rendering of the Values in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValuesInHtmlTable component within it then renders the Values
 * in a <table> element with a CSS class.
 *
 * ```jsx
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {ValuesInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <ValuesInHtmlTable className="values" />;
 *
 * const store = createStore().setValues({open: true, employees: 3});
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class="values">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th>Value</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>open</th>
 *       <td>true</td>
 *     </tr>
 *     <tr>
 *       <th>employees</th>
 *       <td>3</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValuesInHtmlTable component within it then renders the Row
 * with a custom Cell component and a custom props callback. The header row at
 * the top of the table and the Id column at the start of each row is removed.
 *
 * ```jsx
 * import {Provider, ValueView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {ValuesInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <ValuesInHtmlTable
 *     valueComponent={FormattedValueView}
 *     getValueComponentProps={(valueId) => ({bold: valueId == 'open'})}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 * const FormattedValueView = ({valueId, bold}) => (
 *   <>
 *     {bold ? <b>{valueId}</b> : valueId}
 *     {': '}
 *     <ValueView valueId={valueId} />
 *   </>
 * );
 *
 * const store = createStore().setValues({open: true, employees: 3});
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr><td><b>open</b>: true</td></tr>
 *     <tr><td>employees: 3</td></tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// ValuesInHtmlTable
/**
 * The SliceInHtmlTable component renders the contents of a Slice as an HTML
 * <table> element, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * See the <SliceInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which Slice to render based on Index Id, Slice
 * Id, and Indexes object (which is either the default context Indexes object, a
 * named context Indexes object, or an explicit reference).
 *
 * This component renders a Slice by iterating over its Row objects. By default
 * the Cells are in turn rendered with the CellView component, but you can
 * override this behavior by providing a `component` for each Cell in the
 * `customCells` prop. You can pass additional props to that custom component
 * with the `getComponentProps` callback. See the CustomCell type for more
 * details.
 *
 * This component uses the useSliceRowIds hook under the covers, which means
 * that any changes to the structure of the Slice will cause a re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether labels
 * and Ids appear in a <th> element at the top of the table, and the start of
 * each row.
 * @param props The props for this component.
 * @returns A rendering of the Slice in a <table> element.
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. The SliceInHtmlTable component within it then renders the Slice
 * in a <table> element with a CSS class.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {SliceInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <SliceInHtmlTable indexId="bySpecies" sliceId="dog" className="slice" />
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class=\"slice\">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th>species</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>fido</th>
 *       <td>dog</td>
 *     </tr>
 *     <tr>
 *       <th>cujo</th>
 *       <td>dog</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. The SliceInHtmlTable component within it then renders the Slice
 * with a custom component and a custom props callback for the `species` Cell.
 * The header row at the top of the table and the Id column at the start of each
 * row is removed.
 *
 * ```jsx
 * import {CellView, Provider} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {SliceInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <SliceInHtmlTable
 *     indexId="bySpecies"
 *     sliceId="dog"
 *     customCells={customCells}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 *
 * const FormattedCellView = ({tableId, rowId, cellId, bold}) => (
 *   <>
 *     {bold ? <b>{rowId}</b> : rowId}:
 *     <CellView tableId={tableId} rowId={rowId} cellId={cellId} />
 *   </>
 * );
 * const customCells = {
 *   species: {
 *     component: FormattedCellView,
 *     getComponentProps: (rowId, cellId) => ({bold: rowId == 'fido'}),
 *   },
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td><b>fido</b>:</td>
 *     </tr>
 *     <tr>
 *       <td>cujo:</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Indexes components
 * @since v4.1.0
 */
/// SliceInHtmlTable
/**
 * The RelationshipInHtmlTable component renders the contents of the two Tables
 * linked by a Relationship as an HTML <table> element, and registers a listener
 * so that any changes to that result will cause a re-render.
 *
 * See the <RelationshipInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which Relationship to render based on
 * Relationship Id and Relationships object (which is either the default context
 * Relationships object, a named context Relationships object, or an explicit
 * reference).
 *
 * This component renders the two Table objects by iterating over their related
 * Row objects. By default the Cells are in turn rendered with the CellView
 * component, but you can override this behavior by providing a `component` for
 * each Cell in the `customCells` prop. You can pass additional props to that
 * custom component with the `getComponentProps` callback. See the CustomCell
 * type for more details.
 *
 * Note the use of dotted 'tableId.cellId' string pairs when specifying custom
 * rendering for the cells in this table, since Cells from both the
 * relationship's 'local' and 'remote' Table objects can be rendered and need to
 * be distinguished
 *
 * This component uses the useRowIds and useRemoteRowId hooks under the covers,
 * which means that any changes to the structure of either Table resulting in a
 * change to the relationship will cause a re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether labels
 * and Ids appear in a <th> element at the top of the table, and the start of
 * each row.
 * @param props The props for this component.
 * @returns A rendering of the two Tables linked by a Relationship in a
 * <table> element.
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The RelationshipInHtmlTable component within it then
 * renders the two Tables linked by a relationship in a <table> element with a
 * CSS class. Note the dotted pairs that are used as column headings.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {RelationshipInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <RelationshipInHtmlTable
 *     relationshipId="petSpecies"
 *     className="relationship"
 *   />
 * );
 *
 * const relationships = createRelationships(
 *   createStore()
 *     .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *     .setTable('species', {wolf: {price: 10}, dog: {price: 5}}),
 * ).setRelationshipDefinition('petSpecies', 'pets', 'species', 'species');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class=\"relationship\">
 *   <thead>
 *     <tr>
 *       <th>pets.Id</th>
 *       <th>species.Id</th>
 *       <th>pets.species</th>
 *       <th>species.price</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>fido</th>
 *       <th>dog</th>
 *       <td>dog</td>
 *       <td>5</td>
 *     </tr>
 *     <tr>
 *       <th>cujo</th>
 *       <th>dog</th>
 *       <td>dog</td>
 *       <td>5</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The RelationshipInHtmlTable component within it then
 * renders the two Tables linked by a relationship with a custom component and a
 * custom props callback for the `species` Cell. The header row at the top of
 * the table and the Id column at the start of each row is removed.
 *
 * ```jsx
 * import {CellView, Provider} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {RelationshipInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <RelationshipInHtmlTable
 *     relationshipId="petSpecies"
 *     customCells={customCells}
 *     idColumn={false}
 *     headerRow={false}
 *   />
 * );
 *
 * const FormattedCellView = ({tableId, rowId, cellId, store, bold}) => (
 *   <>
 *     {bold ? <b>{rowId}</b> : rowId}:
 *     <CellView
 *       tableId={tableId}
 *       rowId={rowId}
 *       cellId={cellId}
 *       store={store}
 *     />
 *   </>
 * );
 * const customCells = {
 *   'species.price': {
 *     component: FormattedCellView,
 *     getComponentProps: (rowId, cellId) => ({bold: rowId == 'dog'}),
 *   },
 * };
 *
 * const relationships = createRelationships(
 *   createStore()
 *     .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'wolf'}})
 *     .setTable('species', {wolf: {price: 10}, dog: {price: 5}}),
 * ).setRelationshipDefinition('petSpecies', 'pets', 'species', 'species');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td><b>dog</b>:5</td>
 *     </tr>
 *     <tr>
 *       <td>wolf:10</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Relationships components
 * @since v4.1.0
 */
/// RelationshipInHtmlTable
/**
 * The ResultTableInHtmlTable component renders the contents of a single query's
 * ResultTable in a Queries object as an HTML <table> element, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * See the <ResultTableInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which ResultTable to render based on query Id,
 * and Queries object (which is either the default context Queries object, a
 * named context Queries object, or by explicit reference).
 *
 * This component renders a ResultTable by iterating over its Row objects. By
 * default the Cells are in turn rendered with the CellView component, but you
 * can override this behavior by providing a `component` for each Cell in the
 * `customCells` prop. You can pass additional props to that custom component
 * with the `getComponentProps` callback. See the ResultCustomCell type for more
 * details.
 *
 * This component uses the useRowIds hook under the covers, which means that any
 * changes to the structure of the Table will cause a re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether the Ids
 * appear in a <th> element at the top of the table, and the start of each row.
 * @param props The props for this component.
 * @returns A rendering of the ResultTable in a <table> element.
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultTableInHtmlTable component within it then renders the
 * ResultTable in a <table> element with a CSS class.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {ResultTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <ResultTableInHtmlTable queryId="petColors" className="table" />
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => select('color'));
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class="table">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th>color</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>fido</th>
 *       <td>brown</td>
 *     </tr>
 *     <tr>
 *       <th>felix</th>
 *       <td>black</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultTableInHtmlTable component within it then renders the
 * ResultTable with a custom component and a custom props callback for the
 * `color` Cell. The header row at the top of the table and the Id column at
 * the start of each row is removed.
 *
 * ```jsx
 * import {Provider, ResultCellView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {ResultTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <ResultTableInHtmlTable
 *     queryId="petColors"
 *     customCells={customCells}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 *
 * const FormattedResultCellView = ({queryId, rowId, cellId, bold}) => (
 *   <>
 *     {bold ? <b>{rowId}</b> : rowId}:
 *     <ResultCellView queryId={queryId} rowId={rowId} cellId={cellId} />
 *   </>
 * );
 * const customCells = {
 *   color: {
 *     component: FormattedResultCellView,
 *     getComponentProps: (rowId, cellId) => ({bold: rowId == 'fido'}),
 *   },
 * };
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => select('color'));
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td><b>fido</b>:brown</td>
 *     </tr>
 *     <tr>
 *       <td>felix:black</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Queries components
 * @since v4.1.0
 */
/// ResultTableInHtmlTable
/**
 * The SortedTableInHtmlTable component renders the contents of a single query's
 * sorted ResultTable in a Queries object as an HTML <table> element, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * See the <ResultSortedTableInHtmlTable /> demo for this component in action.
 *
 * The component's props identify which ResultTable to render based on query Id,
 * and Queries object (which is either the default context Queries object, a
 * named context Queries object, or by explicit reference). It also takes a Cell
 * Id to sort by and a boolean to indicate that the sorting should be in
 * descending order. The `offset` and `limit` props are used to paginate
 * results, but default to `0` and `undefined` to return all available Row Ids
 * if not specified.
 *
 * This component renders a ResultTable by iterating over its Row objects, in
 * the order dictated by the sort parameters. By default the Cells are in turn
 * rendered with the CellView component, but you can override this behavior by
 * providing a `component` for each Cell in the `customCells` prop. You can pass
 * additional props to that custom component with the `getComponentProps`
 * callback. See the ResultCustomCell type for more details.
 *
 * This component uses the useSortedRowIds hook under the covers, which means
 * that any changes to the structure or sorting of the ResultTable will cause a
 * re-render.
 *
 * You can use the `headerRow` and `idColumn` props to control whether the Ids
 * appear in a <th> element at the top of the table, and the start of each row.
 *
 * The `sortOnClick` prop makes the table's sorting interactive such that the
 * user can click on a column heading to sort by that column. The style classes
 * `sorted` and `ascending` (or `descending`) are added so that you can provide
 * hints to the user how the sorting is being applied.
 *
 * Provide a paginator component for the ResultTable with the `paginator` prop.
 * Set to `true` to use the default SortedTablePaginator, or provide your own
 * component that accepts SortedTablePaginatorProps.
 *
 * Finally, the `onChange` prop lets you listen to a user's changes to the
 * ResultTable's sorting or pagination.
 * @param props The props for this component.
 * @returns A rendering of the ResultTable in a <table> element.
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultSortedTableInHtmlTable component within it then
 * renders the ResultTable in a <table> element with a CSS class.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {ResultSortedTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <ResultSortedTableInHtmlTable
 *     queryId="petColors"
 *     cellId="color"
 *     className="table"
 *   />
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => select('color'));
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table class="table">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th class="sorted ascending">↑ color</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>felix</th>
 *       <td>black</td>
 *     </tr>
 *     <tr>
 *       <th>fido</th>
 *       <td>brown</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultSortedTableInHtmlTable component within it then
 * renders the ResultTable with a custom component and a custom props callback
 * for the `color` Cell. The header row at the top of the table and the Id
 * column at the start of each row is removed.
 *
 * ```jsx
 * import {Provider, ResultCellView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {ResultSortedTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 *
 * const Pane = () => (
 *   <ResultSortedTableInHtmlTable
 *     queryId="petColors"
 *     cellId="color"
 *     customCells={customCells}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 *
 * const FormattedResultCellView = ({queryId, rowId, cellId, bold}) => (
 *   <>
 *     {bold ? <b>{rowId}</b> : rowId}:
 *     <ResultCellView queryId={queryId} rowId={rowId} cellId={cellId} />
 *   </>
 * );
 * const customCells = {
 *   color: {
 *     component: FormattedResultCellView,
 *     getComponentProps: (rowId, cellId) => ({bold: rowId == 'fido'}),
 *   },
 * };
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => select('color'));
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>felix:black</td>
 *     </tr>
 *     <tr>
 *       <td><b>fido</b>:brown</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Queries components
 * @since v4.1.0
 */
/// ResultSortedTableInHtmlTable
/**
 * The EditableCellView component renders the value of a single Cell in a way
 * that can be edited in a web browser, and registers a listener so that any
 * changes to that result will cause a re-render.
 *
 * See the <EditableCellView /> demo for this component in action.
 *
 * The component's props identify which Cell to render based on Table Id, Row
 * Id, Cell Id, and Store (which is either the default context Store, a named
 * context Store, or an explicit reference).
 *
 * A Cell contains a string, number, or boolean, so the value is rendered in an
 * appropriate <input> tag and a button lets the user change type, if possible.
 *
 * Set the `showType` prop to false to remove the ability for the user to see or
 * change the Cell type. They will also not be able to change the type if there
 * is a TablesSchema applied to the Store.
 *
 * This component uses the useCell hook under the covers, which means that any
 * changes to the specified Cell outside of this component will cause a
 * re-render.
 *
 * You can provide a custom className prop which well be used on the root of the
 * resulting element. If omitted the element's class will be `editableCell`. The
 * debugIds prop has no effect on this component.
 * @param props The props for this component.
 * @returns An editable rendering of the Cell.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The EditableCellView component within it then renders an editable
 * Cell.
 *
 * ```jsx
 * import {EditableCellView} from 'tinybase/ui-react-dom';
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <EditableCellView tableId="pets" rowId="fido" cellId="color" />
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <div class="editableCell">
 *   <button class="string">string</button>
 *   <input value="brown">
 * </div>
 * `;
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// EditableCellView
/**
 * The EditableValueView component renders the value of a single Value in a way
 * that can be edited in a web browser, and registers a listener so that any
 * changes to that result will cause a re-render.
 *
 * See the <EditableValueView /> demo for this component in action.
 *
 * The component's props identify which Value to render based on Table Id, Row
 * Id, Value Id, and Store (which is either the default context Store, a named
 * context Store, or an explicit reference).
 *
 * A Value contains a string, number, or boolean, so the value is rendered in an
 * appropriate <input> tag and a button lets the user change type, if possible.
 *
 * Set the `showType` prop to false to remove the ability for the user to see or
 * change the Value type. They will also not be able to change the type if there
 * is a ValuesSchema applied to the Store.
 *
 * This component uses the useValue hook under the covers, which means that any
 * changes to the specified Value outside of this component will cause a
 * re-render.
 *
 * You can provide a custom className prop which well be used on the root of the
 * resulting element. If omitted the element's class will be `editableValue`.
 * The debugIds prop has no effect on this component.
 * @param props The props for this component.
 * @returns An editable rendering of the Value.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The EditableValueView component within it then renders an editable
 * Value.
 *
 * ```jsx
 * import {EditableValueView} from 'tinybase/ui-react-dom';
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <EditableValueView valueId="employees" />;
 *
 * const store = createStore().setValue('employees', 3);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <div class="editableValue">
 *   <button class="number">number</button>
 *   <input type="number" value="3">
 * </div>
 * `;
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// EditableValueView
/**
 * The SortedTablePaginator component renders a paginator for a sorted table.
 *
 * See the <SortedTableInHtmlTable /> demo for this component in action.
 *
 * The component displays 'previous' and 'next' buttons for paging through the
 * Table if there are more Row Ids than fit in each page. The component will
 * also display a label that shows which Row Ids are being displayed.
 *
 * The component's props identify initial pagination settings, and it will fire
 * an event when the pagination changes.
 * @param props The props for this component.
 * @returns The rendering of a paginator control with a label, and next and
 * previous buttons, where appropriate.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableInHtmlTable component within it then renders the
 * Table in a <table> element with a SortedTablePaginator (the default).
 *
 * ```jsx
 * import {Provider} from 'tinybase/ui-react';
 * import React from 'react';
 * import {SortedTableInHtmlTable} from 'tinybase/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <SortedTableInHtmlTable
 *     tableId="pets"
 *     cellId="species"
 *     limit={2}
 *     paginator={true}
 *   />
 * );
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'wolf'},
 *     lowly: {species: 'worm'},
 *     polly: {species: 'parrot'},
 *   },
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // ->
 * `
 * <table>
 *   <caption>
 *     <button class="previous" disabled="">←</button>
 *     <button class="next">→</button>
 *     1 to 2 of 5 rows
 *   </caption>
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th class="sorted ascending">↑ species</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th>felix</th>
 *       <td>cat</td>
 *     </tr>
 *     <tr>
 *       <th>fido</th>
 *       <td>dog</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `;
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// SortedTablePaginator
/**
 * The StoreInspector component renders a tool which allows you to view and edit
 * the content of a Store in a debug web environment.
 *
 * See the <StoreInspector /> demo for this component in action.
 *
 * The component displays a nub in the corner of the screen which you may then
 * click to interact with all the Store objects in the Provider component
 * context.
 *
 * The component's props identify the nub's initial location and panel state,
 * though subsequent user changes to that will be preserved on each reload.
 * @param props The props for this component.
 * @returns The rendering of the inspector tool.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The StoreInspector component within it then renders the inspector
 * tool.
 *
 * ```jsx
 * import {Provider} from 'tinybase/debug/ui-react';
 * import React from 'react';
 * import {StoreInspector} from 'tinybase/debug/ui-react-dom';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <StoreInspector />;
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * // ... // !act
 * console.log(app.innerHTML.substring(0, 35));
 * // -> '<aside id="tinybaseStoreInspector">'
 * ```
 * @category Development components
 * @since v4.1.0
 */
/// StoreInspector
