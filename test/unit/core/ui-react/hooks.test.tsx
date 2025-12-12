/* eslint-disable react-hooks/immutability */
import '@testing-library/jest-dom/vitest';
import {fireEvent, render} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {MouseEvent, MouseEventHandler, act} from 'react';
import type {
  Cell,
  Checkpoints,
  Id,
  MapCell,
  MapValue,
  MergeableStore,
  Row,
  Store,
  Table,
  Tables,
  Value,
  Values,
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
import type {AnyPersister, Persister} from 'tinybase/persisters';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import type {Synchronizer} from 'tinybase/synchronizers';
import {createLocalSynchronizer} from 'tinybase/synchronizers/synchronizer-local';
import {
  Provider,
  useAddRowCallback,
  useCell,
  useCellIds,
  useCellIdsListener,
  useCellListener,
  useCellState,
  useCheckpointIds,
  useCheckpointIdsListener,
  useCheckpointListener,
  useCheckpoints,
  useCheckpointsIds,
  useCreateCheckpoints,
  useCreateIndexes,
  useCreateMergeableStore,
  useCreateMetrics,
  useCreatePersister,
  useCreateQueries,
  useCreateRelationships,
  useCreateStore,
  useCreateSynchronizer,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useDelValueCallback,
  useDelValuesCallback,
  useDidFinishTransactionListener,
  useGoBackwardCallback,
  useGoForwardCallback,
  useGoToCallback,
  useHasCell,
  useHasCellListener,
  useHasRow,
  useHasRowListener,
  useHasTable,
  useHasTableCell,
  useHasTableCellListener,
  useHasTableListener,
  useHasTables,
  useHasTablesListener,
  useHasValue,
  useHasValueListener,
  useHasValues,
  useHasValuesListener,
  useIndexIds,
  useIndexes,
  useIndexesIds,
  useLinkedRowIds,
  useLinkedRowIdsListener,
  useLocalRowIds,
  useLocalRowIdsListener,
  useMetric,
  useMetricIds,
  useMetricListener,
  useMetrics,
  useMetricsIds,
  useParamValue,
  useParamValueListener,
  useParamValues,
  useParamValuesListener,
  useProvideStore,
  useQueries,
  useQueriesIds,
  useQueryIds,
  useRedoInformation,
  useRelationshipIds,
  useRelationships,
  useRelationshipsIds,
  useRemoteRowId,
  useRemoteRowIdListener,
  useResultCell,
  useResultCellIds,
  useResultCellIdsListener,
  useResultCellListener,
  useResultRow,
  useResultRowCount,
  useResultRowCountListener,
  useResultRowIds,
  useResultRowIdsListener,
  useResultRowListener,
  useResultSortedRowIds,
  useResultSortedRowIdsListener,
  useResultTable,
  useResultTableCellIds,
  useResultTableCellIdsListener,
  useResultTableListener,
  useRow,
  useRowCount,
  useRowCountListener,
  useRowIds,
  useRowIdsListener,
  useRowListener,
  useRowState,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetParamValueCallback,
  useSetParamValuesCallback,
  useSetPartialRowCallback,
  useSetPartialValuesCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetTablesCallback,
  useSetValueCallback,
  useSetValuesCallback,
  useSliceIds,
  useSliceIdsListener,
  useSliceRowIds,
  useSliceRowIdsListener,
  useSortedRowIds,
  useSortedRowIdsListener,
  useStartTransactionListener,
  useStore,
  useStoreIds,
  useStores,
  useTable,
  useTableCellIds,
  useTableCellIdsListener,
  useTableIds,
  useTableIdsListener,
  useTableListener,
  useTableState,
  useTables,
  useTablesListener,
  useTablesState,
  useUndoInformation,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValueState,
  useValues,
  useValuesListener,
  useValuesState,
  useWillFinishTransactionListener,
} from 'tinybase/ui-react';
import tmp from 'tmp';
import {type Mock, beforeEach, describe, expect, test, vi} from 'vitest';
import {noop, pause} from '../../common/other.ts';

let store: Store;
let didRender: Mock;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
  didRender = vi.fn((rendered) => rendered);
});

describe('Create Hooks', () => {
  test('useCreateStore', () => {
    const initStore = vi.fn((count: any) =>
      createStore().setTables({t1: {r1: {c1: count}}}),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore(count));
      return didRender(JSON.stringify([count, store.getTables()]));
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {t1: {r1: {c1: 1}}}]),
    );

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {t1: {r1: {c1: 1}}}]),
    );

    expect(didRender).toHaveBeenCalledTimes(2);
    expect(initStore).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useCreateMergeableStore', () => {
    const initStore = vi.fn((count: any) =>
      createMergeableStore('s1').setTables({t1: {r1: {c1: count}}}),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateMergeableStore(() => initStore(count));
      return didRender(JSON.stringify([count, store.getTables()]));
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {t1: {r1: {c1: 1}}}]),
    );

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {t1: {r1: {c1: 1}}}]),
    );
    expect(didRender).toHaveBeenCalledTimes(2);
    expect(initStore).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useCreateMetrics', () => {
    const initStore = vi.fn(() =>
      createStore().setTables({
        t1: {r1: {c1: 1}},
        t2: {r1: {c2: 2}, r2: {c2: 2}},
      }),
    );
    const initMetrics = vi.fn((store: Store, count) =>
      createMetrics(store).setMetricDefinition('m1', `t${count}`),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const metrics = useCreateMetrics(
        store,
        (store) => initMetrics(store, count),
        [count],
      );
      return didRender(JSON.stringify([count, metrics?.getMetric('m1')]));
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(JSON.stringify([1, 1]));

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(JSON.stringify([2, 2]));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initMetrics).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useCreateMetrics (no deps, and destroy)', () => {
    const initStore = vi.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}}, t2: {r1: {c2: 2}}}),
    );
    const initMetrics = vi.fn((store: Store) =>
      createMetrics(store).setMetricDefinition('m1', `t1`),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const metrics = useCreateMetrics(store, (store) => initMetrics(store));
      return didRender(JSON.stringify([count, metrics?.getMetric('m1')]));
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(JSON.stringify([1, 1]));

    rerender(<Test count={2} />);

    unmount();
    expect(container.textContent).toEqual('');
    expect(didRender).toHaveBeenCalledTimes(3);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initMetrics).toHaveBeenCalledTimes(1);
  });

  test('useCreateMetrics (undefined store)', () => {
    const initMetrics = vi.fn((store: Store) =>
      createMetrics(store).setMetricDefinition('m1', `t1`),
    );
    const Test = () => {
      const metrics = useCreateMetrics(undefined, (store) =>
        initMetrics(store),
      );
      return didRender(JSON.stringify(metrics?.getMetric('m1')));
    };

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useCreateIndexes', async () => {
    const initStore = vi.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}, r2: {c2: 1}}}),
    );
    const initIndexes = vi.fn((store: Store, count) => {
      return createIndexes(store).setIndexDefinition('i1', 't1', `c${count}`);
    });
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const indexes = useCreateIndexes(
        store,
        (store) => initIndexes(store, count),
        [count],
      );
      return didRender(
        JSON.stringify([count, indexes?.getSliceRowIds('i1', '1')]),
      );
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(JSON.stringify([1, ['r1']]));

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(JSON.stringify([2, ['r2']]));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initIndexes).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useCreateRelationships', () => {
    const initStore = vi.fn(() =>
      createStore().setTables({
        t1: {r1: {c1: `R1`}},
        t2: {r1: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      }),
    );
    const initRelationships = vi.fn((store: Store, count) =>
      createRelationships(store).setRelationshipDefinition(
        'r1',
        `t${count}`,
        'T1',
        'c1',
      ),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const relationships = useCreateRelationships(
        store,
        (store) => initRelationships(store, count),
        [count],
      );
      return didRender(
        <>
          {JSON.stringify([count, relationships?.getRemoteRowId('r1', 'r1')])}
        </>,
      );
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(JSON.stringify([1, 'R1']));

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(JSON.stringify([2, 'R2']));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initRelationships).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useCreateQueries', () => {
    const initStore = vi.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}, r2: {c2: 2}}}),
    );
    const initQueries = vi.fn((store: Store, count) =>
      createQueries(store).setQueryDefinition('q1', 't1', ({select}) =>
        select(`c${count}`),
      ),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const queries = useCreateQueries(
        store,
        (store) => initQueries(store, count),
        [count],
      );
      return didRender(JSON.stringify([count, queries?.getResultTable('q1')]));
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(JSON.stringify([1, {r1: {c1: 1}}]));

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(JSON.stringify([2, {r2: {c2: 2}}]));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initQueries).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useCreateCheckpoints', () => {
    const initStore = vi.fn(() => createStore().setTables({t1: {r1: {c1: 1}}}));
    const initCheckpoints = vi.fn((store: Store, count: number) => {
      const checkpoints = createCheckpoints(store);
      checkpoints.getStore().setCell('t1', 'r1', 'c1', count + 1);
      checkpoints.addCheckpoint(`checkpoint${count}`);
      return checkpoints;
    });
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const checkpoints = useCreateCheckpoints(
        store,
        (store) => initCheckpoints(store, count),
        [count],
      );
      return didRender(
        <>
          {JSON.stringify([
            count,
            checkpoints?.getCheckpointIds(),
            checkpoints?.getCheckpoint('1'),
            checkpoints?.getCheckpoint('2'),
          ])}
        </>,
      );
    };

    const {container, rerender, unmount} = render(<Test count={1} />);
    expect(container.textContent).toEqual(
      JSON.stringify([1, [['0'], '1', []], 'checkpoint1', null]),
    );

    rerender(<Test count={2} />);
    expect(container.textContent).toEqual(
      JSON.stringify([2, [['0', '1'], '2', []], 'checkpoint1', 'checkpoint2']),
    );
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initCheckpoints).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useCreatePersister, no then', async () => {
    let _persister: AnyPersister | undefined;
    tmp.setGracefulCleanup();
    const fileName = tmp.fileSync().name;
    const initStore = vi.fn(createStore);
    const createPersister = vi.fn((store: Store) => {
      _persister = createFilePersister(store, fileName);
      return _persister;
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateStore(initStore);
      const persister = useCreatePersister(store, createPersister, [id]);
      const cell = useCell('t1', 'r1', 'c1', store);
      return didRender(JSON.stringify([id, persister?.getStats(), cell]));
    };

    const {container, rerender, unmount} = render(<Test id={1} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {loads: 0, saves: 0}, null]),
    );
    await act(() => _persister?.load([{t1: {r1: {c1: 1}}}, {}]));
    expect(container.textContent).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}, 1]),
    );

    rerender(<Test id={2} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {loads: 0, saves: 0}, 1]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createPersister).toHaveBeenCalledTimes(2);
    expect(didRender).toHaveBeenCalledTimes(5);
    await _persister?.stopAutoLoad();
    await _persister?.stopAutoSave();

    unmount();
  });

  test('useCreatePersister, then, no destroy', async () => {
    let _persister: AnyPersister | undefined;
    tmp.setGracefulCleanup();
    const fileName = tmp.fileSync().name;
    const initStore = vi.fn(createStore);
    const createPersister = vi.fn((store: Store, id: number) => {
      if (id != 0) {
        _persister = createFilePersister(store, fileName);
        return _persister;
      }
    });
    const initPersister = vi.fn(async (persister: Persister, id: number) => {
      await persister.load([{t1: {r1: {c1: id}}}, {}]);
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateStore(initStore);
      const persister = useCreatePersister(
        store,
        (store) => createPersister(store, id),
        [id],
        (persister) => initPersister(persister, id),
        [id],
      );
      return didRender(JSON.stringify([id, persister?.getStats()]));
    };

    const {container, rerender, unmount} = render(<Test id={0} />);
    expect(container.textContent).toEqual(JSON.stringify([0, null]));

    rerender(<Test id={1} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}]),
    );

    rerender(<Test id={2} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createPersister).toHaveBeenCalledTimes(3);
    expect(initPersister).toHaveBeenCalledTimes(2);
    expect(didRender).toHaveBeenCalledTimes(5);
    await _persister?.stopAutoLoad();
    await _persister?.stopAutoSave();

    unmount();
  });

  test('useCreatePersister, then, destroy', async () => {
    const persisters: AnyPersister[] = [];
    tmp.setGracefulCleanup();
    const initStore = vi.fn(createStore);
    const createPersister = vi.fn((store: Store, id: number) => {
      const fileName = tmp.fileSync().name;
      const persister = createFilePersister(store, fileName);
      persisters[id] = persister;
      return persister;
    });
    const initPersister = vi.fn(async (persister: AnyPersister, id: number) => {
      await persister.load([{t1: {r1: {c1: id}}}, {}]);
    });
    const destroyPersister = vi.fn((persister: AnyPersister) => {
      expect(persisters).toContain(persister);
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateStore(initStore);
      const persister = useCreatePersister(
        store,
        (store) => createPersister(store, id),
        [id],
        (persister) => initPersister(persister, id),
        [id],
        destroyPersister,
      );
      return didRender(JSON.stringify([id, persister?.getStats()]));
    };

    const {container, rerender, unmount} = render(<Test id={1} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}]),
    );

    rerender(<Test id={2} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createPersister).toHaveBeenCalledTimes(2);
    expect(initPersister).toHaveBeenCalledTimes(2);
    expect(destroyPersister).toHaveBeenCalledTimes(1);
    expect(destroyPersister).toHaveBeenCalledWith(persisters[1]);
    expect(didRender).toHaveBeenCalledTimes(4);
    await Promise.all(
      persisters.map(async (persister) => {
        await persister.stopAutoLoad();
        await persister.stopAutoSave();
      }),
    );

    unmount();
  });

  test('useCreatePersister, undefined store', async () => {
    const Test = () => {
      const persister = useCreatePersister(undefined, (store: Store) =>
        createFilePersister(store, ''),
      );
      return didRender(JSON.stringify(persister?.getStats()));
    };

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    unmount();
  });

  test('useCreateSynchronizer, no destroy', async () => {
    let _synchronizer: Synchronizer | undefined;
    const initStore = vi.fn(() => createMergeableStore('s1'));
    const createSynchronizer = vi.fn(async (store: MergeableStore) => {
      _synchronizer = createLocalSynchronizer(store);
      await _synchronizer.load([{t1: {r1: {c1: 1}}}, {}]);
      return _synchronizer;
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateMergeableStore(initStore);
      const synchronizer = useCreateSynchronizer(store, createSynchronizer, [
        id,
      ]);
      const cell = useCell('t1', 'r1', 'c1', store);
      return didRender(JSON.stringify([id, synchronizer?.getStats(), cell]));
    };

    const {container, rerender, unmount} = render(<Test id={1} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}, 1]),
    );

    rerender(<Test id={2} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}, 1]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createSynchronizer).toHaveBeenCalledTimes(2);
    expect(didRender).toHaveBeenCalledTimes(5);
    await _synchronizer?.stopAutoLoad();
    await _synchronizer?.stopAutoSave();

    unmount();
  });

  test('useCreateSynchronizer, destroy', async () => {
    const synchronizers: Synchronizer[] = [];
    const initStore = vi.fn(() => createMergeableStore('s1'));
    const createSynchronizer = vi.fn(
      async (store: MergeableStore, id: number) => {
        const synchronizer = createLocalSynchronizer(store);
        await synchronizer.load([{t1: {r1: {c1: id}}}, {}]);
        synchronizers[id] = synchronizer;
        return synchronizer;
      },
    );
    const destroySynchronizer = vi.fn((synchronizer: Synchronizer) => {
      expect(synchronizers).toContain(synchronizer);
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateMergeableStore(initStore);
      const synchronizer = useCreateSynchronizer(
        store,
        (store) => createSynchronizer(store, id),
        [id],
        destroySynchronizer,
      );
      return didRender(JSON.stringify([id, synchronizer?.getStats()]));
    };

    const {container, rerender, unmount} = render(<Test id={1} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}]),
    );

    rerender(<Test id={2} />);
    await act(pause);
    expect(container.textContent).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createSynchronizer).toHaveBeenCalledTimes(2);
    expect(destroySynchronizer).toHaveBeenCalledTimes(1);
    expect(destroySynchronizer).toHaveBeenCalledWith(synchronizers[1]);
    expect(didRender).toHaveBeenCalledTimes(4);
    await Promise.all(
      synchronizers.map(async (synchronizer) => {
        await synchronizer.stopAutoLoad();
        await synchronizer.stopAutoSave();
      }),
    );

    unmount();
  });

  test('useCreateSynchronizer, undefined store', async () => {
    const Test = () => {
      const synchronizer = useCreateSynchronizer(
        undefined,
        async (store: MergeableStore) => createLocalSynchronizer(store),
      );
      return didRender(JSON.stringify(synchronizer?.getStats()));
    };

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    unmount();
  });
});

describe('Context Hooks', () => {
  test('useStore', () => {
    const Test = () => didRender(JSON.stringify(useStore()?.getTables()));

    const {container, unmount} = render(
      <Provider store={store}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useProvideStore', () => {
    const Test = () => didRender(JSON.stringify(useStore('s')?.getTables()));
    const ProvideStore1 = () => {
      useProvideStore('s', store);
      return null;
    };
    const ProvideStore2 = () => {
      useProvideStore(
        's',
        useCreateStore(() => createStore().setCell('t2', 'r2', 'c2', 2)),
      );
      return null;
    };
    const {container, rerender, unmount} = render(
      <Provider>
        <Test />
      </Provider>,
    );

    expect(container.textContent).toEqual('');
    expect(didRender).toHaveBeenCalledTimes(1);

    rerender(
      <Provider>
        <Test />
        <ProvideStore1 />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(3);

    rerender(
      <Provider>
        <Test />
        <ProvideStore1 />
        <ProvideStore1 />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(4);

    rerender(
      <Provider>
        <Test />
        <ProvideStore2 />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify({t2: {r2: {c2: 2}}}));
    expect(didRender).toHaveBeenCalledTimes(6);

    rerender(
      <Provider>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('');
    expect(didRender).toHaveBeenCalledTimes(8);

    unmount();
  });

  test('useMetrics', () => {
    const Test = () => didRender(JSON.stringify(useMetrics()?.getMetric('m1')));
    const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
    const {container, unmount} = render(
      <Provider metrics={metrics}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('1');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();

    unmount();
  });

  test('useIndexes', () => {
    const Test = () =>
      didRender(JSON.stringify(useIndexes()?.getSliceRowIds('i1', '1')));
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const {container, unmount} = render(
      <Provider indexes={indexes}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1']));
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useRelationships', () => {
    store.setTables({
      t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
      T1: {R1: {C1: 1}, R2: {C1: 2}},
    });
    const Test = () =>
      didRender(JSON.stringify(useRelationships()?.getRemoteRowId('r1', 'r1')));
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      'T1',
      'c1',
    );
    const {container, unmount} = render(
      <Provider relationships={relationships}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify('R1'));
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useQueries', () => {
    const Test = () =>
      didRender(JSON.stringify(useQueries()?.getResultTable('q1')));
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const {container, unmount} = render(
      <Provider queries={queries}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useCheckpoints', () => {
    const Test = () =>
      didRender(JSON.stringify(useCheckpoints()?.getCheckpointIds()));
    const checkpoints = createCheckpoints(store);
    store.setTables({t1: {r1: {c1: 2}}});
    checkpoints.addCheckpoint();
    const {container, unmount} = render(
      <Provider checkpoints={checkpoints}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(JSON.stringify([['0'], '1', []]));
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useStores', () => {
    const Test = () =>
      didRender(
        <>
          {JSON.stringify([useStores(), useStores()?.['store1']?.getTables()])}
        </>,
      );
    const store1 = createStore().setTables({t1: {r1: {c1: 2}}});
    const store2 = createStore();
    const {container, rerender, unmount} = render(
      <Provider>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('[{},null]');
    rerender(
      <Provider storesById={{store1, store2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(
      '[{"store1":{},"store2":{}},{"t1":{"r1":{"c1":2}}}]',
    );
    expect(didRender).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useStoreIds', () => {
    const Test = () => didRender(JSON.stringify(useStoreIds()));
    const store1 = createStore();
    const store2 = createStore();
    const {container, unmount} = render(
      <Provider storesById={{store1, store2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('["store1","store2"]');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useMetricsIds', () => {
    const Test = () => didRender(JSON.stringify(useMetricsIds()));
    const metrics1 = createMetrics(createStore());
    const metrics2 = createMetrics(createStore());
    const {container, unmount} = render(
      <Provider metricsById={{metrics1, metrics2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('["metrics1","metrics2"]');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useIndexesIds', () => {
    const Test = () => didRender(JSON.stringify(useIndexesIds()));
    const indexes1 = createIndexes(createStore());
    const indexes2 = createIndexes(createStore());
    const {container, unmount} = render(
      <Provider indexesById={{indexes1, indexes2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('["indexes1","indexes2"]');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useRelationshipsIds', () => {
    const Test = () => didRender(JSON.stringify(useRelationshipsIds()));
    const relationships1 = createRelationships(createStore());
    const relationships2 = createRelationships(createStore());
    const {container, unmount} = render(
      <Provider relationshipsById={{relationships1, relationships2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual(
      '["relationships1","relationships2"]',
    );
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useQueriesIds', () => {
    const Test = () => didRender(JSON.stringify(useQueriesIds()));
    const queries1 = createQueries(createStore());
    const queries2 = createQueries(createStore());
    const {container, unmount} = render(
      <Provider queriesById={{queries1, queries2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('["queries1","queries2"]');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('useCheckpointsIds', () => {
    const Test = () => didRender(JSON.stringify(useCheckpointsIds()));
    const checkpoints1 = createCheckpoints(createStore());
    const checkpoints2 = createCheckpoints(createStore());
    const {container, unmount} = render(
      <Provider checkpointsById={{checkpoints1, checkpoints2}}>
        <Test />
      </Provider>,
    );
    expect(container.textContent).toEqual('["checkpoints1","checkpoints2"]');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('No context', () => {
    const Test = () =>
      didRender(
        <>
          {JSON.stringify(useStoreIds())}
          {JSON.stringify(useMetricsIds())}
          {JSON.stringify(useIndexesIds())}
          {JSON.stringify(useRelationshipsIds())}
          {JSON.stringify(useQueriesIds())}
        </>,
      );

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('[][][][][]');
    expect(didRender).toHaveBeenCalledTimes(1);

    unmount();
  });
});

describe('Read Hooks', () => {
  test('return same reference if no change', () => {
    let previous: Tables;
    let changed = 0;
    const Test = () => {
      const current = useTables(store);
      if (current != previous) {
        previous = current;
        changed++;
      }
      return didRender(<>Test</>);
    };

    const {rerender, unmount} = render(<Test />);
    expect(changed).toEqual(1);
    expect(didRender).toHaveBeenCalledTimes(1);
    rerender(<Test />);
    expect(changed).toEqual(1);
    expect(didRender).toHaveBeenCalledTimes(2);
    act(() => store.setTables({t1: {r1: {c1: 2}}}));
    expect(changed).toEqual(2);
    expect(didRender).toHaveBeenCalledTimes(3);
    rerender(<Test />);
    expect(changed).toEqual(2);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useHasTables', () => {
    const Test = () => didRender(JSON.stringify(useHasTables(store)));
    expect(store.getListenerStats().hasTables).toEqual(0);

    const {container, rerender, unmount} = render(<Test />);
    expect(store.getListenerStats().hasTables).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() => store.delTables());
    expect(container.textContent).toEqual('false');

    rerender(<button />);

    expect(store.getListenerStats().hasTables).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useTables', () => {
    const Test = () => didRender(JSON.stringify(useTables(store)));
    expect(store.getListenerStats().tables).toEqual(0);

    const {container, rerender, unmount} = render(<Test />);
    expect(store.getListenerStats().tables).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));

    act(() =>
      store.setTables({t1: {r1: {c1: 2}}}).setTables({t1: {r1: {c1: 2}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({t1: {r1: {c1: 2}}}));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));
    rerender(<button />);
    expect(store.getListenerStats().tables).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useTablesState', () => {
    const Test = () => {
      const [tables, setTables] = useTablesState(store);
      return (
        <span>
          {JSON.stringify(tables)}
          <button onClick={() => setTables({...tables, t2: {r1: {c1: 2}}})} />
        </span>
      );
    };

    store.setTables({t1: {r1: {c1: 1}}});
    const {container, unmount} = render(<Test />);

    expect(container.innerHTML).toEqual(
      '<span>{"t1":{"r1":{"c1":1}}}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      // eslint-disable-next-line max-len
      '<span>{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2}}}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      // eslint-disable-next-line max-len
      '<span>{"t1":{"r1":{"c1":1}},"t2":{"r1":{"c1":2}}}<button></button></span>',
    );

    unmount();
  });

  test('useTableIds', () => {
    const Test = () => didRender(JSON.stringify(useTableIds(store)));
    expect(store.getListenerStats().tableIds).toEqual(0);

    const {container, rerender, unmount} = render(<Test />);
    expect(store.getListenerStats().tableIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['t1']));

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['t1', 't2']));

    act(() => store.delTables());
    expect(container.textContent).toEqual('[]');
    rerender(<button />);
    expect(store.getListenerStats().tableIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useHasTable', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(JSON.stringify(useHasTable(tableId, store)));
    expect(store.getListenerStats().hasTable).toEqual(0);
    const {container, rerender, unmount} = render(<Test tableId="t0" />);
    expect(store.getListenerStats().hasTable).toEqual(1);
    expect(container.textContent).toEqual('false');

    rerender(<Test tableId="t1" />);
    expect(store.getListenerStats().hasTable).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}});
      rerender(<Test tableId="t2" />);
    });

    expect(store.getListenerStats().hasTable).toEqual(1);
    expect(container.textContent).toEqual('true');
    act(() => store.delTables());
    expect(container.textContent).toEqual('false');
    rerender(<button />);
    expect(store.getListenerStats().table).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useTable', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(JSON.stringify(useTable(tableId, store)));
    expect(store.getListenerStats().table).toEqual(0);
    const {container, rerender, unmount} = render(<Test tableId="t0" />);
    expect(store.getListenerStats().table).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({}));

    rerender(<Test tableId="t1" />);
    expect(store.getListenerStats().table).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 2}}));

    rerender(<Test tableId="t2" />);
    expect(store.getListenerStats().table).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 3}}));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));
    rerender(<button />);
    expect(store.getListenerStats().table).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useTableState', () => {
    const Test = () => {
      const [table, setTable] = useTableState('t1', store);
      return (
        <span>
          {JSON.stringify(table)}
          <button onClick={() => setTable({...table, r2: {c1: 2}})} />
        </span>
      );
    };

    store.setTable('t1', {r1: {c1: 1}});
    const {container, unmount} = render(<Test />);

    expect(container.innerHTML).toEqual(
      '<span>{"r1":{"c1":1}}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      '<span>{"r1":{"c1":1},"r2":{"c1":2}}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      '<span>{"r1":{"c1":1},"r2":{"c1":2}}<button></button></span>',
    );

    unmount();
  });

  test('useTableCellIds', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(JSON.stringify(useTableCellIds(tableId, store)));
    expect(store.getListenerStats().rowIds).toEqual(0);
    const {container, rerender, unmount} = render(<Test tableId="t0" />);

    expect(store.getListenerStats().tableCellIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test tableId="t1" />);

    expect(store.getListenerStats().tableCellIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    act(() =>
      store
        .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}})
        .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c2']));

    rerender(<Test tableId="t2" />);

    expect(store.getListenerStats().tableCellIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);
    expect(store.getListenerStats().tableCellIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useHasTableCell', () => {
    const Test = ({tableId, cellId}: {tableId: Id; cellId: Id}) =>
      didRender(JSON.stringify(useHasTableCell(tableId, cellId, store)));
    expect(store.getListenerStats().hasTableCell).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test tableId="t0" cellId="c0" />,
    );
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    expect(container.textContent).toEqual('false');

    rerender(<Test tableId="t1" cellId="c1" />);
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() =>
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}}),
    );
    expect(container.textContent).toEqual('true');

    rerender(<Test tableId="t1" cellId="c2" />);
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('false');
    rerender(<button />);
    expect(store.getListenerStats().hasTableCell).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useRowCount', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(useRowCount(tableId, store));
    expect(store.getListenerStats().rowCount).toEqual(0);
    const {container, rerender, unmount} = render(<Test tableId="t0" />);
    expect(store.getListenerStats().rowCount).toEqual(1);
    expect(container.textContent).toEqual('0');

    rerender(<Test tableId="t1" />);
    expect(store.getListenerStats().rowCount).toEqual(1);
    expect(container.textContent).toEqual('1');

    act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual('1');

    rerender(<Test tableId="t2" />);
    expect(store.getListenerStats().rowCount).toEqual(1);
    expect(container.textContent).toEqual('2');

    act(() => store.delTables());
    expect(container.textContent).toEqual('0');
    rerender(<button />);
    expect(store.getListenerStats().rowCount).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useRowIds', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(JSON.stringify(useRowIds(tableId, store)));
    expect(store.getListenerStats().rowIds).toEqual(0);
    const {container, rerender, unmount} = render(<Test tableId="t0" />);

    expect(store.getListenerStats().rowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test tableId="t1" />);
    expect(store.getListenerStats().rowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    rerender(<Test tableId="t2" />);
    expect(store.getListenerStats().rowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['r3', 'r4']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);
    expect(store.getListenerStats().rowIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useSortedRowIds', () => {
    const Test = ({
      tableId,
      cellId,
      descending,
      offset,
      limit,
    }: {
      tableId: Id;
      cellId: Id;
      descending: boolean;
      offset: number;
      limit: number | undefined;
    }) =>
      didRender(
        <>
          {JSON.stringify(
            useSortedRowIds(tableId, cellId, descending, offset, limit, store),
          )}
        </>,
      );
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test
        tableId="t0"
        cellId="c0"
        descending={false}
        offset={0}
        limit={undefined}
      />,
    );

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(
      <Test
        tableId="t1"
        cellId="c1"
        descending={false}
        offset={0}
        limit={undefined}
      />,
    );

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    rerender(
      <Test tableId="t2" cellId="c1" descending={true} offset={0} limit={2} />,
    );

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

    act(() => store.setRow('t2', 'r5', {c1: 5}));
    expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useSortedRowIds, object arg', () => {
    const Test = ({
      tableId,
      cellId,
      descending,
      offset,
      limit,
    }: {
      tableId: Id;
      cellId: Id;
      descending: boolean;
      offset: number;
      limit: number | undefined;
    }) =>
      didRender(
        <>
          {JSON.stringify(
            useSortedRowIds(
              {tableId, cellId, descending, offset, limit},
              store,
            ),
          )}
        </>,
      );
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test
        tableId="t0"
        cellId="c0"
        descending={false}
        offset={0}
        limit={undefined}
      />,
    );

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(
      <Test
        tableId="t1"
        cellId="c1"
        descending={false}
        offset={0}
        limit={undefined}
      />,
    );

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    act(() =>
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    rerender(
      <Test tableId="t2" cellId="c1" descending={true} offset={0} limit={2} />,
    );

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

    act(() => store.setRow('t2', 'r5', {c1: 5}));
    expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useHasRow', () => {
    const Test = ({tableId, rowId}: {tableId: Id; rowId: Id}) =>
      didRender(JSON.stringify(useHasRow(tableId, rowId, store)));
    expect(store.getListenerStats().hasRow).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test tableId="t0" rowId="r0" />,
    );

    expect(store.getListenerStats().hasRow).toEqual(1);
    expect(container.textContent).toEqual('false');

    rerender(<Test tableId="t1" rowId="r1" />);

    expect(store.getListenerStats().hasRow).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() =>
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
    );
    expect(container.textContent).toEqual('true');

    rerender(<Test tableId="t1" rowId="r2" />);

    expect(store.getListenerStats().hasRow).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('false');
    rerender(<button />);

    expect(store.getListenerStats().hasRow).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useRow', () => {
    const Test = ({tableId, rowId}: {tableId: Id; rowId: Id}) =>
      didRender(JSON.stringify(useRow(tableId, rowId, store)));
    expect(store.getListenerStats().row).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test tableId="t0" rowId="r0" />,
    );

    expect(store.getListenerStats().row).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({}));

    rerender(<Test tableId="t1" rowId="r1" />);

    expect(store.getListenerStats().row).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

    act(() =>
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

    rerender(<Test tableId="t1" rowId="r2" />);

    expect(store.getListenerStats().row).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify({}));
    rerender(<button />);

    expect(store.getListenerStats().row).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useCellIds', () => {
    const Test = ({tableId, rowId}: {tableId: Id; rowId: Id}) =>
      didRender(JSON.stringify(useCellIds(tableId, rowId, store)));
    expect(store.getListenerStats().cellIds).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test tableId="t0" rowId="r0" />,
    );

    expect(store.getListenerStats().cellIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test tableId="t1" rowId="r1" />);

    expect(store.getListenerStats().cellIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    act(() =>
      store
        .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}})
        .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c2']));

    rerender(<Test tableId="t1" rowId="r2" />);

    expect(store.getListenerStats().cellIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['c3', 'c4']));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(store.getListenerStats().cellIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useHasCell', () => {
    const Test = ({
      tableId,
      rowId,
      cellId,
    }: {
      tableId: Id;
      rowId: Id;
      cellId: Id;
    }) => didRender(JSON.stringify(useHasCell(tableId, rowId, cellId, store)));
    expect(store.getListenerStats().hasCell).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test tableId="t0" rowId="r0" cellId="c0" />,
    );

    expect(store.getListenerStats().hasCell).toEqual(1);
    expect(container.textContent).toEqual('false');

    rerender(<Test tableId="t1" rowId="r1" cellId="c1" />);

    expect(store.getListenerStats().hasCell).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() =>
      store
        .setTable('t1', {r1: {c1: 2, c2: 2}})
        .setTable('t1', {r1: {c1: 2, c2: 2}}),
    );
    expect(container.textContent).toEqual('true');

    rerender(<Test tableId="t1" rowId="r1" cellId="c2" />);

    expect(store.getListenerStats().hasCell).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('false');
    rerender(<button />);

    expect(store.getListenerStats().hasCell).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useCell', () => {
    const Test = ({
      tableId,
      rowId,
      cellId,
    }: {
      tableId: Id;
      rowId: Id;
      cellId: Id;
    }) => didRender(useCell(tableId, rowId, cellId, store));
    expect(store.getListenerStats().cell).toEqual(0);
    const {container, rerender, unmount} = render(
      <Test tableId="t0" rowId="r0" cellId="c0" />,
    );

    expect(store.getListenerStats().cell).toEqual(1);
    expect(container.textContent).toEqual('');

    rerender(<Test tableId="t1" rowId="r1" cellId="c1" />);

    expect(store.getListenerStats().cell).toEqual(1);
    expect(container.textContent).toEqual('1');

    act(() =>
      store
        .setTable('t1', {r1: {c1: 2, c2: 2}})
        .setTable('t1', {r1: {c1: 2, c2: 2}}),
    );
    expect(container.textContent).toEqual('2');

    rerender(<Test tableId="t1" rowId="r1" cellId="c2" />);

    expect(store.getListenerStats().cell).toEqual(1);
    expect(container.textContent).toEqual('2');

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');
    rerender(<button />);

    expect(store.getListenerStats().cell).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useCellState', () => {
    const Test = () => {
      const [cell, setCell] = useCellState('t1', 'r1', 'c1', store);
      return (
        <span>
          {cell}
          <button onClick={() => setCell(((cell as number) ?? 0) + 1)} />
        </span>
      );
    };

    store.setCell('t1', 'r1', 'c1', 0);
    const {container, unmount} = render(<Test />);

    expect(container.innerHTML).toEqual('<span>0<button></button></span>');

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual('<span>1<button></button></span>');

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual('<span>2<button></button></span>');

    unmount();
  });

  test('useRowState', () => {
    const Test = () => {
      const [row, setRow] = useRowState('t1', 'r1', store);
      return (
        <span>
          {JSON.stringify(row)}
          <button
            onClick={() => setRow({...row, c1: ((row.c1 as number) ?? 0) + 1})}
          />
        </span>
      );
    };

    store.setRow('t1', 'r1', {c1: 0, c2: 'a'});
    const {container, unmount} = render(<Test />);

    expect(container.innerHTML).toEqual(
      '<span>{"c1":0,"c2":"a"}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      '<span>{"c1":1,"c2":"a"}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      '<span>{"c1":2,"c2":"a"}<button></button></span>',
    );

    unmount();
  });

  test('useHasValues', () => {
    const Test = () => didRender(JSON.stringify(useHasValues(store)));
    expect(store.getListenerStats().hasValues).toEqual(0);

    const {container, rerender, unmount} = render(<Test />);
    expect(store.getListenerStats().hasValues).toEqual(1);
    expect(container.textContent).toEqual('true');

    store.setValues({v1: 2}).setValues({v1: 2});
    expect(container.textContent).toEqual('true');

    act(() => store.delValues());
    expect(container.textContent).toEqual('false');
    rerender(<button />);

    expect(store.getListenerStats().hasValues).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(2);

    unmount();
  });

  test('useValues', () => {
    const Test = () => didRender(JSON.stringify(useValues(store)));
    expect(store.getListenerStats().values).toEqual(0);

    const {container, rerender, unmount} = render(<Test />);
    expect(store.getListenerStats().values).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify({v1: 1}));

    act(() => store.setValues({v1: 2}).setValues({v1: 2}));
    expect(container.textContent).toEqual(JSON.stringify({v1: 2}));

    act(() => store.delValues());
    expect(container.textContent).toEqual(JSON.stringify({}));
    rerender(<button />);

    expect(store.getListenerStats().values).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useValuesState', () => {
    const Test = () => {
      const [values, setValues] = useValuesState(store);
      return (
        <span>
          {JSON.stringify(values)}
          <button onClick={() => setValues({...values, v2: 2})} />
        </span>
      );
    };

    store.setValues({v1: 1});
    const {container, unmount} = render(<Test />);

    expect(container.innerHTML).toEqual(
      '<span>{"v1":1}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      '<span>{"v1":1,"v2":2}<button></button></span>',
    );

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual(
      '<span>{"v1":1,"v2":2}<button></button></span>',
    );

    unmount();
  });

  test('useValueIds', () => {
    const Test = () => didRender(JSON.stringify(useValueIds(store)));
    expect(store.getListenerStats().valueIds).toEqual(0);

    const {container, rerender, unmount} = render(<Test />);
    expect(store.getListenerStats().valueIds).toEqual(1);
    expect(container.textContent).toEqual(JSON.stringify(['v1']));

    act(() => store.setValues({v1: 1, v2: 2}).setValues({v1: 1, v2: 2}));
    expect(container.textContent).toEqual(JSON.stringify(['v1', 'v2']));

    act(() => store.delValues());
    expect(container.textContent).toEqual('[]');
    rerender(<button />);

    expect(store.getListenerStats().valueIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useHasValue', () => {
    const Test = ({valueId}: {valueId: Id}) =>
      didRender(JSON.stringify(useHasValue(valueId, store)));
    expect(store.getListenerStats().hasValue).toEqual(0);
    const {container, rerender, unmount} = render(<Test valueId="v0" />);

    expect(store.getListenerStats().hasValue).toEqual(1);
    expect(container.textContent).toEqual('false');

    rerender(<Test valueId="v1" />);

    expect(store.getListenerStats().hasValue).toEqual(1);
    expect(container.textContent).toEqual('true');

    store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3});
    expect(container.textContent).toEqual('true');

    rerender(<Test valueId="v2" />);

    expect(store.getListenerStats().hasValue).toEqual(1);
    expect(container.textContent).toEqual('true');

    act(() => store.delValues());
    expect(container.textContent).toEqual('false');
    rerender(<button />);

    expect(store.getListenerStats().hasValue).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useValue', () => {
    const Test = ({valueId}: {valueId: Id}) =>
      didRender(JSON.stringify(useValue(valueId, store)));
    expect(store.getListenerStats().value).toEqual(0);
    const {container, rerender, unmount} = render(<Test valueId="v0" />);

    expect(store.getListenerStats().value).toEqual(1);
    expect(container.textContent).toEqual('');

    rerender(<Test valueId="v1" />);

    expect(store.getListenerStats().value).toEqual(1);
    expect(container.textContent).toEqual('1');

    act(() => store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3}));
    expect(container.textContent).toEqual('2');

    rerender(<Test valueId="v2" />);

    expect(store.getListenerStats().value).toEqual(1);
    expect(container.textContent).toEqual('3');

    act(() => store.delValues());
    expect(container.textContent).toEqual('');
    rerender(<button />);

    expect(store.getListenerStats().value).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useValueState', () => {
    const Test = () => {
      const [value, setValue] = useValueState('v1', store);
      return (
        <span>
          {JSON.stringify(value)}
          <button onClick={() => setValue(!value)} />
        </span>
      );
    };

    store.setValues({v1: false});
    const {container, unmount} = render(<Test />);

    expect(container.innerHTML).toEqual('<span>false<button></button></span>');

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual('<span>true<button></button></span>');

    act(() => fireEvent.click(container.querySelector('button') as Element));
    expect(container.innerHTML).toEqual('<span>false<button></button></span>');

    unmount();
  });

  test('useMetricIds', () => {
    const metrics = createMetrics(store);
    const Test = () => didRender(useMetricIds(metrics));

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    act(() =>
      metrics.setMetricDefinition('m1', 't1').setMetricDefinition('m2', 't2'),
    );
    expect(container.textContent).toEqual('m1m2');

    act(() => metrics.delMetricDefinition('m1'));
    expect(container.textContent).toEqual('m2');
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useMetric', () => {
    const metrics = createMetrics(store)
      .setMetricDefinition('m1', 't1')
      .setMetricDefinition('m2', 't1', 'max', 'c1')
      .setMetricDefinition('m3', 't3');
    const Test = ({metricId}: {metricId: Id}) =>
      didRender(useMetric(metricId, metrics));

    const {container, rerender, unmount} = render(<Test metricId="m0" />);

    expect(container.textContent).toEqual('');

    rerender(<Test metricId="m1" />);

    expect(container.textContent).toEqual('1');

    act(() => store.setCell('t1', 'r2', 'c1', 3).setCell('t1', 'r2', 'c1', 3));
    expect(container.textContent).toEqual('2');

    rerender(<Test metricId="m2" />);

    expect(container.textContent).toEqual('3');

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');

    rerender(<Test metricId="m3" />);

    expect(container.textContent).toEqual('');
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useIndexIds', () => {
    const indexes = createIndexes(store);
    const Test = () => didRender(useIndexIds(indexes));

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    act(() =>
      indexes.setIndexDefinition('i1', 't1').setIndexDefinition('i2', 't2'),
    );
    expect(container.textContent).toEqual('i1i2');

    act(() => indexes.delIndexDefinition('i1'));
    expect(container.textContent).toEqual('i2');
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useSliceIds', () => {
    const indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't1', 'c2')
      .setIndexDefinition('i3', 't3', 'c3');
    const Test = ({indexId}: {indexId: Id}) =>
      didRender(JSON.stringify(useSliceIds(indexId, indexes)));
    const {container, rerender, unmount} = render(<Test indexId="i0" />);

    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test indexId="i1" />);

    expect(container.textContent).toEqual(JSON.stringify(['1']));

    act(() =>
      store
        .setCell('t1', 'r2', 'c1', 2)
        .setCell('t1', 'r2', 'c1', 2)
        .setCell('t1', 'r2', 'c2', 3),
    );
    expect(container.textContent).toEqual(JSON.stringify(['1', '2']));

    rerender(<Test indexId="i2" />);

    expect(container.textContent).toEqual(JSON.stringify(['', '3']));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test indexId="i3" />);

    expect(container.textContent).toEqual(JSON.stringify([]));
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useSliceRowIds', () => {
    const indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't2', 'c2');
    const Test = ({indexId, sliceId}: {indexId: Id; sliceId: Id}) =>
      didRender(JSON.stringify(useSliceRowIds(indexId, sliceId, indexes)));
    const {container, rerender, unmount} = render(
      <Test indexId="i0" sliceId="0" />,
    );

    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test indexId="i1" sliceId="1" />);

    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    act(() =>
      store
        .setCell('t1', 'r2', 'c1', 1)
        .setCell('t1', 'r2', 'c1', 1)
        .setCell('t1', 'r3', 'c1', 2),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));

    rerender(<Test indexId="i1" sliceId="2" />);

    expect(container.textContent).toEqual(JSON.stringify(['r3']));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test indexId="i2" sliceId="2" />);

    expect(container.textContent).toEqual(JSON.stringify([]));
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useRelationshipIds', () => {
    const relationships = createRelationships(store);
    const Test = () => didRender(useRelationshipIds(relationships));

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    act(() =>
      relationships
        .setRelationshipDefinition('r1', 't1', 't2', 'c1')
        .setRelationshipDefinition('r2', 't2', 't2', 'c1'),
    );
    expect(container.textContent).toEqual('r1r2');

    act(() => relationships.delRelationshipDefinition('r1'));
    expect(container.textContent).toEqual('r2');
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useRemoteRowId', () => {
    const relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't2', 'T2', 'c2');

    const Test = ({
      relationshipId,
      localRowId,
    }: {
      relationshipId: Id;
      localRowId: Id;
    }) =>
      didRender(
        <>
          {JSON.stringify(
            useRemoteRowId(relationshipId, localRowId, relationships),
          )}
        </>,
      );
    const {container, rerender, unmount} = render(
      <Test relationshipId="r0" localRowId="r0" />,
    );

    expect(container.textContent).toEqual('');

    rerender(<Test relationshipId="r1" localRowId="r1" />);

    expect(container.textContent).toEqual(JSON.stringify('1'));

    act(() =>
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      }),
    );
    expect(container.textContent).toEqual(JSON.stringify('R1'));

    rerender(<Test relationshipId="r1" localRowId="r2" />);

    expect(container.textContent).toEqual(JSON.stringify('R2'));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');

    rerender(<Test relationshipId="r2" localRowId="r2" />);

    expect(container.textContent).toEqual('');
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useLocalRowIds', () => {
    const relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 'T1', 'c1')
      .setRelationshipDefinition('r2', 't2', 'T2', 'c2');
    const Test = ({
      relationshipId,
      remoteRowId,
    }: {
      relationshipId: Id;
      remoteRowId: Id;
    }) =>
      didRender(
        <>
          {JSON.stringify(
            useLocalRowIds(relationshipId, remoteRowId, relationships),
          )}
        </>,
      );
    const {container, rerender, unmount} = render(
      <Test relationshipId="r0" remoteRowId="R0" />,
    );

    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test relationshipId="r1" remoteRowId="R1" />);

    expect(container.textContent).toEqual(JSON.stringify([]));

    act(() =>
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      }),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2']));

    rerender(<Test relationshipId="r1" remoteRowId="R2" />);

    expect(container.textContent).toEqual(JSON.stringify(['r3']));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test relationshipId="r2" remoteRowId="R2" />);

    expect(container.textContent).toEqual(JSON.stringify([]));
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useLinkedRowIds', () => {
    const relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 't1', 'c1')
      .setRelationshipDefinition('r2', 't2', 't2', 'c2');
    const Test = ({
      relationshipId,
      firstRowId,
    }: {
      relationshipId: Id;
      firstRowId: Id;
    }) =>
      didRender(
        <>
          {JSON.stringify(
            useLinkedRowIds(relationshipId, firstRowId, relationships),
          )}
        </>,
      );
    const {container, rerender, unmount} = render(
      <Test relationshipId="r0" firstRowId="r0" />,
    );

    expect(container.textContent).toEqual(JSON.stringify(['r0']));

    rerender(<Test relationshipId="r1" firstRowId="r1" />);

    expect(container.textContent).toEqual(JSON.stringify(['r1', '1']));

    act(() =>
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      }),
    );
    expect(container.textContent).toEqual(
      JSON.stringify(['r1', 'r2', 'r3', 'r4']),
    );

    rerender(<Test relationshipId="r1" firstRowId="r2" />);

    expect(container.textContent).toEqual(JSON.stringify(['r2', 'r3', 'r4']));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify(['r2']));

    rerender(<Test relationshipId="r2" firstRowId="r2" />);

    expect(container.textContent).toEqual(JSON.stringify(['r2']));
    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useQueryIds', () => {
    const queries = createQueries(store);
    const Test = () => didRender(useQueryIds(queries));

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual('');

    act(() =>
      queries
        .setQueryDefinition('q1', 't1', noop)
        .setQueryDefinition('q2', 't2', noop),
    );
    expect(container.textContent).toEqual('q1q2');

    act(() => queries.delQueryDefinition('q1'));
    expect(container.textContent).toEqual('q2');
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useResultTable', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(JSON.stringify(useResultTable(queryId, queries)));
    const {container, rerender, unmount} = render(<Test queryId="q0" />);

    expect(container.textContent).toEqual(JSON.stringify({}));

    rerender(<Test queryId="q1" />);

    expect(container.textContent).toEqual(JSON.stringify({r1: {c1: 1}}));

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(
      JSON.stringify({r1: {c1: 2}, r2: {c1: 3}}),
    );

    rerender(<Test queryId="q2" />);

    expect(container.textContent).toEqual(JSON.stringify({r2: {c1: 3}}));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify({}));
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useResultTableCellIds', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(JSON.stringify(useResultTableCellIds(queryId, queries)));
    const {container, rerender, unmount} = render(<Test queryId="q0" />);

    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test queryId="q1" />);

    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    rerender(<Test queryId="q2" />);

    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useResultRowCount', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(useResultRowCount(queryId, queries));
    const {container, rerender, unmount} = render(<Test queryId="q0" />);

    expect(container.textContent).toEqual('0');

    rerender(<Test queryId="q1" />);

    expect(container.textContent).toEqual('1');

    act(() =>
      store
        .setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        })
        .setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        }),
    );
    expect(container.textContent).toEqual('3');

    rerender(<Test queryId="q2" />);

    expect(container.textContent).toEqual('2');

    act(() => store.delTables());
    expect(container.textContent).toEqual('0');
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useResultRowIds', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(JSON.stringify(useResultRowIds(queryId, queries)));
    const {container, rerender, unmount} = render(<Test queryId="q0" />);

    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test queryId="q1" />);

    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    act(() =>
      store
        .setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        })
        .setTables({
          t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}},
        }),
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1', 'r2', 'r3']));

    rerender(<Test queryId="q2" />);

    expect(container.textContent).toEqual(JSON.stringify(['r2', 'r3']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useResultSortedRowIds', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const Test = ({
      queryId,
      cellId,
      descending,
      offset,
      limit,
    }: {
      queryId: Id;
      cellId: Id;
      descending: boolean;
      offset: number;
      limit: number | undefined;
    }) =>
      didRender(
        <>
          {JSON.stringify(
            useResultSortedRowIds(
              queryId,
              cellId,
              descending,
              offset,
              limit,
              queries,
            ),
          )}
        </>,
      );
    const {container, rerender, unmount} = render(
      <Test
        queryId="q0"
        cellId="c0"
        descending={false}
        offset={0}
        limit={undefined}
      />,
    );
    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(
      <Test
        queryId="q1"
        cellId="c1"
        descending={false}
        offset={0}
        limit={undefined}
      />,
    );
    expect(container.textContent).toEqual(JSON.stringify(['r1']));

    act(() =>
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

    rerender(
      <Test queryId="q2" cellId="c2" descending={true} offset={0} limit={2} />,
    );
    expect(container.textContent).toEqual(JSON.stringify(['r4', 'r3']));

    act(() => store.setRow('t1', 'r5', {c1: 3, c2: 3}));
    expect(container.textContent).toEqual(JSON.stringify(['r5', 'r4']));

    act(() => store.delTables());
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useResultRow', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const Test = ({queryId, rowId}: {queryId: Id; rowId: Id}) =>
      didRender(JSON.stringify(useResultRow(queryId, rowId, queries)));
    const {container, rerender, unmount} = render(
      <Test queryId="q0" rowId="r0" />,
    );

    expect(container.textContent).toEqual(JSON.stringify({}));

    rerender(<Test queryId="q1" rowId="r1" />);

    expect(container.textContent).toEqual(JSON.stringify({c1: 1}));

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify({c1: 2}));

    rerender(<Test queryId="q2" rowId="r2" />);

    expect(container.textContent).toEqual(JSON.stringify({c1: 3}));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify({}));
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useResultCellIds', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        select('c3');
        where('c1', 3);
      });
    const Test = ({queryId, rowId}: {queryId: Id; rowId: Id}) =>
      didRender(JSON.stringify(useResultCellIds(queryId, rowId, queries)));
    const {container, rerender, unmount} = render(
      <Test queryId="q0" rowId="r0" />,
    );

    expect(container.textContent).toEqual(JSON.stringify([]));

    rerender(<Test queryId="q1" rowId="r1" />);

    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}}),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c1']));

    rerender(<Test queryId="q2" rowId="r2" />);

    expect(container.textContent).toEqual(JSON.stringify(['c1', 'c2']));

    act(() =>
      store.transaction(() =>
        store.delRow('t1', 'r2').setRow('t1', 'r2', {c2: 4, c1: 3, c3: 5}),
      ),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c1', 'c2', 'c3']));

    act(() =>
      queries.setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c3');
        select('c2');
        select('c1');
        where('c1', 3);
      }),
    );
    expect(container.textContent).toEqual(JSON.stringify(['c3', 'c2', 'c1']));

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual(JSON.stringify([]));
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useResultCell', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        select('c2');
        where('c1', 3);
      });
    const Test = ({
      queryId,
      rowId,
      cellId,
    }: {
      queryId: Id;
      rowId: Id;
      cellId: Id;
    }) => didRender(useResultCell(queryId, rowId, cellId, queries));
    const {container, rerender, unmount} = render(
      <Test queryId="q0" rowId="r0" cellId="c0" />,
    );

    expect(container.textContent).toEqual('');

    rerender(<Test queryId="q1" rowId="r1" cellId="c1" />);

    expect(container.textContent).toEqual('1');

    act(() =>
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}}),
    );
    expect(container.textContent).toEqual('2');

    rerender(<Test queryId="q2" rowId="r2" cellId="c2" />);

    expect(container.textContent).toEqual('4');

    act(() => store.delTable('t1'));
    expect(container.textContent).toEqual('');
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useParamValues', () => {
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as Cell);
      },
      {p1: 1, p2: 'test'},
    );
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(JSON.stringify(useParamValues(queryId, queries)));
    const {container, rerender, unmount} = render(<Test queryId="q0" />);

    expect(container.textContent).toEqual('{}');

    rerender(<Test queryId="q1" />);

    expect(container.textContent).toEqual('{"p1":1,"p2":"test"}');

    act(() => queries.setParamValue('q1', 'p1', 2));
    expect(container.textContent).toEqual('{"p1":2,"p2":"test"}');

    act(() => queries.setParamValues('q1', {p1: 3, p2: 'updated'}));
    expect(container.textContent).toEqual('{"p1":3,"p2":"updated"}');

    act(() => queries.delQueryDefinition('q1'));
    expect(container.textContent).toEqual('{}');
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useParamValue', () => {
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as Cell);
      },
      {p1: 1, p2: 'test'},
    );
    const Test = ({queryId, paramId}: {queryId: Id; paramId: Id}) =>
      didRender(useParamValue(queryId, paramId, queries));
    const {container, rerender, unmount} = render(
      <Test queryId="q0" paramId="p0" />,
    );

    expect(container.textContent).toEqual('');

    rerender(<Test queryId="q1" paramId="p1" />);

    expect(container.textContent).toEqual('1');

    act(() => queries.setParamValue('q1', 'p1', 2));
    expect(container.textContent).toEqual('2');

    rerender(<Test queryId="q1" paramId="p2" />);

    expect(container.textContent).toEqual('test');

    act(() => queries.setParamValue('q1', 'p2', 'updated'));
    expect(container.textContent).toEqual('updated');

    act(() => queries.delQueryDefinition('q1'));
    expect(container.textContent).toEqual('');
    rerender(<button />);

    expect(didRender).toHaveBeenCalledTimes(6);

    unmount();
  });

  test('useParamValue with array changes', () => {
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where((getTableCell) => {
          const p = param('p1');
          return Array.isArray(p)
            ? (p as string[]).includes(getTableCell('c1') as string)
            : getTableCell('c1') === p;
        });
      },
      {p1: 'a'},
    );
    const Test = ({queryId, paramId}: {queryId: Id; paramId: Id}) =>
      didRender(JSON.stringify(useParamValue(queryId, paramId, queries)));
    const {container, unmount} = render(<Test queryId="q1" paramId="p1" />);

    expect(container.textContent).toEqual('"a"');

    act(() => queries.setParamValue('q1', 'p1', ['a', 'c']));
    expect(container.textContent).toEqual('["a","c"]');

    act(() => queries.setParamValue('q1', 'p1', ['b', 'd']));
    expect(container.textContent).toEqual('["b","d"]');

    act(() => queries.setParamValue('q1', 'p1', 'e'));
    expect(container.textContent).toEqual('"e"');

    expect(didRender).toHaveBeenCalledTimes(4);

    unmount();
  });

  test('useSetParamValueCallback', () => {
    const queries = createQueries(store);
    queries.setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as Cell);
      },
      {p1: 1},
    );

    const then = vi.fn((_queries: any, _paramValue: any) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

    const Test = ({
      multiplier,
      then,
    }: {
      readonly multiplier: number;
      readonly then: (queries: any, paramValue: any) => void;
    }) => {
      const handler = useSetParamValueCallback<MouseEvent<HTMLButtonElement>>(
        'q1',
        'p1',
        (e) => e.screenX * multiplier,
        [multiplier],
        queries,
        then,
      );
      handlers[multiplier] = handler;
      return <button onClick={handler} />;
    };

    const {getByRole, rerender, unmount} = render(
      <Test multiplier={2} then={then} />,
    );

    act(() => store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 3}}}));
    expect(queries.getResultTable('q1')).toEqual({r1: {c1: 1}});

    fireEvent.click(getByRole('button'), {screenX: 1});
    expect(queries.getResultTable('q1')).toEqual({r2: {c1: 2}});
    expect(then).toHaveBeenCalledWith(queries, 2);

    rerender(<Test multiplier={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    fireEvent.click(getByRole('button'), {screenX: 1});
    expect(queries.getResultTable('q1')).toEqual({r3: {c1: 3}});
    expect(then).toHaveBeenCalledWith(queries, 3);

    unmount();
  });

  test('useSetParamValueCallback, parameterized Ids', () => {
    const queries = createQueries(store);
    queries
      .setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p1') as Cell);
        },
        {p1: 1},
      )
      .setQueryDefinition(
        'q2',
        't1',
        ({select, where, param}) => {
          select('c1');
          where('c1', param('p2') as Cell);
        },
        {p2: 1},
      );

    const then = vi.fn((_queries: any, _paramValue: any) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

    const Test = ({
      multiplier,
      then,
    }: {
      readonly multiplier: number;
      readonly then: (queries: any, paramValue: any) => void;
    }) => {
      const handler = useSetParamValueCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 'q' + e.screenY,
        (e) => 'p' + e.screenY,
        (e) => e.screenX * multiplier,
        [multiplier],
        queries,
        then,
      );
      handlers[multiplier] = handler;
      return <button onClick={handler} />;
    };

    const {getByRole, rerender, unmount} = render(
      <Test multiplier={2} then={then} />,
    );

    act(() => store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 3}}}));

    fireEvent.click(getByRole('button'), {screenX: 1, screenY: 1});
    expect(queries.getResultTable('q1')).toEqual({r2: {c1: 2}});
    expect(then).toHaveBeenCalledWith(queries, 2);

    fireEvent.click(getByRole('button'), {screenX: 1, screenY: 2});
    expect(queries.getResultTable('q2')).toEqual({r2: {c1: 2}});
    expect(then).toHaveBeenCalledWith(queries, 2);

    rerender(<Test multiplier={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetParamValuesCallback', () => {
    const queries = createQueries(store);
    queries.setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where(
          (getCell) => (getCell('c1') as number) >= (param('min') as number),
        );
        where(
          (getCell) => (getCell('c1') as number) <= (param('max') as number),
        );
      },
      {min: 3, max: 5},
    );

    const then = vi.fn((_queries: any, _paramValues: any) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

    const Test = ({
      multiplier,
      then,
    }: {
      readonly multiplier: number;
      readonly then: (queries: any, paramValues: any) => void;
    }) => {
      const handler = useSetParamValuesCallback<MouseEvent<HTMLButtonElement>>(
        'q1',
        (e) => ({
          min: e.screenX * multiplier,
          max: e.screenY * multiplier,
        }),
        [multiplier],
        queries,
        then,
      );
      handlers[multiplier] = handler;
      return <button onClick={handler} />;
    };

    const {getByRole, rerender, unmount} = render(
      <Test multiplier={2} then={then} />,
    );

    act(() =>
      store.setTables({
        t1: {
          r1: {c1: 1},
          r2: {c1: 2},
          r3: {c1: 3},
          r4: {c1: 4},
          r5: {c1: 5},
          r6: {c1: 6},
          r7: {c1: 7},
          r8: {c1: 8},
          r9: {c1: 9},
        },
      }),
    );
    expect(queries.getResultTable('q1')).toEqual({
      r3: {c1: 3},
      r4: {c1: 4},
      r5: {c1: 5},
    });

    fireEvent.click(getByRole('button'), {screenX: 1, screenY: 2});
    expect(queries.getResultTable('q1')).toEqual({
      r2: {c1: 2},
      r3: {c1: 3},
      r4: {c1: 4},
    });
    expect(then).toHaveBeenCalledWith(queries, {min: 2, max: 4});

    rerender(<Test multiplier={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    fireEvent.click(getByRole('button'), {screenX: 0, screenY: 1});
    expect(queries.getResultTable('q1')).toEqual({
      r1: {c1: 1},
      r2: {c1: 2},
      r3: {c1: 3},
    });
    expect(then).toHaveBeenCalledWith(queries, {min: 0, max: 3});
    unmount();
  });

  test('useSetParamValuesCallback, parameterized queryId', () => {
    const queries = createQueries(store);
    queries
      .setQueryDefinition(
        'q1',
        't1',
        ({select, where, param}) => {
          select('c1');
          where((getCell) => getCell('c1') === param('value'));
        },
        {value: 1},
      )
      .setQueryDefinition(
        'q2',
        't1',
        ({select, where, param}) => {
          select('c1');
          where((getCell) => getCell('c1') === param('value'));
        },
        {value: 1},
      );

    const then = vi.fn((_queries: any, _paramValues: any) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];

    const Test = ({
      multiplier,
      then,
    }: {
      readonly multiplier: number;
      readonly then: (queries: any, paramValues: any) => void;
    }) => {
      const handler = useSetParamValuesCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 'q' + e.screenY,
        (e) => ({value: e.screenX * multiplier}),
        [multiplier],
        queries,
        then,
      );
      handlers[multiplier] = handler;
      return <button onClick={handler} />;
    };

    const {getByRole, rerender, unmount} = render(
      <Test multiplier={2} then={then} />,
    );

    act(() => store.setTables({t1: {r1: {c1: 1}, r2: {c1: 2}, r3: {c1: 3}}}));

    fireEvent.click(getByRole('button'), {screenX: 1, screenY: 1});
    expect(queries.getResultTable('q1')).toEqual({r2: {c1: 2}});
    expect(then).toHaveBeenCalledWith(queries, {value: 2});

    fireEvent.click(getByRole('button'), {screenX: 1, screenY: 2});
    expect(queries.getResultTable('q2')).toEqual({r2: {c1: 2}});
    expect(then).toHaveBeenCalledWith(queries, {value: 2});

    rerender(<Test multiplier={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useCheckpointIds', () => {
    const checkpoints = createCheckpoints(store);
    const Test = () => didRender(JSON.stringify(useCheckpointIds(checkpoints)));

    const {container, unmount} = render(<Test />);
    expect(container.textContent).toEqual(JSON.stringify([[], '0', []]));

    act(() => store.setTables({t1: {r1: {c1: 2}}}));
    expect(container.textContent).toEqual(
      JSON.stringify([['0'], undefined, []]),
    );

    act(() => checkpoints.addCheckpoint());
    expect(container.textContent).toEqual(JSON.stringify([['0'], '1', []]));
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });

  test('useUndoInformation', async () => {
    const checkpoints = createCheckpoints(store);
    const Test = () => {
      const [canUndo, handleUndo, undoCheckpointId, undoLabel] =
        useUndoInformation(checkpoints);
      return didRender(
        <button onClick={handleUndo}>
          {JSON.stringify([canUndo, undoCheckpointId, undoLabel])}
        </button>,
      );
    };

    const {getByRole, unmount} = render(<Test />);
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([false, '0', '']),
    );

    act(() => store.setTables({t1: {r1: {c1: 2}}}));
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([true, null, '']),
    );

    await act(() => userEvent.click(getByRole('button')));
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([false, '0', '']),
    );

    act(() => {
      store.setTables({t1: {r1: {c1: 3}}});
      checkpoints.addCheckpoint('one');
    });
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([true, '2', 'one']),
    );

    await act(() => userEvent.click(getByRole('button')));
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([false, '0', '']),
    );
    expect(didRender).toHaveBeenCalledTimes(5);

    unmount();
  });

  test('useRedoInformation', async () => {
    const checkpoints = createCheckpoints(store);
    const Test = () => {
      const [canRedo, handleRedo, redoCheckpointId, redoLabel] =
        useRedoInformation(checkpoints);
      return didRender(
        <button onClick={handleRedo}>
          {JSON.stringify([canRedo, redoCheckpointId, redoLabel])}
        </button>,
      );
    };

    const {getByRole, unmount} = render(<Test />);
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([false, null, '']),
    );

    await act(() => userEvent.click(getByRole('button')));
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([false, null, '']),
    );

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}});
      checkpoints.addCheckpoint('one');
      checkpoints.goBackward();
    });
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([true, '1', 'one']),
    );

    await act(() => userEvent.click(getByRole('button')));
    expect(getByRole('button').textContent).toEqual(
      JSON.stringify([false, null, '']),
    );
    expect(didRender).toHaveBeenCalledTimes(3);

    unmount();
  });
});

describe('Write Hooks', () => {
  test('useSetTablesCallback', () => {
    const then = vi.fn((_store?: Store, _tables?: Tables) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, tables?: Tables) => void;
    }) => {
      const handler = useSetTablesCallback<MouseEvent<HTMLButtonElement>>(
        (e) => ({t1: {r1: {c1: e.screenX * value}}}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {t1: {r1: {c1: 4}}});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetTableCallback (including handler memo)', () => {
    const then = vi.fn((_store?: Store, _table?: Table) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    let previousHandler: any;
    let handlerChanged = 0;
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, table?: Table) => void;
    }) => {
      const handler = useSetTableCallback<MouseEvent<HTMLButtonElement>>(
        't1',
        (e) => ({r1: {c1: e.screenX * value}}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      if (handler != previousHandler) {
        handlerChanged++;
        previousHandler = handler;
      }
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );
    expect(handlerChanged).toEqual(1);

    rerender(<Test value={2} then={then} />);
    expect(handlerChanged).toEqual(1);

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

    rerender(<Test value={3} then={then} />);

    expect(handlerChanged).toEqual(2);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetTableCallback, parameterized Id (incl handler memo)', () => {
    const then = vi.fn((_store?: Store, _table?: Table) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    let previousHandler: any;
    let handlerChanged = 0;
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, table?: Table) => void;
    }) => {
      const handler = useSetTableCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 't' + e.screenY,
        (e) => ({r1: {c1: e.screenX * value}}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      if (handler != previousHandler) {
        handlerChanged++;
        previousHandler = handler;
      }
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );
    expect(handlerChanged).toEqual(1);

    rerender(<Test value={2} then={then} />);
    expect(handlerChanged).toEqual(1);

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

    rerender(<Test value={3} then={then} />);

    expect(handlerChanged).toEqual(2);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetRowCallback', () => {
    const then = vi.fn((_store: Store, _row: Row) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => {
      const handler = useSetRowCallback<MouseEvent<HTMLButtonElement>>(
        't1',
        'r1',
        (e) => ({c1: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c1: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetRowCallback, parameterized Ids', () => {
    const then = vi.fn((_store: Store, _row: Row) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => {
      const handler = useSetRowCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 't' + e.screenY,
        (e) => 'r' + e.screenY,
        (e) => ({c1: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c1: 4});

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r2: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c1: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useAddRowCallback', () => {
    const then = vi.fn(
      (_rowId: Id | undefined, _store: Store, _row: Row) => null,
    );
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (rowId: Id | undefined, store: Store, row: Row) => void;
    }) => {
      const handler = useAddRowCallback<MouseEvent<HTMLButtonElement>>(
        't1',
        (e) => ({c1: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return (
        <button
          onClick={handler}
          onMouseDown={useAddRowCallback(
            't1',
            (e) => ({c1: e.screenX * value}),
            [value],
            store,
          )}
          onMouseMove={useAddRowCallback(
            't1',
            (e) => ({c1: e.screenX}),
            undefined,
            store,
          )}
          onMouseUp={useAddRowCallback(
            't1',
            (e) => ({c1: e.screenX}),
            undefined,
            store,
            undefined,
            undefined,
            false,
          )}
        />
      );
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    const button = getByRole('button');
    fireEvent.click(button, {screenX: 2});
    fireEvent.mouseDown(button, {screenX: 3});
    fireEvent.mouseMove(button, {screenX: 5});
    fireEvent.mouseUp(button, {screenX: 7});

    expect(store.getTables()).toEqual({
      t1: {'0': {c1: 4}, '1': {c1: 6}, '2': {c1: 5}, '3': {c1: 7}, r1: {c1: 1}},
    });
    expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

    store.delRow('t1', '3');
    fireEvent.mouseMove(getByRole('button'), {screenX: 5});
    expect(store.getTables()).toEqual({
      t1: {'0': {c1: 4}, '1': {c1: 6}, '2': {c1: 5}, '3': {c1: 5}, r1: {c1: 1}},
    });

    store.delRow('t1', '3');
    fireEvent.mouseUp(getByRole('button'), {screenX: 5});
    expect(store.getTables()).toEqual({
      t1: {'0': {c1: 4}, '1': {c1: 6}, '2': {c1: 5}, '4': {c1: 5}, r1: {c1: 1}},
    });

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useAddRowCallback, parameterized Id', () => {
    const then = vi.fn(
      (_rowId: Id | undefined, _store: Store, _row: Row) => null,
    );
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (rowId: Id | undefined, store: Store, row: Row) => void;
    }) => {
      const handler = useAddRowCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 't' + e.screenY,
        (e) => ({c1: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}, '0': {c1: 4}}});
    expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1}, '0': {c1: 4}},
      t2: {'0': {c1: 4}},
    });
    expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetPartialRowCallback', () => {
    const then = vi.fn((_store: Store, _row: Row) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => {
      const handler = useSetPartialRowCallback<MouseEvent<HTMLButtonElement>>(
        't1',
        'r1',
        (e) => ({c2: e.screenX * value, c3: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 4, c3: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetPartialRowCallback, parameterized Ids', () => {
    const then = vi.fn((_store: Store, _row: Row) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => {
      const handler = useSetPartialRowCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 't' + e.screenY,
        (e) => 'r' + e.screenY,
        (e) => ({c2: e.screenX * value, c3: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 4, c3: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1, c2: 4, c3: 4}},
      t2: {r2: {c2: 4, c3: 4}},
    });
    expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetCellCallback', () => {
    const then = vi.fn((_store: Store, _cell: Cell | MapCell) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, cell: Cell | MapCell) => void;
    }) => {
      const handler = useSetCellCallback<MouseEvent<HTMLButtonElement>>(
        't1',
        'r1',
        'c1',
        (e) => e.screenX * value,
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, 4);

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetCellCallback, parameterized Ids', () => {
    const then = vi.fn((_store: Store, _cell: Cell | MapCell) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, cell: Cell | MapCell) => void;
    }) => {
      const handler = useSetCellCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 't' + e.screenY,
        (e) => 'r' + e.screenY,
        (e) => 'c' + e.screenY,
        (e) => e.screenX * value,
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, 4);

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r2: {c2: 4}}});
    expect(then).toHaveBeenCalledWith(store, 4);

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetValuesCallback', () => {
    const then = vi.fn((_store?: Store, _values?: Values) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, values?: Values) => void;
    }) => {
      const handler = useSetValuesCallback<MouseEvent<HTMLButtonElement>>(
        (e) => ({v1: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };

    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getValues()).toEqual({v1: 4});
    expect(then).toHaveBeenCalledWith(store, {v1: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetPartialValuesCallback', () => {
    const then = vi.fn((_store: Store, _values: Values) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, values: Values) => void;
    }) => {
      const handler = useSetPartialValuesCallback<
        MouseEvent<HTMLButtonElement>
      >(
        (e) => ({v2: e.screenX * value, v3: e.screenX * value}),
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getValues()).toEqual({v1: 1, v2: 4, v3: 4});
    expect(then).toHaveBeenCalledWith(store, {v2: 4, v3: 4});

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetValueCallback', () => {
    const then = vi.fn((_store?: Store, _value?: Value | MapValue) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, value?: Value | MapValue) => void;
    }) => {
      const handler = useSetValueCallback<MouseEvent<HTMLButtonElement>>(
        'v1',
        (e) => e.screenX * value,
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2});
    expect(store.getValues()).toEqual({v1: 4});
    expect(then).toHaveBeenCalledWith(store, 4);

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useSetValueCallback, parameterized Id', () => {
    const then = vi.fn((_store?: Store, _value?: Value | MapValue) => null);
    const handlers: MouseEventHandler<HTMLButtonElement>[] = [];
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, value?: Value | MapValue) => void;
    }) => {
      const handler = useSetValueCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 'v' + e.screenY,
        (e) => e.screenX * value,
        [value],
        store,
        then,
      );
      handlers[value] = handler;
      return <button onClick={handler} />;
    };
    const {getByRole, rerender, unmount} = render(
      <Test value={2} then={then} />,
    );

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 1});
    expect(store.getValues()).toEqual({v1: 4});
    expect(then).toHaveBeenCalledWith(store, 4);

    fireEvent.click(getByRole('button'), {screenX: 2, screenY: 2});
    expect(store.getValues()).toEqual({v1: 4, v2: 4});
    expect(then).toHaveBeenCalledWith(store, 4);

    rerender(<Test value={3} then={then} />);
    expect(handlers[2]).not.toEqual(handlers[3]);

    unmount();
  });

  test('useDelTablesCallback', async () => {
    const Test = () => <button onClick={useDelTablesCallback(store)} />;

    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'));
    expect(store.getTables()).toEqual({});

    unmount();
  });

  test('useDelTableCallback', async () => {
    const Test = () => <button onClick={useDelTableCallback('t1', store)} />;

    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'));
    expect(store.getTables()).toEqual({});

    unmount();
  });

  test('useDelTableCallback, parameterized Id (including handler memo)', () => {
    let previousHandler: any;
    let handlerChanged = 0;
    const Test = () => {
      const handler = useDelTableCallback<MouseEvent<HTMLButtonElement>>(
        (e) => 't' + e.screenX,
        store,
      );
      if (handler != previousHandler) {
        handlerChanged++;
        previousHandler = handler;
      }
      return <button onClick={handler} />;
    };

    const {getByRole, unmount} = render(<Test />);

    expect(handlerChanged).toEqual(1);

    fireEvent.click(getByRole('button'), {screenX: 0});
    expect(handlerChanged).toEqual(1);

    fireEvent.click(getByRole('button'), {screenX: 1});
    expect(store.getTables()).toEqual({});
    expect(handlerChanged).toEqual(1);

    unmount();
  });

  test('useDelRowCallback', async () => {
    const Test = () => (
      <button onClick={useDelRowCallback('t1', 'r1', store)} />
    );

    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'));
    expect(store.getTables()).toEqual({});

    unmount();
  });

  test('useDelRowCallback, parameterized Ids', () => {
    const Test = () => (
      <button
        onClick={useDelRowCallback(
          (e) => 't' + e.screenX,
          (e) => 'r' + e.screenX,
          store,
        )}
      />
    );

    store.setCell('t1', 'r2', 'c2', 2);
    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'), {screenX: 0});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}, r2: {c2: 2}}});

    fireEvent.click(getByRole('button'), {screenX: 1});
    expect(store.getTables()).toEqual({t1: {r2: {c2: 2}}});

    unmount();
  });

  test('useDelCellCallback', async () => {
    const Test = () => (
      <button onClick={useDelCellCallback('t1', 'r1', 'c1', false, store)} />
    );

    const {getByRole, unmount} = render(<Test />);
    fireEvent.click(getByRole('button'));
    expect(store.getTables()).toEqual({});

    unmount();
  });

  test('useDelCellCallback, parameterized Ids', async () => {
    const Test = () => (
      <button
        onClick={useDelCellCallback(
          (e) => 't' + e.screenX,
          (e) => 'r' + e.screenX,
          (e) => 'c' + e.screenX,
          false,
          store,
        )}
      />
    );
    store.setCell('t1', 'r1', 'c2', 2);

    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'), {screenX: 0});
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 2}}});

    fireEvent.click(getByRole('button'), {screenX: 1});
    expect(store.getTables()).toEqual({t1: {r1: {c2: 2}}});

    unmount();
  });

  test('useDelValuesCallback', async () => {
    const Test = () => <button onClick={useDelValuesCallback(store)} />;

    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'));
    expect(store.getValues()).toEqual({});

    unmount();
  });

  test('useDelValueCallback', async () => {
    const Test = () => <button onClick={useDelValueCallback('v1', store)} />;

    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'));
    expect(store.getValues()).toEqual({});

    unmount();
  });

  test('useDelValueCallback, parameterized Id', () => {
    const Test = () => (
      <button onClick={useDelValueCallback((e) => 'v' + e.screenX, store)} />
    );
    store.setValue('v2', 2);
    const {getByRole, unmount} = render(<Test />);

    fireEvent.click(getByRole('button'), {screenX: 0});
    expect(store.getValues()).toEqual({v1: 1, v2: 2});

    fireEvent.click(getByRole('button'), {screenX: 1});
    expect(store.getValues()).toEqual({v2: 2});

    unmount();
  });

  describe('Checkpoints', () => {
    let checkpoints: Checkpoints;

    beforeEach(() => {
      checkpoints = createCheckpoints(store);
      store.setCell('t1', 'r1', 'c1', 2);
      checkpoints.addCheckpoint();
      store.setCell('t1', 'r1', 'c1', 3);
      checkpoints.addCheckpoint();
    });

    test('useSetCheckpointCallback without label', () => {
      const then = vi.fn(
        (_checkpointId: Id, _checkpoints: Checkpoints, _label?: string) => null,
      );
      const Test = ({
        then,
      }: {
        readonly then?: (
          checkpointId: Id,
          checkpoints: Checkpoints,
          label?: string,
        ) => void;
      }) => (
        <button
          onClick={useSetCheckpointCallback(
            undefined,
            undefined,
            checkpoints,
            then,
          )}
        />
      );

      const {getByRole, unmount} = render(<Test then={then} />);
      store.setCell('t1', 'r1', 'c1', 4);

      fireEvent.click(getByRole('button'), {type: 'a'});
      expect(checkpoints.getCheckpointIds()).toEqual([
        ['0', '1', '2'],
        '3',
        [],
      ]);
      expect(checkpoints.getCheckpoint('3')).toEqual('');
      expect(then).toHaveBeenCalledWith('3', checkpoints, undefined);

      unmount();
    });

    test('useSetCheckpointCallback with label', () => {
      const then = vi.fn(
        (_checkpointId: Id, _checkpoints: Checkpoints, _label?: string) => null,
      );
      const handlers: {[suffix: string]: MouseEventHandler<HTMLButtonElement>} =
        {};
      const Test = ({
        suffix,
        then,
      }: {
        readonly suffix: string;
        readonly then?: (
          checkpointId: Id,
          checkpoints: Checkpoints,
          label?: string,
        ) => void;
      }) => {
        const handler = useSetCheckpointCallback<MouseEvent<HTMLButtonElement>>(
          (e) => e.type + suffix,
          [suffix],
          checkpoints,
          then,
        );
        handlers[suffix] = handler;
        return <button onClick={handler} />;
      };

      const {getByRole, rerender, unmount} = render(
        <Test suffix="." then={then} />,
      );
      store.setCell('t1', 'r1', 'c1', 4);

      fireEvent.click(getByRole('button'));
      expect(checkpoints.getCheckpointIds()).toEqual([
        ['0', '1', '2'],
        '3',
        [],
      ]);
      expect(checkpoints.getCheckpoint('3')).toEqual('click.');
      expect(then).toHaveBeenCalledWith('3', checkpoints, 'click.');

      rerender(<Test suffix="!" />);

      expect(handlers['.']).not.toEqual(handlers['!']);

      unmount();
    });

    test('useGoBackwardCallback', () => {
      const Test = () => (
        <button onClick={useGoBackwardCallback(checkpoints)} />
      );
      const {getByRole, unmount} = render(<Test />);

      fireEvent.click(getByRole('button'));
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
      fireEvent.click(getByRole('button'));
      expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1', '2']]);

      unmount();
    });

    test('useGoForwardCallback', () => {
      const Test = () => <button onClick={useGoForwardCallback(checkpoints)} />;
      const {getByRole, unmount} = render(<Test />);

      checkpoints.goTo('0');

      fireEvent.click(getByRole('button'));
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
      fireEvent.click(getByRole('button'));
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      unmount();
    });

    test('useGoToCallback', () => {
      const then = vi.fn(
        (_checkpoints: Checkpoints, _checkpointId: Id) => null,
      );
      const Test = ({
        then,
      }: {
        readonly then: (checkpoints: Checkpoints, checkpointId: Id) => void;
      }) => (
        <button
          onClick={useGoToCallback(
            (e) => e.screenX + '',
            undefined,
            checkpoints,
            then,
          )}
        />
      );
      const {getByRole, unmount} = render(<Test then={then} />);
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
      expect(then).toHaveBeenCalledWith(checkpoints, '1');

      unmount();
    });

    test('useGoToCallback (no then)', () => {
      const Test = () => (
        <button
          onClick={useGoToCallback(
            (e) => e.screenX + '',
            undefined,
            checkpoints,
          )}
        />
      );
      const {getByRole, unmount} = render(<Test />);
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      fireEvent.click(getByRole('button'), {screenX: 1});
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);

      unmount();
    });
  });
});

describe('Listener Hooks', () => {
  test('useHasTablesListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasTablesListener(
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasTables).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasTables).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasTables).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasTables).toEqual(0);

    unmount();
  });

  test('useTablesListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useTablesListener(
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().tables).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().tables).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().tables).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().tables).toEqual(0);

    unmount();
  });

  test('useTableIdsListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useTableIdsListener(
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().tableIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().tableIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t2', 'r1', 'c1', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().tableIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t3', 'r1', 'c1', 0);
    rerender(<button />);

    expect(store.getListenerStats().tableIds).toEqual(0);

    unmount();
  });

  test('useHasTableListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasTableListener(
        't1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasTable).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasTable).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasTable).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasTable).toEqual(0);

    unmount();
  });

  test('useTableListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useTableListener(
        't1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().table).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().table).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().table).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().table).toEqual(0);

    unmount();
  });

  test('useTableCellIdsListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useTableCellIdsListener(
        't1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().tableCellIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().tableCellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r1', 'c2', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().tableCellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r1', 'c3', 0);
    rerender(<button />);

    expect(store.getListenerStats().tableCellIds).toEqual(0);

    unmount();
  });

  test('useHasTableCellListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasTableCellListener(
        't1',
        'c1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasTableCell).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasTableCell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasTableCell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasTableCell).toEqual(0);

    unmount();
  });

  test('useRowCountListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useRowCountListener(
        't1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().rowCount).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().rowCount).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().rowCount).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    rerender(<button />);

    expect(store.getListenerStats().rowCount).toEqual(0);

    unmount();
  });

  test('useRowIdsListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useRowIdsListener(
        't1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().rowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().rowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().rowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    rerender(<button />);

    expect(store.getListenerStats().rowIds).toEqual(0);

    unmount();
  });

  test('useSortedRowIdsListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useSortedRowIdsListener(
        't1',
        'c1',
        false,
        0,
        undefined,
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    rerender(<button />);

    expect(store.getListenerStats().sortedRowIds).toEqual(0);

    unmount();
  });

  test('useSortedRowIdsListener, object arg', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useSortedRowIdsListener(
        {tableId: 't1', cellId: 'c1'},
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    rerender(<button />);

    expect(store.getListenerStats().sortedRowIds).toEqual(0);

    unmount();
  });

  test('useHasRowListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasRowListener(
        't1',
        'r1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasRow).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasRow).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasRow).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasRow).toEqual(0);

    unmount();
  });

  test('useRowListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useRowListener(
        't1',
        'r1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().row).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().row).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().row).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().row).toEqual(0);

    unmount();
  });

  test('useCellIdsListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useCellIdsListener(
        't1',
        'r1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().cellIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().cellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r1', 'c2', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().cellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r1', 'c3', 0);
    rerender(<button />);

    expect(store.getListenerStats().cellIds).toEqual(0);

    unmount();
  });

  test('useHasCellListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasCellListener(
        't1',
        'r1',
        'c1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasCell).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasCell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasCell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasCell).toEqual(0);

    unmount();
  });

  test('useCellListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useCellListener(
        't1',
        'r1',
        'c1',
        (store) => expect(store?.getCell('t1', 'r1', 'c1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().cell).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().cell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().cell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(store.getListenerStats().cell).toEqual(0);

    unmount();
  });

  test('useHasValuesListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasValuesListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasValues).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasValues).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasValues).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasValues).toEqual(0);

    unmount();
  });

  test('useValuesListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useValuesListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().values).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().values).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().values).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().values).toEqual(0);

    unmount();
  });

  test('useValueIdsListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useValueIdsListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().valueIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().valueIds).toEqual(1);
    store.setValue('v1', 2).setValue('v2', 0);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().valueIds).toEqual(1);
    store.setValue('v1', 3).setValue('v3', 0);
    rerender(<button />);

    expect(store.getListenerStats().valueIds).toEqual(0);

    unmount();
  });

  test('useHasValueListener', () => {
    expect.assertions(4);
    const Test = ({value}: {readonly value: number}) => {
      useHasValueListener(
        'v1',
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().hasValue).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().hasValue).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().hasValue).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().hasValue).toEqual(0);

    unmount();
  });

  test('useValueListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useValueListener(
        'v1',
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        false,
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().value).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().value).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().value).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().value).toEqual(0);

    unmount();
  });

  test('useStartTransactionListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useStartTransactionListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().transaction).toEqual(0);
    const {rerender, unmount} = render(<Test value={1} />);

    expect(store.getListenerStats().transaction).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={2} />);

    expect(store.getListenerStats().transaction).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().transaction).toEqual(0);

    unmount();
  });

  test('useWillFinishTransactionListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useWillFinishTransactionListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().transaction).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().transaction).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().transaction).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().transaction).toEqual(0);

    unmount();
  });

  test('useDidFinishTransactionListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useDidFinishTransactionListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        store,
      );
      return <button />;
    };
    expect(store.getListenerStats().transaction).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(store.getListenerStats().transaction).toEqual(1);
    store.setValue('v1', 2);
    rerender(<Test value={3} />);

    expect(store.getListenerStats().transaction).toEqual(1);
    store.setValue('v1', 3);
    rerender(<button />);

    expect(store.getListenerStats().transaction).toEqual(0);

    unmount();
  });

  test('useMetricListener', () => {
    expect.assertions(6);
    const metrics = createMetrics(store).setMetricDefinition(
      'm1',
      't1',
      'max',
      'c1',
    );
    const Test = ({value}: {readonly value: number}) => {
      useMetricListener(
        'm1',
        (metrics) => expect(metrics?.getMetric('m1')).toEqual(value),
        [value],
        metrics,
      );
      return <button />;
    };
    expect(metrics.getListenerStats().metric).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(metrics.getListenerStats().metric).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(metrics.getListenerStats().metric).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(metrics.getListenerStats().metric).toEqual(0);

    unmount();
  });

  test('useMetricListener (no deps)', () => {
    expect.assertions(4);
    const metrics = createMetrics(store).setMetricDefinition(
      'm1',
      't1',
      'max',
      'c1',
    );
    const Test = () => {
      useMetricListener(
        'm1',
        (metrics) => expect(metrics?.getMetric('m1')).toEqual(1),
        undefined,
        metrics,
      );
      return <button />;
    };
    expect(metrics.getListenerStats().metric).toEqual(0);

    const {rerender, unmount} = render(<Test />);
    expect(metrics.getListenerStats().metric).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 1);
    expect(metrics?.getMetric('m1')).toEqual(1);
    rerender(<button />);

    expect(metrics.getListenerStats().metric).toEqual(0);

    unmount();
  });

  test('useSliceIdsListener', () => {
    expect.assertions(6);
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const Test = ({value}: {readonly value: string}) => {
      useSliceIdsListener(
        'i1',
        (indexes) => expect(indexes?.getSliceIds('i1')[0]).toEqual(value),
        [value],
        indexes,
      );
      return <button />;
    };
    expect(indexes.getListenerStats().sliceIds).toEqual(0);
    const {rerender, unmount} = render(<Test value="a" />);

    expect(indexes.getListenerStats().sliceIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'a');
    rerender(<Test value="b" />);

    expect(indexes.getListenerStats().sliceIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'b');
    rerender(<button />);

    expect(indexes.getListenerStats().sliceIds).toEqual(0);

    unmount();
  });

  test('useSliceRowIdsListener', () => {
    expect.assertions(6);
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const Test = ({value}: {readonly value: string}) => {
      useSliceRowIdsListener(
        'i1',
        'a',
        (indexes) => expect(indexes?.getSliceIds('i1')[0]).toEqual(value),
        [value],
        indexes,
      );
      return <button />;
    };
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value="a" />);

    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'a');
    rerender(<Test value="b" />);

    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'b');
    rerender(<button />);

    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);

    unmount();
  });

  test('useRemoteRowIdListener', () => {
    expect.assertions(6);
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      'T1',
      'c1',
    );
    const Test = ({value}: {readonly value: string}) => {
      useRemoteRowIdListener(
        'r1',
        'r1',
        (relationships) =>
          expect(relationships?.getRemoteRowId('r1', 'r1')).toEqual(value),
        [value],
        relationships,
      );
      return <button />;
    };
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);
    const {rerender, unmount} = render(<Test value="R1" />);

    expect(relationships.getListenerStats().remoteRowId).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'R1');
    rerender(<Test value="R2" />);

    expect(relationships.getListenerStats().remoteRowId).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'R2');
    rerender(<button />);

    expect(relationships.getListenerStats().remoteRowId).toEqual(0);

    unmount();
  });

  test('useLocalRowIdsListener', () => {
    expect.assertions(6);
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      'T1',
      'c1',
    );
    const Test = ({value}: {readonly value: string}) => {
      useLocalRowIdsListener(
        'r1',
        'R1',
        (relationships) =>
          expect(value).toEqual(relationships?.getLocalRowIds('r1', 'R1')[0]),
        [value],
        relationships,
      );
      return <button />;
    };
    expect(relationships.getListenerStats().localRowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value="r1" />);

    expect(relationships.getListenerStats().localRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 'R1');
    rerender(<Test value="r2" />);

    expect(relationships.getListenerStats().localRowIds).toEqual(1);
    store.setTable('t1', {r1: {c1: 'R2'}, r2: {c1: 'R1'}});
    rerender(<button />);

    expect(relationships.getListenerStats().localRowIds).toEqual(0);

    unmount();
  });

  test('useLinkedRowIdsListener', () => {
    expect.assertions(6);
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      't1',
      'c1',
    );
    const Test = ({value}: {readonly value: string}) => {
      useLinkedRowIdsListener(
        'r1',
        'r1',
        (relationships) =>
          expect(relationships?.getLinkedRowIds('r1', 'r1').pop()).toEqual(
            value,
          ),
        [value],
        relationships,
      );
      return <button />;
    };
    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value="r3" />);

    expect(relationships.getListenerStats().linkedRowIds).toEqual(1);
    act(() =>
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}},
      }),
    );
    rerender(<Test value="r4" />);

    expect(relationships.getListenerStats().linkedRowIds).toEqual(1);
    act(() =>
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      }),
    );
    rerender(<button />);

    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);

    unmount();
  });

  test('useResultTableListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultTableListener(
        'q1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().table).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().table).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().table).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(queries.getListenerStats().table).toEqual(0);

    unmount();
  });

  test('useResultTableCellIdsListener', () => {
    expect.assertions(5);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultTableCellIdsListener(
        'q1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().tableCellIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().tableCellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().tableCellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    store.setCell('t1', 'r2', 'c2', 1);
    rerender(<button />);

    expect(queries.getListenerStats().tableCellIds).toEqual(0);

    unmount();
  });

  test('useResultRowCountListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultRowCountListener(
        'q1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().rowCount).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().rowCount).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().rowCount).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    store.setCell('t1', 'r2', 'c2', 1);
    rerender(<button />);

    expect(queries.getListenerStats().rowCount).toEqual(0);

    unmount();
  });

  test('useResultRowIdsListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultRowIdsListener(
        'q1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().rowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().rowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().rowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    store.setCell('t1', 'r2', 'c2', 1);
    rerender(<button />);

    expect(queries.getListenerStats().rowIds).toEqual(0);

    unmount();
  });

  test('useResultSortedRowIdsListener', () => {
    expect.assertions(7);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultSortedRowIdsListener(
        'q1',
        'c2',
        false,
        0,
        undefined,
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().sortedRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r2', 'c1', 0);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().sortedRowIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r3', 'c1', 0);
    store.setCell('t1', 'r2', 'c2', 1);
    rerender(<button />);

    expect(queries.getListenerStats().sortedRowIds).toEqual(0);

    unmount();
  });

  test('useResultRowListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultRowListener(
        'q1',
        'r1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().row).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().row).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().row).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(queries.getListenerStats().row).toEqual(0);

    unmount();
  });

  test('useResultCellIdsListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
        select('c3');
      },
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultCellIdsListener(
        'q1',
        'r1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().cellIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().cellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2).setCell('t1', 'r1', 'c2', 0);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().cellIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3).setCell('t1', 'r1', 'c3', 0);
    rerender(<button />);

    expect(queries.getListenerStats().cellIds).toEqual(0);

    unmount();
  });

  test('useResultCellListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const Test = ({value}: {readonly value: number}) => {
      useResultCellListener(
        'q1',
        'r1',
        'c1',
        (queries) =>
          expect(queries?.getResultCell('q1', 'r1', 'c1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().cell).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().cell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().cell).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 3);
    rerender(<button />);

    expect(queries.getListenerStats().cell).toEqual(0);

    unmount();
  });

  test('useParamValuesListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as Cell);
      },
      {p1: 1},
    );
    const Test = ({value}: {readonly value: Cell}) => {
      useParamValuesListener(
        'q1',
        (queries) => expect(queries?.getParamValue('q1', 'p1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().paramValues).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().paramValues).toEqual(1);
    queries.setParamValue('q1', 'p1', 2);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().paramValues).toEqual(1);
    queries.setParamValue('q1', 'p1', 3);
    rerender(<button />);

    expect(queries.getListenerStats().paramValues).toEqual(0);

    unmount();
  });

  test('useParamValueListener', () => {
    expect.assertions(6);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select, where, param}) => {
        select('c1');
        where('c1', param('p1') as Cell);
      },
      {p1: 1, p2: 'test'},
    );
    const Test = ({value}: {readonly value: Cell}) => {
      useParamValueListener(
        'q1',
        'p1',
        (queries) => expect(queries?.getParamValue('q1', 'p1')).toEqual(value),
        [value],
        queries,
      );
      return <button />;
    };
    expect(queries.getListenerStats().paramValue).toEqual(0);
    const {rerender, unmount} = render(<Test value={2} />);

    expect(queries.getListenerStats().paramValue).toEqual(1);
    queries.setParamValue('q1', 'p1', 2);
    rerender(<Test value={3} />);

    expect(queries.getListenerStats().paramValue).toEqual(1);
    queries.setParamValue('q1', 'p1', 3);
    rerender(<button />);

    expect(queries.getListenerStats().paramValue).toEqual(0);

    unmount();
  });

  test('useCheckpointIdsListener', () => {
    expect.assertions(6);
    const checkpoints = createCheckpoints(store);
    const Test = ({value}: {readonly value: string | undefined}) => {
      useCheckpointIdsListener(
        (checkpoints) =>
          expect(checkpoints?.getCheckpointIds()[1]).toEqual(value),
        [value],
        checkpoints,
      );
      return <button />;
    };
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
    const {rerender, unmount} = render(<Test value={undefined} />);

    expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);
    store.setCell('t1', 'r1', 'c1', 2);
    rerender(<Test value="1" />);

    expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);
    act(() => checkpoints.addCheckpoint());
    rerender(<button />);

    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);

    unmount();
  });

  test('useCheckpointListener', () => {
    expect.assertions(6);
    const checkpoints = createCheckpoints(store);
    const Test = ({value}: {readonly value: string | undefined}) => {
      useCheckpointListener(
        '0',
        (checkpoints) => expect(checkpoints?.getCheckpoint('0')).toEqual(value),
        [value],
        checkpoints,
      );
      return <button />;
    };
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
    const {rerender, unmount} = render(<Test value="c1" />);

    expect(checkpoints.getListenerStats().checkpoint).toEqual(1);
    act(() => checkpoints.setCheckpoint('0', 'c1'));
    rerender(<Test value="c2" />);

    expect(checkpoints.getListenerStats().checkpoint).toEqual(1);
    act(() => checkpoints.setCheckpoint('0', 'c2'));
    rerender(<button />);

    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);

    unmount();
  });
});
