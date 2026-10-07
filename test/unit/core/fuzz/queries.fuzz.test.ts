import type {
  Cell,
  GetCell,
  GetTableCell,
  Group,
  Having,
  Id,
  Ids,
  Join,
  Param,
  Queries,
  ResultCell,
  ResultRow,
  ResultTable,
  Row,
  Select,
  SelectAll,
  Store,
  Table,
  Tables,
  Where,
} from 'tinybase';
import {createQueries, createStore} from 'tinybase';
import {test} from 'vitest';
import type {Random, Trace} from '../../common/fuzz.ts';
import {code, expectSame, forEachSeed} from '../../common/fuzz.ts';

// Seeded fuzz tests for the Queries module. Each applies a long random
// sequence of Store changes and query definitions to one Queries object, whose
// results are maintained incrementally. After every step, those results are
// compared with the results of a fresh Queries object that has been given the
// same data and the same definitions, and so has computed them from scratch.

const defaultRuns = 30;

// A longer hunt needs longer than a test is otherwise allowed.
const timeout = 20000 + Number(process.env.FUZZ_RUNS ?? 0) * 1000;

type Keywords = {
  select: Select;
  selectAll: SelectAll;
  join: Join;
  where: Where;
  group: Group;
  having: Having;
  param: Param;
};

// One clause of a query definition: how it is written in the trace, and a
// function that makes the same call.
type Clause = readonly [source: string, apply: (keywords: Keywords) => void];

// One operation on the Store or the Queries object, in the same two forms.
type Step = readonly [source: string, run: () => void];

// A Cell that a query can read: the arguments that identify it to a clause,
// and the values it can take.
type Column = {path: Ids; values: readonly Cell[]};

// A Cell of a query's result: whether it only ever holds numbers, and the
// values it can take, if those are known.
type Selected = {id: Id; numeric: boolean; values?: readonly Cell[]};

// The numbers that are aggregated in a run, and how exactly an incrementally
// maintained sum or average of them can be expected to match a fresh one. A
// margin is what to add to a threshold so that no aggregate can be close
// enough to it for rounding to decide which side it is on.
type Regime = {
  numbers: readonly number[];
  sum?: number;
  avg: number;
  sumMargin?: number;
  avgMargin?: number;
};

type Query = {
  tableId: Id;
  source: string;
  build: (keywords: Keywords) => void;
  // The result Cells that Rows are grouped by, if the query groups at all.
  dims?: Ids;
  // How far each inexactly aggregated result Cell may stray.
  tolerances: {[cellId: Id]: number};
};

type Features = {
  tables: Ids;
  calculated?: boolean;
  joins?: boolean;
  wheres?: boolean;
  groups?: boolean;
  havings?: boolean;
};

type Options = {
  features: Features;
  regimes: (keyof typeof REGIMES)[];
  steps?: number;
  listeners?: boolean;
  churn?: boolean;
};

const QUERY_IDS = ['q1', 'q2', 'q3'];
const PET_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const OWNER_IDS = ['o1', 'o2', 'o3'];
const SPECIES_IDS = ['dog', 'cat', 'fish'];
// Cells that results often have, for listeners that are registered before
// any query is defined to choose to sort by.
const SORTED_CELL_IDS = ['price', 'color', 'species', 'calculated'];
const ROW_IDS: {[tableId: Id]: Ids} = {
  pets: PET_IDS,
  owners: OWNER_IDS,
  species: SPECIES_IDS,
};

// Small integers are summed exactly, however the sum is arrived at. So are the
// extreme ones, which are chosen so that no sum of them can reach 2 ** 53.
const REGIMES = {
  small: {
    numbers: [0, 1, 2, 3, -1],
    avg: 1e-9,
    sumMargin: 0,
    avgMargin: 0.07,
  },
  float: {
    numbers: [0.1, 0.2, 0.3, 1.5, 2.25, -0.7],
    sum: 1e-9,
    avg: 1e-9,
    sumMargin: 0.025,
  },
  extreme: {
    numbers: [1e15, -1e15, 1e15 + 1, 1, -1, 2, 0],
    avg: 1e3,
    sumMargin: 0,
  },
  huge: {
    numbers: [1e300, -1e300, 1.5e300, 1e-300, 1, -1, 0],
    sum: 1e291,
    avg: 1e291,
  },
} satisfies {[name: string]: Regime};

// The Cells of each Table, with few enough values that joins often match,
// groups often collide, and conditions are often met. Some of the Ids that
// pets and owners refer to are of Rows that never exist.
const getDomains = (
  numbers: readonly number[],
): {[tableId: Id]: {[cellId: Id]: readonly Cell[]}} => ({
  pets: {
    species: [...SPECIES_IDS, 'emu'],
    ownerId: [...OWNER_IDS, 'o9'],
    friend: PET_IDS,
    color: ['black', 'brown'],
    sold: [true, false],
    price: numbers,
  },
  owners: {
    name: ['Alice', 'Bob'],
    state: ['CA', 'WA'],
    favorite: [...SPECIES_IDS, 'emu'],
    budget: numbers,
  },
  species: {
    class: ['mammal', 'fish'],
    legs: [0, 2, 4],
    price: numbers,
  },
});

// The joins that can be made from each root Table: the Id each is known by,
// the Table it reaches, the join it is made through (if not from the root),
// and the Cell holding the Id of the Row to join to.
const JOINS: {
  [tableId: Id]: (readonly [
    alias: Id,
    tableId: Id,
    from: Id | undefined,
    on: Id,
  ])[];
} = {
  pets: [
    ['owners', 'owners', undefined, 'ownerId'],
    ['species', 'species', undefined, 'species'],
    ['favorites', 'species', 'owners', 'favorite'],
    ['friends', 'pets', undefined, 'friend'],
    ['friendOwners', 'owners', 'friends', 'ownerId'],
    ['friendFavorites', 'species', 'friendOwners', 'favorite'],
  ],
  owners: [['species', 'species', undefined, 'favorite']],
  species: [],
};

// The ways to aggregate a result Cell: the Id the aggregate is known by, how
// its arguments are written, those arguments, and how exact it is. The custom
// ones have differing sets of shortcuts for a value being added, removed, or
// replaced, each of which has to agree with aggregating from scratch.
type Aggregate = readonly [
  name: string,
  source: string,
  parameters: readonly unknown[],
  kind: 'exact' | 'sum' | 'avg',
];

const ANY_AGGREGATES: Aggregate[] = [
  ['count', code('count'), ['count'], 'exact'],
  [
    'size',
    '(cells, length) => length, ' +
      '(current, add, length) => length + 1, ' +
      '(current, remove, length) => length - 1, ' +
      '(current, add, remove, length) => length',
    [
      (_cells: ResultCell[], length: number) => length,
      (_current: ResultCell, _add: ResultCell, length: number) => length + 1,
      (_current: ResultCell, _remove: ResultCell, length: number) => length - 1,
      (
        _current: ResultCell,
        _add: ResultCell,
        _remove: ResultCell,
        length: number,
      ) => length,
    ],
    'exact',
  ],
  [
    'list',
    '(cells) => [...cells].sort().join()',
    [(cells: ResultCell[]) => [...cells].sort().join()],
    'exact',
  ],
];

const NUMERIC_AGGREGATES: Aggregate[] = [
  ['sum', code('sum'), ['sum'], 'sum'],
  ['avg', code('avg'), ['avg'], 'avg'],
  ['min', code('min'), ['min'], 'exact'],
  ['max', code('max'), ['max'], 'exact'],
  [
    'range',
    '(cells) => Math.max(...cells) - Math.min(...cells)',
    [(cells: number[]) => Math.max(...cells) - Math.min(...cells)],
    'exact',
  ],
  [
    'total',
    '(cells) => cells.reduce((total, cell) => total + cell, 0), ' +
      '(current, add) => current + add, ' +
      '(current, remove) => current - remove, ' +
      '(current, add, remove) => current - remove + add',
    [
      (cells: number[]) => cells.reduce((total, cell) => total + cell, 0),
      (current: number, add: number) => current + add,
      (current: number, remove: number) => current - remove,
      (current: number, add: number, remove: number) => current - remove + add,
    ],
    'sum',
  ],
  [
    'top',
    '(cells) => Math.max(...cells), ' +
      '(current, add) => Math.max(current, add), ' +
      '(current, remove) => (remove == current ? undefined : current)',
    [
      (cells: number[]) => Math.max(...cells),
      (current: number, add: number) => Math.max(current, add),
      (current: number, remove: number) =>
        remove == current ? undefined : current,
    ],
    'exact',
  ],
];

const args = (...values: unknown[]): string => values.map(code).join(', ');

// How many filtering clauses to use: few, so that results are rarely empty.
const randomCount = (random: Random): number =>
  random.weighted([
    [5, 0],
    [4, 1],
    [1, 2],
  ]);

const isNumeric = (values: readonly Cell[]): boolean =>
  values.every((value) => typeof value == 'number');

const randomRow = (
  random: Random,
  domain: {[cellId: Id]: readonly Cell[]},
): Row => {
  const row: Row = {};
  Object.entries(domain).forEach(([cellId, values]) => {
    if (random.bool(0.8)) {
      row[cellId] = random.pick(values);
    }
  });
  return row;
};

const randomTable = (
  random: Random,
  rowIds: Ids,
  domain: {[cellId: Id]: readonly Cell[]},
): Table => {
  const table: Table = {};
  rowIds.forEach((rowId) => {
    if (random.bool(0.9)) {
      table[rowId] = randomRow(random, domain);
    }
  });
  return table;
};

// A single change to the Store.
const randomChange = (random: Random, store: Store, regime: Regime): Step => {
  const tableId = random.weighted([
    [6, 'pets'],
    [2, 'owners'],
    [2, 'species'],
  ]);
  const domain = getDomains(regime.numbers)[tableId];
  const rowId = random.pick(ROW_IDS[tableId]);
  const cellId = random.pick(Object.keys(domain));
  return random.weighted<() => Step>([
    [
      30,
      () => {
        const cell = random.pick(domain[cellId]);
        return [
          `store.setCell(${args(tableId, rowId, cellId, cell)});`,
          () => store.setCell(tableId, rowId, cellId, cell),
        ];
      },
    ],
    [
      10,
      () => [
        `store.delCell(${args(tableId, rowId, cellId)});`,
        () => store.delCell(tableId, rowId, cellId),
      ],
    ],
    [
      15,
      () => {
        const row = randomRow(random, domain);
        return [
          `store.setRow(${args(tableId, rowId, row)});`,
          () => store.setRow(tableId, rowId, row),
        ];
      },
    ],
    [
      5,
      () => {
        const row = randomRow(random, domain);
        return [
          `store.setPartialRow(${args(tableId, rowId, row)});`,
          () => store.setPartialRow(tableId, rowId, row),
        ];
      },
    ],
    [
      8,
      () => [
        `store.delRow(${args(tableId, rowId)});`,
        () => store.delRow(tableId, rowId),
      ],
    ],
    [
      3,
      () => {
        const table = randomTable(random, ROW_IDS[tableId], domain);
        return [
          `store.setTable(${args(tableId, table)});`,
          () => store.setTable(tableId, table),
        ];
      },
    ],
    [
      1,
      () => [
        `store.delTable(${args(tableId)});`,
        () => store.delTable(tableId),
      ],
    ],
    [1, () => ['store.delTables();', () => store.delTables()]],
  ])();
};

// Several changes to the Store in one transaction, which is perhaps then
// rolled back.
const randomTransaction = (
  random: Random,
  store: Store,
  steps: Step[],
  rollback: boolean,
): Step => [
  'store.transaction(() => {' +
    steps.map(([source]) => source).join(' ') +
    (rollback ? '}, () => true);' : '});'),
  () =>
    store.transaction(
      () => steps.forEach(([, run]) => run()),
      () => rollback,
    ),
];

const randomQuery = (
  random: Random,
  regime: Regime,
  features: Features,
): Query => {
  const tableId = random.pick(features.tables);
  const domains = getDomains(regime.numbers);
  const selects: Clause[] = [];
  const others: Clause[] = [];
  const sources: (readonly [alias: Id | undefined, tableId: Id])[] = [
    [undefined, tableId],
  ];
  const tolerances: {[cellId: Id]: number} = {};

  // JOIN

  if (features.joins) {
    const joins = JOINS[tableId].filter(
      ([alias, joinedTableId, from]) =>
        (from === undefined || sources.some(([other]) => other === from)) &&
        random.bool() &&
        sources.push([alias, joinedTableId]),
    );
    joins.forEach(([alias, joinedTableId, from, on]) => {
      const path = from === undefined ? [joinedTableId] : [joinedTableId, from];
      const as = alias == joinedTableId ? undefined : alias;
      const calculated = random.bool(0.2);
      others.push([
        'join(' +
          args(...path) +
          (calculated
            ? `, (getCell) => getCell(${args(on)}) ?? 'none')`
            : `, ${args(on)})`) +
          (as ? `.as(${args(as)});` : ';'),
        ({join}) => {
          const joined = (join as any)(
            ...path,
            calculated ? (getCell: GetCell) => getCell(on) ?? 'none' : on,
          );
          if (as) {
            joined.as(as);
          }
        },
      ]);
    });
  }

  const randomColumn = (): Column => {
    const [alias, sourceTableId] = random.pick(sources);
    const cellId = random.pick(Object.keys(domains[sourceTableId]));
    return {
      path:
        alias === undefined
          ? random.bool(0.2)
            ? [tableId, cellId]
            : [cellId]
          : [alias, cellId],
      values: domains[sourceTableId][cellId],
    };
  };
  const read = (getTableCell: GetTableCell, {path}: Column) =>
    (getTableCell as any)(...path) as Cell | undefined;
  const reads = ({path}: Column): string => `getTableCell(${args(...path)})`;

  // SELECT

  const selected: Selected[] = [];
  const unique = (id: Id): Id => {
    let uniqueId = id;
    for (let suffix = 2; selected.some(({id}) => id == uniqueId); suffix++) {
      uniqueId = id + suffix;
    }
    return uniqueId;
  };
  // Selects a Cell that would be known by one Id, to be known by another if
  // that differs, or is already taken.
  const addSelect = (
    source: string,
    parameters: unknown[],
    defaultId: Id,
    wantedId: Id,
    numeric: boolean,
    values?: readonly Cell[],
  ): void => {
    const id = unique(wantedId);
    selects.push([
      `select(${source})` + (id != defaultId ? `.as(${args(id)});` : ';'),
      ({select}) => {
        const selectedAs = (select as any)(...parameters);
        if (id != defaultId) {
          selectedAs.as(id);
        }
      },
    ]);
    selected.push({id, numeric, values});
  };

  for (let count = 1 + random.int(3); count > 0; count--) {
    const column = randomColumn();
    const other = randomColumn();
    const value = random.pick(column.values);
    if (!features.calculated || random.bool(0.7)) {
      addSelect(
        args(...column.path),
        column.path,
        column.path[column.path.length - 1],
        random.bool(0.7)
          ? column.path[column.path.length - 1]
          : column.path.join('_'),
        isNumeric(column.values),
        column.values,
      );
    } else {
      const [source, get, numeric] = random.pick<
        [
          string,
          (getTableCell: GetTableCell, rowId: Id) => Cell | undefined,
          boolean,
        ]
      >([
        ['(_, rowId) => rowId', (_, rowId) => rowId, false],
        [
          `(getTableCell) => ${reads(column)} !== undefined`,
          (getTableCell) => read(getTableCell, column) !== undefined,
          false,
        ],
        [
          `(getTableCell) => ${reads(column)} ?? ${reads(other)}`,
          (getTableCell) =>
            read(getTableCell, column) ?? read(getTableCell, other),
          isNumeric(column.values) && isNumeric(other.values),
        ],
        [
          `(getTableCell) => ${reads(column)} === ${args(value)} ` +
            `? ${reads(other)} : undefined`,
          (getTableCell) =>
            read(getTableCell, column) === value
              ? read(getTableCell, other)
              : undefined,
          isNumeric(other.values),
        ],
        [
          `(getTableCell) => ${reads(column)} + '/' + ${reads(other)}`,
          (getTableCell) =>
            read(getTableCell, column) + '/' + read(getTableCell, other),
          false,
        ],
      ]);
      // Without an alias, a calculated Cell is named for its position.
      addSelect(
        source,
        [get],
        '' + selects.length,
        random.bool(0.8) ? 'calculated' : '' + selects.length,
        numeric,
      );
    }
  }

  // WHERE

  if (features.wheres) {
    for (let count = randomCount(random); count > 0; count--) {
      const column = randomColumn();
      const other = randomColumn();
      const value = random.pick(column.values);
      const otherValue = random.pick(other.values);
      others.push(
        random.pick<Clause>([
          [
            `where(${args(...column.path, value)});`,
            ({where}) => (where as any)(...column.path, value),
          ],
          [
            `where((getTableCell) => ${reads(column)} !== ${args(value)});`,
            ({where}) =>
              where((getTableCell) => read(getTableCell, column) !== value),
          ],
          [
            `where((getTableCell) => ${reads(column)} === ${args(value)} ` +
              `|| ${reads(other)} === ${args(otherValue)});`,
            ({where}) =>
              where(
                (getTableCell) =>
                  read(getTableCell, column) === value ||
                  read(getTableCell, other) === otherValue,
              ),
          ],
          [
            `where((getTableCell) => ${reads(column)} >= ${args(value)});`,
            ({where}) =>
              where(
                (getTableCell) =>
                  (read(getTableCell, column) as any) >= (value as any),
              ),
          ],
        ]),
      );
    }
  }

  // GROUP

  const grouped: Selected[] = [];
  const margins: {[cellId: Id]: number | undefined} = {};
  const aggregated =
    features.groups && random.bool(0.6)
      ? selected.filter(
          (_, index) => random.bool() || index == selected.length - 1,
        )
      : [];
  const dims = selected.filter((select) => !aggregated.includes(select));
  aggregated.forEach(({id, numeric}) => {
    const aggregates = random
      .shuffle(
        numeric ? [...ANY_AGGREGATES, ...NUMERIC_AGGREGATES] : ANY_AGGREGATES,
      )
      .slice(0, 1 + random.int(3));
    aggregates.forEach(([name, source, parameters, kind], index) => {
      const as =
        aggregates.length > 1 || random.bool() ? unique(`${name}_${id}`) : id;
      others.push([
        `group(${args(id)}, ${source})` +
          (as != id ? `.as(${args(as)});` : ';'),
        ({group}) => {
          const groupedAs = (group as any)(id, ...parameters);
          if (as != id) {
            groupedAs.as(as);
          }
        },
      ]);
      const tolerance = kind == 'exact' ? undefined : regime[kind];
      if (tolerance) {
        tolerances[as] = tolerance;
      }
      margins[as] =
        kind == 'exact'
          ? 0
          : kind == 'sum'
            ? regime.sumMargin
            : regime.avgMargin;
      grouped.push({
        id: as,
        numeric: name != 'list',
        values: name == 'count' || name == 'size' ? [1, 2] : regime.numbers,
      });
      if (index == 0 && as != id) {
        selected.push({id: as, numeric: false});
      }
    });
  });

  // HAVING

  const isGrouped =
    aggregated.length > 0 || (!!features.havings && random.bool(0.1));
  if (isGrouped && features.havings) {
    const candidates = [
      ...dims.filter(({values}) => values),
      ...grouped.filter(({id, numeric}) => numeric && margins[id] != null),
    ];
    for (
      let count = candidates.length == 0 ? 0 : randomCount(random);
      count > 0;
      count--
    ) {
      const {id, values} = random.pick(candidates);
      const value = random.pick(values as readonly Cell[]);
      const margin = margins[id];
      others.push(
        margin == null
          ? random.pick<Clause>([
              [`having(${args(id, value)});`, ({having}) => having(id, value)],
              [
                `having((getCell) => getCell(${args(id)}) !== ` +
                  `${args(value)});`,
                ({having}) => having((getCell) => getCell(id) !== value),
              ],
            ])
          : random.pick<Clause>([
              [
                `having((getCell) => getCell(${args(id)}) > ` +
                  `${args((value as number) + margin)});`,
                ({having}) =>
                  having(
                    (getCell) =>
                      (getCell(id) as number) > (value as number) + margin,
                  ),
              ],
              [
                `having((getCell) => !(getCell(${args(id)}) > ` +
                  `${args((value as number) + margin)}));`,
                ({having}) =>
                  having(
                    (getCell) =>
                      !((getCell(id) as number) > (value as number) + margin),
                  ),
              ],
            ]),
      );
    }
  }

  const clauses = [...selects, ...random.shuffle(others)];
  return {
    tableId,
    source: clauses.map(([source]) => source).join(' '),
    build: (keywords) => clauses.forEach(([, apply]) => apply(keywords)),
    dims: isGrouped ? dims.map(({id}) => id) : undefined,
    tolerances,
  };
};

const define = (queries: Queries, queryId: Id, query: Query): Queries =>
  queries.setQueryDefinition(queryId, query.tableId, query.build);

const defines = (queryId: Id, {tableId, source}: Query): string =>
  `queries.setQueryDefinition(${args(queryId, tableId)}, ` +
  `({select, join, where, group, having}) => {${source}});`;

// The arguments by which sorted Row Ids are asked for.
type Sort = readonly [
  cellId: Id | undefined,
  descending: boolean,
  offset: number,
  limit: number | undefined,
];

const randomSort = (random: Random, cellIds: Ids): Sort => [
  random.pick([undefined, 'none', ...cellIds, ...cellIds]),
  random.bool(),
  random.int(3),
  random.pick([undefined, undefined, 1, 2, 4]),
];

// What sorted Row Ids can be compared by. Group Row Ids are arbitrary, and
// Rows whose Cells tie can be in any order, so it is the sorted Cells that
// are comparable, rather than the Ids of the Rows they are in. Even those are
// not if they mix strings with other types, which have no consistent order.
const getSorted = (
  queries: Queries,
  queryId: Id,
  table: ResultTable,
  dims: Ids | undefined,
  [cellId, descending, offset, limit]: Sort,
): unknown => {
  const rowIds = queries.getResultSortedRowIds(
    queryId,
    cellId,
    descending,
    offset,
    limit,
  );
  if (cellId === undefined) {
    return dims ? rowIds.length : rowIds;
  }
  const cells = Object.values(table).map((row) => row[cellId]);
  return cells.every((cell) => typeof cell == 'string')
    ? rowIds.map((rowId) => table[rowId]?.[cellId])
    : cells.every((cell) => typeof cell != 'string')
      ? rowIds.map((rowId) => Number(table[rowId]?.[cellId] ?? 0))
      : rowIds.length;
};

// Everything that is compared about one query's result. Rows are listed in
// the order of what identifies them: their Ids, or, for a group, the Cells it
// is grouped by.
const getResult = (
  queries: Queries,
  queryId: Id,
  dims: Ids | undefined,
  sorts: Sort[],
) => {
  const table = queries.getResultTable(queryId);
  const rowIds = queries.getResultRowIds(queryId);
  return {
    rows: Object.entries(table)
      .map(([rowId, row]): [string, ResultRow] => [
        dims
          ? JSON.stringify(dims.map((dim) => (dim in row ? [row[dim]] : 0)))
          : rowId,
        row,
      ])
      .sort(([key1], [key2]) => (key1 < key2 ? -1 : key1 > key2 ? 1 : 0)),
    rowIds: dims ? rowIds.length : [...rowIds].sort(),
    rowCount: queries.getResultRowCount(queryId),
    cellIds: [...queries.getResultTableCellIds(queryId)].sort(),
    hasTable: queries.hasResultTable(queryId),
    sorted: sorts.map((sort) => getSorted(queries, queryId, table, dims, sort)),
  };
};

// Replaces each number that is close enough to the one expected with it.
const settle = (
  actual: unknown,
  expected: unknown,
  tolerance: number | undefined,
): unknown =>
  tolerance != null &&
  typeof actual == 'number' &&
  typeof expected == 'number' &&
  Math.abs(actual - expected) <= tolerance
    ? expected
    : actual;

const settleResult = (
  actual: ReturnType<typeof getResult>,
  expected: ReturnType<typeof getResult>,
  tolerances: {[cellId: Id]: number},
  sorts: Sort[],
): ReturnType<typeof getResult> => ({
  ...actual,
  rows: actual.rows.map(([key, row], index) => [
    key,
    key === expected.rows[index]?.[0]
      ? (Object.fromEntries(
          Object.entries(row).map(([cellId, cell]) => [
            cellId,
            settle(cell, expected.rows[index][1][cellId], tolerances[cellId]),
          ]),
        ) as ResultRow)
      : row,
  ]),
  sorted: actual.sorted.map((cells, index) => {
    const expectedCells = expected.sorted[index];
    const tolerance = tolerances[sorts[index][0] as Id];
    return Array.isArray(cells) && Array.isArray(expectedCells)
      ? cells.map((cell, index) =>
          settle(cell, expectedCells[index], tolerance),
        )
      : cells;
  }),
});

// Checks every query's results against those of a fresh Queries object.
const expectFreshResults = (
  random: Random,
  store: Store,
  queries: Queries,
  definitions: Map<Id, Query>,
): void => {
  const freshQueries = createQueries(
    createStore().setTables(store.getTables()),
  );
  definitions.forEach((query, queryId) => define(freshQueries, queryId, query));
  const actual: {[queryId: Id]: unknown} = {};
  const expected: {[queryId: Id]: unknown} = {};
  QUERY_IDS.forEach((queryId) => {
    const {dims, tolerances = {}} = definitions.get(queryId) ?? {};
    const cellIds = freshQueries.getResultTableCellIds(queryId);
    const sorts = [
      randomSort(random, cellIds),
      randomSort(random, cellIds),
      randomSort(random, cellIds),
    ];
    const expectedResult = getResult(freshQueries, queryId, dims, sorts);
    expected[queryId] = expectedResult;
    actual[queryId] = settleResult(
      getResult(queries, queryId, dims, sorts),
      expectedResult,
      tolerances,
      sorts,
    );
  });
  expectSame(actual, expected, 'results, against a fresh Queries object');
  expectSame(queries.getQueryIds(), [...definitions.keys()], 'query Ids');
};

// One call of a listener: what it was listening to, then what it was given.
type Call = readonly [key: string, ...details: unknown[]];

// What a query's listeners are judged against: its result, and its Row Ids
// as sorted for each of the listeners to that.
type State = {tables: {[queryId: Id]: ResultTable}; sorted: Ids[]};

type QuerySort = readonly [queryId: Id, ...sort: Sort];

// Listens to every query, in every way, recording each call. Sometimes one
// set of listeners is registered for all queries, rather than one for each.
const addListeners = (
  queries: Queries,
  random: Random,
  calls: Call[],
): QuerySort[] => {
  (random.bool(0.3) ? [null] : QUERY_IDS).forEach((queryIdOrNull) => {
    queries.addResultTableListener(queryIdOrNull, (_, queryId) =>
      calls.push([`table ${queryId}`, queries.getResultTable(queryId)]),
    );
    queries.addResultTableCellIdsListener(
      queryIdOrNull,
      (_, queryId, getIdChanges) =>
        calls.push([`tableCellIds ${queryId}`, getIdChanges?.()]),
    );
    queries.addResultRowCountListener(queryIdOrNull, (_, queryId, count) =>
      calls.push([`rowCount ${queryId}`, count]),
    );
    queries.addResultRowIdsListener(queryIdOrNull, (_, queryId, getIdChanges) =>
      calls.push([`rowIds ${queryId}`, getIdChanges?.()]),
    );
    queries.addResultRowListener(queryIdOrNull, null, (_, queryId, rowId) =>
      calls.push([`row ${queryId} ${rowId}`]),
    );
    queries.addResultCellIdsListener(
      queryIdOrNull,
      null,
      (_, queryId, rowId, getIdChanges) =>
        calls.push([`cellIds ${queryId} ${rowId}`, getIdChanges?.()]),
    );
    queries.addResultCellListener(
      queryIdOrNull,
      null,
      null,
      (_, queryId, rowId, cellId, newCell, oldCell, getCellChange) =>
        calls.push([
          `cell ${queryId} ${rowId} ${cellId}`,
          newCell,
          oldCell,
          getCellChange(queryId, rowId, cellId),
        ]),
    );
  });
  const sorts = QUERY_IDS.flatMap((queryId) =>
    [0, 1].map((): QuerySort => [
      queryId,
      ...randomSort(random, SORTED_CELL_IDS),
    ]),
  );
  sorts.forEach(([queryId, cellId, descending, offset, limit], index) =>
    queries.addResultSortedRowIdsListener(
      queryId,
      cellId,
      descending,
      offset,
      limit,
      (_queries, _queryId, _cellId, _descending, _offset, _limit, rowIds) =>
        calls.push([`sorted ${index}`, rowIds]),
    ),
  );
  return sorts;
};

const getState = (queries: Queries, sorts: QuerySort[]): State => ({
  tables: Object.fromEntries(
    QUERY_IDS.map((queryId) => [queryId, queries.getResultTable(queryId)]),
  ),
  sorted: sorts.map((sort) => queries.getResultSortedRowIds(...sort)),
});

const union = (object1: object, object2: object): Ids => [
  ...new Set([...Object.keys(object1), ...Object.keys(object2)]),
];

// Whether a result has just one way of being sorted by a Cell. It does not if
// two of its Rows tie, or if its Cells mix strings with other types, which
// have no consistent order.
const hasOneOrder = (table: ResultTable, cellId: Id | undefined): boolean => {
  const cells = Object.values(table).map((row) => row[cellId as Id]);
  const keys: unknown[] = cells.every((cell) => typeof cell == 'string')
    ? cells
    : cells.every((cell) => typeof cell != 'string')
      ? cells.map((cell) => Number(cell ?? 0))
      : [];
  return cellId === undefined || new Set(keys).size == cells.length;
};

// The calls that listeners should get for the difference between two states:
// one for each thing that changed, and none for anything that did not.
const getExpectedCalls = (
  before: State,
  after: State,
  sorts: QuerySort[],
  calls: Call[],
): Call[] => {
  const expectedCalls: Call[] = [];
  QUERY_IDS.forEach((queryId) => {
    const beforeTable = before.tables[queryId];
    const afterTable = after.tables[queryId];
    const rowIdChanges: {[rowId: Id]: 1 | -1} = {};
    const beforeCellIds: {[cellId: Id]: 1} = {};
    const afterCellIds: {[cellId: Id]: 1} = {};
    let tableChanged = false;
    union(beforeTable, afterTable).forEach((rowId) => {
      const beforeRow = beforeTable[rowId] ?? {};
      const afterRow = afterTable[rowId] ?? {};
      const cellIdChanges: {[cellId: Id]: 1 | -1} = {};
      let rowChanged = false;
      union(beforeRow, afterRow).forEach((cellId) => {
        const oldCell = beforeRow[cellId];
        const newCell = afterRow[cellId];
        if (oldCell !== undefined) {
          beforeCellIds[cellId] = 1;
        }
        if (newCell !== undefined) {
          afterCellIds[cellId] = 1;
        }
        if (newCell !== oldCell) {
          expectedCalls.push([
            `cell ${queryId} ${rowId} ${cellId}`,
            newCell,
            oldCell,
            [true, oldCell, newCell],
          ]);
          if (oldCell === undefined || newCell === undefined) {
            cellIdChanges[cellId] = oldCell === undefined ? 1 : -1;
          }
          rowChanged = true;
        }
      });
      if (rowChanged) {
        expectedCalls.push([`row ${queryId} ${rowId}`]);
        tableChanged = true;
      }
      if (Object.keys(cellIdChanges).length > 0) {
        expectedCalls.push([`cellIds ${queryId} ${rowId}`, cellIdChanges]);
      }
      if (!(rowId in beforeTable) || !(rowId in afterTable)) {
        rowIdChanges[rowId] = rowId in afterTable ? 1 : -1;
      }
    });
    if (tableChanged) {
      expectedCalls.push([`table ${queryId}`, afterTable]);
    }
    if (Object.keys(rowIdChanges).length > 0) {
      expectedCalls.push([`rowIds ${queryId}`, rowIdChanges]);
    }
    const beforeCount = Object.keys(beforeTable).length;
    const afterCount = Object.keys(afterTable).length;
    if (afterCount != beforeCount) {
      expectedCalls.push([`rowCount ${queryId}`, afterCount]);
    }
    const tableCellIdChanges: {[cellId: Id]: 1 | -1} = {};
    union(beforeCellIds, afterCellIds).forEach((cellId) => {
      if (!(cellId in beforeCellIds) || !(cellId in afterCellIds)) {
        tableCellIdChanges[cellId] = cellId in afterCellIds ? 1 : -1;
      }
    });
    if (Object.keys(tableCellIdChanges).length > 0) {
      expectedCalls.push([`tableCellIds ${queryId}`, tableCellIdChanges]);
    }
  });
  // The sorted Row Ids of a result with more than one possible order can
  // change, or not, without there being a way to know. Then it is only
  // checked that a listener that was called was given the current Ids.
  sorts.forEach(([queryId, cellId], index) => {
    const key = `sorted ${index}`;
    const beforeRowIds = before.sorted[index];
    const afterRowIds = after.sorted[index];
    if (
      hasOneOrder(before.tables[queryId], cellId) &&
      hasOneOrder(after.tables[queryId], cellId)
        ? afterRowIds.length != beforeRowIds.length ||
          afterRowIds.some((rowId, index) => rowId != beforeRowIds[index])
        : calls.some(([otherKey]) => otherKey == key)
    ) {
      expectedCalls.push([key, afterRowIds]);
    }
  });
  return expectedCalls;
};

const sortCalls = (calls: Call[]): Call[] =>
  [...calls].sort(([key1], [key2]) => (key1 < key2 ? -1 : key1 > key2 ? 1 : 0));

const fuzz = (
  random: Random,
  trace: Trace,
  {features, regimes, steps = 40, listeners}: Options,
): void => {
  const regime: Regime = REGIMES[random.pick(regimes)];
  const domains = getDomains(regime.numbers);
  const store = createStore();
  const queries = createQueries(store);
  const definitions = new Map<Id, Query>();
  const calls: Call[] = [];
  const sorts = listeners ? addListeners(queries, random, calls) : [];
  let state = getState(queries, sorts);

  const randomTables = (): Step => {
    const tables: Tables = {};
    Object.entries(ROW_IDS).forEach(([tableId, rowIds]) => {
      tables[tableId] = randomTable(random, rowIds, domains[tableId]);
    });
    return [`store.setTables(${args(tables)});`, () => store.setTables(tables)];
  };

  const randomDefinition = (): Step => {
    const queryId = random.pick(QUERY_IDS);
    const query = randomQuery(random, regime, features);
    return [
      defines(queryId, query),
      () => {
        define(queries, queryId, query);
        definitions.set(queryId, query);
      },
    ];
  };

  const randomDeletion = (): Step => {
    const queryId = random.pick(QUERY_IDS);
    return [
      `queries.delQueryDefinition(${args(queryId)});`,
      () => {
        queries.delQueryDefinition(queryId);
        definitions.delete(queryId);
      },
    ];
  };

  const randomChanges = (): Step[] =>
    Array.from({length: 1 + random.int(5)}, () =>
      randomChange(random, store, regime),
    );

  for (let step = 0; step < steps; step++) {
    const [source, run] =
      step < 2
        ? randomDefinition()
        : step == 2 && random.bool(0.8)
          ? randomTables()
          : random.weighted<() => Step>([
              [60, () => randomChange(random, store, regime)],
              [
                15,
                () => randomTransaction(random, store, randomChanges(), false),
              ],
              [
                6,
                () => randomTransaction(random, store, randomChanges(), true),
              ],
              [2, randomTables],
              [12, randomDefinition],
              [3, randomDeletion],
            ])();
    trace(source);
    run();
    expectFreshResults(random, store, queries, definitions);
    if (listeners) {
      const nextState = getState(queries, sorts);
      expectSame(
        sortCalls(calls),
        sortCalls(getExpectedCalls(state, nextState, sorts, calls)),
        'listener calls',
      );
      calls.length = 0;
      state = nextState;
    }
  }
};

// Selected and calculated Cells of one Table, filtered by where clauses, are
// the same however the result was arrived at.
test(
  'selects and wheres match a fresh Queries object',
  async () => {
    await forEachSeed(defaultRuns, (random, trace) =>
      fuzz(random, trace, {
        features: {
          tables: ['pets', 'owners', 'species'],
          calculated: true,
          wheres: true,
        },
        regimes: ['small'],
      }),
    );
  },
  timeout,
);

// Cells of joined Tables are the same however the result was arrived at,
// whether joined directly or through another Table, and whether or not the
// Rows that are joined to exist.
test(
  'joins match a fresh Queries object',
  async () => {
    await forEachSeed(defaultRuns, (random, trace) =>
      fuzz(random, trace, {
        features: {
          tables: ['pets', 'pets', 'owners'],
          calculated: true,
          joins: true,
          wheres: true,
        },
        regimes: ['small'],
      }),
    );
  },
  timeout,
);

// Aggregates of groups are the same however the result was arrived at.
test(
  'groups match a fresh Queries object',
  async () => {
    await forEachSeed(defaultRuns, (random, trace) =>
      fuzz(random, trace, {
        features: {tables: ['pets'], groups: true},
        regimes: ['small', 'float', 'extreme', 'huge'],
      }),
    );
  },
  timeout,
);

// Groups filtered by having clauses are the same however the result was
// arrived at.
test(
  'havings match a fresh Queries object',
  async () => {
    await forEachSeed(defaultRuns, (random, trace) =>
      fuzz(random, trace, {
        features: {tables: ['pets'], wheres: true, groups: true, havings: true},
        regimes: ['small', 'float', 'extreme'],
      }),
    );
  },
  timeout,
);

// Every kind of clause in combination is the same however the result was
// arrived at.
test(
  'combined clauses match a fresh Queries object',
  async () => {
    await forEachSeed(defaultRuns, (random, trace) =>
      fuzz(random, trace, {
        features: {
          tables: ['pets', 'pets', 'owners', 'species'],
          calculated: true,
          joins: true,
          wheres: true,
          groups: true,
          havings: true,
        },
        regimes: ['small', 'float', 'extreme', 'huge'],
      }),
    );
  },
  timeout,
);

// Listeners to a result are called once for each thing that a transaction
// changed, and not at all for anything it did not, or if it was rolled back.
test(
  'listeners are called for exactly what changed',
  async () => {
    await forEachSeed(defaultRuns, (random, trace) =>
      fuzz(random, trace, {
        features: {
          tables: ['pets', 'pets', 'owners', 'species'],
          calculated: true,
          joins: true,
          wheres: true,
          groups: true,
          havings: true,
        },
        regimes: ['small', 'float', 'extreme'],
        listeners: true,
      }),
    );
  },
  timeout,
);
