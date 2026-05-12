# Using Solid Components

The view components in the ui-solid module let you declaratively display parts
of a Store.

These components wrap the primitives we described in the previous guide and
render TinyBase data directly into a Solid component tree. For common rendering
tasks, they make it easy to compose UIs from Store data:

```tsx
import {render} from 'solid-js/web';
import {createStore} from 'tinybase';
import {CellView, RowView, TablesView} from 'tinybase/ui-solid';

const store = createStore().setTables({
  pets: {
    fido: {species: 'dog', color: 'brown'},
    felix: {species: 'cat', color: 'black'},
  },
});

const app = document.createElement('div');
const dispose = render(
  () => <CellView tableId="pets" rowId="fido" cellId="species" store={store} />,
  app,
);
console.log(app.innerHTML);
// -> 'dog'
dispose();
```

Like the components in the other UI modules, these have intentionally plain
default renderings. For example, RowView concatenates the rendered Cells in a
Row, while TablesView concatenates the rendered Tables in a Store. The
`separator` and `debugIds` props are often useful while prototyping:

```tsx
const app2 = document.createElement('div');
const dispose2 = render(
  () => <RowView tableId="pets" rowId="fido" store={store} separator="/" />,
  app2,
);
console.log(app2.innerHTML);
// -> 'dog/brown'
dispose2();
```

Going further, the `debugIds` prop helps you see the structure of the objects
with their Ids:

```tsx
const app3 = document.createElement('div');
const dispose3 = render(
  () => <TablesView store={store} separator="/" debugIds={true} />,
  app3,
);
console.log(app3.innerHTML);
// -> 'pets:{fido:{species:{dog}color:{brown}}felix:{species:{cat}color:{black}}}'
dispose3();
```

## Customizing View Components

The hierarchical view components can be customized with component props such as
`cellComponent`, `rowComponent`, `tableComponent`, and their matching
`get*ComponentProps` helpers.

This RowView example overrides how each Cell is rendered:

```tsx
const CellWithId = (props) =>
  `${props.cellId}: ${store.getCell(props.tableId, props.rowId, props.cellId)}`;

const app4 = document.createElement('div');
const dispose4 = render(
  () => (
    <RowView
      tableId="pets"
      rowId="fido"
      store={store}
      cellComponent={CellWithId}
      separator="/"
    />
  ),
  app4,
);
console.log(app4.innerHTML);
// -> 'species: dog/color: brown'
dispose4();
```

The full set of view components covers every level of the Store hierarchy and
the higher-level TinyBase objects. For the full API reference, see the ui-solid
module documentation.

## Summary

The ui-solid module mirrors the component model of ui-react, but the reactive
work underneath uses Solid primitives and Accessors. If you want
browser-oriented table components next, proceed to the Using Solid DOM
Components guide.
