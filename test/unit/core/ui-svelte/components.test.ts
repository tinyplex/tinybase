import {act, render} from '@testing-library/svelte';
import {createRawSnippet} from 'svelte';
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
import {
  BackwardCheckpointsView,
  CellView,
  IndexView,
  LinkedRowsView,
  LocalRowsView,
  MetricView,
  RemoteRowView,
  ResultCellView,
  ResultRowView,
  ResultSortedTableView,
  ResultTableView,
  RowView,
  SliceView,
  SortedTableView,
  TableView,
  TablesView,
  ValueView,
  ValuesView,
} from 'tinybase/ui-svelte';
import {createStore as createStore2} from 'tinybase/with-schemas';
import {beforeEach, describe, expect, test} from 'vitest';
import {
  testComponents,
  testCustomCheckpointComponents,
  testCustomComponents,
} from '../ui-common/components.ts';

import TestAllCheckpointsView from './components/TestAllCheckpointsView.svelte';
import TestCellView from './components/TestCellView.svelte';
import TestIndexView from './components/TestIndexView.svelte';
import TestLinkedRowsView from './components/TestLinkedRowsView.svelte';
import TestLocalRowsView from './components/TestLocalRowsView.svelte';
import TestMetricView from './components/TestMetricView.svelte';
import TestRemoteRowView from './components/TestRemoteRowView.svelte';
import TestResultCellView from './components/TestResultCellView.svelte';
import TestResultRowView from './components/TestResultRowView.svelte';
import TestResultSortedTableView from './components/TestResultSortedTableView.svelte';
import TestResultTableView from './components/TestResultTableView.svelte';
import TestRowView from './components/TestRowView.svelte';
import TestSliceView from './components/TestSliceView.svelte';
import TestSortedTableView from './components/TestSortedTableView.svelte';
import TestTableView from './components/TestTableView.svelte';
import TestTablesView from './components/TestTablesView.svelte';
import TestValueView from './components/TestValueView.svelte';
import TestValuesView from './components/TestValuesView.svelte';

import ContextCheckpoints from './components/ContextCheckpoints.svelte';
import ContextIndexes from './components/ContextIndexes.svelte';
import ContextMetrics from './components/ContextMetrics.svelte';
import ContextNested from './components/ContextNested.svelte';
import ContextNestedDefaults from './components/ContextNestedDefaults.svelte';
import ContextNestedDifferent from './components/ContextNestedDifferent.svelte';
import ContextPersister from './components/ContextPersister.svelte';
import ContextQueries from './components/ContextQueries.svelte';
import ContextRelationships from './components/ContextRelationships.svelte';
import ContextStore from './components/ContextStore.svelte';
import ContextSynchronizer from './components/ContextSynchronizer.svelte';
import ProvideThings from './components/ProvideThings.svelte';
import TestCurrentCheckpointViewSnippet from './components/TestCurrentCheckpointViewSnippet.svelte';

const sep = createRawSnippet(() => ({render: () => '<span>/</span>'}));
type SvelteComponent = Parameters<typeof render>[0];

let store: Store;

const componentHarness = {
  separator: sep,
  act: async (callback: () => unknown) => {
    await act(() => callback());
  },
  render: (component: unknown, props: {[key: string]: unknown}) => {
    let currentProps = props;
    const rendered = render(component as SvelteComponent, {
      props: currentProps,
    });
    return {
      container: rendered.container,
      rerender: async (nextProps: {[key: string]: unknown}) => {
        currentProps = {...currentProps, ...nextProps};
        await rendered.rerender(currentProps);
      },
      unmount: rendered.unmount,
    };
  },
};

testComponents('ui-svelte', componentHarness, {
  BackwardCheckpointsView,
  CellView,
  IndexView,
  LinkedRowsView,
  LocalRowsView,
  MetricView,
  RemoteRowView,
  ResultCellView,
  ResultRowView,
  ResultSortedTableView,
  ResultTableView,
  RowView,
  SliceView,
  SortedTableView,
  TableView,
  TablesView,
  ValueView,
  ValuesView,
});

testCustomComponents('ui-svelte', componentHarness, {
  CellView: TestCellView,
  IndexView: TestIndexView,
  LinkedRowsView: TestLinkedRowsView,
  LocalRowsView: TestLocalRowsView,
  MetricView: TestMetricView,
  RemoteRowView: TestRemoteRowView,
  ResultCellView: TestResultCellView,
  ResultRowView: TestResultRowView,
  ResultSortedTableView: TestResultSortedTableView,
  ResultTableView: TestResultTableView,
  RowView: TestRowView,
  SliceView: TestSliceView,
  SortedTableView: TestSortedTableView,
  TableView: TestTableView,
  TablesView: TestTablesView,
  ValueView: TestValueView,
  ValuesView: TestValuesView,
});

testCustomCheckpointComponents('ui-svelte', componentHarness, {
  CheckpointsView: TestAllCheckpointsView,
  CurrentCheckpointView: TestCurrentCheckpointViewSnippet,
});

describe('Svelte-specific', () => {
  beforeEach(() => {
    store = createStore()
      .setTables({
        t1: {r1: {c1: 1}},
        t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
      })
      .setValues({v1: 3, v2: 4});
  });

  describe('Context Provider', () => {
    describe('default', () => {
      describe('store', () => {
        test('for tables', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {store, mode: 'tables'},
          });
          expect(container.textContent).toEqual(
            // eslint-disable-next-line max-len
            '1234{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
          );

          await act(() => store.setTables({t1: {r1: {c1: 2}}}));
          expect(container.textContent).toEqual('2{"t1":{"r1":{"c1":2}}}');

          await act(() => store.delTables());
          expect(container.textContent).toEqual('{}');

          unmount();
        });

        test('for table', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {store, mode: 'table'},
          });
          expect(container.textContent).toEqual('1{"r1":{"c1":1}}');

          await act(() => store.setTable('t1', {r1: {c1: 2}}));
          expect(container.textContent).toEqual('2{"r1":{"c1":2}}');

          await act(() => store.delTable('t1'));
          expect(container.textContent).toEqual('{}');

          unmount();
        });

        test('for row', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {store, mode: 'row'},
          });
          expect(container.textContent).toEqual('1{"c1":1}');

          await act(() => store.setRow('t1', 'r1', {c1: 2}));
          expect(container.textContent).toEqual('2{"c1":2}');

          await act(() => store.delRow('t1', 'r1'));
          expect(container.textContent).toEqual('{}');

          unmount();
        });

        test('for cell', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {store, mode: 'cell'},
          });
          expect(container.textContent).toEqual('11');

          await act(() => store.setCell('t1', 'r1', 'c1', 2));
          expect(container.textContent).toEqual('22');

          await act(() => store.delCell('t1', 'r1', 'c1'));
          expect(container.textContent).toEqual('');

          unmount();
        });
      });

      test('metrics', () => {
        const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
        const {container, unmount} = render(ContextMetrics, {
          props: {metrics},
        });
        expect(container.textContent).toEqual('11');
        unmount();
      });

      test('indexes', () => {
        const indexes = createIndexes(store).setIndexDefinition(
          'i1',
          't1',
          'c1',
        );
        const {container, unmount} = render(ContextIndexes, {
          props: {indexes},
        });
        expect(container.textContent).toEqual('1["1"]1["r1"]');
        unmount();
      });

      test('relationships', () => {
        store.setTables({
          t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
          T1: {R1: {C1: 1}, R2: {C1: 2}},
        });
        const relationships = createRelationships(
          store,
        ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
        const {container, unmount} = render(ContextRelationships, {
          props: {relationships},
        });
        expect(container.textContent).toEqual('1"R1"R1R1["r1","r2"]R1["r1"]');
        unmount();
      });

      test('queries', () => {
        const queries = createQueries(store).setQueryDefinition(
          'q1',
          't1',
          ({select}) => select('c1'),
        );
        const {container, unmount} = render(ContextQueries, {
          props: {queries},
        });
        expect(container.textContent).toEqual(
          '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
        );
        unmount();
      });

      test('checkpoints', () => {
        const checkpoints = createCheckpoints(store);
        const {container, unmount} = render(ContextCheckpoints, {
          props: {checkpoints},
        });
        expect(container.textContent).toEqual('[[],"0",[]]');
        unmount();
      });

      test('persister', () => {
        const persister = createLocalPersister(store, '');
        const {container, unmount} = render(ContextPersister, {
          props: {persister},
        });
        expect(container.textContent).toEqual('0');
        unmount();
      });

      test('synchronizer', () => {
        const synchronizer = createLocalSynchronizer(createMergeableStore());
        const {container, unmount} = render(ContextSynchronizer, {
          props: {synchronizer},
        });
        expect(container.textContent).toEqual('0');
        unmount();
      });
    });

    describe('named', () => {
      describe('store', () => {
        test('for tables', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {
              storesById: {store1: store},
              storeId: 'store1',
              mode: 'tables',
            },
          });
          expect(container.textContent).toEqual(
            // eslint-disable-next-line max-len
            '1234{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
          );

          await act(() => store.setTables({t1: {r1: {c1: 2}}}));
          expect(container.textContent).toEqual('2{"t1":{"r1":{"c1":2}}}');

          await act(() => store.delTables());
          expect(container.textContent).toEqual('{}');

          unmount();
        });

        test('for table', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {
              storesById: {store1: store},
              storeId: 'store1',
              mode: 'table',
            },
          });
          expect(container.textContent).toEqual('1{"r1":{"c1":1}}');

          await act(() => store.setTable('t1', {r1: {c1: 2}}));
          expect(container.textContent).toEqual('2{"r1":{"c1":2}}');

          await act(() => store.delTable('t1'));
          expect(container.textContent).toEqual('{}');

          unmount();
        });

        test('for row', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {
              storesById: {store1: store},
              storeId: 'store1',
              mode: 'row',
            },
          });
          expect(container.textContent).toEqual('1{"c1":1}');

          await act(() => store.setRow('t1', 'r1', {c1: 2}));
          expect(container.textContent).toEqual('2{"c1":2}');

          await act(() => store.delRow('t1', 'r1'));
          expect(container.textContent).toEqual('{}');

          unmount();
        });

        test('for cell', async () => {
          const {container, unmount} = render(ContextStore, {
            props: {
              storesById: {store1: store},
              storeId: 'store1',
              mode: 'cell',
            },
          });
          expect(container.textContent).toEqual('11');

          await act(() => store.setCell('t1', 'r1', 'c1', 2));
          expect(container.textContent).toEqual('22');

          await act(() => store.delCell('t1', 'r1', 'c1'));
          expect(container.textContent).toEqual('');

          unmount();
        });
      });

      test('metrics', () => {
        const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
        const {container, unmount} = render(ContextMetrics, {
          props: {metricsById: {metrics1: metrics}, metricsId: 'metrics1'},
        });
        expect(container.textContent).toEqual('11');
        unmount();
      });

      test('indexes', () => {
        const indexes = createIndexes(store).setIndexDefinition(
          'i1',
          't1',
          'c1',
        );
        const {container, unmount} = render(ContextIndexes, {
          props: {indexesById: {indexes1: indexes}, indexesId: 'indexes1'},
        });
        expect(container.textContent).toEqual('1["1"]1["r1"]');
        unmount();
      });

      test('relationships', () => {
        store.setTables({
          t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
          T1: {R1: {C1: 1}, R2: {C1: 2}},
        });
        const relationships = createRelationships(
          store,
        ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
        const {container, unmount} = render(ContextRelationships, {
          props: {
            relationshipsById: {relationships1: relationships},
            relationshipsId: 'relationships1',
          },
        });
        expect(container.textContent).toEqual('1"R1"R1R1["r1","r2"]R1["r1"]');
        unmount();
      });

      test('queries', () => {
        const queries = createQueries(store).setQueryDefinition(
          'q1',
          't1',
          ({select}) => select('c1'),
        );
        const {container, unmount} = render(ContextQueries, {
          props: {queriesById: {queries1: queries}, queriesId: 'queries1'},
        });
        expect(container.textContent).toEqual(
          '1{"r1":{"c1":1}}["r1"]1{"c1":1}["c1"]11',
        );
        unmount();
      });

      test('checkpoints', () => {
        const checkpoints = createCheckpoints(store);
        const {container, unmount} = render(ContextCheckpoints, {
          props: {
            checkpointsById: {checkpoints1: checkpoints},
            checkpointsId: 'checkpoints1',
          },
        });
        expect(container.textContent).toEqual('[[],"0",[]]');
        unmount();
      });

      test('persister', () => {
        const persister = createLocalPersister(store, '');
        const {container, unmount} = render(ContextPersister, {
          props: {
            persistersById: {persister1: persister},
            persisterId: 'persister1',
          },
        });
        expect(container.textContent).toEqual('0');
        unmount();
      });

      test('synchronizer', () => {
        const synchronizer = createLocalSynchronizer(createMergeableStore());
        const {container, unmount} = render(ContextSynchronizer, {
          props: {
            synchronizersById: {synchronizer1: synchronizer},
            synchronizerId: 'synchronizer1',
          },
        });
        expect(container.textContent).toEqual('0');
        unmount();
      });
    });

    describe('nested', () => {
      test('same provider', () => {
        const store1 = createStore();
        const store2 = createStore();
        const {container, unmount} = render(ContextNested, {
          props: {
            store1,
            store2,
            outerStores: {a: store1},
            innerStores: {b: store2},
          },
        });
        expect(container.textContent).toEqual('["a","b"]1001');
        unmount();
      });

      test('same provider, masked', () => {
        const store1 = createStore();
        const store2 = createStore();
        const {container, unmount} = render(ContextNested, {
          props: {
            store1,
            store2,
            outerStores: {a: store1, b: store1},
            innerStores: {b: store2},
          },
        });
        expect(container.textContent).toEqual('["a","b"]1001');
        unmount();
      });

      test('different provider', () => {
        const store1 = createStore();
        const store2 = createStore2();
        const {container, unmount} = render(ContextNestedDifferent, {
          props: {store1, store2},
        });
        expect(container.textContent).toEqual('["a","b"]1001');
        unmount();
      });
    });

    describe('provide', () => {
      test('provideXxx functions', async () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister: AnyPersister = createLocalPersister(store, 'pt');
        const mergeableStore = createMergeableStore();
        const synchronizer: Synchronizer =
          createLocalSynchronizer(mergeableStore);

        const {container, unmount} = render(ProvideThings, {
          props: {
            store,
            metrics,
            indexes,
            relationships,
            queries,
            checkpoints,
            persister,
            synchronizer,
          },
        });
        expect(container.textContent).toContain('provided');
        unmount();
        synchronizer.destroy();
      });
    });

    describe('nested defaults', () => {
      test('parentCtx fallbacks', async () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister: AnyPersister = createLocalPersister(store, 'nd');
        const mergeableStore = createMergeableStore();
        const synchronizer: Synchronizer =
          createLocalSynchronizer(mergeableStore);

        const {container, unmount} = render(ContextNestedDefaults, {
          props: {
            store,
            metrics,
            indexes,
            relationships,
            queries,
            checkpoints,
            persister,
            synchronizer,
          },
        });
        expect(container.textContent).toContain('s');
        expect(container.textContent).toContain('m');
        expect(container.textContent).toContain('i');
        expect(container.textContent).toContain('r');
        expect(container.textContent).toContain('q');
        expect(container.textContent).toContain('c');
        expect(container.textContent).toContain('p');
        expect(container.textContent).toContain('syn');
        unmount();
        synchronizer.destroy();
      });
    });
  });
});
