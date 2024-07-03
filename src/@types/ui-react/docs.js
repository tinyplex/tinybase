/**
 * The ui-react module of the TinyBase project provides both hooks and
 * components to make it easy to create reactive apps with Store objects.
 *
 * The hooks in this module provide access to the data and structures exposed by
 * other modules in the project. As well as immediate access, they all register
 * listeners such that components using those hooks are selectively re-rendered
 * when data changes.
 *
 * The components in this module provide a further abstraction over those hooks
 * to ease the composition of user interfaces that use TinyBase.
 * @see Building UIs guides
 * @see Building UIs With Metrics guide
 * @see Building UIs With Indexes guide
 * @see Building UIs With Relationships guide
 * @see Building UIs With Queries guide
 * @see Building UIs With Checkpoints guide
 * @see Countries demo
 * @see Todo App demos
 * @see Drawing demo
 * @packageDocumentation
 * @module ui-react
 */
/// ui-react
/**
 * The StoreOrStoreId type is used when you need to refer to a Store in a React
 * hook or component.
 *
 * In some simple cases you will already have a direct reference to the Store.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Store objects into a context that can be used throughout the app. In
 * this case you will want to refer to a Store by its Id in that context.
 *
 * Many hooks and components in this ui-react module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 */
/// StoreOrStoreId
/**
 * The MetricsOrMetricsId type is used when you need to refer to a Metrics
 * object in a React hook or component.
 *
 * In some simple cases you will already have a direct reference to the Metrics
 * object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Metrics objects into a context that can be used throughout the app.
 * In this case you will want to refer to a Metrics object by its Id in that
 * context.
 *
 * Many hooks and components in this ui-react module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 */
/// MetricsOrMetricsId
/**
 * The IndexesOrIndexesId type is used when you need to refer to an Indexes
 * object in a React hook or component.
 *
 * In some simple cases you will already have a direct reference to the Indexes
 * object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Indexes objects into a context that can be used throughout the app.
 * In this case you will want to refer to an Indexes object by its Id in that
 * context.
 *
 * Many hooks and components in this ui-react module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 */
/// IndexesOrIndexesId
/**
 * The RelationshipsOrRelationshipsId type is used when you need to refer to a
 * Relationships object in a React hook or component.
 *
 * In some simple cases you will already have a direct reference to the
 * Relationships object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Relationships objects into a context that can be used throughout the
 * app. In this case you will want to refer to a Relationships object by its Id
 * in that context.
 *
 * Many hooks and components in this ui-react module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 */
/// RelationshipsOrRelationshipsId
/**
 * The QueriesOrQueriesId type is used when you need to refer to a Queries
 * object in a React hook or component.
 *
 * In some simple cases you will already have a direct reference to the Queries
 * object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Queries objects into a context that can be used throughout the app.
 * In this case you will want to refer to a Queries object by its Id in that
 * context.
 *
 * Many hooks and components in this ui-react module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 * @since v2.0.0
 */
/// QueriesOrQueriesId
/**
 * The CheckpointsOrCheckpointsId type is used when you need to refer to a
 * Checkpoints object in a React hook or component.
 *
 * In some simple cases you will already have a direct reference to the
 * Checkpoints object.
 *
 * This module also includes a Provider component that can be used to wrap
 * multiple Checkpoints objects into a context that can be used throughout the
 * app. In this case you will want to refer to a Checkpoints object by its Id in
 * that context.
 *
 * Many hooks and components in this ui-react module take this type as a
 * parameter or a prop, allowing you to pass in either the Store or its Id.
 * @category Identity
 */
/// CheckpointsOrCheckpointsId
/**
 * The UndoOrRedoInformation type is an array that you can fetch from a
 * Checkpoints object to that indicates if and how you can move the state of the
 * underlying Store forward or backward.
 *
 * This type is useful if you are building undo or redo buttons. See the
 * useUndoInformation hook and the useRedoInformation hook for more details and
 * examples.
 * @category Checkpoints
 */
/// UndoOrRedoInformation
/**
 * The GetId type describes a function which, when passed a parameter, will
 * return an Id.
 *
 * This type is used in hooks that create callbacks - like the
 * useSetTableCallback hook or useSetRowCallback hook - so that the Id arguments
 * of the object to set can also be dependent on the event or parameter
 * provided (as well as the object itself being set).
 * @category Identity
 */
/// GetId
/**
 * The useCreateStore hook is used to create a Store within a React application
 * with convenient memoization.
 *
 * It is possible to create a Store outside of the React app with the regular
 * createStore function and pass it in, but you may prefer to create it within
 * the app, perhaps inside the top-level component. To prevent a new Store being
 * created every time the app renders or re-renders, the useCreateStore hook
 * wraps the creation in a memoization.
 *
 * The useCreateStore hook is a very thin wrapper around the React `useMemo`
 * hook, defaulting to an empty array for its dependencies, so that by default,
 * the creation only occurs once.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should cause the Store to be recreated, you can provide them in an array in
 * the optional second parameter, just as you would for any React hook with
 * dependencies.
 * @param create A function for performing the creation of the Store, plus any
 * additional steps such as adding data or listeners, and returning it.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Store.
 * @example
 * This example creates an empty Store at the top level of a React application.
 * Even though the App component is rendered twice, the Store creation only
 * occurs once by default.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useCreateStore} from 'tinybase/ui-react';
 *
 * const App = () => {
 *   const store = useCreateStore(() => {
 *     console.log('Store created');
 *     return createStore().setTables({pets: {fido: {species: 'dog'}}});
 *   });
 *   return <span>{store.getCell('pets', 'fido', 'species')}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Store created'
 *
 * root.render(<App />); // !act
 * // No second Store creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>dog</span>'
 * ```
 * @example
 * This example creates an empty Store at the top level of a React application.
 * The App component is rendered twice, each with a different top-level prop.
 * The useCreateStore hook takes the `fidoSpecies` prop as a dependency, and so
 * the Store is created again on the second render.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useCreateStore} from 'tinybase/ui-react';
 *
 * const App = ({fidoSpecies}) => {
 *   const store = useCreateStore(() => {
 *     console.log(`Store created for fido as ${fidoSpecies}`);
 *     return createStore().setTables({pets: {fido: {species: fidoSpecies}}});
 *   }, [fidoSpecies]);
 *   return <span>{store.getCell('pets', 'fido', 'species')}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App fidoSpecies="dog" />); // !act
 * // -> 'Store created for fido as dog'
 *
 * console.log(app.innerHTML);
 * // -> '<span>dog</span>'
 *
 * root.render(<App fidoSpecies="cat" />); // !act
 * // -> 'Store created for fido as cat'
 *
 * console.log(app.innerHTML);
 * // -> '<span>cat</span>'
 * ```
 * @category Store hooks
 */
/// useCreateStore
/**
 * The useCreateMergeableStore hook.
 * @category Store hooks
 */
/// useCreateMergeableStore
/**
 * The useStoreIds hook is used to retrieve the Ids of all the named Store
 * objects present in the current Provider component context.
 * @returns A list of the Ids in the context.
 * @example
 * This example adds two named Store objects to a Provider context and an inner
 * component accesses their Ids.
 *
 * ```jsx
 * import {Provider, useCreateStore, useStoreIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = () => {
 *   const store1 = useCreateStore(createStore);
 *   const store2 = useCreateStore(createStore);
 *   return (
 *     <Provider storesById={{store1, store2}}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>{JSON.stringify(useStoreIds())}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["store1","store2"]</span>'
 * ```
 * @category Store hooks
 * @since v4.1.0
 */
/// useStoreIds
/**
 * The useStore hook is used to get a reference to a Store from within a
 * Provider component context.
 *
 * A Provider component is used to wrap part of an application in a context. It
 * can contain a default Store (or a set of Store objects named by Id) that can
 * be easily accessed without having to be passed down as props through every
 * component.
 *
 * The useStore hook lets you either get a reference to the default Store (when
 * called without a parameter), or one of the Store objects that are named by Id
 * (when called with an Id parameter).
 * @param id An optional Id for accessing a Store that was named with an Id in
 * the Provider.
 * @returns A reference to the Store (or `undefined` if not within a Provider
 * context, or if the requested Store does not exist).
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useStore hook to get a
 * reference to the Store again, without the need to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useStore().getListenerStats().tables}</span>;
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useStore hook with that Id to get
 * a reference to the Store again, without the need to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useStore('petStore').getListenerStats().tables}</span>
 * );
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Store hooks
 */
/// useStore
/**
 * The useStoreOrStoreById hook is used to get a reference to a Store object
 * from within a Provider component context, _or_ have it passed directly to
 * this hook.
 *
 * This is mostly of use when you are developing a component that needs a Store
 * object and which might have been passed in explicitly to the component or is
 * to be picked up from the context by Id (a common pattern for Store-based
 * components).
 *
 * This is unlikely to be used often. For most situations, you will want to use
 * the useStore hook.
 * @param storeOrStoreId Either an Id for accessing a Store object that was
 * named with an Id in the Provider, or the Store object itself.
 * @returns A reference to the Store object (or `undefined` if not within a
 * Provider context, or if the requested Store object does not exist).
 * @example
 * This example creates a Provider context into which a default Store object is
 * provided. A component within it then uses the useStoreOrStoreById hook to get
 * a reference to the Store object again, without the need to have it passed as
 * a prop. Note however, that unlike the useStore hook example, this component
 * would also work if you were to pass the Store object directly into it, making
 * it more portable.
 *
 * ```jsx
 * import {Provider, useStoreOrStoreById} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = ({store}) => (
 *   <span>{JSON.stringify(useStoreOrStoreById(store).getTableIds())}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["pets"]</span>'
 * ```
 * @category Store hooks
 * @since v4.1.0
 */
/// useStoreOrStoreById
/**
 * The useProvideStore hook is used to add a Store object by Id to a Provider
 * component, but imperatively from a component within it.
 *
 * Normally you will register a Store by Id in a context by using the
 * `storesById` prop of the top-level Provider component. This hook, however,
 * lets you dynamically add a new Store to the context, from within a descendent
 * component. This is useful for applications where the set of Stores is not
 * known at the time of the first render of the root Provider.
 *
 * A Store added to the Provider context in this way will be available to other
 * components within the context (using the useStore hook and so on). If you use
 * the same Id as an existing Store registration, the new one will take priority
 * over one provided by the `storesById` prop.
 *
 * Note that other components that consume a Store registered like this should
 * defend against it being undefined at first. On the first render, the other
 * component will likely not yet have completed the registration. In the example
 * below, we use the null-safe `useStore('petStore')?` to do this.
 * @param storeId The Id of the Store object to be registered with the Provider.
 * @param store The Store object to be registered.
 * @example
 * This example creates a Provider context. A child component registers a Store
 * into it which is then consumable by a peer child component.
 * ```jsx
 * import {
 *   Provider,
 *   useCreateStore,
 *   useProvideStore,
 *   useStore,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = () => (
 *   <Provider>
 *     <RegisterStore />
 *     <ConsumeStore />
 *   </Provider>
 * );
 * const RegisterStore = () => {
 *   const store = useCreateStore(() =>
 *     createStore().setCell('pets', 'fido', 'color', 'brown'),
 *   );
 *   useProvideStore('petStore', store);
 *   return null;
 * };
 * const ConsumeStore = () => (
 *   <span>{JSON.stringify(useStore('petStore')?.getTableIds())}</span>
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["pets"]</span>'
 * ```
 * @category Store hooks
 * @since v4.4.2
 */
/// useProvideStore
/**
 * The useHasTables hook returns a boolean indicating whether any Table objects
 * exist in the Store, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasTables hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Tables will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether any Tables exist.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasTables hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasTables} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{JSON.stringify(useHasTables(store))}</span>;
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 *
 * store.delTable('pets'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasTables hook.
 *
 * ```jsx
 * import {Provider, useHasTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useHasTables())}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasTables hook.
 *
 * ```jsx
 * import {Provider, useHasTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useHasTables('petStore'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasTables
/**
 * The useTables hook returns a Tables object containing the tabular data of a
 * Store, and registers a listener so that any changes to that result will cause
 * a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useTables hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Tables will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns A Tables object containing the tabular data of the Store.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useTables hook by reference. A change to the data in the Store re-renders the
 * component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useTables} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{JSON.stringify(useTables(store))}</span>;
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"pets":{"fido":{"color":"brown"}}}</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"pets":{"fido":{"color":"walnut"}}}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useTables hook.
 *
 * ```jsx
 * import {Provider, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useTables())}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"pets":{"fido":{"color":"brown"}}}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useTables hook.
 *
 * ```jsx
 * import {Provider, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useTables('petStore'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"pets":{"fido":{"color":"brown"}}}</span>'
 * ```
 * @category Store hooks
 */
/// useTables
/**
 * The useTableIds hook returns the Ids of every Table in a Store, and registers
 * a listener so that any changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useTableIds hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Table Ids will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An array of the Ids of every Table in the Store.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useTableIds hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useTableIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{JSON.stringify(useTableIds(store))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["pets"]</span>'
 *
 * store.setCell('species', 'dog', 'price', 5); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["pets","species"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useTableIds hook.
 *
 * ```jsx
 * import {Provider, useTableIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useTableIds())}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["pets"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useTableIds hook.
 *
 * ```jsx
 * import {Provider, useTableIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useTableIds('petStore'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["pets"]</span>'
 * ```
 * @category Store hooks
 */
/// useTableIds
/**
 * The useHasTable hook returns a boolean indicating whether a given Table
 * exists in the Store, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasTable hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Table will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether a Table with that Id exists.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasTable hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasTable} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useHasTable('pets', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 *
 * store.delTable('pets'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasTable hook.
 *
 * ```jsx
 * import {Provider, useHasTable} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useHasTable('pets'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasTable hook.
 *
 * ```jsx
 * import {Provider, useHasTable} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useHasTable('pets', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasTable
/**
 * The useTable hook returns an object containing the data of a single Table in
 * a Store, and registers a listener so that any changes to that result will
 * cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useTable hook lets you indicate which Store to get data for: omit the final
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Table will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An object containing the entire data of the Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useTable hook by reference. A change to the data in the Store re-renders the
 * component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useTable} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{JSON.stringify(useTable('pets', store))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"brown"}}</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"walnut"}}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useTable hook.
 *
 * ```jsx
 * import {Provider, useTable} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useTable('pets'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"brown"}}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useTable hook.
 *
 * ```jsx
 * import {Provider, useTable} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useTable('pets', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"brown"}}</span>'
 * ```
 * @category Store hooks
 */
/// useTable
/**
 * The useTableCellIds hook returns the Ids of every Cell used across the whole
 * Table, and registers a listener so that any changes to that result will cause
 * a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useTableCellIds hook lets you indicate which Store to get data for: omit the
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Table Cell Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An array of the Ids of every Cell used across the whole Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useTableCellIds hook by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useTableCellIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useTableCellIds('pets', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 *
 * store.setCell('pets', 'felix', 'species', 'cat'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color","species"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useTableCellIds hook.
 *
 * ```jsx
 * import {Provider, useTableCellIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useTableCellIds('pets'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useTableCellIds hook.
 *
 * ```jsx
 * import {Provider, useTableCellIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useTableCellIds('pets', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 * ```
 * @category Store hooks
 * @since v3.3.0
 */
/// useTableCellIds
/**
 * The useHasTableCell hook returns a boolean indicating whether a given Cell
 * exists anywhere in a Table, not just in a specific Row, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasTableCell hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Table will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param cellId The Id of the Cell in the Table.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether a Cell with that Id exists anywhere in that Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasTableCell hook by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasTableCell} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useHasTableCell('pets', 'legs', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 *
 * store.setRow('pets', 'felix', {color: 'black', legs: 4}); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasTableCell hook.
 *
 * ```jsx
 * import {Provider, useHasTableCell} from 'tinybase/ui-react';
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
 *   <span>{JSON.stringify(useHasTableCell('pets', 'legs'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasTableCell hook.
 *
 * ```jsx
 * import {Provider, useHasTableCell} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(useHasTableCell('pets', 'legs', 'petStore'))}
 *   </span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasTableCell
/**
 * The useRowCount hook returns the count of the Row objects in a given Table,
 * and registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useRowCount hook lets you indicate which Store to get data for: omit the
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * count of Row objects will cause a re-render. When the component containing
 * this hook is unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns The number of Row objects in the Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useRowCount hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useRowCount} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{useRowCount('pets', store)}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 *
 * store.setCell('pets', 'felix', 'color', 'black'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>2</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useRowCount hook.
 *
 * ```jsx
 * import {Provider, useRowCount} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useRowCount('pets')}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useRowCount hook.
 *
 * ```jsx
 * import {Provider, useRowCount} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useRowCount('pets', 'petStore')}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 * ```
 * @category Store hooks
 * @since v4.1.0
 */
/// useRowCount
/**
 * The useRowIds hook returns the Ids of every Row in a given Table, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useRowIds hook lets you indicate which Store to get data for: omit the
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Row Ids will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An array of the Ids of every Row in the Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useRowIds hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{JSON.stringify(useRowIds('pets', store))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido"]</span>'
 *
 * store.setCell('pets', 'felix', 'color', 'black'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","felix"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useRowIds hook.
 *
 * ```jsx
 * import {Provider, useRowIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useRowIds('pets'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useRowIds hook.
 *
 * ```jsx
 * import {Provider, useRowIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useRowIds('pets', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido"]</span>'
 * ```
 * @category Store hooks
 */
/// useRowIds
/**
 * The useSortedRowIds hook returns the sorted (and optionally, paginated) Ids
 * of every Row in a given Table, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useSortedRowIds hook lets you indicate which Store to get data for: omit the
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * sorted Row Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param cellId The Id of the Cell whose values are used for the sorting, or
 * `undefined` to by sort the Row Id itself.
 * @param descending Whether the sorting should be in descending order.
 * @param offset The number of Row Ids to skip for pagination purposes, if any.
 * @param limit The maximum number of Row Ids to return, or `undefined` for all.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An array of the sorted Ids of every Row in the Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useSortedRowIds hook by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useSortedRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *   },
 * });
 * const App = () => (
 *   <span>
 *     {JSON.stringify(
 *       useSortedRowIds('pets', 'species', false, 0, undefined, store),
 *     )}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["felix","fido"]</span>'
 *
 * store.setRow('pets', 'cujo', {species: 'wolf'}); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["felix","fido","cujo"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useSortedRowIds hook.
 *
 * ```jsx
 * import {Provider, useSortedRowIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useSortedRowIds('pets'))}</span>;
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
 * // -> '<span>["felix","fido"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useSortedRowIds hook.
 *
 * ```jsx
 * import {Provider, useSortedRowIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(
 *       useSortedRowIds('pets', 'species', false, 0, undefined, 'petStore'),
 *     )}
 *   </span>
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
 * // -> '<span>["felix","fido"]</span>'
 * ```
 * @category Store hooks
 * @since v2.0.0
 */
/// useSortedRowIds
/**
 * The useHasRow hook returns a boolean indicating whether a given Row exists in
 * the Store, and registers a listener so that any changes to that result will
 * cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasRow hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Row will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether a Row with that Id exists in that Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasRow hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasRow} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useHasRow('pets', 'felix', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 *
 * store.setCell('pets', 'felix', 'color', 'black'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasRow hook.
 *
 * ```jsx
 * import {Provider, useHasRow} from 'tinybase/ui-react';
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
 *   <span>{JSON.stringify(useHasRow('pets', 'felix'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasRow hook.
 *
 * ```jsx
 * import {Provider, useHasRow} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useHasRow('pets', 'felix', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasRow
/**
 * The useRow hook returns an object containing the data of a single Row in a
 * given Table, and registers a listener so that any changes to that result will
 * cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useRow hook lets you indicate which Store to get data for: omit the final
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Row will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An object containing the entire data of the Row.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useRow hook by reference. A change to the data in the Store re-renders the
 * component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useRow} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useRow('pets', 'fido', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"brown"}</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"walnut"}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useRow hook.
 *
 * ```jsx
 * import {Provider, useRow} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useRow('pets', 'fido'))}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"brown"}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useRow hook.
 *
 * ```jsx
 * import {Provider, useRow} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useRow('pets', 'fido', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"brown"}</span>'
 * ```
 * @category Store hooks
 */
/// useRow
/**
 * The useCellIds hook returns the Ids of every Cell in a given Row, in a given
 * Table, and registers a listener so that any changes to that result will cause
 * a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useCellIds hook lets you indicate which Store to get data for: omit the
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Cell Ids will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An array of the Ids of every Cell in the Row.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useCellIds hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useCellIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useCellIds('pets', 'fido', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color","species"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useCellIds hook.
 *
 * ```jsx
 * import {Provider, useCellIds} from 'tinybase/ui-react';
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
 *   <span>{JSON.stringify(useCellIds('pets', 'fido'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useCellIds hook.
 *
 * ```jsx
 * import {Provider, useCellIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useCellIds('pets', 'fido', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 * ```
 * @category Store hooks
 */
/// useCellIds
/**
 * The useHasCell hook returns a boolean indicating whether a given Cell exists
 * in a given Row in a given Table, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasCell hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Cell will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param cellId The Id of the Cell in the Row.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether a Cell with that Id exists in that Row in that Table.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasCell hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasCell} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>{JSON.stringify(useHasCell('pets', 'fido', 'legs', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 *
 * store.setCell('pets', 'fido', 'legs', 4); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasCell hook.
 *
 * ```jsx
 * import {Provider, useHasCell} from 'tinybase/ui-react';
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
 *   <span>{JSON.stringify(useHasCell('pets', 'fido', 'legs'))}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasCell hook.
 *
 * ```jsx
 * import {Provider, useHasCell} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(useHasCell('pets', 'fido', 'legs', 'petStore'))}
 *   </span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasCell
/**
 * The useCell hook returns an object containing the value of a single Cell in a
 * given Row, in a given Table, and registers a listener so that any changes to
 * that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useCell hook lets you indicate which Store to get data for: omit the final
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Cell will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param cellId The Id of the Cell in the Row.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns The value of the Cell.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useCell hook by reference. A change to the data in the Store re-renders the
 * component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useCell} from 'tinybase/ui-react';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => <span>{useCell('pets', 'fido', 'color', store)}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>walnut</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useCell hook.
 *
 * ```jsx
 * import {Provider, useCell} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useCell('pets', 'fido', 'color')}</span>;
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useCell hook.
 *
 * ```jsx
 * import {Provider, useCell} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useCell('pets', 'fido', 'color', 'petStore')}</span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @category Store hooks
 */
/// useCell
/**
 * The useHasValues hook returns a boolean indicating whether any Values exist
 * in the Store, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasValues hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Values will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether any Values exist.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasValues hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasValues} from 'tinybase/ui-react';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => <span>{JSON.stringify(useHasValues(store))}</span>;
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 *
 * store.delValue('open'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasValues hook.
 *
 * ```jsx
 * import {Provider, useHasValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useHasValues())}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasValues hook.
 *
 * ```jsx
 * import {Provider, useHasValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useHasValues('petStore'))}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasValues
/**
 * The useValues hook returns a Values object containing the keyed value data of
 * a Store, and registers a listener so that any changes to that result will
 * cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useValues hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Values will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns A Values object containing the keyed value data of the Store.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useValues hook by reference. A change to the data in the Store re-renders the
 * component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useValues} from 'tinybase/ui-react';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => <span>{JSON.stringify(useValues(store))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"open":true}</span>'
 *
 * store.setValue('open', false); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"open":false}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useValues hook.
 *
 * ```jsx
 * import {Provider, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useValues())}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"open":true}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useValues hook.
 *
 * ```jsx
 * import {Provider, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useValues('petStore'))}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"open":true}</span>'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useValues
/**
 * The useValueIds hook returns the Ids of every Value in a Store, and registers
 * a listener so that any changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useValueIds hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Value Ids will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An array of the Ids of every Value in the Store.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useValueIds hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useValueIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => <span>{JSON.stringify(useValueIds(store))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["open"]</span>'
 *
 * store.setValue('employees', 3); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["open","employees"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useValueIds hook.
 *
 * ```jsx
 * import {Provider, useValueIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useValueIds())}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["open"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useValueIds hook.
 *
 * ```jsx
 * import {Provider, useValueIds} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useValueIds('petStore'))}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["open"]</span>'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useValueIds
/**
 * The useHasValue hook returns a boolean indicating whether a given Value
 * exists in the Store, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useHasValue hook lets you indicate which Store to get data for: omit the
 * optional parameter for the default context Store, provide an Id for a named
 * context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Value will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param valueId The Id of the Value in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns Whether a Value with that Id exists in the Store.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useHasValue hook by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useHasValue} from 'tinybase/ui-react';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => (
 *   <span>{JSON.stringify(useHasValue('employees', store))}</span>
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 *
 * store.setValue('employees', 3); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useHasValue hook.
 *
 * ```jsx
 * import {Provider, useHasValue} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useHasValue('employees'))}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useHasValue hook.
 *
 * ```jsx
 * import {Provider, useHasValue} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useHasValue('employees', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasValue
/**
 * The useValue hook returns an object containing the data of a single Value in
 * a Store, and registers a listener so that any changes to that result will
 * cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Store or a set of Store objects named by Id. The
 * useValue hook lets you indicate which Store to get data for: omit the final
 * optional final parameter for the default context Store, provide an Id for a
 * named context Store, or provide a Store explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Value will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param valueId The Id of the Value in the Store.
 * @param storeOrStoreId The Store to be accessed: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @returns An object containing the entire data of the Value.
 * @example
 * This example creates a Store outside the application, which is used in the
 * useValue hook by reference. A change to the data in the Store re-renders the
 * component.
 *
 * ```jsx
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 * import {useValue} from 'tinybase/ui-react';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => <span>{JSON.stringify(useValue('open', store))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 *
 * store.setValue('open', false); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. A component within it then uses the useValue hook.
 *
 * ```jsx
 * import {Provider, useValue} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useValue('open'))}</span>;
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Store is provided, named
 * by Id. A component within it then uses the useValue hook.
 *
 * ```jsx
 * import {Provider, useValue} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider storesById={{petStore: store}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useValue('open', 'petStore'))}</span>
 * );
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useValue
/**
 * The useSetTablesCallback hook returns a parameterized callback that can be
 * used to set the tabular data of a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The first parameter is a function which will produce the Tables object that
 * will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional second parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param getTables A function which returns the Tables object that will be used
 * to update the Store, based on the parameter the callback will receive (and
 * which is most likely a DOM event).
 * @param getTablesDeps An optional array of dependencies for the `getTables`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Tables used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetTablesCallback hook to create an event handler
 * which updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useSetTablesCallback, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const App = () => {
 *   const handleClick = useSetTablesCallback(
 *     (e) => ({pets: {nemo: {species: 'fish', bubbles: e.bubbles}}}),
 *     [],
 *     store,
 *     (store, tables) => console.log(`Updated: ${JSON.stringify(tables)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTables(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"pets":{"nemo":{"species":"fish"}}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: {"pets":{"nemo":{"species":"fish","bubbles":true}}}'
 *
 * console.log(span.innerHTML);
 * // -> '{"pets":{"nemo":{"species":"fish","bubbles":true}}}'
 * ```
 * @category Store hooks
 */
/// useSetTablesCallback
/**
 * The useSetTableCallback hook returns a parameterized callback that can be
 * used to set the data of a single Table in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The second parameter is a function which will produce the Table object that
 * will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional third parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store to set, or a GetId function
 * that will return it.
 * @param getTable A function which returns the Table object that will be used
 * to update the Store, based on the parameter the callback will receive (and
 * which is most likely a DOM event).
 * @param getTableDeps An optional array of dependencies for the `getTable`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array. Also use this to indicate the
 * dependencies of a GetId functions if used as the tableId argument.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Table used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetTableCallback hook to create an event handler
 * which updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useSetTableCallback, useTable} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {nemo: {species: 'fish'}});
 * const App = () => {
 *   const handleClick = useSetTableCallback(
 *     'pets',
 *     (e) => ({nemo: {species: 'fish', bubbles: e.bubbles}}),
 *     [],
 *     store,
 *     (store, table) => console.log(`Updated: ${JSON.stringify(table)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTable('pets', store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"nemo":{"species":"fish"}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: {"nemo":{"species":"fish","bubbles":true}}'
 *
 * console.log(span.innerHTML);
 * // -> '{"nemo":{"species":"fish","bubbles":true}}'
 * ```
 * @category Store hooks
 */
/// useSetTableCallback
/**
 * The useSetRowCallback hook returns a parameterized callback that can be used
 * to set the data of a single Row in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The third parameter is a function which will produce the Row object that will
 * then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional fourth parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store, or a GetId function that
 * will return it.
 * @param rowId The Id of the Row in the Table to set, or a GetId function that
 * will return it.
 * @param getRow A function which returns the Row object that will be used to
 * update the Store, based on the parameter the callback will receive (and which
 * is most likely a DOM event).
 * @param getRowDeps An optional array of dependencies for the `getRow`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array. Also use this to indicate the
 * dependencies of any GetId functions if used as the tableId or rowId
 * arguments.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Row used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetRowCallback hook to create an event handler which
 * updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useRow, useSetRowCallback} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setRow('pets', 'nemo', {species: 'fish'});
 * const App = () => {
 *   const handleClick = useSetRowCallback(
 *     'pets',
 *     'nemo',
 *     (e) => ({species: 'fish', bubbles: e.bubbles}),
 *     [],
 *     store,
 *     (store, row) => console.log(`Updated: ${JSON.stringify(row)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useRow('pets', 'nemo', store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"species":"fish"}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: {"species":"fish","bubbles":true}'
 *
 * console.log(span.innerHTML);
 * // -> '{"species":"fish","bubbles":true}'
 * ```
 * @category Store hooks
 */
/// useSetRowCallback
/**
 * The useAddRowCallback hook returns a parameterized callback that can be used
 * to create a new Row in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The second parameter is a function which will produce the Row object that
 * will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional third parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 *
 * The `reuseRowIds` parameter defaults to `true`, which means that if you
 * delete a Row and then add another, the Id will be re-used - unless you delete
 * the entire Table, in which case all Row Ids will reset. Otherwise, if you
 * specify `reuseRowIds` to be `false`, then the Id will be a monotonically
 * increasing string representation of an increasing integer, regardless of any
 * you may have previously deleted.
 * @param tableId The Id of the Table in the Store, or a GetId function that
 * will return it.
 * @param getRow A function which returns the Row object that will be used to
 * update the Store, based on the parameter the callback will receive (and which
 * is most likely a DOM event).
 * @param getRowDeps An optional array of dependencies for the `getRow`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array. Also use this to indicate the
 * dependencies of a GetId functions if used as the tableId argument.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with the new Row
 * Id, a reference to the Store, and the Row used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @param reuseRowIds Whether Ids should be recycled from previously deleted Row
 * objects, defaulting to `true`.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useAddRowCallback hook to create an event handler which
 * updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useAddRowCallback, useTable} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setRow('pets', 'nemo', {species: 'fish'});
 * const App = () => {
 *   const handleClick = useAddRowCallback(
 *     'pets',
 *     (e) => ({species: 'frog', bubbles: e.bubbles}),
 *     [],
 *     store,
 *     (rowId) => console.log(`Added row: ${rowId}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTable('pets', store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"nemo":{"species":"fish"}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Added row: 0'
 *
 * console.log(span.innerHTML);
 * // -> '{"0":{"species":"frog","bubbles":true},"nemo":{"species":"fish"}}'
 * ```
 * @category Store hooks
 */
/// useAddRowCallback
/**
 * The useSetPartialRowCallback hook returns a parameterized callback that can
 * be used to set partial data of a single Row in the Store, leaving other Cell
 * values unaffected.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The third parameter is a function which will produce the partial Row object
 * that will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional fourth parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store, or a GetId function that
 * will return it.
 * @param rowId The Id of the Row in the Table to set, or a GetId function that
 * will return it.
 * @param getPartialRow A function which returns the partial Row object that
 * will be used to update the Store, based on the parameter the callback will
 * receive (and which is most likely a DOM event).
 * @param getPartialRowDeps An optional array of dependencies for the `getRow`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array. Also use this to indicate the
 * dependencies of any GetId functions if used as the tableId, rowId, or cellId
 * arguments.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Row used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetPartialRowCallback hook to create an event
 * handler which updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useRow, useSetPartialRowCallback} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setRow('pets', 'nemo', {species: 'fish'});
 * const App = () => {
 *   const handleClick = useSetPartialRowCallback(
 *     'pets',
 *     'nemo',
 *     (e) => ({bubbles: e.bubbles}),
 *     [],
 *     store,
 *     (store, partialRow) =>
 *       console.log(`Updated: ${JSON.stringify(partialRow)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useRow('pets', 'nemo', store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"species":"fish"}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: {"bubbles":true}'
 *
 * console.log(span.innerHTML);
 * // -> '{"species":"fish","bubbles":true}'
 * ```
 * @category Store hooks
 */
/// useSetPartialRowCallback
/**
 * The useSetCellCallback hook returns a parameterized callback that can be used
 * to set the value of a single Cell in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The fourth parameter is a function which will produce the Cell object that
 * will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional fourth parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store, or a GetId function that
 * will return it.
 * @param rowId The Id of the Row in the Table, or a GetId function that will
 * return it.
 * @param cellId The Id of the Cell in the Row to set, or a GetId function that
 * will return it.
 * @param getCell A function which returns the Cell value that will be used to
 * update the Store, or a MapCell function to update it, based on the parameter
 * the callback will receive (and which is most likely a DOM event).
 * @param getCellDeps An optional array of dependencies for the `getCell`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array. Also use this to indicate the
 * dependencies of any GetId functions if used as the tableId, rowId, or cellId
 * arguments.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Cell value (or MapCell function) used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetCellCallback hook to create an event handler
 * which updates the Store with a Cell value when the `span` element is clicked.
 *
 * ```jsx
 * import {useRow, useSetCellCallback} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setCell('pets', 'nemo', 'species', 'fish');
 * const App = () => {
 *   const handleClick = useSetCellCallback(
 *     'pets',
 *     'nemo',
 *     'bubbles',
 *     (e) => e.bubbles,
 *     [],
 *     store,
 *     (store, cell) => console.log(`Updated: ${cell}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useRow('pets', 'nemo', store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"species":"fish"}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: true'
 *
 * console.log(span.innerHTML);
 * // -> '{"species":"fish","bubbles":true}'
 * ```
 * @example
 * This example uses the useSetCellCallback hook to create an event handler
 * which updates the Store via a MapCell function when the `span` element is
 * clicked.
 *
 * ```jsx
 * import {useRow, useSetCellCallback} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setCell('pets', 'nemo', 'visits', 1);
 * const App = () => {
 *   const handleClick = useSetCellCallback(
 *     'pets',
 *     'nemo',
 *     'visits',
 *     (e) => (visits) => visits + (e.bubbles ? 1 : 0),
 *     [],
 *     store,
 *     () => console.log(`Updated with MapCell function`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useRow('pets', 'nemo', store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"visits":1}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated with MapCell function'
 *
 * console.log(span.innerHTML);
 * // -> '{"visits":2}'
 * ```
 * @category Store hooks
 */
/// useSetCellCallback
/**
 * The useSetValuesCallback hook returns a parameterized callback that can be
 * used to set the keyed value data of a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The first parameter is a function which will produce the Values object that
 * will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional second parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param getValues A function which returns the Values object that will be used
 * to update the Store, based on the parameter the callback will receive (and
 * which is most likely a DOM event).
 * @param getValuesDeps An optional array of dependencies for the `getValues`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Values used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetValuesCallback hook to create an event handler
 * which updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useSetValuesCallback, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValues({open: true});
 * const App = () => {
 *   const handleClick = useSetValuesCallback(
 *     (e) => ({bubbles: e.bubbles}),
 *     [],
 *     store,
 *     (store, values) => console.log(`Updated: ${JSON.stringify(values)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useValues(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"open":true}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: {"bubbles":true}'
 *
 * console.log(span.innerHTML);
 * // -> '{"bubbles":true}'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useSetValuesCallback
/**
 * The useSetPartialValuesCallback hook returns a parameterized callback that
 * can be used to set partial Values data in the Store, leaving other Values
 * unaffected.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The third parameter is a function which will produce the partial Values
 * object that will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional fourth parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param getPartialValues A function which returns the partial Values object
 * that will be used to update the Store, based on the parameter the callback
 * will receive (and which is most likely a DOM event).
 * @param getPartialValuesDeps An optional array of dependencies for the
 * `getValues` function, which, if any change, result in the regeneration of the
 * callback. This parameter defaults to an empty array.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Values used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetPartialValuesCallback hook to create an event
 * handler which updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useSetPartialValuesCallback, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValues({open: true});
 * const App = () => {
 *   const handleClick = useSetPartialValuesCallback(
 *     (e) => ({bubbles: e.bubbles}),
 *     [],
 *     store,
 *     (store, partialValues) =>
 *       console.log(`Updated: ${JSON.stringify(partialValues)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useValues(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"open":true}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: {"bubbles":true}'
 *
 * console.log(span.innerHTML);
 * // -> '{"open":true,"bubbles":true}'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useSetPartialValuesCallback
/**
 * The useSetValueCallback hook returns a parameterized callback that can be
 * used to set the data of a single Value in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * mutate the data in the Store. In this case, the parameter will likely be the
 * event, so that you can use data from it as part of the mutation.
 *
 * The second parameter is a function which will produce the Value object that
 * will then be used to update the Store in the callback.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional third parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the mutation to your application's undo stack.
 *
 * The Store to which the callback will make the mutation (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param valueId The Id of the Value in the Store to set, or a GetId function
 * that will return it.
 * @param getValue A function which returns the Value object that will be used
 * to update the Store, based on the parameter the callback will receive (and
 * which is most likely a DOM event).
 * @param getValueDeps An optional array of dependencies for the `getValue`
 * function, which, if any change, result in the regeneration of the callback.
 * This parameter defaults to an empty array. Also use this to indicate the
 * dependencies of a GetId function if used as the valueId argument.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the mutation, with a reference
 * to the Store and the Value used in the update.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetValueCallback hook to create an event handler
 * which updates the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useSetValueCallback, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => {
 *   const handleClick = useSetValueCallback(
 *     'bubbles',
 *     (e) => e.bubbles,
 *     [],
 *     store,
 *     (store, value) => console.log(`Updated: ${JSON.stringify(value)}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useValues(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"open":true}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Updated: true'
 *
 * console.log(span.innerHTML);
 * // -> '{"open":true,"bubbles":true}'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useSetValueCallback
/**
 * The useDelTablesCallback hook returns a callback that can be used to remove
 * all of the tabular data in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * delete data in a Store.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the deletion to your application's undo stack.
 *
 * The Store to which the callback will make the deletion (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the deletion, with a reference
 * to the Store.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useDelTablesCallback hook to create an event handler
 * which deletes from the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useDelTablesCallback, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const App = () => {
 *   const handleClick = useDelTablesCallback(store, () =>
 *     console.log('Deleted'),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTables(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"pets":{"nemo":{"species":"fish"}}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Deleted'
 *
 * console.log(span.innerHTML);
 * // -> '{}'
 * ```
 * @category Store hooks
 */
/// useDelTablesCallback
/**
 * The useDelTableCallback hook returns a callback that can be used to remove a
 * single Table from a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * delete data in a Store.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the deletion to your application's undo stack.
 *
 * The Store to which the callback will make the deletion (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the deletion, with a reference
 * to the Store.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useDelTableCallback hook to create an event handler
 * which deletes from the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useDelTableCallback, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const App = () => {
 *   const handleClick = useDelTableCallback('pets', store, () =>
 *     console.log('Deleted'),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTables(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"pets":{"nemo":{"species":"fish"}}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Deleted'
 *
 * console.log(span.innerHTML);
 * // -> '{}'
 * ```
 * @category Store hooks
 */
/// useDelTableCallback
/**
 * The useDelRowCallback hook returns a callback that can be used to remove a
 * single Row from a Table.
 *
 * This hook is useful, for example, when creating an event handler that will
 * delete data in a Store.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the deletion to your application's undo stack.
 *
 * The Store to which the callback will make the deletion (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the deletion, with a reference
 * to the Store.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useDelRowCallback hook to create an event handler which
 * deletes from the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useDelRowCallback, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const App = () => {
 *   const handleClick = useDelRowCallback('pets', 'nemo', store, () =>
 *     console.log('Deleted'),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTables(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"pets":{"nemo":{"species":"fish"}}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Deleted'
 *
 * console.log(span.innerHTML);
 * // -> '{}'
 * ```
 * @category Store hooks
 */
/// useDelRowCallback
/**
 * The useDelCellCallback hook returns a callback that can be used to remove a
 * single Cell from a Row.
 *
 * This hook is useful, for example, when creating an event handler that will
 * delete data in a Store.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the deletion to your application's undo stack.
 *
 * The Store to which the callback will make the deletion (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param tableId The Id of the Table in the Store.
 * @param rowId The Id of the Row in the Table.
 * @param cellId The Id of the Cell in the Row.
 * @param forceDel An optional flag to indicate that the whole Row should be
 * deleted, even if a TablesSchema provides a default value for this Cell.
 * Defaults to `false`.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the deletion, with a reference
 * to the Store.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useDelCellCallback hook to create an event handler
 * which deletes from the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useDelCellCallback, useTables} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const App = () => {
 *   const handleClick = useDelCellCallback(
 *     'pets',
 *     'nemo',
 *     'species',
 *     false,
 *     store,
 *     () => console.log('Deleted'),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useTables(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"pets":{"nemo":{"species":"fish"}}}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Deleted'
 *
 * console.log(span.innerHTML);
 * // -> '{}'
 * ```
 * @category Store hooks
 */
/// useDelCellCallback
/**
 * The useDelValuesCallback hook returns a callback that can be used to remove
 * all of the keyed value data in a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * delete data in a Store.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the deletion to your application's undo stack.
 *
 * The Store to which the callback will make the deletion (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the deletion, with a reference
 * to the Store.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useDelValuesCallback hook to create an event handler
 * which deletes from the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useDelValuesCallback, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValues({open: true});
 * const App = () => {
 *   const handleClick = useDelValuesCallback(store, () =>
 *     console.log('Deleted'),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useValues(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"open":true}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Deleted'
 *
 * console.log(span.innerHTML);
 * // -> '{}'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useDelValuesCallback
/**
 * The useDelValueCallback hook returns a callback that can be used to remove a
 * single Value from a Store.
 *
 * This hook is useful, for example, when creating an event handler that will
 * delete data in a Store.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the Store has been
 * updated. This is a useful place to call the addCheckpoint method, for
 * example, if you wish to add the deletion to your application's undo stack.
 *
 * The Store to which the callback will make the deletion (indicated by the
 * hook's `storeOrStoreId` parameter) is always automatically used as a hook
 * dependency for the callback.
 * @param valueId The Id of the Value in the Store.
 * @param storeOrStoreId The Store to be updated: omit for the default context
 * Store, provide an Id for a named context Store, or provide an explicit
 * reference.
 * @param then A function which is called after the deletion, with a reference
 * to the Store.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useDelValueCallback hook to create an event handler
 * which deletes from the Store when the `span` element is clicked.
 *
 * ```jsx
 * import {useDelValueCallback, useValues} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValues({open: true, employees: 3});
 * const App = () => {
 *   const handleClick = useDelValueCallback('open', store, () =>
 *     console.log('Deleted'),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       {JSON.stringify(useValues(store))}
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const span = app.querySelector('span');
 * console.log(span.innerHTML);
 * // -> '{"open":true,"employees":3}'
 *
 * // User clicks the <span> element:
 * // -> span MouseEvent('click', {bubbles: true})
 * // -> 'Deleted'
 *
 * console.log(span.innerHTML);
 * // -> '{"employees":3}'
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useDelValueCallback
/**
 * The useHasTablesListener hook registers a listener function with the Store
 * that will be called when Tables as a whole are added to or removed from the
 * Store.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasTables hook).
 *
 * Unlike the addHasTablesListener method, which returns a listener Id and
 * requires you to remove it manually, the useHasTablesListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param listener The function that will be called whenever Tables as a whole
 * are added or removed.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasTablesListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasTablesListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasTablesListener(() => console.log('Tables existence changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasTables);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'brown'); // !act
 * // -> 'Tables existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasTables);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasTablesListener
/**
 * The useTablesListener hook registers a listener function with a Store that
 * will be called whenever tabular data in it changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useTables hook).
 *
 * Unlike the addTablesListener method, which returns a listener Id and requires
 * you to remove it manually, the useTablesListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param listener The function that will be called whenever tabular data in the
 * Store changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useTablesListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useTablesListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useTablesListener(() => console.log('Tables changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().tables);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Tables changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().tables);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useTablesListener
/**
 * The useTableIdsListener hook registers a listener function with a Store that
 * will be called whenever the Table Ids in it change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useTableIds hook).
 *
 * Unlike the addTableIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useTableIdsListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param listener The function that will be called whenever the Table Ids in
 * the Store change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useTableIdsListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useTableIdsListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useTableIdsListener(() => console.log('Table Ids changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().tableIds);
 * // -> 1
 *
 * store.setTable('species', {dog: {price: 5}}); // !act
 * // -> 'Table Ids changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().tableIds);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useTableIdsListener
/**
 * The useHasTableListener hook registers a listener function with the Store
 * that will be called when a Table is added to or removed from the Store.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasTable hook).
 *
 * You can either listen to a single Table (by specifying its Id as the method's
 * first parameter) or changes to any Table (by providing a `null` wildcard).
 *
 * Unlike the addHasTableListener method, which returns a listener Id and
 * requires you to remove it manually, the useHasTableListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the matching Table
 * is added or removed.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasTableListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasTableListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasTableListener('pets', () =>
 *     console.log('Table existence changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasTable);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Table existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasTable);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasTableListener
/**
 * The useTableListener hook registers a listener function with a Store that
 * will be called whenever data in a Table changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useTable hook).
 *
 * You can either listen to a single Table (by specifying its Id as the method's
 * first parameter) or changes to any Table (by providing a `null` wildcard).
 *
 * Unlike the addTableListener method, which returns a listener Id and requires
 * you to remove it manually, the useTableListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever data in the Table
 * changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useTableListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useTableListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useTableListener('pets', () => console.log('Table changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().table);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Table changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().table);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useTableListener
/**
 * The useTableCellIdsListener hook registers a listener function with a Store
 * that will be called whenever the Cell Ids that appear anywhere in a Table
 * change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useTableCellIds hook).
 *
 * You can either listen to a single Table (by specifying its Id as the method's
 * first parameter) or changes to any Table (by providing `null`).
 *
 * Unlike the addTableCellIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useTableCellIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Cell Ids that
 * appear anywhere in a Table change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useTableCellIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Store.
 *
 * ```jsx
 * import {Provider, useTableCellIdsListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useTableCellIdsListener('pets', () => console.log('Cell Ids changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().tableCellIds);
 * // -> 1
 *
 * store.setRow('pets', 'felix', {species: 'cat'}); // !act
 * // -> 'Cell Ids changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().rowIds);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useTableCellIdsListener
/**
 * The useHasTableCellListener hook registers a listener function with the Store
 * that will be called when a Cell is added to or removed from anywhere in a
 * Table as a whole.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasTableCell hook).
 *
 * You can either listen to a single Table Cell being added or removed (by
 * specifying the Table Id and Cell Id, as the method's first two parameters) or
 * changes to any Table Cell (by providing `null` wildcards).
 *
 * Unlike the addHasTableCellIds method, which returns a listener Id and
 * requires you to remove it manually, the useHasTableCellListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param cellId The Id of the Cell to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the matching Cell
 * is added to or removed from anywhere in the Table.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasTableCellListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasTableCellListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasTableCellListener('pets', 'color', () =>
 *     console.log('Table Cell existence changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasTableCell);
 * // -> 1
 *
 * store.setRow('pets', 'fido', {color: 'brown'}); // !act
 * // -> 'Table Cell existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasTableCell);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasTableCellListener
/**
 * The useRowCountListener hook registers a listener function with a Store that
 * will be called whenever the count of the Row objects in a Table changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useRowCount hook).
 *
 * You can either listen to a single Table (by specifying its Id as the method's
 * first parameter) or changes to any Table (by providing `null`).
 *
 * Unlike the addRowCountListener method, which returns a listener Id and
 * requires you to remove it manually, the useRowCountListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the count of the
 * Row objects in the Table changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useRowCountListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useRowCountListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useRowCountListener('pets', () => console.log('Row count changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().rowCount);
 * // -> 1
 *
 * store.setRow('pets', 'felix', {color: 'black'}); // !act
 * // -> 'Row count changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().rowCount);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.1.0
 */
/// useRowCountListener
/**
 * The useRowIdsListener hook registers a listener function with a Store that
 * will be called whenever the Row Ids in a Table change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useRowIds hook).
 *
 * You can either listen to a single Table (by specifying its Id as the method's
 * first parameter) or changes to any Table (by providing `null`).
 *
 * Unlike the addRowIdsListener method, which returns a listener Id and requires
 * you to remove it manually, the useRowIdsListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Row Ids in the
 * Table change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useRowIdsListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useRowIdsListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useRowIdsListener('pets', () => console.log('Row Ids changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().rowIds);
 * // -> 1
 *
 * store.setRow('pets', 'felix', {color: 'black'}); // !act
 * // -> 'Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().rowIds);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useRowIdsListener
/**
 * The useSortedRowIdsListener hook registers a listener function with a Store
 * that will be called whenever sorted (and optionally, paginated) Row Ids in a
 * Table change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useSortedRowIds hook).
 *
 * Unlike the addSortedRowIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useSortedRowIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table in the Store.
 * @param cellId The Id of the Cell whose values are used for the sorting, or
 * `undefined` to by sort the Row Id itself.
 * @param descending Whether the sorting should be in descending order.
 * @param offset The number of Row Ids to skip for pagination purposes, if any.
 * @param limit The maximum number of Row Ids to return, or `undefined` for all.
 * @param listener The function that will be called whenever the sorted Row Ids
 * in the Table change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useSortedRowIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Store.
 *
 * ```jsx
 * import {Provider, useSortedRowIdsListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useSortedRowIdsListener('pets', 'species', false, 0, undefined, () =>
 *     console.log('Sorted Row Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *   },
 * });
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().sortedRowIds);
 * // -> 1
 *
 * store.setRow('pets', 'cujo', {species: 'wolf'}); // !act
 * // -> 'Sorted Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().sortedRowIds);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v2.0.0
 */
/// useSortedRowIdsListener
/**
 * The useHasRowListener hook registers a listener function with the Store that
 * will be called when a Row is added to or removed from the Store.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasRow hook).
 *
 * You can either listen to a single Row being added or removed (by specifying
 * the Table Id and Row Id, as the method's first two parameters) or changes to
 * any Row (by providing `null` wildcards).
 *
 * Both, either, or neither of the `tableId` and `rowId` parameters can be
 * wildcarded with `null`. You can listen to a specific Row in a specific Table,
 * any Row in a specific Table, a specific Row in any Table, or any Row in any
 * Table.
 *
 * Unlike the addHasRowListener method, which returns a listener Id and requires
 * you to remove it manually, the useHasRowListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the matching Row is
 * added or removed.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasRowListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasRowListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasRowListener('pets', 'fido', () =>
 *     console.log('Row existence changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasRow);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Row existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasRow);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasRowListener
/**
 * The useRowListener hook registers a listener function with a Store that will
 * be called whenever data in a Row changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useRow hook).
 *
 * You can either listen to a single Row (by specifying the Table Id and Row Id
 * as the method's first two parameters) or changes to any Row (by providing
 * `null` wildcards).
 *
 * Both, either, or neither of the `tableId` and `rowId` parameters can be
 * wildcarded with `null`. You can listen to a specific Row in a specific Table,
 * any Row in a specific Table, a specific Row in any Table, or any Row in any
 * Table.
 *
 * Unlike the addRowListener method, which returns a listener Id and requires
 * you to remove it manually, the useRowListener hook manages this lifecycle for
 * you: when the listener changes (per its `listenerDeps` dependencies) or the
 * component unmounts, the listener on the underlying Store will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever data in the Row
 * changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useRowListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useRowListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useRowListener('pets', 'fido', () => console.log('Row changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().row);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Row changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().row);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useRowListener
/**
 * The useCellIdsListener hook registers a listener function with a Store that
 * will be called whenever the Cell Ids in a Row change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useCellIds hook).
 *
 * You can either listen to a single Row (by specifying the Table Id and Row Id
 * as the method's first two parameters) or changes to any Row (by providing
 * `null` wildcards).
 *
 * Both, either, or neither of the `tableId` and `rowId` parameters can be
 * wildcarded with `null`. You can listen to a specific Row in a specific Table,
 * any Row in a specific Table, a specific Row in any Table, or any Row in any
 * Table.
 *
 * Unlike the addCellIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useCellIdsListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Cell Ids in the
 * Row change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useCellIdsListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useCellIdsListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useCellIdsListener('pets', 'fido', () =>
 *     console.log('Cell Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().cellIds);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * // -> 'Cell Ids changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().cellIds);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useCellIdsListener
/**
 * The useHasCellListener hook registers a listener function with the Store that
 * will be called when a Cell is added to or removed from the Store.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasCell hook).
 *
 * You can either listen to a single Cell being added or removed (by specifying
 * the Table Id, Row Id, and Cell Id as the method's first three parameters) or
 * changes to any Cell (by providing `null` wildcards).
 *
 * All, some, or none of the `tableId`, `rowId`, and `cellId` parameters can be
 * wildcarded with `null`. You can listen to a specific Cell in a specific Row
 * in a specific Table, any Cell in any Row in any Table, for example - or every
 * other combination of wildcards.
 *
 * Unlike the addHasCellListener method, which returns a listener Id and
 * requires you to remove it manually, the useHasCellListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
 * @param cellId The Id of the Cell to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the matching Cell
 * is added or removed.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasCellListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasCellListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasCellListener('pets', 'fido', 'color', () =>
 *     console.log('Cell existence changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasCell);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'brown'); // !act
 * // -> 'Cell existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasCell);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasCellListener
/**
 * The useCellListener hook registers a listener function with a Store that will
 * be called whenever data in a Cell changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useCell hook).
 *
 * You can either listen to a single Cell (by specifying the Table Id, Row Id,
 * and Cell Id as the method's first three parameters) or changes to any Cell
 * (by providing `null` wildcards).
 *
 * All, some, or none of the `tableId`, `rowId`, and `cellId` parameters can be
 * wildcarded with `null`. You can listen to a specific Cell in a specific Row
 * in a specific Table, any Cell in any Row in any Table, for example - or every
 * other combination of wildcards.
 *
 * Unlike the addCellListener method, which returns a listener Id and requires
 * you to remove it manually, the useCellListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param tableId The Id of the Table to listen to, or `null` as a wildcard.
 * @param rowId The Id of the Row to listen to, or `null` as a wildcard.
 * @param cellId The Id of the Cell to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever data in the Cell
 * changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useCellListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useCellListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useCellListener('pets', 'fido', 'color', () =>
 *     console.log('Cell changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {color: 'brown'}}});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().cell);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Cell changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().cell);
 * // -> 0
 * ```
 * @category Store hooks
 */
/// useCellListener
/**
 * The useHasValuesListener hook registers a listener function with the Store
 * that will be called when Values as a whole are added to or removed from the
 * Store.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasValues hook).
 *
 * Unlike the addHasValuesListener method, which returns a listener Id and
 * requires you to remove it manually, the useHasValuesListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param listener The function that will be called whenever Values as a whole
 * are added or removed.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasValuesListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasValuesListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasValuesListener(() => console.log('Values existence changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasValues);
 * // -> 1
 *
 * store.setValue('open', true); // !act
 * // -> 'Values existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasValues);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasValuesListener
/**
 * The useValuesListener hook registers a listener function with a Store that
 * will be called whenever keyed value data in it changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useValues hook).
 *
 * Unlike the addValuesListener method, which returns a listener Id and requires
 * you to remove it manually, the useValuesListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param listener The function that will be called whenever keyed value data in
 * the Store changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useValuesListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useValuesListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useValuesListener(() => console.log('Values changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setValues({open: true});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().values);
 * // -> 1
 *
 * store.setValue('open', false); // !act
 * // -> 'Values changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().values);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useValuesListener
/**
 * The useValueIdsListener hook registers a listener function with a Store that
 * will be called whenever the Value Ids in it change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useValueIds hook).
 *
 * Unlike the addValueIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useValueIdsListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param listener The function that will be called whenever the Value Ids in
 * the Store change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useValueIdsListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useValueIdsListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useValueIdsListener(() => console.log('Value Ids changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setValues({open: true});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().valueIds);
 * // -> 1
 *
 * store.setValue('employees', 3); // !act
 * // -> 'Value Ids changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().valueIds);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useValueIdsListener
/**
 * The useHasValueListener hook registers a listener function with the Store
 * that will be called when a Value is added to or removed from the Store.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useHasValue hook).
 *
 * You can either listen to a single Value being added or removed (by specifying
 * the Value Id) or any Value being added or removed (by providing a `null`
 * wildcard).
 *
 * Unlike the addHasValueListener method, which returns a listener Id and
 * requires you to remove it manually, the useHasValueListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying Store
 * will be deleted.
 * @param valueId The Id of the Value to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the matching Value
 * is added or removed.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useHasValueListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useHasValueListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useHasValueListener('open', () =>
 *     console.log('Value existence changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().hasValue);
 * // -> 1
 *
 * store.setValue('open', false); // !act
 * // -> 'Value existence changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().hasValue);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.4.0
 */
/// useHasValueListener
/**
 * The useValueListener hook registers a listener function with a Store that
 * will be called whenever data in a Value changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useValue hook).
 *
 * You can either listen to a single Value (by specifying its Id as the method's
 * first parameter) or changes to any Value (by providing a `null` wildcard).
 *
 * Unlike the addValueListener method, which returns a listener Id and requires
 * you to remove it manually, the useValueListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Store will be deleted.
 * @param valueId The Id of the Value to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever data in the Value
 * changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param mutator An optional boolean that indicates that the listener mutates
 * Store data.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useValueListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Store.
 *
 * ```jsx
 * import {Provider, useValueListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useValueListener('open', () => console.log('Value changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setValues({open: true});
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().value);
 * // -> 1
 *
 * store.setValue('open', false); // !act
 * // -> 'Value changed'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().value);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v3.0.0
 */
/// useValueListener
/**
 * The useStartTransactionListener hook registers a listener function with the
 * Store that will be called at the start of a transaction.
 *
 * Unlike the addStartTransactionListener method, which returns a listener Id
 * and requires you to remove it manually, the useStartTransactionListener hook
 * manages this lifecycle for you: when the listener changes (per its
 * `listenerDeps` dependencies) or the component unmounts, the listener on the
 * underlying Store will be deleted.
 * @param listener The function that will be called at the start of a
 * transaction.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useStartTransactionListener hook to create a listener
 * that is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Store.
 *
 * ```jsx
 * import {Provider, useStartTransactionListener} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useStartTransactionListener(() => console.log('Start transaction'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().transaction);
 * // -> 1
 *
 * store.setValue('open', false); // !act
 * // -> 'Start transaction'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().transaction);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.2.2
 */
/// useStartTransactionListener
/**
 * The useWillFinishTransactionListener hook registers a listener function with
 * a Store that will be called just before other non-mutating listeners are
 * called at the end of the transaction.
 *
 * Unlike the addWillFinisTransactionListener method, which returns a listener
 * Id and requires you to remove it manually, the
 * useWillFinishTransactionListener hook manages this lifecycle for you: when
 * the listener changes (per its `listenerDeps` dependencies) or the component
 * unmounts, the listener on the underlying Store will be deleted.
 * @param listener The function that will be called before the end of a
 * transaction.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useWillFinishTransactionListener hook to create a
 * listener that is scoped to a single component. When the component is
 * unmounted, the listener is removed from the Store.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useWillFinishTransactionListener,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useWillFinishTransactionListener(() =>
 *     console.log('Will finish transaction'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().transaction);
 * // -> 1
 *
 * store.setValue('open', false); // !act
 * // -> 'Will finish transaction'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().transaction);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.2.2
 */
/// useWillFinishTransactionListener
/**
 * The useDidFinishTransactionListener hook registers a listener function with a
 * Store that will be called just after other non-mutating listeners are called
 * at the end of the transaction.
 *
 * Unlike the addDidFinishTransactionListener method, which returns a listener
 * Id and requires you to remove it manually, the
 * useDidFinishTransactionListener hook manages this lifecycle for you: when the
 * listener changes (per its `listenerDeps` dependencies) or the component
 * unmounts, the listener on the underlying Store will be deleted.
 * @param listener The function that will be called after the end of a
 * transaction.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param storeOrStoreId The Store to register the listener with: omit for the
 * default context Store, provide an Id for a named context Store, or provide an
 * explicit reference.
 * @example
 * This example uses the useDidFinishTransactionListener hook to create a
 * listener that is scoped to a single component. When the component is
 * unmounted, the listener is removed from the Store.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useDidFinishTransactionListener,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useDidFinishTransactionListener(() =>
 *     console.log('Did finish transaction'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore();
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} />); // !act
 * console.log(store.getListenerStats().transaction);
 * // -> 1
 *
 * store.setValue('open', false); // !act
 * // -> 'Did finish transaction'
 *
 * root.unmount(); // !act
 * console.log(store.getListenerStats().transaction);
 * // -> 0
 * ```
 * @category Store hooks
 * @since v4.2.2
 */
/// useDidFinishTransactionListener
/**
 * The useCreateMetrics hook is used to create a Metrics object within a React
 * application with convenient memoization.
 *
 * It is possible to create a Metrics object outside of the React app with the
 * regular createMetrics function and pass it in, but you may prefer to create
 * it within the app, perhaps inside the top-level component. To prevent a new
 * Metrics object being created every time the app renders or re-renders, since
 * v5.0 this hook performs the creation in an effect. As a result it will return
 * `undefined` on the brief first render (or if the Store is not yet defined),
 * which you should defend against.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should also cause the Metrics object to be recreated, you can provide them in
 * an array in the optional second parameter, just as you would for any React
 * hook with dependencies.
 *
 * This hook ensures the Metrics object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the Store for which to create a new Metrics
 * object.
 * @param create A function for performing the creation steps of the Metrics
 * object for the Store, plus any additional steps such as adding definitions or
 * listeners, and returning it.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Metrics object.
 * @example
 * This example creates a Metrics object at the top level of a React
 * application. Even though the App component is rendered twice, the Metrics
 * object creation only occurs once by default.
 *
 * ```jsx
 * import {createMetrics, createStore} from 'tinybase';
 * import {useCreateMetrics, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateStore(() =>
 *     createStore().setTable('species', {dog: {price: 5}, cat: {price: 4}}),
 *   );
 *   const metrics = useCreateMetrics(store, (store) => {
 *     console.log('Metrics created');
 *     return createMetrics(store).setMetricDefinition(
 *       'speciesCount',
 *       'species',
 *     );
 *   });
 *   return <span>{metrics?.getMetric('speciesCount')}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Metrics created'
 *
 * root.render(<App />); // !act
 * // No second Metrics creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>2</span>'
 * ```
 * @example
 * This example creates a Metrics object at the top level of a React
 * application. The App component is rendered twice, each with a different
 * top-level prop. The useCreateMetrics hook takes the tableToCount prop as a
 * dependency, and so the Metrics object is created again on the second render.
 *
 * ```jsx
 * import {createMetrics, createStore} from 'tinybase';
 * import {useCreateMetrics, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({tableToCount}) => {
 *   const store = useCreateStore(() =>
 *     createStore()
 *       .setTable('pets', {fido: {species: 'dog'}})
 *       .setTable('species', {dog: {price: 5}, cat: {price: 4}}),
 *   );
 *   const metrics = useCreateMetrics(
 *     store,
 *     (store) => {
 *       console.log(`Count created for ${tableToCount} table`);
 *       return createMetrics(store).setMetricDefinition(
 *         'tableCount',
 *         tableToCount,
 *       );
 *     },
 *     [tableToCount],
 *   );
 *   return <span>{metrics?.getMetric('tableCount')}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App tableToCount="pets" />); // !act
 * // -> 'Count created for pets table'
 *
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 *
 * root.render(<App tableToCount="species" />); // !act
 * // -> 'Count created for species table'
 *
 * console.log(app.innerHTML);
 * // -> '<span>2</span>'
 * ```
 * @category Metrics hooks
 */
/// useCreateMetrics
/**
 * The useMetricsIds hook is used to retrieve the Ids of all the named Metrics
 * objects present in the current Provider component context.
 * @returns A list of the Ids in the context.
 * @example
 * This example adds two named Metrics objects to a Provider context and an
 * inner component accesses their Ids.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useCreateMetrics,
 *   useCreateStore,
 *   useMetricsIds,
 * } from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store1 = useCreateStore(createStore);
 *   const metrics1 = useCreateMetrics(store1, createMetrics);
 *   const store2 = useCreateStore(createStore);
 *   const metrics2 = useCreateMetrics(store2, createMetrics);
 *   return (
 *     <Provider metricsById={{metrics1, metrics2}}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>{JSON.stringify(useMetricsIds())}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["metrics1","metrics2"]</span>'
 * ```
 * @category Metrics hooks
 * @since v4.1.0
 */
/// useMetricsIds
/**
 * The useMetrics hook is used to get a reference to a Metrics object from
 * within a Provider component context.
 *
 * A Provider component is used to wrap part of an application in a context. It
 * can contain a default Metrics object (or a set of Metrics objects named by
 * Id) that can be easily accessed without having to be passed down as props
 * through every component.
 *
 * The useMetrics hook lets you either get a reference to the default Metrics
 * object (when called without a parameter), or one of the Metrics objects that
 * are named by Id (when called with an Id parameter).
 * @param id An optional Id for accessing a Metrics object that was named with
 * an Id in the Provider.
 * @returns A reference to the Metrics object (or `undefined` if not within a
 * Provider context, or if the requested Metrics object does not exist).
 * @example
 * This example creates a Provider context into which a default Metrics object
 * is provided. A component within it then uses the useMetrics hook to get a
 * reference to the Metrics object again, without the need to have it passed
 * as a prop.
 *
 * ```jsx
 * import {Provider, useMetrics} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metrics={metrics}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useMetrics().getListenerStats().metric}</span>;
 *
 * const metrics = createMetrics(createStore());
 * const app = document.createElement('div');
 * createRoot(app).render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Metrics object is
 * provided, named by Id. A component within it then uses the useMetrics hook
 * with that Id to get a reference to the Metrics object again, without the need
 * to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useMetrics} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metricsById={{petStore: metrics}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useMetrics('petStore').getListenerStats().metric}</span>
 * );
 *
 * const metrics = createMetrics(createStore());
 * const app = document.createElement('div');
 * createRoot(app).render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Metrics hooks
 */
/// useMetrics
/**
 * The useMetricsOrMetricsById hook is used to get a reference to a Metrics
 * object from within a Provider component context, _or_ have it passed directly
 * to this hook.
 *
 * This is mostly of use when you are developing a component that needs a
 * Metrics object and which might have been passed in explicitly to the
 * component or is to be picked up from the context by Id (a common pattern for
 * Metrics-based components).
 *
 * This hook is unlikely to be used often. For most situations, you will want to
 * use the useMetrics hook.
 * @param metricsOrMetricsId Either an Id for accessing a Metrics object that
 * was named with an Id in the Provider, or the Metrics object itself.
 * @returns A reference to the Metrics object (or `undefined` if not within a
 * Provider context, or if the requested Metrics object does not exist).
 * @example
 * This example creates a Provider context into which a default Metrics object
 * is provided. A component within it then uses the useMetricsOrMetricsById hook
 * to get a reference to the Metrics object again, without the need to have it
 * passed as a prop. Note however, that unlike the useMetrics hook example, this
 * component would also work if you were to pass the Metrics object directly
 * into it, making it more portable.
 *
 * ```jsx
 * import {Provider, useMetricsOrMetricsById} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metrics={metrics}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = ({metrics}) => (
 *   <span>
 *     {JSON.stringify(useMetricsOrMetricsById(metrics).getMetricIds())}
 *   </span>
 * );
 *
 * const metrics = createMetrics(
 *   createStore().setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *     worm: {price: 1},
 *   }),
 * ).setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["highestPrice"]</span>'
 * ```
 * @category Metrics hooks
 * @since v4.1.0
 */
/// useMetricsOrMetricsById
/**
 * The useMetricIds hook gets an array of the Metric Ids registered with a
 * Metrics object, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Metrics object or a set of Metrics objects named by
 * Id. The useMetricIds hook lets you indicate which Metrics object to get data
 * for: omit the optional final parameter for the default context Metrics
 * object, provide an Id for a named context Metrics object, or provide a
 * Metrics object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Metric Ids in the Metrics object will cause a re-render. When the component
 * containing this hook is unmounted, the listener will be automatically
 * removed.
 * @param metricsOrMetricsId The Metrics object to be accessed: omit for the
 * default context Metrics object, provide an Id for a named context Metrics
 * object, or provide an explicit reference.
 * @returns The Metric Ids in the Metrics object, or an empty array.
 * @example
 * This example creates an Metrics object outside the application, which is used
 * in the useMetricIds hook by reference. A newly-registered Metric re-renders
 * the component.
 *
 * ```jsx
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useMetricIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const metrics = createMetrics(store);
 * const App = () => <span>{JSON.stringify(useMetricIds(metrics))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[]</span>'
 *
 * const addMetricDefinition = () =>
 *   metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 * addMetricDefinition(); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["highestPrice"]</span>'
 * ```
 * @category Metrics hooks
 * @since v4.1.0
 */
/// useMetricIds
/**
 * The useMetric hook gets the current value of a Metric, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Metrics object or a set of Metrics objects named by
 * Id. The useMetric hook lets you indicate which Metrics object to get data
 * for: omit the optional final parameter for the default context Metrics
 * object, provide an Id for a named context Metrics object, or provide a
 * Metrics object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Metric will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param metricId The Id of the Metric.
 * @param metricsOrMetricsId The Metrics object to be accessed: omit for the
 * default context Metrics object, provide an Id for a named context Metrics
 * object, or provide an explicit reference.
 * @returns The numeric value of the Metric, or `undefined`.
 * @example
 * This example creates a Metrics object outside the application, which is used
 * in the useMetric hook by reference. A change to the Metric re-renders the
 * component.
 *
 * ```jsx
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useMetric} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('species', {
 *   dog: {price: 5},
 *   cat: {price: 4},
 *   worm: {price: 1},
 * });
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 * const App = () => <span>{useMetric('highestPrice', metrics)}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>5</span>'
 *
 * store.setCell('species', 'horse', 'price', 20); // !act
 * console.log(app.innerHTML);
 * // -> '<span>20</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Metrics object
 * is provided. A component within it then uses the useMetric hook.
 *
 * ```jsx
 * import {Provider, useMetric} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metrics={metrics}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useMetric('highestPrice')}</span>;
 *
 * const metrics = createMetrics(
 *   createStore().setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *     worm: {price: 1},
 *   }),
 * ).setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>5</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Metrics object
 * is provided. A component within it then uses the useMetric hook.
 *
 * ```jsx
 * import {Provider, useMetric} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metricsById={{petMetrics: metrics}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useMetric('highestPrice', 'petMetrics')}</span>;
 *
 * const metrics = createMetrics(
 *   createStore().setTable('species', {
 *     dog: {price: 5},
 *     cat: {price: 4},
 *     worm: {price: 1},
 *   }),
 * ).setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>5</span>'
 * ```
 * @category Metrics hooks
 */
/// useMetric
/**
 * The useMetricListener hook registers a listener function with the Metrics
 * object that will be called whenever the value of a specified Metric changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useMetric hook).
 *
 * You can either listen to a single Metric (by specifying the Metric Id as the
 * method's first parameter), or changes to any Metric (by providing a `null`
 * wildcard).
 *
 * Unlike the addMetricListener method, which returns a listener Id and requires
 * you to remove it manually, the useMetricListener hook manages this lifecycle
 * for you: when the listener changes (per its `listenerDeps` dependencies) or
 * the component unmounts, the listener on the underlying Metrics object, will
 * be deleted.
 * @param metricId The Id of the Metric to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Metric changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param metricsOrMetricsId The Metrics object to register the listener with:
 * omit for the default context Metrics object, provide an Id for a named
 * context Metrics object, or provide an explicit reference.
 * @example
 * This example uses the useMetricListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Metrics object.
 *
 * ```jsx
 * import {Provider, useMetricListener} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metrics={metrics}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useMetricListener('highestPrice', () => console.log('Metric changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('species', {
 *   dog: {price: 5},
 *   cat: {price: 4},
 *   worm: {price: 1},
 * });
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App metrics={metrics} />); // !act
 * console.log(metrics.getListenerStats().metric);
 * // -> 1
 *
 * store.setCell('species', 'horse', 'price', 20); // !act
 * // -> 'Metric changed'
 *
 * root.unmount(); // !act
 * console.log(metrics.getListenerStats().metric);
 * // -> 0
 * ```
 * @category Metrics hooks
 */
/// useMetricListener
/**
 * The useCreateIndexes hook is used to create an Indexes object within a React
 * application with convenient memoization.
 *
 * It is possible to create an Indexes object outside of the React app with the
 * regular createIndexes function and pass it in, but you may prefer to create
 * it within the app, perhaps inside the top-level component. To prevent a new
 * Indexes object being created every time the app renders or re-renders, since
 * v5.0 the this hook performs the creation in an effect. As a result it will
 * return `undefined` on the brief first render (or if the Store is not yet
 * defined), which you should defend against.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should also cause the Indexes object to be recreated, you can provide them in
 * an array in the optional second parameter, just as you would for any React
 * hook with dependencies.
 *
 * This hook ensures the Indexes object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the Store for which to create a new Indexes
 * object.
 * @param create A function for performing the creation steps of the Indexes
 * object for the Store, plus any additional steps such as adding definitions or
 * listeners, and returning it.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Indexes object.
 * @example
 * This example creates an Indexes object at the top level of a React
 * application. Even though the App component is rendered twice, the Indexes
 * object creation only occurs once by default.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import {useCreateIndexes, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateStore(() =>
 *     createStore().setTable('pets', {
 *       fido: {species: 'dog'},
 *       felix: {species: 'cat'},
 *       cujo: {species: 'dog'},
 *     }),
 *   );
 *   const indexes = useCreateIndexes(store, (store) => {
 *     console.log('Indexes created');
 *     return createIndexes(store).setIndexDefinition(
 *       'bySpecies',
 *       'pets',
 *       'species',
 *     );
 *   });
 *   return <span>{JSON.stringify(indexes?.getSliceIds('bySpecies'))}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Indexes created'
 *
 * root.render(<App />); // !act
 * // No second Indexes creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>["dog","cat"]</span>'
 * ```
 * @example
 * This example creates an Indexes object at the top level of a React
 * application. The App component is rendered twice, each with a different
 * top-level prop. The useCreateIndexes hook takes the cellToIndex prop as a
 * dependency, and so the Indexes object is created again on the second render.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import {useCreateIndexes, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({cellToIndex}) => {
 *   const store = useCreateStore(() =>
 *     createStore().setTable('pets', {
 *       fido: {species: 'dog', color: 'brown'},
 *       felix: {species: 'cat', color: 'black'},
 *       cujo: {species: 'dog', color: 'brown'},
 *     }),
 *   );
 *   const indexes = useCreateIndexes(
 *     store,
 *     (store) => {
 *       console.log(`Index created for ${cellToIndex} cell`);
 *       return createIndexes(store).setIndexDefinition(
 *         'byCell',
 *         'pets',
 *         cellToIndex,
 *       );
 *     },
 *     [cellToIndex],
 *   );
 *   return <span>{JSON.stringify(indexes?.getSliceIds('byCell'))}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App cellToIndex="species" />); // !act
 * // -> 'Index created for species cell'
 *
 * console.log(app.innerHTML);
 * // -> '<span>["dog","cat"]</span>'
 *
 * root.render(<App cellToIndex="color" />); // !act
 * // -> 'Index created for color cell'
 *
 * console.log(app.innerHTML);
 * // -> '<span>["brown","black"]</span>'
 * ```
 * @category Indexes hooks
 */
/// useCreateIndexes
/**
 * The useIndexesIds hook is used to retrieve the Ids of all the named Indexes
 * objects present in the current Provider component context.
 * @returns A list of the Ids in the context.
 * @example
 * This example adds two named Indexes objects to a Provider context and an
 * inner component accesses their Ids.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useCreateIndexes,
 *   useCreateStore,
 *   useIndexesIds,
 * } from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store1 = useCreateStore(createStore);
 *   const indexes1 = useCreateIndexes(store1, createIndexes);
 *   const store2 = useCreateStore(createStore);
 *   const indexes2 = useCreateIndexes(store2, createIndexes);
 *   return (
 *     <Provider indexesById={{indexes1, indexes2}}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>{JSON.stringify(useIndexesIds())}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["indexes1","indexes2"]</span>'
 * ```
 * @category Indexes hooks
 * @since v4.1.0
 */
/// useIndexesIds
/**
 * The useIndexes hook is used to get a reference to an Indexes object from
 * within a Provider component context.
 *
 * A Provider component is used to wrap part of an application in a context. It
 * can contain a default Indexes object (or a set of Indexes objects named by
 * Id) that can be easily accessed without having to be passed down as props
 * through every component.
 *
 * The useIndexes hook lets you either get a reference to the default Indexes
 * object (when called without a parameter), or one of the Indexes objects that
 * are named by Id (when called with an Id parameter).
 * @param id An optional Id for accessing an Indexes object that was named with
 * an Id in the Provider.
 * @returns A reference to the Indexes object (or `undefined` if not within a
 * Provider context, or if the requested Indexes object does not exist).
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. A component within it then uses the useIndexes hook to get a
 * reference to the Indexes object again, without the need to have it passed
 * as a prop.
 *
 * ```jsx
 * import {Provider, useIndexes} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useIndexes().getListenerStats().sliceIds}</span>;
 *
 * const indexes = createIndexes(createStore());
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @example
 * This example creates a Provider context into which an Indexes object is
 * provided, named by Id. A component within it then uses the useIndexes hook
 * with that Id to get a reference to the Indexes object again, without the need
 * to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useIndexes} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexesById={{petStore: indexes}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useIndexes('petStore').getListenerStats().sliceIds}</span>
 * );
 *
 * const indexes = createIndexes(createStore());
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Indexes hooks
 */
/// useIndexes
/**
 * The useIndexesOrIndexesById hook is used to get a reference to an Indexes
 * object from within a Provider component context, _or_ have it passed directly
 * to this hook.
 *
 * This is mostly of use when you are developing a component that needs an
 * Indexes object and which might have been passed in explicitly to the
 * component or is to be picked up from the context by Id (a common pattern for
 * Indexes-based components).
 *
 * This hook is unlikely to be used often. For most situations, you will want to
 * use the useIndexes hook.
 * @param indexesOrIndexesId Either an Id for accessing a Indexes object that
 * was named with an Id in the Provider, or the Indexes object itself.
 * @returns A reference to the Indexes object (or `undefined` if not within a
 * Provider context, or if the requested Indexes object does not exist).
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. A component within it then uses the useIndexesOrIndexesById hook
 * to get a reference to the Indexes object again, without the need to have it
 * passed as a prop. Note however, that unlike the useIndexes hook example, this
 * component would also work if you were to pass the Indexes object directly
 * into it, making it more portable.
 *
 * ```jsx
 * import {Provider, useIndexesOrIndexesById} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = ({indexes}) => (
 *   <span>
 *     {JSON.stringify(useIndexesOrIndexesById(indexes).getIndexIds())}
 *   </span>
 * );
 *
 * const indexes = createIndexes(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["bySpecies"]</span>'
 * ```
 * @category Indexes hooks
 * @since v4.1.0
 */
/// useIndexesOrIndexesById
/**
 * The useIndexIds hook gets an array of the Index Ids registered with an
 * Indexes object, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Indexes object or a set of Indexes objects named by
 * Id. The useIndexIds hook lets you indicate which Indexes object to get data
 * for: omit the optional final parameter for the default context Indexes
 * object, provide an Id for a named context Indexes object, or provide an
 * Indexes object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Index Ids in the Indexes object will cause a re-render. When the component
 * containing this hook is unmounted, the listener will be automatically
 * removed.
 * @param indexesOrIndexesId The Indexes object to be accessed: omit for the
 * default context Indexes object, provide an Id for a named context Indexes
 * object, or provide an explicit reference.
 * @returns The Index Ids in the Indexes object, or an empty array.
 * @example
 * This example creates an Indexes object outside the application, which is used
 * in the useIndexIds hook by reference. A newly-registered Index re-renders the
 * component.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useIndexIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const indexes = createIndexes(store);
 * const App = () => <span>{JSON.stringify(useIndexIds(indexes))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[]</span>'
 *
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["bySpecies"]</span>'
 * ```
 * @category Indexes hooks
 * @since v4.1.0
 */
/// useIndexIds
/**
 * The useSliceIds hook gets the list of Slice Ids in an Index, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Indexes object or a set of Indexes objects named by
 * Id. The useSliceIds hook lets you indicate which Indexes object to get data
 * for: omit the optional final parameter for the default context Indexes
 * object, provide an Id for a named context Indexes object, or provide a
 * Indexes object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Slice Ids will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param indexId The Id of the Index.
 * @param indexesOrIndexesId The Indexes object to be accessed: omit for the
 * default context Indexes object, provide an Id for a named context Indexes
 * object, or provide an explicit reference.
 * @returns The Slice Ids in the Index, or an empty array.
 * @example
 * This example creates an Indexes object outside the application, which is used
 * in the useSliceIds hook by reference. A change to the Slice Ids re-renders
 * the component.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useSliceIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 * const App = () => (
 *   <span>{JSON.stringify(useSliceIds('bySpecies', indexes))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["dog","cat"]</span>'
 *
 * store.setRow('pets', 'lowly', {species: 'worm'}); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["dog","cat","worm"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. A component within it then uses the useSliceIds hook.
 *
 * ```jsx
 * import {Provider, useSliceIds} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useSliceIds('bySpecies'))}</span>;
 *
 * const indexes = createIndexes(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["dog","cat"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. A component within it then uses the useSliceIds hook.
 *
 * ```jsx
 * import {Provider, useSliceIds} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexesById={{petIndexes: indexes}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useSliceIds('bySpecies', 'petIndexes'))}</span>
 * );
 *
 * const indexes = createIndexes(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["dog","cat"]</span>'
 * ```
 * @category Indexes hooks
 */
/// useSliceIds
/**
 * The useSliceRowIds hook gets the list of Row Ids in a given Slice, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Indexes object or a set of Indexes objects named by
 * Id. The useSliceRowIds hook lets you indicate which Indexes object to get
 * data for: omit the optional final parameter for the default context Indexes
 * object, provide an Id for a named context Indexes object, or provide an
 * Indexes object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Row Ids in the Slice will cause a re-render. When the component containing
 * this hook is unmounted, the listener will be automatically removed.
 * @param indexId The Id of the Index.
 * @param sliceId The Id of the Slice in the Index.
 * @param indexesOrIndexesId The Indexes object to be accessed: omit for the
 * default context Indexes object, provide an Id for a named context Indexes
 * object, or provide an explicit reference.
 * @returns The Row Ids in the Slice, or an empty array.
 * @example
 * This example creates an Indexes object outside the application, which is used
 * in the useSliceRowIds hook by reference. A change to the Row Ids in the Slice
 * re-renders the component.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useSliceRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 * const App = () => (
 *   <span>
 *     {JSON.stringify(useSliceRowIds('bySpecies', 'dog', indexes))}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo","toto"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. A component within it then uses the useSliceRowIds hook.
 *
 * ```jsx
 * import {Provider, useSliceRowIds} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useSliceRowIds('bySpecies', 'dog'))}</span>
 * );
 *
 * const indexes = createIndexes(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. A component within it then uses the useSliceRowIds hook.
 *
 * ```jsx
 * import {Provider, useSliceRowIds} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexesById={{petIndexes: indexes}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(useSliceRowIds('bySpecies', 'dog', 'petIndexes'))}
 *   </span>
 * );
 *
 * const indexes = createIndexes(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 * ```
 * @category Indexes hooks
 */
/// useSliceRowIds
/**
 * The useSliceIdsListener hook registers a listener function with the Indexes
 * object that will be called whenever the Slice Ids in an Index change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useSliceIds hook).
 *
 * You can either listen to a single Index (by specifying the Index Id as the
 * method's first parameter), or changes to any Index (by providing a `null`
 * wildcard).
 *
 * Unlike the addSliceIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useSliceIdsListener hook manages this
 * lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Indexes object will be deleted.
 * @param indexId The Id of the Index to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Slice Ids in
 * the Index change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param indexesOrIndexesId The Indexes object to register the listener with:
 * omit for the default context Indexes object, provide an Id for a named
 * context Indexes object, or provide an explicit reference.
 * @example
 * This example uses the useSliceIdsListener hook to create a listener that is
 * scoped to a single component. When the component is unmounted, the listener
 * is removed from the Indexes object.
 *
 * ```jsx
 * import {Provider, useSliceIdsListener} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useSliceIdsListener('bySpecies', () => console.log('Slice Ids changed'));
 *   return <span>App</span>;
 * };
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
 * const root = createRoot(app);
 * root.render(<App indexes={indexes} />); // !act
 * console.log(indexes.getListenerStats().sliceIds);
 * // -> 1
 *
 * store.setRow('pets', 'lowly', {species: 'worm'}); // !act
 * // -> 'Slice Ids changed'
 *
 * root.unmount(); // !act
 * console.log(indexes.getListenerStats().sliceIds);
 * // -> 0
 * ```
 * @category Indexes hooks
 */
/// useSliceIdsListener
/**
 * The useSliceRowIdsListener hook registers a listener function with the
 * Indexes object that will be called whenever the Row Ids in a Slice change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useSliceRowIds hook).
 *
 * You can either listen to a single Slice (by specifying the Index Id and Slice
 * Id as the method's first two parameters), or changes to any Slice (by
 * providing `null` wildcards).
 *
 * Both, either, or neither of the `indexId` and `sliceId` parameters can be
 * wildcarded with `null`. You can listen to a specific Slice in a specific
 * Index, any Slice in a specific Index, a specific Slice in any Index, or any
 * Slice in any Index.
 *
 * Unlike the addSliceRowIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useSliceRowIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Indexes object will be deleted.
 * @param indexId The Id of the Index to listen to, or `null` as a wildcard.
 * @param sliceId The Id of the Slice to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Row Ids in the
 * Slice change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param indexesOrIndexesId The Indexes object to register the listener with:
 * omit for the default context Indexes object, provide an Id for a named
 * context Indexes object, or provide an explicit reference.
 * @example
 * This example uses the useSliceRowIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Indexes object.
 *
 * ```jsx
 * import {Provider, useSliceRowIdsListener} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useSliceRowIdsListener('bySpecies', 'dog', () =>
 *     console.log('Slice Row Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
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
 * const root = createRoot(app);
 * root.render(<App indexes={indexes} />); // !act
 * console.log(indexes.getListenerStats().sliceRowIds);
 * // -> 1
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * // -> 'Slice Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(indexes.getListenerStats().sliceRowIds);
 * // -> 0
 * ```
 * @category Indexes hooks
 */
/// useSliceRowIdsListener
/**
 * The useCreateRelationships hook is used to create a Relationships object
 * within a React application with convenient memoization.
 *
 * It is possible to create a Relationships object outside of the React app with
 * the regular createRelationships function and pass it in, but you may prefer
 * to create it within the app, perhaps inside the top-level component. To
 * prevent a new Relationships object being created every time the app renders
 * or re-renders, since v5.0 this hook performs the creation in an effect. As a
 * result it will return `undefined` on the brief first render (or if the Store
 * is not yet defined), which you should defend against.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should also cause the Relationships object to be recreated, you can provide
 * them in an array in the optional second parameter, just as you would for any
 * React hook with dependencies.
 *
 * This hook ensures the Relationships object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the Store for which to create a new Relationships
 * object.
 * @param create An optional callback for performing post-creation steps on the
 * Relationships object, such as adding definitions or listeners.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Relationships object.
 * @example
 * This example creates a Relationships object at the top level of a React
 * application. Even though the App component is rendered twice, the
 * Relationships object creation only occurs once by default.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import {useCreateRelationships, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateStore(() =>
 *     createStore()
 *       .setTable('pets', {
 *         fido: {species: 'dog'},
 *         felix: {species: 'cat'},
 *         cujo: {species: 'dog'},
 *       })
 *       .setTable('species', {dog: {price: 5}, cat: {price: 4}}),
 *   );
 *   const relationships = useCreateRelationships(store, (store) => {
 *     console.log('Relationships created');
 *     return createRelationships(store).setRelationshipDefinition(
 *       'petSpecies',
 *       'pets',
 *       'species',
 *       'species',
 *     );
 *   });
 *   return (
 *     <span>{relationships?.getRemoteRowId('petSpecies', 'fido')}</span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Relationships created'
 *
 * root.render(<App />); // !act
 * // No second Relationships creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>dog</span>'
 * ```
 * @example
 * This example creates a Relationships object at the top level of a React
 * application. The App component is rendered twice, each with a different
 * top-level prop. The useCreateRelationships hook takes the
 * `remoteTableAndCellToLink` prop as a dependency, and so the Relationships
 * object is created again on the second render.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import {useCreateRelationships, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({remoteTableAndCellToLink}) => {
 *   const store = useCreateStore(() =>
 *     createStore()
 *       .setTable('pets', {
 *         fido: {species: 'dog', color: 'brown'},
 *         felix: {species: 'cat', color: 'black'},
 *         cujo: {species: 'dog', color: 'brown'},
 *       })
 *       .setTable('species', {dog: {price: 5}, cat: {price: 4}})
 *       .setTable('color', {brown: {discount: 0.1}, black: {discount: 0}}),
 *   );
 *   const relationships = useCreateRelationships(
 *     store,
 *     (store) => {
 *       console.log(`Relationship created to ${remoteTableAndCellToLink}`);
 *       return createRelationships(store).setRelationshipDefinition(
 *         'cellLinked',
 *         'pets',
 *         remoteTableAndCellToLink,
 *         remoteTableAndCellToLink,
 *       );
 *     },
 *     [remoteTableAndCellToLink],
 *   );
 *   return (
 *     <span>{relationships?.getRemoteRowId('cellLinked', 'fido')}</span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App remoteTableAndCellToLink="species" />); // !act
 * // -> 'Relationship created to species'
 *
 * console.log(app.innerHTML);
 * // -> '<span>dog</span>'
 *
 * root.render(<App remoteTableAndCellToLink="color" />); // !act
 * // -> 'Relationship created to color'
 *
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @category Relationships hooks
 */
/// useCreateRelationships
/**
 * The useRelationshipsIds hook is used to retrieve the Ids of all the named
 * Relationships objects present in the current Provider component context.
 * @returns A list of the Ids in the context.
 * @example
 * This example adds two named Relationships objects to a Provider context and
 * an inner component accesses their Ids.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useCreateRelationships,
 *   useCreateStore,
 *   useRelationshipsIds,
 * } from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store1 = useCreateStore(createStore);
 *   const relationships1 = useCreateRelationships(
 *     store1,
 *     createRelationships,
 *   );
 *   const store2 = useCreateStore(createStore);
 *   const relationships2 = useCreateRelationships(
 *     store2,
 *     createRelationships,
 *   );
 *   return (
 *     <Provider relationshipsById={{relationships1, relationships2}}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>{JSON.stringify(useRelationshipsIds())}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["relationships1","relationships2"]</span>'
 * ```
 * @category Relationships hooks
 * @since v4.1.0
 */
/// useRelationshipsIds
/**
 * The useRelationships hook is used to get a reference to a Relationships
 * object from within a Provider component context.
 *
 * A Provider component is used to wrap part of an application in a context. It
 * can contain a default Relationships object (or a set of Relationships objects
 * named by Id) that can be easily accessed without having to be passed down as
 * props through every component.
 *
 * The useRelationships hook lets you either get a reference to the default
 * Relationships object (when called without a parameter), or one of the
 * Relationships objects that are named by Id (when called with an Id
 * parameter).
 * @param id An optional Id for accessing a Relationships object that was named
 * with an Id in the Provider.
 * @returns A reference to the Relationships object (or `undefined` if not
 * within a Provider context, or if the requested Relationships object does not
 * exist).
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useRelationships hook
 * to get a reference to the Relationships object again, without the need to
 * have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useRelationships} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useRelationships().getListenerStats().remoteRowId}</span>
 * );
 *
 * const relationships = createRelationships(createStore());
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Relationships object is
 * provided, named by Id. A component within it then uses the useRelationships
 * hook with that Id to get a reference to the Relationships object again,
 * without the need to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useRelationships} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationshipsById={{petStore: relationships}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {useRelationships('petStore').getListenerStats().remoteRowId}
 *   </span>
 * );
 *
 * const relationships = createRelationships(createStore());
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Relationships hooks
 */
/// useRelationships
/**
 * The useRelationshipsOrRelationshipsById hook is used to get a reference to a
 * Relationships object from within a Provider component context, _or_ have it
 * passed directly to this hook.
 *
 * This is mostly of use when you are developing a component that needs a
 * Relationships object and which might have been passed in explicitly to the
 * component or is to be picked up from the context by Id (a common pattern for
 * Relationships-based components).
 *
 * This is unlikely to be used often. For most situations, you will want to use
 * the useRelationships hook.
 * @param relationshipsOrRelationshipsId Either an Id for accessing a
 * Relationships object that was named with an Id in the Provider, or the
 * Relationships object itself.
 * @returns A reference to the Relationships object (or `undefined` if not
 * within a Provider context, or if the requested Relationships object does not
 * exist).
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the
 * useRelationshipsOrRelationshipsById hook to get a reference to the
 * Relationships object again, without the need to have it passed as a prop.
 * Note however, that unlike the useRelationships hook example, this component
 * would also work if you were to pass the Relationships object directly into
 * it, making it more portable.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useRelationshipsOrRelationshipsById,
 * } from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = ({relationships}) => (
 *   <span>
 *     {JSON.stringify(
 *       useRelationshipsOrRelationshipsById(
 *         relationships,
 *       ).getRelationshipIds(),
 *     )}
 *   </span>
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
 * // -> '<span>["petSpecies"]</span>'
 * ```
 * @category Relationships hooks
 * @since v4.1.0
 */
/// useRelationshipsOrRelationshipsById
/**
 * The useRelationshipIds hook gets an array of the Relationship Ids registered
 * with a Relationships object, and registers a listener so that any changes to
 * that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Relationships object or a set of Relationships
 * objects named by Id. The useRelationshipIds hook lets you indicate which
 * Relationships object to get data for: omit the optional final parameter for
 * the default context Relationships object, provide an Id for a named context
 * Relationships object, or provide a Relationships object explicitly by
 * reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Relationship Ids in the Relationships object will cause a re-render. When the
 * component containing this hook is unmounted, the listener will be
 * automatically removed.
 * @param relationshipsOrRelationshipsId The Relationships object to be
 * accessed: omit for the default context Relationships object, provide an Id
 * for a named context Relationships object, or provide an explicit reference.
 * @returns The Relationship Ids in the Relationships object, or an empty array.
 * @example
 * This example creates an Relationships object outside the application, which
 * is used in the useRelationshipIds hook by reference. A newly-registered
 * Relationship re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useRelationshipIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const relationships = createRelationships(store);
 * const App = () => (
 *   <span>{JSON.stringify(useRelationshipIds(relationships))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[]</span>'
 *
 * const addRelationshipDefinition = () =>
 *   relationships.setRelationshipDefinition(
 *     'petSpecies',
 *     'pets',
 *     'species',
 *     'species',
 *   );
 * addRelationshipDefinition(); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["petSpecies"]</span>'
 * ```
 * @category Relationships hooks
 * @since v4.1.0
 */
/// useRelationshipIds
/**
 * The useRemoteRowId hook gets the remote Row Id for a given local Row in a
 * Relationship, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Relationships object or a set of Relationships
 * objects named by Id. The useRemoteRowId hook lets you indicate which
 * Relationships object to get data for: omit the optional final parameter for
 * the default context Relationships object, provide an Id for a named context
 * Relationships object, or provide a Relationships object explicitly by
 * reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * remote Row Id will cause a re-render. When the component containing this hook
 * is unmounted, the listener will be automatically removed.
 * @param relationshipId The Id of the Relationship.
 * @param localRowId The Id of the local Row in the Relationship.
 * @param relationshipsOrRelationshipsId The Relationships object to be
 * accessed: omit for the default context Relationships object, provide an Id
 * for a named context Relationships object, or provide an explicit reference.
 * @returns The remote Row Id in the Relationship, or `undefined`.
 * @example
 * This example creates a Relationships object outside the application, which is
 * used in the useRemoteRowId hook by reference. A change to the remote Row Id
 * re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useRemoteRowId} from 'tinybase/ui-react';
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *   .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 * const App = () => (
 *   <span>{useRemoteRowId('petSpecies', 'cujo', relationships)}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>dog</span>'
 *
 * store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>wolf</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useRemoteRowId hook.
 *
 * ```jsx
 * import {Provider, useRemoteRowId} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useRemoteRowId('petSpecies', 'cujo')}</span>;
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
 * // -> '<span>dog</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useRemoteRowId hook.
 *
 * ```jsx
 * import {Provider, useRemoteRowId} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationshipsById={{petRelationships: relationships}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useRemoteRowId('petSpecies', 'cujo', 'petRelationships')}</span>
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
 * // -> '<span>dog</span>'
 * ```
 * @category Relationships hooks
 */
/// useRemoteRowId
/**
 * The useLocalRowIds hook gets the local Row Ids for a given remote Row in a
 * Relationship, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Relationships object or a set of Relationships
 * objects named by Id. The useLocalRowIds hook lets you indicate which
 * Relationships object to get data for: omit the optional final parameter for
 * the default context Relationships object, provide an Id for a named context
 * Relationships object, or provide a Relationships object explicitly by
 * reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * local Row Id will cause a re-render. When the component containing this hook
 * is unmounted, the listener will be automatically removed.
 * @param relationshipId The Id of the Relationship.
 * @param remoteRowId The Id of the remote Row in the Relationship.
 * @param relationshipsOrRelationshipsId The Relationships object to be
 * accessed: omit for the default context Relationships object, provide an Id
 * for a named context Relationships object, or provide an explicit reference.
 * @returns The local Row Ids in the Relationship, or an empty array.
 * @example
 * This example creates a Relationships object outside the application, which is
 * used in the useLocalRowIds hook by reference. A change to the local Row Ids
 * re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useLocalRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *   .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 * const App = () => (
 *   <span>
 *     {JSON.stringify(useLocalRowIds('petSpecies', 'dog', relationships))}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo","toto"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useLocalRowIds hook.
 *
 * ```jsx
 * import {Provider, useLocalRowIds} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useLocalRowIds('petSpecies', 'dog'))}</span>
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
 * // -> '<span>["fido","cujo"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useLocalRowIds hook.
 *
 * ```jsx
 * import {Provider, useLocalRowIds} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationshipsById={{petRelationships: relationships}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(
 *       useLocalRowIds('petSpecies', 'dog', 'petRelationships'),
 *     )}
 *   </span>
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
 * // -> '<span>["fido","cujo"]</span>'
 * ```
 * @category Relationships hooks
 */
/// useLocalRowIds
/**
 * The useLinkedRowIds hook gets the linked Row Ids for a given Row in a linked
 * list Relationship, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Relationships object or a set of Relationships
 * objects named by Id. The useLinkedRowIds hook lets you indicate which
 * Relationships object to get data for: omit the optional final parameter for
 * the default context Relationships object, provide an Id for a named context
 * Relationships object, or provide a Relationships object explicitly by
 * reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * linked Row Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param relationshipId The Id of the Relationship.
 * @param firstRowId The Id of the first Row in the linked list Relationship.
 * @param relationshipsOrRelationshipsId The Relationships object to be
 * accessed: omit for the default context Relationships object, provide an Id
 * for a named context Relationships object, or provide an explicit reference.
 * @returns The linked Row Ids in the Relationship.
 * @example
 * This example creates a Relationships object outside the application, which is
 * used in the useLinkedRowIds hook by reference. A change to the linked Row Ids
 * re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useLinkedRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', next: 'felix'},
 *   felix: {species: 'cat', next: 'cujo'},
 *   cujo: {species: 'dog'},
 * });
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSequence',
 *   'pets',
 *   'pets',
 *   'next',
 * );
 * const App = () => (
 *   <span>
 *     {JSON.stringify(useLinkedRowIds('petSequence', 'fido', relationships))}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","felix","cujo"]</span>'
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * store.setCell('pets', 'cujo', 'next', 'toto'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","felix","cujo","toto"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useLinkedRowIds hook.
 *
 * ```jsx
 * import {Provider, useLinkedRowIds} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useLinkedRowIds('petSequence', 'fido'))}</span>
 * );
 *
 * const relationships = createRelationships(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', next: 'felix'},
 *     felix: {species: 'cat', next: 'cujo'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","felix","cujo"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. A component within it then uses the useLinkedRowIds hook.
 *
 * ```jsx
 * import {Provider, useLinkedRowIds} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationshipsById={{petRelationships: relationships}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(
 *       useLinkedRowIds('petSequence', 'fido', 'petRelationships'),
 *     )}
 *   </span>
 * );
 *
 * const relationships = createRelationships(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', next: 'felix'},
 *     felix: {species: 'cat', next: 'cujo'},
 *     cujo: {species: 'dog'},
 *   }),
 * ).setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","felix","cujo"]</span>'
 * ```
 * @category Relationships hooks
 */
/// useLinkedRowIds
/**
 * The useRemoteRowIdListener hook registers a listener function with the
 * Relationships object that will be called whenever a remote Row Id in a
 * Relationship changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useRemoteRowId hook).
 *
 * You can either listen to a single local Row (by specifying the Relationship
 * Id and local Row Id as the method's first two parameters), or changes to any
 * local Row (by providing a `null` wildcards).
 *
 * Both, either, or neither of the `relationshipId` and `localRowId` parameters
 * can be wildcarded with `null`. You can listen to a specific local Row in a
 * specific Relationship, any local Row in a specific Relationship, a specific
 * local Row in any Relationship, or any local Row in any Relationship.
 *
 * Unlike the addRemoteRowIdListener method, which returns a listener Id and
 * requires you to remove it manually, the useRemoteRowIdListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Indexes object will be deleted.
 * @param relationshipId The Id of the Relationship to listen to, or `null` as a
 * wildcard.
 * @param localRowId The Id of the local Row to listen to, or `null` as a
 * wildcard.
 * @param listener The function that will be called whenever the remote Row Id
 * changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param relationshipsOrRelationshipsId The Relationships object to register
 * the listener with: omit for the default context Relationships object, provide
 * an Id for a named context Relationships object, or provide an explicit
 * reference.
 * @example
 * This example uses the useRemoteRowIdListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Relationships object.
 *
 * ```jsx
 * import {Provider, useRemoteRowIdListener} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useRemoteRowIdListener('petSpecies', 'cujo', () =>
 *     console.log('Remote Row Id changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *   .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
 * const relationships = createRelationships(store);
 * relationships.setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(relationships.getListenerStats().remoteRowId);
 * // -> 1
 *
 * store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
 * // -> 'Remote Row Id changed'
 *
 * root.unmount(); // !act
 * console.log(relationships.getListenerStats().remoteRowId);
 * // -> 0
 * ```
 * @category Relationships hooks
 */
/// useRemoteRowIdListener
/**
 * The useLocalRowIdsListener hook registers a listener function with the
 * Relationships object that will be called whenever the local Row Ids in a
 * Relationship change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useLocalRowsId hook).
 *
 * You can either listen to a single local Row (by specifying the Relationship
 * Id and local Row Id as the method's first two parameters), or changes to any
 * local Row (by providing a `null` wildcards).
 *
 * Both, either, or neither of the `relationshipId` and `remoteRowId` parameters
 * can be wildcarded with `null`. You can listen to a specific remote Row in a
 * specific Relationship, any remote Row in a specific Relationship, a specific
 * remote Row in any Relationship, or any remote Row in any Relationship.
 *
 * Unlike the addLocalRowsIdListener method, which returns a listener Id and
 * requires you to remove it manually, the useLocalRowIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Indexes object will be deleted.
 * @param relationshipId The Id of the Relationship to listen to, or `null` as a
 * wildcard.
 * @param remoteRowId The Id of the remote Row to listen to, or `null` as a
 * wildcard.
 * @param listener The function that will be called whenever the local Row Ids
 * change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param relationshipsOrRelationshipsId The Relationships object to register
 * the listener with: omit for the default context Relationships object, provide
 * an Id for a named context Relationships object, or provide an explicit
 * reference.
 * @example
 * This example uses the useLocalRowIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Relationships object.
 *
 * ```jsx
 * import {Provider, useLocalRowIdsListener} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useLocalRowIdsListener('petSpecies', 'dog', () =>
 *     console.log('Local Row Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *   .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
 * const relationships = createRelationships(store);
 * relationships.setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(relationships.getListenerStats().localRowIds);
 * // -> 1
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * // -> 'Local Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(relationships.getListenerStats().localRowIds);
 * // -> 0
 * ```
 * @category Relationships hooks
 */
/// useLocalRowIdsListener
/**
 * The useLinkedRowIdsListener hook registers a listener function with the
 * Relationships object that will be called whenever the linked Row Ids in a
 * Relationship change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useLinkedRowsId hook).
 *
 * Unlike other listener registration methods, you cannot provide `null`
 * wildcards for the first two parameters of the useLinkedRowIdsListener method.
 * This prevents the prohibitive expense of tracking all the possible linked
 * lists (and partial linked lists within them) in a Store.
 *
 * Unlike the addLinkedRowsIdListener method, which returns a listener Id and
 * requires you to remove it manually, the useLinkedRowIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Indexes object will be deleted.
 * @param relationshipId The Id of the Relationship to listen to.
 * @param firstRowId The Id of the first Row of the linked list to listen to.
 * @param listener The function that will be called whenever the linked Row Ids
 * change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param relationshipsOrRelationshipsId The Relationships object to register
 * the listener with: omit for the default context Relationships object, provide
 * an Id for a named context Relationships object, or provide an explicit
 * reference.
 * @example
 * This example uses the useLinkedRowIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Relationships object.
 *
 * ```jsx
 * import {Provider, useLinkedRowIdsListener} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useLinkedRowIdsListener('petSequence', 'fido', () =>
 *     console.log('Linked Row Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', next: 'felix'},
 *   felix: {species: 'cat', next: 'cujo'},
 *   cujo: {species: 'dog'},
 * });
 * const relationships = createRelationships(store);
 * relationships.setRelationshipDefinition(
 *   'petSequence',
 *   'pets',
 *   'pets',
 *   'next',
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(relationships.getListenerStats().linkedRowIds);
 * // -> 1
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * store.setCell('pets', 'cujo', 'next', 'toto'); // !act
 * // -> 'Linked Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(relationships.getListenerStats().linkedRowIds);
 * // -> 0
 * ```
 * @category Relationships hooks
 */
/// useLinkedRowIdsListener
/**
 * The useCreateQueries hook is used to create a Queries object within a React
 * application with convenient memoization.
 *
 * It is possible to create a Queries object outside of the React app with the
 * regular createQueries function and pass it in, but you may prefer to create
 * it within the app, perhaps inside the top-level component. To prevent a new
 * Queries object being created every time the app renders or re-renders, since
 * v5.0 this hook performs the creation in an effect. As a result it will return
 * `undefined` on the brief first render (or if the Store is not yet defined),
 * which you should defend against.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should also cause the Queries object to be recreated, you can provide them in
 * an array in the optional second parameter, just as you would for any React
 * hook with dependencies.
 *
 * This hook ensures the Queries object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the Store for which to create a new Queries
 * object.
 * @param create An optional callback for performing post-creation steps on the
 * Queries object, such as adding definitions or listeners.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Queries object.
 * @example
 * This example creates a Queries object at the top level of a React
 * application. Even though the App component is rendered twice, the Queries
 * object creation only occurs once by default.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import {useCreateQueries, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateStore(() =>
 *     createStore().setTable('pets', {
 *       fido: {species: 'dog', color: 'brown'},
 *       felix: {species: 'cat', color: 'black'},
 *       cujo: {species: 'dog', color: 'black'},
 *     }),
 *   );
 *   const queries = useCreateQueries(store, (store) => {
 *     console.log('Queries created');
 *     return createQueries(store).setQueryDefinition(
 *       'dogColors',
 *       'pets',
 *       ({select, where}) => {
 *         select('color');
 *         where('species', 'dog');
 *       },
 *     );
 *   });
 *   return (
 *     <span>{queries?.getResultCell('dogColors', 'fido', 'color')}</span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Queries created'
 *
 * root.render(<App />); // !act
 * // No second Queries creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @example
 * This example creates a Queries object at the top level of a React
 * application. The App component is rendered twice, each with a different
 * top-level prop. The useCreateQueries hook takes the `resultCell` prop as a
 * dependency, and so the Queries object is created again on the second render.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import {useCreateQueries, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateStore(() =>
 *     createStore().setTable('pets', {
 *       fido: {species: 'dog', color: 'brown'},
 *       felix: {species: 'cat', color: 'black'},
 *       cujo: {species: 'dog', color: 'black'},
 *     }),
 *   );
 *   const queries = useCreateQueries(store, (store) => {
 *     console.log('Queries created');
 *     return createQueries(store).setQueryDefinition(
 *       'dogColors',
 *       'pets',
 *       ({select, where}) => {
 *         select('color');
 *         where('species', 'dog');
 *       },
 *     );
 *   });
 *   return (
 *     <span>{queries?.getResultCell('dogColors', 'fido', 'color')}</span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Queries created'
 *
 * root.render(<App />); // !act
 * // No second Queries creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useCreateQueries
/**
 * The useQueriesIds hook is used to retrieve the Ids of all the named Queries
 * objects present in the current Provider component context.
 * @returns A list of the Ids in the context.
 * @example
 * This example adds two named Queries objects to a Provider context and an
 * inner component accesses their Ids.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useCreateQueries,
 *   useCreateStore,
 *   useQueriesIds,
 * } from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store1 = useCreateStore(createStore);
 *   const queries1 = useCreateQueries(store1, createQueries);
 *   const store2 = useCreateStore(createStore);
 *   const queries2 = useCreateQueries(store2, createQueries);
 *   return (
 *     <Provider queriesById={{queries1, queries2}}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>{JSON.stringify(useQueriesIds())}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["queries1","queries2"]</span>'
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useQueriesIds
/**
 * The useQueries hook is used to get a reference to a Queries object from
 * within a Provider component context.
 *
 * A Provider component is used to wrap part of an application in a context. It
 * can contain a default Queries object (or a set of Queries objects named by
 * Id) that can be easily accessed without having to be passed down as props
 * through every component.
 *
 * The useQueries hook lets you either get a reference to the default Queries
 * object (when called without a parameter), or one of the Queries objects that
 * are named by Id (when called with an Id parameter).
 * @param id An optional Id for accessing a Queries object that was named with
 * an Id in the Provider.
 * @returns A reference to the Queries object (or `undefined` if not within a
 * Provider context, or if the requested Queries object does not exist).
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useQueries hook to get a
 * reference to the Queries object again, without the need to have it passed as
 * a prop.
 *
 * ```jsx
 * import {Provider, useQueries} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useQueries().getListenerStats().table}</span>;
 *
 * const queries = createQueries(createStore());
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useQueries hook
 * with that Id to get a reference to the Queries object again, without the need
 * to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useQueries} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useQueries('petQueries').getListenerStats().table}</span>
 * );
 *
 * const queries = createQueries(createStore());
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useQueries
/**
 * The useQueriesOrQueriesById hook is used to get a reference to a Queries
 * object from within a Provider component context, _or_ have it passed directly
 * to this hook.
 *
 * This is mostly of use when you are developing a component that needs a
 * Queries object and which might have been passed in explicitly to the
 * component or is to be picked up from the context by Id (a common pattern for
 * Queries-based components).
 *
 * This is unlikely to be used often. For most situations, you will want to use
 * the useQueries hook.
 * @param queriesOrQueriesId Either an Id for accessing a Queries object that
 * was named with an Id in the Provider, or the Queries object itself.
 * @returns A reference to the Queries object (or `undefined` if not within a
 * Provider context, or if the requested Queries object does not exist).
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useQueriesOrQueriesById hook
 * to get a reference to the Queries object again, without the need to have it
 * passed as a prop. Note however, that unlike the useQueries hook example, this
 * component would also work if you were to pass the Queries object directly
 * into it, making it more portable.
 *
 * ```jsx
 * import {Provider, useQueriesOrQueriesById} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = ({queries}) => (
 *   <span>
 *     {JSON.stringify(useQueriesOrQueriesById(queries).getQueryIds())}
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["dogColors"]</span>'
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useQueriesOrQueriesById
/**
 * The useQueryIds hook gets an array of the Query Ids registered with a Queries
 * object, and registers a listener so that any changes to that result will
 * cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useQueryIds hook lets you indicate which Queries object to get data
 * for: omit the optional final parameter for the default context Queries
 * object, provide an Id for a named context Queries object, or provide a
 * Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * Query Ids in the Queries object will cause a re-render. When the component
 * containing this hook is unmounted, the listener will be automatically
 * removed.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference.
 * @returns The Query Ids in the Queries object, or an empty array.
 * @example
 * This example creates an Queries object outside the application, which is used
 * in the useQueryIds hook by reference. A newly-registered Relationship
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useQueryIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 *   cujo: {species: 'dog'},
 * });
 * const queries = createQueries(store);
 * const App = () => <span>{JSON.stringify(useQueryIds(queries))}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[]</span>'
 *
 * const addQueryDefinition = () =>
 *   queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *     select('color');
 *     where('species', 'dog');
 *   });
 * addQueryDefinition(); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["dogColors"]</span>'
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useQueryIds
/**
 * The useResultTable hook returns an object containing the entire data of the
 * ResultTable of the given query, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultTable hook lets you indicate which Queries object to get
 * data for: omit the final optional final parameter for the default context
 * Queries object, provide an Id for a named context Queries object, or provide
 * a Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * query result will cause a re-render. When the component containing this hook
 * is unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference.
 * @returns An object containing the entire data of the ResultTable.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useTable hook by reference. A change to the data in the query
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultTable} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('color');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>{JSON.stringify(useResultTable('dogColors', queries))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"brown"},"cujo":{"color":"black"}}</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"walnut"},"cujo":{"color":"black"}}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultTable hook.
 *
 * ```jsx
 * import {Provider, useResultTable} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultTable('dogColors'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"brown"},"cujo":{"color":"black"}}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useResultTable
 * hook.
 *
 * ```jsx
 * import {Provider, useResultTable} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultTable('dogColors', 'petQueries'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"fido":{"color":"brown"},"cujo":{"color":"black"}}</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultTable
/**
 * The useResultTableCellIds hook returns the Ids of every Cell used across the
 * whole ResultTable of the given query, and registers a listener so that any
 * changes to those Ids will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultTableCellIds hook lets you indicate which Queries object to
 * get data for: omit the final optional final parameter for the default context
 * Queries object, provide an Id for a named context Queries object, or provide
 * a Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * result Cell Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference. See the
 * addResultTableCellIdsListener method for more details.
 * @returns An array of the Ids of every Cell in the result of the query.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultTableCellIds hook by reference. A change to the data in the
 * query re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultTableCellIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColorsAndLegs',
 *   'pets',
 *   ({select, where}) => {
 *     select('color');
 *     select('legs');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>
 *     {JSON.stringify(useResultTableCellIds('dogColorsAndLegs', queries))}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color"]</span>'
 *
 * store.setCell('pets', 'cujo', 'legs', 4); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color","legs"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultTableCellIds hook.
 *
 * ```jsx
 * import {Provider, useResultTableCellIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultTableCellIds('dogColorsAndLegs'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black', legs: 4},
 *   }),
 * ).setQueryDefinition('dogColorsAndLegs', 'pets', ({select, where}) => {
 *   select('color');
 *   select('legs');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color","legs"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the
 * useResultTableCellIds hook.
 *
 * ```jsx
 * import {Provider, useResultTableCellIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(
 *       useResultTableCellIds('dogColorsAndLegs', 'petQueries'),
 *     )}
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black', legs: 4},
 *   }),
 * ).setQueryDefinition('dogColorsAndLegs', 'pets', ({select, where}) => {
 *   select('color');
 *   select('legs');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["color","legs"]</span>'
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useResultTableCellIds
/**
 * The useResultRowCount hook returns the count of the Row objects in the
 * ResultTable of the given query, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultRowCount hook lets you indicate which Queries object to get
 * data for: omit the final optional final parameter for the default context
 * Queries object, provide an Id for a named context Queries object, or provide
 * a Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * count of ResultRow objects will cause a re-render. When the component
 * containing this hook is unmounted, the listener will be automatically
 * removed.
 * @param queryId The Id of the query.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference. See the addResultRowCountListener
 * method for more details.
 * @returns The number of ResultRow objects in the ResultTable.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultRowCount hook by reference. A change to the data in the query
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultRowCount} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('color');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => <span>{useResultRowCount('dogColors', queries)}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>2</span>'
 *
 * store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>1</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultRowCount hook.
 *
 * ```jsx
 * import {Provider, useResultRowCount} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useResultRowCount('dogColors')}</span>;
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>2</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useResultRowCount
 * hook.
 *
 * ```jsx
 * import {Provider, useResultRowCount} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useResultRowCount('dogColors', 'petQueries')}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>2</span>'
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useResultRowCount
/**
 * The useResultRowIds hook returns the Ids of every Row in the ResultTable of
 * the given query, and registers a listener so that any changes to those Ids
 * will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultRowIds hook lets you indicate which Queries object to get
 * data for: omit the final optional final parameter for the default context
 * Queries object, provide an Id for a named context Queries object, or provide
 * a Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * result Row Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference. See the addResultRowIdsListener
 * method for more details.
 * @returns An array of the Ids of every Row in the result of the query.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultRowIds hook by reference. A change to the data in the query
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('color');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>{JSON.stringify(useResultRowIds('dogColors', queries))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 *
 * store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultRowIds hook.
 *
 * ```jsx
 * import {Provider, useResultRowIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultRowIds('dogColors'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useResultRowIds
 * hook.
 *
 * ```jsx
 * import {Provider, useResultRowIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultRowIds('dogColors', 'petQueries'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido","cujo"]</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultRowIds
/**
 * The useResultSortedRowIds hook returns the sorted (and optionally, paginated)
 * Ids of every Row in the ResultTable of the given query, and registers a
 * listener so that any changes to those Ids will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultSortedRowIds hook lets you indicate which Queries object to
 * get data for: omit the final optional final parameter for the default context
 * Queries object, provide an Id for a named context Queries object, or provide
 * a Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * sorted result Row Ids will cause a re-render. When the component containing
 * this hook is unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param cellId The Id of the result Cell whose values are used for the
 * sorting, or `undefined` to by sort the result Row Id itself.
 * @param descending Whether the sorting should be in descending order.
 * @param offset The number of Row Ids to skip for pagination purposes, if any.
 * @param limit The maximum number of Row Ids to return, or `undefined` for all.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference.
 * @returns An array of the Ids of every Row in the result of the query.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultSortedRowIds hook by reference. A change to the data in the
 * query re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultSortedRowIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('color');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>
 *     {JSON.stringify(
 *       useResultSortedRowIds(
 *         'dogColors',
 *         'color',
 *         false,
 *         0,
 *         undefined,
 *         queries,
 *       ),
 *     )}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["cujo","fido"]</span>'
 *
 * store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["fido"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultSortedRowIds hook.
 *
 * ```jsx
 * import {Provider, useResultSortedRowIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(useResultSortedRowIds('dogColors', 'color'))}
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["cujo","fido"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the
 * useResultSortedRowIds hook.
 *
 * ```jsx
 * import {Provider, useResultSortedRowIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(
 *       useResultSortedRowIds(
 *         'dogColors',
 *         'color',
 *         false,
 *         0,
 *         undefined,
 *         'petQueries',
 *       ),
 *     )}
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["cujo","fido"]</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultSortedRowIds
/**
 * The useResultRow hook returns an object containing the data of a single Row
 * in the ResultTable of the given query, and registers a listener so that any
 * changes to that Row will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultRow hook lets you indicate which Queries object to get data
 * for: omit the final optional final parameter for the default context Queries
 * object, provide an Id for a named context Queries object, or provide a
 * Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * result Row will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param rowId The Id of the Row in the ResultTable.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference.
 * @returns An object containing the entire data of the Row in the ResultTable
 * of the query.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultRow hook by reference. A change to the data in the query
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultRow} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('color');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>{JSON.stringify(useResultRow('dogColors', 'fido', queries))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"brown"}</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"walnut"}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultRow hook.
 *
 * ```jsx
 * import {Provider, useResultRow} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultRow('dogColors', 'fido'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"brown"}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useResultRow
 * hook.
 *
 * ```jsx
 * import {Provider, useResultRow} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(useResultRow('dogColors', 'fido', 'petQueries'))}
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>{"color":"brown"}</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultRow
/**
 * The useResultCellIds hook returns the Ids of every Cell in a given Row in the
 * ResultTable of the given query, and registers a listener so that any changes
 * to those Ids will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultCellIds hook lets you indicate which Queries object to get
 * data for: omit the final optional final parameter for the default context
 * Queries object, provide an Id for a named context Queries object, or provide
 * a Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * result Cell Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param rowId The Id of the Row in the ResultTable.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference.
 * @returns An array of the Ids of every Cell in the Row in the result of the
 * query.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultCellIds hook by reference. A change to the data in the query
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultCellIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('species');
 *     select('color');
 *     select('legs');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>
 *     {JSON.stringify(useResultCellIds('dogColors', 'fido', queries))}
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["species","color"]</span>'
 *
 * store.setCell('pets', 'fido', 'legs', 4); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["species","color","legs"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultCellIds hook.
 *
 * ```jsx
 * import {Provider, useResultCellIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useResultCellIds('dogColors', 'fido'))}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('species');
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["species","color"]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useResultCellIds
 * hook.
 *
 * ```jsx
 * import {Provider, useResultCellIds} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {JSON.stringify(useResultCellIds('dogColors', 'fido', 'petQueries'))}
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('species');
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["species","color"]</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultCellIds
/**
 * The useResultCell hook returns the value of a single Cell in a given Row in
 * the ResultTable of the given query, and registers a listener so that any
 * changes to that value will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Queries object or a set of Queries objects named by
 * Id. The useResultCell hook lets you indicate which Queries object to get data
 * for: omit the final optional final parameter for the default context Queries
 * object, provide an Id for a named context Queries object, or provide a
 * Queries object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * result Cell will cause a re-render. When the component containing this hook
 * is unmounted, the listener will be automatically removed.
 * @param queryId The Id of the query.
 * @param rowId The Id of the Row in the ResultTable.
 * @param cellId The Id of the Cell in the Row.
 * @param queriesOrQueriesId The Queries object to be accessed: omit for the
 * default context Queries object, provide an Id for a named context Queries
 * object, or provide an explicit reference.
 * @returns The value of the Cell, or `undefined`.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the useResultCell hook by reference. A change to the data in the query
 * re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useResultCell} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'dogColors',
 *   'pets',
 *   ({select, where}) => {
 *     select('species');
 *     select('color');
 *     select('legs');
 *     where('species', 'dog');
 *   },
 * );
 * const App = () => (
 *   <span>{useResultCell('dogColors', 'fido', 'color', queries)}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>walnut</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. A component within it then uses the useResultCell hook.
 *
 * ```jsx
 * import {Provider, useResultCell} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useResultCell('dogColors', 'fido', 'color')}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('species');
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Queries object is
 * provided, named by Id. A component within it then uses the useResultCell
 * hook.
 *
 * ```jsx
 * import {Provider, useResultCell} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queriesById={{petQueries: queries}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useResultCell('dogColors', 'fido', 'color', 'petQueries')}</span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('dogColors', 'pets', ({select, where}) => {
 *   select('species');
 *   select('color');
 *   where('species', 'dog');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultCell
/**
 * The useResultTableListener hook registers a listener function with a Queries
 * object that will be called whenever data in a ResultTable changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultTable hook).
 *
 * You can either listen to a single ResultTable (by specifying a query Id as
 * the method's first parameter) or changes to any ResultTable (by providing a
 * `null` wildcard).
 *
 * Unlike the addResultTableListener method, which returns a listener Id and
 * requires you to remove it manually, the useResultTableListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever data in the
 * matching ResultTable changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultTableListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultTableListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultTableListener('petColors', () =>
 *     console.log('Result table changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().table);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Result table changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().table);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultTableListener
/**
 * The useResultTableCellIdsListener hook registers a listener function with a
 * Queries object that will be called whenever the Cell Ids that appear anywhere
 * in a ResultTable change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultTableCellIds hook).
 *
 * You can either listen to a single ResultTable (by specifying a query Id as
 * the method's first parameter) or changes to any ResultTable (by providing a
 * `null` wildcard).
 *
 * Unlike the addResultTableCellIdsListener method, which returns a listener Id
 * and requires you to remove it manually, the useResultTableCellIdsListener
 * hook manages this lifecycle for you: when the listener changes (per its
 * `listenerDeps` dependencies) or the component unmounts, the listener on the
 * underlying Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Cell Ids that
 * appear anywhere in the ResultTable change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultTableCellIdsListener hook to create a listener
 * that is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultTableCellIdsListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultTableCellIdsListener('petColorsAndLegs', () =>
 *     console.log('Result Cell Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColorsAndLegs',
 *   'pets',
 *   ({select}) => {
 *     select('color');
 *     select('legs');
 *   },
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().tableCellIds);
 * // -> 1
 *
 * store.setCell('pets', 'cujo', 'legs', 4); // !act
 * // -> 'Result Cell Ids changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().tableCellIds);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useResultTableCellIdsListener
/**
 * The useResultRowCountListener hook registers a listener function with a
 * Queries object that will be called whenever the count of ResultRow objects in
 * a ResultTable changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultRowCount hook).
 *
 * You can either listen to a single ResultTable (by specifying a query Id as
 * the method's first parameter) or changes to any ResultTable (by providing a
 * `null` wildcard).
 *
 * Unlike the addResultRowCountListener method, which returns a listener Id and
 * requires you to remove it manually, the useResultRowCountListener hook
 * manages this lifecycle for you: when the listener changes (per its
 * `listenerDeps` dependencies) or the component unmounts, the listener on the
 * underlying Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Row Ids in the
 * matching ResultTable change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultRowCountListener hook to create a listener
 * that is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultRowCountListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultRowCountListener('petColors', () =>
 *     console.log('Result Row count changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().rowCount);
 * // -> 1
 *
 * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'}); // !act
 * // -> 'Result Row count changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().rowCount);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v4.1.0
 */
/// useResultRowCountListener
/**
 * The useResultRowIdsListener hook registers a listener function with a Queries
 * object that will be called whenever the Row Ids in a ResultTable change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultRowIds hook).
 *
 * You can either listen to a single ResultTable (by specifying a query Id as
 * the method's first parameter) or changes to any ResultTable (by providing a
 * `null` wildcard).
 *
 * Unlike the addResultRowIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useResultRowIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Row Ids in the
 * matching ResultTable change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultRowIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultRowIdsListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultRowIdsListener('petColors', () =>
 *     console.log('Result Row Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().rowIds);
 * // -> 1
 *
 * store.setRow('pets', 'rex', {species: 'dog', color: 'tan'}); // !act
 * // -> 'Result Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().rowIds);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultRowIdsListener
/**
 * The useResultSortedRowIdsListener hook registers a listener function with a
 * Queries object that will be called whenever the sorted (and optionally,
 * paginated) Row Ids in a ResultTable change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultSortedRowIds hook).
 *
 * Unlike the addResultSortedRowIdsListener method, which returns a listener Id
 * and requires you to remove it manually, the useResultSortedRowIdsListener
 * hook manages this lifecycle for you: when the listener changes (per its
 * `listenerDeps` dependencies) or the component unmounts, the listener on the
 * underlying Queries object will be deleted.
 * @param queryId The Id of the query to listen to.
 * @param cellId The Id of the Cell whose values are used for the sorting, or
 * `undefined` to by sort the Row Id itself.
 * @param descending Whether the sorting should be in descending order.
 * @param offset The number of Row Ids to skip for pagination purposes, if any.
 * @param limit The maximum number of Row Ids to return, or `undefined` for all.
 * @param listener The function that will be called whenever the Row Ids in the
 * matching ResultTable change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultSortedRowIdsListener hook to create a listener
 * that is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultSortedRowIdsListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultSortedRowIdsListener(
 *     'petColors',
 *     'color',
 *     false,
 *     0,
 *     undefined,
 *     () => console.log('Sorted result Row Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().sortedRowIds);
 * // -> 1
 *
 * store.setRow('pets', 'cujo', {color: 'tan'}); // !act
 * // -> 'Sorted result Row Ids changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().sortedRowIds);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultSortedRowIdsListener
/**
 * The useResultRowListener hook registers a listener function with a Queries
 * object that will be called whenever data in a result Row changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultRow hook).
 *
 * You can either listen to a single result Row (by specifying a query Id and
 * Row Id as the method's first two parameters) or changes to any result Row (by
 * providing `null` wildcards).
 *
 * Both, either, or neither of the `queryId` and `rowId` parameters can be
 * wildcarded with `null`. You can listen to a specific result Row in a specific
 * query, any result Row in a specific query, a specific result Row in any
 * query, or any result Row in any query.
 *
 * Unlike the addResultRowListener method, which returns a listener Id and
 * requires you to remove it manually, the useResultRowListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param rowId The Id of the result Row to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever data in the
 * matching result Row changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultRowListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultRowListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultRowListener('petColors', 'fido', () =>
 *     console.log('Result row changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().row);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Result row changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().row);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultRowListener
/**
 * The useResultCellIdsListener hook registers a listener function with a
 * Queries object that will be called whenever the Cell Ids in a result Row
 * change.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultCellIds hook).
 *
 * Both, either, or neither of the `queryId` and `rowId` parameters can be
 * wildcarded with `null`. You can listen to a specific result Row in a specific
 * query, any result Row in a specific query, a specific result Row in any
 * query, or any result Row in any query.
 *
 * Unlike the addResultCellIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useResultCellIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param rowId The Id of the result Row to listen to, or `null` as a wildcard.
 * @param listener The function that will be called whenever the Row Ids in the
 * matching ResultTable change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultCellIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultCellIdsListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultCellIdsListener('petColors', 'fido', () =>
 *     console.log('Result cell Ids changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => {
 *     select('color');
 *     select('legs');
 *   },
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().cellIds);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'legs', 4); // !act
 * // -> 'Result cell Ids changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().cellIds);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultCellIdsListener
/**
 * The useResultCellListener hook registers a listener function with a Queries
 * object that will be called whenever data in a Cell changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useResultCell hook).
 *
 * You can either listen to a single Cell (by specifying the Table Id, Row Id,
 * and Cell Id as the method's first three parameters) or changes to any Cell
 * (by providing `null` wildcards).
 *
 * All, some, or none of the `queryId`, `rowId`, and `cellId` parameters can be
 * wildcarded with `null`. You can listen to a specific Cell in a specific
 * result Row in a specific query, any Cell in any result Row in any query, for
 * example - or every other combination of wildcards.
 *
 * Unlike the addResultCellListener method, which returns a listener Id and
 * requires you to remove it manually, the useResultCellListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Queries object will be deleted.
 * @param queryId The Id of the query to listen to, or `null` as a wildcard.
 * @param rowId The Id of the result Row to listen to, or `null` as a wildcard.
 * @param cellId The Id of the result Cell to listen to, or `null` as a
 * wildcard.
 * @param listener The function that will be called whenever data in the
 * matching result Cell changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param queriesOrQueriesId The Queries object to register the listener with:
 * omit for the default context Queries object, provide an Id for a named
 * context Queries object, or provide an explicit reference.
 * @example
 * This example uses the useResultCellListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Queries object.
 *
 * ```jsx
 * import {Provider, useResultCellListener} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useResultCellListener('petColors', 'fido', 'color', () =>
 *     console.log('Result cell changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App queries={queries} />); // !act
 * console.log(queries.getListenerStats().cell);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * // -> 'Result cell changed'
 *
 * root.unmount(); // !act
 * console.log(queries.getListenerStats().cell);
 * // -> 0
 * ```
 * @category Queries hooks
 * @since v2.0.0
 */
/// useResultCellListener
/**
 * The useCreateCheckpoints hook is used to create a Checkpoints object within a
 * React application with convenient memoization.
 *
 * It is possible to create a Checkpoints object outside of the React app with
 * the regular createCheckpoints function and pass it in, but you may prefer to
 * create it within the app, perhaps inside the top-level component. To prevent
 * a new Checkpoints object being created every time the app renders or
 * re-renders, since v5.0 this hook performs the creation in an effect. As a
 * result it will return `undefined` on the brief first render (or if the
 * Store is not yet defined), which you should defend against.
 *
 * If your `create` function contains other dependencies, the changing of which
 * should also cause the Checkpoints object to be recreated, you can provide
 * them in an array in the optional second parameter, just as you would for any
 * React hook with dependencies.
 *
 * This hook ensures the Checkpoints object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the Store for which to create a new Checkpoints
 * object.
 * @param create A function for performing the creation steps of the Checkpoints
 * object for the Store, plus any additional steps such as adding definitions or
 * listeners, and returning it.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @returns A reference to the Checkpoints object.
 * @example
 * This example creates a Checkpoints object at the top level of a React
 * application. Even though the App component is rendered twice, the
 * Checkpoints object creation only occurs once by default.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import {useCreateCheckpoints, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateStore(createStore);
 *   const checkpoints = useCreateCheckpoints(store, (store) => {
 *     console.log('Checkpoints created');
 *     return createCheckpoints(store).setSize(10);
 *   });
 *   return <span>{JSON.stringify(checkpoints?.getCheckpointIds())}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Checkpoints created'
 *
 * root.render(<App />); // !act
 * // No second Checkpoints creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 * ```
 * @example
 * This example creates a Checkpoints object at the top level of a React
 * application. The App component is rendered twice, each with a different
 * top-level prop. The useCreateCheckpoints hook takes the size prop as a
 * dependency, and so the Checkpoints object is created again on the second
 * render.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import {useCreateCheckpoints, useCreateStore} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({size}) => {
 *   const store = useCreateStore(createStore);
 *   const checkpoints = useCreateCheckpoints(
 *     store,
 *     (store) => {
 *       console.log(`Checkpoints created, size ${size}`);
 *       return createCheckpoints(store).setSize(size);
 *     },
 *     [size],
 *   );
 *   return <span>{JSON.stringify(checkpoints?.getCheckpointIds())}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App size={20} />); // !act
 * // -> 'Checkpoints created, size 20'
 *
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 *
 * root.render(<App size={50} />); // !act
 * // -> 'Checkpoints created, size 50'
 *
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 * ```
 * @category Checkpoints hooks
 */
/// useCreateCheckpoints
/**
 * The useCheckpointsIds hook is used to retrieve the Ids of all the named
 * Checkpoints objects present in the current Provider component context.
 * @returns A list of the Ids in the context.
 * @example
 * This example adds two named Checkpoints objects to a Provider context and an
 * inner component accesses their Ids.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useCheckpointsIds,
 *   useCreateCheckpoints,
 *   useCreateStore,
 * } from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store1 = useCreateStore(createStore);
 *   const checkpoints1 = useCreateCheckpoints(store1, createCheckpoints);
 *   const store2 = useCreateStore(createStore);
 *   const checkpoints2 = useCreateCheckpoints(store2, createCheckpoints);
 *   return (
 *     <Provider checkpointsById={{checkpoints1, checkpoints2}}>
 *       <Pane />
 *     </Provider>
 *   );
 * };
 * const Pane = () => <span>{JSON.stringify(useCheckpointsIds())}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>["checkpoints1","checkpoints2"]</span>'
 * ```
 * @category Checkpoints hooks
 * @since v4.1.0
 */
/// useCheckpointsIds
/**
 * The useCheckpoints hook is used to get a reference to a Checkpoints object
 * from within a Provider component context.
 *
 * A Provider component is used to wrap part of an application in a context. It
 * can contain a default Checkpoints object (or a set of Checkpoints objects
 * named by Id) that can be easily accessed without having to be passed down as
 * props through every component.
 *
 * The useCheckpoints hook lets you either get a reference to the default
 * Checkpoints object (when called without a parameter), or one of the
 * Checkpoints objects that are named by Id (when called with an Id parameter).
 * @param id An optional Id for accessing a Checkpoints object that was named
 * with an Id in the Provider.
 * @returns A reference to the Checkpoints object (or `undefined` if not within
 * a Provider context, or if the requested Checkpoints object does not exist).
 * @example
 * This example creates a Provider context into which a default Checkpoint
 * object is provided. A component within it then uses the useCheckpoints hook
 * to get a reference to the Checkpoints object again, without the need to have
 * it passed as a prop.
 *
 * ```jsx
 * import {Provider, useCheckpoints} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{useCheckpoints().getListenerStats().checkpointIds}</span>
 * );
 *
 * const checkpoints = createCheckpoints(createStore());
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @example
 * This example creates a Provider context into which a Checkpoints object is
 * provided, named by Id. A component within it then uses the useCheckpoints
 * hook with that Id to get a reference to the Checkpoints object again, without
 * the need to have it passed as a prop.
 *
 * ```jsx
 * import {Provider, useCheckpoints} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpointsById={{petStore: checkpoints}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     {useCheckpoints('petStore').getListenerStats().checkpointIds}
 *   </span>
 * );
 *
 * const checkpoints = createCheckpoints(createStore());
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>0</span>'
 * ```
 * @category Checkpoints hooks
 */
/// useCheckpoints
/**
 * The useCheckpointsOrCheckpointsById hook is used to get a reference to a
 * Checkpoints object from within a Provider component context, _or_ have it
 * passed directly to this hook.
 *
 * This is mostly of use when you are developing a component that needs a
 * Checkpoints object and which might have been passed in explicitly to the
 * component or is to be picked up from the context by Id (a common pattern for
 * Checkpoints-based components).
 *
 * This is unlikely to be used often. For most situations, you will want to use
 * the useCheckpoints hook.
 * @param checkpointsOrCheckpointsId Either an Id for accessing a Checkpoints
 * object that was named with an Id in the Provider, or the Checkpoints object
 * itself.
 * @returns A reference to the Checkpoints object (or `undefined` if not within
 * a Provider context, or if the requested Checkpoints object does not exist).
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. A component within it then uses the
 * useCheckpointsOrCheckpointsById hook to get a reference to the Checkpoints
 * object again, without the need to have it passed as a prop. Note however,
 * that unlike the useCheckpoints hook example, this component would also work
 * if you were to pass the Checkpoints object directly into it, making it more
 * portable.
 *
 * ```jsx
 * import {
 *   Provider,
 *   useCheckpointsOrCheckpointsById,
 * } from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = ({checkpoints}) => (
 *   <span>
 *     {JSON.stringify(
 *       useCheckpointsOrCheckpointsById(checkpoints).getCheckpointIds(),
 *     )}
 *   </span>
 * );
 *
 * const checkpoints = createCheckpoints(createStore());
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 * ```
 * @category Checkpoints hooks
 * @since v4.1.0
 */
/// useCheckpointsOrCheckpointsById
/**
 * The useCheckpointIds hook returns an array of the checkpoint Ids being
 * managed by this Checkpoints object, and registers a listener so that any
 * changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Checkpoints object or a set of Checkpoints objects
 * named by Id. The useCheckpointIds hook lets you indicate which Checkpoints
 * object to get data for: omit the optional parameter for the default context
 * Checkpoints object, provide an Id for a named context Checkpoints object, or
 * provide a Checkpoints object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * checkpoint Ids will cause a re-render. When the component containing this
 * hook is unmounted, the listener will be automatically removed.
 * @param checkpointsOrCheckpointsId The Checkpoints object to be accessed: omit
 * for the default context Checkpoints object, provide an Id for a named context
 * Checkpoints object, or provide an explicit reference.
 * @returns A CheckpointIds array, containing the checkpoint Ids managed by this
 * Checkpoints object.
 * @example
 * This example creates a Checkpoints object outside the application, which is
 * used in the useCheckpointIds hook by reference. A change to the checkpoint
 * Ids re-renders the component.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useCheckpointIds} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {fido: {species: 'dog'}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <span>{JSON.stringify(useCheckpointIds(checkpoints))}</span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[["0"],null,[]]</span>'
 *
 * checkpoints.addCheckpoint('sale'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[["0"],"1",[]]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. A component within it then uses the useCheckpointIds
 * hook.
 *
 * ```jsx
 * import {Provider, useCheckpointIds} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{JSON.stringify(useCheckpointIds())}</span>;
 *
 * const checkpoints = createCheckpoints(
 *   createStore().setTable('pets', {fido: {species: 'dog'}}),
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. A component within it then uses the useCheckpointIds
 * hook.
 *
 * ```jsx
 * import {Provider, useCheckpointIds} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpointsById={{petCheckpoints: checkpoints}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>{JSON.stringify(useCheckpointIds('petCheckpoints'))}</span>
 * );
 *
 * const checkpoints = createCheckpoints(
 *   createStore().setTable('pets', {fido: {species: 'dog'}}),
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>[[],"0",[]]</span>'
 * ```
 * @category Checkpoints hooks
 */
/// useCheckpointIds
/**
 * The useCheckpoint hook returns the label for a checkpoint, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * A Provider component is used to wrap part of an application in a context, and
 * it can contain a default Checkpoints object or a set of Checkpoints objects
 * named by Id. The useCheckpoint hook lets you indicate which Checkpoints
 * object to get data for: omit the optional final parameter for the default
 * context Checkpoints object, provide an Id for a named context Checkpoints
 * object, or provide a Checkpoints object explicitly by reference.
 *
 * When first rendered, this hook will create a listener so that changes to the
 * label will cause a re-render. When the component containing this hook is
 * unmounted, the listener will be automatically removed.
 * @param checkpointId The Id of the checkpoint.
 * @param checkpointsOrCheckpointsId The Checkpoints object to be accessed: omit
 * for the default context Checkpoints object, provide an Id for a named context
 * Checkpoints object, or provide an explicit reference.
 * @returns A string label for the requested checkpoint, an empty string if it
 * was never set, or `undefined` if the checkpoint does not exist.
 * @example
 * This example creates a Checkpoints object outside the application, which is
 * used in the useCheckpoint hook by reference. A change to the checkpoint label
 * re-renders the component.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useCheckpoint} from 'tinybase/ui-react';
 *
 * const store = createStore().setTable('pets', {fido: {species: 'dog'}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => <span>{useCheckpoint('1', checkpoints)}</span>;
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span></span>'
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>sale</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. A component within it then uses the useCheckpoint
 * hook.
 *
 * ```jsx
 * import {Provider, useCheckpoint} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useCheckpoint('0')}</span>;
 *
 * const checkpoints = createCheckpoints(
 *   createStore().setTable('pets', {fido: {species: 'dog'}}),
 * ).setCheckpoint('0', 'initial');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>initial</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. A component within it then uses the useCheckpoint
 * hook.
 *
 * ```jsx
 * import {Provider, useCheckpoint} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpointsById={{petCheckpoints: checkpoints}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => <span>{useCheckpoint('0', 'petCheckpoints')}</span>;
 *
 * const checkpoints = createCheckpoints(
 *   createStore().setTable('pets', {fido: {species: 'dog'}}),
 * ).setCheckpoint('0', 'initial');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>initial</span>'
 * ```
 * @category Checkpoints hooks
 */
/// useCheckpoint
/**
 * The useSetCheckpointCallback hook returns a parameterized callback that can
 * be used to record a checkpoint of a Store into a Checkpoints object that can
 * be reverted to in the future.
 *
 * This hook is useful, for example, when creating an event handler that will
 * set the checkpoint. In this case, the parameter will likely be the event, so
 * that you can use data from it as the checkpoint label.
 *
 * The optional first parameter is a function which will produce the label that
 * will then be used to name the checkpoint.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional second parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the checkpoint has been
 * set.
 *
 * The Checkpoints object for which the callback will set the checkpoint
 * (indicated by the hook's `checkpointsOrCheckpointsId` parameter) is always
 * automatically used as a hook dependency for the callback.
 * @param getCheckpoint An optional function which returns a string that will be
 * used to describe the actions leading up to this checkpoint, based on the
 * parameter the callback will receive (and which is most likely a DOM event).
 * @param getCheckpointDeps An optional array of dependencies for the
 * `getCheckpoint` function, which, if any change, result in the regeneration of
 * the callback. This parameter defaults to an empty array.
 * @param checkpointsOrCheckpointsId The Checkpoints object to be updated: omit
 * for the default context Checkpoints object, provide an Id for a named context
 * Checkpoints object, or provide an explicit reference.
 * @param then A function which is called after the checkpoint is set, with the
 * new checkpoint Id, a reference to the Checkpoints object and the label
 * provided, if any.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback. This
 * parameter defaults to an empty array.
 * @returns A parameterized callback for subsequent use.
 * @example
 * This example uses the useSetCheckpointCallback hook to create an event
 * handler which sets a checkpoint when the `span` element is clicked.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useSetCheckpointCallback} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => {
 *   const handleClick = useSetCheckpointCallback(
 *     (e) => `with #${e.target.id} button`,
 *     [],
 *     checkpoints,
 *     (checkpointId, checkpoints, label) =>
 *       console.log(`Checkpoint ${checkpointId} set, ${label}`),
 *   );
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       Set
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const _span = app.querySelector('span');
 *
 * store.setCell('pets', 'nemo', 'color', 'orange');
 *
 * // User clicks the <span> element:
 * // -> _span MouseEvent('click', {bubbles: true})
 * // -> 'Checkpoint 1 set, with #span button'
 * ```
 * @category Checkpoints hooks
 */
/// useSetCheckpointCallback
/**
 * The useGoBackwardCallback hook returns a callback that moves the state of the
 * underlying Store back to the previous checkpoint, effectively performing an
 * 'undo' on the Store data.
 *
 * This hook is useful, for example, when creating an event handler that will go
 * backward to the previous checkpoint - such as when clicking an undo button.
 *
 * If there is no previous checkpoint to return to, this callback has no effect.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use to go
 * backward: omit for the default context Checkpoints object, provide an Id for
 * a named context Checkpoints object, or provide an explicit reference.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useGoBackwardCallback hook to create an event handler
 * which goes backward in the checkpoint stack when the `span` element is
 * clicked.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useGoBackwardCallback} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <span id="span" onClick={useGoBackwardCallback(checkpoints)}>
 *     Backward
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const _span = app.querySelector('span');
 *
 * store.setCell('pets', 'nemo', 'color', 'orange');
 * checkpoints.addCheckpoint();
 * console.log(checkpoints.getCheckpointIds());
 * // -> [["0"], "1", []]
 *
 * // User clicks the <span> element:
 * // -> _span MouseEvent('click', {bubbles: true})
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], "0", ["1"]]
 * ```
 * @category Checkpoints hooks
 */
/// useGoBackwardCallback
/**
 * The useGoForwardCallback hook returns a callback that moves the state of the
 * underlying Store forwards to a future checkpoint, effectively performing an
 * 'redo' on the Store data.
 *
 * This hook is useful, for example, when creating an event handler that will go
 * forward to the next checkpoint - such as when clicking an redo button.
 *
 * If there is no future checkpoint to return to, this callback has no effect.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use to go
 * backward: omit for the default context Checkpoints object, provide an Id for
 * a named context Checkpoints object, or provide an explicit reference.
 * @returns A callback for subsequent use.
 * @example
 * This example uses the useGoForwardCallback hook to create an event handler
 * which goes backward in the checkpoint stack when the `span` element is
 * clicked.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useGoForwardCallback} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <span id="span" onClick={useGoForwardCallback(checkpoints)}>
 *     Forward
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const _span = app.querySelector('span');
 *
 * store.setCell('pets', 'nemo', 'color', 'orange');
 * checkpoints.addCheckpoint();
 * console.log(checkpoints.getCheckpointIds());
 * // -> [["0"], "1", []]
 *
 * checkpoints.goBackward();
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], "0", ["1"]]
 *
 * // User clicks the <span> element:
 * // -> _span MouseEvent('click', {bubbles: true})
 * console.log(checkpoints.getCheckpointIds());
 * // -> [["0"], "1", []]
 * ```
 * @category Checkpoints hooks
 */
/// useGoForwardCallback
/**
 * The useGoToCallback hook returns a parameterized callback that can be used to
 * move the state of the underlying Store backwards or forwards to a specified
 * checkpoint.
 *
 * This hook is useful, for example, when creating an event handler that will
 * move the checkpoint. In this case, the parameter will likely be the event, so
 * that you can use data from it as the checkpoint Id to move to.
 *
 * The optional first parameter is a function which will produce the label that
 * will then be used to name the checkpoint.
 *
 * If that function has any other dependencies, the changing of which should
 * also cause the callback to be recreated, you can provide them in an array in
 * the optional second parameter, just as you would for any React hook with
 * dependencies.
 *
 * For convenience, you can optionally provide a `then` function (with its own
 * set of dependencies) which will be called just after the checkpoint has been
 * set.
 *
 * The Checkpoints object for which the callback will set the checkpoint
 * (indicated by the hook's `checkpointsOrCheckpointsId` parameter) is always
 * automatically used as a hook dependency for the callback.
 * @param getCheckpointId A function which returns an Id that will be used to
 * indicate which checkpoint to move to, based on the parameter the callback
 * will receive (and which is most likely a DOM event).
 * @param getCheckpointIdDeps An optional array of dependencies for the
 * `getCheckpointId` function, which, if any change, result in the regeneration
 * of the callback. This parameter defaults to an empty array.
 * @param checkpointsOrCheckpointsId The Checkpoints object to be updated: omit
 * for the default context Checkpoints object, provide an Id for a named context
 * Checkpoints object, or provide an explicit reference.
 * @param then A function which is called after the checkpoint is moved, with a
 * reference to the Checkpoints object and the checkpoint Id moved to.
 * @param thenDeps An optional array of dependencies for the `then` function,
 * which, if any change, result in the regeneration of the callback.
 * @returns A parameterized callback for subsequent use. This parameter defaults
 * to an empty array.
 * @example
 * This example uses the useGoToCallback hook to create an event handler which
 * moves to a checkpoint when the `span` element is clicked.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useGoToCallback} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => {
 *   const handleClick = useGoToCallback(() => '0', [], checkpoints);
 *   return (
 *     <span id="span" onClick={handleClick}>
 *       Goto 0
 *     </span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * const _span = app.querySelector('span');
 *
 * store.setCell('pets', 'nemo', 'color', 'orange');
 * checkpoints.addCheckpoint();
 * console.log(checkpoints.getCheckpointIds());
 * // -> [["0"], "1", []]
 *
 * // User clicks the <span> element:
 * // -> _span MouseEvent('click', {bubbles: true})
 * console.log(checkpoints.getCheckpointIds());
 * // -> [[], "0", ["1"]]
 * ```
 * @category Checkpoints hooks
 */
/// useGoToCallback
/**
 * The useUndoInformation hook returns an UndoOrRedoInformation array that
 * indicates if and how you can move the state of the underlying Store backward
 * to the previous checkpoint.
 *
 * This hook is useful if you are building an undo button: the information
 * contains whether an undo action is available (to enable the button), the
 * callback to perform the undo action, the current checkpoint Id that will be
 * undone, and its label, if available.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use to go
 * backward: omit for the default context Checkpoints object, provide an Id for
 * a named context Checkpoints object, or provide an explicit reference.
 * @returns UndoOrRedoInformation about if and how you can move the state of the
 * underlying Store backward.
 * @example
 * This example uses the useUndoInformation hook to create an undo button.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useUndoInformation} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => {
 *   const [canUndo, handleUndo, _id, label] =
 *     useUndoInformation(checkpoints);
 *   return canUndo ? (
 *     <span onClick={handleUndo}>Undo {label}</span>
 *   ) : (
 *     <span>Nothing to undo</span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Nothing to undo</span>'
 *
 * store.setCell('pets', 'nemo', 'color', 'orange'); // !act
 * checkpoints.addCheckpoint('color'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Undo color</span>'
 * ```
 * @category Checkpoints hooks
 */
/// useUndoInformation
/**
 * The useRedoInformation hook returns an UndoOrRedoInformation array that
 * indicates if and how you can move the state of the underlying Store forwards
 * to a future checkpoint.
 *
 * This hook is useful if you are building an redo button: the information
 * contains whether a redo action is available (to enable the button), the
 * callback to perform the redo action, the checkpoint Id that will be redone,
 * and its label, if available.
 * @param checkpointsOrCheckpointsId The Checkpoints object to use to go
 * backward: omit for the default context Checkpoints object, provide an Id for
 * a named context Checkpoints object, or provide an explicit reference.
 * @returns UndoOrRedoInformation about if and how you can move the state of the
 * underlying Store forward.
 * @example
 * This example uses the useUndoInformation hook to create a redo button.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {useRedoInformation} from 'tinybase/ui-react';
 *
 * const store = createStore().setTables({pets: {nemo: {species: 'fish'}}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => {
 *   const [canRedo, handleRedo, _id, label] =
 *     useRedoInformation(checkpoints);
 *   return canRedo ? (
 *     <span onClick={handleRedo}>Redo {label}</span>
 *   ) : (
 *     <span>Nothing to redo</span>
 *   );
 * };
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Nothing to redo</span>'
 *
 * store.setCell('pets', 'nemo', 'color', 'orange'); // !act
 * checkpoints.addCheckpoint('color'); // !act
 * checkpoints.goTo('0'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>Redo color</span>'
 * ```
 * @category Checkpoints hooks
 */
/// useRedoInformation
/**
 * The useCheckpointIdsListener hook registers a listener function with the
 * Checkpoints object that will be called whenever its set of checkpoints
 * changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useCheckpointIds hook).
 *
 * Unlike the addCheckpointIdsListener method, which returns a listener Id and
 * requires you to remove it manually, the useCheckpointIdsListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Checkpoints object will be deleted.
 * @param listener The function that will be called whenever the checkpoints
 * change.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param checkpointsOrCheckpointsId The Checkpoints object to register the
 * listener with: omit for the default context Checkpoints object, provide an Id
 * for a named context Checkpoints object, or provide an explicit reference.
 * @example
 * This example uses the useCheckpointIdsListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Store.
 *
 * ```jsx
 * import {Provider, useCheckpointIdsListener} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useCheckpointIdsListener(() => console.log('Checkpoint Ids changed'));
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {sold: false}}});
 * const checkpoints = createCheckpoints(store);
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(checkpoints.getListenerStats().checkpointIds);
 * // -> 1
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * // -> 'Checkpoint Ids changed'
 * checkpoints.addCheckpoint(); // !act
 * // -> 'Checkpoint Ids changed'
 *
 * root.unmount(); // !act
 * console.log(checkpoints.getListenerStats().checkpointIds);
 * // -> 0
 * ```
 * @category Checkpoints hooks
 */
/// useCheckpointIdsListener
/**
 * The useCheckpointListener hook registers a listener function with the
 * Checkpoints object that will be called whenever the label of a checkpoint
 * changes.
 *
 * This hook is useful for situations where a component needs to register its
 * own specific listener to do more than simply tracking the value (which is
 * more easily done with the useCheckpoint hook).
 *
 * You can either listen to a single checkpoint label (by specifying the
 * checkpoint Id as the method's first parameter), or changes to any checkpoint
 * label (by providing a `null` wildcard).
 *
 * Unlike the addCheckpointListener method, which returns a listener Id and
 * requires you to remove it manually, the useCheckpointListener hook manages
 * this lifecycle for you: when the listener changes (per its `listenerDeps`
 * dependencies) or the component unmounts, the listener on the underlying
 * Checkpoints object will be deleted.
 * @param checkpointId The Id of the checkpoint to listen to, or `null` as a
 * wildcard.
 * @param listener The function that will be called whenever the checkpoint
 * label changes.
 * @param listenerDeps An optional array of dependencies for the `listener`
 * function, which, if any change, result in the re-registration of the
 * listener. This parameter defaults to an empty array.
 * @param checkpointsOrCheckpointsId The Checkpoints object to register the
 * listener with: omit for the default context Checkpoints object, provide an Id
 * for a named context Checkpoints object, or provide an explicit reference.
 * @example
 * This example uses the useCheckpointListener hook to create a listener that
 * is scoped to a single component. When the component is unmounted, the
 * listener is removed from the Store.
 *
 * ```jsx
 * import {Provider, useCheckpointListener} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => {
 *   useCheckpointListener('0', () =>
 *     console.log('Checkpoint label changed'),
 *   );
 *   return <span>App</span>;
 * };
 *
 * const store = createStore().setTables({pets: {fido: {sold: false}}});
 * const checkpoints = createCheckpoints(store);
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(checkpoints.getListenerStats().checkpoint);
 * // -> 1
 *
 * checkpoints.setCheckpoint('0', 'initial'); // !act
 * // -> 'Checkpoint label changed'
 *
 * root.unmount(); // !act
 * console.log(checkpoints.getListenerStats().checkpoint);
 * // -> 0
 * ```
 * @category Checkpoints hooks
 */
/// useCheckpointListener
/**
 * The useCreatePersister hook is used to create a Persister within a React
 * application along with convenient memoization and callbacks.
 *
 * It is possible to create a Persister outside of the React app with the
 * regular createPersister function and pass it in, but you may prefer to create
 * it within the app, perhaps inside the top-level component. To prevent a new
 * Persister being created every time the app renders or re-renders, since v5.0
 * the this hook performs the creation in an effect.
 *
 * If your `create` function (the second parameter to the hook) contains
 * dependencies, the changing of which should cause the Persister to be
 * recreated, you can provide them in an array in the third parameter, just as
 * you would for any React hook with dependencies. The Store passed in as the
 * first parameter of this hook is used as a dependency by default.
 *
 * A second callback, called `then`, can be provided as the fourth parameter.
 * This is called after the creation, and, importantly, can be asynchronous, so
 * that you can configure the Persister with the startAutoLoad method and
 * startAutoSave method, for example. If this callback contains dependencies,
 * the changing of which should cause the Persister to be reconfigured, you can
 * provide them in an array in the fifth parameter. The Persister itself is used
 * as a dependency by default.
 *
 * Since v4.3.0, the `create` function can return undefined, meaning that you
 * can enable or disable persistence conditionally within this hook. This is
 * useful for applications which might turn on or off their cloud persistence or
 * collaboration features. This hook can return `undefined` if the Store is not
 * yet defined, which you should defend against.
 *
 * Since v4.3.19, a `destroy` function can be provided which will be called
 * after an old Persister is destroyed due to a change in the `createDeps`
 * dependencies that causes a new one to be created. Use this to clean up any
 * underlying storage objects that you set up during the `then` function, for
 * example. If this callback itself contains additional dependencies, you can
 * provide them in an array in the seventh parameter.
 *
 * This hook ensures the Persister object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the Store for which to create a new Persister
 * object.
 * @param create A function for performing the creation steps of the Persister
 * object for the Store.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @param then An optional callback for performing asynchronous post-creation
 * steps on the Persister, such as starting automatic loading and saving.
 * @param thenDeps An optional array of dependencies for the `then` callback,
 * which, if any change, result in its rerun. This parameter defaults to an
 * empty array.
 * @param destroy An optional callback whenever the Persister is destroyed due
 * to a change in the `createDeps` dependencies.
 * @param destroyDeps An optional array of dependencies for the `destroy`
 * callback, which, if any change, result in `destroy` and `then` being rerun.
 * This parameter defaults to an empty array.
 * @returns A reference to the Persister.
 * @example
 * This example creates a Persister at the top level of a React application.
 * Even though the App component is rendered twice, the Persister creation only
 * occurs once by default.
 *
 * ```jsx
 * import {
 *   useCreatePersister,
 *   useCreateStore,
 *   useTables,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createSessionPersister} from 'tinybase/persisters/persister-browser';
 * import {createStore} from 'tinybase';
 *
 * const App = () => {
 *   const store = useCreateStore(createStore);
 *   useCreatePersister(
 *     store,
 *     (store) => {
 *       console.log('Persister created');
 *       return createSessionPersister(store, 'pets');
 *     },
 *     [],
 *     async (persister) => {
 *       await persister.startAutoLoad();
 *       await persister.startAutoSave();
 *     },
 *   );
 *   return <span>{JSON.stringify(useTables(store))}</span>;
 * };
 *
 * sessionStorage.setItem(
 *   'pets',
 *   '[{"pets":{"fido":{"species":"dog"}}}, {}]',
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Persister created'
 *
 * // ... // !act
 * root.render(<App />); // !act
 * // No second Persister creation
 *
 * console.log(app.innerHTML);
 * // -> '<span>{\"pets\":{\"fido\":{\"species\":\"dog\"}}}</span>'
 *
 * root.unmount(); // !act
 * ```
 * @example
 * This example creates a Persister at the top level of a React application. The
 * App component is rendered twice, each with a different top-level prop. The
 * useCreatePersister hook takes the `sessionKey` prop as a dependency, and so
 * the Persister object is created again on the second render. The first is
 * destroyed and the `destroy` parameter is called for it.
 *
 * ```jsx
 * import {
 *   useCreatePersister,
 *   useCreateStore,
 *   useTables,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createSessionPersister} from 'tinybase/persisters/persister-browser';
 * import {createStore} from 'tinybase';
 *
 * const App = ({sessionKey}) => {
 *   const store = useCreateStore(createStore);
 *   useCreatePersister(
 *     store,
 *     (store) => {
 *       console.log(`Persister created for session key ${sessionKey}`);
 *       return createSessionPersister(store, sessionKey);
 *     },
 *     [sessionKey],
 *     async (persister) => {
 *       await persister.startAutoLoad();
 *     },
 *     [],
 *     (persister) =>
 *       console.log(
 *         `Persister destroyed for session key ${persister.getStorageName()}`,
 *       ),
 *   );
 *   return <span>{JSON.stringify(useTables(store))}</span>;
 * };
 *
 * sessionStorage.setItem(
 *   'fidoStore',
 *   '[{"pets":{"fido":{"species":"dog"}}}, {}]',
 * );
 * sessionStorage.setItem(
 *   'cujoStore',
 *   '[{"pets":{"cujo":{"species":"dog"}}}, {}]',
 * );
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App sessionKey="fidoStore" />); // !act
 * // -> 'Persister created for session key fidoStore'
 *
 * // ... // !act
 * console.log(app.innerHTML);
 * // -> '<span>{\"pets\":{\"fido\":{\"species\":\"dog\"}}}</span>'
 *
 * root.render(<App sessionKey="cujoStore" />); // !act
 * // -> 'Persister created for session key cujoStore'
 * // -> 'Persister destroyed for session key fidoStore'
 *
 * // ... // !act
 * console.log(app.innerHTML);
 * // -> '<span>{\"pets\":{\"cujo\":{\"species\":\"dog\"}}}</span>'
 *
 * root.unmount(); // !act
 * // -> 'Persister destroyed for session key cujoStore'
 * ```
 *  @category Persister hooks
 */
/// useCreatePersister
/**
 * The useCreateSynchronizer hook is used to create a Synchronizer within a
 * React application along with convenient memoization and callbacks.
 *
 * It is possible to create a Synchronizer outside of the React app with the
 * regular createSynchronizer function and pass it in, but you may prefer to
 * create it within the app, perhaps inside the top-level component. To prevent
 * a new Synchronizer being created every time the app renders or re-renders,
 * the useCreateSynchronizer hook performs the creation in an effect.
 *
 * If your asynchronous `create` function (the second parameter to the hook)
 * contains dependencies, the changing of which should cause the Synchronizer to
 * be recreated, you can provide them in an array in the third parameter, just
 * as you would for any React hook with dependencies. The MergeableStore passed
 * in as the first parameter of this hook is used as a dependency by default.
 *
 * The `create` function can return undefined, meaning that you can enable or
 * disable synchronization conditionally within this hook. This is useful for
 * applications which might turn on or off their cloud synchronization or
 * collaboration features.
 *
 * This hook ensures the Synchronizer object is destroyed whenever a new one is
 * created or the component is unmounted.
 * @param store A reference to the MergeableStore for which to create a new
 * Synchronizer object.
 * @param create An asynchronous function for performing the creation steps of
 * the Synchronizer object for the Store.
 * @param createDeps An optional array of dependencies for the `create`
 * function, which, if any change, result in its rerun. This parameter defaults
 * to an empty array.
 * @param destroy An optional callback whenever the Synchronizer is destroyed
 * due to a change in the `createDeps` dependencies.
 * @param destroyDeps An optional array of dependencies for the `destroy`
 * callback, which, if any change, result in `destroy` and `then` being rerun.
 * This parameter defaults to an empty array.
 * @returns A reference to the Synchronizer.
 * @example
 * This example creates a Synchronizer at the top level of a React application.
 * Even though the App component is rendered twice, the Synchronizer creation
 * only occurs once by default.
 *
 * ```jsx
 * import {
 *   useCreateMergeableStore,
 *   useCreateSynchronizer,
 *   useTables,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
 * import {createMergeableStore} from 'tinybase';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = () => {
 *   const store = useCreateMergeableStore(() => createMergeableStore('s1'));
 *   useCreateSynchronizer(store, async (store) => {
 *     console.log('Synchronizer created');
 *     return await createLocalSynchronizer(store, 'pets');
 *   });
 *   return <span>{JSON.stringify(useTables(store))}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App />); // !act
 * // -> 'Synchronizer created'
 *
 * // ... // !act
 * root.render(<App />); // !act
 * // No second Synchronizer creation
 *
 * root.unmount(); // !act
 * ```
 * @example
 * This example creates a Synchronizer at the top level of a React application.
 * The App component is rendered twice, each with a different top-level prop.
 * The useCreateSynchronizer hook takes the `url` prop as a dependency, and so
 * the Synchronizer object is created again on the second render. The first is
 * destroyed and the `destroy` parameter is called for it.  A `then` parameter
 * is provided to start both Synchronizers' synchronization.
 *
 * ```jsx
 * import {
 *   useCreateMergeableStore,
 *   useCreateSynchronizer,
 *   useTables,
 * } from 'tinybase/ui-react';
 * import React from 'react';
 * import {WebSocketServer} from 'ws';
 * import {createMergeableStore} from 'tinybase';
 * import {createRoot} from 'react-dom/client';
 * import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
 * import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
 *
 * const server1 = createWsServer(new WebSocketServer({port: 8044}));
 * const server2 = createWsServer(new WebSocketServer({port: 8045}));
 *
 * const App = ({url}) => {
 *   const store = useCreateMergeableStore(() => createMergeableStore('s1'));
 *   useCreateSynchronizer(
 *     store,
 *     async (store) => {
 *       const webSocket = new WebSocket(url);
 *       console.log(`Synchronizer created for ${webSocket.url}`);
 *       return await createWsSynchronizer(store, webSocket);
 *     },
 *     [url],
 *     (synchronizer) => {
 *       const webSocket = synchronizer.getWebSocket();
 *       console.log(`Synchronizer destroyed for ${webSocket.url}`);
 *     },
 *   );
 *   return <span>{JSON.stringify(useTables(store))}</span>;
 * };
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App url="ws://localhost:8044/" />); // !act
 * // ... // !act
 * // -> 'Synchronizer created for ws://localhost:8044/'
 *
 * root.render(<App url="ws://localhost:8045/" />); // !act
 * // ... // !act
 * // -> 'Synchronizer created for ws://localhost:8045/'
 * // -> 'Synchronizer destroyed for ws://localhost:8044/'
 *
 * root.unmount(); // !act
 * // -> 'Synchronizer destroyed for ws://localhost:8045/'
 *
 * server1.destroy();
 * server2.destroy();
 * ```
 * @category Synchronizer hooks
 * @since v5.0.0
 */
/// useCreateSynchronizer
/**
 * The ExtraProps type represents a set of arbitrary additional props.
 * @category Props
 */
/// ExtraProps
/**
 * TablesProps props are used for components that refer to all the Tables in a
 * Store, such as the TablesView component.
 * @category Props
 */
/// TablesProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// TablesProps.store
  /**
   * A component for rendering each Table in the Store (to override the default
   * TableView component).
   * @category Prop
   */
  /// TablesProps.tableComponent
  /**
   * A custom function for generating extra props for each Table component based
   * on its Id.
   * @category Prop
   */
  /// TablesProps.getTableComponentProps
  /**
   * A component or string to separate each Table component.
   * @category Prop
   */
  /// TablesProps.separator
  /**
   * Whether the component should also render the Ids of each Table, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// TablesProps.debugIds
}
/**
 * TableProps props are used for components that refer to a single Table in a
 * Store, such as the TableView component.
 * @category Props
 */
/// TableProps
{
  /**
   * The Id of the Table in the Store to be rendered.
   * @category Prop
   */
  /// TableProps.tableId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// TableProps.store
  /**
   * A custom component for rendering each Row in the Table (to override the
   * default RowView component).
   * @category Prop
   */
  /// TableProps.rowComponent
  /**
   * A function for generating extra props for each custom Row component based
   * on its Id.
   * @category Prop
   */
  /// TableProps.getRowComponentProps
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Table's Cells in a given order.
   * @category Prop
   */
  /// TableProps.customCellIds
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// TableProps.separator
  /**
   * Whether the component should also render the Id of the Table, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// TableProps.debugIds
}
/**
 * SortedTableProps props are used for components that refer to a single sorted
 * Table in a Store, such as the SortedTableView component.
 * @category Props
 * @since v2.0.0
 */
/// SortedTableProps
{
  /**
   * The Id of the Table in the Store to be rendered.
   * @category Prop
   */
  /// SortedTableProps.tableId
  /**
   * The Id of the Cell whose values are used for the sorting. If omitted, the
   * view will sort the Row Id itself.
   * @category Prop
   */
  /// SortedTableProps.cellId
  /**
   * Whether the sorting should be in descending order.
   * @category Prop
   */
  /// SortedTableProps.descending
  /**
   * The number of Row Ids to skip for pagination purposes.
   * @category Prop
   */
  /// SortedTableProps.offset
  /**
   * The maximum number of Row Ids to return.
   * @category Prop
   */
  /// SortedTableProps.limit
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// SortedTableProps.store
  /**
   * A custom component for rendering each Row in the Table (to override the
   * default RowView component).
   * @category Prop
   */
  /// SortedTableProps.rowComponent
  /**
   * A function for generating extra props for each custom Row component based
   * on its Id.
   * @category Prop
   */
  /// SortedTableProps.getRowComponentProps
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * sorted Table's Cells in a given order.
   * @category Prop
   */
  /// SortedTableProps.customCellIds
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// SortedTableProps.separator
  /**
   * Whether the component should also render the Id of the Table, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// SortedTableProps.debugIds
}
/**
 * RowProps props are used for components that refer to a single Row in a Table,
 * such as the RowView component.
 * @category Props
 */
/// RowProps
{
  /**
   * The Id of the Table in the Store.
   * @category Prop
   */
  /// RowProps.tableId
  /**
   * The Id of the Row in the Table to be rendered.
   * @category Prop
   */
  /// RowProps.rowId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// RowProps.store
  /**
   * A custom component for rendering each Cell in the Row (to override the
   * default CellView component).
   * @category Prop
   */
  /// RowProps.cellComponent
  /**
   * A function for generating extra props for each custom Cell component based
   * on its Id.
   * @category Prop
   */
  /// RowProps.getCellComponentProps
  /**
   * An optional list of Cell Ids to use for rendering a prescribed set of the
   * Row's Cells in a given order.
   * @category Prop
   */
  /// RowProps.customCellIds
  /**
   * A component or string to separate each Cell component.
   * @category Prop
   */
  /// RowProps.separator
  /**
   * Whether the component should also render the Id of the Row, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// RowProps.debugIds
}
/**
 * CellProps props are used for components that refer to a single Cell in a Row,
 * such as the CellView component.
 * @category Props
 */
/// CellProps
{
  /**
   * The Id of the Table in the Store.
   * @category Prop
   */
  /// CellProps.tableId
  /**
   * The Id of the Row in the Table.
   * @category Prop
   */
  /// CellProps.rowId
  /**
   * The Id of the Cell in the Row to be rendered.
   * @category Prop
   */
  /// CellProps.cellId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// CellProps.store
  /**
   * Whether the component should also render the Id of the Cell to assist with
   * debugging.
   * @category Prop
   */
  /// CellProps.debugIds
}
/**
 * ValuesProps props are used for components that refer to all the Values in a
 * Store, such as the ValuesView component.
 * @category Props
 * @since v3.0.0
 */
/// ValuesProps
{
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// ValuesProps.store
  /**
   * A custom component for rendering each Value in the Store (to override the
   * default ValueView component).
   * @category Prop
   */
  /// ValuesProps.valueComponent
  /**
   * A function for generating extra props for each custom Value component based
   * on its Id.
   * @category Prop
   */
  /// ValuesProps.getValueComponentProps
  /**
   * A component or string to separate each Value component.
   * @category Prop
   */
  /// ValuesProps.separator
  /**
   * Whether the component should also render the Ids of each Value to assist
   * with debugging.
   * @category Prop
   */
  /// ValuesProps.debugIds
}
/**
 * ValueProps props are used for components that refer to a single Value in a
 * Row, such as the ValueView component.
 * @category Props
 * @since v3.0.0
 */
/// ValueProps
{
  /**
   * The Id of the Value in the Row to be rendered.
   * @category Prop
   */
  /// ValueProps.valueId
  /**
   * The Store to be accessed: omit for the default context Store, provide an Id
   * for a named context Store, or provide an explicit reference.
   * @category Prop
   */
  /// ValueProps.store
  /**
   * Whether the component should also render the Id of the Value to assist with
   * debugging.
   * @category Prop
   */
  /// ValueProps.debugIds
}
/**
 * MetricProps props are used for components that refer to a single Metric in a
 * Metrics object, such as the MetricView component.
 * @category Props
 */
/// MetricProps
{
  /**
   * The Id of the Metric in the Metrics object to be rendered.
   * @category Prop
   */
  /// MetricProps.metricId
  /**
   * The Metrics object to be accessed: omit for the default context Metrics
   * object, provide an Id for a named context Metrics object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// MetricProps.metrics
  /**
   * Whether the component should also render the Id of the Metric to assist
   * with debugging.
   * @category Prop
   */
  /// MetricProps.debugIds
}
/**
 * IndexProps props are used for components that refer to a single Index in an
 * Indexes object, such as the IndexView component.
 * @category Props
 */
/// IndexProps
{
  /**
   * The Id of the Index in the Indexes object to be rendered.
   * @category Prop
   */
  /// IndexProps.indexId
  /**
   * The Indexes object to be accessed: omit for the default context Indexes
   * object, provide an Id for a named context Indexes object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// IndexProps.indexes
  /**
   * A component for rendering each Slice in the Index.
   * @category Prop
   */
  /// IndexProps.sliceComponent
  /**
   * A function for generating extra props for each Slice component based on its
   * Id.
   * @category Prop
   */
  /// IndexProps.getSliceComponentProps
  /**
   * A component or string to separate each Slice component.
   * @category Prop
   */
  /// IndexProps.separator
  /**
   * Whether the component should also render the Id of the Index, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// IndexProps.debugIds
}
/**
 * SliceProps props are used for components that refer to a single Slice in an
 * Index object, such as the SliceView component.
 * @category Props
 */
/// SliceProps
{
  /**
   * The Id of the Index in the Indexes object.
   * @category Prop
   */
  /// SliceProps.indexId
  /**
   * The Id of the Slice in the Index to be rendered.
   * @category Prop
   */
  /// SliceProps.sliceId
  /**
   * The Indexes object to be accessed: omit for the default context Indexes
   * object, provide an Id for a named context Indexes object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// SliceProps.indexes
  /**
   * A component for rendering each Row in the Index.
   * @category Prop
   */
  /// SliceProps.rowComponent
  /**
   * A function for generating extra props for each Row component based on its
   * Id.
   * @category Prop
   */
  /// SliceProps.getRowComponentProps
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// SliceProps.separator
  /**
   * Whether the component should also render the Id of the Slice, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// SliceProps.debugIds
}
/**
 * RemoteRowProps props are used for components that refer to a single
 * Relationship in a Relationships object, and where you want to render a remote
 * Row based on a local Row, such as in the RemoteRowView component.
 * @category Props
 */
/// RemoteRowProps
{
  /**
   * The Id of the Relationship in the Relationships object.
   * @category Prop
   */
  /// RemoteRowProps.relationshipId
  /**
   * The Id of the local Row for which to render the remote Row.
   * @category Prop
   */
  /// RemoteRowProps.localRowId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   * @category Prop
   */
  /// RemoteRowProps.relationships
  /**
   * A component for rendering each (remote, local, or linked) Row in the
   * Relationship.
   * @category Prop
   */
  /// RemoteRowProps.rowComponent
  /**
   * A function for generating extra props for each Row component based on its
   * Id.
   * @category Prop
   */
  /// RemoteRowProps.getRowComponentProps
  /**
   * Whether the component should also render the Id of the Row in the
   * Relationship, and its descendent objects, to assist with debugging.
   * @category Prop
   */
  /// RemoteRowProps.debugIds
}
/**
 * LocalRowsProps props are used for components that refer to a single
 * Relationship in a Relationships object, and where you want to render local
 * Rows based on a remote Row, such as the LocalRowsView component.
 * @category Props
 */
/// LocalRowsProps
{
  /**
   * The Id of the Relationship in the Relationships object.
   * @category Prop
   */
  /// LocalRowsProps.relationshipId
  /**
   * The Id of the remote Row for which to render the local Rows.
   * @category Prop
   */
  /// LocalRowsProps.remoteRowId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   * @category Prop
   */
  /// LocalRowsProps.relationships
  /**
   * A component for rendering each (remote, local, or linked) Row in the
   * Relationship.
   * @category Prop
   */
  /// LocalRowsProps.rowComponent
  /**
   * A function for generating extra props for each Row component based on its
   * Id.
   * @category Prop
   */
  /// LocalRowsProps.getRowComponentProps
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// LocalRowsProps.separator
  /**
   * Whether the component should also render the Id of the Row in the
   * Relationship, and its descendent objects, to assist with debugging.
   * @category Prop
   */
  /// LocalRowsProps.debugIds
}
/**
 * LinkedRowsProps props are used for components that refer to a single
 * Relationship in a Relationships object, and where you want to render a linked
 * list of Rows starting from a first Row, such as the LinkedRowsView component.
 * @category Props
 */
/// LinkedRowsProps
{
  /**
   * The Id of the Relationship in the Relationships object.
   * @category Prop
   */
  /// LinkedRowsProps.relationshipId
  /**
   * The Id of the first Row in the linked list Relationship.
   * @category Prop
   */
  /// LinkedRowsProps.firstRowId
  /**
   * The Relationships object to be accessed: omit for the default context
   * Relationships object, provide an Id for a named context Relationships
   * object, or provide an explicit reference.
   * @category Prop
   */
  /// LinkedRowsProps.relationships
  /**
   * A component for rendering each (remote, local, or linked) Row in the
   * Relationship.
   * @category Prop
   */
  /// LinkedRowsProps.rowComponent
  /**
   * A function for generating extra props for each Row component based on its
   * Id.
   * @category Prop
   */
  /// LinkedRowsProps.getRowComponentProps
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// LinkedRowsProps.separator
  /**
   * Whether the component should also render the Id of the Row in the
   * Relationship, and its descendent objects, to assist with debugging.
   * @category Prop
   */
  /// LinkedRowsProps.debugIds
}
/**
 * ResultTableProps props are used for components that refer to a single query
 * ResultTable, such as the ResultTableView component.
 * @category Props
 * @since v2.0.0
 */
/// ResultTableProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   * @category Prop
   */
  /// ResultTableProps.queryId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// ResultTableProps.queries
  /**
   * A custom component for rendering each Row in the Table (to override the
   * default ResultRowView component).
   * @category Prop
   */
  /// ResultTableProps.resultRowComponent
  /**
   * A function for generating extra props for each custom Row component based
   * on its Id.
   * @category Prop
   */
  /// ResultTableProps.getResultRowComponentProps
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// ResultTableProps.separator
  /**
   * Whether the component should also render the Id of the query, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// ResultTableProps.debugIds
}
/**
 * ResultSortedTableProps props are used for components that refer to a single
 * sorted query ResultTable, such as the ResultSortedTableView component.
 * @category Props
 * @since v2.0.0
 */
/// ResultSortedTableProps
{
  /**
   * The Id of the query in the Queries object for which the sorted ResultTable
   * will be rendered.
   * @category Prop
   */
  /// ResultSortedTableProps.queryId
  /**
   * The Id of the Cell whose values are used for the sorting. If omitted, the
   * view will sort the Row Id itself.
   * @category Prop
   */
  /// ResultSortedTableProps.cellId
  /**
   * Whether the sorting should be in descending order.
   * @category Prop
   */
  /// ResultSortedTableProps.descending
  /**
   * The number of Row Ids to skip for pagination purposes.
   * @category Prop
   */
  /// ResultSortedTableProps.offset
  /**
   * The maximum number of Row Ids to return.
   * @category Prop
   */
  /// ResultSortedTableProps.limit
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// ResultSortedTableProps.queries
  /**
   * A custom component for rendering each Row in the Table (to override the
   * default ResultRowView component).
   * @category Prop
   */
  /// ResultSortedTableProps.resultRowComponent
  /**
   * A function for generating extra props for each custom Row component based
   * on its Id.
   * @category Prop
   */
  /// ResultSortedTableProps.getResultRowComponentProps
  /**
   * A component or string to separate each Row component.
   * @category Prop
   */
  /// ResultSortedTableProps.separator
  /**
   * Whether the component should also render the Id of the query, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// ResultSortedTableProps.debugIds
}
/**
 * ResultRowProps props are used for components that refer to a single Row in a
 * query ResultTable, such as the ResultRowView component.
 * @category Props
 * @since v2.0.0
 */
/// ResultRowProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   * @category Prop
   */
  /// ResultRowProps.queryId
  /**
   * The Id of the Row in the ResultTable to be rendered.
   * @category Prop
   */
  /// ResultRowProps.rowId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// ResultRowProps.queries
  /**
   * A custom component for rendering each Cell in the Row (to override the
   * default CellView component).
   * @category Prop
   */
  /// ResultRowProps.resultCellComponent
  /**
   * A function for generating extra props for each custom Cell component based
   * on its Id.
   * @category Prop
   */
  /// ResultRowProps.getResultCellComponentProps
  /**
   * A component or string to separate each Cell component.
   * @category Prop
   */
  /// ResultRowProps.separator
  /**
   * Whether the component should also render the Id of the Row, and its
   * descendent objects, to assist with debugging.
   * @category Prop
   */
  /// ResultRowProps.debugIds
}
/**
 * ResultRowProps props are used for components that refer to a single Cell in a
 * Row of a ResultTable, such as the ResultCellView component.
 * @category Props
 * @since v2.0.0
 */
/// ResultCellProps
{
  /**
   * The Id of the query in the Queries object for which the ResultTable will be
   * rendered.
   * @category Prop
   */
  /// ResultCellProps.queryId
  /**
   * The Id of the Row in the Table.
   * @category Prop
   */
  /// ResultCellProps.rowId
  /**
   * The Id of the Cell in the Row to be rendered.
   * @category Prop
   */
  /// ResultCellProps.cellId
  /**
   * The Queries object to be accessed: omit for the default context Queries
   * object, provide an Id for a named context Queries object, or provide an
   * explicit reference.
   * @category Prop
   */
  /// ResultCellProps.queries
  /**
   * Whether the component should also render the Id of the Cell to assist with
   * debugging.
   * @category Prop
   */
  /// ResultCellProps.debugIds
}
/**
 * CheckpointProps props are used for components that refer to a single
 * checkpoint in a Checkpoints object, such as the CheckpointView component.
 * @category Props
 */
/// CheckpointProps
{
  /**
   * The Id of the checkpoint in the Checkpoints object.
   * @category Prop
   */
  /// CheckpointProps.checkpointId
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Prop
   */
  /// CheckpointProps.checkpoints
  /**
   * Whether the component should also render the Id of the checkpoint to assist
   * with debugging.
   * @category Prop
   */
  /// CheckpointProps.debugIds
}
/**
 * BackwardCheckpointsProps props are used for components that refer to a list
 * of previous checkpoints in a Checkpoints object, such as the
 * BackwardCheckpointsView component.
 * @category Props
 */
/// BackwardCheckpointsProps
{
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Prop
   */
  /// BackwardCheckpointsProps.checkpoints
  /**
   * A component for rendering each checkpoint in the Checkpoints object.
   * @category Prop
   */
  /// BackwardCheckpointsProps.checkpointComponent
  /**
   * A function for generating extra props for each checkpoint component based
   * on its Id.
   * @category Prop
   */
  /// BackwardCheckpointsProps.getCheckpointComponentProps
  /**
   * A component or string to separate each Checkpoint component.
   * @category Prop
   */
  /// BackwardCheckpointsProps.separator
  /**
   * Whether the component should also render the Ids of the checkpoints to
   * assist with debugging.
   * @category Prop
   */
  /// BackwardCheckpointsProps.debugIds
}
/**
 * CurrentCheckpointsProps props are used for components that refer to the
 * current checkpoints in a Checkpoints object, such as the
 * BackwardCheckpointsView component.
 * @category Props
 */
/// CurrentCheckpointProps
{
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Prop
   */
  /// CurrentCheckpointProps.checkpoints
  /**
   * A component for rendering each checkpoint in the Checkpoints object.
   * @category Prop
   */
  /// CurrentCheckpointProps.checkpointComponent
  /**
   * A function for generating extra props for each checkpoint component based
   * on its Id.
   * @category Prop
   */
  /// CurrentCheckpointProps.getCheckpointComponentProps
  /**
   * Whether the component should also render the Ids of the checkpoints to
   * assist with debugging.
   * @category Prop
   */
  /// CurrentCheckpointProps.debugIds
}
/**
 * ForwardCheckpointsProps props are used for components that refer to a list of
 * future checkpoints in a Checkpoints object, such as the
 * ForwardCheckpointsView component.
 * @category Props
 */
/// ForwardCheckpointsProps
{
  /**
   * The Checkpoints object to be accessed: omit for the default context
   * Checkpoints object, provide an Id for a named context Checkpoints object,
   * or provide an explicit reference.
   * @category Prop
   */
  /// ForwardCheckpointsProps.checkpoints
  /**
   * A component for rendering each checkpoint in the Checkpoints object.
   * @category Prop
   */
  /// ForwardCheckpointsProps.checkpointComponent
  /**
   * A function for generating extra props for each checkpoint component based
   * on its Id.
   * @category Prop
   */
  /// ForwardCheckpointsProps.getCheckpointComponentProps
  /**
   * A component or string to separate each Checkpoint component.
   * @category Prop
   */
  /// ForwardCheckpointsProps.separator
  /**
   * Whether the component should also render the Ids of the checkpoints to
   * assist with debugging.
   * @category Prop
   */
  /// ForwardCheckpointsProps.debugIds
}
/**
 * ProviderProps props are used with the Provider component, so that Store
 * Metrics, Indexes, Relationships, Queries, and Checkpoints objects can be
 * passed into the context of an application and used throughout.
 *
 * One of each type of object can be provided as a default within the context.
 * Additionally, multiple of each type of object can be provided in an Id-keyed
 * map to the `___ById` props.
 * @category Props
 */
/// ProviderProps
{
  /**
   * A default single Store object that will be available within the Provider
   * context.
   * @category Prop
   */
  /// ProviderProps.store
  /**
   * An object containing multiple Store objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   */
  /// ProviderProps.storesById
  /**
   * A default single Metrics object that will be available within the Provider
   * context.
   * @category Prop
   */
  /// ProviderProps.metrics
  /**
   * An object containing multiple Metrics objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   */
  /// ProviderProps.metricsById
  /**
   * A default single Indexes object that will be available within the Provider
   * context.
   * @category Prop
   */
  /// ProviderProps.indexes
  /**
   * An object containing multiple Indexes objects that will be available within
   * the Provider context by their Id.
   * @category Prop
   */
  /// ProviderProps.indexesById
  /**
   * A default single Relationships object that will be available within the
   * Provider context.
   * @category Prop
   */
  /// ProviderProps.relationships
  /**
   * An object containing multiple Relationships objects that will be available
   * within the Provider context by their Id.
   * @category Prop
   */
  /// ProviderProps.relationshipsById
  /**
   * A default single Queries object that will be available within the Provider
   * context, since v2.0.
   * @category Prop
   */
  /// ProviderProps.queries
  /**
   * An object containing multiple Queries objects that will be available within
   * the Provider context by their Id, since v2.0.
   * @category Prop
   */
  /// ProviderProps.queriesById
  /**
   * A default single Checkpoints object that will be available within the
   * Provider context.
   * @category Prop
   */
  /// ProviderProps.checkpoints
  /**
   * An object containing multiple Checkpoints objects that will be available
   * within the Provider context by their Id.
   * @category Prop
   */
  /// ProviderProps.checkpointsById
}
/**
 * ComponentReturnType is a simple alias for what a React component can return:
 * either a ReactElement, or `null` for an empty component.
 * @category Component
 */
/// ComponentReturnType
/**
 * The Provider component is used to wrap part of an application in a context
 * that provides default objects to be used by hooks and components within.
 *
 * Store, Metrics, Indexes, Relationships, Queries, and Checkpoints objects can
 * be passed into the context of an application and used throughout. One of each
 * type of object can be provided as a default within the context. Additionally,
 * multiple of each type of object can be provided in an Id-keyed map to the
 * `___ById` props.
 *
 * Provider contexts can be nested and the objects passed in will be merged. For
 * example, if an outer context contains a default Metrics object and an inner
 * context contains only a default Store, both the Metrics objects and the Store
 * will be visible within the inner context. If the outer context contains a
 * Store named by Id and the inner context contains a Store named by a different
 * Id, both will be visible within the inner context.
 * @param props The props for this component.
 * @returns A rendering of the child components.
 * @example
 * This example creates a Provider context into which a Store and a Metrics
 * object are provided, one by default, and one named by Id. Components within
 * it then render content from both, without the need to have them passed as
 * props.
 *
 * ```jsx
 * import {CellView, Provider, useMetric} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({store, metrics}) => (
 *   <Provider store={store} metricsById={{petStore: metrics}}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     <CellView tableId="species" rowId="dog" cellId="price" />,
 *     <CellView tableId="species" rowId="cat" cellId="price" />,
 *     {useMetric('highestPrice', 'petStore')}
 *   </span>
 * );
 *
 * const store = createStore();
 * store.setTable('species', {dog: {price: 5}, cat: {price: 4}});
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App store={store} metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>5,4,5</span>'
 * ```
 * @example
 * This example creates nested Provider contexts into which Store and Metrics
 * objects are provided, showing how visibility is merged.
 *
 * ```jsx
 * import {
 *   CellView,
 *   Provider,
 *   useCreateStore,
 *   useMetric,
 * } from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({petStore, metrics}) => (
 *   <Provider storesById={{pet: petStore}} metrics={metrics}>
 *     <OuterPane />
 *   </Provider>
 * );
 * const OuterPane = () => {
 *   const planetStore = useCreateStore(() =>
 *     createStore().setTables({planets: {mars: {moons: 2}}}),
 *   );
 *   return (
 *     <Provider storesById={{planet: planetStore}}>
 *       <InnerPane />
 *     </Provider>
 *   );
 * };
 * const InnerPane = () => (
 *   <span>
 *     <CellView tableId="species" rowId="dog" cellId="price" store="pet" />,
 *     {useMetric('highestPrice')},
 *     <CellView
 *       tableId="planets"
 *       rowId="mars"
 *       cellId="moons"
 *       store="planet"
 *     />
 *   </span>
 * );
 *
 * const petStore = createStore();
 * petStore.setTable('species', {dog: {price: 5}, cat: {price: 4}});
 * const metrics = createMetrics(petStore);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App petStore={petStore} metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>5,5,2</span>'
 * ```
 * @category Context components
 */
/// Provider
/**
 * The CellView component renders the value of a single Cell in a given Row, in
 * a given Table, and registers a listener so that any changes to that result
 * will cause a re-render.
 *
 * The component's props identify which Cell to render based on Table Id, Row
 * Id, Cell Id, and Store (which is either the default context Store, a named
 * context Store, or an explicit reference).
 *
 * A Cell contains a string, number, or boolean, so the value is rendered
 * directly without further decoration. You can create your own CellView-like
 * component to customize the way that a Cell is rendered: see the RowView
 * component for more details.
 *
 * This component uses the useCell hook under the covers, which means that any
 * changes to the specified Cell will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Cell, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * CellView component by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import {CellView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const App = () => (
 *   <span>
 *     <CellView tableId="pets" rowId="fido" cellId="color" store={store} />
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>walnut</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The CellView component within it then renders the Cell (with its Id
 * for readability).
 *
 * ```jsx
 * import {CellView, Provider} from 'tinybase/ui-react';
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
 *   <span>
 *     <CellView tableId="pets" rowId="fido" cellId="color" debugIds={true} />
 *   </span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>color:{brown}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The CellView component within it then attempts to render a
 * non-existent Cell.
 *
 * ```jsx
 * import {CellView, Provider} from 'tinybase/ui-react';
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
 *   <span>
 *     <CellView tableId="pets" rowId="fido" cellId="height" />
 *   </span>
 * );
 *
 * const store = createStore().setCell('pets', 'fido', 'color', 'brown');
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span></span>'
 * ```
 * @category Store components
 */
/// CellView
/**
 * The RowView component renders the contents of a single Row in a given Table,
 * and registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * The component's props identify which Row to render based on Table Id, Row Id,
 * and Store (which is either the default context Store, a named context Store,
 * or an explicit reference).
 *
 * This component renders a Row by iterating over its Cell values. By default
 * these are in turn rendered with the CellView component, but you can override
 * this behavior by providing a `cellComponent` prop, a custom component of your
 * own that will render a Cell based on CellProps. You can also pass additional
 * props to your custom component with the `getCellComponentProps` callback
 * prop.
 *
 * You can create your own RowView-like component to customize the way that a
 * Row is rendered: see the TableView component for more details.
 *
 * Since v4.1.0, you can use the `customCellIds` prop if you want to render a
 * prescribed set of the Row's Cells in a given order. Otherwise, this component
 * uses the useCellIds hook under the covers, which means that any changes to
 * the structure of the Row will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Row, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * RowView component by reference. A change to the data in the Store re-renders
 * the component.
 *
 * ```jsx
 * import React from 'react';
 * import {RowView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setRow('pets', 'fido', {species: 'dog'});
 * const App = () => (
 *   <div>
 *     <RowView tableId="pets" rowId="fido" store={store} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog</div>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/walnut</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The RowView component within it then renders the Row for a custom
 * set of Cell Ids (and rendered with Ids for readability).
 *
 * ```jsx
 * import {Provider, RowView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const customCellIds = ['color', 'species'];
 * const Pane = () => (
 *   <div>
 *     <RowView
 *       tableId="pets"
 *       rowId="fido"
 *       customCellIds={customCellIds}
 *       debugIds={true}
 *     />
 *   </div>
 * );
 *
 * const store = createStore().setRow('pets', 'fido', {
 *   species: 'dog',
 *   color: 'walnut',
 *   legs: 4,
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>fido:{color:{walnut}species:{dog}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The RowView component within it then renders the Row with a custom
 * Cell component and a custom props callback.
 *
 * ```jsx
 * import {CellView, Provider, RowView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (cellId) => ({bold: cellId == 'species'});
 * const Pane = () => (
 *   <div>
 *     <RowView
 *       tableId="pets"
 *       rowId="fido"
 *       cellComponent={FormattedCellView}
 *       getCellComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedCellView = ({tableId, rowId, cellId, bold}) => (
 *   <span>
 *     {bold ? <b>{cellId}</b> : cellId}
 *     {': '}
 *     <CellView tableId={tableId} rowId={rowId} cellId={cellId} />
 *   </span>
 * );
 *
 * const store = createStore().setRow('pets', 'fido', {
 *   species: 'dog',
 *   color: 'walnut',
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>species</b>: dog</span><span>color: walnut</span></div>'
 * ```
 * @category Store components
 */
/// RowView
/**
 * The SortedTableView component renders the contents of a single sorted Table
 * in a Store, and registers a listener so that any changes to that result will
 * cause a re-render.
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
 * with the RowView component, but you can override this behavior by providing a
 * `rowComponent` prop, a custom component of your own that will render a Row
 * based on RowProps. You can also pass additional props to your custom
 * component with the `getRowComponentProps` callback prop.
 *
 * This component uses the useSortedRowIds hook under the covers, which means
 * that any changes to the structure or sorting of the Table will cause a
 * re-render.
 *
 * Since v4.1.0, you can use the `customCellIds` prop if you want to render a
 * prescribed set of the Table's Cells in a given order for each Row.
 * @param props The props for this component.
 * @returns A rendering of the Table, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * SortedTableView component by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {SortedTableView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {species: 'dog'},
 *     felix: {species: 'cat'},
 *   },
 * });
 * const App = () => (
 *   <div>
 *     <SortedTableView
 *       tableId="pets"
 *       cellId="species"
 *       store={store}
 *       separator="/"
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>cat/dog</div>'
 *
 * store.setRow('pets', 'cujo', {species: 'wolf'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>cat/dog/wolf</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableView component within it then renders the Table for
 * a custom set of Cell Ids (and rendered with Ids for readability).
 *
 * ```jsx
 * import {Provider, SortedTableView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const customCellIds = ['species'];
 * const Pane = () => (
 *   <div>
 *     <SortedTableView
 *       tableId="pets"
 *       cellId="species"
 *       customCellIds={customCellIds}
 *       debugIds={true}
 *     />
 *   </div>
 * );
 *
 * const store = createStore().setTables({
 *   pets: {
 *     fido: {color: 'black', species: 'dog'},
 *     felix: {color: 'brown', species: 'cat'},
 *   },
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>pets:{felix:{species:{cat}}fido:{species:{dog}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The SortedTableView component within it then renders the Table with
 * a custom Row component and a custom props callback.
 *
 * ```jsx
 * import {Provider, RowView, SortedTableView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <SortedTableView
 *       tableId="pets"
 *       cellId="species"
 *       rowComponent={FormattedRowView}
 *       getRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({tableId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <RowView tableId={tableId} rowId={rowId} />
 *   </span>
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
 * // -> '<div><span>felix: cat</span><span><b>fido</b>: dog</span></div>'
 * ```
 * @category Store components
 * @since v2.0.0
 */
/// SortedTableView
/**
 * The TableView component renders the contents of a single Table in a Store,
 * and registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * The component's props identify which Table to render based on Table Id, and
 * Store (which is either the default context Store, a named context Store, or
 * by explicit reference).
 *
 * This component renders a Table by iterating over its Row objects. By default
 * these are in turn rendered with the RowView component, but you can override
 * this behavior by providing a `rowComponent` prop, a custom component of your
 * own that will render a Row based on RowProps. You can also pass additional
 * props to your custom component with the `getRowComponentProps` callback prop.
 *
 * You can create your own TableView-like component to customize the way that a
 * Table is rendered: see the TablesView component for more details.
 *
 * This component uses the useRowIds hook under the covers, which means that any
 * changes to the structure of the Table will cause a re-render.
 *
 * Since v4.1.0, you can use the `customCellIds` prop if you want to render a
 * prescribed set of the Table's Cells in a given order for each Row.
 * @param props The props for this component.
 * @returns A rendering of the Table, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * TableView component by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {TableView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTable('pets', {fido: {species: 'dog'}});
 * const App = () => (
 *   <div>
 *     <TableView tableId="pets" store={store} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog</div>'
 *
 * store.setRow('pets', 'felix', {species: 'cat'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/cat</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TableView component within it then renders the Table for a
 * custom set of Cell Ids (and rendered with Ids for readability).
 *
 * ```jsx
 * import {Provider, TableView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const customCellIds = ['species'];
 * const Pane = () => (
 *   <div>
 *     <TableView
 *       tableId="pets"
 *       customCellIds={customCellIds}
 *       debugIds={true}
 *     />
 *   </div>
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {color: 'black', species: 'dog'},
 *   felix: {color: 'brown', species: 'cat'},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>pets:{fido:{species:{dog}}felix:{species:{cat}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TableView component within it then renders the Table with a
 * custom Row component and a custom props callback.
 *
 * ```jsx
 * import {Provider, RowView, TableView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <TableView
 *       tableId="pets"
 *       rowComponent={FormattedRowView}
 *       getRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({tableId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <RowView tableId={tableId} rowId={rowId} />
 *   </span>
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>fido</b>: dog</span><span>felix: cat</span></div>'
 * ```
 * @category Store components
 */
/// TableView
/**
 * The TablesView component renders the tabular contents of a Store, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * The component's props can identify which Store to render - either the default
 * context Store, a named context Store, or an explicit reference.
 *
 * This component renders a Store by iterating over its Table objects. By
 * default these are in turn rendered with the TableView component, but you can
 * override this behavior by providing a `tableComponent` prop, a custom
 * component of your own that will render a Table based on TableProps. You can
 * also pass additional props to your custom component with the
 * `getTableComponentProps` callback prop.
 *
 * This component uses the useTableIds hook under the covers, which means that
 * any changes to the structure of the Store will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Store, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * TablesView component by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {TablesView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const App = () => (
 *   <div>
 *     <TablesView store={store} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog</div>'
 *
 * store.setTable('species', {dog: {price: 5}}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/5</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TablesView component within it then renders the Store (with Ids
 * for readability).
 *
 * ```jsx
 * import {Provider, TablesView} from 'tinybase/ui-react';
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
 *   <div>
 *     <TablesView debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setTables({
 *   pets: {fido: {species: 'dog'}},
 *   species: {dog: {price: 5}},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>pets:{fido:{species:{dog}}}species:{dog:{price:{5}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The TablesView component within it then renders the Store with a
 * custom Table component and a custom props callback.
 *
 * ```jsx
 * import {Provider, TableView, TablesView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (tableId) => ({bold: tableId == 'pets'});
 * const Pane = () => (
 *   <div>
 *     <TablesView
 *       tableComponent={FormattedTableView}
 *       getTableComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedTableView = ({tableId, bold}) => (
 *   <span>
 *     {bold ? <b>{tableId}</b> : tableId}
 *     {': '}
 *     <TableView tableId={tableId} />
 *   </span>
 * );
 *
 * const store = createStore().setTables({
 *   pets: {fido: {species: 'dog'}},
 *   species: {dog: {price: 5}},
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>pets</b>: dog</span><span>species: 5</span></div>'
 * ```
 * @category Store components
 */
/// TablesView
/**
 * The ValueView component renders the value of a single Value, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * The component's props identify which Value to render based on Value Id and
 * Store (which is either the default context Store, a named context Store, or
 * an explicit reference).
 *
 * A Value contains a string, number, or boolean, so the value is rendered
 * directly without further decoration. You can create your own ValueView-like
 * component to customize the way that a Value is rendered: see the ValuesView
 * component for more details.
 *
 * This component uses the useValue hook under the covers, which means that any
 * changes to the specified Value will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Value, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * ValueView component by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {ValueView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => (
 *   <span>
 *     <ValueView valueId="open" store={store} />
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>true</span>'
 *
 * store.setValue('open', false); // !act
 * console.log(app.innerHTML);
 * // -> '<span>false</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValueView component within it then renders the Value (with its
 * Id for readability).
 *
 * ```jsx
 * import {Provider, ValueView} from 'tinybase/ui-react';
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
 *   <span>
 *     <ValueView valueId="open" debugIds={true} />
 *   </span>
 * );
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>open:{true}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValueView component within it then attempts to render a
 * non-existent Value.
 *
 * ```jsx
 * import {Provider, ValueView} from 'tinybase/ui-react';
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
 *   <span>
 *     <ValueView valueId="website" />
 *   </span>
 * );
 *
 * const store = createStore().setValue('open', true);
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span></span>'
 * ```
 * @category Store components
 * @since v3.0.0
 */
/// ValueView
/**
 * The ValuesView component renders the keyed value contents of a Store, and
 * registers a listener so that any changes to that result will cause a
 * re-render.
 *
 * The component's props can identify which Store to render - either the default
 * context Store, a named context Store, or an explicit reference.
 *
 * This component renders a Store by iterating over its Value objects. By
 * default these are in turn rendered with the ValueView component, but you can
 * override this behavior by providing a `valueComponent` prop, a custom
 * component of your own that will render a Value based on ValueProps. You can
 * also pass additional props to your custom component with the
 * `getValueComponentProps` callback prop.
 *
 * This component uses the useValueIds hook under the covers, which means that
 * any changes to the Values in the Store will cause a re-render.
 *
 * This component uses the useValueIds hook under the covers, which means that
 * any changes to the Store's Values will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Values, or nothing, if not present.
 * @example
 * This example creates a Store outside the application, which is used in the
 * ValuesView component by reference. A change to the data in the Store
 * re-renders the component.
 *
 * ```jsx
 * import React from 'react';
 * import {ValuesView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setValue('open', true);
 * const App = () => (
 *   <div>
 *     <ValuesView store={store} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>true</div>'
 *
 * store.setValue('employees', 3); // !act
 * console.log(app.innerHTML);
 * // -> '<div>true/3</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValuesView component within it then renders the Values (with
 * Ids for readability).
 *
 * ```jsx
 * import {Provider, ValuesView} from 'tinybase/ui-react';
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
 *   <div>
 *     <ValuesView debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setValues({open: true, employees: 3});
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>open:{true}employees:{3}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Store is
 * provided. The ValuesView component within it then renders the Values with a
 * custom Value component and a custom props callback.
 *
 * ```jsx
 * import {Provider, ValueView, ValuesView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 * import {createStore} from 'tinybase';
 *
 * const App = ({store}) => (
 *   <Provider store={store}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (valueId) => ({bold: valueId == 'open'});
 * const Pane = () => (
 *   <div>
 *     <ValuesView
 *       valueComponent={FormattedValueView}
 *       getValueComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedValueView = ({valueId, bold}) => (
 *   <span>
 *     {bold ? <b>{valueId}</b> : valueId}
 *     {': '}
 *     <ValueView valueId={valueId} />
 *   </span>
 * );
 *
 * const store = createStore().setValues({open: true, employees: 3});
 * const app = document.createElement('div');
 * createRoot(app).render(<App store={store} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>open</b>: true</span><span>employees: 3</span></div>'
 * ```
 * @category Store components
 * @since v3.0.0
 */
/// ValuesView
/**
 * The MetricView component renders the current value of a Metric, and registers
 * a listener so that any changes to that result will cause a re-render.
 *
 * The component's props can identify which Metrics object to get data for: omit
 * the optional final parameter for the default context Metrics object, provide
 * an Id for a named context Metrics object, or by explicit reference.
 *
 * This component uses the useMetric hook under the covers, which means that any
 * changes to the Metric will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Metric, or nothing, if not present.
 * @example
 * This example creates a Metrics object outside the application, which is used
 * in the MetricView component hook by reference. A change to the Metric
 * re-renders the component.
 *
 * ```jsx
 * import {createMetrics, createStore} from 'tinybase';
 * import {MetricView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('species', {
 *   dog: {price: 5},
 *   cat: {price: 4},
 *   worm: {price: 1},
 * });
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 * const App = () => (
 *   <div>
 *     <MetricView metricId="highestPrice" metrics={metrics} />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>5</div>'
 *
 * store.setCell('species', 'horse', 'price', 20); // !act
 * console.log(app.innerHTML);
 * // -> '<div>20</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Metrics object
 * is provided. The MetricView component within it then renders the Metric (with
 * its Id for readability).
 *
 * ```jsx
 * import {MetricView, Provider} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metrics={metrics}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <MetricView metricId="highestPrice" debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setTable('species', {
 *   dog: {price: 5},
 *   cat: {price: 4},
 *   worm: {price: 1},
 * });
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>highestPrice:{5}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Metrics object
 * is provided. The MetricView component within it then attempts to render a
 * non-existent Metric.
 *
 * ```jsx
 * import {MetricView, Provider} from 'tinybase/ui-react';
 * import {createMetrics, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({metrics}) => (
 *   <Provider metrics={metrics}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <MetricView metricId="lowestPrice" />
 *   </div>
 * );
 *
 * const store = createStore().setTable('species', {
 *   dog: {price: 5},
 *   cat: {price: 4},
 *   worm: {price: 1},
 * });
 * const metrics = createMetrics(store);
 * metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App metrics={metrics} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div></div>'
 * ```
 * @category Metrics components
 */
/// MetricView
/**
 * The SliceView component renders the contents of a Slice, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * The component's props identify which Slice to render based on Index Id, Slice
 * Id, and Indexes object (which is either the default context Indexes object, a
 * named context Indexes object, or an explicit reference).
 *
 * This component renders a Slice by iterating over its Row objects. By default
 * these are in turn rendered with the RowView component, but you can override
 * this behavior by providing a `rowComponent` prop, a custom component of your
 * own that will render a Row based on RowProps. You can also pass additional
 * props to your custom component with the `getRowComponentProps` callback prop.
 *
 * This component uses the useSliceRowIds hook under the covers, which means
 * that any changes to the structure of the Slice will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Slice, or nothing, if not present.
 * @example
 * This example creates an Indexes object outside the application, which is used
 * in the SliceView component by reference. A change to the Row Ids re-renders
 * the component.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {SliceView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 * const App = () => (
 *   <div>
 *     <SliceView
 *       indexId="bySpecies"
 *       sliceId="dog"
 *       indexes={indexes}
 *       separator="/"
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog</div>'
 *
 * store.setRow('pets', 'cujo', {species: 'dog'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/dog</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. The SliceView component within it then renders the Slice (with
 * Ids for readability).
 *
 * ```jsx
 * import {Provider, SliceView} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <SliceView indexId="bySpecies" sliceId="dog" debugIds={true} />
 *   </div>
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
 * // -> '<div>dog:{fido:{species:{dog}}cujo:{species:{dog}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. The SliceView component within it then renders the Slice with a
 * custom Row component and a custom props callback.
 *
 * ```jsx
 * import {Provider, RowView, SliceView} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <SliceView
 *       indexId="bySpecies"
 *       sliceId="dog"
 *       rowComponent={FormattedRowView}
 *       getRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({store, tableId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <RowView store={store} tableId={tableId} rowId={rowId} separator="/" />
 *   </span>
 * );
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
 * // -> '<div><span><b>fido</b>: dog/brown</span><span>cujo: dog</span></div>'
 * ```
 * @category Indexes components
 */
/// SliceView
/**
 * The IndexView component renders the contents of a Index, and registers a
 * listener so that any changes to that result will cause a re-render.
 *
 * The component's props identify which Index to render based on Index Id, and
 * Indexes object (which is either the default context Indexes object, a named
 * context Indexes object, or an explicit reference).
 *
 * This component renders a Index by iterating over its Slice objects. By
 * default these are in turn rendered with the SliceView component, but you can
 * override this behavior by providing a `sliceComponent` prop, a custom
 * component of your own that will render a Slice based on SliceProps. You can
 * also pass additional props to your custom component with the
 * `getSliceComponentProps` callback prop.
 *
 * This component uses the useSliceIds hook under the covers, which means that
 * any changes to the structure of the Index will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the Index, or nothing, if not present.
 * @example
 * This example creates an Indexes object outside the application, which is used
 * in the IndexView component by reference. A change to the Slice Ids re-renders
 * the component.
 *
 * ```jsx
 * import {createIndexes, createStore} from 'tinybase';
 * import {IndexView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   felix: {species: 'cat'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 * const App = () => (
 *   <div>
 *     <IndexView indexId="bySpecies" indexes={indexes} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/cat</div>'
 *
 * store.setRow('pets', 'lowly', {species: 'worm'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/cat/worm</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. The IndexView component within it then renders the Index (with
 * Ids for readability).
 *
 * ```jsx
 * import {IndexView, Provider} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <IndexView indexId="bySpecies" debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog'},
 *   cujo: {species: 'dog'},
 * });
 * const indexes = createIndexes(store);
 * indexes.setIndexDefinition('bySpecies', 'pets', 'species');
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App indexes={indexes} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>bySpecies:{dog:{fido:{species:{dog}}cujo:{species:{dog}}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Indexes object
 * is provided. The IndexView component within it then renders the Index with a
 * custom Slice component and a custom props callback.
 *
 * ```jsx
 * import {IndexView, Provider, SliceView} from 'tinybase/ui-react';
 * import {createIndexes, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({indexes}) => (
 *   <Provider indexes={indexes}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (sliceId) => ({bold: sliceId == 'dog'});
 * const Pane = () => (
 *   <div>
 *     <IndexView
 *       indexId="bySpecies"
 *       sliceComponent={FormattedSliceView}
 *       getSliceComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedSliceView = ({indexId, sliceId, bold}) => (
 *   <span>
 *     {bold ? <b>{sliceId}</b> : sliceId}
 *     {': '}
 *     <SliceView indexId={indexId} sliceId={sliceId} separator="/" />
 *   </span>
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
 * // -> '<div><span><b>dog</b>: dog/dog</span><span>cat: cat</span></div>'
 * ```
 * @category Indexes components
 */
/// IndexView
/**
 * The RemoteRowView component renders the remote Row Id for a given local Row
 * in a Relationship, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * The component's props identify which remote Row to render based on
 * Relationship Id, local Row Id, and Relationships object (which is either the
 * default context Relationships object, a named context Relationships object,
 * or an explicit reference).
 *
 * By default the remote Row is rendered with the RowView component, but you can
 * override this behavior by providing a `rowComponent` prop, a custom component
 * of your own that will render the Row based on RowProps. You can also pass
 * additional props to your custom component with the `getRowComponentProps`
 * callback prop.
 *
 * This component uses the useRemoteRowId hook under the covers, which means
 * that any changes to the remote Row Id in the Relationship will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the remote Row, or nothing, if not present.
 * @example
 * This example creates a Relationships object outside the application, which
 * is used in the RemoteRowView component by reference. A change to the Row Ids
 * re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {RemoteRowView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *   .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 * const App = () => (
 *   <div>
 *     <RemoteRowView
 *       relationshipId="petSpecies"
 *       localRowId="cujo"
 *       relationships={relationships}
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>5</div>'
 *
 * store.setCell('pets', 'cujo', 'species', 'wolf'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>10</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The RemoteRowView component within it then renders the
 * remote Row (with Ids for readability).
 *
 * ```jsx
 * import {Provider, RemoteRowView} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <RemoteRowView
 *       relationshipId="petSpecies"
 *       localRowId="cujo"
 *       debugIds={true}
 *     />
 *   </div>
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
 * // -> '<div>cujo:{dog:{price:{5}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The RemoteRowView component within it then renders the
 * remote Row with a custom Row component and a custom props callback.
 *
 * ```jsx
 * import {Provider, RemoteRowView, RowView} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'dog'});
 * const Pane = () => (
 *   <div>
 *     <RemoteRowView
 *       relationshipId="petSpecies"
 *       localRowId="cujo"
 *       rowComponent={FormattedRowView}
 *       getRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({store, tableId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <RowView store={store} tableId={tableId} rowId={rowId} />
 *   </span>
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
 * // -> '<div><span><b>dog</b>: 5</span></div>'
 * ```
 * @category Relationships components
 */
/// RemoteRowView
/**
 * The LocalRowsView component renders the local Row objects for a given remote
 * Row in a Relationship, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * The component's props identify which local Rows to render based on
 * Relationship Id, remote Row Id, and Relationships object (which is either the
 * default context Relationships object, a named context Relationships object,
 * or an explicit reference).
 *
 * By default the local Rows are rendered with the RowView component, but you
 * can override this behavior by providing a `rowComponent` prop, a custom
 * component of your own that will render the Row based on RowProps. You can
 * also pass additional props to your custom component with the
 * `getRowComponentProps` callback prop.
 *
 * This component uses the useLocalRowIds hook under the covers, which means
 * that any changes to the local Row Ids in the Relationship will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the local Row objects, or nothing, if not present.
 * @example
 * This example creates a Relationships object outside the application, which
 * is used in the LocalRowsView component by reference. A change to the Row Ids
 * re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import {LocalRowsView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore()
 *   .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
 *   .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSpecies',
 *   'pets',
 *   'species',
 *   'species',
 * );
 * const App = () => (
 *   <div>
 *     <LocalRowsView
 *       relationshipId="petSpecies"
 *       remoteRowId="dog"
 *       relationships={relationships}
 *       separator="/"
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/dog</div>'
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/dog/dog</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The LocalRowsView component within it then renders the
 * local Row objects (with Ids for readability).
 *
 * ```jsx
 * import {LocalRowsView, Provider} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <LocalRowsView
 *       relationshipId="petSpecies"
 *       remoteRowId="dog"
 *       debugIds={true}
 *     />
 *   </div>
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
 * // -> '<div>dog:{fido:{species:{dog}}cujo:{species:{dog}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The LocalRowsView component within it then renders the
 * local Row objects with a custom Row component and a custom props callback.
 *
 * ```jsx
 * import {LocalRowsView, Provider, RowView} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <LocalRowsView
 *       relationshipId="petSpecies"
 *       remoteRowId="dog"
 *       rowComponent={FormattedRowView}
 *       getRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({store, tableId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <RowView store={store} tableId={tableId} rowId={rowId} />
 *   </span>
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
 * // -> '<div><span><b>fido</b>: dog</span><span>cujo: dog</span></div>'
 * ```
 * @category Relationships components
 */
/// LocalRowsView
/**
 * The LinkedRowsView component renders the local Row objects for a given remote
 * Row in a Relationship, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * The component's props identify which local Rows to render based on
 * Relationship Id, remote Row Id, and Relationships object (which is either the
 * default context Relationships object, a named context Relationships object,
 * or an explicit reference).
 *
 * By default the local Rows are rendered with the RowView component, but you
 * can override this behavior by providing a `rowComponent` prop, a custom
 * component of your own that will render the Row based on RowProps. You can
 * also pass additional props to your custom component with the
 * `getRowComponentProps` callback prop.
 *
 * This component uses the useLocalRowIds hook under the covers, which means
 * that any changes to the local Row Ids in the Relationship will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the local Row objects, or nothing, if not present.
 * @example
 * This example creates a Relationships object outside the application, which
 * is used in the LinkedRowsView component by reference. A change to the Row Ids
 * re-renders the component.
 *
 * ```jsx
 * import {createRelationships, createStore} from 'tinybase';
 * import {LinkedRowsView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {next: 'felix'},
 *   felix: {next: 'cujo'},
 *   cujo: {species: 'dog'},
 * });
 * const relationships = createRelationships(store).setRelationshipDefinition(
 *   'petSequence',
 *   'pets',
 *   'pets',
 *   'next',
 * );
 * const App = () => (
 *   <div>
 *     <LinkedRowsView
 *       relationshipId="petSequence"
 *       firstRowId="fido"
 *       relationships={relationships}
 *       separator="/"
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>felix/cujo/dog</div>'
 *
 * store.setRow('pets', 'toto', {species: 'dog'}); // !act
 * store.setRow('pets', 'cujo', {next: 'toto'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>felix/cujo/toto/dog</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The LinkedRowsView component within it then renders the
 * local Row objects (with Ids for readability).
 *
 * ```jsx
 * import {LinkedRowsView, Provider} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <LinkedRowsView
 *       relationshipId="petSequence"
 *       firstRowId="fido"
 *       debugIds={true}
 *     />
 *   </div>
 * );
 *
 * const relationships = createRelationships(
 *   createStore().setTable('pets', {
 *     fido: {next: 'felix'},
 *     felix: {species: 'cat'},
 *   }),
 * ).setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>fido:{fido:{next:{felix}}felix:{species:{cat}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Relationships
 * object is provided. The LinkedRowsView component within it then renders the
 * local Row objects with a custom Row component and a custom props callback.
 *
 * ```jsx
 * import {LinkedRowsView, Provider, RowView} from 'tinybase/ui-react';
 * import {createRelationships, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({relationships}) => (
 *   <Provider relationships={relationships}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <LinkedRowsView
 *       relationshipId="petSequence"
 *       firstRowId="fido"
 *       rowComponent={FormattedRowView}
 *       getRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({store, tableId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <RowView store={store} tableId={tableId} rowId={rowId} />
 *   </span>
 * );
 *
 * const relationships = createRelationships(
 *   createStore().setTable('pets', {
 *     fido: {next: 'felix'},
 *     felix: {species: 'cat'},
 *   }),
 * ).setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App relationships={relationships} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>fido</b>: felix</span><span>felix: cat</span></div>'
 * ```
 * @category Relationships components
 */
/// LinkedRowsView
/**
 * The ResultCellView component renders the value of a single Cell in a given
 * Row, in a given query's ResultTable, and registers a listener so that any
 * changes to that result will cause a re-render.
 *
 * The component's props identify which Cell to render based on query Id, Row
 * Id, Cell Id, and Queries object (which is either the default context Queries
 * object, a named context Queries object, or an explicit reference).
 *
 * A Cell contains a string, number, or boolean, so the value is rendered
 * directly without further decoration. You can create your own
 * ResultCellView-like component to customize the way that a Cell is rendered:
 * see the ResultRowView component for more details.
 *
 * This component uses the useResultCell hook under the covers, which means that
 * any changes to the specified Cell will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the result Cell, or nothing, if not present.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the ResultCellView component by reference. A change to the data in the
 * Store re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {ResultCellView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const App = () => (
 *   <span>
 *     <ResultCellView
 *       queryId="petColors"
 *       rowId="fido"
 *       cellId="color"
 *       queries={queries}
 *     />
 *   </span>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>brown</span>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<span>walnut</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultCellView component within it then renders the Cell
 * (with its Id for readability).
 *
 * ```jsx
 * import {Provider, ResultCellView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     <ResultCellView
 *       queryId="petColors"
 *       rowId="fido"
 *       cellId="color"
 *       debugIds={true}
 *     />
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => select('color'));
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span>color:{brown}</span>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultCellView component within it then attempts to render a
 * non-existent Cell.
 *
 * ```jsx
 * import {Provider, ResultCellView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <span>
 *     <ResultCellView queryId="petColors" rowId="fido" cellId="height" />
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => select('color'));
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<span></span>'
 * ```
 * @category Queries components
 * @since v2.0.0
 */
/// ResultCellView
/**
 * The ResultRowView component renders the contents of a single Row in a given
 * query's ResultTable, and registers a listener so that any changes to that
 * result will cause a re-render.
 *
 * The component's props identify which Row to render based on query Id, Row Id,
 * and Queries object (which is either the default context Queries object, a
 * named context Queries object, or an explicit reference).
 *
 * This component renders a Row by iterating over its Cell values. By default
 * these are in turn rendered with the ResultCellView component, but you can
 * override this behavior by providing a `resultCellComponent` prop, a custom
 * component of your own that will render a Cell based on ResultCellProps. You
 * can also pass additional props to your custom component with the
 * `getResultCellComponentProps` callback prop.
 *
 * You can create your own ResultRowView-like component to customize the way
 * that a result Row is rendered: see the ResultTableView component for more
 * details.
 *
 * This component uses the useResultCellIds hook under the covers, which means
 * that any changes to the structure of the result Row will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the result Row, or nothing, if not present.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the ResultRowView component by reference. A change to the data in the
 * Store re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {ResultRowView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 *   cujo: {species: 'dog', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => {
 *     select('species');
 *     select('color');
 *   },
 * );
 * const App = () => (
 *   <div>
 *     <ResultRowView
 *       queryId="petColors"
 *       rowId="fido"
 *       queries={queries}
 *       separator="/"
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/brown</div>'
 *
 * store.setCell('pets', 'fido', 'color', 'walnut'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>dog/walnut</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultRowView component within it then renders the Row (with
 * Ids for readability).
 *
 * ```jsx
 * import {Provider, ResultRowView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <ResultRowView queryId="petColors" rowId="fido" debugIds={true} />
 *   </div>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => {
 *   select('species');
 *   select('color');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>fido:{species:{dog}color:{brown}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultRowView component within it then renders the Row with
 * a custom Cell component and a custom props callback.
 *
 * ```jsx
 * import {Provider, ResultCellView, ResultRowView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (cellId) => ({bold: cellId == 'species'});
 * const Pane = () => (
 *   <div>
 *     <ResultRowView
 *       queryId="petColors"
 *       rowId="fido"
 *       resultCellComponent={FormattedResultCellView}
 *       getResultCellComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedResultCellView = ({queryId, rowId, cellId, bold}) => (
 *   <span>
 *     {bold ? <b>{cellId}</b> : cellId}
 *     {': '}
 *     <ResultCellView queryId={queryId} rowId={rowId} cellId={cellId} />
 *   </span>
 * );
 *
 * const queries = createQueries(
 *   createStore().setTable('pets', {
 *     fido: {species: 'dog', color: 'brown'},
 *     felix: {species: 'cat', color: 'black'},
 *     cujo: {species: 'dog', color: 'black'},
 *   }),
 * ).setQueryDefinition('petColors', 'pets', ({select}) => {
 *   select('species');
 *   select('color');
 * });
 * const app = document.createElement('div');
 * createRoot(app).render(<App queries={queries} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>species</b>: dog</span><span>color: brown</span></div>'
 * ```
 * @category Queries components
 * @since v2.0.0
 */
/// ResultRowView
/**
 * The ResultSortedTableView component renders the contents of a single query's
 * sorted ResultTable in a Queries object, and registers a listener so that any
 * changes to that result will cause a re-render.
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
 * the order dictated by the sort parameters. By default these are in turn
 * rendered with the ResultRowView component, but you can override this behavior
 * by providing a `resultRowComponent` prop, a custom component of your own that
 * will render a Row based on ResultRowProps. You can also pass additional props
 * to your custom component with the `getResultRowComponentProps` callback prop.
 *
 * This component uses the useResultSortedRowIds hook under the covers, which
 * means that any changes to the structure or sorting of the ResultTable will
 * cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the ResultTable, or nothing, if not present.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the ResultSortedTableView component by reference. A change to the data in
 * the Store re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {ResultSortedTableView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const App = () => (
 *   <div>
 *     <ResultSortedTableView
 *       queryId="petColors"
 *       cellId="color"
 *       queries={queries}
 *       separator="/"
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>black/brown</div>'
 *
 * store.setCell('pets', 'felix', 'color', 'white'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>brown/white</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultSortedTableView component within it then renders the
 * Table (with Ids for readability).
 *
 * ```jsx
 * import {Provider, ResultSortedTableView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <ResultSortedTableView
 *       queryId="petColors"
 *       cellId="color"
 *       debugIds={true}
 *     />
 *   </div>
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
 * // -> '<div>petColors:{felix:{color:{black}}fido:{color:{brown}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultSortedTableView component within it then renders the
 * Table with a custom Row component and a custom props callback.
 *
 * ```jsx
 * import {
 *   Provider,
 *   ResultRowView,
 *   ResultSortedTableView,
 * } from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <ResultSortedTableView
 *       queryId="petColors"
 *       cellId="color"
 *       resultRowComponent={FormattedRowView}
 *       getResultRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({queryId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <ResultRowView queryId={queryId} rowId={rowId} />
 *   </span>
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
 * // -> '<div><span>felix: black</span><span><b>fido</b>: brown</span></div>'
 * ```
 * @category Queries components
 * @since v2.0.0
 */
/// ResultSortedTableView
/**
 * The ResultTableView component renders the contents of a single query's
 * ResultTable in a Queries object, and registers a listener so that any changes
 * to that result will cause a re-render.
 *
 * The component's props identify which ResultTable to render based on query Id,
 * and Queries object (which is either the default context Queries object, a
 * named context Queries object, or by explicit reference).
 *
 * This component renders a ResultTable by iterating over its Row objects. By
 * default these are in turn rendered with the ResultRowView component, but you
 * can override this behavior by providing a `resultRowComponent` prop, a custom
 * component of your own that will render a Row based on ResultRowProps. You can
 * also pass additional props to your custom component with the
 * `getResultRowComponentProps` callback prop.
 *
 * This component uses the useResultRowIds hook under the covers, which means
 * that any changes to the structure of the ResultTable will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the ResultTable, or nothing, if not present.
 * @example
 * This example creates a Queries object outside the application, which is used
 * in the ResultTableView component by reference. A change to the data in the
 * Store re-renders the component.
 *
 * ```jsx
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {ResultTableView} from 'tinybase/ui-react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {
 *   fido: {species: 'dog', color: 'brown'},
 *   felix: {species: 'cat', color: 'black'},
 * });
 * const queries = createQueries(store).setQueryDefinition(
 *   'petColors',
 *   'pets',
 *   ({select}) => select('color'),
 * );
 * const App = () => (
 *   <div>
 *     <ResultTableView queryId="petColors" queries={queries} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>brown/black</div>'
 *
 * store.setRow('pets', 'cujo', {species: 'dog', color: 'black'}); // !act
 * console.log(app.innerHTML);
 * // -> '<div>brown/black/black</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultTableView component within it then renders the Table
 * (with Ids for readability).
 *
 * ```jsx
 * import {Provider, ResultTableView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <ResultTableView queryId="petColors" debugIds={true} />
 *   </div>
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
 * // -> '<div>petColors:{fido:{color:{brown}}felix:{color:{black}}}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Queries object
 * is provided. The ResultTableView component within it then renders the Table
 * with a custom Row component and a custom props callback.
 *
 * ```jsx
 * import {Provider, ResultRowView, ResultTableView} from 'tinybase/ui-react';
 * import {createQueries, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({queries}) => (
 *   <Provider queries={queries}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (rowId) => ({bold: rowId == 'fido'});
 * const Pane = () => (
 *   <div>
 *     <ResultTableView
 *       queryId="petColors"
 *       resultRowComponent={FormattedRowView}
 *       getResultRowComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedRowView = ({queryId, rowId, bold}) => (
 *   <span>
 *     {bold ? <b>{rowId}</b> : rowId}
 *     {': '}
 *     <ResultRowView queryId={queryId} rowId={rowId} />
 *   </span>
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
 * // -> '<div><span><b>fido</b>: brown</span><span>felix: black</span></div>'
 * ```
 * @category Queries components
 * @since v2.0.0
 */
/// ResultTableView
/**
 * The CheckpointView component simply renders the label of a checkpoint.
 *
 * The component's props identify which checkpoint to render based on Checkpoint
 * Id and Checkpoints object (which is either the default context Checkpoints
 * object, a named context Checkpoints object, or an explicit reference).
 *
 * The primary purpose of this component is to render multiple checkpoints in a
 * BackwardCheckpointsView component or ForwardCheckpointsView component.
 *
 * This component uses the useCheckpoint hook under the covers, which means that
 * any changes to the local Row Ids in the Relationship will cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the checkpoint: its label if present, or Id.
 * @example
 * This example creates a Checkpoints object outside the application, which is
 * used in the CheckpointView component by reference to render a checkpoint with
 * a label (with its Id for readability).
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import {CheckpointView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {fido: {species: 'dog'}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <div>
 *     <CheckpointView
 *       checkpointId="1"
 *       checkpoints={checkpoints}
 *       debugIds={true}
 *     />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>1:{}</div>'
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>1:{sale}</div>'
 *
 * checkpoints.setCheckpoint('1', 'sold'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>1:{sold}</div>'
 * ```
 * @category Checkpoints components
 */
/// CheckpointView
/**
 * The BackwardCheckpointsView component renders a list of previous checkpoints
 * that the underlying Store can go back to.
 *
 * The component's props identify which previous checkpoints to render based on
 * the Checkpoints object (which is either the default context Checkpoints
 * object, a named context Checkpoints object, or an explicit reference).
 *
 * This component renders a list by iterating over each checkpoints. By default
 * these are in turn rendered with the CheckpointView component, but you can
 * override this behavior by providing a `checkpointComponent` prop, a custom
 * component of your own that will render a checkpoint based on CheckpointProps.
 * You can also pass additional props to your custom component with the
 * `getCheckpointComponentProps` callback prop.
 *
 * This component uses the useCheckpointIds hook under the covers, which means
 * that any changes to the checkpoint Ids in the Checkpoints object will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the previous checkpoints, if present.
 * @example
 * This example creates a Checkpoints object outside the application, which is
 * used in the BackwardCheckpointsView component by reference to render a list
 * of previous checkpoints.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import {BackwardCheckpointsView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <div>
 *     <BackwardCheckpointsView checkpoints={checkpoints} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div></div>'
 *
 * checkpoints.setCheckpoint('0', 'initial'); // !act
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>initial</div>'
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>initial/identified</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. The BackwardCheckpointsView component within it then
 * renders the list of previous checkpoints (with Ids for readability).
 *
 * ```jsx
 * import {BackwardCheckpointsView, Provider} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <BackwardCheckpointsView debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 *
 * checkpoints.setCheckpoint('0', 'initial'); // !act
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>0:{initial}1:{identified}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. The BackwardCheckpointsView component within it then
 * renders the list of previous checkpoints with a custom Row component and a
 * custom props callback.
 *
 * ```jsx
 * import {
 *   BackwardCheckpointsView,
 *   CheckpointView,
 *   Provider,
 * } from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (checkpointId) => ({bold: checkpointId == '0'});
 * const Pane = () => (
 *   <div>
 *     <BackwardCheckpointsView
 *       checkpointComponent={FormattedCheckpointView}
 *       getCheckpointComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedCheckpointView = ({checkpoints, checkpointId, bold}) => (
 *   <span>
 *     {bold ? <b>{checkpointId}</b> : checkpointId}
 *     {': '}
 *     <CheckpointView
 *       checkpoints={checkpoints}
 *       checkpointId={checkpointId}
 *     />
 *   </span>
 * );
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 *
 * checkpoints.setCheckpoint('0', 'initial'); // !act
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>0</b>: initial</span><span>1: identified</span></div>'
 * ```
 * @category Checkpoints components
 */
/// BackwardCheckpointsView
/**
 * The CurrentCheckpointView component renders the current checkpoint that the
 * underlying Store is currently on.
 *
 * The component's props identify which current checkpoint to render based on
 * the Checkpoints object (which is either the default context Checkpoints
 * object, a named context Checkpoints object, or an explicit reference).
 *
 * By default the current checkpoint is rendered with the CheckpointView
 * component, but you can override this behavior by providing a
 * `checkpointComponent` prop, a custom component of your own that will render a
 * checkpoint based on CheckpointProps. You can also pass additional props to
 * your custom component with the `getCheckpointComponentProps` callback prop.
 *
 * This component uses the useCheckpointIds hook under the covers, which means
 * that any changes to the current checkpoint Id in the Checkpoints object will
 * cause a re-render.
 * @param props The props for this component.
 * @returns A rendering of the current checkpoint, if present.
 * @example
 * This example creates a Checkpoints object outside the application, which is
 * used in the CurrentCheckpointView component by reference to render the
 * current checkpoints.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import {CurrentCheckpointView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <div>
 *     <CurrentCheckpointView checkpoints={checkpoints} />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div></div>'
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>identified</div>'
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * console.log(app.innerHTML);
 * // -> '<div></div>'
 *
 * checkpoints.addCheckpoint('sale'); // !act
 * console.log(app.innerHTML);
 * // -> '<div>sale</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. The CurrentCheckpointView component within it then
 * renders current checkpoint (with its Id for readability).
 *
 * ```jsx
 * import {CurrentCheckpointView, Provider} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <CurrentCheckpointView debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>1:{identified}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. The CurrentCheckpointView component within it then
 * renders the list of future checkpoints with a custom Row component and a
 * custom props callback.
 *
 * ```jsx
 * import {
 *   CheckpointView,
 *   CurrentCheckpointView,
 *   Provider,
 * } from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (checkpointId) => ({bold: checkpointId == '1'});
 * const Pane = () => (
 *   <div>
 *     <CurrentCheckpointView
 *       checkpointComponent={FormattedCheckpointView}
 *       getCheckpointComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedCheckpointView = ({checkpoints, checkpointId, bold}) => (
 *   <span>
 *     {bold ? <b>{checkpointId}</b> : checkpointId}
 *     {': '}
 *     <CheckpointView
 *       checkpoints={checkpoints}
 *       checkpointId={checkpointId}
 *     />
 *   </span>
 * );
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>1</b>: identified</span></div>'
 *
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span>2: sale</span></div>'
 * ```
 * @category Checkpoints components
 */
/// CurrentCheckpointView
/**
 * The ForwardCheckpointsView component renders a list of future checkpoints
 * that the underlying Store can go forwards to.
 *
 * The component's props identify which future checkpoints to render based on
 * the Checkpoints object (which is either the default context Checkpoints
 * object, a named context Checkpoints object, or an explicit reference).
 *
 * This component renders a list by iterating over each checkpoints. By default
 * these are in turn rendered with the CheckpointView component, but you can
 * override this behavior by providing a `checkpointComponent` prop, a custom
 * component of your own that will render a checkpoint based on CheckpointProps.
 * You can also pass additional props to your custom component with the
 * `getCheckpointComponentProps` callback prop.
 *
 * This component uses the useCheckpointIds hook under the covers, which means
 * that any changes to the checkpoint Ids in the Checkpoints object will cause a
 * re-render.
 * @param props The props for this component.
 * @returns A rendering of the future checkpoints, if present.
 * @example
 * This example creates a Checkpoints object outside the application, which is
 * used in the ForwardCheckpointsView component by reference to render a list
 * of future checkpoints.
 *
 * ```jsx
 * import {createCheckpoints, createStore} from 'tinybase';
 * import {ForwardCheckpointsView} from 'tinybase/ui-react';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 * const App = () => (
 *   <div>
 *     <ForwardCheckpointsView checkpoints={checkpoints} separator="/" />
 *   </div>
 * );
 *
 * const app = document.createElement('div');
 * createRoot(app).render(<App />); // !act
 * console.log(app.innerHTML);
 * // -> '<div></div>'
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * checkpoints.goBackward(); // !act
 * console.log(app.innerHTML);
 * // -> '<div>sale</div>'
 *
 * checkpoints.goBackward(); // !act
 * console.log(app.innerHTML);
 * // -> '<div>identified/sale</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. The ForwardCheckpointsView component within it then
 * renders the list of future checkpoints (with Ids for readability).
 *
 * ```jsx
 * import {ForwardCheckpointsView, Provider} from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const Pane = () => (
 *   <div>
 *     <ForwardCheckpointsView debugIds={true} />
 *   </div>
 * );
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * checkpoints.goTo('0'); // !act
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div>1:{identified}2:{sale}</div>'
 * ```
 * @example
 * This example creates a Provider context into which a default Checkpoints
 * object is provided. The ForwardCheckpointsView component within it then
 * renders the list of future checkpoints with a custom Row component and a
 * custom props callback.
 *
 * ```jsx
 * import {
 *   CheckpointView,
 *   ForwardCheckpointsView,
 *   Provider,
 * } from 'tinybase/ui-react';
 * import {createCheckpoints, createStore} from 'tinybase';
 * import React from 'react';
 * import {createRoot} from 'react-dom/client';
 *
 * const App = ({checkpoints}) => (
 *   <Provider checkpoints={checkpoints}>
 *     <Pane />
 *   </Provider>
 * );
 * const getBoldProp = (checkpointId) => ({bold: checkpointId == '1'});
 * const Pane = () => (
 *   <div>
 *     <ForwardCheckpointsView
 *       checkpointComponent={FormattedCheckpointView}
 *       getCheckpointComponentProps={getBoldProp}
 *     />
 *   </div>
 * );
 * const FormattedCheckpointView = ({checkpoints, checkpointId, bold}) => (
 *   <span>
 *     {bold ? <b>{checkpointId}</b> : checkpointId}
 *     {': '}
 *     <CheckpointView
 *       checkpoints={checkpoints}
 *       checkpointId={checkpointId}
 *     />
 *   </span>
 * );
 *
 * const store = createStore().setTable('pets', {fido: {color: 'brown'}});
 * const checkpoints = createCheckpoints(store);
 *
 * store.setCell('pets', 'fido', 'species', 'dog'); // !act
 * checkpoints.addCheckpoint('identified'); // !act
 * store.setCell('pets', 'fido', 'sold', true); // !act
 * checkpoints.addCheckpoint('sale'); // !act
 * checkpoints.goTo('0'); // !act
 *
 * const app = document.createElement('div');
 * const root = createRoot(app);
 * root.render(<App checkpoints={checkpoints} />); // !act
 * console.log(app.innerHTML);
 * // -> '<div><span><b>1</b>: identified</span><span>2: sale</span></div>'
 * ```
 * @category Checkpoints components
 */
/// ForwardCheckpointsView
