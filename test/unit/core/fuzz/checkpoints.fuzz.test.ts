import type {
  Cell,
  Checkpoints,
  Content,
  Id,
  IdOrNull,
  Ids,
  Row,
  Store,
  Table,
  Tables,
  Values,
} from 'tinybase';
import {createCheckpoints, createStore} from 'tinybase';
import {test} from 'vitest';
import type {Random, Trace} from '../../common/fuzz.ts';
import {code, expectSame, forEachSeed} from '../../common/fuzz.ts';

// Seeded fuzz tests for the Checkpoints module. Each applies a long random
// sequence of changes to a Store, interleaved with calls to its Checkpoints
// object, and checks what happens against a small model of the documented
// behaviour, which is this:
//
// - A checkpoint is the content of the Store at the moment it was added.
// - The checkpoints are a timeline: those to go backward to, then the current
//   one, then those to go forward to. Moving along it sets the content of the
//   Store to that of the checkpoint arrived at, and changes nothing else.
// - When the Store comes to differ from the current checkpoint, that becomes
//   the last one to go backward to, those to go forward to are forgotten, and
//   there is no current checkpoint until one is added, or until the Store is
//   returned to that content.
// - Going backward with such changes pending first adds a checkpoint of them.
// - No more checkpoints to go backward to are kept than the size, the oldest
//   being forgotten when the Store changes or the size is set.

const OPERATIONS = 50;

const CELL_IDS: {[tableId: Id]: Ids} = {
  pets: ['species', 'price', 'sold'],
  species: ['price', 'legs'],
};
const ROW_IDS: {[tableId: Id]: Ids} = {
  pets: ['fido', 'felix', 'cujo'],
  species: ['dog', 'cat'],
};
const TABLE_IDS = Object.keys(CELL_IDS);
const VALUE_IDS = ['open', 'employees', 'motto'];
const CELLS: Cell[] = [
  true,
  false,
  1,
  2,
  'dog',
  'cat',
  null,
  ['brown'],
  ['brown', 'white'],
  {breed: 'pug'},
];
const LABELS = ['', 'sale', 'restock', 'audit'];

// Whether a Cell or Value is an object or an array.
const isRich = (thing: unknown): thing is {[key: string]: unknown} =>
  thing !== null && typeof thing == 'object';

const clone = <Thing>(thing: Thing): Thing =>
  (Array.isArray(thing)
    ? thing.map(clone)
    : isRich(thing)
      ? Object.fromEntries(
          Object.entries(thing).map(([key, child]) => [key, clone(child)]),
        )
      : thing) as Thing;

// Whether two things are the same, whatever order their Ids were added in.
const isSame = (thing1: unknown, thing2: unknown): boolean => {
  if (!isRich(thing1) || !isRich(thing2)) {
    return thing1 === thing2;
  }
  const keys = Object.keys(thing1);
  return (
    Array.isArray(thing1) == Array.isArray(thing2) &&
    keys.length == Object.keys(thing2).length &&
    keys.every((key) => key in thing2 && isSame(thing1[key], thing2[key]))
  );
};

// Checks that two things are deeply equal. This is expectSame, which it leaves
// to say so when they are not, but it is far quicker for large things that
// are, as these nearly always will be.
const expectAlike = (
  actual: unknown,
  expected: unknown,
  message: string,
): void => {
  if (!isSame(actual, expected)) {
    expectSame(actual, expected, message);
  }
};

// -- A model of the content of a Store

// A change to make to a Store: the name of one of its methods, and arguments.
type Step = [method: string, ...args: any[]];

// What each of those methods is documented to do to the content.
const STEPS: {[method: string]: (content: Content, ...args: any[]) => void} = {
  setContent: (content, [tables, values]) => {
    content[0] = tables;
    content[1] = values;
  },
  setTables: (content, tables) => (content[0] = tables),
  delTables: (content) => (content[0] = {}),
  setTable: ([tables], tableId, table) => (tables[tableId] = table),
  delTable: ([tables], tableId) => delete tables[tableId],
  setRow: ([tables], tableId, rowId, row) =>
    ((tables[tableId] ??= {})[rowId] = row),
  setPartialRow: ([tables], tableId, rowId, row) =>
    Object.assign(((tables[tableId] ??= {})[rowId] ??= {}), row),
  delRow: ([tables], tableId, rowId) => delete tables[tableId]?.[rowId],
  setCell: ([tables], tableId, rowId, cellId, cell) =>
    (((tables[tableId] ??= {})[rowId] ??= {})[cellId] = cell),
  delCell: ([tables], tableId, rowId, cellId) =>
    delete tables[tableId]?.[rowId]?.[cellId],
  setValues: (content, values) => (content[1] = values),
  setPartialValues: ([, values], partialValues) =>
    Object.assign(values, partialValues),
  delValues: (content) => (content[1] = {}),
  setValue: ([, values], valueId, value) => (values[valueId] = value),
  delValue: ([, values], valueId) => delete values[valueId],
};

const applySteps = (content: Content, steps: Step[]): void =>
  steps.forEach(([method, ...args]) => {
    STEPS[method](content, ...clone(args));
    // A Row with no Cells does not exist, and nor does a Table with no Rows.
    const [tables] = content;
    Object.entries(tables).forEach(([tableId, table]) => {
      Object.entries(table).forEach(([rowId, row]) => {
        if (Object.keys(row).length == 0) {
          delete table[rowId];
        }
      });
      if (Object.keys(table).length == 0) {
        delete tables[tableId];
      }
    });
  });

// The steps, each for one Cell or Value, that turn one content into another.
const getDifference = (from: Content, to: Content): Step[] => {
  const steps: Step[] = [];
  const getIds = (...objects: ({[id: Id]: unknown} | undefined)[]): Ids => [
    ...new Set(objects.flatMap((object) => Object.keys(object ?? {}))),
  ];
  getIds(from[0], to[0]).forEach((tableId) =>
    getIds(from[0][tableId], to[0][tableId]).forEach((rowId) => {
      const fromRow = from[0][tableId]?.[rowId] ?? {};
      const toRow = to[0][tableId]?.[rowId] ?? {};
      getIds(fromRow, toRow).forEach((cellId) => {
        if (!isSame(fromRow[cellId], toRow[cellId])) {
          steps.push(
            cellId in toRow
              ? ['setCell', tableId, rowId, cellId, toRow[cellId]]
              : ['delCell', tableId, rowId, cellId],
          );
        }
      });
    }),
  );
  getIds(from[1], to[1]).forEach((valueId) => {
    if (!isSame(from[1][valueId], to[1][valueId])) {
      steps.push(
        valueId in to[1]
          ? ['setValue', valueId, to[1][valueId]]
          : ['delValue', valueId],
      );
    }
  });
  return steps;
};

// The Cell or Value that such a step is for.
const getPlace = ([method, ...args]: Step): string =>
  method.slice(3) + ':' + args.slice(0, method.endsWith('Cell') ? 3 : 1);

// -- A model of the checkpoints of a Store

type Model = {
  // The content the Store should have.
  content: Content;
  // The content it had at the last checkpoint.
  base: Content;
  size: number;
  nextId: number;
  backwardIds: Ids;
  currentId: Id | undefined;
  forwardIds: Ids;
  labels: Map<Id, string>;
  contents: Map<Id, Content>;
};

const modelForget = (model: Model, checkpointIds: Ids): void =>
  checkpointIds.forEach((checkpointId) => {
    model.labels.delete(checkpointId);
    model.contents.delete(checkpointId);
  });

const modelPrune = (model: Model): void =>
  modelForget(
    model,
    model.backwardIds.splice(
      0,
      Math.max(model.backwardIds.length - model.size, 0),
    ),
  );

// To be called whenever the content of the Store may have changed.
const modelStoreChanged = (model: Model): void => {
  const isPending = !isSame(model.content, model.base);
  if (model.currentId !== undefined && isPending) {
    model.backwardIds.push(model.currentId);
    modelPrune(model);
    modelForget(model, model.forwardIds.splice(0));
    model.currentId = undefined;
  } else if (model.currentId === undefined && !isPending) {
    model.currentId = model.backwardIds.pop();
  }
};

const modelAddCheckpoint = (model: Model, label = ''): Id => {
  if (model.currentId === undefined) {
    model.currentId = '' + model.nextId++;
    model.labels.set(model.currentId, label);
    model.contents.set(model.currentId, clone(model.content));
    model.base = clone(model.content);
  }
  return model.currentId;
};

const modelSetCheckpoint = (model: Model, checkpointId: Id, label: string) => {
  if (model.labels.has(checkpointId)) {
    model.labels.set(checkpointId, label);
  }
};

const modelGoTo = (model: Model, checkpointId: Id | undefined): void => {
  if (
    checkpointId !== undefined &&
    (model.backwardIds.includes(checkpointId) ||
      model.forwardIds.includes(checkpointId))
  ) {
    const timeline = [
      ...model.backwardIds,
      modelAddCheckpoint(model),
      ...model.forwardIds,
    ];
    const index = timeline.indexOf(checkpointId);
    model.backwardIds = timeline.slice(0, index);
    model.currentId = checkpointId;
    model.forwardIds = timeline.slice(index + 1);
    model.content = clone(model.contents.get(checkpointId) as Content);
    model.base = clone(model.content);
  }
};

const modelClear = (model: Model): void => {
  model.backwardIds = [];
  model.currentId = undefined;
  model.forwardIds = [];
  model.labels.clear();
  model.contents.clear();
  model.nextId = 0;
  modelAddCheckpoint(model);
};

const createModel = (content: Content): Model => {
  const model: Model = {
    content: clone(content),
    base: clone(content),
    size: 100,
    nextId: 0,
    backwardIds: [],
    currentId: undefined,
    forwardIds: [],
    labels: new Map(),
    contents: new Map(),
  };
  modelAddCheckpoint(model);
  return model;
};

// What each method of a Checkpoints object is documented to do. Each returns
// what the method should, if that is not the Checkpoints object itself.
const CALLS: {[method: string]: (model: Model, ...args: any[]) => unknown} = {
  addCheckpoint: modelAddCheckpoint,
  setCheckpoint: modelSetCheckpoint,
  goBackward: (model) => modelGoTo(model, model.backwardIds.at(-1)),
  goForward: (model) => modelGoTo(model, model.forwardIds[0]),
  goTo: modelGoTo,
  clear: modelClear,
  clearForward: (model) => modelForget(model, model.forwardIds.splice(0)),
  setSize: (model, size) => {
    model.size = size;
    modelPrune(model);
  },
};

// -- Random content

const getRandomCell = (random: Random): Cell => clone(random.pick(CELLS));

const getRandomObject = <Thing>(
  random: Random,
  ids: Ids,
  getThing: (id: Id) => Thing,
): {[id: Id]: Thing} =>
  Object.fromEntries(
    random
      .shuffle(ids)
      .slice(0, 1 + random.int(ids.length))
      .map((id) => [id, getThing(id)]),
  );

const getRandomRow = (random: Random, tableId: Id): Row =>
  getRandomObject(random, CELL_IDS[tableId], () => getRandomCell(random));

const getRandomTable = (random: Random, tableId: Id): Table =>
  getRandomObject(random, ROW_IDS[tableId], () =>
    getRandomRow(random, tableId),
  );

const getRandomTables = (random: Random): Tables =>
  getRandomObject(random, TABLE_IDS, (tableId) =>
    getRandomTable(random, tableId),
  );

const getRandomValues = (random: Random): Values =>
  getRandomObject(random, VALUE_IDS, () => getRandomCell(random));

const getRandomContent = (random: Random): Content => [
  random.bool(0.7) ? getRandomTables(random) : {},
  random.bool(0.7) ? getRandomValues(random) : {},
];

const getRandomStep = (random: Random): Step => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS[tableId]);
  const cellId = random.pick(CELL_IDS[tableId]);
  const valueId = random.pick(VALUE_IDS);
  return random.weighted<() => Step>([
    [12, () => ['setCell', tableId, rowId, cellId, getRandomCell(random)]],
    [4, () => ['delCell', tableId, rowId, cellId]],
    [3, () => ['setRow', tableId, rowId, getRandomRow(random, tableId)]],
    [2, () => ['setPartialRow', tableId, rowId, getRandomRow(random, tableId)]],
    [2, () => ['delRow', tableId, rowId]],
    [1, () => ['setTable', tableId, getRandomTable(random, tableId)]],
    [1, () => ['delTable', tableId]],
    [1, () => ['setTables', getRandomTables(random)]],
    [1, () => ['delTables']],
    [10, () => ['setValue', valueId, getRandomCell(random)]],
    [4, () => ['delValue', valueId]],
    [2, () => ['setValues', getRandomValues(random)]],
    [2, () => ['setPartialValues', getRandomValues(random)]],
    [1, () => ['delValues']],
    [1, () => ['setContent', getRandomContent(random)]],
  ])();
};

// -- A Store and its Checkpoints, and the model of them both

// One or more steps, and how they are made: one alone, or else together in a
// transaction that commits, or that is rolled back, or that throws.
type Change = {steps: Step[]; how: 'alone' | 'commit' | 'rollback' | 'throw'};

type Limits = {
  // Never forgets a checkpoint by clearing them or by setting the size.
  keepsHistory?: boolean;
  // Leaves out what is known to call a CheckpointIdsListener wrongly.
  exactIdsListeners?: boolean;
};

const createWorld = (random: Random, trace: Trace, limits: Limits = {}) => {
  const initialContent = getRandomContent(random);
  trace(`const store = createStore().setContent(${code(initialContent)});`);
  const store: Store = createStore().setContent(clone(initialContent));
  trace('const checkpoints = createCheckpoints(store);');
  const checkpoints: Checkpoints = createCheckpoints(store);
  const model = createModel(initialContent);
  let probes = 0;

  // Checks that everything visible is as the model says it should be.
  const verify = (): void => {
    probes = Math.max(probes, model.nextId + 1);
    const probeIds = [
      ...Array.from({length: probes}, (_, id) => '' + id),
      'nope',
      '',
    ];
    const labels: [Id, string | undefined][] = [];
    checkpoints.forEachCheckpoint((checkpointId, label) =>
      labels.push([checkpointId, label]),
    );
    expectAlike(
      {
        content: store.getContent(),
        checkpointIds: checkpoints.getCheckpointIds(),
        labels: labels.sort(),
        probes: probeIds.map((checkpointId) => [
          checkpointId,
          checkpoints.hasCheckpoint(checkpointId),
          checkpoints.getCheckpoint(checkpointId),
        ]),
      },
      {
        content: model.content,
        checkpointIds: [model.backwardIds, model.currentId, model.forwardIds],
        labels: [...model.labels].sort(),
        probes: probeIds.map((checkpointId) => [
          checkpointId,
          model.labels.has(checkpointId),
          model.labels.get(checkpointId),
        ]),
      },
      'the Store and its Checkpoints, against the model',
    );
  };

  // Whether a change to the Store would undo every change pending since the
  // last checkpoint, while making another.
  const undoesPendingForAnother = (nextContent: Content): boolean => {
    const pending = getDifference(model.base, model.content).map(getPlace);
    const nextPending = getDifference(model.base, nextContent).map(getPlace);
    return (
      pending.length > 0 &&
      nextPending.length > 0 &&
      !pending.some((place) => nextPending.includes(place))
    );
  };

  // Makes a change to the Store, unless it is one to be left out.
  const change = ({steps, how}: Change): boolean => {
    const changedContent = clone(model.content);
    applySteps(changedContent, steps);
    const isUndone = how == 'rollback' || how == 'throw';
    const nextContent = isUndone ? model.content : changedContent;
    // KNOWN BUG ids-listener-transient: remove this restriction once fixed.
    if (limits.exactIdsListeners && undoesPendingForAnother(nextContent)) {
      return false;
    }

    const statements = steps
      .map(([method, ...args]) => `store.${method}(${args.map(code)});`)
      .join(' ');
    const makeSteps = () =>
      steps.forEach(([method, ...args]) =>
        (store as any)[method](...clone(args)),
      );
    if (how == 'alone') {
      trace(statements);
      makeSteps();
    } else if (how == 'commit') {
      trace(`store.transaction(() => {${statements}});`);
      store.transaction(makeSteps);
    } else if (how == 'rollback') {
      trace(`store.transaction(() => {${statements}}, () => true);`);
      store.transaction(makeSteps, () => true);
    } else {
      trace(
        `try {store.transaction(() => {${statements} throw new Error();});} ` +
          'catch {}',
      );
      const error = new Error();
      let caught: unknown;
      try {
        store.transaction(() => {
          makeSteps();
          throw error;
        });
      } catch (thrown) {
        caught = thrown;
      }
      expectAlike(caught === error, true, 'the transaction throws');
    }

    model.content = nextContent;
    modelStoreChanged(model);
    verify();
    return true;
  };

  // Adds a Row to the Store, with whichever Id the Store gives it.
  const addRow = (): void => {
    const tableId = random.pick(TABLE_IDS);
    const row = getRandomRow(random, tableId);
    trace(`store.addRow(${code(tableId)}, ${code(row)});`);
    const rowId = store.addRow(tableId, clone(row)) as Id;
    (model.content[0][tableId] ??= {})[rowId] = row;
    modelStoreChanged(model);
    verify();
  };

  // Calls a method of the Checkpoints object.
  const call = (method: string, ...args: unknown[]): void => {
    trace(`checkpoints.${method}(${args.map(code)});`);
    const returned = (checkpoints as any)[method](...args);
    const expected = CALLS[method](model, ...args) ?? checkpoints;
    expectAlike(returned === expected, true, `what ${method} returns`);
    verify();
  };

  // Asks for the Checkpoints object again, perhaps after destroying it.
  const recreate = (): void => {
    if (random.bool()) {
      trace('checkpoints.destroy();');
      checkpoints.destroy();
    }
    trace('createCheckpoints(store);');
    expectAlike(
      createCheckpoints(store) === checkpoints,
      true,
      'the same Checkpoints object',
    );
    const {cell, value} = store.getListenerStats();
    expectAlike([cell, value], [1, 1], 'listeners to the Store');
    verify();
  };

  const getRandomChange = (): Change => {
    const undo = random.shuffle(getDifference(model.content, model.base));
    const some = 1 + random.int(undo.length);
    const getSteps = (most: number): Step[] =>
      Array.from({length: 1 + random.int(most)}, () => getRandomStep(random));
    return random.weighted<() => Change>([
      // One step.
      [10, () => ({steps: getSteps(1), how: 'alone'})],
      // Several steps together, that might then be rolled back.
      [
        5,
        () => ({
          steps: getSteps(4),
          how: random.weighted([
            [6, 'commit'],
            [1, 'rollback'],
            [1, 'throw'],
          ]),
        }),
      ],
      // Undoing one of the changes pending since the last checkpoint.
      [undo.length && 3, () => ({steps: undo.slice(0, 1), how: 'alone'})],
      // Undoing some or all of them together.
      [undo.length && 2, () => ({steps: undo.slice(0, some), how: 'commit'})],
      // Undoing all of them at once.
      [
        undo.length && 1,
        () => ({steps: [['setContent', clone(model.base)]], how: 'alone'}),
      ],
      // Undoing some or all of them, while changing something else.
      [
        undo.length && 2,
        () => ({
          steps: random.shuffle([...undo.slice(0, some), ...getSteps(2)]),
          how: 'commit',
        }),
      ],
    ])();
  };

  // A checkpoint Id, most often one that exists.
  const getRandomId = (): Id =>
    random.weighted<() => Id>([
      [8, () => random.pick([...model.labels.keys()])],
      [1, () => '' + random.int(model.nextId + 2)],
      [1, () => random.pick(['', 'nope'])],
    ])();

  const getRandomSize = (): number => random.pick([0, 1, 2, 3, 4, 100, 100]);

  const getRandomCall = (): [method: string, ...args: unknown[]] =>
    random.weighted<() => [method: string, ...args: unknown[]]>([
      [5, () => ['addCheckpoint']],
      [3, () => ['addCheckpoint', random.pick(LABELS)]],
      [5, () => ['goBackward']],
      [5, () => ['goForward']],
      [4, () => ['goTo', getRandomId()]],
      [3, () => ['setCheckpoint', getRandomId(), random.pick(LABELS)]],
      [1, () => ['clearForward']],
      [limits.keepsHistory ? 0 : 0.5, () => ['clear']],
      [limits.keepsHistory ? 0 : 1.5, () => ['setSize', getRandomSize()]],
    ])();

  // Does something at random, returning the name of the Checkpoints method it
  // called, if it was one.
  const operate = (): string | undefined =>
    random.weighted<() => string | undefined>([
      [20, () => void change(getRandomChange())],
      [1, () => void addRow()],
      [1, () => void recreate()],
      [
        20,
        () => {
          const [method, ...args] = getRandomCall();
          call(method, ...args);
          return method;
        },
      ],
    ])();

  verify();
  return {store, checkpoints, model, call, operate};
};

// -- The properties

// The content of the Store, and the Ids and labels of its checkpoints, are
// always those of the model of the documented behaviour.
test('matches a model of the documented behaviour', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace);
    for (let operation = 0; operation < OPERATIONS; operation++) {
      world.operate();
    }
  });
});

// A CheckpointIdsListener is called once by anything that changes the
// checkpoint Ids, or that clears them, and by nothing else.
test('calls a CheckpointIdsListener when the Ids change', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace, {exactIdsListeners: true});
    const {checkpoints} = world;
    let calls = 0;
    trace('checkpoints.addCheckpointIdsListener(() => calls++);');
    checkpoints.addCheckpointIdsListener((checkpointsArg) => {
      calls += checkpointsArg === checkpoints ? 1 : NaN;
    });
    for (let operation = 0; operation < OPERATIONS; operation++) {
      const checkpointIds = checkpoints.getCheckpointIds();
      calls = 0;
      const method = world.operate();
      expectAlike(
        calls,
        method == 'clear' ||
          !isSame(checkpoints.getCheckpointIds(), checkpointIds)
          ? 1
          : 0,
        'calls to the CheckpointIdsListener',
      );
    }
  });
});

// A CheckpointListener is called whenever the label of its checkpoint (or of
// any checkpoint, if it has none) changes, as it does when the checkpoint
// comes into existence or goes out of it, and it is not called otherwise.
test('calls a CheckpointListener when a label changes', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace);
    const {checkpoints} = world;
    const listenedIds = ['0', '1', '2', '3', '5', '8', 'nope'];
    const mistakes: string[] = [];
    // Returns a listener that keeps the labels it has been told have changed.
    const getListener = (labels: Map<Id, string | undefined>) => {
      listenedIds.forEach((checkpointId) =>
        labels.set(checkpointId, checkpoints.getCheckpoint(checkpointId)),
      );
      return (checkpointsArg: Checkpoints, checkpointId: Id) => {
        const label = checkpoints.getCheckpoint(checkpointId);
        if (checkpointsArg !== checkpoints) {
          mistakes.push('called with the wrong Checkpoints object');
        }
        if (labels.get(checkpointId) === label) {
          mistakes.push(`called for ${checkpointId}, still ${code(label)}`);
        }
        labels.set(checkpointId, label);
      };
    };
    const labelsOfAll = new Map<Id, string | undefined>();
    trace('checkpoints.addCheckpointListener(null, () => {});');
    checkpoints.addCheckpointListener(null, getListener(labelsOfAll));
    const labelsOfEach = new Map<Id, string | undefined>();
    const listenerOfEach = getListener(labelsOfEach);
    listenedIds.forEach((checkpointId) => {
      trace(`checkpoints.addCheckpointListener(${code(checkpointId)}, …);`);
      checkpoints.addCheckpointListener(checkpointId, listenerOfEach);
    });
    for (let operation = 0; operation < OPERATIONS; operation++) {
      world.operate();
      expectAlike(mistakes, [], 'needless calls to a CheckpointListener');
      const checkpointIds = new Set([...listenedIds, ...labelsOfAll.keys()]);
      checkpointIds.forEach((checkpointId) => {
        const label = checkpoints.getCheckpoint(checkpointId);
        expectAlike(
          [
            labelsOfAll.get(checkpointId),
            listenedIds.includes(checkpointId)
              ? labelsOfEach.get(checkpointId)
              : label,
          ],
          [label, label],
          `the label of ${checkpointId}, as the CheckpointListeners know it`,
        );
      });
    }
  });
});

// Listeners are called until they are removed and never afterwards, however
// many there are, and the listener statistics count them.
test('calls just the listeners that are registered', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace);
    const {checkpoints} = world;
    type Listener = {
      // Its Id, for as long as it is registered.
      listenerId?: Id;
      // The checkpoint it listens to, null for them all, or undefined if it
      // listens to the checkpoint Ids instead.
      checkpointId: IdOrNull | undefined;
      // The checkpoints it has been called for.
      calls: (Id | undefined)[];
    };
    const listeners: Listener[] = [];
    const addListener = (checkpointId: IdOrNull | undefined): void => {
      const listener: Listener = {checkpointId, calls: []};
      trace(
        `const listenerId${listeners.length} = checkpoints.` +
          (checkpointId === undefined
            ? 'addCheckpointIdsListener(() => {});'
            : `addCheckpointListener(${code(checkpointId)}, () => {});`),
      );
      listener.listenerId =
        checkpointId === undefined
          ? checkpoints.addCheckpointIdsListener(() =>
              listener.calls.push(undefined),
            )
          : checkpoints.addCheckpointListener(checkpointId, (_, checkpointId) =>
              listener.calls.push(checkpointId),
            );
      listeners.push(listener);
    };
    // The first two listeners stay registered, for the others to be compared
    // with: one to the checkpoint Ids, and one to every checkpoint.
    addListener(undefined);
    addListener(null);
    for (let operation = 0; operation < OPERATIONS; operation++) {
      const registered = listeners.filter(
        ({listenerId}, index) => index > 1 && listenerId !== undefined,
      );
      random.weighted([
        [2, () => addListener(undefined)],
        [2, () => addListener(null)],
        [3, () => addListener(random.pick(['0', '1', '2', '3', 'nope']))],
        [
          registered.length && 6,
          () => {
            const listener = random.pick(registered);
            trace(
              'checkpoints.delListener(listenerId' +
                `${listeners.indexOf(listener)});`,
            );
            expectAlike(
              checkpoints.delListener(listener.listenerId as Id) ===
                checkpoints,
              true,
              'what delListener returns',
            );
            delete listener.listenerId;
          },
        ],
        [10, () => 0],
      ])();
      const listenerIds = listeners.flatMap(({listenerId}) => listenerId ?? []);
      expectAlike(
        [new Set(listenerIds).size, checkpoints.getListenerStats()],
        [
          listenerIds.length,
          {
            checkpointIds: listeners.filter(
              ({listenerId, checkpointId}) =>
                listenerId !== undefined && checkpointId === undefined,
            ).length,
            checkpoint: listeners.filter(
              ({listenerId, checkpointId}) =>
                listenerId !== undefined && checkpointId !== undefined,
            ).length,
          },
        ],
        'the listeners registered',
      );

      listeners.forEach((listener) => (listener.calls = []));
      world.operate();
      const [toIds, toAll] = listeners;
      listeners.forEach(({listenerId, checkpointId, calls}, index) =>
        expectAlike(
          [...calls].sort(),
          listenerId === undefined
            ? []
            : checkpointId === undefined
              ? toIds.calls
              : toAll.calls
                  .filter((id) => checkpointId === null || checkpointId === id)
                  .sort(),
          `calls to listenerId${index}`,
        ),
      );
    }
  });
});

// Going backward any number of times, and then forward as many, restores the
// content that the Store had at every step along the way.
test('restores the same content going backward then forward', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace);
    const {store, checkpoints} = world;
    for (let operation = 0; operation < OPERATIONS; operation++) {
      world.operate();
      if (random.bool(0.2)) {
        const [backwardIds, currentId, forwardIds] =
          checkpoints.getCheckpointIds();
        const steps = random.int(backwardIds.length + 1);
        const contents: Content[] = [];
        for (let step = 0; step < steps; step++) {
          contents.push(store.getContent());
          world.call('goBackward');
        }
        for (let step = 0; step < steps; step++) {
          world.call('goForward');
          expectAlike(
            store.getContent(),
            contents.pop(),
            'content, having gone backward and then forward',
          );
        }
        // Only a checkpoint of any pending changes will have been added.
        const [, addedId] = checkpoints.getCheckpointIds();
        expectAlike(
          checkpoints.getCheckpointIds(),
          [backwardIds, steps > 0 ? addedId : currentId, forwardIds],
          'checkpoint Ids, having gone backward and then forward',
        );
        expectAlike(
          steps > 0 && currentId !== undefined ? addedId : currentId,
          currentId,
          'current checkpoint Id, having gone backward and then forward',
        );
      }
    }
  });
});

// While no checkpoint has been forgotten, undoing everything restores the
// content the Store had when its Checkpoints object was created, and going
// back to where it was restores the content it had then.
test('restores the initial content when everything is undone', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace, {keepsHistory: true});
    const {store, checkpoints} = world;
    const initialContent = store.getContent();
    for (let operation = 0; operation < OPERATIONS; operation++) {
      world.operate();
      if (random.bool(0.1) || operation == OPERATIONS - 1) {
        const content = store.getContent();
        const [, currentId] = checkpoints.getCheckpointIds();
        if (random.bool()) {
          world.call('goTo', '0');
        } else {
          while (checkpoints.getCheckpointIds()[0].length > 0) {
            world.call('goBackward');
          }
        }
        expectAlike(
          [store.getContent(), checkpoints.getCheckpointIds()[1]],
          [initialContent, '0'],
          'content and checkpoint Id, having undone everything',
        );
        // Any pending changes were given the last checkpoint, to return to.
        const [, , forwardIds] = checkpoints.getCheckpointIds();
        world.call('goTo', currentId ?? forwardIds.at(-1));
        expectAlike(
          store.getContent(),
          content,
          'content, having returned to where it was',
        );
      }
    }
  });
});

// Going to a checkpoint is not itself a change to the Store: wherever it
// goes, that checkpoint is then the current one, there is nothing to add a
// checkpoint for, and every other checkpoint is still there.
test('does not record going to a checkpoint as a change', async () => {
  await forEachSeed(100, (random, trace) => {
    const world = createWorld(random, trace);
    const {checkpoints} = world;
    for (let operation = 0; operation < OPERATIONS; operation++) {
      world.operate();
      if (random.bool(0.2)) {
        world.call('addCheckpoint');
        const timeline = checkpoints.getCheckpointIds().flat();
        for (let move = random.int(4); move >= 0; move--) {
          const checkpointId = random.pick(timeline) as Id;
          world.call('goTo', checkpointId);
          expectAlike(
            [
              checkpoints.getCheckpointIds()[1],
              checkpoints.getCheckpointIds().flat(),
            ],
            [checkpointId, timeline],
            `checkpoint Ids, having gone to ${checkpointId}`,
          );
          world.call('addCheckpoint');
          expectAlike(
            checkpoints.getCheckpointIds().flat(),
            timeline,
            `checkpoint Ids, having added a checkpoint at ${checkpointId}`,
          );
        }
      }
    }
  });
});
