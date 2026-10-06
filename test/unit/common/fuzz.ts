import {expect} from 'vitest';

// Helpers for seeded fuzz tests, which apply long random sequences of
// operations and check that some invariant holds after every one of them.
//
// A seed fully determines a sequence, so a failure can always be replayed:
// the error names the seed, and lists the operations that led to it. Each test
// runs a modest number of seeds by default, to keep the ordinary suite quick,
// and these environment variables change that:
//
//   FUZZ_RUNS=5000 npx vitest run test/unit/core/fuzz   # hunt for longer
//   FUZZ_SEED=1234 npx vitest run test/unit/core/fuzz   # replay one seed

export type Random = {
  // A float, at least 0 and less than 1.
  next: () => number;
  // An integer, at least 0 and less than max.
  int: (max: number) => number;
  // True with the given probability.
  bool: (probability?: number) => boolean;
  // One of the items.
  pick: <Item>(items: readonly Item[]) => Item;
  // One of the items, each chosen in proportion to its weight.
  weighted: <Item>(choices: readonly (readonly [number, Item])[]) => Item;
  // A copy of the items, shuffled.
  shuffle: <Item>(items: readonly Item[]) => Item[];
};

export type Trace = (statement: string) => void;

// The mulberry32 generator: small, fast, and good enough to explore with.
export const createRandom = (seed: number): Random => {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };

  const int = (max: number): number => Math.floor(next() * max);

  const bool = (probability = 0.5): boolean => next() < probability;

  const pick = <Item>(items: readonly Item[]): Item => items[int(items.length)];

  const weighted = <Item>(
    choices: readonly (readonly [number, Item])[],
  ): Item => {
    const total = choices.reduce((sum, [weight]) => sum + weight, 0);
    let remaining = next() * total;
    for (const [weight, item] of choices) {
      remaining -= weight;
      if (remaining < 0) {
        return item;
      }
    }
    return choices[choices.length - 1][1];
  };

  const shuffle = <Item>(items: readonly Item[]): Item[] => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const other = int(index + 1);
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled;
  };

  return {next, int, bool, pick, weighted, shuffle};
};

// Runs the function once for each seed, giving it a random generator and a
// way to record each operation it performs, as a line of code. If it throws,
// the error is given the seed and that record, so the failure can be read and
// replayed.
export const forEachSeed = async (
  defaultRuns: number,
  run: (random: Random, trace: Trace, seed: number) => void | Promise<void>,
): Promise<void> => {
  const {FUZZ_RUNS, FUZZ_SEED} = process.env;
  const seeds = FUZZ_SEED
    ? [Number(FUZZ_SEED)]
    : Array.from(
        {length: FUZZ_RUNS ? Number(FUZZ_RUNS) : defaultRuns},
        (_, index) => index + 1,
      );
  for (const seed of seeds) {
    const statements: string[] = [];
    try {
      await run(
        createRandom(seed),
        (statement) => statements.push(statement),
        seed,
      );
    } catch (error: any) {
      error.message =
        `Fuzz seed ${seed} failed (replay with FUZZ_SEED=${seed}) after:\n` +
        statements.map((statement) => '  ' + statement).join('\n') +
        '\n\n' +
        error.message;
      throw error;
    }
  }
  expect(seeds.length).toBeGreaterThan(0);
};

// Runs some assertions without adding them to the suite's count of
// assertions. A fuzz test checks its invariants a great many times, and each
// of those should not count as though it were a hand-written expectation.
export const check = (assertions: () => void): void => {
  const {assertionCalls} = expect.getState();
  assertions();
  expect.setState({assertionCalls});
};

// Checks that two things are deeply equal, in the way that toEqual means it,
// without adding to the suite's count of assertions.
export const expectSame = (
  actual: unknown,
  expected: unknown,
  message?: string,
): void => check(() => expect(actual, message).toEqual(expected));

// Formats a value as it would be written in code, for the trace.
export const code = (value: unknown): string =>
  value === undefined ? 'undefined' : JSON.stringify(value);
