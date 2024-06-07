/**
 * The ui-react-inspector module of the TinyBase project provides a component to
 * help debug the state of your TinyBase stores and other objects.
 *
 * The component in this module uses the react-dom module and so is not
 * appropriate for environments like React Native.
 * @see UI Components demos
 * @packageDocumentation
 * @module ui-react-inspector
 * @since v5.0.0
 */
/// ui-react-inspector
/**
 * InspectorProps props are used to configure the Inspector component.
 * @category Props
 * @since v4.1.0
 */
/// InspectorProps
{
  /**
   * An optional string to indicate where you want the inspector to first
   * appear.
   */
  /// InspectorProps.position
  /**
   * An optional boolean to indicate whether the inspector should start in the
   * opened state.
   */
  /// InspectorProps.open
}
/**
 * The Inspector component renders a tool which allows you to view and edit the
 * content of a Store in a debug web environment.
 *
 * See the <Inspector /> demo for this component in action.
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
 * provided. The Inspector component within it then renders the inspector
 * tool.
 *
 * ```jsx
 * import {Inspector} from 'tinybase/ui-react-inspector';
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
 * const Pane = () => <Inspector />;
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * // ... // !act
 * console.log(app.innerHTML.substring(0, 30));
 * // -> '<aside id="tinybaseInspector">'
 * ```
 * @category Development components
 * @since v4.1.0
 */
/// Inspector
