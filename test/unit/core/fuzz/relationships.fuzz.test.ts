import {expect, test, vi} from 'vitest';

import type {
  Cell,
  GetCell,
  Id,
  IdOrNull,
  Ids,
  Relationships,
  Row,
  Store,
  Table,
} from 'tinybase';
import {createRelationships, createStore} from 'tinybase';
import type {Random, Trace} from '../../common/fuzz.ts';
import {code, expectSame, forEachSeed} from '../../common/fuzz.ts';

// Seeded fuzz tests for the relationships module. Each one builds a Store and
// its Relationships object, applies a random sequence of operations to them -
// writing and deleting data on both sides of every Relationship, defining,
// redefining and removing Relationships, and adding and removing listeners -
// and checks one property after every operation.

const TABLE_IDS = ['pets', 'species', 'owners'];
const ROW_IDS = ['fido', 'felix', 'cujo', 'dog', 'cat', '1', 'true', ''];
const CELL_IDS = ['species', 'next', 'owner'];
const RELATIONSHIP_IDS = ['petSpecies', 'petOwner', 'petSequence'];
const KINDS = ['RemoteRowId', 'LocalRowIds', 'LinkedRowIds'] as const;
const GETTERS = [
  'getRemoteRowId',
  'getLocalRowIds',
  'getLinkedRowIds',
] as const;

type Kind = (typeof KINDS)[number];
type Getter = (typeof GETTERS)[number];
type Getters = Pick<Relationships, Getter>;
type GetRemoteRowId = (getCell: GetCell, localRowId: Id) => any;
type Definition = [
  localTableId: Id,
  remoteTableId: Id,
  getRemoteRowId: Id | GetRemoteRowId,
];
type Definitions = Map<Id, Definition>;
type Op = [statement: string, run: () => unknown];
type Call = [relationshipId: Id, rowId: Id];
type Listening = {
  name: string;
  kind: Kind;
  relationshipId: IdOrNull;
  rowId: IdOrNull;
  listenerId: Id;
  calls: Call[];
};
type Links = {
  linkedList: boolean;
  remoteRowIds: Map<Id, Id>;
  localRowIds: Map<Id, Ids>;
};
type Model = Getters & {links: Map<Id, Links>};
type World = ReturnType<typeof createWorld>;

// Functions that derive a remote Row Id from a local Row and nothing else:
// from two of its Cells, from a composite of them, and from its own Id, both
// to link each Row to itself and to link three of the Rows into a ring.
const CUSTOM_GETTERS: GetRemoteRowId[] = [
  (getCell) => getCell('next') ?? getCell('species'),
  (getCell) => `${getCell('species')}_${getCell('owner')}`,
  (_getCell, localRowId) => localRowId,
  (_getCell, localRowId) =>
    ({fido: 'felix', felix: 'cujo', cujo: 'fido'})[localRowId],
];

// Formats arguments as they would be written in code, for the trace.
const args = (...values: unknown[]): string =>
  values
    .map((value) => (typeof value == 'function' ? `${value}` : code(value)))
    .join(', ');

// A Cell to use as a remote Row Id: usually the Id of a Row that might exist,
// but sometimes one that never does, or a value that is not a string.
const pickCell = (random: Random): Cell =>
  random.weighted<Cell>([
    [12, random.pick(ROW_IDS)],
    [1, 'ghost'],
    [1, 1],
    [1, true],
    [1, null],
    [1, ['felix']],
  ]);

const pickRow = (random: Random): Row =>
  Object.fromEntries(
    CELL_IDS.filter(() => random.bool(0.6)).map((cellId) => [
      cellId,
      pickCell(random),
    ]),
  );

// A Table of a few Rows. Sometimes their `next` Cells link them into a single
// chain, which either ends, or goes back to one of the Rows to make a cycle.
const pickTable = (random: Random): Table => {
  const rowIds = random.shuffle(ROW_IDS).slice(0, random.int(6));
  const chain = random.bool(0.4);
  const cycle = random.bool(0.6);
  return Object.fromEntries(
    rowIds.map((rowId, index) => [
      rowId,
      !chain
        ? pickRow(random)
        : index + 1 < rowIds.length
          ? {next: rowIds[index + 1]}
          : cycle
            ? {next: random.pick(rowIds)}
            : {species: 'dog'},
    ]),
  );
};

// What the Relationships should contain, recomputed naively from the Store:
// the remote Row Id of each local Row, the local Row Ids of each remote Row
// Id, and the linked list made by following one Row to the next.
const getModel = (store: Store, definitions: Definitions): Model => {
  const links = new Map<Id, Links>();
  definitions.forEach(([localTableId, remoteTableId, getRemoteRowId], id) => {
    const remoteRowIds = new Map<Id, Id>();
    const localRowIds = new Map<Id, Ids>();
    store.getRowIds(localTableId).forEach((localRowId) => {
      const getCell = (cellId: Id) =>
        store.getCell(localTableId, localRowId, cellId);
      const remote =
        typeof getRemoteRowId == 'string'
          ? getCell(getRemoteRowId)
          : getRemoteRowId(getCell, localRowId);
      if (remote !== undefined) {
        // Row Ids are strings, so anything else is taken in its string form.
        const remoteRowId = String(remote);
        remoteRowIds.set(localRowId, remoteRowId);
        localRowIds.set(
          remoteRowId,
          [...(localRowIds.get(remoteRowId) ?? []), localRowId].sort(),
        );
      }
    });
    links.set(id, {
      linkedList: localTableId == remoteTableId,
      remoteRowIds,
      localRowIds,
    });
  });
  return {
    links,
    getRemoteRowId: (relationshipId, localRowId) =>
      links.get(relationshipId)?.remoteRowIds.get(localRowId),
    getLocalRowIds: (relationshipId, remoteRowId) =>
      links.get(relationshipId)?.localRowIds.get(remoteRowId) ?? [],
    getLinkedRowIds: (relationshipId, firstRowId) => {
      const {linkedList, remoteRowIds} = links.get(relationshipId) ?? {};
      const linkedRowIds = [firstRowId];
      let rowId = linkedList ? remoteRowIds?.get(firstRowId) : undefined;
      while (rowId !== undefined && !linkedRowIds.includes(rowId)) {
        linkedRowIds.push(rowId);
        rowId = remoteRowIds?.get(rowId);
      }
      return linkedRowIds;
    },
  };
};

// Checks that two things are the same. They nearly always are, and comparing
// them as JSON finds that out far sooner than expectSame does, which is then
// only needed to describe a difference.
const expectEqual = (
  actual: unknown,
  expected: unknown,
  message: string,
): void => {
  if (code(actual) != code(expected)) {
    expectSame(actual, expected, message);
  }
};

// What one of the getters returns, for every Relationship and Row Id. The
// order of local Row Ids is not documented, so those are compared sorted.
const getResults = (
  getters: Getters,
  getter: Getter,
  rowIds: Iterable<Id>,
  relationshipIds = RELATIONSHIP_IDS,
) =>
  Object.fromEntries(
    relationshipIds.flatMap((relationshipId) =>
      [...rowIds].map((rowId) => {
        const result = getters[getter](relationshipId, rowId);
        return [
          `${relationshipId}/${rowId}`,
          getter == 'getLocalRowIds' ? [...(result as Ids)].sort() : result,
        ];
      }),
    ),
  );

const expectResults = (
  actual: Getters,
  expected: Getters,
  rowIds: Iterable<Id>,
  getters: readonly Getter[] = GETTERS,
  relationshipIds = RELATIONSHIP_IDS,
): void =>
  getters.forEach((getter) =>
    expectEqual(
      getResults(actual, getter, rowIds, relationshipIds),
      getResults(expected, getter, rowIds, relationshipIds),
      getter,
    ),
  );

// The Relationship Id and Row Id of each result that differs between two
// models, which is what the listeners for those results should be told about.
const getChanges = (
  before: Model,
  after: Model,
  results: 'remoteRowIds' | 'localRowIds',
): Call[] =>
  RELATIONSHIP_IDS.flatMap((relationshipId) => {
    const resultsBefore: Map<Id, unknown> =
      before.links.get(relationshipId)?.[results] ?? new Map();
    const resultsAfter: Map<Id, unknown> =
      after.links.get(relationshipId)?.[results] ?? new Map();
    return [...new Set([...resultsBefore.keys(), ...resultsAfter.keys()])]
      .filter(
        (rowId) =>
          code(resultsBefore.get(rowId)) != code(resultsAfter.get(rowId)),
      )
      .map((rowId): Call => [relationshipId, rowId]);
  });

// KNOWN BUG silent-definition-removal: remove this restriction once fixed
// (and with it every use of this function). Removing a Relationship changes
// its results, but its listeners are not called, so those are not checked.
const wasRemoved =
  (before: Model, after: Model) =>
  ([relationshipId]: Call): boolean =>
    before.links.has(relationshipId) && !after.links.has(relationshipId);

// A Store and its Relationships object, with a record of the definitions and
// the listeners they have been given, and the operations to apply to them.
// The salt keeps tests from repeating each other's sequences for a seed.
const createWorld = (
  random: Random,
  trace: Trace,
  salt: number,
  linkedLists = 0.4,
) => {
  const store = createStore();
  const relationships = createRelationships(store);
  const definitions: Definitions = new Map();
  const listenings: Listening[] = [];
  const stopped: Listening[] = [];
  const rowIds = new Set<Id>([...ROW_IDS, 'ghost', 'worm']);
  let listenerCount = 0;

  for (let draw = 0; draw < salt; draw++) {
    random.next();
  }
  trace('const store = createStore();');
  trace('const relationships = createRelationships(store);');
  trace('const listener = () => {};');

  // Also notes every Row Id that has ever been in a Table or been linked to,
  // since those are the ones worth asking about from then on.
  const getWorldModel = (): Model => {
    const model = getModel(store, definitions);
    store
      .getTableIds()
      .forEach((tableId) =>
        store.getRowIds(tableId).forEach((rowId) => rowIds.add(rowId)),
      );
    model.links.forEach(({localRowIds}) =>
      localRowIds.forEach((_, remoteRowId) => rowIds.add(remoteRowId)),
    );
    return model;
  };

  const write = (): Op => {
    const tableId = random.pick(TABLE_IDS);
    const rowId = random.pick(ROW_IDS);
    const cellId = random.pick(CELL_IDS);
    const [method, ...values] = random.weighted<() => [string, ...unknown[]]>([
      [8, () => ['setCell', tableId, rowId, cellId, pickCell(random)]],
      [3, () => ['delCell', tableId, rowId, cellId]],
      [4, () => ['setRow', tableId, rowId, pickRow(random)]],
      [2, () => ['setPartialRow', tableId, rowId, pickRow(random)]],
      [1, () => ['addRow', tableId, pickRow(random)]],
      [3, () => ['delRow', tableId, rowId]],
      [3, () => ['setTable', tableId, pickTable(random)]],
      [1, () => ['delTable', tableId]],
      [
        1,
        () => [
          'setTables',
          Object.fromEntries(
            TABLE_IDS.filter(() => random.bool()).map((tableId) => [
              tableId,
              pickTable(random),
            ]),
          ),
        ],
      ],
      [0.5, () => ['delTables']],
    ])();
    return [
      `store.${method}(${args(...values)});`,
      () => (store as any)[method](...values),
    ];
  };

  const transaction = (ops: Op[], rollback: boolean): Op => [
    'store.transaction(() => {\n' +
      ops.map(([statement]) => `    ${statement}\n`).join('') +
      `  }${rollback ? ', () => true' : ''});`,
    () =>
      store.transaction(
        () => ops.forEach(([, run]) => run()),
        () => rollback,
      ),
  ];

  const transact = (rollback = random.bool(0.3)): Op =>
    transaction(Array.from({length: 1 + random.int(4)}, write), rollback);

  // Half of the time, redefining a Relationship changes only one of its
  // local Table, its remote Table, and how it gets its remote Row Ids.
  const define = (): Op => {
    const relationshipId = random.pick(RELATIONSHIP_IDS);
    const localTableId = random.pick(TABLE_IDS);
    let definition: Definition = [
      localTableId,
      random.bool(linkedLists) ? localTableId : random.pick(TABLE_IDS),
      random.bool(0.7) ? random.pick(CELL_IDS) : random.pick(CUSTOM_GETTERS),
    ];
    const defined = definitions.get(relationshipId);
    if (defined && random.bool()) {
      const part = random.int(3);
      definition = defined.with(part, definition[part]) as Definition;
    }
    return [
      'relationships.setRelationshipDefinition(' +
        `${args(relationshipId, ...definition)});`,
      () => {
        definitions.set(relationshipId, definition);
        relationships.setRelationshipDefinition(relationshipId, ...definition);
      },
    ];
  };

  const undefine = (relationshipId = random.pick(RELATIONSHIP_IDS)): Op => [
    `relationships.delRelationshipDefinition(${args(relationshipId)});`,
    () => {
      definitions.delete(relationshipId);
      relationships.delRelationshipDefinition(relationshipId);
    },
  ];

  const destroy = (): Op => [
    'relationships.destroy();',
    () => {
      definitions.clear();
      relationships.destroy();
    },
  ];

  // Adds a listener, or removes one, which is likelier the more there are.
  const listen = (kind: Kind = random.pick(KINDS)): Op => {
    if (listenings.length > random.int(16)) {
      const listening = random.pick(listenings);
      return [
        `relationships.delListener(${listening.name});`,
        () => {
          listenings.splice(listenings.indexOf(listening), 1);
          stopped.push(listening);
          relationships.delListener(listening.listenerId);
        },
      ];
    }
    const specific = kind == 'LinkedRowIds';
    const listening: Listening = {
      name: `listenerId${listenerCount++}`,
      kind,
      relationshipId:
        specific || random.bool(0.7) ? random.pick(RELATIONSHIP_IDS) : null,
      rowId: specific || random.bool(0.7) ? random.pick(ROW_IDS) : null,
      listenerId: '',
      calls: [],
    };
    return [
      `const ${listening.name} = relationships.add${kind}Listener(` +
        `${args(listening.relationshipId, listening.rowId)}, listener);`,
      () => {
        listening.listenerId = (relationships as any)[`add${kind}Listener`](
          listening.relationshipId,
          listening.rowId,
          (called: Relationships, relationshipId: Id, rowId: Id) => {
            expectEqual(called == relationships, true, 'first argument');
            listening.calls.push([relationshipId, rowId]);
            world.onCall?.(listening, relationshipId, rowId);
          },
        );
        listenings.push(listening);
      },
    ];
  };

  // Forgets the calls that listeners had during the previous operation, so
  // that what they hold afterwards is those they had during this one.
  const run = ([statement, action]: Op): void => {
    trace(statement);
    listenings.forEach(({calls}) => (calls.length = 0));
    action();
  };

  const step = (): void =>
    run(
      random.weighted<() => Op>([
        [12, write],
        [4, transact],
        [5, define],
        [1.5, undefine],
        [2, listen],
        [0.3, destroy],
      ])(),
    );

  const world = {
    store,
    relationships,
    definitions,
    listenings,
    stopped,
    rowIds,
    getModel: getWorldModel,
    write,
    transaction,
    transact,
    define,
    undefine,
    destroy,
    listen,
    run,
    step,
    onCall: undefined as
      | ((listening: Listening, relationshipId: Id, rowId: Id) => void)
      | undefined,
  };
  return world;
};

// Checks the calls that every listener of one kind had during the last
// operation, given the results of that kind which the operation changed. No
// listener of any kind is called twice for the same thing, nor once removed.
const expectCalls = (
  world: World,
  kind: Kind,
  changes: Call[],
  ignore: (call: Call) => boolean = () => false,
): void => {
  world.listenings.forEach(({name, relationshipId, rowId, calls, ...rest}) => {
    const called = calls.map(code).sort();
    expectEqual(called, [...new Set(called)], `repeated calls of ${name}`);
    if (rest.kind == kind) {
      expectEqual(
        calls
          .filter((call) => !ignore(call))
          .map(code)
          .sort(),
        changes
          .filter(
            (change) =>
              (relationshipId ?? change[0]) == change[0] &&
              (rowId ?? change[1]) == change[1] &&
              !ignore(change),
          )
          .map(code)
          .sort(),
        `calls of ${name}`,
      );
    }
  });
  world.stopped.forEach(({name, calls}) =>
    expectEqual(calls, [], `calls of ${name} since it was removed`),
  );
};

// getRemoteRowId is what the local Row has in the Cell, or gets from the
// custom function, that the Relationship was last defined with.
test('getRemoteRowId', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 1, 0.2);
    for (let step = 0; step < 50; step++) {
      world.step();
      const model = world.getModel();
      expectResults(world.relationships, model, world.rowIds, [
        'getRemoteRowId',
      ]);
    }
  });
});

// getLocalRowIds is every local Row that has that remote Row Id, whether or
// not there is such a Row in the remote Table.
test('getLocalRowIds', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 2, 0.2);
    for (let step = 0; step < 50; step++) {
      world.step();
      const model = world.getModel();
      expectResults(world.relationships, model, world.rowIds, [
        'getLocalRowIds',
      ]);
    }
  });
});

// getLinkedRowIds follows a Table's Relationship to itself from Row to Row,
// stopping where the chain ends or comes back to a Row already in it, even
// while listeners are keeping linked lists cached.
test('getLinkedRowIds', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 3, 0.9);
    for (let step = 0; step < 8; step++) {
      world.run(world.listen('LinkedRowIds'));
    }
    for (let step = 0; step < 50; step++) {
      world.step();
      const model = world.getModel();
      expectResults(world.relationships, model, world.rowIds, [
        'getLinkedRowIds',
      ]);
    }
  });
});

// However a Relationships object got to where it is, it agrees with one that
// has just been created for the same data and the same definitions.
test('fresh Relationships', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 4, 0.5);
    for (let step = 0; step < 50; step++) {
      world.step();
      world.getModel();
      const fresh = createRelationships(
        createStore().setTables(world.store.getTables()),
      );
      world.definitions.forEach((definition, relationshipId) =>
        fresh.setRelationshipDefinition(relationshipId, ...definition),
      );
      expectResults(world.relationships, fresh, world.rowIds);
    }
  });
});

// A transaction that is rolled back changes no result at all, not even the
// order of local Row Ids, and calls no listener.
test('rolled back transactions', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 5);
    const getAllResults = () =>
      RELATIONSHIP_IDS.map((relationshipId) =>
        [...world.rowIds].map((rowId) =>
          GETTERS.map((getter) =>
            world.relationships[getter](relationshipId, rowId),
          ),
        ),
      );
    for (let step = 0; step < 30; step++) {
      world.step();
      world.getModel();
      const results = getAllResults();
      world.run(world.transact(true));
      expectEqual(getAllResults(), results, 'results');
      KINDS.forEach((kind) => expectCalls(world, kind, []));
    }
  });
});

// Each RemoteRowIdListener is called once for every local Row whose remote
// Row Id an operation has changed, and for no other.
test('RemoteRowIdListener', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 6);
    for (let step = 0; step < 6; step++) {
      world.run(world.listen('RemoteRowId'));
    }
    for (let step = 0; step < 50; step++) {
      const before = world.getModel();
      world.step();
      const after = world.getModel();
      expectCalls(
        world,
        'RemoteRowId',
        getChanges(before, after, 'remoteRowIds'),
        wasRemoved(before, after),
      );
    }
  });
});

// Each LocalRowIdsListener is called once for every remote Row Id whose set
// of local Row Ids an operation has changed, and for no other.
test('LocalRowIdsListener', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 7);
    for (let step = 0; step < 6; step++) {
      world.run(world.listen('LocalRowIds'));
    }
    for (let step = 0; step < 50; step++) {
      const before = world.getModel();
      world.step();
      const after = world.getModel();
      expectCalls(
        world,
        'LocalRowIds',
        getChanges(before, after, 'localRowIds'),
        wasRemoved(before, after),
      );
    }
  });
});

// Each LinkedRowIdsListener is called once whenever an operation has changed
// the linked list that starts at its Row, and not otherwise.
test('LinkedRowIdsListener', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 8, 0.9);
    for (let step = 0; step < 8; step++) {
      world.run(world.listen('LinkedRowIds'));
    }
    for (let step = 0; step < 50; step++) {
      const before = world.getModel();
      world.step();
      const after = world.getModel();
      const isSame = ([relationshipId, rowId]: Call): boolean =>
        code(before.getLinkedRowIds(relationshipId, rowId)) ==
        code(after.getLinkedRowIds(relationshipId, rowId));
      const wasRemovedCall = wasRemoved(before, after);
      expectCalls(
        world,
        'LinkedRowIds',
        RELATIONSHIP_IDS.flatMap((relationshipId) =>
          ROW_IDS.map((rowId): Call => [relationshipId, rowId]),
        ).filter((call) => !isSame(call)),
        wasRemovedCall,
      );
    }
  });
});

// When a listener is called, the Relationship that it is told about already
// has its new results, whichever of the getters is used to ask for them.
test('results within listeners', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 9, 0.6);
    world.onCall = (_listening, relationshipId) =>
      expectResults(
        world.relationships,
        world.getModel(),
        [...world.rowIds],
        ['getRemoteRowId', 'getLocalRowIds', 'getLinkedRowIds'],
        [relationshipId],
      );
    for (let step = 0; step < 12; step++) {
      world.run(world.listen());
    }
    for (let step = 0; step < 50; step++) {
      world.step();
    }
  });
});

// The Relationships object reports the definitions it was last given, and
// calls a RelationshipIdsListener whenever one is added or removed, and only
// then. It also counts its listeners.
test('definitions', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 10);
    const {store, relationships, definitions, listenings} = world;
    const idsHeard: Ids[] = [];
    trace('relationships.addRelationshipIdsListener(listener);');
    relationships.addRelationshipIdsListener((called) =>
      idsHeard.push(called.getRelationshipIds()),
    );
    for (let step = 0; step < 50; step++) {
      const idsBefore = [...definitions.keys()];
      world.run(
        random.weighted<() => Op>([
          [4, world.write],
          [1, world.transact],
          [5, world.define],
          [2, world.undefine],
          [0.5, world.destroy],
          [3, world.listen],
        ])(),
      );
      const ids = [...definitions.keys()];
      expectEqual(relationships.getRelationshipIds(), ids, 'ids');
      expectEqual(
        idsHeard.filter(
          (heard, call) =>
            code(heard) == code(call ? idsHeard[call - 1] : idsBefore),
        ),
        [],
        'calls of the RelationshipIdsListener when nothing had changed',
      );
      expectEqual(
        idsHeard.splice(0).pop() ?? idsBefore,
        ids,
        'ids last given to the RelationshipIdsListener',
      );
      RELATIONSHIP_IDS.forEach((relationshipId) =>
        expectEqual(
          {
            has: relationships.hasRelationship(relationshipId),
            localTableId: relationships.getLocalTableId(relationshipId),
            remoteTableId: relationships.getRemoteTableId(relationshipId),
          },
          {
            has: definitions.has(relationshipId),
            localTableId: definitions.get(relationshipId)?.[0],
            remoteTableId: definitions.get(relationshipId)?.[1],
          },
          relationshipId,
        ),
      );
      const localRowIds: [Id, Ids][] = [];
      relationships.forEachRelationship((relationshipId, forEachRow) => {
        const rowIds: Ids = [];
        forEachRow((rowId) => rowIds.push(rowId));
        localRowIds.push([relationshipId, rowIds]);
      });
      expectEqual(
        localRowIds,
        ids.map((id) => [id, store.getRowIds(definitions.get(id)![0])]),
        'forEachRelationship',
      );
      const count = (kind: Kind) =>
        listenings.filter((listening) => listening.kind == kind).length;
      expectEqual(
        relationships.getListenerStats(),
        {
          remoteRowId: count('RemoteRowId'),
          localRowIds: count('LocalRowIds'),
          linkedRowIds: count('LinkedRowIds'),
        },
        'getListenerStats',
      );
    }
  });
});

// Relationships can be defined and removed within a transaction, even one
// that is then rolled back, and still end up agreeing with the Store.
test('definitions within transactions', async () => {
  await forEachSeed(25, (random, trace) => {
    const world = createWorld(random, trace, 11);
    for (let step = 0; step < 50; step++) {
      if (random.bool()) {
        world.step();
      } else {
        const ops = [
          ...Array.from({length: 1 + random.int(2)}, () =>
            random.bool(0.8) ? world.define() : world.undefine(),
          ),
          ...Array.from({length: random.int(4)}, world.write),
        ];
        // KNOWN BUG definition-in-transaction: remove this restriction once
        // fixed, by shuffling these so that writes can come before the
        // definitions that follow them in the same transaction.
        world.run(world.transaction(ops, random.bool(0.3)));
      }
      const model = world.getModel();
      expectResults(world.relationships, model, world.rowIds);
    }
  });
});

test.fails(
  'listeners are called when their Relationship is removed ' +
    '(bug: silent-definition-removal)',
  () => {
    const store = createStore().setTable('pets', {fido: {species: 'dog'}});
    const relationships = createRelationships(store);
    relationships.setRelationshipDefinition(
      'petSpecies',
      'pets',
      'species',
      'species',
    );
    const listener = vi.fn();
    relationships.addRemoteRowIdListener('petSpecies', 'fido', listener);
    relationships.delRelationshipDefinition('petSpecies');
    expect(relationships.getRemoteRowId('petSpecies', 'fido')).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(1);
  },
);

test.fails(
  'a Relationship defined during a transaction agrees with the Store ' +
    'after it (bug: definition-in-transaction)',
  () => {
    const store = createStore().setTable('pets', {fido: {species: 'dog'}});
    const relationships = createRelationships(store);
    store.transaction(() => {
      store.setCell('pets', 'fido', 'species', 'cat');
      relationships.setRelationshipDefinition(
        'petSpecies',
        'pets',
        'species',
        'species',
      );
      store.setCell('pets', 'fido', 'species', 'dog');
    });
    expect(store.getCell('pets', 'fido', 'species')).toEqual('dog');
    expect(relationships.getRemoteRowId('petSpecies', 'fido')).toEqual('dog');
  },
);
