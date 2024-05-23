# Using React Hooks

There are reactive hooks in the ui-react module for accessing every part of a
Store, as well as more advanced things like the Metrics and Indexes objects.

By reactive hooks, we mean that the hook not only fetches part of the Store, but
that it also registers a listener that will then cause a component to re-render
if the underlying value changes. Therefore, it's easy to describe a user
interface in terms of raw data in a Store, and know that it will stay updated
when the data changes.

To start with a simple example, we use the useCell hook in a component called
`App` to get the value of a Cell and render it in a `<span>` element. When the
Cell is updated, so is the HTML.

```jsx
import React from 'react';
import {createRoot} from 'react-dom/client';

const store = createStore().setCell('pets', 'fido', 'color', 'brown');
const App = () => <span>{useCell('pets', 'fido', 'color', store)}</span>;

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />); // !act
console.log(app.innerHTML);
// -> '<span>brown</span>'

store.setCell('pets', 'fido', 'color', 'walnut'); // !act
console.log(app.innerHTML);
// -> '<span>walnut</span>'
```

There are hooks that correspond to each of the Store getter methods:

- The useValues hook is the reactive equivalent of the getValues method.
- The useValueIds hook is the reactive equivalent of the getValueIds method.
- The useValue hook is the reactive equivalent of the getValue method.

And for tabular data:

- The useTables hook is the reactive equivalent of the getTables method.
- The useTableIds hook is the reactive equivalent of the getTableIds method.
- The useTable hook is the reactive equivalent of the getTable method.
- The useTableCellIds hook is the reactive equivalent of the getTableCellIds method.
- The useRowIds hook is the reactive equivalent of the getRowIds method.
- The useSortedRowIds hook is the reactive equivalent of the getSortedRowIds method.
- The useRow hook is the reactive equivalent of the getRow method.
- The useCellIds hook is the reactive equivalent of the getCellIds method.
- The useCell hook is the reactive equivalent of the getCell method.

They have the same return types. For example, the useTable hook returns an
object:

```jsx
const App2 = () => <span>{JSON.stringify(useTable('pets', store))}</span>;
root.render(<App2 />); // !act
console.log(app.innerHTML);
// -> '<span>{"fido":{"color":"walnut"}}</span>'

store.setCell('pets', 'fido', 'species', 'dog'); // !act
console.log(app.innerHTML);
// -> '<span>{"fido":{"color":"walnut","species":"dog"}}</span>'
```

When the component is unmounted, the listener will be automatically removed.
This means you can use these hooks without having to worry too much about the
lifecycle of how your component interacts with the Store.

## Using Hooks To Set Data

In an interactive application, you don't just want to read data. You also want
to be able to set it in response to user's actions. For this purpose, there is a
group of hooks that return callbacks for setting data based on events.

Let's start with a simple example, the useSetCellCallback hook. The Cell to be
updated needs to be identified by the Table, Row, and Cell Id parameters. The
fourth parameter to the hook is a parameterized callback (that will be memoized
based on the dependencies in the fifth parameter). The responsibility of that
function is to return the value that will be used to update the Cell.

It's probably easier to understand with an example:

```jsx
const App3 = () => {
  const handleClick = useSetCellCallback(
    'pets',
    'fido',
    'sold',
    (event) => event.bubbles,
    [],
    store,
  );
  return (
    <span>
      Sold: {useCell('pets', 'fido', 'sold', store) ? 'yes' : 'no'}
      <br />
      <button onClick={handleClick}>Sell</button>
    </span>
  );
};
root.render(<App3 />); // !act
console.log(app.innerHTML);
// -> '<span>Sold: no<br><button>Sell</button></span>'

const button = app.querySelector('button');
// User clicks the <button> element:
// -> button MouseEvent('click', {bubbles: true})

console.log(store.getTables());
// -> {pets: {fido: {color: 'walnut', species: 'dog', sold: true}}}
console.log(app.innerHTML);
// -> '<span>Sold: yes<br><button>Sell</button></span>'
```

In the real-world, a more valid case for using the event parameter might be to
handle the content of a text input to write into the Store. See the Todo demo
for a working example of doing that with the useAddRowCallback hook to add new
todos.

## Other Hook Types

The hooks to read and write Store data (described above) will be the ones you
most commonly use. For completeness, there are three other broad groups of
hooks. Firstly, there are those that create callbacks to delete data (such as
the useDelRowCallback hook), which should be self-explanatory.

Then there are hooks that are used to create objects (including Store objects,
but also Metrics, and Indexes objects, and so on). These are essentially
convenient aliases for memoization so that object creation can be performed
inside a component without fear of creating a new instance per render:

```jsx
const App4 = () => {
  const store = useCreateStore(() => {
    console.log('Store created');
    return createStore().setTables({pets: {fido: {species: 'dog'}}});
  });
  return <span>{store.getCell('pets', 'fido', 'species')}</span>;
};

root.render(<App4 />); // !act
// -> 'Store created'

root.render(<App4 />); // !act
// No second Store creation
```

There is also a final group of hooks that add listeners (such as the
useCellListener hook). Since the regular hooks (like the useCell hook) already
register listeners to track changes, you won't often need to use these unless
you need to establish a listener in a component that has some other side-effect,
such as mutating data to enforce a schema, for example.

## Summary

The hooks available in the ui-react module make it easy to connect your user
interface to TinyBase Store data. It also contains some convenient components
that you can use to build your user interface more declaratively. For that,
let's proceed to the Using React Components guide.
