/**
 * The ui-react-dom module of the TinyBase project provides components to make
 * it easy to create web-based reactive apps with Store objects.
 *
 * The components in this module use the react-dom module and so are not
 * appropriate for environments like React Native (although those in the
 * lower-level ui-react module are).
 * @see Building UIs guides
 * @packageDocumentation
 * @module ui-react-dom
 * @since v4.1.0
 */
/// ui-react-dom
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   */
  /// ValuesInHtmlTableProps.store
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
  /**
   * A string className to use on the root of the resulting element.
   */
  /// ValuesInHtmlTableProps.className
  /**
   * Whether a header row should be rendered at the top of the table, defaulting
   * to `true`.
   */
  /// ValuesInHtmlTableProps.headerRow
  /**
   * Whether an Id column should be rendered on the left of the table,
   * defaulting to `true`.
   */
  /// ValuesInHtmlTableProps.idColumn
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
   * A string className to use on the root of the resulting element.
   */
  /// HtmlProps.className
}
/**
 * HtmlProps props are used for components that will render HTML DOM elements.
 * @category Props
 * @since v4.1.0
 */
/// HtmlProps
{
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
 * HtmlTableProps props are used for components that will render HTML <table>
 * elements.
 * @category Props
 * @since v4.1.0
 */
/// HtmlTableProps
{
  /**
   * Whether an Id column should be rendered on the left of the table,
   * defaulting to `true`.
   */
  /// HtmlTrProps.idColumn
}
/**
 * HtmlTrProps props are used for components that will render HTML <tr>
 * elements.
 * @category Props
 * @since v4.1.0
 */
/// HtmlTrProps
/**
 * The CellInHtmlTd component renders the value of a single Cell in a given
 * Row, in a given Table, as an HTML <td> element, and registers a listener so
 * that any changes to that result will cause a re-render.
 *
 * The component's props identify which Cell to render based on Table Id, Row
 * Id, Cell Id, and Store (which is either the default context Store, a named
 * context Store, or an explicit reference).
 *
 * A Cell contains a string, number, or boolean, so the value is rendered
 * directly without further decoration. You can create your own
 * CellInHtmlTd-like component to customize the way that a Cell is rendered:
 * see the RowInHtmlTr component for more details.
 *
 * This component uses the useCell hook under the covers, which means that any
 * changes to the specified Cell will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Cell in a <td> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The CellInHtmlTd component within it then renders the Cell in a
 * <td> element with a CSS class.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <table>
 *     <tbody>
 *       <tr>
 *         <CellInHtmlTd
 *           tableId="pets"
 *           rowId="fido"
 *           cellId="color"
 *           className="cell"
 *         />
 *       </tr>
 *     </tbody>
 *   </table>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<table><tbody><tr><td class="cell">brown</td></tr></tbody></table>'
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// CellInHtmlTd
/**
 * The RowInHtmlTr component renders the contents of a single Row in a given
 * Table, as an HTML <tr> element, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * The component's props identify which Row to render based on Table Id, Row Id,
 * and Store (which is either the default context Store, a named context Store,
 * or an explicit reference).
 *
 * This component renders a Row by iterating over its Cell values. By default
 * these are in turn rendered with the CellInHtmlTd component, but you can
 * override this behavior by providing a `cellComponent` prop, a custom
 * component of your own that will render a Cell based on CellProps. You can
 * also pass additional props to your custom component with the
 * `getCellComponentProps` callback prop.
 *
 * You can create your own RowInHtmlTr-like component to customize the way that
 * a Row is rendered: see the TableInHtmlTable component for more details.
 *
 * This component uses the useCellIds hook under the covers, which means that
 * any changes to the structure of the Row will cause a re-render.
 *
 * You are discouraged from using the `separator` and `debugIds` props with this
 * component as they will insert raw text into the <tr> element. However, you
 * can use the `idColumn` prop to control whether the Id appears in a <th>
 * element at the start of the row.
 * @param props The props for this component.
 * @returns A rendering of the Row in a <tr> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The RowInHtmlTr component within it then renders the Row in a
 * <tr> element with a CSS class.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <table>
 *     <tbody>
 *       <RowInHtmlTr tableId="pets" rowId="fido" className="row" />
 *     </tbody>
 *   </table>
 * );
 *
 * const store = createStore().setRow('pets', 'fido', {
 *   species: 'dog',
 *   color: 'walnut',
 * });
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table>
 *   <tbody>
 *     <tr class="row">
 *       <th>fido</th>
 *       <td>dog</td>
 *       <td>walnut</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The RowInHtmlTr component within it then renders the Row with a
 * custom Cell component and a custom props callback. The Id column at the start
 * of the row is removed.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <table>
 *     <tbody>
 *       <RowInHtmlTr
 *         tableId="pets"
 *         rowId="fido"
 *         cellComponent={FormattedCellView}
 *         getCellComponentProps={(cellId) => ({bold: cellId == 'species'})}
 *         idColumn={false}
 *       />
 *     </tbody>
 *   </table>
 * );
 * const FormattedCellView = ({tableId, rowId, cellId, bold}) => (
 *   <td>
 *     {bold ? <b>{cellId}</b> : cellId}
 *     {': '}
 *     <CellView tableId={tableId} rowId={rowId} cellId={cellId} />
 *   </td>
 * );
 *
 * const store = createStore().setRow('pets', 'fido', {
 *   species: 'dog',
 *   color: 'walnut',
 * });
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td><b>species</b>: dog</td>
 *       <td>color: walnut</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// RowInHtmlTr
/**
 * The SortedTableInHtmlTable component renders the contents of a single sorted
 * Table in a Store, as an HTML <table> element, and registers a listener so
 * that any changes to that result will cause a re-render.
 *
 * The component's props identify which Table to render based on Table Id, and
 * Store (which is either the default context Store, a named context Store, or
 * by explicit reference). It also takes a Cell Id to sort by and a boolean to
 * indicate that the sorting should be in descending order. The `offset` and
 * `limit` props are used to paginate results, but default to `0` and
 * `undefined` to return all available Row Ids if not specified.
 *
 * This component renders a Table by iterating over its Row objects, in the
 * order dictated by the sort parameters. By default these are in turn rendered
 * with the RowInHtmlTr component, but you can override this behavior by
 * providing a `rowComponent` prop, a custom component of your own that will
 * render a Row based on RowProps. You can also pass additional props to your
 * custom component with the `getRowComponentProps` callback prop.
 *
 * This component uses the useSortedRowIds hook under the covers, which means
 * that any changes to the structure or sorting of the Table will cause a
 * re-render.
 *
 * You are discouraged from using the `separator` and `debugIds` props with this
 * component as they will insert raw text into the <table> element. However, you
 * can use the `headerRow` and `idColumn` props to control whether the Ids
 * appear in a <th> element at the top of the table, and the start of each row.
 * @param props The props for this component.
 * @returns A rendering of the Table in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableInHtmlTable component within it then renders the
 * Table in a <table> element with a CSS class.
 *
 * ```jsx
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
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table class="table">
 *   <thead>
 *     <tr>
 *       <th>Id</th>
 *       <th>species</th>
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
 * `
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableInHtmlTable component within it then renders the
 * Table with a custom Row component and a custom props callback. The header row
 * at the top of the table and the Id column at the start of each row is
 * removed.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <SortedTableInHtmlTable
 *     tableId="pets"
 *     cellId="species"
 *     rowComponent={FormattedRowView}
 *     getRowComponentProps={(rowId) => ({bold: rowId == 'fido'})}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 * const FormattedRowView = ({tableId, rowId, bold}) => (
 *   <tr>
 *     <td>{bold ? <b>{rowId}</b> : rowId}</td>
 *     <RowView
 *       tableId={tableId}
 *       rowId={rowId}
 *       cellComponent={CellInHtmlTd}
 *     />
 *   </tr>
 * );
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *   },
 * });
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>felix</td>
 *       <td>cat</td>
 *     </tr>
 *     <tr>
 *       <td><b>fido</b></td>
 *       <td>dog</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// SortedTableInHtmlTable
/**
 * The TableInHtmlTable component renders the contents of a single Table in a
 * Store as an HTML <table> element, and registers a listener so that any
 * changes to that result will cause a re-render.
 *
 * The component's props identify which Table to render based on Table Id, and
 * Store (which is either the default context Store, a named context Store, or
 * by explicit reference).
 *
 * This component renders a Table by iterating over its Row objects. By default
 * these are in turn rendered with the RowInHtmlTr component, but you can
 * override this behavior by providing a `rowComponent` prop, a custom component
 * of your own that will render a Row based on RowProps. You can also pass
 * additional props to your custom component with the `getRowComponentProps`
 * callback prop.
 *
 * This component uses the useRowIds hook under the covers, which means that any
 * changes to the structure of the Table will cause a re-render.
 *
 * You are discouraged from using the `separator` and `debugIds` props with this
 * component as they will insert raw text into the <table> element. However, you
 * can use the `headerRow` and `idColumn` props to control whether the Ids
 * appear in a <th> element at the top of the table, and the start of each row.
 * @param props The props for this component.
 * @returns A rendering of the Table in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TableInHtmlTable component within it then renders the Table in
 * a <table> element with a CSS class.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <TableInHtmlTable tableId="pets" className="row" />
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table class="row">
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
 * `
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TableInHtmlTable component within it then renders the Table
 * with a custom Row component and a custom props callback. The header row at
 * the top of the table and the Id column at the start of each row is removed.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <TableInHtmlTable
 *     tableId="pets"
 *     rowComponent={FormattedRowView}
 *     getRowComponentProps={(rowId) => ({bold: rowId == 'fido'})}
 *     headerRow={false}
 *     idColumn={false}
 *   />
 * );
 * const FormattedRowView = ({tableId, rowId, bold}) => (
 *   <tr>
 *     <td>{bold ? <b>{rowId}</b> : rowId}</td>
 *     <RowView
 *       tableId={tableId}
 *       rowId={rowId}
 *       cellComponent={CellInHtmlTd}
 *     />
 *   </tr>
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table>
 *   <tbody>
 *     <tr>
 *       <td><b>fido</b></td>
 *       <td>dog</td>
 *     </tr>
 *     <tr>
 *       <td>felix</td>
 *       <td>cat</td>
 *     </tr>
 *   </tbody>
 * </table>
 * `
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// TableInHtmlTable
/**
 * The ValuesInHtmlTable component renders the keyed value contents of a Store
 * as an HTML <table> element, and registers a listener so that any changes to
 * that result will cause a re-render.
 *
 * The component's props identify which Row to render based on Table Id, Row Id,
 * and Store (which is either the default context Store, a named context Store,
 * or an explicit reference).
 *
 * This component renders a Store by iterating over its Value objects. By
 * default these are in turn rendered with the ValueInHtmlTr component, but you
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
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <ValuesInHtmlTable className="values" />
 * );
 *
 * const store = createStore().setValues({open: true, employees: 3});
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
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
 * `
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValuesInHtmlTable component within it then renders the Row
 * with a custom Cell component and a custom props callback. The header row at
 * the top of the table and the Id column at the start of each row is removed.
 *
 * ```jsx
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
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> `
 * <table>
 *   <tbody>
 *     <tr><td><b>open</b>: true</td></tr>
 *     <tr><td>employees: 3</td></tr>
 *   </tbody>
 * </table>
 * `
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// ValuesInHtmlTable
