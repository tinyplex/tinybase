/* eslint-disable react/jsx-no-useless-fragment */

import {
  Cell,
  Checkpoints,
  Id,
  MapCell,
  MapValue,
  MergeableStore,
  Persister,
  Row,
  Store,
  Synchronizer,
  Table,
  Tables,
  Value,
  Values,
  createCheckpoints,
  createIndexes,
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase/debug';
import {
  Provider,
  useAddRowCallback,
  useCell,
  useCellIds,
  useCellIdsListener,
  useCellListener,
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
  useSetCellCallback,
  useSetCheckpointCallback,
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
  useTable,
  useTableCellIds,
  useTableCellIdsListener,
  useTableIds,
  useTableIdsListener,
  useTableListener,
  useTables,
  useTablesListener,
  useUndoInformation,
  useValue,
  useValueIds,
  useValueIdsListener,
  useValueListener,
  useValues,
  useValuesListener,
  useWillFinishTransactionListener,
} from 'tinybase/debug/ui-react';
import React, {ReactElement} from 'react';
import {ReactTestRenderer, act, create} from 'react-test-renderer';
import {createFilePersister} from 'tinybase/debug/persisters/persister-file';
import {createLocalSynchronizer} from 'tinybase/debug/synchronizers/synchronizer-local';
import {jest} from '@jest/globals';
import {pause} from '../common/other';
import tmp from 'tmp';

let store: Store;
let renderer: ReactTestRenderer;
let didRender: jest.Mock<(component: ReactElement) => ReactElement>;

beforeEach(() => {
  store = createStore()
    .setTables({t1: {r1: {c1: 1}}})
    .setValues({v1: 1});
  didRender = jest.fn((rendered) => rendered);
});

describe('Create Hooks', () => {
  test('useCreateStore', () => {
    const initStore = jest.fn((count: any) =>
      createStore().setTables({t1: {r1: {c1: count}}}),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore(count));
      return didRender(<>{JSON.stringify([count, store.getTables()])}</>);
    };
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, {t1: {r1: {c1: 1}}}]));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([2, {t1: {r1: {c1: 1}}}]));
    expect(didRender).toHaveBeenCalledTimes(2);
    expect(initStore).toHaveBeenCalledTimes(1);
  });

  test('useCreateMergeableStore', () => {
    const initStore = jest.fn((count: any) =>
      createMergeableStore('s1').setTables({t1: {r1: {c1: count}}}),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateMergeableStore(() => initStore(count));
      return didRender(<>{JSON.stringify([count, store.getTables()])}</>);
    };
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, {t1: {r1: {c1: 1}}}]));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([2, {t1: {r1: {c1: 1}}}]));
    expect(didRender).toHaveBeenCalledTimes(2);
    expect(initStore).toHaveBeenCalledTimes(1);
  });

  test('useCreateMetrics', () => {
    const initStore = jest.fn(() =>
      createStore().setTables({
        t1: {r1: {c1: 1}},
        t2: {r1: {c2: 2}, r2: {c2: 2}},
      }),
    );
    const initMetrics = jest.fn((store: Store, count) =>
      createMetrics(store).setMetricDefinition('m1', `t${count}`),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const metrics = useCreateMetrics(
        store,
        (store) => initMetrics(store, count),
        [count],
      );
      return didRender(
        <>{JSON.stringify([count, metrics?.getMetric('m1')])}</>,
      );
    };
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, 1]));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([2, 2]));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initMetrics).toHaveBeenCalledTimes(2);
  });

  test('useCreateMetrics (no deps, and destroy)', () => {
    const initStore = jest.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}}, t2: {r1: {c2: 2}}}),
    );
    const initMetrics = jest.fn((store: Store) =>
      createMetrics(store).setMetricDefinition('m1', `t1`),
    );
    const Test = ({count}: {count: number}) => {
      const store = useCreateStore(() => initStore());
      const metrics = useCreateMetrics(store, (store) => initMetrics(store));
      return didRender(
        <>{JSON.stringify([count, metrics?.getMetric('m1')])}</>,
      );
    };
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, 1]));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    act(() => {
      renderer.unmount();
    });
    expect(renderer.toJSON()).toBeNull();
    expect(didRender).toHaveBeenCalledTimes(3);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initMetrics).toHaveBeenCalledTimes(1);
  });

  test('useCreateIndexes', async () => {
    const initStore = jest.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}, r2: {c2: 1}}}),
    );
    const initIndexes = jest.fn((store: Store, count) => {
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
        <>{JSON.stringify([count, indexes?.getSliceRowIds('i1', '1')])}</>,
      );
    };
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, ['r1']]));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([2, ['r2']]));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initIndexes).toHaveBeenCalledTimes(2);
  });

  test('useCreateRelationships', () => {
    const initStore = jest.fn(() =>
      createStore().setTables({
        t1: {r1: {c1: `R1`}},
        t2: {r1: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      }),
    );
    const initRelationships = jest.fn((store: Store, count) =>
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
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, 'R1']));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([2, 'R2']));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initRelationships).toHaveBeenCalledTimes(2);
  });

  test('useCreateQueries', () => {
    const initStore = jest.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}, r2: {c2: 2}}}),
    );
    const initQueries = jest.fn((store: Store, count) =>
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
      return didRender(
        <>{JSON.stringify([count, queries?.getResultTable('q1')])}</>,
      );
    };
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([1, {r1: {c1: 1}}]));
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([2, {r2: {c2: 2}}]));
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initQueries).toHaveBeenCalledTimes(2);
  });

  test('useCreateCheckpoints', () => {
    const initStore = jest.fn(() =>
      createStore().setTables({t1: {r1: {c1: 1}}}),
    );
    const initCheckpoints = jest.fn((store: Store, count: number) => {
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
    act(() => {
      renderer = create(<Test count={1} />);
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, [['0'], '1', []], 'checkpoint1', null]),
    );
    act(() => {
      renderer.update(<Test count={2} />);
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([2, [['0', '1'], '2', []], 'checkpoint1', 'checkpoint2']),
    );
    expect(didRender).toHaveBeenCalledTimes(4);
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(initCheckpoints).toHaveBeenCalledTimes(2);
  });

  test('useCreatePersister, no then', async () => {
    let _persister: Persister | undefined;
    tmp.setGracefulCleanup();
    const fileName = tmp.fileSync().name;
    const initStore = jest.fn(createStore);
    const createPersister = jest.fn((store: Store) => {
      _persister = createFilePersister(store, fileName);
      return _persister;
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateStore(initStore);
      const persister = useCreatePersister(store, createPersister, [id]);
      const cell = useCell('t1', 'r1', 'c1', store);
      return didRender(
        <>{JSON.stringify([id, persister?.getStats(), cell])}</>,
      );
    };
    act(() => {
      renderer = create(<Test id={1} />);
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, {loads: 0, saves: 0}, null]),
    );
    await act(async () => {
      await _persister?.load([{t1: {r1: {c1: 1}}}, {}]);
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}, 1]),
    );
    act(() => {
      renderer.update(<Test id={2} />);
    });
    await act(async () => {
      await pause();
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([2, {loads: 0, saves: 0}, 1]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createPersister).toHaveBeenCalledTimes(2);
    expect(didRender).toHaveBeenCalledTimes(5);
    _persister?.stopAutoLoad()?.stopAutoSave();
  });

  test('useCreatePersister, then, no destroy', async () => {
    let _persister: Persister | undefined;
    tmp.setGracefulCleanup();
    const fileName = tmp.fileSync().name;
    const initStore = jest.fn(createStore);
    const createPersister = jest.fn((store: Store, id: number) => {
      if (id != 0) {
        _persister = createFilePersister(store, fileName);
        return _persister;
      }
    });
    const initPersister = jest.fn(async (persister: Persister, id: number) => {
      await persister.load([{t1: {r1: {c1: id}}}, {}]);
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateStore(initStore);
      const persister = useCreatePersister(
        store,
        (store) => createPersister(store, id),
        [id],
        async (persister) => await initPersister(persister, id),
        [id],
      );
      return didRender(<>{JSON.stringify([id, persister?.getStats()])}</>);
    };
    act(() => {
      renderer = create(<Test id={0} />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([0, null]));
    act(() => {
      renderer = create(<Test id={1} />);
    });
    await act(async () => {
      await pause();
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}]),
    );
    act(() => {
      renderer.update(<Test id={2} />);
    });
    await act(async () => {
      await pause();
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}]),
    );
    expect(initStore).toHaveBeenCalledTimes(2);
    expect(createPersister).toHaveBeenCalledTimes(3);
    expect(initPersister).toHaveBeenCalledTimes(2);
    expect(didRender).toHaveBeenCalledTimes(7);
    _persister?.stopAutoLoad()?.stopAutoSave();
  });

  test('useCreatePersister, then, destroy', async () => {
    const persisters: Persister[] = [];
    tmp.setGracefulCleanup();
    const initStore = jest.fn(createStore);
    const createPersister = jest.fn((store: Store, id: number) => {
      const fileName = tmp.fileSync().name;
      const persister = createFilePersister(store, fileName);
      persisters[id] = persister;
      return persister;
    });
    const initPersister = jest.fn(async (persister: Persister, id: number) => {
      await persister.load([{t1: {r1: {c1: id}}}, {}]);
    });
    const destroyPersister = jest.fn((persister: Persister) => {
      expect(persisters).toContain(persister);
    });
    const Test = ({id}: {id: number}) => {
      const store = useCreateStore(initStore);
      const persister = useCreatePersister(
        store,
        (store) => createPersister(store, id),
        [id],
        async (persister) => await initPersister(persister, id),
        [id],
        destroyPersister,
      );
      return didRender(<>{JSON.stringify([id, persister?.getStats()])}</>);
    };
    act(() => {
      renderer = create(<Test id={1} />);
    });
    await act(async () => {
      await pause();
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}]),
    );
    act(() => {
      renderer.update(<Test id={2} />);
    });
    await act(async () => {
      await pause();
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createPersister).toHaveBeenCalledTimes(2);
    expect(initPersister).toHaveBeenCalledTimes(2);
    expect(destroyPersister).toHaveBeenCalledTimes(1);
    expect(destroyPersister).toHaveBeenCalledWith(persisters[1]);
    expect(didRender).toHaveBeenCalledTimes(6);
    persisters.forEach((persister) => persister.stopAutoLoad().stopAutoSave());
  });

  test('useCreateSynchronizer, no destroy', async () => {
    let _synchronizer: Synchronizer | undefined;
    const initStore = jest.fn(() => createMergeableStore('s1'));
    const createSynchronizer = jest.fn(async (store: MergeableStore) => {
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
      return didRender(
        <>{JSON.stringify([id, synchronizer?.getStats(), cell])}</>,
      );
    };
    act(() => {
      renderer = create(<Test id={1} />);
    });
    await act(pause);
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}, 1]),
    );
    act(() => {
      renderer.update(<Test id={2} />);
    });
    await act(pause);
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}, 1]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createSynchronizer).toHaveBeenCalledTimes(2);
    expect(didRender).toHaveBeenCalledTimes(5);
    _synchronizer?.stopAutoLoad()?.stopAutoSave();
  });

  test('useCreateSynchronizer, destroy', async () => {
    const synchronizers: Synchronizer[] = [];
    const initStore = jest.fn(() => createMergeableStore('s1'));
    const createSynchronizer = jest.fn(
      async (store: MergeableStore, id: number) => {
        const synchronizer = createLocalSynchronizer(store);
        await synchronizer.load([{t1: {r1: {c1: id}}}, {}]);
        synchronizers[id] = synchronizer;
        return synchronizer;
      },
    );
    const destroySynchronizer = jest.fn((synchronizer: Synchronizer) => {
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
      return didRender(<>{JSON.stringify([id, synchronizer?.getStats()])}</>);
    };
    act(() => {
      renderer = create(<Test id={1} />);
    });
    await act(pause);
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([1, {loads: 1, saves: 0}]),
    );
    act(() => {
      renderer.update(<Test id={2} />);
    });
    await act(pause);
    expect(renderer.toJSON()).toEqual(
      JSON.stringify([2, {loads: 1, saves: 0}]),
    );
    expect(initStore).toHaveBeenCalledTimes(1);
    expect(createSynchronizer).toHaveBeenCalledTimes(2);
    expect(destroySynchronizer).toHaveBeenCalledTimes(1);
    expect(destroySynchronizer).toHaveBeenCalledWith(synchronizers[1]);
    expect(didRender).toHaveBeenCalledTimes(4);
    synchronizers.forEach((synchronizer) =>
      synchronizer.stopAutoLoad().stopAutoSave(),
    );
  });
});

describe('Context Hooks', () => {
  test('useStore', () => {
    const Test = () =>
      didRender(<>{JSON.stringify(useStore()?.getTables())}</>);
    act(() => {
      renderer = create(
        <Provider store={store}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useProvideStore', () => {
    const Test = () =>
      didRender(<>{JSON.stringify(useStore('s')?.getTables())}</>);
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
    act(() => {
      renderer = create(
        <Provider>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toBeNull();
    expect(didRender).toHaveBeenCalledTimes(1);

    act(() => {
      renderer.update(
        <Provider>
          <Test />
          <ProvideStore1 />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(3);

    act(() => {
      renderer.update(
        <Provider>
          <Test />
          <ProvideStore1 />
          <ProvideStore1 />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));
    expect(didRender).toHaveBeenCalledTimes(4);

    act(() => {
      renderer.update(
        <Provider>
          <Test />
          <ProvideStore2 />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({t2: {r2: {c2: 2}}}));
    expect(didRender).toHaveBeenCalledTimes(6);

    act(() => {
      renderer.update(
        <Provider>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toBeNull();
    expect(didRender).toHaveBeenCalledTimes(8);
  });

  test('useMetrics', () => {
    const Test = () =>
      didRender(<>{JSON.stringify(useMetrics()?.getMetric('m1'))}</>);
    const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
    act(() => {
      renderer = create(
        <Provider metrics={metrics}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('1');
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useIndexes', () => {
    const Test = () =>
      didRender(<>{JSON.stringify(useIndexes()?.getSliceRowIds('i1', '1'))}</>);
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    act(() => {
      renderer = create(
        <Provider indexes={indexes}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1']));
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useRelationships', () => {
    store.setTables({
      t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
      T1: {R1: {C1: 1}, R2: {C1: 2}},
    });
    const Test = () =>
      didRender(
        <>{JSON.stringify(useRelationships()?.getRemoteRowId('r1', 'r1'))}</>,
      );
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      'T1',
      'c1',
    );
    act(() => {
      renderer = create(
        <Provider relationships={relationships}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify('R1'));
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useQueries', () => {
    const Test = () =>
      didRender(<>{JSON.stringify(useQueries()?.getResultTable('q1'))}</>);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    act(() => {
      renderer = create(
        <Provider queries={queries}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({r1: {c1: 1}}));
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useCheckpoints', () => {
    const Test = () =>
      didRender(<>{JSON.stringify(useCheckpoints()?.getCheckpointIds())}</>);
    const checkpoints = createCheckpoints(store);
    store.setTables({t1: {r1: {c1: 2}}});
    checkpoints.addCheckpoint();
    act(() => {
      renderer = create(
        <Provider checkpoints={checkpoints}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([['0'], '1', []]));
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useStoreIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useStoreIds())}</>);
    const store1 = createStore();
    const store2 = createStore();
    act(() => {
      renderer = create(
        <Provider storesById={{store1, store2}}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('["store1","store2"]');
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useMetricsIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useMetricsIds())}</>);
    const metrics1 = createMetrics(createStore());
    const metrics2 = createMetrics(createStore());
    act(() => {
      renderer = create(
        <Provider metricsById={{metrics1, metrics2}}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('["metrics1","metrics2"]');
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useIndexesIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useIndexesIds())}</>);
    const indexes1 = createIndexes(createStore());
    const indexes2 = createIndexes(createStore());
    act(() => {
      renderer = create(
        <Provider indexesById={{indexes1, indexes2}}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('["indexes1","indexes2"]');
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useRelationshipsIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useRelationshipsIds())}</>);
    const relationships1 = createRelationships(createStore());
    const relationships2 = createRelationships(createStore());
    act(() => {
      renderer = create(
        <Provider relationshipsById={{relationships1, relationships2}}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('["relationships1","relationships2"]');
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useQueriesIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useQueriesIds())}</>);
    const queries1 = createQueries(createStore());
    const queries2 = createQueries(createStore());
    act(() => {
      renderer = create(
        <Provider queriesById={{queries1, queries2}}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('["queries1","queries2"]');
    expect(didRender).toHaveBeenCalledTimes(1);
  });

  test('useCheckpointsIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useCheckpointsIds())}</>);
    const checkpoints1 = createCheckpoints(createStore());
    const checkpoints2 = createCheckpoints(createStore());
    act(() => {
      renderer = create(
        <Provider checkpointsById={{checkpoints1, checkpoints2}}>
          <Test />
        </Provider>,
      );
    });
    expect(renderer.toJSON()).toEqual('["checkpoints1","checkpoints2"]');
    expect(didRender).toHaveBeenCalledTimes(1);
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
    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.toJSON()).toEqual(['[]', '[]', '[]', '[]', '[]']);
    expect(didRender).toHaveBeenCalledTimes(1);
  });
});

describe('Read Hooks', () => {
  test('useHasTables', () => {
    const Test = () => didRender(<>{JSON.stringify(useHasTables(store))}</>);
    expect(store.getListenerStats().hasTables).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(store.getListenerStats().hasTables).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual('false');

    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasTables).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(2);
  });

  test('useTables', () => {
    const Test = () => didRender(<>{JSON.stringify(useTables(store))}</>);
    expect(store.getListenerStats().tables).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(store.getListenerStats().tables).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({t1: {r1: {c1: 1}}}));

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}}).setTables({t1: {r1: {c1: 2}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({t1: {r1: {c1: 2}}}));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().tables).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useTableIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useTableIds(store))}</>);
    expect(store.getListenerStats().tableIds).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(store.getListenerStats().tableIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['t1']));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['t1', 't2']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual('[]');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().tableIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useHasTable', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(<>{JSON.stringify(useHasTable(tableId, store))}</>);
    expect(store.getListenerStats().hasTable).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" />);
    });
    expect(store.getListenerStats().hasTable).toEqual(1);
    expect(renderer.toJSON()).toEqual('false');

    act(() => {
      renderer.update(<Test tableId="t1" />);
    });
    expect(store.getListenerStats().hasTable).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}});
      renderer.update(<Test tableId="t2" />);
    });
    expect(store.getListenerStats().hasTable).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual('false');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().table).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);
  });

  test('useTable', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(<>{JSON.stringify(useTable(tableId, store))}</>);
    expect(store.getListenerStats().table).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" />);
    });
    expect(store.getListenerStats().table).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));

    act(() => {
      renderer.update(<Test tableId="t1" />);
    });
    expect(store.getListenerStats().table).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({r1: {c1: 1}}));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}}, t2: {r1: {c1: 3}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({r1: {c1: 2}}));

    act(() => {
      renderer.update(<Test tableId="t2" />);
    });
    expect(store.getListenerStats().table).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({r1: {c1: 3}}));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().table).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useTableCellIds', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(<>{JSON.stringify(useTableCellIds(tableId, store))}</>);
    expect(store.getListenerStats().rowIds).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test tableId="t1" />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      store
        .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}})
        .setTables({t1: {r2: {c2: 2}}, t2: {r1: {c3: 1}, r2: {c4: 4}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c2']));

    act(() => {
      renderer.update(<Test tableId="t2" />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c3', 'c4']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useHasTableCell', () => {
    const Test = ({tableId, cellId}: {tableId: Id; cellId: Id}) =>
      didRender(<>{JSON.stringify(useHasTableCell(tableId, cellId, store))}</>);
    expect(store.getListenerStats().hasTableCell).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" cellId="c0" />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    expect(renderer.toJSON()).toEqual('false');

    act(() => {
      renderer.update(<Test tableId="t1" cellId="c1" />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c2: 3}});
    });
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      renderer.update(<Test tableId="t1" cellId="c2" />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual('false');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);
  });

  test('useRowCount', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(<>{useRowCount(tableId, store)}</>);
    expect(store.getListenerStats().rowCount).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" />);
    });
    expect(store.getListenerStats().rowCount).toEqual(1);
    expect(renderer.toJSON()).toEqual('0');

    act(() => {
      renderer.update(<Test tableId="t1" />);
    });
    expect(store.getListenerStats().rowCount).toEqual(1);
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}});
    });
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      renderer.update(<Test tableId="t2" />);
    });
    expect(store.getListenerStats().rowCount).toEqual(1);
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual('0');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().rowCount).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);
  });

  test('useRowIds', () => {
    const Test = ({tableId}: {tableId: Id}) =>
      didRender(<>{JSON.stringify(useRowIds(tableId, store))}</>);
    expect(store.getListenerStats().rowIds).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" />);
    });
    expect(store.getListenerStats().rowIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test tableId="t1" />);
    });
    expect(store.getListenerStats().rowIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1']));

    act(() => {
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2']));

    act(() => {
      renderer.update(<Test tableId="t2" />);
    });
    expect(store.getListenerStats().rowIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r3', 'r4']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().rowIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
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
    act(() => {
      renderer = create(
        <Test
          tableId="t0"
          cellId="c0"
          descending={false}
          offset={0}
          limit={undefined}
        />,
      );
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(
        <Test
          tableId="t1"
          cellId="c1"
          descending={false}
          offset={0}
          limit={undefined}
        />,
      );
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1']));

    act(() => {
      store
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}})
        .setTables({t1: {r2: {c1: 2}}, t2: {r3: {c1: 3}, r4: {c1: 4}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2']));

    act(() => {
      renderer.update(
        <Test
          tableId="t2"
          cellId="c1"
          descending={true}
          offset={0}
          limit={2}
        />,
      );
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r4', 'r3']));

    act(() => {
      store.setRow('t2', 'r5', {c1: 5});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r5', 'r4']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(6);
  });

  test('useHasRow', () => {
    const Test = ({tableId, rowId}: {tableId: Id; rowId: Id}) =>
      didRender(<>{JSON.stringify(useHasRow(tableId, rowId, store))}</>);
    expect(store.getListenerStats().hasRow).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" rowId="r0" />);
    });
    expect(store.getListenerStats().hasRow).toEqual(1);
    expect(renderer.toJSON()).toEqual('false');

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" />);
    });
    expect(store.getListenerStats().hasRow).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}});
    });
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r2" />);
    });
    expect(store.getListenerStats().hasRow).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual('false');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasRow).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);
  });

  test('useRow', () => {
    const Test = ({tableId, rowId}: {tableId: Id; rowId: Id}) =>
      didRender(<>{JSON.stringify(useRow(tableId, rowId, store))}</>);
    expect(store.getListenerStats().row).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" rowId="r0" />);
    });
    expect(store.getListenerStats().row).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" />);
    });
    expect(store.getListenerStats().row).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({c1: 1}));

    act(() => {
      store
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}})
        .setTable('t1', {r1: {c1: 2}, r2: {c1: 3}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({c1: 2}));

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r2" />);
    });
    expect(store.getListenerStats().row).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({c1: 3}));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().row).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useCellIds', () => {
    const Test = ({tableId, rowId}: {tableId: Id; rowId: Id}) =>
      didRender(<>{JSON.stringify(useCellIds(tableId, rowId, store))}</>);
    expect(store.getListenerStats().cellIds).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" rowId="r0" />);
    });
    expect(store.getListenerStats().cellIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" />);
    });
    expect(store.getListenerStats().cellIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      store
        .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}})
        .setTable('t1', {r1: {c2: 2}, r2: {c3: 3, c4: 4}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c2']));

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r2" />);
    });
    expect(store.getListenerStats().cellIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c3', 'c4']));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().cellIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
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
    }) =>
      didRender(
        <>{JSON.stringify(useHasCell(tableId, rowId, cellId, store))}</>,
      );
    expect(store.getListenerStats().hasCell).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" rowId="r0" cellId="c0" />);
    });
    expect(store.getListenerStats().hasCell).toEqual(1);
    expect(renderer.toJSON()).toEqual('false');

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" cellId="c1" />);
    });
    expect(store.getListenerStats().hasCell).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store
        .setTable('t1', {r1: {c1: 2, c2: 2}})
        .setTable('t1', {r1: {c1: 2, c2: 2}});
    });
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" cellId="c2" />);
    });
    expect(store.getListenerStats().hasCell).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual('false');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasCell).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);
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
    }) => didRender(<>{useCell(tableId, rowId, cellId, store)}</>);
    expect(store.getListenerStats().cell).toEqual(0);
    act(() => {
      renderer = create(<Test tableId="t0" rowId="r0" cellId="c0" />);
    });
    expect(store.getListenerStats().cell).toEqual(1);
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" cellId="c1" />);
    });
    expect(store.getListenerStats().cell).toEqual(1);
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      store
        .setTable('t1', {r1: {c1: 2, c2: 2}})
        .setTable('t1', {r1: {c1: 2, c2: 2}});
    });
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      renderer.update(<Test tableId="t1" rowId="r1" cellId="c2" />);
    });
    expect(store.getListenerStats().cell).toEqual(1);
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toBeNull();
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().cell).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useHasValues', () => {
    const Test = () => didRender(<>{JSON.stringify(useHasValues(store))}</>);
    expect(store.getListenerStats().hasValues).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(store.getListenerStats().hasValues).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.setValues({v1: 2}).setValues({v1: 2});
    });
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delValues();
    });
    expect(renderer.toJSON()).toEqual('false');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasValues).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(2);
  });

  test('useValues', () => {
    const Test = () => didRender(<>{JSON.stringify(useValues(store))}</>);
    expect(store.getListenerStats().values).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(store.getListenerStats().values).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify({v1: 1}));

    act(() => {
      store.setValues({v1: 2}).setValues({v1: 2});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({v1: 2}));

    act(() => {
      store.delValues();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().values).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useValueIds', () => {
    const Test = () => didRender(<>{JSON.stringify(useValueIds(store))}</>);
    expect(store.getListenerStats().valueIds).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(store.getListenerStats().valueIds).toEqual(1);
    expect(renderer.toJSON()).toEqual(JSON.stringify(['v1']));

    act(() => {
      store.setValues({v1: 1, v2: 2}).setValues({v1: 1, v2: 2});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['v1', 'v2']));

    act(() => {
      store.delValues();
    });
    expect(renderer.toJSON()).toEqual('[]');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().valueIds).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useHasValue', () => {
    const Test = ({valueId}: {valueId: Id}) =>
      didRender(<>{JSON.stringify(useHasValue(valueId, store))}</>);
    expect(store.getListenerStats().hasValue).toEqual(0);
    act(() => {
      renderer = create(<Test valueId="v0" />);
    });
    expect(store.getListenerStats().hasValue).toEqual(1);
    expect(renderer.toJSON()).toEqual('false');

    act(() => {
      renderer.update(<Test valueId="v1" />);
    });
    expect(store.getListenerStats().hasValue).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3});
    });
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      renderer.update(<Test valueId="v2" />);
    });
    expect(store.getListenerStats().hasValue).toEqual(1);
    expect(renderer.toJSON()).toEqual('true');

    act(() => {
      store.delValues();
    });
    expect(renderer.toJSON()).toEqual('false');
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasValue).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(4);
  });

  test('useValue', () => {
    const Test = ({valueId}: {valueId: Id}) =>
      didRender(<>{JSON.stringify(useValue(valueId, store))}</>);
    expect(store.getListenerStats().value).toEqual(0);
    act(() => {
      renderer = create(<Test valueId="v0" />);
    });
    expect(store.getListenerStats().value).toEqual(1);
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test valueId="v1" />);
    });
    expect(store.getListenerStats().value).toEqual(1);
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      store.setValues({v1: 2, v2: 3}).setValues({v1: 2, v2: 3});
    });
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      renderer.update(<Test valueId="v2" />);
    });
    expect(store.getListenerStats().value).toEqual(1);
    expect(renderer.toJSON()).toEqual('3');

    act(() => {
      store.delValues();
    });
    expect(renderer.toJSON()).toBeNull();
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().value).toEqual(0);
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useMetricIds', () => {
    const metrics = createMetrics(store);
    const Test = () => didRender(<>{useMetricIds(metrics)}</>);

    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      metrics.setMetricDefinition('m1', 't1');
      metrics.setMetricDefinition('m2', 't2');
    });
    expect(renderer.toJSON()).toEqual(['m1', 'm2']);

    act(() => {
      metrics.delMetricDefinition('m1');
    });
    expect(renderer.toJSON()).toEqual('m2');
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useMetric', () => {
    const metrics = createMetrics(store)
      .setMetricDefinition('m1', 't1')
      .setMetricDefinition('m2', 't1', 'max', 'c1')
      .setMetricDefinition('m3', 't3');
    const Test = ({metricId}: {metricId: Id}) =>
      didRender(<>{useMetric(metricId, metrics)}</>);

    act(() => {
      renderer = create(<Test metricId="m0" />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test metricId="m1" />);
    });
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      store.setCell('t1', 'r2', 'c1', 3).setCell('t1', 'r2', 'c1', 3);
    });
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      renderer.update(<Test metricId="m2" />);
    });
    expect(renderer.toJSON()).toEqual('3');

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test metricId="m3" />);
    });
    expect(renderer.toJSON()).toBeNull();
    expect(didRender).toHaveBeenCalledTimes(6);
  });

  test('useIndexIds', () => {
    const indexes = createIndexes(store);
    const Test = () => didRender(<>{useIndexIds(indexes)}</>);

    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      indexes.setIndexDefinition('i1', 't1');
      indexes.setIndexDefinition('i2', 't2');
    });
    expect(renderer.toJSON()).toEqual(['i1', 'i2']);

    act(() => {
      indexes.delIndexDefinition('i1');
    });
    expect(renderer.toJSON()).toEqual('i2');
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useSliceIds', () => {
    const indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't1', 'c2')
      .setIndexDefinition('i3', 't3', 'c3');
    const Test = ({indexId}: {indexId: Id}) =>
      didRender(<>{JSON.stringify(useSliceIds(indexId, indexes))}</>);
    act(() => {
      renderer = create(<Test indexId="i0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test indexId="i1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['1']));

    act(() => {
      store
        .setCell('t1', 'r2', 'c1', 2)
        .setCell('t1', 'r2', 'c1', 2)
        .setCell('t1', 'r2', 'c2', 3);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['1', '2']));

    act(() => {
      renderer.update(<Test indexId="i2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['', '3']));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test indexId="i3" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    expect(didRender).toHaveBeenCalledTimes(6);
  });

  test('useSliceRowIds', () => {
    const indexes = createIndexes(store)
      .setIndexDefinition('i1', 't1', 'c1')
      .setIndexDefinition('i2', 't2', 'c2');
    const Test = ({indexId, sliceId}: {indexId: Id; sliceId: Id}) =>
      didRender(
        <>{JSON.stringify(useSliceRowIds(indexId, sliceId, indexes))}</>,
      );
    act(() => {
      renderer = create(<Test indexId="i0" sliceId="0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test indexId="i1" sliceId="1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1']));

    act(() => {
      store
        .setCell('t1', 'r2', 'c1', 1)
        .setCell('t1', 'r2', 'c1', 1)
        .setCell('t1', 'r3', 'c1', 2);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1', 'r2']));

    act(() => {
      renderer.update(<Test indexId="i1" sliceId="2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r3']));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test indexId="i2" sliceId="2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    expect(didRender).toHaveBeenCalledTimes(6);
  });

  test('useRelationshipIds', () => {
    const relationships = createRelationships(store);
    const Test = () => didRender(<>{useRelationshipIds(relationships)}</>);

    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      relationships.setRelationshipDefinition('r1', 't1', 't2', 'c1');
      relationships.setRelationshipDefinition('r2', 't2', 't2', 'c1');
    });
    expect(renderer.toJSON()).toEqual(['r1', 'r2']);

    act(() => {
      relationships.delRelationshipDefinition('r1');
    });
    expect(renderer.toJSON()).toEqual('r2');
    expect(didRender).toHaveBeenCalledTimes(3);
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
    act(() => {
      renderer = create(<Test relationshipId="r0" localRowId="r0" />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test relationshipId="r1" localRowId="r1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify('1'));

    act(() => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify('R1'));

    act(() => {
      renderer.update(<Test relationshipId="r1" localRowId="r2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify('R2'));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test relationshipId="r2" localRowId="r2" />);
    });
    expect(renderer.toJSON()).toBeNull();
    expect(didRender).toHaveBeenCalledTimes(6);
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
    act(() => {
      renderer = create(<Test relationshipId="r0" remoteRowId="R0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test relationshipId="r1" remoteRowId="R1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      store.setTables({
        t1: {r1: {c1: 'R1'}, r2: {c1: 'R1'}, r3: {c1: 'R2'}},
        T1: {R1: {C1: 1}, R2: {C1: 2}},
      });
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1', 'r2']));

    act(() => {
      renderer.update(<Test relationshipId="r1" remoteRowId="R2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r3']));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test relationshipId="r2" remoteRowId="R2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    expect(didRender).toHaveBeenCalledTimes(6);
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
    act(() => {
      renderer = create(<Test relationshipId="r0" firstRowId="r0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r0']));

    act(() => {
      renderer.update(<Test relationshipId="r1" firstRowId="r1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1', '1']));

    act(() => {
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      });
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1', 'r2', 'r3', 'r4']));

    act(() => {
      renderer.update(<Test relationshipId="r1" firstRowId="r2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2', 'r3', 'r4']));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2']));

    act(() => {
      renderer.update(<Test relationshipId="r2" firstRowId="r2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2']));
    expect(didRender).toHaveBeenCalledTimes(6);
  });

  test('useQueryIds', () => {
    const queries = createQueries(store);
    const Test = () => didRender(<>{useQueryIds(queries)}</>);

    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      queries.setQueryDefinition('q1', 't1', () => 0);
      queries.setQueryDefinition('q2', 't2', () => 0);
    });
    expect(renderer.toJSON()).toEqual(['q1', 'q2']);

    act(() => {
      queries.delQueryDefinition('q1');
    });
    expect(renderer.toJSON()).toEqual('q2');
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useResultTable', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(<>{JSON.stringify(useResultTable(queryId, queries))}</>);
    act(() => {
      renderer = create(<Test queryId="q0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));

    act(() => {
      renderer.update(<Test queryId="q1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({r1: {c1: 1}}));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}});
    });
    expect(renderer.toJSON()).toEqual(
      JSON.stringify({r1: {c1: 2}, r2: {c1: 3}}),
    );

    act(() => {
      renderer.update(<Test queryId="q2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({r2: {c1: 3}}));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useResultTableCellIds', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const Test = ({queryId}: {queryId: Id}) =>
      didRender(<>{JSON.stringify(useResultTableCellIds(queryId, queries))}</>);
    act(() => {
      renderer = create(<Test queryId="q0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test queryId="q1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      renderer.update(<Test queryId="q2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(4);
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
      didRender(<>{useResultRowCount(queryId, queries)}</>);
    act(() => {
      renderer = create(<Test queryId="q0" />);
    });
    expect(renderer.toJSON()).toEqual('0');

    act(() => {
      renderer.update(<Test queryId="q1" />);
    });
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}}});
    });
    expect(renderer.toJSON()).toEqual('3');

    act(() => {
      renderer.update(<Test queryId="q2" />);
    });
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual('0');
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(5);
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
      didRender(<>{JSON.stringify(useResultRowIds(queryId, queries))}</>);
    act(() => {
      renderer = create(<Test queryId="q0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test queryId="q1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1']));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 1}, r3: {c1: 3, c2: 2}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1', 'r2', 'r3']));

    act(() => {
      renderer.update(<Test queryId="q2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2', 'r3']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(5);
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
    act(() => {
      renderer = create(
        <Test
          queryId="q0"
          cellId="c0"
          descending={false}
          offset={0}
          limit={undefined}
        />,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(
        <Test
          queryId="q1"
          cellId="c1"
          descending={false}
          offset={0}
          limit={undefined}
        />,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r1']));

    act(() => {
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
        });
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r2', 'r1', 'r3', 'r4']));

    act(() => {
      renderer.update(
        <Test
          queryId="q2"
          cellId="c2"
          descending={true}
          offset={0}
          limit={2}
        />,
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r4', 'r3']));

    act(() => {
      store.setRow('t1', 'r5', {c1: 3, c2: 3});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['r5', 'r4']));

    act(() => {
      store.delTables();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(6);
  });

  test('useResultRow', () => {
    const queries = createQueries(store)
      .setQueryDefinition('q1', 't1', ({select}) => select('c1'))
      .setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c1');
        where('c1', 3);
      });
    const Test = ({queryId, rowId}: {queryId: Id; rowId: Id}) =>
      didRender(<>{JSON.stringify(useResultRow(queryId, rowId, queries))}</>);
    act(() => {
      renderer = create(<Test queryId="q0" rowId="r0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));

    act(() => {
      renderer.update(<Test queryId="q1" rowId="r1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({c1: 1}));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({c1: 2}));

    act(() => {
      renderer.update(<Test queryId="q2" rowId="r2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({c1: 3}));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify({}));
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(5);
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
      didRender(
        <>{JSON.stringify(useResultCellIds(queryId, rowId, queries))}</>,
      );
    act(() => {
      renderer = create(<Test queryId="q0" rowId="r0" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));

    act(() => {
      renderer.update(<Test queryId="q1" rowId="r1" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1']));

    act(() => {
      renderer.update(<Test queryId="q2" rowId="r2" />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1', 'c2']));

    act(() => {
      store.transaction(() =>
        store.delRow('t1', 'r2').setRow('t1', 'r2', {c2: 4, c1: 3, c3: 5}),
      );
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c1', 'c2', 'c3']));

    act(() => {
      queries.setQueryDefinition('q2', 't1', ({select, where}) => {
        select('c3');
        select('c2');
        select('c1');
        where('c1', 3);
      });
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify(['c3', 'c2', 'c1']));

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([]));
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(6);
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
    }) => didRender(<>{useResultCell(queryId, rowId, cellId, queries)}</>);
    act(() => {
      renderer = create(<Test queryId="q0" rowId="r0" cellId="c0" />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.update(<Test queryId="q1" rowId="r1" cellId="c1" />);
    });
    expect(renderer.toJSON()).toEqual('1');

    act(() => {
      store
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}})
        .setTables({t1: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}});
    });
    expect(renderer.toJSON()).toEqual('2');

    act(() => {
      renderer.update(<Test queryId="q2" rowId="r2" cellId="c2" />);
    });
    expect(renderer.toJSON()).toEqual('4');

    act(() => {
      store.delTable('t1');
    });
    expect(renderer.toJSON()).toBeNull();
    act(() => {
      renderer.update(<div />);
    });
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useCheckpointIds', () => {
    const checkpoints = createCheckpoints(store);
    const Test = () =>
      didRender(<>{JSON.stringify(useCheckpointIds(checkpoints))}</>);
    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([[], '0', []]));

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}});
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([['0'], undefined, []]));

    act(() => {
      checkpoints.addCheckpoint();
    });
    expect(renderer.toJSON()).toEqual(JSON.stringify([['0'], '1', []]));
    expect(didRender).toHaveBeenCalledTimes(3);
  });

  test('useUndoInformation', () => {
    const checkpoints = createCheckpoints(store);
    const Test = () => {
      const [canUndo, handleUndo, undoCheckpointId, undoLabel] =
        useUndoInformation(checkpoints);
      return didRender(
        <div onClick={handleUndo}>
          {JSON.stringify([canUndo, undoCheckpointId, undoLabel])}
        </div>,
      );
    };
    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([false, '0', '']),
    );

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}});
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([true, null, '']),
    );

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([false, '0', '']),
    );

    act(() => {
      store.setTables({t1: {r1: {c1: 3}}});
      checkpoints.addCheckpoint('one');
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([true, '2', 'one']),
    );

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([false, '0', '']),
    );
    expect(didRender).toHaveBeenCalledTimes(5);
  });

  test('useRedoInformation', () => {
    const checkpoints = createCheckpoints(store);
    const Test = () => {
      const [canRedo, handleRedo, redoCheckpointId, redoLabel] =
        useRedoInformation(checkpoints);
      return didRender(
        <div onClick={handleRedo}>
          {JSON.stringify([canRedo, redoCheckpointId, redoLabel])}
        </div>,
      );
    };
    act(() => {
      renderer = create(<Test />);
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([false, null, '']),
    );

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([false, null, '']),
    );

    act(() => {
      store.setTables({t1: {r1: {c1: 2}}});
      checkpoints.addCheckpoint('one');
      checkpoints.goBackward();
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([true, '1', 'one']),
    );

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(renderer.root.findByType('div').children[0]).toEqual(
      JSON.stringify([false, null, '']),
    );
    expect(didRender).toHaveBeenCalledTimes(3);
  });
});

describe('Write Hooks', () => {
  test('useSetTablesCallback', () => {
    const then = jest.fn((_store?: Store, _tables?: Tables) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, tables?: Tables) => void;
    }) => (
      <div
        onClick={useSetTablesCallback(
          (e) => ({t1: {r1: {c1: e.screenX * value}}}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {t1: {r1: {c1: 4}}});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetTableCallback', () => {
    const then = jest.fn((_store?: Store, _table?: Table) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, table?: Table) => void;
    }) => {
      return (
        <div
          onClick={useSetTableCallback<React.MouseEvent<HTMLDivElement>>(
            't1',
            (e) => ({r1: {c1: e.screenX * value}}),
            [value],
            store,
            then,
          )}
        />
      );
    };
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetTableCallback, parameterized Id', () => {
    const then = jest.fn((_store?: Store, _table?: Table) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, table?: Table) => void;
    }) => {
      return (
        <div
          onClick={useSetTableCallback<React.MouseEvent<HTMLDivElement>>(
            (e) => 't' + e.screenY,
            (e) => ({r1: {c1: e.screenX * value}}),
            [value],
            store,
            then,
          )}
        />
      );
    };
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2, screenY: 1});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

    act(() => {
      clickHandler1({screenX: 2, screenY: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {r1: {c1: 4}});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetRowCallback', () => {
    const then = jest.fn((_store: Store, _row: Row) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => (
      <div
        onClick={useSetRowCallback(
          't1',
          'r1',
          (e) => ({c1: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c1: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetRowCallback, parameterized Ids', () => {
    const then = jest.fn((_store: Store, _row: Row) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => (
      <div
        onClick={useSetRowCallback(
          (e) => 't' + e.screenY,
          (e) => 'r' + e.screenY,
          (e) => ({c1: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2, screenY: 1});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c1: 4});

    act(() => {
      clickHandler1({screenX: 2, screenY: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r2: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c1: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useAddRowCallback', () => {
    const then = jest.fn(
      (_rowId: Id | undefined, _store: Store, _row: Row) => null,
    );
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (rowId: Id | undefined, store: Store, row: Row) => void;
    }) => (
      <div
        onClick={useAddRowCallback(
          't1',
          (e) => ({c1: e.screenX * value}),
          [value],
          store,
          then,
        )}
        onFocus={useAddRowCallback(
          't1',
          (e) => ({c1: e.timeStamp * value}),
          [value],
          store,
        )}
        onBlur={useAddRowCallback(
          't1',
          (e) => ({c1: e.timeStamp}),
          undefined,
          store,
        )}
        onSelect={useAddRowCallback(
          't1',
          (e) => ({c1: e.timeStamp}),
          undefined,
          store,
          undefined,
          undefined,
          false,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    const focusHandler = renderer.root.findByType('div').props.onFocus;
    const blurHandler = renderer.root.findByType('div').props.onBlur;
    const selectHandler = renderer.root.findByType('div').props.onSelect;
    act(() => {
      clickHandler1({screenX: 2});
      focusHandler({timeStamp: 3});
      blurHandler({timeStamp: 5});
      selectHandler({timeStamp: 7});
    });
    expect(store.getTables()).toEqual({
      t1: {'0': {c1: 4}, '1': {c1: 6}, '2': {c1: 5}, '3': {c1: 7}, r1: {c1: 1}},
    });
    expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

    act(() => {
      store.delRow('t1', '3');
      blurHandler({timeStamp: 5});
    });
    expect(store.getTables()).toEqual({
      t1: {'0': {c1: 4}, '1': {c1: 6}, '2': {c1: 5}, '3': {c1: 5}, r1: {c1: 1}},
    });

    act(() => {
      store.delRow('t1', '3');
      selectHandler({timeStamp: 5});
    });
    expect(store.getTables()).toEqual({
      t1: {'0': {c1: 4}, '1': {c1: 6}, '2': {c1: 5}, '4': {c1: 5}, r1: {c1: 1}},
    });

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useAddRowCallback, parameterized Id', () => {
    const then = jest.fn(
      (_rowId: Id | undefined, _store: Store, _row: Row) => null,
    );
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (rowId: Id | undefined, store: Store, row: Row) => void;
    }) => (
      <div
        onClick={useAddRowCallback(
          (e) => 't' + e.screenY,
          (e) => ({c1: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2, screenY: 1});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1}, '0': {c1: 4}}});
    expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

    act(() => {
      clickHandler1({screenX: 2, screenY: 2});
    });
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1}, '0': {c1: 4}},
      t2: {'0': {c1: 4}},
    });
    expect(then).toHaveBeenCalledWith('0', store, {c1: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetPartialRowCallback', () => {
    const then = jest.fn((_store: Store, _row: Row) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => (
      <div
        onClick={useSetPartialRowCallback(
          't1',
          'r1',
          (e) => ({c2: e.screenX * value, c3: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 4, c3: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetPartialRowCallback, parameterized Ids', () => {
    const then = jest.fn((_store: Store, _row: Row) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, row: Row) => void;
    }) => (
      <div
        onClick={useSetPartialRowCallback(
          (e) => 't' + e.screenY,
          (e) => 'r' + e.screenY,
          (e) => ({c2: e.screenX * value, c3: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2, screenY: 1});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 1, c2: 4, c3: 4}}});
    expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

    act(() => {
      clickHandler1({screenX: 2, screenY: 2});
    });
    expect(store.getTables()).toEqual({
      t1: {r1: {c1: 1, c2: 4, c3: 4}},
      t2: {r2: {c2: 4, c3: 4}},
    });
    expect(then).toHaveBeenCalledWith(store, {c2: 4, c3: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetCellCallback', () => {
    const then = jest.fn((_store: Store, _cell: Cell | MapCell) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, cell: Cell | MapCell) => void;
    }) => (
      <div
        onClick={useSetCellCallback(
          't1',
          'r1',
          'c1',
          (e) => e.screenX * value,
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, 4);

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetCellCallback, parameterized Ids', () => {
    const then = jest.fn((_store: Store, _cell: Cell | MapCell) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, cell: Cell | MapCell) => void;
    }) => (
      <div
        onClick={useSetCellCallback(
          (e) => 't' + e.screenY,
          (e) => 'r' + e.screenY,
          (e) => 'c' + e.screenY,
          (e) => e.screenX * value,
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2, screenY: 1});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}});
    expect(then).toHaveBeenCalledWith(store, 4);

    act(() => {
      clickHandler1({screenX: 2, screenY: 2});
    });
    expect(store.getTables()).toEqual({t1: {r1: {c1: 4}}, t2: {r2: {c2: 4}}});
    expect(then).toHaveBeenCalledWith(store, 4);

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetValuesCallback', () => {
    const then = jest.fn((_store?: Store, _values?: Values) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, values?: Values) => void;
    }) => (
      <div
        onClick={useSetValuesCallback(
          (e) => ({v1: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getValues()).toEqual({v1: 4});
    expect(then).toHaveBeenCalledWith(store, {v1: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetPartialValuesCallback', () => {
    const then = jest.fn((_store: Store, _values: Values) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store: Store, values: Values) => void;
    }) => (
      <div
        onClick={useSetPartialValuesCallback(
          (e) => ({v2: e.screenX * value, v3: e.screenX * value}),
          [value],
          store,
          then,
        )}
      />
    );
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getValues()).toEqual({v1: 1, v2: 4, v3: 4});
    expect(then).toHaveBeenCalledWith(store, {v2: 4, v3: 4});

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetValueCallback', () => {
    const then = jest.fn((_store?: Store, _value?: Value | MapValue) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, value?: Value | MapValue) => void;
    }) => {
      return (
        <div
          onClick={useSetValueCallback<React.MouseEvent<HTMLDivElement>>(
            'v1',
            (e) => e.screenX * value,
            [value],
            store,
            then,
          )}
        />
      );
    };
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2});
    });
    expect(store.getValues()).toEqual({v1: 4});
    expect(then).toHaveBeenCalledWith(store, 4);

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useSetValueCallback, parameterized Id', () => {
    const then = jest.fn((_store?: Store, _value?: Value | MapValue) => null);
    const Test = ({
      value,
      then,
    }: {
      readonly value: number;
      readonly then: (store?: Store, value?: Value | MapValue) => void;
    }) => {
      return (
        <div
          onClick={useSetValueCallback<React.MouseEvent<HTMLDivElement>>(
            (e) => 'v' + e.screenY,
            (e) => e.screenX * value,
            [value],
            store,
            then,
          )}
        />
      );
    };
    act(() => {
      renderer = create(<Test value={2} then={then} />);
    });

    const clickHandler1 = renderer.root.findByType('div').props.onClick;
    act(() => {
      clickHandler1({screenX: 2, screenY: 1});
    });
    expect(store.getValues()).toEqual({v1: 4});
    expect(then).toHaveBeenCalledWith(store, 4);

    act(() => {
      clickHandler1({screenX: 2, screenY: 2});
    });
    expect(store.getValues()).toEqual({v1: 4, v2: 4});
    expect(then).toHaveBeenCalledWith(store, 4);

    act(() => {
      renderer.update(<Test value={3} then={then} />);
    });
    const clickHandler2 = renderer.root.findByType('div').props.onClick;
    expect(clickHandler1).not.toEqual(clickHandler2);
  });

  test('useDelTablesCallback', () => {
    const Test = () => <div onClick={useDelTablesCallback(store)} />;
    act(() => {
      renderer = create(<Test />);
    });

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(store.getTables()).toEqual({});
  });

  test('useDelTableCallback', () => {
    const Test = () => <div onClick={useDelTableCallback('t1', store)} />;
    act(() => {
      renderer = create(<Test />);
    });

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(store.getTables()).toEqual({});
  });

  test('useDelRowCallback', () => {
    const Test = () => <div onClick={useDelRowCallback('t1', 'r1', store)} />;
    act(() => {
      renderer = create(<Test />);
    });

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(store.getTables()).toEqual({});
  });

  test('useDelCellCallback', () => {
    const Test = () => (
      <div onClick={useDelCellCallback('t1', 'r1', 'c1', false, store)} />
    );
    act(() => {
      renderer = create(<Test />);
    });

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(store.getTables()).toEqual({});
  });

  test('useDelValuesCallback', () => {
    const Test = () => <div onClick={useDelValuesCallback(store)} />;
    act(() => {
      renderer = create(<Test />);
    });

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(store.getValues()).toEqual({});
  });

  test('useDelValueCallback', () => {
    const Test = () => <div onClick={useDelValueCallback('v1', store)} />;
    act(() => {
      renderer = create(<Test />);
    });

    act(() => {
      renderer.root.findByType('div').props.onClick();
    });
    expect(store.getValues()).toEqual({});
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
      const then = jest.fn(
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
        <div
          onClick={useSetCheckpointCallback(
            undefined,
            undefined,
            checkpoints,
            then,
          )}
        />
      );
      act(() => {
        renderer = create(<Test then={then} />);
      });
      store.setCell('t1', 'r1', 'c1', 4);

      const clickHandler1 = renderer.root.findByType('div').props.onClick;
      act(() => {
        clickHandler1({type: 'a'});
      });
      expect(checkpoints.getCheckpointIds()).toEqual([
        ['0', '1', '2'],
        '3',
        [],
      ]);
      expect(checkpoints.getCheckpoint('3')).toEqual('');
      expect(then).toHaveBeenCalledWith('3', checkpoints, undefined);
    });

    test('useSetCheckpointCallback with label', () => {
      const then = jest.fn(
        (_checkpointId: Id, _checkpoints: Checkpoints, _label?: string) => null,
      );
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
      }) => (
        <div
          onClick={useSetCheckpointCallback(
            (e) => e.type + suffix,
            [suffix],
            checkpoints,
            then,
          )}
        />
      );
      act(() => {
        renderer = create(<Test suffix="." then={then} />);
      });
      store.setCell('t1', 'r1', 'c1', 4);

      const clickHandler1 = renderer.root.findByType('div').props.onClick;
      act(() => {
        clickHandler1({type: 'a'});
      });
      expect(checkpoints.getCheckpointIds()).toEqual([
        ['0', '1', '2'],
        '3',
        [],
      ]);
      expect(checkpoints.getCheckpoint('3')).toEqual('a.');
      expect(then).toHaveBeenCalledWith('3', checkpoints, 'a.');

      act(() => {
        renderer = create(<Test suffix="!" />);
      });
      const clickHandler2 = renderer.root.findByType('div').props.onClick;
      expect(clickHandler1).not.toEqual(clickHandler2);
    });

    test('useGoBackwardCallback', () => {
      const Test = () => <div onClick={useGoBackwardCallback(checkpoints)} />;
      act(() => {
        renderer = create(<Test />);
      });

      act(() => {
        renderer.root.findByType('div').props.onClick();
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
      act(() => {
        renderer.root.findByType('div').props.onClick();
      });
      expect(checkpoints.getCheckpointIds()).toEqual([[], '0', ['1', '2']]);
    });

    test('useGoForwardCallback', () => {
      const Test = () => <div onClick={useGoForwardCallback(checkpoints)} />;
      act(() => {
        renderer = create(<Test />);
      });
      checkpoints.goTo('0');

      act(() => {
        renderer.root.findByType('div').props.onClick();
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
      act(() => {
        renderer.root.findByType('div').props.onClick();
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);
    });

    test('useGoToCallback', () => {
      const then = jest.fn(
        (_checkpoints: Checkpoints, _checkpointId: Id) => null,
      );
      const Test = ({
        then,
      }: {
        readonly then: (checkpoints: Checkpoints, checkpointId: Id) => void;
      }) => (
        <div
          onClick={useGoToCallback((e) => e.type, undefined, checkpoints, then)}
        />
      );
      act(() => {
        renderer = create(<Test then={then} />);
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      const clickHandler1 = renderer.root.findByType('div').props.onClick;
      act(() => {
        clickHandler1({type: '1'});
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
      expect(then).toHaveBeenCalledWith(checkpoints, '1');
    });

    test('useGoToCallback (no then)', () => {
      const Test = () => (
        <div onClick={useGoToCallback((e) => e.type, undefined, checkpoints)} />
      );
      act(() => {
        renderer = create(<Test />);
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0', '1'], '2', []]);

      const clickHandler1 = renderer.root.findByType('div').props.onClick;
      act(() => {
        clickHandler1({type: '1'});
      });
      expect(checkpoints.getCheckpointIds()).toEqual([['0'], '1', ['2']]);
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
      return <div />;
    };
    expect(store.getListenerStats().hasTables).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasTables).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasTables).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasTables).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().tables).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().tables).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().tables).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().tables).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().tableIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().tableIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t2', 'r1', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().tableIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t3', 'r1', 'c1', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().tableIds).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().hasTable).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasTable).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasTable).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasTable).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().table).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().table).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().table).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().table).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().tableCellIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r1', 'c2', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r1', 'c3', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().tableCellIds).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().hasTableCell).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasTableCell).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().rowCount).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().rowCount).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().rowCount).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().rowCount).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().rowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().rowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().rowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().rowIds).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().sortedRowIds).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().hasRow).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasRow).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasRow).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasRow).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().row).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().row).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().row).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().row).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().cellIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().cellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r1', 'c2', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().cellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r1', 'c3', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().cellIds).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().hasCell).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasCell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasCell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasCell).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().cell).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().cell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().cell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().cell).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().hasValues).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasValues).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasValues).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasValues).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().values).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().values).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().values).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().values).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().valueIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().valueIds).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
      store.setValue('v2', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().valueIds).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
      store.setValue('v3', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().valueIds).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().hasValue).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().hasValue).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().hasValue).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().hasValue).toEqual(0);
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
      return <div />;
    };
    expect(store.getListenerStats().value).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().value).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().value).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().value).toEqual(0);
  });

  test('useStartTransactionListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useStartTransactionListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        store,
      );
      return <div />;
    };
    expect(store.getListenerStats().transaction).toEqual(0);
    act(() => {
      renderer = create(<Test value={1} />);
    });
    expect(store.getListenerStats().transaction).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={2} />);
    });
    expect(store.getListenerStats().transaction).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('useWillFinishTransactionListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useWillFinishTransactionListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        store,
      );
      return <div />;
    };
    expect(store.getListenerStats().transaction).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().transaction).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().transaction).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().transaction).toEqual(0);
  });

  test('useDidFinishTransactionListener', () => {
    expect.assertions(6);
    const Test = ({value}: {readonly value: number}) => {
      useDidFinishTransactionListener(
        (store) => expect(store?.getValue('v1')).toEqual(value),
        [value],
        store,
      );
      return <div />;
    };
    expect(store.getListenerStats().transaction).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(store.getListenerStats().transaction).toEqual(1);
    act(() => {
      store.setValue('v1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(store.getListenerStats().transaction).toEqual(1);
    act(() => {
      store.setValue('v1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(store.getListenerStats().transaction).toEqual(0);
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
      return <div />;
    };
    expect(metrics.getListenerStats().metric).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(metrics.getListenerStats().metric).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(metrics.getListenerStats().metric).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(metrics.getListenerStats().metric).toEqual(0);
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
      return <div />;
    };
    expect(metrics.getListenerStats().metric).toEqual(0);
    act(() => {
      renderer = create(<Test />);
    });
    expect(metrics.getListenerStats().metric).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 1);
    });
    expect(metrics?.getMetric('m1')).toEqual(1);
    act(() => {
      renderer.update(<div />);
    });
    expect(metrics.getListenerStats().metric).toEqual(0);
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
      return <div />;
    };
    expect(indexes.getListenerStats().sliceIds).toEqual(0);
    act(() => {
      renderer = create(<Test value="a" />);
    });
    expect(indexes.getListenerStats().sliceIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'a');
    });
    act(() => {
      renderer.update(<Test value="b" />);
    });
    expect(indexes.getListenerStats().sliceIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'b');
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(indexes.getListenerStats().sliceIds).toEqual(0);
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
      return <div />;
    };
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value="a" />);
    });
    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'a');
    });
    act(() => {
      renderer.update(<Test value="b" />);
    });
    expect(indexes.getListenerStats().sliceRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'b');
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(indexes.getListenerStats().sliceRowIds).toEqual(0);
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
      return <div />;
    };
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);
    act(() => {
      renderer = create(<Test value="R1" />);
    });
    expect(relationships.getListenerStats().remoteRowId).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'R1');
    });
    act(() => {
      renderer.update(<Test value="R2" />);
    });
    expect(relationships.getListenerStats().remoteRowId).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'R2');
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(relationships.getListenerStats().remoteRowId).toEqual(0);
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
      return <div />;
    };
    expect(relationships.getListenerStats().localRowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value="r1" />);
    });
    expect(relationships.getListenerStats().localRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 'R1');
    });
    act(() => {
      renderer.update(<Test value="r2" />);
    });
    expect(relationships.getListenerStats().localRowIds).toEqual(1);
    act(() => {
      store.setTable('t1', {r1: {c1: 'R2'}, r2: {c1: 'R1'}});
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(relationships.getListenerStats().localRowIds).toEqual(0);
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
      return <div />;
    };
    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value="r3" />);
    });
    expect(relationships.getListenerStats().linkedRowIds).toEqual(1);
    act(() => {
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}},
      });
    });
    act(() => {
      renderer.update(<Test value="r4" />);
    });
    expect(relationships.getListenerStats().linkedRowIds).toEqual(1);
    act(() => {
      store.setTables({
        t1: {r1: {c1: 'r2'}, r2: {c1: 'r3'}, r3: {c1: 'r4'}},
      });
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(relationships.getListenerStats().linkedRowIds).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().table).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().table).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().table).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().table).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().tableCellIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().tableCellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().tableCellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      store.setCell('t1', 'r2', 'c2', 1);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().tableCellIds).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().rowCount).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().rowCount).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().rowCount).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      store.setCell('t1', 'r2', 'c2', 1);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().rowCount).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().rowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().rowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().rowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      store.setCell('t1', 'r2', 'c2', 1);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().rowIds).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().sortedRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r2', 'c1', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().sortedRowIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r3', 'c1', 0);
    });
    act(() => {
      store.setCell('t1', 'r2', 'c2', 1);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().sortedRowIds).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().row).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().row).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().row).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().row).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().cellIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().cellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
      store.setCell('t1', 'r1', 'c2', 0);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().cellIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
      store.setCell('t1', 'r1', 'c3', 0);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().cellIds).toEqual(0);
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
      return <div />;
    };
    expect(queries.getListenerStats().cell).toEqual(0);
    act(() => {
      renderer = create(<Test value={2} />);
    });
    expect(queries.getListenerStats().cell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value={3} />);
    });
    expect(queries.getListenerStats().cell).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 3);
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(queries.getListenerStats().cell).toEqual(0);
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
      return <div />;
    };
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
    act(() => {
      renderer = create(<Test value={undefined} />);
    });
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);
    act(() => {
      store.setCell('t1', 'r1', 'c1', 2);
    });
    act(() => {
      renderer.update(<Test value="1" />);
    });
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(1);
    act(() => {
      checkpoints.addCheckpoint();
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(checkpoints.getListenerStats().checkpointIds).toEqual(0);
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
      return <div />;
    };
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
    act(() => {
      renderer = create(<Test value="c1" />);
    });
    expect(checkpoints.getListenerStats().checkpoint).toEqual(1);
    act(() => {
      checkpoints.setCheckpoint('0', 'c1');
    });
    act(() => {
      renderer.update(<Test value="c2" />);
    });
    expect(checkpoints.getListenerStats().checkpoint).toEqual(1);
    act(() => {
      checkpoints.setCheckpoint('0', 'c2');
    });
    act(() => {
      renderer.update(<div />);
    });
    expect(checkpoints.getListenerStats().checkpoint).toEqual(0);
  });
});
