/* eslint-disable react/jsx-no-useless-fragment */
import '@testing-library/jest-dom/vitest';
import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import {act, createElement, useCallback} from 'react';
import type {
  Checkpoints,
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
} from 'tinybase/ui-react';
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
  TableView,
  TablesView,
  ValueView,
  ValuesView,
  useCell,
  useCheckpointIds,
  useCheckpoints,
  useIndexes,
  useLinkedRowIds,
  useLocalRowIds,
  useMetric,
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
  useRemoteRowId,
  useResultCell,
  useResultCellIds,
  useResultRow,
  useResultRowIds,
  useResultTable,
  useRow,
  useSliceIds,
  useSliceRowIds,
  useStore,
  useStoreIds,
  useSynchronizer,
  useTable,
  useTables,
} from 'tinybase/ui-react';
import * as UiReact from 'tinybase/ui-react/with-schemas';
import type {NoSchemas, Store as StoreWithSchemas} from 'tinybase/with-schemas';
import {expect, test} from 'vitest';
import {
  testComponents,
  testCustomCheckpointComponents,
  testCustomComponents,
  testProviderComponents,
} from '../ui-common/components.ts';

const {Provider: Provider2, useStore: useStore2} =
  UiReact as UiReact.WithSchemas<NoSchemas>;
type NoSchemasStore = StoreWithSchemas<NoSchemas>;
const asNoSchemasStore = (store: Store) => store as unknown as NoSchemasStore;

type Props = {[key: string]: unknown};

const componentHarness = {
  separator: '/',
  act: async (callback: () => unknown) => {
    await act(async () => {
      callback();
    });
  },
  render: (component: unknown, props: Props) => {
    const Component = component as ComponentType<Props>;
    let currentProps = props;
    const rendered = render(createElement(Component, currentProps));
    return {
      container: rendered.container,
      rerender: async (nextProps: Props) => {
        currentProps = {...currentProps, ...nextProps};
        await act(async () => {
          rendered.rerender(createElement(Component, currentProps));
        });
      },
      unmount: rendered.unmount,
    };
  },
};

const TestIndexView = (props: IndexProps & {readonly cellPrefix?: string}) => (
  <>
    {props.indexId}:
    <IndexView
      {...props}
      sliceComponent={TestSliceView}
      getSliceComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
    />
  </>
);

const TestSliceView = (props: SliceProps & {readonly cellPrefix?: string}) => (
  <>
    {props.sliceId}:
    <SliceView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getResultRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getResultRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getResultCellComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
    {/* @ts-ignore */}
    <CheckpointView {...props} />
  </>
);

const TestTablesView = (
  props: TablesProps & {readonly cellPrefix?: string},
) => (
  <TablesView
    {...props}
    tableComponent={TestTableView}
    getTableComponentProps={useCallback(
      () => ({cellPrefix: props.cellPrefix}),
      [props.cellPrefix],
    )}
  />
);

const TestTableView = (props: TableProps & {readonly cellPrefix?: string}) => (
  <>
    {props.tableId}:
    <TableView
      {...props}
      rowComponent={TestRowView}
      getRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
      getRowComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
    />
  </>
);

const TestRowView = (props: RowProps & {readonly cellPrefix?: string}) => (
  <>
    {props.rowId}:
    <RowView
      {...props}
      cellComponent={TestCellView}
      getCellComponentProps={useCallback(
        () => ({cellPrefix: props.cellPrefix}),
        [props.cellPrefix],
      )}
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
    getValueComponentProps={useCallback(
      () => ({valuePrefix: props.valuePrefix}),
      [props.valuePrefix],
    )}
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

const customComponents = {
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
};

const TestCurrentCheckpointView = (props: BackwardCheckpointsProps) => (
  <CurrentCheckpointView
    {...props}
    checkpointComponent={({checkpointId}) => <>current:{checkpointId}</>}
  />
);

testComponents('ui-react', componentHarness, {
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

testCustomComponents('ui-react', componentHarness, customComponents);

testCustomCheckpointComponents('ui-react', componentHarness, {
  CheckpointsView: TestAllCheckpointsView,
  CurrentCheckpointView: TestCurrentCheckpointView,
});

const ContextStoreChild = ({
  storeId,
  mode,
}: {
  readonly storeId?: string;
  readonly mode: string;
}) =>
  mode == 'tables' ? (
    <ContextTablesChild storeId={storeId} />
  ) : mode == 'table' ? (
    <ContextTableChild storeId={storeId} />
  ) : mode == 'row' ? (
    <ContextRowChild storeId={storeId} />
  ) : (
    <ContextCellChild storeId={storeId} />
  );

const ContextTablesChild = ({storeId}: {readonly storeId?: string}) => (
  <>
    <span>
      <TablesView store={storeId} />
    </span>
    <span>{JSON.stringify(useTables(storeId))}</span>
  </>
);

const ContextTableChild = ({storeId}: {readonly storeId?: string}) => (
  <>
    <span>
      <TableView store={storeId} tableId="t1" />
    </span>
    <span>{JSON.stringify(useTable('t1', storeId))}</span>
  </>
);

const ContextRowChild = ({storeId}: {readonly storeId?: string}) => (
  <>
    <span>
      <RowView store={storeId} tableId="t1" rowId="r1" />
    </span>
    <span>{JSON.stringify(useRow('t1', 'r1', storeId))}</span>
  </>
);

const ContextCellChild = ({storeId}: {readonly storeId?: string}) => (
  <>
    <span>
      <CellView store={storeId} tableId="t1" rowId="r1" cellId="c1" />
    </span>
    <span>{JSON.stringify(useCell('t1', 'r1', 'c1', storeId))}</span>
  </>
);

const ContextStore = ({
  store,
  storesById,
  storeId,
  mode,
}: {
  readonly store?: Store;
  readonly storesById?: {[storeId: string]: Store};
  readonly storeId?: string;
  readonly mode: string;
}) => (
  <Provider store={store} storesById={storesById}>
    <ContextStoreChild storeId={storeId} mode={mode} />
  </Provider>
);

const ContextMetrics = ({
  metrics,
  metricsById,
  metricsId,
}: {
  readonly metrics?: Metrics;
  readonly metricsById?: {[metricsId: string]: Metrics};
  readonly metricsId?: string;
}) => (
  <Provider metrics={metrics} metricsById={metricsById}>
    <ContextMetricsChild metricsId={metricsId} />
  </Provider>
);

const ContextMetricsChild = ({metricsId}: {readonly metricsId?: string}) => (
  <>
    <MetricView metrics={metricsId} metricId="m1" />
    {useMetric('m1', metricsId)}
  </>
);

const ContextIndexes = ({
  indexes,
  indexesById,
  indexesId,
}: {
  readonly indexes?: Indexes;
  readonly indexesById?: {[indexesId: string]: Indexes};
  readonly indexesId?: string;
}) => (
  <Provider indexes={indexes} indexesById={indexesById}>
    <ContextIndexesChild indexesId={indexesId} />
  </Provider>
);

const ContextIndexesChild = ({indexesId}: {readonly indexesId?: string}) => (
  <>
    <IndexView indexes={indexesId} indexId="i1" />
    {JSON.stringify(useSliceIds('i1', indexesId))}
    <SliceView indexes={indexesId} indexId="i1" sliceId="1" />
    {JSON.stringify(useSliceRowIds('i1', '1', indexesId))}
  </>
);

const ContextRelationships = ({
  relationships,
  relationshipsById,
  relationshipsId,
}: {
  readonly relationships?: Relationships;
  readonly relationshipsById?: {[relationshipsId: string]: Relationships};
  readonly relationshipsId?: string;
}) => (
  <Provider relationships={relationships} relationshipsById={relationshipsById}>
    <ContextRelationshipsChild relationshipsId={relationshipsId} />
  </Provider>
);

const ContextRelationshipsChild = ({
  relationshipsId,
}: {
  readonly relationshipsId?: string;
}) => (
  <>
    <RemoteRowView
      relationships={relationshipsId}
      relationshipId="r1"
      localRowId="r1"
    />
    {JSON.stringify(useRemoteRowId('r1', 'r1', relationshipsId))}
    <LocalRowsView
      relationships={relationshipsId}
      relationshipId="r1"
      remoteRowId="R1"
    />
    {JSON.stringify(useLocalRowIds('r1', 'R1', relationshipsId))}
    <LinkedRowsView
      relationships={relationshipsId}
      relationshipId="r1"
      firstRowId="r1"
    />
    {JSON.stringify(useLinkedRowIds('r1', 'r1', relationshipsId))}
  </>
);

const ContextQueries = ({
  queries,
  queriesById,
  queriesId,
}: {
  readonly queries?: Queries;
  readonly queriesById?: {[queriesId: string]: Queries};
  readonly queriesId?: string;
}) => (
  <Provider queries={queries} queriesById={queriesById}>
    <ContextQueriesChild queriesId={queriesId} />
  </Provider>
);

const ContextQueriesChild = ({queriesId}: {readonly queriesId?: string}) => (
  <>
    <ResultTableView queries={queriesId} queryId="q1" />
    {JSON.stringify(useResultTable('q1', queriesId))}
    {JSON.stringify(useResultRowIds('q1', queriesId))}
    <ResultRowView queries={queriesId} queryId="q1" rowId="r1" />
    {JSON.stringify(useResultRow('q1', 'r1', queriesId))}
    {JSON.stringify(useResultCellIds('q1', 'r1', queriesId))}
    <ResultCellView queries={queriesId} queryId="q1" rowId="r1" cellId="c1" />
    {JSON.stringify(useResultCell('q1', 'r1', 'c1', queriesId))}
  </>
);

const ContextCheckpoints = ({
  checkpoints,
  checkpointsById,
  checkpointsId,
}: {
  readonly checkpoints?: Checkpoints;
  readonly checkpointsById?: {[checkpointsId: string]: Checkpoints};
  readonly checkpointsId?: string;
}) => (
  <Provider checkpoints={checkpoints} checkpointsById={checkpointsById}>
    <ContextCheckpointsChild checkpointsId={checkpointsId} />
  </Provider>
);

const ContextCheckpointsChild = ({
  checkpointsId,
}: {
  readonly checkpointsId?: string;
}) => <>{JSON.stringify(useCheckpointIds(checkpointsId))}</>;

const ContextPersister = ({
  persister,
  persistersById,
  persisterId,
}: {
  readonly persister?: AnyPersister;
  readonly persistersById?: {[persisterId: string]: AnyPersister};
  readonly persisterId?: string;
}) => (
  <Provider persister={persister} persistersById={persistersById}>
    <ContextPersisterChild persisterId={persisterId} />
  </Provider>
);

const ContextPersisterChild = ({
  persisterId,
}: {
  readonly persisterId?: string;
}) => <>{usePersister(persisterId)?.getStatus()}</>;

const ContextSynchronizer = ({
  synchronizer,
  synchronizersById,
  synchronizerId,
}: {
  readonly synchronizer?: Synchronizer;
  readonly synchronizersById?: {[synchronizerId: string]: Synchronizer};
  readonly synchronizerId?: string;
}) => (
  <Provider synchronizer={synchronizer} synchronizersById={synchronizersById}>
    <ContextSynchronizerChild synchronizerId={synchronizerId} />
  </Provider>
);

const ContextSynchronizerChild = ({
  synchronizerId,
}: {
  readonly synchronizerId?: string;
}) => <>{useSynchronizer(synchronizerId)?.getStatus()}</>;

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
}) => (
  <>
    {JSON.stringify(useStoreIds())}
    {useStore('a') == store1 ? 1 : 0}
    {useStore('a') == store2 ? 1 : 0}
    {useStore('b') == store1 ? 1 : 0}
    {useStore('b') == store2 ? 1 : 0}
  </>
);

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
}) => (
  <>
    {JSON.stringify(useStoreIds())}
    {useStore('a') == store1 ? 1 : 0}
    {useStore2('a') == asNoSchemasStore(store2) ? 1 : 0}
    {useStore('b') == store1 ? 1 : 0}
    {useStore2('b') == asNoSchemasStore(store2) ? 1 : 0}
  </>
);

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
}) => {
  const ProvideThings = () => {
    useProvideStore('store1', store);
    useProvideMetrics('metrics1', metrics);
    useProvideIndexes('indexes1', indexes);
    useProvideRelationships('relationships1', relationships);
    useProvideQueries('queries1', queries);
    useProvideCheckpoints('checkpoints1', checkpoints);
    useProvidePersister('persister1', persister);
    useProvideSynchronizer('synchronizer1', synchronizer);
    return <ProvidedThings />;
  };
  const ProvidedThings = () => (
    <>
      {useStore('store1') == store ? 'Store ' : ''}
      {useMetrics('metrics1') == metrics ? 'Metrics ' : ''}
      {useIndexes('indexes1') == indexes ? 'Indexes ' : ''}
      {useRelationships('relationships1') == relationships
        ? 'Relationships '
        : ''}
      {useQueries('queries1') == queries ? 'Queries ' : ''}
      {useCheckpoints('checkpoints1') == checkpoints ? 'Checkpoints ' : ''}
      {usePersister('persister1') == persister ? 'Persister ' : ''}
      {useSynchronizer('synchronizer1') == synchronizer ? 'Synchronizer' : ''}
    </>
  );
  return (
    <Provider>
      <ProvideThings />
    </Provider>
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
}) => (
  <>
    {useStore() == store ? 'Store ' : ''}
    {useMetrics() == metrics ? 'Metrics ' : ''}
    {useIndexes() == indexes ? 'Indexes ' : ''}
    {useRelationships() == relationships ? 'Relationships ' : ''}
    {useQueries() == queries ? 'Queries ' : ''}
    {useCheckpoints() == checkpoints ? 'Checkpoints ' : ''}
    {usePersister() == persister ? 'Persister ' : ''}
    {useSynchronizer() == synchronizer ? 'Synchronizer' : ''}
  </>
);

testProviderComponents('ui-react', componentHarness, {
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
  ProvideThings: ContextProvideThings,
  NestedDefaults: ContextNestedDefaults,
});

const DuplicateProvidedStore = ({store}: {readonly store: Store}) => {
  useProvideStore('store1', store);
  return null;
};

const DuplicateProvidedStoreReader = ({
  store1,
  store2,
}: {
  readonly store1: Store;
  readonly store2: Store;
}) => {
  const store = useStore('store1');
  return <>{store == store1 ? 1 : store == store2 ? 2 : 0}</>;
};

const DuplicateProvidedStores = ({
  show1,
  show2,
  store1,
  store2,
}: {
  readonly show1: boolean;
  readonly show2: boolean;
  readonly store1: Store;
  readonly store2: Store;
}) => (
  <Provider>
    {show1 ? <DuplicateProvidedStore store={store1} /> : null}
    {show2 ? <DuplicateProvidedStore store={store2} /> : null}
    <DuplicateProvidedStoreReader store1={store1} store2={store2} />
  </Provider>
);

test('duplicate provider registrations retain ownership', async () => {
  const store1 = createStore();
  const store2 = createStore();
  const {container, rerender, unmount} = componentHarness.render(
    DuplicateProvidedStores,
    {show1: true, show2: true, store1, store2},
  );
  expect(container.textContent).toBe('2');

  await rerender({show2: false});
  expect(container.textContent).toBe('1');
  await rerender({show2: true});
  expect(container.textContent).toBe('2');
  await rerender({show1: false});
  expect(container.textContent).toBe('2');

  unmount();
});
