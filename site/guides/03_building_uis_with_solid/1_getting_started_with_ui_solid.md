# Getting Started With ui-solid

To build Solid-based user interfaces with TinyBase, you will need to install
the ui-solid module in addition to the main module, and, of course, Solid
itself.

In a Solid component, you can get started with code like this:

```tsx
import {render} from 'solid-js/web';
import {createStore} from 'tinybase';
import {CellView} from 'tinybase/ui-solid';

const store = createStore();
store.setCell('t1', 'r1', 'c1', 'Hello World');

const app = document.createElement('div');
const dispose = render(
  () => <CellView tableId="t1" rowId="r1" cellId="c1" store={store} />,
  app,
);
console.log(app.innerHTML);
// -> 'Hello World'
dispose();
```

When this component renders, you will see the words 'Hello World' on the
screen, having been written to, and read from, a Store, and then rendered by the
CellView component from the ui-solid module.

The ui-solid module is designed around Solid's fine-grained reactivity model.
Instead of React-style hooks with dependency lists, it exposes primitives that
return Solid Accessor functions and view components that update when Store data
changes.

Let's move on to understand how the primitives work in the ui-solid module,
with the Using Solid Primitives guide.
