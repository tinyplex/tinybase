import type {
  Cell,
  GetCell,
  Id,
  MetricAggregate,
  MetricAggregateAdd,
  MetricAggregateRemove,
  MetricAggregateReplace,
  Metrics,
  Row,
  Store,
  Table,
  Tables,
} from 'tinybase';
import {createMetrics, createStore} from 'tinybase';
import {test} from 'vitest';
import type {Random, Trace} from '../../common/fuzz.ts';
import {code, expectSame, forEachSeed} from '../../common/fuzz.ts';

// Seeded fuzz tests of the metrics module. Each one applies a random sequence
// of changes to a Store, and to the Metric definitions over it, and checks
// one property of the Metrics object after every change.
//
//   FUZZ_RUNS=3000 npx vitest run --project unit \
//     test/unit/core/fuzz/metrics.fuzz.test.ts
//
// Sums and averages are kept up to date by adding and taking away, so they are
// only as exact as floating point arithmetic allows. A great number absorbs a
// small one that is added to it, and is not given back when it is taken away.
// So those two are checked exactly on integers, to a tolerance on fractions of
// a similar size, and not at all on numbers at the extremes of the range.

type Metric = number | undefined;
type MetricsObject = {[metricId: Id]: Metric};
type GetNumber = (getCell: GetCell, rowId: Id) => number;
type Shortcuts = [
  MetricAggregateAdd,
  MetricAggregateRemove,
  MetricAggregateReplace,
];

// The arguments of setMetricDefinition that follow the two Ids.
type DefinitionArgs = [
  aggregate?: 'sum' | 'avg' | 'min' | 'max' | MetricAggregate,
  getNumber?: Id | GetNumber,
  aggregateAdd?: MetricAggregateAdd,
  aggregateRemove?: MetricAggregateRemove,
  aggregateReplace?: MetricAggregateReplace,
];
type Definition = {tableId: Id; args: DefinitionArgs};

// A Store, its Metrics object, and what a test knows about them: the
// definitions that have been set, and each call that the listeners have had
// since the last operation.
type World = {
  store: Store;
  metrics: Metrics;
  definitions: Map<Id, Definition>;
  calls: [listenedId: Id | null, metricId: Id, ...changed: unknown[]][];
  idsCalls: number;
};

// One operation: the line of code that would perform it, and the function
// that does.
type Op = {
  code: string;
  run: (world: World) => void;
  // The Ids of any definitions it removes.
  removes?: Id[];
  // Whether it is one that should leave every metric as it was.
  inert?: boolean;
};

// What a test generates.
type Profile = {
  // The number of operations in each sequence.
  steps: number;
  // Makes a Cell.
  cell: (random: Random) => Cell;
  // Whether every number that a Row can produce is an integer, or a small
  // integer times a power of two, so that sums of them are exact.
  exact: boolean;
  // The largest magnitude that a Cell can have.
  magnitude: number;
  // How far a metric that is not exact may be from the value expected, given
  // the numbers it aggregates now, and the largest that one could ever be.
  tolerance: (numbers: number[], largest: number) => number;
  // The aggregates and the sources of numbers that definitions choose from.
  aggregates: readonly AggregateChoice[];
  getNumbers: readonly DefinitionArgs[1][];
  // Chooses each operation, where a test needs its own mix of them.
  op?: (random: Random, profile: Profile, world: World) => Op;
};

type AggregateChoice = {
  aggregate: DefinitionArgs[0];
  shortcuts?: Shortcuts;
  // Whether the result is the same however it is reached: always, as for a
  // minimum; when the numbers are integers, as for a sum; or never.
  exact: 'always' | 'integers' | 'never';
};

type Oracle = (
  world: World,
  profile: Profile,
  op: Op,
  before: MetricsObject,
) => void;

const TABLE_IDS = ['pets', 'species'];
const ROW_IDS: {[tableId: Id]: Id[]} = {
  pets: ['fido', 'felix', 'rex', 'tom', 'polly', 'nemo'],
  species: ['dog', 'cat', 'fish', 'bird', 'worm', 'horse'],
};
const CELL_IDS = ['price', 'weight', 'name'];
const METRIC_IDS = [
  'priceMetric',
  'weightMetric',
  'stockMetric',
  'salesMetric',
];

// A relative error that floating point arithmetic can account for.
//
// A sum or an average that is updated as each number changes rounds its
// result at most three times an update, each time by at most one part in
// 2 ** 53 of a value no more than fourteen times the largest number. An error
// already present can also be magnified, by an average, as many as six times
// as six Rows shrink to one. No sequence here has more than 40 operations, or
// more than 24 changed Rows in each. So the error is less than
// 3 * 14 * 6 * 960 * 2 ** -53, which is under 3e-11 of the largest number. By
// contrast, two different averages of up to six integers are at least 1 / 30
// apart, so this tolerance cannot hide a metric that is simply wrong.
const TOLERANCE = 1e-9;

const HUGE = 2 ** 1000;

// ---- Custom aggregates, and their shortcuts.

// Adds numbers up. Huge ones are first divided by a power of two, which loses
// nothing, so that the total does not overflow on its way to a sum that fits.
const sumOf = (numbers: number[]): number => {
  const unit = numbers.some((number) => Math.abs(number) > HUGE) ? 2 ** 20 : 1;
  return numbers.reduce((total, number) => total + number / unit, 0) * unit;
};
const meanOf = (numbers: number[]): number => {
  const unit = numbers.some((number) => Math.abs(number) > HUGE) ? 2 ** 20 : 1;
  return (
    (numbers.reduce((total, number) => total + number / unit, 0) /
      numbers.length) *
    unit
  );
};

// The spread of the numbers, which has no shortcuts.
const range: MetricAggregate = (numbers) =>
  Math.max(...numbers) - Math.min(...numbers);

// The sum of the squares of the numbers, with a shortcut for every change.
const squares: MetricAggregate = (numbers) =>
  sumOf(numbers.map((number) => number * number));
const addSquare: MetricAggregateAdd = (metric, add) => metric + add * add;
const removeSquare: MetricAggregateRemove = (metric, remove) =>
  metric - remove * remove;
const replaceSquare: MetricAggregateReplace = (metric, add, remove) =>
  metric + add * add - remove * remove;

// The example in the documentation of setMetricDefinition, in which shortcuts
// sometimes decline to help, and which has no value if no number is over 2.
const lowestOver2: MetricAggregate = (numbers) =>
  Math.min(...numbers.filter((number) => number > 2));
const addOver2: MetricAggregateAdd = (metric, add) =>
  add > 2 ? Math.min(metric, add) : metric;
const removeOver2: MetricAggregateRemove = (metric, remove) =>
  remove == metric ? undefined : metric;
const replaceOver2: MetricAggregateReplace = (metric, add, remove) =>
  remove == metric ? undefined : add > 2 ? Math.min(metric, add) : metric;

// How many numbers there are, which relies on each function being given the
// length of the list of numbers as it was before the change.
const count: MetricAggregate = (_numbers, length) => length;
const addCount: MetricAggregateAdd = (_metric, _add, length) => length + 1;
const removeCount: MetricAggregateRemove = (_metric, _remove, length) =>
  length - 1;
const replaceCount: MetricAggregateReplace = (_metric, _add, _remove, length) =>
  length;

const BUILT_IN: AggregateChoice[] = [
  {aggregate: undefined, exact: 'integers'},
  {aggregate: 'sum', exact: 'integers'},
  {aggregate: 'avg', exact: 'never'},
  {aggregate: 'min', exact: 'always'},
  {aggregate: 'max', exact: 'always'},
];
const RANGE: AggregateChoice = {aggregate: range, exact: 'always'};
const SQUARES: AggregateChoice = {
  aggregate: squares,
  shortcuts: [addSquare, removeSquare, replaceSquare],
  exact: 'integers',
};
const LOWEST_OVER_2: AggregateChoice = {
  aggregate: lowestOver2,
  shortcuts: [addOver2, removeOver2, replaceOver2],
  exact: 'always',
};
const COUNT: AggregateChoice = {
  aggregate: count,
  shortcuts: [addCount, removeCount, replaceCount],
  exact: 'always',
};
const AGGREGATES = [...BUILT_IN, RANGE, SQUARES, LOWEST_OVER_2, COUNT];

// ---- Custom sources of numbers.

const numberIn = (cell: unknown): number =>
  typeof cell == 'number' ? cell : 0;

// A number for every Row, from two of its Cells.
const pricePlusWeight: GetNumber = (getCell) =>
  numberIn(getCell('price')) + numberIn(getCell('weight'));

// A number for every Row, from its Id alone.
const idLength: GetNumber = (_getCell, rowId) => rowId.length;

// A number that can be a fraction, infinite, or not a number at all. The
// documentation does not say what becomes of those last two, so this is only
// used where a test needs no opinion about it.
const pricePerWeight: GetNumber = (getCell) =>
  (getCell('price') as number) / (getCell('weight') as number);

const GET_NUMBERS = [undefined, 'price', 'weight', pricePlusWeight, idLength];

// ---- Cells.

// Cells that the documentation leaves no doubt are not numbers.
const NOT_NUMBERS: Cell[] = ['dog', '', true, false];

// Cells that are not numbers, but which a Metrics object might take for one.
// As above, these are only used where a test needs no opinion about that.
const NEARLY_NUMBERS: Cell[] = [
  '7',
  ' 4 ',
  '0x9',
  '-3',
  ' ',
  'Infinity',
  '-Infinity',
  null,
  -0,
  [],
  [7],
  {},
];

const integer = (random: Random): number => random.int(19) - 9;

const cellOf =
  (number: (random: Random) => number, others = NOT_NUMBERS) =>
  (random: Random): Cell =>
    random.bool(0.85) ? number(random) : random.pick(others);

// ---- Profiles.

// Small integers, so that every aggregate but an average is exact, and with
// the same few values turning up in many Rows.
const INTEGERS: Profile = {
  steps: 32,
  cell: cellOf(integer),
  exact: true,
  magnitude: 9,
  tolerance: (_numbers, largest) => TOLERANCE * largest,
  aggregates: AGGREGATES,
  getNumbers: GET_NUMBERS,
};

// The same, with Cells and numbers of every awkward kind as well.
const ANYTHING: Profile = {
  ...INTEGERS,
  cell: cellOf(integer, [...NOT_NUMBERS, ...NEARLY_NUMBERS]),
  getNumbers: [...GET_NUMBERS, pricePerWeight],
};

// Small integers times one power of two, anywhere in the range of numbers,
// which keeps the same arithmetic exact at any scale.
const SCALES = [2 ** -1022, 2 ** -511, 1, 2 ** 511, 2 ** 1016];
const scaled = (random: Random): Profile => {
  const scale = random.pick(SCALES);
  return {
    ...INTEGERS,
    cell: cellOf((random) => integer(random) * scale),
    magnitude: 9 * scale,
    aggregates: [...BUILT_IN, RANGE, LOWEST_OVER_2, COUNT],
  };
};

// The numbers at the edges of what a Cell can hold.
const EXTREMES = [
  1e308,
  -1e308,
  Number.MAX_VALUE,
  -Number.MAX_VALUE,
  Number.MAX_SAFE_INTEGER,
  -Number.MAX_SAFE_INTEGER,
  2 ** 53,
  5e-324,
  -5e-324,
  0,
  -0,
  1,
  -1,
  3,
];
const EXTREME: Profile = {
  ...INTEGERS,
  cell: cellOf((random) => random.pick(EXTREMES)),
  exact: false,
  tolerance: (numbers) => TOLERANCE * Math.max(...numbers.map(Math.abs)),
  aggregates: [
    {aggregate: 'min', exact: 'always'},
    {aggregate: 'max', exact: 'always'},
    RANGE,
    LOWEST_OVER_2,
    COUNT,
  ],
  getNumbers: [undefined, 'price', 'weight', idLength],
};

// Numbers with fractions, whose sums are rounded.
const FLOATS: Profile = {
  ...INTEGERS,
  cell: cellOf((random) => (random.bool() ? 1 : -1) * (1 + random.next() * 63)),
  exact: false,
  tolerance: (numbers) => TOLERANCE * Math.max(...numbers.map(Math.abs)),
  aggregates: [...BUILT_IN, RANGE, LOWEST_OVER_2, COUNT],
  getNumbers: [undefined, 'price', 'weight'],
};

// ---- Formatting.

// Formats a value as it would be written in code.
const js = (value: unknown): string =>
  typeof value == 'function'
    ? value.name
    : Object.is(value, -0)
      ? '-0'
      : value != null && typeof value == 'object' && !Array.isArray(value)
        ? '{' +
          Object.entries(value)
            .map(([key, child]) => key + ': ' + js(child))
            .join(', ') +
          '}'
        : code(value);

// ---- Operations.

const call = (
  target: 'store' | 'metrics',
  method: string,
  ...args: unknown[]
): Op => ({
  code: `${target}.${method}(${args.map(js).join(', ')});`,
  run: (world) => (world[target] as any)[method](...args),
});

const transactionOf = (
  ops: Op[],
  doRollback?: boolean,
  inert = doRollback == true,
): Op => ({
  code:
    'store.transaction(() => {' +
    ops.map(({code}) => ' ' + code).join('') +
    (doRollback == null ? ' });' : ` }, () => ${doRollback});`),
  run: (world) =>
    world.store.transaction(
      () => ops.forEach((op) => op.run(world)),
      doRollback == null ? undefined : () => doRollback,
    ),
  removes: ops.flatMap(({removes = []}) => removes),
  inert,
});

const randomRow = (random: Random, {cell}: Profile): Row => {
  const row: Row = {};
  CELL_IDS.forEach((cellId) => {
    if (random.bool(0.6)) {
      row[cellId] = cell(random);
    }
  });
  return row;
};

const randomTable = (random: Random, profile: Profile, tableId: Id): Table => {
  const table: Table = {};
  random
    .shuffle(ROW_IDS[tableId])
    .slice(0, random.int(7))
    .forEach((rowId) => (table[rowId] = randomRow(random, profile)));
  return table;
};

const randomTables = (random: Random, profile: Profile): Tables => {
  const tables: Tables = {};
  TABLE_IDS.forEach((tableId) => {
    if (random.bool(0.7)) {
      tables[tableId] = randomTable(random, profile, tableId);
    }
  });
  return tables;
};

// One change to the Store.
const randomChange = (random: Random, profile: Profile): Op => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS[tableId]);
  const cellId = random.pick(CELL_IDS);
  return random.weighted<() => Op>([
    [
      8,
      () =>
        call('store', 'setCell', tableId, rowId, cellId, profile.cell(random)),
    ],
    [3, () => call('store', 'delCell', tableId, rowId, cellId)],
    [
      3,
      () => call('store', 'setRow', tableId, rowId, randomRow(random, profile)),
    ],
    [
      2,
      () =>
        call(
          'store',
          'setPartialRow',
          tableId,
          rowId,
          randomRow(random, profile),
        ),
    ],
    [3, () => call('store', 'delRow', tableId, rowId)],
    [
      2,
      () =>
        call(
          'store',
          'setTable',
          tableId,
          randomTable(random, profile, tableId),
        ),
    ],
    [1, () => call('store', 'delTable', tableId)],
    [1, () => call('store', 'setTables', randomTables(random, profile))],
    [0.5, () => call('store', 'delTables')],
  ])();
};

const randomChanges = (random: Random, profile: Profile): Op[] =>
  Array.from({length: 1 + random.int(4)}, () => randomChange(random, profile));

// A transaction that commits.
const randomTransaction = (random: Random, profile: Profile): Op =>
  transactionOf(
    randomChanges(random, profile),
    random.bool(0.3) ? false : undefined,
  );

// An operation that should change no metric: a transaction that rolls back,
// or one whose changes cancel out, or a change to what is already there.
const randomInert = (random: Random, profile: Profile, {store}: World): Op => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS[tableId]);
  const cellId = random.pick(CELL_IDS);
  const cell = store.getCell(tableId, rowId, cellId);
  const row = store.getRow(tableId, rowId);
  const op = random.weighted<() => Op>([
    [5, () => transactionOf(randomChanges(random, profile), true)],
    [1, () => transactionOf([])],
    [
      3,
      () =>
        transactionOf([
          call(
            'store',
            'setCell',
            tableId,
            rowId,
            cellId,
            profile.cell(random),
          ),
          cell === undefined
            ? call('store', 'delCell', tableId, rowId, cellId)
            : call('store', 'setCell', tableId, rowId, cellId, cell),
        ]),
    ],
    // This one moves the Row to the end of its Table.
    [
      3,
      () =>
        transactionOf([
          call('store', 'delRow', tableId, rowId),
          call('store', 'setRow', tableId, rowId, row),
        ]),
    ],
    [1, () => call('store', 'setRow', tableId, rowId, row)],
    [1, () => call('store', 'setTable', tableId, store.getTable(tableId))],
    [1, () => call('store', 'setTables', store.getTables())],
  ])();
  return {...op, inert: true};
};

// Sets a definition, whether or not there is one with that Id already.
const randomDefinition = (
  random: Random,
  {aggregates, getNumbers}: Profile,
  metricId = random.pick(METRIC_IDS),
): Op => {
  const tableId = random.weighted([
    [5, 'pets'],
    [3, 'species'],
    [1, 'owners'],
  ]);
  const {aggregate, shortcuts = []} = random.pick(aggregates);
  const args: DefinitionArgs = [
    aggregate,
    random.pick(getNumbers),
    ...shortcuts.map((shortcut) => (random.bool(0.6) ? shortcut : undefined)),
  ] as DefinitionArgs;
  return definitionOf(metricId, tableId, args);
};

const definitionOf = (metricId: Id, tableId: Id, args: DefinitionArgs): Op => {
  while (args.length > 0 && args[args.length - 1] === undefined) {
    args.pop();
  }
  return {
    code:
      'metrics.setMetricDefinition(' +
      [metricId, tableId, ...args].map(js).join(', ') +
      ');',
    run: ({metrics, definitions}) => {
      metrics.setMetricDefinition(metricId, tableId, ...args);
      definitions.set(metricId, {tableId, args});
    },
  };
};

const removalOf = (metricId: Id): Op => ({
  code: `metrics.delMetricDefinition(${js(metricId)});`,
  run: ({metrics, definitions}) => {
    metrics.delMetricDefinition(metricId);
    definitions.delete(metricId);
  },
  removes: [metricId],
});

// Any operation at all, with more definitions being set while there are few.
const randomOp = (random: Random, profile: Profile, world: World): Op =>
  random.weighted<() => Op>([
    [10, () => randomChange(random, profile)],
    [3, () => randomTransaction(random, profile)],
    [3, () => randomInert(random, profile, world)],
    [
      world.definitions.size < 2 ? 8 : 2,
      () => randomDefinition(random, profile),
    ],
    [1, () => removalOf(random.pick(METRIC_IDS))],
  ])();

// ---- The model.

// The number that a Row gives to a definition. A Row gives none if the Cell
// named is missing or is not a number: the documentation says only that the
// Cell 'contains the numerical values', and the existing tests have a Row
// whose Cell is a string being left out.
const modelNumber = (
  getNumber: DefinitionArgs[1],
  row: Row,
  rowId: Id,
): Metric => {
  if (getNumber === undefined) {
    return 1;
  }
  if (typeof getNumber == 'function') {
    return getNumber((cellId) => row[cellId], rowId);
  }
  const cell = row[getNumber];
  return typeof cell == 'number' ? cell : undefined;
};

const modelNumbers = (
  {tableId, args: [, getNumber]}: Definition,
  tables: Tables,
): number[] =>
  Object.entries(tables[tableId] ?? {})
    .map(([rowId, row]) => modelNumber(getNumber, row, rowId))
    .filter((number) => number !== undefined);

// The value of a metric, worked out naively from every number. It has none if
// there are no numbers, or if the aggregate of them is not a finite number,
// just as a Store will not hold a number that is not finite.
const modelMetric = (
  {args: [aggregate]}: Definition,
  numbers: number[],
): Metric => {
  if (numbers.length == 0) {
    return undefined;
  }
  const metric =
    typeof aggregate == 'function'
      ? aggregate(numbers, numbers.length)
      : aggregate == 'avg'
        ? meanOf(numbers)
        : aggregate == 'min'
          ? Math.min(...numbers)
          : aggregate == 'max'
            ? Math.max(...numbers)
            : sumOf(numbers);
  return Number.isFinite(metric) ? metric : undefined;
};

// How far the metric of a definition may be from the value expected.
const toleranceOf = (
  {exact, magnitude, tolerance}: Profile,
  {args: [aggregate, getNumber]}: Definition,
  numbers: number[] = [],
): number => {
  const choice = AGGREGATES.find((choice) => choice.aggregate === aggregate);
  return choice?.exact == 'always' ||
    (choice?.exact == 'integers' && exact && getNumber != pricePerWeight)
    ? 0
    : tolerance(
        numbers,
        getNumber === undefined
          ? 1
          : getNumber == idLength
            ? 5
            : getNumber == pricePlusWeight
              ? 2 * magnitude
              : magnitude,
      );
};

// Returns the expected value, or the actual one if it is close enough, so that
// one comparison can then show every metric that is wrong. The sign of a zero
// is not something that this ever distinguishes.
const near = (actual: Metric, expected: Metric, tolerance: number): Metric =>
  actual !== undefined &&
  expected !== undefined &&
  Math.abs(actual - expected) <= tolerance
    ? actual
    : expected;

// ---- The things under test.

const createWorld = (trace: Trace): World => {
  trace('const store = createStore();');
  trace('const metrics = createMetrics(store);');
  const store = createStore();
  const metrics = createMetrics(store);
  const world: World = {
    store,
    metrics,
    definitions: new Map(),
    calls: [],
    idsCalls: 0,
  };
  [...METRIC_IDS, null].forEach((listenedId) =>
    metrics.addMetricListener(
      listenedId,
      (calledMetrics, metricId, newMetric, oldMetric) =>
        world.calls.push([
          listenedId,
          metricId,
          newMetric,
          oldMetric,
          calledMetrics === metrics,
        ]),
    ),
  );
  metrics.addMetricIdsListener(() => world.idsCalls++);
  return world;
};

const getMetrics = (metrics: Metrics): MetricsObject =>
  Object.fromEntries(
    METRIC_IDS.map((metricId) => [metricId, metrics.getMetric(metricId)]),
  );

// Applies a sequence of operations, checking something after each one.
const fuzz =
  (getProfile: Profile | ((random: Random) => Profile), oracle: Oracle) =>
  (random: Random, trace: Trace): void => {
    const profile =
      typeof getProfile == 'function' ? getProfile(random) : getProfile;
    const world = createWorld(trace);
    for (let step = 0; step < profile.steps; step++) {
      const op = (profile.op ?? randomOp)(random, profile, world);
      const before = getMetrics(world.metrics);
      world.calls = [];
      world.idsCalls = 0;
      trace(op.code);
      op.run(world);
      oracle(world, profile, op, before);
    }
  };

// ---- Oracles.

// Every metric has the value that the same definition has on a new Metrics
// object, which has only ever seen the Store as it is now.
const expectAsNew: Oracle = ({store, metrics, definitions}, profile) => {
  const fresh = createMetrics({...store});
  const actual = getMetrics(metrics);
  const expected: MetricsObject = {};
  definitions.forEach((definition, metricId) => {
    fresh.setMetricDefinition(metricId, definition.tableId, ...definition.args);
    expected[metricId] = near(
      actual[metricId],
      fresh.getMetric(metricId),
      toleranceOf(profile, definition),
    );
  });
  fresh.destroy();
  expectSame(actual, expected, 'metrics, against a new Metrics object');
};

// Every metric has the value that a naive aggregation of its Table has.
const expectAsModel: Oracle = ({store, metrics, definitions}, profile) => {
  const tables = store.getTables();
  const actual = getMetrics(metrics);
  const expected: MetricsObject = {};
  definitions.forEach((definition, metricId) => {
    const numbers = modelNumbers(definition, tables);
    expected[metricId] = near(
      actual[metricId],
      modelMetric(definition, numbers),
      toleranceOf(profile, definition, numbers),
    );
  });
  expectSame(actual, expected, 'metrics, against a naive model');
};

// The listener for each metric, and the one for all of them, has been called
// once for each metric that has a different value, and for no other.
//
// Removing a definition is the exception. It takes the value of the metric
// away without a call to any listener, and the documentation does not say
// whether there should be one, so nothing is expected either way.
const expectCalls: Oracle = ({metrics, calls}, _profile, op, before) => {
  const after = getMetrics(metrics);
  const changedIds = METRIC_IDS.filter(
    (metricId) =>
      after[metricId] !== before[metricId] && !op.removes?.includes(metricId),
  );
  const sorted = (rows: World['calls']): World['calls'] =>
    rows.sort((row1, row2) => (js(row1) < js(row2) ? -1 : 1));
  expectSame(
    sorted(calls.filter(([, metricId]) => !op.removes?.includes(metricId))),
    sorted(
      [...METRIC_IDS, null].flatMap((listenedId) =>
        changedIds
          .filter((metricId) => listenedId == null || listenedId == metricId)
          .map((metricId): World['calls'][number] => [
            listenedId,
            metricId,
            after[metricId],
            before[metricId],
            true,
          ]),
      ),
    ),
    'calls to listeners',
  );
};

// The methods that describe the definitions agree with them, and with each
// other.
const expectIds: Oracle = ({metrics, definitions}) => {
  const each: [Id, Metric][] = [];
  metrics.forEachMetric((metricId, metric) => each.push([metricId, metric]));
  const ids = [...METRIC_IDS, 'noMetric'];
  const valued = ids.filter(
    (metricId) => metrics.getMetric(metricId) !== undefined,
  );
  expectSame(
    {
      ids: [...metrics.getMetricIds()].sort(),
      tableIds: ids.map((metricId) => metrics.getTableId(metricId)),
      has: ids.filter((metricId) => metrics.hasMetric(metricId)),
      each: each.sort(),
      undefinedButValued: valued.filter(
        (metricId) => !definitions.has(metricId),
      ),
    },
    {
      ids: [...definitions.keys()].sort(),
      tableIds: ids.map((metricId) => definitions.get(metricId)?.tableId),
      has: valued,
      each: valued
        .map((metricId): [Id, Metric] => [
          metricId,
          metrics.getMetric(metricId),
        ])
        .sort(),
      undefinedButValued: [],
    },
    'the definitions',
  );
};

// An operation that should change no metric has changed none, and has called
// no listener.
const expectInert: Oracle = ({metrics, calls}, _profile, op, before) => {
  if (op.inert) {
    expectSame(
      {metrics: getMetrics(metrics), calls},
      {metrics: before, calls: []},
      'metrics and calls to listeners, after an operation that changes nothing',
    );
  }
};

// ---- Tests.

// An incrementally maintained metric equals one worked out from scratch.
test('metrics match those of a new Metrics object', async () => {
  await forEachSeed(60, fuzz(ANYTHING, expectAsNew));
});

// A metric is the documented aggregate of the numbers in its Table.
test('metrics match a naive model', async () => {
  await forEachSeed(60, fuzz(INTEGERS, expectAsModel));
});

// A MetricListener is called exactly when its metric changes, with its values.
test('listeners are called once for each metric that changes', async () => {
  await forEachSeed(60, fuzz(ANYTHING, expectCalls));
});

// getMetricIds, getTableId, hasMetric and forEachMetric tell one story.
test('definitions and their values are described consistently', async () => {
  await forEachSeed(60, fuzz(ANYTHING, expectIds));
});

// A transaction that rolls back, or changes nothing, leaves no trace.
test('rolled back and empty transactions change no metric', async () => {
  await forEachSeed(
    60,
    fuzz(
      {
        ...ANYTHING,
        op: (random, profile, world) =>
          random.bool(0.5)
            ? randomInert(random, profile, world)
            : randomOp(random, profile, world),
      },
      expectInert,
    ),
  );
});

// The same holds when every number is at one extreme of the range.
test('metrics match a naive model at any scale', async () => {
  await forEachSeed(60, fuzz(scaled, expectAsModel));
});

// Minimums, maximums and counts are right for the most extreme numbers.
test('metrics of extreme numbers match a naive model', async () => {
  await forEachSeed(60, fuzz(EXTREME, expectAsModel));
});

// A sum or an average is as accurate as the numbers it now has allow.
test('metrics of fractions stay close to a naive model', async () => {
  await forEachSeed(60, fuzz(FLOATS, expectAsModel));
});
