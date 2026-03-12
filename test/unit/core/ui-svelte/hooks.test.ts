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
import {createMergeableStore} from 'tinybase/mergeable-store';
import type {AnyPersister} from 'tinybase/persisters';
import {createSessionPersister} from 'tinybase/persisters/persister-browser';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {beforeEach, describe, expect, test, vi} from 'vitest';

import ListenerHookCell from './components/ListenerHookCell.svelte';
import ListenerHookCellIds from './components/ListenerHookCellIds.svelte';
import ListenerHookCheckpoint from './components/ListenerHookCheckpoint.svelte';
import ListenerHookCheckpointIds from './components/ListenerHookCheckpointIds.svelte';
import ListenerHookDidFinishTransaction from './components/ListenerHookDidFinishTransaction.svelte';
import ListenerHookHasCell from './components/ListenerHookHasCell.svelte';
import ListenerHookHasRow from './components/ListenerHookHasRow.svelte';
import ListenerHookHasTable from './components/ListenerHookHasTable.svelte';
import ListenerHookHasTableCell from './components/ListenerHookHasTableCell.svelte';
import ListenerHookHasTables from './components/ListenerHookHasTables.svelte';
import ListenerHookHasValue from './components/ListenerHookHasValue.svelte';
import ListenerHookHasValues from './components/ListenerHookHasValues.svelte';
import ListenerHookLinkedRowIds from './components/ListenerHookLinkedRowIds.svelte';
import ListenerHookLocalRowIds from './components/ListenerHookLocalRowIds.svelte';
import ListenerHookMetric from './components/ListenerHookMetric.svelte';
import ListenerHookParamValue from './components/ListenerHookParamValue.svelte';
import ListenerHookParamValues from './components/ListenerHookParamValues.svelte';
import ListenerHookPersisterStatus from './components/ListenerHookPersisterStatus.svelte';
import ListenerHookRemoteRowId from './components/ListenerHookRemoteRowId.svelte';
import ListenerHookResultCell from './components/ListenerHookResultCell.svelte';
import ListenerHookResultCellIds from './components/ListenerHookResultCellIds.svelte';
import ListenerHookResultRow from './components/ListenerHookResultRow.svelte';
import ListenerHookResultRowCount from './components/ListenerHookResultRowCount.svelte';
import ListenerHookResultRowIds from './components/ListenerHookResultRowIds.svelte';
import ListenerHookResultSortedRowIds from './components/ListenerHookResultSortedRowIds.svelte';
import ListenerHookResultTable from './components/ListenerHookResultTable.svelte';
import ListenerHookResultTableCellIds from './components/ListenerHookResultTableCellIds.svelte';
import ListenerHookRow from './components/ListenerHookRow.svelte';
import ListenerHookRowCount from './components/ListenerHookRowCount.svelte';
import ListenerHookRowIds from './components/ListenerHookRowIds.svelte';
import ListenerHookSliceIds from './components/ListenerHookSliceIds.svelte';
import ListenerHookSliceRowIds from './components/ListenerHookSliceRowIds.svelte';
import ListenerHookSortedRowIds from './components/ListenerHookSortedRowIds.svelte';
import ListenerHookStartTransaction from './components/ListenerHookStartTransaction.svelte';
import ListenerHookSynchronizerStatus from './components/ListenerHookSynchronizerStatus.svelte';
import ListenerHookTable from './components/ListenerHookTable.svelte';
import ListenerHookTableCellIds from './components/ListenerHookTableCellIds.svelte';
import ListenerHookTableIds from './components/ListenerHookTableIds.svelte';
import ListenerHookTables from './components/ListenerHookTables.svelte';
import ListenerHookValue from './components/ListenerHookValue.svelte';
import ListenerHookValueIds from './components/ListenerHookValueIds.svelte';
import ListenerHookValues from './components/ListenerHookValues.svelte';
import ListenerHookWillFinishTransaction from './components/ListenerHookWillFinishTransaction.svelte';

import HookBindableCell from './components/HookBindableCell.svelte';
import HookBindableValue from './components/HookBindableValue.svelte';
import HookCell from './components/HookCell.svelte';
import HookCellIds from './components/HookCellIds.svelte';
import HookCheckpointIds from './components/HookCheckpointIds.svelte';
import HookCheckpointsIds from './components/HookCheckpointsIds.svelte';
import HookGoBackwardCallback from './components/HookGoBackwardCallback.svelte';
import HookGoForwardCallback from './components/HookGoForwardCallback.svelte';
import HookHasCell from './components/HookHasCell.svelte';
import HookHasRow from './components/HookHasRow.svelte';
import HookHasTable from './components/HookHasTable.svelte';
import HookHasTableCell from './components/HookHasTableCell.svelte';
import HookHasTables from './components/HookHasTables.svelte';
import HookHasValue from './components/HookHasValue.svelte';
import HookHasValues from './components/HookHasValues.svelte';
import HookIndexIds from './components/HookIndexIds.svelte';
import HookIndexesIds from './components/HookIndexesIds.svelte';
import HookLinkedRowIds from './components/HookLinkedRowIds.svelte';
import HookLocalRowIds from './components/HookLocalRowIds.svelte';
import HookMetric from './components/HookMetric.svelte';
import HookMetricIds from './components/HookMetricIds.svelte';
import HookMetricsIds from './components/HookMetricsIds.svelte';
import HookPersisterIds from './components/HookPersisterIds.svelte';
import HookPersisterStatus from './components/HookPersisterStatus.svelte';
import HookQueriesIds from './components/HookQueriesIds.svelte';
import HookQueryIds from './components/HookQueryIds.svelte';
import HookRelationshipIds from './components/HookRelationshipIds.svelte';
import HookRelationshipsIds from './components/HookRelationshipsIds.svelte';
import HookRemoteRowId from './components/HookRemoteRowId.svelte';
import HookResultCell from './components/HookResultCell.svelte';
import HookResultCellIds from './components/HookResultCellIds.svelte';
import HookResultRow from './components/HookResultRow.svelte';
import HookResultRowCount from './components/HookResultRowCount.svelte';
import HookResultRowIds from './components/HookResultRowIds.svelte';
import HookResultSortedRowIds from './components/HookResultSortedRowIds.svelte';
import HookResultSortedRowIdsNoDefaults from './components/HookResultSortedRowIdsNoDefaults.svelte';
import HookResultTable from './components/HookResultTable.svelte';
import HookResultTableCellIds from './components/HookResultTableCellIds.svelte';
import HookRow from './components/HookRow.svelte';
import HookRowCount from './components/HookRowCount.svelte';
import HookRowIds from './components/HookRowIds.svelte';
import HookSliceIds from './components/HookSliceIds.svelte';
import HookSliceRowIds from './components/HookSliceRowIds.svelte';
import HookSortedRowIds from './components/HookSortedRowIds.svelte';
import HookSortedRowIdsNoDefaults from './components/HookSortedRowIdsNoDefaults.svelte';
import HookSynchronizerIds from './components/HookSynchronizerIds.svelte';
import HookSynchronizerStatus from './components/HookSynchronizerStatus.svelte';
import HookTable from './components/HookTable.svelte';
import HookTableCellIds from './components/HookTableCellIds.svelte';
import HookTableIds from './components/HookTableIds.svelte';
import HookTables from './components/HookTables.svelte';
import HookValue from './components/HookValue.svelte';
import HookValueIds from './components/HookValueIds.svelte';
import HookValues from './components/HookValues.svelte';
import HookWindowlessCoverage from './components/HookWindowlessCoverage.svelte';

let store: Store;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
});

test('windowless hooks skip effects', () => {
  vi.stubGlobal('window', undefined);
  try {
    const {container, unmount} = render(HookWindowlessCoverage);
    expect(container.textContent).toEqual(
      JSON.stringify([['t1'], 1, 1, [], [], [], [], [], [], [], []]),
    );
    unmount();
  } finally {
    vi.unstubAllGlobals();
  }
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

  test('useSortedRowIds, no-default descending and offset', async () => {
    const {container, unmount} = render(HookSortedRowIdsNoDefaults, {
      props: {store, tableId: 't1', cellId: 'c1'},
    });
    expect(container.textContent).toEqual(JSON.stringify(['r1']));
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

  test('useMetricsIds', async () => {
    const {container, unmount} = render(HookMetricsIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('useIndexesIds', async () => {
    const {container, unmount} = render(HookIndexesIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('useQueriesIds', async () => {
    const {container, unmount} = render(HookQueriesIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('useRelationshipsIds', async () => {
    const {container, unmount} = render(HookRelationshipsIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('useCheckpointsIds', async () => {
    const {container, unmount} = render(HookCheckpointsIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('usePersisterIds', async () => {
    const {container, unmount} = render(HookPersisterIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('useSynchronizerIds', async () => {
    const {container, unmount} = render(HookSynchronizerIds);
    expect(container.textContent).toEqual('[]');
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

  test('useResultTableCellIds', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const {container, rerender, unmount} = render(HookResultTableCellIds, {
      props: {queries, queryId: 'q0'},
    });
    expect(container.textContent).toEqual(JSON.stringify([]));

    await rerender({queryId: 'q1'});
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2, c2: 3}}})
        .setTables({t1: {r1: {c1: 2, c2: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c1', 'c2']));

    unmount();
  });

  test('useResultRowCount', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const {container, rerender, unmount} = render(HookResultRowCount, {
      props: {queries, queryId: 'q0'},
    });
    expect(container.textContent).toEqual('0');

    await rerender({queryId: 'q1'});
    expect(container.textContent).toEqual('1');

    await act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
    );
    expect(container.textContent).toEqual('2');

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

  test('useResultSortedRowIds, no-default descending and offset', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const {container, unmount} = render(HookResultSortedRowIdsNoDefaults, {
      props: {queries, queryId: 'q1', cellId: 'c1'},
    });
    expect(container.textContent).toEqual(JSON.stringify(['r1']));
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

  test('usePersisterStatus', async () => {
    const persister: AnyPersister = createSessionPersister(store, 'test-key');
    const {container, unmount} = render(HookPersisterStatus, {
      props: {persister},
    });
    expect(container.textContent).toEqual('0');
    unmount();
    persister.destroy();
  });

  test('useSynchronizerStatus', async () => {
    const store2 = createMergeableStore();
    const synchronizer: Synchronizer = createLocalSynchronizer(store2);
    const {container, unmount} = render(HookSynchronizerStatus, {
      props: {synchronizer},
    });
    expect(container.textContent).toEqual('0');
    unmount();
    synchronizer.destroy();
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

describe('Listener Hooks', () => {
  test('useHasTablesListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasTables).toEqual(0);

    const {unmount} = render(ListenerHookHasTables, {props: {store, listener}});
    expect(store.getListenerStats().hasTables).toEqual(1);

    await act(() => store.delTables());
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasTables).toEqual(0);
  });

  test('useTablesListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().tables).toEqual(0);

    const {unmount} = render(ListenerHookTables, {props: {store, listener}});
    expect(store.getListenerStats().tables).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().tables).toEqual(0);
  });

  test('useTableIdsListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().tableIds).toEqual(0);

    const {unmount} = render(ListenerHookTableIds, {props: {store, listener}});
    expect(store.getListenerStats().tableIds).toEqual(1);

    await act(() => store.setCell('t2', 'r1', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().tableIds).toEqual(0);
  });

  test('useHasTableListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasTable).toEqual(0);

    const {unmount} = render(ListenerHookHasTable, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().hasTable).toEqual(1);

    await act(() => store.delTable('t1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasTable).toEqual(0);
  });

  test('useTableListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().table).toEqual(0);

    const {unmount} = render(ListenerHookTable, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().table).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().table).toEqual(0);
  });

  test('useTableCellIdsListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().tableCellIds).toEqual(0);

    const {unmount} = render(ListenerHookTableCellIds, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().tableCellIds).toEqual(0);
  });

  test('useHasTableCellListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasTableCell).toEqual(0);

    const {unmount} = render(ListenerHookHasTableCell, {
      props: {store, tableId: 't1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);

    await act(() => store.delCell('t1', 'r1', 'c1', true));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasTableCell).toEqual(0);
  });

  test('useRowCountListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().rowCount).toEqual(0);

    const {unmount} = render(ListenerHookRowCount, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().rowCount).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().rowCount).toEqual(0);
  });

  test('useRowIdsListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().rowIds).toEqual(0);

    const {unmount} = render(ListenerHookRowIds, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().rowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().rowIds).toEqual(0);
  });

  test('useSortedRowIdsListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().sortedRowIds).toEqual(0);

    const {unmount} = render(ListenerHookSortedRowIds, {
      props: {store, tableId: 't1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
  });

  test('useHasRowListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasRow).toEqual(0);

    const {unmount} = render(ListenerHookHasRow, {
      props: {store, tableId: 't1', rowId: 'r1', listener},
    });
    expect(store.getListenerStats().hasRow).toEqual(1);

    await act(() => store.delRow('t1', 'r1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasRow).toEqual(0);
  });

  test('useRowListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().row).toEqual(0);

    const {unmount} = render(ListenerHookRow, {
      props: {store, tableId: 't1', rowId: 'r1', listener},
    });
    expect(store.getListenerStats().row).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().row).toEqual(0);
  });

  test('useCellIdsListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().cellIds).toEqual(0);

    const {unmount} = render(ListenerHookCellIds, {
      props: {store, tableId: 't1', rowId: 'r1', listener},
    });
    expect(store.getListenerStats().cellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().cellIds).toEqual(0);
  });

  test('useHasCellListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasCell).toEqual(0);

    const {unmount} = render(ListenerHookHasCell, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().hasCell).toEqual(1);

    await act(() => store.delCell('t1', 'r1', 'c1', true));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasCell).toEqual(0);
  });

  test('useCellListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().cell).toEqual(0);

    const {unmount} = render(ListenerHookCell, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().cell).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().cell).toEqual(0);
  });

  test('useHasValuesListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasValues).toEqual(0);

    const {unmount} = render(ListenerHookHasValues, {props: {store, listener}});
    expect(store.getListenerStats().hasValues).toEqual(1);

    await act(() => store.delValues());
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasValues).toEqual(0);
  });

  test('useValuesListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().values).toEqual(0);

    const {unmount} = render(ListenerHookValues, {props: {store, listener}});
    expect(store.getListenerStats().values).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().values).toEqual(0);
  });

  test('useValueIdsListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().valueIds).toEqual(0);

    const {unmount} = render(ListenerHookValueIds, {props: {store, listener}});
    expect(store.getListenerStats().valueIds).toEqual(1);

    await act(() => store.setValue('v2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().valueIds).toEqual(0);
  });

  test('useHasValueListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasValue).toEqual(0);

    const {unmount} = render(ListenerHookHasValue, {
      props: {store, valueId: 'v1', listener},
    });
    expect(store.getListenerStats().hasValue).toEqual(1);

    await act(() => store.delValue('v1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasValue).toEqual(0);
  });

  test('useValueListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().value).toEqual(0);

    const {unmount} = render(ListenerHookValue, {
      props: {store, valueId: 'v1', listener},
    });
    expect(store.getListenerStats().value).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().value).toEqual(0);
  });

  test('useStartTransactionListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().transaction).toEqual(0);

    const {unmount} = render(ListenerHookStartTransaction, {
      props: {store, listener},
    });
    expect(store.getListenerStats().transaction).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('useWillFinishTransactionListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().transaction).toEqual(0);

    const {unmount} = render(ListenerHookWillFinishTransaction, {
      props: {store, listener},
    });
    expect(store.getListenerStats().transaction).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('useDidFinishTransactionListener', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().transaction).toEqual(0);

    const {unmount} = render(ListenerHookDidFinishTransaction, {
      props: {store, listener},
    });
    expect(store.getListenerStats().transaction).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('useMetricListener', async () => {
    const metrics: Metrics = createMetrics(store).setMetricDefinition(
      'm1',
      't1',
      'max',
      'c1',
    );
    const listener = vi.fn();
    expect(metrics.getListenerStats().metric).toEqual(0);

    const {unmount} = render(ListenerHookMetric, {
      props: {metrics, metricId: 'm1', listener},
    });
    expect(metrics.getListenerStats().metric).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(metrics.getListenerStats().metric).toEqual(0);
  });

  test('useSliceIdsListener', async () => {
    const indexes: Indexes = createIndexes(store).setIndexDefinition(
      'i1',
      't1',
      'c1',
    );
    const listener = vi.fn();
    expect(indexes.getListenerStats().sliceIds).toEqual(0);

    const {unmount} = render(ListenerHookSliceIds, {
      props: {indexes, indexId: 'i1', listener},
    });
    expect(indexes.getListenerStats().sliceIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'a'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(indexes.getListenerStats().sliceIds).toEqual(0);
  });

  test('useSliceRowIdsListener', async () => {
    const indexes: Indexes = createIndexes(store).setIndexDefinition(
      'i1',
      't1',
      'c1',
    );
    const listener = vi.fn();
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);

    const {unmount} = render(ListenerHookSliceRowIds, {
      props: {indexes, indexId: 'i1', sliceId: 'a', listener},
    });
    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'a'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
  });

  test('useRemoteRowIdListener', async () => {
    const relationships: Relationships = createRelationships(
      store,
    ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    const listener = vi.fn();
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);

    const {unmount} = render(ListenerHookRemoteRowId, {
      props: {relationships, relationshipId: 'r1', localRowId: 'r1', listener},
    });
    expect(relationships.getListenerStats().remoteRowId).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);
  });

  test('useLocalRowIdsListener', async () => {
    const relationships: Relationships = createRelationships(
      store,
    ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    const listener = vi.fn();
    expect(relationships.getListenerStats().localRowIds).toEqual(0);

    const {unmount} = render(ListenerHookLocalRowIds, {
      props: {
        relationships,
        relationshipId: 'r1',
        remoteRowId: 'R1',
        listener,
      },
    });
    expect(relationships.getListenerStats().localRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(relationships.getListenerStats().localRowIds).toEqual(0);
  });

  test('useLinkedRowIdsListener', async () => {
    const relationships: Relationships = createRelationships(
      store,
    ).setRelationshipDefinition('r1', 't1', 't1', 'c1');
    const listener = vi.fn();
    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);

    const {unmount} = render(ListenerHookLinkedRowIds, {
      props: {
        relationships,
        relationshipId: 'r1',
        firstRowId: 'r1',
        listener,
      },
    });
    expect(relationships.getListenerStats().linkedRowIds).toEqual(1);

    await act(() => store.setTables({t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}}}));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);
  });

  test('useResultTableListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().table).toEqual(0);

    const {unmount} = render(ListenerHookResultTable, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().table).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().table).toEqual(0);
  });

  test('useResultTableCellIdsListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().tableCellIds).toEqual(0);

    const {unmount} = render(ListenerHookResultTableCellIds, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().tableCellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().tableCellIds).toEqual(0);
  });

  test('useResultRowCountListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().rowCount).toEqual(0);

    const {unmount} = render(ListenerHookResultRowCount, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().rowCount).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().rowCount).toEqual(0);
  });

  test('useResultRowIdsListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().rowIds).toEqual(0);

    const {unmount} = render(ListenerHookResultRowIds, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().rowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().rowIds).toEqual(0);
  });

  test('useResultSortedRowIdsListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);

    const {unmount} = render(ListenerHookResultSortedRowIds, {
      props: {queries, queryId: 'q1', cellId: 'c1', listener},
    });
    expect(queries.getListenerStats().sortedRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);
  });

  test('useResultRowListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().row).toEqual(0);

    const {unmount} = render(ListenerHookResultRow, {
      props: {queries, queryId: 'q1', rowId: 'r1', listener},
    });
    expect(queries.getListenerStats().row).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().row).toEqual(0);
  });

  test('useResultCellIdsListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().cellIds).toEqual(0);

    const {unmount} = render(ListenerHookResultCellIds, {
      props: {queries, queryId: 'q1', rowId: 'r1', listener},
    });
    expect(queries.getListenerStats().cellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().cellIds).toEqual(0);
  });

  test('useResultCellListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().cell).toEqual(0);

    const {unmount} = render(ListenerHookResultCell, {
      props: {queries, queryId: 'q1', rowId: 'r1', cellId: 'c1', listener},
    });
    expect(queries.getListenerStats().cell).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().cell).toEqual(0);
  });

  test('useParamValuesListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as number);
      },
      {p1: 1},
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().paramValues).toEqual(0);

    const {unmount} = render(ListenerHookParamValues, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().paramValues).toEqual(1);

    await act(() => queries.setParamValue('q1', 'p1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().paramValues).toEqual(0);
  });

  test('useParamValueListener', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as number);
      },
      {p1: 1},
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().paramValue).toEqual(0);

    const {unmount} = render(ListenerHookParamValue, {
      props: {queries, queryId: 'q1', paramId: 'p1', listener},
    });
    expect(queries.getListenerStats().paramValue).toEqual(1);

    await act(() => queries.setParamValue('q1', 'p1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().paramValue).toEqual(0);
  });

  test('useCheckpointIdsListener', async () => {
    const checkpoints: Checkpoints = createCheckpoints(store);
    const listener = vi.fn();
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);

    const {unmount} = render(ListenerHookCheckpointIds, {
      props: {checkpoints, listener},
    });
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
  });

  test('useCheckpointListener', async () => {
    const checkpoints: Checkpoints = createCheckpoints(store);
    const listener = vi.fn();
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);

    const {unmount} = render(ListenerHookCheckpoint, {
      props: {checkpoints, checkpointId: '0', listener},
    });
    expect(checkpoints.getListenerStats().checkpoint).toEqual(1);

    await act(() => checkpoints.setCheckpoint('0', 'c1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
  });

  test('usePersisterStatusListener', async () => {
    const persister: AnyPersister = createSessionPersister(store, 'test-key');
    const listener = vi.fn();

    const {unmount} = render(ListenerHookPersisterStatus, {
      props: {persister, listener},
    });

    await act(() => persister.save());
    expect(listener).toHaveBeenCalled();

    unmount();
    persister.destroy();
  });

  test('useSynchronizerStatusListener', async () => {
    const store2 = createMergeableStore();
    const synchronizer: Synchronizer = createLocalSynchronizer(store2);
    const listener = vi.fn();

    const {unmount} = render(ListenerHookSynchronizerStatus, {
      props: {synchronizer, listener},
    });

    await act(() => synchronizer.save());
    expect(listener).toHaveBeenCalled();

    unmount();
    synchronizer.destroy();
  });
});
