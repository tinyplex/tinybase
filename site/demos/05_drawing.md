# Drawing

In this demo, we build a more complex drawing app, using many of the features of
TinyBase together.

Note that this demo does not work particularly well on mobile devices, given its
use of drag and drop. Preferably try it out on a desktop browser.

## Boilerplate

First, we pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase/index.js"></script>
<script src="/umd/tinybase/persisters/persister-browser/index.js"></script>
<script src="/umd/tinybase/ui-react/index-debug.js"></script>
<script src="/umd/tinybase/ui-react-dom/index-debug.js"></script>
```

We'll use a good selection of the TinyBase API and the ui-react module:

```js
const {createCheckpoints, createRelationships, createStore} = TinyBase;
const {
  LinkedRowsView,
  Provider,
  useAddRowCallback,
  useCell,
  useCreateCheckpoints,
  useCreatePersister,
  useCreateRelationships,
  useCreateStore,
  useLinkedRowIds,
  useLocalRowIds,
  useRedoInformation,
  useRemoteRowId,
  useRow,
  useRowListener,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetPartialRowCallback,
  useStore,
  useUndoInformation,
} = TinyBaseUiReactDebug;
const {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = React;
const {createLocalPersister} = TinyBasePersisterBrowser;
const {StoreInspector} = TinyBaseUiReactDomDebug;
```

The drawing app relies heavily on being able to drag and drop shapes and their
resizing handles. We'll create a React hook called `useDraggableObject` that
returns a `ref` that can be used to attach this behavior to component. Nothing
about this is TinyBase-specific, so let's get it out of the way first.

```js
const useDraggableObject = (
  getInitial,
  onDrag,
  onDragStart = null,
  onDragStop = null,
) => {
  const [start, setStart] = useState();

  const handleMouseDown = useCallback(
    (event) => {
      onDragStart?.();
      setStart({
        x: event.clientX,
        y: event.clientY,
        initial: getInitial(),
      });
      event.stopPropagation();
    },
    [getInitial, onDragStart],
  );
  const handleMouseMove = useCallback(
    (event) => {
      if (start != null) {
        onDrag({
          dx: event.clientX - start.x,
          dy: event.clientY - start.y,
          initial: start.initial,
        });
      }
      event.stopPropagation();
    },
    [onDrag, start],
  );
  const handleMouseUp = useCallback(
    (event) => {
      setStart(null);
      onDragStop?.();
      event.stopPropagation();
    },
    [onDragStop],
  );

  const ref = useRef(null);
  useLayoutEffect(() => {
    const {current} = ref;
    current.addEventListener('mousedown', handleMouseDown);
    return () => current.removeEventListener('mousedown', handleMouseDown);
  }, [ref, handleMouseDown]);
  useEffect(() => {
    if (start != null) {
      addEventListener('mousemove', handleMouseMove);
      addEventListener('mouseup', handleMouseUp);
      return () => {
        removeEventListener('mousemove', handleMouseMove);
        removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [start, handleMouseMove, handleMouseUp]);

  return ref;
};
```

## Initialization

We have a selection of constants we will use throughout the app. The shapes will
live in a TinyBase table called `shapes`, the background canvas itself will
always be shape `0`, and shapes have a minimum size and one of two valid types:

```js
const SHAPES = 'shapes';
const CANVAS_ID = '0';
const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;
const TYPES = ['rectangle', 'ellipse'];
```

We will use mutator listeners to ensure that the type and color of the shapes
are always valid if present. These are the two functions to do that:

```js
const constrainType = (store, tableId, rowId, cellId, type) => {
  if (type != null && !TYPES.includes(type)) {
    store.setCell(tableId, rowId, cellId, TYPES[0]);
  }
};

const constrainColor = (store, tableId, rowId, cellId, color) => {
  if (color != null && !/^#[a-f\d]{6}$/.test(color)) {
    store.setCell(tableId, rowId, cellId, '#000000');
  }
};
```

At any given time, either a single shape is selected, or none are. We will set a
context for the whole app that will provide the `useState` value and setter pair
for the selected Id across the whole app:

```js
const SelectedIdContext = createContext([null, () => {}]);
const useSelectedIdState = () => useContext(SelectedIdContext);
```

As for the application itself, we start off by initializing the store in the
useCreateStore hook (so that it is memoized across renders), and immediately set
its schema. Every shape has two pairs of coordinates, text, a type, colors, and
a reference to the 'next' shape so they can be ordered in the z-index with a
linked list. We also use the two mutator listeners to programmatically guarantee
that types and colors are valid:

```js
const App = () => {
  const store = useCreateStore(() => {
    const store = createStore().setTablesSchema({
      [SHAPES]: {
        x1: {type: 'number', default: 100},
        y1: {type: 'number', default: 100},
        x2: {type: 'number', default: 300},
        y2: {type: 'number', default: 200},
        text: {type: 'string', default: 'text'},
        type: {type: 'string'},
        backColor: {type: 'string', default: '#0077aa'},
        textColor: {type: 'string', default: '#ffffff'},
        nextId: {type: 'string'},
      },
    });
    store.addCellListener(SHAPES, null, 'type', constrainType, true);
    store.addCellListener(SHAPES, null, 'backColor', constrainColor, true);
    store.addCellListener(SHAPES, null, 'textColor', constrainColor, true);
    return store;
  }, []);
  // ...
```

We want an undo stack, so we create a Checkpoints objects for this store, again
memoized with the useCreateCheckpoints hook. We also persist the shapes data to
local browser storage, and default it to a single shape on the canvas (which is
the start of the linked list of all the shapes, modelled with the Relationships
object):

```js
// ...
const checkpoints = useCreateCheckpoints(store, createCheckpoints);

useCreatePersister(
  store,
  (store) => createLocalPersister(store, 'drawing/store'),
  [],
  async (persister) => {
    await persister.startAutoLoad([
      {
        shapes: {
          [CANVAS_ID]: {x1: 0, y1: 0, nextId: '1', text: '[canvas]'},
          1: {},
        },
      },
    ]);
    checkpoints?.clear();
    await persister.startAutoSave();
  },
  [checkpoints],
);

const relationships = useCreateRelationships(store, (store) =>
  createRelationships(store).setRelationshipDefinition(
    'order',
    SHAPES,
    SHAPES,
    'nextId',
  ),
);
// ...
```

Finally we render the app, comprising a toolbar, the canvas, and the sidebar,
all wrapped in a Provider component to make sure our top-level objects are
defaulted throughout the app. The `SelectedIdContext` context provider also
passes a `useState` value and setter pair into the app:

```js
  // ...
  return (
    <Provider
      store={store}
      relationships={relationships}
      checkpoints={checkpoints}
    >
      <SelectedIdContext.Provider value={useState()}>
        <Toolbar />
        <Canvas />
        <Sidebar />
      </SelectedIdContext.Provider>
      <StoreInspector />
    </Provider>
  );
};
```

We also added the StoreInspector component at the end there so you can inspect
what is going on with the data during this demo. Simply click the TinyBase logo
in the corner.

Anyway, let's mount it into the DOM...

```jsx
addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

...and off we go.

## The Toolbar Component

The toolbar across the top of the app contains the undo and redo buttons, the
button to add a new shape - and, when a shape is selected, the stack order and
delete buttons

```jsx
const Toolbar = () => {
  const [useSelectedId] = useSelectedIdState();
  return (
    <div id="toolbar">
      <UndoRedo />
      <ShapeAdd />
      {useSelectedId == null ? null : (
        <>
          <ShapeOrder />
          <ShapeDelete />
        </>
      )}
    </div>
  );
};
```

The undo and redo buttons use the useUndoInformation hook and useRedoInformation
hook to disable or enable themselves, and handle the checkpoint moves
accordingly:

```jsx
const UndoRedo = () => {
  const [canUndo, handleUndo, , undoLabel] = useUndoInformation();
  const [canRedo, handleRedo, , redoLabel] = useRedoInformation();

  return (
    <>
      <div
        className={`button undo${canUndo ? '' : ' disabled'}`}
        {...(canUndo ? {onClick: handleUndo, title: `Undo ${undoLabel}`} : {})}
      />
      <div
        className={`button redo${canRedo ? '' : ' disabled'}`}
        {...(canRedo ? {onClick: handleRedo, title: `Redo ${redoLabel}`} : {})}
      />
    </>
  );
};
```

The button to add a new shape needs to know the current top of the z-index stack
(the `frontId`) upon which a new shape will be added, implemented by adding the
new shape's Id as the `nextId` Cell of the current top shape. It also selects
the new shape with the `setSelectedId` function. The useSetCheckpointCallback
hook is used to add the shape creation to the undo stack after the new shape Row
has been added via the callback from the useAddRowCallback hook:

```jsx
const ShapeAdd = () => {
  const frontId = useFrontId();
  const [, setSelectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(() => 'add shape', []);
  const onAddRow = useCallback(
    (id, store) => {
      store.setCell(SHAPES, frontId, 'nextId', id);
      setSelectedId(id);
      setCheckpoint();
    },
    [frontId, setSelectedId, setCheckpoint],
  );
  const handleClick = useAddRowCallback(
    SHAPES,
    () => ({}),
    [],
    null,
    onAddRow,
    [onAddRow],
  );
  return (
    <div className="button add" onClick={handleClick}>
      Add shape
    </div>
  );
};
```

We'll have these two hooks for getting the front and back shapes of the ordered stack.

```jsx
const useBackId = () => useLinkedRowIds('order', CANVAS_ID)[1];
const useFrontId = () => useLinkedRowIds('order', CANVAS_ID).slice(-1)[0];
```

There are four buttons for changing the shape order: move to back, move
backward, move forward, and move to front. Each of these change the order of the
linked list created by the `nextId` pointer in the `shapes` Table:

```jsx
const ShapeOrder = () => {
  const [selectedId] = useSelectedIdState();
  const frontId = useFrontId();
  const forwardId = useRemoteRowId('order', selectedId);
  const [previousId] = useLocalRowIds('order', selectedId);
  const [backwardId] = useLocalRowIds('order', previousId);
  const backId = useBackId();
  return [
    ['front', 'To front', frontId, useOrderShape(frontId, 'to front')],
    ['forward', 'Forward', frontId, useOrderShape(forwardId, 'forward')],
    ['backward', 'Backward', backId, useOrderShape(backwardId, 'backward')],
    ['back', 'To back', backId, useOrderShape(CANVAS_ID, 'to back')],
  ].map(([className, label, disabledIfId, handleClick]) => {
    const disabled = selectedId == null || selectedId == disabledIfId;
    return (
      <div
        className={`button ${className} ${disabled ? ' disabled' : ''}`}
        onClick={disabled ? null : handleClick}
        key={className}
      >
        {label}
      </div>
    );
  });
};
```

These changes are made with the `useOrderShape` hook. It batches the changes to
the `nextId` Cell values in a single transaction, accounting for edge cases like
moving a shape from the top of the stack, and sealing up the linked list after a
shape has been moved:

```jsx
const useOrderShape = (toId, label) => {
  const store = useStore();
  const [selectedId] = useSelectedIdState();
  const [previousId] = useLocalRowIds('order', selectedId);
  const nextId = useRemoteRowId('order', selectedId);
  const nextNextId = useRemoteRowId('order', toId);
  const setCheckpoint = useSetCheckpointCallback(() => `move ${label}`, []);
  return useCallback(() => {
    store.transaction(() => {
      if (nextId != null) {
        store.setCell(SHAPES, previousId, 'nextId', nextId);
      } else {
        store.delCell(SHAPES, previousId, 'nextId');
      }
      if (nextNextId != null) {
        store.setCell(SHAPES, selectedId, 'nextId', nextNextId);
      } else {
        store.delCell(SHAPES, selectedId, 'nextId');
      }
      store.setCell(SHAPES, toId, 'nextId', selectedId);
    });
    setCheckpoint();
  }, [selectedId, toId, store, previousId, nextId, nextNextId, setCheckpoint]);
};
```

The button to delete a shape needs to account for a shape being removed from the
linked list (and making its next shape the previous shape's next shape instead),
but otherwise it simply uses the delRow method to remove the record from the
table.

```jsx
const ShapeDelete = () => {
  const store = useStore();
  const [selectedId, setSelectedId] = useSelectedIdState();
  const [previousId] = useLocalRowIds('order', selectedId);
  const nextId = useRemoteRowId('order', selectedId);
  const setCheckpoint = useSetCheckpointCallback(() => 'delete', []);
  const handleClick = useCallback(() => {
    store.transaction(() => {
      if (nextId == null) {
        store.delCell(SHAPES, previousId, 'nextId');
      } else {
        store.setCell(SHAPES, previousId, 'nextId', nextId);
      }
      store.delRow(SHAPES, selectedId);
    });
    setCheckpoint();
    setSelectedId();
  }, [store, selectedId, setSelectedId, previousId, nextId, setCheckpoint]);
  return (
    <div className="button delete" onClick={handleClick}>
      Delete
    </div>
  );
};
```

That's the top toolbar taken care of. Try selecting, unselecting, and moving a
few shapes around to get a sense for what is happening with each of these
components. You can observe the resulting data structures by inspecting your
local storage with your browser developer tools.

## The Sidebar Component

The sidebar comprises controls to configure a shape's type, color and position
when selected:

```jsx
const Sidebar = () => {
  const [selectedId] = useSelectedIdState();
  return (
    <div id="sidebar">
      {selectedId == null ? null : (
        <>
          <SidebarTypeCell />
          <SidebarColorCell label="Text" cellId="textColor" />
          <SidebarColorCell label="Back" cellId="backColor" />
          <SidebarNumberCell label="Left" cellId="x1" />
          <SidebarNumberCell label="Top" cellId="y1" />
          <SidebarNumberCell label="Right" cellId="x2" />
          <SidebarNumberCell label="Bottom" cellId="y2" />
        </>
      )}
    </div>
  );
};
```

Each of these controls will be nested in a component to allow the CSS to lay
them out correctly:

```jsx
const SidebarCell = ({label, children}) => (
  <div className="cell">
    {label}: {children}
  </div>
);
```

First up, the control to configure a shape's type to be either a rectangle or an
ellipse. This is a dropdown of the `TYPES` values, which when selected, fires a
setCell method wrapped in a callback from the useSetCellCallback hook. The value
to set the `type` Cell is extracted from the event's `target.value`, and the
change is added to the undo stack after the change has been made, with the
callback from the useSetCheckpointCallback hook.

```jsx
const SidebarTypeCell = () => {
  const [selectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(() => 'change of type', []);
  return (
    <SidebarCell label="Shape">
      <select
        value={useCell(SHAPES, selectedId, 'type')}
        onChange={useSetCellCallback(
          SHAPES,
          selectedId,
          'type',
          (e) => e.target.value,
          [],
          null,
          setCheckpoint,
        )}
      >
        {TYPES.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>
    </SidebarCell>
  );
};
```

Setting the shape's two colors (stored in the `textColor` and `backColor` Cell
values) is done with the `SidebarColorCell` component. It also uses the
useSetCellCallback hook to get a callback that in this case uses the color
picker event's `target.value` - and again, the useSetCheckpointCallback hook to
add it to the undo stack after the change has been made:

```jsx
const SidebarColorCell = ({label, cellId}) => {
  const [selectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(
    () => `change of '${label.toLowerCase()}' color`,
    [label],
  );
  return (
    <SidebarCell label={label}>
      <input
        type="color"
        value={useCell(SHAPES, selectedId, cellId)}
        onChange={useSetCellCallback(
          SHAPES,
          selectedId,
          cellId,
          (e) => e.target.value,
          [],
          null,
          setCheckpoint,
        )}
      />
    </SidebarCell>
  );
};
```

And finally (and similarly), the `SidebarNumberCell` component displays and lets
you nudge the four numeric `x1`, `y1`, `x2`, and `y2` Cell values. One
interesting difference here is that the useSetCellCallback hook is passed not an
absolute number for those values, but a function that will nudge the value.

```jsx
const nudgeUp = (cell) => cell + 1;
const nudgeDown = (cell) => cell - 1;

const SidebarNumberCell = ({label, cellId}) => {
  const [selectedId] = useSelectedIdState();
  const setCheckpoint = useSetCheckpointCallback(
    () => `nudge of '${label.toLowerCase()}' value`,
    [label],
  );
  const handleDown = useSetCellCallback(
    SHAPES,
    selectedId,
    cellId,
    () => nudgeDown,
    [nudgeDown],
    null,
    setCheckpoint,
  );
  const handleUp = useSetCellCallback(
    SHAPES,
    selectedId,
    cellId,
    () => nudgeUp,
    [nudgeUp],
    null,
    setCheckpoint,
  );

  return (
    <SidebarCell label={label}>
      <div className="spin">
        <div className="button" onClick={handleDown}>
          -
        </div>
        {useCell(SHAPES, selectedId, cellId)}
        <div className="button" onClick={handleUp}>
          +
        </div>
      </div>{' '}
    </SidebarCell>
  );
};
```

## The Canvas Component

The canvas component is the main part of the application upon which the other
shapes appear. Its core implementation is essentially to render a LinkedRowsView
component using ordered view of the shapes according to the `nextId`-based
linked list.

However, it also includes additional complexity arising from the fact that we
enforce shapes to fit within the bounds of the canvas. This means two things:

- Firstly the canvas itself attaches mutator listeners to the Store with the
  useRowListener hook, so that shapes can never have `x` and `y` coordinates
  greater than its bounds when they change. The `getShapeDimensions` function
  also enforces the minimum width and height constraints for each shape.
- Secondly, the canvas must respond to DOM changes that affect its own size.
  This is done with the `updateDimensions` function, tracking the DOM with a
  `ResizeObserver`. Changes to the canvas size change both the mutator listeners
  for future shape moves, but also does a one-off sweep through the current
  objects to fit them into canvas in case it shrinks.

While this may seem a little complicated to describe, it's easier to see in
action. Try moving an object (or its handles) off the edge of the canvas. You'll
discover that you can't, since the mutator listeners are stopping any values
from exceeding the bounds. And then if you move a shape to the far-right of the
canvas and shrink your browser window, you will see the smaller canvas pulling
the shape in to fit.

Finally, the canvas listens to the `handleMouseDown` event so that if you click
anywhere on the app background, the current shape will get deselected.

```jsx
const Canvas = () => {
  const ref = useRef(null);
  const store = useStore();

  const [canvasDimensions, setCanvasDimensions] = useState([0, 0]);

  const getShapeDimensions = useCallback(
    (id, maxX, maxY) => {
      const {x1, x2, y1, y2} = store.getRow(SHAPES, id);
      const w = Math.max(x2 - x1, Math.min(MIN_WIDTH, maxX));
      const h = Math.max(y2 - y1, Math.min(MIN_HEIGHT, maxY));
      return {x1, x2, y1, y2, w, h};
    },
    [store],
  );

  useRowListener(
    SHAPES,
    null,
    (store, _tableId, rowId, getCellChange) => {
      const [maxX, maxY] = canvasDimensions;
      if (maxX == 0 || maxY == 0) {
        return;
      }

      const [x1Changed] = getCellChange(SHAPES, rowId, 'x1');
      const [x2Changed] = getCellChange(SHAPES, rowId, 'x2');
      const [y1Changed] = getCellChange(SHAPES, rowId, 'y1');
      const [y2Changed] = getCellChange(SHAPES, rowId, 'y2');
      if (
        (x1Changed || x2Changed || y1Changed || y2Changed) &&
        rowId != CANVAS_ID
      ) {
        const {x1, x2, y1, y2, w, h} = getShapeDimensions(rowId, maxX, maxY);
        if (x1Changed && x1 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'x1',
            between(x1, 0, Math.min(x2, maxX) - w),
          );
        }
        if (x2Changed && x2 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'x2',
            between(x2, Math.max(x1, 0) + w, maxX),
          );
        }
        if (y1Changed && y1 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'y1',
            between(y1, 0, Math.min(y2, maxY) - h),
          );
        }
        if (y2Changed && y2 != null) {
          store.setCell(
            SHAPES,
            rowId,
            'y2',
            between(y2, Math.max(y1, 0) + h, maxY),
          );
        }
      }
    },
    [...canvasDimensions, getShapeDimensions],
    true,
  );

  const updateDimensions = useCallback(
    (current) => {
      const {clientWidth: maxX, clientHeight: maxY} = current;
      setCanvasDimensions([maxX, maxY]);
      store.forEachRow(SHAPES, (id) => {
        if (id != CANVAS_ID) {
          const {x2, y2, w, h} = getShapeDimensions(id, maxX, maxY);
          if (x2 > maxX) {
            store.setPartialRow(SHAPES, id, {
              x1: Math.max(0, maxX - w),
              x2: maxX,
            });
          }
          if (y2 > maxY) {
            store.setPartialRow(SHAPES, id, {
              y1: Math.max(0, maxY - h),
              y2: maxY,
            });
          }
        }
      });
    },
    [store, getShapeDimensions],
  );

  useEffect(() => {
    const {current} = ref;
    const observer = new ResizeObserver(() => updateDimensions(current));
    observer.observe(current);
    updateDimensions(current);
    return () => observer.disconnect();
  }, [ref, store, updateDimensions]);

  const [, setSelectedId] = useSelectedIdState();
  const getRowComponentProps = useCallback((id) => ({id}), []);
  const handleMouseDown = useCallback(() => setSelectedId(), [setSelectedId]);
  const backId = useBackId();
  return (
    <div id="canvas" onMouseDown={handleMouseDown} ref={ref}>
      {backId == null ? null : (
        <LinkedRowsView
          relationshipId="order"
          firstRowId={backId}
          rowComponent={Shape}
          getRowComponentProps={getRowComponentProps}
        />
      )}
    </div>
  );
};

const between = (value, min, max) =>
  value < min ? min : value > max ? max : value;
```

## The Shape Component

Relatively speaking, each shape is quite a simple component. It uses the
`useSelectedIdState` hook to identify if it is selected (and show the
`ShapeGrips` resize handles if so).

It also uses the `useDraggableObject` hook we introduced at the start of the
demo to make itself movable via the `handleDrag` callback. When you finish a
drag, the `handleDragStop` callback records a checkpoint so that you can undo
a whole dragging movement.

```jsx
const Shape = ({id}) => {
  const [selectedId, setSelectedId] = useSelectedIdState();
  const selected = id == selectedId;
  const {x1, y1, x2, y2, backColor, type} = useRow(SHAPES, id);

  const store = useStore();
  const getInitial = useCallback(() => store.getRow(SHAPES, id), [store, id]);

  const handleDrag = useSetPartialRowCallback(
    SHAPES,
    id,
    ({dx, dy, initial}) => ({
      x1: initial.x1 + dx,
      y1: initial.y1 + dy,
      x2: initial.x2 + dx,
      y2: initial.y2 + dy,
    }),
    [],
  );
  const handleDragStart = useCallback(
    () => setSelectedId(id),
    [setSelectedId, id],
  );
  const handleDragStop = useSetCheckpointCallback(() => 'drag', []);
  const ref = useDraggableObject(
    getInitial,
    handleDrag,
    handleDragStart,
    handleDragStop,
  );

  const style = {
    left: `${x1}px`,
    top: `${y1}px`,
    width: `${x2 - x1}px`,
    height: `${y2 - y1}px`,
    background: backColor,
  };

  return (
    <>
      <div
        ref={ref}
        className={`shape ${type}${selected ? ' selected' : ''}`}
        style={style}
      >
        <ShapeText id={id} />
      </div>
      {selected ? <ShapeGrips id={id} /> : null}
    </>
  );
};
```

Inside the shape, the ShapeText component shows a text label, which, when
double-clicked, sets the `editing` state to `true`, and becomes editable by
turning into an `<input>` component. And once again, the
useSetCheckpointCallback hook provides a callback to add text changes to the
undo stack.

```jsx
const ShapeText = ({id}) => {
  const {text, textColor} = useRow(SHAPES, id);
  const ref = useRef();
  const [editing, setEditing] = useState(false);
  const setCheckpoint = useSetCheckpointCallback(() => 'edit text', []);
  const handleDoubleClick = useCallback(() => setEditing(true), []);
  const handleBlur = useCallback(() => {
    setEditing(false);
    setCheckpoint();
  }, [setCheckpoint]);
  const handleChange = useSetCellCallback(
    SHAPES,
    id,
    'text',
    (e) => e.target.value,
    [],
  );
  const handleKeyDown = useCallback((e) => {
    if (e.which == 13) {
      e.target.blur();
    }
  }, []);

  useEffect(() => {
    if (editing) {
      ref.current.focus();
    }
  }, [editing, ref]);

  const style = {color: textColor};

  return editing ? (
    <input
      ref={ref}
      style={style}
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  ) : (
    <span style={style} onDoubleClick={handleDoubleClick}>
      {text != '' ? text : '\xa0'}
    </span>
  );
};
```

## The Shape Grips

When selected, a shape has eight handles for resizing it. Clockwise from top
left, these adjust the `x1,y1` coordinates, the `y1` coordinate alone, the
`y1,x2` coordinates, the `y2` coordinate alone, and so on. Each also has a
different resizing cursor style to make it evident how they can move:

```jsx
const ShapeGrips = ({id}) => {
  const {x1, y1, x2, y2} = useRow(SHAPES, id);
  const xm = (x1 + x2) / 2;
  const ym = (y1 + y2) / 2;
  return (
    <>
      <Grip m={[1, 1, 0, 0]} id={id} x={x1} y={y1} d="nwse" />
      <Grip m={[0, 1, 0, 0]} id={id} x={xm} y={y1} d="ns" />
      <Grip m={[0, 1, 1, 0]} id={id} x={x2} y={y1} d="nesw" />
      <Grip m={[0, 0, 1, 0]} id={id} x={x2} y={ym} d="ew" />
      <Grip m={[0, 0, 1, 1]} id={id} x={x2} y={y2} d="nwse" />
      <Grip m={[0, 0, 0, 1]} id={id} x={xm} y={y2} d="ns" />
      <Grip m={[1, 0, 0, 1]} id={id} x={x1} y={y2} d="nesw" />
      <Grip m={[1, 0, 0, 0]} id={id} x={x1} y={ym} d="ew" />
    </>
  );
};
```

Each grip itself is a small `<div>` element, made draggable with the
`useDraggableObject` hook, and affecting the underlying shape's coordinates
according to the 4-item `m` array passed in from the `ShapeGrips` component. Of
course, the `useSetCheckpointCallback` hook also means that resizes get added to
the undo stack:

```jsx
const Grip = ({m: [mx1, my1, mx2, my2], id, x, y, d}) => {
  const store = useStore();
  const getInitial = useCallback(() => store.getRow(SHAPES, id), [store, id]);

  const handleDrag = useSetPartialRowCallback(
    SHAPES,
    id,
    ({dx, dy, initial}) => ({
      x1: initial.x1 + dx * mx1,
      y1: initial.y1 + dy * my1,
      x2: initial.x2 + dx * mx2,
      y2: initial.y2 + dy * my2,
    }),
    [mx1, my1, mx2, my2],
  );
  const handleDragStop = useSetCheckpointCallback(() => 'resize', []);

  return (
    <div
      ref={useDraggableObject(getInitial, handleDrag, null, handleDragStop)}
      className="grip"
      style={{left: `${x}px`, top: `${y}px`, cursor: `${d}-resize`}}
    />
  );
};
```

## The Styling

Finally we style the app with some LESS. This should be mostly self-explanatory,
including the SVG for the button icons.

```less
@accentColor: #d81b60;
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}
* {
  box-sizing: border-box;
  outline-color: @accentColor;
}

body {
  user-select: none;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 10rem;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  font-size: 0.8rem;
  margin: 0;
  height: 100vh;

  #toolbar {
    z-index: 2;
    grid-column: span 2;
    background: #ddd;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #aaa;
    > .button {
      cursor: pointer;
      line-height: 1rem;
      white-space: nowrap;
      border-right: 1px solid #aaa;
      padding: 0.5rem;
      &:hover {
        background: #ccc;
      }
      &::before {
        vertical-align: top;
        width: 1rem;
        height: 1rem;
        display: inline-block;
      }
      &.undo::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><path fill="none" d="M25 50a42 42 0 0 1 60 0" /><path d="M14 41v20 h20z" /></svg>');
      }
      &.redo::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><path fill="none" d="M15 50a42 42 0 0 1 60 0" /><path d="M86 41v20 h-20z" /></svg>');
      }
      &.add::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><rect x="20" y="20" width="60" height="60" fill="white"/><path d="M50 30v40M30 50h40" /></svg>');
      }
      &.front::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><rect x="2" y="2" width="40" height="40" fill="grey"/><rect x="58" y="58" width="40" height="40" fill="grey"/><rect x="20" y="20" width="60" height="60" fill="white"/></svg>');
      }
      &.forward::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><rect x="11" y="11" width="60" height="60" fill="grey"/><rect x="29" y="29" width="60" height="60" fill="white"/></svg>');
      }
      &.backward::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><rect x="11" y="11" width="60" height="60" fill="white"/><rect x="29" y="29" width="60" height="60" fill="grey"/></svg>');
      }
      &.back::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><rect x="20" y="20" width="60" height="60" fill="white"/><rect x="2" y="2" width="40" height="40" fill="grey"/><rect x="58" y="58" width="40" height="40" fill="grey"/></svg>');
      }
      &.delete::before {
        content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" stroke-width="4" stroke="black"><rect x="20" y="20" width="60" height="60" fill="white"/><path d="M30 30l40 40M30 70l40-40" /></svg>');
      }
      &.disabled {
        opacity: 0.5;
        cursor: default;
        &:hover {
          background: none;
        }
      }
    }
  }

  #sidebar {
    z-index: 1;
    background: #eee;
    padding: 0.5rem;
    border-left: 1px solid #aaa;
    .cell {
      height: 2rem;
      text-align: right;
      select,
      input,
      .spin {
        font: inherit;
        letter-spacing: -0.05rem;
        margin-left: 5px;
        width: 4.5rem;
        height: 1.4rem;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        .button {
          cursor: pointer;
          border: 1px solid #aaa;
          font: inherit;
          width: 1rem;
          text-align: center;
          &:hover {
            background: #ccc;
          }
        }
      }
    }
  }

  #canvas {
    position: relative;
    z-index: 0;
    .shape {
      align-items: center;
      background: white;
      border: 1px solid black;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      position: absolute;
      overflow: hidden;
      white-space: nowrap;
      z-index: 1;
      &.ellipse {
        border-radius: 50%;
      }
      &.selected {
        cursor: move;
      }
      input,
      span {
        background: transparent;
        border: none;
        font: inherit;
        width: 100%;
        text-align: center;
        margin: 0.5rem;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .grip {
      background: white;
      border: 1px solid @accentColor;
      box-sizing: border-box;
      height: 6px;
      margin: -3px;
      position: absolute;
      width: 6px;
      z-index: 2;
    }
  }
}
```

## That's It!

That's the drawing app.

Admittedly, there was a lot going on in here: a demonstration of a
Relationships-based linked list, an undo stack, plenty of callbacks, and React
hooks galore. On the other hand, we have a fast, and functional drawing
application that makes the most of the structured data store underneath.
Hopefully that all made sense.
