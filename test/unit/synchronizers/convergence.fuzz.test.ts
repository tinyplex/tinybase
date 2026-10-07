import type {Id, MergeableChanges, MergeableStore} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import type {Message, Receive, Synchronizer} from 'tinybase/synchronizers';
import {createCustomSynchronizer} from 'tinybase/synchronizers';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import type {Random, Trace} from '../common/fuzz.ts';
import {check, code, expectSame, forEachSeed} from '../common/fuzz.ts';

// Seeded fuzz tests of synchronization. Each one has several peers make random
// changes to their own MergeableStores, over a simulated network that delays
// messages, delivers those of different connections in any order, and drops
// those of a peer that goes offline. A peer that comes back online does as the
// guides tell it to: it loads, and then it saves.
//
// Once every peer is online and the network is quiet, every peer must have the
// same content, with the same stamps and hashes. That content must also be what
// a MergeableStore gets by being given every change that any peer ever made,
// in an order that has nothing to do with the order in which they were made.
//
// Peers here are a mesh, as they are over a BroadcastChannel, or a WsServer
// that does not authorize its clients. A peer that loads takes what it lacks
// from whichever peer answers it first, and a peer that saves has every other
// peer take what they lack from it. So a peer that comes back online can be
// answered by another that is itself behind, and then be left without changes
// that neither of them has. The first test has every peer save once all are
// online, after which they must agree. The second does not, and records that
// they then might not.
//
//   FUZZ_RUNS=500 npx vitest run --project unit-synchronizers \
//     test/unit/synchronizers/convergence.fuzz.test.ts

const RUNS = 25;
// A longer hunt needs longer than a test is otherwise allowed.
const TIMEOUT = 20000 + Number(process.env.FUZZ_RUNS ?? 0) * 1000;
const STEPS = 60;
const REQUEST_TIMEOUT_SECONDS = 0.5;
const MAX_PACKETS_IN_ROUND = 1000;
const MAX_ROUNDS_TO_SETTLE = 20;
const START_TIME = Date.UTC(2026, 0, 1);

// The clocks of the peers disagree, but by less than the five minutes beyond
// which a MergeableStore refuses what another has stamped.
const PEERS: readonly (readonly [peerId: Id, clockOffset: number])[] = [
  ['alice', 0],
  ['bob', 60000],
  ['carol', -90000],
  ['dave', 120000],
];

const TABLE_IDS = ['pets', 'species'];
const ROW_IDS = ['fido', 'felix', 'cujo'];
const CELL_IDS = ['species', 'price', 'tags'];
const VALUE_IDS = ['open', 'employees'];
const THINGS = ['dog', 'cat', 1, 2, true, false, null, ['a', 'b'], {legs: 4}];

type Packet = [
  fromPeerId: Id,
  toPeerId: Id | null,
  requestId: Id | null,
  message: Message,
  body: any,
];

type Peer = {
  readonly peerId: Id;
  readonly store: MergeableStore;
  readonly synchronizer: Synchronizer;
};

const getWrite = (random: Random): [method: string, ...args: unknown[]] => {
  const tableId = random.pick(TABLE_IDS);
  const rowId = random.pick(ROW_IDS);
  const cellId = random.pick(CELL_IDS);
  const valueId = random.pick(VALUE_IDS);
  const getRow = () =>
    Object.fromEntries(
      random
        .shuffle(CELL_IDS)
        .slice(0, 1 + random.int(CELL_IDS.length))
        .map((cellId) => [cellId, random.pick(THINGS)]),
    );
  return random.weighted<() => [method: string, ...args: unknown[]]>([
    [8, () => ['setCell', tableId, rowId, cellId, random.pick(THINGS)]],
    [3, () => ['setRow', tableId, rowId, getRow()]],
    [2, () => ['setPartialRow', tableId, rowId, getRow()]],
    [3, () => ['delCell', tableId, rowId, cellId]],
    [2, () => ['delRow', tableId, rowId]],
    [1, () => ['delTable', tableId]],
    [4, () => ['setValue', valueId, random.pick(THINGS)]],
    [2, () => ['delValue', valueId]],
  ])();
};

const fuzz = async (
  random: Random,
  trace: Trace,
  everyPeerSaves: boolean,
): Promise<void> => {
  vi.setSystemTime(START_TIME);
  const receives = new Map<Id, Receive>();
  const online = new Set<Id>();
  const packets: Packet[] = [];
  const allChanges: MergeableChanges[] = [];
  const errors: string[] = [];
  const working = new Map<string, Promise<unknown>>();
  const work = (label: string, promise: Promise<unknown>): void => {
    working.set(label, promise);
    void promise.finally(() => working.delete(label));
  };

  const peers: Peer[] = PEERS.map(([peerId, clockOffset]) => {
    const store = createMergeableStore(peerId, () => Date.now() + clockOffset);
    store.addDidFinishTransactionListener(() =>
      allChanges.push(structuredClone(store.getTransactionMergeableChanges())),
    );
    const synchronizer = createCustomSynchronizer(
      store,
      (toPeerId, requestId, message, body) => {
        if (online.has(peerId)) {
          packets.push([
            peerId,
            toPeerId,
            requestId,
            message,
            structuredClone(body),
          ]);
        }
      },
      (receive) => receives.set(peerId, receive),
      () => receives.delete(peerId),
      REQUEST_TIMEOUT_SECONDS,
      undefined,
      undefined,
      (error) => errors.push(error.message),
    );
    return {peerId, store, synchronizer};
  });

  // Delivers some of the packets that are waiting. Those of one connection
  // arrive in the order they were sent, but connections are served in any.
  const deliver = async (count: number): Promise<void> => {
    for (let delivered = 0; delivered < count && packets.length > 0;) {
      const [fromPeerId, toPeerId] = random.pick(packets);
      const index = packets.findIndex(
        (packet) => packet[0] == fromPeerId && packet[1] == toPeerId,
      );
      const [[, , requestId, message, body]] = packets.splice(index, 1);
      (toPeerId == null
        ? PEERS.map(([peerId]) => peerId).filter(
            (peerId) => peerId != fromPeerId,
          )
        : [toPeerId]
      )
        .filter((peerId) => online.has(peerId))
        .forEach((peerId) =>
          receives.get(peerId)?.(
            fromPeerId,
            requestId,
            message,
            structuredClone(body),
          ),
        );
      delivered++;
      await vi.advanceTimersByTimeAsync(1);
    }
  };

  // Delivers everything, and lets every request be answered or time out,
  // until there is nothing more to deliver.
  const settle = async (): Promise<void> => {
    for (let quiet = 0, rounds = 0; quiet < 2; rounds++) {
      if (rounds == MAX_ROUNDS_TO_SETTLE) {
        throw new Error('The network never settles');
      }
      await deliver(MAX_PACKETS_IN_ROUND);
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_SECONDS * 1000 + 100);
      quiet = packets.length == 0 ? quiet + 1 : 0;
    }
  };

  // Waits for something that might itself be waiting for the network, or for
  // a request to time out. Time only passes here when it is made to.
  const complete = async (promise: Promise<unknown>): Promise<void> => {
    let completed = false;
    void promise.finally(() => (completed = true));
    for (let rounds = 0; !completed; rounds++) {
      if (rounds == MAX_ROUNDS_TO_SETTLE) {
        throw new Error('Never completes: ' + [...working.keys()].join(', '));
      }
      await settle();
    }
    await promise;
  };

  const goOnline = ({peerId, synchronizer}: Peer): void => {
    trace(`${peerId} goes online, and loads and then saves`);
    online.add(peerId);
    work(
      `${peerId} loading and saving`,
      synchronizer.load().then(() => synchronizer.save()),
    );
  };

  const goOffline = ({peerId}: Peer): void => {
    trace(`${peerId} goes offline`);
    online.delete(peerId);
    for (let index = packets.length - 1; index >= 0; index--) {
      if (packets[index][0] == peerId || packets[index][1] == peerId) {
        packets.splice(index, 1);
      }
    }
  };

  peers.forEach(({peerId, synchronizer}) => {
    trace(`${peerId} starts synchronizing`);
    online.add(peerId);
    work(`${peerId} starting`, synchronizer.startSync());
  });

  for (let step = 0; step < STEPS; step++) {
    const peer = random.pick(peers);
    await random.weighted<() => unknown>([
      [
        10,
        () => {
          const [method, ...args] = getWrite(random);
          trace(`${peer.peerId}.${method}(${args.map(code).join(', ')});`);
          (peer.store as any)[method](...structuredClone(args));
        },
      ],
      [
        6,
        () => {
          const count = 1 + random.int(6);
          trace(`the network delivers up to ${count} packets`);
          return deliver(count);
        },
      ],
      [1, () => (online.has(peer.peerId) ? goOffline(peer) : goOnline(peer))],
      [
        1,
        () => {
          trace('the network settles');
          return settle();
        },
      ],
      [
        2,
        () => {
          const ms = random.pick([1, 10, 1000, 60000]);
          trace(`${ms}ms pass`);
          return vi.advanceTimersByTimeAsync(ms);
        },
      ],
    ])();
  }

  await settle();
  peers.filter(({peerId}) => !online.has(peerId)).forEach(goOnline);
  await complete(Promise.all(working.values()));
  if (everyPeerSaves) {
    for (const {peerId, synchronizer} of peers) {
      trace(`${peerId} saves`);
      const saving = synchronizer.save();
      work(`${peerId} saving`, saving);
      await complete(saving);
    }
  }
  await settle();

  const [first, ...others] = peers;
  others.forEach(({peerId, store}) => {
    expectSame(
      store.getContent(),
      first.store.getContent(),
      `content of ${peerId} and ${first.peerId}`,
    );
    expectSame(
      store.getMergeableContentHashes(),
      first.store.getMergeableContentHashes(),
      `hashes of ${peerId} and ${first.peerId}`,
    );
  });

  const merged = createMergeableStore('merged', () => Date.now() + 240000);
  random
    .shuffle(allChanges)
    .forEach((changes) => merged.applyMergeableChanges(changes));
  expectSame(
    first.store.getContent(),
    merged.getContent(),
    'content of peers and of every change merged',
  );
  expectSame(
    first.store.getMergeableContent(),
    merged.getMergeableContent(),
    'stamps and hashes of peers and of every change merged',
  );

  // The only thing to go wrong is a request that is never answered, by a peer
  // that has gone offline.
  check(() =>
    expect(errors.filter((error) => !error.startsWith('tinybase:3:'))).toEqual(
      [],
    ),
  );

  await complete(
    Promise.all(peers.map(({synchronizer}) => synchronizer.destroy())),
  );
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test(
  'peers converge once every one of them has saved',
  async () => {
    await forEachSeed(RUNS, (random, trace) => fuzz(random, trace, true));
  },
  TIMEOUT,
);

test.fails(
  'peers converge when only those that come back online save',
  async () => {
    await forEachSeed(RUNS, (random, trace) => fuzz(random, trace, false));
  },
  TIMEOUT,
);
