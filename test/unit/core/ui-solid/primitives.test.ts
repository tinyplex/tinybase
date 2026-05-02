import type {Accessor, JSXElement, Setter} from 'solid-js';
import {createRoot, createSignal} from 'solid-js';
import {render as solidRender} from 'solid-js/web';
import type {Id, MergeableStore, Store, Table} from 'tinybase';
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {createMergeableStore} from 'tinybase/mergeable-store';
import type {Persister, Persists} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {
  useAddRowCallback,
  useCell,
  useCellIds,
  useCellListener,
  useCheckpoint,
  useCheckpointIds,
  useCreatePersister,
  useCreateSynchronizer,
  useDelCellCallback,
  useHasCell,
  useHasRow,
  useHasTable,
  useHasTableCell,
  useHasTables,
  useHasValue,
  useHasValues,
  useIndexIds,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
  useMetricIds,
  useParamValue,
  useParamValues,
  useQueryIds,
  useRelationshipIds,
  useRemoteRowId,
  useResultCell,
  useResultCellIds,
  useResultRow,
  useResultRowCount,
  useResultRowIds,
  useResultSortedRowIds,
  useResultTable,
  useResultTableCellIds,
  useRow,
  useRowCount,
  useRowIds,
  useSetCellCallback,
  useSetCheckpointCallback,
  useSetParamValueCallback,
  useSetRowCallback,
  useSliceIds,
  useSliceRowIds,
  useSortedRowIds,
  useTable,
  useTableCellIds,
  useTableIds,
  useTables,
  useTablesListener,
  useValue,
  useValueIds,
  useValues,
  useValuesState,
} from 'tinybase/ui-solid';
import {describe, expect, test, vi} from 'vitest';
import {pause} from '../../common/other.ts';
import {testStoreReadFunctions} from '../ui-common/functions.ts';
import {testContextPrimitives} from '../ui-common/primitives.ts';
import {ContextPrimitiveNoContext} from './components/ContextPrimitiveNoContext.tsx';
import {ContextPrimitiveThings} from './components/ContextPrimitiveThings.tsx';

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

type Props = {[key: string]: unknown};
type SolidComponent = (props: Props) => JSXElement;

const primitiveHarness = {
  act: async (callback: () => unknown) => {
    callback();
    await pause();
  },
  render: (component: unknown, props: Props = {}) => {
    const container = document.createElement('div');
    let currentProps = props;
    const Component = component as SolidComponent;
    let unmount = solidRender(() => Component(currentProps), container);
    return {
      container,
      rerender: async (nextProps: Props) => {
        unmount();
        currentProps = {...currentProps, ...nextProps};
        unmount = solidRender(() => Component(currentProps), container);
        await pause();
      },
      unmount: () => unmount(),
    };
  },
};

const Reader = ({
  mode,
  store,
  tableId,
  rowId,
  cellId,
  valueId,
  descending,
  offset,
  limit,
}: {
  readonly mode: string;
  readonly store: Store;
  readonly tableId?: Id;
  readonly rowId?: Id;
  readonly cellId?: Id;
  readonly valueId?: Id;
  readonly descending?: boolean;
  readonly offset?: number;
  readonly limit?: number;
}) => {
  const hasTables = useHasTables(store);
  const tables = useTables(store);
  const tableIds = useTableIds(store);
  const hasTable = useHasTable(() => tableId, store);
  const table = useTable(() => tableId, store);
  const tableCellIds = useTableCellIds(() => tableId, store);
  const hasTableCell = useHasTableCell(
    () => tableId,
    () => cellId,
    store,
  );
  const rowCount = useRowCount(() => tableId, store);
  const rowIds = useRowIds(() => tableId, store);
  const sortedRowIds = useSortedRowIds(
    () => tableId,
    () => cellId,
    () => descending,
    () => offset,
    () => limit,
    store,
  );
  const hasRow = useHasRow(
    () => tableId,
    () => rowId,
    store,
  );
  const row = useRow(
    () => tableId,
    () => rowId,
    store,
  );
  const cellIds = useCellIds(
    () => tableId,
    () => rowId,
    store,
  );
  const hasCell = useHasCell(
    () => tableId,
    () => rowId,
    () => cellId,
    store,
  );
  const cell = useCell(
    () => tableId,
    () => rowId,
    () => cellId,
    store,
  );
  const hasValues = useHasValues(store);
  const values = useValues(store);
  const valueIds = useValueIds(store);
  const hasValue = useHasValue(() => valueId, store);
  const storeValue = useValue(() => valueId, store);
  const valueToRender =
    mode == 'hasTables'
      ? hasTables
      : mode == 'tables'
        ? tables
        : mode == 'tableIds'
          ? tableIds
          : mode == 'hasTable'
            ? hasTable
            : mode == 'table'
              ? table
              : mode == 'tableCellIds'
                ? tableCellIds
                : mode == 'hasTableCell'
                  ? hasTableCell
                  : mode == 'rowCount'
                    ? rowCount
                    : mode == 'rowIds'
                      ? rowIds
                      : mode == 'sortedRowIds'
                        ? sortedRowIds
                        : mode == 'hasRow'
                          ? hasRow
                          : mode == 'row'
                            ? row
                            : mode == 'cellIds'
                              ? cellIds
                              : mode == 'hasCell'
                                ? hasCell
                                : mode == 'cell'
                                  ? cell
                                  : mode == 'hasValues'
                                    ? hasValues
                                    : mode == 'values'
                                      ? values
                                      : mode == 'valueIds'
                                        ? valueIds
                                        : mode == 'hasValue'
                                          ? hasValue
                                          : mode == 'value'
                                            ? storeValue
                                            : () => undefined;
  return (() => JSON.stringify(valueToRender())) as unknown as JSXElement;
};

testContextPrimitives('ui-solid', primitiveHarness, {
  Things: ContextPrimitiveThings,
  NoContext: ContextPrimitiveNoContext,
  hasStores: true,
});

testStoreReadFunctions('ui-solid', primitiveHarness, {Reader});

describe('Solid-specific', () => {
  test('reads core store primitives', async () => {
    const store = createStore()
      .setTables({t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3}}})
      .setValues({v1: 4});
    let values: {
      hasTables: Accessor<boolean>;
      tables: Accessor<ReturnType<Store['getTables']>>;
      tableIds: Accessor<string[]>;
      hasTable: Accessor<boolean>;
      table: Accessor<Table>;
      tableCellIds: Accessor<string[]>;
      rowCount: Accessor<number>;
      rowIds: Accessor<string[]>;
      sortedRowIds: Accessor<string[]>;
      hasRow: Accessor<boolean>;
      row: Accessor<ReturnType<Store['getRow']>>;
      hasCell: Accessor<boolean>;
      cell: Accessor<ReturnType<Store['getCell']>>;
      hasValues: Accessor<boolean>;
      storeValues: Accessor<ReturnType<Store['getValues']>>;
      valueIds: Accessor<string[]>;
      hasValue: Accessor<boolean>;
      value: Accessor<ReturnType<Store['getValue']>>;
    };

    const dispose = renderPrimitive(() => {
      values = {
        hasTables: useHasTables(store),
        tables: useTables(store),
        tableIds: useTableIds(store),
        hasTable: useHasTable('t1', store),
        table: useTable('t1', store),
        tableCellIds: useTableCellIds('t1', store),
        rowCount: useRowCount('t1', store),
        rowIds: useRowIds('t1', store),
        sortedRowIds: useSortedRowIds('t2', 'c1', true, 0, undefined, store),
        hasRow: useHasRow('t1', 'r1', store),
        row: useRow('t1', 'r1', store),
        hasCell: useHasCell('t1', 'r1', 'c1', store),
        cell: useCell('t1', 'r1', 'c1', store),
        hasValues: useHasValues(store),
        storeValues: useValues(store),
        valueIds: useValueIds(store),
        hasValue: useHasValue('v1', store),
        value: useValue('v1', store),
      };
    });

    expect(values!.hasTables()).toBe(true);
    expect(values!.tables()).toEqual({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3}},
    });
    expect(values!.tableIds()).toEqual(['t1', 't2']);
    expect(values!.hasTable()).toBe(true);
    expect(values!.table()).toEqual({r1: {c1: 1}});
    expect(values!.tableCellIds()).toEqual(['c1']);
    expect(values!.rowCount()).toBe(1);
    expect(values!.rowIds()).toEqual(['r1']);
    expect(values!.sortedRowIds()).toEqual(['r2', 'r1']);
    expect(values!.hasRow()).toBe(true);
    expect(values!.row()).toEqual({c1: 1});
    expect(values!.hasCell()).toBe(true);
    expect(values!.cell()).toBe(1);
    expect(values!.hasValues()).toBe(true);
    expect(values!.storeValues()).toEqual({v1: 4});
    expect(values!.valueIds()).toEqual(['v1']);
    expect(values!.hasValue()).toBe(true);
    expect(values!.value()).toBe(4);

    store.setCell('t1', 'r2', 'c1', 5).setValue('v1', 6);
    await pause();

    expect(values!.tables()).toEqual({
      t1: {r1: {c1: 1}, r2: {c1: 5}},
      t2: {r1: {c1: 2}, r2: {c1: 3}},
    });
    expect(values!.rowCount()).toBe(2);
    expect(values!.rowIds()).toEqual(['r1', 'r2']);
    expect(values!.value()).toBe(6);

    dispose();
  });

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

  test('reads derived primitives', async () => {
    const store = createStore()
      .setTables({
        t1: {r1: {c1: 1}, r2: {c1: 1}},
        t2: {R1: {C1: 3}},
        t3: {a: {c1: 'b'}, b: {c1: 'c'}, c: {c1: 'd'}},
      })
      .setValues({v1: 1});
    const metrics = createMetrics(store).setMetricDefinition('m1', 't1');
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const relationships = createRelationships(store)
      .setRelationshipDefinition('r1', 't1', 't2', 'c1')
      .setRelationshipDefinition('r2', 't3', 't3', 'c1');
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    const checkpoints = createCheckpoints(store);
    let values: {
      metricIds: Accessor<string[]>;
      metric: Accessor<number | undefined>;
      indexIds: Accessor<string[]>;
      sliceIds: Accessor<string[]>;
      sliceRowIds: Accessor<string[]>;
      relationshipIds: Accessor<string[]>;
      remoteRowId: Accessor<string | undefined>;
      localRowIds: Accessor<string[]>;
      linkedRowIds: Accessor<string[]>;
      queryIds: Accessor<string[]>;
      resultTable: Accessor<Table>;
      resultTableCellIds: Accessor<string[]>;
      resultRowCount: Accessor<number>;
      resultRowIds: Accessor<string[]>;
      resultSortedRowIds: Accessor<string[]>;
      resultRow: Accessor<ReturnType<Store['getRow']>>;
      resultCellIds: Accessor<string[]>;
      resultCell: Accessor<ReturnType<Store['getCell']>>;
      paramValues: Accessor<Record<string, unknown>>;
      paramValue: Accessor<unknown>;
      checkpointIds: Accessor<ReturnType<typeof checkpoints.getCheckpointIds>>;
      checkpoint: Accessor<string | undefined>;
    };

    checkpoints.setCheckpoint('0', 'start');

    const dispose = renderPrimitive(() => {
      values = {
        metricIds: useMetricIds(metrics),
        metric: useMetric('m1', metrics),
        indexIds: useIndexIds(indexes),
        sliceIds: useSliceIds('i1', indexes),
        sliceRowIds: useSliceRowIds('i1', '1', indexes),
        relationshipIds: useRelationshipIds(relationships),
        remoteRowId: useRemoteRowId('r1', 'r1', relationships),
        localRowIds: useLocalRowIds('r1', '1', relationships),
        linkedRowIds: useLinkedRowIds('r2', 'a', relationships),
        queryIds: useQueryIds(queries),
        resultTable: useResultTable('q1', queries),
        resultTableCellIds: useResultTableCellIds('q1', queries),
        resultRowCount: useResultRowCount('q1', queries),
        resultRowIds: useResultRowIds('q1', queries),
        resultSortedRowIds: useResultSortedRowIds(
          'q1',
          'c1',
          true,
          0,
          undefined,
          queries,
        ),
        resultRow: useResultRow('q1', 'r1', queries),
        resultCellIds: useResultCellIds('q1', 'r1', queries),
        resultCell: useResultCell('q1', 'r1', 'c1', queries),
        paramValues: useParamValues('q1', queries),
        paramValue: useParamValue('q1', 'p1', queries),
        checkpointIds: useCheckpointIds(checkpoints),
        checkpoint: useCheckpoint('0', checkpoints),
      };
    });

    expect(values!.metricIds()).toEqual(['m1']);
    expect(values!.metric()).toBe(2);
    expect(values!.indexIds()).toEqual(['i1']);
    expect(values!.sliceIds()).toEqual(['1']);
    expect(values!.sliceRowIds()).toEqual(['r1', 'r2']);
    expect(values!.relationshipIds()).toEqual(['r1', 'r2']);
    expect(values!.remoteRowId()).toBe('1');
    expect(values!.localRowIds()).toEqual(['r1', 'r2']);
    expect(values!.linkedRowIds()).toEqual(['a', 'b', 'c', 'd']);
    expect(values!.queryIds()).toEqual(['q1']);
    expect(values!.resultTable()).toEqual({r1: {c1: 1}, r2: {c1: 1}});
    expect(values!.resultTableCellIds()).toEqual(['c1']);
    expect(values!.resultRowCount()).toBe(2);
    expect(values!.resultRowIds()).toEqual(['r1', 'r2']);
    expect(values!.resultSortedRowIds()).toEqual(['r2', 'r1']);
    expect(values!.resultRow()).toEqual({c1: 1});
    expect(values!.resultCellIds()).toEqual(['c1']);
    expect(values!.resultCell()).toBe(1);
    expect(values!.paramValues()).toEqual({});
    expect(values!.paramValue()).toBeUndefined();
    expect(values!.checkpointIds()).toEqual([[], '0', []]);
    expect(values!.checkpoint()).toBe('start');

    store.setCell('t1', 'r3', 'c1', 2);
    queries.setParamValue('q1', 'p1', 'p1');
    await pause();

    expect(values!.metric()).toBe(3);
    expect(values!.sliceIds()).toEqual(['1', '2']);
    expect(values!.resultRowCount()).toBe(3);
    expect(values!.resultSortedRowIds()).toEqual(['r3', 'r2', 'r1']);
    expect(values!.paramValue()).toBe('p1');

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

  test('sets and deletes data with callbacks', async () => {
    const store = createStore().setTables({t1: {r1: {c1: 1}}});
    const checkpoints = createCheckpoints(store);
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => select('c1'),
    );
    let row: Accessor<ReturnType<Store['getRow']>>;
    let values: Accessor<ReturnType<Store['getValues']>>;
    let resultCell: Accessor<ReturnType<Store['getCell']>>;
    let setRow: (row: {c1: number}) => void;
    let addRow: (row: {c1: number}) => void;
    let delCell: () => void;
    let setValues: (values: {v1: number}) => void;
    let setParamValue: (value: string) => void;
    let addCheckpoint: (label: string) => void;
    const rowThen = vi.fn();
    const checkpointThen = vi.fn();

    const dispose = renderPrimitive(() => {
      row = useRow('t1', 'r1', store);
      [values, setValues] = useValuesState(store);
      resultCell = useResultCell('q1', 'r1', 'c1', queries);
      setRow = useSetRowCallback(
        't1',
        'r1',
        (row: {c1: number}) => row,
        store,
        rowThen,
      );
      addRow = useAddRowCallback('t1', (row: {c1: number}) => row, store);
      delCell = useDelCellCallback('t1', 'r1', 'c1', true, store);
      setParamValue = useSetParamValueCallback(
        'q1',
        'p1',
        (value: string) => value,
        queries,
      );
      addCheckpoint = useSetCheckpointCallback(
        (label: string) => label,
        checkpoints,
        checkpointThen,
      );
    });

    setRow!({c1: 2});
    await pause();
    expect(row!()).toEqual({c1: 2});
    expect(rowThen).toHaveBeenCalledTimes(1);

    addRow!({c1: 3});
    await pause();
    expect(store.getRowIds('t1')).toEqual(['r1', '0']);

    delCell!();
    setValues!({v1: 4});
    setParamValue!('value');
    addCheckpoint!('label');
    await pause();

    expect(resultCell!()).toBeUndefined();
    expect(values!()).toEqual({v1: 4});
    expect(queries.getParamValue('q1', 'p1')).toBe('value');
    expect(checkpoints.getCheckpoint('1')).toBe('label');
    expect(checkpointThen).toHaveBeenCalledTimes(1);

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
