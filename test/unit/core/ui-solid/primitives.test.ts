import type {Accessor, Setter} from 'solid-js';
import {createRoot, createSignal} from 'solid-js';
import type {MergeableStore, Store, Table} from 'tinybase';
import {createStore} from 'tinybase';
import {createMergeableStore} from 'tinybase/mergeable-store';
import type {Persister, Persists} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {
  useCell,
  useCellListener,
  useCreatePersister,
  useCreateSynchronizer,
  useSetCellCallback,
  useTable,
  useTables,
  useTablesListener,
} from 'tinybase/ui-solid';
import {describe, expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';

type TestPersister = Persister<Persists.StoreOnly> & {destroy: () => void};
type TestSynchronizer = Synchronizer & {destroy: () => void};
type StringCellSetter = (cell: string) => void;

const createTestPersister = () =>
  ({destroy: vi.fn()}) as unknown as TestPersister;

const createTestSynchronizer = () =>
  ({destroy: vi.fn()}) as unknown as TestSynchronizer;

const renderPrimitive = (primitive: () => void) => {
  return createRoot((dispose) => {
    primitive();
    return dispose;
  });
};

describe('ui-solid primitives', () => {
  test('reads and updates tables', async () => {
    const store = createStore().setTables({t1: {r1: {c1: 1}}});
    let tables: Accessor<ReturnType<Store['getTables']>>;

    const dispose = renderPrimitive(() => {
      tables = useTables(store);
    });

    expect(tables!()).toEqual({t1: {r1: {c1: 1}}});

    store.setCell('t1', 'r1', 'c1', 2);
    await pause();
    expect(tables!()).toEqual({t1: {r1: {c1: 2}}});

    dispose();
  });

  test('updates when accessor arguments change', async () => {
    const store = createStore().setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}},
    });
    let table: Accessor<Table>;
    let setTableId: Setter<string>;

    const dispose = renderPrimitive(() => {
      const [tableId, setId] = createSignal('t1');
      table = useTable(tableId, store);
      setTableId = setId;
    });

    expect(table!()).toEqual({r1: {c1: 1}});

    setTableId!('t2');
    await pause();
    expect(table!()).toEqual({r1: {c1: 2}});

    dispose();
  });

  test('sets cells with callbacks', () => {
    const store = createStore().setCell('t1', 'r1', 'c1', 1);
    let cell: Accessor<ReturnType<Store['getCell']>>;
    let setCell: StringCellSetter;

    const dispose = renderPrimitive(() => {
      cell = useCell('t1', 'r1', 'c1', store);
      setCell = useSetCellCallback(
        't1',
        'r1',
        'c1',
        (cell: string) => cell,
        store,
      );
    });

    expect(cell!()).toBe(1);

    setCell!('changed');
    expect(store.getCell('t1', 'r1', 'c1')).toBe('changed');
    expect(cell!()).toBe('changed');

    dispose();
  });

  test('calls listeners', async () => {
    const store = createStore().setCell('t1', 'r1', 'c1', 1);
    const cellListener = vi.fn();
    const tablesListener = vi.fn();

    const dispose = renderPrimitive(() => {
      useCellListener('t1', 'r1', 'c1', cellListener, false, store);
      useTablesListener(tablesListener, false, store);
    });

    store.setCell('t1', 'r1', 'c1', 2);
    await pause();

    expect(cellListener).toHaveBeenCalledTimes(1);
    expect(tablesListener).toHaveBeenCalledTimes(1);

    dispose();
  });

  test('destroys late persister when owner is disposed', async () => {
    const persister = createTestPersister();
    let resolveCreate: (persister: TestPersister) => void;
    const create = vi.fn(
      () =>
        new Promise<TestPersister>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const then = vi.fn();

    const dispose = renderPrimitive(() => {
      useCreatePersister(createStore(), create, then);
    });

    await pause();
    dispose();
    resolveCreate!(persister);
    await pause();

    expect(create).toHaveBeenCalledTimes(1);
    expect(then).not.toHaveBeenCalled();
    expect(persister.destroy).toHaveBeenCalledTimes(1);
  });

  test('recreates persister when accessor store changes', async () => {
    const store1 = createStore();
    const store2 = createStore();
    const persister1 = createTestPersister();
    const persister2 = createTestPersister();
    const create = vi
      .fn()
      .mockResolvedValueOnce(persister1)
      .mockResolvedValueOnce(persister2);
    let persister: Accessor<TestPersister | undefined>;
    let setStore: Setter<Store>;

    const dispose = renderPrimitive(() => {
      const [store, setResolvedStore] = createSignal(store1);
      persister = useCreatePersister(store, create);
      setStore = setResolvedStore;
    });

    await pause();
    expect(persister!()).toBe(persister1);

    setStore!(store2);
    await pause();
    expect(persister!()).toBe(persister2);
    expect(persister1.destroy).toHaveBeenCalledTimes(1);

    dispose();
    expect(persister2.destroy).toHaveBeenCalledTimes(1);
  });

  test('destroys late synchronizer when owner is disposed', async () => {
    const synchronizer = createTestSynchronizer();
    let resolveCreate: (synchronizer: TestSynchronizer) => void;
    const create = vi.fn(
      () =>
        new Promise<TestSynchronizer>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const dispose = renderPrimitive(() => {
      useCreateSynchronizer(createMergeableStore(), create);
    });

    await pause();
    dispose();
    resolveCreate!(synchronizer);
    await pause();

    expect(create).toHaveBeenCalledTimes(1);
    expect(synchronizer.destroy).toHaveBeenCalledTimes(1);
  });

  test('recreates synchronizer when accessor store changes', async () => {
    const store1 = createMergeableStore();
    const store2 = createMergeableStore();
    const synchronizer1 = createTestSynchronizer();
    const synchronizer2 = createTestSynchronizer();
    const create = vi
      .fn()
      .mockResolvedValueOnce(synchronizer1)
      .mockResolvedValueOnce(synchronizer2);
    let synchronizer: Accessor<TestSynchronizer | undefined>;
    let setStore: Setter<MergeableStore>;

    const dispose = renderPrimitive(() => {
      const [store, setResolvedStore] = createSignal(store1);
      synchronizer = useCreateSynchronizer(store, create);
      setStore = setResolvedStore;
    });

    await pause();
    expect(synchronizer!()).toBe(synchronizer1);

    setStore!(store2);
    await pause();
    expect(synchronizer!()).toBe(synchronizer2);
    expect(synchronizer1.destroy).toHaveBeenCalledTimes(1);

    dispose();
    expect(synchronizer2.destroy).toHaveBeenCalledTimes(1);
  });
});
