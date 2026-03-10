import {act, fireEvent, render} from '@testing-library/svelte';
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

import HookBindableCell from './helpers/HookBindableCell.svelte';
import HookBindableValue from './helpers/HookBindableValue.svelte';
import HookCell from './helpers/HookCell.svelte';
import HookCellIds from './helpers/HookCellIds.svelte';
import HookCheckpointIds from './helpers/HookCheckpointIds.svelte';
import HookGoBackwardCallback from './helpers/HookGoBackwardCallback.svelte';
import HookGoForwardCallback from './helpers/HookGoForwardCallback.svelte';
import HookHasCell from './helpers/HookHasCell.svelte';
import HookHasRow from './helpers/HookHasRow.svelte';
import HookHasTable from './helpers/HookHasTable.svelte';
import HookHasTableCell from './helpers/HookHasTableCell.svelte';
import HookHasTables from './helpers/HookHasTables.svelte';
import HookHasValue from './helpers/HookHasValue.svelte';
import HookHasValues from './helpers/HookHasValues.svelte';
import HookIndexIds from './helpers/HookIndexIds.svelte';
import HookLinkedRowIds from './helpers/HookLinkedRowIds.svelte';
import HookLocalRowIds from './helpers/HookLocalRowIds.svelte';
import HookMetric from './helpers/HookMetric.svelte';
import HookMetricIds from './helpers/HookMetricIds.svelte';
import HookQueryIds from './helpers/HookQueryIds.svelte';
import HookRelationshipIds from './helpers/HookRelationshipIds.svelte';
import HookRemoteRowId from './helpers/HookRemoteRowId.svelte';
import HookResultCell from './helpers/HookResultCell.svelte';
import HookResultCellIds from './helpers/HookResultCellIds.svelte';
import HookResultRow from './helpers/HookResultRow.svelte';
import HookResultRowIds from './helpers/HookResultRowIds.svelte';
import HookResultSortedRowIds from './helpers/HookResultSortedRowIds.svelte';
import HookResultTable from './helpers/HookResultTable.svelte';
import HookRow from './helpers/HookRow.svelte';
import HookRowCount from './helpers/HookRowCount.svelte';
import HookRowIds from './helpers/HookRowIds.svelte';
import HookSliceIds from './helpers/HookSliceIds.svelte';
import HookSliceRowIds from './helpers/HookSliceRowIds.svelte';
import HookSortedRowIds from './helpers/HookSortedRowIds.svelte';
import HookTable from './helpers/HookTable.svelte';
import HookTableCellIds from './helpers/HookTableCellIds.svelte';
import HookTableIds from './helpers/HookTableIds.svelte';
import HookTables from './helpers/HookTables.svelte';
import HookValue from './helpers/HookValue.svelte';
import HookValueIds from './helpers/HookValueIds.svelte';
import HookValues from './helpers/HookValues.svelte';

let store: Store;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
});

describe('Read Hooks', () => {
  test('useHasTables', async () => {
    const {container, unmount} = render(HookHasTables, {props: {store}});
    expect(container.textContent).toEqual('true');

    await act(() => store.delTables());
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useTables', async () => {
    const {container, unmount} = render(HookTables, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));

    await act(() =>
      store.setTables({t1: {r1: {c1: 2}}}).setTables({t1: {r1: {c1: 2}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 2}}}));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('useTableIds', async () => {
    const {container, unmount} = render(HookTableIds, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify(['t1']));

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['t1', 't2']));

    await act(() => store.delTables());
    expect(container.textContent).toEqual('[]');

    unmount();
  });

  test('useHasTable', async () => {
    const {container, rerender, unmount} = render(HookHasTable, {
      props: {store, tableId: 't0'},
    });
    expect(container.textContent).toEqual('false');

    await rerender({tableId: 't1'});
    expect(container.textContent).toEqual('true');

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
    );
    expect(container.textContent).toEqual('true');

    await rerender({tableId: 't2'});
    expect(container.textContent).toEqual('true');

    await act(() => store.delTables());
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useTable', async () => {
    const {container, rerender, unmount} = render(HookTable, {
      props: {store, tableId: 't0'},
    });
    expect(container.textContent).toEqual(JSON.stringify({}));

    await rerender({tableId: 't1'});
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 2}}));

    await rerender({tableId: 't2'});
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 3}}));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('useTableCellIds', async () => {
    const {container, rerender, unmount} = render(HookTableCellIds, {
      props: {store, tableId: 't0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({tableId: 't1'});
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    await act(() =>
      store
        .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}})
        .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c2']));

    await rerender({tableId: 't2'});
    expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useHasTableCell', async () => {
    const {container, rerender, unmount} = render(HookHasTableCell, {
      props: {store, tableId: 't0', cellId: 'c0'},
    });
    expect(container.textContent).toEqual('false');

    await rerender({tableId: 't1', cellId: 'c1'});
    expect(container.textContent).toEqual('true');

    await act(() =>
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}}),
    );
    expect(container.textContent).toEqual('true');

    await rerender({tableId: 't1', cellId: 'c2'});
    expect(container.textContent).toEqual('true');

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useRowCount', async () => {
    const {container, rerender, unmount} = render(HookRowCount, {
      props: {store, tableId: 't0'},
    });
    expect(container.textContent).toEqual('0');

    await rerender({tableId: 't1'});
    expect(container.textContent).toEqual('1');

    await act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual('1');

    await rerender({tableId: 't2'});
    expect(container.textContent).toEqual('2');

    await act(() => store.delTables());
    expect(container.textContent).toEqual('0');

    unmount();
  });

  test('useRowIds', async () => {
    const {container, rerender, unmount} = render(HookRowIds, {
      props: {store, tableId: 't0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({tableId: 't1'});
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    await act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    await rerender({tableId: 't2'});
    expect(container.textContent).toEqual(JSON.stringify(['r3', 'r4']));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useSortedRowIds', async () => {
    const {container, rerender, unmount} = render(HookSortedRowIds, {
      props: {
        store,
        tableId: 't0',
        cellId: 'c0',
        descending: false,
        offset: 0,
        limit: undefined,
      },
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({tableId: 't1', cellId: 'c1', descending: false});
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    await act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    await rerender({
      tableId: 't2',
      cellId: 'c1',
      descending: true,
      offset: 0,
      limit: 2,
    });
    expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

    await act(() => store.setRow('t2', 'r5', {c1: 5}));
    expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useHasRow', async () => {
    const {container, rerender, unmount} = render(HookHasRow, {
      props: {store, tableId: 't0', rowId: 'r0'},
    });
    expect(container.textContent).toEqual('false');

    await rerender({tableId: 't1', rowId: 'r1'});
    expect(container.textContent).toEqual('true');

    await act(() =>
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
    );
    expect(container.textContent).toEqual('true');

    await rerender({tableId: 't1', rowId: 'r2'});
    expect(container.textContent).toEqual('true');

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useRow', async () => {
    const {container, rerender, unmount} = render(HookRow, {
      props: {store, tableId: 't0', rowId: 'r0'},
    });
    expect(container.textContent).toEqual(JSON.stringify({}));

    await rerender({tableId: 't1', rowId: 'r1'});
    expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

    await act(() =>
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

    await rerender({tableId: 't1', rowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('useCellIds', async () => {
    const {container, rerender, unmount} = render(HookCellIds, {
      props: {store, tableId: 't0', rowId: 'r0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({tableId: 't1', rowId: 'r1'});
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    await act(() =>
      store
        .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}})
        .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c2']));

    await rerender({tableId: 't1', rowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useHasCell', async () => {
    const {container, rerender, unmount} = render(HookHasCell, {
      props: {store, tableId: 't0', rowId: 'r0', cellId: 'c0'},
    });
    expect(container.textContent).toEqual('false');

    await rerender({tableId: 't1', rowId: 'r1', cellId: 'c1'});
    expect(container.textContent).toEqual('true');

    await act(() =>
      store
        .setTable('t1', {r1: {c1: 2, c2: 2}})
        .setTable('t1', {r1: {c1: 2, c2: 2}}),
    );
    expect(container.textContent).toEqual('true');

    await rerender({tableId: 't1', rowId: 'r1', cellId: 'c2'});
    expect(container.textContent).toEqual('true');

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useCell', async () => {
    const {container, rerender, unmount} = render(HookCell, {
      props: {store, tableId: 't0', rowId: 'r0', cellId: 'c0'},
    });
    expect(container.textContent).toEqual('');

    await rerender({tableId: 't1', rowId: 'r1', cellId: 'c1'});
    expect(container.textContent).toEqual('1');

    await act(() =>
      store
        .setTable('t1', {r1: {c1: 2, c2: 2}})
        .setTable('t1', {r1: {c1: 2, c2: 2}}),
    );
    expect(container.textContent).toEqual('2');

    await rerender({tableId: 't1', rowId: 'r1', cellId: 'c2'});
    expect(container.textContent).toEqual('2');

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useBindableCell', async () => {
    store.setCell('t1', 'r1', 'c1', 0);
    const {container, unmount} = render(HookBindableCell, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', newValue: 1},
    });
    expect(container.textContent).toContain('0');

    await act(() =>
      fireEvent.click(container.querySelector('button') as Element),
    );
    expect(container.textContent).toContain('1');
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(1);

    unmount();
  });

  test('useHasValues', async () => {
    const {container, unmount} = render(HookHasValues, {props: {store}});
    expect(container.textContent).toEqual('true');

    await act(() => store.delValues());
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useValues', async () => {
    const {container, unmount} = render(HookValues, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify({v1: 1}));

    await act(() => store.setValues({v1: 2}).setValues({v1: 2}));
    expect(container.textContent).toEqual(JSON.stringify({v1: 2}));

    await act(() => store.delValues());
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('useValueIds', async () => {
    const {container, unmount} = render(HookValueIds, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify(['v1']));

    await act(() => store.setValues({v1: 1, v2: 2}).setValues({v1: 1, v2: 2}));
    expect(container.textContent).toEqual(JSON.stringify(['v1', 'v2']));

    await act(() => store.delValues());
    expect(container.textContent).toEqual('[]');

    unmount();
  });

  test('useHasValue', async () => {
    const {container, rerender, unmount} = render(HookHasValue, {
      props: {store, valueId: 'v0'},
    });
    expect(container.textContent).toEqual('false');

    await rerender({valueId: 'v1'});
    expect(container.textContent).toEqual('true');

    store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3});
    expect(container.textContent).toEqual('true');

    await rerender({valueId: 'v2'});
    expect(container.textContent).toEqual('true');

    await act(() => store.delValues());
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('useValue', async () => {
    const {container, rerender, unmount} = render(HookValue, {
      props: {store, valueId: 'v0'},
    });
    expect(container.textContent).toEqual('');

    await rerender({valueId: 'v1'});
    expect(container.textContent).toEqual('1');

    await act(() => store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3}));
    expect(container.textContent).toEqual('2');

    await rerender({valueId: 'v2'});
    expect(container.textContent).toEqual('3');

    await act(() => store.delValues());
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useBindableValue', async () => {
    store.setValues({v1: false});
    const {container, unmount} = render(HookBindableValue, {
      props: {store, valueId: 'v1', newValue: true},
    });
    expect(container.textContent).toContain('false');

    await act(() =>
      fireEvent.click(container.querySelector('button') as Element),
    );
    expect(container.textContent).toContain('true');
    expect(store.getValue('v1')).toEqual(true);

    unmount();
  });

  test('useMetricIds', async () => {
    const metrics: Metrics = createMetrics(store);
    const {container, unmount} = render(HookMetricIds, {props: {metrics}});
    expect(container.textContent).toEqual('[]');

    await act(() =>
      metrics.setMetricDefinition('m1', 't1').setMetricDefinition('m2', 't2'),
    );
    expect(container.textContent).toEqual('["m1","m2"]');

    await act(() => metrics.delMetricDefinition('m1'));
    expect(container.textContent).toEqual('["m2"]');

    unmount();
  });

  test('useMetric', async () => {
    const metrics: Metrics = createMetrics(store)
      .setMetricDefinition('m1', 't1')
      .setMetricDefinition('m2', 't1', 'max', 'c1')
      .setMetricDefinition('m3', 't3');
    const {container, rerender, unmount} = render(HookMetric, {
      props: {metrics, metricId: 'm0'},
    });
    expect(container.textContent).toEqual('');

    await rerender({metricId: 'm1'});
    expect(container.textContent).toEqual('1');

    await act(() =>
      store.setCell('t1', 'r2', 'c1', 3).setCell('t1', 'r2', 'c1', 3),
    );
    expect(container.textContent).toEqual('2');

    await rerender({metricId: 'm2'});
    expect(container.textContent).toEqual('3');

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');

    await rerender({metricId: 'm3'});
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useIndexIds', async () => {
    const indexes: Indexes = createIndexes(store);
    const {container, unmount} = render(HookIndexIds, {props: {indexes}});
    expect(container.textContent).toEqual('[]');

    await act(() =>
      indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't2'),
    );
    expect(container.textContent).toEqual('["i1","i2"]');

    await act(() => indexes.delIndexDefinition('i1'));
    expect(container.textContent).toEqual('["i2"]');

    unmount();
  });

  test('useSliceIds', async () => {
    const indexes: Indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't1', 'c2')
      .setIndexDefinition('i3', 't3', 'c3');
    const {container, rerender, unmount} = render(HookSliceIds, {
      props: {indexes, indexId: 'i0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({indexId: 'i1'});
    expect(container.textContent).toEqual(JSON.stringify(['1']));

    await act(() =>
      store
        .setCell('t1', 'r2', 'c1', 2)
        .setCell('t1', 'r2', 'c1', 2)
        .setCell('t1', 'r2', 'c2', 3),
    );
    expect(container.textContent).toEqual(JSON.stringify(['1', '2']));

    await rerender({indexId: 'i2'});
    expect(container.textContent).toEqual(JSON.stringify(['', '3']));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({indexId: 'i3'});
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useSliceRowIds', async () => {
    const indexes: Indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't2', 'c2');
    const {container, rerender, unmount} = render(HookSliceRowIds, {
      props: {indexes, indexId: 'i0', sliceId: '0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({indexId: 'i1', sliceId: '1'});
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    await act(() =>
      store
        .setCell('t1', 'r2', 'c1', 1)
        .setCell('t1', 'r2', 'c1', 1)
        .setCell('t1', 'r3', 'c1', 2),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));

    await rerender({indexId: 'i1', sliceId: '2'});
    expect(container.textContent).toEqual(JSON.stringify(['r3']));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({indexId: 'i2', sliceId: '2'});
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useRelationshipIds', async () => {
    const relationships: Relationships = createRelationships(store);
    const {container, unmount} = render(HookRelationshipIds, {
      props: {relationships},
    });
    expect(container.textContent).toEqual('[]');

    await act(() =>
      relationships
        .setRelationshipDefinition('r1', 't1', 't2', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'c1'),
    );
    expect(container.textContent).toEqual('["r1","r2"]');

    await act(() => relationships.delRelationshipDefinition('r1'));
    expect(container.textContent).toEqual('["r2"]');

    unmount();
  });

  test('useRemoteRowId', async () => {
    const relationships: Relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    const {container, rerender, unmount} = render(HookRemoteRowId, {
      props: {relationships, relationshipId: 'r0', localRowId: 'r0'},
    });
    expect(container.textContent).toEqual('');

    await rerender({relationshipId: 'r1', localRowId: 'r1'});
    expect(container.textContent).toEqual(JSON.stringify('1'));

    await act(() =>
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      }),
    );
    expect(container.textContent).toEqual(JSON.stringify('R1'));

    await rerender({relationshipId: 'r1', localRowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify('R2'));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');

    await rerender({relationshipId: 'r2', localRowId: 'r2'});
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useLocalRowIds', async () => {
    const relationships: Relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    const {container, rerender, unmount} = render(HookLocalRowIds, {
      props: {relationships, relationshipId: 'r0', remoteRowId: 'R0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({relationshipId: 'r1', remoteRowId: 'R1'});
    expect(container.textContent).toEqual(JSON.stringify([]));

    await act(() =>
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      }),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));

    await rerender({relationshipId: 'r1', remoteRowId: 'R2'});
    expect(container.textContent).toEqual(JSON.stringify(['r3']));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({relationshipId: 'r2', remoteRowId: 'R2'});
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useLinkedRowIds', async () => {
    const relationships: Relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 't1', 'c1')
      .setRelationshipDefinition('r2', 't2', 't2', 'c2');
    const {container, rerender, unmount} = render(HookLinkedRowIds, {
      props: {relationships, relationshipId: 'r0', firstRowId: 'r0'},
    });
    expect(container.textContent).toEqual(JSON.stringify(['r0']));

    await rerender({relationshipId: 'r1', firstRowId: 'r1'});
    expect(container.textContent).toEqual(JSON.stringify(['r1', '1']));

    await act(() =>
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      }),
    );
    expect(container.textContent).toEqual(
      JSON.stringify(['r1', 'r2', 'r3', 'r4']),
    );

    await rerender({relationshipId: 'r1', firstRowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify(['r2', 'r3', 'r4']));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    await rerender({relationshipId: 'r2', firstRowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    unmount();
  });

  test('useQueryIds', async () => {
    const queries: Queries = createQueries(store);
    const {container, unmount} = render(HookQueryIds, {props: {queries}});
    expect(container.textContent).toEqual('[]');

    await act(() =>
      queries
        .setQueryDefinition('q1', 't1', () => undefined)
        .setQueryDefinition('q2', 't2', () => undefined),
    );
    expect(container.textContent).toEqual('["q1","q2"]');

    await act(() => queries.delQueryDefinition('q1'));
    expect(container.textContent).toEqual('["q2"]');

    unmount();
  });

  test('useResultTable', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(HookResultTable, {
      props: {queries, queryId: 'q0'},
    });
    expect(container.textContent).toEqual(JSON.stringify({}));

    await rerender({queryId: 'q1'});
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(
      JSON.stringify({r1: {c1: 2}, r2: {c1: 3}}),
    );

    await rerender({queryId: 'q2'});
    expect(container.textContent).toEqual(JSON.stringify({r2: {c1: 3}}));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('useResultRowIds', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(HookResultRowIds, {
      props: {queries, queryId: 'q0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({queryId: 'q1'});
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    await act(() =>
      store
        .setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        })
        .setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        }),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2', 'r3']));

    await rerender({queryId: 'q2'});
    expect(container.textContent).toEqual(JSON.stringify(['r2', 'r3']));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useResultSortedRowIds', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(HookResultSortedRowIds, {
      props: {
        queries,
        queryId: 'q0',
        cellId: 'c0',
        descending: false,
        offset: 0,
        limit: undefined,
      },
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({queryId: 'q1', cellId: 'c1', descending: false});
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    await act(() =>
      store
        .setTables({
          t1: {
            r1: {c1: 2},
            r2: {c1: 1},
            r3: {c1: 3, c2: 1},
            r4: {c1: 3, c2: 2},
          },
        })
        .setTables({
          t1: {
            r1: {c1: 2},
            r2: {c1: 1},
            r3: {c1: 3, c2: 1},
            r4: {c1: 3, c2: 2},
          },
        }),
    );
    expect(container.textContent).toEqual(
      JSON.stringify(['r2', 'r1', 'r3', 'r4']),
    );

    await rerender({
      queryId: 'q2',
      cellId: 'c2',
      descending: true,
      offset: 0,
      limit: 2,
    });
    expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

    await act(() => store.setRow('t1', 'r5', {c1: 3, c2: 3}));
    expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useResultRow', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(HookResultRow, {
      props: {queries, queryId: 'q0', rowId: 'r0'},
    });
    expect(container.textContent).toEqual(JSON.stringify({}));

    await rerender({queryId: 'q1', rowId: 'r1'});
    expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

    await rerender({queryId: 'q2', rowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('useResultCellIds', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        select('c3');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(HookResultCellIds, {
      props: {queries, queryId: 'q0', rowId: 'r0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({queryId: 'q1', rowId: 'r1'});
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    await rerender({queryId: 'q2', rowId: 'r2'});
    expect(container.textContent).toEqual(JSON.stringify(['c1', 'c2']));

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    unmount();
  });

  test('useResultCell', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(HookResultCell, {
      props: {queries, queryId: 'q0', rowId: 'r0', cellId: 'c0'},
    });
    expect(container.textContent).toEqual('');

    await rerender({queryId: 'q1', rowId: 'r1', cellId: 'c1'});
    expect(container.textContent).toEqual('1');

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}}),
    );
    expect(container.textContent).toEqual('2');

    await rerender({queryId: 'q2', rowId: 'r2', cellId: 'c2'});
    expect(container.textContent).toEqual('4');

    await act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useCheckpointIds', async () => {
    const checkpoints: Checkpoints = createCheckpoints(store);
    const {container, unmount} = render(HookCheckpointIds, {
      props: {checkpoints},
    });
    expect(container.textContent).toEqual(JSON.stringify([[], '0', []]));

    await act(() => store.setTables({t1: {r1: {c1: 2}}}));
    expect(container.textContent).toEqual(
      JSON.stringify([['0'], undefined, []]),
    );

    await act(() => checkpoints.addCheckpoint());
    expect(container.textContent).toEqual(JSON.stringify([['0'], '1', []]));

    unmount();
  });
});

describe('Checkpoint Callbacks', () => {
  let checkpoints: Checkpoints;

  beforeEach(() => {
    store = createStore().setTables({t1: {r1: {c1: 1}}});
    checkpoints = createCheckpoints(store);
    store.setTables({t1: {r1: {c1: 2}}});
    checkpoints.addCheckpoint();
    store.setTables({t1: {r1: {c1: 3}}});
    checkpoints.addCheckpoint();
  });

  test('useGoBackwardCallback', async () => {
    const {getByRole, unmount} = render(HookGoBackwardCallback, {
      props: {checkpoints},
    });

    await act(() => fireEvent.click(getByRole('button')));
    expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

    await act(() => fireEvent.click(getByRole('button')));
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1', '2']]);

    unmount();
  });

  test('useGoForwardCallback', async () => {
    const {getByRole, unmount} = render(HookGoForwardCallback, {
      props: {checkpoints},
    });

    checkpoints.goTo('0');

    await act(() => fireEvent.click(getByRole('button')));
    expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

    await act(() => fireEvent.click(getByRole('button')));
    expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

    unmount();
  });
});
