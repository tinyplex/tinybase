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
