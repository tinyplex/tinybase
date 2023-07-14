/* eslint-disable max-len */
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
 */
/// ui-react-dom
/**
 * The DomTableCellView component renders the value of a single Cell in a given
 * Row, in a given Table, as an HTML <td> element, and registers a listener so
 * that any changes to that result will cause a re-render.
 *
 * The component's props identify which Cell to render based on Table Id, Row
 * Id, Cell Id, and Store (which is either the default context Store, a named
 * context Store, or an explicit reference).
 *
 * A Cell contains a string, number, or boolean, so the value is rendered
 * directly without further decoration. You can create your own
 * DomTableCellView-like component to customize the way that a Cell is rendered:
 * see the RowView component for more details.
 *
 * This component uses the useCell hook under the covers, which means that any
 * changes to the specified Cell will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Cell in a <td> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomTableCellView component within it then renders the Cell in a
 * <td> element.
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
 *         <DomTableCellView tableId="pets" rowId="fido" cellId="color" />
 *       </tr>
 *     </tbody>
 *   </table>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<table><tbody><tr><td>brown</td></tr></tbody></table>'
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// DomTableCellView
/**
 * The DomTableRowView component renders the contents of a single Row in a given
 * Table, as an HTML <tr> element, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * The component's props identify which Row to render based on Table Id, Row Id,
 * and Store (which is either the default context Store, a named context Store,
 * or an explicit reference).
 *
 * This component renders a Row by iterating over its Cell values. By default
 * these are in turn rendered with the DomTableCellView component, but you can
 * override this behavior by providing a `cellComponent` prop, a custom
 * component of your own that will render a Cell based on CellProps. You can
 * also pass additional props to your custom component with the
 * `getCellComponentProps` callback prop.
 *
 * You can create your own DomTableRowView-like component to customize the way
 * that a Row is rendered: see the DomTableView component for more details.
 *
 * This component uses the useCellIds hook under the covers, which means that
 * any changes to the structure of the Row will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Row in a <tr> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomTableRowView component within it then renders the Row.
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
 *       <DomTableRowView tableId="pets" rowId="fido" />
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
 * // -> '<table><tbody><tr><td>dog</td><td>walnut</td></tr></tbody></table>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomTableRowView component within it then renders the Row with a
 * custom Cell component and a custom props callback.
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
 *       <DomTableRowView
 *         tableId="pets"
 *         rowId="fido"
 *         cellComponent={FormattedCellView}
 *         getCellComponentProps={(cellId) => ({bold: cellId == 'species'})}
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
 * // -> '<table><tbody><tr><td><b>species</b>: dog</td><td>color: walnut</td></tr></tbody></table>'
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// DomTableRowView
/**
 * The DomSortedTableView component renders the contents of a single sorted
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
 * with the DomTableRowView component, but you can override this behavior by
 * providing a `rowComponent` prop, a custom component of your own that will
 * render a Row based on RowProps. You can also pass additional props to your
 * custom component with the `getRowComponentProps` callback prop.
 *
 * This component uses the useSortedRowIds hook under the covers, which means
 * that any changes to the structure or sorting of the Table will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the Table in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomSortedTableView component within it then renders the Table.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <DomSortedTableView tableId="pets" cellId="species" />
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
 * // -> '<table><tbody><tr><td>cat</td></tr><tr><td>dog</td></tr></tbody></table>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomSortedTableView component within it then renders the Table
 * with a custom Row component and a custom props callback.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <DomSortedTableView
 *     tableId="pets"
 *     cellId="species"
 *     rowComponent={FormattedRowView}
 *     getRowComponentProps={(rowId) => ({bold: rowId == 'fido'})}
 *   />
 * );
 * const FormattedRowView = ({tableId, rowId, bold}) => (
 *   <tr>
 *     <td>{bold ? <b>{rowId}</b> : rowId}</td>
 *     <RowView
 *       tableId={tableId}
 *       rowId={rowId}
 *       cellComponent={DomTableCellView}
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
 * // -> '<table><tbody><tr><td>felix</td><td>cat</td></tr><tr><td><b>fido</b></td><td>dog</td></tr></tbody></table>'
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// DomSortedTableView
/**
 * The DomTableView component renders the contents of a single Table in a Store
 * as an HTML <table> element, and registers a listener so that any changes to
 * that result will cause a re-render.
 *
 * The component's props identify which Table to render based on Table Id, and
 * Store (which is either the default context Store, a named context Store, or
 * by explicit reference).
 *
 * This component renders a Table by iterating over its Row objects. By default
 * these are in turn rendered with the DomTableRowView component, but you can
 * override this behavior by providing a `rowComponent` prop, a custom component
 * of your own that will render a Row based on RowProps. You can also pass
 * additional props to your custom component with the `getRowComponentProps`
 * callback prop.
 *
 * This component uses the useRowIds hook under the covers, which means that any
 * changes to the structure of the Table will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Table in a <table> element.
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomTableView component within it then renders the Table.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <DomTableView tableId="pets" />
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const app = document.createElement('div');
 * ReactDOMClient.createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<table><tbody><tr><td>dog</td></tr><tr><td>cat</td></tr></tbody></table>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The DomTableView component within it then renders the Table with a
 * custom Row component and a custom props callback.
 *
 * ```jsx
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <DomTableView
 *     tableId="pets"
 *     rowComponent={FormattedRowView}
 *     getRowComponentProps={(rowId) => ({bold: rowId == 'fido'})}
 *   />
 * );
 * const FormattedRowView = ({tableId, rowId, bold}) => (
 *   <tr>
 *     <td>{bold ? <b>{rowId}</b> : rowId}</td>
 *     <RowView
 *       tableId={tableId}
 *       rowId={rowId}
 *       cellComponent={DomTableCellView}
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
 * // -> '<table><tbody><tr><td><b>fido</b></td><td>dog</td></tr><tr><td>felix</td><td>cat</td></tr></tbody></table>'
 * ```
 * @category Store components
 * @since v4.1.0
 */
/// DomTableView
