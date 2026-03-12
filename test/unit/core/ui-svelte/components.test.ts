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
import {beforeEach, describe, expect, test} from 'vitest';

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
import ContextPersister from './components/ContextPersister.svelte';
import ContextQueries from './components/ContextQueries.svelte';
import ContextRelationships from './components/ContextRelationships.svelte';
import ContextStore from './components/ContextStore.svelte';
import ContextSynchronizer from './components/ContextSynchronizer.svelte';
import ProvideThings from './components/ProvideThings.svelte';
import TestCurrentCheckpointViewSnippet from './components/TestCurrentCheckpointViewSnippet.svelte';

const sep = createRawSnippet(() => ({render: () => '<span>/</span>'}));

let store: Store;

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 3, v2: 4});
});

describe('Read Components', () => {
  describe('TablesView', () => {
    test('Basic', () => {
      const {container, unmount} = render(TablesView, {props: {store}});
      expect(container.textContent).toEqual('1234');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(TablesView, {
        props: {store, separator: sep},
      });
      expect(container.textContent).toEqual('1/234');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(TablesView, {
        props: {store, debugIds: true},
      });
      expect(container.textContent).toEqual(
        't1:{r1:{c1:{1}}}t2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );
      unmount();
    });

    test('Custom', async () => {
      const {container, unmount} = render(TestTablesView, {
        props: {store, cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('t1:r1:c1:1t2:r1:c1:2r2:c1:3c2:4');

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(container.textContent).toEqual('t1:r1:c1:2t2:r1:c1:2r2:c1:3c2:4');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('');

      unmount();
    });
  });

  describe('TableView', () => {
    test('Basic', () => {
      const {container, unmount} = render(TableView, {
        props: {store, tableId: 't2'},
      });
      expect(container.textContent).toEqual('234');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(TableView, {
        props: {store, tableId: 't2', separator: sep},
      });
      expect(container.textContent).toEqual('2/34');
      unmount();
    });

    test('Debug Ids', async () => {
      const {container, rerender, unmount} = render(TableView, {
        props: {store, tableId: 't2', separator: sep},
      });
      expect(container.textContent).toEqual('2/34');

      await rerender({tableId: 't2', debugIds: true, separator: undefined});
      expect(container.textContent).toEqual(
        't2:{r1:{c1:{2}}r2:{c1:{3}c2:{4}}}',
      );
      unmount();
    });

    test('Debug Ids with null tableId', () => {
      const {container, unmount} = render(TableView, {
        props: {store, tableId: null as any, debugIds: true},
      });
      expect(container.textContent).toEqual(':{}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestTableView, {
        props: {store, tableId: 't0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('t0:');

      await rerender({tableId: 't2'});
      expect(container.textContent).toEqual('t2:r1:c1:2r2:c1:3c2:4');

      await act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(container.textContent).toEqual('t2:r1:c1:3r2:c1:3c2:4');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('t2:');

      unmount();
    });
  });

  describe('SortedTableView', () => {
    test('Basic', () => {
      const {container, unmount} = render(SortedTableView, {
        props: {store, tableId: 't2', cellId: 'c1', descending: true},
      });
      expect(container.textContent).toEqual('342');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(SortedTableView, {
        props: {
          store,
          tableId: 't2',
          cellId: 'c1',
          descending: true,
          separator: sep,
        },
      });
      expect(container.textContent).toEqual('34/2');
      unmount();
    });

    test('Debug Ids', async () => {
      const {container, rerender, unmount} = render(SortedTableView, {
        props: {
          store,
          tableId: 't2',
          cellId: 'c1',
          descending: true,
          separator: sep,
        },
      });
      expect(container.textContent).toEqual('34/2');

      await rerender({
        tableId: 't2',
        cellId: 'c1',
        descending: true,
        debugIds: true,
        separator: undefined,
      });
      expect(container.textContent).toEqual(
        't2:{r2:{c1:{3}c2:{4}}r1:{c1:{2}}}',
      );

      await rerender({
        tableId: 't2',
        cellId: 'c1',
        offset: 1,
        limit: 1,
        descending: undefined,
        debugIds: true,
      });
      expect(container.textContent).toEqual('t2:{r2:{c1:{3}c2:{4}}}');

      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestSortedTableView, {
        props: {
          store,
          tableId: 't0',
          cellId: 'c0',
          descending: true,
          cellPrefix: ':',
        },
      });
      expect(container.textContent).toEqual('t0,c0:');

      await rerender({tableId: 't2', cellId: 'c1'});
      expect(container.textContent).toEqual('t2,c1:r2:c1:3c2:4r1:c1:2');

      await act(() => store.setCell('t2', 'r1', 'c1', 3));
      expect(container.textContent).toEqual('t2,c1:r2:c1:3c2:4r1:c1:3');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('t2,c1:');

      unmount();
    });
  });

  describe('RowView', () => {
    test('Basic', () => {
      const {container, unmount} = render(RowView, {
        props: {store, tableId: 't2', rowId: 'r2'},
      });
      expect(container.textContent).toEqual('34');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(RowView, {
        props: {store, tableId: 't2', rowId: 'r2', separator: sep},
      });
      expect(container.textContent).toEqual('3/4');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(RowView, {
        props: {store, tableId: 't2', rowId: 'r2', debugIds: true},
      });
      expect(container.textContent).toEqual('r2:{c1:{3}c2:{4}}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestRowView, {
        props: {store, tableId: 't0', rowId: 'r0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('r0:');

      await rerender({tableId: 't2', rowId: 'r2'});
      expect(container.textContent).toEqual('r2:c1:3c2:4');

      await act(() => store.setCell('t2', 'r2', 'c1', 4));
      expect(container.textContent).toEqual('r2:c1:4c2:4');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('r2:');

      unmount();
    });
  });

  describe('CellView', () => {
    test('Basic', () => {
      const {container, unmount} = render(CellView, {
        props: {store, tableId: 't2', rowId: 'r2', cellId: 'c2'},
      });
      expect(container.textContent).toEqual('4');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(CellView, {
        props: {
          store,
          tableId: 't2',
          rowId: 'r2',
          cellId: 'c2',
          debugIds: true,
        },
      });
      expect(container.textContent).toEqual('c2:{4}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestCellView, {
        props: {
          store,
          tableId: 't0',
          rowId: 'r0',
          cellId: 'c0',
          cellPrefix: ':',
        },
      });
      expect(container.textContent).toEqual('c0:');

      await rerender({tableId: 't2', rowId: 'r2', cellId: 'c2'});
      expect(container.textContent).toEqual('c2:4');

      await act(() => store.setCell('t2', 'r2', 'c2', 5));
      expect(container.textContent).toEqual('c2:5');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('c2:');

      unmount();
    });
  });

  describe('ValuesView', () => {
    test('Basic', () => {
      const {container, unmount} = render(ValuesView, {props: {store}});
      expect(container.textContent).toEqual('34');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(ValuesView, {
        props: {store, separator: sep},
      });
      expect(container.textContent).toEqual('3/4');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(ValuesView, {
        props: {store, debugIds: true},
      });
      expect(container.textContent).toEqual('v1:{3}v2:{4}');
      unmount();
    });

    test('Custom', async () => {
      const {container, unmount} = render(TestValuesView, {
        props: {store, valuePrefix: ':'},
      });
      expect(container.textContent).toEqual('v1:3v2:4');

      await act(() => store.setValue('v1', 4));
      expect(container.textContent).toEqual('v1:4v2:4');

      await act(() => store.delValues());
      expect(container.textContent).toEqual('');

      unmount();
    });
  });

  describe('ValueView', () => {
    test('Basic', () => {
      const {container, unmount} = render(ValueView, {
        props: {store, valueId: 'v2'},
      });
      expect(container.textContent).toEqual('4');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(ValueView, {
        props: {store, valueId: 'v2', debugIds: true},
      });
      expect(container.textContent).toEqual('v2:{4}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestValueView, {
        props: {store, valueId: 'v0', valuePrefix: ':'},
      });
      expect(container.textContent).toEqual('v0:');

      await rerender({valueId: 'v2'});
      expect(container.textContent).toEqual('v2:4');

      await act(() => store.setValue('v2', 5));
      expect(container.textContent).toEqual('v2:5');

      await act(() => store.delValues());
      expect(container.textContent).toEqual('v2:');

      unmount();
    });
  });

  describe('MetricView', () => {
    let metrics: Metrics;

    beforeEach(() => {
      metrics = createMetrics(store)
        .setMetricDefinition('m1', 't1')
        .setMetricDefinition('m2', 't2');
    });

    test('Basic', () => {
      const {container, unmount} = render(MetricView, {
        props: {metrics, metricId: 'm1'},
      });
      expect(container.textContent).toEqual('1');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(MetricView, {
        props: {metrics, metricId: 'm1', debugIds: true},
      });
      expect(container.textContent).toEqual('m1:{1}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestMetricView, {
        props: {metrics, metricId: 'm0'},
      });
      expect(container.textContent).toEqual('m0:');

      await rerender({metricId: 'm1'});
      expect(container.textContent).toEqual('m1:1');

      await act(() => store.setCell('t1', 'r2', 'c1', 2));
      expect(container.textContent).toEqual('m1:2');

      await rerender({metricId: 'm2'});
      expect(container.textContent).toEqual('m2:2');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('m2:');

      unmount();
    });
  });

  describe('IndexView', () => {
    let indexes: Indexes;

    beforeEach(() => {
      indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
    });

    test('Basic', () => {
      const {container, unmount} = render(IndexView, {
        props: {indexes, indexId: 'i1'},
      });
      expect(container.textContent).toEqual('1');
      unmount();
    });

    test('Separator', async () => {
      store.setCell('t1', 'r2', 'c1', 2);
      const {container, unmount} = render(IndexView, {
        props: {indexes, indexId: 'i1', separator: sep},
      });
      expect(container.textContent).toEqual('1/2');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(IndexView, {
        props: {indexes, indexId: 'i1', debugIds: true},
      });
      expect(container.textContent).toEqual('i1:{1:{r1:{c1:{1}}}}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestIndexView, {
        props: {indexes, indexId: 'i0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('i0:');

      await rerender({indexId: 'i1'});
      expect(container.textContent).toEqual('i1:1:r1:c1:1');

      await act(() => store.setCell('t1', 'r2', 'c1', 1));
      expect(container.textContent).toEqual('i1:1:r1:c1:1r2:c1:1');

      await rerender({indexId: 'i2'});
      expect(container.textContent).toEqual('i2:2:r1:c1:23:r2:c1:3c2:4');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('i2:');

      unmount();
    });
  });

  describe('SliceView', () => {
    let indexes: Indexes;

    beforeEach(() => {
      indexes = createIndexes(store)
        .setIndexDefinition('i1', 't1', 'c1')
        .setIndexDefinition('i2', 't2', 'c1');
    });

    test('Basic', () => {
      const {container, unmount} = render(SliceView, {
        props: {indexes, indexId: 'i1', sliceId: '1'},
      });
      expect(container.textContent).toEqual('1');
      unmount();
    });

    test('Separator', () => {
      store.setCell('t1', 'r2', 'c1', 1);
      const {container, unmount} = render(SliceView, {
        props: {indexes, indexId: 'i1', sliceId: '1', separator: sep},
      });
      expect(container.textContent).toEqual('1/1');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(SliceView, {
        props: {indexes, indexId: 'i1', sliceId: '1', debugIds: true},
      });
      expect(container.textContent).toEqual('1:{r1:{c1:{1}}}');
      unmount();
    });

    test('Falsy tableId skips row rendering', () => {
      store.setTable('', {r1: {c1: 1}});
      indexes.setIndexDefinition('i0', '' as any, 'c1');
      const {container, unmount} = render(SliceView, {
        props: {indexes, indexId: 'i0', sliceId: '1'},
      });
      expect(container.textContent).toEqual('');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestSliceView, {
        props: {indexes, indexId: 'i0', sliceId: '0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('0:');

      await rerender({indexId: 'i1', sliceId: '0'});
      expect(container.textContent).toEqual('0:');

      await rerender({indexId: 'i1', sliceId: '1'});
      expect(container.textContent).toEqual('1:r1:c1:1');

      await act(() => store.setCell('t1', 'r2', 'c1', 1));
      expect(container.textContent).toEqual('1:r1:c1:1r2:c1:1');

      await rerender({indexId: 'i2', sliceId: '2'});
      expect(container.textContent).toEqual('2:r1:c1:2');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('2:');

      unmount();
    });
  });

  describe('RemoteRowView', () => {
    let relationships: Relationships;

    beforeEach(() => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R0'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    });

    test('Basic', () => {
      const {container, unmount} = render(RemoteRowView, {
        props: {relationships, relationshipId: 'r1', localRowId: 'r1'},
      });
      expect(container.textContent).toEqual('1');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(RemoteRowView, {
        props: {
          relationships,
          relationshipId: 'r1',
          localRowId: 'r1',
          debugIds: true,
        },
      });
      expect(container.textContent).toEqual('r1:{R1:{C1:{1}}}');
      unmount();
    });

    test('Debug Ids with null localRowId', () => {
      const {container, unmount} = render(RemoteRowView, {
        props: {
          relationships,
          relationshipId: 'r1',
          localRowId: null as any,
          debugIds: true,
        },
      });
      expect(container.textContent).toEqual(':{}');
      unmount();
    });

    test('Missing remote table skips row rendering', () => {
      relationships.setRelationshipDefinition(
        'r3',
        't1',
        undefined as any,
        'c1',
      );
      const {container, unmount} = render(RemoteRowView, {
        props: {relationships, relationshipId: 'r3', localRowId: 'r1'},
      });
      expect(container.textContent).toEqual('');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestRemoteRowView, {
        props: {
          relationships,
          relationshipId: 'r0',
          localRowId: 'r0',
          cellPrefix: ':',
        },
      });
      expect(container.textContent).toEqual('r0:');

      await rerender({relationshipId: 'r1', localRowId: 'r1'});
      expect(container.textContent).toEqual('r1:R1:C1:1');

      await rerender({relationshipId: 'r1', localRowId: 'r2'});
      expect(container.textContent).toEqual('r2:R1:C1:1');

      await rerender({relationshipId: 'r1', localRowId: 'r1'});
      await act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('r1:');

      await rerender({relationshipId: 'r2', localRowId: 'r2'});
      expect(container.textContent).toEqual('r2:');

      unmount();
    });
  });

  describe('LocalRowsView', () => {
    let relationships: Relationships;

    beforeEach(() => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
        .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    });

    test('Basic', () => {
      const {container, unmount} = render(LocalRowsView, {
        props: {relationships, relationshipId: 'r1', remoteRowId: 'R1'},
      });
      expect(container.textContent).toEqual('R1R1');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(LocalRowsView, {
        props: {
          relationships,
          relationshipId: 'r1',
          remoteRowId: 'R1',
          separator: sep,
        },
      });
      expect(container.textContent).toEqual('R1/R1');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(LocalRowsView, {
        props: {
          relationships,
          relationshipId: 'r1',
          remoteRowId: 'R1',
          debugIds: true,
        },
      });
      expect(container.textContent).toEqual('R1:{r1:{c1:{R1}}r2:{c1:{R1}}}');
      unmount();
    });

    test('Falsy localTableId skips row rendering', () => {
      store.setTable('', {r1: {c1: 'R1'}, r2: {c1: 'R1'}});
      relationships.setRelationshipDefinition('r0', '' as any, 'T1', 'c1');
      const {container, unmount} = render(LocalRowsView, {
        props: {relationships, relationshipId: 'r0', remoteRowId: 'R1'},
      });
      expect(container.textContent).toEqual('');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestLocalRowsView, {
        props: {
          relationships,
          relationshipId: 'r0',
          remoteRowId: 'R0',
          cellPrefix: ':',
        },
      });
      expect(container.textContent).toEqual('R0:');

      await rerender({relationshipId: 'r1', remoteRowId: 'R1'});
      expect(container.textContent).toEqual('R1:r1:c1:R1r2:c1:R1');

      await rerender({relationshipId: 'r1', remoteRowId: 'R2'});
      expect(container.textContent).toEqual('R2:');

      await act(() => store.delTable('t1'));
      expect(container.textContent).toEqual('R2:');

      await rerender({relationshipId: 'r2', remoteRowId: 'R2'});
      expect(container.textContent).toEqual('R2:');

      unmount();
    });
  });

  describe('LinkedRowsView', () => {
    let relationships: Relationships;

    beforeEach(() => {
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      });
      relationships = createRelationships(store)
        .setRelationshipDefinition('r1', 't1', 't1', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'c2');
    });

    test('Basic', () => {
      const {container, unmount} = render(LinkedRowsView, {
        props: {relationships, relationshipId: 'r1', firstRowId: 'r1'},
      });
      expect(container.textContent).toEqual('r2r3r4');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(LinkedRowsView, {
        props: {
          relationships,
          relationshipId: 'r1',
          firstRowId: 'r1',
          separator: sep,
        },
      });
      expect(container.textContent).toEqual('r2/r3/r4/');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(LinkedRowsView, {
        props: {
          relationships,
          relationshipId: 'r1',
          firstRowId: 'r1',
          debugIds: true,
        },
      });
      expect(container.textContent).toEqual(
        'r1:{r1:{c1:{r2}}r2:{c1:{r3}}r3:{c1:{r4}}r4:{}}',
      );
      unmount();
    });

    test('Falsy localTableId skips row rendering', () => {
      store.setTable('', {
        r1: {c1: 'r2'},
        r2: {c1: 'r3'},
        r3: {c1: 'r4'},
      });
      relationships.setRelationshipDefinition('r0', '' as any, '' as any, 'c1');
      const {container, unmount} = render(LinkedRowsView, {
        props: {relationships, relationshipId: 'r0', firstRowId: 'r1'},
      });
      expect(container.textContent).toEqual('');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestLinkedRowsView, {
        props: {
          relationships,
          relationshipId: 'r0',
          firstRowId: 'r0',
          cellPrefix: ':',
        },
      });
      expect(container.textContent).toEqual('r0:r0:');

      await rerender({relationshipId: 'r1', firstRowId: 'r1'});
      expect(container.textContent).toEqual('r1:r1:c1:r2r2:c1:r3r3:c1:r4r4:');

      await act(() => store.setCell('t1', 'r2', 'c1', 'r4'));
      expect(container.textContent).toEqual('r1:r1:c1:r2r2:c1:r4r4:');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('r1:r1:');

      unmount();
    });
  });

  describe('ResultTableView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => select('c1'));
    });

    test('Basic', () => {
      const {container, unmount} = render(ResultTableView, {
        props: {queries, queryId: 'q1'},
      });
      expect(container.textContent).toEqual('1');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(ResultTableView, {
        props: {queries, queryId: 'q2', separator: sep},
      });
      expect(container.textContent).toEqual('2/3');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(ResultTableView, {
        props: {queries, queryId: 'q1', debugIds: true},
      });
      expect(container.textContent).toEqual('q1:{r1:{c1:{1}}}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestResultTableView, {
        props: {queries, queryId: 'q0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('q0:');

      await rerender({queryId: 'q1'});
      expect(container.textContent).toEqual('q1:r1:c1:1');

      await act(() => store.setCell('t1', 'r2', 'c1', 2));
      expect(container.textContent).toEqual('q1:r1:c1:1r2:c1:2');

      await rerender({queryId: 'q2'});
      expect(container.textContent).toEqual('q2:r1:c1:2r2:c1:3');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('q2:');

      unmount();
    });
  });

  describe('ResultSortedTableView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => select('c1'));
    });

    test('Basic', () => {
      const {container, unmount} = render(ResultSortedTableView, {
        props: {queries, queryId: 'q2', cellId: 'c1', descending: true},
      });
      expect(container.textContent).toEqual('32');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(ResultSortedTableView, {
        props: {
          queries,
          queryId: 'q2',
          cellId: 'c1',
          descending: true,
          separator: sep,
        },
      });
      expect(container.textContent).toEqual('3/2');
      unmount();
    });

    test('Debug Ids', async () => {
      const {container, rerender, unmount} = render(ResultSortedTableView, {
        props: {
          queries,
          queryId: 'q2',
          cellId: 'c1',
          descending: true,
          separator: sep,
        },
      });
      expect(container.textContent).toEqual('3/2');

      await rerender({
        queryId: 'q2',
        cellId: 'c1',
        descending: true,
        debugIds: true,
        separator: undefined,
      });
      expect(container.textContent).toEqual('q2:{r2:{c1:{3}}r1:{c1:{2}}}');

      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestResultSortedTableView, {
        props: {queries, queryId: 'q0', cellId: 'c0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('q0,c0:');

      await rerender({queryId: 'q2', cellId: 'c1'});
      expect(container.textContent).toEqual('q2,c1:r1:c1:2r2:c1:3');

      await act(() => store.setCell('t2', 'r1', 'c1', 4));
      expect(container.textContent).toEqual('q2,c1:r2:c1:3r1:c1:4');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('q2,c1:');

      unmount();
    });
  });

  describe('ResultRowView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store)
        .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
        .setQueryDefinition('q2', 't2', ({select}) => {
          select('c1');
          select('c2');
        });
    });

    test('Basic', () => {
      const {container, unmount} = render(ResultRowView, {
        props: {queries, queryId: 'q2', rowId: 'r2'},
      });
      expect(container.textContent).toEqual('34');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(ResultRowView, {
        props: {queries, queryId: 'q2', rowId: 'r2', separator: sep},
      });
      expect(container.textContent).toEqual('3/4');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(ResultRowView, {
        props: {queries, queryId: 'q2', rowId: 'r2', debugIds: true},
      });
      expect(container.textContent).toEqual('r2:{c1:{3}c2:{4}}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestResultRowView, {
        props: {queries, queryId: 'q0', rowId: 'r0', cellPrefix: ':'},
      });
      expect(container.textContent).toEqual('r0:');

      await rerender({queryId: 'q1', rowId: 'r1'});
      expect(container.textContent).toEqual('r1:c1:1');

      await act(() => store.setCell('t1', 'r1', 'c1', 2));
      expect(container.textContent).toEqual('r1:c1:2');

      await rerender({queryId: 'q2', rowId: 'r2'});
      expect(container.textContent).toEqual('r2:c1:3c2:4');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('r2:');

      unmount();
    });
  });

  describe('ResultCellView', () => {
    let queries: Queries;

    beforeEach(() => {
      queries = createQueries(store).setQueryDefinition(
        'q1',
        't2',
        ({select}) => {
          select('c1');
          select('c2');
        },
      );
    });

    test('Basic', () => {
      const {container, unmount} = render(ResultCellView, {
        props: {queries, queryId: 'q1', rowId: 'r2', cellId: 'c2'},
      });
      expect(container.textContent).toEqual('4');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(ResultCellView, {
        props: {
          queries,
          queryId: 'q1',
          rowId: 'r2',
          cellId: 'c2',
          debugIds: true,
        },
      });
      expect(container.textContent).toEqual('c2:{4}');
      unmount();
    });

    test('Custom', async () => {
      const {container, rerender, unmount} = render(TestResultCellView, {
        props: {
          queries,
          queryId: 'q0',
          rowId: 'r0',
          cellId: 'c0',
          cellPrefix: ':',
        },
      });
      expect(container.textContent).toEqual('c0:');

      await rerender({queryId: 'q1', rowId: 'r2', cellId: 'c2'});
      expect(container.textContent).toEqual('c2:4');

      await act(() => store.setCell('t2', 'r2', 'c2', 5));
      expect(container.textContent).toEqual('c2:5');

      await act(() => store.delTables());
      expect(container.textContent).toEqual('c2:');

      unmount();
    });
  });

  describe('CheckpointsViews', () => {
    let checkpoints: Checkpoints;

    beforeEach(() => {
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

    test('Basic', () => {
      const {container, unmount} = render(BackwardCheckpointsView, {
        props: {checkpoints},
      });
      expect(container.textContent).toEqual('c1');
      unmount();
    });

    test('Separator', () => {
      const {container, unmount} = render(BackwardCheckpointsView, {
        props: {checkpoints, separator: sep},
      });
      expect(container.textContent).toEqual('c1/');
      unmount();
    });

    test('Debug Ids', () => {
      const {container, unmount} = render(BackwardCheckpointsView, {
        props: {checkpoints, debugIds: true},
      });
      expect(container.textContent).toEqual('0:{c1}1:{}');
      unmount();
    });

    test('Custom', async () => {
      const {container, unmount} = render(TestAllCheckpointsView, {
        props: {checkpoints},
      });
      await act(() => checkpoints.clear());
      expect(container.textContent).toEqual('||||');

      await act(() => checkpoints.setCheckpoint('0', 'c1'));
      expect(container.textContent).toEqual('|c1|||');

      await act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(container.textContent).toEqual('c1||||');

      await act(() => checkpoints.addCheckpoint());
      expect(container.textContent).toEqual('c1||||');

      await act(() => store.setTables({t1: {r1: {c1: 3}}}));
      expect(container.textContent).toEqual('c1||||');

      await act(() => checkpoints.addCheckpoint('c2'));
      expect(container.textContent).toEqual('c1|c2|||');

      await act(() => checkpoints.goTo('0'));
      expect(container.textContent).toEqual('|c1|c2||');

      unmount();
    });

    test('Custom checkpoint snippet', async () => {
      const {container, unmount} = render(TestCurrentCheckpointViewSnippet, {
        props: {checkpoints},
      });
      expect(container.textContent).toContain('current:');

      await act(() => checkpoints.clear());
      expect(container.textContent).toContain('current:0');

      await act(() => store.setTables({t1: {r1: {c1: 2}}}));
      expect(container.textContent).toEqual('');

      unmount();
    });
  });
});

describe('Context Provider', () => {
  describe('default', () => {
    describe('store', () => {
      test('for tables', async () => {
        const {container, unmount} = render(ContextStore, {
          props: {store, mode: 'tables'},
        });
        expect(container.textContent).toEqual(
          '1234' +
            '{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
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
      const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
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
          '1234' +
            '{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2},"r2":{"c1":3,"c2":4}}}',
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
      const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
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
