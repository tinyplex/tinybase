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
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import {createLocalPersister} from 'tinybase/persisters/persister-browser';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {beforeEach, describe, expect, test} from 'vitest';

type Rendered = {
  readonly container: HTMLElement;
  readonly rerender: (props: {[key: string]: unknown}) => Promise<void>;
  readonly unmount: () => void;
};

export type ComponentHarness = {
  readonly separator: unknown;
  readonly act: (callback: () => unknown) => Promise<void>;
  readonly render: (
    component: unknown,
    props: {[key: string]: unknown},
  ) => Rendered;
};

export type Components = {
  readonly BackwardCheckpointsView: unknown;
  readonly CellView: unknown;
  readonly IndexView: unknown;
  readonly LinkedRowsView: unknown;
  readonly LocalRowsView: unknown;
  readonly MetricView: unknown;
  readonly RemoteRowView: unknown;
  readonly ResultCellView: unknown;
  readonly ResultRowView: unknown;
  readonly ResultSortedTableView: unknown;
  readonly ResultTableView: unknown;
  readonly RowView: unknown;
  readonly SliceView: unknown;
  readonly SortedTableView: unknown;
  readonly TableView: unknown;
  readonly TablesView: unknown;
  readonly ValueView: unknown;
  readonly ValuesView: unknown;
};

export type CustomComponents = Omit<Components, 'BackwardCheckpointsView'>;

export type CustomCheckpointComponents = {
  readonly CheckpointsView: unknown;
  readonly CurrentCheckpointView?: unknown;
};

export type ProviderComponents = {
  readonly Store?: unknown;
  readonly Metrics?: unknown;
  readonly Indexes?: unknown;
  readonly Relationships?: unknown;
  readonly Queries?: unknown;
  readonly Checkpoints?: unknown;
  readonly Persister?: unknown;
  readonly Synchronizer?: unknown;
  readonly Nested?: unknown;
  readonly NestedDifferent?: unknown;
  readonly ProvideThings?: unknown;
  readonly NestedDefaults?: unknown;
};

const createTestStore = (): Store =>
  createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 3, v2: 4});

export const testCustomComponents = (
  framework: string,
  harness: ComponentHarness,
  components: CustomComponents,
): void => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  describe(`${framework} custom component scenarios`, () => {
    test('tables, rows, and cells', async () => {
      let rendered = harness.render(components.TablesView, {
        store,
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual(
        't1:r1:c1:1t2:r1:c1:2r2:c1:3c2:4',
      );
      await harness.act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(rendered.container.textContent).toEqual(
        't1:r1:c1:2t2:r1:c1:2r2:c1:3c2:4',
      );
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('');
      rendered.unmount();

      store = createTestStore();
      rendered = harness.render(components.TableView, {
        store,
        tableId: 't0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('t0:');
      await rendered.rerender({tableId: 't2'});
      expect(rendered.container.textContent).toEqual('t2:r1:c1:2r2:c1:3c2:4');
      await harness.act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(rendered.container.textContent).toEqual('t2:r1:c1:3r2:c1:3c2:4');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('t2:');
      rendered.unmount();

      store = createTestStore();
      rendered = harness.render(components.SortedTableView, {
        store,
        tableId: 't0',
        cellId: 'c0',
        descending: true,
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('t0,c0:');
      await rendered.rerender({tableId: 't2', cellId: 'c1'});
      expect(rendered.container.textContent).toEqual(
        't2,c1:r2:c1:3c2:4r1:c1:2',
      );
      await harness.act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(rendered.container.textContent).toEqual(
        't2,c1:r2:c1:3c2:4r1:c1:3',
      );
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('t2,c1:');
      rendered.unmount();

      store = createTestStore();
      rendered = harness.render(components.RowView, {
        store,
        tableId: 't0',
        rowId: 'r0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('r0:');
      await rendered.rerender({tableId: 't2', rowId: 'r2'});
      expect(rendered.container.textContent).toEqual('r2:c1:3c2:4');
      await harness.act(() => store.setCell('t2', 'r2', 'c1', 4));
      expect(rendered.container.textContent).toEqual('r2:c1:4c2:4');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('r2:');
      rendered.unmount();

      store = createTestStore();
      rendered = harness.render(components.CellView, {
        store,
        tableId: 't0',
        rowId: 'r0',
        cellId: 'c0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('c0:');
      await rendered.rerender({tableId: 't2', rowId: 'r2', cellId: 'c2'});
      expect(rendered.container.textContent).toEqual('c2:4');
      await harness.act(() => store.setCell('t2', 'r2', 'c2', 5));
      expect(rendered.container.textContent).toEqual('c2:5');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('c2:');
      rendered.unmount();
    });

    test('values', async () => {
      let rendered = harness.render(components.ValuesView, {
        store,
        valuePrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('v1:3v2:4');
      await harness.act(() => store.setValue('v1', 4));
      expect(rendered.container.textContent).toEqual('v1:4v2:4');
      await harness.act(() => store.delValues());
      expect(rendered.container.textContent).toEqual('');
      rendered.unmount();

      store = createTestStore();
      rendered = harness.render(components.ValueView, {
        store,
        valueId: 'v0',
        valuePrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('v0:');
      await rendered.rerender({valueId: 'v2'});
      expect(rendered.container.textContent).toEqual('v2:4');
      await harness.act(() => store.setValue('v2', 5));
      expect(rendered.container.textContent).toEqual('v2:5');
      await harness.act(() => store.delValues());
      expect(rendered.container.textContent).toEqual('v2:');
      rendered.unmount();
    });

    test('metrics and indexes', async () => {
      const metrics = createMetrics(store)
        .setMetricDefinition('m1', 't1')
        .setMetricDefinition('m2', 't2');
      let rendered = harness.render(components.MetricView, {
        metrics,
        metricId: 'm0',
      });
      expect(rendered.container.textContent).toEqual('m0:');
      await rendered.rerender({metricId: 'm1'});
      expect(rendered.container.textContent).toEqual('m1:1');
      await harness.act(() => store.setCell('t1', 'r2', 'c1', 2));
      expect(rendered.container.textContent).toEqual('m1:2');
      await rendered.rerender({metricId: 'm2'});
      expect(rendered.container.textContent).toEqual('m2:2');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('m2:');
      rendered.unmount();

      store = createTestStore();
      let indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
      rendered = harness.render(components.IndexView, {
        indexes,
        indexId: 'i0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('i0:');
      await rendered.rerender({indexId: 'i1'});
      expect(rendered.container.textContent).toEqual('i1:1:r1:c1:1');
      await harness.act(() => store.setCell('t1', 'r2', 'c1', 1));
      expect(rendered.container.textContent).toEqual('i1:1:r1:c1:1r2:c1:1');
      await rendered.rerender({indexId: 'i2'});
      expect(rendered.container.textContent).toEqual(
        'i2:2:r1:c1:23:r2:c1:3c2:4',
      );
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('i2:');
      rendered.unmount();

      store = createTestStore();
      indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
      rendered = harness.render(components.SliceView, {
        indexes,
        indexId: 'i0',
        sliceId: '0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('0:');
      await rendered.rerender({indexId: 'i1', sliceId: '0'});
      expect(rendered.container.textContent).toEqual('0:');
      await rendered.rerender({indexId: 'i1', sliceId: '1'});
      expect(rendered.container.textContent).toEqual('1:r1:c1:1');
      await harness.act(() => store.setCell('t1', 'r2', 'c1', 1));
      expect(rendered.container.textContent).toEqual('1:r1:c1:1r2:c1:1');
      await rendered.rerender({indexId: 'i2', sliceId: '2'});
      expect(rendered.container.textContent).toEqual('2:r1:c1:2');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('2:');
      rendered.unmount();
    });

    test('relationships', async () => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R0'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      let relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
      let rendered = harness.render(components.RemoteRowView, {
        relationships,
        relationshipId: 'r0',
        localRowId: 'r0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('r0:');
      await rendered.rerender({relationshipId: 'r1', localRowId: 'r1'});
      expect(rendered.container.textContent).toEqual('r1:R1:C1:1');
      await rendered.rerender({relationshipId: 'r1', localRowId: 'r2'});
      expect(rendered.container.textContent).toEqual('r2:R1:C1:1');
      await rendered.rerender({relationshipId: 'r1', localRowId: 'r1'});
      await harness.act(() => store.delTable('t1'));
      expect(rendered.container.textContent).toEqual('r1:');
      await rendered.rerender({relationshipId: 'r2', localRowId: 'r2'});
      expect(rendered.container.textContent).toEqual('r2:');
      rendered.unmount();

      store = createTestStore().setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
      rendered = harness.render(components.LocalRowsView, {
        relationships,
        relationshipId: 'r0',
        remoteRowId: 'R0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('R0:');
      await rendered.rerender({relationshipId: 'r1', remoteRowId: 'R1'});
      expect(rendered.container.textContent).toEqual('R1:r1:c1:R1r2:c1:R1');
      await rendered.rerender({relationshipId: 'r1', remoteRowId: 'R2'});
      expect(rendered.container.textContent).toEqual('R2:');
      await harness.act(() => store.delTable('t1'));
      expect(rendered.container.textContent).toEqual('R2:');
      await rendered.rerender({relationshipId: 'r2', remoteRowId: 'R2'});
      expect(rendered.container.textContent).toEqual('R2:');
      rendered.unmount();

      store = createTestStore().setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 't1', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'c2');
      rendered = harness.render(components.LinkedRowsView, {
        relationships,
        relationshipId: 'r0',
        firstRowId: 'r0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('r0:r0:');
      await rendered.rerender({relationshipId: 'r1', firstRowId: 'r1'});
      expect(rendered.container.textContent).toEqual(
        'r1:r1:c1:r2r2:c1:r3r3:c1:r4r4:',
      );
      await harness.act(() => store.setCell('t1', 'r2', 'c1', 'r4'));
      expect(rendered.container.textContent).toEqual('r1:r1:c1:r2r2:c1:r4r4:');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('r1:r1:');
      rendered.unmount();
    });

    test('queries', async () => {
      let queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => {
          select('c1');
          select('c2');
        });
      let rendered = harness.render(components.ResultTableView, {
        queries,
        queryId: 'q0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('q0:');
      await rendered.rerender({queryId: 'q1'});
      expect(rendered.container.textContent).toEqual('q1:r1:c1:1');
      await harness.act(() => store.setCell('t1', 'r2', 'c1', 2));
      expect(rendered.container.textContent).toEqual('q1:r1:c1:1r2:c1:2');
      await rendered.rerender({queryId: 'q2'});
      expect(rendered.container.textContent).toEqual('q2:r1:c1:2r2:c1:3c2:4');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('q2:');
      rendered.unmount();

      store = createTestStore();
      queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => {
          select('c1');
          select('c2');
        });
      rendered = harness.render(components.ResultSortedTableView, {
        queries,
        queryId: 'q0',
        cellId: 'c0',
        descending: true,
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('q0,c0:');
      await rendered.rerender({queryId: 'q2', cellId: 'c1'});
      expect(rendered.container.textContent).toEqual(
        'q2,c1:r2:c1:3c2:4r1:c1:2',
      );
      await harness.act(() => store.setCell('t2', 'r1', 'c1', 4));
      expect(rendered.container.textContent).toEqual(
        'q2,c1:r1:c1:4r2:c1:3c2:4',
      );
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('q2,c1:');
      rendered.unmount();

      store = createTestStore();
      queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => {
          select('c1');
          select('c2');
        });
      rendered = harness.render(components.ResultRowView, {
        queries,
        queryId: 'q0',
        rowId: 'r0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('r0:');
      await rendered.rerender({queryId: 'q1', rowId: 'r1'});
      expect(rendered.container.textContent).toEqual('r1:c1:1');
      await harness.act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(rendered.container.textContent).toEqual('r1:c1:2');
      await rendered.rerender({queryId: 'q2', rowId: 'r2'});
      expect(rendered.container.textContent).toEqual('r2:c1:3c2:4');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('r2:');
      rendered.unmount();

      store = createTestStore();
      queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => {
          select('c1');
          select('c2');
        });
      rendered = harness.render(components.ResultCellView, {
        queries,
        queryId: 'q0',
        rowId: 'r0',
        cellId: 'c0',
        cellPrefix: ':',
      });
      expect(rendered.container.textContent).toEqual('c0:');
      await rendered.rerender({queryId: 'q2', rowId: 'r2', cellId: 'c2'});
      expect(rendered.container.textContent).toEqual('c2:4');
      await harness.act(() => store.setCell('t2', 'r2', 'c2', 5));
      expect(rendered.container.textContent).toEqual('c2:5');
      await harness.act(() => store.delTables());
      expect(rendered.container.textContent).toEqual('c2:');
      rendered.unmount();
    });
  });
};

export const testCustomCheckpointComponents = (
  framework: string,
  harness: ComponentHarness,
  components: CustomCheckpointComponents,
): void => {
  let store: Store;
  let checkpoints: Checkpoints;

  beforeEach(() => {
    store = createTestStore();
    checkpoints = createCheckpoints(store);
    checkpoints.setCheckpoint('0', 'c1');
    store.setTables({t1: {r1: {c1: 2}}});
    checkpoints.addCheckpoint();
    store.setTables({t1: {r1: {c1: 3}}});
    checkpoints.addCheckpoint('c2');
    store.setTables({t1: {r1: {c1: 4}}});
    checkpoints.addCheckpoint('c3');
    store.setTables({t1: {r1: {c1: 5}}});
    checkpoints.addCheckpoint();
    checkpoints.goTo('2');
  });

  describe(`${framework} custom checkpoint component scenarios`, () => {
    test('all checkpoint views', async () => {
      const {container, unmount} = harness.render(components.CheckpointsView, {
        checkpoints,
      });
      await harness.act(() => checkpoints.clear());
      expect(container.textContent).toEqual('||||');

      await harness.act(() => checkpoints.setCheckpoint('0', 'c1'));
      expect(container.textContent).toEqual('|c1|||');

      await harness.act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(container.textContent).toEqual('c1||||');

      await harness.act(() => checkpoints.addCheckpoint());
      expect(container.textContent).toEqual('c1||||');

      await harness.act(() => store.setTables({t1: {r1: {c1: 3}}}));
      expect(container.textContent).toEqual('c1||||');

      await harness.act(() => checkpoints.addCheckpoint('c2'));
      expect(container.textContent).toEqual('c1|c2|||');

      await harness.act(() => checkpoints.goTo('0'));
      expect(container.textContent).toEqual('|c1|c2||');

      unmount();
    });

    if (components.CurrentCheckpointView != null) {
      test('current checkpoint custom renderer', async () => {
        const {container, unmount} = harness.render(
          components.CurrentCheckpointView,
          {checkpoints},
        );
        expect(container.textContent).toContain('current:');

        await harness.act(() => checkpoints.clear());
        expect(container.textContent).toContain('current:0');

        await harness.act(() => store.setTables({t1: {r1: {c1: 2}}}));
        expect(container.textContent).toEqual('');

        unmount();
      });
    }
  });
};

export const testProviderComponents = (
  framework: string,
  harness: ComponentHarness,
  components: ProviderComponents,
): void => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  describe(`${framework} provider component scenarios`, () => {
    if (components.Store != null) {
      describe('store', () => {
        test.each([
          [
            'tables',
            // eslint-disable-next-line max-len
            '1234{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
            () => store.setTables({t1: {r1: {c1: 2}}}),
            '2{"t1":{"r1":{"c1":2}}}',
            () => store.delTables(),
            '{}',
          ],
          [
            'table',
            '1{"r1":{"c1":1}}',
            () => store.setTable('t1', {r1: {c1: 2}}),
            '2{"r1":{"c1":2}}',
            () => store.delTable('t1'),
            '{}',
          ],
          [
            'row',
            '1{"c1":1}',
            () => store.setRow('t1', 'r1', {c1: 2}),
            '2{"c1":2}',
            () => store.delRow('t1', 'r1'),
            '{}',
          ],
          [
            'cell',
            '11',
            () => store.setCell('t1', 'r1', 'c1', 2),
            '22',
            () => store.delCell('t1', 'r1', 'c1'),
            '',
          ],
        ])(
          'default %s',
          async (mode, initial, update, updated, remove, removed) => {
            const {container, unmount} = harness.render(components.Store, {
              store,
              mode,
            });
            expect(container.textContent).toEqual(initial);
            await harness.act(update);
            expect(container.textContent).toEqual(updated);
            await harness.act(remove);
            expect(container.textContent).toEqual(removed);
            unmount();
          },
        );

        test.each([
          [
            'tables',
            // eslint-disable-next-line max-len
            '1234{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
            () => store.setTables({t1: {r1: {c1: 2}}}),
            '2{"t1":{"r1":{"c1":2}}}',
            () => store.delTables(),
            '{}',
          ],
          [
            'table',
            '1{"r1":{"c1":1}}',
            () => store.setTable('t1', {r1: {c1: 2}}),
            '2{"r1":{"c1":2}}',
            () => store.delTable('t1'),
            '{}',
          ],
          [
            'row',
            '1{"c1":1}',
            () => store.setRow('t1', 'r1', {c1: 2}),
            '2{"c1":2}',
            () => store.delRow('t1', 'r1'),
            '{}',
          ],
          [
            'cell',
            '11',
            () => store.setCell('t1', 'r1', 'c1', 2),
            '22',
            () => store.delCell('t1', 'r1', 'c1'),
            '',
          ],
        ])(
          'named %s',
          async (mode, initial, update, updated, remove, removed) => {
            const {container, unmount} = harness.render(components.Store, {
              storesById: {store1: store},
              storeId: 'store1',
              mode,
            });
            expect(container.textContent).toEqual(initial);
            await harness.act(update);
            expect(container.textContent).toEqual(updated);
            await harness.act(remove);
            expect(container.textContent).toEqual(removed);
            unmount();
          },
        );
      });
    }

    const testDefaultAndNamed = <Thing>(
      name: string,
      component: unknown,
      thing: () => Thing,
      defaultProps: (thing: Thing) => {[key: string]: unknown},
      namedProps: (thing: Thing) => {[key: string]: unknown},
      expected: string,
    ) => {
      test(`${name} default`, () => {
        const createdThing = thing();
        const {container, unmount} = harness.render(
          component,
          defaultProps(createdThing),
        );
        expect(container.textContent).toEqual(expected);
        unmount();
      });

      test(`${name} named`, () => {
        const createdThing = thing();
        const {container, unmount} = harness.render(
          component,
          namedProps(createdThing),
        );
        expect(container.textContent).toEqual(expected);
        unmount();
      });
    };

    if (components.Metrics != null) {
      testDefaultAndNamed(
        'metrics',
        components.Metrics,
        () => createMetrics(store).setMetricDefinition('m1', 't1'),
        (metrics) => ({metrics}),
        (metrics) => ({
          metricsById: {metrics1: metrics},
          metricsId: 'metrics1',
        }),
        '11',
      );
    }

    if (components.Indexes != null) {
      testDefaultAndNamed(
        'indexes',
        components.Indexes,
        () => createIndexes(store).setIndexDefinition('i1', 't1', 'c1'),
        (indexes) => ({indexes}),
        (indexes) => ({
          indexesById: {indexes1: indexes},
          indexesId: 'indexes1',
        }),
        '1["1"]1["r1"]',
      );
    }

    if (components.Relationships != null) {
      testDefaultAndNamed(
        'relationships',
        components.Relationships,
        () => {
          store.setTables({
            t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
            T1: {R1: {C1: 1}, R2: {C1: 2}},
          });
          return createRelationships(store).setRelationshipDefinition(
            'r1',
            't1',
            'T1',
            'c1',
          );
        },
        (relationships) => ({relationships}),
        (relationships) => ({
          relationshipsById: {relationships1: relationships},
          relationshipsId: 'relationships1',
        }),
        '1"R1"R1R1["r1","r2"]R1["r1"]',
      );
    }

    if (components.Queries != null) {
      testDefaultAndNamed(
        'queries',
        components.Queries,
        () =>
          createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
            select('c1'),
          ),
        (queries) => ({queries}),
        (queries) => ({
          queriesById: {queries1: queries},
          queriesId: 'queries1',
        }),
        '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
      );
    }

    if (components.Checkpoints != null) {
      testDefaultAndNamed(
        'checkpoints',
        components.Checkpoints,
        () => createCheckpoints(store),
        (checkpoints) => ({checkpoints}),
        (checkpoints) => ({
          checkpointsById: {checkpoints1: checkpoints},
          checkpointsId: 'checkpoints1',
        }),
        '[[],"0",[]]',
      );
    }

    if (components.Persister != null) {
      testDefaultAndNamed<AnyPersister>(
        'persister',
        components.Persister,
        () => createLocalPersister(store, `${framework}-provider`),
        (persister) => ({persister}),
        (persister) => ({
          persistersById: {persister1: persister},
          persisterId: 'persister1',
        }),
        '0',
      );
    }

    if (components.Synchronizer != null) {
      testDefaultAndNamed<Synchronizer>(
        'synchronizer',
        components.Synchronizer,
        () => createLocalSynchronizer(createMergeableStore()),
        (synchronizer) => ({synchronizer}),
        (synchronizer) => ({
          synchronizersById: {synchronizer1: synchronizer},
          synchronizerId: 'synchronizer1',
        }),
        '0',
      );
    }

    if (components.Nested != null) {
      test('nested same provider', () => {
        const store1 = createStore();
        const store2 = createStore();
        const {container, unmount} = harness.render(components.Nested, {
          store1,
          store2,
          outerStores: {a: store1},
          innerStores: {b: store2},
        });
        expect(container.textContent).toEqual('["a","b"]1001');
        unmount();
      });

      test('nested same provider, masked', () => {
        const store1 = createStore();
        const store2 = createStore();
        const {container, unmount} = harness.render(components.Nested, {
          store1,
          store2,
          outerStores: {a: store1, b: store1},
          innerStores: {b: store2},
        });
        expect(container.textContent).toEqual('["a","b"]1001');
        unmount();
      });
    }

    if (components.NestedDifferent != null) {
      test('nested different provider', () => {
        const store1 = createStore();
        const store2 = createStore();
        const {container, unmount} = harness.render(
          components.NestedDifferent,
          {store1, store2},
        );
        expect(container.textContent).toEqual('["a","b"]1001');
        unmount();
      });
    }

    if (components.ProvideThings != null) {
      test('provide functions', () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister: AnyPersister = createLocalPersister(
          store,
          `${framework}-provide`,
        );
        const synchronizer: Synchronizer = createLocalSynchronizer(
          createMergeableStore(),
        );
        const {container, unmount} = harness.render(components.ProvideThings, {
          store,
          metrics,
          indexes,
          relationships,
          queries,
          checkpoints,
          persister,
          synchronizer,
        });
        expect(container.textContent).toEqual('smirqcpz');
        unmount();
        synchronizer.destroy();
      });
    }

    if (components.NestedDefaults != null) {
      test('nested default fallbacks', () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister: AnyPersister = createLocalPersister(
          store,
          `${framework}-defaults`,
        );
        const synchronizer: Synchronizer = createLocalSynchronizer(
          createMergeableStore(),
        );
        const {container, unmount} = harness.render(components.NestedDefaults, {
          store,
          metrics,
          indexes,
          relationships,
          queries,
          checkpoints,
          persister,
          synchronizer,
        });
        expect(container.textContent).toEqual('smirqcpz');
        unmount();
        synchronizer.destroy();
      });
    }
  });
};

export const testComponents = (
  framework: string,
  harness: ComponentHarness,
  components: Components,
): void => {
  let store: Store;

  beforeEach(() => {
    store = createStore()
      .setTables({t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
      .setValues({v1: 3, v2: 4});
  });

  describe(`${framework} component scenarios`, () => {
    describe('tables and values', () => {
      test('TablesView basic, separator, debug, and update', async () => {
        const {container, rerender, unmount} = harness.render(
          components.TablesView,
          {store},
        );
        expect(container.textContent).toEqual('1234');

        await rerender({store, separator: harness.separator});
        expect(container.textContent).toEqual('1/234');

        await rerender({store, separator: undefined, debugIds: true});
        expect(container.textContent).toEqual(
          't1:{r1:{c1:{1}}}t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
        );

        await harness.act(() => store.setCell('t1', 'r1', 'c1', 2));
        expect(container.textContent).toEqual(
          't1:{r1:{c1:{2}}}t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
        );

        unmount();
      });

      test('TableView basic, separator, debug, and null id', async () => {
        const {container, rerender, unmount} = harness.render(
          components.TableView,
          {store, tableId: 't2'},
        );
        expect(container.textContent).toEqual('234');

        await rerender({store, tableId: 't2', separator: harness.separator});
        expect(container.textContent).toEqual('2/34');

        await rerender({
          store,
          tableId: 't2',
          separator: undefined,
          debugIds: true,
        });
        expect(container.textContent).toEqual(
          't2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
        );

        await rerender({store, tableId: null, debugIds: true});
        expect(container.textContent).toEqual(':{}');

        unmount();
      });

      test('SortedTableView sorts and limits rows', async () => {
        const {container, rerender, unmount} = harness.render(
          components.SortedTableView,
          {store, tableId: 't2', cellId: 'c1', descending: true},
        );
        expect(container.textContent).toEqual('342');

        await rerender({
          store,
          tableId: 't2',
          cellId: 'c1',
          descending: true,
          separator: harness.separator,
        });
        expect(container.textContent).toEqual('34/2');

        await rerender({
          store,
          tableId: 't2',
          cellId: 'c1',
          descending: true,
          separator: undefined,
          debugIds: true,
        });
        expect(container.textContent).toEqual(
          't2:{r2:{c1:{3}c2:{4}}r1:{c1:{2}}}',
        );

        await rerender({
          store,
          tableId: 't2',
          cellId: 'c1',
          descending: undefined,
          offset: 1,
          limit: 1,
          debugIds: true,
        });
        expect(container.textContent).toEqual('t2:{r2:{c1:{3}c2:{4}}}');

        unmount();
      });

      test('RowView and CellView', async () => {
        let rendered = harness.render(components.RowView, {
          store,
          tableId: 't2',
          rowId: 'r2',
        });
        expect(rendered.container.textContent).toEqual('34');
        await rendered.rerender({
          store,
          tableId: 't2',
          rowId: 'r2',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('3/4');
        await rendered.rerender({
          store,
          tableId: 't2',
          rowId: 'r2',
          separator: undefined,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual('r2:{c1:{3}c2:{4}}');
        rendered.unmount();

        rendered = harness.render(components.CellView, {
          store,
          tableId: 't2',
          rowId: 'r2',
          cellId: 'c2',
        });
        expect(rendered.container.textContent).toEqual('4');
        await rendered.rerender({
          store,
          tableId: 't2',
          rowId: 'r2',
          cellId: 'c2',
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual('c2:{4}');
        rendered.unmount();
      });

      test('ValuesView and ValueView', async () => {
        let rendered = harness.render(components.ValuesView, {store});
        expect(rendered.container.textContent).toEqual('34');
        await rendered.rerender({store, separator: harness.separator});
        expect(rendered.container.textContent).toEqual('3/4');
        await rendered.rerender({store, separator: undefined, debugIds: true});
        expect(rendered.container.textContent).toEqual('v1:{3}v2:{4}');
        await harness.act(() => store.setValue('v1', 4));
        expect(rendered.container.textContent).toEqual('v1:{4}v2:{4}');
        rendered.unmount();

        rendered = harness.render(components.ValueView, {store, valueId: 'v2'});
        expect(rendered.container.textContent).toEqual('4');
        await rendered.rerender({store, valueId: 'v2', debugIds: true});
        expect(rendered.container.textContent).toEqual('v2:{4}');
        rendered.unmount();
      });
    });

    describe('derived data', () => {
      let metrics: Metrics;
      let indexes: Indexes;

      beforeEach(() => {
        metrics = createMetrics(store)
          .setMetricDefinition('m1', 't1')
          .setMetricDefinition('m2', 't2');
        indexes = createIndexes(store)
          .setIndexDefinition('i1', 't1', 'c1')
          .setIndexDefinition('i2', 't2', 'c1');
      });

      test('MetricView', async () => {
        const {container, rerender, unmount} = harness.render(
          components.MetricView,
          {metrics, metricId: 'm1'},
        );
        expect(container.textContent).toEqual('1');

        await rerender({metrics, metricId: 'm1', debugIds: true});
        expect(container.textContent).toEqual('m1:{1}');

        await harness.act(() => store.setCell('t1', 'r2', 'c1', 2));
        expect(container.textContent).toEqual('m1:{2}');

        unmount();
      });

      test('IndexView and SliceView', async () => {
        let rendered = harness.render(components.IndexView, {
          indexes,
          indexId: 'i1',
        });
        expect(rendered.container.textContent).toEqual('1');
        await harness.act(() => store.setCell('t1', 'r2', 'c1', 2));
        await rendered.rerender({
          indexes,
          indexId: 'i1',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('1/2');
        await rendered.rerender({
          indexes,
          indexId: 'i1',
          separator: undefined,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual(
          'i1:{1:{r1:{c1:{1}}}2:{r2:{c1:{2}}}}',
        );
        rendered.unmount();

        rendered = harness.render(components.SliceView, {
          indexes,
          indexId: 'i1',
          sliceId: '1',
        });
        expect(rendered.container.textContent).toEqual('1');
        await harness.act(() => store.setCell('t1', 'r3', 'c1', 1));
        await rendered.rerender({
          indexes,
          indexId: 'i1',
          sliceId: '1',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('1/1');
        await rendered.rerender({
          indexes,
          indexId: 'i1',
          sliceId: '1',
          separator: undefined,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual(
          '1:{r1:{c1:{1}}r3:{c1:{1}}}',
        );
        rendered.unmount();
      });

      test('SliceView renders falsy table ids', () => {
        store.setTable('', {r1: {c1: 1}});
        indexes.setIndexDefinition('i0', '', 'c1');
        const {container, unmount} = harness.render(components.SliceView, {
          indexes,
          indexId: 'i0',
          sliceId: '1',
        });
        expect(container.textContent).toEqual('1');
        unmount();
      });
    });

    describe('relationships', () => {
      let relationships: Relationships;

      beforeEach(() => {
        store.setTables({
          t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
          T1: {R1: {C1: 1}, R2: {C1: 2}},
          links: {r1: {next: 'r2'}, r2: {next: 'r3'}, r3: {next: 'r4'}},
        });
        relationships = createRelationships(store)
          .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
          .setRelationshipDefinition('r2', 'links', 'links', 'next');
      });

      test('RemoteRowView', async () => {
        let rendered = harness.render(components.RemoteRowView, {
          relationships,
          relationshipId: 'r1',
          localRowId: 'r1',
        });
        expect(rendered.container.textContent).toEqual('1');

        await rendered.rerender({
          relationships,
          relationshipId: 'r1',
          localRowId: 'r1',
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual('r1:{R1:{C1:{1}}}');

        await rendered.rerender({
          relationships,
          relationshipId: 'r1',
          localRowId: null,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual(':{}');
        rendered.unmount();

        relationships.setRelationshipDefinition(
          'r3',
          't1',
          undefined as unknown as string,
          'c1',
        );
        rendered = harness.render(components.RemoteRowView, {
          relationships,
          relationshipId: 'r3',
          localRowId: 'r1',
        });
        expect(rendered.container.textContent).toEqual('');

        rendered.unmount();
      });

      test('LocalRowsView and LinkedRowsView', async () => {
        let rendered = harness.render(components.LocalRowsView, {
          relationships,
          relationshipId: 'r1',
          remoteRowId: 'R1',
        });
        expect(rendered.container.textContent).toEqual('R1R1');
        await rendered.rerender({
          relationships,
          relationshipId: 'r1',
          remoteRowId: 'R1',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('R1/R1');
        await rendered.rerender({
          relationships,
          relationshipId: 'r1',
          remoteRowId: 'R1',
          separator: undefined,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual(
          'R1:{r1:{c1:{R1}}r2:{c1:{R1}}}',
        );
        rendered.unmount();

        rendered = harness.render(components.LinkedRowsView, {
          relationships,
          relationshipId: 'r2',
          firstRowId: 'r1',
        });
        expect(rendered.container.textContent).toEqual('r2r3r4');
        await rendered.rerender({
          relationships,
          relationshipId: 'r2',
          firstRowId: 'r1',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('r2/r3/r4/');
        await rendered.rerender({
          relationships,
          relationshipId: 'r2',
          firstRowId: 'r1',
          separator: undefined,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual(
          'r1:{r1:{next:{r2}}r2:{next:{r3}}r3:{next:{r4}}r4:{}}',
        );
        rendered.unmount();
      });

      test('relationship views render falsy local table ids', () => {
        store.setTable('', {r1: {c1: 'R1'}, r2: {c1: 'R1'}});
        relationships.setRelationshipDefinition('r0', '', 'T1', 'c1');

        let rendered = harness.render(components.LocalRowsView, {
          relationships,
          relationshipId: 'r0',
          remoteRowId: 'R1',
        });
        expect(rendered.container.textContent).toEqual('R1R1');
        rendered.unmount();

        store.setTable('', {
          r1: {next: 'r2'},
          r2: {next: 'r3'},
          r3: {next: 'r4'},
        });
        relationships.setRelationshipDefinition('r3', '', '', 'next');

        rendered = harness.render(components.LinkedRowsView, {
          relationships,
          relationshipId: 'r3',
          firstRowId: 'r1',
        });
        expect(rendered.container.textContent).toEqual('r2r3r4');
        rendered.unmount();
      });
    });

    describe('queries and checkpoints', () => {
      let queries: Queries;
      let checkpoints: Checkpoints;

      beforeEach(() => {
        queries = createQueries(store)
          .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
          .setQueryDefinition('q2', 't2', ({select}) => {
            select('c1');
            select('c2');
          });
      });

      test('query views', async () => {
        let rendered = harness.render(components.ResultTableView, {
          queries,
          queryId: 'q1',
        });
        expect(rendered.container.textContent).toEqual('1');
        await rendered.rerender({
          queries,
          queryId: 'q2',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('2/34');
        await rendered.rerender({
          queries,
          queryId: 'q1',
          separator: undefined,
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual('q1:{r1:{c1:{1}}}');
        rendered.unmount();

        rendered = harness.render(components.ResultSortedTableView, {
          queries,
          queryId: 'q2',
          cellId: 'c1',
          descending: true,
        });
        expect(rendered.container.textContent).toEqual('342');
        rendered.unmount();

        rendered = harness.render(components.ResultRowView, {
          queries,
          queryId: 'q2',
          rowId: 'r2',
          separator: harness.separator,
        });
        expect(rendered.container.textContent).toEqual('3/4');
        rendered.unmount();

        rendered = harness.render(components.ResultCellView, {
          queries,
          queryId: 'q2',
          rowId: 'r2',
          cellId: 'c2',
          debugIds: true,
        });
        expect(rendered.container.textContent).toEqual('c2:{4}');
        rendered.unmount();
      });

      test('BackwardCheckpointsView', async () => {
        checkpoints = createCheckpoints(store);
        checkpoints.setCheckpoint('0', 'c1');
        store.setTables({t1: {r1: {c1: 2}}});
        checkpoints.addCheckpoint();
        store.setTables({t1: {r1: {c1: 3}}});
        checkpoints.addCheckpoint('c2');
        store.setTables({t1: {r1: {c1: 4}}});
        checkpoints.addCheckpoint('c3');
        checkpoints.goTo('2');
        const {container, rerender, unmount} = harness.render(
          components.BackwardCheckpointsView,
          {checkpoints},
        );
        expect(container.textContent).toEqual('c1');

        await rerender({checkpoints, separator: harness.separator});
        expect(container.textContent).toEqual('c1/');

        await rerender({checkpoints, separator: undefined, debugIds: true});
        expect(container.textContent).toEqual('0:{c1}1:{}');

        unmount();
      });
    });
  });
};
