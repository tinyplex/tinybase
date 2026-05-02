import type {
  Checkpoints,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {beforeEach, describe, expect, test} from 'vitest';

type Rendered = {
  readonly container: HTMLElement;
  readonly unmount: () => void;
};

export type PrimitiveHarness = {
  readonly render: (
    component: unknown,
    props: {[key: string]: unknown},
  ) => Rendered;
};

export type ContextPrimitiveComponents = {
  readonly Things: unknown;
  readonly NoContext: unknown;
  readonly hasStores?: boolean;
};

export type ContextPrimitiveProps = {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
};

const createTestThings = (): ContextPrimitiveProps => {
  const store = createStore().setTables({t1: {r1: {c1: 1}}});
  return {
    store,
    metrics: createMetrics(store),
    indexes: createIndexes(store),
    relationships: createRelationships(store),
    queries: createQueries(store),
    checkpoints: createCheckpoints(store),
    persister: {} as AnyPersister,
    synchronizer: {} as Synchronizer,
  };
};

export const testContextPrimitives = (
  framework: string,
  harness: PrimitiveHarness,
  components: ContextPrimitiveComponents,
): void => {
  let things: ContextPrimitiveProps;

  beforeEach(() => {
    things = createTestThings();
  });

  describe(`${framework} context primitive scenarios`, () => {
    test('provided things and ids', () => {
      const {container, unmount} = harness.render(components.Things, things);
      expect(container.textContent).toEqual(
        JSON.stringify([
          ['store1'],
          ['metrics1'],
          ['indexes1'],
          ['relationships1'],
          ['queries1'],
          ['checkpoints1'],
          ['persister1'],
          ['synchronizer1'],
          ...(components.hasStores ? [true] : []),
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
        ]),
      );
      unmount();
    });

    test('missing context', () => {
      const {container, unmount} = harness.render(components.NoContext, {});
      expect(container.textContent).toEqual(
        JSON.stringify([[], [], [], [], [], [], [], []]),
      );
      unmount();
    });
  });
};
