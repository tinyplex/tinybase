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

import ListenerFunctionCell from './components/ListenerFunctionCell.svelte';
import ListenerFunctionCellIds from './components/ListenerFunctionCellIds.svelte';
import ListenerFunctionCheckpoint from './components/ListenerFunctionCheckpoint.svelte';
import ListenerFunctionCheckpointIds from './components/ListenerFunctionCheckpointIds.svelte';
import ListenerFunctionDidFinishTransaction from './components/ListenerFunctionDidFinishTransaction.svelte';
import ListenerFunctionHasCell from './components/ListenerFunctionHasCell.svelte';
import ListenerFunctionHasRow from './components/ListenerFunctionHasRow.svelte';
import ListenerFunctionHasTable from './components/ListenerFunctionHasTable.svelte';
import ListenerFunctionHasTableCell from './components/ListenerFunctionHasTableCell.svelte';
import ListenerFunctionHasTables from './components/ListenerFunctionHasTables.svelte';
import ListenerFunctionHasValue from './components/ListenerFunctionHasValue.svelte';
import ListenerFunctionHasValues from './components/ListenerFunctionHasValues.svelte';
import ListenerFunctionLinkedRowIds from './components/ListenerFunctionLinkedRowIds.svelte';
import ListenerFunctionLocalRowIds from './components/ListenerFunctionLocalRowIds.svelte';
import ListenerFunctionMetric from './components/ListenerFunctionMetric.svelte';
import ListenerFunctionParamValue from './components/ListenerFunctionParamValue.svelte';
import ListenerFunctionParamValues from './components/ListenerFunctionParamValues.svelte';
import ListenerFunctionPersisterStatus from './components/ListenerFunctionPersisterStatus.svelte';
import ListenerFunctionRemoteRowId from './components/ListenerFunctionRemoteRowId.svelte';
import ListenerFunctionResultCell from './components/ListenerFunctionResultCell.svelte';
import ListenerFunctionResultCellIds from './components/ListenerFunctionResultCellIds.svelte';
import ListenerFunctionResultRow from './components/ListenerFunctionResultRow.svelte';
import ListenerFunctionResultRowCount from './components/ListenerFunctionResultRowCount.svelte';
import ListenerFunctionResultRowIds from './components/ListenerFunctionResultRowIds.svelte';
import ListenerFunctionResultSortedRowIds from './components/ListenerFunctionResultSortedRowIds.svelte';
import ListenerFunctionResultTable from './components/ListenerFunctionResultTable.svelte';
import ListenerFunctionResultTableCellIds from './components/ListenerFunctionResultTableCellIds.svelte';
import ListenerFunctionRow from './components/ListenerFunctionRow.svelte';
import ListenerFunctionRowCount from './components/ListenerFunctionRowCount.svelte';
import ListenerFunctionRowIds from './components/ListenerFunctionRowIds.svelte';
import ListenerFunctionSliceIds from './components/ListenerFunctionSliceIds.svelte';
import ListenerFunctionSliceRowIds from './components/ListenerFunctionSliceRowIds.svelte';
import ListenerFunctionSortedRowIds from './components/ListenerFunctionSortedRowIds.svelte';
import ListenerFunctionStartTransaction from './components/ListenerFunctionStartTransaction.svelte';
import ListenerFunctionSynchronizerStatus from './components/ListenerFunctionSynchronizerStatus.svelte';
import ListenerFunctionTable from './components/ListenerFunctionTable.svelte';
import ListenerFunctionTableCellIds from './components/ListenerFunctionTableCellIds.svelte';
import ListenerFunctionTableIds from './components/ListenerFunctionTableIds.svelte';
import ListenerFunctionTables from './components/ListenerFunctionTables.svelte';
import ListenerFunctionValue from './components/ListenerFunctionValue.svelte';
import ListenerFunctionValueIds from './components/ListenerFunctionValueIds.svelte';
import ListenerFunctionValues from './components/ListenerFunctionValues.svelte';
import ListenerFunctionWillFinishTransaction from './components/ListenerFunctionWillFinishTransaction.svelte';

import FunctionCell from './components/FunctionCell.svelte';
import FunctionCellIds from './components/FunctionCellIds.svelte';
import FunctionCheckpointIds from './components/FunctionCheckpointIds.svelte';
import FunctionCheckpointsIds from './components/FunctionCheckpointsIds.svelte';
import FunctionGoBackwardCallback from './components/FunctionGoBackwardCallback.svelte';
import FunctionGoForwardCallback from './components/FunctionGoForwardCallback.svelte';
import FunctionHasCell from './components/FunctionHasCell.svelte';
import FunctionHasRow from './components/FunctionHasRow.svelte';
import FunctionHasTable from './components/FunctionHasTable.svelte';
import FunctionHasTableCell from './components/FunctionHasTableCell.svelte';
import FunctionHasTables from './components/FunctionHasTables.svelte';
import FunctionHasValue from './components/FunctionHasValue.svelte';
import FunctionHasValues from './components/FunctionHasValues.svelte';
import FunctionIndexIds from './components/FunctionIndexIds.svelte';
import FunctionIndexesIds from './components/FunctionIndexesIds.svelte';
import FunctionLinkedRowIds from './components/FunctionLinkedRowIds.svelte';
import FunctionLocalRowIds from './components/FunctionLocalRowIds.svelte';
import FunctionMetric from './components/FunctionMetric.svelte';
import FunctionMetricIds from './components/FunctionMetricIds.svelte';
import FunctionMetricsIds from './components/FunctionMetricsIds.svelte';
import FunctionPersisterIds from './components/FunctionPersisterIds.svelte';
import FunctionPersisterStatus from './components/FunctionPersisterStatus.svelte';
import FunctionQueriesIds from './components/FunctionQueriesIds.svelte';
import FunctionQueryIds from './components/FunctionQueryIds.svelte';
import FunctionRelationshipIds from './components/FunctionRelationshipIds.svelte';
import FunctionRelationshipsIds from './components/FunctionRelationshipsIds.svelte';
import FunctionRemoteRowId from './components/FunctionRemoteRowId.svelte';
import FunctionResultCell from './components/FunctionResultCell.svelte';
import FunctionResultCellIds from './components/FunctionResultCellIds.svelte';
import FunctionResultRow from './components/FunctionResultRow.svelte';
import FunctionResultRowCount from './components/FunctionResultRowCount.svelte';
import FunctionResultRowIds from './components/FunctionResultRowIds.svelte';
import FunctionResultSortedRowIds from './components/FunctionResultSortedRowIds.svelte';
import FunctionResultSortedRowIdsNoDefaults from './components/FunctionResultSortedRowIdsNoDefaults.svelte';
import FunctionResultTable from './components/FunctionResultTable.svelte';
import FunctionResultTableCellIds from './components/FunctionResultTableCellIds.svelte';
import FunctionRow from './components/FunctionRow.svelte';
import FunctionRowCount from './components/FunctionRowCount.svelte';
import FunctionRowIds from './components/FunctionRowIds.svelte';
import FunctionSliceIds from './components/FunctionSliceIds.svelte';
import FunctionSliceRowIds from './components/FunctionSliceRowIds.svelte';
import FunctionSortedRowIds from './components/FunctionSortedRowIds.svelte';
import FunctionSortedRowIdsNoDefaults from './components/FunctionSortedRowIdsNoDefaults.svelte';
import FunctionSynchronizerIds from './components/FunctionSynchronizerIds.svelte';
import FunctionSynchronizerStatus from './components/FunctionSynchronizerStatus.svelte';
import FunctionTable from './components/FunctionTable.svelte';
import FunctionTableCellIds from './components/FunctionTableCellIds.svelte';
import FunctionTableIds from './components/FunctionTableIds.svelte';
import FunctionTables from './components/FunctionTables.svelte';
import FunctionValue from './components/FunctionValue.svelte';
import FunctionValueIds from './components/FunctionValueIds.svelte';
import FunctionValues from './components/FunctionValues.svelte';
import FunctionWindowlessCoverage from './components/FunctionWindowlessCoverage.svelte';
import FunctionWritableCell from './components/FunctionWritableCell.svelte';
import FunctionWritableValue from './components/FunctionWritableValue.svelte';

let store: Store;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
});

test('windowless ui-svelte functions skip effects', () => {
  vi.stubGlobal('window', undefined);
  try {
    const {container, unmount} = render(FunctionWindowlessCoverage);
    expect(container.textContent).toEqual(
      JSON.stringify([['t1'], 1, 1, [], [], [], [], [], [], [], []]),
    );
    unmount();
  } finally {
    vi.unstubAllGlobals();
  }
});

describe('Read Functions', () => {
  test('createHasTables', async () => {
    const {container, unmount} = render(FunctionHasTables, {props: {store}});
    expect(container.textContent).toEqual('true');

    await act(() => store.delTables());
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('createTables', async () => {
    const {container, unmount} = render(FunctionTables, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));

    await act(() =>
      store.setTables({t1: {r1: {c1: 2}}}).setTables({t1: {r1: {c1: 2}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 2}}}));

    await act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('createTableIds', async () => {
    const {container, unmount} = render(FunctionTableIds, {props: {store}});
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

  test('createHasTable', async () => {
    const {container, rerender, unmount} = render(FunctionHasTable, {
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

  test('createTable', async () => {
    const {container, rerender, unmount} = render(FunctionTable, {
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

  test('createTableCellIds', async () => {
    const {container, rerender, unmount} = render(FunctionTableCellIds, {
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

  test('createHasTableCell', async () => {
    const {container, rerender, unmount} = render(FunctionHasTableCell, {
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

  test('createRowCount', async () => {
    const {container, rerender, unmount} = render(FunctionRowCount, {
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

  test('createRowIds', async () => {
    const {container, rerender, unmount} = render(FunctionRowIds, {
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

  test('createSortedRowIds', async () => {
    const {container, rerender, unmount} = render(FunctionSortedRowIds, {
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

  test('createSortedRowIds, no-default descending and offset', async () => {
    const {container, unmount} = render(FunctionSortedRowIdsNoDefaults, {
      props: {store, tableId: 't1', cellId: 'c1'},
    });
    expect(container.textContent).toEqual(JSON.stringify(['r1']));
    unmount();
  });

  test('createHasRow', async () => {
    const {container, rerender, unmount} = render(FunctionHasRow, {
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

  test('createRow', async () => {
    const {container, rerender, unmount} = render(FunctionRow, {
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

  test('createCellIds', async () => {
    const {container, rerender, unmount} = render(FunctionCellIds, {
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

  test('createHasCell', async () => {
    const {container, rerender, unmount} = render(FunctionHasCell, {
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

  test('createCell', async () => {
    const {container, rerender, unmount} = render(FunctionCell, {
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

  test('createCell can set values', async () => {
    store.setCell('t1', 'r1', 'c1', 0);
    const {container, unmount} = render(FunctionWritableCell, {
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

  test('createHasValues', async () => {
    const {container, unmount} = render(FunctionHasValues, {props: {store}});
    expect(container.textContent).toEqual('true');

    await act(() => store.delValues());
    expect(container.textContent).toEqual('false');

    unmount();
  });

  test('createValues', async () => {
    const {container, unmount} = render(FunctionValues, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify({v1: 1}));

    await act(() => store.setValues({v1: 2}).setValues({v1: 2}));
    expect(container.textContent).toEqual(JSON.stringify({v1: 2}));

    await act(() => store.delValues());
    expect(container.textContent).toEqual(JSON.stringify({}));

    unmount();
  });

  test('createValueIds', async () => {
    const {container, unmount} = render(FunctionValueIds, {props: {store}});
    expect(container.textContent).toEqual(JSON.stringify(['v1']));

    await act(() => store.setValues({v1: 1, v2: 2}).setValues({v1: 1, v2: 2}));
    expect(container.textContent).toEqual(JSON.stringify(['v1', 'v2']));

    await act(() => store.delValues());
    expect(container.textContent).toEqual('[]');

    unmount();
  });

  test('createHasValue', async () => {
    const {container, rerender, unmount} = render(FunctionHasValue, {
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

  test('createValue', async () => {
    const {container, rerender, unmount} = render(FunctionValue, {
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

  test('createValue can set values', async () => {
    store.setValues({v1: false});
    const {container, unmount} = render(FunctionWritableValue, {
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

  test('createMetricsIds', async () => {
    const {container, unmount} = render(FunctionMetricsIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createIndexesIds', async () => {
    const {container, unmount} = render(FunctionIndexesIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createQueriesIds', async () => {
    const {container, unmount} = render(FunctionQueriesIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createRelationshipsIds', async () => {
    const {container, unmount} = render(FunctionRelationshipsIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createCheckpointsIds', async () => {
    const {container, unmount} = render(FunctionCheckpointsIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createPersisterIds', async () => {
    const {container, unmount} = render(FunctionPersisterIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createSynchronizerIds', async () => {
    const {container, unmount} = render(FunctionSynchronizerIds);
    expect(container.textContent).toEqual('[]');
    unmount();
  });

  test('createMetricIds', async () => {
    const metrics: Metrics = createMetrics(store);
    const {container, unmount} = render(FunctionMetricIds, {props: {metrics}});
    expect(container.textContent).toEqual('[]');

    await act(() =>
      metrics.setMetricDefinition('m1', 't1').setMetricDefinition('m2', 't2'),
    );
    expect(container.textContent).toEqual('["m1","m2"]');

    await act(() => metrics.delMetricDefinition('m1'));
    expect(container.textContent).toEqual('["m2"]');

    unmount();
  });

  test('createMetric', async () => {
    const metrics: Metrics = createMetrics(store)
      .setMetricDefinition('m1', 't1')
      .setMetricDefinition('m2', 't1', 'max', 'c1')
      .setMetricDefinition('m3', 't3');
    const {container, rerender, unmount} = render(FunctionMetric, {
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

  test('createIndexIds', async () => {
    const indexes: Indexes = createIndexes(store);
    const {container, unmount} = render(FunctionIndexIds, {props: {indexes}});
    expect(container.textContent).toEqual('[]');

    await act(() =>
      indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't2'),
    );
    expect(container.textContent).toEqual('["i1","i2"]');

    await act(() => indexes.delIndexDefinition('i1'));
    expect(container.textContent).toEqual('["i2"]');

    unmount();
  });

  test('createSliceIds', async () => {
    const indexes: Indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't1', 'c2')
      .setIndexDefinition('i3', 't3', 'c3');
    const {container, rerender, unmount} = render(FunctionSliceIds, {
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

  test('createSliceRowIds', async () => {
    const indexes: Indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't2', 'c2');
    const {container, rerender, unmount} = render(FunctionSliceRowIds, {
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

  test('createRelationshipIds', async () => {
    const relationships: Relationships = createRelationships(store);
    const {container, unmount} = render(FunctionRelationshipIds, {
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

  test('createRemoteRowId', async () => {
    const relationships: Relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    const {container, rerender, unmount} = render(FunctionRemoteRowId, {
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

  test('createLocalRowIds', async () => {
    const relationships: Relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    const {container, rerender, unmount} = render(FunctionLocalRowIds, {
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

  test('createLinkedRowIds', async () => {
    const relationships: Relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 't1', 'c1')
      .setRelationshipDefinition('r2', 't2', 't2', 'c2');
    const {container, rerender, unmount} = render(FunctionLinkedRowIds, {
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

  test('createQueryIds', async () => {
    const queries: Queries = createQueries(store);
    const {container, unmount} = render(FunctionQueryIds, {props: {queries}});
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

  test('createResultTable', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(FunctionResultTable, {
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

  test('createResultRowIds', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(FunctionResultRowIds, {
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

  test('createResultTableCellIds', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const {container, rerender, unmount} = render(FunctionResultTableCellIds, {
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

  test('createResultRowCount', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const {container, rerender, unmount} = render(FunctionResultRowCount, {
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

  test('createResultSortedRowIds', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(FunctionResultSortedRowIds, {
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

  test('createResultSortedRowIds, no-default descending & offset', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const {container, unmount} = render(FunctionResultSortedRowIdsNoDefaults, {
      props: {queries, queryId: 'q1', cellId: 'c1'},
    });
    expect(container.textContent).toEqual(JSON.stringify(['r1']));
    unmount();
  });

  test('createResultRow', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(FunctionResultRow, {
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

  test('createResultCellIds', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        select('c3');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(FunctionResultCellIds, {
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

  test('createResultCell', async () => {
    const queries: Queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const {container, rerender, unmount} = render(FunctionResultCell, {
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

  test('createCheckpointIds', async () => {
    const checkpoints: Checkpoints = createCheckpoints(store);
    const {container, unmount} = render(FunctionCheckpointIds, {
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

  test('createPersisterStatus', async () => {
    const persister: AnyPersister = createSessionPersister(store, 'test-key');
    const {container, unmount} = render(FunctionPersisterStatus, {
      props: {persister},
    });
    expect(container.textContent).toEqual('0');
    unmount();
    persister.destroy();
  });

  test('createSynchronizerStatus', async () => {
    const store2 = createMergeableStore();
    const synchronizer: Synchronizer = createLocalSynchronizer(store2);
    const {container, unmount} = render(FunctionSynchronizerStatus, {
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

  test('createGoBackwardCallback', async () => {
    const {getByRole, unmount} = render(FunctionGoBackwardCallback, {
      props: {checkpoints},
    });

    await act(() => fireEvent.click(getByRole('button')));
    expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

    await act(() => fireEvent.click(getByRole('button')));
    expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1', '2']]);

    unmount();
  });

  test('createGoForwardCallback', async () => {
    const {getByRole, unmount} = render(FunctionGoForwardCallback, {
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

describe('Listener Functions', () => {
  test('onHasTables', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasTables).toEqual(0);

    const {unmount} = render(ListenerFunctionHasTables, {
      props: {store, listener},
    });
    expect(store.getListenerStats().hasTables).toEqual(1);

    await act(() => store.delTables());
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasTables).toEqual(0);
  });

  test('onTables', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().tables).toEqual(0);

    const {unmount} = render(ListenerFunctionTables, {
      props: {store, listener},
    });
    expect(store.getListenerStats().tables).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().tables).toEqual(0);
  });

  test('onTableIds', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().tableIds).toEqual(0);

    const {unmount} = render(ListenerFunctionTableIds, {
      props: {store, listener},
    });
    expect(store.getListenerStats().tableIds).toEqual(1);

    await act(() => store.setCell('t2', 'r1', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().tableIds).toEqual(0);
  });

  test('onHasTable', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasTable).toEqual(0);

    const {unmount} = render(ListenerFunctionHasTable, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().hasTable).toEqual(1);

    await act(() => store.delTable('t1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasTable).toEqual(0);
  });

  test('onTable', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().table).toEqual(0);

    const {unmount} = render(ListenerFunctionTable, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().table).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().table).toEqual(0);
  });

  test('onTableCellIds', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().tableCellIds).toEqual(0);

    const {unmount} = render(ListenerFunctionTableCellIds, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().tableCellIds).toEqual(0);
  });

  test('onHasTableCell', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasTableCell).toEqual(0);

    const {unmount} = render(ListenerFunctionHasTableCell, {
      props: {store, tableId: 't1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);

    await act(() => store.delCell('t1', 'r1', 'c1', true));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasTableCell).toEqual(0);
  });

  test('onRowCount', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().rowCount).toEqual(0);

    const {unmount} = render(ListenerFunctionRowCount, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().rowCount).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().rowCount).toEqual(0);
  });

  test('onRowIds', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().rowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionRowIds, {
      props: {store, tableId: 't1', listener},
    });
    expect(store.getListenerStats().rowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().rowIds).toEqual(0);
  });

  test('onSortedRowIds', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().sortedRowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionSortedRowIds, {
      props: {store, tableId: 't1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
  });

  test('onHasRow', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasRow).toEqual(0);

    const {unmount} = render(ListenerFunctionHasRow, {
      props: {store, tableId: 't1', rowId: 'r1', listener},
    });
    expect(store.getListenerStats().hasRow).toEqual(1);

    await act(() => store.delRow('t1', 'r1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasRow).toEqual(0);
  });

  test('onRow', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().row).toEqual(0);

    const {unmount} = render(ListenerFunctionRow, {
      props: {store, tableId: 't1', rowId: 'r1', listener},
    });
    expect(store.getListenerStats().row).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().row).toEqual(0);
  });

  test('onCellIds', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().cellIds).toEqual(0);

    const {unmount} = render(ListenerFunctionCellIds, {
      props: {store, tableId: 't1', rowId: 'r1', listener},
    });
    expect(store.getListenerStats().cellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().cellIds).toEqual(0);
  });

  test('onHasCell', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasCell).toEqual(0);

    const {unmount} = render(ListenerFunctionHasCell, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().hasCell).toEqual(1);

    await act(() => store.delCell('t1', 'r1', 'c1', true));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasCell).toEqual(0);
  });

  test('onCell', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().cell).toEqual(0);

    const {unmount} = render(ListenerFunctionCell, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1', listener},
    });
    expect(store.getListenerStats().cell).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().cell).toEqual(0);
  });

  test('onHasValues', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasValues).toEqual(0);

    const {unmount} = render(ListenerFunctionHasValues, {
      props: {store, listener},
    });
    expect(store.getListenerStats().hasValues).toEqual(1);

    await act(() => store.delValues());
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasValues).toEqual(0);
  });

  test('onValues', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().values).toEqual(0);

    const {unmount} = render(ListenerFunctionValues, {
      props: {store, listener},
    });
    expect(store.getListenerStats().values).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().values).toEqual(0);
  });

  test('onValueIds', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().valueIds).toEqual(0);

    const {unmount} = render(ListenerFunctionValueIds, {
      props: {store, listener},
    });
    expect(store.getListenerStats().valueIds).toEqual(1);

    await act(() => store.setValue('v2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().valueIds).toEqual(0);
  });

  test('onHasValue', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().hasValue).toEqual(0);

    const {unmount} = render(ListenerFunctionHasValue, {
      props: {store, valueId: 'v1', listener},
    });
    expect(store.getListenerStats().hasValue).toEqual(1);

    await act(() => store.delValue('v1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().hasValue).toEqual(0);
  });

  test('onValue', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().value).toEqual(0);

    const {unmount} = render(ListenerFunctionValue, {
      props: {store, valueId: 'v1', listener},
    });
    expect(store.getListenerStats().value).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().value).toEqual(0);
  });

  test('onStartTransaction', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().transaction).toEqual(0);

    const {unmount} = render(ListenerFunctionStartTransaction, {
      props: {store, listener},
    });
    expect(store.getListenerStats().transaction).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('onWillFinishTransaction', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().transaction).toEqual(0);

    const {unmount} = render(ListenerFunctionWillFinishTransaction, {
      props: {store, listener},
    });
    expect(store.getListenerStats().transaction).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('onDidFinishTransaction', async () => {
    const listener = vi.fn();
    expect(store.getListenerStats().transaction).toEqual(0);

    const {unmount} = render(ListenerFunctionDidFinishTransaction, {
      props: {store, listener},
    });
    expect(store.getListenerStats().transaction).toEqual(1);

    await act(() => store.setValue('v1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('onMetric', async () => {
    const metrics: Metrics = createMetrics(store).setMetricDefinition(
      'm1',
      't1',
      'max',
      'c1',
    );
    const listener = vi.fn();
    expect(metrics.getListenerStats().metric).toEqual(0);

    const {unmount} = render(ListenerFunctionMetric, {
      props: {metrics, metricId: 'm1', listener},
    });
    expect(metrics.getListenerStats().metric).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(metrics.getListenerStats().metric).toEqual(0);
  });

  test('onSliceIds', async () => {
    const indexes: Indexes = createIndexes(store).setIndexDefinition(
      'i1',
      't1',
      'c1',
    );
    const listener = vi.fn();
    expect(indexes.getListenerStats().sliceIds).toEqual(0);

    const {unmount} = render(ListenerFunctionSliceIds, {
      props: {indexes, indexId: 'i1', listener},
    });
    expect(indexes.getListenerStats().sliceIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'a'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(indexes.getListenerStats().sliceIds).toEqual(0);
  });

  test('onSliceRowIds', async () => {
    const indexes: Indexes = createIndexes(store).setIndexDefinition(
      'i1',
      't1',
      'c1',
    );
    const listener = vi.fn();
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionSliceRowIds, {
      props: {indexes, indexId: 'i1', sliceId: 'a', listener},
    });
    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'a'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
  });

  test('onRemoteRowId', async () => {
    const relationships: Relationships = createRelationships(
      store,
    ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    const listener = vi.fn();
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);

    const {unmount} = render(ListenerFunctionRemoteRowId, {
      props: {relationships, relationshipId: 'r1', localRowId: 'r1', listener},
    });
    expect(relationships.getListenerStats().remoteRowId).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 'R1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);
  });

  test('onLocalRowIds', async () => {
    const relationships: Relationships = createRelationships(
      store,
    ).setRelationshipDefinition('r1', 't1', 'T1', 'c1');
    const listener = vi.fn();
    expect(relationships.getListenerStats().localRowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionLocalRowIds, {
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

  test('onLinkedRowIds', async () => {
    const relationships: Relationships = createRelationships(
      store,
    ).setRelationshipDefinition('r1', 't1', 't1', 'c1');
    const listener = vi.fn();
    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionLinkedRowIds, {
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

  test('onResultTable', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().table).toEqual(0);

    const {unmount} = render(ListenerFunctionResultTable, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().table).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().table).toEqual(0);
  });

  test('onResultTableCellIds', async () => {
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

    const {unmount} = render(ListenerFunctionResultTableCellIds, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().tableCellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().tableCellIds).toEqual(0);
  });

  test('onResultRowCount', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().rowCount).toEqual(0);

    const {unmount} = render(ListenerFunctionResultRowCount, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().rowCount).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().rowCount).toEqual(0);
  });

  test('onResultRowIds', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().rowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionResultRowIds, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().rowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().rowIds).toEqual(0);
  });

  test('onResultSortedRowIds', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);

    const {unmount} = render(ListenerFunctionResultSortedRowIds, {
      props: {queries, queryId: 'q1', cellId: 'c1', listener},
    });
    expect(queries.getListenerStats().sortedRowIds).toEqual(1);

    await act(() => store.setCell('t1', 'r2', 'c1', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);
  });

  test('onResultRow', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().row).toEqual(0);

    const {unmount} = render(ListenerFunctionResultRow, {
      props: {queries, queryId: 'q1', rowId: 'r1', listener},
    });
    expect(queries.getListenerStats().row).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().row).toEqual(0);
  });

  test('onResultCellIds', async () => {
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

    const {unmount} = render(ListenerFunctionResultCellIds, {
      props: {queries, queryId: 'q1', rowId: 'r1', listener},
    });
    expect(queries.getListenerStats().cellIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c2', 0));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().cellIds).toEqual(0);
  });

  test('onResultCell', async () => {
    const queries: Queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const listener = vi.fn();
    expect(queries.getListenerStats().cell).toEqual(0);

    const {unmount} = render(ListenerFunctionResultCell, {
      props: {queries, queryId: 'q1', rowId: 'r1', cellId: 'c1', listener},
    });
    expect(queries.getListenerStats().cell).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().cell).toEqual(0);
  });

  test('onParamValues', async () => {
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

    const {unmount} = render(ListenerFunctionParamValues, {
      props: {queries, queryId: 'q1', listener},
    });
    expect(queries.getListenerStats().paramValues).toEqual(1);

    await act(() => queries.setParamValue('q1', 'p1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().paramValues).toEqual(0);
  });

  test('onParamValue', async () => {
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

    const {unmount} = render(ListenerFunctionParamValue, {
      props: {queries, queryId: 'q1', paramId: 'p1', listener},
    });
    expect(queries.getListenerStats().paramValue).toEqual(1);

    await act(() => queries.setParamValue('q1', 'p1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(queries.getListenerStats().paramValue).toEqual(0);
  });

  test('onCheckpointIds', async () => {
    const checkpoints: Checkpoints = createCheckpoints(store);
    const listener = vi.fn();
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);

    const {unmount} = render(ListenerFunctionCheckpointIds, {
      props: {checkpoints, listener},
    });
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);

    await act(() => store.setCell('t1', 'r1', 'c1', 2));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
  });

  test('onCheckpoint', async () => {
    const checkpoints: Checkpoints = createCheckpoints(store);
    const listener = vi.fn();
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);

    const {unmount} = render(ListenerFunctionCheckpoint, {
      props: {checkpoints, checkpointId: '0', listener},
    });
    expect(checkpoints.getListenerStats().checkpoint).toEqual(1);

    await act(() => checkpoints.setCheckpoint('0', 'c1'));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
  });

  test('onPersisterStatus', async () => {
    const persister: AnyPersister = createSessionPersister(store, 'test-key');
    const listener = vi.fn();

    const {unmount} = render(ListenerFunctionPersisterStatus, {
      props: {persister, listener},
    });

    await act(() => persister.save());
    expect(listener).toHaveBeenCalled();

    unmount();
    persister.destroy();
  });

  test('onSynchronizerStatus', async () => {
    const store2 = createMergeableStore();
    const synchronizer: Synchronizer = createLocalSynchronizer(store2);
    const listener = vi.fn();

    const {unmount} = render(ListenerFunctionSynchronizerStatus, {
      props: {synchronizer, listener},
    });

    await act(() => synchronizer.save());
    expect(listener).toHaveBeenCalled();

    unmount();
    synchronizer.destroy();
  });
});
