import type {
  Cell,
  GetCell,
  Id,
  Ids,
  Indexes,
  Row,
  SortKey,
  Store,
  Table,
  Tables,
} from 'tinybase';
import {createIndexes, createStore, defaultSorter} from 'tinybase';
import {expect, test} from 'vitest';
import type {Random, Trace} from '../../common/fuzz.ts';
import {code, expectSame, forEachSeed} from '../../common/fuzz.ts';

// Seeded fuzz tests for the indexes module. Each test applies a random
// sequence of operations to a Store, and to the Index definitions over it, and
// checks one property of the Indexes object after every operation.

const RUNS = 40;
const STEPS = 30;

// Small pools of Ids and Cells, so that Rows often share a Slice, and Slices
// often empty and fill again. Both Tables use the same Row Ids, so that an
// Index moved from one to the other finds Rows it thinks it already knows.
const TABLE_IDS = ['pets', 'strays'];
const ROW_IDS = ['fido', 'felix', 'rex', 'cujo', 'nemo', 'polly'];
const INDEX_IDS = ['catalog', 'kennels', 'window'];

type Cells = {readonly [cellId: Id]: readonly Cell[]};

const CELLS: Cells = {
  species: ['dog', 'cat', 'fish', ''],
  price: [1, 2, 3],
  // The boolean and the string both become the Slice Id 'true'.
  sold: [true, false, 'true'],
  // Each letter is a tag.
  tags: ['', 'a', 'b', 'ab', 'ba', 'aa'],
};

// Slice Ids that the listener tests listen to specifically, as well as
// listening to every Slice with a wildcard.
const SLICE_IDS = ['', 'dog', 'a', '1', 'f'];

// -- Index definitions

type GetSliceIdOrIds = (getCell: GetCell, rowId: Id) => Id | Ids;
type GetSortKey = (getCell: GetCell, rowId: Id) => SortKey;
type SliceIdSorter = (sliceId1: Id, sliceId2: Id) => number;
type RowIdSorter = (key1: SortKey, key2: SortKey, sliceId: Id) => number;

// One argument of setIndexDefinition, with the code that a trace shows for it.
type Part<Value> = {readonly source: string; readonly value: Value};

type SlicesPart = Part<Id | GetSliceIdOrIds | undefined>;

type SortKeyPart = Part<Id | GetSortKey | undefined>;

type Definition = {
  readonly tableId: Id;
  readonly slices: SlicesPart;
  readonly sortKey: SortKeyPart;
  readonly sliceSorter: Part<SliceIdSorter | undefined>;
  readonly rowSorter: Part<RowIdSorter | undefined>;
};

const part = <Value>(
  value: Value,
  source = typeof value == 'function' ? String(value) : code(value),
): Part<Value> => ({source, value});

const NONE = part(undefined);

const SLICES: SlicesPart[] = [
  NONE,
  part('species'),
  part('price'),
  part('sold'),
  part('tags'),
  part<GetSliceIdOrIds>(
    (getCell) => `${getCell('species')}/${getCell('sold')}`,
  ),
  part<GetSliceIdOrIds>((_getCell, rowId) => rowId[0]),
  // Several Slices for each Row, or none, and sometimes the same one twice.
  part<GetSliceIdOrIds>((getCell) => [...((getCell('tags') ?? '') as Id)]),
  part<GetSliceIdOrIds>((getCell, rowId) => [
    rowId[0],
    `${getCell('species') ?? ''}`[0] ?? '',
  ]),
];

const SORT_KEYS: SortKeyPart[] = [
  part('price'),
  part<GetSortKey>((getCell) => getCell('price') ?? 0),
  part<GetSortKey>((getCell) => `${getCell('species')}`),
  part<GetSortKey>((getCell, rowId) => `${getCell('price')}/${rowId}`),
];

const SLICE_SORTERS: Part<SliceIdSorter>[] = [
  part<SliceIdSorter>(defaultSorter, 'defaultSorter'),
  part<SliceIdSorter>((sliceId1, sliceId2) => (sliceId1 > sliceId2 ? -1 : 1)),
];

const ROW_SORTERS: Part<RowIdSorter | undefined>[] = [
  NONE,
  part<RowIdSorter>(defaultSorter, 'defaultSorter'),
  // As the guides write a sorter: never zero, and positive for a tie.
  part<RowIdSorter>((key1: any, key2: any) =>
    (key1 ?? 0) > (key2 ?? 0) ? -1 : 1,
  ),
  // As the other tests write one: never zero, and negative for a tie.
  part<RowIdSorter>((key1: any, key2: any) =>
    (key1 ?? 0) > (key2 ?? 0) ? 1 : -1,
  ),
  // As Array.sort expects one: zero for a tie. It reverses some Slices.
  part<RowIdSorter>(
    (key1: any, key2: any, sliceId) =>
      ((key1 ?? 0) < (key2 ?? 0) ? -1 : (key1 ?? 0) > (key2 ?? 0) ? 1 : 0) *
      (sliceId < 'd' ? -1 : 1),
  ),
];

// -- Options

type Options = {
  // The Cells that Rows are made of, and the ways to slice and to sort them.
  readonly cells?: Cells;
  readonly slices?: SlicesPart[];
  readonly sortKeys?: SortKeyPart[];
  // Whether every definition sorts its Slices and its Rows, or none does. By
  // default, each definition might sort either, both, or neither.
  readonly sorting?: 'always' | 'never';
  // Whether the Indexes object is sometimes destroyed.
  readonly destroys?: boolean;
  // Whether Indexes are sometimes defined or deleted during a transaction.
  readonly definesInTransactions?: boolean;
};

// -- Operations

// A Store, its Indexes object, and the definitions that have been set on it.
type World = {
  readonly store: Store;
  readonly indexes: Indexes;
  readonly definitions: Map<Id, Definition>;
};

// Something to do to a World, and the code that a trace shows for it.
type Operation = {
  readonly lines: string[];
  readonly apply: (world: World) => void;
};

const createWorld = (trace: Trace): World => {
  trace('const store = createStore();');
  trace('const indexes = createIndexes(store);');
  const store = createStore();
  return {
    store,
    indexes: createIndexes(store),
    definitions: new Map(),
  };
};

const call = (method: string, ...args: unknown[]): Operation => ({
  lines: [`store.${method}(${args.map(code).join(', ')});`],
  apply: ({store}) => (store as any)[method](...args),
});

const getRow = (random: Random, cells: Cells): Row => {
  const row: Row = {};
  Object.entries(cells).forEach(([cellId, values]) => {
    if (random.bool(0.7)) {
      row[cellId] = random.pick(values);
    }
  });
  return row;
};

const getTable = (random: Random, cells: Cells): Table => {
  const table: Table = {};
  random
    .shuffle(ROW_IDS)
    .slice(0, random.int(ROW_IDS.length + 1))
    .forEach((rowId) => (table[rowId] = getRow(random, cells)));
  return table;
};

const getTables = (random: Random, cells: Cells): Tables => {
  const tables: Tables = {};
  TABLE_IDS.forEach((tableId) => (tables[tableId] = getTable(random, cells)));
  return tables;
};

const getStoreOperation = (
  random: Random,
  {cells = CELLS}: Options,
): Operation => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS);
  const cellId = random.pick(Object.keys(cells));
  const cell = random.pick(cells[cellId]);
  return random.weighted<() => Operation>([
    [8, () => call('setCell', tableId, rowId, cellId, cell)],
    [3, () => call('delCell', tableId, rowId, cellId)],
    [4, () => call('setRow', tableId, rowId, getRow(random, cells))],
    [3, () => call('setPartialRow', tableId, rowId, getRow(random, cells))],
    [3, () => call('delRow', tableId, rowId)],
    [2, () => call('setTable', tableId, getTable(random, cells))],
    [1, () => call('delTable', tableId)],
    [1, () => call('setTables', getTables(random, cells))],
    [1, () => call('setValue', 'open', random.bool())],
  ])();
};

const getStoreOperations = (random: Random, options: Options): Operation[] =>
  Array.from({length: random.int(5)}, () => getStoreOperation(random, options));

const getTransaction = (
  operations: Operation[],
  rollback: boolean,
): Operation => ({
  lines: [
    'store.transaction(() => {',
    ...operations.flatMap(({lines}) => lines.map((line) => '  ' + line)),
    rollback ? '}, () => true);' : '});',
  ],
  apply: (world) =>
    world.store.transaction(
      () => operations.forEach(({apply}) => apply(world)),
      () => rollback,
    ),
});

const getDefinition = (
  random: Random,
  {slices = SLICES, sortKeys = SORT_KEYS, sorting}: Options,
): Definition => {
  const sorts = (): boolean =>
    sorting != 'never' && (sorting == 'always' || random.bool());
  return {
    tableId: random.pick(TABLE_IDS),
    slices: random.pick(slices),
    sortKey: sorts() ? random.pick(sortKeys) : NONE,
    sliceSorter: sorts() ? random.pick(SLICE_SORTERS) : NONE,
    rowSorter: sorts() ? random.pick(ROW_SORTERS) : NONE,
  };
};

const setDefinition = (
  indexes: Indexes,
  indexId: Id,
  {tableId, slices, sortKey, sliceSorter, rowSorter}: Definition,
): Indexes =>
  indexes.setIndexDefinition(
    indexId,
    tableId,
    slices.value,
    sortKey.value,
    sliceSorter.value,
    rowSorter.value,
  );

const getSetDefinitionOperation = (
  indexId: Id,
  definition: Definition,
): Operation => {
  const {tableId, slices, sortKey, sliceSorter, rowSorter} = definition;
  const args = [
    code(indexId),
    code(tableId),
    slices.source,
    sortKey.source,
    sliceSorter.source,
    rowSorter.source,
  ];
  return {
    lines: [`indexes.setIndexDefinition(${args.join(', ')});`],
    apply: ({indexes, definitions}) => {
      setDefinition(indexes, indexId, definition);
      definitions.set(indexId, definition);
    },
  };
};

const getDelDefinitionOperation = (indexId: Id): Operation => ({
  lines: [`indexes.delIndexDefinition(${code(indexId)});`],
  apply: ({indexes, definitions}) => {
    indexes.delIndexDefinition(indexId);
    definitions.delete(indexId);
  },
});

const DESTROY: Operation = {
  lines: ['indexes.destroy();'],
  apply: ({indexes, definitions}) => {
    indexes.destroy();
    definitions.clear();
  },
};

const getDefinitionOperation = (
  random: Random,
  options: Options,
): Operation => {
  const indexId = random.pick(INDEX_IDS);
  return random.bool(0.25)
    ? getDelDefinitionOperation(indexId)
    : getSetDefinitionOperation(indexId, getDefinition(random, options));
};

const getOperation = (
  random: Random,
  world: World,
  options: Options,
): Operation =>
  world.definitions.size == 0 && random.bool()
    ? getDefinitionOperation(random, options)
    : !world.store.hasTables() && random.bool()
      ? call('setTables', getTables(random, options.cells ?? CELLS))
      : random.weighted<() => Operation>([
          [10, () => getStoreOperation(random, options)],
          [
            4,
            () =>
              getTransaction(
                Array.from({length: random.int(5)}, () =>
                  options.definesInTransactions && random.bool(0.2)
                    ? getDefinitionOperation(random, options)
                    : getStoreOperation(random, options),
                ),
                random.bool(),
              ),
          ],
          [3, () => getDefinitionOperation(random, options)],
          [options.destroys ? 0.3 : 0, () => DESTROY],
        ])();

// An operation that should change nothing in the Tables, and so nothing in
// the Indexes either.
const getIdleOperation = (
  random: Random,
  {store, definitions}: World,
  options: Options,
): Operation => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS);
  const cellId = random.pick(Object.keys(CELLS));
  const indexId = random.pick(INDEX_IDS);
  const definition = definitions.get(indexId);
  const row = store.getRow(tableId, rowId);
  return random.weighted<() => Operation>([
    // A transaction that is rolled back.
    [4, () => getTransaction(getStoreOperations(random, options), true)],
    // A transaction that puts everything back itself.
    [
      2,
      () =>
        getTransaction(
          [
            ...getStoreOperations(random, options),
            store.hasTables()
              ? call('setTables', store.getTables())
              : call('delTables'),
          ],
          false,
        ),
    ],
    // Setting what is already there, and deleting what is not.
    [1, () => call('setTables', store.getTables())],
    [1, () => call('setTable', tableId, store.getTable(tableId))],
    [1, () => call('setRow', tableId, rowId, row)],
    [1, () => call('setPartialRow', tableId, rowId, row)],
    [
      2,
      () =>
        cellId in row
          ? call('setCell', tableId, rowId, cellId, row[cellId])
          : call('delCell', tableId, rowId, cellId),
    ],
    [
      store.hasRow(tableId, rowId) ? 0 : 1,
      () => call('delRow', tableId, rowId),
    ],
    [store.hasTable(tableId) ? 0 : 1, () => call('delTable', tableId)],
    // Changing something that is not in a Table.
    [1, () => call('setValue', 'open', random.bool())],
    // Setting the definition that an Index already has.
    [
      definition ? 3 : 0,
      () => getSetDefinitionOperation(indexId, definition as Definition),
    ],
    // Deleting an Index that does not exist.
    [definition ? 0 : 1, () => getDelDefinitionOperation(indexId)],
  ])();
};

// Traces an operation, and then applies it.
const run = (world: World, trace: Trace, {lines, apply}: Operation): void => {
  lines.forEach(trace);
  apply(world);
};

// Traces a random operation, and then applies it.
const operate = (
  world: World,
  random: Random,
  trace: Trace,
  options: Options = {},
): void => run(world, trace, getOperation(random, world, options));

// -- Oracles

type Slices = [sliceId: Id, rowIds: Ids][];

const isSame = (thing1: unknown, thing2: unknown): boolean =>
  code(thing1) == code(thing2);

// The Slices of an Index, as its getters list them.
const getSlices = (indexes: Indexes, indexId: Id): Slices =>
  indexes
    .getSliceIds(indexId)
    .map((sliceId) => [sliceId, indexes.getSliceRowIds(indexId, sliceId)]);

// The Slices of every Index that might exist, keyed by Index Id and Slice Id.
const getAllSlices = (indexes: Indexes): Map<Id, Map<Id, Ids>> =>
  new Map(
    INDEX_IDS.map((indexId) => [indexId, new Map(getSlices(indexes, indexId))]),
  );

// The Slices that an iterator lists, each with its Rows as their iterator
// lists them.
const getIterated = (
  forEachSlice: (sliceCallback: Parameters<Indexes['forEachSlice']>[1]) => void,
): [sliceId: Id, rows: [rowId: Id, row: Row][]][] => {
  const iterated: [Id, [Id, Row][]][] = [];
  forEachSlice((sliceId, forEachRow) => {
    const rows: [Id, Row][] = [];
    forEachRow((rowId, forEachCell) => {
      const row: Row = {};
      forEachCell((cellId, cell) => (row[cellId] = cell));
      rows.push([rowId, row]);
    });
    iterated.push([sliceId, rows]);
  });
  return iterated;
};

// The Slices of an Index, as its iterator lists them.
const getIteratedSlices = (indexes: Indexes, indexId: Id): Slices =>
  getIterated((sliceCallback) =>
    indexes.forEachSlice(indexId, sliceCallback),
  ).map(([sliceId, rows]) => [sliceId, rows.map(([rowId]) => rowId)]);

// The Slice Id for a Cell: the empty string if it is missing, and otherwise
// its value as a string.
const getCellSliceId = (cell: Cell | undefined): Id =>
  cell === undefined ? '' : String(cell);

// The Ids of the Slices that a definition puts a Row in.
const getRowSliceIds = (
  {slices: {value}}: Definition,
  row: Row,
  rowId: Id,
): Ids =>
  typeof value == 'function'
    ? [value((cellId) => row[cellId], rowId)].flat()
    : [value === undefined ? '' : getCellSliceId(row[value])];

// The key that a definition sorts a Row by.
const getRowSortKey = (
  {sortKey: {value}}: Definition,
  row: Row,
  rowId: Id,
): SortKey =>
  typeof value == 'function'
    ? value((cellId) => row[cellId], rowId)
    : value === undefined
      ? undefined
      : row[value];

// The Slices that a definition should produce, recomputed naively from its
// Table. The Slices, and the Rows in each, are in the order of the Table.
const getModelSlices = (store: Store, definition: Definition): Slices => {
  const rowIdsBySliceId = new Map<Id, Ids>();
  Object.entries(store.getTable(definition.tableId)).forEach(([rowId, row]) =>
    new Set(getRowSliceIds(definition, row, rowId)).forEach((sliceId) =>
      rowIdsBySliceId.set(sliceId, [
        ...(rowIdsBySliceId.get(sliceId) ?? []),
        rowId,
      ]),
    ),
  );
  return [...rowIdsBySliceId];
};

// Slices as sets: sorted by Slice Id, with the Row Ids of each sorted too.
const getSets = (slices: Slices): Slices =>
  slices
    .map(([sliceId, rowIds]): Slices[0] => [sliceId, [...rowIds].sort()])
    .sort(([sliceId1], [sliceId2]) => (sliceId1 < sliceId2 ? -1 : 1));

// What a sorter says about two things: negative or positive if it puts one
// of them first, and zero if it ties them, whichever sign it gives to a tie.
const getOrder =
  <Thing>(sorter: (thing1: Thing, thing2: Thing) => number) =>
  (thing1: Thing, thing2: Thing): number =>
    (sorter(thing1, thing2) < 0 ? -1 : 0) +
    (sorter(thing2, thing1) < 0 ? 1 : 0);

// Sorts things by what an order says of them, and by nothing else: used alone,
// the sort method of an array puts anything undefined last, whatever the order.
const getSorted = <Thing>(
  things: Thing[],
  order: (thing1: Thing, thing2: Thing) => number,
): Thing[] =>
  things
    .map((thing) => [thing])
    .sort(([thing1], [thing2]) => order(thing1, thing2))
    .map(([thing]) => thing);

// The sort keys of the Rows of a Slice, in the order of those Rows.
const getSortKeys = (
  store: Store,
  definition: Definition,
  rowIds: Ids,
): SortKey[] =>
  rowIds.map((rowId) =>
    getRowSortKey(definition, store.getRow(definition.tableId, rowId), rowId),
  );

// The order that a definition puts the sort keys of a Slice in.
const getSortKeyOrder = (
  {rowSorter: {value = defaultSorter}}: Definition,
  sliceId: Id,
): ((key1: SortKey, key2: SortKey) => number) =>
  getOrder((key1, key2) => value(key1, key2, sliceId));

// Reduces Slices to the part of them that a definition determines: the Slice
// Ids, in order only if the definition sorts them; and for each Slice, the Row
// Ids, in no order, and the sort keys of those Rows, in order.
const getDetermined = (
  store: Store,
  definition: Definition,
  slices: Slices,
): unknown[] =>
  (definition.sliceSorter.value ? slices : getSets(slices)).map(
    ([sliceId, rowIds]) => [
      sliceId,
      [...rowIds].sort(),
      getSortKeys(store, definition, rowIds),
    ],
  );

// An Indexes object over a copy of the Store, given the same definitions.
const createFreshIndexes = ({store, definitions}: World): Indexes => {
  const indexes = createIndexes(createStore().setTables(store.getTables()));
  definitions.forEach((definition, indexId) =>
    setDefinition(indexes, indexId, definition),
  );
  return indexes;
};

// Checks that the Ids that stayed through an operation have kept their order,
// and that the Ids it added come after them all.
const expectInsertionOrder = (
  before: Ids,
  after: Ids,
  stayed: Ids,
  label: string,
): void =>
  expectSame(
    after
      .filter((id) => stayed.includes(id) || !before.includes(id))
      .slice(0, stayed.length),
    before.filter((id) => stayed.includes(id)),
    label,
  );

// -- Properties

// An Indexes object kept up to date agrees with one that is newly created.
test('agrees with newly created Indexes', async () => {
  const options: Options = {
    destroys: true,
    // KNOWN BUG definition-in-transaction: remove this restriction once fixed.
    definesInTransactions: false,
  };
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes, definitions} = world;
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      const fresh = createFreshIndexes(world);
      expectSame(indexes.getIndexIds(), fresh.getIndexIds(), 'getIndexIds');
      INDEX_IDS.forEach((indexId) => {
        expectSame(
          [indexes.hasIndex(indexId), indexes.getTableId(indexId)],
          [fresh.hasIndex(indexId), fresh.getTableId(indexId)],
          `hasIndex and getTableId of ${indexId}`,
        );
        const definition = definitions.get(indexId);
        if (definition) {
          expectSame(
            getDetermined(store, definition, getSlices(indexes, indexId)),
            getDetermined(store, definition, getSlices(fresh, indexId)),
            `Slices of ${indexId}`,
          );
          expectSame(
            getDetermined(
              store,
              definition,
              getIteratedSlices(indexes, indexId),
            ),
            getDetermined(store, definition, getIteratedSlices(fresh, indexId)),
            `forEachSlice of ${indexId}`,
          );
        } else {
          expectSame(getSlices(indexes, indexId), [], `Slices of ${indexId}`);
        }
        new Set([
          ...SLICE_IDS,
          ...indexes.getSliceIds(indexId),
          ...fresh.getSliceIds(indexId),
        ]).forEach((sliceId) =>
          expectSame(
            indexes.hasSlice(indexId, sliceId),
            fresh.hasSlice(indexId, sliceId),
            `hasSlice of ${sliceId} in ${indexId}`,
          ),
        );
      });
    }
  });
});

// Each Slice holds exactly the Rows that the definition puts in it.
test('groups the Rows of a Table into Slices', async () => {
  const options: Options = {
    destroys: true,
    // KNOWN BUG definition-in-transaction: remove this restriction once fixed.
    definesInTransactions: false,
  };
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes, definitions} = world;
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      INDEX_IDS.forEach((indexId) => {
        const definition = definitions.get(indexId);
        expectSame(
          getSets(getSlices(indexes, indexId)),
          getSets(definition ? getModelSlices(store, definition) : []),
          `Slices of ${indexId}`,
        );
      });
    }
  });
});

// Slice Ids, and the Row Ids in each Slice, are in the order that the sorters
// of the definition put them in.
test('keeps sorted Slices and Rows in order', async () => {
  const options: Options = {
    sorting: 'always',
  };
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes, definitions} = world;
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      definitions.forEach((definition, indexId) => {
        const sliceIds = indexes.getSliceIds(indexId);
        expectSame(
          sliceIds,
          getSorted(
            sliceIds,
            getOrder(definition.sliceSorter.value ?? defaultSorter),
          ),
          `Slice Ids of ${indexId}`,
        );
        sliceIds.forEach((sliceId) => {
          const sortKeys = getSortKeys(
            store,
            definition,
            indexes.getSliceRowIds(indexId, sliceId),
          );
          expectSame(
            sortKeys,
            getSorted(sortKeys, getSortKeyOrder(definition, sliceId)),
            `sort keys of ${sliceId} in ${indexId}`,
          );
        });
      });
    }
  });
});

// Without sorters, a new Index lists its Slices and Rows in the order of the
// Table. From then on, those that stay keep their order, and new ones go last.
test('keeps unsorted Slices and Rows in insertion order', async () => {
  const options: Options = {sorting: 'never'};
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes, definitions} = world;
    let before = new Map<Id, [Definition, Slices]>();
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      const after = new Map<Id, [Definition, Slices]>();
      definitions.forEach((definition, indexId) => {
        const slices = getSlices(indexes, indexId);
        after.set(indexId, [definition, slices]);
        const [definitionBefore, slicesBefore = []] = before.get(indexId) ?? [];
        if (!definitionBefore) {
          expectSame(
            slices,
            getModelSlices(store, definition),
            `Slices of new ${indexId}`,
          );
        } else if (definitionBefore == definition) {
          const rowIdsBefore = new Map(slicesBefore);
          const stayed: Ids = [];
          slices.forEach(([sliceId, rowIds]) => {
            const sliceRowIdsBefore = rowIdsBefore.get(sliceId) ?? [];
            const rowIdsStayed = sliceRowIdsBefore.filter((rowId) =>
              rowIds.includes(rowId),
            );
            expectInsertionOrder(
              sliceRowIdsBefore,
              rowIds,
              rowIdsStayed,
              `Row Ids of ${sliceId} in ${indexId}`,
            );
            if (rowIdsStayed.length > 0) {
              stayed.push(sliceId);
            }
          });
          expectInsertionOrder(
            slicesBefore.map(([sliceId]) => sliceId),
            slices.map(([sliceId]) => sliceId),
            stayed,
            `Slice Ids of ${indexId}`,
          );
        }
      });
      before = after;
    }
  });
});

// A SliceIdsListener is called once by each operation that changes the Slice
// Ids of its Index, with those already changed, and by no other operation.
test('calls SliceIdsListeners when Slice Ids change', async () => {
  const options: Options = {};
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {indexes} = world;
    const calls: string[] = [];
    [null, ...INDEX_IDS].forEach((indexIdOrNull) => {
      trace(`indexes.addSliceIdsListener(${code(indexIdOrNull)}, listener);`);
      indexes.addSliceIdsListener(indexIdOrNull, (indexes, indexId) =>
        calls.push(
          code([indexIdOrNull, indexId, indexes.getSliceIds(indexId)]),
        ),
      );
    });
    let before = getAllSlices(indexes);
    for (let step = 0; step < STEPS; step++) {
      calls.length = 0;
      operate(world, random, trace, options);
      const after = getAllSlices(indexes);
      const expected: string[] = [];
      INDEX_IDS.forEach((indexId) => {
        const sliceIds = [...(after.get(indexId)?.keys() ?? [])];
        if (!isSame([...(before.get(indexId)?.keys() ?? [])], sliceIds)) {
          [null, indexId].forEach((indexIdOrNull) =>
            expected.push(code([indexIdOrNull, indexId, sliceIds])),
          );
        }
      });
      expectSame([...calls].sort(), expected.sort(), 'calls');
      before = after;
    }
  });
});

// A SliceRowIdsListener is called once by each operation that changes the Row
// Ids of its Slice, with those already changed, and by no other operation.
test('calls SliceRowIdsListeners when Row Ids change', async () => {
  const options: Options = {};
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {indexes} = world;
    const calls: string[] = [];
    [null, ...INDEX_IDS].forEach((indexIdOrNull) =>
      [null, ...SLICE_IDS].forEach((sliceIdOrNull) => {
        trace(
          'indexes.addSliceRowIdsListener(' +
            `${code(indexIdOrNull)}, ${code(sliceIdOrNull)}, listener);`,
        );
        indexes.addSliceRowIdsListener(
          indexIdOrNull,
          sliceIdOrNull,
          (indexes, indexId, sliceId) =>
            calls.push(
              code([
                indexIdOrNull,
                sliceIdOrNull,
                indexId,
                sliceId,
                indexes.getSliceRowIds(indexId, sliceId),
              ]),
            ),
        );
      }),
    );
    let before = getAllSlices(indexes);
    for (let step = 0; step < STEPS; step++) {
      calls.length = 0;
      operate(world, random, trace, options);
      const after = getAllSlices(indexes);
      const expected: string[] = [];
      INDEX_IDS.forEach((indexId) => {
        const slicesBefore = before.get(indexId);
        const slices = after.get(indexId);
        new Set([
          ...(slicesBefore?.keys() ?? []),
          ...(slices?.keys() ?? []),
        ]).forEach((sliceId) => {
          const rowIds = slices?.get(sliceId) ?? [];
          if (!isSame(slicesBefore?.get(sliceId) ?? [], rowIds)) {
            [null, indexId].forEach((indexIdOrNull) =>
              [null, ...SLICE_IDS.filter((id) => id == sliceId)].forEach(
                (sliceIdOrNull) =>
                  expected.push(
                    code([
                      indexIdOrNull,
                      sliceIdOrNull,
                      indexId,
                      sliceId,
                      rowIds,
                    ]),
                  ),
              ),
            );
          }
        });
      });
      expectSame([...calls].sort(), expected.sort(), 'calls');
      before = after;
    }
  });
});

// An IndexIdsListener, a HasIndexListener, and a HasSliceListener is each
// called once by each operation that adds or removes what it listens for.
test('calls listeners when Indexes and Slices come and go', async () => {
  const options: Options = {};
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {indexes} = world;
    const calls: string[] = [];
    trace('indexes.addIndexIdsListener(listener);');
    indexes.addIndexIdsListener((indexes) =>
      calls.push(code(['indexIds', indexes.getIndexIds()])),
    );
    [null, ...INDEX_IDS].forEach((indexIdOrNull) => {
      trace(`indexes.addHasIndexListener(${code(indexIdOrNull)}, listener);`);
      indexes.addHasIndexListener(indexIdOrNull, (_, indexId, hasIndex) =>
        calls.push(code(['hasIndex', indexIdOrNull, indexId, hasIndex])),
      );
      [null, ...SLICE_IDS].forEach((sliceIdOrNull) => {
        trace(
          'indexes.addHasSliceListener(' +
            `${code(indexIdOrNull)}, ${code(sliceIdOrNull)}, listener);`,
        );
        indexes.addHasSliceListener(
          indexIdOrNull,
          sliceIdOrNull,
          (_, indexId, sliceId, hasSlice) =>
            calls.push(
              code([
                'hasSlice',
                indexIdOrNull,
                sliceIdOrNull,
                indexId,
                sliceId,
                hasSlice,
              ]),
            ),
        );
      });
    });
    let indexIdsBefore = indexes.getIndexIds();
    let before = getAllSlices(indexes);
    for (let step = 0; step < STEPS; step++) {
      calls.length = 0;
      operate(world, random, trace, options);
      const indexIds = indexes.getIndexIds();
      const after = getAllSlices(indexes);
      const expected: string[] = [];
      if (!isSame(indexIdsBefore, indexIds)) {
        expected.push(code(['indexIds', indexIds]));
      }
      INDEX_IDS.forEach((indexId) => {
        const hasIndex = indexIds.includes(indexId);
        if (indexIdsBefore.includes(indexId) != hasIndex) {
          [null, indexId].forEach((indexIdOrNull) =>
            expected.push(code(['hasIndex', indexIdOrNull, indexId, hasIndex])),
          );
        }
        const slicesBefore = before.get(indexId);
        const slices = after.get(indexId);
        new Set([
          ...(slicesBefore?.keys() ?? []),
          ...(slices?.keys() ?? []),
        ]).forEach((sliceId) => {
          const hasSlice = slices?.has(sliceId) ?? false;
          if ((slicesBefore?.has(sliceId) ?? false) != hasSlice) {
            [null, indexId].forEach((indexIdOrNull) =>
              [null, ...SLICE_IDS.filter((id) => id == sliceId)].forEach(
                (sliceIdOrNull) =>
                  expected.push(
                    code([
                      'hasSlice',
                      indexIdOrNull,
                      sliceIdOrNull,
                      indexId,
                      sliceId,
                      hasSlice,
                    ]),
                  ),
              ),
            );
          }
        });
      });
      expectSame([...calls].sort(), expected.sort(), 'calls');
      indexIdsBefore = indexIds;
      before = after;
    }
  });
});

// The getters and the iterators of an Indexes object describe the same
// Indexes, Slices, and Rows as each other.
test('reads the same from getters and iterators', async () => {
  const options: Options = {destroys: true};
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes, definitions} = world;
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      expectSame(indexes.getIndexIds(), [...definitions.keys()], 'Index Ids');
      const iterated: [Id, Slices][] = [];
      indexes.forEachIndex((indexId, forEachSlice) =>
        iterated.push([
          indexId,
          getIterated(forEachSlice).map(([sliceId, rows]) => [
            sliceId,
            rows.map(([rowId]) => rowId),
          ]),
        ]),
      );
      expectSame(
        iterated,
        indexes
          .getIndexIds()
          .map((indexId) => [indexId, getSlices(indexes, indexId)]),
        'forEachIndex',
      );
      INDEX_IDS.forEach((indexId) => {
        const tableId = definitions.get(indexId)?.tableId;
        expectSame(
          [indexes.hasIndex(indexId), indexes.getTableId(indexId)],
          [definitions.has(indexId), tableId],
          `hasIndex and getTableId of ${indexId}`,
        );
        const slices = getSlices(indexes, indexId);
        const sliceIds = slices.map(([sliceId]) => sliceId);
        const iteratedSlices = getIterated((sliceCallback) =>
          indexes.forEachSlice(indexId, sliceCallback),
        );
        expectSame(
          iteratedSlices.map(([sliceId, rows]) => [
            sliceId,
            rows.map(([rowId]) => rowId),
          ]),
          slices,
          `forEachSlice of ${indexId}`,
        );
        iteratedSlices.forEach(([sliceId, rows]) =>
          rows.forEach(([rowId, row]) =>
            expectSame(
              row,
              store.getRow(tableId as Id, rowId),
              `Row ${rowId} of ${sliceId} in ${indexId}`,
            ),
          ),
        );
        expectSame(
          sliceIds,
          [...new Set(sliceIds)],
          `distinct Slice Ids of ${indexId}`,
        );
        slices.forEach(([sliceId, rowIds]) => {
          expectSame(
            rowIds,
            [...new Set(rowIds)].filter((rowId) =>
              store.hasRow(tableId as Id, rowId),
            ),
            `distinct Row Ids of ${sliceId} in ${indexId}`,
          );
          expectSame(
            rowIds.length > 0,
            true,
            `Rows in ${sliceId} in ${indexId}`,
          );
        });
        new Set([...SLICE_IDS, ...sliceIds]).forEach((sliceId) => {
          const hasSlice = sliceIds.includes(sliceId);
          expectSame(
            indexes.hasSlice(indexId, sliceId),
            hasSlice,
            `hasSlice of ${sliceId} in ${indexId}`,
          );
          if (!hasSlice) {
            expectSame(
              indexes.getSliceRowIds(indexId, sliceId),
              [],
              `Row Ids of missing ${sliceId} in ${indexId}`,
            );
          }
        });
      });
    }
  });
});

// An operation that leaves the Tables as they were leaves the Indexes as they
// were too, and calls no listener: whether it is a transaction that is rolled
// back, one that undoes its own changes, or a setter given what is there.
test('does nothing when nothing changes', async () => {
  const options: Options = {};
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes} = world;
    const calls: string[] = [];
    trace('indexes.addIndexIdsListener(listener);');
    indexes.addIndexIdsListener(() => calls.push('IndexIdsListener'));
    trace('indexes.addHasIndexListener(null, listener);');
    indexes.addHasIndexListener(null, (_, indexId) =>
      calls.push(`HasIndexListener for ${indexId}`),
    );
    trace('indexes.addSliceIdsListener(null, listener);');
    indexes.addSliceIdsListener(null, (_, indexId) =>
      calls.push(`SliceIdsListener for ${indexId}`),
    );
    trace('indexes.addHasSliceListener(null, null, listener);');
    indexes.addHasSliceListener(null, null, (_, indexId, sliceId) =>
      calls.push(`HasSliceListener for ${sliceId} in ${indexId}`),
    );
    trace('indexes.addSliceRowIdsListener(null, null, listener);');
    indexes.addSliceRowIdsListener(null, null, (_, indexId, sliceId) =>
      calls.push(`SliceRowIdsListener for ${sliceId} in ${indexId}`),
    );
    const getContent = (): unknown => [
      indexes.getIndexIds(),
      INDEX_IDS.map((indexId) => [
        indexes.getTableId(indexId),
        getSlices(indexes, indexId),
      ]),
    ];
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      const tables = store.getTables();
      const content = getContent();
      calls.length = 0;
      run(world, trace, getIdleOperation(random, world, options));
      expectSame(store.getTables(), tables, 'Tables');
      expectSame(getContent(), content, 'Indexes');
      expectSame(calls, [], 'calls');
    }
  });
});

// The Rows of a large Slice stay sorted by a Cell, however the sorter treats
// Rows that tie, as Rows join, leave, and change.
test('sorts large Slices by a Cell', async () => {
  const species = ['dog', 'cat'];
  const rowIds = Array.from({length: 160}, (_, pet) => `pet${pet}`);
  await forEachSeed(10, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes} = world;
    const getPet = (): Row => ({
      species: random.pick(species),
      price: random.int(8),
    });
    const definition: Definition = {
      tableId: 'pets',
      slices: part('species'),
      sortKey: part('price'),
      sliceSorter: NONE,
      rowSorter: random.pick(ROW_SORTERS),
    };
    random
      .shuffle([
        getSetDefinitionOperation('catalog', definition),
        call(
          'setTable',
          'pets',
          Object.fromEntries(rowIds.map((rowId) => [rowId, getPet()])),
        ),
      ])
      .forEach((operation) => run(world, trace, operation));
    for (let step = 0; step < STEPS; step++) {
      const rowId = random.pick(rowIds);
      run(
        world,
        trace,
        random.weighted<() => Operation>([
          [6, () => call('setCell', 'pets', rowId, 'price', random.int(8))],
          [
            2,
            () =>
              call('setCell', 'pets', rowId, 'species', random.pick(species)),
          ],
          [1, () => call('delCell', 'pets', rowId, 'price')],
          [1, () => call('delRow', 'pets', rowId)],
          [1, () => call('setRow', 'pets', rowId, getPet())],
        ])(),
      );
      const slices = getSlices(indexes, 'catalog');
      expectSame(
        getSets(slices),
        getSets(getModelSlices(store, definition)),
        'Slices',
      );
      slices.forEach(([sliceId, rowIds]) => {
        const sortKeys = getSortKeys(store, definition, rowIds);
        expectSame(
          sortKeys,
          getSorted(sortKeys, getSortKeyOrder(definition, sliceId)),
          `sort keys of ${sliceId}`,
        );
      });
    }
  });
});

// Rows whose object or array Cells are equal share a Slice, and an Index of
// them, or one sorted by them, agrees with one that is newly created.
test('groups and sorts Rows by object and array Cells', async () => {
  const sliceByTag = SLICES[7];
  const options: Options = {
    cells: {
      species: ['dog', 'cat'],
      tags: [[], ['a'], ['b'], ['a', 'b'], ['b', 'a'], ['a', 'a']],
      home: [{}, {zone: 'a'}, {zone: 'b'}],
    },
    slices: [part('tags'), part('home'), sliceByTag],
    sortKeys: [part<GetSortKey>((getCell) => getCell('tags') ?? [])],
  };
  const getRowIds = (slices: Slices): string[] =>
    slices.map(([, rowIds]) => [...rowIds].sort().join()).sort();
  await forEachSeed(RUNS, (random, trace) => {
    const world = createWorld(trace);
    const {store, indexes, definitions} = world;
    for (let step = 0; step < STEPS; step++) {
      operate(world, random, trace, options);
      const fresh = createFreshIndexes(world);
      definitions.forEach((definition, indexId) => {
        const slices = getSlices(indexes, indexId);
        expectSame(
          getDetermined(store, definition, slices),
          getDetermined(store, definition, getSlices(fresh, indexId)),
          `Slices of ${indexId}`,
        );
        const {tableId, slices: slicesPart} = definition;
        if (slicesPart == sliceByTag) {
          expectSame(
            getSets(slices),
            getSets(getModelSlices(store, definition)),
            `Slices of ${indexId} by tag`,
          );
        } else {
          const cellId = slicesPart.value as Id;
          const rowIdsByCell = new Map<string, Ids>();
          Object.entries(store.getTable(tableId)).forEach(([rowId, row]) =>
            rowIdsByCell.set(code(row[cellId]), [
              ...(rowIdsByCell.get(code(row[cellId])) ?? []),
              rowId,
            ]),
          );
          expectSame(
            getRowIds(slices),
            getRowIds([...rowIdsByCell]),
            `Row Ids of ${indexId} by ${cellId}`,
          );
        }
      });
    }
  });
});

// -- Regressions

test.fails(
  'follows the Store when a transaction that defines an Index is rolled ' +
    'back (bug: definition-in-transaction)',
  () => {
    const store = createStore().setTable('pets', {fido: {species: 'dog'}});
    const indexes = createIndexes(store);
    store.transaction(
      () => {
        store.setCell('pets', 'fido', 'species', 'cat');
        indexes.setIndexDefinition('bySpecies', 'pets', 'species');
      },
      () => true,
    );
    expect(indexes.getSliceIds('bySpecies')).toEqual(['dog']);
  },
);
