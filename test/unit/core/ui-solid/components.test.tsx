/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import {render as solidRender} from 'solid-js/web';
import type {
  Checkpoints,
  Id,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import {createStore} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import type {
  BackwardCheckpointsProps,
  CellProps,
  IndexProps,
  LinkedRowsProps,
  LocalRowsProps,
  MetricProps,
  RemoteRowProps,
  ResultCellProps,
  ResultRowProps,
  ResultSortedTableProps,
  ResultTableProps,
  RowProps,
  SliceProps,
  SortedTableProps,
  TableProps,
  TablesProps,
  ValueProps,
  ValuesProps,
} from 'tinybase/ui-solid';
import {
  BackwardCheckpointsView,
  CellView,
  CheckpointView,
  CurrentCheckpointView,
  ForwardCheckpointsView,
  IndexView,
  LinkedRowsView,
  LocalRowsView,
  MetricView,
  Provider,
  RemoteRowView,
  ResultCellView,
  ResultRowView,
  ResultSortedTableView,
  ResultTableView,
  RowView,
  SliceView,
  SortedTableView,
  TablesView,
  TableView,
  useCheckpoints,
  useIndexes,
  useMetrics,
  usePersister,
  useProvideCheckpoints,
  useProvideIndexes,
  useProvideMetrics,
  useProvidePersister,
  useProvideQueries,
  useProvideRelationships,
  useProvideStore,
  useProvideSynchronizer,
  useQueries,
  useRelationships,
  useStore,
  useStoreIds,
  useStores,
  useSynchronizer,
  ValuesView,
  ValueView,
} from 'tinybase/ui-solid';
import * as UiSolid from 'tinybase/ui-solid/with-schemas';
import type {NoSchemas, Store as StoreWithSchemas} from 'tinybase/with-schemas';
import {expect, test} from 'vitest';
import {pause} from '../../common/other.ts';
import {
  testComponents,
  testCustomCheckpointComponents,
  testCustomComponents,
  testProviderComponents,
} from '../ui-common/components.ts';

const {Provider: Provider2, useStore: useStore2} =
  UiSolid as UiSolid.WithSchemas<NoSchemas>;
type NoSchemasStore = StoreWithSchemas<NoSchemas>;
const asNoSchemasStore = (store: Store) => store as unknown as NoSchemasStore;

const sep = '/';
type Props = {[key: string]: unknown};

const componentHarness = {
  separator: sep,
  act: async (callback: () => unknown) => {
    callback();
    await pause();
  },
  render: (component: unknown, props: Props) => {
    const Component = component as (props: Props) => JSXElement;
    let currentProps = props;
    const container = document.createElement('div');
    let unmount = solidRender(() => <Component {...currentProps} />, container);
    return {
      container,
      rerender: async (nextProps: Props) => {
        unmount();
        currentProps = {...currentProps, ...nextProps};
        unmount = solidRender(() => <Component {...currentProps} />, container);
        await pause();
      },
      unmount: () => unmount(),
    };
  },
};

const TestTablesView = (
  props: TablesProps & {readonly cellPrefix?: string},
) => (
  <TablesView
    {...props}
    tableComponent={TestTableView}
    getTableComponentProps={(_tableId: Id) => ({
      cellPrefix: props.cellPrefix,
    })}
  />
);

const TestTableView = (props: TableProps & {readonly cellPrefix?: string}) => (
  <>
    {props.tableId}:
    <TableView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestSortedTableView = (
  props: SortedTableProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.tableId},{props.cellId}:
    <SortedTableView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestRowView = (props: RowProps & {readonly cellPrefix?: string}) => (
  <>
    {props.rowId}:
    <RowView
      {...props}
      cellComponent={TestCellView}
      getCellComponentProps={(_cellId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestCellView = (props: CellProps & {readonly cellPrefix?: string}) => (
  <>
    {props.cellId}
    {props.cellPrefix}
    <CellView {...props} />
  </>
);

const TestValuesView = (
  props: ValuesProps & {readonly valuePrefix?: string},
) => (
  <ValuesView
    {...props}
    valueComponent={TestValueView}
    getValueComponentProps={(_valueId: Id) => ({
      valuePrefix: props.valuePrefix,
    })}
  />
);

const TestValueView = (props: ValueProps & {readonly valuePrefix?: string}) => (
  <>
    {props.valueId}
    {props.valuePrefix}
    <ValueView {...props} />
  </>
);

const TestMetricView = (props: MetricProps) => (
  <>
    {props.metricId}:<MetricView {...props} />
  </>
);

const TestIndexView = (props: IndexProps & {readonly cellPrefix?: string}) => (
  <>
    {props.indexId}:
    <IndexView
      {...props}
      sliceComponent={TestSliceView}
      getSliceComponentProps={(_sliceId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestSliceView = (props: SliceProps & {readonly cellPrefix?: string}) => (
  <>
    {props.sliceId}:
    <SliceView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestRemoteRowView = (
  props: RemoteRowProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.localRowId}:
    <RemoteRowView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestLocalRowsView = (
  props: LocalRowsProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.remoteRowId}:
    <LocalRowsView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestLinkedRowsView = (
  props: LinkedRowsProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.firstRowId}:
    <LinkedRowsView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestResultTableView = (
  props: ResultTableProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.queryId}:
    <ResultTableView
      {...props}
      resultRowComponent={TestResultRowView}
      getResultRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestResultSortedTableView = (
  props: ResultSortedTableProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.queryId},{props.cellId}:
    <ResultSortedTableView
      {...props}
      resultRowComponent={TestResultRowView}
      getResultRowComponentProps={(_rowId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestResultRowView = (
  props: ResultRowProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.rowId}:
    <ResultRowView
      {...props}
      resultCellComponent={TestResultCellView}
      getResultCellComponentProps={(_cellId: Id) => ({
        cellPrefix: props.cellPrefix,
      })}
    />
  </>
);

const TestResultCellView = (
  props: ResultCellProps & {readonly cellPrefix?: string},
) => (
  <>
    {props.cellId}
    {props.cellPrefix}
    <ResultCellView {...props} />
  </>
);

const TestAllCheckpointsView = (props: BackwardCheckpointsProps) => (
  <>
    <BackwardCheckpointsView {...props} />
    |
    <CurrentCheckpointView {...props} />
    |
    <ForwardCheckpointsView {...props} />
    |
    <CheckpointView {...props} checkpointId="" />|
  </>
);

testComponents('ui-solid', componentHarness, {
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

testCustomComponents('ui-solid', componentHarness, {
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

testCustomCheckpointComponents('ui-solid', componentHarness, {
  CheckpointsView: TestAllCheckpointsView,
});

const ContextNested = ({
  store1,
  store2,
  outerStores,
  innerStores,
}: {
  readonly store1: Store;
  readonly store2: Store;
  readonly outerStores: {[storeId: string]: Store};
  readonly innerStores: {[storeId: string]: Store};
}) => (
  <Provider storesById={outerStores}>
    <Provider storesById={innerStores}>
      <ContextNestedChild store1={store1} store2={store2} />
    </Provider>
  </Provider>
);

const ContextNestedChild = ({
  store1,
  store2,
}: {
  readonly store1: Store;
  readonly store2: Store;
}) => {
  const storeIds = useStoreIds();
  const storeA = useStore('a');
  const storeB = useStore('b');
  return (
    <>
      {JSON.stringify(storeIds())}
      {storeA() == store1 ? 1 : 0}
      {storeA() == store2 ? 1 : 0}
      {storeB() == store1 ? 1 : 0}
      {storeB() == store2 ? 1 : 0}
    </>
  );
};

const ContextNestedDifferent = ({
  store1,
  store2,
}: {
  readonly store1: Store;
  readonly store2: Store;
}) => (
  <Provider storesById={{a: store1}}>
    <Provider2 storesById={{b: asNoSchemasStore(store2)}}>
      <ContextNestedDifferentChild store1={store1} store2={store2} />
    </Provider2>
  </Provider>
);

const ContextNestedDifferentChild = ({
  store1,
  store2,
}: {
  readonly store1: Store;
  readonly store2: Store;
}) => {
  const storeIds = useStoreIds();
  const storeA = useStore('a');
  const store2A = useStore2('a');
  const storeB = useStore('b');
  const store2B = useStore2('b');
  return (
    <>
      {JSON.stringify(storeIds())}
      {storeA() == store1 ? 1 : 0}
      {store2A() == asNoSchemasStore(store2) ? 1 : 0}
      {storeB() == store1 ? 1 : 0}
      {store2B() == asNoSchemasStore(store2) ? 1 : 0}
    </>
  );
};

const ContextProvideThings = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}) => (
  <Provider>
    <ContextProvideThingsInner
      store={store}
      metrics={metrics}
      indexes={indexes}
      relationships={relationships}
      queries={queries}
      checkpoints={checkpoints}
      persister={persister}
      synchronizer={synchronizer}
    />
  </Provider>
);

const ContextProvideThingsInner = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}) => {
  useProvideStore('store1', store);
  useProvideMetrics('metrics1', metrics);
  useProvideIndexes('indexes1', indexes);
  useProvideRelationships('relationships1', relationships);
  useProvideQueries('queries1', queries);
  useProvideCheckpoints('checkpoints1', checkpoints);
  useProvidePersister('persister1', persister);
  useProvideSynchronizer('synchronizer1', synchronizer);
  return (
    <ContextProvidedThings
      store={store}
      metrics={metrics}
      indexes={indexes}
      relationships={relationships}
      queries={queries}
      checkpoints={checkpoints}
      persister={persister}
      synchronizer={synchronizer}
    />
  );
};

const ContextProvidedThings = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}) => {
  const providedStore = useStore('store1');
  const providedMetrics = useMetrics('metrics1');
  const providedIndexes = useIndexes('indexes1');
  const providedRelationships = useRelationships('relationships1');
  const providedQueries = useQueries('queries1');
  const providedCheckpoints = useCheckpoints('checkpoints1');
  const providedPersister = usePersister('persister1');
  const providedSynchronizer = useSynchronizer('synchronizer1');
  return (
    <>
      {providedStore() == store ? 'Store ' : ''}
      {providedMetrics() == metrics ? 'Metrics ' : ''}
      {providedIndexes() == indexes ? 'Indexes ' : ''}
      {providedRelationships() == relationships ? 'Relationships ' : ''}
      {providedQueries() == queries ? 'Queries ' : ''}
      {providedCheckpoints() == checkpoints ? 'Checkpoints ' : ''}
      {providedPersister() == persister ? 'Persister ' : ''}
      {providedSynchronizer() == synchronizer ? 'Synchronizer' : ''}
    </>
  );
};

const ContextNestedDefaults = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}) => (
  <Provider
    store={store}
    metrics={metrics}
    indexes={indexes}
    relationships={relationships}
    queries={queries}
    checkpoints={checkpoints}
    persister={persister}
    synchronizer={synchronizer}
  >
    <Provider>
      <ContextNestedDefaultsChild
        store={store}
        metrics={metrics}
        indexes={indexes}
        relationships={relationships}
        queries={queries}
        checkpoints={checkpoints}
        persister={persister}
        synchronizer={synchronizer}
      />
    </Provider>
  </Provider>
);

const ContextNestedDefaultsChild = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}) => {
  const providedStore = useStore();
  const providedMetrics = useMetrics();
  const providedIndexes = useIndexes();
  const providedRelationships = useRelationships();
  const providedQueries = useQueries();
  const providedCheckpoints = useCheckpoints();
  const providedPersister = usePersister();
  const providedSynchronizer = useSynchronizer();
  return (
    <>
      {providedStore() == store ? 'Store ' : ''}
      {providedMetrics() == metrics ? 'Metrics ' : ''}
      {providedIndexes() == indexes ? 'Indexes ' : ''}
      {providedRelationships() == relationships ? 'Relationships ' : ''}
      {providedQueries() == queries ? 'Queries ' : ''}
      {providedCheckpoints() == checkpoints ? 'Checkpoints ' : ''}
      {providedPersister() == persister ? 'Persister ' : ''}
      {providedSynchronizer() == synchronizer ? 'Synchronizer' : ''}
    </>
  );
};

testProviderComponents('ui-solid', componentHarness, {
  Nested: ContextNested,
  NestedDifferent: ContextNestedDifferent,
  ProvideThings: ContextProvideThings,
  NestedDefaults: ContextNestedDefaults,
});

const UndefinedContextChildren = ({store}: {readonly store: Store}) => {
  useProvideStore('store1', store);
  return (
    <>
      {useStore()() ? 1 : 0}
      {JSON.stringify(useStoreIds()())}
      {JSON.stringify(useStores()())}
    </>
  );
};

const DuplicateProvidedStore = ({store}: {readonly store: Store}) => {
  useProvideStore('store1', store);
  return '';
};

test('covers context fallbacks and duplicate providers', async () => {
  const store = createStore();
  const container = document.createElement('div');
  const Context = (
    globalThis as unknown as {
      readonly tinybase_uisc: any;
    }
  ).tinybase_uisc;

  const unmount = solidRender(
    () => (
      <Context.Provider value={{value: undefined}}>
        <UndefinedContextChildren store={store} />
        <Provider>
          <DuplicateProvidedStore store={store} />
          <DuplicateProvidedStore store={store} />
        </Provider>
      </Context.Provider>
    ),
    container,
  );

  await pause();
  expect(container.innerHTML).toBe('0[]{}');

  unmount();
});
