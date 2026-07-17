import {act, render} from '@testing-library/svelte';
import {createRawSnippet} from 'svelte';
import {createStore} from 'tinybase';
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
import {expect, test} from 'vitest';
import {
  testComponents,
  testCustomCheckpointComponents,
  testCustomComponents,
  testProviderComponents,
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
import ContextDuplicateProvidedStores from './components/ContextDuplicateProvidedStores.svelte';
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

testProviderComponents('ui-svelte', componentHarness, {
  Store: ContextStore,
  Metrics: ContextMetrics,
  Indexes: ContextIndexes,
  Relationships: ContextRelationships,
  Queries: ContextQueries,
  Checkpoints: ContextCheckpoints,
  Persister: ContextPersister,
  Synchronizer: ContextSynchronizer,
  Nested: ContextNested,
  NestedDifferent: ContextNestedDifferent,
  ProvideThings,
  NestedDefaults: ContextNestedDefaults,
});

test('duplicate provider registrations retain ownership', async () => {
  const store1 = createStore().setCell('t1', 'r1', 'c1', 1);
  const store2 = createStore().setCell('t1', 'r1', 'c1', 2);
  const {container, rerender, unmount} = componentHarness.render(
    ContextDuplicateProvidedStores,
    {show1: true, show2: true, store1, store2},
  );
  const getText = () => container.textContent.trim();
  expect(getText()).toBe('22');

  await rerender({show2: false});
  expect(getText()).toBe('11');
  await rerender({show2: true});
  expect(getText()).toBe('22');
  await rerender({show1: false});
  expect(getText()).toBe('22');
  await rerender({show2: false});
  expect(getText()).toBe('');

  unmount();
});
