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
import {
  createCheckpoints,
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
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
  useSynchronizer,
  ValuesView,
  ValueView,
} from 'tinybase/ui-solid';
import * as UiSolid from 'tinybase/ui-solid/with-schemas';
import type {NoSchemas} from 'tinybase/with-schemas';
import {createStore as createStore2} from 'tinybase/with-schemas';
import {beforeEach, describe, expect, test} from 'vitest';
import {pause} from '../../common/other.ts';
import {testComponents, testCustomComponents} from '../ui-common/components.ts';

const {Provider: Provider2, useStore: useStore2} =
  UiSolid as UiSolid.WithSchemas<NoSchemas>;

let store: Store;
const sep = '/';
type Props = {[key: string]: unknown};

const createTestPersister = () => ({}) as unknown as AnyPersister;
const createTestSynchronizer = () => ({}) as unknown as Synchronizer;

const renderSolid = (view: () => JSXElement) => {
  const container = document.createElement('div');
  const unmount = solidRender(view, container);
  return {container, unmount};
};

const render = <Props extends object>(
  Component: (props: Props) => JSXElement,
  options: {props: Props},
) => {
  let props = options.props;
  const container = document.createElement('div');
  let unmount = solidRender(() => <Component {...props} />, container);
  const rerender = async (
    nextProps: Partial<Props> & {[key: string]: unknown},
  ) => {
    unmount();
    props = {...props, ...nextProps};
    unmount = solidRender(() => <Component {...props} />, container);
    await pause();
  };
  return {container, rerender, unmount: () => unmount()};
};

const act = async (cb: () => unknown) => {
  cb();
  await pause();
};

const expectText = async (
  container: HTMLElement,
  textContent: string,
): Promise<void> => {
  await pause();
  expect(container.textContent).toEqual(textContent);
};

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

describe('Specific', () => {
  beforeEach(() => {
    store = createStore()
      .setTables({
        t1: {r1: {c1: 1}},
        t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
      })
      .setValues({v1: 3, v2: 4});
  });

  describe('Read Components', () => {
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

    const TestTableView = (
      props: TableProps & {readonly cellPrefix?: string},
    ) => (
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

    const TestCellView = (
      props: CellProps & {readonly cellPrefix?: string},
    ) => (
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

    const TestValueView = (
      props: ValueProps & {readonly valuePrefix?: string},
    ) => (
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

    const TestIndexView = (
      props: IndexProps & {readonly cellPrefix?: string},
    ) => (
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

    const TestSliceView = (
      props: SliceProps & {readonly cellPrefix?: string},
    ) => (
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
    });
    describe('context provider', () => {
      test('merges nested stores from the same provider', async () => {
        const store1 = createStore();
        const store2 = createStore();
        const Test = () => {
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
        const rendered = renderSolid(() => (
          <Provider storesById={{a: store1}}>
            <Provider storesById={{b: store2}}>
              <Test />
            </Provider>
          </Provider>
        ));

        await expectText(rendered.container, '["a","b"]1001');

        rendered.unmount();
      });

      test('merges nested stores from different providers', async () => {
        const store1 = createStore();
        const store2 = createStore2();
        const Test = () => {
          const storeIds = useStoreIds();
          const storeA = useStore('a');
          const store2A = useStore2('a');
          const storeB = useStore('b');
          const store2B = useStore2('b');
          return (
            <>
              {JSON.stringify(storeIds())}
              {storeA() == store1 ? 1 : 0}
              {store2A() == store2 ? 1 : 0}
              {storeB() == store1 ? 1 : 0}
              {store2B() == store2 ? 1 : 0}
            </>
          );
        };
        const rendered = renderSolid(() => (
          <Provider storesById={{a: store1}}>
            <Provider2 storesById={{b: store2}}>
              <Test />
            </Provider2>
          </Provider>
        ));

        await expectText(rendered.container, '["a","b"]1001');

        rendered.unmount();
      });

      test('supports provideXxx primitives', async () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister = createTestPersister();
        const synchronizer = createTestSynchronizer();

        const ProvidedThings = () => {
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
              {providedStore() == store ? 's' : ''}
              {providedMetrics() == metrics ? 'm' : ''}
              {providedIndexes() == indexes ? 'i' : ''}
              {providedRelationships() == relationships ? 'r' : ''}
              {providedQueries() == queries ? 'q' : ''}
              {providedCheckpoints() == checkpoints ? 'c' : ''}
              {providedPersister() == persister ? 'p' : ''}
              {providedSynchronizer() == synchronizer ? 'z' : ''}
            </>
          );
        };
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
        const rendered = renderSolid(() => (
          <Provider>
            <ProvideThings />
          </Provider>
        ));

        await expectText(rendered.container, 'smirqcpz');

        rendered.unmount();
      });

      test('uses parent context fallbacks for nested defaults', async () => {
        const metrics: Metrics = createMetrics(store);
        const indexes: Indexes = createIndexes(store);
        const relationships: Relationships = createRelationships(store);
        const queries: Queries = createQueries(store);
        const checkpoints: Checkpoints = createCheckpoints(store);
        const persister = createTestPersister();
        const synchronizer = createTestSynchronizer();

        const Test = () => {
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
              {providedStore() == store ? 's' : ''}
              {providedMetrics() == metrics ? 'm' : ''}
              {providedIndexes() == indexes ? 'i' : ''}
              {providedRelationships() == relationships ? 'r' : ''}
              {providedQueries() == queries ? 'q' : ''}
              {providedCheckpoints() == checkpoints ? 'c' : ''}
              {providedPersister() == persister ? 'p' : ''}
              {providedSynchronizer() == synchronizer ? 'z' : ''}
            </>
          );
        };
        const rendered = renderSolid(() => (
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
              <Test />
            </Provider>
          </Provider>
        ));

        await expectText(rendered.container, 'smirqcpz');

        rendered.unmount();
      });
    });
  });
});
